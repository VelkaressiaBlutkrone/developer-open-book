import { BOOKS } from '../data/books'

// ── Types ──

export interface ReadingProgress {
  bookId: string
  lastReadAt: number        // timestamp
  scrollPosition: number    // 0–1
  completed: boolean
  completedAt?: number      // timestamp
  timeSpentMs: number
}

export interface UserProgress {
  version: 3
  books: Record<string, ReadingProgress>
  badges: string[]          // earned badge IDs
  streak: {
    current: number
    lastReadDate: string    // YYYY-MM-DD
    longest: number
  }
  totals: {
    booksCompleted: number
    totalTimeMs: number
  }
  quests: Record<string, 'active' | 'completed'>
  unlockedRooms: string[]
  title?: string
}

// ── Constants ──

const STORAGE_KEY = 'dev-open-book-progress'
const SCROLL_SAVE_INTERVAL_MS = 3_000
const WORDS_PER_MINUTE = 200

// ── Default ──

function createDefault(): UserProgress {
  return {
    version: 3,
    books: {},
    badges: [],
    streak: { current: 0, lastReadDate: '', longest: 0 },
    totals: { booksCompleted: 0, totalTimeMs: 0 },
    quests: {},
    unlockedRooms: ['main'],
  }
}

// ── Persistence ──

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefault()
    const parsed = JSON.parse(raw)
    if (parsed.version === 3) return parsed as UserProgress
    if (parsed.version === 2) return migrateV2toV3(parsed)
    return createDefault()
  } catch {
    return createDefault()
  }
}

function migrateV2toV3(v2: Record<string, unknown>): UserProgress {
  return {
    ...(v2 as unknown as UserProgress),
    version: 3,
    quests: {},
    unlockedRooms: ['main'],
  }
}

export function saveProgress(p: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

// ── Helpers ──

function toDateStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z')
  const db = new Date(b + 'T00:00:00Z')
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

export function estimateReadTimeMs(wordCount: number): number {
  return (wordCount / WORDS_PER_MINUTE) * 60 * 1000
}

export function estimateWordCount(markdown: string): number {
  // Strip code blocks, images, links, and HTML tags for a rough count
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_>\-|=~]/g, '')
  return stripped.split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Check if a book should be considered "completed".
 * Short docs (<500 words): scroll to bottom (>=0.9).
 * Long docs: max(30s, 50% estimated read time) AND scroll >=0.9.
 */
export function isReadingComplete(
  progress: ReadingProgress,
  wordCount: number,
): boolean {
  if (progress.completed) return true
  const scrolledEnough = progress.scrollPosition >= 0.9

  if (wordCount < 500) {
    return scrolledEnough
  }

  const minTime = Math.max(30_000, estimateReadTimeMs(wordCount) * 0.5)
  return scrolledEnough && progress.timeSpentMs >= minTime
}

// ── Mutations ──

export function updateScrollPosition(
  state: UserProgress,
  bookId: string,
  scrollPos: number,
): UserProgress {
  const now = Date.now()
  const existing = state.books[bookId]
  const entry: ReadingProgress = existing
    ? { ...existing, scrollPosition: scrollPos, lastReadAt: now }
    : { bookId, lastReadAt: now, scrollPosition: scrollPos, completed: false, timeSpentMs: 0 }

  return { ...state, books: { ...state.books, [bookId]: entry } }
}

export function addReadingTime(
  state: UserProgress,
  bookId: string,
  deltaMs: number,
): UserProgress {
  const existing = state.books[bookId]
  if (!existing) return state
  const updated = {
    ...existing,
    timeSpentMs: existing.timeSpentMs + deltaMs,
  }
  return {
    ...state,
    books: { ...state.books, [bookId]: updated },
    totals: { ...state.totals, totalTimeMs: state.totals.totalTimeMs + deltaMs },
  }
}

export function markComplete(
  state: UserProgress,
  bookId: string,
): UserProgress {
  const existing = state.books[bookId]
  if (!existing || existing.completed) return state

  const now = Date.now()
  const todayStr = toDateStr(now)

  // Update streak
  let { current, lastReadDate, longest } = state.streak
  if (lastReadDate === '') {
    current = 1
  } else {
    const gap = daysBetween(lastReadDate, todayStr)
    if (gap === 1) {
      current += 1
    } else if (gap > 1) {
      current = 1
    }
    // gap === 0: same day, keep current
  }
  lastReadDate = todayStr
  longest = Math.max(longest, current)

  const updatedBook: ReadingProgress = {
    ...existing,
    completed: true,
    completedAt: now,
  }

  return {
    ...state,
    books: { ...state.books, [bookId]: updatedBook },
    streak: { current, lastReadDate, longest },
    totals: {
      ...state.totals,
      booksCompleted: state.totals.booksCompleted + 1,
    },
  }
}

export function getCompletedCount(state: UserProgress): number {
  return state.totals.booksCompleted
}

export function getTotalBooks(): number {
  return BOOKS.length
}

export function getCompletionPercent(state: UserProgress): number {
  const total = getTotalBooks()
  if (total === 0) return 0
  return Math.round((state.totals.booksCompleted / total) * 100)
}

export { SCROLL_SAVE_INTERVAL_MS }
