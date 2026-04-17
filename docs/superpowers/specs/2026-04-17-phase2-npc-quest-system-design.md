# Phase 2: NPC + Quest System — Design Spec

**Date:** 2026-04-17
**Status:** APPROVED
**Depends on:** Phase 1 (completed — progress store, badges, streak, ProgressIndicator)

---

## Overview

Phase 1의 진행 추적 시스템 위에 3개 레이어를 추가한다:

1. **NPC 엔티티 + 대화 시스템** — 데이터 기반 NPC, 말풍선 UI, 진행 상태 연동 대화 분기
2. **퀘스트 시스템** — NPC별 체인 퀘스트, progress store 자동 연동, ProgressIndicator 퀘스트 탭
3. **멀티룸 + 월드맵** — wallmap 클릭으로 도서관 지도, 방 이동, 잠금/해금

---

## 1. NPC 엔티티 시스템

### 1-1. NPC 데이터 구조

```typescript
// src/data/npcs.ts
interface NPC {
  id: string;
  name: string;
  role: 'librarian' | 'scholar' | 'visitor' | 'researcher';
  room: string;                      // 'main' | 'east' | 'west' | 'upper'
  position: { x: string; y: string }; // CSS 퍼센트 기반 위치
  sprite: {
    south: string;                   // 스프라이트 경로
    north: string;
    east: string;
    west: string;
  };
  defaultDirection: 'south' | 'north' | 'east' | 'west';
  dialogueTree: DialogueNode[];
}
```

### 1-2. NPC 캐릭터 (4명)

| id | name | role | room | 위치 | 퀘스트 라인 |
|----|------|------|------|------|------------|
| librarian | 사서 | librarian | main | 중앙 테이블 | 메인 스토리 5개 |
| scholar | Dart 학자 | scholar | main | 좌측 테이블 | Dart 라인 4개 |
| visitor | Flutter 방문자 | visitor | main | 우측 테이블 | Flutter 라인 4개 |
| researcher | React 연구원 | researcher | main | React 책장 근처 | React 라인 4개 |

- `researcher` NPC는 신규 스프라이트 생성 필요 (기존 NPC와 동일 48x48 크기, 4방향)
- 스프라이트 생성: `scripts/generate-sprites.cjs` 확장 또는 수동 제작

### 1-3. 대화 시스템

```typescript
interface DialogueNode {
  id: string;
  text: string;
  condition?: DialogueCondition;      // 이 노드를 보여줄 조건
  options?: DialogueOption[];         // 선택지 (없으면 "닫기"만)
  action?: DialogueAction;           // 대화 종료 시 실행할 액션
}

interface DialogueCondition {
  type: 'quest_active' | 'quest_complete' | 'quest_not_started'
      | 'books_read_gte' | 'category_complete' | 'room_unlocked';
  target: string;                    // questId, categoryId, roomId
  value?: number;                    // books_read_gte에서 필수 (읽은 권수 기준)
}

interface DialogueOption {
  text: string;                      // 선택지 텍스트
  next: string;                      // 다음 DialogueNode id
}

interface DialogueAction {
  type: 'give_quest' | 'complete_quest' | 'unlock_room';
  payload: string;                   // questId 또는 roomId
}
```

**대화 흐름:**
1. NPC 클릭
2. `dialogueTree`에서 `condition`이 현재 상태에 맞는 첫 번째 노드 선택
3. 말풍선에 텍스트 표시 + 선택지 버튼
4. 선택지 클릭 → 다음 노드로 이동 (또는 액션 실행 후 종료)

### 1-4. 말풍선 UI

- NPC 머리 위에 픽셀아트 스타일 말풍선 렌더링
- 말풍선 구성: 텍스트 영역 + 선택지 버튼 (최대 3개)
- 말풍선 외부 클릭 시 닫기
- 퀘스트 완료 가능 NPC 위에 `!` 마커 표시
- 새 퀘스트 제공 가능 NPC 위에 `?` 마커 표시

**CSS 클래스:** `.npc-bubble`, `.npc-bubble-text`, `.npc-bubble-options`, `.npc-marker`

---

## 2. 퀘스트 시스템

### 2-1. 퀘스트 데이터 구조

```typescript
// src/data/quests.ts
interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;                     // NPC id
  chain: number;                     // 체인 내 순서 (1-based)
  prerequisite?: string;             // 선행 퀘스트 id
  requirements: QuestRequirement[];
  rewards: QuestReward[];
}

interface QuestRequirement {
  type: 'read_book' | 'read_count' | 'read_category_count'
      | 'complete_category' | 'streak_days' | 'total_books';
  target?: string;                   // bookId 또는 categoryId
  value?: number;                    // 수량
}

interface QuestReward {
  type: 'badge' | 'unlock_room' | 'title';
  value: string;                     // badgeId, roomId, 칭호 문자열
}
```

### 2-2. 퀘스트 목록 (17개)

**사서 메인 스토리 (chain: librarian-main)**

| # | id | title | 요구사항 | 보상 |
|---|-----|-------|---------|------|
| 1 | main-1 | 첫 발걸음 | 아무 책 1권 완독 | 배지: first-quest |
| 2 | main-2 | 세 갈래 길 | Dart/Flutter/React 각 1권 | 배지: explorer-quest |
| 3 | main-3 | 동쪽으로 | 아무 카테고리 10권 | 동관 해금 |
| 4 | main-4 | 서쪽으로 | 2개 카테고리 각 5권 | 서관 해금 |
| 5 | main-5 | 전설의 독서가 | 총 50권 완독 | 2층 해금 + 칭호 |

**Dart 학자 (chain: scholar-dart)**

| # | id | title | 요구사항 | 보상 |
|---|-----|-------|---------|------|
| 1 | dart-q1 | Dart의 첫 걸음 | Dart 3권 | 배지 |
| 2 | dart-q2 | 문법을 넘어서 | Dart 10권 | 배지 |
| 3 | dart-q3 | 비동기의 세계 | dart-14 완독 | 배지 |
| 4 | dart-q4 | Dart 마스터 | Dart 전체 23권 | 칭호 + 배지 |

**Flutter 방문자 (chain: visitor-flutter)**

| # | id | title | 요구사항 | 보상 |
|---|-----|-------|---------|------|
| 1 | flutter-q1 | 위젯의 세계로 | Flutter 3권 | 배지 |
| 2 | flutter-q2 | 상태를 다스리다 | Flutter 10권 | 배지 |
| 3 | flutter-q3 | 아키텍처의 눈 | flutter-21 완독 | 배지 |
| 4 | flutter-q4 | Flutter 장인 | Flutter 전체 31권 | 칭호 + 배지 |

**React 연구원 (chain: researcher-react)**

| # | id | title | 요구사항 | 보상 |
|---|-----|-------|---------|------|
| 1 | react-q1 | Hook에 걸리다 | React 3권 | 배지 |
| 2 | react-q2 | 렌더링의 비밀 | React 10권 | 배지 |
| 3 | react-q3 | 서버의 영역 | react-20 완독 | 배지 |
| 4 | react-q4 | React 현자 | React 전체 43권 | 칭호 + 배지 |

### 2-3. 퀘스트 상태 저장

```typescript
// UserProgress에 추가
interface UserProgress {
  // ... 기존 필드
  quests: Record<string, QuestState>;
  unlockedRooms: string[];           // ['main'] 기본, 해금 시 추가
  title?: string;                    // 현재 칭호
}

type QuestState = 'active' | 'completed';
// not_started = quests에 키 없음
```

### 2-4. 퀘스트-진행 연동

- `checkQuestCompletion(state, questId)`: progress store 데이터로 요구사항 자동 체크
- 조건 충족 시 해당 NPC 위에 `!` 마커 표시
- NPC 대화에서 "완료" 액션 실행 → 보상 지급 + 다음 퀘스트 해금
- ProgressIndicator에 "퀘스트" 탭: 활성 퀘스트 목록 + 진행률 바

---

## 3. 멀티룸 + 월드맵

### 3-1. 방 데이터 구조

```typescript
// src/data/rooms.ts
interface Room {
  id: string;                        // 'main' | 'east' | 'west' | 'upper'
  name: string;
  description: string;
  unlockQuest?: string;              // 이 퀘스트 완료 시 해금 (없으면 기본 개방)
  shelves: string[];                 // 이 방에 배치된 shelf id 목록
  npcs: string[];                    // 이 방에 배치된 NPC id 목록
  tiles: {
    floor: string;                   // 바닥 타일 이미지
    wall: string;                    // 벽 타일 이미지
    carpet?: string;
  };
}
```

### 3-2. 방 목록

| id | name | 해금 조건 | 책장 | NPC | 콘텐츠 상태 |
|----|------|----------|------|-----|-----------|
| main | 메인홀 | 기본 개방 | dart, flutter, react | librarian, scholar, visitor, researcher | 97권 |
| east | 동관 | main-3 완료 | spring, archive | (없음, 준비 중 NPC 대화) | 빈 방 |
| west | 서관 | main-4 완료 | (없음) | (없음, 준비 중 NPC 대화) | 빈 방 |
| upper | 2층 | main-5 완료 | (없음) | (없음, 준비 중 NPC 대화) | 빈 방 |

### 3-3. 월드맵 UI

- `wallmap.png` 클릭 → `WorldMap` 오버레이 컴포넌트
- 도서관 전체 평면도를 픽셀아트로 표시 (4개 방 배치)
- 각 방 클릭 → `LibraryRoom`의 `roomId` state 전환
- 잠긴 방: 어둡게 + 자물쇠 아이콘 + "퀘스트 '{questTitle}' 완료 필요" 툴팁
- 현재 위치: 깜빡이는 마커

### 3-4. LibraryRoom 확장

- `roomId` state 추가 (기본값: 'main')
- `rooms.ts`에서 현재 방 데이터 로드 → 타일/가구/NPC 렌더링
- 메인홀은 현재 배치 유지
- 빈 방(동관/서관/2층)은 최소 가구 + "준비 중입니다" 안내 NPC 대화

---

## 4. 파일 구조

### 신규 파일

```
src/data/npcs.ts                    — NPC 정의 (4명)
src/data/quests.ts                  — 퀘스트 정의 (17개)
src/data/rooms.ts                   — 방 정의 (4개)
src/data/dialogues/librarian.ts     — 사서 대화 트리
src/data/dialogues/scholar.ts       — 학자 대화 트리
src/data/dialogues/visitor.ts       — 방문자 대화 트리
src/data/dialogues/researcher.ts    — 연구원 대화 트리
src/components/SpeechBubble.tsx     — 말풍선 UI
src/components/NPCMarker.tsx        — NPC 위 ?/! 마커
src/components/WorldMap.tsx         — 월드맵 오버레이
src/store/questProgress.ts          — 퀘스트 상태 관리 로직
src/data/npcs.test.ts               — NPC 대화 분기 테스트
src/data/quests.test.ts             — 퀘스트 요구사항 체크 테스트
src/data/rooms.test.ts              — 해금 조건 테스트
public/sprites/researcher/          — 연구원 NPC 스프라이트 (4방향)
```

### 수정 파일

```
src/store/progress.ts               — UserProgress에 quests, unlockedRooms, title 필드 추가
src/store/ProgressContext.tsx        — 퀘스트 관련 액션 추가
src/components/ProgressIndicator.tsx — 퀘스트 탭 추가
src/components/LibraryRoom.tsx       — roomId state, NPC 클릭 핸들러, wallmap 클릭
src/index.css                        — 말풍선, 마커, 월드맵 스타일
```

---

## 5. 테스트

| 파일 | 항목 |
|------|------|
| quests.test.ts | 요구사항 체크 로직 (read_book, read_count, complete_category 등), 체인 의존성, 보상 지급 |
| npcs.test.ts | 조건별 대화 노드 선택, 액션 실행 (give_quest, complete_quest, unlock_room) |
| rooms.test.ts | 해금 조건 검증, 기본 개방 방 확인 |

---

## 6. 엣지 케이스

- **이미 조건 충족:** 퀘스트 수락 시 이미 요구사항 달성 → 즉시 완료 가능 대화 표시
- **localStorage 초기화:** 퀘스트/해금 리셋 → 모든 방 잠김, 메인홀부터 재시작
- **신규 퀘스트 추가:** 기존 사용자에게 새 퀘스트가 `not_started`로 표시, 기존 완료 상태 유지
- **progress store 마이그레이션:** v2 → v3, `quests`와 `unlockedRooms` 필드 기본값 추가
