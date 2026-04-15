# Step 13. useReducer와 상태 머신 설계

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| **Remember**   | useReducer의 구성 요소(state, dispatch, reducer, action)를 나열할 수 있다   |
| **Understand** | useReducer의 데이터 흐름(dispatch → reducer → 새 State)을 설명할 수 있다    |
| **Understand** | useState와 useReducer의 차이점과 각각의 적합한 상황을 설명할 수 있다        |
| **Apply**      | 복합 State를 useReducer로 관리하는 코드를 구현할 수 있다                    |
| **Analyze**    | 기존 useState 코드에서 useReducer로 리팩토링이 필요한 시점을 식별할 수 있다 |
| **Evaluate**   | 유한 상태 머신(FSM) 관점에서 State 전이의 유효성을 설계하고 판단할 수 있다  |

**전제 지식:**

- Step 2: switch 문, Spread 연산자, Immutable 업데이트 패턴
- Step 6: useState, State 설계 원칙(최소화, 모순 방지, 그룹화)
- Step 12: useRef (렌더링 무관 값 저장과의 비교)

---

## 1. 서론 — useState만으로 부족해지는 순간

### 1.1 상태 관리의 역사와 useReducer의 등장 배경

프론트엔드 개발에서 상태 관리는 항상 핵심 과제였다. jQuery 시대에는 DOM 자체가 상태였고, 이를 직접 조작하는 방식이었다. 이 방식은 규모가 커질수록 상태의 일관성을 유지하기 어려웠다. 2013년경 Flux 아키텍처가 등장하면서 "단방향 데이터 흐름"이라는 개념이 대두되었고, 이를 발전시킨 Redux가 React 생태계의 표준 상태 관리 도구로 자리잡았다.

Redux의 핵심 아이디어는 단순하다. **Action**(무엇이 일어났는가) → **Reducer**(어떻게 상태가 바뀌는가) → **새 State**. 이 패턴은 상태 변경 로직을 한 곳에 집중시키고, 상태 전이를 예측 가능하게 만든다. 시간 여행 디버깅(time-travel debugging)이 가능한 것도 이 구조 덕분이다.

React 16.8에서 Hooks가 도입되면서 useReducer가 표준 라이브러리에 포함되었다. 전역 상태는 여전히 Redux 같은 외부 라이브러리가 담당하지만, 컴포넌트 로컬 상태에도 Reducer 패턴을 적용할 수 있게 되었다. useReducer는 "컴포넌트 안에 내장된 경량 Redux"라고 이해하면 된다.

### 1.2 복잡한 State가 만드는 실질적 문제

Step 6에서 useState로 State를 관리하는 방법을 배웠다. 단순한 값(카운터, 토글, 단일 입력)에는 useState가 적합하다. 그러나 State가 복잡해지면 다음과 같은 문제가 발생한다.

```jsx
// ❌ useState로 복잡한 상태를 관리하면 일어나는 일
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    // 여기서 실수로 setError(null)을 빠뜨리면?
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    setError(null); // 빠뜨리기 쉽다!
    try {
      await saveTodo(editingId, editText);
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text: editText } : t)),
      );
      setEditingId(null); // 빠뜨리기 쉽다!
      setEditText(""); // 빠뜨리기 쉽다!
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // 빠뜨리기 쉽다!
    }
  };

  // 문제:
  // · 하나의 "행동"에 여러 setState를 호출해야 한다
  // · 하나라도 빠뜨리면 State 불일치 발생
  // · "어떤 상황에서 어떤 State가 변하는지" 파악이 어렵다
  // · 새로운 기능 추가 시 기존 핸들러를 모두 검토해야 한다
}
```

이 코드의 문제는 **관심사의 분리(Separation of Concerns) 실패**다. "무엇이 일어났는가"(이벤트)와 "어떻게 상태가 변하는가"(로직)가 이벤트 핸들러 안에 뒤섞여 있다. 기능이 추가될수록 이 혼합은 더 심해지고, 버그 추적이 점점 어려워진다.

### 1.3 useReducer가 해결하는 것

```
useState의 한계:
  · "무엇이 일어났는가"(이벤트)와 "어떻게 변하는가"(로직)가 섞여 있다
  · 여러 setState 호출이 핸들러에 흩어져 있다
  · State 전이 로직이 컴포넌트 곳곳에 분산된다

useReducer의 해결:
  · "무엇이 일어났는가"를 action으로 선언 (dispatch)
  · "어떻게 변하는가"를 한 곳(reducer)에 집중
  · State 전이 로직이 reducer 함수 하나에 모인다
  · 새로운 action 추가 시 reducer만 수정하면 된다
```

### 1.4 이 Step의 학습 지도 (개념 지도)

![useReducer 개념 지도](/developer-open-book/diagrams/react-step13-concept-map.svg)

### 1.5 이 Step에서 다루는 범위

![Step 13 다루는 범위](/developer-open-book/diagrams/react-step13-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                 | 정의                                                                                                   | 왜 중요한가                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **useReducer**       | `[state, dispatch]`를 반환하는 Hook. **reducer 함수**를 통해 State를 업데이트한다                      | 복잡한 State 로직을 하나의 함수에 집중시킨다     |
| **Reducer**          | `(state, action) => newState` 형태의 **순수 함수**. 현재 State와 action을 받아 새 State를 반환         | State 전이 로직의 단일 진실 공급원이다           |
| **Action**           | "무엇이 일어났는가"를 서술하는 객체. 보통 `{ type: 'ACTION_NAME', payload: data }` 형태                | 이벤트와 State 변경 로직을 분리한다              |
| **Dispatch**         | action을 reducer에 전달하는 함수. `dispatch({ type: 'INCREMENT' })` 형태로 호출                        | 컴포넌트가 "무엇이 일어났는지"만 알리면 된다     |
| **FSM**              | Finite State Machine(유한 상태 머신). **유한한 상태 집합**과 **상태 간 전이 규칙**으로 시스템을 모델링 | 불가능한 상태 조합을 원천 차단한다               |
| **State Transition** | 하나의 상태에서 다른 상태로의 전환. action이 전이를 촉발한다                                           | reducer의 각 case가 하나의 전이를 정의한다       |
| **Payload**          | action 객체에 포함된 **추가 데이터**. type 외에 필요한 정보를 전달                                     | reducer가 새 State를 계산하는 데 필요한 입력이다 |
| **Init Function**    | useReducer의 세 번째 인자. **초기 State를 계산하는 함수**로 Lazy Initialization에 사용                 | 무거운 초기값 계산을 첫 렌더링에서만 실행한다    |

### 2.2 용어 간 관계 다이어그램

![useReducer 구성 요소 관계](/developer-open-book/diagrams/react-step13-component-relations.svg)

### 2.3 Reducer 패턴의 이론적 뿌리

Reducer 함수의 이름은 JavaScript 배열 메서드 `Array.prototype.reduce`에서 유래했다. `reduce`는 배열의 각 요소를 순서대로 처리하여 하나의 값으로 줄이는(reduce) 함수다.

```
Array.reduce((accumulator, currentValue) => newAccumulator, initialValue)
Redux/useReducer Reducer: (currentState, action) => newState
```

두 함수의 구조가 같다. 누산기(accumulator)가 현재 State이고, 각 배열 요소가 action이다. 여러 action을 순서대로 처리하면 최종 State에 도달한다. 이 관점에서 **애플리케이션의 State는 action의 누적 결과**다.

이 패턴이 강력한 이유가 여기에 있다. action의 기록(로그)이 있으면, 초기 State에서 시작하여 action을 순서대로 재적용하는 것만으로 임의 시점의 State를 재현할 수 있다. Redux DevTools의 시간 여행 디버깅, 낙관적 업데이트, 이벤트 소싱(Event Sourcing) 아키텍처 모두 이 원리에 기반한다.

### 2.4 useReducer의 데이터 흐름

![useReducer 데이터 흐름](/developer-open-book/diagrams/react-step13-data-flow.svg)

---

## 3. 이론과 원리

### 3.1 useReducer의 기본 구조

#### API 형태

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
//     ↑        ↑                    ↑          ↑
//   현재 State  액션 전달 함수     리듀서 함수   초기 State
```

#### 최소 예제: 카운터

```jsx
import { useReducer } from "react";

// 1. Reducer 함수 정의 (컴포넌트 밖에 선언하는 것이 일반적)
function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    case "SET":
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// 2. 컴포넌트에서 사용
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>카운트: {state.count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+1</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-1</button>
      <button onClick={() => dispatch({ type: "RESET" })}>초기화</button>
      <button onClick={() => dispatch({ type: "SET", payload: 100 })}>
        100으로 설정
      </button>
    </div>
  );
}
```

```
이 예제에서 확인할 수 있는 것:

  1. reducer는 (state, action) => newState 형태의 순수 함수
  2. action은 { type, payload? } 형태의 객체
  3. dispatch(action)으로 State 변경을 요청
  4. reducer가 switch로 action.type에 따라 새 State를 반환
  5. 알 수 없는 action은 에러를 던진다 (안전장치)
  6. reducer는 컴포넌트 밖에 정의 (순수 함수이므로 외부 의존성 없음)
```

### 3.2 Reducer 함수의 작성 규칙

#### 규칙 1: 순수 함수여야 한다

```jsx
// ✅ 순수 — 같은 (state, action) → 항상 같은 결과
function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}

// ❌ 불순 — 외부 변수 의존
let nextId = 0;
function badReducer(state, action) {
  switch (action.type) {
    case "ADD":
      nextId++; // 외부 변수 변경!
      return {
        ...state,
        items: [...state.items, { id: nextId, ...action.payload }],
      };
    default:
      return state;
  }
}

// ❌ 불순 — 비동기 작업, 부수 효과
function badReducer(state, action) {
  switch (action.type) {
    case "FETCH":
      fetch("/api/data"); // 부수 효과! reducer 안에서 금지!
      return state;
    default:
      return state;
  }
}
```

```
Reducer가 순수해야 하는 이유 (Step 10 복습)

  · Reducer는 Render Phase에서 호출된다
  · Render Phase는 중단·재개·반복 실행될 수 있다
  · StrictMode에서 두 번 호출될 수 있다
  · 부수 효과가 있으면 중복 실행 시 문제 발생!

  → 부수 효과(API 호출 등)는 useEffect에서 처리한다
  → ID 생성은 action을 dispatch하기 전에 한다
```

#### 규칙 2: State를 직접 변경하지 않는다 (Immutable)

```jsx
// ❌ 직접 변경 (Mutation)
function badReducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      state.todos.push(action.payload); // 원본 배열 변경!
      return state; // 같은 참조 → React가 변경 감지 못함!
    default:
      return state;
  }
}

// ✅ 새 객체 생성 (Immutable Update)
function goodReducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, action.payload], // 새 배열 생성
      };
    default:
      return state;
  }
}
```

#### 규칙 3: 모든 State 속성을 반환한다

```jsx
// ❌ 일부 속성 누락
function badReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { name: action.payload }; // age, email 등이 사라짐!
    default:
      return state;
  }
}

// ✅ Spread로 기존 속성 유지 후 변경분만 덮어쓰기
function goodReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload }; // 나머지 속성 유지
    default:
      return state;
  }
}
```

#### 규칙 4: default case에서 원본 State를 반환하거나 에러를 던진다

```jsx
// 방식 1: 원본 반환 (유연함)
default:
  return state;

// 방식 2: 에러 던지기 (엄격함, 오타 조기 발견)
default:
  throw new Error(`Unknown action type: ${action.type}`);
```

### 3.3 Action 설계 전략

#### Action의 구조

```
Action 객체의 일반적 형태

  {
    type: 'ACTION_NAME',        // 필수: 무엇이 일어났는가
    payload: data               // 선택: 추가 데이터
  }

  type 네이밍 컨벤션:
    · SCREAMING_SNAKE_CASE: 'ADD_TODO', 'DELETE_ITEM'
    · 또는 domain/action: 'todos/add', 'user/login'
    · 팀 내에서 일관성이 중요

  payload 설계:
    · 최소한의 데이터만 포함
    · reducer가 새 State를 계산하는 데 필요한 정보만 전달
```

#### "무엇이 일어났는가" vs "어떻게 변경하라"

```jsx
// ❌ "어떻게 변경하라" 스타일 — setter와 다를 바 없음
dispatch({ type: "SET_TODOS", payload: [...todos, newTodo] });
dispatch({ type: "SET_LOADING", payload: true });
dispatch({ type: "SET_ERROR", payload: null });

// ✅ "무엇이 일어났는가" 스타일 — 이벤트를 서술
dispatch({ type: "TODO_ADDED", payload: { text: "새 할 일" } });
dispatch({ type: "FETCH_STARTED" });
dispatch({ type: "FETCH_SUCCEEDED", payload: data });
dispatch({ type: "FETCH_FAILED", payload: error.message });
```

```
"무엇이 일어났는가" 스타일의 장점

  1. reducer가 "하나의 action에 여러 State를 동시에 변경"할 수 있다
     · 'FETCH_STARTED' → isLoading=true, error=null 동시에 처리
     · "setter" 스타일이면 dispatch를 2번 호출해야 함

  2. action 로그만 봐도 앱에서 일어난 일을 추적할 수 있다
     · [TODO_ADDED, FETCH_STARTED, FETCH_SUCCEEDED, TODO_TOGGLED]
     · 시간순으로 "이야기"가 된다

  3. reducer를 수정하지 않고 action의 처리 방식을 변경할 수 있다
     · 'TODO_ADDED' 시 analytics 이벤트를 추가로 보내고 싶다면?
     · reducer에서 해당 case만 수정하면 끝
```

### 3.4 useState vs useReducer 선택 기준

#### 비교표

```
┌────────────────────┬───────────────────────┬───────────────────────┐
│                    │  useState             │  useReducer           │
├────────────────────┼───────────────────────┼───────────────────────┤
│  State 구조        │  단순 값 (숫자, 문자열, │  복합 객체, 관련된     │
│                    │  boolean, 단순 객체)   │  여러 값이 함께 변경   │
│  업데이트 로직     │  간단 (값 교체, +1 등) │  복잡한 조건부 전이    │
│  관련 State 수     │  1~2개               │  3개 이상              │
│  동시 변경        │  setState 여러 번 호출 │  하나의 dispatch로 처리│
│  상태 전이 명시성  │  암묵적 (핸들러에 분산) │  명시적 (reducer 집중) │
│  테스트 용이성     │  보통                 │  높음 (순수 함수)      │
│  디버깅           │  핸들러 추적 필요      │  action 로그 추적      │
│  코드량           │  적음                 │  더 많음 (보일러플레이트)│
│  학습 곡선        │  낮음                 │  중간                  │
└────────────────────┴───────────────────────┴───────────────────────┘
```

#### 선택 흐름도

```
"useState vs useReducer?"

  ┌─ State가 단순 값인가? (boolean, 숫자, 문자열)
  │    YES → useState
  │
  ├─ 관련된 State가 3개 이상이고 함께 변경되는가?
  │    YES → useReducer 고려
  │
  ├─ "하나의 행동"에 여러 State를 동시에 변경해야 하는가?
  │    YES → useReducer 고려
  │
  ├─ State 전이에 복잡한 조건 로직이 있는가?
  │    YES → useReducer
  │
  ├─ "불가능한 상태 조합"을 방지해야 하는가?
  │    YES → useReducer + FSM 패턴
  │
  └─ 위 어느 것도 해당하지 않는가?
       → useState (기본 선택)
```

#### useState에서 useReducer로의 리팩토링 시점

```jsx
// 이런 코드가 보이면 useReducer를 고려한다

// 징후 1: 하나의 핸들러에 setState가 3개 이상
const handleSubmit = () => {
  setIsLoading(true);
  setError(null);
  setFormData(null);
  setStep("submitting");
  // → 하나의 'SUBMIT' action으로 대체 가능
};

// 징후 2: 여러 핸들러에 비슷한 setState 조합이 반복
const handleSuccess = () => {
  setIsLoading(false);
  setData(result);
  setError(null);
};
const handleError = () => {
  setIsLoading(false);
  setData(null);
  setError(err);
};
// → 'FETCH_SUCCEEDED', 'FETCH_FAILED' action으로 대체

// 징후 3: State 간 의존성이 복잡
if (status === "editing" && editingId !== null && editText !== "") {
  // 상태 조합이 유효한지 수동으로 확인
}
// → reducer에서 유효한 전이만 허용
```

### 3.5 실전 패턴: 복합 State 관리

#### 패턴 1: 데이터 패칭 상태 관리

```jsx
// Step 11에서 useState로 구현했던 패칭 로직을 useReducer로 리팩토링

// 초기 State
const initialState = {
  data: null,
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  error: null,
};

// Reducer
function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_STARTED":
      return { ...state, status: "loading", error: null };
    // 한 action으로 status와 error를 동시에 변경

    case "FETCH_SUCCEEDED":
      return { ...state, status: "success", data: action.payload };

    case "FETCH_FAILED":
      return { ...state, status: "error", error: action.payload };

    case "RESET":
      return initialState;

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// 컴포넌트
function UserProfile({ userId }) {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchUser() {
      dispatch({ type: "FETCH_STARTED" });
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        dispatch({ type: "FETCH_SUCCEEDED", payload: data });
      } catch (err) {
        if (err.name !== "AbortError") {
          dispatch({ type: "FETCH_FAILED", payload: err.message });
        }
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  // Guard Clause (Step 9 복습)
  if (state.status === "idle") return null;
  if (state.status === "loading") return <p>로딩 중...</p>;
  if (state.status === "error") return <p>에러: {state.error}</p>;

  return (
    <div>
      <h1>{state.data.name}</h1>
    </div>
  );
}
```

```
useState 버전 vs useReducer 버전 비교

  useState:
    setIsLoading(true); setError(null);                    // FETCH_STARTED
    setIsLoading(false); setData(data);                    // FETCH_SUCCEEDED
    setIsLoading(false); setError(err.message);            // FETCH_FAILED

    · 3개의 setState를 정확한 조합으로 호출해야 한다
    · 하나라도 빠뜨리면 모순 발생 (isLoading=true이면서 error=true?)

  useReducer:
    dispatch({ type: 'FETCH_STARTED' });                   // 한 번 호출
    dispatch({ type: 'FETCH_SUCCEEDED', payload: data });  // 한 번 호출
    dispatch({ type: 'FETCH_FAILED', payload: err });      // 한 번 호출

    · 하나의 dispatch로 관련 State가 모두 올바르게 변경된다
    · reducer가 모순 없는 State를 보장한다
```

#### 패턴 2: 폼 State 관리

```jsx
const initialFormState = {
  values: { name: "", email: "", password: "" },
  errors: {},
  touched: {},
  isSubmitting: false,
  submitCount: 0,
};

function formReducer(state, action) {
  switch (action.type) {
    case "FIELD_CHANGED":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        // 필드 변경 시 해당 필드의 에러를 초기화
        errors: { ...state.errors, [action.field]: undefined },
      };

    case "FIELD_BLURRED":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };

    case "VALIDATION_FAILED":
      return {
        ...state,
        errors: action.errors,
        isSubmitting: false,
      };

    case "SUBMIT_STARTED":
      return {
        ...state,
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      };

    case "SUBMIT_SUCCEEDED":
      return initialFormState; // 폼 초기화

    case "SUBMIT_FAILED":
      return {
        ...state,
        isSubmitting: false,
        errors: { submit: action.error },
      };

    case "RESET":
      return initialFormState;

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function RegistrationForm() {
  const [form, dispatch] = useReducer(formReducer, initialFormState);

  const handleChange = (e) => {
    dispatch({
      type: "FIELD_CHANGED",
      field: e.target.name,
      value: e.target.value,
    });
  };

  const handleBlur = (e) => {
    dispatch({ type: "FIELD_BLURRED", field: e.target.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form.values);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "VALIDATION_FAILED", errors });
      return;
    }
    dispatch({ type: "SUBMIT_STARTED" });
    try {
      await registerUser(form.values);
      dispatch({ type: "SUBMIT_SUCCEEDED" });
    } catch (err) {
      dispatch({ type: "SUBMIT_FAILED", error: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={form.values.name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {form.touched.name && form.errors.name && (
        <span className="error">{form.errors.name}</span>
      )}
      {/* email, password 필드도 동일 패턴 */}
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "제출 중..." : "가입"}
      </button>
    </form>
  );
}
```

#### 패턴 3: Todo 앱 CRUD

```jsx
function todoReducer(state, action) {
  switch (action.type) {
    case "TODO_ADDED":
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: action.payload.id,
            text: action.payload.text,
            done: false,
          },
        ],
      };

    case "TODO_TOGGLED":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, done: !todo.done } : todo,
        ),
      };

    case "TODO_DELETED":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    case "TODO_EDITED":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo,
        ),
        editingId: null, // 편집 모드 종료
      };

    case "EDIT_STARTED":
      return {
        ...state,
        editingId: action.payload,
      };

    case "EDIT_CANCELLED":
      return {
        ...state,
        editingId: null,
      };

    case "FILTER_CHANGED":
      return {
        ...state,
        filter: action.payload, // 'all' | 'active' | 'completed'
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

### 3.6 유한 상태 머신(FSM) 개념

#### FSM이란

```
유한 상태 머신(Finite State Machine)

  · 시스템이 취할 수 있는 상태가 유한하다
  · 한 번에 하나의 상태만 가진다
  · 특정 이벤트(action)에 의해 상태가 전이된다
  · 허용되지 않은 전이는 발생하지 않는다

예시: 신호등

  상태: { RED, YELLOW, GREEN }
  전이:
    RED    + TIMER → GREEN
    GREEN  + TIMER → YELLOW
    YELLOW + TIMER → RED

  불가능한 전이:
    RED → YELLOW (직접 전이 없음)
    GREEN → RED (직접 전이 없음)
```

#### FSM 패턴이 해결하는 "불가능한 상태" 문제

복수의 boolean State를 사용할 때 이론적으로 불가능한 조합이 생긴다.

```
isLoading=true, isError=true, isSuccess=true 가 동시에 가능?

  boolean 3개로 표현 가능한 조합: 2^3 = 8가지
  실제 의미 있는 상태:
    · idle:    isLoading=false, isError=false, isSuccess=false
    · loading: isLoading=true,  isError=false, isSuccess=false
    · error:   isLoading=false, isError=true,  isSuccess=false
    · success: isLoading=false, isError=false, isSuccess=true

  나머지 4가지 조합은 불가능해야 하지만 코드로는 표현 가능!
  → 버그의 온상

FSM 해결책:
  status: 'idle' | 'loading' | 'error' | 'success'
  → 4가지 상태만 가능, 조합 자체가 불가능
```

#### React에서의 FSM 적용

```jsx
// 데이터 패칭의 상태 머신

// 가능한 상태와 전이를 명시적으로 정의
const transitions = {
  idle: { FETCH: "loading" },
  loading: { SUCCESS: "success", FAILURE: "error" },
  success: { FETCH: "loading", RESET: "idle" },
  error: { FETCH: "loading", RESET: "idle" },
};

function fsmReducer(state, action) {
  // 현재 상태에서 허용된 전이만 처리
  const nextStatus = transitions[state.status]?.[action.type];

  if (!nextStatus) {
    // 허용되지 않은 전이 → 무시하거나 경고
    console.warn(`Invalid transition: ${state.status} + ${action.type}`);
    return state;
  }

  // 전이에 따른 데이터 처리
  switch (action.type) {
    case "FETCH":
      return { ...state, status: "loading", error: null };
    case "SUCCESS":
      return { ...state, status: "success", data: action.payload };
    case "FAILURE":
      return { ...state, status: "error", error: action.payload };
    case "RESET":
      return { status: "idle", data: null, error: null };
    default:
      return state;
  }
}
```

```
FSM의 장점

  1. 불가능한 상태를 원천 차단
     · loading 상태에서 다시 FETCH → 무시됨 (중복 요청 방지)
     · idle 상태에서 SUCCESS → 무시됨 (올바르지 않은 전이)

  2. 상태 다이어그램으로 시각화 가능

     idle ──FETCH──→ loading
      ↑                ↙   ↘
     RESET          SUCCESS  FAILURE
      ↑              ↓          ↓
     success ←───────┘     error

  3. 모든 가능한 전이가 명시적으로 문서화됨
     · "loading에서 RESET하면 어떻게 되지?" → transitions 확인
     · 누락된 전이를 쉽게 발견

  4. Step 6의 "모순 가능 State 제거" 원칙의 완성형
     · isLoading=true이면서 error가 있는 상태? → 불가능!
     · status 하나로 상호 배타적 상태를 표현
```

### 3.7 초기화 함수(init)와 Lazy Initialization

```jsx
// 일반 초기화
const [state, dispatch] = useReducer(reducer, { count: 0 });

// Lazy Initialization — 세 번째 인자로 init 함수 전달
function init(initialCount) {
  // 무거운 초기값 계산 (localStorage 읽기, 복잡한 데이터 구조 생성 등)
  return {
    count: initialCount,
    history: [],
    lastModified: null,
  };
}

const [state, dispatch] = useReducer(reducer, 0, init);
//                                          ↑     ↑
//                                    initialArg  init 함수
// init(0) → { count: 0, history: [], lastModified: null }

// init 함수는 첫 렌더링에서만 호출된다 (Lazy)
// useState(() => expensiveComputation())과 동일한 최적화
```

```
init 함수가 유용한 경우

  1. 초기 State를 Props에서 계산할 때
     const [state, dispatch] = useReducer(reducer, props.userId, (userId) => ({
       userId,
       data: null,
       status: 'idle',
     }));

  2. RESET action에서 초기값으로 돌아갈 때
     case 'RESET':
       return init(action.payload);  // init 함수를 재사용!
```

### 3.8 useReducer + useContext 조합 (미리보기)

```
useReducer + useContext를 결합하면
전역 상태 관리의 기본 구조를 만들 수 있다

  Context로 [state, dispatch]를 하위 트리 전체에 제공
  → Props Drilling 없이 어디서든 State를 읽고 dispatch 가능

  이 패턴은 Step 25(Context API)에서 상세히 학습한다
  지금은 "useReducer는 Context와 결합하여 더 강력해진다"는 것만 인지

  ┌─────────────────────────────────────┐
  │  App                                │
  │  useReducer(reducer, initialState)  │
  │  <StateContext.Provider value={...}>│
  │    ├── Header → useContext로 접근   │
  │    ├── Main → useContext로 접근     │
  │    └── Footer → useContext로 접근   │
  │  </StateContext.Provider>           │
  └─────────────────────────────────────┘
```

---

## 4. 사례 연구와 예시

### 4.1 사례: useState에서 useReducer로 리팩토링

```jsx
// ❌ Before: useState로 관리 — 여러 setState 조합
function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setError(null); // 에러 초기화도 함께 해야 할까?
  };

  const checkout = async () => {
    setIsCheckingOut(true);
    setError(null);
    try {
      await processPayment(items, coupon);
      setItems([]);
      setCoupon("");
      setCouponApplied(false);
      setIsCheckingOut(false);
    } catch (err) {
      setError(err.message);
      setIsCheckingOut(false);
    }
  };
  // ...
}

// ✅ After: useReducer로 리팩토링 — action 기반 명확한 전이
const initialCartState = {
  items: [],
  coupon: "",
  couponApplied: false,
  status: "idle", // 'idle' | 'checking_out' | 'completed' | 'error'
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ITEM_ADDED": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      return {
        ...state,
        items: existing
          ? state.items.map((i) =>
              i.id === action.payload.id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            )
          : [...state.items, { ...action.payload, quantity: 1 }],
        error: null,
      };
    }

    case "ITEM_REMOVED":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

    case "QUANTITY_CHANGED":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i,
        ),
      };

    case "COUPON_APPLIED":
      return { ...state, coupon: action.payload, couponApplied: true };

    case "CHECKOUT_STARTED":
      return { ...state, status: "checking_out", error: null };

    case "CHECKOUT_SUCCEEDED":
      return initialCartState; // 완전 초기화

    case "CHECKOUT_FAILED":
      return { ...state, status: "error", error: action.payload };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

```
리팩토링의 이점

  1. 모든 State 전이가 cartReducer 한 곳에 집중
  2. 'CHECKOUT_SUCCEEDED'가 모든 관련 State를 한 번에 초기화
  3. 새 기능(쿠폰 제거, 수량 변경 등) 추가 시 case만 추가
  4. action 로그: [ITEM_ADDED, ITEM_ADDED, COUPON_APPLIED, CHECKOUT_STARTED, ...]
  5. reducer를 컴포넌트 외부에서 독립적으로 테스트 가능
```

### 4.2 사례: 멀티 스텝 폼의 상태 머신

```jsx
// 다단계 가입 폼: 정보 입력 → 약관 동의 → 확인 → 완료

const stepTransitions = {
  info: { NEXT: "terms", CANCEL: "cancelled" },
  terms: { NEXT: "confirm", BACK: "info", CANCEL: "cancelled" },
  confirm: { SUBMIT: "submitting", BACK: "terms", CANCEL: "cancelled" },
  submitting: { SUCCESS: "completed", FAILURE: "confirm" },
  completed: {}, // 종료 상태 — 더 이상 전이 없음
  cancelled: { RESTART: "info" },
};

function wizardReducer(state, action) {
  const nextStep = stepTransitions[state.step]?.[action.type];

  if (!nextStep) return state; // 허용되지 않은 전이 무시

  switch (action.type) {
    case "NEXT":
    case "BACK":
      return { ...state, step: nextStep };

    case "SUBMIT":
      return { ...state, step: nextStep };

    case "SUCCESS":
      return { ...state, step: nextStep };

    case "FAILURE":
      return { ...state, step: nextStep, error: action.payload };

    case "CANCEL":
      return { ...state, step: nextStep };

    case "RESTART":
      return { step: "info", data: {}, error: null };

    case "DATA_UPDATED":
      return { ...state, data: { ...state.data, ...action.payload } };

    default:
      return state;
  }
}
```

```
상태 다이어그램

  info ──NEXT──→ terms ──NEXT──→ confirm ──SUBMIT──→ submitting
   ↑              ↑ BACK           ↑ BACK               ↙     ↘
   │              │                │               SUCCESS    FAILURE
   │              └────────────────┘                  ↓          ↓
   │                                              completed   confirm
   │                                                            │
   └──────────RESTART──── cancelled ←──CANCEL── (info/terms/confirm)

  · 각 상태에서 가능한 action이 명확히 정의됨
  · submitting에서 BACK? → 불가능 (결제 진행 중이므로)
  · completed에서 NEXT? → 불가능 (이미 완료)
  · 전이 테이블만 봐도 전체 흐름을 파악할 수 있다
```

### 4.3 사례: Reducer 테스트의 용이성

```javascript
// reducer는 순수 함수이므로 컴포넌트 없이 독립적으로 테스트 가능

// test('TODO_ADDED는 새 항목을 추가한다', () => {
//   const state = { todos: [{ id: 1, text: '기존', done: false }] };
//   const action = { type: 'TODO_ADDED', payload: { id: 2, text: '새 항목' } };
//   const newState = todoReducer(state, action);
//
//   expect(newState.todos).toHaveLength(2);
//   expect(newState.todos[1].text).toBe('새 항목');
//   expect(newState.todos[1].done).toBe(false);
// });

// test('TODO_TOGGLED는 done을 반전한다', () => {
//   const state = { todos: [{ id: 1, text: '할 일', done: false }] };
//   const action = { type: 'TODO_TOGGLED', payload: 1 };
//   const newState = todoReducer(state, action);
//
//   expect(newState.todos[0].done).toBe(true);
// });

// test('알 수 없는 action은 에러를 던진다', () => {
//   const state = { todos: [] };
//   expect(() => todoReducer(state, { type: 'INVALID' })).toThrow();
// });

// → 입력(state + action)과 출력(newState)만 검증
// → DOM, 이벤트, 렌더링 없이 순수 로직만 테스트
// → 테스트 작성이 간단하고 실행이 빠르다
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: useState → useReducer 리팩토링 [Applying]

**목표:** 기존 useState 코드를 useReducer로 리팩토링한다.

아래 코드를 useReducer로 변환하라.

```jsx
function BookManager() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetch("/api/books").then((r) => r.json());
      setBooks(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const addBook = (book) => {
    setBooks((prev) => [...prev, { ...book, id: Date.now() }]);
  };

  const removeBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleRead = (id) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isRead: !b.isRead } : b)),
    );
  };

  // ...
}
```

**작성할 것:**

- initialState 객체
- bookReducer 함수 (action type 목록 설계)
- 컴포넌트에서 dispatch 사용으로 변환
- action은 "무엇이 일어났는가" 스타일로 네이밍

---

### 실습 2: 유한 상태 머신 설계 [Analyzing · Evaluating]

**목표:** FSM 관점에서 State 전이를 설계한다.

**음악 플레이어**의 상태 머신을 설계하라.

```
요구사항:
  · 상태: stopped, playing, paused, loading
  · 이벤트: PLAY, PAUSE, STOP, LOAD, LOADED, ERROR

  설계할 것:
  1. 상태 전이 테이블 (어떤 상태에서 어떤 이벤트로 어떤 상태가 되는가)
  2. 상태 다이어그램 (ASCII 아트)
  3. "불가능한 전이" 목록 (예: playing에서 LOADED → 불가능)
  4. reducer 함수 구현
  5. 현재 상태에 따라 활성화/비활성화할 버튼 결정 (파생 데이터)
```

---

### 실습 3: 복합 폼 State 관리 [Applying]

**목표:** useReducer로 복잡한 폼 상태를 관리한다.

**주문 폼**을 만든다:

```
요구사항:
  · 배송 정보: 이름, 주소, 전화번호
  · 결제 정보: 카드번호, 유효기간, CVC
  · 주문 옵션: 선물포장 여부, 배송 메모
  · 각 필드의 touched 상태 추적
  · 필드별 유효성 검증 에러 관리
  · 제출 상태 (idle, submitting, succeeded, failed)
  · "전체 초기화" 기능

  action 설계:
    FIELD_CHANGED, FIELD_BLURRED, SUBMIT_STARTED,
    SUBMIT_SUCCEEDED, SUBMIT_FAILED, RESET
```

---

### 실습 4 (선택): action 로그 디버거 [Creating]

**목표:** dispatch된 action을 기록하여 디버깅 도구를 만든다.

```
요구사항:
  · useReducer를 감싸는 커스텀 Hook: useReducerWithLog
  · dispatch할 때마다 action과 이전/이후 State를 콘솔에 출력
  · action 히스토리를 배열로 저장
  · "되돌리기(Undo)" 기능 구현 (히스토리에서 이전 State 복원)

힌트:
  function useReducerWithLog(reducer, initialState) {
    const [state, originalDispatch] = useReducer(reducer, initialState);
    const historyRef = useRef([initialState]);

    const dispatch = (action) => {
      console.group(`Action: ${action.type}`);
      console.log('이전 State:', state);
      originalDispatch(action);
      // ... 로깅 + 히스토리 저장
      console.groupEnd();
    };

    return [state, dispatch, { undo, history: historyRef.current }];
  }
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 13 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. useReducer = dispatch(action) → reducer(state, action)    │
│     → newState                                               │
│     → "무엇이 일어났는가"와 "어떻게 변하는가"를 분리           │
│     → State 전이 로직을 reducer 한 곳에 집중                  │
│                                                               │
│  2. Reducer는 순수 함수이다                                   │
│     → (state, action) => newState                            │
│     → 직접 State 변경 금지 (Immutable 업데이트)               │
│     → 부수 효과 금지 (API 호출, 타이머 등은 useEffect에서)    │
│     → 컴포넌트 없이 독립적으로 테스트 가능                    │
│                                                               │
│  3. Action은 "무엇이 일어났는가"를 서술한다                    │
│     → { type: 'EVENT_NAME', payload: data }                  │
│     → "SET_X" 보다 "X_HAPPENED" 스타일이 낫다                │
│     → 하나의 action으로 여러 State를 동시에 변경 가능          │
│                                                               │
│  4. useState vs useReducer 선택 기준                          │
│     → 단순 값, 독립적 State → useState                       │
│     → 복합 객체, 함께 변경, 복잡한 조건 → useReducer          │
│     → "하나의 행동에 setState 3개+"가 보이면 useReducer 고려   │
│                                                               │
│  5. FSM(유한 상태 머신)으로 불가능한 상태를 원천 차단한다      │
│     → 가능한 상태와 전이를 명시적으로 정의                    │
│     → 허용되지 않은 전이는 무시                               │
│     → 상태 다이어그램으로 시각화 가능                         │
│     → Step 6의 "모순 방지" 원칙의 완성형                     │
│                                                               │
│  6. 실전 패턴: 데이터 패칭, 폼 관리, CRUD, 멀티 스텝          │
│     → 패칭: FETCH_STARTED → SUCCEEDED/FAILED                 │
│     → 폼: FIELD_CHANGED, FIELD_BLURRED, SUBMIT_*            │
│     → CRUD: ITEM_ADDED, ITEM_TOGGLED, ITEM_DELETED          │
│                                                               │
│  7. init 함수로 초기값을 Lazy하게 계산할 수 있다              │
│     → useReducer(reducer, initialArg, init)                  │
│     → RESET action에서 init을 재사용 가능                    │
│                                                               │
│  8. useReducer + useContext = 간단한 전역 상태 관리           │
│     → Props Drilling 없이 dispatch를 하위 트리에 전달         │
│     → Step 25에서 상세 학습                                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | useReducer의 3가지 구성 요소(state, dispatch, reducer)의 역할을 각각 설명하라         | Remember   | 3.1         |
| 2   | reducer가 순수 함수여야 하는 이유를 Render Phase 관점에서 설명하라                    | Understand | 3.2         |
| 3   | `'SET_LOADING'` 대신 `'FETCH_STARTED'`가 더 나은 action 네이밍인 이유는?              | Understand | 3.3         |
| 4   | "하나의 핸들러에 setState가 3개 이상"일 때 useReducer를 고려하는 이유는?              | Understand | 3.4         |
| 5   | 데이터 패칭 reducer에서 FETCH_STARTED action이 error를 null로 초기화하는 이유는?      | Apply      | 3.5         |
| 6   | FSM에서 "허용되지 않은 전이를 무시"하는 것의 실질적 이점은?                           | Analyze    | 3.6         |
| 7   | reducer를 컴포넌트 없이 독립적으로 테스트할 수 있는 이유는?                           | Analyze    | 4.3         |
| 8   | useState로 5개 State를 관리하는 코드에서 useReducer로 리팩토링해야 하는 징후 3가지는? | Evaluate   | 3.4         |

### 6.3 FAQ

**Q1. useReducer와 Redux의 차이가 무엇인가요?**

useReducer는 컴포넌트 로컬 상태를 Reducer 패턴으로 관리하는 React 내장 Hook입니다. Redux는 애플리케이션 전체의 전역 상태를 단일 Store에서 관리하는 외부 라이브러리입니다. 핵심 차이는 스코프(로컬 vs 전역)와 미들웨어 지원, 시간 여행 디버깅 등 부가 기능입니다. useReducer를 useContext와 결합하면 간단한 전역 상태 관리가 가능하지만, 미들웨어나 고급 디버깅이 필요하다면 Redux Toolkit 같은 전용 솔루션이 적합합니다.

**Q2. reducer 안에서 절대로 비동기 코드를 쓸 수 없나요?**

네, reducer는 반드시 순수 동기 함수여야 합니다. API 호출 같은 비동기 작업은 반드시 useEffect나 이벤트 핸들러 안에서 처리하고, 결과를 dispatch로 reducer에 전달해야 합니다. Redux-Thunk나 Redux-Saga 같은 Redux 미들웨어가 비동기 action을 지원하지만, useReducer 자체는 그런 기능이 없습니다. useReducer에서 비동기 패턴은 `dispatch({ type: 'FETCH_STARTED' })` → `await fetch(...)` → `dispatch({ type: 'FETCH_SUCCEEDED', payload: data })` 형태로 작성합니다.

**Q3. 모든 경우에 useReducer가 useState보다 낫지 않나요?**

그렇지 않습니다. 단순한 상태(토글, 카운터, 단일 입력값)에 useReducer를 사용하면 오히려 코드가 불필요하게 복잡해집니다. Reducer 함수 정의, action 타입 상수, initial state 객체 등 보일러플레이트(boilerplate) 코드가 늘어납니다. "관련된 여러 State가 함께 변경된다" 또는 "하나의 행동에 여러 State를 동시에 바꿔야 한다"는 조건에 해당할 때 useReducer를 도입하는 것이 적절합니다.

**Q4. action type을 문자열 상수로 분리해야 하나요?**

작은 프로젝트에서는 인라인 문자열로 충분합니다. 그러나 프로젝트가 커지면 오타로 인한 버그를 방지하기 위해 상수로 분리하거나, TypeScript의 union 타입 또는 enum을 사용하는 것이 좋습니다. 예: `const TODO_ADDED = 'TODO_ADDED'` 또는 TypeScript에서 `type Action = { type: 'TODO_ADDED', payload: Todo } | { type: 'TODO_DELETED', payload: number }`. TypeScript와 함께 사용하면 잘못된 action type을 컴파일 타임에 잡을 수 있어 매우 안전합니다.

**Q5. FSM 라이브러리(XState 등)와 useReducer의 차이는 무엇인가요?**

useReducer로도 FSM 패턴을 구현할 수 있지만, 완전한 FSM 라이브러리(XState, Zustand의 FSM 기능 등)는 더 풍부한 기능을 제공합니다. 중첩 상태(Nested States), 병렬 상태(Parallel States), 가드(Guards, 조건부 전이), 진입/퇴장 액션(Entry/Exit Actions) 등을 지원합니다. 복잡한 UI 흐름(게임, 다단계 마법사, 복잡한 애니메이션)에는 XState 같은 전용 라이브러리가 적합하고, 비교적 단순한 상태 관리에는 useReducer로 FSM 패턴을 구현하는 것이 충분합니다.

---

## 7. 다음 단계 예고

> **Step 14. 메모이제이션 전략**
>
> - useMemo: 비용이 큰 계산의 캐싱
> - useCallback: 함수 참조의 안정화
> - React.memo: Props 비교로 재렌더링 건너뛰기
> - "언제 쓰지 말아야 하는가" — 과도한 최적화의 해악
> - React Profiler를 활용한 성능 측정 기반 판단
> - React 19 Compiler가 메모이제이션에 미치는 영향

---

## 📚 참고 자료

- [React 공식 문서 — Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [React 공식 문서 — useReducer Reference](https://react.dev/reference/react/useReducer)
- [React 공식 문서 — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React 공식 문서 — Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [XState Documentation — Finite State Machines](https://xstate.js.org/docs/about/concepts.html)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 13 of 42
