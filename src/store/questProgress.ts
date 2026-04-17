import type { UserProgress } from './progress'

export function activateQuest(state: UserProgress, questId: string): UserProgress {
  if (state.quests[questId] === 'completed') return state
  return { ...state, quests: { ...state.quests, [questId]: 'active' } }
}

export function completeQuest(state: UserProgress, questId: string): UserProgress {
  return { ...state, quests: { ...state.quests, [questId]: 'completed' } }
}

export function unlockRoom(state: UserProgress, roomId: string): UserProgress {
  if (state.unlockedRooms.includes(roomId)) return state
  return { ...state, unlockedRooms: [...state.unlockedRooms, roomId] }
}

export function setTitle(state: UserProgress, title: string): UserProgress {
  return { ...state, title }
}
