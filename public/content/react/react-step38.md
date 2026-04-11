# Step 38. 코드 품질과 개발 도구

> **Phase 6 — 테스트와 품질 보증 (Step 36~38)**
> 테스트와 품질 보증으로 앱의 신뢰성을 확보한다 — **Phase 6 마무리**

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| **Remember**   | ESLint, Prettier, Husky, lint-staged의 역할을 기술할 수 있다                         |
| **Understand** | 린팅(정적 분석)과 포매팅이 코드 품질에 기여하는 원리를 설명할 수 있다                |
| **Apply**      | ESLint + Prettier + Husky를 설정하여 자동 코드 품질 관리 파이프라인을 구축할 수 있다 |
| **Analyze**    | 코드 리뷰에서 확인해야 하는 항목과 자동화할 수 있는 항목을 구분할 수 있다            |
| **Evaluate**   | Phase 6 전체를 통합하여 프로젝트의 품질 보증 전략을 설계할 수 있다                   |

**전제 지식:**

- Step 28: 프로젝트 구조, 모듈 경계
- Step 36: 컴포넌트 테스트 (RTL)
- Step 37: E2E 테스트, CI/CD

---

## 1. 서론 — "코드 품질은 자동화한다"

### 1.1 코드 품질 도구의 역사적 배경

소프트웨어 개발에서 코드 품질 문제는 프로그래밍의 역사만큼 오래되었다. 1970년대 Unix 시대에 Stephen Johnson이 작성한 `lint` 도구가 C 코드의 잠재적 오류를 정적으로 분석한 것이 현대 린터의 시초다. "lint"라는 이름 자체가 옷에 붙은 보풀(lint)을 떼내듯 코드의 잡티를 제거한다는 의미를 담고 있다.

JavaScript 생태계에서는 2002년 Douglas Crockford의 JSLint가 등장하며 JS 코드 품질 도구의 역사가 시작됐다. 이후 2011년 JSHint, 2013년 ESLint로 진화하면서 더 유연하고 확장 가능한 구조를 갖추게 됐다. 특히 ESLint는 플러그인 시스템을 통해 React, TypeScript, 접근성(a11y) 등 생태계 특화 규칙을 손쉽게 추가할 수 있어 현재 JavaScript 표준 린터로 자리잡았다.

코드 포매팅 분야에서는 2017년 Prettier의 등장이 혁명적이었다. 기존에는 팀마다 코딩 스타일 가이드를 작성하고 개발자들이 이를 수동으로 준수해야 했다. Prettier는 "의견이 강한(opinionated)" 포매터를 표방하며, 스타일에 관한 모든 결정을 도구가 내리고 개발자는 그 결정을 따르기만 하면 된다는 패러다임을 제시했다. 수많은 팀에서 벌어지던 "탭 vs 스페이스", "세미콜론 유무" 논쟁이 Prettier 하나로 종결되었다.

### 1.2 코드 품질 자동화의 산업적 가치

코드 품질 자동화의 가치는 단순한 스타일 일관성을 넘어 조직의 생산성과 직결된다. Accelerate(2018, Forsgren et al.) 연구에 따르면, 자동화된 품질 검사를 갖춘 팀은 그렇지 않은 팀 대비 코드 리뷰 사이클이 평균 30% 단축되고, 프로덕션 버그 발생률이 유의미하게 낮다.

자동화 도구가 스타일, 린트, 타입 오류를 코드 작성 시점에서 잡아주면, 코드 리뷰어는 아키텍처, 비즈니스 로직, 엣지 케이스와 같이 자동화할 수 없는 고수준의 문제에 집중할 수 있다. 이는 코드 리뷰의 질을 높이고, 리뷰어의 인지 부하를 줄여 더 깊이 있는 검토가 가능하게 한다.

특히 팀 규모가 커질수록 코드 스타일 일관성의 가치는 기하급수적으로 증가한다. 5명이 일하는 팀에서는 구두로 스타일 합의가 가능하지만, 50명이 협업하는 팀에서는 자동화 없이 일관성을 유지하는 것이 사실상 불가능하다. Netflix, Airbnb, Facebook 등의 대형 기술 기업들이 강력한 린트 규칙셋을 공개 배포하는 것도 이 이유에서다.

### 1.3 코드 품질 도구 생태계 개념 지도

```
코드 품질 자동화 생태계 전체 개관
=====================================================================

  [역사적 계보]

  1978: Unix lint (C 언어 정적 분석의 시초)
     │
  2002: JSLint (Douglas Crockford)
     │
  2011: JSHint (더 유연한 설정)
     │
  2013: ESLint ─────────── (현재 표준 JS 린터)
     │
  2017: Prettier ─────────── (코드 포매팅 혁명)

  [도구별 역할]

  ESLint                Prettier              Husky + lint-staged
  ────────────          ────────────          ──────────────────────
  "코드 품질"           "코드 스타일"          "자동화 트리거"
  잠재적 버그 감지      포매팅 자동 적용       커밋 시 품질 보장
  안티패턴 경고         스타일 논쟁 종결       변경 파일만 검사

  [자동화 계층 구조]

  즉시 (IDE)          커밋 시              PR/CI 시           리뷰 시
  ──────────          ──────────           ──────────         ──────────
  ESLint 경고         Husky 훅 실행        전체 린트/타입      설계/로직
  Prettier 포맷       lint-staged 처리     테스트 실행         엣지 케이스
  TS 타입 검사        자동 수정            E2E 테스트          보안 검토
  (0초)               (수 초)              (수 분)             (가변)

  [상호 보완 관계]

  ESLint ──(충돌 방지)──▶ eslint-config-prettier ──▶ Prettier
     │
     └──(훅)──▶ Husky ──▶ lint-staged ──▶ 변경 파일만 ESLint + Prettier
```

### 1.4 코드 품질의 두 축

```
축 1: 자동으로 검증할 수 있는 것
  · 코드 스타일 일관성 (세미콜론, 따옴표, 들여쓰기)
  · 잠재적 버그 패턴 (미사용 변수, 누락된 의존성)
  · TypeScript 타입 오류
  · 접근성 위반 (a11y 린트)
  · 테스트 통과 여부
  → 도구로 자동화하여 "사람이 신경 쓰지 않아도" 보장

축 2: 사람이 판단해야 하는 것
  · 아키텍처 적절성 (이 코드가 여기에 있는 게 맞는가?)
  · 네이밍 품질 (변수명, 함수명이 의도를 전달하는가?)
  · 복잡도 (이 로직을 더 단순하게 만들 수 있는가?)
  · 비즈니스 로직 정확성 (요구사항을 올바르게 구현했는가?)
  · 엣지 케이스 처리 (고려하지 않은 상황이 있는가?)
  → 코드 리뷰에서 사람이 확인

원칙: "자동화할 수 있는 것은 자동화하고,
       사람은 자동화할 수 없는 것에 집중한다" ★
```

### 1.5 이 Step에서 다루는 범위

```
┌─────────────────────────────────────────────────────────┐
│  다루는 것                                               │
│  · ESLint 설정과 핵심 규칙                               │
│  · Prettier 설정과 ESLint 통합                           │
│  · Husky + lint-staged (Git Hook 자동화)                │
│  · 코드 리뷰 체크리스트                                   │
│  · Storybook 개요 (컴포넌트 문서화)                      │
│  · 코드 품질 자동화 파이프라인 전체 설계                  │
│  · Phase 6 전체 통합 복습                                │
├─────────────────────────────────────────────────────────┤
│  다루지 않는 것                                          │
│  · Storybook 설정/플러그인 상세                          │
│  · SonarQube 등 정적 분석 서버                           │
│  · 모노레포 린트 설정                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어            | 정의                                                                            | 왜 중요한가                                                 |
| --------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **ESLint**      | JavaScript/TypeScript **정적 분석 도구**. 코드 패턴의 문제를 검출하고 자동 수정 | 잠재적 버그, 안티패턴, 접근성 문제를 코드 작성 시점에 발견  |
| **Prettier**    | 코드 **포매팅 전용 도구**. 일관된 코드 스타일을 자동으로 적용                   | 스타일 논쟁 종결. "세미콜론을 쓸까 말까" → Prettier가 결정  |
| **Husky**       | Git Hook을 **쉽게 설정**하는 도구. 커밋/푸시 전에 스크립트를 자동 실행          | 커밋 전 린트/포맷/테스트를 자동으로 실행하여 나쁜 코드 방지 |
| **lint-staged** | Git **스테이징된 파일에만** 린트/포맷을 실행하는 도구                           | 전체 프로젝트가 아닌 변경된 파일만 처리 → 빠른 커밋         |
| **Storybook**   | UI 컴포넌트를 **독립적으로 개발·테스트·문서화**하는 도구                        | 컴포넌트 카탈로그, 시각적 테스트, 디자이너 협업             |
| **코드 리뷰**   | 다른 개발자가 코드 변경을 **검토하고 피드백**하는 프로세스                      | 자동화가 잡지 못하는 설계·로직 문제를 발견                  |

### 2.2 ESLint의 핵심 설계 원리

ESLint가 다른 린터와 차별화되는 핵심은 **AST(Abstract Syntax Tree) 기반 분석**과 **플러그인 아키텍처**다.

코드를 실행하지 않고 구조적으로 분석하는 정적 분석(Static Analysis)은 소스 코드를 파싱하여 추상 구문 트리(AST)로 변환한 뒤, 각 노드를 규칙에 따라 검사한다. 예를 들어 `react-hooks/rules-of-hooks` 규칙은 AST를 순회하며 Hook 호출이 조건문이나 반복문 내부에 있는지를 탐지한다. 이는 코드를 실행하지 않아도 "실행했을 때 발생할 문제"를 예측할 수 있게 한다.

플러그인 아키텍처 덕분에 ESLint는 JavaScript의 범위를 훨씬 넘어 확장 가능하다. `eslint-plugin-react-hooks`는 React의 Hook 규칙을, `eslint-plugin-jsx-a11y`는 접근성 표준을, `typescript-eslint`는 TypeScript 타입 시스템을 린트 규칙으로 표현한다. 커뮤니티가 만든 플러그인들이 수천 개에 달하며, 각 팀의 도메인 특화 규칙도 플러그인으로 만들 수 있다.

### 2.3 Prettier의 "의견이 강한 포매터" 철학

Prettier가 "opinionated formatter"를 표방하는 이유는 스타일 논쟁의 종결에 있다. 스타일 설정 옵션이 많을수록 팀 내 논쟁도 많아진다. Prettier는 의도적으로 설정 옵션을 최소화하고 특정 스타일을 강제함으로써 "어떻게 쓸 것인가" 대신 "무엇을 쓸 것인가"에 팀이 집중하도록 유도한다.

Prettier와 ESLint의 역할 분리는 중요하다. ESLint는 "이 코드가 올바른가"(품질)를 판단하고, Prettier는 "이 코드가 어떻게 생겼는가"(스타일)를 결정한다. 두 도구가 겹치는 영역(예: 세미콜론 규칙)에서 충돌이 발생할 수 있으므로 `eslint-config-prettier`로 ESLint의 스타일 관련 규칙을 비활성화하여 Prettier에 위임한다.

### 2.4 Git Hook과 자동화의 원리

Git Hook은 특정 Git 이벤트(커밋, 푸시 등) 발생 시 자동으로 실행되는 스크립트다. Git이 기본 제공하는 기능이지만, `.git/hooks/` 디렉토리의 스크립트를 직접 관리하면 팀 공유가 어렵다. Husky는 이 문제를 해결한다. Husky는 Git Hook 스크립트를 프로젝트 루트의 `.husky/` 디렉토리에 저장하여 Git으로 버전 관리하고 팀 전체가 공유할 수 있게 한다.

lint-staged는 Husky와 짝을 이루는 도구다. `git commit` 시 전체 프로젝트를 린트하면 수 분이 걸릴 수 있지만, lint-staged는 Git 스테이징 영역에 올라온 파일만 처리하므로 수 초 만에 완료된다. "변경한 파일만 검사"라는 단순한 아이디어가 커밋 속도를 대폭 개선한다.

### 2.5 도구 역할 분담

```
┌─────────────────────────────────────────────────────────────┐
│               코드 품질 도구 체인                              │
│                                                              │
│  코드 작성 시 (IDE):                                         │
│    ESLint → 실시간 경고/에러 표시 (빨간 밑줄)                │
│    Prettier → 저장 시 자동 포맷팅                            │
│    TypeScript → 실시간 타입 검사                             │
│                                                              │
│  커밋 시 (Git Hook):                                        │
│    Husky → pre-commit 훅 실행                               │
│    lint-staged → 변경 파일만 린트 + 포맷                    │
│                                                              │
│  PR/Push 시 (CI/CD):                                        │
│    ESLint → 전체 프로젝트 린트                               │
│    TypeScript → 전체 타입 체크                               │
│    Vitest/RTL → 단위/통합 테스트                             │
│    Playwright → E2E 테스트                                  │
│    → 모든 것이 통과해야 머지/배포 가능                      │
│                                                              │
│  코드 리뷰 시 (사람):                                       │
│    → 아키텍처, 네이밍, 복잡도, 비즈니스 로직 검토           │
│    → 자동화된 것은 이미 통과 → 고수준에 집중 ★              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 이론과 원리

### 3.1 ESLint — 정적 분석

#### 설정 (Flat Config — ESLint v9+)

```javascript
// eslint.config.js (Flat Config 형식)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // React Hooks 규칙 (필수!)
      "react-hooks/rules-of-hooks": "error", // Hook 규칙 위반 = 에러
      "react-hooks/exhaustive-deps": "warn", // 의존성 배열 누락 = 경고

      // 접근성 규칙
      "jsx-a11y/alt-text": "error", // img에 alt 필수
      "jsx-a11y/anchor-is-valid": "error", // a 태그에 유효한 href
      "jsx-a11y/click-events-have-key-events": "warn", // 클릭에 키보드 대안

      // TypeScript 규칙
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // 일반 규칙
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  prettierConfig, // Prettier와 충돌하는 ESLint 규칙 비활성화 (마지막에!)
];
```

#### 핵심 ESLint 규칙

```
React 개발에서 반드시 활성화해야 하는 규칙

  react-hooks/rules-of-hooks: 'error'
    · Hook을 조건문/반복문 안에서 호출하면 에러 ★
    · Step 6에서 배운 "Hook 규칙"을 자동으로 강제

  react-hooks/exhaustive-deps: 'warn'
    · useEffect/useMemo/useCallback의 의존성 배열 누락 경고
    · Step 11에서 배운 "의존성 배열" 문제를 자동 감지

  jsx-a11y/*
    · Step 33, 35에서 배운 접근성 규칙을 코드 시점에서 강제
    · img에 alt 없으면 에러, button에 텍스트 없으면 경고

  @typescript-eslint/no-unused-vars
    · 사용하지 않는 변수/import를 감지
    · 코드 정리에 필수

  @typescript-eslint/no-explicit-any
    · any 사용을 경고 → unknown이나 구체적 타입 사용 유도
    · Step 31에서 배운 타입 안전성 원칙 강제
```

### 3.2 Prettier — 코드 포매팅

#### 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

```
// .prettierignore
node_modules
dist
build
coverage
*.min.js
pnpm-lock.yaml
```

```
ESLint와 Prettier의 역할 분담

  ESLint: "코드 품질" (잠재적 버그, 안티패턴)
    · 미사용 변수, Hook 규칙, 접근성 위반
    · "이 코드는 문제가 있을 수 있다"

  Prettier: "코드 스타일" (포매팅)
    · 세미콜론, 따옴표, 들여쓰기, 줄 길이
    · "이 코드는 이렇게 생겨야 한다"

  통합 원칙:
    · eslint-config-prettier: Prettier와 충돌하는 ESLint 규칙을 비활성화
    · ESLint는 품질만, Prettier는 스타일만 담당
    · 두 도구가 충돌하지 않도록 설정

  "스타일 논쟁"의 종결:
    · "세미콜론을 쓸까?" → Prettier가 결정
    · "들여쓰기 2칸? 4칸?" → Prettier가 결정
    · 팀원 간 스타일 차이로 인한 불필요한 diff 제거
    · 코드 리뷰에서 "여기 세미콜론 빠졌네요" 같은 피드백 불필요
```

### 3.3 Husky + lint-staged — Git Hook 자동화

#### 설정

```bash
# Husky 설치 및 초기화
npm install -D husky lint-staged
npx husky init

# .husky/pre-commit 파일 생성됨
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```
Git Hook 자동화 흐름

  개발자가 git commit 실행
    │
    ▼
  Husky: pre-commit 훅 실행
    │
    ▼
  lint-staged: 스테이징된 파일만 처리
    │
    ├── *.ts, *.tsx 파일:
    │     1. eslint --fix (자동 수정 가능한 문제 해결)
    │     2. prettier --write (포맷팅)
    │     → 수정된 파일이 자동으로 스테이징에 추가
    │
    └── *.css, *.json, *.md 파일:
          1. prettier --write (포맷팅)
    │
    ▼
  모든 것이 통과? → 커밋 성공!
  ESLint 에러 발견? → 커밋 실패! (수정 후 재시도)


이점:
  · 나쁜 코드가 저장소에 절대 들어가지 않는다 ★
  · 전체 프로젝트가 아닌 변경 파일만 검사 → 빠름
  · 개발자가 "린트 돌려야지" 하고 잊어버릴 일이 없음
  · CI에서 린트 실패로 빌드가 깨지는 상황 방지
```

### 3.4 코드 리뷰 체크리스트

```
코드 리뷰에서 사람이 확인해야 하는 것
(자동화가 이미 처리한 것은 제외)

  ┌─────────────────────────────────────────────────────┐
  │  1. 설계와 아키텍처                                  │
  │     □ 이 코드가 올바른 위치(feature/shared)에 있는가?│
  │     □ 컴포넌트 경계가 적절한가?                      │
  │     □ 의존성 방향이 올바른가? (Step 28)              │
  │     □ 과도한 추상화나 부족한 추상화는 없는가?        │
  │                                                      │
  │  2. 네이밍과 가독성                                  │
  │     □ 변수/함수 이름이 의도를 명확히 전달하는가?     │
  │     □ 주석 없이도 코드를 이해할 수 있는가?           │
  │     □ 복잡한 로직에 설명이 있는가?                   │
  │                                                      │
  │  3. 비즈니스 로직                                    │
  │     □ 요구사항을 올바르게 구현했는가?                 │
  │     □ 엣지 케이스를 처리했는가?                      │
  │     □ 에러 처리가 적절한가?                          │
  │                                                      │
  │  4. 성능                                             │
  │     □ 불필요한 리렌더링이 있는가?                    │
  │     □ N+1 쿼리 문제가 있는가?                       │
  │     □ 큰 번들이 추가되었는가?                        │
  │                                                      │
  │  5. 테스트                                           │
  │     □ 변경에 대한 테스트가 포함되었는가?             │
  │     □ 테스트가 사용자 관점인가? (구현 세부사항 아닌) │
  │     □ 엣지 케이스 테스트가 있는가?                   │
  │                                                      │
  │  6. 보안                                             │
  │     □ 사용자 입력이 적절히 검증/이스케이프되는가?     │
  │     □ 비밀키가 코드에 하드코딩되지 않았는가?         │
  │     □ XSS, CSRF 취약점이 없는가?                    │
  │                                                      │
  └─────────────────────────────────────────────────────┘

  자동화가 이미 처리한 것 (리뷰에서 확인 불필요):
    ✅ 코드 스타일 (Prettier)
    ✅ 린트 규칙 (ESLint)
    ✅ 타입 안전성 (TypeScript)
    ✅ 테스트 통과 (CI)
    ✅ 접근성 기본 규칙 (eslint-plugin-jsx-a11y)
```

### 3.5 Storybook — 컴포넌트 문서화 (개요)

```
Storybook의 역할

  · 컴포넌트를 앱과 독립적으로 렌더링하고 확인하는 "카탈로그"
  · 디자이너와 개발자의 협업 도구
  · 컴포넌트의 다양한 상태(variant, size, error 등)를 시각적으로 확인
  · 시각적 회귀 테스트의 기반 (Chromatic 연동)
  · 컴포넌트 문서 자동 생성


Story 파일 예시:

  // Button.stories.tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { Button } from './Button';

  const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],     // 자동 문서 생성
  };
  export default meta;

  type Story = StoryObj<typeof Button>;

  export const Primary: Story = {
    args: { variant: 'primary', children: '저장' },
  };
  export const Secondary: Story = {
    args: { variant: 'secondary', children: '취소' },
  };
  export const Danger: Story = {
    args: { variant: 'danger', children: '삭제' },
  };
  export const Loading: Story = {
    args: { variant: 'primary', children: '처리 중...', isLoading: true },
  };
  export const Disabled: Story = {
    args: { variant: 'primary', children: '비활성', disabled: true },
  };


Storybook이 적합한 시점:
  · 디자인 시스템을 구축하는 팀
  · 컴포넌트가 20개+ 이상인 프로젝트
  · 디자이너와 협업이 빈번한 프로젝트
  · 시각적 회귀 테스트가 필요한 프로젝트

  소규모/개인 프로젝트에서는 선택적
```

### 3.6 코드 품질 자동화 파이프라인 전체 설계

```
완전한 코드 품질 파이프라인

  ┌──────────────────────────────────────────────────────┐
  │  단계 1: 코드 작성 (IDE)                              │
  │                                                       │
  │  · ESLint: 실시간 경고/에러 (VS Code ESLint 확장)    │
  │  · Prettier: 저장 시 자동 포맷 (Format on Save)      │
  │  · TypeScript: 실시간 타입 검사                      │
  │  → 즉시 피드백 (0초)                                │
  ├──────────────────────────────────────────────────────┤
  │  단계 2: 커밋 시 (Git Hook)                          │
  │                                                       │
  │  · Husky: pre-commit 훅                              │
  │  · lint-staged: 변경 파일만 ESLint + Prettier        │
  │  → 나쁜 코드의 커밋 차단 (수 초)                    │
  ├──────────────────────────────────────────────────────┤
  │  단계 3: PR 생성 시 (CI)                             │
  │                                                       │
  │  · ESLint: 전체 프로젝트 린트                        │
  │  · TypeScript: 전체 타입 체크                        │
  │  · Vitest + RTL: 단위/통합 테스트                    │
  │  · Playwright: 핵심 CUJ E2E 테스트                   │
  │  → 자동 검증 (수 분)                                │
  ├──────────────────────────────────────────────────────┤
  │  단계 4: 코드 리뷰 (사람)                            │
  │                                                       │
  │  · 설계, 네이밍, 비즈니스 로직, 보안 검토            │
  │  · 자동화가 통과한 상태 → 고수준에 집중              │
  │  → 지적 검토 (시간 가변)                            │
  ├──────────────────────────────────────────────────────┤
  │  단계 5: 머지 + 배포                                 │
  │                                                       │
  │  · 모든 자동 검사 통과 + 리뷰 승인 → 머지            │
  │  · main 브랜치: 전체 E2E + 크로스 브라우저            │
  │  · 배포: 모든 것이 통과해야만 가능                   │
  │  → 프로덕션 안전 보장                               │
  └──────────────────────────────────────────────────────┘
```

### 3.7 Phase 6 전체 통합 복습

```
Phase 6 (Step 36~38)에서 배운 것

  Step 36: 컴포넌트 테스트 (RTL)
           · "사용자처럼 테스트한다" — 구현이 아닌 행동 테스트
           · 쿼리 우선순위: getByRole > getByLabelText > getByText
           · userEvent로 상호작용, MSW로 API 모킹
           · renderHook으로 Custom Hook 테스트
           · "무엇을 테스트할 것인가" 전략

  Step 37: E2E 테스트와 테스트 전략
           · CUJ(핵심 흐름)만 E2E로 (5~10개)
           · Playwright: 크로스 브라우저, auto-wait, Trace
           · Page Object Model로 유지보수성 확보
           · Flaky 방지: 조건 기반 대기, 접근성 쿼리
           · CI/CD 파이프라인: 빠른 것 먼저, 단계적 실행

  Step 38: 코드 품질과 개발 도구 (이 Step)
           · ESLint: 정적 분석 (버그, Hook 규칙, 접근성)
           · Prettier: 코드 포매팅 (스타일 논쟁 종결)
           · Husky + lint-staged: 커밋 시 자동 검사
           · 코드 리뷰: 자동화가 못 잡는 설계/로직 검토
           · Storybook: 컴포넌트 문서화/카탈로그


  Phase 6의 핵심 메시지:
    "테스트로 동작을 보장하고 (RTL, Playwright)
     도구로 코드 품질을 자동화하고 (ESLint, Prettier, Husky)
     사람이 설계와 로직을 검토한다 (코드 리뷰)"

  Phase 7에서는 이 모든 기반 위에 빌드·배포·프로덕션 운영을 완성한다.
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 자동화 전후의 코드 품질

```
Before (자동화 없음):
  · 팀원 A: 세미콜론 사용, 2칸 들여쓰기
  · 팀원 B: 세미콜론 없음, 4칸 들여쓰기
  · PR diff: 실제 변경 10줄 + 스타일 차이 200줄!
  · 코드 리뷰: "여기 세미콜론 빠졌어요" × 50
  · console.log가 프로덕션에 포함됨
  · useEffect 의존성 배열 누락 → 무한 루프 버그

After (자동화 적용):
  · Prettier: 모든 코드가 동일한 스타일 → diff가 깔끔
  · ESLint: console.log 경고, 의존성 누락 경고
  · Husky: 린트 에러가 있으면 커밋 불가
  · 코드 리뷰: 스타일 피드백 0건 → 설계와 로직에 집중!
  · 버그가 코드 작성 시점에서 발견됨
```

### 4.2 사례: Husky가 프로덕션 버그를 방지한 사례

```
시나리오:
  · 개발자가 급하게 버그 수정 커밋
  · ESLint 경고를 무시하고 커밋하려 했지만...
  · Husky의 pre-commit 훅이 실행됨:
    "error: react-hooks/exhaustive-deps
     useEffect의 의존성 배열에 userId가 누락되었습니다"
  · 커밋 실패! → 개발자가 의존성을 추가
  · 이 누락이 프로덕션에 갔다면:
    · userId가 변해도 useEffect가 재실행되지 않음
    · 이전 사용자의 데이터가 표시되는 버그!
    · 사용자 신고 → 핫픽스 → 1시간 손실

  Husky가 30초 만에 1시간의 손실을 방지
```

### 4.3 사례: 코드 리뷰에서 자동화와 사람의 역할 분담

```
PR: "장바구니에 할인 쿠폰 적용 기능 추가"

  자동화가 검증 (CI):
    ✅ ESLint: 린트 통과
    ✅ TypeScript: 타입 검사 통과
    ✅ Tests: 15개 테스트 통과
    ✅ E2E: 결제 흐름 테스트 통과
    → "기본적으로 문제없다"가 보장된 상태에서 리뷰 시작

  리뷰어가 검토:
    · "할인 금액이 음수가 될 수 있는 엣지 케이스가 있다"
    · "이 로직은 cartService보다 orderService에 있는 게 맞지 않을까?"
    · "calculateDiscount 함수의 이름이 applyDiscount가 더 명확할 것 같다"
    · "할인율이 100%를 넘는 경우를 처리해야 한다"
    → 자동화가 못 잡는 설계/로직/엣지 케이스에 집중! ★
```

### 4.4 사례: ESLint v9 Flat Config 마이그레이션

2024년 ESLint v9에서 기존 `.eslintrc` 설정 방식이 레거시로 분류되고 "Flat Config"(eslint.config.js) 방식이 기본값이 됐다. 이 변경은 단순한 파일명 변경이 아닌 설정 모델의 근본적 변화다.

```
기존 방식 (.eslintrc) vs 새 방식 (Flat Config):

  기존 방식의 문제:
    · "extends"가 파일을 어디서 가져오는지 불명확
    · 플러그인 네이밍 규칙이 암묵적 (eslint-plugin- 접두사 자동 제거)
    · 설정 덮어쓰기 우선순위가 복잡하고 예측 어려움

  Flat Config의 개선:
    · 모든 것이 명시적 import (일반 JS 모듈처럼)
    · 설정이 배열 순서에 따라 적용 (예측 가능한 우선순위)
    · 플러그인 이름을 직접 지정 (자유로운 네이밍)

  마이그레이션 체감:
    · 초기 설정이 더 길어 보이지만 실제로는 더 명확
    · "왜 이 규칙이 적용되는가"를 추적하기 쉬움
    · TypeScript 타입 추론으로 설정 자동완성 지원
```

---

## 5. 실습

### 실습 1: ESLint + Prettier 설정 [Applying]

**목표:** 프로젝트에 린트와 포매팅을 설정한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · ESLint v9 Flat Config 설정:
    - TypeScript 지원
    - React Hooks 규칙
    - jsx-a11y 규칙
    - eslint-config-prettier (충돌 방지)
  · Prettier 설정 (.prettierrc):
    - 세미콜론, 싱글 쿼트, 트레일링 콤마, 2칸 들여쓰기
  · VS Code 설정:
    - 저장 시 ESLint 자동 수정
    - 저장 시 Prettier 자동 포맷
  · 의도적으로 린트 에러를 만들고 IDE에서 경고가 표시되는지 확인:
    - 미사용 변수
    - Hook 규칙 위반 (조건문 안에서 useState)
    - img에 alt 누락
```

---

### 실습 2: Husky + lint-staged 설정 [Applying]

**목표:** 커밋 시 자동으로 린트와 포맷을 실행한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · Husky 설치 및 pre-commit 훅 설정
  · lint-staged 설정:
    - .ts/.tsx: eslint --fix + prettier --write
    - .css/.json/.md: prettier --write
  · 테스트:
    1. 린트 에러가 있는 파일을 커밋 → 실패하는지 확인
    2. Prettier 미적용 파일을 커밋 → 자동 포맷 후 커밋되는지 확인
    3. 정상 코드를 커밋 → 성공하는지 확인
```

---

### 실습 3: 코드 리뷰 시뮬레이션 [Analyzing · Evaluating]

**목표:** 코드 리뷰 체크리스트를 적용하여 코드를 검토한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
과제:
  아래 PR 코드를 리뷰하라. 문제점을 최소 5가지 찾고 개선안을 제시하라.

  // features/cart/hooks/useDiscount.ts
  function useDiscount(cart: any, couponCode: string) {
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
      fetch('/api/coupons/' + couponCode)
        .then(r => r.json())
        .then(data => {
          let d = cart.total * data.rate;
          setDiscount(d);
        });
    }, [couponCode]);

    return discount;
  }

  리뷰 관점:
    □ 타입 안전성 (any 사용)
    □ Hook 의존성 (cart가 deps에 누락)
    □ 에러 처리 (fetch 실패 시)
    □ 보안 (couponCode 주입 위험)
    □ 네이밍 (d 변수명)
    □ 엣지 케이스 (rate가 1 초과, couponCode가 빈 문자열)
    □ 아키텍처 (fetch를 Hook에 직접?)
```

---

### 실습 4 (선택): 전체 품질 파이프라인 구축 [Creating]

**목표:** 프로젝트의 전체 코드 품질 파이프라인을 구축한다.

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

```
요구사항:
  · ESLint + Prettier + TypeScript 설정
  · Husky + lint-staged 설정
  · GitHub Actions CI 워크플로우:
    - lint → typecheck → test → e2e
  · 모든 것이 통과해야 PR 머지 가능 (branch protection)
  · README에 "개발 환경 설정" 문서화

검증:
  · 린트 에러 커밋 → 실패
  · 타입 에러 PR → CI 실패
  · 테스트 실패 PR → CI 실패
  · 모든 통과 PR → 머지 가능
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 38 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. ESLint = 코드 품질 정적 분석                              │
│     → Hook 규칙, 접근성 위반, 미사용 변수, any 사용 감지     │
│     → eslint-config-prettier로 Prettier와 충돌 방지          │
│     → IDE 실시간 경고 + CI 전체 검사                         │
│                                                               │
│  2. Prettier = 코드 스타일 자동 포매팅                        │
│     → 세미콜론, 따옴표, 들여쓰기 등 스타일 논쟁 종결         │
│     → 저장 시 자동 포맷 (Format on Save)                    │
│     → 코드 리뷰에서 스타일 피드백 제거                       │
│                                                               │
│  3. Husky + lint-staged = 커밋 시 자동 검증                   │
│     → pre-commit 훅: 변경 파일만 린트 + 포맷                │
│     → 나쁜 코드가 저장소에 들어가는 것을 원천 차단           │
│     → 개발자가 "잊어버릴" 걱정이 없다                       │
│                                                               │
│  4. 코드 리뷰 = 자동화가 못 잡는 것에 집중                   │
│     → 설계, 네이밍, 비즈니스 로직, 엣지 케이스, 보안         │
│     → 자동화(린트+타입+테스트)가 통과한 상태에서 시작        │
│     → 체크리스트로 일관된 리뷰 품질 유지                     │
│                                                               │
│  5. Storybook = 컴포넌트 문서화/카탈로그                      │
│     → UI 컴포넌트를 독립적으로 개발·확인                     │
│     → 디자이너 협업, 시각적 회귀 테스트 기반                 │
│     → 컴포넌트 20개+ 또는 디자인 시스템 구축 시 권장         │
│                                                               │
│  6. 코드 품질 5단계 파이프라인                                │
│     → IDE(즉시) → 커밋(수 초) → CI(수 분) → 리뷰 → 배포    │
│     → 각 단계가 다른 종류의 문제를 잡는다                    │
│     → "자동화할 수 있는 것은 자동화, 사람은 고수준에 집중"   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                            | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------- |
| 1   | ESLint와 Prettier의 역할 차이를 "품질 vs 스타일" 관점에서 설명하라              | Remember   | 3.2         |
| 2   | eslint-config-prettier가 필요한 이유는?                                         | Understand | 3.1         |
| 3   | Husky + lint-staged가 커밋 시 전체 프로젝트가 아닌 변경 파일만 검사하는 이유는? | Understand | 3.3         |
| 4   | react-hooks/exhaustive-deps 규칙이 방지하는 버그는?                             | Apply      | 3.1         |
| 5   | 코드 리뷰에서 "스타일 피드백"이 불필요한 이유는?                                | Analyze    | 3.4         |
| 6   | "자동화할 수 있는 것은 자동화한다"의 실천 방법 3가지는?                         | Apply      | 3.6         |
| 7   | Storybook이 적합한 프로젝트와 불필요한 프로젝트는?                              | Evaluate   | 3.5         |
| 8   | 코드 품질 5단계 파이프라인의 각 단계가 잡는 문제 종류는?                        | Evaluate   | 3.6         |

### 6.3 FAQ

**Q1. ESLint 규칙이 너무 많아서 어디서부터 시작해야 할지 모르겠습니다.**

처음에는 세 가지 규칙셋으로 시작하는 것을 권장한다. (1) `eslint:recommended`로 기본 JS 오류 감지, (2) `typescript-eslint/recommended`로 TypeScript 타입 관련 규칙, (3) `react-hooks/recommended`로 Hook 규칙 강제. 이 세 가지만으로도 프로덕션 버그의 상당 부분을 예방할 수 있다. 팀이 린트에 익숙해지면 `jsx-a11y`나 커스텀 규칙을 점진적으로 추가하면 된다.

**Q2. Husky로 커밋이 느려지는 것이 불편합니다. 어떻게 최적화하나요?**

lint-staged를 사용하면 변경된 파일만 검사하므로 전체 프로젝트 린트 대비 대폭 빠르다. 추가로 `eslint --cache` 옵션을 활용하면 변경되지 않은 파일의 캐시를 재사용하여 더욱 빠른 실행이 가능하다. 만약 정말 급할 때는 `git commit --no-verify`로 훅을 우회할 수 있지만, 이는 최후의 수단이어야 한다. CI에서 다시 검사하므로 나쁜 코드가 메인 브랜치에 영향을 주지는 않는다.

**Q3. 팀원 중 일부가 Husky를 우회(--no-verify)하는 경우 어떻게 해야 하나요?**

이는 기술적 문제가 아닌 팀 문화의 문제다. 코드 품질 도구의 존재 이유와 가치를 팀 전체가 공유하는 것이 선행되어야 한다. 동시에 CI에서 반드시 같은 검사를 수행하면, 훅을 우회한 코드도 PR 단계에서 반드시 걸리게 된다. 지속적으로 우회가 발생한다면 Husky의 검사가 너무 느리거나 불편한 것일 수 있으므로 먼저 도구 설정을 개선하는 것이 좋다.

**Q4. 코드 리뷰에서 어떤 것을 지적해야 하고, 어떤 것은 넘어가야 하나요?**

자동화가 처리하는 영역(스타일, 린트, 타입, 테스트 통과)은 리뷰에서 지적하지 않는 것이 원칙이다. 사람이 집중해야 할 것은 "이 코드가 올바른 일을 하는가", "더 나은 방법이 있는가", "미래의 팀원이 이 코드를 쉽게 이해하고 수정할 수 있는가"이다. 지적보다는 제안의 형태("이렇게 하면 어떨까요?")로 피드백하고, 모든 피드백이 반드시 변경을 요구하는 것은 아님을 명확히 하는 것이 좋은 리뷰 문화를 만든다.

**Q5. Storybook과 일반 컴포넌트 개발 중 무엇을 먼저 해야 하나요?**

"Storybook-first" 개발은 컴포넌트를 앱 컨텍스트와 독립적으로 설계하도록 강제하여 재사용성을 높인다는 장점이 있다. 하지만 팀이 Storybook에 익숙하지 않다면 오히려 개발 속도가 느려질 수 있다. 권장하는 접근: 신규 공통 컴포넌트(Button, Input, Modal 등)는 Storybook으로 먼저 개발하고, 페이지 특화 컴포넌트는 앱에서 직접 개발한다. Storybook은 "모든 것"에 쓰려 하기보다 공유 컴포넌트 라이브러리에 집중할 때 가장 효과적이다.

---

## 7. 다음 단계 예고

> **Phase 7 — 빌드·배포·프로덕션 (Step 39~42)**
>
> **Step 39. Vite 빌드 시스템 심화**
>
> - Vite의 개발 서버(ESBuild)와 프로덕션 빌드(Rollup) 동작 원리
> - 환경 변수, 빌드 설정, 플러그인
> - 번들 최적화(manualChunks, 코드 분할 전략)
>
> Phase 6에서 품질을 보장한 코드를,
> 이제 **빌드하고, 배포하고, 프로덕션에서 운영**한다.

---

## 📚 참고 자료

- [ESLint 공식 문서](https://eslint.org/)
- [ESLint — Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Prettier 공식 문서](https://prettier.io/)
- [Husky 공식 문서](https://typicode.github.io/husky/)
- [lint-staged GitHub](https://github.com/lint-staged/lint-staged)
- [Storybook 공식 문서](https://storybook.js.org/)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

---

> **React 완성 로드맵 v2.0** | Phase 6 — 테스트와 품질 보증 | Step 38 of 42 | **Phase 6 완료**
