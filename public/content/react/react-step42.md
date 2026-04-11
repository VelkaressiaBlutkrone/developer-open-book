# Step 42. 종합 프로젝트와 로드맵 마무리

> **난이도:** 🔴 고급 (Advanced)

> **Phase 7 — 빌드·배포·프로덕션 (Step 39~42)**
> 빌드, 배포, 프로덕션 운영으로 앱을 완성한다 — **Phase 7 마무리 · 로드맵 완료**

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                |
| -------------- | ------------------------------------------------------------------- |
| **Remember**   | 42단계에서 학습한 핵심 개념의 위치와 관계를 기술할 수 있다          |
| **Understand** | 각 Phase가 전체 아키텍처에서 담당하는 역할을 설명할 수 있다         |
| **Apply**      | 종합 프로젝트에 로드맵의 기술 스택을 통합하여 적용할 수 있다        |
| **Analyze**    | 프로젝트 요구사항을 분석하여 적절한 기술 선택을 할 수 있다          |
| **Evaluate**   | 자신의 현재 수준을 평가하고 다음 성장 방향을 결정할 수 있다         |
| **Create**     | 프로덕션 품질의 React 앱을 처음부터 끝까지 설계·구현·배포할 수 있다 |

---

## 1. 서론 — 42단계를 완주한다는 것의 의미

### 1.1 React 학습 여정의 역사적 맥락

React는 2013년 Facebook이 오픈소스로 공개한 이후 10년 이상 프론트엔드 개발의 지형을 바꿔왔다. 당시 Web 2.0 시대의 jQuery 기반 개발에서 벗어나, 컴포넌트 기반의 선언적 UI 패러다임을 대중화한 것이 React의 핵심 공헌이다. 이후 Angular, Vue, Svelte 등 경쟁 프레임워크들도 모두 컴포넌트 기반 설계를 채택했다. React가 제시한 "UI = f(state)" 공식은 현대 프론트엔드 개발의 근간이 되었다.

2015년 Redux, 2018년 Hooks의 도입, 2020년 Concurrent Mode, 2023년 Server Components까지 React는 끊임없이 진화했다. 각 변화는 단순한 API 추가가 아니라 개발자가 UI를 사고하는 방식을 근본적으로 변화시켰다. Hooks는 클래스 컴포넌트의 복잡성을 함수형 사고로 대체했고, Server Components는 "클라이언트와 서버의 경계"를 컴포넌트 수준에서 제어할 수 있게 했다.

이 42단계 로드맵은 이 10년의 진화를 체계적으로 압축했다. Phase 0의 개발 환경 설정부터 Phase 7의 프로덕션 모니터링까지, 단순히 "코드를 어떻게 쓰는가"가 아니라 "왜 이렇게 설계되었는가"를 함께 다뤘다. 이 배경 지식이 앞으로 React가 어떻게 변화하든 빠르게 적응할 수 있는 기반이 된다.

### 1.2 "아는 것"과 "할 수 있는 것" 사이의 간극

소프트웨어 교육에서 가장 흔한 함정은 "이해했다"와 "할 수 있다"를 동일시하는 것이다. 42단계의 내용을 읽고 이해하는 것은 필요조건이지 충분조건이 아니다. 뇌과학 연구에 따르면, 지식을 실제로 적용하는 경험이 없으면 학습한 내용의 80% 이상이 2주 내에 망각된다. 반대로 직접 구현한 코드는 오래 기억될 뿐 아니라 응용력까지 갖추게 된다.

이 차이를 "성능 지식(declarative knowledge)"과 "절차적 지식(procedural knowledge)"으로 구분할 수 있다. "TanStack Query가 캐싱을 자동으로 관리한다"는 성능 지식이다. 실제로 useQuery를 사용하여 staleTime과 gcTime을 조정하며 캐싱 동작을 확인하고, 오류 발생 시 retry 전략을 적용한 경험이 절차적 지식이다. 절차적 지식만이 실제 개발 상황에서 자동으로 활성화된다.

종합 프로젝트는 이 간극을 메우는 가장 효과적인 방법이다. 프로젝트를 진행하다 막히는 모든 순간이 학습의 기회다. 그 막힘을 해결하는 과정에서 "이제 정말 안다"는 수준의 이해가 만들어진다.

### 1.3 42단계 개념 지도 — 전체 구조 한눈에

```
React 완성 로드맵 v2.0 — 전체 개념 지도
=====================================================================

  Phase 0: 기반               Phase 1: 핵심 원리          Phase 2: Hook 심화
  ─────────────              ─────────────────────       ─────────────────
  개발 환경                   JSX + Props                  useEffect (생명주기)
  JS 핵심 (ES6+)             useState                     useRef (DOM 참조)
  React 생태계                Reconciliation               useReducer (복합 상태)
                              Form                         useMemo/useCallback
                              Fiber/Concurrent             Custom Hook
                                                           Error Boundary

  Phase 3: 라우팅·데이터       Phase 4: 상태·아키텍처      Phase 5: 타입·폼·스타일
  ────────────────────        ─────────────────────       ──────────────────────
  React Router                Context API                  TypeScript + React
  렌더링 전략                  Zustand                      RHF + Zod
  RSC / Next.js               컴포넌트 설계 패턴            폼 UX + 접근성
  TanStack Query              Feature-based 구조            CSS 전략 (Tailwind)
  API 계층 설계               성능 최적화                   i18n + a11y
                              Suspense 아키텍처

  Phase 6: 테스트·품질         Phase 7: 빌드·배포·운영
  ──────────────────          ─────────────────────────
  RTL (사용자 관점 테스트)      Vite 빌드 (ESBuild/Rollup)
  E2E (Playwright, CUJ)       배포 전략 + CI/CD
  코드 품질 자동화              프로덕션 모니터링 (Sentry)
                              종합 프로젝트 (이 Step)

  전체 흐름:
  "React 내부 원리 이해" → "실무 기술 스택 적용" → "프로덕션 운영"
```

### 1.4 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · 42단계 전체 통합 복습                                 │
│  · 기술 스택 최종 정리                                   │
│  · 핵심 원칙 10선                                        │
│  · 종합 프로젝트 아이디어와 체크리스트                    │
│  · 기술 선택 결정 가이드                                 │
│  · React 개발자 성장 로드맵 (깊이 / 너비)               │
│  · 자가 수준 진단 체크리스트                             │
│  · 사례 연구 (실전 프로젝트 통합 패턴)                   │
│  · FAQ (로드맵 완료 후 자주 묻는 질문)                   │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · 각 기술의 새로운 개념 (이미 앞 Step에서 다뤘음)       │
│  · GraphQL, Redux 등 로드맵 범위 외 기술                │
│  · 특정 회사의 채용 프로세스                             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어 — 로드맵 핵심 원칙

### 2.1 42단계를 관통하는 10가지 원칙

각 원칙은 단순한 조언이 아니라 React 생태계의 설계 철학에서 비롯된 것이다. 이 원칙들이 서로 어떻게 연결되는지 이해하면 새로운 상황에서도 올바른 판단을 내릴 수 있다.

```
42단계를 관통하는 10가지 원칙

  1. "선언적으로 사고한다" (Declarative)
     · 명령적 DOM 조작 → JSX 선언
     · if(isLoading) → <Suspense fallback>
     · 수동 에러 처리 → <ErrorBoundary>

  2. "합성으로 구성한다" (Composition)
     · 상속이 아닌 합성으로 UI를 구성
     · children, Compound Pattern, Slot Pattern
     · Hook의 합성 = 로직의 재사용

  3. "관심사를 분리한다" (Separation of Concerns)
     · UI(컴포넌트) / 로직(Hook) / 데이터(Service) / 스타일(CSS)
     · Server State(TanStack Query) / Client State(Zustand)
     · 3계층 API 아키텍처 (HTTP → Service → Hook)

  4. "단방향으로 흐른다" (Unidirectional Data Flow)
     · Props는 위에서 아래로
     · State 변경 → 리렌더링 → UI 업데이트
     · 의존성 방향: pages → features → shared

  5. "측정 없이 최적화하지 않는다" (Measure First)
     · Profiler, Lighthouse, DevTools로 먼저 측정
     · 병목을 식별한 후에만 최적화 적용
     · "충분히 빠르면" 더 최적화하지 않는다

  6. "사용자처럼 테스트한다" (Test User Behavior)
     · 구현 세부사항이 아닌 사용자 경험을 테스트
     · getByRole > getByTestId
     · CUJ 중심의 E2E 테스트

  7. "자동화할 수 있는 것은 자동화한다" (Automate)
     · ESLint + Prettier + Husky = 코드 품질 자동화
     · CI/CD = 빌드·테스트·배포 자동화
     · 사람은 설계와 로직에 집중

  8. "타입으로 안전하게 한다" (Type Safety)
     · TypeScript로 Props, Hook, API 응답의 타입 보장
     · Zod로 런타임 검증 + 타입 추론 동시 달성
     · Discriminated Union으로 조건부 로직 안전하게

  9. "모든 사용자를 위해 만든다" (Accessibility)
     · 시맨틱 HTML이 접근성의 80%
     · ARIA는 HTML이 부족할 때만 보완
     · 키보드 접근성, 색상 대비, 스크린 리더

  10. "배포는 끝이 아니라 시작이다" (Production Mindset)
     · 배포 후 모니터링 (Sentry, Web Vitals)
     · 롤백이 쉬운 구조 설계
     · Feature Flag로 안전한 릴리스
```

### 2.2 원칙 간의 상호 관계

10가지 원칙은 독립적으로 존재하는 것이 아니라 서로를 강화한다. "선언적으로 사고한다"(원칙 1)는 "사용자처럼 테스트한다"(원칙 6)와 깊이 연결된다. 선언적으로 작성된 컴포넌트는 내부 구현을 숨기고 외부 동작만 노출하므로, 테스트도 그 동작을 기준으로 작성할 수 있다.

"관심사를 분리한다"(원칙 3)는 "자동화할 수 있는 것은 자동화한다"(원칙 7)를 가능하게 한다. UI, 로직, 데이터가 명확히 분리되어 있어야 각 계층을 독립적으로 테스트하고 린트 규칙을 적용하기 쉬워진다. 분리가 잘 된 코드는 자동화 도구가 더 효과적으로 작동한다.

"측정 없이 최적화하지 않는다"(원칙 5)는 "배포는 끝이 아니라 시작이다"(원칙 10)와 연결된다. 개발 환경에서의 Lighthouse 측정과 프로덕션의 Web Vitals(RUM)는 서로 다른 정보를 제공한다. 두 측정을 병행해야 실제 사용자 경험 기반의 최적화가 가능하다.

```
원칙 간 연결 구조:

  선언적 사고 ──────────────▶ 사용자 관점 테스트
       │                              │
       ▼                              ▼
  관심사 분리 ──────────────▶ 자동화 가능성 증가
       │                              │
       ▼                              ▼
  타입 안전성 ──────────────▶ 리팩토링 안전성
       │                              │
       ▼                              ▼
  측정 우선 최적화 ──────────▶ 프로덕션 마인드셋
```

### 2.3 프로덕션 React 기술 스택 총정리

```
┌──────────────────────────────────────────────────────────────┐
│                    React 프로덕션 기술 스택                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  코어:          React 19 + TypeScript                        │
│  라우팅:        React Router v6+ 또는 Next.js App Router     │
│  서버 데이터:   TanStack Query + Axios/fetch                 │
│  전역 상태:     Zustand (빈번) + Context (드문 전역)          │
│  폼:           React Hook Form + Zod                         │
│  스타일:        Tailwind CSS + shadcn/ui                     │
│  빌드:          Vite (CSR) 또는 Next.js (SSR)                │
│  테스트:        Vitest + RTL + MSW + Playwright              │
│  린트/포맷:     ESLint + Prettier + Husky                    │
│  배포:          Vercel + GitHub Actions                      │
│  모니터링:      Sentry + web-vitals                          │
│  i18n:         react-i18next                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.4 기술 선택 결정 흐름도

42단계를 마친 후에도 "이 상황에 어떤 기술을 써야 하는가"를 매번 고민하는 것은 자연스럽다. 다음 흐름도를 참고하면 일관된 기준으로 결정할 수 있다.

```
기술 선택 결정 가이드

  렌더링:
    SEO가 중요한가? → Next.js (SSR/SSG)
    SPA로 충분한가? → Vite + React Router
    판단 기준: Step 19, 21

  서버 데이터:
    API 데이터가 있는가? → TanStack Query (항상)
    캐싱, 리패칭, 에러 재시도가 필요한가? → TanStack Query (항상)
    판단 기준: Step 22~24

  전역 상태:
    서버 데이터 → TanStack Query (Zustand 아님!)
    변경 드문 전역 → Context (테마, 인증)
    변경 빈번 전역 → Zustand (장바구니, UI 상태)
    판단 기준: Step 25~26

  폼:
    필드 3개+ / 복잡한 검증 → RHF + Zod
    검색바 하나 → useState
    판단 기준: Step 32

  스타일:
    빠른 개발 → Tailwind CSS + shadcn/ui
    기존 CSS 선호 → CSS Modules
    RSC 사용 → Tailwind 또는 CSS Modules (CSS-in-JS 런타임 제외)
    판단 기준: Step 34

  테스트:
    핵심 컴포넌트 → RTL + MSW (필수)
    핵심 흐름 → Playwright E2E (5~10개)
    유틸/Hook → Vitest 단위 테스트
    판단 기준: Step 36~37
```

---

## 3. 이론과 원리 — 42단계 통합 복습

### 3.1 Phase 0~7 한눈에 보기

```
Phase 0: 기반 다지기 (Step 1~3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 1.  개발 환경 — Node.js, VS Code, Vite, 프로젝트 생성
  Step 2.  JavaScript 핵심 — ES Module, 구조 분해, Spread, Promise, async/await
  Step 3.  React 생태계 — SPA, Virtual DOM, JSX, 빌드 도구의 역할

  이 Phase의 핵심:
    "React를 시작하기 위한 도구와 언어 기반을 확립한다"


Phase 1: React 핵심 원리 (Step 4~10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 4.  JSX — 표현식, 조건부 렌더링, 리스트(key)
  Step 5.  Props — 단방향 흐름, children, Composition > 상속
  Step 6.  useState — Immutable 업데이트, 배치, 클로저
  Step 7.  Reconciliation — Diffing, key의 역할, Virtual DOM
  Step 8.  Form — Controlled/Uncontrolled, 이벤트, 검증
  Step 9.  조건부 렌더링 — 패턴 5가지, Guard Clause
  Step 10. Fiber 아키텍처 — Concurrent, Time Slicing, Lane 모델

  이 Phase의 핵심:
    "React가 어떻게 UI를 만들고, 상태를 관리하고, DOM을 업데이트하는가"


Phase 2: Hook 심화와 패턴 (Step 11~17)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 11. useEffect — 생명주기, Cleanup, AbortController
  Step 12. useRef — DOM 참조, 리렌더링 없는 값, forwardRef
  Step 13. useReducer — Action/Dispatch, 복합 State
  Step 14. 메모이제이션 — useMemo, useCallback, React.memo, Profiler
  Step 15. 신규 Hooks — useTransition, useDeferredValue, use()
  Step 16. Custom Hook — 추출 기준, 합성, 테스트
  Step 17. Error Boundary — 에러 분류, 계층적 처리, AsyncBoundary

  이 Phase의 핵심:
    "Hook으로 로직을 재사용하고 에러를 체계적으로 처리한다"


Phase 3: 라우팅과 데이터 레이어 (Step 18~24)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 18. React Router — Nested Routes, Data Router, Protected Route
  Step 19. 렌더링 전략 — CSR, SSR, SSG, ISR, Streaming SSR
  Step 20. RSC — Server/Client Component, "use client" 경계
  Step 21. Next.js App Router — 파일 규약, 특수 파일, Server Actions
  Step 22. REST API + 수동 패칭 — fetch/Axios, 수동 패칭의 7가지 한계
  Step 23. TanStack Query — useQuery, useMutation, 캐싱, Optimistic Update
  Step 24. API 계층 설계 — 3계층(HTTP→Service→Hook), 에러 표준화, 토큰 관리

  이 Phase의 핵심:
    "URL로 페이지를, TanStack Query로 서버 데이터를, 3계층으로 API를 관리한다"


Phase 4: 상태 관리와 아키텍처 설계 (Step 25~30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 25. Context API — Provider, 리렌더링 문제, 최적화 4전략
  Step 26. Zustand — selector 부분 구독, 미들웨어, Anti-pattern
  Step 27. 컴포넌트 설계 — Compound, Headless, Render Props, HOC
  Step 28. 프로젝트 구조 — Feature-based, 의존성 방향, Barrel Export
  Step 29. 성능 최적화 — Core Web Vitals, 코드 분할, Virtualization
  Step 30. Suspense 아키텍처 — 선언적 로딩, 경계 배치, Streaming

  이 Phase의 핵심:
    "상태를 올바른 도구로, 컴포넌트를 유연하게, 구조를 체계적으로 설계한다"


Phase 5: 타입 안전성·폼·스타일링 (Step 31~35)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 31. TypeScript — Props/Hook/Event/Ref 타입, Generic, 유틸리티 타입
  Step 32. React Hook Form + Zod — Uncontrolled 성능, 스키마=타입+검증
  Step 33. 폼 UX — 검증 시점 전략, 접근성(ARIA), 자동 저장
  Step 34. CSS 전략 — Tailwind, CSS Modules, shadcn/ui, 디자인 토큰
  Step 35. i18n + a11y — react-i18next, WCAG 4원칙, 시맨틱 HTML, ARIA

  이 Phase의 핵심:
    "타입으로 안전하고, 폼이 사용하기 쉽고, 모든 사용자가 사용할 수 있는 앱"


Phase 6: 테스트와 품질 보증 (Step 36~38)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 36. RTL — "사용자처럼 테스트", 쿼리 우선순위, MSW, renderHook
  Step 37. E2E + 전략 — Playwright, CUJ, Page Object Model, Flaky 방지
  Step 38. 코드 품질 — ESLint, Prettier, Husky, 코드 리뷰, Storybook

  이 Phase의 핵심:
    "테스트로 동작을, 도구로 코드 품질을, 사람이 설계를 보증한다"


Phase 7: 빌드·배포·프로덕션 (Step 39~42)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 39. Vite 빌드 — ESBuild/Rollup, 환경 변수, manualChunks
  Step 40. 배포 + CI/CD — Vercel, GitHub Actions, Feature Flag, 롤백
  Step 41. 모니터링 — Sentry, Source Map, Web Vitals, 알림
  Step 42. 종합 프로젝트 + 마무리 (이 Step)

  이 Phase의 핵심:
    "빌드하고, 배포하고, 모니터링하며 프로덕션에서 운영한다"
```

### 3.2 Phase별 핵심 트레이드오프

각 Phase의 주요 선택지에는 트레이드오프가 있다. 이 트레이드오프를 명확히 이해하고 있으면 상황에 맞는 판단을 내릴 수 있다.

```
주요 기술 선택의 트레이드오프

  CSR vs SSR:
    CSR: 빠른 개발, 정적 호스팅, SEO 취약, 초기 로딩 느림
    SSR: SEO 강력, 초기 로딩 빠름, 서버 필요, 복잡도 증가
    → 판단 기준: SEO 중요도, 팀 규모, 인프라 비용

  Context vs Zustand:
    Context: 설정 없음, 트리 전체 리렌더링, 낮은 빈도 변경에 적합
    Zustand: selector로 최소 리렌더링, 설정 간단, 높은 빈도 변경에 적합
    → 판단 기준: 상태 변경 빈도, 구독자 범위

  CSS Modules vs Tailwind:
    CSS Modules: 명시적 이름, 번들 크기 작음, HTML-CSS 분리 필요
    Tailwind: 빠른 개발, 일관성, HTML 가독성 저하, PurgeCSS로 번들 최소화
    → 판단 기준: 팀 선호, 프로젝트 특성, 디자인 시스템 유무

  RTL vs Playwright:
    RTL: 빠름, jsdom 환경, 컴포넌트 단위, API 모킹 필요
    Playwright: 실제 브라우저, 전체 흐름, 느림, Flaky 가능성
    → 판단 기준: 테스트 대상(부품 vs 흐름), CI 허용 시간
```

### 3.3 "언제 무엇을 쓰는가" 요약표

```
┌──────────────────┬───────────────────────┬───────────────────────┐
│  상황            │  권장 도구            │  근거                  │
├──────────────────┼───────────────────────┼───────────────────────┤
│ 서버 데이터 패칭  │ TanStack Query        │ 캐싱/리패칭 자동 관리  │
│ 클라이언트 UI 상태│ useState + Zustand    │ 서버 데이터와 분리     │
│ 인증/테마 전역   │ Context               │ 변경 드문 전역 값      │
│ 복잡한 폼        │ RHF + Zod             │ 성능 + 타입 안전성     │
│ 접근성           │ 시맨틱 HTML 우선      │ ARIA는 보완 수단       │
│ 스타일           │ Tailwind + shadcn/ui  │ 빠른 개발, 일관성      │
│ 에러 처리        │ Error Boundary + Sentry│ 선언적 + 자동 수집    │
│ 데이터 로딩 UI   │ Suspense + Skeleton   │ 선언적 로딩 상태       │
│ 배포             │ Vercel + Git 연동     │ 가장 간편한 자동화     │
│ 에러 모니터링    │ Sentry + Source Map   │ 원본 코드로 디버깅     │
└──────────────────┴───────────────────────┴───────────────────────┘
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 이커머스 앱 — 42단계 기술 통합

실제 이커머스 앱을 42단계의 기술로 구성했을 때 각 기술이 어떻게 맞물리는지 살펴본다. 이 사례는 "기술을 나열하는 것"이 아니라 "왜 이 구조로 만들었는가"에 집중한다.

```
이커머스 앱 아키텍처 설계 결정

  [인증 시스템]
    · Zustand: 로그인 상태 (userId, token) — 빈번한 접근, 전역 필요
    · Context 대신 Zustand를 선택한 이유:
      HeaderComponent, CartSummary, ProductCard 등 수십 개 컴포넌트가
      구독. Context면 매 구독 시 전체 Provider 자식 리렌더링 발생.
      Zustand selector로 필요한 값만 구독.

  [상품 데이터]
    · TanStack Query: useQuery로 상품 목록/상세 캐싱
    · staleTime: 5분 → 5분 내 재방문 시 API 호출 없음 (캐시 재사용)
    · 상품 상세 prefetch: 목록에서 hover 시 상세 데이터 미리 패칭
    · Zustand 사용하지 않은 이유: 서버 데이터는 TanStack Query가 담당

  [장바구니 상태]
    · Zustand + persist 미들웨어: localStorage 동기화
    · 브라우저 닫아도 장바구니 유지
    · addItem/removeItem/clearCart 액션 정의

  [결제 폼]
    · RHF + Zod: 15개 필드 (주소, 카드 정보, 연락처)
    · Zod 스키마: 카드 번호 Luhn 알고리즘 검증, 만료일 미래 날짜 검증
    · ARIA: aria-invalid, aria-describedby로 에러 메시지 연결
    · 검증 시점: 제출 후 → onChange 전환 전략 (Step 33)

  [테스트 전략]
    · RTL + MSW: ProductList, CartSummary, CheckoutForm 컴포넌트
    · Playwright CUJ 5개:
      - 회원가입 → 로그인 → 홈
      - 상품 검색 → 상세 → 장바구니 추가
      - 로그인 → 장바구니 → 결제 진행
      - 비로그인 → 보호 페이지 → 리다이렉트
      - 주문 완료 → 주문 내역 확인

  [배포 + 모니터링]
    · Vercel: main 머지 시 자동 배포, PR마다 Preview
    · GitHub Actions: lint → typecheck → test → e2e → deploy
    · Sentry: 결제 에러에 별도 Alert Rule (에러율 > 0.1% = 즉시 알림)
    · manualChunks: vendor-react, vendor-query, vendor-ui 분리
      → 앱 코드만 배포마다 변경, 라이브러리는 캐시 유지
```

### 4.2 사례: 프로젝트 관리 도구 — 상태 설계

```
칸반 보드 프로젝트의 상태 설계

  상태 분류:
    · 보드/태스크 데이터 → TanStack Query (서버에서 관리)
    · 드래그 중인 태스크 → useState (로컬, 일시적)
    · 필터/정렬 설정 → Zustand (전역 UI 상태, URL과도 동기화)
    · 모달 열림 여부 → useState (로컬 컴포넌트 상태)
    · 현재 선택된 보드 ID → URL params (뒤로가기, 공유 가능해야 함)

  Optimistic Update (TanStack Query):
    태스크를 다른 컬럼으로 이동 →
    1. 즉시 UI에 반영 (낙관적 업데이트)
    2. 서버에 mutation 전송
    3. 성공: 서버 데이터로 캐시 갱신
    4. 실패: 이전 상태로 롤백 + 에러 토스트

  Compound Component 패턴 (Step 27):
    <KanbanBoard>
      <KanbanBoard.Column status="todo">
        <KanbanBoard.Card task={task} />
      </KanbanBoard.Column>
    </KanbanBoard>

  "왜 이 구조를 선택했는가":
    Column과 Card가 Board의 Context(드래그 상태, 핸들러)에 접근 가능
    외부에서 조합 방식을 제어 가능 (유연성)
    각 컴포넌트가 독립적으로 테스트 가능 (Step 27 이유)
```

### 4.3 사례: 성능 문제 진단 — 측정 우선 원칙

```
시나리오: "대시보드 페이지가 느리다"는 사용자 피드백

  1단계: 측정 (측정 없이 최적화하지 않는다)
    · Lighthouse: Performance 45점 (LCP 4.2초)
    · React Profiler: Sidebar 컴포넌트가 200ms마다 리렌더링
    · web-vitals RUM: 실제 사용자 LCP p75 = 5.1초
    · Bundle Analyzer: react-icons 전체가 번들에 포함 (200KB)

  2단계: 원인 분석
    · Sidebar 리렌더링: Zustand의 전체 store를 구독 중
      (useStore()로 전체 객체를 가져와서 한 필드만 사용)
    · react-icons: import { FaHome } from 'react-icons/fa'
      → Tree Shaking이 안 된 경우

  3단계: 최적화 적용
    · Zustand selector 적용:
      Before: const { user, theme, cart } = useStore();
      After:  const user = useStore(s => s.user);
      → Sidebar는 user가 변경될 때만 리렌더링 ★

    · react-icons Tree Shaking:
      Before: import { FaHome } from 'react-icons/fa'
      After:  import FaHome from 'react-icons/fa/FaHome'
      → 200KB → 3KB ★

  4단계: 재측정
    · Lighthouse: Performance 82점 (LCP 1.9초)
    · Bundle: -197KB (gzip 기준)
    · 교훈: "느리다" → 측정 → 원인 특정 → 최소 수정 → 재측정
```

### 4.4 사례: 신규 팀원 온보딩 — 코드 품질의 가치

```
시나리오: 4명 팀에 새 개발자 합류

  코드 품질 자동화가 없는 경우:
    · 신규 팀원: 기존 코드 스타일 파악에 1주일
    · 첫 PR: "세미콜론 빠졌어요", "들여쓰기 4칸인데 여기는 2칸이에요"
      × 20건의 스타일 피드백
    · 리뷰어: 스타일 피드백에 1시간 → 로직 검토에 30분 남음
    · 코드 머지 후: console.log 프로덕션에 포함, Hook 의존성 누락

  코드 품질 자동화가 있는 경우:
    · 신규 팀원: 첫날 ESLint/Prettier 설정 자동 적용 (VS Code)
    · 첫 PR: CI에서 ESLint 통과, Prettier 통과, 타입 체크 통과
    · 리뷰어: 스타일 피드백 0건 → 설계와 로직에 집중 (2시간)
    · Husky pre-commit: console.log 경고, Hook 의존성 누락 감지
    → "ESLint + Prettier + Husky에 1시간 투자 = 매 PR마다 수 시간 절약" ★

  추가 효과:
    · 팀 전체가 동일한 코드 스타일 → diff가 깔끔 → 코드 고고학이 쉬워짐
    · 새 팀원이 "어떻게 써야 하는가"를 도구가 안내 → 온보딩 단축
```

### 4.5 사례: CI/CD + 모니터링 통합 운영

```
프로덕션 운영의 전체 흐름

  [코드 변경 → 배포]
  기능 개발 → PR 생성
    → GitHub Actions CI: lint(10초) + typecheck(15초) + test(30초) + e2e(2분)
    → Vercel Preview 배포 → PR에 Preview URL 댓글
    → 코드 리뷰 (설계/로직 집중, 스타일/타입은 이미 자동 보장)
    → main 머지 → 자동 프로덕션 배포 (약 30초)

  [배포 후 모니터링]
  Sentry Release Tracking → "v2.4.0 배포됨" 자동 감지
    → 배포 전후 에러율 비교
    → 5분 후 Sentry 알림 없음 → 정상 배포 확인

  [이상 감지]
  Sentry Alert: "TypeError 급증 — 지난 5분 50건"
    → Sentry 대시보드: v2.4.0에서 처음 발생
    → Source Map으로 원인 파악: ProductService.ts:42
    → Vercel 대시보드: v2.3.9로 즉시 롤백 (2분)
    → 에러율 정상화 확인
    → 다음날: 원인 수정 → 테스트 추가 → v2.4.1 배포

  교훈:
    · CI/CD가 "나쁜 코드"를 방지하고
    · 모니터링이 "배포 후 문제"를 즉시 감지하고
    · 롤백이 "문제 상황"에서 빠르게 복구한다
    → 세 축이 함께 동작해야 진정한 "배포 두려움 없는 팀"이 된다 ★
```

---

## 5. 종합 프로젝트 설계 가이드

### 5.1 프로젝트 아이디어 3선

```
프로젝트 A: 이커머스 앱 (중급)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  기능: 상품 목록/검색/필터, 상세 페이지, 장바구니,
        결제(시뮬레이션), 주문 내역, 리뷰, 사용자 인증

  학습 포인트:
    · TanStack Query: 상품 목록 캐싱, Infinite Query
    · Zustand: 장바구니 (persist)
    · RHF + Zod: 결제 폼, 회원가입
    · React Router: Nested Routes, Protected Route
    · Tailwind + shadcn/ui: 반응형 UI
    · Playwright: 구매 흐름 E2E


프로젝트 B: 프로젝트 관리 도구 (중~상급)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  기능: 칸반 보드 (드래그 앤 드롭), 태스크 CRUD, 팀원 할당,
        필터/정렬, 대시보드, 실시간 알림(시뮬레이션)

  학습 포인트:
    · Compound Component: 칸반 보드 UI
    · Zustand: 보드/태스크 상태
    · Optimistic Update: 드래그 결과 즉시 반영
    · Virtualization: 대규모 태스크 목록
    · Feature-based 구조: boards, tasks, users
    · TypeScript: Generic Component (DataTable)


프로젝트 C: 블로그/콘텐츠 플랫폼 (상급, Next.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  기능: 게시글 CRUD, 마크다운 에디터, 카테고리/태그,
        검색, 댓글, 사용자 프로필, SEO 최적화

  학습 포인트:
    · Next.js App Router: SSR/SSG 혼합
    · RSC: 게시글 목록(Server), 에디터(Client)
    · Server Actions: 게시글 생성/수정
    · react-i18next: 다국어 지원
    · Sentry: 에러 모니터링 통합
    · Vercel 배포 + Preview
```

### 5.2 프로젝트 진행 체크리스트

> 🔗 [StackBlitz에서 종합 프로젝트 시작하기](https://stackblitz.com/)

```
┌─────────────────────────────────────────────────────────────┐
│                    프로젝트 진행 체크리스트                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1단계: 설계 (1~2일)                                        │
│  □ 요구사항 정의 (기능 목록, 페이지 구성)                   │
│  □ 기술 스택 선택과 근거                                    │
│  □ 폴더 구조 설계 (Feature-based)                           │
│  □ 데이터 모델 정의 (TypeScript interface)                  │
│  □ API 엔드포인트 설계 (또는 모킹 계획)                    │
│  □ 상태 관리 전략 (어떤 데이터를 어떤 도구로)              │
│                                                              │
│  2단계: 기반 구축 (1~2일)                                   │
│  □ 프로젝트 생성 (Vite 또는 Next.js)                       │
│  □ ESLint + Prettier + Husky 설정                          │
│  □ Tailwind CSS + shadcn/ui 설정                           │
│  □ Path Alias 설정                                         │
│  □ 환경 변수 설정 (.env)                                   │
│  □ API 클라이언트 + TanStack Query 설정                    │
│  □ Zustand Store (필요한 경우)                              │
│  □ 라우팅 기본 구조                                        │
│  □ 레이아웃 컴포넌트 (Header, Sidebar, Footer)             │
│                                                              │
│  3단계: 핵심 기능 구현 (5~10일)                             │
│  □ 인증 (로그인/로그아웃/보호된 라우트)                    │
│  □ 핵심 CRUD 기능 (목록 + 상세 + 생성 + 수정 + 삭제)      │
│  □ 데이터 패칭 (TanStack Query + API Service)              │
│  □ 폼 (RHF + Zod 검증)                                    │
│  □ 검색/필터/정렬                                          │
│  □ 에러 처리 (Error Boundary + 에러 UI)                    │
│  □ 로딩 처리 (Suspense + Skeleton)                         │
│                                                              │
│  4단계: 품질 향상 (2~3일)                                   │
│  □ TypeScript strict 모드 검증                              │
│  □ 반응형 디자인 (모바일/데스크톱)                          │
│  □ 다크 모드                                                │
│  □ 접근성 검증 (axe, Lighthouse)                           │
│  □ 성능 최적화 (코드 분할, 이미지, 번들 분석)              │
│                                                              │
│  5단계: 테스트 (2~3일)                                      │
│  □ 핵심 컴포넌트 테스트 (RTL + MSW)                        │
│  □ Custom Hook 테스트                                      │
│  □ CUJ E2E 테스트 (Playwright, 3~5개)                     │
│                                                              │
│  6단계: 배포 + 모니터링 (1~2일)                             │
│  □ GitHub Actions CI 파이프라인                             │
│  □ Vercel 배포 설정                                        │
│  □ 환경 변수 (프로덕션)                                    │
│  □ Sentry 에러 모니터링 통합                               │
│  □ Source Map 업로드                                       │
│  □ 최종 Lighthouse 점수 확인                               │
│                                                              │
│  7단계: 문서화 + 마무리 (1일)                               │
│  □ README 작성 (프로젝트 소개, 기술 스택, 실행 방법)       │
│  □ 아키텍처 다이어그램                                     │
│  □ 주요 기술 결정의 근거 문서                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. React 개발자 성장 로드맵

### 6.1 이 로드맵 이후의 방향

```
이 42단계 로드맵은 "React로 프로덕션 앱을 만들 수 있는 역량"을 목표로 했다.
이후에는 깊이(Depth)와 너비(Breadth) 두 방향으로 성장할 수 있다.


깊이 (Depth) — 전문성 강화
━━━━━━━━━━━━━━━━━━━━━━━━━━

  React 내부:
    · React 소스 코드 읽기 (Fiber, Reconciler)
    · React Compiler 동작 원리
    · Concurrent Features 심화 (Transitions, Offscreen)
    · Server Component 프로토콜 이해

  성능 엔지니어링:
    · Chrome DevTools Performance 프로파일링 심화
    · Memory Leak 진단과 해결
    · Web Worker를 활용한 오프스레드 처리
    · Service Worker와 오프라인 지원 (PWA)

  아키텍처:
    · Micro Frontend 아키텍처
    · Module Federation (Webpack 5 / Vite)
    · 모노레포 (Turborepo, Nx)
    · 디자인 시스템 구축 (Storybook + Chromatic)


너비 (Breadth) — 영역 확장
━━━━━━━━━━━━━━━━━━━━━━━━━

  풀스택:
    · Node.js + Express/Fastify 백엔드
    · PostgreSQL, Prisma ORM
    · Next.js API Routes / Server Actions
    · tRPC (풀스택 타입 안전성)

  모바일:
    · React Native (모바일 앱)
    · Expo (React Native 프레임워크)

  데스크톱:
    · Electron (데스크톱 앱)
    · Tauri (경량 데스크톱 앱, Rust 기반)

  DevOps/인프라:
    · Docker + Kubernetes
    · Terraform (IaC)
    · AWS/GCP/Azure 클라우드 서비스
    · GitHub Actions 고급 워크플로우
```

### 6.2 지속적 학습 자료

```
공식 문서 (항상 최우선):
  · React: https://react.dev
  · Next.js: https://nextjs.org/docs
  · TypeScript: https://www.typescriptlang.org/docs
  · TanStack Query: https://tanstack.com/query
  · Vite: https://vite.dev

커뮤니티 블로그:
  · Dan Abramov — overreacted.io (React 핵심 개념)
  · Kent C. Dodds — kentcdodds.com (테스팅, 패턴)
  · TkDodo — tkdodo.eu (TanStack Query 실전)
  · Josh W. Comeau — joshwcomeau.com (CSS, React)
  · Matt Pocock — totaltypescript.com (TypeScript)

뉴스레터/업데이트:
  · This Week in React (주간 React 뉴스)
  · React Status (주간 뉴스레터)
  · Bytes.dev (주간 JS 뉴스)
  · React 공식 블로그 (주요 릴리스)

실전 프로젝트 참고:
  · Bulletproof React (프로젝트 구조 가이드)
  · Taxonomy (Next.js 앱 참고)
  · shadcn/ui 예제 앱
```

### 6.3 자가 진단 — 나의 현재 수준

```
아래 항목을 스스로 평가하여 보완이 필요한 영역을 식별하라.

  ┌─────────────────────────────────────────────────────┐
  │  영역                        │ 자신감 (1~5) │ 보완 │
  ├─────────────────────────────┼──────────────┼──────┤
  │  JSX, Props, State 기초     │              │      │
  │  Hook (useEffect, useRef 등)│              │      │
  │  TypeScript + React         │              │      │
  │  라우팅 (React Router)      │              │      │
  │  데이터 패칭 (TanStack Q.)  │              │      │
  │  전역 상태 (Zustand)        │              │      │
  │  폼 (RHF + Zod)            │              │      │
  │  스타일링 (Tailwind)        │              │      │
  │  컴포넌트 설계 패턴         │              │      │
  │  프로젝트 구조              │              │      │
  │  성능 최적화                │              │      │
  │  테스트 (RTL, Playwright)   │              │      │
  │  빌드 + 배포 (Vite, CI/CD) │              │      │
  │  모니터링 (Sentry)          │              │      │
  │  접근성 (a11y)              │              │      │
  └─────────────────────────────┴──────────────┴──────┘

  · 1~2점: 해당 Step을 다시 학습하고 실습을 완수
  · 3점: 실습을 반복하고 종합 프로젝트에서 적용
  · 4~5점: 심화 학습(깊이 방향)으로 전진

  "모든 영역이 5점일 필요는 없다.
   3점 이상이면 프로덕션 앱을 만들 수 있다.
   약한 영역은 프로젝트를 만들면서 자연스럽게 보완된다."
```

---

## 7. 마무리 — 42단계를 마치며

### 7.1 이 로드맵이 제공한 것

```
이 42단계 로드맵을 통해 다음을 학습했다:

  ✅ React의 핵심 원리를 "왜 이렇게 동작하는가"부터 이해했다
     (Reconciliation, Fiber, Concurrent, Suspense)

  ✅ 실무에서 사용하는 기술 스택을 체계적으로 익혔다
     (TypeScript, TanStack Query, Zustand, RHF, Tailwind)

  ✅ 아키텍처를 설계하는 관점을 갖추었다
     (3계층 API, Feature-based 구조, 상태 관리 전략)

  ✅ 프로덕션 품질을 달성하는 방법을 알게 되었다
     (테스트, CI/CD, 모니터링, 접근성, 성능 최적화)

  ✅ "왜 이 기술을 선택하는가"를 판단하는 기준을 갖추었다
     (각 Step의 비교표, 선택 흐름도, 적합/부적합 판단)
```

### 7.2 다음 단계를 위한 조언

```
1. 종합 프로젝트를 반드시 만들어라
   · 학습한 모든 것을 하나의 프로젝트에 통합
   · "읽은 것"과 "만든 것"의 이해 깊이는 10배 차이
   · 섹션 5의 체크리스트를 따라 진행

2. 점진적으로 적용하라
   · 모든 것을 한 번에 완벽하게 할 필요 없다
   · 먼저 동작하는 앱을 만들고, 점진적으로 품질을 높여라
   · TypeScript strict 모드, 테스트, 접근성은 점진적으로

3. 커뮤니티에 참여하라
   · 오픈소스 기여 (문서 개선부터 시작)
   · 기술 블로그 작성 (학습 내용 정리)
   · 코드 리뷰 주고받기

4. 최신 동향을 따라가되, 유행에 휩쓸리지 마라
   · React 공식 블로그, This Week in React 팔로우
   · 새 도구가 나올 때: "이것이 해결하는 문제는 무엇인가?"
   · 기본기(이 로드맵의 원리)가 탄탄하면 새 도구 습득이 빠르다

5. "완벽한 코드"보다 "동작하는 코드, 그리고 개선"
   · 첫 번째 버전은 완벽하지 않아도 된다
   · 동작하는 코드 → 테스트 추가 → 리팩토링 → 반복
   · "Done is better than perfect"
```

---

## 8. 핵심 정리와 자가진단

### 8.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 42 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Phase 0~7 = "기반 → 핵심 → Hook → 데이터 →              │
│                  상태·설계 → 타입·폼·스타일 →                │
│                  테스트·품질 → 빌드·배포·모니터링"            │
│     → 각 Phase는 다음 Phase의 기반이 된다                   │
│                                                               │
│  2. 10가지 원칙은 서로를 강화한다                              │
│     → 선언적 → 합성 → 관심사 분리 → 단방향 → 측정           │
│     → 사용자 관점 테스트 → 자동화 → 타입 → 접근성 → 프로덕션 │
│                                                               │
│  3. 기술 선택은 "트레이드오프 이해"에서 나온다                 │
│     → CSR vs SSR, Context vs Zustand, RTL vs Playwright      │
│     → "항상 좋은" 기술은 없다. 상황에 맞는 최적이 있다        │
│                                                               │
│  4. 종합 프로젝트가 학습을 완성한다                            │
│     → 7단계 체크리스트로 설계 → 구현 → 품질 → 배포           │
│     → "읽은 것"과 "만든 것"의 이해 차이는 10배               │
│                                                               │
│  5. 성장 방향은 두 가지 — 깊이와 너비                         │
│     → 깊이: React 내부, 성능 엔지니어링, 아키텍처            │
│     → 너비: 풀스택, React Native, DevOps                     │
│     → 먼저 3점 이상의 React 역량을 쌓은 후 확장              │
│                                                               │
│  6. "배포는 끝이 아니라 시작이다"                              │
│     → Sentry + Web Vitals로 프로덕션 모니터링                │
│     → 롤백 + Feature Flag로 안전한 운영                      │
│     → CI/CD 자동화로 "배포 두려움" 제거                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 자가진단 퀴즈

| #   | 질문                                                        | 블룸 단계  | 확인할 섹션 |
| --- | ----------------------------------------------------------- | ---------- | ----------- |
| 1   | Phase 3에서 TanStack Query를 도입하는 핵심 이유는?          | Understand | 3.1         |
| 2   | "서버 데이터는 Zustand가 아닌 TanStack Query로"인 이유는?   | Analyze    | 2.4         |
| 3   | Context 대신 Zustand를 선택하는 기준은?                     | Evaluate   | 3.2         |
| 4   | "측정 없이 최적화하지 않는다" 원칙의 실천 방법 3가지는?     | Apply      | 4.3         |
| 5   | CI/CD와 모니터링이 "배포 두려움을 제거"하는 메커니즘은?     | Understand | 4.5         |
| 6   | 종합 프로젝트 7단계 중 가장 먼저 해야 하는 것과 이유는?     | Analyze    | 5.2         |
| 7   | 이 로드맵 이후 "깊이" 방향으로 성장할 수 있는 3가지 영역은? | Remember   | 6.1         |
| 8   | 자가 진단에서 특정 영역이 1~2점일 때 해야 하는 행동은?      | Evaluate   | 6.3         |

### 8.3 FAQ

**Q1. 42단계를 모두 마쳤는데 아직도 자신이 없습니다. 정상인가요?**

완전히 정상이다. 42단계의 내용을 "읽고 이해한 것"과 "실제로 만들어본 것"은 완전히 다른 차원의 숙련도다. 자가진단 퀴즈를 통과했더라도 처음 프로젝트를 시작하면 막히는 부분이 반드시 생긴다. 이는 실패가 아니라 정상적인 학습 과정이다. 막히는 지점이 생길 때 해당 Step으로 돌아와 다시 읽고, 실습을 직접 구현하는 것이 지식을 진짜 내 것으로 만드는 방법이다. 3점 이상인 영역이 대부분이라면 종합 프로젝트를 시작해도 충분하다.

**Q2. 종합 프로젝트를 혼자 만들기 어렵습니다. 어디서 도움을 받을 수 있나요?**

몇 가지 경로가 있다. 첫째, GitHub에 공개된 프로젝트를 참고한다. `bulletproof-react`는 Feature-based 구조의 실제 예시다. `taxonomy`는 Next.js App Router를 활용한 블로그 플랫폼 예시다. 둘째, Reactiflux Discord(공식 React 커뮤니티)와 Reddit r/reactjs에서 구체적인 문제를 질문할 수 있다. 셋째, 각 라이브러리의 공식 문서 예제를 따라 작은 기능부터 완성해나가는 방법이 가장 확실하다.

**Q3. 취업 준비를 위해 어떤 프로젝트를 만들어야 하나요?**

채용 담당자가 포트폴리오를 볼 때 가장 먼저 확인하는 것은 "이 사람이 실제로 사용자가 쓸 수 있는 앱을 만들 수 있는가"다. 프로젝트 규모보다 완성도가 중요하다. 권장 접근 방식: 섹션 5.1의 프로젝트 A(이커머스) 또는 B(프로젝트 관리 도구) 중 하나를 체크리스트를 따라 끝까지 완성한다. 특히 배포(Vercel)와 README 작성까지 완료해야 포트폴리오로 활용 가능하다. "로그인 → 핵심 CRUD → 에러 처리 → 배포"가 모두 동작하는 앱 하나가 미완성 앱 다섯 개보다 훨씬 가치 있다.

**Q4. React 말고 Vue, Svelte, Solid 같은 다른 프레임워크도 배워야 하나요?**

취업 목표라면 React 하나를 깊이 익히는 것이 우선이다. 한국과 글로벌 채용 시장에서 React의 점유율이 압도적으로 높다. 다른 프레임워크를 배우는 것은 React를 충분히 익힌 이후다. 이 로드맵에서 배운 핵심 원리(선언적 UI, 컴포넌트 합성, 반응형 상태)는 다른 프레임워크에도 동일하게 적용되므로, React를 깊이 이해하면 다른 프레임워크 습득이 훨씬 빠르다.

**Q5. 이 로드맵에서 다루지 않은 중요한 것이 있나요?**

의도적으로 범위를 제한했다. 가장 자주 언급되는 미포함 항목은 다음과 같다: GraphQL(REST로 충분한 대부분의 경우 불필요), Redux Toolkit(Zustand로 대체 가능), Storybook 심화(Step 38에서 기초만 다룸), 마이크로 프론트엔드(소규모 팀에서는 과도한 복잡성), React Native(별도 로드맵 필요). 이 중 프로젝트에서 필요성이 생긴 것부터 학습하는 것이 효율적이다.

---

## 📚 최종 참고 자료 모음

```
React 생태계 핵심 공식 문서:

  · React: https://react.dev
  · Next.js: https://nextjs.org/docs
  · TypeScript: https://www.typescriptlang.org/docs
  · TanStack Query: https://tanstack.com/query
  · Zustand: https://zustand-demo.pmnd.rs
  · React Hook Form: https://react-hook-form.com
  · Zod: https://zod.dev
  · Tailwind CSS: https://tailwindcss.com/docs
  · shadcn/ui: https://ui.shadcn.com
  · Vite: https://vite.dev
  · React Router: https://reactrouter.com
  · Playwright: https://playwright.dev
  · Testing Library: https://testing-library.com
  · Sentry: https://docs.sentry.io/platforms/javascript/guides/react
  · ESLint: https://eslint.org
  · Prettier: https://prettier.io
  · react-i18next: https://react.i18next.com
  · MSW: https://mswjs.io
```

---

> **React 완성 로드맵 v2.0** | Phase 7 — 빌드·배포·프로덕션 | Step 42 of 42
>
> **42단계 전체 완료!**
> 이제 React로 프로덕션 품질의 앱을 설계·구현·배포·운영할 수 있습니다.
