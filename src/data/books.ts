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
  { id: 'dart-roadmap', title: 'Dart 로드맵 개요', step: 'Overview', category: 'dart', contentFile: `${BASE}content/dart/dart-roadmap-overview.md`, slug: 'dart-roadmap-overview' },
  { id: 'dart-01', title: 'Dart 개요 및 환경 구축', step: 'Step 01', category: 'dart', contentFile: `${BASE}content/dart/dart-step01-overview-and-setup.md`, slug: 'dart-step01-overview-and-setup' },
  { id: 'dart-02', title: '변수와 데이터 타입', step: 'Step 02', category: 'dart', contentFile: `${BASE}content/dart/dart-step02-variables-and-types.md`, slug: 'dart-step02-variables-and-types' },
  { id: 'dart-03', title: '연산자와 조건문', step: 'Step 03', category: 'dart', contentFile: `${BASE}content/dart/dart-step03-operators-and-conditionals.md`, slug: 'dart-step03-operators-and-conditionals' },
  { id: 'dart-04', title: '반복문', step: 'Step 04', category: 'dart', contentFile: `${BASE}content/dart/dart-step04-loops.md`, slug: 'dart-step04-loops' },
  { id: 'dart-05', title: '함수', step: 'Step 05', category: 'dart', contentFile: `${BASE}content/dart/dart-step05-functions.md`, slug: 'dart-step05-functions' },
  { id: 'dart-06', title: '컬렉션', step: 'Step 06', category: 'dart', contentFile: `${BASE}content/dart/dart-step06-collections.md`, slug: 'dart-step06-collections' },
  { id: 'dart-07', title: '컬렉션 심화', step: 'Step 07', category: 'dart', contentFile: `${BASE}content/dart/dart-step07-collections-advanced.md`, slug: 'dart-step07-collections-advanced' },
  { id: 'dart-08', title: '클래스와 객체', step: 'Step 08', category: 'dart', contentFile: `${BASE}content/dart/dart-step08-classes-and-objects.md`, slug: 'dart-step08-classes-and-objects' },
  { id: 'dart-09', title: '생성자', step: 'Step 09', category: 'dart', contentFile: `${BASE}content/dart/dart-step09-constructors.md`, slug: 'dart-step09-constructors' },
  { id: 'dart-10', title: 'OOP 상속', step: 'Step 10', category: 'dart', contentFile: `${BASE}content/dart/dart-step10-oop-extends.md`, slug: 'dart-step10-oop-extends' },
  { id: 'dart-11', title: 'Mixin', step: 'Step 11', category: 'dart', contentFile: `${BASE}content/dart/dart-step11-mixins.md`, slug: 'dart-step11-mixins' },
  { id: 'dart-12', title: 'Enum', step: 'Step 12', category: 'dart', contentFile: `${BASE}content/dart/dart-step12-enums.md`, slug: 'dart-step12-enums' },
  { id: 'dart-13', title: '예외 처리', step: 'Step 13', category: 'dart', contentFile: `${BASE}content/dart/dart-step13-exception-handling.md`, slug: 'dart-step13-exception-handling' },
  { id: 'dart-14', title: 'Async / Future / Stream', step: 'Step 14', category: 'dart', contentFile: `${BASE}content/dart/dart-step14-async-future-stream.md`, slug: 'dart-step14-async-future-stream' },
  { id: 'dart-15', title: 'Isolate', step: 'Step 15', category: 'dart', contentFile: `${BASE}content/dart/dart-step15-isolates.md`, slug: 'dart-step15-isolates' },
  { id: 'dart-16', title: '제네릭', step: 'Step 16', category: 'dart', contentFile: `${BASE}content/dart/dart-step16-generics.md`, slug: 'dart-step16-generics' },
  { id: 'dart-17', title: 'Extension', step: 'Step 17', category: 'dart', contentFile: `${BASE}content/dart/dart-step17-extensions.md`, slug: 'dart-step17-extensions' },
  { id: 'dart-18', title: 'Sealed & Patterns', step: 'Step 18', category: 'dart', contentFile: `${BASE}content/dart/dart-step18-sealed-patterns.md`, slug: 'dart-step18-sealed-patterns' },
  { id: 'dart-19', title: 'Record', step: 'Step 19', category: 'dart', contentFile: `${BASE}content/dart/dart-step19-records.md`, slug: 'dart-step19-records' },
  { id: 'dart-20', title: '함수형 프로그래밍', step: 'Step 20', category: 'dart', contentFile: `${BASE}content/dart/dart-step20-functional.md`, slug: 'dart-step20-functional' },
  { id: 'dart-21', title: '테스트', step: 'Step 21', category: 'dart', contentFile: `${BASE}content/dart/dart-step21-testing.md`, slug: 'dart-step21-testing' },
  { id: 'dart-22', title: '패키지', step: 'Step 22', category: 'dart', contentFile: `${BASE}content/dart/dart-step22-packages.md`, slug: 'dart-step22-packages' },

  // ── Flutter ──
  { id: 'flutter-roadmap', title: 'Flutter 학습 로드맵', step: 'Overview', category: 'flutter', contentFile: `${BASE}content/flutter/flutter.md`, slug: 'flutter' },
  { id: 'flutter-01', title: 'Flutter 아키텍처', step: 'Step 01', category: 'flutter', contentFile: `${BASE}content/flutter/step-01-flutter.md`, slug: 'step-01-flutter' },
  { id: 'flutter-02', title: 'Dart 언어 핵심', step: 'Step 02', category: 'flutter', contentFile: `${BASE}content/flutter/step-02-dart.md`, slug: 'step-02-dart' },
  { id: 'flutter-03', title: 'Flutter 개발 환경', step: 'Step 03', category: 'flutter', contentFile: `${BASE}content/flutter/step-03-flutter.md`, slug: 'step-03-flutter' },
  { id: 'flutter-04', title: 'Widget 개념', step: 'Step 04', category: 'flutter', contentFile: `${BASE}content/flutter/step-04-widget.md`, slug: 'step-04-widget' },
  { id: 'flutter-05', title: 'Stateless vs Stateful', step: 'Step 05', category: 'flutter', contentFile: `${BASE}content/flutter/step-05-statelesswidget-vs-statefulwidget.md`, slug: 'step-05-statelesswidget-vs-statefulwidget' },
  { id: 'flutter-06', title: 'Layout 시스템', step: 'Step 06', category: 'flutter', contentFile: `${BASE}content/flutter/step-06-layout.md`, slug: 'step-06-layout' },
  { id: 'flutter-07', title: '기본 UI 위젯', step: 'Step 07', category: 'flutter', contentFile: `${BASE}content/flutter/step-07-ui.md`, slug: 'step-07-ui' },
  { id: 'flutter-08', title: 'Material Design', step: 'Step 08', category: 'flutter', contentFile: `${BASE}content/flutter/step-08-material-design.md`, slug: 'step-08-material-design' },
  { id: 'flutter-09', title: '사용자 입력 처리', step: 'Step 09', category: 'flutter', contentFile: `${BASE}content/flutter/step-09.md`, slug: 'step-09' },
  { id: 'flutter-10', title: 'Form 시스템', step: 'Step 10', category: 'flutter', contentFile: `${BASE}content/flutter/step-10-form.md`, slug: 'step-10-form' },
  { id: 'flutter-11', title: 'Navigation 시스템', step: 'Step 11', category: 'flutter', contentFile: `${BASE}content/flutter/step-11-navigation.md`, slug: 'step-11-navigation' },
  { id: 'flutter-12', title: '상태관리 개념', step: 'Step 12', category: 'flutter', contentFile: `${BASE}content/flutter/step-12-flutter.md`, slug: 'step-12-flutter' },
  { id: 'flutter-13', title: 'setState', step: 'Step 13', category: 'flutter', contentFile: `${BASE}content/flutter/step-13-setstate.md`, slug: 'step-13-setstate' },
  { id: 'flutter-14', title: 'Provider 패턴', step: 'Step 14', category: 'flutter', contentFile: `${BASE}content/flutter/step-14-provider.md`, slug: 'step-14-provider' },
  { id: 'flutter-15', title: '고급 상태관리', step: 'Step 15', category: 'flutter', contentFile: `${BASE}content/flutter/step-15.md`, slug: 'step-15' },
  { id: 'flutter-16', title: 'Future / Async UI', step: 'Step 16', category: 'flutter', contentFile: `${BASE}content/flutter/step-16-future-async-ui.md`, slug: 'step-16-future-async-ui' },
  { id: 'flutter-17', title: 'HTTP 통신', step: 'Step 17', category: 'flutter', contentFile: `${BASE}content/flutter/step-17-http.md`, slug: 'step-17-http' },
  { id: 'flutter-18', title: '로컬 데이터 저장', step: 'Step 18', category: 'flutter', contentFile: `${BASE}content/flutter/step-18.md`, slug: 'step-18' },
  { id: 'flutter-19', title: 'Animation', step: 'Step 19', category: 'flutter', contentFile: `${BASE}content/flutter/step-19-animation.md`, slug: 'step-19-animation' },
  { id: 'flutter-20', title: 'Project Structure', step: 'Step 20', category: 'flutter', contentFile: `${BASE}content/flutter/step-20-flutter-project-structure.md`, slug: 'step-20-flutter-project-structure' },
  { id: 'flutter-21', title: 'Clean Architecture', step: 'Step 21', category: 'flutter', contentFile: `${BASE}content/flutter/step-21-clean-architecture.md`, slug: 'step-21-clean-architecture' },
  { id: 'flutter-22', title: 'Dependency Injection', step: 'Step 22', category: 'flutter', contentFile: `${BASE}content/flutter/step-22-dependency-injection.md`, slug: 'step-22-dependency-injection' },
  { id: 'flutter-23', title: 'Testing', step: 'Step 23', category: 'flutter', contentFile: `${BASE}content/flutter/step-23-flutter-testing.md`, slug: 'step-23-flutter-testing' },
  { id: 'flutter-24', title: 'Rendering Optimization', step: 'Step 24', category: 'flutter', contentFile: `${BASE}content/flutter/step-24-flutter-rendering-optimization.md`, slug: 'step-24-flutter-rendering-optimization' },
  { id: 'flutter-25', title: 'Memory Management', step: 'Step 25', category: 'flutter', contentFile: `${BASE}content/flutter/step-25-memory-management.md`, slug: 'step-25-memory-management' },
  { id: 'flutter-26', title: 'Native Integration', step: 'Step 26', category: 'flutter', contentFile: `${BASE}content/flutter/step-26-native-integration.md`, slug: 'step-26-native-integration' },
  { id: 'flutter-27', title: 'AI Integration', step: 'Step 27', category: 'flutter', contentFile: `${BASE}content/flutter/step-27-ai-integration.md`, slug: 'step-27-ai-integration' },
  { id: 'flutter-28', title: 'Push Notifications', step: 'Step 28', category: 'flutter', contentFile: `${BASE}content/flutter/step-28-push-notifications.md`, slug: 'step-28-push-notifications' },
  { id: 'flutter-29', title: 'App Build & Deploy', step: 'Step 29', category: 'flutter', contentFile: `${BASE}content/flutter/step-29-app-build-deploy.md`, slug: 'step-29-app-build-deploy' },
  { id: 'flutter-30', title: 'CI/CD', step: 'Step 30', category: 'flutter', contentFile: `${BASE}content/flutter/step-30-cicd.md`, slug: 'step-30-cicd' },

  // ── React ──
  { id: 'react-00', title: '완성 로드맵', step: 'Step 00', category: 'react', contentFile: `${BASE}content/react/react-step00.md`, slug: 'react-step00' },
  { id: 'react-01', title: '개발 환경 설치와 프로젝트 구조', step: 'Step 01', category: 'react', contentFile: `${BASE}content/react/react-step01.md`, slug: 'react-step01' },
  { id: 'react-02', title: '모던 JavaScript 필수 문법', step: 'Step 02', category: 'react', contentFile: `${BASE}content/react/react-step02-JavaScript.md`, slug: 'react-step02-JavaScript' },
  { id: 'react-03', title: 'React 생태계 조감도', step: 'Step 03', category: 'react', contentFile: `${BASE}content/react/react-step03-React.md`, slug: 'react-step03-React' },
  { id: 'react-04', title: 'JSX와 컴포넌트 실행 모델', step: 'Step 04', category: 'react', contentFile: `${BASE}content/react/react-step04-JSX.md`, slug: 'react-step04-JSX' },
  { id: 'react-05', title: 'Props와 단방향 데이터 흐름', step: 'Step 05', category: 'react', contentFile: `${BASE}content/react/react-step05-Props.md`, slug: 'react-step05-Props' },
  { id: 'react-06', title: 'useState와 렌더 사이클', step: 'Step 06', category: 'react', contentFile: `${BASE}content/react/react-step06-useState.md`, slug: 'react-step06-useState' },
  { id: 'react-07', title: 'Reconciliation과 Key 전략', step: 'Step 07', category: 'react', contentFile: `${BASE}content/react/react-step07-Reconciliation-Key.md`, slug: 'react-step07-Reconciliation-Key' },
  { id: 'react-08', title: 'Form과 Synthetic Event', step: 'Step 08', category: 'react', contentFile: `${BASE}content/react/react-step08-Form-Synthetic-Event.md`, slug: 'react-step08-Form-Synthetic-Event' },
  { id: 'react-09', title: '조건부 렌더링과 리스트 패턴', step: 'Step 09', category: 'react', contentFile: `${BASE}content/react/react-step09.md`, slug: 'react-step09' },
  { id: 'react-10', title: 'React 내부 구조 심층 분석', step: 'Step 10', category: 'react', contentFile: `${BASE}content/react/react-step10-React.md`, slug: 'react-step10-React' },
  { id: 'react-11', title: 'useEffect 완전 이해', step: 'Step 11', category: 'react', contentFile: `${BASE}content/react/react-step11-useEffect.md`, slug: 'react-step11-useEffect' },
  { id: 'react-12', title: 'useRef와 DOM 접근 전략', step: 'Step 12', category: 'react', contentFile: `${BASE}content/react/react-step12-useRef-DOM.md`, slug: 'react-step12-useRef-DOM' },
  { id: 'react-13', title: 'useReducer와 상태 머신 설계', step: 'Step 13', category: 'react', contentFile: `${BASE}content/react/react-step13-useReducer.md`, slug: 'react-step13-useReducer' },
  { id: 'react-14', title: '메모이제이션 전략', step: 'Step 14', category: 'react', contentFile: `${BASE}content/react/react-step14.md`, slug: 'react-step14' },
  { id: 'react-15', title: 'React 18/19 신규 Hooks', step: 'Step 15', category: 'react', contentFile: `${BASE}content/react/react-step15-React-18-19-Hooks.md`, slug: 'react-step15-React-18-19-Hooks' },
  { id: 'react-16', title: 'Custom Hook 설계 패턴', step: 'Step 16', category: 'react', contentFile: `${BASE}content/react/react-step16-Custom-Hook.md`, slug: 'react-step16-Custom-Hook' },
  { id: 'react-17', title: 'Error Handling 아키텍처', step: 'Step 17', category: 'react', contentFile: `${BASE}content/react/react-step17-Error-Handling.md`, slug: 'react-step17-Error-Handling' },
  { id: 'react-18', title: 'React Router v6 심화', step: 'Step 18', category: 'react', contentFile: `${BASE}content/react/react-step18-ReactRouter-v6.md`, slug: 'react-step18-ReactRouter-v6' },
  { id: 'react-19', title: '렌더링 전략 비교 분석', step: 'Step 19', category: 'react', contentFile: `${BASE}content/react/react-step19.md`, slug: 'react-step19' },
  { id: 'react-20', title: 'React Server Components', step: 'Step 20', category: 'react', contentFile: `${BASE}content/react/react-step20-React-Server-Components.md`, slug: 'react-step20-React-Server-Components' },
  { id: 'react-21', title: 'Next.js App Router 핵심', step: 'Step 21', category: 'react', contentFile: `${BASE}content/react/react-step21-NextJS-App-Router.md`, slug: 'react-step21-NextJS-App-Router' },
  { id: 'react-22', title: 'REST API 통합과 데이터 패칭', step: 'Step 22', category: 'react', contentFile: `${BASE}content/react/react-step22-REST-API.md`, slug: 'react-step22-REST-API' },
  { id: 'react-23', title: 'TanStack Query', step: 'Step 23', category: 'react', contentFile: `${BASE}content/react/react-step23-TanStack-Query.md`, slug: 'react-step23-TanStack-Query' },
  { id: 'react-24', title: 'API 계층 설계와 에러 처리', step: 'Step 24', category: 'react', contentFile: `${BASE}content/react/react-step24-API.md`, slug: 'react-step24-API' },
  { id: 'react-25', title: 'Context API 심화', step: 'Step 25', category: 'react', contentFile: `${BASE}content/react/react-step25-Context-API.md`, slug: 'react-step25-Context-API' },
  { id: 'react-26', title: '전역 상태 관리 Zustand', step: 'Step 26', category: 'react', contentFile: `${BASE}content/react/react-step26-Zustand.md`, slug: 'react-step26-Zustand' },
  { id: 'react-27', title: '컴포넌트 설계 패턴', step: 'Step 27', category: 'react', contentFile: `${BASE}content/react/react-step27.md`, slug: 'react-step27' },
  { id: 'react-28', title: '프로젝트 구조와 아키텍처', step: 'Step 28', category: 'react', contentFile: `${BASE}content/react/react-step28.md`, slug: 'react-step28' },
  { id: 'react-29', title: '성능 최적화 심화', step: 'Step 29', category: 'react', contentFile: `${BASE}content/react/react-step29.md`, slug: 'react-step29' },
  { id: 'react-30', title: 'Suspense 아키텍처와 고급 패턴', step: 'Step 30', category: 'react', contentFile: `${BASE}content/react/react-step30-Suspense.md`, slug: 'react-step30-Suspense' },
  { id: 'react-31', title: 'TypeScript와 React 통합', step: 'Step 31', category: 'react', contentFile: `${BASE}content/react/react-step31-TypeScript-React.md`, slug: 'react-step31-TypeScript-React' },
  { id: 'react-32', title: 'React Hook Form과 Zod 검증', step: 'Step 32', category: 'react', contentFile: `${BASE}content/react/react-step32-React-Hook-Form-Zod.md`, slug: 'react-step32-React-Hook-Form-Zod' },
  { id: 'react-33', title: '폼 UX 패턴과 접근성', step: 'Step 33', category: 'react', contentFile: `${BASE}content/react/react-step33-UX.md`, slug: 'react-step33-UX' },
  { id: 'react-34', title: 'CSS 전략과 스타일링 아키텍처', step: 'Step 34', category: 'react', contentFile: `${BASE}content/react/react-step34-CSS.md`, slug: 'react-step34-CSS' },
  { id: 'react-35', title: '국제화(i18n)와 접근성(a11y)', step: 'Step 35', category: 'react', contentFile: `${BASE}content/react/react-step35-i18n-a11y.md`, slug: 'react-step35-i18n-a11y' },
  { id: 'react-36', title: '컴포넌트 테스트 RTL', step: 'Step 36', category: 'react', contentFile: `${BASE}content/react/react-step36-RTL.md`, slug: 'react-step36-RTL' },
  { id: 'react-37', title: 'E2E 테스트와 테스트 전략', step: 'Step 37', category: 'react', contentFile: `${BASE}content/react/react-step37-E2E.md`, slug: 'react-step37-E2E' },
  { id: 'react-38', title: '코드 품질과 개발 도구', step: 'Step 38', category: 'react', contentFile: `${BASE}content/react/react-step38.md`, slug: 'react-step38' },
  { id: 'react-39', title: 'Vite 빌드 시스템 심화', step: 'Step 39', category: 'react', contentFile: `${BASE}content/react/react-step39-Vite.md`, slug: 'react-step39-Vite' },
  { id: 'react-40', title: '배포 전략과 CI/CD', step: 'Step 40', category: 'react', contentFile: `${BASE}content/react/react-step40-CICD.md`, slug: 'react-step40-CICD' },
  { id: 'react-41', title: '프로덕션 모니터링과 에러 추적', step: 'Step 41', category: 'react', contentFile: `${BASE}content/react/react-step41.md`, slug: 'react-step41' },
  { id: 'react-42', title: '종합 프로젝트와 로드맵 마무리', step: 'Step 42', category: 'react', contentFile: `${BASE}content/react/react-step42.md`, slug: 'react-step42' },
]

export function getBookBySlug(slug: string): Book | undefined {
  return BOOKS.find(b => b.slug === slug);
}

export function getBooksByShelf(shelfId: string): Book[] {
  return BOOKS.filter(b => b.category === shelfId);
}
