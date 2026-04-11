# Step 05. Props와 단방향 데이터 흐름

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟢 초급 (Beginner)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| **Remember**   | Props, Immutability, One-Way Data Flow, Composition의 정의를 기술할 수 있다 |
| **Understand** | Props가 하나의 객체로 전달되는 내부 메커니즘을 설명할 수 있다               |
| **Understand** | 단방향 데이터 흐름이 양방향과 비교하여 어떤 이점을 가지는지 설명할 수 있다  |
| **Apply**      | 콜백 Props 패턴으로 자식 → 부모 통신을 구현할 수 있다                       |
| **Analyze**    | Props Drilling 상황을 식별하고 합성 패턴으로 구조를 개선할 수 있다          |
| **Evaluate**   | State를 어떤 컴포넌트에 배치할지 판단 기준을 적용할 수 있다                 |

**전제 지식:**

- Step 2: Destructuring, Spread/Rest 연산자
- Step 4: JSX, React Element, 함수 컴포넌트, "렌더링 = 함수 실행"

---

## 1. 서론 — Props는 왜 React의 두 번째 주제인가

### 1.1 컴포넌트 간 데이터 전달의 역사적 배경

UI 컴포넌트 간 데이터 전달은 프론트엔드 프레임워크의 핵심 설계 결정이다. jQuery 시대에는 DOM을 매개로 데이터를 주고받았다. 부모 요소의 `data-*` 속성을 읽거나, 전역 변수를 통해 데이터를 공유했으며, 이는 코드가 커질수록 "어디서 이 값이 왔는지" 추적이 불가능한 스파게티 구조를 만들었다.

Angular.js(1.x)는 양방향 데이터 바인딩(Two-Way Data Binding)을 도입하여 이 문제를 해결하려 했다. 모델이 바뀌면 뷰가 자동으로 갱신되고, 뷰에서 입력하면 모델이 자동으로 갱신되는 방식이었다. 그러나 양방향 바인딩은 애플리케이션이 커질수록 **"어떤 변경이 어떤 연쇄 반응을 일으키는지"** 예측하기 어려워지는 문제를 낳았다. Facebook은 이 문제를 "양방향 데이터 흐름의 비결정성"이라고 진단했다.

React는 이 문제에 대한 응답으로 **단방향 데이터 흐름(One-Way Data Flow)** 을 핵심 설계 원칙으로 채택했다. 데이터는 오직 부모에서 자식으로만 흐르며, 이 데이터를 전달하는 유일한 공식 채널이 바로 **Props**이다. 단방향 흐름은 제약처럼 보이지만, 데이터의 출처와 흐름을 명확히 하여 대규모 애플리케이션에서도 예측 가능한 동작을 보장한다.

### 1.2 산업적 가치 — Props와 단방향 데이터 흐름이 실무에서 중요한 이유

Props 설계는 React 애플리케이션의 유지보수성과 직결된다. 실무 코드 리뷰에서 가장 자주 지적되는 패턴이 "Props Drilling"(불필요한 중간 전달), "잘못된 State 배치", "Props 직접 변경" 같은 문제이며, 이는 모두 Props와 단방향 데이터 흐름에 대한 이해 부족에서 비롯된다.

Airbnb, Shopify, Netflix 같은 대규모 React 코드베이스에서 컴포넌트의 재사용성을 결정하는 것은 Props 인터페이스의 설계 품질이다. 잘 설계된 Props는 컴포넌트를 다양한 맥락에서 재사용 가능하게 만들고, 잘못 설계된 Props는 컴포넌트를 특정 위치에 고착시킨다. 이 Step에서 배우는 합성(Composition) 패턴과 children prop은 React 공식 문서가 상속(Inheritance) 대신 권장하는 유일한 재사용 전략이다.

### 1.3 이 Step의 핵심 개념 관계도

```
┌──────────────────────────────────────────────────────────────┐
│              Step 05 핵심 개념 관계도                           │
│                                                               │
│  부모 컴포넌트                                                │
│    │                                                          │
│    │ Props (읽기 전용 객체)                                    │
│    │   · 데이터 전달: name, age, items 등                      │
│    │   · 콜백 전달: onClick, onChange 등                       │
│    │   · children: JSX 자식 요소                               │
│    ▼                                                          │
│  자식 컴포넌트                                                │
│    · Props를 읽기만 한다 (수정 불가)                           │
│    · 콜백 Props를 호출하여 부모에게 이벤트 전달                │
│                                                               │
│  데이터 흐름:                                                 │
│    부모 → 자식 (Props, 단방향)                                │
│    자식 → 부모 (콜백 호출, 역방향 통신)                       │
│                                                               │
│  State 배치 원칙:                                             │
│    공유 데이터 → 가장 가까운 공통 부모 (Lifting State Up)      │
│                                                               │
│  재사용 전략:                                                 │
│    상속 ✗ → 합성(Composition) + children prop ✓               │
│                                                               │
│  한계:                                                        │
│    Props Drilling → Context API(Step 25)로 해결               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 컴포넌트 간 통신의 시작

Step 4에서 컴포넌트가 **React Element를 반환하는 함수**라는 것을 배웠다. 그런데 함수가 유용하려면 **입력**을 받아 **다양한 출력**을 만들어야 한다. 일반 함수의 매개변수에 해당하는 것이 React에서는 **Props**이다.

```
일반 함수                        React 컴포넌트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function greet(name) {           function Greeting({ name }) {
  return `Hello, ${name}!`;       return <h1>Hello, {name}!</h1>;
}                                }

greet('홍길동')                  <Greeting name="홍길동" />
→ 'Hello, 홍길동!'               → <h1>Hello, 홍길동!</h1>
```

### 1.5 이 Step을 학습하면 답할 수 있는 질문들

```
· Props는 내부적으로 어떤 형태로 전달되는가?
· Props를 왜 직접 수정하면 안 되는가? (기술적 이유)
· 데이터는 왜 부모 → 자식 방향으로만 흐르는가?
· 자식이 부모의 데이터를 변경하려면 어떻게 하는가?
· 형제 컴포넌트가 같은 데이터를 공유하려면 어떻게 하는가?
· Props Drilling은 무엇이고, 어떻게 완화하는가?
· children prop은 무엇이며, 왜 합성(Composition)이 중요한가?
```

### 1.6 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · Props의 본질과 내부 전달 메커니즘                      │
│  · Immutable 패턴의 이론적 근거                          │
│  · 단방향 데이터 흐름의 설계 철학                         │
│  · 콜백 Props 패턴 (자식 → 부모)                        │
│  · Lifting State Up (상태 끌어올리기)                    │
│  · children prop과 합성(Composition)                    │
│  · Props Drilling 문제와 해결 방향                       │
│  · Props 변경과 재렌더링의 관계                          │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · useState 상세 (Step 6)                               │
│  · React.memo 최적화 (Step 14)                          │
│  · Context API (Step 25)                                │
│  · 전역 상태 관리 (Step 26)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                   | 정의                                                                                                   | 왜 중요한가                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Props**              | Properties의 약자. 부모 컴포넌트가 자식 컴포넌트에 전달하는 **읽기 전용 데이터 객체**                  | 컴포넌트 간 데이터 통신의 유일한 공식 채널이다            |
| **Immutability**       | 생성 후 변경하지 않는 데이터 처리 원칙. 변경이 필요하면 **새로운 값을 만들어 교체**한다                | Props를 직접 수정하면 React의 변경 감지가 작동하지 않는다 |
| **One-Way Data Flow**  | 데이터가 부모 → 자식 방향으로만 흐르는 설계 패턴. **단방향 데이터 흐름**                               | 데이터의 출처를 명확히 하여 디버깅을 용이하게 한다        |
| **Callback Props**     | 부모가 자식에게 **함수를 Props로 전달**하고, 자식이 이 함수를 호출하여 부모에게 이벤트를 전달하는 패턴 | 단방향 흐름 안에서 자식 → 부모 통신을 가능하게 한다       |
| **Lifting State Up**   | 형제 컴포넌트가 데이터를 공유할 때, State를 **가장 가까운 공통 부모**로 끌어올리는 패턴                | React에서 형제 간 통신의 표준 방법이다                    |
| **Composition**        | 컴포넌트를 조합하여 더 큰 UI를 구성하는 패턴. 상속(Inheritance) 대신 사용                              | React가 권장하는 컴포넌트 재사용 전략이다                 |
| **children**           | JSX의 여는 태그와 닫는 태그 사이에 넣은 내용이 자동으로 전달되는 특수 Prop                             | 합성 패턴의 핵심 도구이다                                 |
| **Props Drilling**     | 중간 컴포넌트가 데이터를 사용하지 않으면서 하위에 전달하기 위해 징검다리 역할만 하는 상황              | 컴포넌트 결합도를 높이고 유지보수를 어렵게 만든다         |
| **Shallow Comparison** | 객체의 참조(reference)만 비교하는 방식. 내부 값이 같아도 참조가 다르면 "다름"으로 판단                 | React.memo의 Props 비교, State 변경 감지의 기반이다       |
| **Derived State**      | 기존 State/Props에서 계산으로 얻을 수 있는 값. **별도의 State로 저장하지 않는다**                      | 불필요한 State와 동기화 문제를 방지한다                   |

### 2.2 핵심 용어 심층 해설

#### Props (Properties)

Props는 부모 컴포넌트가 자식 컴포넌트에 전달하는 **읽기 전용 데이터 객체**이다. JSX에서 컴포넌트에 작성하는 속성들(`name="홍길동"`, `age={25}`)은 트랜스파일 시 하나의 JavaScript 객체로 합쳐져 컴포넌트 함수의 첫 번째 매개변수로 전달된다. 즉 `<Greeting name="홍길동" age={25} />`는 내부적으로 `Greeting({ name: '홍길동', age: 25 })`와 동일하다.

Props의 핵심 특성은 **읽기 전용(Read-Only)** 이라는 점이다. 자식 컴포넌트는 전달받은 Props를 읽을 수만 있고, 직접 수정할 수 없다. 이 제약은 기술적 이유(React의 변경 감지 메커니즘)와 설계적 이유(데이터 흐름의 예측 가능성) 모두에서 비롯된다. Props를 직접 변경하면 React는 그 변경을 감지하지 못하여 화면이 업데이트되지 않으며, 데이터의 출처를 추적하기 어려워진다.

#### 단방향 데이터 흐름 (One-Way Data Flow)

단방향 데이터 흐름은 데이터가 **오직 부모에서 자식 방향으로만** 전달되는 설계 패턴이다. React의 컴포넌트 트리에서 데이터는 항상 위에서 아래로 흐르며, 자식이 부모의 데이터를 직접 변경하는 것은 허용되지 않는다. 자식이 부모에게 정보를 전달해야 할 때는 **콜백 Props**(부모가 전달한 함수)를 호출하는 간접적인 방식을 사용한다.

이 설계의 가장 큰 이점은 **디버깅의 용이성**이다. 양방향 바인딩에서는 "이 값이 어디서 변경되었는가?"를 추적하려면 바인딩된 모든 곳을 확인해야 하지만, 단방향 흐름에서는 **State를 소유한 컴포넌트**가 유일한 변경 지점이므로, 데이터 변경의 출처를 즉시 특정할 수 있다.

#### Lifting State Up (상태 끌어올리기)

Lifting State Up은 두 개 이상의 자식 컴포넌트가 동일한 데이터를 공유해야 할 때, 그 데이터(State)를 **가장 가까운 공통 부모 컴포넌트**로 이동시키는 패턴이다. React에서 형제 컴포넌트 간에는 직접 통신할 수 없으므로, 공유 데이터를 부모가 관리하고 Props로 양쪽 자식에게 전달하는 것이 유일한 방법이다.

이 패턴은 React 공식 문서에서 가장 먼저 소개되는 데이터 공유 전략이며, 대부분의 상태 공유 문제를 해결할 수 있다. 다만 컴포넌트 계층이 깊어지면 중간 컴포넌트가 데이터를 사용하지 않으면서 전달만 하는 **Props Drilling** 문제가 발생할 수 있다. 이 경우 Context API(Step 25)나 전역 상태 관리(Step 26)를 고려한다.

#### 합성 (Composition)

합성은 컴포넌트를 **조합**하여 더 복잡한 UI를 구성하는 패턴이다. React에서는 상속(Inheritance) 대신 합성을 사용하여 컴포넌트를 재사용한다. React 공식 문서는 "React를 사용하는 수천 개의 컴포넌트에서 상속 계층 구조가 필요한 사례를 찾지 못했다"고 명시한다.

합성의 핵심 도구는 **children prop**이다. `<Card><p>내용</p></Card>`처럼 태그 사이에 넣은 JSX는 자동으로 `children` prop으로 전달된다. 이를 통해 Card 컴포넌트는 내부 콘텐츠를 알 필요 없이, 외부에서 유연하게 내용을 주입받을 수 있다. 이 패턴은 Modal, Layout, Sidebar 등 "틀(Frame)"을 제공하는 컴포넌트에서 광범위하게 사용된다.

### 2.3 데이터 흐름 개념 지도

```
┌──────────────────────────────────────────────────────────────┐
│                   React 데이터 흐름 모델                       │
│                                                               │
│         ┌─────────────┐                                      │
│         │   부모(Parent)│                                      │
│         │  State 소유   │                                      │
│         └──────┬───────┘                                      │
│                │                                              │
│      ┌─────────┴──────────┐                                   │
│      │                    │                                   │
│      ▼  Props (데이터)     ▼  Props (데이터)                   │
│  ┌────────┐          ┌────────┐                               │
│  │ 자식 A  │          │ 자식 B  │                               │
│  └────┬───┘          └────┬───┘                               │
│       │                   │                                   │
│       ▼ Callback 호출     ▼ Callback 호출                     │
│  "이런 일이             "이런 일이                              │
│   일어났다"              일어났다"                              │
│       │                   │                                   │
│       └────────┬──────────┘                                   │
│                ▼                                              │
│         부모가 State 변경                                     │
│                │                                              │
│                ▼                                              │
│         새로운 Props로 자식들 재렌더링                          │
│                                                               │
│  ● 데이터:  부모 → 자식  (Props)                              │
│  ● 이벤트:  자식 → 부모  (Callback 호출)                      │
│  ● 데이터의 "흐름"은 항상 단방향이다                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 Props의 내부 메커니즘

#### Props는 하나의 JavaScript 객체이다

JSX에서 컴포넌트에 전달하는 모든 속성은 **하나의 객체로 묶여** 함수의 첫 번째 인자로 전달된다.

```jsx
// 이 JSX는
<UserCard name="홍길동" age={25} isActive={true} />;

// 이렇게 변환된다 (Step 4 복습)
_jsx(UserCard, {
  name: "홍길동",
  age: 25,
  isActive: true,
});

// React가 내부적으로 하는 일
UserCard({ name: "홍길동", age: 25, isActive: true });
//        └──────────── 하나의 객체 ────────────┘
```

전달되는 props 객체의 실제 형태:

```javascript
{
  name: '홍길동',
  age: 25,
  isActive: true
}
```

#### Destructuring으로 Props 수신하기

Step 2에서 배운 Destructuring을 Props 수신에 적용한다.

```jsx
// 패턴 1: 매개변수에서 직접 Destructuring (권장 ★)
function UserCard({ name, age, isActive }) {
  return (
    <p>
      {name}, {age}세, {isActive ? "활성" : "비활성"}
    </p>
  );
}

// 패턴 2: props 객체를 받아 내부에서 Destructuring
function UserCard(props) {
  const { name, age, isActive } = props;
  return (
    <p>
      {name}, {age}세, {isActive ? "활성" : "비활성"}
    </p>
  );
}

// 패턴 3: props 객체를 직접 사용
function UserCard(props) {
  return (
    <p>
      {props.name}, {props.age}세
    </p>
  );
}
```

**패턴 1이 권장되는 이유:**

```
1. 컴포넌트의 인터페이스가 시그니처에 명시된다
   → 어떤 Props를 받는지 한눈에 파악 가능

2. 기본값(Default Value) 지정이 자연스럽다
   → function Button({ variant = 'primary', size = 'md' })

3. Rest 패턴으로 나머지 Props를 깔끔하게 수집할 수 있다
   → function Button({ variant, ...rest })
```

#### Default Props — 기본값 설정

```jsx
// ✅ Destructuring Default (현재 표준)
function Button({ variant = "primary", size = "md", children }) {
  return <button className={`btn-${variant} btn-${size}`}>{children}</button>;
}

// 사용
<Button size="lg">저장</Button>;
// variant는 생략 → 기본값 'primary' 적용
```

> ⚠️ **defaultProps는 deprecated:** React 19에서 함수 컴포넌트의 `defaultProps`는 공식적으로 사용이 중단(deprecated)되었다. Destructuring Default가 표준이다.

#### Props로 전달할 수 있는 값의 종류

```jsx
<Component
  // 문자열
  name="홍길동"
  title={"동적 문자열"}
  // 숫자
  age={25}
  price={99.99}
  // 불리언
  isActive={true}
  isActive // true의 축약형
  // 배열
  items={[1, 2, 3]}
  // 객체
  user={{ name: "홍길동", age: 25 }}
  // 함수 (콜백)
  onClick={handleClick}
  onChange={(e) => console.log(e.target.value)}
  // React Element (JSX)
  icon={<StarIcon />}
  header={<h1>제목</h1>}
  // null / undefined
  optional={null} // 명시적 null 전달
/>

// ⚠️ 전달할 수 없는 것: 없다. JavaScript의 모든 값을 전달할 수 있다.
// 다만 객체/배열/함수는 참조(reference) 비교에 주의해야 한다 (3.5절)
```

### 3.2 Immutability — Props는 읽기 전용

#### 핵심 규칙

**Props를 직접 수정하는 것은 React의 근본 규칙을 위반하는 것이다.**

```jsx
// ❌ 절대 하면 안 되는 것들
function BadComponent(props) {
  props.name = "수정됨"; // Props 직접 수정
  props.items.push("new"); // Props 내부 배열 변경
  props.user.age = 30; // Props 내부 객체 변경
  delete props.unnecessary; // Props 속성 삭제
  return <p>{props.name}</p>;
}

// ✅ Props는 오직 읽기만 한다
function GoodComponent({ name, items }) {
  // 필요하다면 새로운 값을 계산
  const upperName = name.toUpperCase();
  const sortedItems = [...items].sort();
  return (
    <p>
      {upperName}: {sortedItems.join(", ")}
    </p>
  );
}
```

#### 왜 Immutable이어야 하는가 — 3가지 이유

**이유 1: 예측 가능성 (Predictability)**

Step 4에서 배운 순수 함수 원칙의 직접적 연장이다. Props가 변경 불가능하면 **같은 입력이 항상 같은 출력**을 보장한다.

```
같은 Props를 전달하면 항상 같은 UI가 렌더링된다
→ UI = f(props, state)
→ props가 변하지 않으면 props에 의한 출력도 변하지 않는다
→ 디버깅 시 "이 Props로 이 결과가 나와야 한다"를 확신할 수 있다
```

**이유 2: 변경 감지 효율성 (Change Detection)**

React는 재렌더링 여부를 판단할 때 **참조(reference) 비교**를 사용한다.

```javascript
// React의 변경 감지 원리 (단순화)
if (Object.is(prevProps, nextProps)) {
  // 같은 참조 → 변경 없음으로 판단
} else {
  // 다른 참조 → 변경됨으로 판단 → 재렌더링
}

// Props를 직접 변경하면
props.name = "새이름";
// prevProps === nextProps → true (같은 객체!)
// React는 변경을 감지하지 못한다!

// 새 객체를 만들면
const newProps = { ...props, name: "새이름" };
// prevProps !== nextProps → false (다른 객체!)
// React가 변경을 감지한다!
```

**이유 3: 단방향 흐름 보장 (Unidirectional Flow)**

Props를 자식이 수정할 수 있다면 데이터가 **아래에서 위로 역류**하여 흐름 추적이 불가능해진다.

```
Props 변경을 허용하면:

  부모 → { name: '홍길동' } → 자식
  부모 ← { name: '변경됨!' } ← 자식  ← 역류!

  부모가 모르는 사이에 데이터가 변경됨
  → "이 값이 왜 이렇게 되었지?" 추적 불가능
  → 양방향 바인딩의 문제와 동일


Props를 읽기 전용으로 유지하면:

  부모 → { name: '홍길동' } → 자식 (읽기만)
  부모 ← onNameChange('새이름') ← 자식 (이벤트 알림만)
  부모가 스스로 setName('새이름') 결정

  → 데이터 변경의 "원인"이 항상 데이터 소유자에게 있다
  → 추적 가능하고 예측 가능한 흐름
```

### 3.3 단방향 데이터 흐름 (One-Way Data Flow)

#### 핵심 원리

React에서 데이터는 **항상 부모 → 자식 방향으로만 흐른다.** 이것을 **Top-Down Data Flow**라고도 한다.

```
┌──────────────────────────────────────────────┐
│                    App                        │
│              State: user, items               │
│                    │                          │
│       ┌────────────┼────────────┐             │
│       │            │            │             │
│       ▼            ▼            ▼             │
│   ┌────────┐  ┌─────────┐  ┌────────┐       │
│   │ Header │  │ ItemList │  │ Footer │       │
│   │        │  │          │  │        │       │
│   │Props:  │  │Props:    │  │Props:  │       │
│   │ user   │  │ items    │  │ (없음) │       │
│   └────────┘  └────┬─────┘  └────────┘       │
│                    │                          │
│               ┌────┴────┐                     │
│               │ ItemCard │                     │
│               │Props:    │                     │
│               │ item     │                     │
│               └─────────┘                     │
│                                               │
│  데이터 흐름: App → Header, ItemList, Footer   │
│              ItemList → ItemCard              │
│              ※ 역방향 흐름 없음                │
└──────────────────────────────────────────────┘
```

#### 양방향 vs 단방향 비교

```
양방향 데이터 바인딩 (Two-Way Binding)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  A ←→ B ←→ C
  ↕         ↕
  D ←→ E ←→ F

  · A가 변경되면 B, D에 전파 → B 변경이 C, E에 전파 → ...
  · 연쇄 반응의 범위를 예측하기 어렵다
  · "이 값이 왜 이렇게 바뀌었지?" — 원인 추적이 복잡


단방향 데이터 흐름 (One-Way Data Flow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

       App
      ↙   ↘
    A       B
   ↙ ↘      ↓
  C   D     E

  · 데이터는 위에서 아래로만 흐른다
  · A가 바뀌면 C, D만 영향을 받는다 (E는 무관)
  · "이 값이 왜 바뀌었지?" → 부모를 올라가면 원인을 찾을 수 있다
  · 버그의 원인이 데이터 소유 컴포넌트에 국한된다
```

#### 단방향 흐름의 실전 예시

```jsx
function App() {
  const [user] = useState({ name: "홍길동", role: "admin" });
  const [todos, setTodos] = useState([
    { id: 1, text: "React 학습", done: false },
    { id: 2, text: "Props 이해", done: true },
  ]);

  return (
    <div>
      {/* user 데이터가 위 → 아래로 흐른다 */}
      <Header userName={user.name} />

      {/* todos 데이터가 위 → 아래로 흐른다 */}
      <TodoList todos={todos} />

      {/* 통계도 파생 데이터로 내려보낸다 */}
      <StatusBar
        total={todos.length}
        done={todos.filter((t) => t.done).length}
      />
    </div>
  );
}

function Header({ userName }) {
  // userName을 읽기만 한다
  return <h1>{userName}의 할 일 목록</h1>;
}

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function TodoItem({ todo }) {
  return (
    <li style={{ textDecoration: todo.done ? "line-through" : "none" }}>
      {todo.text}
    </li>
  );
}

function StatusBar({ total, done }) {
  return (
    <p>
      완료: {done} / {total}
    </p>
  );
}
```

### 3.4 자식 → 부모 통신: 콜백 Props 패턴

#### "데이터는 아래로, 이벤트는 위로"

단방향 데이터 흐름에서 자식이 부모의 상태를 변경해야 할 때, 부모가 **변경 함수를 Props로 내려보내고** 자식이 이를 **호출**한다.

```
┌─────────────────────────────────────────────────┐
│  핵심 원칙                                       │
│                                                  │
│  · 자식은 부모의 State를 직접 수정하지 않는다     │
│  · 자식은 "이런 일이 일어났다"고 알릴 뿐이다      │
│  · 부모가 그 알림을 받아 스스로 State를 변경한다   │
│                                                  │
│  데이터:  부모 ──Props──→ 자식                    │
│  이벤트:  부모 ←─Callback── 자식                  │
└─────────────────────────────────────────────────┘
```

#### 콜백 Props 패턴의 전체 구현

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "React 학습", done: false },
    { id: 2, text: "Props 이해", done: false },
  ]);

  // 부모가 "상태 변경 함수"를 정의한다
  const handleToggle = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const handleDelete = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleAdd = (text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  };

  return (
    <div>
      {/* 콜백 함수를 Props로 전달한다 */}
      <AddTodoForm onAdd={handleAdd} />
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  // 자식은 받은 콜백을 "호출"할 뿐이다
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)} // 부모의 함수 호출
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
}

function AddTodoForm({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text); // 부모의 함수 호출
      setText("");
    }
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>추가</button>
    </div>
  );
}
```

```
실행 흐름 추적 (체크박스 클릭 시)

  1. 사용자가 TodoItem의 체크박스 클릭
  2. onChange 핸들러 실행 → onToggle(todo.id) 호출
  3. onToggle은 부모(TodoApp)의 handleToggle 함수
  4. handleToggle(id) 실행 → setTodos(...)로 State 변경
  5. TodoApp 재렌더링 → 새 todos 배열로 TodoItem에 Props 전달
  6. TodoItem 재렌더링 → 변경된 todo.done 반영

  ● 데이터의 소유권: 항상 TodoApp에 있다
  ● TodoItem은 데이터를 표시하고, 이벤트를 알릴 뿐이다
```

#### 콜백 Props 네이밍 컨벤션

```
┌──────────────────────────────────────────────────────┐
│  Props 이름 (자식의 인터페이스)    │  접두사: on       │
│  ─────────────────────────────    │                   │
│  onToggle, onClick, onSubmit      │ "이런 일이 일어남" │
│  onDelete, onChange, onSelect     │                   │
├──────────────────────────────────────────────────────┤
│  핸들러 함수 (부모의 구현)         │  접두사: handle   │
│  ─────────────────────────────    │                   │
│  handleToggle, handleClick        │ "이 일을 처리함"  │
│  handleDelete, handleChange       │                   │
└──────────────────────────────────────────────────────┘

예시:
  // 부모
  const handleItemDelete = (id) => { ... };
  <TodoItem onDelete={handleItemDelete} />

  // 자식
  function TodoItem({ onDelete }) {
    return <button onClick={() => onDelete(id)}>삭제</button>;
  }
```

### 3.5 Props 변경과 재렌더링의 관계

#### 부모 재렌더링 → 자식 재렌더링 (기본 동작)

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // Parent가 재렌더링되면 이 함수 전체가 다시 실행됨 (Step 4 복습)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <Child message="고정값" /> {/* Props가 변하지 않아도 재렌더링! */}
    </div>
  );
}

function Child({ message }) {
  console.log("Child 렌더링"); // 부모 클릭 시마다 출력됨
  return <p>{message}</p>;
}
```

> ⚠️ **흔한 오해:** "Props가 변경되어야 자식이 재렌더링된다." → **틀렸다.** 부모가 재렌더링되면 자식은 **Props 변경 여부와 관계없이** 재렌더링된다. 이것이 React의 기본 동작이다.

**왜 이런 동작인가?**

```
Step 4에서 배운 것: "렌더링 = 함수 실행"

  Parent() 함수가 다시 실행됨
    → 함수 본문의 모든 코드가 재실행됨
    → <Child message="고정값" /> 이 JSX도 재평가됨
    → _jsx(Child, { message: "고정값" }) → 새 React Element 객체 생성
    → 이전 Element와 새 Element는 "다른 객체" (참조가 다름)
    → React: "새 Element가 왔으니 Child를 다시 호출하자"
```

#### 얕은 비교 (Shallow Comparison) 원리

React.memo(Step 14)나 이후 최적화를 이해하기 위한 기초 개념이다.

```javascript
// 원시값은 "값"을 비교 → 같으면 같다
Object.is("hello", "hello"); // true
Object.is(42, 42); // true
Object.is(true, true); // true

// 참조 타입은 "참조(주소)"를 비교 → 내용이 같아도 다른 객체면 다르다
Object.is({ a: 1 }, { a: 1 }); // false — 다른 객체!
Object.is([1, 2], [1, 2]); // false — 다른 배열!

const fn1 = () => {};
const fn2 = () => {};
Object.is(fn1, fn2); // false — 다른 함수!

// 같은 참조만 true
const obj = { a: 1 };
Object.is(obj, obj); // true — 같은 객체
```

**React에서의 의미:**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 새 객체 생성 → 항상 "변경됨"으로 인식
  const style = { color: "red" };
  //           ↑ 렌더링마다 새 참조

  // ❌ 매 렌더링마다 새 함수 생성 → 항상 "변경됨"으로 인식
  const handleClick = () => console.log("click");
  //                  ↑ 렌더링마다 새 참조

  return <Child style={style} onClick={handleClick} />;
  // React.memo를 써도 매번 "Props 변경됨"으로 판단
  // → useMemo, useCallback으로 해결 (Step 14에서 학습)
}
```

#### 불필요한 재렌더링 방지 미리보기

```jsx
// React.memo — Props가 변하지 않으면 재렌더링 건너뛰기
const Child = React.memo(function Child({ message }) {
  console.log("Child 렌더링");
  return <p>{message}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <Child message="고정값" />
      {/* message가 변하지 않으면 Child는 재렌더링되지 않음 */}
    </div>
  );
}
```

> 💡 React.memo, useMemo, useCallback의 상세한 사용법과 **"언제 쓰지 말아야 하는가"** 는 Step 14에서 학습한다. 지금은 "이런 방법이 있다" 정도만 인지한다.

### 3.6 Lifting State Up (상태 끌어올리기)

#### 문제 상황: 형제 컴포넌트가 데이터를 공유해야 할 때

```
        App
       ↙   ↘
  FilterBar  ProductList

  FilterBar의 필터 값에 따라 ProductList가 변해야 한다.
  그런데 형제끼리는 직접 데이터를 주고받을 수 없다!
  (단방향 흐름이므로 형제 간 "옆으로 가는" 경로가 없다)
```

#### 해결: 공통 부모에 State 배치

```
해결 전:                          해결 후:

  App                               App
 ↙   ↘                           State: filter
FilterBar  ProductList              ↙         ↘
 (filter를  (filter를            FilterBar    ProductList
  어디에?)   모름!)              Props:       Props:
                                 filter       filteredProducts
                                 onFilterChange
```

```jsx
function App() {
  // State를 공통 부모에 배치한다
  const [filter, setFilter] = useState("all");
  const [products] = useState([
    { id: 1, name: "노트북", category: "electronics", price: 1200000 },
    { id: 2, name: "셔츠", category: "clothing", price: 45000 },
    { id: 3, name: "키보드", category: "electronics", price: 85000 },
    { id: 4, name: "바지", category: "clothing", price: 55000 },
  ]);

  // 파생 데이터: filter에 따라 필터링된 상품
  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      {/* 콜백 Props로 자식 → 부모 이벤트 전달 */}
      <FilterBar currentFilter={filter} onFilterChange={setFilter} />
      {/* 필터링된 데이터를 Props로 전달 */}
      <ProductList products={filteredProducts} />
    </div>
  );
}

function FilterBar({ currentFilter, onFilterChange }) {
  const categories = ["all", "electronics", "clothing"];
  return (
    <div>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          style={{ fontWeight: currentFilter === cat ? "bold" : "normal" }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ProductList({ products }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} — {p.price.toLocaleString()}원
        </li>
      ))}
    </ul>
  );
}
```

#### State 배치 판단 기준

```
"이 State를 어디에 둘 것인가?"

  ┌─ 하나의 컴포넌트만 사용하는가?
  │    YES → 해당 컴포넌트에 둔다
  │
  ├─ 부모-자식 관계에서만 사용하는가?
  │    YES → 부모에 두고 Props로 전달
  │
  ├─ 형제 컴포넌트가 공유하는가?
  │    YES → 가장 가까운 공통 부모로 끌어올린다 ★
  │
  └─ 먼 거리의 컴포넌트들이 공유하는가?
       → Context API (Step 25) 또는 전역 상태 관리 (Step 26)
```

### 3.7 children Prop과 합성(Composition) 패턴

#### children Prop의 메커니즘

JSX에서 여는 태그와 닫는 태그 사이의 내용은 `children`이라는 이름의 Prop으로 자동 전달된다.

```jsx
// 사용하는 쪽
<Card>
  <h2>제목입니다</h2>
  <p>본문입니다</p>
</Card>;

// 내부적으로 전달되는 props 객체
{
  children: [
    { type: "h2", props: { children: "제목입니다" } },
    { type: "p", props: { children: "본문입니다" } },
  ];
}

// Card 컴포넌트에서 수신
function Card({ children }) {
  return (
    <div className="card">
      <div className="card-body">
        {children} {/* 전달받은 내용을 그대로 렌더링 */}
      </div>
    </div>
  );
}
```

#### children의 다양한 형태

```jsx
// 1. 텍스트
<Button>클릭</Button>
// children: '클릭'

// 2. 단일 Element
<Card><p>내용</p></Card>
// children: { type: 'p', ... }

// 3. 여러 Element
<Card>
  <h2>제목</h2>
  <p>본문</p>
</Card>
// children: [{ type: 'h2', ... }, { type: 'p', ... }]

// 4. 표현식
<Display>{count * 2}</Display>
// children: 숫자 값

// 5. 함수 (Render Props 패턴 — Step 29에서 학습)
<DataFetcher>{(data) => <p>{data.name}</p>}</DataFetcher>
// children: (data) => { type: 'p', ... }

// 6. 없음
<EmptyCard />
// children: undefined
```

#### 합성(Composition) 패턴 — React의 컴포넌트 재사용 전략

React는 **상속(Inheritance) 대신 합성(Composition)** 을 사용하여 컴포넌트를 재사용한다.

```jsx
// 범용 Dialog 컴포넌트 — children + 명시적 Props로 유연한 구조
function Dialog({ title, children, footer }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        <div className="dialog-body">
          {children} {/* 본문 영역: 자유로운 컨텐츠 */}
        </div>
        {footer && (
          <div className="dialog-footer">
            {footer} {/* 하단 영역: 버튼 등 */}
          </div>
        )}
      </div>
    </div>
  );
}

// 삭제 확인 대화상자 — Dialog를 "합성"하여 특화
function ConfirmDeleteDialog({ itemName, onConfirm, onCancel }) {
  return (
    <Dialog
      title="삭제 확인"
      footer={
        <>
          <button onClick={onCancel}>취소</button>
          <button onClick={onConfirm}>삭제</button>
        </>
      }
    >
      <p>"{itemName}"을(를) 삭제하시겠습니까?</p>
      <p>이 작업은 되돌릴 수 없습니다.</p>
    </Dialog>
  );
}

// 폼 대화상자 — 같은 Dialog를 다른 용도로 합성
function FormDialog({ onSubmit }) {
  return (
    <Dialog title="정보 입력">
      <form onSubmit={onSubmit}>
        <input placeholder="이름" />
        <input placeholder="이메일" />
        <button type="submit">제출</button>
      </form>
    </Dialog>
  );
}
```

#### Named Slot 패턴 — 여러 영역에 컨텐츠 삽입

```jsx
function PageLayout({ header, sidebar, children }) {
  return (
    <div className="page">
      <header className="page-header">{header}</header>
      <div className="page-body">
        <aside className="page-sidebar">{sidebar}</aside>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <PageLayout
      header={<NavBar />}                 {/* header 슬롯 */}
      sidebar={<DashboardMenu />}          {/* sidebar 슬롯 */}
    >
      <h1>대시보드</h1>                     {/* children (main) 슬롯 */}
      <StatsGrid />
      <RecentActivity />
    </PageLayout>
  );
}
```

### 3.8 Props Drilling 문제

#### Props Drilling이란

중간 컴포넌트가 데이터를 **사용하지 않으면서** 하위 컴포넌트에 전달하기 위해 **징검다리 역할만** 하는 상황이다.

```
App (theme, user)
 └─ Layout (props: theme, user)          ← 사용하지 않음, 전달만
     └─ Sidebar (props: theme, user)     ← 사용하지 않음, 전달만
         └─ NavMenu (props: theme, user) ← 사용하지 않음, 전달만
             └─ NavItem (props: theme)   ← 여기서 사용!
             └─ UserBadge (props: user)  ← 여기서 사용!
```

```jsx
// 4단계 Drilling
function App() {
  const [theme, setTheme] = useState("dark");
  const [user] = useState({ name: "홍길동", avatar: "/img/hong.png" });

  return <Layout theme={theme} user={user} />;
}

function Layout({ theme, user }) {
  // 사용 안 함
  return <Sidebar theme={theme} user={user} />;
}

function Sidebar({ theme, user }) {
  // 사용 안 함
  return <NavMenu theme={theme} user={user} />;
}

function NavMenu({ theme, user }) {
  return (
    <nav>
      <NavItem theme={theme} /> // 여기서 사용
      <UserBadge user={user} /> // 여기서 사용
    </nav>
  );
}
```

**Drilling의 문제점:**

```
1. 결합도 증가
   · Layout, Sidebar가 theme/user를 알 필요가 없는데 인터페이스에 포함됨
   · theme의 타입이 바뀌면 4개 컴포넌트를 모두 수정해야 함

2. 가독성 저하
   · "이 Props가 실제로 어디서 사용되지?" 추적이 어려움

3. 유지보수 부담
   · 중간 컴포넌트 추가/제거 시 Props 체인 전체를 수정해야 함
```

#### 해결 방법 1: 합성 패턴으로 구조 변경

```jsx
// After: 합성 패턴으로 Props Drilling 제거
function App() {
  const [theme, setTheme] = useState("dark");
  const [user] = useState({ name: "홍길동", avatar: "/img/hong.png" });

  // App이 직접 최종 컴포넌트를 생성하여 children으로 내려보냄
  return (
    <Layout>
      <Sidebar>
        <NavMenu>
          <NavItem theme={theme} />
          <UserBadge user={user} />
        </NavMenu>
      </Sidebar>
    </Layout>
  );
}

// 중간 컴포넌트들은 theme, user를 전혀 몰라도 된다
function Layout({ children }) {
  return <div className="layout">{children}</div>;
}

function Sidebar({ children }) {
  return <aside className="sidebar">{children}</aside>;
}

function NavMenu({ children }) {
  return <nav className="nav-menu">{children}</nav>;
}
```

#### 해결 방법 비교

```
┌─────────────────────┬──────────────────────┬──────────────────┐
│  방법                │  적합한 경우          │  학습 시점        │
├─────────────────────┼──────────────────────┼──────────────────┤
│  합성(Composition)  │  구조 재설계가 가능   │  현재 Step ★     │
│                     │  할 때               │                  │
├─────────────────────┼──────────────────────┼──────────────────┤
│  Context API        │  테마, 언어, 인증 등  │  Step 25         │
│                     │  광범위 공유 데이터   │                  │
├─────────────────────┼──────────────────────┼──────────────────┤
│  전역 상태 관리      │  복잡한 클라이언트    │  Step 26         │
│  (Zustand 등)       │  상태, 고빈도 업데이트│                  │
└─────────────────────┴──────────────────────┴──────────────────┘
```

### 3.9 Immutable 업데이트 패턴 정리

Props 자체를 변경하지 않지만, State를 통해 **새로운 데이터를 만들어 교체**할 때 사용하는 필수 패턴이다. Step 2에서 배운 Spread 연산자가 핵심 도구가 된다.

```javascript
// 객체 — 속성 변경
const nextUser = { ...user, name: "새이름" };

// 객체 — 중첩 속성 변경
const nextUser = {
  ...user,
  address: { ...user.address, city: "부산" },
};

// 배열 — 추가
const nextItems = [...items, newItem];

// 배열 — 제거
const nextItems = items.filter((item) => item.id !== targetId);

// 배열 — 수정
const nextItems = items.map((item) =>
  item.id === targetId ? { ...item, done: true } : item,
);

// 배열 — 정렬 (원본 변경 방지)
const nextItems = [...items].sort((a, b) => a.price - b.price);
// 또는 ES2023
const nextItems = items.toSorted((a, b) => a.price - b.price);
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 온도 변환기로 보는 Lifting State Up

두 입력 필드가 서로의 값에 영향을 주는 전형적인 Lifting State Up 사례이다.

```
요구사항:
  · 섭씨 입력 → 화씨가 자동 계산
  · 화씨 입력 → 섭씨가 자동 계산
  · 두 입력은 항상 동기화

문제:
  · TemperatureInput 컴포넌트를 2개 만든다면
  · 각각 자체 State를 가지면 동기화할 수 없다
  · → 공통 부모로 State를 끌어올려야 한다
```

```
해결 구조:

         TemperatureConverter
        State: { value, scale }
           ↙            ↘
  TemperatureInput    TemperatureInput
    (섭씨, °C)          (화씨, °F)
  Props:              Props:
   temperature         temperature
   onTemperatureChange onTemperatureChange
```

```jsx
function TemperatureConverter() {
  const [temperature, setTemperature] = useState("");
  const [scale, setScale] = useState("c"); // 'c' 또는 'f'

  const handleCelsiusChange = (value) => {
    setScale("c");
    setTemperature(value);
  };

  const handleFahrenheitChange = (value) => {
    setScale("f");
    setTemperature(value);
  };

  // 파생 데이터: 현재 scale에 따라 반대 단위를 계산
  const celsius =
    scale === "f" ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit =
    scale === "c" ? tryConvert(temperature, toFahrenheit) : temperature;

  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      {celsius !== "" && (
        <p>물의 상태: {parseFloat(celsius) >= 100 ? "끓음" : "액체"}</p>
      )}
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleNames = { c: "섭씨", f: "화씨" };
  return (
    <fieldset>
      <legend>{scaleNames[scale]} 온도 입력</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
}

// 변환 유틸리티 함수
function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function tryConvert(temperature, convertFn) {
  const input = parseFloat(temperature);
  if (Number.isNaN(input)) return "";
  return Math.round(convertFn(input) * 1000) / 1000 + "";
}
```

**이 사례에서 확인할 수 있는 원칙들:**

```
✅ 단방향 흐름: 데이터는 부모(TemperatureConverter) → 자식(TemperatureInput)
✅ 콜백 Props: onTemperatureChange로 자식 → 부모 이벤트 전달
✅ Lifting State Up: temperature/scale State가 공통 부모에 위치
✅ 파생 데이터: celsius/fahrenheit는 State가 아닌 계산값
✅ Single Source of Truth: 온도 데이터의 출처가 하나뿐
```

### 4.2 사례: 합성 패턴이 상속보다 나은 이유

```
상속 방식 (React에서 권장하지 않음):

  class Dialog { render() { ... } }
  class ConfirmDialog extends Dialog { render() { ... } }
  class FormDialog extends Dialog { render() { ... } }

  문제:
  · ConfirmDialog가 "삭제 확인 + 형식 입력"을 동시에 해야 한다면?
  · 다중 상속은 불가능 → 구조가 경직됨
  · 부모 클래스 변경이 모든 자식에 영향


합성 방식 (React 권장):

  Dialog({ title, children, footer })
  → 어떤 내용이든 children으로 넣을 수 있다
  → footer에 버튼이든 링크든 자유롭게 넣을 수 있다
  → Dialog 자체를 변경하지 않고도 무한히 다양한 변형 가능

  "상속은 '무엇인가(is-a)'를 정의하고,
   합성은 '무엇을 포함하는가(has-a)'를 정의한다."
```

### 4.3 사례: Derived State(파생 상태)의 함정

```jsx
// ❌ 안티 패턴: Props를 State에 복사
function UserGreeting({ user }) {
  // user.name이 변경되면 이 State는 자동으로 업데이트되지 않는다!
  const [greeting, setGreeting] = useState(`안녕하세요, ${user.name}님`);

  return <h1>{greeting}</h1>;
  // user.name이 '홍길동' → '김철수'로 바뀌어도
  // greeting은 여전히 '안녕하세요, 홍길동님'!
}

// ✅ 올바른 방법: 렌더링 중 계산 (파생 데이터)
function UserGreeting({ user }) {
  // Props에서 직접 계산 — 항상 최신 값 보장
  const greeting = `안녕하세요, ${user.name}님`;

  return <h1>{greeting}</h1>;
}
```

```
Props를 State에 복사하는 것이 위험한 이유

  1. Props가 업데이트되어도 State는 자동으로 변하지 않는다
     → useState의 초기값은 첫 렌더링에서만 사용된다

  2. 두 개의 "진실의 출처"가 생긴다
     → Props에는 '김철수', State에는 '홍길동'
     → 어떤 것이 맞는가?

  3. 동기화 로직이 필요해진다
     → useEffect로 Props 변경을 감지하여 State를 업데이트?
     → 복잡성만 증가, 버그 가능성 상승

  원칙: "Props에서 계산 가능한 값은 State로 만들지 않는다"
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 부모-자식 컴포넌트 간 Props 전달, 콜백 패턴, children 합성을 직접 실습할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: 콜백 Props로 CRUD 구현 [Applying]

**목표:** 콜백 Props 패턴으로 자식 → 부모 통신을 구현한다.

**연락처 관리 앱**을 만든다:

```
요구사항:
  · ContactForm: 이름, 전화번호 입력 후 "추가" 클릭
  · ContactList: 연락처 목록 표시
  · ContactItem: 개별 연락처 + "삭제" 버튼
  · State(contacts 배열)는 App에 위치
  · 자식 → 부모 통신은 모두 콜백 Props로 구현

구조:
        App
      State: contacts
       ↙        ↘
  ContactForm  ContactList
  Props:       Props:
   onAdd        contacts
                onDelete
                   ↓
               ContactItem
               Props:
                contact
                onDelete
```

**힌트:**

- contact 객체: `{ id, name, phone }`
- `Date.now()`를 id로 사용
- Immutable 업데이트 패턴 사용 (Spread, filter)

---

### 실습 2: Lifting State Up 연습 [Applying · Analyzing]

**목표:** 형제 컴포넌트 간 데이터 공유를 위해 State를 끌어올린다.

**통화 변환기**를 만든다:

```
요구사항:
  · CurrencyInput 컴포넌트 2개 (KRW, USD)
  · KRW 입력 → USD 자동 계산, USD 입력 → KRW 자동 계산
  · 환율은 1 USD = 1,350 KRW로 고정
  · State는 공통 부모에 위치 (Lifting State Up 적용)

판단할 것:
  · 어떤 값을 State로 관리해야 하는가?
  · 파생 데이터는 무엇인가?
  · State를 어떤 컴포넌트에 배치해야 하는가?
```

---

### 실습 3: Props Drilling 식별과 리팩토링 [Analyzing · Evaluating]

**목표:** Props Drilling을 식별하고 합성 패턴으로 구조를 개선한다.

아래 코드에서 Drilling 문제를 찾고, **합성 패턴**으로 리팩토링하라.

```jsx
function App() {
  const [user] = useState({ name: "홍길동", avatar: "/img/hong.png" });
  const [notifications] = useState(3);
  const [theme] = useState("dark");

  return (
    <PageWrapper user={user} notifications={notifications} theme={theme} />
  );
}

function PageWrapper({ user, notifications, theme }) {
  return (
    <div className={`page theme-${theme}`}>
      <TopBar user={user} notifications={notifications} />
      <MainContent theme={theme} />
    </div>
  );
}

function TopBar({ user, notifications }) {
  return (
    <header>
      <Logo />
      <SearchBar />
      <UserMenu user={user} notifications={notifications} />
    </header>
  );
}

function UserMenu({ user, notifications }) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <span>{user.name}</span>
      {notifications > 0 && <span className="badge">{notifications}</span>}
    </div>
  );
}

function MainContent({ theme }) {
  return (
    <main>
      <h1>메인 콘텐츠</h1>
      <p>현재 테마: {theme}</p>
    </main>
  );
}
```

**분석할 것:**

- 어떤 컴포넌트가 Props를 사용하지 않고 전달만 하는가?
- 합성 패턴으로 어떻게 구조를 바꿀 수 있는가?
- 합성으로 해결할 수 없는 경우는 어떤 상황인가?

---

### 실습 4 (선택): 합성 패턴으로 재사용 컴포넌트 설계 [Evaluating · Creating]

**목표:** children과 Named Slot을 활용한 범용 컴포넌트를 설계한다.

다음 요구사항에 맞는 `AlertBox` 컴포넌트를 설계하라:

```
요구사항:
  · variant: 'info' | 'warning' | 'error' | 'success' (기본값: 'info')
  · title: 알림 제목 (문자열)
  · children: 알림 본문 (자유로운 JSX)
  · icon: 좌측 아이콘 (선택적 React Element)
  · action: 하단 버튼 영역 (선택적 React Element)
  · onClose: 닫기 콜백 (선택적 함수)

사용 예시:
  <AlertBox variant="error" title="저장 실패" onClose={handleClose}>
    <p>서버 연결에 실패했습니다.</p>
    <p>네트워크 상태를 확인해주세요.</p>
  </AlertBox>

  <AlertBox
    variant="success"
    title="배포 완료"
    icon={<CheckIcon />}
    action={<button onClick={handleView}>확인하기</button>}
  >
    <p>v2.1.0이 프로덕션에 배포되었습니다.</p>
  </AlertBox>
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 5 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Props = 부모가 자식에게 전달하는 읽기 전용 객체            │
│     → 모든 JSX 속성이 하나의 JS 객체로 묶여 전달됨            │
│     → Destructuring으로 수신하는 것이 표준                    │
│     → 기본값은 매개변수 Default Value로 설정                   │
│                                                               │
│  2. Props는 Immutable이다 — 3가지 이유                       │
│     → 예측 가능성: 같은 입력 → 같은 출력 보장                 │
│     → 변경 감지: 참조 비교 기반, 직접 수정하면 감지 불가       │
│     → 단방향 보장: 데이터 역류 방지, 소유권 명확화             │
│                                                               │
│  3. 데이터는 위에서 아래로만 흐른다 (One-Way Data Flow)        │
│     → Props: 부모 → 자식 (데이터 전달)                        │
│     → Callback: 자식 → 부모 (이벤트 알림)                     │
│     → 양방향보다 추적·디버깅이 용이하다                        │
│                                                               │
│  4. 형제 컴포넌트가 데이터를 공유하면 Lifting State Up         │
│     → State를 가장 가까운 공통 부모로 끌어올린다               │
│     → 파생 데이터는 렌더링 중 계산 (State로 만들지 않는다)     │
│                                                               │
│  5. children과 합성으로 유연한 컴포넌트를 만든다               │
│     → 상속 대신 합성 (Composition over Inheritance)           │
│     → Named Slot 패턴으로 여러 영역에 컨텐츠 삽입             │
│                                                               │
│  6. 부모 재렌더링 → 자식 재렌더링이 기본 동작이다              │
│     → Props 변경 여부와 무관하게 발생                         │
│     → React.memo로 최적화 가능 (Step 14)                     │
│                                                               │
│  7. Props Drilling은 합성 패턴으로 완화할 수 있다              │
│     → 깊은 Drilling은 Context(Step 25) 또는 전역 상태(Step 26)│
│                                                               │
│  8. Props를 State에 복사하지 않는다                            │
│     → Props에서 계산 가능한 값은 파생 데이터로 처리            │
│     → Single Source of Truth 원칙                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                    | 블룸 단계  | 확인할 섹션 |
| --- | ----------------------------------------------------------------------- | ---------- | ----------- |
| 1   | JSX 속성들이 컴포넌트 함수에 전달되는 내부 형태는?                      | Remember   | 3.1         |
| 2   | Props를 직접 수정하면 React의 변경 감지가 작동하지 않는 이유는?         | Understand | 3.2         |
| 3   | `on` 접두사 Props와 `handle` 접두사 함수의 관계를 설명하라              | Understand | 3.4         |
| 4   | 부모 State가 변경될 때, Props가 변하지 않는 자식도 재렌더링되는 이유는? | Understand | 3.5         |
| 5   | 두 형제 컴포넌트가 같은 데이터를 필요로 할 때의 해결 패턴은?            | Apply      | 3.6         |
| 6   | `<Card>{content}</Card>`에서 content는 어떤 이름의 Prop으로 전달되는가? | Apply      | 3.7         |
| 7   | Props Drilling이 발생하는 상황을 식별하고 합성 패턴으로 해결하라        | Analyze    | 3.8         |
| 8   | `const [name, setName] = useState(props.name)`이 위험한 이유는?         | Evaluate   | 4.3         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. Props와 State의 차이는 무엇인가?**

Props는 **부모로부터 전달받는 읽기 전용 데이터**이고, State는 **컴포넌트 자신이 소유하고 변경할 수 있는 데이터**이다. Props는 함수의 매개변수에, State는 함수 내부의 지역 변수에 비유할 수 있다. Props를 변경하려면 부모의 State를 변경해야 하며, 그 결과 부모가 새로운 Props를 자식에게 전달한다.

**Q2. Props를 직접 변경하면 실제로 어떤 일이 일어나나?**

`props.name = '새이름'`처럼 직접 변경하면, JavaScript 객체의 속성값 자체는 변경될 수 있지만 **React는 이 변경을 감지하지 못한다.** React의 재렌더링은 State 변경(setState)에 의해 촉발되므로, Props를 직접 변경해도 화면이 업데이트되지 않는다. 또한 다음 렌더링 시 부모가 새 Props 객체를 전달하면 직접 변경한 값은 덮어씌워져 사라진다.

**Q3. defaultProps는 아직 사용해야 하나?**

함수 컴포넌트에서는 `defaultProps`보다 **ES6 기본 매개변수(Default Parameters)** 를 사용하는 것이 권장된다. `function Greeting({ name = '게스트' })`처럼 Destructuring 시 기본값을 지정하면 된다. `defaultProps`는 class 컴포넌트 시대의 패턴이며, React 공식 문서도 함수 컴포넌트에서는 기본 매개변수를 권장한다.

**Q4. children에 여러 요소를 전달하면 어떻게 되나?**

children에 여러 요소를 전달하면 **배열**로 전달된다. 단일 요소면 그 요소 자체가, 텍스트만 있으면 문자열이 전달된다. `React.Children` 유틸리티를 사용하면 children의 타입에 관계없이 안전하게 순회할 수 있다. 다만 대부분의 경우 children을 그대로 렌더링하면 되므로 유틸리티가 필요한 경우는 드물다.

**Q5. Props Drilling이 몇 단계부터 문제인가?**

절대적인 기준은 없지만, 일반적으로 **3~4단계 이상** 중간 컴포넌트가 사용하지 않는 Props를 전달하기만 한다면 리팩토링을 고려해야 한다. 먼저 합성(Composition) 패턴으로 계층 구조를 평탄화할 수 있는지 검토하고, 그래도 해결되지 않으면 Context API(Step 25)를 도입한다.

---

## 7. 다음 단계 예고

> **Step 6. useState와 렌더 사이클**
>
> - State의 본질: 렌더링 간 유지되는 기억장치
> - "State는 스냅샷이다" — 한 렌더링 안에서 고정되는 값
> - Batching: 여러 업데이트를 하나의 렌더링으로 합치기
> - Updater Function: `prev => prev + 1` 패턴
> - Stale Closure 문제와 해결
> - StrictMode의 이중 실행 이유
> - State 설계 원칙과 안티 패턴

---

## 📚 참고 자료

- [React 공식 문서 — Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [React 공식 문서 — Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [React 공식 문서 — Thinking in React](https://react.dev/learn/thinking-in-react)
- [React 공식 문서 — Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [React 공식 문서 — Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- [React 공식 문서 — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 5 of 42
