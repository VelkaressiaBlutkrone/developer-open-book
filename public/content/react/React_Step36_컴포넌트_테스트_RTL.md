# Step 36. 컴포넌트 테스트 (React Testing Library)

> **Phase 6 — 테스트와 품질 보증 (Step 36~38)**
> 테스트와 품질 보증으로 앱의 신뢰성을 확보한다 — **Phase 6 시작**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Remember**   | 테스트 피라미드의 3계층(단위/통합/E2E)과 각각의 역할을 기술할 수 있다                        |
| **Understand** | React Testing Library의 철학("사용자처럼 테스트한다")이 기존 방식과 다른 점을 설명할 수 있다 |
| **Apply**      | RTL로 컴포넌트 렌더링, 이벤트 시뮬레이션, 비동기 대기를 구현할 수 있다                       |
| **Apply**      | MSW(Mock Service Worker)로 API를 모킹하여 데이터 패칭 컴포넌트를 테스트할 수 있다            |
| **Analyze**    | "무엇을 테스트해야 하는가"와 "무엇을 테스트하지 말아야 하는가"를 분석할 수 있다              |
| **Evaluate**   | 프로젝트의 테스트 전략(무엇을, 어떤 수준으로, 얼마나)을 판단할 수 있다                       |

**전제 지식:**

- Step 16: Custom Hook
- Step 22~23: 데이터 패칭, TanStack Query
- Step 27: 컴포넌트 설계 패턴

---

## 1. 서론 — 왜 테스트하는가

### 1.1 테스트의 역사와 소프트웨어 품질의 진화

소프트웨어 테스트는 1950년대 컴퓨팅 초창기부터 존재했지만, 체계적인 테스트 방법론은 1960~70년대에 발전했다. 초기에는 "프로그램이 올바른지 증명하는 것"이 테스트의 목적이었고, 대부분 수동으로 이루어졌다. 1970년대 구조적 테스트 이론이 등장하고, 1980년대 GUI 등장으로 자동화 테스트 도구가 필요해졌다.

웹 개발에서 자동화 테스트가 본격화된 것은 2000년대 초반이다. JUnit(2000)이 자바 생태계에서 단위 테스트를 대중화했고, Selenium(2004)이 브라우저 자동화를 가능하게 했다. JavaScript 생태계에서는 Jasmine(2008), Mocha(2011), Jest(2014)로 발전했다. React 생태계에서는 Enzyme(2015)이 컴포넌트 내부 구조를 테스트하는 방식을 채택했지만, Kent C. Dodds가 2018년 React Testing Library를 발표하며 "사용자처럼 테스트한다"는 새로운 철학을 제시했다.

RTL의 철학 전환은 테스트 커뮤니티에 큰 영향을 미쳤다. Enzyme 방식은 "컴포넌트의 state가 특정 값인가", "특정 메서드가 호출되었는가" 같은 구현 세부사항을 테스트했다. 이는 리팩토링 후 기능이 동일해도 테스트가 실패하는 "취약한 테스트(Brittle Tests)"를 만들었다. RTL은 "사용자가 화면에서 보고 상호작용하는 것"을 테스트함으로써 리팩토링에 강한 테스트를 만들 수 있게 했다.

### 1.2 테스트가 없는 코드베이스의 실제 비용

테스트가 없는 코드베이스에서 개발하는 비용은 표면적으로 드러나지 않아 간과되기 쉽다. 그러나 시간이 지나면서 다음과 같은 비용이 누적된다.

```
테스트가 없으면:
  · "이 버튼 수정했는데 다른 곳이 깨진 건 아닌지..." → 불안
  · "리팩토링하고 싶은데 기존 동작이 바뀔까봐..." → 정체
  · "배포하기 전에 전부 수동으로 확인해야..." → 느린 릴리스
  · "신규 팀원이 코드를 수정한 후 기존 기능이 깨졌는데 아무도 몰랐다" → 사고

테스트가 있으면:
  · 코드 수정 → 테스트 실행 → "기존 동작이 유지되는가?" 즉시 확인 ★
  · 리팩토링을 두려움 없이 진행 (테스트가 안전망)
  · 배포 전 자동 검증 (CI/CD에서 테스트 실행)
  · 테스트 자체가 "이 컴포넌트는 이렇게 동작한다"는 문서 역할

핵심: 테스트는 "현재 코드가 올바른지"보다
      "미래의 변경이 기존 동작을 깨뜨리지 않는지"를 보장한다 ★
```

Microsoft의 연구에 따르면, 테스트 주도 개발(TDD)을 적용한 팀은 그렇지 않은 팀에 비해 결함(버그) 수가 40~90% 감소했고, 초기 개발 시간이 15~35% 증가했지만 전체 생애주기 비용은 감소했다. 테스트 작성에 드는 비용은 장기적으로 디버깅, 수동 테스트, 프로덕션 장애 대응 비용으로 회수된다.

### 1.3 테스트 피라미드

```
              ╱╲
             ╱  ╲         E2E 테스트
            ╱    ╲        · 브라우저에서 전체 앱 동작 검증
           ╱      ╲       · 가장 느리고, 가장 비싸고, 가장 현실적
          ╱────────╲      · Cypress, Playwright
         ╱          ╲
        ╱            ╲    통합 테스트
       ╱              ╲   · 여러 컴포넌트/모듈의 협업 검증
      ╱                ╲  · RTL로 컴포넌트 + Hook + API 통합
     ╱──────────────────╲
    ╱                    ╲ 단위 테스트
   ╱                      ╲· 개별 함수/컴포넌트의 독립적 검증
  ╱                        ╲· 가장 빠르고, 가장 저렴하고, 가장 많이
 ╱──────────────────────────╲ · Vitest, Jest

  비율 권장 (React 앱):
    단위 + 통합 테스트: 70~80% ★ (RTL + Vitest)
    E2E 테스트: 20~30% (Playwright)

  React 커뮤니티의 합의:
    "통합 테스트에 가장 많은 투자를 하라"
    — Kent C. Dodds (Testing Library 창시자)
```

### 1.4 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · React Testing Library(RTL)의 철학과 핵심 API         │
│  · 컴포넌트 렌더링, 쿼리, 이벤트 테스트                  │
│  · 비동기 테스트 (waitFor, findBy)                      │
│  · Custom Hook 테스트 (renderHook)                      │
│  · MSW로 API 모킹                                       │
│  · "무엇을 테스트할 것인가" 전략                         │
│  · 테스트 구조와 패턴                                    │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · E2E 테스트 (Step 37)                                 │
│  · 스냅샷 테스트 (제한적 가치)                           │
│  · Vitest/Jest 설정 상세                                │
│  · 시각적 회귀 테스트 (Chromatic 등)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                   | 정의                                                                  | 왜 중요한가                                                   |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| **RTL**                | React Testing Library. 컴포넌트를 **사용자 관점**에서 테스트하는 도구 | 구현 세부사항이 아닌 "사용자가 보고 상호작용하는 것"을 테스트 |
| **render**             | 컴포넌트를 **가상 DOM에 렌더링**하는 RTL 함수                         | 테스트의 시작점 — 컴포넌트를 마운트                           |
| **screen**             | 렌더링된 DOM에서 **요소를 찾는** 쿼리 객체                            | getByRole, getByText, findByText 등                           |
| **userEvent**          | 사용자 상호작용을 **실제처럼 시뮬레이션**하는 라이브러리              | click, type, tab 등 — fireEvent보다 현실적                    |
| **waitFor**            | 비동기 상태 변화를 **기다리는** 유틸리티                              | API 응답 후 UI 변화를 테스트할 때 필수                        |
| **MSW**                | Mock Service Worker. 네트워크 레벨에서 **API를 가로채 모킹**하는 도구 | 실제 HTTP 요청을 가로채므로 fetch/axios 어떤 것이든 동작      |
| **renderHook**         | Custom Hook을 **컴포넌트 없이 독립적으로 테스트**하는 유틸리티        | Hook의 반환값과 상태 변화를 직접 검증                         |
| **Arrange-Act-Assert** | 테스트의 **3단계 구조**. 준비 → 실행 → 검증                           | 일관된 테스트 구조로 가독성 향상                              |

### 2.2 RTL의 철학 — "사용자처럼 테스트한다"

```
"구현 세부사항을 테스트하지 말고, 사용자가 보는 것을 테스트하라"

  ❌ 구현 세부사항 테스트 (깨지기 쉬움):
    · State 값이 특정 값인지 확인
    · 특정 함수가 호출되었는지 확인
    · 컴포넌트 내부 메서드를 직접 호출
    · CSS 클래스 이름이 특정 값인지 확인
    → 리팩토링하면 깨진다! (동작은 동일한데 테스트가 실패)

  ✅ 사용자 관점 테스트 (안정적):
    · "저장" 버튼이 화면에 보이는가?
    · 이메일 입력 필드에 텍스트를 입력할 수 있는가?
    · 폼 제출 후 "성공" 메시지가 표시되는가?
    · 에러가 발생하면 에러 메시지가 표시되는가?
    → 리팩토링해도 사용자 경험이 동일하면 테스트도 통과!

  원칙:
    "소프트웨어가 사용되는 방식과 유사한 테스트일수록
     테스트가 더 큰 신뢰를 준다" — Kent C. Dodds
```

### 2.3 용어 이론적 배경

#### RTL vs Enzyme — 철학의 차이

Enzyme은 React 컴포넌트의 **내부 구조**에 접근하는 것을 쉽게 만들었다. `wrapper.state()`, `wrapper.instance()`, `wrapper.find('.className')` 같은 API가 내부 상태와 구현을 직접 검사했다. 이 방식의 문제는 컴포넌트를 리팩토링(예: class component → function component, useState → useReducer)할 때 기능은 동일한데 내부 구조가 바뀌어 테스트가 깨진다는 것이다. 이를 "테스트가 리팩토링을 방해한다"고 표현한다.

RTL은 반대로 DOM에 렌더링된 결과물(사용자가 실제로 보는 것)을 기준으로 테스트한다. `getByRole('button', { name: '저장' })`은 "저장이라는 이름의 버튼 역할을 하는 요소"를 찾는데, 이는 `<button>`, `<input type="submit">`, `role="button"` 모두를 찾는다. 구현 방식이 바뀌어도 사용자에게 보이는 결과가 동일하면 테스트는 통과한다.

#### MSW — 네트워크 레벨 모킹의 의미

기존 API 모킹 방법은 `jest.mock('axios')`처럼 특정 HTTP 라이브러리를 교체하는 방식이었다. 이는 두 가지 문제를 가진다. 첫째, 테스트 코드가 "컴포넌트가 axios를 사용한다"는 구현 세부사항에 의존한다. 프로젝트가 fetch API로 전환하면 모킹 코드도 수정해야 한다. 둘째, 실제 네트워크 요청 흐름(요청 → 응답 → 상태 업데이트)을 시뮬레이션하지 못한다.

MSW는 Service Worker를 이용해 **네트워크 레벨**에서 요청을 가로챈다. 컴포넌트 코드는 변경 없이 실제 fetch/axios를 그대로 사용하고, MSW가 그 요청을 가로채 모킹 응답을 반환한다. "어떤 HTTP 라이브러리를 쓰든 동작한다"는 것이 핵심 장점이다.

---

## 3. 이론과 원리

### 3.1 RTL 핵심 API — 쿼리(Query)

#### 쿼리 우선순위

```
RTL이 권장하는 쿼리 우선순위 (접근성 기반!) ★

  1순위: 모든 사용자가 접근 가능한 쿼리
    getByRole       → 역할로 찾기 (button, textbox, heading 등)
    getByLabelText  → 레이블로 찾기 (폼 필드)
    getByPlaceholderText → placeholder로 찾기
    getByText        → 텍스트로 찾기
    getByDisplayValue → 현재 표시된 값으로 찾기

  2순위: 시맨틱 쿼리
    getByAltText    → alt 속성으로 찾기 (이미지)
    getByTitle      → title 속성으로 찾기

  3순위: Test ID (최후의 수단)
    getByTestId     → data-testid 속성으로 찾기
    → 다른 방법이 모두 불가능할 때만 사용!

  왜 getByRole이 1순위인가?
    · 접근성을 동시에 검증한다 ★
    · button 역할이 없으면 → 접근성 문제 + 테스트 실패
    · "테스트가 통과하면 접근성도 보장되는" 구조
```

#### getBy vs queryBy vs findBy

```
┌─────────────┬────────────────────┬───────────────────┬─────────────────┐
│             │  getBy             │  queryBy           │  findBy          │
├─────────────┼────────────────────┼───────────────────┼─────────────────┤
│  요소 없으면 │  에러 throw ★     │  null 반환        │  에러 throw     │
│  용도       │  요소가 반드시 존재│  요소가 없음을     │  비동기로 나타날│
│             │  해야 할 때        │  확인할 때         │  요소를 기다림  │
│  비동기     │  ❌               │  ❌               │  ✅ (await)     │
│  예시       │  getByRole('button')│ queryByText('에러')│ findByText('결과')│
└─────────────┴────────────────────┴───────────────────┴─────────────────┘

  getByRole('button')   → 버튼이 반드시 있어야 함. 없으면 테스트 실패
  queryByText('에러')    → 에러 메시지가 없음을 확인. null이면 OK
  await findByText('결과') → API 응답 후 "결과"가 나타날 때까지 대기
```

### 3.2 기본 테스트 패턴

#### 컴포넌트 렌더링 + 요소 확인

```tsx
// Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}

function Button({
  children,
  variant = "primary",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  // Arrange-Act-Assert 패턴

  it("텍스트가 표시된다", () => {
    // Arrange: 컴포넌트 렌더링
    render(<Button>저장</Button>);

    // Act: (이 경우 없음 — 렌더링만 확인)

    // Assert: 버튼이 존재하고 텍스트가 올바른지 확인
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("클릭 시 onClick이 호출된다", async () => {
    // Arrange
    const handleClick = vi.fn(); // Vitest의 모킹 함수
    render(<Button onClick={handleClick}>저장</Button>);
    const user = userEvent.setup();

    // Act: 사용자가 버튼을 클릭
    await user.click(screen.getByRole("button", { name: "저장" }));

    // Assert: onClick이 1번 호출되었는지
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태에서는 클릭할 수 없다", async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        저장
      </Button>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });
});
```

#### 폼 입력 + 제출 테스트

```tsx
// LoginForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("LoginForm", () => {
  it("이메일과 비밀번호를 입력하고 제출할 수 있다", async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    const user = userEvent.setup();

    // 이메일 입력 — 레이블로 필드 찾기 (접근성 검증!)
    await user.type(screen.getByLabelText("이메일"), "user@example.com");

    // 비밀번호 입력
    await user.type(screen.getByLabelText("비밀번호"), "password123");

    // 폼 제출
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // 제출 핸들러가 올바른 데이터로 호출되었는지
    expect(handleSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("이메일이 비어있으면 에러 메시지가 표시된다", async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    const user = userEvent.setup();

    // 이메일 비우고 제출
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // 에러 메시지 확인
    expect(screen.getByText("이메일을 입력하세요")).toBeInTheDocument();
  });
});
```

### 3.3 비동기 테스트

```tsx
// UserProfile.tsx — API에서 데이터를 가져와 표시
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <p>로딩 중...</p>;
  return <h1>{user.name}</h1>;
}

// UserProfile.test.tsx
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// MSW 서버 설정 — 네트워크 레벨에서 API를 가로챔
const server = setupServer(
  http.get("/api/users/:id", () => {
    return HttpResponse.json({
      id: 1,
      name: "홍길동",
      email: "hong@example.com",
    });
  }),
);

beforeAll(() => server.listen()); // 테스트 전 서버 시작
afterEach(() => server.resetHandlers()); // 각 테스트 후 핸들러 리셋
afterAll(() => server.close()); // 테스트 후 서버 종료

describe("UserProfile", () => {
  it("로딩 후 사용자 이름이 표시된다", async () => {
    render(<UserProfile userId={1} />);

    // 로딩 상태 확인
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();

    // 비동기 대기: "홍길동"이 나타날 때까지 기다림
    expect(await screen.findByText("홍길동")).toBeInTheDocument();

    // 로딩이 사라졌는지 확인
    expect(screen.queryByText("로딩 중...")).not.toBeInTheDocument();
  });

  it("API 에러 시 에러 메시지가 표시된다", async () => {
    // 이 테스트에서만 에러 응답으로 덮어씀
    server.use(
      http.get("/api/users/:id", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<UserProfile userId={1} />);

    expect(await screen.findByText(/오류/)).toBeInTheDocument();
  });
});
```

```
MSW(Mock Service Worker)의 원리

  기존 모킹:
    · fetch나 axios를 직접 모킹 → 구현에 종속
    · jest.mock('axios') → axios를 교체
    · 테스트가 구현 세부사항에 의존 → 깨지기 쉬움

  MSW:
    · 네트워크 레벨에서 요청을 가로챔 ★
    · 컴포넌트 코드는 변경 없이 실제 fetch/axios를 그대로 사용
    · 테스트에서 서버 응답만 정의하면 됨
    · 구현에 종속되지 않음 → 안정적

  MSW v2 API:
    http.get('/api/users/:id', ({ params }) => {
      return HttpResponse.json({ id: params.id, name: '홍길동' });
    })
```

### 3.4 Custom Hook 테스트

```tsx
// useCounter.ts
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset };
}

// useCounter.test.ts
import { renderHook, act } from "@testing-library/react";

describe("useCounter", () => {
  it("초기값으로 시작한다", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("increment가 count를 1 증가시킨다", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("reset이 초기값으로 되돌린다", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(7);

    act(() => {
      result.current.reset();
    });
    expect(result.current.count).toBe(5);
  });
});
```

```
renderHook의 핵심

  · Hook을 컴포넌트 없이 독립적으로 실행
  · result.current에서 Hook의 현재 반환값 접근
  · act()로 상태 변경을 감싸야 함 (React의 배치 업데이트)
  · rerender()로 Props 변경 시뮬레이션 가능

  주의: "컴포넌트 통합 테스트로도 충분한 경우가 많다"
    · 간단한 Hook → 사용하는 컴포넌트를 통합 테스트
    · 복잡한 로직 Hook → renderHook으로 단위 테스트
```

### 3.5 TanStack Query 컴포넌트 테스트

```tsx
// 테스트에서 QueryClientProvider 래핑
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // 테스트에서 재시도 비활성화
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// ProductList.test.tsx
describe("ProductList", () => {
  it("상품 목록이 로딩 후 표시된다", async () => {
    // MSW가 /api/products 응답을 제공
    server.use(
      http.get("/api/products", () => {
        return HttpResponse.json([
          { id: 1, name: "노트북", price: 1200000 },
          { id: 2, name: "키보드", price: 85000 },
        ]);
      }),
    );

    renderWithQuery(<ProductList />);

    // 로딩 상태
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();

    // 데이터 표시 대기
    expect(await screen.findByText("노트북")).toBeInTheDocument();
    expect(screen.getByText("키보드")).toBeInTheDocument();
  });
});
```

### 3.6 "무엇을 테스트할 것인가" 전략

```
테스트해야 하는 것:

  1. 사용자가 보는 것
     · 텍스트, 버튼, 입력 필드가 올바르게 표시되는가
     · 조건에 따라 올바른 UI가 렌더링되는가

  2. 사용자가 하는 것
     · 클릭, 입력, 제출이 올바른 결과를 만드는가
     · 에러 발생 시 에러 UI가 표시되는가
     · 로딩 상태가 적절히 표시되는가

  3. 핵심 비즈니스 로직
     · 가격 계산, 할인 적용이 올바른가
     · 폼 검증이 정확한가
     · 상태 전이가 올바른가

  4. 엣지 케이스
     · 빈 데이터, null, undefined 처리
     · 네트워크 에러, 타임아웃
     · 매우 긴 텍스트, 특수 문자


테스트하지 말아야 하는 것:

  1. 구현 세부사항
     · State 값이 특정 숫자인지
     · useEffect가 몇 번 호출되었는지
     · 내부 함수가 호출되었는지

  2. 서드파티 라이브러리의 동작
     · React Router가 네비게이션하는지
     · TanStack Query가 캐싱하는지
     · 이들은 자체 테스트가 있다

  3. 스타일링
     · CSS 클래스 이름이 무엇인지
     · 특정 색상이 적용되었는지
     · 시각적 검증은 별도 도구(Chromatic 등)로

  4. 1:1 매핑 테스트
     · Props를 받아 그대로 렌더링하는 단순 컴포넌트
     · 로직이 없는 Presentational 컴포넌트
```

### 3.7 테스트 구조와 패턴

#### 파일 위치 — Co-location

```
src/features/products/components/
  ├── ProductCard.tsx
  ├── ProductCard.test.tsx    ← 같은 폴더에 (Co-location)
  ├── ProductGrid.tsx
  └── ProductGrid.test.tsx

장점:
  · 컴포넌트와 테스트가 함께 위치 → 찾기 쉬움
  · 컴포넌트 삭제 시 테스트도 함께 삭제
  · "이 컴포넌트에 테스트가 있는가?" 즉시 확인
```

#### describe/it 구조

```tsx
describe('ProductCard', () => {
  // 렌더링 테스트
  describe('렌더링', () => {
    it('상품명이 표시된다', () => { ... });
    it('가격이 포맷팅되어 표시된다', () => { ... });
    it('이미지가 올바른 alt 속성을 가진다', () => { ... });
  });

  // 상호작용 테스트
  describe('상호작용', () => {
    it('장바구니 버튼 클릭 시 onAddToCart가 호출된다', () => { ... });
    it('상품 클릭 시 상세 페이지로 이동한다', () => { ... });
  });

  // 상태별 테스트
  describe('품절 상태', () => {
    it('품절 배지가 표시된다', () => { ... });
    it('장바구니 버튼이 비활성화된다', () => { ... });
  });
});
```

---

## 4. 사례 연구와 예시

### 4.1 사례: "구현 테스트" vs "행동 테스트"

```tsx
// ❌ 구현 세부사항 테스트 — 리팩토링하면 깨짐
it("count state가 증가한다", () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1);
  // 내부 State 구조에 의존 → useState를 useReducer로 변경하면 깨짐!
});

// ✅ 행동 테스트 — 리팩토링해도 통과
it("+ 버튼 클릭 시 화면의 숫자가 증가한다", async () => {
  render(<Counter />);
  const user = userEvent.setup();

  expect(screen.getByText("0")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByText("1")).toBeInTheDocument();
  // 사용자가 보는 결과를 테스트 → 내부 구현이 바뀌어도 동작이 같으면 통과!
});
```

### 4.2 사례: MSW로 다양한 시나리오 테스트

```tsx
describe("UserList", () => {
  it("성공: 사용자 목록이 표시된다", async () => {
    server.use(
      http.get("/api/users", () =>
        HttpResponse.json([
          { id: 1, name: "홍길동" },
          { id: 2, name: "김철수" },
        ]),
      ),
    );
    renderWithQuery(<UserList />);
    expect(await screen.findByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
  });

  it('빈 목록: "사용자가 없습니다" 표시', async () => {
    server.use(http.get("/api/users", () => HttpResponse.json([])));
    renderWithQuery(<UserList />);
    expect(await screen.findByText("사용자가 없습니다")).toBeInTheDocument();
  });

  it("에러: 에러 메시지와 재시도 버튼 표시", async () => {
    server.use(
      http.get("/api/users", () => new HttpResponse(null, { status: 500 })),
    );
    renderWithQuery(<UserList />);
    expect(await screen.findByText(/오류/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  });
});
```

### 4.3 사례: 테스트 커버리지가 높으면 좋은가?

```
커버리지 100%의 함정

  · 줄 커버리지 100%라도 "모든 동작이 올바른가"를 보장하지 않는다
  · 의미 없는 테스트로 100%를 달성할 수 있다:
    render(<Component />);
    expect(true).toBe(true);  // 100% 커버리지이지만 아무것도 검증 안 함!

  권장 커버리지:
    · 프로젝트 전체: 60~80% (강제하지 않음)
    · 핵심 비즈니스 로직: 90%+ (가능하면)
    · UI 컴포넌트: 의미 있는 동작만 테스트

  "커버리지 숫자보다 테스트의 품질이 중요하다"
    · 테스트가 실제 버그를 잡을 수 있는가?
    · 테스트가 리팩토링을 방해하지 않는가?
    · 테스트가 읽기 쉽고 유지보수 가능한가?
```

### 4.4 사례: getByRole로 접근성을 동시에 검증

RTL의 `getByRole`은 단순히 요소를 찾는 것을 넘어 접근성 속성까지 함께 검증한다. 이를 활용하면 테스트와 접근성 감사를 동시에 수행할 수 있다.

```tsx
// ❌ 접근성을 검증하지 않는 테스트
it("버튼이 존재한다", () => {
  render(<DeleteButton />);
  // data-testid에 의존 → 접근성 문제를 검출하지 못함
  expect(screen.getByTestId("delete-btn")).toBeInTheDocument();
});

// ✅ 접근성을 함께 검증하는 테스트
it("삭제 버튼이 존재하고 접근 가능한 이름을 가진다", () => {
  render(<DeleteButton />);
  // getByRole은 aria-label, aria-labelledby, 텍스트 콘텐츠를 모두 확인
  expect(screen.getByRole("button", { name: "항목 삭제" })).toBeInTheDocument();
  // → <button>항목 삭제</button>
  // → <button aria-label="항목 삭제">×</button>
  // → 둘 다 통과! 구현 방식에 무관
});

// 접근성 문제가 있는 컴포넌트는 테스트에서 즉시 드러남
function BadDeleteButton() {
  return <button>×</button>; // 아이콘만 있고 텍스트 없음
}

it("삭제 버튼이 존재한다", () => {
  render(<BadDeleteButton />);
  // getByRole('button', { name: '항목 삭제' }) → 실패!
  // → "×"라는 텍스트만 있고, "항목 삭제"라는 이름이 없음
  // → 접근성 문제가 테스트 실패로 드러남 ★
});
```

### 4.5 사례: 폼 검증 통합 테스트

RHF + Zod를 사용한 폼의 검증 동작을 RTL로 테스트하는 완전한 예시다.

```tsx
// RegisterForm.test.tsx
describe("RegisterForm — 검증", () => {
  it("모든 필드가 비어있으면 에러 메시지가 표시된다", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    // 빈 상태로 제출
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    // 모든 필수 필드에 에러 표시 확인
    expect(screen.getByText("이름을 입력하세요")).toBeInTheDocument();
    expect(screen.getByText("이메일을 입력하세요")).toBeInTheDocument();
    expect(
      screen.getByText("비밀번호는 8자 이상이어야 합니다"),
    ).toBeInTheDocument();
  });

  it("유효하지 않은 이메일 형식이면 에러가 표시된다", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이메일"), "not-an-email");
    await user.tab(); // 다음 필드로 이동 (blur 이벤트 트리거)

    expect(
      screen.getByText("유효한 이메일 주소를 입력해 주세요"),
    ).toBeInTheDocument();
  });

  it("올바른 데이터로 제출하면 onSubmit이 호출된다", async () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이름"), "홍길동");
    await user.type(screen.getByLabelText("이메일"), "hong@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "password123!");
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "홍길동",
        email: "hong@example.com",
      }),
    );
  });
});
```

### 4.6 사례: 테스트 작성 전략 — 무엇부터 시작할까

신규 프로젝트나 테스트가 없는 기존 프로젝트에서 테스트를 어디서부터 시작할지 결정하는 기준이 필요하다.

```
테스트 우선순위 결정 기준

  즉시 테스트해야 하는 것 (높은 우선순위):
    · 결제, 회원가입, 로그인 — 비즈니스 핵심 흐름
    · 자주 버그가 발생하는 컴포넌트
    · 여러 팀원이 함께 수정하는 공유 컴포넌트
    · 복잡한 조건부 렌더링 로직

  나중에 추가해도 되는 것 (낮은 우선순위):
    · 단순 Presentational 컴포넌트 (로직 없음)
    · 정적 콘텐츠 페이지
    · 거의 변경되지 않는 레거시 코드

  테스트 추가 시점:
    · 버그 수정 시: 버그를 재현하는 테스트 먼저 작성 → 수정 → 테스트 통과
    → 같은 버그가 재발하면 즉시 알 수 있다

  ROI(투자 대비 수익) 관점:
    · 테스트 작성 비용 < 버그 발생 시 수정 비용?
    → YES: 테스트 작성
    → NO: 테스트 생략 또는 수동 테스트로 대체
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 기본 컴포넌트 테스트 [Applying]

**목표:** RTL의 기본 API로 컴포넌트를 테스트한다.

```
요구사항:
  · Button 컴포넌트 테스트:
    - 텍스트가 올바르게 표시되는가
    - 클릭 시 onClick이 호출되는가
    - disabled 시 클릭이 무시되는가
  · SearchBar 컴포넌트 테스트:
    - 텍스트를 입력할 수 있는가
    - Enter 키로 검색이 실행되는가
    - 검색어가 비어있으면 검색이 실행되지 않는가
  · ProductCard 컴포넌트 테스트:
    - 상품명, 가격이 표시되는가
    - 이미지 alt 속성이 올바른가
    - 장바구니 버튼이 동작하는가

쿼리 규칙: getByRole > getByLabelText > getByText (우선순위 준수)
```

---

### 실습 2: 비동기 + MSW 테스트 [Applying]

**목표:** API 모킹으로 비동기 컴포넌트를 테스트한다.

```
요구사항:
  · MSW 서버 설정 (setup/teardown)
  · ProductList 테스트:
    - 성공: 상품 목록이 표시된다
    - 빈 목록: 빈 상태 메시지가 표시된다
    - 에러: 에러 메시지 + 재시도 버튼이 표시된다
    - 로딩: 스피너가 표시된다
  · TanStack Query를 사용하는 경우 QueryClientProvider 래핑
  · findBy를 사용하여 비동기 대기
```

---

### 실습 3: Custom Hook 테스트 [Applying · Analyzing]

**목표:** renderHook으로 Hook을 독립적으로 테스트한다.

```
요구사항:
  · useToggle Hook 테스트:
    - 초기값이 올바른가
    - toggle()이 값을 반전하는가
    - open(), close()가 올바르게 동작하는가
  · useDebounce Hook 테스트:
    - 값이 지연 시간 후에 변경되는가
    - 빠른 연속 호출 시 마지막 값만 반영되는가
  · useFetch Hook 테스트 (MSW 사용):
    - 성공 시 data가 반환되는가
    - 에러 시 error가 설정되는가
    - 로딩 상태가 올바르게 전환되는가

분석: "이 Hook은 renderHook이 필요한가, 컴포넌트 테스트로 충분한가?"
```

---

### 실습 4 (선택): 테스트 전략 설계 [Evaluating]

**목표:** 프로젝트의 테스트 전략을 설계한다.

```
시나리오: 이커머스 앱

컴포넌트/기능 목록:
  1. LoginForm (이메일 + 비밀번호 + 제출)
  2. ProductList (API 데이터 + 필터 + 정렬)
  3. ProductCard (이미지 + 이름 + 가격 + 장바구니 버튼)
  4. CartSummary (아이템 목록 + 총 가격 + 수량 변경)
  5. CheckoutForm (배송 정보 + 결제 정보 + 다단계)
  6. SearchBar (검색어 입력 + 자동완성)
  7. useCart (장바구니 상태 관리 Hook)
  8. formatPrice (가격 포맷팅 유틸)

각 항목에 대해:
  · 테스트 종류 (단위/통합) 결정
  · 테스트할 시나리오 목록 (최소 3개)
  · 테스트하지 않을 것
  · MSW 필요 여부
  · 우선순위 (높음/중간/낮음)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 36 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. RTL의 철학 = "사용자처럼 테스트한다"                      │
│     → 구현 세부사항이 아닌 사용자가 보고 상호작용하는 것을 테스트│
│     → 리팩토링해도 사용자 경험이 동일하면 테스트도 통과        │
│                                                               │
│  2. 쿼리 우선순위: getByRole > getByLabelText > getByText     │
│     → getByRole은 접근성을 동시에 검증 ★                     │
│     → getByTestId는 최후의 수단                              │
│     → getBy(반드시 있음) / queryBy(없음 확인) / findBy(비동기)│
│                                                               │
│  3. userEvent로 실제 사용자 상호작용을 시뮬레이션              │
│     → click, type, tab, keyboard 등                          │
│     → fireEvent보다 현실적 (키보드 이벤트 등 포함)           │
│                                                               │
│  4. MSW = 네트워크 레벨에서 API를 모킹                        │
│     → fetch/axios 어떤 것이든 동작                           │
│     → 성공/에러/빈 응답 등 다양한 시나리오                    │
│     → 구현에 종속되지 않음                                    │
│                                                               │
│  5. renderHook으로 Custom Hook을 독립 테스트                  │
│     → result.current로 반환값 접근                           │
│     → act()로 상태 변경 래핑                                 │
│     → 간단한 Hook은 컴포넌트 통합 테스트로 충분               │
│                                                               │
│  6. "무엇을 테스트할 것인가"가 핵심                           │
│     → 사용자가 보는 것, 하는 것, 핵심 비즈니스 로직           │
│     → 구현 세부사항, 서드파티 동작, 스타일링은 테스트하지 않음│
│     → 커버리지 숫자보다 테스트의 품질이 중요                  │
│                                                               │
│  7. Arrange-Act-Assert 패턴으로 일관된 구조                   │
│     → 준비(렌더링) → 실행(상호작용) → 검증(expect)           │
│     → describe/it으로 테스트를 논리적으로 그룹화              │
│     → Co-location: 컴포넌트와 테스트를 같은 폴더에           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------- | ---------- | ----------- |
| 1   | RTL의 "사용자처럼 테스트한다"가 의미하는 것은?                        | Understand | 2.2         |
| 2   | getByRole이 쿼리 우선순위 1위인 이유는?                               | Understand | 3.1         |
| 3   | getBy, queryBy, findBy의 차이를 "요소 부재 시 동작" 관점에서 설명하라 | Remember   | 3.1         |
| 4   | MSW가 jest.mock(fetch)보다 나은 이유는?                               | Analyze    | 3.3         |
| 5   | "State 값이 1인지 확인"하는 테스트가 나쁜 이유는?                     | Analyze    | 4.1         |
| 6   | 비동기 컴포넌트를 테스트할 때 findByText를 사용하는 이유는?           | Apply      | 3.3         |
| 7   | renderHook과 컴포넌트 통합 테스트 중 어떤 것을 선택하는 기준은?       | Evaluate   | 3.4         |
| 8   | 커버리지 100%가 "모든 버그를 잡는다"를 의미하지 않는 이유는?          | Evaluate   | 4.3         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1: Vitest와 Jest 중 어느 것을 선택해야 하나요?**

A: Vite 기반 프로젝트에는 Vitest를, Create React App 또는 Webpack 기반 프로젝트에는 Jest를 권장합니다. Vitest는 Vite의 설정을 공유하고 ESM을 기본 지원하며, Jest보다 빠른 경우가 많습니다. API가 Jest와 거의 동일하여 전환 비용이 낮습니다. 새 프로젝트라면 Vitest + RTL 조합을 추천합니다.

**Q2: 테스트 작성에 시간이 너무 많이 걸립니다. 효율적인 방법이 있나요?**

A: 몇 가지 방법이 있습니다. (1) 테스트 유틸리티 함수를 만들어 반복 코드를 줄입니다(예: `renderWithProviders`). (2) 가장 가치 있는 테스트 — 핵심 사용자 흐름과 자주 깨지는 컴포넌트 — 에 집중하고 나머지는 생략합니다. (3) TDD(테스트 주도 개발)를 시도해보세요. 컴포넌트 구현 전 테스트를 먼저 작성하면 설계가 명확해지고 전체 시간이 오히려 줄어드는 경우가 있습니다.

**Q3: MSW를 Node.js 환경(Vitest/Jest)에서 설정하는 방법은?**

A: MSW v2는 브라우저(Service Worker)와 Node.js(`msw/node`) 두 환경을 모두 지원합니다. 테스트 파일에서 `setupServer`를 사용하고, `vitest.setup.ts`에 `server.listen()`을 설정합니다. MSW 공식 문서의 "Node.js integration" 가이드를 따르면 됩니다. Next.js와 함께 사용할 경우 별도의 설정이 필요할 수 있습니다.

**Q4: 컴포넌트 테스트와 E2E 테스트의 경계는 어디인가요?**

A: 간단히 말하면, "브라우저를 실행하는가"가 경계입니다. RTL 테스트는 jsdom이라는 가상 DOM에서 실행되고 실제 네트워크 요청이 없습니다(MSW로 모킹). E2E 테스트는 실제 브라우저(Chromium 등)를 실행하고 실제 서버에 요청합니다. RTL은 빠르고 독립적이지만, 실제 브라우저 렌더링이나 네트워크 흐름을 검증할 수 없습니다. 핵심 사용자 흐름(로그인 후 구매 완료)은 E2E로, 개별 컴포넌트 동작은 RTL로 테스트하는 조합이 일반적입니다.

**Q5: 레거시 코드에 테스트를 추가할 때 어디서 시작해야 하나요?**

A: "버그 우선 접근법"을 권장합니다. 버그 리포트가 들어오면, (1) 그 버그를 재현하는 테스트를 먼저 작성합니다. (2) 테스트가 실패하는 것을 확인합니다. (3) 버그를 수정합니다. (4) 테스트가 통과하는 것을 확인합니다. 이 방식은 같은 버그가 재발하는 것을 방지하고, 점진적으로 테스트 커버리지를 높입니다. 동시에 새로 작성하는 코드에는 처음부터 테스트를 함께 작성하는 습관을 들이세요.

---

## 7. 다음 단계 예고

> **Step 37. E2E 테스트와 테스트 전략**
>
> - E2E 테스트의 역할 (Playwright/Cypress)
> - 핵심 사용자 흐름(Critical User Journey) 테스트
> - 컴포넌트 테스트 vs 통합 테스트 vs E2E 테스트의 균형
> - CI/CD에서의 테스트 자동화
> - 테스트 유지보수 전략

---

## 📚 참고 자료

- [Testing Library 공식 문서](https://testing-library.com/)
- [RTL — Queries](https://testing-library.com/docs/queries/about)
- [RTL — Which query should I use?](https://testing-library.com/docs/queries/about#priority)
- [userEvent 공식 문서](https://testing-library.com/docs/user-event/intro)
- [MSW 공식 문서](https://mswjs.io/)
- [Kent C. Dodds — Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Kent C. Dodds — The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Vitest 공식 문서](https://vitest.dev/)

---

> **React 완성 로드맵 v2.0** | Phase 6 — 테스트와 품질 보증 | Step 36 of 42
