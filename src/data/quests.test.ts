import { describe, it, expect } from 'vitest'
import { QUESTS, getQuestById, checkRequirements, getAvailableQuests } from './quests'
import type { UserProgress } from '../store/progress'

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

function makeCompleted(bookId: string) {
  return { bookId, lastReadAt: 0, scrollPosition: 1, completed: true as const, timeSpentMs: 0 }
}

describe('QUESTS registry', () => {
  it('has 17 quests', () => {
    expect(QUESTS.length).toBe(17)
  })

  it('all quests have unique ids', () => {
    const ids = QUESTS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all prerequisite quests exist', () => {
    const ids = new Set(QUESTS.map(q => q.id))
    for (const q of QUESTS) {
      if (q.prerequisite) {
        expect(ids.has(q.prerequisite), `${q.id} prereq ${q.prerequisite} missing`).toBe(true)
      }
    }
  })
})

describe('getQuestById', () => {
  it('finds existing quest', () => {
    expect(getQuestById('main-1')).toBeDefined()
  })
  it('returns undefined for missing', () => {
    expect(getQuestById('nope')).toBeUndefined()
  })
})

describe('checkRequirements', () => {
  it('main-1: total_books >= 1', () => {
    const state = emptyState()
    expect(checkRequirements('main-1', state)).toBe(false)
    state.totals.booksCompleted = 1
    expect(checkRequirements('main-1', state)).toBe(true)
  })

  it('dart-q1: read_category_count dart >= 3', () => {
    const state = emptyState()
    state.books['dart-01'] = makeCompleted('dart-01')
    state.books['dart-02'] = makeCompleted('dart-02')
    expect(checkRequirements('dart-q1', state)).toBe(false)
    state.books['dart-03'] = makeCompleted('dart-03')
    expect(checkRequirements('dart-q1', state)).toBe(true)
  })

  it('dart-q3: read_book dart-14', () => {
    const state = emptyState()
    expect(checkRequirements('dart-q3', state)).toBe(false)
    state.books['dart-14'] = makeCompleted('dart-14')
    expect(checkRequirements('dart-q3', state)).toBe(true)
  })

  it('main-4: 2 categories with 5+ each', () => {
    const state = emptyState()
    // Add 5 dart books
    for (let i = 1; i <= 5; i++) state.books[`dart-${String(i).padStart(2, '0')}`] = makeCompleted(`dart-${String(i).padStart(2, '0')}`)
    expect(checkRequirements('main-4', state)).toBe(false)
    // Add 5 react books
    for (let i = 0; i <= 4; i++) state.books[`react-${String(i).padStart(2, '0')}`] = makeCompleted(`react-${String(i).padStart(2, '0')}`)
    expect(checkRequirements('main-4', state)).toBe(true)
  })

  it('returns false for nonexistent quest', () => {
    expect(checkRequirements('nope', emptyState())).toBe(false)
  })
})

describe('getAvailableQuests', () => {
  it('returns first chain quests for empty state', () => {
    const state = emptyState()
    const available = getAvailableQuests(state)
    const ids = available.map(q => q.id)
    expect(ids).toContain('main-1')
    expect(ids).toContain('dart-q1')
    expect(ids).toContain('flutter-q1')
    expect(ids).toContain('react-q1')
    expect(ids).not.toContain('main-2')
    expect(ids).not.toContain('dart-q2')
  })

  it('unlocks next quest after completing prerequisite', () => {
    const state = emptyState()
    state.quests['main-1'] = 'completed'
    const available = getAvailableQuests(state)
    const ids = available.map(q => q.id)
    expect(ids).toContain('main-2')
    expect(ids).not.toContain('main-1') // already completed
  })

  it('excludes active quests', () => {
    const state = emptyState()
    state.quests['main-1'] = 'active'
    const available = getAvailableQuests(state)
    expect(available.map(q => q.id)).not.toContain('main-1')
  })
})
