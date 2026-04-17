# Step 01. 개발 환경 설치와 프로젝트 구조

> **Phase 0 — 개발 환경과 생태계 이해 (Step 1~3)**
> React를 실행하기 위한 환경을 이해하고 구성한다

> **난이도:** 🟢 초급 (Beginner)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| **Remember**   | Node.js, npm, Vite의 역할을 각각 정의할 수 있다                         |
| **Understand** | React 프로젝트가 브라우저에서 실행되기까지의 전체 흐름을 설명할 수 있다 |
| **Understand** | 패키지 매니저(npm, pnpm, yarn)의 차이점을 비교할 수 있다                |
| **Apply**      | Vite를 사용하여 React 프로젝트를 생성하고 실행할 수 있다                |
| **Analyze**    | 생성된 프로젝트의 디렉토리 구조에서 각 파일의 역할을 분석할 수 있다     |

**전제 지식:**

- 터미널(명령 프롬프트) 기본 사용법
- HTML, CSS 기초
- JavaScript 기본 문법 (변수, 함수, 객체)

---

## 1. 서론 — 왜 개발 환경 설정부터 시작하는가

### 1.1 프론트엔드 개발 환경의 등장 배경과 발전 과정

2010년대 이전, 웹 개발은 단순했다. HTML 파일에 `<script>` 태그로 JavaScript 파일을 연결하면 브라우저가 곧바로 실행했다. jQuery 하나만 CDN에서 불러와도 충분한 시대였다. 별도의 "개발 환경"이라는 개념 자체가 필요 없었다.

상황이 바뀐 것은 JavaScript 애플리케이션의 **규모와 복잡도**가 급격히 증가하면서부터이다. 수십 개의 파일, 수백 개의 외부 라이브러리, 브라우저 호환성 문제, 코드 최적화 요구가 생기면서 수작업으로는 감당할 수 없게 되었다. 이 문제를 해결하기 위해 빌드 도구가 등장했다.

```
프론트엔드 빌드 도구의 진화

  2012  Grunt     — 작업 자동화 (파일 복사, 압축 등)
  2014  Gulp      — 스트림 기반 빌드 파이프라인
  2015  Webpack   — 모듈 번들러의 표준으로 등극
  2017  Parcel    — Zero-config 번들러
  2019  esbuild   — Go 언어 기반 초고속 번들러
  2020  Vite      — ESModule 기반 차세대 빌드 도구 ★ (현재 표준)
  2024  Turbopack — Rust 기반, Next.js 내장 번들러 (발전 중)
```

이 발전 과정의 핵심 키워드는 **속도**이다. 프로젝트가 커질수록 빌드 시간이 수십 초에서 수 분까지 걸리는 것이 생산성의 병목이 되었고, Go와 Rust 같은 네이티브 언어로 작성된 도구들이 이 문제를 해결하기 시작했다. 현재 React 프로젝트의 표준 빌드 도구인 Vite는 이 흐름의 정점에 있다.

### 1.2 산업적 가치 — 실제 기업과 프로젝트에서의 적용

개발 환경 구성 능력은 단순한 "설치 작업"이 아니라, 실무에서 반드시 요구되는 핵심 역량이다.

**Vite를 채택한 주요 기업과 프로젝트:**

- **Google** — Angular 17+에서 Vite를 기본 개발 서버로 채택
- **Shopify** — Hydrogen(React 기반 프레임워크)에서 Vite 사용
- **GitLab** — 내부 프론트엔드 빌드를 Webpack에서 Vite로 마이그레이션
- **Storybook 7+** — 기본 빌드 도구를 Vite로 전환
- **Nuxt 3, SvelteKit** — Vue, Svelte 생태계에서도 Vite가 표준

npm 주간 다운로드 수 기준으로 Vite는 2024년에 Webpack의 다운로드 수를 추월하며 명실상부한 표준 빌드 도구로 자리잡았다. 이 로드맵에서 Vite를 학습하는 것은 현재 산업 표준을 익히는 것이다.

### 1.3 이 Step의 핵심 개념 관계도

![step01 01 step 01 핵심 개념 관계도](/developer-open-book/diagrams/react-step01-01-step-01-핵심-개념-관계도.svg)

### 1.4 개발 환경의 의미

React 코드는 브라우저가 직접 이해할 수 없다. JSX 문법, 모듈 시스템, 최신 JavaScript 문법 등은 모두 **변환(Transform) 과정**을 거쳐야 브라우저에서 실행된다. 개발 환경이란 이 변환 과정을 자동으로 처리해주는 **도구 체인(Toolchain)** 을 의미한다.

![step01 02 개발자가 작성한 코드 브라우저가 실행하는 코드](/developer-open-book/diagrams/react-step01-02-개발자가-작성한-코드-브라우저가-실행하는-코드.svg)

### 1.5 올바른 시작의 중요성

환경 설정은 단순한 "설치 작업"이 아니다. 각 도구가 **왜 필요한지, 어떤 역할을 하는지** 이해하면 이후 빌드 오류, 의존성 충돌, 배포 문제를 만났을 때 스스로 해결할 수 있는 기반이 된다.

### 1.6 이 Step에서 다루는 범위

![step01 03 다루는 것](/developer-open-book/diagrams/react-step01-03-다루는-것.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어             | 정의                                                                                    | 왜 중요한가                                                                            |
| ---------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Node.js**      | Chrome V8 엔진 기반의 **JavaScript 런타임**. 브라우저 밖에서 JS를 실행할 수 있게 한다   | React 개발 도구(Vite, ESLint 등)가 Node.js 위에서 동작한다                             |
| **npm**          | Node Package Manager. Node.js와 함께 설치되는 **기본 패키지 매니저**                    | React, Vite 등 외부 라이브러리를 설치·관리한다                                         |
| **pnpm**         | Performant npm. 디스크 효율적인 **대안 패키지 매니저**                                  | 중복 패키지를 공유 저장소로 관리하여 설치 속도와 디스크 사용량을 최적화한다            |
| **yarn**         | Facebook이 만든 **대안 패키지 매니저**                                                  | npm의 속도·보안 문제를 개선하기 위해 등장했다                                          |
| **Vite**         | 차세대 **프론트엔드 빌드 도구**. 프랑스어로 "빠른"이라는 뜻                             | ESModule 기반 개발 서버로 빠른 HMR을 제공한다                                          |
| **HMR**          | Hot Module Replacement. 파일 변경 시 **페이지 새로고침 없이** 해당 모듈만 교체하는 기술 | 개발 중 상태를 유지하면서 코드 변경을 즉시 확인할 수 있다                              |
| **Transpile**    | 한 언어의 소스 코드를 **비슷한 수준의 다른 형태로 변환**하는 것                         | JSX → JS, TypeScript → JS 등의 변환 과정이 필수적이다                                  |
| **Bundle**       | 여러 파일을 **하나 또는 소수의 파일로 합치는 것**                                       | 브라우저의 네트워크 요청을 줄여 로딩 속도를 향상시킨다                                 |
| **ESModule**     | `import`/`export` 문법을 사용하는 **JavaScript 표준 모듈 시스템**                       | 브라우저가 네이티브로 지원하며 Vite의 개발 서버가 이를 활용한다                        |
| **package.json** | 프로젝트의 **메타데이터와 의존성을 기록**하는 JSON 파일                                 | 프로젝트가 어떤 라이브러리에 의존하는지의 단일 진실 공급원(Single Source of Truth)이다 |

### 2.2 핵심 용어 상세 설명

#### Node.js — JavaScript를 브라우저 밖으로 해방시킨 런타임

Node.js는 2009년 Ryan Dahl이 개발했다. 당시 JavaScript는 브라우저 안에서만 동작하는 언어였다. Node.js는 Google Chrome의 V8 엔진을 브라우저에서 추출하여 독립적인 실행 환경으로 만든 것이다. 이로써 JavaScript는 서버, CLI 도구, 빌드 시스템 등 모든 영역에서 사용 가능한 범용 언어가 되었다.

React 개발에서 Node.js의 역할은 **개발 도구의 실행 환경**이다. React 코드 자체는 브라우저에서 실행되지만, 그 코드를 브라우저가 이해할 수 있도록 변환하는 도구(Vite, ESLint, Prettier 등)가 Node.js 위에서 동작한다. 따라서 Node.js 없이는 React 개발 환경을 구축할 수 없다.

#### 패키지 매니저 — 외부 라이브러리의 중앙 관리 시스템

소프트웨어 개발에서 "바퀴를 다시 발명하지 말라"는 원칙이 있다. 이미 잘 만들어진 라이브러리를 가져다 쓰는 것이 효율적이다. 패키지 매니저는 이러한 외부 라이브러리(패키지)의 설치, 업데이트, 삭제, 버전 관리를 자동화하는 도구이다.

npm은 Node.js와 함께 설치되는 기본 패키지 매니저이며, npm 레지스트리(registry.npmjs.org)에 등록된 200만 개 이상의 패키지에 접근할 수 있다. pnpm과 yarn은 npm의 한계(디스크 낭비, 속도 문제, Phantom Dependency)를 개선한 대안이다.

#### Vite — 개발 경험을 혁신한 빌드 도구

Vite(프랑스어로 "빠른")는 Vue.js의 창시자 Evan You가 2020년에 개발했다. 기존 빌드 도구(Webpack)의 느린 개발 서버 시작 속도에 대한 불만에서 탄생했다. Vite의 핵심 혁신은 **브라우저의 ESModule 지원을 활용**하여 개발 시 번들링을 생략하는 것이다. 이 접근 방식 덕분에 프로젝트 규모와 무관하게 개발 서버가 수백 밀리초 안에 시작된다.

Vite가 중요한 이유는 **개발 속도가 곧 생산성**이기 때문이다. 코드를 수정하고 결과를 확인하는 주기(feedback loop)가 짧을수록 개발자는 더 빠르게 학습하고, 더 빠르게 문제를 해결할 수 있다.

#### HMR — 개발 중 상태를 보존하는 즉시 반영 기술

Hot Module Replacement는 파일을 수정할 때 **페이지 전체를 새로고침하지 않고** 변경된 모듈만 교체하는 기술이다. 이것이 중요한 이유는 새로고침을 하면 React 컴포넌트의 State가 초기화되기 때문이다. 예를 들어 복잡한 폼을 채우고 있던 중에 코드를 수정하면, 전체 새로고침 방식에서는 폼에 입력한 데이터가 모두 사라진다. HMR은 이 문제를 해결하여 개발 효율을 극대화한다.

### 2.3 개념 간 관계

![step01 04 개발 환경 구성 요소 관계도](/developer-open-book/diagrams/react-step01-04-개발-환경-구성-요소-관계도.svg)

### 2.4 런타임 vs 빌드 타임 vs 개발 타임

이 세 가지 시점을 구분하는 것이 환경 이해의 핵심이다.

![step01 05 개발 타임 개발자가 코드를 작성하고 로컬에서 테스트](/developer-open-book/diagrams/react-step01-05-개발-타임-개발자가-코드를-작성하고-로컬에서-테스트.svg)

---

## 3. 이론과 원리

### 3.1 Node.js — 왜 프론트엔드 개발에 백엔드 런타임이 필요한가

#### 역할의 이해

React 자체는 **브라우저에서 실행되는 라이브러리**이다. 그런데 왜 Node.js(서버 사이드 런타임)가 필요할까?

```
"React 코드를 작성하는 데 Node.js는 필요 없다.
 하지만 React 코드를 실행 가능하게 변환하는 도구들이 Node.js 위에서 동작한다."
```

Node.js가 담당하는 영역:

![step01 06 nodejs의 역할 개발빌드 시점에만 사용](/developer-open-book/diagrams/react-step01-06-nodejs의-역할-개발빌드-시점에만-사용.svg)

#### 버전 관리의 원칙

Node.js는 **LTS(Long Term Support)** 버전과 **Current** 버전으로 구분된다.

![step01 07 버전 선택 기준](/developer-open-book/diagrams/react-step01-07-버전-선택-기준.svg)

> 💡 **권장:** 학습 목적이라도 **LTS 버전**을 설치한다. 도구 호환성 문제를 최소화할 수 있다.

#### nvm — 여러 Node.js 버전 관리

프로젝트마다 다른 Node.js 버전이 필요할 수 있다. **nvm(Node Version Manager)** 을 사용하면 여러 버전을 쉽게 전환할 수 있다.

![step01 08 nvm의 동작 원리](/developer-open-book/diagrams/react-step01-08-nvm의-동작-원리.svg)

### 3.2 패키지 매니저 — npm, pnpm, yarn 비교 분석

#### 패키지 매니저의 핵심 역할

```
1. 의존성 설치   package.json에 명시된 라이브러리를 다운로드
2. 버전 잠금     lock 파일로 정확한 버전을 고정
3. 스크립트 실행  npm run dev, npm run build 등 명령어 실행
4. 의존성 해석   A가 B를 필요로 하고, B가 C를 필요로 할 때 전체 트리 계산
```

#### 세 매니저의 구조적 차이

![step01 09 npm v7](/developer-open-book/diagrams/react-step01-09-npm-v7.svg)

#### 비교 요약

| 기준               | npm              | pnpm               | yarn (Berry)    |
| ------------------ | ---------------- | ------------------ | --------------- |
| 설치 속도          | 보통             | 빠름               | 빠름            |
| 디스크 효율        | 낮음 (중복 저장) | 높음 (공유 저장소) | 높음 (PnP)      |
| Phantom Dependency | 허용             | 차단               | 차단 (PnP)      |
| node_modules 구조  | 평탄화           | 심볼릭 링크        | 없음 (PnP)      |
| 생태계 호환성      | 최고             | 높음               | 일부 비호환     |
| 학습 곡선          | 없음 (기본 포함) | 낮음               | 중간 (PnP 개념) |
| 추천 시나리오      | 기본·입문        | 모노레포·실무      | 대규모 프로젝트 |

> 💡 **학습 권장:** 입문 단계에서는 **npm** 또는 **pnpm**을 사용한다. 이 로드맵에서는 **npm** 기준으로 설명하되, pnpm 명령어를 병기한다.

#### Phantom Dependency 문제

npm의 평탄화 전략이 만드는 의도치 않은 문제를 이해한다.

![step01 10 상황 프로젝트가 a 패키지만 설치했는데 a가 b를 의존한다](/developer-open-book/diagrams/react-step01-10-상황-프로젝트가-a-패키지만-설치했는데-a가-b를-의존한다.svg)

### 3.3 Vite — 차세대 빌드 도구의 동작 원리

#### Webpack과의 근본적 차이

기존 빌드 도구(Webpack, Parcel)와 Vite의 가장 큰 차이는 **개발 서버의 동작 방식**이다.

![step01 11 webpack 기존 방식](/developer-open-book/diagrams/react-step01-11-webpack-기존-방식.svg)

#### Vite의 두 가지 모드

![step01 12 vite의 이중 구조](/developer-open-book/diagrams/react-step01-12-vite의-이중-구조.svg)

#### 개발 서버의 요청 처리 흐름

![step01 13 브라우저가 httplocalhost5173 요청](/developer-open-book/diagrams/react-step01-13-브라우저가-httplocalhost5173-요청.svg)

> 💡 **핵심:** Vite 개발 서버는 **요청이 올 때(on-demand)** 해당 파일만 변환한다. 이것이 프로젝트 크기와 무관하게 빠른 시작이 가능한 이유이다.

#### esbuild와 SWC

Vite가 사용하는 두 가지 고속 변환 엔진:

```
esbuild (Go 언어로 작성)
  · 개발 서버에서 JSX/TypeScript → JavaScript 변환
  · Babel 대비 10~100배 빠름
  · 의존성 사전 번들링(Pre-bundling)에 사용

SWC (Rust 언어로 작성)
  · Vite 5+에서 React 플러그인이 SWC 기반 옵션 제공
  · React Fast Refresh (HMR) 지원
  · Babel 대비 20~70배 빠름
```

### 3.4 package.json — 프로젝트의 설계도

#### 구조 분석

```jsonc
{
  // ── 프로젝트 메타데이터 ──
  "name": "my-react-app", // 프로젝트 이름 (npm 패키지명 규칙)
  "private": true, // npm에 실수로 배포되는 것을 방지
  "version": "0.0.0", // 시맨틱 버저닝 (major.minor.patch)
  "type": "module", // ESModule 사용 선언 (import/export)

  // ── 실행 스크립트 ──
  "scripts": {
    "dev": "vite", // 개발 서버 시작 (npm run dev)
    "build": "vite build", // 프로덕션 빌드 (npm run build)
    "preview": "vite preview", // 빌드 결과물 로컬 미리보기
    "lint": "eslint .", // 코드 품질 검사
  },

  // ── 프로덕션 의존성 ──
  "dependencies": {
    "react": "^19.0.0", // React 코어 라이브러리
    "react-dom": "^19.0.0", // React → DOM 렌더링 담당
  },

  // ── 개발 전용 의존성 ──
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0", // Vite의 React 플러그인
    "vite": "^6.0.0", // 빌드 도구
    "eslint": "^9.0.0", // 코드 품질 검사 도구
    "@eslint/js": "^9.0.0", // ESLint JS 설정
    "eslint-plugin-react-hooks": "^5.0.0", // React Hook 규칙 검사
    "globals": "^15.0.0", // ESLint 전역 변수 정의
  },
}
```

#### dependencies vs devDependencies

```
dependencies (프로덕션 의존성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 최종 사용자의 브라우저에서 실행되는 코드
  · 번들에 포함됨
  · 예: react, react-dom, react-router-dom

devDependencies (개발 전용 의존성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  · 개발·빌드 과정에서만 사용되는 도구
  · 최종 번들에 포함되지 않음
  · 예: vite, eslint, vitest, typescript

판단 기준:
  "이 패키지가 없으면 사용자의 브라우저에서 앱이 동작하지 않는가?"
  YES → dependencies
  NO  → devDependencies
```

#### 시맨틱 버저닝과 범위 표기

```
  ^19.0.0     캐럿(^): major 고정, minor·patch 업데이트 허용
  │ │ │         → 19.0.0 ~ 19.x.x 범위
  │ │ │
  │ │ └── Patch: 버그 수정 (하위 호환 보장)
  │ └──── Minor: 기능 추가 (하위 호환 보장)
  └────── Major: 호환성 깨지는 변경 (Breaking Change)

  ~19.0.0     틸드(~): major·minor 고정, patch만 업데이트 허용
                → 19.0.0 ~ 19.0.x 범위

  19.0.0      정확한 버전 고정
                → 19.0.0만 설치
```

### 3.5 프로젝트 디렉토리 구조

Vite로 생성한 React 프로젝트의 기본 구조와 각 파일의 역할:

```
my-react-app/
├── node_modules/          ← 설치된 패키지들 (git에 포함하지 않음)
├── public/                ← 정적 에셋 (변환 없이 그대로 제공)
│   └── vite.svg           ← favicon 등
├── src/                   ← 소스 코드 (핵심 작업 영역)
│   ├── assets/            ← 이미지, 폰트 등 (빌드 시 해시 처리됨)
│   │   └── react.svg
│   ├── App.css            ← App 컴포넌트 스타일
│   ├── App.jsx            ← 루트 컴포넌트
│   ├── index.css          ← 전역 스타일
│   └── main.jsx           ← 진입점 (Entry Point) ★
├── .gitignore             ← Git 추적 제외 파일 목록
├── eslint.config.js       ← ESLint 설정
├── index.html             ← HTML 템플릿 (Vite의 진입점) ★
├── package.json           ← 프로젝트 설정·의존성
├── package-lock.json      ← 의존성 버전 잠금 (npm)
├── vite.config.js         ← Vite 설정
└── README.md              ← 프로젝트 설명
```

#### 두 개의 진입점(Entry Point)

```
진입점 1: index.html (Vite의 진입점)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  <!doctype html>
  <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>My React App</title>
    </head>
    <body>
      <div id="root"></div>                          ← React가 마운트될 DOM 노드
      <script type="module" src="/src/main.jsx"></script>  ← JS 진입점 연결
    </body>
  </html>

  · Vite는 index.html을 프로젝트 루트에 둔다 (public/ 안이 아님!)
  · Webpack과 다르게 HTML 파일이 진짜 진입점이다
  · type="module"로 ESModule을 브라우저에 직접 로드

진입점 2: src/main.jsx (React의 진입점)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import App from './App.jsx'
  import './index.css'

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )

  · document.getElementById('root') → index.html의 <div id="root">을 찾음
  · createRoot → React 18+ Concurrent 모드 활성화
  · <StrictMode> → 개발 모드에서 순수성 검증 (Step 6에서 상세 학습)
  · <App /> → 전체 애플리케이션의 루트 컴포넌트
```

#### public/ vs src/assets/ 차이

```
public/
  · 빌드 시 변환 없이 그대로 복사됨
  · URL로 직접 접근 가능 (/vite.svg)
  · 파일명에 해시가 붙지 않음
  · 사용 예: favicon, robots.txt, 정적 JSON

src/assets/
  · 빌드 시 Vite가 처리 (최적화·해시 추가)
  · import 문으로 참조 → 빌드 시 경로가 자동 변환됨
  · 파일명에 해시 추가 (캐시 무효화)
  · 사용 예: 컴포넌트에서 사용하는 이미지, SVG, 폰트

예시:
  import reactLogo from './assets/react.svg'
  // → 빌드 후: /assets/react-xxxxx.svg (해시 포함)
```

### 3.6 코드 편집기와 확장 프로그램

#### VS Code 권장 확장 프로그램

```
필수 확장:
  · ESLint — 코드 품질·규칙 위반 실시간 표시
  · Prettier — 코드 자동 포매팅
  · ES7+ React/Redux/React-Native snippets — 코드 스니펫

권장 확장:
  · Error Lens — 에러·경고를 코드 라인에 인라인 표시
  · Auto Rename Tag — HTML/JSX 태그 자동 짝 변경
  · Path Intellisense — 파일 경로 자동 완성

디버깅:
  · React Developer Tools (브라우저 확장) — 컴포넌트 트리·Props·State 검사
```

#### ESLint와 Prettier의 역할 구분

```
ESLint — "코드 품질" 검사 (What your code does)
  · 사용하지 않는 변수 감지
  · React Hook 규칙 위반 감지
  · 잠재적 버그 패턴 경고

Prettier — "코드 스타일" 통일 (What your code looks like)
  · 들여쓰기, 따옴표 종류, 세미콜론 유무
  · 줄 길이 제한
  · 팀 전체의 일관된 코드 스타일

둘은 역할이 다르므로 함께 사용한다.
ESLint가 코드의 "의미"를, Prettier가 코드의 "형태"를 담당한다.
```

---

## 4. 사례 연구와 예시

### 4.1 사례: CRA에서 Vite로의 산업 전환

#### Create React App(CRA)의 퇴장

2023년까지 React 프로젝트의 표준 생성 도구였던 **Create React App(CRA)** 은 더 이상 React 공식 문서에서 권장되지 않는다.

```
CRA가 퇴장한 이유

  1. 느린 시작 속도  — Webpack 기반, 전체 번들 후 서버 시작
  2. 느린 HMR      — 파일 변경 시 관련 모듈 재번들
  3. 제한된 설정    — eject 없이는 Webpack 설정 수정 불가
  4. 유지보수 중단  — 2023년 이후 실질적 업데이트 없음
```

#### 현재의 공식 권장 도구

React 공식 문서에서 제시하는 프로젝트 시작 방법:

```
프레임워크 기반 (풀스택):
  · Next.js         — SSR/SSG/RSC 지원, 가장 큰 생태계
  · Remix           — Web Standards 기반, 데이터 로딩 내장
  · Gatsby          — 정적 사이트 생성 특화

빌드 도구 기반 (SPA):
  · Vite            — 범용 빌드 도구, React 외에도 Vue/Svelte 지원
  · Parcel          — Zero-config 빌드 도구

이 로드맵의 선택: Vite
  · React의 핵심 개념 학습에 집중하기 위해 SPA 구조로 시작
  · 프레임워크 의존 없이 React 자체를 이해
  · Step 21에서 Next.js 학습 시 자연스럽게 확장
```

### 4.2 사례: Phantom Dependency가 만드는 실제 장애

#### 시나리오: 프로덕션 배포 후 갑자기 동작하지 않는 기능

```
상황:
  · 개발 환경에서는 정상 동작하던 코드
  · 프로덕션 배포 후 특정 기능이 동작하지 않음

원인 분석:
  · 개발자가 date-fns 라이브러리를 import하여 사용
  · 하지만 package.json에 date-fns를 직접 추가하지 않았음
  · 다른 라이브러리(react-datepicker)가 date-fns에 의존하고 있었고,
    npm의 평탄화 전략 덕분에 node_modules 최상위에 노출되어 있었음
  · react-datepicker를 다른 라이브러리로 교체한 후
    date-fns가 사라지면서 코드가 깨짐

교훈:
  · pnpm을 사용했다면 처음부터 import가 실패하여 버그를 사전에 발견
  · 모든 직접 사용 패키지는 반드시 package.json에 명시해야 한다
```

### 4.3 사례: 패키지 매니저 선택이 만드는 차이

#### 모노레포 환경에서의 pnpm

대규모 프로젝트에서 여러 패키지가 하나의 저장소에 있을 때(모노레포), 패키지 매니저의 선택이 개발 효율에 큰 차이를 만든다.

```
시나리오: 10개의 내부 패키지가 있는 모노레포

  npm
  ─────────────────────
  · react 19.0.0이 10번 중복 설치됨
  · 설치 시간: ~60초
  · 디스크: ~800MB

  pnpm
  ─────────────────────
  · react 19.0.0이 글로벌 저장소에 1번만 저장
  · 10개 프로젝트가 하드 링크로 참조
  · 설치 시간: ~15초
  · 디스크: ~250MB
```

### 4.4 사례: Vite의 사전 번들링(Pre-bundling)

#### 문제 상황

```
node_modules/lodash-es/
  ├── add.js
  ├── after.js
  ├── ... (600+ 개별 파일)
  └── zipWith.js

브라우저가 import _ from 'lodash-es' 실행 시:
  → 600개 이상의 HTTP 요청 발생!
  → 네트워크 병목으로 개발 서버가 느려짐
```

#### Vite의 해결책: Dependency Pre-bundling

```
최초 개발 서버 시작 시:

  Vite가 node_modules 의존성을 esbuild로 사전 번들링
  ┌──────────────────────────────────────────┐
  │  lodash-es (600+ 파일) → 1개 파일로 합침  │
  │  react + react-dom → 각각 1개 파일로 합침  │
  └──────────────────────────────────────────┘

  결과: node_modules/.vite/deps/ 에 캐시됨
  → 이후 요청 시 캐시된 파일을 즉시 제공
  → 브라우저 요청 수 대폭 감소
```

---

## 5. 실습

> 🔗 [StackBlitz에서 React 프로젝트 실행](https://stackblitz.com/edit/vitejs-vite-react) — 설치 없이 브라우저에서 바로 실습할 수 있습니다.

### 실습 1: Node.js 설치 확인과 버전 관리 [Remembering · Applying]

**목표:** Node.js와 npm이 올바르게 설치되었는지 확인하고, 버전 정보를 해석한다.

터미널에서 다음 명령어를 실행하고 결과를 확인한다:

```bash
# Node.js 버전 확인
node --version
# 기대 결과: v20.x.x 또는 v22.x.x (LTS 버전)

# npm 버전 확인
npm --version
# 기대 결과: 10.x.x 이상

# Node.js가 JavaScript를 실행할 수 있는지 확인
node -e "console.log('Node.js가 정상 동작합니다!')"
```

**자가 확인:**

- 출력된 Node.js 버전이 LTS인지 Current인지 판별하라
- npm은 Node.js와 함께 설치되었는가, 별도 설치가 필요했는가?

---

### 실습 2: Vite로 React 프로젝트 생성 [Applying]

**목표:** Vite CLI로 프로젝트를 생성하고 개발 서버를 실행한다.

```bash
# 프로젝트 생성 (npm)
npm create vite@latest my-react-app -- --template react

# 또는 pnpm 사용 시
# pnpm create vite my-react-app --template react

# 프로젝트 디렉토리 이동
cd my-react-app

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

**자가 확인:**

- `http://localhost:5173` 에서 Vite + React 기본 화면이 표시되는가?
- `src/App.jsx` 의 텍스트를 수정하고 저장했을 때 브라우저가 즉시 반영되는가? (HMR 확인)

---

### 실습 3: 디렉토리 구조 분석 [Analyzing]

**목표:** 생성된 프로젝트의 각 파일 역할을 직접 확인하고 분류한다.

아래 표를 스스로 채워 본다:

| 파일/폴더          | 역할 (직접 작성) | 분류: 설정 / 소스 / 에셋 / 기타 |
| ------------------ | ---------------- | ------------------------------- |
| `index.html`       |                  |                                 |
| `src/main.jsx`     |                  |                                 |
| `src/App.jsx`      |                  |                                 |
| `package.json`     |                  |                                 |
| `vite.config.js`   |                  |                                 |
| `node_modules/`    |                  |                                 |
| `public/`          |                  |                                 |
| `src/assets/`      |                  |                                 |
| `.gitignore`       |                  |                                 |
| `eslint.config.js` |                  |                                 |

**심화 확인:**

- `index.html`을 열어 `<script>` 태그의 `type="module"` 속성이 왜 필요한지 설명하라
- `src/main.jsx`에서 `createRoot`와 `StrictMode`의 역할을 각각 한 문장으로 서술하라
- `package.json`의 `dependencies`와 `devDependencies`에서 각 패키지가 왜 해당 카테고리에 있는지 설명하라

---

### 실습 4 (선택): 빌드와 결과물 비교 [Analyzing]

**목표:** 개발 모드와 프로덕션 빌드의 차이를 직접 관찰한다.

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
ls -la dist/
ls -la dist/assets/

# 빌드 결과물을 로컬에서 미리보기
npm run preview
```

**관찰 포인트:**

- `dist/` 폴더에 어떤 파일들이 생겼는가?
- JS/CSS 파일명에 해시가 포함되어 있는가? 그 이유는?
- `dist/index.html`과 프로젝트 루트의 `index.html`을 비교하라. `<script>` 태그의 src가 어떻게 바뀌었는가?
- `src/assets/react.svg`의 경로가 빌드 후 어떻게 변환되었는가?

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

![step01 14 step 1 핵심 요약](/developer-open-book/diagrams/react-step01-14-step-1-핵심-요약.svg)

### 6.2 자가진단 퀴즈

아래 질문에 답할 수 없다면 해당 섹션을 다시 읽는다.

| #   | 질문                                                            | 확인할 섹션 |
| --- | --------------------------------------------------------------- | ----------- |
| 1   | React 개발에 Node.js가 필요한 이유를 2가지 이상 설명하라        | 3.1         |
| 2   | Phantom Dependency가 무엇이며, pnpm은 이를 어떻게 방지하는가?   | 3.2         |
| 3   | Vite 개발 서버가 Webpack보다 빠른 근본적 이유는?                | 3.3         |
| 4   | `dependencies`와 `devDependencies`의 판단 기준은?               | 3.4         |
| 5   | `^19.0.0`과 `~19.0.0`의 버전 범위 차이는?                       | 3.4         |
| 6   | `public/` 폴더와 `src/assets/` 폴더의 빌드 처리 방식 차이는?    | 3.5         |
| 7   | 개발 타임, 빌드 타임, 런타임의 차이를 각각 한 문장으로 설명하라 | 2.3         |

---

### 6.3 자주 묻는 질문 (FAQ)

**Q1: Node.js를 설치하면 브라우저에서도 Node.js가 실행되나요?**

아닙니다. Node.js는 개발자의 컴퓨터에서만 실행됩니다. React 앱의 최종 사용자 브라우저에서는 Node.js가 동작하지 않습니다. Node.js는 개발 도구(Vite, ESLint 등)를 실행하기 위한 환경일 뿐이며, 빌드 결과물인 HTML, CSS, JavaScript 파일만 브라우저에 전달됩니다.

**Q2: npm, pnpm, yarn 중 어떤 것을 선택해야 하나요?**

입문 단계에서는 **npm**을 권장합니다. Node.js와 함께 자동 설치되므로 추가 설정이 필요 없고, 대부분의 튜토리얼과 문서가 npm 기준으로 작성되어 있습니다. 실무에서 모노레포를 사용하거나 디스크 효율이 중요해지면 pnpm으로 전환을 고려할 수 있습니다. 중요한 것은 **하나의 프로젝트에서 패키지 매니저를 혼용하지 않는 것**입니다.

**Q3: Vite 대신 Webpack을 사용해도 되나요?**

가능하지만 2025년 기준으로 새 프로젝트에서 Webpack을 선택할 이유는 거의 없습니다. Vite가 개발 서버 속도, 설정 간결성, 생태계 지원 모든 면에서 우위에 있습니다. 기존 Webpack 기반 프로젝트를 유지보수하는 경우가 아니라면 Vite를 사용하세요.

**Q4: `devDependencies`에 있는 패키지가 실수로 프로덕션 번들에 포함될 수 있나요?**

`dependencies`와 `devDependencies`의 구분은 **패키지 매니저**가 참조하는 메타데이터이며, Vite의 번들러가 직접 이 구분을 보지는 않습니다. Vite는 소스 코드에서 `import`된 모듈만 번들에 포함합니다. 따라서 `devDependencies`에 있더라도 소스 코드에서 import하면 번들에 포함되고, `dependencies`에 있어도 import하지 않으면 포함되지 않습니다. 그러나 의미론적 정확성을 위해 올바르게 분류하는 것이 좋습니다.

**Q5: `package-lock.json`을 Git에 커밋해야 하나요?**

반드시 커밋해야 합니다. `package-lock.json`(npm) 또는 `pnpm-lock.yaml`(pnpm)은 모든 패키지의 정확한 버전을 기록합니다. 이 파일이 없으면 팀원마다, CI 서버마다 다른 버전의 패키지가 설치되어 "내 컴퓨터에서는 되는데" 문제가 발생합니다.

---

## 7. 다음 단계 예고

> **Step 2. 모던 JavaScript 필수 문법 복습**
>
> - ES6+ 핵심 문법: Destructuring, Spread, Rest, Template Literal
> - 화살표 함수와 this 바인딩의 차이
> - ES Module 시스템 (import/export) 심화
> - 배열 고차 함수 (map, filter, reduce)
> - Promise와 async/await 기초
> - Optional Chaining, Nullish Coalescing

---

## 📚 참고 자료

- [Node.js 공식 다운로드](https://nodejs.org/)
- [Vite 공식 문서 — Getting Started](https://vite.dev/guide/)
- [Vite 공식 문서 — Why Vite](https://vite.dev/guide/why.html)
- [pnpm 공식 문서 — Motivation](https://pnpm.io/motivation)
- [React 공식 문서 — Start a New React Project](https://react.dev/learn/start-a-new-react-project)
- [Semantic Versioning 명세](https://semver.org/lang/ko/)

---

> **React 완성 로드맵 v2.0** | Phase 0 — 개발 환경과 생태계 이해 | Step 1 of 42
