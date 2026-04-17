import { useState, useRef, useEffect, useCallback } from 'react'
import type { NPC } from '../data/npcs'
import { useProgress } from '../store/ProgressContext'
import { getPersona, buildSystemPrompt } from '../ai/personas'
import { buildBookList, buildProgressSummary, fetchCurrentBookContent, getLastReadBookId } from '../ai/context'
import { streamChat, getAPIKey, getModel } from '../ai/claude'
import type { ChatMessage } from '../ai/claude'
import MarkdownRenderer from './MarkdownRenderer'

// ─── Props ───────────────────────────────────────────────────────────────────

interface AIChatProps {
  npc: NPC
  onClose: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AIChat({ npc, onClose }: AIChatProps) {
  const { state } = useProgress()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef(false)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    const el = bodyRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, streamingText, isThinking])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const apiKey = getAPIKey()
    if (!apiKey) {
      setErrorMsg('API 키가 설정되지 않았습니다. 설정 화면에서 Anthropic API 키를 입력해 주세요.')
      return
    }

    setErrorMsg(null)
    setInput('')

    // Build new message list (max 10 turns = 20 messages)
    const userMessage: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage].slice(-20)
    setMessages(newMessages)
    setIsThinking(true)
    setIsStreaming(true)
    abortRef.current = false

    // Build context
    const persona = getPersona(npc.role)
    if (!persona) {
      setErrorMsg('페르소나를 찾을 수 없습니다.')
      setIsThinking(false)
      setIsStreaming(false)
      return
    }

    const bookList = buildBookList(persona.category, state)
    const progressSummary = buildProgressSummary(state)
    const lastBookId = getLastReadBookId(state)
    const currentBookContent = lastBookId ? await fetchCurrentBookContent(lastBookId) : ''
    const systemPrompt = buildSystemPrompt(persona, bookList, progressSummary, currentBookContent)

    const model = getModel()
    let accumulated = ''

    await streamChat(
      apiKey,
      model,
      systemPrompt,
      newMessages,
      {
        onText: (delta) => {
          if (abortRef.current) return
          setIsThinking(false)
          accumulated += delta
          setStreamingText(accumulated)
        },
        onDone: (fullText) => {
          if (abortRef.current) return
          const assistantMessage: ChatMessage = { role: 'assistant', content: fullText }
          setMessages(prev => [...prev, assistantMessage].slice(-20))
          setStreamingText('')
          setIsThinking(false)
          setIsStreaming(false)
          accumulated = ''
          // Refocus input
          setTimeout(() => inputRef.current?.focus(), 50)
        },
        onError: (message) => {
          setErrorMsg(message)
          setStreamingText('')
          setIsThinking(false)
          setIsStreaming(false)
          accumulated = ''
        },
      }
    )
  }, [input, messages, isStreaming, npc, state])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const spriteUrl = import.meta.env.BASE_URL + npc.sprite[npc.defaultDirection]

  const persona = getPersona(npc.role)
  const expertise = persona?.expertise ?? ''

  const isEmpty = messages.length === 0 && !streamingText && !isThinking && !errorMsg

  return (
    <div className="ai-chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ai-chat" role="dialog" aria-label={`${npc.name}와 대화`}>

        {/* Header */}
        <div className="ai-chat-header">
          <img
            className="ai-chat-avatar"
            src={spriteUrl}
            alt={npc.name}
            width={48}
            height={48}
          />
          <div className="ai-chat-npc-info">
            <span className="ai-chat-npc-name">{npc.name}</span>
            <span className="ai-chat-npc-role">{expertise}</span>
          </div>
          <button className="ai-chat-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* Body */}
        <div className="ai-chat-body" ref={bodyRef}>
          {isEmpty && (
            <div className="ai-chat-welcome">
              <p>무엇이든 질문해주세요...</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-chat-msg ${msg.role}`}>
              {msg.role === 'assistant'
                ? <MarkdownRenderer content={msg.content} />
                : <span>{msg.content}</span>
              }
            </div>
          ))}

          {isThinking && !streamingText && (
            <div className="ai-chat-msg assistant ai-chat-thinking">
              생각하는 중...
            </div>
          )}

          {streamingText && (
            <div className="ai-chat-msg assistant">
              <MarkdownRenderer content={streamingText} />
              <span className="ai-chat-cursor">▊</span>
            </div>
          )}

          {errorMsg && (
            <div className="ai-chat-error">
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ai-chat-input-area">
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            rows={2}
            disabled={isStreaming}
          />
          <button
            className="ai-chat-send"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            aria-label="전송"
          >
            {isStreaming ? '⏳' : '전송'}
          </button>
        </div>
      </div>
    </div>
  )
}
