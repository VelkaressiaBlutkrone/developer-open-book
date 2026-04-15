# Step 40. 배포 전략과 CI/CD

> **난이도:** 🔴 고급 (Advanced)

> **Phase 7 — 빌드·배포·프로덕션 (Step 39~42)**
> 빌드, 배포, 프로덕션 운영으로 앱을 완성한다

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                          |
| -------------- | ------------------------------------------------------------- |
| **Remember**   | 정적 호스팅, 컨테이너 배포, CDN의 역할을 기술할 수 있다       |
| **Understand** | CSR 앱과 SSR 앱의 배포 아키텍처 차이를 설명할 수 있다         |
| **Apply**      | GitHub Actions로 CI/CD 파이프라인을 구축할 수 있다            |
| **Analyze**    | 환경별 배포 전략(스테이징/프로덕션)의 필요성을 분석할 수 있다 |
| **Evaluate**   | 프로젝트에 적합한 호스팅 플랫폼과 배포 전략을 판단할 수 있다  |

**전제 지식:**

- Step 19: CSR, SSR, SSG 렌더링 전략
- Step 37: CI/CD에서의 테스트 자동화
- Step 39: Vite 빌드, 환경 변수, 빌드 결과물

---

## 1. 서론 — "코드를 사용자에게 전달하는 마지막 단계"

### 1.1 배포가 중요한 이유

소프트웨어 개발의 최종 목적은 코드가 실제 사용자에게 전달되어 가치를 창출하는 것이다. 아무리 뛰어난 기능과 완벽한 코드라도 사용자에게 도달하지 못하면 의미가 없다. 배포(Deployment)는 개발 산출물이 사용자 환경에서 실행되도록 만드는 모든 과정을 의미하며, 현대 소프트웨어 개발에서 배포의 품질은 서비스 안정성과 팀의 생산성을 직접적으로 결정한다.

2000년대 초반까지 배포는 수동으로 수행되는 위험한 작업이었다. 개발자가 FTP로 파일을 직접 서버에 복사하거나, 밤새 배포 작업을 진행하는 것이 일반적이었다. 이 시기에는 배포 실패가 곧 서비스 중단을 의미했고, 한 번 배포한 이후 문제가 발생하면 원인 파악과 롤백에 수 시간이 소요되었다. 이러한 고통스러운 경험들이 CI/CD(Continuous Integration / Continuous Delivery) 개념의 탄생을 이끌었다.

CI/CD는 배포를 자동화하고 안전하게 만들기 위한 철학과 실천 방법의 집합이다. 코드 변경이 발생할 때마다 자동으로 빌드하고 테스트하여 문제를 즉시 감지하며, 검증을 통과한 코드만 자동으로 배포한다. 이를 통해 팀은 하루에 수십 번도 안전하게 배포할 수 있게 되었으며, "배포가 무섭지 않다"는 문화가 형성되어 작은 변경을 자주 릴리스하는 방식으로 전환되었다.

### 1.2 배포 자동화의 산업적 가치

Netflix, Amazon, Google 등 대형 기술 기업들은 하루에 수천 번의 배포를 수행한다. 이것이 가능한 이유는 배포 파이프라인이 철저히 자동화되어 있기 때문이다. DORA(DevOps Research and Assessment) 연구에 따르면, 배포 빈도가 높은 고성과 팀은 그렇지 않은 팀에 비해 리드 타임(코드 커밋에서 프로덕션 배포까지 시간)이 최대 2,555배 빠르며, 서비스 복구 시간은 2,604배 빠르다.

개인 개발자와 소규모 팀에게도 자동화된 배포 파이프라인은 핵심 경쟁력이다. 수동 배포에 소요되던 시간을 절약하고, 사람의 실수로 인한 장애를 예방하며, 언제든 빠르게 롤백할 수 있는 안전망이 생긴다. 현대의 클라우드 플랫폼(Vercel, Netlify, AWS)은 이러한 배포 자동화를 매우 저렴하게, 심지어 무료로 제공한다.

```
배포가 잘못되면:
  · 빌드는 성공했지만 환경 변수가 개발용 → API 호출 실패
  · 새 버전 배포 후 심각한 버그 발견 → 롤백 불가
  · 수동 배포 → 사람의 실수 → 장애
  · 배포에 1시간 소요 → 하루 배포 횟수 제한 → 느린 릴리스

배포가 잘 되면:
  · 코드 머지 → 자동 빌드 → 자동 테스트 → 자동 배포
  · 문제 발생 → 즉시 롤백 (이전 버전으로 복원)
  · 하루에 여러 번 안전하게 배포 가능
  · "배포가 무섭지 않다" → 작은 변경을 자주 → 품질 향상
```

### 1.3 배포 전략 개념 지도

이 Step에서 다루는 개념들의 관계를 전체 구조로 파악한다.

![react-step40-deploy-concept-map](/developer-open-book/diagrams/react-step40-deploy-concept-map.svg)

### 1.4 이 Step에서 다루는 범위

![react-step40-scope](/developer-open-book/diagrams/react-step40-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 CI (Continuous Integration) — 지속적 통합

CI는 팀원들이 각자 작업한 코드를 자주(하루에 여러 번) 공유 저장소에 통합하고, 통합할 때마다 자동으로 빌드와 테스트를 실행하는 개발 방식이다. 2000년대 초 Martin Fowler와 Kent Beck이 익스트림 프로그래밍(XP)의 핵심 실천 방법으로 제시했다.

CI가 해결하는 근본적인 문제는 "통합 지옥(Integration Hell)"이다. 각자 며칠씩 코드를 작성하다가 한꺼번에 합치면 충돌과 호환성 문제가 폭발적으로 발생한다. CI는 이 통합 주기를 극단적으로 줄여서, 충돌이 발생하더라도 작은 범위에서 즉시 발견하고 해결할 수 있도록 한다.

React 프로젝트에서 CI는 ESLint(코드 품질), TypeScript(타입 안전성), Vitest(단위 테스트), Playwright(E2E 테스트)를 자동으로 실행하는 파이프라인으로 구현된다. PR이 생성될 때마다 이 파이프라인이 실행되어 "이 코드를 머지해도 안전한가?"를 자동으로 판단한다.

```
CI의 핵심 가치:
  · 조기 발견: 코드 병합 전에 문제를 자동으로 감지
  · 빠른 피드백: 개발자가 문제를 즉시 인지하고 수정
  · 신뢰 구축: "CI가 통과하면 기본 품질이 보장된다"는 신뢰
  · 브랜치 보호: 검증되지 않은 코드의 main 진입 차단
```

### 2.2 CD (Continuous Delivery / Deployment) — 지속적 배포

CD는 CI를 확장하여 테스트를 통과한 코드를 자동으로 프로덕션(또는 스테이징)에 배포하는 방식이다. Continuous Delivery는 "언제든 배포 가능한 상태 유지"를, Continuous Deployment는 "테스트 통과 즉시 자동 배포"를 의미한다.

CD의 핵심 아이디어는 배포를 "희귀하고 위험한 이벤트"에서 "일상적이고 안전한 작업"으로 전환하는 것이다. 배포가 자주 일어날수록 각 배포의 변경 범위가 작아지고, 문제 발생 시 원인을 특정하기 쉬워진다. 반대로 배포가 드물수록 한 번에 많은 변경이 누적되어 배포 위험도가 높아진다.

```
Continuous Delivery vs Deployment:

  Delivery:
    자동화 범위: CI → Staging 자동 배포
    프로덕션 배포: 수동 승인 후 진행
    적합한 경우: 프로덕션 배포에 사람의 판단이 필요한 팀

  Deployment:
    자동화 범위: CI → Staging → Production 전부 자동
    프로덕션 배포: 테스트 통과 즉시 자동
    적합한 경우: 테스트 커버리지가 충분하고 빠른 릴리스가 중요한 팀

  실용적 선택: 소규모 팀은 Deployment로 시작,
               팀이 커지면 Delivery(수동 승인)로 전환
```

### 2.3 정적 호스팅과 CDN

정적 호스팅은 서버 측 실행 없이 빌드된 HTML/JS/CSS 파일을 그대로 제공하는 방식이다. Vite로 빌드한 React SPA는 `dist/` 폴더에 정적 파일만 존재하므로 정적 호스팅이 가능하다. 서버 프로세스가 필요 없기 때문에 인프라가 단순하고 비용이 매우 낮다.

CDN(Content Delivery Network)은 전 세계 여러 곳에 엣지 서버를 두고 콘텐츠를 캐시하는 네트워크다. 서울 사용자는 서울 근처 엣지 서버에서, 뉴욕 사용자는 뉴욕 근처 엣지 서버에서 응답을 받는다. 물리적 거리가 가까울수록 네트워크 지연이 줄어들어 TTFB(Time to First Byte)가 개선된다.

![react-step40-static-hosting](/developer-open-book/diagrams/react-step40-static-hosting.svg)

### 2.4 컨테이너와 Docker

Docker 컨테이너는 애플리케이션과 그 실행에 필요한 모든 환경(Node.js 런타임, 의존성, 설정 파일 등)을 하나의 이미지로 패키징하는 기술이다. "내 PC에서는 되는데"라는 문제를 근본적으로 해결한다.

CSR 앱은 빌드 결과물이 정적 파일이므로 컨테이너가 필요 없다. 그러나 Next.js의 SSR(Server-Side Rendering)은 Node.js 서버가 요청마다 HTML을 생성해야 하므로 런타임 서버 환경이 필요하고, 이때 Docker 컨테이너가 유용하다. 컨테이너는 개발 환경과 프로덕션 환경의 차이를 없애주고, 수평 확장(여러 인스턴스 실행)을 쉽게 만든다.

```
컨테이너가 필요한 시점:

  필요 없음:
    · Vite + React (CSR): 빌드 결과 = 정적 파일
    · Next.js + output: 'export': 정적 내보내기

  필요함:
    · Next.js SSR/Server Actions: Node.js 서버 필요
    · Express API 서버와 함께 배포
    · 온프레미스/자체 서버 배포
    · Kubernetes 환경
```

### 2.5 롤백, Feature Flag, Preview 배포

롤백(Rollback)은 배포 후 심각한 문제가 발견되었을 때 이전 버전으로 빠르게 되돌리는 절차다. 롤백이 없거나 느리면 문제가 발생한 상태에서 핫픽스를 만들어야 하는 더 위험한 상황에 처하게 된다. "롤백이 쉬운 구조"를 미리 만들어두는 것이 안전한 배포의 핵심이다.

Feature Flag는 코드에 새 기능을 포함하되 플래그(환경 변수 또는 서버 설정)로 활성/비활성을 제어하는 기법이다. "배포(Deploy)와 릴리스(Release)를 분리"하는 핵심 전략으로, 코드를 프로덕션에 배포해두고 사용자에게는 점진적으로 노출할 수 있다. 문제 발생 시 재배포 없이 플래그만 꺼서 즉시 기능을 비활성화할 수 있다.

Preview 배포는 Pull Request마다 독립적인 URL로 배포하는 기능이다. 코드 리뷰 시 텍스트만 보는 것이 아니라 실제 동작하는 앱을 직접 확인할 수 있어 리뷰 품질이 크게 향상된다.

![react-step40-feature-flag-rollback](/developer-open-book/diagrams/react-step40-feature-flag-rollback.svg)

### 2.6 핵심 용어 사전

| 용어             | 정의                                                                                     | 왜 중요한가                                          |
| ---------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **CI**           | Continuous Integration. 코드 변경을 **자동으로 빌드·테스트**하는 프로세스                | 코드 머지 전에 문제를 자동 감지                      |
| **CD**           | Continuous Deployment/Delivery. 테스트 통과 후 **자동으로 배포**하는 프로세스            | 수동 배포 없이 안전한 릴리스                         |
| **정적 호스팅**  | 빌드된 HTML/JS/CSS를 **파일 서버/CDN에서 제공**하는 방식. 서버 로직 없음                 | CSR/SSG 앱에 적합. 가장 저렴하고 빠름                |
| **CDN**          | Content Delivery Network. 전 세계 엣지 서버에 **콘텐츠를 캐시**하여 가까운 서버에서 제공 | 사용자와 물리적으로 가까운 서버에서 응답 → 빠른 TTFB |
| **컨테이너**     | Docker로 앱과 런타임 환경을 **패키징**한 단위. 어디서든 동일하게 실행                    | SSR 앱에 필요. "내 PC에서는 되는데" 문제 해결        |
| **롤백**         | 배포 후 문제 발생 시 **이전 버전으로 되돌리는** 절차                                     | 장애 복구의 핵심. 배포에 대한 두려움 제거            |
| **Feature Flag** | 코드에 새 기능을 포함하되 **플래그로 활성/비활성을 제어**하는 기법                       | 배포와 릴리스를 분리. 위험 없이 점진적 릴리스        |
| **Preview 배포** | PR마다 **독립적인 URL로 배포**하여 머지 전에 확인하는 방식                               | 코드 리뷰 시 실제 동작을 확인 가능                   |

### 2.7 CSR vs SSR 배포 아키텍처

![react-step40-csr-vs-ssr](/developer-open-book/diagrams/react-step40-csr-vs-ssr.svg)

```
아키텍처 비교:

  CSR 배포 흐름:
    GitHub Push
      → CI 통과
      → dist/ 빌드
      → CDN 엣지에 파일 전파
      → 사용자 요청 → 가까운 엣지 응답 → 브라우저 렌더링

  SSR 배포 흐름:
    GitHub Push
      → CI 통과
      → .next/ 빌드
      → Node.js 서버 배포 (Vercel / Docker)
      → 사용자 요청 → 서버 HTML 생성 → 브라우저 수신
```

---

## 3. 이론과 원리

### 3.1 정적 호스팅 플랫폼 비교

![react-step40-vercel-deploy](/developer-open-book/diagrams/react-step40-vercel-deploy.svg)

#### Vercel 배포 (가장 간편)

```
Vercel 배포 절차:

  1. GitHub 레포지토리를 Vercel에 연결
  2. Vercel이 자동으로 프레임워크 감지 (Vite, Next.js)
  3. 빌드 명령어와 출력 디렉토리 자동 설정
  4. 환경 변수 입력 (Vercel 대시보드)
  5. 배포!

  이후:
  · main 브랜치에 Push → 자동 프로덕션 배포
  · PR 생성 → 자동 Preview 배포 (고유 URL)
  · 환경 변수: Production / Preview / Development 분리

SPA(Vite) 배포 설정:
  · Framework Preset: Vite
  · Build Command: npm run build
  · Output Directory: dist
  · SPA Fallback: 자동 (vercel.json 불필요)

Next.js 배포:
  · Framework Preset: Next.js (자동 감지)
  · SSR, SSG, ISR, Server Actions 모두 자동 지원 ★
  · Edge Runtime 자동 배포
```

### 3.2 Docker 컨테이너 배포 (SSR 앱)

#### Dockerfile 예시

```dockerfile
# ── Stage 1: 빌드 ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: 프로덕션 ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 필요한 파일만 복사 (이미지 크기 최소화)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

```
Docker 배포가 필요한 경우

  · SSR 앱 (Next.js를 Vercel 외에서 배포)
  · 커스텀 서버 로직이 필요한 경우
  · 온프레미스 또는 자체 인프라 배포
  · Kubernetes 환경

Docker 배포 대상:
  · AWS ECS (Elastic Container Service)
  · GCP Cloud Run
  · Azure Container Apps
  · 자체 서버 (docker-compose)
```

### 3.3 GitHub Actions CI/CD 파이프라인

#### CSR 앱 (Vite) 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ── 품질 검증 ──
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  # ── E2E 테스트 ──
  e2e:
    needs: quality # quality 통과 후에만 실행
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  # ── 배포 (main 브랜치만) ──
  deploy:
    needs: [quality, e2e] # 모든 테스트 통과 후에만
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
      # Vercel 자동 배포를 사용하면 이 단계 불필요
      # 또는 S3에 직접 업로드:
      # - run: aws s3 sync dist/ s3://my-bucket --delete
```

#### 파이프라인 흐름

```
PR 생성:
  ┌─ quality (lint + typecheck + test) — 1분
  │    ✅ 통과 → e2e 실행
  │    ❌ 실패 → 즉시 중단, 피드백
  │
  └─ e2e (Playwright) — 3분
       ✅ 통과 → "PR을 머지해도 안전" 표시
       ❌ 실패 → 머지 차단

main 머지:
  ┌─ quality — 1분
  ├─ e2e — 3분
  └─ deploy — 1분 (quality + e2e 통과 시에만)
       → 프로덕션 자동 배포!


총 시간:
  PR: ~4분 (quality + e2e 병렬 시 ~3분)
  배포: ~5분 (quality + e2e + deploy)

핵심: "모든 테스트 통과 → 자동 배포 → 사람 개입 없음" ★
```

### 3.4 환경별 배포 전략

```
3가지 환경

  Development (개발):
    · 각 개발자의 로컬 환경
    · npm run dev → localhost:3000
    · .env.development 사용
    · 모킹된 API 또는 로컬 백엔드

  Staging (스테이징):
    · 프로덕션과 동일한 구성의 테스트 환경
    · 실제 서버 + 테스트 데이터
    · main 머지 시 자동 배포
    · QA 팀이 최종 확인
    · URL: staging.myapp.com

  Production (프로덕션):
    · 실제 사용자가 접근하는 환경
    · staging 확인 후 수동 승인으로 배포 (또는 자동)
    · URL: myapp.com

환경별 환경 변수:
  Staging:   VITE_API_URL=https://staging-api.myapp.com
  Production: VITE_API_URL=https://api.myapp.com

  · Vercel: Environment Variables에서 환경별 분리 설정
  · GitHub Actions: secrets로 관리
```

```
배포 흐름 (3환경):

  개발 → PR → 코드 리뷰 → main 머지
    ↓
  Staging 자동 배포 → QA 확인
    ↓
  프로덕션 배포 (수동 승인 또는 자동)

  또는 간단한 버전:
  개발 → PR → main 머지 → 프로덕션 자동 배포 (staging 생략)
  · 소규모 팀에서 CI/CD 테스트가 충분하면 staging 없이도 가능
```

### 3.5 롤백 전략

```
"배포 후 문제가 발생하면 어떻게 하는가?"

  전략 1: 이전 버전으로 되돌리기
    · Vercel: 대시보드에서 이전 배포를 클릭 → "Promote to Production"
    · AWS S3: 이전 빌드 폴더를 다시 업로드
    · Docker: 이전 이미지 태그로 재배포
    · Git: main을 revert → CI/CD가 이전 코드를 자동 배포

  전략 2: 빠른 핫픽스
    · 문제가 명확하고 수정이 간단하면
    · 핫픽스 브랜치 → PR → 빠른 리뷰 → 머지 → 자동 배포
    · 롤백보다 빠를 수 있지만 위험도 있음

  전략 3: Feature Flag로 비활성화
    · 새 기능을 Feature Flag로 감싸놓았다면
    · 플래그만 끄면 기능이 즉시 비활성화 → 재배포 불필요 ★
    · 가장 빠른 대응 방법


  롤백 체크리스트:
    □ 문제의 심각도 판단 (전체 장애? 일부 기능?)
    □ 롤백이 가능한가? (DB 마이그레이션은 되돌릴 수 있는가?)
    □ 롤백 후 데이터 정합성은 유지되는가?
    □ 사용자에게 공지가 필요한가?

  원칙: "롤백이 쉬운 구조"를 미리 만들어 둔다
    · 이전 빌드를 항상 보관 (N-1 버전)
    · 배포 기록을 유지 (누가, 언제, 무엇을)
    · DB 마이그레이션은 되돌릴 수 있게 설계
```

### 3.6 Feature Flag

```
Feature Flag = "배포와 릴리스를 분리한다"

  기존 방식:
    새 기능 코드 작성 → 배포 = 즉시 모든 사용자에게 노출
    문제 발생 시 → 코드 수정 + 재배포 필요 (느림!)

  Feature Flag:
    새 기능 코드 작성 + 플래그로 감싸기 → 배포해도 비활성 상태
    플래그 활성화 → 선택적으로 사용자에게 노출
    문제 발생 → 플래그 비활성화 (재배포 불필요! 즉시!) ★


  구현 (간단한 버전):
    // 환경 변수 기반 Feature Flag
    const FEATURES = {
      newCheckout: import.meta.env.VITE_FEATURE_NEW_CHECKOUT === 'true',
      darkMode: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
    };

    function CheckoutPage() {
      if (FEATURES.newCheckout) {
        return <NewCheckoutFlow />;
      }
      return <LegacyCheckoutFlow />;
    }


  구현 (고급 — 런타임 제어):
    · LaunchDarkly, Unleash, Flagsmith 등 서비스
    · 서버에서 플래그 값을 가져와 런타임에 결정
    · 사용자별, 그룹별, 비율별 점진적 롤아웃
    · A/B 테스트와 결합

  적합한 시나리오:
    · 대규모 기능 출시 (결제 리뉴얼, UI 개편)
    · A/B 테스트 (어떤 UI가 전환율이 높은가?)
    · 점진적 롤아웃 (1% → 10% → 50% → 100%)
    · 긴급 비활성화 (기능에 버그 발생 시 즉시 끄기)
```

### 3.7 배포 모니터링과 알림

```
배포 후 반드시 확인해야 하는 것

  1. Health Check
     · 배포 직후 핵심 URL이 정상 응답하는가?
     · / → 200, /api/health → 200
     · 자동화: 배포 스크립트에 curl 체크 포함

  2. 에러 모니터링
     · Sentry, Datadog 등으로 실시간 에러 추적
     · 배포 후 에러율이 급증하면 알림 → 즉시 대응
     · "이전 배포 대비 에러율 비교"

  3. 성능 모니터링
     · Core Web Vitals(LCP, INP, CLS) 추적
     · 배포 후 성능 저하 감지

  4. 알림
     · 배포 성공/실패 → Slack/Teams 알림
     · 에러율 급증 → 긴급 알림
     · CI/CD 실패 → PR 작성자에게 알림


  배포 후 체크리스트:
    □ 핵심 페이지가 정상 로드되는가?
    □ API 연동이 올바르게 동작하는가?
    □ 환경 변수가 프로덕션 값인가?
    □ 에러 모니터링에 새 에러가 없는가?
    □ 성능이 이전 배포와 동등한가?
```

---

## 4. 사례 연구와 예시

### 4.1 사례: Vite SPA를 Vercel에 배포

```
절차:
  1. GitHub 레포지토리 생성 + 코드 Push
  2. Vercel 가입 → "Import Project" → GitHub 레포 선택
  3. Framework: Vite 자동 감지
  4. Environment Variables:
     - VITE_API_URL = https://api.myapp.com
  5. Deploy!

결과:
  · 프로덕션: https://myapp.vercel.app
  · PR Preview: https://myapp-pr-42.vercel.app (PR마다 자동!)
  · main 푸시 → 자동 프로덕션 배포 (~30초)
  · 롤백: 대시보드에서 이전 배포 선택 → 즉시!

비용: 개인 프로젝트 → 무료
```

### 4.2 사례: CI/CD가 프로덕션 버그를 방지한 사례

```
시나리오:
  · 개발자가 "사소한 CSS 수정" PR을 생성
  · 실수로 import 경로를 잘못 변경
  · 로컬에서는 동작 (HMR 캐시 때문)

CI 파이프라인:
  1. ESLint → ✅ 통과
  2. TypeScript → ❌ 실패!
     "Module not found: '@/features/product/ProductCard'"
     (올바른 경로: '@/features/products/ProductCard')
  → PR에 빨간 X 표시 → 머지 차단!

만약 CI가 없었다면:
  · 머지 → 프로덕션 배포 → 빌드 실패 → 배포 장애!
  · 또는: 빌드는 성공했지만 런타임 에러 → 사용자 영향

CI가 30초 만에 1시간의 장애를 방지
```

### 4.3 사례: Feature Flag로 안전한 점진적 릴리스

```
시나리오: 결제 페이지 리뉴얼

  1주차: 새 결제 코드를 Feature Flag 뒤에 배포 (비활성)
         → 코드는 프로덕션에 있지만 아무도 볼 수 없음

  2주차: 내부 직원에게만 활성화 → 내부 테스트
         FEATURES.newCheckout = user.isInternal ? true : false

  3주차: 전체 사용자의 5%에게 활성화 → A/B 테스트
         → 전환율, 에러율 비교

  4주차: 문제 없으면 50% → 100%로 확대

  만약 3주차에 문제 발견:
    → Feature Flag OFF → 즉시 전체 사용자가 기존 결제 사용
    → 재배포 불필요! ★
    → 코드 수정 후 다시 점진적 롤아웃
```

### 4.4 사례: 금요일 오후 배포 장애와 롤백

```
시나리오: 금요일 오후 4시에 새 결제 기능 배포

  · 배포 직후 Sentry 알림: "결제 페이지 에러율 15% 급증"
  · 원인 파악에 시간이 걸릴 것으로 판단

  즉각 대응 (Feature Flag 없는 경우):
    1. Vercel 대시보드 → Deployments → 이전 버전 선택
    2. "Promote to Production" 클릭
    3. 2분 이내 롤백 완료 → 에러율 정상화

  즉각 대응 (Feature Flag 있는 경우):
    1. 플래그 서버에서 newCheckout = false 설정
    2. 30초 이내 모든 사용자가 기존 결제 사용
    3. 주말 동안 원인 분석 후 월요일 재배포

  교훈:
    · 금요일 오후는 최대한 배포를 피한다
    · 롤백 절차를 사전에 팀과 공유하고 연습한다
    · Feature Flag는 "비상 브레이크"가 된다
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: GitHub Actions CI 파이프라인 [Applying]

**목표:** PR마다 자동 검증하는 CI를 구축한다.

```
요구사항:
  · .github/workflows/ci.yml 작성
  · 트리거: push(main), pull_request(main)
  · 단계: checkout → setup-node → npm ci → lint → typecheck → test
  · 캐싱: node_modules 캐시 (actions/cache 또는 setup-node cache)
  · PR에 체크 결과 표시 (✅/❌)

검증:
  · 린트 에러가 있는 PR → CI 실패 확인
  · 테스트 실패 PR → CI 실패 확인
  · 모든 통과 PR → CI 성공 확인
```

---

### 실습 2: 환경별 빌드 + 배포 설정 [Applying]

**목표:** 환경별로 다른 설정으로 빌드한다.

```
요구사항:
  · .env.development: VITE_API_URL=http://localhost:8080/api
  · .env.staging: VITE_API_URL=https://staging-api.example.com
  · .env.production: VITE_API_URL=https://api.example.com
  · 빌드 명령어:
    - npm run build → production
    - npm run build -- --mode staging → staging
  · 각 환경에서 빌드 후 import.meta.env.VITE_API_URL 값 확인
  · (선택) Vercel에 배포하고 환경 변수 설정
```

---

### 실습 3: Feature Flag 구현 [Applying · Analyzing]

**목표:** 간단한 Feature Flag 시스템을 구현한다.

```
요구사항:
  · 환경 변수 기반 Feature Flag 설정:
    VITE_FEATURE_NEW_HEADER=true
    VITE_FEATURE_DARK_MODE=false
  · useFeatureFlag('newHeader') Custom Hook 구현
  · 플래그에 따라 다른 컴포넌트 렌더링
  · 개발/프로덕션에서 다른 플래그 값 설정

분석:
  · 환경 변수 기반의 한계 (빌드 시점 결정, 런타임 변경 불가)
  · "런타임 Feature Flag 서비스가 필요한 시점"
```

---

### 실습 4 (선택): 배포 전략 설계 [Evaluating]

**목표:** 프로젝트에 맞는 배포 전략을 설계한다.

```
시나리오: 이커머스 앱 (Next.js)

설계할 것:
  1. 호스팅 플랫폼 선택과 근거
  2. 환경 구성 (Development / Staging / Production)
  3. CI/CD 파이프라인 설계:
     - PR: 어떤 검증?
     - main 머지: 어디에 배포?
     - 프로덕션: 어떤 조건으로 배포?
  4. 롤백 전략
  5. Feature Flag 적용 대상 (어떤 기능에?)
  6. 모니터링 전략 (무엇을 추적?)
  7. 예상 배포 소요 시간 (코드 머지 → 프로덕션)
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 40 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. CSR = 정적 호스팅(CDN), SSR = 서버/컨테이너 필요         │
│     → Vite SPA: Vercel, Netlify, S3+CloudFront               │
│     → Next.js SSR: Vercel(최적) 또는 Docker                 │
│     → SPA는 Fallback 라우팅 설정 필수                        │
│                                                               │
│  2. Vercel = 가장 간편한 배포                                 │
│     → Git 연동 → Push = 자동 배포                            │
│     → PR마다 Preview 배포 (고유 URL)                         │
│     → 환경 변수 분리 (Production / Preview)                  │
│     → 롤백: 대시보드에서 이전 배포 선택                      │
│                                                               │
│  3. GitHub Actions CI/CD = 자동 빌드·테스트·배포              │
│     → lint → typecheck → test → e2e → deploy               │
│     → 모든 테스트 통과 시에만 배포 (자동 게이트)             │
│     → PR에서 빠른 피드백, main에서 자동 배포                 │
│                                                               │
│  4. 환경 분리: Development → Staging → Production             │
│     → 환경별 .env + Vercel/GitHub Secrets                    │
│     → 프로덕션과 동일한 Staging에서 QA                       │
│     → 가능하면 자동, 위험한 변경은 수동 승인                 │
│                                                               │
│  5. 롤백 = 배포에 대한 두려움을 제거한다                      │
│     → 이전 버전으로 즉시 복원 가능한 구조                    │
│     → Vercel: 이전 배포 Promote                              │
│     → Docker: 이전 이미지 태그                               │
│     → Feature Flag: 가장 빠른 비활성화 (재배포 불필요)       │
│                                                               │
│  6. Feature Flag = 배포와 릴리스를 분리한다                   │
│     → 코드 배포 ≠ 사용자 노출                               │
│     → 점진적 롤아웃, A/B 테스트, 긴급 비활성화              │
│     → 간단: 환경 변수, 고급: LaunchDarkly 등 서비스          │
│                                                               │
│  7. 배포 후 모니터링은 필수이다                               │
│     → Health Check, 에러 모니터링, 성능 모니터링             │
│     → 배포 성공/실패 + 에러 급증 시 알림                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                           | 블룸 단계  | 확인할 섹션 |
| --- | -------------------------------------------------------------- | ---------- | ----------- |
| 1   | CSR 앱과 SSR 앱의 배포 아키텍처 차이는?                        | Understand | 2.7         |
| 2   | SPA를 정적 호스팅할 때 Fallback 라우팅이 필요한 이유는?        | Understand | 2.7         |
| 3   | Vercel의 Preview 배포가 코드 리뷰에 기여하는 방식은?           | Understand | 3.1         |
| 4   | CI 파이프라인에서 lint → typecheck → test → e2e 순서의 이유는? | Analyze    | 3.3         |
| 5   | Feature Flag가 "배포와 릴리스를 분리한다"는 의미는?            | Understand | 3.6         |
| 6   | 롤백이 쉬운 구조를 미리 만들어 두는 방법 3가지는?              | Apply      | 3.5         |
| 7   | Staging 환경이 필요한 이유와 생략 가능한 조건은?               | Evaluate   | 3.4         |
| 8   | 소규모 팀에서 가장 간편한 배포 전략은?                         | Evaluate   | 3.1, 4.1    |

### 6.3 FAQ

**Q1. Vercel 무료 티어로 프로덕션 서비스를 운영할 수 있나요?**

Vercel의 Hobby(무료) 플랜은 개인 프로젝트와 소규모 서비스에 충분하다. 대역폭 100GB/월, Edge Function 실행 시간, 팀 협업 기능 등에 제한이 있지만, 대부분의 학습 프로젝트와 소규모 서비스는 무료 티어 내에서 운영 가능하다. 상업적 프로젝트나 팀 개발은 Pro 플랜($20/월)을 고려한다.

**Q2. CI/CD 파이프라인에서 E2E 테스트가 너무 느려서 배포가 지연됩니다. 어떻게 해결하나요?**

E2E 테스트 병렬화가 가장 효과적이다. Playwright는 `--workers` 옵션으로 여러 브라우저 인스턴스를 병렬 실행할 수 있다. 또는 E2E 테스트를 배포와 분리하여 "배포 후 검증" 단계로 이동시키는 방법도 있다. PR 시에는 빠른 단위 테스트만 실행하고, 배포는 이를 통과한 코드를 스테이징에 먼저 배포한 뒤 E2E를 실행하는 전략이 현실적이다.

**Q3. Feature Flag를 환경 변수로 구현하면 런타임에 바꿀 수 없나요?**

맞다. `import.meta.env.VITE_*` 환경 변수는 빌드 시점에 번들에 포함되므로 배포 없이는 변경할 수 없다. 런타임 제어가 필요하면 LaunchDarkly, Unleash, Flagsmith 같은 서비스를 사용해야 한다. 이 서비스들은 API를 통해 실시간으로 플래그 값을 변경할 수 있으며, A/B 테스트와 점진적 롤아웃도 지원한다.

**Q4. Docker 없이 Next.js SSR을 Vercel이 아닌 곳에 배포할 수 있나요?**

Node.js 서버가 있는 환경이라면 가능하다. `npm run build && npm start`로 Next.js 서버를 직접 실행할 수 있다. 다만 프로세스 관리(PM2), 환경 변수 주입, 무중단 배포 등을 직접 구성해야 한다. Docker는 이 복잡성을 캡슐화하여 재현 가능한 배포 환경을 만든다. Railway, Render 같은 플랫폼도 Node.js 앱을 Docker 없이 간편하게 배포하는 옵션이다.

**Q5. 작은 프로젝트에서 Staging 환경이 정말 필요한가요?**

반드시 필요하지는 않다. 1~2인 팀이고 CI/CD 테스트 커버리지가 충분하며, 빠른 롤백이 가능한 구조라면 Staging 없이 main → production 자동 배포로도 충분하다. Staging이 필요한 시점은 QA 팀이 생기거나, 배포 전 비기술 이해관계자의 확인이 필요하거나, DB 마이그레이션 같이 롤백이 어려운 변경이 자주 발생할 때다.

---

## 7. 다음 단계 예고

> **Step 41. 프로덕션 모니터링과 에러 추적**
>
> - 에러 모니터링 (Sentry 통합)
> - 성능 모니터링 (Core Web Vitals 수집)
> - 로깅 전략
> - 사용자 분석 (Analytics 기초)
> - Source Map과 에러 디버깅

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Netlify 공식 문서](https://docs.netlify.com/)
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Docker — Getting Started](https://docs.docker.com/get-started/)
- [Vite — Deploying a Static Site](https://vite.dev/guide/static-deploy.html)
- [Next.js — Deploying](https://nextjs.org/docs/app/building-your-application/deploying)
- [LaunchDarkly — Feature Flags](https://launchdarkly.com/)
- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [DORA 메트릭스](https://dora.dev/)

---

> **React 완성 로드맵 v2.0** | Phase 7 — 빌드·배포·프로덕션 | Step 40 of 42
