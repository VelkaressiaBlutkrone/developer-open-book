# Step 24. API 계층 설계와 에러 처리 통합

> **난이도:** 🔴 고급 (Advanced)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다 — **Phase 3 마무리**

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Remember**   | API 클라이언트 계층의 구성 요소(HTTP 클라이언트, 서비스 모듈, Hook 계층)를 나열할 수 있다 |
| **Understand** | 3계층 API 아키텍처(HTTP → Service → Hook)에서 각 계층의 책임을 설명할 수 있다             |
| **Apply**      | 프로젝트에 일관된 API 계층 구조를 설계하고 구현할 수 있다                                 |
| **Analyze**    | 에러를 분류(네트워크/HTTP/비즈니스/검증)하고 각각에 적합한 처리 전략을 분석할 수 있다     |
| **Evaluate**   | 인증 토큰 관리, 에러 처리, 로딩 UI의 일관된 패턴을 설계하고 판단할 수 있다                |
| **Evaluate**   | Phase 3 전체를 통합하여 "라우팅 + 데이터 + 에러" 아키텍처를 평가할 수 있다                |

**전제 지식:**

- Step 17: Error Boundary, 계층적 에러 처리
- Step 22: REST API, fetch/Axios, 인터셉터
- Step 23: TanStack Query (useQuery, useMutation, queryKey)

---

## 1. 서론 — 왜 API "계층"을 설계해야 하는가

### 1.1 소프트웨어 아키텍처에서 계층 분리의 역사

소프트웨어 개발에서 "관심사 분리(Separation of Concerns)"는 수십 년간 검증된 원칙이다. 1979년 Edsger Dijkstra가 논문에서 이 개념을 처음 명확히 정의한 이후, 3-tier 아키텍처(Presentation-Business-Data), MVC(Model-View-Controller), Clean Architecture 등 다양한 형태로 발전해왔다. 공통된 목표는 하나다. "변경의 이유가 하나인 코드는 한 곳에 모아라."

프론트엔드에서도 같은 원칙이 적용된다. API 통신 코드가 컴포넌트 곳곳에 흩어지면, 하나의 변경(API URL 수정, 인증 방식 변경, 에러 처리 통일)이 수십 개의 파일을 건드려야 하는 상황이 된다. 이것이 "스파게티 코드"가 만들어지는 전형적인 경로다. 반면 계층을 명확히 나누면, 각 변경이 딱 한 계층에만 영향을 미친다.

React 프로젝트에서 이 원칙을 API 통신에 적용하면 세 가지 계층이 자연스럽게 나온다. HTTP 설정을 담당하는 클라이언트 계층, API 스펙을 캡슐화하는 서비스 계층, React와 연결하는 Hook 계층이다.

### 1.2 API 코드가 곳곳에 흩어지면 일어나는 일


![❌ 계층 없이 각 컴포넌트에서 직접 API 호출](/developer-open-book/diagrams/react-step24-계층-없이-각-컴포넌트에서-직접-api-호출.svg)


### 1.3 계층 분리의 목표와 산업적 가치

계층 분리가 단순히 "코드가 깔끔해진다"는 미학적 문제가 아니라는 것을 이해하는 것이 중요하다. 계층 분리는 **변경 비용을 줄이는** 실용적 결정이다. 소프트웨어 개발에서 코드를 작성하는 시간보다 유지보수하는 시간이 훨씬 길다. 계층이 없으면 작은 변경이 큰 작업이 된다.

또한 계층 분리는 팀 협업을 가능하게 한다. 백엔드 API 스펙이 변경되면 서비스 계층 담당자만 수정하면 되고, UI 개발자는 영향받지 않는다. 새 팀원이 합류하면 각 계층의 책임이 명확하게 문서화되어 있어 온보딩이 빠르다.


![✅ 목표: 관심사에 따라 코드를 계층으로 분리한다](/developer-open-book/diagrams/react-step24-목표-관심사에-따라-코드를-계층으로-분리한다.svg)


### 1.4 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step24-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 소프트웨어 계층 설계의 핵심 원칙

계층 설계의 가장 중요한 원칙은 **의존성 방향의 일관성**이다. 상위 계층은 하위 계층에 의존하지만, 하위 계층은 상위 계층을 알지 못한다. 컴포넌트(Layer 4)는 Hook(Layer 3)을 사용하지만, Hook은 컴포넌트를 모른다. Hook은 서비스(Layer 2)를 호출하지만, 서비스는 Hook의 존재를 모른다. 이 방향성이 깨지면 순환 의존성이 생기고 코드가 테스트하기 어려워진다.

또 다른 핵심 원칙은 **단일 책임**이다. 각 계층은 딱 하나의 이유로만 변경되어야 한다. HTTP 클라이언트 계층은 "통신 방식이 변경될 때" 수정된다. 서비스 계층은 "API 스펙이 변경될 때" 수정된다. Hook 계층은 "캐싱 전략이 변경될 때" 수정된다.

### 2.2 핵심 용어 사전

| 용어                     | 정의                                                                              | 왜 중요한가                                       |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| **API 계층**             | API 통신 코드를 **책임별로 분리한 구조**. HTTP → Service → Hook → Component       | 변경 영향을 최소화하고 코드 재사용성을 높인다     |
| **HTTP 클라이언트**      | 서버와의 **통신 설정을 캡슐화**한 모듈. baseURL, 인터셉터, 타임아웃 등            | 모든 API 호출의 공통 설정을 한 곳에서 관리        |
| **서비스 모듈**          | 특정 **도메인(사용자, 상품 등)의 API 함수**를 모아놓은 모듈                       | URL, 파라미터, 응답 변환 등 API 스펙을 캡슐화     |
| **에러 분류**            | 에러를 **종류별로 구분**하여 각각 다른 전략으로 처리. 네트워크/HTTP/비즈니스/검증 | 에러 유형에 따라 사용자 경험이 달라야 한다        |
| **Token Refresh**        | Access Token 만료 시 Refresh Token으로 **자동으로 새 토큰을 발급**받는 메커니즘   | 사용자가 "로그인 다시 해주세요"를 최소한으로 경험 |
| **Error Boundary 통합**  | API 에러를 **React의 Error Boundary 시스템과 연결**하여 선언적으로 처리           | 명령적 try/catch 대신 선언적 Fallback UI 활용     |
| **Global Error Handler** | 모든 API 에러를 **한 곳에서 일괄 처리**하는 패턴. 인터셉터 또는 QueryClient 설정  | 에러 로깅, 토스트 알림, 인증 만료 등 공통 처리    |

### 2.3 3계층 API 아키텍처 개요

아키텍처 다이어그램을 볼 때 중요한 것은 각 화살표의 방향이다. 위에서 아래로만 의존성이 흐른다. 컴포넌트에서 서비스 계층을 직접 호출하거나, HTTP 클라이언트에서 React Hook을 사용하는 것은 이 원칙을 위반한다.


![3계층 API 아키텍처](/developer-open-book/diagrams/react-step24-3계층-api-아키텍처.svg)


---

## 3. 이론과 원리

### 3.1 Layer 1: HTTP 클라이언트

HTTP 클라이언트 계층의 핵심 역할은 "모든 HTTP 요청의 공통 설정을 한 곳에서 관리"하는 것이다. baseURL, 타임아웃, 기본 헤더 같은 공통 설정뿐 아니라, 인증 토큰 자동 추가, 에러 표준화, 로깅 같은 횡단 관심사(cross-cutting concern)도 이 계층에서 처리된다.

인터셉터는 이 계층의 핵심 메커니즘이다. 모든 요청이 실제 전송되기 전에 요청 인터셉터를 통과하고, 모든 응답이 컴포넌트에 도달하기 전에 응답 인터셉터를 통과한다. 이 두 지점을 장악하면 인증, 에러 처리, 로깅을 중앙화할 수 있다.

#### Axios 인스턴스 설정

```javascript
// src/lib/apiClient.js

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.example.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 요청 인터셉터: 인증 토큰 자동 추가 ──
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── 응답 인터셉터: 에러 변환 + 토큰 갱신 ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 + 아직 재시도하지 않은 경우 → 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        );

        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 → 로그아웃
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // API 에러를 표준화된 형태로 변환
    return Promise.reject(normalizeError(error));
  },
);

export default apiClient;
```

#### 에러 표준화 함수

에러 표준화는 컴포넌트 계층이 에러 처리를 단순화하도록 돕는다. Axios 에러, fetch 에러, 네트워크 에러가 모두 다른 형태를 가진다면, 컴포넌트마다 각기 다른 에러 형식을 처리해야 한다. `ApiError` 클래스로 모든 에러를 통일하면 컴포넌트는 항상 `error.status`와 `error.message`만 확인하면 된다.

```javascript
// src/lib/normalizeError.js

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status; // HTTP 상태 코드 (404, 500 등)
    this.code = code; // 비즈니스 에러 코드 ('USER_NOT_FOUND' 등)
    this.details = details; // 추가 정보 (필드별 검증 에러 등)
  }
}

export function normalizeError(error) {
  // 네트워크 에러 (서버에 도달하지 못함)
  if (!error.response) {
    return new ApiError(
      "서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.",
      0,
      "NETWORK_ERROR",
    );
  }

  const { status, data } = error.response;

  // 서버가 표준 에러 형식을 반환하는 경우
  if (data?.message) {
    return new ApiError(data.message, status, data.code, data.details);
  }

  // HTTP 상태 코드별 기본 메시지
  const messages = {
    400: "잘못된 요청입니다.",
    401: "인증이 필요합니다.",
    403: "접근 권한이 없습니다.",
    404: "요청한 데이터를 찾을 수 없습니다.",
    409: "데이터가 충돌합니다.",
    422: "입력 데이터가 유효하지 않습니다.",
    429: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    500: "서버 오류가 발생했습니다.",
    502: "서버가 일시적으로 응답하지 않습니다.",
    503: "서비스가 점검 중입니다.",
  };

  return new ApiError(
    messages[status] || `오류가 발생했습니다. (${status})`,
    status,
    `HTTP_${status}`,
  );
}
```


![HTTP 클라이언트 계층의 책임](/developer-open-book/diagrams/react-step24-http-클라이언트-계층의-책임.svg)


### 3.2 Layer 2: 서비스 계층

서비스 계층은 API 스펙의 "언어 번역기"다. 백엔드가 `/api/v1/users`를 `/api/v2/members`로 변경해도, 서비스 계층의 `userService.getUsers()` 함수만 수정하면 된다. Hook 계층이나 컴포넌트는 변경 없이 동일하게 동작한다. 이것이 캡슐화의 힘이다.

서비스 계층 함수는 순수한 비동기 함수다. React 의존성이 없으며, HTTP 클라이언트만 사용한다. 덕분에 테스트가 쉽다. Axios 인스턴스를 모킹하면 서비스 함수 전체를 단위 테스트할 수 있다.

#### 도메인별 API 함수

```javascript
// src/services/userService.js

import apiClient from "@/lib/apiClient";

export const userService = {
  // 사용자 목록 조회
  getUsers: async (filters = {}) => {
    const { data } = await apiClient.get("/users", { params: filters });
    return data;
  },

  // 사용자 상세 조회
  getUser: async (id) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  // 사용자 생성
  createUser: async (userData) => {
    const { data } = await apiClient.post("/users", userData);
    return data;
  },

  // 사용자 수정
  updateUser: async (id, updates) => {
    const { data } = await apiClient.patch(`/users/${id}`, updates);
    return data;
  },

  // 사용자 삭제
  deleteUser: async (id) => {
    await apiClient.delete(`/users/${id}`);
  },

  // 현재 사용자 프로필
  getProfile: async () => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
};
```

```javascript
// src/services/productService.js

import apiClient from "@/lib/apiClient";

export const productService = {
  getProducts: async ({ category, sort, page = 1, limit = 20 } = {}) => {
    const { data } = await apiClient.get("/products", {
      params: { category, sort, page, limit },
    });
    return data;
    // { items: Product[], total: number, page: number, hasMore: boolean }
  },

  getProduct: async (id) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  searchProducts: async (query) => {
    const { data } = await apiClient.get("/products/search", {
      params: { q: query },
    });
    return data;
  },
};
```


![서비스 계층의 책임](/developer-open-book/diagrams/react-step24-서비스-계층의-책임.svg)


### 3.3 Layer 3: Hook 계층

Hook 계층은 React 세계와 서버 데이터 세계를 연결하는 다리다. 순수한 비동기 함수인 서비스 계층의 함수를 TanStack Query의 `useQuery`와 `useMutation`으로 감싸서, React 컴포넌트가 소비할 수 있는 형태로 변환한다.

이 계층에서 queryKey 설계, staleTime, 캐시 무효화 전략 같은 캐싱 관련 결정이 이루어진다. 이 결정들은 성능에 직접적인 영향을 미치므로, 팀 내에서 명확한 기준을 세우고 문서화하는 것이 중요하다.

#### TanStack Query Custom Hook

```javascript
// src/hooks/useUsers.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";

// ── queryKey Factory ──
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  profile: () => [...userKeys.all, "profile"],
};

// ── Query Hooks ──
export function useUsers(filters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.getUsers(filters),
    staleTime: 1000 * 60,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5, // 프로필은 5분간 fresh
  });
}

// ── Mutation Hooks ──
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => userService.updateUser(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
```


![Hook 계층의 책임](/developer-open-book/diagrams/react-step24-hook-계층의-책임.svg)


#### 폴더 구조


![src/](/developer-open-book/diagrams/react-step24-src.svg)



![계층별 변경 영향 분석](/developer-open-book/diagrams/react-step24-계층별-변경-영향-분석.svg)


### 3.4 에러 분류와 처리 전략

에러 처리의 품질이 애플리케이션의 신뢰성을 결정한다. "오류가 발생했습니다"라는 모호한 메시지보다 "재고가 부족합니다. 5개만 주문 가능합니다"라는 구체적인 메시지가 사용자에게 훨씬 유용하다. 에러를 유형별로 분류해야 각 상황에 맞는 대응이 가능하다.

네트워크 에러와 4xx 에러는 재시도 전략이 다르다. 네트워크 에러는 일시적인 문제일 수 있으므로 자동 재시도가 유효하다. 반면 400 Bad Request는 요청 자체가 잘못된 것이므로 재시도해도 동일하게 실패한다. 이를 `retry` 설정에 반영해야 한다.

#### 에러의 4가지 유형


![에러 유형    │  원인             │  처리 전략](/developer-open-book/diagrams/react-step24-에러-유형-원인-처리-전략.svg)


#### 에러 처리의 계층적 배치


![어디에서 어떤 에러를 처리하는가](/developer-open-book/diagrams/react-step24-어디에서-어떤-에러를-처리하는가.svg)


#### QueryClient 전역 에러 핸들러

```javascript
// src/lib/queryClient.js

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./normalizeError";
import { toast } from "@/lib/toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        // 4xx 에러는 재시도하지 않는다 (클라이언트 에러이므로)
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        // 네트워크/5xx 에러는 3회까지 재시도
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error) => {
        // Mutation 에러 기본 처리: 토스트 알림
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("알 수 없는 오류가 발생했습니다.");
        }
      },
    },
  },
});
```

### 3.5 인증 토큰 관리 전체 흐름

인증 토큰 관리는 보안과 사용자 경험이 교차하는 민감한 영역이다. Access Token은 짧은 유효기간(15분~1시간)을 가지며, Refresh Token은 긴 유효기간(7일~30일)을 가진다. 이 구조를 통해 Access Token이 탈취되더라도 짧은 시간 내에 만료되어 피해를 최소화한다.

`localStorage`에 토큰을 저장하는 것은 XSS 공격에 취약하다는 단점이 있다. 프로덕션 환경에서는 `httpOnly` 쿠키가 더 안전하지만, 설정이 더 복잡하다. 팀의 보안 요구사항에 맞게 선택해야 한다.


![인증 토큰 관리 아키텍처](/developer-open-book/diagrams/react-step24-인증-토큰-관리-아키텍처.svg)


#### 동시 401 처리 (Refresh Queue)

여러 요청이 동시에 401을 받으면, 토큰 갱신 요청이 여러 번 발생하는 문제가 생길 수 있다. Refresh Queue 패턴은 첫 번째 갱신 요청이 진행 중일 때 나머지 실패 요청을 큐에 대기시키고, 갱신 완료 후 일괄 재시도하는 방식으로 이 문제를 해결한다.

```javascript
// src/lib/apiClient.js — 향상된 토큰 갱신

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중 → 큐에 추가하고 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(/* refresh */);
        localStorage.setItem("accessToken", data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);
```

### 3.6 로딩/에러 UI의 일관된 패턴

일관된 로딩/에러 UI는 사용자 경험의 예측 가능성을 높인다. 페이지마다 로딩 표시가 다르거나 에러 메시지 스타일이 다르면 사용자가 혼란을 느낀다. 재사용 가능한 UI 컴포넌트로 표준화하면 코드 중복을 줄이면서 일관성을 유지할 수 있다.

```jsx
// 데이터 조회 상태를 일관되게 처리하는 래퍼
function QueryStateHandler({
  query,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
}) {
  const { data, isLoading, isError, error } = query;

  if (isLoading) {
    return loadingFallback ?? <Spinner />;
  }

  if (isError) {
    return (
      errorFallback?.(error) ?? (
        <div className="error-state">
          <p>{error.message}</p>
          <button onClick={() => query.refetch()}>다시 시도</button>
        </div>
      )
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyFallback ?? <p>데이터가 없습니다.</p>;
  }

  return children(data);
}

// 사용
function UserListPage() {
  const query = useUsers();

  return (
    <QueryStateHandler
      query={query}
      loadingFallback={<UserListSkeleton />}
      emptyFallback={<EmptyState message="등록된 사용자가 없습니다." />}
    >
      {(users) => (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}
    </QueryStateHandler>
  );
}
```

### 3.7 Phase 3 전체 통합 복습


![Phase 3 (Step 18~24)에서 배운 것](/developer-open-book/diagrams/react-step24-phase-3-step-18-24-에서-배운-것.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: 계층 없는 코드 vs 계층화된 코드

```jsx
// ❌ 계층 없이 — 모든 것이 컴포넌트 안에
function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.example.com/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // ... URL, 인증, 에러 처리, 캐싱 모두 부재
}

// ✅ 계층화된 코드 — 컴포넌트는 UI만 담당
function UserList() {
  const { data: users, isLoading } = useUsers();
  // URL? → userService가 관리
  // 인증? → apiClient 인터셉터가 관리
  // 캐싱? → useUsers의 queryKey + staleTime이 관리
  // 에러? → QueryClient 전역 핸들러 + Error Boundary

  if (isLoading) return <UserListSkeleton />;
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### 4.2 사례: 에러 유형별 다른 UX

에러 유형에 따라 사용자에게 다른 UI를 제공하면 훨씬 더 좋은 경험이 만들어진다. 404 에러와 500 에러는 근본적으로 다른 상황이므로 다른 대응이 필요하다. 표준화된 `ApiError` 클래스 덕분에 `error.status`로 에러 유형을 간단히 구분할 수 있다.

```jsx
function ProductPage({ productId }) {
  const { data, isLoading, isError, error } = useProduct(productId);

  if (isLoading) return <ProductSkeleton />;

  if (isError) {
    // 에러 유형에 따라 다른 UI
    if (error.status === 404) {
      return <NotFoundState message="상품을 찾을 수 없습니다." />;
    }
    if (error.status === 403) {
      return <ForbiddenState message="이 상품에 접근할 권한이 없습니다." />;
    }
    if (error.code === "NETWORK_ERROR") {
      return <OfflineState onRetry={() => refetch()} />;
    }
    // 기타 에러
    return <ErrorState message={error.message} />;
  }

  return <ProductDetail product={data} />;
}
```

### 4.3 사례: 이커머스 앱의 전체 API 아키텍처

실제 프로젝트에서 이 구조가 어떻게 확장되는지 보여주는 예시다. 도메인이 늘어나도 각 계층의 패턴은 동일하게 유지된다.


![src/](/developer-open-book/diagrams/react-step24-src-14.svg)


---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 3계층 API 구조 구현 [Applying]

**목표:** HTTP → Service → Hook → Component의 4계층 구조를 구현한다.

```
요구사항:
  · Layer 1: apiClient.js (Axios 인스턴스, baseURL, timeout)
  · Layer 2: todoService.js (getTodos, createTodo, toggleTodo, deleteTodo)
  · Layer 3: useTodos.js (useQuery + useMutation, queryKey Factory)
  · Layer 4: TodoApp.jsx (UI만 담당)
  · JSONPlaceholder API 사용

검증할 것:
  · TodoApp.jsx에 fetch, axios, URL이 하나도 없는가?
  · API URL을 변경할 때 수정할 파일이 1개뿐인가?
  · 캐싱 전략을 변경할 때 수정할 파일이 1개뿐인가?
```

---

### 실습 2: 에러 표준화 + 유형별 처리 [Applying · Analyzing]

**목표:** 에러를 표준화하고 유형별로 다른 UI를 보여준다.

```
요구사항:
  · normalizeError.js 구현 (ApiError 클래스)
  · 인터셉터에서 에러 표준화 적용
  · 컴포넌트에서 error.status에 따라 다른 UI:
    - 404: "찾을 수 없습니다" + 홈으로 가기
    - 403: "접근 권한이 없습니다" + 로그인 안내
    - 500: "서버 오류" + 다시 시도
    - 네트워크: "연결 확인" + 재시도
  · QueryClient의 retry에서 4xx는 재시도 안 하도록 설정

분석할 것:
  · 에러 표준화 없이 컴포넌트에서 직접 error.response?.status를 체크하면
    어떤 문제가 발생하는가?
```

---

### 실습 3: 인증 토큰 자동 관리 [Applying]

**목표:** 인터셉터로 토큰 추가와 자동 갱신을 구현한다.

```
요구사항 (시뮬레이션):
  · 로그인 시 accessToken, refreshToken을 localStorage에 저장
  · 요청 인터셉터: Authorization 헤더 자동 추가
  · 응답 인터셉터: 401 시 refreshToken으로 갱신 시도
  · 갱신 성공: 새 토큰 저장 + 원래 요청 재시도
  · 갱신 실패: localStorage 비우기 + /login 리다이렉트
  · (서버가 없으므로 setTimeout으로 API 응답 시뮬레이션)

보너스:
  · 동시에 3개 요청이 401을 받을 때 갱신은 1번만 실행되는가?
    (Refresh Queue 패턴 구현)
```

---

### 실습 4 (선택): 이커머스 API 아키텍처 설계 [Evaluating · Creating]

**목표:** 중규모 앱의 전체 API 계층을 설계한다.

```
시나리오: 온라인 서점

도메인:
  · 도서 (books): 목록, 상세, 검색, 카테고리별 필터
  · 장바구니 (cart): 추가, 제거, 수량 변경
  · 주문 (orders): 주문 생성, 주문 내역, 주문 상세
  · 리뷰 (reviews): 작성, 수정, 삭제
  · 사용자 (users): 프로필, 위시리스트

설계할 것:
  1. 폴더 구조 (lib, services, hooks)
  2. 각 서비스 모듈의 함수 목록
  3. 각 Hook의 queryKey 설계 (Factory 패턴)
  4. 에러 처리 전략 (어떤 에러를 어디서 처리)
  5. 캐싱 전략 (도메인별 staleTime)
  6. 낙관적 업데이트 적용 대상 선정
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 24 핵심 요약](/developer-open-book/diagrams/react-step24-step-24-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                                  | 블룸 단계  | 확인할 섹션  |
| --- | ------------------------------------------------------------------------------------- | ---------- | ------------ |
| 1   | 3계층 API 아키텍처에서 각 계층의 책임을 한 문장씩 설명하라                            | Remember   | 2.3, 3.1~3.3 |
| 2   | API URL이 변경될 때 수정해야 하는 계층은? 나머지 계층이 영향받지 않는 이유는?         | Understand | 3.3          |
| 3   | 인터셉터에서 에러를 ApiError로 표준화하는 것의 이점은?                                | Understand | 3.1, 3.4     |
| 4   | QueryClient의 retry에서 4xx 에러를 재시도하지 않는 이유는?                            | Analyze    | 3.4          |
| 5   | 동시에 3개 요청이 401을 받을 때 토큰 갱신이 1회만 발생하도록 하는 패턴은?             | Apply      | 3.5          |
| 6   | queryKey Factory 패턴에서 `userKeys.all`로 invalidate하면 어떤 캐시들이 무효화되는가? | Analyze    | 3.3          |
| 7   | 에러의 4가지 유형(네트워크/HTTP/비즈니스/검증)을 각각 어디서 처리해야 하는가?         | Evaluate   | 3.4          |
| 8   | "컴포넌트에 fetch URL이 하나도 없다"가 좋은 설계인 이유 3가지는?                      | Evaluate   | 3.3          |

---

## 6.3 FAQ

**Q1. 서비스 계층 없이 Hook에서 직접 apiClient를 호출하면 안 되나요?**

A. 소규모 프로젝트에서는 괜찮을 수 있습니다. 하지만 서비스 계층이 없으면 API URL이 Hook 여러 곳에 흩어지고, URL 변경 시 모든 Hook을 수정해야 합니다. 서비스 계층은 "API 스펙 변경의 영향을 한 곳에서 흡수"하는 역할이므로, 5개 이상의 API를 가진 프로젝트라면 도입을 권장합니다.

**Q2. ApiError 클래스를 직접 만들지 않고 서드파티 라이브러리를 써도 되나요?**

A. 가능합니다. 하지만 에러 표준화는 프로젝트마다 요구사항이 다르기 때문에, 직접 간단하게 구현하는 것이 오히려 더 유연한 경우가 많습니다. 핵심은 "다양한 에러 형태를 한 가지 표준 형태로 통일"하는 것이며, ApiError 클래스는 그 방법 중 하나입니다.

**Q3. 토큰을 localStorage에 저장하면 보안 문제가 있다고 들었는데, 어떻게 해야 하나요?**

A. 맞습니다. localStorage는 JavaScript로 접근 가능하기 때문에 XSS 공격에 취약합니다. 보안이 중요한 서비스라면 `httpOnly` 쿠키를 사용하는 것이 더 안전합니다. httpOnly 쿠키는 JavaScript에서 접근할 수 없어 XSS로부터 보호됩니다. 단, 이 경우 CSRF 방어(SameSite 쿠키 설정 등)도 함께 고려해야 합니다.

**Q4. 모든 Mutation 에러를 QueryClient의 onError에서 처리하면, 특정 Mutation에서 별도 처리가 불가능한가요?**

A. 가능합니다. QueryClient의 `mutations.onError`는 기본(fallback) 핸들러로 동작합니다. 개별 useMutation에서 `onError`를 정의하면 그 Mutation에서는 기본 핸들러가 호출되지 않습니다. 전역 핸들러는 별도 처리가 없는 Mutation의 에러를 담당하는 역할입니다.

**Q5. Phase 3 내용이 너무 많은데, 가장 핵심이 되는 Step은 무엇인가요?**

A. Phase 3에서 가장 임팩트가 큰 학습은 Step 22와 Step 23의 연결입니다. 수동 패칭의 고통을 직접 경험하고, TanStack Query가 그 문제를 어떻게 해결하는지 이해하는 것이 핵심입니다. Step 24의 3계층 아키텍처는 Step 23을 "실무 수준으로 구조화"하는 방법이며, 프로젝트 규모가 커질수록 그 가치가 드러납니다.

---

## 7. 다음 단계 예고

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
>
> **Step 25. Context API 심화**
>
> - Context의 본질: Props Drilling 해결
> - Provider 패턴과 Consumer 패턴
> - useReducer + Context = 간단한 전역 상태
> - Context 리렌더링 문제와 최적화 전략
> - Context가 적합한 경우와 부적합한 경우
>
> Phase 3에서 쌓은 라우팅과 데이터 레이어 위에,
> 이제 **전역 상태 관리**와 **앱 아키텍처 패턴**을 설계한다.

---

## 📚 참고 자료

- [TanStack Query — Custom Hooks](https://tanstack.com/query/latest/docs/react/guides/custom-hooks)
- [Axios — Interceptors](https://axios-http.com/docs/interceptors)
- [Axios — Creating an Instance](https://axios-http.com/docs/instance)
- [TkDodo's Blog — Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
- [TkDodo's Blog — React Query Error Handling](https://tkdodo.eu/blog/react-query-error-handling)
- [Kent C. Dodds — How I Structure my React Projects](https://kentcdodds.com/blog/how-i-structure-react-projects)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 24 of 42 | **Phase 3 완료**
