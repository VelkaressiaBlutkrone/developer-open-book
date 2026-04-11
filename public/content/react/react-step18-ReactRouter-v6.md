# Step 18. React Router v6+ 심화

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다 — **Phase 3 시작**

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| **Remember**   | 클라이언트 사이드 라우팅의 구성 요소(Router, Route, Link, Outlet)를 나열할 수 있다 |
| **Understand** | History API를 통한 클라이언트 사이드 라우팅의 동작 원리를 설명할 수 있다           |
| **Understand** | Nested Routes와 Layout Route가 UI 구조와 어떻게 대응하는지 설명할 수 있다          |
| **Apply**      | Nested Routes, 동적 라우트, 보호된 라우트를 구현할 수 있다                         |
| **Analyze**    | 기존 Route 방식과 Data Router(loader/action)의 차이를 분석할 수 있다               |
| **Evaluate**   | 애플리케이션의 라우트 구조를 설계하고 적절한 라우팅 패턴을 판단할 수 있다          |

**전제 지식:**

- Step 3: SPA 개념, History API, React 생태계에서 라우팅의 위치
- Step 5: Props, 단방향 데이터 흐름, Composition
- Step 9: 조건부 렌더링
- Step 17: Error Boundary (라우트별 에러 처리)

---

## 1. 서론 — SPA에 "페이지"를 만들다

### 1.1 클라이언트 사이드 라우팅의 등장 배경

웹의 역사는 "페이지 전환"의 진화 과정이기도 하다. 초창기 웹은 서버가 모든 HTML을 생성하고, 사용자가 링크를 클릭할 때마다 서버에 새 요청을 보내 전체 페이지를 다시 로드했다. 이 모델은 단순하지만 모든 클릭마다 화면이 깜빡이고, 스크롤 위치가 초기화되며, 입력 폼이 리셋되는 불편함이 있었다.

2000년대 중반 Ajax(Asynchronous JavaScript and XML)의 등장으로 페이지 전체를 새로고침하지 않고 일부만 업데이트하는 것이 가능해졌다. 이후 HTML5의 History API가 표준화되면서 URL을 서버 요청 없이 변경할 수 있게 되었고, 이것이 SPA(Single Page Application)의 기술적 토대가 되었다.

React Router는 이 History API 위에 구축된 선언적 라우팅 라이브러리다. "어떤 URL에서 어떤 컴포넌트를 보여주는가"를 선언적으로 정의하고, 뒤로 가기/앞으로 가기 같은 브라우저 기능을 자동으로 처리한다.

### 1.2 React Router의 진화 — v5에서 v6로

React Router v6(2021년 출시)는 이전 버전과 근본적으로 다른 설계를 채택했다. v5의 주요 문제점은 중첩 라우트 설정이 복잡하고, 상대 경로 처리가 일관성 없으며, 번들 크기가 컸다는 것이다.

v6는 이 문제들을 다음과 같이 해결했다:

- `<Switch>` 제거 → `<Routes>`로 교체 (자동 최상위 매칭)
- `<Route exact>` 제거 → 기본이 정확 매칭
- 중첩 라우트 선언 방식 단순화 (`<Outlet>` 도입)
- 상대 경로 처리 일관성 개선
- 번들 크기 39% 감소

v6.4에서는 **Data Router** 개념이 추가되었다. 라우트 진입 전에 데이터를 미리 가져오는 `loader`와 폼 제출을 처리하는 `action`을 라우트 설정에 직접 연결할 수 있다. 이것은 Remix 프레임워크의 라우팅 철학을 React Router에 가져온 것이다.

### 1.3 라우팅이 해결하는 핵심 문제들

SPA에서 라우팅 없이 앱을 만들면 여러 문제가 발생한다. URL이 항상 동일하므로 사용자가 특정 화면을 북마크하거나 공유할 수 없다. 뒤로 가기 버튼이 앱 내에서 동작하지 않고 이전 웹사이트로 이동한다. 새로고침하면 항상 초기 화면으로 돌아간다.

```
라우팅이 해결하는 것

  URL과 UI의 동기화:
    /              →  홈 페이지
    /products      →  상품 목록
    /products/42   →  42번 상품 상세
    /cart          →  장바구니
    /login         →  로그인 페이지

  브라우저 기능 보장:
    · 뒤로 가기 / 앞으로 가기 — History API로 지원
    · URL 직접 입력 — 서버 설정과 함께 지원
    · 북마크 — URL이 상태를 표현하므로 자연스럽게 지원
    · 링크 공유 — 공유한 URL에서 동일한 화면 표시
    · SEO — 각 페이지가 고유 URL을 가짐
```

### 1.4 개념 지도 — React Router v6의 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│               React Router v6 개념 지도                          │
│                                                                  │
│  [라우터 계층]                                                    │
│  BrowserRouter (History API 기반)                                │
│  MemoryRouter (메모리 기반, 테스트용)                             │
│  createBrowserRouter (Data Router, v6.4+)                        │
│                                                                  │
│  [라우트 선언]                                                    │
│  <Routes>                                                        │
│    <Route path="/" element={<Home/>}>                            │
│      <Route index element={<Dashboard/>}/>       ← index route   │
│      <Route path="products" element={<Products/>}/>              │
│        <Route path=":id" element={<Detail/>}/>   ← 동적 라우트   │
│      </Route>                                                    │
│    </Route>                                                      │
│    <Route path="*" element={<NotFound/>}/>        ← 404          │
│  </Routes>                                                       │
│                                                                  │
│  [네비게이션]          [데이터 접근]        [Data Router]         │
│  <Link>               useParams()         loader 함수            │
│  <NavLink>            useSearchParams()   action 함수            │
│  <Navigate>           useLocation()       useLoaderData()        │
│  useNavigate()        useNavigate()       useFetcher()           │
│                                                                  │
│  [레이아웃]                                                       │
│  <Outlet/>  ← 자식 Route가 렌더링될 위치                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · 클라이언트 사이드 라우팅의 동작 원리 (History API)    │
│  · React Router v6+의 핵심 컴포넌트와 Hook              │
│  · Nested Routes와 Layout Route                        │
│  · 동적 라우트 파라미터 (useParams)                     │
│  · 프로그래밍 방식 네비게이션 (useNavigate)              │
│  · 검색 파라미터 (useSearchParams)                      │
│  · 보호된 라우트 (Protected Route) 패턴                 │
│  · Data Router (loader / action) 개요                  │
│  · 라우트 구조 설계 전략                                 │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Next.js App Router (Step 21)                         │
│  · SSR/SSG 라우팅 (Step 19~20)                         │
│  · TanStack Router                                      │
│  · 라우트 기반 코드 분할 상세 (Step 30)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                    | 정의                                                                                 | 왜 중요한가                                        |
| ----------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Client-Side Routing** | 서버 요청 없이 **JavaScript와 History API로 URL을 변경**하고 해당 UI를 표시하는 기법 | SPA에서 "페이지 전환"을 구현하는 핵심 메커니즘이다 |
| **BrowserRouter**       | HTML5 History API를 사용하는 **라우터 컴포넌트**                                     | 대부분의 웹 앱에서 사용하는 기본 라우터이다        |
| **Route**               | **URL 경로와 React 컴포넌트를 매핑**하는 설정                                        | "이 URL에서 이 컴포넌트를 보여준다"의 선언이다     |
| **Nested Routes**       | 라우트 안에 **자식 라우트**가 포함된 구조                                            | 공유 레이아웃을 효율적으로 관리한다                |
| **Outlet**              | 부모 Route에서 **자식 Route가 렌더링될 위치**를 지정                                 | Nested Routes의 핵심 도구이다                      |
| **Link / NavLink**      | 페이지 새로고침 없이 URL을 변경하는 네비게이션 컴포넌트                              | SPA의 네비게이션을 담당한다                        |
| **useParams**           | 동적 라우트 파라미터(:id)의 값을 읽는 Hook                                           | URL에서 데이터 ID 등을 추출한다                    |
| **useNavigate**         | 코드에서 프로그래밍 방식으로 페이지를 이동하는 Hook                                  | 폼 제출 후 리다이렉트 등에 사용한다                |
| **useSearchParams**     | URL의 쿼리 문자열(?key=value)을 읽고 변경하는 Hook                                   | 필터, 정렬 등을 URL에 저장한다                     |
| **loader**              | Data Router에서 라우트 진입 전에 데이터를 가져오는 함수                              | Waterfall 문제를 해결한다                          |
| **action**              | Data Router에서 폼 제출 등 데이터 변경을 처리하는 함수                               | HTML 폼 패턴을 SPA에 도입한다                      |

### 2.2 React Router 핵심 구성 요소

```
┌─────────────────────────────────────────────────────────────┐
│  라우터: BrowserRouter, createBrowserRouter               │
│  라우트: <Routes>, <Route>, <Route index>                  │
│  네비게이션: <Link>, <NavLink>, <Navigate>, useNavigate()  │
│  데이터: useParams(), useSearchParams(), useLocation()      │
│  레이아웃: <Outlet>                                        │
│  Data Router: loader, action, useLoaderData(), <Form>      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 URL의 구성 요소와 라우팅

URL은 여러 구성 요소로 이루어지며, React Router의 각 API는 이 구성 요소 중 특정 부분을 담당한다.

```
URL 예시: https://shop.example.com/products/42?sort=price&page=2#reviews

  https://shop.example.com  →  origin (도메인)
  /products/42              →  pathname (라우트 매칭 대상)
    /products               →  정적 세그먼트 → <Route path="/products">
    /42                     →  동적 세그먼트 → useParams()의 id
  ?sort=price&page=2        →  search (쿼리 문자열) → useSearchParams()
  #reviews                  →  hash (앵커) → useLocation().hash

  각 구성 요소의 역할:
  · pathname → 어떤 컴포넌트를 렌더링할지 결정
  · 동적 세그먼트 → 특정 데이터 항목의 ID
  · 쿼리 문자열 → 현재 페이지의 보조 상태 (필터, 정렬, 페이지)
  · hash → 페이지 내 특정 위치로 스크롤
```

### 2.4 Link vs a 태그 — SPA에서의 네비게이션

일반 `<a>` 태그를 SPA에서 사용하면 안 되는 이유를 이해하는 것이 중요하다.

```
<a href="/products">상품</a> 클릭 시:
  1. 브라우저가 /products에 HTTP 요청을 보낸다
  2. 서버가 HTML을 반환한다
  3. 브라우저가 전체 페이지를 다시 로드한다
  → 앱 상태가 모두 초기화됨, 깜빡임 발생

<Link to="/products">상품</Link> 클릭 시:
  1. React Router가 클릭을 가로채 e.preventDefault()
  2. history.pushState(null, '', '/products') 로 URL만 변경
  3. React Router가 새 URL에 맞는 컴포넌트를 렌더링
  → 페이지 새로고침 없음, 앱 상태 유지, 깜빡임 없음
```

---

## 3. 이론과 원리

### 3.1 클라이언트 사이드 라우팅의 동작 원리

#### History API — SPA 라우팅의 기반

브라우저의 History API는 세 가지 핵심 기능을 제공한다:

```
History API의 핵심 메서드

  history.pushState(state, title, url)
    · 새 URL을 히스토리 스택에 추가
    · 브라우저 주소창의 URL이 변경됨
    · 서버에 요청을 보내지 않음
    · 예: history.pushState(null, '', '/products')

  history.replaceState(state, title, url)
    · 현재 URL을 새 URL로 교체 (스택에 추가 X)
    · 로그인 후 리다이렉트처럼 "뒤로 가기"를 막을 때 사용

  popstate 이벤트
    · 뒤로/앞으로 가기 버튼 클릭 시 발생
    · React Router가 이 이벤트를 감지하여 컴포넌트를 업데이트
```

```
React Router의 내부 동작 (간략화):

  1. <Link to="/products">상품</Link> 클릭
  2. React Router가 e.preventDefault()로 기본 동작 방지
  3. history.pushState(null, '', '/products')로 URL만 변경
  4. React Router가 새 URL과 매칭되는 Route를 찾는다
  5. 해당 Route의 element를 렌더링한다
  6. 페이지 새로고침 없이 화면이 교체된다!

  ⚠️ 브라우저에 URL을 직접 입력하거나 새로고침하면
     서버에 해당 경로로 요청이 간다.
     서버가 모든 경로에 index.html을 반환하도록 설정 필요.
```

#### 서버 설정의 필요성

SPA를 배포할 때 서버 설정이 중요하다. 사용자가 `/products/42`를 직접 URL 창에 입력하면, 서버에 `/products/42` 경로로 HTTP 요청이 간다. 서버가 이 경로에 대한 파일이 없다면 404를 반환한다. 이를 방지하려면 모든 경로 요청에 대해 `index.html`을 반환하도록 서버를 설정해야 한다.

```
서버별 SPA 설정 예시 (개념):

  Nginx:
    location / {
      try_files $uri $uri/ /index.html;
    }

  Apache (.htaccess):
    RewriteRule ^ /index.html [L]

  Vite 개발 서버:
    자동으로 처리됨 (historyApiFallback)

  Vercel/Netlify:
    설정 파일에서 rewrites 규칙 추가
```

### 3.2 기본 라우팅 구조

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">홈</Link>
        <Link to="/products">상품</Link>
        <Link to="/about">소개</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

```
Route 매칭 규칙 (v6)

  v6는 가장 구체적인 경로를 우선 매칭한다 (자동 순위 결정)

  /users/new       → 정적 경로가 동적 경로보다 우선
  /users/:id       → 동적 경로
  /users/*         → 와일드카드 (가장 낮은 우선순위)

  v5와의 차이:
    v5: <Switch>로 위에서 아래로 순서대로 매칭
    v6: <Routes>가 자동으로 가장 구체적인 경로 선택
    → exact 속성 불필요, 순서 무관
```

#### Link vs NavLink

```jsx
// Link: 기본 네비게이션
<Link to="/products">상품</Link>

// NavLink: 활성 경로에 스타일 적용
<NavLink
  to="/products"
  className={({ isActive }) => isActive ? 'nav-active' : ''}
>
  상품
</NavLink>

// end 속성: 정확히 일치할 때만 active
<NavLink to="/products" end>상품</NavLink>
// /products → active ✅, /products/42 → active ❌
```

```
NavLink의 isActive 판별 기준

  · end 없음: 현재 URL이 to 경로로 시작하면 active
    to="/dashboard" → /dashboard, /dashboard/stats 모두 active

  · end 있음: 현재 URL이 to와 정확히 일치해야 active
    to="/dashboard" end → /dashboard만 active
    → 루트("/") 경로나 레이아웃 링크에 end를 사용
```

### 3.3 Nested Routes와 Layout Route

#### 중첩 라우트의 개념과 필요성

현대 웹 앱에서 페이지들은 대부분 공통 레이아웃을 공유한다. 대시보드의 모든 페이지는 사이드바와 헤더를 공유하고, 상품 섹션의 모든 페이지는 카테고리 필터를 공유한다. Nested Routes는 이 패턴을 선언적으로 표현하는 방법이다.

레이아웃 컴포넌트를 부모 Route로 설정하고, 그 안에서 교체될 콘텐츠를 자식 Route로 설정한다. `<Outlet>`이 자식 Route가 렌더링될 위치를 지정한다.

```
URL: /dashboard/analytics

UI 구조:
  ┌────────────────────────┐
  │ DashboardLayout         │
  │ ┌──────┐ ┌───────────┐ │
  │ │사이드 │ │ Analytics │ │  ← Outlet에 렌더링
  │ │바     │ │ Page      │ │
  │ └──────┘ └───────────┘ │
  └────────────────────────┘

  DashboardLayout은 모든 /dashboard/* 에서 공유
  Outlet 부분만 URL에 따라 교체
```

#### 구현

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />

  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<OverviewPage />} />
    {/* index route: /dashboard 접근 시 기본으로 표시 */}
    <Route path="analytics" element={<AnalyticsPage />} />
    {/* /dashboard/analytics */}
    <Route path="settings" element={<SettingsPage />} />
    {/* /dashboard/settings */}
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>;

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <NavLink to="/dashboard" end>
          개요
        </NavLink>
        <NavLink to="/dashboard/analytics">분석</NavLink>
        <NavLink to="/dashboard/settings">설정</NavLink>
      </aside>
      <main>
        <Outlet /> {/* ★ 자식 Route가 여기에 렌더링 */}
      </main>
    </div>
  );
}
```

```
index Route 이해하기

  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<OverviewPage />} />
    ...
  </Route>

  · /dashboard 접근 시: DashboardLayout + OverviewPage (Outlet 위치에)
  · /dashboard/analytics 접근 시: DashboardLayout + AnalyticsPage

  index Route가 없으면 /dashboard 접근 시 Outlet이 비어 있음
  → 각 레이아웃의 "기본 페이지"를 설정하는 데 사용
```

#### Pathless Layout Route — 레이아웃 전용

path 없이 레이아웃만 적용할 수도 있다. URL 구조에 영향을 주지 않으면서 공통 레이아웃이나 인증 가드를 적용할 때 유용하다.

```jsx
<Routes>
  {/* path 없이 Layout만 적용 — URL에 영향 없음 */}
  <Route element={<AuthenticatedLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Route>

  <Route path="/login" element={<LoginPage />} />
</Routes>;

function AuthenticatedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <AuthHeader user={user} />
      <Outlet />
    </>
  );
}
```

```
Pathless Layout Route의 활용 패턴

  1. 인증 가드 — 로그인 여부에 따라 리다이렉트
  2. 공통 레이아웃 — 헤더/푸터/사이드바 공유
  3. 권한 체크 — 역할별 접근 제어
  4. 분석 추적 — 페이지 방문 이벤트 전송
  5. Error Boundary — 라우트 그룹에 에러 경계 설정
```

### 3.4 동적 라우트와 파라미터

#### 동적 세그먼트

URL의 일부를 변수처럼 취급하는 동적 세그먼트는 `:paramName` 형식으로 정의한다.

```jsx
<Route path="/products/:productId" element={<ProductDetail />} />;

function ProductDetail() {
  const { productId } = useParams();
  // /products/42 → productId = "42" (항상 문자열)
  // /products/react-hooks → productId = "react-hooks"

  return <h1>상품 #{productId}</h1>;
}
```

```
동적 세그먼트 주의사항

  · useParams의 반환값은 항상 문자열이다
    → 숫자가 필요하면 Number() 또는 parseInt()로 변환

  · 여러 동적 세그먼트 사용 가능
    path="/users/:userId/posts/:postId"
    → { userId: "1", postId: "42" }

  · 선택적 세그먼트는 지원 안 함 (v6)
    → 두 개의 Route를 별도로 정의하거나
      loader에서 처리
```

#### useSearchParams — 쿼리 문자열을 URL에 저장

```jsx
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "name";
  const page = Number(searchParams.get("page") ?? "1");

  const handleCategoryChange = (newCategory) => {
    setSearchParams((prev) => {
      prev.set("category", newCategory);
      prev.set("page", "1"); // 카테고리 변경 시 1페이지로
      return prev;
    });
  };

  const handleSortChange = (newSort) => {
    setSearchParams((prev) => {
      prev.set("sort", newSort);
      return prev;
    });
  };

  return (
    <div>
      {/* URL: /products?category=electronics&sort=price&page=1 */}
      <select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="electronics">전자기기</option>
        <option value="clothing">의류</option>
      </select>
      {/* ... */}
    </div>
  );
}
```

```
useSearchParams의 가치

  State로 필터 관리:
    · 새로고침 → 필터 초기화 ❌
    · URL 공유 → 기본 상태만 보임 ❌
    · 뒤로 가기 → 이전 필터 없음 ❌

  URL로 필터 관리:
    · 새로고침 → 필터 유지 ✅
    · URL 공유 → 같은 필터 적용 ✅
    · 뒤로 가기 → 이전 필터 복원 ✅
    · 북마크 → 현재 필터 상태로 저장 ✅

  원칙: "공유/북마크 가능해야 하는 상태"는 URL에 저장
```

### 3.5 프로그래밍 방식 네비게이션

이벤트 핸들러, 폼 제출 후 리다이렉트, 조건부 이동 등 코드에서 직접 페이지를 이동해야 할 때 `useNavigate`를 사용한다.

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    await login(credentials);
    // replace: true → 현재 히스토리를 교체 (뒤로 가기 시 로그인 재방문 없음)
    navigate("/dashboard", { replace: true });
  };

  return (/* 폼 */);
}

// 뒤로/앞으로 가기
const navigate = useNavigate();
navigate(-1);    // 뒤로 1단계
navigate(1);     // 앞으로 1단계
navigate(-2);    // 뒤로 2단계

// state 전달 (다음 페이지에서 useLocation().state로 읽기)
navigate("/checkout", { state: { from: "cart", items: cartItems } });
```

```
navigate의 옵션

  navigate(to, options)
    · to: 이동할 경로 (문자열 또는 숫자)
    · options.replace: true면 현재 히스토리 교체 (기본 false)
    · options.state: 다음 페이지로 전달할 데이터
    · options.relative: 상대 경로 처리 방식

  언제 replace: true를 사용하는가?
    · 로그인 후 대시보드로 이동 (로그인 페이지로 뒤로 가기 불필요)
    · 폼 제출 후 완료 페이지로 이동 (폼 재제출 방지)
    · 리다이렉트 패턴 (이전 URL이 히스토리에 남으면 안 되는 경우)
```

### 3.6 보호된 라우트 (Protected Route)

인증이 필요한 페이지에 비로그인 사용자가 접근하려 할 때 로그인 페이지로 리다이렉트하고, 로그인 후 원래 요청했던 페이지로 되돌아가는 패턴이다.

```jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // state에 현재 경로를 저장하여 로그인 후 복귀할 수 있게 한다
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// 로그인 후 원래 경로로 복귀
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute에서 저장한 경로 읽기
  const from = location.state?.from?.pathname ?? "/dashboard";

  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate(from, { replace: true });
  };

  return (/* 로그인 폼 */);
}

// 라우트 구성에서 사용
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

```
보호된 라우트 흐름

  1. 비로그인으로 /dashboard 접근
  2. ProtectedRoute → Navigate to="/login" state={{ from: /dashboard }}
  3. 로그인 폼 표시
  4. 로그인 성공
  5. navigate(from) → /dashboard로 이동
  6. replace: true → /login이 히스토리에 남지 않음

  역할별 접근 제어 확장:
    function RoleRoute({ children, requiredRole }) {
      const { user } = useAuth();
      if (!user) return <Navigate to="/login" />;
      if (!user.roles.includes(requiredRole))
        return <Navigate to="/unauthorized" />;
      return children;
    }
```

#### Pathless Layout Route를 활용한 보호된 라우트

여러 라우트에 동일한 인증 가드를 적용할 때 Pathless Layout Route가 더 깔끔하다.

```jsx
// 인증이 필요한 모든 라우트를 하나의 Pathless Route로 그룹화
function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/about" element={<AboutPage />} />

  {/* 인증 필요 라우트 그룹 */}
  <Route element={<RequireAuth />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>;
```

### 3.7 Data Router — loader와 action (v6.4+)

#### Waterfall 문제와 해결

기존 useEffect 기반 데이터 패칭의 근본적인 문제는 **Waterfall**(폭포) 패턴이다. 컴포넌트가 렌더링된 후에야 데이터 패칭을 시작하므로, 중첩된 컴포넌트는 부모의 패칭이 완료될 때까지 기다려야 한다.

```
기존 (useEffect): 직렬 패칭 (Waterfall)

  라우트 변경
      ↓
  RootLayout 렌더링 (0ms)
      ↓ (렌더링 후)
  UserMenu 패칭 시작 (50ms)
      ↓ (완료 후 자식 렌더링)
  DashboardPage 렌더링
      ↓ (렌더링 후)
  RevenueChart 패칭 시작 (150ms)
      ↓
  UserStats 패칭 시작 (100ms)
      ↓
  총 시간: 50 + 150 = 200ms (직렬)

Data Router (loader): 병렬 패칭

  라우트 변경
      ↓ 동시에 모든 loader 실행
  userLoader (50ms) ──────────┐
  revenueLoader (150ms) ──────┤ 병렬
  statsLoader (100ms) ────────┘
      ↓ 모든 loader 완료 후 렌더링
  총 시간: max(50, 150, 100) = 150ms
```

#### 구현

```jsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  Form,
  redirect,
} from "react-router-dom";

// loader: 라우트 진입 전에 실행되는 데이터 패칭 함수
async function productLoader({ params }) {
  const res = await fetch(`/api/products/${params.productId}`);
  if (!res.ok) throw new Response("Not Found", { status: 404 });
  return res.json();
  // 반환값이 useLoaderData()의 값이 된다
}

// action: 폼 제출 시 실행되는 데이터 변경 함수
async function reviewAction({ request, params }) {
  const formData = await request.formData();
  await fetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify({
      productId: params.productId,
      text: formData.get("text"),
      rating: formData.get("rating"),
    }),
    headers: { "Content-Type": "application/json" },
  });
  return redirect(`/products/${params.productId}`);
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />, // 이 라우트의 Error Boundary
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "products/:productId",
        element: <ProductDetail />,
        loader: productLoader, // 라우트 진입 전 데이터 패칭
        action: reviewAction, // 폼 제출 처리
        errorElement: <ProductError />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

function ProductDetail() {
  // loader의 반환값을 직접 사용 — isLoading 상태 관리 불필요!
  const product = useLoaderData();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Form 컴포넌트: action 함수와 자동 연동 */}
      <Form method="post">
        <textarea name="text" placeholder="리뷰를 작성하세요" />
        <select name="rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}점
            </option>
          ))}
        </select>
        <button type="submit">리뷰 등록</button>
      </Form>
    </div>
  );
}
```

```
Data Router 핵심 개념

  loader:
    · 라우트 URL이 매칭되면, 컴포넌트 렌더링 전에 실행
    · async 함수, fetch 등 비동기 작업 가능
    · throw Response(status: 404) → errorElement 표시
    · return redirect('/other') → 다른 경로로 이동
    · useLoaderData()로 결과값 접근

  action:
    · <Form method="post/put/delete"> 제출 시 실행
    · request.formData()로 폼 데이터 접근
    · return redirect('/path') → 제출 후 이동
    · return json({error: '...'}) → 에러 상태 반환

  useFetcher():
    · 라우트 이동 없이 loader/action 호출
    · "좋아요" 버튼처럼 페이지 전환 없는 데이터 변경에 사용
```

### 3.8 라우트 구조 설계 전략

좋은 라우트 구조는 URL이 앱의 정보 구조를 자연스럽게 반영하고, 레이아웃 공유가 효율적이며, 확장이 쉬워야 한다.

```
설계 원칙

  1. URL은 사용자가 이해할 수 있는 계층 구조
     /products          → 상품 목록
     /products/42       → 42번 상품
     /products/42/edit  → 42번 상품 편집
     /products/new      → 새 상품 등록

  2. 레이아웃 공유 기준으로 Route 중첩
     같은 헤더/사이드바를 공유하는 페이지 → 같은 Layout Route

  3. 동적 세그먼트는 자원의 ID (/products/:id)
     가능하면 슬러그 형식 사용 (/posts/react-hooks-guide)

  4. 쿼리 파라미터는 보조 상태 (?sort=price&page=2)
     필터, 정렬, 페이지네이션, 검색어

  5. 404 처리를 반드시 포함
     <Route path="*" element={<NotFoundPage />} />

  6. 라우트 이름 상수화 (타입 안전성)
     export const ROUTES = {
       HOME: '/',
       PRODUCTS: '/products',
       PRODUCT_DETAIL: (id) => `/products/${id}`,
     }
```

#### 실전 라우트 구조 예시

```jsx
const router = createBrowserRouter([
  {
    // 전체 앱 레이아웃 (글로벌 헤더, 푸터)
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },

      // 인증 필요 그룹
      {
        element: <RequireAuth />, // Pathless Layout Route
        children: [
          // 대시보드 레이아웃 (사이드바 포함)
          {
            path: "dashboard",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <OverviewPage /> },
              { path: "analytics", element: <AnalyticsPage /> },
              { path: "settings", element: <SettingsPage /> },
            ],
          },
        ],
      },

      // 상품 섹션 (카테고리 필터 포함)
      {
        path: "products",
        element: <ProductsLayout />,
        children: [
          {
            index: true,
            element: <ProductListPage />,
            loader: productsLoader,
          },
          {
            path: ":productId",
            element: <ProductDetailPage />,
            loader: productLoader,
            action: productAction,
          },
        ],
      },

      // 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
```

### 3.9 useLocation과 위치 상태

```jsx
import { useLocation } from "react-router-dom";

function SomePage() {
  const location = useLocation();
  // location.pathname  → "/products/42"
  // location.search    → "?sort=price"
  // location.hash      → "#reviews"
  // location.state     → navigate()에서 전달한 state
  // location.key       → 고유한 위치 식별자

  // 이전 페이지 정보 읽기 (navigate에서 state로 전달한 경우)
  const fromPage = location.state?.from;

  return <p>현재 경로: {location.pathname}</p>;
}
```

```
location.state 활용 패턴

  // 이전 페이지에서:
  navigate('/product/42', {
    state: { from: 'search', query: 'react hooks' }
  });

  // 다음 페이지에서:
  const location = useLocation();
  const from = location.state?.from; // 'search'
  const query = location.state?.query; // 'react hooks'

  → "검색 결과로 돌아가기" 버튼 구현
  → 모달의 배경 페이지 추적
  → 폼 제출 완료 페이지에서 원본 데이터 접근
```

---

## 4. 사례 연구와 예시

### 4.1 사례: URL에 상태를 저장하여 공유 가능한 필터

전자상거래 상품 목록에서 카테고리, 가격 범위, 정렬 방식, 페이지를 URL 쿼리 파라미터로 관리하면 사용자가 현재 보고 있는 상태를 그대로 공유할 수 있다.

```
State로 관리:
  URL: /products
  → 필터 공유 불가, 새로고침 시 초기화, 뒤로 가기 시 필터 없음

URL로 관리:
  URL: /products?category=electronics&price=0-100&sort=price-desc&page=2
  → URL 공유 시 동일한 필터 보기 ✅
  → 새로고침 후에도 필터 유지 ✅
  → 뒤로 가기로 이전 필터 상태 복원 ✅
  → 북마크로 자주 보는 필터 저장 ✅

구현 포인트:
  · useSearchParams로 쿼리 파라미터 읽기/쓰기
  · setSearchParams를 함수형으로 호출하여 기존 파라미터 유지
  · 페이지 번호는 다른 필터 변경 시 자동으로 1로 리셋
```

### 4.2 사례: Nested Routes로 레이아웃 최적화

```
다중 레이아웃 중첩 구조

RootLayout (GlobalHeader + GlobalFooter + Outlet)
  ├── ProductsLayout (CategorySidebar + Outlet)
  │     ├── ProductListPage      → /products
  │     └── ProductDetailPage    → /products/:id
  └── DashboardLayout (DashboardMenu + Outlet)
        ├── OverviewPage         → /dashboard
        └── SettingsPage         → /dashboard/settings

  장점:
  · 레이아웃은 한 번만 정의하고 여러 페이지에서 공유
  · URL 변경 시 Outlet만 교체 → 레이아웃 State 보존
  · 사이드바 스크롤 위치, 열린 상태 등이 페이지 이동 시 유지됨
  · 각 레이아웃 컴포넌트가 독립적으로 데이터를 로드할 수 있음
```

### 4.3 사례: Data Router loader로 Waterfall 해결

```
실제 대시보드 시나리오

  대시보드 페이지에 필요한 데이터:
    · 현재 사용자 정보 (인증 API: 50ms)
    · 매출 데이터 (Analytics API: 200ms)
    · 알림 목록 (Notifications API: 80ms)
    · 최근 주문 (Orders API: 120ms)

  useEffect 방식 (직렬):
    사용자 → 매출 → 알림 → 주문
    50 + 200 + 80 + 120 = 450ms

  Data Router loader 방식 (병렬):
    모든 API 동시 시작
    max(50, 200, 80, 120) = 200ms

  → 같은 데이터를 2배 이상 빠르게 표시
  → 로딩 스피너 없이 바로 데이터 표시 (라우트 전환 전 패칭 완료)
```

### 4.4 사례: 모달 라우팅 패턴

소셜 미디어나 이미지 갤러리에서 아이템을 클릭하면 모달로 상세 보기를 보여주되, URL은 해당 아이템의 고유 URL로 변경되는 패턴이다.

```jsx
// 모달 라우팅: 배경 위치를 state로 전달
function ProductGrid() {
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = (productId) => {
    navigate(`/products/${productId}`, {
      state: { backgroundLocation: location }, // 배경으로 사용할 위치
    });
  };

  return (
    <div className="grid">
      {products.map((product) => (
        <div key={product.id} onClick={() => openModal(product.id)}>
          {product.name}
        </div>
      ))}
    </div>
  );
}

// App에서 배경 + 모달 동시 렌더링
function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductGrid />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>

      {/* 모달 라우트: backgroundLocation이 있을 때만 */}
      {backgroundLocation && (
        <Routes>
          <Route path="/products/:id" element={<ProductModal />} />
        </Routes>
      )}
    </>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 기본 라우팅 구현 [Applying]

```
요구사항:
  · 5개 페이지: 홈, 상품 목록, 상품 상세, 소개, 404
  · NavLink로 활성 경로 표시 (end 속성 활용)
  · /products/:productId 동적 라우트
  · useParams로 productId 읽기
  · a 태그 대신 Link/NavLink 사용 (차이점 확인)

확인할 것:
  · Link 클릭 시 페이지 새로고침 없이 화면 전환
  · 뒤로/앞으로 가기 동작 확인
  · 존재하지 않는 경로 접근 시 404 표시
```

### 실습 2: Nested Routes + Layout Route [Applying]

```
요구사항:
  · RootLayout (헤더 + 푸터 + Outlet)
  · DashboardLayout (사이드바 + Outlet)
    - /dashboard (index): 개요
    - /dashboard/stats: 통계
    - /dashboard/settings: 설정
  · 사이드바 NavLink에 활성 경로 표시 (end 활용)
  · 레이아웃에 간단한 State (예: 사이드바 열림/닫힘) 추가
    → 페이지 이동 시 State가 유지되는지 확인
```

### 실습 3: Protected Route + useSearchParams [Applying · Analyzing]

```
요구사항:
  · 인증 시뮬레이션 (useState로 로그인 상태 관리)
  · ProtectedRoute 또는 Pathless Layout Route로 인증 가드 구현
  · 비로그인 → /login 리다이렉트 (현재 경로 state로 저장)
  · 로그인 성공 → 원래 경로로 복귀
  · 상품 목록에서 useSearchParams로 카테고리/정렬 필터 관리
  · URL을 복사해서 다른 탭에 붙여넣어도 같은 필터가 적용되는지 확인

분석할 것:
  · useSearchParams vs useState의 차이를 직접 비교
  · replace: true가 있을 때와 없을 때의 뒤로 가기 동작 차이
```

### 실습 4 (선택): 라우트 구조 설계 [Evaluating · Creating]

```
시나리오: 온라인 학습 플랫폼의 라우트 구조를 설계하라

  페이지 목록:
    · 홈 (비로그인도 접근 가능)
    · 강좌 목록 (카테고리/레벨 필터)
    · 강좌 상세 (무료 미리보기)
    · 강좌 수강 (로그인 필요, 동영상 + 노트)
    · 대시보드 (수강 현황, 진도)
    · 마이페이지 (프로필, 결제 내역)
    · 강사 관리자 페이지 (강사 권한 필요)

  설계할 것:
    1. 전체 라우트 트리 (중첩 구조 포함)
    2. 레이아웃 공유 그룹 설계
    3. Protected Route 배치
    4. URL 구조 (동적 파라미터, 쿼리 파라미터 구분)
    5. Data Router 사용 시 각 라우트의 loader 함수 설계
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 18 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 클라이언트 라우팅 = History API + URL ↔ 컴포넌트 매핑     │
│     → pushState로 URL 변경 (서버 요청 없음)                  │
│     → popstate 이벤트로 뒤로/앞으로 가기 처리                │
│     → 서버에 모든 경로에 대해 index.html 반환 설정 필요       │
│                                                               │
│  2. Nested Routes = URL 계층과 UI 레이아웃 계층의 대응        │
│     → <Outlet>이 자식 Route가 렌더링될 위치 지정              │
│     → index Route로 기본 페이지 설정                         │
│     → Pathless Layout Route로 URL 영향 없이 레이아웃 적용    │
│                                                               │
│  3. 동적 라우트(:param) + useParams로 URL에서 데이터 추출     │
│     → 항상 문자열로 반환 → 숫자 변환 주의                    │
│                                                               │
│  4. useSearchParams로 필터/정렬/페이지를 URL에 저장 (공유 가능)│
│     → setSearchParams(prev => { prev.set(k,v); return prev }) │
│     → 공유/북마크 가능한 상태는 URL에, 일시적 상태는 State에  │
│                                                               │
│  5. Protected Route + Navigate로 인증 기반 접근 제어          │
│     → state={{ from: location }}으로 원래 경로 저장          │
│     → 로그인 후 navigate(from, { replace: true })로 복귀     │
│                                                               │
│  6. useNavigate로 프로그래밍 방식 네비게이션                   │
│     → replace: true로 히스토리 스택 제어                     │
│     → state로 다음 페이지에 데이터 전달                      │
│                                                               │
│  7. Data Router(loader/action)로 Waterfall 해결 + 데이터 통합 │
│     → 라우트 진입 전 병렬 데이터 패칭                         │
│     → useLoaderData()로 isLoading 상태 없이 데이터 접근      │
│     → <Form>과 action으로 Progressive Enhancement 지원       │
│                                                               │
│  8. URL 설계: 계층적, 동적 세그먼트=ID, 쿼리=보조 상태        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                           | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------- | ---------- | ----------- |
| 1   | Link 대신 a 태그를 사용하면 어떤 문제가 발생하는가?            | Understand | 2.4, 3.1    |
| 2   | Outlet의 역할과 Nested Routes에서의 동작을 설명하라            | Understand | 3.3         |
| 3   | Pathless Layout Route의 용도를 예시와 함께 설명하라            | Understand | 3.3         |
| 4   | useSearchParams와 useState의 차이를 3가지 관점에서 비교하라    | Analyze    | 3.4         |
| 5   | ProtectedRoute에서 state={{ from }}의 역할은?                  | Apply      | 3.6         |
| 6   | Data Router의 loader가 Waterfall을 해결하는 원리는?            | Analyze    | 3.7         |
| 7   | NavLink의 end 속성이 필요한 상황은?                            | Apply      | 3.2         |
| 8   | /dashboard/stats에서 Layout과 Page가 동시에 렌더링되는 원리는? | Understand | 3.3         |

### 6.3 FAQ

**Q1. React Router v6에서 v5 코드를 마이그레이션할 때 가장 중요한 변경점은?**

세 가지가 핵심이다. 첫째, `<Switch>`를 `<Routes>`로 교체한다. 둘째, `<Route exact>`를 제거한다(v6는 기본이 정확 매칭). 셋째, `<Route>`의 `component=` 대신 `element=`를 사용한다(`element={<Component />}` 형식). 중첩 라우트는 `<Route>` 안에 `<Route>`를 직접 중첩하는 방식으로 변경된다.

**Q2. BrowserRouter와 createBrowserRouter의 차이는?**

`BrowserRouter`는 컴포넌트 기반 라우터로 JSX로 라우트를 선언한다. `createBrowserRouter`는 Data Router API(v6.4+)를 사용하기 위한 함수 기반 라우터로, `loader`와 `action`을 라우트 설정에 직접 연결할 수 있다. 새 프로젝트에서는 Data Router의 기능이 필요하다면 `createBrowserRouter`를, 단순한 라우팅만 필요하다면 `BrowserRouter`를 사용한다.

**Q3. useSearchParams로 관리하는 상태는 어떤 것인가?**

URL에 저장하기 적합한 상태는 "공유하거나 북마크했을 때 동일한 화면을 보여줘야 하는" 상태다. 상품 목록의 카테고리 필터, 정렬 방식, 현재 페이지, 검색어 등이 해당된다. 반면 모달 열림 상태, 폼 입력 중인 텍스트, 임시 선택 상태 등 공유할 필요가 없는 UI 상태는 `useState`로 관리한다.

**Q4. Nested Routes에서 레이아웃 컴포넌트가 리렌더링되는가?**

자식 Route가 변경될 때 부모 Route(레이아웃 컴포넌트)는 리렌더링되지 않는다. Outlet 내부만 교체된다. 이것이 Nested Routes의 핵심 이점 중 하나다. 레이아웃의 State(사이드바 열림 상태, 스크롤 위치 등)가 페이지 이동 시 유지된다.

**Q5. Data Router의 loader에서 에러가 발생하면 어떻게 되는가?**

라우트 설정의 `errorElement`가 표시된다. `throw new Response("Not Found", { status: 404 })`처럼 Response를 throw하거나 일반 Error를 throw할 수 있다. `errorElement`에서 `useRouteError()` Hook으로 에러 정보에 접근할 수 있다. 이것이 Step 17에서 배운 Error Boundary가 라우팅 레이어에 통합된 형태다.

---

## 7. 다음 단계 예고

> **Step 19. 렌더링 전략 비교 분석**
>
> - CSR, SSR, SSG, ISR, Streaming의 동작 원리와 비교
> - Hydration의 정확한 개념과 과정
> - 각 렌더링 전략의 장단점과 적합한 시나리오
> - SEO, 초기 로딩 속도 관점에서의 분석

---

## 📚 참고 자료

- [React Router 공식 문서](https://reactrouter.com/)
- [React Router — Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [React Router — Data Router](https://reactrouter.com/en/main/routers/create-browser-router)
- [MDN — History API](https://developer.mozilla.org/ko/docs/Web/API/History_API)
- [React Router — v6 마이그레이션 가이드](https://reactrouter.com/en/main/upgrading/v5)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 18 of 42
