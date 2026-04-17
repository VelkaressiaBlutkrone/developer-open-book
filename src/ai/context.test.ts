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
    const trimmed = trimMarkdown('a'.repeat(50000), 10000)
    expect(trimmed.length).toBeLessThanOrEqual(10100) // allow for suffix
  })
  it('returns short content as-is', () => {
    expect(trimMarkdown('hello', 10000)).toBe('hello')
  })
})
