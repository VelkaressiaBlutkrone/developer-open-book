# Step 17 — Extension 메서드와 타입 확장

> **Phase 4 | 타입 시스템과 패턴** | 예상 소요: 1일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 17 — Extension 메서드와 타입 확장](#step-17--extension-메서드와-타입-확장)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [기존 타입을 바꾸지 않고 확장하기](#기존-타입을-바꾸지-않고-확장하기)
  - [3. Extension 기본 문법](#3-extension-기본-문법)
    - [3.1 선언과 사용](#31-선언과-사용)
    - [3.2 이름 있는 Extension vs 익명 Extension](#32-이름-있는-extension-vs-익명-extension)
    - [3.3 Extension 멤버의 종류](#33-extension-멤버의-종류)
  - [4. Extension이 적용되는 타입](#4-extension이-적용되는-타입)
    - [4.1 기본 타입 확장](#41-기본-타입-확장)
    - [4.2 컬렉션 확장](#42-컬렉션-확장)
    - [4.3 nullable 타입 확장](#43-nullable-타입-확장)
  - [5. 제네릭 Extension](#5-제네릭-extension)
  - [6. 충돌 해결 — 이름 있는 Extension 활용](#6-충돌-해결--이름-있는-extension-활용)
  - [7. Extension과 Mixin/상속 비교](#7-extension과-mixin상속-비교)
  - [8. 실용 Extension 패턴](#8-실용-extension-패턴)
    - [8.1 String 확장](#81-string-확장)
    - [8.2 DateTime 확장](#82-datetime-확장)
    - [8.3 Enum Extension](#83-enum-extension)
    - [8.4 도메인 Extension 패턴](#84-도메인-extension-패턴)
  - [9. Extension의 한계](#9-extension의-한계)
  - [10. 실습](#10-실습)
    - [실습 10-1: 정적 디스패치 체험](#실습-10-1-정적-디스패치-체험)
    - [실습 10-2: List Extension 작성](#실습-10-2-list-extension-작성)
    - [실습 10-3: 도메인 Extension 설계](#실습-10-3-도메인-extension-설계)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [Extension vs 다른 방식 선택 기준 (최종 정리)](#extension-vs-다른-방식-선택-기준-최종-정리)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                     |
| --- | ------------- | ---------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `extension on` 문법과 Extension이 가질 수 있는 멤버 종류를 나열할 수 있다                |
| 2   | 🟢 Understand | Extension이 상속·Mixin과 다른 적용 시점(컴파일 타임 정적 디스패치)을 설명할 수 있다      |
| 3   | 🟢 Understand | 이름 있는 Extension이 충돌 해결에 필요한 이유를 설명할 수 있다                           |
| 4   | 🟡 Apply      | `String`, `List`, `DateTime` 등 기본 타입에 도메인 전용 Extension을 작성할 수 있다       |
| 5   | 🟡 Apply      | 제네릭 Extension으로 여러 타입에 동시에 적용되는 메서드를 설계할 수 있다                 |
| 6   | 🟠 Analyze    | Extension, Mixin, 상속, 유틸 클래스 중 상황에 맞는 방식을 선택하고 근거를 설명할 수 있다 |

---

## 2. 서론

### 기존 타입을 바꾸지 않고 확장하기

```dart
// 문자열을 이메일인지 검사하고 싶다
String email = 'user@dart.dev';

// ❌ 방법 1: 유틸 함수 — 대상 객체가 인수로 묻힘
bool isValid = EmailUtils.isValid(email);

// ❌ 방법 2: 상속 — String은 final, 상속 불가
// class ValidatableString extends String { } // 불가

// ❌ 방법 3: Wrapper 클래스 — 매번 감싸야 함
bool isValid2 = ValidatableString(email).isEmail;

// ✅ Extension — 기존 String에 직접 메서드 추가
bool isValid3 = email.isEmail;  // 마치 처음부터 있던 것처럼
```

Extension은 **소스 코드 접근 없이** 어떤 타입에든 메서드, getter, operator, static 멤버를 추가합니다.

```
Extension의 설계 철학:
  "외부 코드에 속하는 타입이라도, 우리 도메인에 맞는 API를 붙일 수 있다"

실제 동작:
  email.isEmail
    ↓ 컴파일러가 변환
  StringValidationExtension(email).isEmail
```

> **전제 지식**: Step 8~11 (클래스, 상속, Mixin), Step 16 (제네릭)

---

## 3. Extension 기본 문법

### 3.1 선언과 사용

```
extension 이름(선택) on 대상타입 {
  // 메서드, getter, setter, operator, static 멤버
}
```

```dart
// String에 Extension 추가
extension StringValidation on String {
  bool get isEmail =>
      RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(this);

  bool get isUrl =>
      RegExp(r'^https?://').hasMatch(this);

  bool get isNumeric => double.tryParse(this) != null;

  String capitalize() =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';

  String truncate(int maxLength, {String ellipsis = '...'}) =>
      length <= maxLength ? this : '${substring(0, maxLength)}$ellipsis';
}

void main() {
  print('user@dart.dev'.isEmail);     // true
  print('not-an-email'.isEmail);      // false
  print('https://dart.dev'.isUrl);    // true
  print('3.14'.isNumeric);            // true

  print('hello world'.capitalize());  // Hello world
  print('Dart는 훌륭한 언어입니다'.truncate(10));
  // Dart는 훌륭한...
}
```

**`this` — Extension 안에서 대상 타입의 인스턴스**

```dart
extension IntExtension on int {
  // this는 int 값
  bool get isEven  => this % 2 == 0;
  bool get isOdd   => this % 2 != 0;
  bool get isPrime {
    if (this < 2) return false;
    for (int i = 2; i <= this ~/ 2; i++) {
      if (this % i == 0) return false;
    }
    return true;
  }

  // 반복 실행 — Ruby의 times처럼
  void times(void Function(int) action) {
    for (int i = 0; i < this; i++) action(i);
  }

  // Duration 생성 편의
  Duration get seconds      => Duration(seconds: this);
  Duration get milliseconds => Duration(milliseconds: this);
  Duration get minutes      => Duration(minutes: this);
}

void main() {
  print(7.isEven);   // false
  print(7.isOdd);    // true
  print(7.isPrime);  // true
  print(4.isPrime);  // false

  3.times((i) => print('반복 $i'));
  // 반복 0 / 반복 1 / 반복 2

  await Future.delayed(2.seconds);    // Duration(seconds: 2)
  await Future.delayed(500.milliseconds);
}
```

---

### 3.2 이름 있는 Extension vs 익명 Extension

```dart
// 이름 있는 Extension — 충돌 해결, import 시 숨기기 가능
extension StringUtils on String {
  String get reversed => split('').reversed.join();
}

// 익명 Extension — 같은 파일 내에서만 사용, 충돌 해결 불가
extension on String {
  bool get isPalindrome => this == split('').reversed.join();
}

void main() {
  print('dart'.reversed);      // trad (이름 있는 Extension)
  print('racecar'.isPalindrome); // true (익명 Extension)
}
```

**이름 있는 Extension의 장점**

```dart
// 다른 파일에서 import 시 충돌 hide 가능
import 'string_utils.dart' hide StringUtils;
import 'string_ext.dart';   // 다른 StringUtils Extension
```

---

### 3.3 Extension 멤버의 종류

```dart
extension RichList<T> on List<T> {
  // 1. 인스턴스 getter
  T get second {
    if (length < 2) throw RangeError('두 번째 요소 없음');
    return this[1];
  }

  T? get secondOrNull => length >= 2 ? this[1] : null;

  // 2. 인스턴스 메서드
  List<T> rotate(int n) {
    if (isEmpty) return [];
    final shift = n % length;
    return [...sublist(shift), ...sublist(0, shift)];
  }

  // 3. setter
  set second(T value) {
    if (length < 2) throw RangeError('두 번째 요소 없음');
    this[1] = value;
  }

  // 4. operator
  List<T> operator *(int times) =>
      [for (int i = 0; i < times; i++) ...this];

  // 5. static 메서드 — 타입명 없이 접근 불가 (인스턴스에 귀속 안 됨)
  //    Extension 이름으로만 접근
  static List<T> filled<T>(int count, T value) =>
      List.filled(count, value);
}

void main() {
  var list = [1, 2, 3, 4, 5];

  print(list.second);         // 2
  print(list.secondOrNull);   // 2

  list.second = 99;
  print(list);                // [1, 99, 3, 4, 5]

  print([1, 2, 3].rotate(1)); // [2, 3, 1]
  print([1, 2, 3].rotate(2)); // [3, 1, 2]

  print([1, 2] * 3);          // [1, 2, 1, 2, 1, 2]

  // static — Extension 이름으로 접근
  print(RichList.filled(3, 0));  // [0, 0, 0]
}
```

---

## 4. Extension이 적용되는 타입

### 4.1 기본 타입 확장

```dart
// double 확장
extension DoubleUtils on double {
  double roundTo(int decimals) {
    final factor = pow(10, decimals);
    return (this * factor).round() / factor;
  }

  bool get isWhole => this == truncateToDouble();

  String formatCurrency({String symbol = '₩'}) =>
      '$symbol${toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      )}';
}

// bool 확장
extension BoolUtils on bool {
  T when<T>({required T Function() onTrue, required T Function() onFalse}) =>
      this ? onTrue() : onFalse();
}

// Duration 확장
extension DurationUtils on Duration {
  String get formatted {
    final h = inHours;
    final m = inMinutes % 60;
    final s = inSeconds % 60;
    if (h > 0) return '${h}시간 ${m}분 ${s}초';
    if (m > 0) return '${m}분 ${s}초';
    return '${s}초';
  }

  Duration operator *(num factor) =>
      Duration(microseconds: (inMicroseconds * factor).round());
}

import 'dart:math';

void main() {
  print(3.14159.roundTo(2));          // 3.14
  print(4.0.isWhole);                 // true
  print(1200000.0.formatCurrency());  // ₩1,200,000

  bool isLoggedIn = true;
  String msg = isLoggedIn.when(
    onTrue:  () => '환영합니다!',
    onFalse: () => '로그인이 필요합니다',
  );
  print(msg);  // 환영합니다!

  print(Duration(hours: 1, minutes: 30, seconds: 45).formatted);
  // 1시간 30분 45초

  print((Duration(seconds: 10) * 1.5).formatted);  // 15초
}
```

---

### 4.2 컬렉션 확장

```dart
extension IterableUtils<T> on Iterable<T> {
  // 청크 분할
  Iterable<List<T>> chunked(int size) sync* {
    var chunk = <T>[];
    for (var item in this) {
      chunk.add(item);
      if (chunk.length == size) {
        yield List.unmodifiable(chunk);
        chunk = [];
      }
    }
    if (chunk.isNotEmpty) yield List.unmodifiable(chunk);
  }

  // 인덱스 포함 순회
  Iterable<(int, T)> get indexed sync* {
    int i = 0;
    for (var item in this) yield (i++, item);
  }

  // 중복 제거 (기본 distinct는 연속 중복만)
  List<T> distinctBy<K>(K Function(T) key) {
    final seen = <K>{};
    return where((item) => seen.add(key(item))).toList();
  }

  // null 제거
  Iterable<T> whereNotNull() => where((item) => item != null);

  // 빈 여부에 따른 분기
  R ifEmpty<R>({required R Function() orElse, required R Function(Iterable<T>) orElse2}) =>
      isEmpty ? orElse() : orElse2(this);
}

extension MapUtils<K, V> on Map<K, V> {
  // 값으로 키 찾기
  K? keyOf(V value) {
    for (var entry in entries) {
      if (entry.value == value) return entry.key;
    }
    return null;
  }

  // 조건부 업데이트
  Map<K, V> updateWhere(
    bool Function(K key, V value) condition,
    V Function(V) transform,
  ) {
    return map((k, v) => MapEntry(k, condition(k, v) ? transform(v) : v));
  }

  // null 값 제거
  Map<K, V> whereValueNotNull() =>
      {for (var e in entries.where((e) => e.value != null)) e.key: e.value};
}

void main() {
  var numbers = [1, 2, 3, 4, 5, 6, 7];

  // 청크 분할
  for (var chunk in numbers.chunked(3)) print(chunk);
  // [1, 2, 3]
  // [4, 5, 6]
  // [7]

  // 인덱스 포함
  for (var (i, v) in ['a', 'b', 'c'].indexed) {
    print('$i: $v');
  }
  // 0: a / 1: b / 2: c

  // distinctBy
  var people = [
    {'name': '홍길동', 'dept': '개발'},
    {'name': '김철수', 'dept': '개발'},
    {'name': '이영희', 'dept': '기획'},
  ];
  var uniqueDepts = people.distinctBy((p) => p['dept']);
  print(uniqueDepts.map((p) => p['dept']).toList());  // [개발, 기획]

  // Map
  var scores = {'수학': 90, '영어': 85, '과학': 92};
  print(scores.keyOf(85));  // 영어

  var updated = scores.updateWhere(
    (k, v) => v < 90,
    (v) => v + 5,
  );
  print(updated);  // {수학: 90, 영어: 90, 과학: 92}
}
```

---

### 4.3 nullable 타입 확장

```dart
// nullable 타입에 직접 Extension 적용
extension NullableString on String? {
  bool get isNullOrEmpty => this == null || this!.isEmpty;
  bool get isNullOrBlank => this == null || this!.trim().isEmpty;

  String orDefault(String defaultValue) => this ?? defaultValue;

  String? mapIfNotNull(String Function(String) transform) =>
      this == null ? null : transform(this!);
}

extension NullableInt on int? {
  int orZero() => this ?? 0;
  bool get isNullOrZero => this == null || this == 0;
}

void main() {
  String? name = null;
  print(name.isNullOrEmpty);        // true
  print(name.orDefault('익명'));     // 익명
  print(name.mapIfNotNull((s) => s.toUpperCase()));  // null

  name = '  ';
  print(name.isNullOrBlank);        // true

  name = '홍길동';
  print(name.isNullOrEmpty);        // false
  print(name.mapIfNotNull((s) => s.toUpperCase()));  // 홍길동

  int? count = null;
  print(count.orZero());            // 0
  print(count.isNullOrZero);        // true
}
```

---

## 5. 제네릭 Extension

```dart
// List<T>의 T에 관계없이 적용
extension SafeList<T> on List<T> {
  T? getOrNull(int index) =>
      (index >= 0 && index < length) ? this[index] : null;

  T getOrDefault(int index, T defaultValue) =>
      getOrNull(index) ?? defaultValue;

  List<T> safeSublist(int start, [int? end]) {
    final s = start.clamp(0, length);
    final e = (end ?? length).clamp(s, length);
    return sublist(s, e);
  }
}

// T가 Comparable일 때만 적용 가능한 Extension
extension SortableList<T extends Comparable<T>> on List<T> {
  T get median {
    if (isEmpty) throw StateError('빈 리스트');
    final sorted = [...this]..sort();
    return sorted[sorted.length ~/ 2];
  }

  bool get isSorted {
    for (int i = 0; i < length - 1; i++) {
      if (this[i].compareTo(this[i + 1]) > 0) return false;
    }
    return true;
  }
}

// Future<T>에 Extension
extension FutureUtils<T> on Future<T> {
  Future<T?> get nullable => then<T?>((v) => v).catchError((_) => null);

  Future<T> withTimeout(Duration duration, {T Function()? onTimeout}) =>
      timeout(duration, onTimeout: onTimeout != null ? onTimeout : null);

  Future<Result<T>> get asResult async {
    try {
      return Result.success(await this);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}

// (간단한 Result — Step 16에서 정의)
sealed class Result<T> { const Result(); }
class Success<T> extends Result<T> {
  final T value; const Success(this.value);
  @override String toString() => 'Success($value)';
}
class Failure<T> extends Result<T> {
  final Exception error; const Failure(this.error);
  @override String toString() => 'Failure($error)';
}
extension _ResultFactory<T> on Result<T> {
  static Result<T> success<T>(T v) => Success(v);
  static Result<T> failure<T>(Exception e) => Failure(e);
}

void main() async {
  var list = [10, 20, 30, 40, 50];

  print(list.getOrNull(2));         // 30
  print(list.getOrNull(99));        // null
  print(list.getOrDefault(99, -1)); // -1
  print(list.safeSublist(1, 3));    // [20, 30]
  print(list.safeSublist(3, 100));  // [40, 50]

  var sortable = [5, 2, 8, 1, 9];
  print(sortable.median);           // 8 (정렬 후 중앙)
  print(sortable.isSorted);         // false
  print([1, 2, 3].isSorted);        // true

  // Future Extension
  Future<int> good = Future.value(42);
  Future<int> bad  = Future.error(Exception('실패'));

  print(await good.nullable);  // 42
  print(await bad.nullable);   // null (예외 대신 null)
}
```

---

## 6. 충돌 해결 — 이름 있는 Extension 활용

두 Extension이 같은 이름의 멤버를 추가할 때 충돌이 발생합니다.

```dart
// 파일 A: string_ext_a.dart
extension StringA on String {
  String get shout => toUpperCase() + '!';
}

// 파일 B: string_ext_b.dart
extension StringB on String {
  String get shout => '[$this]';  // 이름 충돌
}

// 사용 파일
import 'string_ext_a.dart';
import 'string_ext_b.dart';

void main() {
  // 'dart'.shout;  // ❌ 컴파일 오류 — 어느 Extension인지 모호

  // 해결 방법 1: 하나 hide
  // import 'string_ext_b.dart' hide StringB;
  // 'dart'.shout;  // ✅ StringA.shout 사용

  // 해결 방법 2: 명시적 Extension 호출
  print(StringA('dart').shout);  // DART!
  print(StringB('dart').shout);  // [dart]
}
```

**명시적 Extension 호출 — `ExtensionName(receiver).member`**

```dart
extension Celsius on double {
  double get toFahrenheit => this * 9 / 5 + 32;
}

extension Percentage on double {
  double get toFahrenheit => this / 100;  // 이름 충돌 (다른 의미)
}

void main() {
  double temp = 100.0;

  // 명시적 호출로 충돌 해결
  print(Celsius(temp).toFahrenheit);     // 212.0 (섭씨→화씨)
  print(Percentage(temp).toFahrenheit);  // 1.0   (퍼센트→비율)
}
```

---

## 7. Extension과 Mixin/상속 비교

```
┌──────────────┬──────────────┬──────────────┬─────────────────┐
│ 특성         │ Extension    │ Mixin        │ 상속(extends)   │
├──────────────┼──────────────┼──────────────┼─────────────────┤
│ 타입 계층 변경│ ❌ 없음     │ ❌ 없음     │ ✅ IS-A 관계    │
│ 인스턴스 상태│ ❌ 불가     │ ✅ 가능     │ ✅ 가능         │
│ 다형성       │ ❌ 정적 디스패치│ ✅ 동적  │ ✅ 동적 디스패치│
│ 외부 타입 확장│ ✅ 가능    │ ❌ 불가     │ ❌ 불가(final)  │
│ 소스 필요    │ ❌ 불필요   │ 소유 클래스만│ 소유 클래스만   │
│ 적용 시점    │ 컴파일 타임  │ 선언 시      │ 선언 시         │
│ override     │ ❌ 불가     │ ✅ 가능     │ ✅ 가능         │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

**정적 디스패치 — Extension의 중요한 특성**

```dart
class Animal { void speak() => print('...'); }
class Dog extends Animal {
  @override void speak() => print('왈왈');
}

extension AnimalExt on Animal {
  void describe() => print('동물: ${runtimeType}');
}

void main() {
  Animal a = Dog();  // Dog를 Animal 타입으로 참조

  a.speak();     // 왈왈 — 동적 디스패치 (Dog.speak 실행)
  a.describe();  // 동물: Dog — 정적 디스패치 (컴파일 타임에 Animal 기준)

  // Extension은 선언된 타입(Animal)을 기준으로 컴파일 타임에 결정됨
  // → 런타임 타입(Dog)에 따라 달라지지 않음
  // → override 불가, 다형성 없음
}
```

**선택 기준**

```
이 기능이 타입의 IS-A 관계를 표현하는가?
  YES → 상속(extends) 또는 abstract class

기존 클래스에 상태(필드)가 필요한가?
  YES → Mixin (혹은 Composition)

외부 라이브러리/기본 타입에 편의 메서드가 필요한가?
  YES → Extension

여러 클래스에 같은 기능을 "주입"하고 싶은가?
  YES → Mixin (상태 포함) 또는 Extension (상태 불필요)
```

---

## 8. 실용 Extension 패턴

### 8.1 String 확장

```dart
extension StringExtensions on String {
  // ── 변환 ──
  String get toSnakeCase {
    return replaceAllMapped(
      RegExp(r'[A-Z]'),
      (m) => '_${m[0]!.toLowerCase()}',
    ).replaceFirst(RegExp(r'^_'), '');
  }

  String get toCamelCase {
    final parts = split('_');
    return parts[0] + parts.skip(1).map((s) => s.capitalize()).join();
  }

  String get toPascalCase =>
      split('_').map((s) => s.capitalize()).join();

  String capitalize() =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';

  // ── 검사 ──
  bool get isEmail =>
      RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(this);

  bool get isPhoneNumber =>
      RegExp(r'^01[016789]-?\d{3,4}-?\d{4}$').hasMatch(this);

  bool get isKorean =>
      RegExp(r'^[\uAC00-\uD7A3\s]+$').hasMatch(this);

  // ── 파싱 ──
  int?    toIntOrNull()    => int.tryParse(this);
  double? toDoubleOrNull() => double.tryParse(this);

  // ── 포맷 ──
  String repeat(int times) => this * times;

  String padBoth(int width, [String pad = ' ']) {
    if (length >= width) return this;
    final total  = width - length;
    final left   = total ~/ 2;
    final right  = total - left;
    return '${pad * left}$this${pad * right}';
  }
}

void main() {
  print('myVariableName'.toSnakeCase);   // my_variable_name
  print('my_variable_name'.toCamelCase); // myVariableName
  print('my_variable_name'.toPascalCase); // MyVariableName

  print('user@dart.dev'.isEmail);         // true
  print('010-1234-5678'.isPhoneNumber);   // true
  print('안녕하세요'.isKorean);           // true

  print('42'.toIntOrNull());              // 42
  print('abc'.toIntOrNull());             // null

  print('=-'.repeat(10));                 // =-=-=-=-=-=-=-=-=-=-
  print('Dart'.padBoth(10, '-'));         // ---Dart---
}
```

---

### 8.2 DateTime 확장

```dart
extension DateTimeExtensions on DateTime {
  // ── 비교 ──
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  bool get isYesterday {
    final yesterday = DateTime.now().subtract(Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  bool get isPast   => isBefore(DateTime.now());
  bool get isFuture => isAfter(DateTime.now());

  bool isSameDay(DateTime other) =>
      year == other.year && month == other.month && day == other.day;

  // ── 변환 ──
  DateTime get startOfDay => DateTime(year, month, day);
  DateTime get endOfDay   => DateTime(year, month, day, 23, 59, 59, 999);

  DateTime get startOfMonth => DateTime(year, month, 1);
  DateTime get endOfMonth   => DateTime(year, month + 1, 0);

  DateTime addWorkdays(int days) {
    var result = this;
    var added  = 0;
    while (added < days) {
      result = result.add(Duration(days: 1));
      if (result.weekday != DateTime.saturday &&
          result.weekday != DateTime.sunday) {
        added++;
      }
    }
    return result;
  }

  // ── 포맷 ──
  String get formatted => '$year-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';

  String get timeFormatted =>
      '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';

  String get relative {
    final diff = DateTime.now().difference(this);
    if (diff.inDays > 365)    return '${diff.inDays ~/ 365}년 전';
    if (diff.inDays > 30)     return '${diff.inDays ~/ 30}개월 전';
    if (diff.inDays > 0)      return '${diff.inDays}일 전';
    if (diff.inHours > 0)     return '${diff.inHours}시간 전';
    if (diff.inMinutes > 0)   return '${diff.inMinutes}분 전';
    return '방금 전';
  }

  String get weekdayKorean => const [
    '', '월', '화', '수', '목', '금', '토', '일'
  ][weekday];
}

void main() {
  final now  = DateTime.now();
  final past = DateTime.now().subtract(Duration(days: 2, hours: 3));

  print(now.isToday);               // true
  print(now.isPast);                // false
  print(now.formatted);             // 2026-03-13
  print(now.timeFormatted);         // 현재 시각
  print(now.weekdayKorean);         // 요일

  print(past.relative);             // 2일 전

  final deadline = DateTime(2026, 3, 13);
  print(deadline.addWorkdays(5).formatted);  // 5영업일 후
}
```

---

### 8.3 Enum Extension

```dart
enum OrderStatus { pending, confirmed, shipped, delivered, cancelled }

extension OrderStatusExtension on OrderStatus {
  String get label => switch (this) {
    OrderStatus.pending   => '주문 대기',
    OrderStatus.confirmed => '주문 확인',
    OrderStatus.shipped   => '배송 중',
    OrderStatus.delivered => '배송 완료',
    OrderStatus.cancelled => '주문 취소',
  };

  String get icon => switch (this) {
    OrderStatus.pending   => '⏳',
    OrderStatus.confirmed => '✅',
    OrderStatus.shipped   => '🚚',
    OrderStatus.delivered => '📦',
    OrderStatus.cancelled => '❌',
  };

  bool get isTerminal =>
      this == OrderStatus.delivered || this == OrderStatus.cancelled;

  bool get isActive =>
      this != OrderStatus.cancelled && this != OrderStatus.delivered;

  // Enum을 향상된 Enum으로 업그레이드하기 전 임시로 메서드 추가
  List<OrderStatus> get nextAllowed => switch (this) {
    OrderStatus.pending   => [OrderStatus.confirmed, OrderStatus.cancelled],
    OrderStatus.confirmed => [OrderStatus.shipped,   OrderStatus.cancelled],
    OrderStatus.shipped   => [OrderStatus.delivered],
    _                     => [],
  };
}

void main() {
  for (var status in OrderStatus.values) {
    print('${status.icon} ${status.label} (종료: ${status.isTerminal})');
  }
  // ⏳ 주문 대기 (종료: false)
  // ✅ 주문 확인 (종료: false)
  // 🚚 배송 중 (종료: false)
  // 📦 배송 완료 (종료: true)
  // ❌ 주문 취소 (종료: true)

  print(OrderStatus.pending.nextAllowed);
  // [OrderStatus.confirmed, OrderStatus.cancelled]
}
```

---

### 8.4 도메인 Extension 패턴

프로젝트 내부에서 도메인 언어를 자연스럽게 표현합니다.

```dart
// 가격 계산 도메인
extension PriceExtension on num {
  // 부가세 포함 가격
  double get withVat => this * 1.1;

  // 할인 적용
  double discount(double percentage) => this * (1 - percentage / 100);

  // 가격 포맷 (원)
  String get wonFormat =>
      '${toInt().toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      )}원';
}

// 사용자 권한 체크 도메인
enum UserRole { guest, member, moderator, admin }

extension UserRoleExtension on UserRole {
  bool get canPost   => index >= UserRole.member.index;
  bool get canDelete => index >= UserRole.moderator.index;
  bool get canBan    => index >= UserRole.admin.index;

  bool isAtLeast(UserRole role) => index >= role.index;
}

// List<User> 도메인 쿼리
class User {
  final String name;
  final UserRole role;
  final int score;
  User(this.name, this.role, this.score);
}

extension UserListExtension on List<User> {
  List<User> get admins      => where((u) => u.role == UserRole.admin).toList();
  List<User> get activeUsers => where((u) => u.role.isAtLeast(UserRole.member)).toList();
  User? get topScorer        => isEmpty ? null : reduce((a, b) => a.score > b.score ? a : b);
  double get averageScore    => isEmpty ? 0 : map((u) => u.score).fold(0, (a, b) => a + b) / length;
}

void main() {
  print(50000.withVat.wonFormat);          // 55,000원
  print(100000.discount(15).wonFormat);   // 85,000원

  var users = [
    User('홍길동', UserRole.admin, 980),
    User('김철수', UserRole.member, 750),
    User('이영희', UserRole.moderator, 890),
    User('박민준', UserRole.guest, 100),
  ];

  print(users.admins.map((u) => u.name).toList());       // [홍길동]
  print(users.activeUsers.map((u) => u.name).toList());  // [홍길동, 김철수, 이영희]
  print(users.topScorer?.name);                          // 홍길동
  print(users.averageScore);                             // 680.0

  print(UserRole.member.canPost);    // true
  print(UserRole.member.canDelete);  // false
  print(UserRole.admin.canBan);      // true
}
```

---

## 9. Extension의 한계

Extension을 사용할 때 알아야 할 제약입니다.

```dart
// ❌ 한계 1: 인스턴스 필드 추가 불가
extension WithState on String {
  // int count = 0;  // ❌ 컴파일 오류 — Extension은 상태를 가질 수 없음
}

// ❌ 한계 2: 다형성 없음 — 오버라이드 불가
class MyString {
  String value;
  MyString(this.value);
  String greet() => 'Hello: $value';
}

extension MyStringExt on MyString {
  String greet() => 'Hi: $value';  // 원본 greet()를 override하지 않음
}

void main() {
  var s = MyString('World');
  print(s.greet());         // Hello: World — 원본 메서드 호출
  // Extension.greet는 원본과 이름이 같으면 무시됨
  print(MyStringExt(s).greet());  // Hi: World — 명시적 호출만 가능
}

// ❌ 한계 3: dynamic 타입에는 Extension 적용 안 됨
void noDynamic() {
  dynamic x = 'hello';
  // x.isEmail;  // ❌ 런타임 오류 — dynamic에는 Extension 미적용
  (x as String).isEmail;  // ✅ 타입 캐스팅 후 사용
}

// ❌ 한계 4: 생성자 추가 불가
extension CannotAddConstructor on String {
  // String.fromList(List<int> codes) { }  // ❌ 생성자 추가 불가
}

// ✅ 우회 — static factory 메서드
extension StringFactory on String {
  static String fromCodes(List<int> codes) =>
      String.fromCharCodes(codes);
}

void main2() {
  print(StringFactory.fromCodes([72, 101, 108, 108, 111]));  // Hello
}
```

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 10-1: 정적 디스패치 체험

아래 코드의 출력을 예측하고 이유를 설명하세요.

```dart
class Vehicle { String get type => '탈것'; }
class Car extends Vehicle { @override String get type => '자동차'; }

extension VehicleExt on Vehicle {
  String describe() => '${type}입니다';
}

void main() {
  Vehicle v = Car();    // Car를 Vehicle로 참조

  print(v.type);        // ?
  print(v.describe());  // ?

  Car c = Car();
  print(c.type);        // ?
  print(c.describe());  // ?
}
```

> **정답 힌트**
>
> ```
> 자동차       ← type은 동적 디스패치 (Car.type 실행)
> 자동차입니다  ← describe() 안의 type도 동적 디스패치 (Car.type)
> 자동차       ← Car.type
> 자동차입니다  ← Car.type
> ```
>
> Extension의 `describe()`는 정적으로 `VehicleExt`에 바인딩되지만, 내부에서 호출하는 `type`은 `this.type`이고 `this`는 런타임에 `Car` 인스턴스이므로 `Car.type`이 호출됩니다.

### 실습 10-2: List Extension 작성

아래 요구사항을 만족하는 `List<int>` Extension을 작성하세요.

**요구사항**

- `sum` getter: 모든 요소의 합
- `average` getter: 평균 (빈 리스트면 0.0)
- `product` getter: 모든 요소의 곱
- `normalize()`: 최솟값 0, 최댓값 1로 정규화된 `List<double>` 반환
- `histogram({int bins = 5})`: 값 범위를 `bins`개 구간으로 나눠 각 구간의 빈도를 `Map<String, int>`로 반환

```dart
extension IntListAnalysis on List<int> {
  // TODO: 구현
}

void main() {
  var data = [10, 20, 30, 40, 50];

  print(data.sum);         // 150
  print(data.average);     // 30.0
  print(data.product);     // 12000000

  print(data.normalize()); // [0.0, 0.25, 0.5, 0.75, 1.0]

  var scores = [45, 72, 88, 61, 95, 53, 77, 82, 69, 91];
  print(scores.histogram(bins: 5));
  // {40~58: 2, 58~76: 3, 76~94: 4, 94~100: 1, ...} (근사값)
}
```

> **정답 힌트**
>
> ```dart
> extension IntListAnalysis on List<int> {
>   int get sum     => fold(0, (a, b) => a + b);
>   double get average => isEmpty ? 0.0 : sum / length;
>   int get product => fold(1, (a, b) => a * b);
>
>   List<double> normalize() {
>     if (isEmpty) return [];
>     final minVal = reduce((a, b) => a < b ? a : b).toDouble();
>     final maxVal = reduce((a, b) => a > b ? a : b).toDouble();
>     final range  = maxVal - minVal;
>     if (range == 0) return List.filled(length, 0.0);
>     return map((v) => (v - minVal) / range).toList();
>   }
>
>   Map<String, int> histogram({int bins = 5}) {
>     if (isEmpty) return {};
>     final minVal = reduce((a, b) => a < b ? a : b);
>     final maxVal = reduce((a, b) => a > b ? a : b);
>     final step   = (maxVal - minVal) / bins;
>     final result = <String, int>{};
>
>     for (int i = 0; i < bins; i++) {
>       final lo  = (minVal + step * i).round();
>       final hi  = (minVal + step * (i + 1)).round();
>       final key = '$lo~$hi';
>       result[key] = where((v) => v >= lo && v < hi).length;
>     }
>     return result;
>   }
> }
> ```

### 실습 10-3: 도메인 Extension 설계

온라인 쇼핑몰 도메인의 Extension을 설계하세요.

**요구사항**

```dart
class Product {
  final String id;
  final String name;
  final double price;
  final String category;
  final int stock;
  Product({required this.id, required this.name,
           required this.price, required this.category, required this.stock});
}

// 다음 Extension을 구현하세요:
// 1. extension ProductExtension on Product
//    - isInStock getter
//    - isLowStock getter (재고 5개 이하)
//    - discountedPrice(double pct) 메서드
//    - summary getter (포맷된 문자열)

// 2. extension ProductListExtension on List<Product>
//    - totalValue getter (재고 * 가격 합계)
//    - byCategory(String) 메서드
//    - inStock getter (재고 있는 것만)
//    - cheaperThan(double price) 메서드
```

> **정답 힌트**
>
> ```dart
> extension ProductExtension on Product {
>   bool get isInStock  => stock > 0;
>   bool get isLowStock => stock > 0 && stock <= 5;
>   double discountedPrice(double pct) => price * (1 - pct / 100);
>   String get summary =>
>       '[$category] $name — ${price.toStringAsFixed(0)}원 (재고: $stock)';
> }
>
> extension ProductListExtension on List<Product> {
>   double get totalValue   => fold(0.0, (sum, p) => sum + p.price * p.stock);
>   List<Product> byCategory(String cat) => where((p) => p.category == cat).toList();
>   List<Product> get inStock => where((p) => p.isInStock).toList();
>   List<Product> cheaperThan(double price) => where((p) => p.price < price).toList();
> }
> ```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                | 핵심 내용                                         |
| ------------------- | ------------------------------------------------- |
| `extension on`      | 기존 타입에 메서드·getter·operator·static 추가    |
| `this`              | Extension 내부에서 대상 인스턴스 참조             |
| 이름 있는 Extension | 충돌 해결, 명시적 호출, import 제어               |
| 익명 Extension      | 파일 내부 전용, 충돌 해결 불가                    |
| 정적 디스패치       | 컴파일 타임 기준, 다형성 없음                     |
| 제네릭 Extension    | `<T>`, `<T extends X>`로 여러 타입에 적용         |
| nullable Extension  | `on String?` — null 처리 편의 메서드              |
| 한계                | 인스턴스 필드 불가, override 불가, dynamic 미적용 |
| 실용 패턴           | String·DateTime·Enum·도메인 Extension             |

### Extension vs 다른 방식 선택 기준 (최종 정리)

```
외부/기본 타입에 편의 메서드만 필요
  → Extension (상태 필요 없을 때)

여러 클래스에 공통 구현 주입 (상태 있음)
  → Mixin

IS-A 관계 표현 또는 공통 추상 계약
  → 상속 / abstract class

단순 유틸리티 함수
  → top-level function 또는 Extension static
```

### 🔗 다음 단계

> **Step 18 — 타입 패턴 매칭과 Sealed Class**로 이동하세요.

Step 18에서는 Dart 3.0의 강력한 패턴 매칭(`switch` expression, destructuring, guard clause)과 `sealed class`를 학습합니다. Sealed Class로 닫힌 타입 계층을 만들고, 패턴 매칭으로 exhaustiveness check를 보장하는 방법은 Step 12(Enum), Step 16(Result 패턴)을 완성하는 핵심 문법입니다.

### 📚 참고 자료

| 자료                       | 링크                                             |
| -------------------------- | ------------------------------------------------ |
| Dart Extension 공식 문서   | <https://dart.dev/language/extension-methods>      |
| Extension 타입             | <https://dart.dev/language/extension-types>        |
| Effective Dart — Extension | <https://dart.dev/effective-dart/usage#extensions> |
| DartPad 온라인 실습        | <https://dartpad.dev>                              |

### ❓ 자가진단 퀴즈

1. **[Remember]** Extension에 추가할 수 있는 멤버 종류 4가지를 나열하고, 추가할 수 없는 것은 무엇인지 설명하라.
2. **[Remember]** `dynamic` 타입 변수에 Extension이 적용되지 않는 이유를 Dart의 정적 타입 시스템 관점에서 설명하라.
3. **[Understand]** Extension의 정적 디스패치와 오버라이딩의 동적 디스패치를 비교하고, Extension이 다형성을 지원하지 않는 것이 어떤 상황에서 문제가 될 수 있는지 예시를 들어 설명하라.
4. **[Apply]** `DateTime` Extension에 `isWeekend`, `daysUntil(DateTime)`, `isInRange(DateTime from, DateTime to)` getter/메서드를 추가하라.
5. **[Apply]** `Map<K, V>` Extension에 값을 기준으로 정렬된 `List<MapEntry<K, V>>`를 반환하는 `sortedByValue({bool descending = false})` 메서드를 작성하라.
6. **[Analyze]** 다음 두 설계를 비교하라. (A) `EmailUtils.isValid(email)` 유틸 클래스 정적 메서드, (B) `email.isValid` Extension getter. 각각의 장단점을 테스트 용이성, 가독성, 네임스페이스 오염, 발견 가능성(IDE 자동완성) 네 가지 관점에서 분석하라.

> **4번 정답 힌트**
>
> ```dart
> extension DateTimeUtils on DateTime {
>   bool get isWeekend =>
>       weekday == DateTime.saturday || weekday == DateTime.sunday;
>
>   int daysUntil(DateTime other) =>
>       other.difference(this).inDays;
>
>   bool isInRange(DateTime from, DateTime to) =>
>       !isBefore(from) && !isAfter(to);
> }
> ```

> **6번 정답 힌트**
>
> 테스트: 유틸 클래스는 `EmailUtils.isValid`로 독립 테스트 쉬움. Extension은 String 자체에 붙어 분리 어려움.
> 가독성: `email.isValid`가 더 자연스럽고 체이닝 용이.
> 네임스페이스: 유틸은 클래스 이름으로 명확히 격리. Extension은 import 시 String 전체에 영향.
> 발견 가능성: Extension은 IDE가 String 입력 후 `.`만 눌러도 제안. 유틸은 클래스 이름을 알아야 함.

---

> ⬅️ [Step 16 — 제네릭](#) | ➡️ [Step 18 — 타입 패턴 매칭과 Sealed Class →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Extension Methods) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
