# Step 9 — 생성자(Constructor) 패턴

> **Phase 2 | 컬렉션과 객체지향** | 예상 소요: 2일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 9 — 생성자(Constructor) 패턴](#step-9--생성자constructor-패턴)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [생성자는 객체의 입구다](#생성자는-객체의-입구다)
  - [3. 기본 생성자 복습](#3-기본-생성자-복습)
    - [3.1 `this.` 초기화 파라미터](#31-this-초기화-파라미터)
    - [3.2 Initializer List (초기화 목록)](#32-initializer-list-초기화-목록)
  - [4. Named Constructor — 다양한 생성 방식](#4-named-constructor--다양한-생성-방식)
    - [기본 사용 예시](#기본-사용-예시)
    - [실용 패턴 — JSON, 기본값, 복사](#실용-패턴--json-기본값-복사)
    - [Named Constructor가 빛나는 상황](#named-constructor가-빛나는-상황)
  - [5. Redirecting Constructor — 생성자 위임](#5-redirecting-constructor--생성자-위임)
  - [6. `const` Constructor — 컴파일 타임 상수 객체](#6-const-constructor--컴파일-타임-상수-객체)
    - [6.1 `const` 생성자 조건](#61-const-생성자-조건)
    - [6.2 Flutter 위젯 최적화와의 연결](#62-flutter-위젯-최적화와의-연결)
  - [7. `factory` Constructor — 생성 로직의 완전한 제어](#7-factory-constructor--생성-로직의-완전한-제어)
    - [7.1 싱글톤 패턴](#71-싱글톤-패턴)
    - [7.2 캐시 패턴](#72-캐시-패턴)
    - [7.3 서브클래스 반환](#73-서브클래스-반환)
    - [7.4 JSON 역직렬화](#74-json-역직렬화)
  - [8. 생성자 패턴 비교와 선택 기준](#8-생성자-패턴-비교와-선택-기준)
  - [9. 실습](#9-실습)
    - [실습 9-1: Named Constructor + copyWith 구현](#실습-9-1-named-constructor--copywith-구현)
    - [실습 9-2: factory 싱글톤 구현](#실습-9-2-factory-싱글톤-구현)
    - [실습 9-3: `const` vs 일반 생성자 동작 비교](#실습-9-3-const-vs-일반-생성자-동작-비교)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                            |
| --- | ------------- | ------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | Named / Redirecting / `const` / `factory` 생성자의 이름과 문법을 나열할 수 있다 |
| 2   | 🟢 Understand | `const` 생성자와 일반 생성자의 차이, 메모리 재사용 원리를 설명할 수 있다        |
| 3   | 🟢 Understand | `factory` 생성자가 일반 생성자와 다른 핵심 차이점 두 가지를 설명할 수 있다      |
| 4   | 🟡 Apply      | Named constructor로 다양한 생성 시나리오를 가독성 있게 표현할 수 있다           |
| 5   | 🟡 Apply      | `factory` constructor로 싱글톤, 캐시, JSON 역직렬화 패턴을 구현할 수 있다       |
| 6   | 🟠 Analyze    | 주어진 설계 요구사항에 가장 적합한 생성자 패턴을 선택하고 근거를 설명할 수 있다 |

---

## 2. 서론

### 생성자는 객체의 입구다

클래스가 설계도라면, 생성자는 **그 설계도로 객체를 만드는 공정**입니다. 단순한 필드 초기화를 넘어, 생성자는 다음 질문에 답합니다.

- 이 객체를 **어떤 방법으로** 만들 수 있는가?
- 생성 시 **어떤 유효성 검사**가 필요한가?
- **같은 값의 객체**를 매번 새로 만들어야 하는가?
- **이미 만들어진 객체**를 재사용할 수 있는가?

Dart는 이 질문들에 대응하는 네 가지 생성자 패턴을 제공합니다.

```
┌─────────────────────────────────────────────────────────┐
│  기본 생성자       │ 표준 초기화                         │
│  Named 생성자      │ 여러 생성 시나리오 제공             │
│  const 생성자      │ 컴파일 타임 상수, 메모리 재사용     │
│  factory 생성자    │ 생성 로직 완전 제어, 재사용 가능    │
└─────────────────────────────────────────────────────────┘
```

> **전제 지식**: Step 8 완료 (클래스 기본, 필드, 메서드, getter/setter)

---

## 3. 기본 생성자 복습

### 3.1 `this.` 초기화 파라미터

Step 8에서 소개한 `this.필드` 초기화 문법을 먼저 명확히 정리합니다.

```dart
class User {
  final String id;
  final String name;
  int age;
  String? email;

  // this.필드 — 파라미터를 동명 필드에 직접 대입
  // Named 파라미터와 조합해 Flutter 스타일 생성자 구성
  User({
    required this.id,
    required this.name,
    required this.age,
    this.email,         // Optional — null 가능
  });
}

void main() {
  var user = User(id: 'u001', name: '홍길동', age: 30);
  var userWithEmail = User(
    id: 'u002',
    name: '김철수',
    age: 25,
    email: 'kim@dart.dev',
  );

  print(user.email);         // null
  print(userWithEmail.email); // kim@dart.dev
}
```

---

### 3.2 Initializer List (초기화 목록)

생성자 본문 실행 **이전에** 필드를 초기화합니다. `final` 필드는 생성자 본문에서 초기화할 수 없으므로 Initializer List를 사용합니다.

```
클래스명(파라미터) : 초기화목록 {
    본문
}

실행 순서: 초기화목록 → 본문
```

```dart
class Vector {
  final double x;
  final double y;
  final double magnitude;  // x, y로 계산 — 생성자 본문 이전에 초기화 필요

  // Initializer List — : 뒤에 위치
  Vector(double x, double y)
      : x = x,
        y = y,
        magnitude = (x * x + y * y); // 계산값 초기화

  // 유효성 검사도 Initializer List에서 수행
  Vector.validated(double x, double y)
      : assert(x >= 0 && y >= 0, '벡터 성분은 음수일 수 없습니다'),
        x = x,
        y = y,
        magnitude = (x * x + y * y);
}

void main() {
  var v = Vector(3, 4);
  print(v.magnitude);  // 25.0 (3² + 4² = 25)

  // assert는 개발 모드에서만 동작
  // var invalid = Vector.validated(-1, 2);  // AssertionError
}
```

**`this.` 초기화와 Initializer List 혼합**

```dart
class Config {
  final String host;
  final int port;
  final String baseUrl;  // host와 port로 계산

  Config({required this.host, required this.port})
      : baseUrl = 'https://$host:$port';
      // this.host, this.port는 이미 초기화됐으므로 baseUrl에서 참조 가능
}

void main() {
  var config = Config(host: 'api.dart.dev', port: 443);
  print(config.baseUrl);  // https://api.dart.dev:443
}
```

---

## 4. Named Constructor — 다양한 생성 방식

Named Constructor는 **하나의 클래스에 여러 생성자**를 정의합니다. 생성 시나리오마다 이름을 붙여 의도를 명확히 표현합니다.

```
클래스명.생성자이름(파라미터) { ... }
```

### 기본 사용 예시

```dart
class Color {
  final int r;
  final int g;
  final int b;

  // 기본 생성자 — RGB 값으로 생성
  Color(this.r, this.g, this.b);

  // Named constructor — 16진수 문자열로 생성
  Color.fromHex(String hex)
      : r = int.parse(hex.substring(1, 3), radix: 16),
        g = int.parse(hex.substring(3, 5), radix: 16),
        b = int.parse(hex.substring(5, 7), radix: 16);

  // Named constructor — 회색조로 생성
  Color.grayscale(int value)
      : r = value,
        g = value,
        b = value;

  // Named constructor — 다른 Color 복사
  Color.from(Color other) : r = other.r, g = other.g, b = other.b;

  @override
  String toString() => 'Color(r:$r, g:$g, b:$b)';
}

void main() {
  var red    = Color(255, 0, 0);
  var blue   = Color.fromHex('#0000FF');
  var gray   = Color.grayscale(128);
  var copied = Color.from(red);

  print(red);     // Color(r:255, g:0, b:0)
  print(blue);    // Color(r:0, g:0, b:255)
  print(gray);    // Color(r:128, g:128, b:128)
  print(copied);  // Color(r:255, g:0, b:0)
}
```

### 실용 패턴 — JSON, 기본값, 복사

```dart
class Point {
  final double x;
  final double y;

  // 기본 생성자
  const Point(this.x, this.y);

  // JSON Map에서 생성
  Point.fromJson(Map<String, dynamic> json)
      : x = (json['x'] as num).toDouble(),
        y = (json['y'] as num).toDouble();

  // 원점
  const Point.origin() : x = 0, y = 0;

  // X축 위 점
  Point.onXAxis(double x) : x = x, y = 0;

  // 복사 + 수정 (copyWith 패턴)
  Point copyWith({double? x, double? y}) =>
      Point(x ?? this.x, y ?? this.y);

  Map<String, dynamic> toJson() => {'x': x, 'y': y};

  @override
  String toString() => 'Point($x, $y)';
}

void main() {
  var origin  = Point.origin();
  var fromMap = Point.fromJson({'x': 3.0, 'y': 4.0});
  var onAxis  = Point.onXAxis(5.0);

  print(origin);   // Point(0.0, 0.0)
  print(fromMap);  // Point(3.0, 4.0)
  print(onAxis);   // Point(5.0, 0.0)

  // copyWith — 일부만 변경한 새 인스턴스
  var moved = fromMap.copyWith(x: 10.0);
  print(moved);    // Point(10.0, 4.0)
  print(fromMap);  // Point(3.0, 4.0) — 원본 불변
}
```

### Named Constructor가 빛나는 상황

```dart
class Duration2 {
  final int totalSeconds;

  Duration2(this.totalSeconds);

  // 시간 단위별 Named constructor — 의도가 명확
  Duration2.fromHours(int hours)
      : totalSeconds = hours * 3600;

  Duration2.fromMinutes(int minutes)
      : totalSeconds = minutes * 60;

  Duration2.fromDays(int days)
      : totalSeconds = days * 86400;

  int get hours   => totalSeconds ~/ 3600;
  int get minutes => (totalSeconds % 3600) ~/ 60;
  int get seconds => totalSeconds % 60;

  @override
  String toString() => '$hours시간 $minutes분 $seconds초';
}

void main() {
  // 어떤 단위로 생성하는지 코드만 봐도 즉시 이해
  print(Duration2.fromHours(2));    // 2시간 0분 0초
  print(Duration2.fromMinutes(90)); // 1시간 30분 0초
  print(Duration2.fromDays(1));     // 24시간 0분 0초
}
```

---

## 5. Redirecting Constructor — 생성자 위임

한 생성자가 **같은 클래스의 다른 생성자를 호출**합니다. 중복 코드를 줄이고 초기화 로직을 단일 지점에 집중시킵니다.

```
클래스명.이름(파라미터) : this(다른생성자파라미터);
```

```dart
class Rectangle {
  final double width;
  final double height;

  // 주 생성자 — 모든 초기화 로직 집중
  Rectangle(this.width, this.height)
      : assert(width > 0 && height > 0, '가로/세로는 양수여야 합니다');

  // 정사각형 — 주 생성자로 위임
  Rectangle.square(double side) : this(side, side);

  // 기본 크기 — 주 생성자로 위임
  Rectangle.defaultSize() : this(100, 50);

  double get area => width * height;

  @override
  String toString() => 'Rectangle(${width}x${height})';
}

void main() {
  var rect   = Rectangle(200, 100);
  var square = Rectangle.square(50);
  var def    = Rectangle.defaultSize();

  print(rect);    // Rectangle(200.0x100.0)
  print(square);  // Rectangle(50.0x50.0)
  print(def);     // Rectangle(100.0x50.0)
  print(square.area); // 2500.0

  // assert 동작 확인 (개발 모드)
  // Rectangle(-1, 10);  // AssertionError
}
```

**Redirecting의 핵심 장점 — 유효성 검사 단일화**

```
❌ 위임 없이 각 생성자에 검사 중복

Rectangle.square(double side) {
  assert(side > 0);   // 중복
  width = side;
  height = side;
}

✅ 위임으로 주 생성자 한 곳에서 검사

Rectangle.square(double side) : this(side, side);
// → Rectangle(side, side) → assert(side > 0) 자동 실행
```

---

## 6. `const` Constructor — 컴파일 타임 상수 객체

`const` 생성자로 만들어진 객체는 **컴파일 타임에 완전히 결정**됩니다. 동일한 인수로 생성된 `const` 객체는 메모리에서 **단 하나의 인스턴스를 공유**합니다.

### 6.1 `const` 생성자 조건

```
1. 모든 필드가 final이어야 한다
2. 생성자 본문이 없어야 한다 (Initializer List는 허용)
3. 부모 클래스의 생성자도 const여야 한다
```

```dart
class ImmutablePoint {
  final double x;
  final double y;

  // const 생성자 — 본문 없음, 모든 필드 final
  const ImmutablePoint(this.x, this.y);

  // Initializer List는 허용
  const ImmutablePoint.origin() : x = 0, y = 0;

  @override
  String toString() => 'ImmutablePoint($x, $y)';
}

void main() {
  // const 인스턴스 생성
  const p1 = ImmutablePoint(1, 2);
  const p2 = ImmutablePoint(1, 2);  // 동일 인수
  const p3 = ImmutablePoint(3, 4);  // 다른 인수

  // 동일 인수 → 동일 인스턴스 (메모리 재사용)
  print(identical(p1, p2));  // true  — 같은 객체!
  print(identical(p1, p3));  // false — 다른 객체

  // const 없이 생성 — 일반 인스턴스
  var p4 = ImmutablePoint(1, 2);
  var p5 = ImmutablePoint(1, 2);
  print(identical(p4, p5));  // false — 다른 객체
}
```

**`const` 인스턴스의 메모리 구조**

```
const ImmutablePoint(1, 2) → 컴파일 타임 상수 풀(Constant Pool)에 저장
                                         │
p1 ─────────────────────────────────────►│ 동일 메모리 위치
p2 ─────────────────────────────────────►│ (한 번만 생성)
```

---

### 6.2 Flutter 위젯 최적화와의 연결

Flutter의 위젯 재빌드 메커니즘에서 `const` 생성자는 **핵심 성능 최적화 도구**입니다.

```dart
// Flutter 위젯 예시 (개념 설명용)

// ❌ const 없음 — 부모 위젯 재빌드 시마다 새 Text 인스턴스 생성
// Text('고정된 제목')

// ✅ const 사용 — 컴파일 타임에 한 번만 생성, 재빌드 시 재사용
// const Text('고정된 제목')
```

**`const` 생성자의 Flutter 재빌드 영향**

```
부모 위젯 setState() 호출
          │
          ▼
    자식 위젯 rebuild
          │
    const 위젯인가?
     ├─ YES ──► identical() == true → 재빌드 스킵 ✅
     └─ NO  ──► 새 인스턴스 생성 → 재빌드 실행
```

```dart
// Dart 클래스에서 const 활용 예시
class AppTheme {
  final String fontFamily;
  final double fontSize;
  final String primaryColor;

  const AppTheme({
    required this.fontFamily,
    required this.fontSize,
    required this.primaryColor,
  });

  // 미리 정의된 테마 상수
  static const light = AppTheme(
    fontFamily: 'Pretendard',
    fontSize: 16,
    primaryColor: '#2196F3',
  );

  static const dark = AppTheme(
    fontFamily: 'Pretendard',
    fontSize: 16,
    primaryColor: '#90CAF9',
  );
}

void main() {
  // const 인스턴스 — 어디서든 동일 객체 참조
  print(identical(AppTheme.light, AppTheme.light));  // true
}
```

---

## 7. `factory` Constructor — 생성 로직의 완전한 제어

`factory` 생성자는 **반드시 새 인스턴스를 생성하지 않아도 되는** 특수한 생성자입니다. 일반 생성자와의 결정적 차이는 두 가지입니다.

```
일반 생성자: 항상 새 인스턴스 생성, this 접근 가능
factory 생성자: 기존 인스턴스 반환 가능, this 접근 불가
```

```dart
class Logger {
  final String name;

  // factory — 반환값을 직접 제어
  factory Logger(String name) {
    // ❌ this.name 접근 불가 — 아직 인스턴스가 없음
    // 기존 인스턴스 반환 또는 새 인스턴스 생성 가능
    return Logger._internal(name);
  }

  // private 생성자 — factory에서만 호출
  Logger._internal(this.name);
}
```

### 7.1 싱글톤 패턴

애플리케이션 전체에서 인스턴스가 **하나만 존재**해야 할 때 사용합니다.

```dart
class DatabaseConnection {
  static DatabaseConnection? _instance;  // 단일 인스턴스 저장
  final String connectionString;

  // factory — 항상 동일 인스턴스 반환
  factory DatabaseConnection({String url = 'localhost:5432'}) {
    _instance ??= DatabaseConnection._init(url);  // 없으면 생성, 있으면 재사용
    return _instance!;
  }

  // private 생성자 — 외부에서 직접 생성 차단
  DatabaseConnection._init(this.connectionString) {
    print('DB 연결 초기화: $connectionString');
  }

  void query(String sql) => print('실행: $sql');
}

void main() {
  var db1 = DatabaseConnection();   // "DB 연결 초기화: localhost:5432" 출력
  var db2 = DatabaseConnection();   // 출력 없음 — 기존 인스턴스 반환

  print(identical(db1, db2));  // true — 완전히 같은 객체
  db1.query('SELECT * FROM users');
}
```

**싱글톤 패턴의 주의점**

```
장점: 리소스 공유, 전역 상태 일관성
단점: 테스트 어려움, 전역 상태 남용 위험

권장 사용처: DB 연결, 로거, 설정 관리자
지양 사용처: 비즈니스 로직, UI 상태
```

---

### 7.2 캐시 패턴

동일한 인수로 생성된 객체를 **캐시에서 재사용**합니다. 생성 비용이 큰 객체에 효과적입니다.

```dart
class ExpensiveResource {
  static final Map<String, ExpensiveResource> _cache = {};
  final String id;
  final String data;

  factory ExpensiveResource(String id) {
    // 캐시에 있으면 재사용
    if (_cache.containsKey(id)) {
      print('캐시 히트: $id');
      return _cache[id]!;
    }
    // 없으면 새로 생성 후 캐시에 저장
    print('새로 생성: $id');
    final resource = ExpensiveResource._create(id);
    _cache[id] = resource;
    return resource;
  }

  ExpensiveResource._create(this.id) : data = '${id}_data_loaded';
}

void main() {
  var r1 = ExpensiveResource('config');   // 새로 생성: config
  var r2 = ExpensiveResource('config');   // 캐시 히트: config
  var r3 = ExpensiveResource('profile');  // 새로 생성: profile

  print(identical(r1, r2));  // true  — 캐시에서 동일 객체
  print(identical(r1, r3));  // false — 다른 ID
}
```

---

### 7.3 서브클래스 반환

`factory` 생성자는 **자신의 서브클래스 인스턴스를 반환**할 수 있습니다. 타입에 따른 구현체를 선택하는 팩토리 메서드 패턴에 활용됩니다.

```dart
abstract class Shape {
  final String type;
  Shape(this.type);

  double get area;

  // factory — 타입 문자열로 적합한 서브클래스 반환
  factory Shape.create(String type, List<double> params) {
    return switch (type) {
      'circle'    => Circle(params[0]),
      'rectangle' => Rect(params[0], params[1]),
      'triangle'  => Triangle(params[0], params[1]),
      _ => throw ArgumentError('알 수 없는 도형: $type'),
    };
  }
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius) : super('circle');

  @override
  double get area => 3.14159 * radius * radius;
}

class Rect extends Shape {
  final double width, height;
  Rect(this.width, this.height) : super('rectangle');

  @override
  double get area => width * height;
}

class Triangle extends Shape {
  final double base, height;
  Triangle(this.base, this.height) : super('triangle');

  @override
  double get area => 0.5 * base * height;
}

void main() {
  List<Shape> shapes = [
    Shape.create('circle', [5]),
    Shape.create('rectangle', [4, 6]),
    Shape.create('triangle', [3, 8]),
  ];

  for (var shape in shapes) {
    print('${shape.type}: 넓이 = ${shape.area.toStringAsFixed(2)}');
  }
  // circle: 넓이 = 78.54
  // rectangle: 넓이 = 24.00
  // triangle: 넓이 = 12.00
}
```

---

### 7.4 JSON 역직렬화

실무에서 가장 흔하게 사용하는 `factory` 패턴입니다. API 응답 JSON을 Dart 객체로 변환합니다.

```dart
class Article {
  final int id;
  final String title;
  final String author;
  final DateTime publishedAt;
  final List<String> tags;

  Article({
    required this.id,
    required this.title,
    required this.author,
    required this.publishedAt,
    required this.tags,
  });

  // factory — JSON Map에서 Article 생성
  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      id:          json['id'] as int,
      title:       json['title'] as String,
      author:      json['author'] as String,
      publishedAt: DateTime.parse(json['published_at'] as String),
      tags:        List<String>.from(json['tags'] as List),
    );
  }

  // JSON으로 직렬화 (대칭 메서드)
  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'author': author,
    'published_at': publishedAt.toIso8601String(),
    'tags': tags,
  };

  @override
  String toString() => 'Article($id: $title by $author)';
}

void main() {
  // API 응답 시뮬레이션
  Map<String, dynamic> jsonData = {
    'id': 1,
    'title': 'Dart 3.0 신기능 소개',
    'author': '홍길동',
    'published_at': '2024-03-15T09:00:00.000Z',
    'tags': ['dart', 'programming', 'tutorial'],
  };

  var article = Article.fromJson(jsonData);
  print(article);                    // Article(1: Dart 3.0 신기능 소개 by 홍길동)
  print(article.publishedAt.year);   // 2024
  print(article.tags);               // [dart, programming, tutorial]

  // 리스트 역직렬화
  List<Map<String, dynamic>> jsonList = [jsonData, jsonData];
  List<Article> articles = jsonList
      .map(Article.fromJson)  // 메서드 참조로 간결하게
      .toList();
  print(articles.length);  // 2
}
```

---

## 8. 생성자 패턴 비교와 선택 기준

```
┌────────────────┬─────────────────────────────────────────────────┐
│  패턴          │  특징 및 사용 시점                               │
├────────────────┼─────────────────────────────────────────────────┤
│  기본 생성자   │  표준 초기화, 항상 새 인스턴스                  │
│  Named         │  다양한 생성 시나리오, 의미 있는 이름 부여      │
│  Redirecting   │  중복 제거, 유효성 검사 단일화                  │
│  const         │  불변 객체, 메모리 재사용, Flutter 최적화       │
│  factory       │  재사용/캐시/서브클래스 반환/JSON 파싱          │
└────────────────┴─────────────────────────────────────────────────┘
```

**생성자 선택 흐름도**

```
객체를 생성해야 한다
        │
        ▼
  모든 필드가 final이고
  컴파일 타임 값인가?
   ├─ YES ──► const 생성자
   └─ NO
        │
        ▼
  기존 인스턴스를 재사용하거나
  서브클래스를 반환해야 하는가?
   ├─ YES ──► factory 생성자
   └─ NO
        │
        ▼
  다양한 생성 방식이 필요한가?
   ├─ YES ──► Named 생성자 (+ Redirecting으로 중복 제거)
   └─ NO  ──► 기본 생성자
```

**`const` vs `factory` — 헷갈리기 쉬운 차이점**

| 특성             | `const` 생성자                   | `factory` 생성자        |
| ---------------- | -------------------------------- | ----------------------- |
| 새 인스턴스 생성 | 동일 인수면 재사용 (컴파일 타임) | 직접 제어 가능 (런타임) |
| `this` 접근      | 불가 (본문 없음)                 | 불가 (인스턴스 없음)    |
| 필드 조건        | 모두 `final` 필수                | 제한 없음               |
| 서브클래스 반환  | 불가                             | ✅ 가능                 |
| 캐시/싱글톤      | 불가                             | ✅ 가능                 |
| 주요 목적        | 불변 상수 객체                   | 생성 로직 제어          |

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: Named Constructor + copyWith 구현

아래 `Book` 클래스에 Named constructor 3개와 `copyWith()`를 구현하세요.

```dart
class Book {
  final String title;
  final String author;
  final int year;
  final String genre;
  final bool isAvailable;

  const Book({
    required this.title,
    required this.author,
    required this.year,
    required this.genre,
    this.isAvailable = true,
  });

  // TODO 1: Book.fromJson(Map<String, dynamic> json) 구현
  // TODO 2: Book.unknown() — 제목: '알 수 없음', 저자: '미상', 년도: 0, 장르: '기타'
  // TODO 3: copyWith({String? title, ...}) 구현
  // TODO 4: toString() 구현
}

void main() {
  var json = {'title': '다트 프로그래밍', 'author': '홍길동', 'year': 2024, 'genre': '기술'};
  var book = Book.fromJson(json);
  print(book);

  var unknown = Book.unknown();
  print(unknown);

  var updated = book.copyWith(isAvailable: false);
  print(updated);
  print(book.isAvailable);  // true — 원본 불변
}
```

> **정답 힌트**
>
> ```dart
> factory Book.fromJson(Map<String, dynamic> json) => Book(
>   title:  json['title'] as String,
>   author: json['author'] as String,
>   year:   json['year'] as int,
>   genre:  json['genre'] as String,
> );
>
> const Book.unknown()
>     : title = '알 수 없음',
>       author = '미상',
>       year = 0,
>       genre = '기타',
>       isAvailable = false;
>
> Book copyWith({
>   String? title,
>   String? author,
>   int? year,
>   String? genre,
>   bool? isAvailable,
> }) => Book(
>   title:       title ?? this.title,
>   author:      author ?? this.author,
>   year:        year ?? this.year,
>   genre:       genre ?? this.genre,
>   isAvailable: isAvailable ?? this.isAvailable,
> );
>
> @override
> String toString() =>
>     'Book("$title" by $author, $year, $genre, ${isAvailable ? "대출가능" : "대출중"})';
> ```

### 실습 9-2: factory 싱글톤 구현

아래 요구사항을 만족하는 `AppLogger` 싱글톤 클래스를 구현하세요.

**요구사항**

- `AppLogger()`로 어디서 생성해도 동일 인스턴스 반환
- `log(String message)` — `[LOG] message` 출력
- `warn(String message)` — `[WARN] message` 출력
- `error(String message)` — `[ERROR] message` 출력
- 생성된 총 로그 수를 `logCount`로 추적

> **정답 힌트**
>
> ```dart
> class AppLogger {
>   static AppLogger? _instance;
>   int _logCount = 0;
>
>   factory AppLogger() {
>     _instance ??= AppLogger._internal();
>     return _instance!;
>   }
>
>   AppLogger._internal();
>
>   int get logCount => _logCount;
>
>   void log(String message)   { _logCount++; print('[LOG] $message'); }
>   void warn(String message)  { _logCount++; print('[WARN] $message'); }
>   void error(String message) { _logCount++; print('[ERROR] $message'); }
> }
>
> void main() {
>   var logger1 = AppLogger();
>   var logger2 = AppLogger();
>   print(identical(logger1, logger2));  // true
>
>   logger1.log('앱 시작');
>   logger2.warn('메모리 부족');
>   print(AppLogger().logCount);  // 2
> }
> ```

### 실습 9-3: `const` vs 일반 생성자 동작 비교

아래 코드를 실행 전에 각 `identical()` 결과를 예측하고, 이유를 설명하세요.

```dart
class Tag {
  final String name;
  const Tag(this.name);
}

void main() {
  const t1 = Tag('dart');
  const t2 = Tag('dart');
  const t3 = Tag('flutter');
  var   t4 = Tag('dart');
  var   t5 = Tag('dart');

  print(identical(t1, t2));  // (A) ?
  print(identical(t1, t3));  // (B) ?
  print(identical(t1, t4));  // (C) ?
  print(identical(t4, t5));  // (D) ?
}
```

> **정답 힌트**
>
> (A) `true` — 동일 인수의 `const` 인스턴스는 컴파일 타임 상수 풀에서 같은 객체 공유
>
> (B) `false` — 인수가 다르므로 다른 상수 객체
>
> (C) `false` — `t4`는 `const` 없이 생성된 런타임 인스턴스, `t1`은 컴파일 타임 상수
>
> (D) `false` — 둘 다 `var`로 생성된 런타임 인스턴스, 매번 새 객체 생성

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 패턴                  | 문법                           | 핵심 특징                                  |
| --------------------- | ------------------------------ | ------------------------------------------ |
| `this.` 초기화        | `Class(this.field)`            | 파라미터를 동명 필드에 직접 대입           |
| Initializer List      | `Class() : field = ...`        | 본문 이전 초기화, `final` 필드 계산값 설정 |
| Named Constructor     | `Class.name(...)`              | 다양한 생성 시나리오, 의도 명확한 이름     |
| Redirecting           | `Class.name() : this(...)`     | 다른 생성자로 위임, 중복 제거              |
| `const` Constructor   | `const Class(...)`             | 불변 객체, 동일 인수 → 메모리 재사용       |
| `factory` Constructor | `factory Class(...)`           | 기존 인스턴스 재사용, 서브클래스 반환 가능 |
| Singleton             | `factory` + `static` 필드      | 앱 전역 단일 인스턴스                      |
| Cache                 | `factory` + `Map` 캐시         | 동일 인수 객체 재사용                      |
| `fromJson`            | `factory Class.fromJson(json)` | JSON → 객체 역직렬화 표준 패턴             |
| `copyWith`            | Named Constructor 또는 메서드  | 일부만 변경한 새 불변 인스턴스 생성        |

### 🔗 다음 단계

> **Step 10 — OOP 확장**으로 이동하세요.

Step 10에서는 `extends`(상속), `implements`(인터페이스), `abstract class`를 학습하고 세 메커니즘의 트레이드오프를 분석합니다. 지금까지 배운 클래스 기초와 생성자 패턴이 OOP 계층 구조 설계의 기반이 됩니다. Step 10 완료 후 **실전 과제 2(도서 관리 시스템)** 를 구현합니다.

### 📚 참고 자료

| 자료                    | 링크                                                           |
| ----------------------- | -------------------------------------------------------------- |
| Dart 생성자 공식 문서   | <https://dart.dev/language/constructors>                       |
| const 생성자 가이드     | <https://dart.dev/language/constructors#constant-constructors> |
| factory 생성자 가이드   | <https://dart.dev/language/constructors#factory-constructors>  |
| Effective Dart — 생성자 | <https://dart.dev/effective-dart/usage#constructors>           |
| DartPad 온라인 실습     | <https://dartpad.dev>                                          |

### ❓ 자가진단 퀴즈

1. **[Remember]** `factory` 생성자 내부에서 `this`를 사용할 수 없는 이유는 무엇인가?
2. **[Remember]** Initializer List(`: 초기화목록`)와 생성자 본문(`{ }`)의 실행 순서는?
3. **[Understand]** `const` 생성자를 사용해도 `var t = Tag('dart')` 처럼 `var`로 선언하면 메모리 재사용이 일어나지 않는 이유를 설명하라.
4. **[Understand]** Redirecting Constructor가 단순히 `this(a, b)` 호출로 위임하는 것이 유효성 검사 측면에서 왜 유리한가?
5. **[Apply]** 다음 두 `fromJson` 구현 중 더 안전한 것은 무엇이고, 왜 그런가?

   ```dart
   // 방식 A
   factory User.fromJson(Map<String, dynamic> json) {
     return User(name: json['name'], age: json['age']);
   }
   // 방식 B
   factory User.fromJson(Map<String, dynamic> json) {
     return User(
       name: json['name'] as String,
       age:  json['age'] as int,
     );
   }
   ```

6. **[Analyze]** 싱글톤 패턴을 `factory` 생성자로 구현하는 것과 `static` 메서드 `getInstance()`로 구현하는 것의 차이를 호출부 코드와 가독성 관점에서 비교하라.

> **5번 정답 힌트**
>
> 방식 B가 더 안전합니다. 명시적 타입 캐스팅(`as String`, `as int`)은 JSON 값의 타입이 예상과 다를 때 즉시 `CastError`를 발생시켜 문제를 조기에 발견할 수 있습니다. 방식 A는 타입 불일치가 있어도 해당 값을 사용하는 시점까지 오류가 드러나지 않아 디버깅이 어려워집니다.

> **6번 정답 힌트**
>
> `factory` 생성자는 `ClassName()` 형태로 호출해 일반 생성자와 동일한 문법을 유지합니다. `getInstance()` 방식은 `ClassName.getInstance()` 처럼 명시적 메서드 호출이 필요합니다. `factory` 방식은 호출부 코드 변경 없이 내부 구현을 싱글톤으로 전환할 수 있어 인터페이스 투명성이 높습니다.

---

> ⬅️ [Step 8 — 클래스와 객체 기본](#) | ➡️ [Step 10 — OOP 확장 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Constructors) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
