# Step 30 — CI/CD 자동화

> **파트:** 🔟 배포 & CI/CD | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 150분
> 이론 75% + 실습 25% | Bloom 단계: Applying → Evaluating → Creating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** CI/CD 파이프라인이 Flutter 개발 생산성을 어떻게 향상시키는지 설명할 수 있다.
2. **[Understand]** GitHub Actions·Codemagic·Fastlane 각각의 역할과 적합한 사용 시나리오를 설명할 수 있다.
3. **[Apply]** GitHub Actions Workflow로 PR 생성 시 자동 테스트를 실행할 수 있다.
4. **[Apply]** GitHub Actions로 main 브랜치 푸시 시 Android AAB 자동 빌드 파이프라인을 구성할 수 있다.
5. **[Apply]** Codemagic으로 iOS 빌드·TestFlight 자동 배포를 설정할 수 있다.
6. **[Evaluate]** 팀 규모와 프로젝트 상황에 따라 적합한 CI/CD 도구를 선택하고 근거를 제시할 수 있다.

**전제 지식:** Step 23(Flutter 테스팅), Step 29(앱 빌드·배포·Keystore·서명)

---

## 1. 서론

### 1.1 CI/CD가 해결하는 문제

![수동 배포의 고통](/developer-open-book/diagrams/flutter-step30-manual-deploy-pain.svg)

### 1.2 CI와 CD의 차이

![CI vs CD](/developer-open-book/diagrams/flutter-step30-ci-cd-concept.svg)

### 1.3 전체 개념 지도

![Flutter CI/CD 기술 스택](/developer-open-book/diagrams/flutter-step30-flutter-cicd-stack.svg)

---

## 2. 기본 개념과 용어

| 용어                   | 정의                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| **CI**                 | Continuous Integration. 코드 변경마다 자동으로 빌드·테스트 실행                  |
| **CD**                 | Continuous Delivery/Deployment. 빌드 결과물을 자동으로 배포 환경에 전달          |
| **GitHub Actions**     | GitHub 저장소에 내장된 CI/CD 자동화 도구. YAML 워크플로우 파일로 정의            |
| **Workflow**           | GitHub Actions의 자동화 작업 단위. `.github/workflows/*.yml` 파일                |
| **Job**                | Workflow 내 독립적으로 실행되는 작업 묶음                                        |
| **Step**               | Job 안의 개별 실행 단계. Shell 명령 또는 Action                                  |
| **Action**             | 재사용 가능한 GitHub Actions 단계. `actions/checkout@v4` 같은 공개 Action        |
| **Runner**             | Workflow를 실행하는 가상 머신. `ubuntu-latest`, `macos-latest`, `windows-latest` |
| **Secret**             | GitHub 저장소에 암호화 저장되는 민감 정보. API 키·Keystore 등                    |
| **Codemagic**          | Flutter/React Native 전용 CI/CD 서비스. macOS Runner 제공                        |
| **Fastlane**           | 모바일 앱 배포 자동화 Ruby 도구. Lane 단위로 작업 정의                           |
| **Lane**               | Fastlane에서 특정 작업 흐름을 정의하는 단위                                      |
| **codemagic.yaml**     | Codemagic 파이프라인을 코드로 정의하는 설정 파일                                 |
| **self-hosted runner** | GitHub Actions에서 자체 서버를 Runner로 사용하는 방식                            |

---

## 3. 이론적 배경과 원리 ★

### 3.1 GitHub Actions 기본 구조

```yaml
# .github/workflows/workflow-name.yml

name: 워크플로우 이름

# 트리거: 언제 실행할지
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 9 * * 1" # 매주 월요일 오전 9시

# 작업 정의
jobs:
  job-name:
    runs-on: ubuntu-latest # 실행 환경

    steps:
      - name: 코드 체크아웃
        uses: actions/checkout@v4

      - name: Flutter 설치
        uses: subosito/flutter-action@v2
        with:
          flutter-version: "3.22.0"
          channel: stable

      - name: 의존성 설치
        run: flutter pub get

      - name: 테스트 실행
        run: flutter test
```

---

### 3.2 PR 자동 테스트 워크플로우 (CI)

```yaml
# .github/workflows/ci.yml
name: CI — PR 자동 테스트

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: 테스트 실행
    runs-on: ubuntu-latest

    steps:
      # 1. 코드 체크아웃
      - name: 체크아웃
        uses: actions/checkout@v4

      # 2. Java 설치 (Android 빌드용)
      - name: Java 설치
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      # 3. Flutter 설치 (FVM 설정과 연동)
      - name: Flutter 설치
        uses: subosito/flutter-action@v2
        with:
          flutter-version-file: .fvm/fvm_config.json
          cache: true # Flutter SDK 캐시로 속도 향상

      # 4. 의존성 설치
      - name: pub get
        run: flutter pub get

      # 5. 정적 분석
      - name: 분석
        run: flutter analyze --fatal-infos

      # 6. 코드 포맷 검사
      - name: 포맷 검사
        run: dart format --output none --set-exit-if-changed .

      # 7. 단위·위젯 테스트
      - name: 테스트
        run: flutter test --coverage

      # 8. 커버리지 리포트 업로드 (선택)
      - name: 커버리지 업로드
        uses: codecov/codecov-action@v4
        with:
          file: coverage/lcov.info
          fail_ci_if_error: false

  # Android 빌드 검증 (선택)
  build-android:
    name: Android 빌드 검증
    runs-on: ubuntu-latest
    needs: test # test Job 통과 후 실행

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - uses: subosito/flutter-action@v2
        with:
          flutter-version-file: .fvm/fvm_config.json
          cache: true

      - run: flutter pub get

      # Debug APK만 빌드 (서명 없이도 가능)
      - name: Android 빌드 검증
        run: flutter build apk --debug
```

---

### 3.3 Android 자동 빌드·배포 워크플로우 (CD)

```yaml
# .github/workflows/deploy-android.yml
name: CD — Android 자동 배포

on:
  push:
    branches: [main]
    tags:
      - "v*" # v1.2.3 태그 푸시 시에도 실행

jobs:
  deploy-android:
    name: Android AAB 빌드 및 Play Store 업로드
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      - uses: subosito/flutter-action@v2
        with:
          flutter-version-file: .fvm/fvm_config.json
          cache: true

      - run: flutter pub get

      # Keystore 복원 (GitHub Secret에서)
      - name: Keystore 파일 복원
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > android/app/upload-keystore.jks

      # key.properties 생성
      - name: key.properties 생성
        run: |
          cat > android/key.properties << EOF
          storePassword=${{ secrets.KEY_STORE_PASSWORD }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          storeFile=upload-keystore.jks
          EOF

      # 버전 번호 자동 증가 (선택)
      - name: 버전 설정
        run: |
          BUILD_NUMBER=${{ github.run_number }}
          flutter build appbundle --release \
            --build-number=$BUILD_NUMBER \
            --dart-define=ENV=prod

      # AAB 빌드 (위 단계에서 이미 빌드했다면 생략)
      # - name: AAB 빌드
      #   run: flutter build appbundle --release

      # Play Store 업로드 (fastlane 또는 직접 API)
      - name: Play Store 업로드
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
          packageName: com.example.myapp
          releaseFiles: build/app/outputs/bundle/release/*.aab
          track: internal # internal → alpha → beta → production
          status: completed

      # Slack 알림 (선택)
      - name: 배포 완료 알림
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: "✅ Android 내부 테스트 배포 완료!"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**GitHub Secrets 등록 방법:**

```bash
# GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

# Keystore를 Base64로 인코딩
base64 -i android/app/upload-keystore.jks | pbcopy
# → KEYSTORE_BASE64 Secret으로 등록

# 등록해야 할 Secrets:
# KEYSTORE_BASE64      Keystore 파일 Base64 인코딩
# KEY_STORE_PASSWORD   Keystore 비밀번호
# KEY_PASSWORD         Key 비밀번호
# KEY_ALIAS            Key 별칭 (upload)
# SERVICE_ACCOUNT_JSON Google Play API 서비스 계정 JSON
```

---

### 3.4 iOS 빌드: Codemagic 활용

GitHub Actions의 무료 macOS Runner는 월 실행 시간 제한이 있다. iOS 빌드가 많다면 **Codemagic** (Flutter 전용, macOS 환경 제공)이 더 경제적이다.

#### Codemagic YAML 설정

```yaml
# codemagic.yaml
workflows:
  ios-release:
    name: iOS 릴리즈 빌드
    max_build_duration: 60 # 분 단위
    instance_type: mac_mini_m2 # macOS Apple Silicon

    environment:
      flutter: 3.22.0
      xcode: latest
      cocoapods: default
      vars:
        BUNDLE_ID: com.example.myapp
        APP_STORE_APPLE_ID: "12345678"
      groups:
        - app_store_credentials # Codemagic 환경 변수 그룹

    triggering:
      events:
        - push
      branch_patterns:
        - pattern: main
          include: true

    scripts:
      - name: Flutter pub get
        script: flutter pub get

      - name: iOS 테스트
        script: flutter test

      - name: iOS 빌드
        script: |
          flutter build ipa --release \
            --export-options-plist=/Users/builder/export_options.plist

    artifacts:
      - build/ios/ipa/*.ipa
      - flutter_drive.log

    publishing:
      app_store_connect:
        api_key_id: $APP_STORE_KEY_ID
        api_issuer_id: $APP_STORE_ISSUER_ID
        api_private_key: $APP_STORE_PRIVATE_KEY
        submit_to_testflight: true
        beta_groups:
          - 내부 테스터

      email:
        recipients:
          - dev@example.com
        notify:
          success: true
          failure: true
```

---

### 3.5 Fastlane: 배포 레시피 관리

Fastlane은 `Fastfile`에 재사용 가능한 배포 레시피(Lane)를 정의한다.

#### 설치

```bash
# macOS
brew install fastlane

# 프로젝트 초기화 (android/ 또는 ios/ 디렉토리에서)
fastlane init
```

#### Android Fastfile

```ruby
# android/fastlane/Fastfile

default_platform(:android)

platform :android do

  # 내부 테스트 배포
  lane :internal do
    gradle(
      task: "bundle",
      build_type: "Release",
      print_command: false,
      properties: {
        "android.injected.signing.store.file"     => ENV["KEYSTORE_PATH"],
        "android.injected.signing.store.password" => ENV["KEY_STORE_PASSWORD"],
        "android.injected.signing.key.alias"      => ENV["KEY_ALIAS"],
        "android.injected.signing.key.password"   => ENV["KEY_PASSWORD"],
      }
    )
    upload_to_play_store(
      track: 'internal',
      aab:   'app/build/outputs/bundle/release/app-release.aab'
    )
    slack(
      message:     "🚀 Android 내부 테스트 배포 완료!",
      webhook_url: ENV["SLACK_WEBHOOK"]
    )
  end

  # 프로덕션 배포 (단계적 출시)
  lane :production do |options|
    rollout = options[:rollout] || 0.1   # 기본 10% 출시

    upload_to_play_store(
      track:   'production',
      rollout: rollout,
      aab:     'app/build/outputs/bundle/release/app-release.aab'
    )
  end

  # 버전 자동 증가
  lane :bump_version do
    # build.gradle의 versionCode 자동 증가
    android_set_version_code(
      version_code: (google_play_track_version_codes(track: 'internal').max || 0) + 1
    )
  end
end
```

#### iOS Fastfile

```ruby
# ios/fastlane/Fastfile

default_platform(:ios)

platform :ios do

  # TestFlight 배포
  lane :beta do
    # 코드 서명 (match로 인증서 관리)
    match(type: "appstore")

    # 빌드 번호 자동 증가
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )

    # 빌드
    build_app(
      scheme:         "Runner",
      export_method:  "app-store",
      output_directory: "./build/ios/ipa"
    )

    # TestFlight 업로드
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      groups: ["내부 테스터"]
    )

    # 알림
    slack(
      message:     "📱 iOS TestFlight 업로드 완료!",
      webhook_url: ENV["SLACK_WEBHOOK"]
    )
  end

  # App Store 제출
  lane :release do
    match(type: "appstore")
    build_app(scheme: "Runner", export_method: "app-store")
    upload_to_app_store(
      submit_for_review:         false,   # 수동 심사 제출
      automatic_release:         false,
      skip_screenshots:          true,
      skip_metadata:             false
    )
  end
end
```

---

### 3.6 전체 파이프라인 설계

![브랜치 전략별 파이프라인](/developer-open-book/diagrams/flutter-step30-branch-strategy.svg)

---

### 3.7 CI/CD 도구 선택 기준

| 상황                         | 권장 도구                 | 이유                                 |
| ---------------------------- | ------------------------- | ------------------------------------ |
| 소규모 팀, Android 중심      | GitHub Actions            | 무료 플랜 충분, 설정 간단            |
| iOS 빌드 빈번                | Codemagic                 | macOS 환경 제공, Flutter 전용 최적화 |
| 복잡한 배포 레시피           | Fastlane + GitHub Actions | 재사용 가능한 Lane, 다양한 플러그인  |
| 엔터프라이즈, 완전 자체 관리 | Self-hosted Runner        | 보안·비용 통제                       |
| Flutter 입문, 빠른 설정      | Codemagic GUI             | 코드 없이 클릭으로 설정              |

---

## 4. 사례 연구

### 4.1 인디 앱 개발자: 수동 배포 2시간 → 15분

![CI/CD 도입 전후 비교](/developer-open-book/diagrams/flutter-step30-before-after-cicd.svg)

---

### 4.2 GitHub Actions 최적화: 캐시로 빌드 속도 향상

```yaml
# Flutter SDK와 pub 패키지 캐시
- name: Flutter 설치 (캐시 사용)
  uses: subosito/flutter-action@v2
  with:
    flutter-version-file: .fvm/fvm_config.json
    cache: true # Flutter SDK 캐시

- name: pub get (캐시 사용)
  uses: actions/cache@v4
  with:
    path: |
      ~/.pub-cache
      .dart_tool
    key: pub-${{ hashFiles('**/pubspec.lock') }}
    restore-keys: pub-

- run: flutter pub get

# Gradle 캐시
- name: Gradle 캐시
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
    restore-keys: gradle-
```

**캐시 효과:**

- Flutter SDK 캐시: 첫 실행 3분 → 이후 30초
- pub 캐시: 1분 → 5초
- Gradle 캐시: 5분 → 30초

---

### 4.3 다중 환경 배포 전략

```yaml
# 환경별 dart-define을 사용한 빌드
jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version-file: .fvm/fvm_config.json

      - run: flutter pub get

      - name: ${{ matrix.environment }} 빌드
        run: |
          flutter build appbundle --release \
            --dart-define=ENV=${{ matrix.environment }} \
            --dart-define=API_URL=${{ vars[format('{0}_API_URL', matrix.environment)] }} \
            --build-number=${{ github.run_number }}

      - name: Play Store 업로드 (${{ matrix.environment }})
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
          packageName: com.example.myapp
          releaseFiles: build/app/outputs/bundle/release/*.aab
          track: ${{ matrix.environment == 'staging' && 'internal' || 'production' }}
```

---

## 5. 실습

### 5.1 PR 자동 테스트 워크플로우 작성

```bash
# 1. 디렉토리 생성
mkdir -p .github/workflows

# 2. CI 워크플로우 파일 생성
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  test:
    name: 테스트 & 분석
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true

      - name: 의존성 설치
        run: flutter pub get

      - name: 코드 분석
        run: flutter analyze

      - name: 테스트
        run: flutter test --coverage

      - name: 커버리지 리포트
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/lcov.info
EOF

echo "✅ CI 워크플로우 생성 완료"
cat .github/workflows/ci.yml
```

---

### 5.2 Android 자동 빌드 워크플로우 설정

```yaml
# .github/workflows/deploy-android.yml
# 이 파일을 프로젝트에 추가하고 GitHub Secrets를 설정하세요

name: CD — Android

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true

      - name: 의존성 설치
        run: flutter pub get

      - name: 테스트
        run: flutter test

      # Keystore 복원
      - name: Keystore 복원
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode \
            > android/app/upload-keystore.jks

      # key.properties 생성
      - name: key.properties 설정
        run: |
          cat > android/key.properties << EOF
          storePassword=${{ secrets.KEY_STORE_PASSWORD }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          storeFile=upload-keystore.jks
          EOF

      # AAB 빌드
      - name: AAB 빌드
        run: |
          flutter build appbundle --release \
            --build-number=${{ github.run_number }}

      # 빌드 산출물 저장
      - name: AAB 아티팩트 저장
        uses: actions/upload-artifact@v4
        with:
          name: android-release-${{ github.run_number }}
          path: build/app/outputs/bundle/release/app-release.aab
          retention-days: 14

      # Play Store 업로드 (SERVICE_ACCOUNT_JSON Secret 필요)
      # - name: Play Store 업로드
      #   uses: r0adkll/upload-google-play@v1
      #   with:
      #     serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
      #     packageName: com.example.myapp
      #     releaseFiles: build/app/outputs/bundle/release/*.aab
      #     track: internal
```

**GitHub Secrets 등록 가이드:**

```bash
# Keystore를 Base64로 인코딩
base64 -i android/app/upload-keystore.jks

# 등록 위치: GitHub 저장소 → Settings → Secrets → Actions
# 필요한 Secrets:
# KEYSTORE_BASE64       → base64 인코딩된 Keystore
# KEY_STORE_PASSWORD    → Keystore 비밀번호
# KEY_PASSWORD          → Key 비밀번호
# KEY_ALIAS             → Key 별칭
# SERVICE_ACCOUNT_JSON  → Play Store API 서비스 계정 JSON
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** CI와 CD의 차이를 설명하고 Flutter 프로젝트에서 각각의 역할 예시를 들어라.

> **모범 답안:** **CI(Continuous Integration)**는 코드 변경마다 자동으로 빌드·테스트를 실행해 코드 품질을 유지한다. Flutter 예시: PR 생성 시 `flutter analyze`·`flutter test`가 자동 실행되어 테스트 미통과 코드의 머지를 방지한다. **CD(Continuous Delivery/Deployment)**는 검증된 빌드를 배포 환경에 자동 전달한다. Flutter 예시: main 브랜치 머지 시 `flutter build appbundle --release` 후 Play Store 내부 테스트 트랙에 자동 업로드된다.

---

**Q2. [Understand]** GitHub Actions에서 `secrets.KEYSTORE_BASE64`처럼 Secret을 사용하는 이유는?

> **모범 답안:** Keystore 파일과 비밀번호처럼 민감한 정보를 YAML 파일에 직접 기입하면 GitHub 저장소를 볼 수 있는 누구에게나 노출된다. GitHub Secrets는 암호화되어 저장되며, Workflow 실행 시 환경 변수로 안전하게 주입된다. 로그에도 `***`로 마스킹되어 표시된다. 저장소가 공개(public)일 때 특히 중요하다.

---

**Q3. [Apply]** 아래 GitHub Actions 트리거 코드의 동작을 설명하라.

```yaml
on:
  push:
    branches: [main]
    tags:
      - "v*"
  pull_request:
    branches: [main]
```

> **모범 답안:** ① `main` 브랜치에 직접 push할 때 워크플로우가 실행된다. ② `v`로 시작하는 태그(예: `v1.2.3`, `v2.0.0`)를 push할 때 실행된다. ③ `main` 브랜치를 대상으로 하는 Pull Request가 생성·업데이트될 때 실행된다. 이 3가지 조건 중 하나라도 충족되면 워크플로우가 트리거된다.

---

**Q4. [Evaluate]** iOS 빌드가 주 2회 이상 필요한 팀에서 GitHub Actions 무료 플랜 대신 Codemagic을 선택해야 하는 이유는?

> **모범 답안:** GitHub Actions 무료 플랜은 월 2,000분의 실행 시간을 제공하지만, macOS Runner 사용 시 Linux의 10배 분으로 차감된다(실제 1분이 10분으로 계산). iOS 빌드 1회에 약 20분이 소요된다면 macOS 실제 비용은 200분이다. 주 2회 빌드면 월 1,600분으로 무료 플랜을 거의 소진한다. Codemagic은 Flutter 전용이라 빌드 환경이 최적화되어 있고, 월 500분 무료·유료 플랜도 GitHub Actions macOS 대비 경쟁력 있는 가격을 제공한다. 또한 App Store Connect 연동·TestFlight 자동 배포 등 iOS 특화 기능이 내장되어 있어 설정 시간도 절감된다.

---

**Q5. [Apply]** GitHub Actions에서 캐시를 사용하면 빌드 속도가 빨라지는 원리를 설명하라.

> **모범 답안:** GitHub Actions Runner는 매번 새로운 가상 머신에서 시작한다. 캐시가 없으면 Flutter SDK 다운로드(~1GB), pub 패키지 다운로드, Gradle 의존성 다운로드를 매 실행마다 반복한다. `actions/cache@v4`는 지정된 경로를 `key`(파일 해시 등)와 함께 저장한다. 다음 실행 시 같은 key가 있으면 캐시를 복원해 다운로드를 건너뛴다. `pubspec.lock` 해시를 key로 사용하면 의존성이 변경되지 않은 경우 pub 캐시를 재사용하고, 변경된 경우에만 새로 다운로드한다.

---

## 6. 결론 — 학습 로드맵 완료! 🎉

### 6.1 Step 30 핵심 요약

- **GitHub Actions**: PR→CI(테스트), main 머지→CD(빌드·배포). YAML Workflow로 정의. Secrets에 민감 정보 저장.
- **Codemagic**: Flutter 전용 CI/CD. macOS Runner 내장으로 iOS 빌드 최적. GUI 또는 `codemagic.yaml`로 설정.
- **Fastlane**: 재사용 가능한 배포 Lane. Android(`supply`)·iOS(`pilot`, `deliver`) 자동화.
- **캐시 최적화**: Flutter SDK·pub·Gradle 캐시로 빌드 시간 대폭 단축.
- **브랜치 전략**: feature→develop(CI)→main(CD)→태그(스토어 배포) 흐름 설계.

---

### 6.2 🏆 Flutter 학습 로드맵 30 Step 완주

**총 학습 경로 돌아보기:**

| 파트                 | Step  | 핵심 학습                       |
| -------------------- | ----- | ------------------------------- |
| 1️⃣ Flutter 전체 구조 | 01~03 | 아키텍처·Dart·개발 환경         |
| 2️⃣ UI 시스템         | 04~08 | Widget·Layout·Material          |
| 3️⃣ 사용자 인터랙션   | 09~11 | 제스처·Form·Navigation          |
| 4️⃣ 상태 관리         | 12~15 | setState·Provider·Riverpod·Bloc |
| 5️⃣ 비동기·데이터     | 16~18 | Future·HTTP·로컬 저장           |
| 5.5️⃣ 애니메이션      | 19    | AnimationController·Hero        |
| 6️⃣ 아키텍처          | 20~22 | Clean Arch·DI                   |
| 7️⃣ 테스팅            | 23    | Unit·Widget·Golden Test         |
| 8️⃣ 성능 최적화       | 24~25 | 렌더링·메모리 관리              |
| 9️⃣ 플랫폼 연동 & AI  | 26~28 | Native·AI·푸시 알림             |
| 🔟 배포 & CI/CD      | 29~30 | 빌드·배포·자동화                |

---

### 6.3 다음 단계 학습 제안

![Flutter 완주 후 심화 방향](/developer-open-book/diagrams/flutter-step30-learning-path.svg)

---

### 6.4 참고 자료

| 자료                       | 링크                                       | 설명                       |
| -------------------------- | ------------------------------------------ | -------------------------- |
| GitHub Actions 공식 문서   | <https://docs.github.com/en/actions>         | 전체 GitHub Actions 가이드 |
| subosito/flutter-action    | <https://github.com/subosito/flutter-action> | Flutter CI/CD Action       |
| Codemagic 공식 문서        | <https://docs.codemagic.io>                  | Codemagic 전체 가이드      |
| Fastlane 공식 문서         | <https://docs.fastlane.tools>                | Fastlane 전체 가이드       |
| Flutter 배포 자동화 가이드 | <https://docs.flutter.dev/deployment/cd>     | 공식 CD 가이드             |

### 6.5 FAQ

**Q. GitHub Actions 무료 플랜으로 충분한가?**

> Android 중심 프로젝트라면 무료 플랜(월 2,000분 Linux)으로 충분하다. iOS 빌드가 필요하다면 macOS는 Linux 대비 10배 분을 소비하므로 월 10회 이상 iOS 빌드 시 유료 플랜 또는 Codemagic이 경제적이다. Self-hosted Runner를 사용하면 무제한 실행이 가능하다.

**Q. Codemagic과 GitHub Actions를 함께 사용할 수 있는가?**

> 그렇다. Android CI/CD는 GitHub Actions(무료 Ubuntu Runner), iOS 빌드·TestFlight는 Codemagic(macOS Runner)으로 분담하는 전략이 실무에서 자주 사용된다. GitHub Push 이벤트를 Codemagic Webhook으로 연동하면 통합된 파이프라인을 구성할 수 있다.

**Q. 팀에 CI/CD가 없을 때 처음 도입하는 권장 순서는?**

> ① PR→자동 테스트(GitHub Actions CI) → ② main 머지→Android 빌드 검증 → ③ Android Play Store 내부 테스트 자동 배포 → ④ iOS TestFlight 자동 배포. 작은 것부터 시작해 팀이 자동화의 가치를 경험하면서 점진적으로 확장하는 것이 정착 성공률이 높다.

---

## 빠른 자가진단 체크리스트

- [ ] CI와 CD의 차이를 예시와 함께 설명할 수 있는가?
- [ ] GitHub Actions Workflow의 on·jobs·steps 구조를 설명할 수 있는가?
- [ ] GitHub Secrets를 사용해야 하는 이유와 등록 방법을 설명할 수 있는가?
- [ ] PR 자동 테스트 Workflow를 직접 작성할 수 있는가?
- [ ] Keystore를 Base64로 인코딩해 Secret으로 등록하는 방법을 설명할 수 있는가?
- [ ] Codemagic을 GitHub Actions 대신 선택해야 하는 상황을 설명할 수 있는가?
- [ ] GitHub Actions 캐시 최적화로 빌드 속도를 개선하는 방법을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: GitHub Actions Workflow 파일에 Keystore·비밀번호를 직접 입력하면 안 되며, Secrets를 사용해야 한다는 것을 이해했는가?

---

## 🎊 축하합니다! Flutter 학습 로드맵 30 Step을 완주했습니다

![Flutter 학습 여정 완료](/developer-open-book/diagrams/flutter-step30-journey-complete.svg)
