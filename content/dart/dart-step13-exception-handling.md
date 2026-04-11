# Step 13 — 예외 처리 (Exception Handling)

> **Phase 3 | 고급 Dart** | 예상 소요: 2일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 13 — 예외 처리 (Exception Handling)](#step-13--예외-처리-exception-handling)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [오류를 어떻게 다룰 것인가](#오류를-어떻게-다룰-것인가)
  - [3. `Error` vs `Exception` — 두 계층의 차이](#3-error-vs-exception--두-계층의-차이)
  - [4. `try` / `catch` / `on` / `finally`](#4-try--catch--on--finally)
    - [4.1 기본 구조](#41-기본-구조)
    - [4.2 `on` — 타입별 예외 처리](#42-on--타입별-예외-처리)
    - [4.3 `catch(e, s)` — 예외 객체와 스택 트레이스](#43-catche-s--예외-객체와-스택-트레이스)
    - [4.4 `finally` — 항상 실행되는 블록](#44-finally--항상-실행되는-블록)
    - [4.5 처리 순서와 우선순위](#45-처리-순서와-우선순위)
  - [5. `throw` — 예외 던지기](#5-throw--예외-던지기)
  - [6. 커스텀 예외 클래스 설계](#6-커스텀-예외-클래스-설계)
    - [6.1 `Exception` 구현](#61-exception-구현)
    - [6.2 예외 계층 구조 설계](#62-예외-계층-구조-설계)
  - [7. `rethrow` — 예외 재발생](#7-rethrow--예외-재발생)
  - [8. 비동기 예외 처리](#8-비동기-예외-처리)
    - [8.1 `async` / `await`에서의 try-catch](#81-async--await에서의-try-catch)
    - [8.2 `Future` 체인에서의 에러 처리](#82-future-체인에서의-에러-처리)
  - [9. 예외 처리 설계 원칙](#9-예외-처리-설계-원칙)
    - [9.1 언제 예외를 던질 것인가](#91-언제-예외를-던질-것인가)
    - [9.2 언제 예외를 잡을 것인가](#92-언제-예외를-잡을-것인가)
    - [9.3 예외 vs 반환값으로 오류 표현](#93-예외-vs-반환값으로-오류-표현)
  - [10. 실습](#10-실습)
    - [실습 10-1: `finally` 실행 순서 예측](#실습-10-1-finally-실행-순서-예측)
    - [실습 10-2: 커스텀 예외 계층 설계](#실습-10-2-커스텀-예외-계층-설계)
    - [실습 10-3: 비동기 예외 처리](#실습-10-3-비동기-예외-처리)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                |
| --- | ------------- | --------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `try`, `catch`, `on`, `finally`, `throw`, `rethrow`의 역할을 나열할 수 있다                         |
| 2   | 🟢 Understand | `Error`와 `Exception`의 개념적 차이와 각각을 사용하는 상황을 설명할 수 있다                         |
| 3   | 🟢 Understand | `finally`가 `return`이나 예외 발생 중에도 반드시 실행되는 이유를 설명할 수 있다                     |
| 4   | 🟡 Apply      | 도메인에 맞는 커스텀 예외 계층 구조를 설계하고 구현할 수 있다                                       |
| 5   | 🟡 Apply      | 비동기 코드에서 `async`/`await`와 `try-catch`를 올바르게 조합할 수 있다                             |
| 6   | 🟠 Analyze    | 예외 vs 반환값(nullable/Result 타입) 중 상황에 맞는 오류 표현 방식을 선택하고 근거를 설명할 수 있다 |

---

## 2. 서론

### 오류를 어떻게 다룰 것인가

모든 프로그램은 예상치 못한 상황을 만납니다. 네트워크 연결 실패, 잘못된 사용자 입력, 파일 미존재, 메모리 부족… 이런 상황을 어떻게 처리하느냐가 **견고한 소프트웨어**와 그렇지 않은 것을 가릅니다.

Dart는 오류를 두 가지 방식으로 표현합니다.

```
1. 예외 (Exception/Error) 던지기
   → 제어 흐름을 즉시 중단하고 호출자에게 전파
   → try-catch로 잡아서 처리

2. 반환값으로 표현
   → nullable 타입 (T?)
   → Result 패턴 (성공/실패를 객체로 감쌈)
```

어느 방식이 적합한지는 상황에 따라 다릅니다. 이 문서에서 두 방식을 모두 이해하고 상황에 맞게 선택하는 기준을 익힙니다.

> **전제 지식**: Step 8~12 완료 (클래스, 상속, 인터페이스, Enum), Step 2 (Null Safety 기초)

---

## 3. `Error` vs `Exception` — 두 계층의 차이

Dart의 오류 계층 구조는 두 개의 최상위 타입으로 나뉩니다.

```
Object
  ├── Error          — 프로그래밍 오류 (복구 불가, 잡지 않는 것이 원칙)
  │    ├── AssertionError
  │    ├── RangeError
  │    ├── StateError
  │    ├── TypeError
  │    ├── UnsupportedError
  │    └── StackOverflowError
  │
  └── Exception      — 예상 가능한 런타임 예외 (복구 가능, 처리해야 함)
       ├── FormatException
       ├── IOException
       ├── TimeoutException
       └── (커스텀 Exception 구현체들)
```

**`Error` — 프로그래밍 실수의 표시**

`Error`는 코드의 **논리적 결함**을 나타냅니다. 올바른 코드라면 절대 발생해서는 안 되는 상황입니다.

```dart
void main() {
  List<int> numbers = [1, 2, 3];

  // RangeError — 범위 초과 접근 (코드 버그)
  // print(numbers[10]);  // 💥 RangeError: index out of range

  // StateError — 잘못된 상태에서 연산 (코드 버그)
  // [].removeLast();  // 💥 StateError: No element

  // AssertionError — assert 실패 (개발 모드 버그)
  // assert(numbers.isNotEmpty, '리스트가 비어 있으면 안 됩니다');

  // TypeError — 잘못된 타입 캐스팅 (코드 버그)
  // Object x = 'hello';
  // int n = x as int;  // 💥 TypeError
}
```

**`Exception` — 예상 가능한 런타임 상황**

`Exception`은 **올바른 코드도 마주칠 수 있는** 런타임 상황입니다. 네트워크 오류, 잘못된 형식의 입력, 파일 없음 등이 여기에 해당합니다.

```dart
void main() {
  // FormatException — 파싱 실패 (사용자 입력 오류)
  try {
    int.parse('abc');  // 숫자가 아닌 문자열
  } on FormatException catch (e) {
    print('형식 오류: ${e.message}');  // 형식 오류: Invalid radix-10 number
  }

  // 네트워크 타임아웃 (외부 환경 오류)
  // throw TimeoutException('연결 시간 초과', Duration(seconds: 30));
}
```

**핵심 원칙**

```
Error:     잡지 마라 — 코드를 고쳐야 한다
Exception: 잡아라   — 복구 로직을 작성해야 한다
```

---

## 4. `try` / `catch` / `on` / `finally`

### 4.1 기본 구조

```
try {
    // 예외가 발생할 수 있는 코드
} on 예외타입 catch (e, s) {
    // 특정 타입의 예외 처리
} catch (e, s) {
    // 모든 예외 처리 (타입 불문)
} finally {
    // 항상 실행 (예외 발생 여부 무관)
}
```

---

### 4.2 `on` — 타입별 예외 처리

`on`은 **특정 예외 타입만** 처리합니다. 여러 `on` 블록을 순서대로 나열하면 **위에서부터 매칭**합니다.

```dart
void parseAndProcess(String input) {
  try {
    int value = int.parse(input);       // FormatException 가능
    List<int> data = List.filled(value, 0); // RangeError 가능 (음수)
    print('처리 완료: ${data.length}개');
  } on FormatException catch (e) {
    // FormatException만 처리
    print('파싱 오류: "${input}"은 정수가 아닙니다 (${e.message})');
  } on RangeError catch (e) {
    // RangeError만 처리
    print('범위 오류: ${e.message}');
  } on Exception catch (e) {
    // 나머지 Exception 타입 처리
    print('예외 발생: $e');
  }
  // Error는 여기서 잡지 않음 — 의도적
}

void main() {
  parseAndProcess('abc');   // 파싱 오류: "abc"은 정수가 아닙니다
  parseAndProcess('-1');    // 범위 오류: ...
  parseAndProcess('5');     // 처리 완료: 5개
}
```

**`on` 없는 `catch` — 모든 예외 포착**

```dart
try {
  riskyOperation();
} catch (e) {
  // Exception, Error 모두 포착 — 주의: Error까지 잡음
  print('무언가 실패: $e');
}

// Exception만 잡고 싶을 때
try {
  riskyOperation();
} on Exception catch (e) {
  print('예외: $e');
}
// Error는 위로 전파됨 (의도적)
```

---

### 4.3 `catch(e, s)` — 예외 객체와 스택 트레이스

`catch`의 두 번째 매개변수 `s`는 **스택 트레이스(StackTrace)** 입니다. 오류 발생 위치를 추적할 때 사용합니다.

```dart
void deepCall() {
  throw FormatException('깊은 곳에서 발생한 오류');
}

void middleCall() => deepCall();
void topCall()    => middleCall();

void main() {
  try {
    topCall();
  } on FormatException catch (e, stackTrace) {
    print('예외: ${e.message}');
    print('발생 위치:\n$stackTrace');
    // 예외: 깊은 곳에서 발생한 오류
    // 발생 위치:
    // #0      deepCall (file:///...dart:3)
    // #1      middleCall (file:///...dart:7)
    // #2      topCall (file:///...dart:8)
    // #3      main (file:///...dart:12)
  }
}
```

**스택 트레이스 활용 원칙**

```dart
// 로깅 라이브러리와 함께 활용하는 패턴
void handleError(Object e, StackTrace s) {
  // 운영 환경에서는 로깅 서비스로 전송
  print('[ERROR] $e');
  print('[STACK] $s');
}

try {
  riskyOperation();
} catch (e, s) {
  handleError(e, s);
  // 복구 또는 재발생
}
```

---

### 4.4 `finally` — 항상 실행되는 블록

`finally`는 예외 발생 여부와 **무관하게 항상 실행**됩니다. 리소스 해제(파일 닫기, 연결 종료 등)에 사용합니다.

```dart
class DatabaseConnection {
  bool _isOpen = false;

  void open()  { _isOpen = true;  print('DB 연결 열림'); }
  void close() { _isOpen = false; print('DB 연결 닫힘'); }
  void query(String sql) {
    if (!_isOpen) throw StateError('연결이 열려 있지 않습니다');
    print('쿼리 실행: $sql');
    if (sql.contains('DROP')) throw Exception('위험한 쿼리!');
  }
}

void runQuery(String sql) {
  var db = DatabaseConnection();
  db.open();

  try {
    db.query(sql);
    print('쿼리 성공');
  } on Exception catch (e) {
    print('쿼리 실패: $e');
  } finally {
    db.close();  // 예외가 있든 없든 반드시 연결 닫기
  }
}

void main() {
  print('--- 정상 쿼리 ---');
  runQuery('SELECT * FROM users');
  // DB 연결 열림
  // 쿼리 실행: SELECT * FROM users
  // 쿼리 성공
  // DB 연결 닫힘   ← finally

  print('\n--- 오류 쿼리 ---');
  runQuery('DROP TABLE users');
  // DB 연결 열림
  // 쿼리 실행: DROP TABLE users
  // 쿼리 실패: Exception: 위험한 쿼리!
  // DB 연결 닫힘   ← finally (예외가 있어도 실행)
}
```

**`finally`와 `return`의 상호작용**

```dart
int riskyReturn() {
  try {
    return 1;        // return 시도
  } finally {
    print('finally 실행');  // return 전에 finally 먼저 실행
    // return 2;     // finally 안의 return이 try의 return을 덮어씀 — 비권장
  }
}

void main() {
  print(riskyReturn());
  // finally 실행
  // 1
}
```

---

### 4.5 처리 순서와 우선순위

```
try 블록에서 예외 발생
          │
          ▼
  on 블록을 위에서부터 순서대로 매칭
          │
    매칭 성공 ──► 해당 블록 실행
          │
    매칭 실패 ──► 예외가 상위 호출자로 전파
          │
  (매칭 성공/실패 무관)
          │
          ▼
     finally 실행
          │
          ▼
  예외가 전파됐다면 계속 전파
```

```dart
void example() {
  try {
    throw FormatException('오류');
  } on RangeError {
    print('RangeError 처리');          // 실행 안 됨
  } on FormatException {
    print('FormatException 처리');     // ← 실행됨
  } on Exception {
    print('Exception 처리');           // 실행 안 됨 (위에서 이미 처리)
  } finally {
    print('finally 실행');             // 항상 실행
  }
}
```

---

## 5. `throw` — 예외 던지기

`throw`는 예외를 발생시킵니다. `Exception`과 `Error`의 인스턴스를 던질 수 있습니다.

```dart
void validateAge(int age) {
  if (age < 0) {
    throw ArgumentError.value(age, 'age', '나이는 음수일 수 없습니다');
  }
  if (age > 150) {
    throw RangeError.range(age, 0, 150, 'age', '유효하지 않은 나이');
  }
}

void validateEmail(String email) {
  if (email.isEmpty) {
    throw ArgumentError('이메일은 비어 있을 수 없습니다');
  }
  if (!email.contains('@')) {
    throw FormatException('올바른 이메일 형식이 아닙니다', email);
  }
}

// throw는 표현식 — 삼항 연산자, => 안에서도 사용 가능
String getUser(Map<String, String> db, String id) =>
    db[id] ?? (throw StateError('사용자 없음: $id'));

void main() {
  try {
    validateAge(-1);
  } on ArgumentError catch (e) {
    print(e);  // Invalid argument (age): 나이는 음수일 수 없습니다: -1
  }

  try {
    validateEmail('not-an-email');
  } on FormatException catch (e) {
    print('${e.message}: "${e.source}"');
    // 올바른 이메일 형식이 아닙니다: "not-an-email"
  }

  try {
    var users = {'u001': '홍길동'};
    print(getUser(users, 'u001'));   // 홍길동
    print(getUser(users, 'u999'));   // 💥 StateError
  } on StateError catch (e) {
    print(e.message);  // 사용자 없음: u999
  }
}
```

---

## 6. 커스텀 예외 클래스 설계

### 6.1 `Exception` 구현

`Exception` 인터페이스를 구현해 도메인에 특화된 예외를 만듭니다.

```dart
// 기본 커스텀 예외
class AppException implements Exception {
  final String message;
  final String? code;

  const AppException(this.message, {this.code});

  @override
  String toString() => code != null
      ? 'AppException[$code]: $message'
      : 'AppException: $message';
}

// 사용
try {
  throw AppException('처리 중 오류 발생', code: 'ERR_001');
} on AppException catch (e) {
  print(e);  // AppException[ERR_001]: 처리 중 오류 발생
}
```

---

### 6.2 예외 계층 구조 설계

실무에서는 도메인 계층에 맞는 **예외 계층**을 설계합니다.

```dart
// ── 기반 예외 ──
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final Object? cause;  // 원인 예외 (wrapping)

  const AppException(this.message, {this.code, this.cause});

  @override
  String toString() {
    final buf = StringBuffer('${runtimeType}');
    if (code != null) buf.write('[$code]');
    buf.write(': $message');
    if (cause != null) buf.write('\n  원인: $cause');
    return buf.toString();
  }
}

// ── 네트워크 예외 계층 ──
class NetworkException extends AppException {
  final int? statusCode;
  const NetworkException(super.message, {super.code, super.cause, this.statusCode});
}

class TimeoutException extends NetworkException {
  final Duration timeout;
  const TimeoutException(super.message, {required this.timeout})
      : super(code: 'NETWORK_TIMEOUT');
}

class UnauthorizedException extends NetworkException {
  const UnauthorizedException([String message = '인증이 필요합니다'])
      : super(message, code: 'UNAUTHORIZED', statusCode: 401);
}

class NotFoundException extends NetworkException {
  final String resource;
  const NotFoundException(this.resource)
      : super('리소스를 찾을 수 없습니다: $resource',
            code: 'NOT_FOUND', statusCode: 404);
}

// ── 비즈니스 예외 계층 ──
class BusinessException extends AppException {
  const BusinessException(super.message, {super.code});
}

class ValidationException extends BusinessException {
  final Map<String, String> fieldErrors;

  ValidationException(this.fieldErrors)
      : super('유효성 검사 실패', code: 'VALIDATION_ERROR');

  @override
  String toString() {
    final errors = fieldErrors.entries
        .map((e) => '  ${e.key}: ${e.value}')
        .join('\n');
    return 'ValidationException:\n$errors';
  }
}

class InsufficientFundsException extends BusinessException {
  final double required;
  final double available;

  InsufficientFundsException({required this.required, required this.available})
      : super(
          '잔액 부족 (필요: ${required}원, 보유: ${available}원)',
          code: 'INSUFFICIENT_FUNDS',
        );
}

// ── 실제 활용 ──
void main() {
  // 계층적 catch — 구체적인 것부터
  void handleApiCall() {
    try {
      throw NotFoundException('User:u999');
    } on UnauthorizedException {
      print('로그인 페이지로 이동');
    } on NotFoundException catch (e) {
      print('404 처리: ${e.message}');
    } on NetworkException catch (e) {
      print('네트워크 오류: $e');
    } on AppException catch (e) {
      print('앱 오류: $e');
    }
    // 404 처리: 리소스를 찾을 수 없습니다: User:u999
  }

  handleApiCall();

  // ValidationException
  try {
    throw ValidationException({
      'email': '이메일 형식이 올바르지 않습니다',
      'password': '8자 이상이어야 합니다',
    });
  } on ValidationException catch (e) {
    print(e);
    // ValidationException:
    //   email: 이메일 형식이 올바르지 않습니다
    //   password: 8자 이상이어야 합니다
  }
}
```

---

## 7. `rethrow` — 예외 재발생

`rethrow`는 잡은 예외를 **원래 스택 트레이스를 유지한 채** 다시 던집니다. 로깅 후 상위로 전파하거나 부분 처리 후 계속 전파할 때 사용합니다.

```dart
// ❌ throw e — 스택 트레이스가 catch 지점으로 초기화됨
try {
  riskyOperation();
} catch (e) {
  logError(e);
  throw e;  // 원래 발생 위치 정보 손실
}

// ✅ rethrow — 원래 스택 트레이스 유지
try {
  riskyOperation();
} catch (e, s) {
  logError(e, s);
  rethrow;  // 원래 스택 트레이스 그대로 전파
}
```

**`rethrow` 활용 패턴 — 로깅 레이어**

```dart
class Logger {
  static void error(Object e, StackTrace s) {
    print('[ERROR] $e');
    // 실제 서비스라면 외부 로깅 서비스로 전송
  }
}

Future<String> fetchData(String url) async {
  try {
    // HTTP 요청 시뮬레이션
    await Future.delayed(Duration(milliseconds: 100));
    if (url.isEmpty) throw NetworkException('URL이 비어 있습니다');
    return '{"data": "response"}';
  } on NetworkException catch (e, s) {
    Logger.error(e, s);  // 로깅
    rethrow;              // 호출자에게 전파 — 스택 트레이스 유지
  }
}

void main() async {
  try {
    await fetchData('');
  } on NetworkException catch (e) {
    print('최상위 처리: $e');
  }
  // [ERROR] NetworkException: URL이 비어 있습니다
  // 최상위 처리: NetworkException: URL이 비어 있습니다
}
```

**예외 Wrapping — 저수준 예외를 도메인 예외로 변환**

```dart
Future<Map<String, dynamic>> parseApiResponse(String body) async {
  try {
    // json.decode 시뮬레이션
    if (!body.startsWith('{')) throw FormatException('JSON 아님', body);
    return {'ok': true};
  } on FormatException catch (e, s) {
    // 저수준(FormatException) → 도메인 예외(NetworkException)로 변환
    throw NetworkException(
      'API 응답 파싱 실패',
      code: 'PARSE_ERROR',
      cause: e,  // 원인 예외 보존
    );
    // rethrow 대신 throw — 새로운 예외로 감싸기
  }
}
```

---

## 8. 비동기 예외 처리

### 8.1 `async` / `await`에서의 try-catch

`async` 함수에서 `try-catch`는 **동기 코드와 동일한 방식**으로 동작합니다. `await` 표현식에서 발생한 예외도 `catch`로 잡힙니다.

```dart
Future<String> fetchUser(String id) async {
  await Future.delayed(Duration(milliseconds: 100));
  if (id == 'bad') throw NetworkException('사용자 요청 실패', statusCode: 404);
  return '{"id": "$id", "name": "홍길동"}';
}

Future<void> loadUserProfile(String id) async {
  try {
    final data = await fetchUser(id);    // await — 예외 대기
    print('프로필 로드: $data');
  } on NetworkException catch (e) {
    print('네트워크 오류: ${e.message} (${e.statusCode})');
  } on TimeoutException catch (e) {
    print('타임아웃: ${e.timeout}');
  } catch (e, s) {
    print('알 수 없는 오류: $e');
    // 필요시 rethrow
  } finally {
    print('로딩 완료 (성공/실패 무관)');
  }
}

void main() async {
  await loadUserProfile('u001');
  // 프로필 로드: {"id": "u001", "name": "홍길동"}
  // 로딩 완료 (성공/실패 무관)

  await loadUserProfile('bad');
  // 네트워크 오류: 사용자 요청 실패 (404)
  // 로딩 완료 (성공/실패 무관)
}
```

**여러 비동기 작업의 예외 처리**

```dart
Future<void> processAll(List<String> ids) async {
  // 순차 처리 — 각각 try-catch
  for (final id in ids) {
    try {
      final user = await fetchUser(id);
      print('성공: $user');
    } on NetworkException catch (e) {
      print('실패 ($id): ${e.message} — 계속 진행');
      // 이 사용자 실패해도 나머지 계속 처리
    }
  }
}

Future<void> processParallel(List<String> ids) async {
  // 병렬 처리 — Future.wait의 예외 처리
  try {
    final results = await Future.wait(
      ids.map(fetchUser),
      eagerError: false,  // false면 모두 완료 후 오류 보고
    );
    results.forEach(print);
  } on NetworkException catch (e) {
    // 하나라도 실패하면 여기서 처리
    print('병렬 처리 중 오류: ${e.message}');
  }
}

void main() async {
  await processAll(['u001', 'bad', 'u002']);
  // 성공: {"id": "u001", ...}
  // 실패 (bad): 사용자 요청 실패 — 계속 진행
  // 성공: {"id": "u002", ...}
}
```

---

### 8.2 `Future` 체인에서의 에러 처리

`async`/`await` 없이 `Future` 메서드 체인으로 작업할 때의 오류 처리입니다.

```dart
Future<String> riskyFetch() =>
    Future.delayed(Duration(milliseconds: 50))
        .then((_) => throw NetworkException('서버 오류'));

void main() {
  riskyFetch()
      .then((data) => print('성공: $data'))
      .catchError(
        (e) => print('오류 처리: $e'),
        test: (e) => e is NetworkException,  // NetworkException만 처리
      )
      .whenComplete(() => print('완료'));   // finally 역할
}
// 오류 처리: NetworkException: 서버 오류
// 완료
```

> 📌 **권장**: `Future` 체인보다 `async`/`await` + `try-catch` 방식이 가독성이 높고 실수가 적습니다. 새 코드는 `async`/`await`를 사용하세요.

---

## 9. 예외 처리 설계 원칙

### 9.1 언제 예외를 던질 것인가

```dart
// ✅ 예외 던지기가 적합한 경우

// 1. 함수의 사전조건(Precondition) 위반
void setAge(int age) {
  if (age < 0 || age > 150) throw RangeError.range(age, 0, 150, 'age');
}

// 2. 복구 불가능한 외부 환경 오류
Future<String> readFile(String path) async {
  // 파일이 없으면 예외 — 호출자가 결정해야 함
  throw FileSystemException('파일 없음', path);
}

// 3. 명세 위반 (API 계약 파기)
T first<T>(List<T> list) {
  if (list.isEmpty) throw StateError('빈 리스트에서 첫 요소 접근 불가');
  return list[0];
}

// ❌ 예외 던지기가 부적합한 경우

// 1. 자주 발생하는 정상 흐름
// Map에서 없는 키 조회 → null 반환이 자연스러움 (예외 X)
String? findUser(Map<String, String> db, String id) => db[id];

// 2. 단순 유효성 검사 결과 반환
// 오류 메시지 리스트 반환이 적합 (Step 11의 Validatable Mixin)
List<String> validateForm(String email, String password) => [ /* 오류들 */ ];
```

---

### 9.2 언제 예외를 잡을 것인가

```dart
// ✅ 잡아야 하는 경우

// 1. 복구 가능할 때 — 대안 처리 제공
Future<String> fetchWithFallback(String url) async {
  try {
    return await fetchData(url);
  } on NetworkException {
    return await fetchFromCache(url);  // 캐시로 대안
  }
}

// 2. 오류를 다른 형태로 변환할 때
Future<Map<String, dynamic>> parseResponse(String body) async {
  try {
    return jsonDecode(body);
  } on FormatException catch (e) {
    throw NetworkException('응답 파싱 실패', cause: e);  // 변환 후 재발생
  }
}

// 3. 최상위 레이어 — 사용자에게 피드백
void main() async {
  try {
    await runApp();
  } catch (e, s) {
    showErrorDialog('예상치 못한 오류가 발생했습니다');
    Logger.error(e, s);
  }
}

// ❌ 잡지 말아야 하는 경우

// 1. Error 타입 (코드 버그) — 고쳐야 함
try {
  list[999];
} on RangeError {
  // ❌ 잡지 마라 — 인덱스 로직을 고쳐야 함
}

// 2. 복구 못하면서 삼키기 — 최악의 패턴
try {
  criticalOperation();
} catch (e) {
  // ❌ 아무것도 안 함 — 오류 은폐, 디버깅 불가
}
```

---

### 9.3 예외 vs 반환값으로 오류 표현

**방식 1: nullable 반환 (`T?`)**

```dart
// 실패 시 null 반환 — 간단하고 흔한 패턴
int? tryParseInt(String s) {
  try {
    return int.parse(s);
  } on FormatException {
    return null;
  }
}

void main() {
  int? value = tryParseInt('abc');
  print(value ?? 0);  // 0 — null 대신 기본값 사용
}
```

**방식 2: Result 패턴 — 성공/실패를 타입으로 표현**

예외 없이 오류 정보를 풍부하게 전달할 때 유용합니다.

```dart
// 간단한 Result 타입 구현
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T value;
  const Success(this.value);
}

class Failure<T> extends Result<T> {
  final AppException error;
  const Failure(this.error);
}

// 활용
Result<String> fetchUserSafe(String id) {
  try {
    if (id.isEmpty) throw ValidationException({'id': '비어 있음'});
    return Success('{"id": "$id"}');
  } on AppException catch (e) {
    return Failure(e);
  }
}

void main() {
  var result = fetchUserSafe('u001');

  switch (result) {
    case Success(:final value):
      print('성공: $value');
    case Failure(:final error):
      print('실패: $error');
  }
}
```

**오류 표현 방식 선택 기준**

| 상황                           | 권장 방식          |
| ------------------------------ | ------------------ |
| 오류가 드물고 예외적인 상황    | 예외 (`throw`)     |
| 오류가 자주 발생하는 정상 흐름 | nullable (`T?`)    |
| 오류 정보가 풍부해야 함        | Result 패턴        |
| 간단한 조회/파싱 실패          | nullable (`T?`)    |
| 비즈니스 규칙 위반             | 커스텀 예외        |
| 라이브러리 공개 API            | 예외 (문서화 필수) |

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 10-1: `finally` 실행 순서 예측

아래 코드의 출력 순서를 예측하고 이유를 설명하세요.

```dart
String test() {
  try {
    print('try 블록');
    throw Exception('오류!');
  } on Exception {
    print('catch 블록');
    return 'catch에서 반환';
  } finally {
    print('finally 블록');
    // return 'finally에서 반환';  // 이 줄 활성화 시 결과는?
  }
}

void main() {
  print(test());
}
```

> **정답 힌트**
>
> ```
> try 블록
> catch 블록
> finally 블록
> catch에서 반환
> ```
>
> `finally`는 `catch`의 `return` 실행 직전에 호출됩니다. 주석을 해제하면 `finally`의 `return`이 `catch`의 `return`을 덮어써 `'finally에서 반환'`이 출력됩니다 — 비권장 패턴.

### 실습 10-2: 커스텀 예외 계층 설계

아래 요구사항으로 은행 도메인의 예외 계층을 설계하세요.

**요구사항**

- `BankException` — 기반 예외 (`message`, `code` 필드)
- `InsufficientFundsException` — 잔액 부족 (`required`, `available` 필드)
- `AccountNotFoundException` — 계좌 미발견 (`accountId` 필드)
- `DailyLimitExceededException` — 일일 한도 초과 (`limit`, `attempted` 필드)
- `BankService.withdraw(accountId, amount)` 메서드 — 각 상황에서 적절한 예외 발생
- `main()`에서 각 예외를 타입별로 처리

> **정답 힌트**
>
> ```dart
> abstract class BankException implements Exception {
>   final String message;
>   final String code;
>   const BankException(this.message, this.code);
>   @override String toString() => 'BankException[$code]: $message';
> }
>
> class InsufficientFundsException extends BankException {
>   final double required, available;
>   InsufficientFundsException({required this.required, required this.available})
>       : super('잔액 부족 (필요: $required, 보유: $available)', 'INSUFFICIENT_FUNDS');
> }
>
> class AccountNotFoundException extends BankException {
>   final String accountId;
>   AccountNotFoundException(this.accountId)
>       : super('계좌 미발견: $accountId', 'ACCOUNT_NOT_FOUND');
> }
>
> class DailyLimitExceededException extends BankException {
>   final double limit, attempted;
>   DailyLimitExceededException({required this.limit, required this.attempted})
>       : super('일일 한도 초과 (한도: $limit, 시도: $attempted)', 'DAILY_LIMIT');
> }
>
> class BankService {
>   final Map<String, double> _accounts = {'ACC001': 50000};
>   final double _dailyLimit = 100000;
>   double _todayTotal = 0;
>
>   void withdraw(String accountId, double amount) {
>     if (!_accounts.containsKey(accountId))
>       throw AccountNotFoundException(accountId);
>     if (_accounts[accountId]! < amount)
>       throw InsufficientFundsException(
>           required: amount, available: _accounts[accountId]!);
>     if (_todayTotal + amount > _dailyLimit)
>       throw DailyLimitExceededException(
>           limit: _dailyLimit, attempted: _todayTotal + amount);
>     _accounts[accountId] = _accounts[accountId]! - amount;
>     _todayTotal += amount;
>     print('출금 완료: $amount원');
>   }
> }
>
> void main() {
>   var bank = BankService();
>   void tryWithdraw(String id, double amount) {
>     try {
>       bank.withdraw(id, amount);
>     } on AccountNotFoundException catch (e) {
>       print('계좌 오류: ${e.message}');
>     } on InsufficientFundsException catch (e) {
>       print('잔액 오류: ${e.message}');
>     } on DailyLimitExceededException catch (e) {
>       print('한도 오류: ${e.message}');
>     }
>   }
>
>   tryWithdraw('ACC001', 30000);   // 출금 완료
>   tryWithdraw('ACC999', 1000);    // 계좌 오류
>   tryWithdraw('ACC001', 40000);   // 잔액 오류
>   tryWithdraw('ACC001', 10000);   // 한도 오류 (누적 40000)
> }
> ```

### 실습 10-3: 비동기 예외 처리

아래 `DataLoader` 클래스를 완성하세요.

**요구사항**

- `load(String id)` — 비동기로 데이터를 가져오며 실패 시 `NetworkException` 발생
- `loadWithRetry(String id, {int maxRetries = 3})` — 실패 시 최대 `maxRetries`번 재시도
- 재시도 중 각 실패를 로깅하고, 모든 재시도 실패 시 예외 재발생
- `finally`로 로딩 상태를 항상 false로 초기화

```dart
class DataLoader {
  bool isLoading = false;

  Future<String> load(String id) async {
    // 50% 확률로 실패 시뮬레이션
    await Future.delayed(Duration(milliseconds: 50));
    if (id.hashCode % 2 == 0) throw NetworkException('로드 실패: $id');
    return '{"id": "$id"}';
  }

  Future<String> loadWithRetry(String id, {int maxRetries = 3}) async {
    isLoading = true;
    // TODO: 구현
  }
}
```

> **정답 힌트**
>
> ```dart
> Future<String> loadWithRetry(String id, {int maxRetries = 3}) async {
>   isLoading = true;
>   try {
>     for (int attempt = 1; attempt <= maxRetries; attempt++) {
>       try {
>         return await load(id);
>       } on NetworkException catch (e) {
>         print('시도 $attempt/$maxRetries 실패: ${e.message}');
>         if (attempt == maxRetries) rethrow;
>         await Future.delayed(Duration(milliseconds: 100 * attempt));
>       }
>     }
>     throw StateError('도달 불가');
>   } finally {
>     isLoading = false;
>     print('isLoading → false');
>   }
> }
> ```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념          | 핵심 내용                                    |
| ------------- | -------------------------------------------- |
| `Error`       | 프로그래밍 버그 — 잡지 말고 코드를 고쳐야 함 |
| `Exception`   | 예상 가능한 런타임 상황 — 잡아서 처리해야 함 |
| `try-catch`   | 예외 포착 및 처리                            |
| `on 타입`     | 특정 예외 타입만 처리                        |
| `catch(e, s)` | 예외 객체 + 스택 트레이스                    |
| `finally`     | 항상 실행 — 리소스 해제                      |
| `throw`       | 예외 발생, 표현식으로도 사용 가능            |
| `rethrow`     | 스택 트레이스 유지하며 재발생                |
| 커스텀 예외   | `implements Exception`, 계층 구조 설계       |
| 비동기 예외   | `async`/`await` + `try-catch` — 동기와 동일  |
| nullable `T?` | 단순 실패를 null로 표현                      |
| Result 패턴   | 성공/실패를 타입으로 표현                    |

### 🔗 다음 단계

> **Step 14 — 비동기 프로그래밍 심화 (`Future` / `async` / `Stream`)**로 이동하세요.

Step 14에서는 Dart의 비동기 핵심인 `Future` 생성과 조합 (`Future.wait`, `Future.any`), `async`/`await` 내부 원리, 그리고 연속적인 비동기 이벤트를 다루는 `Stream`을 심화 학습합니다. 이번 Step에서 익힌 비동기 예외 처리 패턴이 직접 활용됩니다.

### 📚 참고 자료

| 자료                  | 링크                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| Dart 예외 공식 문서   | <https://dart.dev/language/error-handling>                                           |
| Error vs Exception    | <https://api.dart.dev/stable/dart-core/Error-class.html>                             |
| 커스텀 예외 가이드    | <https://dart.dev/effective-dart/usage#exceptions>                                   |
| Effective Dart — 예외 | <https://dart.dev/effective-dart/usage#do-use-rethrow-to-rethrow-a-caught-exception> |
| DartPad 온라인 실습   | <https://dartpad.dev>                                                                |

### ❓ 자가진단 퀴즈

1. **[Remember]** `rethrow`와 `throw e`의 차이점은 무엇인가? 어느 쪽을 언제 사용해야 하는가?
2. **[Remember]** `on Exception catch (e)`와 `catch (e)`의 차이를 `Error` 타입 처리 관점에서 설명하라.
3. **[Understand]** `finally` 블록이 `try` 블록 안에서 `return`을 만나도 실행되는 이유를 Dart 런타임 동작 관점에서 설명하라.
4. **[Understand]** 아래 두 패턴 중 어느 것이 더 좋은 설계이고, 그 이유는 무엇인가?

   ```dart
   // 패턴 A
   User? findUser(String id) { try { return db[id]; } catch (_) { return null; } }

   // 패턴 B
   User? findUser(String id) => db[id];
   ```

5. **[Apply]** `Future.wait([f1(), f2(), f3()])`에서 `f2()`만 예외를 던질 때, `eagerError: true`와 `eagerError: false`의 동작 차이를 설명하고, 각각이 적합한 상황을 제시하라.
6. **[Analyze]** API 클라이언트 클래스를 설계할 때 모든 메서드에 `try-catch`를 넣는 방식과, 예외를 호출자에게 전파하는 방식을 비교하라. 각 방식이 적합한 레이어(Repository, Service, UI)를 연결해 설명하라.

> **4번 정답 힌트**
>
> 패턴 B가 더 좋습니다. `Map`의 `[]` 연산자는 키가 없으면 `null`을 반환하며 예외를 던지지 않으므로 `try-catch`가 불필요합니다. 패턴 A의 `catch (_)`는 실제로 발생해서는 안 되는 버그(코딩 실수로 인한 Error 등)까지 삼킬 수 있어 위험합니다. 예외는 실제로 예외가 발생할 때만 사용해야 합니다.

> **6번 정답 힌트**
>
> Repository 레이어: 저수준 예외를 도메인 예외로 변환 후 전파 (변환만, 처리 X). Service 레이어: 비즈니스 복구 로직 처리 (재시도, 기본값, 대안 경로). UI 레이어: 사용자 피드백으로 변환 (에러 메시지, 다이얼로그). 각 레이어가 자신의 책임 범위만 처리하고 나머지는 전파하는 것이 계층 분리의 핵심입니다.

---

> ⬅️ [Step 12 — 열거형(Enum)](#) | ➡️ [Step 14 — 비동기 프로그래밍 심화 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Error Handling, Effective Dart) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
