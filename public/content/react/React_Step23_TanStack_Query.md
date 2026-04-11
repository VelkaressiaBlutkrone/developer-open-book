# Step 23. TanStack Query (React Query)

> **난이도:** 🔴 고급 (Advanced)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| **Remember**   | useQuery, useMutation, QueryClient, queryKey의 역할을 기술할 수 있다                    |
| **Understand** | TanStack Query의 캐싱 메커니즘(stale/fresh, gcTime, staleTime)을 설명할 수 있다         |
| **Understand** | Step 22의 수동 패칭 7가지 한계가 TanStack Query에 의해 어떻게 해결되는지 설명할 수 있다 |
| **Apply**      | useQuery로 데이터 조회, useMutation으로 데이터 변경 + 캐시 무효화를 구현할 수 있다      |
| **Analyze**    | queryKey 설계가 캐싱과 리패칭에 미치는 영향을 분석할 수 있다                            |
| **Evaluate**   | 프로젝트에서 TanStack Query가 필요한 시점과 불필요한 시점을 판단할 수 있다              |

**전제 지식:**

- Step 11: useEffect, 데이터 패칭의 복잡성
- Step 16: Custom Hook (useFetch의 한계)
- Step 22: REST API, fetch/Axios, 수동 패칭의 7가지 한계

---

## 1. 서론 — Server State 관리의 패러다임 전환

### 1.1 TanStack Query의 탄생 배경

2019년, Tanner Linsley라는 개발자가 React 애플리케이션의 서버 상태 관리 문제를 해결하기 위해 React Query를 오픈소스로 공개했다. 당시 React 개발자들은 대부분 Redux나 MobX 같은 전역 상태 관리 라이브러리에 서버 데이터를 함께 넣거나, Step 22에서 다룬 수동 패칭 패턴을 반복 작성하고 있었다. 두 방법 모두 불만족스러웠다.

Redux에 서버 데이터를 넣으면 fetching/success/failure 액션을 모두 직접 정의해야 했고, 캐싱이나 자동 리패칭은 여전히 직접 구현해야 했다. 수동 패칭은 동일한 보일러플레이트가 모든 컴포넌트에 반복되었으며 Step 22에서 분석한 7가지 한계를 그대로 안고 있었다.

React Query는 이 문제에 대한 명확한 답변을 제시했다. "Server State는 Client State와 근본적으로 다르다. 전용 도구로 관리해야 한다." 이 철학은 커뮤니티에서 폭발적인 반응을 얻었으며, 수년 만에 React 생태계에서 가장 중요한 라이브러리 중 하나가 되었다. 이후 Vue, Solid, Svelte 등 다른 프레임워크도 지원하게 되면서 이름을 TanStack Query로 변경했다.

### 1.2 Step 22에서 식별한 문제를 TanStack Query가 해결한다

Step 22에서 수동 패칭의 7가지 한계를 체감했다. TanStack Query(구 React Query)는 이 모든 문제를 **선언적 API 하나로** 해결한다.

```
Step 22의 한계              TanStack Query의 해결

1. Race Condition           → 자동 요청 취소 + 최신 응답만 반영
2. 캐싱 부재               → queryKey 기반 자동 캐싱 + 공유
3. Stale Data              → staleTime + 자동 백그라운드 리패칭
4. Waterfall               → Prefetching + Parallel Queries
5. 에러 재시도             → 자동 재시도 (exponential backoff)
6. 낙관적 업데이트         → onMutate + 롤백 내장
7. 보일러플레이트          → useQuery 한 줄로 대체
```

### 1.3 TanStack Query의 핵심 사상

```
"Server State는 Client State와 근본적으로 다르다.
 다른 도구로 관리해야 한다."

  Client State (useState, Zustand 등):
    · 동기적, 클라이언트가 소유, 항상 최신
    · 예: 모달 열림, 다크모드, 폼 입력값

  Server State (TanStack Query):
    · 비동기적, 서버가 소유, stale(오래됨) 가능
    · 예: 사용자 목록, 상품 정보, 알림
    · 핵심 과제: "캐시를 얼마나 오래 유지하고, 언제 갱신하는가?"
```

### 1.4 산업적 가치 — 왜 TanStack Query가 표준이 되었는가

TanStack Query가 단순한 편의 라이브러리를 넘어 산업 표준으로 자리잡은 이유는 명확하다. 캐싱 하나만으로도 API 요청 수를 극적으로 줄일 수 있다. 같은 데이터를 100개의 컴포넌트가 각각 요청하는 대신, 한 번 캐시에 저장된 데이터를 모두가 공유한다. 서버 부하 감소는 직접적인 인프라 비용 절감으로 이어진다.

개발 생산성 측면에서도 효과가 크다. 수동 패칭 코드에서 컴포넌트당 20~30줄이 필요했던 패칭 로직이 useQuery 한 줄로 압축된다. 팀 전체에 일관된 패턴이 적용되며, Race Condition이나 Stale Data 같은 미묘한 버그 클래스 전체가 라이브러리 수준에서 해결된다. 개발자가 비즈니스 로직에 집중할 수 있는 환경이 만들어진다.

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · TanStack Query의 핵심 개념과 아키텍처                 │
│  · useQuery: 선언적 데이터 조회 + 캐싱                  │
│  · useMutation: 데이터 변경 + 캐시 무효화               │
│  · queryKey 설계 전략                                    │
│  · 캐싱 메커니즘 (staleTime, gcTime, refetch)           │
│  · 자동 리패칭, 에러 재시도, 요청 중복 제거              │
│  · Optimistic Update 패턴                               │
│  · Infinite Query (무한 스크롤)                          │
│  · Prefetching                                           │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · SWR (유사 라이브러리)                                │
│  · GraphQL + Apollo Client                              │
│  · TanStack Query의 SSR 통합 상세                       │
│  · Devtools 설정 상세                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 캐싱이란 무엇이고 왜 어려운가

캐싱은 컴퓨터 과학에서 가장 어렵기로 유명한 문제 중 하나다. "캐싱의 두 가지 어려운 점은 캐시 무효화와 이름 짓기다"라는 말이 있을 정도다. 캐시를 너무 오래 유지하면 사용자가 오래된 데이터를 보게 된다. 너무 자주 갱신하면 캐싱의 이점이 사라진다. TanStack Query는 이 균형을 `staleTime`과 `gcTime`이라는 두 매개변수로 제어할 수 있게 해준다.

캐싱이 왜 중요한가를 구체적인 수치로 생각해보자. 사용자 프로필 데이터가 헤더, 사이드바, 본문 3곳에서 필요하다고 하면, 캐싱 없이는 페이지 로드마다 3번의 API 요청이 발생한다. 월 100만 명의 사용자가 하루 10번씩 페이지를 방문한다면, 캐싱 없이는 월 3,000만 번의 불필요한 API 요청이 발생한다. 이는 서버 비용과 응답 속도 모두에 영향을 미친다.

TanStack Query의 캐시는 단순히 "저장"만 하는 것이 아니라, 각 캐시 항목의 생명주기를 관리한다. 언제 데이터가 "신선한(fresh)"지, 언제 "오래된(stale)"지, 언제 가비지 컬렉션해야 하는지를 자동으로 처리한다.

### 2.2 핵심 용어 사전

| 용어                  | 정의                                                                           | 왜 중요한가                                                 |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **QueryClient**       | 모든 쿼리의 **캐시를 관리하는 중앙 저장소**. 앱에 하나 존재                    | 캐시 조회, 무효화, 프리페칭 등 모든 캐시 조작의 진입점      |
| **useQuery**          | 데이터를 **선언적으로 조회**하는 Hook. queryKey + queryFn으로 구성             | GET 요청의 상태(loading/error/data)를 자동 관리             |
| **useMutation**       | 데이터를 **변경(생성/수정/삭제)** 하는 Hook. 성공/실패 시 콜백 제공            | POST/PUT/DELETE + 캐시 무효화/낙관적 업데이트               |
| **queryKey**          | 쿼리를 **고유하게 식별**하는 배열. 캐싱, 리패칭, 공유의 기준                   | `['users']`, `['users', userId]` 등 계층적 설계             |
| **queryFn**           | 실제 데이터를 가져오는 **비동기 함수**. fetch, axios 등 자유롭게 사용          | TanStack Query는 패칭 방법에 관여하지 않는다                |
| **staleTime**         | 캐시된 데이터가 **"신선(fresh)"으로 간주되는 시간**. 이 시간 동안 리패칭 안 함 | 기본값 0ms = 캐시 즉시 stale. 조정으로 불필요한 리패칭 방지 |
| **gcTime**            | 사용하지 않는 캐시가 **가비지 컬렉션되기까지의 시간**. 기본 5분                | 컴포넌트 언마운트 후에도 캐시 유지 → 즉시 재표시 가능       |
| **invalidateQueries** | 특정 queryKey의 캐시를 **"stale"로 표시**하여 다음 접근 시 리패칭을 유도       | Mutation 후 관련 데이터를 갱신하는 핵심 메커니즘            |
| **Optimistic Update** | 서버 응답 전에 **캐시를 미리 업데이트**하고, 실패 시 롤백하는 기법             | 체감 성능을 극적으로 향상시킨다                             |

### 2.3 TanStack Query 아키텍처 개요

TanStack Query의 핵심은 **단일 QueryClient**다. 앱 전체에서 하나의 QueryClient 인스턴스가 모든 캐시를 관리한다. 여러 컴포넌트가 같은 `queryKey`를 사용하면 동일한 캐시를 공유하며, 요청도 한 번만 발생한다. 이것이 수동 패칭과의 가장 큰 차이점이다.

QueryClientProvider는 React의 Context API를 활용하여 QueryClient를 하위 컴포넌트 트리 전체에 제공한다. useQuery와 useMutation은 이 Context에서 QueryClient를 꺼내어 캐시 조작에 사용한다. 개발자가 직접 Context를 다룰 필요는 없으며, TanStack Query가 모든 연결을 처리한다.

```
┌─────────────────────────────────────────────────────────────┐
│              TanStack Query 아키텍처                          │
│                                                              │
│  ┌───────────────────────────────────────┐                  │
│  │  QueryClientProvider                  │                  │
│  │  (앱 최상위에서 QueryClient 제공)      │                  │
│  │                                       │                  │
│  │  ┌───────────┐  ┌───────────┐        │                  │
│  │  │ Component │  │ Component │        │                  │
│  │  │ useQuery  │  │ useQuery  │        │                  │
│  │  │ key:      │  │ key:      │        │  같은 queryKey   │
│  │  │ ['users'] │  │ ['users'] │        │  = 같은 캐시 공유│
│  │  └─────┬─────┘  └─────┬─────┘        │                  │
│  │        │               │              │                  │
│  │        └───────┬───────┘              │                  │
│  │                ▼                      │                  │
│  │  ┌─────────────────────────────┐     │                  │
│  │  │  QueryClient (캐시 저장소)   │     │                  │
│  │  │                             │     │                  │
│  │  │  ['users'] → { data, ... }  │     │                  │
│  │  │  ['users', 42] → { ... }    │     │                  │
│  │  │  ['products'] → { ... }     │     │                  │
│  │  └─────────────────────────────┘     │                  │
│  └───────────────────────────────────────┘                  │
│                                                              │
│  핵심:                                                       │
│  · 여러 컴포넌트가 같은 queryKey를 사용하면 캐시를 공유       │
│  · 요청은 한 번만, 결과는 모든 구독자에게 전달                │
│  · 컴포넌트가 언마운트되어도 gcTime 동안 캐시 유지            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 설정과 기본 사용법

#### QueryClientProvider 설정

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// QueryClient 생성 — 전역 기본 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분간 fresh 유지 (기본 0)
      gcTime: 1000 * 60 * 5, // 5분간 캐시 유지 (기본 5분)
      retry: 3, // 실패 시 3회 재시도 (기본 3)
      refetchOnWindowFocus: true, // 탭 전환 시 리패칭 (기본 true)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      {/* DevTools — 개발 모드에서 캐시 상태를 시각적으로 확인 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3.2 useQuery — 선언적 데이터 조회

#### 기본 사용법

```jsx
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const {
    data, // 캐시된 데이터 (성공 시)
    isLoading, // 첫 로딩 중 (캐시 없을 때)
    isFetching, // 백그라운드 리패칭 중 (캐시 있어도 true 가능)
    isError, // 에러 발생 여부
    error, // 에러 객체
    isSuccess, // 성공 여부
    refetch, // 수동 리패칭 함수
  } = useQuery({
    queryKey: ["users"], // 캐시 키
    queryFn: () =>
      fetch("/api/users") // 패칭 함수
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        }),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {isFetching && <small>업데이트 중...</small>}
      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

```
Step 22의 수동 패칭과 비교

  수동 패칭 (Step 22):
    · useState 3개 (data, isLoading, error)
    · useEffect + async 함수 + try/catch/finally
    · AbortController + Cleanup
    · 약 25~30줄

  TanStack Query:
    · useQuery 호출 1개
    · queryKey + queryFn만 제공
    · loading, error, data가 자동 관리
    · AbortController 자동 처리
    · 약 5~10줄

  제거된 것:
    ✅ useState 보일러플레이트
    ✅ useEffect 패턴
    ✅ AbortController 수동 관리
    ✅ Race Condition 걱정
    ✅ try/catch/finally 반복
```

#### isLoading vs isFetching

`isLoading`과 `isFetching`의 차이를 이해하는 것은 좋은 로딩 UX를 만들기 위한 필수 지식이다. `isLoading`은 "데이터가 없어서 화면에 아무것도 보여줄 수 없는 상태"이고, `isFetching`은 "네트워크 요청이 진행 중인 상태 전반"이다. 캐시에 데이터가 있는 상태에서 백그라운드 갱신이 일어날 때는 `isFetching`만 true가 되며, 이때는 스피너 대신 반투명 오버레이나 작은 인디케이터를 보여주는 것이 더 나은 UX다.

```
┌──────────────────────────────────────────────────────────────┐
│  isLoading vs isFetching — 미묘하지만 중요한 차이             │
│                                                               │
│  isLoading: true                                             │
│    · 캐시에 데이터가 없을 때의 첫 로딩                       │
│    · 스피너를 보여줘야 하는 시점                              │
│    · 이전 데이터가 없으므로 표시할 것이 없다                  │
│                                                               │
│  isFetching: true                                            │
│    · 어떤 이유로든 네트워크 요청이 진행 중                    │
│    · 캐시에 데이터가 있어도 백그라운드 리패칭 중이면 true     │
│    · "업데이트 중" 인디케이터를 보여줄 수 있는 시점           │
│                                                               │
│  조합:                                                       │
│    isLoading=true,  isFetching=true  → 첫 로딩 중            │
│    isLoading=false, isFetching=true  → 캐시 있음 + 리패칭 중 │
│    isLoading=false, isFetching=false → 최신 데이터 표시 중    │
│                                                               │
│  UI 전략:                                                    │
│    isLoading → <Spinner /> (빈 화면 대신 로딩 표시)          │
│    !isLoading && isFetching → 데이터 표시 + 작은 인디케이터  │
│    !isFetching → 데이터만 표시                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### enabled 옵션 — 조건부 쿼리

```jsx
// userId가 있을 때만 쿼리 실행
function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // userId가 falsy면 쿼리 실행 안 함
  });
}

// 이전 쿼리의 결과에 의존하는 쿼리 (Dependent Query)
function UserPosts({ userId }) {
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

  const { data: posts } = useQuery({
    queryKey: ["users", userId, "posts"],
    queryFn: () => fetchUserPosts(user.id),
    enabled: !!user, // user가 로드된 후에만 posts 쿼리 실행
  });
}
```

#### select — 데이터 변환

```jsx
// 서버 응답 전체가 아닌 필요한 부분만 선택
const { data: userNames } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  select: (data) => data.map((user) => user.name),
  // 캐시에는 전체 데이터가 저장되고
  // 컴포넌트에는 name 배열만 전달된다
  // select가 변하지 않으면 불필요한 재렌더링도 방지
});
```

### 3.3 queryKey 설계 전략

queryKey는 TanStack Query에서 가장 중요한 설계 결정 중 하나다. 잘못 설계된 queryKey는 캐시 충돌, 무효화 실패, 불필요한 리패칭 같은 미묘한 버그를 만든다. 반면 잘 설계된 queryKey는 캐시가 자연스럽게 계층 구조를 형성하며, 정확한 부분만 무효화하는 것이 가능해진다.

queryKey의 가장 중요한 규칙은 **queryFn에서 사용하는 모든 변수를 queryKey에 포함**하는 것이다. userId를 사용해서 패칭하는데 queryKey에 userId가 없다면, 다른 userId에 대한 요청이 같은 캐시를 공유하게 되어 잘못된 데이터가 표시된다.

#### queryKey = 캐시의 주소

```
queryKey는 캐싱, 리패칭, 공유, 무효화의 기준이 된다

  규칙 1: 배열 형태 (v5부터 필수)
    queryKey: ['users']
    queryKey: ['users', userId]
    queryKey: ['users', userId, 'posts']
    queryKey: ['products', { category: 'electronics', sort: 'price' }]

  규칙 2: 계층적으로 설계한다
    ['users']                    → 모든 사용자 목록
    ['users', 42]                → 42번 사용자 상세
    ['users', 42, 'posts']       → 42번 사용자의 게시글
    ['users', 42, 'posts', 7]    → 42번 사용자의 7번 게시글

  규칙 3: 필터/정렬 조건을 queryKey에 포함한다
    ['products', { category, sort, page }]
    → category, sort, page가 바뀌면 새 쿼리로 취급
    → 이전 조건의 캐시는 별도로 유지

  규칙 4: queryFn에서 사용하는 모든 변수를 queryKey에 포함한다
    // ❌ userId가 queryKey에 없으면 캐시가 섞임!
    queryKey: ['user'],
    queryFn: () => fetchUser(userId)

    // ✅ userId를 queryKey에 포함
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId)
```

#### queryKey Factory 패턴

queryKey를 컴포넌트마다 직접 작성하면 오타나 불일치로 인한 버그가 발생하기 쉽다. queryKey Factory 패턴은 모든 queryKey를 한 곳에서 함수로 정의하여, 타입 안전성과 일관성을 보장한다.

```javascript
// queryKey를 중앙에서 관리하는 패턴
const userKeys = {
  all:      ['users'],
  lists:    () => [...userKeys.all, 'list'],
  list:     (filters) => [...userKeys.lists(), filters],
  details:  () => [...userKeys.all, 'detail'],
  detail:   (id) => [...userKeys.details(), id],
};

// 사용
useQuery({ queryKey: userKeys.detail(42), queryFn: ... });
useQuery({ queryKey: userKeys.list({ page: 1, sort: 'name' }), queryFn: ... });

// 무효화 — 계층적으로 동작!
queryClient.invalidateQueries({ queryKey: userKeys.all });
// → ['users']로 시작하는 모든 캐시가 무효화됨
// → userKeys.lists(), userKeys.detail(42) 등 전부 포함

queryClient.invalidateQueries({ queryKey: userKeys.details() });
// → ['users', 'detail']로 시작하는 캐시만 무효화
// → list 캐시는 유지, detail 캐시만 갱신
```

### 3.4 캐싱 메커니즘 — staleTime과 gcTime

#### 캐시 생명주기

캐시 생명주기의 각 단계를 이해하면 staleTime과 gcTime을 적절하게 설정할 수 있다. "fresh" 상태는 데이터가 신뢰할 수 있다고 간주되는 기간이고, "stale" 상태는 배경에서 갱신이 가능한 기간이다. "inactive"는 컴포넌트가 해당 캐시를 더 이상 구독하지 않는 상태이며, gcTime이 지나면 메모리에서 삭제된다.

```
데이터의 생명주기 (시간 흐름)

  t=0     쿼리 성공 → 캐시에 저장 (status: fresh ★)
          ↓
  t=staleTime  캐시가 "stale"(오래됨)로 전환
          ↓  이 시점부터 리패칭 트리거가 작동
          ↓  (윈도우 포커스, 컴포넌트 마운트 등)
          ↓
  t=?     컴포넌트 언마운트 (이 queryKey를 사용하는 컴포넌트가 없음)
          ↓  캐시는 "비활성(inactive)"이지만 아직 존재
          ↓
  t=?+gcTime  캐시 삭제 (가비지 컬렉션)
              더 이상 캐시에 없음 → 다음 요청 시 처음부터 로딩


staleTime = 0 (기본값):
  · 캐시 저장 즉시 stale 상태
  · 컴포넌트 마운트할 때마다 백그라운드 리패칭
  · 가장 최신 데이터를 보장하지만 요청이 많아짐

staleTime = 60000 (1분):
  · 1분간은 캐시를 그대로 사용 (리패칭 안 함)
  · 1분 후부터 리패칭 트리거에 반응
  · "이 데이터는 1분간은 변하지 않을 것이다"라는 선언

staleTime = Infinity:
  · 캐시를 영원히 fresh로 유지 (자동 리패칭 없음)
  · 수동으로 invalidateQueries해야만 갱신
  · 거의 변하지 않는 데이터에 적합 (국가 코드 목록 등)
```

#### 자동 리패칭 트리거

```
캐시가 stale 상태일 때, 다음 상황에서 자동 리패칭:

  1. refetchOnMount (기본: true)
     · 이 queryKey를 사용하는 새 컴포넌트가 마운트될 때

  2. refetchOnWindowFocus (기본: true)
     · 사용자가 다른 탭에서 돌아올 때
     · "다른 탭에서 데이터가 바뀌었을 수 있으니 확인"

  3. refetchOnReconnect (기본: true)
     · 네트워크가 오프라인→온라인으로 복구될 때

  4. refetchInterval
     · 설정한 간격마다 주기적으로 리패칭 (폴링)
     · 실시간에 가까운 데이터가 필요할 때

  핵심: staleTime > 0이면 위 트리거가 발생해도
        데이터가 아직 fresh이면 리패칭하지 않는다
```

#### staleTime 설정 가이드

```
데이터 유형별 권장 staleTime

  실시간 데이터 (주식, 채팅):
    staleTime: 0 (기본값)
    + refetchInterval: 1000~5000 (1~5초 폴링)

  자주 변하는 데이터 (알림, 피드):
    staleTime: 1000 * 30 (30초)
    → 30초간은 캐시 사용, 이후 트리거 시 갱신

  보통 데이터 (상품 목록, 게시글):
    staleTime: 1000 * 60 (1분)
    → 1분간 캐시 사용

  드물게 변하는 데이터 (카테고리, 설정):
    staleTime: 1000 * 60 * 10 (10분)

  거의 변하지 않는 데이터 (국가 코드, 환율 기준):
    staleTime: Infinity
    → 수동 무효화만으로 갱신
```

### 3.5 useMutation — 데이터 변경과 캐시 무효화

#### 기본 사용법

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddTodoForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo) =>
      fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      }).then((r) => {
        if (!r.ok) throw new Error("추가 실패");
        return r.json();
      }),

    onSuccess: () => {
      // 성공 시 관련 쿼리의 캐시를 무효화 → 자동 리패칭
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },

    onError: (error) => {
      alert(`에러: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = e.target.elements.text.value;
    mutation.mutate({ text, done: false });
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="text" placeholder="할 일 입력" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "추가 중..." : "추가"}
      </button>
    </form>
  );
}
```

```
Mutation의 생명주기 콜백

  useMutation({
    mutationFn: (variables) => ...,

    onMutate: (variables) => {
      // mutationFn 실행 전에 호출
      // 낙관적 업데이트의 "미리 변경" 시점
      // return 값이 onError의 context로 전달됨
    },

    onSuccess: (data, variables, context) => {
      // 성공 시 호출
      // 캐시 무효화, 성공 토스트 등
    },

    onError: (error, variables, context) => {
      // 실패 시 호출
      // 롤백, 에러 메시지 등
      // context = onMutate의 반환값
    },

    onSettled: (data, error, variables, context) => {
      // 성공이든 실패든 항상 호출
      // 로딩 상태 정리 등
    },
  })
```

#### invalidateQueries의 계층적 동작

```jsx
// Todo 삭제 후 캐시 무효화
const deleteMutation = useMutation({
  mutationFn: (id) => fetch(`/api/todos/${id}`, { method: "DELETE" }),

  onSuccess: () => {
    // 방법 1: 정확한 키만 무효화
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    // → ['todos'] 캐시만 무효화

    // 방법 2: 접두사 매칭으로 관련 캐시 모두 무효화
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    // → ['todos'], ['todos', 1], ['todos', { filter: 'active' }] 등 모두!

    // 방법 3: 정확한 매칭만
    queryClient.invalidateQueries({
      queryKey: ["todos"],
      exact: true, // ['todos']만 무효화, ['todos', 1]은 유지
    });
  },
});
```

### 3.6 Optimistic Update — 서버 응답 전에 UI 먼저 변경

낙관적 업데이트(Optimistic Update)는 서버 응답을 기다리지 않고 먼저 UI를 변경하는 기법이다. 네트워크 지연이 300ms라면, 낙관적 업데이트 없이는 사용자가 300ms의 지연을 체감한다. 낙관적 업데이트를 적용하면 즉시 반응하는 인터페이스가 만들어진다.

핵심 흐름은 "미리 변경 → 서버 요청 → 성공 시 확정, 실패 시 롤백"이다. 실패 시 롤백 로직이 반드시 필요하며, TanStack Query의 `onMutate → onError` 패턴이 이를 구조화된 방식으로 제공한다.

#### 전체 패턴

```jsx
function TodoList() {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ id, done }) =>
      fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      }).then((r) => r.json()),

    // 1. 서버 요청 전: 캐시를 미리 업데이트
    onMutate: async ({ id, done }) => {
      // 진행 중인 리패칭 취소 (캐시 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 현재 캐시 백업 (롤백용)
      const previousTodos = queryClient.getQueryData(["todos"]);

      // 캐시를 낙관적으로 업데이트
      queryClient.setQueryData(["todos"], (old) =>
        old.map((todo) => (todo.id === id ? { ...todo, done } : todo)),
      );

      // 백업 데이터를 context로 반환 (onError에서 사용)
      return { previousTodos };
    },

    // 2. 실패 시: 캐시를 백업으로 롤백
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
      alert("업데이트 실패! 이전 상태로 복원합니다.");
    },

    // 3. 성공이든 실패든: 서버 데이터로 캐시 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // ...
}
```

```
Optimistic Update 흐름

  사용자가 체크박스 클릭
       │
       ▼
  onMutate:
    1. 진행 중 리패칭 취소
    2. 현재 캐시 백업
    3. 캐시를 낙관적으로 변경 → UI 즉시 반영 ★
       │
       ├── 서버 요청 진행 중...
       │
       ├── 성공 → onSuccess → onSettled → invalidate → 서버 데이터로 확정
       │
       └── 실패 → onError → 백업으로 롤백 → onSettled → invalidate

  사용자 체감: 체크박스가 "즉시" 반응한다 (서버 응답 대기 없음)
  실패 시: 체크가 "취소"되고 에러 메시지 표시
```

### 3.7 Infinite Query — 무한 스크롤

```jsx
import { useInfiniteQuery } from "@tanstack/react-query";

function ProductFeed() {
  const {
    data,
    fetchNextPage, // 다음 페이지 로드 함수
    hasNextPage, // 다음 페이지가 있는가
    isFetchingNextPage, // 다음 페이지 로딩 중인가
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["products", "infinite"],
    queryFn: ({ pageParam }) =>
      fetch(`/api/products?cursor=${pageParam}&limit=20`).then((r) => r.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // lastPage.nextCursor가 없으면 → hasNextPage = false
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;

  // data.pages = [page1, page2, page3, ...] 배열
  const allProducts = data.pages.flatMap((page) => page.items);

  return (
    <div>
      {allProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "로딩 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
```

### 3.8 Prefetching — 사용자가 접근하기 전에 미리 로드

프리페칭은 사용자가 실제로 요청하기 전에 데이터를 미리 캐시에 저장하는 기법이다. 사용자가 링크에 마우스를 올리는 시점(hover)이나 특정 페이지를 방문한 시점에 인접 페이지의 데이터를 미리 가져오면, 실제 페이지 전환 시 로딩 화면 없이 즉시 표시된다. 이는 체감 성능을 크게 향상시키는 기법이다.

```jsx
const queryClient = useQueryClient();

// 패턴 1: 마우스 호버 시 프리페칭
function ProductLink({ product }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ["products", product.id],
      queryFn: () => fetchProduct(product.id),
      staleTime: 1000 * 60, // 1분간 fresh
    });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={handleMouseEnter} // 호버 시 미리 로드!
    >
      {product.name}
    </Link>
  );
}

// 사용자가 링크를 클릭할 때는 이미 캐시에 데이터가 있음
// → 상세 페이지가 즉시 표시! (로딩 스피너 없음)

// 패턴 2: 라우트 loader에서 프리페칭 (React Router Data Router)
const productRoute = {
  path: "products/:id",
  element: <ProductDetail />,
  loader: async ({ params }) => {
    // 캐시에 있으면 즉시 반환, 없으면 패칭
    return queryClient.ensureQueryData({
      queryKey: ["products", params.id],
      queryFn: () => fetchProduct(params.id),
    });
  },
};
```

### 3.9 Step 22의 7가지 한계가 해결된 방식 요약

```
┌─────────────────────────────────────────────────────────────┐
│  수동 패칭의 한계           TanStack Query의 해결            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Race Condition         queryKey 변경 시 이전 요청 자동   │
│                            취소. 최신 queryKey의 응답만 반영 │
│                                                              │
│  2. 캐싱 부재             queryKey 기반 자동 캐싱.           │
│                            같은 key를 사용하는 컴포넌트는    │
│                            요청 1번, 결과 공유               │
│                                                              │
│  3. Stale Data             staleTime 후 자동 리패칭.         │
│                            윈도우 포커스, 재연결 시 갱신     │
│                                                              │
│  4. Waterfall              Parallel Queries 자동 병렬 실행.  │
│                            Prefetching으로 사전 로드         │
│                                                              │
│  5. 에러 재시도            retry 옵션으로 자동 재시도.       │
│                            exponential backoff 내장          │
│                                                              │
│  6. 낙관적 업데이트        onMutate → setQueryData →         │
│                            onError rollback 패턴 내장        │
│                                                              │
│  7. 보일러플레이트         useQuery 한 줄로 loading/error/   │
│                            data 자동 관리                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 상품 목록 + 필터/정렬의 queryKey 설계

```jsx
function ProductList() {
  const [filters, setFilters] = useState({
    category: "all",
    sort: "name",
    page: 1,
  });

  // filters가 바뀌면 queryKey가 바뀜 → 새 쿼리 실행
  // 이전 filters의 캐시는 별도로 유지됨
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    // 이전 필터로 돌아가면 캐시에서 즉시 표시!
    placeholderData: (previousData) => previousData,
    // keepPreviousData 대체: 새 데이터 로딩 중 이전 데이터 유지
  });

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div style={{ opacity: isFetching ? 0.7 : 1 }}>
        {isLoading ? <Spinner /> : <ProductGrid products={data} />}
      </div>
      <Pagination
        page={filters.page}
        onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
```

```
이 설계의 이점

  1. category='electronics', sort='price' 조합의 캐시가 따로 저장
  2. 사용자가 다른 카테고리로 갔다가 돌아오면 즉시 표시 (캐시!)
  3. 새 필터로 전환 시 이전 데이터를 유지하며 새 데이터 로드 (깜빡임 없음)
  4. isFetching으로 "업데이트 중" 피드백 (반투명 처리)
  5. 뒤로 가기 → 이전 필터의 queryKey → 캐시에서 즉시 복원
```

### 4.2 사례: useMutation으로 CRUD 완성

```jsx
function TodoApp() {
  const queryClient = useQueryClient();

  // READ
  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // CREATE
  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  // UPDATE
  const toggleMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <AddTodoForm onAdd={(text) => addMutation.mutate({ text })} />
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() =>
                toggleMutation.mutate({ id: todo.id, done: !todo.done })
              }
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteMutation.mutate(todo.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.3 사례: Custom Query Hook 패턴

도메인별로 Custom Query Hook을 만들면 컴포넌트가 TanStack Query의 세부사항을 몰라도 된다. queryKey 설계, staleTime 설정, 캐시 무효화 전략이 모두 Hook 안에 캡슐화된다. 이 패턴은 Step 24의 3계층 API 아키텍처와 자연스럽게 연결된다.

```jsx
// hooks/useUsers.js — 도메인별 Custom Hook
export function useUsers(filters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 60,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

// 사용: 깔끔한 컴포넌트
function UserPage() {
  const { data: users, isLoading } = useUsers({ role: "admin" });
  const createUser = useCreateUser();

  if (isLoading) return <Spinner />;
  return <UserList users={users} onCreate={createUser.mutate} />;
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: useQuery로 데이터 조회 [Applying]

**목표:** TanStack Query의 기본 사용법을 익힌다.

```
요구사항:
  · JSONPlaceholder API 사용
  · 게시글 목록 (GET /posts) → useQuery로 조회
  · 게시글 상세 (GET /posts/:id) → useQuery + enabled
  · isLoading, isError, isFetching 상태를 모두 UI에 표시
  · staleTime을 30초로 설정하고 효과 관찰:
    - 페이지 이동 후 돌아왔을 때 즉시 캐시 표시
    - 30초 이내 윈도우 포커스 시 리패칭 안 됨 확인
  · React Query DevTools로 캐시 상태 관찰
```

---

### 실습 2: useMutation + 캐시 무효화 [Applying]

**목표:** 데이터 변경과 캐시 갱신 패턴을 구현한다.

```
요구사항:
  · 게시글 CRUD를 TanStack Query로 구현
  · CREATE: useMutation + invalidateQueries
  · DELETE: useMutation + invalidateQueries
  · 상세 페이지에서 수정 → 목록의 캐시도 무효화
  · isPending 동안 버튼 비활성화
  · 에러 시 에러 메시지 표시

비교:
  · Step 22의 수동 패칭 코드와 줄 수, 복잡도 비교
```

---

### 실습 3: queryKey 설계 + Optimistic Update [Analyzing · Applying]

**목표:** queryKey를 전략적으로 설계하고 낙관적 업데이트를 구현한다.

```
요구사항:
  · 할 일 앱에 필터(all/active/completed) 추가
  · queryKey: ['todos', filter] → 필터별 캐시 분리
  · 필터 전환 시 이전 캐시 즉시 표시 확인
  · 할 일 완료 토글에 Optimistic Update 적용:
    - onMutate: 캐시 즉시 변경
    - onError: 롤백
    - onSettled: invalidate
  · 네트워크를 느리게 설정(DevTools)하여 낙관적 업데이트 효과 체험

분석할 것:
  · queryKey에 filter를 포함하면 캐시가 어떻게 분리되는가
  · invalidateQueries({ queryKey: ['todos'] })가 모든 필터의 캐시를 무효화하는 이유
```

---

### 실습 4 (선택): Infinite Query + Prefetching [Creating]

**목표:** 무한 스크롤과 프리페칭을 구현한다.

```
요구사항:
  · 상품 피드를 useInfiniteQuery로 구현
  · "더 보기" 버튼 또는 Intersection Observer로 자동 로드
  · 각 상품 카드에 마우스 호버 시 상세 페이지 프리페칭
  · 상세 페이지 진입 시 이미 캐시에 있으면 즉시 표시
  · isFetchingNextPage 동안 하단 스피너 표시

보너스:
  · Intersection Observer + useInfiniteQuery를 결합한
    useInfiniteScroll Custom Hook 만들기 (Step 16 합성 패턴)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 23 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. TanStack Query = Server State 전용 관리 도구              │
│     → Client State(useState)와 Server State를 분리           │
│     → 캐싱, 리패칭, 동기화를 자동으로 처리                    │
│     → Step 22의 수동 패칭 7가지 한계를 모두 해결              │
│                                                               │
│  2. useQuery = 선언적 데이터 조회                             │
│     → queryKey + queryFn만 제공하면 자동 관리                 │
│     → isLoading(첫 로딩) vs isFetching(백그라운드 갱신)       │
│     → enabled, select, placeholderData 등 옵션               │
│                                                               │
│  3. queryKey = 캐시의 주소이자 핵심 설계 요소                 │
│     → 배열 형태, 계층적 설계                                  │
│     → queryFn에서 사용하는 모든 변수를 포함                   │
│     → invalidateQueries가 접두사 매칭으로 동작                │
│     → queryKey Factory로 중앙 관리                           │
│                                                               │
│  4. staleTime = "이 데이터가 신선한 시간"                     │
│     → 0(기본): 항상 리패칭, Infinity: 수동 갱신만            │
│     → 데이터 변경 빈도에 맞게 설정                            │
│     → gcTime: 비활성 캐시의 유지 시간 (기본 5분)             │
│                                                               │
│  5. useMutation = 데이터 변경 + 캐시 무효화                   │
│     → mutationFn + onSuccess(invalidateQueries)              │
│     → isPending으로 로딩 상태, onError로 에러 처리            │
│     → onMutate → onSuccess/onError → onSettled 생명주기      │
│                                                               │
│  6. Optimistic Update = 서버 응답 전 UI 미리 변경             │
│     → onMutate: cancelQueries + 캐시 백업 + 낙관적 변경      │
│     → onError: 백업으로 롤백                                  │
│     → onSettled: invalidateQueries로 서버 데이터 동기화       │
│                                                               │
│  7. Infinite Query = 무한 스크롤/페이지네이션                 │
│     → useInfiniteQuery + getNextPageParam                    │
│     → data.pages 배열로 모든 페이지 데이터 관리               │
│                                                               │
│  8. Prefetching = 사용자가 접근 전에 미리 로드                │
│     → prefetchQuery: 호버 시 미리 패칭                       │
│     → ensureQueryData: 캐시 있으면 즉시, 없으면 패칭         │
│     → 체감 속도를 극적으로 향상                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                           | 블룸 단계  | 확인할 섹션 |
| --- | ---------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | useQuery의 queryKey와 queryFn 각각의 역할은?                                                   | Remember   | 3.2         |
| 2   | isLoading과 isFetching의 차이를 캐시 유무 관점에서 설명하라                                    | Understand | 3.2         |
| 3   | staleTime=60000의 의미와 이 시간 동안 윈도우 포커스 시 어떤 일이 일어나는가?                   | Understand | 3.4         |
| 4   | useMutation에서 onSuccess에 invalidateQueries를 호출하는 이유는?                               | Understand | 3.5         |
| 5   | queryKey: ['products', { category, sort }]에서 category가 바뀌면 캐시가 어떻게 동작하는가?     | Analyze    | 3.3         |
| 6   | Optimistic Update의 onMutate에서 cancelQueries를 호출하는 이유는?                              | Analyze    | 3.6         |
| 7   | Step 22의 수동 패칭에서 Race Condition이 발생하던 상황이 TanStack Query에서 어떻게 해결되는가? | Evaluate   | 3.9         |
| 8   | staleTime을 Infinity로 설정하면 어떤 데이터에 적합하고, 어떤 단점이 있는가?                    | Evaluate   | 3.4         |

---

## 6.3 FAQ

**Q1. TanStack Query를 쓰면 useState는 전혀 쓰지 않아도 되나요?**

A. 아닙니다. TanStack Query는 Server State 전용 도구입니다. 모달 열림/닫힘, 폼 입력값, 선택된 탭 등 Client State는 여전히 useState나 useReducer로 관리합니다. TanStack Query와 useState는 서로 보완적으로 사용됩니다.

**Q2. staleTime을 얼마로 설정해야 하나요?**

A. 데이터의 변경 빈도에 따라 다릅니다. 주식 가격처럼 초 단위로 변하는 데이터는 0(기본값) 또는 refetchInterval을 짧게 설정합니다. 사용자 프로필처럼 자주 변하지 않는 데이터는 5~10분, 국가 코드처럼 거의 변하지 않는 데이터는 Infinity가 적합합니다. 일반적인 CRUD 앱에서는 1분 정도가 무난한 시작점입니다.

**Q3. invalidateQueries와 refetchQueries의 차이는?**

A. `invalidateQueries`는 캐시를 "stale"로 표시하여, 해당 쿼리를 구독 중인 컴포넌트가 있을 때만 리패칭을 유도합니다. `refetchQueries`는 즉시 강제로 리패칭합니다. 일반적으로 Mutation 후에는 `invalidateQueries`를 사용하는 것이 더 효율적입니다.

**Q4. 서버에서 에러가 오면 TanStack Query가 자동으로 재시도하나요?**

A. 기본적으로 3회까지 재시도합니다(exponential backoff). 단, 4xx 클라이언트 에러는 재시도해도 소용없으므로, Step 24에서 다루는 것처럼 `retry` 옵션을 커스터마이징하여 4xx에서는 재시도하지 않도록 설정하는 것이 권장됩니다.

**Q5. React DevTools 말고 TanStack Query 전용 DevTools가 있나요?**

A. 있습니다. `@tanstack/react-query-devtools` 패키지를 설치하면 앱 하단에 플로팅 패널이 추가됩니다. 현재 캐시된 모든 쿼리, 각 쿼리의 상태(fresh/stale/inactive), 데이터 내용, 마지막 패칭 시각 등을 시각적으로 확인할 수 있어 디버깅에 매우 유용합니다.

---

## 7. 다음 단계 예고

> **Step 24. API 계층 설계와 에러 처리 통합** (Phase 3 마무리)
>
> - API 클라이언트 계층 설계 (api/ 폴더 구조)
> - 에러 분류와 계층적 처리 전략
> - 인증 토큰 관리와 갱신 자동화
> - 로딩/에러 UI의 일관된 패턴
> - Phase 3 전체 통합 복습

---

## 📚 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [TanStack Query — Quick Start](https://tanstack.com/query/latest/docs/react/quick-start)
- [TanStack Query — Queries](https://tanstack.com/query/latest/docs/react/guides/queries)
- [TanStack Query — Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [TanStack Query — Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [TanStack Query — Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [TanStack Query — Prefetching](https://tanstack.com/query/latest/docs/react/guides/prefetching)
- [TkDodo's Blog — Practical React Query](https://tkdodo.eu/blog/practical-react-query)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 23 of 42
