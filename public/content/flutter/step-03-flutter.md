# Step 03 — Flutter 개발 환경

> **파트:** 1️⃣ Flutter 전체 구조 이해 | **난이도:** ⭐☆☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Flutter 개발에 필요한 도구 목록(SDK, IDE, CLI, Emulator)을 나열할 수 있다.
2. **[Remember]** FVM이 해결하는 문제가 무엇인지 설명할 수 있다.
3. **[Understand]** `flutter doctor`가 점검하는 항목과 그 의미를 설명할 수 있다.
4. **[Understand]** Flutter 프로젝트 디렉토리 구조의 각 폴더 역할을 설명할 수 있다.
5. **[Apply]** Flutter SDK를 설치하고 첫 번째 앱을 생성·실행할 수 있다.
6. **[Apply]** FVM으로 프로젝트별 Flutter SDK 버전을 독립적으로 관리할 수 있다.

**전제 지식:** Step 01·02 완료, 터미널 기본 사용 능력(cd, ls, mkdir)

---

## 1. 서론

### 1.1 왜 개발 환경 설정이 중요한가

Flutter 개발 환경은 처음 세팅할 때 가장 많은 오류를 만나는 구간이다. Android SDK 경로 문제, Java 버전 충돌, Xcode 라이선스 미동의 등 수십 가지 변수가 얽혀 있다. 환경 설정의 **원리를 이해하고** 세팅하면 오류가 발생해도 스스로 진단하고 해결할 수 있다.

![Flutter 개발 환경 구성 요소 스택](/developer-open-book/diagrams/step03-dev-environment-stack.svg)

### 1.2 플랫폼별 필요 도구 요약

| 개발 목표 플랫폼 | 필수 도구                                  | OS 제한             |
| ---------------- | ------------------------------------------ | ------------------- |
| Android          | Flutter SDK + Android Studio + Android SDK | Windows·macOS·Linux |
| iOS              | Flutter SDK + Xcode + CocoaPods            | **macOS 전용**      |
| macOS            | Flutter SDK + Xcode                        | macOS 전용          |
| Web              | Flutter SDK (추가 도구 불필요)             | 모든 OS             |
| Windows          | Flutter SDK + Visual Studio (C++ 워크로드) | Windows 전용        |
| Linux            | Flutter SDK + clang·cmake·GTK 헤더         | Linux 전용          |

> ⚠️ **함정 주의:** iOS 앱 개발은 **반드시 macOS**에서만 가능하다. Windows·Linux에서는 Android, Web, Desktop(해당 OS) 빌드만 가능하다.

### 1.3 전체 개념 지도

![Flutter 개발 환경 개념 트리](/developer-open-book/diagrams/step03-dev-environment-tree.svg)

---

## 2. 기본 개념과 용어

| 용어                | 정의                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Flutter SDK**     | Flutter Framework, Dart SDK, flutter CLI를 포함하는 통합 개발 키트                             |
| **FVM**             | Flutter Version Management. 프로젝트별로 서로 다른 Flutter SDK 버전을 독립적으로 관리하는 도구 |
| **flutter doctor**  | Flutter 개발 환경의 설치 상태와 문제를 자동으로 진단하는 CLI 명령                              |
| **Android SDK**     | Android 앱 빌드에 필요한 도구 모음. `adb`, `emulator`, 플랫폼 라이브러리 포함                  |
| **Xcode**           | Apple의 공식 IDE. Flutter iOS·macOS 빌드에 필수 (macOS 전용)                                   |
| **CocoaPods**       | iOS·macOS 의존성 관리자. Flutter 플러그인이 Native iOS 코드를 포함할 때 사용                   |
| **AVD**             | Android Virtual Device. Android Studio로 만드는 소프트웨어 기반 Android 기기                   |
| **iOS Simulator**   | Xcode 내장 iOS 가상 기기 (macOS 전용)                                                          |
| **adb**             | Android Debug Bridge. Android 기기와 PC를 연결하는 CLI 도구                                    |
| **flutter create**  | 새 Flutter 프로젝트를 생성하는 CLI 명령                                                        |
| **flutter pub get** | pubspec.yaml에 선언된 의존성 패키지를 다운로드하는 명령                                        |
| **pubspec.yaml**    | Flutter 프로젝트의 메타데이터·의존성·에셋을 선언하는 핵심 설정 파일                            |
| **Hot Reload**      | 앱 재시작 없이 코드 변경을 즉시 반영. `r` 키 입력                                              |
| **Hot Restart**     | State를 초기화하고 앱을 재시작. `R` 키 입력                                                    |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Flutter SDK 구조

Flutter SDK를 설치하면 아래 구조가 생성된다.

```
flutter/
├── bin/
│   ├── flutter          ← CLI 진입점 (flutter run, flutter build 등)
│   └── dart             ← Dart SDK CLI (flutter에 내장)
├── packages/
│   └── flutter/         ← Flutter Framework 소스코드 (Dart)
├── examples/            ← 공식 예제 프로젝트
└── version              ← 현재 SDK 버전 정보
```

**flutter CLI가 하는 일:**

![flutter run 실행 파이프라인](/developer-open-book/diagrams/step03-flutter-run-pipeline.svg)

---

### 3.2 flutter doctor 진단 항목

`flutter doctor`는 개발 환경 전체를 점검하는 자가진단 도구다. 각 항목의 의미를 알면 오류 발생 시 스스로 해결할 수 있다.

```
Doctor summary (출력 예시):
[✓] Flutter (Channel stable, 3.x.x)
[✓] Android toolchain (Android SDK version 34.x.x)
[✓] Xcode - develop for iOS and macOS (Xcode 15.x)
[✓] Chrome - develop for the web
[✓] Android Studio (version 2023.x)
[✓] VS Code (version 1.x.x)
[✓] Connected device (2 available)
[✓] Network resources
```

| 항목                  | 점검 내용                          | 주요 오류 원인                              |
| --------------------- | ---------------------------------- | ------------------------------------------- |
| **Flutter**           | SDK 버전, Channel, PATH 등록 여부  | PATH 미등록, 구버전 SDK                     |
| **Android toolchain** | Android SDK, adb, Java 버전        | ANDROID_HOME 미설정, Java 버전 불일치       |
| **Xcode**             | Xcode 버전, 라이선스 동의 여부     | 라이선스 미동의(`sudo xcodebuild -license`) |
| **Chrome**            | 웹 개발용 Chrome 설치 여부         | Chrome 미설치                               |
| **Android Studio**    | IDE·플러그인 설치 여부             | Flutter·Dart 플러그인 미설치                |
| **VS Code**           | IDE·플러그인 설치 여부             | Flutter 확장 미설치                         |
| **Connected device**  | 연결된 기기·에뮬레이터 수          | USB 디버깅 미활성화                         |
| **Network resources** | pub.dev 등 네트워크 접근 가능 여부 | 방화벽, 프록시 설정                         |

**doctor 출력 기호 의미:**

```
[✓]  정상
[!]  경고: 동작은 하지만 권장 설정 미완료
[✗]  오류: 필수 설정 누락으로 일부 기능 불가
```

---

### 3.3 FVM: 버전 관리가 필요한 이유

실무에서는 여러 Flutter 프로젝트를 동시에 관리하는 상황이 자주 발생한다.

```
실무 시나리오 (FVM 없을 때의 문제)
─────────────────────────────────────────────────────────
  프로젝트 A (레거시): Flutter 3.3.x 필요
  프로젝트 B (신규):   Flutter 3.22.x 필요

  전역 SDK를 3.22.x로 업그레이드
       ↓
  프로젝트 A 빌드 오류 발생
       ↓
  다시 3.3.x로 다운그레이드 → 반복...
─────────────────────────────────────────────────────────
```

FVM은 프로젝트 루트에 `.fvm/fvm_config.json`을 생성해 **해당 프로젝트가 사용할 SDK 버전을 고정**한다.

```
FVM 적용 후
─────────────────────────────────────────────────────────
  프로젝트 A/
  ├── .fvm/fvm_config.json  ← { "flutterSdkVersion": "3.3.10" }
  └── ...

  프로젝트 B/
  ├── .fvm/fvm_config.json  ← { "flutterSdkVersion": "3.22.0" }
  └── ...

  각 프로젝트에서 fvm flutter run 실행 시
  → 해당 프로젝트의 지정 버전 자동 사용
─────────────────────────────────────────────────────────
```

---

### 3.4 Flutter 프로젝트 디렉토리 구조

`flutter create my_app` 실행 시 생성되는 구조와 각 폴더의 역할을 이해해야 한다.

```
my_app/
├── lib/                   ← Dart 코드 작성 공간 (핵심)
│   └── main.dart          ← 앱 진입점
│
├── android/               ← Android 네이티브 코드 및 빌드 설정
│   ├── app/
│   │   └── build.gradle   ← Android 앱 빌드 설정
│   └── build.gradle
│
├── ios/                   ← iOS 네이티브 코드 및 빌드 설정
│   ├── Runner/
│   └── Podfile            ← CocoaPods 의존성 선언
│
├── web/                   ← 웹 빌드 관련 파일
│   ├── index.html
│   └── manifest.json
│
├── assets/                ← 이미지, 폰트, JSON 등 정적 에셋 (직접 생성)
│
├── test/                  ← 테스트 코드
│   └── widget_test.dart
│
├── pubspec.yaml           ← 프로젝트 메타데이터, 의존성, 에셋 선언 ★
├── pubspec.lock           ← 의존성 정확한 버전 잠금 (자동 생성)
├── .dart_tool/            ← Dart 툴 캐시 (자동 생성, git 제외)
└── .flutter-plugins-dependencies  ← 플러그인 정보 (자동 생성)
```

**pubspec.yaml 구조:**

```yaml
name: my_app # 프로젝트 이름
description: A Flutter project # 설명
version: 1.0.0+1 # 앱 버전 (버전명+빌드번호)

environment:
  sdk: ">=3.0.0 <4.0.0" # Dart SDK 버전 범위

dependencies: # 런타임 의존성
  flutter:
    sdk: flutter
  http: ^1.2.0 # pub.dev 패키지
  provider: ^6.1.0

dev_dependencies: # 개발 전용 의존성 (테스트 등)
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  assets: # 앱에 포함할 에셋 선언
    - assets/images/
    - assets/data/config.json
  fonts: # 커스텀 폰트 선언
    - family: NotoSansKR
      fonts:
        - asset: assets/fonts/NotoSansKR-Regular.ttf
```

> ⚠️ **함정 주의:** `pubspec.yaml`에서 **들여쓰기(indentation)** 는 반드시 스페이스 2칸을 사용해야 한다. 탭을 사용하면 파싱 오류가 발생한다.

---

### 3.5 Flutter CLI 핵심 명령

| 명령                         | 설명                                 |
| ---------------------------- | ------------------------------------ |
| `flutter create <name>`      | 새 프로젝트 생성                     |
| `flutter run`                | 앱 실행 (연결된 기기에)              |
| `flutter run -d <device_id>` | 특정 기기에 실행                     |
| `flutter build apk`          | Android APK 빌드                     |
| `flutter build ios`          | iOS 빌드 (macOS 전용)                |
| `flutter build web`          | Web 빌드                             |
| `flutter pub get`            | 의존성 패키지 다운로드               |
| `flutter pub add <package>`  | 패키지 추가 (pubspec.yaml 자동 수정) |
| `flutter pub upgrade`        | 패키지 최신 버전으로 업그레이드      |
| `flutter clean`              | 빌드 캐시 삭제                       |
| `flutter doctor`             | 환경 진단                            |
| `flutter devices`            | 연결된 기기 목록 확인                |
| `flutter channel`            | 현재 채널 확인                       |
| `flutter upgrade`            | SDK 최신 버전으로 업그레이드         |
| `flutter analyze`            | Dart 정적 분석 실행                  |
| `flutter test`               | 테스트 실행                          |

**Flutter Channel 이해:**

```
stable   ← 안정 버전 (프로덕션 권장)
beta     ← 다음 stable 후보 (새 기능 미리 사용)
main     ← 최신 커밋 (불안정, 실험적)
```

---

### 3.6 IDE 설정: Android Studio vs VSCode

두 IDE 모두 공식 지원되며, Flutter·Dart 플러그인을 통해 동일한 핵심 기능을 제공한다.

| 기능                  | Android Studio      | VSCode                      |
| --------------------- | ------------------- | --------------------------- |
| Flutter 플러그인      | ✅ 내장 지원        | ✅ Flutter 확장 설치        |
| 코드 자동완성         | ✅ 우수             | ✅ 우수                     |
| Widget Inspector      | ✅ 통합             | ✅ DevTools 연동            |
| Android Emulator 관리 | ✅ AVD Manager 내장 | ⚠️ 별도 Android Studio 필요 |
| Gradle 빌드 디버깅    | ✅ 강력             | ⚠️ 제한적                   |
| 시작 속도·메모리      | 느림·무거움         | 빠름·가벼움                 |
| 커스터마이징          | 보통                | 매우 유연                   |

**VSCode 필수 확장:**

```
Flutter         ← Dart + Flutter 공식 확장 (dart 포함)
Dart            ← Dart 언어 지원 (Flutter 확장에 포함)
Pubspec Assist  ← pubspec.yaml 패키지 버전 자동완성
Error Lens      ← 인라인 오류 메시지 표시
```

---

### 3.7 Android Emulator와 iOS Simulator 원리

#### Android Emulator (AVD)

AVD(Android Virtual Device)는 QEMU 기반 가상화 기술로 Android 기기를 소프트웨어로 시뮬레이션한다.

```
AVD 실행 구조
─────────────────────────────────────────────────────────
  PC OS (macOS/Windows/Linux)
    └── QEMU 가상화 레이어
          └── 가상 Android OS
                └── Flutter 앱 실행
─────────────────────────────────────────────────────────
  Intel HAXM 또는 AMD 가속 활성화 시 성능 대폭 향상
  (하드웨어 가속 없으면 매우 느림)
```

**AVD 성능 개선 핵심 설정:**

| 설정      | 권장값      | 이유                         |
| --------- | ----------- | ---------------------------- |
| RAM       | 2048MB 이상 | 앱 구동에 필요한 최소 메모리 |
| VM Heap   | 512MB 이상  | 앱 내 가비지 컬렉션 안정화   |
| Graphics  | Hardware    | GPU 가속 활성화              |
| API Level | 34 이상     | 최신 Android 동작 검증       |

#### iOS Simulator (macOS 전용)

iOS Simulator는 QEMU 가상화가 아닌 **macOS 네이티브 코드**로 iOS 앱을 실행한다. 따라서 AVD보다 훨씬 빠르고 실기기에 가까운 성능을 보여준다.

```
iOS Simulator 구조
─────────────────────────────────────────────────────────
  macOS (x86_64 또는 Apple Silicon)
    └── Simulator.app (Xcode 내장)
          └── iOS 앱 (x86_64 또는 arm64 빌드)
─────────────────────────────────────────────────────────
  실기기와의 주요 차이:
  - 카메라, Touch ID, Face ID, 특정 센서 미지원
  - 네트워크 조건이 실기기와 다를 수 있음
  - 메모리 제한이 실기기보다 관대함
```

---

## 4. 사례 연구

### 4.1 팀 프로젝트에서 FVM이 빌드 오류를 막은 사례

5명이 참여하는 Flutter 프로젝트에서 팀원 A가 Flutter를 3.22로 업그레이드했다. 팀원 B·C는 아직 3.16을 사용 중이었다. 결과적으로 B와 C의 로컬에서 빌드가 실패했고, 원인 파악에 반나절을 소비했다.

FVM을 도입하고 `.fvm/fvm_config.json`을 Git에 커밋하면 모든 팀원이 동일한 버전으로 자동 맞춰진다.

```json
// .fvm/fvm_config.json (Git에 포함)
{
  "flutterSdkVersion": "3.22.0",
  "flavors": {}
}
```

**CI/CD와의 연동:**

```yaml
# GitHub Actions에서 FVM 버전 자동 사용
- uses: subosito/flutter-action@v2
  with:
    flutter-version-file: .fvm/fvm_config.json
```

---

### 4.2 flutter doctor로 자가 진단하는 법

`flutter doctor -v`(상세 모드)를 실행하면 문제의 정확한 원인과 해결 명령까지 안내한다.

```
[!] Android toolchain
    ✗ Android license status unknown.
      Run `flutter doctor --android-licenses` to accept the SDK licenses.
      See https://flutter.dev/docs/get-started/install/macos#android-setup
      for more details.
```

이 경우 안내된 명령어 `flutter doctor --android-licenses`를 실행하고 `y`를 눌러 라이선스에 동의하면 해결된다. 이처럼 `flutter doctor`의 출력을 읽는 능력 자체가 Flutter 개발자의 핵심 역량이다.

---

### 4.3 프로젝트 생성 옵션 활용

```bash
# 기본 생성
flutter create my_app

# 웹·데스크톱 지원 포함
flutter create my_app --platforms=web,windows,macos

# 특정 Organization ID 지정 (배포 시 중요)
flutter create --org com.example my_app

# 빈 프로젝트 (카운터 예제 없이)
flutter create --empty my_app

# 특정 언어 지정 (Android Native 코드)
flutter create --android-language kotlin --ios-language swift my_app
```

---

## 5. 실습

### 5.1 Flutter SDK 설치 및 환경 확인

**macOS 기준 (Windows·Linux는 공식 문서 참조)**

```bash
# Step 1: FVM 설치 (Homebrew 사용)
brew tap leoafarias/fvm
brew install fvm

# Step 2: Flutter stable 버전 설치
fvm install stable

# Step 3: 전역 기본 버전 지정
fvm global stable

# Step 4: PATH 설정 (~/.zshrc 또는 ~/.bash_profile에 추가)
export PATH="$PATH:$HOME/fvm/default/bin"

# Step 5: 환경 진단
flutter doctor
```

**doctor 출력 해석 체크:**

- `[✓]` 항목은 정상 — 넘어간다.
- `[!]` 항목은 경고 — 출력된 명령을 실행해 해결한다.
- `[✗]` 항목은 오류 — 해당 도구 설치 또는 설정이 누락된 것이다.

---

### 5.2 첫 번째 Flutter 프로젝트 생성 및 실행

```bash
# Step 1: 프로젝트 생성
fvm flutter create --org com.myapp first_app
cd first_app

# Step 2: 프로젝트별 FVM 버전 고정
fvm use stable

# Step 3: 의존성 다운로드
fvm flutter pub get

# Step 4: 연결된 기기 확인
fvm flutter devices

# Step 5: 실행 (에뮬레이터 또는 실기기)
fvm flutter run

# Step 6: Web으로 실행
fvm flutter run -d chrome
```

**실행 후 Hot Reload 테스트:**

`lib/main.dart`에서 아래 부분을 찾아 텍스트를 바꾸고 터미널에서 `r`을 누른다.

```dart
// 변경 전
Text('You have pushed the button this many times:'),

// 변경 후 (저장 후 터미널에서 r 입력)
Text('버튼을 누른 횟수:'),
```

앱이 재시작 없이 즉시 반영되면 Hot Reload가 정상 동작하는 것이다.

---

### 5.3 프로젝트 구조 탐색

생성된 프로젝트에서 아래 파일들을 직접 열어 역할을 확인하라.

```bash
# 프로젝트 구조 출력
find . -not -path './.dart_tool/*' \
       -not -path './.fvm/*' \
       -not -path './build/*' \
       -not -path './.git/*' | head -40
```

**확인 파일 목록:**

| 파일                       | 확인할 내용                               |
| -------------------------- | ----------------------------------------- |
| `lib/main.dart`            | `main()` 진입점, `runApp()` 호출          |
| `pubspec.yaml`             | 프로젝트 이름, dependencies, flutter 섹션 |
| `android/app/build.gradle` | applicationId (패키지명), minSdkVersion   |
| `ios/Runner/Info.plist`    | CFBundleIdentifier (iOS 번들 ID)          |
| `test/widget_test.dart`    | 기본 Widget Test 예시                     |

---

### 5.4 자가 평가 퀴즈

**Q1. [Remember]** `flutter doctor`에서 `[!]` 기호의 의미는?

- A) 치명적 오류, 빌드 불가
- B) **경고: 동작은 하지만 권장 설정 미완료** ✅
- C) 정상
- D) 네트워크 오류

---

**Q2. [Remember]** iOS 앱 빌드가 가능한 OS는?

- A) Windows
- B) Linux
- C) **macOS 전용** ✅
- D) 모든 OS

---

**Q3. [Understand]** FVM을 사용하는 주요 이유로 올바른 것은?

- A) Flutter SDK 다운로드 속도를 높인다
- B) Dart 코드 컴파일 성능을 향상시킨다
- C) **프로젝트마다 다른 Flutter SDK 버전을 독립적으로 관리한다** ✅
- D) Android Emulator 성능을 개선한다

---

**Q4. [Understand]** `pubspec.yaml`에서 `dependencies`와 `dev_dependencies`의 차이는?

> **모범 답안:** `dependencies`는 앱 런타임에 실제로 필요한 패키지(예: `http`, `provider`)를 선언한다. `dev_dependencies`는 개발·테스트 중에만 필요하고 최종 앱 번들에는 포함되지 않는 패키지(예: `flutter_test`, `flutter_lints`)를 선언한다.

---

**Q5. [Apply]** `flutter create`로 생성한 프로젝트에서 앱 시작 진입점 파일과 함수명을 적어라.

> **모범 답안:** 파일: `lib/main.dart`, 함수: `main()`. `main()` 함수 안에서 `runApp()`을 호출하며 Flutter Engine에 위젯 트리를 전달한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- Flutter 개발 환경은 **Flutter SDK + FVM + IDE + Platform SDK + 실행 환경** 5개 레이어로 구성된다.
- `flutter doctor`는 환경 문제를 자동 진단하며, `[✗]`·`[!]` 항목의 안내 명령을 따르면 대부분 해결된다.
- **FVM**은 프로젝트별 SDK 버전을 `.fvm/fvm_config.json`으로 고정해 팀 협업과 CI/CD 일관성을 보장한다.
- `pubspec.yaml`은 프로젝트의 핵심 설정 파일로, 들여쓰기는 반드시 **스페이스 2칸**을 사용한다.
- iOS 빌드는 **macOS에서만** 가능하다.

### 6.2 다음 Step 예고

- **Step 04 — Widget 개념:** Flutter UI의 핵심인 Widget / Element / RenderObject Three Trees의 역할과 Build 과정을 학습한다.

### 6.3 참고 자료

| 자료                     | 링크                                               | 설명                       |
| ------------------------ | -------------------------------------------------- | -------------------------- |
| Flutter 공식 설치 가이드 | <https://docs.flutter.dev/get-started/install>     | OS별 설치 방법             |
| FVM 공식 문서            | <https://fvm.app>                                  | Flutter Version Manager    |
| Flutter CLI 레퍼런스     | <https://docs.flutter.dev/reference/flutter-cli>   | 전체 CLI 명령 목록         |
| pub.dev                  | <https://pub.dev>                                  | Flutter·Dart 패키지 저장소 |
| Flutter DevTools         | <https://docs.flutter.dev/tools/devtools/overview> | 성능 분석·디버깅 도구      |

### 6.4 FAQ

**Q. `flutter pub get`과 `flutter pub upgrade`의 차이는?**

> `pub get`은 `pubspec.yaml`에 명시된 버전 범위 내에서 `pubspec.lock`에 기록된 정확한 버전을 설치한다. `pub upgrade`는 버전 범위 내 최신 버전으로 모든 패키지를 올리고 `pubspec.lock`을 갱신한다.

**Q. `flutter clean`은 언제 실행해야 하는가?**

> 패키지를 추가·변경했는데 빌드가 이상할 때, 또는 장기간 작업 중단 후 재개할 때 실행한다. 빌드 캐시를 완전히 삭제하므로 다음 빌드 시간이 길어지지만 캐시로 인한 이상 동작을 방지한다.

**Q. Android Emulator가 너무 느리다면?**

> BIOS에서 하드웨어 가상화(Intel VT-x / AMD-V)가 활성화되어 있는지 확인한다. Android Studio에서 HAXM(Intel) 또는 WHPX(AMD/Windows)가 설치되어 있어야 한다. 그래도 느리다면 실기기 USB 디버깅을 권장한다.

---

## 빠른 자가진단 체크리스트

- [ ] `flutter doctor` 실행 결과를 해석하고 문제를 해결할 수 있는가?
- [ ] FVM이 왜 필요한지, 어떻게 동작하는지 설명할 수 있는가?
- [ ] Flutter 프로젝트의 폴더 구조에서 각 디렉토리의 역할을 말할 수 있는가?
- [ ] `pubspec.yaml`의 `dependencies` vs `dev_dependencies` 차이를 설명할 수 있는가?
- [ ] Hot Reload(`r`)와 Hot Restart(`R`)의 차이를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: iOS 빌드가 macOS 전용인 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: `pubspec.yaml` 들여쓰기는 스페이스 2칸임을 기억하는가?
