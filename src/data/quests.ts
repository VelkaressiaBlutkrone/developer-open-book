import { BOOKS } from './books'
import type { UserProgress } from '../store/progress'

// ── Types ──

export interface QuestRequirement {
  type: 'total_books' | 'read_category_count' | 'read_book' | 'complete_category'
  target?: string   // bookId or categoryId
  value?: number    // count threshold
}

export interface QuestReward {
  type: 'badge' | 'unlock_room' | 'title'
  value: string
}

export interface Quest {
  id: string
  title: string
  description: string
  giver: string        // NPC id
  chain: number        // order within giver's chain (1-based)
  prerequisite?: string
  requirements: QuestRequirement[]
  rewards: QuestReward[]
}

// ── Quest Definitions (17) ──

export const QUESTS: Quest[] = [
  // ── Librarian Main Story (5) ──
  {
    id: 'main-1', title: '첫 발걸음', description: '아무 책 1권을 완독하세요.',
    giver: 'librarian', chain: 1,
    requirements: [{ type: 'total_books', value: 1 }],
    rewards: [{ type: 'badge', value: 'quest-first-step' }],
  },
  {
    id: 'main-2', title: '세 갈래 길', description: 'Dart, Flutter, React에서 각 1권씩 읽으세요.',
    giver: 'librarian', chain: 2, prerequisite: 'main-1',
    requirements: [
      { type: 'read_category_count', target: 'dart', value: 1 },
      { type: 'read_category_count', target: 'flutter', value: 1 },
      { type: 'read_category_count', target: 'react', value: 1 },
    ],
    rewards: [{ type: 'badge', value: 'quest-three-paths' }],
  },
  {
    id: 'main-3', title: '동쪽으로', description: '아무 카테고리에서 10권을 완독하세요.',
    giver: 'librarian', chain: 3, prerequisite: 'main-2',
    requirements: [{ type: 'total_books', value: 10 }],
    rewards: [{ type: 'unlock_room', value: 'east' }],
  },
  {
    id: 'main-4', title: '서쪽으로', description: '2개 카테고리에서 각 5권 이상 읽으세요.',
    giver: 'librarian', chain: 4, prerequisite: 'main-3',
    requirements: [
      // Checked specially: at least 2 categories with >= 5 books each
      { type: 'total_books', value: 10 },
    ],
    rewards: [{ type: 'unlock_room', value: 'west' }],
  },
  {
    id: 'main-5', title: '전설의 독서가', description: '총 50권을 완독하세요.',
    giver: 'librarian', chain: 5, prerequisite: 'main-4',
    requirements: [{ type: 'total_books', value: 50 }],
    rewards: [{ type: 'unlock_room', value: 'upper' }, { type: 'title', value: '전설의 독서가' }],
  },

  // ── Scholar Dart Line (4) ──
  {
    id: 'dart-q1', title: 'Dart의 첫 걸음', description: 'Dart 책 3권을 읽으세요.',
    giver: 'scholar', chain: 1,
    requirements: [{ type: 'read_category_count', target: 'dart', value: 3 }],
    rewards: [{ type: 'badge', value: 'quest-dart-beginner' }],
  },
  {
    id: 'dart-q2', title: '문법을 넘어서', description: 'Dart 책 10권을 읽으세요.',
    giver: 'scholar', chain: 2, prerequisite: 'dart-q1',
    requirements: [{ type: 'read_category_count', target: 'dart', value: 10 }],
    rewards: [{ type: 'badge', value: 'quest-dart-intermediate' }],
  },
  {
    id: 'dart-q3', title: '비동기의 세계', description: 'Dart Async/Future/Stream을 완독하세요.',
    giver: 'scholar', chain: 3, prerequisite: 'dart-q2',
    requirements: [{ type: 'read_book', target: 'dart-14' }],
    rewards: [{ type: 'badge', value: 'quest-dart-async' }],
  },
  {
    id: 'dart-q4', title: 'Dart 마스터', description: 'Dart 전체 23권을 완독하세요.',
    giver: 'scholar', chain: 4, prerequisite: 'dart-q3',
    requirements: [{ type: 'complete_category', target: 'dart' }],
    rewards: [{ type: 'badge', value: 'quest-dart-master' }, { type: 'title', value: 'Dart 마스터' }],
  },

  // ── Visitor Flutter Line (4) ──
  {
    id: 'flutter-q1', title: '위젯의 세계로', description: 'Flutter 책 3권을 읽으세요.',
    giver: 'visitor', chain: 1,
    requirements: [{ type: 'read_category_count', target: 'flutter', value: 3 }],
    rewards: [{ type: 'badge', value: 'quest-flutter-beginner' }],
  },
  {
    id: 'flutter-q2', title: '상태를 다스리다', description: 'Flutter 책 10권을 읽으세요.',
    giver: 'visitor', chain: 2, prerequisite: 'flutter-q1',
    requirements: [{ type: 'read_category_count', target: 'flutter', value: 10 }],
    rewards: [{ type: 'badge', value: 'quest-flutter-intermediate' }],
  },
  {
    id: 'flutter-q3', title: '아키텍처의 눈', description: 'Flutter Clean Architecture를 완독하세요.',
    giver: 'visitor', chain: 3, prerequisite: 'flutter-q2',
    requirements: [{ type: 'read_book', target: 'flutter-21' }],
    rewards: [{ type: 'badge', value: 'quest-flutter-arch' }],
  },
  {
    id: 'flutter-q4', title: 'Flutter 장인', description: 'Flutter 전체 31권을 완독하세요.',
    giver: 'visitor', chain: 4, prerequisite: 'flutter-q3',
    requirements: [{ type: 'complete_category', target: 'flutter' }],
    rewards: [{ type: 'badge', value: 'quest-flutter-master' }, { type: 'title', value: 'Flutter 장인' }],
  },

  // ── Researcher React Line (4) ──
  {
    id: 'react-q1', title: 'Hook에 걸리다', description: 'React 책 3권을 읽으세요.',
    giver: 'researcher', chain: 1,
    requirements: [{ type: 'read_category_count', target: 'react', value: 3 }],
    rewards: [{ type: 'badge', value: 'quest-react-beginner' }],
  },
  {
    id: 'react-q2', title: '렌더링의 비밀', description: 'React 책 10권을 읽으세요.',
    giver: 'researcher', chain: 2, prerequisite: 'react-q1',
    requirements: [{ type: 'read_category_count', target: 'react', value: 10 }],
    rewards: [{ type: 'badge', value: 'quest-react-intermediate' }],
  },
  {
    id: 'react-q3', title: '서버의 영역', description: 'React Server Components를 완독하세요.',
    giver: 'researcher', chain: 3, prerequisite: 'react-q2',
    requirements: [{ type: 'read_book', target: 'react-20' }],
    rewards: [{ type: 'badge', value: 'quest-react-rsc' }],
  },
  {
    id: 'react-q4', title: 'React 현자', description: 'React 전체 43권을 완독하세요.',
    giver: 'researcher', chain: 4, prerequisite: 'react-q3',
    requirements: [{ type: 'complete_category', target: 'react' }],
    rewards: [{ type: 'badge', value: 'quest-react-master' }, { type: 'title', value: 'React 현자' }],
  },
]

// ── Helpers ──

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find(q => q.id === id)
}

export function getQuestsByGiver(giverId: string): Quest[] {
  return QUESTS.filter(q => q.giver === giverId).sort((a, b) => a.chain - b.chain)
}

function countCompletedInCategory(state: UserProgress, category: string): number {
  return Object.values(state.books).filter(
    b => b.completed && b.bookId.startsWith(category)
  ).length
}

function categoryBookCount(category: string): number {
  return BOOKS.filter(b => b.category === category).length
}

function checkTwoCategoriesWithFiveEach(state: UserProgress): boolean {
  const categories = ['dart', 'flutter', 'react']
  let qualifying = 0
  for (const cat of categories) {
    if (countCompletedInCategory(state, cat) >= 5) qualifying++
  }
  return qualifying >= 2
}

export function checkRequirements(questId: string, state: UserProgress): boolean {
  const quest = getQuestById(questId)
  if (!quest) return false

  // Special case: main-4 needs 2 categories with 5+ each
  if (questId === 'main-4') {
    return checkTwoCategoriesWithFiveEach(state)
  }

  return quest.requirements.every(req => {
    switch (req.type) {
      case 'total_books':
        return state.totals.booksCompleted >= (req.value ?? 0)
      case 'read_category_count':
        return countCompletedInCategory(state, req.target ?? '') >= (req.value ?? 0)
      case 'read_book':
        return state.books[req.target ?? '']?.completed === true
      case 'complete_category': {
        const total = categoryBookCount(req.target ?? '')
        const done = countCompletedInCategory(state, req.target ?? '')
        return total > 0 && done >= total
      }
      default:
        return false
    }
  })
}

export function getAvailableQuests(state: UserProgress): Quest[] {
  return QUESTS.filter(q => {
    // Already active or completed → not available
    if (state.quests[q.id]) return false
    // Prerequisite not completed → not available
    if (q.prerequisite && state.quests[q.prerequisite] !== 'completed') return false
    return true
  })
}
