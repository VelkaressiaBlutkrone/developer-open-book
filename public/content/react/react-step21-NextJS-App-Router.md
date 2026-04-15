# Step 21. Next.js App Router 핵심

> **난이도:** 🟡 중급 (Intermediate)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Remember**   | App Router의 파일 규약(page.js, layout.js, loading.js, error.js)을 나열할 수 있다        |
| **Understand** | 파일 시스템 기반 라우팅이 React Router의 코드 기반 라우팅과 어떻게 다른지 설명할 수 있다 |
| **Understand** | Next.js의 캐싱 계층(Request Memoization, Data Cache, Full Route Cache)을 설명할 수 있다  |
| **Apply**      | layout, loading, error 파일을 활용하여 페이지 구조를 구현할 수 있다                      |
| **Analyze**    | Next.js에서 정적/동적 렌더링이 결정되는 조건을 분석할 수 있다                            |
| **Evaluate**   | Vite+React Router와 Next.js App Router 중 프로젝트에 적합한 도구를 판단할 수 있다        |

**전제 지식:**

- Step 18: React Router (Nested Routes, Outlet, loader/action)
- Step 19: CSR, SSR, SSG, ISR, Streaming SSR, Hydration
- Step 20: React Server Components, "use client", Server Actions

---

## 1. 서론 — React의 공식 권장 프레임워크

### 1.1 메타 프레임워크의 등장 — "React만으로는 충분하지 않다"

React는 UI를 만드는 라이브러리다. 훌륭한 컴포넌트 모델, Virtual DOM, Hooks를 제공하지만, 현대 웹 애플리케이션에 필요한 많은 것들을 의도적으로 포함하지 않는다. 라우팅, 데이터 패칭, SSR, 캐싱, 코드 분할, 이미지 최적화 — 이 모든 것은 React 위에 추가로 구축해야 한다.

2016년 Vercel(당시 ZEIT)이 출시한 Next.js는 이 공백을 채우는 프레임워크였다. 초기에는 SSR을 손쉽게 구현하는 도구로 시작했으나, 2023년 App Router의 안정화와 함께 RSC를 기본으로 하는 풀스택 React 프레임워크로 진화했다. React 공식 문서는 현재 "새 프로젝트를 시작한다면 프레임워크를 사용하라"고 권장하며, Next.js를 첫 번째 선택지로 소개한다.

![React vs 실제 앱 요구사항](/developer-open-book/diagrams/react-step21-react-vs-needs.svg)

### 1.2 App Router가 가져온 패러다임 전환

Next.js는 두 가지 라우팅 시스템을 제공한다. **Pages Router**(레거시, pages/ 디렉토리 기반)와 **App Router**(현재 표준, app/ 디렉토리 기반)다. App Router는 2023년 Next.js 13.4에서 안정화되어 RSC를 기본값으로 채택했다.

Pages Router에서 App Router로의 전환은 단순한 폴더 이름 변경이 아니다. 렌더링 모델 자체가 바뀌었다. Pages Router에서는 모든 컴포넌트가 Client Component였고, getServerSideProps/getStaticProps 같은 특수 함수를 통해서만 서버 데이터에 접근할 수 있었다. App Router에서는 **컴포넌트가 기본적으로 Server Component**이며, 서버 데이터 접근이 컴포넌트 내부에서 자연스럽게 이루어진다.

```
Pages Router → App Router 패러다임 변화

  Pages Router (레거시):
    · 기본값: Client Component
    · 서버 데이터: getServerSideProps / getStaticProps (특수 함수)
    · RSC: 사용 불가
    · 레이아웃: _app.js (전역), 페이지별 수동 처리

  App Router (현재 표준):
    · 기본값: Server Component ★
    · 서버 데이터: async 컴포넌트에서 직접 조회
    · RSC: 기본값
    · 레이아웃: layout.js (중첩 레이아웃 자동 지원)
    · 특수 파일: loading.js, error.js, not-found.js
```

### 1.3 Next.js가 해결하는 문제들

**라우팅 자동화:** 파일 시스템 자체가 라우트 맵이 되어 별도의 라우트 설정 코드가 필요 없다. 폴더를 만들면 URL이 생기고, page.js를 추가하면 그 URL이 공개된다.

**렌더링 전략 자동 결정:** 개발자가 "이 페이지는 SSG다"라고 명시하지 않아도 Next.js가 코드를 분석하여 정적/동적 렌더링을 자동으로 결정한다. 이는 Step 19에서 배운 복잡한 렌더링 전략 선택을 프레임워크가 대신 처리해 준다는 의미다.

**캐싱 내장:** fetch 함수에 옵션 하나로 SSG(force-cache), ISR(revalidate), SSR(no-store) 동작을 선택할 수 있다. 캐싱 인프라를 직접 구축할 필요가 없다.

### 1.4 이 Step에서 다루는 범위

![Step 21 다루는 범위](/developer-open-book/diagrams/react-step21-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                | 정의                                                                                    | 왜 중요한가                                     |
| ------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **App Router**      | Next.js 13.4+에서 도입된 **app/ 디렉토리 기반 라우팅 시스템**. RSC를 기본으로 사용      | Pages Router를 대체하는 현재 표준이다           |
| **파일 규약**       | 특정 이름의 파일(page.js, layout.js 등)이 **정해진 역할**을 수행하는 Next.js의 규칙     | 폴더 구조 = 라우트 구조 + UI 구조를 동시에 정의 |
| **page.js**         | 해당 라우트 세그먼트의 **고유 UI**. 이 파일이 있어야 라우트가 공개적으로 접근 가능      | "이 URL에서 보여줄 화면"을 정의한다             |
| **layout.js**       | 자식 라우트들이 **공유하는 UI 래퍼**. 네비게이션 시에도 리렌더링되지 않는다             | React Router의 Layout Route + Outlet에 해당     |
| **loading.js**      | 해당 세그먼트가 로딩 중일 때 표시하는 **즉시 로딩 UI**. Suspense를 자동으로 감싸준다    | Suspense fallback을 파일 규약으로 간소화        |
| **error.js**        | 해당 세그먼트에서 에러 발생 시 표시하는 **에러 UI**. Error Boundary를 자동으로 감싸준다 | Step 17의 Error Boundary를 파일 규약으로 간소화 |
| **Route Group**     | `(groupName)` 괄호로 감싼 폴더. **URL에 영향을 주지 않으면서** 라우트를 조직            | 레이아웃 그룹화, 인증 영역 분리 등에 활용       |
| **Dynamic Segment** | `[paramName]` 대괄호 폴더. React Router의 **:paramName**에 해당                         | /products/[id] → /products/42                   |
| **정적 렌더링**     | 빌드 시점에 HTML을 생성. **SSG/ISR**에 해당. Next.js의 기본 렌더링 방식                 | 캐시 가능, CDN 배포, 가장 빠른 응답             |
| **동적 렌더링**     | 요청 시점에 HTML을 생성. **SSR**에 해당. 쿠키, 검색 파라미터 등 요청 의존 시 자동 전환  | 개인화, 실시간 데이터에 필요                    |
| **Route Handler**   | app/ 디렉토리의 **route.js** 파일. REST API 엔드포인트를 정의                           | Server Action과 함께 서버 로직의 두 축          |

### 2.2 파일 규약 체계의 이론적 배경

**"규약 우선 설정(Convention over Configuration)"** 원칙은 Ruby on Rails가 대중화한 소프트웨어 설계 철학이다. 개발자가 명시적으로 설정하지 않아도 규약에 따라 프레임워크가 자동으로 동작을 결정한다. Next.js App Router는 이 철학을 파일 시스템 라우팅에 적용했다.

이 접근의 장점은 코드량 감소만이 아니다. 팀 전체가 동일한 구조를 따르므로 코드베이스의 예측 가능성이 높아지고, 새 팀원의 온보딩이 빨라진다. 특수 파일(loading.js, error.js)은 React의 Suspense와 Error Boundary를 "파일 하나로 구현"할 수 있게 해주어 코드 복잡도를 크게 낮춘다.

### 2.3 App Router vs React Router 구조 비교

![React Router vs App Router](/developer-open-book/diagrams/react-step21-router-comparison.svg)

### 2.4 개념 간 관계 — 특수 파일들의 계층 구조

![특수 파일들의 중첩 관계](/developer-open-book/diagrams/react-step21-file-nesting.svg)

---

## 3. 이론과 원리

### 3.1 파일 시스템 라우팅 — 폴더 = 라우트

#### 기본 구조

![App Router 파일 시스템 라우팅](/developer-open-book/diagrams/react-step21-file-tree.svg)

```
핵심 규칙

  1. 폴더 이름 = URL 세그먼트
     app/products/ → /products

  2. page.js가 있어야 라우트가 "공개"됨
     app/products/page.js → /products 접근 가능
     app/components/ (page.js 없음) → URL로 접근 불가 (컴포넌트 폴더)

  3. [param] 대괄호 = 동적 세그먼트
     app/products/[id]/page.js → /products/42

  4. layout.js = 자식 라우트들의 공유 래퍼
     app/dashboard/layout.js → /dashboard/* 모든 페이지에 적용

  5. 중첩 폴더 = 중첩 라우트 = 중첩 레이아웃
     Nested Routes가 폴더 구조로 자동 설정됨!
```

### 3.2 특수 파일 규약

#### page.js — 페이지 컴포넌트

```jsx
// app/products/[id]/page.js

// params는 동적 세그먼트의 값을 포함
// searchParams는 URL 쿼리 파라미터를 포함
export default async function ProductPage({ params, searchParams }) {
  const { id } = await params;
  const product = await db.products.findUnique({ where: { id: Number(id) } });

  if (!product) {
    notFound(); // not-found.js를 표시
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString()}원</p>
    </div>
  );
}

// ※ Server Component가 기본값이므로 async/await 직접 사용 가능!
// ※ "use client" 없이 작성하면 자동으로 Server Component
```

#### layout.js — 공유 레이아웃

```jsx
// app/layout.js — 루트 레이아웃 (필수)
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header>
          <nav>
            <a href="/">홈</a>
            <a href="/products">상품</a>
            <a href="/dashboard">대시보드</a>
          </nav>
        </header>
        <main>{children}</main>
        {/* children = 현재 라우트의 page.js 또는 자식 layout.js */}
        <footer>© 2025</footer>
      </body>
    </html>
  );
}

// app/dashboard/layout.js — 대시보드 레이아웃
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <a href="/dashboard">개요</a>
          <a href="/dashboard/analytics">분석</a>
          <a href="/dashboard/settings">설정</a>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
```

```
layout.js의 핵심 특성

  1. 네비게이션 시 리렌더링되지 않는다 ★
     /dashboard → /dashboard/analytics 이동 시
     DashboardLayout은 리렌더링되지 않음!
     children(page.js) 부분만 교체됨
     → 사이드바의 State, 스크롤 위치 등이 보존됨

  2. 중첩된다
     /dashboard/analytics 접근 시:
     RootLayout > DashboardLayout > AnalyticsPage
     → React Router의 Layout Route + Outlet과 동일 개념

  3. 루트 layout.js는 필수
     <html>과 <body> 태그를 포함해야 한다
     모든 페이지에 적용되는 전역 레이아웃
```

#### loading.js — 즉시 로딩 UI

```jsx
// app/products/[id]/loading.js
export default function ProductLoading() {
  return (
    <div className="skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-text" />
      <div className="skeleton-image" />
    </div>
  );
}
```

```
loading.js의 내부 동작

  Next.js가 자동으로 다음과 같이 변환한다:

  // 개발자가 작성하는 것:
  app/products/[id]/
    ├── page.js      (ProductPage — async, 데이터 패칭)
    └── loading.js   (ProductLoading — 스켈레톤)

  // Next.js가 내부적으로 생성하는 구조:
  <Suspense fallback={<ProductLoading />}>
    <ProductPage />
  </Suspense>

  → loading.js = Suspense fallback의 파일 규약 버전
  → 데이터가 준비되기 전에 loading.js가 즉시 표시됨 (Streaming SSR)
  → 데이터가 준비되면 page.js로 교체됨
```

#### error.js — 에러 UI

```jsx
// app/products/[id]/error.js
"use client"; // error.js는 반드시 Client Component!

export default function ProductError({ error, reset }) {
  return (
    <div className="error">
      <h2>상품 정보를 불러올 수 없습니다</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
```

```
error.js의 내부 동작

  Next.js가 자동으로 다음과 같이 변환한다:

  <ErrorBoundary fallback={<ProductError />}>
    <Suspense fallback={<ProductLoading />}>
      <ProductPage />
    </Suspense>
  </ErrorBoundary>

  → error.js = Error Boundary의 파일 규약 버전
  → Step 17에서 배운 Error Boundary를 파일 하나로 대체!
  → reset()으로 에러 상태 리셋 가능
  → "use client" 필수 (Error Boundary가 class 기반이므로)

  ⚠️ error.js는 같은 세그먼트의 layout.js 에러를 잡지 못한다
     layout의 에러를 잡으려면 부모 세그먼트의 error.js가 필요
```

#### not-found.js — 404 페이지

```jsx
// app/not-found.js — 전역 404
export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
      <a href="/">홈으로 돌아가기</a>
    </div>
  );
}

// page.js에서 notFound() 호출로 트리거 가능
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();  // → not-found.js 표시
  return <h1>{product.name}</h1>;
}
```

#### 특수 파일의 중첩 구조

```
/dashboard/analytics 접근 시 렌더링 구조:

  app/layout.js ─── RootLayout
    │
    └── app/dashboard/layout.js ─── DashboardLayout
          │
          ├── app/dashboard/error.js ─── ErrorBoundary 래핑
          │     │
          │     └── app/dashboard/loading.js ─── Suspense 래핑
          │           │
          │           └── app/dashboard/analytics/page.js ─── AnalyticsPage
          │
          └── (중첩 순서: layout > error > loading > page)

  실제 React 트리:
  <RootLayout>
    <DashboardLayout>
      <ErrorBoundary fallback={<DashboardError />}>
        <Suspense fallback={<DashboardLoading />}>
          <AnalyticsPage />
        </Suspense>
      </ErrorBoundary>
    </DashboardLayout>
  </RootLayout>
```

### 3.3 동적 라우트와 Route Groups

#### 동적 세그먼트

```
[param]       → 단일 동적 세그먼트
                /products/[id]  → /products/42

[...slug]     → Catch-all 세그먼트
                /blog/[...slug] → /blog/2024/01/hello

[[...slug]]   → Optional Catch-all 세그먼트
                /blog/[[...slug]] → /blog 또는 /blog/2024/01/hello
```

```jsx
// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const { id } = await params;   // "42" (문자열)
  const product = await getProduct(Number(id));
  return <h1>{product.name}</h1>;
}

// app/blog/[...slug]/page.js
export default async function BlogPage({ params }) {
  const { slug } = await params;  // ["2024", "01", "hello"] (배열)
  const post = await getPost(slug.join('/'));
  return <article>{post.content}</article>;
}
```

#### Route Groups — URL에 영향 없는 폴더 조직

```
app/
├── (marketing)/           ← URL에 포함되지 않음!
│   ├── layout.js          → 마케팅 전용 레이아웃
│   ├── page.js            → /
│   ├── about/
│   │   └── page.js        → /about
│   └── pricing/
│       └── page.js        → /pricing
│
├── (app)/                 ← URL에 포함되지 않음!
│   ├── layout.js          → 앱 전용 레이아웃 (인증 체크 등)
│   ├── dashboard/
│   │   └── page.js        → /dashboard
│   └── settings/
│       └── page.js        → /settings
│
└── (auth)/                ← URL에 포함되지 않음!
    ├── layout.js          → 인증 페이지 전용 레이아웃
    ├── login/
    │   └── page.js        → /login
    └── register/
        └── page.js        → /register
```

```
Route Groups의 용도

  1. 레이아웃 분리: 같은 URL 수준에서 다른 레이아웃 적용
     (marketing) → 마케팅 헤더/푸터
     (app) → 앱 사이드바/내비게이션

  2. 코드 조직: 관련 라우트를 논리적으로 그룹화
     URL 구조를 변경하지 않고 폴더 정리

  3. 인증 경계: 인증이 필요한 영역과 불필요한 영역 분리
     (app)/layout.js에서 인증 체크 → 하위 모든 라우트에 적용
```

### 3.4 데이터 패칭 — Server Component에서 직접

#### fetch + 캐싱

```jsx
// app/products/page.js — Server Component (기본)

export default async function ProductsPage() {
  // fetch를 사용하면 Next.js가 자동으로 캐싱한다
  const res = await fetch("https://api.example.com/products", {
    // 캐싱 옵션
    cache: "force-cache", // 기본값: 정적으로 캐시 (SSG 동작)
    // cache: 'no-store',     // 매 요청마다 새로 패칭 (SSR 동작)
    // next: { revalidate: 60 }, // 60초마다 재검증 (ISR 동작)
  });

  const products = await res.json();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} — {p.price}원
        </li>
      ))}
    </ul>
  );
}
```

```
Next.js의 fetch 확장

  cache: 'force-cache'     → 정적 렌더링 (SSG). 빌드 시 캐시, CDN 제공
  cache: 'no-store'        → 동적 렌더링 (SSR). 매 요청마다 새로 패칭
  next: { revalidate: 60 } → ISR. 60초마다 백그라운드 재검증

  Next.js가 fetch를 래핑하여:
    · 같은 URL의 중복 요청을 자동으로 중복 제거 (Request Memoization)
    · 결과를 서버 측 Data Cache에 저장
    · revalidate 주기에 따라 자동 갱신

  ⚠️ Next.js 15에서 기본 캐싱 동작이 변경됨
     · fetch의 기본값이 'force-cache' → 'no-store'로 변경
     · 명시적으로 캐싱을 지정하는 것이 권장됨
```

#### 데이터베이스 직접 조회

```jsx
// Server Component에서 ORM을 직접 사용
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  // fetch 없이 DB에 직접 접근!
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### 3.5 정적 렌더링 vs 동적 렌더링

#### Next.js의 자동 판단

```
Next.js는 각 라우트를 "정적" 또는 "동적"으로 자동 분류한다

  정적 렌더링 (기본값):
    · 빌드 시 HTML 생성 → CDN 캐시
    · 조건: 동적 요소가 없을 때 (모든 데이터가 빌드 시 확정)

  동적 렌더링으로 자동 전환되는 조건:
    · cookies() 또는 headers() 사용
    · searchParams에 접근
    · fetch에 cache: 'no-store' 지정
    · 동적 세그먼트에 generateStaticParams가 없을 때
    · unstable_noStore() 호출

  → 개발자가 "이 페이지는 SSR이다"라고 명시하지 않아도
  → Next.js가 코드를 분석하여 자동으로 결정한다!
```

```jsx
// ✅ 정적 렌더링 — 빌드 시 HTML 생성
export default async function AboutPage() {
  // 동적 요소 없음 → 정적
  return <h1>회사 소개</h1>;
}

// ✅ 정적 렌더링 — 캐시된 fetch
export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }  // 1시간 캐시 → ISR
  });
  const products = await res.json();
  return <ProductList products={products} />;
}

// → 동적 렌더링으로 전환 — cookies() 사용
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session');
  // cookies() 사용 → 요청마다 다름 → 동적 렌더링!
  const user = await getUserByToken(token);
  return <Dashboard user={user} />;
}

// → 동적 렌더링으로 전환 — searchParams 접근
export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  // searchParams 사용 → 요청마다 다름 → 동적 렌더링!
  const results = await search(q);
  return <SearchResults results={results} />;
}
```

#### generateStaticParams — 동적 라우트의 정적 생성

```jsx
// app/products/[id]/page.js

// 빌드 시 어떤 id 값들을 미리 생성할지 정의
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: String(p.id) }));
  // [{ id: '1' }, { id: '2' }, { id: '3' }, ...]
}

// 위에서 정의한 각 id에 대해 page를 미리 생성 (SSG)
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  return <h1>{product.name}</h1>;
}

// 빌드 결과:
// /products/1/index.html ← 미리 생성됨
// /products/2/index.html ← 미리 생성됨
// /products/3/index.html ← 미리 생성됨
```

### 3.6 Server Actions 실전 패턴

#### 폼 제출

```jsx
// app/products/[id]/page.js — Server Component
import { addReview } from "@/app/actions";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  const reviews = await getReviews(id);

  return (
    <div>
      <h1>{product.name}</h1>

      {/* Server Action을 form action에 직접 전달 */}
      <form action={addReview}>
        <input type="hidden" name="productId" value={id} />
        <textarea name="text" placeholder="리뷰를 작성하세요" required />
        <select name="rating">
          <option value="5">★★★★★</option>
          <option value="4">★★★★</option>
          <option value="3">★★★</option>
        </select>
        <SubmitButton />
      </form>

      <ul>
        {reviews.map((r) => (
          <li key={r.id}>
            {r.text} ({r.rating}점)
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```jsx
// app/actions.js
"use server";

import { revalidatePath } from "next/cache";

export async function addReview(formData) {
  const productId = formData.get("productId");
  const text = formData.get("text");
  const rating = Number(formData.get("rating"));

  await db.reviews.create({
    data: { productId: Number(productId), text, rating },
  });

  revalidatePath(`/products/${productId}`);
  // → 이 경로의 캐시를 무효화하여 새 리뷰가 목록에 반영됨
}
```

```jsx
// components/SubmitButton.js
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "등록 중..." : "리뷰 등록"}
    </button>
  );
}
```

```
Server Action + revalidatePath 패턴

  1. 사용자가 폼 제출
  2. Server Action 실행 (서버에서)
  3. DB에 데이터 저장
  4. revalidatePath()로 해당 페이지 캐시 무효화
  5. 페이지가 새 데이터로 자동 재렌더링
  → 별도의 State 관리나 refetch 없이 데이터가 갱신됨!
```

### 3.7 메타데이터와 SEO

```jsx
// 정적 메타데이터
export const metadata = {
  title: "상품 목록 — My Store",
  description: "최신 상품을 확인하세요",
};

// 동적 메타데이터
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: `${product.name} — My Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      images: [product.imageUrl],
    },
  };
}

// Next.js가 자동으로 <head>에 삽입:
// <title>노트북 — My Store</title>
// <meta name="description" content="..." />
// <meta property="og:title" content="노트북" />
```

### 3.8 Parallel Routes와 Intercepting Routes (개요)

#### Parallel Routes — 같은 레이아웃에서 여러 페이지를 동시에

```
app/dashboard/
├── layout.js
├── page.js
├── @analytics/         ← @ 접두사 = Parallel Route
│   └── page.js
└── @notifications/     ← @ 접두사 = Parallel Route
    └── page.js

// layout.js
export default function DashboardLayout({ children, analytics, notifications }) {
  return (
    <div>
      <main>{children}</main>
      <aside>{analytics}</aside>
      <aside>{notifications}</aside>
    </div>
  );
}

// 각 슬롯이 독립적으로 로딩/에러 처리 가능
// analytics가 느려도 notifications는 먼저 표시됨
```

#### Intercepting Routes — 모달 패턴

```
사진 갤러리에서:
  · 목록에서 사진 클릭 → 모달로 보여줌 (URL은 /photos/123)
  · /photos/123을 직접 접근 → 전체 페이지로 보여줌

  app/
  ├── feed/
  │   ├── page.js          → 피드 목록
  │   └── (..)photos/[id]/ → 피드에서 클릭 시 모달로 인터셉트
  │       └── page.js
  └── photos/
      └── [id]/
          └── page.js      → 직접 접근 시 전체 페이지

  (..) = 한 수준 위 라우트를 인터셉트
```

### 3.9 Vite+React Router vs Next.js — 선택 기준

```
┌────────────────────┬─────────────────────┬─────────────────────┐
│                    │  Vite + React Router│  Next.js App Router │
├────────────────────┼─────────────────────┼─────────────────────┤
│  렌더링            │  CSR (기본)          │  SSR/SSG/ISR/       │
│                    │                     │  Streaming (자동)    │
│  RSC               │  사용 불가          │  기본값              │
│  SEO               │  불리              │  우수                │
│  초기 로딩          │  느림 (JS 번들)     │  빠름 (HTML 제공)    │
│  서버 인프라        │  불필요 (CDN)       │  필요 (Node.js)      │
│  배포 복잡도        │  낮음              │  중간~높음           │
│  학습 곡선          │  낮음              │  중간~높음           │
│  개발 속도          │  빠름              │  빠름 (규약 활용)    │
│  유연성            │  높음 (자유 구성)    │  중간 (규약 따름)    │
│  데이터 패칭        │  useEffect/Query   │  Server Component    │
│  번들 크기          │  전체 포함          │  Server만 제외       │
│  풀스택            │  프론트엔드 전용    │  풀스택 가능         │
├────────────────────┼─────────────────────┼─────────────────────┤
│  적합한 경우       │  · 내부 대시보드    │  · 공개 웹사이트     │
│                    │  · SEO 불필요       │  · SEO 중요          │
│                    │  · 빠른 프로토타입  │  · 풀스택 앱         │
│                    │  · 학습 단계        │  · 프로덕션 앱       │
│                    │  · SPA 충분한 경우  │  · 성능 최적화 필요  │
└────────────────────┴─────────────────────┴─────────────────────┘
```

```
선택 흐름도

  ┌─ SEO가 중요한가? (공개 웹사이트, 블로그, 이커머스)
  │    YES → Next.js
  │    NO ↓
  │
  ├─ 서버 사이드 데이터 접근이 필요한가? (DB 직접 조회, 비밀키)
  │    YES → Next.js
  │    NO ↓
  │
  ├─ 초기 로딩 속도가 매우 중요한가?
  │    YES → Next.js
  │    NO ↓
  │
  ├─ 빠른 프로토타이핑이나 학습이 목적인가?
  │    YES → Vite + React Router
  │    NO ↓
  │
  └─ 내부 도구/대시보드인가?
       YES → Vite + React Router (CDN 배포 가능, 서버 불필요)
       NO → 요구사항에 따라 판단
```

---

## 4. 사례 연구와 예시

### 4.1 사례: React Router → Next.js 마이그레이션 비교

```
React Router 코드:

  createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home />, loader: homeLoader },
        { path: 'products/:id', element: <Product />, loader: productLoader },
      ]
    }
  ]);

  + RootLayout에 <Outlet /> 필요
  + loader 함수 별도 정의
  + useLoaderData()로 데이터 접근

Next.js 동일 구조:

  app/
  ├── layout.js      → RootLayout ({ children })
  ├── page.js        → Home (async, 직접 데이터 패칭)
  ├── error.js       → ErrorPage
  └── products/[id]/
      └── page.js    → Product (async, params에서 id 추출)

  + Outlet 대신 children Props
  + loader 대신 컴포넌트에서 직접 async/await
  + useLoaderData 대신 직접 데이터 사용
  + error.js로 Error Boundary 자동 생성
  + loading.js로 Suspense 자동 생성
```

### 4.2 사례: loading.js와 error.js로 간소화되는 코드

```
기존 (수동 Suspense + ErrorBoundary):

  <ErrorBoundary fallback={<ProductError />}>
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail />
    </Suspense>
  </ErrorBoundary>

  + ErrorBoundary 컴포넌트 직접 구현 (class 또는 라이브러리)
  + Suspense fallback 인라인 작성
  + 매 페이지마다 반복

Next.js (파일 규약):

  app/products/[id]/
    ├── page.js      → ProductDetail
    ├── loading.js   → ProductSkeleton (자동 Suspense)
    └── error.js     → ProductError (자동 ErrorBoundary)

  + 파일만 생성하면 자동으로 Suspense + ErrorBoundary 래핑
  + 페이지마다 독립적인 로딩/에러 UI
  + 코드 반복 제거
```

### 4.3 사례: 캐싱 전략에 따른 렌더링 결정

```
같은 페이지, 다른 캐싱 설정 → 다른 렌더링 전략

  // SSG (정적) — 빌드 시 생성, CDN 캐시
  const res = await fetch(url, { cache: 'force-cache' });

  // ISR — 60초마다 재검증
  const res = await fetch(url, { next: { revalidate: 60 } });

  // SSR (동적) — 매 요청마다 새로 패칭
  const res = await fetch(url, { cache: 'no-store' });

  개발자가 "이 데이터의 신선도 요구사항"만 설정하면
  Next.js가 적절한 렌더링 전략을 자동으로 결정한다

  이것이 Step 19에서 배운 "혼합 전략"이 Next.js에서 구현되는 방식
```

### 4.4 사례: Route Groups를 활용한 인증 아키텍처

```
인증이 필요한 영역과 공개 영역을 Route Groups로 분리

  app/
  ├── (public)/               ← 인증 불필요
  │   ├── layout.js           → 공개 레이아웃 (마케팅 헤더)
  │   ├── page.js             → 랜딩 페이지 (/)
  │   ├── about/page.js       → /about
  │   └── pricing/page.js     → /pricing
  │
  ├── (auth)/                 ← 인증 관련
  │   ├── layout.js           → 인증 페이지 레이아웃 (중앙 정렬)
  │   ├── login/page.js       → /login
  │   └── register/page.js    → /register
  │
  └── (protected)/            ← 인증 필요
      ├── layout.js           → 인증 체크 + 앱 레이아웃
      │   // layout.js에서 세션 확인 → 미인증 시 /login으로 리다이렉트
      ├── dashboard/page.js   → /dashboard
      └── settings/page.js    → /settings

  장점:
  · (protected)/layout.js 하나로 모든 보호 라우트에 인증 적용
  · URL 구조에는 영향 없음 (/dashboard, /settings 그대로)
  · 공개/보호 레이아웃을 완전히 분리
```

---

## 5. 실습

### 실습 1: App Router 기본 구조 설계 [Applying]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 파일 시스템 라우팅으로 앱 구조를 설계한다.

```
요구사항:
  아래 페이지 구성에 맞는 app/ 폴더 구조를 작성하라.
  각 파일의 역할도 간략히 기술하라.

  페이지:
    · / (홈)
    · /about (소개)
    · /products (상품 목록)
    · /products/:id (상품 상세)
    · /dashboard (개요 — 인증 필요)
    · /dashboard/orders (주문 내역 — 인증 필요)
    · /dashboard/settings (설정 — 인증 필요)
    · /login (로그인)
    · 404 페이지

  설계할 것:
    1. 폴더/파일 트리 구조
    2. 어떤 layout.js가 필요한지
    3. 어떤 loading.js / error.js가 필요한지
    4. Route Groups를 사용할 부분
    5. 동적 세그먼트 위치
```

---

### 실습 2: 정적/동적 렌더링 판별 [Analyzing]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** Next.js가 정적/동적을 결정하는 조건을 이해한다.

아래 각 page.js가 정적 렌더링인지 동적 렌더링인지 판별하고 근거를 제시하라.

```jsx
// A
export default async function PageA() {
  const data = await fetch('https://api.example.com/static-data', {
    next: { revalidate: 3600 }
  });
  return <div>{/* ... */}</div>;
}

// B
import { cookies } from 'next/headers';
export default async function PageB() {
  const session = (await cookies()).get('session');
  return <div>Welcome {session?.value}</div>;
}

// C
export default function PageC() {
  return <div><h1>About Us</h1><p>We build great things.</p></div>;
}

// D
export default async function PageD({ searchParams }) {
  const { q } = await searchParams;
  const results = await search(q);
  return <div>{/* ... */}</div>;
}

// E
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}
export default async function PageE({ params }) {
  const product = await getProduct((await params).id);
  return <div>{product.name}</div>;
}
```

---

### 실습 3: Server Action + revalidation 구현 [Applying]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** Server Action으로 CRUD를 구현하고 캐시를 갱신한다.

```
요구사항 (개념 설계):
  · 할 일 목록 앱
  · page.js: Server Component — DB에서 할 일 조회
  · actions.js: addTodo, toggleTodo, deleteTodo Server Actions
  · 각 Action 후 revalidatePath('/todos')로 캐시 갱신
  · loading.js: 스켈레톤 UI
  · error.js: 에러 메시지 + 다시 시도 버튼
  · SubmitButton: "use client" — useFormStatus로 pending 표시

  작성할 것:
    1. app/todos/ 폴더 구조
    2. 각 파일의 코드 (Server Component + Client Component 경계)
    3. Server Action 3개의 구현
```

---

### 실습 4 (선택): Vite vs Next.js 마이그레이션 분석 [Evaluating]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 기존 Vite 앱을 Next.js로 마이그레이션할 때의 변화를 분석한다.

```
과제:
  Step 18 실습에서 만든 React Router 앱을 Next.js로 변환한다고 가정하고:

  1. 라우트 구조를 app/ 폴더 구조로 변환
  2. useEffect 데이터 패칭을 Server Component 직접 패칭으로 변환
  3. Error Boundary를 error.js로 변환
  4. Suspense를 loading.js로 변환
  5. Protected Route를 layout.js의 인증 체크로 변환

  분석할 것:
    · 코드 줄 수 변화 (보일러플레이트 감소)
    · 클라이언트 번들 크기 변화
    · "use client"가 필요한 컴포넌트 목록
    · 마이그레이션의 이점과 비용
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 21 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. App Router = 파일 시스템 기반 라우팅 + RSC 기본값          │
│     → 폴더 이름 = URL 세그먼트                               │
│     → page.js가 있어야 라우트 공개                           │
│     → [param] = 동적 세그먼트                                │
│     → (group) = URL 미포함 조직 폴더                         │
│                                                               │
│  2. 특수 파일 규약으로 UI 구조가 자동 설정된다                 │
│     → layout.js: 공유 레이아웃 (리렌더링 안 됨)              │
│     → loading.js: Suspense fallback 자동 생성                │
│     → error.js: Error Boundary 자동 생성                     │
│     → not-found.js: 404 페이지                               │
│     → 중첩 순서: layout > error > loading > page             │
│                                                               │
│  3. Server Component에서 직접 데이터 패칭                     │
│     → async/await로 DB, API 직접 조회                        │
│     → fetch의 cache 옵션으로 SSG/ISR/SSR 자동 결정           │
│     → generateStaticParams로 동적 라우트 정적 생성            │
│                                                               │
│  4. Next.js가 정적/동적 렌더링을 자동 판단한다                 │
│     → 기본값: 정적 (빌드 시 생성, CDN 캐시)                  │
│     → cookies(), headers(), searchParams → 동적으로 전환     │
│     → fetch no-store → 동적으로 전환                         │
│     → 개발자는 "데이터 신선도"만 설정하면 됨                  │
│                                                               │
│  5. Server Actions + revalidation = 풀스택 데이터 흐름        │
│     → "use server" 함수로 DB 변경                            │
│     → revalidatePath/revalidateTag로 캐시 무효화             │
│     → form action에 직접 전달 가능                           │
│     → API Route 없이 서버 로직 호출                          │
│                                                               │
│  6. Route Groups으로 레이아웃/인증 영역을 분리한다             │
│     → (marketing), (app), (auth) 등                          │
│     → URL에 영향 없이 폴더 구조 조직                         │
│                                                               │
│  7. Vite+React Router vs Next.js 선택 기준                    │
│     → SEO, 서버 데이터, 초기 성능 → Next.js                  │
│     → 내부 도구, 프로토타입, SPA 충분 → Vite + React Router  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                      | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | page.js와 layout.js의 역할 차이를 설명하라                                | Remember   | 3.2         |
| 2   | loading.js가 내부적으로 생성하는 React 구조는?                            | Understand | 3.2         |
| 3   | error.js에 "use client"가 필수인 이유는?                                  | Understand | 3.2         |
| 4   | layout.js가 네비게이션 시 리렌더링되지 않는다는 것의 실질적 이점은?       | Understand | 3.2         |
| 5   | Route Groups `(groupName)`의 용도 2가지를 예시와 함께 설명하라            | Apply      | 3.3         |
| 6   | `cookies()`를 사용하면 정적 렌더링이 동적으로 전환되는 이유는?            | Analyze    | 3.5         |
| 7   | Server Action 후 revalidatePath가 하는 역할은?                            | Apply      | 3.6         |
| 8   | SEO가 불필요한 내부 대시보드에 Next.js 대신 Vite를 선택하는 근거 3가지는? | Evaluate   | 3.9         |

### 6.3 FAQ

**Q1. App Router와 Pages Router 중 새 프로젝트에서 무엇을 선택해야 하나요?**

새 프로젝트라면 반드시 App Router를 선택해야 한다. Pages Router는 레거시로 취급되며 새 기능(RSC, Server Actions 등)이 추가되지 않는다. Next.js 팀도 App Router를 공식 권장 방식으로 명시하고 있다. 기존 Pages Router 프로젝트는 점진적 마이그레이션이 가능하다(app/과 pages/ 디렉토리를 동시에 사용).

**Q2. loading.js와 Suspense를 직접 사용하는 것 중 어느 것이 더 좋은가요?**

loading.js는 페이지 전체의 로딩 UI를 간단하게 정의하는 데 적합하다. 그러나 페이지 내부의 특정 섹션만 점진적으로 로딩하고 싶다면 Suspense를 직접 사용해야 한다. 예를 들어 상품 목록은 즉시 보이고 추천 상품만 별도로 스트리밍하려면 Suspense로 해당 컴포넌트를 직접 감싸야 한다.

**Q3. Next.js에서 클라이언트 사이드 네비게이션은 어떻게 동작하나요?**

Next.js의 Link 컴포넌트(`<Link href="/about">`)를 사용하면 클라이언트 사이드 네비게이션이 동작한다. 전체 페이지를 다시 로드하지 않고 변경된 세그먼트만 업데이트한다. layout.js는 리렌더링되지 않고 page.js만 교체되므로, React Router의 Nested Routes와 동일한 SPA 경험을 제공한다.

**Q4. generateStaticParams로 정의하지 않은 동적 라우트는 어떻게 처리되나요?**

기본적으로 동적 렌더링(SSR)으로 처리된다. 즉 빌드 시 생성되지 않고 첫 요청 시 서버에서 렌더링된다. `dynamicParams = false`를 export하면 정의되지 않은 파라미터에 대해 404를 반환하도록 설정할 수도 있다.

**Q5. Next.js 15의 캐싱 변경으로 무엇이 달라졌나요?**

Next.js 14까지는 fetch의 기본값이 `force-cache`(정적 캐시)였다. Next.js 15에서는 기본값이 `no-store`(캐시 안 함)로 변경되어 fetch가 기본적으로 매 요청마다 새로 패칭한다. 정적 캐싱이 필요하면 명시적으로 `cache: 'force-cache'` 또는 `next: { revalidate: N }`을 지정해야 한다. 이 변경은 "기본적으로 안전한(캐시로 인한 오래된 데이터 표시 방지)" 동작을 위한 결정이다.

---

## 7. 다음 단계 예고

> **Step 22. REST API 통합과 데이터 패칭 패턴**
>
> - REST API 설계 기초와 React에서의 소비 방법
> - fetch API vs Axios 비교
> - 데이터 패칭의 상태 관리 패턴 (loading/error/data)
> - Race Condition, 캐싱, Optimistic Update의 기초
> - TanStack Query 도입 전의 "수동 패칭의 한계" 인식

---

## 📚 참고 자료

- [Next.js 공식 문서 — App Router](https://nextjs.org/docs/app)
- [Next.js 공식 문서 — File Conventions](https://nextjs.org/docs/app/api-reference/file-conventions)
- [Next.js 공식 문서 — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js 공식 문서 — Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js 공식 문서 — Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js 공식 문서 — Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Vercel — Next.js App Router Tutorial](https://nextjs.org/learn)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 21 of 42
