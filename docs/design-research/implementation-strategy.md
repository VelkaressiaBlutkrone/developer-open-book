# 구현 전략

developer-open-book을 도서관 컨셉으로 전환하기 위한 단계별 구현 계획.

---

## Phase 1 — 책장 뷰 (Bookshelf Landing)

### 목표
기존 사이드바 리스트 네비게이션을 물리적 책장(서가) 뷰로 교체.

### 구현 내용

**서가 레이아웃**:
- CSS Flexbox 행으로 책등(spine) 배치
- 나무결 선반 바를 CSS `repeating-linear-gradient`로 렌더링
- 카테고리별 선반 행 분리 (Dart 선반, React 선반)

**책 컴포넌트 (BookSpine)**:
```jsx
const BookSpine = ({ doc, onClick }) => {
  const seed = doc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const height = 140 + (seed % 80);
  const thickness = 22 + (seed % 24);
  const colorIndex = seed % BOOK_COLORS.length;

  return (
    <div
      className="book-spine-wrapper"
      style={{ '--book-height': `${height}px`, '--book-thick': `${thickness}px` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${doc.title} 열기`}
    >
      <div className="book-spine" style={{ background: BOOK_COLORS[colorIndex] }}>
        <span className="spine-title">{doc.title}</span>
        <span className="spine-category">{doc.category}</span>
      </div>
    </div>
  );
};
```

**인터랙션**:
- 호버: CSS `rotateY(-25deg) translateZ(20px)` — 책이 기울며 빠져나옴
- 양옆 책에 `margin` 트랜지션으로 공간 확보

**반응형 폴백**:
- 768px 이하: 커버 그리드 `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`
- 터치 디바이스: hover 대신 tap-to-expand

### 주의사항
- `Math.random()` 렌더 불일치 방지 → 문서 ID 기반 시드 필수
- `transform`, `opacity`만 애니메이션 → GPU 합성, 레이아웃 리플로우 없음
- 50개 이상 문서 시 `react-virtual`로 가상화 고려

---

## Phase 2 — 펼침 전환 (Shelf → Reader Transition)

### 목표
책장에서 책을 클릭하면 책이 펼쳐지며 읽기 뷰로 전환.

### 추천 접근: View Transitions API + React Router

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

@keyframes book-open {
  from { transform: perspective(600px) rotateY(-30deg) scale(0.3); opacity: 0.5; }
  to   { transform: perspective(600px) rotateY(0deg) scale(1); opacity: 1; }
}

::view-transition-new(opening-book) {
  animation: book-open 0.6s ease-out;
}
```

### 폴백 전략
- View Transitions API 미지원 브라우저: Framer Motion `AnimatePresence` (fade + scale)
- 최소 폴백: 즉시 라우트 전환

### 돌아가기 전환
- 읽기 뷰 → 책장: 역방향 애니메이션 (책이 닫히며 서가로 돌아감)
- `::view-transition-old(opening-book)` 활용

---

## Phase 3 — 읽기 뷰 (Reading View)

### 목표
기존 마크다운 렌더링을 "책을 펼쳐 읽는" 경험으로 전환.

### 핵심 레이아웃

**양면 펼침 (데스크톱)**:
```css
.book-content {
  columns: 2;
  column-gap: 4rem;
  column-fill: auto;
  height: 600px;
  background: var(--bg-paper);     /* #f5efe0 */
  padding: 3rem;
}
```

**종이 텍스처**:
- SVG `feTurbulence` 노이즈 오버레이 (opacity 0.06)
- 가장자리 비네트 (inset box-shadow)
- 중앙 거터 라인 (linear-gradient)

**타이포그래피 변경**:
- 헤딩: Playfair Display (기존 Pretendard에서 전환)
- 본문: Lora (서체 전환으로 책 느낌 강화)
- 코드: JetBrains Mono (유지)
- 텍스트 색상: 세피아 잉크 (#2c1810)

**모바일 (768px 이하)**:
- 단일 칼럼, 텍스처 오버레이 제거 (성능)
- 스크롤 기반 읽기
- 하단 페이지 네비게이션 바

### 기존 컴포넌트 유지
- Admonition, 코드 블록, 테이블, 다이어그램은 기존 디자인 유지
- 단, 배경색과 보더를 도서관 팔레트에 맞춰 조정

---

## Phase 4 — 도서관 분위기 (Library Ambiance)

### 목표
전체 사이트에 도서관 공간감 부여.

### 구현 내용

**방 배경**:
- `--bg-room: #1a1208` (어두운 호두나무)
- 선반 행이 수평 밴드로 배치

**조명**:
- 상단 중앙에서 내려오는 따뜻한 방사형 그라디언트
- `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,200,80,0.06), transparent)`

**3D 깊이감**:
```css
.bookshelf-room {
  perspective: 1200px;
  perspective-origin: 50% 30%;   /* 시점: 약간 위에서 내려다봄 */
  background: var(--bg-room);
}

.shelf-unit {
  transform: rotateX(5deg);       /* 살짝 아래로 기울임 */
  transform-style: preserve-3d;
}
```

**선반 뒤 벽 그림자**:
```css
.shelf-unit::after {
  content: '';
  position: absolute;
  inset: -10px;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 60%);
  transform: translateZ(-20px);
  filter: blur(8px);
}
```

---

## 라우트 구조 (제안)

```
/                       → 도서관 메인 (책장 뷰)
/shelf/:category        → 특정 카테고리 선반 (dart, react)
/read/:docId            → 읽기 뷰 (개별 문서)
```

---

## 모바일 대응 전략 요약

| 요소 | 데스크톱 (1200px+) | 태블릿 (768~1199px) | 모바일 (<768px) |
|------|---------------------|---------------------|-----------------|
| 책장 | 책등(spine) 뷰 | 책등 뷰 (축소) | 커버 그리드 |
| 인터랙션 | 호버 기울기 | 호버 기울기 | 탭으로 선택 |
| 읽기 뷰 | 양면 펼침 | 양면 펼침 | 단일 칼럼 |
| 3D 효과 | perspective 활성 | perspective 활성 | 비활성 (성능) |
| 텍스처 | 전체 적용 | 전체 적용 | 제거 (성능) |
| 네비게이션 | 서가 클릭 | 서가 클릭 | 하단 바 + 스와이프 |

---

## 성능 최적화 가이드

### 애니메이션
- `transform`과 `opacity`만 사용 — `width`, `height`, `margin` 애니메이션 금지
- 애니메이션 요소에 `will-change: transform` 적용 (GPU 프로모션)
- `@media (prefers-reduced-motion: reduce)` 시 텍스처/애니메이션 비활성화

### 텍스처
- SVG 노이즈를 data URI로 임베드 — 네트워크 요청 없음
- `pointer-events: none`으로 이벤트 차단
- 모바일에서 텍스처 오버레이 제거

### 가상화
- 50개 이상 문서 시 `react-window` 또는 `@tanstack/virtual`로 선반 가상화
- 뷰포트 밖 책 컴포넌트는 언마운트

### 폰트
- Playfair Display, Lora: Google Fonts CDN `display=swap`
- Pretendard: 기존 CDN 유지 (UI 요소용)
- `font-display: swap` 필수 — FOUT 허용, FOIT 방지

### 번들
- 책장 뷰와 읽기 뷰를 별도 코드 스플릿 (React.lazy)
- 다이어그램 라이브러리 (Mermaid, Cytoscape, KaTeX) 읽기 뷰에서만 로드
