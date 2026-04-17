# Step 31. TypeScript와 React 통합

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
> 타입 안전성, 폼 관리, 스타일링으로 프로덕션 품질을 완성한다 — **Phase 5 시작**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Remember**   | React에서 사용하는 주요 타입(FC, PropsWithChildren, ComponentProps, ReactNode)을 기술할 수 있다 |
| **Understand** | TypeScript가 React 개발에 제공하는 가치(Props 안전성, 자동완성, 리팩토링)를 설명할 수 있다      |
| **Apply**      | 컴포넌트 Props, Hook, Event Handler, Ref에 타입을 올바르게 적용할 수 있다                       |
| **Apply**      | Generic Component와 유틸리티 타입(Partial, Pick, Omit)을 활용할 수 있다                         |
| **Analyze**    | 타입 설계에서 "좁은 타입 vs 넓은 타입"의 트레이드오프를 분석할 수 있다                          |
| **Evaluate**   | 프로젝트에서 타입 안전성의 수준을 판단하고 적절한 타입 전략을 설계할 수 있다                    |

**전제 지식:**

- Step 2: JavaScript ES Module, 구조 분해, Spread 연산자
- Step 5: Props, children, Composition
- Step 12: useRef, forwardRef
- Step 13: useReducer
- Step 16: Custom Hook
- Step 25: Context API

---

## 1. 서론 — "실행 전에 버그를 잡는다"

### 1.1 정적 타입 시스템의 등장 배경

소프트웨어가 복잡해지면서 런타임에서 발견되는 타입 에러의 비용이 커졌다. 개발 환경에서는 콘솔 에러로 확인할 수 있지만, 프로덕션에서 사용자가 맞닥뜨리는 에러는 직접적인 비즈니스 손실이 된다. Google, Microsoft, Facebook 등 대형 기술 기업들이 수천만 줄 규모의 JavaScript 코드베이스를 유지하면서 런타임 타입 에러의 탐지와 예방이 핵심 과제가 되었다.

이 배경에서 Microsoft가 2012년 TypeScript를 공개했다. TypeScript는 JavaScript의 완전한 슈퍼셋(superset)으로, 기존 JavaScript 코드를 그대로 사용하면서 선택적으로 타입 정보를 추가할 수 있다. TypeScript 컴파일러는 코드를 실행하기 전 정적 분석(static analysis)을 통해 타입 불일치를 감지한다.

React 생태계에서 TypeScript 도입은 빠르게 가속화되었다. 2019년 무렵 React 커뮤니티에서 TypeScript 채택률이 급격히 상승하기 시작했고, 현재는 실무 React 프로젝트의 90% 이상이 TypeScript를 사용한다. Create React App, Vite, Next.js 등 주요 React 보일러플레이트가 모두 TypeScript 템플릿을 기본으로 제공하고 있다.

### 1.2 JavaScript의 한계

React는 JavaScript(또는 JSX)로 작성된다. JavaScript는 **동적 타입 언어**이므로 런타임에서야 타입 에러가 발생한다.

```jsx
// JavaScript — 실행해봐야 에러를 알 수 있다
function UserCard({ user }) {
  return <p>{user.name.toUpperCase()}</p>;
}

// 사용하는 측에서 실수:
<UserCard user="홍길동" />            // user가 문자열! .name 접근 시 런타임 에러
<UserCard user={{ nama: '홍길동' }} /> // name이 아닌 nama! undefined.toUpperCase()
<UserCard />                           // user가 undefined! 런타임 에러

// 이 에러들은 코드를 실행해봐야 발견된다
// 브라우저에서 사용자가 경험하는 에러가 된다!
```

### 1.3 TypeScript가 해결하는 것

TypeScript는 단순히 에러를 일찍 발견하는 도구가 아니다. 코드 자체가 문서가 되고, IDE가 강력한 지원 도구가 되며, 팀 전체의 소통 방식이 변한다. 특히 컴포넌트 Props 타입은 "이 컴포넌트를 어떻게 사용해야 하는가"를 코드로 표현하는 계약서 역할을 한다. 새로운 팀원이 문서를 찾아볼 필요 없이 타입 정의만 읽으면 컴포넌트 사용법을 이해할 수 있다.


![TypeScript = JavaScript + 정적 타입 시스템](/developer-open-book/diagrams/react-step31-typescript-javascript-정적-타입-시스템.svg)


### 1.4 TypeScript와 React의 관계 개념 지도


![TypeScript + React 개념 지도](/developer-open-book/diagrams/react-step31-typescript-react-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step31-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어               | 정의                                                                                         | 왜 중요한가                                 |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **interface**      | 객체의 **구조를 정의**하는 TypeScript 문법. 확장(extends)과 병합(declaration merging) 가능   | Props, State, API 응답 등의 형태를 정의한다 |
| **type**           | 타입 별칭(alias). interface보다 **유연**하며 유니온, 인터섹션, 조건부 타입 등에 사용         | 유니온 타입, 유틸리티 타입에 필수           |
| **ReactNode**      | React가 렌더링할 수 있는 **모든 값의 타입**. string, number, JSX, null, undefined, 배열 포함 | children의 타입으로 가장 넓게 사용          |
| **ReactElement**   | **JSX 표현식**의 타입. `<Component />` 또는 `<div />`의 결과                                 | ReactNode보다 좁은 타입 (문자열, null 제외) |
| **ComponentProps** | HTML 요소 또는 컴포넌트의 **모든 Props 타입을 추출**하는 유틸리티 타입                       | HTML 속성을 확장하는 커스텀 컴포넌트에 필수 |
| **Generic**        | 타입을 **매개변수로 받는** 문법. `<T>`로 표현                                                | 재사용 가능한 타입 안전 컴포넌트/Hook 구현  |

### 2.2 interface vs type — 언제 무엇을 쓰는가

`interface`와 `type`은 많은 상황에서 서로 대체 가능하지만, 각각 더 적합한 사용 맥락이 있다. `interface`는 객체의 형태를 기술하는 데 특화되어 있으며, 확장(extends)이 직관적이고 에러 메시지가 더 읽기 쉽다. `type`은 유니온, 인터섹션, 조건부 타입, 튜플 등 더 복잡한 타입 표현이 필요할 때 사용한다.

```typescript
// interface — 객체 형태 정의에 주로 사용
interface User {
  id: number;
  name: string;
  email: string;
}

// 확장 (extends)
interface Admin extends User {
  role: "admin" | "superadmin";
  permissions: string[];
}

// type — 유니온, 인터섹션, 별칭에 사용
type Status = "idle" | "loading" | "success" | "error"; // 유니온
type UserOrAdmin = User | Admin; // 유니온 타입
type WithTimestamp<T> = T & { createdAt: Date; updatedAt: Date }; // 인터섹션

// 실전 권장:
// · Props 정의 → interface (확장 가능, 에러 메시지가 친절)
// · 유니온/유틸리티 → type (유연함)
// · 팀 내 일관성이 가장 중요 (둘 다 가능한 경우 하나로 통일)
```

### 2.3 ReactNode vs ReactElement — 올바른 children 타입 선택

`ReactNode`와 `ReactElement`는 둘 다 "React가 렌더링할 수 있는 것"을 표현하지만 넓이가 다르다. `ReactNode`는 가장 넓은 타입으로 문자열, 숫자, JSX, null, undefined, 배열을 모두 포함한다. 대부분의 `children` Props에 적합하다. `ReactElement`는 JSX 표현식(`<Component />` 또는 `<div />`)만을 가리킨다. Tabs 같이 "반드시 React 컴포넌트만 children으로 받아야 하는" 경우에 사용한다.


![ReactNode (넓은 타입):](/developer-open-book/diagrams/react-step31-reactnode-넓은-타입.svg)


### 2.4 타입 시스템이 제공하는 개발자 경험

TypeScript 도입 이전과 이후의 React 개발 경험은 크게 다르다. 특히 Props 전달 실수, API 응답 구조 변경, 리팩토링 시 파급 효과 파악이라는 세 가지 일상적 개발 과제에서 차이가 극명하다.

Props 전달 실수는 TypeScript 없이는 런타임 에러로만 발견된다. TypeScript가 있으면 IDE에서 빨간 밑줄로 즉시 표시된다. API 응답 구조가 바뀌면 TypeScript 없이는 어느 컴포넌트가 영향을 받는지 전체 코드를 검색해야 한다. TypeScript가 있으면 타입 변경 후 컴파일 에러 목록이 영향받는 모든 위치를 알려준다. 리팩토링 시 함수 시그니처를 변경하면 TypeScript가 모든 호출 위치를 추적하여 누락 없이 수정할 수 있게 한다.

---

## 3. 이론과 원리

### 3.1 컴포넌트 Props 타입 정의

#### 기본 패턴

Props 타입을 정의하는 것은 "이 컴포넌트가 어떤 데이터를 받는가"를 명시하는 계약이다. 필수 Props와 선택적 Props를 구분하고, 가능한 값을 리터럴 유니온으로 좁혀서 잘못된 사용을 컴파일 시점에 차단한다.

```tsx
// 방법 1: interface로 Props 정의 (가장 일반적)
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';  // 선택적 + 리터럴 유니온
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

function Button({ label, variant = 'primary', size = 'md', disabled = false, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// 사용 — 타입 에러가 컴파일 시 발견됨!
<Button label="저장" onClick={() => save()} />               // ✅
<Button label="삭제" variant="danger" onClick={() => del()} /> // ✅
<Button label={42} onClick={() => {}} />                      // ❌ label은 string!
<Button label="저장" variant="warning" onClick={() => {}} />  // ❌ 'warning'은 유효하지 않음!
<Button label="저장" />                                       // ❌ onClick이 필수인데 누락!
```

#### children 타입

```tsx
// children: ReactNode — 가장 넓은 타입 (문자열, JSX, null 등 모두 허용)
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// 다양한 children 허용
<Card title="알림">문자열도 OK</Card>
<Card title="알림"><p>JSX도 OK</p></Card>
<Card title="알림">{null}</Card>
<Card title="알림">{[<p key="1">배열도</p>, <p key="2">OK</p>]}</Card>


// PropsWithChildren — children을 자동 포함하는 유틸리티
import { PropsWithChildren } from 'react';

interface CardProps {
  title: string;
}

function Card({ title, children }: PropsWithChildren<CardProps>) {
  return <div><h2>{title}</h2>{children}</div>;
}

// children이 특정 타입이어야 하는 경우
interface TabsProps {
  children: React.ReactElement[];  // JSX Element 배열만 허용
}
```

#### 선택적 Props와 기본값

```tsx
interface InputProps {
  label: string;
  placeholder?: string; // 선택적: string | undefined
  type?: "text" | "email" | "password"; // 선택적 + 리터럴 유니온
  required?: boolean;
}

// 기본값은 구조 분해에서 설정
function Input({
  label,
  placeholder = "",
  type = "text",
  required = false,
}: InputProps) {
  return (
    <label>
      {label} {required && <span>*</span>}
      <input type={type} placeholder={placeholder} required={required} />
    </label>
  );
}
```

#### 판별 유니온(Discriminated Union) — 조건부 Props

판별 유니온은 "상태에 따라 다른 Props 집합을 가지는 컴포넌트"를 타입 안전하게 표현한다. 공통 식별자 필드(보통 `type`, `as`, `kind` 등)를 기준으로 타입 시스템이 나머지 Props를 자동으로 좁혀준다.

```tsx
// 상태에 따라 다른 Props를 받는 패턴
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// status에 따라 어떤 Props가 존재하는지 타입 시스템이 보장
function StatusDisplay({ state }: { state: AsyncState<string[]> }) {
  switch (state.status) {
    case 'idle':
      return null;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <ul>{state.data.map(item => <li key={item}>{item}</li>)}</ul>;
      // state.data가 여기서 타입 안전하게 접근 가능! ★
    case 'error':
      return <p>에러: {state.error}</p>;
      // state.error가 여기서만 접근 가능! ★
  }
}


// 버튼 변형: 링크 버튼 vs 일반 버튼
type ButtonProps =
  | { as: 'button'; onClick: () => void; href?: never }
  | { as: 'link'; href: string; onClick?: never };

function Button(props: ButtonProps & { children: React.ReactNode }) {
  if (props.as === 'link') {
    return <a href={props.href}>{props.children}</a>;
    // props.href가 타입 안전하게 접근 가능
  }
  return <button onClick={props.onClick}>{props.children}</button>;
  // props.onClick이 타입 안전하게 접근 가능
}

<Button as="button" onClick={() => {}}>클릭</Button>  // ✅
<Button as="link" href="/home">홈</Button>              // ✅
<Button as="link" onClick={() => {}}>잘못</Button>      // ❌ link에 onClick 불가!
<Button as="button" href="/home">잘못</Button>          // ❌ button에 href 불가!
```

### 3.2 Event Handler 타입

React의 이벤트 타입은 `ChangeEvent<T>`, `FormEvent<T>`, `MouseEvent<T>` 등 제네릭을 받는 형태다. 제네릭 인자 `T`에 HTML 요소 타입을 지정하면 해당 요소에서 가능한 속성이 자동완성된다.

```tsx
// React의 이벤트 타입
import { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent } from "react";

function SearchForm() {
  const [query, setQuery] = useState("");

  // ChangeEvent<HTMLInputElement> — input의 onChange 이벤트
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // e.target.value가 string으로 타입 추론됨 ★
  };

  // FormEvent<HTMLFormElement> — form의 onSubmit 이벤트
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    search(query);
  };

  // MouseEvent<HTMLButtonElement> — button의 onClick 이벤트
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);
  };

  // KeyboardEvent<HTMLInputElement> — input의 onKeyDown 이벤트
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} onKeyDown={handleKeyDown} />
      <button type="submit" onClick={handleClick}>
        검색
      </button>
    </form>
  );
}
```

```
이벤트 타입 패턴

  요소별 이벤트:
    ChangeEvent<HTMLInputElement>       — input onChange
    ChangeEvent<HTMLSelectElement>      — select onChange
    ChangeEvent<HTMLTextAreaElement>    — textarea onChange
    FormEvent<HTMLFormElement>          — form onSubmit
    MouseEvent<HTMLButtonElement>       — button onClick
    MouseEvent<HTMLDivElement>          — div onClick
    KeyboardEvent<HTMLInputElement>     — input onKeyDown

  간편한 방법: 인라인 핸들러에서 타입 추론에 맡기기
    <input onChange={(e) => setQuery(e.target.value)} />
    // e가 자동으로 ChangeEvent<HTMLInputElement>로 추론됨

  Props로 이벤트 핸들러를 전달할 때:
    interface InputProps {
      onChange: (value: string) => void;  // 간단한 시그니처
    }
    // 또는
    interface InputProps {
      onChange: React.ChangeEventHandler<HTMLInputElement>;  // React 타입 직접 사용
    }
```

### 3.3 Hook의 타입

#### useState

```tsx
// 자동 추론 — 초기값에서 타입이 결정됨
const [count, setCount] = useState(0); // number
const [name, setName] = useState(""); // string
const [isOpen, setIsOpen] = useState(false); // boolean

// 명시적 제네릭 — 초기값이 null이거나 복잡한 타입일 때
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
// user는 User | null

if (user) {
  // 이 블록 안에서 user는 User (null이 아님 — narrowing)
  console.log(user.name); // ✅ 타입 안전
}

// 배열
const [items, setItems] = useState<string[]>([]);
const [users, setUsers] = useState<User[]>([]);
```

#### useReducer

판별 유니온으로 Action 타입을 정의하면 `dispatch` 호출이 완전히 타입 안전해진다. 유효하지 않은 `type` 문자열이나 잘못된 `payload` 타입은 컴파일 에러로 차단된다.

```tsx
// State와 Action 타입 정의
interface TodoState {
  todos: Todo[];
  filter: "all" | "active" | "completed";
}

// 판별 유니온으로 Action 타입 정의 ★
type TodoAction =
  | { type: "TODO_ADDED"; payload: { id: number; text: string } }
  | { type: "TODO_TOGGLED"; payload: number }
  | { type: "TODO_DELETED"; payload: number }
  | { type: "FILTER_CHANGED"; payload: "all" | "active" | "completed" };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "TODO_ADDED":
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: action.payload.id, text: action.payload.text, done: false },
          // action.payload가 { id: number, text: string }로 추론 ★
        ],
      };
    case "TODO_TOGGLED":
      return {
        ...state,
        todos: state.todos.map(
          (t) => (t.id === action.payload ? { ...t, done: !t.done } : t),
          // action.payload가 number로 추론 ★
        ),
      };
    case "TODO_DELETED":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };
    case "FILTER_CHANGED":
      return { ...state, filter: action.payload };
    // action.payload가 'all' | 'active' | 'completed'로 추론 ★
    default:
      return state;
  }
}

// 사용
const [state, dispatch] = useReducer(todoReducer, { todos: [], filter: "all" });

dispatch({ type: "TODO_ADDED", payload: { id: 1, text: "할 일" } }); // ✅
dispatch({ type: "TODO_TOGGLED", payload: 1 }); // ✅
dispatch({ type: "TODO_TOGGLED", payload: "1" }); // ❌ string 불가!
dispatch({ type: "INVALID" }); // ❌ 유효하지 않은 type!
```

#### useRef

```tsx
// DOM 참조 — 초기값 null, 제네릭으로 DOM 타입 지정
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current는 HTMLInputElement | null

useEffect(() => {
  inputRef.current?.focus();
  // optional chaining으로 null 체크
  // .focus()가 자동완성됨 (HTMLInputElement의 메서드) ★
}, []);

<input ref={inputRef} />; // ✅ HTMLInputElement에 연결 가능
// <div ref={inputRef} />  // ❌ HTMLDivElement != HTMLInputElement!

// 변경 가능한 값 저장 — 초기값을 직접 제공
const timerRef = useRef<number | null>(null);
// timerRef.current는 number | null (직접 변경 가능)

timerRef.current = window.setInterval(() => {}, 1000);
clearInterval(timerRef.current!);

// 규칙:
// useRef<Type>(null) → .current는 readonly (DOM 참조용)
// useRef<Type>(initialValue) → .current는 mutable (값 저장용)
```

#### useContext

```tsx
// Context 타입 정의
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom Hook에서 null 체크
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다");
  }
  return context; // AuthContextType으로 반환 (null 제거됨) ★
}

// 사용 — null 걱정 없이 사용 가능
function Dashboard() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <h1>{user.name}</h1>; // ✅ user가 User로 narrowing
}
```

### 3.4 ComponentProps — HTML 속성 확장

#### 커스텀 컴포넌트에 HTML 속성을 모두 허용

`ComponentProps<'button'>`을 사용하면 HTML button 요소의 모든 표준 속성(`type`, `form`, `aria-*`, `data-*` 등)을 자동으로 포함한다. 이를 통해 커스텀 컴포넌트가 기본 HTML 요소처럼 사용될 수 있다.

```tsx
import { ComponentProps } from 'react';

// HTML button의 모든 Props를 포함 + 커스텀 Props 추가
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

function Button({ variant = 'primary', size = 'md', isLoading, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={isLoading || rest.disabled}
      {...rest}   // HTML button의 모든 속성(onClick, type, form 등) 전달
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}

// 사용 — HTML 속성이 자동완성되고 타입 검사됨!
<Button variant="primary" onClick={() => save()}>저장</Button>    // ✅
<Button type="submit" form="myForm">제출</Button>                 // ✅ type, form도 사용 가능
// <Button variant="primary" href="/link">링크</Button>           // ❌ button에 href 없음!
```

```tsx
// input 확장 예시: size 속성 충돌 해결
interface TextFieldProps extends Omit<ComponentProps<"input">, "size"> {
  // 'size'를 Omit으로 제거 (input의 size와 우리의 size가 충돌)
  label: string;
  error?: string;
  size?: "sm" | "md" | "lg";
}

function TextField({
  label,
  error,
  size = "md",
  ...inputProps
}: TextFieldProps) {
  return (
    <div className={`field field-${size}`}>
      <label>{label}</label>
      <input {...inputProps} className={error ? "input-error" : ""} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// HTML input의 모든 속성 + 커스텀 Props 사용 가능
<TextField
  label="이메일"
  type="email"
  placeholder="입력..."
  error="필수 항목"
/>;
```

### 3.5 Generic Component — 타입을 매개변수로

제네릭 컴포넌트는 "어떤 타입의 데이터든 받을 수 있지만, 사용하는 시점에 타입이 결정되는" 컴포넌트다. 재사용 가능한 List, Table, Select 컴포넌트처럼 데이터 구조에 의존하는 컴포넌트를 타입 안전하게 만드는 핵심 패턴이다.

```tsx
// Generic List 컴포넌트 — 어떤 타입의 데이터든 렌더링
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = '데이터가 없습니다' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>;

  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 사용 — T가 자동으로 추론됨!
interface User { id: number; name: string; }
interface Product { id: number; title: string; price: number; }

<List
  items={users}
  keyExtractor={(user) => user.id}          // user: User로 추론 ★
  renderItem={(user) => <span>{user.name}</span>}
/>

<List
  items={products}
  keyExtractor={(p) => p.id}               // p: Product로 추론 ★
  renderItem={(p) => <span>{p.title} — {p.price}원</span>}
/>


// Generic Select 컴포넌트
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={String(getValue(value))}
      onChange={(e) => {
        const selected = options.find(opt => String(getValue(opt)) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map(opt => (
        <option key={String(getValue(opt))} value={String(getValue(opt))}>
          {getLabel(opt)}
        </option>
      ))}
    </select>
  );
}
```

### 3.6 유틸리티 타입 활용

유틸리티 타입은 기존 타입을 변환하여 새로운 타입을 만드는 내장 도구다. API 엔드포인트마다 필요한 타입이 다를 때(생성/수정/조회/목록) 동일한 기본 타입에서 파생하면 코드 중복 없이 일관성을 유지할 수 있다.

```tsx
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
  createdAt: Date;
}

// Partial<T> — 모든 속성을 선택적으로
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; ... }
// 사용: PATCH 요청의 body (일부 필드만 수정)

// Pick<T, K> — 특정 속성만 선택
type UserPreview = Pick<User, "id" | "name" | "avatar">;
// { id: number; name: string; avatar: string; }
// 사용: 목록에서 간략히 표시할 데이터

// Omit<T, K> — 특정 속성 제외
type CreateUserInput = Omit<User, "id" | "createdAt">;
// { name: string; email: string; avatar: string; role: 'admin' | 'user'; }
// 사용: 생성 시 id와 createdAt은 서버가 생성

// Record<K, V> — 키-값 쌍의 객체
type FormErrors = Record<string, string>;
// { [key: string]: string }
// 사용: { name: '필수 항목', email: '유효하지 않음' }

type RolePermissions = Record<User["role"], string[]>;
// { admin: string[]; user: string[] }

// Required<T> — 모든 속성을 필수로
type RequiredUser = Required<User>;
// 모든 ?가 제거됨

// Readonly<T> — 모든 속성을 읽기 전용으로
type ImmutableUser = Readonly<User>;
// 속성 변경 시 컴파일 에러
```

```
유틸리티 타입 사용 가이드

  API 요청/응답:
    · 생성: Omit<Entity, 'id' | 'createdAt'>
    · 수정: Partial<Omit<Entity, 'id'>>
    · 조회: Entity 그대로
    · 목록: Pick<Entity, 'id' | 'name' | 'thumbnail'>[]

  폼:
    · 폼 값: Omit<Entity, 'id' | 'createdAt'>
    · 폼 에러: Partial<Record<keyof FormValues, string>>

  Props:
    · HTML 확장: ComponentProps<'button'> & CustomProps
    · 속성 충돌: Omit<ComponentProps<'input'>, 'size'> & { size: 'sm' | 'md' }
```

### 3.7 Custom Hook의 타입

Custom Hook의 반환 타입을 명시적으로 정의하면 Hook을 사용하는 쪽에서 자동완성과 타입 안전성을 얻는다. 특히 튜플을 반환하는 Hook은 `as const`나 명시적 반환 타입으로 추론이 배열 타입으로 넓혀지는 것을 방지해야 한다.

```tsx
// 반환 타입을 명시적으로 정의
interface UseFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    // fetch 로직
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// 사용 — 제네릭으로 반환 타입을 지정
const { data: users } = useFetch<User[]>("/api/users");
// users는 User[] | null로 추론됨 ★

const { data: product } = useFetch<Product>("/api/products/42");
// product는 Product | null로 추론됨 ★

// 튜플 반환 Hook의 타입
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}

const [isOpen, toggleOpen] = useToggle();
// isOpen: boolean, toggleOpen: () => void ★
```

### 3.8 타입 설계 원칙

좋은 타입 설계는 코드의 정확성을 높이고 잘못된 사용을 방지한다. 세 가지 핵심 원칙이 있다.

```
원칙 1: 가능한 좁은 타입을 사용한다

  // ❌ 넓은 타입 — 무엇이든 받을 수 있지만 안전하지 않음
  interface ButtonProps {
    variant: string;           // 'anything' 이 들어올 수 있음!
    onClick: Function;         // 어떤 함수든 가능!
    data: any;                 // 타입 검사 완전 무력화!
  }

  // ✅ 좁은 타입 — 유효한 값만 허용
  interface ButtonProps {
    variant: 'primary' | 'secondary' | 'danger';  // 3가지만 허용
    onClick: () => void;                           // 매개변수 없는 void 함수
    data: User;                                    // 정확한 타입
  }


원칙 2: any를 피하고 unknown을 사용한다

  // ❌ any — 타입 검사 완전 비활성화
  function process(data: any) {
    data.whatever();  // 에러 없이 통과! 런타임에서 크래시!
  }

  // ✅ unknown — 타입 검사를 유지하면서 "아직 모르는 타입"
  function process(data: unknown) {
    // data.whatever();  // ❌ 컴파일 에러!
    if (typeof data === 'string') {
      data.toUpperCase();  // ✅ string으로 narrowing 후 사용
    }
  }


원칙 3: 타입을 도메인 가까이 정의한다

  // ❌ 모든 타입을 src/types/에 모아놓기
  src/types/user.ts
  src/types/product.ts
  src/types/order.ts

  // ✅ Feature 옆에 타입 정의 (Co-location, Step 28)
  src/features/users/types.ts
  src/features/products/types.ts
  src/features/orders/types.ts

  // 공유 타입만 shared/에
  src/shared/types/api.ts    (ApiError, PaginatedResponse 등)
  src/shared/types/common.ts (ID, Timestamp 등)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: API 응답 타입과 컴포넌트 Props 연결

실무에서 서버 API와 프론트엔드 모델 사이에 불일치가 자주 발생한다. 서버는 snake_case를 사용하고 프론트엔드는 camelCase를 선호하는 경우, 또는 서버가 날짜를 문자열로 반환하지만 프론트엔드에서 Date 객체로 사용하는 경우다. 변환 함수에 타입을 적용하면 이 경계에서 발생하는 불일치를 컴파일 시점에 차단할 수 있다.

```tsx
// API 응답 타입 정의
interface ApiUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string; // 서버는 snake_case
  created_at: string; // ISO 날짜 문자열
}

// 프론트엔드 모델 타입 (camelCase)
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: Date;
}

// 변환 함수 — 타입 안전하게 매핑
function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatarUrl: apiUser.avatar_url,
    createdAt: new Date(apiUser.created_at),
  };
}

// 컴포넌트 Props — 프론트엔드 모델 사용
interface UserCardProps {
  user: User; // ApiUser가 아닌 User!
  onEdit?: (user: User) => void;
}

function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      <img src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && <button onClick={() => onEdit(user)}>수정</button>}
    </div>
  );
}
```

### 4.2 사례: Zustand Store의 타입 정의

Zustand Store에 타입을 적용하면 selector, action 호출이 모두 타입 안전해진다. 스토어 인터페이스를 먼저 정의하고 구현체를 작성하는 방식으로, 인터페이스가 계약서 역할을 한다.

```tsx
interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === product.productId,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i,
      ),
    })),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

// 사용 — 모든 것이 타입 안전!
const items = useCartStore((state) => state.items); // CartItem[]
const addItem = useCartStore((state) => state.addItem); // (product: ...) => void
const total = useCartStore((state) => state.getTotalPrice()); // number
```

### 4.3 사례: forwardRef의 타입

```tsx
// React 18: forwardRef 제네릭
import { forwardRef } from "react";

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  //                     ↑ ref 타입        ↑ Props 타입
  function Input({ label, error, ...rest }, ref) {
    return (
      <label>
        {label}
        <input ref={ref} {...rest} />
        {error && <span>{error}</span>}
      </label>
    );
  },
);

// 사용
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="이름" />; // ✅ 타입 안전

// React 19: ref를 일반 Props로 (forwardRef 불필요)
interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ label, error, ref, ...rest }: InputProps) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
      {error && <span>{error}</span>}
    </label>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 컴포넌트 Props 타입 정의 [Applying]

**목표:** 다양한 컴포넌트에 올바른 타입을 적용한다.

```
요구사항:
  · Button: variant(3종), size(3종), isLoading, disabled, onClick, children
    + HTML button의 모든 속성 (ComponentProps 활용)
  · Card: title, subtitle(선택), children, footer(ReactNode, 선택)
  · Badge: label, color(5종 유니온), size(2종)
  · Avatar: src, alt, size(number), fallback(ReactNode)
  · Alert: Discriminated Union —
    - type='info': message만
    - type='error': message + onRetry
    - type='success': message + onDismiss 선택적

  · 각 컴포넌트를 올바르게/잘못되게 사용하는 예시 2개씩 작성
  · 잘못된 사용에서 TypeScript 에러 메시지 확인
```

---

### 실습 2: Hook 타입 적용 [Applying]

**목표:** useState, useReducer, useContext, useRef에 올바른 타입을 적용한다.

```
요구사항:
  · useState<User | null>(null) — 사용자 프로필
  · useReducer — Todo 앱 (판별 유니온 Action 타입)
  · useContext + Custom Hook — AuthContext (null 안전 처리)
  · useRef<HTMLInputElement>(null) — 폼 포커스 관리
  · useFetch<T> Generic Hook — URL에서 데이터 패칭

  검증:
  · 잘못된 타입의 dispatch가 컴파일 에러를 발생시키는지
  · useAuth()가 Provider 밖에서 에러를 throw하는지
  · ref.current의 메서드가 자동완성되는지
```

---

### 실습 3: Generic Component 구현 [Applying · Analyzing]

**목표:** 타입 매개변수를 활용한 재사용 컴포넌트를 만든다.

```
요구사항:
  · DataTable<T> 컴포넌트:
    Props:
      data: T[]
      columns: {
        key: keyof T;
        header: string;
        render?: (value: T[keyof T], item: T) => ReactNode
      }[]
      onRowClick?: (item: T) => void
      keyExtractor: (item: T) => string | number

  · User[]와 Product[] 두 가지 데이터로 테스트
  · T의 key에 존재하지 않는 컬럼 key를 지정하면 타입 에러
  · onRowClick의 item이 올바른 타입으로 추론되는지 확인
```

---

### 실습 4 (선택): 유틸리티 타입으로 API 타입 설계 [Evaluating]

**목표:** 프로젝트 전체의 API 타입을 체계적으로 설계한다.

```
시나리오: 블로그 앱

엔티티:
  · Post: id, title, content, authorId, tags, status, createdAt, updatedAt
  · User: id, name, email, avatar, bio, createdAt

설계할 것:
  1. 기본 엔티티 타입 (Post, User)
  2. 생성 입력: CreatePostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
  3. 수정 입력: UpdatePostInput = Partial<CreatePostInput>
  4. 목록 아이템: PostPreview = Pick<Post, 'id' | 'title' | 'status'> & { author: UserPreview }
  5. 페이지네이션 응답: PaginatedResponse<T> = { items: T[]; total: number; page: number }
  6. API 에러: ApiError = { message: string; code: string; details?: Record<string, string> }
  7. 각 타입이 어떤 API 엔드포인트에서 사용되는지 매핑
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 31 핵심 요약](/developer-open-book/diagrams/react-step31-step-31-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | ReactNode와 ReactElement의 차이를 설명하고 children에 어떤 것을 사용하는가?           | Remember   | 2.3, 3.1    |
| 2   | Discriminated Union이 조건부 Props를 안전하게 만드는 원리는?                          | Understand | 3.1         |
| 3   | ComponentProps<'button'>을 사용하여 커스텀 Button을 만드는 이유는?                    | Understand | 3.4         |
| 4   | useReducer에서 Action을 판별 유니온으로 정의하면 dispatch가 어떻게 타입 안전해지는가? | Apply      | 3.3         |
| 5   | useRef<HTMLInputElement>(null)에서 .current가 readonly인 이유는?                      | Understand | 3.3         |
| 6   | Generic Component에서 T가 자동 추론되는 원리를 List<T> 예시로 설명하라                | Analyze    | 3.5         |
| 7   | Omit<User, 'id' \| 'createdAt'>이 "생성 입력" 타입으로 적합한 이유는?                 | Apply      | 3.6         |
| 8   | `any` 대신 `unknown`을 사용해야 하는 이유와 차이는?                                   | Evaluate   | 3.8         |

### 6.3 FAQ

**Q1. interface와 type 중 어느 것을 사용해야 하나요?**

실용적인 가이드는 다음과 같다. 객체 형태를 정의할 때는 `interface`를 사용한다. 확장이 자연스럽고 에러 메시지가 더 읽기 쉽다. 유니온 타입, 튜플, 함수 타입, 조건부 타입 같이 `interface`로 표현할 수 없는 경우에는 `type`을 사용한다. 가장 중요한 것은 팀 내 일관성이다. 두 가지를 섞어 쓰는 것보다 하나를 선택하여 통일하는 것이 코드베이스 가독성에 유리하다.

**Q2. any를 완전히 피할 수 없는 경우는 어떻게 하나요?**

외부 라이브러리의 타입이 불완전하거나, 동적으로 생성된 데이터를 다루어야 할 때 `any`를 완전히 피하기 어려운 경우가 있다. 이때는 `any` 대신 `unknown`을 사용하고 타입 가드(type guard)로 좁혀나가는 방식을 권장한다. 불가피하게 `any`를 써야 한다면 `eslint-disable-next-line @typescript-eslint/no-explicit-any` 주석과 함께 이유를 코멘트로 남기는 것이 좋다.

**Q3. 제네릭 컴포넌트가 TSX 파일에서 파싱 오류가 날 수 있나요?**

`.tsx` 파일에서 `<T>` 문법이 JSX 태그로 해석될 수 있다. 이를 해결하는 방법은 두 가지다. 첫째, `<T extends unknown>` 또는 `<T extends object>`처럼 제약을 추가한다. 둘째, 화살표 함수 대신 일반 함수 선언(`function List<T>`)을 사용한다. 대부분의 경우 일반 함수 선언이 더 명확하므로 제네릭 컴포넌트에서는 선호되는 패턴이다.

**Q4. Props 타입에 `children`을 항상 명시해야 하나요?**

React 18 이후 `children`이 Props에 자동 포함되지 않으므로 `children`을 사용하는 컴포넌트라면 반드시 명시해야 한다. `children: React.ReactNode`로 직접 작성하거나 `PropsWithChildren<T>` 유틸리티 타입을 사용하는 두 가지 방법이 있다. 팀 컨벤션에 따라 하나를 선택해 통일하면 된다.

**Q5. 외부 라이브러리의 타입이 잘못되었을 때는 어떻게 하나요?**

TypeScript의 Declaration Merging 기능을 사용하여 타입을 수정(augment)할 수 있다. 프로젝트 루트에 `*.d.ts` 파일을 만들고 해당 모듈의 타입을 다시 선언하면 된다. 또는 `@types/라이브러리명` 패키지가 별도로 있다면 해당 패키지를 설치하면 해결되는 경우가 많다. 공식 수정이 필요하다면 해당 라이브러리의 GitHub에 이슈를 제출하거나 PR을 기여하는 것도 좋은 방법이다.

---

## 7. 다음 단계 예고

> **Step 32. React Hook Form과 Zod 검증**
>
> - useState 기반 수동 폼 관리의 한계
> - React Hook Form의 Uncontrolled 기반 성능 최적화
> - register, handleSubmit, formState 패턴
> - Zod 스키마로 런타임 검증 + 타입 추론 동시 달성
> - RHF + Zod 통합: zodResolver
> - 동적 폼, 배열 필드(useFieldArray), 다단계 폼

---

## 📚 참고 자료

- [React 공식 문서 — TypeScript](https://react.dev/learn/typescript)
- [React TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript 공식 문서 — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Matt Pocock — Total TypeScript](https://www.totaltypescript.com/)
- [React + TypeScript — ComponentProps 패턴](https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase)

---

> **React 완성 로드맵 v2.0** | Phase 5 — 타입 안전성·폼·스타일링 | Step 31 of 42
