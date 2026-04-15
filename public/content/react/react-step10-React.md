# Step 10. React 내부 구조 심층 분석

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계 — **Phase 1 마무리**

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Remember**   | Fiber, Work Unit, Render Phase, Commit Phase, Concurrent Rendering의 정의를 기술할 수 있다 |
| **Understand** | Fiber Architecture가 기존 Stack Reconciler를 대체한 이유를 설명할 수 있다                  |
| **Understand** | Render Phase와 Commit Phase의 역할 차이를 설명할 수 있다                                   |
| **Analyze**    | Concurrent Rendering이 사용자 경험에 미치는 영향을 분석할 수 있다                          |
| **Analyze**    | React 19의 자동 최적화가 기존 수동 최적화 패턴을 어떻게 변화시키는지 분석할 수 있다        |
| **Evaluate**   | Phase 1 전체를 통합하여 React의 렌더링 파이프라인을 종합적으로 평가할 수 있다              |

**전제 지식:**

- Step 4: React Element, "렌더링 = 함수 실행", ReactDOM
- Step 6: useState, Batching, 재렌더링 트리거
- Step 7: Reconciliation, Diff 알고리즘, key

**이 Step의 성격:**

```
이 Step은 React의 "내부 엔진"을 이론적으로 탐구한다.
일상적인 React 개발에서 Fiber를 직접 다룰 일은 없지만,
내부 동작을 이해하면 다음과 같은 이점이 있다:

  · 성능 문제를 만났을 때 "왜 느린가"를 추론할 수 있다
  · useTransition, useDeferredValue 같은 Concurrent API의 원리를 이해할 수 있다
  · React의 설계 결정(왜 이렇게 만들었는가)을 납득할 수 있다
  · 새로운 React 버전의 변경 사항을 빠르게 이해할 수 있다
```

---

## 1. 서론 — React의 엔진을 들여다보다

### 1.1 UI 렌더링 엔진의 역사적 진화

브라우저의 렌더링 엔진은 HTML을 파싱하여 DOM 트리를 구성하고, CSS를 적용하여 화면을 그리는 **동기적(Synchronous)** 파이프라인이다. 이 구조에서 JavaScript가 메인 스레드를 오래 점유하면 브라우저는 화면 갱신, 사용자 입력 처리 등을 할 수 없어 UI가 "멈추는" 현상(jank)이 발생한다. 60fps를 유지하려면 각 프레임을 16ms 이내에 처리해야 하므로, JavaScript 실행 시간은 매우 제한적이다.

React의 초기 버전(2013~2016)은 **Stack Reconciler**를 사용했다. 컴포넌트 트리를 재귀적으로 순회하며 동기적으로 처리했기 때문에, 트리가 크면 하나의 렌더링이 수십~수백 밀리초 동안 메인 스레드를 독점했다. 이 문제를 해결하기 위해 React 팀은 2017년 **Fiber Architecture**를 도입했다. Fiber는 렌더링 작업을 작은 단위(Work Unit)로 쪼개어, 브라우저가 프레임 사이에 다른 작업을 처리할 수 있게 한다.

이 진화는 단순한 성능 개선이 아니라, React의 **설계 패러다임 전환**이었다. Fiber를 기반으로 React 18(2022)의 Concurrent Rendering, React 19(2024)의 자동 최적화(React Compiler)가 가능해졌다. 현재 React의 모든 고급 기능(useTransition, Suspense, Server Components)은 Fiber Architecture 위에 구축되어 있다.

### 1.2 산업적 가치 — React 내부 구조 이해가 시니어 역량인 이유

React의 내부 구조를 이해하는 것은 **주니어와 시니어를 구분하는 핵심 역량** 중 하나이다. 일상적인 개발에서 Fiber를 직접 다룰 일은 없지만, 성능 문제를 진단할 때 "왜 이 컴포넌트가 느린가?", "왜 useTransition이 효과적인가?", "왜 Hook을 조건문 안에서 호출하면 안 되는가?" 같은 질문에 답하려면 내부 동작의 이해가 필수적이다.

또한 React는 빠르게 진화하는 라이브러리이다. React 18의 Concurrent 기능, React 19의 Server Actions과 React Compiler 등 새로운 기능이 지속적으로 추가된다. 내부 아키텍처를 이해하면 이러한 변경이 "왜 도입되었고, 어떤 문제를 해결하는지"를 빠르게 파악하여 기술 변화에 유연하게 대응할 수 있다.

### 1.3 이 Step의 핵심 개념 관계도

![step10 01 step 10 핵심 개념 관계도](/developer-open-book/diagrams/react-step10-01-step-10-핵심-개념-관계도.svg)

### 1.4 왜 내부 구조를 알아야 하는가

Step 4~9에서 React의 핵심 개념(JSX, Props, State, Reconciliation, Key, Form, 리스트)을 학습했다. 이 개념들은 **"무엇이 일어나는가"** 를 설명한다. 이 Step은 **"어떻게 일어나는가"** 를 탐구한다.

```
지금까지 배운 것 (What):
  · 렌더링 = 함수 실행
  · State 변경 → 재렌더링
  · Reconciliation으로 변경분 파악
  · 변경분만 DOM에 반영

이 Step에서 배우는 것 (How):
  · React가 "함수 실행"을 어떤 구조로 스케줄링하는가 (Fiber)
  · "변경분 파악"이 구체적으로 어떤 단계로 이루어지는가 (Render/Commit)
  · 왜 React는 렌더링을 "중단"하고 "재개"할 수 있는가 (Concurrent)
  · React 19는 어떤 방향으로 진화하고 있는가 (Compiler, 자동 최적화)
```

### 1.5 이 Step에서 다루는 범위

![step10 02 다루는 것](/developer-open-book/diagrams/react-step10-02-다루는-것.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                     | 정의                                                                                                                        | 왜 중요한가                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Fiber**                | React 16에서 도입된 **새로운 Reconciliation 엔진**. 또한 각 컴포넌트 인스턴스를 나타내는 **작업 단위(Work Unit) 객체**      | 렌더링을 중단·재개할 수 있게 하여 Concurrent Rendering의 기반이 된다      |
| **Fiber Node**           | 컴포넌트/DOM 요소 하나를 나타내는 **JavaScript 객체**. React Element와 1:1 대응하지만 **상태(State, Effect 등)를 보관**한다 | useState의 값이 실제로 저장되는 곳이다                                    |
| **Work Unit**            | Fiber 트리에서 처리해야 할 **하나의 작업 단위**. 하나의 Fiber 노드를 처리하는 것에 해당                                     | 렌더링을 잘게 나누어 중단·재개를 가능하게 한다                            |
| **Render Phase**         | 컴포넌트 함수를 호출하여 새 트리를 생성하고 이전 트리와 **비교(Diff)**하는 단계. **순수해야 하며, 부수 효과가 없어야** 한다 | DOM을 건드리지 않으므로 중단·재개가 가능하다                              |
| **Commit Phase**         | Render Phase에서 파악된 변경사항을 **실제 DOM에 반영**하는 단계. **동기적으로 한 번에 실행**된다                            | 사용자에게 불완전한 UI를 보여주지 않기 위해 중단 불가능하다               |
| **Concurrent Rendering** | 렌더링 작업을 **잘게 나누어 중단·재개**하고, **여러 렌더링의 우선순위를 조정**할 수 있는 능력                               | 대규모 업데이트 중에도 사용자 입력에 즉시 반응할 수 있게 한다             |
| **Time Slicing**         | 긴 렌더링 작업을 **작은 시간 조각(slice)으로 나누어** 브라우저가 사이사이에 다른 작업을 처리할 수 있게 하는 기법            | 메인 스레드 점유를 방지하여 UI가 멈추지 않게 한다                         |
| **Priority Scheduling**  | 사용자 입력 같은 긴급한 업데이트에 **높은 우선순위**를, 데이터 패칭 같은 업데이트에 **낮은 우선순위**를 부여하는 것         | 중요한 상호작용을 먼저 처리하여 체감 성능을 향상시킨다                    |
| **React Compiler**       | 빌드 타임에 React 코드를 분석하여 **useMemo, useCallback 등을 자동으로 삽입**하는 도구 (구 React Forget)                    | 수동 최적화의 부담을 줄이고 기본 성능을 향상시킨다                        |
| **Double Buffering**     | Fiber에서 **현재 트리(current)와 작업 중 트리(workInProgress)** 두 개를 유지하는 전략                                       | 작업 중 트리를 완성한 뒤 한 번에 교체함으로써 불완전한 UI 노출을 방지한다 |

### 2.2 핵심 용어 심층 해설

#### Fiber와 Fiber Node

Fiber는 두 가지 의미로 사용된다. 넓은 의미에서 Fiber는 React 16에서 도입된 **새로운 Reconciliation 아키텍처 전체**를 가리킨다. 좁은 의미에서 Fiber Node는 **컴포넌트 또는 DOM 요소 하나를 나타내는 JavaScript 객체**이다. React Element가 "이번 렌더링에서 UI가 어떠해야 하는가"를 서술하는 일회성 객체라면, Fiber Node는 "이 컴포넌트의 현재 상태, Hook 목록, 부수 효과 정보"를 **지속적으로 보관**하는 객체이다.

`useState`로 선언한 State 값이 실제로 저장되는 곳이 바로 이 Fiber Node이다. 컴포넌트 함수가 매 렌더링마다 새로 실행되어도 State 값이 유지되는 이유는, React가 Fiber Node의 Hook 연결 리스트에서 이전 값을 읽어 제공하기 때문이다. Hook을 조건문 안에서 호출하면 안 되는 이유도 여기에 있다 -- React는 Hook 호출 순서(인덱스)로 Fiber Node의 Hook 리스트를 매칭하므로, 순서가 바뀌면 잘못된 값이 반환된다.

#### Render Phase와 Commit Phase

React의 화면 업데이트는 **두 단계**로 나뉜다. Render Phase에서 컴포넌트 함수를 호출하고 이전 트리와 비교(Diff)하여 "무엇이 변경되었는가"를 파악한다. 이 단계는 **순수**해야 하며 DOM을 건드리지 않는다. DOM을 건드리지 않으므로 중간에 **중단하고 나중에 재개**할 수 있다. 이것이 Concurrent Rendering의 핵심 전제이다.

Commit Phase에서 Render Phase의 결과(변경 목록)를 **실제 DOM에 반영**한다. 이 단계는 **동기적**으로 한 번에 실행된다. 중간에 멈추면 사용자가 불완전한 UI를 보게 되기 때문이다. Commit Phase 직후에 `useLayoutEffect`가 실행되고, 브라우저가 화면을 다시 그린(Paint) 후 `useEffect`가 실행된다.

#### Concurrent Rendering

Concurrent Rendering은 React 18에서 도입된 기능으로, 렌더링 작업을 **작은 조각으로 나누어 중단하고 재개**할 수 있는 능력이다. 핵심은 **우선순위 기반 스케줄링**이다. 사용자가 텍스트를 입력하는 것(긴급)과 검색 결과 목록을 업데이트하는 것(비긴급)이 동시에 필요할 때, Concurrent Rendering은 입력 처리를 먼저 완료한 뒤 목록 업데이트를 진행한다.

`useTransition`과 `useDeferredValue`는 개발자가 이 우선순위를 제어하는 도구이다. "이 업데이트는 긴급하지 않다"고 표시하면, React는 해당 렌더링을 낮은 우선순위로 처리하여 UI 반응성을 유지한다. 이 개념은 Step 15에서 실습과 함께 상세히 학습한다.

### 2.3 React 아키텍처 진화 타임라인

```
2013  React 탄생 — Stack Reconciler
      · 동기적 렌더링
      · 한 번 시작하면 끝까지 실행
      · 대규모 업데이트 시 UI 멈춤 가능

2017  React 16 — Fiber Architecture 도입 ★
      · 비동기 렌더링 가능 (기반 마련)
      · Error Boundary 지원
      · 하지만 아직 동기 모드가 기본

2022  React 18 — Concurrent Features 공식 출시 ★
      · createRoot로 Concurrent 모드 활성화
      · Automatic Batching
      · useTransition, useDeferredValue
      · Suspense for Data Fetching (실험적)
      · Streaming SSR

2024  React 19 — Server Integration + 자동 최적화 ★
      · React Server Components 안정화
      · React Compiler (빌드 타임 최적화)
      · use() Hook
      · Actions (useActionState, useFormStatus)
      · ref를 Props로 전달 (forwardRef 불필요)
      · Context를 Provider 없이 사용
```

---

## 3. 이론과 원리

### 3.1 Stack Reconciler의 한계 — 왜 Fiber가 필요했는가

#### Stack Reconciler (React 15 이전)

React 16 이전의 Reconciliation 엔진은 **재귀적 호출 스택(Call Stack)** 기반이었다.

```
Stack Reconciler의 동작 방식

  render(App)
    → render(Header)
      → render(NavItem) → 완료
      → render(NavItem) → 완료
    → render(Content)
      → render(Article)
        → render(Paragraph) → 완료
        → render(Paragraph) → 완료
      → render(Sidebar)
        → render(Widget) → 완료
    → render(Footer) → 완료

  · JavaScript 호출 스택(Call Stack)을 그대로 사용
  · 재귀적으로 트리를 순회
  · 한 번 시작하면 전체 트리를 끝까지 처리해야 함
  · 중간에 멈출 수 없다 (Call Stack은 중단·재개 불가)
```

#### 문제: 대규모 업데이트 시 UI 멈춤

![step10 03 시나리오 1000개의 리스트 항목을 업데이트해야 할 때](/developer-open-book/diagrams/react-step10-03-시나리오-1000개의-리스트-항목을-업데이트해야-할-때.svg)

```
핵심 문제:
  · JavaScript는 싱글 스레드이다
  · 렌더링이 메인 스레드를 점유하면
  · 사용자 입력 처리, 애니메이션, 레이아웃 등이 모두 차단된다
  · Call Stack 기반이므로 중간에 멈추고 다른 일을 할 수 없다

필요한 해결책:
  · 렌더링을 "잘게 나누어" 처리할 수 있어야 한다
  · 중간에 "더 급한 작업"을 먼저 처리할 수 있어야 한다
  · 브라우저에게 "숨 쉴 틈"을 주어야 한다
```

### 3.2 Fiber Architecture — 중단 가능한 렌더링

#### Fiber의 핵심 아이디어

```
Stack Reconciler → Fiber Architecture

  변경 전: 재귀 호출 (Call Stack)
    · 호출 스택이 쌓이면 중단할 수 없다
    · 전부 처리하거나, 전혀 처리하지 않거나 (All or Nothing)

  변경 후: 연결 리스트 + 루프 (Fiber)
    · 각 작업 단위(Fiber 노드)를 연결 리스트로 연결
    · while 루프로 하나씩 처리
    · 루프를 멈추고 다른 일을 한 뒤 다시 이어서 할 수 있다
    · 작업 단위 사이에 "체크포인트"가 있다

  비유:
    Stack = 책을 한 번에 끝까지 읽기 (중간에 멈출 수 없음)
    Fiber = 페이지마다 책갈피를 끼우며 읽기 (언제든 멈추고 재개 가능)
```

#### Fiber 노드의 구조

![step10 04 하나의 fiber 노드 간략화](/developer-open-book/diagrams/react-step10-04-하나의-fiber-노드-간략화.svg)

#### Fiber 트리의 구조 — 연결 리스트

![step10 05 element 트리 우리가 생각하는 트리](/developer-open-book/diagrams/react-step10-05-react-element-트리-우리가-생각하는-트리.svg)

> 💡 **왜 트리 대신 연결 리스트인가?** 연결 리스트는 **현재 위치를 기억**하기 쉽다. "P1까지 처리했다"라는 포인터 하나면 나중에 정확히 그 지점부터 다시 시작할 수 있다. 재귀 호출 스택은 이런 중간 저장이 불가능하다.

#### Double Buffering — 두 개의 트리

![step10 06 react는 항상 두 개의 fiber 트리를 유지한다](/developer-open-book/diagrams/react-step10-06-react는-항상-두-개의-fiber-트리를-유지한다.svg)

#### useState가 Fiber에 저장되는 원리

```
Step 6에서 배운 것: "useState는 렌더링 간에 값을 유지한다"
실제 저장 위치: Fiber 노드의 memoizedState

  function Counter() {
    const [count, setCount] = useState(0);    // Hook #1
    const [name, setName] = useState('');      // Hook #2
    return ...;
  }

  Counter의 Fiber 노드:
  {
    memoizedState: {
      // Hook #1: useState(0)
      memoizedState: 0,          // count의 현재 값
      queue: { pending: null },  // 대기 중인 업데이트
      next: {
        // Hook #2: useState('')
        memoizedState: '',       // name의 현재 값
        queue: { pending: null },
        next: null               // 마지막 Hook
      }
    }
  }

  Hook들이 연결 리스트로 연결되어 있다!
  → 이것이 Hook을 조건문/반복문 안에서 호출하면 안 되는 이유이다
  → 호출 순서가 바뀌면 연결 리스트의 매칭이 어긋난다
```

```
⚠️ Hook 규칙의 기술적 근거

  // ❌ 조건문 안에서 Hook 호출
  function BadComponent({ show }) {
    const [name, setName] = useState('');     // Hook #1

    if (show) {
      const [count, setCount] = useState(0);  // 조건부 Hook!
    }

    const [age, setAge] = useState(25);       // Hook #2 또는 #3?

    return ...;
  }

  렌더링 #1 (show=true):
    Hook #1 → name (연결 리스트 1번째)
    Hook #2 → count (연결 리스트 2번째)
    Hook #3 → age (연결 리스트 3번째)

  렌더링 #2 (show=false):
    Hook #1 → name (연결 리스트 1번째) ✅
    Hook #2 → age (연결 리스트 2번째)  ❌ count의 값을 age로 읽음!

  → React는 Hook을 "호출 순서"로 식별한다
  → 순서가 바뀌면 값이 뒤섞인다
  → 따라서 Hook은 항상 컴포넌트 최상위에서, 동일한 순서로 호출해야 한다
```

### 3.3 Render Phase vs Commit Phase — 세부 동작

#### 전체 파이프라인

![step10 07 렌더링 파이프라인](/developer-open-book/diagrams/react-step10-07-react-렌더링-파이프라인.svg)

#### Render Phase가 "순수"해야 하는 이유

```
Render Phase의 핵심 속성

  1. 중단 가능 (Interruptible)
     · Concurrent 모드에서 더 급한 업데이트가 오면 중단
     · 나중에 처음부터 다시 시작할 수 있다
     → 부수 효과가 있으면 중단 시 불완전한 상태가 남는다!

  2. 여러 번 실행 가능 (Restartable)
     · 우선순위가 높은 작업에 밀려 다시 시작될 수 있다
     · StrictMode에서 의도적으로 두 번 실행 (Step 6 복습)
     → 부수 효과가 있으면 두 번 실행 시 문제 발생!

  3. DOM을 건드리지 않음
     · 변경 "목록"만 만들 뿐, 실제 적용은 Commit Phase
     → DOM 조작은 Commit Phase에서 한 번에 적용

  이것이 Step 4에서 배운 "컴포넌트는 순수 함수여야 한다"의 기술적 근거이다
```

#### Commit Phase가 "동기적"인 이유

```
Commit Phase는 왜 중단할 수 없는가?

  상황: 리스트의 3번째 항목을 삭제하는 업데이트

  만약 Commit Phase를 중단할 수 있다면:
    1. DOM에서 3번째 <li> 제거 (완료)
    2. 4번째 <li>의 텍스트 업데이트 (중단됨!)
    3. 5번째 <li>의 스타일 변경 (미실행)

    → 사용자가 "3번째는 삭제되었지만 4번째 텍스트는 옛날 것"인
       불완전한 화면을 보게 된다!

  따라서 Commit Phase는:
    · 모든 DOM 변경을 한 번에 동기적으로 실행
    · 중간에 브라우저에 제어를 넘기지 않음
    · 사용자는 항상 "완전한" 상태의 화면만 본다
```

#### useEffect의 실행 시점

```
렌더링 파이프라인에서 Effect의 위치

  Render Phase    → 컴포넌트 함수 실행 (useEffect는 "등록"만)
  Commit Phase    → DOM 변경 + useLayoutEffect 실행 (동기)
  브라우저 Paint   → 화면 그리기
  Post-Commit     → useEffect 실행 (비동기) ★

  useEffect는 "화면이 그려진 후"에 실행된다
  → 사용자가 먼저 업데이트된 화면을 본다
  → 그 다음에 데이터 패칭, 구독 설정 등이 실행된다
  → 화면 그리기를 차단하지 않는다 (UX 향상)

  useLayoutEffect는 "DOM 변경 후, 화면 그리기 전"에 실행된다
  → DOM 측정 등 Paint 전에 반드시 실행해야 하는 작업용
  → Paint를 차단하므로 주의해서 사용 (Step 11에서 학습)
```

### 3.4 Concurrent Rendering — 중단 가능한 렌더링

#### 핵심 개념

![step10 08 synchronous rendering 17 이전 기본](/developer-open-book/diagrams/react-step10-08-synchronous-rendering-react-17-이전-기본.svg)

#### Time Slicing

![step10 09 time slicing의 동작 방식](/developer-open-book/diagrams/react-step10-09-time-slicing의-동작-방식.svg)

#### 우선순위 스케줄링

React 18에서는 업데이트에 **우선순위(Priority)** 가 부여된다.

![step10 10 우선순위 분류](/developer-open-book/diagrams/react-step10-10-우선순위-분류.svg)

> 💡 `useTransition`과 `useDeferredValue`의 **실전 사용법**은 Step 15에서 상세히 학습한다. 이 Step에서는 "왜 이런 API가 필요한가"의 이론적 배경을 이해하는 것이 목표이다.

### 3.5 React 19의 주요 변경사항

#### React Compiler (구 React Forget)

```
현재 (수동 최적화):

  function TodoList({ todos, filter }) {
    // 개발자가 직접 useMemo, useCallback을 판단하고 적용
    const filteredTodos = useMemo(
      () => todos.filter(t => matchesFilter(t, filter)),
      [todos, filter]
    );

    const handleToggle = useCallback(
      (id) => { /* ... */ },
      [/* 의존성 */]
    );

    return filteredTodos.map(t => (
      <TodoItem key={t.id} todo={t} onToggle={handleToggle} />
    ));
  }

  문제:
  · 어디에 useMemo/useCallback을 넣어야 하는지 판단이 어렵다
  · 의존성 배열을 잘못 작성하면 버그가 발생한다
  · 불필요한 곳에 사용하면 오히려 성능이 저하된다
  · 코드 가독성이 떨어진다


React Compiler (자동 최적화):

  function TodoList({ todos, filter }) {
    // 개발자는 useMemo/useCallback 없이 자연스럽게 작성
    const filteredTodos = todos.filter(t => matchesFilter(t, filter));

    const handleToggle = (id) => { /* ... */ };

    return filteredTodos.map(t => (
      <TodoItem key={t.id} todo={t} onToggle={handleToggle} />
    ));
  }

  // 빌드 타임에 Compiler가 자동으로 최적화를 삽입
  // 개발자는 "순수한 코드"만 작성하면 된다

  장점:
  · 수동 최적화 부담 제거
  · 의존성 배열 실수 방지
  · 코드가 더 깔끔해진다
  · 기본 성능이 향상된다
```

#### React 19의 기타 주요 변경

```
1. use() Hook
   · Promise를 직접 "읽을" 수 있는 새 Hook
   · Suspense와 결합하여 데이터 패칭 간소화
   · 조건문 안에서 호출 가능 (기존 Hook 규칙의 예외)
   → Step 15에서 학습

2. Actions (useActionState, useFormStatus)
   · 폼 제출을 위한 전용 API
   · 비동기 폼 처리, 낙관적 업데이트 내장
   → Step 15에서 학습

3. ref를 Props로 전달
   · forwardRef 없이 ref를 일반 Props처럼 전달 가능
   → Step 12에서 학습

4. Context를 직접 Provider로 사용
   · <MyContext.Provider> 대신 <MyContext> 사용 가능
   → Step 25에서 학습

5. 문서 메타데이터 지원
   · <title>, <meta> 등을 컴포넌트에서 직접 렌더링
   · React가 자동으로 <head>에 호이스팅

6. Stylesheet 우선순위 지원
   · <link rel="stylesheet" precedence="...">로 로드 순서 제어
```

### 3.6 Phase 1 통합 — React 렌더링의 전체 그림

Phase 1에서 배운 모든 개념을 하나의 흐름으로 통합한다.

![step10 11 렌더링 전체 파이프라인 step 410 통합](/developer-open-book/diagrams/react-step10-11-react-렌더링-전체-파이프라인-step-410-통합.svg)

---

## 4. 사례 연구와 예시

### 4.1 사례: Concurrent Rendering이 UX를 개선하는 시나리오

```
시나리오: 대규모 필터링이 있는 상품 목록

  상품 10,000개를 실시간 필터링하는 검색 페이지
  사용자가 검색어를 빠르게 타이핑한다

Synchronous (React 17):
  'R' 입력 → 10,000개 필터링 (50ms) → 화면 업데이트
  'Re' 입력 → 10,000개 필터링 (50ms) → 화면 업데이트
  'Rea' 입력 → 10,000개 필터링 (50ms) → 화면 업데이트
  'Reac' 입력 → 10,000개 필터링 (50ms) → 화면 업데이트
  'React' 입력 → 10,000개 필터링 (50ms) → 화면 업데이트

  · 매 키 입력마다 50ms × 동기 렌더링
  · 빠르게 타이핑하면 입력이 지연되는 느낌
  · 사용자 체감: "검색이 버벅인다"

Concurrent (React 18 + useTransition):
  'R' 입력 → 입력 필드 즉시 반영 (1ms) + 필터링 시작
  'Re' 입력 → 입력 필드 즉시 반영 (1ms) + 이전 필터링 취소, 새 필터링 시작
  'Rea' 입력 → 입력 필드 즉시 반영 (1ms) + 이전 필터링 취소, 새 필터링 시작
  ...
  'React' 입력 → 입력 필드 즉시 반영 (1ms) + 필터링 완료 → 결과 표시

  · 입력 필드는 항상 즉각 반응 (긴급 업데이트)
  · 리스트 필터링은 타이핑이 멈춘 후 처리 (전환 업데이트)
  · 중간 필터링은 취소되어 불필요한 작업을 하지 않는다
  · 사용자 체감: "검색이 부드럽다"
```

### 4.2 사례: Hook 호출 순서 위반이 만드는 버그

```jsx
// ❌ 조건문 안에서 Hook 호출 — Fiber 연결 리스트 어긋남
function Profile({ showDetails }) {
  const [name, setName] = useState("홍길동");

  // showDetails가 false면 이 Hook이 호출되지 않음!
  if (showDetails) {
    const [bio, setBio] = useState("개발자입니다");
  }

  const [age, setAge] = useState(25);

  return (
    <p>
      {name}, {age}
    </p>
  );
}

// showDetails=true → Hook 순서: name(0), bio(1), age(2)
// showDetails=false → Hook 순서: name(0), age(1)
// → age가 bio의 값('개발자입니다')을 읽게 됨!

// ✅ 올바른 방법: 항상 동일한 순서로 호출
function Profile({ showDetails }) {
  const [name, setName] = useState("홍길동");
  const [bio, setBio] = useState("개발자입니다"); // 항상 호출
  const [age, setAge] = useState(25);

  return (
    <div>
      <p>
        {name}, {age}
      </p>
      {showDetails && <p>{bio}</p>} {/* 렌더링만 조건부 */}
    </div>
  );
}
```

### 4.3 사례: Double Buffering이 사용자 경험을 보호하는 방식

```
시나리오: 리스트에서 항목 3개를 동시에 업데이트

  Current Tree (현재 화면):
    Item A: "React"     → "React 19"
    Item B: "Props"     → "Props 심화"
    Item C: "State"     → (변경 없음)

  만약 Double Buffering이 없다면:
    1. Item A를 "React 19"로 변경 → 화면에 반영
    2. (여기서 브라우저에 제어 넘김)
    3. 사용자가 보는 화면: A="React 19", B="Props" ← 불완전!
    4. Item B를 "Props 심화"로 변경 → 화면에 반영
    5. 사용자가 보는 화면: A="React 19", B="Props 심화" ← 완성

  Double Buffering이 있으면:
    1. WorkInProgress Tree에서 A, B 모두 변경 (화면에 안 보임)
    2. 모든 변경 완료 후 Current ↔ WorkInProgress 포인터 교체
    3. 사용자가 보는 화면: A="React 19", B="Props 심화" ← 한 번에 완성!

  → 사용자는 절대 "중간 상태"를 보지 않는다
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 React DevTools의 Profiler를 활용하여 Render Phase/Commit Phase 동작과 렌더링 성능을 직접 관찰할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: Phase 1 전체 흐름 추적 [Understanding]

**목표:** Step 4~10의 모든 개념을 하나의 시나리오로 통합하여 추적한다.

아래 코드에서 버튼을 클릭할 때 발생하는 **전체 과정**을 단계별로 서술하라.

```jsx
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Display count={count} />
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
    </div>
  );
}

function Display({ count }) {
  const label = count > 0 ? `${count}번 클릭` : "클릭 전";
  return <p className="display">{label}</p>;
}
```

**서술할 단계:**

```
1. [Trigger] 버튼 클릭 → setState 호출
   · setCount(prev => prev + 1) — Updater Function이 큐에 추가된다
   · 큐 처리: prev=0 → 0+1 → count=1
   · 재렌더링 예약

2. [Render Phase] 컴포넌트 함수 호출
   · App() 호출 — count=1 (새 스냅샷)
   · JSX 평가 — 새 React Element 트리 생성
   · Display({ count: 1 }) 호출 — label="1번 클릭"
   · Reconciliation: 이전 트리와 비교
     - <div>: type 동일 → 유지
     - <Display>: type 동일, props.count 변경 → UPDATE 표시
     - <p>: type 동일, children 변경 → UPDATE 표시
     - <button>: 변경 없음

3. [Commit Phase] DOM 업데이트
   · <p>의 textContent를 "클릭 전" → "1번 클릭"으로 변경
   · 다른 DOM 노드는 건드리지 않음

4. [Paint] 브라우저가 화면을 다시 그림

5. [Post-Commit] useEffect가 있다면 이 시점에 실행
```

위 형식을 참고하여 **자신의 말로** 전체 과정을 작성하라.

---

### 실습 2: Hook 호출 순서 규칙 이해 [Analyzing]

**목표:** Hook이 Fiber의 연결 리스트에 저장되는 원리를 이해하고, 규칙 위반의 결과를 예측한다.

아래 코드가 왜 문제인지 분석하고, Fiber의 Hook 연결 리스트가 어떻게 어긋나는지 도식화하라.

```jsx
function Form({ step }) {
  const [name, setName] = useState("");

  if (step >= 2) {
    const [email, setEmail] = useState("");
  }

  if (step >= 3) {
    const [phone, setPhone] = useState("");
  }

  const [isValid, setIsValid] = useState(false);

  return <p>{name}</p>;
}
```

**분석할 것:**

- step=1, step=2, step=3 각각에서 Hook이 호출되는 순서
- step=3 → step=1로 변경될 때 어떤 값이 어긋나는가
- 올바른 수정 방법

---

### 실습 3: Concurrent의 필요성 체험 [Analyzing · Evaluating]

**목표:** 동기 렌더링이 UI를 차단하는 현상을 직접 체험하고, Concurrent의 가치를 이해한다.

아래 코드를 실행하여 입력 필드의 반응성을 관찰하라.

```jsx
function HeavyList() {
  const [query, setQuery] = useState("");
  const [items] = useState(() =>
    Array.from({ length: 10000 }, (_, i) => `항목 ${i + 1}`),
  );

  // 의도적으로 무거운 필터링
  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
      />
      <p>{filtered.length}개 결과</p>
      <ul>
        {filtered.slice(0, 100).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

**관찰할 것:**

- 빠르게 타이핑할 때 입력 필드가 즉각 반응하는가?
- 만약 느리다면 원인은 무엇인가? (힌트: 동기 렌더링 + 10,000개 필터링)
- useTransition을 적용한다면 어떤 부분을 startTransition으로 감싸야 하는가? (개념만 설계, 구현은 Step 15)

---

### 실습 4 (선택): Render Phase vs Commit Phase 구분 실험 [Analyzing]

**목표:** console.log로 Render Phase와 Commit Phase/Post-Commit의 실행 순서를 관찰한다.

```jsx
function LifecycleObserver() {
  const [count, setCount] = useState(0);

  console.log("1. Render Phase: 함수 본문 실행, count =", count);

  useEffect(() => {
    console.log("3. Post-Commit: useEffect 실행, count =", count);
    return () => {
      console.log("3-cleanup. useEffect cleanup, count =", count);
    };
  }, [count]);

  // useLayoutEffect는 Step 11에서 상세히 다루지만 순서 비교용
  // import { useLayoutEffect } from 'react';
  // useLayoutEffect(() => {
  //   console.log('2. Commit Phase: useLayoutEffect 실행, count =', count);
  // }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

**관찰할 것:**

- 초기 마운트 시 로그 순서
- 버튼 클릭 후 로그 순서
- StrictMode에서의 로그 패턴 (이중 실행)
- cleanup이 실행되는 타이밍

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 10 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Fiber Architecture는 중단 가능한 렌더링을 위해 도입되었다  │
│     → Stack Reconciler: 재귀 호출, 중단 불가, UI 멈춤 가능    │
│     → Fiber: 연결 리스트 + 루프, 중단·재개 가능              │
│     → 각 컴포넌트가 Fiber 노드로 표현된다                    │
│                                                               │
│  2. Fiber 노드에 State(Hook)가 연결 리스트로 저장된다         │
│     → Hook 호출 순서가 곧 연결 리스트의 순서                  │
│     → 조건문/반복문 안에서 Hook을 호출하면 순서가 어긋난다     │
│     → 이것이 "Hook 규칙"의 기술적 근거이다                   │
│                                                               │
│  3. Render Phase = 순수, 중단 가능                           │
│     → 컴포넌트 함수 호출, Diff, effectTag 표시               │
│     → DOM을 건드리지 않는다                                  │
│     → 여러 번 실행될 수 있다 (StrictMode, Concurrent)         │
│                                                               │
│  4. Commit Phase = 부수 효과, 동기적, 중단 불가               │
│     → effectTag에 따라 실제 DOM 조작                         │
│     → 한 번에 모든 변경을 적용 (불완전한 UI 방지)             │
│     → useLayoutEffect가 이 단계에서 동기 실행                 │
│                                                               │
│  5. useEffect는 브라우저 Paint 이후에 비동기 실행된다          │
│     → 화면 그리기를 차단하지 않는다                           │
│     → 데이터 패칭, 구독 등 부수 효과에 적합                   │
│                                                               │
│  6. Concurrent Rendering = Time Slicing + Priority Scheduling │
│     → 렌더링을 ~5ms 단위로 나누어 브라우저에 양보             │
│     → 긴급 업데이트(입력)가 전환 업데이트(리스트)보다 우선     │
│     → createRoot 사용 시 자동 활성화 (React 18+)             │
│                                                               │
│  7. Double Buffering으로 사용자에게 불완전한 UI를 보여주지 않는다│
│     → Current Tree(현재 화면)와 WorkInProgress Tree(작업 중)  │
│     → 작업 완료 후 포인터 교체로 한 순간에 전환               │
│                                                               │
│  8. React 19는 자동 최적화와 서버 통합 방향으로 진화한다       │
│     → React Compiler: useMemo/useCallback 자동 삽입          │
│     → use() Hook, Actions, RSC 안정화                        │
│     → 개발자는 "순수한 코드"에 집중하면 된다                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Phase 1 전체 회고

```
Phase 1 (Step 4~10)에서 배운 것

  Step 4:  JSX = React.createElement 호출, React Element = Plain Object
  Step 5:  Props = 읽기 전용, 단방향 흐름, Composition
  Step 6:  State = 스냅샷, Batching, Updater Function, Stale Closure
  Step 7:  Reconciliation = O(n) Diff, key = Element 식별자
  Step 8:  Controlled Component, Synthetic Event, Event Delegation
  Step 9:  조건부 렌더링 6패턴, && 함정, 리스트 map, 4가지 UI 상태
  Step 10: Fiber Architecture, Render/Commit Phase, Concurrent Rendering

  핵심 공식: UI = f(props, state)

  이 공식의 의미:
  · 같은 props + 같은 state → 항상 같은 UI (순수 함수)
  · state가 변하면 React가 함수를 다시 호출하여 새 UI를 생성
  · 이전 UI와 새 UI를 비교(Reconciliation)하여 변경분만 DOM에 반영
  · 이 모든 과정을 Fiber Architecture가 효율적으로 스케줄링

  Phase 2부터는 이 기반 위에 Hook, 부수 효과, 최적화를 쌓아올린다.
```

### 6.3 자가진단 퀴즈

| #   | 질문                                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Stack Reconciler의 핵심 한계를 한 문장으로 설명하라                                   | Remember   | 3.1         |
| 2   | Fiber가 연결 리스트 구조를 사용하는 이유는?                                           | Understand | 3.2         |
| 3   | Render Phase에서 "DOM을 건드리지 않는다"가 중요한 이유를 Concurrent 관점에서 설명하라 | Understand | 3.3         |
| 4   | Commit Phase가 동기적으로 실행되어야 하는 이유는?                                     | Understand | 3.3         |
| 5   | useEffect가 Paint 이후에 실행되는 것이 UX에 주는 이점은?                              | Understand | 3.3         |
| 6   | Hook을 조건문 안에서 호출하면 안 되는 기술적 이유를 Fiber 구조로 설명하라             | Analyze    | 3.2         |
| 7   | Concurrent Rendering에서 사용자 입력이 리스트 업데이트보다 먼저 처리되는 원리는?      | Analyze    | 3.4         |
| 8   | React Compiler가 기존 useMemo/useCallback 패턴을 어떻게 변화시키는가?                 | Evaluate   | 3.5         |

### 6.4 자주 묻는 질문 (FAQ)

**Q1. Fiber를 직접 다룰 일이 없는데 왜 배워야 하나?**

Fiber를 직접 조작하는 API는 없지만, Fiber의 동작 원리를 이해하면 React의 모든 고급 기능(useTransition, Suspense, Server Components)이 "왜 그렇게 동작하는지" 이해할 수 있다. 또한 성능 문제 진단 시 React DevTools Profiler의 출력을 올바르게 해석하려면 Render Phase와 Commit Phase의 구분을 알아야 한다.

**Q2. Hook을 조건문 안에서 호출하면 안 되는 기술적 이유는?**

React는 Fiber Node 내부에 Hook들을 **연결 리스트(Linked List)** 로 저장하며, 호출 순서(인덱스)로 각 Hook을 식별한다. 첫 번째 렌더링에서 Hook이 A, B, C 순서로 호출되었다면, 다음 렌더링에서도 같은 순서로 호출되어야 올바른 State 값이 매칭된다. 조건문 안에서 Hook을 호출하면 조건에 따라 순서가 바뀌어 잘못된 State가 반환되는 심각한 버그가 발생한다.

**Q3. Concurrent Rendering은 멀티스레딩인가?**

아니다. JavaScript는 싱글 스레드이며, Concurrent Rendering도 **하나의 스레드**에서 동작한다. "Concurrent"는 "동시에 실행"이 아니라 "여러 렌더링을 번갈아가며 진행할 수 있다"는 의미이다. 긴 렌더링 작업을 작은 조각으로 나누어, 각 조각 사이에 브라우저가 사용자 입력이나 애니메이션을 처리할 수 있게 양보(yield)한다.

**Q4. React Compiler를 쓰면 useMemo와 useCallback을 안 써도 되나?**

React Compiler가 안정화되면, 대부분의 경우 useMemo와 useCallback을 수동으로 작성할 필요가 없어질 것이다. Compiler가 빌드 타임에 코드를 분석하여 필요한 곳에 자동으로 메모이제이션을 삽입하기 때문이다. 다만 2025년 현재 React Compiler는 아직 실험적(experimental) 단계이므로, 당분간은 수동 최적화 패턴을 알고 있어야 한다.

**Q5. useEffect와 useLayoutEffect의 실행 시점 차이는?**

`useLayoutEffect`는 DOM 변경 후 브라우저가 화면을 그리기 **전에** 동기적으로 실행된다. `useEffect`는 브라우저가 화면을 그린(Paint) **후에** 비동기적으로 실행된다. 대부분의 부수 효과는 `useEffect`로 충분하며, DOM 측정(요소 크기, 위치)이나 스크롤 위치 조정 등 Paint 전에 완료해야 하는 작업에만 `useLayoutEffect`를 사용한다. 이 주제는 Step 11에서 상세히 학습한다.

---

## 7. 다음 단계 예고

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
>
> **Step 11. useEffect 완전 이해**
>
> - useEffect의 정확한 실행 타이밍
> - 의존성 배열의 3가지 형태와 각각의 의미
> - Cleanup 함수의 타이밍과 역할
> - 무한 루프가 발생하는 케이스와 방지법
> - useEffect vs useLayoutEffect
>
> Phase 1에서 쌓은 기초 위에, 이제 **부수 효과의 세계**로 진입한다.

---

## 📚 참고 자료

- [React GitHub — Fiber Architecture 설계 문서](https://github.com/acdlite/react-fiber-architecture)
- [React 공식 문서 — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [React 공식 블로그 — React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [React 공식 블로그 — React 19](https://react.dev/blog/2024/12/05/react-19)
- [React 공식 문서 — React Compiler](https://react.dev/learn/react-compiler)
- [MDN — Cooperative Scheduling of Background Tasks](https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API)
- [React 이전 문서 — Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 10 of 42 | **Phase 1 완료**
