# Step 30. Suspense 아키텍처와 고급 패턴

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다 — **Phase 4 마무리**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Remember**   | Suspense의 동작 메커니즘(suspend → fallback → resume)을 기술할 수 있다                          |
| **Understand** | Suspense가 "선언적 로딩 처리"를 가능하게 하는 원리를 설명할 수 있다                             |
| **Understand** | Suspense + ErrorBoundary + use()가 결합하여 만드는 선언적 데이터 패칭 아키텍처를 설명할 수 있다 |
| **Apply**      | Suspense 경계를 전략적으로 배치하여 로딩 UX를 설계할 수 있다                                    |
| **Analyze**    | Suspense 경계의 위치가 사용자 경험에 미치는 영향을 분석할 수 있다                               |
| **Evaluate**   | Phase 4 전체를 통합하여 "상태 관리 + 아키텍처 + 성능"의 종합적 설계를 판단할 수 있다            |

**전제 지식:**

- Step 10: Concurrent Rendering, Streaming
- Step 15: use() Hook, React 19 Hooks
- Step 17: Error Boundary, AsyncBoundary
- Step 19: Streaming SSR, Selective Hydration
- Step 29: React.lazy + Suspense (코드 분할)

---

## 1. 서론 — Suspense는 "코드 분할 도구"가 아니다

### 1.1 비동기 UI 처리의 역사적 진화

웹 애플리케이션에서 비동기 처리는 언제나 핵심 과제였다. 초창기 jQuery 시대에는 콜백 함수가 중첩되며 이른바 "콜백 지옥"을 만들었고, 개발자들은 로딩 상태를 수동으로 DOM 조작을 통해 표현했다. 스피너를 보여주고 숨기는 명령형 코드가 곳곳에 흩어져 있었다.

React의 등장으로 선언적 렌더링이 가능해졌지만, 비동기 처리만큼은 여전히 명령적이었다. `useState`로 `isLoading`, `error`, `data`를 각각 관리하고, 조건부 렌더링으로 상태를 표현하는 패턴이 수년간 표준으로 사용되었다. 이 방식은 기능적으로는 작동하지만 관심사 분리가 이루어지지 않는다는 근본적인 한계를 지닌다. 데이터를 가져오는 로직, 로딩을 표현하는 로직, 에러를 처리하는 로직, 그리고 실제 UI를 그리는 로직이 하나의 컴포넌트 안에 뒤섞이는 것이다.

React 16.6(2018)에서 `React.lazy`와 함께 처음 소개된 Suspense는 이 문제를 해결하기 위한 첫 번째 발걸음이었다. 코드 분할에만 적용되는 제한적 기능이었지만, 그 안에는 훨씬 더 큰 비전이 담겨 있었다. React 18(2022)에서 Concurrent Features와 Streaming SSR이 도입되고, React 19에서 `use()` Hook이 정식 안정화되면서 Suspense는 드디어 그 완전한 역할을 발휘하기 시작했다.

### 1.2 Suspense에 대한 흔한 오해

대부분의 개발자가 Suspense를 "React.lazy의 로딩 표시기" 정도로 이해한다. 그러나 Suspense는 React의 **렌더링 아키텍처를 근본적으로 변경하는 도구**이다.


![Suspense의 진짜 역할](/developer-open-book/diagrams/react-step30-suspense의-진짜-역할.svg)


### 1.3 Suspense가 여는 산업적 가치

프로덕션 환경에서 Suspense 아키텍처는 단순한 코드 품질 개선을 넘어 측정 가능한 비즈니스 가치를 만들어 낸다.

첫째, **개발 생산성** 측면에서 로딩/에러/성공 세 가지 상태를 각 컴포넌트마다 수동으로 관리하던 보일러플레이트 코드가 사라진다. 100개의 데이터 패칭 컴포넌트가 있다면 300줄에 달하던 상태 관리 코드가 Suspense 경계 선언 몇 줄로 대체된다.

둘째, **사용자 경험(UX)** 측면에서 Skeleton UI와 점진적 로딩 패턴은 체감 로딩 속도를 20~30% 개선한다는 연구 결과가 있다. 특히 모바일 환경에서 네트워크가 느릴 때 콘텐츠가 순차적으로 채워지는 경험은 사용자 이탈률을 유의미하게 낮춘다.

셋째, **아키텍처 일관성** 측면에서 팀 전체가 동일한 비동기 처리 패턴을 공유하게 되어 코드 리뷰 부담이 줄고 신규 팀원 온보딩이 빨라진다.

### 1.4 개념 지도


![Suspense 아키텍처 개념 지도](/developer-open-book/diagrams/react-step30-suspense-아키텍처-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step30-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                      | 정의                                                                                  | 왜 중요한가                                               |
| ------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Suspense**              | 자식 컴포넌트가 "준비되지 않았을 때" **fallback UI를 선언적으로 표시**하는 컴포넌트   | 명령적 isLoading 대신 선언적 로딩 처리를 가능하게 한다    |
| **Suspend**               | 컴포넌트가 **아직 준비되지 않았음**을 React에 알리는 행위. 내부적으로 Promise를 throw | Suspense가 이를 잡아(catch) fallback을 표시한다           |
| **Resume**                | suspend된 컴포넌트가 **준비 완료**되어 다시 렌더링되는 것                             | Promise가 resolve되면 React가 컴포넌트를 재렌더링한다     |
| **Suspense Boundary**     | `<Suspense>` 컴포넌트가 정의하는 **로딩 처리의 경계**. 이 경계 안의 suspend를 잡는다  | 경계의 위치가 UX를 결정한다 (한 페이지 전체 vs 개별 위젯) |
| **선언적 로딩**           | "로딩 중이면 이것을 보여줘"를 **JSX로 선언**하는 방식. 명령적 `if (isLoading)` 대신   | 로딩 처리 코드가 데이터 사용 코드와 분리된다              |
| **Waterfall vs Parallel** | 직렬 로딩 vs 병렬 로딩. **Suspense 경계를 어떻게 배치하느냐**에 따라 결정             | 경계 설계가 성능에 직접 영향                              |
| **Skeleton UI**           | 콘텐츠의 **레이아웃을 미리 보여주는** 로딩 UI. 스피너보다 나은 UX                     | CLS 방지 + 체감 로딩 속도 향상                            |

### 2.2 "Suspend"라는 개념이 의미하는 것

"Suspend"는 프로그래밍에서 일시정지(pause)를 의미한다. React에서 컴포넌트가 suspend된다는 것은 "나는 아직 렌더링할 준비가 되지 않았으니, 준비가 되면 다시 시도해 달라"는 신호를 보내는 것이다.

이 개념은 함수형 프로그래밍의 **대수적 효과(Algebraic Effects)** 이론에서 영감을 받았다. 대수적 효과는 연산의 부작용을 연산 자체와 분리하여 처리할 수 있게 해주는 이론적 기반이다. React의 Suspense는 "비동기 기다림"이라는 효과를 컴포넌트 안에 위치시키되, 그 효과의 처리(fallback 표시)는 바깥의 Suspense 경계에 위임하는 구조다.

이 분리 덕분에 컴포넌트는 "데이터가 있다는 가정"하에 작성할 수 있고, 로딩 처리라는 관심사는 전적으로 Suspense에 위임된다. 코드가 단순해지는 것은 물론, 로딩 UI 전략을 컴포넌트 구현을 건드리지 않고 외부에서 변경할 수 있다는 강력한 유연성이 생긴다.

### 2.3 명령적 vs 선언적 로딩 처리

두 방식의 차이는 "관심사를 누가 책임지는가"의 차이다. 명령적 방식에서는 컴포넌트가 모든 것을 책임진다. 선언적 방식에서는 각 관심사가 전문화된 도구에게 위임된다.


![명령적 (Step 22에서 학습한 방식):](/developer-open-book/diagrams/react-step30-명령적-step-22에서-학습한-방식.svg)


### 2.4 Suspense 경계의 개념적 위상

Suspense 경계는 단순한 "로딩 래퍼 컴포넌트"가 아니다. 아키텍처 수준에서 경계는 다음 세 가지 의미를 동시에 가진다.

**렌더링 경계**: 경계 안쪽이 suspend되어도 경계 바깥은 정상 렌더링된다. 부분적 로딩 상태가 전체 UI에 영향을 미치지 않는다.

**스트리밍 경계**: Streaming SSR에서 각 Suspense 경계는 독립적인 HTML 청크 단위가 된다. 서버는 경계 단위로 준비된 콘텐츠를 클라이언트에 순차 전송할 수 있다.

**하이드레이션 경계**: Selective Hydration에서 각 Suspense 경계는 독립적으로 인터랙티브해진다. 한 영역이 아직 하이드레이션 중이어도 다른 영역은 이미 클릭에 반응할 수 있다.

이처럼 Suspense 경계의 위치를 설계하는 것은 단순히 "어디서 스피너를 보여줄까"가 아니라, 렌더링 성능, 스트리밍 전략, 하이드레이션 우선순위를 동시에 결정하는 아키텍처 수준의 작업이다.

---

## 3. 이론과 원리

### 3.1 Suspense의 내부 동작 메커니즘

#### "throw Promise" — Suspense가 동작하는 원리

React에서 컴포넌트가 suspend되는 메커니즘의 핵심은 **Promise를 throw하는 것**이다. JavaScript의 throw는 보통 Error 객체에 사용되지만, React는 이 메커니즘을 Promise에도 적용했다. Suspense 컴포넌트는 ErrorBoundary와 유사하게 내부 컴포넌트에서 throw된 값을 포착한다. throw된 값이 Promise이면 로딩 처리를, Error이면 에러 처리를 담당한다.

이 설계는 기존 try-catch 메커니즘을 재활용하면서도 비동기 처리를 동기 코드처럼 표현할 수 있게 해주는 창의적인 해결책이다.


![Suspense의 내부 (개념적 설명)](/developer-open-book/diagrams/react-step30-suspense의-내부-개념적-설명.svg)


#### React.lazy의 내부 (Suspense 관점)


![React.lazy가 Suspense와 결합하는 원리](/developer-open-book/diagrams/react-step30-react-lazy가-suspense와-결합하는-원리.svg)


### 3.2 선언적 데이터 패칭: use() + Suspense + ErrorBoundary

#### 완전한 선언적 패턴

`use()` Hook은 React 19에서 정식 안정화된 Hook으로, Promise를 인자로 받아 그 resolve 값을 동기적으로 반환하는 것처럼 동작한다. 내부적으로는 Promise가 pending이면 throw하고, resolved이면 값을 반환한다. 이를 통해 컴포넌트는 비동기 데이터를 마치 이미 존재하는 것처럼 사용할 수 있다.

```jsx
import { use, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// 데이터 패칭 함수 (캐시 포함)
const cache = new Map();

function fetchUser(userId) {
  if (!cache.has(userId)) {
    cache.set(
      userId,
      fetch(`/api/users/${userId}`).then((r) => {
        if (!r.ok) throw new Error(`User ${userId} not found`);
        return r.json();
      }),
    );
  }
  return cache.get(userId);
}

function fetchUserPosts(userId) {
  const key = `posts-${userId}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/api/users/${userId}/posts`).then((r) => r.json()),
    );
  }
  return cache.get(key);
}

// 페이지 레벨: Suspense + ErrorBoundary 배치
function UserPage({ userId }) {
  return (
    <ErrorBoundary FallbackComponent={UserPageError}>
      <Suspense fallback={<UserPageSkeleton />}>
        <UserContent userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 컴포넌트: 데이터 사용에만 집중
function UserContent({ userId }) {
  const user = use(fetchUser(userId));
  // use()가 Promise를 만나면 suspend → Suspense fallback 표시
  // resolve되면 이 줄부터 실행 재개 → user에 데이터가 들어있음

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>

      {/* 중첩 Suspense: 게시글은 독립적으로 로딩 */}
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}

function UserPosts({ userId }) {
  const posts = use(fetchUserPosts(userId));
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```


![이 패턴의 핵심 가치](/developer-open-book/diagrams/react-step30-이-패턴의-핵심-가치.svg)


### 3.3 Suspense 경계 배치 전략

#### 경계의 위치가 UX를 결정한다

경계 배치는 UX 차원에서 "사용자가 어떤 순서로 무엇을 보게 되는가"를 결정하고, 성능 차원에서 "어떤 데이터 요청이 다른 요청을 차단하는가"를 결정한다. 동일한 컴포넌트와 동일한 API라도 Suspense 경계 위치만 다르면 전혀 다른 사용자 경험을 만든다.


![같은 페이지, 다른 Suspense 경계 → 완전히 다른 사용자 경험](/developer-open-book/diagrams/react-step30-같은-페이지-다른-suspense-경계-완전히-다른-사용자-경험.svg)


#### 경계 배치 결정 기준


![Suspense 경계를 어디에 둘 것인가?](/developer-open-book/diagrams/react-step30-suspense-경계를-어디에-둘-것인가.svg)


### 3.4 Streaming SSR과 Suspense의 결합

Streaming SSR은 Step 19에서 학습했지만, 그 실체가 Suspense 경계임을 이 Step에서 명확히 한다. 전통적인 SSR은 서버가 전체 HTML을 완성한 후 한 번에 전송한다. 느린 데이터 하나가 전체 페이지 전송을 차단한다. Streaming SSR + Suspense는 이 병목을 경계 단위로 분산시킨다.


![Step 19에서 배운 Streaming SSR의 실체가 바로 Suspense이다](/developer-open-book/diagrams/react-step30-step-19에서-배운-streaming-ssr의-실체가-바로-suspe.svg)


### 3.5 Skeleton UI 설계 패턴

Skeleton UI는 단순한 "로딩 중" 표시기가 아니라, 사용자에게 "이 공간에 곧 콘텐츠가 나타날 것"이라는 기대를 심어주는 UX 도구다. 잘 설계된 Skeleton은 실제 콘텐츠와 레이아웃이 일치하여 콘텐츠 교체 시 레이아웃 이동(CLS)이 발생하지 않는다. CLS는 Core Web Vitals의 핵심 지표 중 하나로, 사용자가 읽던 내용이 갑자기 위치가 바뀌는 불쾌한 경험을 측정한다.

```
Skeleton UI의 목적:
  · "콘텐츠가 곧 나타날 것이다"는 기대감 전달
  · 레이아웃을 미리 확보하여 CLS 방지
  · 스피너보다 체감 로딩 시간 20~30% 감소 (연구 결과)


좋은 Skeleton:
  · 실제 콘텐츠의 레이아웃과 유사하다
  · 텍스트 줄, 이미지 영역, 버튼 위치가 예측 가능하다
  · 부드러운 애니메이션(shimmer)으로 "로딩 중" 신호
  · 실제 콘텐츠로 교체 시 레이아웃 변화가 없다 (CLS = 0)

나쁜 Skeleton:
  · 실제 콘텐츠와 레이아웃이 크게 다르다 (교체 시 혼란)
  · 너무 복잡하여 Skeleton 자체가 무겁다
  · 단순한 스피너만 표시 (레이아웃 예측 불가)
```

```jsx
// Skeleton 컴포넌트 예시
function UserCardSkeleton() {
  return (
    <div className="user-card skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-text-lg" />
      <div className="skeleton-text-sm" />
      <div className="skeleton-text-sm w-60" />
    </div>
  );
}

// CSS (참고):
// .skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
// .skeleton-text-lg { width: 200px; height: 20px; }
// .skeleton-text-sm { width: 150px; height: 14px; }
// shimmer 애니메이션: background-size: 200%; animation: shimmer 1.5s infinite;

// 사용
<Suspense fallback={<UserCardSkeleton />}>
  <UserCard userId={42} />
</Suspense>;
```

### 3.6 TanStack Query와 Suspense 모드

```jsx
// TanStack Query에서 Suspense 활성화
import { useSuspenseQuery } from "@tanstack/react-query";

function UserProfile({ userId }) {
  // useSuspenseQuery는 로딩 중에 suspend한다
  // → isLoading 체크가 불필요! data가 항상 존재!
  const { data: user } = useSuspenseQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

  // 여기에 도달하면 user가 항상 존재한다
  return <h1>{user.name}</h1>;
}

// 사용
function UserPage({ userId }) {
  return (
    <ErrorBoundary FallbackComponent={UserError}>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```


![useSuspenseQuery vs useQuery](/developer-open-book/diagrams/react-step30-usesuspensequery-vs-usequery.svg)


### 3.7 AsyncBoundary 패턴 — Suspense + ErrorBoundary 통합

```jsx
// Step 17에서 소개한 AsyncBoundary의 완성형

function AsyncBoundary({
  children,
  pendingFallback,
  rejectedFallback,
  onError,
  onReset,
  resetKeys,
}) {
  return (
    <ErrorBoundary
      FallbackComponent={rejectedFallback}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 사용: 매번 두 컴포넌트를 중첩하지 않아도 된다
function DashboardPage() {
  return (
    <div className="dashboard">
      <AsyncBoundary
        pendingFallback={<ChartSkeleton />}
        rejectedFallback={WidgetError}
      >
        <RevenueChart />
      </AsyncBoundary>

      <AsyncBoundary
        pendingFallback={<StatsSkeleton />}
        rejectedFallback={WidgetError}
      >
        <UserStats />
      </AsyncBoundary>

      <AsyncBoundary
        pendingFallback={<ActivitySkeleton />}
        rejectedFallback={WidgetError}
      >
        <RecentActivity />
      </AsyncBoundary>
    </div>
  );
}
// 각 위젯이 독립적으로 로딩/에러/성공 → Graceful Degradation
```

### 3.8 명령적 → 선언적 전환의 의미

Suspense가 완성하는 선언적 전환은 React가 처음 등장한 이후 지속적으로 추진해온 방향의 마지막 퍼즐 조각이다. React는 항상 "어떻게(How)"를 프레임워크에 위임하고 개발자는 "무엇을(What)"에 집중하도록 설계되어 왔다. DOM 조작, 상태 동기화, 라우팅, 에러 처리를 차례로 선언적으로 만들어 온 React가 이제 비동기 로딩이라는 마지막 영역도 선언적으로 완성한 것이다.


![React의 패러다임 전환 역사](/developer-open-book/diagrams/react-step30-react의-패러다임-전환-역사.svg)


### 3.9 Phase 4 전체 통합 복습


![Phase 4 (Step 25~30)에서 배운 것](/developer-open-book/diagrams/react-step30-phase-4-step-25-30-에서-배운-것.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: 대시보드의 Suspense 경계 설계

이 사례는 실무에서 가장 자주 마주치는 시나리오 중 하나다. 대시보드는 독립적인 데이터 소스를 가진 여러 위젯으로 구성되며, 각 위젯의 응답 시간이 제각각이다. Suspense 경계 설계에 따라 사용자가 첫 콘텐츠를 보게 되는 시점이 크게 달라진다.


![대시보드에 4개의 독립적 위젯이 있다](/developer-open-book/diagrams/react-step30-대시보드에-4개의-독립적-위젯이-있다.svg)


### 4.2 사례: 명령적에서 선언적으로의 리팩토링

이 리팩토링 사례는 코드량의 차이를 극명하게 보여준다. 특히 주목할 것은 단순히 코드가 짧아지는 것이 아니라, 각 코드 단위의 역할이 명확해진다는 점이다. Before 코드에서 `UserProfilePage`는 데이터 패칭, 로딩 상태, 에러 상태, UI 렌더링 네 가지를 동시에 담당한다. After 코드에서 각 컴포넌트는 단 하나의 책임만 가진다.

```jsx
// ❌ Before: 명령적 패턴 (Step 22 스타일)
function UserProfilePage({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then((data) => {
        setUser(data);
        setIsUserLoading(false);
      })
      .catch((err) => {
        setUserError(err);
        setIsUserLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    fetchPosts(userId)
      .then((data) => {
        setPosts(data);
        setIsPostsLoading(false);
      })
      .catch((err) => {
        setPostsError(err);
        setIsPostsLoading(false);
      });
  }, [userId]);

  if (isUserLoading) return <Spinner />;
  if (userError) return <ErrorMessage error={userError} />;

  return (
    <div>
      <h1>{user.name}</h1>
      {isPostsLoading ? (
        <Spinner />
      ) : postsError ? (
        <ErrorMessage />
      ) : (
        <ul>
          {posts.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
// 코드: ~35줄, State 6개, useEffect 2개, 조건부 렌더링 6개

// ✅ After: 선언적 패턴 (Suspense)
function UserProfilePage({ userId }) {
  return (
    <AsyncBoundary
      pendingFallback={<UserSkeleton />}
      rejectedFallback={UserError}
    >
      <UserProfile userId={userId} />
      <AsyncBoundary
        pendingFallback={<PostsSkeleton />}
        rejectedFallback={PostsError}
      >
        <UserPosts userId={userId} />
      </AsyncBoundary>
    </AsyncBoundary>
  );
}

function UserProfile({ userId }) {
  const user = use(fetchUser(userId));
  return <h1>{user.name}</h1>;
}

function UserPosts({ userId }) {
  const posts = use(fetchUserPosts(userId));
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
// 코드: ~20줄, State 0개, useEffect 0개, 조건부 렌더링 0개
```

### 4.3 사례: Next.js App Router에서의 자연스러운 Suspense

Next.js App Router는 Suspense 아키텍처를 파일 시스템 규약으로 추상화한 훌륭한 사례다. 개발자가 Suspense를 직접 작성하지 않아도 특정 파일을 생성하면 프레임워크가 자동으로 Suspense와 ErrorBoundary를 구성한다. 이것이 Step 21에서 배운 "특수 파일 규약"의 실체다.


![Next.js App Router에서 Suspense는 파일 규약으로 자동 적용됨](/developer-open-book/diagrams/react-step30-next-js-app-router에서-suspense는-파일-규약으로-자.svg)


---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Suspense 경계 배치 실험 [Applying · Analyzing]

**목표:** 경계 위치가 UX에 미치는 영향을 직접 관찰한다.


![요구사항:](/developer-open-book/diagrams/react-step30-요구사항.svg)


---

### 실습 2: 선언적 데이터 패칭 구현 [Applying]

**목표:** use() + Suspense + ErrorBoundary로 명령적 코드를 선언적으로 변환한다.


![과제:](/developer-open-book/diagrams/react-step30-과제.svg)


---

### 실습 3: Skeleton UI 설계 [Applying · Creating]

**목표:** 실제 콘텐츠와 일치하는 Skeleton UI를 설계한다.


![요구사항:](/developer-open-book/diagrams/react-step30-요구사항-18.svg)


---

### 실습 4 (선택): Streaming SSR 시뮬레이션 [Analyzing]

**목표:** Suspense 경계가 Streaming SSR의 청크 단위가 되는 것을 이해한다.


![과제 (개념적 분석):](/developer-open-book/diagrams/react-step30-과제-개념적-분석.svg)


---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 30 핵심 요약](/developer-open-book/diagrams/react-step30-step-30-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                              | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Suspense의 내부 동작을 "throw Promise"와 "catch" 관점에서 설명하라                | Remember   | 3.1         |
| 2   | 명령적 로딩 처리(if isLoading)와 선언적(Suspense)의 "관심사 분리" 차이를 설명하라 | Understand | 2.2, 3.2    |
| 3   | Suspense 경계를 "페이지 전체 하나"로 설정할 때와 "위젯별 분리"할 때의 UX 차이는?  | Analyze    | 3.3         |
| 4   | Streaming SSR에서 Suspense 경계가 "청크 단위"가 되는 원리는?                      | Understand | 3.4         |
| 5   | useSuspenseQuery가 useQuery보다 조건부 렌더링을 줄이는 이유는?                    | Apply      | 3.6         |
| 6   | Skeleton UI가 스피너보다 CLS에 유리한 이유는?                                     | Analyze    | 3.5         |
| 7   | AsyncBoundary 패턴이 대시보드의 Graceful Degradation을 구현하는 방식은?           | Apply      | 3.7         |
| 8   | "if (isLoading) → Suspense fallback"의 전환이 React의 어떤 철학과 일관되는가?     | Evaluate   | 3.8         |

### 6.3 FAQ

**Q1. `use()` Hook은 `useEffect` + `useState` 조합과 무엇이 다른가요?**

`useEffect` + `useState` 조합은 컴포넌트가 먼저 렌더링된 후 마운트 시점에 데이터를 가져오는 방식이다. 초기 렌더링에서 항상 로딩 상태를 거치며, 데이터가 도착하면 재렌더링이 발생한다. 반면 `use(Promise)`는 Suspense와 결합하여 컴포넌트가 렌더링을 시작하는 시점에 데이터 준비를 확인한다. 데이터가 없으면 컴포넌트 렌더링 자체가 일시정지되고 Suspense가 대신 fallback을 보여준다. `use()`는 "로딩 상태를 컴포넌트 밖으로 꺼내는" 방식이다.

**Q2. Suspense 경계를 너무 많이 만들면 문제가 생기지 않나요?**

경계가 많아질수록 각 경계마다 별도의 fallback UI가 필요하다. 경계가 과도하게 세분화되면 여러 영역이 거의 동시에 스켈레톤에서 실제 콘텐츠로 전환되며 화면이 "깜빡"이는 느낌을 줄 수 있다. React는 이를 위해 `startTransition`을 사용하거나 의도적으로 경계를 합치는 방법을 권장한다. 실무에서는 "이 섹션이 독립적으로 로딩되는 것이 사용자에게 의미 있는가"를 기준으로 경계 수를 결정한다.

**Q3. 기존 코드베이스에 Suspense를 점진적으로 도입할 수 있나요?**

가능하다. Suspense는 기존 명령적 패턴과 공존할 수 있다. TanStack Query의 경우 `useQuery`와 `useSuspenseQuery`를 동일 앱에서 혼용할 수 있다. 권장 전략은 신규 페이지나 컴포넌트부터 Suspense 패턴을 적용하고, 기존 컴포넌트는 리팩토링 일정에 맞춰 순차 전환하는 것이다.

**Q4. ErrorBoundary는 항상 Suspense 바깥에 있어야 하나요?**

일반적으로 `ErrorBoundary`를 `Suspense` 바깥에 두는 것이 권장된다. Promise reject 시 에러가 Suspense를 통과하여 바깥의 ErrorBoundary에 도달하기 때문이다. AsyncBoundary 패턴처럼 ErrorBoundary가 바깥, Suspense가 안쪽 순서로 중첩하면 에러와 로딩 모두를 자연스럽게 처리할 수 있다.

**Q5. React 18 이전 버전에서도 Suspense 데이터 패칭을 사용할 수 있나요?**

`use()` Hook은 React 19에서 안정화되었으므로 React 18에서는 직접 사용할 수 없다. 그러나 TanStack Query의 `useSuspenseQuery`나 Relay 같은 라이브러리를 통해 React 16.6 이후부터 Suspense 기반 데이터 패칭을 구현할 수 있다. 이 라이브러리들은 내부적으로 Promise throw 메커니즘을 직접 구현한다.

---

## 7. 다음 단계 예고

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
>
> **Step 31. TypeScript와 React 통합**
>
> - TypeScript가 React에 제공하는 가치
> - 컴포넌트 Props 타입 정의 (FC, PropsWithChildren)
> - Event Handler, Ref, Generic Component 타입
> - Hook의 타입 안전성 (useState, useReducer, useContext)
> - 유틸리티 타입 활용 (Partial, Pick, Omit, Record)
>
> Phase 4에서 설계한 아키텍처 위에,
> 이제 **타입 안전성, 폼 관리, 스타일링**으로 프로덕션 품질을 완성한다.

---

## 📚 참고 자료

- [React 공식 문서 — Suspense](https://react.dev/reference/react/Suspense)
- [React 공식 문서 — use](https://react.dev/reference/react/use)
- [React 공식 문서 — lazy](https://react.dev/reference/react/lazy)
- [React 18 Working Group — Suspense](https://github.com/reactwg/react-18/discussions)
- [Dan Abramov — Algebraic Effects for the Rest of Us](https://overreacted.io/algebraic-effects-for-the-rest-of-us/)
- [TanStack Query — Suspense](https://tanstack.com/query/latest/docs/react/guides/suspense)
- [Web.dev — Optimize CLS](https://web.dev/optimize-cls/)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 30 of 42 | **Phase 4 완료**
