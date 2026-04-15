# Step 27. 컴포넌트 설계 패턴

> **난이도:** 🔴 고급 (Advanced)

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| **Remember**   | Compound Component, Render Props, HOC, Headless Component 패턴의 정의를 기술할 수 있다 |
| **Understand** | 각 패턴이 해결하는 문제와 적합한 상황을 설명할 수 있다                                 |
| **Apply**      | Compound Component 패턴으로 유연한 UI 컴포넌트를 구현할 수 있다                        |
| **Analyze**    | 레거시 패턴(HOC, Render Props)과 현대 패턴(Hook, Compound)의 차이를 분석할 수 있다     |
| **Evaluate**   | 컴포넌트의 재사용성, 유연성, API 품질을 판단하고 적합한 패턴을 선택할 수 있다          |

**전제 지식:**

- Step 5: Props, Composition(합성), children
- Step 14: React.memo, useCallback
- Step 16: Custom Hook 설계 패턴
- Step 25: Context API (Compound 패턴에서 활용)

---

## 1. 서론 — "좋은 컴포넌트"란 무엇인가

### 1.1 컴포넌트 설계의 역사적 배경

React가 2013년 공개되었을 때, "컴포넌트 기반 UI"라는 개념 자체가 혁신이었다. 초기에는 단순히 UI를 조각으로 나누는 것만으로도 충분했다. 그러나 컴포넌트 수가 수십, 수백 개로 늘어나면서 새로운 과제가 등장했다: **어떻게 로직을 재사용하고, 어떻게 컴포넌트를 유연하게 만들 것인가?**

2015~2016년 class 컴포넌트 시대에는 Mixins이 로직 재사용 수단이었으나, 암묵적 의존성과 이름 충돌 문제로 폐기됐다. 그 자리를 HOC(Higher-Order Component)가 대신했고, 이어서 Render Props 패턴이 등장했다. 2019년 React 16.8의 Hooks 도입은 패러다임을 전환했다. 로직 재사용 문제는 Custom Hook으로 우아하게 해결되었고, HOC와 Render Props의 대부분 사용 사례가 대체됐다.

그러나 Hook이 "로직 재사용" 문제를 해결했다고 해서 모든 설계 과제가 해소된 것은 아니었다. **"UI 구조의 유연성"** — 사용자가 컴포넌트의 내부 구조를 자유롭게 제어하고 싶은 요구 — 는 Hook만으로 충족하기 어렵다. 이 지점에서 Compound Component 패턴과 Headless Component 패턴이 현대 React 개발의 핵심 도구로 부상했다.

### 1.2 재사용 가능한 컴포넌트의 조건

Step 5에서 "합성(Composition) > 상속"이라는 React의 원칙을 배웠다. 이 Step에서는 합성을 더 정교하게 활용하는 **설계 패턴**들을 학습한다.

```
좋은 컴포넌트의 5가지 조건

  1. 재사용 가능 (Reusable)
     · 다른 맥락에서도 사용할 수 있다
     · 특정 데이터나 레이아웃에 종속되지 않는다

  2. 유연함 (Flexible)
     · 사용하는 측에서 동작을 커스터마이즈할 수 있다
     · "딱 하나의 방식"만 강제하지 않는다

  3. 예측 가능 (Predictable)
     · Props에 따라 동작이 명확하다
     · 숨겨진 부수 효과가 없다

  4. 구성 가능 (Composable)
     · 다른 컴포넌트와 자유롭게 결합할 수 있다
     · 내부 구조를 사용자가 제어할 수 있다

  5. 인터페이스가 명확 (Clear API)
     · Props가 직관적이다
     · 문서 없이도 사용법을 짐작할 수 있다
```

### 1.3 산업적 가치 — 왜 설계 패턴이 중요한가

컴포넌트 설계 패턴은 단순히 코드를 "더 예쁘게" 만드는 것이 아니다. 잘못 설계된 컴포넌트는 기술 부채(technical debt)로 축적되어 팀의 개발 속도를 떨어뜨린다. 예를 들어 Props 기반 컴포넌트에 기능이 추가될 때마다 Props 인터페이스가 비대해지는 "Prop Explosion" 현상은, 처음에 Compound 패턴으로 설계했다면 완전히 피할 수 있었을 문제다.

라이브러리 수준의 컴포넌트(Radix UI, Headless UI, React Aria 등)가 Compound Component와 Headless 패턴을 채택하는 이유도 동일하다. 어떤 디자인 시스템에도 통합될 수 있으려면, 컴포넌트가 UI를 강제해서는 안 된다. 로직만 제공하고 UI 결정권을 사용자에게 넘기는 것이 라이브러리 설계의 현대적 표준이다.

### 1.4 패턴 진화 개념 지도


![컴포넌트 설계 패턴 진화 개념 지도](/developer-open-book/diagrams/react-step27-컴포넌트-설계-패턴-진화-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step27-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 Compound Component — 암묵적 상태 공유

**Compound Component**는 여러 컴포넌트가 암묵적으로 상태를 공유하면서 함께 동작하는 패턴이다. HTML의 `<select>`와 `<option>` 관계가 대표적인 비유다.

이 패턴이 중요한 이유는 유연성과 캡슐화를 동시에 달성하기 때문이다. 내부 상태(예: 열림/닫힘, 선택된 값)는 루트 컴포넌트가 관리하여 캡슐화되고, 사용자는 하위 컴포넌트의 배치와 내용을 자유롭게 제어할 수 있다. Props 기반 컴포넌트에서는 "어떤 내용을 렌더링할지"를 Props로 전달해야 하므로 인터페이스가 비대해지지만, Compound 패턴에서는 children 구조 자체가 인터페이스다.

### 2.2 Render Props — 렌더링 위임

**Render Props**는 컴포넌트에 함수를 Props로 전달하여 렌더링할 내용을 위임하는 패턴이다. 컴포넌트가 로직(상태, 이벤트)을 제공하고, "무엇을 렌더링할지"는 호출자가 결정한다.

Hook 이전에는 상태 로직을 여러 컴포넌트에서 재사용하는 핵심 방법이었다. 현재는 Custom Hook이 대부분 대체했지만, 라이브러리가 "렌더링 커스터마이즈" 지점을 제공할 때 여전히 활용된다.

### 2.3 HOC — 컴포넌트를 감싸는 함수

**HOC(Higher-Order Component)**는 컴포넌트를 인자로 받아 기능이 추가된 새 컴포넌트를 반환하는 함수다. 함수형 프로그래밍의 고차 함수 개념을 컴포넌트에 적용한 패턴이다.

횡단 관심사(인증 체크, 로깅, 테마 적용 등)를 컴포넌트에 주입하는 데 사용되었으나, "Wrapper Hell"과 Props 충돌 문제로 Hook에 의해 대부분 대체되었다. `React.memo`는 기술적으로 HOC의 일종으로 현재도 사용된다.

### 2.4 Headless Component — 로직만 제공

**Headless Component**는 UI를 포함하지 않고 로직만 제공하는 컴포넌트/Hook이다. 사용자가 UI를 완전히 제어하며, 라이브러리는 접근성(a11y), 상태 관리, 키보드 인터랙션 등 복잡한 로직만 담당한다.

이 패턴이 중요한 이유는 "어떤 디자인 시스템에도 통합 가능한 컴포넌트"를 만들 수 있기 때문이다. 일반 컴포넌트는 스타일이 내장되어 있어 다른 디자인 시스템과 통합하기 어렵지만, Headless 컴포넌트는 로직만 제공하므로 어떤 스타일과도 결합할 수 있다.

### 2.5 Inversion of Control — 제어의 역전

**Inversion of Control(IoC, 제어의 역전)**은 라이브러리/컴포넌트가 "무엇을 렌더링할지"의 결정권을 사용자에게 넘기는 원칙이다. 유연한 컴포넌트 설계의 핵심 원칙이다.

일반적인 컴포넌트는 "내가 어떻게 동작할지"를 스스로 결정한다. IoC는 이 결정권을 사용자에게 위임하여 컴포넌트를 더 유연하게 만든다. Headless Component는 IoC의 극단적 형태로, 로직만 제공하고 나머지 결정을 모두 사용자에게 넘긴다.

### 2.6 핵심 용어 요약

| 용어                     | 정의                                                                                                          | 왜 중요한가                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Compound Component**   | 여러 컴포넌트가 **암묵적으로 상태를 공유**하면서 함께 동작하는 패턴. HTML의 `<select>`+`<option>` 관계와 유사 | 유연한 UI 구성을 허용하면서 내부 상태를 캡슐화한다        |
| **Render Props**         | 컴포넌트에 **함수를 Props로 전달**하여 렌더링할 내용을 위임하는 패턴                                          | Hook 이전에 로직 재사용의 핵심 방법이었다                 |
| **HOC**                  | Higher-Order Component. 컴포넌트를 인자로 받아 **기능이 추가된 새 컴포넌트를 반환**하는 함수                  | Hook 이전의 횡단 관심사(cross-cutting concerns) 처리 방법 |
| **Headless Component**   | **UI를 포함하지 않고 로직만 제공**하는 컴포넌트/Hook. 사용자가 UI를 완전히 제어                               | 최대한의 커스터마이즈를 허용하는 라이브러리 설계 방식     |
| **Inversion of Control** | 제어의 역전. 라이브러리/컴포넌트가 "무엇을 렌더링할지"의 **결정권을 사용자에게 넘기는** 원칙                  | 유연한 컴포넌트의 핵심 설계 원칙                          |
| **Slot Pattern**         | 컴포넌트의 특정 영역에 **사용자가 원하는 콘텐츠를 "끼워 넣는"** 패턴. children, named props 활용              | 레이아웃 컴포넌트에서 자주 사용                           |

### 2.7 패턴의 역사적 진화


![React 컴포넌트 재사용 패턴의 진화](/developer-open-book/diagrams/react-step27-react-컴포넌트-재사용-패턴의-진화.svg)


### 2.8 패턴 간 관계 다이어그램


![컴포넌트 설계 패턴 관계도](/developer-open-book/diagrams/react-step27-컴포넌트-설계-패턴-관계도.svg)


---

## 3. 이론과 원리

### 3.1 Presentational vs Container — 현대적 해석

#### 원래 패턴 (Dan Abramov, 2015)

```
원래 제안:

  Container Component:
    · 데이터를 가져온다 (API 호출, State 관리)
    · 비즈니스 로직을 포함한다
    · 자식에게 데이터를 Props로 전달한다

  Presentational Component:
    · Props로 받은 데이터를 표시만 한다
    · 자체 State가 없다 (UI State 제외)
    · 재사용 가능한 순수 UI

  문제: Hook이 등장하면서 이 구분이 모호해졌다
        Dan Abramov 본인도 "더 이상 이렇게 나눌 필요 없다"고 번복
```

#### 현대적 해석 (Hook 시대)

이 패턴의 폐기가 의미하는 것은 "관심사 분리" 원칙 자체가 무효가 됐다는 뜻이 아니다. Custom Hook이 Container의 역할을 더 우아하게 수행할 수 있게 됐을 뿐이다. 컴포넌트는 Hook이 제공하는 데이터를 받아 렌더링에만 집중하면 되므로, 결과적으로 Presentational Component의 순수성은 더 잘 보장된다.

```
2024년 현재의 해석:

  · 이 패턴을 "엄격하게 폴더로 분리"하는 것은 권장하지 않는다
  · 하지만 "관심사 분리"의 원칙은 여전히 유효하다

  실전에서의 적용:

    1. Custom Hook = 과거의 Container 역할
       · 데이터 패칭, State 관리, 비즈니스 로직
       · useUsers(), useCart(), useAuth()

    2. 컴포넌트 = 과거의 Presentational 역할
       · Hook에서 받은 데이터를 렌더링
       · UI 로직(조건부 렌더링, 리스트 등)에 집중

    따라서 Container 컴포넌트를 별도로 만들 필요 없이
    Custom Hook이 그 역할을 대신한다.

  // 현대 패턴
  function UserList() {
    const { data: users, isLoading } = useUsers();  // "Container" 역할
    if (isLoading) return <Spinner />;
    return <UserGrid users={users} />;               // "Presentational" 역할
  }
```

### 3.2 Compound Component 패턴 ★

#### 핵심 아이디어

Compound Component의 본질은 "부모가 상태를 소유하고, 자식들이 그 상태에 참여한다"는 구조다. Context가 이를 가능하게 하는 메커니즘이다. 외부에서 Context를 직접 사용할 수 없도록 숨기고, 오직 하위 컴포넌트들만 Context에 접근하도록 설계한다.

```
HTML의 자연스러운 합성 관계에서 영감

  <select>
    <option value="a">A</option>
    <option value="b">B</option>
  </select>

  · <select>와 <option>은 "함께" 동작한다
  · <select>가 내부 상태(선택된 값)를 관리한다
  · <option>은 부모의 상태에 "참여"한다
  · 사용자는 <option>의 순서와 내용을 자유롭게 구성한다

  이 관계를 React 컴포넌트로 구현하는 것이 Compound Component
```

#### 구현: Accordion 컴포넌트

```jsx
import { createContext, useContext, useState } from "react";

// ── 내부 Context (외부에 노출하지 않음) ──
const AccordionContext = createContext(null);

// ── 루트 컴포넌트 ──
function Accordion({ children, defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// ── 하위 컴포넌트: Item ──
function AccordionItem({ children, id }) {
  const { openId } = useContext(AccordionContext);
  const isOpen = openId === id;

  return (
    <div className={`accordion-item ${isOpen ? "open" : ""}`}>{children}</div>
  );
}

// ── 하위 컴포넌트: Header (클릭하면 토글) ──
function AccordionHeader({ children, id }) {
  const { openId, toggle } = useContext(AccordionContext);
  const isOpen = openId === id;

  return (
    <button
      className="accordion-header"
      onClick={() => toggle(id)}
      aria-expanded={isOpen}
    >
      {children}
      <span>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

// ── 하위 컴포넌트: Panel (열려 있을 때만 표시) ──
function AccordionPanel({ children, id }) {
  const { openId } = useContext(AccordionContext);
  if (openId !== id) return null;

  return (
    <div className="accordion-panel" role="region">
      {children}
    </div>
  );
}

// ── 네임스페이스로 묶기 ──
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

export default Accordion;
```

```jsx
// ── 사용 ──
function FAQ() {
  return (
    <Accordion defaultOpenId="q1">
      <Accordion.Item id="q1">
        <Accordion.Header id="q1">React란 무엇인가요?</Accordion.Header>
        <Accordion.Panel id="q1">
          React는 UI를 구축하기 위한 JavaScript 라이브러리입니다.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="q2">
        <Accordion.Header id="q2">Hooks란 무엇인가요?</Accordion.Header>
        <Accordion.Panel id="q2">
          Hooks는 함수 컴포넌트에서 State와 생명주기를 사용하게 해주는
          API입니다.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="q3">
        <Accordion.Header id="q3">Context란 무엇인가요?</Accordion.Header>
        <Accordion.Panel id="q3">
          Context는 Props Drilling 없이 데이터를 전달하는 메커니즘입니다.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
```


![Compound Component의 특징](/developer-open-book/diagrams/react-step27-compound-component의-특징.svg)


#### Compound 패턴이 적합한 컴포넌트

```
Compound Component가 빛나는 UI

  · Accordion (접고 펼치기)
  · Tabs (탭 전환)
  · Dropdown / Select (선택 메뉴)
  · Modal / Dialog (모달 + Trigger + Content)
  · Menu (메뉴 + MenuItem)
  · Table (Table + Header + Row + Cell)
  · Form (Form + Field + Label + Error)
  · Carousel (Carousel + Slide + Controls)

  공통점:
    · 여러 하위 컴포넌트가 "함께" 동작한다
    · 내부 상태를 공유해야 한다 (열림/닫힘, 선택된 값 등)
    · 사용자가 하위 컴포넌트의 구조와 내용을 제어하고 싶다
```

### 3.3 Render Props 패턴 (역사와 현재)

#### 개념

Render Props는 당시로서는 혁신적인 패턴이었다. 컴포넌트가 내부 상태를 가지면서도 그 상태를 "어떻게 표현할지"를 외부에 위임할 수 있었기 때문이다. 단, 이 위임이 함수를 통해 이루어지므로 중첩이 발생하는 구조적 한계가 있었다.

```jsx
// Render Props: "무엇을 렌더링할지"를 함수로 전달하는 패턴

// 컴포넌트가 로직을 제공하고, 렌더링은 사용자에게 위임
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // "이 데이터로 무엇을 렌더링할지"는 사용자가 결정
  return render(position);
}

// 사용
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>
          마우스 위치: {x}, {y}
        </p>
      )}
    />
  );
}

// children을 함수로 사용하는 변형 (더 흔함)
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // ... 동일 로직
  return children(position);
}

<MouseTracker>
  {({ x, y }) => (
    <p>
      마우스 위치: {x}, {y}
    </p>
  )}
</MouseTracker>;
```

#### 현재 위치: Hook이 대부분 대체


![Render Props가 해결하던 문제:](/developer-open-book/diagrams/react-step27-render-props가-해결하던-문제.svg)


### 3.4 HOC(Higher-Order Component) 패턴 (역사와 현재)

#### 개념

HOC는 함수형 프로그래밍의 고차 함수 개념을 컴포넌트에 적용한 패턴이다. 원본 컴포넌트를 변경하지 않고 새 컴포넌트로 감싸서 기능을 추가하는 방식은, 개방-폐쇄 원칙(OCP)과 일치하는 우아한 아이디어였다. Redux의 `connect()`, React Router v5의 `withRouter()` 등이 대표적인 HOC였다.

```jsx
// HOC = 컴포넌트를 인자로 받아 "강화된" 컴포넌트를 반환하는 함수

function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    return <WrappedComponent {...props} user={user} />;
  };
}

// 사용
const ProtectedDashboard = withAuth(Dashboard);
// <ProtectedDashboard /> → 인증 체크 후 <Dashboard user={user} /> 렌더링

// 실제 사용 예시 (라이브러리)
// React Router v5: withRouter(Component)
// Redux: connect(mapState, mapDispatch)(Component)
// React-intl: injectIntl(Component)
```

#### 현재 위치: Hook이 대부분 대체

```
HOC가 해결하던 문제:
  · 횡단 관심사 (인증, 로깅, 테마 등)를 여러 컴포넌트에 적용
  · 공통 로직을 "감싸기"로 추가

HOC의 문제점:
  1. "Wrapper Hell": HOC를 중첩하면 컴포넌트 트리가 깊어짐
     withAuth(withTheme(withRouter(MyComponent)))

  2. Props 충돌: HOC가 주입하는 Props가 기존 Props와 이름 충돌
     두 HOC가 모두 `data` Props를 주입하면?

  3. 정적 분석 어려움: 어떤 Props가 어디서 오는지 추적 곤란

  4. ref 전달 복잡: forwardRef 필요

Custom Hook이 더 나은 이유:
  · 중첩 없이 순서대로 호출
  · Props 충돌 없음 (반환값 이름을 자유롭게)
  · 타입 추론 자연스러움
  · ref 전달 문제 없음

현재 HOC가 여전히 사용되는 경우:
  · 레거시 코드 유지보수 (Redux connect 등)
  · React.memo() (기술적으로 HOC이다!)
  · ErrorBoundary를 함수형으로 감싸는 래퍼
  · 서드파티 라이브러리 통합
```

### 3.5 Headless Component 패턴

#### 핵심 아이디어

Headless Component의 등장 배경은 라이브러리 생태계의 요구에서 비롯됐다. Tailwind CSS가 유틸리티 클래스 방식으로 스타일링을 민주화하면서, 개발자들은 "로직은 라이브러리에서, 스타일은 직접"이라는 패턴을 선호하게 됐다. 이에 부응하여 Radix UI, Headless UI, React Aria 같은 라이브러리들이 UI 없이 로직만 제공하는 형태로 설계되었다.

```
Headless = "머리(UI)가 없는"

  일반 컴포넌트:
    · 로직(상태, 이벤트) + UI(HTML, 스타일)가 함께 제공
    · 사용자: "이대로 쓰거나, 안 쓰거나"

  Headless 컴포넌트:
    · 로직만 제공, UI는 사용자가 완전히 제어
    · 사용자: "로직은 가져다 쓰고, UI는 내가 만든다"

  비유:
    일반 = 완제품 자동차 (디자인 변경 불가)
    Headless = 엔진 + 섀시만 제공 (차체 디자인은 자유)
```

#### Custom Hook으로 구현하는 Headless 패턴

```jsx
// Headless Toggle Hook — UI 없이 로직만 제공
function useToggle(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // "Props getter" 패턴: 사용자의 요소에 필요한 Props를 반환
  const getToggleProps = (userProps = {}) => ({
    "aria-expanded": isOpen,
    onClick: (e) => {
      toggle();
      userProps.onClick?.(e); // 사용자의 onClick도 호출
    },
    ...userProps,
  });

  const getContentProps = (userProps = {}) => ({
    role: "region",
    hidden: !isOpen,
    ...userProps,
  });

  return {
    isOpen,
    toggle,
    open,
    close,
    getToggleProps,
    getContentProps,
  };
}

// 사용 1: 드롭다운으로
function Dropdown() {
  const { isOpen, getToggleProps, getContentProps } = useToggle();

  return (
    <div>
      <button {...getToggleProps()}>메뉴 {isOpen ? "▲" : "▼"}</button>
      <ul {...getContentProps({ className: "dropdown-menu" })}>
        <li>항목 1</li>
        <li>항목 2</li>
      </ul>
    </div>
  );
}

// 사용 2: 사이드바로 — 같은 로직, 완전히 다른 UI!
function Sidebar() {
  const { isOpen, getToggleProps, getContentProps } = useToggle(true);

  return (
    <div className="layout">
      <aside
        {...getContentProps({
          className: `sidebar ${isOpen ? "open" : "closed"}`,
        })}
      >
        <nav>사이드바 내용</nav>
      </aside>
      <button {...getToggleProps({ className: "sidebar-toggle" })}>
        {isOpen ? "◀" : "▶"}
      </button>
    </div>
  );
}
```

```
"Props Getter" 패턴의 핵심

  getToggleProps()가 반환하는 것:
    · aria-expanded: 접근성 속성 자동 적용
    · onClick: 토글 로직 + 사용자의 onClick 합성
    · 기타 사용자가 전달한 Props를 병합

  이점:
    · 접근성(a11y)을 자동으로 보장
    · 사용자의 커스텀 Props와 충돌 없이 병합
    · UI는 완전히 사용자가 제어
    · 로직(토글, 접근성)은 Hook이 보장

  실제 라이브러리 예시:
    · Downshift: useCombobox(), useSelect()
    · React Table (TanStack Table): useReactTable()
    · Headless UI: Listbox, Combobox, Dialog
    · React Aria: useButton(), useTextField()
```

### 3.6 Slot Pattern — 레이아웃의 유연한 구성

```jsx
// Named Slots: children 외에 특정 영역을 Props로 받는 패턴
function Card({ header, footer, children }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// 사용: 각 영역에 자유로운 콘텐츠
<Card header={<h3>상품 제목</h3>} footer={<button>구매하기</button>}>
  <p>상품 설명이 여기에 들어갑니다.</p>
  <img src="product.jpg" alt="상품 이미지" />
</Card>;

// 더 복잡한 Slot 예시: 페이지 레이아웃
function PageLayout({ sidebar, breadcrumb, actions, children }) {
  return (
    <div className="page">
      {breadcrumb && <nav className="breadcrumb">{breadcrumb}</nav>}
      <div className="page-header">
        <div className="page-actions">{actions}</div>
      </div>
      <div className="page-body">
        {sidebar && <aside className="page-sidebar">{sidebar}</aside>}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
```

### 3.7 컴포넌트 API 설계 원칙

#### 원칙 1: 유연성의 단계 (Flexibility Ladder)


![가장 제한적 ──────────────────────────── 가장 유연](/developer-open-book/diagrams/react-step27-가장-제한적-가장-유연.svg)


#### 원칙 2: 합리적 기본값 + 탈출구

```jsx
// 좋은 API: 기본 사용은 간단하고, 필요하면 커스터마이즈 가능

// 기본 사용 — 합리적 기본값으로 즉시 동작
<Button>클릭</Button>

// 점진적 커스터마이즈
<Button variant="primary" size="lg">클릭</Button>
<Button leftIcon={<SearchIcon />}>검색</Button>
<Button as="a" href="/link">링크 버튼</Button>   // 탈출구: 렌더링 요소 변경!

// 원칙:
// · 80%의 사용 사례는 최소한의 Props로 커버
// · 나머지 20%는 추가 Props나 패턴으로 커스터마이즈 가능
// · "Pit of Success": 가장 쉬운 방법이 가장 올바른 방법
```

#### 원칙 3: 일관된 Props 네이밍 컨벤션

```
컨벤션 가이드

  상태:     isOpen, isDisabled, isLoading, isActive
  이벤트:    onClick, onChange, onClose, onSubmit
  변형:     variant, size, color
  컨텐츠:    label, title, description, placeholder
  슬롯:     header, footer, icon, leftIcon, rightIcon
  렌더링:    as (렌더링 요소), render (커스텀 렌더링)
  접근성:    aria-label, role

  ❌ 불일관:
  <Button click={fn} />         // onClick이어야 함
  <Modal visible={true} />      // isOpen이어야 함
  <Input err="에러" />           // error 또는 errorMessage
```

---

## 4. 사례 연구와 예시

### 4.1 사례: Tabs 컴포넌트 — Props 기반 vs Compound 기반

현실적인 UI 요구사항이 어떻게 두 패턴의 차이를 드러내는지 보여주는 전형적인 사례다. 초기 요구사항은 간단하지만, 시간이 지남에 따라 "탭에 아이콘 추가", "탭 비활성화", "탭 간 커스텀 구분선" 등의 요구가 추가된다. Props 기반은 이러한 요구에 취약하다.

```jsx
// ❌ Props 기반 — 유연성 부족
<Tabs
  tabs={[
    { id: 'tab1', label: '개요', content: <Overview /> },
    { id: 'tab2', label: '설정', content: <Settings /> },
    { id: 'tab3', label: '통계', content: <Statistics />, icon: <ChartIcon /> },
  ]}
/>
// label에 아이콘을 넣으려면? → tab 객체에 icon 필드 추가
// 특정 탭을 비활성화하려면? → disabled 필드 추가
// 탭 헤더와 패널 사이에 구분선을 넣으려면? → 불가능!
// → Props 인터페이스가 계속 비대해진다


// ✅ Compound 기반 — 완전한 유연성
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">개요</Tabs.Tab>
    <Tabs.Tab value="tab2">설정</Tabs.Tab>
    <Tabs.Tab value="tab3">
      <ChartIcon /> 통계              {/* 아이콘을 자유롭게! */}
    </Tabs.Tab>
  </Tabs.List>

  <hr />                               {/* 구분선을 자유롭게! */}

  <Tabs.Panel value="tab1"><Overview /></Tabs.Panel>
  <Tabs.Panel value="tab2"><Settings /></Tabs.Panel>
  <Tabs.Panel value="tab3"><Statistics /></Tabs.Panel>
</Tabs>
// → 어떤 커스터마이즈든 가능, Props 인터페이스 변경 불필요
```

### 4.2 사례: 패턴의 진화를 보여주는 "인증 체크" 기능

동일한 기능을 세 가지 패턴으로 구현하면 각 패턴의 차이가 명확히 드러난다. 이 사례는 팀 내에서 레거시 코드를 리팩터링할 때 어떤 방향으로 나아가야 하는지 판단하는 기준이 된다.

```jsx
// 2016: HOC 방식
const ProtectedPage = withAuth(DashboardPage);
// 문제: DashboardPage에 어떤 Props가 주입되는지 불명확

// 2018: Render Props 방식
<AuthChecker>
  {({ user, isLoading }) => {
    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    return <DashboardPage user={user} />;
  }}
</AuthChecker>;
// 문제: 중첩이 발생, 장황함

// 2024: Custom Hook 방식 ★
function DashboardPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return <Dashboard user={user} />;
}
// 깔끔, 명시적, 타입 안전

// 또는: Layout Route 방식 (Step 18)
<Route element={<ProtectedLayout />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>;
// 라우트 레벨에서 인증을 선언적으로 처리
```

### 4.3 사례: 실제 라이브러리의 패턴 적용


![실제 라이브러리들이 사용하는 패턴](/developer-open-book/diagrams/react-step27-실제-라이브러리들이-사용하는-패턴.svg)


---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Compound Component 구현 [Applying]

**목표:** Compound Component 패턴으로 재사용 가능한 UI를 구현한다.

```
요구사항:
  · Tabs 컴포넌트를 Compound 패턴으로 구현
  · 구성 요소: Tabs, Tabs.List, Tabs.Tab, Tabs.Panel
  · Context로 내부 상태(activeTab) 공유
  · 닷 표기법(Tabs.Tab)으로 접근
  · defaultValue로 초기 탭 설정
  · 활성 탭에 스타일 적용
  · 사용 예시 3가지 작성 (다른 구성, 다른 콘텐츠)
```

---

### 실습 2: Headless Hook 구현 [Applying · Creating]

**목표:** UI 없이 로직만 제공하는 Headless Hook을 구현한다.

```
요구사항:
  · useDropdown() Hook 구현:
    반환값:
      - isOpen: boolean
      - toggle, open, close 함수
      - getToggleProps(): 트리거 버튼에 적용할 Props
      - getMenuProps(): 메뉴 컨테이너에 적용할 Props
      - getItemProps(index): 각 메뉴 아이템에 적용할 Props
    기능:
      - 외부 클릭 시 닫힘 (useClickOutside 활용)
      - Escape 키로 닫힘
      - aria 속성 자동 적용

  · 이 Hook을 사용하여 3가지 다른 UI로 구현:
    1. 기본 드롭다운 메뉴
    2. 네비게이션 메가 메뉴
    3. 컨텍스트 메뉴 (우클릭)
```

---

### 실습 3: 패턴 선택 판단 연습 [Analyzing · Evaluating]

**목표:** 상황에 따라 적합한 컴포넌트 패턴을 선택한다.


![아래 8가지 시나리오에서 적합한 패턴을 선택하고 근거를 제시하라.](/developer-open-book/diagrams/react-step27-아래-8가지-시나리오에서-적합한-패턴을-선택하고-근거를-제시하라.svg)


---

### 실습 4 (선택): Modal을 3가지 패턴으로 구현 [Evaluating]

**목표:** 같은 기능을 다른 패턴으로 구현하여 차이를 체감한다.

```
과제: Modal 컴포넌트를 3가지 방식으로 구현하라.

  방식 1: Props 기반
    <Modal isOpen={isOpen} onClose={close} title="확인" footer={<Button>확인</Button>}>
      <p>내용</p>
    </Modal>

  방식 2: Compound Component 기반
    <Modal>
      <Modal.Trigger><Button>열기</Button></Modal.Trigger>
      <Modal.Content>
        <Modal.Title>확인</Modal.Title>
        <p>내용</p>
        <Modal.Footer><Button>확인</Button></Modal.Footer>
      </Modal.Content>
    </Modal>

  방식 3: Headless Hook 기반
    const { isOpen, getDialogProps, getTriggerProps, close } = useDialog();

각 방식의 비교:
  · 코드량
  · 유연성 (커스터마이즈 가능 범위)
  · 사용 편의성 (단순한 사용 사례에서)
  · 접근성 보장 수준
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 27 핵심 요약](/developer-open-book/diagrams/react-step27-step-27-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                       | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Compound Component에서 하위 컴포넌트들이 상태를 공유하는 메커니즘은?       | Remember   | 3.2         |
| 2   | Render Props 패턴이 Custom Hook에 비해 불리한 점 2가지는?                  | Understand | 3.3         |
| 3   | Headless Component의 "Props Getter" 패턴이 접근성을 자동 보장하는 원리는?  | Understand | 3.5         |
| 4   | Compound Component가 Props 기반 컴포넌트보다 유연한 구체적 사례를 설명하라 | Analyze    | 3.2, 4.1    |
| 5   | "유연성의 단계"에서 프로젝트의 어떤 요구사항이 Compound를 선택하게 하는가? | Evaluate   | 3.7         |
| 6   | HOC가 현재에도 사용되는 사례 2가지는?                                      | Remember   | 3.4         |
| 7   | 데이터 테이블(정렬, 필터, 페이지네이션)에 적합한 패턴과 그 이유는?         | Evaluate   | 3.5         |
| 8   | "합리적 기본값 + 탈출구" 원칙을 Button 컴포넌트 예시로 설명하라            | Apply      | 3.7         |

### 6.3 FAQ

**Q1. Compound Component에서 Context를 사용하면 리렌더링 문제가 발생하지 않는가?**

발생할 수 있다. Compound Component 내부의 Context는 "컴포넌트 트리 전체의 전역 상태"가 아니라, 해당 컴포넌트 인스턴스 내부로 범위가 제한된 "지역 Context"이므로 영향 범위가 좁다. 그러나 Context value가 자주 변경된다면 `useMemo`로 value를 안정화하거나, 상태와 액션을 분리된 Context로 나누는 최적화를 고려할 수 있다.

**Q2. Headless Hook과 Compound Component를 함께 사용할 수 있는가?**

매우 자연스러운 조합이다. 예를 들어 Compound Component로 UI 구조의 유연성을 제공하고, 내부 로직은 Headless Hook으로 분리할 수 있다. Radix UI가 이 패턴을 채택한다: 컴포넌트는 Compound 형태로 제공되고, 내부적으로는 상태 관리와 접근성 로직을 Hook으로 처리한다.

**Q3. 팀에서 처음으로 Compound Component를 도입할 때 어떻게 시작하는가?**

가장 많이 반복 사용되는 UI 컴포넌트부터 시작하는 것이 효과적이다. Modal, Tabs, Dropdown 같이 팀 내에서 여러 변형이 요구되는 컴포넌트를 선택하여 Compound 패턴으로 재설계한다. 기존 Props 기반 컴포넌트와 하위 호환성을 유지하면서 점진적으로 마이그레이션하는 접근을 권장한다.

**Q4. HOC와 Compound Component는 함께 사용할 수 있는가?**

기술적으로는 가능하지만 권장하지 않는다. HOC는 컴포넌트 트리에 래퍼를 추가하여 디버깅을 어렵게 만들고, Compound Component의 Context 구조와 충돌할 가능성이 있다. HOC가 필요한 기능(인증 체크, 테마 적용 등)은 Custom Hook과 컴포넌트 내부 로직으로 처리하는 것이 현대적인 접근이다.

**Q5. "Prop Explosion"을 어떻게 감지하고 리팩터링 시점을 결정하는가?**

Props가 8개 이상이거나, Props 중 하나가 `ReactNode` 타입으로 JSX를 받고 있다면 Compound 패턴으로의 리팩터링을 고려할 시점이다. 또한 사용자 요구에 따라 Props 인터페이스가 계속 확장되고 있다면 이는 설계 변경의 신호다. 단, 리팩터링은 "현재 문제가 있을 때" 진행하며, 예방적 리팩터링은 과도한 복잡도를 초래할 수 있다.

---

## 7. 다음 단계 예고

> **Step 28. 프로젝트 구조와 아키텍처**
>
> - Feature-based vs Layer-based 폴더 구조
> - Screaming Architecture 원칙
> - 모듈 경계와 의존성 방향
> - Barrel Export와 Public API
> - 실전 프로젝트 구조 템플릿

---

## 📚 참고 자료

- [React 공식 문서 — Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [React 공식 문서 — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Patterns.dev — Compound Pattern](https://www.patterns.dev/react/compound-pattern)
- [Patterns.dev — Render Props Pattern](https://www.patterns.dev/react/render-props-pattern)
- [Patterns.dev — HOC Pattern](https://www.patterns.dev/react/hoc-pattern)
- [Kent C. Dodds — Inversion of Control](https://kentcdodds.com/blog/inversion-of-control)
- [Headless UI](https://headlessui.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 27 of 42
