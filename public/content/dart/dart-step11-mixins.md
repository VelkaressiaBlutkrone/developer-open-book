# Step 11 — Mixins

> **Phase 3 | 고급 Dart** | 예상 소요: 2일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 11 — Mixins](#step-11--mixins)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [상속의 한계와 Mixin의 탄생](#상속의-한계와-mixin의-탄생)
  - [3. Mixin 기본 문법](#3-mixin-기본-문법)
    - [3.1 `mixin` 선언](#31-mixin-선언)
    - [3.2 `with` 키워드로 적용](#32-with-키워드로-적용)
    - [3.3 여러 Mixin 동시 적용](#33-여러-mixin-동시-적용)
  - [4. Mixin의 멤버 — 필드와 메서드](#4-mixin의-멤버--필드와-메서드)
    - [4.1 구체 메서드와 구체 필드](#41-구체-메서드와-구체-필드)
    - [4.2 추상 멤버 — 구현 요구](#42-추상-멤버--구현-요구)
  - [5. `on` 키워드 — 적용 대상 제한](#5-on-키워드--적용-대상-제한)
  - [6. Mixin 적용 순서와 선형화(Linearization)](#6-mixin-적용-순서와-선형화linearization)
    - [선형화 규칙](#선형화-규칙)
  - [7. `mixin class` — Mixin이면서 클래스](#7-mixin-class--mixin이면서-클래스)
  - [8. extends / implements / mixin 통합 비교](#8-extends--implements--mixin-통합-비교)
  - [9. 실용 Mixin 패턴](#9-실용-mixin-패턴)
    - [9.1 로깅 Mixin](#91-로깅-mixin)
    - [9.2 직렬화 Mixin](#92-직렬화-mixin)
    - [9.3 유효성 검사 Mixin](#93-유효성-검사-mixin)
    - [9.4 Flutter 스타일 Mixin](#94-flutter-스타일-mixin)
  - [10. 실습](#10-실습)
    - [실습 10-1: Mixin 선형화 예측](#실습-10-1-mixin-선형화-예측)
    - [실습 10-2: `on` Mixin 설계](#실습-10-2-on-mixin-설계)
    - [실습 10-3: 횡단 관심사 분리](#실습-10-3-횡단-관심사-분리)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [OOP 완성 — 세 메커니즘 + Mixin](#oop-완성--세-메커니즘--mixin)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                       |
| --- | ------------- | ------------------------------------------------------------------------------------------ |
| 1   | 🔵 Remember   | `mixin`, `with`, `on` 키워드의 역할을 나열할 수 있다                                       |
| 2   | 🟢 Understand | Mixin이 `extends`/`implements`와 다른 목적을 설명할 수 있다                                |
| 3   | 🟢 Understand | Mixin 선형화(Linearization)가 메서드 충돌을 해결하는 원리를 설명할 수 있다                 |
| 4   | 🟡 Apply      | `on` 키워드로 특정 클래스에만 적용 가능한 Mixin을 설계할 수 있다                           |
| 5   | 🟡 Apply      | 로깅, 직렬화 등 횡단 관심사(Cross-cutting Concerns)를 Mixin으로 분리할 수 있다             |
| 6   | 🟠 Analyze    | 주어진 설계에서 Mixin이 적합한지 `extends`/`implements` 대비 트레이드오프를 분석할 수 있다 |

---

## 2. 서론

### 상속의 한계와 Mixin의 탄생

Step 10에서 `extends`로 코드를 재사용하고 `implements`로 계약을 강제하는 방법을 배웠습니다. 그런데 실제 설계에서는 다음 상황이 자주 등장합니다.

```
Dog    — 달릴 수 있다, 수영할 수 있다
Duck   — 날 수 있다,   수영할 수 있다
Parrot — 날 수 있다,   말할 수 있다
Robot  — 달릴 수 있다, 말할 수 있다
```

각 능력(달리기, 수영, 날기, 말하기)은 공통 구현이 있습니다. 하지만 상속은 단일 부모만 허용하므로 이 네 가지를 자유롭게 조합할 수 없습니다.

```
"Swimable, Flyable을 모두 상속받고 싶다"
→ extends Swimable, Flyable  ← Dart에서 불가 (단일 상속)

"implements Swimable, Flyable로 계약만 따른다"
→ 공통 구현(swim, fly 로직)을 매 클래스마다 중복 작성해야 함
```

**Mixin은 이 문제의 해답**입니다. 클래스 계층 구조와 무관하게 **기능 묶음을 여러 클래스에 선택적으로 주입**할 수 있습니다.

```
Mixin = 재사용 가능한 기능 조각
with  = 원하는 기능만 골라 클래스에 주입

Dog   with Runnable, Swimable
Duck  with Flyable,  Swimable
Parrot with Flyable, Speakable
Robot  with Runnable, Speakable
```

> **전제 지식**: Step 10 완료 (`extends`, `implements`, `abstract class`)

---

## 3. Mixin 기본 문법

### 3.1 `mixin` 선언

```dart
mixin 이름 {
  // 필드, 메서드 정의
}
```

`mixin`은 `class`와 달리 **단독으로 인스턴스를 생성할 수 없습니다.** 반드시 다른 클래스에 `with`로 적용해야 합니다.

```dart
mixin Swimable {
  void swim() => print('$name 수영 중...');   // name은 어디서?
  double get swimSpeed => 3.0;
}
```

> ⚠️ 위 코드의 `name`은 `Swimable`에 없습니다. Mixin이 `name`을 요구한다면 `on` 키워드(5절)나 추상 getter(4.2절)로 명시해야 합니다. 지금은 구조를 먼저 이해합니다.

---

### 3.2 `with` 키워드로 적용

```dart
mixin Runnable {
  void run() => print('달리는 중');
  double get runSpeed => 10.0;
}

mixin Swimable {
  void swim() => print('수영 중');
  double get swimSpeed => 3.0;
}

mixin Flyable {
  void fly() => print('비행 중');
  double get flySpeed => 50.0;
}

// 클래스 + Mixin 조합
class Dog extends Object with Runnable, Swimable {
  final String name;
  Dog(this.name);
}

class Duck with Flyable, Swimable {
  final String name;
  Duck(this.name);
}

void main() {
  var dog = Dog('바둑이');
  dog.run();              // 달리는 중
  dog.swim();             // 수영 중
  print(dog.runSpeed);    // 10.0
  // dog.fly();           // ❌ 컴파일 오류 — Flyable 미적용

  var duck = Duck('도날드');
  duck.fly();             // 비행 중
  duck.swim();            // 수영 중
}
```

**`extends`와 `with` 동시 사용**

```dart
class Animal {
  final String name;
  Animal(this.name);
  void breathe() => print('$name: 호흡 중');
}

class Dolphin extends Animal with Swimable {
  Dolphin(super.name);
}

void main() {
  var dolphin = Dolphin('돌핀');
  dolphin.breathe();        // 돌핀: 호흡 중 (Animal에서 상속)
  dolphin.swim();           // 수영 중 (Swimable Mixin)
}
```

**선언 순서**

```
class 클래스명 extends 부모 with Mixin1, Mixin2 implements 인터페이스 {
```

`extends` → `with` → `implements` 순서로 작성합니다.

---

### 3.3 여러 Mixin 동시 적용

```dart
mixin Loggable {
  void log(String msg) => print('[LOG] $msg');
}

mixin Cacheable {
  final Map<String, dynamic> _cache = {};

  void cache(String key, dynamic value) {
    _cache[key] = value;
  }

  dynamic getCache(String key) => _cache[key];

  void clearCache() => _cache.clear();
}

mixin Retryable {
  int get maxRetries => 3;

  Future<T> withRetry<T>(Future<T> Function() action) async {
    for (int i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (e) {
        if (i == maxRetries - 1) rethrow;
        print('재시도 ${i + 1}/$maxRetries: $e');
      }
    }
    throw StateError('도달 불가');
  }
}

// 세 Mixin 동시 적용
class ApiService with Loggable, Cacheable, Retryable {
  Future<String> fetchUser(String id) async {
    final cached = getCache('user_$id');
    if (cached != null) {
      log('캐시 히트: user_$id');
      return cached as String;
    }

    final result = await withRetry(() async {
      log('API 호출: user_$id');
      // 실제 HTTP 요청 시뮬레이션
      await Future.delayed(Duration(milliseconds: 100));
      return '{"id": "$id", "name": "홍길동"}';
    });

    cache('user_$id', result);
    return result;
  }
}

void main() async {
  var service = ApiService();
  var user1 = await service.fetchUser('u001');
  print(user1);
  var user2 = await service.fetchUser('u001');  // 캐시 히트
  print(user2);
}
```

---

## 4. Mixin의 멤버 — 필드와 메서드

### 4.1 구체 메서드와 구체 필드

Mixin은 **구체적인 구현을 포함**할 수 있습니다. 적용된 클래스는 이 구현을 그대로 사용합니다.

```dart
mixin Counter {
  int _count = 0;  // 인스턴스마다 독립적으로 생성됨

  int get count => _count;

  void increment() => _count++;
  void decrement() => _count--;
  void reset()     => _count = 0;
}

class PageView with Counter {
  final String title;
  PageView(this.title);

  void nextPage() {
    increment();
    print('$title: ${count}페이지');
  }
}

class ClickTracker with Counter {
  void click(String buttonName) {
    increment();
    print('$buttonName 클릭 (총 ${count}회)');
  }
}

void main() {
  var page    = PageView('Dart 가이드');
  var tracker = ClickTracker();

  page.nextPage();    // Dart 가이드: 1페이지
  page.nextPage();    // Dart 가이드: 2페이지

  tracker.click('확인');  // 확인 클릭 (총 1회)
  tracker.click('취소');  // 취소 클릭 (총 2회)

  // 독립적인 카운터 — 서로 영향 없음
  print(page.count);     // 2
  print(tracker.count);  // 2
}
```

---

### 4.2 추상 멤버 — 구현 요구

Mixin 내부에서 **적용 클래스의 멤버를 요구**할 때 추상 멤버를 선언합니다. 이 방식은 `on` 키워드 없이 Mixin이 외부 상태에 의존하는 방법입니다.

```dart
mixin Describable {
  // 추상 getter — 적용 클래스가 반드시 구현해야 함
  String get description;

  void printDescription() {
    print('설명: $description');  // 추상 getter 활용
  }

  String get shortDescription =>
      description.length > 50
          ? '${description.substring(0, 47)}...'
          : description;
}

mixin Taggable {
  // 추상 멤버 — 태그 목록 요구
  List<String> get tags;

  bool hasTag(String tag) => tags.contains(tag);

  String get tagLine => tags.join(', ');
}

class Article with Describable, Taggable {
  final String title;
  final String content;

  @override
  final List<String> tags;

  Article({required this.title, required this.content, required this.tags});

  @override
  String get description => '$title: $content';
}

void main() {
  var article = Article(
    title: 'Dart Mixin 완전 정복',
    content: 'Mixin은 코드 재사용의 강력한 도구입니다.',
    tags: ['dart', 'mixin', 'oop'],
  );

  article.printDescription();        // 설명: Dart Mixin 완전 정복: Mixin은 ...
  print(article.shortDescription);   // Dart Mixin 완전 정복: Mixin은 코드 재사용의...
  print(article.hasTag('dart'));     // true
  print(article.tagLine);            // dart, mixin, oop
}
```

---

## 5. `on` 키워드 — 적용 대상 제한

`on` 키워드는 Mixin이 **특정 클래스(또는 그 하위 클래스)에만 적용**될 수 있도록 제한합니다. 제한된 클래스의 멤버를 Mixin 안에서 직접 사용할 수 있게 됩니다.

```
mixin 이름 on 슈퍼클래스 { ... }
→ 이 Mixin은 슈퍼클래스를 상속한 클래스에만 적용 가능
→ Mixin 내부에서 슈퍼클래스의 멤버에 접근 가능
```

```dart
class Animal {
  final String name;
  int _energy = 100;

  Animal(this.name);

  int get energy => _energy;

  void eat(int amount) {
    _energy += amount;
    print('$name: 식사 후 에너지 $_energy');
  }
}

// on Animal — Animal(또는 하위 클래스)에만 적용 가능
// Animal의 멤버(name, _energy, eat())에 Mixin 내부에서 접근 가능
mixin Exercisable on Animal {
  void exercise(int duration) {
    int burned = duration * 2;
    // Animal의 _energy와 name에 직접 접근
    if (_energy < burned) {
      print('$name: 에너지 부족! (현재: $_energy)');
      return;
    }
    _energy -= burned;
    print('$name: ${duration}분 운동 → 에너지 $_energy');
  }

  void dailyRoutine() {
    eat(50);        // Animal의 eat() 호출
    exercise(20);
  }
}

mixin Trainable on Animal {
  int _level = 1;

  int get level => _level;

  void train() {
    if (_energy < 30) {
      print('$name: 훈련 에너지 부족');
      return;
    }
    _energy -= 30;
    _level++;
    print('$name: 훈련 완료! 레벨 $_level (에너지: $_energy)');
  }
}

// ✅ Animal 상속 클래스에 적용 — 가능
class Dog extends Animal with Exercisable, Trainable {
  Dog(super.name);
}

// ❌ Animal을 상속하지 않은 클래스에 적용 — 컴파일 오류
// class Robot with Exercisable { }

void main() {
  var dog = Dog('바둑이');

  dog.dailyRoutine();
  // 바둑이: 식사 후 에너지 150
  // 바둑이: 20분 운동 → 에너지 110

  dog.train();
  // 바둑이: 훈련 완료! 레벨 2 (에너지: 80)

  dog.train();
  // 바둑이: 훈련 완료! 레벨 3 (에너지: 50)

  print('레벨: ${dog.level}, 에너지: ${dog.energy}');
  // 레벨: 3, 에너지: 50
}
```

**`on`의 핵심 가치**

```
추상 멤버 방식:  Mixin 사용자가 매번 getter를 구현해야 함
on 방식:        부모 클래스에 이미 있는 멤버를 Mixin이 직접 사용
                → 보일러플레이트 제거, 안전한 타입 보장
```

---

## 6. Mixin 적용 순서와 선형화(Linearization)

여러 Mixin을 동시에 적용할 때 **같은 이름의 메서드**가 있으면 어느 것이 호출될까요? Dart는 **선형화(Linearization)** 알고리즘으로 충돌을 해결합니다.

### 선형화 규칙

```
with A, B, C 적용 시

우선순위: C > B > A > 클래스 자체
(오른쪽에 있는 Mixin이 더 높은 우선순위)
```

```dart
mixin A {
  String get name => 'A';
  void hello() => print('Hello from A');
}

mixin B {
  String get name => 'B';
  void hello() => print('Hello from B');
}

mixin C {
  String get name => 'C';
  void hello() => print('Hello from C');
}

class MyClass with A, B, C {
  // hello()와 name을 재정의하지 않으면
  // C의 구현이 사용됨 (가장 오른쪽)
}

void main() {
  var obj = MyClass();
  obj.hello();       // Hello from C
  print(obj.name);   // C
}
```

**선형화 체인 시각화**

```
class MyClass with A, B, C

→ 내부적으로 다음 계층 구조로 변환:

Object
  └── A
       └── B
            └── C
                 └── MyClass  ← 최종 클래스

메서드 검색 순서: MyClass → C → B → A → Object
(왼쪽부터 검색, 먼저 발견된 것 사용)
```

**`super`로 체인 따라 호출**

```dart
mixin LogA {
  void process() {
    print('LogA: 전처리');
    super.process();  // 다음 Mixin의 process() 호출
    print('LogA: 후처리');
  }
}

mixin LogB {
  void process() {
    print('LogB: 전처리');
    super.process();
    print('LogB: 후처리');
  }
}

class Base {
  void process() => print('Base: 핵심 처리');
}

class Pipeline extends Base with LogA, LogB {
  // 자체 process() 없음
}

void main() {
  Pipeline().process();
}
// LogB: 전처리       ← 오른쪽 Mixin 먼저
// LogA: 전처리
// Base: 핵심 처리
// LogA: 후처리
// LogB: 후처리
```

**선형화 흐름 시각화**

```
Pipeline.process()
  → LogB.process()    (오른쪽 우선)
      → super.process() → LogA.process()
                              → super.process() → Base.process()
                              ← LogA 후처리
      ← LogB 후처리
```

이 패턴은 **데코레이터 패턴**과 유사하며, 미들웨어 파이프라인, 로깅 계층 등에서 활용됩니다.

---

## 7. `mixin class` — Mixin이면서 클래스

Dart 3.0부터 `mixin class`를 선언하면 해당 타입을 **Mixin으로도, 일반 클래스로도** 사용할 수 있습니다.

```dart
// mixin class — with와 extends 모두 사용 가능
mixin class Serializable {
  Map<String, dynamic> toJson() => {};  // 기본 구현
  String toJsonString() => toJson().toString();
}

// with로 사용 — Mixin처럼
class User with Serializable {
  final String name;
  final int age;

  User(this.name, this.age);

  @override
  Map<String, dynamic> toJson() => {'name': name, 'age': age};
}

// extends로 사용 — 클래스처럼
class AdvancedSerializer extends Serializable {
  final String prefix;

  AdvancedSerializer(this.prefix);

  @override
  String toJsonString() => '$prefix: ${super.toJsonString()}';
}

// 단독 인스턴스 생성도 가능
// var s = Serializable();  ← mixin class는 가능 (일반 mixin은 불가)

void main() {
  var user = User('홍길동', 30);
  print(user.toJsonString());  // {name: 홍길동, age: 30}

  var serializer = AdvancedSerializer('[DATA]');
  print(serializer.toJsonString());  // [DATA]: {}
}
```

**`mixin` vs `mixin class` 선택 기준**

| 상황                                      | 선택                      |
| ----------------------------------------- | ------------------------- |
| Mixin으로만 사용, 단독 인스턴스 불필요    | `mixin`                   |
| Mixin으로도 사용하고 단독 인스턴스도 필요 | `mixin class`             |
| 상속 계층이 필요                          | `mixin class` + `extends` |

---

## 8. extends / implements / mixin 통합 비교

세 메커니즘의 전체 비교를 정리합니다.

```
┌─────────────────┬──────────┬────────────┬────────────────┐
│ 특성            │ extends  │ implements │ with (mixin)   │
├─────────────────┼──────────┼────────────┼────────────────┤
│ 구현 상속       │ ✅ 전체  │ ❌         │ ✅ 선택적      │
│ 다중 사용       │ ❌ 단일  │ ✅ 여러 개 │ ✅ 여러 개     │
│ 계약 강제       │ 선택적   │ ✅ 전체    │ 추상 멤버로    │
│ 단독 인스턴스   │ ✅       │ ✅         │ ❌ (mixin class는 ✅) │
│ 적용 대상 제한  │ —        │ —          │ on 키워드      │
│ IS-A 관계       │ ✅ 강함  │ 약함       │ ❌             │
│ 코드 주입       │ 수직     │ ❌         │ ✅ 수평        │
│ 주요 목적       │ 계층 구조│ 계약 정의  │ 기능 조각 주입 │
└─────────────────┴──────────┴────────────┴────────────────┘
```

**선택 흐름도**

```
코드를 재사용하고 싶다
          │
          ▼
    IS-A 관계이며
    계층 구조가 명확한가?
     ├─ YES ──► extends (또는 abstract class)
     └─ NO
           │
           ▼
    여러 클래스에 공통 기능을
    수평으로 주입하고 싶은가?
     ├─ YES ──► mixin (with)
     └─ NO
           │
           ▼
    공통 구현 없이 API 계약만
    강제하고 싶은가?
     └─ YES ──► implements (또는 abstract class)
```

---

## 9. 실용 Mixin 패턴

### 9.1 로깅 Mixin

```dart
mixin Logger {
  // 클래스 이름을 자동으로 태그로 사용
  String get _tag => runtimeType.toString();

  void logInfo(String msg)  => print('[$_tag][INFO]  $msg');
  void logWarn(String msg)  => print('[$_tag][WARN]  $msg');
  void logError(String msg) => print('[$_tag][ERROR] $msg');

  void logElapsed(String label, void Function() action) {
    final sw = Stopwatch()..start();
    action();
    sw.stop();
    logInfo('$label: ${sw.elapsedMilliseconds}ms');
  }
}

class UserService with Logger {
  final Map<String, String> _users = {};

  void createUser(String id, String name) {
    if (_users.containsKey(id)) {
      logWarn('이미 존재하는 ID: $id');
      return;
    }
    _users[id] = name;
    logInfo('사용자 생성: $id ($name)');
  }

  String? getUser(String id) {
    final user = _users[id];
    if (user == null) logError('사용자 미발견: $id');
    return user;
  }
}

class OrderService with Logger {
  void processOrder(String orderId) {
    logElapsed('주문 처리 $orderId', () {
      // 처리 시뮬레이션
      logInfo('주문 검증 중...');
      logInfo('결제 처리 중...');
    });
  }
}

void main() {
  var userSvc  = UserService();
  var orderSvc = OrderService();

  userSvc.createUser('u001', '홍길동');
  userSvc.createUser('u001', '중복');   // WARN
  userSvc.getUser('u999');              // ERROR
  orderSvc.processOrder('ORD-001');

  // [UserService][INFO]  사용자 생성: u001 (홍길동)
  // [UserService][WARN]  이미 존재하는 ID: u001
  // [UserService][ERROR] 사용자 미발견: u999
  // [OrderService][INFO] 주문 검증 중...
  // [OrderService][INFO] 결제 처리 중...
  // [OrderService][INFO] 주문 처리 ORD-001: 0ms
}
```

---

### 9.2 직렬화 Mixin

```dart
mixin JsonSerializable {
  // 추상 멤버 — 적용 클래스가 구현
  Map<String, dynamic> toJson();

  // 구체 메서드 — 공통 구현
  String toJsonString() {
    final buffer = StringBuffer('{');
    final entries = toJson().entries.toList();
    for (int i = 0; i < entries.length; i++) {
      final e = entries[i];
      buffer.write('"${e.key}": ');
      if (e.value is String) {
        buffer.write('"${e.value}"');
      } else {
        buffer.write(e.value);
      }
      if (i < entries.length - 1) buffer.write(', ');
    }
    buffer.write('}');
    return buffer.toString();
  }

  void printJson() => print(toJsonString());
}

mixin Validatable {
  // 추상 멤버 — 유효성 검사 규칙 맵 요구
  Map<String, bool Function()> get validationRules;

  List<String> validate() {
    return validationRules.entries
        .where((e) => !e.value())       // 실패한 규칙만
        .map((e) => e.key)              // 오류 메시지 추출
        .toList();
  }

  bool get isValid => validate().isEmpty;
}

class Product with JsonSerializable, Validatable {
  final String name;
  final double price;
  final int stock;

  Product({required this.name, required this.price, required this.stock});

  @override
  Map<String, dynamic> toJson() => {
    'name': name,
    'price': price,
    'stock': stock,
  };

  @override
  Map<String, bool Function()> get validationRules => {
    '이름은 비어 있을 수 없습니다':   () => name.isNotEmpty,
    '가격은 0보다 커야 합니다':       () => price > 0,
    '재고는 0 이상이어야 합니다':     () => stock >= 0,
  };
}

void main() {
  var valid = Product(name: '노트북', price: 1200000, stock: 5);
  valid.printJson();
  print('유효: ${valid.isValid}');
  // {"name": "노트북", "price": 1200000.0, "stock": 5}
  // 유효: true

  var invalid = Product(name: '', price: -100, stock: -1);
  print('유효: ${invalid.isValid}');
  print('오류: ${invalid.validate()}');
  // 유효: false
  // 오류: [이름은 비어 있을 수 없습니다, 가격은 0보다 커야 합니다, 재고는 0 이상이어야 합니다]
}
```

---

### 9.3 유효성 검사 Mixin

```dart
mixin EmailValidator {
  bool isValidEmail(String email) {
    return RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(email);
  }

  String? validateEmail(String email) =>
      isValidEmail(email) ? null : '올바른 이메일 형식이 아닙니다';
}

mixin PasswordValidator {
  bool isStrongPassword(String password) {
    return password.length >= 8 &&
        RegExp(r'[A-Z]').hasMatch(password) &&
        RegExp(r'[0-9]').hasMatch(password);
  }

  String? validatePassword(String password) {
    if (password.length < 8)                return '8자 이상이어야 합니다';
    if (!RegExp(r'[A-Z]').hasMatch(password)) return '대문자를 포함해야 합니다';
    if (!RegExp(r'[0-9]').hasMatch(password)) return '숫자를 포함해야 합니다';
    return null;
  }
}

class RegistrationForm with EmailValidator, PasswordValidator {
  final String email;
  final String password;
  final String confirmPassword;

  RegistrationForm({
    required this.email,
    required this.password,
    required this.confirmPassword,
  });

  List<String> getErrors() {
    return [
      validateEmail(email),
      validatePassword(password),
      if (password != confirmPassword) '비밀번호가 일치하지 않습니다',
    ].whereType<String>().toList();
  }

  bool get isValid => getErrors().isEmpty;
}

void main() {
  var form = RegistrationForm(
    email: 'not-an-email',
    password: 'weak',
    confirmPassword: 'different',
  );

  print('유효: ${form.isValid}');
  form.getErrors().forEach(print);
  // 유효: false
  // 올바른 이메일 형식이 아닙니다
  // 8자 이상이어야 합니다
  // 비밀번호가 일치하지 않습니다

  var validForm = RegistrationForm(
    email: 'user@dart.dev',
    password: 'Dart2024!',
    confirmPassword: 'Dart2024!',
  );
  print('유효: ${validForm.isValid}');  // 유효: true
}
```

---

### 9.4 Flutter 스타일 Mixin

Flutter의 `State` 클래스는 `on` Mixin을 광범위하게 사용합니다. 개념적 이해를 위한 예시입니다.

```dart
// Flutter의 TickerProviderStateMixin 개념 (단순화 버전)
abstract class StateBase {
  bool _mounted = true;
  bool get mounted => _mounted;

  void setState(void Function() fn) {
    if (!_mounted) return;
    fn();
    // 실제 Flutter에서는 여기서 리빌드 트리거
    print('[setState] 상태 업데이트 및 리빌드');
  }

  void dispose() {
    _mounted = false;
    print('dispose() 호출');
  }
}

// on StateBase — StateBase 하위에만 적용
mixin AutoDisposeMixin on StateBase {
  final List<Function()> _disposers = [];

  void addDisposer(Function() disposer) {
    _disposers.add(disposer);
  }

  @override
  void dispose() {
    for (final d in _disposers) {
      d();
    }
    _disposers.clear();
    super.dispose();  // 부모의 dispose() 체인 호출
    print('AutoDisposeMixin: 모든 구독 해제 완료');
  }
}

mixin LifecycleMixin on StateBase {
  void onInit()   => print('onInit() 호출');
  void onResume() => print('onResume() 호출');
  void onPause()  => print('onPause() 호출');

  @override
  void dispose() {
    onPause();
    super.dispose();
  }
}

class MyPageState extends StateBase with LifecycleMixin, AutoDisposeMixin {
  int _counter = 0;

  void init() {
    onInit();
    addDisposer(() => print('타이머 해제'));
    addDisposer(() => print('스트림 구독 해제'));
  }

  void increment() {
    setState(() => _counter++);
    print('카운터: $_counter');
  }
}

void main() {
  var state = MyPageState();
  state.init();
  state.increment();
  state.increment();
  state.dispose();

  // onInit() 호출
  // [setState] 상태 업데이트 및 리빌드
  // 카운터: 1
  // [setState] 상태 업데이트 및 리빌드
  // 카운터: 2
  // onPause() 호출
  // dispose() 호출
  // 타이머 해제
  // 스트림 구독 해제
  // AutoDisposeMixin: 모든 구독 해제 완료
}
```

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 10-1: Mixin 선형화 예측

아래 코드의 출력 결과를 실행 전에 예측하고 이유를 설명하세요.

```dart
mixin M1 {
  void greet() {
    print('M1 전');
    super.greet();
    print('M1 후');
  }
}

mixin M2 {
  void greet() {
    print('M2 전');
    super.greet();
    print('M2 후');
  }
}

class Base {
  void greet() => print('Base');
}

class MyClass extends Base with M1, M2 {}

void main() {
  MyClass().greet();
}
```

> **정답 힌트**
>
> 선형화 순서: `MyClass → M2 → M1 → Base`
>
> ```
> M2 전
> M1 전
> Base
> M1 후
> M2 후
> ```
>
> `with M1, M2`에서 오른쪽(M2)이 먼저 실행되고, 각 `super.greet()`는 선형화 체인에서 다음 단계를 호출합니다.

### 실습 10-2: `on` Mixin 설계

`Vehicle` 기반 클래스가 있을 때, 아래 요구사항을 만족하는 Mixin을 `on Vehicle`로 설계하세요.

**요구사항**

- `Vehicle`은 `speed`(속도), `fuel`(연료량) 필드를 가짐
- `FuelAware` Mixin: 연료가 부족할 때(20% 이하) 경고를 출력하는 `checkFuel()` 메서드
- `SpeedLimiter` Mixin: 최대 속도를 초과하면 자동으로 감속하는 `limitSpeed(int max)` 메서드

```dart
class Vehicle {
  String name;
  double speed;
  double fuel;  // 0.0 ~ 100.0 (%)

  Vehicle({required this.name, this.speed = 0, this.fuel = 100});

  void accelerate(double amount) {
    speed += amount;
    fuel -= amount * 0.5;
  }
}

mixin FuelAware on Vehicle {
  // TODO: checkFuel() 구현
}

mixin SpeedLimiter on Vehicle {
  // TODO: limitSpeed(double max) 구현
}

class Car extends Vehicle with FuelAware, SpeedLimiter {
  Car(String name) : super(name: name);
}
```

> **정답 힌트**
>
> ```dart
> mixin FuelAware on Vehicle {
>   void checkFuel() {
>     if (fuel <= 20) {
>       print('[$name] ⚠️ 연료 부족: ${fuel.toStringAsFixed(1)}%');
>     } else {
>       print('[$name] 연료 정상: ${fuel.toStringAsFixed(1)}%');
>     }
>   }
> }
>
> mixin SpeedLimiter on Vehicle {
>   void limitSpeed(double max) {
>     if (speed > max) {
>       print('[$name] 속도 제한: ${speed} → $max km/h');
>       speed = max;
>     }
>   }
> }
>
> void main() {
>   var car = Car('소나타');
>   car.accelerate(60);
>   car.checkFuel();       // 연료 정상: 70.0%
>   car.limitSpeed(100);   // 속도 제한 없음 (60 < 100)
>   car.accelerate(80);
>   car.limitSpeed(100);   // 속도 제한: 140.0 → 100.0 km/h
>   car.checkFuel();       // ⚠️ 연료 부족: 10.0%
> }
> ```

### 실습 10-3: 횡단 관심사 분리

다음 `ReportService` 클래스의 로깅과 유효성 검사 로직을 Mixin으로 분리해 리팩토링하세요. (힌트 없음 — 9절의 패턴 참고)

```dart
// 리팩토링 전 — 로깅과 유효성 검사가 비즈니스 로직에 혼재
class ReportService {
  void generateReport(String title, List<int> data) {
    print('[ReportService][INFO] 보고서 생성 시작: $title');

    if (title.isEmpty) {
      print('[ReportService][ERROR] 제목이 비어 있습니다');
      return;
    }
    if (data.isEmpty) {
      print('[ReportService][ERROR] 데이터가 비어 있습니다');
      return;
    }

    final avg = data.fold(0, (a, b) => a + b) / data.length;
    print('[ReportService][INFO] 보고서 완료: $title (평균: $avg)');
  }
}
```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념               | 핵심 내용                                        |
| ------------------ | ------------------------------------------------ |
| `mixin`            | 기능 조각 정의, 단독 인스턴스 불가               |
| `with`             | 클래스에 Mixin 적용, 여러 개 가능                |
| `on`               | Mixin 적용 대상 제한, 부모 클래스 멤버 접근 허용 |
| 추상 멤버 in Mixin | 적용 클래스에 구현 요구                          |
| 선형화             | 오른쪽 Mixin 우선, `super`로 체인 호출           |
| `mixin class`      | Mixin + 클래스 동시 사용 (Dart 3.0+)             |
| 횡단 관심사        | 로깅, 직렬화, 유효성 검사를 Mixin으로 분리       |

### OOP 완성 — 세 메커니즘 + Mixin

```
extends   → IS-A 계층 구조, 코드 수직 재사용
implements → 계약(API) 강제, 다중 타입 준수
abstract  → 추상+구체 혼합, 구현 강제 + 공통 로직
mixin     → 기능 수평 주입, 횡단 관심사 분리
```

### 🔗 다음 단계

> **Step 12 — 열거형(Enum)**으로 이동하세요.

Step 12에서는 Dart 2.17+의 강화된 Enum을 학습합니다. 단순 상수 열거를 넘어 필드, 메서드, `implements`, `mixin`을 갖춘 풍부한 Enum으로 복잡한 상태와 도메인 로직을 표현하는 방법을 익힙니다.

### 📚 참고 자료

| 자료                   | 링크                                            |
| ---------------------- | ----------------------------------------------- |
| Dart Mixin 공식 문서   | <https://dart.dev/language/mixins>                |
| Mixin 선형화 심화      | <https://dart.dev/language/mixins#on>             |
| mixin class (Dart 3.0) | <https://dart.dev/language/class-modifiers#mixin> |
| DartPad 온라인 실습    | <https://dartpad.dev>                             |

### ❓ 자가진단 퀴즈

1. **[Remember]** 일반 `mixin`과 `mixin class`의 차이점은 무엇인가?
2. **[Remember]** `mixin M on Animal`로 선언된 Mixin을 `Animal`을 상속하지 않는 클래스에 적용하면 어떻게 되는가?
3. **[Understand]** `with A, B`에서 A와 B 모두 같은 메서드를 가질 때 어느 쪽이 우선 실행되는가? 그리고 `super`를 사용하면 어떻게 달라지는가?
4. **[Understand]** Mixin 내부에서 추상 멤버를 선언하는 방식과 `on` 키워드를 사용하는 방식 중 어느 것이 더 타입 안전하고, 그 이유는 무엇인가?
5. **[Apply]** `List<T>`를 내부에 포함하며 `add()`, `remove()`, `length`, `isEmpty`를 제공하는 `CollectionMixin<T>`를 작성하라. 이를 `Playlist`와 `ShoppingCart` 두 클래스에 적용하라.
6. **[Analyze]** 로깅 기능을 구현할 때 Mixin을 사용하는 것과 `Logger` 클래스를 필드로 포함하는 Composition 방식의 트레이드오프를 비교하라.

> **5번 정답 힌트**
>
> ```dart
> mixin CollectionMixin<T> {
>   final List<T> _items = [];
>   int get length  => _items.length;
>   bool get isEmpty => _items.isEmpty;
>   void add(T item)     => _items.add(item);
>   void remove(T item)  => _items.remove(item);
>   List<T> get items    => List.unmodifiable(_items);
> }
>
> class Playlist with CollectionMixin<String> {
>   void play() => print('재생 목록: ${items.join(", ")}');
> }
>
> class ShoppingCart with CollectionMixin<String> {
>   double totalPrice = 0;
>   void checkout() => print('결제: ${items.length}개 상품');
> }
> ```

> **6번 정답 힌트**
>
> Mixin 방식은 `logInfo()` 등을 직접 호출해 간결하고, `runtimeType`으로 태그를 자동 설정할 수 있습니다. Composition 방식(`final logger = Logger()`)은 Logger를 교체하거나 Mock으로 대체하기 쉬워 테스트에 유리합니다. 단순한 로깅은 Mixin, 테스트가 중요하거나 Logger 구현체를 교환해야 하는 경우는 Composition이 적합합니다.

---

> ⬅️ [Step 10 — OOP 확장](#) | ➡️ [Step 12 — 열거형(Enum) →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Mixins, Class Modifiers) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
