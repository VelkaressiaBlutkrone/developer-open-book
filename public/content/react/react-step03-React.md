# Step 03. React 생태계 조감도

> **Phase 0 — 개발 환경과 생태계 이해 (Step 1~3)**
> React를 실행하기 위한 환경을 이해하고 구성한다

> **난이도:** 🟢 초급 (Beginner)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| **Remember**   | SPA, CSR, SSR, Hydration 등 핵심 용어를 정의할 수 있다                    |
| **Understand** | React가 "라이브러리"인 이유와 프레임워크와의 차이를 설명할 수 있다        |
| **Understand** | React 생태계의 주요 영역(라우팅, 상태 관리, 스타일링 등)을 분류할 수 있다 |
| **Analyze**    | 프로젝트 요구사항에 따라 적합한 기술 조합을 비교·분석할 수 있다           |
| **Evaluate**   | 이 로드맵의 42개 Step이 생태계의 어떤 영역에 대응하는지 판단할 수 있다    |

**전제 지식:**

- Step 1: 개발 환경 설치와 프로젝트 구조
- Step 2: 모던 JavaScript 필수 문법

---

## 1. 서론 — 왜 생태계 조감도가 필요한가

### 1.1 프론트엔드 프레임워크 생태계의 등장 배경

2010년대 초반, 웹 애플리케이션은 급격히 복잡해졌다. Gmail, Facebook, Twitter 같은 서비스는 더 이상 "웹 페이지"가 아니라 "웹 애플리케이션"이었다. jQuery로 DOM을 직접 조작하는 방식은 수천 개의 이벤트 리스너, 복잡한 상태 동기화, 스파게티 코드로 이어졌다. 이 문제를 해결하기 위해 프론트엔드 프레임워크가 등장했다.

```
프론트엔드 프레임워크의 3세대

  1세대 (2010~2013): Backbone.js, Ember.js, Knockout.js
    · MVC/MVVM 패턴을 웹에 적용
    · 구조화된 코드 작성이 가능해짐

  2세대 (2013~2016): Angular.js, React, Vue.js
    · 컴포넌트 기반 아키텍처
    · 선언적 UI, 가상 DOM
    · React(2013), Vue(2014), Angular 2(2016)

  3세대 (2020~현재): 메타 프레임워크 + 서버 통합
    · Next.js, Remix, Nuxt, SvelteKit
    · SSR/SSG/ISR, Server Components
    · 풀스택 React 개발
```

React는 2013년 Facebook(현 Meta)이 오픈소스로 공개한 이후, **가장 큰 생태계를 가진 프론트엔드 라이브러리**로 성장했다. 그러나 React 자체는 UI 렌더링만 담당하므로, 완전한 애플리케이션을 만들려면 주변 생태계 도구의 이해가 필수적이다.

### 1.2 산업적 가치 — React 생태계의 현재 위상

React는 현재 프론트엔드 개발의 사실상 표준(de facto standard)이다. 2024년 Stack Overflow 설문조사에서 가장 많이 사용되는 웹 프레임워크 1위를 기록했으며, LinkedIn의 프론트엔드 채용 공고 중 약 60% 이상이 React 경험을 요구한다.

React 생태계를 이해하는 것은 곧 **프론트엔드 개발의 전체 지형도**를 이해하는 것이다. 라우팅, 상태 관리, 데이터 패칭, 테스트 같은 영역은 React뿐 아니라 Vue, Svelte 등 다른 프레임워크에서도 동일하게 필요한 문제이며, React 생태계에서 학습한 개념은 다른 프레임워크로 전환할 때도 그대로 적용된다.

### 1.3 이 Step의 핵심 개념 관계도

![step03 01 step 03 핵심 개념 관계도](/developer-open-book/diagrams/react-step03-01-step-03-핵심-개념-관계도.svg)

### 1.4 "React만 배우면 앱을 만들 수 있는가?"

결론부터 말하면 **아니다.** React는 UI를 만드는 라이브러리이지, 애플리케이션을 만드는 완전한 도구가 아니다. 실제 웹 애플리케이션을 만들려면 라우팅, 상태 관리, 데이터 패칭, 스타일링, 빌드, 배포 등 수많은 영역의 도구가 필요하다.

```
"React를 배운다" vs "React로 앱을 만든다"

  React만으로 할 수 있는 것:
    ✅ 컴포넌트 설계
    ✅ UI 렌더링
    ✅ 사용자 이벤트 처리
    ✅ 컴포넌트 내부 상태 관리

  React만으로 할 수 없는 것:
    ❌ 페이지 간 이동 (라우팅)
    ❌ 서버 데이터 패칭·캐싱
    ❌ 전역 상태 관리
    ❌ 서버 사이드 렌더링
    ❌ 폼 검증
    ❌ 빌드·배포
```

### 1.2 생태계 조감도의 가치

학습 초반에 전체 지도를 펼쳐 보는 것은 **"지금 배우는 것이 어디에 위치하는지"** 를 인식하게 해준다. 숲을 보지 못하고 나무만 보는 학습을 방지한다.

### 1.3 이 Step에서 다루는 범위

![step03 02 다루는 것](/developer-open-book/diagrams/react-step03-02-다루는-것.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                | 정의                                                                                                    | 왜 중요한가                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **SPA**             | Single Page Application. 하나의 HTML 페이지에서 JavaScript로 콘텐츠를 동적으로 교체하는 웹 애플리케이션 | React의 기본 동작 모델이다                           |
| **MPA**             | Multi Page Application. 페이지 이동 시 서버에서 새로운 HTML을 받아오는 전통적 방식                      | SPA와의 비교를 통해 React의 존재 이유를 이해한다     |
| **CSR**             | Client-Side Rendering. 브라우저(클라이언트)에서 JavaScript로 화면을 그리는 방식                         | React의 기본 렌더링 방식이다                         |
| **SSR**             | Server-Side Rendering. 서버에서 HTML을 완성하여 보내고, 클라이언트에서 상호작용을 활성화하는 방식       | SEO, 초기 로딩 속도 개선을 위해 사용한다             |
| **SSG**             | Static Site Generation. 빌드 시점에 HTML을 미리 생성하는 방식                                           | 블로그, 문서 사이트 등 변하지 않는 콘텐츠에 최적이다 |
| **Hydration**       | 서버에서 보낸 정적 HTML에 JavaScript 이벤트 핸들러를 연결하여 상호작용 가능하게 만드는 과정             | SSR의 핵심 메커니즘이다                              |
| **ISR**             | Incremental Static Regeneration. SSG로 생성된 페이지를 특정 주기로 재생성하는 방식                      | SSG의 한계(빌드 시점 고정)를 보완한다                |
| **라이브러리**      | 특정 기능을 제공하는 코드 모음. 개발자가 호출 흐름을 제어한다                                           | React는 라이브러리이다                               |
| **프레임워크**      | 애플리케이션의 구조와 흐름을 제공. 프레임워크가 개발자의 코드를 호출한다 (IoC)                          | Next.js, Angular는 프레임워크이다                    |
| **메타 프레임워크** | 라이브러리 위에 구축된 프레임워크. 라우팅, 빌드, SSR 등을 통합 제공한다                                 | Next.js는 React의 메타 프레임워크이다                |
| **IoC**             | Inversion of Control(제어의 역전). 프레임워크가 코드 실행 흐름을 결정하는 설계 원칙                     | 라이브러리와 프레임워크를 구분하는 핵심 기준이다     |
| **RSC**             | React Server Components. 서버에서만 실행되는 React 컴포넌트                                             | React의 최신 아키텍처 방향이다                       |
| **번들러**          | 여러 모듈을 하나 또는 소수의 파일로 합치는 도구                                                         | Vite(Rollup), Webpack, esbuild 등                    |
| **트랜스파일러**    | 코드를 같은 수준의 다른 형태로 변환하는 도구                                                            | Babel, SWC, esbuild 등. JSX → JS 변환                |

### 2.2 핵심 용어 심층 해설

#### SPA (Single Page Application)

SPA는 "하나의 HTML 페이지 위에서 JavaScript가 화면을 동적으로 교체하는 방식"이다. 전통적인 웹(MPA)에서는 사용자가 링크를 클릭할 때마다 서버가 새로운 HTML 문서를 생성하여 전송했다. SPA는 이 패러다임을 뒤집어, **최초 1회만 HTML을 로드하고 이후에는 JavaScript가 필요한 부분만 갱신**한다.

SPA가 중요한 이유는 현대 웹 애플리케이션의 사용자 경험(UX) 기대치와 직결되기 때문이다. Gmail, Figma, Notion 같은 서비스에서 페이지를 이동할 때 화면이 깜빡이지 않고 매끄럽게 전환되는 것이 바로 SPA의 효과이다. React는 SPA를 효율적으로 구현하기 위한 가장 대표적인 도구이며, React Router와 결합하면 브라우저의 URL을 변경하면서도 서버 요청 없이 화면을 전환할 수 있다.

다만 SPA는 초기 로딩 시 빈 HTML과 대용량 JavaScript 번들을 다운로드해야 하므로, 첫 화면 표시 속도(FCP)가 느릴 수 있고 검색 엔진 최적화(SEO)에 불리하다. 이 한계를 극복하기 위해 SSR, SSG 같은 렌더링 전략이 등장했다.

#### CSR / SSR / SSG — 렌더링 전략의 삼각 구도

**CSR(Client-Side Rendering)** 은 브라우저에서 JavaScript가 DOM을 생성하는 방식이다. React의 기본 동작 모델이며, Vite로 생성한 프로젝트가 기본적으로 이 방식을 따른다. 서버는 거의 빈 HTML과 JavaScript 파일만 전달하고, 브라우저가 JavaScript를 실행하여 화면을 그린다.

**SSR(Server-Side Rendering)** 은 서버에서 React 컴포넌트를 실행하여 완성된 HTML을 생성한 뒤, 브라우저에 전달하는 방식이다. 브라우저는 이미 완성된 HTML을 즉시 표시하고, 이후 JavaScript가 로드되면 이벤트 핸들러를 연결(Hydration)하여 상호작용을 활성화한다. SEO가 중요한 공개 페이지에 적합하다.

**SSG(Static Site Generation)** 는 빌드 시점에 HTML을 미리 생성해두는 방식이다. 사용자 요청 시 이미 생성된 HTML 파일을 그대로 전달하므로 응답 속도가 가장 빠르다. 블로그, 문서 사이트처럼 콘텐츠가 자주 변하지 않는 경우에 최적이다. ISR(Incremental Static Regeneration)은 SSG의 변형으로, 특정 주기마다 페이지를 재생성하여 "빌드 시점 고정" 문제를 해결한다.

이 세 가지 전략은 상호 배타적이 아니다. Next.js 같은 메타 프레임워크에서는 **페이지 단위로** 렌더링 방식을 선택할 수 있다. 로그인 페이지는 SSG, 대시보드는 CSR, 상품 상세 페이지는 SSR+ISR처럼 혼합하여 사용한다.

#### IoC (Inversion of Control) — 라이브러리와 프레임워크를 가르는 기준

IoC(제어의 역전)는 소프트웨어 설계 원칙으로, "누가 코드 실행 흐름을 제어하는가"를 기준으로 라이브러리와 프레임워크를 구분한다. 라이브러리는 개발자가 필요할 때 호출하여 사용하지만, 프레임워크는 개발자의 코드를 자신이 정한 시점에 호출한다.

React가 "라이브러리"로 분류되는 핵심 근거가 바로 이 IoC이다. React는 컴포넌트를 정의하는 방법(함수 컴포넌트, JSX)과 상태 관리 도구(useState, useEffect)를 제공하지만, **애플리케이션의 전체 구조, 라우팅, 데이터 흐름을 강제하지 않는다.** 반면 Angular는 모듈 시스템, 의존성 주입, 라우팅, HTTP 통신 등 애플리케이션의 전체 흐름을 프레임워크가 제어한다.

이 구분이 실무적으로 중요한 이유는 **기술 선택의 자유도**에 직접적으로 영향을 주기 때문이다. React(라이브러리)를 선택하면 라우팅, 상태 관리, 데이터 패칭 등을 각각 별도로 선택해야 한다. 이는 유연하지만 "선택 피로(Choice Fatigue)"를 유발할 수 있다. Next.js(프레임워크)를 선택하면 이러한 결정이 대부분 내려져 있어 빠르게 시작할 수 있지만, 프레임워크가 정한 방식을 따라야 한다.

#### 메타 프레임워크 — React 위의 통합 계층

메타 프레임워크는 "라이브러리(React) 위에 구축된 프레임워크"를 뜻한다. React가 UI 렌더링만 담당하므로, 실제 웹 애플리케이션을 만들려면 라우팅, 빌드, SSR, 최적화 등을 직접 구성해야 한다. 메타 프레임워크는 이 모든 것을 하나의 패키지로 통합하여 "React로 풀스택 개발"을 가능하게 한다.

Next.js가 현재 시장에서 가장 지배적인 React 메타 프레임워크이다. Vercel이 개발하며, 파일 시스템 기반 라우팅, SSR/SSG/ISR, React Server Components, Server Actions, 이미지 최적화 등을 통합 제공한다. Remix(Shopify 인수)는 Web Standards를 중시하며, 중첩 라우팅과 프로그레시브 인핸스먼트에 강점이 있다.

메타 프레임워크를 React 학습 초기부터 사용하면, "React가 하는 일"과 "메타 프레임워크가 하는 일"의 경계가 모호해진다. 이 로드맵이 Phase 1~2에서 React 코어를 Vite 기반 SPA로 먼저 학습하고, Phase 3에서 Next.js를 도입하는 이유이다.

### 2.3 웹 애플리케이션 렌더링 방식 관계도

![step03 03 웹 렌더링 방식의 진화](/developer-open-book/diagrams/react-step03-03-웹-렌더링-방식의-진화.svg)

---

## 3. 이론과 원리

### 3.1 SPA(Single Page Application)의 동작 원리

#### MPA vs SPA 비교

![step03 04 mpa multi page application](/developer-open-book/diagrams/react-step03-04-mpa-multi-page-application.svg)

#### SPA의 핵심 메커니즘

![step03 05 spa를 가능하게 하는 3가지 기술](/developer-open-book/diagrams/react-step03-05-spa를-가능하게-하는-3가지-기술.svg)

#### SPA의 장점과 한계

```
장점                                   한계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
· 빠른 페이지 전환 (깜빡임 없음)        · 느린 초기 로딩 (JS 번들 다운로드)
· 앱과 유사한 사용자 경험               · SEO 불리 (빈 HTML)
· 상태 유지 용이                       · JavaScript 비활성화 시 동작 불가
· 서버 부하 감소 (API만 처리)           · 메모리 누수 관리 필요
· 프론트엔드/백엔드 분리               · 초기 빈 화면 (FOUC 가능)
```

> 💡 SPA의 한계를 극복하기 위해 등장한 것이 **SSR**(서버 사이드 렌더링)과 **SSG**(정적 사이트 생성)이다. 이 주제는 Step 19에서 상세히 학습한다.

### 3.2 React의 정체성 — 라이브러리인가 프레임워크인가

#### 라이브러리 vs 프레임워크의 본질적 차이

두 개념의 구분은 **"누가 코드 실행 흐름을 제어하는가"** 에 달려 있다.

![step03 06 라이브러리 library 내가 부른다](/developer-open-book/diagrams/react-step03-06-라이브러리-library-내가-부른다.svg)

#### React가 라이브러리인 증거

![step03 07 react가 결정하지 않는 것들 개발자가 선택해야 하는 것들](/developer-open-book/diagrams/react-step03-07-react가-결정하지-않는-것들-개발자가-선택해야-하는-것들.svg)

#### Angular와의 비교로 보는 차이

![step03 08 angular 프레임워크 라이브러리](/developer-open-book/diagrams/react-step03-08-angular-프레임워크-react-라이브러리.svg)

#### "라이브러리라서 좋은 점"과 "라이브러리라서 어려운 점"

![step03 09 장점 단점](/developer-open-book/diagrams/react-step03-09-장점-단점.svg)

### 3.3 React 생태계 전체 지도

#### 영역별 분류

![step03 10 생태계 전체 지도](/developer-open-book/diagrams/react-step03-10-react-생태계-전체-지도.svg)

#### 각 영역의 역할과 대표 도구

**① 라우팅 (Routing)**

![step03 11 역할 url에 따라 어떤 화면컴포넌트을 보여줄지 결정한다](/developer-open-book/diagrams/react-step03-11-역할-url에-따라-어떤-화면컴포넌트을-보여줄지-결정한다.svg)

**② 데이터 패칭 (Data Fetching)**

![step03 12 역할 서버의 데이터를 가져오고 캐싱하고 동기화한다](/developer-open-book/diagrams/react-step03-12-역할-서버의-데이터를-가져오고-캐싱하고-동기화한다.svg)

**③ 상태 관리 (State Management)**

![step03 13 역할 여러 컴포넌트가 공유하는 데이터를 관리한다](/developer-open-book/diagrams/react-step03-13-역할-여러-컴포넌트가-공유하는-데이터를-관리한다.svg)

**④ 폼 관리 (Form Management)**

![step03 14 역할 사용자 입력의 수집 검증 제출을 처리한다](/developer-open-book/diagrams/react-step03-14-역할-사용자-입력의-수집-검증-제출을-처리한다.svg)

**⑤ 스타일링 (Styling)**

![step03 15 역할 컴포넌트의 시각적 표현을 정의한다](/developer-open-book/diagrams/react-step03-15-역할-컴포넌트의-시각적-표현을-정의한다.svg)

**⑥ 타입 시스템 (Type System)**

![step03 16 역할 코드의 타입 안전성을 보장하여 버그를 사전에 방지한다](/developer-open-book/diagrams/react-step03-16-역할-코드의-타입-안전성을-보장하여-버그를-사전에-방지한다.svg)

**⑦ 테스트 (Testing)**

![step03 17 역할 코드의 정확성을 자동으로 검증한다](/developer-open-book/diagrams/react-step03-17-역할-코드의-정확성을-자동으로-검증한다.svg)

**⑧ 빌드·배포 (Build & Deploy)**

![step03 18 역할 소스 코드를 최적화된 형태로 변환하고 사용자에게 전달한다](/developer-open-book/diagrams/react-step03-18-역할-소스-코드를-최적화된-형태로-변환하고-사용자에게-전달한다.svg)

### 3.4 메타 프레임워크 — React 위의 프레임워크

#### 메타 프레임워크란

![step03 19 라이브러리](/developer-open-book/diagrams/react-step03-19-react-라이브러리.svg)

#### 주요 메타 프레임워크 비교

![step03 20 nextjs remix gatsby](/developer-open-book/diagrams/react-step03-20-nextjs-remix-gatsby.svg)

#### 이 로드맵에서의 위치

```
Step 1~17:  React Core + Hooks
            Vite 기반 SPA로 React 자체를 학습

Step 18~24: Routing + Data Layer
            React Router → 렌더링 전략 이론 → RSC → Next.js
            "React만으로 부족한 이유"를 체감한 후 메타 프레임워크 학습

Step 25~42: 상태 관리 ~ 프로덕션
            프로덕션 레벨의 도구 체인 완성
```

> 💡 **이 로드맵의 전략:** React 코어를 먼저 이해하고, 그 한계를 체감한 뒤 메타 프레임워크를 학습한다. Next.js부터 시작하면 "React가 하는 일"과 "Next.js가 하는 일"의 경계가 모호해져 개념 혼동이 발생한다.

### 3.5 React의 진화 방향 — 서버로의 확장

#### 2015~2025 React의 변화

```
2013  React 탄생
       · 클라이언트 사이드 UI 라이브러리
       · class 컴포넌트, setState

2015  React Native
       · 모바일 앱으로 확장

2018  React 16.8 — Hooks 도입
       · 함수 컴포넌트가 class를 대체
       · useState, useEffect 등

2022  React 18 — Concurrent 기능
       · Automatic Batching
       · useTransition, Suspense for Data Fetching
       · Streaming SSR

2024  React 19 — Server Integration
       · React Server Components (RSC) 안정화
       · Server Actions
       · use() Hook
       · 폼 관련 Hooks (useActionState, useFormStatus)

방향: 클라이언트 전용 → 서버/클라이언트 통합
```

#### 현재의 React를 이해하는 프레임

![step03 21 react의 3가지 층](/developer-open-book/diagrams/react-step03-21-react의-3가지-층.svg)

> 💡 **핵심 인사이트:** Layer 1(컴포넌트 모델)은 2018년 Hooks 도입 이후 거의 변하지 않았다. 이 로드맵이 Phase 1~2에 가장 많은 시간을 배분하는 이유이다. **기초 원리가 탄탄하면 도구가 바뀌어도 적응할 수 있다.**

### 3.6 기술 선택의 현실적 기준

#### 프로젝트 유형별 권장 기술 스택

![step03 22 학습포트폴리오 프로젝트](/developer-open-book/diagrams/react-step03-22-학습포트폴리오-프로젝트.svg)

#### 도구 선택 시 고려 사항

```
선택 기준 우선순위

  1. 팀의 기존 경험   — 팀이 이미 아는 도구가 최고의 도구
  2. 프로젝트 요구사항 — SEO 필요? 실시간 데이터? 오프라인 지원?
  3. 생태계 성숙도    — 문서, 커뮤니티, 유지보수 활발한가?
  4. 학습 곡선        — 팀이 합리적 시간 내에 익힐 수 있는가?
  5. 성능             — 대부분의 프로젝트에서 도구 간 성능 차이는 미미

  ⚠️ 피해야 할 것:
  · "가장 새로운 것" 기준으로 선택
  · 벤치마크 숫자만 보고 선택
  · SNS 인기도만 보고 선택
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 동일한 앱을 다른 기술 스택으로 구현할 때의 차이

간단한 **할 일 목록 앱**을 구현한다고 가정할 때, 기술 선택에 따라 프로젝트 구조와 복잡도가 어떻게 달라지는지 비교한다.

```
요구사항:
  · 할 일 CRUD (추가, 조회, 수정, 삭제)
  · 로그인 필요
  · 데이터는 서버 API에 저장
  · SEO 불필요 (로그인 후 사용)


구성 A: 최소 스택 (Vite + React Router)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  라우팅:   React Router v6
  상태:     useState + useContext
  패칭:     fetch + useEffect
  스타일:   CSS Modules

  장점: 가볍고, 의존성 적음, 빠른 시작
  단점: 캐싱·로딩·에러 처리를 직접 구현해야 함
  적합: 소규모 프로젝트, 학습 목적


구성 B: 실무 스택 (Vite + 전문 라이브러리)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  라우팅:   React Router v6
  상태:     Zustand (클라이언트) + TanStack Query (서버)
  패칭:     TanStack Query + Axios
  폼:       React Hook Form + Zod
  스타일:   Tailwind CSS

  장점: 캐싱·낙관적 업데이트·에러 처리가 내장
  단점: 학습할 라이브러리가 많음
  적합: 중·대규모 프로젝트, 팀 개발


구성 C: 풀스택 스택 (Next.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  라우팅:   Next.js App Router (내장)
  상태:     Zustand + TanStack Query
  패칭:     Server Actions + TanStack Query
  폼:       React Hook Form + Zod
  스타일:   Tailwind CSS
  배포:     Vercel

  장점: SSR, API 라우트, 이미지 최적화 등 통합
  단점: Next.js 고유 개념 학습 필요
  적합: SEO 필요 시, 서버 로직 포함 시
```

### 4.2 사례: React 생태계의 트렌드 변화

![step03 23 2020년의 모범 스택 2025년의 모범 스택](/developer-open-book/diagrams/react-step03-23-2020년의-모범-스택-2025년의-모범-스택.svg)

### 4.3 사례: npm 다운로드 수로 보는 생태계 규모

생태계의 규모를 가늠할 수 있는 지표로 주간 npm 다운로드 수를 참고한다. 이 수치는 변동이 있지만, 상대적 크기를 이해하는 데 유용하다.

![step03 24 프레임워크라이브러리 2025년 기준 대략적 규모](/developer-open-book/diagrams/react-step03-24-프레임워크라이브러리-2025년-기준-대략적-규모.svg)

---

## 5. 실습

> **온라인 실습 환경:** 이 Step은 개념 학습 중심이므로, 아래 StackBlitz에서 React 프로젝트를 생성하여 생태계 도구의 package.json 의존성을 직접 확인해볼 수 있다.
> [StackBlitz — React + Vite 템플릿](https://stackblitz.com/edit/vitejs-vite-react)

### 실습 1: 생태계 영역 매핑 [Remembering · Understanding]

**목표:** React 생태계의 각 영역과 대표 도구를 기억하고 분류한다.

아래 표를 보지 않고 직접 채워 본다:

| 영역            | 해결하는 문제 | 대표 도구 (2~3개) | 이 로드맵의 Step |
| --------------- | ------------- | ----------------- | ---------------- |
| 라우팅          |               |                   |                  |
| 데이터 패칭     |               |                   |                  |
| 전역 상태 관리  |               |                   |                  |
| 폼 관리         |               |                   |                  |
| 스타일링        |               |                   |                  |
| 타입 시스템     |               |                   |                  |
| 테스트          |               |                   |                  |
| 빌드·배포       |               |                   |                  |
| 메타 프레임워크 |               |                   |                  |

**자가 확인:** 9개 영역 중 7개 이상을 채울 수 있다면 이 Step의 내용을 충분히 이해한 것이다.

---

### 실습 2: 렌더링 방식 비교 분석 [Understanding · Analyzing]

**목표:** CSR, SSR, SSG의 차이를 자신의 말로 설명한다.

아래 시나리오 각각에 가장 적합한 렌더링 방식을 선택하고 그 이유를 서술하라:

```
시나리오 1: 사내 프로젝트 관리 대시보드 (로그인 필수, SEO 불필요)
  → 적합한 방식:
  → 이유:

시나리오 2: 기업 공식 홈페이지 (마케팅 페이지, SEO 매우 중요)
  → 적합한 방식:
  → 이유:

시나리오 3: 개인 블로그 (콘텐츠가 자주 변하지 않음, SEO 중요)
  → 적합한 방식:
  → 이유:

시나리오 4: 실시간 채팅 애플리케이션 (빠른 상호작용, SEO 불필요)
  → 적합한 방식:
  → 이유:

시나리오 5: 뉴스 사이트 (콘텐츠가 자주 변함, SEO 중요)
  → 적합한 방식:
  → 이유:
```

---

### 실습 3: 기술 스택 설계 [Analyzing · Evaluating]

**목표:** 프로젝트 요구사항에 따라 기술 스택을 선택하고 근거를 제시한다.

아래 요구사항을 읽고 기술 스택을 설계하라:

![step03 25 프로젝트 온라인 도서 관리 시스템](/developer-open-book/diagrams/react-step03-25-프로젝트-온라인-도서-관리-시스템.svg)

---

### 실습 4 (선택): 생태계 변화 추적 [Evaluating]

**목표:** 생태계 트렌드를 객관적으로 파악하는 방법을 익힌다.

아래 리소스를 방문하여 현재 React 생태계의 트렌드를 3가지 이상 정리하라:

```
참고 리소스:
  · npm trends (https://npmtrends.com) — 패키지 다운로드 수 비교
  · State of JS Survey (https://stateofjs.com) — 연간 JavaScript 생태계 설문
  · Star History (https://star-history.com) — GitHub 스타 추이

추적 예시:
  · npmtrends.com에서 zustand vs redux vs jotai 비교
  · npmtrends.com에서 @tanstack/react-query vs swr 비교
  · npmtrends.com에서 vite vs webpack 비교
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

![step03 26 step 3 핵심 요약](/developer-open-book/diagrams/react-step03-26-step-3-핵심-요약.svg)

### 6.2 자가진단 퀴즈

| #   | 질문                                                                 | 확인할 섹션 |
| --- | -------------------------------------------------------------------- | ----------- |
| 1   | SPA에서 페이지 전환 시 서버 요청 없이 URL이 바뀌는 메커니즘은?       | 3.1         |
| 2   | React가 프레임워크가 아닌 라이브러리인 근거를 3가지 이상 제시하라    | 3.2         |
| 3   | "제어의 역전(IoC)"을 라이브러리/프레임워크 맥락에서 설명하라         | 3.2         |
| 4   | CSR, SSR, SSG의 차이를 각각 한 문장으로 설명하라                     | 2.2         |
| 5   | TanStack Query와 Zustand는 각각 어떤 종류의 상태를 관리하는가?       | 3.3         |
| 6   | Next.js가 "메타 프레임워크"로 분류되는 이유는?                       | 3.4         |
| 7   | 2020년과 2025년의 React 생태계에서 변한 것과 변하지 않은 것은?       | 3.5         |
| 8   | SEO가 필요 없는 대시보드에 Next.js를 사용하는 것이 적합한가? 근거는? | 3.6         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1. React가 라이브러리라면 왜 공식 문서에서 "framework"라는 표현이 가끔 나오나?**

React 팀도 React를 "A JavaScript library for building user interfaces"로 공식 정의한다. 다만 React 18 이후 Server Components, Server Actions 등이 추가되면서 프레임워크적 성격이 강해지고 있다. 그럼에도 React 자체는 라우팅, 빌드, 데이터 패칭을 제공하지 않으므로, 엄밀히는 라이브러리이다. "프레임워크처럼 사용되는 라이브러리"라고 이해하면 정확하다.

**Q2. Next.js부터 배우면 안 되나? React 코어를 먼저 배워야 하는 이유는?**

Next.js는 React 위에 구축된 메타 프레임워크이므로, React의 컴포넌트 모델(Props, State, Hooks, Reconciliation)을 이해하지 못하면 Next.js 고유 기능(Server Components, App Router)과 React 기본 기능의 경계를 구분할 수 없다. 디버깅 시 "이 문제가 React 문제인지 Next.js 문제인지" 판단할 수 없어 학습 효율이 크게 떨어진다.

**Q3. 생태계 도구가 너무 많은데, 처음에는 어떤 것만 알면 되나?**

이 로드맵의 Phase 1~2(Step 4~17)에서는 React 코어만 사용한다. 이 단계에서 필요한 외부 도구는 Vite(빌드)뿐이다. 라우팅(React Router), 데이터 패칭(TanStack Query), 상태 관리(Zustand) 등은 Phase 3~4에서 "왜 필요한지"를 체감한 후 학습한다. 처음부터 모든 도구를 알 필요는 없다.

**Q4. Vue나 Svelte 대신 React를 선택해야 하는 이유가 있나?**

기술적으로 Vue, Svelte, React 모두 훌륭한 선택이다. React를 선택하는 주된 이유는 **생태계 규모와 취업 시장**이다. npm 다운로드 수, GitHub 스타 수, 채용 공고 수 모두 React가 압도적이다. 다만 Vue는 학습 곡선이 완만하고, Svelte는 번들 크기가 작다는 각각의 장점이 있으므로, 프로젝트 상황에 따라 선택하는 것이 바람직하다.

**Q5. "서버 상태"와 "클라이언트 상태"는 무엇이 다른가?**

클라이언트 상태는 UI의 현재 상태(모달 열림/닫힘, 선택된 탭, 폼 입력값 등)로, 브라우저 메모리에만 존재한다. 서버 상태는 서버 데이터베이스에 원본이 있는 데이터(사용자 목록, 게시글, 상품 정보 등)의 클라이언트 측 사본이다. 서버 상태는 캐싱, 동기화, 갱신 등의 추가적인 관리가 필요하므로 TanStack Query 같은 전문 도구를 사용하고, 클라이언트 상태는 useState나 Zustand로 관리한다.

### 6.4 개념 지도: 이 로드맵과 생태계의 대응

![step03 27 이 로드맵의 42 steps이 생태계의 어떤 영역을 다루는지 한눈에 보기](/developer-open-book/diagrams/react-step03-27-이-로드맵의-42-steps이-생태계의-어떤-영역을-다루는지-한눈에-보기.svg)

---

## 7. 다음 단계 예고

> **Step 4. JSX와 컴포넌트 실행 모델** (Phase 1 시작)
>
> - JSX가 JavaScript로 변환되는 구조
> - React.createElement와 React Element 객체
> - 함수 컴포넌트의 호출 원리
> - "렌더링 = 함수 실행"이라는 핵심 개념
> - React Element와 DOM Element의 관계
>
> 지금까지 환경과 지도를 살펴보았다. 이제 본격적으로 React의 코어 메커니즘으로 진입한다.

---

## 📚 참고 자료

- [React 공식 문서 — Start a New React Project](https://react.dev/learn/start-a-new-react-project)
- [React 공식 문서 — React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Remix 공식 문서](https://remix.run/docs)
- [State of JS 2024 Survey](https://stateofjs.com/)
- [npm trends](https://npmtrends.com/)
- [Vite 공식 문서 — Why Vite](https://vite.dev/guide/why.html)

---

> **React 완성 로드맵 v2.0** | Phase 0 — 개발 환경과 생태계 이해 | Step 3 of 42
