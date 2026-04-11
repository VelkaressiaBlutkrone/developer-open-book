# 현재 상태 분석: Developer Open Book

## 개요

| 항목 | 현재 상태 |
|------|-----------|
| **레포지토리** | [VelkaressiaBlutkrone/developer-open-book](https://github.com/VelkaressiaBlutkrone/developer-open-book) |
| **라이브 사이트** | https://VelkaressiaBlutkrone.github.io/developer-open-book/ |
| **프레임워크** | React 18.3.1 + Vite |
| **배포** | GitHub Pages (gh-pages 브랜치) |
| **스타일링** | Vanilla CSS (Vite 빌드), CSS Custom Properties 기반 테마 |
| **레이아웃** | 3컬럼 (사이드바 280px + 콘텐츠 900px + TOC 220px) |
| **콘텐츠** | Dart 22단계 + React 20단계 튜토리얼, 322개 ASCII→SVG 다이어그램 |

---

## 레이아웃 구조

```
.app-layout
├── .app-header (sticky, 60px, glassmorphism)
│   ├── .header-left (로고/타이틀)
│   └── .header-right (검색 + 테마 토글)
│
├── .app-body
│   ├── .app-sidebar (280px, sticky)
│   │   └── .sidebar-nav
│   │       └── .sidebar-group (접이식 카테고리)
│   │           ├── .sidebar-category (토글 버튼 + chevron)
│   │           └── .sidebar-links (staggered fadeInUp)
│   │
│   └── .app-content (max-width: 900px)
│       └── .doc-page-wrapper
│           ├── .doc-page
│           │   ├── .phase-banner (그라디언트 배너)
│           │   └── .markdown-body (본문)
│           └── .toc-floating (220px, 1200px 이상에서만 표시)
│
└── .scroll-progress (상단 진행률 바, 3px)
```

---

## 디자인 토큰

### 다크 테마 (기본)

```css
--bg-primary:     #0a0a0a
--bg-secondary:   #111111
--bg-card:        #161616
--text-primary:   #f0f0f0
--text-secondary: #888888
--accent:         #38bdf8        /* cyan-blue */
--glass-bg:       rgba(255,255,255,0.03)
--glass-blur:     20px
--easing:         cubic-bezier(0.16, 1, 0.3, 1)
--radius-sm/md/lg: 8px / 12px / 16px
```

### 라이트 테마

```css
--bg-primary:     #fafafa
--bg-secondary:   #f5f5f5
--bg-card:        #ffffff
--text-primary:   #18181b
--accent:         #0ea5e9        /* sky-blue */
--glass-bg:       rgba(255,255,255,0.7)
--glass-blur:     16px
```

---

## 타이포그래피

| 용도 | 폰트 | 비고 |
|------|-------|------|
| 본문 | Pretendard | CDN via jsdelivr |
| 코드 | JetBrains Mono | Google Fonts, weight 400/500 |
| 시스템 | -apple-system, BlinkMacSystemFont, system-ui | 폴백 |

- h1: 2.2rem, gradient text, 하단 밑줄 (60px, 3px)
- h2: 1.6rem, 좌측 보더 (3px accent)
- 본문: line-height 1.8, max-width 72ch, word-break: keep-all

---

## 콘텐츠 컴포넌트

### Markdown Body 요소
- **코드 블록**: 헤더(언어 라벨) + 복사 버튼, 좌측 보더 3px accent
- **인라인 코드**: accent-bg, 모노스페이스
- **인용문**: 좌측 보더 3px, accent-bg, 라운드 코너
- **테이블**: 수평 스크롤 래퍼, 호버 하이라이트, 줄무늬 행
- **Admonition**: note(파랑), tip(초록), warning(주황), info(보라), prerequisite(핑크)
- **다이어그램**: ASCII(스크롤 프리, 모노스페이스), Mermaid(중앙 SVG)

---

## 애니메이션

| 요소 | 효과 | 시간 |
|------|------|------|
| 사이드바 링크 | fadeInUp, nth-child stagger (0~100ms) | 0.3s |
| 테마 토글 | hover scale(1.05), active scale(0.95) | 0.4s |
| 검색 입력 | focus 시 너비 확장 (180→260px) | 0.4s |
| 모바일 사이드바 | translateX 슬라이드 | 0.25s |
| 테마 전환 | background 0.5s, color 0.3s | var(--easing) |
| 로딩 상태 | shimmer 그라디언트 스위프 | 1.5s infinite |

---

## 반응형

| 뷰포트 | 변화 |
|---------|------|
| < 768px | 사이드바 → fixed overlay 슬라이드, 햄버거 메뉴 표시, 패딩 축소 |
| < 1200px | TOC 숨김 |
| >= 1200px | 전체 3컬럼 레이아웃 |

---

## 번들 구성

| 파일 | 크기 | 설명 |
|------|------|------|
| index-B10439t4.js | 272KB | 메인 React 앱 |
| layout-B8iksUI5.js | 29KB | 레이아웃 컴포넌트 |
| index-VNU57FAN.css | 16KB | 전체 스타일시트 |
| /diagrams/ | 101 SVG | ASCII→SVG 변환 다이어그램 |
| 다이어그램 라이브러리 | ~790KB | Mermaid, Cytoscape, KaTeX, Dagre |

---

## 현재 디자인의 강점

1. CSS Custom Properties 기반 완전한 다크/라이트 테마
2. 글래스모피즘 효과 (헤더, 드롭다운)
3. 잘 정리된 마이크로 인터랙션 (stagger, hover, smooth transition)
4. Admonition 시맨틱 컬러 시스템
5. 콘텐츠 중심 레이아웃 (72ch max-width)

## 개선 필요 사항 (도서관 컨셉 전환 관점)

1. **진입 경험 부재** — 사이드바 목록으로 바로 시작, 탐색의 재미 없음
2. **문서 = 그냥 페이지** — 책을 읽는 느낌이 아닌 웹 문서 뷰어
3. **내비게이션이 단조로움** — 사이드바 리스트만 존재
4. **물리적 메타포 없음** — 텍스처, 깊이감, 공간감 부족
5. **개별 문서의 아이덴티티 부재** — 모든 문서가 동일한 외형
