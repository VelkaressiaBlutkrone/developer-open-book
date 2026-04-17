import type { DialogueOption } from '../data/npcs'

interface Props {
  mode: 'select' | 'dialogue'
  // select mode props
  hasApiKey?: boolean
  onSelectQuest?: () => void
  onSelectAI?: () => void
  // dialogue mode props
  text?: string
  options?: DialogueOption[]
  onSelect?: (nextId: string) => void
  // common
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
              className={`speech-bubble-option${!hasApiKey ? ' locked' : ''}`}
              onClick={hasApiKey ? onSelectAI : undefined}
              title={!hasApiKey ? '설정에서 API 키를 입력하세요' : undefined}
            >
              {hasApiKey ? '💬' : '🔒'} 질문하기
            </button>
          </div>
        )}
        {mode === 'dialogue' && (
          <>
            <div className="speech-bubble-text">{text}</div>
            {options && options.length > 0 ? (
              <div className="speech-bubble-options">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    className="speech-bubble-option"
                    onClick={() => onSelect?.(opt.next)}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <button className="speech-bubble-close" onClick={onClose}>
                닫기
              </button>
            )}
          </>
        )}
        <div className="speech-bubble-tail" />
      </div>
    </>
  )
}
