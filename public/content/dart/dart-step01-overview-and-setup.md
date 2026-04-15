# Step 1 — Dart 개요 및 환경 구축

> **Phase 1 | Dart 기초** | 예상 소요: 1일 | 블룸 수준: Remember ~ Understand

---

## 📋 목차

1. [학습 목표](#1-학습-목표)
2. [서론 — Dart는 왜 배워야 하는가?](#2-서론)
3. [Dart의 핵심 특성 이해](#3-dart의-핵심-특성-이해)
   - 3.1 Single-Threaded 실행 모델
   - 3.2 Event Loop 아키텍처
   - 3.3 JIT vs AOT 컴파일 방식
4. [Dart 생태계와 위치](#4-dart-생태계와-위치)
5. [개발 환경 구축](#5-개발-환경-구축)
6. [첫 번째 Dart 프로그램 분석](#6-첫-번째-dart-프로그램-분석)
7. [실습](#7-실습)
8. [핵심 요약 및 다음 단계](#8-핵심-요약-및-다음-단계)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                   |
| --- | ------------- | ---------------------------------------------------------------------- |
| 1   | 🔵 Remember   | Dart의 주요 특성(Single Thread, Event Loop, JIT, AOT)을 나열할 수 있다 |
| 2   | 🔵 Remember   | `dart run`, `dart compile` 등 CLI 명령어를 올바르게 실행할 수 있다     |
| 3   | 🟢 Understand | JIT와 AOT 컴파일의 차이점과 각각의 사용 시나리오를 설명할 수 있다      |
| 4   | 🟢 Understand | Event Loop가 비동기 작업을 처리하는 방식을 도식으로 설명할 수 있다     |

---

## 2. 서론

### Dart는 왜 배워야 하는가?

2011년 Google이 발표한 Dart는 처음에는 JavaScript의 대안 웹 언어로 출발했습니다. 그러나 2018년 Flutter 프레임워크와 결합하면서 완전히 새로운 위상을 얻었습니다. 현재 Dart는 **단 하나의 코드베이스로 모바일(iOS/Android), 웹, 데스크톱, 서버 애플리케이션**을 모두 개발할 수 있는 유일한 언어 중 하나입니다.

![diagram](/developer-open-book/diagrams/step01-dart-hierarchy.svg)

### 왜 지금 Dart인가?

- **Flutter 생태계 급성장**: 2024년 기준 GitHub Stars 160,000+, 전 세계 수백만 개 앱 배포
- **Google 내부 사용**: Google Ads, Google Pay 등 핵심 서비스에 Flutter/Dart 적용
- **Dart 3.0 혁신**: Records, Patterns, Class Modifiers 등 현대적 문법 대거 도입
- **강타입 + Null Safety**: 런타임 오류를 컴파일 타임에 사전 차단하는 안전한 타입 시스템

> **전제 지식**: 프로그래밍 기초(변수, 조건문, 반복문 개념), 터미널/CLI 기본 사용법

---

## 3. Dart의 핵심 특성 이해

### 3.1 Single-Threaded 실행 모델

Dart는 **기본적으로 단일 스레드(Single Thread)** 에서 실행됩니다. 이는 Node.js와 동일한 철학으로, 하나의 실행 흐름(메인 Isolate)이 모든 코드를 순차적으로 처리합니다.

**왜 단일 스레드인가?**

멀티스레드 프로그래밍은 강력하지만 아래 문제를 동반합니다:

| 문제           | 설명                                    |
| -------------- | --------------------------------------- |
| Race Condition | 두 스레드가 같은 데이터를 동시에 수정   |
| Deadlock       | 두 스레드가 서로의 자원을 기다리며 멈춤 |
| 복잡한 동기화  | mutex, lock 등 관리 비용 증가           |

Dart는 이를 회피하기 위해 **공유 메모리 없는 단일 스레드 + 비동기 이벤트 루프** 모델을 선택했습니다. 멀티코어 활용이 필요할 때는 별도 메모리 공간을 가진 **Isolate**를 사용합니다(Phase 4에서 학습).

<div data-diagram="exec-model" data-steps="4" data-alt="Dart 실행 모델 개요" data-descriptions="Main Isolate 내에서 코드가 실행되고 Event Queue에서 비동기 결과를 받습니다|모든 코드는 단일 스레드에서 순차 실행되며 공유 메모리가 없습니다|멀티코어 활용이 필요하면 별도 Isolate를 생성합니다|Isolate 간에는 메시지 패싱으로만 통신합니다"></div>

---

### 3.2 Event Loop 아키텍처

단일 스레드임에도 Dart가 네트워크 요청, 파일 I/O, 타이머 등 여러 작업을 동시에 처리하는 것처럼 보이는 이유는 **Event Loop(이벤트 루프)** 덕분입니다.

**Event Loop의 두 큐(Queue)**

Dart의 이벤트 루프는 두 종류의 큐를 관리합니다:

| 큐 이름             | 처리 내용                                     | 우선순위         |
| ------------------- | --------------------------------------------- | ---------------- |
| **Microtask Queue** | `Future.microtask()`, `scheduleMicrotask()`   | 높음 (먼저 처리) |
| **Event Queue**     | I/O 완료, Timer, 사용자 이벤트, `Future` 콜백 | 낮음 (이후 처리) |

**Event Loop 동작 순서**

<div data-diagram="eventloop" data-steps="5" data-alt="Event Loop 처리 흐름" data-descriptions="main() 함수 내 동기 코드가 모두 완료될 때까지 실행합니다|Microtask Queue를 확인하고 대기 중인 마이크로태스크를 모두 처리합니다|Event Queue에서 이벤트 하나를 꺼내 콜백을 실행합니다|다시 Microtask Queue를 확인하는 단계로 돌아갑니다|두 큐가 모두 비고 대기 중인 작업이 없으면 프로그램이 종료됩니다"></div>

**실행 순서 예시 분석**

```dart
void main() {
  print('1. 동기 코드 시작');

  Future(() => print('4. Event Queue'));        // Event Queue에 등록

  Future.microtask(() => print('3. Microtask')); // Microtask Queue에 등록

  print('2. 동기 코드 끝');
}

// 출력 결과:
// 1. 동기 코드 시작
// 2. 동기 코드 끝
// 3. Microtask
// 4. Event Queue
```

> **핵심 이해**: 동기 코드 → Microtask → Event 순서로 처리됩니다. 비동기 코드는 현재 동기 코드가 모두 끝난 후에 실행됩니다.

---

### 3.3 JIT vs AOT 컴파일 방식

Dart는 상황에 따라 두 가지 컴파일 방식을 전략적으로 사용합니다. 이것이 **개발 생산성과 실행 성능을 동시에** 달성할 수 있는 핵심 이유입니다.

#### JIT (Just-In-Time) 컴파일

```
소스 코드 → [JIT 컴파일러] → 실행 중 기계어 변환 → 실행
```

| 특성          | 내용                            |
| ------------- | ------------------------------- |
| **동작 시점** | 실행 중 실시간 컴파일           |
| **장점**      | Hot Reload 지원, 빠른 개발 반복 |
| **단점**      | 초기 실행 느림, 최적화 제한     |
| **사용 환경** | 개발(Development) 모드          |
| **대표 명령** | `dart run main.dart`            |

JIT의 핵심 장점은 **Hot Reload**입니다. Flutter 개발 중 코드를 수정하면 앱을 재시작하지 않고도 수백 밀리초 내에 변경 사항이 반영됩니다. 이는 UI 개발 속도를 획기적으로 높입니다.

#### AOT (Ahead-Of-Time) 컴파일

```
소스 코드 → [AOT 컴파일러] → 네이티브 기계어 → 배포 → 즉시 실행
```

| 특성          | 내용                               |
| ------------- | ---------------------------------- |
| **동작 시점** | 배포 전 사전 컴파일                |
| **장점**      | 빠른 시작 시간, 최적화된 실행 성능 |
| **단점**      | Hot Reload 불가, 컴파일 시간 필요  |
| **사용 환경** | 릴리즈(Production) 모드            |
| **대표 명령** | `dart compile exe main.dart`       |

#### JIT vs AOT 비교 정리

```
[개발 단계]                    [배포 단계]

소스 코드                       소스 코드
    │                               │
    ▼ JIT 컴파일                    ▼ AOT 컴파일
빠른 반복 개발                  최적화된 실행 파일
Hot Reload 가능                 빠른 앱 시작 시간
디버깅 정보 포함                파일 크기 최소화
    │                               │
    ▼                               ▼
개발자 생산성 ↑                 사용자 경험 ↑
```

> **Flutter와의 연결**: Flutter는 개발 시 JIT, 앱 스토어 배포 시 AOT를 사용합니다. 개발자는 이 전환을 명시적으로 신경 쓸 필요 없이 Flutter 툴체인이 자동 처리합니다.

---

## 4. Dart 생태계와 위치

### 타 언어와의 비교

| 특성         | Dart                    | JavaScript           | Kotlin              | Swift        |
| ------------ | ----------------------- | -------------------- | ------------------- | ------------ |
| 타입 시스템  | 강타입 (Null Safety)    | 약타입               | 강타입              | 강타입       |
| 실행 모델    | Single Thread + Isolate | Single Thread        | Multi Thread        | Multi Thread |
| 주요 용도    | Flutter, 서버           | 웹, Node.js          | Android             | iOS/macOS    |
| Null Safety  | ✅ 내장                 | ❌ (TypeScript 일부) | ✅                  | ✅           |
| Hot Reload   | ✅ (Flutter)            | ✅ (일부)            | ✅ (Android Studio) | ✅ (Xcode)   |
| 크로스플랫폼 | ✅ (Flutter)            | ✅                   | 제한적              | 제한적       |

### Dart 버전 히스토리

```
Dart 1.x (2013~2017)  →  초기 웹 언어 시도
Dart 2.0 (2018)       →  강타입 시스템 도입, Flutter 채택
Dart 2.12 (2021)      →  Null Safety 정식 도입 (⭐ 게임 체인저)
Dart 2.17 (2022)      →  Enhanced Enums, Super initializers
Dart 3.0 (2023)       →  Records, Patterns, Class Modifiers (⭐ 현대 Dart)
Dart 3.x (2023~현재)  →  지속적 개선
```

---

## 5. 개발 환경 구축

### 5.1 Dart SDK 설치

**방법 1: Flutter SDK 포함 설치 (권장)**

Flutter를 최종 목표로 한다면 Flutter SDK에 Dart SDK가 포함되어 있습니다.

```bash
# Flutter 공식 사이트에서 SDK 다운로드
# https://docs.flutter.dev/get-started/install

# 설치 후 버전 확인
flutter --version
dart --version
```

**방법 2: Dart SDK 단독 설치**

```bash
# macOS (Homebrew)
brew install dart

# Ubuntu/Debian
sudo apt-get install dart

# Windows (Chocolatey)
choco install dart-sdk

# 설치 확인
dart --version
# Dart SDK version: 3.x.x (stable)
```

### 5.2 IDE 및 에디터 설정

**VS Code (권장)**

```
확장 프로그램 설치:
1. Dart (Dart Code 팀 공식)
2. Flutter (Flutter 개발 시 추가)
```

VS Code에서 Dart 확장을 설치하면 다음이 자동 제공됩니다:

- 문법 강조(Syntax Highlighting)
- 자동완성(IntelliSense)
- 실시간 오류 표시
- 코드 포맷터(`dart format`)

**IntelliJ IDEA / Android Studio**

```
Plugins → Dart 검색 → 설치
```

### 5.3 핵심 CLI 명령어 정리

```bash
# 파일 실행
dart run main.dart           # JIT 방식으로 실행 (개발용)

# 네이티브 실행 파일로 컴파일 (AOT)
dart compile exe main.dart   # main.exe (Windows) / main (Linux/macOS) 생성

# JavaScript로 컴파일 (웹 배포용)
dart compile js main.dart    # out.js 생성

# 코드 포맷팅
dart format main.dart        # 코드 스타일 자동 정리

# 코드 분석 (정적 분석)
dart analyze                 # 프로젝트 전체 오류/경고 검사

# 테스트 실행
dart test                    # test/ 폴더의 테스트 파일 실행

# 새 프로젝트 생성
dart create my_project       # 기본 Dart 프로젝트 스캐폴딩

# 패키지 의존성 설치
dart pub get                 # pubspec.yaml 기반 패키지 설치
```

### 5.4 DartPad — 설치 없이 시작하기

로컬 환경 설정이 번거롭다면 **DartPad**를 사용하세요.

```
URL: https://dartpad.dev
특징: 브라우저에서 즉시 Dart/Flutter 코드 실행 가능
권장: 이 로드맵의 Phase 1~2 실습에 DartPad 활용
```

---

## 6. 첫 번째 Dart 프로그램 분석

### Hello, Dart! 구조 분석

```dart
// main.dart

void main() {
  print('Hello, Dart!');
}
```

이 단 세 줄에서 Dart의 핵심 구조를 확인할 수 있습니다:

| 요소      | 의미                | 특징                                         |
| --------- | ------------------- | -------------------------------------------- |
| `void`    | 반환 타입 없음      | Dart는 반환 타입을 명시하는 강타입 언어      |
| `main()`  | 진입점(Entry Point) | 모든 Dart 프로그램은 `main()` 함수에서 시작  |
| `print()` | 표준 출력           | `dart:core` 라이브러리에 내장, import 불필요 |
| `;`       | 문장 종결자         | 모든 구문은 세미콜론으로 종료                |

### 조금 더 발전된 예시

```dart
void main() {
  // 변수 선언 (Step 2에서 상세 학습)
  String name = 'Dart';
  int version = 3;

  // 문자열 보간법 (String Interpolation)
  print('Hello, $name $version!');           // Hello, Dart 3!
  print('1 + 1 = ${1 + 1}');               // 1 + 1 = 2

  // 타입 추론 - var 키워드
  var message = '자동으로 String 타입으로 추론';
  print(message.runtimeType);               // String
}
```

**Dart의 문자열 보간법**은 매우 강력합니다:

- `$변수명`: 단순 변수 삽입
- `${표현식}`: 계산식, 메서드 호출 등 복잡한 표현식 삽입

---

## 7. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 7-1: CLI 명령어 확인

로컬 환경에 SDK가 설치되어 있다면 다음을 터미널에서 직접 실행해 보세요.

```bash
# 1. Dart 버전 확인
dart --version

# 2. main.dart 파일 생성 후 실행
echo 'void main() { print("Hello, Dart!"); }' > main.dart
dart run main.dart

# 3. 코드 포맷 확인
dart format main.dart

# 4. 정적 분석 실행
dart analyze main.dart
```

**예상 출력**:

```
Dart SDK version: 3.x.x (stable)
Hello, Dart!
Formatted main.dart
No issues found!
```

### 실습 7-2: Event Loop 실행 순서 예측

아래 코드를 DartPad에 입력하고 출력 순서를 **보기 전에** 직접 예측해 보세요.

```dart
import 'dart:async';

void main() {
  print('A');

  scheduleMicrotask(() => print('B - Microtask'));

  Future.delayed(Duration.zero, () => print('C - Future'));

  Future.microtask(() => print('D - Microtask 2'));

  print('E');
}
```

**정답 및 해설**

```
A
E
B - Microtask
D - Microtask 2
C - Future
```

> 1. `A`, `E` — 동기 코드가 먼저 순서대로 실행
> 2. `B`, `D` — Microtask Queue는 Event Queue보다 우선순위가 높으므로 먼저 처리
> 3. `C` — Event Queue에 있는 Future.delayed는 마지막에 처리

### 실습 7-3: JIT vs AOT 컴파일 비교 (로컬 환경)

```bash
# JIT 실행 (시간 측정)
time dart run main.dart

# AOT 컴파일 후 실행 (시간 측정)
dart compile exe main.dart -o main_aot
time ./main_aot
```

두 실행 방식의 시작 시간 차이를 관찰해 보세요.

---

## 8. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념              | 핵심 내용                                                     |
| ----------------- | ------------------------------------------------------------- |
| **Single Thread** | Dart는 기본적으로 단일 스레드, Race Condition/Deadlock 회피   |
| **Event Loop**    | 동기 → Microtask Queue → Event Queue 순서로 처리              |
| **JIT 컴파일**    | 실행 중 컴파일, Hot Reload 지원, 개발 생산성 ↑                |
| **AOT 컴파일**    | 사전 컴파일, 빠른 시작 시간, 릴리즈 배포에 사용               |
| **CLI 명령어**    | `dart run`, `dart compile exe`, `dart format`, `dart analyze` |

### 🔗 다음 단계

> **Step 2 — 변수와 데이터 타입**으로 이동하세요.

Step 2에서는 Dart 타입 시스템의 핵심인 `var`, `final`, `const`의 차이, Compile-time과 Runtime 상수 구분, 그리고 현대 Dart 개발의 필수 개념인 **Null Safety**를 학습합니다.

### 📚 참고 자료

| 자료                 | 링크                                           |
| -------------------- | ---------------------------------------------- |
| Dart 개요 공식 문서  | <https://dart.dev/overview>                    |
| Dart 언어 소개       | <https://dart.dev/language>                    |
| Event Loop 심층 분석 | <https://dart.dev/libraries/async/async-await> |
| DartPad 온라인 실습  | <https://dartpad.dev>                          |
| JIT vs AOT 설명      | <https://dart.dev/tools/dart-compile>          |

### ❓ 자가진단 퀴즈

1. **[Remember]** Dart의 두 가지 컴파일 방식의 이름은 무엇인가?
2. **[Remember]** `dart run`과 `dart compile exe`의 차이를 설명하라.
3. **[Understand]** Event Loop에서 Microtask Queue가 Event Queue보다 먼저 처리되는 이유는 무엇인가?
4. **[Understand]** Dart가 Single Thread 모델을 채택한 이유를 멀티스레드의 단점과 연관 지어 설명하라.

> **💡 정답 힌트**
>
> 1. JIT(Just-In-Time), AOT(Ahead-Of-Time)
> 2. `dart run`은 JIT 방식으로 즉시 실행(개발용), `dart compile exe`는 AOT 방식으로 네이티브 실행 파일 생성(배포용)
> 3. Microtask Queue는 현재 이벤트 처리가 끝난 직후 즉시 처리되는 반면, Event Queue는 외부 이벤트 대기열이기 때문
> 4. Race Condition, Deadlock 등 멀티스레드 동기화 문제를 회피하고 코드 예측 가능성을 높이기 위해

---

_참고: 이 문서는 dart.dev 공식 문서 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
