# Step 22 — 패키지와 pub.dev 생태계

> **Phase 6 | 실전 품질 관리** | 예상 소요: 2일 | 블룸 수준: Apply ~ Evaluate

---

## 📋 목차

- [Step 22 — 패키지와 pub.dev 생태계](#step-22--패키지와-pubdev-생태계)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [Dart 패키지 생태계](#dart-패키지-생태계)
  - [3. pubspec.yaml 완전 이해](#3-pubspecyaml-완전-이해)
    - [3.1 필수 필드](#31-필수-필드)
    - [3.2 의존성 섹션](#32-의존성-섹션)
    - [3.3 버전 제약 표기법](#33-버전-제약-표기법)
  - [4. `dart pub` 명령어](#4-dart-pub-명령어)
  - [5. 의존성 종류와 해석](#5-의존성-종류와-해석)
    - [5.1 일반 / dev / override 의존성](#51-일반--dev--override-의존성)
    - [5.2 버전 충돌 해결](#52-버전-충돌-해결)
    - [5.3 `pubspec.lock` 이해](#53-pubspeclock-이해)
  - [6. 핵심 패키지 카탈로그](#6-핵심-패키지-카탈로그)
    - [6.1 JSON 직렬화 — `json_serializable` + `freezed`](#61-json-직렬화--json_serializable--freezed)
    - [6.2 네트워크 — `dio`](#62-네트워크--dio)
    - [6.3 의존성 주입 — `get_it`](#63-의존성-주입--get_it)
    - [6.4 로깅 — `logger`](#64-로깅--logger)
    - [6.5 환경 변수 — `envied`](#65-환경-변수--envied)
  - [7. 나만의 패키지 만들기](#7-나만의-패키지-만들기)
    - [7.1 패키지 구조](#71-패키지-구조)
    - [7.2 라이브러리 공개 API 설계](#72-라이브러리-공개-api-설계)
    - [7.3 `dart doc` 문서화](#73-dart-doc-문서화)
  - [8. pub.dev에 배포하기](#8-pubdev에-배포하기)
    - [8.1 배포 전 체크리스트](#81-배포-전-체크리스트)
    - [8.2 `dart pub publish`](#82-dart-pub-publish)
    - [8.3 pub 점수 (Pub Points)](#83-pub-점수-pub-points)
  - [9. 모노레포와 로컬 패키지](#9-모노레포와-로컬-패키지)
    - [모노레포 구조](#모노레포-구조)
    - [로컬 패키지 참조](#로컬-패키지-참조)
    - [Melos — 모노레포 관리 도구](#melos--모노레포-관리-도구)
  - [10. 실습](#10-실습)
    - [실습 10-1: `pubspec.yaml` 버전 제약 해석](#실습-10-1-pubspecyaml-버전-제약-해석)
    - [실습 10-2: `freezed` 모델 설계](#실습-10-2-freezed-모델-설계)
    - [실습 10-3: 패키지 구조 설계](#실습-10-3-패키지-구조-설계)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [Phase 6 완료 체크리스트](#phase-6-완료-체크리스트)
    - [🔗 전체 로드맵 완료](#-전체-로드맵-완료)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                                     |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | 🔵 Remember   | `pubspec.yaml`의 필수 필드와 의존성 세 종류(`dependencies`, `dev_dependencies`, `dependency_overrides`)를 나열할 수 있다 |
| 2   | 🟢 Understand | 버전 제약 표기법(`^`, `>=`, `<`, `any`)이 버전 해석기에 어떻게 영향을 미치는지 설명할 수 있다                            |
| 3   | 🟢 Understand | `pubspec.lock`이 재현 가능한 빌드를 보장하는 원리를 설명할 수 있다                                                       |
| 4   | 🟡 Apply      | `json_serializable`과 `freezed`로 불변 모델 클래스를 생성하고 JSON 직렬화를 구현할 수 있다                               |
| 5   | 🟡 Apply      | 자신만의 패키지를 구조화하고 공개 API를 설계하며 문서 주석을 작성할 수 있다                                              |
| 6   | 🔴 Evaluate   | 프로젝트의 의존성 전략(외부 패키지 선택 기준, 버전 고정 정책, 로컬 패키지 분리 시점)을 평가하고 근거를 제시할 수 있다    |

---

## 2. 서론

### Dart 패키지 생태계

Dart의 패키지 저장소는 **pub.dev**입니다. 2024년 기준 50,000개 이상의 패키지가 등록되어 있습니다.

```
패키지 = 재사용 가능한 Dart 코드 묶음

종류:
  일반 패키지   — 순수 Dart 코드
  플러그인 패키지 — 플랫폼 네이티브 코드 포함 (Flutter)

패키지 찾기:
  https://pub.dev
  dart pub search <키워드>

패키지 선택 기준 (pub 점수 참고):
  Likes      — 개발자 추천 수
  Pub Points — 문서화, 분석, 플랫폼 지원 등 자동 채점
  Popularity — 다른 패키지에서 얼마나 많이 사용하는지
```

> **전제 지식**: 기본 Dart 문법 전체 (Step 1~21)

---

## 3. pubspec.yaml 완전 이해

### 3.1 필수 필드

```yaml
# pubspec.yaml — 프로젝트/패키지의 메타데이터와 의존성 선언

# 패키지 이름 — 소문자, 언더스코어만 사용
name: my_dart_app

# 설명 — pub.dev 표시용 (패키지 배포 시 필수)
description: >-
  Dart 학습을 위한 예제 패키지입니다.
  단일 모듈 아키텍처로 구성되어 있습니다.

# 버전 — Semantic Versioning (major.minor.patch)
version: 1.2.3

# 홈페이지 / 저장소 (선택)
homepage: https://dart.dev
repository: https://github.com/dart-lang/dart-sdk

# SDK 버전 제약
environment:
  sdk: ">=3.0.0 <4.0.0"
  # Flutter 앱이라면
  # flutter: '>=3.10.0'
```

---

### 3.2 의존성 섹션

```yaml
# 프로덕션 의존성 — 앱 실행 시 필요
dependencies:
  # pub.dev 패키지
  http: ^1.1.0
  equatable: ^2.0.5

  # 특정 Git 브랜치/태그
  some_private_pkg:
    git:
      url: https://github.com/example/some_private_pkg.git
      ref: main # 브랜치, 태그, 또는 커밋 해시

  # 로컬 경로 (모노레포, 개발 중인 패키지)
  my_core:
    path: ../my_core

# 개발/테스트 전용 의존성 — 배포 패키지에 포함 안 됨
dev_dependencies:
  test: ^1.24.0
  mockito: ^5.4.0
  build_runner: ^2.4.0
  json_serializable: ^6.7.0 # 코드 생성기
  freezed: ^2.4.0 # 불변 모델 생성기
  very_good_analysis: ^6.0.0 # 린트 규칙

# 의존성 충돌 강제 해결 (주의해서 사용)
dependency_overrides:
  collection: 1.17.2 # 특정 버전 강제 지정

# 실행 가능 파일 등록 (CLI 도구)
executables:
  my_tool: bin/my_tool # dart pub global activate 후 my_tool로 실행

# 플러터 전용
flutter:
  assets:
    - assets/images/
  fonts:
    - family: Roboto
      fonts:
        - asset: fonts/Roboto-Regular.ttf
```

---

### 3.3 버전 제약 표기법

```
Semantic Versioning: MAJOR.MINOR.PATCH
  MAJOR — 하위 호환되지 않는 변경
  MINOR — 하위 호환되는 기능 추가
  PATCH — 버그 수정

버전 제약 표기:
  ^1.2.3   → >=1.2.3 <2.0.0  (캐럿, 가장 흔히 사용)
             MAJOR를 고정하고 MINOR/PATCH 업데이트 허용
  ^0.2.3   → >=0.2.3 <0.3.0  (0.x.x에서 캐럿은 MINOR 고정)
  ^0.0.3   → >=0.0.3 <0.0.4  (0.0.x에서는 PATCH만 허용)

  >=1.0.0 <2.0.0  → 명시적 범위
  >=1.0.0          → 최소 버전만 지정 (권장 안 함)
  1.2.3            → 정확히 이 버전만 (유연성 없음)
  any              → 모든 버전 허용 (권장 안 함)
```

```dart
// 버전 선택 예시 — 어떤 제약이 적합한가?

// 안정적인 공개 패키지 — ^을 사용해 호환 업데이트 허용
// http: ^1.1.0

// 불안정한 패키지 (0.x.x) — 마이너도 함께 고정
// freezed: ^2.4.0  → >=2.4.0 <3.0.0

// 내부 패키지 — 정확한 버전 고정 가능
// my_internal: 1.0.0

// 권장하지 않는 패턴:
// any       → 예측 불가능한 버전 선택
// >=1.0.0   → 메이저 버전 업 시 파손 위험
```

---

## 4. `dart pub` 명령어

```bash
# 의존성 다운로드 / 업데이트
dart pub get           # pubspec.yaml에 선언된 의존성 설치
dart pub upgrade       # 허용 범위 내 최신 버전으로 업그레이드
dart pub upgrade --major-versions  # 메이저 버전 포함 업그레이드 (주의)

# 패키지 정보
dart pub deps          # 의존성 트리 출력
dart pub deps --style=compact  # 간결하게
dart pub outdated      # 업데이트 가능한 패키지 목록
dart pub add http      # pubspec.yaml에 추가 + get 실행
dart pub remove http   # pubspec.yaml에서 제거 + get 실행

# 검색과 정보
dart pub search logger          # 패키지 검색
dart pub info http              # 패키지 상세 정보
dart pub cache list             # 로컬 캐시 목록
dart pub cache clean            # 캐시 초기화

# 코드 생성 (build_runner)
dart run build_runner build             # 코드 생성 1회
dart run build_runner watch             # 파일 변경 감지 + 자동 재생성
dart run build_runner build --delete-conflicting-outputs  # 충돌 파일 삭제 후 생성

# 배포
dart pub publish           # pub.dev에 배포
dart pub publish --dry-run # 실제 배포 없이 검증만

# 전역 도구
dart pub global activate my_tool   # CLI 도구 전역 설치
dart pub global run my_tool        # 전역 실행
dart pub global deactivate my_tool # 제거
```

---

## 5. 의존성 종류와 해석

### 5.1 일반 / dev / override 의존성

```yaml
dependencies:
  # ← 앱 실행 및 배포 패키지에 포함
  http: ^1.1.0

dev_dependencies:
  # ← 개발/빌드/테스트 시에만 필요
  # 배포된 패키지를 사용하는 쪽에서는 설치 안 됨
  test: ^1.24.0
  build_runner: ^2.4.0

dependency_overrides:
  # ← 버전 충돌 시 강제로 특정 버전 사용
  # 모든 의존성이 이 버전을 사용하게 됨
  # 주의: 하위 호환성 문제 발생 가능
  some_package: 2.0.0
```

**실제 예시 — 무엇을 어디에?**

```yaml
dependencies:
  dio: ^5.3.0 # HTTP 클라이언트 — 앱 실행 시 필요
  freezed_annotation: ^2.4.0 # freezed 어노테이션 — 런타임 필요
  json_annotation: ^4.8.0 # JSON 어노테이션 — 런타임 필요
  get_it: ^7.6.0 # DI 컨테이너 — 런타임 필요

dev_dependencies:
  freezed: ^2.4.0 # 코드 생성기 — 빌드 시만 필요
  json_serializable: ^6.7.0 # 코드 생성기 — 빌드 시만 필요
  build_runner: ^2.4.0 # 코드 생성 실행기
  test: ^1.24.0
  mockito: ^5.4.0
```

---

### 5.2 버전 충돌 해결

```
충돌 예시:
  my_app → package_a ^1.0.0
  my_app → package_b → package_a ^2.0.0   ← 충돌!

해결 방법:
  1. package_a, package_b 업데이트 — 가장 이상적
     dart pub upgrade

  2. dependency_overrides — 임시방편
     dependency_overrides:
       package_a: ^2.0.0

  3. 패키지 교체 — 호환 버전이 있는 대안 패키지 탐색
```

```bash
# 충돌 원인 파악
dart pub deps
# 또는
dart pub get  # 오류 메시지에서 충돌 패키지 확인

# 업그레이드 가능 여부 확인
dart pub outdated
```

---

### 5.3 `pubspec.lock` 이해

```yaml
# pubspec.lock — 자동 생성, 직접 수정하지 않음

packages:
  http:
    dependency: "direct main" # 직접 의존 (dependencies에 선언)
    description:
      name: http
      sha256: "..." # 패키지 무결성 해시
      url: "https://pub.dartlang.org"
    source: hosted
    version: "1.1.4" # 실제 설치된 버전

  path:
    dependency: transitive # 간접 의존 (http가 사용)
    description:
      name: path
      sha256: "..."
      url: "https://pub.dartlang.org"
    source: hosted
    version: "1.8.3"
```

**`pubspec.lock`의 역할**

```
pubspec.yaml:  의도 (어떤 버전 범위를 허용하는가)
pubspec.lock:  결과 (실제로 어떤 버전이 설치됐는가)

lock 파일 커밋 전략:
  앱/서비스:  ✅ lock 파일 커밋 — 팀 전체 동일 버전 보장
  라이브러리: ❌ lock 파일 gitignore — 사용자의 버전 자유도 보장

dart pub get:      lock에 명시된 버전 설치 (재현 가능)
dart pub upgrade:  제약 범위 내 최신 버전으로 lock 업데이트
```

---

## 6. 핵심 패키지 카탈로그

### 6.1 JSON 직렬화 — `json_serializable` + `freezed`

가장 많이 사용하는 코드 생성 기반 직렬화 패턴입니다.

**`pubspec.yaml` 설정**

```yaml
dependencies:
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.0

dev_dependencies:
  freezed: ^2.4.0
  json_serializable: ^6.7.0
  build_runner: ^2.4.0
```

**모델 클래스 정의**

```dart
// lib/src/models/user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

// 코드 생성기가 읽는 파트 선언
part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default([]) List<String> roles,
    DateTime? lastLoginAt,
  }) = _User;

  // JSON 직렬화
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

```bash
# 코드 생성
dart run build_runner build --delete-conflicting-outputs
```

**생성된 코드가 제공하는 기능**

```dart
void main() {
  // 생성 (const factory)
  final user = User(
    id:    'u001',
    name:  '홍길동',
    email: 'hong@dart.dev',
    roles: ['admin'],
  );

  // JSON 직렬화
  final json = user.toJson();
  print(json);
  // {id: u001, name: 홍길동, email: hong@dart.dev, roles: [admin], lastLoginAt: null}

  // JSON 역직렬화
  final fromJson = User.fromJson({'id': 'u002', 'name': '김철수', 'email': 'kim@dart.dev'});
  print(fromJson.name);  // 김철수

  // copyWith — 일부 필드만 변경
  final updated = user.copyWith(name: '홍길동2', roles: ['user']);
  print(updated.name);  // 홍길동2
  print(user.name);     // 홍길동 — 원본 불변

  // 동등성 자동 구현
  final user2 = User(id: 'u001', name: '홍길동', email: 'hong@dart.dev');
  print(user == user2);  // true — 구조 기반 동등성

  // toString 자동 구현
  print(user);
  // User(id: u001, name: 홍길동, email: hong@dart.dev, roles: [admin], lastLoginAt: null)

  // Sealed/Union 타입 (freezed의 강력한 기능)
  @freezed
  sealed class ApiResponse<T> with _$ApiResponse<T> {
    const factory ApiResponse.loading()     = _Loading;
    const factory ApiResponse.success(T data) = _Success;
    const factory ApiResponse.error(String message) = _Error;
  }

  ApiResponse<User> response = ApiResponse.success(user);

  final text = switch (response) {
    ApiResponse<User>(:final data) when response is _Success => '성공: ${data.name}',
    _Loading()  => '로딩 중',
    _Error(:final message) => '오류: $message',
    _ => '알 수 없음',
  };
  print(text);
}
```

---

### 6.2 네트워크 — `dio`

`http` 패키지보다 풍부한 기능을 제공하는 HTTP 클라이언트입니다.

```yaml
dependencies:
  dio: ^5.3.0
```

```dart
import 'package:dio/dio.dart';

// 기본 사용
void main() async {
  final dio = Dio();

  // GET 요청
  final response = await dio.get('https://jsonplaceholder.typicode.com/users/1');
  print(response.data['name']);

  // POST 요청
  final post = await dio.post(
    'https://jsonplaceholder.typicode.com/posts',
    data: {'title': 'Dart', 'body': '내용', 'userId': 1},
  );
  print(post.statusCode);  // 201
}

// 인터셉터를 활용한 실무 설정
class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl, required String token}) {
    _dio = Dio(BaseOptions(
      baseUrl:         baseUrl,
      connectTimeout:  Duration(seconds: 10),
      receiveTimeout:  Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    // 인증 토큰 인터셉터
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        options.headers['Authorization'] = 'Bearer $token';
        print('→ ${options.method} ${options.path}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        print('← ${response.statusCode} ${response.requestOptions.path}');
        handler.next(response);
      },
      onError: (error, handler) async {
        // 401 → 토큰 갱신 후 재시도
        if (error.response?.statusCode == 401) {
          print('[AUTH] 토큰 갱신 시도');
          // ... 토큰 갱신 로직
        }
        handler.next(error);
      },
    ));

    // 로깅 인터셉터 (개발 환경)
    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return fromJson != null ? fromJson(response.data) : response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<T> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return fromJson != null ? fromJson(response.data) : response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException e) => switch (e.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.receiveTimeout    => TimeoutException('요청 시간 초과'),
    DioExceptionType.badResponse       => HttpException(
        '${e.response?.statusCode}: ${e.response?.statusMessage}'),
    DioExceptionType.connectionError   => Exception('네트워크 연결 실패'),
    _                                  => Exception('알 수 없는 오류: ${e.message}'),
  };
}
```

---

### 6.3 의존성 주입 — `get_it`

서비스 로케이터 패턴으로 의존성을 관리합니다.

```yaml
dependencies:
  get_it: ^7.6.0
```

```dart
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

// 의존성 등록 (앱 시작 시)
void setupDependencies() {
  // Singleton — 앱 전체에서 하나의 인스턴스
  getIt.registerSingleton<ApiClient>(
    ApiClient(baseUrl: 'https://api.dart.dev', token: 'my-token'),
  );

  // LazySingleton — 처음 사용될 때 생성
  getIt.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(getIt<ApiClient>()),
  );

  // Factory — 매번 새 인스턴스 생성
  getIt.registerFactory<UserViewModel>(
    () => UserViewModel(getIt<UserRepository>()),
  );

  // AsyncSingleton — 비동기 초기화
  getIt.registerSingletonAsync<DatabaseService>(() async {
    final db = DatabaseService();
    await db.initialize();
    return db;
  });
}

// 의존성 사용
class UserScreen {
  // 어디서든 싱글톤 접근
  final repo = getIt<UserRepository>();

  void loadUser(String id) async {
    final user = await repo.findById(id);
    print(user);
  }
}

// 초기화 및 실행
void main() async {
  setupDependencies();
  await getIt.allReady();  // AsyncSingleton 초기화 완료 대기
  runApp();
}
```

---

### 6.4 로깅 — `logger`

레벨별 구조적 로깅 패키지입니다.

```yaml
dependencies:
  logger: ^2.0.0
```

```dart
import 'package:logger/logger.dart';

// 전역 로거
final log = Logger(
  printer: PrettyPrinter(
    methodCount:    2,
    errorMethodCount: 8,
    lineLength:     120,
    colors:         true,
    printEmojis:    true,
    printTime:      true,
  ),
  level: Level.debug,
);

// 프로덕션용 — 최소 출력
final prodLog = Logger(
  printer: SimplePrinter(),
  level:   Level.warning,
  output:  FileOutput(file: File('app.log')),
);

void main() {
  log.d('디버그 메시지');           // 🐛 DEBUG
  log.i('서버 시작: 포트 8080');    // 💡 INFO
  log.w('설정 파일 없음, 기본값 사용'); // ⚠️ WARNING
  log.e('DB 연결 실패', error: Exception('연결 거부'), stackTrace: StackTrace.current);

  // 구조적 데이터 로깅
  log.i('사용자 조회', error: {'userId': 'u001', 'found': true});
}
```

---

### 6.5 환경 변수 — `envied`

컴파일 타임에 `.env` 파일을 읽어 코드에 내장합니다.

```yaml
dev_dependencies:
  envied: ^0.5.0
  envied_generator: ^0.5.0
  build_runner: ^2.4.0
```

```bash
# .env 파일 (gitignore에 추가)
API_BASE_URL=https://api.production.dart.dev
API_KEY=super-secret-key-12345
DEBUG=false
```

```dart
// lib/src/env.dart
import 'package:envied/envied.dart';

part 'env.g.dart';

@Envied(path: '.env')
abstract class Env {
  @EnviedField(varName: 'API_BASE_URL')
  static const String apiBaseUrl = _Env.apiBaseUrl;

  @EnviedField(varName: 'API_KEY', obfuscate: true)  // 난독화
  static const String apiKey = _Env.apiKey;

  @EnviedField(varName: 'DEBUG', defaultValue: false)
  static const bool debug = _Env.debug;
}

// 코드 생성: dart run build_runner build

// 사용
void main() {
  print(Env.apiBaseUrl);  // https://api.production.dart.dev
  print(Env.debug);       // false
}
```

---

## 7. 나만의 패키지 만들기

### 7.1 패키지 구조

```bash
# 패키지 생성
dart create --template=package my_utils

# 생성된 구조
my_utils/
├── lib/
│   ├── my_utils.dart          ← 공개 API 진입점 (배럴 파일)
│   └── src/                   ← 내부 구현 (직접 import 비권장)
│       ├── string_utils.dart
│       ├── date_utils.dart
│       └── collections.dart
├── test/
│   ├── string_utils_test.dart
│   └── date_utils_test.dart
├── example/
│   └── my_utils_example.dart  ← 사용 예제
├── pubspec.yaml
├── README.md                  ← pub.dev 메인 페이지
├── CHANGELOG.md               ← 버전 변경 내역
└── LICENSE                    ← 라이선스 (MIT 등)
```

---

### 7.2 라이브러리 공개 API 설계

```dart
// lib/my_utils.dart — 배럴 파일 (공개 API 통합 진입점)

// show로 공개할 심볼 명시 (권장)
export 'src/string_utils.dart' show StringUtils, StringExtensions;
export 'src/date_utils.dart'   show DateUtils, DateTimeExtensions;
export 'src/collections.dart'  show ListUtils, MapUtils;

// 전체 공개 (간단하지만 과도한 노출 주의)
// export 'src/string_utils.dart';
```

````dart
// lib/src/string_utils.dart
// ignore_for_file: public_member_api_docs  (작은 패키지일 경우)

/// 문자열 유틸리티 확장 메서드 모음.
///
/// 사용 예:
/// ```dart
/// import 'package:my_utils/my_utils.dart';
///
/// final email = 'USER@DART.DEV'.normalizeEmail();
/// print(email); // user@dart.dev
/// ```
extension StringExtensions on String {
  /// 이메일 주소를 소문자로 변환하고 앞뒤 공백을 제거합니다.
  ///
  /// 이메일 형식이 유효하지 않으면 원본 문자열을 반환합니다.
  ///
  /// 예시:
  /// ```dart
  /// '  USER@DART.DEV  '.normalizeEmail() // 'user@dart.dev'
  /// ''.normalizeEmail()                  // ''
  /// ```
  String normalizeEmail() => trim().toLowerCase();

  /// 문자열이 유효한 이메일 형식인지 확인합니다.
  ///
  /// RFC 5322 간략 검사만 수행합니다. 완전한 검증은
  /// 서버 사이드 확인이 권장됩니다.
  bool get isValidEmail =>
      RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(this);

  /// 카멜케이스를 스네이크케이스로 변환합니다.
  ///
  /// ```dart
  /// 'helloWorld'.toSnakeCase() // 'hello_world'
  /// 'myVariableName'.toSnakeCase() // 'my_variable_name'
  /// ```
  String toSnakeCase() => replaceAllMapped(
        RegExp(r'[A-Z]'),
        (m) => '_${m[0]!.toLowerCase()}',
      ).replaceFirst(RegExp(r'^_'), '');
}
````

````dart
// lib/src/collections.dart

/// 제네릭 컬렉션 유틸리티.
class ListUtils {
  ListUtils._();  // 인스턴스 생성 방지

  /// [items]를 [size] 크기의 청크로 나눕니다.
  ///
  /// [size]가 [items.length]보다 크면 단일 청크를 반환합니다.
  ///
  /// 예시:
  /// ```dart
  /// ListUtils.chunked([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
  /// ```
  ///
  /// Throws [ArgumentError] if [size] <= 0.
  static List<List<T>> chunked<T>(List<T> items, int size) {
    if (size <= 0) throw ArgumentError.value(size, 'size', '1 이상이어야 합니다');
    final result = <List<T>>[];
    for (var i = 0; i < items.length; i += size) {
      result.add(items.sublist(i, (i + size).clamp(0, items.length)));
    }
    return result;
  }

  /// [keys]와 [values]를 병합해 [Map]을 생성합니다.
  ///
  /// 두 리스트의 길이가 다르면 짧은 쪽에 맞춥니다.
  static Map<K, V> zip<K, V>(List<K> keys, List<V> values) {
    final len = keys.length < values.length ? keys.length : values.length;
    return {for (var i = 0; i < len; i++) keys[i]: values[i]};
  }
}
````

---

### 7.3 `dart doc` 문서화

```bash
# 문서 생성
dart doc .

# 생성 결과: doc/api/index.html
```

**문서 주석 작성 규칙**

````dart
/// 첫 줄은 한 문장 요약 (마침표로 끝냄).
///
/// 더 자세한 설명은 빈 줄 뒤에 작성합니다.
/// 여러 줄로 작성 가능합니다.
///
/// 파라미터:
/// - [value]: 처리할 값
/// - [precision]: 소수점 자릿수 (기본값: 2)
///
/// 반환:
/// 반올림된 문자열 표현.
///
/// 예시:
/// ```dart
/// formatNumber(3.14159, precision: 2) // '3.14'
/// formatNumber(1000000)               // '1,000,000.00'
/// ```
///
/// Throws [ArgumentError] if [precision] is negative.
///
/// See also:
///  - [double.toStringAsFixed] for the underlying implementation.
String formatNumber(double value, {int precision = 2}) {
  if (precision < 0) throw ArgumentError.value(precision, 'precision');
  return value.toStringAsFixed(precision)
      .replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]},');
}
````

---

## 8. pub.dev에 배포하기

### 8.1 배포 전 체크리스트

```bash
# 1. 패키지 분석
dart pub publish --dry-run
# → 오류/경고 목록 확인

# 2. 정적 분석
dart analyze
# → 모든 warning/error 해결

# 3. 테스트
dart test
# → 모든 테스트 통과

# 4. 포맷팅
dart format .
# → 일관된 코드 스타일
```

**필수 파일 체크리스트**

```
✅ pubspec.yaml — name, version, description, homepage/repository
✅ README.md    — 사용 방법, 예제 코드
✅ CHANGELOG.md — 버전별 변경 내역
✅ LICENSE      — 라이선스 (MIT, Apache 2.0 등)
✅ example/     — 최소 하나의 실행 가능한 예제
✅ test/        — 충분한 테스트 커버리지
```

**CHANGELOG.md 형식**

```markdown
## 1.2.0

- ✨ `ListUtils.chunked()` 추가
- 🐛 `StringExtensions.toSnakeCase()` 첫 글자 처리 버그 수정

## 1.1.0

- ✨ `DateTimeExtensions.isWeekend` getter 추가
- 📝 문서 보강

## 1.0.0

- 🎉 최초 릴리스
```

---

### 8.2 `dart pub publish`

```bash
# Google 계정으로 인증 후 배포
dart pub publish

# 배포 전 미리 보기 (실제 배포 안 함)
dart pub publish --dry-run

# CI/CD 환경에서 자동 배포 (OAuth 토큰 필요)
dart pub publish --force
```

**버전 관리 원칙**

```
패치 버전 (1.0.0 → 1.0.1):
  - 버그 수정
  - 문서 개선
  - 내부 리팩토링 (공개 API 변경 없음)

마이너 버전 (1.0.0 → 1.1.0):
  - 새 기능 추가 (하위 호환 유지)
  - 기존 기능에 선택적 파라미터 추가

메이저 버전 (1.0.0 → 2.0.0):
  - 하위 호환되지 않는 변경
  - 공개 API 제거/변경
  - Breaking Change

주의: 한 번 배포된 버전은 삭제 불가
     (retract로 사용 지양 표시는 가능)
```

---

### 8.3 pub 점수 (Pub Points)

pub.dev는 패키지를 자동으로 채점합니다 (최대 160점).

```
Follow Dart file conventions  (30점)
  ✅ pubspec.yaml 필수 필드
  ✅ README.md, CHANGELOG.md, LICENSE 존재

Provide documentation         (20점)
  ✅ 공개 API에 문서 주석 (/// )
  ✅ example/ 디렉토리

Pass static analysis          (50점)
  ✅ dart analyze 오류 없음
  ✅ 린트 규칙 준수

Support up-to-date            (20점)
  ✅ 최신 Dart SDK 지원
  ✅ 의존성 패키지들이 최신 버전

Support multiple platforms    (20점)
  ✅ Android, iOS, Web, Desktop 지원 여부
  ✅ flutter, dart 환경 모두 지원
```

---

## 9. 모노레포와 로컬 패키지

대규모 프로젝트에서 코드를 여러 패키지로 분리하는 전략입니다.

### 모노레포 구조

```
company_app/                   ← 루트
├── packages/
│   ├── core/                  ← 공통 유틸리티, 모델
│   │   ├── lib/
│   │   └── pubspec.yaml
│   ├── auth/                  ← 인증 도메인
│   │   ├── lib/
│   │   └── pubspec.yaml       # dependencies: core: path: ../core
│   ├── user/                  ← 사용자 도메인
│   │   ├── lib/
│   │   └── pubspec.yaml       # dependencies: core: path: ../core
│   └── api_client/            ← HTTP 클라이언트
│       ├── lib/
│       └── pubspec.yaml
├── apps/
│   ├── mobile/                ← Flutter 앱
│   │   └── pubspec.yaml       # dependencies: auth, user, api_client
│   └── admin/                 ← 관리자 웹
│       └── pubspec.yaml
└── melos.yaml                 ← Melos 모노레포 도구 설정
```

### 로컬 패키지 참조

```yaml
# apps/mobile/pubspec.yaml
dependencies:
  core:
    path: ../../packages/core
  auth:
    path: ../../packages/auth
  user:
    path: ../../packages/user
```

### Melos — 모노레포 관리 도구

```yaml
# melos.yaml
name: company_app
packages:
  - packages/**
  - apps/**

scripts:
  test:all:
    run: melos exec -- dart test
    description: 모든 패키지 테스트 실행

  analyze:
    run: melos exec -- dart analyze
    description: 모든 패키지 정적 분석

  format:
    run: melos exec -- dart format .

  publish:
    run: melos publish --no-dry-run
```

```bash
# 설치
dart pub global activate melos

# 모노레포 부트스트랩
melos bootstrap

# 전체 테스트
melos run test:all

# 의존 패키지 변경 시 관련 패키지만 테스트
melos run test:all --scope="auth,user"
```

---

## 10. 실습

> 💡 실제 Dart 프로젝트 환경 권장 (DartPad는 패키지 설치 불가)

### 실습 10-1: `pubspec.yaml` 버전 제약 해석

아래 각 제약 표현이 허용하는 버전 범위를 설명하세요.

```yaml
dependencies:
  a: ^2.3.1
  b: ^0.5.0
  c: ^0.0.8
  d: ">=1.5.0 <3.0.0"
  e: ">=2.0.0"
  f: any
  g: 1.2.3
```

> **정답 힌트**
>
> ```
> a: ^2.3.1  → >=2.3.1 <3.0.0  (메이저 2 고정)
> b: ^0.5.0  → >=0.5.0 <0.6.0  (0.x.x에서 마이너 고정)
> c: ^0.0.8  → >=0.0.8 <0.0.9  (0.0.x에서 패치만 허용)
> d: 명시적  → 1.5.0 이상 3.0.0 미만
> e: 위험    → 2.0.0 이상 모두 허용 (메이저 업 위험)
> f: 위험    → 모든 버전 허용 (비결정적 빌드)
> g: 고정    → 정확히 1.2.3만 (유연성 없음)
> ```

### 실습 10-2: `freezed` 모델 설계

아래 요구사항으로 `freezed` 기반 모델을 설계하세요.

**요구사항**

- `Product` — `id(String)`, `name(String)`, `price(double)`, `stock(int, 기본값 0)`, `category(String?)`
- `CartItem` — `product(Product)`, `quantity(int, 기본값 1)`
- `Cart` — `items(List<CartItem>, 기본값 빈 리스트)`, `couponCode(String?)`
- 각 모델에 `toJson`/`fromJson` 구현
- `Cart`에 `total` getter — 모든 아이템 합계
- `Cart`에 `itemCount` getter — 총 수량

```dart
// pubspec.yaml 설정 후 아래 모델 완성
// part 'models.freezed.dart';
// part 'models.g.dart';

@freezed
class Product with _$Product {
  // TODO
}

@freezed
class CartItem with _$CartItem {
  // TODO
  // const CartItem._();  // 커스텀 getter 추가 시 필요
}

@freezed
class Cart with _$Cart {
  const Cart._();  // 커스텀 getter를 위해 필요
  const factory Cart({
    // TODO
  }) = _Cart;

  factory Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);

  // TODO: total, itemCount getter
}
```

> **정답 힌트**
>
> ```dart
> @freezed
> class Product with _$Product {
>   const factory Product({
>     required String id,
>     required String name,
>     required double price,
>     @Default(0) int stock,
>     String? category,
>   }) = _Product;
>   factory Product.fromJson(Map<String, dynamic> json) =>
>       _$ProductFromJson(json);
> }
>
> @freezed
> class CartItem with _$CartItem {
>   const factory CartItem({
>     required Product product,
>     @Default(1) int quantity,
>   }) = _CartItem;
>   factory CartItem.fromJson(Map<String, dynamic> json) =>
>       _$CartItemFromJson(json);
> }
>
> @freezed
> class Cart with _$Cart {
>   const Cart._();
>   const factory Cart({
>     @Default([]) List<CartItem> items,
>     String? couponCode,
>   }) = _Cart;
>   factory Cart.fromJson(Map<String, dynamic> json) =>
>       _$CartFromJson(json);
>
>   double get total => items.fold(
>     0, (sum, item) => sum + item.product.price * item.quantity);
>   int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
> }
> ```

### 실습 10-3: 패키지 구조 설계

팀 내부에서 사용할 `dart_validation` 패키지를 설계하세요.

**요구사항**

- 이메일, 전화번호, 비밀번호, 날짜 문자열 검증 기능
- Extension 방식과 정적 메서드 방식 모두 제공
- 적절한 `pubspec.yaml` 작성 (버전, 설명, SDK 제약)
- 공개 API를 배럴 파일로 통합
- 각 검증기에 `///` 문서 주석 작성

아래 구조를 완성하세요.

```
dart_validation/
├── lib/
│   ├── dart_validation.dart   ← 배럴 파일
│   └── src/
│       ├── validators.dart    ← Validators 클래스
│       └── extensions.dart    ← StringValidationExtensions
├── test/
│   └── validators_test.dart
├── example/
│   └── main.dart
├── pubspec.yaml
└── README.md
```

> **정답 힌트**
>
> ```dart
> // lib/dart_validation.dart
> export 'src/validators.dart' show Validators;
> export 'src/extensions.dart' show StringValidationExtensions;
>
> // lib/src/validators.dart
> class Validators {
>   Validators._();
>
>   /// 이메일 형식을 검사합니다.
>   static bool isEmail(String s) =>
>       RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(s);
>
>   /// 한국 전화번호 형식을 검사합니다.
>   static bool isPhoneKr(String s) =>
>       RegExp(r'^01[016789]-?\d{3,4}-?\d{4}$').hasMatch(s);
>
>   /// 비밀번호 강도를 검사합니다 (8자 이상, 대소문자, 숫자).
>   static bool isStrongPassword(String s) =>
>       s.length >= 8 &&
>       s.contains(RegExp(r'[A-Z]')) &&
>       s.contains(RegExp(r'[0-9]'));
> }
>
> // lib/src/extensions.dart
> extension StringValidationExtensions on String {
>   bool get isValidEmail => Validators.isEmail(this);
>   bool get isValidPhoneKr => Validators.isPhoneKr(this);
>   bool get isStrongPassword => Validators.isStrongPassword(this);
> }
> ```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                   | 핵심 내용                                                 |
| ---------------------- | --------------------------------------------------------- |
| `pubspec.yaml`         | 메타데이터 + 의존성 선언의 단일 진실 공급원               |
| `^` 캐럿 제약          | `^1.2.3` = `>=1.2.3 <2.0.0` — 가장 안전한 선택            |
| `pubspec.lock`         | 재현 가능한 빌드 보장 — 앱은 커밋, 라이브러리는 gitignore |
| `dart pub get/upgrade` | 의존성 설치 vs 최신 버전 업그레이드                       |
| `dart pub add/remove`  | 패키지 추가/제거 + 즉시 get                               |
| `dependency_overrides` | 버전 충돌 임시 해결 — 남용 주의                           |
| `freezed`              | 불변 모델 + `copyWith` + `==` + `toString` 자동 생성      |
| `json_serializable`    | `toJson`/`fromJson` 코드 자동 생성                        |
| `dio`                  | 인터셉터·타임아웃·오류 처리가 쉬운 HTTP 클라이언트        |
| `get_it`               | 서비스 로케이터 패턴 DI                                   |
| 배럴 파일              | `export`로 공개 API 통합 — 사용자 import 단순화           |
| `dart doc`             | `///` 주석으로 API 문서 자동 생성                         |
| pub 점수               | 문서화·분석·플랫폼 지원 등 자동 채점                      |
| 로컬 패키지            | `path: ../my_pkg` — 모노레포 내부 패키지 참조             |
| Melos                  | 모노레포 전체 패키지 일괄 테스트/배포                     |

### Phase 6 완료 체크리스트

- [ ] Step 21: `test` 패키지로 단위·비동기·예외·Stream·Mock 테스트를 작성할 수 있다
- [ ] Step 22: 의존성을 적절히 관리하고, 패키지를 설계·문서화·배포할 수 있다

### 🔗 전체 로드맵 완료

> 이 문서까지 완료하면 **Dart 완전 정복 로드맵 22단계**를 마칩니다.

지금까지 배운 내용을 활용해 다음 단계로 나아가세요.

```
Dart 숙달 이후 자연스러운 다음 여정:

Flutter 개발
  → 크로스 플랫폼 UI 개발
  → 상태 관리 (Riverpod, Bloc)
  → 네이티브 통합, 애니메이션

Dart 백엔드 (Shelf / Dart Frog)
  → RESTful API 서버
  → WebSocket, gRPC
  → Docker 배포

CLI 도구 개발
  → dart:io, args 패키지
  → pub.dev 배포 CLI 도구
```

### 📚 참고 자료

| 자료                    | 링크                                              |
| ----------------------- | ------------------------------------------------- |
| pub.dev 공식 저장소     | <https://pub.dev>                                   |
| `pubspec.yaml` 레퍼런스 | <https://dart.dev/tools/pub/pubspec>                |
| 버전 제약 가이드        | <https://dart.dev/tools/pub/dependencies>           |
| 패키지 만들기 가이드    | <https://dart.dev/guides/libraries/create-packages> |
| `dart doc` 가이드       | <https://dart.dev/tools/dart-doc>                   |
| Melos                   | <https://melos.invertase.dev>                       |
| `freezed` 패키지        | <https://pub.dev/packages/freezed>                  |
| `json_serializable`     | <https://pub.dev/packages/json_serializable>        |
| `dio` 패키지            | <https://pub.dev/packages/dio>                      |
| `get_it` 패키지         | <https://pub.dev/packages/get_it>                   |

### ❓ 자가진단 퀴즈

1. **[Remember]** `dependencies`와 `dev_dependencies`의 차이를 패키지를 배포한 사용자 관점에서 설명하라.
2. **[Remember]** `pubspec.lock`을 앱 프로젝트에서는 커밋하고 라이브러리 프로젝트에서는 gitignore하는 이유를 각각 설명하라.
3. **[Understand]** `freezed`의 `const Cart._()` 선언이 없을 때 커스텀 getter(`total`, `itemCount`)를 추가하면 컴파일 오류가 발생하는 이유를 설명하라.
4. **[Understand]** `dependency_overrides`를 사용했을 때 발생할 수 있는 위험과, 이를 최소화하기 위한 방법을 설명하라.
5. **[Apply]** `dart pub outdated` 명령의 출력 결과를 해석하고, 어떤 패키지를 언제 업그레이드해야 하는지 판단 기준을 설명하라.
6. **[Evaluate]** 팀 프로젝트에서 단일 대형 레포지토리(monolith)와 모노레포(여러 패키지로 분리)를 선택할 때의 트레이드오프를 코드 재사용성, 빌드 속도, 팀 자율성, 배포 복잡도 네 가지 기준으로 평가하라.

> **3번 정답 힌트**
>
> `freezed`는 `_$ClassName` mixin을 통해 생성자, `copyWith`, `==`, `hashCode`, `toString`을 제공합니다. 커스텀 getter나 메서드를 추가하려면 실제 클래스 본문에 구현해야 하는데, `freezed` 클래스의 생성자는 `const factory`이므로 인스턴스 멤버를 가질 수 없습니다. `const ClassName._()` 은 private const 생성자를 정의해 클래스 본문에 커스텀 인스턴스 멤버를 추가할 수 있는 공간을 만들어 줍니다.

> **6번 정답 힌트**
>
> 코드 재사용: 모노레포는 패키지 간 공유 쉬움. Monolith는 모든 코드가 하나의 네임스페이스.
> 빌드 속도: Monolith는 모든 변경이 전체 빌드 유발. 모노레포는 변경된 패키지만 재빌드.
> 팀 자율성: 모노레포는 팀별로 패키지 오너십 명확. Monolith는 경계가 불분명해 충돌 위험.
> 배포 복잡도: 모노레포는 버전 관리, 패키지 간 의존성 관리가 복잡. Melos 같은 도구 필요.

---

_참고: 이 문서는 dart.dev 공식 문서(Packages, pub.dev) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
