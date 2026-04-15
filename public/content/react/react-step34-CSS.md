# Step 34. CSS 전략과 스타일링 아키텍처

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
> 타입 안전성, 폼 관리, 스타일링으로 프로덕션 품질을 완성한다

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **Remember**   | CSS Modules, Tailwind CSS, CSS-in-JS의 특징을 기술할 수 있다           |
| **Understand** | 각 스타일링 전략의 동작 원리와 장단점을 설명할 수 있다                 |
| **Understand** | 디자인 토큰과 테마 시스템이 UI 일관성에 기여하는 원리를 설명할 수 있다 |
| **Apply**      | Tailwind CSS로 반응형 UI를 구현하고 커스텀 테마를 설정할 수 있다       |
| **Analyze**    | 프로젝트 특성에 따라 각 스타일링 전략의 적합성을 분석할 수 있다        |
| **Evaluate**   | 컴포넌트 라이브러리(shadcn/ui 등) 도입 시점과 방법을 판단할 수 있다    |

**전제 지식:**

- Step 4: JSX, className
- Step 27: 컴포넌트 설계 패턴 (Compound, Headless)
- Step 28: 프로젝트 구조 (Co-location)

---

## 1. 서론 — React에는 "정답인 CSS 방식"이 없다

### 1.1 CSS 스타일링의 역사와 진화

웹 스타일링은 1996년 CSS 1.0 사양 발표 이후 30년 가까이 발전해왔다. 초기 웹에서는 단일 `styles.css` 파일에 모든 스타일을 몰아넣는 것이 일반적이었다. 사이트 규모가 커지면서 클래스 이름 충돌, 전역 오염, 스타일 우선순위 충돌 같은 문제가 발생했고, 이를 해결하기 위해 BEM(Block-Element-Modifier), OOCSS, SMACSS 같은 방법론이 등장했다.

2000년대 후반 Sass/LESS 같은 CSS 전처리기가 등장하면서 변수, 중첩, 믹스인 같은 프로그래밍 기능을 CSS에 도입할 수 있게 되었다. 같은 시기 Twitter Bootstrap(2011)은 미리 만들어진 컴포넌트 클래스를 제공하여 빠른 UI 개발을 가능하게 했고, 이는 유틸리티 클래스 개념의 초기 형태였다.

React 생태계가 성숙하면서 스타일링 방식도 다변화되었다. CSS Modules(2015)는 자동 클래스 이름 스코핑으로 전역 충돌 문제를 해결했고, styled-components(2016)는 컴포넌트 단위 CSS 캡슐화를 가능하게 했다. Tailwind CSS(2017)는 유틸리티 퍼스트 철학으로 "CSS 파일을 쓰지 않는 CSS 작성법"을 제시했다. 2020년대 들어서는 React Server Components의 등장으로 런타임 CSS-in-JS의 한계가 부각되면서 제로 런타임 솔루션으로의 전환이 가속화되고 있다.

### 1.2 스타일링 선택이 어려운 이유 — 산업적 맥락

React 생태계에서 가장 논쟁적인 주제 중 하나가 **"어떤 CSS 방식을 사용할 것인가?"** 이다. 정답은 없지만, 각 방식의 트레이드오프를 이해하면 프로젝트에 맞는 현명한 선택을 할 수 있다. 스타일링 전략 선택이 어려운 이유는 다음과 같다.

첫째, **팀 역량과 도구 생태계**가 선택에 영향을 미친다. Tailwind CSS는 유틸리티 클래스를 알아야 하고, CSS Modules는 일반 CSS 지식이 필요하며, styled-components는 JavaScript와 CSS를 혼합하는 사고방식이 필요하다. 팀의 기존 역량과 학습 의지가 중요한 변수다.

둘째, **프레임워크 제약**이 있다. Next.js App Router에서 React Server Components를 사용하면 런타임 CSS-in-JS는 사용할 수 없다. 프로젝트가 어떤 렌더링 방식을 채택하느냐에 따라 선택지가 좁아진다.

셋째, **장기 유지보수성**을 고려해야 한다. 초기 개발 속도와 장기 유지보수 편의성은 때로 반비례한다. 빠른 초기 개발을 위한 선택이 팀 확장 시 유지보수 비용을 높이기도 한다.

```
2024~2025년 React 스타일링 생태계의 트렌드

  상승 중:
    · Tailwind CSS — 유틸리티 퍼스트, 가장 빠르게 성장 ★
    · CSS Modules — 안정적, 제로 런타임, SSR 호환
    · shadcn/ui — Tailwind 기반 복사-붙여넣기 컴포넌트

  안정적:
    · Vanilla CSS + BEM — 전통적, 프레임워크 무관
    · Sass/SCSS — CSS 확장, 대규모 프로젝트

  변화 중:
    · styled-components / Emotion — RSC 호환 이슈로 대안 모색
    · CSS-in-JS 전반 — 런타임 비용 인식 → 제로 런타임으로 이동

  핵심 트렌드: "런타임 비용이 없는" 방식으로의 이동
    · 빌드 타임에 CSS를 생성하여 런타임 오버헤드 제거
    · Tailwind, CSS Modules, vanilla-extract 등
```

### 1.3 핵심 개념 지도

![react-step34-concept-map](/developer-open-book/diagrams/react-step34-concept-map.svg)

### 1.4 이 Step에서 다루는 범위

![react-step34-scope](/developer-open-book/diagrams/react-step34-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                | 정의                                                                                             | 왜 중요한가                                |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **CSS Modules**     | CSS 파일의 클래스 이름을 **자동으로 고유하게** 변환하여 스코프 충돌을 방지하는 기법              | 전역 스타일 오염 없이 일반 CSS를 사용한다  |
| **Tailwind CSS**    | HTML/JSX에 **유틸리티 클래스**를 직접 작성하여 스타일링하는 프레임워크                           | CSS 파일 없이 빠르게 UI를 구현한다         |
| **CSS-in-JS**       | JavaScript 코드 안에서 **CSS를 작성**하는 방식. styled-components, Emotion 등                    | 동적 스타일링, 컴포넌트 단위 캡슐화에 강점 |
| **디자인 토큰**     | 색상, 폰트, 간격 등 UI의 **기본 속성을 변수로 정의**한 것                                        | 일관된 디자인 시스템의 기반 단위           |
| **유틸리티 퍼스트** | 미리 정의된 **단일 목적 클래스**를 조합하여 스타일을 구성하는 방법론                             | Tailwind의 핵심 철학                       |
| **제로 런타임**     | 스타일이 **빌드 타임에 생성**되어 런타임에 JS 비용이 없는 것                                     | SSR 호환, 성능 이점                        |
| **shadcn/ui**       | Tailwind 기반으로 만들어진 **복사-붙여넣기** 방식의 컴포넌트 컬렉션. 라이브러리가 아닌 코드 소유 | 커스터마이즈가 완전히 자유롭다             |

### 2.2 용어별 이론적 배경

#### CSS Modules — 자동 스코핑의 원리

CSS Modules는 CSS의 가장 큰 고질적 문제인 전역 스코프를 해결하기 위해 등장했다. 전통적인 CSS에서 `.button { color: blue; }`를 작성하면 이 스타일은 페이지 전체에 적용된다. 10개 팀이 각자의 `.button`을 정의하면 마지막으로 로드된 스타일이 이기는 "CSS 특이성 전쟁"이 벌어진다. BEM 같은 방법론은 이를 네이밍 규칙으로 완화하지만, 실수가 발생하면 여전히 충돌한다.

CSS Modules는 빌드 타임에 클래스 이름을 `[파일명]_[클래스명]_[해시]` 형태로 변환하여 전역 충돌을 구조적으로 차단한다. 개발자는 일반 CSS 문법을 그대로 사용하면서도 자동으로 스코프가 보장된다. 이는 "기존 기술을 새로운 방식으로 조합"하는 점진적 개선의 좋은 예다.

#### Tailwind CSS — 유틸리티 퍼스트의 철학

Tailwind CSS의 창시자 Adam Wathan은 2017년 블로그 포스트 "CSS Utility Classes and 'Separation of Concerns'"에서 전통적인 "의미론적 CSS" 접근이 실제로는 HTML과 CSS 사이에 강한 결합을 만든다고 주장했다. `.card-title`이라는 클래스는 HTML 구조에 의존하고, CSS는 HTML의 의미를 알아야 한다. 오히려 유틸리티 클래스를 HTML에 직접 나열하면 "어떻게 보이는가"와 "무엇을 의미하는가"가 같은 곳에 있어서 파악이 쉽다는 것이다.

유틸리티 퍼스트의 핵심 이점은 **디자인 일관성의 자동화**다. `text-blue-600`은 항상 동일한 파란색이고, `p-4`는 항상 동일한 패딩이다. 개발자가 임의로 `padding: 13px`를 쓰는 실수가 구조적으로 방지된다. 이를 디자인 시스템의 "가드레일(guardrail)"이라 부른다.

#### CSS-in-JS — 런타임의 대가

CSS-in-JS는 React 컴포넌트의 Props 기반 동적 스타일링을 자연스럽게 표현한다는 장점이 있다. `background-color: ${props => props.active ? 'blue' : 'gray'}`처럼 JavaScript 값을 CSS 내에서 직접 사용할 수 있다. 그러나 이 동적성은 런타임 비용을 수반한다. 매 렌더링 시마다 CSS 문자열을 생성하고 DOM에 삽입하는 과정이 필요하다. 서버에서 HTML을 생성하는 SSR/RSC 환경에서는 이 메커니즘이 올바르게 작동하지 않거나 추가 설정이 필요하다.

### 2.3 스타일링 방식 스펙트럼

![react-step34-styling-spectrum](/developer-open-book/diagrams/react-step34-styling-spectrum.svg)

### 2.4 스코핑 방식 비교 다이어그램

![react-step34-scoping-comparison](/developer-open-book/diagrams/react-step34-scoping-comparison.svg)

---

## 3. 이론과 원리

### 3.1 CSS Modules — 로컬 스코프 CSS

#### 동작 원리

```
CSS Modules의 핵심: 클래스 이름을 자동으로 고유하게 변환

  작성:
    /* Button.module.css */
    .button { background: blue; }
    .primary { background: green; }

  빌드 후 변환:
    .Button_button_x7k2a { background: blue; }
    .Button_primary_m3j9z { background: green; }

  → 같은 클래스 이름(.button)이 다른 파일에 있어도 충돌하지 않는다!
  → BEM 같은 네이밍 규칙이 불필요하다
```

#### 사용법

```tsx
// Button.module.css
// .button { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; }
// .primary { background-color: #2563eb; color: white; }
// .secondary { background-color: #6b7280; color: white; }
// .large { padding: 12px 24px; font-size: 18px; }

import styles from "./Button.module.css";

function Button({ variant = "primary", size, children, ...rest }) {
  const className = [
    styles.button,
    styles[variant],
    size === "lg" && styles.large,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}

// clsx 라이브러리로 조건부 클래스 간결하게
import clsx from "clsx";

function Button({ variant = "primary", size, disabled, children }) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size === "lg" && styles.large,
        disabled && styles.disabled,
      )}
    >
      {children}
    </button>
  );
}
```

```
CSS Modules의 장단점

  장점:
    · 일반 CSS 문법 그대로 사용 (학습 비용 낮음)
    · 자동 로컬 스코프 (전역 오염 방지)
    · 제로 런타임 (빌드 타임에 변환)
    · SSR 완벽 호환 (RSC 포함)
    · TypeScript 타입 생성 가능 (typed-css-modules)
    · Co-location 자연스러움 (Component.module.css)

  단점:
    · 동적 스타일링이 불편 (인라인 style 병행 필요)
    · 조건부 클래스 조합이 장황 (clsx로 완화)
    · 디자인 토큰을 CSS 변수로 별도 관리 필요
    · 컴포넌트 간 스타일 공유가 explicit (compose)
```

### 3.2 Tailwind CSS — 유틸리티 퍼스트

#### 핵심 철학

```
전통 CSS: "의미 있는 클래스 이름"을 짓고, 별도 CSS에서 스타일 정의

  <button class="primary-button">저장</button>

  .primary-button {
    background-color: #2563eb;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
  }

Tailwind CSS: "유틸리티 클래스"를 조합하여 JSX에서 직접 스타일링

  <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
    저장
  </button>

  · CSS 파일이 별도로 필요 없다!
  · 클래스 이름을 짓지 않아도 된다!
  · 스타일이 JSX에 바로 보인다 (위치 이동 없음)
```

#### 핵심 유틸리티 클래스

```
레이아웃:
  flex, grid, block, inline, hidden
  flex-col, flex-row, items-center, justify-between
  gap-4, space-x-2, space-y-4

크기:
  w-full, w-1/2, w-64, h-screen, max-w-md, min-h-screen

간격:
  p-4 (padding 전체), px-4 (좌우), py-2 (상하)
  m-4, mx-auto, mt-8, mb-4

색상:
  bg-blue-600, text-white, border-gray-300
  bg-blue-600/50 (투명도 50%)
  hover:bg-blue-700, focus:ring-2

타이포그래피:
  text-sm, text-lg, text-2xl
  font-bold, font-semibold
  leading-relaxed, tracking-wide

테두리:
  border, border-2, rounded, rounded-lg, rounded-full

그림자:
  shadow, shadow-md, shadow-lg, shadow-none

반응형 (모바일 퍼스트!):
  sm:flex-row    (640px+)
  md:grid-cols-2 (768px+)
  lg:grid-cols-3 (1024px+)
  xl:max-w-6xl   (1280px+)

상태:
  hover:bg-blue-700
  focus:outline-none focus:ring-2
  active:bg-blue-800
  disabled:opacity-50 disabled:cursor-not-allowed
  dark:bg-gray-800 dark:text-white
```

#### 실전 컴포넌트 예시

```tsx
// Tailwind CSS로 구현한 상품 카드
function ProductCard({ product }) {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden
                    hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {product.price.toLocaleString()}원
          </span>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg
                             hover:bg-blue-700 active:bg-blue-800
                             transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
          >
            장바구니
          </button>
        </div>
      </div>
    </div>
  );
}

// 반응형 그리드
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
// 모바일: 1열, 640px+: 2열, 1024px+: 3열, 1280px+: 4열
```

#### Tailwind의 장단점

```
장점:
  · 개발 속도가 매우 빠르다 (CSS 파일 왕복 없음) ★
  · 클래스 이름을 짓지 않아도 된다
  · 일관된 디자인 시스템 (간격, 색상이 미리 정의됨)
  · 빌드 시 사용한 클래스만 포함 → 작은 CSS 파일
  · 반응형, 다크 모드가 매우 간편
  · RSC/SSR 완벽 호환 (제로 런타임)
  · 큰 생태계: shadcn/ui, Headless UI 등

단점:
  · HTML/JSX가 길어진다 (클래스 문자열이 장황)
  · 학습 곡선: 유틸리티 클래스를 익혀야 함
  · 복잡한 동적 스타일은 불편할 수 있음
  · 팀 전체가 Tailwind를 알아야 코드 리뷰가 가능
  · "이것이 정말 CSS인가?" 논쟁
```

#### tailwind.config.js — 커스텀 설정

```javascript
// tailwind.config.js — 프로젝트의 디자인 토큰 정의
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 커스텀 색상 (디자인 토큰)
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
      },
      // 커스텀 폰트
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      // 커스텀 간격
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      // 커스텀 브레이크포인트
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
  darkMode: "class", // 다크 모드 전략: 'class' 또는 'media'
};

// 사용: bg-brand-600, text-brand-50, font-sans
```

### 3.3 CSS-in-JS — styled-components / Emotion

#### 기본 개념

```tsx
// styled-components 예시
import styled from 'styled-components';

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;

  background-color: ${props => props.variant === 'primary' ? '#2563eb' : '#6b7280'};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 사용
<Button variant="primary">저장</Button>
<Button variant="secondary" disabled>취소</Button>
```

#### CSS-in-JS의 현재 위치

```
CSS-in-JS의 장점:
  · 동적 스타일링이 자연스럽다 (props 기반)
  · 자동 벤더 프리픽스
  · 컴포넌트와 스타일이 완전히 캡슐화
  · TypeScript와 자연스러운 통합

CSS-in-JS의 문제 (2024~):
  · 런타임 비용: JS 실행 → CSS 생성 → DOM 삽입 (매 렌더링)
  · 번들 크기: styled-components ~12KB, Emotion ~11KB
  · RSC 호환 불가: Server Component에서 사용 불가! ★
    → "use client" 필수 → RSC의 번들 감소 이점 상실
  · Streaming SSR과의 복잡한 통합

  결과: 새 프로젝트에서 CSS-in-JS(런타임)를 선택하는 경우가 줄어드는 추세
        → Tailwind CSS, CSS Modules, 또는 제로 런타임 CSS-in-JS로 이동

제로 런타임 CSS-in-JS 대안:
  · vanilla-extract: TypeScript에서 CSS를 작성, 빌드 타임에 CSS 생성
  · Panda CSS: Tailwind-like 유틸리티 + CSS-in-JS DX, 빌드 타임 생성
  · Linaria: styled-components와 유사한 API, 빌드 타임 추출
```

### 3.4 디자인 토큰과 테마 시스템

#### 디자인 토큰이란

```
디자인 토큰 = UI의 "원자적 설계 값"

  색상:     --color-primary: #2563eb;
  간격:     --spacing-4: 16px;
  폰트:     --font-size-lg: 18px;
  테두리:   --radius-md: 8px;
  그림자:   --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  전환:     --duration-200: 200ms;

  이 값들을 일관되게 사용하면:
    · 디자이너와 개발자 사이의 "공통 언어"
    · UI가 일관된 모습을 유지
    · 테마 전환(다크 모드 등)이 토큰 값만 변경하면 됨
```

#### CSS 변수로 테마 구현

```css
/* styles/tokens.css */
:root {
  /* Light 테마 토큰 */
  --color-bg: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-border: #e5e7eb;
  --color-error: #dc2626;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Dark 테마 토큰 — CSS 변수만 덮어씌움! */
[data-theme="dark"] {
  --color-bg: #111827;
  --color-bg-secondary: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
  --color-border: #374151;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
}

/* 토큰 사용 — 테마에 관계없이 동일 코드! */
.card {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
/* Light에서는 흰 배경, Dark에서는 어두운 배경 → 코드 변경 없음! */
```

#### Tailwind에서의 다크 모드

```tsx
// tailwind.config.js에서 darkMode: 'class' 설정 후

function Card({ title, children }) {
  return (
    <div
      className="bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    border border-gray-200 dark:border-gray-700
                    rounded-lg shadow-md dark:shadow-gray-900/30
                    p-6"
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}

// 다크 모드 토글
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <button onClick={() => setIsDark((d) => !d)}>{isDark ? "🌙" : "☀️"}</button>
  );
}
```

### 3.5 반응형 디자인 패턴

```
모바일 퍼스트 원칙 (Tailwind의 기본)

  기본 클래스 = 모바일
  sm: = 640px 이상
  md: = 768px 이상
  lg: = 1024px 이상
  xl: = 1280px 이상


실전 패턴: 반응형 네비게이션

  모바일: 햄버거 메뉴 → 전체 화면 오버레이
  태블릿: 축소된 사이드바 (아이콘만)
  데스크톱: 전체 사이드바 (아이콘 + 텍스트)

  <nav className="
    fixed bottom-0 w-full                  /* 모바일: 하단 고정 */
    md:fixed md:left-0 md:top-0 md:w-16    /* 태블릿: 좌측 축소 */
    lg:w-64                                /* 데스크톱: 좌측 확장 */
  ">


실전 패턴: 반응형 그리드

  <div className="
    grid grid-cols-1          /* 모바일: 1열 */
    sm:grid-cols-2            /* 640px+: 2열 */
    lg:grid-cols-3            /* 1024px+: 3열 */
    xl:grid-cols-4            /* 1280px+: 4열 */
    gap-4 sm:gap-6            /* 간격도 반응형 */
  ">


실전 패턴: 반응형 타이포그래피

  <h1 className="
    text-2xl                  /* 모바일: 24px */
    sm:text-3xl               /* 640px+: 30px */
    lg:text-4xl               /* 1024px+: 36px */
    font-bold
  ">
```

### 3.6 shadcn/ui — 컴포넌트 라이브러리의 새로운 패러다임

#### shadcn/ui의 철학

```
기존 UI 라이브러리 (MUI, Ant Design):
  · npm install → node_modules에 저장
  · 라이브러리 업데이트에 종속
  · 커스터마이즈에 제한 (스타일 덮어쓰기 필요)
  · 사용하지 않는 컴포넌트도 번들에 포함 가능

shadcn/ui:
  · npx shadcn@latest add button → 소스 코드가 내 프로젝트에 복사됨!
  · 코드를 "소유"한다 — 자유롭게 수정 가능
  · 라이브러리 업데이트에 종속되지 않음
  · Tailwind CSS + Radix UI 기반
  · 필요한 컴포넌트만 추가 (사용하지 않는 것은 없음)
  · 접근성(a11y) 내장 (Radix UI)
```

```tsx
// shadcn/ui 추가 후 생성되는 파일 (내 프로젝트에 복사됨)
// src/components/ui/button.tsx — 내가 소유하는 코드!

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,  // 사용자 커스텀 클래스
      )}
      {...props}
    />
  );
}

// 사용
<Button variant="destructive" size="lg">삭제</Button>
<Button variant="outline" className="w-full">전체 너비</Button>

// 커스터마이즈: 이 파일을 직접 수정하면 됨!
// "라이브러리 업데이트에 깨질까?" 걱정 없음 — 내 코드이므로
```

```
shadcn/ui의 장점

  · 코드 소유: 자유로운 커스터마이즈
  · Tailwind 기반: 기존 Tailwind 설정과 자연스럽게 통합
  · Radix UI 기반: 접근성(a11y) 내장 ★
  · 필요한 것만 추가: 번들 최적화
  · TypeScript: 완벽한 타입 지원
  · 디자인 토큰: CSS 변수 기반 테마 시스템 내장
  · React 생태계 트렌드에 가장 부합 (2024~)

적합한 프로젝트:
  · Tailwind CSS를 사용하는 프로젝트
  · 커스터마이즈가 많이 필요한 프로젝트
  · 디자인 시스템을 처음부터 구축하고 싶은 프로젝트
```

### 3.7 스타일링 전략 선택 가이드

```
┌──────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│                  │ CSS Modules  │ Tailwind CSS │ CSS-in-JS    │ shadcn/ui    │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 학습 곡선        │ 낮음         │ 중간         │ 중간         │ 중간         │
│ 개발 속도        │ 보통         │ 매우 빠름 ★  │ 빠름         │ 매우 빠름 ★  │
│ 런타임 비용      │ 제로 ★       │ 제로 ★       │ 있음         │ 제로 ★       │
│ RSC 호환         │ 완벽 ★       │ 완벽 ★       │ 제한적       │ 완벽 ★       │
│ 동적 스타일      │ 불편         │ 보통         │ 우수 ★       │ 보통         │
│ 커스터마이즈     │ 자유         │ config       │ 자유         │ 완전 자유 ★  │
│ 접근성           │ 수동         │ 수동         │ 수동         │ 내장 ★       │
│ 번들 크기        │ 작음         │ 작음         │ 큼           │ 작음         │
│ 디자인 일관성    │ 수동 관리    │ 자동 ★       │ 수동         │ 자동 ★       │
│ IDE 지원         │ 우수         │ 우수 (확장)  │ 우수         │ 우수         │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 적합한 경우      │ CSS 선호     │ 빠른 개발    │ 동적 스타일  │ Tailwind     │
│                  │ 작은 팀      │ 대부분 ★     │ 레거시       │ + 접근성     │
│                  │ 점진적 도입  │ 새 프로젝트  │ 기존 프로젝트│ 새 프로젝트 ★│
└──────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

```
선택 흐름도

  ┌─ RSC(Server Component)를 사용하는가?
  │    YES → CSS-in-JS(런타임) 제외 → Tailwind 또는 CSS Modules
  │    NO ↓
  │
  ├─ 빠른 개발 속도가 최우선인가?
  │    YES → Tailwind CSS (+ shadcn/ui)
  │    NO ↓
  │
  ├─ 기존 CSS/Sass 경험이 풍부하고 그대로 활용하고 싶은가?
  │    YES → CSS Modules (+ Sass)
  │    NO ↓
  │
  ├─ Props 기반 동적 스타일이 핵심인가? (테마, 애니메이션)
  │    YES → CSS-in-JS (styled-components/Emotion)
  │           또는 제로 런타임 (vanilla-extract)
  │
  └─ 잘 모르겠다 → Tailwind CSS ★ (현재 가장 넓은 생태계)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 같은 컴포넌트를 3가지 방식으로

```tsx
// ── CSS Modules ──
// Card.module.css:
// .card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
// .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }

import styles from "./Card.module.css";
function Card({ title, children }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}

// ── Tailwind CSS ──
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

// ── styled-components ──
const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

function Card({ title, children }) {
  return (
    <StyledCard>
      <Title>{title}</Title>
      {children}
    </StyledCard>
  );
}
```

### 4.2 사례: 이커머스 앱의 스타일링 전략 선택

```
시나리오: 이커머스 앱 (Next.js App Router)

  결정 요인:
    · Next.js App Router → RSC 사용 → 런타임 CSS-in-JS 제외
    · 빠른 개발 필요 → Tailwind CSS
    · 일관된 UI 컴포넌트 → shadcn/ui
    · 다크 모드 지원 → Tailwind darkMode: 'class'
    · 접근성 중요 → shadcn/ui (Radix 기반)

  최종 선택:
    Tailwind CSS + shadcn/ui + CSS 변수(디자인 토큰)

  구조:
    · tailwind.config.js: 브랜드 색상, 폰트, 간격 커스텀
    · src/components/ui/: shadcn/ui 컴포넌트 (소유)
    · src/styles/globals.css: CSS 변수(토큰) + Tailwind 지시어
    · 페이지/기능: Tailwind 유틸리티로 직접 스타일링
```

### 4.3 사례: cn() 유틸리티 — Tailwind 클래스 병합

```typescript
// shadcn/ui가 사용하는 cn() 유틸리티
// clsx + tailwind-merge를 결합

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 왜 twMerge가 필요한가?
// clsx만 사용하면:
clsx('px-4', 'px-8')  // → 'px-4 px-8' (충돌! 둘 다 적용)

// twMerge를 통하면:
twMerge('px-4', 'px-8')  // → 'px-8' (나중 값이 이전 값을 덮어씀) ★

// cn() 사용 예시 — 기본 스타일 + 사용자 커스텀
function Button({ className, children, ...props }) {
  return (
    <button
      className={cn(
        'bg-blue-600 text-white px-4 py-2 rounded-lg',  // 기본
        className,  // 사용자가 전달한 클래스가 기본을 덮어씀
      )}
      {...props}
    >
      {children}
    </button>
  );
}

<Button>기본</Button>
<Button className="bg-red-600 px-8">커스텀</Button>
// → bg-red-600이 bg-blue-600을, px-8이 px-4를 올바르게 덮어씀!
```

### 4.4 사례: 디자인 토큰 계층 구조

```
실제 디자인 시스템의 토큰 계층

  원시 토큰 (Primitive Tokens) — 실제 값
    --blue-600: #2563eb;
    --gray-100: #f3f4f6;
    --space-4: 16px;

  시맨틱 토큰 (Semantic Tokens) — 역할 정의
    --color-primary: var(--blue-600);        ← 원시 토큰 참조
    --color-bg-subtle: var(--gray-100);
    --spacing-component: var(--space-4);

  컴포넌트 토큰 (Component Tokens) — 컴포넌트별
    --button-bg: var(--color-primary);       ← 시맨틱 토큰 참조
    --button-padding: var(--spacing-component);

이 계층 구조의 장점:
  · 다크 모드: 시맨틱 토큰 값만 교체하면 전체 UI 변경
  · 브랜드 리뉴얼: 원시 토큰만 변경하면 전파
  · 컴포넌트 교체: 컴포넌트 토큰만 변경
  → Figma Variables와 1:1 매핑 가능 (디자이너-개발자 협업)
```

### 4.5 사례: 대규모 팀에서의 Tailwind 관리 전략

```
문제: 팀원 10명이 Tailwind를 사용하면 클래스 순서가 제각각

  개발자 A: "bg-white rounded-lg p-4 shadow"
  개발자 B: "shadow p-4 bg-white rounded-lg"
  → 동일한 결과지만 일관성 없음, 코드 리뷰 어려움

해결책: Prettier + prettier-plugin-tailwindcss
  → 자동으로 Tailwind 권장 순서로 정렬
  → 커밋 전 자동 포맷팅으로 팀 일관성 보장

문제 2: 자주 쓰는 클래스 조합이 반복됨

  // 여러 곳에 동일한 클래스 조합
  "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"

해결책 1 — @apply (CSS 추출):
  .btn-primary {
    @apply flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg;
  }

해결책 2 — 컴포넌트 추출 (권장):
  function PrimaryButton({ children, ...props }) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        {...props}
      >
        {children}
      </button>
    );
  }
  // 재사용 가능하고, TypeScript 타입도 포함
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Tailwind CSS로 반응형 페이지 구현 [Applying]

**목표:** Tailwind 유틸리티 클래스로 반응형 UI를 구현한다.

```
요구사항:
  · 상품 목록 페이지:
    - 모바일(1열), 태블릿(2열), 데스크톱(3열), 와이드(4열) 그리드
    - 상품 카드: 이미지, 이름, 가격, 버튼
    - 카드 hover 시 그림자 확대 + 미세한 위로 이동
  · 반응형 헤더:
    - 모바일: 로고 + 햄버거 메뉴
    - 데스크톱: 로고 + 네비게이션 링크
  · 다크 모드 토글: dark: 접두사로 모든 색상 전환
  · 검색바: focus 시 너비 확장 애니메이션
```

---

### 실습 2: 디자인 토큰 + 테마 시스템 [Applying]

**목표:** CSS 변수 기반 디자인 토큰과 다크 모드를 구현한다.

```
요구사항:
  · CSS 변수로 디자인 토큰 정의 (색상, 간격, 폰트, 그림자, 테두리)
  · Light/Dark 두 가지 테마의 토큰 값 정의
  · data-theme 속성으로 테마 전환
  · localStorage에 테마 설정 저장
  · 시스템 설정(prefers-color-scheme) 감지하여 초기 테마 결정
  · 토큰을 Tailwind config에 연결 (theme.extend.colors)
```

---

### 실습 3: 스타일링 전략 비교 실험 [Analyzing]

**목표:** 같은 UI를 3가지 방식으로 구현하고 차이를 분석한다.

```
과제:
  아래 UI를 CSS Modules, Tailwind CSS, styled-components로 각각 구현하라.

  UI: 사용자 프로필 카드
    - 아바타 (원형)
    - 이름, 이메일
    - 역할 배지 (admin: 파랑, user: 초록)
    - "수정" 버튼
    - hover 효과
    - 반응형 (모바일: 세로, 데스크톱: 가로)

비교표:
  | 항목              | CSS Modules | Tailwind | styled-components |
  |-------------------|------------|----------|-------------------|
  | 파일 수            | ?          | ?        | ?                 |
  | CSS 코드 줄 수     | ?          | ?        | ?                 |
  | 컴포넌트 코드 줄 수 | ?          | ?        | ?                 |
  | 동적 스타일 구현   | ?          | ?        | ?                 |
  | 다크 모드 추가 난이도| ?          | ?        | ?                 |
```

---

### 실습 4 (선택): shadcn/ui 기반 UI 구현 [Applying · Evaluating]

**목표:** shadcn/ui로 프로덕션 수준 UI를 구현한다.

```
요구사항:
  · shadcn/ui에서 Button, Card, Input, Dialog, Table 컴포넌트 추가
  · 추가된 소스 코드를 읽고 구조 파악:
    - Radix UI Primitive 사용 부분
    - cva (class-variance-authority) 패턴
    - cn() 유틸리티 사용 부분
  · 추가된 Button 컴포넌트를 프로젝트에 맞게 커스터마이즈:
    - 새로운 variant 추가 (예: 'warning')
    - 로딩 상태 추가 (isLoading + Spinner)
  · 이 컴포넌트들로 간단한 대시보드 UI 구현

분석:
  · "코드를 소유한다"는 것의 실질적 이점
  · 라이브러리(MUI 등)와의 커스터마이즈 자유도 차이
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 34 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 스타일링에 "정답"은 없지만 트레이드오프를 이해해야 한다    │
│     → CSS Modules: 안정적, 제로 런타임, 일반 CSS 활용        │
│     → Tailwind CSS: 빠른 개발, 일관된 디자인, 제로 런타임 ★  │
│     → CSS-in-JS: 동적 스타일 강점, 런타임 비용, RSC 제한     │
│                                                               │
│  2. Tailwind CSS가 현재 가장 넓은 채택을 보인다               │
│     → 유틸리티 퍼스트: CSS 파일 없이 JSX에서 직접 스타일링   │
│     → 반응형: sm:/md:/lg: 접두사로 간편한 반응형              │
│     → 다크 모드: dark: 접두사로 간편한 테마 전환              │
│     → RSC/SSR 완벽 호환                                     │
│                                                               │
│  3. CSS-in-JS(런타임)는 RSC 시대에 재고가 필요하다            │
│     → Server Component에서 사용 불가                         │
│     → 런타임 비용 인식 증가                                  │
│     → 제로 런타임 대안으로 이동 (vanilla-extract, Panda CSS) │
│                                                               │
│  4. 디자인 토큰 = UI 일관성의 기반                            │
│     → CSS 변수로 색상, 간격, 폰트, 그림자 정의              │
│     → 다크 모드: 토큰 값만 변경하면 전체 UI 전환             │
│     → Tailwind config의 theme.extend로 통합                  │
│                                                               │
│  5. shadcn/ui = 코드를 소유하는 컴포넌트 컬렉션               │
│     → 라이브러리가 아닌 "복사-붙여넣기" 방식                 │
│     → Tailwind + Radix UI 기반 → 접근성 내장                │
│     → 자유로운 커스터마이즈, 라이브러리 종속 없음            │
│                                                               │
│  6. cn() = clsx + twMerge — Tailwind 클래스 안전한 병합       │
│     → 충돌하는 유틸리티를 올바르게 덮어씀                    │
│     → 기본 스타일 + 사용자 커스텀의 자연스러운 결합          │
│                                                               │
│  7. 반응형 = 모바일 퍼스트 + 브레이크포인트 접두사             │
│     → 기본: 모바일, sm: 640px+, md: 768px+, lg: 1024px+     │
│     → grid-cols-1 sm:grid-cols-2 lg:grid-cols-3              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                     | 블룸 단계  | 확인할 섹션 |
| --- | ---------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | CSS Modules가 클래스 이름 충돌을 방지하는 원리는?                                        | Understand | 3.1         |
| 2   | Tailwind의 "유틸리티 퍼스트" 접근이 전통 CSS와 다른 점은?                                | Understand | 3.2         |
| 3   | CSS-in-JS(런타임)가 RSC에서 사용할 수 없는 이유는?                                       | Understand | 3.3         |
| 4   | 디자인 토큰이 다크 모드 전환을 간편하게 만드는 원리는?                                   | Understand | 3.4         |
| 5   | shadcn/ui가 "라이브러리가 아닌" 이유와 그 이점은?                                        | Analyze    | 3.6         |
| 6   | cn()(twMerge)가 단순 clsx보다 필요한 이유를 예시로 설명하라                              | Apply      | 4.3         |
| 7   | Next.js App Router 프로젝트에서 styled-components 대신 Tailwind를 선택하는 근거 3가지는? | Evaluate   | 3.7         |
| 8   | 모바일 퍼스트 반응형에서 sm:grid-cols-2의 의미는?                                        | Apply      | 3.5         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1: Tailwind CSS를 사용하면 JSX가 너무 길어지는 문제를 어떻게 해결하나요?**

A: 세 가지 접근이 있습니다. (1) 반복되는 클래스 조합을 컴포넌트로 추출합니다. `<Button>`, `<Card>` 같은 공통 컴포넌트를 만들면 각 사용 위치에서는 짧은 코드로 충분합니다. (2) `@apply`로 CSS 클래스를 추출할 수 있지만, Tailwind 팀은 이 방식보다 컴포넌트 추출을 권장합니다. (3) `cva(class-variance-authority)` 라이브러리로 variant 기반 클래스를 구조화합니다.

**Q2: 기존 프로젝트에 Tailwind를 점진적으로 도입할 수 있나요?**

A: 가능합니다. Tailwind는 기존 CSS와 완전히 공존할 수 있습니다. 새로 만드는 컴포넌트부터 Tailwind를 적용하고, 기존 컴포넌트는 리팩토링 기회가 생길 때 전환하는 방식이 현실적입니다. 단, 팀 전체가 두 가지 스타일링 방식을 동시에 관리해야 하는 과도기 비용을 고려해야 합니다.

**Q3: CSS Modules와 Tailwind를 함께 사용할 수 있나요?**

A: 기술적으로 가능하지만 권장하지 않습니다. 두 방식을 혼용하면 팀원이 "어떤 상황에 어떤 방식을 쓰는가"를 학습해야 하고, 일관성이 낮아집니다. 프로젝트 초기에 하나를 선택하고 일관성 있게 사용하는 것이 장기적으로 유리합니다.

**Q4: shadcn/ui는 디자인 시스템을 처음 구축하는 팀에게 좋은 선택인가요?**

A: 매우 좋은 출발점입니다. shadcn/ui는 Button, Dialog, Table 같은 기본 컴포넌트를 잘 설계된 코드로 제공하고, 코드를 소유하므로 팀의 요구사항에 맞게 자유롭게 수정할 수 있습니다. 단, shadcn/ui는 Tailwind CSS가 필수이므로 Tailwind를 사용하지 않는 프로젝트에는 적합하지 않습니다.

**Q5: 디자인 토큰을 CSS 변수로 정의할 때 Figma와 어떻게 연동하나요?**

A: Figma Variables(2023년 출시)와 CSS 변수는 직접 매핑이 가능합니다. Figma에서 정의한 변수 이름과 CSS 변수 이름을 일치시키면 디자이너-개발자 간 소통이 명확해집니다. Style Dictionary, Theo 같은 도구는 Figma 토큰을 CSS 변수, Tailwind 설정, Swift 상수 등 다양한 형식으로 자동 변환해줍니다.

---

## 7. 다음 단계 예고

> **Step 35. 국제화(i18n)와 접근성(a11y) 기초** (Phase 5 마무리)
>
> - 다국어 지원의 아키텍처 (i18next, react-intl)
> - 번역 키 관리와 동적 언어 전환
> - 웹 접근성(WCAG) 핵심 원칙
> - 시맨틱 HTML, ARIA, 키보드 접근성
> - Phase 5 전체 통합 복습

---

## 📚 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [CSS Modules — GitHub](https://github.com/css-modules/css-modules)
- [shadcn/ui 공식 사이트](https://ui.shadcn.com/)
- [Tailwind CSS — Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind CSS — Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [styled-components 공식 문서](https://styled-components.com/)
- [vanilla-extract 공식 문서](https://vanilla-extract.style/)

---

> **React 완성 로드맵 v2.0** | Phase 5 — 타입 안전성·폼·스타일링 | Step 34 of 42
