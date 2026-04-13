# Step 18 — 타입 패턴 매칭과 Sealed Class

> **Phase 4 | 타입 시스템과 패턴** | 예상 소요: 2일 | 블룸 수준: Apply ~ Evaluate

---

## 📋 목차

- [Step 18 — 타입 패턴 매칭과 Sealed Class](#step-18--타입-패턴-매칭과-sealed-class)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [닫힌 타입 계층과 완전한 분기](#닫힌-타입-계층과-완전한-분기)
  - [3. Sealed Class](#3-sealed-class)
    - [3.1 `sealed` 키워드](#31-sealed-키워드)
    - [3.2 Sealed Class의 제약 조건](#32-sealed-class의-제약-조건)
    - [3.3 Sealed Class vs abstract class vs Enum](#33-sealed-class-vs-abstract-class-vs-enum)
  - [4. 패턴 매칭 심화](#4-패턴-매칭-심화)
    - [4.1 `switch` 표현식과 Exhaustiveness Check](#41-switch-표현식과-exhaustiveness-check)
    - [4.2 타입 패턴 (Type Pattern)](#42-타입-패턴-type-pattern)
    - [4.3 구조 분해 (Destructuring)](#43-구조-분해-destructuring)
    - [4.4 Guard Clause — `when`](#44-guard-clause--when)
    - [4.5 OR 패턴 (`|`)](#45-or-패턴-)
    - [4.6 Wildcard 패턴 (`_`)](#46-wildcard-패턴-_)
  - [5. Class Modifier 전체 정리](#5-class-modifier-전체-정리)
    - [5.1 `final class`](#51-final-class)
    - [5.2 `base class`](#52-base-class)
    - [5.3 `interface class`](#53-interface-class)
  - [6. Sealed Class 실용 패턴](#6-sealed-class-실용-패턴)
    - [6.1 UI 상태 모델링](#61-ui-상태-모델링)
    - [6.2 도메인 이벤트](#62-도메인-이벤트)
    - [6.3 네트워크 응답](#63-네트워크-응답)
    - [6.4 Sealed Class + Result 타입 조합](#64-sealed-class--result-타입-조합)
  - [7. 실습](#7-실습)
    - [실습 7-1: Exhaustiveness Check 체험](#실습-7-1-exhaustiveness-check-체험)
    - [실습 7-2: 게임 캐릭터 Sealed Class](#실습-7-2-게임-캐릭터-sealed-class)
    - [실습 7-3: UI 상태 파이프라인](#실습-7-3-ui-상태-파이프라인)
  - [8. 핵심 요약 및 다음 단계](#8-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [Phase 4 완료 체크리스트](#phase-4-완료-체크리스트)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                             |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `sealed`, `final`, `base`, `interface` class modifier의 제약 조건을 나열할 수 있다                               |
| 2   | 🟢 Understand | Sealed Class가 exhaustiveness check를 가능하게 하는 원리를 설명할 수 있다                                        |
| 3   | 🟢 Understand | 구조 분해(Destructuring)가 switch 표현식 내에서 타입 승격과 결합되는 방식을 설명할 수 있다                       |
| 4   | 🟡 Apply      | UI 상태, 도메인 이벤트, 네트워크 응답을 Sealed Class로 모델링할 수 있다                                          |
| 5   | 🟡 Apply      | `when` guard clause와 OR 패턴을 조합해 복잡한 분기 로직을 간결하게 표현할 수 있다                                |
| 6   | 🔴 Evaluate   | Sealed Class, Enum, abstract class 중 주어진 도메인 요구사항에 가장 적합한 방식을 선택하고 근거를 평가할 수 있다 |

---

## 2. 서론

### 닫힌 타입 계층과 완전한 분기

도메인 로직을 표현할 때 종종 이런 상황이 등장합니다.

```dart
// 네트워크 응답은 세 가지 상태 중 하나
// - 로딩 중
// - 성공 (데이터 포함)
// - 실패 (오류 포함)

// ❌ abstract class만으로는 exhaustiveness check 없음
abstract class ApiResponse {}
class Loading    extends ApiResponse {}
class Success    extends ApiResponse { final String data; Success(this.data); }
class Failure    extends ApiResponse { final Exception e; Failure(this.e); }

// 새 하위 클래스가 언제든 추가될 수 있음
// → switch에서 모든 케이스를 처리했는지 컴파일러가 보장 못 함
String handle(ApiResponse r) => switch (r) {
  Loading()  => '로딩 중',
  Success()  => '성공',
  // Failure 누락 ← ❌ 컴파일 오류 없음 — 런타임에서야 발견
  _ => '알 수 없음',  // default 필요
};
```

**`sealed`는 이 문제를 해결합니다.**

```dart
// ✅ sealed — 같은 파일에서만 하위 타입 정의 가능
//            → 모든 하위 타입을 컴파일러가 알 수 있음
//            → switch에서 exhaustiveness check 가능

sealed class ApiResponse {}
class Loading extends ApiResponse {}
class Success extends ApiResponse { final String data; Success(this.data); }
class Failure extends ApiResponse { final Exception e; Failure(this.e); }

String handle(ApiResponse r) => switch (r) {
  Loading()            => '로딩 중',
  Success(:final data) => '성공: $data',
  Failure(:final e)    => '오류: $e',
  // default 불필요 — 모든 하위 타입이 처리됨
  // Failure 누락 시 즉시 컴파일 오류
};
```

> **전제 지식**: Step 10 (상속, abstract class), Step 12 (Enum, switch 패턴), Step 16 (Result 패턴)

---

## 3. Sealed Class

### 3.1 `sealed` 키워드

```dart
// sealed class 선언
sealed class Shape {}

// 같은 파일 내 하위 타입 — class, enum, mixin 모두 가능
class Circle    extends Shape { final double radius; Circle(this.radius); }
class Rectangle extends Shape { final double w, h;  Rectangle(this.w, this.h); }
class Triangle  extends Shape {
  final double a, b, c;
  Triangle(this.a, this.b, this.c);
}

// 다른 파일에서 하위 타입 추가 시도 → 컴파일 오류
// class Pentagon extends Shape { }  // ❌ shape.dart 외부에서 불가

double area(Shape shape) => switch (shape) {
  Circle(:final radius)        => 3.14159 * radius * radius,
  Rectangle(:final w, :final h) => w * h,
  Triangle(:final a, :final b, :final c) {
    // Heron's formula
    final s = (a + b + c) / 2;
    return (s * (s - a) * (s - b) * (s - c));
  } => 0,  // 단순화 (실제로는 sqrt 필요)
};

void main() {
  List<Shape> shapes = [
    Circle(5),
    Rectangle(4, 6),
    Triangle(3, 4, 5),
  ];

  for (var shape in shapes) {
    print('${shape.runtimeType}: ${area(shape).toStringAsFixed(2)}');
  }
}
```

---

### 3.2 Sealed Class의 제약 조건

```
sealed class는:
  ✅ 같은 파일(라이브러리) 안에서만 하위 타입 정의 허용
  ✅ abstract처럼 직접 인스턴스 생성 불가
  ✅ switch의 exhaustiveness check 활성화
  ✅ extends, implements, mixin으로 사용 가능
  ❌ 다른 파일에서 subclass/subtype 정의 불가
  ❌ mixin으로 사용 불가 (sealed class 자체가)
```

```dart
// sealed class의 하위 타입은 다양한 형태 가능
sealed class Event {}

// class로 확장
class ClickEvent extends Event {
  final int x, y;
  ClickEvent(this.x, this.y);
}

// record로 확장 (Dart 3.0+)
// record는 sealed 하위 타입 불가 → class 사용

// enum으로 확장
enum SystemEvent implements Event { pause, resume, stop }

// mixin으로 확장 불가 — class 래퍼 필요

// 중첩 sealed
sealed class NetworkEvent extends Event {}
class ConnectedEvent    extends NetworkEvent {}
class DisconnectedEvent extends NetworkEvent {}
class ErrorEvent        extends NetworkEvent { final String msg; ErrorEvent(this.msg); }
```

---

### 3.3 Sealed Class vs abstract class vs Enum

![diagram](/developer-open-book/diagrams/step18-sealed-comparison.svg)

**선택 기준**

```
유한한 상수 집합 (요일, HTTP 메서드, 방향)
  → enum

각 케이스가 서로 다른 필드/구조를 가짐 (성공엔 데이터, 실패엔 오류)
  → sealed class

하위 타입을 외부에서 추가할 수 있어야 함
  → abstract class (extensible hierarchy)
```

---

## 4. 패턴 매칭 심화

Dart 3.0에서 도입된 패턴 매칭은 `switch`를 훨씬 강력하게 만듭니다.

### 4.1 `switch` 표현식과 Exhaustiveness Check

```dart
sealed class Direction { const Direction(); }
class North extends Direction { const North(); }
class South extends Direction { const South(); }
class East  extends Direction { const East();  }
class West  extends Direction { const West();  }

// switch 표현식 — 값을 반환 (표현식)
String describe(Direction d) => switch (d) {
  North() => '북쪽',
  South() => '남쪽',
  East()  => '동쪽',
  West()  => '서쪽',
};

// switch 문 — 실행 (문장)
void move(Direction d) {
  switch (d) {
    case North():
      print('↑ 북쪽으로 이동');
    case South():
      print('↓ 남쪽으로 이동');
    case East():
      print('→ 동쪽으로 이동');
    case West():
      print('← 서쪽으로 이동');
  }
}

void main() {
  print(describe(const North()));  // 북쪽
  move(const East());              // → 동쪽으로 이동
}
```

**Exhaustiveness Check — 새 하위 타입 추가 시**

```dart
// 새 하위 타입 추가
class Northeast extends Direction { const Northeast(); }

// 기존 switch — 즉시 컴파일 오류
// String describe(Direction d) => switch (d) {
//   North() => '북쪽',
//   South() => '남쪽',
//   East()  => '동쪽',
//   West()  => '서쪽',
//   // Northeast 누락 → ❌ 컴파일 오류
// };
// → 모든 switch를 업데이트해야 함을 즉시 알 수 있음
```

---

### 4.2 타입 패턴 (Type Pattern)

```dart
void main() {
  Object value = 42;

  // 타입 패턴 — is와 타입 승격을 동시에
  switch (value) {
    case int n when n > 0:
      print('양의 정수: $n');      // 42
    case int n:
      print('정수: $n');
    case String s when s.isNotEmpty:
      print('비어 있지 않은 문자열: $s');
    case String s:
      print('빈 문자열');
    case double d:
      print('실수: $d');
    default:
      print('알 수 없는 타입: ${value.runtimeType}');
  }

  // switch 표현식에서 타입 패턴
  String classify(Object obj) => switch (obj) {
    int n when n < 0    => '음의 정수: $n',
    int n when n == 0   => '0',
    int n               => '양의 정수: $n',
    String s            => '문자열: "$s"',
    List<dynamic> list  => '리스트 (${list.length}개)',
    _                   => '기타: ${obj.runtimeType}',
  };

  print(classify(-5));           // 음의 정수: -5
  print(classify(0));            // 0
  print(classify(42));           // 양의 정수: 42
  print(classify('hello'));      // 문자열: "hello"
  print(classify([1, 2, 3]));    // 리스트 (3개)
}
```

---

### 4.3 구조 분해 (Destructuring)

구조 분해는 패턴 내에서 객체의 필드를 직접 추출합니다.

```dart
sealed class Notification {}

class PushNotification extends Notification {
  final String title;
  final String body;
  final String? imageUrl;
  PushNotification(this.title, this.body, {this.imageUrl});
}

class EmailNotification extends Notification {
  final String from;
  final String subject;
  final int attachments;
  EmailNotification(this.from, this.subject, this.attachments);
}

class SmsNotification extends Notification {
  final String phone;
  final String message;
  SmsNotification(this.phone, this.message);
}

void handleNotification(Notification n) {
  switch (n) {
    // :필드명 — getter 이름으로 구조 분해
    case PushNotification(:final title, :final body, imageUrl: null):
      print('[PUSH] $title: $body (이미지 없음)');

    case PushNotification(:final title, :final body, :final imageUrl):
      print('[PUSH] $title: $body (이미지: $imageUrl)');

    case EmailNotification(:final from, :final subject, attachments: 0):
      print('[EMAIL] $from → "$subject" (첨부 없음)');

    case EmailNotification(:final from, :final subject, :final attachments):
      print('[EMAIL] $from → "$subject" ($attachments개 첨부)');

    case SmsNotification(:final phone, :final message):
      print('[SMS] $phone: $message');
  }
}

void main() {
  handleNotification(PushNotification('새 메시지', '안녕하세요'));
  // [PUSH] 새 메시지: 안녕하세요 (이미지 없음)

  handleNotification(PushNotification('이벤트', '지금 확인하세요',
      imageUrl: 'https://img.dart.dev/banner.png'));
  // [PUSH] 이벤트: 지금 확인하세요 (이미지: https://img.dart.dev/banner.png)

  handleNotification(EmailNotification('boss@dart.dev', '주간 보고', 3));
  // [EMAIL] boss@dart.dev → "주간 보고" (3개 첨부)

  handleNotification(SmsNotification('010-1234-5678', '인증번호: 9876'));
  // [SMS] 010-1234-5678: 인증번호: 9876
}
```

**다양한 구조 분해 문법**

```dart
void main() {
  // List 구조 분해
  var [first, second, ...rest] = [1, 2, 3, 4, 5];
  print('$first, $second, $rest');  // 1, 2, [3, 4, 5]

  // Map 구조 분해
  var {'name': name, 'age': age} = {'name': '홍길동', 'age': 30};
  print('$name ($age)');  // 홍길동 (30)

  // Record 구조 분해
  var (x, y) = (10, 20);
  print('x=$x, y=$y');  // x=10, y=20

  // switch에서 List 구조 분해
  String describeList(List<int> list) => switch (list) {
    []                   => '빈 리스트',
    [var only]           => '단일 요소: $only',
    [var a, var b]       => '두 요소: $a, $b',
    [var h, ...var tail] => '${list.length}개 (첫: $h, 나머지: $tail)',
  };

  print(describeList([]));           // 빈 리스트
  print(describeList([42]));         // 단일 요소: 42
  print(describeList([1, 2]));       // 두 요소: 1, 2
  print(describeList([1, 2, 3, 4])); // 4개 (첫: 1, 나머지: [2, 3, 4])

  // switch에서 Map 구조 분해
  void processConfig(Map<String, dynamic> config) {
    switch (config) {
      case {'type': 'db', 'host': String host, 'port': int port}:
        print('DB 연결: $host:$port');
      case {'type': 'cache', 'ttl': int ttl}:
        print('캐시 설정: TTL $ttl초');
      default:
        print('알 수 없는 설정');
    }
  }

  processConfig({'type': 'db', 'host': 'localhost', 'port': 5432});
  // DB 연결: localhost:5432

  processConfig({'type': 'cache', 'ttl': 300});
  // 캐시 설정: TTL 300초
}
```

---

### 4.4 Guard Clause — `when`

`when`은 패턴이 일치한 후 **추가 조건을 검사**합니다.

```dart
sealed class Shape {}
class Circle    extends Shape { final double radius; Circle(this.radius); }
class Rectangle extends Shape {
  final double width, height;
  Rectangle(this.width, this.height);
}

String classify(Shape shape) => switch (shape) {
  // 타입 매칭 + 구조 분해 + guard
  Circle(:final radius) when radius > 100  => '대형 원 (r=$radius)',
  Circle(:final radius) when radius > 10   => '중형 원 (r=$radius)',
  Circle(:final radius)                    => '소형 원 (r=$radius)',

  Rectangle(:final width, :final height) when width == height
                                           => '정사각형 (${width}x$height)',
  Rectangle(:final width, :final height) when width > height
                                           => '가로 직사각형 (${width}x$height)',
  Rectangle(:final width, :final height)  => '세로 직사각형 (${width}x$height)',
};

void main() {
  print(classify(Circle(5)));       // 소형 원 (r=5.0)
  print(classify(Circle(50)));      // 중형 원 (r=50.0)
  print(classify(Circle(200)));     // 대형 원 (r=200.0)

  print(classify(Rectangle(5, 5)));   // 정사각형 (5.0x5.0)
  print(classify(Rectangle(10, 4)));  // 가로 직사각형 (10.0x4.0)
  print(classify(Rectangle(3, 8)));   // 세로 직사각형 (3.0x8.0)
}
```

**`when`과 변수 바인딩**

```dart
sealed class Auth {}
class Authenticated extends Auth {
  final String userId;
  final List<String> roles;
  Authenticated(this.userId, this.roles);
}
class Guest extends Auth {}
class Banned extends Auth {
  final String reason;
  Banned(this.reason);
}

String getPermission(Auth auth, String action) => switch (auth) {
  // roles에 'admin'이 포함된 인증 사용자
  Authenticated(:final userId, :final roles) when roles.contains('admin')
    => '$userId (관리자): $action 허용',

  // 일반 인증 사용자, 쓰기 액션 시도
  Authenticated(:final userId) when action == 'write'
    => '$userId: $action 거부 (권한 부족)',

  Authenticated(:final userId)
    => '$userId: $action 허용',

  Guest() when action == 'read'
    => '게스트: 읽기 허용',

  Guest()
    => '게스트: $action 거부',

  Banned(:final reason)
    => '차단된 사용자 ($reason): 모든 액션 거부',
};

void main() {
  var admin   = Authenticated('u001', ['admin', 'user']);
  var user    = Authenticated('u002', ['user']);
  var guest   = Guest();
  var banned  = Banned('규칙 위반');

  print(getPermission(admin,  'delete'));  // u001 (관리자): delete 허용
  print(getPermission(user,   'write'));   // u002: write 거부 (권한 부족)
  print(getPermission(user,   'read'));    // u002: read 허용
  print(getPermission(guest,  'read'));    // 게스트: 읽기 허용
  print(getPermission(guest,  'write'));   // 게스트: write 거부
  print(getPermission(banned, 'read'));    // 차단된 사용자 (규칙 위반): 모든 액션 거부
}
```

---

### 4.5 OR 패턴 (`|`)

여러 패턴 중 하나와 일치하면 처리합니다.

```dart
sealed class HttpError {}
class BadRequest        extends HttpError {}
class Unauthorized      extends HttpError {}
class Forbidden         extends HttpError {}
class NotFound          extends HttpError {}
class InternalError     extends HttpError {}
class ServiceUnavailable extends HttpError {}

String handleError(HttpError error) => switch (error) {
  // 클라이언트 오류 묶음
  BadRequest() | Unauthorized() | Forbidden() | NotFound()
    => '클라이언트 오류: ${error.runtimeType}',

  // 서버 오류 묶음
  InternalError() | ServiceUnavailable()
    => '서버 오류: ${error.runtimeType}',
};

// 기본 타입 OR 패턴
String describeNumber(int n) => switch (n) {
  0                     => '영',
  1 | 2 | 3             => '소수 (1~3)',
  4 | 6 | 8 | 10        => '짝수 (4~10)',
  5 | 7 | 9             => '홀수 (5~9)',
  int n when n < 0      => '음수',
  _                     => '기타',
};

void main() {
  print(handleError(NotFound()));           // 클라이언트 오류: NotFound
  print(handleError(InternalError()));      // 서버 오류: InternalError
  print(handleError(ServiceUnavailable())); // 서버 오류: ServiceUnavailable

  print(describeNumber(2));   // 소수 (1~3)
  print(describeNumber(8));   // 짝수 (4~10)
  print(describeNumber(-1));  // 음수
}
```

---

### 4.6 Wildcard 패턴 (`_`)

`_`는 어떤 값이든 일치하지만 **바인딩하지 않습니다.**

```dart
sealed class Result<T> {}
class Ok<T>  extends Result<T> { final T value;     Ok(this.value);   }
class Err<T> extends Result<T> { final String msg;  Err(this.msg);    }

void main() {
  Result<int> result = Ok(42);

  // _ — 값 바인딩 없이 타입/패턴 매칭만
  bool isOk = switch (result) {
    Ok()  => true,
    Err() => false,
  };
  print(isOk);  // true

  // 구조 분해에서 불필요한 필드 무시
  switch (result) {
    case Ok(:final value):
      print('성공: $value');
    case Err(:final msg):
      print('실패: $msg');
  }

  // OR 패턴 + Wildcard
  Object value = 'hello';
  bool isStringOrInt = switch (value) {
    String() || int() => true,
    _                 => false,
  };
  print(isStringOrInt);  // true

  // Map 구조 분해에서 일부 필드만 추출
  var data = {'name': '홍길동', 'age': 30, 'city': '서울'};
  if (data case {'name': String name, 'age': int _}) {
    // age는 있어야 하지만 값은 사용 안 함
    print('이름: $name');
  }
}
```

---

## 5. Class Modifier 전체 정리

Dart 3.0에서 도입된 class modifier로 클래스 사용 방식을 세밀하게 제어합니다.

```
modifier 없음:  제약 없음 — 상속, 구현, 믹스인 모두 가능
abstract:       직접 인스턴스 생성 불가
sealed:         같은 파일에서만 하위 타입, abstractness 포함
final:          상속/구현 모두 불가 (같은 라이브러리 내는 허용)
base:           implements 불가, extends만 허용
interface:      extends 불가, implements만 허용
mixin:          mixin으로만 사용 가능 (extends 불가)
mixin class:    mixin으로도, class로도 사용 가능
```

### 5.1 `final class`

```dart
// final class — 외부 라이브러리에서 상속/구현 불가
final class ImmutablePoint {
  final double x, y;
  const ImmutablePoint(this.x, this.y);

  double distanceTo(ImmutablePoint other) {
    final dx = x - other.x;
    final dy = y - other.y;
    return (dx * dx + dy * dy);  // 단순화
  }

  ImmutablePoint translate(double dx, double dy) =>
      ImmutablePoint(x + dx, y + dy);
}

// 같은 라이브러리에서는 상속 가능
class Point3D extends ImmutablePoint {
  final double z;
  const Point3D(super.x, super.y, this.z);
}

// 외부 라이브러리에서:
// class MyPoint extends ImmutablePoint { }     // ❌
// class MyPoint implements ImmutablePoint { }  // ❌
```

---

### 5.2 `base class`

```dart
// base class — extends만 허용, implements 불가
base class Animal {
  final String name;
  Animal(this.name);

  void breathe() => print('$name: 호흡 중');
}

// 상속은 허용
class Dog extends Animal {
  Dog(super.name);
  void bark() => print('$name: 왈왈');
}

// 구현은 불가
// class Robot implements Animal { }  // ❌
// → Animal의 구현 세부사항을 숨기고 확장만 허용
```

---

### 5.3 `interface class`

```dart
// interface class — implements만 허용, extends 불가
interface class Drawable {
  void draw() => print('기본 그리기');
  double get area => 0;
}

// 구현은 허용
class Canvas implements Drawable {
  @override
  void draw() => print('Canvas 그리기');
  @override
  double get area => 100.0;
}

// 상속은 불가
// class Shape extends Drawable { }  // ❌
// → 구현 재사용 없이 API 계약만 강제
```

---

## 6. Sealed Class 실용 패턴

### 6.1 UI 상태 모델링

Flutter/Dart 앱에서 가장 흔한 Sealed Class 활용 패턴입니다.

```dart
// 화면 상태를 Sealed Class로 모델링
sealed class ScreenState<T> {}

class Initial<T>    extends ScreenState<T> {}
class Loading<T>    extends ScreenState<T> {}
class Success<T>    extends ScreenState<T> {
  final T data;
  const Success(this.data);
}
class Failure<T>    extends ScreenState<T> {
  final String message;
  final bool canRetry;
  const Failure(this.message, {this.canRetry = true});
}
class Empty<T>      extends ScreenState<T> {}

// UI 렌더링 로직 (Flutter의 build() 개념)
String renderUserScreen(ScreenState<List<String>> state) => switch (state) {
  Initial()             => '초기 화면',
  Loading()             => '로딩 스피너 표시',
  Empty()               => '사용자가 없습니다',
  Success(:final data)  => '사용자 목록: ${data.join(", ")}',
  Failure(:final message, canRetry: true)
                        => '오류: $message [재시도 버튼]',
  Failure(:final message, canRetry: false)
                        => '오류: $message',
};

// ViewModel — 상태 전환 관리
class UserViewModel {
  ScreenState<List<String>> _state = Initial();

  ScreenState<List<String>> get state => _state;

  Future<void> loadUsers() async {
    _state = Loading();
    print('상태: ${renderUserScreen(_state)}');

    try {
      await Future.delayed(Duration(milliseconds: 500));

      // 시뮬레이션: 랜덤 성공/실패
      final users = ['홍길동', '김철수', '이영희'];
      _state = users.isEmpty ? Empty() : Success(users);
    } catch (e) {
      _state = Failure('데이터 로드 실패', canRetry: true);
    }

    print('상태: ${renderUserScreen(_state)}');
  }
}

void main() async {
  final vm = UserViewModel();
  await vm.loadUsers();
  // 상태: 로딩 스피너 표시
  // 상태: 사용자 목록: 홍길동, 김철수, 이영희
}
```

---

### 6.2 도메인 이벤트

```dart
sealed class CartEvent {}

class AddItem extends CartEvent {
  final String productId;
  final int quantity;
  const AddItem(this.productId, {this.quantity = 1});
}

class RemoveItem extends CartEvent {
  final String productId;
  const RemoveItem(this.productId);
}

class UpdateQuantity extends CartEvent {
  final String productId;
  final int quantity;
  const UpdateQuantity(this.productId, this.quantity);
}

class ApplyCoupon extends CartEvent {
  final String couponCode;
  const ApplyCoupon(this.couponCode);
}

class Checkout extends CartEvent {
  final String paymentMethod;
  const Checkout(this.paymentMethod);
}

class Cart {
  final Map<String, int> _items = {};
  String? _coupon;
  double _discountRate = 0;

  // Sealed Class + switch로 이벤트 처리
  void dispatch(CartEvent event) {
    switch (event) {
      case AddItem(:final productId, :final quantity):
        _items[productId] = (_items[productId] ?? 0) + quantity;
        print('추가: $productId x$quantity (총: ${_items[productId]})');

      case RemoveItem(:final productId):
        _items.remove(productId);
        print('제거: $productId');

      case UpdateQuantity(:final productId, quantity: 0):
        _items.remove(productId);
        print('수량 0 → 제거: $productId');

      case UpdateQuantity(:final productId, :final quantity):
        _items[productId] = quantity;
        print('수량 변경: $productId → $quantity');

      case ApplyCoupon(:final couponCode) when couponCode == 'DART10':
        _coupon = couponCode;
        _discountRate = 0.1;
        print('쿠폰 적용: $couponCode (10% 할인)');

      case ApplyCoupon(:final couponCode):
        print('유효하지 않은 쿠폰: $couponCode');

      case Checkout(:final paymentMethod):
        final itemCount = _items.values.fold(0, (a, b) => a + b);
        print('결제 완료: $itemCount개 아이템, $paymentMethod'
            '${_coupon != null ? " (쿠폰: $_coupon)" : ""}');
        _items.clear();
    }
  }
}

void main() {
  final cart = Cart();

  cart.dispatch(const AddItem('노트북'));
  cart.dispatch(const AddItem('마우스', quantity: 2));
  cart.dispatch(const UpdateQuantity('마우스', 1));
  cart.dispatch(const ApplyCoupon('DART10'));
  cart.dispatch(const ApplyCoupon('INVALID'));
  cart.dispatch(const Checkout('카카오페이'));

  // 추가: 노트북 x1 (총: 1)
  // 추가: 마우스 x2 (총: 2)
  // 수량 변경: 마우스 → 1
  // 쿠폰 적용: DART10 (10% 할인)
  // 유효하지 않은 쿠폰: INVALID
  // 결제 완료: 2개 아이템, 카카오페이 (쿠폰: DART10)
}
```

---

### 6.3 네트워크 응답

```dart
sealed class ApiResult<T> {}

class ApiSuccess<T> extends ApiResult<T> {
  final T data;
  final int statusCode;
  const ApiSuccess(this.data, {this.statusCode = 200});
}

class ApiError<T> extends ApiResult<T> {
  final String message;
  final int statusCode;
  final bool isRetryable;

  const ApiError(this.message, {
    required this.statusCode,
    this.isRetryable = false,
  });

  bool get isClientError => statusCode >= 400 && statusCode < 500;
  bool get isServerError => statusCode >= 500;
}

class ApiLoading<T> extends ApiResult<T> {}

class ApiNetworkError<T> extends ApiResult<T> {
  final String reason;
  const ApiNetworkError(this.reason);
}

// 응답 처리 함수
void handleApiResult<T>(ApiResult<T> result, {
  required void Function(T) onSuccess,
  required void Function(String, bool) onError,
  void Function()? onLoading,
}) {
  switch (result) {
    case ApiSuccess(:final data):
      onSuccess(data);

    case ApiError(:final message, isRetryable: true, :final statusCode)
        when statusCode == 401:
      // 인증 오류 + 재시도 가능 → 토큰 갱신 로직
      print('[AUTH] 토큰 갱신 시도 후 재시도');
      onError(message, true);

    case ApiError(:final message, :final isRetryable):
      onError(message, isRetryable);

    case ApiNetworkError(:final reason):
      onError('네트워크 오류: $reason', true);

    case ApiLoading():
      onLoading?.call();
  }
}

void main() {
  handleApiResult<String>(
    ApiSuccess('{"user": "홍길동"}'),
    onSuccess: (data) => print('성공: $data'),
    onError:   (msg, retry) => print('오류: $msg (재시도: $retry)'),
    onLoading: () => print('로딩 중...'),
  );
  // 성공: {"user": "홍길동"}

  handleApiResult<String>(
    ApiError('Unauthorized', statusCode: 401, isRetryable: true),
    onSuccess: (data) => print('성공: $data'),
    onError:   (msg, retry) => print('오류: $msg (재시도: $retry)'),
  );
  // [AUTH] 토큰 갱신 시도 후 재시도
  // 오류: Unauthorized (재시도: true)

  handleApiResult<String>(
    ApiNetworkError('연결 시간 초과'),
    onSuccess: (data) => print('성공: $data'),
    onError:   (msg, retry) => print('오류: $msg (재시도: $retry)'),
  );
  // 오류: 네트워크 오류: 연결 시간 초과 (재시도: true)
}
```

---

### 6.4 Sealed Class + Result 타입 조합

```dart
// Step 16의 Result를 Sealed Class로 완성
sealed class Result<T, E extends Exception> {}

class Ok<T, E extends Exception> extends Result<T, E> {
  final T value;
  const Ok(this.value);

  @override String toString() => 'Ok($value)';
}

class Err<T, E extends Exception> extends Result<T, E> {
  final E error;
  const Err(this.error);

  @override String toString() => 'Err($error)';
}

// 파이프라인 메서드
extension ResultPipeline<T, E extends Exception> on Result<T, E> {
  Result<R, E> map<R>(R Function(T) transform) => switch (this) {
    Ok(:final value) => Ok(transform(value)),
    Err(:final error) => Err(error),
  };

  Result<R, E> flatMap<R>(Result<R, E> Function(T) transform) =>
      switch (this) {
        Ok(:final value) => transform(value),
        Err(:final error) => Err(error),
      };

  T getOrElse(T defaultValue) => switch (this) {
    Ok(:final value) => value,
    Err()            => defaultValue,
  };

  void fold({
    required void Function(T) onOk,
    required void Function(E) onErr,
  }) {
    switch (this) {
      case Ok(:final value):  onOk(value);
      case Err(:final error): onErr(error);
    }
  }
}

// 활용 — 타입 안전한 파이프라인
class ParseException implements Exception {
  final String input;
  ParseException(this.input);
  @override String toString() => 'ParseException: "$input"은 숫자가 아닙니다';
}

class DomainException implements Exception {
  final String message;
  DomainException(this.message);
  @override String toString() => 'DomainException: $message';
}

Result<int, ParseException> parseInt(String s) {
  final n = int.tryParse(s);
  return n != null ? Ok(n) : Err(ParseException(s));
}

Result<double, DomainException> safeDivide(int a, int b) =>
    b == 0 ? Err(DomainException('0으로 나눌 수 없음')) : Ok(a / b);

void main() {
  // 파이프라인
  parseInt('42')
      .map((n) => n * 2)
      .fold(
        onOk:  (v) => print('결과: $v'),   // 결과: 84
        onErr: (e) => print('오류: $e'),
      );

  parseInt('abc')
      .map((n) => n * 2)
      .fold(
        onOk:  (v) => print('결과: $v'),
        onErr: (e) => print('오류: $e'),   // 오류: ParseException: "abc"은 숫자가 아닙니다
      );
}
```

---

## 7. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 7-1: Exhaustiveness Check 체험

아래 코드에서 컴파일 오류가 발생하는 이유를 설명하고, 두 가지 방법으로 수정하세요.

```dart
sealed class Animal {}
class Dog  extends Animal { final String name; Dog(this.name); }
class Cat  extends Animal { final String name; Cat(this.name); }
class Bird extends Animal { final String name; Bird(this.name); }

String makeSound(Animal a) => switch (a) {
  Dog(:final name)  => '$name: 왈왈',
  Cat(:final name)  => '$name: 야옹',
  // Bird 누락
};
```

> **정답 힌트**
>
> 오류 이유: `sealed class Animal`의 하위 타입 `Bird`가 switch에서 처리되지 않아 exhaustiveness check 실패.
>
> ```dart
> // 방법 1: Bird 케이스 추가
> String makeSound(Animal a) => switch (a) {
>   Dog(:final name)  => '$name: 왈왈',
>   Cat(:final name)  => '$name: 야옹',
>   Bird(:final name) => '$name: 짹짹',
> };
>
> // 방법 2: wildcard로 처리 (단, 새 하위 타입 추가 시 감지 불가)
> String makeSound(Animal a) => switch (a) {
>   Dog(:final name)  => '$name: 왈왈',
>   Cat(:final name)  => '$name: 야옹',
>   _                 => '(소리 없음)',
> };
> ```

### 실습 7-2: 게임 캐릭터 Sealed Class

아래 요구사항으로 게임 캐릭터 시스템을 Sealed Class로 설계하세요.

**요구사항**

- `Character` sealed class
- `Warrior(String name, int strength, int armor)` — 전사
- `Mage(String name, int spell, int mana)` — 마법사
- `Archer(String name, int agility, int arrows)` — 궁수
- `attack(Character)` 함수: 각 캐릭터 유형에 맞는 공격 설명 반환
  - Warrior: `"[이름] 검 공격 (강도: [strength]×[armor÷10])"`
  - Mage: `"[이름] [spell]레벨 마법 (마나: [mana] 소모)"`
  - Archer: `"[이름] 화살 [arrows]발 발사 (민첩: [agility])"` (arrows 0이면 `"화살 없음"`)
- `maxHp(Character)` 함수: 클래스별 HP 계산 (Warrior: strength×10, Mage: mana×5, Archer: agility×8)

```dart
sealed class Character {}
// TODO: 구현

String attack(Character c) => switch (c) {
  // TODO
};

int maxHp(Character c) => switch (c) {
  // TODO
};

void main() {
  var party = [
    Warrior('홍길동', strength: 15, armor: 30),
    Mage('마법사', spell: 7, mana: 120),
    Archer('활잡이', agility: 20, arrows: 0),
  ];

  for (var c in party) {
    print(attack(c));
    print('  HP: ${maxHp(c)}');
  }
}
```

> **정답 힌트**
>
> ```dart
> sealed class Character {}
>
> class Warrior extends Character {
>   final String name;
>   final int strength, armor;
>   Warrior(this.name, {required this.strength, required this.armor});
> }
>
> class Mage extends Character {
>   final String name;
>   final int spell, mana;
>   Mage(this.name, {required this.spell, required this.mana});
> }
>
> class Archer extends Character {
>   final String name;
>   final int agility, arrows;
>   Archer(this.name, {required this.agility, required this.arrows});
> }
>
> String attack(Character c) => switch (c) {
>   Warrior(:final name, :final strength, :final armor)
>     => '[$name] 검 공격 (강도: ${strength}×${armor ~/ 10})',
>   Mage(:final name, :final spell, :final mana)
>     => '[$name] ${spell}레벨 마법 (마나: $mana 소모)',
>   Archer(:final name, :final agility, arrows: 0)
>     => '[$name] 화살 없음',
>   Archer(:final name, :final agility, :final arrows)
>     => '[$name] 화살 ${arrows}발 발사 (민첩: $agility)',
> };
>
> int maxHp(Character c) => switch (c) {
>   Warrior(:final strength) => strength * 10,
>   Mage(:final mana)        => mana * 5,
>   Archer(:final agility)   => agility * 8,
> };
> ```

### 실습 7-3: UI 상태 파이프라인

아래 `AsyncData<T>` sealed class를 완성하고 변환 메서드를 구현하세요.

**요구사항**

- `AsyncData<T>` sealed class: `Idle`, `Loading`, `Data<T>`, `Error` 4가지 상태
- `map<R>(R Function(T))` — Data 상태면 변환, 나머지는 그대로
- `dataOrNull` getter — Data면 값 반환, 아니면 null
- `isLoading` getter
- 아래 시나리오를 순서대로 실행하고 상태를 출력

```dart
void main() async {
  var state = AsyncData<List<String>>.idle();

  // idle → loading → data → map 변환
  state = AsyncData.loading();
  print(state.isLoading);      // true
  print(state.dataOrNull);     // null

  await Future.delayed(Duration(milliseconds: 100));
  state = AsyncData.data(['Dart', 'Flutter', 'Kotlin']);
  print(state.dataOrNull);     // [Dart, Flutter, Kotlin]

  var lengths = state.map((list) => list.map((s) => s.length).toList());
  print(lengths.dataOrNull);   // [4, 7, 6]
}
```

> **정답 힌트**
>
> ```dart
> sealed class AsyncData<T> {
>   const AsyncData();
>   factory AsyncData.idle()          = Idle<T>;
>   factory AsyncData.loading()       = Loading<T>;
>   factory AsyncData.data(T value)   = Data<T>;
>   factory AsyncData.error(String m) = Error<T>;
>
>   bool get isLoading => this is Loading<T>;
>   T? get dataOrNull  => this is Data<T> ? (this as Data<T>).value : null;
>
>   AsyncData<R> map<R>(R Function(T) transform) => switch (this) {
>     Data(:final value) => Data(transform(value)),
>     Idle()    => Idle<R>(),
>     Loading() => Loading<R>(),
>     Error(:final message) => Error<R>(message),
>   };
> }
>
> class Idle<T>    extends AsyncData<T> { const Idle(); }
> class Loading<T> extends AsyncData<T> { const Loading(); }
> class Data<T>    extends AsyncData<T> {
>   final T value; const Data(this.value);
> }
> class Error<T>   extends AsyncData<T> {
>   final String message; const Error(this.message);
> }
> ```

---

## 8. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                 | 핵심 내용                                            |
| -------------------- | ---------------------------------------------------- |
| `sealed class`       | 같은 파일에서만 하위 타입, exhaustiveness 활성화     |
| Exhaustiveness check | 모든 하위 타입 처리 강제 — 새 타입 추가 시 즉시 감지 |
| 타입 패턴            | `case TypeName(:field)` — 타입 매칭 + 구조 분해 동시 |
| `:필드명` 구조 분해  | getter 이름으로 값 추출, 타입 승격 자동              |
| `when` guard         | 패턴 매칭 후 추가 조건 검사                          |
| OR 패턴 `\|`         | 여러 패턴 묶음 처리                                  |
| `_` wildcard         | 매칭하되 바인딩하지 않음                             |
| List 구조 분해       | `[first, ...rest]` — 헤드/테일 추출                  |
| Map 구조 분해        | `{'key': value}` — 키로 값 추출                      |
| `final class`        | 외부에서 상속/구현 불가                              |
| `base class`         | extends만 허용, implements 불가                      |
| `interface class`    | implements만 허용, extends 불가                      |
| UI 상태 패턴         | `ScreenState<T>` sealed — 로딩/성공/실패 모델링      |
| 도메인 이벤트 패턴   | `CartEvent` sealed — 이벤트 소싱 스타일              |

### Phase 4 완료 체크리스트

- [ ] Step 16: 제네릭 클래스/메서드를 설계하고 타입 제약을 활용할 수 있다
- [ ] Step 17: 기본 타입과 도메인 타입에 Extension을 작성할 수 있다
- [ ] Step 18: Sealed Class로 닫힌 타입 계층을 설계하고 패턴 매칭으로 처리할 수 있다

### 🔗 다음 단계

> **Phase 5 — Step 19: Records와 구조적 타입**으로 이동하세요.

Step 19에서는 Dart 3.0의 `Record` 타입을 학습합니다. 익명 구조체처럼 여러 값을 타입 안전하게 묶어 반환하는 방법, 패턴 매칭과의 조합, Named/Positional Record의 차이, 그리고 Tuple 대용으로 사용하는 방법을 다룹니다. Sealed Class의 구조 분해와 자연스럽게 연결됩니다.

### 📚 참고 자료

| 자료                | 링크                                                  |
| ------------------- | ----------------------------------------------------- |
| Dart Sealed Class   | <https://dart.dev/language/class-modifiers#sealed>      |
| 패턴 매칭 공식 문서 | <https://dart.dev/language/patterns>                    |
| 구조 분해           | <https://dart.dev/language/patterns#destructuring>      |
| Class Modifiers     | <https://dart.dev/language/class-modifiers>             |
| Switch 표현식       | <https://dart.dev/language/branches#switch-expressions> |
| DartPad 온라인 실습 | <https://dartpad.dev>                                   |

### ❓ 자가진단 퀴즈

1. **[Remember]** `sealed class`를 선언한 파일 외부에서 하위 타입을 추가하려 할 때 발생하는 결과와 이유를 설명하라.
2. **[Remember]** `when` guard가 `false`를 반환할 때 해당 케이스는 어떻게 처리되는가?
3. **[Understand]** OR 패턴(`|`)에서 구조 분해 변수를 사용하려면 어떤 조건이 필요한지 설명하라.
4. **[Understand]** `abstract class` + `switch` + `default`와 `sealed class` + `switch` (default 없음)의 안전성 차이를 새 하위 타입을 추가하는 시나리오로 비교하라.
5. **[Apply]** 아래 `Payment` sealed class에 `summary` getter Extension을 추가하라.

   ```dart
   sealed class Payment {}
   class Cash    extends Payment { final double amount; Cash(this.amount); }
   class Card    extends Payment { final String last4; final double amount; Card(this.last4, this.amount); }
   class Crypto  extends Payment { final String coin; final double units; Crypto(this.coin, this.units); }
   ```

6. **[Evaluate]** 쇼핑몰 주문 상태를 Sealed Class, Enum, abstract class 세 가지로 각각 구현했을 때의 장단점을 (a) 새 상태 추가 용이성, (b) 상태별 데이터 표현, (c) exhaustiveness 보장, (d) 외부 라이브러리 확장 가능성 네 가지 기준으로 평가하라.

> **3번 정답 힌트**
>
> OR 패턴 각 브랜치에서 바인딩하는 변수 이름과 타입이 **동일**해야 합니다. 예: `Dog(:final name) | Cat(:final name)`은 `name`이 양쪽에 있으므로 허용. `Dog(:final name) | Cat(:final age)`는 변수 이름이 달라 불가.

> **6번 정답 힌트**
>
> (a) 새 상태 추가: Sealed·abstract는 새 클래스만 추가. Enum은 값 하나 추가하면 모든 switch 영향. (b) 상태별 데이터: Sealed·abstract는 각 클래스에 자유롭게 필드 추가. Enum은 제한적. (c) Exhaustiveness: Sealed와 Enum은 컴파일 타임 보장. abstract는 default 필요. (d) 외부 확장: abstract만 외부 파일에서 새 하위 타입 추가 허용. Sealed·Enum은 불가.

---

> ⬅️ [Step 17 — Extension 메서드](#) | ➡️ [Step 19 — Records와 구조적 타입 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Sealed Classes, Patterns, Class Modifiers) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
