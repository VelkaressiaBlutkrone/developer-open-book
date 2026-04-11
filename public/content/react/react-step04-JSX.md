# Step 04. JSX와 컴포넌트 실행 모델

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟢 초급 (Beginner)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| **Remember**   | JSX, React Element, Transpile, Virtual DOM의 정의를 기술할 수 있다         |
| **Understand** | JSX가 JavaScript로 변환되는 과정을 단계별로 설명할 수 있다                 |
| **Understand** | 함수 컴포넌트가 호출되어 화면에 표시되기까지의 흐름을 설명할 수 있다       |
| **Apply**      | JSX 코드를 React.createElement 호출로 수동 변환할 수 있다                  |
| **Analyze**    | React Element 객체의 구조를 분석하고 DOM Element와의 차이를 구분할 수 있다 |
| **Evaluate**   | "렌더링 = 함수 실행"이라는 관점에서 컴포넌트의 순수성을 판단할 수 있다     |

**전제 지식:**

- Step 1: 개발 환경과 프로젝트 구조 (Vite, 진입점 개념)
- Step 2: 모던 JavaScript (화살표 함수, Destructuring, ES Module)
- Step 3: React 생태계 조감도 (SPA, CSR 개념)

---

## 1. 서론 — 왜 JSX의 내부 동작을 알아야 하는가

### 1.1 JSX의 탄생 배경 — 템플릿과 로직의 통합

웹 UI를 구성하는 전통적인 방식은 "관심사의 분리(Separation of Concerns)"라는 원칙 아래, HTML(구조), CSS(표현), JavaScript(동작)를 별도의 파일로 나누는 것이었다. PHP, JSP, Django 템플릿 등 서버 사이드 템플릿 엔진도 이 패러다임을 따랐으며, Angular.js 역시 HTML 파일에 디렉티브(ng-if, ng-repeat)를 삽입하는 방식을 채택했다.

2013년 React가 처음 공개되었을 때, JSX는 개발자 커뮤니티에서 **가장 논란이 된 설계 결정**이었다. "JavaScript 안에 HTML을 넣는 것"은 당시의 모범 관행(Best Practice)에 정면으로 반하는 것으로 보였기 때문이다. 그러나 React 팀은 "기술(HTML/JS/CSS)에 의한 분리"가 아니라 **"관심사(컴포넌트)에 의한 분리"** 가 더 효과적이라고 주장했다. 버튼의 마크업, 스타일, 동작은 서로 밀접하게 연관되어 있으므로, 이들을 하나의 컴포넌트에 모아두는 것이 변경과 유지보수에 유리하다는 논리였다.

이 결정은 결과적으로 옳았음이 증명되었다. Vue의 SFC(Single File Component), Svelte의 `.svelte` 파일 등 후발 프레임워크들도 마크업과 로직을 하나의 단위로 통합하는 방식을 채택했다. JSX는 이제 React뿐 아니라 SolidJS, Preact, Qwik 등 다양한 프레임워크에서도 사용되는 범용 문법이 되었다.

### 1.2 산업적 가치 — JSX와 컴포넌트 모델의 현재 위상

JSX 기반의 컴포넌트 모델은 현재 프론트엔드 개발의 핵심 패러다임이다. GitHub의 연간 보고서에 따르면 TypeScript/JavaScript 생태계에서 가장 많이 사용되는 파일 확장자 중 `.jsx`와 `.tsx`가 상위권을 차지하고 있다. 이는 JSX가 단순한 문법적 편의가 아니라, **UI 개발의 사실상 표준 표현 방식**으로 자리잡았음을 의미한다.

JSX와 컴포넌트 실행 모델을 깊이 이해하는 것은 실무에서 디버깅 능력과 직결된다. "왜 화면이 업데이트되지 않는가?", "왜 컴포넌트가 무한 렌더링되는가?", "왜 이벤트 핸들러가 이전 값을 참조하는가?" 같은 실무 문제의 90% 이상이 JSX의 변환 과정, React Element의 불변성, "렌더링 = 함수 실행"이라는 원리를 이해하면 해결할 수 있다.

### 1.3 이 Step의 핵심 개념 관계도

```
┌──────────────────────────────────────────────────────────────┐
│              Step 04 핵심 개념 관계도                           │
│                                                               │
│  개발자 작성                                                  │
│    JSX 코드 (.jsx / .tsx)                                    │
│       │                                                       │
│       │ Babel / SWC (트랜스파일)                              │
│       ▼                                                       │
│  React.createElement() / jsx()                               │
│       │                                                       │
│       │ 함수 호출 결과                                        │
│       ▼                                                       │
│  React Element (Plain Object, 불변)                          │
│       │                                                       │
│       │ type이 함수? ──→ 해당 함수 호출 (재귀)                │
│       │ type이 문자열? ──→ 해석 완료                          │
│       ▼                                                       │
│  최종 Element 트리 (Virtual DOM)                              │
│       │                                                       │
│       │ ReactDOM (Commit Phase)                               │
│       ▼                                                       │
│  실제 DOM ──→ 브라우저 Paint ──→ 사용자가 화면을 봄            │
│                                                               │
│  핵심 원칙:                                                   │
│    · 렌더링 = 함수 실행 (DOM 조작이 아님)                     │
│    · 컴포넌트 = 순수 함수 (같은 입력 → 같은 출력)             │
│    · UI = f(state) (선언적 UI의 핵심 공식)                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 표면 아래의 메커니즘

React 코드를 처음 보면 HTML과 JavaScript가 섞인 독특한 문법에 놀란다. 이것이 **JSX**이다. 대부분의 입문 자료는 "JSX는 HTML 같은 문법이다"라고 설명하고 넘어가지만, 이 설명만으로는 React의 동작 원리를 이해할 수 없다.

```jsx
// 이 코드가 실제로 어떻게 동작하는지 정확히 아는 것이 이 Step의 목표이다
function App() {
  return (
    <div className="app">
      <h1>Hello, React!</h1>
    </div>
  );
}
```

### 1.5 이 Step을 학습하면 답할 수 있는 질문들

```
· JSX는 JavaScript인가, HTML인가, 둘 다 아닌가?
· 브라우저는 JSX를 직접 실행할 수 있는가?
· <div>와 <MyComponent>를 React는 어떻게 구분하는가?
· "렌더링"이란 정확히 어떤 과정을 말하는가?
· React Element는 DOM Element와 어떻게 다른가?
· 컴포넌트 함수는 누가, 언제 호출하는가?
```

### 1.6 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · JSX의 정체와 변환 과정                                │
│  · React.createElement / jsx 런타임                     │
│  · React Element 객체의 구조                             │
│  · 함수 컴포넌트의 호출 메커니즘                          │
│  · "렌더링 = 함수 실행" 개념과 순수 함수 원칙             │
│  · ReactDOM의 역할과 createRoot                         │
│  · JSX 핵심 문법 정리                                    │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Props 심화 (Step 5)                                  │
│  · State와 재렌더링 (Step 6)                             │
│  · Reconciliation / Diff 알고리즘 (Step 7)              │
│  · Fiber Architecture (Step 10)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                    | 정의                                                                                                         | 왜 중요한가                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **JSX**                 | JavaScript XML. JavaScript 안에 XML/HTML 형태의 마크업을 작성할 수 있게 하는 **문법 확장(Syntax Extension)** | React UI 작성의 표준 문법이며, 브라우저에서 직접 실행할 수 없다 |
| **Transpile**           | 한 형태의 소스 코드를 비슷한 수준의 다른 형태로 변환하는 것                                                  | JSX → JavaScript 변환이 필수적이다. Babel, SWC가 수행           |
| **React.createElement** | React Element 객체를 생성하는 함수. JSX의 변환 결과물                                                        | JSX의 실체를 이해하는 핵심이다                                  |
| **React Element**       | UI를 **서술(describe)** 하는 **일반 JavaScript 객체(Plain Object)**. DOM이 아니다                            | React의 렌더링 단위이며, 불변이고 가볍다                        |
| **컴포넌트(Component)** | React Element를 반환하는 **함수**(또는 클래스). UI의 재사용 가능한 단위                                      | React 애플리케이션의 기본 구성 블록이다                         |
| **렌더링(Rendering)**   | 컴포넌트 함수를 호출하여 React Element 트리를 생성하는 과정. **DOM 조작이 아니다**                           | React의 "렌더링"은 일반적 의미(화면 그리기)와 다르다            |
| **마운트(Mount)**       | 컴포넌트가 처음으로 화면에 나타나는 것                                                                       | 초기 렌더링 + DOM 삽입 과정이다                                 |
| **ReactDOM**            | React Element 트리를 실제 브라우저 DOM으로 변환하는 **렌더러(Renderer)**                                     | React Core와 플랫폼(브라우저)을 연결하는 다리이다               |
| **jsx-runtime**         | React 17+에서 도입된 자동 JSX 변환 모듈. `import React`를 생략 가능하게 한다                                 | 현재의 표준 변환 방식이다                                       |
| **Pure Function**       | 같은 입력에 항상 같은 출력을 반환하고, 부수 효과가 없는 함수                                                 | React 컴포넌트의 필수 요건이다                                  |
| **선언적 UI**           | "무엇을 보여줄지"를 기술하는 방식. "어떻게 변경할지"를 직접 지시하는 명령적 방식의 반대                      | React의 핵심 철학이다                                           |

### 2.2 핵심 용어 심층 해설

#### JSX (JavaScript XML)

JSX는 JavaScript의 **문법 확장(Syntax Extension)** 으로, XML/HTML과 유사한 형태로 UI 구조를 표현할 수 있게 해준다. 중요한 것은 JSX가 ECMAScript 표준의 일부가 아니라는 점이다. 브라우저의 JavaScript 엔진은 JSX를 이해할 수 없으며, 반드시 Babel, SWC 같은 트랜스파일러가 일반 JavaScript 함수 호출(`React.createElement` 또는 `jsx`)로 변환해야 실행할 수 있다.

JSX가 "문법적 설탕(Syntactic Sugar)"이라는 표현은 JSX 없이도 React를 완전히 사용할 수 있다는 뜻이다. 그러나 실무에서 JSX 없이 React를 사용하는 경우는 거의 없다. 중첩이 깊은 UI 구조를 `React.createElement`로 작성하면 가독성이 극도로 떨어지기 때문이다. JSX는 **개발자 경험(DX)을 위한 필수적 편의 도구**라고 이해하면 정확하다.

#### React Element

React Element는 `React.createElement()` 또는 `jsx()`가 반환하는 **일반 JavaScript 객체(Plain Object)** 이다. DOM Element와 이름이 비슷하지만 완전히 다른 개념이다. DOM Element는 브라우저가 관리하는 수백 개의 속성과 메서드를 가진 무거운 객체인 반면, React Element는 `type`, `props`, `key`, `ref` 등 5~6개의 속성만 가진 가벼운 객체이다.

React Element의 가장 중요한 특성은 **불변성(Immutability)** 이다. 한 번 생성된 React Element의 속성은 변경할 수 없다. UI를 변경하려면 기존 Element를 수정하는 것이 아니라 **새로운 Element를 생성**해야 한다. 이 불변성 덕분에 React는 이전 트리와 새 트리를 비교(Reconciliation)하여 변경된 부분만 효율적으로 DOM에 반영할 수 있다.

#### 렌더링 (Rendering)

React에서 "렌더링"이란 **컴포넌트 함수를 호출하여 React Element 트리를 생성하는 과정**을 말한다. 일반적으로 "렌더링"은 "화면에 그리기"를 의미하지만, React의 렌더링은 DOM 조작을 포함하지 않는다. DOM 변경은 렌더링 이후의 **Commit Phase**에서 별도로 수행된다.

이 구분이 중요한 이유는 **성능 최적화의 기초**이기 때문이다. React의 렌더링(함수 호출)은 자주 발생하지만, 실제 DOM 변경(Commit)은 변경된 부분에 대해서만 일어난다. "렌더링이 자주 일어난다"는 것이 곧 "성능 문제"를 의미하지 않는다. 렌더링 결과가 이전과 동일하면 DOM은 변경되지 않기 때문이다.

#### 순수 함수 (Pure Function)

순수 함수는 두 가지 조건을 만족하는 함수이다. 첫째, 동일한 입력에 대해 항상 동일한 출력을 반환한다. 둘째, 함수 실행 중 외부 세계를 변경하지 않는다(부수 효과 없음). React 컴포넌트는 **렌더링 과정에서 반드시 순수 함수처럼 동작해야** 한다.

순수성 원칙이 실무적으로 중요한 이유는 React의 Strict Mode와 Concurrent 기능 때문이다. React 18의 Strict Mode는 개발 모드에서 컴포넌트를 **이중으로 실행**하여 순수성을 검증한다. 순수하지 않은 컴포넌트는 이중 실행 시 예상치 못한 동작(외부 변수가 2배로 증가 등)을 보이며, 이는 Concurrent Rendering에서 실제 버그로 이어질 수 있다.

### 2.3 개념 간 관계도

```
개발자가 작성        트랜스파일러가 변환          React가 처리

  JSX 코드    ─→    React.createElement()    ─→    React Element
  (문법 확장)        또는 jsx() 호출               (Plain Object)
                          │                            │
                          │                            │
                     Babel / SWC               React의 Reconciliation
                     (빌드 도구가 실행)          (이전 트리와 비교)
                                                       │
                                                       ▼
                                                  ReactDOM이
                                               실제 DOM에 반영
                                                       │
                                                       ▼
                                                브라우저가 화면에 표시
```

### 2.4 선언적(Declarative) vs 명령적(Imperative) UI

React를 이해하기 위한 가장 근본적인 사고 전환이다.

```
명령적 UI (Imperative) — "어떻게 변경할지"를 단계별로 지시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 할 일을 완료 표시하려면:
  const li = document.querySelector('#todo-1');
  li.classList.add('completed');
  li.querySelector('.checkbox').checked = true;
  li.querySelector('.text').style.textDecoration = 'line-through';
  document.querySelector('#count').textContent = '2개 남음';

  → 개발자가 DOM 조작의 모든 단계를 직접 기술
  → 상태와 UI의 동기화를 수동으로 관리


선언적 UI (Declarative) — "무엇을 보여줄지"만 기술
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 현재 상태에 맞는 UI를 선언
  function TodoItem({ todo }) {
    return (
      <li className={todo.done ? 'completed' : ''}>
        <input type="checkbox" checked={todo.done} />
        <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          {todo.text}
        </span>
      </li>
    );
  }

  → 개발자는 "상태가 이러하면 UI는 이렇다"만 기술
  → 상태가 바뀌면 React가 알아서 DOM을 업데이트
  → UI = f(state)
```

> 💡 **핵심 공식: `UI = f(state)`** — React에서 UI는 현재 상태(State)의 함수이다. 같은 상태가 주어지면 항상 같은 UI가 반환된다. 이것이 React의 모든 설계의 출발점이다.

---

## 3. 이론과 원리

### 3.1 JSX의 정체

#### JSX는 무엇이 아닌가

```
JSX는 HTML이 아니다
  → HTML과 비슷하게 생겼지만, JavaScript의 확장 문법이다
  → class 대신 className, for 대신 htmlFor 등 차이가 있다

JSX는 JavaScript 표준이 아니다
  → ECMAScript 명세에 포함되지 않는다
  → 브라우저가 직접 해석할 수 없다

JSX는 React 전용이 아니다
  → JSX는 독립적인 문법 명세이다
  → Vue, SolidJS, Preact 등도 JSX를 사용할 수 있다
  → 다만 현실적으로 React 생태계에서 가장 널리 사용된다
```

#### JSX는 무엇인가

**JSX는 `React.createElement()` 호출을 사람이 읽기 쉬운 형태로 작성할 수 있게 해주는 Syntactic Sugar(문법적 설탕)이다.**

```jsx
// 개발자가 작성하는 코드 (JSX)
const element = <h1 className="title">Hello, React!</h1>;

// 실제로 실행되는 코드 (JavaScript)
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello, React!",
);

// 두 코드의 결과는 완전히 동일하다
// JSX 없이도 React를 사용할 수 있다 (그러나 매우 불편하다)
```

### 3.2 JSX → JavaScript 변환 과정

#### React 17 이전: Classic Transform

```javascript
// JSX 원본
const element = <h1 className="title">Hello!</h1>;

// Babel이 변환한 결과
const element = React.createElement(
  "h1", // type: HTML 태그명 (문자열) 또는 컴포넌트 (함수)
  { className: "title" }, // props: 속성 객체 (없으면 null)
  "Hello!", // children: 자식 요소들
);
```

**이 방식의 제약:**

```jsx
// React 17 이전에는 JSX가 있는 모든 파일에 이 import가 필수였다
import React from "react"; // ← React.createElement를 직접 호출하므로

function App() {
  return <div>Hello</div>; // → React.createElement('div', null, 'Hello')
  //       ↑ React가 스코프에 있어야 함
}
```

#### React 17 이후: Automatic JSX Transform (현재 표준)

```javascript
// JSX 원본
const element = <h1 className="title">Hello!</h1>;

// 컴파일러가 자동으로 변환한 결과
import { jsx as _jsx } from "react/jsx-runtime"; // ← 자동 삽입됨

const element = _jsx("h1", {
  className: "title",
  children: "Hello!", // children이 props 안에 포함됨
});
```

**Automatic Transform의 장점:**

```
1. import React from 'react' 를 생략할 수 있다
   → 컴파일러가 jsx-runtime을 자동으로 import

2. 약간의 번들 크기 최적화
   → React 전체 대신 jsx-runtime만 import

3. JSX 런타임이 React Core에서 분리됨
   → 미래에 다른 런타임으로 교체 가능
```

#### 변환을 수행하는 도구

```
┌──────────────────────────────────────────────────┐
│  도구          │ 언어    │ 속도     │ 사용 맥락   │
├──────────────────────────────────────────────────┤
│  Babel         │ JS      │ 보통    │ 레거시, 범용 │
│  SWC           │ Rust    │ 매우 빠름│ Vite, Next.js│
│  esbuild       │ Go      │ 매우 빠름│ Vite 개발 서버│
│  TypeScript    │ TS      │ 보통    │ tsc 직접 사용│
│  Compiler      │         │         │              │
└──────────────────────────────────────────────────┘

Vite의 경우:
  · 개발 모드: esbuild가 JSX → JS 변환 (초고속)
  · 프로덕션 빌드: SWC 또는 Babel이 변환 (최적화 포함)
```

### 3.3 React Element — JSX 변환의 결과물

#### React Element의 구조

`React.createElement()` 또는 `_jsx()`가 반환하는 것은 **Plain JavaScript Object**이다.

```javascript
// 이 JSX가
<h1 className="title" id="main">Hello!</h1>

// 이런 객체를 만든다 (단순화)
{
  $$typeof: Symbol.for('react.element'),   // React Element 식별 마커
  type: 'h1',                              // HTML 태그명 (문자열)
  key: null,                               // 리스트 식별자 (Step 7)
  ref: null,                               // DOM 참조 (Step 12)
  props: {                                 // 모든 속성 + children
    className: 'title',
    id: 'main',
    children: 'Hello!'
  }
}
```

#### $$typeof의 의미

```
$$typeof: Symbol.for('react.element')

  · Symbol은 JSON으로 직렬화할 수 없다
  · 이 속성은 보안 목적으로 존재한다
  · 서버에서 받은 JSON 데이터에 악의적인 React Element가 포함되는 것을 방지
  · React는 $$typeof가 올바른 Symbol인 경우에만 Element로 처리한다
```

#### React Element의 핵심 특성

```
┌──────────────────────────────────────────────────────┐
│  React Element의 4가지 특성                            │
│                                                       │
│  1. Plain Object (일반 객체)                          │
│     · 특별한 클래스의 인스턴스가 아니다                 │
│     · 가볍다 (DOM 노드보다 생성 비용이 훨씬 적음)      │
│                                                       │
│  2. Immutable (불변)                                  │
│     · 한 번 생성되면 속성을 변경할 수 없다              │
│     · Object.freeze()로 동결됨 (개발 모드)             │
│     · UI를 변경하려면 새 Element를 생성해야 한다        │
│                                                       │
│  3. Descriptive (서술적)                              │
│     · "무엇을 그려야 하는지"를 서술할 뿐               │
│     · 실제로 DOM을 생성하지 않는다                     │
│     · 설계도(blueprint)에 해당                        │
│                                                       │
│  4. Tree Structure (트리 구조)                        │
│     · children을 통해 중첩되어 트리를 형성한다          │
│     · 이 트리가 Virtual DOM Tree에 해당               │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### 중첩 구조의 변환

```jsx
// 중첩된 JSX
const element = (
  <div className="card">
    <h2>제목</h2>
    <p>본문입니다</p>
  </div>
);

// 변환 결과 (Classic Transform)
const element = React.createElement(
  'div',
  { className: 'card' },
  React.createElement('h2', null, '제목'),
  React.createElement('p', null, '본문입니다')
);

// 생성되는 React Element 트리
{
  type: 'div',
  props: {
    className: 'card',
    children: [
      {
        type: 'h2',
        props: { children: '제목' }
      },
      {
        type: 'p',
        props: { children: '본문입니다' }
      }
    ]
  }
}
```

```
시각화: React Element 트리

  { type: 'div', className: 'card' }
      ├── { type: 'h2', children: '제목' }
      └── { type: 'p', children: '본문입니다' }

  → 이 객체 트리가 "Virtual DOM"이라고 불리는 것의 실체이다
  → 실제 DOM 트리와 1:1 대응하지만, 훨씬 가볍다
```

### 3.4 함수 컴포넌트의 호출 원리

#### 컴포넌트 = React Element를 반환하는 함수

```jsx
// 함수 컴포넌트 정의
function Greeting({ name }) {
  return <h1>안녕하세요, {name}님!</h1>;
}

// 변환 후
function Greeting({ name }) {
  return _jsx("h1", { children: `안녕하세요, ${name}님!` });
}

// 이 함수가 반환하는 것: React Element 객체
// {
//   type: 'h1',
//   props: { children: '안녕하세요, 홍길동님!' }
// }
```

#### 컴포넌트를 JSX에서 사용할 때의 동작

```jsx
// JSX에서 컴포넌트 사용
const app = <Greeting name="홍길동" />;

// 변환 결과
const app = _jsx(Greeting, { name: '홍길동' });

// 생성되는 React Element
{
  type: Greeting,              // ← 문자열이 아닌 함수 참조!
  props: { name: '홍길동' }
}
```

**HTML 태그와 컴포넌트의 type 차이:**

```
<div />       →  { type: 'div', ... }        type이 문자열
<h1 />        →  { type: 'h1', ... }         type이 문자열
<Greeting />  →  { type: Greeting, ... }     type이 함수
<App />       →  { type: App, ... }          type이 함수
```

#### React가 Element 트리를 처리하는 재귀 과정

```
React가 <App /> 을 처리하는 과정

  Step 1: App Element 확인
  { type: App, props: {} }
  → type이 함수이다 → App() 호출

  Step 2: App() 실행 결과 확인
  App() 반환값:
  { type: 'div', props: {
      children: [
        { type: Greeting, props: { name: '홍길동' } },
        { type: 'p', props: { children: '본문' } }
      ]
  }}

  Step 3: 자식 중 Greeting도 함수이다 → Greeting({ name: '홍길동' }) 호출

  Step 4: Greeting() 실행 결과 확인
  { type: 'h1', props: { children: '안녕하세요, 홍길동님!' } }
  → type이 문자열이다 → HTML 태그로 인식, 더 이상 호출할 함수 없음

  Step 5: 모든 type이 문자열인 트리 완성
  { type: 'div', props: {
      children: [
        { type: 'h1', props: { children: '안녕하세요, 홍길동님!' } },
        { type: 'p', props: { children: '본문' } }
      ]
  }}

  → 이 최종 트리를 ReactDOM이 실제 DOM으로 변환
```

```
시각화: 컴포넌트 해석(Resolution) 과정

  { type: App }                        컴포넌트 (함수)
       │  App() 호출
       ▼
  { type: 'div' }                      HTML 태그 (문자열) ✓
    ├── { type: Greeting }             컴포넌트 (함수)
    │        │  Greeting() 호출
    │        ▼
    │   { type: 'h1' }                 HTML 태그 (문자열) ✓
    │
    └── { type: 'p' }                  HTML 태그 (문자열) ✓

  → 모든 노드의 type이 문자열이 될 때까지 재귀적으로 함수를 호출한다
```

#### 대문자 규칙 — HTML 태그 vs 컴포넌트 구분

React(정확히는 JSX 트랜스파일러)는 **첫 글자의 대소문자**로 HTML 태그와 컴포넌트를 구분한다.

```jsx
// 소문자로 시작 → HTML 태그로 인식
<div />     →  _jsx('div', {})          // type: 'div' (문자열)
<section /> →  _jsx('section', {})      // type: 'section' (문자열)

// 대문자로 시작 → 컴포넌트로 인식
<App />     →  _jsx(App, {})            // type: App (함수 참조)
<MyButton />→  _jsx(MyButton, {})       // type: MyButton (함수 참조)
```

```
⚠️ 컴포넌트 이름을 소문자로 시작하면?

  function greeting() {                // 소문자!
    return <h1>Hello</h1>;
  }

  <greeting name="홍길동" />
  → _jsx('greeting', { name: '홍길동' })
  → type: 'greeting' (문자열)
  → React가 <greeting>이라는 HTML 태그를 찾음
  → 존재하지 않는 태그 → 의도한 대로 동작하지 않음

  ✅ 반드시 PascalCase(대문자 시작)를 사용해야 한다
```

### 3.5 렌더링 = 함수 실행

#### React에서 "렌더링"의 정확한 정의

일상적으로 "렌더링"은 "화면에 그리는 것"을 의미하지만, React에서의 렌더링은 **"컴포넌트 함수를 호출하여 React Element 트리를 생성하는 것"** 이다. DOM 조작은 렌더링이 아니라 그 **다음 단계(Commit Phase)** 에서 일어난다.

```
React의 화면 업데이트 3단계

  ┌─────────────────┐
  │ 1. Trigger       │  "무언가"가 렌더링을 촉발한다
  │                  │  · 초기 마운트
  │                  │  · State 변경 (Step 6에서 학습)
  │                  │  · Props 변경
  │                  │  · 부모 재렌더링
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ 2. Render        │  컴포넌트 함수를 호출한다 ★
  │   (렌더링)       │  · 함수 본문 전체가 실행됨
  │                  │  · 새로운 React Element 트리 생성
  │                  │  · 이전 트리와 비교 (Reconciliation, Step 7)
  │                  │  · ※ DOM을 건드리지 않는다!
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ 3. Commit        │  변경 사항을 실제 DOM에 반영한다
  │   (커밋)         │  · 변경된 부분만 DOM에 적용
  │                  │  · 브라우저가 화면을 다시 그림 (Repaint)
  └─────────────────┘
```

#### 렌더링 = 함수 실행의 의미

```jsx
function Counter({ initial }) {
  // ── 이 함수 전체가 "렌더링"이다 ──

  const [count, setCount] = useState(initial);

  // 매 렌더링마다 이 변수가 새로 계산된다
  const doubled = count * 2;

  // 매 렌더링마다 이 함수 객체가 새로 생성된다
  const handleClick = () => setCount(count + 1);

  // 매 렌더링마다 새로운 React Element 트리가 반환된다
  return (
    <div>
      <p>카운트: {count}</p>
      <p>두 배: {doubled}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}
```

```
렌더링 흐름 시각화

  [렌더링 #1] Counter({ initial: 0 }) 호출
              count = 0, doubled = 0
              → Element 트리 생성 → DOM에 반영

  (사용자가 버튼 클릭 → setCount(1))

  [렌더링 #2] Counter({ initial: 0 }) 호출  ← 함수 전체가 다시 실행!
              count = 1, doubled = 2         ← 새 값으로 계산
              → Element 트리 생성 → 이전 트리와 비교 → 변경분만 DOM에 반영

  (사용자가 버튼 클릭 → setCount(2))

  [렌더링 #3] Counter({ initial: 0 }) 호출  ← 또 다시 전체 실행!
              count = 2, doubled = 4
              → Element 트리 생성 → 비교 → 변경분만 DOM에 반영
```

> 💡 **핵심 인사이트:** 매 렌더링마다 **함수 전체가 다시 실행**된다. 지역 변수, 핸들러 함수, JSX 반환값 모두 새로 만들어진다. 이것이 React의 근본 동작 방식이며, 이후 배우는 모든 최적화(useMemo, useCallback 등)는 이 "매번 다시 실행" 위에 세워진 것이다.

### 3.6 순수 함수(Pure Function)로서의 컴포넌트

#### 순수 함수의 조건

```
순수 함수 (Pure Function)의 두 가지 조건

  1. 동일 입력 → 동일 출력 (Deterministic)
     · 같은 Props, 같은 State가 주어지면 항상 같은 React Element를 반환

  2. 부수 효과 없음 (No Side Effects)
     · 렌더링 중에 외부 세계를 변경하지 않는다
     · 외부 변수 변경, DOM 조작, 네트워크 요청, 타이머 등을 하지 않는다
```

#### 순수한 컴포넌트 vs 불순한 컴포넌트

```jsx
// ✅ 순수한 컴포넌트 — 같은 Props면 항상 같은 결과
function UserCard({ name, age }) {
  const label = `${name} (${age}세)`;
  return (
    <div className="card">
      <h2>{label}</h2>
    </div>
  );
}
// · 외부 상태를 읽지 않음
// · 외부 상태를 변경하지 않음
// · name='홍길동', age=25 → 항상 같은 Element 반환
```

```jsx
// ❌ 불순한 컴포넌트 — 렌더링 중 부수 효과 발생
let renderCount = 0;

function BadComponent({ user }) {
  renderCount++; // 부수 효과 1: 외부 변수 변경
  document.title = `${user.name}의 페이지`; // 부수 효과 2: DOM 직접 조작
  console.log("렌더링됨"); // 부수 효과 3: 콘솔 출력

  return <p>{user.name}</p>;
}
// · 호출할 때마다 renderCount가 증가
// · document.title이 변경됨
// · StrictMode에서 이중 실행 시 renderCount가 2씩 증가 → 버그
```

#### 부수 효과는 어디서 처리하는가

```
렌더링 중 (함수 본문) — 순수하게 유지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ 변수 계산, 조건 분기, JSX 반환
  ❌ 외부 변수 변경
  ❌ DOM 직접 조작
  ❌ 네트워크 요청
  ❌ 타이머 설정
  ❌ 구독(subscribe) 설정

이벤트 핸들러 — 부수 효과 허용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ State 업데이트 (setCount 등)
  ✅ API 호출
  ✅ 페이지 이동

useEffect — 렌더링 후 부수 효과 (Step 11에서 학습)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ DOM 조작 (렌더링 완료 후)
  ✅ 데이터 패칭
  ✅ 구독 설정/해제
  ✅ 타이머 설정/정리
  ✅ document.title 변경
```

### 3.7 ReactDOM — React Element를 실제 DOM으로

#### React와 ReactDOM의 분리

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  react (Core)                                           │
│  ─────────────                                          │
│  · 컴포넌트 모델                                        │
│  · Hooks                                                │
│  · Reconciliation 알고리즘                               │
│  · React Element 생성                                   │
│  · 플랫폼에 독립적 (브라우저를 모름)                     │
│                                                          │
│  react-dom (Renderer for Browser)                       │
│  ─────────────────────────────────                      │
│  · React Element → 실제 브라우저 DOM으로 변환            │
│  · 이벤트 시스템 (Synthetic Event)                       │
│  · createRoot, hydrateRoot                              │
│                                                          │
│  react-native (Renderer for Mobile)                     │
│  ────────────────────────────────                       │
│  · React Element → iOS/Android 네이티브 뷰로 변환       │
│                                                          │
│  react-three-fiber (Renderer for 3D)                    │
│  ──────────────────────────────────                     │
│  · React Element → Three.js 오브젝트로 변환             │
│                                                          │
│  → React Core가 플랫폼에 독립적이기 때문에               │
│    동일한 컴포넌트 모델로 다양한 환경을 대상으로 할 수 있다 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### createRoot와 렌더링 진입점

```jsx
// src/main.jsx — React 애플리케이션의 진입점

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// 1. 실제 DOM 노드를 찾는다 (index.html의 <div id="root">)
const container = document.getElementById("root");

// 2. React Root를 생성한다
//    → 이 DOM 노드를 React가 관리하겠다고 선언
const root = createRoot(container);

// 3. React Element 트리를 전달하여 첫 렌더링을 시작한다
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```
createRoot(container).render(<App />) 의 내부 동작

  Step 1: <App /> → _jsx(App, {})
          → { type: App, props: {} } React Element 생성

  Step 2: React가 App()을 호출 → 반환된 Element 확인
          → 자식 중 함수인 type을 재귀적으로 호출

  Step 3: 모든 type이 문자열인 최종 Element 트리 완성

  Step 4: ReactDOM이 Element 트리를 순회하며 실제 DOM 노드 생성
          · { type: 'div' }  → document.createElement('div')
          · { type: 'h1' }   → document.createElement('h1')
          · props 적용 (className, onClick 등)

  Step 5: 생성된 DOM 노드를 container(#root) 안에 삽입

  Step 6: 브라우저가 화면에 렌더링 (Paint)
```

#### React 18+ createRoot vs 레거시 render

```jsx
// React 18 이전 (Legacy Mode)
import ReactDOM from "react-dom";
ReactDOM.render(<App />, document.getElementById("root"));
// · 동기 렌더링만 가능
// · Concurrent 기능 사용 불가

// React 18 이후 (Concurrent Mode) ★ 현재 표준
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("root"));
root.render(<App />);
// · Concurrent 렌더링 활성화
// · useTransition, Suspense 등 사용 가능
// · Automatic Batching 활성화
```

### 3.8 JSX 핵심 문법 정리

#### 표현식 삽입 — 중괄호 `{}`

JSX 안에서 `{}`를 사용하면 **JavaScript 표현식**(값을 반환하는 코드)을 삽입할 수 있다.

```jsx
function Profile({ user }) {
  return (
    <div>
      {/* 변수 참조 */}
      <h1>{user.name}</h1>

      {/* 계산 */}
      <p>내년 나이: {user.age + 1}세</p>

      {/* 함수 호출 */}
      <p>가입: {formatDate(user.joinedAt)}</p>

      {/* 삼항 연산자 */}
      <span>{user.isActive ? "활성" : "비활성"}</span>

      {/* 논리 AND — 조건부 렌더링 */}
      {user.isPremium && <Badge text="프리미엄" />}

      {/* 객체 속성 접근 */}
      <p>{user.address?.city ?? "주소 미등록"}</p>
    </div>
  );
}
```

```
⚠️ 삽입할 수 없는 것들

  · if문, for문, while문 (문(statement)이므로)
  · 변수 선언 (const x = 1)
  · 객체 리터럴을 직접 렌더링 ({a: 1}) → 에러!
    → style={{}} 형태는 가능 (외부 {}가 표현식, 내부 {}가 객체)
```

#### HTML과 다른 속성명

```
┌────────────────┬──────────────────┬──────────────────────┐
│  HTML           │  JSX             │  이유                │
├────────────────┼──────────────────┼──────────────────────┤
│  class          │  className       │  class는 JS 예약어   │
│  for            │  htmlFor         │  for는 JS 예약어     │
│  tabindex       │  tabIndex        │  camelCase 규칙      │
│  onclick        │  onClick         │  camelCase 규칙      │
│  onchange       │  onChange        │  camelCase 규칙      │
│  maxlength      │  maxLength       │  camelCase 규칙      │
│  style="..."    │  style={{...}}   │  객체 형태로 전달     │
│  checked (HTML) │  defaultChecked  │  비제어 컴포넌트      │
│  value (HTML)   │  defaultValue    │  비제어 컴포넌트      │
└────────────────┴──────────────────┴──────────────────────┘
```

#### style 속성

```jsx
// JSX에서 style은 문자열이 아닌 객체
<div
  style={{
    backgroundColor: "blue", // kebab-case → camelCase
    fontSize: "16px", // font-size → fontSize
    padding: "10px 20px",
    marginTop: 8, // 숫자는 px로 자동 변환 (일부 속성)
  }}
>
  스타일 예시
</div>;

// 변수로 분리하면 더 깔끔하다
const cardStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "16px",
};

<div style={cardStyle}>카드</div>;
```

#### Fragment — 불필요한 DOM 노드 방지

```jsx
// 컴포넌트는 반드시 하나의 루트 요소를 반환해야 한다
// ❌ 이것은 불가능
function Bad() {
  return (
    <h1>제목</h1>
    <p>본문</p>
  );
}

// 방법 1: 래퍼 <div> — DOM에 불필요한 노드가 추가됨
function WithDiv() {
  return (
    <div>
      <h1>제목</h1>
      <p>본문</p>
    </div>
  );
}

// 방법 2: Fragment 축약 — 추가 DOM 노드 없음 ★
function WithFragment() {
  return (
    <>
      <h1>제목</h1>
      <p>본문</p>
    </>
  );
}

// 방법 3: 명시적 Fragment — key가 필요할 때
import { Fragment } from 'react';

function Glossary({ items }) {
  return (
    <dl>
      {items.map(item => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

#### JSX에서 렌더링되지 않는 값

```jsx
// React가 무시하는 값 (화면에 표시되지 않음)
<div>
  {true}       {/* 무시 */}
  {false}      {/* 무시 */}
  {null}       {/* 무시 */}
  {undefined}  {/* 무시 */}
</div>

// React가 화면에 표시하는 값
<div>
  {0}          {/* "0" 표시 ← 주의! */}
  {''}         {/* 빈 문자열이지만 표시는 안 됨 */}
  {NaN}        {/* "NaN" 표시 */}
  {'hello'}    {/* "hello" 표시 */}
  {42}         {/* "42" 표시 */}
</div>

// 이것이 &&로 조건부 렌더링할 때 0이 위험한 이유
{count && <p>결과</p>}
// count=0일 때 → 0이 화면에 표시됨!
// Step 2에서 학습한 내용 복습
```

---

## 4. 사례 연구와 예시

### 4.1 사례: JSX 없이 React 사용하기

JSX가 Syntactic Sugar임을 증명하기 위해, 동일한 컴포넌트를 JSX와 순수 JavaScript로 각각 작성한다.

```jsx
// JSX 버전
function TodoItem({ todo, onToggle }) {
  return (
    <li className={todo.done ? "completed" : ""}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
    </li>
  );
}

// 순수 JavaScript 버전 (JSX 없이)
function TodoItem({ todo, onToggle }) {
  return React.createElement(
    "li",
    { className: todo.done ? "completed" : "" },
    React.createElement("input", {
      type: "checkbox",
      checked: todo.done,
      onChange: () => onToggle(todo.id),
    }),
    React.createElement("span", null, todo.text),
  );
}

// 두 코드는 완전히 동일한 React Element를 생성한다
// JSX가 얼마나 가독성을 향상시키는지 체감할 수 있다
```

### 4.2 사례: 한 컴포넌트의 전체 생명 과정 추적

`UserGreeting` 컴포넌트가 화면에 나타나기까지의 전 과정을 추적한다.

```jsx
// 컴포넌트 정의
function UserGreeting({ name, role }) {
  const greeting = role === "admin" ? "관리자" : "사용자";
  return (
    <div className="greeting">
      <h2>
        {greeting} {name}님, 환영합니다!
      </h2>
    </div>
  );
}

// 사용
function App() {
  return <UserGreeting name="홍길동" role="admin" />;
}
```

```
전체 과정 추적

  Phase A: 트랜스파일 (빌드 타임)
  ──────────────────────────────
  <UserGreeting name="홍길동" role="admin" />
  → _jsx(UserGreeting, { name: '홍길동', role: 'admin' })

  <div className="greeting">...</div>
  → _jsx('div', { className: 'greeting', children: _jsx('h2', ...) })


  Phase B: 초기 렌더링 (런타임 — Render Phase)
  ──────────────────────────────────────────────
  1. root.render(<App />) 호출

  2. App Element: { type: App, props: {} }
     → type이 함수 → App() 호출

  3. App() 반환: { type: UserGreeting, props: { name: '홍길동', role: 'admin' } }
     → type이 함수 → UserGreeting({ name: '홍길동', role: 'admin' }) 호출

  4. UserGreeting() 내부 실행:
     · greeting = 'admin' === 'admin' ? '관리자' : '사용자' → '관리자'
     · return JSX → Element 트리 반환

  5. 반환된 Element:
     { type: 'div', props: {
         className: 'greeting',
         children: { type: 'h2', props: {
           children: '관리자 홍길동님, 환영합니다!'
         }}
     }}

  6. 모든 type이 문자열 → 해석 완료


  Phase C: DOM 반영 (런타임 — Commit Phase)
  ──────────────────────────────────────────
  7. ReactDOM이 Element 트리를 순회:
     · document.createElement('div')
     · div.className = 'greeting'
     · document.createElement('h2')
     · h2.textContent = '관리자 홍길동님, 환영합니다!'
     · div.appendChild(h2)

  8. #root 노드에 삽입:
     · document.getElementById('root').appendChild(div)

  9. 브라우저가 Paint → 사용자가 화면을 본다


  최종 DOM:
  <div id="root">
    <div class="greeting">
      <h2>관리자 홍길동님, 환영합니다!</h2>
    </div>
  </div>
```

### 4.3 사례: React Element는 왜 DOM보다 가벼운가

```
DOM Element 생성 비용
━━━━━━━━━━━━━━━━━━━━
  const div = document.createElement('div');

  · 200개 이상의 속성과 메서드를 가진 객체
  · 이벤트 시스템, 레이아웃 정보, 스타일 계산 포함
  · 메모리 사용량: 수 KB ~ 수십 KB

React Element 생성 비용
━━━━━━━━━━━━━━━━━━━━
  const element = { type: 'div', props: { className: 'card' } };

  · 5~6개의 속성만 가진 Plain Object
  · $$typeof, type, key, ref, props 정도
  · 메모리 사용량: 수십 ~ 수백 바이트

→ React Element를 수천 개 만들어 비교(Diff)하는 것이
  DOM을 직접 수천 번 조작하는 것보다 훨씬 빠르다
→ 이것이 Virtual DOM 전략의 이론적 근거이다
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 JSX 코드를 직접 작성하고, 브라우저 DevTools의 Sources 탭에서 변환된 JavaScript를 확인할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: JSX → React.createElement 수동 변환 [Applying]

**목표:** JSX의 변환 과정을 손으로 직접 수행하여 내면화한다.

아래 JSX 코드를 `React.createElement` 호출로 변환하라. Automatic Transform(`_jsx`) 방식으로도 변환해 보라.

```jsx
function Card({ title, children }) {
  return (
    <article className="card">
      <header>
        <h2>{title}</h2>
      </header>
      <div className="card-body">{children}</div>
    </article>
  );
}

const app = (
  <Card title="학습 노트">
    <p>JSX는 함수 호출이다.</p>
    <p>React Element는 Plain Object이다.</p>
  </Card>
);
```

**작성할 것:**

- `Card` 컴포넌트의 return문을 `React.createElement`로 변환
- `app` 변수의 JSX를 `React.createElement`로 변환
- `app` 변수가 생성하는 React Element 객체의 형태를 JSON처럼 작성

---

### 실습 2: 렌더링 횟수 관찰과 분석 [Analyzing]

**목표:** "렌더링 = 함수 실행"을 직접 관찰하고 부모-자식 관계를 분석한다.

아래 코드를 실행하고 질문에 답하라.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  console.log("Parent 렌더링, count:", count);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <Child label="자식A" />
      <Child label="자식B" />
    </div>
  );
}

function Child({ label }) {
  console.log(`${label} 렌더링`);
  return <p>{label}</p>;
}
```

**질문:**

1. 최초 마운트 시 콘솔에 몇 개의 로그가 출력되는가?
2. 버튼을 한 번 클릭하면 어떤 로그가 출력되는가?
3. Child의 props(`label`)는 변하지 않았는데도 Child가 재렌더링되는 이유는?
4. `React.StrictMode`로 감싸져 있다면 출력이 어떻게 달라지는가?

---

### 실습 3: 순수 함수 위반 찾기와 수정 [Evaluating]

**목표:** 컴포넌트의 순수성을 판단하고 위반을 식별한다.

아래 컴포넌트에서 순수 함수 원칙을 위반한 부분을 **모두** 찾고, 각각 왜 문제인지 설명하라. 당장 올바르게 수정할 수 없는 것도 있다 — 그 경우 어떤 도구로 해결해야 하는지(useEffect 등) 힌트만 적어라.

```jsx
let globalCounter = 0;

function Dashboard({ user }) {
  globalCounter++;
  document.title = `${user.name}의 대시보드`;

  const now = new Date();
  const items = [];
  items.push({ id: 1, name: "항목1" });

  fetch(`/api/logs`, {
    method: "POST",
    body: JSON.stringify({ user: user.id, time: now }),
  });

  return (
    <div>
      <h1>{user.name}의 대시보드</h1>
      <p>렌더링 횟수: {globalCounter}</p>
      <p>현재 시각: {now.toLocaleTimeString()}</p>
    </div>
  );
}
```

**작성할 것:**

- 위반 사항 목록 (최소 4개 이상 찾을 수 있다)
- 각 위반이 왜 문제인지 한 문장 설명
- 올바른 해결 방향 힌트 (어떤 도구/패턴을 사용해야 하는지)

---

### 실습 4 (선택): Element 트리 시각화 [Analyzing]

**목표:** React Element 트리를 직접 그려본다.

아래 JSX가 생성하는 React Element 트리를 **트리 다이어그램**으로 그리고, 각 노드의 type과 주요 props를 표기하라.

```jsx
function App() {
  return (
    <main>
      <Header title="내 앱" />
      <section className="content">
        <ArticleList
          articles={[
            { id: 1, title: "첫 글" },
            { id: 2, title: "둘째 글" },
          ]}
        />
        <Sidebar>
          <RecentPosts />
          <Tags tags={["react", "javascript"]} />
        </Sidebar>
      </section>
      <Footer />
    </main>
  );
}
```

**작성 형식:**

```
{ type: 'main' }
  ├── { type: Header, props: { title: '내 앱' } }
  ├── { type: 'section', props: { className: 'content' } }
  │     ├── ...
  │     └── ...
  └── { type: Footer }
```

**추가 분석:** React가 이 트리를 처리할 때 함수를 호출해야 하는 노드와 그렇지 않은 노드를 구분하라.

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 4 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. JSX는 JavaScript의 문법 확장이다                          │
│     → HTML이 아니며, 브라우저가 직접 실행할 수 없다            │
│     → Babel/SWC가 React.createElement() 또는 jsx()로 변환     │
│     → React 17+에서는 import React 없이 자동 변환 (jsx-runtime)│
│                                                               │
│  2. React Element는 UI를 서술하는 가벼운 Plain Object이다      │
│     → DOM Element가 아니다 (수백 배 가볍다)                    │
│     → 불변(Immutable)이다                                     │
│     → type(태그명/함수), props(속성+children)으로 구성          │
│     → 이 객체들의 트리가 "Virtual DOM"이다                     │
│                                                               │
│  3. 컴포넌트는 React Element를 반환하는 함수이다               │
│     → 대문자(PascalCase)로 시작해야 컴포넌트로 인식됨          │
│     → React는 type이 함수인 Element를 만나면 해당 함수를 호출   │
│     → 모든 type이 문자열이 될 때까지 재귀적으로 처리            │
│                                                               │
│  4. 렌더링 = 함수 실행이다                                    │
│     → 매 렌더링마다 컴포넌트 함수 전체가 다시 호출됨            │
│     → 지역 변수, 핸들러, JSX 반환값 모두 새로 생성됨            │
│     → DOM 조작은 렌더링이 아니라 Commit Phase에서 발생          │
│                                                               │
│  5. 컴포넌트는 순수 함수여야 한다                              │
│     → 같은 입력(Props, State) → 같은 출력(Element)             │
│     → 렌더링 중 부수 효과 금지                                │
│     → 부수 효과는 이벤트 핸들러 또는 useEffect에서 처리         │
│                                                               │
│  6. UI = f(state) — React의 핵심 공식                         │
│     → 선언적 UI: "무엇을 보여줄지"만 기술                     │
│     → React가 현재 상태에 맞게 DOM을 자동 업데이트              │
│                                                               │
│  7. React Core와 ReactDOM은 분리되어 있다                     │
│     → React: Element 생성, Reconciliation (플랫폼 독립)        │
│     → ReactDOM: Element → 브라우저 DOM 변환 (브라우저 전용)     │
│     → createRoot로 Concurrent 모드 활성화 (React 18+)          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                        | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | JSX가 브라우저에서 직접 실행될 수 없는 이유는?                              | Remember   | 3.1         |
| 2   | `React.createElement('div', null, 'Hello')`가 반환하는 객체의 구조를 적어라 | Remember   | 3.3         |
| 3   | React 17 이후 `import React from 'react'`를 생략할 수 있는 이유는?          | Understand | 3.2         |
| 4   | `<div />`와 `<App />`이 만드는 React Element의 `type` 속성 차이는?          | Understand | 3.4         |
| 5   | React에서 "렌더링"의 정확한 정의는? (DOM 조작을 포함하는가?)                | Understand | 3.5         |
| 6   | `UI = f(state)`를 자신의 말로 설명하라                                      | Understand | 2.3         |
| 7   | 컴포넌트 함수에서 `document.title = '...'`을 하면 왜 문제인가?              | Analyze    | 3.6         |
| 8   | React Core와 ReactDOM이 분리된 이유를 2가지 이상 제시하라                   | Analyze    | 3.7         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. JSX 없이 React를 사용할 수 있나?**

가능하다. JSX는 `React.createElement()` 호출의 Syntactic Sugar이므로, `React.createElement`를 직접 호출하면 JSX 없이도 동일한 결과를 얻을 수 있다. 그러나 실무에서 JSX 없이 React를 사용하는 경우는 거의 없다. 중첩 구조가 깊어질수록 `createElement` 호출이 기하급수적으로 복잡해지기 때문이다.

**Q2. "렌더링이 자주 일어나면 성능이 나빠지는가?"**

렌더링(함수 호출) 자체는 가벼운 연산이다. React Element는 Plain Object이므로 수천 개를 생성해도 빠르다. 성능 문제는 렌더링 자체가 아니라, 렌더링 중 무거운 계산을 수행하거나, 변경되지 않은 DOM까지 불필요하게 업데이트할 때 발생한다. `useMemo`, `React.memo` 같은 최적화 도구는 Step 15에서 학습한다.

**Q3. class 컴포넌트와 함수 컴포넌트 중 무엇을 써야 하나?**

함수 컴포넌트를 사용해야 한다. React 공식 문서도 함수 컴포넌트를 기본으로 안내하며, Hooks(useState, useEffect 등)는 함수 컴포넌트에서만 사용할 수 있다. class 컴포넌트는 레거시 코드 유지보수 시에만 필요하며, 새 프로젝트에서는 사용하지 않는다.

**Q4. React와 ReactDOM을 왜 따로 설치하나?**

React Core는 플랫폼에 독립적인 컴포넌트 모델과 Reconciliation 알고리즘만 포함한다. ReactDOM은 브라우저 환경에 특화된 렌더러이다. 이 분리 덕분에 동일한 React Core 위에 react-native(모바일), react-three-fiber(3D), ink(터미널 UI) 등 다양한 렌더러를 올릴 수 있다.

**Q5. StrictMode는 프로덕션에서도 이중 실행을 하나?**

아니다. StrictMode의 이중 실행은 **개발 모드에서만** 동작한다. 프로덕션 빌드에서는 컴포넌트가 정상적으로 한 번만 실행된다. StrictMode는 순수성 위반, deprecated API 사용 등을 개발 단계에서 사전에 감지하기 위한 도구이다.

---

## 7. 다음 단계 예고

> **Step 5. Props와 단방향 데이터 흐름**
>
> - Props의 본질: 함수의 매개변수
> - Immutable 패턴이 필수인 이유
> - 단방향 데이터 흐름(One-Way Data Flow)의 설계 철학
> - 자식 → 부모 통신: 콜백 Props 패턴
> - State 끌어올리기(Lifting State Up)
> - children prop과 합성(Composition) 패턴
> - Props Drilling 문제와 해결 방향

---

## 📚 참고 자료

- [React 공식 문서 — Your First Component](https://react.dev/learn/your-first-component)
- [React 공식 문서 — Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx)
- [React 공식 문서 — JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces)
- [React 공식 문서 — Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [React 공식 문서 — Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree)
- [React 공식 블로그 — Introducing the New JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 4 of 42
