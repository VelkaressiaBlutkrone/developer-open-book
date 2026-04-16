# 작업 이력 (Worklog)

이 문서는 세션 간 작업 연속성을 위한 단일 소스. 새 세션에서 이 문서를 읽으면 현재 상태를 즉시 파악할 수 있다.

---

## 현재 상태

**Phase 1: Foundation — 구현 대기**
- 디자인 문서 승인 완료 (2026-04-16)
- 엔지니어링 리뷰 통과 (2026-04-16, 9개 이슈 해결, 0 critical gaps)
- 코드 변경 아직 없음. 다음 세션에서 구현 시작.

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

### 1-A. 콘텐츠 마이그레이션 (사전 검증 → 구조 단일화)
- [ ] 3개 폴더 diff 확인 (content/ 68개 vs src/content/ 98개 vs public/content/ 100개)
- [ ] public/content/를 canonical 소스로 확정
- [ ] src/content/ 제거 (98개 MD 파일)
- [ ] content/ (루트) 제거 (68개 MD 파일)

### 1-B. books.ts + shelves.ts 리팩토링
- [ ] books.ts의 BOOKS 배열을 활성 콘텐츠 레지스트리로 전환
  - Book 인터페이스에 `slug` 필드 추가
  - `contentFile` 경로를 `public/content/{shelf}/{slug}.md` 형식으로 통일
  - SPINE_COLORS, seedFromId를 books.ts로 통합 (LibraryRoom 중복 제거)
- [ ] shelves.ts 신규 생성 (Shelf 인터페이스: id, name, icon, color, sortOrder)
  - Phase 1에서는 room/locked 필드 미포함 (Phase 2로 이관)
- [ ] Book.category 타입 확장 ('dart'|'flutter'|'react' → 전체 카테고리)
- [ ] LibraryRoom.tsx에서 SPINE_COLORS/seedHash 제거, books.ts import로 대체
- [ ] Layout.tsx에서 SHELF_LABELS 제거, shelves.ts import로 대체

### 1-C. BookPage fetch 전환 + 동적 라우트
- [ ] BookPage.tsx: import.meta.glob 제거 → fetch(`${BASE_URL}content/${shelf}/${slug}.md`) 전환
- [ ] BookReader.tsx: 동일하게 fetch 전환 (또는 공유 useContent(slug) 훅 생성)
- [ ] useContent.ts 훅 신규 생성: fetch + 로딩/에러 상태 관리
- [ ] routes.ts: 97개 수동 라우트 제거 → BOOKS.map()으로 자동 생성
- [ ] src/pages/dart-*.tsx 24개 파일 제거 (BookPage로 통합)

### 1-D. Dead code 정리
- [ ] src/data/libraryMap.ts 제거
- [ ] src/types/tiles.ts 제거
- [ ] src/styles/pixel-library.css 미사용 클래스 정리 (.pixel-scene, .tile-cell 등)
- [ ] MarkdownRenderer.tsx 하드코딩 경로 수정 (/developer-open-book/diagrams/ → import.meta.env.BASE_URL)

### 1-E. 진행 추적 시스템
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

### 1-F. 번들 최적화
- [ ] 실제 사용 언어 조사 (97개 MD에서 코드 블록 언어 추출)
- [ ] react-syntax-highlighter → PrismLight + 선별 언어 import
- [ ] 목표: 초기 로드 번들 500KB 이하 (현재 ~993KB)

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

---

## 다음 할 일

> **다음 세션에서 이 섹션부터 시작하세요.**

1. Lane B, C, D를 병렬 시작:
   - `src/data/shelves.ts` 생성
   - `src/data/books.ts` 리팩토링 (slug 추가, SPINE_COLORS 통합)
   - `src/store/progress.ts` + `src/store/migrate.ts` 생성
   - 번들 최적화 (PrismLight 전환)
2. Lane A: 콘텐츠 3개 폴더 diff 확인 → 마이그레이션 → BookPage fetch 전환
3. Lane E: dead code 정리
4. 테스트 작성
5. 배포 확인 (`npm run deploy`)

---

## 참고 링크

- 디자인 문서: `docs/design/v2-living-pixel-library.md`
- TODOS: `TODOS.md`
- 콘텐츠 소스 레포: https://github.com/VelkaressiaBlutkrone/develop-study-documents
- 라이브 사이트: https://velkaressiablutkrone.github.io/developer-open-book/
