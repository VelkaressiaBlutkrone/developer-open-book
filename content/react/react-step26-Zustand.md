# Step 26. 전역 상태 관리 (Zustand)

> **난이도:** 🔴 고급 (Advanced)

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Remember**   | Zustand의 store, selector, set, get의 역할을 기술할 수 있다                               |
| **Understand** | Zustand가 Context 없이 전역 상태를 관리하는 원리를 설명할 수 있다                         |
| **Understand** | selector 기반 부분 구독이 Context의 리렌더링 문제를 해결하는 원리를 설명할 수 있다        |
| **Apply**      | Zustand store를 설계하고 컴포넌트에서 활용할 수 있다                                      |
| **Analyze**    | Context, Zustand, Redux Toolkit의 차이를 분석하고 각각의 적합한 시나리오를 식별할 수 있다 |
| **Evaluate**   | 프로젝트의 상태 관리 아키텍처를 설계하고 도구 선택을 판단할 수 있다                       |

**전제 지식:**

- Step 6: useState, Immutable 업데이트
- Step 13: useReducer, action 패턴
- Step 14: React.memo, 메모이제이션
- Step 25: Context API, 리렌더링 문제, Context 적합/부적합 판단

---

## 1. 서론 — Context를 넘어서

### 1.1 전역 상태 관리의 역사적 필요성

프론트엔드 애플리케이션이 단순한 정적 페이지에서 복잡한 단일 페이지 애플리케이션(SPA)으로 진화하면서, 상태 관리는 소프트웨어 공학의 핵심 과제로 부상했다. 초기 React 생태계에서는 컴포넌트 내부의 로컬 state와 Props를 통한 하향식 데이터 흐름이 권장되었으나, 앱 규모가 커지면서 "Props Drilling"이라는 구조적 문제가 반복적으로 발생했다.

2015년 Facebook은 Flux 아키텍처를 공개하며 단방향 데이터 흐름과 중앙 집중형 상태 저장소 개념을 도입했다. 이후 Redux가 Flux의 아이디어를 단순화하여 사실상 표준으로 자리잡았으나, 방대한 보일러플레이트와 가파른 학습 곡선이 개발 생산성의 걸림돌이 되었다. Context API가 React 16.3에서 공식화되었지만, 빈번한 상태 변경 시 성능 저하라는 본질적 한계를 내포하고 있었다.

이러한 역사적 배경 속에서 2021년 등장한 Zustand는 "최소한의 API로 최대의 유연성"이라는 철학을 앞세워 기존 해법들의 단점을 극복했다. Provider 없이 동작하고, selector 기반 부분 구독으로 리렌더링을 최적화하며, 번들 크기는 ~1.5KB에 불과하다.

### 1.2 Context의 한계를 다시 짚다

Step 25에서 Context의 핵심 한계를 확인했다: **Provider value가 변경되면 해당 Context를 소비하는 모든 컴포넌트가 리렌더링**되고, React.memo로도 방지할 수 없다. 이 문제는 변경이 빈번한 상태에서 심각해진다.

```
Context의 구조적 한계

  1. 부분 구독(Partial Subscription) 불가
     · { user, theme, counter } 중 counter만 변해도
     · user만 사용하는 컴포넌트도 리렌더링

  2. Provider 필수 (보일러플레이트)
     · createContext + Provider + Custom Hook
     · Provider 위치를 트리에 올바르게 배치해야 함

  3. React 트리에 종속
     · Provider 밖에서는 접근 불가
     · 유틸리티 함수, 이벤트 리스너에서 State 접근 어려움
```

실제로 장바구니 기능을 Context로 구현하면, 헤더의 카운트 아이콘·상품 카드·결제 버튼이 모두 동일한 Context를 소비하므로 어느 한 곳에서 아이템이 추가될 때마다 관련 없는 컴포넌트들까지 전부 리렌더링된다. 수십 개의 상품 카드가 있는 페이지라면 이 비용은 즉각적인 성능 저하로 이어진다.

### 1.3 Zustand의 철학과 산업적 가치

```
Zustand = 독일어로 "상태(State)"

  핵심 철학: "최소한의 API로 최대의 유연성"

  · 보일러플레이트가 거의 없다
  · Provider가 필요 없다
  · selector 기반 부분 구독으로 리렌더링 최적화
  · React 트리 밖에서도 State 접근 가능
  · 번들 크기 ~1.5KB (gzipped)
  · TypeScript 완벽 지원
```

산업 현장에서 Zustand는 2023~2024년 기준 npm 주간 다운로드 500만 회를 넘어서며 Context 기반 패턴을 대체하는 사실상의 표준으로 자리잡고 있다. 특히 스타트업과 중소 규모 팀에서는 Redux Toolkit의 복잡도 없이 빠른 개발이 가능하다는 이유로 선호된다. Vercel, Linear, Loom 등 유명 서비스들이 Zustand를 핵심 상태 관리 도구로 채택하고 있다.

### 1.4 전역 상태 관리 개념 지도

```
전역 상태 관리 개념 지도

  ┌─────────────────────────────────────────────────────────────┐
  │                  상태 관리 도구 선택 지형도                    │
  │                                                              │
  │  복잡도↑                                                     │
  │    │                                         Redux Toolkit  │
  │    │                              (대규모/팀/엄격한 패턴)     │
  │    │                    Zustand                             │
  │    │           (중규모/부분 구독/빠른 개발)                    │
  │    │      Context API                                        │
  │    │  (소규모/변경 드문 값)                                   │
  │    │  useState/useReducer                                    │
  │    │  (로컬 상태)                                            │
  │    └──────────────────────────────────────────── 규모↑      │
  │                                                              │
  │  Zustand의 위치:                                             │
  │  · Context보다 성능/유연성이 높다                            │
  │  · Redux Toolkit보다 학습 비용이 낮다                        │
  │  · "대부분의 중규모 앱"에 최적의 선택                        │
  └─────────────────────────────────────────────────────────────┘
```

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · Zustand의 핵심 개념과 store 생성                     │
│  · selector 기반 부분 구독의 원리                        │
│  · set/get을 활용한 상태 업데이트 패턴                   │
│  · 미들웨어 (persist, devtools, immer)                  │
│  · 비동기 액션 (데이터 패칭)                             │
│  · store 설계 전략 (단일 vs 분리)                       │
│  · Context, Redux Toolkit과의 비교                      │
│  · 전역 상태의 Anti-pattern                             │
│  · 상태 관리 도구 최종 선택 가이드                       │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Jotai (Atomic 패턴)                                  │
│  · Recoil                                               │
│  · MobX                                                 │
│  · 상태 관리 라이브러리의 내부 구현 상세                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 Store — 상태와 액션의 통합 단위

Zustand에서 **Store**는 상태(state)와 그 상태를 변경하는 액션(action)을 단일 객체로 정의한 것이다. `create()` 함수로 생성하며, 반환값은 React Hook이다.

Store가 중요한 이유는 "상태가 어디 있는가"와 "어떻게 변경하는가"가 분리되지 않는다는 점이다. Redux에서는 store(상태 저장소), reducer(변경 로직), action creator(액션 생성 함수)가 별도 파일로 분리되어 보일러플레이트가 증가했다. Zustand는 이 세 요소를 하나의 `create()` 호출 안에 통합함으로써 코드량을 획기적으로 줄인다.

```
Store의 구성 요소

  create((set, get) => ({
    // ── 상태 (State) ──
    count: 0,
    items: [],

    // ── 액션 (Action) ──
    increment: () => set(state => ({ count: state.count + 1 })),
    addItem: (item) => set(state => ({ items: [...state.items, item] })),
  }))

  · set: 상태를 업데이트하는 함수 (useState의 setState에 해당)
  · get: 현재 상태를 읽는 함수 (액션 내부에서 다른 상태 참조 시 사용)
  · 반환 객체: 상태 + 액션이 한 곳에 공존
```

### 2.2 Selector — 부분 구독의 핵심 메커니즘

**Selector**는 store에서 필요한 부분만 선택하여 구독하는 함수다. `useStore(state => state.count)` 형태로 사용하며, 선택한 값이 변할 때만 해당 컴포넌트가 리렌더링된다.

Selector가 Zustand의 성능 우위를 결정하는 핵심 요소다. Context에서는 Provider value 전체가 변경 단위였기 때문에 값의 일부만 바뀌어도 모든 소비자가 리렌더링되었다. Selector는 각 컴포넌트가 "자신이 구독한 슬라이스"만 감시하므로, 다른 상태가 변해도 전혀 영향을 받지 않는다.

```
Selector의 동작 원리

  Store: { count: 0, user: 'Alice', theme: 'dark' }

  컴포넌트 A: useStore(s => s.count)   → count만 구독
  컴포넌트 B: useStore(s => s.user)    → user만 구독
  컴포넌트 C: useStore(s => s.theme)   → theme만 구독

  count가 1로 변경되면:
    · 컴포넌트 A: 리렌더링 ✓
    · 컴포넌트 B: 리렌더링 없음 ✗
    · 컴포넌트 C: 리렌더링 없음 ✗

  Context였다면:
    · 컴포넌트 A, B, C 모두 리렌더링 ✓✓✓
```

### 2.3 set과 get — 상태 업데이트와 읽기

**set**은 store의 상태를 업데이트하는 함수다. 부분 상태 객체를 전달하면 Zustand가 자동으로 얕은 병합(shallow merge)을 수행한다는 점이 중요하다. `set({ count: 0 })`를 호출해도 나머지 상태는 그대로 유지된다.

**get**은 store의 현재 상태를 즉시 읽는 함수다. `set` 콜백 외부에서 현재 상태를 참조해야 할 때, 또는 여러 상태 값을 조합하는 파생 값을 계산할 때 활용한다. React Hook이 아니므로 비동기 함수 내에서도 자유롭게 호출할 수 있다.

### 2.4 Middleware — store 확장 시스템

**Middleware**는 store에 추가 기능을 주입하는 래퍼다. Zustand의 미들웨어 시스템은 함수 합성 패턴으로 동작하며, 여러 미들웨어를 중첩하여 적용할 수 있다.

미들웨어가 중요한 이유는 store의 핵심 로직을 변경하지 않고 횡단 관심사(cross-cutting concern)를 주입할 수 있기 때문이다. localStorage에 상태를 저장하는 로직(persist), Redux DevTools 연동(devtools), 불변 업데이트 간소화(immer) 모두 미들웨어로 분리되어 필요한 경우에만 선택적으로 사용한다.

### 2.5 Shallow Equality — 비교 전략

**Shallow Equality(얕은 비교)**는 객체의 1단계 속성만 각각 `===` 비교하는 방식이다. Zustand는 selector가 원시값을 반환하면 기본 `===` 비교를, 객체/배열을 반환하면 `useShallow`를 통한 얕은 비교를 권장한다.

이 개념이 중요한 이유는 JavaScript의 참조 동일성 때문이다. `state => ({ a: state.a, b: state.b })`처럼 새 객체를 반환하는 selector는 매번 다른 참조를 생성하므로, 기본 비교(`===`)로는 항상 "변경됨"으로 판단되어 불필요한 리렌더링이 발생한다. `useShallow`는 이를 해결한다.

### 2.6 핵심 용어 요약

| 용어                 | 정의                                                                                 | 왜 중요한가                                        |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Store**            | 상태와 액션을 **하나의 객체로 정의**한 것. `create()` 함수로 생성                    | 상태 + 업데이트 로직이 한 곳에 모인다              |
| **Selector**         | store에서 **필요한 부분만 선택**하여 구독하는 함수. `useStore(state => state.count)` | 선택한 부분이 변할 때만 리렌더링 (부분 구독)       |
| **set**              | store의 **상태를 업데이트**하는 함수. 자동 얕은 병합                                 | useState의 setState에 해당                         |
| **get**              | store의 **현재 상태를 읽는** 함수. 액션 내부에서 다른 상태를 참조할 때 사용          | set 콜백 외에서 현재 상태가 필요할 때              |
| **Middleware**       | store에 **추가 기능을 주입**하는 래퍼. persist, devtools, immer                      | store를 확장하는 플러그인 시스템                   |
| **Shallow Equality** | 객체의 **1단계 속성만 비교**하여 동일성을 판단. Zustand의 기본 비교 방식             | selector가 객체를 반환할 때 불필요한 리렌더링 방지 |

### 2.7 Zustand vs Context 구조 비교

```
Context 방식:                        Zustand 방식:

  createContext()                      create((set, get) => ({
  + Provider                             count: 0,
  + useReducer / useState                increment: () => set(s => ({
  + Custom Hook                            count: s.count + 1
  + useMemo (value 안정화)               })),
                                       }))

  컴포넌트 트리:                      컴포넌트 트리:

  <Provider value={...}>              (Provider 없음!)
    <App>                              <App>
      <Child useContext() />             <Child useStore(s => s.count) />
    </App>                             </App>
  </Provider>

  · Provider 위치를 신경 써야 함        · Provider 불필요
  · value 변경 → 모든 소비자 리렌더링   · selector가 변할 때만 리렌더링
  · React 트리에 종속                   · React 트리 밖에서도 접근 가능
```

### 2.8 개념 간 관계 다이어그램

```
Zustand 핵심 개념 관계도

  ┌─────────────────────────────────────────────────────────────┐
  │                         Store                               │
  │  ┌─────────────────┐    ┌─────────────────────────────────┐ │
  │  │   State (상태)   │    │       Actions (액션)            │ │
  │  │  · count: 0     │◄───│  · increment: () => set(...)   │ │
  │  │  · items: []    │    │  · addItem: (x) => set(...)     │ │
  │  │  · user: null   │    │  · fetchData: async () => ...  │ │
  │  └────────┬────────┘    └─────────────────────────────────┘ │
  └───────────┼─────────────────────────────────────────────────┘
              │ 구독 (subscribe)
              │
  ┌───────────▼─────────────────────────────────────────────────┐
  │                    컴포넌트 레이어                            │
  │                                                              │
  │  Component A          Component B          Component C       │
  │  selector: s.count    selector: s.items    selector: s.user  │
  │                                                              │
  │  count 변경 시:        items 변경 시:        user 변경 시:    │
  │  A만 리렌더링 ★       B만 리렌더링 ★        C만 리렌더링 ★  │
  └─────────────────────────────────────────────────────────────┘

  Middleware 체계:
  devtools( persist( immer( create(...) ) ) )
       ↑           ↑       ↑
   DevTools 연동  영속화  불변 업데이트
```

---

## 3. 이론과 원리

### 3.1 Store 생성과 기본 사용법

Zustand의 store는 React 생태계 어디에서나 접근 가능한 싱글턴 구조를 갖는다. `create()` 함수는 내부적으로 JavaScript의 클로저와 pub/sub 패턴을 활용하여, React의 컴포넌트 트리와 독립적으로 상태를 관리한다. Provider가 필요 없는 것은 이 때문이다.

#### 최소 예제

```javascript
// src/stores/counterStore.js
import { create } from "zustand";

const useCounterStore = create((set) => ({
  // ── 상태 ──
  count: 0,

  // ── 액션 ──
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (value) => set({ count: value }),
}));

export default useCounterStore;
```

```jsx
// 컴포넌트에서 사용
import useCounterStore from "@/stores/counterStore";

function Counter() {
  // selector로 필요한 값만 구독
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}

function ResetButton() {
  const reset = useCounterStore((state) => state.reset);
  // count가 변해도 이 컴포넌트는 리렌더링되지 않는다! ★
  // reset 함수의 참조는 변하지 않으므로
  return <button onClick={reset}>초기화</button>;
}
```

```
Context와의 핵심 차이

  Context:
    const { count, increment, reset } = useAppContext();
    // count가 변하면 → 이 컴포넌트 리렌더링
    // count만 사용해도, increment/reset을 가진 다른 컴포넌트도 리렌더링!

  Zustand:
    const count = useCounterStore(state => state.count);
    // count가 변할 때만 이 컴포넌트 리렌더링 ★
    // 다른 컴포넌트가 reset만 구독하면 count 변경에 무반응!

  원리: Zustand는 각 컴포넌트가 "구독한 부분"만 추적하고
        그 부분이 변할 때만 해당 컴포넌트를 리렌더링한다
```

### 3.2 Selector — 부분 구독의 핵심

Zustand의 selector는 단순한 API가 아니라 성능 아키텍처의 핵심이다. 컴포넌트가 처음 마운트될 때 Zustand는 selector 함수를 실행하고 결과를 캐시한다. 이후 store 상태가 변경될 때마다 selector를 재실행하여 이전 결과와 비교하고, 차이가 있을 때만 해당 컴포넌트를 리렌더링한다.

#### 원시값 selector (기본)

```javascript
// 각 컴포넌트가 필요한 값만 구독
const count = useCounterStore((state) => state.count);
// count가 변할 때만 리렌더링

const increment = useCounterStore((state) => state.increment);
// increment 함수 참조가 변할 때만 리렌더링 (실질적으로 불변)
```

#### 객체 selector와 shallow 비교

```javascript
// ⚠️ 객체를 반환하는 selector — 매번 새 객체!
const { count, name } = useCounterStore((state) => ({
  count: state.count,
  name: state.name,
}));
// 기본 비교(===)는 새 객체를 "변경됨"으로 판단 → 매번 리렌더링!

// ✅ useShallow로 얕은 비교 적용
import { useShallow } from "zustand/react/shallow";

const { count, name } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    name: state.name,
  })),
);
// count 또는 name이 실제로 변했을 때만 리렌더링 ★

// ✅ 배열 형태도 가능
const [count, name] = useCounterStore(
  useShallow((state) => [state.count, state.name]),
);
```

```
Selector 비교 방식

  기본 (===):
    · 원시값: 값이 같으면 동일 → 효율적
    · 객체/배열: 매번 새 참조 → 항상 "변경됨" → 매번 리렌더링!

  useShallow (얕은 비교):
    · 객체의 1단계 속성을 각각 === 비교
    · { count: 1, name: 'a' } vs { count: 1, name: 'a' } → 동일!
    · 실제로 값이 변한 경우에만 리렌더링

  원칙:
    · 원시값 selector → 기본 비교 OK
    · 객체/배열 selector → useShallow 사용
    · 또는 원시값 selector를 여러 번 호출 (각각 독립)
```

### 3.3 set과 get — 상태 업데이트 패턴

#### set의 두 가지 형태

```javascript
const useStore = create((set, get) => ({
  count: 0,
  items: [],

  // 형태 1: 부분 상태 객체 전달 (자동 병합!)
  reset: () => set({ count: 0 }),
  // 기존: { count: 0, items: [...] }
  // 결과: { count: 0, items: [...] }  ← items는 유지!
  // Zustand는 자동으로 얕은 병합(shallow merge)을 수행

  // 형태 2: 함수 전달 (이전 상태 참조)
  increment: () => set((state) => ({ count: state.count + 1 })),

  // 중첩 객체 업데이트
  updateUserName: (name) =>
    set((state) => ({
      user: { ...state.user, name }, // 수동 spread 필요 (1단계 병합이므로)
    })),

  // 배열 업데이트 (Immutable 패턴 — Step 6 복습)
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));
```

#### get으로 현재 상태 읽기

```javascript
const useStore = create((set, get) => ({
  items: [],
  selectedId: null,

  // get()으로 다른 상태 참조
  getSelectedItem: () => {
    const { items, selectedId } = get();
    return items.find((item) => item.id === selectedId);
  },

  // 조건부 업데이트
  addItemIfNotExists: (item) => {
    const { items } = get();
    if (items.some((i) => i.id === item.id)) return; // 이미 존재
    set({ items: [...items, item] });
  },
}));
```

#### 비동기 액션

```javascript
const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  // 비동기 액션 — async/await 자연스럽게 사용
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      set({ products: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// 사용
function ProductList() {
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <Spinner />;
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

```
⚠️ 서버 데이터 패칭에 Zustand를 사용하는 것은 권장하지 않는다

  Zustand의 fetchProducts는 단순한 패칭일 뿐:
    · 캐싱 없음
    · 자동 리패칭 없음
    · 에러 재시도 없음
    · Race Condition 방지 없음

  서버 데이터 → TanStack Query (Step 23)
  클라이언트 전역 상태 → Zustand

  Zustand로 서버 데이터를 관리하는 것은 Step 22의 수동 패칭과 같은 한계
```

### 3.4 미들웨어

미들웨어는 Zustand store의 기능을 선언적으로 확장하는 메커니즘이다. 각 미들웨어는 store 생성 함수를 감싸는 고차 함수로 동작하며, 상태 업데이트 전후에 추가 동작을 삽입한다. 이 패턴은 함수형 프로그래밍의 데코레이터 패턴과 유사하다.

#### persist — 상태 영속화

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: "light",
      fontSize: 16,
      language: "ko",
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "app-settings", // localStorage 키 이름
      // storage: createJSONStorage(() => sessionStorage), // 저장소 변경 가능
      partialize: (state) => ({
        // 저장할 상태만 선택 (함수는 저장하지 않음)
        theme: state.theme,
        fontSize: state.fontSize,
        language: state.language,
      }),
    },
  ),
);

// 새로고침해도 설정이 유지된다!
// localStorage에 'app-settings' 키로 자동 저장/복원
```

#### devtools — Redux DevTools 연동

```javascript
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () =>
        set(
          (state) => ({ count: state.count + 1 }),
          false, // replace 여부
          "counter/increment", // action 이름 (DevTools에 표시)
        ),
    }),
    { name: "CounterStore" }, // DevTools에서의 store 이름
  ),
);

// Redux DevTools 확장에서:
// · 상태 변경 히스토리 확인
// · 시간 여행 디버깅 (과거 상태로 돌아가기)
// · action 이름으로 변경 추적
```

#### immer — 불변 업데이트 간소화

```javascript
import { immer } from "zustand/middleware/immer";

const useTodoStore = create(
  immer((set) => ({
    todos: [],
    user: { name: "", settings: { notifications: true } },

    // immer 사용: 직접 변경처럼 작성 → 내부적으로 Immutable 처리
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: Date.now(), text, done: false });
        // push를 직접 사용! immer가 Immutable로 변환
      }),

    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.done = !todo.done;
        // 직접 변경! immer가 처리
      }),

    // 깊은 중첩 객체도 간편하게
    updateNotificationSetting: (value) =>
      set((state) => {
        state.user.settings.notifications = value;
        // immer 없이: { user: { ...state.user, settings: { ...state.user.settings, notifications: value } } }
      }),
  })),
);
```

#### 미들웨어 합성

```javascript
// 여러 미들웨어를 중첩하여 사용
const useStore = create(
  devtools(
    persist(
      immer((set) => ({
        // store 정의
      })),
      { name: "my-store" }, // persist 옵션
    ),
    { name: "MyStore" }, // devtools 옵션
  ),
);

// 적용 순서: immer(가장 안쪽) → persist → devtools(가장 바깥)
```

### 3.5 Store 설계 전략

Store 설계는 단순히 코드를 어디에 두는지가 아니라, 상태 변경의 파급 범위와 테스트 용이성을 결정하는 아키텍처 결정이다. 도메인별 분리가 권장되는 이유는 단일 책임 원칙(SRP)의 직접적 적용이다.

#### 단일 Store vs 분리된 Store

```
방식 1: 도메인별 분리 (권장 ★)

  useAuthStore     → user, login, logout
  useCartStore     → items, addItem, removeItem
  useUIStore       → sidebarOpen, theme, modals

  장점:
    · 각 store가 작고 단순하다
    · 관심사 분리가 명확하다
    · 한 store의 변경이 다른 store에 영향 없음
    · 테스트가 독립적이다

  단점:
    · store 간 상호 참조가 필요하면 약간 복잡


방식 2: 단일 Store (소규모 앱에서 OK)

  useStore → 모든 상태와 액션

  장점:
    · 구조가 단순하다
    · store 간 참조가 불필요

  단점:
    · 앱이 커지면 파일이 비대해짐
    · selector를 세밀하게 작성해야 함
```

#### 실전 Store 설계 예시

```javascript
// stores/authStore.js
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: "auth", partialize: (state) => ({ user: state.user }) },
  ),
);

// stores/cartStore.js
export const useCartStore = create(
  devtools(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }),
            false,
            "cart/addItem",
          );
        } else {
          set(
            (state) => ({
              items: [
                ...state.items,
                { productId: product.id, product, quantity: 1 },
              ],
            }),
            false,
            "cart/addNewItem",
          );
        }
      },

      removeItem: (productId) =>
        set(
          (state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }),
          false,
          "cart/removeItem",
        ),

      updateQuantity: (productId, quantity) =>
        set(
          (state) => ({
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, quantity) }
                : i,
            ),
          }),
          false,
          "cart/updateQuantity",
        ),

      clearCart: () => set({ items: [] }, false, "cart/clear"),

      // 파생 값 — get()으로 계산
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
      },
      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "CartStore" },
  ),
);

// stores/uiStore.js
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
```

### 3.6 React 트리 밖에서 State 접근

Zustand의 store는 React 컴포넌트 트리와 독립적으로 존재하는 싱글턴이다. 이 특성 덕분에 HTTP 클라이언트 인터셉터, 유틸리티 함수, 이벤트 리스너 등 React Hook을 사용할 수 없는 환경에서도 전역 상태에 접근할 수 있다.

```javascript
// store 직접 접근 (React 컴포넌트 밖에서)
const currentUser = useAuthStore.getState().user;
const cartItems = useCartStore.getState().items;

// 상태 변경도 가능
useAuthStore.getState().logout();
useCartStore.getState().clearCart();

// 구독 (상태 변경 감지)
const unsubscribe = useCartStore.subscribe((state) =>
  console.log("장바구니 변경:", state.items),
);

// Axios 인터셉터 예시
apiClient.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});
```

### 3.7 Context vs Zustand vs Redux Toolkit 비교

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                  │  Context         │  Zustand         │  Redux Toolkit   │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│  번들 크기       │  0KB (내장)       │  ~1.5KB          │  ~11KB           │
│  보일러플레이트   │  많음            │  매우 적음 ★      │  적음 (RTK)      │
│  Provider 필요   │  필수            │  불필요 ★        │  필수            │
│  부분 구독       │  불가            │  selector 기반 ★ │  selector 기반   │
│  DevTools        │  없음            │  미들웨어로 지원 │  내장 ★          │
│  미들웨어        │  없음            │  persist, immer  │  내장 (thunk 등) │
│  비동기 처리     │  수동            │  자연스러운 async│  createAsyncThunk│
│  React 외 접근   │  불가            │  getState() ★    │  store.getState()│
│  학습 곡선       │  낮음            │  매우 낮음 ★     │  중간            │
│  생태계          │  React 내장      │  성장 중         │  가장 큼 ★       │
│  타입 안전성     │  수동 설정       │  우수            │  우수            │
│  Time Travel     │  불가            │  DevTools 통해   │  DevTools ★     │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│  적합한 경우     │  변경 드문 전역값 │  대부분의 앱 ★   │  대규모/복잡한 앱│
│                  │  테마, 인증      │  빠른 개발       │  엄격한 패턴 필요│
│                  │                  │  유연한 구조     │  팀 규모 큰 경우 │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

```
Redux Toolkit(RTK) 간략 소개

  RTK는 Redux의 공식 도구킷으로, 기존 Redux의 복잡함을 해소:
    · configureStore: Redux store를 간편하게 생성
    · createSlice: reducer + action을 한 번에 정의
    · createAsyncThunk: 비동기 로직 표준 패턴
    · RTK Query: TanStack Query와 유사한 데이터 패칭

  Zustand vs RTK 선택:
    · 소~중규모 앱, 빠른 개발 → Zustand
    · 대규모 앱, 엄격한 패턴, 큰 팀 → RTK
    · 이미 Redux 생태계에 익숙 → RTK
    · 새 프로젝트, 간결함 선호 → Zustand
```

### 3.8 전역 상태의 Anti-pattern

전역 상태 관리에서 Anti-pattern은 단순히 코드 스타일의 문제가 아니라, 애플리케이션의 예측 가능성과 테스트 용이성을 직접적으로 훼손한다. 상태가 어디서 어떻게 변경되는지 추적하기 어려워지면, 디버깅 비용이 기하급수적으로 증가한다.

```
❌ Anti-pattern 1: 모든 것을 전역 상태에 넣기

  "이 값을 여러 곳에서 쓸 수도 있으니 전역으로..."

  문제: 상태가 "어디서 변경되는지" 추적 어려움
  원칙: "정말 전역이 필요한가?" → 대부분 Props나 로컬 State로 충분


❌ Anti-pattern 2: 서버 데이터를 전역 상태에 저장

  useStore({ users: [] })에 API 응답을 저장하고 수동 관리

  문제: Step 22의 수동 패칭 7가지 한계 그대로 발생
  해결: 서버 데이터는 TanStack Query로 관리


❌ Anti-pattern 3: 파생 데이터를 상태에 저장

  useStore({
    items: [...],
    filteredItems: [...],  ← items에서 계산 가능!
    totalPrice: 0,         ← items에서 계산 가능!
  })

  문제: items 변경 시 filteredItems, totalPrice도 수동 동기화 필요
  해결: 파생 데이터는 selector 또는 get()으로 "계산"한다


❌ Anti-pattern 4: 폼 입력값을 전역에 저장

  useStore({ formName: '', formEmail: '' })

  문제: 매 키 입력마다 전역 상태 업데이트 → 불필요한 영향 범위
  해결: 폼 입력은 로컬 State(useState) 또는 React Hook Form
```

```
전역 상태에 적합한 데이터

  ✅ 인증 상태 (로그인한 사용자 정보)
  ✅ UI 전역 상태 (테마, 사이드바 열림, 활성 모달)
  ✅ 장바구니 (여러 페이지에서 접근)
  ✅ 알림/토스트 (어디서든 추가 가능)
  ✅ 앱 설정 (언어, 시간대, 표시 옵션)

  ❌ 서버 데이터 → TanStack Query
  ❌ 폼 입력값 → 로컬 State
  ❌ URL 상태 → useSearchParams (Step 18)
  ❌ 파생 데이터 → selector로 계산
  ❌ 한 컴포넌트에서만 사용하는 State → 로컬 useState
```

### 3.9 상태 관리 도구 최종 선택 가이드

```
프로젝트에서 상태를 어떻게 관리할 것인가?

  ┌─ 서버에서 오는 데이터인가?
  │    YES → TanStack Query (Step 23)
  │    NO ↓
  │
  ├─ URL에 반영되어야 하는 상태인가? (필터, 검색어, 페이지)
  │    YES → useSearchParams / URL (Step 18)
  │    NO ↓
  │
  ├─ 한 컴포넌트에서만 사용하는가?
  │    YES → useState / useReducer (로컬)
  │    NO ↓
  │
  ├─ 부모-자식 2~3단계에서만 공유하는가?
  │    YES → Props 전달 또는 Composition (Step 5)
  │    NO ↓
  │
  ├─ 변경이 드물고 앱 전체에서 필요한가? (테마, 인증, 로케일)
  │    YES → Context API (Step 25)
  │    NO ↓
  │
  └─ 여러 페이지에서 공유 + 빈번한 변경 + 부분 구독 필요?
       YES → Zustand (이 Step) ★
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 장바구니를 Context에서 Zustand로 마이그레이션

이커머스 앱에서 장바구니 기능은 전형적인 Zustand 적용 사례다. Context 기반으로 구현했을 때 발생하는 문제를 분석하고, Zustand로 마이그레이션하는 과정을 살펴본다.

```
Context 버전의 문제:
  · CartContext.Provider value={{ items, addItem, removeItem, ... }}
  · 아이템 추가 시 value 객체 변경 → 헤더의 장바구니 아이콘 리렌더링
  · 상품 목록 페이지도 리렌더링 (장바구니와 무관한데!)
  · useMemo로 value를 안정화해도 items가 변하면 전부 리렌더링

Zustand 버전의 해결:
  · 헤더: useCartStore(state => state.getTotalCount())
    → totalCount가 변할 때만 리렌더링
  · 상품 카드: useCartStore(state => state.addItem)
    → addItem 함수 참조 불변 → 리렌더링 없음!
  · 장바구니 페이지: useCartStore(useShallow(state => state.items))
    → items가 변할 때만 리렌더링 (정상)
```

마이그레이션 후 리렌더링 횟수 비교:

```
상품 1개를 장바구니에 추가할 때

  Context 방식:
    · 헤더 (카운트 아이콘): 1회 리렌더링
    · 상품 목록 (20개 카드): 20회 리렌더링
    · 결제 버튼: 1회 리렌더링
    합계: 22회+

  Zustand 방식:
    · 헤더 (카운트 아이콘): 1회 리렌더링 (totalCount 변화)
    · 상품 목록 (20개 카드): 0회 리렌더링 ★ (addItem 참조 불변)
    · 결제 버튼: 1회 리렌더링
    합계: 2회
```

### 4.2 사례: Zustand + TanStack Query 결합 패턴

현대적인 React 앱에서 Zustand와 TanStack Query는 상호 보완적인 역할을 한다. Zustand는 클라이언트 전역 상태를, TanStack Query는 서버 상태를 각각 담당한다.

```jsx
// Zustand: 클라이언트 전역 상태만 관리
const useCartStore = create((set) => ({
  items: [],                    // 로컬 장바구니 (클라이언트 State)
  addItem: (product) => { ... },
}));

// TanStack Query: 서버 데이터 관리
function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),  // 서버 데이터
  });
}

// 컴포넌트: 두 도구를 결합
function ProductPage() {
  const { data: products, isLoading } = useProducts({ category: 'books' });
  const addToCart = useCartStore(state => state.addItem);

  if (isLoading) return <Spinner />;

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => addToCart(product)}
        />
      ))}
    </div>
  );
}

// 역할 분리:
// · 상품 데이터(서버) → TanStack Query → 캐싱, 리패칭 자동
// · 장바구니(클라이언트) → Zustand → Provider 없이 전역 접근
```

### 4.3 사례: 이커머스 앱의 상태 관리 전체 아키텍처

```
도구별 역할 분담

  TanStack Query:
    · 상품 목록/상세 (서버 데이터)
    · 주문 내역 (서버 데이터)
    · 리뷰 목록 (서버 데이터)
    · 사용자 프로필 (서버 데이터)

  Zustand:
    · 인증 상태 (로그인한 사용자, 토큰) — persist
    · 장바구니 (여러 페이지에서 접근) — persist
    · UI 상태 (사이드바, 모달, 테마)
    · 알림/토스트 목록

  Context (또는 Zustand):
    · 테마 (변경 빈도 매우 낮음)
    · 로케일/언어 (변경 빈도 매우 낮음)

  로컬 State (useState):
    · 폼 입력값
    · 컴포넌트별 토글, 애니메이션 상태
    · 모달 내부 상태

  URL (useSearchParams):
    · 검색 쿼리
    · 필터, 정렬 옵션
    · 페이지 번호
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Zustand 기본 Store 구현 [Applying]

**목표:** Zustand store를 생성하고 selector 기반 구독을 구현한다.

```
요구사항:
  · 카운터 Store: count, increment, decrement, reset
  · 3개 컴포넌트:
    - CountDisplay: count만 구독하여 표시
    - IncrementButton: increment만 구독
    - ResetButton: reset만 구독
  · console.log로 각 컴포넌트의 리렌더링 관찰
  · increment 클릭 시 CountDisplay만 리렌더링되는지 확인
  · Context로 같은 기능을 구현했을 때와 리렌더링 횟수 비교
```

---

### 실습 2: 장바구니 Store + 미들웨어 [Applying]

**목표:** 실전 수준의 store를 미들웨어와 함께 구현한다.

```
요구사항:
  · useCartStore: items, addItem, removeItem, updateQuantity, clearCart
  · persist 미들웨어: 새로고침해도 장바구니 유지
  · devtools 미들웨어: Redux DevTools에서 상태 변경 추적
  · getTotalPrice, getTotalCount 파생 값 (get() 활용)
  · 여러 페이지(상품 목록, 장바구니, 헤더)에서 사용
  · 각 페이지에서 필요한 부분만 selector로 구독

검증:
  · 상품 추가 시 헤더의 카운트만 리렌더링 (상품 목록 무관)
  · 새로고침 후 장바구니 데이터 유지
  · DevTools에서 action 이름 확인
```

---

### 실습 3: Context → Zustand 마이그레이션 [Analyzing]

**목표:** Step 25의 Context 코드를 Zustand로 마이그레이션하고 차이를 분석한다.

```
과제:
  · Step 25 실습 2의 장바구니 Context를 Zustand로 변환
  · 변환 전후 비교:
    - 코드 줄 수 (Provider, Hook, store 포함)
    - 리렌더링 횟수 (console.log로 측정)
    - Provider 배치 여부
    - 보일러플레이트 양

기록표:
  | 항목              | Context | Zustand |
  |-------------------|---------|---------|
  | 코드 줄 수         | ?       | ?       |
  | Provider 필요     | ?       | ?       |
  | 리렌더링 (추가 시) | ?개     | ?개     |
  | React 외부 접근   | ?       | ?       |
```

---

### 실습 4 (선택): 상태 관리 아키텍처 설계 [Evaluating]

**목표:** 앱 전체의 상태 관리 도구를 설계한다.

```
시나리오: 프로젝트 관리 도구 (Trello 유사)

상태 목록:
  1. 로그인한 사용자 정보
  2. 보드 목록 (API)
  3. 선택된 보드의 카드 목록 (API)
  4. 드래그 중인 카드 (로컬 UI 상태)
  5. 사이드바 열림/닫힘
  6. 현재 선택된 보드 ID
  7. 카드 편집 모달 열림 + 편집 중 데이터
  8. 앱 테마 (다크/라이트)
  9. 실시간 협업자 커서 위치 (WebSocket)
  10. 카드 필터 (라벨, 담당자)
  11. 알림 목록 (API + WebSocket)
  12. 검색 쿼리

각 상태에 대해 적합한 도구를 선택하고 근거를 제시하라:
  · useState
  · useSearchParams
  · Context
  · Zustand
  · TanStack Query
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 26 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Zustand = 최소 API + selector 기반 부분 구독 전역 상태    │
│     → create((set, get) => ({ state, actions }))             │
│     → Provider 불필요, ~1.5KB, 보일러플레이트 최소            │
│                                                               │
│  2. Selector = 부분 구독의 핵심                               │
│     → useStore(state => state.count) — count 변경 시만 리렌더링│
│     → 객체 반환 시 useShallow 사용                            │
│     → Context의 "전체 리렌더링" 문제를 근본적으로 해결        │
│                                                               │
│  3. 미들웨어로 기능을 확장한다                                 │
│     → persist: localStorage 자동 저장/복원                   │
│     → devtools: Redux DevTools 연동                          │
│     → immer: 불변 업데이트를 직접 변경처럼 작성               │
│                                                               │
│  4. React 트리 밖에서도 State에 접근 가능                     │
│     → useStore.getState(): 현재 상태 읽기                    │
│     → useStore.subscribe(): 변경 감지                        │
│     → Axios 인터셉터, 유틸리티 함수에서 활용                  │
│                                                               │
│  5. 도메인별 Store 분리를 권장한다                             │
│     → useAuthStore, useCartStore, useUIStore                 │
│     → 각 store가 독립적으로 변경·테스트 가능                  │
│                                                               │
│  6. Anti-pattern을 피한다                                     │
│     → 서버 데이터를 Zustand에 넣지 않음 (→ TanStack Query)   │
│     → 파생 데이터를 State로 저장하지 않음 (→ selector/get)    │
│     → 폼 입력값을 전역에 넣지 않음 (→ 로컬 State)            │
│     → 한 곳에서만 쓰는 State를 전역에 넣지 않음               │
│                                                               │
│  7. 상태 관리 도구 최종 선택                                   │
│     → 서버 데이터 → TanStack Query                           │
│     → URL 상태 → useSearchParams                             │
│     → 로컬 UI → useState                                     │
│     → 변경 드문 전역 → Context                               │
│     → 변경 빈번 전역 → Zustand ★                             │
│     → 대규모/엄격한 팀 → Redux Toolkit                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                               | 블룸 단계  | 확인할 섹션 |
| --- | ---------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Zustand store에서 set과 get의 역할을 각각 설명하라                                 | Remember   | 3.3         |
| 2   | selector 기반 부분 구독이 Context의 리렌더링 문제를 해결하는 원리는?               | Understand | 3.2         |
| 3   | Zustand가 Provider 없이 전역 상태를 관리할 수 있는 이유는?                         | Understand | 2.2         |
| 4   | 객체를 반환하는 selector에서 useShallow가 필요한 이유는?                           | Understand | 3.2         |
| 5   | persist 미들웨어의 partialize 옵션이 필요한 이유는?                                | Apply      | 3.4         |
| 6   | 서버 데이터를 Zustand에 저장하는 것이 Anti-pattern인 이유는?                       | Analyze    | 3.8         |
| 7   | Context, Zustand, Redux Toolkit 각각이 가장 적합한 시나리오를 하나씩 제시하라      | Evaluate   | 3.7         |
| 8   | 이커머스 앱에서 상품 목록(서버), 장바구니(전역), 폼 입력(로컬) 각각 적합한 도구는? | Evaluate   | 3.9         |

### 6.3 FAQ

**Q1. Zustand는 Redux를 완전히 대체할 수 있는가?**

대부분의 중소 규모 앱에서는 대체 가능하다. 그러나 100명 이상의 팀이 협업하는 대규모 엔터프라이즈 앱, 엄격한 액션 추적이 요구되는 금융/의료 도메인, 또는 이미 Redux 생태계(미들웨어, 도구 등)에 깊이 투자된 프로젝트에서는 Redux Toolkit이 여전히 합리적인 선택이다. "도구가 아니라 요구사항이 선택을 결정한다"는 원칙을 기억하라.

**Q2. Zustand store를 테스트하는 방법은?**

store는 React 컴포넌트 없이 독립적으로 테스트할 수 있다. `store.getState()`로 현재 상태를 읽고, `store.setState()`로 초기 상태를 설정하며, 액션을 직접 호출하여 상태 변화를 검증한다. 테스트 간 store 상태 오염을 방지하려면 각 테스트 전에 `store.setState(initialState)`로 초기화한다.

**Q3. 여러 store 간에 데이터를 공유해야 할 때는?**

store A가 store B의 데이터를 필요로 한다면 두 가지 방법이 있다. 첫째, store A의 액션 내부에서 `useStoreB.getState()`를 호출하여 직접 접근한다. 둘째, 두 store가 공유하는 데이터를 별도의 store로 분리한다. 순환 의존성이 발생하지 않도록 주의하며, 가능하면 컴포넌트 레벨에서 두 store를 조합하는 방식을 권장한다.

**Q4. TypeScript와 함께 사용할 때 타입 정의는 어떻게 하는가?**

`create<StateType>()` 형태로 제네릭 타입을 지정한다. 상태와 액션의 타입을 인터페이스로 정의하고 `create<CounterState & CounterActions>()`처럼 교차 타입을 사용하는 것이 일반적인 패턴이다. Zustand는 TypeScript 지원이 우수하여 별도의 설정 없이도 자동 완성과 타입 추론이 잘 동작한다.

**Q5. Zustand store의 초기 상태를 비동기로 설정해야 할 때는?**

store 외부에서 초기화를 수행한다. 예를 들어 앱 시작 시 API에서 사용자 정보를 가져와 auth store를 초기화해야 한다면, 루트 컴포넌트의 `useEffect`에서 `useAuthStore.getState().initialize()`를 호출하거나, TanStack Query로 데이터를 가져온 후 store에 설정하는 패턴을 사용한다.

---

## 7. 다음 단계 예고

> **Step 27. 컴포넌트 설계 패턴**
>
> - Presentational vs Container 패턴의 현대적 해석
> - Compound Component 패턴
> - Render Props와 HOC (역사와 현재)
> - Headless Component 패턴
> - 재사용 가능한 컴포넌트 API 설계 원칙

---

## 📚 참고 자료

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand — Recipes](https://zustand.docs.pmnd.rs/guides/updating-state)
- [Zustand — Middlewares](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Redux Toolkit 공식 문서](https://redux-toolkit.js.org/)
- [TkDodo's Blog — Working with Zustand](https://tkdodo.eu/blog/working-with-zustand)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 26 of 42
