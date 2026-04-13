# Step 01 — Flutter 아키텍처

> **파트:** 1️⃣ Flutter 전체 구조 이해 | **난이도:** ⭐☆☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Flutter의 3-Layer 아키텍처(Framework, Engine, Embedder) 구성 요소를 나열할 수 있다.
2. **[Remember]** Rendering Pipeline의 5단계를 순서대로 나열할 수 있다.
3. **[Understand]** Framework, Engine, Embedder 각 계층의 역할과 책임을 자신의 말로 설명할 수 있다.
4. **[Understand]** Flutter가 Native UI 컴포넌트를 사용하지 않는 이유를 아키텍처 관점에서 설명할 수 있다.
5. **[Understand]** Skia의 Shader Jank 문제가 발생하는 원인과 Impeller가 이를 해결하는 방식을 설명할 수 있다.
6. **[Analyze]** React Native(브리지 방식)와 Flutter(자체 렌더링 방식)의 렌더링 전략 차이를 분석할 수 있다.

**전제 지식:** 프로그래밍 기초(변수, 함수, 클래스 개념), 모바일 앱의 개념적 이해

---

## 1. 서론

### 1.1 Flutter란 무엇인가

Flutter는 Google이 개발한 **오픈소스 크로스 플랫폼 UI 프레임워크**다. 단 하나의 Dart 코드베이스로 Android, iOS, Web, macOS, Windows, Linux 앱을 동시에 빌드할 수 있다.

```
┌──────────────────────────────────────────────────────────────┐
│               Flutter 지원 플랫폼 (2026 기준)                │
├──────────────┬──────────┬────────┬─────────┬─────────┬───────┤
│   Android    │   iOS    │  Web   │  macOS  │ Windows │ Linux │
└──────────────┴──────────┴────────┴─────────┴─────────┴───────┘
                    ↑ 단일 Dart 코드베이스로 모두 지원
```

### 1.2 Flutter의 역사와 발전

| 버전          | 연도 | 주요 변화                                          |
| ------------- | ---- | -------------------------------------------------- |
| Flutter 1.0   | 2018 | 최초 안정 버전, Android/iOS 지원                   |
| Flutter 2.0   | 2021 | Null Safety, Web·Desktop 정식 지원                 |
| Flutter 3.0   | 2022 | 6개 플랫폼 완전 지원, macOS/Linux 안정화           |
| Flutter 3.7   | 2023 | iOS Impeller 기본 적용                             |
| Flutter 3.10+ | 2024 | Android Impeller 단계적 도입                       |
| 2026 현재     | -    | iOS/Android 모두 Impeller 기본, Vulkan 기반 렌더링 |

### 1.3 왜 Flutter 아키텍처부터 배워야 하는가

Flutter를 처음 배우면 당장 Widget을 만들고 싶은 유혹이 생긴다. 그러나 아키텍처를 모르면 나중에 다음과 같은 문제에서 막히게 된다.

- "왜 내 위젯이 이렇게 자주 rebuild되지?"
- "왜 Android와 iOS에서 UI가 똑같이 보이지?"
- "Impeller를 켜야 할까, 말아야 할까?"
- "왜 Flutter 앱 번들이 이렇게 크지?"

이 모든 질문의 답은 Flutter의 **3-Layer 아키텍처**와 **Rendering Pipeline**을 이해하면 자연스럽게 풀린다.

### 1.4 전체 개념 지도

![Flutter 3-Layer 아키텍처](/developer-open-book/diagrams/step01-flutter-architecture.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                 | 정의                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Framework**        | Dart로 작성된 Flutter의 최상위 계층. Widget, Rendering, Painting 등을 포함                |
| **Engine**           | C++로 작성된 Flutter의 핵심 런타임. Skia 또는 Impeller를 통해 실제 픽셀을 그린다          |
| **Embedder**         | 각 플랫폼(Android, iOS 등)과 Engine을 연결하는 플랫폼별 어댑터                            |
| **Skia**             | Google의 2D 그래픽 라이브러리. Flutter Engine이 화면을 렌더링할 때 사용해온 기존 엔진     |
| **Impeller**         | Flutter 3.7+에서 도입된 차세대 렌더링 엔진. Skia를 대체하는 방향으로 전환 중              |
| **Shader**           | GPU에서 실행되는 소규모 프로그램. 색상, 조명, 질감 등을 계산해 픽셀을 그린다              |
| **Shader Jank**      | Skia가 런타임에 처음 사용하는 셰이더를 컴파일할 때 발생하는 수십 ms 수준의 순간 멈춤 현상 |
| **Vulkan**           | Android에서 사용하는 저수준 GPU API. Impeller가 Vulkan을 활용해 성능을 높인다             |
| **JIT 컴파일**       | Just-In-Time. 실행 중에 코드를 컴파일. 개발 모드에서 Hot Reload를 가능하게 한다           |
| **AOT 컴파일**       | Ahead-Of-Time. 실행 전에 Native 코드로 완전히 변환. 릴리즈 모드에서 사용, 최고 성능       |
| **Hot Reload**       | 앱을 재시작하지 않고 코드 변경을 즉시 화면에 반영하는 개발 기능                           |
| **Platform Channel** | Flutter Dart 코드와 각 플랫폼의 Native 코드 간 통신 메커니즘                              |
| **dart:ui**          | Engine이 Framework에 노출한 저수준 API. Canvas, Window 등을 포함                          |
| **RenderObject**     | 실제 픽셀로 그려지는 렌더링 단계의 객체. 크기, 위치, 그리기 명령을 담당                   |

### 2.2 계층 간 관계 요약

![Flutter 실행 흐름](/developer-open-book/diagrams/step01-execution-flow.svg)

---

## 3. 이론적 배경과 원리 ★

### 3.1 Framework Layer 상세

Framework는 개발자가 직접 다루는 계층이다. **아래에서 위로** 쌓이는 구조이며, 각 하위 레이어가 상위 레이어에 서비스를 제공한다.

![Framework Layer 5단 스택](/developer-open-book/diagrams/step01-framework-layer-stack.svg)

각 레이어의 역할을 구체적으로 보면 아래와 같다.

**Foundation:** 모든 Flutter 코드의 기반이 되는 유틸리티 클래스. `ChangeNotifier`, `ValueNotifier`, `Key` 등이 여기에 속한다.

**Gestures:** 터치, 드래그, 탭, 스와이프 등의 입력 이벤트를 인식하고 적절한 위젯에 전달하는 제스처 인식 시스템이다.

**Painting:** Engine의 `Canvas` API를 래핑해 더 편리한 그리기 인터페이스를 제공한다. `BoxDecoration`, `TextPainter` 등이 여기서 동작한다.

**Rendering:** `RenderObject` 트리를 관리하며 레이아웃 계산(크기·위치 결정)과 그리기 명령 생성을 담당한다. Flutter UI 성능의 핵심 레이어다.

**Widgets:** 불변(immutable) UI 설명자. `StatelessWidget`과 `StatefulWidget`이 여기에 속한다. Widget 자체는 설계도에 불과하며 실제로 화면에 무언가를 그리지는 않는다.

**Material / Cupertino:** Google의 Material Design 3와 Apple의 Human Interface Guidelines를 Flutter로 구현한 위젯 세트다.

---

### 3.2 Engine Layer 상세

Engine은 C++로 작성된 Flutter의 핵심 런타임이다. Framework에서 내려오는 그리기 명령을 받아 실제 GPU 연산을 통해 픽셀을 생성한다.

| 구성 요소           | 역할                                                       |
| ------------------- | ---------------------------------------------------------- |
| **Skia / Impeller** | 2D 그래픽 렌더링. Canvas 명령 → 픽셀 변환                  |
| **Dart Runtime**    | Dart 코드 실행 (JIT: 개발, AOT: 릴리즈)                    |
| **Text Layout**     | 텍스트 렌더링, 폰트 로드, 글리프 처리                      |
| **dart:ui**         | Framework가 Engine 기능을 호출할 수 있도록 노출된 Dart API |
| **Accessibility**   | 스크린 리더 등 접근성 서비스 연결                          |

**dart:ui의 위치:**

```
Framework (Dart)  ←→  dart:ui (진입점)  ←→  Engine (C++)
```

`dart:ui`는 Dart 코드로 작성되어 있지만 실제로는 Engine의 C++ 함수를 직접 호출하는 얇은 바인딩 레이어다. `Canvas.drawRect()` 같은 저수준 API가 여기에 있다.

---

### 3.3 Embedder Layer 상세

Embedder는 각 플랫폼의 OS API를 활용해 Engine이 동작할 수 있는 환경을 구성한다.

| 플랫폼  | 언어          | 주요 역할                                                |
| ------- | ------------- | -------------------------------------------------------- |
| Android | Java / Kotlin | `FlutterActivity`, `FlutterView` 제공, 생명주기 관리     |
| iOS     | Obj-C / Swift | `FlutterViewController` 제공, Metal/OpenGL 컨텍스트 설정 |
| Web     | JavaScript    | CanvasKit(WebAssembly) 또는 HTML 렌더러 선택             |
| Desktop | C++           | 플랫폼 창 생성, 이벤트 루프 관리                         |

---

### 3.4 Rendering Pipeline 5단계

Flutter는 **프레임 단위**로 화면을 갱신한다. 각 프레임은 아래 5단계를 거쳐 픽셀이 된다.

![Rendering Pipeline 5단계](/developer-open-book/diagrams/step01-rendering-pipeline.svg)

**프레임 예산 (Frame Budget):**

| 목표 FPS | 프레임당 허용 시간 | 용도                                        |
| -------- | ------------------ | ------------------------------------------- |
| 60fps    | **16.6ms**         | 일반 모바일 앱                              |
| 120fps   | **8.3ms**          | ProMotion 디스플레이 (iPhone Pro, iPad Pro) |

Build + Layout + Paint + Composite + Rasterize의 총합이 이 시간 안에 완료되어야 한다. 초과하면 프레임이 드롭되어 **Jank(버벅임)** 가 발생한다.

---

### 3.5 Skia와 Impeller: 렌더링 엔진의 전환

#### Skia: 기존 렌더링 엔진

Skia는 Google이 개발한 성숙한 2D 그래픽 라이브러리로, Flutter 초기부터 렌더링 엔진으로 사용되어 왔다. Chrome, Android 등에서도 동일하게 사용된다.

**Skia의 Shader Jank 문제:**

```
[처음으로 특정 시각 효과 렌더링 요청]
          ↓
  Skia: "이 셰이더를 아직 컴파일한 적 없다"
          ↓
  런타임에 GPU 셰이더 컴파일 시작 (수십 ms 소요)
          ↓
  해당 프레임 렌더링 지연 → 화면 버벅임(Jank) 발생
          ↓
  이후 동일 효과는 컴파일된 캐시 사용 → 정상
```

Shader Jank는 앱을 처음 실행하거나, 새로운 화면으로 처음 이동할 때 주로 발생한다. 한 번 경험한 경로는 셰이더가 캐시되어 이후에는 발생하지 않지만, 사용자 입장에서는 앱이 완성도가 낮아 보이는 인상을 준다.

#### Impeller: 차세대 렌더링 엔진

Impeller는 Shader Jank 문제를 **근본적으로 해결**하기 위해 Flutter 팀이 설계한 차세대 렌더링 엔진이다.

**Impeller의 핵심 접근 방식:**

```
[앱 빌드 타임]
  Flutter 툴체인이 사용 가능한 모든 셰이더를 미리 컴파일
          ↓
  컴파일된 셰이더가 앱 번들에 포함됨
          ↓
[런타임]
  셰이더가 이미 준비됨 → 즉시 GPU 실행
          ↓
  Shader Jank 원천 차단
```

**Skia vs Impeller 상세 비교:**

| 항목               | Skia                        | Impeller                           |
| ------------------ | --------------------------- | ---------------------------------- |
| 도입 시기          | Flutter 초기부터            | Flutter 3.7 (iOS), 3.10+ (Android) |
| 셰이더 컴파일 시점 | 런타임 (처음 사용 시)       | 빌드 타임 (사전 컴파일)            |
| Shader Jank        | 발생 가능                   | 원천 차단                          |
| GPU API            | OpenGL ES, Metal, Vulkan    | Metal (iOS), Vulkan (Android)      |
| 성능               | 안정적이나 Jank 리스크 존재 | 일관된 고성능 프레임 유지          |
| 성숙도             | 매우 높음 (10년+ 검증)      | 빠르게 안정화 중                   |
| 2026 기준 상태     | 레거시 지원 유지            | iOS/Android 모두 기본 엔진         |

**Vulkan이란:**
Vulkan은 Khronos Group이 설계한 차세대 저수준 GPU API다. OpenGL ES 대비 CPU 오버헤드가 크게 줄어 렌더링 명령을 더 효율적으로 GPU에 전달할 수 있다. Impeller는 Android에서 Vulkan을 활용해 성능을 극대화한다.

---

### 3.6 Flutter vs 다른 Cross Platform 방식 비교

Cross Platform 프레임워크는 크게 세 가지 렌더링 전략으로 분류된다.

![크로스 플랫폼 렌더링 전략 비교](/developer-open-book/diagrams/step01-cross-platform-comparison.svg)

**상세 비교표:**

| 항목            | 웹뷰 방식     | React Native       | Flutter          |
| --------------- | ------------- | ------------------ | ---------------- |
| 렌더링 주체     | 브라우저 엔진 | OS Native 컴포넌트 | Skia / Impeller  |
| UI 일관성       | 낮음          | 플랫폼에 따라 다름 | 완전 동일        |
| 성능            | 낮음          | 중간               | 높음 (60~120fps) |
| Native API 접근 | 플러그인      | Bridge 경유        | Platform Channel |
| 개발 언어       | HTML/JS/CSS   | JavaScript / JSX   | Dart             |
| 앱 번들 크기    | 작음          | 중간               | 비교적 큰 편     |

**자체 렌더링의 중요한 의미:**

Flutter는 버튼, 텍스트, 스크롤 영역 등 모든 UI 요소를 OS의 기본 컴포넌트 없이 **직접 픽셀로 그린다**. 이것이 Android와 iOS에서 완전히 동일한 UI를 제공할 수 있는 근본적인 이유다. 반면 OS 업데이트로 Native UI 컴포넌트 동작이 바뀌어도 Flutter 앱은 영향을 받지 않는다.

---

### 3.7 JIT vs AOT 컴파일 모드

Dart는 개발 단계와 배포 단계에서 서로 다른 컴파일 전략을 사용한다.

```
개발 모드 (Debug)
  └── JIT (Just-In-Time) 컴파일
      • 코드를 실행하면서 그때그때 컴파일
      • Hot Reload / Hot Restart 지원
      • 실행 속도는 느리지만 개발 생산성 극대화
      • Observatory 디버깅 도구 연결 가능

릴리즈 모드 (Release)
  └── AOT (Ahead-Of-Time) 컴파일
      • 빌드 타임에 전체 코드를 Native 기계어로 변환
      • Hot Reload 불가
      • JIT 대비 최고 수준의 실행 성능
      • 번들에 Dart VM 포함 불필요 → 앱 크기 최적화
```

| 모드    | 컴파일 | Hot Reload | 성능 | 용도      |
| ------- | ------ | ---------- | ---- | --------- |
| Debug   | JIT    | ✅         | 낮음 | 개발 중   |
| Profile | AOT    | ❌         | 높음 | 성능 측정 |
| Release | AOT    | ❌         | 최고 | 배포      |

---

## 4. 사례 연구

### 4.1 TikTok 클론의 Impeller 도입 효과

TikTok처럼 영상 피드를 빠르게 스와이프하는 앱을 생각해보자. 이 앱에서는 다음 상황이 매 스와이프마다 발생한다.

- 새로운 영상 썸네일 렌더링
- 블러 효과, 그라디언트 오버레이 적용
- 전환 애니메이션

**Skia 방식의 문제:**

```
첫 스와이프 → 블러 셰이더 런타임 컴파일 → 16ms 초과 → 프레임 드롭
두 번째 스와이프 → 캐시 사용 → 정상
(하지만 새로운 효과가 나올 때마다 반복)
```

**Impeller 방식의 해결:**

```
빌드 타임에 블러·그라디언트 셰이더 모두 사전 컴파일
첫 스와이프부터 → 셰이더 즉시 실행 → 16ms 내 완료 → 60fps 유지
```

사용자는 앱을 처음 설치하고 첫 스와이프부터 끊김 없는 경험을 얻는다.

---

### 4.2 Flutter vs React Native의 실무 선택 기준

| 선택 기준          | Flutter가 유리              | React Native이 유리             |
| ------------------ | --------------------------- | ------------------------------- |
| UI 일관성 요구     | 브랜드 고유 UI, 플랫폼 무관 | -                               |
| 팀 배경            | Dart에 투자 가능            | JS/TS 개발자 다수               |
| 성능 요구          | 애니메이션·게임·그래픽 앱   | 정보성 앱, 비즈니스 앱          |
| 플랫폼 Native 연동 | -                           | 복잡한 Native 기능 다수 사용 시 |
| 생태계             | pub.dev (빠르게 성장 중)    | npm (방대한 생태계)             |

---

### 4.3 실제 Flutter 도입 사례

| 앱                 | 선택 이유                     | 결과                              |
| ------------------ | ----------------------------- | --------------------------------- |
| **Google Pay**     | Android/iOS UI 완전 통일 필요 | 코드량 35% 감소, UI 일관성 확보   |
| **eBay Motors**    | 두 플랫폼 팀을 하나로 통합    | 출시 주기 단축                    |
| **Alibaba Xianyu** | 수억 MAU 규모 앱 성능 검증    | 대규모 환경에서 Flutter 성능 입증 |
| **BMW App**        | 차량 인포테인먼트 UI 통일     | 임베디드·모바일 동시 지원         |

---

## 5. 실습

### 5.1 Impeller 활성화 비교 실습

아래 순서로 Impeller 켜기 전후의 렌더링 차이를 직접 확인한다.

**사전 준비:**

```bash
# Flutter 설치 확인
flutter --version

# 연결된 디바이스 확인
flutter devices
```

**Step 1: 기본 앱 생성**

```bash
flutter create impeller_test
cd impeller_test
```

**Step 2: Skia 모드로 실행 (기본)**

```bash
flutter run
```

**Step 3: Impeller 모드로 실행**

```bash
# iOS
flutter run --enable-impeller

# Android (Vulkan 지원 기기)
flutter run --enable-impeller
```

**Step 4: Performance Overlay 켜기**

`main.dart`에서 아래 옵션을 추가하면 화면 상단에 렌더링 성능 그래프가 표시된다.

```dart
MaterialApp(
  showPerformanceOverlay: true,  // 추가
  home: const MyHomePage(),
)
```

```
성능 그래프 해석:
┌──────────────────────────────────────┐
│  ██░░░░░░░░░░░░░  ← UI 스레드 (파란색)  │
│  ██░░░░░░░░░░░░░  ← Raster 스레드 (녹색)│
│  ─────────────── ← 16ms 기준선        │
└──────────────────────────────────────┘
막대가 기준선을 넘으면 프레임 드롭 발생
```

**확인 포인트:**

- Skia 모드에서 처음 화면 전환 시 막대가 기준선을 넘는가?
- Impeller 모드에서 동일 상황에서 막대가 안정적인가?

---

### 5.2 아키텍처 흐름 추적 연습

아래 코드를 보며 각 줄이 어느 Layer에서 처리되는지 분석하라.

```dart
import 'package:flutter/material.dart';   // [?] 어느 Layer?

void main() {
  runApp(const MyApp());                   // [?] 어느 Layer에 위임?
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {     // [?] Rendering Pipeline 몇 단계?
    return MaterialApp(
      showPerformanceOverlay: false,
      home: Scaffold(                      // [?] 어느 Framework 레이어?
        appBar: AppBar(
          title: const Text('Step 01'),
        ),
        body: const Center(
          child: Text('Flutter Architecture'),  // [?] 픽셀이 되기까지의 경로?
        ),
      ),
    );
  }
}
```

**분석 질문:**

1. `import 'package:flutter/material.dart'` 는 Framework의 어느 레이어를 가져오는가?
2. `runApp()`이 호출되면 Engine Layer에서 무슨 일이 시작되는가?
3. `Text('Flutter Architecture')`가 화면의 픽셀이 되기까지 Rendering Pipeline 5단계를 순서대로 서술하라.
4. 이 앱을 Android와 iOS에서 실행하면 UI가 동일하게 보이는 이유를 아키텍처 관점에서 한 문단으로 설명하라.

---

### 5.3 자가 평가 퀴즈

**Q1. [Remember]** Flutter의 3-Layer 아키텍처를 올바르게 나열한 것은?

- A) Widget → Element → Render
- B) Material → Widget → Canvas
- C) **Framework → Engine → Embedder** ✅
- D) Dart → C++ → Java

---

**Q2. [Remember]** Rendering Pipeline의 단계를 올바른 순서로 나열한 것은?

- A) Paint → Build → Layout → Composite → Rasterize
- B) **Build → Layout → Paint → Composite → Rasterize** ✅
- C) Layout → Build → Composite → Paint → Rasterize
- D) Build → Paint → Layout → Rasterize → Composite

---

**Q3. [Understand]** Impeller가 Skia의 Shader Jank 문제를 해결하는 방법은?

- A) 더 빠른 CPU를 활용한다
- B) 셰이더를 아예 사용하지 않는다
- C) **셰이더를 빌드 타임에 미리 컴파일해 번들에 포함한다** ✅
- D) JIT 컴파일로 전환해 실시간으로 최적화한다

---

**Q4. [Understand]** Android에서 Impeller가 사용하는 저수준 GPU API는?

- A) OpenGL ES
- B) DirectX
- C) Metal
- D) **Vulkan** ✅

---

**Q5. [Analyze]** React Native와 Flutter의 렌더링 방식의 핵심 차이를 서술하라.

> **모범 답안:** React Native는 JavaScript 코드가 Bridge를 통해 OS의 Native UI 컴포넌트(Android View, iOS UIView)를 제어하는 방식을 사용한다. 반면 Flutter는 Engine의 Skia 또는 Impeller가 Canvas에 직접 픽셀을 그린다. 따라서 Flutter는 플랫폼 UI 컴포넌트에 전혀 의존하지 않아 Android와 iOS에서 완전히 동일한 UI를 보장할 수 있다.

---

**Q6. [Understand]** 릴리즈 모드에서 Hot Reload가 불가능한 이유는?

> **모범 답안:** 릴리즈 모드는 AOT(Ahead-Of-Time) 컴파일을 사용해 전체 Dart 코드를 빌드 타임에 Native 기계어로 완전히 변환한다. Hot Reload는 JIT 환경에서 Dart VM이 실행 중에 코드 변경을 동적으로 반영하는 기능이다. AOT로 컴파일된 앱에는 Dart VM이 없으므로 Hot Reload가 동작할 수 없다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- Flutter는 **Framework(Dart) / Engine(C++) / Embedder(Platform)** 3계층으로 구성된다.
- Engine의 **Skia 또는 Impeller**가 직접 픽셀을 그리기 때문에 Native UI 컴포넌트에 의존하지 않는다.
- Rendering Pipeline은 **Build → Layout → Paint → Composite → Rasterize** 순서로 동작하며, 목표 FPS에 따른 프레임 예산 안에 완료되어야 한다.
- **Skia의 Shader Jank** 문제는 런타임 셰이더 컴파일 지연이 원인이며, **Impeller**는 빌드 타임 사전 컴파일로 이를 근본 해결한다.
- 개발 중에는 **JIT(Hot Reload 지원)**, 배포 시에는 **AOT(최고 성능)** 컴파일을 사용한다.

### 6.2 다음 Step 예고

- **Step 02 — Dart 언어 핵심:** Flutter 코드 작성에 필수적인 Dart의 Null Safety, Mixin, async/Future/Stream, Isolate, Records & Patterns를 학습한다.

### 6.3 참고 자료

| 자료                           | 링크                                                        | 설명                         |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| Flutter Architectural Overview | <https://docs.flutter.dev/resources/architectural-overview> | 공식 아키텍처 문서           |
| Inside Flutter                 | <https://docs.flutter.dev/resources/inside-flutter>         | 렌더링 파이프라인 심층 분석  |
| Impeller 소개                  | <https://docs.flutter.dev/perf/impeller>                    | 차세대 렌더링 엔진 공식 문서 |
| Flutter Engine GitHub          | <https://github.com/flutter/engine>                         | C++ Engine 소스코드          |

### 6.4 FAQ

**Q. Flutter 앱이 다른 앱보다 용량이 큰 이유는?**

> Flutter Engine(Skia/Impeller, Dart Runtime 등)이 앱 번들에 포함되기 때문이다. 최소 번들 크기는 Android APK 기준 약 4~6MB 수준이다.

**Q. Impeller로 전환하면 무조건 더 빠른가?**

> Shader Jank는 해결되지만, 특정 복잡한 효과에서는 Skia보다 Impeller가 아직 느린 경우도 있다. Flutter 팀이 지속적으로 개선 중이며, 2026년 기준 대부분의 시나리오에서 Impeller가 우수하다.

**Q. Embedder 없이 Flutter Engine만 단독으로 사용할 수 있는가?**

> 커스텀 Embedder를 직접 작성하면 가능하다. 자동차 인포테인먼트 시스템, 임베디드 디바이스 등에서 Flutter를 사용하는 사례가 이에 해당한다.

---

## 빠른 자가진단 체크리스트

- [ ] Flutter의 3-Layer 구조를 다이어그램으로 그릴 수 있는가?
- [ ] Rendering Pipeline 5단계를 순서대로 말할 수 있는가?
- [ ] Skia Shader Jank의 원인을 한 문장으로 설명할 수 있는가?
- [ ] Impeller가 Jank를 해결하는 방식을 설명할 수 있는가?
- [ ] React Native와의 렌더링 방식 차이를 설명할 수 있는가?
- [ ] JIT와 AOT의 차이와 각 사용 시점을 말할 수 있는가?
- [ ] 잠재적 함정: 60fps 목표에서 프레임 예산(16.6ms)이 왜 중요한지 설명할 수 있는가?
