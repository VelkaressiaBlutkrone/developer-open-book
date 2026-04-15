# Step 12 — 열거형 (Enum)

> **Phase 3 | 고급 Dart** | 예상 소요: 1일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 12 — 열거형 (Enum)](#step-12--열거형-enum)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [유한한 상태를 코드로 표현하기](#유한한-상태를-코드로-표현하기)
  - [3. 기본 Enum](#3-기본-enum)
    - [3.1 선언과 사용](#31-선언과-사용)
    - [3.2 내장 프로퍼티와 메서드](#32-내장-프로퍼티와-메서드)
    - [3.3 switch와 패턴 매칭](#33-switch와-패턴-매칭)
  - [4. 향상된 Enum (Dart 2.17+)](#4-향상된-enum-dart-217)
    - [4.1 필드와 생성자](#41-필드와-생성자)
    - [4.2 메서드와 getter](#42-메서드와-getter)
    - [4.3 `implements`와 `with`](#43-implements와-with)
  - [5. Enum과 Null Safety](#5-enum과-null-safety)
  - [6. Enum 실용 패턴](#6-enum-실용-패턴)
    - [6.1 상태 머신 패턴](#61-상태-머신-패턴)
    - [6.2 설정값/코드 매핑](#62-설정값코드-매핑)
    - [6.3 JSON 직렬화/역직렬화](#63-json-직렬화역직렬화)
    - [6.4 권한/역할 관리](#64-권한역할-관리)
  - [7. Enum vs 상수 클래스 비교](#7-enum-vs-상수-클래스-비교)
  - [8. 실습](#8-실습)
    - [실습 8-1: Exhaustiveness Check 체험](#실습-8-1-exhaustiveness-check-체험)
    - [실습 8-2: 향상된 Enum 설계](#실습-8-2-향상된-enum-설계)
    - [실습 8-3: 상태 머신 구현](#실습-8-3-상태-머신-구현)
  - [9. 핵심 요약 및 다음 단계](#9-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                      |
| --- | ------------- | ----------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | Enum의 내장 프로퍼티(`name`, `index`, `values`)를 나열할 수 있다                          |
| 2   | 🟢 Understand | 향상된 Enum이 기본 Enum보다 강력한 이유를 필드·메서드 측면에서 설명할 수 있다             |
| 3   | 🟢 Understand | `switch` + Enum 조합에서 `exhaustiveness check`가 안전성을 보장하는 방식을 설명할 수 있다 |
| 4   | 🟡 Apply      | 도메인 상태를 향상된 Enum으로 모델링하고 관련 로직을 Enum 내부에 캡슐화할 수 있다         |
| 5   | 🟡 Apply      | Enum을 활용해 JSON 직렬화/역직렬화와 상태 머신을 구현할 수 있다                           |
| 6   | 🟠 Analyze    | 상수 클래스(`static const`) 대신 Enum을 사용해야 하는 상황과 그 근거를 분석할 수 있다     |

---

## 2. 서론

### 유한한 상태를 코드로 표현하기

현실 세계의 많은 개념은 **유한한 상태 집합**으로 표현됩니다.

```
주문 상태:  대기중 / 처리중 / 배송중 / 완료 / 취소
요일:       월 / 화 / 수 / 목 / 금 / 토 / 일
카드 슈트:  ♠ / ♥ / ♦ / ♣
사용자 권한: 관리자 / 편집자 / 뷰어 / 게스트
```

이런 상태를 `int`나 `String` 상수로 표현하면 두 가지 문제가 생깁니다.

```dart
// ❌ int 상수 방식 — 타입 안전성 없음
const int ORDER_PENDING   = 0;
const int ORDER_COMPLETED = 3;

void process(int status) {
  if (status == 99) { }  // 존재하지 않는 값도 허용
}

// ❌ String 상수 방식 — 오타 감지 불가
const String ROLE_ADMIN = 'admin';
checkRole('adminn');  // 오타 → 런타임까지 발견 불가
```

**Enum은 이 두 문제를 모두 해결**합니다.

```
✅ 컴파일 타임 타입 안전성 — Enum 타입 외의 값 사용 불가
✅ exhaustiveness check — switch에서 모든 케이스 처리 강제
✅ IDE 자동완성 — 유효한 값만 제안
✅ Dart 2.17+ 향상된 Enum — 필드, 메서드, 인터페이스 구현 가능
```

> **전제 지식**: Step 3 완료 (switch 패턴 매칭), Step 8~11 완료 (클래스, 인터페이스, Mixin)

---

## 3. 기본 Enum

### 3.1 선언과 사용

```dart
// 선언
enum Direction { north, south, east, west }
enum Color     { red, green, blue }
enum HttpMethod { get, post, put, delete, patch }
```

```dart
void main() {
  // 사용 — 클래스명.값 형태
  Direction dir = Direction.north;
  var method = HttpMethod.post;

  print(dir);     // Direction.north
  print(method);  // HttpMethod.post

  // 타입 안전성 — 다른 타입 대입 불가
  // Direction d = 0;          // ❌ 컴파일 오류
  // Direction d = 'north';    // ❌ 컴파일 오류

  // 비교
  print(dir == Direction.north);  // true
  print(dir == Direction.south);  // false
}
```

---

### 3.2 내장 프로퍼티와 메서드

모든 Enum은 자동으로 다음 멤버를 가집니다.

```dart
enum Season { spring, summer, autumn, winter }

void main() {
  // .name — Enum 값의 이름 (String)
  print(Season.autumn.name);    // autumn

  // .index — 선언 순서 (0부터)
  print(Season.spring.index);   // 0
  print(Season.winter.index);   // 3

  // Season.values — 모든 값의 List
  print(Season.values);
  // [Season.spring, Season.summer, Season.autumn, Season.winter]

  // 인덱스로 값 접근
  Season s = Season.values[2];
  print(s);         // Season.autumn
  print(s.name);    // autumn

  // 이름으로 값 접근 — byName()
  Season found = Season.values.byName('summer');
  print(found);     // Season.summer

  // 존재하지 않는 이름 — ArgumentError
  // Season.values.byName('monsoon');  // 💥 ArgumentError

  // 안전한 이름 검색
  Season? safe = Season.values
      .where((s) => s.name == 'winter')
      .firstOrNull;
  print(safe);  // Season.winter
}
```

**`firstOrNull`** — Dart 3.0+에서 Iterable 확장으로 제공됩니다.

---

### 3.3 switch와 패턴 매칭

Enum과 `switch`의 조합은 Dart의 핵심 패턴입니다. `switch`는 **모든 Enum 값을 처리했는지 컴파일 타임에 검사(exhaustiveness check)** 합니다.

```dart
enum TrafficLight { red, yellow, green }

// 표현식 switch (Dart 3.0+) — 권장
String getAction(TrafficLight light) => switch (light) {
  TrafficLight.red    => '정지',
  TrafficLight.yellow => '주의',
  TrafficLight.green  => '출발',
};

// 문(Statement) switch
void handleLight(TrafficLight light) {
  switch (light) {
    case TrafficLight.red:
      print('빨간 불: 정지');
    case TrafficLight.yellow:
      print('노란 불: 주의');
    case TrafficLight.green:
      print('초록 불: 출발');
  }
  // default 불필요 — 모든 케이스가 처리됨
}

void main() {
  for (var light in TrafficLight.values) {
    print('${light.name}: ${getAction(light)}');
  }
  // red: 정지
  // yellow: 주의
  // green: 출발
}
```

**exhaustiveness check의 가치**

```dart
enum Status { pending, processing, done, cancelled }

String describe(Status s) => switch (s) {
  Status.pending    => '대기 중',
  Status.processing => '처리 중',
  Status.done       => '완료',
  // Status.cancelled 누락 ← ❌ 컴파일 오류
  // "The type 'Status' is not exhaustively matched"
};

// 새 값 추가 시
// enum Status { pending, processing, done, cancelled, refunded }
// → 기존 switch 구문 모두 컴파일 오류 → 누락 처리 즉시 발견
```

> 📌 이것이 Enum을 `int`/`String` 상수보다 선호하는 핵심 이유입니다.

---

## 4. 향상된 Enum (Dart 2.17+)

Dart 2.17부터 Enum은 **필드, 생성자, 메서드, 인터페이스 구현**을 가질 수 있습니다. 단순한 상수 나열을 넘어 도메인 로직을 Enum 자체에 캡슐화할 수 있습니다.

### 4.1 필드와 생성자

```dart
enum Planet {
  // 각 값 — 생성자 인수 전달
  mercury(3.303e+23, 2.4397e6),
  venus  (4.869e+24, 6.0518e6),
  earth  (5.976e+24, 6.37814e6),
  mars   (6.421e+23, 3.3972e6);

  // 필드 — 반드시 final
  final double mass;      // kg
  final double radius;    // m

  // 생성자 — 반드시 const
  const Planet(this.mass, this.radius);
}

void main() {
  const g = 6.67430e-11;

  for (var p in Planet.values) {
    double gravity = g * p.mass / (p.radius * p.radius);
    print('${p.name}: ${gravity.toStringAsFixed(2)} m/s²');
  }
  // mercury: 3.70 m/s²
  // venus: 8.87 m/s²
  // earth: 9.80 m/s²
  // mars: 3.71 m/s²
}
```

**향상된 Enum의 제약 조건**

```
✅ 필드는 final이어야 한다
✅ 생성자는 const여야 한다
✅ 생성자는 하나 이상 있어야 하며 (필드가 있는 경우)
   모든 값은 생성자를 호출해야 한다
❌ 일반(non-const) 인스턴스 필드 불가
❌ 가변(mutable) 필드 불가
```

---

### 4.2 메서드와 getter

```dart
enum HttpStatus {
  ok(200, 'OK'),
  created(201, 'Created'),
  badRequest(400, 'Bad Request'),
  unauthorized(401, 'Unauthorized'),
  notFound(404, 'Not Found'),
  internalServerError(500, 'Internal Server Error');

  final int code;
  final String message;

  const HttpStatus(this.code, this.message);

  // getter — 계산 프로퍼티
  bool get isSuccess    => code >= 200 && code < 300;
  bool get isClientError => code >= 400 && code < 500;
  bool get isServerError => code >= 500;

  // 메서드
  String toResponseLine() => 'HTTP/1.1 $code $message';

  // factory 스타일 — 코드로 찾기
  static HttpStatus? fromCode(int code) {
    for (var s in values) {
      if (s.code == code) return s;
    }
    return null;
  }

  @override
  String toString() => '$code $message';
}

void main() {
  var status = HttpStatus.ok;
  print(status);                    // 200 OK
  print(status.isSuccess);          // true
  print(status.toResponseLine());   // HTTP/1.1 200 OK

  var found = HttpStatus.fromCode(404);
  print(found);                     // 404 Not Found
  print(found?.isClientError);      // true

  // switch + 향상된 Enum
  void handleStatus(HttpStatus s) {
    switch (s) {
      case _ when s.isSuccess:
        print('성공: ${s.message}');
      case _ when s.isClientError:
        print('클라이언트 오류: ${s.message}');
      case _ when s.isServerError:
        print('서버 오류: ${s.message}');
      default:
        print('알 수 없음');
    }
  }

  handleStatus(HttpStatus.created);              // 성공: Created
  handleStatus(HttpStatus.notFound);             // 클라이언트 오류: Not Found
  handleStatus(HttpStatus.internalServerError);  // 서버 오류: Internal Server Error
}
```

---

### 4.3 `implements`와 `with`

향상된 Enum은 인터페이스를 구현하고 Mixin을 적용할 수 있습니다.

```dart
// 인터페이스 정의
abstract class Displayable {
  String get displayName;
  String get icon;
}

mixin Sortable {
  int get sortOrder;
  int compareTo(covariant Sortable other) =>
      sortOrder.compareTo(other.sortOrder);
}

// Enum에 implements + with 적용
enum Priority implements Displayable {
  low(1,    '낮음',   '🟢'),
  medium(2, '보통',   '🟡'),
  high(3,   '높음',   '🔴'),
  critical(4, '긴급', '🚨');

  final int level;

  @override
  final String displayName;

  @override
  final String icon;

  const Priority(this.level, this.displayName, this.icon);

  bool get isUrgent => level >= 3;
}

void main() {
  // Displayable 인터페이스 타입으로 참조
  Displayable d = Priority.high;
  print('${d.icon} ${d.displayName}');   // 🔴 높음

  // 정렬
  var priorities = [Priority.high, Priority.low, Priority.critical, Priority.medium];
  priorities.sort((a, b) => a.level.compareTo(b.level));
  for (var p in priorities) {
    print('${p.icon} ${p.displayName} (레벨: ${p.level})');
  }
  // 🟢 낮음 (레벨: 1)
  // 🟡 보통 (레벨: 2)
  // 🔴 높음 (레벨: 3)
  // 🚨 긴급 (레벨: 4)

  // 긴급 항목만 필터
  var urgent = Priority.values.where((p) => p.isUrgent);
  print(urgent.map((p) => p.displayName).toList());  // [높음, 긴급]
}
```

---

## 5. Enum과 Null Safety

Enum 자체는 null이 아니지만, 변수가 nullable이거나 외부 값(JSON 등)을 파싱할 때 null 처리가 필요합니다.

```dart
enum Direction { north, south, east, west }

void main() {
  // nullable Enum 변수
  Direction? current = null;
  print(current?.name ?? '방향 미설정');  // 방향 미설정

  current = Direction.north;
  print(current.name);  // north — null 체크 후 자동 승격

  // 안전한 이름 파싱 — 외부 입력 처리
  String? input = 'east';

  Direction? parsed = Direction.values
      .where((d) => d.name == input)
      .firstOrNull;

  print(parsed ?? Direction.north);  // Direction.east

  // 존재하지 않는 값
  String? bad = 'northwest';
  Direction? notFound = Direction.values
      .where((d) => d.name == bad)
      .firstOrNull;
  print(notFound);       // null — 예외 없이 안전하게 처리
  print(notFound ?? Direction.north);  // Direction.north (기본값)
}
```

---

## 6. Enum 실용 패턴

### 6.1 상태 머신 패턴

Enum으로 상태를 정의하고, 유효한 전환만 허용하는 상태 머신을 구현합니다.

```dart
enum OrderStatus {
  pending,
  confirmed,
  shipped,
  delivered,
  cancelled;

  // 이 상태에서 전환 가능한 다음 상태들
  List<OrderStatus> get allowedTransitions => switch (this) {
    pending   => [confirmed, cancelled],
    confirmed => [shipped, cancelled],
    shipped   => [delivered],
    delivered => [],        // 종료 상태
    cancelled => [],        // 종료 상태
  };

  bool canTransitionTo(OrderStatus next) =>
      allowedTransitions.contains(next);

  bool get isTerminal => allowedTransitions.isEmpty;

  String get label => switch (this) {
    pending   => '주문 대기',
    confirmed => '주문 확인',
    shipped   => '배송 중',
    delivered => '배송 완료',
    cancelled => '주문 취소',
  };
}

class Order {
  final String id;
  OrderStatus _status;

  Order(this.id) : _status = OrderStatus.pending;

  OrderStatus get status => _status;

  bool transition(OrderStatus next) {
    if (!_status.canTransitionTo(next)) {
      print('❌ 전환 불가: ${_status.label} → ${next.label}');
      return false;
    }
    print('✅ 상태 변경: ${_status.label} → ${next.label}');
    _status = next;
    return true;
  }
}

void main() {
  var order = Order('ORD-001');

  order.transition(OrderStatus.confirmed);  // ✅ 주문 대기 → 주문 확인
  order.transition(OrderStatus.delivered);  // ❌ 전환 불가: 주문 확인 → 배송 완료
  order.transition(OrderStatus.shipped);    // ✅ 주문 확인 → 배송 중
  order.transition(OrderStatus.delivered);  // ✅ 배송 중 → 배송 완료
  order.transition(OrderStatus.cancelled);  // ❌ 전환 불가: 배송 완료 → 주문 취소

  print('최종 상태: ${order.status.label}');  // 최종 상태: 배송 완료
  print('종료 상태: ${order.status.isTerminal}');  // 종료 상태: true
}
```

**상태 전환 다이어그램**

![diagram](/developer-open-book/diagrams/step12-order-state-transition.svg)

---

### 6.2 설정값/코드 매핑

```dart
enum Currency {
  krw('KRW', '₩', 0),
  usd('USD', '\$', 2),
  eur('EUR', '€', 2),
  jpy('JPY', '¥', 0);

  final String code;
  final String symbol;
  final int decimalPlaces;

  const Currency(this.code, this.symbol, this.decimalPlaces);

  String format(double amount) {
    if (decimalPlaces == 0) {
      return '$symbol${amount.round()}';
    }
    return '$symbol${amount.toStringAsFixed(decimalPlaces)}';
  }

  static Currency? fromCode(String code) =>
      values.where((c) => c.code == code).firstOrNull;
}

void main() {
  double price = 1234.5;

  for (var currency in Currency.values) {
    print(currency.format(price));
  }
  // ₩1235
  // $1234.50
  // €1234.50
  // ¥1235

  var found = Currency.fromCode('EUR');
  print(found?.format(99.9));  // €99.90
}
```

---

### 6.3 JSON 직렬화/역직렬화

API 통신에서 Enum 값을 JSON 문자열과 안전하게 변환합니다.

```dart
enum UserRole {
  admin,
  editor,
  viewer,
  guest;

  // JSON 직렬화 — Enum → String
  String toJson() => name;

  // JSON 역직렬화 — String → Enum (안전한 방식)
  static UserRole fromJson(String value) {
    return values.byName(value);  // 없으면 ArgumentError
  }

  // null 안전 버전
  static UserRole? tryFromJson(String? value) {
    if (value == null) return null;
    return values.where((r) => r.name == value).firstOrNull;
  }
}

enum PostStatus {
  draft('draft'),
  published('published'),
  archived('archived');

  // JSON 값이 name과 다를 때
  final String jsonValue;
  const PostStatus(this.jsonValue);

  String toJson() => jsonValue;

  static PostStatus fromJson(String value) =>
      values.firstWhere(
        (s) => s.jsonValue == value,
        orElse: () => throw ArgumentError('알 수 없는 상태: $value'),
      );
}

void main() {
  // 직렬화
  var role = UserRole.editor;
  print(role.toJson());              // editor

  var status = PostStatus.published;
  print(status.toJson());            // published

  // 역직렬화
  var fromJson = UserRole.fromJson('admin');
  print(fromJson);                   // UserRole.admin

  var safe = UserRole.tryFromJson('unknown');
  print(safe ?? UserRole.guest);     // UserRole.guest

  // API 응답 시뮬레이션
  Map<String, dynamic> apiResponse = {
    'id': 1,
    'name': '홍길동',
    'role': 'viewer',
    'postStatus': 'archived',
  };

  var parsedRole   = UserRole.fromJson(apiResponse['role'] as String);
  var parsedStatus = PostStatus.fromJson(apiResponse['postStatus'] as String);

  print(parsedRole);    // UserRole.viewer
  print(parsedStatus);  // PostStatus.archived
}
```

---

### 6.4 권한/역할 관리

```dart
enum Permission {
  read,
  write,
  delete,
  admin;
}

enum UserRole {
  guest(    {Permission.read}),
  member(   {Permission.read, Permission.write}),
  moderator({Permission.read, Permission.write, Permission.delete}),
  admin(    {Permission.read, Permission.write, Permission.delete, Permission.admin});

  final Set<Permission> permissions;
  const UserRole(this.permissions);

  bool can(Permission permission) => permissions.contains(permission);
  bool canAll(Set<Permission> perms) => permissions.containsAll(perms);

  bool get isAdmin => can(Permission.admin);

  // 두 역할 합산 (더 높은 권한 반환)
  UserRole elevate(UserRole other) =>
      permissions.length >= other.permissions.length ? this : other;
}

class Resource {
  final String name;
  final UserRole requiredRole;

  Resource(this.name, this.requiredRole);

  bool isAccessibleBy(UserRole role) =>
      role.canAll(requiredRole.permissions);
}

void main() {
  var user = UserRole.member;

  print(user.can(Permission.read));    // true
  print(user.can(Permission.delete));  // false
  print(user.isAdmin);                 // false

  var doc = Resource('비밀 문서', UserRole.moderator);
  print(doc.isAccessibleBy(UserRole.member));     // false
  print(doc.isAccessibleBy(UserRole.moderator));  // true
  print(doc.isAccessibleBy(UserRole.admin));      // true

  // 권한 정렬
  var roles = [UserRole.admin, UserRole.guest, UserRole.member];
  roles.sort((a, b) => a.permissions.length.compareTo(b.permissions.length));
  print(roles.map((r) => r.name).toList());
  // [guest, member, admin]
}
```

---

## 7. Enum vs 상수 클래스 비교

언제 Enum을 쓰고 언제 `static const` 상수를 쓸지 비교합니다.

```dart
// 방식 A — static const 상수 클래스
class AppColors {
  static const int primary   = 0xFF2196F3;
  static const int secondary = 0xFF03DAC6;
  static const int error     = 0xFFB00020;

  // 모든 값 순회 불가
  // switch exhaustiveness check 없음
  // 새 값 추가 시 누락 가능
}

// 방식 B — Enum
enum AppColor {
  primary(0xFF2196F3),
  secondary(0xFF03DAC6),
  error(0xFFB00020);

  final int value;
  const AppColor(this.value);

  // 모든 값 순회 가능: AppColor.values
  // switch exhaustiveness check 동작
  // 새 값 추가 시 모든 switch 구문 컴파일 오류 → 즉시 발견
}
```

**선택 기준**

| 상황                                       | 권장 방식                  |
| ------------------------------------------ | -------------------------- |
| 유한한 상태/역할/타입을 표현               | Enum                       |
| 모든 케이스를 switch로 처리                | Enum (exhaustiveness 보장) |
| 값 추가 시 누락 처리 발견 필요             | Enum                       |
| 단순 설정값 (색상 코드, 수치 상수)         | `static const`             |
| 값의 수가 동적으로 변함                    | `static const` 또는 Map    |
| 외부 라이브러리/레거시 API와 int 변환 필요 | Enum (fromCode 메서드)     |

```
핵심 질문: "이 값들이 완전히 고정된 집합인가?"
  YES → Enum
  NO  → static const 또는 다른 방식
```

---

## 8. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 8-1: Exhaustiveness Check 체험

아래 코드에서 컴파일 오류가 발생하는 이유를 설명하고, 오류 없이 동작하도록 수정하세요.

```dart
enum Weekday { mon, tue, wed, thu, fri, sat, sun }

String getType(Weekday day) => switch (day) {
  Weekday.mon => '평일',
  Weekday.tue => '평일',
  Weekday.wed => '평일',
  Weekday.thu => '평일',
  Weekday.fri => '평일',
  // sat, sun 누락
};

void main() {
  print(getType(Weekday.sat));
}
```

> **정답 힌트**
>
> `Weekday.sat`와 `Weekday.sun`이 누락되어 exhaustiveness check 실패. 두 가지 수정 방법:
>
> ```dart
> // 방법 1: 누락된 케이스 추가
> String getType(Weekday day) => switch (day) {
>   Weekday.mon ||
>   Weekday.tue ||
>   Weekday.wed ||
>   Weekday.thu ||
>   Weekday.fri => '평일',
>   Weekday.sat ||
>   Weekday.sun => '주말',
> };
>
> // 방법 2: _ 와일드카드 (남은 케이스 일괄 처리)
> String getType(Weekday day) => switch (day) {
>   Weekday.sat || Weekday.sun => '주말',
>   _ => '평일',
> };
> ```

### 실습 8-2: 향상된 Enum 설계

아래 요구사항으로 `Season` 향상된 Enum을 직접 설계하세요.

**요구사항**

- 봄/여름/가을/겨울 4개 값
- 각 계절의 한국어 이름(`displayName`)과 대표 온도 범위(`tempRange`: `'0~15°C'` 형태)
- `isWarm` getter: 여름/봄이면 `true`
- `next()` 메서드: 다음 계절 반환 (겨울 → 봄)
- `fromMonth(int month)` static 메서드: 월(1~12)로 계절 반환

```dart
enum Season {
  // TODO: 구현
}

void main() {
  print(Season.spring.displayName);       // 봄
  print(Season.summer.tempRange);         // 25~35°C
  print(Season.winter.isWarm);            // false
  print(Season.autumn.next());            // Season.winter
  print(Season.winter.next());            // Season.spring
  print(Season.fromMonth(7));             // Season.summer
  print(Season.fromMonth(11));            // Season.autumn
}
```

> **정답 힌트**
>
> ```dart
> enum Season {
>   spring('봄',  '0~15°C'),
>   summer('여름', '25~35°C'),
>   autumn('가을', '10~20°C'),
>   winter('겨울', '-10~5°C');
>
>   final String displayName;
>   final String tempRange;
>   const Season(this.displayName, this.tempRange);
>
>   bool get isWarm => this == spring || this == summer;
>
>   Season next() => Season.values[(index + 1) % Season.values.length];
>
>   static Season fromMonth(int month) => switch (month) {
>     3 || 4 || 5  => spring,
>     6 || 7 || 8  => summer,
>     9 || 10 || 11 => autumn,
>     _            => winter,
>   };
> }
> ```

### 실습 8-3: 상태 머신 구현

`TrafficLight`(신호등) Enum을 설계하세요.

**요구사항**

- red / yellow / green 3개 상태
- `durationSeconds`: 각 상태 유지 시간 (red:30, yellow:5, green:25)
- `next()`: 다음 신호 반환 (red→green→yellow→red 순환)
- `canGo` getter: 출발 가능 여부 (green만 true)
- switch로 현재 신호를 설명하는 `instruction` getter

> **정답 힌트**
>
> ```dart
> enum TrafficLight {
>   red(30),
>   yellow(5),
>   green(25);
>
>   final int durationSeconds;
>   const TrafficLight(this.durationSeconds);
>
>   bool get canGo => this == green;
>
>   TrafficLight next() => switch (this) {
>     red    => green,
>     green  => yellow,
>     yellow => red,
>   };
>
>   String get instruction => switch (this) {
>     red    => '🔴 정지 ($durationSeconds초)',
>     yellow => '🟡 주의 ($durationSeconds초)',
>     green  => '🟢 출발 ($durationSeconds초)',
>   };
> }
>
> void main() {
>   var light = TrafficLight.red;
>   for (int i = 0; i < 5; i++) {
>     print(light.instruction);
>     light = light.next();
>   }
>   // 🔴 정지 (30초)
>   // 🟢 출발 (25초)
>   // 🟡 주의 (5초)
>   // 🔴 정지 (30초)
>   // 🟢 출발 (25초)
> }
> ```

---

## 9. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                 | 핵심 내용                                      |
| -------------------- | ---------------------------------------------- |
| 기본 Enum            | `enum Name { a, b, c }` — 유한 상수 집합       |
| `.name`              | Enum 값의 이름 문자열                          |
| `.index`             | 선언 순서 (0부터)                              |
| `.values`            | 모든 값의 `List`                               |
| `.byName()`          | 이름으로 값 검색 (없으면 ArgumentError)        |
| exhaustiveness       | switch에서 모든 케이스 처리 강제 — 핵심 안전성 |
| 향상된 Enum          | 필드(final), const 생성자, 메서드, getter      |
| `implements` in Enum | 인터페이스 구현 가능                           |
| 상태 머신            | `allowedTransitions`로 유효한 전환만 허용      |
| JSON 직렬화          | `toJson()` / `fromJson()` 패턴                 |
| `firstOrNull`        | 안전한 검색 (null 반환, 예외 없음)             |

### 🔗 다음 단계

> **Step 13 — 예외 처리(Exception Handling)**로 이동하세요.

Step 13에서는 Dart의 예외 처리 메커니즘(`try`/`catch`/`on`/`finally`), 커스텀 예외 클래스 설계, `Error` vs `Exception` 구분, 그리고 비동기 예외 처리 패턴을 학습합니다. Enum으로 표현한 상태 머신에서 유효하지 않은 전환을 예외로 처리하는 패턴도 연결해서 다룹니다.

### 📚 참고 자료

| 자료                | 링크                                                     |
| ------------------- | -------------------------------------------------------- |
| Dart Enum 공식 문서 | <https://dart.dev/language/enums>                          |
| 향상된 Enum 가이드  | <https://dart.dev/language/enums#declaring-enhanced-enums> |
| Dart 패턴 매칭      | <https://dart.dev/language/patterns>                       |
| DartPad 온라인 실습 | <https://dartpad.dev>                                      |

### ❓ 자가진단 퀴즈

1. **[Remember]** `Season.values.byName('spring')`과 `Season.values.where((s) => s.name == 'spring').firstOrNull`의 차이점은?
2. **[Understand]** `switch`에서 Enum을 사용할 때 `default` 케이스를 추가하면 exhaustiveness check가 약해지는 이유를 설명하라.
3. **[Understand]** 향상된 Enum의 필드가 반드시 `final`이어야 하고 생성자가 반드시 `const`여야 하는 이유를 Enum의 불변성 요구사항과 연결해 설명하라.
4. **[Apply]** `enum Direction { north, south, east, west }`에서 `north`의 반대는 `south`, `east`의 반대는 `west`를 반환하는 `opposite` getter를 작성하라.
5. **[Apply]** 아래 `String` 기반 코드를 Enum으로 리팩토링하고, 리팩토링 후 얻는 장점 두 가지를 설명하라.

   ```dart
   void applyDiscount(String memberType) {
     if (memberType == 'vip') { }
     else if (memberType == 'premium') { }
     else if (memberType == 'regular') { }
     // 'VIP'(대소문자 오타)도 통과됨 — 런타임에서야 발견
   }
   ```

6. **[Analyze]** `OrderStatus`를 Enum 대신 `abstract class` + 하위 클래스로 표현하는 방식(Sealed Class 패턴)과 비교할 때, Enum이 유리한 점과 불리한 점을 각각 두 가지씩 설명하라.

> **4번 정답 힌트**
>
> ```dart
> enum Direction {
>   north, south, east, west;
>
>   Direction get opposite => switch (this) {
>     north => south,
>     south => north,
>     east  => west,
>     west  => east,
>   };
> }
> ```

> **6번 정답 힌트**
>
> **Enum 유리한 점**: `.values`로 모든 상태 순회 가능, 선언이 간결하고 `switch` exhaustiveness check 자동 지원.
>
> **Enum 불리한 점**: 각 상태마다 다른 데이터를 갖기 어려움(예: `shipped` 상태에 `trackingNumber` 필드, `cancelled` 상태에 `reason` 필드처럼 상태별 다른 구조), 런타임에 새 상태를 동적으로 추가 불가.

---

_참고: 이 문서는 dart.dev 공식 문서(Enums, Patterns) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
