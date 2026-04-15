# Step 17. Error Handling 아키텍처

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다 — **Phase 2 마무리**

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **Remember**   | Error Boundary, try/catch, fallback UI의 정의와 역할을 기술할 수 있다               |
| **Understand** | Error Boundary가 잡을 수 있는 에러와 잡을 수 없는 에러의 차이를 설명할 수 있다      |
| **Understand** | Error Boundary + Suspense 결합이 만드는 선언적 에러/로딩 처리 패턴을 설명할 수 있다 |
| **Apply**      | 계층적 Error Boundary를 설계하여 에러의 영향 범위를 제한할 수 있다                  |
| **Analyze**    | 렌더링 에러, 이벤트 핸들러 에러, 비동기 에러의 처리 전략을 각각 분석할 수 있다      |
| **Evaluate**   | 애플리케이션 전체의 에러 처리 아키텍처를 설계하고 사용자 경험을 판단할 수 있다      |

**전제 지식:**

- Step 9: 조건부 렌더링, 4가지 UI 상태(Loading/Error/Empty/Data)
- Step 10: Render Phase / Commit Phase
- Step 11: useEffect, 데이터 패칭의 에러 처리
- Step 15: use() Hook과 Suspense (React 19)
- Step 16: Custom Hook

---

## 1. 서론 — 에러는 반드시 발생한다

### 1.1 에러 처리 철학 — "방어적 설계"의 중요성

소프트웨어 엔지니어링에서 "에러가 없는 코드를 작성한다"는 목표는 이론적으로는 옳지만 실제로는 달성 불가능하다. 네트워크는 예측 불가능하고, 외부 API는 계약을 어기며, 사용자는 예상하지 못한 방식으로 앱을 사용한다. 좋은 엔지니어는 에러가 발생하지 않는 코드를 쓰는 것이 아니라, **에러가 발생했을 때 앱이 우아하게 대응하는 코드**를 쓴다.

이 철학을 React에서 구체화한 것이 **방어적 설계(Defensive Design)** 다. 방어적 설계는 두 가지 핵심 원칙을 가진다. 첫째, 에러를 **격리(Isolation)** 하여 하나의 에러가 전체 앱을 무너뜨리지 않도록 한다. 둘째, 사용자에게 에러 상황을 **명확히 알리고 복구 경로를 제공**한다. 이 두 원칙이 Error Boundary 아키텍처 설계의 기반이다.

### 1.2 에러 처리가 비즈니스에 미치는 영향

에러 처리의 품질은 단순한 기술적 문제가 아니라 비즈니스 성과와 직결된다. 전자상거래에서 결제 페이지의 에러는 매출 손실로 직결되고, 금융 서비스에서 잔액 조회 오류는 고객 신뢰를 훼손한다. 반면 에러가 발생했을 때 "죄송합니다, 잠시 후 다시 시도해 주세요"라는 친절한 메시지와 재시도 버튼을 보여주는 앱은 사용자 이탈률을 현저히 낮춘다.

업계 연구에 따르면 에러 발생 후 사용자의 행동은 크게 세 가지다: 재시도, 다른 방법 탐색, 앱 이탈. 잘 설계된 Fallback UI는 재시도율을 높이고 이탈률을 낮추는 핵심 요소다. 이것이 Error Handling이 순수한 기술 영역을 넘어 UX 설계의 일부인 이유다.

### 1.3 개념 지도 — React 에러 처리의 전체 구조

![React 에러 처리 아키텍처](/developer-open-book/diagrams/react-step17-architecture.svg)

### 1.4 에러 처리가 중요한 이유

모든 애플리케이션에서 에러는 **불가피**하다. 네트워크 장애, 잘못된 API 응답, 예상치 못한 null 값, 사용자의 비정상적 입력 등 에러의 원인은 무한하다. 중요한 것은 **에러가 발생했을 때 앱이 어떻게 대응하는가**이다.

```
에러 처리가 없으면:
  · 하나의 컴포넌트 에러로 전체 앱이 하얀 화면(White Screen)이 된다
  · 사용자에게 아무런 피드백이 없다
  · 에러 원인을 추적하기 어렵다
  · 사용자가 앱을 신뢰하지 않게 된다

에러 처리가 잘 되어 있으면:
  · 에러가 발생한 부분만 Fallback UI를 보여준다
  · 나머지 앱은 정상 동작한다
  · 사용자에게 "무엇이 잘못되었고, 어떻게 해야 하는지" 안내한다
  · 에러 정보가 모니터링 시스템에 기록된다
```

### 1.5 React에서 에러가 발생하는 3가지 영역

![React 에러의 3가지 영역](/developer-open-book/diagrams/react-step17-three-areas.svg)

### 1.6 이 Step에서 다루는 범위

![Step 17 다루는 범위](/developer-open-book/diagrams/react-step17-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                         | 정의                                                                                                   | 왜 중요한가                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Error Boundary**           | 자식 트리의 **렌더링 에러를 잡아** Fallback UI를 표시하는 React 컴포넌트. class 컴포넌트로만 구현 가능 | 에러로 인한 전체 앱 크래시를 방지하는 유일한 React 내장 메커니즘이다 |
| **Fallback UI**              | 에러 발생 시 원래 UI 대신 표시하는 **대체 화면**. "문제가 발생했습니다" 같은 안내                      | 사용자에게 에러 상황을 알리고 다음 행동을 안내한다                   |
| **getDerivedStateFromError** | 에러가 발생했을 때 **Fallback 렌더링을 위한 State를 업데이트**하는 정적 메서드                         | Render Phase에서 동작하여 Fallback UI를 즉시 표시한다                |
| **componentDidCatch**        | 에러가 발생한 후 **부수 효과(로깅 등)를 실행**하는 생명주기 메서드                                     | Commit Phase에서 동작하여 에러 보고에 사용한다                       |
| **에러 경계(Boundary)**      | Error Boundary가 에러의 **영향 범위를 제한**하는 개념. 경계 안의 에러는 경계 밖으로 전파되지 않는다    | 하나의 에러가 앱 전체를 무너뜨리지 않게 한다                         |
| **에러 복구(Recovery)**      | 에러 발생 후 **정상 상태로 되돌리는** 메커니즘. key 리셋, 재시도 등                                    | 사용자가 에러에서 빠져나올 수 있는 경로를 제공한다                   |
| **Graceful Degradation**     | 일부 기능에 문제가 생겨도 **핵심 기능은 계속 동작**하도록 설계하는 원칙                                | 에러의 폭발 반경(Blast Radius)을 최소화한다                          |

### 2.2 에러 처리 계층 개요

![에러 처리의 계층 구조](/developer-open-book/diagrams/react-step17-hierarchy.svg)

### 2.3 에러 유형과 처리 도구 매핑

에러의 발생 위치에 따라 사용할 수 있는 처리 도구가 다르다. 이 구분을 명확히 이해하는 것이 올바른 에러 처리 아키텍처 설계의 출발점이다.

![에러 유형과 처리 도구 매핑](/developer-open-book/diagrams/react-step17-error-mapping.svg)

---

## 3. 이론과 원리

### 3.1 Error Boundary — 렌더링 에러의 방어벽

#### Error Boundary는 class 컴포넌트로만 구현 가능

```
⚠️ 중요한 제약:
  Error Boundary는 현재(React 19 포함) class 컴포넌트로만 구현할 수 있다.
  함수 컴포넌트에서는 getDerivedStateFromError와 componentDidCatch를
  대체하는 Hook이 아직 제공되지 않는다.

  실무에서는:
    1. 직접 class 컴포넌트를 작성하거나
    2. react-error-boundary 라이브러리를 사용한다 (권장)
```

#### 직접 구현

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Render Phase에서 호출 — Fallback 렌더링을 위한 State 업데이트
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Commit Phase에서 호출 — 부수 효과 (에러 로깅)
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary가 에러를 잡음:", error);
    console.error("컴포넌트 스택:", errorInfo.componentStack);
    // 에러 모니터링 서비스에 보고
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI 표시
      return (
        this.props.fallback ?? (
          <div>
            <h2>문제가 발생했습니다.</h2>
            <p>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              다시 시도
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// 사용
function App() {
  return (
    <ErrorBoundary fallback={<p>앱에 문제가 발생했습니다.</p>}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

```
두 메서드의 역할 구분

  getDerivedStateFromError(error)
  ─────────────────────────────
  · 실행 시점: Render Phase
  · 역할: "에러가 발생했으니 Fallback을 보여주겠다" 결정
  · 반환값: 새 State 객체
  · 부수 효과: 불가 (순수해야 함)
  · 비유: "비상 스위치를 누른다"

  componentDidCatch(error, errorInfo)
  ─────────────────────────────────
  · 실행 시점: Commit Phase
  · 역할: 에러 로깅, 모니터링 서비스 보고 등
  · 반환값: 없음
  · 부수 효과: 가능 (API 호출, 콘솔 출력 등)
  · 비유: "사고 보고서를 작성한다"
```

#### react-error-boundary 라이브러리 (실무 권장)

```jsx
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 에러 모니터링 서비스에 보고
        console.error("에러 발생:", error, errorInfo);
      }}
      onReset={() => {
        // 리셋 시 필요한 정리 작업
        // 예: 캐시 비우기, State 초기화 등
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}
```

```
react-error-boundary의 장점

  · 함수 컴포넌트 기반 Fallback (FallbackComponent)
  · resetErrorBoundary로 에러 복구 내장
  · onError 콜백으로 에러 로깅 간편화
  · onReset 콜백으로 리셋 시 정리 작업
  · resetKeys로 특정 값 변경 시 자동 리셋
  · useErrorBoundary Hook으로 이벤트/비동기 에러도 경계로 전달 가능
```

### 3.2 Error Boundary가 잡는 에러 / 잡지 못하는 에러

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  ✅ Error Boundary가 잡는 에러                               │
│  ──────────────────────────                                  │
│  · 렌더링 중 발생하는 에러 (컴포넌트 함수 본문)              │
│  · 생명주기 메서드의 에러 (class 컴포넌트)                   │
│  · 자식 트리의 constructor 에러                              │
│  · React 19: use()가 reject된 Promise를 throw할 때          │
│                                                               │
│  예시:                                                       │
│    function BuggyComponent() {                               │
│      const items = null;                                     │
│      return <p>{items.length}</p>;  // TypeError! → 잡힘    │
│    }                                                          │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ❌ Error Boundary가 잡지 못하는 에러                        │
│  ────────────────────────────────                            │
│  · 이벤트 핸들러의 에러 (onClick 등)                        │
│  · 비동기 코드의 에러 (setTimeout, Promise, fetch)           │
│  · 서버 사이드 렌더링(SSR)의 에러                           │
│  · Error Boundary 자체의 에러 (자기 자신은 못 잡음)          │
│                                                               │
│  예시:                                                       │
│    function Component() {                                    │
│      const handleClick = () => {                             │
│        throw new Error('클릭 에러');  // Error Boundary 무관! │
│      };                                                      │
│      return <button onClick={handleClick}>클릭</button>;     │
│    }                                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 이벤트 핸들러 에러 처리

이벤트 핸들러의 에러는 Error Boundary가 잡지 못하므로 **try/catch + State**로 직접 처리한다.

```jsx
function DeleteButton({ itemId, onDelete }) {
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setError(null);
    try {
      await deleteItem(itemId);
      onDelete(itemId);
    } catch (err) {
      setError(err.message);
      // 필요하면 모니터링 서비스에 보고
    }
  };

  return (
    <div>
      <button onClick={handleClick}>삭제</button>
      {error && <p className="error">삭제 실패: {error}</p>}
    </div>
  );
}
```

#### react-error-boundary의 useErrorBoundary Hook

```jsx
import { useErrorBoundary } from "react-error-boundary";

function DeleteButton({ itemId }) {
  const { showBoundary } = useErrorBoundary();

  const handleClick = async () => {
    try {
      await deleteItem(itemId);
    } catch (err) {
      // 이벤트 핸들러의 에러를 Error Boundary로 전달!
      showBoundary(err);
    }
  };

  return <button onClick={handleClick}>삭제</button>;
}

// 이제 가장 가까운 ErrorBoundary의 Fallback이 표시된다
```

```
showBoundary의 가치

  · 이벤트 핸들러/비동기 에러를 Error Boundary 시스템에 통합
  · 에러 처리가 일관된 계층 구조를 따른다
  · 컴포넌트마다 error State를 관리하지 않아도 된다
  · Fallback UI와 리셋 로직을 재사용할 수 있다
```

### 3.4 비동기 에러 처리

#### 패턴 1: useEffect + try/catch + State (기존 방식)

```jsx
// Step 11에서 배운 패턴
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return null;
  return <UserCard user={user} />;
}
```

#### 패턴 2: use() + Suspense + Error Boundary (React 19)

```jsx
// React 19: 선언적 에러/로딩 처리
function UserProfilePage({ userId }) {
  return (
    <ErrorBoundary FallbackComponent={UserErrorFallback}>
      <Suspense fallback={<Spinner />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserProfile({ userId }) {
  // use()가 Promise를 "읽는다"
  // pending → Suspense fallback 표시
  // rejected → Error Boundary가 잡음
  // resolved → 데이터 사용
  const user = use(fetchUser(userId));

  return <UserCard user={user} />;
}

function UserErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>사용자 정보를 불러올 수 없습니다: {error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}
```

```
두 패턴 비교

  기존 패턴 (useEffect + try/catch):
    · 컴포넌트 내부에 loading, error, data State 3개
    · try/catch + if/else로 명령적 분기
    · 컴포넌트가 "데이터 패칭 + UI 렌더링" 모두 담당
    · 장점: 세밀한 제어, 익숙한 패턴

  React 19 패턴 (use + Suspense + ErrorBoundary):
    · 컴포넌트는 데이터 사용만 담당
    · 로딩 → <Suspense fallback>이 처리
    · 에러 → <ErrorBoundary>가 처리
    · 장점: 선언적, 관심사 분리, 코드 간결

  핵심 차이:
    기존: 컴포넌트가 에러/로딩을 "직접 관리" (명령적)
    React 19: 컴포넌트 밖에서 "선언적으로 처리" (Suspense/Boundary)
```

### 3.5 계층적 Error Boundary 설계

#### "에러의 폭발 반경(Blast Radius)"을 최소화한다

```
❌ 나쁜 설계: 전역 Error Boundary 하나만

  <ErrorBoundary>          ← 유일한 Error Boundary
    <App>
      <Header />
      <Sidebar />
      <MainContent>
        <ChatWidget />     ← 여기서 에러 발생!
        <Dashboard />
      </MainContent>
    </App>
  </ErrorBoundary>

  결과: 전체 앱이 Fallback UI로 교체됨
  → Header, Sidebar, Dashboard 모두 사라짐!
  → 사용자가 할 수 있는 것: "다시 시도" 뿐


✅ 좋은 설계: 계층적 Error Boundary

  <ErrorBoundary fallback={<AppCrashPage />}>           ← 최후 방어선
    <App>
      <Header />                                         ← 항상 표시
      <Sidebar />                                        ← 항상 표시
      <MainContent>
        <ErrorBoundary fallback={<ChatError />}>         ← 채팅 격리
          <ChatWidget />                                  ← 여기서 에러!
        </ErrorBoundary>
        <ErrorBoundary fallback={<DashboardError />}>    ← 대시보드 격리
          <Dashboard />                                   ← 정상 동작!
        </ErrorBoundary>
      </MainContent>
    </App>
  </ErrorBoundary>

  결과: ChatWidget만 ChatError Fallback 표시
  → Header, Sidebar, Dashboard는 정상 동작!
  → 사용자: 채팅은 안 되지만 다른 기능은 사용 가능
```

#### 실전 계층 설계

```jsx
function App() {
  return (
    // 레벨 1: 전역 — 최후의 방어선
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <Layout>
        {/* 레벨 2: 라우트별 */}
        <ErrorBoundary
          FallbackComponent={PageErrorFallback}
          resetKeys={[location.pathname]} // 라우트 변경 시 자동 리셋
        >
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}

function DashboardPage() {
  return (
    <div className="dashboard">
      {/* 레벨 3: 기능별 — 각 위젯을 독립적으로 격리 */}
      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <Suspense fallback={<WidgetSkeleton />}>
          <RevenueChart />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <Suspense fallback={<WidgetSkeleton />}>
          <UserStats />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <Suspense fallback={<WidgetSkeleton />}>
          <RecentActivity />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

```
계층 설계 원칙

  레벨 1 — 전역 (App 루트):
    · "예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 주세요."
    · 마지막 안전망, 절대 빈 화면이 되지 않도록

  레벨 2 — 페이지/라우트:
    · "이 페이지를 불러올 수 없습니다."
    · 네비게이션은 유지 → 다른 페이지로 이동 가능

  레벨 3 — 기능/위젯:
    · "이 기능을 불러올 수 없습니다. 다시 시도"
    · 나머지 위젯은 정상 동작
    · 가장 세밀한 격리 → 최소한의 영향 범위
```

### 3.6 Error Boundary + Suspense 결합 패턴

#### 선언적 로딩/에러/데이터 처리

```jsx
// 패턴: ErrorBoundary + Suspense로 감싸기
function ProductSection({ productId }) {
  return (
    <ErrorBoundary FallbackComponent={ProductError}>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail productId={productId} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 3가지 상태가 선언적으로 처리된다
// · 로딩 → <Suspense fallback> = <ProductSkeleton />
// · 에러 → <ErrorBoundary FallbackComponent> = <ProductError />
// · 성공 → <ProductDetail /> 정상 렌더링
```

```
ErrorBoundary와 Suspense의 배치 순서

  ✅ ErrorBoundary가 Suspense를 감싸는 것이 일반적

  <ErrorBoundary>        ← 에러를 잡는다 (Suspense의 에러도 잡음)
    <Suspense>           ← 로딩을 처리한다
      <Component />      ← 데이터를 사용한다
    </Suspense>
  </ErrorBoundary>

  이유:
  · Suspense가 "로딩 중"을 처리하는 동안 에러가 발생하면?
  · ErrorBoundary가 Suspense 밖에 있으므로 에러를 잡을 수 있다
  · 반대로 배치하면 Suspense가 에러를 인식하지 못할 수 있다
```

#### 재사용 가능한 래퍼 컴포넌트

```jsx
// AsyncBoundary: ErrorBoundary + Suspense를 결합한 유틸리티
function AsyncBoundary({ children, errorFallback, loadingFallback }) {
  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 사용: 매번 두 컴포넌트를 중첩하지 않아도 된다
function DashboardPage() {
  return (
    <div>
      <AsyncBoundary
        errorFallback={ChartError}
        loadingFallback={<ChartSkeleton />}
      >
        <RevenueChart />
      </AsyncBoundary>

      <AsyncBoundary
        errorFallback={StatsError}
        loadingFallback={<StatsSkeleton />}
      >
        <UserStats />
      </AsyncBoundary>
    </div>
  );
}
```

### 3.7 Fallback UI 설계와 UX 원칙

#### Fallback UI에 포함해야 하는 요소

```
좋은 Fallback UI의 4가지 요소

  1. 무엇이 잘못되었는지 (What happened)
     · "사용자 정보를 불러올 수 없습니다"
     · 기술적 에러 메시지를 사용자 친화적으로 변환

  2. 왜 잘못되었는지 (Why — 선택적)
     · "네트워크 연결을 확인해 주세요"
     · "서버가 일시적으로 응답하지 않습니다"
     · 기술적 세부사항은 축소하거나 숨김

  3. 어떻게 해결하는지 (How to fix)
     · "다시 시도" 버튼
     · "홈으로 돌아가기" 링크
     · "고객 지원 연락처" 안내

  4. 시각적 구분 (Visual distinction)
     · 에러임을 시각적으로 인지할 수 있는 디자인
     · 아이콘, 색상(경고색), 여백 등
     · 나머지 UI와 구분되어야 함
```

#### Fallback UI 수준별 예시

```jsx
// 전역 에러 Fallback — 가장 상세하고 안내가 풍부
function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-page">
      <h1>예상치 못한 오류가 발생했습니다</h1>
      <p>죄송합니다. 잠시 후 다시 시도해 주세요.</p>
      <div className="error-actions">
        <button onClick={resetErrorBoundary}>다시 시도</button>
        <button onClick={() => (window.location.href = "/")}>
          홈으로 이동
        </button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details>
          <summary>에러 상세 (개발용)</summary>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

// 위젯 에러 Fallback — 간결하고 재시도 중심
function WidgetErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="widget-error">
      <p>이 영역을 불러올 수 없습니다</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

// 인라인 에러 — 최소한의 표시
function InlineError({ message }) {
  return <span className="inline-error">{message}</span>;
}
```

```
Fallback UI 설계 원칙

  · 개발 모드에서는 상세한 에러 정보 표시 (디버깅용)
  · 프로덕션에서는 사용자 친화적 메시지만 표시
  · 항상 "다음 행동"을 안내하는 버튼/링크를 포함
  · 에러가 반복되면 다른 접근 방법을 제안
  · 에러 메시지에 기술 용어를 사용하지 않는다
    ❌ "TypeError: Cannot read properties of null"
    ✅ "정보를 불러오는 중 문제가 발생했습니다"
```

### 3.8 에러 복구(Recovery) 전략

#### 전략 1: resetErrorBoundary로 재시도

```jsx
// react-error-boundary의 resetErrorBoundary
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>문제가 발생했습니다</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
      {/* 클릭하면 Error Boundary의 에러 상태가 리셋되고
          자식 컴포넌트가 다시 렌더링된다 */}
    </div>
  );
}
```

#### 전략 2: resetKeys로 자동 리셋

```jsx
// 특정 값이 변경되면 자동으로 에러 상태를 리셋
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  resetKeys={[userId, selectedTab]}
  // userId나 selectedTab이 변경되면 자동으로 에러 리셋 → 자식 다시 렌더링
>
  <UserContent userId={userId} tab={selectedTab} />
</ErrorBoundary>
```

#### 전략 3: key를 변경하여 컴포넌트 리마운트 (Step 7 패턴)

```jsx
function RecoverableWidget() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      FallbackComponent={({ resetErrorBoundary }) => (
        <div>
          <p>위젯에 문제가 발생했습니다</p>
          <button
            onClick={() => {
              setResetKey((k) => k + 1); // key 변경 → 완전 리마운트
              resetErrorBoundary();
            }}
          >
            완전 초기화
          </button>
        </div>
      )}
      resetKeys={[resetKey]}
    >
      <ComplexWidget key={resetKey} />
    </ErrorBoundary>
  );
}
```

### 3.9 에러 처리 전략 통합 가이드

```
에러 유형별 처리 전략 매트릭스

  ┌─────────────────┬───────────────────────┬──────────────────┐
  │  에러 유형       │  처리 도구             │  사용자 경험      │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  렌더링 에러     │  Error Boundary        │  Fallback UI     │
  │  (null 접근 등)  │                        │  + 다시 시도     │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  데이터 패칭 에러 │  try/catch + State     │  에러 메시지     │
  │  (API 실패)      │  또는 use() + Boundary │  + 다시 시도     │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  이벤트 에러     │  try/catch + State     │  인라인 에러 메시지│
  │  (클릭 핸들러)   │  또는 showBoundary     │  + 재시도        │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  폼 검증 에러    │  State (파생 데이터)   │  필드별 에러 표시 │
  │                  │                        │  + 수정 안내     │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  권한 에러       │  조건부 렌더링         │  "권한이 없습니다"│
  │  (403)           │  + 리다이렉트          │  + 로그인 안내   │
  ├─────────────────┼───────────────────────┼──────────────────┤
  │  네트워크 에러   │  Error Boundary        │  "오프라인입니다"│
  │  (오프라인)      │  + useOnlineStatus     │  + 재연결 대기   │
  └─────────────────┴───────────────────────┴──────────────────┘
```

### 3.10 Phase 2 전체 통합 복습

```
Phase 2 (Step 11~17)에서 배운 것

  Step 11: useEffect — 부수 효과를 렌더링과 분리
           · 의존성 배열, Cleanup, 실행 타이밍
           · "useEffect가 필요 없는" 케이스 판별

  Step 12: useRef — DOM 접근 + 렌더링 무관 값 저장
           · Stale Closure 해결
           · forwardRef → React 19 ref Props

  Step 13: useReducer — 복합 State를 명시적 전이로 관리
           · reducer 패턴, FSM
           · "무엇이 일어났는가" 중심의 action 설계

  Step 14: 메모이제이션 — 성능 최적화의 도구와 판단
           · useMemo, useCallback, React.memo
           · "측정 없이 최적화하지 않는다"

  Step 15: 신규 Hooks — Concurrent + React 19 API
           · useTransition, useDeferredValue, useId
           · use(), useActionState, useOptimistic

  Step 16: Custom Hook — 상태 로직의 재사용
           · 관심사 분리, Hook 합성, API 설계
           · "로직 재사용 ≠ State 공유"

  Step 17: Error Handling — 에러의 방어와 복구 (이 Step)
           · Error Boundary, 계층적 설계
           · Suspense + ErrorBoundary 결합
           · Fallback UI와 복구 전략

  Phase 2의 핵심 메시지:
    "순수한 렌더링(Phase 1) 위에
     부수 효과, 최적화, 에러 처리를 체계적으로 설계한다"

  Phase 3부터는 이 기반 위에 라우팅과 데이터 레이어를 구축한다.
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 에러 경계 없이 앱이 크래시되는 시나리오

```jsx
// ❌ Error Boundary 없음 — 하나의 null 접근으로 전체 앱 크래시
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent /> {/* 여기서 에러 발생 → 전체 앱이 하얀 화면! */}
      <Footer />
    </div>
  );
}

function MainContent() {
  const user = null;
  return <p>{user.name}</p>; // TypeError! → 전체 앱 크래시!
}

// ✅ Error Boundary로 격리 — MainContent만 Fallback 표시
function App() {
  return (
    <div>
      <Header /> {/* 정상 표시 */}
      <Sidebar /> {/* 정상 표시 */}
      <ErrorBoundary fallback={<p>콘텐츠를 불러올 수 없습니다</p>}>
        <MainContent /> {/* Fallback 표시 */}
      </ErrorBoundary>
      <Footer /> {/* 정상 표시 */}
    </div>
  );
}
```

### 4.2 사례: 대시보드의 독립적 위젯 에러 격리

```
실제 서비스에서의 에러 격리 사례

  대시보드에 5개의 위젯이 있다:
    · 매출 차트 (API A)
    · 방문자 통계 (API B)
    · 최근 주문 (API C)
    · 알림 목록 (API D)
    · 빠른 작업 (로컬 State)

  API B가 500 에러를 반환하면?

  Error Boundary 없이:
    → 전체 대시보드 크래시 → 5개 위젯 모두 사라짐

  위젯별 Error Boundary:
    → 방문자 통계만 "불러올 수 없습니다 [다시 시도]" 표시
    → 나머지 4개 위젯은 정상 동작
    → 사용자: "통계는 잠시 안 되지만 나머지는 사용 가능"

  이것이 Graceful Degradation이다.
```

### 4.3 사례: 개발 vs 프로덕션 에러 표시 전략

```jsx
function ErrorFallback({ error, resetErrorBoundary }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="error-container">
      <h2>문제가 발생했습니다</h2>

      {isDev ? (
        // 개발 모드: 상세 정보 노출 (디버깅용)
        <>
          <p className="error-message">{error.message}</p>
          <pre className="error-stack">{error.stack}</pre>
          <button onClick={resetErrorBoundary}>다시 시도</button>
        </>
      ) : (
        // 프로덕션: 사용자 친화적 메시지만
        <>
          <p>잠시 후 다시 시도해 주세요.</p>
          <p>문제가 계속되면 고객센터로 연락해 주세요.</p>
          <div className="error-actions">
            <button onClick={resetErrorBoundary}>다시 시도</button>
            <a href="/">홈으로 이동</a>
          </div>
        </>
      )}
    </div>
  );
}
```

### 4.4 사례: 에러 로깅 통합 패턴

실전 앱에서는 에러 발생 시 Sentry, Datadog 같은 모니터링 서비스에 에러를 보고한다. `componentDidCatch`와 `onError` 콜백이 이 역할을 담당한다.

```jsx
// 에러 로깅을 위한 래퍼
function MonitoredErrorBoundary({ children, context = "unknown" }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 모니터링 서비스에 에러 보고 (Sentry 예시)
        // Sentry.captureException(error, {
        //   contexts: {
        //     react: { componentStack: errorInfo.componentStack },
        //     app: { context },
        //   },
        // });

        // 개발 환경에서는 콘솔에 출력
        if (process.env.NODE_ENV === "development") {
          console.group(`[ErrorBoundary] ${context}`);
          console.error("에러:", error);
          console.error("컴포넌트 스택:", errorInfo.componentStack);
          console.groupEnd();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// 사용 시 context를 지정하여 어느 영역에서 에러가 났는지 추적
function DashboardPage() {
  return (
    <div>
      <MonitoredErrorBoundary context="revenue-chart">
        <RevenueChart />
      </MonitoredErrorBoundary>
      <MonitoredErrorBoundary context="user-stats">
        <UserStats />
      </MonitoredErrorBoundary>
    </div>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 계층적 Error Boundary 구현 [Applying]

**목표:** 3단계 계층의 Error Boundary를 설계하고 구현한다.

```
요구사항:
  · 레벨 1: 전역 Error Boundary (App 루트)
    - "예상치 못한 오류" 메시지 + 페이지 새로고침 버튼
  · 레벨 2: 페이지 Error Boundary
    - "이 페이지를 불러올 수 없습니다" + 홈으로 이동 버튼
  · 레벨 3: 위젯 Error Boundary
    - "이 영역을 불러올 수 없습니다" + 다시 시도 버튼

  테스트용 컴포넌트:
    · BuggyWidget: 렌더링 시 50% 확률로 에러를 throw
    · 이 위젯을 3개 배치하여 하나가 에러나도 다른 위젯은 동작하는지 확인
    · "다시 시도" 클릭 시 위젯이 복구되는지 확인
```

---

### 실습 2: 비동기 에러를 Error Boundary로 통합 [Applying · Analyzing]

**목표:** 이벤트 핸들러/비동기 에러를 Error Boundary 시스템에 통합한다.

```
요구사항:
  · react-error-boundary 라이브러리 사용 (또는 직접 구현)
  · 3가지 에러 유형을 모두 처리:
    1. 렌더링 에러: 데이터가 null일 때 속성 접근
    2. 이벤트 에러: "삭제" 버튼 클릭 시 API 실패
    3. 비동기 에러: useEffect에서 데이터 패칭 실패
  · 각 에러가 적절한 Fallback UI를 표시하는지 확인
  · showBoundary를 활용하여 이벤트 에러를 Boundary로 전달

분석할 것:
  · Error Boundary가 잡는 에러와 못 잡는 에러를 직접 확인
  · showBoundary 사용 전/후의 에러 처리 차이
```

---

### 실습 3: AsyncBoundary 재사용 컴포넌트 구현 [Applying · Creating]

**목표:** ErrorBoundary + Suspense를 결합한 재사용 가능 래퍼를 만든다.

```
요구사항:
  · AsyncBoundary 컴포넌트 구현:
    Props: children, errorFallback, loadingFallback, onError, onReset, resetKeys
  · 사용 예시 3가지 작성:
    1. 데이터 패칭 위젯에 적용
    2. 무한 스크롤 리스트에 적용
    3. 여러 위젯을 독립적으로 격리하는 대시보드에 적용
  · 에러 발생 시 자동 리트라이 옵션 (maxRetries, retryDelay)
```

---

### 실습 4 (선택): 에러 처리 아키텍처 설계 [Evaluating]

**목표:** 중규모 애플리케이션의 전체 에러 처리 전략을 설계한다.

```
시나리오: 이커머스 웹 애플리케이션

페이지 구성:
  · 홈 (추천 상품, 배너)
  · 상품 목록 (필터, 정렬, 페이지네이션)
  · 상품 상세 (이미지, 설명, 리뷰)
  · 장바구니 (수량 변경, 삭제, 결제)
  · 결제 (폼 입력, 결제 처리)
  · 마이페이지 (주문 내역, 프로필)

설계할 것:
  1. Error Boundary 계층 구조도 (어디에 몇 개)
  2. 각 계층의 Fallback UI 설계
  3. 에러 유형별 처리 전략 매트릭스
  4. 에러 복구 전략 (어떤 에러에 어떤 복구 방법)
  5. 에러 모니터링 전략 (어떤 정보를 수집하여 어디에 보고)
  6. 결제 페이지의 에러 처리 특수 전략 (돈이 관련된 에러)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 17 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Error Boundary = 렌더링 에러의 방어벽                     │
│     → 자식 트리의 렌더링 에러를 잡아 Fallback UI 표시         │
│     → class 컴포넌트로만 구현 (또는 react-error-boundary)     │
│     → getDerivedStateFromError(Render) + componentDidCatch(Commit) │
│                                                               │
│  2. Error Boundary가 못 잡는 에러가 있다                      │
│     → 이벤트 핸들러, 비동기 코드, SSR, 자기 자신의 에러       │
│     → 이벤트/비동기: try/catch + State 또는 showBoundary     │
│                                                               │
│  3. 계층적 Error Boundary로 "폭발 반경"을 최소화한다          │
│     → 전역 (최후 방어선) > 페이지 > 기능/위젯                │
│     → 하나의 에러가 전체 앱을 크래시하지 않도록               │
│     → Graceful Degradation 구현                              │
│                                                               │
│  4. ErrorBoundary + Suspense = 선언적 에러/로딩 처리          │
│     → ErrorBoundary가 Suspense를 감싸는 것이 일반적          │
│     → AsyncBoundary 래퍼로 재사용성 확보                     │
│     → React 19의 use() + Suspense와 자연스럽게 결합          │
│                                                               │
│  5. Fallback UI의 4요소: 무엇/왜/어떻게/시각적 구분           │
│     → 사용자에게 "다음 행동"을 항상 안내                     │
│     → 개발 모드: 상세 에러 정보 / 프로덕션: 친화적 메시지     │
│                                                               │
│  6. 에러 복구 전략                                            │
│     → resetErrorBoundary: 에러 상태 리셋 + 재렌더링          │
│     → resetKeys: 특정 값 변경 시 자동 리셋                   │
│     → key 변경: 컴포넌트 완전 리마운트 (Step 7)              │
│                                                               │
│  7. 에러 유형별 처리 도구를 구분한다                           │
│     → 렌더링 에러: Error Boundary                            │
│     → 이벤트/비동기 에러: try/catch + State (또는 showBoundary)│
│     → 폼 검증 에러: 파생 데이터                              │
│     → 네트워크 에러: Error Boundary + 온라인 상태 감지        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                          | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Error Boundary가 class 컴포넌트로만 구현 가능한 이유는?                                       | Remember   | 3.1         |
| 2   | getDerivedStateFromError와 componentDidCatch의 실행 Phase와 역할 차이는?                      | Understand | 3.1         |
| 3   | onClick 핸들러에서 throw된 에러를 Error Boundary가 잡지 못하는 이유는?                        | Understand | 3.2         |
| 4   | ErrorBoundary가 Suspense를 감싸야 하는 이유는? (반대 배치의 문제)                             | Understand | 3.6         |
| 5   | showBoundary(err)가 해결하는 문제는 무엇인가?                                                 | Apply      | 3.3         |
| 6   | 대시보드의 5개 위젯 중 1개에 에러가 발생했을 때, 나머지가 정상 동작하려면 어떻게 설계하는가?  | Analyze    | 3.5         |
| 7   | 전역/페이지/위젯 3단계 Error Boundary 각각의 Fallback UI가 달라야 하는 이유는?                | Evaluate   | 3.5, 3.7    |
| 8   | 결제 처리 중 에러가 발생했을 때의 에러 복구 전략은 일반적인 위젯 에러와 어떻게 달라야 하는가? | Evaluate   | 3.8         |

### 6.3 FAQ

**Q1. Error Boundary를 모든 컴포넌트에 감싸야 하는가?**

그렇지 않다. Error Boundary를 과도하게 배치하면 에러가 어느 경계에서 잡혔는지 파악하기 어렵고, 코드도 복잡해진다. 일반적인 권장 패턴은 전역(App 루트), 라우트, 기능 단위 위젯의 3단계다. 리프 컴포넌트마다 감싸는 것은 불필요하다.

**Q2. React 19에서 함수형 Error Boundary Hook이 추가될 예정인가?**

React 팀이 함수형 Error Boundary를 위한 Hook을 개발 중이라는 논의가 있지만, React 19 기준으로는 아직 공식 지원되지 않는다. 현재 실무에서는 react-error-boundary 라이브러리의 `ErrorBoundary` 컴포넌트와 `useErrorBoundary` Hook 조합이 사실상 표준이다.

**Q3. 에러 로깅은 어느 시점에 해야 하는가?**

`componentDidCatch` 또는 react-error-boundary의 `onError` 콜백에서 처리한다. 이 시점은 Commit Phase이므로 부수 효과(API 호출 등)가 허용된다. `getDerivedStateFromError`는 Render Phase이므로 부수 효과를 실행하면 안 된다.

**Q4. Error Boundary와 React.StrictMode의 관계는?**

개발 모드에서 React.StrictMode는 컴포넌트를 두 번 렌더링하여 부수 효과를 감지한다. 이 과정에서 `getDerivedStateFromError`도 두 번 호출될 수 있다. 프로덕션에서는 한 번만 호출되므로 동작 차이에 주의해야 한다.

**Q5. 네트워크 에러와 렌더링 에러를 동일한 Error Boundary로 처리해야 하는가?**

경우에 따라 다르다. 같은 위젯 영역에서 발생한 에러라면 동일한 Boundary로 처리하는 것이 자연스럽다. 단, 네트워크 에러는 재시도가 의미 있지만, 렌더링 에러(코드 버그)는 재시도해도 같은 에러가 반복된다. Fallback UI 설계 시 에러 유형에 따라 다른 안내 메시지를 표시하는 것이 좋다.

---

## 7. 다음 단계 예고

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
>
> **Step 18. React Router v6+ 심화**
>
> - 클라이언트 사이드 라우팅의 원리 (History API)
> - Nested Routes와 Layout Route
> - Data Router: loader / action
> - 동적 라우트, 보호된 라우트
> - 프로그래밍 방식 네비게이션
>
> Phase 2에서 쌓은 Hook과 에러 처리 기반 위에,
> 이제 **멀티 페이지 앱의 구조**를 설계한다.

---

## 📚 참고 자료

- [React 공식 문서 — Catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React 공식 문서 — getDerivedStateFromError](https://react.dev/reference/react/Component#static-getderivedstatefromerror)
- [React 공식 문서 — componentDidCatch](https://react.dev/reference/react/Component#componentdidcatch)
- [react-error-boundary GitHub](https://github.com/bvaughn/react-error-boundary)
- [React 공식 문서 — Suspense](https://react.dev/reference/react/Suspense)
- [React 공식 문서 — use()](https://react.dev/reference/react/use)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 17 of 42 | **Phase 2 완료**
