# Step 20. React Server Components (RSC)

> **난이도:** 🟡 중급 (Intermediate)

> **Phase 3 — 라우팅과 데이터 레이어 (Step 18~24)**
> 페이지 라우팅과 서버 데이터 관리의 이론적 기반을 확립한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| **Remember**   | Server Component와 Client Component의 정의와 "use client" 지시어를 기술할 수 있다     |
| **Understand** | RSC가 SSR과 근본적으로 다른 점을 설명할 수 있다                                       |
| **Understand** | Server Component가 번들 크기와 성능에 미치는 영향을 설명할 수 있다                    |
| **Apply**      | Server/Client Component의 경계를 설계하고 "use client"를 올바르게 배치할 수 있다      |
| **Analyze**    | 특정 컴포넌트가 Server/Client 중 어디에서 실행되어야 하는지 분석할 수 있다            |
| **Evaluate**   | RSC 아키텍처가 기존 CSR/SSR 패러다임과 비교하여 어떤 문제를 해결하는지 평가할 수 있다 |

**전제 지식:**

- Step 3: React 생태계, 메타 프레임워크 개요
- Step 4: React Element, ReactDOM, "렌더링 = 함수 실행"
- Step 10: Render Phase / Commit Phase, Fiber Architecture
- Step 19: CSR, SSR, SSG, Hydration, Streaming SSR

---

## 1. 서론 — React의 가장 큰 패러다임 전환

### 1.1 CSR과 SSR의 공통된 한계 — 모든 코드가 클라이언트에 간다

2013년 React의 등장 이후, 컴포넌트 기반 UI 개발은 빠르게 업계 표준이 되었다. Step 4에서 배운 React의 핵심 모델은 명확하다: **컴포넌트 함수가 실행되어 React Element를 생성하고, ReactDOM이 DOM으로 변환한다.** 이 모델은 브라우저에서 실행되는 것을 전제로 설계되었다.

Step 19의 SSR도 이 전제를 근본적으로 바꾸지 않았다. SSR은 "서버에서 HTML 문자열을 만들고, 브라우저에서 Hydration하여 React가 인수인계"하는 구조다. 서버에서 렌더링한다고 해도 **모든 컴포넌트 코드는 결국 클라이언트 JS 번들에 포함되어 브라우저로 전달**되어야 했다. 서버는 "미리 그린 그림"을 보내줄 뿐이고, 실제 React 코드와 그것이 의존하는 모든 라이브러리는 반드시 브라우저에 도달해야 했다.

![기존 모델의 구조적 한계](/developer-open-book/diagrams/react-step20-bundle-limits.svg)

### 1.2 React 팀이 던진 근본적 질문

2020년 React 팀(주도: Dan Abramov, Lauren Tan)은 이 한계에 정면으로 도전했다. 발표된 RFC(Request for Comments)에는 세 가지 근본적 질문이 담겨 있었다:

첫째, **"모든 컴포넌트가 클라이언트에서 실행되어야 하는가?"** 상품 목록을 보여주는 컴포넌트, 마크다운을 HTML로 변환하는 컴포넌트처럼 순수하게 데이터를 표시하기만 하는 컴포넌트는 클라이언트에서 실행될 필요가 없다.

둘째, **"서버 자원에 직접 접근할 수 있다면?"** 데이터베이스, 파일 시스템, 내부 API를 컴포넌트에서 직접 조회할 수 있다면 별도의 API Route가 필요 없다.

셋째, **"상호작용이 없는 코드의 번들 비용을 없앨 수 있다면?"** 서버에서만 실행되고 결과(직렬화된 React Element)만 전달하면, 해당 컴포넌트의 소스 코드와 의존 라이브러리는 클라이언트에 전혀 전달할 필요가 없다.

이 질문들에 대한 답이 **React Server Components(RSC)** 다.

### 1.3 RSC가 해결하는 문제의 산업적 맥락

웹 성능은 측정 가능한 비즈니스 지표와 직결된다. 번들 크기가 클수록 특히 저사양 디바이스와 저속 네트워크 환경에서 경험이 크게 나빠진다. 전 세계 인터넷 사용자 중 상당수는 여전히 3G 환경과 중저가 스마트폰을 사용한다. RSC는 이 격차를 좁히기 위한 아키텍처적 해법이다.

번들 크기 감소의 효과는 선형적이 아닌 지수적으로 나타난다. 200KB 번들은 단순히 다운로드 시간만 줄이는 것이 아니라 JS 파싱, 컴파일, 실행 시간 모두를 줄인다. Facebook, Shopify, Vercel 등 대형 플랫폼들이 RSC를 채택한 이유가 여기 있다.

### 1.4 이 Step에서 다루는 범위

![Step 20 다루는 범위](/developer-open-book/diagrams/react-step20-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                      | 정의                                                                                                     | 왜 중요한가                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Server Component**      | **서버에서만 실행**되는 React 컴포넌트. 클라이언트 JS 번들에 포함되지 않는다                             | 번들 크기 감소, 서버 자원 직접 접근이 가능하다                 |
| **Client Component**      | **브라우저에서 실행**되는 React 컴포넌트. 기존의 모든 React 컴포넌트와 동일                              | 상호작용(이벤트, Hook)이 필요한 UI에 사용한다                  |
| **"use client"**          | 파일 최상단에 선언하여 해당 모듈과 그 하위를 **Client Component로 표시**하는 지시어                      | Server/Client 경계를 명시적으로 정의한다                       |
| **"use server"**          | 함수에 선언하여 해당 함수를 **Server Action**으로 표시하는 지시어. 클라이언트에서 호출하면 서버에서 실행 | 폼 제출 등 서버 측 데이터 변경을 직접 호출할 수 있다           |
| **RSC Payload**           | Server Component의 렌더링 결과를 **직렬화한 데이터 형식**. HTML이 아닌 React의 내부 형식                 | 클라이언트가 이 데이터를 받아 Client Component와 조합한다      |
| **Server Action**         | 서버에서 실행되는 비동기 함수. 클라이언트의 폼 제출이나 이벤트에서 **직접 서버 함수를 호출**             | API Route 없이 서버 로직을 호출할 수 있다                      |
| **직렬화(Serialization)** | Server Component의 렌더링 결과를 **네트워크로 전송 가능한 형태**로 변환하는 과정                         | Server Component는 함수를 Props로 전달할 수 없다 (직렬화 불가) |

### 2.2 Server Component와 Client Component의 이론적 배경

**Server Component의 이론적 기반**

Server Component는 "컴포넌트의 실행 환경을 명시적으로 분리한다"는 아이디어에 기반한다. 함수형 프로그래밍에서 순수 함수(pure function)는 동일한 입력에 동일한 출력을 보장한다. Server Component는 이 개념을 확장하여 "서버 환경에서만 실행되는 순수한 렌더링 함수"를 정의한다. 입력(props, 서버 데이터)을 받아 React Element 트리를 반환하고, 그 결과는 직렬화되어 클라이언트로 전달된다. 부수효과(state 변화, 브라우저 API 접근)가 없으므로 클라이언트에서 재실행할 필요가 없다.

**Client Component와의 책임 분리**

소프트웨어 공학의 **단일 책임 원칙(SRP, Single Responsibility Principle)** 을 RSC에 적용하면 명확해진다. 데이터 조회와 렌더링은 서버의 책임이고, 상호작용과 상태 관리는 클라이언트의 책임이다. RSC는 이 두 책임을 컴포넌트 수준에서 분리한다.

![책임 분리 관점의 RSC 모델](/developer-open-book/diagrams/react-step20-responsibility.svg)

**직렬화 제약의 이론적 의미**

Server Component에서 Client Component로 전달되는 props는 네트워크를 통해 이동한다. 이는 함수나 클래스 인스턴스처럼 직렬화 불가능한 값을 전달할 수 없다는 제약을 의미한다. 이 제약은 언뜻 불편해 보이지만, 서버-클라이언트 경계를 명확하게 강제함으로써 아키텍처를 단순하고 예측 가능하게 만든다.

### 2.3 Server Component vs Client Component 비교

![Server Component vs Client Component](/developer-open-book/diagrams/react-step20-sc-vs-cc.svg)

### 2.4 개념 간 관계 — RSC, SSR, CSR의 위치

![렌더링 패러다임 관계도](/developer-open-book/diagrams/react-step20-paradigm-relations.svg)

---

## 3. 이론과 원리

### 3.1 RSC vs SSR — 가장 혼동하기 쉬운 개념

#### 둘은 완전히 다른 개념이다

```
SSR (Server-Side Rendering)
━━━━━━━━━━━━━━━━━━━━━━━━━━
  무엇을 하는가: 서버에서 컴포넌트를 실행하여 "HTML 문자열"을 만든다
  결과물: HTML 문자열 (브라우저가 즉시 표시)
  이후: 클라이언트에서 Hydration (JS 번들 전체가 필요)
  목적: 빠른 초기 화면 (FCP) + SEO

  핵심: 모든 컴포넌트 코드가 여전히 클라이언트 JS 번들에 포함된다!
        서버는 "미리보기"를 만들 뿐, 클라이언트가 "인수인계"한다


RSC (React Server Components)
━━━━━━━━━━━━━━━━━━━━━━━━━━
  무엇을 하는가: 서버에서 컴포넌트를 실행하여 "RSC Payload"를 만든다
  결과물: RSC Payload (직렬화된 React Element 트리)
  이후: 클라이언트가 Payload를 받아 Client Component와 조합
  목적: 번들 크기 감소 + 서버 자원 직접 접근

  핵심: Server Component 코드는 클라이언트 JS 번들에 절대 포함되지 않는다!
        서버에서 실행되고 결과만 전달된다


비유:
  SSR = 레스토랑에서 요리 사진(HTML)을 먼저 보여주고,
        나중에 실제 요리(JS)를 가져와서 사진과 교체(Hydration)
        → 사진도 필요하고 요리도 필요 (둘 다 전달)

  RSC = 레스토랑에서 샐러드(Server)는 주방에서 완성하여 접시째 가져오고,
        스테이크(Client)만 테이블의 그릴(브라우저)에서 굽는다
        → 샐러드 레시피(코드)는 테이블에 전달하지 않음
```

#### SSR과 RSC는 함께 사용된다

```
실제로는 SSR과 RSC가 결합하여 동작

  요청 → 서버:
    1. Server Component를 실행 → RSC Payload 생성
    2. RSC Payload + Client Component → SSR로 HTML 문자열 생성
    3. HTML + RSC Payload + Client JS 번들을 클라이언트에 전송

  브라우저:
    4. HTML 표시 (SSR 덕분에 빠른 FCP)
    5. Client JS 로드 + Hydration (Client Component만!)
    6. RSC Payload로 서버 렌더링 결과와 클라이언트를 조합

  핵심 이점:
    · Server Component 코드는 JS 번들에 포함되지 않음 → 번들 축소
    · Client Component만 Hydration → Hydration 시간 단축
    · SSR의 빠른 FCP + RSC의 번들 크기 감소 = 양쪽 이점 확보
```

### 3.2 Server Component의 동작 원리

#### async 컴포넌트 — 서버에서 직접 데이터 접근

```jsx
// Server Component — "use client"가 없으면 기본값이 Server Component
// (Next.js App Router 기준)

// ✅ 데이터베이스를 직접 조회할 수 있다!
async function ProductList() {
  // 서버에서 실행되므로 DB에 직접 접근 가능
  const products = await db.query(
    "SELECT * FROM products ORDER BY created_at DESC",
  );

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price.toLocaleString()}원</p>
        </li>
      ))}
    </ul>
  );
}

// ✅ 파일 시스템을 직접 읽을 수 있다!
import { readFile } from "fs/promises";
import { marked } from "marked"; // 마크다운 파서 — 번들에 포함되지 않음!

async function BlogPost({ slug }) {
  const content = await readFile(`./posts/${slug}.md`, "utf-8");
  // 서버에서만 실행 — 마크다운 라이브러리가 번들에 포함되지 않는다
  const htmlContent = marked(content);
  return <article className="prose">{htmlContent}</article>;
}

// ✅ 서버 전용 비밀키를 안전하게 사용할 수 있다!
async function AnalyticsDashboard() {
  const data = await fetch("https://analytics.api.com/data", {
    headers: { Authorization: `Bearer ${process.env.ANALYTICS_SECRET_KEY}` },
    // 비밀키가 클라이언트에 노출되지 않는다!
  });
  const stats = await data.json();

  return <StatsDisplay stats={stats} />;
}
```

```
Server Component의 핵심 특성

  1. async/await를 컴포넌트에서 직접 사용 가능
     · useEffect + useState 패턴 불필요!
     · 데이터가 준비된 상태에서 렌더링

  2. 서버 자원에 직접 접근
     · 데이터베이스 (SQL, ORM)
     · 파일 시스템 (fs)
     · 환경 변수 (서버 비밀키)
     · 내부 마이크로서비스

  3. 무거운 라이브러리가 번들에 포함되지 않음
     · marked (마크다운 파서, 200KB+)
     · highlight.js (코드 하이라이팅, 400KB+)
     · 날짜 포매팅 라이브러리
     → 서버에서만 사용하고 결과만 클라이언트에 전달

  4. 결과물은 직렬화된 React Element
     · HTML 문자열이 아님 (SSR과 다름)
     · Client Component의 "빈 자리"를 포함한 트리 구조
     · 클라이언트에서 Client Component와 결합
```

#### RSC Payload — Server Component의 렌더링 결과

```
Server Component의 렌더링 결과는 "RSC Payload"라는 특수한 형식

  Server Component:
    async function ProductCard({ id }) {
      const product = await db.findProduct(id);
      return (
        <div>
          <h2>{product.name}</h2>
          <p>{product.price}원</p>
          <AddToCartButton productId={id} />  ← Client Component
        </div>
      );
    }

  RSC Payload (개념적 표현):
    {
      type: 'div',
      props: {
        children: [
          { type: 'h2', props: { children: '노트북' } },
          { type: 'p', props: { children: '1200000원' } },
          {
            type: '$CLIENT_REF:AddToCartButton',  ← Client Component 참조
            props: { productId: 42 }               ← Props만 전달
          }
        ]
      }
    }

  핵심:
    · h2, p → 서버에서 이미 렌더링 완료 (코드 불필요)
    · AddToCartButton → "여기에 Client Component를 넣어라"라는 참조
    · Client Component의 코드는 별도 JS 번들로 전달
    · 클라이언트가 참조를 보고 해당 컴포넌트를 마운트
```

### 3.3 "use client" 지시어 — 경계의 선언

#### "use client"의 의미

```jsx
// 이 파일의 모든 컴포넌트와 이 파일이 import하는 모듈은
// Client Component로 취급된다

"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>카운트: {count}</button>
  );
}

export function SearchInput({ onSearch }) {
  const [query, setQuery] = useState("");
  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
      placeholder="검색..."
    />
  );
}
```

```
"use client"는 "경계(Boundary)"를 선언한다

  ┌─────────────── Server ───────────────────────────────┐
  │                                                       │
  │  ServerPage (Server Component)                       │
  │    ├── Header (Server Component)                     │
  │    ├── ProductList (Server Component — async, DB 조회)│
  │    │     ├── <h2>{product.name}</h2>  (서버에서 완료) │
  │    │     └── AddToCartButton ──→ ┐                   │
  │    └── Footer (Server Component) │                   │
  │                                   │                   │
  └───────────────────────────────────┼───────────────────┘
                                      │ "use client" 경계
  ┌───────────────────────────────────┼───────────────────┐
  │                                   ▼                   │
  │  Client ───────────────────────────────────────────── │
  │                                                       │
  │  AddToCartButton (Client Component)                  │
  │    · useState, onClick 사용 가능                     │
  │    · JS 번들에 포함됨                                │
  │    · 브라우저에서 실행됨                              │
  │                                                       │
  └───────────────────────────────────────────────────────┘

  "use client"는 "이 지점부터 아래는 클라이언트 영역이다"라는 선언
  경계 위 = Server, 경계 아래 = Client
```

#### "use client"를 붙이지 않아야 하는 곳

```
잘못된 관행: "모든 파일에 'use client'를 붙이자"

  ❌ 이러면 RSC의 이점이 사라진다!
  → 모든 코드가 클라이언트 번들에 포함됨
  → 기존 CSR과 동일해짐
  → Server Component의 존재 의미가 없어짐

올바른 접근: "use client"는 최소한으로

  · 상호작용이 필요한 컴포넌트에만 붙인다
  · 가능한 한 "use client" 경계를 트리 아래쪽으로 내린다
  · 큰 페이지 전체가 아닌, 작은 상호작용 컴포넌트에 붙인다
```

### 3.4 Server/Client 경계 설계 전략

#### 원칙: Client 경계를 "잎(leaf)" 쪽으로 밀어내린다

```
❌ 나쁜 설계: 페이지 전체를 Client Component로

  "use client"
  function ProductPage() {                    ← 전체가 Client!
    const [cart, setCart] = useState([]);
    const products = useProducts();            // useEffect로 패칭
    return (
      <div>
        <Header />                             // 서버에서 할 수 있는 것도 클라이언트
        <ProductList products={products} />    // 데이터 목록도 클라이언트
        <AddToCartButton onAdd={...} />        // 상호작용 필요
      </div>
    );
  }
  → 모든 코드가 JS 번들에 포함 → RSC 이점 없음


✅ 좋은 설계: 상호작용 부분만 Client Component

  // page.js — Server Component (기본)
  async function ProductPage() {
    const products = await db.query('SELECT * FROM products');  // 서버에서 직접

    return (
      <div>
        <Header />                              // Server: 정적 UI
        <ProductList products={products} />     // Server: 데이터 표시만
        <CartSection />                          // Client 경계는 여기 안에서
      </div>
    );
  }

  // ProductList.js — Server Component (상호작용 없음)
  function ProductList({ products }) {
    return (
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.price}원</p>
            <AddToCartButton productId={p.id} />  ← Client 경계
          </li>
        ))}
      </ul>
    );
  }

  // AddToCartButton.js — Client Component (상호작용 필요)
  "use client";
  function AddToCartButton({ productId }) {
    const [isAdding, setIsAdding] = useState(false);
    const handleClick = async () => { /* ... */ };
    return <button onClick={handleClick}>장바구니 추가</button>;
  }

  → AddToCartButton만 JS 번들에 포함
  → ProductList의 map, h3, p는 서버에서 렌더링 → 번들에 없음
  → 상품이 100개여도 클라이언트 번들은 동일 크기!
```

#### Server Component에서 Client Component로 Props 전달 규칙

```
Server → Client로 전달 가능한 Props

  ✅ 직렬화 가능한 값 (Serializable):
    · 문자열, 숫자, 불리언, null, undefined
    · 배열, 일반 객체 (중첩 포함)
    · Date (문자열로 직렬화)
    · Map, Set (JSON 호환 형태)

  ❌ 직렬화 불가능한 값:
    · 함수 (function, arrow function) ★
    · 클래스 인스턴스
    · Symbol
    · DOM 노드

  따라서:
    // Server Component
    async function Page() {
      const data = await fetchData();

      return (
        <ClientComponent
          name="홍길동"           // ✅ 문자열
          count={42}              // ✅ 숫자
          items={[1, 2, 3]}       // ✅ 배열
          user={{ id: 1 }}        // ✅ 객체
          onClick={handleClick}   // ❌ 함수는 전달 불가!
        />
      );
    }

  함수를 전달해야 한다면:
    · Client Component 내부에서 정의한다
    · Server Action ("use server")을 사용한다
```

### 3.5 Server Actions — "use server"

#### 개념: 클라이언트에서 서버 함수를 직접 호출

```
기존 방식: API Route를 통한 간접 호출

  Client → fetch('/api/cart', { method: 'POST', body: ... }) → Server
  · API Route를 별도로 정의해야 한다
  · URL 관리, 요청/응답 직렬화를 수동으로 처리
  · 타입 안전성 보장이 어렵다

Server Action: 함수를 직접 호출하듯이

  Client → addToCart(productId) → Server
  · 별도의 API Route 불필요
  · 함수 호출처럼 자연스러운 코드
  · 타입 안전성을 프레임워크가 보장 (TypeScript 지원)
```

#### 구현

```jsx
// actions.js — Server Action 정의
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addToCart(productId, quantity) {
  // 서버에서 실행! DB에 직접 접근 가능
  const userId = await getCurrentUserId();

  await db.cart.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
  });

  revalidatePath("/cart"); // 장바구니 페이지 캐시 무효화
}

export async function removeFromCart(productId) {
  const userId = await getCurrentUserId();
  await db.cart.delete({
    where: { userId_productId: { userId, productId } },
  });
  revalidatePath("/cart");
}
```

```jsx
// AddToCartButton.js — Client Component에서 Server Action 호출
"use client";

import { addToCart } from "@/actions";
import { useState } from "react";

function AddToCartButton({ productId }) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    await addToCart(productId, 1); // 서버 함수를 직접 호출!
    setIsPending(false);
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? "추가 중..." : "장바구니 추가"}
    </button>
  );
}

// form action으로도 사용 가능 (Step 15의 form Action과 결합)
function AddToCartForm({ productId }) {
  return (
    <form
      action={async () => {
        "use server";
        await addToCart(productId, 1);
      }}
    >
      <button type="submit">장바구니 추가</button>
    </form>
  );
}
```

```
Server Action의 내부 동작

  1. "use server"로 표시된 함수 → 빌드 도구가 서버 엔드포인트를 자동 생성
  2. 클라이언트 코드에서 이 함수를 호출하면:
     · 함수 인자를 직렬화하여 HTTP 요청으로 서버에 전송
     · 서버에서 함수 실행
     · 결과를 클라이언트에 반환
  3. 개발자는 "함수 호출"처럼 코드를 작성하지만
     실제로는 네트워크 요청이 일어난다

  → API Route를 수동으로 만들 필요 없음
  → 자동으로 엔드포인트 생성 + 직렬화 + 호출
```

### 3.6 합성(Composition) 패턴과 RSC

#### Server Component에서 Client Component를 children으로 전달

```jsx
// ❌ Client Component가 Server Component를 import → 불가능!
"use client";
import ServerComponent from "./ServerComponent"; // 에러!

function ClientWrapper() {
  return <ServerComponent />; // Client에서 Server를 import 불가!
}

// ✅ Server Component가 Client Component를 children으로 전달 → 가능!

// layout.js — Server Component
import { ClientSidebar } from "./ClientSidebar";

async function Layout({ children }) {
  const user = await getUser();

  return (
    <div className="layout">
      {/* Server Component가 Client Component를 "사용" */}
      <ClientSidebar user={user}>
        {children} {/* children은 Server Component일 수 있음! */}
      </ClientSidebar>
    </div>
  );
}

// ClientSidebar.js — Client Component
("use client");
import { useState } from "react";

function ClientSidebar({ user, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button onClick={() => setIsOpen(!isOpen)}>토글</button>
      <p>{user.name}</p>
      <main>{children}</main> {/* children은 이미 서버에서 렌더링됨! */}
    </div>
  );
}
```

```
핵심 패턴: "Server Component를 Client Component의 children으로 전달"

  이유:
    · Client Component는 Server Component를 import할 수 없다
    · 하지만 children/props로 받는 것은 가능하다!
    · children은 이미 서버에서 렌더링된 "결과"이기 때문
    · Client Component는 그 "결과"를 표시할 뿐, import하는 것이 아님

  이것은 Step 5에서 배운 Composition 패턴의 RSC 확장이다
```

### 3.7 RSC의 성능 이점

#### 번들 크기 감소

```
시나리오: 마크다운 블로그 포스트 렌더링

  기존 (CSR/SSR):
    import { marked } from 'marked';          // 200KB
    import hljs from 'highlight.js';           // 400KB
    import sanitizeHtml from 'sanitize-html';  // 150KB
    → 클라이언트 번들에 750KB+ 추가!

  RSC:
    // Server Component — 아래 라이브러리들은 번들에 포함 안 됨!
    import { marked } from 'marked';           // 서버에서만 실행
    import hljs from 'highlight.js';           // 번들 미포함
    import sanitizeHtml from 'sanitize-html';  // 번들 미포함

    async function BlogPost({ slug }) {
      const markdown = await readFile(`./posts/${slug}.md`, 'utf-8');
      // 서버에서 안전하게 마크다운 처리 (결과만 클라이언트에 전달)
      const processedHtml = sanitizeHtml(marked(markdown));
      return <article className="prose">{processedHtml}</article>;
    }

    → 클라이언트 번들 추가: 0KB! ★
    → 750KB의 라이브러리가 서버에서만 사용되고 결과만 전달됨
```

#### Hydration 범위 축소

```
기존 SSR:
  전체 컴포넌트 트리를 Hydration (100개 컴포넌트 모두)
  → Hydration 시간: 200ms

RSC + SSR:
  Client Component만 Hydration (버튼 10개만)
  → Hydration 시간: 20ms

  90개의 Server Component는 Hydration이 필요 없다!
  서버에서 이미 완성된 HTML이므로 이벤트 핸들러만 연결하면 됨
  → TTI가 크게 단축됨
```

### 3.8 Server/Client Component 선택 가이드

```
"이 컴포넌트는 Server인가 Client인가?"

  ┌─ 사용자 상호작용이 있는가? (클릭, 입력, 드래그 등)
  │    YES → Client Component ("use client")
  │
  ├─ React Hook을 사용하는가? (useState, useEffect 등)
  │    YES → Client Component
  │
  ├─ 브라우저 API를 사용하는가? (window, document, localStorage)
  │    YES → Client Component
  │
  ├─ 데이터베이스/파일 시스템에 직접 접근하는가?
  │    YES → Server Component (기본)
  │
  ├─ 무거운 라이브러리를 사용하지만 결과만 필요한가?
  │    YES → Server Component (번들 크기 절약)
  │
  └─ 단순히 Props를 받아 표시만 하는가?
       YES → Server Component (기본, 가장 효율적)

  기본 원칙: 가능하면 Server Component를 유지하고,
             상호작용이 필요한 최소 범위만 Client로 분리한다
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 이커머스 상품 페이지의 Server/Client 분리

```
상품 상세 페이지의 컴포넌트 분석

  ProductPage (Server ★)
  ├── Breadcrumb (Server) — 정적 네비게이션 경로
  ├── ProductImages (Client) — 이미지 슬라이더, 줌 기능
  ├── ProductInfo (Server ★) — 이름, 설명, 가격 (DB 직접 조회)
  │     └── PriceDisplay (Server) — 가격 포맷팅
  ├── AddToCartSection (Client) — 수량 선택, 장바구니 버튼
  ├── ProductDescription (Server ★) — 마크다운 렌더링
  ├── ReviewList (Server ★) — 리뷰 목록 (DB 조회)
  │     └── ReviewLikeButton (Client) — 좋아요 토글
  └── RelatedProducts (Server ★) — 추천 상품 (ML 모델 호출)

  Client Component: 3개 (이미지 슬라이더, 장바구니, 좋아요)
  Server Component: 7개 (나머지 전부)

  번들에 포함되는 코드: 3개 컴포넌트의 JS만
  서버에서만 실행: 7개 컴포넌트 + DB 쿼리 + 마크다운 파서 + ML 모델
```

### 4.2 사례: RSC 이전과 이후의 코드 비교

```jsx
// ❌ Before (CSR): useEffect + useState로 데이터 패칭
"use client";
function NotePage({ noteId }) {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then((data) => {
        setNote(data);
        setIsLoading(false);
      });
  }, [noteId]);

  if (isLoading) return <Spinner />;

  // marked 라이브러리가 클라이언트 번들에 포함됨 (200KB+)
  const processedContent = marked(note.content);
  return <article className="prose">{processedContent}</article>;
}

// ✅ After (RSC): 서버에서 직접 데이터 접근
import { marked } from "marked"; // 번들에 포함 안 됨!

async function NotePage({ noteId }) {
  const note = await db.notes.findUnique({ where: { id: noteId } });

  if (!note) return <NotFound />;

  // 서버에서만 실행 — 마크다운 라이브러리가 번들에 포함되지 않는다
  const processedContent = marked(note.content);
  return <article className="prose">{processedContent}</article>;
}

// 비교:
// Before: useState 2개 + useEffect 1개 + 로딩 처리 + 200KB 라이브러리
// After: async 함수 1개 + DB 직접 조회 + 0KB 번들 추가
```

### 4.3 사례: Server Action으로 API Route 대체

```
기존 방식: API Route → fetch → 결과 처리

  // /api/todos/route.js (API Route)
  export async function POST(request) {
    const { text } = await request.json();
    const todo = await db.todos.create({ data: { text } });
    return Response.json(todo);
  }

  // Client Component
  async function addTodo(text) {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    return todo;
  }

Server Action 방식: 함수 직접 호출

  // actions.js
  "use server";
  export async function addTodo(text) {
    const todo = await db.todos.create({ data: { text } });
    revalidatePath('/todos');
    return todo;
  }

  // Client Component
  import { addTodo } from './actions';
  // addTodo(text)를 직접 호출!

  → API Route 파일 불필요
  → fetch, JSON 직렬화 불필요
  → 함수 호출처럼 자연스러운 코드
```

### 4.4 사례: 대규모 앱에서 RSC의 번들 크기 절감 효과

```
시나리오: 콘텐츠 플랫폼 (블로그 + 커뮤니티)

  RSC 도입 전 (전체 CSR):
  ┌──────────────────────────────────────────────────┐
  │  클라이언트 번들                                  │
  │  · React + ReactDOM:    45KB                     │
  │  · 라우터:              25KB                     │
  │  · marked (마크다운):  200KB  ← 서버에서만 필요  │
  │  · highlight.js:       400KB  ← 서버에서만 필요  │
  │  · sanitize-html:      150KB  ← 서버에서만 필요  │
  │  · date-fns:            72KB  ← 서버에서만 필요  │
  │  · DOMPurify:           70KB  ← 서버에서만 필요  │
  │  · 앱 코드:            180KB                     │
  │  ───────────────────────────────────────────── │
  │  합계:               1,142KB (약 1.1MB)          │
  └──────────────────────────────────────────────────┘

  RSC 도입 후:
  ┌──────────────────────────────────────────────────┐
  │  클라이언트 번들 (상호작용 컴포넌트만)            │
  │  · React + ReactDOM:    45KB                     │
  │  · 라우터:              25KB                     │
  │  · 상호작용 컴포넌트:   80KB  (댓글 폼, 좋아요)  │
  │  ───────────────────────────────────────────── │
  │  합계:                 150KB (약 87% 감소!)      │
  └──────────────────────────────────────────────────┘

  결과:
    · 초기 JS 다운로드: 1,142KB → 150KB
    · 저속 네트워크(3G)에서 로딩 시간: ~9초 → ~1.2초
    · TTI (Time To Interactive): 크게 단축
    · Lighthouse 성능 점수: 향상
```

---

## 5. 실습

### 실습 1: Server/Client Component 분류 연습 [Analyzing]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 컴포넌트를 Server/Client로 올바르게 분류한다.

아래 컴포넌트들을 Server 또는 Client로 분류하고 근거를 제시하라.

```
1. Header — 로고, 네비게이션 링크 (정적)
2. SearchBar — 검색어 입력, 자동완성 드롭다운
3. ProductGrid — 상품 목록 표시 (DB에서 조회)
4. ProductCard — 이름, 가격, 이미지 표시
5. AddToCartButton — 클릭 시 장바구니에 추가
6. ReviewSection — 리뷰 목록 (DB 조회) + 평점 집계
7. WriteReviewForm — 텍스트 입력, 별점 선택, 제출
8. Markdown — 마크다운 문자열을 HTML로 변환하여 표시
9. ThemeToggle — 다크모드/라이트모드 전환 버튼
10. Footer — 저작권 정보, 링크 (정적)
11. ImageCarousel — 이미지 좌우 슬라이드, 터치 제스처
12. PriceCalculator — 할인율 적용, 세금 계산 (서버에서 가격 정책 조회)
```

---

### 실습 2: "use client" 경계 설계 [Applying · Evaluating]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 최소한의 "use client" 경계를 설계한다.

아래 페이지의 컴포넌트 트리에서 "use client" 경계를 어디에 두어야 하는지 설계하라.

```
BlogPostPage
├── Header (네비게이션)
├── ArticleContent (마크다운 → HTML 변환)
├── AuthorBio (저자 정보, DB 조회)
├── CommentSection
│   ├── CommentList (댓글 목록, DB 조회)
│   │   └── Comment
│   │       ├── CommentText (텍스트 표시)
│   │       └── LikeButton (좋아요 토글)
│   └── CommentForm (텍스트 입력 + 제출)
├── ShareButtons (SNS 공유 버튼, 클릭 이벤트)
└── RelatedPosts (관련 글 목록, DB 조회)

설계할 것:
  1. 각 컴포넌트를 Server/Client로 분류
  2. "use client" 경계 위치 표시
  3. Server Component에서 Client Component로 전달하는 Props 목록
  4. 직렬화 제약으로 인해 함수를 전달할 수 없는 부분의 해결 방법
```

---

### 실습 3: RSC vs 기존 패턴 코드 비교 [Analyzing]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** 같은 기능을 CSR과 RSC로 구현했을 때의 차이를 분석한다.

```
과제:
  · 아래 CSR 코드를 RSC 패턴으로 재작성하라
  · 재작성 후 비교 분석 (코드량, 번들 크기, 데이터 패칭 방식)

  // CSR 버전
  "use client";
  import { useState, useEffect } from 'react';
  import { formatDate } from 'date-fns';       // 72KB
  import { marked } from 'marked';              // 200KB
  import DOMPurify from 'dompurify';            // 70KB

  function BlogPost({ postId }) {
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetch(`/api/posts/${postId}`)
        .then(r => r.json())
        .then(data => { setPost(data); setIsLoading(false); })
        .catch(err => { setError(err); setIsLoading(false); });
    }, [postId]);

    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;

    // 클라이언트에서 마크다운 처리 (라이브러리가 번들에 포함됨)
    const processedContent = DOMPurify.sanitize(marked(post.content));

    return (
      <article>
        <h1>{post.title}</h1>
        <p>작성일: {formatDate(post.createdAt, 'yyyy년 MM월 dd일')}</p>
        <div className="prose">{processedContent}</div>
        <LikeButton postId={postId} initialLikes={post.likes} />
      </article>
    );
  }

분석할 것:
  · 클라이언트 번들 크기 차이 (CSR vs RSC)
  · 로딩 처리 코드의 차이
  · 데이터 패칭 방식의 차이
  · LikeButton은 어떤 컴포넌트가 되어야 하는가?
```

---

### 실습 4 (선택): Server Action 설계 [Evaluating · Creating]

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

**목표:** API Route 대신 Server Action으로 CRUD를 설계한다.

```
시나리오: 할 일 목록 앱

요구사항:
  · 할 일 목록 표시 (Server Component — DB 직접 조회)
  · 할 일 추가 (Server Action)
  · 할 일 완료 토글 (Server Action)
  · 할 일 삭제 (Server Action)
  · 인라인 편집 (Client Component + Server Action)

설계할 것:
  1. actions.js에 Server Action 4개 정의
  2. 컴포넌트 트리와 Server/Client 경계
  3. 낙관적 업데이트 적용 가능 여부 분석
  4. revalidatePath 또는 revalidateTag 전략
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 20 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. RSC = 서버에서만 실행되는 React 컴포넌트                  │
│     → 클라이언트 JS 번들에 포함되지 않는다                    │
│     → async/await, DB 직접 접근, 파일 시스템 접근 가능        │
│     → useState, useEffect, 이벤트 핸들러 사용 불가            │
│                                                               │
│  2. RSC ≠ SSR — 근본적으로 다른 개념                         │
│     → SSR: HTML 문자열 생성, 모든 코드가 번들에 포함          │
│     → RSC: RSC Payload 생성, Server Component 코드는 번들 제외│
│     → 실무에서 RSC + SSR이 결합하여 동작                     │
│                                                               │
│  3. "use client" = Server/Client 경계를 선언한다              │
│     → 경계 위 = Server, 경계 아래 = Client                   │
│     → 최소한의 범위에만 적용하는 것이 핵심                    │
│     → 경계를 트리의 "잎" 쪽으로 밀어내린다                    │
│                                                               │
│  4. 번들 크기가 획기적으로 감소한다                            │
│     → 서버 전용 라이브러리(마크다운 파서 등)가 번들에 불포함   │
│     → Client Component만 Hydration → TTI 단축                │
│     → 상품 100개를 표시해도 번들 크기는 동일                  │
│                                                               │
│  5. Server → Client로는 직렬화 가능한 Props만 전달             │
│     → 문자열, 숫자, 객체, 배열: ✅                           │
│     → 함수: ❌ (Server Action으로 대체)                      │
│     → Composition 패턴: Server Component를 children으로 전달  │
│                                                               │
│  6. Server Action = 클라이언트에서 서버 함수를 직접 호출       │
│     → "use server" 지시어로 표시                              │
│     → API Route 없이 서버 로직 호출                          │
│     → 폼 제출, 데이터 변경에 활용                             │
│     → 빌드 도구가 자동으로 엔드포인트 생성                    │
│                                                               │
│  7. 기본 원칙: 가능하면 Server Component 유지                 │
│     → 상호작용이 필요한 최소 범위만 "use client"              │
│     → 데이터 표시만 하는 컴포넌트 → Server                   │
│     → Hook/이벤트가 필요한 컴포넌트 → Client                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                            | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | Server Component에서 할 수 있고 Client Component에서 할 수 없는 것 2가지는?     | Remember   | 2.2         |
| 2   | RSC와 SSR의 핵심적 차이를 "번들 포함 여부"와 "결과물 형태" 관점에서 설명하라    | Understand | 3.1         |
| 3   | "use client"가 "경계"를 선언한다는 의미를 트리 구조로 설명하라                  | Understand | 3.3         |
| 4   | Server Component에서 Client Component로 함수를 Props로 전달할 수 없는 이유는?   | Understand | 3.4         |
| 5   | Server Component를 Client Component의 children으로 전달하는 것이 가능한 이유는? | Analyze    | 3.6         |
| 6   | 마크다운 파서(200KB)를 사용하는 블로그 페이지에서 RSC의 번들 크기 이점은?       | Analyze    | 3.7         |
| 7   | Server Action이 기존 API Route를 대체하는 방식을 코드 수준에서 비교하라         | Apply      | 3.5         |
| 8   | "use client"를 모든 파일에 붙이면 어떤 문제가 발생하는가?                       | Evaluate   | 3.3         |

### 6.3 FAQ

**Q1. Server Component와 SSR은 둘 다 서버에서 실행되는데, 실제로 어떻게 다른가요?**

SSR은 모든 컴포넌트를 서버에서 "미리 렌더링"하여 HTML을 만드는 것이고, 이후 클라이언트에서 동일한 컴포넌트 코드가 다시 실행(Hydration)된다. 즉 코드가 서버와 클라이언트 양쪽에서 실행된다. Server Component는 오직 서버에서만 실행되며 클라이언트 번들에 코드가 포함조차 되지 않는다. "서버에서 미리 실행한다" vs "서버에서만 실행되고 클라이언트에는 결과만 전달한다"의 차이다.

**Q2. "use client"를 최상위 layout에 붙이면 안 되나요?**

붙일 수는 있지만 RSC의 모든 이점을 포기하는 것과 같다. 최상위에 "use client"를 붙이면 그 하위의 모든 컴포넌트가 Client Component가 되어 번들에 포함된다. "use client"는 상호작용이 꼭 필요한 가장 작은 컴포넌트에만 선언하는 것이 올바른 패턴이다.

**Q3. Server Action은 기존 API Route보다 항상 더 나은가요?**

대부분의 데이터 변경(Create/Update/Delete) 작업에는 Server Action이 더 간결하고 타입 안전하다. 그러나 외부 서비스(Webhook 수신, OAuth 콜백 등)에서 호출받는 엔드포인트나 다양한 HTTP 메서드(GET/PUT/DELETE)를 명시적으로 구분해야 하는 REST API 설계에는 Route Handler(route.js)가 적합하다.

**Q4. RSC는 React 18에서만 사용할 수 있나요?**

RSC는 React 18+의 기능이며, 번들러 통합도 필요하다. 현재 실용적으로 사용하려면 Next.js 13.4 이상의 App Router, 또는 Remix의 특정 버전이 필요하다. 순수 Vite + React 환경에서는 RSC를 사용할 수 없다.

**Q5. Server Component에서 Context API를 사용할 수 있나요?**

Server Component에서는 React Context를 사용할 수 없다. Context는 클라이언트 사이드 상태 공유 메커니즘이기 때문이다. 서버에서 데이터를 여러 컴포넌트에 전달하려면 props를 통해 전달하거나, 각 Server Component에서 독립적으로 데이터를 조회하는 방식을 사용한다. Next.js는 동일한 요청에서의 중복 fetch를 자동으로 중복 제거(deduplication)하므로 성능 걱정 없이 각각 조회할 수 있다.

---

## 7. 다음 단계 예고

> **Step 21. Next.js App Router 핵심**
>
> - Next.js의 파일 시스템 기반 라우팅
> - layout.js, page.js, loading.js, error.js 규약
> - Server Component가 기본값인 환경에서의 개발
> - Data Fetching: fetch + 캐싱 전략
> - Server Actions 실전 활용
> - Parallel Routes, Intercepting Routes

---

## 📚 참고 자료

- [React 공식 문서 — Server Components](https://react.dev/reference/rsc/server-components)
- [React 공식 문서 — "use client"](https://react.dev/reference/rsc/use-client)
- [React 공식 문서 — "use server"](https://react.dev/reference/rsc/use-server)
- [React 공식 문서 — Server Actions](https://react.dev/reference/rsc/server-actions)
- [Next.js 공식 문서 — Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Dan Abramov — RSC From Scratch](https://github.com/reactwg/server-components/discussions/5)
- [Vercel — Understanding React Server Components](https://vercel.com/blog/understanding-react-server-components)

---

> **React 완성 로드맵 v2.0** | Phase 3 — 라우팅과 데이터 레이어 | Step 20 of 42
