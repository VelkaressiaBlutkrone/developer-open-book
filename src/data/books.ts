import type { Book } from '../types'

export const SPINE_COLORS = [
  '#6b1c2a', '#1B4F72', '#1a3a2a', '#4a1942',
  '#8B2635', '#2c5f2d', '#7D3C98', '#935116',
  '#1A5276', '#6b3a2a', '#2d4a1e', '#4a2c5f',
  '#703030', '#285f5c', '#5c3d6b', '#6b4f1a',
]

export function seedFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function getBookVisual(id: string) {
  const seed = seedFromId(id)
  const color = SPINE_COLORS[seed % SPINE_COLORS.length]
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return {
    height: 200,
    thickness: 26 + (seed % 22),
    color,
    coverColor: `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`,
  }
}

const BASE = import.meta.env.BASE_URL

export const BOOKS: Book[] = [
  // ── Dart ──
  { id: 'dart-roadmap', title: 'Dart 로드맵 개요', step: 'Overview', category: 'dart', contentFile: `${BASE}content/dart/dart-roadmap-overview.md` },
  { id: 'dart-01', title: 'Dart 개요 및 환경 구축', step: 'Step 01', category: 'dart', contentFile: `${BASE}content/dart/dart-step01-overview-and-setup.md` },
  { id: 'dart-02', title: '변수와 데이터 타입', step: 'Step 02', category: 'dart', contentFile: `${BASE}content/dart/dart-step02-variables-and-types.md` },
  { id: 'dart-03', title: '연산자와 조건문', step: 'Step 03', category: 'dart', contentFile: `${BASE}content/dart/dart-step03-operators-and-conditionals.md` },
  { id: 'dart-04', title: '반복문', step: 'Step 04', category: 'dart', contentFile: `${BASE}content/dart/dart-step04-loops.md` },
  { id: 'dart-05', title: '함수', step: 'Step 05', category: 'dart', contentFile: `${BASE}content/dart/dart-step05-functions.md` },
  { id: 'dart-06', title: '컬렉션', step: 'Step 06', category: 'dart', contentFile: `${BASE}content/dart/dart-step06-collections.md` },
  { id: 'dart-07', title: '컬렉션 심화', step: 'Step 07', category: 'dart', contentFile: `${BASE}content/dart/dart-step07-collections-advanced.md` },
  { id: 'dart-08', title: '클래스와 객체', step: 'Step 08', category: 'dart', contentFile: `${BASE}content/dart/dart-step08-classes-and-objects.md` },
  { id: 'dart-09', title: '생성자', step: 'Step 09', category: 'dart', contentFile: `${BASE}content/dart/dart-step09-constructors.md` },
  { id: 'dart-10', title: 'OOP 상속', step: 'Step 10', category: 'dart', contentFile: `${BASE}content/dart/dart-step10-oop-extends.md` },
  { id: 'dart-11', title: 'Mixin', step: 'Step 11', category: 'dart', contentFile: `${BASE}content/dart/dart-step11-mixins.md` },
  { id: 'dart-12', title: 'Enum', step: 'Step 12', category: 'dart', contentFile: `${BASE}content/dart/dart-step12-enums.md` },
  { id: 'dart-13', title: '예외 처리', step: 'Step 13', category: 'dart', contentFile: `${BASE}content/dart/dart-step13-exception-handling.md` },
  { id: 'dart-14', title: 'Async / Future / Stream', step: 'Step 14', category: 'dart', contentFile: `${BASE}content/dart/dart-step14-async-future-stream.md` },
  { id: 'dart-15', title: 'Isolate', step: 'Step 15', category: 'dart', contentFile: `${BASE}content/dart/dart-step15-isolates.md` },
  { id: 'dart-16', title: '제네릭', step: 'Step 16', category: 'dart', contentFile: `${BASE}content/dart/dart-step16-generics.md` },
  { id: 'dart-17', title: 'Extension', step: 'Step 17', category: 'dart', contentFile: `${BASE}content/dart/dart-step17-extensions.md` },
  { id: 'dart-18', title: 'Sealed & Patterns', step: 'Step 18', category: 'dart', contentFile: `${BASE}content/dart/dart-step18-sealed-patterns.md` },
  { id: 'dart-19', title: 'Record', step: 'Step 19', category: 'dart', contentFile: `${BASE}content/dart/dart-step19-records.md` },
  { id: 'dart-20', title: '함수형 프로그래밍', step: 'Step 20', category: 'dart', contentFile: `${BASE}content/dart/dart-step20-functional.md` },
  { id: 'dart-21', title: '테스트', step: 'Step 21', category: 'dart', contentFile: `${BASE}content/dart/dart-step21-testing.md` },
  { id: 'dart-22', title: '패키지', step: 'Step 22', category: 'dart', contentFile: `${BASE}content/dart/dart-step22-packages.md` },

  // ── React ──
  { id: 'react-00', title: '완성 로드맵', step: 'Step 00', category: 'react', contentFile: `${BASE}content/react/react-step00.md` },
  { id: 'react-01', title: '개발 환경 설치와 프로젝트 구조', step: 'Step 01', category: 'react', contentFile: `${BASE}content/react/react-step01.md` },
  { id: 'react-02', title: '모던 JavaScript 필수 문법', step: 'Step 02', category: 'react', contentFile: `${BASE}content/react/react-step02-JavaScript.md` },
  { id: 'react-03', title: 'React 생태계 조감도', step: 'Step 03', category: 'react', contentFile: `${BASE}content/react/react-step03-React.md` },
  { id: 'react-04', title: 'JSX와 컴포넌트 실행 모델', step: 'Step 04', category: 'react', contentFile: `${BASE}content/react/react-step04-JSX.md` },
  { id: 'react-05', title: 'Props와 단방향 데이터 흐름', step: 'Step 05', category: 'react', contentFile: `${BASE}content/react/react-step05-Props.md` },
  { id: 'react-06', title: 'useState와 렌더 사이클', step: 'Step 06', category: 'react', contentFile: `${BASE}content/react/react-step06-useState.md` },
  { id: 'react-07', title: 'Reconciliation과 Key 전략', step: 'Step 07', category: 'react', contentFile: `${BASE}content/react/react-step07-Reconciliation-Key.md` },
  { id: 'react-08', title: 'Form과 Synthetic Event', step: 'Step 08', category: 'react', contentFile: `${BASE}content/react/react-step08-Form-Synthetic-Event.md` },
  { id: 'react-09', title: '조건부 렌더링과 리스트 패턴', step: 'Step 09', category: 'react', contentFile: `${BASE}content/react/react-step09.md` },
  { id: 'react-10', title: 'React 내부 구조 심층 분석', step: 'Step 10', category: 'react', contentFile: `${BASE}content/react/react-step10-React.md` },
  { id: 'react-11', title: 'useEffect 완전 이해', step: 'Step 11', category: 'react', contentFile: `${BASE}content/react/react-step11-useEffect.md` },
  { id: 'react-12', title: 'useRef와 DOM 접근 전략', step: 'Step 12', category: 'react', contentFile: `${BASE}content/react/react-step12-useRef-DOM.md` },
  { id: 'react-13', title: 'useReducer와 상태 머신 설계', step: 'Step 13', category: 'react', contentFile: `${BASE}content/react/react-step13-useReducer.md` },
  { id: 'react-14', title: '메모이제이션 전략', step: 'Step 14', category: 'react', contentFile: `${BASE}content/react/react-step14.md` },
  { id: 'react-15', title: 'React 18/19 신규 Hooks', step: 'Step 15', category: 'react', contentFile: `${BASE}content/react/react-step15-React-18-19-Hooks.md` },
  { id: 'react-16', title: 'Custom Hook 설계 패턴', step: 'Step 16', category: 'react', contentFile: `${BASE}content/react/react-step16-Custom-Hook.md` },
  { id: 'react-17', title: 'Error Handling 아키텍처', step: 'Step 17', category: 'react', contentFile: `${BASE}content/react/react-step17-Error-Handling.md` },
  { id: 'react-18', title: 'React Router v6 심화', step: 'Step 18', category: 'react', contentFile: `${BASE}content/react/react-step18-ReactRouter-v6.md` },
  { id: 'react-19', title: '렌더링 전략 비교 분석', step: 'Step 19', category: 'react', contentFile: `${BASE}content/react/react-step19.md` },
  { id: 'react-20', title: 'React Server Components', step: 'Step 20', category: 'react', contentFile: `${BASE}content/react/react-step20-React-Server-Components.md` },
  { id: 'react-21', title: 'Next.js App Router 핵심', step: 'Step 21', category: 'react', contentFile: `${BASE}content/react/react-step21-NextJS-App-Router.md` },
  { id: 'react-22', title: 'REST API 통합과 데이터 패칭', step: 'Step 22', category: 'react', contentFile: `${BASE}content/react/react-step22-REST-API.md` },
  { id: 'react-23', title: 'TanStack Query', step: 'Step 23', category: 'react', contentFile: `${BASE}content/react/react-step23-TanStack-Query.md` },
  { id: 'react-24', title: 'API 계층 설계와 에러 처리', step: 'Step 24', category: 'react', contentFile: `${BASE}content/react/react-step24-API.md` },
  { id: 'react-25', title: 'Context API 심화', step: 'Step 25', category: 'react', contentFile: `${BASE}content/react/react-step25-Context-API.md` },
  { id: 'react-26', title: '전역 상태 관리 Zustand', step: 'Step 26', category: 'react', contentFile: `${BASE}content/react/react-step26-Zustand.md` },
  { id: 'react-27', title: '컴포넌트 설계 패턴', step: 'Step 27', category: 'react', contentFile: `${BASE}content/react/react-step27.md` },
  { id: 'react-28', title: '프로젝트 구조와 아키텍처', step: 'Step 28', category: 'react', contentFile: `${BASE}content/react/react-step28.md` },
  { id: 'react-29', title: '성능 최적화 심화', step: 'Step 29', category: 'react', contentFile: `${BASE}content/react/react-step29.md` },
  { id: 'react-30', title: 'Suspense 아키텍처와 고급 패턴', step: 'Step 30', category: 'react', contentFile: `${BASE}content/react/react-step30-Suspense.md` },
  { id: 'react-31', title: 'TypeScript와 React 통합', step: 'Step 31', category: 'react', contentFile: `${BASE}content/react/react-step31-TypeScript-React.md` },
  { id: 'react-32', title: 'React Hook Form과 Zod 검증', step: 'Step 32', category: 'react', contentFile: `${BASE}content/react/react-step32-React-Hook-Form-Zod.md` },
  { id: 'react-33', title: '폼 UX 패턴과 접근성', step: 'Step 33', category: 'react', contentFile: `${BASE}content/react/react-step33-UX.md` },
  { id: 'react-34', title: 'CSS 전략과 스타일링 아키텍처', step: 'Step 34', category: 'react', contentFile: `${BASE}content/react/react-step34-CSS.md` },
  { id: 'react-35', title: '국제화(i18n)와 접근성(a11y)', step: 'Step 35', category: 'react', contentFile: `${BASE}content/react/react-step35-i18n-a11y.md` },
  { id: 'react-36', title: '컴포넌트 테스트 RTL', step: 'Step 36', category: 'react', contentFile: `${BASE}content/react/react-step36-RTL.md` },
  { id: 'react-37', title: 'E2E 테스트와 테스트 전략', step: 'Step 37', category: 'react', contentFile: `${BASE}content/react/react-step37-E2E.md` },
  { id: 'react-38', title: '코드 품질과 개발 도구', step: 'Step 38', category: 'react', contentFile: `${BASE}content/react/react-step38.md` },
  { id: 'react-39', title: 'Vite 빌드 시스템 심화', step: 'Step 39', category: 'react', contentFile: `${BASE}content/react/react-step39-Vite.md` },
  { id: 'react-40', title: '배포 전략과 CI/CD', step: 'Step 40', category: 'react', contentFile: `${BASE}content/react/react-step40-CICD.md` },
  { id: 'react-41', title: '프로덕션 모니터링과 에러 추적', step: 'Step 41', category: 'react', contentFile: `${BASE}content/react/react-step41.md` },
  { id: 'react-42', title: '종합 프로젝트와 로드맵 마무리', step: 'Step 42', category: 'react', contentFile: `${BASE}content/react/react-step42.md` },
]
