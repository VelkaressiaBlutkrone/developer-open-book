# Step 19. 렌더링 전략 비교 분석

> **난이도:** 🟡 중급 (Intermediate)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                |
| -------------- | ------------------------------------------------------------------- |
| **Remember**   | CSR, SSR, SSG, ISR, Streaming SSR의 정의를 기술할 수 있다           |
| **Understand** | Hydration의 정확한 과정과 왜 필요한지를 설명할 수 있다              |
| **Understand** | 각 렌더링 전략의 요청-응답 흐름을 단계별로 설명할 수 있다           |
| **Analyze**    | FCP, TTFB, TTI 등 성능 지표 관점에서 전략별 차이를 분석할 수 있다   |
| **Analyze**    | SEO, 초기 로딩, 동적 데이터 관점에서 전략별 장단점을 비교할 수 있다 |
| **Evaluate**   | 프로젝트 요구사항에 따라 적절한 렌더링 전략을 판단할 수 있다        |

**전제 지식:**

- Step 3: SPA/MPA, CSR/SSR/SSG 개요, React 생태계에서 메타 프레임워크의 위치
- Step 4: React Element, ReactDOM, "렌더링 = 함수 실행"
- Step 10: Render Phase / Commit Phase, Concurrent Rendering, Streaming

---

## 1. 서론 — "어디에서 HTML을 만드는가"가 전부다

### 1.1 렌더링 전략의 역사적 등장 배경

웹의 초창기, 모든 HTML은 서버에서 완성되어 전달되었다. PHP, JSP, ASP 같은 서버 사이드 템플릿 언어가 요청마다 데이터베이스를 조회하고 HTML을 조립해 보내는 방식이 표준이었다. 이 방식은 단순하고 SEO에 유리했지만, 사용자가 버튼 하나를 클릭할 때마다 전체 페이지를 새로 불러와야 했다. 페이지 전환 시의 흰 화면 깜빡임(Flash of Unstyled Content)과 느린 반응성은 사용자 경험의 걸림돌이었다.

2004년 Gmail이 XMLHttpRequest를 활용한 비동기 업데이트로 세상을 놀라게 하면서 **Ajax(Asynchronous JavaScript and XML)** 시대가 열렸다. 이후 jQuery, Backbone.js, AngularJS 등이 등장하며 클라이언트에서 점점 더 많은 로직을 처리하게 되었다. 2013년 React의 등장은 이 흐름을 가속화했고, 2015년을 전후로 **SPA(Single Page Application)** 가 주류가 되었다. 서버는 HTML이 아닌 JSON 데이터만 제공하고, 브라우저가 모든 렌더링을 담당하는 **CSR(Client-Side Rendering)** 패러다임이 확립된 것이다.

그러나 CSR의 한계는 곧 드러났다. 구글 검색 크롤러가 JavaScript를 제대로 실행하지 못하던 시절, CSR 앱은 검색 엔진에 보이지 않는 유령 사이트였다. 초기 JS 번들이 수 MB에 달하면서 모바일 사용자의 이탈률이 급증했다. 이 문제를 해결하기 위해 **SSR(Server-Side Rendering)** 이 다시 주목받았고, Next.js(2016), Nuxt.js 등 메타 프레임워크가 SSR을 현대적으로 재해석하며 등장했다. SSG, ISR, Streaming SSR은 이 흐름 위에서 각각의 한계를 극복하며 발전해 온 전략들이다.

### 1.2 산업적 가치와 비즈니스 영향

렌더링 전략의 선택은 단순한 기술적 결정이 아니라 **비즈니스 결과에 직결**된다. Google의 연구에 따르면 페이지 로딩 시간이 1초 증가할 때마다 전환율(Conversion Rate)이 7% 감소한다. Amazon은 100ms의 지연이 연간 수억 달러의 매출 손실로 이어진다고 밝힌 바 있다.

SEO 측면에서도 렌더링 전략은 결정적이다. Google은 Core Web Vitals(LCP, FID/INP, CLS)를 검색 순위 신호로 사용하고 있으며, 이 지표들은 렌더링 전략에 따라 크게 달라진다. SSG나 SSR로 구성된 페이지는 동일한 콘텐츠의 CSR 페이지보다 검색 순위에서 유리한 위치를 차지할 수 있다. 전자상거래 사이트에서 상품 페이지를 SSG/ISR로 전환했을 때 유기적 트래픽이 40% 이상 증가한 사례도 보고된다.

### 1.3 렌더링 전략 개념 지도

![렌더링 전략 비교](/developer-open-book/diagrams/react-step19-rendering-strategies.svg)

### 1.4 이 Step에서 다루는 범위

![Step 19 다루는 범위](/developer-open-book/diagrams/react-step19-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                    | 정의                                                                                            | 왜 중요한가                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **CSR**                 | Client-Side Rendering. 브라우저에서 JavaScript로 HTML을 생성하는 방식                           | React의 기본 렌더링 방식이다. Vite + React Router 앱이 이에 해당 |
| **SSR**                 | Server-Side Rendering. 서버에서 요청마다 HTML을 생성하여 보내는 방식                            | SEO와 빠른 초기 화면 표시에 유리하다                             |
| **SSG**                 | Static Site Generation. 빌드 시점에 HTML을 미리 생성하는 방식                                   | 가장 빠른 응답 속도. 변하지 않는 콘텐츠에 최적                   |
| **ISR**                 | Incremental Static Regeneration. SSG로 생성된 페이지를 특정 주기로 재생성                       | SSG의 한계(빌드 시점 고정)를 보완하면서 속도 유지                |
| **Streaming SSR**       | HTML을 한 번에 보내지 않고 **준비된 부분부터 점진적으로 전송**하는 SSR                          | 긴 데이터 패칭이 있어도 첫 화면을 빠르게 표시                    |
| **Hydration**           | 서버에서 보낸 정적 HTML에 JavaScript **이벤트 핸들러를 연결**하여 상호작용 가능하게 만드는 과정 | SSR의 핵심 단계. HTML은 보이지만 클릭이 안 되는 구간의 원인      |
| **TTFB**                | Time To First Byte. 요청 후 **서버 응답의 첫 바이트**가 도착하는 시간                           | 서버 처리 속도의 지표                                            |
| **FCP**                 | First Contentful Paint. 브라우저가 **첫 번째 콘텐츠**를 화면에 표시하는 시간                    | 사용자가 "뭔가 보인다"고 느끼는 시점                             |
| **TTI**                 | Time To Interactive. 페이지가 **완전히 상호작용 가능**해지는 시간                               | 사용자가 클릭/입력을 했을 때 반응하는 시점                       |
| **LCP**                 | Largest Contentful Paint. **가장 큰 콘텐츠 요소**가 표시되는 시간                               | Core Web Vitals의 핵심 지표                                      |
| **Selective Hydration** | 전체 페이지가 아닌 **준비된 컴포넌트부터 점진적으로 Hydration**하는 기법                        | 사용자가 상호작용하려는 부분을 우선 Hydration                    |

### 2.2 각 용어의 이론적 배경

**CSR의 이론적 기반**

CSR은 브라우저의 JavaScript 엔진이 강력해지면서 가능해진 패러다임이다. V8 엔진(Chrome), SpiderMonkey(Firefox) 등 현대 JS 엔진은 JIT(Just-In-Time) 컴파일을 통해 코드를 기계어에 가까운 속도로 실행한다. React의 Virtual DOM 알고리즘은 이 연산력을 활용해 효율적인 DOM 업데이트를 가능하게 한다. 그러나 이 모든 처리가 네트워크 다운로드 이후에야 시작된다는 구조적 한계가 있다.

```
CSR이 느린 이유 — 직렬 의존성 체인

  네트워크 요청
    → HTML 수신 (빈 껍데기)
      → JS 번들 다운로드 (수백 KB ~ 수 MB)
        → JS 파싱 (CPU 집약적)
          → React 초기화
            → 컴포넌트 렌더링
              → API 데이터 패칭
                → 최종 화면 완성

  각 단계가 앞 단계에 의존 → 병렬 처리 불가
  모바일 + 저속 네트워크에서 심각한 지연 발생
```

**SSR과 Hydration의 이론적 기반**

SSR은 서버의 연산력을 활용하여 클라이언트의 작업을 사전에 처리하는 개념이다. 서버는 일반적으로 브라우저보다 훨씬 강력한 CPU와 네트워크 환경(DB와 동일 네트워크)을 가지므로, 데이터 조회와 렌더링을 서버에서 수행하면 전체 시간을 줄일 수 있다. 그러나 서버에서 생성된 HTML은 "정적인 문자열"에 불과하여 React의 이벤트 시스템과 연결되지 않은 상태다. **Hydration**은 이 정적 HTML을 React가 "인수인계"받아 이벤트 핸들러를 연결하고 상태 관리를 시작하는 과정이다.

Hydration의 비용은 무시할 수 없다. React는 서버에서 생성된 DOM 트리 전체를 순회하며 Virtual DOM을 구성하고, 각 노드에 이벤트를 연결해야 한다. 페이지가 복잡할수록 이 비용은 선형적으로 증가하여 TTI를 지연시킨다.

**SSG와 ISR의 이론적 기반**

SSG는 "빌드 시점에 알 수 있는 모든 정보를 미리 처리한다"는 원칙에 기반한다. CDN(Content Delivery Network)은 정적 파일을 전 세계 엣지 서버에 캐싱하여 사용자와 가장 가까운 서버에서 즉각 응답한다. 이 구조는 서버 렌더링 비용이 전혀 없으므로 트래픽이 급증해도 부하가 증가하지 않는다는 이론적 이점을 갖는다.

ISR은 HTTP 캐싱의 **Stale-While-Revalidate** 전략을 서버 사이드 렌더링에 적용한 개념이다. "오래된 캐시라도 즉시 반환하고, 백그라운드에서 갱신한다"는 원칙은 응답 지연과 데이터 신선도 사이의 트레이드오프를 현실적으로 해결한다.

### 2.3 성능 지표 타임라인과 개념 간 관계

![성능 지표 타임라인](/developer-open-book/diagrams/react-step19-performance-timeline.svg)

---

## 3. 이론과 원리

### 3.1 CSR (Client-Side Rendering) — 브라우저가 HTML을 만든다

#### 동작 과정

![CSR 동작 과정](/developer-open-book/diagrams/react-step19-csr-flow.svg)

#### 서버가 보내는 HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <script type="module" src="/assets/index-abc123.js"></script>
    <link rel="stylesheet" href="/assets/index-def456.css" />
  </head>
  <body>
    <div id="root"></div>
    <!-- 비어 있다! -->
  </body>
</html>

<!--
  · HTML에 실제 콘텐츠가 없다
  · 검색 엔진 크롤러가 이것을 받으면 빈 페이지로 인식
  · JS가 실행되어야 비로소 콘텐츠가 생성된다
-->
```

#### CSR의 장단점

```
장점:
  · 서버 부하가 적다 (정적 파일만 제공)
  · 풍부한 상호작용 (페이지 전환이 빠르고 부드러움)
  · CDN으로 배포 가능 (서버리스)
  · 개발이 간단하다 (Vite + React)
  · 초기 로드 후 네비게이션은 매우 빠르다

단점:
  · 느린 초기 로딩 (JS 번들 다운로드 + 실행 + API 패칭)
  · SEO 불리 (빈 HTML → 크롤러가 콘텐츠를 보지 못할 수 있음)
  · JS 비활성화 시 동작 불가
  · FCP/LCP가 느리다 (JS 실행 전에는 빈 화면)
  · 번들 크기가 클수록 초기 로딩이 느려진다
```

### 3.2 SSR (Server-Side Rendering) — 서버가 HTML을 만든다

#### 동작 과정

```
사용자가 https://myapp.com/products 요청

  ┌─── 서버 ───┐                    ┌─── 브라우저 ───┐
  │             │                    │                │
  │  1. React   │                    │                │
  │  컴포넌트를 │                    │                │
  │  실행하여   │                    │                │
  │  HTML 생성  │                    │                │
  │  (+ 데이터  │                    │                │
  │   패칭)     │                    │                │
  │             │                    │                │
  │  2. 완성된  │ ──────────────→   │  3. HTML 수신  │
  │  HTML 전송  │                    │  (콘텐츠 포함!)│
  │             │                    │  → FCP! ★     │
  │             │                    │  화면이 보인다 │
  │             │                    │  (클릭은 아직  │
  │             │                    │   안 됨!)      │
  │             │                    │                │
  │             │                    │  4. JS 번들    │
  │             │                    │  다운로드 + 실행│
  │             │                    │                │
  │             │                    │  5. Hydration  │
  │             │                    │  이벤트 핸들러 │
  │             │                    │  연결 ★        │
  │             │                    │  → TTI!        │
  │             │                    │  상호작용 가능 │
  └─────────────┘                    └────────────────┘

타임라인:
  요청 → TTFB(느림! 서버가 렌더링하는 시간) → FCP(빠름! HTML에 콘텐츠)
  → JS 다운로드 → Hydration → TTI
```

#### 서버가 보내는 HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>상품 목록 — My App</title>
    <script type="module" src="/assets/index-abc123.js"></script>
  </head>
  <body>
    <div id="root">
      <!-- 서버에서 렌더링된 실제 콘텐츠가 포함되어 있다! -->
      <header>
        <nav><a href="/">홈</a><a href="/products">상품</a></nav>
      </header>
      <main>
        <h1>상품 목록</h1>
        <ul>
          <li>노트북 — 1,200,000원</li>
          <li>키보드 — 85,000원</li>
          <li>마우스 — 45,000원</li>
        </ul>
      </main>
    </div>
  </body>
</html>

<!--
  · HTML에 실제 콘텐츠가 포함되어 있다!
  · 검색 엔진이 콘텐츠를 즉시 읽을 수 있다
  · JS가 로드되기 전에도 화면이 보인다
  · 하지만 버튼 클릭, 입력 등은 Hydration 이후에 동작
-->
```

#### SSR의 장단점

```
장점:
  · 빠른 FCP (서버에서 HTML 완성 → 즉시 콘텐츠 표시)
  · SEO 우수 (크롤러가 완성된 HTML을 받음)
  · 소셜 미디어 공유 시 미리보기(OG 태그) 정상 동작
  · 데이터가 포함된 상태로 전달 (API Waterfall 감소)

단점:
  · TTFB가 느릴 수 있다 (서버 렌더링 시간이 추가됨)
  · 서버 부하 증가 (매 요청마다 렌더링)
  · 서버 인프라가 필요하다 (CDN만으로 불가)
  · Hydration 전까지 "보이지만 반응하지 않는" 구간 존재
  · 서버/클라이언트 코드 공유의 복잡성
```

### 3.3 Hydration — "정적 HTML에 생명을 불어넣다"

#### Hydration의 정확한 과정

```
Hydration이 하는 일

  서버가 보낸 HTML         Hydration 후
  ─────────────────        ─────────────────
  <button>좋아요</button>  <button>좋아요</button>
  (보이지만 클릭해도        (클릭하면 onClick 핸들러
   아무 일 없음)            가 실행됨!)

  상세 과정:
  1. 서버가 HTML 문자열을 보낸다
     → 브라우저가 DOM을 구성하고 화면에 표시 (Paint)
     → 이 시점: 보이지만 상호작용 불가

  2. JS 번들이 다운로드되어 실행된다
     → React가 메모리에 Virtual DOM을 구성한다

  3. React가 서버의 DOM과 클라이언트의 Virtual DOM을 "매칭"한다
     → 기존 DOM 노드를 새로 만들지 않고 "재사용"한다
     → 이벤트 핸들러(onClick, onChange 등)를 연결한다

  4. Hydration 완료
     → 이제 모든 상호작용이 동작한다 (TTI)
     → React가 이 DOM을 "소유"하게 된다
```

#### Hydration Mismatch — 서버와 클라이언트가 다른 HTML을 생성하면

```jsx
// ❌ Hydration Mismatch가 발생하는 코드
function Clock() {
  return <p>현재 시각: {new Date().toLocaleTimeString()}</p>;
}

// 서버(14:30:00)와 클라이언트(14:30:02)에서 다른 시간을 생성!
// React 경고:
//   "Text content did not match.
//    Server: '14:30:00' Client: '14:30:02'"

// ✅ 해결: 클라이언트에서만 동적 값을 사용
function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    // useEffect는 클라이언트에서만 실행 → Hydration 후에 시간 표시
    setTime(new Date().toLocaleTimeString());
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString()),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return <p>현재 시각: {time || "로딩 중..."}</p>;
}
```

```
Hydration Mismatch를 만드는 대표적 원인

  · 서버/클라이언트에서 다른 결과를 생성하는 코드
    - new Date(), Math.random()
    - window/document 접근 (서버에는 없음)
    - 브라우저 전용 API (localStorage 등)

  · typeof window !== 'undefined' 분기로 다른 UI 생성

  · 서버에서 데이터가 있는데 클라이언트 초기 State는 null

  방지 원칙:
    · 서버와 클라이언트에서 동일한 초기 렌더링 결과를 보장한다
    · 클라이언트 전용 로직은 useEffect에서 처리한다
    · suppressHydrationWarning은 최후의 수단으로만 사용
```

### 3.4 SSG (Static Site Generation) — 빌드할 때 HTML을 만든다

#### 동작 과정

```
빌드 시점 (npm run build):

  빌드 도구가 모든 페이지의 HTML을 미리 생성
  ┌──────────────────────────────────────┐
  │  /index.html        ← 홈 페이지     │
  │  /about/index.html  ← 소개 페이지   │
  │  /blog/post-1.html  ← 블로그 글 1   │
  │  /blog/post-2.html  ← 블로그 글 2   │
  │  ...                                │
  └──────────────────────────────────────┘
  → CDN에 정적 파일로 배포


요청 시점:

  사용자 → CDN → 미리 생성된 HTML 즉시 반환 (서버 렌더링 없음!)

  TTFB: 극히 빠름 (CDN 응답)
  FCP: 극히 빠름 (콘텐츠 포함된 HTML)
  TTI: JS 다운로드 + Hydration 후
```

#### SSG의 장단점

```
장점:
  · 가장 빠른 TTFB (CDN에서 정적 파일 즉시 반환)
  · 가장 빠른 FCP (HTML에 콘텐츠 포함)
  · 서버 부하 제로 (빌드 시에만 서버 사용)
  · CDN으로 전 세계에 배포 가능
  · SEO 최적 (완전한 HTML)
  · 보안: 서버 로직이 없으므로 공격 표면이 작다

단점:
  · 빌드 시점에 데이터가 고정된다 (실시간 데이터 불가)
  · 페이지 수가 많으면 빌드 시간이 길어진다
  · 사용자별 다른 콘텐츠 불가 (개인화 어려움)
  · 콘텐츠 변경 시 전체 재빌드 필요
  · 동적 경로가 많으면 빌드 시 모든 조합을 생성해야 함
```

### 3.5 ISR (Incremental Static Regeneration) — SSG + 주기적 재생성

#### 동작 과정

```
ISR의 핵심 아이디어

  · SSG처럼 빌드 시 HTML을 미리 생성한다
  · 하지만 일정 시간(revalidate) 후 백그라운드에서 재생성한다
  · 사용자는 항상 캐시된(빠른) 페이지를 보고
  · 백그라운드에서 최신 데이터로 페이지가 갱신된다


시간 흐름 (revalidate: 60초 기준):

  t=0     빌드: HTML 생성 (데이터 A)
  t=30    요청: 캐시된 HTML 반환 (데이터 A, 즉시)
  t=60    요청: 캐시된 HTML 반환 (데이터 A, 즉시)
          + 백그라운드에서 재생성 시작 (데이터 B로 업데이트)
  t=61    재생성 완료 → 캐시 교체
  t=70    요청: 새 HTML 반환 (데이터 B, 즉시)

  "Stale-While-Revalidate" 전략:
  · 사용자에게는 항상 즉시 응답 (stale이라도)
  · 백그라운드에서 조용히 최신 데이터로 갱신
```

#### ISR의 장단점

```
장점:
  · SSG의 속도 이점을 유지하면서 데이터를 주기적으로 갱신
  · 전체 사이트 재빌드 불필요 (변경된 페이지만 재생성)
  · CDN 캐싱과 자연스럽게 결합
  · 수만 개의 페이지도 효율적으로 관리

단점:
  · revalidate 주기 동안 오래된 데이터가 표시될 수 있다
  · 실시간 데이터에는 여전히 부적합 (주식, 채팅 등)
  · Next.js 등 특정 프레임워크에 의존
  · 첫 번째 요청 후 재생성이 발생하므로 "한 사용자는 구버전"을 봄
```

### 3.6 Streaming SSR — 점진적으로 HTML을 보낸다

#### 기존 SSR의 한계

```
기존 SSR의 문제: "All-or-Nothing"

  서버에서 3개의 데이터를 패칭한다고 가정:
    · 사용자 정보: 50ms
    · 상품 목록: 200ms
    · 추천 상품: 500ms

  기존 SSR:
    모든 데이터가 준비될 때까지 대기 → 500ms 후 전체 HTML 전송
    TTFB = 500ms (가장 느린 패칭에 맞춰짐)

  문제: 빠르게 준비된 부분(사용자 정보, 50ms)도
        가장 느린 부분(추천 상품, 500ms)을 기다려야 한다!
```

#### Streaming SSR의 해결

```
Streaming SSR: 준비된 부분부터 보낸다

  t=0     서버: 렌더링 시작 + 데이터 패칭 시작
  t=0     → HTML 셸(header, layout) 즉시 전송! → TTFB ★
          브라우저: 레이아웃이 보인다

  t=50ms  → 사용자 정보 준비됨 → 해당 HTML 청크 전송
          브라우저: 사용자 이름이 나타남

  t=200ms → 상품 목록 준비됨 → 해당 HTML 청크 전송
          브라우저: 상품 목록이 나타남

  t=500ms → 추천 상품 준비됨 → 해당 HTML 청크 전송 + 스트림 종료
          브라우저: 추천 상품이 나타남

  비교:
    기존 SSR의 TTFB: 500ms (전부 기다림)
    Streaming SSR의 TTFB: ~0ms (즉시 시작)
    Streaming SSR의 FCP: ~50ms (첫 데이터 도착)
```

#### React 18의 Streaming SSR + Suspense

```jsx
// Streaming SSR에서 Suspense가 "스트리밍 경계"를 결정한다

function ProductPage() {
  return (
    <Layout>
      {/* 이 부분은 즉시 HTML로 전송 */}
      <Header />

      <Suspense fallback={<ProductSkeleton />}>
        {/* 이 부분은 데이터 준비 후 청크로 전송 */}
        {/* 준비 전에는 fallback(ProductSkeleton)이 전송됨 */}
        <ProductList />
      </Suspense>

      <Suspense fallback={<RecommendSkeleton />}>
        {/* 이 부분도 독립적으로 준비 후 청크로 전송 */}
        <Recommendations />
      </Suspense>
    </Layout>
  );
}
```

```
Streaming의 HTML 전송 흐름

  청크 1 (즉시):
    <html><head>...</head><body>
    <header>...</header>
    <div id="product-slot"><ProductSkeleton /></div>   ← fallback
    <div id="recommend-slot"><RecommendSkeleton /></div> ← fallback

  청크 2 (200ms 후):
    <script>
      // product-slot의 내용을 실제 ProductList HTML로 교체
      replaceContent('product-slot', '<ul><li>노트북</li>...</ul>')
    </script>

  청크 3 (500ms 후):
    <script>
      replaceContent('recommend-slot', '<div>추천 상품...</div>')
    </script>
    </body></html>

  → 브라우저는 스켈레톤을 먼저 보여주다가
    데이터가 도착하면 실제 콘텐츠로 교체한다
    "점진적 로딩" 경험을 서버에서 제공!
```

### 3.7 Selective Hydration — 필요한 부분부터 상호작용 활성화

```
기존 Hydration: 전체 페이지를 한 번에 Hydration

  HTML 도착 → JS 다운로드 → 전체 Hydration(200ms) → TTI
  · 200ms 동안 페이지 전체가 반응하지 않음
  · 사용자가 "검색" 버튼을 클릭해도 무반응

Selective Hydration: 우선순위에 따라 부분적으로 Hydration

  HTML 도착 → JS 다운로드 → Header Hydration(10ms) ★
  → 사용자가 검색 입력란 클릭!
  → React: "사용자가 이 부분을 원한다!" → SearchBar 우선 Hydration ★
  → 나머지 부분은 유휴 시간에 Hydration

  · 사용자가 상호작용하려는 부분이 먼저 활성화됨
  · 덜 중요한 부분(푸터 등)은 나중에 Hydration
  · 체감 TTI가 크게 단축됨
```

```
Selective Hydration의 조건

  · React 18+ (Concurrent Features)
  · createRoot 사용 (hydrateRoot)
  · Suspense 경계가 있어야 함 (각 경계가 독립적으로 Hydration)
  · Streaming SSR과 결합하면 최대 효과
```

### 3.8 5가지 전략 비교표

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐
│          │ CSR      │ SSR      │ SSG      │ ISR      │ Streaming SSR│
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ HTML 생성│ 브라우저 │ 서버     │ 빌드 시점│ 빌드+주기│ 서버(점진적) │
│ 시점     │ (요청 후)│ (요청 시)│          │ 적 재생성│              │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ TTFB     │ 빠름     │ 느림     │ 매우 빠름│ 빠름     │ 매우 빠름    │
│          │ (정적)   │ (렌더링) │ (CDN)    │ (캐시)   │ (즉시 시작)  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ FCP      │ 느림     │ 빠름     │ 매우 빠름│ 빠름     │ 빠름         │
│          │ (JS 후)  │ (HTML)   │ (HTML)   │ (HTML)   │ (셸 즉시)    │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ TTI      │ 느림     │ 중간     │ 중간     │ 중간     │ 빠름         │
│          │ (JS 후)  │ (Hydrate)│ (Hydrate)│ (Hydrate)│ (Selective)  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ SEO      │ 나쁨     │ 좋음     │ 최고     │ 좋음     │ 좋음         │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 데이터   │ 실시간   │ 요청마다 │ 빌드 고정│ 주기적   │ 요청마다     │
│ 신선도   │          │ 최신     │          │ 갱신     │ 최신         │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 서버 부하│ 없음     │ 높음     │ 없음     │ 낮음     │ 중간         │
│          │ (CDN)    │ (매 요청)│ (CDN)    │ (재생성) │ (매 요청)    │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 인프라   │ CDN      │ 서버     │ CDN      │ CDN+서버 │ 서버         │
│          │          │ 필요     │          │          │ 필요         │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 적합한   │ 대시보드 │ 동적 페이│ 블로그   │ 이커머스 │ 대규모 동적  │
│ 시나리오 │ 관리 도구│ 지, 개인 │ 문서     │ 뉴스     │ 페이지       │
│          │ 내부 앱  │ 화된 콘텐│ 랜딩페이지│ 상품목록 │ 소셜 미디어  │
│          │          │ 츠       │          │          │              │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 3.9 혼합 전략 (Hybrid Rendering)

#### 현대 프레임워크의 접근: 페이지마다 다른 전략

```
Next.js App Router의 혼합 전략 예시

  /               → SSG   (마케팅 홈페이지, 거의 변하지 않음)
  /blog           → SSG   (블로그 목록, 빌드 시 생성)
  /blog/:slug     → ISR   (개별 글, 60초마다 재생성)
  /products       → SSR   (검색/필터가 URL에 따라 다름)
  /products/:id   → ISR   (상품 상세, 300초마다 재생성)
  /dashboard      → CSR   (로그인 필요, SEO 불필요)
  /feed           → Streaming SSR (소셜 피드, 여러 데이터 소스)

  → 하나의 전략을 전체에 적용하는 것이 아니라
  → 각 페이지의 특성에 맞는 전략을 "혼합"한다
  → 이것이 Next.js 같은 메타 프레임워크의 핵심 가치
```

### 3.10 렌더링 전략 선택 흐름

```
"이 페이지에 어떤 렌더링 전략을 적용할 것인가?"

  ┌─ 이 페이지에 SEO가 필요한가?
  │    NO → CSR (대시보드, 관리 도구, 내부 앱)
  │    YES ↓
  │
  ├─ 데이터가 빌드 시점에 확정되는가?
  │    YES → SSG (블로그, 문서, 마케팅 페이지)
  │    NO ↓
  │
  ├─ 데이터가 자주 변하지만 약간의 지연이 허용되는가?
  │    YES → ISR (이커머스 상품, 뉴스 목록)
  │    NO ↓
  │
  ├─ 여러 데이터 소스가 있고 응답 시간이 다른가?
  │    YES → Streaming SSR (복잡한 대시보드, 소셜 피드)
  │    NO ↓
  │
  └─ 매 요청마다 최신 데이터가 필요한가?
       YES → SSR (개인화된 페이지, 검색 결과)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 이커머스 사이트의 렌더링 전략 혼합

```
Amazon 같은 이커머스 사이트를 가정

  홈페이지 (/):
    · 전략: SSG + ISR (6시간마다)
    · 이유: 마케팅 배너와 추천 카테고리는 자주 변하지 않음
    · SEO: 필수

  상품 목록 (/products?category=...):
    · 전략: SSR 또는 Streaming SSR
    · 이유: 필터/정렬에 따라 결과가 다름, SEO 필요
    · 가격/재고는 실시간이어야 함

  상품 상세 (/products/:id):
    · 전략: ISR (5분마다)
    · 이유: 상품 정보는 자주 변하지 않지만 주기적 갱신 필요
    · SEO: 매우 중요 (상품 검색 유입)

  장바구니 (/cart):
    · 전략: CSR
    · 이유: 로그인 필수, SEO 불필요, 실시간 상호작용

  결제 (/checkout):
    · 전략: CSR
    · 이유: 개인 정보, SEO 불필요, 보안 중요

  마이페이지 (/mypage):
    · 전략: CSR 또는 SSR (개인화)
    · 이유: 로그인 필수, 사용자별 다른 콘텐츠
```

### 4.2 사례: Hydration의 "보이지만 반응하지 않는" 구간

```
실제 사용자 경험에서의 Hydration 문제

  시나리오: 뉴스 사이트에서 SSR된 기사를 읽고 있다

  t=0     : HTML 도착 → 기사가 화면에 표시됨 (FCP)
  t=200ms : 사용자가 "좋아요" 버튼 클릭 → 반응 없음!
  t=500ms : JS 번들 다운로드 완료
  t=800ms : Hydration 완료 → 이제 "좋아요"가 동작

  t=200~800ms 구간: "Uncanny Valley"
    · 화면은 완벽하게 보인다 (HTML이 있으므로)
    · 하지만 클릭에 반응하지 않는다 (JS가 아직 연결 안 됨)
    · 사용자: "버튼이 왜 안 먹지? 고장인가?"

  해결 전략:
    1. JS 번들 크기를 줄여 다운로드 시간 단축
    2. Code Splitting으로 필요한 부분만 먼저 로드
    3. Selective Hydration으로 상호작용 영역 우선 처리
    4. 로딩 표시자(progress bar 등)로 "아직 준비 중" 피드백
```

### 4.3 사례: SSG의 빌드 시간 문제와 ISR의 해결

```
시나리오: 10만 개의 상품을 가진 이커머스

  SSG로 모든 상품 페이지를 빌드:
    · 10만 페이지 × 0.5초/페이지 = 50,000초 ≈ 14시간!
    · 상품 하나 수정할 때마다 14시간 빌드? → 불가능

  ISR로 해결:
    · 빌드 시: 인기 상품 1,000개만 미리 생성 (8분)
    · 나머지: 첫 요청 시 생성 + 캐시
    · 이후: 5분마다 백그라운드 재생성
    · 새 상품 추가: 첫 방문 시 자동 생성 (재빌드 불필요)
```

### 4.4 사례: Streaming SSR이 만들어내는 체감 속도 차이

```
시나리오: 소셜 미디어 피드 페이지 (3개 데이터 소스)

  데이터 소스별 응답 시간:
    · 사용자 프로필:  80ms  (빠름)
    · 피드 게시물:  350ms  (보통)
    · 광고 추천:    700ms  (느림)

  기존 SSR:
    → 700ms 후 전체 페이지를 한 번에 전송
    → 사용자: 0~700ms 동안 빈 화면 또는 로딩 스피너 응시
    → TTFB = 700ms, FCP = 700ms+

  Streaming SSR:
    → 0ms:   레이아웃 셸 즉시 전송 (헤더, 사이드바 뼈대)
    → 80ms:  사용자 프로필 청크 도착 → 프로필 표시
    → 350ms: 피드 게시물 청크 도착 → 메인 콘텐츠 표시
    → 700ms: 광고 추천 청크 도착 → 보조 콘텐츠 완성

    → 사용자: 0ms부터 점진적으로 콘텐츠를 보기 시작
    → TTFB ≈ 0ms, FCP ≈ 80ms
    → 체감 로딩 속도: 700ms → 80ms (약 9배 개선!)
```

---

## 5. 실습

### 실습 1: 렌더링 전략별 초기 로딩 차이 관찰 [Understanding]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** CSR의 초기 로딩 흐름을 직접 관찰한다.

```
실험:
  1. Vite React 앱을 빌드하고 빌드 결과물을 확인
     npm run build → dist/ 폴더 확인
  2. dist/index.html을 열어 <div id="root"> 안이 비어있는지 확인 → CSR의 증거
  3. Chrome DevTools > Network 탭에서 로딩 흐름 관찰:
     · HTML 도착 시점, JS 번들 도착 시점, API 요청 시점
  4. Performance 탭에서 FCP, LCP 측정
  5. JavaScript를 비활성화하고 페이지를 열어 빈 화면 확인

기록할 것:
  · index.html의 크기와 내용
  · JS 번들의 크기
  · FCP까지의 시간
  · "JS 비활성화 시 보이는 화면"
```

---

### 실습 2: 렌더링 전략 선택 시뮬레이션 [Analyzing · Evaluating]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 프로젝트 요구사항에 따라 적절한 렌더링 전략을 선택한다.

아래 5개 시나리오 각각에 대해 렌더링 전략을 선택하고 근거를 제시하라.

```
시나리오 1: 기술 블로그 (글 200개, 주 2회 새 글 게시)
시나리오 2: 실시간 주식 거래 대시보드 (로그인 필수)
시나리오 3: 기업 공식 홈페이지 (마케팅, 채용, 회사 소개)
시나리오 4: 소셜 미디어 피드 (개인화, 무한 스크롤, SEO 필요)
시나리오 5: SaaS 프로젝트 관리 도구 (칸반 보드, 실시간 협업)

각 시나리오에 대해:
  1. 선택한 전략과 근거
  2. SEO 요구사항 분석
  3. 데이터 신선도 요구사항 분석
  4. 성능 지표 우선순위 (TTFB/FCP/TTI 중 어느 것이 중요)
  5. 혼합 전략이 필요한 경우 페이지별 전략 설계
```

---

### 실습 3: Hydration 과정 이해 [Understanding · Analyzing]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** SSR + Hydration의 흐름을 코드 수준에서 추적한다.

```
과제:
  1. 아래 코드가 SSR로 실행될 때 서버가 보내는 HTML을 작성하라
  2. Hydration 후 어떤 이벤트 핸들러가 연결되는지 나열하라
  3. Hydration Mismatch가 발생할 수 있는 부분을 찾고 수정하라

  function ProductPage() {
    const [quantity, setQuantity] = useState(1);
    const now = new Date().toLocaleString();

    return (
      <div>
        <h1>React 완벽 가이드</h1>
        <p>가격: 35,000원</p>
        <p>현재 시각: {now}</p>
        <p>화면 너비: {window.innerWidth}px</p>
        <div>
          <button onClick={() => setQuantity(q => q - 1)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>
        <button onClick={() => alert('장바구니 추가!')}>
          장바구니에 추가
        </button>
      </div>
    );
  }
```

---

### 실습 4 (선택): 성능 지표 타임라인 그리기 [Analyzing]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 각 렌더링 전략의 성능 지표 타임라인을 직접 그린다.

```
조건:
  · JS 번들: 200KB (다운로드 300ms, 실행 100ms)
  · 서버 렌더링: 150ms
  · API 데이터 패칭: 200ms
  · Hydration: 100ms
  · 네트워크 지연: 50ms

과제:
  CSR, SSR, SSG, Streaming SSR 각각에 대해
  아래 타임라인을 작성하라:

  | 시점(ms) | 발생하는 이벤트 |
  |---------|---------------|
  | 0       | 요청 시작      |
  | ?       | TTFB           |
  | ?       | FCP            |
  | ?       | TTI            |
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 19 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 렌더링 전략 = "HTML을 어디에서, 언제 생성하는가"           │
│     → CSR: 브라우저에서 요청 시점에                           │
│     → SSR: 서버에서 요청 시점에                               │
│     → SSG: 서버에서 빌드 시점에                               │
│     → ISR: SSG + 주기적 재생성                               │
│     → Streaming SSR: 서버에서 점진적으로                      │
│                                                               │
│  2. Hydration = 정적 HTML에 이벤트 핸들러를 연결하는 과정      │
│     → SSR/SSG 후 JS가 로드되면 React가 DOM을 "인수인계"       │
│     → "보이지만 반응하지 않는" 구간(Uncanny Valley) 존재       │
│     → Selective Hydration으로 우선순위 기반 점진적 활성화      │
│     → Mismatch 방지: 서버/클라이언트 동일한 초기 렌더링 보장   │
│                                                               │
│  3. 성능 지표별 유리한 전략                                    │
│     → TTFB: SSG > Streaming > CSR > SSR                      │
│     → FCP: SSG > SSR > Streaming > CSR                       │
│     → TTI: CSR(이후 네비게이션) > Streaming+Selective         │
│     → SEO: SSG = SSR > ISR > CSR                             │
│                                                               │
│  4. Streaming SSR = Suspense 경계별로 점진적 HTML 전송         │
│     → 느린 데이터 소스가 빠른 부분을 차단하지 않는다           │
│     → Skeleton/Fallback을 먼저 보내고 실제 콘텐츠로 교체      │
│     → Selective Hydration과 결합하면 최적의 UX               │
│                                                               │
│  5. ISR = SSG의 속도 + 주기적 데이터 갱신                     │
│     → Stale-While-Revalidate 전략                            │
│     → 전체 재빌드 불필요, 변경 페이지만 재생성                │
│     → 대규모 사이트(10만+ 페이지)에서 핵심적                  │
│                                                               │
│  6. 현대 프레임워크는 혼합 전략을 지원한다                     │
│     → 하나의 앱에서 페이지마다 다른 전략 적용                 │
│     → SSG(홈) + ISR(상품) + SSR(검색) + CSR(대시보드)        │
│     → Next.js App Router가 이 혼합을 가장 잘 지원            │
│                                                               │
│  7. 전략 선택 기준                                            │
│     → SEO 필요? → SSR/SSG/ISR                               │
│     → 데이터 고정? → SSG                                     │
│     → 주기적 갱신? → ISR                                     │
│     → 실시간 + 복잡? → Streaming SSR                         │
│     → SEO 불필요? → CSR                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                | 블룸 단계  | 확인할 섹션 |
| --- | ----------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | CSR에서 서버가 보내는 HTML의 특징은? 검색 엔진에 어떤 영향을 주는가?                | Understand | 3.1         |
| 2   | SSR에서 TTFB가 CSR보다 느릴 수 있는 이유는?                                         | Understand | 3.2         |
| 3   | Hydration의 "Uncanny Valley" 구간이 발생하는 원인과 해결 방법 2가지는?              | Understand | 3.3         |
| 4   | Hydration Mismatch가 발생하는 코드를 예시와 함께 설명하라                           | Analyze    | 3.3         |
| 5   | SSG가 10만 페이지 사이트에서 비현실적인 이유와 ISR의 해결 방식은?                   | Analyze    | 3.5         |
| 6   | Streaming SSR에서 Suspense fallback이 하는 역할을 "스트리밍 경계" 관점에서 설명하라 | Analyze    | 3.6         |
| 7   | 소셜 미디어 피드 페이지에 적합한 렌더링 전략과 그 근거는?                           | Evaluate   | 3.10        |
| 8   | 하나의 이커머스 앱에서 페이지별로 다른 렌더링 전략을 혼합하는 예시를 설계하라       | Evaluate   | 3.9         |

### 6.3 FAQ

**Q1. CSR과 SSR 중 어느 것이 더 "좋은" 방식인가요?**

어느 것이 더 좋다는 절대적 기준은 없다. CSR은 로그인 이후의 대시보드처럼 SEO가 불필요하고 풍부한 상호작용이 중요한 경우에 최적이다. SSR은 공개 콘텐츠 페이지처럼 SEO와 초기 로딩이 중요한 경우에 유리하다. 실제 프로덕션 앱은 대부분 두 방식을 혼합하여 사용한다.

**Q2. Hydration을 완전히 없앨 수 있나요?**

완전히 없애기는 어렵지만 최소화할 수 있다. React Server Components(Step 20)는 Server Component에 대해서는 Hydration 자체가 필요 없다. 상호작용이 없는 순수 표시용 컴포넌트를 Server Component로 만들면 해당 부분의 Hydration 비용이 완전히 사라진다.

**Q3. ISR의 revalidate 시간을 얼마로 설정해야 하나요?**

콘텐츠의 업데이트 빈도와 데이터 신선도 요구사항에 따라 다르다. 뉴스 기사는 수 분(60~300초), 상품 정보는 수 시간(1800~3600초), 블로그 글은 수 일(86400초 이상)이 일반적이다. "사용자에게 오래된 데이터를 보여줘도 얼마나 허용할 수 있는가"를 기준으로 결정한다.

**Q4. Streaming SSR은 SEO에 문제가 없나요?**

현대 검색 엔진(Google 등)은 Streaming을 올바르게 처리한다. 청크로 나뉘어 전송되는 HTML도 결국 완성된 HTML로 조립되므로 SEO에 불리하지 않다. 다만 검색 엔진 크롤러가 페이지를 완전히 렌더링하기 전에 인덱싱을 중단하는 경우가 극히 드물게 있으므로, 중요한 콘텐츠는 초기 청크에 포함시키는 것이 권장된다.

**Q5. Next.js 없이 SSR/ISR을 구현할 수 있나요?**

SSR은 Express.js + ReactDOM.renderToString으로 직접 구현할 수 있다. 그러나 ISR은 정교한 캐싱 레이어와 백그라운드 재생성 로직이 필요하여 직접 구현하기 복잡하다. Remix, Gatsby 등도 각자의 방식으로 이 전략들을 지원하지만, Next.js App Router가 현재 가장 완성도 높은 구현을 제공한다.

---

## 7. 다음 단계 예고

> **Step 20. React Server Components (RSC)**
>
> - Client Component vs Server Component의 차이
> - 서버에서만 실행되는 컴포넌트의 의미
> - 번들 크기 감소와 서버 자원 활용
> - RSC의 직렬화와 데이터 전달 메커니즘
> - "use client" / "use server" 지시어
> - SSR과 RSC의 차이 (혼동하기 쉬운 개념)

---

## 📚 참고 자료

- [React 공식 문서 — Server React DOM APIs](https://react.dev/reference/react-dom/server)
- [React 공식 문서 — hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
- [React 공식 문서 — Suspense](https://react.dev/reference/react/Suspense)
- [Next.js 공식 문서 — Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Web.dev — Rendering on the Web](https://web.dev/rendering-on-the-web/)
- [Web.dev — Core Web Vitals](https://web.dev/vitals/)
- [Patterns.dev — Rendering Patterns](https://www.patterns.dev/posts/rendering-introduction)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 19 of 42
