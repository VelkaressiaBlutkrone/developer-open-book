# Step 29. 성능 최적화 심화

> **난이도:** 🔴 고급 (Advanced)

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| **Remember**   | Core Web Vitals(LCP, INP, CLS)의 정의와 측정 기준을 기술할 수 있다        |
| **Understand** | 코드 분할(Code Splitting)이 초기 로딩 성능에 미치는 영향을 설명할 수 있다 |
| **Apply**      | React.lazy + Suspense로 라우트 기반 코드 분할을 구현할 수 있다            |
| **Apply**      | 번들 분석 도구로 병목을 식별하고 최적화를 적용할 수 있다                  |
| **Analyze**    | Lighthouse 결과를 해석하여 성능 개선 우선순위를 결정할 수 있다            |
| **Evaluate**   | 프로젝트에서 가상화, 이미지 최적화, 번들 최적화의 필요성을 판단할 수 있다 |

**전제 지식:**

- Step 10: Concurrent Rendering, Time Slicing
- Step 14: useMemo, useCallback, React.memo ("측정 없이 최적화하지 않는다")
- Step 15: useTransition, useDeferredValue
- Step 19: 렌더링 전략(CSR, SSR, SSG), 성능 지표(TTFB, FCP, TTI)

---

## 1. 서론 — "사용자가 체감하는 성능"을 최적화한다

### 1.1 웹 성능의 역사와 Core Web Vitals의 등장

웹 성능 최적화는 인터넷의 역사와 함께 진화해왔다. 1990년대에는 단순히 HTML 파일 크기를 줄이는 것이 핵심이었고, 2000년대 초반 Yahoo의 Steve Souders가 제시한 "High Performance Web Sites" 14가지 규칙이 성능 최적화의 바이블이 되었다. 당시의 핵심 지표는 네트워크 요청 수와 총 전송 크기였다.

SPA(Single Page Application)의 부상과 함께 성능 문제의 성격이 바뀌었다. 네트워크보다 JavaScript 파싱과 실행 비용이 병목이 되었고, "페이지가 언제 로드됐는가"가 아니라 "사용자가 언제 상호작용할 수 있는가"가 중요한 지표로 부상했다.

Google은 2020년 Core Web Vitals를 발표하며 사용자 경험 중심의 성능 지표 체계를 확립했다. LCP(로딩 속도), FID(반응성), CLS(시각적 안정성) 세 가지를 핵심으로 선정했고, 2024년부터는 FID가 더 정확한 INP로 대체되었다. 중요한 것은 이 지표들이 단순한 기술적 측정값이 아니라 **실제 사용자의 체감 경험**을 수치화했다는 점이다.

### 1.2 Step 14와의 차이

Step 14에서는 **컴포넌트 레벨의 메모이제이션**(useMemo, useCallback, React.memo)을 학습했다. 이 Step에서는 **앱 전체 레벨의 성능 최적화** — 번들 크기, 초기 로딩, 런타임 성능, Core Web Vitals — 를 다룬다.

```
Step 14: 컴포넌트 레벨 최적화
  · "이 컴포넌트가 불필요하게 리렌더링되는가?"
  · useMemo, useCallback, React.memo

Step 29: 앱 레벨 최적화 (이 Step)
  · "사용자에게 첫 화면이 빠르게 보이는가?" (LCP)
  · "사용자 입력에 즉시 반응하는가?" (INP)
  · "화면이 불안정하게 흔들리지 않는가?" (CLS)
  · 번들 크기, 코드 분할, 이미지, 가상화
```

### 1.3 성능 최적화의 산업적 가치

성능은 사용자 경험을 넘어 비즈니스 지표에 직접 영향을 미친다. Amazon의 연구에 따르면 페이지 로딩이 100ms 증가할 때마다 매출이 1% 감소한다. Google 검색 팀의 연구에서는 로딩 시간이 0.5초 늘어날 때 검색 쿼리 수가 20% 줄어드는 것을 확인했다.

현재 Google은 Core Web Vitals 점수를 검색 랭킹 알고리즘에 직접 반영한다. LCP, INP, CLS가 "좋음" 기준을 충족하는 페이지는 그렇지 않은 페이지 대비 검색 노출에서 유리하다. 이는 성능 최적화가 단순한 기술적 개선을 넘어 마케팅 투자 대비 수익(ROI)과 직결되는 비즈니스 의사결정임을 의미한다.

### 1.4 성능 최적화 개념 지도


![웹 성능 최적화 전체 개념 지도](/developer-open-book/diagrams/react-step29-웹-성능-최적화-전체-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step29-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 LCP — 로딩 체감 성능의 핵심 지표

**LCP(Largest Contentful Paint)**는 뷰포트에서 가장 큰 콘텐츠(이미지, 텍스트 블록 등)가 화면에 표시되는 시간이다. 사용자가 "페이지가 로드됐다"고 인식하는 심리적 시점과 가장 잘 일치하는 지표로 선정됐다.

LCP가 중요한 이유는 FCP(First Contentful Paint)가 측정하는 "첫 번째 픽셀"보다 사용자의 실제 인식과 더 잘 맞기 때문이다. 빈 로딩 스피너가 빨리 나타나도 실제 콘텐츠가 늦게 나타나면 사용자는 느리다고 느낀다. LCP는 이 현실을 반영한다.

### 2.2 INP — 반응성의 정밀 측정

**INP(Interaction to Next Paint)**는 사용자의 모든 상호작용(클릭, 탭, 키보드 입력)에 대해 측정한 반응 시간의 75번째 백분위수다. 2024년 FID(First Input Delay)를 대체했다.

FID는 첫 번째 입력만 측정하는 한계가 있었다. INP는 페이지 사용 전반의 모든 상호작용을 측정하므로, "앱이 전반적으로 반응적인가"를 더 정확하게 반영한다. 특히 React SPA에서 상태 업데이트가 무거운 리렌더링을 유발하는 경우 INP가 낮아질 수 있다.

### 2.3 CLS — 시각적 안정성

**CLS(Cumulative Layout Shift)**는 페이지 로드 과정에서 레이아웃이 예상치 못하게 이동하는 정도를 측정한다. 값이 낮을수록 안정적이다.

CLS가 높으면 사용자가 버튼을 클릭하려다 레이아웃이 이동하여 엉뚱한 요소를 클릭하는 상황이 발생한다. 이미지나 광고가 로드되면서 기존 콘텐츠를 밀어내는 것이 가장 흔한 원인이다. 이미지에 `width`/`height`를 명시하거나 `aspect-ratio`로 공간을 미리 확보하면 방지할 수 있다.

### 2.4 Code Splitting — 번들 분할 전략

**Code Splitting**은 하나의 큰 JS 번들을 여러 작은 청크로 분할하여 필요한 것만 로드하는 기법이다. 모든 페이지 코드를 첫 방문 시 다운로드하는 대신, 현재 페이지에 필요한 코드만 로드하고 다른 페이지의 코드는 해당 페이지 방문 시 로드한다.

### 2.5 Tree Shaking — 미사용 코드 제거

**Tree Shaking**은 번들러가 사용하지 않는 코드를 제거하는 최적화다. ES Module의 `import/export` 정적 분석을 기반으로 하며, CommonJS(`require/module.exports`)는 동적으로 분석되므로 Tree Shaking이 불가능하다.

Tree Shaking이 중요한 이유는 `import _ from 'lodash'` 한 줄로 70KB짜리 라이브러리 전체가 번들에 포함될 수 있기 때문이다. `import debounce from 'lodash/debounce'`처럼 필요한 함수만 import하면 실제로 사용하는 코드만 번들에 포함된다.

### 2.6 Virtualization — DOM 노드 최소화

**Virtualization(가상화/윈도잉)**은 화면에 보이는 항목만 DOM에 렌더링하고 나머지는 제거하는 기법이다. 스크롤 위치에 따라 DOM을 동적으로 교체하여, 10,000개 항목 리스트도 50개 DOM 노드만으로 표현할 수 있다.

### 2.7 핵심 용어 요약

| 용어               | 정의                                                                                            | 왜 중요한가                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **LCP**            | Largest Contentful Paint. 뷰포트에서 **가장 큰 콘텐츠**가 표시되는 시간. 좋음 ≤ 2.5s            | Core Web Vitals 핵심. 사용자가 "페이지가 로드됐다"고 느끼는 시점 |
| **INP**            | Interaction to Next Paint. 사용자 상호작용 후 **다음 화면 업데이트**까지의 시간. 좋음 ≤ 200ms   | FID를 대체한 새 지표(2024~). 앱의 반응성을 측정                  |
| **CLS**            | Cumulative Layout Shift. 페이지 로드 중 **레이아웃이 얼마나 불안정하게 이동**하는지. 좋음 ≤ 0.1 | 광고/이미지 로드 시 콘텐츠가 밀려나는 현상을 측정                |
| **Code Splitting** | 하나의 큰 JS 번들을 **여러 작은 청크로 분할**하여 필요한 것만 로드하는 기법                     | 초기 로딩에 모든 코드를 다운로드하지 않아도 됨                   |
| **React.lazy**     | 컴포넌트를 **동적으로 import**하여 해당 컴포넌트가 필요한 시점에 로드하는 API                   | Suspense와 결합하여 코드 분할을 구현                             |
| **Tree Shaking**   | 번들러가 **사용하지 않는 코드를 제거**하는 최적화. ES Module의 정적 분석 기반                   | 번들 크기를 줄이는 가장 기본적인 방법                            |
| **Virtualization** | 화면에 **보이는 항목만 DOM에 렌더링**하고 나머지는 제거하는 기법                                | 10,000개 리스트도 50개 DOM 노드만으로 표현                       |
| **Lighthouse**     | Google의 **웹 성능 진단 도구**. 성능, 접근성, SEO 등을 점수로 평가                              | "측정 없이 최적화하지 않는다" 원칙의 실천 도구                   |

### 2.8 Core Web Vitals 개요


![Core Web Vitals (2024~)](/developer-open-book/diagrams/react-step29-core-web-vitals-2024.svg)


---

## 3. 이론과 원리

### 3.1 코드 분할 (Code Splitting)

코드 분할은 현대 React 앱에서 가장 즉각적인 효과를 내는 최적화 기법이다. 별도의 서버 설정이나 복잡한 알고리즘 없이, `React.lazy`와 동적 `import()`만으로 초기 번들 크기를 80% 이상 줄일 수 있는 경우가 많다.

핵심 원리는 동적 `import()`가 새로운 청크(chunk) 파일을 생성한다는 것이다. 번들러(Vite, Webpack)는 `import()` 호출 지점을 감지하여 해당 모듈과 그 의존성을 별도의 파일로 분리한다. 브라우저는 해당 컴포넌트가 처음 렌더링될 때 비로소 청크 파일을 다운로드한다.

#### 문제: 하나의 거대한 번들


![코드 분할 없이:](/developer-open-book/diagrams/react-step29-코드-분할-없이.svg)


#### 해결: React.lazy + Suspense

```jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── 정적 import: 항상 번들에 포함 ──
import HomePage from "./pages/HomePage";
import Spinner from "./components/Spinner";

// ── 동적 import: 필요할 때만 로드 ──
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```


![코드 분할 후:](/developer-open-book/diagrams/react-step29-코드-분할-후.svg)


#### lazy 사용 규칙과 패턴

```jsx
// 규칙 1: lazy()는 모듈 최상위에서 호출 (렌더링 중 호출 금지)
// ✅ 올바름
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

// ❌ 잘못됨 — 컴포넌트 안에서 lazy
function App() {
  const Page = lazy(() => import('./pages/ProductsPage')); // 매 렌더링마다 새 lazy!
}


// 규칙 2: default export가 있는 모듈만 lazy 가능
// ✅ pages/ProductsPage.jsx
export default function ProductsPage() { ... }

// named export를 lazy하려면:
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then(module => ({
    default: module.ProductsPage
  }))
);


// 패턴: 라우트별 Suspense 분리로 더 세밀한 로딩 UI
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsPage />
          </Suspense>
        } />
        <Route path="/dashboard" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}


// 패턴: Prefetch로 코드를 미리 로드
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

// 마우스 호버 시 미리 로드
function NavLink({ to, children }) {
  const handleMouseEnter = () => {
    if (to === '/products') {
      import('./pages/ProductsPage'); // 미리 로드!
    }
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### 3.2 번들 분석과 최적화

번들 분석은 "어디서 KB가 낭비되는가"를 시각적으로 보여준다. 예상치 못하게 큰 라이브러리, Tree Shaking이 적용되지 않은 모듈, 여러 페이지에 중복 포함된 코드를 발견할 수 있다. 분석 없이 최적화를 시도하는 것은 지도 없이 목적지를 찾는 것과 같다.

#### 번들 분석 도구


![번들 크기를 "측정"하는 도구](/developer-open-book/diagrams/react-step29-번들-크기를-측정-하는-도구.svg)


#### 번들 크기 줄이기 전략


![전략 1: 무거운 라이브러리를 동적 import](/developer-open-book/diagrams/react-step29-전략-1-무거운-라이브러리를-동적-import.svg)


### 3.3 이미지 최적화

이미지는 현대 웹 페이지에서 가장 큰 리소스다. HTTP Archive의 통계에 따르면 페이지 총 전송 크기의 평균 50% 이상을 이미지가 차지한다. 이미지 최적화는 LCP 개선에 가장 직접적인 영향을 미치며, CLS 방지에도 필수적이다.


![이미지는 웹 페이지에서 가장 큰 리소스 (평균 전체 크기의 50%+)](/developer-open-book/diagrams/react-step29-이미지는-웹-페이지에서-가장-큰-리소스-평균-전체-크기의-50.svg)


```jsx
// React에서의 이미지 최적화 예시
function ProductImage({ src, alt, width, height }) {
  return (
    <picture>
      <source srcSet={`${src}?format=avif`} type="image/avif" />
      <source srcSet={`${src}?format=webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height} // CLS 방지
        loading="lazy" // 뷰포트 밖이면 지연 로드
        decoding="async" // 메인 스레드 차단 방지
      />
    </picture>
  );
}

// LCP 대상 히어로 이미지 — 지연 로드 하지 않음!
function HeroImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      width={1200}
      height={600}
      fetchpriority="high" // 최우선 로드
      // loading="lazy" 사용 금지! LCP 이미지는 즉시 로드
    />
  );
}
```

```
⚠️ Next.js의 <Image> 컴포넌트

  Next.js를 사용한다면 자체 <Image> 컴포넌트가 위의 모든 최적화를 자동 적용:
    · 자동 WebP/AVIF 변환
    · 반응형 srcSet 생성
    · 지연 로딩 기본 적용
    · width/height 자동 추론 (로컬 이미지)
    · 온디맨드 리사이징

  import Image from 'next/image';
  <Image src="/hero.jpg" alt="히어로" width={1200} height={600} priority />
```

### 3.4 Virtualization — 대규모 리스트 처리

Virtualization은 "보이는 것만 렌더링한다"는 단순하지만 강력한 원칙이다. 브라우저는 DOM 노드를 생성, 레이아웃 계산, 페인팅하는 데 비용이 든다. 화면에 보이지 않는 9,970개 항목을 DOM에 유지할 이유가 없다.

#### 문제: 10,000개 DOM 노드


![<ul>](/developer-open-book/diagrams/react-step29-ul.svg)


#### 해결: Virtualization (Windowing)


![Virtualization의 원리](/developer-open-book/diagrams/react-step29-virtualization의-원리.svg)


```jsx
// TanStack Virtual (구 react-virtual) 사용 예시
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length, // 전체 항목 수
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 각 항목의 예상 높이(px)
    overscan: 5, // 버퍼 (보이는 영역 위아래 5개 추가)
  });

  return (
    <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
      {/* 전체 높이를 확보하여 스크롤바가 올바르게 표시 */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}

// 10,000개 항목이어도 DOM에는 ~30개만 존재!
```

```
Virtualization이 필요한 시점

  ✅ 필요한 경우:
    · 리스트 항목이 500개 이상
    · 각 항목의 렌더링 비용이 높음 (복잡한 UI)
    · 스크롤 시 버벅임이 체감됨
    · 테이블에 수천 행이 있음

  ❌ 불필요한 경우:
    · 리스트 항목이 100개 이하
    · 각 항목이 단순한 텍스트
    · 페이지네이션으로 이미 제한
    · 무한 스크롤이지만 한 번에 20개씩만 추가

  라이브러리:
    · TanStack Virtual: 경량, Headless, 유연 (권장)
    · react-window: 간결한 API, 리스트와 그리드
    · react-virtuoso: 기능 풍부, 자동 크기 감지
```

### 3.5 Lighthouse를 활용한 성능 진단

Lighthouse는 성능 최적화의 시작점이자 검증 도구다. "측정 없이 최적화하지 않는다"는 Step 14의 원칙을 앱 레벨에서 실천하는 가장 접근하기 쉬운 방법이다. 특히 Opportunities 섹션의 구체적인 개선 제안은 어디서부터 최적화를 시작해야 하는지 명확한 우선순위를 제공한다.

#### 측정 방법

```
Lighthouse 사용 방법

  1. Chrome DevTools > Lighthouse 탭
  2. "Analyze page load" 클릭
  3. 카테고리 선택: Performance (필수), Accessibility, SEO 등
  4. 결과 분석

  또는:
  · PageSpeed Insights (https://pagespeed.web.dev/)
  · Chrome Extension: Lighthouse
  · CLI: npx lighthouse https://myapp.com


Lighthouse 결과 해석

  Performance Score: 0~100
    · 90~100: 우수 (녹색)
    · 50~89: 보통 (주황)
    · 0~49: 나쁨 (빨강)

  세부 지표:
    · FCP (First Contentful Paint): 첫 콘텐츠 표시
    · LCP (Largest Contentful Paint): 가장 큰 콘텐츠 표시
    · TBT (Total Blocking Time): 메인 스레드 차단 시간 (INP 대리)
    · CLS (Cumulative Layout Shift): 레이아웃 이동
    · Speed Index: 콘텐츠가 시각적으로 채워지는 속도

  "Opportunities" 섹션:
    · 구체적인 개선 제안과 예상 절약 시간
    · "Reduce unused JavaScript": 코드 분할 필요
    · "Serve images in next-gen formats": WebP/AVIF 사용
    · "Properly size images": 반응형 이미지 필요
    · "Eliminate render-blocking resources": CSS/JS 최적화

  "Diagnostics" 섹션:
    · "Avoid enormous network payloads": 전체 전송 크기
    · "Minimize main-thread work": JS 실행 시간
    · "Reduce JavaScript execution time": 무거운 스크립트
    · "Avoid large layout shifts": CLS 원인
```

#### Core Web Vitals별 최적화 전략


![LCP 개선 전략:](/developer-open-book/diagrams/react-step29-lcp-개선-전략.svg)


### 3.6 성능 최적화 우선순위 프레임워크

성능 최적화는 "모든 것을 한 번에" 하는 것이 아니라, 효과 대비 비용이 가장 높은 것부터 순서대로 적용하는 체계적 접근이 필요하다. 과도한 최적화는 코드 복잡성을 높이고 유지보수를 어렵게 만든다.


!["무엇을 먼저 최적화해야 하는가?"](/developer-open-book/diagrams/react-step29-무엇을-먼저-최적화해야-하는가.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: 코드 분할로 초기 로딩 81% 감소

이 사례는 실제 프로덕션 환경에서 코드 분할의 효과를 보여준다. 특히 대시보드 페이지에 포함된 차트 라이브러리(250KB)가 홈 페이지 방문자에게도 로드되던 문제를 해결한 전형적인 케이스다.


![Before: 단일 번들](/developer-open-book/diagrams/react-step29-before-단일-번들.svg)


### 4.2 사례: CLS 문제 진단과 해결

CLS 문제는 처음에는 눈에 띄지 않다가 사용자가 버튼을 잘못 클릭하거나 콘텐츠를 읽는 도중 레이아웃이 이동하면서 불편함을 호소할 때 발견되는 경우가 많다. Lighthouse가 원인을 명확히 지목하므로 해결이 비교적 간단하다.


![문제: 이미지 로드 시 레이아웃이 밀려남](/developer-open-book/diagrams/react-step29-문제-이미지-로드-시-레이아웃이-밀려남.svg)


### 4.3 사례: 가상화로 10,000개 리스트 최적화

대규모 리스트 문제는 데이터 테이블, 로그 뷰어, 상품 목록 등에서 자주 발생한다. Virtualization 적용은 코드 변경량이 적지 않지만, 효과가 극적이어서 한번 경험하면 필요성을 바로 체감할 수 있다.

```
Before: 일반 렌더링
  · 10,000개 <li> 생성
  · 초기 렌더링: 450ms
  · 스크롤 시 프레임 드롭: 심각
  · 메모리: 85MB

After: TanStack Virtual 적용
  · DOM에 ~30개 <li>만 존재
  · 초기 렌더링: 5ms
  · 스크롤: 60fps 유지
  · 메모리: 12MB

  개선: 렌더링 99% 감소, 메모리 86% 감소
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 라우트 기반 코드 분할 [Applying]

**목표:** React.lazy + Suspense로 코드 분할을 구현한다.

```
요구사항:
  · 5개 페이지 앱 구성 (홈, 상품, 대시보드, 설정, 관리자)
  · 홈 페이지만 정적 import, 나머지는 React.lazy
  · 각 페이지에 무거운 컴포넌트 시뮬레이션 (큰 라이브러리 import)
  · 라우트별 Suspense fallback (스켈레톤 UI)
  · 네비게이션 링크 호버 시 prefetch 구현
  · DevTools Network 탭에서 청크 로딩 확인

분석할 것:
  · npm run build 후 생성된 청크 파일 목록과 크기
  · 초기 로딩 시 다운로드되는 파일 수
  · 페이지 전환 시 추가 로딩되는 파일
```

---

### 실습 2: Lighthouse 진단 + 개선 [Analyzing · Applying]

**목표:** Lighthouse로 성능을 측정하고 개선한다.


![과제:](/developer-open-book/diagrams/react-step29-과제.svg)


---

### 실습 3: 번들 분석 + 최적화 [Analyzing]

**목표:** 번들 분석 도구로 병목을 식별하고 최적화한다.


![과제:](/developer-open-book/diagrams/react-step29-과제-16.svg)


---

### 실습 4 (선택): Virtualization 구현 [Applying]

**목표:** 대규모 리스트에 가상화를 적용한다.


![요구사항:](/developer-open-book/diagrams/react-step29-요구사항.svg)


---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 29 핵심 요약](/developer-open-book/diagrams/react-step29-step-29-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                                      | 블룸 단계  | 확인할 섹션 |
| --- | ----------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | LCP, INP, CLS 각각의 의미와 "좋음" 기준값은?                                              | Remember   | 2.8         |
| 2   | React.lazy가 번들 크기를 줄이는 원리를 "동적 import" 관점에서 설명하라                    | Understand | 3.1         |
| 3   | LCP 대상 이미지에 loading="lazy"를 적용하면 안 되는 이유는?                               | Understand | 3.3         |
| 4   | CLS가 발생하는 원인 3가지와 각각의 해결법은?                                              | Apply      | 3.5         |
| 5   | 번들 분석 결과 chart.js(250KB)가 대시보드에서만 사용된다면 어떻게 최적화하는가?           | Apply      | 3.2         |
| 6   | Virtualization이 10,000개 리스트의 성능을 개선하는 원리를 "DOM 노드 수" 관점에서 설명하라 | Analyze    | 3.4         |
| 7   | Lighthouse Opportunities에서 "Reduce unused JavaScript"가 나왔을 때 적용할 최적화는?      | Analyze    | 3.5         |
| 8   | 100개 항목의 단순 텍스트 리스트에 Virtualization을 적용하는 것이 불필요한 이유는?         | Evaluate   | 3.4         |

### 6.3 FAQ

**Q1. Lighthouse 점수와 실제 사용자 경험은 항상 일치하는가?**

반드시 그렇지는 않다. Lighthouse는 통제된 환경(빠른 네트워크, 고사양 장치 또는 시뮬레이션)에서 측정하므로, 실제 사용자의 다양한 네트워크 조건과 기기 성능을 완전히 반영하지 못할 수 있다. Google의 Chrome User Experience Report(CrUX)나 Field Data(실제 사용자 데이터)를 Lighthouse의 Lab Data와 함께 확인하는 것이 더 정확한 성능 평가다.

**Q2. React.lazy와 동적 import만 있으면 코드 분할이 완료되는가?**

React.lazy는 컴포넌트 단위 코드 분할을 처리하지만, 공통 모듈(vendor chunk)이 비효율적으로 중복될 수 있다. Vite의 `build.rollupOptions.output.manualChunks`를 설정하면 React, 공통 라이브러리를 별도 청크로 분리하여 브라우저 캐시를 최대한 활용할 수 있다. 기본 설정만으로 충분한 경우가 많지만, 번들 분석 후 필요에 따라 세밀하게 조정한다.

**Q3. Virtualization 적용 시 검색 엔진 크롤러가 콘텐츠를 인덱싱하지 못하는 문제가 있는가?**

잠재적 문제가 있다. Virtualization은 DOM에 일부만 렌더링하므로, 크롤러가 JavaScript를 실행하지 않거나 스크롤 이벤트를 시뮬레이션하지 않으면 일부 콘텐츠를 놓칠 수 있다. SEO가 중요한 목록 페이지라면 SSR(서버 사이드 렌더링)과 함께 사용하거나, 초기 렌더링은 전체 목록을 HTML로 제공하고 이후 가상화로 전환하는 하이브리드 접근을 고려한다.

**Q4. 코드 분할 후 페이지 전환 시 청크 로딩 시간이 사용자에게 느리게 느껴지는 문제를 어떻게 해결하는가?**

세 가지 접근이 있다. 첫째, Prefetch를 활용하여 사용자가 링크에 호버하거나 특정 액션을 취할 때 미리 청크를 로드한다. 둘째, 라우트별 Skeleton UI를 Suspense fallback으로 제공하여 로딩 중임을 시각적으로 표시한다. 셋째, 중요한 페이지(전환율이 높은 페이지)는 정적 import로 메인 번들에 포함하고, 덜 방문되는 페이지만 코드 분할을 적용한다.

**Q5. 이미지 최적화에서 WebP로 변환하는 작업은 언제 수행하는가?**

빌드 타임, 서버 사이드, CDN 세 가지 방법이 있다. Vite의 `vite-plugin-imagemin` 같은 플러그인으로 빌드 시 자동 변환할 수 있다. Next.js의 `<Image>` 컴포넌트는 요청 시 온디맨드로 최적화하며 CDN 캐싱을 함께 활용한다. Cloudinary, Imgix 같은 이미지 CDN은 URL 파라미터로 포맷과 크기를 동적으로 제어한다. 소규모 프로젝트는 빌드 타임 변환, 중대형 프로젝트는 CDN 기반 접근이 권장된다.

---

## 7. 다음 단계 예고

> **Step 30. Suspense 아키텍처와 고급 패턴** (Phase 4 마무리)
>
> - Suspense의 설계 철학과 동작 원리
> - 데이터 패칭을 위한 Suspense (use() + ErrorBoundary)
> - Streaming SSR과 Suspense의 결합
> - Suspense 기반 로딩 UX 설계
> - Phase 4 전체 통합 복습

---

## 📚 참고 자료

- [Web.dev — Core Web Vitals](https://web.dev/vitals/)
- [Web.dev — Optimize LCP](https://web.dev/optimize-lcp/)
- [Web.dev — Optimize INP](https://web.dev/optimize-inp/)
- [Web.dev — Optimize CLS](https://web.dev/optimize-cls/)
- [React 공식 문서 — Code Splitting (lazy)](https://react.dev/reference/react/lazy)
- [React 공식 문서 — Suspense](https://react.dev/reference/react/Suspense)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [Lighthouse 공식 문서](https://developer.chrome.com/docs/lighthouse/)
- [Vite — Build Optimization](https://vite.dev/guide/build.html)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 29 of 42
