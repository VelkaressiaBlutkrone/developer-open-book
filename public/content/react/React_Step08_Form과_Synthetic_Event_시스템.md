# Step 08. Form과 Synthetic Event 시스템

> **Phase 1 — React Core Mechanics (Step 4~10)**
> "왜 이렇게 동작하는가"를 이해하는 단계

> **난이도:** 🟡 중급 (Intermediate)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Remember**   | Controlled Component, Uncontrolled Component, Synthetic Event의 정의를 기술할 수 있다         |
| **Understand** | React의 이벤트 시스템이 브라우저 네이티브 이벤트와 다른 점을 설명할 수 있다                   |
| **Understand** | Controlled 패턴에서 "State가 단일 진실 공급원"이 되는 원리를 설명할 수 있다                   |
| **Apply**      | 다양한 폼 요소(input, select, textarea, checkbox, radio)를 Controlled 방식으로 구현할 수 있다 |
| **Analyze**    | Controlled와 Uncontrolled 방식의 장단점을 비교하여 상황별 적합한 방식을 분석할 수 있다        |
| **Evaluate**   | 폼 설계 시 State 배치, 검증 시점, 제출 처리 전략의 적합성을 판단할 수 있다                    |

**전제 지식:**

- Step 2: 화살표 함수, Destructuring, Spread
- Step 4: JSX 속성(className, onClick 등), 표현식 삽입
- Step 5: Props, 콜백 Props 패턴, 단방향 데이터 흐름
- Step 6: useState, 스냅샷 모델, Immutable 업데이트

---

## 1. 서론 — 폼은 왜 React에서 특별한가

### 1.1 웹 폼 처리의 역사적 변화

웹 폼(Form)은 HTML 초기부터 존재한 가장 오래된 사용자 인터랙션 메커니즘이다. 1990년대 웹 폼은 서버에 데이터를 전송하고 새 페이지를 받는 단순한 구조였다. `<form action="/submit" method="POST">`로 폼을 감싸고, 제출 시 전체 페이지가 리로드되었다. 이 방식은 서버가 폼 데이터의 검증과 처리를 모두 담당했다.

AJAX(2005~)의 등장으로 페이지 리로드 없이 폼 데이터를 전송할 수 있게 되었고, jQuery 시대에는 클라이언트 측 검증과 동적 폼 조작이 일반화되었다. 그러나 jQuery 방식의 폼 처리는 **DOM이 데이터의 원본(Source of Truth)**이었다. 입력값은 DOM의 `value` 속성에 저장되었고, 검증 로직은 DOM에서 값을 읽어 처리했다. 이 방식은 폼이 복잡해질수록 "DOM 상태"와 "JavaScript 상태"의 동기화 문제를 일으켰다.

React는 이 패러다임을 근본적으로 전환했다. **JavaScript State가 데이터의 원본**이 되고, DOM은 그 State를 반영하는 출력에 불과하다. 이것이 Controlled Component 패턴이며, "단일 진실 공급원(Single Source of Truth)" 원칙의 폼에 대한 적용이다. 이 접근법은 실시간 검증, 조건부 필드, 입력값 변환 등 복잡한 폼 로직을 예측 가능하게 만든다.

### 1.2 산업적 가치 — 폼과 이벤트 처리가 실무의 핵심인 이유

웹 애플리케이션의 핵심 가치는 대부분 **사용자 입력을 받아 처리하는 것**에 있다. 로그인, 회원가입, 결제, 검색, 설정 변경, 데이터 입력 등 사용자와의 모든 상호작용이 폼을 통해 이루어진다. React 실무 프로젝트에서 전체 코드의 상당 부분이 폼 관련 로직이며, 폼 처리의 품질이 사용자 경험(UX)과 데이터 무결성에 직접적인 영향을 준다.

Synthetic Event 시스템의 이해는 React의 이벤트 버블링, 이벤트 위임, 크로스 브라우저 호환성 같은 실무 문제를 해결하는 기반이다. 모달 오버레이 클릭 처리, 드롭다운 외부 클릭 감지, 폼 중복 제출 방지 등 실무에서 빈번히 마주치는 패턴이 모두 이 Step의 내용에 기반한다.

### 1.3 이 Step의 핵심 개념 관계도

```
┌──────────────────────────────────────────────────────────────┐
│              Step 08 핵심 개념 관계도                           │
│                                                               │
│  폼 요소 (input, select, textarea, checkbox, radio)          │
│       │                                                       │
│       ├── Controlled: React State가 값을 제어                 │
│       │     · value={state} + onChange={handler}              │
│       │     · State = 단일 진실 공급원                        │
│       │     · 실시간 검증, 입력 변환 가능                     │
│       │                                                       │
│       └── Uncontrolled: DOM이 값을 관리                       │
│             · defaultValue + useRef                           │
│             · 제출 시점에 ref.current.value로 읽기             │
│             · 파일 입력 등 특수한 경우에 사용                  │
│                                                               │
│  React Synthetic Event                                       │
│    · 브라우저 네이티브 이벤트를 래핑한 크로스 브라우저 객체    │
│    · Event Delegation: root에 한 번만 등록                    │
│    · Event Pooling 제거됨 (React 17+)                        │
│                                                               │
│  폼 제출: e.preventDefault() + 비동기 처리                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 HTML 폼과 React의 철학적 충돌

HTML 폼 요소(`<input>`, `<select>`, `<textarea>`)는 **자체적으로 내부 상태를 유지**한다. 사용자가 텍스트를 입력하면 브라우저가 해당 input의 값을 자동으로 관리한다. 이것은 React의 핵심 원칙인 **"UI = f(state)"** 와 충돌한다.

```
HTML의 동작 방식 (명령적):
  · 사용자가 input에 'hello' 입력
  · 브라우저가 input.value = 'hello'로 자동 관리
  · JavaScript에서 input.value로 읽기
  → input이 자체적으로 상태를 소유한다

React의 철학 (선언적):
  · State가 진실의 단일 출처 (Single Source of Truth)
  · UI는 State의 함수여야 한다
  · State에 없는 값이 화면에 표시되면 안 된다
  → React가 모든 상태를 제어해야 한다
```

이 충돌을 해결하는 두 가지 전략이 **Controlled Component**와 **Uncontrolled Component**이다.

### 1.5 이 Step을 학습하면 답할 수 있는 질문들

```
· Controlled Component와 Uncontrolled Component의 차이는?
· React의 onChange는 HTML의 onchange와 왜 다른가?
· React는 이벤트를 어떤 방식으로 처리하는가? (Event Delegation)
· SyntheticEvent는 무엇이고 왜 존재하는가?
· checkbox, radio, select를 React에서 어떻게 다루는가?
· 폼 제출(submit) 시 페이지 새로고침을 방지하는 방법은?
· 여러 input을 하나의 State로 관리하는 방법은?
· React 19의 form Action은 무엇인가?
```

### 1.6 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · Controlled vs Uncontrolled 패턴의 원리와 비교         │
│  · React Synthetic Event 시스템의 구조                   │
│  · Event Delegation과 이벤트 전파                        │
│  · 폼 요소별 처리 패턴 (input, select, textarea 등)     │
│  · 다중 input 관리 전략                                  │
│  · 폼 제출과 기본 동작 방지                              │
│  · React 19의 form Action 개요                          │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · React Hook Form (Step 33)                            │
│  · Zod 스키마 검증 (Step 32)                             │
│  · 서버 사이드 검증 통합 (Step 33)                       │
│  · 다단계 폼, 비동기 폼 (Step 33)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                       | 정의                                                                             | 왜 중요한가                                            |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Controlled Component**   | **React State가 폼 요소의 값을 제어**하는 컴포넌트. value와 onChange를 함께 사용 | React의 "단일 진실 공급원" 원칙을 폼에 적용한 패턴이다 |
| **Uncontrolled Component** | **DOM이 폼 요소의 값을 자체 관리**하는 컴포넌트. ref로 값을 읽어온다             | 간단한 폼이나 서드파티 라이브러리 통합 시 유용하다     |
| **Synthetic Event**        | React가 브라우저 네이티브 이벤트를 **감싸서 만든 크로스 브라우저 이벤트 객체**   | 모든 브라우저에서 동일한 API를 보장한다                |
| **Event Delegation**       | 개별 DOM 노드가 아닌 **상위 노드(root)에 이벤트 핸들러를 등록**하는 기법         | React의 이벤트 시스템의 핵심 메커니즘이다              |
| **Event Propagation**      | 이벤트가 DOM 트리를 따라 전파되는 과정. **Capture → Target → Bubble** 순서       | stopPropagation, event delegation 이해의 기반이다      |
| **preventDefault**         | 이벤트의 **기본 브라우저 동작을 취소**하는 메서드. 폼 제출 시 페이지 리로드 방지 | React 폼에서 거의 항상 사용된다                        |
| **Single Source of Truth** | 데이터의 **진실이 오직 한 곳**에만 존재하는 원칙                                 | Controlled Component에서 State가 유일한 진실이다       |
| **defaultValue**           | Uncontrolled 컴포넌트에서 **초기값만 설정**하는 속성. 이후 DOM이 값을 관리       | value와 혼동하면 경고가 발생한다                       |
| **form Action**            | React 19에서 도입된 **`<form action={함수}>` 패턴**. 폼 제출을 서버 액션과 연결  | React의 최신 폼 처리 방향이다                          |

### 2.2 핵심 용어 심층 해설

#### Controlled Component (제어 컴포넌트)

Controlled Component는 **React State가 폼 요소의 값을 제어**하는 패턴이다. `<input value={state} onChange={handler} />`처럼 `value` 속성에 State를 바인딩하고, `onChange`에서 State를 업데이트한다. 이 패턴에서 React State가 **단일 진실 공급원(Single Source of Truth)** 이 되며, DOM의 값은 항상 State의 반영이다.

Controlled 패턴의 핵심 이점은 **입력값에 대한 완전한 제어권**이다. 사용자가 입력하는 매 키 입력을 가로채어 검증, 변환, 필터링할 수 있다. 예를 들어 "숫자만 허용", "최대 글자 수 제한", "입력값 실시간 포맷팅(전화번호, 카드번호)" 같은 기능을 자연스럽게 구현할 수 있다. 단점은 모든 폼 요소에 State와 핸들러를 일일이 연결해야 하므로 보일러플레이트가 늘어나는 것이며, 이를 해결하기 위해 React Hook Form 같은 라이브러리가 존재한다(Step 32).

#### Uncontrolled Component (비제어 컴포넌트)

Uncontrolled Component는 **DOM이 폼 값을 직접 관리**하는 패턴이다. React State로 값을 제어하지 않고, 필요한 시점(예: 폼 제출)에 `ref`를 통해 DOM에서 값을 읽는다. `<input defaultValue="초기값" ref={inputRef} />`처럼 `defaultValue`로 초기값을 설정하고, `inputRef.current.value`로 현재 값을 가져온다.

Uncontrolled 패턴은 간단한 폼이나 React 외부의 폼 라이브러리를 통합할 때 유용하다. 또한 `<input type="file" />`은 값을 프로그래밍적으로 설정할 수 없으므로 반드시 Uncontrolled로 처리해야 한다. 그러나 입력 중 실시간 검증이나 값 변환이 필요한 경우에는 Controlled 패턴이 필수적이다.

#### Synthetic Event (합성 이벤트)

Synthetic Event는 React가 브라우저의 네이티브 이벤트를 **래핑(Wrapping)** 한 크로스 브라우저 이벤트 객체이다. 모든 브라우저에서 동일한 API를 제공하므로, 개발자는 브라우저별 이벤트 차이를 신경 쓸 필요 없이 일관된 코드를 작성할 수 있다.

Synthetic Event에서 주의할 점은 React의 `onChange`가 HTML의 `onchange`와 발동 시점이 다르다는 것이다. HTML의 `onchange`는 입력 필드에서 포커스가 벗어날 때 발동하지만, React의 `onChange`는 **매 입력(키 입력)마다** 발동한다. 이는 HTML의 `oninput` 이벤트에 더 가깝다. React가 이렇게 설계한 이유는 Controlled Component 패턴에서 매 입력을 State에 반영하기 위해서이다.

### 2.3 Controlled vs Uncontrolled 개념 비교

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  Controlled Component                                        │
│  ─────────────────────                                       │
│                                                               │
│    React State ──value──→ <input>                            │
│         ↑                     │                              │
│         └──── onChange ───────┘                               │
│                                                               │
│    · State가 input의 값을 "제어"한다                          │
│    · input은 State에 종속된다                                 │
│    · "React가 주인, input이 하인"                             │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Uncontrolled Component                                      │
│  ───────────────────────                                     │
│                                                               │
│    <input> ──── 자체 관리 (DOM 내부 상태)                     │
│       ↑                                                      │
│    ref로 필요할 때 값을 읽어옴                                │
│                                                               │
│    · DOM이 input의 값을 자체 관리한다                         │
│    · React는 값을 제어하지 않는다                             │
│    · "input이 자유, React는 관찰자"                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 Controlled Component — React가 폼 값을 제어한다

#### 핵심 메커니즘

Controlled Component는 **React State를 input의 유일한 진실 공급원**으로 만드는 패턴이다.

```jsx
function ControlledInput() {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
  //            ↑ State → input    ↑ input → State
}
```

**데이터 흐름 (한 글자 입력 시):**

```
1. 사용자가 키보드에서 'h'를 누른다

2. 브라우저가 input에 이벤트를 발생시킨다

3. React의 onChange 핸들러가 실행된다
   handleChange(e) → setValue('h')

4. State 변경 → 재렌더링 트리거

5. 컴포넌트 함수가 다시 호출된다
   value = 'h' (새 스냅샷)

6. <input value="h" /> → React가 input의 value를 'h'로 설정

7. 화면에 'h'가 표시된다

핵심: 사용자 입력이 "직접" 화면에 반영되는 것이 아니다
      State를 "거쳐서" 반영된다
      State가 변하지 않으면 input 값도 변하지 않는다!
```

#### value 없이 onChange만 있으면?

```jsx
// ⚠️ value 없이 onChange만 — Uncontrolled처럼 동작
<input onChange={handleChange} />
// React가 값을 제어하지 않음, DOM이 자체 관리

// ⚠️ value만 있고 onChange 없으면 — 읽기 전용
<input value="고정값" />
// 사용자가 타이핑해도 값이 변하지 않음!
// React 콘솔에 경고 메시지 출력

// ✅ value + onChange = Controlled
<input value={value} onChange={handleChange} />
// React가 값을 완전히 제어
```

#### Controlled 패턴의 장점

```
1. 즉각적인 입력 검증
   → 입력할 때마다 State가 변하므로 즉시 검증 가능
   → "이메일 형식이 올바르지 않습니다" 실시간 표시

2. 입력 필터링/포맷팅
   → 숫자만 입력, 전화번호 자동 하이픈, 대문자 변환 등
   → State에 저장하기 전에 값을 가공할 수 있다

3. 조건부 UI
   → State 값에 따라 다른 UI를 즉시 표시
   → "비밀번호 강도: 강함" 같은 실시간 피드백

4. 여러 input 동기화
   → 하나의 State로 여러 입력을 연동
   → 온도 변환기 같은 양방향 계산 (Step 5 사례)

5. 폼 전체의 유효성을 State에서 파생
   → 모든 필드의 값이 State에 있으므로
   → isFormValid = name && email && password 같은 파생 계산이 가능
```

#### 다양한 폼 요소의 Controlled 패턴

**텍스트 input:**

```jsx
function TextInput() {
  const [name, setName] = useState("");

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="이름 입력"
    />
  );
}
```

**textarea:**

```jsx
// HTML에서 textarea는 자식 텍스트로 값을 설정: <textarea>내용</textarea>
// React에서는 input과 동일하게 value 속성을 사용한다

function TextArea() {
  const [bio, setBio] = useState("");

  return (
    <textarea
      value={bio} // ← value 속성 사용
      onChange={(e) => setBio(e.target.value)}
      rows={4}
    />
  );
}
```

**select (드롭다운):**

```jsx
// HTML에서는 <option selected>로 선택, React에서는 select의 value로 제어

function SelectInput() {
  const [fruit, setFruit] = useState("banana");

  return (
    <select value={fruit} onChange={(e) => setFruit(e.target.value)}>
      <option value="apple">사과</option>
      <option value="banana">바나나</option>
      <option value="cherry">체리</option>
    </select>
  );
}

// 다중 선택
function MultiSelect() {
  const [selected, setSelected] = useState([]);

  const handleChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelected(options);
  };

  return (
    <select multiple value={selected} onChange={handleChange}>
      <option value="react">React</option>
      <option value="vue">Vue</option>
      <option value="angular">Angular</option>
    </select>
  );
}
```

**checkbox:**

```jsx
// checkbox는 value가 아닌 checked를 제어한다

function Checkbox() {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <label>
      <input
        type="checkbox"
        checked={isAgreed} // ← checked 속성
        onChange={(e) => setIsAgreed(e.target.checked)} // ← checked 읽기
      />
      이용약관에 동의합니다
    </label>
  );
}

// 여러 개의 체크박스
function MultiCheckbox() {
  const [interests, setInterests] = useState({
    sports: false,
    music: false,
    coding: true,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setInterests((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <div>
      {Object.entries(interests).map(([key, value]) => (
        <label key={key}>
          <input
            type="checkbox"
            name={key}
            checked={value}
            onChange={handleChange}
          />
          {key}
        </label>
      ))}
    </div>
  );
}
```

**radio:**

```jsx
// radio도 checked를 사용하지만, 그룹 내에서 하나만 선택됨

function RadioGroup() {
  const [color, setColor] = useState("red");

  return (
    <div>
      {["red", "green", "blue"].map((c) => (
        <label key={c}>
          <input
            type="radio"
            name="color"
            value={c}
            checked={color === c} // 현재 선택과 비교
            onChange={(e) => setColor(e.target.value)}
          />
          {c}
        </label>
      ))}
      <p>선택된 색상: {color}</p>
    </div>
  );
}
```

#### 여러 input을 하나의 State로 관리

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });

  // 공통 onChange 핸들러 — name 속성으로 어떤 필드인지 식별
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    //                             ↑ Computed Property Name (ES6)
  };

  return (
    <form>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <input
        name="password"
        value={formData.password}
        onChange={handleChange}
        type="password"
      />
      <input
        name="age"
        value={formData.age}
        onChange={handleChange}
        type="number"
      />
    </form>
  );
}
```

```
[name]: value 패턴의 원리

  e.target.name = "email"
  e.target.value = "user@example.com"

  { ...prev, [name]: value }
  = { ...prev, ["email"]: "user@example.com" }
  = { ...prev, email: "user@example.com" }

  → 하나의 핸들러로 모든 input을 처리할 수 있다
  → input이 추가되어도 핸들러를 수정할 필요 없다 (name 속성만 추가)
```

#### 입력 필터링과 포맷팅

```jsx
// 숫자만 입력 허용
function NumberOnly() {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const filtered = e.target.value.replace(/[^0-9]/g, "");
    setValue(filtered);
    // 사용자가 'abc123'을 입력해도 '123'만 저장됨
  };

  return <input value={value} onChange={handleChange} />;
}

// 전화번호 자동 포맷팅
function PhoneInput() {
  const [phone, setPhone] = useState("");

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    setPhone(formatted);
  };

  return (
    <input value={phone} onChange={handleChange} placeholder="010-1234-5678" />
  );
}

// 대문자 자동 변환
function UpperCaseInput() {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value.toUpperCase())}
    />
  );
}
```

> 💡 **핵심:** Controlled Component에서는 `onChange`에서 **State에 저장하기 전에 값을 가공**할 수 있다. 이것이 Controlled 패턴의 가장 큰 장점 중 하나이다. 사용자의 실제 입력과 State에 저장되는 값이 다를 수 있다.

### 3.2 Uncontrolled Component — DOM이 값을 관리한다

#### 핵심 메커니즘

Uncontrolled Component는 React가 폼 값을 제어하지 않고, **DOM이 자체적으로 관리**하게 두는 방식이다. 값이 필요할 때 **ref**로 읽어온다.

```jsx
import { useRef } from "react";

function UncontrolledInput() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    // 필요한 시점에 DOM에서 값을 읽어옴
    const value = inputRef.current.value;
    console.log("입력값:", value);
  };

  return (
    <div>
      {/* value 속성 없음 → DOM이 값을 관리 */}
      <input ref={inputRef} defaultValue="초기값" />
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
}
```

```
Uncontrolled의 데이터 흐름:

  1. 사용자가 'hello' 입력
  2. DOM이 input.value = 'hello'로 자체 관리
  3. React State에는 반영되지 않음
  4. "제출" 클릭 시 ref.current.value로 읽어옴

  → 타이핑 중에는 재렌더링이 발생하지 않는다
  → 실시간 검증, 필터링 등은 불가능
```

#### defaultValue와 defaultChecked

```jsx
// Uncontrolled에서 초기값 설정 시 value가 아닌 defaultValue 사용
<input defaultValue="초기값" />       // 텍스트 input
<textarea defaultValue="초기 내용" /> // textarea
<select defaultValue="banana">       // select
  <option value="apple">사과</option>
  <option value="banana">바나나</option>
</select>
<input type="checkbox" defaultChecked={true} />  // checkbox
```

```
⚠️ value vs defaultValue 혼동 주의

  <input value="고정값" />
  → Controlled — State 없이 value만 쓰면 입력 불가 (읽기 전용)
  → React 경고: "onChange 없이 value를 사용하면..."

  <input defaultValue="초기값" />
  → Uncontrolled — 초기값만 설정, 이후 DOM이 관리
  → 타이핑 자유롭게 가능

  둘을 섞어 쓰면 안 된다:
  <input value={state} defaultValue="초기값" />  // ❌ 충돌!
```

### 3.3 Controlled vs Uncontrolled 비교

```
┌──────────────────┬─────────────────────────┬─────────────────────────┐
│                  │  Controlled             │  Uncontrolled           │
├──────────────────┼─────────────────────────┼─────────────────────────┤
│  값의 소유자     │  React State            │  DOM                    │
│  값 읽기         │  State에서 직접         │  ref.current.value      │
│  값 쓰기         │  setState              │  사용자 입력 (자동)      │
│  초기값 설정     │  useState(initialValue) │  defaultValue           │
│  실시간 검증     │  ✅ 가능               │  ❌ 어려움              │
│  입력 필터링     │  ✅ 가능               │  ❌ 불가능              │
│  재렌더링        │  매 입력마다 발생       │  발생하지 않음           │
│  폼 제출 시      │  State에서 값 수집      │  ref에서 값 수집         │
│  코드 복잡도     │  더 많은 코드           │  더 적은 코드           │
│  React 권장      │  ★ 기본 권장           │  특수 경우에 사용        │
└──────────────────┴─────────────────────────┴─────────────────────────┘
```

#### 언제 어떤 방식을 선택하는가

```
Controlled를 사용해야 하는 경우 (대부분의 경우):
  · 실시간 입력 검증이 필요할 때
  · 입력 필터링/포맷팅이 필요할 때
  · 조건부 UI (비밀번호 강도 등)가 필요할 때
  · 여러 입력이 서로 연동될 때
  · 폼의 활성화/비활성화를 제어할 때
  · 동적 폼 (필드 추가/제거)을 다룰 때

Uncontrolled를 사용해도 되는 경우:
  · 단순한 폼 (검색바, 한 줄 입력)
  · 파일 입력 (<input type="file" />)
    → 파일은 읽기 전용이므로 Controlled가 불가능
  · 서드파티 DOM 라이브러리 통합
  · 성능이 매우 중요하고 실시간 검증이 불필요할 때
```

> 💡 **실무 관점:** React 공식 문서는 **Controlled Component를 기본으로 권장**한다. 대부분의 실무 프로젝트에서는 React Hook Form(Step 33)을 사용하는데, 이 라이브러리는 내부적으로 Uncontrolled 방식을 사용하면서 Controlled의 편의성을 제공하는 하이브리드 접근을 취한다.

### 3.4 React Synthetic Event 시스템

#### Synthetic Event란

React의 이벤트 핸들러(`onClick`, `onChange` 등)에 전달되는 이벤트 객체는 브라우저의 네이티브 이벤트가 아니라, React가 만든 **Synthetic Event(합성 이벤트)** 객체이다.

```jsx
function Button() {
  const handleClick = (e) => {
    // e는 SyntheticEvent 객체이다
    console.log(e); // SyntheticBaseEvent { ... }
    console.log(e.nativeEvent); // 원본 브라우저 이벤트
    console.log(e.type); // 'click'
    console.log(e.target); // 클릭된 DOM 노드
    console.log(e.currentTarget); // 핸들러가 등록된 DOM 노드
    console.log(e.preventDefault); // 함수 — 기본 동작 방지
    console.log(e.stopPropagation); // 함수 — 전파 중단
  };

  return <button onClick={handleClick}>클릭</button>;
}
```

#### Synthetic Event가 존재하는 이유

```
1. 크로스 브라우저 호환성
   · 브라우저마다 이벤트 객체의 속성/메서드가 미묘하게 다르다
   · SyntheticEvent가 차이를 추상화하여 동일한 API를 보장

2. 성능 최적화 (Event Delegation)
   · React는 개별 DOM 노드에 이벤트를 등록하지 않는다
   · root 노드 하나에서 모든 이벤트를 처리한다

3. React의 이벤트 시스템과 통합
   · Batching, 우선순위 스케줄링 등 React 내부 최적화와 연계
```

#### HTML 이벤트와 React 이벤트의 차이

```
┌──────────────────────────────────────────────────────────────┐
│  HTML (네이티브)             │  React (Synthetic)            │
├──────────────────────────────┼───────────────────────────────┤
│  onclick="handler()"         │  onClick={handler}            │
│  소문자                      │  camelCase                    │
│  문자열로 핸들러 전달        │  함수 참조로 핸들러 전달      │
│  onchange                    │  onChange                     │
│  (포커스 아웃 시 발생)       │  (입력할 때마다 발생!) ★      │
│  return false로 기본 동작 방지│  e.preventDefault() 명시 호출│
│  이벤트가 각 노드에 등록     │  root에서 위임 처리           │
└──────────────────────────────┴───────────────────────────────┘
```

> ⚠️ **가장 큰 차이: onChange의 동작!** HTML의 `onchange`는 input에서 **포커스가 빠져나갈 때(blur)** 발생하지만, React의 `onChange`는 **값이 변경될 때마다 즉시** 발생한다. 이것은 React가 의도적으로 변경한 동작이며, Controlled Component의 실시간 동기화를 가능하게 한다.

### 3.5 Event Delegation — React의 이벤트 위임

#### 원리

React는 각 DOM 노드에 개별적으로 이벤트 리스너를 등록하지 않는다. 대신 **React root 노드 하나에 모든 이벤트 리스너를 등록**하고, 이벤트 버블링을 이용하여 해당 이벤트를 처리한다.

```
HTML의 이벤트 등록 (개별 등록):

  <button onclick="...">A</button>  ← 리스너 1
  <button onclick="...">B</button>  ← 리스너 2
  <button onclick="...">C</button>  ← 리스너 3
  → 버튼 1000개 = 리스너 1000개


React의 이벤트 등록 (위임):

  <div id="root">                   ← 리스너 1개! (모든 이벤트 처리)
    <button>A</button>
    <button>B</button>
    <button>C</button>
  </div>
  → 버튼 1000개여도 리스너 1개

  동작 과정:
  1. 사용자가 버튼 B를 클릭
  2. 클릭 이벤트가 버블링되어 root까지 올라옴
  3. React가 root에서 이벤트를 캡처
  4. event.target을 확인 → 버튼 B임을 파악
  5. 버튼 B에 연결된 React 핸들러(onClick)를 찾아 실행
```

```
React 17 vs 18의 Event Delegation

  React 16: document에 이벤트 등록
  React 17+: root 컨테이너에 이벤트 등록 ★

  변경 이유:
  · 한 페이지에 여러 React 앱이 있을 때 이벤트 충돌 방지
  · 점진적 React 도입 시 기존 이벤트 시스템과의 호환성 향상
```

#### 이벤트 전파 (Event Propagation)

```jsx
function PropagationExample() {
  return (
    <div onClick={() => console.log("div 클릭")}>
      <button onClick={() => console.log("button 클릭")}>클릭</button>
    </div>
  );
}

// 버튼 클릭 시 출력:
// "button 클릭"   ← Target Phase
// "div 클릭"      ← Bubble Phase (전파)
```

```
이벤트 전파 3단계

  ┌─────────────────────────────────┐
  │  1. Capture Phase (캡처 단계)   │  root → ... → target 방향
  │  2. Target Phase (타겟 단계)    │  이벤트가 발생한 요소에서 실행
  │  3. Bubble Phase (버블 단계)    │  target → ... → root 방향
  └─────────────────────────────────┘

  React에서 캡처 단계를 사용하려면:
  <div onClickCapture={() => console.log('캡처!')}>
    ...
  </div>
```

#### 전파 제어

```jsx
function StopPropagation() {
  return (
    <div onClick={() => console.log("div")}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // 버블링 중단
          console.log("button");
        }}
      >
        클릭
      </button>
    </div>
  );
}

// 버튼 클릭 시 출력:
// "button"   ← div의 핸들러는 실행되지 않음
```

### 3.6 폼 제출 (Form Submit)

#### 기본 동작 방지

HTML `<form>`은 제출 시 **페이지를 새로고침**하는 것이 기본 동작이다. SPA에서는 이를 방지해야 한다.

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // 페이지 새로고침 방지 ★

    // 폼 데이터 처리
    console.log("로그인 시도:", { email, password });

    // API 호출 등
    // await fetch('/api/login', { ... });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
      />
      <button type="submit">로그인</button>
    </form>
  );
}
```

```
⚠️ 흔한 실수: button의 type

  <form>
    <button>제출</button>
    <!-- type 미지정 시 기본값은 "submit" → 폼 제출됨 -->
  </form>

  <form>
    <button type="button">제출 아님</button>
    <!-- type="button"이면 폼 제출 안 됨 -->
  </form>

  규칙:
  · 폼 제출 버튼: type="submit" (기본값이므로 생략 가능)
  · 일반 버튼: type="button" (명시해야 폼 제출 방지)
```

#### 기본 검증과 제출 비활성화

```jsx
function ValidatedForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 파생 데이터: 유효성 검사 결과
  const errors = {
    name: formData.name.length < 2 ? "이름은 2자 이상이어야 합니다" : "",
    email: !formData.email.includes("@") ? "올바른 이메일 형식이 아닙니다" : "",
    password:
      formData.password.length < 8 ? "비밀번호는 8자 이상이어야 합니다" : "",
  };

  // 파생 데이터: 모든 필드가 유효한가
  const isFormValid =
    Object.values(errors).every((e) => e === "") &&
    Object.values(formData).every((v) => v !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      // await fetch('/api/register', { ... });
      console.log("제출 성공:", formData);
    } catch (error) {
      console.error("제출 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div>
        <input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "제출 중..." : "가입"}
      </button>
    </form>
  );
}
```

```
이 폼의 State 설계 분석 (Step 6 원칙 적용)

  State:
    · formData: { name, email, password }  → 사용자 입력 (State 필요 ✅)
    · isSubmitting: boolean                → 제출 진행 상태 (State 필요 ✅)

  파생 데이터 (State 아님):
    · errors: formData에서 계산            → State 불필요
    · isFormValid: errors에서 계산         → State 불필요

  → Step 6의 "최소 State" 원칙이 적용되었다
```

### 3.7 React 19의 form Action (개요)

React 19에서는 `<form>` 에 **함수를 action으로 전달**하는 새로운 패턴이 도입되었다.

```jsx
// React 19의 form Action 패턴
function LoginForm() {
  const handleSubmit = async (formData) => {
    // formData는 Web API의 FormData 객체
    const email = formData.get("email");
    const password = formData.get("password");

    await loginUser(email, password);
  };

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">로그인</button>
    </form>
  );
}
```

```
기존 방식 vs React 19 Action

  기존:
    <form onSubmit={handleSubmit}>
    · e.preventDefault() 필수
    · State로 모든 값 관리
    · 제출 상태를 수동 관리

  React 19:
    <form action={함수}>
    · preventDefault 자동
    · FormData 객체로 값 수집
    · useActionState, useFormStatus 등 제출 상태 자동 관리
    · Server Action과 연결 가능 (Next.js)

  → React 19의 폼 패턴은 Step 15와 Step 33에서 상세히 학습한다
  → 현재 단계에서는 기존 Controlled 패턴을 확실히 익히는 것이 우선
```

### 3.8 자주 사용하는 이벤트 정리

```
┌──────────────────────────────────────────────────────────────┐
│  카테고리      │  이벤트                │  설명               │
├──────────────────────────────────────────────────────────────┤
│  마우스        │  onClick              │  클릭               │
│               │  onDoubleClick        │  더블 클릭           │
│               │  onMouseEnter         │  마우스 진입 (버블 X)│
│               │  onMouseLeave         │  마우스 이탈 (버블 X)│
│               │  onMouseOver          │  마우스 위 (버블 O)  │
│               │  onContextMenu        │  우클릭              │
├──────────────────────────────────────────────────────────────┤
│  키보드        │  onKeyDown           │  키 누름             │
│               │  onKeyUp             │  키 뗌               │
├──────────────────────────────────────────────────────────────┤
│  폼           │  onChange             │  값 변경 (즉시!)     │
│               │  onSubmit             │  폼 제출             │
│               │  onFocus              │  포커스 획득         │
│               │  onBlur               │  포커스 상실         │
│               │  onInput              │  입력 (onChange와 유사)│
├──────────────────────────────────────────────────────────────┤
│  포커스        │  onFocus             │  포커스 (버블 O)     │
│               │  onBlur              │  블러 (버블 O)       │
│               │  onFocusCapture      │  포커스 캡처 단계    │
├──────────────────────────────────────────────────────────────┤
│  스크롤/리사이즈│ onScroll             │  스크롤              │
│               │  onWheel             │  마우스 휠           │
├──────────────────────────────────────────────────────────────┤
│  클립보드      │  onCopy              │  복사               │
│               │  onPaste             │  붙여넣기            │
│               │  onCut               │  잘라내기            │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 사례 연구와 예시

### 4.1 사례: Controlled Component로 실시간 검색 필터

```jsx
function SearchableList() {
  const [query, setQuery] = useState("");
  const items = ["React", "Vue", "Angular", "Svelte", "SolidJS", "Preact"];

  // 파생 데이터: query에 따라 필터링
  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="프레임워크 검색..."
      />
      <p>{filtered.length}개 결과</p>
      <ul>
        {filtered.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

```
이 사례에서 Controlled Component의 장점:

  1. 타이핑할 때마다 실시간으로 리스트가 필터링된다
  2. query가 State에 있으므로 "결과 수"를 즉시 계산할 수 있다
  3. 검색어를 다른 컴포넌트와 공유하기 쉽다 (Lifting State Up)
  4. URL 파라미터와 동기화하기 쉽다 (라우팅 연동)

  Uncontrolled라면:
  · 사용자가 입력할 때마다 ref로 값을 읽어야 한다
  · 실시간 필터링이 자연스럽지 않다
  · "제출" 버튼을 따로 두어야 할 수 있다
```

### 4.2 사례: checkbox와 radio의 State 설계

```jsx
// 설문 폼: 다양한 입력 타입을 하나의 State로 관리
function SurveyForm() {
  const [survey, setSurvey] = useState({
    name: "",
    age: "",
    gender: "", // radio
    interests: [], // checkbox (다중 선택)
    newsletter: false, // checkbox (단일)
    experience: "beginner", // select
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "interests") {
      // 다중 선택 checkbox
      setSurvey((prev) => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter((i) => i !== value),
      }));
    } else if (type === "checkbox") {
      // 단일 checkbox (boolean)
      setSurvey((prev) => ({ ...prev, [name]: checked }));
    } else {
      // text, radio, select 등
      setSurvey((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form>
      <input name="name" value={survey.name} onChange={handleChange} />

      {/* radio group */}
      <label>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={survey.gender === "male"}
          onChange={handleChange}
        />
        남성
      </label>
      <label>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={survey.gender === "female"}
          onChange={handleChange}
        />
        여성
      </label>

      {/* 다중 checkbox */}
      {["sports", "music", "coding", "reading"].map((interest) => (
        <label key={interest}>
          <input
            type="checkbox"
            name="interests"
            value={interest}
            checked={survey.interests.includes(interest)}
            onChange={handleChange}
          />
          {interest}
        </label>
      ))}

      {/* 단일 checkbox */}
      <label>
        <input
          type="checkbox"
          name="newsletter"
          checked={survey.newsletter}
          onChange={handleChange}
        />
        뉴스레터 구독
      </label>
    </form>
  );
}
```

### 4.3 사례: 이벤트 전파로 인한 의도치 않은 동작

```jsx
// ❌ 모달 외부 클릭 시 닫기 — 이벤트 전파 문제
function Modal({ onClose, children }) {
  return (
    // 오버레이 클릭 → onClose 실행
    <div className="overlay" onClick={onClose}>
      {/* 모달 내부 클릭도 onClose가 실행됨! (버블링) */}
      <div className="modal">
        {children}
        <button>확인</button> {/* 이 버튼 클릭해도 모달이 닫힘! */}
      </div>
    </div>
  );
}

// ✅ 해결: 모달 내부에서 전파 중단
function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
        <button>확인</button> {/* 이제 오버레이까지 전파되지 않음 */}
      </div>
    </div>
  );
}
```

---

## 5. 실습

> **온라인 실습 환경:** 아래 StackBlitz에서 Controlled/Uncontrolled 폼, 이벤트 버블링, 폼 제출 처리를 직접 실습할 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: Controlled 폼 구현 [Applying]

**목표:** 다양한 폼 요소를 Controlled 방식으로 구현한다.

**프로필 편집 폼**을 만든다:

```
요구사항:
  · 이름 (text input)
  · 자기소개 (textarea)
  · 직업 (select: 개발자, 디자이너, PM, 기타)
  · 기술 스택 (checkbox 다중 선택: React, Vue, Angular, Svelte)
  · 경력 수준 (radio: 주니어, 미드, 시니어)
  · 구직 중 여부 (단일 checkbox)
  · 모든 값을 하나의 State 객체로 관리
  · 하나의 공통 handleChange 함수 사용
  · "저장" 버튼 클릭 시 현재 State를 console.log로 출력
```

---

### 실습 2: 입력 필터링과 실시간 검증 [Applying · Analyzing]

**목표:** Controlled Component의 "값 가공" 능력을 활용한다.

**카드 번호 입력 폼**을 만든다:

```
요구사항:
  · 숫자만 입력 가능 (영문/한글 필터링)
  · 4자리마다 자동 공백 삽입 (1234 5678 9012 3456)
  · 최대 16자리(공백 제외) 제한
  · 실시간으로 카드 종류 표시:
    - 4로 시작 → "Visa"
    - 5로 시작 → "MasterCard"
    - 기타 → "기타"
  · 16자리 미만일 때 에러 메시지 표시

분석할 것:
  · 이 기능이 Uncontrolled Component로 구현 가능한가?
  · 어떤 부분이 Controlled에서만 가능한가?
```

---

### 실습 3: 이벤트 전파 실험 [Understanding · Analyzing]

**목표:** 이벤트 버블링과 stopPropagation의 동작을 직접 관찰한다.

아래 코드를 실행하고 각 영역을 클릭했을 때 콘솔 출력 순서를 **실행 전에 예측**한 후 비교하라.

```jsx
function PropagationTest() {
  return (
    <div onClick={() => console.log("1: 최외곽 div")}>
      <div onClick={() => console.log("2: 중간 div")}>
        <button onClick={() => console.log("3: 버튼")}>클릭</button>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          console.log("4: stopPropagation div");
        }}
      >
        <button onClick={() => console.log("5: 중단된 영역의 버튼")}>
          클릭2
        </button>
      </div>
    </div>
  );
}
```

**예측 기록표:**

| 클릭 대상                 | 예측 출력 순서 | 실제 출력 순서 | 분석 |
| ------------------------- | -------------- | -------------- | ---- |
| "클릭" 버튼               |                |                |      |
| "클릭2" 버튼              |                |                |      |
| "중간 div" 영역 (버튼 외) |                |                |      |

---

### 실습 4 (선택): 동적 폼 필드 [Evaluating · Creating]

**목표:** 폼 필드를 동적으로 추가/제거하는 패턴을 구현한다.

**교육 이력 입력 폼**을 만든다:

```
요구사항:
  · 초기에 교육 이력 1개 표시 (학교명, 전공, 졸업연도)
  · "이력 추가" 버튼으로 새 이력 추가 (최대 5개)
  · 각 이력에 "삭제" 버튼 (최소 1개는 유지)
  · 모든 이력을 배열 State로 관리
  · "제출" 시 전체 데이터 출력

고려사항:
  · 각 교육 이력의 key는 무엇으로 해야 하는가? (Step 7 복습)
  · 특정 이력의 특정 필드를 변경할 때 Immutable 업데이트는 어떻게?
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 8 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Controlled Component = React State가 폼 값의 주인         │
│     → value + onChange가 항상 짝을 이룬다                     │
│     → 입력 → State 변경 → 재렌더링 → input에 반영             │
│     → 실시간 검증, 필터링, 포맷팅이 가능하다                   │
│                                                               │
│  2. Uncontrolled Component = DOM이 폼 값을 자체 관리          │
│     → defaultValue로 초기값, ref로 필요 시 읽기               │
│     → 간단한 폼, 파일 입력에 적합                             │
│     → React 권장은 Controlled (대부분의 경우)                  │
│                                                               │
│  3. React의 onChange는 HTML과 다르다                          │
│     → HTML: blur 시 발생                                     │
│     → React: 값이 변경될 때마다 즉시 발생                     │
│     → Controlled 패턴의 실시간 동기화를 가능하게 한다          │
│                                                               │
│  4. Synthetic Event = React가 만든 크로스 브라우저 이벤트      │
│     → 모든 브라우저에서 동일한 API                             │
│     → nativeEvent로 원본 이벤트 접근 가능                     │
│                                                               │
│  5. Event Delegation = root에서 모든 이벤트를 위임 처리        │
│     → 개별 DOM 노드에 리스너를 등록하지 않는다                 │
│     → React 17+: root 컨테이너에서 처리                       │
│     → 버블링을 활용한 효율적 이벤트 관리                       │
│                                                               │
│  6. 폼 요소별 제어 속성이 다르다                               │
│     → text/textarea/select: value + onChange                  │
│     → checkbox/radio: checked + onChange                      │
│     → 다중 input: name 속성 + [name]: value 패턴              │
│                                                               │
│  7. 폼 제출 시 e.preventDefault()로 새로고침을 방지한다        │
│     → type="submit" 버튼이 form 안에 있으면 제출 트리거        │
│     → 검증은 파생 데이터로, 제출 상태는 State로 관리           │
│                                                               │
│  8. React 19의 form Action은 새로운 폼 처리 패턴이다          │
│     → <form action={함수}> 형태                               │
│     → Step 15, Step 33에서 상세 학습                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                            | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Controlled Component에서 value와 onChange가 반드시 함께 사용되어야 하는 이유는? | Understand | 3.1         |
| 2   | `<input value="고정값" />`에 onChange가 없으면 어떤 일이 발생하는가?            | Understand | 3.1         |
| 3   | React의 onChange와 HTML의 onchange의 발동 시점 차이는?                          | Remember   | 3.4         |
| 4   | React가 개별 DOM 노드 대신 root에 이벤트를 등록하는 방식의 이름과 장점은?       | Understand | 3.5         |
| 5   | checkbox를 Controlled로 제어할 때 value 대신 사용하는 속성은?                   | Apply      | 3.1         |
| 6   | 여러 input을 하나의 handleChange로 처리할 때 사용하는 패턴은?                   | Apply      | 3.1         |
| 7   | 모달 내부 클릭 시 오버레이의 onClick이 실행되는 이유와 해결법은?                | Analyze    | 4.3         |
| 8   | 실시간 입력 필터링(숫자만 허용)이 Uncontrolled로 불가능한 이유는?               | Evaluate   | 3.3         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. Controlled와 Uncontrolled 중 어떤 것을 써야 하나?**

대부분의 경우 **Controlled**를 사용해야 한다. 실시간 검증, 조건부 필드, 입력값 변환 등 대부분의 실무 요구사항은 Controlled에서만 구현할 수 있다. Uncontrolled는 파일 입력(`<input type="file" />`), 서드파티 DOM 라이브러리 통합, 또는 극히 단순한 폼에서만 사용한다. React Hook Form은 내부적으로 Uncontrolled 방식을 사용하여 성능을 최적화하면서 Controlled의 편의성을 제공한다(Step 32).

**Q2. e.preventDefault()를 빼먹으면 어떻게 되나?**

폼의 `onSubmit` 핸들러에서 `e.preventDefault()`를 호출하지 않으면, 브라우저의 기본 폼 제출 동작이 실행되어 **페이지가 리로드**된다. SPA에서 페이지 리로드는 전체 React 앱의 State를 초기화시키므로, 폼 제출 핸들러에서 `preventDefault()`는 필수이다.

**Q3. React의 onChange는 HTML의 onchange와 같은가?**

다르다. HTML의 `onchange`는 입력 필드에서 **포커스가 벗어날 때** 발동하지만, React의 `onChange`는 **매 키 입력마다** 발동한다. 이는 HTML의 `oninput` 이벤트에 해당한다. React가 이렇게 설계한 이유는 Controlled Component 패턴에서 매 입력을 즉시 State에 반영하기 위해서이다.

**Q4. Event Pooling이 아직 문제가 되나?**

React 17 이후 **Event Pooling이 제거**되었으므로 더 이상 문제가 되지 않는다. React 16 이전에는 성능 최적화를 위해 이벤트 객체를 재사용(Pooling)했으므로, 비동기 콜백에서 이벤트 객체에 접근하면 null이 되는 문제가 있었다. 현재는 이벤트 객체가 정상적으로 유지되므로 `e.persist()`를 호출할 필요가 없다.

**Q5. 폼이 복잡해지면 useState로 계속 관리해야 하나?**

필드가 5개 이상이거나 검증 로직이 복잡해지면 **React Hook Form + Zod** 조합을 권장한다(Step 32~33). React Hook Form은 Uncontrolled 기반으로 리렌더링을 최소화하면서 선언적 검증을 제공한다. 그 전 단계로 useReducer(Step 13)를 사용하여 폼 상태를 하나의 객체로 관리하는 방법도 있다.

---

## 7. 다음 단계 예고

> **Step 9. 조건부 렌더링과 리스트 패턴**
>
> - 조건부 렌더링의 6가지 패턴과 선택 기준
> - && 연산자의 함정 (숫자 0, 빈 문자열)
> - 리스트 렌더링의 map 패턴과 key 복습
> - 빈 상태(Empty State), 로딩, 에러 UI 설계
> - 리스트 필터링, 정렬, 그룹화 패턴

---

## 📚 참고 자료

- [React 공식 문서 — Responding to Events](https://react.dev/learn/responding-to-events)
- [React 공식 문서 — State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [React 공식 문서 — Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)
- [React 공식 문서 — SyntheticEvent Reference](https://react.dev/reference/react-dom/components/common#react-event-object)
- [React 공식 문서 — `<input>` Reference](https://react.dev/reference/react-dom/components/input)
- [React 공식 문서 — `<form>` Reference](https://react.dev/reference/react-dom/components/form)

---

> **React 완성 로드맵 v2.0** | Phase 1 — React Core Mechanics | Step 8 of 42
