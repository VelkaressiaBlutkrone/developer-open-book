# Step 20 — Callable 클래스, Typedef, 함수형 프로그래밍 심화

> **Phase 5 | 최신 Dart 문법** | 예상 소요: 2일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 20 — Callable 클래스, Typedef, 함수형 프로그래밍 심화](#step-20--callable-클래스-typedef-함수형-프로그래밍-심화)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [함수를 일급 시민으로 다루기](#함수를-일급-시민으로-다루기)
  - [3. Typedef — 함수 타입에 이름 붙이기](#3-typedef--함수-타입에-이름-붙이기)
    - [3.1 함수 타입 Typedef](#31-함수-타입-typedef)
    - [3.2 제네릭 Typedef](#32-제네릭-typedef)
    - [3.3 Typedef vs inline 함수 타입](#33-typedef-vs-inline-함수-타입)
  - [4. Callable 클래스 — `call()` 메서드](#4-callable-클래스--call-메서드)
    - [4.1 기본 문법](#41-기본-문법)
    - [4.2 상태를 가진 Callable](#42-상태를-가진-callable)
    - [4.3 Callable vs 클로저](#43-callable-vs-클로저)
  - [5. 클로저 캡처 심화](#5-클로저-캡처-심화)
    - [5.1 변수 캡처와 공유](#51-변수-캡처와-공유)
    - [5.2 루프에서의 클로저](#52-루프에서의-클로저)
    - [5.3 캡처된 상태 활용 패턴](#53-캡처된-상태-활용-패턴)
  - [6. 고차 함수 패턴](#6-고차-함수-패턴)
    - [6.1 함수 합성 (Compose)](#61-함수-합성-compose)
    - [6.2 파이프라인 (Pipeline)](#62-파이프라인-pipeline)
    - [6.3 커링 (Currying)과 부분 적용 (Partial Application)](#63-커링-currying과-부분-적용-partial-application)
    - [6.4 메모이제이션 (Memoization)](#64-메모이제이션-memoization)
  - [7. 함수형 컬렉션 처리 심화](#7-함수형-컬렉션-처리-심화)
    - [7.1 `fold`로 복잡한 집계 구현](#71-fold로-복잡한-집계-구현)
    - [7.2 트랜스듀서 스타일 변환](#72-트랜스듀서-스타일-변환)
    - [7.3 lazy 평가 활용](#73-lazy-평가-활용)
  - [8. 실용 함수형 패턴](#8-실용-함수형-패턴)
    - [8.1 Strategy 패턴](#81-strategy-패턴)
    - [8.2 Middleware 체인](#82-middleware-체인)
    - [8.3 이벤트 핸들러 합성](#83-이벤트-핸들러-합성)
  - [9. 실습](#9-실습)
    - [실습 9-1: 함수 합성 파이프라인 구현](#실습-9-1-함수-합성-파이프라인-구현)
    - [실습 9-2: 메모이제이션 + 재귀](#실습-9-2-메모이제이션--재귀)
    - [실습 9-3: Callable 클래스로 검증기 빌더](#실습-9-3-callable-클래스로-검증기-빌더)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [Phase 5 완료 체크리스트](#phase-5-완료-체크리스트)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                  |
| --- | ------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `typedef`, `call()`, 클로저 캡처, 커링, 메모이제이션의 의미를 나열할 수 있다                          |
| 2   | 🟢 Understand | Callable 클래스가 클로저와 다른 점(상태의 명시성, 재사용성)을 설명할 수 있다                          |
| 3   | 🟢 Understand | 루프에서 클로저가 변수를 캡처할 때 발생하는 공유 문제와 해결 방법을 설명할 수 있다                    |
| 4   | 🟡 Apply      | `typedef`로 함수 타입에 이름을 붙이고 제네릭 함수 합성 파이프라인을 구현할 수 있다                    |
| 5   | 🟡 Apply      | 메모이제이션, 커링, 부분 적용 패턴을 실제 문제에 적용할 수 있다                                       |
| 6   | 🟠 Analyze    | 고차 함수, Callable 클래스, 클로저 중 주어진 상황에 가장 적합한 방식을 선택하고 근거를 설명할 수 있다 |

---

## 2. 서론

### 함수를 일급 시민으로 다루기

Dart에서 함수는 **일급 시민(First-Class Citizen)** 입니다. 변수에 담고, 인수로 전달하고, 반환값으로 사용할 수 있습니다.

```dart
void main() {
  // 함수를 변수에 담기
  int Function(int, int) add = (a, b) => a + b;
  print(add(3, 4));  // 7

  // 함수를 인수로 전달
  List<int> numbers = [1, 2, 3, 4, 5];
  var doubled = numbers.map((n) => n * 2).toList();
  print(doubled);  // [2, 4, 6, 8, 10]

  // 함수를 반환
  Function makeAdder(int n) => (int x) => x + n;
  var addFive = makeAdder(5);
  print(addFive(10));  // 15
}
```

함수형 프로그래밍은 이 특성을 적극 활용해 **부수 효과(Side Effect) 없는 순수 함수**를 조합해 복잡한 로직을 표현합니다.

```
명령형(Imperative):  어떻게 할 것인가 (How)
함수형(Functional):  무엇을 할 것인가 (What)

명령형 예:
  var result = [];
  for (var n in numbers) {
    if (n % 2 == 0) result.add(n * n);
  }

함수형 예:
  var result = numbers.where((n) => n % 2 == 0).map((n) => n * n).toList();
```

> **전제 지식**: Step 5 (함수, 클로저 기초), Step 7 (함수형 컬렉션), Step 16 (제네릭), Step 19 (Records)

---

## 3. Typedef — 함수 타입에 이름 붙이기

### 3.1 함수 타입 Typedef

```dart
// 반복되는 함수 타입에 이름 부여
typedef Predicate<T> = bool Function(T);
typedef Transform<T, R> = R Function(T);
typedef Consumer<T> = void Function(T);
typedef Supplier<T> = T Function();
typedef Comparator<T> = int Function(T a, T b);

// 이벤트 핸들러 타입
typedef VoidCallback       = void Function();
typedef ErrorCallback      = void Function(Exception error);
typedef ValueCallback<T>   = void Function(T value);
typedef AsyncCallback      = Future<void> Function();

// 미들웨어 타입
typedef Middleware<T> = T Function(T input, T Function(T) next);

// 사용 — 가독성 향상
List<T> filter<T>(List<T> list, Predicate<T> predicate) =>
    list.where(predicate).toList();

List<R> transform<T, R>(List<T> list, Transform<T, R> mapper) =>
    list.map(mapper).toList();

void forEach<T>(List<T> list, Consumer<T> action) =>
    list.forEach(action);

void main() {
  var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  Predicate<int> isEven  = (n) => n % 2 == 0;
  Predicate<int> isLarge = (n) => n > 5;

  print(filter(numbers, isEven));   // [2, 4, 6, 8, 10]
  print(filter(numbers, isLarge));  // [6, 7, 8, 9, 10]

  Transform<int, String> toLabel = (n) => 'Item-$n';
  print(transform([1, 2, 3], toLabel));  // [Item-1, Item-2, Item-3]

  Consumer<String> printer = print;
  forEach(['a', 'b', 'c'], printer);  // a b c
}
```

---

### 3.2 제네릭 Typedef

```dart
// 제네릭 Typedef
typedef Mapper<T, R>    = R Function(T);
typedef Reducer<T>      = T Function(T, T);
typedef BiFunction<A, B, R> = R Function(A, B);

// Record를 포함한 Typedef (Step 19)
typedef Parser<T> = (T? value, String? error) Function(String input);
typedef Validator<T> = ({bool valid, String? message}) Function(T);

// 함수를 반환하는 Typedef
typedef Factory<T>   = T Function();
typedef HandlerOf<E> = Future<void> Function(E event);

// 실용 예 — API 클라이언트 구성
typedef Interceptor = Future<Map<String, dynamic>> Function(
  Map<String, dynamic> request,
  Future<Map<String, dynamic>> Function(Map<String, dynamic>) next,
);

// Parser Typedef 활용
Parser<int> intParser = (s) {
  final value = int.tryParse(s);
  return value != null
      ? (value, null)
      : (null, '"$s"은 정수가 아닙니다');
};

Parser<double> doubleParser = (s) {
  final value = double.tryParse(s);
  return value != null
      ? (value, null)
      : (null, '"$s"은 실수가 아닙니다');
};

void main() {
  var (val, err) = intParser('42');
  print('값: $val, 오류: $err');  // 값: 42, 오류: null

  var (val2, err2) = intParser('abc');
  print('값: $val2, 오류: $err2');  // 값: null, 오류: "abc"은 정수가 아닙니다

  // Validator
  Validator<String> emailValidator = (email) => (
    valid: email.contains('@'),
    message: email.contains('@') ? null : '이메일 형식이 올바르지 않습니다',
  );

  var result = emailValidator('user@dart.dev');
  print(result);  // (valid: true, message: null)
}
```

---

### 3.3 Typedef vs inline 함수 타입

```dart
// ❌ inline 타입 — 반복 시 장황하고 오타 위험
void process(
  List<int> data,
  bool Function(int) filter,
  int Function(int) transform,
  void Function(int) action,
) {
  data.where(filter).map(transform).forEach(action);
}

// ✅ typedef — 간결하고 재사용 가능
typedef IntPredicate  = bool Function(int);
typedef IntTransform  = int  Function(int);
typedef IntConsumer   = void Function(int);

void process2(
  List<int> data,
  IntPredicate  filter,
  IntTransform  transform,
  IntConsumer   action,
) {
  data.where(filter).map(transform).forEach(action);
}

// 동등성 — typedef는 별칭, 같은 타입으로 취급
void main() {
  IntPredicate isPositive    = (n) => n > 0;
  bool Function(int) check   = (n) => n > 0;

  // 두 변수의 타입은 동일
  IntPredicate assigned = check;  // ✅ 타입 호환
  print(assigned(-1));  // false
}
```

---

## 4. Callable 클래스 — `call()` 메서드

### 4.1 기본 문법

`call()` 메서드를 정의한 클래스의 인스턴스는 **함수처럼 호출**할 수 있습니다.

```dart
class Multiplier {
  final int factor;
  const Multiplier(this.factor);

  // call() — 인스턴스를 함수처럼 호출할 때 실행
  int call(int value) => value * factor;
}

class TemperatureConverter {
  const TemperatureConverter();

  // 오버로드처럼 — named call 메서드 + call()
  double call(double celsius) => celsius * 9 / 5 + 32;  // 섭씨→화씨

  double toCelsius(double fahrenheit) => (fahrenheit - 32) * 5 / 9;
}

void main() {
  var triple = Multiplier(3);
  print(triple(5));    // 15 — triple.call(5)와 동일
  print(triple(10));   // 30

  // 함수 인수로 전달 가능
  List<int> numbers = [1, 2, 3, 4, 5];
  print(numbers.map(triple).toList());  // [3, 6, 9, 12, 15]

  // 함수 타입으로 사용
  int Function(int) fn = triple;  // Multiplier는 int Function(int)로 취급
  print(fn(7));  // 21

  var converter = TemperatureConverter();
  print(converter(100));               // 212.0 (100°C → °F)
  print(converter.toCelsius(212));     // 100.0 (212°F → °C)
}
```

---

### 4.2 상태를 가진 Callable

클로저와 달리 Callable 클래스는 **상태가 명시적이고 테스트하기 쉽습니다.**

```dart
// 상태를 가진 Callable — 호출 횟수 추적
class CountedFunction {
  final String name;
  final dynamic Function(dynamic) _fn;
  int _callCount = 0;

  CountedFunction(this.name, this._fn);

  dynamic call(dynamic arg) {
    _callCount++;
    return _fn(arg);
  }

  int get callCount => _callCount;
  void reset()      => _callCount = 0;

  @override
  String toString() => 'CountedFunction($name, called $_callCount times)';
}

// 재시도 가능한 Callable
class RetryableCall<T> {
  final Future<T> Function() _action;
  final int maxRetries;
  final Duration retryDelay;

  int _attempts = 0;
  T?  _lastResult;

  RetryableCall(this._action, {this.maxRetries = 3,
      this.retryDelay = const Duration(milliseconds: 200)});

  Future<T> call() async {
    Exception? lastError;
    for (int i = 1; i <= maxRetries; i++) {
      _attempts++;
      try {
        _lastResult = await _action();
        return _lastResult as T;
      } on Exception catch (e) {
        lastError = e;
        if (i < maxRetries) {
          await Future.delayed(retryDelay * i);
        }
      }
    }
    throw lastError!;
  }

  int get attempts  => _attempts;
  T?  get lastResult => _lastResult;
}

// 검증 Callable
class RangeValidator {
  final double min, max;
  final String fieldName;

  const RangeValidator(this.fieldName, {required this.min, required this.max});

  bool call(double value) {
    if (value < min || value > max) {
      print('$fieldName은 $min ~ $max 범위여야 합니다 (입력: $value)');
      return false;
    }
    return true;
  }
}

void main() async {
  // CountedFunction
  var doubler = CountedFunction('doubler', (x) => (x as int) * 2);
  print(doubler(5));   // 10
  print(doubler(10));  // 20
  print(doubler);      // CountedFunction(doubler, called 2 times)

  // RangeValidator
  var ageValidator   = RangeValidator('나이',   min: 0,   max: 150);
  var scoreValidator = RangeValidator('점수',   min: 0,   max: 100);

  print(ageValidator(25));    // true
  print(ageValidator(200));   // false + 오류 메시지
  print(scoreValidator(95));  // true

  // 리스트 필터에 Callable 사용
  var scores = [75, 105, 80, -5, 90];
  var valid  = scores.where(scoreValidator).toList();
  print(valid);  // [75, 80, 90] (105, -5는 메시지 출력 후 제외)
}
```

---

### 4.3 Callable vs 클로저

```dart
void main() {
  // ── 클로저 방식 ──
  int Function(int) makeMultiplierClosure(int factor) {
    // factor가 클로저에 캡처됨 — 내부적으로 어디 있는지 불명확
    return (int value) => value * factor;
  }

  var triple1 = makeMultiplierClosure(3);
  print(triple1(5));  // 15

  // ── Callable 클래스 방식 ──
  class Multiplier {
    final int factor;
    Multiplier(this.factor);
    int call(int value) => value * factor;
    @override String toString() => 'Multiplier(×$factor)';
  }

  var triple2 = Multiplier(3);
  print(triple2(5));         // 15
  print(triple2.factor);     // 3 — 상태 명시적 접근 가능
  print(triple2);            // Multiplier(×3)

  // 비교:
  // 클로저:          간결, 상태 접근 불가, 직렬화 불가
  // Callable 클래스: 장황하지만 상태 투명, 직렬화 가능, 상속/Mixin 가능
}
```

---

## 5. 클로저 캡처 심화

### 5.1 변수 캡처와 공유

```dart
void main() {
  // 클로저는 변수(참조)를 캡처 — 값이 아님
  int counter = 0;

  var increment = () { counter++; };
  var getCount  = () => counter;

  increment();
  increment();
  print(getCount());  // 2 — counter를 공유

  // 여러 클로저가 같은 변수 공유
  var fns = <void Function()>[];
  var shared = 0;

  fns.add(() { shared += 1; print('A: $shared'); });
  fns.add(() { shared += 10; print('B: $shared'); });

  fns[0]();  // A: 1
  fns[1]();  // B: 11
  fns[0]();  // A: 12  ← shared가 공유되어 변경됨
}
```

---

### 5.2 루프에서의 클로저

```dart
void main() {
  // ❌ 흔한 실수 — 루프 변수 캡처
  var closures = <void Function()>[];

  for (var i = 0; i < 3; i++) {
    closures.add(() => print(i));
    // Dart의 for 루프는 각 반복마다 새 변수 i 생성
    // → 실제로는 Dart에서 아래 결과가 나옴
  }

  closures.forEach((f) => f());
  // 0
  // 1
  // 2
  // Dart의 for 루프는 각 반복에서 i를 새로 생성하므로 안전

  // ❌ forEach는 다름 — 동일 변수를 여러 반복에서 공유할 수 있음
  // JavaScript와 달리 Dart for 루프는 안전하지만
  // 명시적으로 캡처하는 패턴을 익혀두면 좋음

  // ✅ 명시적 캡처 — 현재 값을 로컬 변수로 복사
  var safeClosure = <void Function()>[];
  var mutable = 0;

  for (var i = 0; i < 3; i++) {
    final captured = i;  // final로 현재 값 캡처
    safeClosure.add(() => print('captured: $captured, mutable: $mutable'));
    mutable = i;
  }

  safeClosure.forEach((f) => f());
  // captured: 0, mutable: 2  ← mutable은 마지막 값
  // captured: 1, mutable: 2
  // captured: 2, mutable: 2
}
```

---

### 5.3 캡처된 상태 활용 패턴

```dart
// 팩토리 함수 — 상태를 캡처한 함수 반환
typedef Logger = void Function(String message);

Logger makeLogger(String prefix, {bool timestamps = false}) {
  // prefix와 timestamps를 캡처
  return (String message) {
    final time = timestamps ? '[${DateTime.now().toIso8601String()}] ' : '';
    print('$time$prefix: $message');
  };
}

// 카운터 팩토리
({void Function() increment, void Function() decrement, int Function() value})
    makeCounter({int initial = 0, int step = 1}) {
  var count = initial;  // 캡처될 변수
  return (
    increment: () { count += step; },
    decrement: () { count -= step; },
    value:     () => count,
  );
}

// 캐시 팩토리
T Function(K) memoize<K, T>(T Function(K) fn) {
  final cache = <K, T>{};
  return (K key) {
    if (cache.containsKey(key)) {
      print('[CACHE HIT] $key');
      return cache[key] as T;
    }
    print('[CACHE MISS] $key');
    final result = fn(key);
    cache[key] = result;
    return result;
  };
}

void main() {
  // Logger
  var appLog   = makeLogger('[APP]');
  var debugLog = makeLogger('[DEBUG]', timestamps: true);

  appLog('서버 시작');       // [APP]: 서버 시작
  debugLog('포트 8080');     // [2026-...] [DEBUG]: 포트 8080

  // Counter
  var counter = makeCounter(initial: 10, step: 5);
  counter.increment();
  counter.increment();
  counter.decrement();
  print(counter.value());  // 15 (10 + 5 + 5 - 5)

  // Memoize
  int slowFib(int n) {
    if (n <= 1) return n;
    return slowFib(n - 1) + slowFib(n - 2);
  }

  // 최상위 레벨에서는 재귀 메모이제이션이 복잡 — 여기선 개념 시연
  var cachedDouble = memoize<int, int>((n) => n * 2);
  cachedDouble(5);   // CACHE MISS: 5
  cachedDouble(5);   // CACHE HIT: 5
  cachedDouble(10);  // CACHE MISS: 10
}
```

---

## 6. 고차 함수 패턴

### 6.1 함수 합성 (Compose)

두 함수를 합성해 새로운 함수를 만듭니다. `f(g(x))` 형태입니다.

```dart
typedef Fn<T> = T Function(T);

// 두 함수 합성 — g 먼저, f 나중
Fn<T> compose<T>(Fn<T> f, Fn<T> g) => (T x) => f(g(x));

// 여러 함수 합성
Fn<T> composeAll<T>(List<Fn<T>> fns) =>
    fns.reduce((f, g) => compose(f, g));

// 제네릭 합성 — 타입이 달라도 가능
B Function(A) composeG<A, B, C>(B Function(C) f, C Function(A) g) =>
    (A x) => f(g(x));

void main() {
  // 문자열 변환 파이프라인
  Fn<String> trim      = (s) => s.trim();
  Fn<String> lowercase = (s) => s.toLowerCase();
  Fn<String> addPrefix = (s) => 'user_$s';

  var normalize = composeAll([addPrefix, lowercase, trim]);
  // 실행 순서: trim → lowercase → addPrefix
  print(normalize('  HONGKILDONG  '));  // user_hongkildong

  // 숫자 변환
  Fn<int> double_ = (n) => n * 2;
  Fn<int> addTen  = (n) => n + 10;
  Fn<int> square  = (n) => n * n;

  var transform = composeAll([square, addTen, double_]);
  // 실행 순서: double_ → addTen → square
  // double_(5)=10 → addTen(10)=20 → square(20)=400
  print(transform(5));  // 400

  // 타입이 다른 합성
  var parseInt     = (String s) => int.parse(s);
  var isPositive   = (int n) => n > 0;
  var parseAndCheck = composeG<String, bool, int>(isPositive, parseInt);
  print(parseAndCheck('42'));   // true
  print(parseAndCheck('-5'));   // false
}
```

---

### 6.2 파이프라인 (Pipeline)

함수 합성의 읽기 쉬운 버전 — 데이터가 왼쪽에서 오른쪽으로 흐릅니다.

```dart
// Pipeline — f를 먼저, g를 나중에
typedef Transform<T, R> = R Function(T);

class Pipeline<T> {
  final T _value;
  const Pipeline(this._value);

  Pipeline<R> pipe<R>(R Function(T) fn) => Pipeline(fn(_value));

  T get result => _value;
}

// Extension으로 더 자연스럽게
extension PipeExtension<T> on T {
  R pipe<R>(R Function(T) fn) => fn(this);
}

// 비동기 파이프라인
class AsyncPipeline<T> {
  final Future<T> _future;
  const AsyncPipeline(this._future);

  AsyncPipeline<R> pipe<R>(Future<R> Function(T) fn) =>
      AsyncPipeline(_future.then(fn));

  AsyncPipeline<R> pipeSync<R>(R Function(T) fn) =>
      AsyncPipeline(_future.then((v) => fn(v)));

  Future<T> get result => _future;
}

void main() {
  // Pipeline 클래스
  final result = Pipeline('  Hello, Dart!  ')
      .pipe((s) => s.trim())
      .pipe((s) => s.toLowerCase())
      .pipe((s) => s.replaceAll(',', ''))
      .pipe((s) => s.split(' '))
      .result;

  print(result);  // [hello, dart!]

  // Extension pipe — 더 간결
  final result2 = '  Hello, Dart!  '
      .pipe((s) => s.trim())
      .pipe((s) => s.toLowerCase())
      .pipe((s) => s.split(' '))
      .pipe((words) => words.map((w) => w.replaceAll('!', '')).toList());

  print(result2);  // [hello, dart]

  // 숫자 파이프라인
  final stats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .pipe((list) => list.where((n) => n % 2 == 0).toList())
      .pipe((list) => list.map((n) => n * n).toList())
      .pipe((list) => list.fold(0, (a, b) => a + b));

  print(stats);  // 220 (4+16+36+64+100)
}
```

---

### 6.3 커링 (Currying)과 부분 적용 (Partial Application)

**커링**: 여러 인수를 받는 함수를 한 인수씩 받는 함수들의 체인으로 변환합니다.

**부분 적용**: 인수 일부를 미리 고정한 새 함수를 만듭니다.

```dart
// 커링 — 2인수 함수를 1인수 함수의 체인으로
typedef CurriedBi<A, B, R> = R Function(B) Function(A);

CurriedBi<A, B, R> curry<A, B, R>(R Function(A, B) fn) =>
    (A a) => (B b) => fn(a, b);

// 3인수 커링
typedef Curried3<A, B, C, R> = R Function(C) Function(B) Function(A);

Curried3<A, B, C, R> curry3<A, B, C, R>(R Function(A, B, C) fn) =>
    (A a) => (B b) => (C c) => fn(a, b, c);

// 부분 적용 — 첫 번째 인수 고정
B Function(B) partial<A, B>(B Function(A, B) fn, A a) =>
    (B b) => fn(a, b);

void main() {
  // 기본 함수
  int add(int a, int b) => a + b;
  bool isBetween(int lo, int hi, int n) => n >= lo && n <= hi;

  // 커링
  var curriedAdd = curry(add);
  var addFive    = curriedAdd(5);  // 첫 번째 인수 고정
  print(addFive(3));   // 8
  print(addFive(10));  // 15

  // 3인수 커링
  var curriedBetween = curry3(isBetween);
  var isTeen = curriedBetween(13)(19);  // 13 ~ 19
  print(isTeen(15));  // true
  print(isTeen(25));  // false

  // 부분 적용
  bool startsWith(String prefix, String s) => s.startsWith(prefix);
  var startsWithHttp = partial(startsWith, 'http');

  var urls = ['https://dart.dev', 'ftp://files.dart', 'http://old.dart'];
  print(urls.where(startsWithHttp).toList());
  // [https://dart.dev, http://old.dart]

  // 실용 예 — 정렬 비교자 부분 적용
  int compareByField(String field, Map<String, dynamic> a, Map<String, dynamic> b) =>
      (a[field] as Comparable).compareTo(b[field]);

  var users = [
    {'name': '홍길동', 'age': 30},
    {'name': '김철수', 'age': 25},
    {'name': '이영희', 'age': 35},
  ];

  // 이름 기준 정렬 비교자 부분 적용
  var byName = (Map<String, dynamic> a, Map<String, dynamic> b) =>
      compareByField('name', a, b);
  var byAge  = (Map<String, dynamic> a, Map<String, dynamic> b) =>
      compareByField('age', a, b);

  users.sort(byAge);
  print(users.map((u) => u['name']).toList());  // [김철수, 홍길동, 이영희]

  users.sort(byName);
  print(users.map((u) => u['name']).toList());  // [김철수, 이영희, 홍길동]
}
```

---

### 6.4 메모이제이션 (Memoization)

순수 함수의 결과를 캐시해 재계산을 방지합니다.

```dart
// 제네릭 메모이제이션
T Function(K) memoize<K, T>(T Function(K) fn) {
  final cache = <K, T>{};
  return (K key) => cache.putIfAbsent(key, () => fn(key));
}

// 재귀 함수 메모이제이션 — fix-point 패턴
T Function(K) memoizeRecursive<K, T>(
  T Function(T Function(K), K) fn,
) {
  final cache = <K, T>{};
  late T Function(K) memoized;

  memoized = (K key) {
    if (cache.containsKey(key)) return cache[key] as T;
    final result = fn(memoized, key);  // 재귀 호출도 캐시된 버전 사용
    cache[key] = result;
    return result;
  };

  return memoized;
}

// 2인수 함수 메모이제이션
T Function(A, B) memoize2<A, B, T>(T Function(A, B) fn) {
  final cache = <(A, B), T>{};
  return (A a, B b) => cache.putIfAbsent((a, b), () => fn(a, b));
}

void main() {
  // 기본 메모이제이션
  var callCount = 0;
  int expensive(int n) {
    callCount++;
    return n * n;  // 실제로는 복잡한 연산
  }

  var memo = memoize(expensive);
  memo(5);  memo(10);  memo(5);  memo(10);  memo(5);
  print('호출 횟수: $callCount');  // 2 (5, 10 각 1번씩)

  // 재귀 Fibonacci 메모이제이션
  callCount = 0;
  var fib = memoizeRecursive<int, int>((recurse, n) {
    callCount++;
    if (n <= 1) return n;
    return recurse(n - 1) + recurse(n - 2);
  });

  print(fib(40));  // 102334155
  print('fib 호출 횟수: $callCount');  // 41 (각 n 한 번씩)

  // 순수 재귀: 약 165,580,141번 호출
  // 메모이제이션: 41번 호출

  // 2인수 메모이제이션
  var memoAdd = memoize2((int a, int b) => a + b);
  print(memoAdd(3, 4));  // 7
  print(memoAdd(3, 4));  // 7 (캐시)
}
```

---

## 7. 함수형 컬렉션 처리 심화

### 7.1 `fold`로 복잡한 집계 구현

```dart
void main() {
  var transactions = [
    (type: 'income',  amount: 5000.0, category: '급여'),
    (type: 'expense', amount: 1200.0, category: '식비'),
    (type: 'expense', amount: 300.0,  category: '교통'),
    (type: 'income',  amount: 500.0,  category: '이자'),
    (type: 'expense', amount: 800.0,  category: '식비'),
    (type: 'expense', amount: 200.0,  category: '교통'),
  ];

  // fold로 단 한 번 순회하며 여러 통계 동시 계산
  final stats = transactions.fold(
    (income: 0.0, expense: 0.0, byCategory: <String, double>{}),
    (acc, tx) {
      final byCategory = Map<String, double>.from(acc.byCategory);
      byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;

      return (
        income:      acc.income  + (tx.type == 'income'  ? tx.amount : 0),
        expense:     acc.expense + (tx.type == 'expense' ? tx.amount : 0),
        byCategory:  byCategory,
      );
    },
  );

  print('총 수입: ${stats.income}');    // 5500.0
  print('총 지출: ${stats.expense}');   // 2500.0
  print('잔액: ${stats.income - stats.expense}');  // 3000.0
  print('카테고리별: ${stats.byCategory}');
  // {급여: 5000.0, 식비: 2000.0, 교통: 500.0, 이자: 500.0}

  // fold로 그룹화 (groupBy)
  Map<K, List<T>> groupBy<T, K>(List<T> list, K Function(T) key) =>
      list.fold({}, (acc, item) {
        (acc[key(item)] ??= []).add(item);
        return acc;
      });

  var byType = groupBy(transactions, (tx) => tx.type);
  print('수입 건수: ${byType['income']?.length}');   // 2
  print('지출 건수: ${byType['expense']?.length}');  // 4
}
```

---

### 7.2 트랜스듀서 스타일 변환

여러 변환을 하나의 순회로 처리하는 패턴입니다.

```dart
typedef Transducer<T> = Iterable<T> Function(Iterable<T>);

// 변환 조합 — 각 단계를 lazy하게 연결
Transducer<T> mapT<T>(T Function(T) fn) =>
    (items) => items.map(fn);

Transducer<T> filterT<T>(bool Function(T) predicate) =>
    (items) => items.where(predicate);

Transducer<T> takeT<T>(int n) =>
    (items) => items.take(n);

// 조합
Transducer<T> composeTransducers<T>(List<Transducer<T>> transducers) =>
    (items) => transducers.fold(items, (acc, t) => t(acc));

void main() {
  var numbers = Iterable.generate(1000, (i) => i + 1);  // 1..1000

  // 순수 체이닝 — 내부적으로 여러 Iterable 생성
  var result1 = numbers
      .where((n) => n % 2 == 0)
      .map((n) => n * n)
      .take(5)
      .toList();
  print(result1);  // [4, 16, 36, 64, 100]

  // 트랜스듀서 조합 — 동일 결과, 한 번만 순회
  var transform = composeTransducers<int>([
    filterT((n) => n % 2 == 0),
    mapT((n) => n * n),
    takeT(5),
  ]);

  var result2 = transform(numbers).toList();
  print(result2);  // [4, 16, 36, 64, 100]

  // Iterable이 lazy하므로 실제로 필요한 만큼만 계산
}
```

---

### 7.3 lazy 평가 활용

```dart
// Iterable을 lazy하게 처리 — 필요한 만큼만 계산
Iterable<T> lazyMap<T>(Iterable<T> source, T Function(T) fn) sync* {
  for (var item in source) {
    yield fn(item);  // 요청될 때만 계산
  }
}

Iterable<T> lazyFilter<T>(Iterable<T> source, bool Function(T) predicate) sync* {
  for (var item in source) {
    if (predicate(item)) yield item;
  }
}

// 무한 수열 + lazy 처리
Iterable<int> naturals() sync* {
  var n = 0;
  while (true) yield n++;  // 무한 생성
}

Iterable<int> primes() sync* {
  var candidates = naturals().skip(2);
  while (true) {
    var sieve = candidates.first;
    yield sieve;
    candidates = candidates.where((n) => n % sieve != 0);
  }
}

void main() {
  // 무한 수열에서 lazy하게 처리
  var firstTenPrimes = primes().take(10).toList();
  print(firstTenPrimes);  // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

  // lazy vs eager 성능 비교
  var largeList = List.generate(1000000, (i) => i);

  // eager — 모든 변환을 즉시 메모리에 저장
  var sw = Stopwatch()..start();
  var eager = largeList
      .map((n) => n * 2)       // 100만개 List 생성
      .where((n) => n > 100)   // 또 다른 List 생성
      .take(5)
      .toList();
  print('eager: ${sw.elapsedMilliseconds}ms');  // 상대적으로 느림

  sw.reset();
  // lazy — take(5)가 될 때까지만 계산
  var lazy = largeList
      .map((n) => n * 2)       // lazy Iterable
      .where((n) => n > 100)   // lazy Iterable
      .take(5)                  // lazy Iterable
      .toList();                // 여기서 실제 계산 (단 5개)
  print('lazy:  ${sw.elapsedMilliseconds}ms');  // 훨씬 빠름

  print(eager);  // [102, 104, 106, 108, 110]
  print(lazy);   // [102, 104, 106, 108, 110]
}
```

---

## 8. 실용 함수형 패턴

### 8.1 Strategy 패턴

```dart
typedef SortStrategy<T> = int Function(T a, T b);
typedef FilterStrategy<T> = bool Function(T item);
typedef PricingStrategy  = double Function(double basePrice);

class Product {
  final String name;
  final double price;
  final String category;
  final int stock;

  Product(this.name, this.price, this.category, this.stock);

  @override String toString() => '$name (${price.toStringAsFixed(0)}원)';
}

class ProductCatalog {
  final List<Product> _products;

  ProductCatalog(this._products);

  // 전략을 인수로 받아 동적으로 동작 변경
  List<Product> search({
    FilterStrategy<Product>? filter,
    SortStrategy<Product>?   sort,
    int?                     limit,
  }) {
    var result = _products.toList();
    if (filter != null) result = result.where(filter).toList();
    if (sort   != null) result.sort(sort);
    if (limit  != null) result = result.take(limit).toList();
    return result;
  }

  List<Product> applyPricing(PricingStrategy strategy) =>
      _products.map((p) => Product(
        p.name,
        strategy(p.price),
        p.category,
        p.stock,
      )).toList();
}

void main() {
  var catalog = ProductCatalog([
    Product('노트북', 1200000, '전자기기', 10),
    Product('마우스', 35000,   '전자기기', 50),
    Product('책상',   250000,  '가구',    20),
    Product('의자',   180000,  '가구',    15),
    Product('키보드', 80000,   '전자기기', 30),
  ]);

  // 전략 정의 — 일급 함수로
  FilterStrategy<Product> isElectronics = (p) => p.category == '전자기기';
  FilterStrategy<Product> isAffordable  = (p) => p.price < 100000;
  SortStrategy<Product>   byPriceAsc    = (a, b) => a.price.compareTo(b.price);
  SortStrategy<Product>   byPriceDesc   = (a, b) => b.price.compareTo(a.price);

  // 전자기기 중 가격 오름차순
  print(catalog.search(filter: isElectronics, sort: byPriceAsc));
  // [마우스 (35000원), 키보드 (80000원), 노트북 (1200000원)]

  // 10만원 이하 상품
  print(catalog.search(filter: isAffordable, sort: byPriceAsc));
  // [마우스 (35000원), 키보드 (80000원)]

  // 가격 정책 — 10% 할인
  PricingStrategy discount10 = (price) => price * 0.9;
  PricingStrategy vip        = (price) => price * 0.7;

  print(catalog.applyPricing(discount10).map((p) => p.toString()).toList());
}
```

---

### 8.2 Middleware 체인

```dart
typedef Handler<T>     = Future<T> Function(T request);
typedef MiddlewareFn<T> = Handler<T> Function(Handler<T> next);

// 미들웨어 체인 구성
Handler<T> applyMiddleware<T>(
  Handler<T> handler,
  List<MiddlewareFn<T>> middlewares,
) =>
    middlewares.reversed.fold(handler, (h, mw) => mw(h));

// HTTP 요청 시뮬레이션
typedef Request = Map<String, dynamic>;

// 미들웨어 정의
MiddlewareFn<Request> logging = (next) => (req) async {
  print('[LOG] → ${req['method']} ${req['path']}');
  final response = await next(req);
  print('[LOG] ← ${response['status']}');
  return response;
};

MiddlewareFn<Request> authCheck = (next) => (req) async {
  if (req['token'] == null) {
    print('[AUTH] 인증 토큰 없음');
    return {'status': 401, 'body': 'Unauthorized'};
  }
  return next(req);
};

MiddlewareFn<Request> rateLimit = (next) => (req) async {
  // 실제로는 Redis 등으로 구현
  print('[RATE] 요청 확인');
  return next(req);
};

// 실제 핸들러
Handler<Request> apiHandler = (req) async {
  return {'status': 200, 'body': '{"data": "응답 데이터"}'};
};

void main() async {
  var handler = applyMiddleware(apiHandler, [
    logging,
    authCheck,
    rateLimit,
  ]);

  print('=== 인증 없는 요청 ===');
  await handler({'method': 'GET', 'path': '/api/users'});
  // [LOG] → GET /api/users
  // [AUTH] 인증 토큰 없음
  // [LOG] ← 401

  print('\n=== 인증된 요청 ===');
  await handler({'method': 'GET', 'path': '/api/users', 'token': 'bearer-xyz'});
  // [LOG] → GET /api/users
  // [RATE] 요청 확인
  // [LOG] ← 200
}
```

---

### 8.3 이벤트 핸들러 합성

```dart
typedef EventHandler<T> = void Function(T event);

// 여러 핸들러를 하나로 합성
EventHandler<T> combineHandlers<T>(List<EventHandler<T>> handlers) =>
    (event) {
      for (var handler in handlers) handler(event);
    };

// 조건부 핸들러
EventHandler<T> when<T>(
  bool Function(T) condition,
  EventHandler<T> handler,
) =>
    (event) {
      if (condition(event)) handler(event);
    };

// 한 번만 실행하는 핸들러
EventHandler<T> once<T>(EventHandler<T> handler) {
  var called = false;
  return (event) {
    if (!called) {
      called = true;
      handler(event);
    }
  };
}

// 디바운스 핸들러
EventHandler<T> debounce<T>(EventHandler<T> handler, Duration delay) {
  dynamic timer;
  return (event) {
    timer?.cancel();
    // 실제 구현에서는 Timer 사용
    handler(event);  // 단순화
  };
}

void main() {
  // 주문 이벤트 처리
  const orderEvent = {'type': 'order', 'amount': 50000, 'userId': 'u001'};

  var logHandler     = (Map e) => print('[LOG] 이벤트: ${e['type']}');
  var emailHandler   = (Map e) => print('[EMAIL] 주문 확인 발송: ${e['userId']}');
  var pointHandler   = (Map e) => print('[POINT] 포인트 적립: ${e['amount']! ~/ 100}P');
  var alertHandler   = (Map e) => print('[ALERT] 고액 주문 알림');

  // 합성 핸들러
  var combined = combineHandlers<Map>([
    logHandler,
    emailHandler,
    pointHandler,
    when((e) => (e['amount'] as int) > 30000, alertHandler),
  ]);

  combined(orderEvent);
  // [LOG] 이벤트: order
  // [EMAIL] 주문 확인 발송: u001
  // [POINT] 포인트 적립: 500P
  // [ALERT] 고액 주문 알림

  // once — 최초 1회만
  var firstOrder = once(emailHandler);
  firstOrder(orderEvent);  // [EMAIL] 주문 확인 발송: u001
  firstOrder(orderEvent);  // (실행 안 됨)
}
```

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: 함수 합성 파이프라인 구현

아래 함수들을 `composeAll`로 합성해 텍스트 정규화 파이프라인을 만드세요.

```dart
typedef StringFn = String Function(String);

StringFn composeAll(List<StringFn> fns) {
  // TODO
}

void main() {
  StringFn trim      = (s) => s.trim();
  StringFn lowercase = (s) => s.toLowerCase();
  StringFn removeSpecial = (s) => s.replaceAll(RegExp(r'[^a-z0-9\s가-힣]'), '');
  StringFn collapseSpaces = (s) => s.replaceAll(RegExp(r'\s+'), ' ');

  var normalize = composeAll([trim, lowercase, removeSpecial, collapseSpaces]);

  print(normalize('  Hello, DART!!! World  '));
  // hello dart world
  print(normalize('  안녕하세요!!!  Dart  입니다  '));
  // 안녕하세요 dart 입니다
}
```

> **정답 힌트**
>
> ```dart
> StringFn composeAll(List<StringFn> fns) =>
>     fns.reduce((f, g) => (s) => g(f(s)));
> ```

### 실습 9-2: 메모이제이션 + 재귀

아래 두 함수를 메모이제이션으로 최적화하고 호출 횟수를 비교하세요.

```dart
// 1. 순수 재귀 fib — 호출 횟수 측정
int callCount = 0;
int fib(int n) {
  callCount++;
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// 2. 메모이제이션 버전 — memoizeRecursive 사용
// (Step 본문의 memoizeRecursive 활용)

void main() {
  callCount = 0;
  print(fib(35));
  print('순수 재귀 호출 횟수: $callCount');

  // TODO: memoizeRecursive로 동일한 계산을 수행하고 호출 횟수 비교
}
```

> **정답 힌트**
>
> ```dart
> var callCount2 = 0;
> var memoFib = memoizeRecursive<int, int>((recurse, n) {
>   callCount2++;
>   if (n <= 1) return n;
>   return recurse(n - 1) + recurse(n - 2);
> });
>
> print(memoFib(35));
> print('메모이제이션 호출 횟수: $callCount2');  // 36
> // 순수 재귀: 약 29,860,703번 vs 메모이제이션: 36번
> ```

### 실습 9-3: Callable 클래스로 검증기 빌더

아래 요구사항의 `ValidatorBuilder<T>` Callable 클래스를 구현하세요.

**요구사항**

- `ValidatorBuilder<T>`는 검증 규칙을 누적하고 `call(T)` 시 모든 규칙을 검사
- `addRule(bool Function(T), String errorMessage)` — 규칙 추가
- `call(T value)` — `({bool valid, List<String> errors})` Record 반환
- 빌더 패턴 지원 — `addRule`이 `this`를 반환해 체이닝 가능

```dart
class ValidatorBuilder<T> {
  // TODO

  ValidatorBuilder<T> addRule(bool Function(T) rule, String message) {
    // TODO
  }

  ({bool valid, List<String> errors}) call(T value) {
    // TODO
  }
}

void main() {
  var passwordValidator = ValidatorBuilder<String>()
      .addRule((s) => s.length >= 8,    '8자 이상이어야 합니다')
      .addRule((s) => s.contains(RegExp(r'[A-Z]')), '대문자가 포함되어야 합니다')
      .addRule((s) => s.contains(RegExp(r'[0-9]')), '숫자가 포함되어야 합니다')
      .addRule((s) => s.contains(RegExp(r'[!@#]')), '특수문자(!@#)가 포함되어야 합니다');

  var r1 = passwordValidator('Dart3!');
  print('유효: ${r1.valid}, 오류: ${r1.errors}');
  // 유효: false, 오류: [8자 이상이어야 합니다]

  var r2 = passwordValidator('Dart2026!');
  print('유효: ${r2.valid}, 오류: ${r2.errors}');
  // 유효: true, 오류: []
}
```

> **정답 힌트**
>
> ```dart
> class ValidatorBuilder<T> {
>   final List<(bool Function(T), String)> _rules = [];
>
>   ValidatorBuilder<T> addRule(bool Function(T) rule, String message) {
>     _rules.add((rule, message));
>     return this;
>   }
>
>   ({bool valid, List<String> errors}) call(T value) {
>     final errors = [
>       for (var (rule, msg) in _rules)
>         if (!rule(value)) msg,
>     ];
>     return (valid: errors.isEmpty, errors: errors);
>   }
> }
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념             | 핵심 내용                                            |
| ---------------- | ---------------------------------------------------- |
| `typedef`        | 함수 타입에 이름 부여 — 가독성, 재사용성 향상        |
| 제네릭 `typedef` | `Mapper<T, R>`, `Parser<T>` 등 범용 타입 별칭        |
| `call()` 메서드  | 클래스 인스턴스를 함수처럼 호출 가능                 |
| Callable 클래스  | 상태 명시적, 테스트 용이, 함수 인수로 전달 가능      |
| 클로저 캡처      | 참조 캡처 — 공유 주의, `final`로 명시적 복사         |
| 함수 합성        | `compose(f, g)(x)` = `f(g(x))`, 오른쪽에서 왼쪽 실행 |
| 파이프라인       | 왼쪽에서 오른쪽, `.pipe()` Extension 패턴            |
| 커링             | 다인수 함수 → 단일 인수 함수 체인                    |
| 부분 적용        | 일부 인수 고정 → 새 함수 생성                        |
| 메모이제이션     | 순수 함수 결과 캐시 — `putIfAbsent` 활용             |
| `fold` 심화      | 단일 순회로 복잡한 집계, 그룹화 구현                 |
| lazy 평가        | `Iterable` + `sync*` — 필요할 때만 계산              |
| Strategy 패턴    | 함수를 전략으로 전달해 동작 교체                     |
| Middleware 체인  | `fold`로 핸들러 체인 구성                            |

### Phase 5 완료 체크리스트

- [ ] Step 19: Record로 함수 다중 반환, 구조 분해, switch 패턴 매칭을 활용할 수 있다
- [ ] Step 20: typedef, Callable, 클로저, 함수 합성, 커링, 메모이제이션을 설명하고 적용할 수 있다

### 🔗 다음 단계

> **Phase 6 — Step 21: 테스트와 디버깅**으로 이동하세요.

Step 21에서는 Dart의 공식 테스트 패키지(`test`)를 사용한 단위 테스트, 그룹 테스트, 모킹(Mockito), 비동기 테스트, 스트림 테스트를 학습합니다. 지금까지 배운 모든 패턴(Repository, Result, Callable, Sealed Class)을 테스트하는 방법을 익힙니다.

### 📚 참고 자료

| 자료                  | 링크                                            |
| --------------------- | ----------------------------------------------- |
| Dart 함수 공식 문서   | <https://dart.dev/language/functions>             |
| Callable 클래스       | <https://dart.dev/language/callable-objects>      |
| Effective Dart — 함수 | <https://dart.dev/effective-dart/usage#functions> |
| `typedef` 가이드      | <https://dart.dev/language/typedefs>              |
| DartPad 온라인 실습   | <https://dartpad.dev>                             |

### ❓ 자가진단 퀴즈

1. **[Remember]** `typedef Predicate<T> = bool Function(T)` 선언의 이점 두 가지와, 이를 사용하지 않았을 때의 단점을 설명하라.
2. **[Remember]** `call()` 메서드가 있는 클래스 인스턴스를 `int Function(int)` 타입 변수에 할당할 수 있는 조건을 설명하라.
3. **[Understand]** 아래 두 코드에서 `fns[0]()`과 `fns[1]()`의 출력이 왜 다른지 설명하라.

   ```dart
   // 코드 A
   var fns = <void Function()>[];
   for (var i = 0; i < 2; i++) fns.add(() => print(i));
   fns[0](); fns[1]();

   // 코드 B
   var mutable = 0;
   var fns2 = <void Function()>[];
   for (var i = 0; i < 2; i++) {
     final cap = i; mutable = i;
     fns2.add(() => print('cap=$cap mutable=$mutable'));
   }
   fns2[0](); fns2[1]();
   ```

4. **[Understand]** 함수 합성 `composeAll([f, g, h])(x)`의 실행 순서를 설명하고, 파이프라인 방향과 어떻게 다른지 비교하라.
5. **[Apply]** `memoize2` 함수를 활용해 문자열 편집 거리(Levenshtein Distance) 계산을 최적화하라.
6. **[Analyze]** 미들웨어 체인을 `List<MiddlewareFn>`을 `fold`로 합성하는 방식과 하드코딩으로 명시적으로 감싸는 방식(`logging(authCheck(rateLimit(handler)))`)을 확장성, 순서 변경 용이성, 런타임 동적 추가 세 관점에서 비교하라.

> **3번 정답 힌트**
>
> 코드 A: Dart의 `for` 루프는 각 반복에서 새로운 `i` 변수를 생성하므로 `fns[0]`과 `fns[1]`이 각각 `0`과 `1`을 출력합니다.
>
> 코드 B: `final cap = i`는 현재 `i` 값을 새 변수에 복사해 각 클로저가 독립적인 값을 가집니다. 반면 `mutable`은 하나의 변수를 공유하므로 루프 종료 후 마지막 값인 `1`을 가집니다. `fns2[0]()`은 `cap=0 mutable=1`, `fns2[1]()`은 `cap=1 mutable=1`을 출력합니다.

> **6번 정답 힌트**
>
> 확장성: `fold` 방식은 리스트에 항목 추가만으로 미들웨어 추가. 명시적 감싸기는 코드 수정 필요.
> 순서 변경: `fold` 방식은 리스트 순서만 바꾸면 됨. 명시적은 코드 구조 변경 필요.
> 런타임 동적 추가: `fold` 방식은 조건에 따라 리스트를 동적으로 구성 후 `fold` 적용 가능. 명시적은 컴파일 타임에 고정.

---

_참고: 이 문서는 dart.dev 공식 문서(Functions, Callable Objects, Typedefs) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
