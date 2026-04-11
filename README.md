# Developer Open Book

개발자 학습 문서를 **도서관 컨셉**으로 제공하는 인터랙티브 웹 애플리케이션.
나무 선반 위 책등(spine)을 탐색하고, 책을 펼쳐 양면 읽기 뷰로 학습할 수 있습니다.

**Live:** https://VelkaressiaBlutkrone.github.io/developer-open-book/

---

## 주요 기능

### 책장 뷰 (Bookshelf)
- 나무결 선반 위에 책등이 꽂혀있는 물리적 서가 UI
- 각 책의 높이/두께/색상이 문서 ID 기반 시드로 결정 (렌더마다 일관성 유지)
- 호버 시 `rotateY(-28deg)` 3D 기울기 + 커버 미리보기
- Dart / React 카테고리 필터링

### 읽기 뷰 (Reading View)
- 책 클릭 시 `perspective(1400px)` 3D 펼침 애니메이션으로 전환
- 양면 펼침(two-page spread) 레이아웃
- SVG `feTurbulence` 종이 텍스처 + 세피아 잉크 타이포그래피
- `rotateY` 기반 3D 페이지 넘김 애니메이션
- 키보드 지원: `←` `→` 페이지 넘김, `ESC` 닫기

### 도서관 분위기
- 어두운 호두나무 배경 (`#0f0b07`)
- 따뜻한 램프 빛 radial-gradient 오버레이
- 미세 먼지/그레인 텍스처
- 금색 강조 (`#b8860b`)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Fonts | Playfair Display (헤딩), Lora (본문), JetBrains Mono (코드) |
| Deploy | GitHub Pages (gh-pages) |
| Animation | CSS 3D Transforms, `preserve-3d`, GPU-composited |

---

## 프로젝트 구조

```
developer-open-book/
├── src/
│   ├── components/
│   │   ├── Bookshelf.tsx      # 메인 책장 뷰 + 필터링
│   │   ├── BookSpine.tsx      # 개별 책등 컴포넌트
│   │   └── ReadingView.tsx    # 읽기 뷰 + 페이지 플립
│   ├── data/
│   │   └── books.ts           # 책 카탈로그 + 시각 속성 생성
│   ├── styles/
│   │   ├── global.css         # 디자인 시스템 (변수, 조명, 텍스처)
│   │   ├── bookshelf.css      # 헤더, 선반, 책등 스타일
│   │   └── reading.css        # 읽기 뷰, 페이지 플립, 타이포그래피
│   ├── types/
│   │   └── index.ts           # TypeScript 타입 정의
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── design-research/       # 디자인 리서치 문서 + 프리뷰
│       ├── README.md           # 리서치 개요
│       ├── current-state.md    # 기존 사이트 분석
│       ├── library-ui-patterns.md  # 도서관 UI 패턴
│       ├── implementation-strategy.md  # 구현 전략
│       ├── references.md       # 참조 자료 (CodePen, 라이브러리)
│       └── preview.html        # 단일 파일 디자인 프리뷰
├── index.html
├── vite.config.ts
└── package.json
```

---

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | React + TypeScript 소스코드 |
| `gh-pages` | Vite 빌드 결과물 (자동 배포) |

---

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

---

## 콘텐츠 추가

`src/data/books.ts`의 `BOOKS` 배열에 새 책을 추가합니다:

```typescript
{
  id: 'dart-02',
  title: '컬렉션과 반복',
  step: 'Step 02',
  category: 'dart',
  pages: [
    {
      type: 'toc',
      title: '컬렉션과 반복',
      subtitle: 'List, Map, Set의 활용',
      items: ['List 기초', 'Map과 Set', '반복문 패턴'],
    },
    {
      type: 'content',
      chapter: 'Chapter 1',
      title: 'List 기초',
      text: ['Dart의 List는 순서가 있는 컬렉션입니다...'],
      code: 'var list = [1, 2, 3];',
      note: 'List는 0-based 인덱스를 사용합니다.',
    },
  ],
}
```

---

## 디자인 참조

디자인 리서치 문서와 단일 파일 프리뷰는 `docs/design-research/`에 있습니다.
`preview.html`을 브라우저에서 열면 프레임워크 없이 디자인 컨셉을 확인할 수 있습니다.
