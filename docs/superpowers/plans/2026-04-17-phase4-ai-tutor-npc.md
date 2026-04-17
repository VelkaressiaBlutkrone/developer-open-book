# Phase 4: AI Tutor NPC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4명의 NPC에게 Claude AI 대화 능력을 부여하여, 사용자가 읽고 있는 책에 대해 RPG 스타일로 질문하고 답변받을 수 있게 한다.

**Architecture:** `src/ai/` 디렉토리에 Claude API 래퍼, NPC 페르소나, 컨텍스트 조립기를 분리. AIChat 오버레이 컴포넌트가 스트리밍 응답을 타이핑 효과로 렌더링. SpeechBubble에 모드 선택(퀘스트/질문)을 추가하여 기존 대화 시스템과 공존.

**Tech Stack:** React 19, TypeScript, @anthropic-ai/sdk, Web Streams API

**Spec:** `docs/superpowers/specs/2026-04-17-phase4-ai-tutor-npc-design.md`

---

## File Structure

### New Files
```
src/ai/claude.ts                    — Claude API 호출 + 스트리밍 래퍼
src/ai/personas.ts                  — NPC별 시스템 프롬프트 4개 + 공통 규칙
src/ai/context.ts                   — 컨텍스트 조립 (책 목록 + 마크다운 + 진행 상태)
src/ai/context.test.ts              — 컨텍스트 조립 테스트
src/components/AIChat.tsx           — AI 대화 오버레이 (초상화 + 타이핑 + 입력)
src/components/APIKeySettings.tsx   — API 키 입력 + 모델 선택 UI
```

### Modified Files
```
src/components/SpeechBubble.tsx     — mode prop 추가 (select/dialogue)
src/components/LibraryRoom.tsx      — 모드 선택 + AI 대화 오버레이 렌더링
src/components/ProgressIndicator.tsx — 설정 탭 추가
src/index.css                        — AI 대화 오버레이 + 설정 스타일
package.json                        — @anthropic-ai/sdk 의존성
```

---

## Task 1: @anthropic-ai/sdk 설치 + Claude API 래퍼

**Files:**
- Modify: `package.json`
- Create: `src/ai/claude.ts`

- [ ] **Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Create claude.ts**

Create `src/ai/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onText: (delta: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
}

export async function streamChat(
  apiKey: string,
  model: string,
  system: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> {
  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const stream = client.messages.stream({
      model,
      max_tokens: 1024,
      system,
      messages,
    })

    let fullText = ''
    stream.on('text', (delta) => {
      fullText += delta
      callbacks.onText(delta)
    })

    await stream.finalMessage()
    callbacks.onDone(fullText)
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    if (e.status === 401) {
      callbacks.onError('흠... 입장증이 올바르지 않은 것 같습니다. 설정을 확인해주세요.')
    } else if (e.status === 429) {
      callbacks.onError('잠시 쉬어가야 할 것 같습니다. 조금 후에 다시 물어봐주세요.')
    } else if (e.message?.includes('fetch')) {
      callbacks.onError('마법의 연결이 끊어진 것 같습니다. 다시 시도해주세요.')
    } else {
      callbacks.onError('지금은 대답하기 어려운 것 같습니다. 다시 시도해주세요.')
    }
  }
}

// localStorage helpers
const KEY_STORAGE = 'dev-open-book-api-key'
const MODEL_STORAGE = 'dev-open-book-model'
const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

export function getAPIKey(): string {
  try { return localStorage.getItem(KEY_STORAGE) || '' } catch { return '' }
}

export function setAPIKey(key: string): void {
  if (key) localStorage.setItem(KEY_STORAGE, key)
  else localStorage.removeItem(KEY_STORAGE)
}

export function getModel(): string {
  try { return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL } catch { return DEFAULT_MODEL }
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE, model)
}

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku (빠르고 저렴)' },
  { id: 'claude-sonnet-4-20250514', name: 'Sonnet (균형, 기본값)' },
  { id: 'claude-opus-4-20250514', name: 'Opus (최고 품질)' },
] as const
```

- [ ] **Step 3: Run build to verify**

Run: `npx tsc -b`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/ai/claude.ts
git commit -m "feat: Claude API 래퍼 — 스트리밍 + BYOK 키 관리"
```

---

## Task 2: NPC 페르소나 + 컨텍스트 조립

**Files:**
- Create: `src/ai/personas.ts`
- Create: `src/ai/context.ts`
- Create: `src/ai/context.test.ts`

- [ ] **Step 1: Write failing tests for context assembly**

Create `src/ai/context.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildBookList, buildProgressSummary, trimMarkdown } from './context'
import type { UserProgress } from '../store/progress'

function emptyState(): UserProgress {
  return {
    version: 3, books: {}, badges: [], streak: { current: 0, lastReadDate: '', longest: 0 },
    totals: { booksCompleted: 0, totalTimeMs: 0 }, quests: {}, unlockedRooms: ['main'],
  }
}

describe('buildBookList', () => {
  it('returns formatted list for dart category', () => {
    const state = emptyState()
    state.books['dart-01'] = { bookId: 'dart-01', lastReadAt: 0, scrollPosition: 1, completed: true, timeSpentMs: 0 }
    const list = buildBookList('dart', state)
    expect(list).toContain('Dart 개요 및 환경 구축')
    expect(list).toContain('✅')
  })

  it('returns all books for null category', () => {
    const list = buildBookList(null, emptyState())
    expect(list).toContain('Dart')
    expect(list).toContain('Flutter')
    expect(list).toContain('React')
  })
})

describe('buildProgressSummary', () => {
  it('includes completed count and streak', () => {
    const state = emptyState()
    state.totals.booksCompleted = 5
    state.streak.current = 3
    const summary = buildProgressSummary(state)
    expect(summary).toContain('5')
    expect(summary).toContain('3')
  })
})

describe('trimMarkdown', () => {
  it('trims to max length', () => {
    const long = 'a'.repeat(50000)
    const trimmed = trimMarkdown(long, 10000)
    expect(trimmed.length).toBeLessThanOrEqual(10000)
  })

  it('returns short content as-is', () => {
    expect(trimMarkdown('hello', 10000)).toBe('hello')
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/ai/context.test.ts`
Expected: FAIL

- [ ] **Step 3: Create personas.ts**

Create `src/ai/personas.ts`:

```typescript
export interface Persona {
  npcId: string
  name: string
  role: string
  expertise: string
  personality: string
  category: string | null
}

const COMMON_RULES = `
## 행동 규칙
1. 한국어로 답변한다.
2. 소크라테스식 힌트 모드: 직접 답 대신 질문으로 유도한다. 단, 사용자가 "직접 알려줘", "답을 알려줘"라고 하면 직접 제공한다.
3. 현재 읽고 있는 책의 맥락을 참고하여 답변한다.
4. RPG 도서관의 NPC로서 세계관에 맞는 말투를 사용한다.
5. 사용자의 진행 상태에 맞게 설명 깊이를 조절한다.
6. 답변은 간결하게. 300자 이내를 기본으로, 심화 요청 시 길게 답변한다.
`.trim()

const PERSONAS: Persona[] = [
  {
    npcId: 'librarian',
    name: '사서',
    role: '도서관의 수석 사서',
    expertise: '전체 프로그래밍 학습 가이드, 도서관 안내, 학습 로드맵 추천',
    personality: '친절하고 지혜로운 안내자. 적절한 비유를 잘 사용하며, 학습자의 수준에 맞춰 설명 깊이를 조절한다.',
    category: null,
  },
  {
    npcId: 'scholar',
    name: 'Dart 학자',
    role: 'Dart 언어 전문 학자',
    expertise: 'Dart 언어 문법, 비동기 프로그래밍, OOP, 컬렉션, 제네릭, 패턴 매칭',
    personality: '꼼꼼하고 학구적. 정확한 용어를 선호하며, 개념을 체계적으로 설명한다.',
    category: 'dart',
  },
  {
    npcId: 'visitor',
    name: 'Flutter 방문자',
    role: '여러 나라를 여행하며 앱을 만드는 Flutter 개발자',
    expertise: 'Flutter 위젯, 상태관리, 레이아웃, 네비게이션, Clean Architecture, 테스팅',
    personality: '활발하고 실전적. 예제 코드를 즐겨 사용하며, 실무 경험을 바탕으로 조언한다.',
    category: 'flutter',
  },
  {
    npcId: 'researcher',
    name: 'React 연구원',
    role: 'React 생태계 연구자',
    expertise: 'React Hook, Reconciliation, Server Components, Next.js, 상태관리, 성능 최적화',
    personality: '분석적이고 깊이 있는 연구자. 원리를 설명하는 것을 선호하며, 최신 패러다임을 잘 안다.',
    category: 'react',
  },
]

export function getPersona(npcId: string): Persona | undefined {
  return PERSONAS.find(p => p.npcId === npcId)
}

export function buildSystemPrompt(persona: Persona, bookList: string, progressSummary: string, currentBookContext: string): string {
  return `당신은 "${persona.name}"입니다. ${persona.role}입니다.

## 성격
${persona.personality}

## 전문 분야
${persona.expertise}

${COMMON_RULES}

## 도서관 서가 목록
${bookList}

## 사용자 진행 상태
${progressSummary}

## 현재 읽고 있는 책 내용
${currentBookContext || '(현재 읽고 있는 책 없음)'}
`
}
```

- [ ] **Step 4: Create context.ts**

Create `src/ai/context.ts`:

```typescript
import { BOOKS } from '../data/books'
import type { UserProgress } from '../store/progress'

export function buildBookList(category: string | null, state: UserProgress): string {
  const books = category ? BOOKS.filter(b => b.category === category) : BOOKS
  return books.map((b, i) => {
    const done = state.books[b.id]?.completed ? ' ✅' : ''
    return `${i + 1}. [${b.step}] ${b.title}${done}`
  }).join('\n')
}

export function buildProgressSummary(state: UserProgress): string {
  const total = BOOKS.length
  const completed = state.totals.booksCompleted
  const streak = state.streak.current
  const activeQuests = Object.entries(state.quests)
    .filter(([, s]) => s === 'active')
    .map(([id]) => id)
  return `완독: ${completed}/${total}권 | 스트릭: ${streak}일 | 활성 퀘스트: ${activeQuests.join(', ') || '없음'}${state.title ? ` | 칭호: ${state.title}` : ''}`
}

export function trimMarkdown(content: string, maxChars = 12000): string {
  if (content.length <= maxChars) return content
  return content.slice(0, maxChars) + '\n\n... (이하 생략)'
}

export async function fetchCurrentBookContent(bookId: string): Promise<string> {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) return ''
  try {
    const res = await fetch(book.contentFile)
    if (!res.ok) return ''
    const text = await res.text()
    return trimMarkdown(text)
  } catch {
    return ''
  }
}

export function getLastReadBookId(state: UserProgress): string | null {
  let latest: { id: string; time: number } | null = null
  for (const [id, entry] of Object.entries(state.books)) {
    if (!latest || entry.lastReadAt > latest.time) {
      latest = { id, time: entry.lastReadAt }
    }
  }
  return latest?.id ?? null
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npx vitest run src/ai/context.test.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/ai/personas.ts src/ai/context.ts src/ai/context.test.ts
git commit -m "feat: NPC 페르소나 4개 + 컨텍스트 조립 (책 목록/마크다운/진행 상태)"
```

---

## Task 3: APIKeySettings 컴포넌트

**Files:**
- Create: `src/components/APIKeySettings.tsx`
- Modify: `src/components/ProgressIndicator.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create APIKeySettings**

Create `src/components/APIKeySettings.tsx`:

```typescript
import { useState } from 'react'
import { getAPIKey, setAPIKey, getModel, setModel, MODELS } from '../ai/claude'

export function APIKeySettings() {
  const [key, setKey] = useState(getAPIKey())
  const [model, setModelState] = useState(getModel())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setAPIKey(key)
    setModel(model)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = () => {
    setAPIKey('')
    setKey('')
  }

  return (
    <div className="api-settings">
      <h4 className="progress-panel-subtitle">🔑 AI 튜터 설정</h4>

      <div className="api-settings-field">
        <label className="api-settings-label">Claude API 키</label>
        <div className="api-settings-row">
          <input
            type="password"
            className="api-settings-input"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
          />
          {key && (
            <button className="api-settings-delete" onClick={handleDelete} title="키 삭제">
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="api-settings-field">
        <label className="api-settings-label">모델</label>
        <div className="api-settings-models">
          {MODELS.map(m => (
            <label key={m.id} className="api-settings-model">
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={model === m.id}
                onChange={() => setModelState(m.id)}
              />
              <span>{m.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="api-settings-save" onClick={handleSave}>
        {saved ? '✅ 저장됨' : '저장'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add settings tab to ProgressIndicator**

In `src/components/ProgressIndicator.tsx`:

Import `APIKeySettings` and add `'settings'` to tab state type:

```typescript
import { APIKeySettings } from './APIKeySettings'

const [tab, setTab] = useState<'stats' | 'quests' | 'settings'>('stats')
```

Add third tab button:

```typescript
<button className={`progress-tab ${tab === 'settings' ? 'active' : ''}`}
  onClick={() => setTab('settings')}>
  ⚙️ 설정
</button>
```

Add settings tab content:

```typescript
{tab === 'settings' && <APIKeySettings />}
```

- [ ] **Step 3: Add CSS styles**

Add to `src/index.css`:

```css
/* API Key Settings */
.api-settings { padding-top: 4px; }
.api-settings-field { margin-bottom: 12px; }
.api-settings-label {
  display: block; font-size: 0.75rem; color: var(--text-muted);
  margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;
}
.api-settings-row { display: flex; gap: 6px; }
.api-settings-input {
  flex: 1; padding: 6px 10px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--bg-secondary);
  color: var(--text-primary); font-size: 0.8rem; font-family: monospace;
}
.api-settings-input:focus { border-color: var(--accent); outline: none; }
.api-settings-delete {
  background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 4px 8px; cursor: pointer; font-size: 0.9rem;
}
.api-settings-models { display: flex; flex-direction: column; gap: 6px; }
.api-settings-model {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: var(--text-secondary); cursor: pointer;
}
.api-settings-model input { accent-color: var(--accent); }
.api-settings-save {
  width: 100%; padding: 6px; border: 1px solid var(--accent);
  background: var(--accent-bg); color: var(--accent);
  border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem;
  transition: background 0.2s;
}
.api-settings-save:hover { background: rgba(184,134,11,0.15); }
```

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/APIKeySettings.tsx src/components/ProgressIndicator.tsx src/index.css
git commit -m "feat: API 키 설정 UI — 키 입력 + 모델 선택 (Haiku/Sonnet/Opus)"
```

---

## Task 4: AIChat 오버레이 컴포넌트

**Files:**
- Create: `src/components/AIChat.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create AIChat component**

Create `src/components/AIChat.tsx`:

```typescript
import { useState, useRef, useEffect, useCallback } from 'react'
import { streamChat, getAPIKey, getModel, type ChatMessage } from '../ai/claude'
import { getPersona, buildSystemPrompt } from '../ai/personas'
import { buildBookList, buildProgressSummary, fetchCurrentBookContent, getLastReadBookId } from '../ai/context'
import { useProgress } from '../store/ProgressContext'
import MarkdownRenderer from './MarkdownRenderer'
import type { NPC } from '../data/npcs'

const B = import.meta.env.BASE_URL

interface Props {
  npc: NPC
  onClose: () => void
}

export function AIChat({ npc, onClose }: Props) {
  const { state } = useProgress()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [messages, streamingText])

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const apiKey = getAPIKey()
    if (!apiKey) {
      setError('API 키가 설정되지 않았습니다. ⚙️ 설정에서 입력해주세요.')
      return
    }

    setInput('')
    setError(null)
    setStreaming(true)
    setStreamingText('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMsg].slice(-20) // max 10 turns
    setMessages(newMessages)

    // Build context
    const persona = getPersona(npc.id)
    if (!persona) return

    const bookList = buildBookList(persona.category, state)
    const progressSummary = buildProgressSummary(state)
    const lastBookId = getLastReadBookId(state)
    const bookContent = lastBookId ? await fetchCurrentBookContent(lastBookId) : ''
    const system = buildSystemPrompt(persona, bookList, progressSummary, bookContent)

    await streamChat(apiKey, getModel(), system, newMessages, {
      onText: (delta) => setStreamingText(prev => prev + delta),
      onDone: (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
        setStreamingText('')
        setStreaming(false)
      },
      onError: (errMsg) => {
        setError(errMsg)
        setStreamingText('')
        setStreaming(false)
      },
    })
  }, [input, streaming, messages, npc.id, state])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat-overlay" onClick={onClose}>
      <div className="ai-chat" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-chat-header">
          <img
            src={B + npc.sprite[npc.defaultDirection]}
            alt={npc.name}
            className="ai-chat-avatar"
          />
          <div className="ai-chat-header-info">
            <h2 className="ai-chat-npc-name">{npc.name}</h2>
            <span className="ai-chat-npc-role">
              {getPersona(npc.id)?.expertise.split(',')[0]}
            </span>
          </div>
          <button className="ai-chat-close" onClick={onClose}>&times;</button>
        </div>

        {/* Messages */}
        <div className="ai-chat-body" ref={bodyRef}>
          {/* Welcome message */}
          {messages.length === 0 && !streaming && (
            <div className="ai-chat-welcome">
              무엇이든 질문해주세요. 현재 읽고 있는 책을 바탕으로 답변해드리겠습니다.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-chat-msg ${msg.role}`}>
              <div className="ai-chat-msg-content">
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Streaming response */}
          {streaming && streamingText && (
            <div className="ai-chat-msg assistant">
              <div className="ai-chat-msg-content">
                <MarkdownRenderer content={streamingText} />
                <span className="ai-chat-cursor">▊</span>
              </div>
            </div>
          )}

          {streaming && !streamingText && (
            <div className="ai-chat-msg assistant">
              <div className="ai-chat-msg-content ai-chat-thinking">생각하는 중...</div>
            </div>
          )}

          {error && (
            <div className="ai-chat-error">{error}</div>
          )}
        </div>

        {/* Input */}
        <div className="ai-chat-input-area">
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요..."
            disabled={streaming}
          />
          <button
            className="ai-chat-send"
            onClick={handleSend}
            disabled={streaming || !input.trim()}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add CSS styles**

Add to `src/index.css`:

```css
/* ══════════════════════════════════════════
   AI CHAT OVERLAY
   ══════════════════════════════════════════ */
.ai-chat-overlay {
  position: fixed; inset: 0;
  background: rgba(10,7,4,0.88); backdrop-filter: blur(8px);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.3s ease;
}
.ai-chat {
  background: var(--bg-card, #faf6ec); color: var(--text-primary, #2c1810);
  border-radius: 12px; width: 90vw; max-width: 700px; height: 80vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7); animation: modalAppear 0.4s cubic-bezier(0.16,1,0.3,1);
  overflow: hidden;
}
.ai-chat-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}
.ai-chat-avatar {
  width: 48px; height: 48px; image-rendering: pixelated;
  border: 2px solid var(--accent); border-radius: 4px;
}
.ai-chat-header-info { flex: 1; }
.ai-chat-npc-name {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1rem; color: var(--accent); letter-spacing: 0.03em;
}
.ai-chat-npc-role { font-size: 0.75rem; color: var(--text-muted); }
.ai-chat-close {
  background: none; border: none; font-size: 1.8rem;
  color: var(--text-muted); cursor: pointer; padding: 0 8px;
}
.ai-chat-close:hover { color: var(--accent); }
.ai-chat-body {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
}
.ai-chat-welcome {
  text-align: center; padding: 40px 20px;
  color: var(--text-muted); font-family: 'Georgia', serif; font-style: italic;
}
.ai-chat-msg { max-width: 85%; }
.ai-chat-msg.user { align-self: flex-end; }
.ai-chat-msg.assistant { align-self: flex-start; }
.ai-chat-msg-content {
  padding: 10px 14px; border-radius: 10px;
  font-size: 0.88rem; line-height: 1.6;
}
.ai-chat-msg.user .ai-chat-msg-content {
  background: var(--accent-bg); border: 1px solid rgba(184,134,11,0.2);
  color: var(--text-primary);
}
.ai-chat-msg.assistant .ai-chat-msg-content {
  background: var(--bg-secondary); border: 1px solid var(--border-subtle);
}
.ai-chat-cursor {
  display: inline-block; animation: blink 0.8s step-end infinite;
  color: var(--accent); margin-left: 2px;
}
@keyframes blink { 50% { opacity: 0; } }
.ai-chat-thinking {
  color: var(--text-muted); font-style: italic;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
.ai-chat-error {
  padding: 10px 14px; background: rgba(220,60,60,0.1);
  border: 1px solid rgba(220,60,60,0.2); border-radius: 8px;
  color: #e05555; font-size: 0.82rem;
}
.ai-chat-input-area {
  display: flex; gap: 8px; padding: 12px 20px;
  border-top: 1px solid var(--border); background: var(--bg-secondary);
}
.ai-chat-input {
  flex: 1; padding: 8px 12px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--bg-primary);
  color: var(--text-primary); font-size: 0.85rem;
}
.ai-chat-input:focus { border-color: var(--accent); outline: none; }
.ai-chat-send {
  padding: 8px 16px; background: var(--accent); color: white;
  border: none; border-radius: var(--radius-sm); cursor: pointer;
  font-size: 0.82rem; font-weight: 600; transition: background 0.2s;
}
.ai-chat-send:hover { background: var(--accent-hover); }
.ai-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 768px) {
  .ai-chat { width: 96vw; height: 92vh; border-radius: 8px; }
}
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/AIChat.tsx src/index.css
git commit -m "feat: AIChat 오버레이 — NPC 초상화 + 타이핑 + 스트리밍 대화"
```

---

## Task 5: SpeechBubble 모드 전환 + LibraryRoom 통합

**Files:**
- Modify: `src/components/SpeechBubble.tsx`
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Add mode select to SpeechBubble**

Rewrite `src/components/SpeechBubble.tsx`:

```typescript
import type { DialogueOption } from '../data/npcs'

interface Props {
  mode: 'select' | 'dialogue'
  // select mode
  hasApiKey?: boolean
  onSelectQuest?: () => void
  onSelectAI?: () => void
  // dialogue mode
  text?: string
  options?: DialogueOption[]
  onSelect?: (nextId: string) => void
  onClose: () => void
}

export function SpeechBubble({ mode, hasApiKey, onSelectQuest, onSelectAI, text, options, onSelect, onClose }: Props) {
  return (
    <>
      <div className="speech-bubble-backdrop" onClick={onClose} />
      <div className="speech-bubble">
        {mode === 'select' && (
          <div className="speech-bubble-options">
            <button className="speech-bubble-option" onClick={onSelectQuest}>
              📜 퀘스트
            </button>
            <button
              className={`speech-bubble-option ${!hasApiKey ? 'locked' : ''}`}
              onClick={() => hasApiKey ? onSelectAI?.() : undefined}
              title={hasApiKey ? '' : '설정에서 API 키를 입력하세요'}
            >
              💬 질문하기 {!hasApiKey && '🔒'}
            </button>
          </div>
        )}

        {mode === 'dialogue' && (
          <>
            <div className="speech-bubble-text">{text}</div>
            {options && options.length > 0 ? (
              <div className="speech-bubble-options">
                {options.map((opt, i) => (
                  <button key={i} className="speech-bubble-option"
                    onClick={() => onSelect?.(opt.next)}>
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <button className="speech-bubble-close" onClick={onClose}>닫기</button>
            )}
          </>
        )}

        <div className="speech-bubble-tail" />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Update LibraryRoom for mode switching**

In `src/components/LibraryRoom.tsx`:

Import AIChat and getAPIKey:

```typescript
import { AIChat } from './AIChat'
import { getAPIKey } from '../ai/claude'
```

Add state:

```typescript
const [npcMode, setNpcMode] = useState<'select' | 'quest' | null>(null)
const [aiChatNPC, setAiChatNPC] = useState<NPC | null>(null)
```

Change `handleNPCClick` to show mode selection first:

```typescript
const handleNPCClick = useCallback((npc: NPC) => {
  play('npcTalk')
  setActiveNPC(npc)
  setNpcMode('select')
  setDialogueNode(null)
}, [play])
```

Add handlers for mode selection:

```typescript
const handleSelectQuest = useCallback(() => {
  if (!activeNPC) return
  setNpcMode('quest')
  const node = findDialogueNode(activeNPC, state)
  if (node) setDialogueNode(node)
}, [activeNPC, state])

const handleSelectAI = useCallback(() => {
  if (!activeNPC) return
  setAiChatNPC(activeNPC)
  closeDialogue()
}, [activeNPC, closeDialogue])
```

Update SpeechBubble rendering in each NPC block to use mode:

```typescript
{activeNPC?.id === npc.id && npcMode === 'select' && (
  <SpeechBubble mode="select" hasApiKey={!!getAPIKey()}
    onSelectQuest={handleSelectQuest} onSelectAI={handleSelectAI}
    onClose={closeDialogue} />
)}
{activeNPC?.id === npc.id && npcMode === 'quest' && dialogueNode && (
  <SpeechBubble mode="dialogue" text={dialogueNode.text}
    options={dialogueNode.options}
    onSelect={handleDialogueSelect} onClose={closeDialogue} />
)}
```

Render AIChat overlay:

```typescript
{aiChatNPC && (
  <AIChat npc={aiChatNPC} onClose={() => setAiChatNPC(null)} />
)}
```

- [ ] **Step 3: Add locked style to CSS**

```css
.speech-bubble-option.locked {
  opacity: 0.5; cursor: not-allowed;
}
```

- [ ] **Step 4: Run build + screenshot**

Run: `npm run build`
Take screenshot: click NPC → mode selection bubble

- [ ] **Step 5: Commit**

```bash
git add src/components/SpeechBubble.tsx src/components/LibraryRoom.tsx src/index.css
git commit -m "feat: NPC 모드 전환 (퀘스트/AI 질문) + AIChat 오버레이 통합"
```

---

## Task 6: 전체 통합 테스트 + 빌드 + QA

**Files:**
- All test files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Screenshot QA**

1. NPC 클릭 → 모드 선택 말풍선 (📜 퀘스트 / 💬 질문하기)
2. 퀘스트 선택 → 기존 대화 동작 확인
3. 질문하기 선택 (API 키 없이) → 🔒 표시
4. ProgressIndicator 설정 탭 → API 키 입력 UI
5. API 키 입력 후 → AI 대화 오버레이 열기 (실제 API 호출은 키 있을 때만)

- [ ] **Step 4: Update worklog**

```bash
git add docs/worklog.md
git commit -m "docs: Phase 4 AI Tutor NPC 완료 — v2 전체 로드맵 완료"
```

- [ ] **Step 5: Push + Deploy**

```bash
git push origin main
```
