import type { UserProgress } from './progress'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string   // pixel-art SVG string
  check: (state: UserProgress) => boolean
}

// ── Pixel Art SVG Icons (16×16 grid) ──

const svg = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32">` +
  `<rect width="16" height="16" fill="none"/>` +
  paths +
  `</svg>`

const px = (x: number, y: number, w = 1, h = 1, fill = '#f5c542') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`

// Book icon
const bookIcon = svg(
  px(3, 2, 10, 12, '#8B4513') +
  px(4, 3, 8, 10, '#D2691E') +
  px(5, 4, 6, 1, '#fff') +
  px(5, 6, 6, 1, '#fff') +
  px(5, 8, 4, 1, '#fff')
)

// Star icon
const starIcon = svg(
  px(7, 1, 2, 2, '#f5c542') +
  px(5, 3, 6, 2, '#f5c542') +
  px(3, 5, 10, 2, '#f5c542') +
  px(4, 7, 8, 2, '#f5c542') +
  px(3, 9, 3, 2, '#f5c542') +
  px(10, 9, 3, 2, '#f5c542') +
  px(2, 11, 2, 2, '#f5c542') +
  px(12, 11, 2, 2, '#f5c542')
)

// Fire icon (streak)
const fireIcon = svg(
  px(7, 2, 2, 2, '#ff6b35') +
  px(6, 4, 4, 2, '#ff6b35') +
  px(5, 6, 6, 2, '#ff4500') +
  px(5, 8, 6, 2, '#ff4500') +
  px(6, 10, 4, 2, '#ff6b35') +
  px(7, 10, 2, 2, '#f5c542') +
  px(6, 12, 4, 2, '#ff6b35')
)

// Trophy icon
const trophyIcon = svg(
  px(5, 1, 6, 2, '#f5c542') +
  px(4, 3, 8, 4, '#f5c542') +
  px(2, 3, 2, 3, '#f5c542') +
  px(12, 3, 2, 3, '#f5c542') +
  px(5, 7, 6, 2, '#f5c542') +
  px(6, 9, 4, 1, '#d4a017') +
  px(7, 10, 2, 2, '#d4a017') +
  px(5, 12, 6, 2, '#d4a017')
)

// Clock icon (time)
const clockIcon = svg(
  px(5, 1, 6, 1, '#87CEEB') +
  px(3, 2, 10, 1, '#87CEEB') +
  px(2, 3, 12, 10, '#87CEEB') +
  px(3, 13, 10, 1, '#87CEEB') +
  px(5, 14, 6, 1, '#87CEEB') +
  px(7, 4, 2, 5, '#1a1a2e') +
  px(9, 7, 2, 2, '#1a1a2e')
)

// Scroll icon (category)
const scrollIcon = svg(
  px(4, 1, 8, 2, '#D2B48C') +
  px(3, 3, 10, 10, '#F5DEB3') +
  px(4, 13, 8, 2, '#D2B48C') +
  px(5, 5, 6, 1, '#8B4513') +
  px(5, 7, 5, 1, '#8B4513') +
  px(5, 9, 6, 1, '#8B4513')
)

// Gem icon (completionist)
const gemIcon = svg(
  px(5, 2, 6, 2, '#E0BBE4') +
  px(3, 4, 10, 2, '#957DAD') +
  px(4, 6, 8, 3, '#D291BC') +
  px(5, 9, 6, 2, '#957DAD') +
  px(6, 11, 4, 2, '#E0BBE4') +
  px(7, 13, 2, 1, '#957DAD')
)

// Shield icon (mastery)
const shieldIcon = svg(
  px(4, 1, 8, 2, '#4169E1') +
  px(3, 3, 10, 4, '#4169E1') +
  px(4, 7, 8, 3, '#4169E1') +
  px(5, 10, 6, 2, '#4169E1') +
  px(6, 12, 4, 2, '#4169E1') +
  px(7, 14, 2, 1, '#4169E1') +
  px(6, 4, 4, 3, '#f5c542')
)

// Potion icon
const potionIcon = svg(
  px(6, 1, 4, 2, '#ccc') +
  px(7, 3, 2, 2, '#ccc') +
  px(5, 5, 6, 2, '#7B68EE') +
  px(4, 7, 8, 4, '#7B68EE') +
  px(5, 11, 6, 2, '#7B68EE') +
  px(6, 13, 4, 1, '#7B68EE')
)

// Crown icon
const crownIcon = svg(
  px(2, 4, 2, 2, '#f5c542') +
  px(7, 3, 2, 2, '#f5c542') +
  px(12, 4, 2, 2, '#f5c542') +
  px(3, 6, 10, 2, '#f5c542') +
  px(3, 8, 10, 3, '#f5c542') +
  px(4, 11, 8, 2, '#d4a017') +
  px(4, 9, 2, 1, '#ff4500') +
  px(7, 9, 2, 1, '#4169E1') +
  px(10, 9, 2, 1, '#ff4500')
)

// ── Badge Definitions ──

function completedInCategory(state: UserProgress, category: string): number {
  return Object.values(state.books).filter(b => {
    return b.completed && b.bookId.startsWith(category)
  }).length
}

export const BADGES: Badge[] = [
  {
    id: 'first-read',
    name: '첫 페이지',
    description: '첫 번째 책을 완독했습니다',
    icon: bookIcon,
    check: (s) => s.totals.booksCompleted >= 1,
  },
  {
    id: 'bookworm-5',
    name: '책벌레',
    description: '5권을 완독했습니다',
    icon: starIcon,
    check: (s) => s.totals.booksCompleted >= 5,
  },
  {
    id: 'scholar-10',
    name: '학자',
    description: '10권을 완독했습니다',
    icon: trophyIcon,
    check: (s) => s.totals.booksCompleted >= 10,
  },
  {
    id: 'sage-25',
    name: '현자',
    description: '25권을 완독했습니다',
    icon: gemIcon,
    check: (s) => s.totals.booksCompleted >= 25,
  },
  {
    id: 'archmage-50',
    name: '대마법사',
    description: '50권을 완독했습니다',
    icon: crownIcon,
    check: (s) => s.totals.booksCompleted >= 50,
  },
  {
    id: 'streak-3',
    name: '3일 연속',
    description: '3일 연속 읽기 달성',
    icon: fireIcon,
    check: (s) => s.streak.longest >= 3,
  },
  {
    id: 'streak-7',
    name: '주간 독파',
    description: '7일 연속 읽기 달성',
    icon: fireIcon,
    check: (s) => s.streak.longest >= 7,
  },
  {
    id: 'dart-master',
    name: 'Dart 마스터',
    description: 'Dart 전체 완독',
    icon: shieldIcon,
    check: (s) => completedInCategory(s, 'dart') >= 23,
  },
  {
    id: 'flutter-master',
    name: 'Flutter 마스터',
    description: 'Flutter 전체 완독',
    icon: shieldIcon,
    check: (s) => completedInCategory(s, 'flutter') >= 31,
  },
  {
    id: 'react-master',
    name: 'React 마스터',
    description: 'React 전체 완독',
    icon: shieldIcon,
    check: (s) => completedInCategory(s, 'react') >= 43,
  },
  {
    id: 'time-1h',
    name: '1시간 몰입',
    description: '총 읽기 시간 1시간 달성',
    icon: clockIcon,
    check: (s) => s.totals.totalTimeMs >= 3_600_000,
  },
  {
    id: 'time-10h',
    name: '연금술사',
    description: '총 읽기 시간 10시간 달성',
    icon: potionIcon,
    check: (s) => s.totals.totalTimeMs >= 36_000_000,
  },
  {
    id: 'explorer',
    name: '탐험가',
    description: '3개 카테고리 모두 1권 이상 읽기',
    icon: scrollIcon,
    check: (s) =>
      completedInCategory(s, 'dart') >= 1 &&
      completedInCategory(s, 'flutter') >= 1 &&
      completedInCategory(s, 'react') >= 1,
  },
]

export function checkNewBadges(state: UserProgress): string[] {
  const earned = new Set(state.badges)
  return BADGES
    .filter(b => !earned.has(b.id) && b.check(state))
    .map(b => b.id)
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}
