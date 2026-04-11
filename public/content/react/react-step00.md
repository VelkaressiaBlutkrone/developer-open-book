# React 완성 로드맵 — 전체 구성표

> **설계 원칙:** 이론 80% + 실습 20% | Revised Bloom's Taxonomy 기반 | Kirkpatrick Level 1~2 평가 내장
> **대상:** JavaScript 기초 문법을 아는 학습자 → 프로덕션 레벨 React 개발자
> **총 구성:** 8개 Phase, 40 Steps

---

## 각 Step 문서 내부 구조 (공통)

```
┌─────────────────────────────────────────────────────────┐
│  1. 서론            │ 10~15% │ 동기 유발 + 맥락 + 학습 목표  │
│  2. 기본 개념·용어   │ 20~25% │ 핵심 용어 정의 + 관계성       │
│  3. 이론·원리        │ 30~35% │ 근본 원리 심층 탐구 ★ 핵심    │
│  4. 사례 연구·예시   │ 15~20% │ 이론 ↔ 실제 코드 연결        │
│  5. 실습             │ 20%   │ 이론 검증용 과제 (블룸 3~6)   │
│  6. 핵심 정리·다음단계│ 5~10% │ 요약 + 자가진단 + 참고자료    │
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ Phase 0 — 개발 환경과 생태계 이해 (Step 1~3)

> **블룸 중심 단계:** Remembering ~ Understanding
> **목표:** React를 실행하기 위한 환경을 이해하고 구성한다

| Step  | 제목                               | 핵심 키워드                                                   |
| ----- | ---------------------------------- | ------------------------------------------------------------- |
| **1** | **개발 환경 설치와 프로젝트 구조** | Node.js, npm/pnpm, Vite, 프로젝트 스캐폴딩, 디렉토리 구조     |
| **2** | **모던 JavaScript 필수 문법 복습** | ES6+, Destructuring, Spread, Arrow Function, Module, Promise  |
| **3** | **React 생태계 조감도**            | SPA 개념, React의 위치, 라이브러리 vs 프레임워크, 생태계 지도 |

---

## 🏗️ Phase 1 — React Core Mechanics (Step 4~10)

> **블룸 중심 단계:** Understanding ~ Applying
> **목표:** "왜 이렇게 동작하는가"를 이론적으로 이해한다

| Step   | 제목                              | 핵심 키워드                                                                |
| ------ | --------------------------------- | -------------------------------------------------------------------------- |
| **4**  | **JSX와 컴포넌트 실행 모델**      | JSX → JS 변환, React.createElement, React Element, 함수 호출               |
| **5**  | **Props와 단방향 데이터 흐름**    | Immutable, One-Way Data Flow, Callback Props, Composition                  |
| **6**  | **useState와 렌더 사이클**        | Snapshot, Batching, Updater Function, Stale Closure, StrictMode            |
| **7**  | **Reconciliation과 Key 전략**     | Virtual DOM, Diff 알고리즘, key 설계, 컴포넌트 리셋                        |
| **8**  | **Form과 Synthetic Event 시스템** | Controlled vs Uncontrolled, Event Pooling, Event Delegation                |
| **9**  | **조건부 렌더링과 리스트 패턴**   | 렌더링 패턴 분류, Guard Clause, 리스트 최적화                              |
| **10** | **React 내부 구조 심층 분석**     | Fiber Architecture, Render vs Commit Phase, Concurrent Rendering, React 19 |

---

## 🛠️ Phase 2 — Hooks와 부수 효과 아키텍처 (Step 11~17)

> **블룸 중심 단계:** Applying ~ Analyzing
> **목표:** Hook의 동작 원리를 이해하고 부수 효과를 체계적으로 설계한다

| Step   | 제목                            | 핵심 키워드                                                                  |
| ------ | ------------------------------- | ---------------------------------------------------------------------------- |
| **11** | **useEffect 완전 이해**         | Lifecycle 대응, 의존성 배열, Cleanup 타이밍, 무한 루프                       |
| **12** | **useRef와 DOM 접근 전략**      | Mutable Reference, forwardRef, Imperative Handle                             |
| **13** | **useReducer와 상태 머신 설계** | Reducer 패턴, dispatch, 복합 상태 관리, FSM 개념                             |
| **14** | **메모이제이션 전략**           | useMemo, useCallback, React.memo, Profiler 기반 판단                         |
| **15** | **React 18/19 신규 Hooks**      | useTransition, useDeferredValue, useId, use(), useActionState, useOptimistic |
| **16** | **Custom Hook 설계 패턴**       | 관심사 분리, 재사용성, Hook 합성, API 디자인 원칙                            |
| **17** | **Error Handling 아키텍처**     | Error Boundary, Async 에러, Fallback UI, 사용자 경험 설계                    |

---

## 🌐 Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)

> **블룸 중심 단계:** Applying ~ Analyzing
> **목표:** 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

| Step   | 제목                                       | 핵심 키워드                                                   |
| ------ | ------------------------------------------ | ------------------------------------------------------------- |
| **18** | **React Router v6+ 심화**                  | Nested Routes, Layout Route, Data Router, Loader/Action       |
| **19** | **렌더링 전략 비교 분석**                  | CSR, SSR, SSG, ISR, Streaming, Hydration                      |
| **20** | **React Server Components (RSC)**          | Client vs Server Component, 직렬화, 번들 크기                 |
| **21** | **Next.js App Router 아키텍처**            | Layout 구조, Server Action, Route Segment, Streaming UI       |
| **22** | **데이터 패칭 전략과 패턴**                | fetch, Axios, Suspense 기반 패칭, Waterfall 문제              |
| **23** | **TanStack Query 심화**                    | Query Key 설계, Cache 전략, Optimistic Update, Infinite Query |
| **24** | **Server State vs Client State 경계 설계** | 캐시 무효화, Stale-While-Revalidate, 상태 분류 프레임워크     |

---

## 🧠 Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)

> **블룸 중심 단계:** Analyzing ~ Evaluating
> **목표:** 애플리케이션 규모에 맞는 상태 관리 전략과 구조를 설계한다

| Step   | 제목                          | 핵심 키워드                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------ |
| **25** | **Context API 심화**          | Provider 설계, 리렌더링 최적화, Context 분리 전략                  |
| **26** | **전역 상태 라이브러리 비교** | Zustand, Redux Toolkit, Jotai, Valtio, 선택 기준                   |
| **27** | **상태 아키텍처 전략**        | 파생 상태, Single Source of Truth, 상태 정규화                     |
| **28** | **폴더 구조와 모듈 설계**     | Feature Folder, Atomic Design, Layered Architecture, Barrel Export |
| **29** | **고급 컴포넌트 패턴**        | Compound, Headless, Controlled, Render Props, HOC                  |
| **30** | **Suspense와 Code Splitting** | React.lazy, Dynamic Import, Loading UX, Error + Suspense 결합      |

---

## 🎨 Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)

> **블룸 중심 단계:** Applying ~ Evaluating
> **목표:** 타입 시스템, 폼 처리, 스타일링의 이론과 최적 전략을 파악한다

| Step   | 제목                              | 핵심 키워드                                                      |
| ------ | --------------------------------- | ---------------------------------------------------------------- |
| **31** | **React + TypeScript 심화**       | Generic Props, Polymorphic Component, Utility Types, 타입 추론   |
| **32** | **런타임 검증과 API 타입 안전성** | Zod, 스키마 검증, End-to-End Type Safety                         |
| **33** | **고급 Form 아키텍처**            | React Hook Form, 서버 검증 통합, 비동기 폼, 다단계 폼            |
| **34** | **스타일링 전략 비교**            | Tailwind CSS, CSS Modules, CSS-in-JS, 디자인 시스템, 디자인 토큰 |
| **35** | **애니메이션과 인터랙션**         | Framer Motion, CSS Transitions, Layout Animation, Gesture        |

---

## 🧪 Phase 6 — 테스트와 품질 보증 (Step 36~38)

> **블룸 중심 단계:** Analyzing ~ Evaluating
> **목표:** 테스트 전략을 수립하고 품질 지표를 이해한다

| Step   | 제목                       | 핵심 키워드                                                      |
| ------ | -------------------------- | ---------------------------------------------------------------- |
| **36** | **테스트 전략과 피라미드** | Vitest, React Testing Library, 테스트 분류, 테스트 설계 원칙     |
| **37** | **통합 테스트와 E2E**      | MSW(Mock Service Worker), Playwright, 테스트 시나리오 설계       |
| **38** | **접근성과 성능 최적화**   | ARIA, Keyboard Navigation, Lighthouse, Core Web Vitals, Profiler |

---

## 🏭 Phase 7 — 프로덕션과 DevOps (Step 39~42)

> **블룸 중심 단계:** Evaluating ~ Creating
> **목표:** 빌드, 배포, 운영 전략을 설계하고 실무 파이프라인을 구축한다

| Step   | 제목                      | 핵심 키워드                                                          |
| ------ | ------------------------- | -------------------------------------------------------------------- |
| **39** | **번들링과 빌드 시스템**  | Vite 심화, 번들 분석, Tree Shaking, Code Splitting 전략              |
| **40** | **배포 전략과 환경 관리** | Vercel, Netlify, 환경 변수, Preview Deploy, Edge Function            |
| **41** | **컨테이너화와 CI/CD**    | Docker, GitHub Actions, 브랜치 전략, 자동화 파이프라인               |
| **42** | **보안과 실무 운영**      | XSS, CSRF, 인증 토큰 전략, 에러 모니터링(Sentry), 로깅, Feature Flag |

---

## 📊 Phase별 블룸 분류법 분포

```
Phase 0 (환경)     ████████░░░░░░░░░░░░░░░░  Remembering ~ Understanding
Phase 1 (Core)     ░░░░████████████░░░░░░░░  Understanding ~ Applying
Phase 2 (Hooks)    ░░░░░░░░████████████░░░░  Applying ~ Analyzing
Phase 3 (Routing)  ░░░░░░░░████████████░░░░  Applying ~ Analyzing
Phase 4 (상태)     ░░░░░░░░░░░░████████████  Analyzing ~ Evaluating
Phase 5 (타입/폼)  ░░░░░░░░████████████████  Applying ~ Evaluating
Phase 6 (테스트)   ░░░░░░░░░░░░████████████  Analyzing ~ Evaluating
Phase 7 (DevOps)   ░░░░░░░░░░░░░░░░████████  Evaluating ~ Creating
```

---

## 📐 Step 간 의존성 맵 (주요 선수 학습 관계)

```
Step 1 (환경 설치)
  └→ Step 2 (JS 복습) → Step 3 (생태계) → Step 4 (JSX)
                                              │
     ┌──────────────────────────────────────────┘
     ▼
Step 5 (Props) → Step 6 (useState) → Step 7 (Reconciliation)
     │                │                    │
     │                ▼                    ▼
     │           Step 11 (useEffect)  Step 9 (리스트)
     │                │
     ▼                ▼
Step 8 (Form)   Step 12 (useRef) → Step 13 (useReducer)
                      │
                      ▼
                Step 14 (메모이제이션) → Step 16 (Custom Hook)
                      │
                      ▼
                Step 15 (신규 Hooks) → Step 10 (내부 구조)
                                           │
                ┌──────────────────────────┘
                ▼
           Step 18 (Router) → Step 19 (렌더링 전략)
                │                    │
                ▼                    ▼
           Step 22 (패칭)      Step 20 (RSC) → Step 21 (Next.js)
                │
                ▼
           Step 23 (TanStack Query) → Step 24 (상태 경계)
                                           │
                ┌──────────────────────────┘
                ▼
           Step 25 (Context) → Step 26 (전역 상태) → Step 27 (아키텍처)
                                                          │
                ┌─────────────────────────────────────────┘
                ▼
           Step 28 (폴더 구조) → Step 29 (컴포넌트 패턴) → Step 30 (Suspense)
                                                               │
                ┌──────────────────────────────────────────────┘
                ▼
           Step 31~35 (타입/폼/스타일/애니메이션)
                │
                ▼
           Step 36~38 (테스트/접근성/성능)
                │
                ▼
           Step 39~42 (빌드/배포/CI·CD/보안)
```

---

## ⏱️ 예상 학습 기간

| Phase                     | Step 수 | 예상 기간 (주당 15~20시간 기준) |
| ------------------------- | ------- | ------------------------------- |
| Phase 0 — 환경·생태계     | 3       | 1주                             |
| Phase 1 — Core Mechanics  | 7       | 2~3주                           |
| Phase 2 — Hooks·부수 효과 | 7       | 2~3주                           |
| Phase 3 — 라우팅·데이터   | 7       | 2~3주                           |
| Phase 4 — 상태·아키텍처   | 6       | 2주                             |
| Phase 5 — 타입·폼·스타일  | 5       | 2주                             |
| Phase 6 — 테스트·품질     | 3       | 1~2주                           |
| Phase 7 — 프로덕션·DevOps | 4       | 1~2주                           |
| **합계**                  | **42**  | **약 13~18주 (3~4개월)**        |

---

> **React 완성 로드맵 v2.0** | 8 Phases · 42 Steps | 이론 80% + 실습 20%
