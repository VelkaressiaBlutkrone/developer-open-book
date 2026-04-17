import type { DialogueOption } from '../data/npcs'

interface Props {
  text: string
  options?: DialogueOption[]
  onSelect: (nextId: string) => void
  onClose: () => void
}

export function SpeechBubble({ text, options, onSelect, onClose }: Props) {
  return (
    <>
      <div className="speech-bubble-backdrop" onClick={onClose} />
      <div className="speech-bubble">
        <div className="speech-bubble-text">{text}</div>
        {options && options.length > 0 ? (
          <div className="speech-bubble-options">
            {options.map((opt, i) => (
              <button
                key={i}
                className="speech-bubble-option"
                onClick={() => onSelect(opt.next)}
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
        <div className="speech-bubble-tail" />
      </div>
    </>
  )
}
