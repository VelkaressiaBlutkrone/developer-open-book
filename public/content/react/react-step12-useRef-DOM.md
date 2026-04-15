# Step 12. useRef와 DOM 접근 전략

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **Remember**   | useRef가 반환하는 객체의 구조와 특성을 기술할 수 있다                  |
| **Understand** | useRef와 useState의 근본적 차이(렌더링 트리거 여부)를 설명할 수 있다   |
| **Understand** | ref가 DOM 노드에 연결되는 타이밍(Commit Phase)을 설명할 수 있다        |
| **Apply**      | ref를 사용하여 DOM 노드에 직접 접근(포커스, 스크롤, 측정)할 수 있다    |
| **Analyze**    | forwardRef와 React 19의 ref Props 변경의 차이를 분석할 수 있다         |
| **Evaluate**   | useRef vs useState의 선택 기준을 적용하여 적합한 도구를 판단할 수 있다 |

**전제 지식:**

- Step 6: useState, 스냅샷 모델, Stale Closure
- Step 10: Fiber 노드, Render Phase / Commit Phase
- Step 11: useEffect, Cleanup, useLayoutEffect

---

## 1. 서론 — React의 "탈출구(Escape Hatch)"

### 1.1 선언적 패러다임과 그 한계가 드러나는 지점

React의 설계 철학은 **선언형(Declarative) UI**다. 개발자는 "어떻게 바꿀지"가 아니라 "무엇을 보여줄지"만 선언하고, React가 그 선언에 맞게 DOM을 관리한다. 이 철학 덕분에 복잡한 UI도 예측 가능하게 다룰 수 있고, 서버 사이드 렌더링이나 동시성 렌더링 같은 고급 기능이 가능해진다.

그러나 선언형 패러다임만으로는 해결할 수 없는 영역이 존재한다. 브라우저는 수십 년에 걸쳐 발전한 명령형(Imperative) API를 통해 DOM을 제어하도록 설계되어 있다. `element.focus()`, `element.scrollIntoView()`, `canvas.getContext('2d')` 같은 메서드들은 "이 요소에게 이것을 하라"는 명령형 호출이다. React의 선언적 세계만으로는 이런 명령형 API에 접근하기 어렵다.

또한 React가 관리하는 State 시스템 외부에 데이터를 저장해야 할 경우도 있다. 타이머 ID, 외부 라이브러리 인스턴스, 이전 렌더링의 값 등은 화면에 표시할 필요가 없으므로 굳이 State로 관리하여 불필요한 재렌더링을 유발할 필요가 없다.

useRef는 이 두 가지 요구를 모두 충족하는 도구다. React 공식 문서는 이를 **"Escape Hatch(탈출구)"**라고 부른다. 선언적 패러다임의 이점을 유지하면서, 필요한 순간에만 명령형 세계로 탈출할 수 있게 해준다.

### 1.2 useRef가 등장한 역사적 맥락

클래스 컴포넌트 시대에는 `createRef()`로 ref를 만들고, 인스턴스 변수로 값을 저장했다. 함수 컴포넌트는 호출될 때마다 새로운 실행 컨텍스트를 생성하므로, 렌더링 간에 값을 유지하는 인스턴스 변수 개념이 없었다. 초기 함수 컴포넌트는 단순한 "프레젠테이션 컴포넌트"로만 사용되었고, 복잡한 로직은 클래스 컴포넌트의 역할로 여겨졌다.

React Hooks의 도입으로 함수 컴포넌트가 완전한 주류가 되었다. useRef는 Fiber 아키텍처가 렌더링 간에 컴포넌트의 내부 데이터를 유지하는 메커니즘을 활용하여, 함수 컴포넌트에서도 "렌더링에 영향 없이 값을 유지"하는 기능을 제공한다. useState와 구조는 같지만, 변경을 추적하지 않는다는 핵심 차이가 있다.

### 1.3 useRef의 두 가지 역할과 산업적 중요성

```
useRef의 두 가지 역할

  1. DOM 노드에 대한 참조 (ref 속성)
     · <input ref={inputRef} /> → inputRef.current = DOM 노드
     · 포커스, 스크롤, 측정 등에 활용

  2. 렌더링에 영향을 주지 않는 변경 가능한 값 저장
     · 타이머 ID, 이전 값, 인스턴스 변수 등
     · 값이 변해도 재렌더링을 트리거하지 않는다
```

산업 현장에서 useRef를 정확히 이해하지 못하면 두 가지 문제가 발생한다. 첫째, 타이머 ID나 외부 라이브러리 인스턴스를 State로 저장하여 불필요한 재렌더링과 성능 저하를 만든다. 둘째, Stale Closure 문제(값이 오래된 클로저에 갇히는 현상)를 만나도 해결 수단을 알지 못해 버그를 방치한다. useRef는 이 두 문제 모두에 대한 핵심 해결책이다.

### 1.4 이 Step의 학습 지도 (개념 지도)

![useRef 개념 지도](/developer-open-book/diagrams/react-step12-concept-map.svg)

### 1.5 이 Step에서 다루는 범위

![Step 12 다루는 범위](/developer-open-book/diagrams/react-step12-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                    | 정의                                                                                                               | 왜 중요한가                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| **useRef**              | `{ current: initialValue }` 객체를 반환하는 Hook. **렌더링 간에 유지되지만 변경해도 재렌더링을 트리거하지 않는다** | DOM 접근과 렌더링 무관 값 저장의 기본 도구이다         |
| **ref 속성**            | JSX 요소에 `ref={myRef}`를 전달하면 React가 Commit Phase에서 해당 DOM 노드를 `myRef.current`에 할당하는 메커니즘   | DOM 노드를 JavaScript에서 참조하는 공식 통로이다       |
| **forwardRef**          | 부모로부터 받은 ref를 자식 컴포넌트 내부의 DOM 노드로 **전달(forward)** 하는 API                                   | 컴포넌트 추상화를 유지하면서 내부 DOM 접근을 허용한다  |
| **useImperativeHandle** | forwardRef와 함께 사용하여 부모에게 **노출할 메서드를 제한**하는 Hook                                              | DOM 전체가 아닌 특정 기능만 공개하여 캡슐화를 유지한다 |
| **ref 콜백**            | `ref={node => ...}` 형태로 DOM 노드가 연결/해제될 때 **콜백 함수가 호출**되는 패턴                                 | 동적 리스트의 DOM 노드 관리에 유용하다                 |
| **Escape Hatch**        | React의 선언적 패러다임을 벗어나 **명령적으로 동작**할 수 있게 하는 도구. useRef, useEffect 등                     | 필요할 때 사용하되 남용하면 React의 이점을 잃는다      |
| **Mutable Reference**   | `ref.current`를 자유롭게 변경할 수 있다는 특성. State와 달리 **변경이 추적되지 않는다**                            | 렌더링 사이클 밖에서 값을 관리할 수 있다               |

### 2.2 용어 간 관계 다이어그램

![useRef 구성 요소 관계](/developer-open-book/diagrams/react-step12-component-relations.svg)

### 2.3 useRef vs useState 개념 비교

![useState vs useRef 비교](/developer-open-book/diagrams/react-step12-useState-vs-useRef.svg)

### 2.4 "렌더링에 참여하지 않는 값"이 왜 필요한가

React의 State 시스템은 UI와 데이터의 일관성을 보장하는 훌륭한 메커니즘이지만, 모든 값이 UI와 연결될 필요는 없다. 타이머 ID는 `clearInterval()`을 호출하기 위해 보관하는 것이지 화면에 표시하기 위한 것이 아니다. setInterval이 반환하는 숫자 ID를 State로 저장하면, ID가 설정될 때마다 불필요한 재렌더링이 발생한다.

함수형 프로그래밍 관점에서 보면, 렌더링에 참여하지 않는 값은 "사이드 채널(side channel)"이다. 렌더링이라는 주 흐름과 분리되어 값을 보관하고 전달하는 별도의 통로다. useRef는 React가 제공하는 공식 사이드 채널이다. 이 사이드 채널을 통해 렌더링 사이클의 영향 없이 값을 읽고 쓸 수 있다.

---

## 3. 이론과 원리

### 3.1 useRef의 본질

#### 반환값: `{ current: value }` 객체

```jsx
function MyComponent() {
  const myRef = useRef(42);

  console.log(myRef); // { current: 42 }
  console.log(myRef.current); // 42

  myRef.current = 100; // 직접 변경 가능!
  console.log(myRef.current); // 100 — 하지만 재렌더링 안 됨!

  return <p>화면에 표시되는 값은 State로 관리</p>;
}
```

#### useRef는 "렌더링에 참여하지 않는 useState"

```
useRef의 멘탈 모델

  useRef(initialValue) 는 내부적으로 다음과 비슷하다:

  function useRef(initialValue) {
    // useState처럼 렌더링 간에 값을 유지하지만
    // setter가 없으므로 재렌더링을 트리거하지 않는다
    const [ref] = useState({ current: initialValue });
    return ref;
  }

  · 같은 { current: ... } 객체가 매 렌더링마다 반환된다 (참조 동일)
  · current를 변경해도 React는 알지 못한다 (추적하지 않음)
  · 렌더링 사이클과 완전히 독립적인 "사이드 채널"이다
```

#### Fiber 노드에서의 useRef 저장 위치

```
Step 10에서 배운 Fiber 노드의 Hook 연결 리스트

  Counter Fiber 노드:
  {
    memoizedState: {
      // Hook #1: useState(0)
      memoizedState: 0,
      queue: { ... },
      next: {
        // Hook #2: useRef(null)
        memoizedState: { current: null },    // ← ref 객체
        queue: null,                          // ← 업데이트 큐 없음!
        next: null
      }
    }
  }

  · useState: memoizedState에 값 + queue에 업데이트 대기열
  · useRef: memoizedState에 { current } 객체만, queue 없음
  · queue가 없다 = 업데이트를 추적하지 않는다 = 재렌더링 안 됨
```

### 3.2 useRef vs useState — 상세 비교

#### 동작 차이 시각화

```jsx
function Comparison() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  const handleStateClick = () => {
    setStateCount(stateCount + 1);
    // → 재렌더링 발생 → 화면이 업데이트됨
  };

  const handleRefClick = () => {
    refCount.current += 1;
    console.log("ref:", refCount.current); // 값은 증가하지만...
    // → 재렌더링 안 됨 → 화면은 그대로!
  };

  console.log("렌더링 발생");

  return (
    <div>
      <p>State: {stateCount}</p> {/* 클릭 시 업데이트됨 */}
      <p>Ref: {refCount.current}</p> {/* 클릭해도 화면 그대로! */}
      <button onClick={handleStateClick}>State +1</button>
      <button onClick={handleRefClick}>Ref +1</button>
    </div>
  );
}
```

```
버튼 클릭 흐름 비교

  State +1 클릭:
    setStateCount(1) → 재렌더링 트리거 → 함수 재호출
    → stateCount = 1 → <p>State: 1</p> → 화면 업데이트 ✅

  Ref +1 클릭:
    refCount.current = 1 → 재렌더링 없음 → 함수 재호출 없음
    → 콘솔에 "ref: 1" 출력 → 화면은 "Ref: 0" 그대로 ❌
    → 다른 이유로 재렌더링되면 그때 "Ref: 1" 표시

  핵심: ref.current를 JSX에 직접 표시하면 안 된다!
        화면에 표시해야 하는 값은 반드시 State를 사용한다
```

#### 선택 기준

```
"이 값을 useRef로 저장할까, useState로 저장할까?"

  ┌─ 이 값이 변할 때 화면이 업데이트되어야 하는가?
  │    YES → useState
  │    NO  → useRef
  │
  ├─ 이 값을 JSX에서 표시하는가?
  │    YES → useState
  │    NO  → useRef
  │
  ├─ DOM 노드를 참조하는가?
  │    YES → useRef
  │
  └─ 렌더링 간에 값을 유지하되 재렌더링 없이 변경하고 싶은가?
       YES → useRef
```

```
useRef가 적합한 값들

  · DOM 노드 참조:     const inputRef = useRef(null)
  · 타이머 ID:         const timerRef = useRef(null)
  · 이전 렌더링 값:     const prevValueRef = useRef(value)
  · 외부 라이브러리 인스턴스: const chartRef = useRef(null)
  · 마운트 여부 추적:   const isMountedRef = useRef(false)
  · 콜백의 최신 참조:   const callbackRef = useRef(callback)
  · 렌더링 횟수 카운트 (디버깅): const renderCount = useRef(0)
```

### 3.3 ref로 DOM 노드에 접근하기

#### 기본 패턴

```jsx
function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Commit Phase 이후이므로 inputRef.current에 DOM 노드가 할당되어 있다
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} placeholder="자동 포커스" />;
}
```

```
ref가 DOM에 연결되는 타이밍

  Render Phase:
    · 컴포넌트 함수 호출
    · <input ref={inputRef} /> → React Element 생성
    · 이 시점에서 inputRef.current는 아직 null!

  Commit Phase:
    · React가 실제 DOM 노드를 생성/업데이트
    · <input> DOM 노드를 inputRef.current에 할당 ★
    · useLayoutEffect 실행 (이때 ref.current 사용 가능)

  Post-Commit:
    · 브라우저 Paint
    · useEffect 실행 (이때도 ref.current 사용 가능)

  언마운트 시:
    · inputRef.current = null 로 초기화
```

> 렌더링 중에 ref.current를 읽지 않는다. Render Phase에서는 ref가 아직 연결되지 않았거나, 이전 값을 가리킬 수 있다. ref.current는 **useEffect, useLayoutEffect, 이벤트 핸들러** 안에서 읽는다.

#### 실전 DOM 접근 패턴

**포커스 관리:**

```jsx
function SearchBar() {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      inputRef.current.blur(); // 포커스 해제
    }
  };

  return (
    <div>
      <input ref={inputRef} onKeyDown={handleKeyDown} placeholder="검색..." />
      <button onClick={() => inputRef.current.focus()}>검색창 포커스</button>
    </div>
  );
}
```

**스크롤 제어:**

```jsx
function ChatMessages({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    // 새 메시지가 추가될 때마다 맨 아래로 스크롤
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          <strong>{msg.author}:</strong> {msg.text}
        </div>
      ))}
      <div ref={bottomRef} /> {/* 스크롤 앵커 */}
    </div>
  );
}
```

**DOM 측정:**

```jsx
function MeasuredBox({ children }) {
  const boxRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    // Paint 전에 측정하여 깜빡임 방지
    const rect = boxRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
  }, [children]);

  return (
    <div>
      <div ref={boxRef}>{children}</div>
      <p>
        크기: {dimensions.width} × {dimensions.height}px
      </p>
    </div>
  );
}
```

**비디오/오디오 제어:**

```jsx
function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={togglePlay}>{isPlaying ? "일시정지" : "재생"}</button>
    </div>
  );
}
```

### 3.4 forwardRef — 자식 컴포넌트의 DOM에 접근하기

#### 문제: 커스텀 컴포넌트에 ref를 전달할 수 없다

```jsx
// 부모가 자식의 input에 포커스를 주고 싶다
function Parent() {
  const inputRef = useRef(null);

  return (
    <div>
      <MyInput ref={inputRef} /> {/* ❌ 경고 발생! */}
      <button onClick={() => inputRef.current.focus()}>포커스</button>
    </div>
  );
}

function MyInput(props) {
  return <input {...props} className="my-input" />;
}

// React 경고:
// "Function components cannot be given refs.
//  Attempts to access this ref will fail."
```

**왜 안 되는가:**

```
ref는 일반 Props가 아니다 (React 18 이전)

  · React는 ref를 특수하게 처리한다
  · 함수 컴포넌트에 ref를 전달하면 컴포넌트 내부에서 접근할 수 없다
  · ref가 컴포넌트의 "어떤 DOM 노드"를 가리켜야 하는지 React가 모른다
  · 컴포넌트는 여러 DOM 노드를 반환할 수 있으므로 명시적 지정이 필요
```

#### 해결: forwardRef (React 18 이전)

```jsx
import { forwardRef, useRef } from "react";

// forwardRef로 감싸면 두 번째 인자로 ref를 받을 수 있다
const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} className="my-input" />;
  //                       ↑ 전달받은 ref를 내부 DOM에 연결
});

function Parent() {
  const inputRef = useRef(null);

  return (
    <div>
      <MyInput ref={inputRef} /> {/* ✅ 이제 동작 */}
      <button onClick={() => inputRef.current.focus()}>포커스</button>
    </div>
  );
}
```

#### React 19: ref를 일반 Props로 전달

```jsx
// React 19에서는 forwardRef 없이 ref를 Props로 받을 수 있다

function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} className="my-input" />;
  //            ↑ 일반 Props처럼 Destructuring
}

function Parent() {
  const inputRef = useRef(null);

  return (
    <div>
      <MyInput ref={inputRef} /> {/* ✅ forwardRef 없이 동작 */}
      <button onClick={() => inputRef.current.focus()}>포커스</button>
    </div>
  );
}
```

```
React 18 vs React 19 비교

  React 18:
    const MyInput = forwardRef(function MyInput(props, ref) {
      return <input ref={ref} {...props} />;
    });

  React 19:
    function MyInput({ ref, ...props }) {
      return <input ref={ref} {...props} />;
    }

  변경 이유:
    · forwardRef는 불필요한 래퍼였다
    · ref를 특수하게 취급할 기술적 필요성이 사라짐
    · 코드가 더 단순해진다
    · forwardRef는 deprecated 예정 (당분간 호환 유지)
```

### 3.5 useImperativeHandle — 노출 API 제한

#### 문제: 부모에게 DOM 전체를 노출하면 위험하다

```
<MyInput ref={inputRef} />

inputRef.current가 DOM 노드 전체를 가리키면:
  · 부모가 inputRef.current.style.display = 'none' 할 수 있다
  · 부모가 inputRef.current.remove() 할 수 있다
  · React가 관리하는 DOM을 직접 변경 → 불일치 발생!

원칙: 부모에게 "필요한 기능만" 노출한다
```

#### useImperativeHandle로 해결

```jsx
import { forwardRef, useRef, useImperativeHandle } from "react";

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  // 부모에게 노출할 메서드를 직접 정의
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current.focus(),
      clear: () => {
        inputRef.current.value = "";
      },
      getValue: () => inputRef.current.value,
      // DOM 노드 자체는 노출하지 않는다!
    }),
    [],
  );

  return <input ref={inputRef} {...props} className="fancy-input" />;
});

function Parent() {
  const fancyRef = useRef(null);

  const handleClick = () => {
    fancyRef.current.focus(); // ✅ 허용된 API
    fancyRef.current.clear(); // ✅ 허용된 API
    console.log(fancyRef.current.getValue()); // ✅ 허용된 API

    fancyRef.current.style.color = "red"; // ❌ undefined — DOM 접근 차단!
    fancyRef.current.remove(); // ❌ undefined — DOM 접근 차단!
  };

  return (
    <div>
      <FancyInput ref={fancyRef} placeholder="입력..." />
      <button onClick={handleClick}>제어</button>
    </div>
  );
}
```

```
useImperativeHandle의 역할

  일반 ref:
    부모 → ref.current = <input> DOM 노드 (전체 접근)

  useImperativeHandle:
    부모 → ref.current = { focus(), clear(), getValue() } (제한된 API)

  · 캡슐화(Encapsulation) 유지
  · 부모가 자식의 내부 구현에 의존하지 않음
  · 자식의 DOM 구조가 바뀌어도 부모 코드는 변경 불필요
```

### 3.6 ref 콜백 패턴

#### 기본 사용법

ref에 **객체 대신 함수**를 전달하면, DOM 노드가 연결/해제될 때 React가 그 함수를 호출한다.

```jsx
function CallbackRefExample() {
  const [height, setHeight] = useState(0);

  // ref 콜백: DOM 노드가 연결될 때 호출됨
  const measureRef = (node) => {
    if (node !== null) {
      // 노드가 연결될 때 (마운트)
      setHeight(node.getBoundingClientRect().height);
    }
    // node가 null이면 해제될 때 (언마운트)
  };

  return (
    <div>
      <div ref={measureRef}>
        <p>이 영역의 높이를 측정합니다</p>
        <p>콘텐츠가 많아지면 높이도 변합니다</p>
      </div>
      <p>측정된 높이: {height}px</p>
    </div>
  );
}
```

#### ref 콜백이 유용한 시나리오: 동적 리스트

```jsx
function ScrollToItemList({ items, highlightId }) {
  // 여러 DOM 노드를 Map으로 관리
  const itemRefs = useRef(new Map());

  const scrollToItem = (id) => {
    const node = itemRefs.current.get(id);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    if (highlightId) {
      scrollToItem(highlightId);
    }
  }, [highlightId]);

  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          ref={(node) => {
            if (node) {
              itemRefs.current.set(item.id, node);
            } else {
              itemRefs.current.delete(item.id);
            }
          }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

```
ref 콜백 vs useRef 객체

  useRef 객체: { current: node }
    · 하나의 DOM 노드를 참조
    · 대부분의 경우에 사용

  ref 콜백: (node) => { ... }
    · 노드 연결/해제 시 로직 실행 가능
    · 여러 노드를 동적으로 관리 가능
    · DOM 측정, 외부 라이브러리 연동에 유용

  주의: 인라인 함수로 ref 콜백을 전달하면
     매 렌더링마다 새 함수 → 매번 null → 새 노드 호출됨
     useCallback으로 안정화하거나 함수를 외부로 분리
```

### 3.7 Stale Closure 해결에서의 useRef 활용

Step 6에서 배운 Stale Closure 문제를 useRef로 해결하는 패턴이다.

#### 문제: setTimeout에서 최신 State를 읽고 싶다

```jsx
// ❌ Stale Closure — 클릭 시점의 count를 캡처
function StaleExample() {
  const [count, setCount] = useState(0);

  const handleDelayedLog = () => {
    setTimeout(() => {
      alert(`count: ${count}`); // 항상 클릭 시점의 값!
    }, 3000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={handleDelayedLog}>3초 후 alert</button>
    </div>
  );
}
```

#### 해결: useRef로 최신 값을 항상 참조

```jsx
// ✅ useRef로 최신 값 유지
function FreshExample() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 매 렌더링마다 ref를 최신 값으로 동기화
  countRef.current = count;

  const handleDelayedLog = () => {
    setTimeout(() => {
      alert(`count: ${countRef.current}`); // 항상 최신 값!
    }, 3000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={handleDelayedLog}>3초 후 alert</button>
    </div>
  );
}
```

```
왜 useRef가 Stale Closure를 해결하는가?

  State (스냅샷):
    · 각 렌더링마다 count 값이 "고정"된다
    · setTimeout 콜백은 생성 시점의 count를 클로저로 캡처
    · 3초 후 실행될 때 "과거의 count"를 참조

  Ref (항상 최신):
    · countRef는 모든 렌더링에서 같은 객체
    · countRef.current를 매 렌더링마다 최신 값으로 업데이트
    · setTimeout 콜백이 countRef를 참조 → .current는 항상 최신
    · 3초 후 실행될 때 "현재의 count"를 참조

  원리: 클로저가 캡처하는 것은 countRef "객체"이며,
        이 객체의 .current 속성은 매 렌더링마다 갱신된다.
        객체 참조는 변하지 않으므로 클로저에 "가둬지지" 않는다.
```

#### 커스텀 Hook으로 패턴 추출

```jsx
// useLatest: 항상 최신 값을 유지하는 ref를 반환
function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// 사용
function MyComponent() {
  const [count, setCount] = useState(0);
  const latestCount = useLatest(count);

  useEffect(() => {
    const id = setInterval(() => {
      console.log("최신 count:", latestCount.current);
    }, 1000);
    return () => clearInterval(id);
  }, []); // 빈 배열이지만 항상 최신 값 참조 가능

  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### 3.8 useRef 사용 시 주의사항

```
ref.current를 렌더링 중에 읽거나 쓰지 않는다

  // ❌ 렌더링 중 ref 읽기 — 일관성 보장 없음
  function Bad() {
    const ref = useRef(0);
    ref.current++;  // 렌더링 중 변경 — StrictMode에서 2번 증가!
    return <p>{ref.current}</p>;  // 렌더링 중 읽기 — 어떤 값일지 예측 어려움
  }

  // ✅ 이벤트 핸들러 또는 Effect에서만 읽고 쓴다
  function Good() {
    const ref = useRef(0);

    useEffect(() => {
      ref.current++;  // Effect에서 변경 — OK
      console.log(ref.current);  // Effect에서 읽기 — OK
    });

    const handleClick = () => {
      ref.current++;  // 이벤트 핸들러에서 변경 — OK
    };

    return <button onClick={handleClick}>클릭</button>;
  }

예외: 초기화 시점에 한 번만 쓰는 것은 허용
  function LazyInit() {
    const ref = useRef(null);
    if (ref.current === null) {
      ref.current = createExpensiveInstance();  // 최초 한 번만 실행
    }
    return <canvas ref={ref} />;
  }
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 이전 값(Previous Value) 추적

```jsx
// 이전 렌더링의 Props/State 값을 기억하는 패턴
function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value; // Effect에서 갱신 → "이전" 렌더링의 값
  }, [value]);

  return ref.current; // 현재 렌더링에서는 아직 "이전" 값
}

function PriceTracker({ price }) {
  const prevPrice = usePrevious(price);

  const trend =
    prevPrice !== undefined
      ? price > prevPrice
        ? "상승"
        : price < prevPrice
          ? "하락"
          : "유지"
      : "";

  return (
    <p>
      현재: {price}원 {trend}
      {prevPrice !== undefined && <span> (이전: {prevPrice}원)</span>}
    </p>
  );
}
```

```
usePrevious 동작 원리

  렌더링 #1: price=1000
    · ref.current = undefined (초기값)
    · usePrevious 반환: undefined
    · Effect 실행: ref.current = 1000

  렌더링 #2: price=1200
    · ref.current = 1000 (이전 Effect에서 설정)
    · usePrevious 반환: 1000 ← 이전 값!
    · Effect 실행: ref.current = 1200

  렌더링 #3: price=1100
    · ref.current = 1200
    · usePrevious 반환: 1200 ← 이전 값!
    · Effect 실행: ref.current = 1100

  핵심: useEffect는 렌더링 "후"에 실행되므로
        현재 렌더링에서 ref.current는 아직 "이전" 값이다
```

### 4.2 사례: 외부 라이브러리(지도, 차트) 통합

```jsx
function MapComponent({ center, zoom }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 마운트 시 지도 인스턴스 생성
  useEffect(() => {
    mapInstanceRef.current = new ExternalMapLibrary({
      container: mapContainerRef.current,
      center,
      zoom,
    });

    return () => {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    };
  }, []);

  // center/zoom 변경 시 지도 업데이트
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "400px" }} />
  );
}
```

```
ref 사용 패턴 분석

  mapContainerRef: DOM 노드 참조 (용도 1)
    → <div> DOM 노드를 외부 라이브러리에 전달

  mapInstanceRef: 렌더링 무관 값 저장 (용도 2)
    → 외부 라이브러리 인스턴스를 보관
    → 인스턴스가 바뀌어도 재렌더링 불필요
    → 여러 Effect에서 공유 접근 가능
```

### 4.3 사례: 타이머 ID 관리

```jsx
function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null); // 타이머 ID 저장 — 재렌더링 불필요

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>{time}초</p>
      <button onClick={start} disabled={isRunning}>
        시작
      </button>
      <button onClick={stop} disabled={!isRunning}>
        정지
      </button>
      <button onClick={reset}>초기화</button>
    </div>
  );
}
```

```
타이머 ID를 useRef에 저장하는 이유

  useState로 저장하면:
    · setIntervalId(id) → 재렌더링 발생 (불필요!)
    · 타이머 ID는 화면에 표시하지 않는다
    · 재렌더링이 아닌 "정리(clearInterval)"에만 필요

  useRef로 저장하면:
    · intervalRef.current = id → 재렌더링 없음 ✅
    · stop()에서 clearInterval(intervalRef.current) → 올바르게 정리
    · 성능상 이점 (불필요한 재렌더링 방지)
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: DOM 접근 패턴 구현 [Applying]

**목표:** ref를 사용하여 다양한 DOM 접근 패턴을 구현한다.

**이미지 갤러리**를 만든다:

```
요구사항:
  · 이미지 목록 표시 (가로 스크롤)
  · "이전" / "다음" 버튼으로 특정 이미지로 스크롤
  · 현재 선택된 이미지의 크기(width, height) 표시
  · "첫 번째로" 버튼으로 맨 앞으로 스크롤
  · ref 콜백 패턴으로 여러 이미지 DOM 노드 관리

힌트:
  · scrollIntoView({ behavior: 'smooth', inline: 'center' })
  · getBoundingClientRect()로 크기 측정
  · Map을 useRef에 저장하여 여러 노드 관리
```

---

### 실습 2: useRef vs useState 판별 연습 [Analyzing · Evaluating]

**목표:** 상황에 따라 useRef와 useState 중 적합한 것을 선택한다.

아래 각 시나리오에서 useRef와 useState 중 어떤 것을 사용해야 하는지 판단하고 근거를 제시하라.

```
시나리오 1: 사용자가 입력한 검색어 (input과 연동하여 화면에 표시)
시나리오 2: setInterval의 반환 ID
시나리오 3: 폼의 제출 횟수 카운터 (화면에 표시)
시나리오 4: 외부 차트 라이브러리의 인스턴스
시나리오 5: 이전 렌더링의 Props 값
시나리오 6: 모달의 열림/닫힘 상태 (조건부 렌더링에 사용)
시나리오 7: WebSocket 연결 객체
시나리오 8: "마지막으로 클릭한 시각" (화면에 표시하지 않고 디버깅용)
시나리오 9: 드래그 앤 드롭의 시작 좌표
시나리오 10: 현재 로딩 중인지 여부 (스피너 표시에 사용)
```

---

### 실습 3: forwardRef + useImperativeHandle 구현 [Applying]

**목표:** 부모에게 제한된 API만 노출하는 컴포넌트를 만든다.

**커스텀 텍스트 에디터** 컴포넌트를 만든다:

```
요구사항:
  · CustomEditor 컴포넌트: textarea를 내부에 포함
  · 부모에게 노출할 API:
    - focus(): textarea에 포커스
    - clear(): 내용 비우기
    - insertText(text): 현재 커서 위치에 텍스트 삽입
    - getContent(): 현재 내용 반환
  · 부모에서 textarea DOM에 직접 접근은 불가능해야 함
  · React 18(forwardRef)과 React 19(ref Props) 두 가지 버전으로 작성
```

---

### 실습 4 (선택): Stale Closure 해결 실전 [Analyzing]

**목표:** useRef로 Stale Closure를 해결하는 패턴을 실전에 적용한다.

아래 코드에서 Stale Closure 버그를 찾고 useRef로 수정하라.

```jsx
function NotificationManager() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("wss://example.com/notifications");

    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);

      // notifications는 마운트 시점의 빈 배열을 캡처!
      if (notifications.length >= 50) {
        // 오래된 알림 제거 의도이지만 동작하지 않음
        setNotifications([...notifications.slice(1), newNotification]);
      } else {
        setNotifications([...notifications, newNotification]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <ul>
      {notifications.map((n, i) => (
        <li key={i}>{n.message}</li>
      ))}
    </ul>
  );
}
```

**힌트:** 두 가지 해결 방법을 모두 시도하라.

- Updater Function 패턴 (Step 6)
- useRef 패턴 (이 Step)

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 12 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. useRef = { current: value } 객체를 반환하는 Hook          │
│     → 렌더링 간에 값이 유지된다 (useState와 동일)             │
│     → 값을 변경해도 재렌더링을 트리거하지 않는다 (useState와 다름)│
│     → current를 직접 변경할 수 있다 (Mutable)                 │
│                                                               │
│  2. useRef의 두 가지 용도                                    │
│     → DOM 노드 참조: <input ref={myRef} />                   │
│     → 렌더링 무관 값 저장: 타이머 ID, 이전 값, 외부 인스턴스  │
│                                                               │
│  3. ref는 Commit Phase에서 DOM에 연결된다                     │
│     → Render Phase(함수 본문)에서는 아직 연결되지 않음         │
│     → useEffect, useLayoutEffect, 이벤트 핸들러에서 사용      │
│     → 렌더링 중에 ref.current를 읽거나 쓰지 않는다            │
│                                                               │
│  4. forwardRef → React 19에서 ref Props로 대체               │
│     → React 18: forwardRef(function(props, ref) {...})        │
│     → React 19: function({ ref, ...props }) {...}             │
│                                                               │
│  5. useImperativeHandle로 노출 API를 제한한다                 │
│     → DOM 전체 대신 { focus, clear, getValue } 같은 인터페이스│
│     → 캡슐화를 유지하고 내부 구현 변경에 유연하다             │
│                                                               │
│  6. Stale Closure를 useRef로 해결한다                        │
│     → ref.current를 매 렌더링마다 최신 값으로 동기화          │
│     → setTimeout, setInterval 콜백에서 항상 최신 값 참조      │
│     → Updater Function과 함께 Stale Closure의 2대 해결책      │
│                                                               │
│  7. useRef vs useState 선택 기준                             │
│     → 화면에 표시되는가? → useState                          │
│     → 화면에 표시되지 않는가? → useRef                       │
│     → DOM 참조인가? → useRef                                 │
│                                                               │
│  8. ref 콜백 패턴으로 동적 DOM 노드를 관리할 수 있다          │
│     → ref={(node) => { ... }}                                │
│     → 리스트의 여러 노드를 Map으로 관리                      │
│     → 노드 연결/해제 시점에 로직 실행 가능                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                              | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | useRef가 반환하는 객체의 구조와 특성을 설명하라                                   | Remember   | 3.1         |
| 2   | useRef와 useState의 핵심 차이를 "재렌더링" 관점에서 설명하라                      | Understand | 3.2         |
| 3   | ref가 DOM 노드에 연결되는 정확한 시점은? (Render/Commit/Post-Commit)              | Understand | 3.3         |
| 4   | `ref.current`를 렌더링 중(함수 본문)에 읽으면 안 되는 이유는?                     | Understand | 3.8         |
| 5   | React 19에서 forwardRef가 불필요해진 변경사항을 설명하라                          | Apply      | 3.4         |
| 6   | useImperativeHandle이 DOM 전체 노출 대신 "제한된 API"를 제공하는 이유는?          | Analyze    | 3.5         |
| 7   | useRef가 Stale Closure를 해결하는 원리를 "객체 참조"와 "클로저" 관점에서 설명하라 | Analyze    | 3.7         |
| 8   | 타이머 ID를 useState 대신 useRef에 저장하는 것이 적합한 이유는?                   | Evaluate   | 4.3         |

### 6.3 FAQ

**Q1. ref를 사용하면 React의 선언적 원칙을 위반하는 건가요?**

ref는 React 공식 문서에서 "Escape Hatch(탈출구)"로 명시한 도구입니다. 적절히 사용하면 선언적 원칙을 보완하는 것이지 위반이 아닙니다. 문제는 남용할 때 생깁니다. ref로 DOM을 직접 조작하여 React가 관리하는 상태와 불일치를 만들거나, State로 관리해야 할 값을 ref로 저장하여 UI 업데이트를 막는 경우가 남용입니다. "DOM 접근이나 렌더링 무관 값 저장"이라는 명확한 목적이 있을 때만 사용하는 것이 원칙입니다.

**Q2. useRef로 만든 값이 컴포넌트 인스턴스마다 독립적인가요?**

네. useRef는 useState와 마찬가지로 컴포넌트 인스턴스마다 독립적인 저장소를 가집니다. 같은 컴포넌트를 여러 번 렌더링하면, 각 인스턴스가 각자의 `{ current }` 객체를 갖습니다. 이는 모듈 스코프의 변수(`let count = 0`)와 다릅니다. 모듈 변수는 모든 인스턴스가 공유하지만, useRef의 값은 인스턴스별로 격리됩니다.

**Q3. ref 콜백에서 매 렌더링마다 함수가 새로 생성된다는 문제, 실제로 큰 이슈인가요?**

리스트가 크지 않으면 큰 문제는 아닙니다. 그러나 리스트가 크거나 성능이 중요한 경우에는 `useCallback`으로 ref 콜백을 안정화하거나, 컴포넌트 외부로 함수를 분리하는 것이 좋습니다. React 19부터는 ref 정리 함수(Cleanup for refs)가 도입되어 언마운트 시 명시적 정리가 가능해졌습니다.

**Q4. `ref.current = value`를 렌더링 중에 쓰면 왜 StrictMode에서 문제가 생기나요?**

StrictMode에서는 컴포넌트 함수를 두 번 호출합니다. 렌더링 중에 `ref.current++`를 실행하면 두 번 증가합니다. State와 달리 ref 변경은 추적되지 않으므로 React가 이를 감지하고 되돌릴 방법이 없습니다. 또한 렌더링 중 ref 읽기는 Concurrent Mode에서 동일한 렌더링이 여러 번 실행될 수 있으므로 일관성을 보장할 수 없습니다. 렌더링은 순수해야 한다는 원칙을 지키는 것이 최선입니다.

**Q5. useImperativeHandle의 세 번째 인자(의존성 배열)는 언제 채워야 하나요?**

기본적으로 빈 배열 `[]`이면 마운트 시에만 한 번 API 객체를 생성합니다. 만약 노출하는 메서드가 Props나 State에 의존한다면 해당 값을 의존성 배열에 넣어야 합니다. 예를 들어 `getValue`가 특정 Props를 참조한다면 그 Props를 배열에 넣어 변경 시 API 객체를 재생성해야 합니다. 의존성을 빠뜨리면 Stale Closure 문제가 발생할 수 있습니다.

---

## 7. 다음 단계 예고

> **Step 13. useReducer와 상태 머신 설계**
>
> - useReducer의 구조: dispatch → reducer → 새 State
> - useState와 useReducer의 선택 기준
> - Reducer 패턴: 상태 전이를 명시적으로 정의
> - 유한 상태 머신(FSM) 개념 소개
> - 복합 상태 관리: 여러 관련 값을 하나의 reducer로 통합

---

## 📚 참고 자료

- [React 공식 문서 — Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
- [React 공식 문서 — Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [React 공식 문서 — useRef Reference](https://react.dev/reference/react/useRef)
- [React 공식 문서 — forwardRef Reference](https://react.dev/reference/react/forwardRef)
- [React 공식 문서 — useImperativeHandle Reference](https://react.dev/reference/react/useImperativeHandle)
- [React 공식 블로그 — React 19 (ref as a prop)](https://react.dev/blog/2024/12/05/react-19)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 12 of 42
