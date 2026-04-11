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
    height: 170 + (seed % 70),
    thickness: 26 + (seed % 22),
    color,
    coverColor: `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`,
  }
}

export const BOOKS: Book[] = [
  // ── Dart ──
  {
    id: 'dart-01', title: 'Dart 기초 문법', step: 'Step 01', category: 'dart',
    pages: [
      { type: 'toc', title: 'Dart 기초 문법', subtitle: '변수, 타입, 연산자의 세계로', items: [
        '변수 선언과 타입 추론', '기본 데이터 타입', '연산자의 종류', 'Null Safety 이해하기', '상수와 final/const',
      ]},
      { type: 'content', chapter: 'Chapter 1', title: '변수 선언과 타입 추론', text: [
        'Dart에서 변수를 선언하는 방법은 크게 두 가지입니다. 명시적으로 타입을 지정하거나, var 키워드를 사용하여 컴파일러가 타입을 추론하도록 할 수 있습니다. 타입 추론은 코드를 간결하게 만들어주지만, 가독성을 위해 적절히 섞어 사용하는 것이 좋습니다.',
        '변수의 타입이 한번 결정되면, 해당 변수에는 같은 타입의 값만 할당할 수 있습니다. 이것이 Dart가 정적 타입 언어인 이유입니다. 하지만 dynamic 타입을 사용하면 이 제약을 풀 수 있습니다.',
      ], code: `var name = '홍길동';     // String 타입 추론\nint age = 25;            // 명시적 타입 선언\nfinal city = '서울';    // 런타임 상수\nconst pi = 3.14159;   // 컴파일타임 상수`, note: 'final과 const의 차이: final은 런타임에 한 번 할당되고, const는 컴파일 타임에 결정됩니다.' },
      { type: 'content', chapter: 'Chapter 2', title: 'Null Safety', text: [
        'Dart 2.12부터 도입된 Null Safety는 null 참조 오류를 컴파일 타임에 방지합니다. 기본적으로 모든 변수는 non-nullable이며, null을 허용하려면 타입 뒤에 물음표(?)를 붙여야 합니다.',
        '이 설계 철학은 "billion dollar mistake"라 불리는 null 참조 오류를 근본적으로 해결합니다. 코드를 작성할 때 null 가능성을 명시적으로 다루게 되므로, 런타임 에러가 극적으로 줄어듭니다.',
      ], code: `String name = 'Dart';       // null 불가\nString? nickname;          // null 허용\n\n// Null-aware 연산자들\nprint(nickname?.length);   // 안전한 접근\nprint(nickname ?? '없음'); // 기본값 제공`, note: null },
    ],
  },
  { id: 'dart-02', title: '컬렉션과 반복', step: 'Step 02', category: 'dart', pages: [] },
  { id: 'dart-03', title: '함수와 클로저', step: 'Step 03', category: 'dart', pages: [] },
  { id: 'dart-04', title: '클래스와 객체', step: 'Step 04', category: 'dart', pages: [] },
  { id: 'dart-05', title: '상속과 Mixin', step: 'Step 05', category: 'dart', pages: [] },
  { id: 'dart-06', title: '비동기 프로그래밍', step: 'Step 06', category: 'dart', pages: [] },
  { id: 'dart-07', title: 'Stream과 Future', step: 'Step 07', category: 'dart', pages: [] },
  { id: 'dart-08', title: '제네릭 심화', step: 'Step 08', category: 'dart', pages: [] },
  { id: 'dart-09', title: '에러 핸들링', step: 'Step 09', category: 'dart', pages: [] },
  { id: 'dart-10', title: '패키지와 라이브러리', step: 'Step 10', category: 'dart', pages: [] },
  { id: 'dart-11', title: '테스트 작성법', step: 'Step 11', category: 'dart', pages: [] },
  { id: 'dart-12', title: '메타프로그래밍', step: 'Step 12', category: 'dart', pages: [] },

  // ── React ──
  {
    id: 'react-00', title: 'React 시작하기', step: 'Step 00', category: 'react',
    pages: [
      { type: 'toc', title: 'React 시작하기', subtitle: '모던 UI 개발의 첫걸음', items: [
        'React란 무엇인가', 'JSX 문법 이해', '컴포넌트의 개념', '첫 번째 컴포넌트 만들기', '개발 환경 설정',
      ]},
      { type: 'content', chapter: 'Chapter 1', title: 'React란 무엇인가', text: [
        'React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다. Facebook(현 Meta)에서 개발했으며, 컴포넌트 기반 아키텍처를 통해 복잡한 UI를 효율적으로 관리할 수 있게 해줍니다.',
        'Virtual DOM이라는 개념을 도입하여 실제 DOM 조작을 최소화하고, 선언적 프로그래밍 패러다임을 채택하여 UI 상태 관리를 직관적으로 만들었습니다. 이러한 설계 철학은 대규모 애플리케이션에서도 높은 성능과 유지보수성을 보장합니다.',
      ], code: `function Welcome({ name }) {\n  return (\n    <div className="greeting">\n      <h1>안녕하세요, {name}님</h1>\n      <p>React의 세계에 오신 것을 환영합니다</p>\n    </div>\n  );\n}`, note: 'React 컴포넌트는 항상 대문자로 시작합니다. 소문자로 시작하면 HTML 태그로 인식됩니다.' },
      { type: 'content', chapter: 'Chapter 2', title: 'JSX 문법 이해', text: [
        'JSX는 JavaScript의 확장 문법으로, HTML과 유사한 구조를 JavaScript 코드 안에서 작성할 수 있게 해줍니다. Babel 트랜스파일러가 JSX를 React.createElement() 호출로 변환합니다.',
        '중괄호 {} 안에 JavaScript 표현식을 넣을 수 있어, 동적인 값을 쉽게 렌더링할 수 있습니다. 조건부 렌더링, 리스트 렌더링 등 다양한 패턴이 가능합니다.',
      ], code: `const element = (\n  <div>\n    <h1>{formatName(user)}</h1>\n    <img src={user.avatarUrl} />\n  </div>\n);`, note: null },
    ],
  },
  { id: 'react-01', title: '컴포넌트와 Props', step: 'Step 01', category: 'react', pages: [] },
  { id: 'react-02', title: 'State와 생명주기', step: 'Step 02', category: 'react', pages: [] },
  { id: 'react-03', title: 'Hooks 기초', step: 'Step 03', category: 'react', pages: [] },
  { id: 'react-04', title: 'useEffect 심화', step: 'Step 04', category: 'react', pages: [] },
  { id: 'react-05', title: 'Context API', step: 'Step 05', category: 'react', pages: [] },
  { id: 'react-06', title: 'React Router', step: 'Step 06', category: 'react', pages: [] },
  { id: 'react-07', title: '상태 관리 패턴', step: 'Step 07', category: 'react', pages: [] },
  { id: 'react-08', title: '폼 처리와 검증', step: 'Step 08', category: 'react', pages: [] },
  { id: 'react-09', title: '성능 최적화', step: 'Step 09', category: 'react', pages: [] },
  { id: 'react-10', title: '커스텀 Hooks', step: 'Step 10', category: 'react', pages: [] },
]
