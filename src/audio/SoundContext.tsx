import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { playSound, createAmbientNoise, type SoundName } from './synth'

export type SoundMode = 'muted' | 'effects' | 'full'

interface SoundAPI {
  mode: SoundMode
  setMode: (mode: SoundMode) => void
  play: (name: SoundName) => void
}

const STORAGE_KEY = 'dev-open-book-sound'
const SoundContext = createContext<SoundAPI | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SoundMode>(() => {
    try { return (localStorage.getItem(STORAGE_KEY) as SoundMode) || 'muted' }
    catch { return 'muted' }
  })
  const ambientRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const setMode = useCallback((m: SoundMode) => {
    setModeState(m)
    localStorage.setItem(STORAGE_KEY, m)
  }, [])

  const play = useCallback((name: SoundName) => {
    if (mode === 'muted') return
    playSound(name)
  }, [mode])

  // Ambient management
  useEffect(() => {
    if (mode === 'full') {
      // Try MP3 first, fallback to synthesized
      if (!audioRef.current) {
        const audio = new Audio(import.meta.env.BASE_URL + 'audio/ambient-library.mp3')
        audio.loop = true
        audio.volume = 0.15
        audioRef.current = audio
      }
      audioRef.current.play().catch(() => {
        // MP3 failed, use synthesized ambient
        if (!ambientRef.current) {
          const ctx = new AudioContext()
          ambientRef.current = createAmbientNoise(ctx)
        }
        ambientRef.current.source.start()
      })
    } else {
      audioRef.current?.pause()
      // Can't stop/restart AudioBufferSourceNode easily, just let it be
    }
  }, [mode])

  // Pause on visibility change
  useEffect(() => {
    const handler = () => {
      if (document.hidden) audioRef.current?.pause()
      else if (mode === 'full') audioRef.current?.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [mode])

  return (
    <SoundContext.Provider value={{ mode, setMode, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound(): SoundAPI {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
