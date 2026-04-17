import { useSound, type SoundMode } from '../audio/SoundContext'

const ICONS: Record<SoundMode, string> = { muted: '🔇', effects: '🔊', full: '🎵' }
const NEXT: Record<SoundMode, SoundMode> = { muted: 'effects', effects: 'full', full: 'muted' }
const LABELS: Record<SoundMode, string> = { muted: '소리 끔', effects: '효과음만', full: '전체 소리' }

export function SoundToggle() {
  const { mode, setMode } = useSound()
  return (
    <button
      className="sound-toggle"
      onClick={() => setMode(NEXT[mode])}
      aria-label={LABELS[mode]}
      title={LABELS[mode]}
    >
      {ICONS[mode]}
    </button>
  )
}
