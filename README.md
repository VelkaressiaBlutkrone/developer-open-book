# Developer Open Book

개발자 학습 문서를 **픽셀 아트 도서관** 컨셉으로 제공하는 인터랙티브 웹 애플리케이션.
RPG 탑다운 시점의 도서관을 탐색하며 책장에서 책을 골라 읽는 방식으로 학습한다.

**Live:** https://velkaressiablutkrone.github.io/developer-open-book/

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Routing | react-router-dom v7 (HashRouter) |
| Markdown | react-markdown v10, remark-gfm, rehype-raw, rehype-slug |
| Code Highlight | react-syntax-highlighter |
| Fonts | Playfair Display, Lora, JetBrains Mono, Crimson Pro |
| Deploy | GitHub Pages (`gh-pages` npm package) |

---

## 브랜치 전략

| 브랜치 | 용도 | 상태 |
|--------|------|------|
| `main` | 소스코드 (React + TypeScript) | 개발 브랜치 |
| `gh-pages` | `npm run deploy` 빌드 결과물 | 자동 배포 |
| `feature/pixel-art-library` | 픽셀 아트 도서관 UI 작업 (로컬) | 병합 완료 |

---

## 아키텍처

### 라우팅 구조

```
HashRouter → Layout → Routes
  /                     → LibraryRoom (픽셀 아트 도서관 메인)
  /dart-*               → 개별 TSX 페이지 (23개)
  /step-*-flutter 등    → BookPage 범용 (31개)
  /react-step*          → BookPage 범용 (43개)
  *                     → NotFound
```

- **총 97개 라우트**: Home 1 + Dart 23 + Flutter 31 + React 42 + NotFound
- 모든 라우트는 `src/routes.ts`에서 `lazy()` import로 코드 분할

### 콘텐츠 전달 방식

| 카테고리 | 방식 | 컴포넌트 |
|----------|------|----------|
| Dart (23권) | 개별 TSX 페이지 → raw markdown import | `src/pages/dart-*.tsx` |
| Flutter (31권) | slug 기반 동적 로드 (`import.meta.glob`) | `BookPage.tsx` |
| React (43권) | slug 기반 동적 로드 (`import.meta.glob`) | `BookPage.tsx` |

### 메인 화면 (LibraryRoom)

- 픽셀 아트 RPG 탑다운 도서관 렌더링
- `src/data/libraryMap.ts`의 타일맵 기반 (hex 상수로 바닥/벽/선반/가구/NPC/장식 정의)
- 3개 인터랙티브 책장 영역 (Dart, Flutter, React) 클릭 가능
- 책장 클릭 → 팝업 오버레이로 책 목록 표시 → 책 선택 시 읽기 뷰

---

## 콘텐츠 현황

| 책장 | 수량 | 범위 |
|------|------|------|
| Dart | 23권 | 로드맵 + Step 01~22 (기초→핵심→심화→실전) |
| Flutter | 31권 | 로드맵 + Step 01~30 (아키텍처→위젯→상태관리→배포) |
| React | 43권 | 로드맵 + Step 00~42 (환경설정→Hook→라우팅→프로덕션) |
| **합계** | **97권** | |

---

## 프로젝트 구조

```
developer-open-book/
├── index.html                      # 진입점
├── package.json
├── vite.config.ts                  # base: '/developer-open-book/'
├── tsconfig.json
├── eslint.config.js
│
├── public/
│   ├── favicon.svg
│   ├── content/                    # 런타임 fetch용 정적 마크다운
│   │   ├── dart/    (23 .md)
│   │   ├── flutter/ (31 .md)
│   │   └── react/   (43 .md)
│   └── sprites/                    # 픽셀 아트 벽 타일 PNG
│       ├── tile-wall.png
│       ├── tile-wall-stone.png
│       └── tile-wall-wood.png
│
├── content/                        # 루트 레벨 마크다운 원본
│   ├── dart/    (23 .md)
│   └── react/   (43 .md)
│
├── src/
│   ├── App.tsx                     # HashRouter 루트
│   ├── main.tsx                    # ReactDOM 진입점
│   ├── routes.ts                   # 97개 라우트 정의
│   ├── index.css                   # 글로벌 CSS 변수 + 레이아웃
│   ├── search-index.json           # 클라이언트 검색 인덱스
│   ├── vite-env.d.ts
│   │
│   ├── components/                 # UI 컴포넌트 (26개)
│   │   ├── LibraryRoom.tsx         # 메인 도서관 화면 (타일맵 렌더링)
│   │   ├── PixelLibrary.tsx        # 픽셀 아트 도서관 뷰
│   │   ├── PixelDiorama.tsx        # 디오라마 장면
│   │   ├── TileRenderer.tsx        # 타일맵 렌더러
│   │   ├── Layout.tsx              # 전체 레이아웃 (헤더/사이드바/빵크럼)
│   │   ├── Sidebar.tsx             # shelf 필터 사이드바
│   │   ├── SearchBar.tsx           # 검색
│   │   ├── ThemeToggle.tsx         # 다크/라이트 테마 전환
│   │   ├── Bookshelf.tsx           # 책장 뷰
│   │   ├── BookshelfHome.tsx       # 책장 홈
│   │   ├── BookSpine.tsx           # 책등 컴포넌트
│   │   ├── BookListPanel.tsx       # 책 목록 패널
│   │   ├── ShelfView.tsx           # 선반 뷰
│   │   ├── BookReader.tsx          # 팝업 책 리더
│   │   ├── ReadingView.tsx         # 읽기 뷰 (양면 펼침)
│   │   ├── MarkdownRenderer.tsx    # MD→React 변환
│   │   ├── CodeBlock.tsx           # 코드 구문 강조
│   │   ├── Admonition.tsx          # 정보/경고/팁 박스
│   │   ├── InteractiveAsciiDiagram.tsx
│   │   ├── InteractiveExcalidrawDiagram.tsx
│   │   ├── TableOfContents.tsx     # 목차 (앵커 링크)
│   │   ├── ScrollProgress.tsx      # 읽기 진행률 바
│   │   ├── BackToTop.tsx           # 맨 위로 버튼
│   │   ├── PhaseBanner.tsx         # 단계 배너
│   │   ├── StepperControls.tsx     # 이전/다음 네비게이션
│   │   └── useStepSimulator.ts     # 스텝 시뮬레이터 훅
│   │
│   ├── pages/                      # 페이지 컴포넌트
│   │   ├── index.tsx               # Home → LibraryRoom
│   │   ├── BookPage.tsx            # Flutter/React 범용 페이지
│   │   ├── NotFound.tsx            # 404 페이지
│   │   └── dart-*.tsx (24개)       # Dart 개별 페이지
│   │
│   ├── content/                    # Vite raw import용 마크다운
│   │   ├── dart-*.md (24개)
│   │   ├── flutter/step-*.md (31개)
│   │   └── react-step*.md (43개)
│   │
│   ├── data/
│   │   ├── books.ts                # 책 카탈로그 (96권) + 시각 속성
│   │   └── libraryMap.ts           # 타일맵 데이터
│   │
│   ├── hooks/
│   │   ├── useScrollAnimation.ts
│   │   ├── useStepSimulator.tsx
│   │   └── useTheme.tsx
│   │
│   ├── styles/
│   │   ├── global.css              # 디자인 시스템 변수, 조명, 텍스처
│   │   ├── pixel-library.css       # 타일 그리드, 픽셀 아트
│   │   ├── bookshelf.css           # 헤더, 선반, 책등
│   │   └── reading.css             # 읽기 뷰, 페이지 플립, 타이포그래피
│   │
│   └── types/
│       ├── index.ts                # Book, BookVisual 인터페이스
│       └── tiles.ts                # Tile hex 상수, TileMap 타입
│
└── docs/
    └── design-research/            # 디자인 리서치
        ├── README.md
        ├── current-state.md
        ├── implementation-strategy.md
        ├── library-ui-patterns.md
        ├── references.md
        └── preview.html
```

---

## 배포 (gh-pages 브랜치)

`npm run deploy` 실행 시 `gh-pages` npm 패키지가 `dist/` 빌드 결과를 `gh-pages` 브랜치에 푸시한다.

### 배포 브랜치 구조

```
gh-pages/
├── .nojekyll
├── index.html
├── favicon.svg
├── assets/
│   ├── index-*.js          # 메인 번들 (~64KB)
│   ├── index-*.css         # 전체 스타일 (~14KB)
│   ├── MarkdownRenderer-*.js  # MD 렌더러 청크 (~993KB)
│   ├── BookPage-*.js       # BookPage 청크 (~13KB)
│   ├── NotFound-*.js
│   ├── dart-*.js           # Dart 페이지별 lazy 청크
│   ├── step-*.js           # Flutter 콘텐츠 청크
│   ├── react-step*.js      # React 콘텐츠 청크
│   └── *.woff2             # 웹폰트 (JetBrains Mono, Lora, Playfair Display, Crimson Pro)
└── content/
    ├── dart/    (23 .md)
    ├── flutter/ (31 .md)
    └── react/   (43 .md)
```

### 빌드 특성

- 코드 분할: 각 페이지가 별도 JS 청크로 lazy-load
- MarkdownRenderer 청크가 ~993KB로 가장 큼 (react-markdown + react-syntax-highlighter + rehype/remark 플러그인 포함)
- 총 배포 파일 수: ~200개 이상

---

## TypeScript 타입

```typescript
// Book: 책 카탈로그 항목
interface Book {
  id: string
  title: string
  step: string
  category: 'dart' | 'flutter' | 'react'
  contentFile: string  // public/content/ 기준 경로
}

// BookVisual: 책등 시각 속성 (ID 해시 기반 자동 생성)
interface BookVisual {
  height: number     // 항상 200
  thickness: number  // 26~47 (seed % 22)
  color: string      // SPINE_COLORS 16색 중 1개
  coverColor: string // color의 70% 어두운 버전
}

// RouteConfig: 라우트 정의
interface RouteConfig {
  path: string
  title: string
  component: ComponentType
  category: string
  shelf?: string  // 'dart' | 'flutter' | 'react'
  slug?: string   // 콘텐츠 파일명 (.md 제외)
}
```

---

## 개발

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (Vite)
npm run build      # 프로덕션 빌드
npm run deploy     # GitHub Pages 배포 (build + gh-pages push)
npm run lint       # ESLint 실행
npm run preview    # 빌드 결과 미리보기
```

---

## 콘텐츠 추가 방법

1. `src/content/`에 마크다운 파일 추가
2. `public/content/{category}/`에 동일 파일 복사 (런타임 fetch용)
3. `src/data/books.ts`의 `BOOKS` 배열에 항목 추가
4. `src/routes.ts`에 라우트 추가
   - Flutter/React: `BookPage` 컴포넌트 사용 (slug로 자동 매칭)
   - Dart: 개별 TSX 페이지 생성 필요

---

## 참고

- 마크다운이 3곳에 존재함: `content/`, `public/content/`, `src/content/` (각각 원본/정적서빙/Vite import 용도)
- 디자인 리서치 문서: `docs/design-research/`
- `preview.html`을 브라우저에서 열면 프레임워크 없이 디자인 컨셉 확인 가능
