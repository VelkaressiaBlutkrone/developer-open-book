import type { UserProgress } from '../store/progress'
import { checkRequirements, getAvailableQuests } from './quests'
import { librarianDialogue } from './dialogues/librarian'
import { scholarDialogue } from './dialogues/scholar'
import { visitorDialogue } from './dialogues/visitor'
import { researcherDialogue } from './dialogues/researcher'

// ── Types ──

export interface DialogueCondition {
  type: 'quest_active' | 'quest_complete' | 'quest_not_started'
      | 'books_read_gte' | 'category_complete' | 'room_unlocked'
      | 'quest_completable'
  target: string
  value?: number
}

export interface DialogueOption {
  text: string
  next: string    // DialogueNode id
}

export interface DialogueAction {
  type: 'give_quest' | 'complete_quest' | 'unlock_room' | 'give_title'
  payload: string
}

export interface DialogueNode {
  id: string
  text: string
  condition?: DialogueCondition
  options?: DialogueOption[]
  action?: DialogueAction
}

export type TimeOfDay = 'morning' | 'afternoon' | 'night'

export interface NPCSchedule {
  period: TimeOfDay
  position: { top: string; left?: string; right?: string; marginLeft?: number; marginRight?: number }
  direction: 'south' | 'north' | 'east' | 'west'
  absent?: boolean
}

export interface NPC {
  id: string
  name: string
  role: 'librarian' | 'scholar' | 'visitor' | 'researcher'
  room: string
  position: { top: string; left?: string; right?: string; marginLeft?: number; marginRight?: number }
  sprite: { south: string; north: string; east: string; west: string }
  defaultDirection: 'south' | 'north' | 'east' | 'west'
  dialogueTree: DialogueNode[]
  schedule?: NPCSchedule[]
}

// ── Sprite base path ──

const S = ''

// ── NPC Definitions ──

export const NPCS: NPC[] = [
  {
    id: 'librarian',
    name: '사서',
    role: 'librarian',
    room: 'main',
    position: { top: '28%', left: '54%' },
    sprite: {
      south: S + 'librarian/rotations/south.png',
      north: S + 'librarian/rotations/north.png',
      east: S + 'librarian/rotations/east.png',
      west: S + 'librarian/rotations/west.png',
    },
    defaultDirection: 'south',
    dialogueTree: librarianDialogue,
    schedule: [
      { period: 'morning', position: { top: '28%', left: '54%' }, direction: 'south' },
      { period: 'afternoon', position: { top: '28%', right: '14%' }, direction: 'west' },
      { period: 'night', position: { top: '40%', left: '44%' }, direction: 'south' },
    ],
  },
  {
    id: 'scholar',
    name: 'Dart 학자',
    role: 'scholar',
    room: 'main',
    position: { top: '56%', left: '18%' },
    sprite: {
      south: S + 'scholar/rotations/south.png',
      north: S + 'scholar/rotations/north.png',
      east: S + 'scholar/rotations/east.png',
      west: S + 'scholar/rotations/west.png',
    },
    defaultDirection: 'east',
    dialogueTree: scholarDialogue,
    schedule: [
      { period: 'morning', position: { top: '26%', left: '12%' }, direction: 'east' },
      { period: 'afternoon', position: { top: '56%', left: '18%' }, direction: 'east' },
      { period: 'night', absent: true, position: { top: '56%', left: '18%' }, direction: 'east' },
    ],
  },
  {
    id: 'visitor',
    name: 'Flutter 방문자',
    role: 'visitor',
    room: 'main',
    position: { top: '56%', right: '18%' },
    sprite: {
      south: S + 'visitor/rotations/south.png',
      north: S + 'visitor/rotations/north.png',
      east: S + 'visitor/rotations/east.png',
      west: S + 'visitor/rotations/west.png',
    },
    defaultDirection: 'west',
    dialogueTree: visitorDialogue,
    schedule: [
      { period: 'morning', position: { top: '40%', left: '40%' }, direction: 'south' },
      { period: 'afternoon', position: { top: '56%', right: '18%' }, direction: 'west' },
      { period: 'night', position: { top: '56%', right: '18%' }, direction: 'west' },
    ],
  },
  {
    id: 'researcher',
    name: 'React 연구원',
    role: 'researcher',
    room: 'main',
    position: { top: '46%', right: '15%' },
    sprite: {
      south: S + 'researcher/rotations/south.png',
      north: S + 'researcher/rotations/north.png',
      east: S + 'researcher/rotations/east.png',
      west: S + 'researcher/rotations/west.png',
    },
    defaultDirection: 'south',
    dialogueTree: researcherDialogue,
  },
]

// ── Helpers ──

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}

export function getNPCPosition(npc: NPC, time: TimeOfDay): {
  position: NPC['position']; direction: NPC['defaultDirection']
} | null {
  const entry = npc.schedule?.find(s => s.period === time)
  if (entry?.absent) return null
  return entry
    ? { position: entry.position, direction: entry.direction }
    : { position: npc.position, direction: npc.defaultDirection }
}

export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(n => n.id === id)
}

export function getNPCsByRoom(roomId: string): NPC[] {
  return NPCS.filter(n => n.room === roomId)
}

function checkCondition(cond: DialogueCondition, state: UserProgress): boolean {
  switch (cond.type) {
    case 'quest_active':
      return state.quests[cond.target] === 'active'
    case 'quest_complete':
      return state.quests[cond.target] === 'completed'
    case 'quest_not_started':
      return !state.quests[cond.target]
    case 'quest_completable':
      return state.quests[cond.target] === 'active' && checkRequirements(cond.target, state)
    case 'books_read_gte':
      return state.totals.booksCompleted >= (cond.value ?? 0)
    case 'room_unlocked':
      return state.unlockedRooms.includes(cond.target)
    default:
      return false
  }
}

/**
 * Find the first dialogue node whose condition matches the current state.
 * Nodes without conditions serve as fallbacks (checked last).
 */
export function findDialogueNode(npc: NPC, state: UserProgress): DialogueNode | null {
  // First pass: nodes with conditions
  for (const node of npc.dialogueTree) {
    if (node.condition && checkCondition(node.condition, state)) {
      return node
    }
  }
  // Second pass: fallback (no condition)
  for (const node of npc.dialogueTree) {
    if (!node.condition) return node
  }
  return null
}

/**
 * Determine marker type for an NPC.
 * '!' = quest completable, '?' = new quest available, null = nothing
 */
export function getNPCMarkerType(npc: NPC, state: UserProgress): '!' | '?' | null {
  // Check if any active quest from this NPC is completable
  const giverQuests = npc.dialogueTree
  for (const node of giverQuests) {
    if (node.condition?.type === 'quest_completable') {
      if (checkCondition(node.condition, state)) return '!'
    }
  }
  // Check if new quests available from this NPC
  const available = getAvailableQuests(state)
  if (available.some(q => q.giver === npc.id)) return '?'
  return null
}
