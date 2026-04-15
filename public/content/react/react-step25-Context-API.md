# Step 25. Context API 심화

> **난이도:** 🔴 고급 (Advanced)

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다 — **Phase 4 시작**

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| **Remember**   | createContext, Provider, useContext의 역할을 기술할 수 있다                             |
| **Understand** | Context가 해결하는 문제(Props Drilling)와 동작 원리를 설명할 수 있다                    |
| **Understand** | Context의 리렌더링 특성(Provider value 변경 → 모든 소비자 리렌더링)을 설명할 수 있다    |
| **Apply**      | useReducer + Context를 결합하여 전역 상태 관리를 구현할 수 있다                         |
| **Analyze**    | Context의 리렌더링 문제를 식별하고 최적화 전략을 분석할 수 있다                         |
| **Evaluate**   | Context가 적합한 경우와 전역 상태 라이브러리(Zustand 등)가 필요한 시점을 판단할 수 있다 |

**전제 지식:**

- Step 5: Props, Props Drilling, 단방향 데이터 흐름
- Step 13: useReducer, action/dispatch 패턴
- Step 14: React.memo, useMemo, useCallback
- Step 16: Custom Hook

---

## 1. 서론 — Props Drilling이 만드는 고통

### 1.1 컴포넌트 트리의 성장과 데이터 전달 문제

React 애플리케이션은 컴포넌트 트리로 구성된다. 초기에는 트리가 얕아서 데이터를 Props로 전달하는 것이 자연스럽다. 하지만 애플리케이션이 성장하면서 트리의 깊이가 깊어지고, 여러 계층에 걸쳐 같은 데이터가 필요한 상황이 생긴다. 이때 Props Drilling이 시작된다.

Props Drilling은 단순히 코드가 길어지는 미학적 문제가 아니다. 중간 컴포넌트가 사용하지도 않는 Props를 받아서 전달해야 하는 상황은 의도치 않은 결합(coupling)을 만든다. 중간 컴포넌트의 인터페이스가 상위 컴포넌트의 데이터 구조에 종속되기 때문에, 데이터 구조가 변경되면 사용하지도 않는 중간 컴포넌트까지 수정해야 한다.

대규모 팀에서는 이 문제가 더 심각하다. 컴포넌트 A에서 데이터를 추가하면, 그 데이터를 필요로 하는 컴포넌트 Z까지의 모든 중간 컴포넌트(B, C, D...)를 담당하는 팀원들에게 변경 사항을 알리고 수정을 요청해야 한다. Context는 이 과정을 "데이터를 위로 끌어올리고, 필요한 곳에서 직접 꺼내 쓴다"는 방식으로 해결한다.

### 1.2 Props Drilling 문제 복습

Step 5에서 Props Drilling을 소개했다. "데이터를 사용하지 않는 중간 컴포넌트가 단순히 전달만 하기 위해 Props를 받아야 하는" 문제이다.

```jsx
// ❌ Props Drilling — theme이 App → Layout → Sidebar → MenuItem으로 전달
function App() {
  const [theme, setTheme] = useState("light");
  return <Layout theme={theme} setTheme={setTheme} />;
}

function Layout({ theme, setTheme }) {
  // Layout은 theme을 사용하지 않지만 전달해야 한다!
  return (
    <div>
      <Header theme={theme} setTheme={setTheme} />
      <Sidebar theme={theme} />
      <Main theme={theme} />
    </div>
  );
}

function Sidebar({ theme }) {
  // Sidebar도 전달만...
  return <MenuItem theme={theme} />;
}

function MenuItem({ theme }) {
  // 여기서 드디어 사용!
  return <span className={`item-${theme}`}>메뉴</span>;
}

// 문제:
// · Layout, Sidebar가 theme을 "사용하지 않으면서" 전달만 함
// · theme Props가 추가/변경되면 중간 컴포넌트도 모두 수정
// · 컴포넌트 계층이 깊을수록 고통 증가
// · 중간 컴포넌트의 Props 인터페이스가 불필요하게 비대
```

### 1.3 Context가 해결하는 것


![Context의 핵심 아이디어](/developer-open-book/diagrams/react-step25-context의-핵심-아이디어.svg)


### 1.4 Context의 설계 철학과 한계

Context를 "전역 상태 관리의 만능 도구"로 오해하면 성능 문제를 만날 수 있다. React 팀이 Context를 설계할 때 주된 목적은 테마, 로케일, 현재 사용자 같은 "드물게 변하는 앱 설정 값"을 깊은 트리에 전달하는 것이었다. 이 목적에 충실할 때 Context는 훌륭한 도구다.

하지만 "자주 변하는 값"을 Context에 넣으면 문제가 생긴다. Provider의 value가 변경될 때마다 그 Context를 구독하는 모든 컴포넌트가 리렌더링되기 때문이다. 이것은 Context의 버그가 아니라 설계상의 선택이다. 이 특성을 이해하고 Context를 적합한 곳에만 사용하는 것이 Context 심화의 핵심이다.

### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step25-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 Context의 내부 동작 원리

Context는 React의 컴포넌트 트리 탐색 메커니즘을 활용한다. useContext를 호출하면 React는 컴포넌트 트리를 위쪽으로 탐색하여 가장 가까운 해당 Context의 Provider를 찾는다. Provider가 없으면 createContext에 전달한 기본값을 사용한다.

Provider의 value가 변경되면 React는 해당 Context를 구독하는 컴포넌트를 찾아 리렌더링을 스케줄링한다. 이 과정에서 중요한 점은 **React.memo로 감싸진 컴포넌트도 Context 변경에는 반응한다**는 것이다. React.memo는 Props의 변경만 막을 수 있으며, Context 변경에 의한 리렌더링은 막지 못한다. 이것이 Context 최적화가 별도의 전략을 필요로 하는 이유다.

### 2.2 핵심 용어 사전

| 용어                  | 정의                                                                               | 왜 중요한가                                       |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Context**           | 컴포넌트 트리를 관통하여 **Props 없이 데이터를 전달**하는 메커니즘                 | Props Drilling을 해결하는 React 내장 도구이다     |
| **createContext**     | Context 객체를 **생성**하는 함수. 기본값을 인자로 받는다                           | Provider가 없을 때 사용되는 기본값을 정의한다     |
| **Provider**          | Context 값을 **하위 트리에 제공**하는 컴포넌트. `<MyContext.Provider value={...}>` | 이 Provider 아래의 모든 컴포넌트가 값에 접근 가능 |
| **useContext**        | 가장 가까운 Provider의 **값을 읽는** Hook                                          | 컴포넌트에서 Context 값을 소비하는 주요 방법      |
| **Consumer 리렌더링** | Provider의 value가 변경되면 **해당 Context를 사용하는 모든 컴포넌트**가 리렌더링   | Context의 가장 큰 성능 함정이다                   |
| **Context 분리**      | 자주 변하는 값과 안정적인 값을 **다른 Context로 분리**하여 불필요한 리렌더링 방지  | State Context vs Dispatch Context 분리 패턴       |

### 2.3 Context의 3단계와 데이터 흐름

Context의 사용은 항상 세 단계를 거친다. 생성(Create), 제공(Provide), 소비(Consume). 이 세 단계가 React 파일 어디에 위치하는지, 어떤 순서로 실행되는지 이해하는 것이 Context를 올바르게 사용하기 위한 기초다.

기본값(createContext의 인자)은 Provider가 없는 환경에서 사용된다. 테스트 환경에서 Provider 없이 컴포넌트를 단독으로 렌더링할 때 유용하다. 하지만 프로덕션 코드에서는 항상 Provider로 감싸야 하며, 기본값에만 의존하는 것은 의도치 않은 동작을 유발할 수 있다.


![Context 사용의 3단계](/developer-open-book/diagrams/react-step25-context-사용의-3단계.svg)


---

## 3. 이론과 원리

### 3.1 기본 사용법

#### 생성 → 제공 → 소비

```jsx
import { createContext, useContext, useState } from "react";

// 1단계: Context 생성
const ThemeContext = createContext("light");
// 'light' = Provider가 없을 때의 기본값

// 2단계: Provider로 값 제공
function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main />
      <ThemeToggle
        onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />
    </ThemeContext.Provider>
  );
}

// 3단계: useContext로 값 소비
function Header() {
  const theme = useContext(ThemeContext);
  return <header className={`header-${theme}`}>로고</header>;
}

function Main() {
  // Main은 theme을 Props로 받지 않는다!
  return (
    <main>
      <Sidebar />
      <Content />
    </main>
  );
}

function Sidebar() {
  const theme = useContext(ThemeContext);
  // Sidebar가 직접 Context에서 읽는다 — 중간 컴포넌트 무관!
  return <aside className={`sidebar-${theme}`}>사이드바</aside>;
}
```


![Props Drilling과 비교](/developer-open-book/diagrams/react-step25-props-drilling과-비교.svg)


#### React 19: Provider 간소화

```jsx
// React 18 이전
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// React 19
<ThemeContext value={theme}>
  <App />
</ThemeContext>
// .Provider를 생략할 수 있다!
// 더 간결한 코드
```

#### 중첩 Provider

```jsx
// 같은 Context의 Provider를 중첩하면 가장 가까운 Provider의 값을 사용
function App() {
  return (
    <ThemeContext.Provider value="light">
      <Header /> {/* theme = "light" */}
      <ThemeContext.Provider value="dark">
        <AdminPanel /> {/* theme = "dark" */}
        <AdminSidebar /> {/* theme = "dark" */}
      </ThemeContext.Provider>
      <Footer /> {/* theme = "light" */}
    </ThemeContext.Provider>
  );
}
```

### 3.2 useReducer + Context = 전역 상태 관리

#### 패턴: 상태와 dispatch를 Context로 제공

useReducer와 Context를 결합하면 Redux와 유사한 전역 상태 관리 시스템을 React 내장 기능만으로 구현할 수 있다. 이 패턴의 핵심은 상태(State)와 디스패처(dispatch)를 **별도의 Context로 분리**하는 것이다. 이 분리의 이유는 3.4절에서 자세히 설명하지만, 핵심은 dispatch 함수는 useReducer에 의해 안정적인 참조를 유지하므로, dispatch만 필요한 컴포넌트가 상태 변경에 의해 불필요하게 리렌더링되지 않도록 하기 위함이다.

```jsx
import { createContext, useContext, useReducer } from "react";

// ── Context 생성 ──
const TodoContext = createContext(null);
const TodoDispatchContext = createContext(null);

// ── Reducer ──
function todoReducer(state, action) {
  switch (action.type) {
    case "TODO_ADDED":
      return [
        ...state,
        {
          id: action.payload.id,
          text: action.payload.text,
          done: false,
        },
      ];
    case "TODO_TOGGLED":
      return state.map((todo) =>
        todo.id === action.payload ? { ...todo, done: !todo.done } : todo,
      );
    case "TODO_DELETED":
      return state.filter((todo) => todo.id !== action.payload);
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// ── Provider 컴포넌트 ──
export function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <TodoContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoContext.Provider>
  );
}

// ── Custom Hook으로 캡슐화 ──
export function useTodos() {
  const context = useContext(TodoContext);
  if (context === null) {
    throw new Error("useTodos는 TodoProvider 안에서 사용해야 합니다");
  }
  return context;
}

export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (context === null) {
    throw new Error("useTodoDispatch는 TodoProvider 안에서 사용해야 합니다");
  }
  return context;
}
```

```jsx
// ── 사용 ──
function App() {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
}

function TodoApp() {
  return (
    <div>
      <AddTodoForm />
      <TodoList />
      <TodoStats />
    </div>
  );
}

function AddTodoForm() {
  const dispatch = useTodoDispatch(); // dispatch만 필요
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "TODO_ADDED", payload: { id: Date.now(), text } });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">추가</button>
    </form>
  );
}

function TodoList() {
  const todos = useTodos(); // State 필요
  const dispatch = useTodoDispatch(); // dispatch도 필요

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() =>
              dispatch({ type: "TODO_TOGGLED", payload: todo.id })
            }
          />
          <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            {todo.text}
          </span>
          <button
            onClick={() => dispatch({ type: "TODO_DELETED", payload: todo.id })}
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}

function TodoStats() {
  const todos = useTodos(); // State만 필요, dispatch 불필요
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  return (
    <p>
      완료: {done}/{total}
    </p>
  );
}
```


![이 패턴의 구조](/developer-open-book/diagrams/react-step25-이-패턴의-구조.svg)


### 3.3 Context의 리렌더링 문제

#### 핵심 문제: Provider value 변경 → 모든 소비자 리렌더링

Context의 리렌더링 동작은 직관적이지 않아서 초보자가 자주 함정에 빠진다. "값이 변하면 관련 컴포넌트가 리렌더링된다"는 것은 당연하지만, "특정 부분만 사용해도 Context 전체가 변하면 리렌더링된다"는 것은 예상 밖이다. 이 동작 방식을 이해하지 못하면 불필요한 리렌더링이 쌓여 성능 문제로 이어진다.

```jsx
// ❌ 리렌더링 문제가 있는 코드
function App() {
  const [user, setUser] = useState({ name: "홍길동", role: "admin" });
  const [theme, setTheme] = useState("light");

  // user 또는 theme이 변하면 value 객체가 새로 생성됨
  // → 모든 소비자가 리렌더링!

  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      <Header /> {/* user만 사용하지만 theme 변경 시에도 리렌더링! */}
      <Sidebar /> {/* theme만 사용하지만 user 변경 시에도 리렌더링! */}
      <Main />
    </AppContext.Provider>
  );
}
```

```
왜 이런 일이 발생하는가?

  1. Provider의 value가 새 객체이면 React가 "값이 변했다"고 판단
  2. { user, theme, setUser, setTheme }는 매 렌더링마다 새 객체!
  3. value가 변하면 해당 Context를 useContext로 읽는 모든 컴포넌트가 리렌더링
  4. React.memo로 감싸도 소용없다 — useContext는 memo를 우회한다 ★

  핵심: Context의 value가 변하면
        해당 Context를 소비하는 모든 컴포넌트가 강제 리렌더링된다.
        React.memo로도 방지할 수 없다!
```

### 3.4 Context 리렌더링 최적화 전략

#### 전략 1: Context를 분리한다

관심사가 다른 데이터를 하나의 Context에 묶으면 서로 무관한 변경이 교차 리렌더링을 일으킨다. 관심사별로 Context를 분리하면 각 Context 소비자는 자신이 관심있는 Context가 변경될 때만 리렌더링된다.

```jsx
// ✅ 관심사별로 Context를 분리
const UserContext = createContext(null);
const ThemeContext = createContext("light");

function App() {
  const [user, setUser] = useState({ name: "홍길동" });
  const [theme, setTheme] = useState("light");

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <Header /> {/* UserContext만 소비 → theme 변경에 무관 */}
        <Sidebar /> {/* ThemeContext만 소비 → user 변경에 무관 */}
        <ThemeToggle
          onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

function Header() {
  const user = useContext(UserContext); // user만 구독
  return <header>{user.name}</header>; // theme 변경 시 리렌더링 안 됨!
}

function Sidebar() {
  const theme = useContext(ThemeContext); // theme만 구독
  return <aside className={theme}>사이드바</aside>; // user 변경 시 리렌더링 안 됨!
}
```

#### 전략 2: State와 Dispatch를 분리한다

이것이 3.2절에서 TodoContext와 TodoDispatchContext를 분리한 이유다. dispatch 함수는 useReducer에 의해 컴포넌트 생명 주기 동안 동일한 참조를 유지한다. 따라서 dispatch를 별도 Context로 분리하면, dispatch만 필요한 컴포넌트는 State가 아무리 변해도 리렌더링되지 않는다.


![이것이 3.2절에서 TodoContext와 TodoDispatchContext를 분리한 이유이다](/developer-open-book/diagrams/react-step25-이것이-3-2절에서-todocontext와-tododispatchcont.svg)


#### 전략 3: Provider value를 useMemo로 안정화

```jsx
// ⚠️ 객체를 value로 전달할 때는 useMemo로 참조를 안정화
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ❌ 매 렌더링마다 새 객체
  // const value = { user, login, logout };

  const login = useCallback((userData) => setUser(userData), []);
  const logout = useCallback(() => setUser(null), []);

  // ✅ user가 변할 때만 새 객체
  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

#### 전략 4: children 패턴으로 불필요한 리렌더링 방지

children 패턴은 Provider 컴포넌트의 State가 변경될 때 자식 트리가 불필요하게 리렌더링되는 것을 막는다. children Props로 전달된 JSX는 부모(App) 컴포넌트에서 이미 생성된 참조이므로, Provider가 리렌더링되어도 children의 참조가 변하지 않는다. React는 참조가 동일한 JSX는 리렌더링을 건너뛴다.

```jsx
// ✅ children은 부모(App)에서 생성되어 전달됨
function App() {
  return (
    <ThemeProvider>
      {/* 이 JSX는 App에서 생성된 것이므로
          ThemeProvider의 State 변경에 영향받지 않음 */}
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}
```


![children 패턴이 최적화되는 이유](/developer-open-book/diagrams/react-step25-children-패턴이-최적화되는-이유.svg)


### 3.5 Context가 적합한 경우 vs 부적합한 경우

Context를 어디에 써야 하고 어디에 쓰면 안 되는지를 판단하는 것이 이 Step의 가장 실용적인 학습 목표다. 이 판단 능력이 있어야 Step 26(Zustand)을 배울 때도 "Context 대신 Zustand가 왜 필요한가"를 진정으로 이해할 수 있다.


![✅ Context가 적합한 데이터 (자주 변하지 않는 전역 값)](/developer-open-book/diagrams/react-step25-context가-적합한-데이터-자주-변하지-않는-전역-값.svg)



![선택 흐름도](/developer-open-book/diagrams/react-step25-선택-흐름도.svg)


### 3.6 실전 Context 패턴 모음

#### 인증 Context

인증 Context는 실무에서 가장 많이 사용되는 Context 패턴이다. 현재 로그인한 사용자 정보, 로그인/로그아웃 함수, 로딩 상태를 하나의 Context로 제공한다. 앱 전체에서 사용자 정보가 필요한 경우가 많지만, 로그인/로그아웃 시에만 값이 변경되므로 Context에 적합한 데이터다.

```jsx
// src/contexts/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다");
  }
  return context;
}
```

#### 테마 Context

```jsx
// src/contexts/ThemeContext.jsx
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme는 ThemeProvider 안에서 사용해야 합니다");
  return context;
}
```

#### Provider 합성 패턴

여러 Provider를 중첩하면 "Provider Hell"이라고 불리는 들여쓰기 피라미드가 만들어진다. 이를 해결하는 방법 중 하나는 모든 Provider를 하나의 컴포넌트로 합성하는 것이다. `composeProviders` 유틸리티는 이 패턴을 더 우아하게 구현한다.

```jsx
// 여러 Provider를 깔끔하게 합성
function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// 사용
function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}

// Provider 중첩이 깊어지면 "Provider Hell"이라 부른다
// 해결: compose 유틸리티 함수

function composeProviders(...providers) {
  return ({ children }) =>
    providers.reduceRight(
      (child, Provider) => <Provider>{child}</Provider>,
      children,
    );
}

const AppProviders = composeProviders(
  AuthProvider,
  ThemeProvider,
  LocaleProvider,
  NotificationProvider,
);
```

### 3.7 Context vs 전역 상태 라이브러리 (개요 비교)

Context의 리렌더링 문제를 해결하는 근본적인 방법은 "부분 구독(selector)"이다. Context는 부분 구독을 지원하지 않는다. Context 전체가 변하면 useContext로 읽는 모든 컴포넌트가 리렌더링된다. 반면 Zustand는 selector 함수로 "이 컴포넌트는 state.user.name이 변할 때만 리렌더링되면 된다"고 정확히 지정할 수 있다.


![Context API          │  Zustand (Step 26)](/developer-open-book/diagrams/react-step25-context-api-zustand-step-26.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: Context 리렌더링 문제 진단

```jsx
// ❌ 하나의 Context에 모든 것을 넣은 경우
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        notifications,
        setNotifications,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// 문제:
// · sidebarOpen이 토글될 때 (매우 빈번)
// → value 객체가 새로 생성됨
// → notifications만 사용하는 컴포넌트도 리렌더링!
// → theme만 사용하는 컴포넌트도 리렌더링!
// → 성능 문제 + 불필요한 렌더링

// ✅ 해결: 관심사별로 Context 분리
// AuthContext: user, setUser
// ThemeContext: theme, setTheme
// NotificationContext: notifications, setNotifications
// UIContext: sidebarOpen, setSidebarOpen
```

### 4.2 사례: useReducer + Context로 미니 상태 관리

Props Drilling 방식과 Context + useReducer 방식을 구조적으로 비교하면, 각 컴포넌트가 실제로 필요한 데이터만 직접 접근하는 모습을 명확히 볼 수 있다. AddForm은 dispatch만, Stats는 todos만 필요하다. Props Drilling에서는 두 컴포넌트 모두 상위에서 내려오는 모든 Props를 받아야 했다.


![구조 비교: Props Drilling vs Context + useReducer](/developer-open-book/diagrams/react-step25-구조-비교-props-drilling-vs-context-usereduc.svg)


### 4.3 사례: "Context를 남용하면 안 되는" 실제 상황


![시나리오: 실시간 주식 대시보드](/developer-open-book/diagrams/react-step25-시나리오-실시간-주식-대시보드.svg)


---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Context로 테마 + 인증 구현 [Applying]

**목표:** Context의 기본 패턴을 두 가지 도메인에 적용한다.

```
요구사항:
  · ThemeContext: light/dark 테마 전환
    - ThemeProvider, useTheme Custom Hook
    - localStorage에 테마 저장
    - 헤더, 사이드바, 메인 영역에서 각각 테마 적용
  · AuthContext: 로그인/로그아웃 시뮬레이션
    - AuthProvider, useAuth Custom Hook
    - user, isAuthenticated, login, logout
    - 로그인 여부에 따라 다른 UI 표시
  · 두 Context를 중간 컴포넌트 거치지 않고 직접 소비하는지 확인
  · Provider를 올바른 순서로 합성
```

---

### 실습 2: useReducer + Context로 장바구니 구현 [Applying]

**목표:** useReducer와 Context를 결합하여 상태 관리 시스템을 구현한다.

```
요구사항:
  · CartContext + CartDispatchContext (State/Dispatch 분리)
  · cartReducer: ITEM_ADDED, ITEM_REMOVED, QUANTITY_CHANGED, CART_CLEARED
  · CartProvider, useCart, useCartDispatch Custom Hook
  · 상품 목록에서 "장바구니 추가" (useCartDispatch만 사용)
  · 장바구니 아이콘에 총 수량 표시 (useCart만 사용)
  · 장바구니 페이지에서 수량 변경, 삭제 (둘 다 사용)
  · 총 금액 계산 (파생 데이터)

검증:
  · 상품 목록에서 장바구니에 추가해도 상품 목록이 리렌더링되지 않는가?
    (console.log로 확인)
  · State/Dispatch를 분리한 효과를 관찰
```

---

### 실습 3: Context 리렌더링 문제 진단 + 최적화 [Analyzing]

**목표:** 리렌더링 문제를 직접 체험하고 최적화한다.


![실험:](/developer-open-book/diagrams/react-step25-실험.svg)


---

### 실습 4 (선택): Context 적합성 판단 연습 [Evaluating]

**목표:** 데이터 특성에 따라 적합한 상태 관리 도구를 선택한다.

```
아래 10가지 시나리오에서 Context / Zustand / TanStack Query / Props 중
가장 적합한 도구를 선택하고 근거를 제시하라.

1. 다크 모드 설정
2. 로그인한 사용자 정보
3. 상품 목록 (API 조회)
4. 모달 열림/닫힘 상태
5. 장바구니 아이템 목록
6. 실시간 채팅 메시지
7. 앱 전체 언어 설정 (ko/en)
8. 폼의 입력값 (이름, 이메일 등)
9. 알림 목록 (API + 실시간 WebSocket)
10. 멀티 스텝 폼의 진행 상태 (3개 컴포넌트가 공유)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 25 핵심 요약](/developer-open-book/diagrams/react-step25-step-25-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                           | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------ | ---------- | ----------- |
| 1   | createContext, Provider, useContext 각각의 역할을 설명하라                     | Remember   | 2.3, 3.1    |
| 2   | Context가 Props Drilling을 해결하는 원리를 "중간 컴포넌트" 관점에서 설명하라   | Understand | 1.2, 3.1    |
| 3   | Provider의 value가 변경되면 React.memo로 감싼 소비자도 리렌더링되는 이유는?    | Understand | 3.3         |
| 4   | State와 Dispatch를 별도의 Context로 분리하는 것의 이점은?                      | Analyze    | 3.4         |
| 5   | children 패턴이 Provider의 리렌더링 전파를 방지하는 원리는?                    | Analyze    | 3.4         |
| 6   | 실시간 주식 가격 데이터를 Context로 관리하면 안 되는 이유는?                   | Evaluate   | 3.5, 4.3    |
| 7   | "테마 설정"과 "API 응답 데이터" 각각에 적합한 상태 관리 도구는?                | Evaluate   | 3.5         |
| 8   | useAuth Custom Hook 안에서 `if (!context) throw new Error(...)`를 하는 이유는? | Apply      | 3.2         |

---

## 6.3 FAQ

**Q1. Context와 Props 중 무엇을 사용해야 할지 어떻게 판단하나요?**

A. 기준은 간단합니다. "이 데이터가 여러 계층을 건너야 하고, 중간 컴포넌트에서는 필요 없는가?" 라면 Context, 그렇지 않다면 Props가 적합합니다. 2~3단계 이내의 깊이라면 Props가 더 명시적이고 추적하기 쉽습니다. Context는 중간 계층이 많고 데이터를 사용하지 않는 컴포넌트가 여럿 있을 때 빛을 발합니다.

**Q2. React.memo로 감싸도 Context 변경 시 리렌더링되는 이유는?**

A. React.memo는 부모로부터 전달되는 Props가 변경될 때만 리렌더링을 막습니다. Context는 Props가 아니라 Context 시스템을 통해 직접 값을 읽는 방식이기 때문에, React.memo의 비교 대상이 아닙니다. useContext로 읽는 값이 변경되면 React.memo와 무관하게 리렌더링이 발생합니다.

**Q3. Context를 여러 개 만들면 Provider가 너무 중첩되지 않나요?**

A. "Provider Hell" 문제는 실제로 발생합니다. 해결책은 이 Step의 3.6절에 소개한 `composeProviders` 유틸리티나 `AppProviders` 컴포넌트로 모든 Provider를 합성하는 것입니다. Provider가 5개 이상 중첩된다면 구조를 재검토할 필요가 있습니다. 너무 많은 Context는 Zustand 같은 전문 라이브러리를 고려할 신호일 수 있습니다.

**Q4. createContext의 기본값은 어떤 용도인가요?**

A. Provider 없이 useContext를 호출할 때 반환되는 값입니다. 주요 용도는 두 가지입니다. 첫째, 컴포넌트를 Provider 없이 독립적으로 테스트할 때 기본 동작을 정의할 수 있습니다. 둘째, TypeScript에서 null 체크를 피하기 위한 의미 없는 기본값을 제공할 수 있습니다. 하지만 프로덕션 코드에서 기본값에 의존하는 것은 Provider 누락 버그를 숨길 수 있으므로, Custom Hook 안에서 `if (!context) throw new Error()`를 사용하여 명시적으로 에러를 던지는 것이 더 안전합니다.

**Q5. useReducer + Context는 Redux를 대체할 수 있나요?**

A. 소규모 앱에서는 대체 가능합니다. 하지만 Redux(혹은 Redux Toolkit)는 DevTools, 미들웨어, 액션 히스토리 등 추가적인 기능을 제공합니다. 또한 Redux의 selector 기반 최적화는 Context보다 정밀합니다. useReducer + Context는 "Redux 없이 전역 상태를 관리"하고 싶은 소규모~중규모 앱에 적합하며, 복잡한 비동기 로직이나 대규모 상태 관리가 필요하다면 Zustand 또는 Redux Toolkit을 고려하세요.

---

## 7. 다음 단계 예고

> **Step 26. 전역 상태 관리 (Zustand)**
>
> - Zustand의 철학: 최소한의 API, 최대의 유연성
> - store 생성과 selector 기반 부분 구독
> - Context 없이 전역 상태를 관리하는 원리
> - Redux Toolkit과의 비교
> - 전역 상태의 적합한 범위와 Anti-pattern

---

## 📚 참고 자료

- [React 공식 문서 — Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React 공식 문서 — Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React 공식 문서 — useContext Reference](https://react.dev/reference/react/useContext)
- [React 공식 문서 — createContext Reference](https://react.dev/reference/react/createContext)
- [React 공식 블로그 — React 19 (Context as Provider)](https://react.dev/blog/2024/12/05/react-19)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 25 of 42
