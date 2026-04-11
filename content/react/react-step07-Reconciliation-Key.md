# Step 07. Reconciliation과 Key 전략

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| **Remember**   | Reconciliation, Virtual DOM, Diff 알고리즘, key의 정의를 기술할 수 있다  |
| **Understand** | React가 두 트리를 비교하는 O(n) 휴리스틱의 두 가지 가정을 설명할 수 있다 |
| **Understand** | "같은 위치, 같은 타입"이면 컴포넌트가 보존되는 원리를 설명할 수 있다     |
| **Apply**      | 리스트에 올바른 key를 설계하고 적용할 수 있다                            |
| **Analyze**    | index key가 버그를 만드는 구체적 시나리오를 분석할 수 있다               |
| **Evaluate**   | key를 활용한 컴포넌트 State 리셋 기법의 적합성을 판단할 수 있다          |

**전제 지식:**

- Step 4: React Element 객체 구조 (`type`, `props`, `key`), "렌더링 = 함수 실행"
- Step 5: Props, 단방향 데이터 흐름
- Step 6: useState, 재렌더링 트리거, 스냅샷 모델

---

## 1. 서론 — React는 어떻게 "변경된 부분만" 업데이트하는가

### 1.1 트리 비교 알고리즘의 역사적 배경

두 트리 구조의 차이를 찾는 문제(Tree Diff)는 컴퓨터 과학에서 오래된 연구 주제이다. 일반적인 트리 비교 알고리즘의 시간 복잡도는 **O(n^3)** 으로, 1,000개의 노드를 가진 트리를 비교하면 약 10억 번의 연산이 필요하다. 이는 60fps(16ms 이내 처리)를 요구하는 UI 업데이트에는 전혀 사용할 수 없는 수준이다.

React 팀은 2013년 이 문제에 대해 실용적인 접근을 취했다. "모든 경우에 최적의 결과를 보장하는 것"을 포기하고, 대신 **실제 UI 업데이트에서 거의 항상 성립하는 두 가지 가정**을 세워 O(n) 복잡도를 달성했다. 첫째, 타입이 다른 요소는 완전히 다른 트리를 생성한다. 둘째, 개발자가 key를 통해 자식 요소의 안정적 식별을 도울 수 있다. 이 두 가지 휴리스틱은 실무에서 99% 이상의 상황을 정확하게 처리하며, React의 성능을 실용적 수준으로 끌어올렸다.

### 1.2 산업적 가치 — Reconciliation 이해가 실무에서 중요한 이유

Reconciliation과 key에 대한 이해는 React 개발에서 **성능 문제 진단**과 **예상치 못한 버그 방지**의 핵심이다. 실무에서 가장 흔한 문제 중 하나는 리스트를 렌더링할 때 key를 잘못 설계하여 발생하는 "유령 데이터" 버그이다. 예를 들어 채팅 앱에서 상대방을 바꿨는데 이전 대화의 입력값이 남아있거나, 리스트를 정렬했는데 체크박스 상태가 뒤섞이는 문제가 모두 key 설계 오류에서 비롯된다.

또한 "같은 위치, 같은 타입이면 State가 보존된다"는 규칙을 모르면, 컴포넌트의 State가 왜 리셋되지 않는지(또는 왜 의도치 않게 리셋되는지) 이해할 수 없다. 이 규칙을 아는 개발자는 key를 의도적으로 변경하여 폼을 리셋하는 등의 고급 패턴을 활용할 수 있다.

### 1.3 이 Step의 핵심 개념 관계도

```
┌──────────────────────────────────────────────────────────────┐
│              Step 07 핵심 개념 관계도                           │
│                                                               │
│  렌더링 #N의 Element 트리     렌더링 #N+1의 Element 트리      │
│         │                            │                        │
│         └───────── Reconciliation ───┘                        │
│                    (Diff 알고리즘)                             │
│                         │                                     │
│                    두 가지 휴리스틱:                           │
│                    1. 타입 다르면 → 전체 교체 (Unmount+Mount)  │
│                    2. key로 자식 식별 → 이동/삽입/삭제 판단   │
│                         │                                     │
│                    같은 위치 + 같은 타입                       │
│                    → 컴포넌트 보존, Props만 갱신, State 유지  │
│                         │                                     │
│                    key 변경                                   │
│                    → 강제 Unmount + 새로 Mount = State 리셋   │
│                         │                                     │
│                         ▼                                     │
│                    변경 목록 (Changeset)                      │
│                         │                                     │
│                    Commit Phase                               │
│                    → 실제 DOM에 최소 변경만 반영              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 근본 질문

Step 4에서 "렌더링 = 함수 실행"이라는 것을 배웠다. 매 렌더링마다 컴포넌트 함수 전체가 다시 호출되어 **완전히 새로운 React Element 트리**가 만들어진다. 그런데 React는 전체 DOM을 다시 그리지 않고 **변경된 부분만** 효율적으로 업데이트한다. 이것이 어떻게 가능한가?

```
렌더링 #1의 트리         렌더링 #2의 트리

  <div>                    <div>
    <h1>제목</h1>    →       <h1>제목</h1>        ← 변경 없음
    <p>count: 0</p>  →       <p>count: 1</p>      ← 텍스트만 변경
    <button>+1</button>      <button>+1</button>  ← 변경 없음
  </div>                   </div>

  React가 하는 일: <p>의 텍스트만 "0" → "1"로 업데이트
  React가 하지 않는 일: <div>, <h1>, <button>은 DOM에서 건드리지 않음
```

이 과정을 **Reconciliation(재조정)** 이라 하고, 그 핵심에 **Diff 알고리즘**과 **key**가 있다.

### 1.5 이 Step을 학습하면 답할 수 있는 질문들

```
· "Virtual DOM"이란 정확히 무엇인가?
· React는 두 트리를 어떻게 비교하는가?
· 트리 비교의 시간 복잡도가 O(n³)이 아닌 O(n)인 이유는?
· <div>가 <section>으로 바뀌면 React는 어떻게 처리하는가?
· key는 왜 필요한가? 없으면 어떤 문제가 발생하는가?
· index를 key로 사용하면 왜 위험한가?
· key를 바꾸면 왜 컴포넌트가 리셋되는가?
· 같은 위치에서 컴포넌트의 State가 보존되는 조건은?
```

### 1.6 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · Virtual DOM의 정확한 개념                             │
│  · Reconciliation의 동작 원리                            │
│  · Diff 알고리즘의 두 가지 휴리스틱                      │
│  · 같은 위치 규칙과 컴포넌트 보존                        │
│  · key의 역할과 설계 전략                                │
│  · index key의 위험성                                    │
│  · key를 활용한 State 리셋 기법                          │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Fiber Architecture의 내부 구조 (Step 10)             │
│  · Concurrent Rendering (Step 10)                       │
│  · React.memo를 통한 최적화 (Step 14)                   │
│  · 리스트 렌더링 패턴 상세 (Step 9)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어               | 정의                                                                                      | 왜 중요한가                                       |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Virtual DOM**    | React Element 트리의 통칭. 실제 DOM이 아닌, **UI 구조를 서술하는 JavaScript 객체 트리**   | React의 효율적 업데이트 전략의 기반이다           |
| **Reconciliation** | 이전 렌더링의 Element 트리와 새 렌더링의 Element 트리를 **비교하여 차이를 파악**하는 과정 | DOM 조작을 최소화하는 핵심 메커니즘이다           |
| **Diff 알고리즘**  | Reconciliation에서 두 트리를 비교하는 **구체적 알고리즘**. 두 가지 휴리스틱 가정에 기반   | O(n³) → O(n) 복잡도를 달성하는 핵심 전략이다      |
| **key**            | React가 리스트의 각 Element를 **고유하게 식별**하기 위해 사용하는 특수 속성               | 리스트 업데이트 시 올바른 Element 매칭을 보장한다 |
| **Commit Phase**   | Reconciliation 결과를 **실제 DOM에 반영**하는 단계. Render Phase 이후 실행                | 실제 DOM 변경은 이 단계에서만 일어난다            |
| **Unmount**        | 컴포넌트가 DOM에서 제거되는 것. 해당 컴포넌트의 **State가 파괴**된다                      | key 변경이나 type 변경 시 발생한다                |
| **Remount**        | 컴포넌트가 언마운트된 후 새로 마운트되는 것. **새로운 인스턴스**가 생성된다               | State가 초기화되므로 리셋 목적으로 활용 가능하다  |

### 2.2 핵심 용어 심층 해설

#### Virtual DOM

Virtual DOM은 React가 만드는 **React Element 객체 트리의 통칭**이다. "Virtual"이라는 이름이 붙은 이유는 실제 브라우저 DOM이 아니라 JavaScript 객체로 구성된 **가상의 UI 표현**이기 때문이다. Virtual DOM이 별도의 라이브러리나 자료구조가 아니라 Step 4에서 배운 React Element 객체들의 트리라는 점을 이해하는 것이 중요하다.

Virtual DOM의 핵심 가치는 **비교의 효율성**에 있다. 실제 DOM 노드는 수백 개의 속성을 가진 무거운 객체이지만, React Element는 5~6개의 속성만 가진 가벼운 객체이다. 두 개의 가벼운 객체 트리를 비교하여 "어떤 부분이 변경되었는가?"를 파악한 뒤, 실제 DOM에는 변경된 부분만 반영하는 전략이다. 이 전략 덕분에 개발자는 "전체 UI를 다시 그린다"는 선언적 모델로 코드를 작성하면서도 실제로는 최소한의 DOM 조작만 발생한다.

#### Reconciliation (재조정)

Reconciliation은 이전 렌더링의 Element 트리와 새 렌더링의 Element 트리를 **비교하여 차이점을 파악하는 과정**이다. React의 Render Phase에서 수행되며, 이 과정의 결과물은 "DOM에 적용해야 할 변경 목록(Changeset)"이다. 실제 DOM 조작은 이후의 Commit Phase에서 일어난다.

Reconciliation이 중요한 이유는 이것이 React의 **성능과 정확성의 균형점**이기 때문이다. 매 렌더링마다 전체 DOM을 교체하면 코드는 단순하지만 성능이 나쁘다. 반대로 변경된 부분만 정밀하게 추적하려면 O(n^3) 알고리즘이 필요하여 역시 비현실적이다. React의 Reconciliation은 두 가지 휴리스틱 가정으로 O(n)에 "충분히 좋은" 결과를 산출한다.

#### key

key는 React가 리스트의 각 요소를 **고유하게 식별**하기 위해 사용하는 특수 속성이다. key는 Props가 아니며 컴포넌트 내부에서 접근할 수 없다. key의 역할은 Reconciliation 과정에서 "이전 렌더링의 어떤 요소와 새 렌더링의 어떤 요소가 동일한 항목인지"를 React에게 알려주는 것이다.

key가 없으면 React는 자식 리스트를 순서(index)로만 비교하므로, 리스트의 맨 앞에 항목을 추가하면 모든 요소가 "변경된 것"으로 인식되어 불필요한 DOM 조작이 발생한다. 또한 input 같은 State를 가진 컴포넌트에서는 State가 잘못된 항목에 연결되는 심각한 버그가 발생할 수 있다. key는 반드시 **형제 요소 간에 고유**하고, **렌더링 간에 안정적**(동일 데이터에 동일 key)이어야 한다. 데이터베이스 ID나 고유한 비즈니스 식별자가 이상적인 key이다.

### 2.3 Reconciliation의 위치 — 전체 흐름에서 보기

```
Step 6에서 배운 3단계 흐름

  1. Trigger  (setState 호출 등)
       │
       ▼
  2. Render Phase
     ┌─────────────────────────────────┐
     │  컴포넌트 함수 호출              │
     │  → 새 React Element 트리 생성    │
     │  → Reconciliation (Diff) ★      │ ← 이 Step의 주제
     │    이전 트리 vs 새 트리 비교      │
     │    변경 사항 목록 생성            │
     └─────────────────────────────────┘
       │
       ▼
  3. Commit Phase
     ┌─────────────────────────────────┐
     │  변경 사항 목록을 실제 DOM에 적용 │
     │  · 노드 추가/제거/속성 변경      │
     │  · 브라우저가 화면 다시 그림      │
     └─────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 Virtual DOM — 정확한 개념

#### "Virtual DOM"이라는 이름의 오해

"Virtual DOM"은 마치 브라우저의 DOM을 **가상으로 복제한 무언가**처럼 들리지만, 실체는 훨씬 단순하다. Step 4에서 배운 **React Element 트리 그 자체**이다.

```
"Virtual DOM" = React Element로 이루어진 JavaScript 객체 트리

{
  type: 'div',
  props: {
    className: 'app',
    children: [
      { type: 'h1', props: { children: '제목' } },
      { type: 'p',  props: { children: 'count: 0' } }
    ]
  }
}

이것이 "Virtual DOM"이다.
· 실제 DOM 노드가 아니다
· JavaScript의 Plain Object이다
· 생성 비용이 매우 저렴하다 (실제 DOM 노드의 수백 분의 1)
```

#### Virtual DOM 전략의 핵심 아이디어

```
전략의 핵심

  1. UI가 변경되어야 할 때, 실제 DOM을 직접 수정하지 않는다
  2. 대신 새로운 React Element 트리(Virtual DOM)를 생성한다
  3. 이전 트리와 새 트리를 비교하여 "차이점"을 파악한다
  4. 그 차이점만 실제 DOM에 최소한으로 적용한다

왜 이 전략이 유효한가:

  · React Element 생성: 매우 빠르다 (Plain Object 생성)
  · 두 트리 비교: 빠르다 (O(n) 알고리즘)
  · DOM 조작: 느리다 (레이아웃 재계산, 페인트 등)

  → 빠른 연산(Element 생성 + 비교)을 많이 하고
  → 느린 연산(DOM 조작)을 최소화하는 것이 핵심
```

> ⚠️ **중요한 뉘앙스:** Virtual DOM이 항상 직접 DOM 조작보다 빠른 것은 아니다. 비교(Diff) 자체에도 비용이 든다. Virtual DOM의 가치는 "빠름"이 아니라 **"선언적 UI 모델을 유지하면서도 합리적인 성능을 보장"** 하는 것이다. React 공식 문서도 "Virtual DOM"이라는 용어보다 "Reconciliation"을 선호한다.

### 3.2 Diff 알고리즘의 두 가지 휴리스틱

#### 이론적 배경

두 트리의 모든 노드를 완벽하게 비교하여 최소 변경 연산을 찾는 알고리즘은 **O(n³)** 의 시간 복잡도를 가진다. 1000개의 Element가 있다면 10억 번의 비교가 필요하다. 이는 실용적이지 않다.

React는 두 가지 **휴리스틱(경험적 가정)** 을 통해 이를 **O(n)** 으로 줄인다.

```
┌─────────────────────────────────────────────────────────────┐
│  Diff 알고리즘의 두 가지 휴리스틱                             │
│                                                              │
│  가정 1: 타입이 다른 Element는 완전히 다른 트리를 만든다       │
│  ─────────────────────────────────────────────────────────   │
│  · <div>가 <section>으로 바뀌면 하위 트리 전체를 새로 만든다  │
│  · <ComponentA>가 <ComponentB>로 바뀌면 언마운트 후 새로 마운트│
│  · 하위 노드를 하나하나 비교하지 않는다 (핵심 최적화)         │
│                                                              │
│  가정 2: 개발자가 key로 형제 간 Element의 안정적 식별을 제공   │
│  ─────────────────────────────────────────────────────────   │
│  · 같은 key를 가진 Element는 같은 것으로 간주                 │
│  · key가 다르면 다른 Element로 간주                           │
│  · 리스트에서 Element의 순서가 바뀌어도 key로 추적 가능        │
│                                                              │
│  이 두 가정이 틀리는 경우는 실제로 매우 드물다                 │
│  → 극소수의 비효율을 감수하고 O(n) 성능을 달성                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 가정 1: 타입이 다르면 전체 교체

#### 같은 타입의 Element — 속성만 업데이트

```jsx
// 이전 렌더링
<div className="old" title="이전">

// 새 렌더링
<div className="new" title="다음">
```

```
비교 과정:
  type: 'div' === 'div' ✅ 같은 타입
  → DOM 노드를 유지한다 (제거하지 않음)
  → 변경된 속성만 업데이트:
    · className: "old" → "new"
    · title: "이전" → "다음"
  → 자식 Element에 대해 재귀적으로 비교 계속
```

#### 다른 타입의 Element — 전체 언마운트 후 리마운트

```jsx
// 이전 렌더링
<div>
  <Counter />    ← Counter의 State: count = 5
  <p>텍스트</p>
</div>

// 새 렌더링
<section>        ← type이 'div' → 'section'으로 변경!
  <Counter />
  <p>텍스트</p>
</section>
```

```
비교 과정:
  type: 'div' !== 'section' ❌ 다른 타입!

  → React의 결정:
    1. 이전 <div> 트리 전체를 DOM에서 제거 (언마운트)
       · 하위의 Counter도 언마운트 → State(count=5) 파괴!
       · 하위의 <p>도 제거

    2. 새 <section> 트리를 처음부터 생성 (마운트)
       · 새로운 Counter 마운트 → State가 초기값(0)으로 시작
       · 새 <p> 생성

  핵심: 하위 트리가 동일해도, 루트 타입이 다르면 전부 새로 만든다
        Counter의 State가 리셋된다!
```

#### 컴포넌트 타입 변경도 동일한 규칙

```jsx
// 이전 렌더링
<ComponentA />    ← type: ComponentA (함수 참조)

// 새 렌더링
<ComponentB />    ← type: ComponentB (다른 함수 참조)

// ComponentA !== ComponentB → 다른 타입
// → ComponentA 언마운트 (State 파괴)
// → ComponentB 새로 마운트 (새 State)
```

```
시각화: 타입 변경 시 전체 교체

  이전 트리                    새 트리

  { type: 'div' }             { type: 'section' }
    ├── { type: Counter }       ├── { type: Counter }
    │     state: { count: 5 }   │     state: { count: 0 }  ← 리셋!
    └── { type: 'p' }          └── { type: 'p' }
         text: '텍스트'              text: '텍스트'

         ▼ 전체 제거                ▼ 전체 새로 생성
```

### 3.4 같은 위치 규칙 — 컴포넌트 보존과 State 유지

#### "같은 위치, 같은 타입"이면 State가 보존된다

```jsx
function App() {
  const [isRed, setIsRed] = useState(false);

  return (
    <div>
      {/* 이 위치에 항상 Counter가 렌더링된다 */}
      {isRed ? <Counter color="red" /> : <Counter color="blue" />}
      <button onClick={() => setIsRed(!isRed)}>전환</button>
    </div>
  );
}
```

```
isRed=false 일 때:
  <div>
    <Counter color="blue" />    ← 첫 번째 자식 위치, type: Counter
    <button>전환</button>
  </div>

isRed=true 일 때:
  <div>
    <Counter color="red" />     ← 첫 번째 자식 위치, type: Counter
    <button>전환</button>
  </div>

비교:
  위치: 첫 번째 자식 ✅ 같은 위치
  type: Counter === Counter ✅ 같은 타입

  → React의 판단: "같은 Counter 인스턴스이다"
  → Counter의 State가 유지된다! (count가 리셋되지 않음)
  → Props(color)만 업데이트된다
```

> 💡 **핵심:** React는 **JSX에서의 위치(트리에서의 위치)** 와 **type**으로 "같은 컴포넌트인가"를 판단한다. 변수 이름이나 조건 분기는 관계없다. 같은 위치에 같은 type이면 같은 인스턴스로 취급하여 **State를 보존**한다.

#### "같은 위치, 다른 타입"이면 State가 리셋된다

```jsx
function App() {
  const [isInput, setIsInput] = useState(true);

  return (
    <div>
      {
        isInput ? (
          <input placeholder="입력..." /> // type: 'input'
        ) : (
          <textarea placeholder="입력..." />
        ) // type: 'textarea'
      }
      <button onClick={() => setIsInput(!isInput)}>전환</button>
    </div>
  );
}
```

```
비교:
  위치: 첫 번째 자식 ✅ 같은 위치
  type: 'input' !== 'textarea' ❌ 다른 타입!

  → 이전 <input> 언마운트 → 새 <textarea> 마운트
  → 입력했던 내용이 사라진다 (DOM 노드 자체가 교체됨)
```

#### "다른 위치"면 다른 컴포넌트로 취급된다

```jsx
function App() {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div>
      {showHeader && <h1>헤더</h1>}
      <Counter />
      <button onClick={() => setShowHeader(!showHeader)}>헤더 토글</button>
    </div>
  );
}
```

```
showHeader=true 일 때:
  <div>
    <h1>헤더</h1>          ← 첫 번째 자식
    <Counter />             ← 두 번째 자식  ★
    <button>헤더 토글</button>
  </div>

showHeader=false 일 때:
  <div>
    {false}                 ← 첫 번째 자식 (렌더링 안 됨)
    <Counter />             ← 첫 번째(실질적) 자식  ★
    <button>헤더 토글</button>
  </div>

⚠️ Counter의 "위치(인덱스)"가 변경되었다!
  이전: 두 번째 자식
  이후: 첫 번째 자식

  React의 비교:
  · 위치 0: <h1> vs <Counter> → 다른 type! → <h1> 언마운트, <Counter> 새 마운트
  · 위치 1: <Counter> vs <button> → 다른 type! → Counter 언마운트!

  → Counter의 State가 리셋된다!
```

**해결: 위치를 고정하는 방법**

```jsx
// 방법 1: null 대신 같은 타입의 빈 Element 유지 (비권장)
{showHeader ? <h1>헤더</h1> : null}

// 방법 2: CSS로 숨기기 (DOM은 유지)
<h1 style={{ display: showHeader ? 'block' : 'none' }}>헤더</h1>
<Counter />

// 방법 3: key를 사용하여 명시적으로 동일성 표시 (3.6절에서 학습)
```

### 3.5 자식 Element 리스트의 비교 — key가 필요한 이유

#### key 없이 리스트를 비교하면

React는 기본적으로 자식 리스트를 **인덱스(순서)** 로 비교한다.

```jsx
// 이전 렌더링
<ul>
  <li>사과</li>     // 인덱스 0
  <li>바나나</li>   // 인덱스 1
  <li>체리</li>     // 인덱스 2
</ul>

// 새 렌더링 — 맨 앞에 "포도" 추가
<ul>
  <li>포도</li>     // 인덱스 0  ← 새로 추가
  <li>사과</li>     // 인덱스 1
  <li>바나나</li>   // 인덱스 2
  <li>체리</li>     // 인덱스 3
</ul>
```

```
key가 없을 때 React의 비교 (인덱스 기반):

  인덱스 0: <li>사과</li>   vs <li>포도</li>    → 텍스트 변경 "사과"→"포도"
  인덱스 1: <li>바나나</li> vs <li>사과</li>     → 텍스트 변경 "바나나"→"사과"
  인덱스 2: <li>체리</li>   vs <li>바나나</li>   → 텍스트 변경 "체리"→"바나나"
  인덱스 3: (없음)          vs <li>체리</li>     → 새 노드 생성

  결과: 4번의 DOM 조작 (텍스트 변경 3번 + 노드 생성 1번)

  최적의 결과: 맨 앞에 <li>포도</li> 1개만 삽입하면 됨 (1번의 DOM 조작)
  → key가 없으면 React가 최적의 업데이트를 찾지 못한다!
```

#### key가 있으면

```jsx
// 이전 렌더링
<ul>
  <li key="apple">사과</li>
  <li key="banana">바나나</li>
  <li key="cherry">체리</li>
</ul>

// 새 렌더링 — 맨 앞에 "포도" 추가
<ul>
  <li key="grape">포도</li>       ← 새 key
  <li key="apple">사과</li>      ← 기존 key 유지
  <li key="banana">바나나</li>   ← 기존 key 유지
  <li key="cherry">체리</li>     ← 기존 key 유지
</ul>
```

```
key가 있을 때 React의 비교 (key 기반):

  key="grape":  이전에 없음 → 새 노드 생성
  key="apple":  이전에 있음 → 기존 DOM 노드 재사용, 위치만 조정
  key="banana": 이전에 있음 → 기존 DOM 노드 재사용, 위치만 조정
  key="cherry": 이전에 있음 → 기존 DOM 노드 재사용, 위치만 조정

  결과: 1번의 DOM 조작 (새 노드 삽입 1번)
  → key를 통해 React가 "어떤 항목이 추가/제거/이동되었는가"를 정확히 파악
```

```
시각화: key 유무에 따른 비교 전략

  key 없음 (인덱스 기반)          key 있음 (식별자 기반)

  이전     새                    이전         새
  [0] 사과  → [0] 포도 (변경)    apple 사과 → grape 포도 (신규)
  [1] 바나나 → [1] 사과 (변경)    banana 바나나 → apple 사과 (유지)
  [2] 체리  → [2] 바나나 (변경)   cherry 체리 → banana 바나나 (유지)
             → [3] 체리 (생성)                → cherry 체리 (유지)

  DOM 조작: 4번                  DOM 조작: 1번
```

### 3.6 key의 역할과 설계 전략

#### key의 두 가지 역할

```
역할 1: 리스트에서 Element를 고유하게 식별
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 항목의 추가/제거/이동을 정확히 추적
  · 불필요한 DOM 조작 최소화
  · 컴포넌트 State를 올바른 항목에 매칭

역할 2: 컴포넌트의 동일성(identity) 결정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 같은 key → "같은 인스턴스" → State 보존
  · 다른 key → "다른 인스턴스" → State 리셋 (언마운트 + 리마운트)
```

#### 좋은 key의 조건

```
┌──────────────────────────────────────────────────────┐
│  좋은 key의 4가지 조건                                 │
│                                                       │
│  1. 고유성 (Unique)                                   │
│     · 형제 Element들 사이에서 고유해야 한다            │
│     · 전체 앱에서 고유할 필요는 없다                   │
│                                                       │
│  2. 안정성 (Stable)                                   │
│     · 렌더링 간에 변하지 않아야 한다                   │
│     · Math.random()이나 Date.now()는 매번 바뀌므로 ❌  │
│                                                       │
│  3. 예측 가능성 (Predictable)                         │
│     · 같은 데이터에 대해 항상 같은 key를 생성해야 한다  │
│                                                       │
│  4. 데이터에서 유래 (Data-derived)                     │
│     · 서버 DB의 id, UUID, 고유 식별자 등               │
│     · 렌더링과 무관하게 데이터 자체에 존재하는 값       │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### key로 사용하기 좋은 값

```jsx
// ✅ 가장 좋음: 서버/DB에서 제공하는 고유 ID
{
  users.map((user) => <UserCard key={user.id} user={user} />);
}

// ✅ 좋음: 데이터에 내재된 고유 값
{
  emails.map((email) => (
    <EmailItem key={email.address} email={email} />
    // 이메일 주소는 자연적으로 고유하다
  ));
}

// ✅ 괜찮음: 데이터 생성 시점에 할당된 고유 ID
const addTodo = (text) => {
  setTodos((prev) => [
    ...prev,
    { id: crypto.randomUUID(), text, done: false },
    // 생성 시 한 번만 UUID를 할당 → 이후 변하지 않음
  ]);
};

// ❌ 위험: 렌더링마다 바뀌는 값
{
  items.map((item) => (
    <Item key={Math.random()} item={item} />
    // 매 렌더링마다 key가 바뀜 → 매번 언마운트/리마운트!
  ));
}

// ⚠️ 조건부 허용: 인덱스 (아래 3.7절에서 상세 분석)
{
  items.map((item, index) => <Item key={index} item={item} />);
}
```

#### key의 스코프

```jsx
// key는 형제(siblings) 사이에서만 고유하면 된다
function App() {
  return (
    <div>
      {/* 이 리스트 안에서 key가 고유하면 됨 */}
      <ul>
        {todosA.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>

      {/* 다른 리스트에서 같은 key 값을 써도 무관 */}
      <ul>
        {todosB.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.7 index를 key로 사용하면 안 되는 이유

#### 안전한 경우와 위험한 경우

```
index key가 안전한 3가지 조건 (모두 충족해야 함):

  1. 리스트가 정적이다 (항목이 추가/제거/재정렬되지 않음)
  2. 리스트 항목에 고유 ID가 없다
  3. 리스트 항목에 State가 없다 (순수 표시용)

  위 3가지가 모두 참이면 index key를 사용해도 된다.
  하나라도 거짓이면 고유 ID를 사용해야 한다.
```

#### index key가 버그를 만드는 시나리오

```jsx
// ❌ 위험한 예: input이 있는 리스트에서 항목 추가/제거
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "React" },
    { id: 2, text: "Props" },
    { id: 3, text: "State" },
  ]);

  const addToTop = () => {
    setTodos([{ id: Date.now(), text: "새 항목" }, ...todos]);
  };

  return (
    <div>
      <button onClick={addToTop}>맨 위에 추가</button>
      <ul>
        {todos.map((todo, index) => (
          // ❌ index를 key로 사용
          <li key={index}>
            <input defaultValue={todo.text} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```
"맨 위에 추가" 클릭 전:
  key=0  <input defaultValue="React" />   ← 사용자가 "React 공부" 입력함
  key=1  <input defaultValue="Props" />
  key=2  <input defaultValue="State" />

"맨 위에 추가" 클릭 후:
  key=0  <input defaultValue="새 항목" />  ← React: "key=0은 기존 것, Props만 변경"
  key=1  <input defaultValue="React" />    ← DOM 노드는 재사용!
  key=2  <input defaultValue="Props" />
  key=3  <input defaultValue="State" />    ← 새로 생성

결과:
  · key=0의 DOM <input>은 그대로 유지된다
  · defaultValue는 DOM에 처음 한 번만 적용된다
  · 사용자가 입력한 "React 공부"가 "새 항목" 행에 표시된다!
  · 입력값과 데이터가 뒤섞이는 버그 발생!


올바른 key (고유 ID) 사용 시:
  이전: key=1 "React", key=2 "Props", key=3 "State"
  이후: key=999 "새 항목", key=1 "React", key=2 "Props", key=3 "State"

  · key=999는 새로운 key → 새 DOM 생성
  · key=1, 2, 3은 기존 key → DOM 노드 재사용, 위치만 이동
  · 입력값이 올바르게 유지된다!
```

```
시각화: index key vs 고유 key

  index key 사용:                    고유 key 사용:

  이전       새                      이전            새
  [0]=React  → [0]=새항목            id:1=React  → id:999=새항목 (신규)
  [1]=Props  → [1]=React             id:2=Props  → id:1=React (유지!)
  [2]=State  → [2]=Props             id:3=State  → id:2=Props (유지!)
               [3]=State (신규)                    id:3=State (유지!)

  DOM 노드 재사용 방식이 완전히 다르다
  → index key는 "위치"로, 고유 key는 "데이터"로 매칭한다
```

### 3.8 key를 활용한 컴포넌트 State 리셋

#### 원리

key가 변경되면 React는 해당 컴포넌트를 **완전히 다른 인스턴스**로 취급한다. 이전 인스턴스를 언마운트(State 파괴)하고 새 인스턴스를 마운트(State 초기화)한다.

```jsx
// 사용자가 선택한 프로필을 편집하는 폼
function App() {
  const [selectedUserId, setSelectedUserId] = useState(1);
  const users = [
    { id: 1, name: "홍길동" },
    { id: 2, name: "김철수" },
    { id: 3, name: "박영희" },
  ];

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div>
      {users.map((u) => (
        <button key={u.id} onClick={() => setSelectedUserId(u.id)}>
          {u.name}
        </button>
      ))}

      {/* ❌ key 없음 — 사용자를 전환해도 EditForm의 State가 유지됨
          → 이전 사용자의 입력값이 남아있는 버그 */}
      <EditForm user={selectedUser} />

      {/* ✅ key로 사용자 ID 지정 — 사용자 전환 시 폼이 초기화됨 */}
      <EditForm key={selectedUserId} user={selectedUser} />
    </div>
  );
}

function EditForm({ user }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState("");

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
      />
    </form>
  );
}
```

```
key 없이 사용자를 전환하면:

  [선택: 홍길동] EditForm  State: { name: '홍길동 수정', email: 'hong@...' }
  [선택: 김철수] EditForm  State: { name: '홍길동 수정', email: 'hong@...' }
                           ↑ 같은 위치, 같은 type → State 보존됨!
                           → 이전 사용자의 입력값이 그대로 남아있다


key={selectedUserId}로 사용자를 전환하면:

  [선택: 홍길동] EditForm key=1  State: { name: '홍길동 수정', email: 'hong@...' }
  [선택: 김철수] EditForm key=2  → key 변경! → 이전 key=1 언마운트, key=2 새로 마운트
                                 State: { name: '김철수', email: '' }
                                 ↑ 깨끗한 초기 State!
```

#### key 리셋 패턴의 활용 시나리오

```
key를 활용한 State 리셋이 유용한 경우:

  1. 탭/프로필 전환 시 폼 초기화
     <EditForm key={selectedTabId} ... />

  2. 라우트 파라미터 변경 시 페이지 State 초기화
     <ProductPage key={productId} ... />

  3. 채팅 대화 상대 변경 시 입력 State 초기화
     <ChatInput key={conversationId} ... />

  4. 에러 발생 시 컴포넌트 완전 리셋
     <ProblematicComponent key={resetKey} ... />
```

### 3.9 Reconciliation의 재귀적 처리

#### 전체 과정 시각화

```
이전 트리                           새 트리

{ type: 'div', className: 'app' }   { type: 'div', className: 'app' }
  ├── { type: Header }                ├── { type: Header }
  │     └── { type: 'h1' }            │     └── { type: 'h1' }
  │           text: 'v1'               │           text: 'v2'           ★ 변경
  ├── { type: TodoList }               ├── { type: TodoList }
  │     ├── { key: 1, type: Item }     │     ├── { key: 1, type: Item }
  │     │     text: 'React'            │     │     text: 'React'
  │     ├── { key: 2, type: Item }     │     ├── { key: 3, type: Item } ★ 새 항목
  │     │     text: 'Props'            │     │     text: 'Key'
  │     └── { key: 3, type: Item }     │     ├── { key: 2, type: Item }
  │           text: 'Key'              │     │     text: 'Props'
  │                                    │     └── { key: 4, type: Item } ★ 새 항목
  │                                    │           text: 'Form'
  └── { type: Footer }                └── { type: Footer }


Reconciliation 과정:

  1. 루트 <div>: type 동일 → 유지, className 동일 → 변경 없음

  2. Header: type 동일 → 유지
     2.1. <h1>: type 동일 → 유지, text 'v1'→'v2' → 텍스트 업데이트 ★

  3. TodoList: type 동일 → 유지
     3.1. key=1: 이전에 있음 → 유지, text 동일 → 변경 없음
     3.2. key=3: 이전에 있음 → 유지, 위치 변경 → DOM 이동
     3.3. key=2: 이전에 있음 → 유지, 위치 변경 → DOM 이동
     3.4. key=4: 이전에 없음 → 새로 생성 ★

  4. Footer: type 동일 → 유지, 변경 없음

실제 DOM 조작:
  · <h1>의 textContent 변경 (1회)
  · key=3, key=2의 DOM 노드 위치 이동 (2회)
  · key=4의 DOM 노드 새로 생성 및 삽입 (1회)
  → 총 4회의 DOM 조작 (전체 트리 재생성 대비 극히 적음)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: key 부재로 인한 애니메이션 깨짐

```jsx
// ❌ index key로 항목을 제거하면 "마지막 항목"에서 애니메이션이 발생
function AnimatedList() {
  const [items, setItems] = useState(["A", "B", "C", "D"]);

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ul>
      {items.map((item, index) => (
        // ❌ index key
        <li key={index} className="fade-in">
          {item}
          <button onClick={() => removeItem(index)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}
```

```
'B'를 삭제할 때:

  이전:  [0]='A'  [1]='B'  [2]='C'  [3]='D'
  이후:  [0]='A'  [1]='C'  [2]='D'

  index key 비교:
    key=0: 'A' → 'A' (변경 없음)
    key=1: 'B' → 'C' (텍스트 변경)     ← B의 DOM에 C를 넣음!
    key=2: 'C' → 'D' (텍스트 변경)     ← C의 DOM에 D를 넣음!
    key=3: 'D' → (없음) (제거)         ← D의 DOM이 제거됨

  결과: 'B'를 삭제했는데 화면에서는 'D'가 사라지는 것처럼 보임
        삭제 애니메이션이 'D' 위치에서 실행됨!
```

### 4.2 사례: 타입 변경이 성능에 미치는 영향

```jsx
// ❌ 비효율적: 조건에 따라 컨테이너 타입을 변경
function Content({ isArticle }) {
  return isArticle ? (
    <article>
      <HeavyComponent />
    </article> // type: 'article'
  ) : (
    <section>
      <HeavyComponent />
    </section>
  ); // type: 'section'
}

// isArticle이 바뀔 때마다:
// article 전체 언마운트 → section 전체 새로 마운트
// HeavyComponent도 리마운트됨! (불필요한 비용)

// ✅ 효율적: 동적 속성으로 처리하거나 CSS 클래스 사용
function Content({ isArticle }) {
  const Tag = isArticle ? "article" : "section";
  return (
    <Tag>
      <HeavyComponent />
    </Tag>
  );
}

// ⚠️ 이것도 type이 바뀌므로 리마운트가 발생한다!
// 정말 리마운트를 피하고 싶다면:

function Content({ isArticle }) {
  return (
    <div className={isArticle ? "article-style" : "section-style"}>
      <HeavyComponent />
    </div>
  );
  // type이 항상 'div'이므로 HeavyComponent의 State가 보존됨
}
```

### 4.3 사례: key를 활용한 "폼 리셋" 실무 패턴

```jsx
// 고객 지원 채팅 — 대화 상대 변경 시 입력 리셋
function SupportChat() {
  const [activeTicket, setActiveTicket] = useState(tickets[0]);

  return (
    <div className="chat-layout">
      <TicketList
        tickets={tickets}
        activeId={activeTicket.id}
        onSelect={setActiveTicket}
      />

      {/* key={activeTicket.id}로 대화 상대 변경 시 완전 초기화 */}
      <ChatPanel key={activeTicket.id} ticket={activeTicket} />
    </div>
  );
}

function ChatPanel({ ticket }) {
  const [message, setMessage] = useState(""); // 전환 시 초기화됨
  const [attachments, setAttachments] = useState([]); // 전환 시 초기화됨

  return (
    <div>
      <h2>{ticket.customerName}님과의 대화</h2>
      <MessageList ticketId={ticket.id} />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지 입력..."
      />
    </div>
  );
}
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 key 변경에 따른 컴포넌트 보존/리셋 동작과 리스트 렌더링을 직접 실험할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: Diff 알고리즘 손으로 추적 [Understanding · Applying]

**목표:** Reconciliation의 비교 과정을 직접 추적하여 내면화한다.

아래 이전 트리와 새 트리를 비교하여, React가 수행할 **구체적인 DOM 조작 목록**을 작성하라.

```jsx
// 이전 렌더링
<div className="container">
  <h1>할 일 목록</h1>
  <ul>
    <li key="a">운동하기</li>
    <li key="b">독서하기</li>
    <li key="c">코딩하기</li>
  </ul>
  <p>총 3개</p>
</div>

// 새 렌더링
<div className="container active">
  <h1>할 일 목록</h1>
  <ul>
    <li key="d">영어 공부</li>
    <li key="a">운동하기</li>
    <li key="c">코딩하기</li>
  </ul>
  <p>총 3개</p>
</div>
```

**작성 형식:**

```
1. <div>: className "container" → "container active" (속성 변경)
2. <h1>: 변경 없음
3. <ul> 자식 비교:
   - key="d": ...
   - key="a": ...
   - key="b": ...
   - key="c": ...
4. <p>: ...
```

---

### 실습 2: index key 버그 재현과 수정 [Analyzing]

**목표:** index key가 만드는 버그를 직접 체험하고 수정한다.

아래 코드를 실행한 후 다음을 수행하라:

```jsx
function BuggyList() {
  const [items, setItems] = useState([
    { id: 1, label: "항목 A" },
    { id: 2, label: "항목 B" },
    { id: 3, label: "항목 C" },
  ]);

  const addToTop = () => {
    setItems((prev) => [
      {
        id: Date.now(),
        label: `항목 ${String.fromCharCode(65 + prev.length)}`,
      },
      ...prev,
    ]);
  };

  const removeFirst = () => {
    setItems((prev) => prev.slice(1));
  };

  return (
    <div>
      <button onClick={addToTop}>맨 위에 추가</button>
      <button onClick={removeFirst}>첫 번째 삭제</button>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {" "}
            {/* ← 이것을 key={item.id}로 바꿔서 비교 */}
            <span>{item.label}</span>
            <input defaultValue={item.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**실험 순서:**

1. 각 input에 고유한 텍스트를 직접 타이핑한다 (예: "A 수정", "B 수정", "C 수정")
2. "맨 위에 추가"를 클릭한다
3. input의 내용이 어떻게 되었는지 관찰한다
4. `key={index}`를 `key={item.id}`로 변경하고 같은 실험을 반복한다
5. 차이를 분석하여 보고서를 작성한다

---

### 실습 3: 같은 위치 규칙 실험 [Analyzing · Evaluating]

**목표:** "같은 위치, 같은 타입"이 State 보존에 미치는 영향을 실험한다.

아래 4가지 변형을 각각 실행하고, Counter의 State(count)가 보존되는지 리셋되는지 예측한 후 확인하라.

```jsx
function Counter({ label }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>
        {label}: {count}
      </p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

// 변형 A: 같은 위치, 같은 타입, Props만 변경
function AppA() {
  const [isA, setIsA] = useState(true);
  return (
    <div>
      {isA ? <Counter label="A" /> : <Counter label="B" />}
      <button onClick={() => setIsA(!isA)}>전환</button>
    </div>
  );
}

// 변형 B: 같은 위치, 다른 타입
function AppB() {
  const [isCounter, setIsCounter] = useState(true);
  return (
    <div>
      {isCounter ? <Counter label="카운터" /> : <p>텍스트</p>}
      <button onClick={() => setIsCounter(!isCounter)}>전환</button>
    </div>
  );
}

// 변형 C: key를 부여하여 강제 리셋
function AppC() {
  const [isA, setIsA] = useState(true);
  return (
    <div>
      {isA ? <Counter key="a" label="A" /> : <Counter key="b" label="B" />}
      <button onClick={() => setIsA(!isA)}>전환</button>
    </div>
  );
}

// 변형 D: 조건에 따라 위치가 변경됨
function AppD() {
  const [showExtra, setShowExtra] = useState(false);
  return (
    <div>
      {showExtra && <p>추가 텍스트</p>}
      <Counter label="메인" />
      <button onClick={() => setShowExtra(!showExtra)}>추가 텍스트 토글</button>
    </div>
  );
}
```

**예측 기록표:**

| 변형 | count를 5로 올린 후 전환 | State 보존/리셋? | 근거 |
| ---- | ------------------------ | ---------------- | ---- |
| A    |                          | 예측:            |      |
| B    |                          | 예측:            |      |
| C    |                          | 예측:            |      |
| D    |                          | 예측:            |      |

---

### 실습 4 (선택): key 리셋 패턴 구현 [Applying · Creating]

**목표:** key를 활용하여 컴포넌트 State를 의도적으로 리셋하는 패턴을 구현한다.

**탭 기반 메모장**을 만든다:

```
요구사항:
  · 3개의 탭 (업무, 개인, 아이디어)
  · 각 탭에 독립적인 텍스트 입력 영역
  · 탭 전환 시 이전 탭의 입력 내용이 사라져야 함 (초기화)
  · key 리셋 패턴 활용

보너스:
  · 추가 요구사항: 탭 전환 시 내용을 "유지"하고 싶다면 어떻게 해야 하는가?
    (힌트: State를 Lifting Up하거나, 부모에서 각 탭의 데이터를 별도로 관리)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 7 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Virtual DOM = React Element 트리 (JavaScript 객체)        │
│     → 실제 DOM이 아닌, UI를 서술하는 가벼운 객체 트리          │
│     → 생성이 저렴하므로 매 렌더링마다 새로 만들어도 부담 없음   │
│                                                               │
│  2. Reconciliation = 이전 트리와 새 트리를 비교하는 과정       │
│     → 변경된 부분만 파악하여 최소한의 DOM 조작으로 반영         │
│     → O(n) 복잡도를 위한 두 가지 휴리스틱                     │
│                                                               │
│  3. 가정 1: 타입이 다르면 전체 교체한다                        │
│     → <div> → <section>: 하위 트리 전부 언마운트/리마운트      │
│     → 자식 컴포넌트의 State도 모두 파괴된다                    │
│                                                               │
│  4. 가정 2: key로 형제 간 Element를 식별한다                   │
│     → 같은 key = 같은 항목 → DOM 노드 재사용                  │
│     → 다른 key = 다른 항목 → 생성/제거 처리                   │
│                                                               │
│  5. "같은 위치 + 같은 타입" = State 보존                      │
│     → React는 트리 위치와 type으로 컴포넌트 동일성을 판단      │
│     → 같으면 인스턴스 유지 (State 보존)                       │
│     → 다르면 인스턴스 교체 (State 리셋)                       │
│                                                               │
│  6. key는 고유하고 안정적인 데이터 기반 값이어야 한다           │
│     → DB id, UUID 등이 이상적                                 │
│     → index key: 정적+상태없는 리스트에서만 안전               │
│     → Math.random(): 절대 사용 금지                           │
│                                                               │
│  7. key 변경으로 컴포넌트 State를 의도적으로 리셋할 수 있다    │
│     → <EditForm key={userId} />                               │
│     → 폼 초기화, 탭 전환, 대화 상대 변경 등에 활용             │
│                                                               │
│  8. index key의 위험성을 인식한다                              │
│     → 항목 추가/제거/재정렬 시 DOM과 데이터가 불일치           │
│     → input, 애니메이션, 컴포넌트 State에서 버그 발생          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                              | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | "Virtual DOM"의 실체를 한 문장으로 설명하라                                       | Remember   | 3.1         |
| 2   | Diff 알고리즘이 O(n)을 달성하기 위한 두 가지 가정은?                              | Remember   | 3.2         |
| 3   | `<div>`가 `<section>`으로 바뀌면 하위 컴포넌트의 State는 어떻게 되는가?           | Understand | 3.3         |
| 4   | 같은 위치에 같은 타입의 컴포넌트가 있으면 Props만 바꿔도 State가 유지되는 이유는? | Understand | 3.4         |
| 5   | key가 없는 리스트에서 맨 앞에 항목을 추가하면 왜 비효율적인가?                    | Understand | 3.5         |
| 6   | index key가 안전한 3가지 조건을 나열하라                                          | Apply      | 3.7         |
| 7   | `<EditForm key={userId} />`에서 userId가 변경되면 무슨 일이 일어나는가?           | Apply      | 3.8         |
| 8   | input이 있는 리스트에서 index key가 만드는 구체적 버그를 설명하라                 | Analyze    | 3.7         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. Virtual DOM이 실제 DOM보다 항상 빠른가?**

아니다. Virtual DOM 자체가 빠른 것이 아니라, "선언적 프로그래밍 모델을 유지하면서 충분히 빠른 성능을 달성"하는 것이 Virtual DOM의 가치이다. 극도로 최적화된 직접 DOM 조작은 Virtual DOM보다 빠를 수 있다. Svelte 같은 프레임워크는 Virtual DOM 없이 컴파일 타임에 변경 추적 코드를 생성하여 좋은 성능을 달성한다. Virtual DOM은 "개발자 경험과 성능의 균형점"으로 이해해야 한다.

**Q2. key로 Math.random()이나 Date.now()를 사용하면 안 되나?**

절대 안 된다. key는 렌더링 간에 **안정적**이어야 한다. Math.random()은 매 렌더링마다 새 값을 생성하므로 React는 모든 항목이 "새로운 것"으로 판단하여 전체 리스트를 Unmount하고 다시 Mount한다. 이는 성능 저하뿐 아니라 모든 항목의 State(입력값, 포커스 등)가 매 렌더링마다 리셋되는 심각한 버그를 만든다.

**Q3. index를 key로 써도 되는 경우는 있나?**

세 가지 조건을 **모두** 만족하면 안전하다. (1) 리스트 항목이 재정렬, 삽입, 삭제되지 않는다. (2) 리스트 항목에 자체 State가 없다(input, checkbox 등이 없다). (3) 리스트가 정적이거나 추가만 된다(맨 뒤에만 추가). 하나라도 해당되지 않으면 고유 ID를 key로 사용해야 한다.

**Q4. key를 변경하면 왜 컴포넌트 State가 리셋되나?**

React는 key가 변경되면 "이전 컴포넌트와 새 컴포넌트는 다른 항목"으로 판단한다. 이전 컴포넌트를 Unmount(State 파괴)하고 새 컴포넌트를 Mount(State 초기화)한다. 이 동작을 의도적으로 활용하면, 사용자 선택이 변경될 때 폼을 리셋하는 등의 패턴을 `<EditForm key={selectedUserId} />`처럼 간결하게 구현할 수 있다.

**Q5. Reconciliation과 Fiber는 같은 것인가?**

아니다. Reconciliation은 "두 트리를 비교하여 차이를 파악하는 과정"이라는 **개념**이고, Fiber는 React 16에서 도입된 Reconciliation의 **구현체(아키텍처)**이다. Fiber 이전에도 Reconciliation은 존재했지만(Stack Reconciler), Fiber는 작업을 작은 단위로 쪼개어 중단/재개할 수 있는 구조를 도입했다. Fiber Architecture는 Step 10에서 상세히 학습한다.

---

## 7. 다음 단계 예고

> **Step 8. Form과 Synthetic Event 시스템**
>
> - Controlled vs Uncontrolled 컴포넌트의 차이와 선택 기준
> - React의 Synthetic Event 시스템 구조
> - Event Delegation과 이벤트 버블링
> - 폼 요소별(input, select, textarea, checkbox) 처리 패턴
> - 폼 제출(submit)과 기본 동작 방지

---

## 📚 참고 자료

- [React 공식 문서 — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [React 공식 문서 — Rendering Lists (Key)](https://react.dev/learn/rendering-a-list)
- [React 공식 문서 — Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree)
- [React 이전 문서 — Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)
- [React GitHub — Fiber Reconciler 설계 문서](https://github.com/acdlite/react-fiber-architecture)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 7 of 42
