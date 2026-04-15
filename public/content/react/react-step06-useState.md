# Step 06. useState와 렌더 사이클

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| **Remember**   | State, Snapshot, Batching, Updater Function, Stale Closure의 정의를 기술할 수 있다 |
| **Understand** | State가 "스냅샷"으로 동작하는 원리를 설명할 수 있다                                |
| **Understand** | Batching이 여러 setState를 하나의 렌더링으로 합치는 과정을 설명할 수 있다          |
| **Apply**      | Updater Function을 사용하여 이전 State 기반 업데이트를 올바르게 구현할 수 있다     |
| **Analyze**    | Stale Closure가 발생하는 코드를 식별하고 원인을 추적할 수 있다                     |
| **Evaluate**   | State 설계 원칙(최소화, 중복 제거, 모순 방지)을 적용하여 설계를 판단할 수 있다     |

**전제 지식:**

- Step 2: const/let, 클로저(Closure), 배열 고차 함수
- Step 4: "렌더링 = 함수 실행", 순수 함수 원칙
- Step 5: Props, Immutable 업데이트 패턴, 단방향 데이터 흐름

---

## 1. 서론 — State는 React의 심장이다

### 1.1 상태 관리의 역사적 배경 — jQuery에서 React까지

웹 애플리케이션의 "상태(State)"를 어떻게 관리할 것인가는 프론트엔드 개발의 가장 오래된 난제이다. jQuery 시대에는 상태가 DOM 자체에 저장되었다. 체크박스의 체크 여부, 입력 필드의 값, 목록의 아이템 수 등이 모두 DOM 노드의 속성으로 존재했고, 상태를 변경하려면 DOM을 직접 조작해야 했다. 이 접근법은 상태가 UI 전체에 흩어져 있어 "현재 애플리케이션의 전체 상태가 무엇인가?"라는 질문에 답하기 어려웠다.

Backbone.js(2010)와 Angular.js(2010)는 Model-View 분리를 통해 상태를 DOM에서 분리하려 했다. Backbone은 Model 객체에 상태를 저장하고 이벤트로 View에 통지했으며, Angular.js는 $scope 객체와 양방향 바인딩을 사용했다. 그러나 양방향 바인딩은 한 변경이 다른 변경을 연쇄적으로 촉발하여, Facebook의 알림 카운터 버그 같은 추적 불가능한 문제를 만들었다.

React(2013)는 이 문제에 대한 근본적으로 다른 접근을 취했다. **State를 컴포넌트 함수 외부에 저장하되, 렌더링 시점에 스냅샷으로 제공**하는 모델이다. State 변경은 직접 값을 바꾸는 것이 아니라 `setState`를 통해 React에게 "다음 렌더링에서 이 값을 사용해달라"고 요청하는 방식이다. 이 설계는 "UI는 현재 State의 함수(`UI = f(state)`)"라는 선언적 모델의 기반이 되었다.

### 1.2 산업적 가치 — State 이해가 실무 역량과 직결되는 이유

State 관련 버그는 React 실무에서 가장 빈번하게 발생하는 문제 유형이다. Stack Overflow의 React 태그 질문 중 상당수가 "왜 setState 직후에 값이 바뀌지 않는가?", "왜 setInterval 안에서 State가 업데이트되지 않는가?", "왜 배열 State를 push로 변경하면 화면이 안 바뀌는가?" 같은 State 관련 질문이다.

이 문제들의 근본 원인은 **State의 스냅샷 모델, Batching, 클로저 캡처**에 대한 이해 부족이다. 이 세 가지 개념을 정확히 이해하면 실무에서 마주치는 State 관련 버그의 대부분을 즉시 진단하고 해결할 수 있다. 또한 State 설계 원칙(최소화, 중복 제거, 단일 출처)을 숙지하면 유지보수가 용이한 컴포넌트를 처음부터 설계할 수 있어, 리팩토링 비용을 크게 줄일 수 있다.

### 1.3 이 Step의 핵심 개념 관계도

![step06 01 step 06 핵심 개념 관계도](/developer-open-book/diagrams/react-step06-01-step-06-핵심-개념-관계도.svg)

### 1.4 Props만으로는 부족한 이유

Step 5에서 Props는 **부모가 자식에게 전달하는 읽기 전용 데이터**라고 배웠다. 그런데 사용자가 버튼을 클릭하거나 텍스트를 입력할 때 **화면이 바뀌어야 한다.** Props만으로는 이 "변화"를 만들 수 없다. **컴포넌트 내부에서 소유하고 변경할 수 있는 데이터** — 그것이 State이다.

```
Props와 State의 역할 분담

  Props  = 외부에서 주입되는 설정값 (읽기 전용)
  State  = 내부에서 관리하는 변화하는 값 (변경 가능)

  UI = f(props, state)
  → 같은 props + 같은 state → 항상 같은 화면
```

### 1.5 이 Step을 학습하면 답할 수 있는 질문들

```
· 왜 일반 변수(let count = 0)로는 화면이 업데이트되지 않는가?
· setState 직후에 State 값을 읽으면 왜 이전 값이 나오는가?
· 한 핸들러에서 setState를 3번 호출하면 렌더링이 몇 번 일어나는가?
· setCount(count + 1)을 3번 호출하면 왜 1만 증가하는가?
· setCount(prev => prev + 1)을 3번 호출하면 왜 3이 증가하는가?
· setTimeout 안에서 State 값이 "오래된 값"인 이유는?
· 개발 모드에서 컴포넌트가 왜 두 번 실행되는가?
· State를 최소한으로 설계해야 하는 이유는?
```

### 1.6 이 Step에서 다루는 범위

![step06 02 다루는 것](/developer-open-book/diagrams/react-step06-02-다루는-것.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                    | 정의                                                                                             | 왜 중요한가                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **State**               | 컴포넌트 내부에서 소유하고 변경할 수 있는 데이터. 렌더링 간에 React가 보관한다                   | State 변경이 재렌더링의 주요 트리거이다                      |
| **useState**            | State를 선언하는 React Hook. `[currentValue, setterFunction]` 배열을 반환한다                    | 함수 컴포넌트에서 State를 사용하는 유일한 기본 방법이다      |
| **Snapshot**            | 한 번의 렌더링에서 State 값이 **고정된 채로 유지**되는 것. 사진의 스냅샷처럼 그 시점의 값을 캡처 | setState 직후에도 이번 렌더링의 State가 변하지 않는 이유이다 |
| **Batching**            | 여러 State 업데이트를 **모아서 한 번의 렌더링으로 처리**하는 최적화                              | 불필요한 중간 렌더링을 방지하여 성능을 향상시킨다            |
| **Updater Function**    | `setState(prevState => newState)` 형태로 **이전 값을 기반으로** 새 값을 계산하는 함수            | 연속 업데이트와 Stale Closure 문제를 해결한다                |
| **Stale Closure**       | 클로저가 **오래된(stale) State 값**을 캡처하여 최신 값이 아닌 과거 값을 참조하는 버그            | 타이머, 이벤트 리스너 등 비동기 콜백에서 빈번히 발생한다     |
| **StrictMode**          | 개발 모드에서 컴포넌트를 **의도적으로 두 번 실행**하여 불순한 렌더링을 감지하는 래퍼             | 부수 효과가 있는 코드를 사전에 발견할 수 있다                |
| **Lazy Initialization** | `useState(() => expensiveComputation())` 형태로 초기값을 **첫 렌더링에서만** 계산하는 패턴       | 무거운 초기값 계산이 매 렌더링마다 반복되는 것을 방지한다    |
| **bailout**             | State가 이전 값과 동일할 때 React가 **재렌더링을 건너뛰는** 최적화                               | 같은 값으로 setState해도 성능 저하가 없는 이유이다           |
| **Derived State**       | 기존 State/Props에서 **계산으로 얻을 수 있는 값**. 별도 State로 저장하지 않는다                  | 불필요한 State와 동기화 문제를 방지한다 (Step 5 복습)        |

### 2.2 핵심 용어 심층 해설

#### State와 Snapshot 모델

State는 컴포넌트가 렌더링 간에 "기억"해야 하는 데이터이다. 일반 JavaScript 변수는 함수 실행이 끝나면 사라지지만, State는 React가 컴포넌트 외부에 보관하여 다음 렌더링에서도 접근할 수 있게 한다. 중요한 것은 State가 **스냅샷처럼 동작**한다는 점이다. `setState`를 호출해도 현재 렌더링의 State 값은 변하지 않는다. 마치 사진을 찍으면 그 시점이 고정되는 것처럼, 한 번의 렌더링에서 State는 처음부터 끝까지 동일한 값을 유지한다.

이 스냅샷 모델은 React 초보자가 가장 혼란스러워하는 부분이다. `setCount(count + 1)` 직후에 `console.log(count)`를 출력하면 이전 값이 나오는 이유가 바로 이것이다. 새 값은 **다음 렌더링**에서야 반영된다. 이 원리를 이해하면 "왜 setState 직후에 값이 안 바뀌는가?"라는 질문에 명확히 답할 수 있다.

#### Batching (일괄 처리)

Batching은 여러 State 업데이트를 모아서 **한 번의 렌더링으로 처리**하는 React의 성능 최적화이다. 한 이벤트 핸들러 안에서 `setA(1); setB(2); setC(3);`을 호출하면 3번의 렌더링이 아니라 1번의 렌더링만 발생한다. React 18 이전에는 이벤트 핸들러 내부에서만 Batching이 적용되었지만, React 18부터는 **Automatic Batching**이 도입되어 setTimeout, Promise, 네이티브 이벤트 핸들러 등 모든 맥락에서 Batching이 적용된다.

Batching이 중요한 이유는 성능뿐 아니라 **일관성** 때문이다. 3개의 State가 변경되는 도중에 화면이 업데이트되면 사용자가 불완전한 중간 상태를 보게 된다. Batching은 모든 업데이트가 완료된 후 한 번에 화면을 갱신하여 이 문제를 방지한다.

#### Stale Closure (오래된 클로저)

Stale Closure는 클로저가 **생성 시점의 State 스냅샷**을 캡처하여, 이후 State가 변경되어도 과거 값을 참조하는 현상이다. `setTimeout`, `setInterval`, 이벤트 리스너 등 비동기 콜백에서 자주 발생한다. 예를 들어, `setTimeout(() => console.log(count), 3000)`은 타이머 등록 시점의 `count` 값을 출력하며, 3초 동안 State가 변경되어도 반영되지 않는다.

이 문제의 해결책은 **Updater Function**(함수형 업데이트)이다. `setCount(count + 1)` 대신 `setCount(prev => prev + 1)`을 사용하면, React가 업데이트 큐에서 이전 결과를 `prev`로 전달하므로 항상 최신 값을 기반으로 계산할 수 있다. `useRef`를 사용하여 최신 값을 추적하는 방법도 있다(Step 12에서 학습).

#### Lazy Initialization (지연 초기화)

Lazy Initialization은 `useState`의 초기값을 **함수로 전달**하여 첫 렌더링에서만 계산하는 패턴이다. `useState(expensiveComputation())`은 매 렌더링마다 `expensiveComputation()`을 실행하지만(결과는 첫 렌더링에서만 사용), `useState(() => expensiveComputation())`은 첫 렌더링에서만 함수를 호출한다. localStorage 읽기, 복잡한 초기 데이터 계산 등에서 불필요한 반복 실행을 방지할 수 있다.

### 2.3 State 업데이트 흐름도

![step06 03 사용자 액션 클릭 입력 등](/developer-open-book/diagrams/react-step06-03-사용자-액션-클릭-입력-등.svg)

---

## 3. 이론과 원리

### 3.1 왜 일반 변수가 아닌 State가 필요한가

#### 일반 변수의 한계

```jsx
// ❌ 일반 변수 — 두 가지 이유로 동작하지 않는다
function Counter() {
  let count = 0;

  const handleClick = () => {
    count = count + 1;
    console.log(count); // 값은 증가하지만...
  };

  return (
    <div>
      <p>{count}</p> {/* 항상 0으로 표시된다 */}
      <button onClick={handleClick}>+1</button>
    </div>
  );
}
```

**동작하지 않는 두 가지 이유:**

```
이유 1: 지역 변수는 렌더링 간에 유지되지 않는다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 4에서 배운 것: "렌더링 = 함수 실행"

  함수가 다시 호출되면 let count = 0이 다시 실행된다
  → 이전에 증가시킨 값이 사라진다
  → 매번 0으로 초기화된다

이유 2: 지역 변수를 변경해도 렌더링이 트리거되지 않는다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  count = 1로 변경해도 React는 이것을 알 수 없다
  → React에게 "다시 그려달라"고 요청하는 메커니즘이 없다
  → 화면은 그대로 유지된다
```

#### useState가 해결하는 것

```jsx
// ✅ useState — 두 가지 문제를 모두 해결한다
function Counter() {
  const [count, setCount] = useState(0);
  //     ↑        ↑              ↑
  //  현재 값  setter 함수     초기값

  const handleClick = () => {
    setCount(count + 1); // 1) React에 새 값을 알려준다
    // 2) 재렌더링을 예약한다
  };

  return (
    <div>
      <p>{count}</p> {/* 렌더링마다 최신 값 표시 */}
      <button onClick={handleClick}>+1</button>
    </div>
  );
}
```

```
useState의 두 가지 보장

  1. 렌더링 간 데이터 유지
     · React가 내부적으로 State 값을 보관한다
     · 함수가 다시 호출되어도 useState가 보관된 값을 반환한다
     · 지역 변수와 달리 "기억"이 있다

  2. 렌더링 트리거
     · setter 함수(setCount) 호출 시 React에 재렌더링을 요청한다
     · React가 컴포넌트 함수를 다시 호출한다
     · 새로운 값으로 새로운 React Element 트리를 생성한다
```

#### useState의 내부 동작 (간략화된 멘탈 모델)

```
React 내부 (극도로 단순화)

  // React가 컴포넌트별로 State를 보관하는 구조
  componentStates = {
    Counter_instance_1: [
      { value: 0 },    // useState(0)의 첫 번째 State
    ]
  };

  // Counter() 함수가 호출될 때
  function Counter() {
    // useState(0) 호출 시:
    // → 이미 저장된 값이 있으면 그 값을 반환
    // → 없으면 초기값(0)으로 새로 생성
    const [count, setCount] = useState(0);
    // count = componentStates.Counter_instance_1[0].value → 0

    // setCount(1) 호출 시:
    // → componentStates.Counter_instance_1[0].value = 1
    // → 재렌더링 예약
    // → Counter()가 다시 호출됨
    // → 이번에는 count = 1
  }
```

> ⚠️ 위 코드는 개념 이해를 위한 **극도로 단순화된 모델**이다. 실제 React 내부는 Fiber 노드에 연결 리스트 형태로 Hook을 관리한다 (Step 10에서 학습).

### 3.2 State는 스냅샷이다

#### 스냅샷(Snapshot) 모델

React에서 State는 **그 렌더링 시점에 고정된 값**이다. 사진을 찍으면 그 순간이 고정되듯, 한 번의 렌더링 안에서 State 값은 **절대 변하지 않는다.**

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 0! (이번 렌더링의 스냅샷)

    setCount(count + 1);
    console.log(count); // 여전히 0!

    setCount(count + 1);
    console.log(count); // 여전히 0!
  };

  // 버튼 클릭 후 count는 0 → 1이 된다 (3이 아님!)
  return <button onClick={handleClick}>{count}</button>;
}
```

**왜 3이 아니라 1인가?**

```
handleClick이 실행되는 시점의 스냅샷: count = 0

  setCount(count + 1)  →  setCount(0 + 1)  →  "1로 교체" 큐에 추가
  setCount(count + 1)  →  setCount(0 + 1)  →  "1로 교체" 큐에 추가 (같은 값!)
  setCount(count + 1)  →  setCount(0 + 1)  →  "1로 교체" 큐에 추가 (같은 값!)

  큐 처리: [1, 1, 1]
    시작값 0 → 1로 교체 → 1로 교체 → 1로 교체
    최종 결과: 1

  핵심: 이 핸들러 안에서 count는 항상 0이다.
        setCount가 count의 값을 바꾸는 것이 아니다.
        다음 렌더링에서 새로운 스냅샷(count=1)이 만들어지는 것이다.
```

#### 각 렌더링은 자신만의 스냅샷을 가진다

```
[렌더링 #1] count = 0
  · 이 렌더링의 모든 코드가 count=0을 본다
  · handleClick 안의 count도 0
  · JSX의 {count}도 0
  · setTimeout 콜백 안의 count도 0

(setCount(1) 호출)

[렌더링 #2] count = 1
  · 이 렌더링의 모든 코드가 count=1을 본다
  · 이전 렌더링의 함수·콜백은 여전히 count=0을 기억한다
```

#### 스냅샷과 비동기 코드

```jsx
function DelayedAlert() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);

    setTimeout(() => {
      // 이 콜백은 클릭 시점의 count(0)를 캡처했다
      alert(`클릭 시점의 count: ${count}`);
    }, 3000);
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

```
시나리오:
  t=0   버튼 클릭 (count=0 스냅샷)
        setCount(1) → 재렌더링 예약
        setTimeout 등록 (count=0이 클로저에 캡처됨)

  t=?   재렌더링 발생 → 화면에 1 표시

  t=3s  setTimeout 콜백 실행 → alert("클릭 시점의 count: 0")
        ※ 화면에는 1이지만, alert는 0을 보여준다
        ※ 이것은 버그가 아니다 — 스냅샷 모델의 정상 동작이다
```

> 💡 **핵심 원리:** 한 렌더링에서 생성된 모든 함수(이벤트 핸들러, setTimeout 콜백, Promise 콜백 등)는 **그 렌더링 시점의 State 스냅샷**을 참조한다. 이것이 JavaScript 클로저 메커니즘과 React의 렌더링 모델이 결합된 결과이다.

### 3.3 Batching — 여러 업데이트를 하나로 합치기

#### Batching의 원리

React는 성능을 위해 여러 State 업데이트를 **모아서 한 번에 처리**한다.

```jsx
function Profile() {
  const [name, setName] = useState("홍길동");
  const [age, setAge] = useState(25);
  const [city, setCity] = useState("서울");

  const handleUpdate = () => {
    setName("김철수"); // 큐에 추가
    setAge(30); // 큐에 추가
    setCity("부산"); // 큐에 추가
    // → 핸들러 종료 후 React가 큐를 처리 → 1번의 재렌더링
  };

  console.log("렌더링 발생"); // handleUpdate 후 1번만 출력

  return (
    <div>
      <p>
        {name}, {age}세, {city}
      </p>
      <button onClick={handleUpdate}>수정</button>
    </div>
  );
}
```

```
Batching이 없다면:
  setName('김철수')  → 렌더링 #2 (name만 변경)
  setAge(30)         → 렌더링 #3 (age만 변경)
  setCity('부산')     → 렌더링 #4 (city만 변경)
  → 사용자가 name만 변경된 중간 상태를 볼 수 있다 (깜빡임!)
  → 3번의 불필요한 렌더링

Batching이 있으면 (실제 동작):
  setName, setAge, setCity → 큐에 모두 쌓음
  핸들러 종료 → React가 큐를 한 번에 처리
  → 렌더링 #2 (name + age + city 모두 반영)
  → 1번의 렌더링, 중간 상태 없음
![step06 04 18의 automatic batching](/developer-open-book/diagrams/react-step06-04-react-18의-automatic-batching.svg)

![step06 05 automatic batching 적용 범위](/developer-open-book/diagrams/react-step06-05-automatic-batching-적용-범위.svg)

#### flushSync — Batching 강제 해제

극히 드물게 즉시 DOM 업데이트가 필요할 때 사용한다.

```jsx
import { flushSync } from "react-dom";

function Urgent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount((c) => c + 1);
    });
    // ← 이 시점에서 DOM이 이미 업데이트됨
    // DOM을 읽어야 하는 경우에 유용

    flushSync(() => {
      setCount((c) => c + 1);
    });
    // → 총 2번의 렌더링 발생
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

> ⚠️ `flushSync`는 성능에 부정적이다. DOM 측정이나 스크롤 동기화 같은 **극단적 경우에만** 사용하며, 일반적으로는 사용하지 않는다.

### 3.4 State 업데이트 큐의 처리 과정

#### 큐(Queue)에 쌓이는 두 가지 유형

setState에는 **값을 직접 전달**하거나 **함수를 전달**하는 두 가지 방식이 있다. 큐에서의 처리 방식이 다르다.

```javascript
// 유형 1: 값 직접 전달 (Replacement)
setCount(5);
// → 큐에 추가: "5로 교체"

// 유형 2: 함수 전달 (Updater Function)
setCount((prev) => prev + 1);
// → 큐에 추가: "이전 값에 +1 적용"
```

#### 값 직접 전달 시 큐 처리

```jsx
const handleClick = () => {
  setCount(count + 1); // count=0이므로 → setCount(1)
  setCount(count + 1); // count=0이므로 → setCount(1) (동일!)
  setCount(count + 1); // count=0이므로 → setCount(1) (동일!)
};
```

```
큐: [교체→1, 교체→1, 교체→1]

처리:
  시작값: 0
  → 1로 교체    → 현재값: 1
  → 1로 교체    → 현재값: 1
  → 1로 교체    → 현재값: 1

최종 결과: count = 1
```

#### Updater Function 시 큐 처리

```jsx
const handleClick = () => {
  setCount((prev) => prev + 1); // 함수: (n) => n + 1
  setCount((prev) => prev + 1); // 함수: (n) => n + 1
  setCount((prev) => prev + 1); // 함수: (n) => n + 1
};
```

```
큐: [fn: n=>n+1, fn: n=>n+1, fn: n=>n+1]

처리:
  시작값: 0
  → (0) => 0 + 1  → 현재값: 1
  → (1) => 1 + 1  → 현재값: 2
  → (2) => 2 + 1  → 현재값: 3

최종 결과: count = 3
```

#### 값과 함수가 혼합된 경우

```jsx
const handleClick = () => {
  setCount(count + 5); // 큐: [교체→5]
  setCount((prev) => prev + 1); // 큐: [교체→5, fn: n=>n+1]
  setCount(42); // 큐: [교체→5, fn: n=>n+1, 교체→42]
};
```

```
큐: [교체→5, fn: n=>n+1, 교체→42]

처리:
  시작값: 0
  → 5로 교체         → 현재값: 5
  → (5) => 5 + 1    → 현재값: 6
  → 42로 교체        → 현재값: 42

최종 결과: count = 42

규칙:
  · 교체(값): 이전 결과를 무시하고 덮어쓴다
  · 함수(updater): 이전 결과를 인자로 받아 새 값을 계산한다
```

#### 언제 Updater Function을 사용하는가

```
판단 기준
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  이전 State에 기반한 업데이트인가?

  YES → Updater Function 사용
        setCount(prev => prev + 1)
        setItems(prev => [...prev, newItem])
        setUser(prev => ({ ...prev, name: '새이름' }))

  NO  → 값 직접 전달
        setCount(0)           // 초기화
        setIsOpen(true)       // 단순 설정
        setFilter('all')      // 새 값으로 교체
        setUser(null)         // 비우기
```

### 3.5 Stale Closure 문제

#### 문제의 원리

Step 2에서 배운 **클로저(Closure)** 가 React의 스냅샷 모델과 만나면 **오래된 값을 캡처**하는 버그가 발생할 수 있다.

```jsx
// ❌ 문제: setInterval 안에서 항상 초기값을 참조한다
function AutoCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 이 콜백은 마운트 시점의 count(=0)를 클로저로 캡처한다
      setCount(count + 1); // 매초 setCount(0 + 1)을 반복!
    }, 1000);

    return () => clearInterval(id);
  }, []); // 빈 배열 → 마운트 시 한 번만 실행

  // count는 0 → 1에서 영원히 멈춘다
  return <p>{count}</p>;
}
```

```
Stale Closure 발생 과정

  렌더링 #1: count = 0
    useEffect 실행 → setInterval 등록
    setInterval의 콜백 함수가 생성됨
    이 콜백은 count=0을 클로저로 캡처 ← 이 시점의 스냅샷!

  1초 후: 콜백 실행 → setCount(0 + 1) → count=1로 업데이트 → 렌더링 #2

  렌더링 #2: count = 1
    하지만 useEffect는 []이므로 재실행되지 않음
    setInterval의 콜백은 여전히 렌더링 #1의 것
    → 콜백 안의 count는 여전히 0!

  2초 후: 콜백 실행 → setCount(0 + 1) → count=1 (변화 없음)
  3초 후: 콜백 실행 → setCount(0 + 1) → count=1 (변화 없음)
  → 영원히 1에서 멈춤
```

#### 해결 방법 1: Updater Function (가장 일반적)

```jsx
// ✅ 이전 값에 기반한 업데이트 → Updater Function
function AutoCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + 1);
      // prev는 항상 "현재 큐에서의 최신 값"
      // 클로저가 어떤 값을 캡처했는지와 무관하게 정확히 동작
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>; // 매초 1, 2, 3, 4, ... 증가
}
```

```
Updater Function이 Stale Closure를 해결하는 이유

  콜백 안에서 count "값"을 참조하지 않는다
  대신 "이전 값에서 +1" 이라는 변환 규칙(함수)을 큐에 넣는다
  React가 큐를 처리할 때 항상 최신 State를 함수의 인자로 전달한다
  → 클로저에 캡처된 값이 무엇이든 상관없다
```

#### 해결 방법 2: useRef로 최신 값 참조 (읽기 전용)

```jsx
// ✅ 최신 값을 "읽기"만 해야 할 때 → useRef (Step 12에서 상세 학습)
function LatestValueAlert() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 매 렌더링마다 ref를 최신 값으로 동기화
  countRef.current = count;

  const handleDelayedAlert = () => {
    setTimeout(() => {
      // countRef.current는 항상 최신 값을 가리킨다
      alert(`현재 count: ${countRef.current}`);
    }, 3000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <button onClick={handleDelayedAlert}>3초 후 alert</button>
    </div>
  );
}
```

#### 해결 방법 비교

![step06 06 상황 해결책 추천도](/developer-open-book/diagrams/react-step06-06-상황-해결책-추천도.svg)

### 3.6 StrictMode의 이중 실행

#### 현상

```jsx
// main.jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```jsx
function MyComponent() {
  console.log("렌더링!"); // 개발 모드에서 2번 출력됨!
  const [count, setCount] = useState(0);
  return <p>{count}</p>;
}
```

#### 왜 두 번 실행하는가

StrictMode는 **불순한 렌더링을 감지**하기 위해 의도적으로 이중 실행한다.

```jsx
// StrictMode가 잡아내는 예시
let externalCounter = 0;

function ImpureComponent() {
  externalCounter++; // 렌더링 중 외부 변수 변경!
  return <p>호출: {externalCounter}</p>;
}

// 단일 실행: externalCounter=1 → "호출: 1" (문제 안 보임)
// 이중 실행: externalCounter=2 → "호출: 2" (예상과 다름 → 버그 발견!)
```

```
StrictMode에서 두 번 호출되는 것:
  ✅ 컴포넌트 함수 본문
  ✅ useState 초기화 함수
  ✅ useMemo 콜백
  ✅ useReducer의 reducer
  ✅ useEffect setup + cleanup (마운트 → 언마운트 → 다시 마운트)

두 번 호출되지 않는 것:
  ❌ 이벤트 핸들러 (onClick 등)
  ❌ setTimeout / setInterval 콜백
  ❌ Promise 콜백
```

> 💡 **핵심 규칙:** StrictMode는 **개발 모드에서만** 동작하며, **프로덕션 빌드에서는 이중 실행이 일어나지 않는다.** 이중 실행에서 문제가 발생한다면 코드에 부수 효과가 있다는 신호이다. **절대 StrictMode를 제거하여 "해결"하지 말 것.**

### 3.7 State 초기화 전략

#### Lazy Initialization

초기값 계산이 무거운 경우, **함수를 전달**하여 첫 렌더링에서만 실행되게 한다.

```jsx
// ❌ 매 렌더링마다 createExpensiveData()가 실행됨
const [data, setData] = useState(createExpensiveData());
// createExpensiveData()가 매번 호출되지만
// 반환값은 첫 렌더링에서만 사용됨 → 나머지는 낭비

// ✅ 첫 렌더링에서만 실행됨
const [data, setData] = useState(() => createExpensiveData());
// React가 첫 렌더링에서만 이 함수를 호출한다
```

**흔한 실수: 함수 호출 vs 함수 참조**

```jsx
// ❌ 괄호 있음 → "호출" → 매 렌더링마다 실행
useState(createInitialState());

// ✅ 괄호 없음 → "참조" → 첫 렌더링에서만 실행 (인자 없는 경우)
useState(createInitialState);

// ✅ 인자가 필요하면 → 화살표 함수로 감싸기
useState(() => createInitialState(someArg));
```

**Lazy Initialization이 유용한 경우:**

```jsx
// localStorage에서 읽기
const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});

// 복잡한 초기 데이터 구조 생성
const [grid, setGrid] = useState(() => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: 0 })),
  );
});

// JSON 파싱
const [settings, setSettings] = useState(() => {
  try {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
});
```

### 3.8 State 설계 원칙

#### 원칙 1: 최소한의 State

State에는 **UI를 결정하는 데 필요한 최소한의 데이터만** 저장한다. 계산으로 얻을 수 있는 값은 **Derived State(파생 데이터)** 로 처리한다.

```jsx
// ❌ 과도한 State — fullName은 파생 데이터
function UserForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState(""); // 불필요!

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setFullName(e.target.value + " " + lastName); // 수동 동기화 필요
  };
  // lastName 변경 시에도 fullName 동기화 필요... 깜빡하면 버그!
}

// ✅ 파생 데이터는 렌더링 중 계산
function UserForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const fullName = `${firstName} ${lastName}`.trim(); // 항상 최신 보장
}
```

#### 원칙 2: 중복 제거

```jsx
// ❌ 같은 데이터를 여러 State에 중복
function ProductPage() {
  const [products, setProducts] = useState([...]);
  const [selectedProduct, setSelectedProduct] = useState(
    { id: 1, name: '노트북', price: 1200000 }  // products 안의 항목과 동일 데이터!
  );
  // products에서 가격을 수정하면 selectedProduct도 수정해야 함 → 불일치 위험
}

// ✅ ID만 저장하고 필요할 때 찾기
function ProductPage() {
  const [products, setProducts] = useState([...]);
  const [selectedId, setSelectedId] = useState(null);

  const selectedProduct = products.find(p => p.id === selectedId);
  // products를 수정하면 selectedProduct도 자동으로 최신화
}
```

#### 원칙 3: 관련 State 그룹화

```jsx
// ❌ 항상 함께 변경되는 State를 분리
const [x, setX] = useState(0);
const [y, setY] = useState(0);

const handleMove = (e) => {
  setX(e.clientX); // 항상 같이 변경
  setY(e.clientY); // 항상 같이 변경
};

// ✅ 함께 변경되는 데이터는 하나의 객체로
const [position, setPosition] = useState({ x: 0, y: 0 });

const handleMove = (e) => {
  setPosition({ x: e.clientX, y: e.clientY });
};
```

#### 원칙 4: 모순 가능한 State 제거

```jsx
// ❌ 모순 가능한 조합 (isLoading=true이면서 isError=true?)
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// 상태 전환 시 3개를 모두 올바르게 관리해야 함
// 하나라도 깜빡하면 모순 발생

// ✅ 단일 State로 모순 제거
const [status, setStatus] = useState("idle");
// 'idle' | 'loading' | 'success' | 'error'

// 파생 값으로 활용
const isLoading = status === "loading";
const isError = status === "error";
```

#### State 설계 판단 흐름

![step06 07 이 값을 state로 만들어야 하는가](/developer-open-book/diagrams/react-step06-07-이-값을-state로-만들어야-하는가.svg)

### 3.9 객체와 배열 State의 Immutable 업데이트

Step 5에서 배운 Immutable 패턴을 State 업데이트에 적용한다.

#### 객체 State

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: "홍길동",
    age: 25,
    address: { city: "서울", district: "강남구" },
  });

  // ❌ 직접 변경 — React가 감지하지 못한다
  const handleBad = () => {
    user.name = "김철수"; // 같은 객체 참조
    setUser(user); // Object.is(prev, next) → true → 무시됨!
  };

  // ✅ 1단계 속성 변경
  const handleNameChange = () => {
    setUser((prev) => ({ ...prev, name: "김철수" }));
  };

  // ✅ 중첩 객체 속성 변경
  const handleCityChange = () => {
    setUser((prev) => ({
      ...prev,
      address: { ...prev.address, city: "부산" },
    }));
  };

  return (
    <p>
      {user.name}, {user.address.city}
    </p>
  );
}
```

#### 배열 State — CRUD 패턴

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'React 학습', done: false },
    { id: 2, text: 'Props 이해', done: true }
  ]);

  // CREATE — 추가
  const addTodo = (text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
  };

  // READ — filter로 검색 (State 변경 아님)
  const activeTodos = todos.filter(t => !t.done);

  // UPDATE — 특정 항목 수정
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  // DELETE — 특정 항목 제거
  const removeTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // SORT — 정렬 (원본 변경 방지!)
  const sortTodos = () => {
    setTodos(prev => [...prev].sort((a, b) => a.text.localeCompare(b.text)));
    // 또는 ES2023: prev.toSorted(...)
  };

  return (/* ... */);
}
```

#### 위험한 배열 메서드 vs 안전한 배열 메서드

![step06 08 안전 복사 위험 원본 변경](/developer-open-book/diagrams/react-step06-08-안전-복사-위험-원본-변경.svg)

### 3.10 bailout 최적화

#### Object.is로 동일한 값 감지

React는 `setState`가 호출되어도 새 값이 이전 값과 **Object.is로 같으면** 재렌더링을 건너뛸 수 있다.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(0); // 현재값과 동일
    // React: Object.is(0, 0) → true → 재렌더링 건너뜀 (bailout)
  };

  console.log("렌더링"); // 위 handleClick에서는 출력되지 않을 수 있음
  return <button onClick={handleClick}>{count}</button>;
}
```

```
Object.is 비교 결과

  Object.is(0, 0)           → true   bailout ✅
  Object.is('a', 'a')       → true   bailout ✅
  Object.is(true, true)     → true   bailout ✅
  Object.is(null, null)     → true   bailout ✅

  Object.is({}, {})         → false  재렌더링 ❌ (다른 참조)
  Object.is([], [])         → false  재렌더링 ❌ (다른 참조)

  // 주의: === 와 다른 점
  Object.is(NaN, NaN)       → true   (=== 는 false)
  Object.is(0, -0)          → false  (=== 는 true)
```

> ⚠️ bailout은 React의 **최적화이지 보장이 아니다.** React는 이미 시작된 렌더링을 완료하기 위해 컴포넌트를 호출할 수 있다. 다만 트리 깊숙이 전파하지는 않는다. 코드는 bailout이 없다고 가정하고 작성하는 것이 안전하다.

---

## 4. 사례 연구와 예시

### 4.1 사례: 스냅샷 모델을 모르면 만나는 버그

#### 시나리오: 장바구니 수량 업데이트

```jsx
// ❌ 스냅샷을 이해하지 못한 코드
function Cart() {
  const [quantity, setQuantity] = useState(1);

  const handleBulkAdd = () => {
    // 의도: 수량을 3 증가시키고 싶다
    setQuantity(quantity + 1); // quantity=1 → 2
    setQuantity(quantity + 1); // quantity=1 → 2 (같은 스냅샷!)
    setQuantity(quantity + 1); // quantity=1 → 2 (같은 스냅샷!)
    // 실제 결과: 1만 증가 (3이 아님!)
  };

  return (
    <div>
      <p>수량: {quantity}</p>
      <button onClick={handleBulkAdd}>3개 추가</button>
    </div>
  );
}

// ✅ Updater Function으로 해결
function Cart() {
  const [quantity, setQuantity] = useState(1);

  const handleBulkAdd = () => {
    setQuantity((prev) => prev + 1); // 1 → 2
    setQuantity((prev) => prev + 1); // 2 → 3
    setQuantity((prev) => prev + 1); // 3 → 4
    // 올바른 결과: 3 증가
  };

  return (
    <div>
      <p>수량: {quantity}</p>
      <button onClick={handleBulkAdd}>3개 추가</button>
    </div>
  );
}
```

### 4.2 사례: Batching의 실제 효과

```jsx
function Dashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  console.log('렌더링 발생');

  const handleDataLoaded = (data) => {
    // React 18: 이 4개의 업데이트가 1번의 렌더링으로 합쳐진다
    setUser(data.user);
    setPosts(data.posts);
    setNotifications(data.notifications.length);
    setIsLoading(false);
    // → "렌더링 발생"이 1번만 출력됨
    // → 사용자는 중간 상태(user는 있는데 posts는 없는 상태)를 보지 않음
  };

  // Batching이 없다면:
  // setUser → 렌더링 (user만 표시, posts 없음, 로딩 중)
  // setPosts → 렌더링 (user + posts 표시, 로딩 중)
  // setNotifications → 렌더링 (알림 표시, 로딩 중)
  // setIsLoading → 렌더링 (로딩 완료)
  // → 4번 렌더링, 사용자가 불완전한 중간 상태를 봄!

  return (/* ... */);
}
```

### 4.3 사례: State 설계의 좋은 예와 나쁜 예

```jsx
// ❌ 나쁜 State 설계 — 동기화 지옥
function ShoppingCart() {
  const [items, setItems] = useState([...]);
  const [totalPrice, setTotalPrice] = useState(0);      // 파생 가능!
  const [totalQuantity, setTotalQuantity] = useState(0); // 파생 가능!
  const [isEmpty, setIsEmpty] = useState(true);          // 파생 가능!

  const addItem = (item) => {
    const newItems = [...items, item];
    setItems(newItems);
    // 아래 3개를 모두 수동으로 동기화해야 한다!
    setTotalPrice(newItems.reduce((s, i) => s + i.price * i.qty, 0));
    setTotalQuantity(newItems.reduce((s, i) => s + i.qty, 0));
    setIsEmpty(newItems.length === 0);
    // 하나라도 빠뜨리면 UI 불일치!
  };
}

// ✅ 좋은 State 설계 — 최소 State + 파생 데이터
function ShoppingCart() {
  const [items, setItems] = useState([...]);

  // 파생 데이터 — 항상 items에서 자동 계산
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQuantity = items.reduce((s, i) => s + i.qty, 0);
  const isEmpty = items.length === 0;

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
    // 나머지는 자동으로 최신화됨 — 동기화 코드 없음!
  };
}
```

### 4.4 사례: Stale Closure가 실무에서 발생하는 전형적 패턴

```jsx
// ❌ 채팅 앱에서 "현재 메시지 목록" 기반으로 전송하는 경우
function ChatRoom() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = connectWebSocket();

    socket.onMessage((newMsg) => {
      // messages는 마운트 시점의 빈 배열을 캡처!
      setMessages([...messages, newMsg]);
      // 첫 메시지만 추가되고 나머지는 유실됨
    });

    return () => socket.disconnect();
  }, []);

  return (/* ... */);
}

// ✅ Updater Function으로 해결
function ChatRoom() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = connectWebSocket();

    socket.onMessage((newMsg) => {
      // 클로저에 캡처된 값 대신 최신 State를 기반으로 업데이트
      setMessages(prev => [...prev, newMsg]);
    });

    return () => socket.disconnect();
  }, []);

  return (/* ... */);
}
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 useState, Batching, Stale Closure 동작을 직접 실험할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: Batching 관찰 실험 [Understanding · Analyzing]

**목표:** Batching의 동작을 직접 관찰하고 예측한다.

아래 코드의 각 버튼 클릭 후 `console.log('렌더링')`이 몇 번 출력되는지, 최종 State 값이 무엇인지 **실행 전에 예측**하고 실행 후 비교하라.

```jsx
function BatchTest() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  console.log("렌더링", { a, b, c });

  const test1 = () => {
    setA(1);
    setB(2);
    setC(3);
  };

  const test2 = () => {
    setTimeout(() => {
      setA(10);
      setB(20);
      setC(30);
    }, 0);
  };

  const test3 = () => {
    setA((prev) => prev + 1);
    setA((prev) => prev + 1);
    setA((prev) => prev + 1);
  };

  const test4 = () => {
    setA(a + 1);
    setA(a + 1);
    setA(a + 1);
  };

  return (
    <div>
      <p>
        a={a}, b={b}, c={c}
      </p>
      <button onClick={test1}>test1</button>
      <button onClick={test2}>test2</button>
      <button onClick={test3}>test3</button>
      <button onClick={test4}>test4</button>
    </div>
  );
}
```

**예측 기록표:**

| 테스트                | 렌더링 횟수 | 최종 State    | 근거 |
| --------------------- | ----------- | ------------- | ---- |
| test1 (초기 상태에서) |             | a=?, b=?, c=? |      |
| test2 (초기 상태에서) |             | a=?, b=?, c=? |      |
| test3 (a=0에서)       |             | a=?           |      |
| test4 (a=0에서)       |             | a=?           |      |

---

### 실습 2: 스톱워치 구현 — Stale Closure 디버깅 [Applying · Analyzing]

**목표:** Stale Closure 버그를 식별하고 수정한다.

아래 스톱워치에는 여러 버그가 있다. 모두 찾아서 수정하라.

```jsx
function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    setIsRunning(true);
    setInterval(() => {
      setTime(time + 1); // 🐛 버그 1
    }, 1000);
  };

  const stop = () => {
    setIsRunning(false);
    // 🐛 버그 2: interval이 정리되지 않음
  };

  const reset = () => {
    setTime(0);
    // 🐛 버그 3: running 상태에서 reset하면?
  };

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

**수정 포인트:**

- Stale Closure 해결 (Updater Function)
- interval 참조 저장과 정리 (useRef)
- 시작/정지/초기화 반복 시에도 올바르게 동작하도록

---

### 실습 3: State 설계 리팩토링 [Evaluating]

**목표:** State 설계 원칙 위반을 식별하고 개선한다.

아래 코드에서 불필요한 State, 중복, 모순 가능성을 **모두** 찾고 리팩토링하라.

```jsx
function RegistrationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldCount, setFieldCount] = useState(0);

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setFullName(e.target.value + " " + lastName);
    setFieldCount(fieldCount + 1);
    // ... 나머지 유효성 검사 동기화
  };

  // ... (수많은 동기화 로직)
}
```

**리팩토링 포인트:**

- 파생 데이터 식별 (최소 5개)
- 모순 가능한 State 통합
- 불필요한 State 제거
- 리팩토링 후 코드 작성

---

### 실습 4 (선택): 큐 처리 과정 손으로 추적 [Analyzing]

**목표:** State 업데이트 큐의 처리 과정을 정확히 이해한다.

아래 각 케이스에서 큐의 처리 과정을 단계별로 적고, 최종 count 값을 구하라.

```jsx
// 현재 count = 2

// Case A
setCount(count + 3);
setCount(count + 3);
setCount(count + 3);

// Case B
setCount((prev) => prev + 3);
setCount((prev) => prev + 3);
setCount((prev) => prev + 3);

// Case C
setCount((prev) => prev * 2);
setCount(count + 1);
setCount((prev) => prev + 10);

// Case D
setCount(0);
setCount((prev) => prev + 5);
setCount((prev) => prev * 2);
setCount(1);
```

**기록 형식:**

```
Case A:
  큐: [교체→5, 교체→5, 교체→5]
  처리: 2 → 5 → 5 → 5
  최종: 5
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 6 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. State는 렌더링 간에 유지되는 기억장치이다                  │
│     → 일반 변수: 렌더링마다 초기화, 변경해도 재렌더링 없음     │
│     → useState: React가 값을 보관, setter가 재렌더링 트리거    │
│                                                               │
│  2. State는 스냅샷이다                                       │
│     → 한 렌더링 안에서 State 값은 고정된다                    │
│     → setState 직후에도 "이번 렌더링의 값"은 변하지 않는다     │
│     → 비동기 콜백(setTimeout 등)도 생성 시점의 스냅샷을 캡처   │
│                                                               │
│  3. Batching으로 여러 업데이트가 하나의 렌더링으로 합쳐진다    │
│     → React 18: 모든 상황에서 Automatic Batching              │
│     → 중간 상태를 사용자에게 보여주지 않는다                   │
│                                                               │
│  4. Updater Function으로 이전 값 기반 업데이트를 한다          │
│     → setCount(prev => prev + 1)                             │
│     → 큐에서 순차 처리 → 연속 호출 시 정확한 결과              │
│     → Stale Closure의 주요 해결책                             │
│                                                               │
│  5. Stale Closure는 오래된 스냅샷을 캡처하는 버그이다          │
│     → 타이머, 이벤트 리스너 등 비동기 콜백에서 빈번히 발생      │
│     → Updater Function 또는 useRef로 해결                     │
│                                                               │
│  6. StrictMode 이중 실행은 순수성 검증이다                     │
│     → 개발 모드 전용, 프로덕션에서는 동작하지 않음              │
│     → 이중 실행에서 깨지면 부수 효과가 있다는 신호              │
│                                                               │
│  7. State 설계 4원칙                                          │
│     → 최소한의 State만 선언 (파생 데이터는 계산)               │
│     → 중복 제거 (ID만 저장, 필요할 때 찾기)                    │
│     → 관련 데이터 그룹화 (함께 변하는 것은 함께)               │
│     → 모순 가능 State 제거 (상태 머신 패턴)                    │
│                                                               │
│  8. 객체/배열 State는 Immutable 패턴으로 업데이트한다          │
│     → 직접 수정 금지 (같은 참조 → React가 감지 못함)           │
│     → Spread, map, filter로 새 값 생성                        │
│     → 원본 변경 메서드(push, sort 등) 사용 금지                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | 일반 변수(`let count = 0`)로 화면이 갱신되지 않는 2가지 이유는?                       | Remember   | 3.1         |
| 2   | "State는 스냅샷이다"를 자신의 말로 설명하라                                           | Understand | 3.2         |
| 3   | React 18에서 setTimeout 안의 여러 setState가 1번의 렌더링으로 합쳐지는 이유는?        | Understand | 3.3         |
| 4   | `setCount(count+1)`을 3번 호출 vs `setCount(p=>p+1)`을 3번 호출의 결과 차이와 이유는? | Understand | 3.4         |
| 5   | setInterval 콜백에서 Stale Closure가 발생하는 과정을 단계별로 설명하라                | Analyze    | 3.5         |
| 6   | `useState(() => expensive())`와 `useState(expensive())`의 차이는?                     | Apply      | 3.7         |
| 7   | `fullName`을 State 대신 파생 데이터로 처리해야 하는 이유는?                           | Evaluate   | 3.8         |
| 8   | `user.name = '새이름'; setUser(user);`가 화면을 업데이트하지 않는 이유는?             | Analyze    | 3.9         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. setState는 비동기인가?**

엄밀히 말하면 setState 자체는 비동기 함수가 아니다. Promise를 반환하지 않으며 await할 수 없다. 다만 setState는 **즉시 State를 변경하지 않고 업데이트를 큐에 등록**한다. React가 적절한 시점에 큐를 처리하고 재렌더링을 수행하므로, setState 직후에 새 값을 읽을 수 없다. "비동기적으로 동작한다"는 표현보다 "일괄 처리(Batching)된다"가 더 정확한 설명이다.

**Q2. setState를 연속 호출하면 매번 렌더링되나?**

아니다. React 18의 Automatic Batching 덕분에 이벤트 핸들러, setTimeout, Promise 콜백 등 어디서든 여러 setState 호출은 **한 번의 렌더링으로 합쳐진다.** 각 setState마다 별도의 렌더링이 필요한 경우(극히 드묾)에는 `flushSync`를 사용할 수 있지만, 대부분의 상황에서 권장되지 않는다.

**Q3. 객체 State를 변경할 때 왜 반드시 새 객체를 만들어야 하나?**

React는 State 변경 여부를 **참조(reference) 비교(`Object.is`)** 로 판단한다. 기존 객체의 속성만 변경하면(`user.name = '새이름'`) 객체의 참조는 동일하므로 React는 "변경 없음"으로 판단하고 재렌더링을 생략한다. 새 객체를 만들어야(`{ ...user, name: '새이름' }`) 참조가 달라지고, React가 변경을 감지하여 화면을 업데이트한다.

**Q4. useState와 useReducer 중 어떤 것을 써야 하나?**

State 업데이트 로직이 단순하면 useState가 적합하다. 여러 관련 State가 함께 변경되거나, 업데이트 로직이 복잡한 경우(조건 분기, 여러 액션 타입) useReducer가 더 적합하다. useReducer는 Step 13에서 학습하며, 일반적으로 State 변수가 3개 이상이고 서로 연관되어 있으면 useReducer 전환을 고려한다.

**Q5. 개발 모드에서 컴포넌트가 두 번 실행되는 것은 정상인가?**

정상이다. React의 StrictMode가 의도적으로 컴포넌트를 이중 실행하여 순수성 위반을 감지한다. 프로덕션 빌드에서는 한 번만 실행된다. 이중 실행 시 문제가 발견되면(외부 변수가 2배로 증가, API 호출이 중복 등) 해당 코드에 순수성 위반이 있는 것이므로 수정이 필요하다.

---

## 7. 다음 단계 예고

> **Step 7. Reconciliation과 Key 전략**
>
> - Virtual DOM의 정확한 개념과 실체
> - Diff 알고리즘의 동작 원리 (O(n) 휴리스틱)
> - key가 왜 중요한지, index key의 위험성
> - key를 활용한 컴포넌트 State 리셋 기법
> - 같은 위치 규칙과 컴포넌트 보존

---

## 📚 참고 자료

- [React 공식 문서 — State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [React 공식 문서 — State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [React 공식 문서 — Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React 공식 문서 — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React 공식 문서 — Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [React 공식 문서 — Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- [React 공식 블로그 — Automatic Batching in React 18](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 6 of 42
