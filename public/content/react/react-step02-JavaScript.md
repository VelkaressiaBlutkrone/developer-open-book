# Step 02. 모던 JavaScript 필수 문법 복습

> **Phase 0 — 개발 환경과 생태계 이해 (Step 1~3)**
> React를 실행하기 위한 환경을 이해하고 구성한다

> **난이도:** 🟢 초급 (Beginner)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                |
| -------------- | ------------------------------------------------------------------- |
| **Remember**   | ES6+ 핵심 문법의 이름과 문법 형태를 식별할 수 있다                  |
| **Understand** | 각 문법이 React에서 왜 필수적인지 연결하여 설명할 수 있다           |
| **Understand** | var/let/const, 함수 선언/화살표 함수의 차이를 비교할 수 있다        |
| **Apply**      | Destructuring, Spread, 고차 함수를 사용하여 데이터를 변환할 수 있다 |
| **Analyze**    | 비동기 코드의 실행 순서를 추적하고 분석할 수 있다                   |

**전제 지식:**

- JavaScript 기본 문법 (변수, 함수, 조건문, 반복문)
- 기본 자료형 (string, number, boolean, array, object)

**이 Step의 위치:**

```
이 문서는 React 문법이 아니라 JavaScript 문법을 다룬다.
React 코드에서 매일 사용하는 JS 패턴만 선별하여 집중적으로 복습한다.
이미 ES6+에 익숙하다면 이 Step을 빠르게 훑고 Step 3으로 넘어가도 된다.
```

---

## 1. 서론 — 왜 JavaScript 복습이 필요한가

### 1.1 모던 JavaScript의 등장 배경과 발전 과정

JavaScript는 1995년 Brendan Eich가 Netscape에서 10일 만에 프로토타입을 만든 언어이다. 초기에는 웹 페이지에 간단한 동적 효과를 추가하는 "스크립트 언어"에 불과했다. 그러나 2009년 Node.js의 등장, 2015년 ES6(ECMAScript 2015)의 대규모 문법 혁신을 거치면서 현대 소프트웨어 개발의 핵심 언어로 자리 잡았다.

ES6는 JavaScript 역사상 가장 큰 변화였다. `let`/`const`, 화살표 함수, 클래스, 모듈 시스템, Promise, Destructuring 등이 한꺼번에 도입되었고, 이후 매년 새로운 기능이 추가되고 있다. React는 이 ES6+ 문법을 적극적으로 활용하여 설계되었기 때문에, React를 배우기 전에 이 문법들을 확실히 이해해야 한다.

```
ES6 이전 vs 이후의 JavaScript

  ES5 (2009 이전)                    ES6+ (2015 이후)
  ─────────────────                 ─────────────────
  var x = 10;                       const x = 10;
  function add(a, b) { ... }        const add = (a, b) => ...
  var name = obj.name;              const { name } = obj;
  arr.concat([4])                   [...arr, 4]
  'Hello ' + name                   `Hello ${name}`
  require('module')                 import module from 'module'
  callback(function() {})           callback(() => {})
```

### 1.2 산업적 가치 — React 개발자에게 ES6+가 필수인 이유

Stack Overflow 2024 개발자 설문조사에 따르면, JavaScript는 12년 연속 가장 널리 사용되는 프로그래밍 언어이다. React 생태계의 모든 라이브러리, 문서, 예제 코드가 ES6+ 문법으로 작성되어 있으므로, 이 문법에 익숙하지 않으면 사실상 React 학습이 불가능하다.

특히 React 코드에서 가장 빈번하게 사용되는 패턴인 **Destructuring**(Props 수신, useState 반환값 분해), **Spread 연산자**(Immutable State 업데이트), **배열 고차 함수**(리스트 렌더링)는 React의 "문법"처럼 느껴질 정도로 깊이 결합되어 있다.

### 1.3 이 Step의 핵심 개념 관계도

```
┌──────────────────────────────────────────────────────────────┐
│              Step 02 핵심 개념 관계도                           │
│                                                               │
│  변수 선언 (const/let)                                        │
│    │                                                          │
│    ├── 화살표 함수 ──── this 바인딩 ──── 이벤트 핸들러         │
│    │                                                          │
│    ├── Destructuring ──┬── 객체 분해 ──── Props 수신           │
│    │                   └── 배열 분해 ──── useState 반환값      │
│    │                                                          │
│    ├── Spread/Rest ────┬── 펼치기 ──── Immutable 업데이트     │
│    │                   └── 모으기 ──── 나머지 Props 수집       │
│    │                                                          │
│    ├── 배열 고차 함수 ─┬── map ──── 리스트 렌더링              │
│    │                   ├── filter ── 조건부 필터링             │
│    │                   └── reduce ── 데이터 집계               │
│    │                                                          │
│    ├── Optional Chaining / Nullish Coalescing                │
│    │   └── API 응답 데이터의 안전한 접근                       │
│    │                                                          │
│    ├── ES Module ──── import/export ──── 컴포넌트 분리         │
│    │                                                          │
│    ├── Promise / async·await ──── 비동기 데이터 패칭           │
│    │                                                          │
│    └── Closure ──── Hook의 동작 원리 ──── Stale Closure        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 React와 JavaScript의 관계

React는 **JavaScript 라이브러리**이다. React만의 특수한 문법은 JSX 정도이고, 나머지는 모두 JavaScript이다. React를 어렵게 느끼는 원인의 상당수는 **React가 아니라 모던 JavaScript 문법에 대한 이해 부족**에서 온다.

```
React 코드에서 만나는 것들

  const [count, setCount] = useState(0);
  ─────────────────────────────────────
  · const          → 변수 선언 (ES6)
  · [count, setCount] → 배열 Destructuring (ES6)
  · useState(0)    → 함수 호출 (JS 기본)
  · 이 중 React 고유 문법: 없음. 전부 JavaScript이다.
```

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것 (React에서 매일 사용하는 JS 문법)              │
│  · 변수 선언: let, const                                 │
│  · 화살표 함수와 일반 함수의 차이                         │
│  · Destructuring (구조 분해 할당)                        │
│  · Spread / Rest 연산자                                  │
│  · Template Literal                                      │
│  · 삼항 연산자와 논리 연산자                              │
│  · 배열 고차 함수 (map, filter, reduce 등)               │
│  · ES Module (import / export)                           │
│  · Optional Chaining / Nullish Coalescing               │
│  · Promise와 async/await                                 │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · JavaScript 기초 (변수, 조건문, 반복문 등)             │
│  · DOM API (querySelector 등) — React가 대체             │
│  · class 문법 — 함수 컴포넌트가 표준                     │
│  · Proxy, Reflect 등 고급 메타프로그래밍                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                         | 정의                                                         | React에서의 역할                        |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------- |
| **Destructuring**            | 객체나 배열에서 값을 추출하여 개별 변수에 할당하는 문법      | Props 수신, useState 반환값 분해        |
| **Spread Operator**          | `...`으로 배열/객체의 요소를 개별적으로 펼치는 연산자        | Immutable State 업데이트, Props 전달    |
| **Rest Parameter**           | `...`으로 나머지 인자를 배열로 수집하는 매개변수             | 나머지 Props 수집 (`...rest`)           |
| **Arrow Function**           | `() => {}` 형태의 함수 표현식, 자체 `this`를 가지지 않음     | 이벤트 핸들러, 콜백 함수, 컴포넌트 정의 |
| **Template Literal**         | 백틱(`` ` ``)으로 감싸 표현식을 삽입할 수 있는 문자열        | 동적 className, 문자열 조합             |
| **Higher-Order Function**    | 함수를 인자로 받거나 함수를 반환하는 함수                    | map/filter로 리스트 렌더링              |
| **ES Module**                | `import`/`export`로 모듈을 분리·조합하는 표준 시스템         | 컴포넌트 파일 분리, 라이브러리 가져오기 |
| **Promise**                  | 비동기 작업의 완료 또는 실패를 나타내는 객체                 | API 호출, 데이터 패칭                   |
| **async/await**              | Promise를 동기 코드처럼 작성할 수 있게 하는 문법             | useEffect 내부 비동기 처리              |
| **Optional Chaining**        | `?.`으로 중첩 객체의 속성에 안전하게 접근하는 연산자         | API 응답 데이터의 안전한 참조           |
| **Nullish Coalescing**       | `??`으로 null 또는 undefined일 때만 기본값을 제공하는 연산자 | Props 기본값, 데이터 폴백               |
| **Truthy / Falsy**           | Boolean 컨텍스트에서 true/false로 평가되는 값의 분류         | 조건부 렌더링의 함정 이해               |
| **Immutability**             | 생성 후 변경하지 않는 데이터 처리 패턴                       | State 업데이트의 핵심 원칙              |
| **Closure**                  | 함수가 선언된 환경의 변수를 기억하는 메커니즘                | Hook의 동작 원리, Stale Closure 이해    |
| **Short-circuit Evaluation** | 논리 연산자가 첫 번째 결정적 피연산자에서 평가를 멈추는 것   | `&&`를 활용한 조건부 렌더링             |

### 2.2 핵심 용어 상세 설명

#### Destructuring — 데이터 구조를 해체하여 변수에 할당하는 문법

Destructuring(구조 분해 할당)은 ES6에서 도입된 문법으로, 배열이나 객체의 내부 값을 개별 변수로 추출하는 간결한 방법을 제공한다. 이 문법이 중요한 이유는 React에서 **Props 수신**과 **useState 반환값 처리**에 필수적으로 사용되기 때문이다. Destructuring 없이는 React 코드를 읽는 것조차 어려울 정도로 깊이 통합되어 있다.

#### Spread/Rest — 동일 문법(`...`), 반대 역할

Spread와 Rest는 같은 `...` 문법을 사용하지만 **위치에 따라 역할이 반대**이다. Spread는 기존 배열이나 객체를 "펼쳐서" 개별 요소로 만들고, Rest는 여러 요소를 하나로 "모은다." React에서 Spread는 **Immutable State 업데이트의 핵심 도구**이며, Rest는 **래퍼 컴포넌트에서 나머지 Props를 수집**할 때 사용한다.

#### Closure — 함수가 자신의 탄생 환경을 기억하는 메커니즘

클로저는 JavaScript에서 가장 강력하면서도 혼란을 일으키는 개념 중 하나이다. 함수가 선언된 스코프의 변수에 계속 접근할 수 있는 특성을 말한다. React Hook의 모든 동작이 클로저에 기반하며, 특히 **Stale Closure 버그**(Step 6)를 이해하려면 이 개념에 대한 확실한 이해가 필요하다.

#### Immutability — 생성 후 변경하지 않는 데이터 처리 원칙

Immutability(불변성)는 데이터를 직접 수정하지 않고 **새로운 복사본을 만들어 교체**하는 패턴이다. React의 State 업데이트는 반드시 이 원칙을 따라야 한다. 직접 수정하면 React가 변경을 감지하지 못해 화면이 업데이트되지 않기 때문이다. Spread 연산자와 배열 고차 함수(map, filter)가 이 패턴의 핵심 도구이다.

### 2.3 ES 버전과 React에서의 활용 빈도

```
ES6 (2015) ★★★ — React의 거의 모든 코드가 이 버전 기반
  · let, const
  · Arrow Function
  · Destructuring
  · Spread / Rest
  · Template Literal
  · ES Module (import/export)
  · Promise
  · class (React에서는 거의 사용 안 함)

ES2017 ★★★
  · async / await

ES2020 ★★☆
  · Optional Chaining (?.)
  · Nullish Coalescing (??)

ES2023 ★☆☆
  · Array.toSorted(), toReversed(), toSpliced()
  · Immutable 배열 메서드 — React State 업데이트에 유용
```

---

## 3. 이론과 원리

### 3.1 변수 선언 — let, const, var

#### 세 가지 선언 방식 비교

```
┌────────┬──────────────┬──────────────┬──────────────┐
│        │    var        │    let       │    const     │
├────────┼──────────────┼──────────────┼──────────────┤
│ 스코프  │ 함수 스코프   │ 블록 스코프   │ 블록 스코프   │
│ 재선언  │ 가능         │ 불가능       │ 불가능        │
│ 재할당  │ 가능         │ 가능         │ 불가능        │
│ 호이스팅│ 선언+초기화   │ 선언만       │ 선언만        │
│        │ (undefined)  │ (TDZ 에러)   │ (TDZ 에러)   │
│ React  │ 사용하지 않음 │ 드물게 사용   │ 기본 선택 ★  │
└────────┴──────────────┴──────────────┴──────────────┘
```

#### 블록 스코프 vs 함수 스코프

```javascript
// var — 함수 스코프: if 블록을 무시하고 함수 전체에서 접근 가능
function varExample() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — 블록 밖에서도 접근됨!
}

// let — 블록 스코프: if 블록 안에서만 유효
function letExample() {
  if (true) {
    let y = 10;
  }
  console.log(y); // ReferenceError — 블록 밖에서 접근 불가
}
```

#### TDZ (Temporal Dead Zone)

```javascript
// var — 호이스팅 시 undefined로 초기화
console.log(a); // undefined (에러 아님!)
var a = 5;

// let/const — 호이스팅되지만 초기화되지 않음 (TDZ)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 5;

// TDZ 구간 시각화
// ┌── TDZ 시작 (선언은 호이스팅됨)
// │  console.log(b);  ← 여기서 접근하면 에러
// │  ...
// └── let b = 5;      ← TDZ 종료, 초기화됨
```

#### const의 "불변"이 의미하는 것

```javascript
// const는 "바인딩(binding)"이 불변이다 — 재할당이 불가능
const count = 0;
count = 1; // TypeError: Assignment to constant variable

// const는 "값(value)"이 불변이 아니다 — 내부 속성 변경은 가능
const user = { name: "홍길동", age: 25 };
user.name = "김철수"; // 동작함! 객체 내부 속성 변경은 허용
user = { name: "박영희" }; // TypeError! 변수 자체의 재할당은 불가

const items = [1, 2, 3];
items.push(4); // 동작함! 배열 내부 변경은 허용
items = [1, 2, 3, 4]; // TypeError! 변수 자체의 재할당은 불가
```

> 💡 **React에서의 원칙:** `const`를 기본으로 사용하고, 재할당이 반드시 필요한 경우에만 `let`을 사용한다. `var`는 사용하지 않는다. State의 불변성(Immutability)은 `const`의 불변이 아니라, **새로운 객체를 만들어 교체**하는 패턴이다(Step 6에서 학습).

### 3.2 화살표 함수 (Arrow Function)

#### 기본 문법

```javascript
// 함수 선언문 (Function Declaration)
function add(a, b) {
  return a + b;
}

// 함수 표현식 (Function Expression)
const add = function (a, b) {
  return a + b;
};

// 화살표 함수 (Arrow Function)
const add = (a, b) => {
  return a + b;
};

// 화살표 함수 — 축약형 (본문이 표현식 하나일 때)
const add = (a, b) => a + b;

// 매개변수가 1개일 때 괄호 생략 가능
const double = (n) => n * 2;

// 매개변수가 0개일 때 괄호 필수
const getRandom = () => Math.random();

// 객체 리터럴 반환 시 소괄호 필수
const createUser = (name) => ({ name, createdAt: Date.now() });
//                            ↑ 중괄호가 블록이 아닌 객체임을 표시
```

#### 화살표 함수와 일반 함수의 핵심 차이: this

```javascript
// 일반 함수의 this — 호출 방식에 따라 결정됨
const counter = {
  count: 0,
  increment: function () {
    setTimeout(function () {
      this.count++; // this → window (또는 undefined in strict mode)
      console.log(this.count); // NaN 또는 에러!
    }, 1000);
  },
};

// 화살표 함수의 this — 선언된 위치의 this를 상속 (Lexical this)
const counter = {
  count: 0,
  increment: function () {
    setTimeout(() => {
      this.count++; // this → counter 객체 (외부 함수의 this)
      console.log(this.count); // 1
    }, 1000);
  },
};
```

```
this 바인딩 규칙 비교

  일반 함수: 호출 시점에 this가 결정됨
  ┌───────────────────────────────────────┐
  │ obj.method()     → this = obj        │
  │ func()           → this = window/undefined │
  │ new Func()       → this = 새 인스턴스  │
  │ func.call(obj)   → this = obj        │
  └───────────────────────────────────────┘

  화살표 함수: 선언 시점에 this가 결정됨 (Lexical this)
  ┌───────────────────────────────────────┐
  │ 자체 this가 없음                       │
  │ 둘러싼 스코프의 this를 그대로 사용      │
  │ call, apply, bind로 this 변경 불가     │
  └───────────────────────────────────────┘
```

> 💡 **React에서의 의미:** React 함수 컴포넌트에서는 `this`를 사용하지 않으므로 this 바인딩 차이가 직접적 이슈는 아니다. 그러나 이벤트 핸들러, 콜백 함수에서 화살표 함수를 관습적으로 사용하는 이유가 바로 이 Lexical this 특성이다.

#### React에서 화살표 함수가 쓰이는 위치

```jsx
// 1. 컴포넌트 정의 (화살표 또는 function 선언 — 둘 다 사용)
const MyComponent = () => {
  return <p>Hello</p>;
};

function MyComponent() {
  return <p>Hello</p>;
}

// 2. 이벤트 핸들러 (화살표 함수가 일반적)
<button onClick={() => setCount(count + 1)}>증가</button>;

// 3. 배열 메서드 콜백
{
  items.map((item) => <li key={item.id}>{item.name}</li>);
}

// 4. 조건부 로직
const getLabel = (status) => (status === "active" ? "활성" : "비활성");
```

### 3.3 Destructuring (구조 분해 할당)

#### 객체 Destructuring

```javascript
// 기본 — 속성 이름으로 추출
const user = { name: "홍길동", age: 25, city: "서울" };

const { name, age, city } = user;
// name = '홍길동', age = 25, city = '서울'

// 다른 변수명으로 받기 (Renaming)
const { name: userName, age: userAge } = user;
// userName = '홍길동', userAge = 25

// 기본값 설정
const { name, role = "user" } = user;
// role = 'user' (user 객체에 role이 없으므로 기본값 적용)

// 중첩 객체 Destructuring
const profile = {
  name: "홍길동",
  address: { city: "서울", district: "강남구" },
};

const {
  address: { city, district },
} = profile;
// city = '서울', district = '강남구'
```

**React에서의 활용:**

```jsx
// Props 수신 — 가장 빈번한 사용 패턴
function UserCard({ name, age, role = "member" }) {
  return (
    <p>
      {name} ({age}세) - {role}
    </p>
  );
}

// useState 반환값은 배열이므로 아래 3.3의 배열 Destructuring에 해당
// 하지만 개념적으로 "분해하여 변수에 할당"한다는 점은 동일
```

#### 배열 Destructuring

```javascript
// 기본 — 순서(인덱스)로 추출
const colors = ["red", "green", "blue"];

const [first, second, third] = colors;
// first = 'red', second = 'green', third = 'blue'

// 일부 건너뛰기
const [, , third] = colors;
// third = 'blue'

// 기본값 설정
const [a, b, c, d = "yellow"] = colors;
// d = 'yellow' (colors[3]이 없으므로 기본값 적용)

// 변수 교환 (Swap)
let x = 1,
  y = 2;
[x, y] = [y, x];
// x = 2, y = 1
```

**React에서의 활용:**

```jsx
// useState — React에서 가장 많이 보는 배열 Destructuring
const [count, setCount] = useState(0);
//     값       setter      Hook 호출

// 배열이기 때문에 변수 이름을 자유롭게 지정할 수 있다
// 객체였다면 { state, setState } 같은 고정된 이름을 써야 함
const [isOpen, setIsOpen] = useState(false);
const [user, setUser] = useState(null);
const [items, setItems] = useState([]);
```

> 💡 **왜 useState는 객체가 아닌 배열을 반환하는가?** 배열 Destructuring은 **이름을 자유롭게 지정**할 수 있기 때문이다. 하나의 컴포넌트에서 useState를 여러 번 사용할 때 각각 의미 있는 이름을 붙일 수 있다.

#### 함수 매개변수에서의 Destructuring

```javascript
// 객체 매개변수 Destructuring
function createGreeting({ name, greeting = "안녕하세요" }) {
  return `${greeting}, ${name}님!`;
}

createGreeting({ name: "홍길동" });
// "안녕하세요, 홍길동님!"

createGreeting({ name: "김철수", greeting: "반갑습니다" });
// "반갑습니다, 김철수님!"
```

### 3.4 Spread 연산자와 Rest 매개변수

#### Spread — 펼치기 (`...`)

```javascript
// 배열 Spread
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]
const withNew = [...arr1, 99]; // [1, 2, 3, 99]
const copy = [...arr1]; // [1, 2, 3] (얕은 복사)

// 객체 Spread
const defaults = { theme: "light", lang: "ko", fontSize: 14 };
const custom = { theme: "dark", fontSize: 16 };
const settings = { ...defaults, ...custom };
// { theme: 'dark', lang: 'ko', fontSize: 16 }
// → 뒤에 오는 속성이 앞의 같은 이름 속성을 덮어쓴다 (Override)
```

**React에서의 활용:**

```jsx
// State 불변 업데이트 — React의 핵심 패턴
const [user, setUser] = useState({ name: "홍길동", age: 25 });

// 속성 하나만 변경할 때: 기존 객체를 복사하고 해당 속성만 덮어쓰기
setUser({ ...user, age: 26 });
// → { name: '홍길동', age: 26 }

// 배열에 항목 추가
const [items, setItems] = useState(["A", "B"]);
setItems([...items, "C"]);
// → ['A', 'B', 'C']

// Props 전달 — 객체의 모든 속성을 Props로 펼치기
const buttonProps = { type: "submit", disabled: false, className: "btn" };
<button {...buttonProps}>제출</button>;
// = <button type="submit" disabled={false} className="btn">제출</button>
```

#### Rest — 모으기 (`...`)

```javascript
// 함수 매개변수에서 나머지 인자 수집
function sum(first, ...rest) {
  // first = 1, rest = [2, 3, 4, 5]
  return first + rest.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4, 5); // 15

// 객체에서 특정 속성을 분리하고 나머지를 수집
const user = { id: 1, name: "홍길동", age: 25, role: "admin" };
const { id, ...profile } = user;
// id = 1
// profile = { name: '홍길동', age: 25, role: 'admin' }

// 배열에서 첫 번째 요소를 분리하고 나머지를 수집
const [head, ...tail] = [1, 2, 3, 4, 5];
// head = 1, tail = [2, 3, 4, 5]
```

**React에서의 활용:**

```jsx
// 나머지 Props 수집 — 래퍼 컴포넌트에서 자주 사용
function Button({ variant, size, children, ...rest }) {
  // variant, size, children은 직접 사용
  // 나머지 Props(onClick, disabled, className 등)는 <button>에 전달
  return (
    <button className={`btn-${variant} btn-${size}`} {...rest}>
      {children}
    </button>
  );
}

// 사용
<Button variant="primary" size="lg" onClick={handleClick} disabled={isLoading}>
  저장
</Button>;
```

#### Spread와 Rest 구분법

```
같은 문법 `...`이지만 위치에 따라 역할이 다르다

  Spread (펼치기) — 데이터를 제공하는 쪽
  ─────────────────────────────────────
  · 함수 호출의 인자:        func(...args)
  · 배열 리터럴:            [...arr, newItem]
  · 객체 리터럴:            { ...obj, newProp }

  Rest (모으기) — 데이터를 수신하는 쪽
  ─────────────────────────────────────
  · 함수 선언의 매개변수:    function(a, ...rest)
  · 배열 Destructuring:     const [first, ...rest] = arr
  · 객체 Destructuring:     const { id, ...rest } = obj
```

### 3.5 Template Literal

```javascript
const name = "홍길동";
const age = 25;

// 기존 문자열 연결
const msg1 = "이름: " + name + ", 나이: " + age + "세";

// Template Literal — 백틱과 ${} 사용
const msg2 = `이름: ${name}, 나이: ${age}세`;

// 표현식 삽입 가능
const msg3 = `내년 나이: ${age + 1}세`;

// 여러 줄 문자열
const html = `
  <div>
    <h1>${name}</h1>
    <p>${age}세</p>
  </div>
`;

// 함수 호출도 가능
const msg4 = `대문자: ${name.toUpperCase()}`;
```

**React에서의 활용:**

```jsx
// 동적 className 조합
<div className={`card card-${variant} ${isActive ? 'active' : ''}`}>

// 동적 스타일 문자열
<img src={`/images/${userId}/avatar.png`} alt={`${userName}의 프로필`} />

// 조건부 문자열 생성
const label = `${count}개의 항목${count > 10 ? ' (많음)' : ''}`;
```

### 3.6 삼항 연산자와 논리 연산자

#### 삼항 연산자 (Ternary Operator)

```javascript
// 기본 형태: 조건 ? 참일 때 : 거짓일 때
const message = isLoggedIn ? "환영합니다" : "로그인하세요";

// 중첩 삼항 — 가독성이 떨어지므로 주의
const label =
  status === "loading"
    ? "로딩 중..."
    : status === "error"
      ? "오류 발생"
      : "완료";
// → 복잡해지면 if/else 또는 별도 함수로 분리하는 것이 낫다
```

#### 논리 연산자의 단축 평가 (Short-circuit Evaluation)

```javascript
// AND (&&) — 왼쪽이 falsy면 왼쪽 반환, truthy면 오른쪽 반환
true && "hello"; // 'hello'
false && "hello"; // false
0 && "hello"; // 0
"" && "hello"; // ''
null && "hello"; // null

// OR (||) — 왼쪽이 truthy면 왼쪽 반환, falsy면 오른쪽 반환
"hello" || "default"; // 'hello'
"" || "default"; // 'default'
0 || 42; // 42
null || "fallback"; // 'fallback'
```

#### Truthy와 Falsy 값

```
Falsy 값 (boolean 변환 시 false)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  false, 0, -0, 0n, '', "", ``, null, undefined, NaN

Truthy 값 (나머지 전부)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  true, 1, -1, 'hello', ' ', [], {}, function() {}

  ⚠️ 주의: 빈 배열 [] 과 빈 객체 {} 는 truthy이다!
```

**React 조건부 렌더링에서의 함정:**

```jsx
// ✅ 의도대로 동작
{
  isLoggedIn && <UserMenu />;
}
// isLoggedIn=true  → <UserMenu /> 렌더링
// isLoggedIn=false → 아무것도 렌더링하지 않음

// ❌ 위험: 숫자 0이 화면에 표시됨!
{
  count && <p>{count}개의 항목</p>;
}
// count=5 → <p>5개의 항목</p> 렌더링
// count=0 → 0이 화면에 그대로 출력됨! (React는 0을 렌더링한다)

// ✅ 해결: 명시적으로 boolean 변환
{
  count > 0 && <p>{count}개의 항목</p>;
}
// 또는
{
  !!count && <p>{count}개의 항목</p>;
}
```

> 💡 **핵심 규칙:** React에서 `&&` 조건부 렌더링을 할 때, 왼쪽 피연산자가 **숫자 0, 빈 문자열**이 될 가능성이 있다면 명시적으로 boolean으로 변환해야 한다. `false`, `null`, `undefined`는 React가 아무것도 렌더링하지 않지만, `0`과 `''`은 **화면에 출력된다**.

### 3.7 배열 고차 함수

React에서 리스트를 렌더링하고, State를 불변하게 업데이트할 때 핵심적으로 사용하는 메서드들이다.

#### map — 변환 (가장 중요)

```javascript
// 각 요소를 변환하여 새 배열 반환
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);
// [2, 4, 6, 8, 10]

// 원본은 변경되지 않음
console.log(numbers); // [1, 2, 3, 4, 5]
```

**React에서의 활용 — 리스트 렌더링:**

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

#### filter — 선별

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter((n) => n % 2 === 0);
// [2, 4, 6]
```

**React에서의 활용 — 삭제, 필터링:**

```jsx
// 항목 삭제
setTodos((prev) => prev.filter((todo) => todo.id !== targetId));

// 조건부 표시
const activeTodos = todos.filter((todo) => !todo.done);
```

#### reduce — 축약

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((accumulator, current) => accumulator + current, 0);
// 15

// 객체로 변환
const items = [
  { id: 1, category: "A" },
  { id: 2, category: "B" },
  { id: 3, category: "A" },
];

const grouped = items.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});
// { A: [{id:1, ...}, {id:3, ...}], B: [{id:2, ...}] }
```

#### find / findIndex — 검색

```javascript
const users = [
  { id: 1, name: "홍길동" },
  { id: 2, name: "김철수" },
  { id: 3, name: "박영희" },
];

const user = users.find((u) => u.id === 2);
// { id: 2, name: '김철수' }

const index = users.findIndex((u) => u.id === 2);
// 1
```

#### some / every — 존재 확인

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.some((n) => n > 3); // true  (하나라도 만족하면 true)
numbers.every((n) => n > 0); // true  (모두 만족해야 true)
numbers.every((n) => n > 3); // false
```

#### 메서드 체이닝

```javascript
const products = [
  { name: "노트북", price: 1200000, inStock: true },
  { name: "키보드", price: 85000, inStock: true },
  { name: "마우스", price: 45000, inStock: false },
  { name: "모니터", price: 350000, inStock: true },
];

// 재고 있는 상품만 → 가격순 정렬 → 이름만 추출
const result = products
  .filter((p) => p.inStock)
  .sort((a, b) => a.price - b.price) // ⚠️ sort는 원본 변경하므로 filter 뒤에 사용
  .map((p) => p.name);

// ['키보드', '모니터', '노트북']
```

#### 안전한 배열 메서드 분류 (React State 기준)

```
┌──────────────────────────────────────────────────────┐
│          React State에서의 배열 메서드 안전성           │
├──────────────────┬───────────────────────────────────┤
│  ✅ 새 배열 반환   │  ❌ 원본 변경 (주의!)              │
│  (안전)           │  (직접 사용 금지)                  │
├──────────────────┼───────────────────────────────────┤
│  map()           │  push(), pop()                    │
│  filter()        │  shift(), unshift()               │
│  slice()         │  splice()                         │
│  concat()        │  sort() — [...arr].sort()로 우회  │
│  flat()          │  reverse() — [...arr].reverse()   │
│  toSorted() ★    │  fill()                           │
│  toReversed() ★  │  arr[i] = x — map()으로 우회      │
│  toSpliced() ★   │                                   │
├──────────────────┴───────────────────────────────────┤
│  ★ ES2023 메서드 — 원본을 변경하지 않는 새 버전        │
│    .sort()     → .toSorted()                         │
│    .reverse()  → .toReversed()                       │
│    .splice()   → .toSpliced()                        │
└──────────────────────────────────────────────────────┘
```

### 3.8 ES Module (import / export)

#### Named Export / Import

```javascript
// utils.js — 여러 개를 내보내기
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// App.jsx — 가져오기 (이름이 정확히 일치해야 함)
import { PI, add, multiply } from "./utils.js";

// 별칭(alias) 사용
import { add as sum } from "./utils.js";

// 전체를 네임스페이스로 가져오기
import * as MathUtils from "./utils.js";
MathUtils.add(1, 2);
```

#### Default Export / Import

```javascript
// Button.jsx — 파일당 하나의 기본 내보내기
export default function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// App.jsx — 가져올 때 이름을 자유롭게 지정 가능
import Button from "./Button.jsx";
import MyButton from "./Button.jsx"; // 다른 이름도 가능
```

#### Named vs Default 비교

```
┌──────────────┬──────────────────────┬──────────────────────┐
│              │  Named Export        │  Default Export       │
├──────────────┼──────────────────────┼──────────────────────┤
│ 파일당 개수   │ 여러 개 가능         │ 최대 1개              │
│ import 형태  │ { name } 중괄호 필수  │ 중괄호 없이 자유 이름  │
│ 이름 일치    │ 반드시 일치           │ 자유롭게 지정          │
│ IDE 지원     │ 자동 완성 용이        │ 이름 추적 어려움       │
│ 일반적 사용   │ 유틸 함수, 상수, 타입 │ 컴포넌트, 클래스       │
└──────────────┴──────────────────────┴──────────────────────┘
```

**React 관례:**

```
· 컴포넌트 파일: default export (파일 1개 = 컴포넌트 1개)
· Hook 파일: named export (useXxx 형태)
· 유틸리티 파일: named export (여러 함수)
· 상수/타입 파일: named export
```

#### 동적 import (Dynamic Import)

```javascript
// 정적 import — 빌드 타임에 결정, 파일 최상단
import { add } from "./utils.js";

// 동적 import — 런타임에 필요할 때 로드, Promise 반환
const module = await import("./utils.js");
module.add(1, 2);

// React에서의 활용 — 코드 분할 (Step 30에서 상세 학습)
const LazyComponent = React.lazy(() => import("./HeavyComponent.jsx"));
```

### 3.9 Optional Chaining과 Nullish Coalescing

#### Optional Chaining (`?.`)

```javascript
const user = {
  name: "홍길동",
  address: {
    city: "서울",
  },
};

// ❌ 중첩 객체 접근 시 오류 위험
const zip = user.address.zipCode.value;
// TypeError: Cannot read properties of undefined

// ❌ 기존 방어 코드 — 장황함
const zip =
  user && user.address && user.address.zipCode && user.address.zipCode.value;

// ✅ Optional Chaining — 간결하고 안전
const zip = user?.address?.zipCode?.value;
// undefined (에러 없이 안전하게 undefined 반환)

// 메서드 호출에도 사용 가능
const length = user?.getName?.();
// user에 getName 메서드가 없으면 undefined

// 배열 접근에도 사용 가능
const first = arr?.[0];
```

#### Nullish Coalescing (`??`)

```javascript
// ?? — null 또는 undefined일 때만 기본값 적용
const value1 = null ?? "default"; // 'default'
const value2 = undefined ?? "default"; // 'default'
const value3 = 0 ?? "default"; // 0 (0은 null/undefined가 아님!)
const value4 = "" ?? "default"; // '' (빈 문자열도 아님!)
const value5 = false ?? "default"; // false

// || 와의 차이 — ||는 모든 falsy 값에 반응
const value6 = 0 || "default"; // 'default' (0이 falsy이므로)
const value7 = "" || "default"; // 'default' (빈 문자열이 falsy이므로)
```

```
?? vs || 비교

  null ?? 'fb'      → 'fb'        null || 'fb'      → 'fb'
  undefined ?? 'fb' → 'fb'        undefined || 'fb' → 'fb'
  0 ?? 'fb'         → 0     ★     0 || 'fb'         → 'fb'    ★
  '' ?? 'fb'        → ''    ★     '' || 'fb'        → 'fb'    ★
  false ?? 'fb'     → false  ★    false || 'fb'     → 'fb'    ★

  → 0, '', false가 유효한 값일 때는 ?? 를 사용해야 한다
```

**React에서의 활용:**

```jsx
// API 응답 데이터의 안전한 접근
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user?.name ?? "이름 없음"}</h1>
      <p>{user?.address?.city ?? "주소 미등록"}</p>
      <p>게시글: {user?.posts?.length ?? 0}개</p>
    </div>
  );
}
```

### 3.10 Promise와 async/await

#### Promise의 개념

```javascript
// Promise는 비동기 작업의 "미래의 결과"를 나타내는 객체

const promise = fetch("https://api.example.com/users");
// fetch()는 즉시 Promise를 반환한다
// 실제 응답은 나중에 도착한다

// Promise의 3가지 상태
// ┌─────────┐     성공     ┌───────────┐
// │ Pending │ ──────────→ │ Fulfilled │ → .then(data => ...)
// │ (대기)   │             └───────────┘
// │         │     실패     ┌───────────┐
// │         │ ──────────→ │ Rejected  │ → .catch(err => ...)
// └─────────┘             └───────────┘
```

#### then/catch 체이닝

```javascript
fetch("https://api.example.com/users")
  .then((response) => response.json()) // 응답을 JSON으로 파싱
  .then((data) => {
    console.log(data); // 데이터 사용
  })
  .catch((error) => {
    console.error("에러 발생:", error); // 에러 처리
  })
  .finally(() => {
    console.log("요청 완료"); // 항상 실행
  });
```

#### async/await — 동기 코드처럼 작성

```javascript
// async 함수 안에서 await를 사용하여 Promise 결과를 기다린다
async function fetchUsers() {
  try {
    const response = await fetch("https://api.example.com/users");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("에러 발생:", error);
  } finally {
    console.log("요청 완료");
  }
}

// async 함수는 항상 Promise를 반환한다
const result = fetchUsers(); // Promise
```

#### 주의: await는 async 함수 안에서만 사용 가능

```javascript
// ❌ 일반 함수에서 await 사용 불가
function getData() {
  const data = await fetch('/api');  // SyntaxError!
}

// ✅ async 함수에서 사용
async function getData() {
  const data = await fetch('/api');  // OK
}

// ✅ 화살표 함수도 async 가능
const getData = async () => {
  const data = await fetch('/api');
};
```

**React에서의 활용 — useEffect 내부:**

```jsx
// ⚠️ useEffect의 콜백 자체는 async가 될 수 없다
// useEffect는 cleanup 함수(또는 undefined)를 반환해야 하는데
// async 함수는 Promise를 반환하기 때문이다

// ❌ 잘못된 사용
useEffect(async () => {
  // async 콜백 — React가 경고!
  const data = await fetch("/api");
}, []);

// ✅ 올바른 사용 — 내부에 async 함수를 정의하고 호출
useEffect(() => {
  async function fetchData() {
    const response = await fetch("/api");
    const data = await response.json();
    setUsers(data);
  }
  fetchData();
}, []);

// ✅ 또는 IIFE (즉시 실행 함수) 패턴
useEffect(() => {
  (async () => {
    const response = await fetch("/api");
    const data = await response.json();
    setUsers(data);
  })();
}, []);
```

### 3.11 Closure (클로저)

#### 개념

클로저는 **함수가 선언된 환경(렉시컬 스코프)의 변수를 기억하는 메커니즘**이다.

```javascript
function createCounter(initial) {
  let count = initial; // 외부 함수의 지역 변수

  return {
    increment: () => {
      count++; // 외부 변수 count를 기억하고 접근
      return count;
    },
    getCount: () => count,
  };
}

const counter = createCounter(0);
counter.increment(); // 1
counter.increment(); // 2
counter.getCount(); // 2

// createCounter 함수는 이미 실행이 끝났지만
// 반환된 함수들은 count 변수를 여전히 "기억"하고 있다
```

#### React에서 클로저가 중요한 이유

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  //                                  ↑
  // 매 렌더링마다 count는 새 값이지만
  // 이벤트 핸들러는 자신이 생성된 렌더링 시점의 count를 "기억"한다

  const handleClick = () => {
    // 이 함수는 생성 시점의 count 값을 클로저로 캡처한다
    console.log(count); // 항상 "이 렌더링"의 count
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

> 💡 클로저는 React Hook의 동작 원리와 직결된다. **Stale Closure 문제**(Step 6)와 **useEffect 의존성 배열**(Step 11)을 이해하려면 클로저 개념이 필수적이다.

---

## 4. 사례 연구와 예시

### 4.1 사례: 실제 React 컴포넌트에서 ES6+ 문법 식별

실무에서 볼 수 있는 전형적인 React 컴포넌트를 분석하여 각 줄에 사용된 ES6+ 문법을 식별한다.

```jsx
import { useState, useEffect } from "react"; // ① Named Import

const UserList = ({ initialFilter = "all" }) => {
  // ② 화살표 함수, 객체 Destructuring, Default
  const [users, setUsers] = useState([]); // ③ 배열 Destructuring, const
  const [filter, setFilter] = useState(initialFilter); // ④ 배열 Destructuring
  const [isLoading, setIsLoading] = useState(false); // ⑤ 배열 Destructuring

  useEffect(() => {
    // ⑥ 화살표 함수 (콜백)
    const fetchUsers = async () => {
      // ⑦ async 화살표 함수, const
      setIsLoading(true);
      try {
        const response = await fetch("/api/users"); // ⑧ await, const, Template Literal 가능
        const data = await response.json(); // ⑨ await
        setUsers(data);
      } catch (error) {
        console.error(`사용자 로드 실패: ${error.message}`); // ⑩ Template Literal
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (
      user, // ⑪ 배열 filter, 화살표 콜백
    ) => (filter === "all" ? true : user.role === filter), // ⑫ 삼항 연산자
  );

  return (
    <div>
      {isLoading && <p>로딩 중...</p>} {/* ⑬ && 단축 평가 */}
      {!isLoading && filteredUsers.length === 0 /* ⑭ && 체이닝 */ && (
        <p>사용자가 없습니다.</p>
      )}
      <ul>
        {filteredUsers.map((user /* ⑮ 배열 map, 화살표 콜백 */) => (
          <li key={user.id}>
            {user?.name ?? "이름 없음"}{" "}
            {/* ⑯ Optional Chaining, Nullish Coalescing */}
            <span>{` (${user.role})`}</span> {/* ⑰ Template Literal */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList; // ⑱ Default Export
```

**문법 사용 빈도 분석:**

```
이 컴포넌트 하나에서 사용된 ES6+ 문법:

  const             — 7회
  화살표 함수        — 5회
  배열 Destructuring — 3회
  객체 Destructuring — 1회
  Template Literal   — 2회
  async/await        — 2회
  배열 고차 함수     — 2회 (filter, map)
  && 단축 평가       — 2회
  삼항 연산자        — 1회
  Optional Chaining  — 1회
  Nullish Coalescing — 1회
  ES Module          — 2회 (import, export)

  → "React 문법"은 JSX 태그뿐. 나머지는 전부 JavaScript이다.
```

### 4.2 사례: Immutable 패턴과 Spread 연산자

State 업데이트에서 Spread 연산자가 어떻게 활용되는지, 실제 CRUD 패턴을 분석한다.

```javascript
// 초기 State
const todos = [
  { id: 1, text: "React 학습", done: false },
  { id: 2, text: "JS 복습", done: true },
  { id: 3, text: "운동하기", done: false },
];

// CREATE — 새 항목 추가
const afterAdd = [...todos, { id: 4, text: "독서", done: false }];

// READ — filter로 조건 검색
const activeTodos = todos.filter((t) => !t.done);

// UPDATE — 특정 항목의 속성 변경
const afterToggle = todos.map((t) =>
  t.id === 2 ? { ...t, done: !t.done } : t,
);

// DELETE — 특정 항목 제거
const afterDelete = todos.filter((t) => t.id !== 3);

// 모든 작업에서 원본 todos는 변경되지 않는다
// 항상 새로운 배열이 생성된다
```

### 4.3 사례: ||와 ??의 선택이 버그를 만드는 경우

```javascript
// 사용자 설정에서 폰트 크기를 가져온다
const userSettings = { fontSize: 0, theme: "", notifications: false };

// ❌ || 사용 — 0, '', false가 모두 무시됨
const fontSize = userSettings.fontSize || 16;
// 기대: 0 (사용자가 설정한 값)
// 실제: 16 (0이 falsy라서 기본값 적용!)

const theme = userSettings.theme || "dark";
// 기대: '' (사용자가 빈 문자열을 의도적으로 설정)
// 실제: 'dark'

// ✅ ?? 사용 — null/undefined만 기본값으로 대체
const fontSize = userSettings.fontSize ?? 16; // 0
const theme = userSettings.theme ?? "dark"; // ''
const notif = userSettings.notifications ?? true; // false
```

---

## 5. 실습

> 🔗 [StackBlitz에서 JavaScript 실습](https://stackblitz.com/edit/js-playground) — 설치 없이 브라우저에서 바로 실습할 수 있습니다.

### 실습 1: Destructuring 연습 [Applying]

**목표:** 다양한 데이터 구조에서 Destructuring을 적용한다.

아래 코드의 주석에 지시된 대로 Destructuring을 사용하여 변수를 추출하라.

```javascript
// 주어진 데이터
const response = {
  status: 200,
  data: {
    user: {
      id: 42,
      name: "홍길동",
      contacts: {
        email: "hong@example.com",
        phone: "010-1234-5678",
      },
    },
    posts: [
      { id: 1, title: "첫 번째 글", likes: 10 },
      { id: 2, title: "두 번째 글", likes: 25 },
      { id: 3, title: "세 번째 글", likes: 7 },
    ],
  },
};

// 과제 1: status와 data를 추출하라

// 과제 2: user 객체에서 id, name을 추출하라 (중첩 Destructuring)

// 과제 3: contacts에서 email만 추출하라

// 과제 4: posts 배열에서 첫 번째와 나머지를 분리하라 (Rest)

// 과제 5: 아래 함수의 매개변수에 Destructuring을 적용하라
function displayUser(user) {
  return `${user.name} (${user.contacts.email})`;
}
```

**자가 확인:** 각 과제에서 추출된 변수의 값을 `console.log`로 출력하여 확인한다.

---

### 실습 2: 배열 고차 함수로 데이터 변환 [Applying · Analyzing]

**목표:** map, filter, reduce를 조합하여 데이터를 변환한다.

```javascript
const students = [
  { name: "김철수", scores: [85, 92, 78], grade: "A" },
  { name: "이영희", scores: [95, 88, 91], grade: "A" },
  { name: "박민수", scores: [60, 55, 70], grade: "C" },
  { name: "정수진", scores: [72, 80, 68], grade: "B" },
  { name: "한지민", scores: [90, 95, 88], grade: "A" },
];

// 과제 1: 각 학생의 평균 점수를 포함하는 새 배열을 만들어라
//   → [{ name: '김철수', average: 85 }, ...]

// 과제 2: 평균 점수가 80 이상인 학생만 필터링하라

// 과제 3: 전체 학생의 평균 점수를 계산하라 (reduce 사용)

// 과제 4: grade별로 학생을 그룹화하라
//   → { A: ['김철수', '이영희', '한지민'], B: ['정수진'], C: ['박민수'] }

// 과제 5: 과제 1~2를 메서드 체이닝 한 줄로 작성하라
```

**자가 확인:** 각 결과를 `console.log`로 출력하고, 원본 `students` 배열이 변경되지 않았는지 확인한다.

---

### 실습 3: 비동기 코드 실행 순서 추적 [Analyzing]

**목표:** Promise와 async/await의 실행 순서를 정확히 예측한다.

아래 코드의 `console.log` 출력 순서를 **실행하기 전에** 종이에 적고, 실행 후 결과와 비교하라.

```javascript
// 문제 1
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// 문제 2
async function example() {
  console.log("A");

  const result = await Promise.resolve("B");
  console.log(result);

  console.log("C");
}

console.log("D");
example();
console.log("E");
```

**힌트:**

- JavaScript의 이벤트 루프에서 **마이크로태스크(Promise)**가 **매크로태스크(setTimeout)**보다 먼저 처리된다
- `await` 이후의 코드는 마이크로태스크 큐에 들어간다

---

### 실습 4 (선택): React 코드 읽기 연습 [Analyzing]

**목표:** 실제 React 코드에서 사용된 JS 문법을 식별하고 동작을 예측한다.

아래 코드에서 사용된 ES6+ 문법을 모두 찾아 목록으로 만들고, `handleAdd`를 호출했을 때 State가 어떻게 변하는지 추적하라.

```jsx
import { useState } from "react";

const ShoppingCart = ({ tax = 0.1 }) => {
  const [items, setItems] = useState([]);

  const handleAdd = (name, price) => {
    setItems((prev) => [...prev, { id: Date.now(), name, price, quantity: 1 }]);
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = items.reduce(
    (sum, { price, quantity }) => sum + price * quantity,
    0,
  );

  const totalWithTax = total * (1 + tax);

  return (
    <div>
      <p>{`소계: ${total.toLocaleString()}원`}</p>
      <p>{`세금 포함: ${totalWithTax.toLocaleString()}원`}</p>
      {items.length === 0 && <p>장바구니가 비어있습니다.</p>}
      <ul>
        {items.map(({ id, name, price }) => (
          <li key={id}>
            {`${name} — ${price.toLocaleString()}원`}
            <button onClick={() => handleRemove(id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingCart;
```

**작성할 것:**

- 사용된 ES6+ 문법 목록 (최소 10개 이상 찾을 수 있다)
- `handleAdd('노트북', 1200000)` 호출 후 `items` State의 예상 값
- `total`과 `totalWithTax`의 계산 과정 추적

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 2 핵심 요약                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. const를 기본으로, 재할당 시 let을, var는 사용하지 않는다    │
│     → const의 불변은 바인딩 불변이지 값 불변이 아니다           │
│                                                               │
│  2. 화살표 함수는 Lexical this를 가진다                        │
│     → 이벤트 핸들러, 콜백에서 안전하게 사용 가능                │
│     → React 함수 컴포넌트에서 this는 거의 사용하지 않음         │
│                                                               │
│  3. Destructuring은 React의 일상 문법이다                     │
│     → Props 수신 (객체), useState (배열)                      │
│     → 기본값, Rest 패턴과 결합하여 유연한 컴포넌트 설계         │
│                                                               │
│  4. Spread는 Immutable 업데이트의 핵심 도구이다                │
│     → State 업데이트: { ...prev, changed: value }             │
│     → 배열 추가: [...prev, newItem]                           │
│     → Props 전달: <Button {...props} />                       │
│                                                               │
│  5. 배열 고차 함수가 리스트 렌더링과 State 업데이트를 담당한다   │
│     → map: 리스트 렌더링, 항목 수정                            │
│     → filter: 항목 삭제, 조건부 표시                           │
│     → reduce: 집계, 그룹화                                    │
│     → 원본을 변경하는 메서드(push, sort 등)는 주의             │
│                                                               │
│  6. Optional Chaining(?.)과 Nullish Coalescing(??)으로        │
│     API 데이터를 안전하게 처리한다                              │
│     → ?? 는 null/undefined만, || 는 모든 falsy를 대체         │
│                                                               │
│  7. async/await로 비동기 코드를 작성하되,                      │
│     useEffect에서의 사용 패턴을 기억한다                       │
│     → useEffect 콜백 자체는 async가 될 수 없다                 │
│                                                               │
│  8. 클로저는 Hook의 동작 원리이다                              │
│     → 각 렌더링의 값을 기억하는 메커니즘                       │
│     → Stale Closure 문제의 근원 (Step 6에서 학습)              │
│                                                               │
│  9. && 조건부 렌더링에서 0과 빈 문자열에 주의한다               │
│     → 0은 React가 화면에 출력한다                              │
│     → count > 0 && ... 또는 !!count && ... 사용               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                | 확인할 섹션 |
| --- | ------------------------------------------------------------------- | ----------- | ------------------------------------- | --- |
| 1   | `const obj = {}; obj.a = 1;`이 에러 없이 동작하는 이유는?           | 3.1         |
| 2   | 화살표 함수와 일반 함수의 `this` 바인딩 차이를 한 문장으로 설명하라 | 3.2         |
| 3   | `useState`가 객체가 아닌 배열을 반환하는 이유는?                    | 3.3         |
| 4   | `...`이 Spread인지 Rest인지 어떻게 구분하는가?                      | 3.4         |
| 5   | `{count && <p>결과</p>}`에서 count=0일 때 무엇이 렌더링되는가?      | 3.6         |
| 6   | `0                                                                  |             | 42`와 `0 ?? 42`의 결과가 다른 이유는? | 3.9 |
| 7   | `useEffect(async () => {}, [])`가 잘못된 이유는?                    | 3.10        |
| 8   | `.sort()`를 React State에서 직접 사용하면 안 되는 이유는?           | 3.7         |

---

### 6.3 자주 묻는 질문 (FAQ)

**Q1: 화살표 함수와 일반 함수 중 어떤 것을 사용해야 하나요?**

React에서는 둘 다 사용할 수 있습니다. 컴포넌트 정의에는 `function` 선언과 화살표 함수 모두 허용되며, 팀의 컨벤션을 따르면 됩니다. 이벤트 핸들러와 콜백 함수에서는 화살표 함수가 관습적으로 선호됩니다. 핵심은 `this` 바인딩 차이를 이해하는 것이지만, React 함수 컴포넌트에서는 `this`를 사용하지 않으므로 실질적 차이는 크지 않습니다.

**Q2: `??`와 `||`는 언제 구분해서 사용하나요?**

`0`, `''`(빈 문자열), `false`가 유효한 값일 때는 `??`를 사용합니다. 예를 들어 사용자가 설정한 폰트 크기가 0일 때 `fontSize || 16`은 0을 무시하고 16을 반환하지만, `fontSize ?? 16`은 0을 그대로 유지합니다. Props 기본값이나 API 응답 처리에서 이 구분이 중요합니다.

**Q3: `map`, `filter`, `reduce` 중 가장 중요한 것은?**

React에서 가장 많이 사용되는 것은 `map`입니다. 리스트 렌더링이 거의 모든 React 애플리케이션에 존재하기 때문입니다. `filter`는 삭제와 조건부 표시에, `reduce`는 집계 계산에 사용됩니다. 세 가지 모두 중요하지만, `map`을 가장 먼저 숙달하세요.

**Q4: `useEffect` 안에서 왜 `async` 콜백을 직접 사용할 수 없나요?**

`useEffect`의 콜백은 cleanup 함수(또는 `undefined`)를 반환해야 합니다. `async` 함수는 항상 Promise를 반환하므로 이 규칙과 충돌합니다. 해결책은 내부에 `async` 함수를 정의하고 즉시 호출하는 것입니다: `useEffect(() => { async function fetchData() { ... } fetchData(); }, [])`.

---

## 7. 다음 단계 예고

> **Step 3. React 생태계 조감도**
>
> - SPA(Single Page Application)의 개념과 동작 원리
> - React의 위치: 라이브러리 vs 프레임워크 논쟁
> - React 생태계 지도: 라우팅, 상태 관리, 스타일링, 테스트
> - 주요 메타 프레임워크(Next.js, Remix) 개요
> - 학습 경로에서 각 도구를 만나는 시점

---

## 📚 참고 자료

- [MDN — JavaScript Reference](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference)
- [JavaScript.info — 모던 JavaScript 튜토리얼](https://ko.javascript.info/)
- [MDN — Destructuring Assignment](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN — Spread Syntax](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN — Optional Chaining](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN — Nullish Coalescing Operator](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

---

> **React 완성 로드맵 v2.0** | Phase 0 — 개발 환경과 생태계 이해 | Step 2 of 42
