# Step 15. React 18/19 신규 Hooks

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Remember**   | useTransition, useDeferredValue, useId, use, useActionState, useOptimistic 각각의 역할을 나열할 수 있다 |
| **Understand** | "긴급 업데이트"와 "전환 업데이트"의 차이를 Concurrent Rendering 관점에서 설명할 수 있다                 |
| **Understand** | use() Hook이 기존 Hook 규칙의 예외가 되는 이유를 설명할 수 있다                                         |
| **Apply**      | useTransition으로 대규모 리스트 업데이트의 응답성을 개선할 수 있다                                      |
| **Analyze**    | useTransition과 useDeferredValue의 사용 시나리오를 비교하여 적합한 도구를 선택할 수 있다                |
| **Evaluate**   | React 19의 Actions 패턴이 기존 useState + useEffect 패턴을 어떻게 대체하는지 판단할 수 있다             |

**전제 지식:**

- Step 6: useState, Batching
- Step 8: Form, Controlled Component, 폼 제출
- Step 10: Concurrent Rendering, Priority Scheduling, Time Slicing
- Step 11: useEffect, 데이터 패칭
- Step 14: 메모이제이션, React.memo

---

## 1. 서론 — React가 "더 똑똑하게" 렌더링하는 방법

### 1.1 Concurrent Features의 등장 배경

웹 애플리케이션의 복잡성이 높아지면서 React는 근본적인 과제에 직면했다. 2010년대 초반의 앱은 비교적 단순한 데이터를 화면에 표시하는 수준이었지만, 2020년대의 앱은 수만 개의 데이터를 실시간으로 필터링하고, 드래그로 조작하며, 애니메이션을 동반하는 복잡한 인터랙션을 요구한다.

React 16까지의 렌더링 모델은 **동기적(synchronous)** 이었다. 한번 렌더링이 시작되면 완료될 때까지 메인 스레드를 독점했다. 50ms짜리 렌더링 작업이 실행되는 동안 사용자의 키보드 입력은 큐에 쌓이고, 화면은 50ms 동안 응답하지 않는 것처럼 느껴졌다. 이것이 "버벅임(jank)"의 근본 원인이다.

React 18은 **Concurrent Rendering**을 도입하여 이 문제를 해결했다. 렌더링 작업을 작은 단위로 쪼개어 브라우저에 제어를 양보하고, 더 긴급한 작업이 들어오면 현재 작업을 중단한 뒤 나중에 재개하는 방식이다. 이 아키텍처를 실전에서 활용하는 API가 바로 이 Step에서 학습하는 신규 Hooks다.

### 1.2 React 18/19 신규 Hooks의 산업적 가치

현대 웹 서비스에서 **사용자 체감 성능**은 핵심 경쟁력이다. Google의 Core Web Vitals(INP - Interaction to Next Paint)는 사용자 인터랙션 이후 화면 응답 시간을 직접 측정하며, 이 지표는 검색 순위에도 영향을 미친다. useTransition과 useDeferredValue는 INP를 개선하는 가장 직접적인 React API다.

React 19의 Actions 패턴(useActionState, useOptimistic)은 서버와의 비동기 통신을 새로운 방식으로 접근한다. 기존의 isLoading/error/data State 3종 세트를 매번 작성하는 패턴을 대체하여, 개발 생산성을 높이고 Progressive Enhancement(자바스크립트 없이도 동작하는 폼)를 가능하게 한다.

산업 현장에서 이 Hooks들은 다음 시나리오에서 실질적 가치를 제공한다: 대규모 데이터 그리드의 실시간 검색, 소셜 미디어의 좋아요/팔로우 낙관적 업데이트, 전자상거래의 장바구니 추가 UX 개선, 관리자 대시보드의 복잡한 필터 UI 등이다.

### 1.3 개념 지도 — 이 Step의 전체 구조

![React 신규 Hooks 개념 지도](/developer-open-book/diagrams/react-step15-concept-map.svg)

### 1.4 Concurrent Features의 실전 도구들

Step 10에서 Concurrent Rendering의 이론(Time Slicing, Priority Scheduling)을 학습했다. 이 Step에서는 그 이론을 **실전에서 활용하는 API**를 배운다.

```
Step 10에서 배운 이론:
  · 렌더링을 잘게 나누어 브라우저에 양보한다
  · 긴급한 업데이트를 먼저 처리한다
  · 덜 긴급한 업데이트는 나중에 처리할 수 있다

이 Step에서 배우는 실전 API:
  · useTransition: "이 업데이트는 긴급하지 않다"고 React에 알려준다
  · useDeferredValue: "이 값의 업데이트를 지연해도 된다"고 알려준다
  · useId: SSR에서도 안정적인 고유 ID를 생성한다
  · use(): Promise/Context를 직접 읽는 새로운 방식 (React 19)
  · useActionState: 폼 Action의 상태를 관리한다 (React 19)
  · useOptimistic: 서버 응답 전에 UI를 미리 업데이트한다 (React 19)
```

### 1.5 이 Step에서 다루는 범위

![Step 15 다루는 범위](/developer-open-book/diagrams/react-step15-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                  | 정의                                                                                              | 왜 중요한가                                   |
| --------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Urgent Update**     | 사용자의 직접적 상호작용(타이핑, 클릭)에 의한 업데이트. **즉시 반영**되어야 한다                  | 입력 필드, 버튼 등 직접적 피드백이 필요한 UI  |
| **Transition Update** | 긴급하지 않은 업데이트. **지연되어도 UX에 큰 영향이 없다**                                        | 검색 결과 필터링, 탭 전환, 대규모 리스트 등   |
| **isPending**         | useTransition이 제공하는 boolean. **전환 업데이트가 진행 중**인지 나타낸다                        | 로딩 스피너, 흐림 효과 등 피드백 UI에 활용    |
| **Deferred Value**    | 실제 값보다 **한 박자 늦게** 업데이트되는 값. 긴급한 UI는 즉시, 무거운 UI는 이후에 반영           | 입력 필드는 즉시, 검색 결과는 나중에 업데이트 |
| **Action**            | React 19에서 도입된 개념. **비동기 전환(async transition)** 으로, 폼 제출 등의 비동기 작업을 처리 | 기존 useState + useEffect 패칭 패턴을 대체    |
| **Optimistic Update** | 서버 응답을 기다리지 않고 **성공을 가정하여 UI를 미리 업데이트**하는 기법                         | 체감 속도를 향상시키는 UX 패턴                |

### 2.2 Urgent Update vs Transition Update — 핵심 구분

웹 앱에서 발생하는 모든 상태 변경이 동등하게 중요한 것은 아니다. 사용자가 검색창에 글자를 입력할 때, 입력 필드가 즉시 반응하는 것은 **필수**다. 입력 후 0.1초만 지연되어도 사용자는 키보드가 고장난 것으로 느낀다. 반면 검색 결과 목록이 0.3초 후에 업데이트되는 것은 **허용 가능**하다.

이 직관적인 구분이 Concurrent Rendering의 핵심 아이디어다. React 18은 이를 API로 공식화했다. 개발자가 "이 업데이트는 긴급하지 않다"고 명시적으로 표시하면, React는 그 업데이트를 낮은 우선순위로 처리하고 긴급한 업데이트에 메인 스레드를 양보한다.

```
긴급 업데이트 (Urgent):
  · 사용자가 직접 상호작용하는 UI 요소의 즉각적 피드백
  · 사용자는 이 업데이트의 지연을 "앱이 고장났다"고 인식
  · 예: 입력 필드 값 반영, 버튼 클릭 시각적 피드백, 스크롤

전환 업데이트 (Transition):
  · 계산 비용이 크지만 약간 지연되어도 허용 가능한 업데이트
  · 사용자는 "처리 중"임을 인지하고 기다릴 수 있다
  · 예: 검색 결과 필터링, 탭 콘텐츠 전환, 차트 데이터 업데이트
  · isPending 상태로 "처리 중" 피드백을 제공
```

### 2.3 React 19 Actions 패턴의 등장 배경

React 18까지 폼 제출과 비동기 작업을 처리하는 표준 패턴은 다음과 같았다:

```jsx
// 기존 패턴: 매번 반복되는 보일러플레이트
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [result, setResult] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    const data = await submitAPI(formData);
    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

이 패턴은 간단해 보이지만, 모든 비동기 작업마다 동일한 보일러플레이트가 반복된다. 실수하기 쉽고(finally 누락 등), Progressive Enhancement를 지원하지 않으며, 서버 컴포넌트와의 통합이 복잡하다.

React 19의 Actions 패턴은 이 문제를 해결하기 위해 설계되었다. `useActionState`는 `(prevState, formData) → newState` 패턴으로 상태 전이를 명시적으로 선언하고, `isPending`을 자동으로 관리하며, HTML 폼의 `action` 속성과 직접 연동된다.

### 2.4 업데이트 우선순위 체계

```
┌─────────────────────────────────────────────────────────────┐
│                React 업데이트 우선순위                        │
│                                                              │
│  높음 ▲  Urgent (긴급)                                      │
│  ────    · 사용자 타이핑 (onChange → setState)               │
│          · 클릭 핸들러의 setState                            │
│          · 즉시 반영되어야 하는 모든 상호작용                 │
│          → 즉시 처리, 다른 렌더링을 중단하고 먼저 실행        │
│                                                              │
│  중간    Default (기본)                                      │
│  ────    · 일반 setState (startTransition 없이)              │
│          · useEffect 안의 setState                           │
│          → 보통 속도로 처리                                  │
│                                                              │
│  낮음 ▼  Transition (전환)                                   │
│  ────    · startTransition(() => setState(...))              │
│          · useDeferredValue로 지연된 값                      │
│          → 긴급 업데이트에 양보, 중단될 수 있음               │
│          → isPending으로 진행 상태 추적                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Hook 간 관계와 선택 기준

이 Step에서 다루는 8개 Hook은 독립적으로 동작하지만, 실제 앱에서는 조합하여 사용하는 경우가 많다. 아래 관계도는 각 Hook의 책임과 연결을 보여준다.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Hook 관계도                                 │
│                                                                  │
│  [성능 최적화 그룹]                                              │
│  useTransition ──────── 긴급/전환 업데이트 분리                  │
│       └── isPending → 로딩 피드백 UI                            │
│                                                                  │
│  useDeferredValue ───── 값 수준의 지연                           │
│       └── stale 감지 → value !== deferredValue                  │
│                                                                  │
│  [SSR 호환]                                                      │
│  useId ──────────────── 서버/클라이언트 ID 일관성               │
│                                                                  │
│  [React 19 데이터 그룹]                                          │
│  use() ──────────────── Promise 읽기 → Suspense 연동            │
│       └── Context 읽기 → 조건부 사용 가능                       │
│                                                                  │
│  useActionState ──────── 폼 비동기 처리 통합                    │
│       └── useFormStatus ─── 폼 자식의 상태 접근                 │
│                                                                  │
│  useOptimistic ──────── 낙관적 UI → useActionState와 조합       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 useTransition — "이 업데이트는 긴급하지 않다"

#### API 형태

```jsx
const [isPending, startTransition] = useTransition();

// isPending: boolean — 전환 업데이트가 진행 중이면 true
// startTransition: (callback) => void — 콜백 안의 setState를 전환으로 표시
```

#### 핵심 문제와 해결

```
문제 시나리오: 검색어 입력 + 10,000개 리스트 필터링

  사용자가 'R', 'Re', 'Rea', 'Reac', 'React'를 빠르게 입력

  useTransition 없이:
    'R' 입력 → setState('R') → 10,000개 필터링(50ms) → 화면 업데이트
    'Re' 입력 → setState('Re') → 10,000개 필터링(50ms) → 화면 업데이트
    ...
    · 각 입력마다 50ms 동안 메인 스레드 점유
    · 입력 필드가 "버벅이는" 느낌
    · 사용자 체감: 느리다

  useTransition 사용:
    'R' 입력 → setQuery('R') [긴급] + startTransition(() => setFiltered(...)) [전환]
    · 입력 필드: 즉시 'R' 반영 (긴급 업데이트)
    · 필터 결과: 여유가 있을 때 처리 (전환 업데이트)
    · 사용자가 계속 타이핑하면 이전 전환을 취소하고 새 전환 시작
    · 사용자 체감: 입력은 즉시, 결과는 자연스럽게 나타남
```

#### 실전 구현

```jsx
import { useState, useTransition, useMemo } from "react";

function SearchableList({ allItems }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 긴급: 입력 필드는 즉시 반영
    setQuery(value);

    // 전환: 필터링은 나중에 처리해도 됨
    startTransition(() => {
      setDebouncedQuery(value);
    });
  };

  // 무거운 필터링은 debouncedQuery 기반
  const filteredItems = useMemo(
    () =>
      allItems.filter((item) =>
        item.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
      ),
    [allItems, debouncedQuery],
  );

  return (
    <div>
      <input value={query} onChange={handleChange} placeholder="검색..." />

      {/* isPending으로 전환 진행 중 피드백 */}
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <p>{filteredItems.length}개 결과</p>
        <ul>
          {filteredItems.slice(0, 100).map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

```
동작 흐름 분석

  사용자가 'R' 입력:
    1. setQuery('R')                    → 긴급: 즉시 처리
    2. startTransition(() =>
         setDebouncedQuery('R'))        → 전환: 나중에 처리
    3. 입력 필드: 'R' 즉시 표시         → 사용자 만족
    4. isPending = true                → 리스트 영역 반투명
    5. (브라우저 여유 시간에) debouncedQuery = 'R' → 필터링 실행
    6. isPending = false               → 리스트 선명하게 표시

  사용자가 빠르게 'React' 입력 (5자):
    · 입력 필드: R → Re → Rea → Reac → React 즉시 반영
    · 전환 업데이트: 중간 값의 렌더링은 취소됨!
    · 최종적으로 'React'에 대한 필터링만 한 번 실행
    · 불필요한 4번의 필터링을 건너뜀 → 성능 향상
```

#### startTransition의 규칙

```
startTransition에 넣을 수 있는 것:
  ✅ setState 호출
  ✅ 동기적 코드
  ✅ 여러 setState 호출 (모두 전환으로 처리됨)

startTransition에 넣을 수 없는 것:
  ❌ await (async 함수 불가 — React 18)
  ✅ await (React 19에서는 async transition 가능!)
  ❌ setTimeout, Promise 등 비동기 콜백 안의 setState
  ❌ ref.current 변경

React 19에서의 변화:
  · startTransition에 async 함수를 전달할 수 있다
  · 이것이 "Action"의 기반이 된다 (3.6절에서 학습)
```

#### 탭 전환 패턴

```jsx
function TabContainer() {
  const [activeTab, setActiveTab] = useState("posts");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
    // 탭 버튼의 활성 표시는 즉시, 탭 내용 렌더링은 전환으로
  };

  return (
    <div>
      <nav>
        {["posts", "comments", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {activeTab === "posts" && <HeavyPostsList />}
        {activeTab === "comments" && <HeavyCommentsList />}
        {activeTab === "analytics" && <HeavyAnalyticsDashboard />}
      </div>
    </div>
  );
}
```

### 3.2 useDeferredValue — "이 값의 업데이트를 지연해도 된다"

#### API 형태

```jsx
const deferredValue = useDeferredValue(value);

// value: 지연하고 싶은 값 (State, Props, 또는 어떤 값이든)
// deferredValue: value가 변할 때 "한 박자 늦게" 따라오는 값
```

#### 동작 원리

```
useDeferredValue의 동작

  1. 초기: deferredValue === value (동일)
  2. value가 변하면:
     · React가 먼저 deferredValue = 이전 값 으로 렌더링 시도 (빠르게)
     · 그 다음 deferredValue = 새 값 으로 백그라운드에서 렌더링
     · 긴급 업데이트가 끼어들면 백그라운드 렌더링을 중단
  3. 최종적으로 deferredValue가 value를 따라잡는다
```

#### 실전 구현

```jsx
function SearchResults({ query }) {
  // query가 변하면 deferredQuery는 "한 박자 늦게" 따라온다
  const deferredQuery = useDeferredValue(query);

  // 현재 표시 중인 결과가 "최신"인지 확인
  const isStale = query !== deferredQuery;

  // 무거운 계산은 deferredQuery 기반 (지연됨)
  const results = useMemo(() => searchDatabase(deferredQuery), [deferredQuery]);

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <p>
        "{deferredQuery}" 검색 결과: {results.length}개
      </p>
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div>
      {/* 입력 필드는 query를 직접 사용 → 즉시 반영 */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      {/* 결과 영역은 지연된 값 사용 → 무거운 렌더링이 입력을 차단하지 않음 */}
      <SearchResults query={query} />
    </div>
  );
}
```

### 3.3 useTransition vs useDeferredValue 비교

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│                      │  useTransition       │  useDeferredValue    │
├──────────────────────┼──────────────────────┼──────────────────────┤
│  제어 대상           │  State 업데이트 자체  │  값(value)           │
│  사용 위치           │  이벤트 핸들러 안에서 │  렌더링 중           │
│  적합한 상황         │  setState를 직접     │  Props로 받은 값을   │
│                      │  제어할 수 있을 때   │  제어할 수 없을 때   │
│  pending 상태        │  isPending 제공      │  value !== deferred  │
│                      │                      │  로 직접 비교        │
│  코드 위치           │  이벤트 소스 측       │  데이터 소비 측      │
│                      │  (Parent)            │  (Child)             │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

```
선택 기준

  "내가 setState를 호출하는가?"
    YES → useTransition
          startTransition(() => setState(newValue))

    NO  → useDeferredValue (Props로 받은 값을 지연)
          const deferred = useDeferredValue(props.query)

예시:
  · 검색 입력 + 필터링을 같은 컴포넌트에서 → useTransition
  · 부모가 query를 Props로 내려주고 자식이 무거운 렌더링 → useDeferredValue
  · 라이브러리 컴포넌트에 전달하는 값을 지연 → useDeferredValue
```

### 3.4 useId — SSR 호환 고유 ID 생성

#### 문제: 클라이언트와 서버의 ID 불일치

```
SSR에서의 ID 문제

  서버에서 렌더링: <label for="input-1">이름</label>
  클라이언트에서 Hydration: <label for="input-2">이름</label>
  → ID가 다르면 Hydration 불일치 경고!

  Math.random(), Date.now()는 서버/클라이언트에서 다른 값을 생성
  전역 카운터도 서버/클라이언트 실행 순서가 다를 수 있다
```

#### 해결: useId

```jsx
import { useId } from "react";

function FormField({ label, type = "text" }) {
  const id = useId(); // 서버/클라이언트에서 동일한 고유 ID 생성

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

function LoginForm() {
  return (
    <form>
      <FormField label="이메일" type="email" />
      {/* id = ":r0:" (예시) */}
      <FormField label="비밀번호" type="password" />
      {/* id = ":r1:" (예시) */}
    </form>
  );
}
```

```
useId의 특성

  · 서버와 클라이언트에서 동일한 ID를 생성한다
  · 컴포넌트 트리에서의 위치를 기반으로 ID를 결정한다
  · 형식: ":r0:", ":r1:", ":r2:" 등 (콜론으로 감싸 CSS 선택자 충돌 방지)
  · 리스트의 key로 사용하면 안 된다 (key는 데이터 기반이어야 함)
  · 하나의 컴포넌트에서 여러 ID가 필요하면 접미사를 붙인다

  const id = useId();
  const emailId = `${id}-email`;
  const passwordId = `${id}-password`;
```

#### useId 사용 시 주의사항

```
✅ useId가 적합한 경우:
  · <label htmlFor>와 <input id> 연결
  · aria-describedby, aria-labelledby 등 접근성 속성
  · 서버/클라이언트 ID 일관성이 필요한 모든 경우

❌ useId를 사용하면 안 되는 경우:
  · 리스트의 key — 데이터의 고유 ID를 사용 (Step 7)
  · CSS 선택자에서 직접 사용 — 콜론이 포함되어 있음
  · 데이터베이스 ID나 고유 식별자 생성 — crypto.randomUUID() 사용
```

### 3.5 use() — Promise와 Context를 읽는 새로운 방식 (React 19)

#### 기존 Hook과 다른 점

```
use()는 React 19에서 도입된 새로운 Hook으로,
기존 Hook 규칙의 예외가 되는 특수한 Hook이다.

  기존 Hook 규칙:
    · 컴포넌트 최상위에서만 호출
    · 조건문/반복문 안에서 호출 금지

  use()의 특별한 규칙:
    · 조건문 안에서 호출 가능! ★
    · 반복문 안에서 호출 가능!
    · 단, 컴포넌트 또는 Hook 함수 안에서만 호출 가능 (동일)
```

#### use()로 Promise 읽기

```jsx
import { use, Suspense } from "react";

// Promise를 직접 use()로 읽는다
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  // Promise가 해결(resolve)될 때까지 Suspense가 fallback을 보여준다
  // 해결되면 이 줄부터 실행이 재개된다

  return <h1>{user.name}</h1>;
}

function App() {
  const userPromise = fetchUser(1); // Promise를 생성만 하고 await하지 않음

  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

```
use(promise)의 동작

  1. 컴포넌트가 렌더링된다
  2. use(promise)를 만난다
  3. Promise가 아직 pending이면:
     · 렌더링을 "중단(suspend)"한다
     · 가장 가까운 <Suspense>의 fallback을 표시한다
  4. Promise가 resolve되면:
     · 컴포넌트를 다시 렌더링한다
     · use(promise)가 resolve된 값을 반환한다
  5. Promise가 reject되면:
     · 가장 가까운 Error Boundary가 에러를 처리한다
```

#### use()로 Context 읽기

```jsx
import { use, createContext } from "react";

const ThemeContext = createContext("light");

function Button() {
  // 기존: useContext(ThemeContext)
  // React 19: use(ThemeContext) — 조건문 안에서도 사용 가능!

  const theme = use(ThemeContext);
  return <button className={`btn-${theme}`}>클릭</button>;
}

// 조건부 Context 읽기 (기존 useContext로는 불가능했음!)
function ConditionalComponent({ showTheme }) {
  if (showTheme) {
    const theme = use(ThemeContext); // ✅ 조건문 안에서 사용 가능!
    return <p>현재 테마: {theme}</p>;
  }
  return <p>테마 표시 안 함</p>;
}
```

### 3.6 useActionState — 폼 Action 상태 관리 (React 19)

#### 기존 패턴의 문제

```jsx
// ❌ 기존: useState + useEffect + 수동 상태 관리
function AddToCart({ productId }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const result = await addToCartAPI(productId);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isPending}>
        {isPending ? "추가 중..." : "장바구니에 추가"}
      </button>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
    </form>
  );
}
```

#### React 19: useActionState

```jsx
import { useActionState } from "react";

function AddToCart({ productId }) {
  // action 함수: (previousState, formData) => newState
  async function addToCartAction(previousState, formData) {
    try {
      const result = await addToCartAPI(productId);
      return { message: result.message, error: null };
    } catch (err) {
      return { message: null, error: err.message };
    }
  }

  const [state, formAction, isPending] = useActionState(
    addToCartAction,
    { message: null, error: null }, // 초기 State
  );

  return (
    <form action={formAction}>
      {/* action={formAction}으로 폼 제출 시 자동 호출 */}
      <button disabled={isPending}>
        {isPending ? "추가 중..." : "장바구니에 추가"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.message && <p className="success">{state.message}</p>}
    </form>
  );
}
```

```
useActionState의 장점 (기존 패턴 대비)

  1. isPending 자동 관리
     · setIsPending(true/false)를 수동으로 할 필요 없음
     · Action 시작 시 자동 true, 완료 시 자동 false

  2. e.preventDefault() 불필요
     · <form action={fn}>이 자동으로 기본 동작 방지

  3. State 전이가 명시적
     · action 함수가 (prevState, formData) → newState를 반환
     · useReducer와 유사한 패턴

  4. Progressive Enhancement
     · JavaScript가 로드되기 전에도 폼이 동작할 수 있다
     · SSR + Hydration 전에도 폼 제출 가능 (Server Action 연동 시)

  5. 에러 처리가 간결
     · try/catch 후 State를 반환하면 끝
     · setError, setIsPending 등 여러 setState 조합 불필요
```

### 3.7 useOptimistic — 낙관적 UI 업데이트 (React 19)

#### 낙관적 업데이트란

```
일반 업데이트:
  사용자 액션 → 서버 요청 → (대기...) → 서버 응답 → UI 업데이트
  · 사용자가 응답을 기다려야 한다
  · 네트워크가 느리면 UX가 나빠진다

낙관적 업데이트:
  사용자 액션 → UI 즉시 업데이트 + 서버 요청 (동시에)
  · 성공하면: 서버 응답으로 UI 확정
  · 실패하면: UI를 이전 상태로 되돌림 (롤백)
  · 사용자 체감: "즉시 반응하는 앱"

예시:
  · "좋아요" 버튼: 누르자마자 하트가 채워지고, 백그라운드에서 서버에 전송
  · 메시지 전송: 입력하자마자 채팅에 표시되고, 백그라운드에서 서버에 전송
  · 할 일 체크: 누르자마자 체크되고, 백그라운드에서 서버에 저장
```

#### useOptimistic 구현

```jsx
import { useOptimistic } from "react";

function TodoList({ todos, onToggle }) {
  // optimisticTodos: 낙관적으로 업데이트된 목록 (즉시 반영)
  // addOptimistic: 낙관적 업데이트를 적용하는 함수
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    // 업데이트 함수: (currentState, optimisticValue) => newState
    (currentTodos, toggledId) =>
      currentTodos.map((todo) =>
        todo.id === toggledId ? { ...todo, done: !todo.done } : todo,
      ),
  );

  const handleToggle = async (id) => {
    // 1. 즉시 낙관적 업데이트 (UI에 바로 반영)
    addOptimistic(id);

    // 2. 서버에 실제 요청
    await onToggle(id);
    // 3. 서버 응답 후 todos Props가 업데이트되면
    //    optimisticTodos가 실제 값으로 교체됨
    // 4. 실패하면 자동으로 이전 상태로 롤백
  };

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li
          key={todo.id}
          onClick={() => handleToggle(todo.id)}
          style={{
            textDecoration: todo.done ? "line-through" : "none",
            // 낙관적 업데이트 중인 항목에 시각적 구분 (선택적)
            opacity: todo.sending ? 0.7 : 1,
          }}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

```
useOptimistic 동작 흐름

  1. 사용자가 todo를 클릭
  2. addOptimistic(id) → optimisticTodos가 즉시 업데이트
     · UI에 체크 표시가 바로 나타남 (0ms 지연)
  3. onToggle(id) → 서버에 요청 전송 (비동기)
  4a. 성공: 부모가 todos를 업데이트 → optimisticTodos가 실제 값으로 교체
  4b. 실패: 부모의 todos가 변하지 않음 → optimisticTodos가 원래 값으로 복귀 (롤백)

  핵심: useOptimistic의 첫 번째 인자(todos)가 "진실의 출처"이다
        todos가 변하면 optimisticTodos도 그에 맞게 조정된다
```

### 3.8 useFormStatus — 폼 제출 상태 접근 (React 19)

#### 용도: 자식 컴포넌트에서 폼 상태 읽기

```jsx
import { useFormStatus } from "react-dom";

// 폼의 자식 컴포넌트에서 제출 상태를 읽을 수 있다
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  // pending: 폼이 제출 중이면 true
  // data: 제출 중인 FormData
  // method: 'get' | 'post' 등
  // action: 폼의 action 함수 참조

  return (
    <button type="submit" disabled={pending}>
      {pending ? "제출 중..." : "제출"}
    </button>
  );
}

function MyForm() {
  async function handleAction(formData) {
    await submitToServer(formData);
  }

  return (
    <form action={handleAction}>
      <input name="email" type="email" />
      <SubmitButton />
      {/* SubmitButton이 폼의 pending 상태를 자동으로 감지 */}
    </form>
  );
}
```

```
useFormStatus의 핵심 규칙

  · 반드시 <form> 내부의 컴포넌트에서 호출해야 한다
  · 같은 컴포넌트의 <form>이 아닌, 부모의 <form>을 참조한다
  · isPending을 Props로 전달하지 않아도 자식이 직접 읽을 수 있다
  · React 19의 form Action 패턴과 함께 사용
```

### 3.9 신규 Hooks 선택 가이드

```
"어떤 Hook을 사용해야 하는가?"

  ┌─ 무거운 UI 업데이트로 입력이 버벅이는가?
  │    ├─ setState를 직접 제어할 수 있는가?
  │    │    YES → useTransition
  │    │    NO (Props로 받은 값) → useDeferredValue
  │
  ├─ SSR에서 안정적인 ID가 필요한가?
  │    YES → useId
  │
  ├─ Promise를 Suspense와 함께 사용하고 싶은가?
  │    YES → use() (React 19)
  │
  ├─ 폼 제출 + 비동기 처리를 간결하게 하고 싶은가?
  │    YES → useActionState (React 19)
  │
  ├─ 서버 응답 전에 UI를 미리 업데이트하고 싶은가?
  │    YES → useOptimistic (React 19)
  │
  └─ 폼의 자식 컴포넌트에서 제출 상태를 읽고 싶은가?
       YES → useFormStatus (React 19, react-dom)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: useTransition으로 탭 전환 개선

```
시나리오: 3개의 탭, 각각 무거운 컴포넌트를 렌더링

  useTransition 없이:
    "분석" 탭 클릭 → 무거운 차트 렌더링 시작 (200ms)
    → 200ms 동안 이전 탭 내용이 "멈춘" 상태
    → 사용자가 다른 탭을 클릭해도 반응 없음
    → 사용자 체감: "멈춤"

  useTransition 사용:
    "분석" 탭 클릭 → 탭 버튼 즉시 활성화 표시
    → isPending=true → 이전 내용이 반투명으로 표시 (피드백)
    → 백그라운드에서 차트 렌더링 진행
    → 완료 시 isPending=false → 새 내용 선명하게 표시
    → 중간에 다른 탭 클릭 → 이전 전환 취소, 새 전환 시작
    → 사용자 체감: "부드러운 전환"
```

### 4.2 사례: use()와 Suspense를 결합한 데이터 패칭

```jsx
// React 19: use() + Suspense로 데이터 패칭 간소화

// 캐시된 Promise를 생성하는 함수 (간략화)
let cache = new Map();
function fetchData(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((r) => r.json()),
    );
  }
  return cache.get(url);
}

function UserPage({ userId }) {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserDetails userId={userId} />
    </Suspense>
  );
}

function UserDetails({ userId }) {
  const user = use(fetchData(`/api/users/${userId}`));
  // Promise가 pending이면 Suspense fallback 표시
  // resolve되면 user 데이터를 즉시 사용

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

```
use() + Suspense vs useEffect + useState 비교

  기존 (useEffect):
    · 컴포넌트 내부에 isLoading, error, data State 3개
    · useEffect에서 fetch → setState 패턴
    · Guard Clause로 4가지 상태 처리
    · 코드 ~30줄

  React 19 (use + Suspense):
    · const data = use(promise) 한 줄
    · 로딩 UI → <Suspense fallback={...}>
    · 에러 UI → <ErrorBoundary> (Step 17)
    · 코드 ~5줄

  ※ 실무에서는 TanStack Query (Step 23)가 캐싱, 리패칭,
    무효화 등을 포함하여 더 완전한 솔루션을 제공한다
```

### 4.3 사례: useActionState로 좋아요 기능 구현

```jsx
function LikeButton({ postId, initialLikes, isLiked }) {
  async function toggleLikeAction(prevState) {
    try {
      const result = await toggleLikeAPI(postId);
      return {
        likes: result.likes,
        isLiked: result.isLiked,
        error: null,
      };
    } catch (err) {
      return { ...prevState, error: "좋아요 처리에 실패했습니다" };
    }
  }

  const [state, formAction, isPending] = useActionState(toggleLikeAction, {
    likes: initialLikes,
    isLiked,
    error: null,
  });

  return (
    <form action={formAction}>
      <button disabled={isPending}>
        {state.isLiked ? "❤️" : "🤍"} {state.likes}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

### 4.4 사례: useOptimistic + useActionState 조합

실전 앱에서는 `useOptimistic`과 `useActionState`를 함께 사용하여 즉각적인 UI 피드백과 서버 상태 동기화를 동시에 달성한다.

```jsx
function MessageInput({ threadId, onSend }) {
  const [messages, setMessages] = useState([]);

  // 낙관적 메시지 목록 (서버 확인 전에도 즉시 표시)
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current, newMsg) => [...current, { ...newMsg, sending: true }],
  );

  async function sendAction(prevState, formData) {
    const text = formData.get("text");
    const tempId = Date.now();

    // 즉시 화면에 반영 (낙관적)
    addOptimisticMessage({ id: tempId, text, sending: true });

    try {
      const saved = await sendMessageAPI(threadId, text);
      // 서버에서 확정된 메시지로 교체
      setMessages((prev) => [...prev, saved]);
      return { error: null };
    } catch (err) {
      return { error: "전송에 실패했습니다. 다시 시도해 주세요." };
    }
  }

  const [state, formAction, isPending] = useActionState(sendAction, {
    error: null,
  });

  return (
    <div>
      <ul>
        {optimisticMessages.map((msg) => (
          <li key={msg.id} style={{ opacity: msg.sending ? 0.6 : 1 }}>
            {msg.text}
            {msg.sending && " (전송 중...)"}
          </li>
        ))}
      </ul>
      <form action={formAction}>
        <input name="text" disabled={isPending} placeholder="메시지 입력..." />
        <button type="submit" disabled={isPending}>
          전송
        </button>
      </form>
      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: useTransition으로 검색 응답성 개선 [Applying]

**목표:** 대규모 리스트의 실시간 검색에서 입력 응답성을 개선한다.

```
요구사항:
  · 10,000개 항목의 리스트 생성 (Array.from)
  · 검색어 입력 → 실시간 필터링
  · useTransition으로 입력 필드는 즉시 반영, 필터링은 전환으로 처리
  · isPending 동안 리스트 영역을 반투명 또는 "검색 중..." 표시
  · useTransition 적용 전/후 입력 응답성 비교

비교 실험:
  1. useTransition 없이 구현 → 빠른 타이핑 시 버벅임 관찰
  2. useTransition 적용 → 동일 테스트 후 차이 관찰
```

---

### 실습 2: useTransition vs useDeferredValue 비교 [Analyzing]

**목표:** 같은 문제를 두 가지 방식으로 해결하고 차이를 분석한다.

아래 시나리오를 **useTransition 버전**과 **useDeferredValue 버전** 두 가지로 구현하라.

```
시나리오: 슬라이더(range input)를 드래그하면
         무거운 그래프가 실시간으로 업데이트되어야 한다

요구사항:
  · 슬라이더 값: 1~1000
  · 슬라이더 표시는 즉시 반영
  · 그래프 렌더링은 무겁다고 가정 (의도적으로 느린 컴포넌트 생성)
  · 드래그 중에도 슬라이더가 부드러워야 한다

분석할 것:
  · 코드 구조의 차이
  · isPending 처리 방식의 차이
  · 어떤 상황에서 어떤 방식이 더 적합한가
```

---

### 실습 3: useActionState로 폼 리팩토링 [Applying · Evaluating]

**목표:** 기존 useState + useEffect 패턴의 폼을 useActionState로 리팩토링한다.

```
요구사항:
  · 간단한 회원가입 폼 (이름, 이메일, 비밀번호)
  · Step 1: 기존 패턴으로 구현 (useState + handleSubmit + isPending 수동 관리)
  · Step 2: useActionState로 리팩토링
  · Step 3: useFormStatus로 SubmitButton 분리

비교할 것:
  · 코드 줄 수
  · State 변수 수
  · 에러 처리 코드의 복잡도
  · Progressive Enhancement 가능 여부
```

---

### 실습 4 (선택): useOptimistic으로 즉시 반응 UI [Creating]

**목표:** 낙관적 업데이트로 체감 성능을 향상시킨다.

**메시지 목록**을 만든다:

```
요구사항:
  · 메시지 목록 표시
  · "전송" 버튼 클릭 시 메시지가 즉시 목록에 추가 (낙관적)
  · 서버 전송은 2초 지연 시뮬레이션 (setTimeout)
  · 전송 중인 메시지는 반투명 표시
  · 전송 성공 시 확정, 실패 시 롤백 + 에러 메시지
  · 20% 확률로 전송 실패 시뮬레이션
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 15 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  React 18 Hooks:                                             │
│                                                               │
│  1. useTransition = "이 setState는 긴급하지 않다"             │
│     → startTransition(() => setState(...))                   │
│     → 입력은 즉시, 무거운 렌더링은 나중에                     │
│     → isPending으로 진행 상태 표시                            │
│     → 중간 전환은 자동 취소 (불필요한 렌더링 방지)            │
│                                                               │
│  2. useDeferredValue = "이 값의 업데이트를 지연해도 된다"     │
│     → Props로 받은 값을 제어할 수 없을 때 사용                │
│     → value !== deferredValue로 stale 상태 감지              │
│     → useTransition과 선택 기준: setState 직접 제어 가능 여부 │
│                                                               │
│  3. useId = SSR 호환 고유 ID 생성                             │
│     → 서버/클라이언트에서 동일한 ID 보장                      │
│     → label-input 연결, 접근성 속성에 사용                    │
│     → 리스트 key로 사용하면 안 된다                           │
│                                                               │
│  React 19 Hooks:                                             │
│                                                               │
│  4. use() = Promise/Context를 직접 읽는다                    │
│     → Suspense와 결합하여 데이터 패칭 간소화                 │
│     → 조건문 안에서 호출 가능 (기존 Hook 규칙의 예외)         │
│     → Context 읽기에도 사용 가능 (useContext 대안)            │
│                                                               │
│  5. useActionState = 폼 Action의 상태를 관리한다             │
│     → (prevState, formData) → newState 패턴                  │
│     → isPending 자동 관리, preventDefault 불필요              │
│     → 기존 useState + handleSubmit 패턴을 간소화             │
│                                                               │
│  6. useOptimistic = 서버 응답 전에 UI를 미리 업데이트한다     │
│     → 성공 시 확정, 실패 시 자동 롤백                        │
│     → 체감 성능을 극적으로 향상시킨다                         │
│                                                               │
│  7. useFormStatus = 자식에서 폼 제출 상태를 읽는다            │
│     → <form> 내부의 자식 컴포넌트에서 사용                   │
│     → pending 상태를 Props 없이 접근                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                   | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | "긴급 업데이트"와 "전환 업데이트"의 차이를 예시와 함께 설명하라                        | Understand | 2.2         |
| 2   | useTransition의 startTransition 안에서 setState를 호출하면 어떤 우선순위로 처리되는가? | Understand | 3.1         |
| 3   | useDeferredValue에서 `value !== deferredValue`가 의미하는 것은?                        | Understand | 3.2         |
| 4   | useTransition과 useDeferredValue의 선택 기준은?                                        | Analyze    | 3.3         |
| 5   | useId로 생성한 ID를 리스트의 key로 사용하면 안 되는 이유는?                            | Understand | 3.4         |
| 6   | use()가 조건문 안에서 호출될 수 있는 이유를 기존 Hook과 비교하여 설명하라              | Analyze    | 3.5         |
| 7   | useActionState가 기존 useState + handleSubmit 패턴 대비 줄이는 코드는?                 | Apply      | 3.6         |
| 8   | useOptimistic에서 서버 요청이 실패하면 UI가 어떻게 되는가?                             | Understand | 3.7         |

### 6.3 FAQ

**Q1. useTransition을 사용하면 모든 성능 문제가 해결되는가?**

그렇지 않다. useTransition은 렌더링 우선순위를 조정할 뿐, 실제 렌더링 비용 자체를 줄이지 않는다. 10,000개 항목을 렌더링하는 비용은 동일하며, 단지 그 비용을 "덜 급한 시간"에 집행할 뿐이다. 진정한 성능 개선을 위해서는 가상화(react-window), 메모이제이션(useMemo, React.memo), 코드 분할과 함께 사용해야 한다.

**Q2. React 19의 use()는 TanStack Query를 대체하는가?**

대체하지 않는다. use()는 Promise를 Suspense와 연동하는 저수준 API다. TanStack Query는 그 위에 캐싱, 자동 리패칭, 백그라운드 동기화, 무효화, 낙관적 업데이트 등 데이터 관리의 전체 라이프사이클을 제공한다. 실무에서는 use()를 직접 쓰기보다 TanStack Query 같은 라이브러리를 통해 간접적으로 활용하는 경우가 더 많다.

**Q3. useActionState와 useOptimistic은 항상 함께 써야 하는가?**

함께 쓰면 강력하지만 필수는 아니다. useActionState만으로도 폼 제출 상태를 간결하게 관리할 수 있다. useOptimistic은 네트워크 지연이 눈에 띄는 상황(예: 좋아요, 팔로우, 메시지 전송)에서 추가적인 UX 개선이 필요할 때 더한다.

**Q4. useDeferredValue는 디바운스와 같은가?**

다르다. 디바운스는 일정 시간이 지나야 업데이트를 실행한다. useDeferredValue는 브라우저가 바쁘면 업데이트를 늦추고, 여유가 있으면 즉시 업데이트한다. 즉, 상황에 따라 0ms일 수도 있고 수백 ms일 수도 있다. 고정된 딜레이가 없는 것이 핵심 차이다.

**Q5. useFormStatus는 왜 react-dom에서 import하는가?**

useFormStatus는 HTML 폼 요소와 직접 연동되는 DOM 관련 API이기 때문이다. react-dom 패키지는 React의 웹 렌더러이며, DOM 환경에 특화된 Hook들(useFormStatus 등)을 제공한다. React Native 등 다른 렌더러 환경에서는 사용하지 않는다.

---

## 7. 다음 단계 예고

> **Step 16. Custom Hook 설계 패턴**
>
> - Custom Hook의 본질: 상태 로직의 재사용
> - 관심사 분리(Separation of Concerns) 원칙
> - Hook 합성(Composition) 패턴
> - 좋은 Hook API 설계 원칙 (네이밍, 반환값, 인터페이스)
> - 실전 Custom Hook 라이브러리 설계

---

## 📚 참고 자료

- [React 공식 문서 — useTransition](https://react.dev/reference/react/useTransition)
- [React 공식 문서 — useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [React 공식 문서 — useId](https://react.dev/reference/react/useId)
- [React 공식 문서 — use](https://react.dev/reference/react/use)
- [React 공식 문서 — useActionState](https://react.dev/reference/react/useActionState)
- [React 공식 문서 — useOptimistic](https://react.dev/reference/react/useOptimistic)
- [React 공식 문서 — useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React 공식 블로그 — React 19](https://react.dev/blog/2024/12/05/react-19)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 15 of 42
