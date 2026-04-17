export interface Room {
  id: string
  name: string
  description: string
  unlockQuest?: string   // quest id that unlocks this room (undefined = always open)
  shelves: string[]      // shelf ids in this room
  npcs: string[]         // NPC ids in this room
}

export const ROOMS: Room[] = [
  {
    id: 'main',
    name: '메인홀',
    description: '도서관의 중앙 홀. Dart, Flutter, React 서가가 있습니다.',
    shelves: ['dart', 'flutter', 'react', 'spring', 'archive'],
    npcs: ['librarian', 'scholar', 'visitor', 'researcher'],
  },
  {
    id: 'east',
    name: '동관',
    description: '백엔드와 아키텍처 영역. Java, Spring, MSA 서가가 준비 중입니다.',
    unlockQuest: 'main-3',
    shelves: [],
    npcs: [],
  },
  {
    id: 'west',
    name: '서관',
    description: '데이터와 AI 영역. Python, MySQL, LLM/AI 서가가 준비 중입니다.',
    unlockQuest: 'main-4',
    shelves: [],
    npcs: [],
  },
  {
    id: 'upper',
    name: '2층',
    description: '전설의 독서가만 입장할 수 있는 고급 영역.',
    unlockQuest: 'main-5',
    shelves: [],
    npcs: [],
  },
]

export function getRoomById(id: string): Room | undefined {
  return ROOMS.find(r => r.id === id)
}

export function isRoomUnlocked(roomId: string, unlockedRooms: string[]): boolean {
  return unlockedRooms.includes(roomId)
}
