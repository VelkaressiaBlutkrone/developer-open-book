# React 프로그래밍 목차

JavaScript 기초 문법을 아는 학습자를 프로덕션 레벨 React 개발자로 성장시키는 8개 Phase, 42 Steps 로드맵입니다.

---

| 단계    | 문서                                                                                 | 난이도  | 요약                                                          |
| ------- | ------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------- |
| 로드맵  | [React 완성 로드맵](React_Step00_완성_로드맵.md)                                     | —       | 8개 Phase, 42 Steps 전체 구성표                               |
| Step 01 | [개발 환경 설치와 프로젝트 구조](React_Step01_개발_환경_설치와_프로젝트_구조.md)     | 🟢 초급 | React 개발 환경 설치 및 프로젝트 구조 이해                    |
| Step 02 | [모던 JavaScript 필수 문법 복습](React_Step02_모던_JavaScript_필수_문법_복습.md)     | 🟢 초급 | React에 필요한 모던 JavaScript 핵심 문법 복습                 |
| Step 03 | [React 생태계 조감도](React_Step03_React_생태계_조감도.md)                           | 🟢 초급 | React 생태계 전반의 라이브러리와 도구 조감도                  |
| Step 04 | [JSX와 컴포넌트 실행 모델](React_Step04_JSX와_컴포넌트_실행_모델.md)                 | 🟢 초급 | JSX 문법과 컴포넌트 렌더링 실행 모델                          |
| Step 05 | [Props와 단방향 데이터 흐름](React_Step05_Props와_단방향_데이터_흐름.md)             | 🟢 초급 | Props를 통한 단방향 데이터 흐름 이해                          |
| Step 06 | [useState와 렌더 사이클](React_Step06_useState와_렌더_사이클.md)                     | 🟡 중급 | State 스냅샷, Batching, Updater Function, Stale Closure       |
| Step 07 | [Reconciliation과 Key 전략](React_Step07_Reconciliation과_Key_전략.md)               | 🟡 중급 | Virtual DOM, Diff 알고리즘, key 설계 전략                     |
| Step 08 | [Form과 Synthetic Event 시스템](React_Step08_Form과_Synthetic_Event_시스템.md)       | 🟡 중급 | Controlled/Uncontrolled, Synthetic Event, 폼 요소 처리        |
| Step 09 | [조건부 렌더링과 리스트 패턴](React_Step09_조건부_렌더링과_리스트_패턴.md)           | 🟡 중급 | 조건부 렌더링 6가지 패턴, 리스트 map, Empty State 설계        |
| Step 10 | [React 내부 구조 심층 분석](React_Step10_React_내부_구조_심층_분석.md)               | 🟡 중급 | Fiber Architecture, Render/Commit Phase, Concurrent Rendering |
| Step 11 | [useEffect 완전 이해](React_Step11_useEffect_완전_이해.md)                           | 🟡 중급 | 부수 효과, 의존성 배열, Cleanup, 데이터 패칭 패턴             |
| Step 12 | [useRef와 DOM 접근 전략](React_Step12_useRef와_DOM_접근_전략.md)                     | 🟡 중급 | ref 객체, DOM 직접 접근, forwardRef, Escape Hatch             |
| Step 13 | [useReducer와 상태 머신 설계](React_Step13_useReducer와_상태_머신_설계.md)           | 🟡 중급 | reducer 패턴, 복합 State, 유한 상태 머신(FSM)                 |
| Step 14 | [메모이제이션 전략](React_Step14_메모이제이션_전략.md)                               | 🟡 중급 | React.memo, useMemo, useCallback 최적화 전략                  |
| Step 15 | [React 18/19 신규 Hooks](React_Step15_React_18_19_신규_Hooks.md)                     | 🟡 중급 | useTransition, useDeferredValue, useOptimistic 등             |
| Step 16 | [Custom Hook 설계 패턴](React_Step16_Custom_Hook_설계_패턴.md)                       | 🟡 중급 | Custom Hook 추상화, 합성, 테스트 설계 패턴                    |
| Step 17 | [Error Handling 아키텍처](React_Step17_Error_Handling_아키텍처.md)                   | 🟡 중급 | Error Boundary, 선언적 에러 처리 아키텍처                     |
| Step 18 | [React Router v6 심화](React_Step18_ReactRouter_v6_심화.md)                          | 🟡 중급 | React Router v6 라우팅, Data Router, 보호 라우트              |
| Step 19 | [렌더링 전략 비교 분석](React_Step19_렌더링_전략_비교_분석.md)                       | 🟡 중급 | CSR, SSR, SSG, ISR 등 렌더링 전략 비교 분석                   |
| Step 20 | [React Server Components](React_Step20_React_Server_Components.md)                   | 🟡 중급 | React Server Components 개념과 활용                           |
| Step 21 | [Next.js App Router 핵심](React_Step21_NextJS_App_Router_핵심.md)                    | 🟡 중급 | App Router, Server/Client Components, 데이터 패칭             |
| Step 22 | [REST API 통합과 데이터 패칭 패턴](React_Step22_REST_API_통합과_데이터_패칭_패턴.md) | 🔴 고급 | fetch/axios, 로딩·에러 상태, 캐싱 전략                        |
| Step 23 | [TanStack Query](React_Step23_TanStack_Query.md)                                     | 🔴 고급 | 서버 상태 관리, staleTime, Mutation, Optimistic Update        |
| Step 24 | [API 계층 설계와 에러 처리 통합](React_Step24_API_계층_설계와_에러_처리_통합.md)     | 🔴 고급 | API 클라이언트 추상화, 인터셉터, 에러 계층 통합               |
| Step 25 | [Context API 심화](React_Step25_Context_API_심화.md)                                 | 🔴 고급 | Context 분리 전략, Provider 합성, 리렌더링 최적화             |
| Step 26 | [전역 상태 관리 Zustand](React_Step26_전역_상태_관리_Zustand.md)                     | 🔴 고급 | Zustand Store, Selector, Middleware, Devtools                 |
| Step 27 | [컴포넌트 설계 패턴](React_Step27_컴포넌트_설계_패턴.md)                             | 🔴 고급 | Compound, Render Props, HOC, Headless 패턴                    |
| Step 28 | [프로젝트 구조와 아키텍처](React_Step28_프로젝트_구조와_아키텍처.md)                 | 🔴 고급 | Feature-based, Layer-based, 의존성 방향 설계                  |
| Step 29 | [성능 최적화 심화](React_Step29_성능_최적화_심화.md)                                 | 🔴 고급 | Core Web Vitals, Code Splitting, Virtualization               |
| Step 30 | [Suspense 아키텍처와 고급 패턴](React_Step30_Suspense_아키텍처와_고급_패턴.md)       | 🔴 고급 | Suspense 경계, Streaming SSR, 데이터 로딩 조율                |
| Step 31 | [TypeScript와 React 통합](React_Step31_TypeScript와_React_통합.md)                   | 🔴 고급 | 제네릭 컴포넌트, 타입 가드, Discriminated Union               |
| Step 32 | [React Hook Form과 Zod 검증](React_Step32_React_Hook_Form과_Zod_검증.md)             | 🔴 고급 | React Hook Form, Zod 스키마, 폼 검증 통합                     |
| Step 33 | [폼 UX 패턴과 접근성](React_Step33_폼_UX_패턴과_접근성.md)                           | 🔴 고급 | 멀티 스텝 폼, 자동 저장, ARIA 폼 접근성                       |
| Step 34 | [CSS 전략과 스타일링 아키텍처](React_Step34_CSS_전략과_스타일링_아키텍처.md)         | 🔴 고급 | CSS Modules, Tailwind, CSS-in-JS, 디자인 토큰                 |
| Step 35 | [국제화 i18n과 접근성 a11y 기초](React_Step35_국제화_i18n_와_접근성_a11y_기초.md)    | 🔴 고급 | react-intl, ARIA, 키보드 내비게이션, 스크린 리더              |
| Step 36 | [컴포넌트 테스트 RTL](React_Step36_컴포넌트_테스트_RTL.md)                           | 🔴 고급 | React Testing Library, 사용자 중심 테스트, Mock               |
| Step 37 | [E2E 테스트와 테스트 전략](React_Step37_E2E_테스트와_테스트_전략.md)                 | 🔴 고급 | Playwright, 테스트 피라미드, CI 통합                          |
| Step 38 | [코드 품질과 개발 도구](React_Step38_코드_품질과_개발_도구.md)                       | 🔴 고급 | ESLint, Prettier, Husky, Git Hook 자동화                      |
| Step 39 | [Vite 빌드 시스템 심화](React_Step39_Vite_빌드_시스템_심화.md)                       | 🔴 고급 | Vite 설정, Rollup, Tree Shaking, 번들 최적화                  |
| Step 40 | [배포 전략과 CI/CD](React_Step40_배포_전략과_CICD.md)                                | 🔴 고급 | Vercel, GitHub Actions, 롤백, 블루/그린 배포                  |
| Step 41 | [프로덕션 모니터링과 에러 추적](React_Step41_프로덕션_모니터링과_에러_추적.md)       | 🔴 고급 | Sentry, Source Map, RUM, 에러 심각도 체계                     |
| Step 42 | [종합 프로젝트와 로드맵 마무리](React_Step42_종합_프로젝트와_로드맵_마무리.md)       | 🔴 고급 | 42단계 통합 복습, 종합 프로젝트, 성장 로드맵                  |
