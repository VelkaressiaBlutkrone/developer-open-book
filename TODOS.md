# TODOS

## 콘텐츠 마이그레이션 사전 검증 스크립트
- **What:** content/(68개), src/content/(98개), public/content/(100개) 3개 폴더의 파일 차이를 비교하는 스크립트 작성
- **Why:** 3개 폴더의 파일 수가 다름 (68 vs 98 vs 100). 마이그레이션 시 누락/덮어쓰기로 데이터 손실 위험
- **Pros:** 마이그레이션 안전성 확보, 어떤 파일이 canonical인지 확인
- **Cons:** 일회성 작업이라 투자 대비 효용 논란 가능
- **Context:** Outside voice가 지적한 이슈. public/content/가 100개로 가장 많으므로 이것이 canonical일 가능성 높지만, src/content/ 98개에만 있는 파일이 있을 수 있음. diff 확인 후 public/content/를 단일 소스로 확정해야 함
- **Depends on:** Phase 1 콘텐츠 마이그레이션 시작 전 실행

## Service Worker 콘텐츠 캐싱
- **What:** fetch 기반 콘텐츠 로딩 전환 후, Service Worker로 한번 읽은 MD 파일을 브라우저에 캐시
- **Why:** Vite glob(빌드 번들) → fetch(런타임) 전환 시 오프라인/느린 연결에서 콘텐츠가 안 보이는 UX 저하
- **Pros:** 오프라인 지원, 재방문 시 즉시 로딩, 모바일 환경 개선
- **Cons:** Service Worker 구현/디버깅 복잡성, 캐시 무효화 전략 필요
- **Context:** 현재는 MD가 JS 청크로 번들되어 오프라인에서도 작동. fetch 전환 후에는 네트워크 필수. GitHub Pages의 Cache-Control 헤더는 기본 10분이라 브라우저 캐시만으로는 부족
- **Depends on:** Phase 1 fetch 기반 전환 완료 후
