import { describe, it, expect } from 'vitest'
import { activateQuest, completeQuest, unlockRoom, setTitle } from './questProgress'
import type { UserProgress } from './progress'

function emptyState(): UserProgress {
  return {
    version: 3, books: {}, badges: [], streak: { current: 0, lastReadDate: '', longest: 0 },
    totals: { booksCompleted: 0, totalTimeMs: 0 }, quests: {}, unlockedRooms: ['main'],
  }
}

describe('activateQuest', () => {
  it('sets quest to active', () => {
    const next = activateQuest(emptyState(), 'main-1')
    expect(next.quests['main-1']).toBe('active')
  })
  it('does not overwrite completed', () => {
    const state = emptyState()
    state.quests['main-1'] = 'completed'
    const next = activateQuest(state, 'main-1')
    expect(next.quests['main-1']).toBe('completed')
  })
  it('does not mutate original', () => {
    const state = emptyState()
    activateQuest(state, 'main-1')
    expect(state.quests['main-1']).toBeUndefined()
  })
})

describe('completeQuest', () => {
  it('sets quest to completed', () => {
    const state = emptyState()
    state.quests['main-1'] = 'active'
    const next = completeQuest(state, 'main-1')
    expect(next.quests['main-1']).toBe('completed')
  })
})

describe('unlockRoom', () => {
  it('adds room to unlockedRooms', () => {
    const next = unlockRoom(emptyState(), 'east')
    expect(next.unlockedRooms).toContain('east')
  })
  it('does not duplicate', () => {
    const state = emptyState()
    const next = unlockRoom(unlockRoom(state, 'east'), 'east')
    expect(next.unlockedRooms.filter(r => r === 'east').length).toBe(1)
  })
})

describe('setTitle', () => {
  it('sets title', () => {
    const next = setTitle(emptyState(), 'Dart 마스터')
    expect(next.title).toBe('Dart 마스터')
  })
})
