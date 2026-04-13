# Step 8 — 클래스와 객체 기본

> **Phase 2 | 컬렉션과 객체지향** | 예상 소요: 2일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 8 — 클래스와 객체 기본](#step-8--클래스와-객체-기본)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [객체지향이란 무엇인가?](#객체지향이란-무엇인가)
  - [3. 클래스 정의와 인스턴스화](#3-클래스-정의와-인스턴스화)
    - [3.1 기본 클래스 구조](#31-기본-클래스-구조)
    - [3.2 인스턴스 생성](#32-인스턴스-생성)
    - [3.3 `this` 키워드](#33-this-키워드)
  - [4. 필드 (Field)](#4-필드-field)
    - [4.1 인스턴스 필드](#41-인스턴스-필드)
    - [4.2 정적 필드 `static`](#42-정적-필드-static)
    - [4.3 `final` 필드와 불변 객체](#43-final-필드와-불변-객체)
  - [5. 메서드 (Method)](#5-메서드-method)
    - [5.1 인스턴스 메서드](#51-인스턴스-메서드)
    - [5.2 정적 메서드 `static`](#52-정적-메서드-static)
    - [5.3 getter / setter](#53-getter--setter)
  - [6. 접근 제한자 — Dart의 private](#6-접근-제한자--dart의-private)
  - [7. 객체 동등성 — `==` 재정의](#7-객체-동등성---재정의)
  - [8. `toString()` 재정의](#8-tostring-재정의)
  - [9. 클래스 설계 원칙](#9-클래스-설계-원칙)
    - [단일 책임 원칙 (SRP — Single Responsibility Principle)](#단일-책임-원칙-srp--single-responsibility-principle)
    - [캡슐화 원칙 적용 체크리스트](#캡슐화-원칙-적용-체크리스트)
    - [클래스 설계 시 자주 하는 실수](#클래스-설계-시-자주-하는-실수)
  - [10. 실습](#10-실습)
    - [실습 10-1: `toString()` / `==` / `hashCode` 구현](#실습-10-1-tostring----hashcode-구현)
    - [실습 10-2: getter / setter와 캡슐화](#실습-10-2-getter--setter와-캡슐화)
    - [실습 10-3: 설계 문제 — `ShoppingCart`](#실습-10-3-설계-문제--shoppingcart)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                             |
| --- | ------------- | ---------------------------------------------------------------- |
| 1   | 🔵 Remember   | 클래스의 구성 요소(필드, 메서드, 생성자)를 나열할 수 있다        |
| 2   | 🔵 Remember   | Dart의 private 접근 제한자 문법(`_`)을 설명할 수 있다            |
| 3   | 🟢 Understand | `static` 멤버와 인스턴스 멤버의 차이를 설명할 수 있다            |
| 4   | 🟢 Understand | getter/setter가 단순 필드 공개와 다른 점을 설명할 수 있다        |
| 5   | 🟡 Apply      | 현실 세계의 개념을 클래스로 모델링하고 인스턴스를 생성할 수 있다 |
| 6   | 🟡 Apply      | `==`, `hashCode`, `toString()`을 목적에 맞게 재정의할 수 있다    |
| 7   | 🟠 Analyze    | 클래스 설계 시 캡슐화 원칙 적용 여부를 판단할 수 있다            |

---

## 2. 서론

### 객체지향이란 무엇인가?

현실 세계는 **사물(Object)** 로 구성되어 있습니다. 사람, 자동차, 계좌, 주문서… 이것들은 각각 고유한 **상태(데이터)** 와 **행동(기능)** 을 가집니다.

객체지향 프로그래밍(OOP)은 이 직관을 코드로 옮깁니다. **클래스(Class)** 는 사물의 설계도이고, **인스턴스(Instance)** 는 그 설계도로 만들어진 실제 객체입니다.

![diagram](/developer-open-book/diagrams/step08-class-instance.svg)

OOP의 네 가지 핵심 원칙 중 이번 Step에서는 가장 기초인 **캡슐화(Encapsulation)** 를 집중적으로 다룹니다.

```
캡슐화: 데이터(필드)와 행동(메서드)을 하나의 단위로 묶고,
        내부 구현을 외부로부터 숨긴다.
```

> **전제 지식**: Step 5~7 완료 (함수, 컬렉션, 함수형 메서드)

---

## 3. 클래스 정의와 인스턴스화

### 3.1 기본 클래스 구조

```dart
class 클래스명 {
  // 필드 (Field) — 상태 저장
  타입 필드명;

  // 생성자 (Constructor) — 인스턴스 초기화
  클래스명(매개변수) { ... }

  // 메서드 (Method) — 행동 정의
  반환타입 메서드명(매개변수) { ... }
}
```

**첫 번째 클래스 — `BankAccount`**

```dart
class BankAccount {
  // 필드
  String owner;
  double balance;

  // 생성자
  BankAccount(this.owner, this.balance);

  // 메서드
  void deposit(double amount) {
    if (amount <= 0) return;
    balance += amount;
    print('$owner 계좌: ${amount}원 입금 → 잔액: ${balance}원');
  }

  void withdraw(double amount) {
    if (amount <= 0 || amount > balance) {
      print('출금 실패: 잔액 부족');
      return;
    }
    balance -= amount;
    print('$owner 계좌: ${amount}원 출금 → 잔액: ${balance}원');
  }

  double getBalance() => balance;
}
```

---

### 3.2 인스턴스 생성

`new` 키워드는 Dart 2.0 이후 선택 사항이며, 일반적으로 생략합니다.

```dart
void main() {
  // 인스턴스 생성 — new 생략 가능 (권장)
  BankAccount account1 = BankAccount('홍길동', 500000);
  var account2 = BankAccount('김철수', 1200000);

  // 메서드 호출
  account1.deposit(100000);   // 홍길동 계좌: 100000원 입금 → 잔액: 600000.0원
  account1.withdraw(200000);  // 홍길동 계좌: 200000원 출금 → 잔액: 400000.0원
  account2.withdraw(9999999); // 출금 실패: 잔액 부족

  // 필드 접근
  print(account1.owner);    // 홍길동
  print(account1.balance);  // 400000.0

  // 각 인스턴스는 독립적인 상태를 가짐
  print(account1.balance == account2.balance);  // false
}
```

**인스턴스는 힙(Heap) 메모리에 저장됩니다.**

![diagram](/developer-open-book/diagrams/step08-memory-stack-heap.svg)

---

### 3.3 `this` 키워드

`this`는 **현재 인스턴스를 참조**합니다. 필드명과 매개변수명이 충돌할 때 사용합니다.

```dart
class Point {
  double x;
  double y;

  // 매개변수명과 필드명 충돌 — this로 구분
  Point(double x, double y) {
    this.x = x;  // this.x = 필드, x = 매개변수
    this.y = y;
  }

  // Dart 관용구: this 생략 초기화 문법 (위와 동일)
  // Point(this.x, this.y);  ← 더 간결, 권장

  double distanceTo(Point other) {
    double dx = this.x - other.x;  // this 생략 가능
    double dy = y - other.y;       // this 없이도 동일
    return (dx * dx + dy * dy).toDouble();
  }
}

void main() {
  var p1 = Point(0, 0);
  var p2 = Point(3, 4);
  print(p1.distanceTo(p2));  // 25.0 (√25 = 5의 제곱)
}
```

> 📌 **Dart 관용구**: `Point(this.x, this.y)` 형태의 **초기화 리스트** 생성자가 표준입니다. 단순 필드 대입은 이 방식으로 처리하고, `this`를 명시하는 장문 생성자는 지양합니다.

---

## 4. 필드 (Field)

### 4.1 인스턴스 필드

인스턴스마다 독립적으로 존재하는 데이터입니다.

```dart
class Product {
  String name;
  double price;
  int stock;

  Product(this.name, this.price, this.stock);
}

void main() {
  var laptop  = Product('노트북', 1200000, 5);
  var mouse   = Product('마우스', 35000, 50);

  laptop.stock -= 1;   // laptop만 변경
  print(laptop.stock); // 4
  print(mouse.stock);  // 50 — 독립적
}
```

---

### 4.2 정적 필드 `static`

**클래스 자체에 속하는** 필드입니다. 모든 인스턴스가 공유하며, 인스턴스 없이도 접근할 수 있습니다.

```dart
class AppConfig {
  // 정적 필드 — 모든 인스턴스 공유
  static const String appName = 'Dart App';
  static const String version = '1.0.0';
  static int instanceCount = 0;

  String userId;

  AppConfig(this.userId) {
    AppConfig.instanceCount++;  // 생성될 때마다 카운트 증가
  }
}

void main() {
  // 인스턴스 없이 클래스명으로 직접 접근
  print(AppConfig.appName);       // Dart App
  print(AppConfig.version);       // 1.0.0
  print(AppConfig.instanceCount); // 0

  var c1 = AppConfig('user_001');
  var c2 = AppConfig('user_002');

  // 모든 인스턴스가 동일한 static 값을 공유
  print(AppConfig.instanceCount); // 2
  print(c1.userId);               // user_001
  print(c2.userId);               // user_002
}
```

**인스턴스 필드 vs 정적 필드 비교**

```
인스턴스 필드              정적(static) 필드
───────────────────────    ───────────────────────────
각 인스턴스마다 독립        클래스 하나에 단 하나 존재
인스턴스.필드명으로 접근    클래스명.필드명으로 접근
인스턴스 생성 후 존재       클래스 로딩 시 존재
객체의 개별 상태           공유 상태, 설정값, 카운터
```

---

### 4.3 `final` 필드와 불변 객체

`final` 필드는 생성자에서 **단 한 번만 초기화**됩니다. 이후 변경 불가합니다.

```dart
class Circle {
  // final — 생성 후 반지름 변경 불가 (불변 속성)
  final double radius;

  // non-final — 색상은 변경 가능
  String color;

  Circle(this.radius, {this.color = 'white'});

  double get area => 3.14159 * radius * radius;
  double get circumference => 2 * 3.14159 * radius;
}

void main() {
  var c = Circle(5.0, color: 'blue');
  print(c.area);            // 78.53975
  c.color = 'red';          // ✅ 변경 가능
  // c.radius = 10.0;       // ❌ 컴파일 오류 — final 필드
}
```

**완전 불변 객체 설계 패턴**

모든 필드를 `final`로 선언하면 생성 후 상태가 절대 변하지 않는 **불변(Immutable) 객체**가 됩니다. 불변 객체는 공유 시 부수 효과가 없어 멀티스레딩 환경과 상태 관리에서 선호됩니다.

```dart
class Color {
  final int r;
  final int g;
  final int b;

  const Color(this.r, this.g, this.b);  // const 생성자 — 컴파일 타임 상수 가능

  // 불변 객체 수정 패턴 — 새 객체 반환 (copyWith)
  Color withRed(int newR) => Color(newR, g, b);
  Color withOpacity(double factor) => Color(
    (r * factor).round(),
    (g * factor).round(),
    (b * factor).round(),
  );

  @override
  String toString() => 'Color(r:$r, g:$g, b:$b)';
}

void main() {
  const red = Color(255, 0, 0);
  final darkRed = red.withOpacity(0.5);

  print(red);     // Color(r:255, g:0, b:0)
  print(darkRed); // Color(r:128, g:0, b:0)
}
```

---

## 5. 메서드 (Method)

### 5.1 인스턴스 메서드

인스턴스의 상태를 읽거나 변경하는 함수입니다. `this`를 통해 인스턴스 필드에 접근합니다.

```dart
class Temperature {
  double _celsius;  // private 필드 (6절에서 설명)

  Temperature(this._celsius);

  double toCelsius()    => _celsius;
  double toFahrenheit() => _celsius * 9 / 5 + 32;
  double toKelvin()     => _celsius + 273.15;

  void increase(double amount) => _celsius += amount;
  void decrease(double amount) => _celsius -= amount;
}

void main() {
  var temp = Temperature(100);
  print(temp.toCelsius());    // 100.0
  print(temp.toFahrenheit()); // 212.0
  print(temp.toKelvin());     // 373.15

  temp.increase(20);
  print(temp.toCelsius());    // 120.0
}
```

---

### 5.2 정적 메서드 `static`

인스턴스 없이 **클래스명으로 직접 호출**하는 메서드입니다. 인스턴스 상태에 접근하지 않는 유틸리티 함수에 적합합니다.

```dart
class MathUtils {
  // static 메서드 — 인스턴스 불필요
  static double clamp(double value, double min, double max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  static double lerp(double a, double b, double t) => a + (b - a) * t;

  static bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {
      if (n % i == 0) return false;
    }
    return true;
  }
}

void main() {
  // 인스턴스 생성 없이 클래스명으로 호출
  print(MathUtils.clamp(150, 0, 100));  // 100.0
  print(MathUtils.lerp(0, 10, 0.3));   // 3.0
  print(MathUtils.isPrime(17));         // true
  print(MathUtils.isPrime(18));         // false
}
```

> ⚠️ **설계 주의**: `static` 메서드가 너무 많은 클래스는 OOP 원칙에서 벗어난 절차적 스타일이 됩니다. 인스턴스 상태와 무관한 순수 유틸리티 함수에만 제한적으로 사용하세요.

---

### 5.3 getter / setter

필드를 직접 공개하는 대신 **제어된 읽기/쓰기** 인터페이스를 제공합니다. 외부에서는 필드처럼 보이지만 내부적으로 로직을 포함할 수 있습니다.

```dart
class Rectangle {
  double _width;
  double _height;

  Rectangle(this._width, this._height);

  // getter — 읽기 전용 인터페이스
  double get width  => _width;
  double get height => _height;
  double get area   => _width * _height;
  double get perimeter => 2 * (_width + _height);

  // setter — 유효성 검사 포함 쓰기 인터페이스
  set width(double value) {
    if (value <= 0) throw ArgumentError('너비는 0보다 커야 합니다: $value');
    _width = value;
  }

  set height(double value) {
    if (value <= 0) throw ArgumentError('높이는 0보다 커야 합니다: $value');
    _height = value;
  }
}

void main() {
  var rect = Rectangle(10, 5);

  // getter — 필드처럼 접근 (괄호 없음)
  print(rect.width);      // 10.0
  print(rect.area);       // 50.0
  print(rect.perimeter);  // 30.0

  // setter — 대입처럼 사용
  rect.width = 20;
  print(rect.area);       // 100.0

  // 유효성 검사 동작
  try {
    rect.width = -5;      // ArgumentError 발생
  } catch (e) {
    print(e);             // Invalid argument(s): 너비는 0보다 커야 합니다: -5.0
  }

  // ❌ 읽기 전용 getter에 대입 불가
  // rect.area = 200;     // 컴파일 오류 — setter 없음
}
```

**getter만 있는 계산 프로퍼티 패턴**

```dart
class Circle {
  final double radius;
  Circle(this.radius);

  // 계산 결과를 getter로 노출 — 별도 저장 없음
  double get diameter    => radius * 2;
  double get area        => 3.14159 * radius * radius;
  bool   get isUnitCircle => radius == 1.0;
}
```

**필드 직접 공개 vs getter/setter 비교**

| 방식           | 장점                                | 단점                             |
| -------------- | ----------------------------------- | -------------------------------- |
| 필드 직접 공개 | 간결함                              | 유효성 검사 불가, 내부 구현 노출 |
| getter/setter  | 캡슐화, 유효성 검사, 읽기 전용 지원 | 코드량 증가                      |
| getter만       | 읽기 전용 프로퍼티, 계산 프로퍼티   | —                                |

---

## 6. 접근 제한자 — Dart의 private

Dart에는 `public`, `private`, `protected` 키워드가 없습니다. 대신 **이름 앞에 밑줄(`_`)** 을 붙이면 해당 **라이브러리(파일) 내에서만** 접근 가능한 private 멤버가 됩니다.

```dart
class BankAccount {
  final String owner;    // public — 외부 접근 가능
  double _balance;       // private — 같은 파일 내에서만 접근 가능

  BankAccount(this.owner, this._balance);

  // public 메서드로 제어된 접근 제공
  double get balance => _balance;

  void deposit(double amount) {
    _validateAmount(amount);  // private 메서드 호출
    _balance += amount;
  }

  void withdraw(double amount) {
    _validateAmount(amount);
    if (amount > _balance) throw StateError('잔액 부족');
    _balance -= amount;
  }

  // private 메서드 — 내부 로직
  void _validateAmount(double amount) {
    if (amount <= 0) throw ArgumentError('금액은 0보다 커야 합니다');
  }
}

void main() {
  var account = BankAccount('홍길동', 100000);

  print(account.owner);    // ✅ 홍길동
  print(account.balance);  // ✅ 100000.0 (getter)
  // print(account._balance); // ⚠️ 같은 파일이면 접근 가능, 다른 파일이면 접근 불가
  // account._validateAmount(0); // ⚠️ 동일
}
```

**Dart private의 특성 — 라이브러리 수준**

```
Java/Kotlin의 private: 클래스 내부에서만 접근 가능
Dart의 _ (private):    같은 .dart 파일(라이브러리) 내에서 접근 가능

실무 의미:
  lib/models/account.dart 에 정의된 _balance는
  같은 파일 내 다른 클래스에서는 접근 가능
  lib/screens/home.dart 에서는 접근 불가
```

**언제 private을 사용하는가?**

```dart
class UserProfile {
  // ✅ public — 외부에서 읽어야 하는 정보
  final String id;
  final String displayName;

  // ✅ private — 외부에서 직접 수정하면 안 되는 내부 상태
  String _encryptedPassword;
  int _loginFailCount = 0;

  // ✅ public getter — 안전하게 외부 노출
  bool get isLocked => _loginFailCount >= 5;

  UserProfile({
    required this.id,
    required this.displayName,
    required String password,
  }) : _encryptedPassword = _hash(password);

  static String _hash(String input) => '**hashed**$input';

  bool authenticate(String password) {
    if (isLocked) return false;
    if (_encryptedPassword != _hash(password)) {
      _loginFailCount++;
      return false;
    }
    _loginFailCount = 0;
    return true;
  }
}
```

---

## 7. 객체 동등성 — `==` 재정의

Dart의 기본 `==`는 **참조 동등성(Reference Equality)** 을 비교합니다. 같은 내용이어도 다른 인스턴스면 `false`입니다.

```dart
class Point {
  final int x;
  final int y;
  Point(this.x, this.y);
}

void main() {
  var p1 = Point(1, 2);
  var p2 = Point(1, 2);  // 같은 값, 다른 인스턴스

  print(p1 == p2);         // false — 기본 참조 비교
  print(identical(p1, p2)); // false
}
```

**`==`와 `hashCode` 재정의 — 값 동등성 구현**

`==`를 재정의할 때는 반드시 `hashCode`도 함께 재정의해야 합니다. `Map`의 키나 `Set`의 요소로 사용할 때 올바르게 동작하기 위한 계약입니다.

```dart
class Point {
  final int x;
  final int y;

  const Point(this.x, this.y);

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;  // 동일 참조면 즉시 true
    if (other is! Point) return false;         // 타입이 다르면 false
    return x == other.x && y == other.y;       // 값 비교
  }

  @override
  int get hashCode => Object.hash(x, y);  // x, y 기반 해시

  @override
  String toString() => 'Point($x, $y)';
}

void main() {
  var p1 = Point(1, 2);
  var p2 = Point(1, 2);
  var p3 = Point(3, 4);

  print(p1 == p2);  // true  — 값 동등성
  print(p1 == p3);  // false

  // Set과 Map에서 올바른 동작
  Set<Point> points = {p1, p2, p3};  // p1과 p2는 동일하므로 하나만 저장
  print(points.length);  // 2 — {Point(1, 2), Point(3, 4)}

  Map<Point, String> labels = {p1: 'origin'};
  print(labels[p2]);  // origin — p2가 p1과 같으므로 조회 성공
}
```

**`==` 재정의 규칙**

```
1. 반사성:  a == a          → 항상 true
2. 대칭성:  a == b → b == a
3. 추이성:  a == b, b == c → a == c
4. null:   a == null       → 항상 false (non-null 객체)
```

---

## 8. `toString()` 재정의

기본 `toString()`은 `Instance of 'ClassName'`을 반환합니다. 디버깅과 로깅을 위해 의미 있는 문자열을 반환하도록 재정의합니다.

```dart
class Product {
  final String name;
  final double price;
  final int stock;

  Product(this.name, this.price, this.stock);

  @override
  String toString() => 'Product(name: $name, price: ${price}원, stock: $stock개)';
}

void main() {
  var p = Product('노트북', 1200000, 5);

  // print()는 내부적으로 toString() 호출
  print(p);                    // Product(name: 노트북, price: 1200000.0원, stock: 5개)
  print('상품: $p');           // 문자열 보간에서도 toString() 호출
  print([p].toString());       // [Product(name: 노트북, ...)]

  // 재정의 전: Instance of 'Product'
  // 재정의 후: Product(name: 노트북, price: 1200000.0원, stock: 5개)
}
```

---

## 9. 클래스 설계 원칙

### 단일 책임 원칙 (SRP — Single Responsibility Principle)

클래스는 **하나의 책임**만 가져야 합니다. 책임이 여럿이면 변경 이유도 여럿이 되어 유지보수가 어려워집니다.

```dart
// ❌ 나쁜 설계 — 한 클래스가 너무 많은 책임
class UserManager {
  void saveToDatabase(User user) { ... }  // DB 저장
  void sendEmail(User user) { ... }       // 이메일 발송
  void validateUser(User user) { ... }    // 유효성 검사
  void renderUserCard(User user) { ... }  // UI 렌더링
}

// ✅ 좋은 설계 — 책임 분리
class UserRepository { void save(User user) { ... } }
class EmailService    { void send(User user) { ... } }
class UserValidator   { bool validate(User user) { ... } }
```

### 캡슐화 원칙 적용 체크리스트

```
✅ 외부에서 직접 수정하면 안 되는 필드는 private(_)으로 선언했는가?
✅ private 필드에 접근이 필요하면 getter로 읽기 전용으로 노출했는가?
✅ 쓰기가 필요한 경우 setter에서 유효성 검사를 포함했는가?
✅ 내부 구현 메서드는 private으로 숨겼는가?
✅ public 인터페이스는 최소한으로 유지했는가?
```

### 클래스 설계 시 자주 하는 실수

```dart
// ❌ 모든 필드를 public으로 노출
class Order {
  int status;     // 0=대기, 1=처리중, 2=완료 — 직접 수정 시 유효하지 않은 값 가능
  double total;   // 직접 수정 가능 — 논리적 오류 발생 가능
}

// ✅ 제어된 상태 전환
class Order {
  int _status = 0;
  double _total;
  List<OrderItem> _items = [];

  Order() : _total = 0;

  int get status => _status;
  double get total => _total;
  List<OrderItem> get items => List.unmodifiable(_items);

  void addItem(OrderItem item) {
    _items.add(item);
    _total += item.price;
  }

  void confirm() {
    if (_status != 0) throw StateError('대기 중인 주문만 확정 가능합니다');
    _status = 1;
  }

  void complete() {
    if (_status != 1) throw StateError('처리 중인 주문만 완료 가능합니다');
    _status = 2;
  }
}
```

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 10-1: `toString()` / `==` / `hashCode` 구현

아래 `Student` 클래스에 `toString()`, `==`, `hashCode`를 구현하세요.

```dart
class Student {
  final String id;
  final String name;
  final double gpa;

  Student(this.id, this.name, this.gpa);

  // TODO: toString() 구현 — "Student(id: S001, name: 홍길동, gpa: 3.8)"
  // TODO: == 구현 — id가 같으면 동일 학생
  // TODO: hashCode 구현
}

void main() {
  var s1 = Student('S001', '홍길동', 3.8);
  var s2 = Student('S001', '홍길동', 3.8);  // 동일 학생
  var s3 = Student('S002', '김철수', 3.5);

  print(s1);           // Student(id: S001, name: 홍길동, gpa: 3.8)
  print(s1 == s2);     // true
  print(s1 == s3);     // false

  Set<Student> roster = {s1, s2, s3};
  print(roster.length); // 2 — s1과 s2는 동일
}
```

> **정답 힌트**
>
> ```dart
> @override
> String toString() => 'Student(id: $id, name: $name, gpa: $gpa)';
>
> @override
> bool operator ==(Object other) {
>   if (identical(this, other)) return true;
>   if (other is! Student) return false;
>   return id == other.id;
> }
>
> @override
> int get hashCode => id.hashCode;
> ```

### 실습 10-2: getter / setter와 캡슐화

아래 요구사항을 만족하는 `Thermostat` 클래스를 작성하세요.

**요구사항**

- 온도는 `-50.0`~`100.0` 범위만 허용, 범위 초과 시 `ArgumentError`
- 온도는 private 필드로 저장
- 섭씨(`celsius`) getter/setter, 화씨(`fahrenheit`) getter 제공
- `toString()`은 `"Thermostat: 25.0°C (77.0°F)"` 형태

> **정답 힌트**
>
> ```dart
> class Thermostat {
>   double _celsius;
>
>   Thermostat(double initial) : _celsius = 0 {
>     celsius = initial;  // setter로 유효성 검사
>   }
>
>   double get celsius => _celsius;
>   set celsius(double value) {
>     if (value < -50 || value > 100) {
>       throw ArgumentError('온도 범위 초과: $value (허용: -50~100)');
>     }
>     _celsius = value;
>   }
>
>   double get fahrenheit => _celsius * 9 / 5 + 32;
>
>   @override
>   String toString() =>
>       'Thermostat: ${_celsius}°C (${fahrenheit.toStringAsFixed(1)}°F)';
> }
> ```

### 실습 10-3: 설계 문제 — `ShoppingCart`

아래 요구사항을 만족하는 `ShoppingCart` 클래스를 직접 설계하고 구현하세요. (정답 힌트 없음 — 자유 설계)

**요구사항**

- 상품 추가 / 삭제
- 전체 금액 조회 (getter)
- 담긴 상품 목록은 외부에서 수정 불가 (읽기 전용 노출)
- 같은 상품은 수량 합산
- `toString()`으로 장바구니 내역 출력

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념              | 핵심 내용                                        |
| ----------------- | ------------------------------------------------ |
| `class`           | 필드 + 메서드 + 생성자를 묶는 설계도             |
| 인스턴스          | `클래스명(인수)` 로 생성, 힙에 저장, 독립적 상태 |
| `this`            | 현재 인스턴스 참조, `this.필드` 초기화 관용구    |
| 인스턴스 필드     | 각 인스턴스마다 독립 존재                        |
| `static` 필드     | 클래스 자체에 하나, 모든 인스턴스 공유           |
| `final` 필드      | 초기화 후 변경 불가, 불변 객체의 기반            |
| 인스턴스 메서드   | 인스턴스 상태 접근·변경                          |
| `static` 메서드   | 인스턴스 없이 호출, 유틸리티 함수                |
| getter            | 계산 프로퍼티, 읽기 전용 노출                    |
| setter            | 유효성 검사 포함 쓰기 인터페이스                 |
| `_` (private)     | 같은 파일(라이브러리) 내 접근 제한               |
| `==` / `hashCode` | 값 동등성 구현, Set/Map 올바른 동작              |
| `toString()`      | 디버깅용 문자열 표현                             |

### 🔗 다음 단계

> **Step 9 — 생성자(Constructor) 패턴**으로 이동하세요.

Step 9에서는 Dart 생성자의 다양한 패턴을 심화 학습합니다. `this.필드` 초기화 리스트, Named constructor로 여러 생성 방식 제공, `const` constructor로 Flutter 위젯 최적화, `factory` constructor로 싱글톤·서브클래스 반환 패턴을 다룹니다. 이는 Step 10의 OOP 확장 및 실전 과제 2(도서 관리 시스템) 구현의 직접적 기반입니다.

### 📚 참고 자료

| 자료                  | 링크                                                    |
| --------------------- | ------------------------------------------------------- |
| Dart 클래스 공식 문서 | <https://dart.dev/language/classes>                     |
| Dart getter/setter    | <https://dart.dev/language/methods#getters-and-setters> |
| Dart 연산자 재정의    | <https://dart.dev/language/methods#operators>           |
| Effective Dart — 설계 | <https://dart.dev/effective-dart/design>                |
| DartPad 온라인 실습   | <https://dartpad.dev>                                   |

### ❓ 자가진단 퀴즈

1. **[Remember]** Dart에서 private 멤버를 선언하는 방법과, Java의 `private` 키워드와의 차이점은 무엇인가?
2. **[Remember]** `static` 멤버를 인스턴스를 통해 접근하면 어떻게 되는가? (`instance.staticField`)
3. **[Understand]** getter만 제공하고 setter를 제공하지 않는 것이 필드를 `final`로 선언하는 것과 어떤 점이 다른가?
4. **[Understand]** `==`를 재정의할 때 `hashCode`도 함께 재정의해야 하는 이유를 `Set`과 `Map`의 동작 원리와 연결해 설명하라.
5. **[Apply]** `static`과 인스턴스 멤버를 혼합해 아래 동작을 하는 `Counter` 클래스를 작성하라.
   - 각 인스턴스는 독립적인 카운트를 가진다
   - 모든 인스턴스의 총 생성 횟수를 `static`으로 추적한다
   - `increment()`, `reset()`, `count` getter 제공

> **5번 정답 힌트**
>
> ```dart
> class Counter {
>   static int totalCreated = 0;
>   int _count = 0;
>
>   Counter() {
>     totalCreated++;
>   }
>
>   int get count => _count;
>   void increment() => _count++;
>   void reset() => _count = 0;
> }
>
> void main() {
>   var c1 = Counter()..increment()..increment();
>   var c2 = Counter()..increment();
>
>   print(c1.count);          // 2
>   print(c2.count);          // 1
>   print(Counter.totalCreated); // 2
> }
> ```

---

> ⬅️ [Step 7 — Collection 고급 및 함수형 프로그래밍](#) | ➡️ [Step 9 — 생성자 패턴 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Classes, Methods) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
