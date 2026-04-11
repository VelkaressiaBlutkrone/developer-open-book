# Step 39. Vite 빌드 시스템 심화

> **Phase 7 — 빌드·배포·프로덕션 (Step 39~42)**
> 빌드, 배포, 프로덕션 운영으로 앱을 완성한다 — **Phase 7 시작**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| **Remember**   | Vite의 개발 서버(ESBuild)와 프로덕션 빌드(Rollup)의 역할을 기술할 수 있다      |
| **Understand** | Vite가 기존 번들러(Webpack)보다 빠른 이유를 Native ESM 관점에서 설명할 수 있다 |
| **Apply**      | 환경 변수, Path Alias, 프록시, 플러그인을 설정할 수 있다                       |
| **Apply**      | manualChunks로 번들 분할 전략을 구현할 수 있다                                 |
| **Analyze**    | 빌드 결과물을 분석하여 최적화 기회를 식별할 수 있다                            |
| **Evaluate**   | 프로젝트에 적합한 빌드 설정과 최적화 전략을 판단할 수 있다                     |

**전제 지식:**

- Step 3: 빌드 도구의 역할, Vite 개요
- Step 28: 프로젝트 구조, Path Alias
- Step 29: 코드 분할 (React.lazy), 번들 분석

---

## 1. 서론 — Vite는 왜 빠른가

### 1.1 JavaScript 번들러의 역사적 배경

JavaScript가 처음 등장한 1995년, 웹 페이지의 스크립트는 단순한 폼 검증과 애니메이션 정도였다. `<script src="script.js">` 하나면 충분했다. 그러나 2000년대 후반 Gmail, Google Maps로 대표되는 웹 애플리케이션의 복잡도가 급격히 증가하면서, 수십에서 수백 개의 JavaScript 파일을 효율적으로 관리하고 제공하는 방법이 필요해졌다.

2009년 Node.js의 등장과 함께 CommonJS 모듈 시스템(`require/module.exports`)이 표준화됐다. 하지만 CommonJS는 서버(Node.js) 용으로 설계된 동기적 모듈 시스템이었고, 브라우저는 이를 직접 이해할 수 없었다. 이 간극을 메우기 위해 **번들러(Bundler)**가 등장했다. 여러 파일로 나뉜 모듈들을 분석하여 브라우저가 이해할 수 있는 단일(또는 소수의) 파일로 합치는 것이 번들러의 핵심 역할이었다.

2012년 Browserify, 2014년 Webpack이 등장하며 번들러 생태계가 본격화됐다. 특히 Webpack은 JavaScript뿐 아니라 CSS, 이미지, 폰트 등 모든 정적 에셋을 모듈로 처리할 수 있는 통합 빌드 도구로 진화했다. 2015년 ES2015(ES6)에서 공식 모듈 시스템인 ESM(`import/export`)이 표준으로 채택됐지만, 브라우저 지원이 느려 여전히 번들러가 필요했다.

### 1.2 Webpack 시대의 개발 경험 문제

Webpack은 강력했지만 한 가지 근본적인 문제를 가졌다. 코드를 수정할 때마다 **전체 의존성 그래프를 다시 처리**했다. 수십 개 모듈의 소규모 프로젝트에서는 수 초, 수천 개 모듈의 대형 프로젝트에서는 수십 초에서 수 분까지 걸렸다. 개발자가 코드 한 줄을 수정하고 결과를 확인하는 데 30초가 걸린다면, 하루 수백 번의 반복에서 상당한 생산성 손실이 발생한다.

HMR(Hot Module Replacement)로 어느 정도 개선됐지만, 근본 문제는 남아있었다. Webpack의 번들 방식 자체가 규모가 커질수록 선형적으로 느려지는 구조였다.

```
Webpack 시대의 개발 서버 문제:

  [개발자가 코드 수정]
        │
        ▼
  Webpack: 전체 의존성 그래프 분석
        │ (수천 개 모듈이면 수십 초!)
        ▼
  모든 모듈을 CommonJS → ESM 변환
        │
        ▼
  단일 번들 파일 생성
        │
        ▼
  브라우저에 전달 → 화면 반영

  문제: 프로젝트 규모에 비례하여 시간 증가
        소규모: 3초 / 중규모: 15초 / 대규모: 30초+
```

### 1.3 Vite의 혁신 — Native ESM을 브라우저에게 맡긴다

2020년 Vue.js 창시자 Evan You가 발표한 Vite는 이 문제를 근본적으로 다른 방식으로 접근했다. 핵심 아이디어는 단순했다: **"2020년 모든 최신 브라우저는 이미 ESM을 네이티브로 지원한다. 그렇다면 번들링할 필요가 없다."**

Vite는 개발 서버에서 번들링을 포기하고, 브라우저가 직접 ESM을 처리하도록 했다. Vite는 `import` 구문을 분석하여 브라우저가 요청하는 모듈을 실시간으로 변환하고 제공한다. 이 접근법은 두 가지 혁신적인 특성을 갖는다.

첫째, **시작 시간이 프로젝트 규모와 무관**하다. Webpack은 시작 시 전체 의존성 그래프를 미리 처리하지만, Vite는 실제 브라우저가 요청한 모듈만 처리한다(on-demand). 브라우저가 `/src/main.tsx`를 요청하면 그 파일만 변환하고, 그 파일이 `import`하는 모듈은 브라우저가 다음 요청을 보낼 때 처리한다.

둘째, **HMR 속도가 프로젝트 규모와 무관**하다. 파일 하나가 변경되면 그 파일만 다시 변환하여 브라우저에 알린다. 나머지 수천 개 모듈은 전혀 건드리지 않는다.

```
Vite의 혁신:

  [개발자가 코드 수정]
        │
        ▼
  Vite: 변경된 파일만 ESBuild로 변환
        │ (수십 ms!)
        ▼
  브라우저에 HMR 알림 전송
        │
        ▼
  브라우저: 해당 모듈만 교체 → 화면 반영

  핵심: 브라우저가 모듈 요청 시 그때그때 변환
        프로젝트 규모와 무관하게 ~50ms 유지
```

### 1.4 Vite의 산업적 위치와 영향

Vite는 2021년 이후 JavaScript 빌드 도구 생태계에서 가장 빠르게 성장하는 도구가 됐다. 2023년 State of JS 설문에서 Vite는 개발자 만족도 1위를 기록했고, Create React App(CRA)의 공식 후계자로 사실상 자리잡았다. React 공식 문서도 2023년 새 프로젝트 시작 도구로 Vite를 권장한다.

Vite의 영향력은 자체 사용을 넘어서 생태계 전반에 미쳤다. Nuxt(Vue), SvelteKit, Astro, Remix 등 주요 프레임워크들이 Vite를 기본 빌드 도구로 채택했다. Webpack과 Babel의 조합으로 수년간 지배되던 JavaScript 빌드 생태계가 Vite와 ESBuild, SWC(Rust 기반) 등 새로운 세대의 도구로 빠르게 전환되고 있다.

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · Vite의 개발/빌드 동작 원리                            │
│  · vite.config.ts 핵심 설정                             │
│  · 환경 변수 (.env)                                     │
│  · Path Alias                                           │
│  · 개발 서버 프록시                                      │
│  · 빌드 최적화 (manualChunks, 코드 분할)                │
│  · 플러그인 시스템                                       │
│  · 빌드 결과물 분석과 최적화                             │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Webpack 설정 (레거시)                                │
│  · Turbopack 상세                                       │
│  · Vite 플러그인 개발                                   │
│  · SSR 빌드 설정 (Next.js가 처리)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어             | 정의                                                                          | 왜 중요한가                                                   |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **ESBuild**      | Go 언어로 작성된 **초고속 JavaScript 변환기**. Vite 개발 서버에서 사용        | TypeScript/JSX 변환이 Babel 대비 10~100배 빠르다              |
| **Rollup**       | JavaScript **모듈 번들러**. Vite 프로덕션 빌드에서 사용                       | Tree Shaking, 코드 분할에 가장 성숙한 도구                    |
| **Pre-bundling** | node_modules의 의존성을 **ESM 형태로 미리 변환**하여 캐시하는 과정            | CommonJS → ESM 변환 + 수백 개 파일을 하나로 묶어 요청 수 감소 |
| **HMR**          | Hot Module Replacement. 코드 변경 시 **페이지 새로고침 없이 모듈만 교체**     | 개발 중 State 유지 + 즉각적 피드백                            |
| **manualChunks** | Rollup의 **수동 코드 분할 설정**. 어떤 모듈을 어떤 청크에 넣을지 제어         | vendor 분리, 라이브러리별 청크 등 최적화 전략                 |
| **환경 변수**    | `VITE_`로 시작하는 **빌드 시점에 주입되는 변수**. 개발/스테이징/프로덕션 분리 | API URL, 기능 플래그 등을 환경별로 다르게 설정                |
| **Tree Shaking** | 사용되지 않는 코드를 **번들에서 제거**하는 최적화 기법                        | 실제 사용하는 코드만 번들에 포함 → 파일 크기 감소             |
| **청크(Chunk)**  | 번들러가 생성하는 **분리된 JavaScript 파일 단위**                             | 지연 로딩(lazy loading)과 캐싱 전략의 기본 단위               |
| **Path Alias**   | 긴 상대 경로를 **짧은 별칭**으로 대체하는 설정                                | `../../../shared` 대신 `@shared`로 깔끔한 import              |

### 2.2 ESBuild — 왜 이렇게 빠른가

ESBuild는 2020년 Evan Wallace가 개발한 JavaScript/TypeScript 변환기 겸 번들러다. Go 언어로 작성된 ESBuild가 JavaScript로 작성된 Babel 대비 10~100배 빠른 이유는 단순히 "Go가 빠르기 때문"이 아니다. 여러 설계 결정이 복합적으로 작용한다.

Go 언어는 네이티브 바이너리로 컴파일되므로 Node.js의 JIT(Just-In-Time) 컴파일 오버헤드가 없다. 또한 Go의 고루틴(goroutine)을 이용해 여러 파일을 병렬로 처리한다. CPU 코어가 많을수록 비례하여 빨라진다. Babel이 플러그인 아키텍처로 모든 변환을 범용적으로 처리하는 반면, ESBuild는 TypeScript, JSX, 최신 JavaScript 변환에 특화된 최소한의 기능만 구현하여 불필요한 오버헤드를 제거했다.

```
ESBuild vs Babel 속도 비교 (TypeScript + JSX 변환, 실측 기준):

  소규모 프로젝트 (100개 모듈):
    Babel:   ~2,000ms
    ESBuild:    ~20ms  ← 100배 빠름

  대규모 프로젝트 (3,000개 모듈):
    Babel:  ~60,000ms (1분!)
    ESBuild:   ~600ms  ← 100배 빠름

  왜 Vite 프로덕션에 ESBuild를 쓰지 않는가:
    · ESBuild의 코드 분할(code splitting)은 아직 제한적
    · Tree Shaking 품질이 Rollup 대비 낮음
    · CSS 처리가 제한적
    → 개발은 속도(ESBuild), 프로덕션은 최적화(Rollup) ★
```

### 2.3 Rollup — 프로덕션 번들링의 강자

Rollup은 2015년 Rich Harris(Svelte 창시자)가 개발한 번들러다. ESM을 기본으로 설계된 최초의 주요 번들러로, Tree Shaking을 처음 대중화한 도구다. Webpack이 CommonJS 기반의 "모든 것을 번들로" 접근을 취한 반면, Rollup은 "ESM의 정적 분석을 활용한 최적 번들" 철학을 갖는다.

Tree Shaking이란 용어는 Rollup에서 유래했다. 코드를 나무로 비유하면, 사용하는 코드가 나뭇잎이고 사용하지 않는 코드는 죽은 나뭇잎이다. 번들링 시 나무를 흔들어 죽은 나뭇잎을 떨어뜨리는 것이 Tree Shaking이다. 정적 분석이 가능한 ESM의 `import/export` 구문이 있기 때문에 "어떤 코드가 실제로 사용되는가"를 번들 전에 파악할 수 있다.

```
Tree Shaking 동작 원리:

  // utils.ts
  export const add = (a, b) => a + b;       // 사용됨
  export const subtract = (a, b) => a - b;  // 사용 안 됨
  export const multiply = (a, b) => a * b;  // 사용됨

  // main.ts
  import { add, multiply } from './utils';  // subtract는 import 안 함

  번들 결과:
    subtract는 번들에서 제거됨 ← Tree Shaking!
    실제 사용하는 add, multiply만 포함

  중요: Tree Shaking은 ESM에서만 완전히 동작
         CommonJS는 동적 require() 때문에 정적 분석 불가
```

### 2.4 Native ESM과 Pre-bundling의 관계

Vite의 개발 서버가 "번들링 없이" 동작한다고 했지만, 정확히는 하나의 예외가 있다. `node_modules`의 의존성은 Pre-bundling을 통해 미리 처리된다.

이유는 두 가지다. 첫째, 많은 npm 패키지들은 아직 CommonJS 형태로 배포된다. 브라우저는 CommonJS를 직접 이해하지 못하므로 ESM으로 변환이 필요하다. 둘째, lodash 같은 라이브러리는 내부적으로 수백 개의 파일로 나뉘어 있다. 브라우저가 각 파일을 개별 요청하면 수백 건의 HTTP 요청이 발생하여 개발 서버가 느려진다. Pre-bundling은 이러한 의존성을 하나의 ESM 파일로 합쳐 캐시한다.

```
Pre-bundling 동작:

  첫 번째 개발 서버 시작:
    1. node_modules의 의존성 감지
    2. ESBuild로 각 패키지를 ESM 형태로 변환 및 단일화
    3. .vite/deps/ 디렉토리에 캐시 저장

  이후 시작:
    1. 캐시 확인 → package.json 변경 없으면 캐시 재사용
    2. 시작 시간 대폭 단축

  예시:
    lodash (수백 개 파일) → lodash.js (단일 파일) 캐시
    → 브라우저: 1회 요청으로 lodash 전체 로드 ★
```

### 2.5 Vite의 이중 구조

```
┌─────────────────────────────────────────────────────────────┐
│               Vite의 두 가지 모드                             │
│                                                              │
│  개발 모드 (npm run dev):                                   │
│  ─────────────────────────                                  │
│  · 번들링 없이 Native ESM으로 브라우저에 직접 제공          │
│  · ESBuild로 TypeScript/JSX를 즉시 변환 (Go 기반, 매우 빠름)│
│  · 의존성은 Pre-bundling (node_modules를 ESM으로 변환)      │
│  · HMR: 변경된 모듈만 교체 → 즉각 반영                     │
│                                                              │
│  프로덕션 빌드 (npm run build):                             │
│  ─────────────────────────────                              │
│  · Rollup으로 번들링 (Tree Shaking, 코드 분할, 최적화)      │
│  · 최적화된 청크 파일 생성                                   │
│  · CSS 추출, 에셋 해싱, 압축                                │
│  · dist/ 폴더에 정적 파일 출력                              │
│                                                              │
│  왜 두 도구를 사용하는가?                                    │
│  · ESBuild: 변환은 빠르지만 코드 분할/Tree Shaking이 미성숙 │
│  · Rollup: 프로덕션 최적화에 가장 성숙한 번들러             │
│  · 개발은 속도, 프로덕션은 최적화에 최적의 도구를 선택      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 번들 최적화의 핵심 개념들

번들 최적화를 이해하려면 몇 가지 핵심 개념의 관계를 파악해야 한다.

**코드 분할(Code Splitting)**은 단일 번들을 여러 청크로 나누어 필요한 시점에 로드하는 기법이다. React.lazy와 Suspense로 구현하는 동적 임포트가 대표적이다. 사용자가 처음 페이지를 로드할 때 모든 코드를 다운로드하지 않고, 실제로 방문하는 페이지의 코드만 로드한다.

**장기 캐싱(Long-term Caching)**은 변경되지 않은 파일을 브라우저 캐시에 오래 보관하는 전략이다. Vite는 모든 빌드 파일 이름에 콘텐츠 해시를 추가한다(`vendor-abc123.js`). 파일 내용이 바뀌면 해시가 바뀌고, 안 바뀌면 해시도 안 바뀐다. 브라우저는 같은 해시의 파일을 캐시에서 꺼내 쓰므로, 변경되지 않은 코드는 다시 다운로드할 필요가 없다.

**manualChunks**는 코드 분할과 장기 캐싱을 결합한 전략이다. React, react-router 등 자주 변경되지 않는 라이브러리를 별도 청크로 분리하면, 앱 코드를 배포할 때 라이브러리 청크는 캐시를 유지한다. 사용자는 변경된 앱 코드만 다시 다운로드하면 된다.

```
번들 최적화 개념 관계도:

  [코드 분할]          [장기 캐싱]         [manualChunks]
  ──────────          ──────────          ──────────────
  큰 번들을             내용 해시로          자주 안 변하는
  작게 나눔             캐시 유효성 관리     라이브러리 분리
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                     초기 로딩 속도 향상
                     반복 방문 시 전송량 감소
                     브라우저 캐시 효율 극대화
```

---

## 3. 이론과 원리

### 3.1 vite.config.ts 핵심 설정

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // ── 플러그인 ──
  plugins: [
    react(), // React Fast Refresh + JSX 변환
  ],

  // ── Path Alias ──
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },

  // ── 개발 서버 ──
  server: {
    port: 3000,
    open: true, // 서버 시작 시 브라우저 자동 열기
    proxy: {
      // /api 요청을 백엔드 서버로 프록시
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // ── 프로덕션 빌드 ──
  build: {
    outDir: "dist",
    sourcemap: true, // 소스맵 생성 (디버깅용, 프로덕션에서는 선택적)
    rollupOptions: {
      output: {
        // 수동 청크 분할
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
```

### 3.2 환경 변수

#### .env 파일 시스템

```bash
# .env — 모든 환경에서 공통
VITE_APP_NAME=My App

# .env.development — 개발 환경 (npm run dev)
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_DEBUG=true

# .env.production — 프로덕션 환경 (npm run build)
VITE_API_URL=https://api.myapp.com
VITE_ENABLE_DEBUG=false

# .env.staging — 스테이징 환경 (npm run build -- --mode staging)
VITE_API_URL=https://staging-api.myapp.com
VITE_ENABLE_DEBUG=true

# .env.local — 로컬 전용 (Git에 커밋하지 않음!)
VITE_SECRET_KEY=my-local-secret
```

```typescript
// 코드에서 접근
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV; // boolean: 개발 모드인가
const isProd = import.meta.env.PROD; // boolean: 프로덕션 모드인가
const mode = import.meta.env.MODE; // 'development' | 'production' | 'staging'
```

```
환경 변수 규칙

  1. VITE_ 접두사 필수
     · VITE_API_URL → 클라이언트 코드에서 접근 가능 ★
     · API_SECRET → 접근 불가 (보안: 클라이언트에 노출 방지)

  2. .env.local은 Git에 커밋하지 않는다
     · .gitignore에 *.local 포함
     · 개인별 설정, 시크릿에 사용

  3. 빌드 시점에 정적으로 치환된다
     · import.meta.env.VITE_API_URL → "https://api.myapp.com" (문자열로 교체)
     · 런타임에 변경 불가! (빌드 시 결정)

  4. TypeScript 타입 정의
     // src/vite-env.d.ts
     /// <reference types="vite/client" />
     interface ImportMetaEnv {
       readonly VITE_API_URL: string;
       readonly VITE_APP_NAME: string;
       readonly VITE_ENABLE_DEBUG: string;
     }
     interface ImportMeta {
       readonly env: ImportMetaEnv;
     }
```

### 3.3 개발 서버 프록시

```
프록시가 필요한 이유

  프론트엔드: http://localhost:3000
  백엔드 API: http://localhost:8080

  브라우저에서 직접 호출하면 → CORS 에러! ★
  (다른 포트 = 다른 Origin)

  프록시 설정:
    브라우저 → localhost:3000/api/users
    → Vite 프록시 → localhost:8080/api/users
    → 백엔드 응답 → 브라우저

  브라우저 입장에서는 같은 Origin(3000)으로 요청
  → CORS 에러 없음!
  → 프로덕션에서는 같은 도메인이므로 프록시 불필요
```

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    // WebSocket 프록시
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
    },
  },
},
```

### 3.4 빌드 최적화 — manualChunks

#### 왜 청크를 분할하는가

```
기본 빌드 (분할 없음):

  dist/assets/
    index-abc123.js    ← 800KB (모든 코드가 하나에!)
    index-def456.css

  문제:
    · 코드 한 줄 수정 → 전체 800KB 파일의 해시가 변경
    · 사용자: 800KB를 처음부터 다시 다운로드! (캐시 무효화)
    · React, react-router 등 변하지 않는 코드도 매번 다시 다운로드


manualChunks로 분할:

  dist/assets/
    vendor-aaa111.js    ← 150KB (React, ReactDOM — 거의 변하지 않음)
    router-bbb222.js    ← 30KB (react-router — 거의 변하지 않음)
    query-ccc333.js     ← 40KB (TanStack Query — 거의 변하지 않음)
    index-ddd444.js     ← 100KB (앱 코드 — 자주 변함)

  이점:
    · 앱 코드만 수정하면 index-xxx.js만 해시 변경
    · vendor, router, query는 캐시 유지! (다시 다운로드 안 함)
    · 사용자: 100KB만 새로 다운로드 (800KB 대신!)
    · 장기 캐싱(Long-term caching) 전략 ★
```

#### manualChunks 설정 패턴

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // 패턴 1: 라이브러리별 분리
        'vendor-react': ['react', 'react-dom'],
        'vendor-router': ['react-router-dom'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
      },

      // 패턴 2: 함수형 분할 (더 유연)
      manualChunks(id) {
        // node_modules의 라이브러리를 vendor로 분리
        if (id.includes('node_modules')) {
          // 큰 라이브러리는 개별 청크로
          if (id.includes('react-dom')) return 'vendor-react';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@tanstack')) return 'vendor-query';
          // 나머지 node_modules는 하나의 vendor 청크로
          return 'vendor';
        }
      },
    },
  },
},
```

### 3.5 빌드 결과물 분석

```
빌드 후 확인할 것

  npm run build

  출력 예시:
    dist/index.html                 0.5 KB
    dist/assets/vendor-react.js     142 KB │ gzip: 45 KB
    dist/assets/vendor-router.js     28 KB │ gzip:  9 KB
    dist/assets/vendor-query.js      38 KB │ gzip: 12 KB
    dist/assets/index.js            105 KB │ gzip: 32 KB
    dist/assets/products-lazy.js     45 KB │ gzip: 14 KB
    dist/assets/dashboard-lazy.js    82 KB │ gzip: 26 KB
    dist/assets/index.css            18 KB │ gzip:  4 KB

  확인 항목:
    · 전체 JS 크기 (gzip 기준)
    · 가장 큰 청크는 무엇인가? (최적화 대상)
    · lazy 청크가 올바르게 분리되었는가?
    · vendor 청크가 앱 코드와 분리되었는가?


시각적 분석 (Step 29 복습):
  npm install -D rollup-plugin-visualizer

  // vite.config.ts
  import { visualizer } from 'rollup-plugin-visualizer';

  plugins: [
    react(),
    visualizer({
      open: true,          // 빌드 후 자동으로 브라우저에서 열기
      gzipSize: true,      // gzip 크기 표시
      brotliSize: true,    // brotli 크기 표시
    }),
  ],
```

### 3.6 플러그인 시스템

```typescript
// Vite 플러그인 = Rollup 플러그인 + Vite 전용 훅의 확장

// 유용한 플러그인 목록

// 1. @vitejs/plugin-react — React 지원 (필수)
import react from "@vitejs/plugin-react";

// 2. rollup-plugin-visualizer — 번들 시각화
import { visualizer } from "rollup-plugin-visualizer";

// 3. vite-plugin-svgr — SVG를 React 컴포넌트로 import
import svgr from "vite-plugin-svgr";
// import { ReactComponent as Logo } from './logo.svg';

// 4. vite-plugin-compression — gzip/brotli 압축 파일 생성
import compression from "vite-plugin-compression";

// 5. vite-tsconfig-paths — tsconfig.json의 paths를 Vite가 인식
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    // 프로덕션 빌드에서만 적용
    ...(process.env.NODE_ENV === "production"
      ? [
          compression({ algorithm: "gzip" }),
          compression({ algorithm: "brotliCompress" }),
          visualizer({ open: false, filename: "dist/stats.html" }),
        ]
      : []),
  ],
});
```

### 3.7 프로덕션 빌드 체크리스트

```
빌드 전 확인:

  □ 환경 변수가 올바르게 설정되었는가 (.env.production)
  □ console.log가 제거 또는 비활성화되었는가
  □ 소스맵 생성 여부를 결정했는가 (디버깅 vs 보안)
  □ 불필요한 의존성이 devDependencies에 있는가

빌드 후 확인:

  □ dist/ 폴더의 전체 크기 (JS + CSS + 이미지)
  □ 가장 큰 JS 파일이 200KB(gzip) 미만인가
  □ vendor 청크와 앱 청크가 분리되었는가
  □ React.lazy로 분할한 페이지가 별도 청크인가
  □ 이미지가 최적화되었는가 (WebP, 적절한 크기)
  □ index.html이 올바른 경로를 참조하는가

로컬 프리뷰:

  npm run build
  npm run preview    ← dist/를 로컬 서버로 실행하여 확인
  # 또는: npx serve dist

  Lighthouse로 빌드 결과물 성능 측정
```

### 3.8 고급 설정 패턴

#### 조건부 설정

```typescript
export default defineConfig(({ command, mode }) => {
  // command: 'serve' (개발) 또는 'build' (프로덕션)
  // mode: 'development', 'production', 'staging' 등

  const isProduction = mode === "production";

  return {
    plugins: [react(), isProduction && visualizer()].filter(Boolean),

    build: {
      sourcemap: !isProduction, // 개발에서만 소스맵
      minify: isProduction ? "terser" : false,
      rollupOptions: {
        output: {
          manualChunks: isProduction
            ? {
                vendor: ["react", "react-dom"],
              }
            : undefined,
        },
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});
```

#### CSS 설정

```typescript
export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCase", // CSS Modules: kebab-case → camelCase
    },
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // 전역 SCSS 변수
      },
    },
  },
});
```

---

## 4. 사례 연구와 예시

### 4.1 사례: manualChunks로 캐싱 효율 극대화

```
Before (단일 번들):
  index-abc.js: 600KB
  · React(140KB) + App(100KB) + 라이브러리(360KB) 혼합

  앱 코드 한 줄 수정 → index-xyz.js로 해시 변경
  → 사용자: 600KB 전체를 다시 다운로드!

After (manualChunks 적용):
  vendor-react-aaa.js:  142KB  ← React 업그레이드할 때만 변경 (월 1회)
  vendor-libs-bbb.js:   220KB  ← 라이브러리 변경 시에만 (주 1회)
  app-ccc.js:           100KB  ← 앱 코드 배포마다 변경 (일 1회)

  앱 코드 수정 → app-ddd.js만 해시 변경
  → 사용자: 100KB만 다시 다운로드! (vendor는 캐시 유지)
  → 전송량 83% 감소!
```

### 4.2 사례: 환경별 API URL 전환

```
개발:    VITE_API_URL=http://localhost:8080/api   → 로컬 백엔드
스테이징: VITE_API_URL=https://staging-api.myapp.com → 테스트 서버
프로덕션: VITE_API_URL=https://api.myapp.com        → 프로덕션 서버

코드에서:
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  · 코드 변경 없이 환경만 바꿔서 빌드
  · npm run build → 프로덕션 URL 적용
  · npm run build -- --mode staging → 스테이징 URL 적용
  · 환경 분리가 코드 수준에서 보장됨
```

### 4.3 사례: 개발 서버 프록시로 CORS 해결

```
❌ 프록시 없이:
  브라우저(3000) → API(8080) → CORS 에러!
  · 백엔드에 CORS 헤더 추가? → 보안 위험, 번거로움
  · 모든 개발자의 백엔드에 설정 필요

✅ Vite 프록시:
  브라우저(3000) → Vite 프록시(3000/api) → API(8080) → 성공!
  · 프론트엔드 설정만으로 해결
  · 백엔드 변경 불필요
  · 프로덕션에서는 같은 도메인이므로 프록시 불필요

  개발:     fetch('/api/users') → Vite 프록시 → localhost:8080/api/users
  프로덕션:  fetch('/api/users') → 같은 도메인 → api.myapp.com/api/users
  → 코드가 동일! 환경만 다름
```

### 4.4 사례: 대형 라이브러리 Tree Shaking 최적화

Tree Shaking이 제대로 동작하지 않으면 번들에 불필요한 코드가 포함된다. 실무에서 자주 만나는 문제와 해결책이다.

```
문제 사례: lodash 전체가 번들에 포함됨

  // ❌ 잘못된 방법 — lodash 전체(70KB)가 번들에 포함
  import _ from 'lodash';
  const result = _.groupBy(items, 'category');

  // ✅ 방법 1: named import (lodash-es 사용 시 Tree Shaking 동작)
  import { groupBy } from 'lodash-es';
  const result = groupBy(items, 'category');

  // ✅ 방법 2: 개별 함수 import
  import groupBy from 'lodash/groupBy';
  const result = groupBy(items, 'category');

  최적화 효과:
    Before: lodash 전체 70KB(gzip: 25KB) 포함
    After:  groupBy 함수만 ~2KB 포함
    → 번들 크기 23KB 감소!


문제 사례: date-fns 전체가 번들에 포함됨

  // ❌ 잘못된 방법
  import * as dateFns from 'date-fns';
  const formatted = dateFns.format(date, 'yyyy-MM-dd');

  // ✅ 올바른 방법 — date-fns는 ESM 지원 → named import로 Tree Shaking
  import { format } from 'date-fns';
  const formatted = format(date, 'yyyy-MM-dd');

  최적화 효과:
    Before: date-fns 전체 약 200KB
    After:  format 함수만 ~5KB
    → 번들 크기 195KB 감소!
```

---

## 5. 실습

### 실습 1: vite.config.ts 핵심 설정 [Applying]

**목표:** 실전 수준의 Vite 설정을 구성한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · Path Alias: @, @features, @shared
  · 환경 변수:
    - .env.development: VITE_API_URL=http://localhost:8080/api
    - .env.production: VITE_API_URL=https://api.example.com
    - TypeScript 타입 정의 (vite-env.d.ts)
  · 개발 서버: port 3000, 프록시(/api → localhost:8080)
  · import.meta.env.VITE_API_URL이 환경별로 올바르게 주입되는지 확인
  · npm run dev / npm run build 각각에서 환경 변수 확인
```

---

### 실습 2: manualChunks 빌드 최적화 [Applying · Analyzing]

**목표:** 번들 분할 전략을 설계하고 결과를 분석한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · manualChunks 설정:
    - vendor-react: react, react-dom
    - vendor-router: react-router-dom
    - vendor-query: @tanstack/react-query (사용 시)
  · rollup-plugin-visualizer 설치 및 시각화
  · npm run build 후:
    1. 생성된 청크 파일 목록과 크기 기록
    2. visualizer로 번들 구성 시각적 분석
    3. 가장 큰 모듈 식별
    4. 최적화 기회 보고서 작성

비교: manualChunks 적용 전후의 파일 수, 크기, 캐싱 전략 차이
```

---

### 실습 3: 빌드 결과물 점검 + 프리뷰 [Analyzing]

**목표:** 빌드 결과물을 점검하고 프로덕션과 동일한 환경에서 테스트한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
과제:
  1. npm run build 실행
  2. dist/ 폴더 점검:
     · 전체 JS 크기 (원본 + gzip)
     · CSS 크기
     · 이미지/에셋 크기
     · index.html의 script/link 태그 확인
  3. npm run preview로 로컬 프리뷰 실행
  4. Lighthouse Performance 측정
  5. 개선 필요 항목 식별

체크리스트:
  □ JS(gzip) 200KB 미만?
  □ vendor 청크 분리 확인?
  □ lazy 청크 분리 확인?
  □ 소스맵 존재 여부 확인?
  □ 환경 변수가 프로덕션 값인지 확인?
```

---

### 실습 4 (선택): 고급 빌드 최적화 [Evaluating]

**목표:** 프로젝트의 빌드를 최대한 최적화한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
과제:
  1. 번들 분석으로 가장 큰 모듈 3개 식별
  2. 각 모듈에 대해 최적화 적용:
     · 동적 import로 분리 가능한가?
     · 가벼운 대안이 있는가?
     · Tree Shaking이 제대로 동작하는가?
  3. gzip/brotli 압축 플러그인 적용
  4. 최적화 전후 비교:
     · 초기 로딩 JS 크기 (gzip)
     · Lighthouse Performance 점수
     · FCP, LCP 시간
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 39 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Vite = 개발은 ESBuild(속도), 프로덕션은 Rollup(최적화)    │
│     → 개발: Native ESM + 번들링 없음 + HMR ~50ms             │
│     → 빌드: Rollup + Tree Shaking + 코드 분할 + 압축         │
│     → Pre-bundling: node_modules를 ESM으로 미리 변환/캐시     │
│                                                               │
│  2. 환경 변수 = VITE_ 접두사 + .env 파일                      │
│     → VITE_API_URL: 클라이언트에 노출 가능                   │
│     → 빌드 시점에 정적 치환 (런타임 변경 불가)               │
│     → .env.development / .env.production / .env.local         │
│     → TypeScript 타입 정의 (vite-env.d.ts)                   │
│                                                               │
│  3. manualChunks = 장기 캐싱 전략의 핵심                      │
│     → vendor(거의 안 변함)와 app(자주 변함) 분리             │
│     → 앱 코드 수정 시 vendor 캐시 유지 → 전송량 대폭 감소   │
│     → React, router, query 등 라이브러리별 청크 분리         │
│                                                               │
│  4. 개발 서버 프록시 = CORS 해결                              │
│     → /api 요청을 백엔드로 프록시                            │
│     → 코드 변경 없이 개발/프로덕션 환경 전환                 │
│                                                               │
│  5. 빌드 결과물을 반드시 분석한다                              │
│     → rollup-plugin-visualizer로 시각화                      │
│     → 큰 모듈 식별 → 동적 import 또는 대안 라이브러리        │
│     → gzip 기준 200KB 미만이 이상적                          │
│                                                               │
│  6. npm run preview로 프로덕션 빌드를 로컬에서 검증            │
│     → 배포 전 최종 확인                                      │
│     → Lighthouse로 성능 측정                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Vite가 개발에서 ESBuild, 프로덕션에서 Rollup을 사용하는 이유는?     | Understand | 1.5, 2.5    |
| 2   | VITE\_ 접두사가 없는 환경 변수가 클라이언트에서 접근 불가한 이유는? | Understand | 3.2         |
| 3   | Pre-bundling이 개발 서버 성능에 기여하는 원리는?                    | Understand | 2.4         |
| 4   | manualChunks로 vendor를 분리하면 캐싱에 유리한 이유는?              | Analyze    | 3.4, 2.6    |
| 5   | 개발 서버 프록시가 CORS를 해결하는 원리는?                          | Understand | 3.3         |
| 6   | 빌드 후 가장 큰 청크가 300KB(gzip)라면 어떤 최적화를 시도하는가?    | Apply      | 3.5, 4.4    |
| 7   | sourcemap을 프로덕션에서 생성하는 것의 장단점은?                    | Evaluate   | 3.7         |
| 8   | npm run preview가 npm run dev와 다른 점은?                          | Remember   | 3.7         |

### 6.3 FAQ

**Q1. Vite와 Create React App(CRA)의 실질적인 차이는 무엇인가요?**

CRA는 내부적으로 Webpack을 사용하며, 설정이 완전히 숨겨져 있어(`eject` 없이 수정 불가) 유연성이 낮다. Vite는 설정이 완전히 열려있고 `vite.config.ts` 하나로 모든 것을 제어한다. 속도 측면에서 Vite의 개발 서버 시작은 CRA 대비 5~10배 빠르고, HMR도 훨씬 빠르다. React 공식 문서도 2023년부터 CRA 대신 Vite(또는 프레임워크)를 권장한다. 신규 프로젝트라면 Vite를 선택하는 것이 현재 업계 표준이다.

**Q2. 환경 변수를 런타임에 변경하고 싶은데 VITE\_ 변수로는 불가능한가요?**

VITE* 환경 변수는 빌드 시점에 정적으로 문자열 치환되므로 런타임 변경이 불가능하다. 런타임에 환경을 다르게 하려면 두 가지 방법이 있다. 첫째, `public/config.js`에 `window.\_env*`같은 전역 변수를 설정하고`index.html`에서 로드한다(Docker 환경에서 많이 사용). 둘째, API 서버에서 설정을 가져오는 엔드포인트를 만든다. 단, 대부분의 경우 "환경마다 따로 빌드"하는 것이 더 단순하고 안전하다.

**Q3. manualChunks 설정이 복잡해질 때 어떻게 관리하나요?**

처음에는 단순하게 `vendor-react`, `vendor-router`, `vendor-query` 세 개 정도로 시작한다. 번들 시각화(visualizer) 후 특정 라이브러리가 초기 청크에 불필요하게 포함된 것을 발견하면 점진적으로 분리한다. 함수형 `manualChunks(id)` 패턴이 선언형 객체 패턴보다 유연하고 대규모 프로젝트에 적합하다. 중요한 것은 "완벽한 설정"보다 "배포 시마다 변경되는 코드의 크기를 최소화"하는 원칙이다.

**Q4. Vite 개발 서버에서는 잘 동작하는데 빌드 후에 깨지는 경우가 발생합니다. 왜인가요?**

이는 Vite의 이중 구조(개발: ESBuild, 프로덕션: Rollup)에서 비롯되는 가장 흔한 문제다. 주요 원인은: (1) CommonJS 모듈을 ESM처럼 default import하는 코드(개발에서는 Pre-bundling이 처리, 빌드에서는 Rollup이 다르게 처리), (2) `import.meta.glob` 패턴의 차이, (3) CSS modules 클래스 이름 처리 차이. 해결책: `npm run build && npm run preview`를 개발 중 정기적으로 실행하여 빌드 결과물을 확인한다. 또한 `build.rollupOptions`에서 CommonJS 관련 플러그인을 추가한다.

**Q5. 빌드 속도가 느린데 어떻게 개선할 수 있나요?**

프로덕션 빌드 속도 개선 방법: (1) `build.minify: 'esbuild'`를 사용하면 기본 terser 대비 빠르다(약간의 최적화 손실 감수). (2) `build.sourcemap: false`로 소스맵 생성을 비활성화한다. (3) 불필요한 플러그인을 제거한다. (4) `rollup-plugin-visualizer` 등 분석 플러그인은 일반 빌드에서 제외하고 분석할 때만 사용한다. 대형 프로젝트에서 Rollup 번들링 속도 자체의 한계에 부딪히면 Vite의 `build.rollupOptions.experimentalMinChunkSize`로 작은 청크들을 합치는 것도 방법이다.

---

## 7. 다음 단계 예고

> **Step 40. 배포 전략과 CI/CD**
>
> - 정적 호스팅 (Vercel, Netlify, AWS S3+CloudFront)
> - Docker 컨테이너 배포
> - GitHub Actions CI/CD 파이프라인
> - 환경별 배포 전략 (스테이징, 프로덕션)
> - 롤백 전략과 Feature Flag

---

## 📚 참고 자료

- [Vite 공식 문서](https://vite.dev/)
- [Vite — Config Reference](https://vite.dev/config/)
- [Vite — Env Variables](https://vite.dev/guide/env-and-mode.html)
- [Vite — Build Optimizations](https://vite.dev/guide/build.html)
- [Vite — Server Proxy](https://vite.dev/config/server-options.html#server-proxy)
- [Rollup — manualChunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Why Vite (Evan You)](https://vite.dev/guide/why.html)

---

> **React 완성 로드맵 v2.0** | Phase 7 — 빌드·배포·프로덕션 | Step 39 of 42
