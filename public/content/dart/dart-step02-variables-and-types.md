# Step 2 — 변수와 데이터 타입

> **Phase 1 | Dart 기초** | 예상 소요: 2일 | 블룸 수준: Remember ~ Understand

---

## 📋 목차

- [Step 2 — 변수와 데이터 타입](#step-2--변수와-데이터-타입)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [Dart 타입 시스템의 철학](#dart-타입-시스템의-철학)
  - [3. 변수 선언 키워드](#3-변수-선언-키워드)
    - [3.1 `var` — 타입 추론](#31-var--타입-추론)
    - [3.2 `final` — 런타임 상수](#32-final--런타임-상수)
    - [3.3 `const` — 컴파일 타임 상수](#33-const--컴파일-타임-상수)
    - [3.4 세 키워드 비교 정리](#34-세-키워드-비교-정리)
  - [4. 기본 데이터 타입](#4-기본-데이터-타입)
    - [4.1 숫자형: `int`, `double`, `num`](#41-숫자형-int-double-num)
    - [4.2 문자열: `String`](#42-문자열-string)
    - [4.3 불리언: `bool`](#43-불리언-bool)
    - [4.4 `dynamic` — 타입 안전성의 탈출구이자 위험지대](#44-dynamic--타입-안전성의-탈출구이자-위험지대)
  - [5. Null Safety 기초](#5-null-safety-기초)
    - [5.1 Null Safety란?](#51-null-safety란)
    - [5.2 `?` — Nullable 타입 선언](#52---nullable-타입-선언)
    - [5.3 `!` — Null 아님 단언 연산자](#53---null-아님-단언-연산자)
    - [5.4 `late` — 지연 초기화](#54-late--지연-초기화)
  - [6. 타입 시스템 심화](#6-타입-시스템-심화)
    - [6.1 타입 검사: `is`, `is!`](#61-타입-검사-is-is)
    - [6.2 타입 캐스팅: `as`](#62-타입-캐스팅-as)
    - [6.3 `Object` vs `dynamic` vs `var` 최종 정리](#63-object-vs-dynamic-vs-var-최종-정리)
  - [7. 실습](#7-실습)
    - [실습 7-1: 변수 키워드 실험](#실습-7-1-변수-키워드-실험)
    - [실습 7-2: Null Safety 오류 수정](#실습-7-2-null-safety-오류-수정)
    - [실습 7-3: 타입 추론 확인](#실습-7-3-타입-추론-확인)
  - [8. 핵심 요약 및 다음 단계](#8-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                        |
| --- | ------------- | --------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `var`, `final`, `const`, `dynamic`, `late`의 역할을 나열할 수 있다          |
| 2   | 🔵 Remember   | Dart의 기본 데이터 타입(`int`, `double`, `String`, `bool`)을 나열할 수 있다 |
| 3   | 🟢 Understand | `final`과 `const`의 차이(Runtime vs Compile-time 상수)를 설명할 수 있다     |
| 4   | 🟢 Understand | Null Safety가 필요한 이유와 `?`, `!`, `late`의 역할을 설명할 수 있다        |
| 5   | 🟡 Apply      | `dynamic` 사용이 위험한 상황과 대안을 코드로 제시할 수 있다                 |

---

## 2. 서론

### Dart 타입 시스템의 철학

프로그래밍 언어의 타입 시스템은 코드의 **안전성**과 **생산성**을 결정짓는 핵심 설계입니다. Dart는 이 두 가지를 동시에 달성하기 위해 다음 원칙을 따릅니다.

**1. 강타입(Strongly Typed) 언어**

모든 변수는 타입을 가집니다. 컴파일러가 타입 불일치를 사전에 감지해 런타임 오류를 예방합니다.

**2. 타입 추론(Type Inference) 지원**

`var` 키워드를 사용하면 컴파일러가 초기값에서 타입을 자동 추론합니다. 타입 안전성을 유지하면서도 코드를 간결하게 작성할 수 있습니다.

**3. Sound Null Safety (Dart 2.12+)**

기존의 수많은 런타임 오류 원인인 `Null Reference Error`를 컴파일 타임에 원천 차단합니다. Flutter 앱 안정성의 핵심 기반입니다.

![diagram](/developer-open-book/diagrams/step02-type-system-goal.svg)

> **전제 지식**: Step 1 완료 (Dart 환경 구축, `dart run` 실행 가능)

---

## 3. 변수 선언 키워드

### 3.1 `var` — 타입 추론

`var`는 초기값을 기반으로 컴파일러가 타입을 **자동 추론**합니다. 한 번 타입이 결정되면 변경할 수 없습니다.

```dart
void main() {
  var name = 'Flutter';     // String으로 추론
  var version = 3;          // int로 추론
  var pi = 3.14;            // double로 추론
  var isActive = true;      // bool로 추론

  print(name.runtimeType);  // String
  print(version.runtimeType); // int

  // ❌ 타입 변경 불가 — 컴파일 오류 발생
  // name = 42;  // Error: A value of type 'int' can't be assigned to 'String'

  // ✅ 같은 타입으로 재할당은 가능
  name = 'Dart';
}
```

**`var` 사용 가이드라인**

| 상황                      | 권장 방식              |
| ------------------------- | ---------------------- |
| 초기값이 명확한 로컬 변수 | `var` 사용 (타입 추론) |
| 함수 매개변수, 반환 타입  | 명시적 타입 선언 권장  |
| 클래스 필드               | 명시적 타입 선언 권장  |

> 📌 **Effective Dart 가이드**: 로컬 변수에는 `var`를 사용하되, 공개 API(매개변수, 반환 타입)에는 타입을 명시하는 것을 권장합니다.

---

### 3.2 `final` — 런타임 상수

`final`은 **한 번만 할당 가능**한 변수입니다. 값은 **런타임(실행 시)** 에 결정될 수 있습니다.

```dart
void main() {
  // ✅ 런타임에 결정되는 값도 final에 할당 가능
  final currentTime = DateTime.now();  // 실행 시점에 결정
  final userName = getUserName();       // 함수 반환값도 가능

  print(currentTime);

  // ❌ 재할당 불가 — 컴파일 오류
  // currentTime = DateTime.now();  // Error: 'currentTime' can't be used as a setter

  // ✅ final은 객체 자체의 재할당을 막을 뿐, 내부 상태 변경은 가능
  final list = [1, 2, 3];
  list.add(4);     // ✅ 가능 — 리스트 내부 변경
  // list = [];    // ❌ 불가 — 참조 변경
}

String getUserName() => 'Dart Developer';
```

**`final`의 대표적 사용 사례**

```dart
class UserProfile {
  final String id;       // 생성 후 변경 불가
  final String email;    // 생성 후 변경 불가
  String nickname;       // 변경 가능

  UserProfile({required this.id, required this.email, required this.nickname});
}
```

---

### 3.3 `const` — 컴파일 타임 상수

`const`는 **컴파일 타임에 완전히 결정**되어야 하는 상수입니다. `final`보다 더 강한 불변성을 보장하며, 성능 최적화에 활용됩니다.

```dart
void main() {
  // ✅ 컴파일 타임에 결정 가능한 값만 허용
  const maxRetry = 3;
  const appName = 'My Dart App';
  const pi = 3.14159;

  // ❌ 런타임에 결정되는 값은 const 불가 — 컴파일 오류
  // const currentTime = DateTime.now();
  // Error: Const variables must be initialized with a constant value.

  // ✅ const 객체 — 동일한 값은 메모리에서 재사용
  const pointA = (1, 2);   // Records (Dart 3.0+)
  const pointB = (1, 2);
  print(identical(pointA, pointB));  // true — 같은 메모리 객체
}
```

**`const` 생성자 — Flutter에서의 핵심 역할**

Flutter 위젯에서 `const`는 **위젯 재빌드 최적화**의 핵심입니다.

```dart
// ❌ const 없음 — 부모 위젯이 재빌드될 때마다 새 객체 생성
Text('Hello')

// ✅ const 사용 — 동일한 위젯 인스턴스를 재사용, 불필요한 재빌드 방지
const Text('Hello')
```

---

### 3.4 세 키워드 비교 정리

![diagram](/developer-open-book/diagrams/step02-variable-decision.svg)

| 키워드  | 재할당  | 값 결정 시점    | 불변 깊이   | 주요 사용처           |
| ------- | ------- | --------------- | ----------- | --------------------- |
| `var`   | ✅ 가능 | 런타임          | -           | 일반 로컬 변수        |
| `final` | ❌ 불가 | **런타임**      | 참조만 불변 | 클래스 필드, 1회용 값 |
| `const` | ❌ 불가 | **컴파일 타임** | 완전 불변   | 상수, Flutter 위젯    |

```dart
// 세 키워드 비교 한눈에 보기
void main() {
  var     a = 'hello';  a = 'world';           // ✅ 재할당 가능
  final   b = 'hello';  // b = 'world';        // ❌ 재할당 불가
  const   c = 'hello';  // c = 'world';        // ❌ 재할당 불가

  // final vs const 차이
  final   d = DateTime.now();   // ✅ 런타임 값 허용
  // const e = DateTime.now();  // ❌ 컴파일 타임 불가
}
```

---

## 4. 기본 데이터 타입

Dart의 모든 것은 **객체(Object)** 입니다. `int`, `double`, `bool` 같은 기본 타입도 예외가 없습니다. JavaScript의 원시 타입(Primitive Type)과 달리 Dart에서는 모든 타입이 메서드를 가집니다.

### 4.1 숫자형: `int`, `double`, `num`

```dart
void main() {
  // int — 정수 (64비트)
  int age = 25;
  int hexValue = 0xDEADBEEF;   // 16진수 표현
  int binaryValue = 0b1010;    // 2진수 표현 (Dart 3.0+)

  // double — 부동소수점 (64비트 IEEE 754)
  double height = 175.5;
  double scientific = 1.42e5;  // 142000.0

  // num — int와 double의 공통 상위 타입
  num score = 98;              // int 할당 가능
  score = 98.5;                // double 할당도 가능

  // 유용한 내장 메서드
  print((-7).abs());           // 7
  print(3.14.round());         // 3
  print(3.14.ceil());          // 4
  print(3.14.floor());         // 3
  print(100.toDouble());       // 100.0
  print(3.99.toInt());         // 3 (내림, 버림)

  // 타입 관계
  print(3 is int);     // true
  print(3 is num);     // true — int는 num의 하위 타입
  print(3.0 is double); // true
  print(3.0 is num);   // true
}
```

**숫자형 타입 계층 구조**

```
Object
  └── num
       ├── int
       └── double
```

---

### 4.2 문자열: `String`

Dart의 `String`은 **UTF-16 코드 유닛**의 시퀀스입니다. 작은따옴표(`'`)와 큰따옴표(`"`) 모두 사용 가능합니다.

```dart
void main() {
  // 기본 선언 — 작은따옴표 권장 (Dart 스타일 가이드)
  String greeting = 'Hello, Dart!';
  String message = "Double quotes also work";

  // 문자열 보간법 (String Interpolation)
  String name = 'World';
  print('Hello, $name!');          // Hello, World!
  print('1 + 1 = ${1 + 1}');      // 1 + 1 = 2
  print('Upper: ${name.toUpperCase()}');  // Upper: WORLD

  // 멀티라인 문자열 — 삼중 따옴표
  String multiLine = '''
  첫 번째 줄
  두 번째 줄
  세 번째 줄
  ''';

  // 원시 문자열 — 이스케이프 무시
  String rawString = r'경로: C:\Users\dart\file.txt';
  print(rawString);  // 경로: C:\Users\dart\file.txt (\ 그대로 출력)

  // 문자열 연결
  String firstName = 'Dart';
  String lastName = 'Developer';
  String fullName = firstName + ' ' + lastName;    // 연결 연산자
  String fullName2 = '$firstName $lastName';        // 보간법 (권장)

  // 유용한 내장 메서드
  print('dart'.length);           // 4
  print('Dart'.toLowerCase());    // dart
  print('dart'.toUpperCase());    // DART
  print('  hello  '.trim());      // hello
  print('hello'.contains('ell')); // true
  print('a,b,c'.split(','));      // [a, b, c]
  print('dart'.replaceAll('a', '@')); // d@rt
  print('dart'.startsWith('da')); // true
  print('dart'[0]);               // d (인덱스 접근)
}
```

---

### 4.3 불리언: `bool`

```dart
void main() {
  bool isLoggedIn = true;
  bool hasPermission = false;

  // Dart에서 bool은 오직 true 또는 false만 허용
  // JavaScript와 달리 0, '', null 등은 false로 간주되지 않음
  // ❌ if (0) { ... }  // 컴파일 오류 — int를 bool로 사용 불가
  // ✅ if (0 == 0) { ... }  // 명시적 비교 필요

  // 논리 연산자
  print(true && false);  // false (AND)
  print(true || false);  // true  (OR)
  print(!true);          // false (NOT)
}
```

> **JavaScript와의 차이**: Dart의 `bool`은 `true`/`false`만 허용합니다. 숫자나 문자열을 조건식에 직접 사용할 수 없어 실수로 인한 버그를 예방합니다.

---

### 4.4 `dynamic` — 타입 안전성의 탈출구이자 위험지대

`dynamic`은 **모든 타입의 값을 할당**할 수 있으며, 타입 검사를 런타임으로 미룹니다. Dart의 강타입 시스템에서 벗어나는 탈출구입니다.

```dart
void main() {
  dynamic flexible = 'Hello';
  print(flexible.runtimeType);  // String

  flexible = 42;               // ✅ int로 변경 가능
  print(flexible.runtimeType); // int

  flexible = true;             // ✅ bool로 변경 가능
  print(flexible.runtimeType); // bool
}
```

**`dynamic`의 위험성 — 런타임 오류 예시**

```dart
void main() {
  dynamic value = 'Hello, Dart!';

  // 컴파일러가 오류를 감지하지 못함
  // ❌ 런타임에 NoSuchMethodError 발생!
  print(value.toUpperCase());  // ✅ String이므로 정상 작동
  value = 42;
  print(value.toUpperCase());  // 💥 런타임 오류: int에는 toUpperCase() 없음
}
```

**`dynamic` vs `Object` vs `var` 비교**

| 키워드    | 타입 결정                  | 메서드 호출             | 주요 특징                   |
| --------- | -------------------------- | ----------------------- | --------------------------- |
| `var`     | 초기값으로 추론, 이후 고정 | 추론된 타입의 메서드    | 타입 안전, 간결한 코드      |
| `Object`  | 모든 타입 허용, 고정       | `Object` 메서드만       | 안전하지만 타입 캐스팅 필요 |
| `dynamic` | 런타임에 변경 가능         | 모든 메서드 (검사 없음) | 유연하지만 런타임 오류 위험 |

```dart
void main() {
  Object obj = 'Hello';
  // obj.toUpperCase();  // ❌ 컴파일 오류 — Object에 toUpperCase() 없음
  (obj as String).toUpperCase();  // ✅ 타입 캐스팅 후 사용

  dynamic dyn = 'Hello';
  dyn.toUpperCase();  // ✅ 컴파일 통과 — 하지만 런타임 위험
}
```

**`dynamic` 사용이 불가피한 경우**

`dynamic`은 아래 상황에서 제한적으로 사용합니다:

- 외부 라이브러리의 JSON 데이터 파싱 초기 단계
- 타입이 완전히 불확실한 데이터를 다루는 유틸리티 함수

> ⚠️ **규칙**: `dynamic`을 사용해야 한다면 최대한 좁은 범위에서만 사용하고, 가능한 빨리 명확한 타입으로 변환하세요.

---

## 5. Null Safety 기초

### 5.1 Null Safety란?

Dart 2.12(2021)에서 도입된 **Sound Null Safety**는 변수가 `null`을 가질 수 있는지 여부를 **컴파일 타임에 명시**하도록 강제하는 시스템입니다.

**Null Safety 이전의 문제**

```dart
// Null Safety 이전 (Dart 2.12 미만)
String name = null;   // 아무 타입이나 null 가능
print(name.length);   // 💥 런타임 NPE (Null Pointer Exception)
                      //    → 앱이 배포된 후 사용자에게 크래시 발생
```

**Null Safety 도입 후**

```dart
// Null Safety 이후 (Dart 2.12+)
String name = null;   // ❌ 컴파일 오류 — null 허용 안 됨
                      //    → 개발 중에 즉시 발견

String? nullableName = null;  // ✅ ? 를 붙여야 null 허용
```

```
[Null Safety가 가져온 변화]

Dart 2.12 이전                Dart 2.12 이후
─────────────────────         ─────────────────────
모든 타입에 null 허용          기본: null 허용 안 함
런타임에 NPE 발생              컴파일 타임에 오류 감지
앱 크래시로 발견              개발 중 즉시 수정 가능
```

---

### 5.2 `?` — Nullable 타입 선언

타입 뒤에 `?`를 붙이면 해당 변수가 `null`을 가질 수 있음을 명시합니다.

```dart
void main() {
  // Non-nullable (기본) — null 불가
  String requiredName = 'Dart';
  int requiredAge = 25;

  // Nullable — null 허용
  String? optionalName = null;     // ✅
  int? optionalAge = null;         // ✅
  optionalName = 'Flutter';        // ✅ null이 아닌 값도 할당 가능

  // Nullable 변수 사용 시 null 체크 필요
  String? maybeNull = null;

  // ❌ 컴파일 오류 — null일 수 있는 변수를 직접 사용
  // print(maybeNull.length);

  // ✅ null 체크 후 사용
  if (maybeNull != null) {
    print(maybeNull.length);  // null 체크 이후 자동으로 non-nullable로 승격
  }

  // ✅ null 조건부 접근 연산자 (?.)
  print(maybeNull?.length);   // null이면 null 반환, 아니면 length 반환

  // ✅ null 병합 연산자 (??)
  print(maybeNull ?? '기본값');  // null이면 '기본값' 사용
}
```

**Null 체크 후 타입 자동 승격 (Smart Cast)**

```dart
void printLength(String? text) {
  if (text == null) return;

  // null 체크 이후 컴파일러가 text를 String으로 자동 승격
  print(text.length);  // ✅ null 체크 불필요 — 컴파일러가 이미 알고 있음
}
```

---

### 5.3 `!` — Null 아님 단언 연산자

`!`는 개발자가 컴파일러에게 "이 값은 **절대 null이 아님**을 내가 보장한다"고 선언하는 연산자입니다.

```dart
void main() {
  String? maybeNull = 'Hello';

  // ✅ 개발자가 null이 아님을 확신할 때 사용
  String definitelyNotNull = maybeNull!;
  print(definitelyNotNull.length);  // 5

  // ⚠️ 위험: 실제로 null이면 런타임 오류 발생
  String? actuallyNull = null;
  // print(actuallyNull!.length);  // 💥 Null check operator used on a null value
}
```

**`!` 사용 가이드라인**

| 상황                               | 권장 방식           |
| ---------------------------------- | ------------------- |
| 값이 null이 아님을 논리적으로 확신 | `!` 사용 가능       |
| null 가능성이 조금이라도 있음      | `?.` 또는 `??` 사용 |
| 외부 데이터(API, 사용자 입력)      | `!` 절대 금지       |

> ⚠️ **규칙**: `!`는 최후의 수단입니다. 사용 전에 반드시 null이 불가능한 이유를 주석으로 명시하세요.

---

### 5.4 `late` — 지연 초기화

`late`는 변수 선언 시 초기화를 미루고, **나중에 반드시 초기화할 것**을 컴파일러에게 약속하는 키워드입니다.

```dart
class UserService {
  // 선언 시점에는 초기화 불가 — 생성자에서 초기화
  late String userId;
  late final String apiKey;  // final과 함께 사용 가능

  void initialize(String id, String key) {
    userId = id;    // ✅ 나중에 초기화
    apiKey = key;   // ✅ late final은 한 번만 초기화
  }

  void printInfo() {
    print(userId);  // 초기화 전 접근 시 LateInitializationError 발생
  }
}
```

**`late`의 주요 사용 패턴**

```dart
// 패턴 1: 의존성 주입 — 생성자에서 초기화
class Controller {
  late final DatabaseService _db;

  void init(DatabaseService db) {
    _db = db;
  }
}

// 패턴 2: 지연 초기화 (Lazy Initialization) — 첫 접근 시 한 번만 실행
class HeavyResource {
  late final String expensiveData = _loadData();  // 첫 접근 시 실행

  String _loadData() {
    print('데이터 로드 중...');
    return '무거운 데이터';
  }
}

void main() {
  var resource = HeavyResource();
  // 이 시점까지 _loadData() 미실행
  print(resource.expensiveData);  // 첫 접근 시 "데이터 로드 중..." 출력
  print(resource.expensiveData);  // 두 번째 접근 시 이미 로드된 값 재사용
}
```

**Null Safety 키워드 한눈에 보기**

| 키워드    | 역할                | 오류 발생 시점              |
| --------- | ------------------- | --------------------------- |
| `String?` | null 허용 타입 선언 | 컴파일 타임                 |
| `!`       | null 아님 강제 단언 | 런타임 (null이면 즉시 오류) |
| `late`    | 지연 초기화 약속    | 런타임 (초기화 전 접근 시)  |
| `?.`      | null 조건부 접근    | 없음 (null이면 null 반환)   |
| `??`      | null 병합           | 없음 (null이면 기본값 반환) |

---

## 6. 타입 시스템 심화

### 6.1 타입 검사: `is`, `is!`

런타임에 변수의 타입을 검사합니다.

```dart
void main() {
  Object value = 'Hello';

  print(value is String);   // true
  print(value is int);      // false
  print(value is! int);     // true (is의 부정)

  // is 검사 후 자동 타입 승격
  if (value is String) {
    print(value.toUpperCase());  // ✅ String 메서드 바로 사용 가능
  }
}
```

### 6.2 타입 캐스팅: `as`

컴파일러가 모르는 타입을 개발자가 명시적으로 변환합니다.

```dart
void main() {
  Object obj = 'Hello, Dart!';

  // ✅ 안전한 캐스팅
  String text = obj as String;
  print(text.length);  // 12

  // ❌ 잘못된 타입으로 캐스팅 — 런타임 오류
  // int number = obj as int;  // 💥 CastError

  // 안전한 캐스팅 패턴 — as 대신 is 확인 후 사용
  if (obj is String) {
    print(obj.length);  // ✅ 타입 승격으로 캐스팅 불필요
  }
}
```

### 6.3 `Object` vs `dynamic` vs `var` 최종 정리

```dart
void demonstrateTypes() {
  // var — 타입 추론, 이후 고정
  var a = 'hello';
  // a = 42;       // ❌ 타입 고정 후 변경 불가

  // Object — 모든 타입 허용, 하지만 Object 메서드만 접근
  Object b = 'hello';
  // b.toUpperCase();  // ❌ Object에 없는 메서드
  (b as String).toUpperCase();  // ✅ 캐스팅 필요

  // dynamic — 모든 타입, 모든 메서드 (타입 검사 없음)
  dynamic c = 'hello';
  c.toUpperCase();    // ✅ 컴파일 통과 (런타임 위험)
  c = 42;             // ✅ 타입 변경 가능
  // c.toUpperCase(); // 💥 런타임 오류
}
```

---

## 7. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 7-1: 변수 키워드 실험

아래 코드에서 주석 처리된 각 줄이 **왜 오류인지** 설명해 보세요.

```dart
void main() {
  // 각 주석의 오류 이유를 설명하세요
  var x = 10;
  x = 20;          // ✅
  // x = 'hello';  // ❓ 왜 오류인가?

  final y = 10;
  // y = 20;       // ❓ 왜 오류인가?

  const z = 10;
  // z = 20;       // ❓ 왜 오류인가?

  // const w = DateTime.now(); // ❓ 왜 오류인가?
  final v = DateTime.now();    // ✅ 왜 이건 가능한가?
}
```

> **정답 힌트**
>
> 1. `x = 'hello'`: `var`로 선언된 `x`는 초기값 `10`으로 인해 `int`로 타입이 고정됨. `String` 재할당 불가
> 2. `y = 20`: `final`은 한 번 할당 후 재할당 불가
> 3. `z = 20`: `const`도 재할당 불가 (`final`보다 더 강한 불변성)
> 4. `const w = DateTime.now()`: `DateTime.now()`는 실행 시점에 결정되므로 컴파일 타임 상수 불가. `final`은 런타임 값 허용

### 실습 7-2: Null Safety 오류 수정

아래 코드에는 Null Safety 위반이 3곳 있습니다. 모두 찾아 수정하세요.

```dart
void main() {
  String name = null;              // (1)

  String? greeting = '안녕하세요';
  print(greeting.length);          // (2)

  String? city = null;
  String result = city;            // (3)
}
```

> **정답 힌트**
>
> 1. `String name = null` → `String? name = null` (null을 허용하려면 `?` 필요)
> 2. `greeting.length` → `greeting?.length` 또는 `if (greeting != null)` 체크 필요
> 3. `String result = city` → `String result = city ?? '기본값'` (nullable을 non-nullable에 할당 불가)

### 실습 7-3: 타입 추론 확인

DartPad에서 아래 코드를 실행하고 각 변수의 `runtimeType`을 확인하세요.

```dart
void main() {
  var a = 42;
  var b = 3.14;
  var c = 'Dart';
  var d = true;
  var e = [1, 2, 3];
  var f = {'key': 'value'};

  // 각 변수의 타입을 출력
  print('a: ${a.runtimeType}');
  print('b: ${b.runtimeType}');
  print('c: ${c.runtimeType}');
  print('d: ${d.runtimeType}');
  print('e: ${e.runtimeType}');
  print('f: ${f.runtimeType}');
}
```

---

## 8. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                     | 핵심 내용                                        |
| ------------------------ | ------------------------------------------------ |
| `var`                    | 타입 추론, 이후 타입 고정, 재할당 가능           |
| `final`                  | 런타임 상수, 1회 할당 후 재할당 불가             |
| `const`                  | 컴파일 타임 상수, 완전 불변, 성능 최적화         |
| `int` / `double` / `num` | 숫자형 타입 계층 구조                            |
| `String`                 | UTF-16 문자열, 보간법(`$`, `${}`)                |
| `bool`                   | `true`/`false`만 허용, 타입 강제                 |
| `dynamic`                | 모든 타입 허용, 타입 검사 없음, 런타임 오류 위험 |
| `?`                      | Nullable 타입 선언                               |
| `!`                      | Null 아님 강제 단언, 런타임 오류 위험            |
| `late`                   | 지연 초기화, 나중에 반드시 초기화 약속           |

### 🔗 다음 단계

> **Step 3 — 연산자와 조건문**으로 이동하세요.

Step 3에서는 Dart의 특화 연산자인 `??`(Null 병합), `??=`(Null 대입), `?.`(Null safe 호출)을 심화 학습하고, Dart 3.0+에서 도입된 **패턴 매칭(Pattern Matching)** 을 활용한 `switch` 문을 학습합니다.

### 📚 참고 자료

| 자료                     | 링크                                                     |
| ------------------------ | -------------------------------------------------------- |
| Dart 변수 공식 문서      | <https://dart.dev/language/variables>                    |
| Dart 내장 타입 공식 문서 | <https://dart.dev/language/built-in-types>               |
| Null Safety 이해하기     | <https://dart.dev/null-safety/understanding-null-safety> |
| Effective Dart — 스타일  | <https://dart.dev/effective-dart/style>                  |
| DartPad 온라인 실습      | <https://dartpad.dev>                                    |

### ❓ 자가진단 퀴즈

1. **[Remember]** `final`과 `const`의 차이점은 무엇인가?
2. **[Remember]** `dynamic` 타입의 단점은 무엇인가?
3. **[Understand]** `late` 키워드를 사용해야 하는 상황을 두 가지 예시로 설명하라.
4. **[Understand]** Null Safety가 도입되기 이전과 이후의 코드 안전성 차이를 설명하라.
5. **[Apply]** `String? value = getUserInput()`일 때, `value`가 null이면 `'익명'`을 사용하고 아니면 그 값을 대문자로 변환하는 코드를 작성하라.

> **5번 정답 힌트**
>
> ```dart
> String result = (value ?? '익명').toUpperCase();
> ```

---

_참고: 이 문서는 dart.dev 공식 문서(Variables, Built-in types, Null safety) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
