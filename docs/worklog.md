# 작업 이력 (Worklog)

이 문서는 세션 간 작업 연속성을 위한 단일 소스. 새 세션에서 이 문서를 읽으면 현재 상태를 즉시 파악할 수 있다.

---

## 현재 상태

**Phase 1: Foundation — Lane A/B/D/E 완료, Lane C/G 미완료**
- Lane A (콘텐츠 마이그레이션 + fetch 전환 + 동적 라우트): 완료 ✅
- Lane B (books.ts + shelves.ts 리팩토링): 완료 ✅
- Lane C (BookPage fetch 전환): Lane A에 통합 완료 ✅
- Lane D (번들 최적화): 완료 ✅ (993KB → 418KB, 57% 감소)
- Lane E (dead code 정리): 완료 ✅ (170,460줄 삭제)
- **Lane C-진행추적 (1-E): 미완료** ← 다음 작업
- **Lane G (테스트): 미완료** ← 그 다음 작업

---

## v2 고도화 전체 로드맵

```
Phase 1: Foundation (콘텐츠 아키텍처 + 진행 추적)     ← 현재 위치
Phase 2: NPC + 퀘스트 시스템
Phase 3: 애니메이션 + 사운드
Phase 4: AI 튜터 NPC
```

디자인 문서: `docs/design/v2-living-pixel-library.md`

---

## Phase 1 태스크 목록

### 1-A. 콘텐츠 마이그레이션 ✅ (2026-04-16, `7a1f391`)
- [x] 3개 폴더 diff 확인 → src/content/(98개) canonical 확인
- [x] public/content/에 src/content/ 최신 파일 복사
- [x] src/content/ 제거 (98개 MD 파일)
- [x] content/ (루트) 제거 (68개 MD 파일)

### 1-B. books.ts + shelves.ts 리팩토링 ✅ (2026-04-16, `7a1f391`)
- [x] books.ts: slug 필드 추가, getBookBySlug/getBooksByShelf 헬퍼
- [x] shelves.ts 신규 생성 (id, name, icon, color, sortOrder)
- [x] Book.category 타입 확장 (spring/archive 추가)
- [x] LibraryRoom.tsx: SPINE_COLORS/seedHash 중복 제거 → books.ts import
- [x] Layout.tsx: SHELF_LABELS 제거 → shelves.ts import

### 1-C. BookPage fetch 전환 + 동적 라우트 ✅ (2026-04-16, `7a1f391`)
- [x] useContent.ts 훅 생성 (BOOKS 기반 fetch + 로딩/에러 상태)
- [x] BookPage.tsx: import.meta.glob → useContent 훅
- [x] BookReader.tsx: import.meta.glob → useContent 훅
- [x] routes.ts: 124줄 → 31줄 (BOOKS.map() 자동 생성)
- [x] dart-*.tsx 24개 페이지 제거

### 1-D. Dead code 정리 ✅ (2026-04-16, `7a1f391`)
- [x] libraryMap.ts, tiles.ts 제거
- [x] PixelLibrary.tsx, TileRenderer.tsx, ShelfView.tsx, useStepSimulator.ts 제거
- [x] pixel-library.css 1060줄 미사용 클래스 제거
- [x] MarkdownRenderer.tsx 하드코딩 경로 수정

### 1-E. 진행 추적 시스템 ← **미완료, 다음 작업**
- [ ] src/store/progress.ts 신규 생성
  - UserProgress 인터페이스 (version, books, badges, streak, totals)
  - ReadingProgress 인터페이스 (bookId, lastReadAt, scrollPosition, completed, timeSpentMs)
  - localStorage 저장/로드/마이그레이션
  - 완독 감지: max(30초, 추정읽기시간 50%) + 스크롤 90%
  - 짧은 문서(500단어 미만): 스크롤 바닥 도달만으로 완독
- [ ] src/store/migrate.ts: 구 형식 localStorage 키 → 신 형식 변환
- [ ] ProgressContext: React Context로 앱 전역 접근
- [ ] BookPage/BookReader에서 스크롤 위치 자동 저장
- [ ] 배지 시스템 (최소 10개, 픽셀 아트 SVG 아이콘)
- [ ] 스트릭 카운터 (일간 연속 읽기)
- [ ] Layout.tsx 헤더에 진행률/스트릭 표시

### 1-F. 번들 최적화 ✅ (2026-04-16, `7a1f391`)
- [x] 19개 언어 사용 조사 완료 (dart 874, jsx 379, js 70 ...)
- [x] PrismLight + 19개 언어 선별 import (300개+ → 19개)
- [x] 결과: 993KB → 418KB (57% 감소), 초기 로드 235KB

### 1-G. 테스트 인프라
- [ ] Vitest 설치 + vitest.config.ts
- [ ] progress.ts 유닛 테스트 (읽기 저장/로드, 완독 감지, 스트릭 계산, 마이그레이션)
- [ ] books.ts 유닛 테스트 (getBookBySlug, getBooksByShelf, getBookVisual)
- [ ] useContent 훅 테스트 (fetch 성공/404/네트워크 오류)

---

## 병렬 실행 전략

```
Lane A: 1-A (콘텐츠 마이그레이션) → 1-C (fetch 전환 + 동적 라우트)
Lane B: 1-B (books.ts + shelves.ts) — 독립
Lane C: 1-E (진행 추적 시스템) — 독립
Lane D: 1-F (번들 최적화) — 독립
Lane E: 1-D (dead code 정리) — A, B 완료 후

테스트(1-G)는 B, C, D 완료 후.
```

---

## 엔지니어링 리뷰 결정 사항 (2026-04-16)

이 결정들은 확정. 구현 시 재논의 불필요.

1. **콘텐츠 로딩: fetch 기반** — Vite glob import 제거, public/content/에서 런타임 fetch
2. **Dead code: 전면 정리** — libraryMap, tiles, dart-*.tsx, 루트 content/ 전부 제거
3. **books.ts: 리팩토링 유지** — dead code가 아니라 활성 레지스트리로 전환
4. **동적 라우트** — routes.ts 수동 97개 → BOOKS.map() 자동 생성
5. **shelves.ts** — Phase 1에서는 id/name/icon/color/sortOrder만. room/locked는 Phase 2
6. **테스트** — Vitest 설치, 순수 함수 유닛 테스트
7. **번들** — PrismLight + 선별 언어 import, 500KB 목표
8. **Phase 1 범위** — Outside voice가 "너무 크다"고 했지만 유지 확정. 확장성 기반 작업 선행.

---

## 완료된 작업

| 날짜 | 작업 | 커밋 |
|------|------|------|
| 2026-04-16 | README.md 현재 아키텍처 반영 전면 재작성 | `1b15b8c` |
| 2026-04-16 | v2 디자인 문서 작성 + 승인 | `db3ba47` |
| 2026-04-16 | Phase 1 엔지니어링 리뷰 완료 + TODOS.md | `e3fb492` |
| 2026-04-16 | .vite/ gitignore 추가 | `db3ba47` |
| 2026-04-16 | Phase 1 Lane A/B/D/E 구현 (233파일, 170K줄 삭제) | `7a1f391` |

---

## 다음 할 일

> **다음 세션에서 이 섹션부터 시작하세요.**

1. **1-E 진행 추적 시스템**: progress.ts + migrate.ts + ProgressContext + 배지 + 스트릭
2. **1-G 테스트 인프라**: Vitest 설치 + progress.ts/books.ts/useContent 유닛 테스트
3. **배포 확인**: `npm run deploy`로 GitHub Pages 배포 후 라이브 사이트 동작 확인
4. **worklog 업데이트**: 완료 항목 체크, Phase 1 완료 시 Phase 2로 전환

---

## 참고 링크

- 디자인 문서: `docs/design/v2-living-pixel-library.md`
- TODOS: `TODOS.md`
- 콘텐츠 소스 레포: https://github.com/VelkaressiaBlutkrone/develop-study-documents
- 라이브 사이트: https://velkaressiablutkrone.github.io/developer-open-book/
