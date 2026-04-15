# Step 10 — OOP 확장

> **Phase 2 | 컬렉션과 객체지향** | 예상 소요: 2일 | 블룸 수준: Analyze ~ Evaluate

---

## 📋 목차

- [Step 10 — OOP 확장](#step-10--oop-확장)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [코드를 재사용하는 세 가지 방법](#코드를-재사용하는-세-가지-방법)
  - [3. `extends` — 상속](#3-extends--상속)
    - [3.1 기본 상속 구조](#31-기본-상속-구조)
    - [3.2 `super` — 부모 클래스 접근](#32-super--부모-클래스-접근)
    - [3.3 메서드 오버라이딩 `@override`](#33-메서드-오버라이딩-override)
    - [3.4 상속 체인과 생성자 전달](#34-상속-체인과-생성자-전달)
  - [4. `abstract class` — 추상 클래스](#4-abstract-class--추상-클래스)
    - [4.1 추상 메서드와 구체 메서드](#41-추상-메서드와-구체-메서드)
    - [4.2 추상 클래스의 역할](#42-추상-클래스의-역할)
  - [5. `implements` — 인터페이스](#5-implements--인터페이스)
    - [5.1 인터페이스로서의 클래스](#51-인터페이스로서의-클래스)
    - [5.2 다중 구현](#52-다중-구현)
  - [6. 세 메커니즘 비교 및 선택 기준](#6-세-메커니즘-비교-및-선택-기준)
  - [7. 다형성 (Polymorphism)](#7-다형성-polymorphism)
  - [8. 설계 안티패턴 — 상속의 함정](#8-설계-안티패턴--상속의-함정)
    - [안티패턴 1: IS-A 관계가 아닌 곳에 상속 사용](#안티패턴-1-is-a-관계가-아닌-곳에-상속-사용)
    - [안티패턴 2: 지나치게 깊은 상속 계층](#안티패턴-2-지나치게-깊은-상속-계층)
    - [리스코프 치환 원칙 (LSP)](#리스코프-치환-원칙-lsp)
  - [9. 실습 — 🎯 실전 과제 2](#9-실습---실전-과제-2)
    - [🎯 콘솔 도서 관리 시스템](#-콘솔-도서-관리-시스템)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🎯 Phase 2 완료 체크리스트](#-phase-2-완료-체크리스트)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                         |
| --- | ------------- | -------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `extends`, `implements`, `abstract`의 문법과 역할을 나열할 수 있다                           |
| 2   | 🟢 Understand | 세 메커니즘의 목적 차이(코드 재사용 vs 계약 강제)를 설명할 수 있다                           |
| 3   | 🟢 Understand | 다형성이 가능한 이유와 `@override`의 역할을 설명할 수 있다                                   |
| 4   | 🟡 Apply      | `abstract class`로 공통 계약을 정의하고 구체 클래스로 구현할 수 있다                         |
| 5   | 🟡 Apply      | `implements`로 다중 인터페이스를 구현하는 클래스를 설계할 수 있다                            |
| 6   | 🟠 Analyze    | `extends` vs `implements` vs `abstract`의 트레이드오프를 설계 요구사항에 맞게 분석할 수 있다 |
| 7   | 🔴 Evaluate   | 상속 계층이 지나치게 깊어질 때의 문제점을 평가하고 대안을 제안할 수 있다                     |

---

## 2. 서론

### 코드를 재사용하는 세 가지 방법

클래스를 설계할 때 두 클래스 사이의 관계를 표현하는 방법은 세 가지입니다.

![diagram](/developer-open-book/diagrams/step10-isa-relation.svg)

세 메커니즘은 목적이 다릅니다.

![diagram](/developer-open-book/diagrams/step10-three-mechanisms.svg)

이 셋을 적절히 조합하는 것이 견고한 OOP 설계의 핵심입니다.

> **전제 지식**: Step 8~9 완료 (클래스 기본, 생성자 패턴)

---

## 3. `extends` — 상속

### 3.1 기본 상속 구조

`extends`는 부모 클래스(Super class)의 **필드와 메서드를 자식 클래스(Sub class)가 물려받는** 메커니즘입니다.

```
부모 클래스 (Super / Parent / Base)
        │  extends
        ▼
자식 클래스 (Sub / Child / Derived)
  — 부모의 모든 public/protected 멤버 상속
  — 자신만의 필드/메서드 추가 가능
  — 부모 메서드 재정의 가능 (@override)
```

```dart
// 부모 클래스
class Animal {
  final String name;
  final int age;

  Animal({required this.name, required this.age});

  void breathe() => print('$name: 호흡 중...');
  void sleep()   => print('$name: 자는 중...');

  String get info => '$name (나이: $age)';
}

// 자식 클래스 — Animal을 상속
class Dog extends Animal {
  final String breed;

  Dog({required super.name, required super.age, required this.breed});

  // 새로운 메서드 추가
  void bark() => print('$name: 왈왈!');

  // 부모 메서드 재정의
  @override
  String get info => '${super.info}, 견종: $breed';
}

class Cat extends Animal {
  final bool isIndoor;

  Cat({required super.name, required super.age, this.isIndoor = true});

  void purr() => print('$name: 그르릉...');

  @override
  String get info => '${super.info}, ${isIndoor ? "실내묘" : "실외묘"}';
}

void main() {
  var dog = Dog(name: '바둑이', age: 3, breed: '진돗개');
  var cat = Cat(name: '나비', age: 5);

  // 상속된 메서드 사용
  dog.breathe();  // 바둑이: 호흡 중...
  cat.sleep();    // 나비: 자는 중...

  // 자식 클래스 전용 메서드
  dog.bark();     // 바둑이: 왈왈!
  cat.purr();     // 나비: 그르릉...

  // 재정의된 getter
  print(dog.info);  // 바둑이 (나이: 3), 견종: 진돗개
  print(cat.info);  // 나비 (나이: 5), 실내묘
}
```

---

### 3.2 `super` — 부모 클래스 접근

`super`는 부모 클래스의 멤버에 접근합니다. 생성자 전달과 오버라이딩된 메서드에서 부모 구현 호출 시 사용합니다.

```dart
class Vehicle {
  final String brand;
  int _speed = 0;

  Vehicle(this.brand);

  void accelerate(int amount) {
    _speed += amount;
    print('$brand: 속도 $_speed km/h');
  }

  int get speed => _speed;
}

class ElectricVehicle extends Vehicle {
  int _batteryLevel;

  // super.brand — 부모 생성자에 brand 전달
  ElectricVehicle(super.brand, {int battery = 100})
      : _batteryLevel = battery;

  @override
  void accelerate(int amount) {
    if (_batteryLevel <= 0) {
      print('$brand: 배터리 부족!');
      return;
    }
    super.accelerate(amount);    // 부모 구현 먼저 호출
    _batteryLevel -= amount ~/ 10;  // 추가 동작
    print('$brand: 배터리 $_batteryLevel%');
  }

  int get batteryLevel => _batteryLevel;
}

void main() {
  var ev = ElectricVehicle('Tesla', battery: 80);
  ev.accelerate(30);
  // Tesla: 속도 30 km/h
  // Tesla: 배터리 77%
}
```

**`super.파라미터` — Dart 2.17+ 간결한 문법**

```dart
// 기존 방식 — 부모 파라미터 반복 선언
class Cat extends Animal {
  Cat({required String name, required int age})
      : super(name: name, age: age);
}

// super 파라미터 문법 — 반복 제거 (권장)
class Cat extends Animal {
  Cat({required super.name, required super.age});
}
```

---

### 3.3 메서드 오버라이딩 `@override`

자식 클래스가 부모의 메서드를 **재정의**합니다. `@override` 어노테이션은 필수는 아니지만 **강력 권장**됩니다.

```dart
class Shape {
  String get name => 'Shape';
  double get area => 0;

  String describe() => '${name}: 넓이 = ${area.toStringAsFixed(2)}';
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);

  @override
  String get name => 'Circle';

  @override
  double get area => 3.14159 * radius * radius;
}

class Square extends Shape {
  final double side;
  Square(this.side);

  @override
  String get name => 'Square';

  @override
  double get area => side * side;

  // 부모 메서드에 내용 추가
  @override
  String describe() => '${super.describe()}, 한 변: $side';
}

void main() {
  List<Shape> shapes = [Circle(5), Square(4), Shape()];

  for (var s in shapes) {
    print(s.describe());
  }
  // Circle: 넓이 = 78.54
  // Square: 넓이 = 16.00, 한 변: 4.0
  // Shape: 넓이 = 0.00
}
```

**`@override`가 필요한 이유**

```dart
class Parent {
  void greet() => print('Hello from Parent');
}

class Child extends Parent {
  // @override 없이 재정의 — 컴파일은 되지만
  void greet() => print('Hello from Child');  // ⚠️ 경고 발생

  // 부모에 없는 메서드에 @override 사용 — 컴파일 오류로 즉시 발견
  // @override
  // void greett() => print('오타!');  // ❌ 부모에 greett() 없음 → 오류
}
```

> 📌 **규칙**: 부모 메서드를 재정의할 때 항상 `@override`를 명시하세요. 오타나 부모 인터페이스 변경 시 컴파일 오류로 즉시 감지됩니다.

---

### 3.4 상속 체인과 생성자 전달

```dart
class LivingThing {
  bool isAlive;
  LivingThing({this.isAlive = true});
}

class Animal extends LivingThing {
  final String name;
  Animal({required this.name, super.isAlive});
}

class Pet extends Animal {
  final String ownerName;
  Pet({required super.name, required this.ownerName, super.isAlive});
}

class GuideDog extends Pet {
  final String certificationId;
  GuideDog({
    required super.name,
    required super.ownerName,
    required this.certificationId,
  });
}

void main() {
  var dog = GuideDog(
    name: '럭키',
    ownerName: '홍길동',
    certificationId: 'GD-2024-001',
  );

  print(dog.name);            // 럭키 (Animal에서 상속)
  print(dog.ownerName);       // 홍길동 (Pet에서 상속)
  print(dog.isAlive);         // true (LivingThing에서 상속)
  print(dog.certificationId); // GD-2024-001 (자신의 필드)
}
```

**상속 깊이 주의**: 위처럼 4단계 이상 깊어지면 유지보수가 어려워집니다. 실무에서는 **2~3단계를 권장**합니다.

---

## 4. `abstract class` — 추상 클래스

### 4.1 추상 메서드와 구체 메서드

`abstract class`는 **직접 인스턴스를 만들 수 없는** 클래스입니다. 하위 클래스가 반드시 구현해야 할 메서드(추상 메서드)와 공통 구현(구체 메서드)을 함께 정의합니다.

```dart
abstract class PaymentMethod {
  final String accountId;

  PaymentMethod(this.accountId);

  // 추상 메서드 — 본문 없음, 하위 클래스가 반드시 구현
  bool processPayment(double amount);
  String get methodName;

  // 구체 메서드 — 공통 구현, 상속됨
  void printReceipt(double amount) {
    if (processPayment(amount)) {
      print('[$methodName] 결제 완료: ${amount}원 (계정: $accountId)');
    } else {
      print('[$methodName] 결제 실패: ${amount}원');
    }
  }

  // 로그 공통 구현
  void logTransaction(double amount) =>
      print('[LOG] $methodName 거래: ${amount}원');
}

class CreditCard extends PaymentMethod {
  final int creditLimit;
  double _balance;

  CreditCard(super.accountId, this.creditLimit)
      : _balance = creditLimit.toDouble();

  @override
  String get methodName => '신용카드';

  @override
  bool processPayment(double amount) {
    if (amount > _balance) return false;
    _balance -= amount;
    return true;
  }
}

class KakaoPay extends PaymentMethod {
  double _walletBalance;

  KakaoPay(super.accountId, double initialBalance)
      : _walletBalance = initialBalance;

  @override
  String get methodName => '카카오페이';

  @override
  bool processPayment(double amount) {
    if (amount > _walletBalance) return false;
    _walletBalance -= amount;
    return true;
  }
}

void main() {
  // ❌ abstract class는 직접 인스턴스 생성 불가
  // var pay = PaymentMethod('id');  // 컴파일 오류

  List<PaymentMethod> payments = [
    CreditCard('CC-001', 500000),
    KakaoPay('KP-001', 30000),
  ];

  for (var p in payments) {
    p.printReceipt(20000);  // 공통 구현 — 다형성
  }
  // [신용카드] 결제 완료: 20000.0원 (계정: CC-001)
  // [카카오페이] 결제 완료: 20000.0원 (계정: KP-001)
}
```

---

### 4.2 추상 클래스의 역할

추상 클래스는 두 역할을 동시에 수행합니다.

```
역할 1: 계약(Contract) 정의
  → 추상 메서드로 "무엇을 구현해야 하는가" 강제
  → 컴파일러가 미구현 시 즉시 오류 발생

역할 2: 공통 구현 제공
  → 구체 메서드로 공통 로직을 한 곳에 집중
  → 하위 클래스의 중복 코드 제거
```

```dart
// 추상 클래스 없을 때 — 중복과 계약 부재
class PdfExporter   { void export(String data) { /* pdf 로직 */ } }
class ExcelExporter { void save(String data)   { /* excel 로직 */ } }
// 메서드 이름도 다르고, 누락해도 컴파일 오류 없음

// 추상 클래스로 계약 정의
abstract class DataExporter {
  String get format;          // 추상 — 포맷 이름 강제
  void export(String data);   // 추상 — 내보내기 로직 강제

  void exportWithLog(String data) {  // 구체 — 공통 로직
    print('[$format] 내보내기 시작...');
    export(data);
    print('[$format] 완료');
  }
}

class PdfExporter extends DataExporter {
  @override String get format => 'PDF';
  @override void export(String data) => print('PDF 생성: $data');
}

class ExcelExporter extends DataExporter {
  @override String get format => 'Excel';
  @override void export(String data) => print('Excel 생성: $data');
}
```

---

## 5. `implements` — 인터페이스

### 5.1 인터페이스로서의 클래스

Dart에서는 별도의 `interface` 키워드가 없습니다. **모든 클래스가 암묵적으로 인터페이스를 정의**합니다. `implements`는 해당 클래스의 공개 API 계약을 따르겠다는 선언입니다.

```
extends:    부모의 구현을 물려받음 (is-a + 구현 재사용)
implements: 계약(API)만 따름, 모든 멤버를 직접 구현해야 함
```

```dart
class Flyable {
  void fly() => print('날고 있습니다');
  double get maxAltitude => 0;
}

class Swimmable {
  void swim() => print('헤엄치고 있습니다');
  double get maxDepth => 0;
}

// implements — Flyable의 모든 멤버를 직접 구현해야 함
class Eagle implements Flyable {
  @override
  void fly() => print('독수리가 날개를 펼칩니다');  // 직접 구현 필수

  @override
  double get maxAltitude => 3000;                     // 직접 구현 필수
}

// extends — Flyable의 구현을 물려받음
class Parrot extends Flyable {
  // fly()와 maxAltitude를 재정의하지 않으면 부모 구현 그대로 사용
  @override
  void fly() => print('앵무새가 푸드덕 납니다');
}

void main() {
  var eagle  = Eagle();
  var parrot = Parrot();

  eagle.fly();   // 독수리가 날개를 펼칩니다
  parrot.fly();  // 앵무새가 푸드덕 납니다
}
```

---

### 5.2 다중 구현

Dart는 **단일 상속**만 지원하지만, `implements`는 여러 인터페이스를 동시에 구현할 수 있습니다.

```dart
abstract class Printable {
  void print();
}

abstract class Serializable {
  String serialize();
  void deserialize(String data);
}

abstract class Cacheable {
  String get cacheKey;
  Duration get cacheDuration;
}

// 세 인터페이스 동시 구현
class UserProfile implements Printable, Serializable, Cacheable {
  final String id;
  final String name;
  int age;

  UserProfile({required this.id, required this.name, required this.age});

  @override
  void print() => dart_print('UserProfile($id, $name, $age)');

  @override
  String serialize() => '{"id":"$id","name":"$name","age":$age}';

  @override
  void deserialize(String data) => dart_print('역직렬화: $data');

  @override
  String get cacheKey => 'user_$id';

  @override
  Duration get cacheDuration => const Duration(minutes: 30);
}

// print는 dart의 내장 함수와 이름 충돌 방지용 별칭
void dart_print(String s) => print(s);

void main() {
  var user = UserProfile(id: 'u001', name: '홍길동', age: 30);

  // 각 인터페이스 타입으로 다형성 활용
  Printable p = user;
  p.print();               // UserProfile(u001, 홍길동, 30)

  Serializable s = user;
  print(s.serialize());    // {"id":"u001","name":"홍길동","age":30}

  Cacheable c = user;
  print(c.cacheKey);       // user_u001
}
```

**`extends`와 `implements` 혼합**

```dart
abstract class Animal {
  final String name;
  Animal(this.name);
  void breathe() => print('$name: 호흡');
}

abstract class Swimmable {
  void swim();
}

abstract class Flyable {
  void fly();
}

// 상속 + 다중 인터페이스 구현
class Duck extends Animal implements Swimmable, Flyable {
  Duck(super.name);

  @override
  void swim() => print('$name: 수영 중');

  @override
  void fly() => print('$name: 비행 중');
}

void main() {
  var duck = Duck('도널드');
  duck.breathe();  // 도널드: 호흡 (Animal에서 상속)
  duck.swim();     // 도널드: 수영 중
  duck.fly();      // 도널드: 비행 중

  // 모든 타입으로 참조 가능 — 다형성
  Animal  a = duck;
  Swimmable sw = duck;
  Flyable  fl = duck;
}
```

---

## 6. 세 메커니즘 비교 및 선택 기준

![diagram](/developer-open-book/diagrams/step10-mechanism-comparison.svg)

**선택 기준 — 세 가지 질문**

```
1. "공통 구현(코드)을 물려주고 싶은가?"
   YES → extends 또는 abstract class (구체 메서드)

2. "직접 인스턴스를 만들지 못하게 막고 싶은가?"
   YES → abstract class

3. "한 클래스가 여러 역할(계약)을 수행해야 하는가?"
   YES → implements (다중 구현)
```

**실무 설계 가이드라인**

```dart
// ✅ 패턴 1: abstract class + extends
// 공통 로직이 있고 계층 구조가 명확할 때
abstract class Repository<T> {
  Future<T?> findById(String id);          // 추상 — 구현 강제
  Future<List<T>> findAll();              // 추상
  Future<void> save(T entity);            // 추상
  Future<void> delete(String id);         // 추상

  Future<bool> exists(String id) async {   // 구체 — 공통 로직
    return (await findById(id)) != null;
  }
}

// ✅ 패턴 2: implements
// 다중 역할이 필요하거나 외부 클래스를 계약에 맞게 적용할 때
abstract class Loggable   { void log(String msg); }
abstract class Disposable { void dispose(); }

class NetworkService implements Loggable, Disposable {
  @override void log(String msg)  => print('[NET] $msg');
  @override void dispose()        => print('연결 종료');
}

// ✅ 패턴 3: extends + implements 조합
// IS-A 관계 + 추가 계약이 모두 필요할 때
abstract class BaseWidget {
  void render();
  void update() => print('업데이트');  // 공통 구현
}

abstract class Clickable { void onClick(); }
abstract class Hoverable  { void onHover(); }

class Button extends BaseWidget implements Clickable, Hoverable {
  @override void render()   => print('버튼 렌더링');
  @override void onClick()  => print('클릭됨');
  @override void onHover()  => print('호버됨');
}
```

---

## 7. 다형성 (Polymorphism)

다형성은 **같은 타입의 변수가 다양한 형태의 객체를 참조**하고, 실제 타입에 맞는 메서드가 호출되는 성질입니다. `extends`와 `implements` 모두에서 동작합니다.

```dart
abstract class Notification {
  final String message;
  Notification(this.message);

  void send();                    // 추상 — 구현 강제
  String get channel;             // 추상

  void sendWithLog() {            // 구체 — 공통 로직
    print('[$channel] 발송 중: $message');
    send();
  }
}

class PushNotification extends Notification {
  final String deviceToken;
  PushNotification(super.message, this.deviceToken);

  @override String get channel => 'PUSH';
  @override void send() => print('푸시 전송 → $deviceToken');
}

class EmailNotification extends Notification {
  final String email;
  EmailNotification(super.message, this.email);

  @override String get channel => 'EMAIL';
  @override void send() => print('이메일 전송 → $email');
}

class SmsNotification extends Notification {
  final String phone;
  SmsNotification(super.message, this.phone);

  @override String get channel => 'SMS';
  @override void send() => print('SMS 전송 → $phone');
}

void main() {
  // 다형성 — Notification 타입으로 다양한 구현체 관리
  List<Notification> alerts = [
    PushNotification('앱 업데이트', 'device-abc'),
    EmailNotification('영수증', 'user@dart.dev'),
    SmsNotification('인증번호: 1234', '010-1234-5678'),
  ];

  // 동일한 호출 — 실제 타입에 맞는 send() 실행
  for (var n in alerts) {
    n.sendWithLog();
  }
  // [PUSH] 발송 중: 앱 업데이트
  // 푸시 전송 → device-abc
  // [EMAIL] 발송 중: 영수증
  // 이메일 전송 → user@dart.dev
  // [SMS] 발송 중: 인증번호: 1234
  // SMS 전송 → 010-1234-5678

  // 타입 검사와 다운캐스팅
  for (var n in alerts) {
    if (n is EmailNotification) {
      print('이메일 주소: ${n.email}');  // 타입 승격으로 email 접근
    }
  }
}
```

---

## 8. 설계 안티패턴 — 상속의 함정

상속은 강력하지만 **잘못 사용하면 코드를 더 복잡하게** 만듭니다.

### 안티패턴 1: IS-A 관계가 아닌 곳에 상속 사용

```dart
// ❌ 잘못된 설계 — Stack은 List가 아니다
class Stack<T> extends List<T> {
  T pop() => removeLast();   // List의 모든 메서드가 노출됨
  void push(T item) => add(item);
}
// Stack.insert(), Stack.shuffle() 등 의미 없는 메서드가 모두 공개됨

// ✅ 올바른 설계 — 컴포지션(Composition) 활용
class Stack<T> {
  final List<T> _items = [];   // 상속 대신 포함
  void push(T item) => _items.add(item);
  T pop() => _items.removeLast();
  T get peek => _items.last;
  bool get isEmpty => _items.isEmpty;
  int get length => _items.length;
}
```

### 안티패턴 2: 지나치게 깊은 상속 계층

```dart
// ❌ 4단계 이상 상속 — 유지보수 악몽
// Vehicle → MotorVehicle → Car → ElectricCar → TeslaModelS

// ✅ 컴포지션 + 인터페이스로 분리
abstract class Driveable { void drive(); }
abstract class Chargeable { void charge(); }

class Engine { void start() => print('엔진 시작'); }
class Battery { int level = 100; }

class ElectricCar implements Driveable, Chargeable {
  final Engine engine;
  final Battery battery;
  final String model;

  ElectricCar(this.model)
      : engine = Engine(),
        battery = Battery();

  @override void drive()  => print('$model: 주행 중');
  @override void charge() => battery.level = 100;
}
```

### 리스코프 치환 원칙 (LSP)

상속이 올바르게 사용됐는지 확인하는 원칙입니다.

```
부모 타입 변수에 자식 타입 인스턴스를 넣어도
프로그램이 올바르게 동작해야 한다.
```

```dart
// ❌ LSP 위반 — Rectangle을 상속한 Square가 동작을 변경
class Rectangle2 {
  double width;
  double height;
  Rectangle2(this.width, this.height);
  double get area => width * height;
}

class Square2 extends Rectangle2 {
  Square2(double side) : super(side, side);

  // width 변경 시 height도 변경 — 부모 계약 위반
  @override
  set width(double value) {
    super.width = value;
    super.height = value;  // 부모 Rectangle의 기대를 깨뜨림
  }
}

// 부모 타입으로 사용 시 기대와 다른 결과
void resizeWidth(Rectangle2 r, double newWidth) {
  r.width = newWidth;
  // 기대: height는 변하지 않는다
  // Square2 인스턴스라면: height도 바뀜 → LSP 위반
}
```

---

## 9. 실습 — 🎯 실전 과제 2

> Phase 2 최종 과제 | Step 6~10 종합 활용

### 🎯 콘솔 도서 관리 시스템

**학습 목표 통합**: 클래스 상속(`extends`), 추상 클래스(`abstract`), 컬렉션(`List`/`Map`), 함수형 메서드 (`where`, `map`, `fold`)를 모두 활용합니다.

---

**요구사항**

```
1. 도서(Book) — 제목, 저자, ISBN, 장르, 대출 가능 여부
2. 전자책(EBook) — Book 상속 + 파일 크기(MB), 포맷(PDF/EPUB)
3. 오디오북(AudioBook) — Book 상속 + 재생 시간(분), 나레이터
4. LibrarySystem — 도서 관리 시스템
   - 도서 추가 / ISBN으로 검색 / 장르별 조회
   - 대출 / 반납 처리
   - 통계: 전체 도서 수, 대출 가능 수, 장르별 수
```

---

**구현 힌트**

```dart
// ── 추상 기반 클래스 ──
abstract class LibraryItem {
  final String isbn;
  final String title;
  final String author;
  final String genre;
  bool _isAvailable;

  LibraryItem({
    required this.isbn,
    required this.title,
    required this.author,
    required this.genre,
    bool isAvailable = true,
  }) : _isAvailable = isAvailable;

  bool get isAvailable => _isAvailable;

  // 추상 — 각 아이템 종류마다 다르게 구현
  String get itemType;
  String get details;

  // 구체 — 공통 대출/반납 로직
  bool checkOut() {
    if (!_isAvailable) return false;
    _isAvailable = false;
    return true;
  }

  void returnItem() => _isAvailable = true;

  @override
  String toString() =>
      '[$itemType] "$title" by $author (ISBN: $isbn) '
      '— ${_isAvailable ? "대출가능" : "대출중"}';
}

// ── Book 클래스 ──
class Book extends LibraryItem {
  final int pages;

  Book({
    required super.isbn,
    required super.title,
    required super.author,
    required super.genre,
    required this.pages,
  });

  @override String get itemType => '도서';
  @override String get details  => '$pages 페이지';
}

// ── EBook 클래스 ──
class EBook extends Book {
  final double fileSizeMb;
  final String format;  // 'PDF' or 'EPUB'

  EBook({
    required super.isbn,
    required super.title,
    required super.author,
    required super.genre,
    required super.pages,
    required this.fileSizeMb,
    required this.format,
  });

  @override String get itemType => '전자책';
  @override String get details  =>
      '${super.details}, ${fileSizeMb}MB, $format';
}

// ── AudioBook 클래스 ──
class AudioBook extends LibraryItem {
  final int durationMinutes;
  final String narrator;

  AudioBook({
    required super.isbn,
    required super.title,
    required super.author,
    required super.genre,
    required this.durationMinutes,
    required this.narrator,
  });

  @override String get itemType => '오디오북';
  @override String get details  =>
      '${durationMinutes}분, 나레이터: $narrator';
}

// ── LibrarySystem ──
class LibrarySystem {
  final Map<String, LibraryItem> _catalog = {};  // ISBN → Item

  // 추가
  void addItem(LibraryItem item) {
    if (_catalog.containsKey(item.isbn)) {
      print('이미 등록된 ISBN: ${item.isbn}');
      return;
    }
    _catalog[item.isbn] = item;
    print('등록 완료: ${item.title}');
  }

  // ISBN으로 검색
  LibraryItem? findByIsbn(String isbn) => _catalog[isbn];

  // 장르별 조회 — where + toList
  List<LibraryItem> findByGenre(String genre) => _catalog.values
      .where((item) => item.genre == genre)
      .toList();

  // 대출 가능 목록
  List<LibraryItem> get availableItems => _catalog.values
      .where((item) => item.isAvailable)
      .toList();

  // 대출 처리
  bool checkOut(String isbn) {
    final item = _catalog[isbn];
    if (item == null) { print('ISBN $isbn 미등록'); return false; }
    final success = item.checkOut();
    print(success
        ? '대출 완료: ${item.title}'
        : '대출 불가: ${item.title} (이미 대출 중)');
    return success;
  }

  // 반납 처리
  void returnItem(String isbn) {
    final item = _catalog[isbn];
    if (item == null) { print('ISBN $isbn 미등록'); return; }
    item.returnItem();
    print('반납 완료: ${item.title}');
  }

  // 통계
  void printStats() {
    final total     = _catalog.length;
    final available = availableItems.length;

    // fold로 장르별 카운트
    final genreCount = _catalog.values.fold(
      <String, int>{},
      (map, item) {
        map[item.genre] = (map[item.genre] ?? 0) + 1;
        return map;
      },
    );

    print('\n── 도서관 통계 ──');
    print('전체 도서: $total권');
    print('대출 가능: $available권 / 대출 중: ${total - available}권');
    print('장르별:');
    genreCount.forEach((genre, count) => print('  $genre: $count권'));
  }

  // 전체 목록 출력
  void printAll() {
    print('\n── 전체 목록 ──');
    for (var item in _catalog.values) {
      print('$item (${item.details})');
    }
  }
}

// ── 메인 실행 ──
void main() {
  final library = LibrarySystem();

  // 도서 등록
  library.addItem(Book(
    isbn: '978-0-001', title: '다트 프로그래밍',
    author: '홍길동', genre: '기술', pages: 350,
  ));
  library.addItem(EBook(
    isbn: '978-0-002', title: 'Flutter 완전 정복',
    author: '김철수', genre: '기술', pages: 480,
    fileSizeMb: 12.5, format: 'EPUB',
  ));
  library.addItem(AudioBook(
    isbn: '978-0-003', title: '클린 코드',
    author: 'Robert C. Martin', genre: '기술',
    durationMinutes: 690, narrator: '이영희',
  ));
  library.addItem(Book(
    isbn: '978-0-004', title: '어린 왕자',
    author: '생텍쥐페리', genre: '문학', pages: 96,
  ));

  // 전체 목록
  library.printAll();

  // 대출 처리
  print('\n── 대출 처리 ──');
  library.checkOut('978-0-001');
  library.checkOut('978-0-001');  // 중복 대출 시도

  // 장르 검색
  print('\n── 기술 장르 ──');
  library.findByGenre('기술').forEach(print);

  // 반납
  print('\n── 반납 처리 ──');
  library.returnItem('978-0-001');

  // 통계
  library.printStats();
}
```

**예상 출력**

```
등록 완료: 다트 프로그래밍
등록 완료: Flutter 완전 정복
등록 완료: 클린 코드
등록 완료: 어린 왕자

── 전체 목록 ──
[도서] "다트 프로그래밍" by 홍길동 (ISBN: 978-0-001) — 대출가능 (350 페이지)
[전자책] "Flutter 완전 정복" by 김철수 (ISBN: 978-0-002) — 대출가능 (480 페이지, 12.5MB, EPUB)
[오디오북] "클린 코드" by Robert C. Martin (ISBN: 978-0-003) — 대출가능 (690분, 나레이터: 이영희)
[도서] "어린 왕자" by 생텍쥐페리 (ISBN: 978-0-004) — 대출가능 (96 페이지)

── 대출 처리 ──
대출 완료: 다트 프로그래밍
대출 불가: 다트 프로그래밍 (이미 대출 중)

── 기술 장르 ──
[도서] "다트 프로그래밍" by 홍길동 (ISBN: 978-0-001) — 대출중
[전자책] "Flutter 완전 정복" by 김철수 (ISBN: 978-0-002) — 대출가능
[오디오북] "클린 코드" by Robert C. Martin (ISBN: 978-0-003) — 대출가능

── 반납 처리 ──
반납 완료: 다트 프로그래밍

── 도서관 통계 ──
전체 도서: 4권
대출 가능: 4권 / 대출 중: 0권
장르별:
  기술: 3권
  문학: 1권
```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념              | 핵심 내용                                   |
| ----------------- | ------------------------------------------- |
| `extends`         | 부모 구현 상속, 단일 상속, IS-A 관계 표현   |
| `super`           | 부모 생성자 전달, 부모 메서드 호출          |
| `@override`       | 메서드 재정의 명시, 오타/변경 감지          |
| `abstract class`  | 직접 인스턴스 불가, 추상+구체 메서드 혼합   |
| `abstract` 메서드 | 본문 없음, 하위 클래스 구현 강제            |
| `implements`      | 계약만 따름, 모두 직접 구현, 다중 구현 가능 |
| 다형성            | 부모/인터페이스 타입으로 다양한 구현체 관리 |
| LSP               | 자식이 부모를 완전히 대체할 수 있어야 함    |
| 컴포지션          | 상속보다 포함 관계 — 깊은 계층 대안         |

### 🎯 Phase 2 완료 체크리스트

- [ ] Step 6: `List`, `Set`, `Map`의 특성과 Mutable/Immutable 차이를 안다
- [ ] Step 7: `map()`, `where()`, `fold()`, `expand()` 체이닝을 작성할 수 있다
- [ ] Step 8: 클래스 필드, 메서드, getter/setter, `==`/`hashCode`를 설계할 수 있다
- [ ] Step 9: Named/`const`/`factory` 생성자를 상황에 맞게 선택할 수 있다
- [ ] Step 10: `extends`/`implements`/`abstract`의 트레이드오프를 설명할 수 있다
- [ ] 실전 과제 2: 도서 관리 시스템을 독립적으로 구현했다

### 🔗 다음 단계

> **Phase 3 — Step 11: Mixins**으로 이동하세요.

Step 11에서는 Dart만의 독특한 코드 재사용 메커니즘인 `mixin`을 학습합니다. 단일 상속의 한계를 넘어 여러 클래스에 기능을 선택적으로 주입하는 방법을 익힙니다. `extends` / `implements` / `mixin`을 모두 이해한 후에야 Dart OOP의 전체 그림이 완성됩니다.

### 📚 참고 자료

| 자료                   | 링크                                                    |
| ---------------------- | ------------------------------------------------------- |
| Dart extends 공식 문서 | <https://dart.dev/language/extend>                      |
| Dart abstract class    | <https://dart.dev/language/class-modifiers#abstract>    |
| Dart implements        | <https://dart.dev/language/classes#implicit-interfaces> |
| Effective Dart — 상속  | <https://dart.dev/effective-dart/design#inheritance>    |
| DartPad 온라인 실습    | <https://dartpad.dev>                                   |

### ❓ 자가진단 퀴즈

1. **[Remember]** Dart에서 단일 상속만 지원하는 이유와, 다중 구현이 필요할 때 사용하는 키워드는?
2. **[Understand]** `abstract class`에서 추상 메서드와 구체 메서드를 함께 사용하는 이유를 캡슐화 관점에서 설명하라.
3. **[Understand]** `extends Animal`과 `implements Animal`의 차이를 "코드 재사용"과 "계약 강제" 두 관점에서 비교하라.
4. **[Apply]** 아래 요구사항에 가장 적합한 설계(`extends` / `implements` / `abstract` 중 어느 것을 어떻게 조합)를 선택하고 근거를 설명하라.
   > "SmtpMailer와 SendGridMailer는 모두 `send(email, body)`를 구현해야 하며, 발송 전 로그를 남기는 공통 로직을 공유해야 한다."
5. **[Evaluate]** `Stack`을 `extends List`로 구현하는 것이 잘못된 이유를 LSP와 인터페이스 최소화 원칙으로 평가하고, 올바른 대안 설계를 제안하라.

> **4번 정답 힌트**
>
> `abstract class Mailer` 사용이 가장 적합합니다. `send()`를 추상 메서드로 강제하고, 로그를 남기는 `sendWithLog()`를 구체 메서드로 공통 구현합니다. 두 구현체는 `extends Mailer`로 상속받아 `send()`만 각자 구현합니다. `implements`만 사용하면 공통 로그 로직을 중복 구현해야 합니다.

> **5번 정답 힌트**
>
> LSP 관점: `List`를 기대하는 코드에 `Stack`을 넣으면 `insert()`, `shuffle()` 등 Stack의 의미와 맞지 않는 연산이 허용됩니다. 인터페이스 최소화: 외부에 불필요한 API를 노출하면 사용자가 잘못된 방법으로 조작할 수 있습니다. 올바른 대안: `List`를 `_items`로 포함(Composition)하고 `push()`, `pop()`, `peek`, `isEmpty`만 공개합니다.

---

_참고: 이 문서는 dart.dev 공식 문서(Extend, Class Modifiers, Interfaces) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
