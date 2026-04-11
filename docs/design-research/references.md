# 참조 자료

## CodePen / 데모

| 이름 | URL | 핵심 기법 |
|------|-----|-----------|
| Animated CSS Bookshelf | https://codepen.io/ekfuhrmann/pen/OJmRVPj | Flexbox + CSS 그라디언트, 이미지 없음 |
| Pure CSS Bookshelf (풀 씬) | https://codepen.io/tlauffs/pen/mdzzQZX | 장식 아이템, 식물, 카메라 등 전체 장면 |
| Digital Bookshelf | https://codepen.io/brianhaferkamp/pen/ZEGoRoB | 그리드 레이아웃, 디지털 북 커버 |
| 3D Book Picking Off Shelf | https://codepen.io/jkantner/pen/xrRPRL | CSS-only, 선반에서 책 빼기 시뮬레이션 |
| CSS 3D Bending Page Flip | https://codepen.io/_fbrz/pen/whxbF | 리얼리스틱 벤딩, preserve-3d |
| Book Opening Animation | https://codepen.io/wwwebneko/pen/XjOZZK | 순수 CSS 책 펼침 |
| Old Book Layout | https://codepen.io/logico-ar/pen/wvBrPzd | 빈티지 양피지 미학 |
| Book Spine Shading | https://codepen.io/aepicos/pen/dERYKm | 하드커버 + 그라디언트 음영 |

## 튜토리얼 / 기술 문서

| 제목 | URL | 내용 |
|------|-----|------|
| Animated Books with CSS 3D Transforms | https://tympanus.net/codrops/2013/07/11/animated-books-with-css-3d-transforms/ | Codrops — 하드커버, staggered 페이지 |
| 3D Book Animation Step by Step | https://scastiel.dev/animated-3d-book-css | 단계별 CSS 3D 책 구현 |
| CSS Perspective and Opening Book | https://dev.to/jsha/css-perspective-and-opening-book-as-in-3d-3985 | perspective + 3D 펼침 |
| CSS Multi-Column Book Layout | https://www.w3tutorials.net/blog/css-multi-column-multi-page-layout-like-an-open-book/ | 양면 펼침 구현 |
| 38 CSS Book Effects | https://freefrontend.com/css-book-effects/ | CSS 책 효과 모음 |
| 35+ CSS Book Effects | https://devsnap.me/css-book-effects/ | DevSnap 책 효과 모음 |
| Scroll-Driven Animations Intro | https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/ | animation-timeline: scroll() |

## 라이브러리

| 이름 | URL | 용도 |
|------|-----|------|
| react-pageflip | https://github.com/Nodlik/react-pageflip | React 페이지 넘김 효과 |
| StPageFlip | https://github.com/Nodlik/StPageFlip | 바닐라 JS 페이지 플립 엔진 |
| book-flip (StPageFlip 포크) | https://github.com/dappsar/book-flip | 커뮤니티 개선 버전 |
| react-pageflip 데모 | https://nodlik.github.io/react-pageflip/ | 라이브 데모 |
| Virtual Bookshelf | https://github.com/petargyurov/virtual-bookshelf | 가상 서가 구현 참고 |

## 영감 사이트

| 이름 | URL | 참고 포인트 |
|------|-----|-------------|
| Archives.design | https://archives.design | 아카이브 미학, 타이포그래피 |
| DearFlip | https://jquery.dearflip.com/an-alternative-to-turn-js-that-supports-pdf-dearflip/ | turn.js 대안, PDF 지원 |

## 참고 기술 (브라우저 API)

| 기술 | 지원 | 비고 |
|------|------|------|
| View Transitions API | Chrome 111+ | React Router 연동 가능 |
| CSS `animation-timeline: scroll()` | Chrome 115+ | Firefox 플래그 필요, Safari 부분 지원 |
| React 19 `<ViewTransition>` | Canary/Labs | 2026.04 기준 실험적 |
| CSS `transform-style: preserve-3d` | 전체 모던 브라우저 | 3D 효과 핵심 |
