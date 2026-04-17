# Step 16. Custom Hook 설계 패턴

> **Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)**
> Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Remember**   | Custom Hook의 정의와 "use" 접두사 규칙을 기술할 수 있다                                   |
| **Understand** | Custom Hook이 "상태 로직의 재사용"이지 "State 자체의 공유"가 아님을 설명할 수 있다        |
| **Understand** | 관심사 분리(Separation of Concerns) 원칙이 Custom Hook에 어떻게 적용되는지 설명할 수 있다 |
| **Apply**      | 반복되는 상태 로직을 Custom Hook으로 추출하여 재사용할 수 있다                            |
| **Analyze**    | 좋은 Hook API와 나쁜 Hook API의 차이를 분석할 수 있다                                     |
| **Evaluate**   | "이 로직을 Custom Hook으로 추출해야 하는가?"를 판단하고 설계할 수 있다                    |

**전제 지식:**

- Step 6: useState
- Step 11: useEffect, Cleanup
- Step 12: useRef
- Step 13: useReducer
- Step 14: useMemo, useCallback
- Step 15: useTransition, useDeferredValue 등

---

## 1. 서론 — 왜 Custom Hook이 필요한가

### 1.1 소프트웨어 재사용의 역사와 Custom Hook의 위치

소프트웨어 엔지니어링은 수십 년간 코드 재사용 문제를 풀어왔다. 함수(function)는 로직을 재사용하는 기본 단위였고, 클래스(class)는 상태와 로직을 함께 캡슐화하는 방법이었으며, Higher Order Component(HOC)와 Render Props는 React에서 컴포넌트 로직을 공유하려는 시도였다.

HOC와 Render Props 패턴은 목적을 달성했지만 대가가 있었다. 컴포넌트 트리가 깊어지는 "Wrapper Hell", 프로퍼티 이름 충돌, 테스트의 어려움 등이 대표적인 문제였다. Custom Hook은 이 모든 문제를 해결하는 React의 공식 답안이다.

Custom Hook은 단순히 "중복 코드를 줄이는 도구"가 아니다. 복잡한 상태 로직에 **명확한 이름을 부여**하고, **관심사를 단위별로 분리**하며, **컴포넌트를 UI 렌더링에 집중**하게 만드는 아키텍처 패턴이다. `useWindowSize()`라는 이름은 코드를 읽는 모든 사람에게 "이 컴포넌트는 윈도우 크기를 알고 싶어한다"는 의도를 즉시 전달한다.

### 1.2 Custom Hook이 해결하는 산업적 문제

실제 서비스를 개발하다 보면 동일한 패턴이 여러 컴포넌트에 걸쳐 반복된다. 데이터 패칭, 폼 상태 관리, localStorage 동기화, 이벤트 리스너 등록, 미디어 쿼리 감지 등이 대표적이다.

이런 로직이 컴포넌트마다 복사-붙여넣기되면 유지보수 비용이 기하급수적으로 증가한다. 패칭 로직에서 버그를 발견했을 때 해당 패턴을 사용하는 컴포넌트를 모두 찾아 수정해야 한다. AbortController를 추가하는 단순한 개선 작업도 파급 범위가 수십 개 파일에 달할 수 있다.

Custom Hook은 이 문제를 근본적으로 해결한다. `useFetch`를 한 곳에서 수정하면 모든 사용처에 즉시 반영된다. 테스트도 컴포넌트 없이 Hook 단위로 독립적으로 작성할 수 있어, 테스트 커버리지를 효율적으로 높일 수 있다.

### 1.3 개념 지도 — Custom Hook의 전체 그림

![Custom Hook 개념 지도](/developer-open-book/diagrams/react-step16-concept-map.svg)

### 1.4 반복되는 패턴의 발견

Step 11~15에서 다양한 Hook을 학습하면서 **비슷한 패턴이 여러 컴포넌트에서 반복**되는 것을 경험했을 것이다.

```jsx
// 컴포넌트 A: 사용자 데이터 패칭
function UserProfile({ userId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [userId]);

  // ...
}

// 컴포넌트 B: 상품 데이터 패칭 — 거의 동일한 로직!
function ProductDetail({ productId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [productId]);

  // ...
}

// 패칭 로직이 복사-붙여넣기로 반복되고 있다!
// 수정이 필요하면 모든 컴포넌트를 찾아다녀야 한다!
```

**Custom Hook은 이런 반복되는 상태 로직을 하나의 함수로 추출하여 재사용하는 메커니즘이다.**

### 1.5 Custom Hook의 본질

```
Custom Hook은:
  · 내부에서 다른 Hook(useState, useEffect 등)을 호출하는 "일반 JavaScript 함수"
  · 이름이 "use"로 시작해야 한다 (규칙)
  · 상태 로직(State + Effect의 조합)을 재사용 가능하게 만든다
  · 새로운 기능을 만드는 것이 아니라, 기존 Hook을 "조합"하는 것이다

Custom Hook은 아닌 것:
  · 새로운 React 기능을 추가하는 마법
  · State 자체를 여러 컴포넌트가 공유하는 것 (×)
  · 컴포넌트를 대체하는 것
```

### 1.6 이 Step에서 다루는 범위

![Step 16 다루는 범위](/developer-open-book/diagrams/react-step16-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                          | 정의                                                                                                               | 왜 중요한가                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Custom Hook**               | `use`로 시작하는 이름의 JavaScript 함수로, 내부에서 다른 Hook을 호출하여 **상태 로직을 재사용 가능하게 추출**한 것 | 코드 중복을 제거하고 관심사를 분리한다                     |
| **상태 로직(Stateful Logic)** | State 선언 + 업데이트 + Effect 등이 결합된 **동작 패턴**. 특정 데이터가 아닌 패턴 자체가 재사용 대상               | Custom Hook이 추출하는 것은 "로직"이지 "State 값"이 아니다 |
| **관심사 분리(SoC)**          | Separation of Concerns. 하나의 모듈이 **하나의 책임**만 가지도록 분리하는 원칙                                     | 컴포넌트: UI 렌더링, Custom Hook: 상태 로직                |
| **Hook 합성**                 | 여러 Custom Hook을 조합하여 더 복잡한 Hook을 만드는 패턴. 함수의 합성(Composition)과 동일 원리                     | 작은 Hook을 조합하여 복잡한 로직을 구성한다                |
| **Hook 규칙**                 | ① 최상위에서만 호출 ② React 함수(컴포넌트/Hook) 안에서만 호출. `use` 접두사로 규칙 준수를 표시                     | ESLint 플러그인이 이 규칙을 검사한다                       |

### 2.2 "로직 재사용" vs "State 공유"의 구분

Custom Hook을 처음 배울 때 가장 흔한 오해는 "같은 Hook을 여러 컴포넌트에서 호출하면 상태가 공유된다"고 생각하는 것이다. 이는 완전히 틀린 이해다.

Custom Hook을 호출할 때마다 **독립적인 State 인스턴스**가 생성된다. Hook은 클래스의 정적 속성(static property)이 아니라, 호출할 때마다 새로운 상태를 초기화하는 함수다.

![Custom Hook은 State를 공유하지 않는다](/developer-open-book/diagrams/react-step16-state-sharing.svg)

### 2.3 Custom Hook과 일반 함수의 차이

Custom Hook은 "use"로 시작하는 일반 JavaScript 함수처럼 보이지만, 내부에서 React Hook을 호출한다는 점에서 근본적으로 다르다.

```
일반 함수:
  · React Hook을 호출할 수 없다
  · 렌더링 사이클과 무관하게 동작한다
  · 상태를 가질 수 없다

Custom Hook:
  · React Hook을 내부에서 호출한다
  · 컴포넌트의 렌더링 사이클에 바인딩된다
  · 호출하는 컴포넌트의 생명주기를 따른다
  · 컴포넌트가 언마운트되면 내부 Effect도 정리된다

  // 일반 함수 — Hook 호출 불가
  function getWindowSize() {
    const [size, setSize] = useState({ w: 0, h: 0 }); // ❌ 오류!
    return size;
  }

  // Custom Hook — Hook 호출 가능
  function useWindowSize() {
    const [size, setSize] = useState({ w: 0, h: 0 }); // ✅
    useEffect(() => { /* ... */ }, []);
    return size;
  }
```

---

## 3. 이론과 원리

### 3.1 Custom Hook의 규칙

#### 명명 규칙

```
규칙: Custom Hook의 이름은 반드시 "use"로 시작해야 한다

  ✅ useCounter, useFetch, useLocalStorage, useWindowSize
  ❌ getCounter, fetchData, withLocalStorage, handleWindowSize

왜?
  1. React가 "이 함수는 Hook이다"라고 인식한다
  2. ESLint의 eslint-plugin-react-hooks가 Hook 규칙을 검사한다
     · 조건문 안에서 호출 시 경고
     · 의존성 배열 누락 시 경고
  3. 코드를 읽는 사람이 "이 함수 안에 Hook이 있다"고 즉시 파악한다
```

#### 호출 규칙 (기존 Hook 규칙과 동일)

```
Custom Hook 내부에서도 동일한 규칙 적용

  ✅ 최상위에서만 Hook을 호출한다
  ✅ React 함수(컴포넌트 또는 다른 Hook) 안에서만 호출한다
  ❌ 조건문, 반복문, 중첩 함수 안에서 호출하지 않는다

  // ❌ 조건문 안에서 Hook 호출 금지
  function useConditional(condition) {
    if (condition) {
      const [state, setState] = useState(0);  // 규칙 위반!
    }
  }

  // ✅ Hook은 항상 최상위에서, 조건은 Hook 내부에서
  function useConditional(condition) {
    const [state, setState] = useState(0);  // 항상 호출
    useEffect(() => {
      if (condition) {
        // 조건부 로직은 Hook 안에서
      }
    }, [condition]);
  }
```

### 3.2 Custom Hook 추출의 기본 패턴

#### 추출 전: 컴포넌트 안에 로직이 섞여 있음

```jsx
function UserProfile({ userId }) {
  // ── 상태 로직 (패칭) ──
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [userId]);

  // ── UI 로직 ──
  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

#### 추출 후: 상태 로직과 UI 로직이 분리됨

```jsx
// ── Custom Hook: 상태 로직 추출 ──
function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}

// ── 컴포넌트: UI 로직만 남음 ──
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useFetch(`/api/users/${userId}`);

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 같은 Hook을 다른 컴포넌트에서 재사용!
function ProductDetail({ productId }) {
  const {
    data: product,
    isLoading,
    error,
  } = useFetch(`/api/products/${productId}`);
  // ... 동일한 로딩/에러 패턴, 다른 URL
}
```

```
추출의 효과

  추출 전:
    · 패칭 로직이 컴포넌트마다 복사-붙여넣기
    · 수정 시 모든 컴포넌트를 찾아다녀야 함
    · 컴포넌트가 "데이터 패칭"과 "UI 렌더링"을 모두 담당

  추출 후:
    · useFetch 하나만 수정하면 모든 사용처에 반영
    · 컴포넌트는 UI 렌더링에만 집중
    · useFetch는 독립적으로 테스트 가능
    · 새로운 패칭 컴포넌트 생성 시 1줄로 완료
```

### 3.3 관심사 분리(Separation of Concerns)

#### 왜 관심사 분리가 중요한가

소프트웨어 공학의 원칙 중 하나인 단일 책임 원칙(Single Responsibility Principle)은 "한 모듈은 하나의 이유로만 변경되어야 한다"고 말한다. 컴포넌트가 UI 렌더링과 데이터 패칭을 모두 담당하면, UI 디자인 변경과 API 엔드포인트 변경이 모두 그 컴포넌트를 수정하게 만든다. 이는 변경 이유가 두 가지이므로 단일 책임 원칙에 위배된다.

Custom Hook을 통해 관심사를 분리하면 각 단위는 하나의 이유로만 변경된다. `useFetch`는 패칭 로직이 변경될 때만, `UserProfile`은 UI 레이아웃이 변경될 때만 수정된다.

#### 컴포넌트의 두 가지 관심사

```
하나의 컴포넌트가 담당하는 것:

  관심사 1: 상태 로직 (State + Effect)
  ─────────────────────────────────
    · 어떤 데이터를 어떻게 관리하는가
    · 데이터를 어떻게 가져오는가
    · 어떤 부수 효과가 필요한가

  관심사 2: UI 렌더링 (JSX)
  ─────────────────────────────────
    · 데이터를 화면에 어떻게 보여주는가
    · 조건부 렌더링, 리스트 렌더링
    · 사용자 상호작용

Custom Hook으로 관심사 1을 분리하면:
  · 컴포넌트: "이 데이터를 이렇게 보여준다" (UI)
  · Custom Hook: "이 데이터를 이렇게 관리한다" (로직)
  · 각각 독립적으로 변경·테스트·재사용 가능
```

#### 분리의 실전 예시

```jsx
// 관심사가 혼합된 코드 → 3가지 관심사가 하나의 컴포넌트에
function Dashboard() {
  // 관심사 1: 윈도우 크기 추적
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const handle = () => setWindowSize({ w: innerWidth, h: innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // 관심사 2: 온라인/오프라인 상태 추적
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // 관심사 3: 데이터 패칭
  const { data, isLoading } = useFetch("/api/dashboard");

  // UI 렌더링
  return (
    <div>
      <p>
        화면: {windowSize.w}×{windowSize.h}
      </p>
      <p>상태: {isOnline ? "온라인" : "오프라인"}</p>
      {isLoading ? <Spinner /> : <DashboardContent data={data} />}
    </div>
  );
}

// 관심사가 분리된 코드 → 각 관심사가 자체 Hook에
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handle = () => setSize({ width: innerWidth, height: innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return size;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return isOnline;
}

// 컴포넌트: UI 렌더링에만 집중
function Dashboard() {
  const { width, height } = useWindowSize();
  const isOnline = useOnlineStatus();
  const { data, isLoading } = useFetch("/api/dashboard");

  return (
    <div>
      <p>
        화면: {width}×{height}
      </p>
      <p>상태: {isOnline ? "온라인" : "오프라인"}</p>
      {isLoading ? <Spinner /> : <DashboardContent data={data} />}
    </div>
  );
}
```

### 3.4 Custom Hook 추출 시점 판단

#### "이 로직을 Custom Hook으로 추출해야 하는가?"

```
추출이 적합한 시점

  ┌─ 같은 상태+효과 패턴이 2개 이상의 컴포넌트에서 반복되는가?
  │    YES → 추출 ★ (DRY 원칙)
  │
  ├─ 컴포넌트가 너무 길어서 읽기 어려운가?
  │    YES → 관심사별로 Hook을 분리하여 가독성 향상
  │
  ├─ 상태 로직을 독립적으로 테스트하고 싶은가?
  │    YES → Hook으로 추출하면 컴포넌트 없이 테스트 가능
  │
  └─ 로직의 의도를 이름으로 표현하고 싶은가?
       YES → useWindowSize, useOnlineStatus처럼 이름이 의도를 전달


추출이 불필요한 경우

  · 하나의 컴포넌트에서만 사용하는 단순한 useState
  · 3줄 이하의 로직 (추출하면 오히려 간접성만 증가)
  · "혹시 나중에 재사용할지 모르니까" → YAGNI 원칙 위반
    (You Aren't Gonna Need It)
```

#### 추출 판단 체크리스트

```
□ 이 로직이 2개+ 컴포넌트에서 사용되는가?
□ 컴포넌트가 50줄 이상이고, 상태 로직과 UI가 섞여 있는가?
□ 이 로직에 대한 단위 테스트를 작성하고 싶은가?
□ 이 로직의 이름(useFetch, useForm)이 명확한 의도를 전달하는가?

→ 2개+ 체크면 추출을 고려한다
→ 1개 이하면 현재 컴포넌트에 두어도 된다
```

### 3.5 Hook API 설계 원칙

#### 원칙 1: 명확한 네이밍

좋은 Hook 이름은 그 Hook을 호출하는 코드를 읽을 때 즉시 의도를 파악하게 한다. `const data = useData()`는 아무것도 말해주지 않지만, `const { data, isLoading } = useFetch('/api/users')`는 "API에서 데이터를 가져오고 있다"는 사실을 즉시 전달한다.

```
좋은 이름: "무엇을 하는가"가 즉시 파악됨

  ✅ useFetch           → 데이터를 가져온다
  ✅ useLocalStorage    → localStorage와 동기화한다
  ✅ useDebounce        → 값을 디바운스한다
  ✅ useWindowSize      → 윈도우 크기를 추적한다
  ✅ useOnlineStatus    → 온라인/오프라인 상태를 추적한다
  ✅ useMediaQuery      → 미디어 쿼리 매치를 추적한다
  ✅ useClickOutside    → 요소 외부 클릭을 감지한다

  ❌ useData            → 어떤 데이터? 너무 모호
  ❌ useHelper          → 무엇을 돕는가?
  ❌ useCustom          → "custom"은 아무 의미 없음
  ❌ useStuff           → ...
```

#### 원칙 2: 적절한 반환값 설계

반환값의 개수에 따라 배열과 객체 중 적합한 형태를 선택해야 한다. 이 선택은 API를 사용하는 코드의 가독성에 직접적인 영향을 미친다.

```jsx
// 패턴 1: 단일 값 반환 — 가장 단순
function useOnlineStatus() {
  // ...
  return isOnline; // boolean
}
const isOnline = useOnlineStatus();

// 패턴 2: 배열 반환 — useState와 동일 관례, 이름 자유롭게 지정
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
  // 사용: const [isOpen, toggleOpen] = useToggle();
  //       const [isDark, toggleDark] = useToggle(true);
}

// 패턴 3: 객체 반환 — 속성이 3개+ 일 때, 선택적 사용 가능
function useFetch(url) {
  // ...
  return { data, isLoading, error, refetch };
  // 사용: const { data, isLoading } = useFetch(url);
  //       const { error, refetch } = useFetch(url);
  //       → 필요한 속성만 Destructuring
}

// 선택 기준
// · 반환값 1개 → 값 직접 반환
// · 반환값 2개 (값 + setter 패턴) → 배열
// · 반환값 3개+ → 객체 (선택적 Destructuring 가능)
```

#### 원칙 3: 최소한의 인터페이스

Hook의 매개변수가 많을수록 사용하기 어렵고 테스트하기도 복잡해진다. 필수 인자를 최소화하고, 선택적 옵션은 객체로 묶어 기본값을 제공해야 한다.

```jsx
// ❌ 너무 많은 옵션 — 사용하기 어렵다
function useFetch(
  url,
  method,
  headers,
  body,
  timeout,
  retries,
  cacheTime,
  onSuccess,
  onError,
  transform,
  enabled,
) {
  // 11개의 매개변수!
}

// ✅ 옵션 객체로 정리, 대부분 기본값 제공
function useFetch(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body = null,
    enabled = true, // false면 요청하지 않음
    onSuccess = null, // 성공 콜백 (선택)
    onError = null, // 에러 콜백 (선택)
  } = options;

  // ...
}

// 사용: 대부분의 경우 URL만 전달
const { data } = useFetch("/api/users");

// 필요할 때만 옵션 추가
const { data } = useFetch("/api/users", {
  enabled: !!userId,
  onSuccess: (data) => console.log("로드 완료:", data),
});
```

#### 원칙 4: Hook은 "무엇"을 하는지 선언, "어떻게"는 내부에 숨긴다

```jsx
// 사용하는 측에서 보이는 것 (인터페이스):
const { data, isLoading, error } = useFetch("/api/users");
// → "데이터를 가져온다. 로딩 중인지, 에러가 있는지 알 수 있다."

// 내부 구현 (숨겨진 것):
// AbortController로 Race Condition 방지
// isCancelled 플래그로 언마운트 후 setState 방지
// 에러 분류 (AbortError vs 실제 에러)
// 캐싱 로직 (필요한 경우)
// 리트라이 로직 (필요한 경우)

// → 사용하는 측은 내부 구현을 알 필요가 없다
// → 내부 구현이 바뀌어도 인터페이스는 유지된다
```

### 3.6 Hook 합성(Composition) 패턴

#### 합성의 원리

함수형 프로그래밍에서 합성(Composition)은 작은 함수들을 조합하여 더 복잡한 함수를 만드는 기법이다. Custom Hook도 동일한 원리를 따른다. 각각 하나의 책임을 가진 기본 Hook들을 조합하면, 더 구체적이고 풍부한 기능을 제공하는 합성 Hook을 만들 수 있다.

이 접근 방식의 핵심 장점은 **기본 Hook의 재사용성**이다. `useDebounce`는 검색 기능뿐 아니라 자동 저장, 폼 검증 등 다양한 곳에서 단독으로 사용할 수 있다. 합성 Hook을 만든다고 해서 기본 Hook의 독립성이 사라지지 않는다.

#### 작은 Hook을 조합하여 복잡한 Hook을 만든다

```jsx
// 기본 Hook 1: 디바운스
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 기본 Hook 2: 패칭 (앞에서 정의한 useFetch)

// 합성 Hook: 디바운스 + 패칭을 결합한 검색 Hook
function useSearch(query) {
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading, error } = useFetch(
    debouncedQuery ? `/api/search?q=${debouncedQuery}` : null,
  );

  return {
    results: data ?? [],
    isSearching: isLoading,
    error,
    isDebouncing: query !== debouncedQuery,
  };
}

// 사용
function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, isSearching, isDebouncing } = useSearch(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {(isSearching || isDebouncing) && <p>검색 중...</p>}
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

```
합성 패턴의 구조

  useDebounce (기본)
       +
  useFetch (기본)
       ↓
  useSearch (합성)
       ↓
  SearchPage (컴포넌트)

  · 각 Hook은 하나의 책임만 가진다
  · 기본 Hook은 다른 곳에서도 재사용 가능
  · 합성 Hook은 기본 Hook을 조합하여 더 구체적인 기능 제공
  · 컴포넌트는 합성 Hook의 인터페이스만 알면 된다
```

### 3.7 실전 Custom Hook 라이브러리

#### useLocalStorage — localStorage와 State 동기화

```jsx
function useLocalStorage(key, initialValue) {
  // Lazy Initialization으로 localStorage 읽기
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`useLocalStorage(${key}) 읽기 실패:`, error);
      return initialValue;
    }
  });

  // setState를 래핑하여 localStorage도 함께 업데이트
  const setValue = useCallback(
    (value) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`useLocalStorage(${key}) 쓰기 실패:`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

// 사용
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);
  // 새로고침해도 값이 유지된다!
}
```

#### useClickOutside — 요소 외부 클릭 감지

```jsx
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // ref 내부 클릭이면 무시
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// 사용: 드롭다운 메뉴 외부 클릭 시 닫기
function Dropdown({ onClose }) {
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, onClose);

  return (
    <div ref={dropdownRef} className="dropdown">
      <ul>
        <li>메뉴 1</li>
        <li>메뉴 2</li>
      </ul>
    </div>
  );
}
```

#### useToggle — 불리언 토글

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }];
}

// 사용
function Modal() {
  const [isOpen, { toggle, setFalse: close }] = useToggle();

  return (
    <div>
      <button onClick={toggle}>모달 열기</button>
      {isOpen && (
        <div className="modal">
          <p>모달 내용</p>
          <button onClick={close}>닫기</button>
        </div>
      )}
    </div>
  );
}
```

#### usePrevious — 이전 렌더링 값 (Step 12 복습)

```jsx
function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// 사용
function PriceDisplay({ price }) {
  const prevPrice = usePrevious(price);
  const trend =
    prevPrice === undefined
      ? ""
      : price > prevPrice
        ? "📈"
        : price < prevPrice
          ? "📉"
          : "➡️";

  return (
    <p>
      {price}원 {trend}
    </p>
  );
}
```

#### useMediaQuery — 미디어 쿼리 매칭

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// 사용
function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <div className={isDark ? "dark" : "light"}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

#### useInterval — 선언적 setInterval 관리

```jsx
// setInterval을 올바르게 다루는 Custom Hook
// Dan Abramov의 패턴 기반
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // 매 렌더링마다 최신 callback을 ref에 저장
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return; // null이면 인터벌 중지

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 사용: 1초마다 카운트 증가, 버튼으로 중지/재시작
function Timer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => setCount((c) => c + 1),
    isRunning ? 1000 : null, // null이면 중지
  );

  return (
    <div>
      <p>{count}초</p>
      <button onClick={() => setIsRunning((r) => !r)}>
        {isRunning ? "중지" : "재시작"}
      </button>
    </div>
  );
}
```

### 3.8 Custom Hook 테스트 전략 개요

Custom Hook의 중요한 장점 중 하나는 **컴포넌트 없이 독립적으로 테스트**할 수 있다는 것이다. UI 렌더링과 분리되어 있으므로, DOM 환경 없이 순수하게 로직만 검증할 수 있다.

```
Custom Hook은 순수 로직이므로 독립적으로 테스트할 수 있다

  · renderHook (React Testing Library)으로 Hook을 격리 테스트
  · 컴포넌트 없이 Hook의 입출력만 검증
  · Step 36에서 상세히 학습

  // 테스트 예시 (개념만)
  // test('useToggle은 초기값을 반환한다', () => {
  //   const { result } = renderHook(() => useToggle(false));
  //   expect(result.current[0]).toBe(false);
  // });
  //
  // test('toggle은 값을 반전시킨다', () => {
  //   const { result } = renderHook(() => useToggle(false));
  //   act(() => result.current[1].toggle());
  //   expect(result.current[0]).toBe(true);
  // });

테스트 전략 요약:
  · 기본 Hook (useDebounce, useToggle 등): renderHook으로 단위 테스트
  · 합성 Hook (useSearch 등): 의존 Hook을 Mock하거나 통합 테스트
  · 컴포넌트와 함께: React Testing Library의 user-event로 UI 레벨 테스트
```

---

## 4. 사례 연구와 예시

### 4.1 사례: "State 공유" 오해로 인한 버그

```jsx
// ❌ 오해: "useCounter를 공유하면 같은 카운터를 쓰겠지"
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((c) => c + 1) };
}

function ButtonA() {
  const { count, increment } = useCounter();
  return <button onClick={increment}>A: {count}</button>;
  // A만의 독립적인 count
}

function ButtonB() {
  const { count, increment } = useCounter();
  return <button onClick={increment}>B: {count}</button>;
  // B만의 독립적인 count — A와 완전히 분리!
}

// A를 클릭해도 B의 count는 변하지 않는다
// Custom Hook은 로직(패턴)을 공유하지, State(값)를 공유하지 않는다

// ✅ State를 공유하려면 Lifting State Up
function App() {
  const { count, increment } = useCounter(); // 부모가 소유
  return (
    <div>
      <ButtonA count={count} onClick={increment} />
      <ButtonB count={count} onClick={increment} />
    </div>
  );
}
```

### 4.2 사례: Hook 합성으로 복잡한 기능 구축

```jsx
// 목표: 무한 스크롤 리스트

// 기본 Hook 1: Intersection Observer
function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options,
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options.threshold, options.rootMargin]);

  return isIntersecting;
}

// 기본 Hook 2: 페이지네이션된 패칭
function usePaginatedFetch(baseUrl) {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const data = await fetch(`${baseUrl}?page=${page}`).then((r) => r.json());
      setPages((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, page, hasMore, isLoading]);

  return { items: pages, isLoading, hasMore, loadMore };
}

// 합성 Hook: 무한 스크롤
function useInfiniteScroll(baseUrl) {
  const { items, isLoading, hasMore, loadMore } = usePaginatedFetch(baseUrl);
  const sentinelRef = useRef(null);
  const isVisible = useIntersectionObserver(sentinelRef);

  useEffect(() => {
    if (isVisible && hasMore && !isLoading) {
      loadMore();
    }
  }, [isVisible, hasMore, isLoading, loadMore]);

  return { items, isLoading, hasMore, sentinelRef };
}

// 컴포넌트: UI만 담당
function InfiniteProductList() {
  const { items, isLoading, hasMore, sentinelRef } =
    useInfiniteScroll("/api/products");

  return (
    <div>
      {items.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
      <div ref={sentinelRef} />
      {isLoading && <p>로딩 중...</p>}
      {!hasMore && <p>모든 상품을 표시했습니다.</p>}
    </div>
  );
}
```

```
합성 계층

  useIntersectionObserver (브라우저 API 추상화)
            +
  usePaginatedFetch (페이지네이션 로직)
            ↓
  useInfiniteScroll (두 Hook을 결합)
            ↓
  InfiniteProductList (UI만 담당, 3줄의 Hook 호출)
```

### 4.3 사례: Hook 설계의 좋은 예 vs 나쁜 예

```jsx
// ❌ 나쁜 설계: 너무 많은 것을 하는 Hook
function useEverything(userId) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');
  const [isOnline, setIsOnline] = useState(true);
  // ... 20개의 State
  // ... 10개의 useEffect
  // ... 15개의 핸들러 함수

  return { user, posts, notifications, theme, isOnline, ... /* 30개의 반환값 */ };
}

// 문제:
// · 하나의 Hook이 모든 것을 담당 — SoC 위반
// · 반환값이 너무 많아 인터페이스가 불명확
// · 수정하면 모든 사용처에 영향
// · 테스트가 어렵다


// ✅ 좋은 설계: 각 Hook이 하나의 책임만
function useUser(userId) { /* 사용자 데이터만 */ }
function usePosts(userId) { /* 게시글 데이터만 */ }
function useNotifications() { /* 알림만 */ }
function useTheme() { /* 테마만 */ }
function useOnlineStatus() { /* 온라인 상태만 */ }

function Dashboard({ userId }) {
  const { user } = useUser(userId);
  const { posts } = usePosts(userId);
  const notifications = useNotifications();
  const { theme } = useTheme();
  const isOnline = useOnlineStatus();
  // 각각 독립적으로 변경·테스트·재사용 가능
}
```

### 4.4 사례: 실전 useForm — 폼 상태 통합 관리

복잡한 폼을 관리할 때 Custom Hook은 특히 강력하다. 필드 값, 에러, 터치 상태, 제출 상태를 일관되게 관리하는 `useForm`을 만들면, 모든 폼 컴포넌트가 동일한 패턴을 따를 수 있다.

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필드 변경 핸들러
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 필드 blur 핸들러 (터치 표시 + 검증)
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
      }
    },
    [values, validate],
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();
      // 모든 필드를 touched로 표시
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
      setTouched(allTouched);

      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate],
  );

  // 특정 필드의 에러 표시 여부 (터치되었을 때만)
  const getFieldError = useCallback(
    (name) => {
      return touched[name] ? errors[name] : undefined;
    },
    [touched, errors],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  };
}

// 사용: 폼 컴포넌트가 훨씬 깔끔해진다
function SignupForm() {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  } = useForm({ email: "", password: "", name: "" }, (vals) => {
    const errs = {};
    if (!vals.email.includes("@")) errs.email = "올바른 이메일을 입력하세요";
    if (vals.password.length < 8) errs.password = "8자 이상이어야 합니다";
    return errs;
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await registerUser(data);
      })}
    >
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {getFieldError("email") && (
        <span className="error">{getFieldError("email")}</span>
      )}
      <button disabled={isSubmitting}>
        {isSubmitting ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 반복 로직을 Custom Hook으로 추출 [Applying]

**목표:** 중복되는 상태 로직을 식별하고 Custom Hook으로 추출한다.

아래 두 컴포넌트에서 **공통 로직**을 Custom Hook으로 추출하라.

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/users?page=${page}`)
      .then(r => r.json())
      .then(data => { setUsers(data); setIsLoading(false); })
      .catch(err => { setError(err.message); setIsLoading(false); });
  }, [page]);

  return (/* 사용자 목록 UI */);
}

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products?page=${page}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setIsLoading(false); })
      .catch(err => { setError(err.message); setIsLoading(false); });
  }, [page]);

  return (/* 상품 목록 UI */);
}
```

**작성할 것:**

- `usePaginatedData(baseUrl)` Custom Hook
- Hook을 사용하여 두 컴포넌트를 리팩토링한 코드

---

### 실습 2: 실전 Custom Hook 구현 [Applying]

**목표:** 실용적인 Custom Hook을 처음부터 설계·구현한다.

다음 3개의 Custom Hook을 구현하라:

```
Hook 1: useDebounce(value, delay)
  · value가 변한 후 delay(ms) 동안 추가 변경이 없으면 최종 값을 반환
  · 타이핑 중에는 이전 값을 유지
  · Cleanup으로 타이머 정리

Hook 2: useLocalStorage(key, initialValue)
  · localStorage와 useState를 동기화
  · 초기값을 localStorage에서 읽기 (없으면 initialValue)
  · setValue 시 localStorage에도 저장
  · JSON 직렬화/역직렬화 포함
  · 에러 처리 (JSON 파싱 실패 등)

Hook 3: useKeyPress(targetKey)
  · 특정 키가 현재 눌려있는지 boolean 반환
  · keydown/keyup 이벤트 리스너 등록/해제
  · Cleanup 포함
```

---

### 실습 3: Hook 합성으로 복합 기능 구현 [Analyzing · Creating]

**목표:** 기본 Hook을 조합하여 복잡한 기능을 구현한다.

실습 2에서 만든 Hook들을 조합하여 **키보드 단축키 검색** 기능을 만든다:

```
요구사항:
  · '/' 키를 누르면 검색창에 포커스 (useKeyPress + useRef)
  · Escape 키를 누르면 검색창 비우고 포커스 해제 (useKeyPress + useRef)
  · 검색어 입력 시 300ms 디바운스 (useDebounce)
  · 검색 기록을 localStorage에 저장 (useLocalStorage)
  · 디바운스된 검색어가 변하면 결과 필터링

작성할 것:
  · useSearchWithShortcuts() — 합성 Hook
  · SearchPage — 이 Hook을 사용하는 컴포넌트
```

---

### 실습 4 (선택): Hook API 설계 비평 [Evaluating]

**목표:** Hook API의 설계 품질을 평가하고 개선한다.

아래 Custom Hook의 **설계 문제점**을 식별하고 개선안을 제시하라.

```jsx
function useApi(
  url,
  method,
  body,
  headers,
  onDone,
  onFail,
  cache,
  retry,
  delay,
) {
  const [r, setR] = useState(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState(null);

  useEffect(() => {
    setL(true);
    fetch(url, { method, body: JSON.stringify(body), headers })
      .then((r) => r.json())
      .then((d) => {
        setR(d);
        setL(false);
        if (onDone) onDone(d);
      })
      .catch((e) => {
        setE(e);
        setL(false);
        if (onFail) onFail(e);
      });
  }, [url, method, body, headers, onDone, onFail]);

  return [r, l, e];
}
```

**평가 관점:**

- 네이밍(함수명, 매개변수명, 반환값)
- 인터페이스 설계(매개변수 수, 옵션 구조)
- 의존성 배열의 문제점
- 반환값 형태
- 누락된 기능 (취소, 에러 분류 등)

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 16 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Custom Hook = use 접두사 + 다른 Hook을 호출하는 함수      │
│     → 상태 로직(State + Effect 패턴)을 재사용 가능하게 추출   │
│     → 일반 JavaScript 함수일 뿐, 특별한 마법은 없다          │
│     → 기존 Hook의 "조합(Composition)"이 본질                 │
│                                                               │
│  2. Custom Hook은 State를 공유하지 않는다                     │
│     → 같은 Hook을 호출해도 각 컴포넌트에 독립적인 State       │
│     → 공유되는 것은 "로직(패턴)"이지 "값(State)"이 아니다    │
│     → State 공유는 Lifting State Up / Context / 전역 상태    │
│                                                               │
│  3. 관심사 분리(SoC)를 실현한다                               │
│     → 컴포넌트: UI 렌더링에 집중                             │
│     → Custom Hook: 상태 로직에 집중                          │
│     → 각각 독립적으로 변경·테스트·재사용 가능                 │
│                                                               │
│  4. Hook API 설계 4원칙                                       │
│     → 명확한 네이밍: "무엇을 하는가"가 이름에 드러남          │
│     → 적절한 반환값: 1개→값, 2개→배열, 3+→객체               │
│     → 최소한의 인터페이스: 필수 인자만 노출, 옵션은 객체로    │
│     → 구현 은닉: 사용자는 "무엇"만, "어떻게"는 내부에        │
│                                                               │
│  5. Hook 합성으로 복잡한 기능을 구축한다                      │
│     → 기본 Hook(useDebounce, useFetch 등)을 조합             │
│     → 각 Hook은 하나의 책임만 가진다                         │
│     → 합성 Hook은 기본 Hook의 인터페이스만 의존              │
│                                                               │
│  6. 추출 시점 판단 기준                                       │
│     → 2개+ 컴포넌트에서 동일 패턴 반복 → 추출                │
│     → 컴포넌트가 길고 복잡 → 관심사별 분리 목적으로 추출      │
│     → 독립 테스트 필요 → 추출                                │
│     → "혹시 나중에"는 추출 이유가 아니다 (YAGNI)             │
│                                                               │
│  7. 실전 Custom Hook 패턴                                    │
│     → useFetch: 데이터 패칭 추상화                           │
│     → useLocalStorage: localStorage 동기화                   │
│     → useDebounce: 값 디바운싱                               │
│     → useClickOutside: 외부 클릭 감지                        │
│     → useToggle: 불리언 토글                                 │
│     → usePrevious: 이전 값 추적                              │
│     → useMediaQuery: 반응형 분기                             │
│     → useInterval: 선언적 인터벌 관리                        │
│     → useForm: 폼 상태 통합 관리                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                        | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Custom Hook이 "use" 접두사를 가져야 하는 2가지 이유는?                                      | Remember   | 3.1         |
| 2   | 두 컴포넌트가 같은 Custom Hook을 호출하면 State가 공유되는가? 그 이유는?                    | Understand | 2.2, 4.1    |
| 3   | Custom Hook으로 관심사를 분리하면 어떤 이점이 있는가?                                       | Understand | 3.3         |
| 4   | Hook의 반환값이 3개 이상일 때 배열 대신 객체를 사용해야 하는 이유는?                        | Apply      | 3.5         |
| 5   | useDebounce와 useFetch를 합성하여 useSearch를 만드는 과정을 설명하라                        | Apply      | 3.6         |
| 6   | `useApi(url, method, body, headers, onDone, onFail, cache, retry, delay)`의 설계 문제점은?  | Analyze    | 3.5         |
| 7   | "로직이 하나의 컴포넌트에서만 사용되지만 50줄 이상"인 경우 Custom Hook으로 추출해야 하는가? | Evaluate   | 3.4         |
| 8   | 하나의 Hook이 20개의 State와 10개의 Effect를 가지고 있다면 어떻게 개선하는가?               | Evaluate   | 4.3         |

### 6.3 FAQ

**Q1. Custom Hook을 사용하면 컴포넌트 성능에 영향이 있는가?**

Custom Hook 자체가 성능에 추가적인 오버헤드를 만들지는 않는다. Hook은 단순히 함수 호출이며, 내부의 State와 Effect는 컴포넌트에 직접 작성한 것과 동일하게 동작한다. 오히려 Custom Hook으로 분리하면 로직을 더 쉽게 메모이제이션하고 최적화할 수 있어 성능에 긍정적인 영향을 줄 수 있다.

**Q2. Custom Hook 파일은 어디에 두어야 하는가?**

프로젝트 규모에 따라 다르지만 일반적인 관례는 다음과 같다: 소규모 프로젝트는 `src/hooks/` 디렉토리에 모아두고, 대규모 프로젝트는 관련 기능 폴더 안에 함께 배치한다. 예를 들어 `useFetch`처럼 범용적인 Hook은 `src/hooks/`, `useProductList`처럼 특정 기능에 종속된 Hook은 `src/features/products/hooks/`에 두는 방식이다.

**Q3. HOC(Higher Order Component)와 Custom Hook의 차이는?**

HOC는 컴포넌트를 인자로 받아 새로운 컴포넌트를 반환하는 패턴이다. 로직을 공유할 수 있지만 컴포넌트 트리가 깊어지고, 프로퍼티 이름이 충돌할 수 있으며, 디버깅이 어렵다는 단점이 있다. Custom Hook은 이런 단점 없이 동일한 목적을 달성한다. 새로운 코드에서는 Custom Hook을 사용하는 것이 권장된다.

**Q4. 언제 Custom Hook 대신 Context를 사용해야 하는가?**

Custom Hook은 로직을 재사용하지만 State는 각 컴포넌트에 독립적으로 존재한다. 여러 컴포넌트가 **같은 State 값을 공유**해야 한다면 Context나 전역 상태 관리를 사용해야 한다. 예를 들어 사용자 인증 정보, 테마, 언어 설정처럼 앱 전체에서 동일한 값에 접근해야 하는 경우가 해당된다.

**Q5. Custom Hook 안에서 다른 Custom Hook을 호출할 수 있는가?**

가능하다. 이것이 바로 Hook 합성(Composition) 패턴의 핵심이다. `useSearch`가 `useDebounce`와 `useFetch`를 내부에서 호출하는 것처럼, Custom Hook은 다른 Custom Hook을 자유롭게 호출할 수 있다. 단, 일반 함수나 이벤트 핸들러 안에서는 호출할 수 없다는 Hook 규칙은 동일하게 적용된다.

---

## 7. 다음 단계 예고

> **Step 17. Error Handling 아키텍처** (Phase 2 마무리)
>
> - Error Boundary: 렌더링 에러를 잡는 컴포넌트
> - 비동기 에러 처리 전략 (useEffect, Promise)
> - Fallback UI 설계와 사용자 경험
> - Error + Suspense 결합 전략
> - 전역 에러 핸들링 패턴
>
> Phase 2의 마지막 Step으로, 에러 처리의 아키텍처를 설계한다.

---

## 📚 참고 자료

- [React 공식 문서 — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React 공식 문서 — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React 공식 문서 — Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [usehooks.com — Custom Hook 레시피 모음](https://usehooks.com/)
- [useHooks-ts — TypeScript Custom Hook 라이브러리](https://usehooks-ts.com/)

---

> **React 완성 로드맵 v2.0** | Phase 2 — Hooks와 부수 효과 아키텍처 | Step 16 of 42
