# Step 14. 메모이제이션 전략

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| **Remember**   | useMemo, useCallback, React.memo 각각의 역할과 API를 기술할 수 있다               |
| **Understand** | "참조 동일성(Referential Identity)"이 React 최적화에서 왜 중요한지 설명할 수 있다 |
| **Understand** | 세 가지 메모이제이션 도구의 동작 원리와 실행 시점을 설명할 수 있다                |
| **Apply**      | 성능 문제가 있는 컴포넌트에 적절한 메모이제이션을 적용할 수 있다                  |
| **Analyze**    | 불필요한 메모이제이션을 식별하고 과도한 최적화의 비용을 분석할 수 있다            |
| **Evaluate**   | "측정(Profiler) 없이 최적화하지 않는다"는 원칙을 실천할 수 있다                   |

**전제 지식:**

- Step 4: "렌더링 = 함수 실행" — 매 렌더링마다 함수 전체가 재호출
- Step 5: Props, 재렌더링 전파 (부모 → 자식), 얕은 비교(Shallow Comparison)
- Step 6: useState, Batching
- Step 7: Reconciliation, Diff 알고리즘
- Step 10: Render Phase, Fiber Architecture, React Compiler 개요

---

## 1. 서론 — 최적화의 올바른 시작점

### 1.1 메모이제이션의 역사와 컴퓨터 과학적 배경

메모이제이션(Memoization)은 함수형 프로그래밍과 동적 프로그래밍(Dynamic Programming)에서 오래전부터 사용된 기법이다. 용어 자체는 1968년 Donald Michie가 논문에서 처음 공식화했으며, "메모(memo, 기억)"에서 유래했다. 핵심 아이디어는 단순하다. **같은 입력에 대해 반복적으로 계산하는 대신, 이전 계산 결과를 저장(캐시)하고 재사용한다.**

피보나치 수열을 순수 재귀로 구현하면 `fib(50)`을 계산하는 데 수십억 번의 함수 호출이 발생한다. 메모이제이션을 적용하면 각 값을 한 번만 계산하고 캐시하여 선형 시간으로 해결된다. 웹 브라우저의 HTTP 캐시, CPU의 L1/L2 캐시, DNS 캐시 모두 같은 원리다. "비용이 큰 연산을 반복하지 않는다"는 보편적 최적화 전략이다.

React에서 메모이제이션의 역할은 조금 다른 차원에서 작동한다. 계산 비용뿐만 아니라 **참조 동일성(Referential Identity)**이 핵심 문제다. 함수형 컴포넌트는 매 렌더링마다 함수가 재실행되어 내부의 객체와 함수가 새로 생성된다. 값이 같아도 참조가 다르면 React의 비교 알고리즘은 "변경됨"으로 판단한다. useMemo와 useCallback은 이 참조를 안정화하는 도구다.

### 1.2 "모든 렌더링이 문제인 것은 아니다"

Step 4에서 배운 핵심: **렌더링 = 함수 실행.** 매 렌더링마다 컴포넌트 함수가 다시 호출되고 새 React Element 트리가 만들어진다. 이것은 **React의 정상적인 동작**이다.

```
흔한 오해:
  "재렌더링이 발생한다 = 성능 문제이다" → 틀림!

진실:
  · React의 렌더링(함수 호출 + Element 생성)은 매우 빠르다
  · Reconciliation이 변경된 부분만 DOM에 반영한다
  · 대부분의 재렌더링은 사용자가 느끼지 못할 만큼 빠르다
  · 성능 문제는 "느린 렌더링"이 발생할 때만 최적화한다

Donald Knuth의 원칙:
  "성급한 최적화는 모든 악의 근원이다"
  (Premature optimization is the root of all evil)
```

### 1.3 최적화가 필요한 실제 상황과 불필요한 상황

```
최적화가 필요한 신호:

  1. 사용자가 입력할 때 화면이 버벅인다 (입력 지연)
  2. 스크롤이 부드럽지 않다 (프레임 드롭)
  3. 버튼 클릭 후 반응이 늦다 (> 100ms)
  4. 리스트가 매우 크다 (1000개+ 항목)
  5. 복잡한 계산이 매 렌더링마다 반복된다
  6. 차트/캔버스가 불필요하게 다시 그려진다

최적화가 불필요한 상황:

  · "재렌더링 횟수가 많은 것 같다" (느끼지 못하면 문제 아님)
  · "이 계산이 비효율적인 것 같다" (측정 없이 짐작)
  · "모범 사례라서 모든 곳에 memo를 적용해야 한다" (과도한 최적화)
```

### 1.4 이 Step의 학습 지도 (개념 지도)

![메모이제이션 개념 지도](/developer-open-book/diagrams/react-step14-concept-map.svg)

### 1.5 이 Step에서 다루는 범위

![Step 14 다루는 범위](/developer-open-book/diagrams/react-step14-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                     | 정의                                                                                            | 왜 중요한가                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Memoization**          | 이전 계산 결과를 **캐싱**하여 같은 입력이 들어오면 재계산 없이 캐시를 반환하는 기법             | 불필요한 재계산과 재생성을 방지한다                        |
| **useMemo**              | 의존성이 변하지 않으면 이전 **계산 결과를 재사용**하는 Hook                                     | 비용이 큰 계산을 매 렌더링마다 반복하지 않는다             |
| **useCallback**          | 의존성이 변하지 않으면 이전 **함수 참조를 재사용**하는 Hook. `useMemo(() => fn, deps)`의 축약형 | React.memo와 결합하여 자식의 불필요한 재렌더링을 방지한다  |
| **React.memo**           | Props가 변하지 않으면 컴포넌트의 **재렌더링을 건너뛰는** 고차 컴포넌트(HOC)                     | 부모 재렌더링 시 자식의 불필요한 재렌더링을 차단한다       |
| **Referential Identity** | **참조 동일성**. 두 값이 메모리 상 같은 객체/함수를 가리키는 것 (`===` true)                    | 얕은 비교 기반의 React.memo, useEffect 의존성에서 핵심이다 |
| **Shallow Comparison**   | 객체의 각 속성을 `===`로 비교하는 방식. 중첩 객체 내부는 비교하지 않는다                        | React.memo의 기본 비교 방식이다                            |
| **Profiler**             | React DevTools의 **성능 측정 도구**. 컴포넌트별 렌더링 시간과 원인을 분석                       | "측정 없이 최적화하지 않는다" 원칙의 실천 도구이다         |
| **React Compiler**       | 빌드 타임에 useMemo/useCallback을 **자동으로 삽입**하는 도구 (구 React Forget)                  | 수동 메모이제이션의 필요성을 줄이는 미래 방향이다          |

### 2.2 참조 동일성이 왜 핵심 문제인가

![참조 동일성 설명](/developer-open-book/diagrams/react-step14-reference-equality.svg)

![React에서 매 렌더링마다 일어나는 일](/developer-open-book/diagrams/react-step14-reference-equality.svg)

### 2.3 세 도구의 관계

![메모이제이션 도구의 관계](/developer-open-book/diagrams/react-step14-memo-tools.svg)

---

## 3. 이론과 원리

### 3.1 왜 "참조 동일성"이 문제인가

Step 4에서 배운 것을 복습하자: **렌더링 = 함수 실행.** 함수가 다시 호출되면 내부의 모든 변수, 객체, 함수가 **새로 생성**된다.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // 매 렌더링마다 새로운 객체가 생성됨
  const style = { color: "red", fontSize: 16 };
  // Object.is(이전style, 새style) → false (다른 참조!)

  // 매 렌더링마다 새로운 함수가 생성됨
  const handleClick = () => console.log("click");
  // Object.is(이전handleClick, 새handleClick) → false (다른 참조!)

  // 매 렌더링마다 새로운 배열이 생성됨
  const items = data.filter((d) => d.active);
  // Object.is(이전items, 새items) → false (다른 참조!)

  return <Child style={style} onClick={handleClick} items={items} />;
}
```

```
결과:

  · Child가 React.memo로 감싸져 있어도
  · style, onClick, items의 참조가 매번 달라지므로
  · React.memo의 얕은 비교: "Props가 변했다!" → 재렌더링!
  · React.memo가 무용지물이 된다

  · items를 useEffect의 의존성에 넣으면
  · 매 렌더링마다 새 배열 참조 → "의존성이 변했다!" → Effect 재실행!
  · 무한 루프 위험 (Step 11에서 학습)
```

### 3.2 useMemo — 계산 결과 캐싱

#### API와 기본 사용법

```jsx
const memoizedValue = useMemo(
  () => expensiveCalculation(a, b), // 계산 함수
  [a, b], // 의존성 배열
);

// 동작:
// · 첫 렌더링: expensiveCalculation(a, b) 실행, 결과 캐싱
// · 이후 렌더링:
//   · a, b가 변하지 않으면 → 캐시된 결과 반환 (재계산 안 함)
//   · a 또는 b가 변하면 → 다시 계산, 새 결과 캐싱
```

#### 용도 1: 비용이 큰 계산의 캐싱

```jsx
function ProductList({ products, filter, sortBy }) {
  // ❌ 매 렌더링마다 필터링 + 정렬 재실행 (다른 State 변경 시에도!)
  const displayProducts = products
    .filter((p) => matchesFilter(p, filter))
    .sort((a, b) => compareBy(a, b, sortBy));

  // ✅ products, filter, sortBy가 변할 때만 재계산
  const displayProducts = useMemo(
    () =>
      products
        .filter((p) => matchesFilter(p, filter))
        .sort((a, b) => compareBy(a, b, sortBy)),
    [products, filter, sortBy],
  );

  return (
    <ul>
      {displayProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
```

```
언제 useMemo가 효과적인가

  · 배열이 크다 (1000개+ 항목의 filter/sort/map)
  · 계산이 복잡하다 (중첩 루프, 재귀, 정규식 등)
  · 다른 State 변경 시에도 이 계산이 반복된다
    예: count가 변해도 products 필터링이 다시 실행됨

  언제 useMemo가 불필요한가

  · 배열이 작다 (수십 개 항목)
  · 계산이 단순하다 (문자열 연결, 숫자 연산)
  · 해당 의존성이 변할 때만 렌더링된다 (어차피 재계산 필요)
```

#### 용도 2: 참조 안정화 (객체/배열)

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("dark");

  // ❌ count가 변할 때마다 새 객체 → Child가 재렌더링
  const config = { theme, fontSize: 16 };

  // ✅ theme이 변할 때만 새 객체 → count 변경 시 Child 재렌더링 방지
  const config = useMemo(() => ({ theme, fontSize: 16 }), [theme]);

  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <MemoizedChild config={config} />
    </>
  );
}

const MemoizedChild = React.memo(function Child({ config }) {
  console.log("Child 렌더링");
  return (
    <div style={{ color: config.theme === "dark" ? "#fff" : "#000" }}>
      설정 적용
    </div>
  );
});
```

#### useMemo의 캐싱 동작 원리

```
useMemo 내부 동작

  첫 렌더링:
    · 계산 함수 실행 → 결과 저장
    · 의존성 배열의 현재 값을 기억

  이후 렌더링:
    · 새 의존성 배열과 이전 의존성 배열을 Object.is()로 비교
    · 모두 같으면 → 저장된 결과 반환 (함수 실행 안 함)
    · 하나라도 다르면 → 함수 재실행, 새 결과 저장

  중요: useMemo는 "성능 최적화"가 목적
        React가 필요에 따라 캐시를 지울 수 있다
        (예: 메모리 압박 시)
        → 항상 캐시가 유지된다고 가정하지 말 것
```

### 3.3 useCallback — 함수 참조 안정화

#### API와 기본 사용법

```jsx
const memoizedFn = useCallback(
  (args) => {
    /* 함수 본문 */
  },
  [dependency1, dependency2],
);

// 동작:
// · 첫 렌더링: 함수를 생성하고 캐싱
// · 이후 렌더링:
//   · 의존성이 변하지 않으면 → 캐시된 함수 참조 반환
//   · 의존성이 변하면 → 새 함수 생성, 캐싱
```

#### useCallback은 useMemo의 함수 전용 축약형

```jsx
// 이 두 줄은 완전히 동일하다
const memoizedFn = useCallback(fn, deps);
const memoizedFn = useMemo(() => fn, deps);

// useCallback은 "함수를 메모이제이션한다"
// useMemo는 "값을 메모이제이션한다"
// 함수도 값이므로 useMemo로 함수를 메모이제이션할 수 있지만
// useCallback이 더 간결하고 의도가 명확하다
```

#### React.memo와의 결합

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  // ❌ 매 렌더링마다 새 함수 → MemoizedChild가 재렌더링
  const handleAddTodo = (text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text }]);
  };

  // ✅ setTodos는 안정적인 참조 → 의존성 없음 → 함수 참조 안정
  const handleAddTodo = useCallback((text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text }]);
  }, []);
  // Updater Function(prev => ...)을 사용하므로 todos를 의존성에 넣지 않아도 됨

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      {/* count가 변해도 AddTodoForm은 재렌더링되지 않는다 */}
      <AddTodoForm onAdd={handleAddTodo} />
    </div>
  );
}

const AddTodoForm = React.memo(function AddTodoForm({ onAdd }) {
  console.log("AddTodoForm 렌더링");
  const [text, setText] = useState("");

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          onAdd(text);
          setText("");
        }}
      >
        추가
      </button>
    </div>
  );
});
```

```
useCallback이 효과적인 조건 (3가지가 모두 충족되어야 함)

  1. 함수가 자식 컴포넌트에 Props로 전달된다
  2. 그 자식이 React.memo로 감싸져 있다
  3. 부모의 다른 State 변경으로 인해 불필요한 재렌더링이 발생한다

  하나라도 해당하지 않으면 useCallback의 효과가 없다!

  · 자식이 React.memo가 아니면? → 어차피 재렌더링 (useCallback 무의미)
  · 함수를 Props로 전달하지 않고 자체 사용? → 참조 안정화 불필요
  · 의존성이 매 렌더링마다 바뀌면? → 매번 새 함수 (useCallback 무의미)
```

### 3.4 React.memo — 컴포넌트 재렌더링 건너뛰기

#### API와 동작 원리

```jsx
// 기본 사용: Props의 얕은 비교
const MemoizedComponent = React.memo(function MyComponent({ name, age }) {
  console.log("렌더링!");
  return (
    <p>
      {name}, {age}세
    </p>
  );
});

// 커스텀 비교 함수 제공
const MemoizedComponent = React.memo(
  function MyComponent({ data }) {
    return <p>{data.name}</p>;
  },
  (prevProps, nextProps) => {
    // true 반환 → 렌더링 건너뜀 (Props가 같다)
    // false 반환 → 재렌더링 (Props가 다르다)
    return prevProps.data.id === nextProps.data.id;
  },
);
```

```
React.memo의 동작 과정

  부모 재렌더링 발생
       │
       ▼
  React.memo가 Props 비교 실행
  (기본: Object.is로 각 Prop을 얕은 비교)
       │
       ├── 모든 Props가 같다 → 렌더링 건너뜀 ✅ (이전 결과 재사용)
       │
       └── 하나라도 다르다 → 재렌더링 실행 ❌
```

#### React.memo가 효과적인 경우와 아닌 경우

```
효과적인 경우:

  1. 부모가 자주 재렌더링되지만 자식의 Props는 잘 변하지 않을 때
     예: 상위 State가 변해도 특정 자식의 Props는 고정

  2. 자식의 렌더링 비용이 클 때
     예: 복잡한 차트, 긴 리스트, 무거운 계산을 포함하는 컴포넌트

  3. Props가 원시값(문자열, 숫자, boolean)일 때
     → 참조 비교 = 값 비교이므로 useMemo/useCallback 없이도 효과적


효과적이지 않은 경우:

  1. Props에 매 렌더링마다 새로 생성되는 객체/함수가 있을 때
     → useMemo/useCallback으로 참조를 안정화하지 않으면 무용지물

  2. 자식의 렌더링 비용이 낮을 때
     → memo의 비교 비용이 렌더링 비용보다 클 수 있다

  3. 대부분의 렌더링에서 Props가 실제로 변할 때
     → 비교만 하고 어차피 재렌더링 → 오히려 비용 증가
```

### 3.5 세 도구의 결합 패턴

#### 완전한 최적화 예시

```jsx
function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [data] = useState(generateLargeDataset()); // 10,000개 항목

  // ① useMemo: 비용이 큰 필터링 결과를 캐싱
  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [data, searchQuery],
  );

  // ② useCallback: 이벤트 핸들러 참조 안정화
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  // ③ useMemo: 선택된 항목을 캐싱 (selectedId가 변할 때만 재계산)
  const selectedItem = useMemo(
    () => data.find((item) => item.id === selectedId),
    [data, selectedId],
  );

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="검색..."
      />
      {/* ④ React.memo: Props가 변하지 않으면 재렌더링 건너뜀 */}
      <DataList
        items={filteredData}
        onSelect={handleSelect}
        selectedId={selectedId}
      />
      {selectedItem && <DetailPanel item={selectedItem} />}
    </div>
  );
}

// ④ React.memo로 감싸기
const DataList = React.memo(function DataList({ items, onSelect, selectedId }) {
  console.log("DataList 렌더링, 항목 수:", items.length);
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onSelect(item.id)}
          style={{ fontWeight: item.id === selectedId ? "bold" : "normal" }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
});

const DetailPanel = React.memo(function DetailPanel({ item }) {
  console.log("DetailPanel 렌더링");
  return (
    <div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
    </div>
  );
});
```

```
최적화 흐름 분석

  검색어 입력 시 (searchQuery 변경):
    · filteredData: 재계산 ✅ (searchQuery가 변했으므로)
    · handleSelect: 재사용 ✅ (의존성 없으므로 참조 동일)
    · selectedItem: 재사용 ✅ (selectedId가 변하지 않았으므로)
    · DataList: 재렌더링 ✅ (items가 변했으므로 — 정상적인 재렌더링)
    · DetailPanel: 건너뜀 ✅ (item 참조가 동일하므로)

  항목 선택 시 (selectedId 변경):
    · filteredData: 재사용 ✅ (searchQuery가 변하지 않았으므로)
    · handleSelect: 재사용 ✅ (참조 동일)
    · selectedItem: 재계산 ✅ (selectedId가 변했으므로)
    · DataList: 재렌더링 ✅ (selectedId가 변했으므로 — 정상)
    · DetailPanel: 재렌더링 ✅ (item이 변했으므로 — 정상)
```

### 3.6 "언제 쓰지 말아야 하는가" — 과도한 최적화의 비용

#### 메모이제이션 자체의 비용

```
메모이제이션은 "공짜"가 아니다

  useMemo/useCallback의 비용:
    · 의존성 배열을 매 렌더링마다 비교해야 한다
    · 이전 값을 메모리에 캐싱해야 한다
    · 코드 복잡성이 증가한다 (의존성 배열 관리)
    · 의존성을 잘못 작성하면 버그가 발생한다 (stale value)

  React.memo의 비용:
    · 모든 Props를 얕은 비교해야 한다
    · Props가 많으면 비교 자체가 비용이 된다
    · Props가 대부분의 렌더링에서 변한다면 비교만 하고 어차피 재렌더링

  비용 > 이득인 경우:
    · 단순한 컴포넌트 (렌더링 비용 < 비교 비용)
    · 의존성이 매번 변하는 경우 (캐시 적중률 0%)
    · Props가 원시값뿐인 간단한 컴포넌트
```

#### 불필요한 메모이제이션 패턴

```jsx
// ❌ 불필요 1: 단순 계산에 useMemo
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName],
);
// 문자열 연결은 매우 빠르다 → useMemo 비용이 더 클 수 있다
// ✅ 그냥 계산
const fullName = `${firstName} ${lastName}`;

// ❌ 불필요 2: React.memo 없이 useCallback만 사용
function Parent() {
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return <Child onClick={handleClick} />;
  //     ↑ React.memo로 감싸지 않은 컴포넌트
  //     → Parent가 재렌더링되면 Child도 재렌더링 (useCallback 무의미!)
}

// ❌ 불필요 3: 모든 컴포넌트에 React.memo
const Button = React.memo(function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
});
// Button의 렌더링 비용이 매우 낮다
// memo의 Props 비교 비용 ≥ 렌더링 비용
// → 최적화 효과 없음, 코드만 복잡해짐

// ❌ 불필요 4: 의존성이 매번 변하는 useMemo
function Component({ items }) {
  // items가 매 렌더링마다 새 배열이면 useMemo가 매번 재계산
  const sorted = useMemo(() => [...items].sort(), [items]);
  // → items의 참조가 안정적이지 않으면 의미 없음
}
```

#### "사용해야 하는가?" 판단 체크리스트

```
useMemo 사용 판단:
  □ 이 계산이 "느리다"는 측정 근거가 있는가?
  □ 계산에 사용되는 데이터가 크거나 로직이 복잡한가?
  □ 이 결과가 React.memo된 자식의 Props로 전달되는가?
  □ 이 결과가 useEffect의 의존성에 포함되는가?
  → 하나 이상 YES면 useMemo 고려

useCallback 사용 판단:
  □ 이 함수가 React.memo된 자식에 Props로 전달되는가?
  □ 이 함수가 useEffect의 의존성에 포함되는가?
  □ 이 함수가 다른 useCallback/useMemo의 의존성인가?
  → 하나 이상 YES면 useCallback 고려

React.memo 사용 판단:
  □ 부모가 자주 재렌더링되는가?
  □ 이 컴포넌트의 렌더링 비용이 큰가?
  □ Props가 자주 변하지 않는가?
  → 모두 YES면 React.memo 고려
```

### 3.7 React Profiler — 측정 기반 최적화

#### "측정 없이 최적화하지 않는다"

```
최적화 워크플로우

  1. 성능 문제를 체감한다
     · "입력이 느리다", "스크롤이 버벅인다"

  2. React DevTools Profiler로 측정한다
     · 어떤 컴포넌트가 느린가?
     · 왜 재렌더링되는가?
     · 렌더링에 얼마나 걸리는가?

  3. 병목을 식별한다
     · "ProductList가 50ms 걸리고 불필요하게 재렌더링된다"

  4. 최소한의 최적화를 적용한다
     · React.memo + useMemo/useCallback

  5. 다시 측정하여 효과를 확인한다
     · "50ms → 5ms로 개선되었다"

  ※ 2번을 건너뛰고 3~4번으로 가면 "성급한 최적화"이다
```

#### Profiler 사용법 개요

```
React DevTools Profiler 탭

  1. "Record" 버튼 클릭
  2. 문제가 되는 상호작용 수행 (입력, 클릭 등)
  3. "Stop" 버튼 클릭
  4. 결과 분석:

  Flamegraph (불꽃 그래프):
    · 각 컴포넌트의 렌더링 시간을 막대로 표시
    · 노란색/빨간색 → 느린 컴포넌트
    · 회색 → 렌더링 건너뜀 (React.memo 등)
    · 막대가 넓을수록 시간이 오래 걸림

  Ranked (순위):
    · 렌더링 시간이 긴 컴포넌트부터 정렬
    · 가장 위에 있는 것이 최적화 대상 후보

  Why did this render? (왜 렌더링되었는가):
    · "Props changed" → 어떤 Prop이 변했는지 확인
    · "State changed" → 어떤 State가 변했는지 확인
    · "Parent rendered" → 부모 때문에 재렌더링
    · → React.memo로 차단 가능한지 판단
```

#### Profiler API (코드 내 측정)

```jsx
import { Profiler } from "react";

function App() {
  const onRender = (id, phase, actualDuration, baseDuration) => {
    console.log({
      id, // Profiler의 id
      phase, // "mount" 또는 "update"
      actualDuration, // 실제 렌더링 시간 (ms)
      baseDuration, // 메모이제이션 없이 전체 렌더링 시간 (ms)
    });
  };

  return (
    <Profiler id="ProductList" onRender={onRender}>
      <ProductList items={items} />
    </Profiler>
  );
}

// 출력 예시:
// { id: 'ProductList', phase: 'update', actualDuration: 2.3, baseDuration: 45.1 }
// → React.memo 덕분에 45ms가 아닌 2.3ms로 렌더링됨
```

### 3.8 React Compiler와 메모이제이션의 미래

#### React Compiler의 핵심 아이디어

```
현재 (수동 메모이제이션):

  · 개발자가 useMemo, useCallback, React.memo를 직접 판단하고 적용
  · 의존성 배열을 수동으로 관리
  · 실수하기 쉽고, 코드가 복잡해진다

React Compiler (자동 메모이제이션):

  · 빌드 타임에 Compiler가 코드를 분석
  · 필요한 곳에 자동으로 메모이제이션을 삽입
  · 개발자는 "순수한 코드"만 작성하면 된다
  · 의존성 배열 실수가 원천 차단됨
```

```jsx
// 개발자가 작성하는 코드 (React Compiler 사용 시)
function ProductList({ products, filter }) {
  const filtered = products.filter((p) => p.category === filter);
  const handleClick = (id) => {
    /* ... */
  };

  return filtered.map((p) => (
    <ProductCard key={p.id} product={p} onClick={handleClick} />
  ));
}

// Compiler가 빌드 타임에 자동으로 변환한 결과 (개념적)
function ProductList({ products, filter }) {
  const filtered = useMemo(
    () => products.filter((p) => p.category === filter),
    [products, filter],
  );
  const handleClick = useCallback(
    (id) => {
      /* ... */
    },
    [
      /* 자동 분석된 의존성 */
    ],
  );

  return filtered.map((p) => (
    <ProductCard key={p.id} product={p} onClick={handleClick} />
  ));
}
```

```
React Compiler의 현재 상태 (2025년 기준)

  · Meta(Facebook) 내부에서 프로덕션 사용 중
  · 오픈소스로 공개, 점진적 도입 가능
  · 모든 프로젝트에서 즉시 사용할 수 있는 단계는 아직 아님
  · Compiler가 정상 동작하려면 컴포넌트가 "순수"해야 함

현재 단계에서의 권장:
  · useMemo/useCallback/React.memo를 확실히 이해한다
  · "순수한 컴포넌트 작성"을 습관화한다 (Compiler 준비)
  · 과도한 수동 최적화는 피한다 (Compiler가 대체할 것)
  · 측정 기반으로 필요한 곳에만 적용한다
```

---

## 4. 사례 연구와 예시

### 4.1 사례: useMemo 없이 발생하는 성능 문제

```jsx
// 시나리오: 10,000개 항목 리스트에서 검색 + 정렬

// ❌ 문제 코드: count만 변해도 10,000개 필터링+정렬이 재실행
function Dashboard() {
  const [count, setCount] = useState(0);     // 무관한 State
  const [query, setQuery] = useState('');
  const [items] = useState(generate10000Items());

  // count가 변할 때마다 10,000개를 다시 필터링+정렬! (약 50ms)
  const filtered = items
    .filter(item => item.name.includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        카운트: {count}
      </button>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <VirtualList items={filtered} />
    </div>
  );
}

// ✅ 개선: useMemo로 query가 변할 때만 재계산
function Dashboard() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [items] = useState(generate10000Items());

  const filtered = useMemo(
    () => items
      .filter(item => item.name.includes(query))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [items, query]  // count가 없으므로 count 변경 시 재계산 안 함
  );

  return (/* 동일 */);
}
```

### 4.2 사례: React.memo가 무용지물이 되는 패턴

```jsx
// ❌ 인라인 객체/함수를 Props로 전달 → React.memo 무효화

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <MemoizedChild
      // 매 렌더링마다 새 객체 → 비교 실패 → 재렌더링!
      style={{ color: "red" }}
      // 매 렌더링마다 새 함수 → 비교 실패 → 재렌더링!
      onClick={() => console.log("click")}
      // 매 렌더링마다 새 배열 → 비교 실패 → 재렌더링!
      items={[1, 2, 3]}
    />
  );
}

const MemoizedChild = React.memo(function Child({ style, onClick, items }) {
  console.log("Child 렌더링!"); // 매번 출력됨 — memo가 작동하지 않는다!
  return <div style={style}>내용</div>;
});

// ✅ 참조를 안정화하면 React.memo가 올바르게 작동

function Parent() {
  const [count, setCount] = useState(0);

  const style = useMemo(() => ({ color: "red" }), []);
  const handleClick = useCallback(() => console.log("click"), []);
  const items = useMemo(() => [1, 2, 3], []);

  return (
    <MemoizedChild style={style} onClick={handleClick} items={items} />
    // count가 변해도 MemoizedChild는 재렌더링되지 않는다!
  );
}
```

### 4.3 사례: 과도한 최적화가 오히려 해로운 경우

```jsx
// ❌ 모든 곳에 메모이제이션을 적용한 코드 (과도한 최적화)
function OverOptimized() {
  const [name, setName] = useState("");

  // 문자열 대문자 변환에 useMemo? → 과도
  const upperName = useMemo(() => name.toUpperCase(), [name]);

  // 단순 이벤트 핸들러에 useCallback? → 과도
  const handleChange = useCallback((e) => setName(e.target.value), []);

  // 단순 조건에 useMemo? → 과도
  const isValid = useMemo(() => name.length > 0, [name]);

  return (
    <div>
      <MemoizedInput value={name} onChange={handleChange} />
      <MemoizedDisplay text={upperName} isValid={isValid} />
    </div>
  );
}

// 이 코드의 문제:
// · 모든 계산이 매우 단순 (< 0.01ms)
// · useMemo/useCallback의 의존성 비교 비용 > 재계산 비용
// · 코드가 불필요하게 복잡해짐
// · 의존성 배열 실수 위험 증가
// · 다른 개발자가 "왜 memo가 필요한지" 이해하기 어려움

// ✅ 단순하게 작성 (실제로 더 빠를 수 있다)
function Simple() {
  const [name, setName] = useState("");
  const upperName = name.toUpperCase();
  const isValid = name.length > 0;

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>{upperName}</p>
      <p>{isValid ? "유효" : "입력 필요"}</p>
    </div>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 메모이제이션 적용 판단 연습 [Analyzing · Evaluating]

**목표:** 각 상황에서 메모이제이션이 필요한지 판단하고 근거를 제시한다.

아래 10가지 시나리오에서 useMemo, useCallback, React.memo 중 어떤 것이 필요한지(또는 불필요한지) 판단하라.

```
시나리오 1: const doubled = count * 2;
시나리오 2: const sorted = [...items].sort((a, b) => a.price - b.price);
           (items는 5,000개 상품 배열)
시나리오 3: const handleClick = () => setIsOpen(true);
           (React.memo된 Modal에 Props로 전달)
시나리오 4: const label = `${user.name} (${user.role})`;
시나리오 5: const chartData = computeChartData(rawData, filters);
           (복잡한 통계 계산, rawData 10,000개)
시나리오 6: <Button onClick={() => navigate('/home')}>홈</Button>
           (Button은 React.memo 아님)
시나리오 7: const filteredUsers = users.filter(u => u.active);
           (users는 20개, 부모가 초당 10번 재렌더링)
시나리오 8: const theme = { primary: '#007bff', secondary: '#6c757d' };
           (React.memo된 ThemeProvider에 전달)
시나리오 9: const handleSubmit = async () => { await fetch(...) };
           (form의 onSubmit에 전달, React.memo 아님)
시나리오 10: const csvData = generateCSV(records);
            (records 50,000개, 내보내기 버튼 클릭 시에만 필요)
```

---

### 실습 2: 성능 문제 최적화 [Applying]

**목표:** 실제 성능 문제가 있는 코드를 최적화한다.

아래 코드에서 불필요한 재렌더링과 불필요한 재계산을 식별하고 최적화하라.

```jsx
function ExpensiveApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  // 10,000개 상품 데이터
  const products = generateProducts(10000);

  // 필터링 + 정렬 (매 렌더링마다 실행)
  const displayProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(
      (p) => selectedCategory === "all" || p.category === selectedCategory,
    )
    .sort((a, b) => b.rating - a.rating);

  const handleSelectProduct = (id) => {
    console.log("선택:", id);
  };

  return (
    <div className={darkMode ? "dark" : "light"}>
      <button onClick={() => setDarkMode((d) => !d)}>테마 전환</button>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <ProductGrid products={displayProducts} onSelect={handleSelectProduct} />
    </div>
  );
}

function ProductGrid({ products, onSelect }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ProductCard({ product, onSelect }) {
  return (
    <div onClick={() => onSelect(product.id)}>
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()}원</p>
    </div>
  );
}
```

**최적화 포인트:**

- generateProducts가 매 렌더링마다 호출되는 문제
- 테마 전환 시 필터링/정렬이 재실행되는 문제
- handleSelectProduct의 참조 안정화
- React.memo 적용 대상 컴포넌트 선정

---

### 실습 3: Profiler로 측정하고 최적화 [Evaluating]

**목표:** 측정 → 병목 식별 → 최적화 → 재측정의 워크플로우를 실천한다.

```
과제:
  1. 실습 2의 코드를 실행하고 React DevTools Profiler로 측정
  2. 가장 렌더링 시간이 긴 컴포넌트를 식별
  3. "Why did this render?" 정보 확인
  4. 최적화 적용
  5. 다시 측정하여 개선 효과를 수치로 확인
  6. 최적화 전후 비교 보고서 작성

보고서 형식:
  | 컴포넌트 | 최적화 전 (ms) | 최적화 후 (ms) | 적용한 기법 |
  |---------|---------------|---------------|-----------|
  | ProductGrid | 45ms | 3ms | React.memo |
  | ...     | ...           | ...           | ...       |
```

---

### 실습 4 (선택): 불필요한 메모이제이션 제거 [Evaluating]

**목표:** 과도한 최적화를 식별하고 제거한다.

아래 코드에서 **불필요한** useMemo/useCallback/React.memo를 모두 찾아 제거하고, 제거 근거를 제시하라.

```jsx
const Title = React.memo(function Title({ text }) {
  return <h1>{text}</h1>;
});

function App() {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  const greeting = useMemo(() => `안녕하세요, ${name}님`, [name]);
  const isEven = useMemo(() => count % 2 === 0, [count]);
  const handleNameChange = useCallback((e) => setName(e.target.value), []);
  const handleIncrement = useCallback(() => setCount((c) => c + 1), []);
  const buttonStyle = useMemo(() => ({ padding: "8px 16px" }), []);

  return (
    <div>
      <Title text={greeting} />
      <input value={name} onChange={handleNameChange} />
      <button onClick={handleIncrement} style={buttonStyle}>
        {count}
      </button>
      <p>{isEven ? "짝수" : "홀수"}</p>
    </div>
  );
}
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 14 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. useMemo = 비용이 큰 계산 결과를 캐싱한다                  │
│     → 의존성이 변하지 않으면 이전 결과를 재사용                │
│     → 큰 배열의 filter/sort, 복잡한 계산에 적합               │
│     → 참조 안정화 용도로도 사용 (객체/배열)                   │
│                                                               │
│  2. useCallback = 함수 참조를 안정화한다                      │
│     → useMemo(() => fn, deps)의 축약형                       │
│     → React.memo된 자식에 콜백을 전달할 때 의미 있다          │
│     → 단독으로는 효과 없음 — React.memo와 결합해야 함         │
│                                                               │
│  3. React.memo = Props 비교로 재렌더링을 건너뛴다             │
│     → 부모 재렌더링 시 자식의 불필요한 재렌더링 차단          │
│     → Props에 객체/함수가 있으면 useMemo/useCallback 병행     │
│     → 렌더링 비용이 큰 컴포넌트에 효과적                     │
│                                                               │
│  4. 참조 동일성(Referential Identity)이 핵심이다              │
│     → 매 렌더링마다 새 객체/함수가 생성된다                   │
│     → 얕은 비교(Object.is)에서 다른 참조 = "변경됨"           │
│     → useMemo/useCallback으로 참조를 안정화한다              │
│                                                               │
│  5. 과도한 최적화는 오히려 해롭다                             │
│     → 메모이제이션 자체에 비용이 있다 (비교 + 캐시)           │
│     → 단순 계산, 작은 컴포넌트에는 불필요하다                 │
│     → 의존성 배열 실수 → 버그 발생 위험                      │
│     → 코드 복잡성 증가 → 유지보수 부담                       │
│                                                               │
│  6. "측정 없이 최적화하지 않는다"                              │
│     → React DevTools Profiler로 병목 식별                    │
│     → 느린 컴포넌트를 찾아 최소한의 최적화 적용               │
│     → 적용 후 다시 측정하여 효과 확인                        │
│                                                               │
│  7. React Compiler가 수동 메모이제이션을 대체할 것이다         │
│     → 빌드 타임에 자동으로 useMemo/useCallback 삽입          │
│     → 현재: 원리를 이해하되 과도한 수동 최적화는 피한다       │
│     → "순수한 컴포넌트 작성"이 Compiler 준비의 핵심           │
│                                                               │
│  8. 최적화 적용 순서                                          │
│     → 1단계: 문제 체감 → 2단계: Profiler 측정                │
│     → 3단계: 병목 식별 → 4단계: 최소 최적화 적용             │
│     → 5단계: 재측정으로 효과 확인                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                   | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | useMemo, useCallback, React.memo 각각의 역할을 한 문장으로 설명하라                    | Remember   | 3.2~3.4     |
| 2   | 매 렌더링마다 `{ color: 'red' }` 객체가 새로 생성되는 것이 React.memo에 미치는 영향은? | Understand | 3.1         |
| 3   | useCallback이 단독으로는 효과 없고 React.memo와 결합해야 하는 이유는?                  | Understand | 3.3         |
| 4   | useMemo/useCallback의 의존성이 매번 변한다면 메모이제이션이 무의미한 이유는?           | Understand | 3.6         |
| 5   | `const doubled = count * 2`에 useMemo를 적용하지 않아야 하는 이유는?                   | Analyze    | 3.6         |
| 6   | React.memo된 컴포넌트에 인라인 함수 `onClick={() => ...}`를 전달하면 일어나는 일은?    | Analyze    | 4.2         |
| 7   | "측정 없이 최적화하지 않는다" 원칙의 근거 2가지는?                                     | Evaluate   | 3.7         |
| 8   | React Compiler가 활성화되면 현재의 useMemo/useCallback 사용 패턴이 어떻게 변하는가?    | Evaluate   | 3.8         |

### 6.3 FAQ

**Q1. useMemo와 useCallback을 항상 함께 써야 하나요?**

아닙니다. 각각 독립적으로 사용 가능합니다. useMemo는 "비용이 큰 계산 결과" 또는 "참조를 안정화해야 하는 객체/배열"에, useCallback은 "React.memo된 자식에 전달하는 함수"나 "useEffect 의존성에 포함되는 함수"에 사용합니다. 두 가지가 동시에 필요한 상황도 있지만, 각각의 목적에 맞게 독립적으로 판단하는 것이 맞습니다.

**Q2. React.memo의 커스텀 비교 함수를 쓰면 더 성능이 좋아지나요?**

항상 그런 것은 아닙니다. 커스텀 비교 함수는 기본 얕은 비교(Props 전체를 Object.is로 비교)를 대체합니다. Props가 복잡한 중첩 객체라서 얕은 비교가 불필요한 재렌더링을 일으킬 때 유용합니다. 그러나 커스텀 비교 함수 자체도 비용이 있으며, 잘못 작성하면(예: 항상 true 반환) 실제 변경을 놓치는 버그가 생깁니다. "기본 얕은 비교로 충분한지"를 먼저 확인하세요.

**Q3. useMemo 안에서 발생하는 에러는 어떻게 처리하나요?**

useMemo 안의 계산 함수가 에러를 던지면, 그 에러는 컴포넌트 렌더링 중에 발생한 것으로 처리됩니다. 가장 가까운 Error Boundary가 잡거나, Error Boundary가 없으면 앱 전체가 중단됩니다. useMemo 안에서는 try-catch로 에러를 처리하거나, 에러 가능성이 있는 계산은 useMemo 밖에서 처리하고 안전한 값만 useMemo에 전달하는 방식을 권장합니다.

**Q4. children을 Props로 받는 컴포넌트에 React.memo를 적용하면 효과가 없나요?**

맞습니다. JSX는 `React.createElement()` 호출이므로, `<Component><Child /></Component>`에서 children은 매 렌더링마다 새로 생성된 React Element입니다. 참조가 다르므로 React.memo의 얕은 비교는 "Props가 변했다"고 판단합니다. children을 안정화하려면 부모 쪽에서 children을 `useMemo`로 감싸거나, 컴포넌트 구조를 재설계하는 것이 필요합니다. 이런 이유로 children을 받는 레이아웃 컴포넌트에는 React.memo가 비효과적인 경우가 많습니다.

**Q5. React 19로 업그레이드하면 기존의 useMemo/useCallback 코드를 제거해야 하나요?**

React 19의 Compiler는 기존 코드와 호환됩니다. Compiler를 도입하면 이미 작성된 useMemo/useCallback이 중복될 수 있지만, 에러를 일으키지는 않습니다. 다만 Compiler가 자동으로 최적화한 부분에 수동 메모이제이션을 추가해도 의미가 없으므로, 장기적으로는 수동 최적화를 점진적으로 제거하는 것이 권장됩니다. 지금 당장 모든 코드를 바꿀 필요는 없고, 신규 코드에서 Compiler 스타일(메모이제이션 없이 순수하게 작성)을 적용하는 것으로 시작하면 됩니다.

---

## 7. 다음 단계 예고

> **Step 15. React 18/19 신규 Hooks**
>
> - useTransition: 긴급하지 않은 업데이트를 전환으로 표시
> - useDeferredValue: 값의 업데이트를 지연
> - useId: 서버/클라이언트 일관된 고유 ID 생성
> - React 19의 use() Hook: Promise와 Context 읽기
> - useActionState: 폼 Action의 상태 관리
> - useOptimistic: 낙관적 업데이트

---

## 📚 참고 자료

- [React 공식 문서 — useMemo Reference](https://react.dev/reference/react/useMemo)
- [React 공식 문서 — useCallback Reference](https://react.dev/reference/react/useCallback)
- [React 공식 문서 — memo Reference](https://react.dev/reference/react/memo)
- [React 공식 문서 — Profiler](https://react.dev/reference/react/Profiler)
- [React 공식 문서 — React Compiler](https://react.dev/learn/react-compiler)
- [Kent C. Dodds — When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 14 of 42
