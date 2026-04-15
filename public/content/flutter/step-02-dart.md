# Step 02 — Dart 언어 핵심

> **파트:** 1️⃣ Flutter 전체 구조 이해 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Null Safety의 핵심 연산자(`?`, `!`, `??`, `?.`, `??=`)를 나열할 수 있다.
2. **[Understand]** Mixin이 Class 상속과 구조적으로 다른 이유를 설명할 수 있다.
3. **[Understand]** Future와 Stream의 차이를 데이터 흐름 관점에서 설명할 수 있다.
4. **[Understand]** Isolate가 async/await과 근본적으로 다른 이유를 설명할 수 있다.
5. **[Apply]** Null Safety를 적용하여 NPE 없는 Dart 코드를 작성할 수 있다.
6. **[Apply]** Records와 Patterns(Dart 3.3+)를 활용해 다중 반환값을 처리할 수 있다.
7. **[Analyze]** async/await과 Isolate의 적합한 사용 시나리오를 분석할 수 있다.

**전제 지식:** 프로그래밍 기초(변수, 함수, 클래스 개념), Step 01 완료

---

## 1. 서론

### 1.1 Flutter에서 Dart가 중요한 이유

Flutter Framework는 **전부 Dart로 작성**되어 있다. Widget 정의, 상태 관리, 비동기 처리 모두 Dart 문법에 직접 의존한다. Dart를 이해하지 못하면 Flutter 코드를 읽어도 "왜 이렇게 동작하는지"를 설명할 수 없다.

![Flutter 코드 한 줄의 배경](/developer-open-book/diagrams/flutter-step02-dart-code-background.svg)

### 1.2 Dart 언어의 특징

| 특징                          | 내용                                                    |
| ----------------------------- | ------------------------------------------------------- |
| **정적 타입**                 | 컴파일 타임에 타입 오류를 잡는다                        |
| **Sound Null Safety**         | null 관련 런타임 오류를 컴파일 타임에 차단 (Dart 2.12+) |
| **단일 스레드 + 이벤트 루프** | 기본적으로 단일 스레드. async/await로 논블로킹 처리     |
| **Isolate**                   | 진정한 병렬 처리가 필요할 때 별도 스레드처럼 사용       |
| **AOT + JIT 모두 지원**       | 개발(JIT)과 배포(AOT) 모두 최적화                       |

### 1.3 전체 개념 지도

![Dart 핵심 개념 계층 구조](/developer-open-book/diagrams/step02-dart-core-concepts.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                  | 정의                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Null Safety**       | 변수가 null을 가질 수 없도록 컴파일 타임에 강제하는 타입 시스템. Dart 2.12에서 안정화 |
| **Nullable 타입**     | null을 허용하는 타입. `String?`처럼 `?`를 붙인다                                      |
| **Non-nullable 타입** | null을 절대 가지지 않는 타입. Dart에서 기본값                                         |
| **Sound Null Safety** | 런타임에 null 오류가 발생할 수 없음을 컴파일러가 보장하는 수준의 Null Safety          |
| **Mixin**             | 상속 없이 여러 클래스에 기능을 공유하는 메커니즘                                      |
| **Future**            | 미래에 단 한 번 완료될 비동기 작업의 결과를 표현하는 객체                             |
| **Stream**            | 시간에 걸쳐 연속적으로 데이터를 방출하는 비동기 데이터 시퀀스                         |
| **async/await**       | 비동기 코드를 동기처럼 읽기 좋게 작성하는 문법 설탕(syntactic sugar)                  |
| **Isolate**           | Dart의 독립적인 실행 단위. 별도 메모리와 이벤트 루프를 가진 진정한 병렬 처리          |
| **compute()**         | Flutter가 제공하는 Isolate 간편 래퍼 함수. 무거운 연산을 백그라운드로 이전            |
| **Record**            | 여러 값을 묶어 반환하는 경량 불변 복합 타입 (Dart 3.0+)                               |
| **Pattern Matching**  | 값의 구조를 분석해 분기 처리하는 문법. switch 표현식에서 강력해짐 (Dart 3.0+)         |
| **Extension**         | 기존 클래스를 수정하거나 상속하지 않고 새 메서드를 추가하는 기능                      |
| **const**             | 컴파일 타임 상수. Flutter에서 Widget 최적화에 핵심적으로 사용됨                       |
| **final**             | 런타임에 한 번만 할당 가능한 변수. 재할당 불가                                        |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Null Safety

#### 배경: null 참조의 위험성

Tony Hoare는 1965년 null 참조를 도입하고 훗날 이를 **"10억 달러짜리 실수"** 라고 회고했다. null을 검사하지 않고 사용하면 런타임에 NullPointerException이 발생한다. Dart의 Sound Null Safety는 이 문제를 **컴파일 타임**에 완전히 차단한다.

#### Non-nullable vs Nullable

```dart
// Non-nullable: null 불가 (Dart의 기본)
String name = 'Flutter';
// name = null;  // 컴파일 오류!

// Nullable: null 허용 → ? 를 붙인다
String? nickname = null;  // 정상
```

#### Null Safety 핵심 연산자 5가지

| 연산자 | 이름           | 동작                                              | 예시                  |
| ------ | -------------- | ------------------------------------------------- | --------------------- |
| `?`    | Nullable 선언  | 변수가 null을 허용함을 선언                       | `String? name;`       |
| `!`    | Null 단언      | null이 아님을 개발자가 보증. null이면 런타임 예외 | `name!.length`        |
| `??`   | Null 합체      | 왼쪽이 null이면 오른쪽 값 반환                    | `name ?? 'Unknown'`   |
| `?.`   | 조건적 접근    | null이면 전체 표현식이 null 반환                  | `name?.toUpperCase()` |
| `??=`  | Null 합체 할당 | null인 경우에만 값을 할당                         | `name ??= 'Default'`  |

```dart
String? user;

// ?. : null이면 null 반환 (예외 없음)
print(user?.length);    // 출력: null

// ?? : null이면 기본값 사용
print(user ?? 'Guest'); // 출력: Guest

// ??= : null일 때만 할당
user ??= 'Anonymous';
print(user);            // 출력: Anonymous

// ! : null이 아님을 단언 → null이면 런타임 에러!
// print(user!.length); // user가 null이면 예외 발생
```

> ⚠️ **함정 주의:** `!` 연산자는 개발자가 null이 아님을 확신할 때만 사용해야 한다. 남발하면 런타임 예외가 발생하며, Null Safety를 도입한 의미가 사라진다.

#### Late 초기화

```dart
// late: 나중에 반드시 초기화될 것임을 선언
// 선언 시점에 값이 없지만, 사용 전에 반드시 할당됨을 보장
late String description;

void init() {
  description = '나중에 초기화됨';
}

// Flutter에서 자주 쓰이는 패턴
class _MyWidgetState extends State<MyWidget> {
  late AnimationController _controller;  // initState에서 초기화

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: ...);
  }
}
```

---

### 3.2 Class와 Mixin

#### 기본 Class 구조

```dart
class Animal {
  final String name;
  int age;

  // 기본 생성자 (초기화 리스트 사용)
  Animal(this.name, this.age);

  // Named Constructor: 의미 있는 생성 방법 제공
  Animal.unnamed() : name = 'Unknown', age = 0;

  // Factory Constructor: 캐싱, 서브타입 반환 가능
  factory Animal.fromJson(Map<String, dynamic> json) {
    return Animal(json['name'] as String, json['age'] as int);
  }

  String describe() => '$name, $age살';
}

class Dog extends Animal {
  Dog(super.name, super.age);  // Dart 2.17+ super parameter

  @override
  String describe() => '🐕 ${super.describe()}';
}
```

**기본 생성자 vs Named vs Factory 비교:**

| 종류                | 특징                                    | 사용 시나리오                   |
| ------------------- | --------------------------------------- | ------------------------------- |
| 기본 생성자         | 인스턴스 직접 생성                      | 일반적인 객체 생성              |
| Named Constructor   | 다양한 생성 방법 제공                   | `Color.red()`, `DateTime.now()` |
| Factory Constructor | 캐싱·타입 선택 가능, 서브타입 반환 가능 | Singleton, JSON 역직렬화        |

#### Mixin: 다중 기능 합성

Dart는 **단일 상속**만 지원하지만, `mixin`으로 여러 기능을 클래스에 합성할 수 있다.

![상속 vs Mixin 비교](/developer-open-book/diagrams/flutter-step02-inheritance-vs-mixin.svg)

```dart
mixin Swimmable {
  void swim() => print('🏊 수영 중...');
}

mixin Flyable {
  void fly() => print('✈️ 비행 중...');
}

mixin Runnable {
  void run() => print('🏃 달리는 중...');
}

class Duck extends Animal with Swimmable, Flyable, Runnable {
  Duck() : super('오리', 2);
}

final duck = Duck();
duck.swim();  // 🏊 수영 중...
duck.fly();   // ✈️ 비행 중...
duck.run();   // 🏃 달리는 중...
```

**Flutter에서 자주 쓰이는 Mixin:**

| Mixin                            | 역할                                  |
| -------------------------------- | ------------------------------------- |
| `SingleTickerProviderStateMixin` | AnimationController에 vsync 제공      |
| `MultiTickerProviderStateMixin`  | 복수 AnimationController에 vsync 제공 |
| `AutomaticKeepAliveClientMixin`  | PageView 등에서 위젯 상태 유지        |
| `RestorationMixin`               | 앱 상태 복원 기능 제공                |

---

### 3.3 비동기 처리: Future, Stream, Isolate

#### Dart의 단일 스레드 이벤트 루프

Dart는 기본적으로 **단일 스레드**에서 동작한다. 그러나 이벤트 루프(Event Loop)를 통해 I/O 대기 중에 다른 작업을 처리할 수 있어 UI가 멈추지 않는다.

![Dart 이벤트 루프 구조](/developer-open-book/diagrams/flutter-step02-event-loop.svg)

#### Future: 단일 비동기 결과

Future는 **미래에 단 한 번** 완료되는 비동기 작업을 표현한다. HTTP 요청, 파일 읽기 등 결과가 하나인 작업에 적합하다.

```dart
// Future의 3가지 상태
// 1. Uncompleted: 아직 작업 중
// 2. Completed with value: 성공
// 3. Completed with error: 실패

// async/await 방식 (권장)
Future<String> fetchUsername() async {
  // await: Future가 완료될 때까지 현재 함수 일시 중단
  // (단, 다른 코드 실행은 계속됨 — 스레드 블로킹 아님)
  final response = await http.get(Uri.parse('https://api.example.com/user'));
  return response.body;
}

// 호출 예시
void loadUser() async {
  try {
    final name = await fetchUsername();
    print('사용자: $name');
  } catch (e) {
    print('오류: $e');
  }
}

// then/catchError 방식 (체이닝)
fetchUsername()
  .then((name) => print('사용자: $name'))
  .catchError((e) => print('오류: $e'));
```

> ⚠️ **함정 주의:** `async` 함수에서 `await` 없이 Future를 반환하면 오류가 처리되지 않을 수 있다. 항상 `await`를 명시하거나 `.catchError()`를 붙여라.

#### Stream: 연속적인 비동기 데이터

Stream은 **시간에 걸쳐 여러 번** 데이터를 방출하는 비동기 시퀀스다. 실시간 데이터, 소켓, 사용자 입력 등에 적합하다.

```dart
// Future vs Stream 비교
// Future: 결과 1개 → 완료
// Stream: 결과 N개 → 계속 방출 → 완료(또는 에러)

// Stream 생성
Stream<int> countDown(int from) async* {
  for (int i = from; i >= 0; i--) {
    yield i;                           // 값 방출
    await Future.delayed(Duration(seconds: 1));
  }
}

// Stream 구독
void startCountDown() {
  countDown(5).listen(
    (value) => print('$value...'),     // 데이터 수신
    onError: (e) => print('오류: $e'), // 에러 처리
    onDone: () => print('완료!'),      // 스트림 종료
  );
}

// await for 방식
Future<void> printCountDown() async {
  await for (final value in countDown(5)) {
    print('$value...');
  }
}
```

**Single-subscription vs Broadcast Stream:**

| 종류                | 특징                                           | 사용 시나리오            |
| ------------------- | ---------------------------------------------- | ------------------------ |
| Single-subscription | 리스너 1개만 허용, 처음부터 끝까지 순서 보장   | 파일 읽기, HTTP 응답     |
| Broadcast           | 여러 리스너 허용, 구독 후 방출된 데이터만 수신 | 사용자 이벤트, WebSocket |

#### Isolate: 진정한 병렬 처리

async/await는 단일 스레드 내에서 **논블로킹 처리**를 가능하게 한다. 그러나 JSON 파싱, 이미지 처리 같은 **CPU 집약적 작업**은 메인 스레드를 직접 점유하여 UI를 멈추게 한다. 이때 **Isolate**를 사용한다.

![async/await vs Isolate 비교](/developer-open-book/diagrams/step02-isolate-async.svg)

```dart
// compute(): Isolate를 간편하게 사용하는 Flutter 래퍼
// 최상위 함수 또는 static 메서드만 전달 가능

// ① 무거운 작업 함수 정의 (최상위 또는 static)
List<int> parseHugeJson(String jsonString) {
  // 수만 건의 JSON 파싱 — CPU 집약적 작업
  final data = jsonDecode(jsonString) as List;
  return data.map((e) => e['id'] as int).toList();
}

// ② compute로 백그라운드 실행
Future<void> loadData() async {
  final rawJson = await http.get(Uri.parse('...'));

  // UI 스레드 블로킹 없이 파싱
  final ids = await compute(parseHugeJson, rawJson.body);
  print('파싱 완료: ${ids.length}건');
}
```

**async/await vs Isolate 선택 기준:**

| 작업 유형                    | 적합한 방법       | 이유                              |
| ---------------------------- | ----------------- | --------------------------------- |
| HTTP 요청, 파일 I/O, DB 쿼리 | async/await       | CPU를 사용하지 않는 대기 작업     |
| JSON 파싱 (대용량)           | compute / Isolate | CPU 집약적, UI 스레드 블로킹 위험 |
| 이미지 처리, 압축            | compute / Isolate | 연산량이 많아 UI Jank 유발        |
| 단순 계산, 짧은 작업         | async/await       | Isolate 생성 비용이 더 큼         |

> ⚠️ **함정 주의:** Isolate는 **메모리를 공유하지 않는다**. 메인 Isolate의 변수를 직접 참조할 수 없고, 포트(Port)를 통해 직렬화된 메시지만 주고받는다. `compute()`는 이 복잡한 통신을 추상화해준다.

---

### 3.4 Records & Patterns (Dart 3.0+)

#### Records: 다중 반환값

기존 Dart에서 함수가 두 개 이상의 값을 반환하려면 클래스나 Map을 사용해야 했다. Dart 3.0의 Record는 이를 간결하게 해결한다.

```dart
// 기존 방식: Map 사용 (타입 안전 X)
Map<String, dynamic> getUserInfo() {
  return {'name': 'Flutter', 'age': 8};
}

// 기존 방식: 전용 클래스 (코드 장황)
class UserInfo {
  final String name;
  final int age;
  UserInfo(this.name, this.age);
}

// Record 방식 (Dart 3.0+): 타입 안전 + 간결
(String, int) getUserInfo() {
  return ('Flutter', 8);
}

// Named Record (더 명확)
({String name, int age}) getUserInfo() {
  return (name: 'Flutter', age: 8);
}

// 사용
final info = getUserInfo();
print(info.name); // Flutter
print(info.age);  // 8
```

#### Patterns: 구조 분해 할당

```dart
// Record 구조 분해
final (name, age) = getUserInfo();
print(name); // Flutter
print(age);  // 8

// 리스트 구조 분해
final [first, second, ...rest] = [1, 2, 3, 4, 5];
print(first);  // 1
print(second); // 2
print(rest);   // [3, 4, 5]

// Map 구조 분해
final {'name': n, 'age': a} = {'name': 'Dart', 'age': 10};
print(n); // Dart
```

#### switch 표현식 강화 (Dart 3.3+)

```dart
// 기존 switch 문
String describe(Object obj) {
  switch (obj) {
    case int n:
      return '정수: $n';
    case String s:
      return '문자열: $s';
    default:
      return '알 수 없음';
  }
}

// Dart 3.3+ switch 표현식 (더 간결, 값 반환)
String describe(Object obj) => switch (obj) {
  int n    => '정수: $n',
  String s => '문자열: $s',
  _        => '알 수 없음',
};

// Flutter 상태 처리 실전 예시
Widget buildStatus(AsyncSnapshot snapshot) => switch (snapshot.connectionState) {
  ConnectionState.waiting => const CircularProgressIndicator(),
  ConnectionState.done when snapshot.hasError => Text('오류: ${snapshot.error}'),
  ConnectionState.done => Text('결과: ${snapshot.data}'),
  _ => const SizedBox.shrink(),
};
```

---

### 3.5 Collection

#### 기본 컬렉션 타입

```dart
// List: 순서 있는 컬렉션
final fruits = ['apple', 'banana', 'cherry'];
final typedList = <String>['Dart', 'Flutter'];

// Map: 키-값 쌍
final user = {'name': 'Flutter', 'version': '3.0'};
final typedMap = <String, int>{'a': 1, 'b': 2};

// Set: 중복 없는 컬렉션
final unique = {'a', 'b', 'a'};  // {'a', 'b'}
```

#### 컬렉션 리터럴 고급 기능

```dart
final isLoggedIn = true;
final extras = ['extra1', 'extra2'];

final menu = [
  'Home',
  'Profile',
  if (isLoggedIn) 'Dashboard',        // Collection-if
  if (!isLoggedIn) 'Login',
  for (final e in extras) e.toUpperCase(), // Collection-for
  ...['Settings', 'Help'],             // Spread operator
];
// 결과: ['Home', 'Profile', 'Dashboard', 'EXTRA1', 'EXTRA2', 'Settings', 'Help']
```

---

### 3.6 Extension

Extension은 기존 클래스를 수정하거나 상속하지 않고 새 메서드를 추가하는 방법이다.

```dart
// String에 유효성 검사 메서드 추가
extension StringValidation on String {
  bool get isValidEmail =>
      RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);

  bool get isNotBlank => trim().isNotEmpty;

  String get capitalize =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}

// BuildContext에 편의 메서드 추가 (Flutter 실전 패턴)
extension ContextExtension on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;
}

// 사용
'user@example.com'.isValidEmail  // true
'  '.isNotBlank                  // false
'hello'.capitalize               // 'Hello'

// Widget 내에서
context.screenWidth   // MediaQuery.of(context).size.width 대신
context.theme.primaryColor
```

---

## 4. 사례 연구

### 4.1 대용량 JSON 파싱에서 Isolate의 필요성

채팅 앱에서 서버로부터 수천 건의 메시지 목록을 JSON으로 받아 파싱하는 상황을 생각해보자.

![async/await vs compute() 비교](/developer-open-book/diagrams/flutter-step02-async-vs-compute.svg)

---

### 4.2 Records가 Flutter 코드를 바꾼 방식

Riverpod·Provider 기반 상태 관리에서 여러 값을 함께 반환하는 패턴이 자주 등장한다.

```dart
// 기존: 별도 상태 클래스 필요
class AuthState {
  final bool isLoading;
  final User? user;
  final String? error;
  AuthState({required this.isLoading, this.user, this.error});
}

// Records 도입 후: 간단한 경우 인라인으로 표현
(bool isLoading, User? user, String? error) checkAuth() {
  // ...
  return (false, currentUser, null);
}

final (isLoading, user, error) = checkAuth();
```

---

### 4.3 Extension이 Flutter 프로젝트를 깔끔하게 만드는 방법

```dart
// Before: 반복적인 boilerplate
Padding(
  padding: const EdgeInsets.all(16.0),
  child: Text(
    'hello',
    style: Theme.of(context).textTheme.headlineMedium,
  ),
)

// After: Extension 적용
extension WidgetExtension on Widget {
  Widget paddingAll(double value) =>
      Padding(padding: EdgeInsets.all(value), child: this);
}

Text('hello', style: context.textTheme.headlineMedium).paddingAll(16)
```

코드 가독성이 높아지고, 중복이 줄어든다.

---

## 5. 실습

### 5.1 Null Safety 리팩토링

아래 Null Safety 미적용 코드를 Sound Null Safety가 적용되도록 수정하라.

```dart
// 수정 전: Null Safety 미적용
class User {
  String name;
  String email;

  User(this.name, this.email);

  String getDisplayName() {
    if (name != null) {
      return name.toUpperCase();
    }
    return 'Anonymous';
  }
}

// 수정 후: Null Safety 적용 (직접 작성해보기)
// 힌트: name이 null일 수 없는 경우 / email이 선택적인 경우를 구분해보자
```

**모범 답안:**

```dart
class User {
  final String name;          // non-nullable: 항상 있어야 함
  final String? email;        // nullable: 없을 수도 있음

  const User({required this.name, this.email});

  String get displayName => name.toUpperCase();  // null 검사 불필요

  String get contactInfo => email ?? '이메일 없음';
}
```

---

### 5.2 compute()로 UI Jank 방지

DartPad에서 아래 코드를 실행하며 `compute()`의 효과를 확인하라.

```dart
import 'dart:isolate';

// 무거운 연산 시뮬레이션 (최상위 함수)
int heavyComputation(int input) {
  int result = 0;
  for (int i = 0; i < 100000000; i++) {
    result += i % input;
  }
  return result;
}

Future<void> main() async {
  print('연산 시작...');
  final stopwatch = Stopwatch()..start();

  // Isolate.run(): compute()와 동일한 역할 (Dart 순수 코드에서 사용)
  final result = await Isolate.run(() => heavyComputation(7));

  stopwatch.stop();
  print('결과: $result');
  print('소요 시간: ${stopwatch.elapsedMilliseconds}ms');
  print('(메인 스레드는 이 시간 동안 다른 작업 가능)');
}
```

**확인 포인트:**

- `Isolate.run()` 없이 직접 `heavyComputation(7)`을 호출하면 어떤 차이가 있는가?
- Flutter 앱에서는 `Isolate.run()` 대신 `compute()`를 주로 사용하는 이유는?

---

### 5.3 Records & Patterns 실습

아래 함수를 Records를 사용해 리팩토링하고, switch 표현식으로 상태를 처리하라.

```dart
// 리팩토링 전
Map<String, dynamic> divide(int a, int b) {
  if (b == 0) {
    return {'success': false, 'result': null, 'error': '0으로 나눌 수 없음'};
  }
  return {'success': true, 'result': a / b, 'error': null};
}

// 리팩토링 후 (직접 작성해보기)
// 힌트 1: (bool success, double? result, String? error) 형태의 Record 사용
// 힌트 2: switch 표현식으로 결과 출력 처리
```

**모범 답안:**

```dart
(bool success, double? result, String? error) divide(int a, int b) {
  if (b == 0) return (false, null, '0으로 나눌 수 없음');
  return (true, a / b, null);
}

void main() {
  final result = divide(10, 3);

  final message = switch (result) {
    (true, final r?, _)  => '결과: ${r.toStringAsFixed(2)}',
    (false, _, final e?) => '오류: $e',
    _                    => '알 수 없는 상태',
  };

  print(message); // 결과: 3.33
}
```

---

### 5.4 자가 평가 퀴즈

**Q1. [Remember]** `String? name = null; print(name ?? 'Guest');` 의 출력은?

- A) null
- B) **Guest** ✅
- C) 컴파일 오류
- D) 런타임 오류

---

**Q2. [Understand]** Mixin과 상속의 차이를 올바르게 설명한 것은?

- A) Mixin은 상속보다 느리다
- B) Mixin은 생성자를 가질 수 없으며 상속 없이 기능을 합성한다 ✅
- C) Dart에서 Mixin은 상속과 동일하다
- D) Mixin은 한 번에 하나만 적용할 수 있다

---

**Q3. [Understand]** Future와 Stream의 핵심 차이는?

> **모범 답안:** Future는 미래에 단 한 번 완료되는 비동기 결과를 표현한다. 반면 Stream은 시간에 걸쳐 여러 번 데이터를 방출하는 비동기 시퀀스다. HTTP 요청처럼 결과가 하나인 경우 Future, WebSocket이나 실시간 데이터처럼 연속적인 데이터 흐름에는 Stream을 사용한다.

---

**Q4. [Analyze]** 다음 중 Isolate(또는 compute)를 사용해야 하는 케이스는?

- A) 서버에서 사용자 프로필 JSON 한 건을 가져올 때
- B) 버튼 탭 이벤트를 처리할 때
- C) **50,000건의 거래 내역 JSON을 파싱할 때** ✅
- D) 화면 전환 애니메이션을 실행할 때

---

**Q5. [Apply]** Dart 3.0+ Records를 사용해 `(String name, int score)` 타입을 반환하는 `getTopPlayer()` 함수를 작성하라.

```dart
// 모범 답안
(String name, int score) getTopPlayer() {
  return ('PlayerOne', 9800);
}

void main() {
  final (name, score) = getTopPlayer();
  print('$name: $score점');  // PlayerOne: 9800점
}
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Null Safety:** `?`(nullable 선언), `??`(기본값), `?.`(조건 접근), `!`(단언)로 NPE를 컴파일 타임에 차단한다. `!`는 남발하지 말 것.
- **Class / Mixin:** Mixin은 상속 없이 여러 기능을 클래스에 합성한다. Flutter의 `SingleTickerProviderStateMixin` 등이 대표 사례다.
- **Future vs Stream:** Future는 단일 결과, Stream은 연속 데이터. 둘 다 단일 스레드 이벤트 루프 안에서 동작한다.
- **Isolate / compute:** CPU 집약적 작업은 `compute()`로 백그라운드 Isolate에 위임해 UI Jank를 방지한다.
- **Records & Patterns:** Dart 3.0+의 Records로 다중 반환값을 타입 안전하게 처리하고, switch 표현식으로 패턴 매칭을 간결하게 표현한다.
- **Extension:** 기존 클래스를 수정하지 않고 편의 메서드를 추가해 Flutter 코드 가독성을 높인다.

### 6.2 다음 Step 예고

- **Step 03 — Flutter 개발 환경:** Flutter SDK 설치, FVM을 활용한 버전 관리, Android Studio·VSCode 설정, Emulator 연결을 실습한다.

### 6.3 참고 자료

| 자료                  | 링크                                                     | 설명                   |
| --------------------- | -------------------------------------------------------- | ---------------------- |
| Dart 공식 언어 가이드 | <https://dart.dev/language>                              | 문법 전체 레퍼런스     |
| Null Safety 이해하기  | <https://dart.dev/null-safety/understanding-null-safety> | 공식 심층 문서         |
| DartPad               | <https://dartpad.dev>                                    | 브라우저에서 Dart 실행 |
| Records 공식 문서     | <https://dart.dev/language/records>                      | Dart 3.0+ Records      |
| Isolate 공식 문서     | <https://dart.dev/language/isolates>                     | 병렬 처리 공식 가이드  |

### 6.4 FAQ

**Q. async 함수는 항상 별도 스레드에서 실행되는가?**

> 아니다. `async/await`는 단일 스레드 이벤트 루프 안에서 동작한다. 별도 스레드(Isolate)를 생성하지 않으며, I/O 대기 중에 다른 이벤트를 처리할 수 있도록 실행을 일시 중단하는 것뿐이다.

**Q. const와 final의 차이는?**

> `final`은 런타임에 한 번만 할당된다. `const`는 컴파일 타임 상수로, 빌드 타임에 값이 확정된다. Flutter에서 `const Widget`은 재build 시 새 객체를 생성하지 않아 성능 최적화에 핵심적이다.

**Q. Dart의 Records는 Python의 tuple과 같은가?**

> 유사하지만 Dart Records는 타입 안전(type-safe)하며 Named field를 지원한다. `(String, int)` 와 `(int, String)` 은 서로 다른 타입이다.

---

## 빠른 자가진단 체크리스트

- [ ] Null Safety 연산자 5개(`?`, `!`, `??`, `?.`, `??=`)를 외우고 각각의 사용 예를 말할 수 있는가?
- [ ] Mixin과 상속의 차이를 한 문장으로 설명할 수 있는가?
- [ ] Future와 Stream의 차이를 데이터 흐름 관점에서 설명할 수 있는가?
- [ ] async/await가 별도 스레드를 만들지 않는다는 것을 이해했는가?
- [ ] CPU 집약적 작업에서 `compute()`를 써야 하는 이유를 설명할 수 있는가?
- [ ] Dart 3.0+ Records로 다중 반환값을 작성할 수 있는가?
- [ ] ⚠️ 함정 체크: `!` 연산자를 남발하면 Null Safety를 쓰는 의미가 없어진다는 것을 이해했는가?
