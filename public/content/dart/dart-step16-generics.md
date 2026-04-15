# Step 16 — 제네릭 (Generics)

> **Phase 4 | 타입 시스템과 패턴** | 예상 소요: 2일 | 블룸 수준: Understand ~ Analyze

---

## 📋 목차

- [Step 16 — 제네릭 (Generics)](#step-16--제네릭-generics)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론 — 타입을 매개변수로 만들기](#2-서론--타입을-매개변수로-만들기)
    - [제네릭이 없다면](#제네릭이-없다면)
  - [3. 제네릭 클래스](#3-제네릭-클래스)
    - [3.1 기본 문법](#31-기본-문법)
    - [3.2 여러 타입 파라미터](#32-여러-타입-파라미터)
    - [3.3 제네릭 클래스 상속과 구현](#33-제네릭-클래스-상속과-구현)
  - [4. 제네릭 메서드와 함수](#4-제네릭-메서드와-함수)
  - [5. 타입 제약 — `extends`로 경계 설정](#5-타입-제약--extends로-경계-설정)
    - [5.1 단일 경계](#51-단일-경계)
    - [5.2 경계와 인터페이스 조합](#52-경계와-인터페이스-조합)
  - [6. 공변성과 반공변성 (개념)](#6-공변성과-반공변성-개념)
  - [7. 제네릭과 런타임 타입](#7-제네릭과-런타임-타입)
    - [7.1 타입 추론](#71-타입-추론)
    - [7.2 타입 토큰 패턴](#72-타입-토큰-패턴)
  - [8. 실용 제네릭 패턴](#8-실용-제네릭-패턴)
    - [8.1 Result 타입](#81-result-타입)
    - [8.2 제네릭 Repository](#82-제네릭-repository)
    - [8.3 제네릭 캐시](#83-제네릭-캐시)
    - [8.4 Builder 패턴](#84-builder-패턴)
  - [9. 실습](#9-실습)
    - [실습 9-1: 제네릭 `Option` 타입 구현](#실습-9-1-제네릭-option-타입-구현)
    - [실습 9-2: 타입 제약 활용](#실습-9-2-타입-제약-활용)
    - [실습 9-3: 제네릭 Event Emitter](#실습-9-3-제네릭-event-emitter)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                       |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | 타입 파라미터, 타입 제약(`extends`), 타입 추론의 의미를 나열할 수 있다                                     |
| 2   | 🟢 Understand | 제네릭이 `dynamic`과 `Object`보다 타입 안전한 이유를 설명할 수 있다                                        |
| 3   | 🟢 Understand | 타입 제약(`<T extends Comparable>`)이 컴파일 타임에 어떤 보장을 제공하는지 설명할 수 있다                  |
| 4   | 🟡 Apply      | 제네릭 클래스와 메서드를 설계하고 타입 파라미터를 올바르게 사용할 수 있다                                  |
| 5   | 🟡 Apply      | Result 타입, 제네릭 Repository 등 실용 패턴을 구현할 수 있다                                               |
| 6   | 🟠 Analyze    | `T`, `T extends X`, `dynamic`, `Object?` 중 상황에 맞는 타입 표현을 선택하고 트레이드오프를 설명할 수 있다 |

---

## 2. 서론 — 타입을 매개변수로 만들기

### 제네릭이 없다면

```dart
// ❌ dynamic 방식 — 타입 안전성 없음
class DynamicBox {
  dynamic value;
  DynamicBox(this.value);
}

void main() {
  var box = DynamicBox(42);
  // value는 dynamic — 잘못된 타입 접근이 런타임까지 발견 안 됨
  String s = box.value;  // 런타임 TypeError — 컴파일 오류 없음
}

// ❌ 타입별 클래스 중복 — 코드 폭발
class IntBox    { int value;    IntBox(this.value); }
class StringBox { String value; StringBox(this.value); }
class UserBox   { User value;   UserBox(this.value); }
// 새 타입마다 동일한 코드 반복
```

**제네릭으로 해결**

```dart
// ✅ 제네릭 — 타입 안전 + 코드 재사용
class Box<T> {
  T value;
  Box(this.value);
}

void main() {
  var intBox    = Box<int>(42);
  var stringBox = Box<String>('안녕');
  var userBox   = Box<User>(User('홍길동'));

  // 타입 안전 — 컴파일 타임 검사
  int n    = intBox.value;      // ✅
  String s = stringBox.value;   // ✅
  // int wrong = stringBox.value; // ❌ 컴파일 오류 — 즉시 발견
}
```

**제네릭의 세 가지 목적**

```
1. 타입 안전성   — 컴파일 타임에 타입 오류 검출
2. 코드 재사용   — 동일 로직을 다양한 타입에 적용
3. 표현력 향상   — API가 타입 관계를 명확히 전달
```

> **전제 지식**: Step 8~10 (클래스, OOP), Step 13 (예외 처리), Step 14 (Future)

---

## 3. 제네릭 클래스

### 3.1 기본 문법

```dart
// 타입 파라미터는 관례적으로 대문자 한 글자
// T — 일반 타입
// E — 요소(Element) 타입 (컬렉션)
// K, V — 키/값 (Map)
// R — 반환(Return) 타입

class Stack<E> {
  final List<E> _items = [];

  void push(E item) => _items.add(item);

  E pop() {
    if (_items.isEmpty) throw StateError('Stack이 비어 있습니다');
    return _items.removeLast();
  }

  E get peek {
    if (_items.isEmpty) throw StateError('Stack이 비어 있습니다');
    return _items.last;
  }

  bool get isEmpty => _items.isEmpty;
  int  get length  => _items.length;

  @override
  String toString() => 'Stack$_items';
}

void main() {
  // 정수 스택
  var intStack = Stack<int>();
  intStack.push(1);
  intStack.push(2);
  intStack.push(3);
  print(intStack.pop());   // 3
  print(intStack.peek);    // 2

  // 문자열 스택
  var strStack = Stack<String>();
  strStack.push('first');
  strStack.push('second');
  print(strStack.pop());   // second

  // 타입 추론 — 타입 파라미터 생략 가능
  var autoStack = Stack<double>();
  autoStack.push(3.14);
  // autoStack.push('문자열'); // ❌ 컴파일 오류

  print(intStack);  // Stack[1, 2]
}
```

---

### 3.2 여러 타입 파라미터

```dart
// K: 키 타입, V: 값 타입
class Pair<K, V> {
  final K first;
  final V second;

  const Pair(this.first, this.second);

  Pair<V, K> swap() => Pair(second, first);

  @override
  String toString() => '($first, $second)';
}

// 세 타입 파라미터
class Triple<A, B, C> {
  final A first;
  final B second;
  final C third;

  const Triple(this.first, this.second, this.third);

  List<Object?> toList() => [first, second, third];

  @override
  String toString() => '($first, $second, $third)';
}

// Map 유사 구조 — K, V 타입 파라미터
class BiMap<K, V> {
  final Map<K, V> _forward = {};
  final Map<V, K> _reverse = {};

  void put(K key, V value) {
    _forward[key]   = value;
    _reverse[value] = key;
  }

  V?  getByKey(K key)   => _forward[key];
  K?  getByValue(V val) => _reverse[val];

  int get size => _forward.length;
}

void main() {
  var pair = Pair<String, int>('나이', 30);
  print(pair);          // (나이, 30)
  print(pair.swap());   // (30, 나이)

  var triple = Triple<String, int, bool>('홍길동', 30, true);
  print(triple);        // (홍길동, 30, true)
  print(triple.toList()); // [홍길동, 30, true]

  var biMap = BiMap<String, int>();
  biMap.put('하나', 1);
  biMap.put('둘', 2);
  print(biMap.getByKey('하나'));   // 1
  print(biMap.getByValue(2));      // 둘
}
```

---

### 3.3 제네릭 클래스 상속과 구현

```dart
// 제네릭 부모 클래스
abstract class Repository<T, ID> {
  Future<T?> findById(ID id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> delete(ID id);
  Future<bool> exists(ID id) async => (await findById(id)) != null;
}

// 구체 타입 지정해 상속
class UserRepository extends Repository<User, String> {
  final Map<String, User> _store = {};

  @override
  Future<User?> findById(String id) async => _store[id];

  @override
  Future<List<User>> findAll() async => _store.values.toList();

  @override
  Future<User> save(User user) async {
    _store[user.id] = user;
    return user;
  }

  @override
  Future<void> delete(String id) async => _store.remove(id);
}

// 타입 파라미터를 유지하며 상속 (부분 특수화)
abstract class CachedRepository<T, ID> extends Repository<T, ID> {
  final Map<ID, T> _cache = {};

  @override
  Future<T?> findById(ID id) async {
    if (_cache.containsKey(id)) {
      print('[CACHE HIT] $id');
      return _cache[id];
    }
    final entity = await fetchFromSource(id);
    if (entity != null) _cache[id] = entity;
    return entity;
  }

  // 하위 클래스가 실제 저장소 접근 구현
  Future<T?> fetchFromSource(ID id);
}

// 모델
class User {
  final String id;
  final String name;
  User(this.id, this.name);
  @override String toString() => 'User($id, $name)';
}
```

---

## 4. 제네릭 메서드와 함수

클래스 전체가 아닌 **특정 메서드나 함수에만** 타입 파라미터를 붙일 수 있습니다.

```dart
// 제네릭 최상위 함수
T identity<T>(T value) => value;

List<T> repeat<T>(T value, int times) =>
    List.generate(times, (_) => value);

T? firstOrNull<T>(List<T> list) =>
    list.isEmpty ? null : list.first;

// 타입별 변환 함수
R transform<T, R>(T input, R Function(T) fn) => fn(input);

// 제네릭 메서드
class Converter {
  // 인스턴스 제네릭 메서드
  T? safeCast<T>(Object? value) {
    return value is T ? value : null;
  }

  List<T> filterType<T>(List<Object?> items) =>
      items.whereType<T>().toList();

  Map<K, V> zipToMap<K, V>(List<K> keys, List<V> values) {
    if (keys.length != values.length) {
      throw ArgumentError('키와 값의 길이가 다릅니다');
    }
    return Map.fromIterables(keys, values);
  }
}

void main() {
  // 타입 추론 — 인수에서 T 자동 추론
  print(identity(42));          // 42 (T = int)
  print(identity('hello'));     // hello (T = String)

  print(repeat('★', 5));       // [★, ★, ★, ★, ★]
  print(repeat<int>(0, 3));     // [0, 0, 0]

  print(firstOrNull([1, 2, 3]));  // 1
  print(firstOrNull([]));          // null

  // transform — T=String, R=int
  int length = transform('Dart', (s) => s.length);
  print(length);  // 4

  var conv = Converter();

  // safeCast — 안전한 다운캐스팅
  Object? raw = 'hello';
  String? str = conv.safeCast<String>(raw);  // 'hello'
  int?   num  = conv.safeCast<int>(raw);     // null (String → int 불가)
  print('$str, $num');  // hello, null

  // filterType — 타입으로 필터
  List<Object?> mixed = [1, 'a', 2, 'b', 3.0, true];
  print(conv.filterType<int>(mixed));     // [1, 2]
  print(conv.filterType<String>(mixed));  // [a, b]

  // zipToMap
  var map = conv.zipToMap(['a', 'b', 'c'], [1, 2, 3]);
  print(map);  // {a: 1, b: 2, c: 3}
}
```

---

## 5. 타입 제약 — `extends`로 경계 설정

`<T extends SomeType>`은 **T가 SomeType이거나 그 하위 타입이어야 한다**는 제약입니다. 제약 덕분에 Mixin 내부에서 T의 멤버를 안전하게 사용할 수 있습니다.

### 5.1 단일 경계

```dart
// Comparable 제약 — T는 비교 가능해야 함
T max<T extends Comparable<T>>(T a, T b) => a.compareTo(b) >= 0 ? a : b;

T min<T extends Comparable<T>>(T a, T b) => a.compareTo(b) <= 0 ? a : b;

List<T> sorted<T extends Comparable<T>>(List<T> items) =>
    [...items]..sort();

// num 제약 — 산술 연산 허용
double average<T extends num>(List<T> numbers) {
  if (numbers.isEmpty) throw ArgumentError('빈 리스트');
  return numbers.fold(0.0, (sum, n) => sum + n) / numbers.length;
}

// 클래스 제약 — 특정 클래스 계층만 허용
abstract class Animal {
  String get name;
  String get sound;
}

class AnimalShelter<T extends Animal> {
  final List<T> _animals = [];

  void add(T animal) => _animals.add(animal);

  void makeNoise() {
    for (var a in _animals) {
      print('${a.name}: ${a.sound}');  // Animal 멤버 안전하게 접근
    }
  }

  T? find(String name) =>
      _animals.where((a) => a.name == name).firstOrNull;
}

class Dog extends Animal {
  @override final String name;
  @override final String sound = '왈왈!';
  Dog(this.name);
}

class Cat extends Animal {
  @override final String name;
  @override final String sound = '야옹';
  Cat(this.name);
}

void main() {
  // Comparable 제약
  print(max(10, 20));         // 20
  print(max('apple', 'zoo')); // zoo
  print(sorted([3, 1, 4, 1, 5, 9]));  // [1, 1, 3, 4, 5, 9]

  // num 제약
  print(average([1, 2, 3, 4, 5]));     // 3.0
  print(average([1.5, 2.5, 3.5]));     // 2.5
  // average(['a', 'b']);               // ❌ 컴파일 오류

  // Animal 제약
  var shelter = AnimalShelter<Dog>();
  shelter.add(Dog('바둑이'));
  shelter.add(Dog('흰둥이'));
  shelter.makeNoise();
  // 바둑이: 왈왈!
  // 흰둥이: 왈왈!
  // shelter.add(Cat('나비'));  // ❌ AnimalShelter<Dog>에 Cat 추가 불가
}
```

---

### 5.2 경계와 인터페이스 조합

```dart
abstract class Identifiable {
  String get id;
}

abstract class Timestamped {
  DateTime get createdAt;
  DateTime get updatedAt;
}

// 여러 인터페이스를 만족하는 타입으로 제약
// Dart는 <T extends A & B> 문법이 없으므로
// 공통 추상 클래스나 mixin으로 결합

abstract class Entity implements Identifiable, Timestamped {}

class GenericService<T extends Entity> {
  final Map<String, T> _store = {};

  void save(T entity) {
    _store[entity.id] = entity;
    print('저장: ${entity.id} (${entity.createdAt})');
  }

  T? findById(String id) => _store[id];

  // updatedAt 기준 최신순 정렬
  List<T> findAllSorted() => _store.values.toList()
    ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

  // T의 인터페이스 멤버를 직접 활용
  List<T> findUpdatedAfter(DateTime since) =>
      _store.values.where((e) => e.updatedAt.isAfter(since)).toList();
}

// Entity 구현체
class Product extends Entity {
  @override final String id;
  final String name;
  final double price;
  @override final DateTime createdAt;
  @override final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.price,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();
}

void main() {
  var service = GenericService<Product>();

  service.save(Product(id: 'p001', name: '노트북', price: 1200000));
  service.save(Product(id: 'p002', name: '마우스', price: 35000));

  var found = service.findById('p001');
  print(found?.name);  // 노트북
}
```

---

## 6. 공변성과 반공변성 (개념)

제네릭 타입과 서브타입 관계에서 중요한 개념입니다.

```
Dog extends Animal 이라면
  List<Dog>는 List<Animal>의 서브타입인가?

직관적으로는 YES지만, 실제로는 안전하지 않습니다.
```

```dart
void main() {
  List<Dog> dogs = [Dog('바둑이'), Dog('흰둥이')];

  // Dart는 List를 공변(covariant)으로 취급 — 읽기 안전
  List<Animal> animals = dogs;  // ✅ Dart에서 허용 (런타임 체크)

  // 하지만 쓰기 시도 시 런타임 오류
  // animals.add(Cat('나비'));  // 💥 런타임 TypeError
                                // dogs에 Cat 추가 불가

  // 읽기는 안전 — Dog는 Animal이므로
  for (var a in animals) {
    print(a.name);  // ✅ Animal.name 접근 가능
  }
}
```

**`covariant` 키워드 — 매개변수 공변 선언**

```dart
class AnimalFeeder {
  void feed(Animal animal) => print('${animal.name} 먹이 줌');
}

class DogFeeder extends AnimalFeeder {
  // covariant — Dog 또는 그 하위 타입만 허용하도록 좁힘
  @override
  void feed(covariant Dog dog) => print('${dog.name}에게 개사료');
}

void main() {
  DogFeeder feeder = DogFeeder();
  feeder.feed(Dog('바둑이'));  // ✅

  AnimalFeeder af = feeder;
  // af.feed(Cat('나비'));     // 💥 런타임 TypeError
                               // DogFeeder는 Dog만 받을 수 있음
}
```

**실무적 공변성 원칙 (PECS)**

```
Producer Extends, Consumer Super

List를 생산자(읽기)로만 쓴다면 → List<하위타입> 허용
List를 소비자(쓰기)로만 쓴다면 → List<상위타입> 필요

Dart에서는 대부분 타입 추론과 런타임 검사로 처리됩니다.
읽기 전용 List는 List.unmodifiable()로 안전성 확보 권장.
```

---

## 7. 제네릭과 런타임 타입

### 7.1 타입 추론

Dart 컴파일러는 문맥에서 타입 파라미터를 **자동으로 추론**합니다.

```dart
void main() {
  // 타입 추론 — <int> 생략 가능
  var list1 = <int>[1, 2, 3];        // List<int>
  var list2 = [1, 2, 3];             // List<int> (리터럴에서 추론)

  var map1 = <String, int>{};        // Map<String, int>
  var map2 = {'a': 1, 'b': 2};       // Map<String, int>

  // 함수 반환 타입에서 추론
  List<String> getNames() => ['Alice', 'Bob'];
  var names = getNames();            // List<String>

  // 제네릭 함수 — 인수에서 추론
  T first<T>(List<T> list) => list.first;
  var n = first([1, 2, 3]);         // int — T = int 추론
  var s = first(['a', 'b']);        // String — T = String 추론

  // 타입 추론 실패 시 명시적 지정 필요
  var empty1 = [];              // List<dynamic> — 의도치 않을 수 있음
  var empty2 = <String>[];      // List<String> — 명시적
}
```

---

### 7.2 타입 토큰 패턴

런타임에 타입 정보를 보존하는 패턴입니다. Dart의 제네릭은 **구체화(Reified)** — 런타임에도 타입 정보가 유지됩니다.

```dart
void main() {
  // 런타임 타입 확인 — 제네릭 타입 정보 유지
  List<int>    intList    = [1, 2, 3];
  List<String> stringList = ['a', 'b'];

  print(intList.runtimeType);     // List<int>
  print(stringList.runtimeType);  // List<String>

  // is 검사에서도 제네릭 타입 구분
  Object obj = <int>[1, 2, 3];
  print(obj is List<int>);     // true
  print(obj is List<String>);  // false ← Java와 다름! (Dart는 구체화 제네릭)
}

// 타입 토큰 — 타입을 런타임 값으로 전달
class TypeToken<T> {
  const TypeToken();
  Type get type => T;
  bool matches(Object? obj) => obj is T;
  T cast(Object? obj) => obj as T;
}

// DI 컨테이너 간단 구현
class Container {
  final Map<Type, Object> _bindings = {};

  void register<T>(T instance) {
    _bindings[T] = instance as Object;
  }

  T resolve<T>() {
    final instance = _bindings[T];
    if (instance == null) throw StateError('$T가 등록되지 않음');
    return instance as T;
  }
}

void main() {
  var token = TypeToken<String>();
  print(token.type);           // String
  print(token.matches('hi'));  // true
  print(token.matches(42));    // false

  var container = Container();
  container.register<String>('app-config');
  container.register<int>(8080);

  print(container.resolve<String>());  // app-config
  print(container.resolve<int>());     // 8080
}
```

---

## 8. 실용 제네릭 패턴

### 8.1 Result 타입

Step 13에서 소개한 Result 패턴을 제네릭으로 완성합니다.

```dart
// sealed + 제네릭 — 성공/실패를 타입 안전하게 표현
sealed class Result<T> {
  const Result();

  // 팩토리 생성자
  factory Result.success(T value) = Success<T>;
  factory Result.failure(Exception error, [StackTrace? stackTrace]) =
      Failure<T>;

  // 공통 메서드
  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  T getOrElse(T defaultValue) => switch (this) {
    Success(:final value) => value,
    Failure()             => defaultValue,
  };

  T getOrThrow() => switch (this) {
    Success(:final value) => value,
    Failure(:final error) => throw error,
  };

  Result<R> map<R>(R Function(T) transform) => switch (this) {
    Success(:final value) => Result.success(transform(value)),
    Failure(:final error, :final stackTrace) =>
        Result.failure(error, stackTrace),
  };

  Result<R> flatMap<R>(Result<R> Function(T) transform) => switch (this) {
    Success(:final value) => transform(value),
    Failure(:final error, :final stackTrace) =>
        Result.failure(error, stackTrace),
  };

  void fold({
    required void Function(T) onSuccess,
    required void Function(Exception) onFailure,
  }) {
    switch (this) {
      case Success(:final value):  onSuccess(value);
      case Failure(:final error):  onFailure(error);
    }
  }
}

class Success<T> extends Result<T> {
  final T value;
  const Success(this.value);
  @override String toString() => 'Success($value)';
}

class Failure<T> extends Result<T> {
  final Exception error;
  final StackTrace? stackTrace;
  const Failure(this.error, [this.stackTrace]);
  @override String toString() => 'Failure($error)';
}

// 활용
Result<int> parseInt(String s) {
  try {
    return Result.success(int.parse(s));
  } on FormatException catch (e) {
    return Result.failure(e);
  }
}

Result<double> safeDivide(int a, int b) {
  if (b == 0) return Result.failure(ArgumentError('0으로 나눌 수 없음'));
  return Result.success(a / b);
}

void main() {
  // 체이닝
  var result = parseInt('42')
      .flatMap((n) => safeDivide(n * 2, 7))
      .map((d) => d.toStringAsFixed(3));

  result.fold(
    onSuccess: (v) => print('성공: $v'),   // 성공: 12.000
    onFailure: (e) => print('실패: $e'),
  );

  // 실패 케이스
  parseInt('abc')
      .map((n) => n * 2)  // 실패면 map은 통과
      .fold(
        onSuccess: (v) => print('결과: $v'),
        onFailure: (e) => print('파싱 실패: $e'),  // 파싱 실패: ...
      );

  print(parseInt('100').getOrElse(0));  // 100
  print(parseInt('bad').getOrElse(0));  // 0
}
```

---

### 8.2 제네릭 Repository

```dart
// 제네릭 CRUD Repository 인터페이스
abstract class Repository<T, ID> {
  Future<T?> findById(ID id);
  Future<List<T>> findAll();
  Future<List<T>> findWhere(bool Function(T) predicate);
  Future<T> save(T entity);
  Future<void> delete(ID id);
  Future<int> count();
  Future<bool> exists(ID id);
}

// 인메모리 구현 — 어떤 T, ID에도 동작
class InMemoryRepository<T, ID> implements Repository<T, ID> {
  final Map<ID, T> _store = {};
  final ID Function(T) _idExtractor;

  InMemoryRepository(this._idExtractor);

  @override
  Future<T?> findById(ID id) async => _store[id];

  @override
  Future<List<T>> findAll() async => _store.values.toList();

  @override
  Future<List<T>> findWhere(bool Function(T) predicate) async =>
      _store.values.where(predicate).toList();

  @override
  Future<T> save(T entity) async {
    _store[_idExtractor(entity)] = entity;
    return entity;
  }

  @override
  Future<void> delete(ID id) async => _store.remove(id);

  @override
  Future<int> count() async => _store.length;

  @override
  Future<bool> exists(ID id) async => _store.containsKey(id);
}

// 모델
class Product {
  final String id;
  final String name;
  final double price;
  final String category;

  Product({required this.id, required this.name,
           required this.price, required this.category});

  @override
  String toString() => 'Product($id: $name, $price원)';
}

void main() async {
  // Product용 Repository — ID 추출자 지정
  final repo = InMemoryRepository<Product, String>((p) => p.id);

  await repo.save(Product(id: 'p001', name: '노트북', price: 1200000, category: '전자기기'));
  await repo.save(Product(id: 'p002', name: '마우스', price: 35000, category: '전자기기'));
  await repo.save(Product(id: 'p003', name: '책상', price: 250000, category: '가구'));

  print(await repo.count());  // 3

  // 카테고리 필터
  final electronics = await repo.findWhere((p) => p.category == '전자기기');
  electronics.forEach(print);
  // Product(p001: 노트북, 1200000.0원)
  // Product(p002: 마우스, 35000.0원)

  // 가격 필터
  final affordable = await repo.findWhere((p) => p.price < 100000);
  affordable.forEach(print);
  // Product(p002: 마우스, 35000.0원)

  await repo.delete('p001');
  print(await repo.exists('p001'));  // false
}
```

---

### 8.3 제네릭 캐시

```dart
class Cache<K, V> {
  final Map<K, _CacheEntry<V>> _store = {};
  final Duration? defaultTtl;
  final int? maxSize;

  Cache({this.defaultTtl, this.maxSize});

  void set(K key, V value, {Duration? ttl}) {
    // 최대 크기 초과 시 가장 오래된 항목 제거
    if (maxSize != null && _store.length >= maxSize! && !_store.containsKey(key)) {
      _store.remove(_store.keys.first);
    }
    _store[key] = _CacheEntry(
      value:     value,
      expiresAt: ttl != null
          ? DateTime.now().add(ttl)
          : defaultTtl != null
              ? DateTime.now().add(defaultTtl!)
              : null,
    );
  }

  V? get(K key) {
    final entry = _store[key];
    if (entry == null) return null;
    if (entry.isExpired) { _store.remove(key); return null; }
    return entry.value;
  }

  V getOrSet(K key, V Function() factory, {Duration? ttl}) {
    final cached = get(key);
    if (cached != null) return cached;
    final value = factory();
    set(key, value, ttl: ttl);
    return value;
  }

  Future<V> getOrFetch(K key, Future<V> Function() fetcher, {Duration? ttl}) async {
    final cached = get(key);
    if (cached != null) {
      print('[CACHE HIT] $key');
      return cached;
    }
    print('[CACHE MISS] $key');
    final value = await fetcher();
    set(key, value, ttl: ttl);
    return value;
  }

  void remove(K key) => _store.remove(key);
  void clear()       => _store.clear();
  int  get size      => _store.length;
}

class _CacheEntry<V> {
  final V value;
  final DateTime? expiresAt;

  _CacheEntry({required this.value, this.expiresAt});

  bool get isExpired =>
      expiresAt != null && DateTime.now().isAfter(expiresAt!);
}

void main() async {
  // 문자열 캐시 — 5분 TTL, 최대 100개
  final cache = Cache<String, String>(
    defaultTtl: Duration(minutes: 5),
    maxSize: 100,
  );

  cache.set('greeting', '안녕하세요');
  print(cache.get('greeting'));  // 안녕하세요

  // 비동기 캐시
  final userCache = Cache<String, Map<String, dynamic>>(
    defaultTtl: Duration(minutes: 30),
  );

  Future<Map<String, dynamic>> fetchUser(String id) async {
    await Future.delayed(Duration(milliseconds: 100));
    return {'id': id, 'name': '홍길동'};
  }

  var u1 = await userCache.getOrFetch('u001', () => fetchUser('u001'));
  var u2 = await userCache.getOrFetch('u001', () => fetchUser('u001')); // 캐시 히트
  print(u1);
  // [CACHE MISS] u001
  // [CACHE HIT] u001
}
```

---

### 8.4 Builder 패턴

```dart
class QueryBuilder<T> {
  final List<bool Function(T)> _filters   = [];
  final List<Comparator<T>>    _sorters   = [];
  int? _limit;
  int  _offset = 0;

  QueryBuilder<T> where(bool Function(T) predicate) {
    _filters.add(predicate);
    return this;  // 체이닝을 위해 자신 반환
  }

  QueryBuilder<T> orderBy<K extends Comparable<K>>(K Function(T) key, {bool descending = false}) {
    _sorters.add((a, b) {
      final comparison = key(a).compareTo(key(b));
      return descending ? -comparison : comparison;
    });
    return this;
  }

  QueryBuilder<T> limit(int count) { _limit = count; return this; }

  QueryBuilder<T> offset(int count) { _offset = count; return this; }

  List<T> execute(List<T> source) {
    var result = source.where((item) => _filters.every((f) => f(item))).toList();

    for (var sorter in _sorters) result.sort(sorter);

    result = result.skip(_offset).toList();
    if (_limit != null) result = result.take(_limit!).toList();

    return result;
  }
}

class Employee {
  final String name;
  final String dept;
  final double salary;
  final int    yearsExp;

  Employee(this.name, this.dept, this.salary, this.yearsExp);

  @override String toString() => '$name($dept, ${salary}만원, ${yearsExp}년)';
}

void main() {
  final employees = [
    Employee('홍길동', '개발', 500, 5),
    Employee('김철수', '영업', 400, 3),
    Employee('이영희', '개발', 600, 8),
    Employee('박민준', '기획', 450, 4),
    Employee('최수연', '개발', 550, 6),
  ];

  // 쿼리 빌더 — 개발팀, 연봉 500 이상, 연봉 내림차순, 상위 2명
  final result = QueryBuilder<Employee>()
      .where((e) => e.dept == '개발')
      .where((e) => e.salary >= 500)
      .orderBy((e) => e.salary, descending: true)
      .limit(2)
      .execute(employees);

  result.forEach(print);
  // 이영희(개발, 600.0만원, 8년)
  // 최수연(개발, 550.0만원, 6년)
}
```

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: 제네릭 `Option` 타입 구현

Dart의 nullable(`T?`)을 명시적 타입으로 표현하는 `Option<T>`를 구현하세요.

**요구사항**

- `Some<T>` — 값이 있는 경우
- `None<T>` — 값이 없는 경우
- `map<R>(R Function(T))` — 값이 있으면 변환, 없으면 None 반환
- `getOrElse(T)` — 값이 있으면 반환, 없으면 기본값 반환
- `Option.of(T?)` factory — nullable을 Option으로 변환

```dart
sealed class Option<T> {
  const Option();

  factory Option.of(T? value) => /* TODO */;
  factory Option.some(T value) = Some<T>;
  factory Option.none() = None<T>;

  Option<R> map<R>(R Function(T) transform);
  T getOrElse(T defaultValue);
  bool get isSome;
  bool get isNone;
}

class Some<T> extends Option<T> { /* TODO */ }
class None<T> extends Option<T> { /* TODO */ }

void main() {
  Option<String> name = Option.of('홍길동');
  Option<String> empty = Option.of(null);

  print(name.getOrElse('익명'));   // 홍길동
  print(empty.getOrElse('익명'));  // 익명

  // 체이닝
  var length = name.map((s) => s.length);
  print(length.getOrElse(0));  // 3

  var noneLength = empty.map((s) => s.length);
  print(noneLength.getOrElse(0));  // 0
}
```

> **정답 힌트**
>
> ```dart
> sealed class Option<T> {
>   const Option();
>   factory Option.of(T? value) =>
>       value != null ? Some(value) : None<T>();
>   factory Option.some(T value) = Some<T>;
>   factory Option.none() = None<T>;
>
>   Option<R> map<R>(R Function(T) transform);
>   T getOrElse(T defaultValue);
>   bool get isSome;
>   bool get isNone;
> }
>
> class Some<T> extends Option<T> {
>   final T value;
>   const Some(this.value);
>   @override Option<R> map<R>(R Function(T) f) => Some(f(value));
>   @override T getOrElse(T _) => value;
>   @override bool get isSome => true;
>   @override bool get isNone => false;
>   @override String toString() => 'Some($value)';
> }
>
> class None<T> extends Option<T> {
>   const None();
>   @override Option<R> map<R>(R Function(T) f) => None<R>();
>   @override T getOrElse(T defaultValue) => defaultValue;
>   @override bool get isSome => false;
>   @override bool get isNone => true;
>   @override String toString() => 'None';
> }
> ```

### 실습 9-2: 타입 제약 활용

아래 요구사항의 제네릭 함수를 작성하세요.

```dart
// 1. T extends num — 리스트에서 최솟값/최댓값/합계/평균 반환
class Statistics<T extends num> {
  final List<T> data;
  Statistics(this.data);

  // TODO: min, max, sum, average getter 구현
}

// 2. T extends Comparable — 이진 탐색
int binarySearch<T extends Comparable<T>>(List<T> sorted, T target) {
  // TODO: 구현 (없으면 -1 반환)
}

void main() {
  var stats = Statistics([3, 1, 4, 1, 5, 9, 2, 6]);
  print('최솟값: ${stats.min}');   // 1
  print('최댓값: ${stats.max}');   // 9
  print('합계: ${stats.sum}');     // 31
  print('평균: ${stats.average}'); // 3.875

  print(binarySearch([1, 3, 5, 7, 9], 5));   // 2
  print(binarySearch([1, 3, 5, 7, 9], 4));   // -1
  print(binarySearch(['a', 'c', 'e'], 'c'));  // 1
}
```

> **정답 힌트**
>
> ```dart
> class Statistics<T extends num> {
>   final List<T> data;
>   Statistics(this.data) {
>     if (data.isEmpty) throw ArgumentError('빈 리스트');
>   }
>
>   T   get min     => data.reduce((a, b) => a < b ? a : b);
>   T   get max     => data.reduce((a, b) => a > b ? a : b);
>   num get sum     => data.fold(0, (acc, n) => acc + n);
>   double get average => sum / data.length;
> }
>
> int binarySearch<T extends Comparable<T>>(List<T> sorted, T target) {
>   int lo = 0, hi = sorted.length - 1;
>   while (lo <= hi) {
>     final mid = (lo + hi) ~/ 2;
>     final cmp = sorted[mid].compareTo(target);
>     if (cmp == 0) return mid;
>     if (cmp < 0) lo = mid + 1;
>     else         hi = mid - 1;
>   }
>   return -1;
> }
> ```

### 실습 9-3: 제네릭 Event Emitter

타입 안전한 이벤트 에미터를 구현하세요.

**요구사항**

- `EventEmitter<T>` — T 타입의 이벤트를 발행/구독
- `on(void Function(T))` — 구독 등록
- `off(void Function(T))` — 구독 해제
- `emit(T)` — 이벤트 발행
- 서로 다른 이벤트 타입의 에미터가 타입 안전하게 분리되어야 함

> **정답 힌트**
>
> ```dart
> class EventEmitter<T> {
>   final List<void Function(T)> _listeners = [];
>
>   void on(void Function(T) listener)  => _listeners.add(listener);
>   void off(void Function(T) listener) => _listeners.remove(listener);
>   void emit(T event) {
>     for (var listener in List.of(_listeners)) {
>       listener(event);
>     }
>   }
> }
>
> class LoginEvent {
>   final String userId;
>   LoginEvent(this.userId);
> }
>
> void main() {
>   final loginEmitter = EventEmitter<LoginEvent>();
>   final countEmitter = EventEmitter<int>();
>
>   loginEmitter.on((e) => print('로그인: ${e.userId}'));
>   countEmitter.on((n) => print('카운트: $n'));
>
>   loginEmitter.emit(LoginEvent('u001'));  // 로그인: u001
>   countEmitter.emit(42);                 // 카운트: 42
>   // loginEmitter.emit(42);              // ❌ 컴파일 오류 — 타입 안전
> }
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                      | 핵심 내용                                      |
| ------------------------- | ---------------------------------------------- |
| 제네릭 클래스 `<T>`       | 타입을 매개변수로 만들어 코드 재사용           |
| 여러 타입 파라미터        | `<K, V>`, `<A, B, C>`                          |
| 제네릭 메서드             | 클래스 수준이 아닌 메서드 수준 타입 파라미터   |
| 타입 제약 `<T extends X>` | T의 멤버 안전 접근, 컴파일 타임 검사           |
| 공변성                    | `List<Dog>`를 `List<Animal>`로 읽기            |
| `covariant`               | 매개변수 타입 좁히기                           |
| 구체화 제네릭             | 런타임에도 타입 정보 유지 (`is List<int>`)     |
| 타입 추론                 | 컨텍스트에서 타입 파라미터 자동 추론           |
| Result 패턴               | `sealed class Result<T>` — 성공/실패 타입 표현 |
| 제네릭 Repository         | `Repository<T, ID>` — 재사용 가능한 CRUD       |
| 제네릭 캐시               | `Cache<K, V>` — TTL, 최대 크기                 |
| Builder 패턴              | `QueryBuilder<T>` — 체이닝 API                 |

### 🔗 다음 단계

> **Step 17 — Extension 메서드와 타입 확장**으로 이동하세요.

Step 17에서는 기존 클래스를 수정하지 않고 **새 메서드를 추가하는** `extension` 키워드를 학습합니다. `String`, `List`, `DateTime` 등 Dart 기본 타입과 외부 라이브러리 타입에 도메인 전용 메서드를 추가하는 방법, 제네릭 Extension, 이름 있는 Extension, Extension과 Mixin의 차이를 다룹니다. Flutter에서 광범위하게 활용되는 핵심 문법입니다.

### 📚 참고 자료

| 자료                  | 링크                                                     |
| --------------------- | -------------------------------------------------------- |
| Dart 제네릭 공식 문서 | <https://dart.dev/language/generics>                       |
| 제네릭 함수           | <https://dart.dev/language/generics#using-generic-methods> |
| 타입 시스템           | <https://dart.dev/language/type-system>                    |
| Effective Dart — 타입 | <https://dart.dev/effective-dart/design#types>             |
| DartPad 온라인 실습   | <https://dartpad.dev>                                      |

### ❓ 자가진단 퀴즈

1. **[Remember]** 제네릭 타입 파라미터의 관례적 이름(`T`, `E`, `K`, `V`, `R`)과 각각의 일반적 용도를 설명하라.
2. **[Understand]** `List<dynamic>`과 `List<Object?>`와 `List<T>`(T가 고정된 경우)의 타입 안전성 차이를 비교하라.
3. **[Understand]** Dart 제네릭이 Java와 달리 **구체화(Reified)**인 이유와, 이것이 `is List<int>` 검사를 가능하게 하는 원리를 설명하라.
4. **[Apply]** `<T extends Comparable<T>>`와 `<T extends num>` 제약의 차이를 설명하고, 각각에서 사용할 수 있는 연산의 예시를 제시하라.
5. **[Apply]** `InMemoryRepository<T, ID>`에 `findAllPaginated(int page, int pageSize)` 메서드를 추가하라.
6. **[Analyze]** Result 패턴(`Result<T>`)과 Dart의 nullable(`T?`)을 비교해 각각이 적합한 상황과 그 근거를 세 가지 관점(오류 정보, 체이닝, API 명확성)에서 분석하라.

> **4번 정답 힌트**
>
> `Comparable<T>`: `compareTo()` 메서드만 보장 → 크기 비교, 정렬 가능. `+`, `-` 등 산술 연산 불가.
> `num`: `+`, `-`, `*`, `/`, `<`, `>` 등 산술/비교 연산 모두 가능. `String` 등 비수치 타입 제외.
> 정렬이 목적이면 `Comparable`, 수학 계산이 목적이면 `num`을 선택합니다.

> **6번 정답 힌트**
>
> 오류 정보: `T?`는 실패 원인을 전달 불가, `Result<T>`는 `Exception` 객체로 상세 정보 보존.
> 체이닝: `T?`는 `?.` 연산자로 간단히 체이닝, `Result<T>`는 `map`/`flatMap`으로 풍부한 파이프라인 구성.
> API 명확성: `T?`는 null 의미가 "실패" 외 다른 의미일 수 있어 모호, `Result<T>`는 성공/실패 의도가 타입에 명시적으로 드러남.

---

_참고: 이 문서는 dart.dev 공식 문서(Generics, Type System) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
