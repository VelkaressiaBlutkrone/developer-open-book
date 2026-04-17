# Step 22. REST API 통합과 데이터 패칭 패턴

> **난이도:** 🔴 고급 (Advanced)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Remember**   | REST API의 기본 원칙(리소스, HTTP 메서드, 상태 코드)을 기술할 수 있다                      |
| **Understand** | fetch API와 Axios의 차이를 설명하고 각각의 적합한 상황을 설명할 수 있다                    |
| **Understand** | React에서 데이터 패칭 시 관리해야 하는 상태(loading/error/data)의 구조를 설명할 수 있다    |
| **Apply**      | fetch/Axios로 CRUD API를 호출하고 응답을 State에 반영하는 코드를 구현할 수 있다            |
| **Analyze**    | Race Condition, Waterfall, 캐싱 부재 등 수동 패칭의 한계를 분석할 수 있다                  |
| **Evaluate**   | "왜 TanStack Query 같은 라이브러리가 필요한가"를 수동 패칭의 문제점으로부터 판단할 수 있다 |

**전제 지식:**

- Step 6: useState, Immutable 업데이트
- Step 11: useEffect, Cleanup, AbortController, async 패턴
- Step 13: useReducer (복합 State 관리)
- Step 16: Custom Hook (useFetch 등)

---

## 1. 서론 — 프론트엔드와 서버의 대화

### 1.1 웹 API의 역사와 REST의 등장

인터넷 초창기의 웹 애플리케이션은 서버가 HTML을 완성해서 브라우저에 전달하는 구조였다. 사용자가 버튼을 클릭하면 브라우저는 새 페이지를 서버에 요청했고, 서버는 완성된 HTML을 응답으로 돌려보냈다. 이 방식은 단순하지만 사용자 경험이 매우 나빴다. 페이지 전체가 새로고침되어야 하기 때문에 조그만 데이터 변경에도 화면 전체가 깜빡였다.

2000년대 초 Ajax(Asynchronous JavaScript and XML) 기술의 등장으로 상황이 바뀌었다. 이제 브라우저는 페이지를 새로고침하지 않고 서버와 데이터만 주고받을 수 있게 되었다. 하지만 초기에는 API 설계 방식에 표준이 없었다. 각 서버마다 제각각의 URL 구조와 데이터 형식을 사용했다.

2000년에 Roy Fielding이 박사 논문에서 REST(Representational State Transfer) 아키텍처 스타일을 제안했다. REST는 "리소스를 URL로 식별하고 HTTP 메서드로 조작한다"는 원칙을 통해 API 설계에 일관성을 부여했다. 오늘날 수천만 개의 API가 REST 원칙을 따르며, 현대 웹 개발자라면 REST API와의 통신을 피해갈 수 없다.

### 1.2 React 생태계에서 데이터 패칭이 특별한 이유

React는 **UI 라이브러리**이다. 컴포넌트를 렌더링하고 업데이트하는 것이 React의 핵심 역할이며, 데이터를 가져오고, 캐싱하고, 동기화하는 것은 React의 범위 밖이다. 그러나 거의 모든 애플리케이션이 서버 데이터를 필요로 하기 때문에, **데이터 패칭은 React 개발의 가장 큰 도전 중 하나**가 되었다.

React가 데이터 패칭에 대한 내장 솔루션을 제공하지 않는다는 사실은 개발자들에게 자유와 혼란을 동시에 가져다주었다. 자유로운 만큼 "어떻게 패칭할 것인가"에 대한 결정을 매번 내려야 했고, 팀마다 서로 다른 패턴이 생겨났다. React 커뮤니티는 수년간 이 문제와 씨름하면서 다양한 패턴과 라이브러리를 발전시켰으며, 그 과정에서 "수동 패칭의 한계"가 명확히 드러났다.

```
React가 제공하지 않는 것:
  · 데이터 패칭 메커니즘 (fetch는 브라우저 API)
  · 캐싱 (같은 데이터를 반복 요청하지 않기)
  · 자동 리패칭 (데이터가 변경되었을 때 갱신)
  · 낙관적 업데이트 (서버 응답 전 UI 미리 반영)
  · 무한 스크롤 / 페이지네이션 추상화
  · 요청 중복 제거

React가 제공하는 것:
  · useState/useReducer로 패칭 상태 관리
  · useEffect로 패칭 시점 제어
  · Suspense + use()로 선언적 패칭 (React 19)
  · RSC에서 async/await 직접 패칭 (Step 20~21)
```

### 1.3 산업적 맥락 — 데이터 패칭 패턴의 진화

대규모 서비스를 운영하는 기업들은 데이터 패칭 문제를 직접 겪으면서 솔루션을 만들어냈다. Facebook(현 Meta)은 GraphQL을 개발하여 클라이언트가 필요한 데이터를 정확히 요청할 수 있게 했다. Netflix는 SSR(서버 사이드 렌더링)을 통해 초기 로딩 속도를 개선했다. 그리고 수많은 개발팀이 비슷한 수동 패칭 코드를 반복 작성하는 문제를 겪은 끝에, TanStack Query(구 React Query)와 SWR 같은 전문 라이브러리가 탄생했다.

이 Step은 그 발전 과정의 첫 단계, 즉 "수동 패칭"을 철저히 다룬 뒤 그 한계를 인식하는 것에 집중한다. 수동 패칭의 고통을 직접 경험해야만 라이브러리가 왜 존재하는지, 어떤 문제를 해결하는지 진정으로 이해할 수 있다.

### 1.4 이 Step의 위치와 개념 지도

```
이 Step은 "수동 패칭"을 철저히 다룬 뒤,
그 한계를 인식하여 Step 23(TanStack Query)으로 자연스럽게 연결한다.

  Step 22: "직접 해보고 문제를 체감한다" (이 Step)
  Step 23: "라이브러리가 그 문제를 어떻게 해결하는가" (다음 Step)
```


![Step 22 개념 지도](/developer-open-book/diagrams/react-step22-step-22-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step22-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 REST의 탄생 배경과 철학

REST는 단순한 기술 명세가 아니라 아키텍처 스타일, 즉 설계 철학이다. Roy Fielding은 웹이 왜 이토록 잘 확장되는지를 분석하면서 그 핵심 원칙들을 추출했다. HTTP 프로토콜 자체가 REST 원칙에 따라 설계되었기 때문에, REST API는 HTTP를 올바르게 사용하는 것과 다르지 않다.

REST의 핵심은 **리소스 중심 설계**다. 시스템이 관리하는 모든 것을 "리소스"로 바라보고, 각 리소스에 고유한 URL 주소를 부여한다. 그리고 그 리소스에 대한 작업은 HTTP 메서드(GET, POST, PUT, DELETE)로 표현한다. 이 단순한 원칙이 수천만 개의 API를 일관된 방식으로 설계하게 만들었다.

REST가 산업 표준이 된 데는 단순함이 큰 역할을 했다. SOAP 같은 이전 프로토콜은 복잡한 XML 봉투와 엄격한 명세가 필요했지만, REST는 HTTP와 JSON만 알면 시작할 수 있었다. "무상태(Stateless)" 원칙 덕분에 서버가 클라이언트 상태를 기억하지 않아도 되어, 로드밸런싱과 수평 확장이 쉬워졌다.

### 2.2 핵심 용어 사전

| 용어                 | 정의                                                                                                    | 왜 중요한가                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **REST**             | Representational State Transfer. **리소스를 URL로 식별**하고 **HTTP 메서드로 조작**하는 아키텍처 스타일 | 웹 API의 사실상 표준 설계 방식이다                           |
| **리소스(Resource)** | API가 관리하는 **데이터 엔티티**. URL로 식별된다 (`/users`, `/products/42`)                             | REST의 핵심 개념. URL = 리소스의 주소                        |
| **HTTP 메서드**      | 리소스에 대한 **동작의 종류**. GET(조회), POST(생성), PUT/PATCH(수정), DELETE(삭제)                     | CRUD 작업과 1:1 대응한다                                     |
| **상태 코드**        | 서버 응답의 **결과를 숫자로 표현**. 2xx(성공), 4xx(클라이언트 에러), 5xx(서버 에러)                     | 에러 처리의 기준이 된다                                      |
| **fetch API**        | 브라우저 내장 **네트워크 요청 API**. Promise 기반                                                       | 별도 설치 없이 사용 가능한 표준 API                          |
| **Axios**            | Promise 기반 **HTTP 클라이언트 라이브러리**. fetch를 감싸 편의 기능을 추가                              | 인터셉터, 자동 JSON 변환 등 DX 향상                          |
| **Server State**     | **서버에 저장**되어 있고 클라이언트가 복사본(캐시)을 가지는 데이터. 비동기적으로 소유권이 서버에 있다   | Client State(useState)와 근본적으로 다른 성격의 데이터       |
| **Client State**     | **클라이언트에서만 존재**하는 데이터. UI 상태, 폼 입력값 등                                             | Server State와의 구분이 아키텍처 설계의 핵심                 |
| **Race Condition**   | 여러 비동기 요청의 **완료 순서가 요청 순서와 다를 때** 발생하는 데이터 불일치 버그                      | 수동 패칭에서 가장 흔한 버그 중 하나                         |
| **Stale Data**       | **오래되어 현재 서버 상태와 다를 수 있는** 캐시 데이터                                                  | 캐싱의 핵심 문제. "언제 신선한 데이터를 다시 가져올 것인가?" |

### 2.3 Server State vs Client State — 근본적인 차이

Server State와 Client State의 구분은 단순한 용어 구분이 아니라, 아키텍처 설계 전반에 영향을 미치는 핵심 개념이다. 많은 React 초보자가 이 둘을 구분하지 않고 같은 도구(useState)로 관리하려 하다가 복잡성의 벽에 부딪힌다.

Client State는 클라이언트가 완전한 소유권을 가진다. 다크 모드 설정이나 모달 열림 상태는 클라이언트가 만들고, 읽고, 수정하고, 삭제하는 데이터다. 항상 최신 상태이며, 비동기 처리가 필요 없다. 반면 Server State는 서버가 진정한 소유자다. 클라이언트가 가진 것은 어느 시점에 가져온 복사본이며, 서버의 데이터가 변경될 수 있으므로 언제든 "오래될(stale)" 수 있다.

이 구분이 중요한 이유는 **각각에 맞는 도구가 다르기 때문**이다. Client State는 useState나 useReducer로 충분하다. Server State는 캐싱, 리패칭, 에러 재시도, 중복 제거 같은 복잡한 관리가 필요하며, 이것이 TanStack Query 같은 전문 도구가 탄생한 이유다.


![Client State                     Server State](/developer-open-book/diagrams/react-step22-client-state-server-state.svg)


### 2.4 HTTP 프로토콜의 구조 — 요청과 응답의 해부

HTTP 통신은 요청(Request)과 응답(Response) 쌍으로 이루어진다. 각각의 구조를 이해하면 fetch API와 Axios를 더 잘 활용할 수 있다.

HTTP 요청은 메서드, URL, 헤더, 바디로 구성된다. 메서드는 "무엇을 할 것인가"를 표현하고, URL은 "무엇에 대해"를 표현한다. 헤더에는 인증 정보(`Authorization`), 데이터 형식(`Content-Type`), 캐시 제어(`Cache-Control`) 같은 메타데이터가 담긴다. 바디에는 POST나 PUT 요청 시 전송하는 실제 데이터가 담긴다.

HTTP 응답은 상태 코드, 헤더, 바디로 구성된다. 상태 코드는 "요청이 어떻게 처리되었는가"를 3자리 숫자로 표현한다. 바디에는 요청한 데이터(JSON, HTML, 파일 등)가 담긴다. **fetch API의 가장 중요한 특징 중 하나는 HTTP 에러(4xx, 5xx)에서도 Promise가 reject되지 않는다는 것**이다. `response.ok`를 직접 확인해야 한다.


![HTTP 요청/응답 구조](/developer-open-book/diagrams/react-step22-http-요청-응답-구조.svg)


---

## 3. 이론과 원리

### 3.1 REST API 기초

#### 리소스와 URL 설계 원칙

REST URL 설계의 핵심은 **명사 사용**이다. URL은 동작이 아닌 리소스(명사)를 표현해야 하며, 동작은 HTTP 메서드로 표현한다. 이 원칙을 지키면 API가 직관적으로 읽힌다. `/deleteUser/42` 같은 URL은 REST 원칙에 어긋나며, 올바른 표현은 `DELETE /users/42`다.

또한 컬렉션은 복수형을 사용하고, 계층 관계는 URL 경로로 표현한다. `/users/42/posts`는 "42번 사용자의 게시글 목록"을 의미한다. 이 계층적 구조는 데이터의 소유 관계를 URL만으로 명확히 표현한다.


![REST URL 설계 원칙](/developer-open-book/diagrams/react-step22-rest-url-설계-원칙.svg)


#### HTTP 메서드와 CRUD 매핑

각 HTTP 메서드는 특정 의미를 가지며, 이는 CRUD(Create, Read, Update, Delete) 작업과 직접 대응한다. GET과 DELETE는 요청 바디가 없으며, POST와 PUT/PATCH는 요청 바디에 데이터를 담는다. PUT은 리소스 전체를 교체하고, PATCH는 일부만 수정한다는 차이가 있다.


![CRUD    │  HTTP 메서드   │  URL 예시         │  설명](/developer-open-book/diagrams/react-step22-crud-http-메서드-url-예시-설명.svg)


#### 주요 HTTP 상태 코드

상태 코드는 단순한 숫자가 아니라, 에러 처리 전략을 결정하는 핵심 정보다. 401과 403의 차이(인증 vs 권한), 404와 410의 차이(일시적 없음 vs 영구 삭제) 등을 구분하면 더 정확한 에러 메시지를 사용자에게 제공할 수 있다.


![2xx 성공:](/developer-open-book/diagrams/react-step22-2xx-성공.svg)


### 3.2 fetch API 상세

#### 기본 사용법

```javascript
// GET 요청
const response = await fetch("https://api.example.com/users");

// response 객체 확인
console.log(response.ok); // true (200~299)
console.log(response.status); // 200
console.log(response.headers); // Headers 객체

// 응답 본문 파싱 (Promise 반환 — await 필요!)
const data = await response.json(); // JSON → 객체
// const text = await response.text(); // 텍스트
// const blob = await response.blob(); // 바이너리
```

#### CRUD 구현

```javascript
// CREATE — POST
const createUser = async (userData) => {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`생성 실패: ${response.status}`);
  }

  return response.json(); // 생성된 사용자 반환
};

// READ — GET
const getUsers = async () => {
  const response = await fetch("https://api.example.com/users");

  if (!response.ok) {
    throw new Error(`조회 실패: ${response.status}`);
  }

  return response.json();
};

const getUser = async (id) => {
  const response = await fetch(`https://api.example.com/users/${id}`);

  if (!response.ok) {
    if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다");
    throw new Error(`조회 실패: ${response.status}`);
  }

  return response.json();
};

// UPDATE — PUT/PATCH
const updateUser = async (id, updates) => {
  const response = await fetch(`https://api.example.com/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error(`수정 실패: ${response.status}`);
  return response.json();
};

// DELETE
const deleteUser = async (id) => {
  const response = await fetch(`https://api.example.com/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error(`삭제 실패: ${response.status}`);
  // 204 No Content면 response.json()이 실패할 수 있음
};
```

#### fetch의 주의점


![fetch의 특이한 동작들](/developer-open-book/diagrams/react-step22-fetch의-특이한-동작들.svg)


### 3.3 Axios vs fetch 비교

Axios가 fetch보다 더 많이 쓰이는 실무적 이유는 **인터셉터** 때문이다. 모든 요청에 인증 토큰을 자동으로 붙이거나, 모든 에러를 한 곳에서 처리하려면 각 요청마다 코드를 추가해야 한다. Axios의 인터셉터는 이를 한 곳에서 처리하게 해준다. fetch로도 래퍼 함수를 만들어 비슷하게 구현할 수 있지만, Axios가 더 표준화된 방식을 제공한다.


![fetch (내장)          │  Axios (라이브러리)](/developer-open-book/diagrams/react-step22-fetch-내장-axios-라이브러리.svg)


#### Axios 기본 사용법

```javascript
import axios from "axios";

// 인스턴스 생성 — 기본 설정 공유
const api = axios.create({
  baseURL: "https://api.example.com",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10초 타임아웃
});

// 인터셉터 — 모든 요청/응답에 공통 로직 적용
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 → 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// CRUD — fetch보다 간결
const getUsers = () => api.get("/users").then((r) => r.data);
const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
const createUser = (data) => api.post("/users", data).then((r) => r.data);
const updateUser = (id, data) =>
  api.patch(`/users/${id}`, data).then((r) => r.data);
const deleteUser = (id) => api.delete(`/users/${id}`);
```

```
Axios 선택 기준

  fetch가 적합한 경우:
    · 간단한 요청 (추가 설정 불필요)
    · 번들 크기를 최소화하고 싶을 때
    · Next.js Server Component에서 (fetch 확장 활용)
    · 브라우저 표준 API를 선호할 때

  Axios가 적합한 경우:
    · 인터셉터가 필요할 때 (인증 토큰 자동 추가)
    · 기본 설정(baseURL, timeout)을 공유해야 할 때
    · 파일 업로드 진행률 추적이 필요할 때
    · HTTP 에러를 자동으로 reject하고 싶을 때
    · 여러 API 서버를 사용할 때 (인스턴스 분리)
```

### 3.4 React에서의 데이터 패칭 상태 관리

#### 기본 패턴: useState + useEffect

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/users", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (users.length === 0) return <EmptyState />;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### useReducer로 개선

```jsx
const initialState = { data: null, status: "idle", error: null };

function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_STARTED":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCEEDED":
      return { ...state, status: "success", data: action.payload };
    case "FETCH_FAILED":
      return { ...state, status: "error", error: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function UserList() {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      dispatch({ type: "FETCH_STARTED" });
      try {
        const res = await fetch("/api/users", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        dispatch({ type: "FETCH_SUCCEEDED", payload: data });
      } catch (err) {
        if (err.name !== "AbortError") {
          dispatch({ type: "FETCH_FAILED", payload: err.message });
        }
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, []);

  // Guard Clause
  if (state.status === "idle") return null;
  if (state.status === "loading") return <Spinner />;
  if (state.status === "error") return <ErrorMessage message={state.error} />;
  return <UserTable users={state.data} />;
}
```

#### Custom Hook으로 추출 (Step 16 패턴)

```jsx
function useFetch(url) {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();

    async function fetchData() {
      dispatch({ type: "FETCH_STARTED" });
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        dispatch({ type: "FETCH_SUCCEEDED", payload: data });
      } catch (err) {
        if (err.name !== "AbortError") {
          dispatch({ type: "FETCH_FAILED", payload: err.message });
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return state;
}

// 사용 — 깔끔해진 컴포넌트
function UserList() {
  const { data: users, status, error } = useFetch("/api/users");

  if (status === "loading") return <Spinner />;
  if (status === "error") return <ErrorMessage message={error} />;
  if (!users) return null;
  return <UserTable users={users} />;
}
```

### 3.5 Mutation (데이터 변경) 패턴

#### POST/PUT/DELETE 요청 + State 동기화

```jsx
function TodoApp() {
  const { data: todos, status, error } = useFetch("/api/todos");
  const [localTodos, setLocalTodos] = useState([]);

  // 서버 데이터가 도착하면 로컬 State에 복사
  useEffect(() => {
    if (todos) setLocalTodos(todos);
  }, [todos]);

  const addTodo = async (text) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("추가 실패");
      const newTodo = await response.json();

      // 서버 응답을 로컬 State에 반영
      setLocalTodos((prev) => [...prev, newTodo]);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("삭제 실패");

      setLocalTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // ...
}
```


![이 패턴의 문제점 (다음 섹션에서 상세히 분석)](/developer-open-book/diagrams/react-step22-이-패턴의-문제점-다음-섹션에서-상세히-분석.svg)


### 3.6 수동 패칭의 한계 — "왜 라이브러리가 필요한가"

이 섹션은 Step 23(TanStack Query)의 존재 이유를 명확히 하기 위한 핵심 섹션이다. 수동 패칭의 한계를 이론으로만 이해하는 것과 실제 코드에서 고통을 겪는 것은 차이가 있다. 아래 각 문제를 실습에서 직접 재현해보는 것을 강력히 권장한다.

#### 문제 1: Race Condition

```jsx
// ❌ 사용자가 빠르게 프로필을 전환할 때
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => setUser(data));
  }, [userId]);

  return <p>{user?.name}</p>;
}

// 시나리오:
// userId=1 클릭 → fetch 시작 (200ms 소요)
// userId=2 클릭 → fetch 시작 (50ms 소요)
//
// t=50ms:  userId=2 응답 도착 → setUser(user2) → "김철수" 표시
// t=200ms: userId=1 응답 도착 → setUser(user1) → "홍길동" 표시!
//
// 결과: 사용자는 userId=2를 선택했지만 userId=1의 데이터가 표시됨!
// → AbortController로 해결 가능하지만 매번 구현해야 한다
```

#### 문제 2: 캐싱 부재


![같은 데이터를 여러 곳에서 사용할 때](/developer-open-book/diagrams/react-step22-같은-데이터를-여러-곳에서-사용할-때.svg)


#### 문제 3: 데이터 동기화(Stale Data)


![시나리오: 사용자 A가 상품 목록을 보는 동안](/developer-open-book/diagrams/react-step22-시나리오-사용자-a가-상품-목록을-보는-동안.svg)


#### 문제 4: Waterfall (직렬 요청)


![부모-자식 컴포넌트의 데이터 의존성](/developer-open-book/diagrams/react-step22-부모-자식-컴포넌트의-데이터-의존성.svg)


#### 문제 5: 에러 재시도 부재


![네트워크가 불안정할 때](/developer-open-book/diagrams/react-step22-네트워크가-불안정할-때.svg)


#### 문제 6: 낙관적 업데이트의 복잡성


![좋아요 버튼을 누를 때](/developer-open-book/diagrams/react-step22-좋아요-버튼을-누를-때.svg)


#### 수동 패칭의 한계 요약


![수동 패칭의 7가지 한계](/developer-open-book/diagrams/react-step22-수동-패칭의-7가지-한계.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: useFetch Hook의 진화와 한계

```jsx
// 버전 1: 기본 useFetch
function useFetch(url) {
  /* ... loading, error, data 관리 ... */
}

// 버전 2: refetch 기능 추가
function useFetch(url) {
  // ... 기존 로직 ...
  const refetch = useCallback(() => {
    // 같은 URL로 다시 패칭
  }, [url]);
  return { data, isLoading, error, refetch };
}

// 버전 3: 캐싱 추가
const cache = new Map();
function useFetch(url) {
  // 캐시에 있으면 즉시 반환, 없으면 패칭
  // ... 캐시 만료 로직? 캐시 크기 제한? 캐시 무효화?
}

// 버전 4: Race Condition 방지 + 에러 재시도 + 폴링 + ...
// → 결국 TanStack Query를 처음부터 만들게 된다!

// 교훈: useFetch 같은 Custom Hook은 간단한 경우에는 유용하지만
//        실무의 복잡한 요구사항을 충족하기에는 부족하다
//        → "바퀴를 재발명하지 말고, 검증된 라이브러리를 사용하라"
```

### 4.2 사례: 인터셉터로 인증 토큰 자동 관리 (Axios)

실무에서 가장 흔한 패턴 중 하나는 Access Token 만료 처리다. Access Token은 보안상 짧은 유효기간(15분~1시간)을 가지며, 만료 시 Refresh Token으로 새 Access Token을 발급받아야 한다. Axios 인터셉터는 이 과정을 모든 요청에 투명하게 적용한다.

```jsx
// API 인스턴스 + 인터셉터 설정
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// 요청 인터셉터: 모든 요청에 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 시 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고 아직 재시도하지 않았으면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 발급
        const { data } = await axios.post("/api/auth/refresh", {
          refreshToken: localStorage.getItem("refreshToken"),
        });

        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest); // 원래 요청 재시도
      } catch (refreshError) {
        // Refresh도 실패 → 로그아웃
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
```

### 4.3 사례: 여러 API 요청의 병렬/직렬 패턴

대시보드 화면처럼 여러 독립적인 데이터를 한번에 로드해야 하는 경우, 요청을 직렬로 보내는 것은 큰 낭비다. `Promise.all`을 활용하면 모든 요청을 병렬로 실행하여 응답 시간을 단축할 수 있다. 단, 하나라도 실패하면 전체가 실패하는 특성을 고려해야 한다. 부분 실패를 허용해야 한다면 `Promise.allSettled`를 사용한다.

```jsx
// 병렬 요청: 서로 독립적인 데이터
function Dashboard() {
  const [data, setData] = useState({
    users: null,
    stats: null,
    notifications: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Promise.all로 병렬 실행!
        const [usersRes, statsRes, notifsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/stats"),
          fetch("/api/notifications"),
        ]);

        const [users, stats, notifications] = await Promise.all([
          usersRes.json(),
          statsRes.json(),
          notifsRes.json(),
        ]);

        setData({ users, stats, notifications });
      } catch (err) {
        // 하나라도 실패하면 전체 실패
        // Promise.allSettled를 사용하면 부분 실패 처리 가능
      } finally {
        setIsLoading(false);
      }
    }

    fetchAll();
  }, []);
}

// Promise.allSettled: 부분 실패 허용
const results = await Promise.allSettled([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/stats").then((r) => r.json()),
  fetch("/api/notifications").then((r) => r.json()),
]);

results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    console.log(`요청 ${index} 성공:`, result.value);
  } else {
    console.log(`요청 ${index} 실패:`, result.reason);
  }
});
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: fetch로 CRUD 구현 [Applying]

**목표:** fetch API로 완전한 CRUD를 구현한다.


![요구사항:](/developer-open-book/diagrams/react-step22-요구사항.svg)


---

### 실습 2: Axios 인스턴스 + 인터셉터 구현 [Applying]

**목표:** Axios의 인스턴스와 인터셉터를 설정한다.


![요구사항:](/developer-open-book/diagrams/react-step22-요구사항-18.svg)


---

### 실습 3: 수동 패칭의 한계 체험 [Analyzing]

**목표:** Race Condition과 캐싱 부재를 직접 체험한다.


![실험 A — Race Condition:](/developer-open-book/diagrams/react-step22-실험-a-race-condition.svg)


---

### 실습 4 (선택): useFetch Hook 확장과 한계 인식 [Evaluating]

**목표:** Custom Hook을 확장하면서 라이브러리의 필요성을 체감한다.

```
단계적 확장:
  Step 1: 기본 useFetch (GET만, 단순 패칭)
  Step 2: + refetch 기능 (수동 리패칭)
  Step 3: + 전역 캐시 (Map으로 URL 기반 캐싱)
  Step 4: + 캐시 만료 (TTL 기반)
  Step 5: + Race Condition 방지 (AbortController 내장)

각 단계에서:
  · 추가해야 하는 코드량 기록
  · "아직 부족한 것"을 목록으로 작성
  · Step 5까지 확장한 후에도 남아있는 한계 분석

최종 분석:
  · useFetch Hook의 코드 줄 수 vs TanStack Query의 기능
  · "직접 구현의 비용 vs 라이브러리 채택의 비용"
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 22 핵심 요약](/developer-open-book/diagrams/react-step22-step-22-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                                                     | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | HTTP 메서드 GET, POST, PATCH, DELETE가 각각 CRUD의 어떤 작업에 대응하는가?                               | Remember   | 3.1         |
| 2   | fetch가 404 응답에서 reject되지 않는 이유와 올바른 에러 처리 방법은?                                     | Understand | 3.2         |
| 3   | Axios 인터셉터가 유용한 구체적 시나리오 2가지를 설명하라                                                 | Understand | 3.3         |
| 4   | Server State와 Client State의 차이를 각각 예시와 함께 설명하라                                           | Understand | 2.3         |
| 5   | Race Condition이 발생하는 시나리오를 단계별로 설명하고 AbortController로 해결하는 방법은?                | Analyze    | 3.6         |
| 6   | 3개 컴포넌트가 같은 API를 호출할 때 중복 요청이 발생하는 이유와 해결 방향은?                             | Analyze    | 3.6         |
| 7   | useFetch Custom Hook을 계속 확장하는 것이 비효율적인 이유는?                                             | Evaluate   | 4.1         |
| 8   | 수동 패칭의 7가지 한계를 나열하고, 이것이 TanStack Query 같은 라이브러리의 필요성을 어떻게 정당화하는가? | Evaluate   | 3.6         |

---

## 6.3 FAQ

**Q1. fetch와 Axios 중 무엇을 써야 하나요?**

A. 정답은 없으며, 상황에 따라 다릅니다. 개인 프로젝트나 간단한 요청이라면 fetch로 충분합니다. 반면 인증 토큰 자동 갱신, 요청/응답 로깅, 에러 코드 일괄 처리 같은 요구사항이 있다면 Axios의 인터셉터가 훨씬 편리합니다. 대부분의 팀 프로젝트에서는 Axios를 사용하는 경향이 있습니다. 단, TanStack Query를 함께 사용한다면 HTTP 클라이언트보다 queryFn 설계가 더 중요해집니다.

**Q2. response.ok를 항상 확인해야 하나요?**

A. fetch를 직접 사용할 때는 반드시 확인해야 합니다. fetch는 네트워크 오류에서만 reject되며 HTTP 에러(4xx, 5xx)는 "성공"으로 처리합니다. Axios는 HTTP 에러에서 자동으로 reject되므로 별도 확인이 불필요합니다. TanStack Query의 queryFn에서 fetch를 사용할 때도 response.ok 확인을 빠뜨리면 에러가 정상 데이터로 처리되는 버그가 발생합니다.

**Q3. 모든 API 호출에 AbortController를 써야 하나요?**

A. useEffect 안에서 실행하는 모든 패칭에는 AbortController를 권장합니다. 컴포넌트가 언마운트된 후 응답이 도착하면 "메모리 누수" 경고가 발생하며, Race Condition의 원인이 됩니다. TanStack Query를 사용하면 내부적으로 이를 자동 처리하므로 직접 구현할 필요가 없습니다.

**Q4. Promise.all 중 하나가 실패하면 어떻게 되나요?**

A. `Promise.all`은 하나라도 reject되면 즉시 전체가 reject됩니다. "하나가 실패해도 나머지는 완료하고 싶다"면 `Promise.allSettled`를 사용하세요. `allSettled`는 모든 Promise가 처리될 때까지 기다리며, 각 결과에 `status: 'fulfilled'` 또는 `status: 'rejected'`가 포함됩니다.

**Q5. Server State를 Context에 넣으면 안 되나요?**

A. 기술적으로는 가능하지만 권장하지 않습니다. Context는 값이 변경되면 구독하는 모든 컴포넌트를 리렌더링시킵니다. API 응답 데이터를 Context에 넣으면 패칭, 캐싱, 리패칭, 에러 재시도를 모두 직접 구현해야 하며, 성능 최적화도 어렵습니다. TanStack Query가 이 모든 것을 자체 캐시(QueryClient)로 처리하므로 Server State는 TanStack Query에 맡기는 것이 올바른 패턴입니다.

---

## 7. 다음 단계 예고

> **Step 23. TanStack Query (React Query)**
>
> - Server State 관리의 패러다임 전환
> - useQuery: 선언적 데이터 패칭 + 자동 캐싱
> - useMutation: 데이터 변경 + 캐시 무효화
> - 자동 리패칭, 에러 재시도, 캐시 전략
> - Step 22에서 식별한 7가지 한계가 어떻게 해결되는가
> - Optimistic Update, Infinite Query, Prefetching

---

## 📚 참고 자료

- [MDN — Fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API)
- [MDN — Using Fetch](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN — AbortController](https://developer.mozilla.org/ko/docs/Web/API/AbortController)
- [MDN — HTTP 상태 코드](https://developer.mozilla.org/ko/docs/Web/HTTP/Status)
- [Axios 공식 문서](https://axios-http.com/)
- [React 공식 문서 — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [MDN — Promise.all](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN — Promise.allSettled](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 22 of 42
