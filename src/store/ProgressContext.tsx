import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'
import {
  type UserProgress,
  loadProgress,
  saveProgress,
  updateScrollPosition,
  addReadingTime,
  markComplete,
  isReadingComplete,
  estimateWordCount,
  SCROLL_SAVE_INTERVAL_MS,
} from './progress'
import { checkNewBadges } from './badges'
import { migrateIfNeeded } from './migrate'
import {
  activateQuest as _activateQuest,
  completeQuest as _completeQuest,
  unlockRoom as _unlockRoom,
  setTitle as _setTitle,
} from './questProgress'

// ── Store (external, works with useSyncExternalStore) ──

let currentState: UserProgress
const listeners = new Set<() => void>()

function initStore() {
  migrateIfNeeded()
  currentState = loadProgress()
}
initStore()

function getSnapshot(): UserProgress {
  return currentState
}

function setState(next: UserProgress): void {
  // Check for new badges before persisting
  const newBadges = checkNewBadges(next)
  if (newBadges.length > 0) {
    next = { ...next, badges: [...next.badges, ...newBadges] }
  }
  currentState = next
  saveProgress(next)
  listeners.forEach(fn => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// ── Context value type ──

interface ProgressAPI {
  state: UserProgress
  trackScroll: (bookId: string, scrollPos: number) => void
  trackTime: (bookId: string, deltaMs: number) => void
  checkCompletion: (bookId: string, markdown: string) => void
  activateQuest: (questId: string) => void
  completeQuest: (questId: string) => void
  unlockRoom: (roomId: string) => void
  setTitle: (title: string) => void
}

const ProgressContext = createContext<ProgressAPI | null>(null)

// ── Provider ──

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const lastScrollSave = useRef<Record<string, number>>({})

  const trackScroll = useCallback((bookId: string, scrollPos: number) => {
    const now = Date.now()
    const last = lastScrollSave.current[bookId] ?? 0
    if (now - last < SCROLL_SAVE_INTERVAL_MS) return
    lastScrollSave.current[bookId] = now
    setState(updateScrollPosition(getSnapshot(), bookId, scrollPos))
  }, [])

  const trackTime = useCallback((bookId: string, deltaMs: number) => {
    if (deltaMs <= 0) return
    setState(addReadingTime(getSnapshot(), bookId, deltaMs))
  }, [])

  const checkCompletion = useCallback((bookId: string, markdown: string) => {
    const s = getSnapshot()
    const entry = s.books[bookId]
    if (!entry || entry.completed) return
    const wordCount = estimateWordCount(markdown)
    if (isReadingComplete(entry, wordCount)) {
      setState(markComplete(s, bookId))
    }
  }, [])

  const activateQuest = useCallback((questId: string) => {
    setState(_activateQuest(getSnapshot(), questId))
  }, [])

  const completeQuest = useCallback((questId: string) => {
    setState(_completeQuest(getSnapshot(), questId))
  }, [])

  const unlockRoom = useCallback((roomId: string) => {
    setState(_unlockRoom(getSnapshot(), roomId))
  }, [])

  const setTitle = useCallback((title: string) => {
    setState(_setTitle(getSnapshot(), title))
  }, [])

  const api: ProgressAPI = {
    state, trackScroll, trackTime, checkCompletion,
    activateQuest, completeQuest, unlockRoom, setTitle,
  }

  return (
    <ProgressContext.Provider value={api}>
      {children}
    </ProgressContext.Provider>
  )
}

// ── Hook ──

export function useProgress(): ProgressAPI {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
