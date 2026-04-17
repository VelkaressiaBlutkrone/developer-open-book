# 📱 Flutter 학습 로드맵

> 이론 75% + 실습 25% 구성 원칙 | 총 30 Step | Bloom's Taxonomy 기반 설계 | 2026 최신 트렌드 반영

---

## 로드맵 개요

### 전체 구성 원칙

```
┌─────────────────────────────────────────────────────────┐
│  서론            │ 10~15%  │ 동기 유발 + 맥락 제공      │
│  기본 개념·용어  │ 20~25%  │ 핵심 용어 정의             │
│  이론·원리       │ 25~30%  │ 근본 원리 심층 탐구 ★      │
│  사례 연구       │ 15~20%  │ 이론 ↔ 실생활 연결         │
│  실습            │ 25%     │ 이론 검증 + 실무 적용       │
│  결론·참고자료   │ 5~10%   │ 요약 + 다음 단계 안내      │
└─────────────────────────────────────────────────────────┘
```

### Bloom's Taxonomy 난이도 분포

| 단계 | 영역                 | 배치 파트                            |
| ---- | -------------------- | ------------------------------------ |
| 1    | Remembering (기억)   | 1️⃣ Flutter 전체 구조, 2️⃣ UI 시스템   |
| 2    | Understanding (이해) | 3️⃣ 인터랙션, 4️⃣ 상태관리 기초        |
| 3    | Applying (적용)      | 5️⃣ 비동기·데이터, 5.5️⃣ 애니메이션    |
| 4    | Analyzing (분석)     | 6️⃣ 아키텍처                          |
| 5    | Evaluating (평가)    | 7️⃣ 테스팅, 8️⃣ 성능 최적화            |
| 6    | Creating (창조)      | 9️⃣ 플랫폼 연동 & AI, 🔟 배포 & CI/CD |

---

## 파트별 구성

---

### 1️⃣ Flutter 전체 구조 이해

> **목표:** Flutter가 무엇이며 어떻게 동작하는지 원리 파악
> **Bloom 단계:** Remembering → Understanding

| Step | 주제              | 핵심 학습 내용                                                                                                                                            | 실습                                                            |
| ---- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 01   | Flutter 아키텍처  | Framework / Engine / Embedder 3-Layer, Rendering Pipeline, Skia Jank 현상 원인, Impeller 전환 배경 — iOS/Android 모두 기본 적용(Vulkan 기반 성능 향상)    | `flutter run --enable-impeller` 실행 후 렌더링 비교             |
| 02   | Dart 언어 핵심    | Null Safety, Class / Mixin, async·Future·Stream, Isolate·compute(진정한 병렬 처리), Records & Patterns(Dart 3.3+ switch 패턴 강화), Collection, Extension | DartPad에서 `compute(() => heavyTask())` 병렬 계산 구현         |
| 03   | Flutter 개발 환경 | Flutter SDK, Android Studio / VSCode, Flutter CLI, Emulator 연결, FVM(Flutter Version Management) — 프로젝트별 SDK 버전 관리                              | `fvm install stable` 후 `flutter create my_app --platforms=web` |

> 💡 **사례 연구:** TikTok 클론에서 Impeller가 어떻게 부드러운 스크롤(60fps 유지)을 구현하는지 — Skia Shader Jank와의 비교 분석

---

### 2️⃣ Flutter UI 시스템 이해

> **목표:** Flutter UI의 구조적 원리와 핵심 Widget 체계 이해
> **Bloom 단계:** Remembering → Understanding

| Step | 주제                              | 핵심 학습 내용                                                                                                                                     | 실습                                                          |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 04   | Widget 개념                       | Three Trees: Widget(설계도) / Element(생명주기 연결자) / RenderObject(실제 그리기) 역할 분리, Build 과정                                           | -                                                             |
| 05   | StatelessWidget vs StatefulWidget | Immutable Widget, State 객체, Lifecycle — initState·build·didUpdateWidget·dispose 전체 흐름                                                        | StatefulWidget으로 카운터 앱: `setState(() => _counter++)`    |
| 06   | Layout 시스템                     | Box Constraints, "Constraints go down, Sizes go up, Parent sets position" 원칙, Intrinsic Dimensions 성능 비용, Flex(Row·Column·Expanded·Flexible) | Row / Column으로 그리드 레이아웃: Expanded 위젯으로 비율 조정 |
| 07   | 기본 UI 위젯                      | Container, Text, Image, Icon, Padding, Align                                                                                                       | Container로 스타일 박스: `BoxDecoration(color: Colors.blue)`  |
| 08   | Material Design 시스템            | Scaffold, AppBar, Drawer, BottomNavigationBar, Theme, AdaptiveTheme(플랫폼 적응형 테마)                                                            | Scaffold로 기본 앱 UI — AppBar에 AdaptiveTheme 적용           |

> 💡 **사례 연구:** Netflix UI에서 Scaffold가 어떻게 일관된 네비게이션 구조를 제공하는지 — BottomNavigationBar와 Drawer 조합 분석

---

### 3️⃣ 사용자 인터랙션

> **목표:** 사용자 입력 처리 구조와 페이지 이동 원리 이해
> **Bloom 단계:** Understanding → Applying

| Step | 주제              | 핵심 학습 내용                                                                    | 실습                                                      |
| ---- | ----------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 09   | 사용자 입력 처리  | GestureDetector, InkWell, Focus, Keyboard 이벤트, Accessibility(시맨틱 태그) 고려 | GestureDetector로 드래그: `onPanUpdate`                   |
| 10   | Form 시스템       | TextField, Form, Validation, RegExp 패턴 검증                                     | Form으로 로그인 화면: `GlobalKey<FormState>().validate()` |
| 11   | Navigation 시스템 | Navigator, Route, Named Route, Navigation Stack, Hero 전환 애니메이션             | Named Route로 페이지 이동 + Hero 위젯 전환 구현           |

> 💡 **사례 연구:** Instagram에서 GestureDetector가 스와이프 스토리 전환을 처리하는 방식 — onHorizontalDragEnd 임계값 처리 분석

---

### 4️⃣ 상태 관리

> **목표:** Flutter 상태 관리의 개념적 흐름과 패턴별 원리 이해
> **Bloom 단계:** Understanding → Analyzing

| Step | 주제                  | 핵심 학습 내용                                                                                                                                         | 실습                                                                  |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 12   | Flutter 상태관리 개념 | Local State vs Global State, Reactive UI                                                                                                               | -                                                                     |
| 13   | setState              | setState 동작 원리, rebuild 메커니즘, ValueKey를 활용한 불필요한 rebuild 최적화                                                                        | setState로 UI 업데이트 — ValueKey 적용 전후 rebuild 횟수 비교         |
| 14   | Provider 패턴         | ChangeNotifier, Provider 구조, Dependency Injection                                                                                                    | `Provider.of<T>(context)`로 데이터 공유                               |
| 15   | 고급 상태관리         | Riverpod(생태계 주류, Hooks 지원 강화, Provider 단점 해결 방식 집중) / Bloc(Stream 기반 로직 분리, 대규모 팀 선호) / Redux — 우선순위: Riverpod → Bloc | Riverpod Counter: `final counterProvider = StateProvider((ref) => 0)` |

> 💡 **사례 연구:** Spotify에서 Bloc이 플레이리스트 상태를 관리하는 방식 — Stream 이벤트 흐름과 State 변환 구조 분석

---

### 5️⃣ 비동기 및 데이터

> **목표:** 비동기 UI 처리와 외부 데이터 연동 원리 이해
> **Bloom 단계:** Applying

| Step | 주제              | 핵심 학습 내용                                                            | 실습                                          |
| ---- | ----------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| 16   | Future / Async UI | FutureBuilder, StreamBuilder                                              | FutureBuilder로 API 데이터 로딩 화면 구현     |
| 17   | HTTP 통신         | REST API, JSON Parsing, Dio / http 패키지, GraphQL 기초(ferry·gql 패키지) | `Dio().get('url')`로 GET 요청 + JSON 파싱     |
| 18   | 로컬 데이터 저장  | SharedPreferences, SQLite, Hive, Firebase Firestore Offline 캐싱          | Hive로 데이터 저장: `Hive.box('myBox').put()` |

> 💡 **사례 연구:** YouTube 앱에서 StreamBuilder가 실시간 댓글·좋아요 수를 처리하는 방식

---

### 5.5️⃣ 애니메이션

> **목표:** Flutter 애니메이션 시스템의 원리와 구현 패턴 이해
> **Bloom 단계:** Applying

| Step | 주제       | 핵심 학습 내용                                                                                                | 실습                                             |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 19   | 애니메이션 | AnimationController, AnimatedBuilder, Hero, ImplicitlyAnimatedWidget(AnimatedContainer 등), Tween, Curve 원리 | Hero 위젯으로 목록 → 상세 페이지 전환 애니메이션 |

---

### 6️⃣ Flutter 아키텍처

> **목표:** 대규모 앱 설계를 위한 구조적 패턴 이해
> **Bloom 단계:** Analyzing → Evaluating

| Step | 주제                  | 핵심 학습 내용                                                                                          | 실습                                                |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 20   | Flutter 프로젝트 구조 | Feature 기반 구조, Layer 구조(presentation·application·domain·data) 각 계층 책임 분리, 의존성 방향 원칙 | Feature 폴더 구조 직접 생성                         |
| 21   | Clean Architecture    | Domain Layer, Repository Pattern, UseCase                                                               | Repository로 데이터 접근 추상화 구현                |
| 22   | Dependency Injection  | GetIt, Injectable, Riverpod Injector 통합 패턴                                                          | `locator.registerSingleton<MyService>(MyService())` |

> 💡 **사례 연구:** Airbnb 클론에서 Clean Architecture가 API 교체 시 유지보수를 어떻게 용이하게 했는지 — Repository 추상화 레이어 분석

---

### 7️⃣ 테스팅 전략

> **목표:** 좋은 코드를 판별하는 이론적 기준으로서 테스트 계층 구조 이해
> **Bloom 단계:** Evaluating

| Step | 주제           | 핵심 학습 내용                                                                                                                                   | 실습                                        |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 23   | Flutter 테스팅 | Unit Test(비즈니스 로직 검증), Widget Test(UI 컴포넌트 단위), Integration Test(전체 시나리오), 테스트 피라미드 구조, Golden Test(UI 스냅샷 비교) | `tester.pumpWidget(MyWidget())` Widget Test |

> 💡 **사례 연구:** Google Maps Flutter SDK에서 Widget Test와 Golden Test를 활용해 지도 UI 렌더링을 회귀 검증하는 방식

---

### 8️⃣ 성능 최적화

> **목표:** Flutter 렌더링 성능 개선 원리와 메모리 관리 전략 이해
> **Bloom 단계:** Evaluating

| Step | 주제                  | 핵심 학습 내용                                                                                                                                     | 실습                                            |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 24   | Flutter 렌더링 최적화 | const Widget, Rebuild 최소화, RepaintBoundary, Flutter DevTools — Performance Overlay·Widget Inspector·Network Tab으로 병목을 데이터 기반으로 확인 | DevTools로 샘플 앱 프로파일링 후 병목 지점 찾기 |
| 25   | 메모리 관리           | dispose, Controller 관리, Animation lifecycle, Isolate 메모리 누수 경고 패턴                                                                       | `dispose()`로 리소스 해제 패턴 구현             |

> 💡 **사례 연구:** 모바일 게임 앱에서 RepaintBoundary로 배경 레이어를 분리해 FPS를 30→60으로 높인 사례

---

### 9️⃣ 플랫폼 연동 & AI

> **목표:** Flutter와 Native·AI 코드 연동 구조 이해
> **Bloom 단계:** Creating

| Step | 주제        | 핵심 학습 내용                                                                                          | 실습                                  |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 26   | Native 연동 | MethodChannel, Android / iOS Native 호출 구조, EventChannel(스트림 기반 Native → Flutter)               | MethodChannel로 배터리 레벨 가져오기  |
| 27   | AI 통합     | Flutter ML Kit, TensorFlow Lite, Gemini API(이미지 분석·텍스트 생성), on-device vs 서버 AI 트레이드오프 | Gemini API로 이미지 설명 생성 앱 구현 |
| 28   | 푸시 알림   | Firebase Cloud Messaging(FCM), Local Notifications, 알림 권한 처리, 딥링크 연동                         | FCM으로 토큰 발급 후 테스트 알림 전송 |

> 💡 **사례 연구:** ChatGPT-like 앱에서 Gemini API + StreamBuilder를 조합해 스트리밍 텍스트 응답을 실시간으로 표시하는 방식

---

### 🔟 배포 & CI/CD

> **목표:** 완성된 앱을 실제 스토어에 배포하고 자동화 파이프라인 구축
> **Bloom 단계:** Creating

| Step | 주제            | 핵심 학습 내용                                                                              | 실습                                           |
| ---- | --------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 29   | 앱 빌드 및 배포 | APK / AAB 빌드, Play Store 배포(내부 테스트 → 프로덕션), iOS TestFlight / App Store Connect | `flutter build apk --release` 빌드 실행        |
| 30   | CI/CD 자동화    | GitHub Actions, Codemagic, Fastlane — 브랜치 푸시 시 자동 빌드·테스트·배포 파이프라인       | GitHub Workflow로 PR 빌드 자동화 스크립트 작성 |

> 💡 **사례 연구:** 인디 앱 개발자가 GitHub Actions + Codemagic으로 수동 배포 2시간을 15분으로 단축한 사례

---

## 전체 학습 흐름

```
[1️⃣ 구조 이해]        Flutter 아키텍처(Impeller) → Dart(Records·Isolate) → 환경(FVM)
        ↓
[2️⃣ UI 시스템]        Three Trees → Layout 원칙 → 기본 위젯 → Material(AdaptiveTheme)
        ↓
[3️⃣ 인터랙션]         입력(Accessibility) → Form → Navigation(Hero)
        ↓
[4️⃣ 상태 관리]        상태 개념 → setState(ValueKey) → Provider → Riverpod·Bloc 우선
        ↓
[5️⃣ 비동기·데이터]    FutureBuilder → HTTP(GraphQL) → 로컬(Firebase Offline)
        ↓
[5.5️⃣ 애니메이션]     AnimationController → Hero → ImplicitlyAnimated
        ↓
[6️⃣ 아키텍처]         프로젝트 구조 → Clean Architecture → DI(Riverpod Injector)
        ↓
[7️⃣ 테스팅]           Unit → Widget → Integration → Golden Test
        ↓
[8️⃣ 성능 최적화]      DevTools 병목 분석 → 메모리 관리(Isolate 누수 경고)
        ↓
[9️⃣ 플랫폼 연동&AI]   MethodChannel → Gemini API → FCM 푸시 알림
        ↓
[🔟 배포 & CI/CD]     빌드 → Play Store·TestFlight → GitHub Actions 자동화
```

---

## Step 전체 목록

| 번호 | 주제                              | 파트 |
| ---- | --------------------------------- | ---- |
| 01   | Flutter 아키텍처                  | 1️⃣   |
| 02   | Dart 언어 핵심                    | 1️⃣   |
| 03   | Flutter 개발 환경                 | 1️⃣   |
| 04   | Widget 개념                       | 2️⃣   |
| 05   | StatelessWidget vs StatefulWidget | 2️⃣   |
| 06   | Layout 시스템                     | 2️⃣   |
| 07   | 기본 UI 위젯                      | 2️⃣   |
| 08   | Material Design 시스템            | 2️⃣   |
| 09   | 사용자 입력 처리                  | 3️⃣   |
| 10   | Form 시스템                       | 3️⃣   |
| 11   | Navigation 시스템                 | 3️⃣   |
| 12   | Flutter 상태관리 개념             | 4️⃣   |
| 13   | setState                          | 4️⃣   |
| 14   | Provider 패턴                     | 4️⃣   |
| 15   | 고급 상태관리                     | 4️⃣   |
| 16   | Future / Async UI                 | 5️⃣   |
| 17   | HTTP 통신                         | 5️⃣   |
| 18   | 로컬 데이터 저장                  | 5️⃣   |
| 19   | 애니메이션                        | 5.5️⃣ |
| 20   | Flutter 프로젝트 구조             | 6️⃣   |
| 21   | Clean Architecture                | 6️⃣   |
| 22   | Dependency Injection              | 6️⃣   |
| 23   | Flutter 테스팅                    | 7️⃣   |
| 24   | Flutter 렌더링 최적화             | 8️⃣   |
| 25   | 메모리 관리                       | 8️⃣   |
| 26   | Native 연동                       | 9️⃣   |
| 27   | AI 통합                           | 9️⃣   |
| 28   | 푸시 알림                         | 9️⃣   |
| 29   | 앱 빌드 및 배포                   | 🔟   |
| 30   | CI/CD 자동화                      | 🔟   |

---

## 문서 품질 기준 (각 Step 공통)

### 자가진단 체크리스트

- [ ] 이 Step을 읽은 후 퀴즈 10개를 70점 이상 맞출 수 있는가? (예: "Three Trees의 역할은?")
- [ ] 3개월 뒤에도 핵심 개념을 다시 떠올릴 수 있는가?
- [ ] 비슷한 주제 문서보다 더 명쾌하게 설명되었는가?
- [ ] 실무에서 바로 써먹을 수 있는 코드 스니펫이 포함되었는가?
- [ ] 읽다가 포기하고 싶은 지점이 없는가?
- [ ] 잠재적 함정(예: 무한 rebuild, dispose 누락)을 경고했는가?

### 실습 도구

| 용도         | 도구                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 코드 실행    | DartPad (<https://dartpad.dev>)                                       |
| 다이어그램   | draw.io, Mermaid, Excalidraw                                          |
| Flutter 실행 | Android Emulator, iOS Simulator, 실기기                               |
| 패키지 탐색  | pub.dev                                                               |
| 성능 분석    | Flutter DevTools (Performance Overlay, Widget Inspector, Network Tab) |
| AI 도구      | Gemini for Flutter                                                    |
| CI/CD        | GitHub Actions, Codemagic                                             |

---

_Kirkpatrick 평가 모델 + Revised Bloom's Taxonomy(2001) 기반으로 설계된 Flutter 학습 로드맵_
_v3 — 2026 트렌드(Impeller 완전 전환, Riverpod 주류화, Gemini AI 통합, CI/CD 자동화) 반영_
