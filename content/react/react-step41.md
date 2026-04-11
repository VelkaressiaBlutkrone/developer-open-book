# Step 41. 프로덕션 모니터링과 에러 추적

> **난이도:** 🔴 고급 (Advanced)

> **Phase 7 — 빌드·배포·프로덕션 (Step 39~42)**
> 빌드, 배포, 프로덕션 운영으로 앱을 완성한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                               |
| -------------- | ------------------------------------------------------------------ |
| **Remember**   | 에러 모니터링, 성능 모니터링, 로깅의 역할을 기술할 수 있다         |
| **Understand** | Source Map이 프로덕션 에러 디버깅에 기여하는 원리를 설명할 수 있다 |
| **Apply**      | Sentry를 React 앱에 통합하여 에러를 자동 수집할 수 있다            |
| **Analyze**    | 프로덕션 에러 데이터를 분석하여 우선순위를 결정할 수 있다          |
| **Evaluate**   | 프로젝트에 적합한 모니터링 전략을 설계하고 판단할 수 있다          |

**전제 지식:**

- Step 17: Error Boundary
- Step 29: Core Web Vitals (LCP, INP, CLS)
- Step 37: CI/CD, 배포 후 모니터링
- Step 40: 배포 전략, 롤백

---

## 1. 서론 — "배포는 끝이 아니라 시작이다"

### 1.1 모니터링 없는 프로덕션이 위험한 이유

소프트웨어를 배포하는 순간 예측할 수 없는 환경이 기다린다. 개발자의 맥북, CI 서버, 그리고 프로덕션 환경은 근본적으로 다르다. 사용자는 구형 안드로이드 폰을 쓰거나, 느린 3G 네트워크를 사용하거나, 개발자가 한 번도 테스트하지 않은 브라우저 익스텐션을 설치해두었을 수 있다. 이러한 현실 세계의 다양성 속에서 코드가 어떻게 동작하는지는 실제로 배포한 후에야 알 수 있다.

2013년 페이스북의 iOS 앱 업데이트에서 특정 기기 조합에서만 크래시가 발생하는 버그가 프로덕션에 배포된 사례가 있다. 개발팀은 모니터링 시스템을 통해 크래시 리포트가 급증하는 것을 배포 15분 만에 감지하고 롤백할 수 있었다. 모니터링이 없었다면 사용자 신고가 쌓이고, 원인을 파악하고, 수정을 배포하기까지 수 시간이 걸렸을 것이다.

프론트엔드 모니터링의 핵심 가치는 "사용자가 문제를 인지하기 전에 개발팀이 먼저 인지하는 것"이다. 이를 위해서는 에러를 자동으로 수집하고, 성능 데이터를 실시간으로 분석하며, 이상 징후가 감지되면 즉시 알림을 받는 시스템이 필요하다.

```
모니터링 없이:
  · 사용자: "결제가 안 됩니다!" → 고객 지원 문의
  · 개발팀: "언제부터요?" → 모름
  · 개발팀: "어디서 에러가 났어요?" → 재현 불가
  · 개발팀: "몇 명이 영향받았어요?" → 모름
  · 결과: 사용자 이탈, 매출 손실, 신뢰 하락

모니터링이 있으면:
  · Sentry 알림: "TypeError at CheckoutPage.tsx:42 — 지난 5분간 150건"
  · 개발팀: 즉시 인지 → 스택 트레이스 확인 → 원인 파악
  · 개발팀: "영향 범위: 결제 페이지, 사용자 150명"
  · 판단: 심각도 높음 → 롤백 또는 핫픽스
  · 결과: 사용자가 인지하기 전에 해결 ★
```

### 1.2 프론트엔드 모니터링의 역사와 발전

2000년대 초반까지 프론트엔드 에러는 서버 로그에 기록되지 않았다. JavaScript 에러는 브라우저 콘솔에만 표시되었고, 프로덕션에서 무엇이 잘못되는지 알기 위해서는 사용자가 직접 신고해야 했다. 이 시기에는 "에러 모니터링"이라는 개념 자체가 서버 사이드에만 존재했다.

2010년대 들어 웹 앱이 SPA(Single Page Application)로 복잡해지면서 프론트엔드 에러 모니터링의 필요성이 급격히 높아졌다. 2012년 Sentry가 오픈소스로 시작되었고, 이후 JavaScript SDK를 추가하며 프론트엔드 모니터링 플랫폼의 표준이 되었다. 현재 수백만 개의 앱이 Sentry를 사용하고 있다.

성능 모니터링 분야에서는 Google이 2020년 Core Web Vitals를 발표하며 게임을 바꿨다. LCP(Largest Contentful Paint), CLS(Cumulative Layout Shift), INP(Interaction to Next Paint) 세 지표가 Google 검색 랭킹에 반영되면서 성능 모니터링이 SEO와 직접 연결되었다. `web-vitals` 라이브러리는 실제 사용자의 브라우저에서 이 데이터를 수집하는 표준 방법이 되었다.

### 1.3 프로덕션 모니터링의 3가지 축과 상호 관계

```
┌─────────────────────────────────────────────────────────────┐
│               프로덕션 모니터링 전체 구조                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 에러 모니터링 — "무엇이 깨졌는가"                        │
│     · JavaScript 에러 자동 수집                              │
│     · 스택 트레이스, 사용자 컨텍스트, 빈도                  │
│     · 도구: Sentry, Datadog, Bugsnag                        │
│                                                              │
│  2. 성능 모니터링 — "느려지고 있는가"                        │
│     · Core Web Vitals (LCP, INP, CLS) 실 사용자 데이터     │
│     · 페이지 로드 시간, API 응답 시간                       │
│     · 도구: Sentry Performance, Vercel Analytics, web-vitals│
│                                                              │
│  3. 사용자 분석 — "사용자가 무엇을 하는가"                   │
│     · 페이지뷰, 클릭 이벤트, 전환율                         │
│     · 사용자 흐름, 이탈 지점                                │
│     · 도구: Google Analytics, Posthog, Amplitude            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  세 축의 상호 관계:                                          │
│                                                              │
│  에러 급증 → 사용자 이탈 증가 → 전환율 하락                │
│  성능 저하 → 페이지 이탈 증가 → DAU 감소                   │
│  사용자 분석 → 어떤 기능에 에러가 치명적인지 판단           │
│                                                              │
│  "세 축을 함께 보아야 전체 그림이 보인다"                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────────┐
│  다루는 것                                                   │
│  · Sentry를 활용한 에러 모니터링 통합                        │
│  · Source Map과 프로덕션 에러 디버깅                         │
│  · Error Boundary + Sentry 결합                             │
│  · Core Web Vitals 수집과 분석                              │
│  · 로깅 전략 (무엇을, 어떤 수준으로)                        │
│  · 사용자 분석(Analytics) 기초                              │
│  · 알림과 대응 프로세스                                      │
│  · 모니터링 전략 설계                                        │
├─────────────────────────────────────────────────────────────┤
│  다루지 않는 것                                              │
│  · APM(Application Performance Monitoring) 서버 사이드      │
│  · Datadog/New Relic 상세                                   │
│  · 로그 집계 시스템(ELK Stack)                               │
│  · A/B 테스트 플랫폼 상세                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 Sentry — 에러 모니터링 플랫폼

Sentry는 2012년 David Cramer가 오픈소스로 시작한 에러 모니터링 플랫폼이다. 초기에는 Python 서버 사이드 에러 추적으로 시작했으나, JavaScript/TypeScript, React, Vue, Angular 등 프론트엔드 SDK를 추가하며 풀스택 에러 모니터링의 표준이 되었다. 현재 Dropbox, GitHub, Cloudflare 등 수백만 개의 프로젝트가 사용하고 있다.

Sentry의 핵심 가치는 에러를 단순히 수집하는 것이 아니라 "왜 이 에러가 발생했는가"를 이해할 수 있는 컨텍스트를 함께 제공하는 것이다. 에러 발생 직전의 사용자 행동(Breadcrumb), 사용자 정보, 브라우저/OS 환경, Source Map을 통한 원본 코드 위치, 그리고 같은 에러가 몇 번 발생했는지까지 한 화면에서 볼 수 있다.

```
Sentry의 핵심 기능 구조:

  ┌──────────────────────────────────────────┐
  │  에러 수집 계층                           │
  │  · 전역 오류 핸들러 (window.onerror)      │
  │  · Promise rejection 핸들러              │
  │  · Error Boundary 통합                   │
  │  · 수동 captureException()               │
  ├──────────────────────────────────────────┤
  │  컨텍스트 강화 계층                       │
  │  · Source Map → 원본 파일/줄 번호        │
  │  · Breadcrumb → 에러 전 사용자 행동      │
  │  · User Context → 영향받은 사용자        │
  │  · Release Tracking → 배포 버전별 분류   │
  ├──────────────────────────────────────────┤
  │  알림/분류 계층                           │
  │  · Issue Grouping → 동일 에러 묶기       │
  │  · Alert Rules → 조건별 자동 알림        │
  │  · Performance → Web Vitals 수집         │
  └──────────────────────────────────────────┘
```

### 2.2 Source Map — 프로덕션 디버깅의 핵심

Source Map은 빌드 도구(Vite, Webpack)가 코드를 최소화(minify)·번들링하면서 생성하는 매핑 정보 파일이다. 프로덕션에 배포된 코드(`vendor-abc123.js:1:45892`)와 원본 소스 코드(`UserProfile.tsx:42:15`) 사이의 1:1 매핑을 담고 있다.

Source Map이 없으면 프로덕션 에러의 스택 트레이스는 해독 불가능한 수준이다. 변수명은 `a`, `b`, `c` 같은 단 글자로 난독화되고, 줄 번호는 번들된 파일의 문자 위치를 가리킨다. Source Map이 있으면 Sentry가 이를 자동으로 역변환하여 원본 파일명, 줄 번호, 심지어 해당 줄의 코드 스니펫까지 보여준다.

보안 측면에서 Source Map은 신중하게 다뤄야 한다. Source Map 파일이 공개 URL에 노출되면 전체 소스 코드가 그대로 유출된다. 권장 방식은 Sentry에만 업로드한 후 `dist/` 폴더에서 `.map` 파일을 삭제하는 것이다.

```
Source Map 없는 에러:
  Uncaught TypeError: Cannot read properties of null
  at e (vendor-abc123.js:1:45892)
  at t (app-def456.js:1:2301)
  → 원인 파악 불가

Source Map 있는 에러 (Sentry):
  Uncaught TypeError: Cannot read properties of null
  at UserProfile (src/features/users/UserProfile.tsx:42:15)
  at renderWithHooks (react-dom.development.js:14985:18)
  → 즉시 원인 파악 가능!
  + 코드 스니펫:
    41 | const { name } = user;
    42 |>const avatar = user.profile.avatar;  ← null!
    43 | return <img src={avatar} />;
```

### 2.3 RUM (Real User Monitoring)

RUM은 실제 사용자의 브라우저에서 성능 데이터를 수집하는 방식이다. Lighthouse나 PageSpeed Insights 같은 Lab(합성) 테스트와 달리, RUM은 다양한 기기·네트워크·지역의 실제 사용자 경험을 측정한다.

Google은 Core Web Vitals를 검색 랭킹 지표로 사용할 때 Chrome User Experience Report(CrUX)라는 RUM 데이터를 기반으로 평가한다. 즉, 개발자의 고성능 맥북에서 측정한 Lighthouse 점수가 아니라, 전 세계 실제 사용자들의 브라우저에서 수집된 데이터가 SEO에 직접 영향을 미친다.

`web-vitals` 라이브러리는 Google이 직접 관리하는 공식 RUM 수집 도구로, LCP/INP/CLS/FCP/TTFB를 정확하게 측정하고 p75(75번째 백분위수) 기준으로 평가한다.

```
Lab Data vs Field Data (RUM) 비교:

  Lab Data:
    도구: Lighthouse, PageSpeed Insights, WebPageTest
    환경: 통제된 조건 (고정 네트워크, 가상 기기)
    측정 시점: 개발자가 원할 때
    용도: 개발 중 최적화 방향 판단

  Field Data (RUM):
    도구: web-vitals 라이브러리, Sentry Performance
    환경: 실제 사용자의 다양한 환경
    측정 시점: 사용자가 앱을 사용할 때 자동
    용도: 실제 사용자 경험 추적, Google 랭킹 지표

  핵심 차이:
    · Lab은 "최적 조건"을 측정 → 개발 가이드
    · Field는 "실제 조건"을 측정 → SEO + UX 지표
    · 둘 다 필요하다 (Lab만 보면 현실을 놓침)
```

### 2.4 에러 분류와 우선순위 체계

프로덕션 에러를 모두 동일하게 처리하면 중요한 에러가 소음 속에 묻힌다. 에러를 심각도에 따라 분류하고, 각 수준에 맞는 대응 방식과 알림 채널을 미리 정의해야 한다.

심각도는 두 가지 기준으로 평가한다. 첫째는 영향 범위(Impact): 에러가 결제, 인증 같은 핵심 기능에 영향을 주는가, 아니면 부가 기능인가. 둘째는 발생 빈도(Frequency): 에러가 얼마나 자주 발생하고 얼마나 많은 사용자에게 영향을 주는가.

```
에러 심각도 분류 기준:

  Critical (즉시 대응):
    · 핵심 기능 완전 중단 (결제, 로그인, 데이터 손실)
    · 에러율 > 5% 또는 영향 사용자 > 100명/5분
    · 전체 앱 크래시

  High (30분 내 대응):
    · 주요 기능 부분 장애
    · 에러율 > 1%
    · 새 배포와 함께 발생한 새 에러 유형

  Medium (다음 스프린트):
    · 부가 기능 에러
    · 에러율 > 0.1%
    · 특정 브라우저/기기에서만 발생

  Low (기술 부채 관리):
    · Deprecated API 사용
    · 비핵심 기능의 드문 에러
    · 콘솔 경고
```

### 2.5 핵심 용어 사전

| 용어                 | 정의                                                                    | 왜 중요한가                                                |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Sentry**           | 프로덕션 에러를 **자동으로 수집·분류·알림**하는 모니터링 플랫폼         | React 생태계에서 가장 널리 사용되는 에러 모니터링          |
| **Source Map**       | 최소화(minify)된 프로덕션 코드를 **원본 소스 코드와 매핑**하는 파일     | 프로덕션 에러의 스택 트레이스를 원본 파일명·줄 번호로 표시 |
| **Breadcrumb**       | 에러 발생 전 사용자의 **행동 기록** (클릭, 네비게이션, API 호출 등)     | "에러가 발생하기까지 사용자가 무엇을 했는가"를 추적        |
| **RUM**              | Real User Monitoring. **실제 사용자의 브라우저**에서 성능 데이터를 수집 | 합성(Lab) 테스트가 아닌 실제 사용 환경의 성능을 측정       |
| **Alert Rule**       | 특정 조건 충족 시 **자동으로 알림을 발송**하는 규칙                     | 에러 급증, 성능 저하 등을 즉시 인지                        |
| **Release Tracking** | 배포 버전별로 에러를 **분류하여 추적**                                  | "이 에러가 어떤 배포에서 시작되었는가?"                    |
| **Issue Grouping**   | 동일한 에러를 **하나의 이슈로 묶어** 관리                               | 같은 에러 1,000건을 1,000개가 아닌 1개 이슈로 보여줌       |
| **Session Replay**   | 에러 발생 전후 **사용자 행동을 영상처럼 기록**하는 기능                 | 재현하기 어려운 에러의 정확한 원인 파악                    |

---

## 3. 이론과 원리

### 3.1 Sentry — React 에러 모니터링

#### 설치와 기본 설정

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' | 'production'
  release: import.meta.env.VITE_APP_VERSION, // 배포 버전 추적

  // 성능 모니터링 샘플링
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // 프로덕션: 10% 샘플링 (비용 절약), 개발: 100%

  // 세션 리플레이 (사용자 행동 녹화)
  replaysSessionSampleRate: 0.01, // 전체 세션의 1%
  replaysOnErrorSampleRate: 1.0, // 에러 발생 시 100% 녹화!

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // 개발 환경에서는 Sentry 비활성화
  enabled: import.meta.env.PROD,

  // 민감한 데이터 필터링
  beforeSend(event) {
    // 비밀번호, 토큰 등 제거
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    return event;
  },
});
```

```tsx
// main.tsx — 앱 진입점에서 Sentry 초기화
import "./lib/sentry"; // 가장 먼저 import!
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

#### Error Boundary + Sentry 결합

```tsx
import * as Sentry from "@sentry/react";

// Sentry가 제공하는 Error Boundary 사용
function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-page">
          <h1>예상치 못한 오류가 발생했습니다</h1>
          <p>오류가 자동으로 보고되었습니다.</p>
          <button onClick={resetError}>다시 시도</button>
        </div>
      )}
      onError={(error, componentStack) => {
        // Sentry에 자동 보고됨 + 추가 컨텍스트 가능
        console.error("Error Boundary caught:", error);
      }}
    >
      <Router />
    </Sentry.ErrorBoundary>
  );
}

// 또는 기존 Error Boundary에 Sentry 수동 연동
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }
  // ... render fallback
}
```

#### 사용자 컨텍스트 설정

```tsx
// 로그인 시 사용자 정보를 Sentry에 설정
function useAuthWithSentry() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: String(user.id),
        email: user.email,
        // ⚠️ 개인정보 최소화: 이름, 주소 등은 보내지 않는다
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);
}

// 에러 발생 시 Sentry가 "어떤 사용자에게 발생했는가" 표시
// → "사용자 #42에게 영향, 결제 페이지에서 발생"
```

#### 수동 에러 보고

```tsx
// try/catch에서 잡은 에러를 Sentry에 보고
async function handlePayment(data) {
  try {
    await processPayment(data);
  } catch (error) {
    // Sentry에 수동 보고 + 추가 컨텍스트
    Sentry.captureException(error, {
      tags: {
        feature: "payment",
        paymentMethod: data.method,
      },
      extra: {
        orderId: data.orderId,
        amount: data.amount,
      },
    });

    // 사용자에게 에러 UI 표시
    toast.error("결제 처리 중 오류가 발생했습니다.");
  }
}

// Breadcrumb 수동 추가 (사용자 행동 기록)
Sentry.addBreadcrumb({
  category: "user-action",
  message: "장바구니에 상품 추가",
  data: { productId: 42, quantity: 2 },
  level: "info",
});
```

### 3.2 Source Map — 프로덕션 에러 디버깅

#### Source Map의 역할

```
프로덕션 코드 (최소화됨):
  a.jsx:1 Uncaught TypeError: Cannot read properties of null (reading 'name')
  at e (vendor-abc123.js:1:45892)
  → "vendor-abc123.js의 45892번째 문자"??? 디버깅 불가능!

Source Map 적용 후:
  Uncaught TypeError: Cannot read properties of null (reading 'name')
  at UserProfile (src/features/users/components/UserProfile.tsx:42:15)
  → "UserProfile.tsx의 42번째 줄, 15번째 문자" → 즉시 위치 파악! ★
```

#### Source Map 업로드 (Sentry)

```typescript
// vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    sourcemap: true, // Source Map 생성 필수!
  },
  plugins: [
    react(),
    // 프로덕션 빌드 시에만 Sentry에 Source Map 업로드
    sentryVitePlugin({
      org: "my-org",
      project: "my-react-app",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.npm_package_version,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
        // 업로드 후 .map 파일 삭제 → 사용자에게 노출 방지! ★
      },
    }),
  ],
});
```

```
Source Map 보안 전략

  옵션 1: Sentry에만 업로드 + 프로덕션에서 삭제 (권장 ★)
    · 빌드 시 .map 생성 → Sentry에 업로드 → .map 파일 삭제
    · Sentry에서만 원본 소스를 볼 수 있음
    · 사용자에게 소스 코드 노출 없음

  옵션 2: Source Map을 프로덕션에 포함
    · 브라우저 DevTools에서 원본 소스 확인 가능
    · 편리하지만 소스 코드가 노출됨
    · 오픈소스 프로젝트에서는 괜찮음

  옵션 3: Source Map 생성 안 함
    · 에러 디버깅이 매우 어려움 → 비권장
```

### 3.3 Core Web Vitals 수집

#### web-vitals 라이브러리

```typescript
// src/lib/webVitals.ts
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  // Sentry로 전송
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: "info",
    tags: {
      metric_name: metric.name,
      metric_rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    },
    extra: {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
    },
  });

  // 또는 자체 분석 엔드포인트로 전송
  // navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(metric));
}

// 실 사용자 데이터(RUM) 수집
export function initWebVitals() {
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onINP(sendToAnalytics); // Interaction to Next Paint
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onFCP(sendToAnalytics); // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

// main.tsx에서 초기화
import { initWebVitals } from "./lib/webVitals";

// 앱 렌더링 후 Web Vitals 수집 시작
initWebVitals();
```

```
Core Web Vitals 기준값:

  LCP (Largest Contentful Paint) — 로딩 성능
    · Good:              ≤ 2.5초
    · Needs Improvement: 2.5 ~ 4.0초
    · Poor:              > 4.0초

  INP (Interaction to Next Paint) — 상호작용 반응성
    · Good:              ≤ 200ms
    · Needs Improvement: 200 ~ 500ms
    · Poor:              > 500ms

  CLS (Cumulative Layout Shift) — 시각적 안정성
    · Good:              ≤ 0.1
    · Needs Improvement: 0.1 ~ 0.25
    · Poor:              > 0.25

  평가 기준: p75 (75번째 백분위수)
    · 하위 75% 사용자가 "Good" 범위여야 Good으로 평가
    · 상위 25%의 열악한 환경 사용자도 고려
```

### 3.4 로깅 전략

```
프론트엔드 로깅 원칙

  "모든 것을 로깅하지 말고, 의미 있는 것만 로깅한다"

  로깅 수준:

  ERROR (에러) — 반드시 로깅
    · API 호출 실패
    · 결제 처리 실패
    · 렌더링 에러 (Error Boundary)
    · 인증 토큰 갱신 실패
    → Sentry.captureException()

  WARN (경고) — 선택적 로깅
    · API 응답이 예상과 다른 형식
    · 성능 임계치 초과 (LCP > 4초)
    · Deprecated API 사용 감지
    → Sentry.captureMessage(msg, 'warning')

  INFO (정보) — 선택적 로깅
    · 사용자 로그인/로그아웃
    · 중요 비즈니스 이벤트 (주문 완료, 가입)
    · Feature Flag 전환
    → Analytics 또는 Sentry breadcrumb

  DEBUG — 개발 환경에서만
    · State 변경 추적
    · 렌더링 횟수
    · API 요청/응답 상세
    → console.log (프로덕션에서 제거!)


프로덕션에서 console.log 제거:
  // vite.config.ts
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // 모든 console.* 제거
        drop_debugger: true,    // debugger 문 제거
      },
    },
  },
```

### 3.5 사용자 분석(Analytics) 기초

```
사용자 분석이 답하는 질문

  · 하루에 몇 명이 방문하는가? (DAU)
  · 어떤 페이지가 가장 많이 방문되는가?
  · 사용자가 어디서 이탈하는가? (퍼널 분석)
  · 검색 → 상품 상세 → 장바구니 → 결제의 전환율은?
  · 어떤 기능이 가장 많이 사용되는가?
  · 새 기능 출시 후 사용률은?


간단한 이벤트 추적 구현:

  // src/lib/analytics.ts
  export function trackEvent(name: string, properties?: Record<string, unknown>) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', name, properties);
    }

    // 또는 자체 엔드포인트
    navigator.sendBeacon('/api/analytics/events', JSON.stringify({
      event: name,
      properties,
      timestamp: Date.now(),
      url: window.location.pathname,
    }));
  }

  // 사용
  trackEvent('product_viewed', { productId: 42, category: 'electronics' });
  trackEvent('add_to_cart', { productId: 42, quantity: 1 });
  trackEvent('checkout_started', { itemCount: 3, totalPrice: 150000 });
  trackEvent('purchase_completed', { orderId: 'ORD-123', totalPrice: 150000 });


페이지뷰 자동 추적:

  // React Router와 연동
  function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
      trackEvent('page_view', {
        path: location.pathname,
        search: location.search,
      });
    }, [location]);
  }
```

### 3.6 알림과 대응 프로세스

```
알림 규칙 설계

  ┌─────────────────────────────────────────────────────────┐
  │  심각도      │  조건                │  알림 채널         │
  ├─────────────┼─────────────────────┼───────────────────┤
  │  Critical   │  에러율 > 5%         │  Slack + PagerDuty│
  │             │  결제 에러 발생       │  즉시 알림         │
  │             │  전체 앱 크래시       │                    │
  ├─────────────┼─────────────────────┼───────────────────┤
  │  High       │  에러율 > 1%         │  Slack 알림        │
  │             │  LCP > 4초 (p75)    │  30분 내 확인      │
  │             │  새 에러 유형 발생    │                    │
  ├─────────────┼─────────────────────┼───────────────────┤
  │  Medium     │  에러율 > 0.1%       │  일간 리포트        │
  │             │  CLS > 0.25 (p75)   │                    │
  ├─────────────┼─────────────────────┼───────────────────┤
  │  Low        │  Deprecated API 사용 │  주간 리포트        │
  │             │  비핵심 기능 에러     │                    │
  └─────────────┴─────────────────────┴───────────────────┘


에러 대응 프로세스:

  1. 알림 수신 → 심각도 판단
  2. 심각도 Critical/High:
     · Sentry에서 에러 상세 확인
     · 영향 범위 파악 (사용자 수, 페이지)
     · 최근 배포가 원인인가? → 롤백 고려
     · 아니면 → 핫픽스 진행
  3. 해결 후:
     · 에러가 재발하지 않는지 모니터링
     · 포스트모템 작성 (원인, 해결, 재발 방지 계획)
  4. 심각도 Medium/Low:
     · 다음 스프린트에 수정 계획
     · 기술 부채로 관리
```

### 3.7 모니터링 전략 설계

```
프로젝트 규모별 모니터링

  소규모 (1~2명, MVP):
    · Sentry 무료 티어 (월 5,000 에러)
    · Error Boundary + Sentry 기본 통합
    · console.error를 Sentry로 전환
    · 알림: 이메일만
    → 최소 비용으로 "에러가 발생하면 안다"

  중규모 (3~5명, 프로덕션):
    · Sentry (에러 + Performance)
    · Source Map 업로드
    · web-vitals 수집
    · 사용자 컨텍스트 설정
    · 릴리스 추적
    · 알림: Slack + 심각도별 규칙
    → "에러를 빠르게 발견하고 원인을 파악한다"

  대규모 (5명+, 엔터프라이즈):
    · Sentry (에러 + Performance + Session Replay)
    · Datadog/New Relic (인프라 + APM)
    · 커스텀 대시보드 (Grafana)
    · Analytics (GA4, Amplitude)
    · 알림: PagerDuty + On-call 로테이션
    · 포스트모템 프로세스
    → "모든 것을 측정하고 추적하고 대응한다"
```

---

## 4. 사례 연구와 예시

### 4.1 사례: Sentry가 배포 직후 에러를 감지한 사례

```
시나리오:
  · v2.3.1 배포 완료 (금요일 오후 5시)
  · 5분 후 Sentry 알림:
    "TypeError: Cannot read 'map' of undefined
     at ProductList.tsx:28
     — 지난 5분간 89건, 영향 사용자 42명"

  Sentry에서 확인:
    · Release: v2.3.1 (이전 v2.3.0에서는 0건!)
    · 스택 트레이스: ProductList.tsx:28
      const items = data.products.map(...)
      → data.products가 undefined!
    · Breadcrumbs:
      1. 사용자가 /products 방문
      2. API 호출 /api/products → 200 OK
      3. 응답 형식이 변경됨: { items: [...] } → data.products 없음!
    · 원인: 백엔드가 응답 형식을 변경했는데 프론트가 미대응

  대응:
    · 즉시 롤백 (v2.3.0으로 Vercel Promote) — 2분
    · 월요일에 수정 후 재배포
    · "금요일 오후 배포는 위험하다" 교훈
```

### 4.2 사례: Source Map으로 프로덕션 에러 디버깅

```
Source Map 없이:
  Error: Unexpected token
  at n (chunk-abc.js:1:89234)
  at o (chunk-abc.js:1:89456)
  → "89234번째 문자가 뭔데...?" → 디버깅 포기

Source Map 있으면 (Sentry 대시보드):
  Error: Unexpected token
  at parseResponse (src/services/productService.ts:42:15)
  at fetchProducts (src/hooks/useProducts.ts:18:22)
  → "productService.ts 42번째 줄!" → 즉시 파악

  + 해당 줄의 코드 스니펫까지 표시:
    41 |   const data = await response.json();
    42 |>  return JSON.parse(data.body);  // data.body가 undefined!
    43 |

  + 로컬 변수 값:
    response.status: 200
    data: { products: [...] }
    data.body: undefined
```

### 4.3 사례: Web Vitals 모니터링으로 성능 회귀 감지

```
배포 전 (v2.2.0):
  LCP p75: 2.1초 (좋음 ✅)
  CLS p75: 0.05 (좋음 ✅)

배포 후 (v2.3.0):
  LCP p75: 3.8초 (보통 ⚠️ — 2.5초 초과!)
  CLS p75: 0.05 (변화 없음)

원인 분석:
  · LCP가 1.7초 증가
  · 배포 diff 확인 → 히어로 이미지가 WebP에서 PNG로 변경됨 (실수)
  · PNG: 1.2MB → WebP: 200KB
  · LCP 대상이 히어로 이미지 → 이미지 크기가 LCP를 직접 악화

해결: 이미지를 WebP로 복원 → LCP 2.1초로 복귀
교훈: Web Vitals를 배포별로 추적하면 성능 회귀를 즉시 감지
```

### 4.4 사례: Breadcrumb으로 재현 불가능한 에러 원인 파악

```
에러: "TypeError: Cannot set property 'quantity' of null"
     at CartItem.tsx:58

  재현 시도:
    · 개발자가 직접 장바구니 기능 사용 → 재현 안 됨
    · 특정 사용자에게만 발생 (5명)

  Sentry Breadcrumb 확인:
    1. 사용자가 /products 접속
    2. 상품 검색 실행 (keyword: "아이폰")
    3. 검색 결과 클릭 → /products/99
    4. "재고 없음" 상품에 "장바구니 추가" 클릭 (버튼이 표시됨!)
    5. → cartItem이 null인 상태에서 quantity 업데이트 시도 → 에러

  원인:
    · 재고 없는 상품은 cart에 추가되지 않아 null 반환
    · UI에서는 버튼을 비활성화해야 하지만 조건이 빠져 있었음

  수정:
    · 재고 없음 조건일 때 "장바구니 추가" 버튼 disabled 처리
    · Breadcrumb이 없었다면 재현조차 불가능했을 에러
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Sentry 기본 통합 [Applying]

**목표:** React 앱에 Sentry를 통합하여 에러를 자동 수집한다.

```
요구사항:
  · Sentry 계정 생성 (무료 티어)
  · @sentry/react 설치 및 초기화
  · Sentry.ErrorBoundary로 전역 에러 처리
  · 사용자 컨텍스트 설정 (Sentry.setUser)
  · 의도적으로 에러를 발생시켜 Sentry 대시보드에서 확인:
    - 렌더링 에러 (null.property)
    - API 에러 (Sentry.captureException)
    - 사용자 정의 이벤트 (Sentry.captureMessage)
  · Breadcrumb이 에러와 함께 수집되는지 확인
```

---

### 실습 2: Source Map + Release 추적 [Applying]

**목표:** Source Map을 Sentry에 업로드하여 원본 코드로 디버깅한다.

```
요구사항:
  · vite.config.ts에 sourcemap: true 설정
  · @sentry/vite-plugin으로 빌드 시 Source Map 업로드
  · 업로드 후 .map 파일 삭제 (보안)
  · 프로덕션 빌드 후 에러를 발생시켜:
    - Sentry에서 원본 파일명, 줄 번호가 표시되는지 확인
    - 코드 스니펫이 표시되는지 확인
  · Release 태그로 배포 버전별 에러 분류 확인
```

---

### 실습 3: Web Vitals + Analytics 수집 [Applying]

**목표:** 실 사용자 성능 데이터와 이벤트를 수집한다.

```
요구사항:
  · web-vitals 라이브러리 설치
  · LCP, INP, CLS, FCP, TTFB 수집 함수 구현
  · 수집된 데이터를 console.log 또는 Sentry로 전송
  · 페이지뷰 자동 추적 (useLocation 기반)
  · 주요 이벤트 추적:
    - 상품 조회 (product_viewed)
    - 장바구니 추가 (add_to_cart)
    - 검색 실행 (search)
  · 수집 데이터를 확인하여 "어떤 인사이트를 얻을 수 있는가" 분석
```

---

### 실습 4 (선택): 모니터링 전략 설계 [Evaluating]

**목표:** 프로젝트의 전체 모니터링 전략을 설계한다.

```
시나리오: 이커머스 앱

설계할 것:
  1. 에러 모니터링:
     · 어떤 도구? (Sentry)
     · Source Map 전략? (업로드 후 삭제)
     · 사용자 컨텍스트에 포함할 정보?
     · beforeSend에서 필터링할 민감 데이터?

  2. 성능 모니터링:
     · 추적할 지표? (LCP, INP, CLS)
     · 임계값 설정? (LCP > 2.5초 → 경고)
     · 배포별 성능 비교?

  3. 알림 규칙:
     · 심각도별 조건과 채널 정의 (Critical~Low)
     · 결제 에러 특별 규칙?

  4. 대응 프로세스:
     · 에러 발견 → 판단 → 대응 흐름도
     · 롤백 기준?
     · 포스트모템 작성 기준?

  5. 비용 추정:
     · Sentry 예상 월 에러/트랜잭션 수
     · 무료 티어로 충분한가?
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 41 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Sentry = React 프로덕션 에러 모니터링의 표준              │
│     → 에러 자동 수집, 스택 트레이스, 사용자 컨텍스트         │
│     → Error Boundary와 결합하여 렌더링 에러 자동 보고        │
│     → Breadcrumb: 에러 발생 전 사용자 행동 추적              │
│     → Release Tracking: 배포 버전별 에러 분류                │
│                                                               │
│  2. Source Map = 프로덕션 에러 디버깅의 핵심                  │
│     → minify된 코드를 원본 소스로 매핑                       │
│     → Sentry에 업로드 → 원본 파일명·줄 번호·코드 스니펫     │
│     → 보안: 업로드 후 .map 파일 삭제 (사용자 노출 방지)      │
│                                                               │
│  3. Web Vitals = 실 사용자의 성능 데이터 (RUM)                │
│     → LCP, INP, CLS를 실제 브라우저에서 수집                 │
│     → Lab Data(Lighthouse)와 Field Data(web-vitals) 모두 필요│
│     → 배포별 비교로 성능 회귀 즉시 감지                      │
│                                                               │
│  4. 로깅 = 의미 있는 것만 수준별로                            │
│     → ERROR: API 실패, 결제 에러 (반드시 로깅)               │
│     → WARN: 예상과 다른 응답, 성능 임계치 초과               │
│     → INFO: 비즈니스 이벤트 (로그인, 주문 완료)              │
│     → DEBUG: 개발 환경에서만 (프로덕션에서 console 제거)      │
│                                                               │
│  5. 알림 = 심각도별 채널과 대응 시간 정의                     │
│     → Critical: 즉시 알림 (Slack + PagerDuty)                │
│     → High: 30분 내 확인                                     │
│     → Medium: 일간 리포트                                    │
│     → Low: 주간 리포트                                       │
│                                                               │
│  6. Analytics = 사용자가 무엇을 하는가                        │
│     → 페이지뷰, 이벤트 추적, 퍼널 분석                      │
│     → 데이터 기반 의사결정의 근거                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                         | 블룸 단계  | 확인할 섹션 |
| --- | ---------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Sentry의 Error Boundary 통합이 일반 Error Boundary보다 추가로 제공하는 것은? | Understand | 3.1         |
| 2   | Source Map을 Sentry에 업로드한 후 .map 파일을 삭제하는 이유는?               | Understand | 3.2         |
| 3   | Lab Data(Lighthouse)와 Field Data(web-vitals)의 차이와 각각의 가치는?        | Analyze    | 3.3         |
| 4   | Breadcrumb이 에러 디버깅에 기여하는 방식은?                                  | Understand | 3.1         |
| 5   | 프로덕션에서 console.log를 제거해야 하는 이유와 방법은?                      | Apply      | 3.4         |
| 6   | Release Tracking이 "이 에러는 v2.3.1에서 시작됐다"를 알려주는 원리는?        | Analyze    | 3.1         |
| 7   | 에러율 5% 초과 시 취해야 하는 대응 절차는?                                   | Apply      | 3.6         |
| 8   | 소규모 팀에서 최소한의 모니터링 전략은?                                      | Evaluate   | 3.7         |

### 6.3 FAQ

**Q1. Sentry 무료 티어는 어느 정도 규모의 프로젝트까지 충분한가요?**

Sentry의 무료 Developer 플랜은 월 5,000 에러, 10,000 성능 트랜잭션을 제공한다. 일반적인 개인 프로젝트나 소규모 MVP는 무료 티어로 충분하다. DAU 수백 명 규모가 되거나 에러가 자주 발생하는 복잡한 앱은 Team 플랜($26/월)으로 업그레이드를 고려한다. 샘플링 비율을 낮춰서(프로덕션 `tracesSampleRate: 0.05`) 무료 한도 내에서 운영하는 방법도 있다.

**Q2. Source Map을 Sentry에 업로드하면 코드가 Sentry 서버에 저장되는데 보안 문제는 없나요?**

Sentry는 Source Map을 에러 스택 트레이스 표시에만 사용하고, 소스 코드 자체를 외부에 공개하지 않는다. Sentry 대시보드 접근 권한이 있는 팀원만 원본 코드 스니펫을 볼 수 있다. 보안이 매우 중요한 환경에서는 Self-hosted Sentry를 운영하거나, `beforeSend`에서 Source Map 관련 데이터를 필터링하는 방법을 사용한다.

**Q3. Core Web Vitals 점수가 Lighthouse에서는 좋은데 실제 사용자 데이터는 나쁩니다. 왜 그런가요?**

Lighthouse는 고성능 기기와 안정적인 네트워크 환경에서 실행되는 합성 테스트다. 실제 사용자는 저사양 안드로이드 폰, 3G 네트워크, 다수의 백그라운드 프로세스 등 다양한 조건에서 앱을 사용한다. 특히 INP(Interaction to Next Paint)는 무거운 JavaScript 실행 시 저사양 기기에서 크게 나빠지는 경향이 있다. Lighthouse 점수 최적화와 별개로, 저사양 기기 시뮬레이션(Chrome DevTools Performance Throttling)으로 테스트하고 번들 크기와 JavaScript 실행 시간을 줄이는 것이 Field Data를 개선하는 핵심이다.

**Q4. 에러 발생 시 사용자에게 얼마나 상세한 에러 메시지를 보여줘야 하나요?**

사용자에게는 간결하고 친절한 메시지만 보여주고, 기술적 상세는 숨겨야 한다. "예상치 못한 오류가 발생했습니다. 문제가 자동으로 보고되었습니다."처럼 사용자가 할 수 있는 행동(다시 시도, 고객 지원 연락)을 안내한다. 스택 트레이스나 에러 코드를 사용자에게 노출하면 악용 가능한 정보가 될 수 있다. 개발 환경에서는 상세 에러를 콘솔에 출력하고, 프로덕션에서는 Sentry 대시보드에서만 확인한다.

**Q5. 모든 에러를 Sentry에 보내면 너무 많은 노이즈가 생기지 않나요?**

맞다. `beforeSend` 콜백에서 필터링하는 것이 중요하다. 무시할 에러 패턴으로는: 브라우저 익스텐션이 일으키는 에러(`Script error.`), 서드파티 광고 스크립트 에러, 사용자의 네트워크 중단으로 인한 `AbortError`, 봇/크롤러의 요청 등이 있다. 또한 `tracesSampleRate`를 낮춰서 성능 트랜잭션의 샘플링 비율을 줄이면 비용과 노이즈를 동시에 줄일 수 있다.

---

## 7. 다음 단계 예고

> **Step 42. 종합 프로젝트와 로드맵 마무리** (Phase 7 마무리, 로드맵 완료)
>
> - 전체 42단계 통합 복습
> - 종합 프로젝트 설계 가이드
> - React 개발자 성장 로드맵
> - 학습 이후의 방향 (심화, 커뮤니티, 커리어)

---

## 📚 참고 자료

- [Sentry 공식 문서 — React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry — Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry — Performance Monitoring](https://docs.sentry.io/product/performance/)
- [web-vitals 라이브러리](https://github.com/GoogleChrome/web-vitals)
- [Web.dev — Core Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/analytics)
- [Google Analytics 4](https://analytics.google.com/)
- [DORA — DevOps Research](https://dora.dev/)

---

> **React 완성 로드맵 v2.0** | Phase 7 — 빌드·배포·프로덕션 | Step 41 of 42
