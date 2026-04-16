# Developer Open Book — 프로젝트 가이드

## 프로젝트 개요

픽셀 아트 RPG 도서관에서 프로그래밍을 배우는 인터랙티브 웹앱.
- **Live:** https://velkaressiablutkrone.github.io/developer-open-book/
- **기술:** React 19 + TypeScript 6 + Vite 8 + HashRouter
- **배포:** GitHub Pages (gh-pages npm 패키지, `npm run deploy`)
- **콘텐츠:** 마크다운 기반, 현재 97권 (Dart 23, Flutter 31, React 43)

## 핵심 문서

| 문서 | 역할 |
|------|------|
| `README.md` | 프로젝트 구조, 기술 스택, 개발 가이드 |
| `docs/design/v2-living-pixel-library.md` | v2 고도화 디자인 문서 (4-Phase 계획) |
| `docs/worklog.md` | 작업 이력 + 진행 상태 + 다음 할 일 (세션 연속성) |
| `TODOS.md` | 지연된 작업 목록 |

## 현재 상태 (2026-04-16)

**v2 Living Pixel Library 고도화 진행 중.**
Phase 1 엔지니어링 리뷰 완료, 구현 대기 상태.
세부 진행 상태는 `docs/worklog.md` 참조.

## 새 세션 시작 시

1. `docs/worklog.md`를 읽어서 현재 진행 상태 확인
2. `docs/design/v2-living-pixel-library.md`에서 설계 방향 확인
3. `TODOS.md`에서 지연된 작업 확인
4. worklog의 "다음 할 일" 섹션부터 이어서 작업

## 콘텐츠 소스

학습 문서 원본은 `develop-study-documents` 레포에 있으며, 점진적으로 이 레포로 이관.
현재 이관 대기: Java 48, MSA 46, LLM 32, MySQL 31, JS/TS 22, Python 16권.

## 빌드 & 배포

```bash
npm install        # 의존성
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run deploy     # GitHub Pages 배포
```
