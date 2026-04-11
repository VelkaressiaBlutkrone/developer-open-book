# 도서관 UI 패턴 리서치

## 1. 책장(Bookshelf) 뷰 패턴

### 1-1. 커버 그리드 (Cover Grid)

가장 일반적인 패턴. Kindle, Calibre-web, Google Play Books 등에서 사용.

```css
.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
  padding: 32px;
}
```

- **장점**: 구현 간단, React 친화적, 모든 화면 크기 대응
- **단점**: 몰입감 낮음, 일반 CRUD 앱과 차별 없음

### 1-2. 책등(Spine) 뷰

실제 책꽂이를 모방. 각 책은 세로 직사각형(책등)으로 표시, 다양한 높이와 색상.

```css
.shelf {
  display: flex;
  align-items: flex-end;
  gap: 0;
  padding: 8px 12px 0;
  background: linear-gradient(180deg, #8B5E3C 0%, #6B4226 60%, #4a2c1a 100%);
  box-shadow: 0 8px 16px rgba(0,0,0,0.5);
}

.book {
  position: relative;
  width: 28px;              /* 책등 두께 */
  height: 180px;            /* 높이는 책마다 다름 */
  transform-style: preserve-3d;
  transition: transform 0.4s ease, margin 0.3s ease;
  cursor: pointer;
}

.book:hover {
  transform: rotateY(-25deg) translateZ(20px);
  margin: 0 6px;            /* 양옆 책 밀어냄 */
  z-index: 10;
}
```

**책등 면(Spine Face)**:
```css
.book-spine {
  position: absolute;
  inset: 0;
  background: var(--book-color);
  background-image: linear-gradient(
    90deg,
    rgba(0,0,0,0.25) 0%,
    rgba(255,255,255,0.05) 30%,
    rgba(255,255,255,0.1) 50%,
    rgba(0,0,0,0.15) 100%
  );
}

.spine-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.9);
  font-family: 'Playfair Display', serif;
}
```

- **장점**: 높은 몰입감, 물리적 서가 느낌
- **단점**: 긴 제목 잘림, JS로 랜덤 높이/색상 필요, 모바일 비친화적

### 1-3. 하이브리드 (Spine + Cover)

책등 상태에서 호버 시 책을 "빼내어" 커버를 보여주고, 클릭 시 펼침.

- **장점**: 두 패턴의 장점 결합
- **단점**: 가장 복잡한 상태 관리

### 책 높이/색상 시드 생성 (React)

`Math.random()`은 렌더마다 다른 값을 생성하므로, 문서 ID 기반 시드 사용:

```javascript
const generateBookData = (docs) => docs.map(doc => {
  const seed = doc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    ...doc,
    height: 140 + (seed % 80),     // 140~220px
    thickness: 20 + (seed % 24),    // 20~44px
    color: BOOK_PALETTE[seed % BOOK_PALETTE.length],
  };
});

const BOOK_PALETTE = [
  '#8B2635', '#1B4F72', '#1E8449', '#7D3C98',
  '#935116', '#1A5276', '#922B21', '#1D6A39',
];
```

---

## 2. 책 펼치기 애니메이션 (Opening Transition)

### 2-1. 3D CSS 책 펼침

```html
<div class="book-container">
  <div class="book" id="book">
    <div class="cover-back"></div>
    <div class="page page-last"><div class="page-content">...</div></div>
    <div class="page page-third"></div>
    <div class="page page-second"></div>
    <div class="page page-first"></div>
    <div class="cover-front"><img src="cover.jpg" alt="..."></div>
  </div>
</div>
```

**닫힌 상태 (Closed)**:
```css
.book-container {
  perspective: 500px;
  perspective-origin: 50% 50%;
}

.book {
  position: relative;
  width: 300px;
  height: 420px;
  transform-style: preserve-3d;
  transform-origin: left center;   /* 척추 = 왼쪽 모서리 */
}

/* 페이지 두께감 표현 — 각 페이지를 2px씩 오프셋 */
.cover-front { transform: rotateY(-10deg); z-index: 10; }
.page-first  { transform: translateX(2px) rotateY(-10deg); z-index: 9; }
.page-second { transform: translateX(4px) rotateY(-10deg); z-index: 8; }

.book > div {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 1.2s ease-in-out;
  backface-visibility: hidden;
}
```

**열린 상태 (Open)** — 각 페이지가 점진적으로 작은 각도로 회전:
```css
.book.is-open .cover-front  { transform: rotateY(-160deg); }
.book.is-open .page-first   { transform: translateX(2px) rotateY(-150deg); }
.book.is-open .page-second  { transform: translateX(4px) rotateY(-130deg); }
.book.is-open .page-third   { transform: translateX(6px) rotateY(-110deg); }
```

> 핵심 물리: 160 → 150 → 130 → 110 순으로 각도가 줄어 페이지가 자연스럽게 펼쳐짐

**펼침 그림자**:
```css
.book::after {
  content: '';
  position: absolute;
  left: 0; top: 5%;
  width: 100%; height: 90%;
  background: radial-gradient(ellipse at left center,
    rgba(0,0,0,0.4) 0%, transparent 70%);
  transform: translateZ(-1px);
  opacity: 0;
  transition: opacity 1s;
}
.book.is-open::after { opacity: 1; }
```

### 2-2. View Transitions API (React Router 연동)

Chrome 111+, 가장 깔끔한 React 방식:

```jsx
const openBook = (docId) => {
  if (!document.startViewTransition) {
    navigate(`/read/${docId}`);
    return;
  }
  document.startViewTransition(() => navigate(`/read/${docId}`));
};
```

```css
.book-spine-wrapper.selected { view-transition-name: opening-book; }
.book-reader-container       { view-transition-name: opening-book; }

::view-transition-new(opening-book) {
  animation: book-open 0.6s ease-out;
}

@keyframes book-open {
  from { transform: perspective(600px) rotateY(-30deg) scale(0.3); opacity: 0.5; }
  to   { transform: perspective(600px) rotateY(0deg) scale(1); opacity: 1; }
}
```

---

## 3. 읽기 뷰 (Reading View)

### 3-1. 양면 펼침 (Two-Page Spread)

CSS Multi-column으로 구현:

```css
.book-viewport {
  width: 900px;
  overflow: hidden;
}

.book-content {
  columns: 2;
  column-gap: 4rem;
  column-fill: auto;
  height: 600px;                /* 고정 높이 → 칼럼 분할 강제 */
  max-width: 880px;
  background: #faf6f0;
  padding: 3rem;

  /* 중앙 거터(척추) 라인 */
  background-image: linear-gradient(
    90deg,
    transparent calc(50% - 1px),
    rgba(0,0,0,0.08) calc(50% - 1px),
    rgba(0,0,0,0.08) calc(50% + 1px),
    transparent calc(50% + 1px)
  );
}

/* 모바일: 단일 칼럼 */
@media (max-width: 768px) {
  .book-content { columns: 1; height: auto; overflow-y: auto; }
}
```

### 3-2. react-pageflip (페이지 넘김 효과)

StPageFlip 기반 React 래퍼:

```jsx
import HTMLFlipBook from 'react-pageflip';

function DocumentReader({ pages }) {
  return (
    <HTMLFlipBook
      width={550} height={733}
      size="stretch"
      showCover={true}
      maxShadowOpacity={0.5}
      flippingTime={800}
      mobileScrollSupport={true}
    >
      {pages.map((page, i) => (
        <div key={i} className="page-content">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
      ))}
    </HTMLFlipBook>
  );
}
```

> 주의: StPageFlip npm 패키지 마지막 업데이트 5년 전. 커뮤니티 포크 `book-flip` (dappsar/book-flip) 존재.

### 접근법 비교

| 방식 | 리얼리즘 | 성능 | 모바일 | 복잡도 | 추천 용도 |
|------|----------|------|--------|--------|-----------|
| CSS rotateY 플립 | 중간 | 우수 (GPU) | JS 터치 필요 | 낮음 | 진입/전환 애니메이션 |
| react-pageflip | 높음 | 양호 (Canvas) | 터치 내장 | 중간 | 실제 페이지 넘김 읽기 |
| CSS scroll-driven | 중~하 | 우수 | 스크롤 네이티브 | 낮음 | 스크롤 연동 효과 |
| View Transitions API | 설정 가능 | 우수 | 터치 OK | 낮음 | 서가→읽기 네비게이션 |

---

## 4. 도서관 분위기 연출

### 4-1. 색상 팔레트

```css
:root {
  /* 배경 */
  --bg-room:      #1a1208;   /* 어두운 호두나무 — 방/외부 공간 */
  --bg-shelf:     #5c3a1e;   /* 중간 톤 오크 나무 */
  --bg-paper:     #f5efe0;   /* 오래된 종이 */
  --bg-parchment: #e8daba;   /* 더 어두운 양피지 */

  /* 텍스트 */
  --text-ink:     #2c1810;   /* 진한 세피아 잉크 */
  --text-faded:   #6b5744;   /* 바랜 잉크 (보조 텍스트) */

  /* 강조 */
  --accent-gold:  #b8860b;   /* 다크 골든로드 — 제목 금박 */
  --accent-warm:  #8b4513;   /* 새들브라운 — 가죽 바인딩 */
  --accent-deep:  #4a1942;   /* 딥 버건디 — 특별 볼륨 */

  /* 선반 하드웨어 */
  --shelf-edge:   #3d2008;   /* 나무 모서리 */
  --shelf-light:  rgba(255,200,100,0.15); /* 따뜻한 조명 */
}
```

### 4-2. 나무결 선반 텍스처 (CSS-only)

```css
.shelf-row {
  background-color: #6B4226;
  background-image:
    /* 나무결: 가는 수평 라인 */
    repeating-linear-gradient(
      180deg,
      transparent 0px, transparent 3px,
      rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px
    ),
    /* 나무 변화: 대각선 광택 */
    linear-gradient(
      160deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.04) 30%,
      rgba(0,0,0,0.05) 60%,
      rgba(0,0,0,0) 100%
    );
  box-shadow:
    0 6px 12px rgba(0,0,0,0.6),
    inset 0 2px 4px rgba(255,200,100,0.1);
}
```

### 4-3. 종이 텍스처 (CSS-only, 이미지 파일 불필요)

```css
.page-surface {
  background-color: #f5efe0;
  background-image:
    /* SVG fractalNoise 마이크로 노이즈 */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
    /* 가장자리 누렇게 변색 */
    radial-gradient(ellipse at center,
      rgba(255,255,255,0.1) 0%, rgba(180,150,100,0.08) 100%);
  box-shadow:
    inset 0 0 40px rgba(100,70,30,0.08),
    inset 0 0 8px rgba(0,0,0,0.04);
}
```

### 4-4. 조명 효과 (따뜻한 비네트)

```css
/* 방 전체에 따뜻한 조명 오버레이 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 60% at 50% 0%,
    rgba(255,200,80,0.06) 0%, transparent 70%
  );
  z-index: 9999;
}
```

### 4-5. 타이포그래피 (도서관 분위기)

| 역할 | 폰트 | 특성 |
|------|-------|------|
| 책 제목/헤딩 | Playfair Display | serif, 클래식 |
| 본문/읽기 | Lora | serif, 가독성 |
| 책등 라벨 | IM Fell English | serif, 빈티지 |
| UI 요소 | Crimson Pro | serif, 모던 클래식 |
| 코드 블록 | JetBrains Mono | monospace (유지) |

### 4-6. 도서관 디자인 핵심 원칙

1. **따뜻한 오프화이트 배경** — 순수 `#fff` 사용 금지
2. **세피아 톤 이미지와 모노크롬 커버**
3. **넉넉한 행간** — line-height 1.7~2.0
4. **최소한의 색상** — 인터랙티브 요소에만 강조색
5. **텍스처 오버레이** — 매우 낮은 투명도 (0.05~0.1)
6. **드롭 캡과 장식 요소** — `::first-letter`에 큰 폰트 사이즈
