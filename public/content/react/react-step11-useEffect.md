# Step 11. useEffect 완전 이해

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다 — **Phase 2 시작**

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| **Remember**   | useEffect의 3가지 의존성 배열 형태와 각각의 실행 조건을 나열할 수 있다                  |
| **Understand** | useEffect가 Render/Commit/Paint 이후의 어떤 시점에 실행되는지 설명할 수 있다            |
| **Understand** | Cleanup 함수의 실행 타이밍과 "이전 렌더링의 효과를 정리한다"는 의미를 설명할 수 있다    |
| **Apply**      | 데이터 패칭, 이벤트 리스너, 타이머 등의 부수 효과를 useEffect로 올바르게 구현할 수 있다 |
| **Analyze**    | 무한 루프가 발생하는 코드를 식별하고 원인을 추적할 수 있다                              |
| **Evaluate**   | "이 로직에 useEffect가 필요한가?"를 판단하고 불필요한 Effect를 제거할 수 있다           |

**전제 지식:**

- Step 2: async/await, 클로저(Closure)
- Step 4: "렌더링 = 함수 실행", 순수 함수 원칙
- Step 6: useState, 스냅샷 모델, Stale Closure
- Step 10: Render Phase / Commit Phase / Post-Commit, useEffect 실행 시점

---

## 1. 서론 — 부수 효과란 무엇인가

### 1.1 순수 함수 세계의 한계와 부수 효과의 등장

소프트웨어 개발 역사에서 UI는 오랫동안 "명령형(Imperative)" 방식으로 구축되었다. jQuery 시대에는 `$('#button').click(function() { ... })` 처럼 DOM을 직접 조작하고, 상태 변화를 직접 반영했다. 이 방식은 직관적이지만, 애플리케이션 규모가 커질수록 상태와 UI의 일관성을 유지하기가 극도로 어려워졌다. 특정 버튼 클릭이 페이지 여러 곳을 동시에 바꿔야 할 때, 어느 것이 최신 상태인지 추적하는 일이 개발자의 주요 고통이 되었다.

React는 이 문제를 "선언형(Declarative)" 패러다임으로 해결했다. Step 4에서 배운 것처럼 컴포넌트는 **순수 함수**여야 한다. 같은 입력(Props, State)에 항상 같은 출력(React Element)을 반환하고, 렌더링 중에 외부 세계를 변경하지 않아야 한다. 이 제약 덕분에 React는 렌더링을 중단·재개·병렬 실행할 수 있고, 개발자는 "UI가 어떻게 보여야 하는가"만 선언하면 된다.

그러나 실제 애플리케이션은 순수한 계산만으로 동작하지 않는다. 서버에서 데이터를 가져와야 하고, 타이머를 설정해야 하며, 브라우저 이벤트를 구독해야 한다. 이처럼 **함수 실행 결과 외에 외부 세계에 영향을 미치는 모든 작업**을 부수 효과(Side Effect)라고 부른다. useEffect는 이러한 부수 효과를 "렌더링과 분리하여" 안전하게 실행하는 메커니즘이다.

### 1.2 왜 useEffect가 React 생태계에서 중심적 위치를 차지하는가

useEffect가 도입되기 전 클래스 컴포넌트 시대에는 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` 세 가지 라이프사이클 메서드에 부수 효과 코드를 분산하여 작성했다. 문제는 관련 있는 코드(예: 이벤트 리스너 등록과 해제)가 서로 다른 메서드에 나뉘고, 무관한 코드(예: 데이터 패칭과 타이머 설정)가 같은 메서드 안에 뒤섞인다는 점이었다. 이 구조는 복잡한 컴포넌트에서 버그와 메모리 누수의 주요 원인이 되었다.

React Hooks의 도입(React 16.8, 2019년)은 이 문제를 근본적으로 바꿨다. useEffect는 "라이프사이클 이벤트에 반응한다"는 시점 중심 사고에서 벗어나, "외부 시스템을 현재 State·Props와 동기화한다"는 관계 중심 사고를 가능하게 했다. 하나의 useEffect가 관련 있는 Setup과 Cleanup을 함께 포함할 수 있어, 코드의 응집도가 높아졌다.

산업적 관점에서 useEffect의 올바른 이해는 다음 이유로 핵심 역량이다. 첫째, 데이터 패칭·구독·타이머 등 모든 비동기 부수 효과의 진입점이다. 둘째, 잘못 사용하면 무한 루프·메모리 누수·Race Condition 같은 미묘하고 재현하기 어려운 버그를 만든다. 셋째, TanStack Query·SWR 등 현대적 데이터 패칭 라이브러리들이 내부적으로 useEffect 위에 구축되어 있으므로, 추상화 이면의 동작을 이해하는 데 필수적이다.

### 1.3 부수 효과의 분류와 useEffect의 역할

```
순수한 계산 (렌더링 중 허용):
  · Props/State에서 파생 데이터 계산
  · JSX 반환
  · 조건부 렌더링

부수 효과 (렌더링 밖에서 처리해야 하는 것):
  · 서버에서 데이터 가져오기 (fetch)
  · DOM을 직접 조작하기 (document.title 변경 등)
  · 타이머 설정 (setTimeout, setInterval)
  · 이벤트 리스너 등록 (window.addEventListener)
  · 외부 라이브러리와 동기화
  · 로컬 스토리지 읽기/쓰기
  · WebSocket 연결
  · 분석 이벤트 전송 (analytics)
```

**useEffect는 이러한 부수 효과를 "렌더링과 분리하여" 안전하게 실행하는 메커니즘이다.**

### 1.4 이 Step의 학습 지도 (개념 지도)

```
┌────────────────────────────────────────────────────────────────┐
│                    useEffect 개념 지도                          │
│                                                                 │
│  [순수 렌더링]──────────→ [부수 효과의 필요성]                  │
│       │                          │                             │
│       │                          ▼                             │
│       │                   [useEffect]                          │
│       │                   /    │    \                          │
│       │          [실행 타이밍] [의존성] [Cleanup]               │
│       │               │        │         │                     │
│       │           Paint후   [dep] []  생략  이전효과 정리       │
│       │                        │                              │
│       └────────────→ [올바른 멘탈 모델: 동기화]                 │
│                                │                              │
│                    ┌───────────┼───────────┐                   │
│                 [패칭]      [타이머]    [이벤트]                 │
│                                │                              │
│                        [언제 필요 없는가?]                      │
│                    ┌───────────┼───────────┐                   │
│                [파생 데이터] [이벤트 핸들러] [key 패턴]          │
└────────────────────────────────────────────────────────────────┘
```

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · useEffect의 실행 타이밍과 렌더링 파이프라인에서의 위치 │
│  · 의존성 배열의 3가지 형태와 동작 원리                   │
│  · Cleanup 함수의 타이밍과 패턴                          │
│  · 무한 루프 발생 케이스와 방지법                         │
│  · useEffect 안에서의 async 패턴                         │
│  · useEffect vs useLayoutEffect                         │
│  · "useEffect가 필요 없는" 케이스 판별                   │
│  · 실전 부수 효과 패턴 (패칭, 타이머, 이벤트, DOM)       │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · useRef 상세 (Step 12)                                │
│  · TanStack Query 등 데이터 패칭 라이브러리 (Step 23)   │
│  · Suspense 기반 패칭 (Step 30)                         │
│  · Error Boundary (Step 17)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                       | 정의                                                                                          | 왜 중요한가                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Side Effect(부수 효과)** | 함수 실행 결과 외에 외부 세계에 영향을 미치는 모든 작업. 네트워크 요청, DOM 조작, 타이머 등   | 렌더링(순수)과 부수 효과를 분리하는 것이 React 설계의 핵심이다        |
| **useEffect**              | 렌더링 이후에 부수 효과를 실행하는 Hook. **"이 렌더링과 동기화해야 할 외부 작업"**을 선언한다 | React에서 부수 효과를 처리하는 기본 도구이다                          |
| **의존성 배열**            | useEffect의 두 번째 인자. **어떤 값이 변했을 때** Effect를 다시 실행할지 React에 알려준다     | Effect의 실행 빈도와 정확성을 결정하는 핵심이다                       |
| **Cleanup 함수**           | useEffect 콜백이 반환하는 함수. 이전 Effect의 **정리(구독 해제, 타이머 취소 등)**를 담당한다  | 메모리 누수와 중복 구독을 방지한다                                    |
| **Setup 함수**             | useEffect에 전달하는 콜백 함수. Effect의 **설정(구독, 타이머 등)**을 담당한다                 | Cleanup과 짝을 이루어 Effect의 생명주기를 구성한다                    |
| **useLayoutEffect**        | Commit Phase(DOM 변경 후, Paint 전)에 **동기적으로** 실행되는 Effect                          | DOM 측정, 레이아웃 조정 등 Paint 전에 반드시 완료해야 하는 작업용이다 |
| **Effect 동기화**          | useEffect를 "라이프사이클 이벤트"가 아닌 **"외부 시스템과의 동기화"**로 이해하는 관점         | useEffect의 올바른 멘탈 모델이다                                      |
| **Race Condition**         | 비동기 요청이 여러 개 발생했을 때 응답 순서가 요청 순서와 달라 잘못된 데이터가 표시되는 버그  | AbortController로 방지한다                                            |
| **AbortController**        | fetch 요청을 프로그래밍적으로 취소하는 Web API. `signal`을 통해 fetch에 취소 신호를 전달한다  | Race Condition과 언마운트 후 setState를 방지하는 핵심 수단이다        |

### 2.2 용어 간 관계 다이어그램

```
┌───────────────────────────────────────────────────────────────┐
│                   useEffect 구성 요소 관계                     │
│                                                               │
│  useEffect(                                                   │
│    [Setup 함수] ──→ 부수 효과 실행                             │
│                     └── 반환: [Cleanup 함수] ──→ 정리 작업    │
│    ,                                                          │
│    [의존성 배열] ──→ 재실행 조건 결정                          │
│       │                                                       │
│       ├── [dep1, dep2] → 마운트 + dep 변경 시                 │
│       ├── []           → 마운트 시 1회만                       │
│       └── (생략)       → 매 렌더링마다                         │
│  )                                                            │
│                                                               │
│  실행 시점:                                                    │
│  [Render Phase] → [Commit Phase] → [Paint] → [useEffect ★]   │
│                                    ↑                         │
│                          [useLayoutEffect] (Paint 전)         │
└───────────────────────────────────────────────────────────────┘
```

### 2.3 Side Effect의 이론적 배경

함수형 프로그래밍(Functional Programming) 패러다임에서 **순수 함수(Pure Function)**는 수학적 함수와 같다. 동일한 입력에 항상 동일한 출력을 반환하고, 외부 상태를 변경하지 않는다. 이 특성 덕분에 코드 추론(reasoning)이 쉽고, 테스트가 단순하며, 병렬 실행이 안전하다.

그러나 실용적인 애플리케이션은 외부 세계와 상호작용해야 하며, 이것이 부수 효과다. 함수형 프로그래밍은 부수 효과를 없애는 것이 아니라, **부수 효과를 격리(isolate)하고 명시적으로 관리**하는 방향으로 발전했다. Haskell의 IO Monad, Elm의 Cmd, 그리고 React의 useEffect 모두 이 철학의 구현체다.

React에서 useEffect는 부수 효과를 "렌더링(순수 계산)"과 명확히 분리하는 경계선이다. 렌더링 함수 본문은 순수해야 하고, 외부 세계와의 상호작용은 반드시 useEffect 안에서만 일어나야 한다. 이 경계를 지킴으로써 React의 Concurrent Mode나 Server-Side Rendering 같은 고급 기능이 안전하게 동작할 수 있다.

### 2.4 useEffect의 기본 형태

```jsx
useEffect(
  () => {
    // ── Setup: 부수 효과 실행 ──
    // 데이터 패칭, 이벤트 등록, 타이머 설정 등

    return () => {
      // ── Cleanup: 이전 효과 정리 ──
      // 이벤트 해제, 타이머 취소, 구독 해제 등
      // (선택적 — 정리가 필요 없으면 생략)
    };
  },
  [dependency1, dependency2], // ── 의존성 배열 ──
);
```

---

## 3. 이론과 원리

### 3.1 useEffect의 실행 타이밍

#### 렌더링 파이프라인에서의 위치 (Step 10 복습 + 확장)

```
  Trigger (setState 등)
       │
       ▼
  Render Phase
  · 컴포넌트 함수 호출
  · useEffect 콜백을 "등록만" 함 (실행하지 않음!)
  · 새 React Element 트리 생성, Diff
       │
       ▼
  Commit Phase
  · 실제 DOM 변경
  · useLayoutEffect 실행 (동기) ← Paint 전
       │
       ▼
  브라우저 Paint ← 사용자가 화면을 본다
       │
       ▼
  Post-Commit
  · useEffect 실행 (비동기) ← Paint 후 ★
  · 화면 그리기를 차단하지 않는다
```

```
핵심 타이밍 정리

  useEffect:
    · 실행 시점: 브라우저가 화면을 그린 후 (비동기)
    · 특징: 화면 그리기를 차단하지 않는다
    · 용도: 대부분의 부수 효과 (데이터 패칭, 구독, 로깅 등)

  useLayoutEffect:
    · 실행 시점: DOM 변경 후, 브라우저가 화면을 그리기 전 (동기)
    · 특징: 화면 그리기를 차단한다 (Paint가 지연됨)
    · 용도: DOM 측정, 레이아웃 조정 등 Paint 전에 완료해야 하는 작업

  렌더링 중 (함수 본문):
    · 실행 시점: 컴포넌트 함수가 호출될 때
    · 특징: 순수해야 한다 (부수 효과 금지)
    · 용도: 파생 데이터 계산, JSX 반환
```

#### "왜 Paint 후에 실행되는가?"

```
Paint 전에 실행하면 (useLayoutEffect의 경우):
  · Effect가 완료될 때까지 화면이 그려지지 않는다
  · 무거운 작업이면 사용자가 "빈 화면"을 보게 된다
  · 필요한 경우: DOM 크기 측정 후 위치 조정 (깜빡임 방지)

Paint 후에 실행하면 (useEffect의 경우):
  · 사용자가 먼저 업데이트된 화면을 본다
  · 그 다음에 부수 효과가 실행된다
  · 데이터 패칭 결과가 나오면 다시 렌더링하여 반영
  · 사용자 체감: "화면이 빨리 나타나고, 데이터가 이후에 채워진다"
```

### 3.2 의존성 배열의 3가지 형태

#### 형태 1: 의존성 배열 있음 — `[dep1, dep2]`

```jsx
useEffect(() => {
  console.log(`count가 ${count}로 변경됨`);
  document.title = `클릭 ${count}회`;
}, [count]);
// count가 변할 때만 Effect 재실행
```

```
실행 조건:
  · 첫 렌더링(마운트) 후 반드시 실행
  · 이후 렌더링에서 의존성 배열 안의 값이 변했을 때만 재실행
  · React가 Object.is()로 이전 값과 비교

동작 흐름:
  렌더링 #1: count=0 → Effect 실행 (마운트)
  렌더링 #2: count=1 → Object.is(0, 1) = false → Effect 재실행 ✅
  렌더링 #3: count=1 → Object.is(1, 1) = true → Effect 건너뜀 ❌
  렌더링 #4: count=2 → Object.is(1, 2) = false → Effect 재실행 ✅
```

#### 형태 2: 빈 의존성 배열 — `[]`

```jsx
useEffect(() => {
  console.log("마운트 시 한 번만 실행");

  const handleResize = () => console.log(window.innerWidth);
  window.addEventListener("resize", handleResize);

  return () => {
    console.log("언마운트 시 정리");
    window.removeEventListener("resize", handleResize);
  };
}, []);
// 마운트 시 1번 실행, 언마운트 시 Cleanup 실행
```

```
실행 조건:
  · 첫 렌더링(마운트) 후 1번만 실행
  · 이후 렌더링에서는 재실행되지 않음
  · 의존성이 "없다"는 것은 "어떤 값도 변했는지 확인할 필요 없다"는 의미

주의:
  · Effect 안에서 참조하는 State/Props는 마운트 시점의 스냅샷
  · Stale Closure 주의! (Step 6 복습)
  · 컴포넌트가 언마운트될 때 Cleanup 실행
```

#### 형태 3: 의존성 배열 생략 — (두 번째 인자 없음)

```jsx
useEffect(() => {
  console.log("매 렌더링마다 실행");
});
// 모든 렌더링 후 실행 — 거의 사용하지 않음!
```

```
실행 조건:
  · 매 렌더링 후 항상 실행
  · State 변경, Props 변경, 부모 재렌더링 등 모든 경우

⚠️ 거의 사용하지 않는 이유:
  · 성능에 부정적 (불필요한 Effect 반복 실행)
  · 무한 루프 위험 (Effect 안에서 setState하면)
  · 의존성을 명시적으로 선언하는 것이 React의 설계 의도
```

#### 3가지 형태 비교

```
┌────────────────────┬───────────────────────┬──────────────────┐
│  형태               │  실행 조건             │  사용 빈도        │
├────────────────────┼───────────────────────┼──────────────────┤
│  [dep1, dep2]      │  마운트 + 의존성 변경 시│  가장 자주 ★★★   │
│  []                │  마운트 시 1번만        │  자주 ★★         │
│  (생략)            │  매 렌더링마다          │  거의 안 씀 ★     │
└────────────────────┴───────────────────────┴──────────────────┘
```

### 3.3 Cleanup 함수 — "이전 효과를 정리한다"

#### Cleanup의 실행 타이밍

```jsx
useEffect(() => {
  console.log(`Setup: count = ${count}`);

  return () => {
    console.log(`Cleanup: count = ${count}`);
  };
}, [count]);
```

```
실행 흐름:

  렌더링 #1 (count=0):
    → Setup 실행: "Setup: count = 0"

  렌더링 #2 (count=1):
    → 이전 Effect의 Cleanup 실행: "Cleanup: count = 0"  ★
    → 새 Setup 실행: "Setup: count = 1"

  렌더링 #3 (count=2):
    → 이전 Effect의 Cleanup 실행: "Cleanup: count = 1"  ★
    → 새 Setup 실행: "Setup: count = 2"

  컴포넌트 언마운트:
    → 마지막 Effect의 Cleanup 실행: "Cleanup: count = 2"


핵심 규칙:
  1. Cleanup은 "새 Effect가 실행되기 전에" 이전 Effect를 정리한다
  2. Cleanup의 클로저는 "이전 렌더링"의 State/Props를 캡처한다
  3. 컴포넌트 언마운트 시에도 마지막 Cleanup이 실행된다
```

#### Cleanup이 필요한 패턴과 불필요한 패턴

```
Cleanup이 반드시 필요한 패턴:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 이벤트 리스너 등록       → removeEventListener
  · 타이머 설정              → clearInterval, clearTimeout
  · WebSocket 연결           → socket.close()
  · 외부 라이브러리 구독     → subscription.unsubscribe()
  · DOM 관찰자              → observer.disconnect()

  규칙: "Setup에서 시작한 것은 Cleanup에서 멈춘다"


Cleanup이 불필요한 패턴:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 데이터 패칭 (AbortController로 취소하는 것은 선택적)
  · document.title 변경 (다음 Effect가 덮어씀)
  · console.log (정리할 것이 없음)
  · 분석 이벤트 전송 (보내면 끝)
```

#### Cleanup 패턴의 실전 예시

**이벤트 리스너:**

```jsx
function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Setup: 리스너 등록
    handleResize(); // 초기값 설정
    window.addEventListener("resize", handleResize);

    // Cleanup: 리스너 해제
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 빈 배열: 마운트/언마운트 시에만

  return (
    <p>
      {size.width} × {size.height}
    </p>
  );
}
```

**타이머:**

```jsx
function AutoRefresh({ interval, onRefresh }) {
  useEffect(() => {
    const id = setInterval(() => {
      onRefresh();
    }, interval);

    return () => clearInterval(id);
    // interval이나 onRefresh가 바뀌면
    // 이전 타이머를 정리하고 새 타이머를 설정
  }, [interval, onRefresh]);
}
```

**AbortController를 활용한 데이터 패칭 취소:**

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setStatus('loading');
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal   // 취소 시그널 전달
        });
        const data = await response.json();
        setUser(data);
        setStatus('success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          // AbortError는 의도적 취소이므로 무시
          setStatus('error');
        }
      }
    }

    fetchUser();

    return () => {
      controller.abort();  // userId가 바뀌면 이전 요청 취소
    };
  }, [userId]);

  return (/* ... */);
}
```

```
AbortController가 필요한 이유:

  시나리오: 사용자가 프로필을 빠르게 전환

  userId=1 → fetch 시작 (200ms 소요)
  userId=2 → fetch 시작 (50ms 소요)

  AbortController 없이:
    userId=2의 응답이 먼저 도착 → setUser(user2) → 화면에 user2 표시
    userId=1의 응답이 늦게 도착 → setUser(user1) → 화면에 user1 표시!
    → 사용자는 userId=2를 선택했지만 userId=1의 데이터가 보인다!
    → "경합 조건(Race Condition)" 버그

  AbortController 사용:
    userId=2 선택 시 → userId=1의 fetch를 abort()로 취소
    → userId=1의 응답은 AbortError로 무시됨
    → userId=2의 응답만 반영됨
    → 올바른 데이터가 표시된다
```

### 3.4 useEffect 안에서의 async 패턴

#### useEffect 콜백은 async가 될 수 없다

```jsx
// ❌ useEffect 콜백 자체를 async로 선언
useEffect(async () => {
  const data = await fetch("/api/data");
  // ...
}, []);

// React 경고:
// "useEffect must not return anything besides a function,
//  which is used for clean-up."
// async 함수는 항상 Promise를 반환하므로 Cleanup으로 인식됨!
```

**왜 안 되는가:**

```
useEffect의 반환값 규칙:
  · undefined (아무것도 반환하지 않음) → OK
  · 함수 (Cleanup 함수) → OK
  · Promise (async 함수의 반환값) → 에러!

  async 함수는 항상 Promise를 반환한다
  → React가 이것을 Cleanup 함수로 해석하려다 실패
```

#### 올바른 async 패턴

```jsx
// 패턴 1: 내부에 async 함수를 정의하고 호출 (권장 ★)
useEffect(() => {
  async function fetchData() {
    const response = await fetch("/api/data");
    const data = await response.json();
    setData(data);
  }

  fetchData();
}, []);

// 패턴 2: IIFE (즉시 실행 함수)
useEffect(() => {
  (async () => {
    const response = await fetch("/api/data");
    const data = await response.json();
    setData(data);
  })();
}, []);

// 패턴 3: then 체이닝 (async/await 없이)
useEffect(() => {
  fetch("/api/data")
    .then((res) => res.json())
    .then((data) => setData(data))
    .catch((err) => setError(err));
}, []);
```

### 3.5 무한 루프 — 가장 흔한 useEffect 실수

#### 패턴 1: 의존성 배열 생략 + setState

```jsx
// ❌ 무한 루프!
function InfiniteLoop() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // State 변경 → 재렌더링 → Effect 재실행 → 반복!
  });
  // 의존성 배열 생략 → 매 렌더링마다 실행

  return <p>{count}</p>;
}
```

```
무한 루프 과정:

  렌더링 #1 → Effect 실행 → setCount(1) → 재렌더링
  렌더링 #2 → Effect 실행 → setCount(2) → 재렌더링
  렌더링 #3 → Effect 실행 → setCount(3) → 재렌더링
  ... (영원히 반복)
```

#### 패턴 2: 객체/배열을 의존성에 넣기

```jsx
// ❌ 무한 루프!
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // 렌더링마다 새 객체가 생성됨
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  useEffect(() => {
    fetch(`/api/users/${userId}`, options)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId, options]);
  // options는 매 렌더링마다 새 객체 → Object.is 비교 실패 → Effect 재실행
  // → setUser → 재렌더링 → 새 options → Effect 재실행 → 무한 루프!

  return <p>{user?.name}</p>;
}
```

```
원인 분석:

  렌더링마다 const options = { ... } 는 새 객체를 생성한다
  Object.is(이전options, 새options) → false (다른 참조!)
  React: "의존성이 변했다!" → Effect 재실행
  setUser(data) → 재렌더링 → 또 새 options → 또 Effect 재실행...

해결법:
  1. 객체를 Effect 안으로 이동 (의존성에서 제거)
  2. useMemo로 객체 참조 안정화 (Step 14)
  3. 필요한 원시값만 의존성에 넣기
```

```jsx
// ✅ 해결: 객체를 Effect 안으로 이동
useEffect(() => {
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  fetch(`/api/users/${userId}`, options)
    .then((res) => res.json())
    .then((data) => setUser(data));
}, [userId]);
// options를 의존성에서 제거 — Effect 안에서만 사용하므로 안전
```

#### 패턴 3: Effect 안에서 의존성 값을 변경

```jsx
// ❌ 무한 루프!
function DataSync({ data }) {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    setProcessedData(data.map((item) => ({ ...item, processed: true })));
  }, [data, processedData]);
  // processedData를 Effect 안에서 변경하면서 의존성에도 넣음
  // → processedData 변경 → Effect 재실행 → 또 변경 → 무한 루프!

  return <ul>{processedData.map(/* ... */)}</ul>;
}

// ✅ 해결: 파생 데이터는 useEffect가 아니라 렌더링 중 계산
function DataSync({ data }) {
  // processedData는 data에서 파생 가능 → State가 아니라 계산!
  const processedData = data.map((item) => ({ ...item, processed: true }));

  return <ul>{processedData.map(/* ... */)}</ul>;
}
```

#### 무한 루프 방지 체크리스트

```
useEffect 작성 시 자문할 것:

  □ 의존성 배열을 빠뜨리지 않았는가? (생략 ≠ 빈 배열)
  □ 의존성에 매 렌더링마다 새로 생성되는 객체/배열/함수가 있는가?
  □ Effect 안에서 setState하는 값이 의존성에 포함되어 있지 않은가?
  □ 이 로직이 정말 useEffect가 필요한가? (파생 데이터가 아닌가?)
```

### 3.6 "useEffect가 필요 없는" 케이스

React 공식 문서는 **"You Might Not Need an Effect"** 라는 항목을 별도로 다룰 만큼, 불필요한 useEffect 사용이 흔하다.

#### 케이스 1: 렌더링 중 계산 가능한 파생 데이터

```jsx
// ❌ 불필요한 useEffect — 파생 데이터를 Effect로 계산
function FilteredList({ items, filter }) {
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    setFilteredItems(items.filter((item) => item.category === filter));
  }, [items, filter]);

  return <ul>{filteredItems.map(/* ... */)}</ul>;
}

// ✅ useEffect 제거 — 렌더링 중 직접 계산
function FilteredList({ items, filter }) {
  const filteredItems = items.filter((item) => item.category === filter);
  return <ul>{filteredItems.map(/* ... */)}</ul>;
}
```

```
왜 useEffect가 나쁜가:

  1. 불필요한 렌더링이 발생한다
     · 첫 렌더링: filteredItems=[] (빈 배열) → 화면에 빈 리스트
     · Effect 실행: setFilteredItems([...]) → 재렌더링
     · 두 번째 렌더링: filteredItems=[...] → 올바른 리스트
     → "빈 화면 깜빡임" 발생 가능!

  2. 렌더링 중 계산하면 1번의 렌더링으로 즉시 올바른 결과 표시

  원칙: "Props/State에서 계산 가능한 값은 useEffect가 아니라
         렌더링 중 직접 계산한다" (Step 6 파생 데이터 원칙)
```

#### 케이스 2: 이벤트 핸들러에서 처리할 수 있는 로직

```jsx
// ❌ 불필요한 useEffect — 이벤트에 대한 반응을 Effect로 처리
function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      fetch(`/api/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data));
    }
  }, [query]);
  // query가 바뀔 때마다 검색 — 작동은 하지만...

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ResultList results={results} />
    </div>
  );
}
```

```
이 코드의 문제:
  · 사용자가 한 글자 입력할 때마다 API 호출
  · 'R', 'Re', 'Rea', 'Reac', 'React' → 5번의 API 호출
  · 디바운싱이 필요하다면 Effect가 더 복잡해짐

더 나은 접근:
  · "사용자가 검색 버튼을 클릭했을 때" → 이벤트 핸들러에서 처리
  · "사용자가 타이핑을 멈추면" → 디바운스된 이벤트 핸들러
  · "query 변경에 반응해 데이터를 동기화" → TanStack Query (Step 23)

실시간 검색이 정말 필요하다면 useEffect도 OK이지만,
대부분은 이벤트 핸들러 + TanStack Query가 더 적합하다.
```

#### 케이스 3: Props 변경에 따른 State 리셋

```jsx
// ❌ 불필요한 useEffect — Props 변경 시 State 리셋
function EditForm({ userId, user }) {
  const [name, setName] = useState(user.name);

  useEffect(() => {
    setName(user.name); // userId가 바뀌면 name을 리셋
  }, [user.name]);

  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

// ✅ key로 해결 — useEffect 불필요 (Step 7 패턴)
<EditForm key={userId} user={user} />;
// userId가 바뀌면 EditForm 전체가 리마운트 → name이 자동으로 초기화
```

#### "useEffect가 필요한가?" 판단 흐름

```
"이 로직에 useEffect가 필요한가?"

  ┌─ Props/State에서 계산 가능한가?
  │    YES → useEffect 불필요. 렌더링 중 직접 계산
  │
  ├─ 사용자 이벤트에 대한 반응인가?
  │    YES → useEffect 불필요. 이벤트 핸들러에서 처리
  │
  ├─ Props 변경 시 State 리셋인가?
  │    YES → useEffect 불필요. key 패턴 사용 (Step 7)
  │
  ├─ 외부 시스템과 동기화해야 하는가?
  │    (이벤트 리스너, 타이머, WebSocket, 외부 라이브러리)
  │    YES → useEffect 필요 ✅
  │
  └─ 컴포넌트가 화면에 나타날 때 데이터를 가져와야 하는가?
       YES → useEffect 필요 ✅ (또는 TanStack Query 등 라이브러리)
```

### 3.7 useEffect vs useLayoutEffect

```
┌──────────────────┬───────────────────────┬───────────────────────┐
│                  │  useEffect            │  useLayoutEffect      │
├──────────────────┼───────────────────────┼───────────────────────┤
│  실행 시점       │  Paint 후 (비동기)     │  DOM 변경 후,          │
│                  │                       │  Paint 전 (동기)       │
│  Paint 차단      │  차단하지 않음         │  차단함 ★             │
│  용도            │  대부분의 부수 효과    │  DOM 측정, 레이아웃    │
│                  │  데이터 패칭, 구독    │  조정, 깜빡임 방지     │
│  사용 빈도       │  95% 이상             │  5% 미만              │
│  SSR 호환        │  호환됨               │  경고 발생 가능        │
│  기본 선택       │  ★ 항상 이것부터      │  특수한 경우에만       │
└──────────────────┴───────────────────────┴───────────────────────┘
```

```jsx
// useLayoutEffect가 필요한 전형적 사례: 툴팁 위치 조정
function Tooltip({ targetRef, text }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // DOM이 변경된 직후, Paint 전에 위치를 계산
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: targetRect.top - tooltipRect.height - 8,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    });
  }, [targetRef, text]);

  // useEffect로 하면: 초기 위치(0,0)에 잠깐 표시 → 올바른 위치로 이동 (깜빡임!)
  // useLayoutEffect로 하면: Paint 전에 위치가 결정 → 깜빡임 없음

  return (
    <div ref={tooltipRef} style={{ position: "fixed", ...position }}>
      {text}
    </div>
  );
}
```

> 💡 **원칙: "useEffect를 먼저 사용하고, 깜빡임이 발생할 때만 useLayoutEffect로 전환한다."** useLayoutEffect는 Paint를 차단하므로 남용하면 성능이 저하된다.

### 3.8 useEffect를 "동기화(Synchronization)"로 이해하기

#### 잘못된 멘탈 모델 vs 올바른 멘탈 모델

```
❌ 잘못된 멘탈 모델: "라이프사이클 이벤트"

  "마운트 시 이것을 하고, 언마운트 시 저것을 하고..."
  → componentDidMount, componentWillUnmount의 사고 방식
  → "시점"에 집중

✅ 올바른 멘탈 모델: "외부 시스템과의 동기화"

  "이 State/Props가 변할 때 외부 시스템을 동기화한다"
  → "무엇과 동기화하는가"에 집중
  → Setup = 동기화 시작, Cleanup = 동기화 중단
```

```jsx
// 올바른 멘탈 모델로 읽기

// "채팅방 연결을 roomId와 동기화한다"
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect(); // 동기화 시작

  return () => {
    connection.disconnect(); // 동기화 중단
  };
}, [roomId]);
// roomId가 바뀌면:
//   1. 이전 roomId의 연결을 끊고 (Cleanup)
//   2. 새 roomId로 연결한다 (Setup)
// → "채팅방 연결"이 항상 현재 roomId와 동기화된다

// "document.title을 count와 동기화한다"
useEffect(() => {
  document.title = `${count}번 클릭`;
}, [count]);
// count가 바뀌면 document.title이 자동으로 업데이트된다
// → document.title이 항상 현재 count와 동기화된다
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 데이터 패칭의 완전한 패턴

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    // userId가 없으면 실행하지 않음
    if (!userId) return;

    const controller = new AbortController();
    let isCancelled = false;

    async function fetchUser() {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!isCancelled) {
          setUser(data);
          setStatus("success");
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.name !== "AbortError") {
            setError(err.message);
            setStatus("error");
          }
        }
      }
    }

    fetchUser();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [userId]);

  // Guard Clause로 4가지 UI 상태 처리 (Step 9 복습)
  if (status === "idle") return null;
  if (status === "loading") return <p>로딩 중...</p>;
  if (status === "error") return <p>에러: {error}</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

```
이 패턴에서 주의할 점:

  1. AbortController로 Race Condition 방지
  2. isCancelled 플래그로 언마운트 후 setState 방지
  3. AbortError는 의도적 취소이므로 에러로 처리하지 않음
  4. 로딩/에러/성공 상태를 체계적으로 관리

  ※ 실무에서는 이 복잡한 패턴을 직접 작성하기보다
     TanStack Query (Step 23)를 사용하는 것이 일반적이다
     TanStack Query가 위의 모든 처리를 내장하고 있다
```

### 4.2 사례: StrictMode에서 Effect가 두 번 실행되는 이유

```
StrictMode에서의 useEffect 동작 (개발 모드)

  일반 모드:
    마운트 → Setup 실행

  StrictMode:
    마운트 → Setup 실행 → Cleanup 실행 → Setup 다시 실행 ★

  왜?
    · "Cleanup → 재Setup" 사이클이 올바르게 동작하는지 검증
    · Cleanup이 Setup을 완전히 되돌리는지 확인
    · 두 번 실행해도 동일한 결과가 나와야 한다

  예시:
    // ✅ StrictMode에서도 안전 — Cleanup이 Setup을 완전히 되돌림
    useEffect(() => {
      const id = setInterval(() => tick(), 1000);
      return () => clearInterval(id);
    }, []);
    // Setup 1: setInterval → id=1
    // Cleanup 1: clearInterval(1)
    // Setup 2: setInterval → id=2
    // → 최종: 타이머 1개만 동작 ✅

    // ❌ StrictMode에서 문제 — Cleanup이 불완전
    useEffect(() => {
      items.push('new');  // 외부 배열을 변경
      return () => {};    // 아무것도 정리 안 함!
    }, []);
    // Setup 1: items = [..., 'new']
    // Cleanup 1: (아무것도 안 함)
    // Setup 2: items = [..., 'new', 'new']  ← 중복!
    // → StrictMode가 버그를 발견해 줌
```

### 4.3 사례: 불필요한 useEffect를 제거하여 코드 개선

```jsx
// ❌ Before: useEffect 남용
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [isOnSale, setIsOnSale] = useState(false);

  // Effect 1: 데이터 패칭 — 이것은 필요함 ✅
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);

  // Effect 2: 할인가 계산 — 불필요! 파생 데이터
  useEffect(() => {
    if (product) {
      setFinalPrice(product.price * (1 - discount / 100));
    }
  }, [product, discount]);

  // Effect 3: 세일 여부 판단 — 불필요! 파생 데이터
  useEffect(() => {
    setIsOnSale(discount > 0);
  }, [discount]);

  return (/* ... */);
}


// ✅ After: 불필요한 Effect 제거
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [discount, setDiscount] = useState(0);

  // 필요한 Effect만 유지
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);

  // 파생 데이터는 렌더링 중 직접 계산
  const finalPrice = product ? product.price * (1 - discount / 100) : 0;
  const isOnSale = discount > 0;

  return (/* ... */);
}
```

```
개선 효과:
  · State 4개 → 2개로 감소
  · useEffect 3개 → 1개로 감소
  · 불필요한 중간 렌더링 제거
  · 코드가 더 간결하고 추론하기 쉬움
  · "빈 화면 깜빡임" 방지 (파생 데이터가 즉시 계산되므로)
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: useEffect 실행 순서 관찰 [Understanding]

**목표:** useEffect, Cleanup, useLayoutEffect의 실행 순서를 직접 관찰한다.

아래 코드를 실행하고 콘솔 로그 순서를 관찰하라.

```jsx
function EffectOrder() {
  const [count, setCount] = useState(0);

  console.log("A: 렌더링, count =", count);

  useEffect(() => {
    console.log("B: useEffect setup, count =", count);
    return () => console.log("C: useEffect cleanup, count =", count);
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

**기록할 것:**

- 초기 마운트 시 로그 순서
- 버튼 클릭 후 로그 순서
- Cleanup의 count 값이 Setup의 count 값과 다른 이유
- StrictMode에서의 로그 패턴

---

### 실습 2: 데이터 패칭 구현 [Applying]

**목표:** useEffect로 올바른 데이터 패칭 패턴을 구현한다.

**GitHub 사용자 검색**을 만든다:

```
요구사항:
  · 검색어 입력 → GitHub API로 사용자 검색
  · API: https://api.github.com/search/users?q={검색어}
  · 4가지 UI 상태 (idle, loading, error, success) 처리
  · 검색어가 비어있으면 요청하지 않음
  · AbortController로 이전 요청 취소 (Race Condition 방지)
  · 결과가 없을 때 Empty State 표시

선택:
  · 검색어 변경 시 300ms 디바운스 적용
    (힌트: setTimeout + Cleanup에서 clearTimeout)
```

---

### 실습 3: 무한 루프 디버깅 [Analyzing]

**목표:** 무한 루프가 발생하는 코드를 식별하고 수정한다.

아래 4개의 코드에서 무한 루프가 발생하는 것을 **모두** 찾고, 각각의 원인과 해결법을 제시하라.

```jsx
// 코드 A
function ComponentA() {
  const [items, setItems] = useState([1, 2, 3]);
  const [doubled, setDoubled] = useState([]);

  useEffect(() => {
    setDoubled(items.map((i) => i * 2));
  }, [items, doubled]);

  return <p>{doubled.join(", ")}</p>;
}

// 코드 B
function ComponentB({ data }) {
  const [processed, setProcessed] = useState(null);
  const config = { sort: true, limit: 10 };

  useEffect(() => {
    setProcessed(processData(data, config));
  }, [data, config]);

  return <p>{processed}</p>;
}

// 코드 C
function ComponentC() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);

  return <p>{count}</p>;
}

// 코드 D
function ComponentD({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  });

  return <p>{user?.name}</p>;
}
```

---

### 실습 4 (선택): 불필요한 useEffect 제거 리팩토링 [Evaluating]

**목표:** 불필요한 useEffect를 식별하고 제거한다.

아래 코드에서 **불필요한 useEffect를 모두 찾아 제거**하고, 파생 데이터 또는 이벤트 핸들러로 대체하라.

```jsx
function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    setSubtotal(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  }, [items]);

  useEffect(() => {
    if (coupon === 'SAVE10') setDiscount(subtotal * 0.1);
    else if (coupon === 'SAVE20') setDiscount(subtotal * 0.2);
    else setDiscount(0);
  }, [coupon, subtotal]);

  useEffect(() => {
    setTotal(subtotal - discount);
  }, [subtotal, discount]);

  useEffect(() => {
    setItemCount(items.reduce((sum, item) => sum + item.qty, 0));
  }, [items]);

  useEffect(() => {
    setIsEmpty(items.length === 0);
  }, [items]);

  return (/* ... */);
}
```

**리팩토링 후 남아야 하는 State 개수는?**

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 11 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. useEffect = 렌더링 이후 부수 효과를 실행하는 Hook         │
│     → Paint 후 비동기 실행 (화면 그리기를 차단하지 않음)       │
│     → 렌더링과 부수 효과를 분리하는 핵심 메커니즘             │
│                                                               │
│  2. 의존성 배열의 3가지 형태                                  │
│     → [dep1, dep2]: 마운트 + 의존성 변경 시 (가장 자주 사용)  │
│     → []: 마운트 시 1번만                                    │
│     → (생략): 매 렌더링마다 (거의 사용하지 않음)              │
│                                                               │
│  3. Cleanup = "이전 효과를 정리한다"                          │
│     → 새 Effect 실행 전에 이전 Cleanup 실행                  │
│     → 언마운트 시에도 마지막 Cleanup 실행                    │
│     → Setup에서 시작한 것은 Cleanup에서 멈춘다               │
│                                                               │
│  4. async 패턴: Effect 콜백 자체는 async 불가                 │
│     → 내부에 async 함수를 정의하고 호출하는 패턴 사용         │
│     → AbortController로 Race Condition 방지                  │
│                                                               │
│  5. 무한 루프 3대 원인                                       │
│     → 의존성 배열 생략 + setState                            │
│     → 매 렌더링 새로 생성되는 객체/배열을 의존성에 포함       │
│     → Effect 안에서 변경하는 값을 의존성에 포함               │
│                                                               │
│  6. useEffect가 필요 없는 케이스를 판별한다                   │
│     → 파생 데이터: 렌더링 중 직접 계산                       │
│     → 이벤트 반응: 이벤트 핸들러에서 처리                    │
│     → State 리셋: key 패턴 (Step 7)                         │
│     → 불필요한 Effect = 불필요한 렌더링 + 코드 복잡성        │
│                                                               │
│  7. useEffect vs useLayoutEffect                             │
│     → useEffect: Paint 후, 비동기, 기본 선택 (95%+)         │
│     → useLayoutEffect: Paint 전, 동기, DOM 측정용 (5%)       │
│     → useEffect를 먼저 사용하고 깜빡임 시에만 전환           │
│                                                               │
│  8. useEffect를 "동기화"로 이해한다                           │
│     → "마운트/언마운트"가 아니라                              │
│     → "외부 시스템을 현재 State/Props와 동기화한다"           │
│     → Setup = 동기화 시작, Cleanup = 동기화 중단              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                            | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | useEffect의 3가지 의존성 배열 형태와 각각의 실행 조건은?                        | Remember   | 3.2         |
| 2   | useEffect가 브라우저 Paint 이후에 실행되는 것이 UX에 주는 이점은?               | Understand | 3.1         |
| 3   | Cleanup 함수가 "새 Effect 실행 전에" 호출되는 이유를 "동기화" 관점에서 설명하라 | Understand | 3.3, 3.8    |
| 4   | useEffect 콜백을 async로 선언할 수 없는 기술적 이유는?                          | Understand | 3.4         |
| 5   | AbortController가 Race Condition을 방지하는 원리를 설명하라                     | Apply      | 3.3         |
| 6   | `const options = {}` 를 useEffect 의존성에 넣으면 무한 루프가 발생하는 이유는?  | Analyze    | 3.5         |
| 7   | `filteredItems`를 useEffect + setState로 계산하는 것이 나쁜 이유 2가지는?       | Analyze    | 3.6         |
| 8   | "이 로직에 useEffect가 필요한가?" 판단 흐름의 4가지 질문을 나열하라             | Evaluate   | 3.6         |

### 6.3 FAQ

**Q1. useEffect 안에서 async/await를 쓰고 싶은데, 항상 내부 함수를 만들어야 하나요?**

네, useEffect 콜백 자체를 async로 선언하면 React가 반환값을 Cleanup 함수로 해석하려다 문제가 생깁니다. 가장 권장되는 패턴은 내부에 async 함수를 정의하고 즉시 호출하는 것입니다. IIFE 패턴 `(async () => { ... })()` 도 동일하게 작동하므로 팀의 코딩 스타일에 맞게 선택하면 됩니다.

**Q2. 의존성 배열에 함수를 넣으면 무한 루프가 될 수 있다고 들었는데, 왜 그런가요?**

컴포넌트 함수 본문에서 선언된 함수는 매 렌더링마다 새로 생성됩니다. 즉, `const handleClick = () => {}` 는 렌더링할 때마다 다른 참조를 가집니다. 이 함수를 의존성 배열에 넣으면 React는 "의존성이 변했다"고 판단하여 Effect를 재실행하고, Effect가 setState를 포함하면 무한 루프가 됩니다. 해결책은 함수를 Effect 안으로 이동하거나, useCallback으로 참조를 안정화하는 것입니다(Step 14).

**Q3. useEffect를 커스텀 Hook으로 추출하면 어떤 이점이 있나요?**

useEffect를 포함한 로직을 커스텀 Hook으로 추출하면 여러 컴포넌트에서 재사용할 수 있고, 컴포넌트 코드가 간결해집니다. 예를 들어 `useWindowSize()`, `useFetch(url)`, `useLocalStorage(key)` 같은 커스텀 Hook은 내부적으로 useEffect를 사용하면서 외부에는 깔끔한 인터페이스만 노출합니다. 커스텀 Hook은 Step 16에서 상세히 다룹니다.

**Q4. StrictMode에서 Effect가 두 번 실행되는데, 이것이 프로덕션에서도 발생하나요?**

아니요. StrictMode의 이중 실행은 개발 모드에서만 발생합니다. React가 Cleanup-Setup 사이클이 올바르게 작동하는지 검증하기 위한 의도적인 동작입니다. 프로덕션 빌드(`npm run build`)에서는 Effect가 정상적으로 한 번만 실행됩니다.

**Q5. useEffect 없이 데이터를 가져올 수 있는 더 나은 방법이 있나요?**

네. 실무에서는 TanStack Query(구 React Query)나 SWR 같은 데이터 패칭 라이브러리를 사용하는 것이 표준입니다. 이 라이브러리들은 캐싱, 중복 요청 방지, Race Condition 처리, 로딩/에러 상태 관리 등을 자동으로 처리합니다. Step 23에서 TanStack Query를 상세히 학습합니다. Next.js의 App Router 환경에서는 서버 컴포넌트에서 직접 데이터를 가져오는 방법도 있습니다(Step 21).

---

## 7. 다음 단계 예고

> **Step 12. useRef와 DOM 접근 전략**
>
> - useRef의 본질: "렌더링에 영향을 주지 않는 변경 가능한 값"
> - DOM 노드에 직접 접근하는 패턴 (ref 속성)
> - forwardRef와 React 19의 ref Props 변경
> - useImperativeHandle로 노출 API 제어
> - useRef vs useState: 언제 어떤 것을 사용하는가
> - Stale Closure 해결에서의 useRef 활용

---

## 📚 참고 자료

- [React 공식 문서 — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React 공식 문서 — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 공식 문서 — Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [React 공식 문서 — Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
- [React 공식 문서 — useEffect Reference](https://react.dev/reference/react/useEffect)
- [React 공식 문서 — useLayoutEffect Reference](https://react.dev/reference/react/useLayoutEffect)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 11 of 42
