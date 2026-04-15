# Step 28. 프로젝트 구조와 아키텍처

> **난이도:** 🔴 고급 (Advanced)

> **Phase 4 — 상태 관리와 아키텍처 설계 (Step 25~30)**
> 전역 상태 관리와 앱 아키텍처 패턴을 설계한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| **Remember**   | Feature-based, Layer-based 폴더 구조의 정의와 차이를 기술할 수 있다        |
| **Understand** | Screaming Architecture 원칙이 폴더 구조에 어떻게 적용되는지 설명할 수 있다 |
| **Understand** | 모듈 경계와 의존성 방향의 원칙을 설명할 수 있다                            |
| **Apply**      | 프로젝트 규모에 맞는 폴더 구조를 설계하고 구현할 수 있다                   |
| **Analyze**    | 기존 프로젝트의 구조적 문제(순환 의존성, 경계 침범 등)를 식별할 수 있다    |
| **Evaluate**   | 프로젝트 요구사항에 따라 적합한 아키텍처 패턴을 판단할 수 있다             |

**전제 지식:**

- Step 16: Custom Hook (관심사 분리)
- Step 24: API 계층 설계 (3계층 아키텍처)
- Step 25~26: 상태 관리 도구 선택
- Step 27: 컴포넌트 설계 패턴

---

## 1. 서론 — 프로젝트 구조가 중요한 이유

### 1.1 소프트웨어 아키텍처와 프로젝트 구조의 관계

소프트웨어 아키텍처는 종종 "건물의 설계도"에 비유된다. 건물을 짓기 전 설계도가 없으면 공사는 진행될 수 있지만, 나중에 수정하거나 확장하려 할 때 막대한 비용이 발생한다. 프론트엔드 프로젝트도 동일하다. 초기에는 어떤 구조든 동작하지만, 코드베이스가 성장하면서 구조의 부재가 팀의 생산성을 잠식한다.

2000년대 서버 사이드 개발 세계에서는 MVC(Model-View-Controller) 패턴이 표준으로 자리잡으며 코드 구조화의 중요성을 확립했다. 프론트엔드는 역사적으로 "스크립트를 페이지에 추가하는" 수준에 머물렀으나, SPA(Single Page Application)의 부상과 함께 서버 수준의 복잡도를 갖게 되었다. 이에 따라 프론트엔드 아키텍처 설계도 백엔드와 동등한 수준의 고민을 요구하게 됐다.

Robert C. Martin의 Clean Architecture, Domain-Driven Design(DDD)의 개념들이 프론트엔드에 적용되기 시작했고, 그 결과로 Feature-based 구조와 Screaming Architecture 원칙이 현대 React 개발의 모범 사례로 자리잡았다.

### 1.2 구조가 없으면 일어나는 일

프로젝트 규모에 따라 구조의 중요성이 달라진다는 점을 이해하는 것이 중요하다. 작은 프로젝트에서 완벽한 구조를 추구하는 것은 오버엔지니어링이고, 큰 프로젝트에서 구조 없이 진행하는 것은 기술 부채의 축적이다.


![소규모 프로젝트 (5~10개 파일):](/developer-open-book/diagrams/react-step28-소규모-프로젝트-5-10개-파일.svg)


### 1.3 좋은 프로젝트 구조의 5가지 조건

좋은 프로젝트 구조는 단순히 파일을 "정리"하는 것이 아니다. 팀원이 처음 코드베이스를 접했을 때 방향을 잃지 않도록 하는 지도이자, 기능 추가와 리팩터링 시 어디를 수정해야 하는지 즉시 알 수 있는 안내판이다.

```
1. 발견 가능성 (Discoverability)
   · 파일을 "찾는" 것이 아니라 "당연히 있는 곳에 있다"
   · 새 팀원이 구조를 빠르게 파악할 수 있다

2. 응집도 (Cohesion)
   · 관련 있는 코드가 가까이 위치한다
   · 하나의 기능을 수정할 때 하나의 폴더만 보면 된다

3. 결합도 최소화 (Low Coupling)
   · 모듈 간 의존성이 명확하고 최소화되어 있다
   · 하나의 모듈을 수정해도 다른 모듈에 영향이 적다

4. 확장성 (Scalability)
   · 새로운 기능을 추가할 때 기존 구조를 깨지 않는다
   · 프로젝트가 커져도 구조가 유지된다

5. 규칙 명확성 (Clear Conventions)
   · "이 파일을 어디에 만들지?"에 대한 답이 명확하다
   · 팀원 모두가 같은 규칙을 따른다
```

### 1.4 프로젝트 구조 개념 지도


![프로젝트 구조 핵심 개념 지도](/developer-open-book/diagrams/react-step28-프로젝트-구조-핵심-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step28-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 Layer-based 구조 — 기술 역할 기준 분류

**Layer-based 구조**는 파일을 기술적 역할(components, hooks, services, utils)로 분류하는 방식이다. 직관적이고 학습하기 쉬워 대부분의 튜토리얼과 보일러플레이트에서 기본 선택으로 채택된다.

이 구조의 핵심 단점은 "비즈니스 기능이 여러 폴더에 흩어진다"는 점이다. 상품(product) 기능 하나를 수정하려면 components/ProductCard.jsx, hooks/useProducts.js, services/productService.js, pages/ProductsPage.jsx 등 여러 폴더를 순회해야 한다. 프로젝트가 커질수록 이 비용이 누적된다.

### 2.2 Feature-based 구조 — 비즈니스 기능 기준 분류

**Feature-based 구조**는 파일을 비즈니스 기능(auth, products, cart, dashboard)으로 분류하는 방식이다. 관련 코드가 한 곳에 모이므로 응집도가 높고, 기능 추가/삭제가 폴더 단위로 가능하다.

이 구조에서 "상품 기능 수정"은 features/products/ 폴더 하나만 열면 된다. 팀 분업도 자연스럽다: A팀원은 features/auth/, B팀원은 features/products/를 담당하면 서로 충돌 없이 병렬로 작업할 수 있다.

### 2.3 Screaming Architecture

**Screaming Architecture**는 Robert C. Martin이 제안한 원칙으로, "아키텍처는 앱이 무엇을 하는지 소리쳐야 한다"는 개념이다. 폴더 목록만 봐도 앱의 도메인을 즉시 파악할 수 있어야 한다.

Layer-based의 최상위 폴더(components, hooks, services)는 앱의 도메인을 전혀 드러내지 않는다. Feature-based의 최상위 폴더(auth, products, cart, orders)는 "이커머스 앱"임을 즉시 알려준다. 이 차이가 새 팀원의 온보딩 속도와 코드 탐색 효율성을 좌우한다.

### 2.4 Co-location

**Co-location**은 관련 있는 파일을 가능한 가까이 배치하는 원칙이다. "함께 변하는 것은 함께 둔다(Things that change together stay together)"라는 소프트웨어 공학의 응집도 원칙을 파일 구조에 적용한 것이다.

Co-location의 실용적 이점은 삭제 시에도 나타난다. 컴포넌트를 폴더째 삭제하면 스타일, 테스트, 타입 파일이 함께 제거된다. 파일이 분산되어 있다면 삭제 후 고아 파일(orphan files)이 남아 코드베이스를 오염시킨다.

### 2.5 Barrel Export

**Barrel Export**는 폴더의 index.js에서 외부에 공개할 모듈만 재수출(re-export)하는 패턴이다. 모듈의 Public API를 명시적으로 정의하고 내부 구현을 숨긴다.

이 패턴은 두 가지 목적을 동시에 달성한다. 첫째, import 경로가 짧고 깔끔해진다(`@/features/products` vs `@/features/products/components/ProductCard`). 둘째, feature의 내부 파일 구조를 자유롭게 변경해도 외부 코드가 영향받지 않는다.

### 2.6 의존성 방향

**의존성 방향**은 모듈 간 import가 한 방향으로만 흐르도록 하는 규칙이다. `pages → features → shared` 방향이 표준이며, 역방향 import는 순환 의존성의 원인이 된다.

순환 의존성(circular dependency)은 A가 B를 import하고 B가 A를 import하는 상태로, 번들러의 처리를 복잡하게 만들고 런타임 오류를 유발할 수 있다. 의존성 방향 규칙을 지키면 구조적으로 순환 의존성을 방지할 수 있다.

### 2.7 핵심 용어 요약

| 용어                       | 정의                                                                        | 왜 중요한가                                                      |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Layer-based**            | **기술적 역할**(components, hooks, services, utils)로 폴더를 분류하는 구조  | 직관적이지만 기능이 흩어지는 단점이 있다                         |
| **Feature-based**          | **비즈니스 기능**(auth, products, cart, dashboard)으로 폴더를 분류하는 구조 | 관련 코드가 한 곳에 모여 응집도가 높다                           |
| **Screaming Architecture** | 폴더 구조를 보면 앱이 **"무엇을 하는지"** 즉시 알 수 있는 설계 원칙         | "components, hooks, utils"만 보이면 이커머스인지 채팅인지 모른다 |
| **Co-location**            | 관련 있는 파일을 **가능한 가까이** 배치하는 원칙                            | 컴포넌트, 스타일, 테스트, 타입을 같은 폴더에                     |
| **Barrel Export**          | 폴더의 `index.js`에서 **공개할 모듈만 재수출**하는 패턴                     | 모듈의 Public API를 정의하고 내부 구현을 숨긴다                  |
| **의존성 방향**            | 모듈 간 import가 **한 방향으로만** 흐르도록 하는 규칙                       | 순환 의존성 방지, 아키텍처의 계층 유지                           |
| **Shared Module**          | 여러 feature에서 **공통으로 사용**하는 코드를 모아놓은 모듈                 | UI 컴포넌트, 유틸리티, 타입 등                                   |

### 2.8 두 가지 구조의 핵심 차이


![Layer-based (기술 역할 기준):      Feature-based (비즈니스 기능 기준):](/developer-open-book/diagrams/react-step28-layer-based-기술-역할-기준-feature-based-비즈니스.svg)


### 2.9 개념 간 관계 다이어그램


![프로젝트 구조 원칙 관계도](/developer-open-book/diagrams/react-step28-프로젝트-구조-원칙-관계도.svg)


---

## 3. 이론과 원리

### 3.1 Layer-based 구조 — 기술 역할별 분류

Layer-based 구조는 React 생태계에서 가장 널리 퍼진 구조다. Create React App, Vite의 기본 템플릿, 대부분의 튜토리얼이 이 구조를 채택한다. 초보자 친화적이고 진입 장벽이 낮다는 장점이 있지만, 프로젝트 규모가 커지면서 한계가 분명하게 드러난다.

#### 구조


![src/](/developer-open-book/diagrams/react-step28-src.svg)


#### 장단점


![장점:](/developer-open-book/diagrams/react-step28-장점.svg)


### 3.2 Feature-based 구조 — 비즈니스 기능별 분류

Feature-based 구조는 소프트웨어 공학에서 오래전부터 권장된 "모듈화(Modularization)" 원칙의 프론트엔드 적용이다. 각 feature는 자체적으로 완결된 미니 앱처럼 동작하며, 외부에는 index.js를 통해 공개 API만 노출한다. 이는 객체지향 프로그래밍의 캡슐화(encapsulation) 개념과 동일하다.

#### 구조


![src/](/developer-open-book/diagrams/react-step28-src-8.svg)


#### 장단점


![장점:](/developer-open-book/diagrams/react-step28-장점-9.svg)


### 3.3 Screaming Architecture 원칙

Screaming Architecture는 단순한 폴더 이름 규칙이 아니라, "코드베이스의 목적이 구조에 드러나야 한다"는 설계 철학이다. 이 원칙은 새 팀원의 온보딩 시간을 단축하고, 코드 리뷰 시 "이 파일이 왜 여기 있는지" 설명 없이도 컨텍스트를 공유할 수 있게 한다.


![Robert C. Martin (Clean Architecture 저자)의 원칙](/developer-open-book/diagrams/react-step28-robert-c-martin-clean-architecture-저자-의.svg)


### 3.4 Co-location 원칙

Co-location의 핵심 통찰은 "물리적으로 가까운 코드는 논리적으로도 연관되어 있다"는 점이다. 컴포넌트와 그에 관련된 스타일, 테스트, 타입이 같은 폴더에 있으면, 컴포넌트를 이해하거나 수정할 때 필요한 모든 정보가 한 곳에 있다.


!["관련 있는 파일은 가능한 가까이 둔다"](/developer-open-book/diagrams/react-step28-관련-있는-파일은-가능한-가까이-둔다.svg)


### 3.5 모듈 경계와 의존성 방향

의존성 방향 규칙은 단순한 컨벤션이 아니라, 아키텍처의 건전성을 보장하는 구조적 제약이다. 이 규칙을 강제하는 ESLint 플러그인(eslint-plugin-import, eslint-plugin-boundaries)을 사용하면 빌드 시점에 위반을 감지할 수 있다.

#### 의존성 방향 규칙


![의존성은 한 방향으로만 흘러야 한다](/developer-open-book/diagrams/react-step28-의존성은-한-방향으로만-흘러야-한다.svg)


#### Feature 간 통신 방법


![Feature A가 Feature B의 데이터를 필요로 할 때](/developer-open-book/diagrams/react-step28-feature-a가-feature-b의-데이터를-필요로-할-때.svg)


### 3.6 Barrel Export — 모듈의 Public API 정의

Barrel Export는 JavaScript 모듈 시스템의 특성을 활용하여 "캡슐화"를 구현하는 패턴이다. index.js 파일이 feature의 "공개 계약서"가 되며, 외부에서는 이 계약서에 명시된 것만 사용할 수 있다.

```javascript
// features/products/index.js — Barrel Export

// 외부에 공개할 것만 재수출 (Public API)
export { ProductCard } from "./components/ProductCard";
export { ProductGrid } from "./components/ProductGrid";
export { useProducts } from "./hooks/useProducts";
export { useProductFilter } from "./hooks/useProductFilter";

// 내부 구현은 노출하지 않음 (Private)
// ProductCard.module.css → 노출 안 함
// productService.js → 노출 안 함 (Hook을 통해 간접 접근)
// 내부 유틸리티 → 노출 안 함
```

```
Barrel Export의 역할

  외부에서 사용:
    // ✅ Public API를 통한 접근
    import { ProductCard, useProducts } from '@/features/products';

    // ❌ 내부 파일 직접 접근 (경계 침범)
    import { ProductCard } from '@/features/products/components/ProductCard';
    import { productService } from '@/features/products/services/productService';

  이점:
    · feature의 내부 구조를 자유롭게 변경 가능 (Public API만 유지하면 됨)
    · import 경로가 짧고 깔끔하다
    · "이 feature가 외부에 무엇을 제공하는가"가 index.js에 명시됨
    · 내부 구현의 캡슐화 (information hiding)

  ⚠️ 주의:
    · Barrel Export가 너무 많은 것을 재수출하면 번들 크기에 영향
    · Tree Shaking이 올바르게 동작하는지 확인 필요
    · 순환 참조를 만들지 않도록 주의
```

### 3.7 규모별 구조 템플릿

규모별 구조 선택은 "지금 당장 필요한 구조"를 선택하는 것이지, "미래를 위한 과도한 설계"를 하는 것이 아니다. 작은 프로젝트에 Feature-based를 강제하면 불필요한 복잡도가 생긴다.

#### 소규모 (파일 ~30개, 1~2명)


![src/](/developer-open-book/diagrams/react-step28-src-14.svg)


#### 중규모 (파일 30~100개, 2~5명)


![src/](/developer-open-book/diagrams/react-step28-src-15.svg)


#### 대규모 (파일 100개+, 5명+)


![src/](/developer-open-book/diagrams/react-step28-src-16.svg)


### 3.8 import 별칭(Path Alias) 설정

상대 경로(`../../..`)는 파일이 이동할 때마다 업데이트해야 하고, 깊은 중첩에서는 가독성이 매우 떨어진다. Path Alias는 이 문제를 해결하며, Feature-based 구조와 함께 사용하면 시너지가 발생한다.

```javascript
// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});

// 사용 — 깔끔한 import 경로
import { Button } from "@shared/components";
import { useProducts } from "@features/products";
import { apiClient } from "@/shared/lib/apiClient";

// ❌ 상대 경로 지옥
import { Button } from "../../../../shared/components/Button";
```

### 3.9 pages/의 역할 — "조합 계층"

pages/ 폴더는 단순히 라우트에 대응하는 컴포넌트를 모아두는 곳이 아니다. 아키텍처적으로 pages/는 여러 feature를 조합하는 "접착제" 역할을 담당한다. feature 간 직접 의존성을 pages/가 중재함으로써, feature들은 서로 독립성을 유지할 수 있다.

```
pages/는 feature를 조합하는 "접착제" 역할

  // pages/ProductDetailPage.jsx
  import { ProductDetail, useProduct } from '@features/products';
  import { AddToCartButton } from '@features/cart';
  import { ReviewSection } from '@features/reviews';
  import { useAuth } from '@features/auth';

  export default function ProductDetailPage() {
    const { id } = useParams();
    const { data: product, isLoading } = useProduct(id);
    const { isAuthenticated } = useAuth();

    if (isLoading) return <Spinner />;

    return (
      <div>
        <ProductDetail product={product} />
        {isAuthenticated && <AddToCartButton productId={id} />}
        <ReviewSection productId={id} />
      </div>
    );
  }

  · page가 여러 feature를 import하여 조합
  · 각 feature는 서로를 직접 import하지 않음
  · page가 "접착제" 역할을 수행
  · feature 간 결합도가 낮게 유지됨
```

---

## 4. 사례 연구와 예시

### 4.1 사례: Layer-based에서 Feature-based로 마이그레이션

실제 프로젝트에서 마이그레이션은 한 번에 전체를 바꾸는 것이 아니라 점진적으로 진행한다. 한 feature씩 이동하면서 나머지는 기존 구조를 유지하는 접근이 안전하다. 이 과정에서 index.js(Barrel Export)를 먼저 생성하면 import 경로 변경 작업을 일괄 처리할 수 있다.


![마이그레이션 전 (Layer-based):](/developer-open-book/diagrams/react-step28-마이그레이션-전-layer-based.svg)


### 4.2 사례: 순환 의존성 문제와 해결

순환 의존성은 대규모 프로젝트에서 빈번하게 발생하는 문제다. 처음에는 빌드 경고로 시작하지만, 방치하면 런타임 오류와 번들 크기 증가로 이어진다. 의존성 방향 규칙을 지키면 구조적으로 순환 의존성을 방지할 수 있다.


![❌ 순환 의존성 발생:](/developer-open-book/diagrams/react-step28-순환-의존성-발생.svg)


### 4.3 사례: Next.js App Router에서의 Feature-based 구조

Next.js의 App Router에서는 app/ 디렉토리가 라우팅을 담당하기 때문에, 비즈니스 로직을 app/에 직접 작성하면 "라우팅 구조"와 "비즈니스 로직"이 혼재하게 된다. features/를 분리하면 라우팅 변경 시 비즈니스 로직이 영향받지 않는다.


![Next.js에서는 app/ 디렉토리가 pages/ 역할](/developer-open-book/diagrams/react-step28-next-js에서는-app-디렉토리가-pages-역할.svg)


---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: Feature-based 구조 설계 [Applying]

**목표:** 주어진 요구사항에 맞는 Feature-based 폴더 구조를 설계한다.

```
시나리오: 온라인 학습 플랫폼

기능:
  · 인증 (로그인, 회원가입, 프로필)
  · 강의 (목록, 상세, 검색, 카테고리 필터)
  · 수강 (수강 신청, 학습 진도, 영상 시청)
  · 리뷰 (작성, 목록, 평점)
  · 대시보드 (학습 현황, 수료증)
  · 결제 (결제 처리, 내역)

설계할 것:
  1. features/ 하위 폴더 구조
  2. 각 feature의 components, hooks, services 목록
  3. shared/에 들어갈 공통 모듈 목록
  4. 각 feature의 index.js(Barrel Export) 내용
  5. pages/ 구성 (어떤 feature를 어떻게 조합)
  6. 의존성 방향도 (어떤 feature가 무엇을 import)
```

---

### 실습 2: Barrel Export + Import 별칭 구현 [Applying]

**목표:** 모듈의 Public API를 정의하고 깔끔한 import 경로를 설정한다.

```
요구사항:
  · features/products/의 Barrel Export 작성
    - 외부 공개: ProductCard, ProductGrid, useProducts, useProductFilter
    - 내부만: productService, ProductCardSkeleton, formatProductPrice
  · features/cart/의 Barrel Export 작성
  · shared/components/의 Barrel Export 작성
  · Vite path alias 설정 (@, @features, @shared)
  · 모든 import를 별칭 경로로 변환

검증:
  · 외부에서 내부 파일에 직접 접근 시 "이것은 경계 침범"임을 인식
  · import 경로가 ../../.. 없이 깔끔한지 확인
```

---

### 실습 3: 의존성 방향 분석 [Analyzing]

**목표:** 기존 코드의 의존성 방향을 분석하고 문제를 식별한다.


![아래 import 관계에서 문제를 찾고 해결하라:](/developer-open-book/diagrams/react-step28-아래-import-관계에서-문제를-찾고-해결하라.svg)


---

### 실습 4 (선택): 프로젝트 구조 마이그레이션 [Evaluating · Creating]

**목표:** Layer-based 구조를 Feature-based로 마이그레이션한다.

```
과제:
  지금까지 만든 실습 코드 (또는 가상의 Layer-based 구조)를
  Feature-based로 마이그레이션하라.

  절차:
  1. 현재 파일 목록을 나열
  2. 각 파일이 어떤 feature에 속하는지 분류
  3. feature 폴더 생성 후 파일 이동
  4. shared/ 식별 (2개+ feature에서 사용하는 코드)
  5. Barrel Export 생성
  6. import 경로 업데이트
  7. 의존성 방향 검증

마이그레이션 전후 비교:
  · "상품 기능을 수정하려면 몇 개 폴더를 방문해야 하는가?"
  · "새 기능(위시리스트)을 추가하려면 어떤 폴더를 생성하는가?"
  · "ProductCard를 삭제하면 어떤 파일이 함께 제거되어야 하는가?"
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 28 핵심 요약](/developer-open-book/diagrams/react-step28-step-28-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                      | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Feature-based와 Layer-based 구조의 핵심 차이를 "분류 기준"으로 설명하라   | Remember   | 2.8         |
| 2   | Screaming Architecture 원칙이 Feature-based 구조에 어떻게 적용되는가?     | Understand | 3.3         |
| 3   | Co-location 원칙의 이점을 "삭제"와 "수정" 관점에서 설명하라               | Understand | 3.4         |
| 4   | 의존성 방향 "pages → features → shared"에서 역방향이 금지되는 이유는?     | Understand | 3.5         |
| 5   | Barrel Export가 feature의 "캡슐화"를 보장하는 원리는?                     | Analyze    | 3.6         |
| 6   | feature A가 feature B의 컴포넌트를 필요로 할 때 3가지 해결 방법은?        | Analyze    | 3.5         |
| 7   | 파일 30개인 프로젝트에 Feature-based를 적용하는 것이 부적합한 이유는?     | Evaluate   | 3.7         |
| 8   | Layer-based에서 Feature-based로 마이그레이션할 때 가장 먼저 해야 할 일은? | Apply      | 4.1         |

### 6.3 FAQ

**Q1. "shared"와 "feature" 경계를 어떻게 결정하는가?**

가장 실용적인 기준은 "2개 이상의 feature에서 사용되면 shared로 이동"이다. 처음에는 feature 내부에 두고, 두 번째 feature에서 동일한 코드가 필요해지는 시점에 shared로 올린다. 미래를 예측하여 미리 shared에 두는 것은 YAGNI(You Aren't Gonna Need It) 원칙에 위배된다.

**Q2. 의존성 방향을 자동으로 강제할 수 있는가?**

ESLint의 `eslint-plugin-import` 또는 `eslint-plugin-boundaries`를 사용하면 빌드 시점에 위반을 감지할 수 있다. `boundaries.elements` 설정으로 계층 구조를 정의하고, 역방향 import 시 에러를 발생시키도록 구성한다. CI 파이프라인에 포함하면 팀 전체가 규칙을 지키도록 강제할 수 있다.

**Q3. Feature-based 구조에서 전역 상태(Zustand store)는 어디에 두는가?**

feature 전용 store는 features/{feature}/stores/에 위치한다. 여러 feature에서 공유하는 store(예: uiStore)는 shared/stores/에 위치한다. 단, shared/는 features를 import할 수 없으므로, shared에 있는 store는 비즈니스 로직을 포함하지 않아야 한다.

**Q4. pages/ 컴포넌트가 비대해지는 것을 방지하는 방법은?**

pages/ 컴포넌트는 "조합"만 담당해야 하며, 비즈니스 로직이 포함되면 해당 feature로 이동시킨다. pages/ 컴포넌트에 100줄 이상의 코드가 있다면 로직이 적절히 feature로 추출되지 않았다는 신호다. 컴포넌트 분리의 기준은 "이 로직이 다른 page에서도 필요한가?"이다.

**Q5. 팀에서 구조 규칙을 지키지 않는 팀원이 있을 때 어떻게 하는가?**

문서화와 자동화의 두 가지 접근을 병행한다. ADR(Architecture Decision Record)에 구조 규칙과 결정 이유를 기록하여 새 팀원이 이해할 수 있도록 한다. 동시에 ESLint 규칙과 PR 체크리스트를 통해 자동으로 위반을 감지한다. "규칙이 있다"가 아니라 "규칙이 왜 필요한지"를 팀이 공유하는 것이 장기적으로 가장 효과적이다.

---

## 7. 다음 단계 예고

> **Step 29. 성능 최적화 심화**
>
> - Core Web Vitals (LCP, FID/INP, CLS)
> - 코드 분할(Code Splitting)과 React.lazy
> - 이미지 최적화 전략
> - 번들 분석과 최적화
> - Lighthouse를 활용한 성능 진단
> - Virtualization(가상화)으로 대규모 리스트 처리

---

## 📚 참고 자료

- [Bulletproof React — Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [Kent C. Dodds — How I Structure my React Projects](https://kentcdodds.com/blog/how-i-structure-react-projects)
- [Feature Sliced Design](https://feature-sliced.design/)
- [Robert C. Martin — Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [Next.js — Project Organization](https://nextjs.org/docs/app/getting-started/project-structure)

---

> **React 완성 로드맵 v2.0** | Phase 4 — 상태 관리와 아키텍처 설계 | Step 28 of 42
