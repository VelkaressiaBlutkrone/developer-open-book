# Phase 3: Animation + Sound — Design Spec

**Date:** 2026-04-17
**Status:** APPROVED
**Depends on:** Phase 2 (completed — NPC, quests, world map, speech bubble)

---

## Overview

도서관에 생명을 불어넣는 4개 레이어:

1. **타일맵 애니메이션** — Canvas 기반 먼지 파티클 + 촛불 강화
2. **NPC 시간대별 이동** — 실제 로컬 시계(24h) 기반 3개 시간대 위치 변경
3. **사운드 시스템** — Web Audio API 8bit 효과음 5개 + 앰비언트 배경음 1개
4. **시각 효과** — 픽셀아트 RPG 스타일 이벤트 이펙트

---

## 1. 타일맵 애니메이션

### 1-1. DustCanvas (먼지 파티클)

**구현:** `src/components/DustCanvas.tsx`

- LibraryRoom 위에 `position: absolute; inset: 0` 투명 `<canvas>` 레이어
- `pointer-events: none` — 클릭 투과
- requestAnimationFrame 루프로 50~100개 파티클 시뮬레이션
- 파티클 속성:
  - 위치: (x, y) 랜덤 초기화
  - 크기: 1~3px
  - 속도: vx ±0.1~0.3, vy -0.05~-0.2 (느린 상승 부유)
  - 투명도: 0.1~0.4
  - 색상: `rgba(255, 220, 150, alpha)` (따뜻한 황금톤)
- 화면 밖으로 나간 파티클은 하단에서 리스폰
- `celebrateEffect()` 메서드 노출: 특정 위치에서 별 파티클 5개 폭발 (시각 효과용)

### 1-2. 촛불 애니메이션 강화

기존 `candle-flicker`에 미세한 크기 변화 추가:

```css
@keyframes candle-flicker {
  0% { filter: brightness(1); transform: scale(1); }
  25% { filter: brightness(1.15); transform: scale(1.03); }
  50% { filter: brightness(0.95); transform: scale(0.97); }
  75% { filter: brightness(1.1); transform: scale(1.02); }
  100% { filter: brightness(1.05); transform: scale(1); }
}
```

---

## 2. NPC 시간대별 이동

### 2-1. 시간대 정의

| 시간대 | 시간 | 분위기 |
|--------|------|--------|
| morning | 06:00~11:59 | 밝은 아침, 모든 NPC 활동 |
| afternoon | 12:00~17:59 | 오후, NPC 위치 변경 |
| night | 18:00~05:59 | 밤, 일부 NPC 부재 |

### 2-2. NPC별 스케줄

`npcs.ts`의 NPC 인터페이스에 `schedule` 필드 추가:

```typescript
interface NPCSchedule {
  period: 'morning' | 'afternoon' | 'night'
  position: { top: string; left?: string; right?: string; marginLeft?: number; marginRight?: number }
  direction: 'south' | 'north' | 'east' | 'west'
  absent?: boolean  // true면 이 시간대에 표시 안 함
}
```

| NPC | morning | afternoon | night |
|-----|---------|-----------|-------|
| 사서 | 중앙 테이블 (south) | React 책장 근처 (west) | 입구 근처 (south) |
| 학자 | Dart 서가 (east) | 좌측 테이블 (east) | 부재 |
| 방문자 | 입구 근처 (south) | Flutter 서가 (west) | 우측 테이블 (west) |
| 연구원 | React 책장 (south) | React 책장 (south) | React 책장 (south) |

### 2-3. 시간 기반 위치 결정

`getTimeOfDay()` 함수: 현재 로컬 시간 → `'morning' | 'afternoon' | 'night'` 반환.

LibraryRoom에서 1분마다 시간 체크 → NPC 위치/방향 업데이트.

### 2-4. NPC 아이들 애니메이션 강화

```css
.lr-npc {
  animation: npc-idle 3s ease-in-out infinite, npc-sway 5s ease-in-out infinite;
}

@keyframes npc-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1deg); }
}
```

### 2-5. 말풍선 팝업 애니메이션

기존 `bubble-in`을 바운스로 강화:

```css
@keyframes bubble-in {
  0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
  60% { opacity: 1; transform: translateX(-50%) scale(1.05); }
  100% { transform: translateX(-50%) scale(1); }
}
```

---

## 3. 사운드 시스템

### 3-1. 사운드 컨텍스트

**파일:** `src/audio/SoundContext.tsx`

```typescript
interface SoundAPI {
  mode: 'muted' | 'effects' | 'full'  // 음소거 / 효과음만 / 전체
  setMode: (mode: SoundMode) => void
  play: (sound: SoundName) => void     // 효과음 재생
}
```

- `SoundProvider`로 App 래핑
- mode는 localStorage(`dev-open-book-sound`)에 저장
- 기본값: `'muted'` (첫 접속 시 소리 안 남, 사용자가 켜야 함)

### 3-2. 효과음 합성

**파일:** `src/audio/synth.ts`

Web Audio API의 OscillatorNode + GainNode로 8bit 스타일 사운드 합성:

| 이름 | 설명 | 파형 | 주파수 | 길이 |
|------|------|------|--------|------|
| `bookOpen` | 책 열기 | square | C5→E5 상승 | 150ms |
| `questAccept` | 퀘스트 수락 | square | C5→E5→G5 아르페지오 | 300ms |
| `questComplete` | 퀘스트 완료 | square | C5→E5→G5→C6 팡파르 | 500ms |
| `badgeEarn` | 배지 획득 | triangle | A5↔C6 트릴 | 400ms |
| `npcTalk` | NPC 대화 시작 | sine | G4 짧은 핑 | 80ms |

각 함수는 AudioContext를 받아서 즉석 재생. 동시 재생 가능.

### 3-3. 앰비언트 배경음

**파일:** `public/audio/ambient-library.mp3`

- freesound.org에서 CC0 라이센스 도서관/실내 앰비언트 다운로드
- Fallback: MP3를 못 구하면 `synth.ts`에 브라운 노이즈 + 가끔 틱 소리로 대체
- 루프 재생, 볼륨 0.15
- `<audio>` 엘리먼트 또는 AudioContext로 재생
- mode가 `'full'`일 때만 재생

### 3-4. SoundToggle 컴포넌트

**파일:** `src/components/SoundToggle.tsx`

- 헤더에 스피커 아이콘 버튼 (ThemeToggle 옆)
- 클릭 시 순환: muted → effects → full → muted
- 아이콘: 🔇 / 🔊 / 🎵
- Layout.tsx와 LibraryRoom 모두에서 표시

### 3-5. 사운드 트리거 포인트

| 이벤트 | 사운드 | 위치 |
|--------|--------|------|
| 책장 클릭 → ShelfModal 열림 | `bookOpen` | LibraryRoom |
| NPC 클릭 → 말풍선 열림 | `npcTalk` | LibraryRoom |
| 퀘스트 수락 (give_quest 액션) | `questAccept` | LibraryRoom |
| 퀘스트 완료 (complete_quest 액션) | `questComplete` | LibraryRoom |
| 배지 획득 (checkNewBadges) | `badgeEarn` | ProgressContext |
| 책 완독 (markComplete) | `bookOpen` | ProgressContext |

---

## 4. 시각 효과 (픽셀아트 RPG 스타일)

### 4-1. 완독 축하

- DustCanvas의 `celebrateEffect(x, y)` 호출
- 짧은 화면 플래시: `.lr-flash` 오버레이 (흰색, 200ms fade-out)
- 픽셀 별 파티클 3~5개: 지정 위치에서 위로 솟아오르며 페이드 아웃
- `questComplete` 사운드 동시 재생
- 트리거: BookReader/BookPage에서 완독 감지 시

### 4-2. 퀘스트 완료

- 말풍선 위 별 파티클 3개 (DustCanvas celebrate)
- `questComplete` 사운드
- 트리거: complete_quest 대화 액션 실행 시

### 4-3. 영역 해금

- WorldMap에서 해금된 방에 글로우 확산 (CSS animation, 1초)
- `questComplete` 사운드
- 트리거: unlock_room 액션 실행 시

### 4-4. 스트릭 갱신

- ProgressIndicator의 🔥 아이콘에 CSS 펄스 (scale 1→1.3→1, 0.5초)
- `badgeEarn` 사운드
- 트리거: 스트릭 카운터 증가 시

---

## 5. 파일 구조

### 신규 파일
```
src/components/DustCanvas.tsx       — Canvas 먼지 파티클 + celebrate 이펙트
src/audio/synth.ts                  — Web Audio API 8bit 효과음 합성 (5개)
src/audio/SoundContext.tsx          — 사운드 상태 관리 (muted/effects/full)
src/components/SoundToggle.tsx      — 헤더 스피커 토글 버튼
public/audio/ambient-library.mp3    — 앰비언트 배경음 (CC0)
```

### 수정 파일
```
src/data/npcs.ts                    — schedule 필드 추가 (3시간대 × 4NPC)
src/components/LibraryRoom.tsx      — DustCanvas 렌더링, 시간대별 NPC 위치, 사운드 트리거
src/store/ProgressContext.tsx       — 배지/완독 시 사운드 재생
src/components/Layout.tsx           — SoundToggle 추가
src/App.tsx                         — SoundProvider 래핑
src/index.css                       — 애니메이션 강화, 플래시 효과
```

---

## 6. 성능 고려

- DustCanvas: `document.hidden`일 때 렌더 루프 정지
- 앰비언트 오디오: visibility change 시 pause/resume
- 파티클 수: 모바일에서 30개로 제한 (`window.innerWidth < 768`)
- 사운드: AudioContext는 첫 사용자 인터랙션 후 초기화 (브라우저 정책)

---

## 7. 테스트

| 파일 | 항목 |
|------|------|
| `synth.test.ts` | 각 사운드 함수가 에러 없이 호출 가능한지 (AudioContext mock) |
| `npcs.test.ts` (확장) | getTimeOfDay, 스케줄 기반 위치 반환 |
