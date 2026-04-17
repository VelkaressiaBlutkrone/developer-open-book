import { describe, it, expect } from 'vitest'
import {
  updateScrollPosition,
  addReadingTime,
  markComplete,
  isReadingComplete,
  estimateWordCount,
  estimateReadTimeMs,
  getCompletedCount,
  getCompletionPercent,
  type UserProgress,
  type ReadingProgress,
} from './progress'

function emptyState(): UserProgress {
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

function makeEntry(overrides: Partial<ReadingProgress> = {}): ReadingProgress {
  return {
    bookId: 'test-01',
    lastReadAt: Date.now(),
    scrollPosition: 0,
    completed: false,
    timeSpentMs: 0,
    ...overrides,
  }
}

// ── estimateWordCount ──

describe('estimateWordCount', () => {
  it('counts words in plain text', () => {
    expect(estimateWordCount('hello world foo bar')).toBe(4)
  })

  it('strips code blocks', () => {
    const md = 'intro text\n```js\nconst x = 1;\n```\nend text'
    const count = estimateWordCount(md)
    // should only count "intro text" and "end text"
    expect(count).toBeLessThanOrEqual(5)
    expect(count).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for empty string', () => {
    expect(estimateWordCount('')).toBe(0)
  })
})

// ── estimateReadTimeMs ──

describe('estimateReadTimeMs', () => {
  it('200 words = 1 minute', () => {
    expect(estimateReadTimeMs(200)).toBe(60_000)
  })

  it('0 words = 0 ms', () => {
    expect(estimateReadTimeMs(0)).toBe(0)
  })
})

// ── isReadingComplete ──

describe('isReadingComplete', () => {
  it('returns true if already marked completed', () => {
    const entry = makeEntry({ completed: true })
    expect(isReadingComplete(entry, 1000)).toBe(true)
  })

  it('short doc (<500 words): scroll >= 0.9 is enough', () => {
    const entry = makeEntry({ scrollPosition: 0.95, timeSpentMs: 0 })
    expect(isReadingComplete(entry, 300)).toBe(true)
  })

  it('short doc: scroll < 0.9 is not enough', () => {
    const entry = makeEntry({ scrollPosition: 0.5, timeSpentMs: 0 })
    expect(isReadingComplete(entry, 300)).toBe(false)
  })

  it('long doc: needs both scroll and time', () => {
    // 1000 words → read time ~5min (300_000ms), 50% = 150_000ms, min 30_000ms
    const entry = makeEntry({ scrollPosition: 0.95, timeSpentMs: 200_000 })
    expect(isReadingComplete(entry, 1000)).toBe(true)
  })

  it('long doc: scroll ok but time insufficient', () => {
    const entry = makeEntry({ scrollPosition: 0.95, timeSpentMs: 5_000 })
    expect(isReadingComplete(entry, 1000)).toBe(false)
  })

  it('long doc: time ok but scroll insufficient', () => {
    const entry = makeEntry({ scrollPosition: 0.5, timeSpentMs: 200_000 })
    expect(isReadingComplete(entry, 1000)).toBe(false)
  })
})

// ── updateScrollPosition ──

describe('updateScrollPosition', () => {
  it('creates a new entry if book not tracked', () => {
    const state = emptyState()
    const next = updateScrollPosition(state, 'dart-01', 0.5)
    expect(next.books['dart-01']).toBeDefined()
    expect(next.books['dart-01'].scrollPosition).toBe(0.5)
    expect(next.books['dart-01'].completed).toBe(false)
  })

  it('updates existing entry scroll position', () => {
    const state = emptyState()
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01', scrollPosition: 0.2 })
    const next = updateScrollPosition(state, 'dart-01', 0.8)
    expect(next.books['dart-01'].scrollPosition).toBe(0.8)
  })

  it('does not mutate original state', () => {
    const state = emptyState()
    const next = updateScrollPosition(state, 'dart-01', 0.5)
    expect(state.books['dart-01']).toBeUndefined()
    expect(next.books['dart-01']).toBeDefined()
  })
})

// ── addReadingTime ──

describe('addReadingTime', () => {
  it('adds time to existing entry', () => {
    const state = emptyState()
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01', timeSpentMs: 10_000 })
    const next = addReadingTime(state, 'dart-01', 5_000)
    expect(next.books['dart-01'].timeSpentMs).toBe(15_000)
    expect(next.totals.totalTimeMs).toBe(5_000)
  })

  it('returns same state if book not tracked', () => {
    const state = emptyState()
    const next = addReadingTime(state, 'nonexistent', 5_000)
    expect(next).toBe(state)
  })
})

// ── markComplete ──

describe('markComplete', () => {
  it('marks a book as completed', () => {
    const state = emptyState()
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01' })
    const next = markComplete(state, 'dart-01')
    expect(next.books['dart-01'].completed).toBe(true)
    expect(next.books['dart-01'].completedAt).toBeGreaterThan(0)
    expect(next.totals.booksCompleted).toBe(1)
  })

  it('does not double-count already completed', () => {
    const state = emptyState()
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01', completed: true })
    const next = markComplete(state, 'dart-01')
    expect(next).toBe(state)
  })

  it('returns same state if book not tracked', () => {
    const state = emptyState()
    const next = markComplete(state, 'nonexistent')
    expect(next).toBe(state)
  })

  it('starts streak on first completion', () => {
    const state = emptyState()
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01' })
    const next = markComplete(state, 'dart-01')
    expect(next.streak.current).toBe(1)
    expect(next.streak.longest).toBe(1)
    expect(next.streak.lastReadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('increments streak on consecutive days', () => {
    const state = emptyState()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    state.streak = {
      current: 3,
      lastReadDate: yesterday.toISOString().slice(0, 10),
      longest: 5,
    }
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01' })
    const next = markComplete(state, 'dart-01')
    expect(next.streak.current).toBe(4)
  })

  it('resets streak after gap > 1 day', () => {
    const state = emptyState()
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    state.streak = {
      current: 5,
      lastReadDate: threeDaysAgo.toISOString().slice(0, 10),
      longest: 5,
    }
    state.books['dart-01'] = makeEntry({ bookId: 'dart-01' })
    const next = markComplete(state, 'dart-01')
    expect(next.streak.current).toBe(1)
    expect(next.streak.longest).toBe(5) // longest preserved
  })
})

// ── getCompletedCount / getCompletionPercent ──

describe('getCompletedCount & getCompletionPercent', () => {
  it('returns 0 for empty state', () => {
    expect(getCompletedCount(emptyState())).toBe(0)
    expect(getCompletionPercent(emptyState())).toBe(0)
  })

  it('returns correct count', () => {
    const state = emptyState()
    state.totals.booksCompleted = 10
    expect(getCompletedCount(state)).toBe(10)
  })

  it('returns correct percent', () => {
    const state = emptyState()
    state.totals.booksCompleted = 97 // all books
    expect(getCompletionPercent(state)).toBe(100)
  })
})
