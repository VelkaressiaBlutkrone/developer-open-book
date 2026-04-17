# Step 29 — 앱 빌드 및 배포

> **파트:** 🔟 배포 & CI/CD | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** APK·AAB·IPA 각 빌드 산출물의 차이와 용도를 설명할 수 있다.
2. **[Understand]** Android 앱 서명(Keystore)과 iOS 앱 서명(Certificate·Provisioning Profile)이 필요한 이유를 설명할 수 있다.
3. **[Understand]** Play Store의 내부 테스트→비공개 테스트→공개 테스트→프로덕션 출시 단계를 설명할 수 있다.
4. **[Apply]** `flutter build apk/appbundle/ipa` 명령으로 릴리즈 빌드를 생성할 수 있다.
5. **[Apply]** Android Keystore를 생성하고 `build.gradle`에 서명 설정을 적용할 수 있다.
6. **[Apply]** Play Store / App Store Connect에 앱을 업로드하는 절차를 수행할 수 있다.

**전제 지식:** Step 03(Flutter 개발 환경·CLI), Step 01(Flutter 아키텍처·AOT 컴파일)

---

## 1. 서론

### 1.1 배포 흐름 전체 그림

![Flutter 앱 배포 파이프라인](/developer-open-book/diagrams/flutter-step29-deploy-pipeline.svg)

### 1.2 빌드 산출물 비교

| 산출물  | 플랫폼  | 용도                                                  |
| ------- | ------- | ----------------------------------------------------- |
| **APK** | Android | 직접 설치 (사이드로딩), 테스트 배포                   |
| **AAB** | Android | Play Store 제출 필수. Google이 기기별 최적화 APK 생성 |
| **IPA** | iOS     | App Store / TestFlight 제출, 직접 배포                |

### 1.3 전체 개념 지도

![앱 빌드 및 배포 핵심 항목](/developer-open-book/diagrams/flutter-step29-build-deploy-overview.svg)

---

## 2. 기본 개념과 용어

| 용어                     | 정의                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| **APK**                  | Android Application Package. Android 앱 설치 파일 형식                                       |
| **AAB**                  | Android App Bundle. Google이 권장하는 Android 배포 형식. Play Store에서 기기별 최적 APK 생성 |
| **IPA**                  | iOS App Store Package. iOS 앱 배포 파일 형식                                                 |
| **Keystore**             | Android 앱 서명에 사용하는 암호화 키 저장소. `.jks` 또는 `.keystore` 파일                    |
| **key.properties**       | Keystore 경로·비밀번호를 저장하는 Flutter 프로젝트 설정 파일                                 |
| **Certificate**          | Apple이 발급하는 개발자 인증서. iOS 앱 서명에 필요                                           |
| **Provisioning Profile** | Certificate + App ID + 기기 목록을 묶은 iOS 배포 승인 파일                                   |
| **App Store Connect**    | Apple의 앱 관리 포털. 앱 등록·TestFlight·심사 제출                                           |
| **TestFlight**           | iOS/macOS 앱을 심사 전에 테스터에게 배포하는 Apple 서비스                                    |
| **Play Console**         | Google의 Android 앱 관리 포털. 내부 테스트·출시 단계 관리                                    |
| **내부 테스트**          | Play Console의 최소 배포 단계. 팀원 100명까지, 즉시 배포                                     |
| **프로덕션 트랙**        | Play Console의 공개 배포 단계. 단계적 출시(1%→10%→100%) 가능                                 |
| **앱 서명**              | 앱의 출처와 무결성을 보증하는 디지털 서명. 변조 방지                                         |
| **obfuscation**          | 릴리즈 빌드에서 코드를 난독화해 역공학을 어렵게 하는 과정                                    |

---

## 3. 이론적 배경과 원리 ★

### 3.1 릴리즈 빌드 vs 디버그 빌드

![Debug 빌드 vs Release 빌드](/developer-open-book/diagrams/flutter-step29-debug-vs-release.svg)

---

### 3.2 Android 앱 서명 전체 절차

#### Step 1: Keystore 생성

```bash
# Keystore 생성 (최초 1회)
keytool -genkey -v \
  -keystore ~/upload-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload

# 입력 항목:
# 키 저장소 비밀번호 (기억 필수!)
# 이름, 조직, 도시, 국가 등 개인정보
```

> ⚠️ **함정 주의:** Keystore 파일과 비밀번호를 잃어버리면 기존 앱의 업데이트를 배포할 수 없다. Play Store는 동일한 서명 키로 서명된 업데이트만 허용한다. **Keystore를 절대로 Git에 커밋하지 말고**, 안전한 장소(1Password, AWS Secrets Manager 등)에 백업한다.

#### Step 2: key.properties 파일 생성

```properties
# android/key.properties (Git에서 제외 필수!)
storePassword=<키 저장소 비밀번호>
keyPassword=<키 비밀번호>
keyAlias=upload
storeFile=<Keystore 파일 절대 경로>
# 예: /Users/username/upload-keystore.jks
```

```bash
# .gitignore에 추가
echo "android/key.properties" >> .gitignore
echo "*.jks" >> .gitignore
echo "*.keystore" >> .gitignore
```

#### Step 3: build.gradle 서명 설정

```gradle
// android/app/build.gradle

// key.properties 로드
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    // 서명 설정
    signingConfigs {
        release {
            keyAlias     keystoreProperties['keyAlias']
            keyPassword  keystoreProperties['keyPassword']
            storeFile    keystoreProperties['storeFile']
                ? file(keystoreProperties['storeFile'])
                : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true      // 코드 최적화·난독화
            shrinkResources true    // 미사용 리소스 제거
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                          'proguard-rules.pro'
        }
    }
}
```

#### Step 4: AAB 빌드

```bash
# AAB 빌드 (Play Store 제출용)
flutter build appbundle --release

# 출력 경로:
# build/app/outputs/bundle/release/app-release.aab

# APK 빌드 (직접 설치·테스트용)
flutter build apk --release

# split-per-abi: CPU 아키텍처별 APK 생성 (크기 최적화)
flutter build apk --release --split-per-abi

# 출력:
# build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
# build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
# build/app/outputs/flutter-apk/app-x86_64-release.apk
```

---

### 3.3 Android 배포 전 필수 체크

#### pubspec.yaml 버전 관리

```yaml
# pubspec.yaml
version: 1.2.3+45
#        │ │ │  └─ 빌드 번호 (Play Store에서 항상 증가해야 함)
#        │ │ └─── 패치 버전
#        │ └───── 마이너 버전
#        └─────── 메이저 버전
```

```bash
# 빌드 전 버전 확인
cat pubspec.yaml | grep ^version

# 버전 업데이트 후 빌드
# pubspec.yaml의 version을 수정하거나
flutter build appbundle --release \
  --build-name=1.2.3 \    # versionName
  --build-number=45       # versionCode (항상 이전보다 커야 함)
```

#### Play Console 배포 단계

![Google Play 테스트 트랙](/developer-open-book/diagrams/flutter-step29-testing-tracks.svg)

---

### 3.4 iOS 앱 서명 절차

iOS 배포는 macOS와 Apple Developer 계정($99/년)이 필요하다.

#### 필요한 것들

```
① Apple Developer 계정 (developer.apple.com)
② macOS + Xcode
③ Certificate (개발자 인증서)
   - Development: 개발 기기 테스트용
   - Distribution: App Store / TestFlight 배포용
④ App ID (Bundle ID)
   예: com.company.appname
⑤ Provisioning Profile
   - Development Profile: 특정 기기에서 개발 테스트
   - Distribution Profile: TestFlight / App Store 배포
```

#### 자동 서명 설정 (Xcode Automatic Signing)

![iOS 앱 서명 설정](/developer-open-book/diagrams/flutter-step29-ios-signing.svg)

자동 서명을 사용하면 Xcode가 Certificate와 Provisioning Profile을 자동으로 관리한다.

#### IPA 빌드 및 TestFlight 업로드

```bash
# 방법 1: flutter 명령으로 빌드 (Xcode 없이)
flutter build ipa --release

# 출력: build/ios/ipa/앱이름.ipa

# 방법 2: Xcode Archive (권장)
# Xcode → Product → Archive → Distribute App

# TestFlight 업로드
# Xcode Organizer에서 Archive 선택 → Distribute App
# → App Store Connect → Upload
# 또는 Transporter 앱 사용
```

#### App Store Connect 심사 제출 절차

![App Store 업로드 절차](/developer-open-book/diagrams/flutter-step29-appstore-upload.svg)

---

### 3.5 릴리즈 빌드 최적화 설정

#### 코드 난독화 (Android)

```bash
# 난독화 활성화된 빌드
flutter build appbundle --release --obfuscate \
  --split-debug-info=build/debug-info/

# --split-debug-info: 스택 트레이스 복원용 심볼 파일 생성
# 심볼 파일은 Play Console에 업로드 → 크래시 리포트 복원
```

```proguard
# android/app/proguard-rules.pro
# Flutter 기본 규칙 (자동 포함)
-keep class io.flutter.** { *; }

# 커스텀 Native 코드가 있는 경우
-keep class com.example.app.** { *; }

# Gson/Moshi 사용 시
-keepattributes Signature
-keepattributes *Annotation*
```

#### Flutter 빌드 최적화 플래그

```bash
# 트리 쉐이킹: 미사용 코드 제거
flutter build appbundle --release --tree-shake-icons

# 특정 target-platform만 포함
flutter build apk --release --target-platform android-arm64

# 빌드 메타데이터 확인
flutter build appbundle --release --analyze-size
```

---

### 3.6 환경별 빌드 설정 (dart-define)

```bash
# 개발 환경 빌드
flutter build apk --release \
  --dart-define=ENV=dev \
  --dart-define=API_URL=https://dev-api.example.com

# 프로덕션 환경 빌드
flutter build appbundle --release \
  --dart-define=ENV=prod \
  --dart-define=API_URL=https://api.example.com

# 앱 코드에서 사용
const env    = String.fromEnvironment('ENV', defaultValue: 'dev');
const apiUrl = String.fromEnvironment('API_URL',
    defaultValue: 'https://dev-api.example.com');
```

---

### 3.7 앱 스토어 등록 필수 자료

#### Android (Play Store)

```
필수 항목:
□ AAB 파일 (서명됨)
□ 앱 아이콘 512x512 PNG
□ 스크린샷 (폰: 최소 2장, 태블릿: 선택)
□ 앱 설명 (짧은 설명 80자, 상세 설명 4000자)
□ 개인정보 처리방침 URL (필수)
□ 콘텐츠 등급 설문 완료

선택/권장:
□ Feature Graphic 1024x500
□ 홍보 영상 (YouTube URL)
□ 출시 메모 (What's New)
```

#### iOS (App Store)

```
필수 항목:
□ IPA / Archive
□ 앱 아이콘 (1024x1024, 투명 없음)
□ 스크린샷 (6.7" iPhone: 필수, 12.9" iPad: 앱에 따라)
□ 앱 설명 (4000자 이내)
□ 개인정보 처리방침 URL (필수)
□ 지원 URL
□ 앱 카테고리 (기본 + 보조)
□ 연령 등급
□ 개인정보 레이블 (수집 데이터 명시)

선택/권장:
□ 홍보 텍스트 (170자, 심사 없이 변경 가능)
□ 키워드 (100자, 검색 최적화)
□ 앱 미리보기 영상 (15~30초)
```

---

## 4. 사례 연구

### 4.1 첫 Play Store 출시 체크리스트

![출시 전 최종 점검 Android](/developer-open-book/diagrams/flutter-step29-android-checklist.svg)

---

### 4.2 앱 서명 키 분실 시나리오 방지

![Play App Signing](/developer-open-book/diagrams/flutter-step29-app-signing.svg)

---

### 4.3 버전 관리 전략

![Semantic Versioning 적용](/developer-open-book/diagrams/flutter-step29-semantic-versioning.svg)

---

## 5. 실습

### 5.1 Android 릴리즈 빌드 실습

```bash
# 1. Keystore 생성 (최초 1회)
keytool -genkey -v \
  -keystore ~/my-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias mykey

# 2. key.properties 파일 생성
cat > android/key.properties << EOF
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=mykey
storeFile=/Users/$(whoami)/my-release-key.jks
EOF

# 3. .gitignore에 추가
echo "android/key.properties" >> .gitignore
echo "*.jks" >> .gitignore

# 4. AAB 빌드
flutter build appbundle --release

# 5. 빌드 결과 확인
ls -lh build/app/outputs/bundle/release/
# → app-release.aab

# 6. 빌드 크기 분석
flutter build appbundle --release --analyze-size
```

---

### 5.2 build.gradle 서명 설정 완성 코드

```gradle
// android/app/build.gradle (완전한 서명 설정)
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.example.myapp"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutter.versionCode
        versionName flutter.versionName
    }

    signingConfigs {
        release {
            keyAlias     keystoreProperties['keyAlias']
            keyPassword  keystoreProperties['keyPassword']
            storeFile    keystoreProperties['storeFile']
                ? file(keystoreProperties['storeFile'])
                : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles(
                getDefaultProguardFile('proguard-android-optimize.txt'),
                'proguard-rules.pro'
            )
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** APK 대신 AAB(Android App Bundle)를 Play Store에 제출해야 하는 이유는?

> **모범 답안:** AAB는 Play Store가 각 기기에 맞는 최적화된 APK를 동적으로 생성하도록 한다. 예를 들어 arm64 기기에는 arm64 코드만, 영어를 사용하는 기기에는 영어 리소스만 포함된 APK를 전달한다. 결과적으로 사용자가 다운로드받는 앱 크기가 40~60% 줄어든다. 2021년 8월부터 Play Store에 신규 앱 제출 시 AAB가 필수다.

---

**Q2. [Understand]** Android Keystore 파일을 Git에 절대 커밋하면 안 되는 이유는?

> **모범 답안:** Keystore는 앱의 신원을 증명하는 비밀 키다. Keystore가 노출되면 악의적인 사람이 같은 서명으로 악성 앱을 만들어 기존 앱처럼 위장할 수 있다. 또한 Play Store는 동일 서명 키로만 업데이트를 허용하므로 Keystore가 노출되어 새 Keystore로 교체하면 기존 앱의 업데이트를 배포할 수 없게 된다.

---

**Q3. [Understand]** `versionCode`를 항상 이전보다 크게 설정해야 하는 이유는?

> **모범 답안:** Android는 `versionCode`(정수)로 앱 업데이트 여부를 판단한다. 기기에 설치된 앱의 `versionCode`보다 새 버전이 낮거나 같으면 업데이트 대상으로 인식되지 않는다. Play Console도 이미 업로드된 `versionCode`와 같거나 낮은 AAB를 거부한다. 따라서 매 빌드마다 반드시 이전보다 큰 값을 사용해야 한다.

---

**Q4. [Apply]** 아래 flutter build 명령에서 각 옵션의 역할을 설명하라.

```bash
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=build/debug-info/ \
  --build-name=2.0.0 \
  --build-number=42
```

> **모범 답안:**
>
> - `--release`: AOT 컴파일·최적화 적용한 릴리즈 빌드 생성
> - `--obfuscate`: Dart 코드를 난독화해 역공학을 어렵게 함
> - `--split-debug-info=build/debug-info/`: 난독화된 코드의 스택 트레이스 복원용 심볼 파일을 지정 경로에 저장 (Play Console에 업로드해 크래시 분석에 활용)
> - `--build-name=2.0.0`: pubspec.yaml의 versionName에 해당 (사용자에게 표시)
> - `--build-number=42`: pubspec.yaml의 versionCode에 해당 (Play Store 버전 비교용, 항상 증가)

---

**Q5. [Apply]** Play Store에 앱을 처음 출시할 때 권장하는 단계적 출시 순서를 서술하라.

> **모범 답안:** ① **내부 테스트 트랙** — 팀원과 QA가 즉시 설치 테스트, 주요 버그 수정. ② **비공개 테스트(Alpha)** — 소규모 초청 테스터(베타 사용자, 파트너사)에게 배포, 실사용 피드백 수집. ③ **공개 테스트(Beta)** — 관심 있는 누구나 참여 가능, 대규모 실사용 검증. ④ **프로덕션 단계적 출시** — 처음 1~5%로 시작해 크래시율·사용자 평점 모니터링 후 10%→50%→100%로 단계적 확대. 이 절차를 따르면 대규모 사용자에게 배포 전 문제를 조기에 발견하고 수정할 수 있다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **빌드 산출물**: Android=AAB(Play Store)·APK(직접), iOS=IPA(App Store).
- **Android 서명**: Keystore 생성 → key.properties (Git 제외) → build.gradle 설정 → `flutter build appbundle --release`.
- **Play Store 배포 단계**: 내부 테스트 → Alpha → Beta → 프로덕션 단계적 출시.
- **iOS 배포**: Apple Developer 계정 + Xcode 자동 서명 → Archive → TestFlight → App Store 심사.
- **버전 관리**: `pubspec.yaml`의 `versionCode`는 항상 증가, `versionName`은 사용자에게 표시.
- **보안**: Keystore·key.properties는 절대 Git 커밋 금지. Play App Signing으로 키 분실 위험 최소화.

### 6.2 다음 Step 예고

- **Step 30 — CI/CD 자동화:** GitHub Actions·Codemagic·Fastlane으로 코드 푸시 시 자동 빌드·테스트·배포 파이프라인을 구축한다.

### 6.3 참고 자료

| 자료                           | 링크                                                                   | 설명                     |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------ |
| Flutter 안드로이드 배포 가이드 | <https://docs.flutter.dev/deployment/android>                            | 공식 Android 배포 가이드 |
| Flutter iOS 배포 가이드        | <https://docs.flutter.dev/deployment/ios>                                | 공식 iOS 배포 가이드     |
| Play Console 도움말            | <https://support.google.com/googleplay/android-developer>                | Play Store 공식 도움말   |
| App Store Connect 도움말       | <https://developer.apple.com/help/app-store-connect>                     | Apple 공식 도움말        |
| Play App Signing               | <https://support.google.com/googleplay/android-developer/answer/9842756> | Play 앱 서명 가이드      |

### 6.4 FAQ

**Q. `flutter build apk --release`와 `flutter build appbundle --release`의 차이는?**

> APK는 모든 CPU 아키텍처와 리소스를 포함한 단일 파일로 직접 설치에 사용한다. AAB는 Play Store가 기기별로 최적화된 APK를 생성하는 중간 형식으로 파일 크기가 더 크지만 사용자가 다운로드하는 APK는 훨씬 작다. Play Store 제출은 AAB, 직접 배포나 테스트는 APK를 사용한다.

**Q. iOS 배포를 위해 Mac이 없으면 어떻게 하는가?**

> iOS 앱 빌드는 macOS와 Xcode가 필수다. Mac이 없다면 ① Mac Studio 등 클라우드 Mac 서비스(MacinCloud, MacStadium) 활용, ② GitHub Actions + 외부 macOS Runner 활용, ③ Codemagic CI/CD의 macOS 빌드 환경 활용 등의 방법이 있다. Step 30의 CI/CD에서 자세히 다룬다.

**Q. 앱 심사 거절 시 어떻게 하는가?**

> Play Store는 이메일로 거절 이유를 통보한다. App Store는 App Store Connect에서 Resolution Center를 통해 거절 이유 확인 및 Apple 측과 커뮤니케이션이 가능하다. 대부분의 거절 사유는 개인정보 처리방침 미비, 기능 오작동, 가이드라인 위반이다. 수정 후 재제출하거나 이의 신청을 할 수 있다.

---

## 빠른 자가진단 체크리스트

- [ ] APK·AAB·IPA의 차이와 각각의 용도를 설명할 수 있는가?
- [ ] Android Keystore를 생성하고 key.properties를 설정할 수 있는가?
- [ ] key.properties와 Keystore 파일을 Git에서 제외해야 하는 이유를 설명할 수 있는가?
- [ ] `flutter build appbundle --release` 명령으로 서명된 AAB를 생성할 수 있는가?
- [ ] Play Store의 4가지 배포 트랙을 순서대로 설명할 수 있는가?
- [ ] iOS 배포를 위해 필요한 구성 요소(Certificate·Provisioning Profile·App Store Connect)를 설명할 수 있는가?
- [ ] versionCode를 항상 증가시켜야 하는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Keystore 분실 시 기존 앱 업데이트 배포가 불가능하다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: 디버그 모드가 아닌 Profile 모드 또는 Release 모드로 성능을 측정해야 한다는 것을 이해했는가?
