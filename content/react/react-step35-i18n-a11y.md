# Step 35. 국제화(i18n)와 접근성(a11y) 기초

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
> 타입 안전성, 폼 관리, 스타일링으로 프로덕션 품질을 완성한다 — **Phase 5 마무리**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Remember**   | WCAG의 4대 원칙(인식, 운용, 이해, 견고)과 시맨틱 HTML 요소를 기술할 수 있다                 |
| **Understand** | i18n 아키텍처에서 번역 키, 네임스페이스, 동적 언어 전환의 역할을 설명할 수 있다             |
| **Apply**      | react-i18next로 다국어 지원을 구현하고 동적으로 언어를 전환할 수 있다                       |
| **Apply**      | 시맨틱 HTML, ARIA 속성, 키보드 접근성을 적용하여 접근성을 갖춘 UI를 구현할 수 있다          |
| **Analyze**    | 프로젝트의 접근성 수준을 진단 도구로 측정하고 개선점을 식별할 수 있다                       |
| **Evaluate**   | Phase 5 전체를 통합하여 "타입 + 폼 + 스타일 + i18n + a11y"의 프로덕션 품질을 판단할 수 있다 |

**전제 지식:**

- Step 25: Context API (언어 설정 전역 관리)
- Step 33: 폼 접근성 (aria-invalid, aria-describedby)
- Step 34: CSS 전략, 시맨틱 마크업

---

## 1. 서론 — "모든 사용자"를 위한 앱

### 1.1 왜 i18n과 a11y를 함께 다루는가

국제화(i18n)와 접근성(a11y)은 공통점이 있다: **"더 많은 사용자가 앱을 사용할 수 있게 한다."** i18n은 언어의 벽을, a11y는 능력의 벽을 허문다. 두 기술은 모두 "특정 사용자를 위한 추가 기능"이 아니라, 처음부터 포용적(inclusive) 설계를 실천하는 방법이다.

국제화가 비즈니스 필수요소가 된 배경을 살펴보면, 영어 사용자는 전 세계 인터넷 사용자의 약 25%에 불과하다. 나머지 75%는 자신의 언어로 서비스를 원한다. 구글, 에어비앤비, 넷플릭스 같은 글로벌 서비스가 수십 가지 언어를 지원하는 이유는 단순히 친절함이 아니라, 다국어 지원이 시장 확장의 직접적 수단이기 때문이다. Unbounce의 연구에 따르면 사용자의 73%가 자신의 언어로 된 콘텐츠를 더 신뢰한다.

접근성의 필요성 역시 숫자로 명확하다. 전 세계 인구의 약 15~20%가 어떤 형태로든 장애를 가지고 있으며, 이는 약 13억 명에 해당한다. 미국의 경우 시각 장애인이 약 700만 명, 청각 장애인이 약 1,500만 명, 이동 불편 인구가 약 2,700만 명이다. 이들을 배제한 서비스는 잠재 시장의 상당 부분을 포기하는 것과 같다. 더 나아가, 접근성 개선은 장애인만이 아니라 모든 사용자에게 혜택을 준다. 자막은 청각 장애인만이 아니라 시끄러운 환경에서 영상을 보는 모든 사람에게 유용하다.

```
i18n (Internationalization — "i"와 "n" 사이에 18글자):
  · 한국어, 영어, 일본어 등 다국어 지원
  · 날짜/숫자/통화 형식의 로케일별 차이
  · RTL(아랍어 등 오른쪽→왼쪽) 레이아웃
  · 글로벌 서비스의 필수 요건

a11y (Accessibility — "a"와 "y" 사이에 11글자):
  · 시각 장애 (스크린 리더), 운동 장애 (키보드만 사용)
  · 청각 장애 (자막), 인지 장애 (단순한 UI)
  · 일시적 장애: 한 손으로만 조작, 밝은 햇빛 아래
  · 법적 요구사항 (ADA, EU Accessibility Directive, 한국 장애인차별금지법)
  · 전체 인구의 15~20%가 어떤 형태로든 장애를 가짐
```

### 1.2 i18n과 a11y의 교차점

i18n과 a11y는 독립적인 주제처럼 보이지만 실제로는 긴밀하게 연결되어 있다. 다국어 지원을 할 때 접근성을 고려하지 않으면 번역된 텍스트가 스크린 리더에서 올바르게 읽히지 않을 수 있다. 반대로 접근성을 위한 `lang` 속성 설정은 스크린 리더가 올바른 언어로 텍스트를 발음하는 데 필수적이다.

```
i18n과 a11y의 교차 영역

  언어 선언:
    <html lang="ko">  또는  <html lang="en">
    → 스크린 리더가 올바른 언어 엔진으로 발음
    → i18n에서 언어 전환 시 lang 속성도 함께 업데이트 필수!

  텍스트 방향(RTL):
    <html dir="rtl" lang="ar">
    → 아랍어, 히브리어는 오른쪽→왼쪽 레이아웃
    → 접근성 도구도 RTL을 인식해야 함

  번역된 aria-label:
    <button aria-label={t('close.button')}>×</button>
    → aria-label도 현재 언어로 번역되어야 함
    → 영어로만 고정된 aria-label은 한국어 사용자에게 혼란

  날짜/시간 접근성:
    <time datetime="2025-03-15">
      {new Intl.DateTimeFormat(locale).format(date)}
    </time>
    → datetime 속성은 기계가 읽는 형식 (ISO 8601)
    → 표시 텍스트는 로케일에 맞게 포맷팅
```

### 1.3 핵심 개념 지도

![react-step35-concept-map](/developer-open-book/diagrams/react-step35-concept-map.svg)

### 1.4 이 Step에서 다루는 범위

![react-step35-scope](/developer-open-book/diagrams/react-step35-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 i18n 핵심 용어

| 용어               | 정의                                                                          | 왜 중요한가                                                       |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **i18n**           | Internationalization. 앱을 **다국어로 사용할 수 있도록** 구조를 설계하는 것   | 번역을 추가할 수 있는 "틀"을 만드는 작업                          |
| **l10n**           | Localization. 특정 로케일에 맞게 **실제 번역과 형식을 적용**하는 것           | i18n 위에 한국어, 영어 등 실제 번역을 채우는 작업                 |
| **로케일(Locale)** | 언어 + 지역 코드. `ko-KR`, `en-US`, `ja-JP` 등                                | 같은 영어라도 미국(en-US)과 영국(en-GB)의 날짜/통화 형식이 다르다 |
| **번역 키**        | 번역 텍스트를 **식별하는 고유 문자열**. `'common.save'`, `'auth.login.title'` | 코드에 번역 텍스트를 직접 쓰지 않고 키로 참조                     |
| **네임스페이스**   | 번역 키를 **도메인별로 그룹화**. `common`, `auth`, `products` 등              | 대규모 앱에서 번역 파일을 분리하여 관리                           |
| **Intl API**       | 브라우저 내장 **국제화 API**. 날짜, 숫자, 통화를 로케일에 맞게 포맷팅         | 별도 라이브러리 없이 로케일별 포맷팅                              |

### 2.2 i18n 용어 이론적 배경

#### i18n과 l10n의 차이

i18n과 l10n은 자주 혼용되지만 명확히 구분된다. i18n은 "언제든 어떤 언어든 추가할 수 있는 구조"를 만드는 것이고, l10n은 "특정 언어와 지역의 실제 콘텐츠"를 제공하는 것이다. 좋은 i18n 아키텍처는 새로운 언어를 추가할 때 코드 변경 없이 번역 파일만 추가하면 된다. react-i18next는 이 원칙을 따른다: 새 언어를 추가하려면 `resources` 객체에 새 로케일 키와 번역 파일만 추가하면 된다.

#### 번역 키 설계가 중요한 이유

번역 키는 "국제화된 앱의 API"이다. 잘못 설계된 번역 키는 번역가와 개발자 모두를 혼란스럽게 한다. `t('btn1')`은 무슨 버튼인지 알 수 없지만, `t('checkout.order.submitButton')`은 결제 페이지의 주문 제출 버튼임을 즉시 알 수 있다. 번역 키가 의미를 담아야 번역가가 문맥 없이도 올바른 번역을 만들 수 있다.

#### Intl API — 브라우저 내장 국제화

`Intl` API는 별도 라이브러리 설치 없이 모든 현대 브라우저에서 사용 가능한 국제화 API다. 날짜/시간, 숫자, 통화, 상대적 시간, 복수형 등을 로케일에 맞게 포맷팅한다. moment.js나 date-fns 같은 라이브러리의 국제화 기능 상당 부분이 이 API로 대체 가능하다. 번들 크기를 줄이면서도 강력한 국제화를 달성할 수 있다.

### 2.3 a11y 핵심 용어

| 용어            | 정의                                                                          | 왜 중요한가                                         |
| --------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| **WCAG**        | Web Content Accessibility Guidelines. W3C의 **웹 접근성 표준**                | 법적 준수 기준이자 접근성의 사실상 표준             |
| **시맨틱 HTML** | 요소의 **의미(semantics)를 전달**하는 HTML. `<nav>`, `<main>`, `<article>` 등 | 스크린 리더가 페이지 구조를 파악하는 기반           |
| **ARIA**        | Accessible Rich Internet Applications. HTML의 의미를 **보강하는 속성** 집합   | 시맨틱 HTML만으로 부족한 경우 접근성 정보를 추가    |
| **스크린 리더** | 화면의 내용을 **음성으로 읽어주는** 보조 기술. NVDA, VoiceOver, JAWS          | 시각 장애인의 주요 웹 탐색 도구                     |
| **포커스 관리** | 키보드 사용자가 **Tab 키로 요소를 탐색**할 때의 순서와 시각적 표시            | 키보드만으로 앱의 모든 기능을 사용할 수 있어야 한다 |
| **색상 대비**   | 텍스트와 배경 사이의 **밝기 차이 비율**. WCAG AA: 최소 4.5:1                  | 저시력 사용자도 텍스트를 읽을 수 있어야 한다        |

### 2.4 a11y 용어 이론적 배경

#### WCAG의 역사와 법적 구속력

WCAG는 W3C의 WAI(Web Accessibility Initiative)가 1999년 WCAG 1.0을 발표한 이후, 2008년 WCAG 2.0, 2018년 WCAG 2.1, 2023년 WCAG 2.2로 발전해왔다. 기술 중립적이고 원칙 기반으로 설계되어 HTML, PDF, 모바일 앱 등 다양한 기술에 적용된다.

법적 구속력 측면에서 미국의 ADA(Americans with Disabilities Act)는 판례를 통해 웹사이트에도 적용되며, WCAG AA 수준이 사실상 기준이다. EU는 2019년 Web Accessibility Directive를 통해 공공 기관 웹사이트에 WCAG 2.1 AA를 의무화했고, European Accessibility Act(2025년 6월 발효)는 민간 기업의 디지털 서비스로 확장된다. 한국은 장애인차별금지법과 한국형 웹 콘텐츠 접근성 지침(KWCAG)이 있다.

#### 시맨틱 HTML이 접근성의 근본인 이유

HTML 요소는 각각 고유한 의미(semantics)를 가진다. `<button>`은 "클릭 가능한 액션"을 의미하고, `<nav>`는 "네비게이션 영역"을 의미한다. 이 의미 정보는 스크린 리더, 음성 제어 소프트웨어, 검색 엔진 크롤러 등이 페이지 구조를 이해하는 데 사용된다. `<div>`를 클릭 가능하게 만들려면 `role="button"`, `tabindex="0"`, `onKeyDown` 같은 수많은 속성을 수동으로 추가해야 하지만, `<button>`은 이 모든 것을 내장하고 있다. "올바른 요소를 사용하면 접근성이 따라온다"는 원칙이 여기서 나온다.

### 2.5 i18n 아키텍처 개념도

![react-step35-i18n-architecture](/developer-open-book/diagrams/react-step35-i18n-architecture.svg)

---

## 3. 이론과 원리 — i18n

### 3.1 react-i18next 아키텍처

#### 설정

```typescript
// src/i18n/config.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "./locales/ko.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React 통합
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    fallbackLng: "ko", // 번역이 없을 때 기본 언어
    interpolation: {
      escapeValue: false, // React가 XSS를 방지하므로 비활성화
    },
    detection: {
      order: ["localStorage", "navigator"], // 언어 감지 순서
      caches: ["localStorage"], // 선택한 언어 저장
    },
  });

export default i18n;

// main.tsx에서 import
import "./i18n/config";
```

#### 번역 파일

```json
// src/i18n/locales/ko.json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "confirm": "확인"
  },
  "auth": {
    "login": {
      "title": "로그인",
      "email": "이메일",
      "password": "비밀번호",
      "submit": "로그인",
      "forgotPassword": "비밀번호를 잊으셨나요?",
      "noAccount": "계정이 없으신가요? {{link}}",
      "error": {
        "invalidCredentials": "이메일 또는 비밀번호가 올바르지 않습니다",
        "networkError": "네트워크 오류가 발생했습니다. 다시 시도해 주세요"
      }
    }
  },
  "products": {
    "title": "상품 목록",
    "count": "총 {{count}}개의 상품",
    "addToCart": "장바구니에 추가",
    "price": "{{price, currency}}"
  }
}

// src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "An error occurred",
    "confirm": "Confirm"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?",
      "noAccount": "Don't have an account? {{link}}",
      "error": {
        "invalidCredentials": "Invalid email or password",
        "networkError": "Network error. Please try again"
      }
    }
  },
  "products": {
    "title": "Products",
    "count": "{{count}} products",
    "addToCart": "Add to Cart",
    "price": "{{price, currency}}"
  }
}
```

#### 컴포넌트에서 사용

```tsx
import { useTranslation } from "react-i18next";

function LoginForm() {
  const { t } = useTranslation();

  return (
    <form>
      <h1>{t("auth.login.title")}</h1>

      <label>{t("auth.login.email")}</label>
      <input type="email" />

      <label>{t("auth.login.password")}</label>
      <input type="password" />

      <button type="submit">{t("auth.login.submit")}</button>

      <p>{t("auth.login.forgotPassword")}</p>

      {/* 보간(Interpolation): 동적 값 삽입 */}
      <p>
        {t("auth.login.noAccount", {
          link: '<a href="/register">가입하기</a>',
        })}
      </p>

      {error && (
        <p className="error">{t("auth.login.error.invalidCredentials")}</p>
      )}
    </form>
  );
}

function ProductList({ products }) {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("products.title")}</h1>
      <p>{t("products.count", { count: products.length })}</p>
      {products.map((p) => (
        <div key={p.id}>
          <span>{p.name}</span>
          <span>{t("products.price", { price: p.price })}</span>
          <button>{t("products.addToCart")}</button>
        </div>
      ))}
    </div>
  );
}
```

#### 동적 언어 전환

```tsx
function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // localStorage에 자동 저장 (LanguageDetector 설정)
    // HTML lang 속성도 업데이트 권장
    document.documentElement.lang = lng;
  };

  return (
    <div>
      <button
        onClick={() => changeLanguage("ko")}
        className={i18n.language === "ko" ? "active" : ""}
      >
        한국어
      </button>
      <button
        onClick={() => changeLanguage("en")}
        className={i18n.language === "en" ? "active" : ""}
      >
        English
      </button>
    </div>
  );
}
```

### 3.2 날짜/숫자/통화 포맷팅 — Intl API

```typescript
// 날짜 포맷팅
const date = new Date("2025-03-15");

new Intl.DateTimeFormat("ko-KR").format(date); // "2025. 3. 15."
new Intl.DateTimeFormat("en-US").format(date); // "3/15/2025"
new Intl.DateTimeFormat("ja-JP").format(date); // "2025/3/15"

new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(date); // "2025년 3월 15일"

// 숫자 포맷팅
new Intl.NumberFormat("ko-KR").format(1234567); // "1,234,567"
new Intl.NumberFormat("de-DE").format(1234567); // "1.234.567"

// 통화 포맷팅
new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
}).format(35000); // "₩35,000"

new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(35); // "$35.00"

new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
}).format(5000); // "￥5,000"

// 상대 시간
new Intl.RelativeTimeFormat("ko", { numeric: "auto" }).format(-1, "day");
// "어제"

new Intl.RelativeTimeFormat("ko", { numeric: "auto" }).format(-3, "hour");
// "3시간 전"
```

### 3.3 번역 키 설계 원칙

```
번역 키 네이밍 컨벤션

  구조: namespace.feature.element.state

  예시:
    common.save                        → "저장"
    common.error.network               → "네트워크 오류"
    auth.login.title                   → "로그인"
    auth.login.error.invalidCredentials → "이메일 또는 비밀번호 오류"
    products.list.empty                → "상품이 없습니다"
    products.detail.addToCart          → "장바구니에 추가"

  원칙:
    1. 계층적 구조: 도트(.)로 네임스페이스 분리
    2. 일관된 패턴: title, description, label, placeholder, error 등
    3. 컨텍스트 포함: "save"보다 "common.save", "profile.save"가 명확
    4. 하드코딩된 문자열을 코드에 남기지 않는다
       ❌ <button>저장</button>
       ✅ <button>{t('common.save')}</button>
```

---

## 4. 이론과 원리 — a11y

### 4.1 WCAG 4대 원칙

```
WCAG (Web Content Accessibility Guidelines) 2.1

  1. 인식 가능 (Perceivable)
     · 모든 콘텐츠를 사용자가 인식할 수 있어야 한다
     · 이미지에 alt 텍스트, 비디오에 자막
     · 색상만으로 정보를 전달하지 않는다 (색각 이상)
     · 충분한 색상 대비 (4.5:1 이상)

  2. 운용 가능 (Operable)
     · 키보드만으로 모든 기능을 사용할 수 있어야 한다
     · 충분한 시간을 제공한다 (타임아웃 경고)
     · 깜빡이는 콘텐츠 제한 (광과민성 발작 방지)
     · 명확한 네비게이션 (현재 위치 표시)

  3. 이해 가능 (Understandable)
     · 텍스트가 읽기 쉬워야 한다 (언어 명시, 약어 설명)
     · 예측 가능한 동작 (일관된 네비게이션, 입력 도움)
     · 에러 방지와 수정 도움 (입력 검증, 확인 단계)

  4. 견고함 (Robust)
     · 다양한 사용자 도구(스크린 리더 등)에서 해석 가능
     · 표준 HTML/ARIA 사용
     · 유효한 마크업

  준수 수준:
    A   → 최소 요구사항 (필수)
    AA  → 일반적 권장 수준 (대부분의 법적 기준) ★
    AAA → 최고 수준 (특수 상황)
```

### 4.2 시맨틱 HTML — "올바른 요소를 사용하라"

```
시맨틱 HTML이 접근성의 80%를 해결한다

  ❌ div로 모든 것을 만드는 경우:
    <div class="nav">                    ← 스크린 리더: "그룹"
      <div class="link" onclick="...">   ← 스크린 리더: "그룹" (링크인지 모름!)
        홈
      </div>
    </div>

  ✅ 시맨틱 요소를 사용하는 경우:
    <nav>                                ← 스크린 리더: "네비게이션"
      <a href="/">                       ← 스크린 리더: "링크, 홈"
        홈
      </a>
    </nav>

  · 시맨틱 요소는 자체적으로 역할(role), 상태, 키보드 동작을 가진다
  · <button>은 Enter/Space로 클릭, 포커스 가능 — div에는 이것이 없다!
  · 가능하면 ARIA 대신 올바른 HTML 요소를 선택하는 것이 최선
```

```
주요 시맨틱 요소와 역할

  페이지 구조:
    <header>   → 페이지/섹션 헤더 (banner role)
    <nav>      → 네비게이션 (navigation role)
    <main>     → 주요 콘텐츠 (main role) — 페이지에 하나만!
    <aside>    → 보충 콘텐츠 (complementary role)
    <footer>   → 페이지/섹션 푸터 (contentinfo role)
    <section>  → 주제별 그룹 (region role — 제목 필요)
    <article>  → 독립적 콘텐츠 (article role)

  상호작용:
    <button>   → 클릭 가능한 액션 (Enter/Space 자동!)
    <a href>   → 네비게이션 링크 (Enter로 이동)
    <input>    → 입력 필드 (다양한 type)
    <select>   → 선택 메뉴 (화살표 키 탐색)
    <dialog>   → 모달/다이얼로그 (포커스 트랩 내장)

  콘텐츠:
    <h1>~<h6>  → 제목 계층 (스크린 리더의 문서 구조 파악)
    <p>        → 단락
    <ul>/<ol>  → 목록 (스크린 리더: "3개 항목의 목록")
    <figure>   → 이미지/차트와 캡션의 그룹
    <time>     → 날짜/시간 (datetime 속성)
```

### 4.3 ARIA — 시맨틱 HTML을 보완한다

```
ARIA의 첫 번째 규칙:
  "시맨틱 HTML로 충분하면 ARIA를 사용하지 않는다"

  ❌ <div role="button" tabindex="0" onKeyDown={...} onClick={...}>클릭</div>
  ✅ <button onClick={...}>클릭</button>

  HTML 요소가 제공하지 못하는 경우에만 ARIA를 사용:
    · 커스텀 위젯 (탭, 아코디언, 슬라이더)
    · 동적 콘텐츠 업데이트 (라이브 리전)
    · 복잡한 관계 (설명 연결)
```

```
ARIA 핵심 패턴

  역할 (role):
    role="alert"        → 중요한 메시지 (즉시 읽힘)
    role="dialog"       → 모달 대화상자
    role="tablist"      → 탭 목록
    role="tab"          → 개별 탭
    role="tabpanel"     → 탭 패널
    role="progressbar"  → 진행률 표시
    role="status"       → 상태 메시지 (완료 시 읽힘)

  상태/속성:
    aria-expanded="true|false"    → 접힘/펼침 상태 (아코디언, 드롭다운)
    aria-selected="true|false"    → 선택 상태 (탭, 리스트)
    aria-hidden="true"            → 스크린 리더에서 숨김 (장식 요소)
    aria-live="polite|assertive"  → 동적 변경 시 읽어줌 (알림)
    aria-current="page"           → 현재 페이지 (네비게이션)
    aria-busy="true"              → 로딩 중 (영역 업데이트 중)

  관계:
    aria-labelledby="id"          → 레이블 요소 연결
    aria-describedby="id"         → 설명 요소 연결 (Step 33에서 학습)
    aria-controls="id"            → 제어 대상 연결
```

#### React에서의 ARIA 적용 예시

```tsx
// 탭 컴포넌트의 접근성
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div>
      <div role="tablist" aria-label="설정 메뉴">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

// 라이브 리전 — 동적 업데이트를 스크린 리더에 알림
function NotificationArea({ message }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
      {/* message가 변경되면 스크린 리더가 새 내용을 읽어줌 */}
    </div>
  );
}
```

### 4.4 키보드 접근성

```
키보드 접근성 핵심 규칙

  1. 모든 상호작용 요소에 Tab으로 접근 가능
     · <button>, <a>, <input> → 자동으로 포커스 가능
     · 커스텀 요소 → tabIndex={0} 추가 필요

  2. Tab 순서가 시각적 순서와 일치
     · DOM 순서 = Tab 순서 (CSS로 시각적 순서를 바꿔도 Tab 순서는 DOM 기준)
     · tabIndex에 양수를 사용하지 않는다 (순서가 꼬임)

  3. 포커스가 시각적으로 보여야 한다
     · :focus-visible 스타일 필수 (Step 33 복습)
     · outline: none을 남용하지 않는다

  4. 모달/대화상자에서 포커스 트랩 (Focus Trap)
     · 모달이 열리면 포커스가 모달 안에 갇혀야 함
     · Tab으로 모달 밖으로 나가면 안 됨
     · ESC로 모달을 닫으면 트리거 요소로 포커스 복귀
```

```tsx
// 포커스 트랩 예시 (간략화)
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // 모달 열릴 때 첫 포커스 가능 요소에 포커스
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    // ESC 키로 닫기
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <h2 id="modal-title">확인</h2>
      {children}
      <button onClick={onClose}>닫기</button>
    </div>
  );
}
```

### 4.5 색상 대비와 시각적 접근성

```
WCAG AA 색상 대비 기준

  일반 텍스트: 4.5:1 이상
  큰 텍스트(18px+ bold 또는 24px+): 3:1 이상
  UI 컴포넌트/그래프: 3:1 이상

  검사 도구:
    · Chrome DevTools > Elements > Styles > 색상 피커에서 대비율 확인
    · WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
    · Lighthouse Accessibility 감사

  흔한 문제:
    · 회색 텍스트 (#999) on 흰 배경 (#fff) → 대비율 2.85:1 ❌
    · 회색 텍스트 (#595959) on 흰 배경 → 대비율 7:1 ✅
    · placeholder 텍스트의 대비 부족 (연한 회색)

  색상만으로 정보 전달 금지:
    ❌ "빨간 항목은 에러입니다" (색각 이상자가 구분 불가)
    ✅ "⚠️ 아이콘 + '에러' 텍스트 + 빨간 테두리" (중복 신호)
```

### 4.6 접근성 진단 도구

```
도구 1: axe DevTools (Chrome 확장)
  · 페이지의 접근성 문제를 자동 감지
  · 문제별 심각도(critical, serious, moderate, minor)
  · 수정 방법 제안
  · 가장 널리 사용되는 접근성 테스트 도구

도구 2: Lighthouse Accessibility
  · Chrome DevTools > Lighthouse > Accessibility
  · 0~100 점수로 접근성 수준 평가
  · WCAG 기준에 맞는 구체적 개선 제안

도구 3: eslint-plugin-jsx-a11y
  · JSX 코드의 접근성 문제를 정적 분석으로 감지
  · img에 alt 누락, button 안에 텍스트 없음 등
  · 코드 작성 시점에서 즉시 경고

진단 워크플로우:
  1. eslint-plugin-jsx-a11y로 코드 작성 시 기본 문제 방지
  2. axe DevTools로 런타임 접근성 감사
  3. Lighthouse로 종합 점수 확인
  4. 키보드만으로 앱 전체 탐색 테스트 (수동)
  5. 스크린 리더(VoiceOver/NVDA)로 핵심 흐름 테스트 (수동)
```

### 4.7 Phase 5 전체 통합 복습

```
Phase 5 (Step 31~35)에서 배운 것

  Step 31: TypeScript + React
           · Props, Hook, Event, Ref의 타입
           · Generic Component, 유틸리티 타입
           · Discriminated Union, ComponentProps

  Step 32: React Hook Form + Zod
           · Uncontrolled 기반 성능 최적화
           · Zod 스키마 = 검증 + 타입 동시
           · useFieldArray, 다단계 폼

  Step 33: 폼 UX + 접근성
           · 검증 시점 전략 (onBlur, Submit→onChange)
           · ARIA 속성 (aria-invalid, aria-describedby)
           · 자동 저장, 에러 포커스

  Step 34: CSS 전략
           · CSS Modules, Tailwind CSS, CSS-in-JS
           · 디자인 토큰, 다크 모드, 반응형
           · shadcn/ui, cn() 유틸리티

  Step 35: i18n + a11y (이 Step)
           · react-i18next, Intl API
           · WCAG 4원칙, 시맨틱 HTML, ARIA
           · 키보드 접근성, 색상 대비, 진단 도구


  Phase 5의 핵심 메시지:
    "타입으로 안전하고 (TypeScript)
     폼이 사용하기 쉽고 (RHF + 검증 UX)
     디자인이 일관되며 (Tailwind + 토큰)
     모든 사용자가 사용할 수 있는 (i18n + a11y)
     프로덕션 품질의 앱을 만든다"

  Phase 6부터는 테스트와 품질 보증으로 앱의 신뢰성을 확보한다.
```

---

## 5. 사례 연구와 예시

### 5.1 사례: i18n 적용 전후 코드 비교

i18n을 적용하지 않은 코드는 하드코딩된 텍스트로 가득하고, 다국어 지원을 추가하려면 컴포넌트 전체를 수정해야 한다. i18n을 적용한 코드는 모든 텍스트가 키로 추상화되어 번역 파일만 추가하면 새 언어를 지원할 수 있다.

```tsx
// ❌ i18n 미적용 — 다국어 추가 시 컴포넌트 수정 필요
function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>가격: {product.price.toLocaleString()}원</p>
      <p>재고: {product.stock}개 남음</p>
      <button>장바구니에 추가</button>
      {product.stock === 0 && <span style={{ color: "red" }}>품절</span>}
    </div>
  );
}

// ✅ i18n 적용 — 번역 파일만 추가하면 새 언어 지원
function ProductCard({ product }) {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>
        {t("products.price", {
          price: new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency: i18n.language === "ko" ? "KRW" : "USD",
          }).format(product.price),
        })}
      </p>
      <p>{t("products.stockRemaining", { count: product.stock })}</p>
      <button>{t("products.addToCart")}</button>
      {product.stock === 0 && (
        <span aria-label={t("products.soldOut.ariaLabel")}>
          {t("products.soldOut")}
        </span>
      )}
    </div>
  );
}
```

### 5.2 사례: aria-label의 다국어 처리

i18n 적용 시 aria-label, title, placeholder 같은 비가시적 텍스트도 번역해야 스크린 리더 사용자가 올바른 언어로 설명을 들을 수 있다.

```tsx
// ❌ aria-label이 하드코딩 — 한국어 앱에서 영어로 읽힘
function SearchBar() {
  return (
    <div>
      <input
        type="search"
        placeholder="검색어를 입력하세요"
        aria-label="Search" // 영어로 고정!
      />
      <button aria-label="Clear search">×</button>
    </div>
  );
}

// ✅ aria-label도 번역 키 사용
function SearchBar() {
  const { t } = useTranslation();
  return (
    <div role="search" aria-label={t("search.region.label")}>
      <input
        type="search"
        placeholder={t("search.input.placeholder")}
        aria-label={t("search.input.label")}
      />
      <button aria-label={t("search.clearButton.label")}>×</button>
    </div>
  );
}
// ko.json: "search.input.label": "검색어 입력"
// en.json: "search.input.label": "Search input"
```

### 5.3 사례: 날짜 표시의 i18n + a11y 통합

날짜는 로케일마다 형식이 다르고, 스크린 리더가 올바르게 읽으려면 `<time>` 요소의 `datetime` 속성이 필요하다.

```tsx
// ❌ 날짜 처리 문제: 하드코딩 + 접근성 미흡
function PostDate({ date }: { date: Date }) {
  return <span>2025년 3월 15일</span>;
}

// ✅ i18n + a11y 통합 날짜 처리
function PostDate({ date }: { date: Date }) {
  const { i18n } = useTranslation();

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  const isoDate = date.toISOString().split("T")[0]; // "2025-03-15"

  return (
    <time dateTime={isoDate}>
      {/* datetime: 기계가 읽는 ISO 형식, 텍스트: 사람이 읽는 로케일 형식 */}
      {formattedDate}
    </time>
  );
}
// 한국어: <time datetime="2025-03-15">2025년 3월 15일</time>
// 영어:   <time datetime="2025-03-15">March 15, 2025</time>
// 스크린 리더는 datetime 속성 또는 텍스트 내용을 읽음
```

### 5.4 사례: 시맨틱 HTML 리팩토링

비시맨틱 마크업을 시맨틱 HTML로 리팩토링하면 ARIA 속성 추가 없이도 스크린 리더 접근성이 크게 향상된다.

```tsx
// ❌ 비시맨틱 마크업 — 스크린 리더가 구조를 파악할 수 없음
function Dashboard() {
  return (
    <div class="page">
      <div class="top-bar">
        <div class="logo">MyApp</div>
        <div class="menu">
          <div class="menu-item" onclick="navigate('/')">
            홈
          </div>
          <div class="menu-item" onclick="navigate('/products')">
            상품
          </div>
        </div>
      </div>
      <div class="body">
        <div class="title">대시보드</div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">1,234</div>
            <div class="stat-label">총 주문</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ 시맨틱 마크업 — 구조가 명확하고 접근성 자동 향상
function Dashboard() {
  return (
    <div>
      <header>
        <a href="/" aria-label="MyApp 홈으로">
          <span aria-hidden="true">MyApp</span>
        </a>
        <nav aria-label="주 메뉴">
          <ul>
            <li>
              <a href="/" aria-current="page">
                홈
              </a>
            </li>
            <li>
              <a href="/products">상품</a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <h1>대시보드</h1>
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading">주문 통계</h2>
          <dl>
            <div>
              <dt>총 주문</dt>
              <dd>
                <strong>1,234</strong>건
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
```

### 5.5 사례: 접근성 진단 결과 개선 전후

실제 프로젝트에서 axe DevTools로 진단하면 어떤 문제가 발견되고, 어떻게 수정하는지 보여주는 사례다.

```
시나리오: 이커머스 앱 상품 목록 페이지 접근성 감사

초기 Lighthouse 점수: 58점

발견된 문제 (axe DevTools 결과):

  Critical:
  1. <img>에 alt 속성 없음 (12건)
     수정: alt={product.name} 또는 장식 이미지는 alt=""

  2. <input>에 연결된 label 없음 (검색창)
     수정: aria-label="상품 검색" 추가

  Serious:
  3. 색상 대비 부족 — 가격 텍스트 (#999 on #fff = 2.85:1)
     수정: 색상을 #595959로 변경 (대비율 7:1)

  4. 버튼에 접근 가능한 이름 없음 — <button>×</button>
     수정: <button aria-label="장바구니에서 삭제">×</button>

  Moderate:
  5. 페이지 제목(<h1>) 없음
     수정: <h1>상품 목록</h1> 추가

  6. 건너뛰기 링크(skip navigation) 없음
     수정: <a href="#main-content" className="sr-only focus:not-sr-only">
             본문 바로가기
           </a>

수정 후 Lighthouse 점수: 94점

교훈:
  · 대부분의 문제는 시맨틱 HTML과 기본 속성(alt, aria-label) 추가로 해결
  · 자동 도구는 ~30~40%의 문제만 발견 → 수동 키보드 테스트 필수
```

### 5.6 사례: 글로벌 서비스의 i18n 아키텍처 설계

대규모 앱에서 번역 파일이 커지면 관리가 어려워진다. 네임스페이스와 지연 로딩을 활용하면 성능과 유지보수성을 동시에 확보할 수 있다.

```
소규모 앱 (파일 2~3개):
  · 단일 번역 파일 (translation.json) — 단순하고 관리하기 쉬움

중규모 앱 (파일 10개 이상):
  · 네임스페이스로 분리
    locales/ko/
      ├── common.json      (저장, 취소, 삭제 등 공통 용어)
      ├── auth.json        (로그인, 회원가입 관련)
      ├── products.json    (상품 관련)
      └── checkout.json    (결제 관련)

  · 컴포넌트에서 필요한 네임스페이스만 로드
    const { t } = useTranslation(['common', 'products']);
    t('common:save')        → "저장"
    t('products:addToCart') → "장바구니에 추가"

대규모 앱 (수십만 키):
  · 백엔드에서 번역 파일 서빙 (CDN)
  · 언어 전환 시 해당 언어 파일만 동적 로드
  · 번역 관리 플랫폼 (Crowdin, Phrase) 연동
    → 번역가가 웹 인터페이스에서 직접 번역
    → GitHub PR로 번역 파일 자동 동기화
```

### 5.7 사례: prefers-reduced-motion — 모션 접근성

일부 사용자는 애니메이션이 어지럼증이나 발작을 유발할 수 있다. CSS 미디어 쿼리로 모션을 줄여달라는 사용자 설정을 존중할 수 있다.

```css
/* 기본: 애니메이션 있음 */
.card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* prefers-reduced-motion: 모션 감소 설정 시 애니메이션 제거 */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
  .card:hover {
    transform: none;
  }
}
```

```tsx
// React에서 모션 감소 감지
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

// 사용
function AnimatedCard({ children }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reducedMotion ? {} : { y: -4 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 6. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: react-i18next로 다국어 지원 [Applying]

**목표:** 한국어/영어 동적 전환이 가능한 앱을 구현한다.

```
요구사항:
  · i18n 설정 (react-i18next + LanguageDetector)
  · 한국어(ko), 영어(en) 번역 파일 작성
  · 최소 2개 페이지의 모든 텍스트를 번역 키로 교체
  · 동적 값 보간: "총 {{count}}개의 상품"
  · 날짜/통화 포맷팅 (Intl API 활용)
  · 언어 전환 버튼 (LanguageSwitcher 컴포넌트)
  · localStorage에 선택 언어 저장
  · HTML lang 속성 동적 업데이트
```

---

### 실습 2: 시맨틱 HTML + ARIA 리팩토링 [Applying · Analyzing]

**목표:** div 기반 마크업을 시맨틱 HTML로 리팩토링한다.

```
과제:
  아래 코드의 접근성 문제를 모두 찾고 수정하라.

  <div class="header">
    <div class="logo">My App</div>
    <div class="nav">
      <div class="link" onclick="navigate('/')">홈</div>
      <div class="link" onclick="navigate('/products')">상품</div>
    </div>
  </div>
  <div class="content">
    <div class="title">상품 목록</div>
    <div class="list">
      <div class="item">
        <div class="img"><img src="product.jpg" /></div>
        <div class="name">노트북</div>
        <div class="price" style="color: red">품절</div>
        <div class="btn" onclick="addToCart()">추가</div>
      </div>
    </div>
  </div>

수정할 것:
  · 시맨틱 요소로 교체 (header, nav, main, a, button, h1 등)
  · img에 alt 속성 추가
  · "품절"을 색상 외 방법으로도 표시
  · 키보드 접근성 확보
  · ARIA 속성 추가 (필요한 경우)
```

---

### 실습 3: 접근성 진단 + 개선 [Analyzing · Evaluating]

**목표:** 진단 도구로 접근성을 측정하고 개선한다.

```
과제:
  1. 기존 프로젝트(또는 이전 실습)를 대상으로:
     · Lighthouse Accessibility 점수 측정 (초기)
     · axe DevTools로 문제 목록 추출
  2. 발견된 문제를 심각도별로 분류
  3. critical/serious 문제 모두 수정
  4. 재측정하여 점수 변화 기록

보고서:
  | 문제                | 심각도   | 해결 방법          | 상태 |
  |--------------------|---------|-------------------|------|
  | img에 alt 없음      | critical | alt 속성 추가     | ✅   |
  | 색상 대비 부족       | serious  | 텍스트 색상 변경   | ✅   |
  | button에 텍스트 없음 | serious  | aria-label 추가   | ✅   |

  점수: 초기 ___점 → 개선 후 ___점
```

---

### 실습 4 (선택): 접근성을 갖춘 모달 컴포넌트 [Applying · Creating]

**목표:** WCAG 기준을 충족하는 모달을 처음부터 구현한다.

```
요구사항:
  · role="dialog", aria-modal="true"
  · aria-labelledby로 모달 제목 연결
  · 열릴 때 모달 내 첫 요소에 포커스
  · Tab으로 모달 밖으로 나가지 않음 (포커스 트랩)
  · ESC로 모달 닫기
  · 닫힐 때 트리거 요소로 포커스 복귀
  · 모달 뒤 콘텐츠에 aria-hidden="true"
  · 애니메이션 (prefers-reduced-motion 존중)

테스트:
  · 키보드만으로 모달 열기 → 탐색 → 닫기 가능한가?
  · 스크린 리더(VoiceOver)가 "대화 상자"로 인식하는가?
  · ESC로 닫은 후 원래 버튼에 포커스가 돌아오는가?
```

---

## 7. 핵심 정리와 자가진단

### 7.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 35 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  i18n:                                                       │
│  1. react-i18next = React i18n의 표준 도구                   │
│     → 번역 키, 보간, 네임스페이스, 동적 언어 전환            │
│  2. Intl API로 날짜/숫자/통화를 로케일에 맞게 포맷팅         │
│  3. 번역 키를 계층적으로 설계한다 (namespace.feature.element) │
│  4. 하드코딩된 문자열을 코드에 남기지 않는다                  │
│  5. aria-label 등 비가시적 텍스트도 번역 키로 처리           │
│  6. 언어 전환 시 HTML lang 속성을 업데이트한다               │
│                                                               │
│  a11y:                                                       │
│  7. WCAG 4원칙: 인식/운용/이해/견고                          │
│     → AA 수준이 일반적 법적 기준                             │
│  8. 시맨틱 HTML이 접근성의 80%를 해결한다                     │
│     → div 대신 nav, main, button, a 사용                    │
│     → ARIA는 HTML이 부족할 때만 보완적으로 사용              │
│  9. 키보드 접근성은 필수이다                                  │
│     → 모든 상호작용이 키보드만으로 가능해야 한다             │
│     → 포커스 스타일 (:focus-visible) 필수                    │
│     → 모달: 포커스 트랩 + ESC 닫기 + 포커스 복귀             │
│  10. 색상만으로 정보를 전달하지 않는다                        │
│     → 아이콘 + 텍스트를 색상과 함께 사용                    │
│     → 색상 대비 4.5:1 이상 (AA)                              │
│  11. 진단 도구로 측정하고 개선한다                            │
│     → axe DevTools + Lighthouse + eslint-plugin-jsx-a11y    │
│     → 자동 도구 + 수동 키보드/스크린 리더 테스트 병행         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 자가진단 퀴즈

| #   | 질문                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------- | ---------- | ----------- |
| 1   | WCAG의 4대 원칙을 각각 한 문장으로 설명하라                           | Remember   | 4.1         |
| 2   | "시맨틱 HTML이 접근성의 80%를 해결한다"는 주장의 근거는?              | Understand | 4.2         |
| 3   | ARIA의 "첫 번째 규칙"이 "HTML로 충분하면 ARIA를 쓰지 말라"인 이유는?  | Understand | 4.3         |
| 4   | react-i18next에서 t('products.count', { count: 5 })의 동작을 설명하라 | Apply      | 3.1         |
| 5   | Intl.NumberFormat으로 통화를 포맷팅할 때 로케일에 따라 달라지는 것은? | Apply      | 3.2         |
| 6   | 모달의 "포커스 트랩"이 필요한 이유와 구현 방법은?                     | Apply      | 4.4         |
| 7   | 색상 대비 4.5:1이 필요한 이유와 확인 방법은?                          | Analyze    | 4.5         |
| 8   | axe DevTools, Lighthouse, eslint-plugin-jsx-a11y의 역할 차이는?       | Evaluate   | 4.6         |

### 7.3 자주 묻는 질문 (FAQ)

**Q1: react-i18next와 react-intl 중 어느 것을 선택해야 하나요?**

A: 대부분의 새 프로젝트에는 react-i18next를 권장합니다. 설정이 간단하고 생태계가 크며, Next.js와의 통합도 잘 지원됩니다. react-intl(Format.js)은 ICU 메시지 형식을 지원하여 복잡한 복수형, 날짜/숫자 포맷팅에 강점이 있지만 초기 설정이 복잡합니다. 간단한 다국어 지원에는 react-i18next, 복잡한 로케일 처리가 필요한 대규모 앱에는 react-intl을 고려하세요.

**Q2: 스크린 리더 테스트 없이 axe DevTools만으로 충분한가요?**

A: 아닙니다. axe DevTools는 자동화된 규칙 기반 검사이므로 전체 접근성 문제의 30~40%만 발견합니다. 실제 스크린 리더(macOS VoiceOver, Windows NVDA) 테스트에서만 발견되는 문제들이 있습니다. 예를 들어, 동적 콘텐츠 업데이트가 스크린 리더에서 올바르게 발표되는지, 포커스 관리가 논리적인지는 실제 테스트가 필요합니다. 최소한 핵심 사용자 흐름(로그인, 결제 등)은 스크린 리더로 직접 테스트하세요.

**Q3: 기존 한국어 전용 서비스에 i18n을 나중에 추가하는 것이 어렵나요?**

A: 나중에 추가하면 모든 컴포넌트의 하드코딩된 텍스트를 번역 키로 교체하는 작업이 필요해 상당한 비용이 발생합니다. i18next-scanner 같은 도구로 자동으로 번역 키를 추출할 수 있지만, 문맥에 맞는 키 이름을 자동으로 지정할 수는 없습니다. 글로벌 진출 가능성이 조금이라도 있다면 처음부터 i18n 구조로 개발하는 것이 훨씬 효율적입니다.

**Q4: prefers-reduced-motion을 항상 존중해야 하나요?**

A: WCAG 2.3.3(AA) 기준에 따르면, 5초 이상 지속되고 깜빡이거나 번쩍이는 콘텐츠는 반드시 제어 수단을 제공해야 합니다. prefers-reduced-motion 미디어 쿼리를 존중하는 것은 이 기준을 만족하는 가장 간단한 방법입니다. 로딩 스피너, 진행 표시줄 같은 기능적 애니메이션은 유지하되, 장식적 애니메이션과 자동 재생 전환 효과는 모션 감소 설정을 존중하세요.

---

## 8. 다음 단계 예고

> **Phase 6 — 테스트와 품질 보증 (Step 36~38)**
>
> **Step 36. 컴포넌트 테스트 (React Testing Library)**
>
> - 테스트의 가치와 테스트 피라미드
> - React Testing Library의 철학: "사용자처럼 테스트한다"
> - 컴포넌트 렌더링, 이벤트, 비동기 테스트
> - Hook 테스트 (renderHook)
> - MSW로 API 모킹
>
> Phase 5에서 완성한 프로덕션 품질 위에,
> 이제 **테스트와 품질 보증**으로 앱의 신뢰성을 확보한다.

---

## 📚 참고 자료

- [react-i18next 공식 문서](https://react.i18next.com/)
- [i18next 공식 문서](https://www.i18next.com/)
- [MDN — Intl](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [WCAG 2.1 (W3C)](https://www.w3.org/TR/WCAG21/)
- [Web.dev — Accessibility](https://web.dev/learn/accessibility)
- [MDN — ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [A11y Project — Checklist](https://www.a11yproject.com/checklist/)
- [axe DevTools](https://www.deque.com/axe/)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

---

> **React 완성 로드맵 v2.0** | Phase 5 — 타입 안전성·폼·스타일링 | Step 35 of 42 | **Phase 5 완료**
