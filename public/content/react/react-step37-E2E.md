# Step 37. E2E 테스트와 테스트 전략

> **Phase 6 — 테스트와 품질 보증 (Step 36~38)**
> 테스트와 품질 보증으로 앱의 신뢰성을 확보한다

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| **Remember**   | E2E 테스트의 정의와 Playwright/Cypress의 핵심 API를 기술할 수 있다               |
| **Understand** | 컴포넌트 테스트, 통합 테스트, E2E 테스트의 역할 차이를 설명할 수 있다            |
| **Apply**      | Playwright로 핵심 사용자 흐름(Critical User Journey)을 테스트할 수 있다          |
| **Analyze**    | 테스트 종류별 비용·신뢰도·속도의 트레이드오프를 분석할 수 있다                   |
| **Evaluate**   | 프로젝트 규모에 맞는 테스트 전략(무엇을, 어떤 수준으로, 얼마나)을 설계할 수 있다 |

**전제 지식:**

- Step 36: RTL, MSW, 컴포넌트 테스트, "사용자처럼 테스트"

---

## 1. 서론 — 컴포넌트 테스트만으로 충분한가

### 1.1 소프트웨어 품질 보증의 역사적 배경

소프트웨어 테스트의 역사는 1950년대 초기 컴퓨터 프로그램으로 거슬러 올라간다. 초창기에는 단순히 "코드가 실행되는가"를 확인하는 수준이었으나, 시스템이 복잡해지면서 테스트 전략도 함께 진화했다. 1970년대에는 단위 테스트(Unit Test)의 개념이 체계화되었고, 이후 통합 테스트, 시스템 테스트, 인수 테스트의 계층 구조가 등장했다.

웹 애플리케이션의 복잡도가 급격히 증가한 2000년대 이후, 브라우저 기반 자동화 테스트 도구들이 등장했다. Selenium이 2004년 등장하며 브라우저를 자동으로 조작하는 E2E(End-to-End) 테스트의 기틀을 마련했다. 이후 Cypress(2017), Playwright(2020)로 이어지는 현대적인 E2E 프레임워크들은 개발자 경험(DX)과 안정성을 획기적으로 개선했다. 오늘날 E2E 테스트는 CI/CD 파이프라인의 핵심 구성 요소로 자리 잡았다.

테스트 자동화의 산업적 가치는 수치로도 입증된다. IBM 연구에 따르면 버그를 프로덕션에서 발견하는 비용은 설계 단계에서 발견하는 것보다 최대 100배 높다. E2E 테스트는 이 비용 곡선을 극적으로 낮추는 핵심 도구다.

### 1.2 E2E 테스트의 산업적 가치

현대 소프트웨어 산업에서 E2E 테스트는 단순한 "버그 검출 도구"를 넘어 비즈니스 리스크 관리 수단으로 인식된다. 이커머스 플랫폼에서 결제 흐름이 1시간 중단되면 수백만 원에서 수억 원의 매출 손실이 발생한다. 금융 서비스에서 로그인 흐름이 깨지면 고객 신뢰를 잃고 규제 위반 문제로 이어질 수 있다.

E2E 테스트는 이러한 "핵심 비즈니스 흐름"이 실제 사용자 환경에서 끝까지 동작함을 자동으로 검증한다. 이는 개발팀이 배포에 대한 두려움 없이 빠르게 반복(iteration)할 수 있는 심리적 안전망을 제공한다. Netflix, Airbnb, Stripe 등 세계적인 소프트웨어 기업들은 광범위한 E2E 테스트 스위트를 갖추고 있으며, 이를 통해 하루에도 수백 번의 배포를 안전하게 수행한다.

테스트 피라미드(Test Pyramid) 모델에서 E2E 테스트는 꼭대기에 위치한다. 수가 적고 비용이 높지만, 전체 시스템이 함께 동작하는지 검증하는 고유한 역할을 담당한다. 단위 테스트가 부품을 검사하고 통합 테스트가 조립을 검사한다면, E2E 테스트는 완성된 제품이 실제로 사용 가능한지 검증하는 최종 관문이다.

### 1.3 E2E 테스트 생태계 개념 지도

![react-step37-e2e-overview](/developer-open-book/diagrams/react-step37-e2e-overview.svg)

### 1.4 컴포넌트 테스트의 한계

Step 36에서 RTL로 개별 컴포넌트와 통합을 테스트했다. 그러나 **실제 사용자가 경험하는 "흐름 전체"**는 컴포넌트 테스트만으로 보장할 수 없다.

```
컴포넌트 테스트가 통과해도 실패할 수 있는 것:

  · LoginForm 테스트 통과 ✅
  · Dashboard 테스트 통과 ✅
  · 하지만: "로그인 → 대시보드로 이동" 흐름이 깨져있다! ❌
    (라우팅 설정 오류, 인증 토큰 전달 실패 등)

  · ProductList 테스트 통과 ✅
  · CartSummary 테스트 통과 ✅
  · 하지만: "상품 추가 → 장바구니 → 결제" 흐름이 깨져있다! ❌
    (Store 연동 오류, 페이지 간 데이터 전달 실패 등)

  컴포넌트 테스트 = "부품이 각각 잘 동작하는가"
  E2E 테스트 = "조립된 자동차가 실제로 달리는가" ★
```

### 1.5 E2E 테스트의 역할

```
E2E (End-to-End) 테스트:
  · 실제 브라우저에서 전체 앱을 실행
  · 사용자의 "흐름 전체"를 시뮬레이션
  · 프론트엔드 + 백엔드 + DB 전체 스택 검증 (또는 모킹)
  · 가장 높은 신뢰도, 가장 느린 속도, 가장 높은 비용

언제 E2E 테스트가 필요한가:
  · 핵심 비즈니스 흐름 (로그인, 결제, 회원가입)
  · 여러 페이지를 오가는 네비게이션 흐름
  · 인증/권한 기반 접근 제어
  · 배포 전 최종 안전망 (CI/CD에서 실행)
```

### 1.6 이 Step에서 다루는 범위

![react-step37-scope](/developer-open-book/diagrams/react-step37-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                  | 정의                                                                                       | 왜 중요한가                                     |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **E2E 테스트**        | 실제 브라우저에서 **사용자의 전체 흐름을 시뮬레이션**하는 테스트                           | 가장 현실에 가까운 테스트. 배포 전 최종 안전망  |
| **Playwright**        | Microsoft가 만든 **크로스 브라우저 E2E 테스트 프레임워크**. Chromium, Firefox, WebKit 지원 | 가장 빠르고 안정적인 E2E 도구 (2024~ 주류)      |
| **Cypress**           | **브라우저 내에서 실행**되는 E2E 테스트 프레임워크. 직관적 DX                              | Playwright 이전의 주류. 여전히 널리 사용        |
| **CUJ**               | Critical User Journey. 앱의 **핵심 비즈니스 흐름**. 이것이 깨지면 앱이 "사용 불가"         | E2E 테스트의 우선 대상. 모든 흐름이 아닌 핵심만 |
| **Page Object Model** | E2E 테스트에서 **페이지별 상호작용을 클래스로 캡슐화**하는 패턴                            | 테스트 유지보수성 향상. UI 변경 시 한 곳만 수정 |
| **Flaky Test**        | 같은 코드에서 **때로는 통과, 때로는 실패**하는 불안정한 테스트                             | E2E 테스트의 가장 큰 적. 신뢰를 무너뜨린다      |
| **Test Fixture**      | 테스트 실행 전에 **필요한 상태를 준비**하는 설정. 사용자 생성, 데이터 시딩 등              | 테스트의 독립성과 재현 가능성을 보장            |

### 2.2 E2E vs 컴포넌트 테스트 — 개념적 차이

컴포넌트 테스트와 E2E 테스트는 서로 다른 "계층의 결함"을 잡는다. 이 차이를 이해하는 것이 효과적인 테스트 전략의 출발점이다.

컴포넌트 테스트는 **"부품 수준"의 정확성**을 검증한다. LoginForm이 올바른 입력값을 받아 제출 이벤트를 발생시키는지, ProductCard가 가격을 올바르게 표시하는지를 확인한다. 이 테스트는 jsdom이라는 가상 환경에서 실행되므로 실제 브라우저의 렌더링, 네비게이션, 네트워크 요청은 시뮬레이션하거나 모킹된다.

E2E 테스트는 **"시스템 수준"의 정확성**을 검증한다. 로그인 폼에 이메일과 비밀번호를 입력하고 제출 버튼을 클릭했을 때, 실제 브라우저에서 실제 네트워크 요청이 발생하고, 인증 토큰이 올바르게 저장되고, 대시보드 페이지로 라우팅되어 사용자 이름이 표시되는 전체 흐름을 검증한다.

두 접근 방식은 경쟁 관계가 아니라 상호 보완적이다. 컴포넌트 테스트로 빠르게 대부분의 경우를 커버하고, E2E 테스트로 "시스템이 함께 동작하는가"를 확인하는 계층적 전략이 효과적이다.

### 2.3 Playwright의 핵심 설계 철학

Playwright가 Selenium이나 초기 Cypress 대비 혁신적인 이유는 단순히 "빠름"이 아니다. Playwright의 핵심 설계 철학은 **"자동 대기(Auto-wait)"** 와 **"접근성 기반 쿼리(Accessibility-based Locators)"** 에 있다.

자동 대기 철학은 E2E 테스트의 가장 큰 골칫거리인 Flaky 테스트 문제를 근본적으로 해결한다. 전통적인 E2E 도구에서는 개발자가 `sleep(3000)` 같은 하드코딩된 대기를 삽입해야 했다. Playwright는 요소를 클릭할 때 그 요소가 실제로 visible하고 stable하며 enabled 상태가 될 때까지 자동으로 기다린다. 이는 타이밍 문제로 인한 Flaky 테스트를 대폭 줄인다.

접근성 기반 쿼리 철학은 테스트가 사용자의 실제 경험을 반영하도록 유도한다. `page.click('.btn-primary')` 대신 `page.getByRole('button', { name: '저장' })`을 사용하면, UI 리팩토링 시 CSS 클래스가 변경되더라도 테스트가 깨지지 않는다. 이는 RTL의 "사용자처럼 테스트한다" 철학과 일치한다.

### 2.4 테스트 종류별 비교

![react-step37-test-comparison](/developer-open-book/diagrams/react-step37-test-comparison.svg)

### 2.5 CUJ(Critical User Journey)의 개념과 중요성

CUJ는 단순한 테스트 대상 목록이 아니다. 이는 제품 팀이 "우리 앱에서 절대로 깨져서는 안 되는 것"을 명시적으로 합의한 문서다.

CUJ 개념은 Google의 SRE(Site Reliability Engineering) 문화에서 비롯되었다. Google은 사용자가 제품에서 달성하려는 핵심 목표를 "Journey"로 정의하고, 이 여정이 끊기지 않도록 보장하는 것을 신뢰성의 핵심 지표로 삼는다. 이 개념이 테스트 전략에 적용되면서 "모든 것을 테스트"하는 비효율적 접근 대신 "핵심 흐름을 집중적으로 보호"하는 전략으로 진화했다.

효과적인 CUJ 식별은 기술적 판단만이 아니라 비즈니스 이해를 요구한다. 개발팀, 제품 매니저, 비즈니스 분석가가 함께 "이것이 깨지면 어떤 비즈니스 피해가 발생하는가"를 기준으로 우선순위를 정해야 한다. 이 협업 과정 자체가 팀의 공통된 제품 이해를 높이는 부수 효과를 가져온다.

---

## 3. 이론과 원리

### 3.1 Playwright 기본 사용법

#### 설정

```bash
# 설치
npm init playwright@latest

# 생성되는 파일:
# playwright.config.ts — 설정
# tests/ — 테스트 파일 디렉토리
# tests/example.spec.ts — 예제 테스트
```

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000, // 테스트당 최대 30초
  retries: 2, // 실패 시 2회 재시도 (Flaky 방지)
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure", // 실패 시 스크린샷 저장
    trace: "on-first-retry", // 재시도 시 트레이스 기록
  },
  webServer: {
    command: "npm run dev", // 테스트 전 개발 서버 자동 시작
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
```

#### 기본 테스트 작성

```typescript
// e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test("홈 페이지가 올바르게 표시된다", async ({ page }) => {
  // 페이지 이동
  await page.goto("/");

  // 제목 확인
  await expect(page).toHaveTitle(/My App/);

  // 요소 확인 — RTL과 유사한 접근성 기반 쿼리
  await expect(page.getByRole("heading", { name: "환영합니다" })).toBeVisible();
  await expect(page.getByRole("link", { name: "상품 보기" })).toBeVisible();
});

test("네비게이션이 동작한다", async ({ page }) => {
  await page.goto("/");

  // 링크 클릭
  await page.getByRole("link", { name: "상품" }).click();

  // URL 변경 확인
  await expect(page).toHaveURL("/products");

  // 상품 목록 표시 확인
  await expect(page.getByRole("heading", { name: "상품 목록" })).toBeVisible();
});
```

### 3.2 Critical User Journey(CUJ) 테스트

#### CUJ 식별

```
CUJ = "이것이 깨지면 앱이 사용 불가능한 핵심 흐름"

  이커머스 앱의 CUJ:
    1. 회원가입 → 로그인 → 프로필 확인
    2. 상품 검색 → 상품 상세 → 장바구니 추가 → 결제
    3. 로그인 → 주문 내역 확인
    4. 비로그인 상태에서 보호된 페이지 접근 → 로그인으로 리다이렉트

  SaaS 앱의 CUJ:
    1. 회원가입 → 온보딩 → 대시보드
    2. 프로젝트 생성 → 항목 추가 → 편집 → 삭제
    3. 팀 초대 → 권한 설정

  선정 기준:
    · 매출에 직접 영향을 주는 흐름 (결제!)
    · 사용자의 첫 경험 (가입, 온보딩)
    · 가장 많이 사용되는 흐름
    · 깨지면 고객 지원 문의가 폭주하는 흐름

  원칙: "모든 흐름을 E2E로 테스트하지 않는다"
        핵심 5~10개의 CUJ만 E2E로, 나머지는 통합 테스트로
```

#### CUJ 테스트 구현 — 로그인 → 대시보드

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("인증 흐름", () => {
  test("로그인 후 대시보드에 접근할 수 있다", async ({ page }) => {
    // 1. 로그인 페이지 이동
    await page.goto("/login");

    // 2. 이메일 입력
    await page.getByLabel("이메일").fill("user@example.com");

    // 3. 비밀번호 입력
    await page.getByLabel("비밀번호").fill("password123");

    // 4. 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 5. 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL("/dashboard");

    // 6. 사용자 이름이 표시되는지 확인
    await expect(page.getByText("홍길동님 환영합니다")).toBeVisible();
  });

  test("잘못된 비밀번호로 로그인하면 에러가 표시된다", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("이메일").fill("user@example.com");
    await page.getByLabel("비밀번호").fill("wrong");
    await page.getByRole("button", { name: "로그인" }).click();

    // 에러 메시지 확인
    await expect(
      page.getByText("이메일 또는 비밀번호가 올바르지 않습니다"),
    ).toBeVisible();

    // 여전히 로그인 페이지인지 확인
    await expect(page).toHaveURL("/login");
  });

  test("비로그인 상태로 대시보드 접근 시 로그인으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });
});
```

#### CUJ 테스트 구현 — 상품 검색 → 장바구니 → 결제

```typescript
// e2e/purchase.spec.ts
test.describe("구매 흐름", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태 설정 (매 테스트마다)
    await page.goto("/login");
    await page.getByLabel("이메일").fill("user@example.com");
    await page.getByLabel("비밀번호").fill("password123");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("상품 검색 → 상세 → 장바구니 추가 → 결제 진행", async ({ page }) => {
    // 1. 상품 목록으로 이동
    await page.getByRole("link", { name: "상품" }).click();
    await expect(page).toHaveURL("/products");

    // 2. 검색
    await page.getByPlaceholder("검색...").fill("노트북");
    await page.getByRole("button", { name: "검색" }).click();

    // 3. 검색 결과에서 상품 클릭
    await page
      .getByRole("link", { name: /노트북/ })
      .first()
      .click();

    // 4. 상품 상세 페이지 확인
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "노트북",
    );

    // 5. 장바구니에 추가
    await page.getByRole("button", { name: "장바구니에 추가" }).click();

    // 6. 장바구니 아이콘의 수량 확인
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    // 7. 장바구니 페이지로 이동
    await page.getByRole("link", { name: "장바구니" }).click();
    await expect(page).toHaveURL("/cart");

    // 8. 장바구니에 상품이 있는지 확인
    await expect(page.getByText(/노트북/)).toBeVisible();

    // 9. 결제 진행
    await page.getByRole("button", { name: "결제하기" }).click();
    await expect(page).toHaveURL("/checkout");
  });
});
```

### 3.3 Page Object Model — 테스트 유지보수성

Page Object Model(POM)은 1990년대 후반 GUI 테스트 분야에서 등장한 설계 패턴이다. 웹 테스트에서는 Martin Fowler가 "Test Data Builders" 개념과 함께 체계화했으며, 현재는 E2E 테스트의 표준 패턴으로 자리잡았다.

POM의 핵심 원칙은 "페이지의 내부 구조를 테스트 코드로부터 분리"하는 것이다. 이는 객체지향 설계의 캡슐화 원칙을 테스트 코드에 적용한 것이다. UI가 변경될 때 POM 클래스 하나만 수정하면 그 페이지를 사용하는 모든 테스트가 자동으로 수정되는 효과를 얻는다.

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("이메일");
    this.passwordInput = page.getByLabel("비밀번호");
    this.submitButton = page.getByRole("button", { name: "로그인" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL("/dashboard");
  }
}

// e2e/pages/ProductsPage.ts
export class ProductsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/products");
  }

  async search(query: string) {
    await this.page.getByPlaceholder("검색...").fill(query);
    await this.page.getByRole("button", { name: "검색" }).click();
  }

  async clickProduct(name: string) {
    await this.page
      .getByRole("link", { name: new RegExp(name) })
      .first()
      .click();
  }
}

// 테스트에서 사용 — 깔끔하고 유지보수 용이
test("로그인 → 상품 검색", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");
  await loginPage.expectRedirectToDashboard();

  await productsPage.goto();
  await productsPage.search("노트북");
  await productsPage.clickProduct("노트북");
});
```

```
Page Object Model의 이점

  UI가 변경되면:
    · POM 없이: 10개 테스트 파일에서 selector 수정
    · POM 사용: LoginPage 클래스만 수정 → 10개 테스트 자동 반영 ★

  테스트가 읽기 쉬워진다:
    · Before: await page.getByLabel('이메일').fill('...');
    · After:  await loginPage.login('user@example.com', 'password123');
    → 의도가 명확하게 드러남
```

### 3.4 Flaky 테스트 방지 전략

```
Flaky Test = 같은 코드에서 때로는 통과, 때로는 실패

  원인과 해결:

  1. 타이밍 문제 (가장 흔함)
     ❌ await page.click('.button'); // 아직 로드되지 않았을 수 있음
     ✅ await page.getByRole('button', { name: '저장' }).click();
     // Playwright의 자동 대기(auto-wait): 요소가 나타날 때까지 기다림 ★

  2. 하드코딩된 대기 시간
     ❌ await page.waitForTimeout(3000); // 3초 대기 — Flaky의 주범!
     ✅ await expect(page.getByText('완료')).toBeVisible();
     // 조건 기반 대기: 실제로 필요한 것이 나타날 때까지

  3. 테스트 간 상태 공유
     ❌ 테스트 A가 만든 데이터를 테스트 B가 사용
     ✅ 각 테스트가 독립적으로 필요한 데이터를 설정

  4. 네트워크 불안정
     ❌ 실제 외부 API에 의존
     ✅ 테스트 환경에서 API를 모킹하거나 로컬 서버 사용

  5. 애니메이션/전환
     ❌ 애니메이션 중간에 요소를 클릭
     ✅ 테스트 환경에서 애니메이션 비활성화
         // playwright.config.ts
         use: { actionability: 'strict' }

  Playwright의 자동 대기:
    · click(): 요소가 visible, stable, enabled될 때까지 자동 대기
    · fill(): 요소가 editable될 때까지 자동 대기
    · expect().toBeVisible(): 조건이 만족될 때까지 자동 재시도 (timeout)
    → 대부분의 타이밍 문제를 자동으로 해결! ★
```

### 3.5 CI/CD에서의 테스트 자동화

```
테스트 자동화 파이프라인

  코드 Push → CI 시작
    │
    ├── 1. 린트 (ESLint) — 수 초
    │
    ├── 2. 타입 체크 (TypeScript) — 수 초
    │
    ├── 3. 단위 + 통합 테스트 (Vitest + RTL) — 수 초~수 분
    │      · 가장 빠름, 가장 먼저 실행
    │      · 실패하면 여기서 바로 중단 (빠른 피드백)
    │
    ├── 4. E2E 테스트 (Playwright) — 수 분
    │      · 단위 테스트 통과 후에만 실행
    │      · CUJ만 실행 (전체 흐름 5~10개)
    │      · 병렬 실행으로 시간 단축
    │
    └── 5. 배포 — 모든 테스트 통과 시에만!


GitHub Actions 예시:

  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
        - run: npm ci
        - run: npm run lint
        - run: npm run typecheck
        - run: npm run test          # Vitest + RTL
        - run: npx playwright install
        - run: npm run test:e2e      # Playwright
```

### 3.6 Playwright vs Cypress 비교

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │  Playwright       │  Cypress          │
├──────────────────┼──────────────────┼──────────────────┤
│  개발사          │  Microsoft        │  Cypress.io       │
│  브라우저 지원   │  Chromium+Firefox │  Chromium(주력)   │
│                  │  +WebKit ★       │  +Firefox+Edge    │
│  실행 방식       │  브라우저 외부    │  브라우저 내부    │
│  병렬 실행       │  내장 ★          │  유료 (Dashboard) │
│  속도            │  빠름 ★          │  보통             │
│  API 모킹        │  route()         │  intercept() ★   │
│  디버깅          │  Trace Viewer ★  │  Time Travel ★   │
│  모바일          │  에뮬레이션 ★    │  제한적           │
│  CI 설정         │  간단            │  간단             │
│  커뮤니티        │  빠르게 성장 ★   │  크고 성숙        │
│  TypeScript      │  네이티브 ★      │  지원             │
│  컴포넌트 테스트 │  실험적          │  지원             │
├──────────────────┼──────────────────┼──────────────────┤
│  적합한 경우     │  크로스 브라우저  │  Cypress 경험 있음│
│                  │  빠른 CI 필요    │  직관적 DX 선호  │
│                  │  새 프로젝트 ★   │  기존 프로젝트    │
└──────────────────┴──────────────────┴──────────────────┘

현재 트렌드 (2024~):
  · Playwright가 빠르게 Cypress를 추월하는 추세
  · 크로스 브라우저, 병렬 실행, 속도에서 Playwright 우위
  · 새 프로젝트 → Playwright 권장
  · Cypress 경험이 있는 팀 → Cypress 계속 사용해도 무방
```

### 3.7 프로젝트 규모별 테스트 전략

```
소규모 (1~2명, MVP/프로토타입):
  ──────────────────────────────
  · 컴포넌트 테스트: 핵심 비즈니스 로직만 (10~20개)
  · E2E: CUJ 1~2개만 (로그인, 핵심 흐름)
  · 총 테스트: 20~30개
  · 원칙: "테스트가 없는 것보다 조금이라도 있는 게 낫다"


중규모 (3~5명, 프로덕션 앱):
  ──────────────────────────────
  · 컴포넌트 테스트: 모든 핵심 컴포넌트 + Hook (50~100개)
  · MSW: API 의존 컴포넌트 모킹
  · E2E: CUJ 5~10개 (인증, 핵심 흐름, 결제)
  · CI/CD: PR마다 자동 실행
  · 총 테스트: 100~200개
  · 원칙: "핵심 흐름이 깨지지 않음을 보장"


대규모 (5명+, 엔터프라이즈):
  ──────────────────────────────
  · 컴포넌트 테스트: 높은 커버리지 (200개+)
  · E2E: CUJ 10~20개 + 크로스 브라우저
  · 시각적 회귀 테스트: Chromatic/Percy
  · 성능 테스트: Lighthouse CI
  · 접근성 테스트: axe 자동화
  · CI/CD: 전체 자동화 + 배포 게이트
  · 총 테스트: 500개+
  · 원칙: "모든 변경이 자동으로 검증됨"
```

### 3.8 테스트 유지보수 전략

```
테스트도 코드다 — 유지보수가 필요하다

  1. 깨진 테스트는 즉시 수정한다
     · "나중에 고치자" → 깨진 테스트가 쌓이면 모든 테스트를 무시하게 됨
     · CI에서 테스트 실패 = 배포 차단 (강제 수정 동기)

  2. Flaky 테스트를 방치하지 않는다
     · Flaky → 원인 분석 → 수정 또는 삭제
     · Flaky가 쌓이면 "테스트 결과를 신뢰할 수 없다" → 테스트 무용화

  3. 테스트 속도를 관리한다
     · 전체 테스트가 10분 이상 걸리면 개발 속도 저하
     · 병렬 실행, 필요한 테스트만 실행 (affected only)
     · E2E는 야간 빌드에서 전체 실행, PR에서는 핵심만

  4. 테스트 코드도 리팩토링한다
     · 중복 코드 → 헬퍼 함수, Page Object로 추출
     · 가독성 유지 → describe/it 구조 정리
     · 불필요한 테스트 삭제 (중복, 의미 없는 테스트)

  5. 새 기능은 테스트와 함께 개발한다
     · "기능 완료 → 테스트 추가" ❌ (잊혀짐)
     · "기능과 테스트를 함께 PR" ✅ (코드 리뷰에서 검증)
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 컴포넌트 테스트로 잡지 못한 버그

```
시나리오:
  · LoginForm 테스트: 이메일/비밀번호 입력 + 제출 → ✅ 통과
  · Dashboard 테스트: 사용자 이름 표시 → ✅ 통과
  · 하지만: 로그인 후 토큰을 localStorage에 저장하는 코드에서
    오타가 있어서 'accessToken'이 아닌 'acessToken'으로 저장
  · Dashboard의 API 호출 시 토큰을 찾지 못해 401 에러!
  · 컴포넌트 테스트는 MSW로 API를 모킹했기 때문에 이 문제를 모름

  E2E 테스트였다면:
    "로그인 → 대시보드 접근" 전체 흐름을 실제로 실행
    → 토큰 저장/읽기 과정에서 에러 발견!
    → "대시보드에 사용자 이름이 표시된다" 단계에서 실패

  교훈: 컴포넌트 테스트와 E2E 테스트는 "다른 종류의 버그"를 잡는다
```

### 4.2 사례: E2E 테스트 수를 줄이는 전략

```
❌ 나쁜 전략: "모든 것을 E2E로"
  · 전체 100개 테스트가 E2E
  · CI 실행 시간: 30분
  · Flaky 발생: 10개 테스트가 불안정
  · 유지보수 비용: 매우 높음

✅ 좋은 전략: "피라미드를 존중"
  · RTL 통합 테스트: 80개 (빠르고 안정적)
    · 개별 페이지의 동작, 폼 검증, API 응답 처리
  · E2E: 10개 CUJ만 (느리지만 높은 신뢰)
    · 로그인 흐름
    · 가입 흐름
    · 구매 흐름 (검색 → 장바구니 → 결제)
    · 권한 기반 접근 제어
  · CI 실행 시간: 5분
  · Flaky: 거의 없음 (E2E가 적으므로)
```

### 4.3 사례: CI/CD 파이프라인에서의 테스트 단계

```
실전 CI 파이프라인 (GitHub Actions):

  PR 생성 시:
    1. Lint (10초) → 실패하면 중단
    2. Type Check (15초) → 실패하면 중단
    3. Unit + Integration (30초) → 실패하면 중단
    4. E2E — CUJ 핵심 3개만 (2분) → 실패하면 중단
    → 총 약 3분 → 빠른 피드백

  main 브랜치 머지 시:
    1~3. 동일
    4. E2E — 전체 CUJ 10개 (5분)
    5. E2E — 크로스 브라우저 (Chromium + Firefox)
    6. Lighthouse Performance 체크
    → 총 약 10분

  야간 빌드:
    · 전체 테스트 + 시각적 회귀 + 접근성 감사
    → 결과를 Slack으로 알림
```

### 4.4 사례: Playwright Trace Viewer를 이용한 디버깅

Playwright의 Trace Viewer는 E2E 테스트 디버깅을 근본적으로 바꾼 도구다. CI에서 테스트가 실패했을 때 "무슨 일이 있었는지" 정확히 재현할 수 있다.

```
Trace Viewer 활용 사례:

  상황: CI에서 "결제 완료 확인" 테스트가 간헐적으로 실패
  로컬에서는 재현 불가능 (Flaky 의심)

  Playwright 설정:
    use: { trace: 'on-first-retry' }  ← 첫 번째 재시도 시 트레이스 기록

  CI 아티팩트에서 trace.zip 다운로드
  npx playwright show-trace trace.zip

  Trace Viewer에서 확인:
    1. 모든 네트워크 요청/응답 타임라인
    2. 각 단계의 스크린샷 (슬라이더로 시간순 탐색)
    3. DOM 스냅샷 (해당 시점의 HTML 구조 확인)
    4. 콘솔 로그 및 에러

  발견:
    · "결제하기" 버튼 클릭 직후 API 응답이 500ms 지연
    · 그 사이에 다른 UI 업데이트로 버튼 위치가 변경됨
    → 클릭 대상이 잘못 지정되는 Flaky 원인 발견!

  수정:
    await page.getByRole('button', { name: '결제하기' }).click();
    // Playwright auto-wait로 안정적으로 해결됨
```

---

## 5. 실습

### 실습 1: Playwright로 CUJ 테스트 [Applying]

**목표:** 핵심 사용자 흐름을 E2E로 테스트한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · Playwright 설정 (playwright.config.ts)
  · CUJ 1: 홈 → 상품 목록 → 상품 상세 네비게이션
  · CUJ 2: 로그인 → 보호된 페이지 접근 (시뮬레이션)
  · CUJ 3: 상품 검색 → 결과 확인
  · 각 테스트에서:
    - 접근성 기반 쿼리 사용 (getByRole, getByLabel)
    - URL 변경 검증 (toHaveURL)
    - 핵심 콘텐츠 표시 검증 (toBeVisible)
  · waitForTimeout 사용 금지 (조건 기반 대기만 사용)
```

---

### 실습 2: Page Object Model 적용 [Applying]

**목표:** POM으로 테스트의 유지보수성을 높인다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · LoginPage 클래스: goto, login, expectError, expectRedirect
  · ProductsPage 클래스: goto, search, clickProduct, expectProductVisible
  · CartPage 클래스: goto, expectItem, expectTotal, checkout
  · 실습 1의 테스트를 POM으로 리팩토링
  · UI 변경 시뮬레이션: "이메일" 레이블이 "Email"로 변경되면
    POM에서 한 곳만 수정하면 되는지 확인
```

---

### 실습 3: 테스트 전략 설계 [Evaluating · Creating]

**목표:** 프로젝트의 전체 테스트 전략을 설계한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
시나리오: 온라인 학습 플랫폼

기능:
  · 회원가입 / 로그인
  · 강의 목록 / 검색 / 필터
  · 강의 상세 / 수강 신청
  · 영상 시청 / 진도 관리
  · 리뷰 작성
  · 마이페이지 (학습 현황, 수료증)

설계할 것:
  1. CUJ 식별 (E2E로 테스트할 핵심 흐름 5개)
  2. 컴포넌트/통합 테스트 대상 (RTL로 테스트할 것)
  3. 테스트하지 않을 것 (비용 대비 가치가 낮은 것)
  4. CI/CD 파이프라인 설계 (단계, 시간, 실행 조건)
  5. 예상 테스트 수 (컴포넌트/통합/E2E 각각)
```

---

### 실습 4 (선택): Flaky 테스트 진단 [Analyzing]

**목표:** 불안정한 테스트의 원인을 식별하고 해결한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
과제:
  아래 E2E 테스트에서 Flaky의 원인을 찾고 수정하라.

  test('상품 추가 후 장바구니 수량 확인', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);     // ← 문제 1
    await page.click('.product-card:first-child .add-btn'); // ← 문제 2
    await page.waitForTimeout(1000);     // ← 문제 3
    const count = await page.textContent('.cart-count');     // ← 문제 4
    expect(count).toBe('1');
  });

  각 문제의 원인과 해결 방법을 제시하라.
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 37 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. E2E = 실제 브라우저에서 사용자의 전체 흐름을 검증          │
│     → 컴포넌트 테스트가 잡지 못하는 "흐름 수준" 버그를 잡는다│
│     → 가장 높은 신뢰도, 가장 느린 속도, 가장 높은 비용       │
│     → CUJ(핵심 흐름) 5~10개만 E2E, 나머지는 통합 테스트      │
│                                                               │
│  2. Playwright = 현재 가장 권장되는 E2E 도구                  │
│     → 크로스 브라우저, 병렬 실행, 자동 대기                  │
│     → 접근성 기반 쿼리 (getByRole, getByLabel)               │
│     → Trace Viewer로 디버깅                                  │
│                                                               │
│  3. CUJ = "이것이 깨지면 앱이 사용 불가능한 핵심 흐름"        │
│     → 매출 영향, 사용자 첫 경험, 가장 빈번한 흐름            │
│     → "모든 것을 E2E로" 하지 않는다 → 핵심만!                │
│                                                               │
│  4. Page Object Model로 유지보수성을 확보한다                  │
│     → 페이지별 상호작용을 클래스로 캡슐화                    │
│     → UI 변경 시 한 곳만 수정                                │
│     → 테스트 가독성 향상                                     │
│                                                               │
│  5. Flaky 테스트는 즉시 해결한다                               │
│     → waitForTimeout 대신 조건 기반 대기                     │
│     → CSS selector 대신 접근성 기반 쿼리                     │
│     → 테스트 간 상태 독립성 보장                             │
│     → Playwright의 auto-wait가 대부분 해결                   │
│                                                               │
│  6. CI/CD에서 단계적으로 실행한다                              │
│     → Lint → Type Check → Unit/Integration → E2E            │
│     → 빠른 것 먼저 → 실패하면 즉시 중단 (빠른 피드백)       │
│     → PR: 핵심 CUJ만, main: 전체, 야간: 풀 스위트           │
│                                                               │
│  7. 규모에 맞는 테스트 전략을 선택한다                        │
│     → 소규모: CUJ 1~2개 + 핵심 컴포넌트 테스트              │
│     → 중규모: CUJ 5~10개 + 높은 통합 테스트 커버리지        │
│     → 대규모: 전체 자동화 + 크로스 브라우저 + 시각적 회귀    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                      | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------- | ---------- | ----------- |
| 1   | E2E 테스트가 컴포넌트 테스트로 잡지 못하는 버그의 종류는? | Understand | 1.4         |
| 2   | CUJ를 식별하는 기준 3가지는?                              | Remember   | 3.2         |
| 3   | Page Object Model이 테스트 유지보수에 기여하는 원리는?    | Understand | 3.3         |
| 4   | waitForTimeout이 Flaky의 원인이 되는 이유와 대안은?       | Analyze    | 3.4         |
| 5   | Playwright의 auto-wait가 해결하는 문제는?                 | Understand | 3.4         |
| 6   | CI에서 "Lint → Unit → E2E" 순서로 실행하는 이유는?        | Analyze    | 3.5         |
| 7   | "모든 것을 E2E로 테스트"하는 것이 나쁜 이유는?            | Evaluate   | 4.2         |
| 8   | 소규모 프로젝트에서 테스트에 투자할 최소한의 전략은?      | Evaluate   | 3.7         |

### 6.3 FAQ

**Q1. Playwright와 Cypress 중 어떤 것을 선택해야 하나요?**

새 프로젝트라면 Playwright를 권장한다. 크로스 브라우저 지원(Chromium/Firefox/WebKit), 내장 병렬 실행, 빠른 CI 속도, 네이티브 TypeScript 지원 등에서 우위를 가진다. 단, 팀에 Cypress 경험이 깊게 쌓여있거나 기존 Cypress 테스트가 대량으로 존재한다면 굳이 전환할 필요는 없다. 두 도구 모두 프로덕션 수준의 E2E 테스트를 충분히 지원한다.

**Q2. E2E 테스트는 실제 백엔드와 연결해야 하나요, 아니면 모킹해야 하나요?**

정답은 "목적에 따라 다르다"이다. 실제 백엔드와 연결하는 방식은 전체 스택의 통합을 검증하지만 테스트 환경 구성이 복잡하고 느리다. 모킹 방식은 빠르고 안정적이지만 백엔드 버그를 잡지 못한다. 실무에서는 CI 환경의 E2E는 테스트용 백엔드(또는 로컬 API 서버)를 사용하고, 별도의 통합 테스트 환경에서 실제 백엔드와 연결하는 두 계층으로 분리하는 경우가 많다.

**Q3. E2E 테스트를 TDD(테스트 주도 개발) 방식으로 작성해야 하나요?**

컴포넌트 테스트와 달리 E2E 테스트는 일반적으로 TDD 방식으로 작성하기 어렵다. E2E 테스트는 완성된 UI를 실제로 조작하기 때문에 UI가 구현된 이후에 작성하는 것이 현실적이다. 다만 "어떤 CUJ를 E2E로 보호할 것인가"를 기능 개발 전에 정의하는 것은 중요하다. 이 사전 정의 자체가 팀이 무엇을 만들어야 하는지 명확히 하는 역할을 한다.

**Q4. Flaky 테스트가 계속 발생하는데 어떻게 근본적으로 해결하나요?**

Flaky 테스트의 80%는 타이밍 문제에서 비롯된다. 먼저 `waitForTimeout` 제거 후 Playwright의 자동 대기로 교체하고, CSS 선택자 대신 접근성 기반 쿼리로 전환하는 것부터 시작한다. 그래도 지속되면 Playwright의 `trace: 'on'` 설정으로 실패 원인을 정확히 기록하여 분석한다. 간헐적 실패가 10회 이상 반복된다면 삭제 후 재작성을 고려한다.

**Q5. 테스트 코드도 코드 리뷰를 받아야 하나요?**

반드시 그렇다. 테스트 코드는 "실제 코드와 동일한 수준의 유지보수 비용"을 요구한다. 코드 리뷰에서 확인할 항목: (1) 테스트가 실제 사용자 흐름을 올바르게 반영하는가, (2) CUJ를 올바르게 커버하는가, (3) Flaky 가능성이 있는 패턴(waitForTimeout, CSS 선택자 등)이 없는가, (4) POM이 올바르게 적용되었는가. 나쁜 테스트는 테스트가 없는 것보다 오히려 나쁠 수 있다.

---

## 7. 다음 단계 예고

> **Step 38. 코드 품질과 개발 도구** (Phase 6 마무리)
>
> - ESLint + Prettier 설정 전략
> - Git Hooks (Husky + lint-staged)
> - 코드 리뷰 체크리스트
> - Storybook으로 컴포넌트 문서화 (개요)
> - Phase 6 전체 통합 복습

---

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright — Getting Started](https://playwright.dev/docs/intro)
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright — Page Object Models](https://playwright.dev/docs/pom)
- [Cypress 공식 문서](https://docs.cypress.io/)
- [Kent C. Dodds — The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Martin Fowler — Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

---

> **React 완성 로드맵 v2.0** | Phase 6 — 테스트와 품질 보증 | Step 37 of 42
