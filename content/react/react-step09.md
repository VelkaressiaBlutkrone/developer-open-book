# Step 09. 조건부 렌더링과 리스트 패턴

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| **Remember**   | 조건부 렌더링의 6가지 패턴과 리스트 렌더링의 map 패턴을 나열할 수 있다                |
| **Understand** | 각 조건부 렌더링 패턴의 동작 원리와 React가 falsy 값을 처리하는 규칙을 설명할 수 있다 |
| **Apply**      | 상황에 맞는 조건부 렌더링 패턴을 선택하여 구현할 수 있다                              |
| **Apply**      | 리스트 데이터를 필터링, 정렬, 그룹화하여 렌더링할 수 있다                             |
| **Analyze**    | && 연산자의 함정(숫자 0)이 발생하는 조건을 분석하고 방지할 수 있다                    |
| **Evaluate**   | 로딩/에러/빈 상태/데이터 표시의 4가지 UI 상태를 체계적으로 설계할 수 있다             |

**전제 지식:**

- Step 2: 삼항 연산자, && / || / ?? 연산자, Truthy/Falsy, 배열 고차 함수
- Step 4: JSX 표현식 삽입 `{}`, Fragment
- Step 6: useState, 파생 데이터
- Step 7: key 전략

---

## 1. 서론 — UI는 "상태에 따라 다른 모습"이어야 한다

### 1.1 동적 UI 렌더링의 역사적 배경

웹 초기에는 서버가 페이지 전체를 생성하여 전송했으므로, 조건부 렌더링은 서버 측 템플릿 엔진(PHP의 `if`, JSP의 `<c:if>`, Django의 `{% if %}`)의 몫이었다. 클라이언트에서 동적 UI를 구현하려면 jQuery로 DOM을 직접 조작해야 했다. `$('#error-msg').show()`, `$('#loading').hide()` 같은 명령형 코드로 요소를 보이거나 숨겼으며, 리스트를 업데이트하려면 DOM을 일일이 생성하고 삽입해야 했다.

React의 선언적 모델은 이 접근을 근본적으로 바꾸었다. "이 조건이면 이 UI를 보여준다"라고 **선언**하면, React가 DOM 조작을 알아서 처리한다. 조건부 렌더링은 JavaScript의 `if`, 삼항 연산자, `&&` 같은 **표준 언어 기능**을 그대로 사용하며, 리스트 렌더링은 `Array.map()`을 활용한다. 별도의 템플릿 문법(`v-if`, `ngIf` 등)이 필요 없다는 것이 React의 "Just JavaScript" 철학이다.

이 설계 덕분에 React의 조건부 렌더링과 리스트 패턴은 JavaScript를 아는 개발자에게 직관적이다. 그러나 `&&` 연산자의 falsy 값 처리, `map()`에서의 key 설계, 4가지 UI 상태(로딩/에러/빈 상태/데이터) 패턴 등 **React 특유의 주의점**을 모르면 미묘한 버그가 발생한다.

### 1.2 산업적 가치 — 조건부 렌더링과 리스트가 실무의 대부분인 이유

실무 React 코드의 대부분은 "데이터를 리스트로 표시하고", "상태에 따라 다른 UI를 보여주는" 코드이다. 대시보드의 차트 목록, 이커머스의 상품 목록, SNS의 피드, 관리자 페이지의 사용자 목록 등 거의 모든 페이지가 리스트 렌더링을 포함한다. 로딩 스피너, 에러 메시지, 빈 상태 UI, 권한에 따른 버튼 표시/숨김 등 조건부 렌더링 역시 모든 페이지에 존재한다.

특히 **4가지 UI 상태 패턴**(로딩, 에러, 빈 상태, 데이터 표시)은 서버 데이터를 다루는 모든 화면에서 체계적으로 처리해야 한다. 이 패턴을 초기부터 습관화하면 "로딩 중에 빈 화면이 보인다", "에러 시 앱이 멈춘다" 같은 실무 문제를 예방할 수 있다.

### 1.3 이 Step의 핵심 개념 관계도

![step09 01 step 09 핵심 개념 관계도](/developer-open-book/diagrams/react-step09-01-step-09-핵심-개념-관계도.svg)

### 1.4 조건부 렌더링과 리스트가 중요한 이유

실제 애플리케이션의 UI는 **항상 같은 모습이 아니다.** 로그인 여부, 로딩 상태, 에러 발생 여부, 데이터 유무에 따라 다른 화면을 보여줘야 한다. 또한 대부분의 애플리케이션은 **배열 데이터를 반복적으로 표시**하는 리스트를 포함한다.

```
실제 앱에서 마주치는 상황들

  · 로그인 여부에 따라 다른 메뉴 표시
  · 데이터 로딩 중 스피너 표시
  · 에러 발생 시 에러 메시지 표시
  · 검색 결과가 없을 때 "결과 없음" 표시
  · 할 일 목록, 상품 목록, 댓글 목록 등 배열 렌더링
  · 조건에 따라 특정 필드 숨기기/보이기
  · 권한에 따라 버튼 활성화/비활성화
```

### 1.5 이 Step에서 다루는 범위

![step09 02 다루는 것](/developer-open-book/diagrams/react-step09-02-다루는-것.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                         | 정의                                                                                       | 왜 중요한가                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **조건부 렌더링**            | State/Props 값에 따라 **다른 React Element를 반환**하는 패턴                               | UI의 동적 표시를 결정하는 핵심 기법이다                       |
| **Short-circuit Evaluation** | 논리 연산자(`&&`, `\|\|`)가 첫 번째 결정적 피연산자에서 **평가를 멈추는** 것               | `&&`를 활용한 조건부 렌더링의 원리이다                        |
| **Falsy 값**                 | Boolean 문맥에서 false로 평가되는 값. `false`, `0`, `''`, `null`, `undefined`, `NaN`       | React가 각 falsy 값을 **다르게 처리**하므로 구분이 필수적이다 |
| **리스트 렌더링**            | 배열 데이터를 `map()`으로 변환하여 **여러 개의 React Element를 생성**하는 패턴             | 거의 모든 애플리케이션에서 사용하는 핵심 패턴이다             |
| **Empty State**              | 데이터가 없을 때 표시하는 UI. "결과 없음", "항목을 추가하세요" 등                          | UX 관점에서 빈 화면을 방치하면 안 된다                        |
| **Guard Clause**             | 함수 초반에 조건을 확인하여 **조기 반환(early return)** 하는 패턴                          | 중첩 조건을 줄여 가독성을 높인다                              |
| **Derived List**             | 원본 배열에서 filter, sort, map 등으로 **계산하여 얻은 새 배열**. State가 아닌 파생 데이터 | 원본 State를 변경하지 않고 다양한 뷰를 표시한다               |

### 2.2 핵심 용어 심층 해설

#### 조건부 렌더링 (Conditional Rendering)

조건부 렌더링은 State나 Props의 값에 따라 **다른 React Element를 반환**하는 패턴이다. React에서는 별도의 템플릿 지시어(directive)가 없으며, JavaScript의 표준 제어 구문(`if`, 삼항 연산자, `&&`, `||`, `??`)을 그대로 사용한다. 이것이 React의 "Just JavaScript" 철학이며, JavaScript에 능숙한 개발자가 React를 빠르게 익힐 수 있는 이유이다.

조건부 렌더링에서 가장 주의해야 할 점은 **`&&` 연산자와 falsy 값의 상호작용**이다. `{count && <List />}`에서 `count`가 `0`이면 React는 `0`을 화면에 표시한다. `false`, `null`, `undefined`는 렌더링되지 않지만 `0`과 `NaN`은 문자열로 변환되어 화면에 나타난다. 이 규칙을 모르면 화면에 의도치 않은 "0"이 표시되는 버그가 발생한다.

#### 리스트 렌더링과 Derived List

리스트 렌더링은 배열 데이터를 `Array.map()`으로 변환하여 여러 개의 React Element를 생성하는 패턴이다. `items.map(item => <Item key={item.id} {...item} />)` 형태가 기본이며, Step 7에서 학습한 **key**를 반드시 제공해야 한다.

실무에서는 원본 배열을 그대로 렌더링하는 경우보다 **필터링, 정렬, 그룹화**한 결과를 렌더링하는 경우가 훨씬 많다. 이때 원본 State 배열을 직접 변경(`.sort()`, `.splice()` 등)하면 안 되며, `filter()`, `toSorted()`, `map()` 등으로 **새 배열을 생성**하여 사용해야 한다. 이렇게 계산으로 얻은 배열을 **Derived List(파생 리스트)**라고 하며, 별도의 State로 저장하지 않는 것이 원칙이다(Single Source of Truth).

#### 4가지 UI 상태 패턴

서버 데이터를 표시하는 모든 화면은 **4가지 상태**를 처리해야 한다. 로딩 중(Loading), 에러 발생(Error), 데이터가 비어있음(Empty), 데이터 표시(Success). 이 4가지 상태를 체계적으로 처리하지 않으면, 로딩 중에 빈 화면이 보이거나, 에러 시 콘솔에만 로그가 남고 사용자에게는 아무 피드백이 없는 문제가 발생한다.

Guard Clause(조기 반환) 패턴으로 이 4가지 상태를 처리하면 코드가 깔끔해진다. 함수 상단에서 `if (isLoading) return <Spinner />;`, `if (error) return <ErrorMessage />;`, `if (data.length === 0) return <EmptyState />;`를 차례로 확인한 뒤, 나머지 코드에서 `data`가 존재함을 보장받는 구조이다.

### 2.3 React가 렌더링하는 값 / 하지 않는 값

![step09 03 react가 렌더링하지 않는 값 화면에 아무것도 표시 안 됨](/developer-open-book/diagrams/react-step09-03-react가-렌더링하지-않는-값-화면에-아무것도-표시-안-됨.svg)

---

## 3. 이론과 원리

### 3.1 조건부 렌더링 6가지 패턴

#### 패턴 1: if/else 조기 반환 (Guard Clause)

함수 초반에 특수 조건을 확인하여 **다른 UI를 즉시 반환**하는 패턴이다.

```jsx
function UserProfile({ user, isLoading, error }) {
  // Guard Clause — 특수 상태를 먼저 처리
  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>에러: {error.message}</p>;
  }

  if (!user) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  // 정상 케이스 — 가장 마지막에 위치
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

```
Guard Clause의 장점

  · 중첩된 if/else를 피할 수 있다
  · 특수 케이스(로딩, 에러, null)를 먼저 처리하고
    정상 케이스를 마지막에 깔끔하게 작성
  · 가독성이 높고 유지보수가 용이하다

  ❌ 중첩 방식 (가독성 저하):
  if (isLoading) {
    return ...;
  } else {
    if (error) {
      return ...;
    } else {
      if (!user) {
        return ...;
      } else {
        return ...;
      }
    }
  }
```

**적합한 상황:** 컴포넌트 전체가 다른 UI를 보여줘야 할 때. 로딩/에러/빈 상태 분기.

#### 패턴 2: 삼항 연산자 (Ternary Operator)

JSX 안에서 **두 가지 UI 중 하나를 선택**할 때 사용한다.

```jsx
function Greeting({ isLoggedIn, userName }) {
  return (
    <header>
      {isLoggedIn ? <p>환영합니다, {userName}님!</p> : <p>로그인해 주세요.</p>}
    </header>
  );
}

// 속성에도 사용 가능
function Button({ isPrimary, children }) {
  return (
    <button
      className={isPrimary ? "btn-primary" : "btn-secondary"}
      style={{ fontSize: isPrimary ? "16px" : "14px" }}
    >
      {children}
    </button>
  );
}
```

```
⚠️ 중첩 삼항은 피한다

  // ❌ 가독성 저하
  {status === 'loading' ? <Spinner />
    : status === 'error' ? <ErrorMessage />
    : status === 'empty' ? <EmptyState />
    : <DataView />
  }

  // ✅ Guard Clause 또는 함수 추출로 대체
  function renderContent(status) {
    if (status === 'loading') return <Spinner />;
    if (status === 'error') return <ErrorMessage />;
    if (status === 'empty') return <EmptyState />;
    return <DataView />;
  }

  return <div>{renderContent(status)}</div>;
```

**적합한 상황:** JSX 인라인에서 **A 또는 B** 둘 중 하나를 표시. 조건이 단순할 때.

#### 패턴 3: && (논리 AND) 연산자

조건이 참일 때만 **특정 UI를 표시**하고, 거짓이면 **아무것도 표시하지 않을 때** 사용한다.

```jsx
function Notifications({ count }) {
  return (
    <div>
      <h1>알림</h1>
      {count > 0 && <span className="badge">{count}</span>}
      {/* count > 0이 true면 <span> 렌더링, false면 아무것도 안 보임 */}
    </div>
  );
}

function AdminPanel({ user }) {
  return (
    <nav>
      <a href="/home">홈</a>
      <a href="/profile">프로필</a>
      {user.role === "admin" && <a href="/admin">관리자</a>}
    </nav>
  );
}
```

**적합한 상황:** "보이거나 / 안 보이거나"의 이진 선택. 조건이 거짓일 때 아무것도 표시하지 않을 때.

#### ⚠️ && 연산자의 함정 — 숫자 0 문제

이것은 React 초보자가 가장 많이 만나는 **조건부 렌더링 버그**이다.

```jsx
// ❌ 위험: count가 0이면 화면에 "0"이 표시된다!
function MessageCount({ count }) {
  return <div>{count && <p>{count}개의 새 메시지</p>}</div>;
}

// count = 5  → <p>5개의 새 메시지</p>  ✅
// count = 0  → 0                        ❌ 화면에 "0" 표시!
```

**왜 이런 일이 발생하는가:**

```
&& 연산자의 동작 규칙 (JavaScript)

  왼쪽이 truthy → 오른쪽을 반환
  왼쪽이 falsy  → 왼쪽을 반환 (오른쪽은 평가하지 않음)

  5 && <p>메시지</p>     → <p>메시지</p>  (5는 truthy)
  0 && <p>메시지</p>     → 0              (0은 falsy → 0을 반환)
  false && <p>메시지</p> → false          (false 반환)
  null && <p>메시지</p>  → null           (null 반환)

  React의 렌더링 규칙:
  · false, null, undefined → 아무것도 표시하지 않음
  · 0 → "0"을 화면에 표시함! ← 이것이 함정!
  · NaN → "NaN"을 화면에 표시함!
```

**해결법 3가지:**

```jsx
// 해결법 1: 명시적 비교로 boolean 반환 (가장 권장)
{
  count > 0 && <p>{count}개의 새 메시지</p>;
}
// count=0 → false && ... → false → 아무것도 안 보임 ✅

// 해결법 2: 이중 부정으로 boolean 변환
{
  !!count && <p>{count}개의 새 메시지</p>;
}
// !!0 = false → false && ... → false ✅

// 해결법 3: 삼항 연산자로 대체
{
  count ? <p>{count}개의 새 메시지</p> : null;
}
// count=0 → null → 아무것도 안 보임 ✅
```

```
&& 연산자 안전 사용 가이드

  ✅ 안전한 왼쪽 값 (항상 boolean):
    · isLoggedIn && ...
    · hasPermission && ...
    · items.length > 0 && ...
    · user !== null && ...
    · !!count && ...

  ⚠️ 위험한 왼쪽 값 (0이 될 수 있음):
    · count && ...          → 0일 때 "0" 표시
    · items.length && ...   → 빈 배열일 때 "0" 표시
    · score && ...          → 0점일 때 "0" 표시

  규칙: && 왼쪽에 "숫자가 올 수 있는 값"이 있다면
        반드시 > 0 비교 또는 !! 변환을 사용한다
```

#### 패턴 4: || (논리 OR) 연산자 / ?? (Nullish Coalescing)

**기본값(Fallback)** 을 제공할 때 사용한다.

```jsx
// || — falsy 값에 기본값 적용
function UserName({ name }) {
  return <p>{name || "익명 사용자"}</p>;
  // name이 '', null, undefined, 0 → '익명 사용자' 표시
}

// ?? — null/undefined에만 기본값 적용
function Score({ score }) {
  return <p>점수: {score ?? "미응시"}</p>;
  // score=0 → "0" 표시 (0은 유효한 점수!)
  // score=null → "미응시" 표시
}
```

```
|| vs ?? 선택 기준 (Step 2 복습)

  || : 모든 falsy 값(0, '', false 포함)에 기본값 적용
  ?? : null과 undefined에만 기본값 적용

  숫자 0이나 빈 문자열이 유효한 값이라면 ?? 를 사용한다
```

**적합한 상황:** 데이터가 없을 때 기본 텍스트/값을 표시. API 응답의 Optional 필드 처리.

#### 패턴 5: 변수에 Element 할당

조건 로직이 복잡할 때 **JSX 외부에서 변수에 할당**하고 JSX 안에서 참조한다.

```jsx
function StatusBadge({ status }) {
  let badge;
  let color;

  switch (status) {
    case "active":
      badge = "활성";
      color = "green";
      break;
    case "pending":
      badge = "대기";
      color = "yellow";
      break;
    case "inactive":
      badge = "비활성";
      color = "gray";
      break;
    case "banned":
      badge = "차단";
      color = "red";
      break;
    default:
      badge = "알 수 없음";
      color = "gray";
  }

  return <span style={{ color }}>{badge}</span>;
}
```

**적합한 상황:** 3개 이상의 분기. switch/case가 자연스러운 경우. 복잡한 조건 로직.

#### 패턴 6: 객체 매핑 (Lookup Pattern)

switch/case를 **객체로 대체**하는 패턴이다. 분기가 많을 때 깔끔하다.

```jsx
const STATUS_CONFIG = {
  active: { label: "활성", color: "green", icon: "✅" },
  pending: { label: "대기", color: "yellow", icon: "⏳" },
  inactive: { label: "비활성", color: "gray", icon: "⬜" },
  banned: { label: "차단", color: "red", icon: "🚫" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;

  return (
    <span style={{ color: config.color }}>
      {config.icon} {config.label}
    </span>
  );
}

// 컴포넌트 매핑에도 활용 가능
const STEP_COMPONENTS = {
  info: PersonalInfoStep,
  address: AddressStep,
  payment: PaymentStep,
  review: ReviewStep,
};

function MultiStepForm({ currentStep }) {
  const StepComponent = STEP_COMPONENTS[currentStep];
  return StepComponent ? <StepComponent /> : <p>알 수 없는 단계</p>;
}
```

**적합한 상황:** 분기가 4개 이상. 설정(config)을 데이터로 분리하고 싶을 때. 다단계 폼, 탭 전환.

#### 패턴 선택 가이드

![step09 04 상황 권장 패턴](/developer-open-book/diagrams/react-step09-04-상황-권장-패턴.svg)

### 3.2 리스트 렌더링의 원리

#### map 패턴 — 배열을 React Element 배열로 변환

```jsx
function FruitList() {
  const fruits = ["사과", "바나나", "체리", "딸기"];

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

**내부 동작:**

```
fruits.map(...)의 결과

  [
    { type: 'li', key: '사과',   props: { children: '사과' } },
    { type: 'li', key: '바나나', props: { children: '바나나' } },
    { type: 'li', key: '체리',   props: { children: '체리' } },
    { type: 'li', key: '딸기',   props: { children: '딸기' } },
  ]

  JSX에서 배열을 렌더링하면 React가 각 Element를 순서대로 표시한다
  이때 key가 각 Element를 식별하는 데 사용된다 (Step 7 복습)
```

#### 객체 배열의 리스트 렌더링

```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <strong>{user.name}</strong>
          <span> ({user.email})</span>
        </li>
      ))}
    </ul>
  );
}

// 컴포넌트로 분리
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}

function UserCard({ user }) {
  return (
    <li>
      <strong>{user.name}</strong>
      <span> ({user.email})</span>
    </li>
  );
}
```

#### key 규칙 복습 (Step 7)

```
✅ 올바른 key:
  · 데이터의 고유 ID: key={user.id}
  · 자연적으로 고유한 값: key={email.address}
  · 생성 시점에 할당된 UUID: key={item.uuid}

⚠️ 조건부 허용:
  · index: 정적 리스트 + State 없는 항목에서만

❌ 잘못된 key:
  · Math.random(): 매 렌더링마다 바뀜
  · Date.now(): 매 렌더링마다 바뀜 (생성 시점에 한 번만 할당하는 것은 OK)

key를 지정하는 위치:
  · map() 콜백의 최상위 Element에 지정
  · 컴포넌트로 분리했다면 컴포넌트에 지정

  // ✅ 올바름
  {items.map(item => <ItemCard key={item.id} item={item} />)}

  // ❌ 잘못됨 — ItemCard 내부의 <li>에 key를 붙이는 것은 무의미
  function ItemCard({ item }) {
    return <li key={item.id}>...</li>;  // 이 key는 무시됨!
  }
```

### 3.3 리스트의 필터링, 정렬, 그룹화

#### 필터링 — filter() + map() 체이닝

```jsx
function TodoList({ todos, filter }) {
  // 파생 데이터: 원본 todos를 변경하지 않고 새 배열 생성
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.done;
    if (filter === "completed") return todo.done;
    return true;
  });

  return (
    <div>
      <p>{filteredTodos.length}개 항목</p>
      <ul>
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
```

```
핵심 원칙: filter/sort는 State가 아닌 파생 데이터로 처리

  원본 State: todos = [전체 목록]
  파생 데이터: filteredTodos = todos.filter(...)
  파생 데이터: sortedTodos = [...filteredTodos].sort(...)

  → todos State를 직접 변경하지 않는다
  → filter 조건이 바뀌어도 원본은 그대로
  → "모두 보기"로 돌아갈 때 원본이 온전하다
```

#### 정렬 — 원본 보존 주의

```jsx
function SortableProductList({ products }) {
  const [sortBy, setSortBy] = useState("name");

  // ⚠️ .sort()는 원본을 변경하므로 반드시 복사 후 정렬
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">이름순</option>
        <option value="price">가격 낮은순</option>
        <option value="price-desc">가격 높은순</option>
      </select>
      <ul>
        {sortedProducts.map((p) => (
          <li key={p.id}>
            {p.name} — {p.price.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 그룹화 — reduce로 카테고리별 분류

```jsx
function GroupedProductList({ products }) {
  // 카테고리별 그룹화 (파생 데이터)
  const grouped = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2>{category}</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

#### 필터 + 정렬 + 검색의 결합

```jsx
function ProductCatalog() {
  const [products] = useState([
    {
      id: 1,
      name: "노트북",
      category: "electronics",
      price: 1200000,
      inStock: true,
    },
    { id: 2, name: "셔츠", category: "clothing", price: 45000, inStock: true },
    {
      id: 3,
      name: "키보드",
      category: "electronics",
      price: 85000,
      inStock: false,
    },
    { id: 4, name: "바지", category: "clothing", price: 55000, inStock: true },
    {
      id: 5,
      name: "모니터",
      category: "electronics",
      price: 350000,
      inStock: true,
    },
  ]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // 모든 변환은 파생 데이터 — State를 변경하지 않는다
  const displayProducts = products
    .filter((p) => category === "all" || p.category === category)
    .filter((p) => !showInStockOnly || p.inStock)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="검색..."
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">전체</option>
        <option value="electronics">전자제품</option>
        <option value="clothing">의류</option>
      </select>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">이름순</option>
        <option value="price-asc">가격 낮은순</option>
        <option value="price-desc">가격 높은순</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={showInStockOnly}
          onChange={(e) => setShowInStockOnly(e.target.checked)}
        />
        재고 있는 상품만
      </label>

      <p>{displayProducts.length}개 상품</p>

      {displayProducts.length === 0 ? (
        <p>조건에 맞는 상품이 없습니다.</p>
      ) : (
        <ul>
          {displayProducts.map((p) => (
            <li key={p.id}>
              {p.name} — {p.price.toLocaleString()}원
              {!p.inStock && <span> (품절)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

```
State 설계 분석

  State (사용자 입력에 의해 변하는 최소 데이터):
    · products: 원본 상품 목록
    · search: 검색어
    · category: 필터 카테고리
    · sortBy: 정렬 기준
    · showInStockOnly: 재고 필터

  파생 데이터 (State에서 계산):
    · displayProducts: filter + sort의 결과
    · displayProducts.length: 결과 개수

  → Step 6의 "최소 State" 원칙이 적용됨
  → filteredProducts, sortedProducts를 별도 State로 만들지 않는다
```

### 3.4 4가지 UI 상태 패턴: 로딩 / 에러 / 빈 상태 / 데이터

#### 체계적 UI 상태 설계

대부분의 데이터 표시 컴포넌트는 **4가지 상태**를 처리해야 한다.

![step09 05 데이터 표시 컴포넌트의 4가지 상태](/developer-open-book/diagrams/react-step09-05-데이터-표시-컴포넌트의-4가지-상태.svg)

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("idle");
  // 'idle' | 'loading' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState("");

  const loadUsers = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("서버 오류");
      const data = await response.json();
      setUsers(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  // Guard Clause로 4가지 상태 처리
  if (status === "idle") {
    return <button onClick={loadUsers}>사용자 목록 로드</button>;
  }

  if (status === "loading") {
    return <p>로딩 중...</p>;
  }

  if (status === "error") {
    return (
      <div>
        <p>에러: {errorMessage}</p>
        <button onClick={loadUsers}>다시 시도</button>
      </div>
    );
  }

  // status === 'success'
  if (users.length === 0) {
    return <p>등록된 사용자가 없습니다.</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  );
}
```

```
Guard Clause 순서의 원칙

  1. idle → 초기 상태 (액션 유도)
  2. loading → 로딩 UI
  3. error → 에러 UI (재시도 가능)
  4. empty → 빈 상태 UI (안내 메시지)
  5. data → 정상 데이터 표시 (마지막)

  → 특수 케이스를 먼저 제거하고, 정상 케이스를 마지막에 작성
  → "정상 흐름"을 읽기 위해 스크롤할 필요가 최소화됨
```

### 3.5 중첩 리스트와 트리 구조

#### 2단계 중첩 리스트

```jsx
function CourseList({ departments }) {
  return (
    <div>
      {departments.map((dept) => (
        <section key={dept.id}>
          <h2>{dept.name}</h2>
          <ul>
            {dept.courses.map((course) => (
              <li key={course.id}>
                {course.title} ({course.credits}학점)
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// 데이터 구조
const departments = [
  {
    id: 1,
    name: "컴퓨터공학",
    courses: [
      { id: 101, title: "자료구조", credits: 3 },
      { id: 102, title: "알고리즘", credits: 3 },
    ],
  },
  {
    id: 2,
    name: "경영학",
    courses: [
      { id: 201, title: "마케팅 원론", credits: 3 },
      { id: 202, title: "재무관리", credits: 3 },
    ],
  },
];
```

#### 재귀적 트리 구조

```jsx
// 파일 탐색기 같은 재귀적 트리
function FileTree({ items, depth = 0 }) {
  return (
    <ul style={{ paddingLeft: depth * 20 }}>
      {items.map((item) => (
        <li key={item.id}>
          {item.type === "folder" ? "📁" : "📄"} {item.name}
          {item.children && item.children.length > 0 && (
            <FileTree items={item.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// 데이터 구조
const fileSystem = [
  {
    id: 1,
    name: "src",
    type: "folder",
    children: [
      { id: 2, name: "App.jsx", type: "file", children: [] },
      {
        id: 3,
        name: "components",
        type: "folder",
        children: [
          { id: 4, name: "Header.jsx", type: "file", children: [] },
          { id: 5, name: "Footer.jsx", type: "file", children: [] },
        ],
      },
    ],
  },
  { id: 6, name: "package.json", type: "file", children: [] },
];
```

### 3.6 CSS 기반 조건부 표시와의 비교

```
조건부 렌더링 (React) vs CSS 숨기기

  React 조건부 렌더링:
    {isVisible && <HeavyComponent />}
    · isVisible=false → 컴포넌트가 DOM에서 완전히 제거됨
    · 언마운트 → State 파괴
    · DOM 노드가 존재하지 않음
    · isVisible=true로 변경 → 새로 마운트 (비용 발생)

  CSS 숨기기:
    <HeavyComponent style={{ display: isVisible ? 'block' : 'none' }} />
    · isVisible=false → 컴포넌트는 DOM에 존재하지만 보이지 않음
    · State 보존됨
    · DOM 노드가 존재함 (메모리 차지)
    · isVisible=true → 즉시 표시 (마운트 비용 없음)

  선택 기준:
    · 자주 토글되고 State를 유지해야 한다 → CSS 숨기기
    · 조건이 드물게 바뀌거나 메모리를 절약해야 한다 → 조건부 렌더링
    · 탭 전환 시 내용 유지가 필요하다 → CSS 숨기기 또는 Lifting State Up
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 검색 결과 페이지의 4가지 상태

```jsx
function SearchResults({ query, results, status, error }) {
  // 상태별 UI를 체계적으로 분리
  if (!query) {
    return (
      <div className="search-guide">
        <p>검색어를 입력하세요</p>
        <p>예: "React", "JavaScript", "TypeScript"</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="search-loading">
        <div className="spinner" />
        <p>"{query}" 검색 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="search-error">
        <p>검색 중 오류가 발생했습니다: {error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-empty">
        <p>"{query}"에 대한 검색 결과가 없습니다.</p>
        <p>다른 키워드로 검색해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <p>{results.length}개의 결과</p>
      <ul>
        {results.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.2 사례: 권한 기반 조건부 UI

```jsx
const PERMISSION_CONFIG = {
  viewer: { canEdit: false, canDelete: false, canAdmin: false },
  editor: { canEdit: true, canDelete: false, canAdmin: false },
  admin: { canEdit: true, canDelete: true, canAdmin: true },
};

function DocumentActions({ role, document, onEdit, onDelete }) {
  const permissions = PERMISSION_CONFIG[role] ?? PERMISSION_CONFIG.viewer;

  return (
    <div className="actions">
      <button>보기</button>

      {permissions.canEdit && (
        <button onClick={() => onEdit(document.id)}>편집</button>
      )}

      {permissions.canDelete && (
        <button onClick={() => onDelete(document.id)} className="danger">
          삭제
        </button>
      )}

      {permissions.canAdmin && (
        <button onClick={() => window.open("/admin")}>관리</button>
      )}
    </div>
  );
}
```

### 4.3 사례: 빈 상태(Empty State) UX 설계

```
빈 상태의 5가지 유형과 메시지 가이드

  1. 처음 사용 (First-time Empty)
     "아직 할 일이 없습니다. 첫 번째 할 일을 추가해 보세요!"
     → CTA(Call to Action) 버튼 포함

  2. 검색 결과 없음 (No Results)
     "'React 튜토리얼'에 대한 결과가 없습니다."
     → 다른 검색어 제안 또는 필터 초기화 버튼

  3. 필터 결과 없음 (Filtered Empty)
     "선택한 조건에 맞는 상품이 없습니다."
     → 필터 초기화 버튼

  4. 권한 없음 (No Permission)
     "이 콘텐츠를 볼 권한이 없습니다."
     → 권한 요청 안내

  5. 에러로 인한 빈 상태 (Error Empty)
     "데이터를 불러오지 못했습니다."
     → 재시도 버튼

  공통 원칙:
  · 빈 화면을 절대 방치하지 않는다
  · 사용자가 "다음에 무엇을 해야 하는지" 안내한다
  · 가능하면 행동을 유도하는 버튼을 포함한다
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 조건부 렌더링 패턴, 리스트 필터링/정렬, 4가지 UI 상태 처리를 직접 실습할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: 조건부 렌더링 패턴 실전 적용 [Applying]

**목표:** 6가지 패턴을 상황에 맞게 선택하여 적용한다.

**사용자 대시보드**를 만든다:

```
요구사항:
  · 로딩 상태일 때 "로딩 중..." 표시 (Guard Clause)
  · 에러 상태일 때 에러 메시지 + 재시도 버튼 (Guard Clause)
  · 로그인 여부에 따라 다른 헤더 표시 (삼항 연산자)
  · 관리자일 때만 관리 메뉴 표시 (&& 연산자)
  · 알림 수가 0보다 클 때만 배지 표시 (&& 연산자 — 0 함정 주의!)
  · 사용자 상태(active/inactive/banned)에 따른 뱃지 (객체 매핑)
  · 프로필 이미지가 없을 때 기본 이미지 (?? 연산자)
```

---

### 실습 2: 필터/정렬/검색 통합 리스트 [Applying · Analyzing]

**목표:** 리스트 데이터를 다양한 조건으로 가공하여 렌더링한다.

**영화 목록** 앱을 만든다:

```
데이터:
  const movies = [
    { id: 1, title: '기생충', genre: 'drama', rating: 8.6, year: 2019 },
    { id: 2, title: '올드보이', genre: 'thriller', rating: 8.4, year: 2003 },
    { id: 3, title: '부산행', genre: 'action', rating: 7.6, year: 2016 },
    { id: 4, title: '살인의 추억', genre: 'thriller', rating: 8.1, year: 2003 },
    { id: 5, title: '아가씨', genre: 'drama', rating: 8.1, year: 2016 },
    { id: 6, title: '괴물', genre: 'action', rating: 7.0, year: 2006 },
  ];

요구사항:
  · 제목 검색 (Controlled input)
  · 장르 필터 (select: 전체, drama, thriller, action)
  · 정렬 (select: 이름순, 평점 높은순, 평점 낮은순, 최신순)
  · 평점 7.5 이상만 보기 (checkbox)
  · 조건에 맞는 영화 수 표시
  · 결과 없을 때 Empty State 표시
  · 모든 필터/정렬은 파생 데이터로 처리 (State로 만들지 않기)

분석할 것:
  · 어떤 값이 State이고 어떤 값이 파생 데이터인가?
  · filter 체이닝의 순서가 결과에 영향을 주는가?
```

---

### 실습 3: && 함정 찾기와 수정 [Analyzing]

**목표:** && 연산자의 위험한 사용을 식별하고 수정한다.

아래 코드에서 **숫자 0 또는 빈 문자열로 인해 버그가 발생하는 부분**을 모두 찾고 수정하라.

```jsx
function Dashboard({ user }) {
  const notifications = user.notifications; // 숫자 (0일 수 있음)
  const unread = user.unreadMessages; // 숫자 (0일 수 있음)
  const bio = user.bio; // 문자열 (''일 수 있음)
  const score = user.score; // 숫자 (0일 수 있음)
  const friends = user.friends; // 배열 ([]일 수 있음)

  return (
    <div>
      <h1>{user.name}의 대시보드</h1>

      {notifications && <span className="badge">{notifications}</span>}

      {unread && <p>{unread}개의 읽지 않은 메시지</p>}

      {bio && <p className="bio">{bio}</p>}

      {score && <p>점수: {score}점</p>}

      {friends.length && (
        <ul>
          {friends.map((f) => (
            <li key={f.id}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**각 항목에 대해:**

- 0 또는 빈 문자열일 때 어떤 버그가 발생하는가?
- 어떻게 수정해야 하는가?
- `||`, `??`, `> 0`, `!!` 중 어떤 방법이 가장 적합한가?

---

### 실습 4 (선택): 재귀적 트리 컴포넌트 [Applying · Creating]

**목표:** 재귀 컴포넌트로 동적 트리 구조를 렌더링한다.

**댓글 + 대댓글 시스템**을 만든다:

```
데이터 구조:
  const comments = [
    {
      id: 1, author: '홍길동', text: '좋은 글이네요!',
      replies: [
        {
          id: 2, author: '김철수', text: '동감합니다.',
          replies: [
            { id: 5, author: '홍길동', text: '감사합니다!', replies: [] }
          ]
        },
        { id: 3, author: '박영희', text: '유익했어요.', replies: [] }
      ]
    },
    { id: 4, author: '이수진', text: '다음 글도 기대합니다.', replies: [] }
  ];

요구사항:
  · 댓글과 대댓글이 재귀적으로 렌더링됨
  · 깊이(depth)에 따라 들여쓰기 적용
  · 각 댓글에 작성자, 내용 표시
  · "답글 접기/펼치기" 토글 기능 (State 활용)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

![step09 06 step 9 핵심 요약](/developer-open-book/diagrams/react-step09-06-step-9-핵심-요약.svg)

### 6.2 자가진단 퀴즈

| #   | 질문                                                                                     | 블룸 단계  | 확인할 섹션 |
| --- | ---------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | 조건부 렌더링 6가지 패턴을 나열하고 각각의 적합한 상황을 말하라                          | Remember   | 3.1         |
| 2   | `{0 && <Component />}`가 화면에 "0"을 표시하는 이유를 && 연산자의 동작 규칙으로 설명하라 | Understand | 3.1         |
| 3   | React가 렌더링하지 않는 falsy 값과 렌더링하는 falsy 값을 구분하라                        | Remember   | 2.2         |
| 4   | Guard Clause 패턴에서 상태 확인 순서를 제안하고 그 이유를 설명하라                       | Understand | 3.4         |
| 5   | `products.sort(...)`를 파생 데이터 계산에 직접 사용하면 안 되는 이유는?                  | Apply      | 3.3         |
| 6   | `{items.length && <List />}`에서 items가 빈 배열일 때 발생하는 문제와 해결법은?          | Analyze    | 3.1         |
| 7   | CSS `display: none`과 `{isVisible && <Component />}`의 차이를 3가지 관점에서 비교하라    | Evaluate   | 3.6         |
| 8   | Empty State에 "행동 유도 메시지"가 필요한 UX적 이유는?                                   | Evaluate   | 4.3         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. 조건부 렌더링에서 if/else와 삼항 연산자 중 어떤 것을 써야 하나?**

두 가지 이상의 독립적인 조건(로딩, 에러 등)을 확인할 때는 **if/else + 조기 반환(Guard Clause)** 이 가독성이 좋다. JSX 내부에서 인라인으로 조건을 표현할 때는 **삼항 연산자**가 적합하다. 삼항이 중첩되면 가독성이 떨어지므로, 2단계 이상 중첩이 필요하면 별도 변수나 함수로 추출하는 것을 권장한다.

**Q2. `{count && <Component />}`에서 count가 0일 때 왜 "0"이 표시되나?**

JavaScript의 `&&` 연산자는 왼쪽 피연산자가 falsy면 **왼쪽 값 자체를 반환**한다. `0 && <Component />`는 `0`을 반환한다. React는 `false`, `null`, `undefined`는 렌더링하지 않지만, **`0`은 유효한 렌더링 값**으로 취급하여 화면에 "0"을 표시한다. 해결법은 `{count > 0 && <Component />}` 또는 `{Boolean(count) && <Component />}`를 사용하는 것이다.

**Q3. 리스트에서 filter().map()을 매 렌더링마다 호출하면 성능 문제가 없나?**

대부분의 경우 성능 문제가 없다. JavaScript 배열 메서드는 수백~수천 개의 항목에 대해 밀리초 단위로 실행된다. 배열이 수만 개 이상이거나 필터/정렬 로직이 복잡한 경우에만 `useMemo`(Step 14)로 캐싱을 고려한다. 성능 최적화는 측정 후에 필요한 곳에만 적용하는 것이 원칙이다.

**Q4. CSS display:none과 조건부 렌더링 중 어떤 것을 써야 하나?**

대부분의 경우 **조건부 렌더링**(`{show && <Component />}`)이 적합하다. 렌더링하지 않으면 메모리를 사용하지 않고, useEffect 등의 부수 효과도 실행되지 않는다. `display: none`은 DOM에 요소가 남아있으므로 메모리를 차지하고 부수 효과도 계속 실행된다. 다만 전환이 매우 빈번하고 마운트 비용이 큰 컴포넌트(복잡한 차트, 지도 등)는 `display: none`으로 숨기는 것이 더 효율적일 수 있다.

**Q5. Empty State에 왜 "행동 유도 메시지"를 넣어야 하나?**

빈 화면에 "데이터가 없습니다"만 표시하면 사용자는 다음 행동을 알 수 없다. "첫 번째 할 일을 추가해보세요" + 추가 버튼처럼 **다음 행동을 안내하는 메시지와 CTA(Call to Action)** 를 포함해야 사용자가 서비스를 계속 사용할 수 있다. 잘 설계된 Empty State는 온보딩 효과도 있어 신규 사용자의 이탈을 방지한다.

---

## 7. 다음 단계 예고

> **Step 10. React 내부 구조 심층 분석** (Phase 1 마무리)
>
> - Fiber Architecture의 설계 목적과 구조
> - Render Phase vs Commit Phase의 세부 동작
> - Concurrent Rendering의 개념과 의미
> - React 19의 자동 최적화 (React Compiler 개요)
> - Time Slicing과 우선순위 스케줄링
>
> Phase 1의 마지막 Step으로, React의 내부 엔진을 이론적으로 탐구한다.

---

## 📚 참고 자료

- [React 공식 문서 — Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [React 공식 문서 — Rendering Lists](https://react.dev/learn/rendering-a-list)
- [React 공식 문서 — Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [React 공식 문서 — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN — Logical AND (&&)](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Logical_AND)
- [MDN — Nullish Coalescing (??)](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 9 of 42
