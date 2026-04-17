# Phase 2: NPC + Quest System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NPC 대화(말풍선) + 17개 체인 퀘스트 + 멀티룸 월드맵을 구현하여 도서관을 살아있는 RPG 학습 세계로 만든다.

**Architecture:** 데이터 레이어(npcs.ts, quests.ts, rooms.ts, dialogues/*.ts)가 순수 데이터를 정의하고, questProgress.ts가 progress store와 연동하여 퀘스트 상태를 관리한다. UI는 SpeechBubble(말풍선), NPCMarker(!/? 표시), WorldMap(지도 오버레이) 3개 컴포넌트로 구성. LibraryRoom에 roomId state를 추가하여 멀티룸을 지원한다.

**Tech Stack:** React 19, TypeScript, Vitest, CSS (기존 index.css 확장)

**Spec:** `docs/superpowers/specs/2026-04-17-phase2-npc-quest-system-design.md`

---

## File Structure

### New Files
```
src/data/npcs.ts                    — NPC 4명 정의 (id, name, role, position, sprite, defaultDirection)
src/data/quests.ts                  — 퀘스트 17개 정의 + 요구사항 체크 함수
src/data/rooms.ts                   — 방 4개 정의 (id, name, unlockQuest, shelves, npcs, tiles)
src/data/dialogues/librarian.ts     — 사서 대화 트리 (~15 nodes)
src/data/dialogues/scholar.ts       — 학자 대화 트리 (~12 nodes)
src/data/dialogues/visitor.ts       — 방문자 대화 트리 (~12 nodes)
src/data/dialogues/researcher.ts    — 연구원 대화 트리 (~12 nodes)
src/store/questProgress.ts          — 퀘스트 상태 관리 (activate, complete, checkRequirements)
src/components/SpeechBubble.tsx     — 말풍선 UI (텍스트 + 선택지)
src/components/NPCMarker.tsx        — NPC 위 !/? 마커
src/components/WorldMap.tsx         — 월드맵 오버레이
src/data/quests.test.ts             — 퀘스트 요구사항 체크 테스트
src/store/questProgress.test.ts     — 퀘스트 상태 관리 테스트
src/data/rooms.test.ts              — 방 해금 조건 테스트
public/sprites/researcher/rotations/*.png — 연구원 NPC 스프라이트 (4방향)
```

### Modified Files
```
src/store/progress.ts               — UserProgress에 quests, unlockedRooms, title 추가
src/store/migrate.ts                — v2 → v3 마이그레이션
src/store/ProgressContext.tsx        — 퀘스트 액션 추가 (activateQuest, completeQuest, unlockRoom)
src/components/ProgressIndicator.tsx — 퀘스트 탭 추가
src/components/LibraryRoom.tsx       — roomId state, NPC 클릭, wallmap 클릭, 마커 렌더링
src/index.css                        — 말풍선, 마커, 월드맵 스타일
```

---

## Task 1: Progress Store 확장 (quests, unlockedRooms, title)

**Files:**
- Modify: `src/store/progress.ts`
- Modify: `src/store/migrate.ts`
- Test: `src/store/progress.test.ts`

- [ ] **Step 1: Write failing tests for new UserProgress fields**

Add to `src/store/progress.test.ts`:

```typescript
describe('v3 UserProgress fields', () => {
  it('loadProgress returns quests, unlockedRooms, title fields', () => {
    const state = loadProgress()
    expect(state.quests).toEqual({})
    expect(state.unlockedRooms).toEqual(['main'])
    expect(state.title).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/store/progress.test.ts`
Expected: FAIL — `quests` and `unlockedRooms` not on UserProgress

- [ ] **Step 3: Update UserProgress type and createDefault**

In `src/store/progress.ts`, update the interface:

```typescript
export interface UserProgress {
  version: 3
  books: Record<string, ReadingProgress>
  badges: string[]
  streak: {
    current: number
    lastReadDate: string
    longest: number
  }
  totals: {
    booksCompleted: number
    totalTimeMs: number
  }
  quests: Record<string, 'active' | 'completed'>
  unlockedRooms: string[]
  title?: string
}
```

Update `createDefault()`:

```typescript
function createDefault(): UserProgress {
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
```

Update `loadProgress()` to accept version 2 or 3:

```typescript
export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefault()
    const parsed = JSON.parse(raw)
    if (parsed.version === 3) return parsed as UserProgress
    if (parsed.version === 2) return migrateV2toV3(parsed)
    return createDefault()
  } catch {
    return createDefault()
  }
}
```

- [ ] **Step 4: Update migrate.ts with v2→v3 migration**

In `src/store/migrate.ts`:

```typescript
import type { UserProgress } from './progress'

const STORAGE_KEY = 'dev-open-book-progress'

export function migrateIfNeeded(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed.version && parsed.version < 2) {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function migrateV2toV3(v2: Record<string, unknown>): UserProgress {
  return {
    ...(v2 as unknown as UserProgress),
    version: 3,
    quests: {},
    unlockedRooms: ['main'],
  }
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npx vitest run src/store/progress.test.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/store/progress.ts src/store/migrate.ts src/store/progress.test.ts
git commit -m "feat: UserProgress v3 — quests, unlockedRooms, title 필드 추가"
```

---

## Task 2: Quest Data + Requirements Checker

**Files:**
- Create: `src/data/quests.ts`
- Create: `src/data/quests.test.ts`

- [ ] **Step 1: Write failing tests for quest requirement checking**

Create `src/data/quests.test.ts`:

```typescript
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
    state.books['dart-01'] = { bookId: 'dart-01', lastReadAt: 0, scrollPosition: 1, completed: true, timeSpentMs: 0 }
    state.books['dart-02'] = { bookId: 'dart-02', lastReadAt: 0, scrollPosition: 1, completed: true, timeSpentMs: 0 }
    expect(checkRequirements('dart-q1', state)).toBe(false)
    state.books['dart-03'] = { bookId: 'dart-03', lastReadAt: 0, scrollPosition: 1, completed: true, timeSpentMs: 0 }
    expect(checkRequirements('dart-q1', state)).toBe(true)
  })
})

describe('getAvailableQuests', () => {
  it('returns main-1 and first chain quests for empty state', () => {
    const state = emptyState()
    const available = getAvailableQuests(state)
    const ids = available.map(q => q.id)
    expect(ids).toContain('main-1')
    expect(ids).toContain('dart-q1')
    expect(ids).toContain('flutter-q1')
    expect(ids).toContain('react-q1')
    expect(ids).not.toContain('main-2') // has prerequisite main-1
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/data/quests.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement quests.ts**

Create `src/data/quests.ts` with all 17 quests, `getQuestById`, `checkRequirements`, and `getAvailableQuests`. Each quest has id, title, description, giver, chain, prerequisite, requirements[], rewards[].

`checkRequirements` reads the progress state and checks each requirement:
- `total_books`: `state.totals.booksCompleted >= value`
- `read_category_count`: count `state.books` entries where `bookId.startsWith(target)` and `completed === true`, compare to `value`
- `read_book`: `state.books[target]?.completed === true`
- `complete_category`: all books in category completed

`getAvailableQuests`: return quests where prerequisite is completed (or none) AND quest is not active/completed.

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/data/quests.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/quests.ts src/data/quests.test.ts
git commit -m "feat: 퀘스트 데이터 17개 + 요구사항 체크 로직"
```

---

## Task 3: Quest Progress Store

**Files:**
- Create: `src/store/questProgress.ts`
- Create: `src/store/questProgress.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/store/questProgress.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { activateQuest, completeQuest, unlockRoom, type UserProgress } from './questProgress'

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
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/store/questProgress.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement questProgress.ts**

Create `src/store/questProgress.ts`:

```typescript
import type { UserProgress } from './progress'

export type { UserProgress }

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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/store/questProgress.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/store/questProgress.ts src/store/questProgress.test.ts
git commit -m "feat: 퀘스트 상태 관리 — activate, complete, unlockRoom"
```

---

## Task 4: NPC Data + Dialogue Trees

**Files:**
- Create: `src/data/npcs.ts`
- Create: `src/data/dialogues/librarian.ts`
- Create: `src/data/dialogues/scholar.ts`
- Create: `src/data/dialogues/visitor.ts`
- Create: `src/data/dialogues/researcher.ts`

- [ ] **Step 1: Create NPC type definitions and data in `src/data/npcs.ts`**

Define `NPC`, `DialogueNode`, `DialogueCondition`, `DialogueOption`, `DialogueAction` interfaces. Define 4 NPCs with id, name, role, room, position, sprite paths, defaultDirection. Export `getNPCById`, `getNPCsByRoom`, `findDialogueNode(npc, state)`.

`findDialogueNode` iterates `npc.dialogueTree` and returns the first node whose `condition` matches the current `UserProgress` state. If no condition, it's a fallback.

- [ ] **Step 2: Create librarian dialogue tree in `src/data/dialogues/librarian.ts`**

Export `librarianDialogue: DialogueNode[]` with ~15 nodes covering:
- Default greeting (no quests active)
- main-1 offer, main-1 completion
- main-2 offer, main-2 completion
- main-3 offer (unlock east), main-3 completion
- main-4 offer (unlock west), main-4 completion
- main-5 offer (unlock upper), main-5 completion
- Post-completion congratulations

Each node has `condition` to select based on quest state.

- [ ] **Step 3: Create scholar, visitor, researcher dialogue trees**

Same pattern per NPC. Each has ~12 nodes for their 4-quest chain:
- Default greeting
- q1 offer → q1 complete
- q2 offer → q2 complete
- q3 offer → q3 complete
- q4 offer → q4 complete
- Post-completion

- [ ] **Step 4: Run build to verify no type errors**

Run: `npx tsc -b`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/data/npcs.ts src/data/dialogues/
git commit -m "feat: NPC 4명 데이터 + 대화 트리 (사서/학자/방문자/연구원)"
```

---

## Task 5: Room Data + Unlock Tests

**Files:**
- Create: `src/data/rooms.ts`
- Create: `src/data/rooms.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/data/rooms.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ROOMS, getRoomById, isRoomUnlocked } from './rooms'

describe('ROOMS', () => {
  it('has 4 rooms', () => {
    expect(ROOMS.length).toBe(4)
  })
  it('main is always unlocked', () => {
    expect(isRoomUnlocked('main', ['main'])).toBe(true)
  })
  it('east is locked by default', () => {
    expect(isRoomUnlocked('east', ['main'])).toBe(false)
  })
  it('east is unlocked when in list', () => {
    expect(isRoomUnlocked('east', ['main', 'east'])).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/data/rooms.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement rooms.ts**

Create `src/data/rooms.ts` with 4 rooms (main, east, west, upper), `getRoomById`, `isRoomUnlocked`.

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/data/rooms.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/rooms.ts src/data/rooms.test.ts
git commit -m "feat: 방 데이터 4개 + 해금 조건 체크"
```

---

## Task 6: ProgressContext 퀘스트 액션 통합

**Files:**
- Modify: `src/store/ProgressContext.tsx`

- [ ] **Step 1: Add quest actions to ProgressAPI**

Extend the `ProgressAPI` interface and `ProgressProvider`:

```typescript
interface ProgressAPI {
  state: UserProgress
  trackScroll: (bookId: string, scrollPos: number) => void
  trackTime: (bookId: string, deltaMs: number) => void
  checkCompletion: (bookId: string, markdown: string) => void
  activateQuest: (questId: string) => void
  completeQuest: (questId: string) => void
  unlockRoom: (roomId: string) => void
  setTitle: (title: string) => void
}
```

Import from `questProgress.ts` and wire each action to `setState()`.

- [ ] **Step 2: Run build to verify no type errors**

Run: `npx tsc -b`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/store/ProgressContext.tsx
git commit -m "feat: ProgressContext에 퀘스트 액션 (activate, complete, unlock, setTitle)"
```

---

## Task 7: SpeechBubble + NPCMarker 컴포넌트

**Files:**
- Create: `src/components/SpeechBubble.tsx`
- Create: `src/components/NPCMarker.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create SpeechBubble component**

`src/components/SpeechBubble.tsx`:

Props: `text: string`, `options?: { text: string; onClick: () => void }[]`, `onClose: () => void`, `position: { x: string; y: string }`.

Renders a pixel-art styled speech bubble above the NPC. Tail pointing down. Options as buttons. Click outside to close.

- [ ] **Step 2: Create NPCMarker component**

`src/components/NPCMarker.tsx`:

Props: `type: '!' | '?' | null`.

Renders a bouncing marker above the NPC sprite. `!` = quest completable (gold). `?` = new quest available (silver). `null` = no marker.

- [ ] **Step 3: Add CSS styles**

Add to `src/index.css`:

```css
/* Speech Bubble */
.speech-bubble { ... }
.speech-bubble-tail { ... }
.speech-bubble-text { ... }
.speech-bubble-options { ... }
.speech-bubble-option { ... }

/* NPC Marker */
.npc-marker { ... }
.npc-marker-quest { animation: marker-bounce ... }
@keyframes marker-bounce { ... }
```

Pixel-art styling: sharp borders, 2px outline, dark background with light text. Matches existing library aesthetic.

- [ ] **Step 4: Run build to verify**

Run: `npx tsc -b`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/SpeechBubble.tsx src/components/NPCMarker.tsx src/index.css
git commit -m "feat: SpeechBubble 말풍선 + NPCMarker !/? 컴포넌트"
```

---

## Task 8: LibraryRoom NPC 클릭 + 대화 통합

**Files:**
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Add NPC click handler and dialogue state**

Add to LibraryRoom:
- `const [activeNPC, setActiveNPC] = useState<string | null>(null)` — currently talking NPC id
- `const [dialogueNode, setDialogueNode] = useState<DialogueNode | null>(null)` — current dialogue
- Import `NPCs` from `npcs.ts`, `findDialogueNode` for selecting dialogue
- Make NPC `<img>` elements clickable with `onClick={() => handleNPCClick(npcId)}`
- `handleNPCClick`: find NPC → `findDialogueNode(npc, state)` → `setDialogueNode`
- Render `<SpeechBubble>` when `dialogueNode` is set
- Render `<NPCMarker>` on each NPC based on quest availability

- [ ] **Step 2: Handle dialogue actions**

When a dialogue action fires:
- `give_quest`: call `activateQuest(questId)`
- `complete_quest`: call `completeQuest(questId)`, process rewards (badges, unlock, title)
- `unlock_room`: call `unlockRoom(roomId)`

- [ ] **Step 3: Run build + take screenshot to verify**

Run: `npm run build`
Run: puppeteer screenshot script to capture home with NPC markers

- [ ] **Step 4: Commit**

```bash
git add src/components/LibraryRoom.tsx
git commit -m "feat: LibraryRoom NPC 클릭 → 말풍선 대화 + 퀘스트 수락/완료"
```

---

## Task 9: ProgressIndicator 퀘스트 탭

**Files:**
- Modify: `src/components/ProgressIndicator.tsx`

- [ ] **Step 1: Add tab state and quest tab**

Add `const [tab, setTab] = useState<'stats' | 'quests'>('stats')` to ProgressIndicator.

Add tab buttons at top of panel. Quest tab shows:
- Active quests with progress bar (requirements met / total)
- Completed quests (collapsed, count only)
- Available quests (not yet accepted, from `getAvailableQuests`)

- [ ] **Step 2: Run build + screenshot to verify**

Run: `npm run build`
Verify panel shows both tabs.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressIndicator.tsx
git commit -m "feat: ProgressIndicator에 퀘스트 탭 추가"
```

---

## Task 10: WorldMap 컴포넌트

**Files:**
- Create: `src/components/WorldMap.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create WorldMap component**

`src/components/WorldMap.tsx`:

Props: `currentRoom: string`, `unlockedRooms: string[]`, `onSelectRoom: (roomId: string) => void`, `onClose: () => void`.

Renders a fullscreen overlay with a pixel-art floor plan of the library:
- 4 rooms arranged as: main (center), east (right), west (left), upper (top)
- Each room is a clickable box with name label
- Unlocked: bright, clickable → `onSelectRoom(roomId)`
- Locked: dark + 🔒 icon + tooltip showing required quest
- Current room: blinking marker

- [ ] **Step 2: Add CSS styles**

```css
.world-map-overlay { ... }
.world-map { ... }
.world-map-room { ... }
.world-map-room.locked { ... }
.world-map-room.current { ... }
.world-map-lock-icon { ... }
```

- [ ] **Step 3: Integrate into LibraryRoom**

Make existing `wallmap.png` clickable → `setShowWorldMap(true)`.
Render `<WorldMap>` when state is true.
`onSelectRoom` → `setCurrentRoom(roomId)`.

- [ ] **Step 4: Run build + screenshot**

Run: `npm run build`
Screenshot: click wallmap → world map overlay

- [ ] **Step 5: Commit**

```bash
git add src/components/WorldMap.tsx src/components/LibraryRoom.tsx src/index.css
git commit -m "feat: WorldMap 월드맵 — wallmap 클릭으로 방 이동/해금 확인"
```

---

## Task 11: 멀티룸 렌더링

**Files:**
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Add roomId state and room-based rendering**

Add `const [currentRoom, setCurrentRoom] = useState('main')`.

Load room data from `rooms.ts`. Conditionally render:
- `main`: current full layout (shelves, furniture, NPCs)
- `east`/`west`/`upper`: minimal layout with floor/wall tiles + "준비 중" message

- [ ] **Step 2: Render room-specific NPCs**

Filter NPCs by `npc.room === currentRoom` and render only those.

- [ ] **Step 3: Run build + screenshot for each room**

Navigate to each room via WorldMap and screenshot.

- [ ] **Step 4: Commit**

```bash
git add src/components/LibraryRoom.tsx
git commit -m "feat: 멀티룸 렌더링 — 메인/동관/서관/2층 전환"
```

---

## Task 12: Researcher NPC 스프라이트 생성

**Files:**
- Modify: `scripts/generate-sprites.cjs`
- Create: `public/sprites/researcher/rotations/*.png`

- [ ] **Step 1: Add researcher sprite generation to script**

Extend `scripts/generate-sprites.cjs` to generate a 48×48 researcher NPC with 4 rotations. Use blue/purple palette (React 테마) to differentiate from existing NPCs (사서=dark blue, 학자=brown, 방문자=green).

- [ ] **Step 2: Run script**

Run: `node scripts/generate-sprites.cjs`
Verify: `public/sprites/researcher/rotations/south.png` etc. exist

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-sprites.cjs public/sprites/researcher/
git commit -m "assets: React 연구원 NPC 스프라이트 4방향 생성"
```

---

## Task 13: 전체 통합 테스트 + 빌드 확인

**Files:**
- All test files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS (기존 41 + 신규 ~20 = ~61 tests)

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: No errors, bundle size reasonable

- [ ] **Step 3: Manual QA with puppeteer screenshots**

1. Home → NPC 마커 보이는지
2. NPC 클릭 → 말풍선
3. 퀘스트 수락 → ProgressIndicator 퀘스트 탭
4. wallmap 클릭 → 월드맵
5. 잠긴 방 표시

- [ ] **Step 4: Update worklog**

Update `docs/worklog.md` with Phase 2 completion.

- [ ] **Step 5: Final commit**

```bash
git add docs/worklog.md
git commit -m "docs: Phase 2 NPC + Quest System 완료"
```
