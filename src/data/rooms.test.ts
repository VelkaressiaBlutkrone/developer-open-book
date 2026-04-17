import { describe, it, expect } from 'vitest'
import { ROOMS, getRoomById, isRoomUnlocked } from './rooms'

describe('ROOMS', () => {
  it('has 4 rooms', () => {
    expect(ROOMS.length).toBe(4)
  })

  it('all rooms have unique ids', () => {
    const ids = ROOMS.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('main has no unlock quest', () => {
    const main = getRoomById('main')
    expect(main?.unlockQuest).toBeUndefined()
  })

  it('east requires main-3', () => {
    expect(getRoomById('east')?.unlockQuest).toBe('main-3')
  })
})

describe('isRoomUnlocked', () => {
  it('main is always unlocked', () => {
    expect(isRoomUnlocked('main', ['main'])).toBe(true)
  })

  it('east is locked by default', () => {
    expect(isRoomUnlocked('east', ['main'])).toBe(false)
  })

  it('east is unlocked when in list', () => {
    expect(isRoomUnlocked('east', ['main', 'east'])).toBe(true)
  })

  it('unknown room is locked', () => {
    expect(isRoomUnlocked('unknown', ['main'])).toBe(false)
  })
})
