# Step 5 — 함수 (Function)

> **Phase 1 | Dart 기초** | 예상 소요: 2일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 5 — 함수 (Function)](#step-5--함수-function)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [Dart에서 함수란?](#dart에서-함수란)
  - [3. 함수 기본 구조](#3-함수-기본-구조)
    - [3.1 반환 타입과 매개변수](#31-반환-타입과-매개변수)
    - [3.2 `void` 함수](#32-void-함수)
    - [3.3 함수도 객체다 — 일급 함수](#33-함수도-객체다--일급-함수)
  - [4. Arrow Function `=>`](#4-arrow-function-)
  - [5. 매개변수 종류](#5-매개변수-종류)
    - [5.1 위치 매개변수 (Positional Parameter)](#51-위치-매개변수-positional-parameter)
    - [5.2 이름 있는 매개변수 (Named Parameter) `{}`](#52-이름-있는-매개변수-named-parameter-)
    - [5.3 Optional 위치 매개변수 `[]`](#53-optional-위치-매개변수-)
    - [5.4 Default 값 설정](#54-default-값-설정)
    - [5.5 `required` 키워드](#55-required-키워드)
  - [6. 매개변수 설계 비교](#6-매개변수-설계-비교)
  - [7. 함수형 프로그래밍 기초](#7-함수형-프로그래밍-기초)
    - [7.1 익명 함수 (Anonymous Function)](#71-익명-함수-anonymous-function)
    - [7.2 고차 함수 (Higher-Order Function)](#72-고차-함수-higher-order-function)
    - [7.3 클로저 (Closure)](#73-클로저-closure)
  - [8. 재귀 함수](#8-재귀-함수)
  - [9. 실습 — 실전 과제 1 준비](#9-실습--실전-과제-1-준비)
    - [실습 9-1: Arrow function 변환](#실습-9-1-arrow-function-변환)
    - [실습 9-2: Named 매개변수 설계](#실습-9-2-named-매개변수-설계)
    - [실습 9-3: 🎯 실전 과제 1 — CLI 계산기](#실습-9-3--실전-과제-1--cli-계산기)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🎯 Phase 1 완료 체크리스트](#-phase-1-완료-체크리스트)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                         |
| --- | ------------- | ---------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | 함수의 4가지 매개변수 종류(위치, Named, Optional, Default)를 나열할 수 있다  |
| 2   | 🟢 Understand | Arrow function이 일반 함수와 동일한 의미를 가지는 조건을 설명할 수 있다      |
| 3   | 🟢 Understand | Named 매개변수와 Optional 위치 매개변수의 차이를 설명할 수 있다              |
| 4   | 🟡 Apply      | Flutter 위젯 스타일의 Named + required 매개변수를 가진 함수를 설계할 수 있다 |
| 5   | 🟡 Apply      | 클로저를 활용해 상태를 캡처하는 함수를 작성할 수 있다                        |
| 6   | 🟠 Analyze    | 고차 함수와 콜백 패턴의 동작 원리를 분석할 수 있다                           |

---

## 2. 서론

### Dart에서 함수란?

Dart에서 함수는 **일급 객체(First-class Object)** 입니다. 변수에 저장하고, 다른 함수의 인수로 전달하고, 함수에서 반환할 수 있습니다. 이 특성이 Flutter의 콜백 기반 UI 이벤트 처리와 Step 7에서 배울 `map()`, `where()` 같은 함수형 컬렉션 메서드의 기반이 됩니다.

또한 Dart 함수는 **Named 매개변수** 시스템을 통해 Flutter 위젯 생성자의 가독성을 극적으로 높입니다.

```dart
// Flutter 위젯 생성자 예시 — Named 매개변수 활용
Container(
  width: 100,
  height: 200,
  color: Colors.blue,
  child: Text('Hello'),
)
```

이 코드에서 `width:`, `height:`, `color:`, `child:`는 모두 Named 매개변수입니다. 이번 Step에서 그 동작 원리를 완전히 이해하게 됩니다.

> **전제 지식**: Step 1~4 완료 (변수, 타입, 연산자, 반복문)

---

## 3. 함수 기본 구조

### 3.1 반환 타입과 매개변수

```
반환타입 함수이름(매개변수타입 매개변수명, ...) {
    // 함수 본문
    return 반환값;
}
```

```dart
// 두 정수를 더해 int를 반환하는 함수
int add(int a, int b) {
  return a + b;
}

// 문자열을 받아 인사말 String을 반환하는 함수
String greet(String name) {
  return 'Hello, $name!';
}

void main() {
  print(add(3, 5));       // 8
  print(greet('Dart'));   // Hello, Dart!
}
```

**반환 타입 추론**

함수의 반환 타입을 명시하지 않으면 컴파일러가 추론합니다. 단, Effective Dart는 **공개 API에는 타입을 명시**하도록 권장합니다.

```dart
// 타입 추론 — 로컬 함수나 private 함수에서 허용
add(int a, int b) => a + b;  // int 추론

// 명시적 타입 — 공개 함수 권장
int add(int a, int b) => a + b;
```

---

### 3.2 `void` 함수

반환값이 없는 함수는 `void`를 선언합니다. `return`문을 생략하거나 빈 `return;`을 사용합니다.

```dart
void printSeparator(int count) {
  print('-' * count);
}

void logError(String message) {
  if (message.isEmpty) return;  // 빈 return으로 조기 탈출
  print('[ERROR] $message');
}

void main() {
  printSeparator(20);          // --------------------
  logError('');                // (출력 없음)
  logError('파일을 찾을 수 없음');  // [ERROR] 파일을 찾을 수 없음
}
```

---

### 3.3 함수도 객체다 — 일급 함수

Dart의 함수는 `Function` 타입의 객체입니다. 이 특성이 함수형 프로그래밍의 기반입니다.

```dart
int multiply(int a, int b) => a * b;

void main() {
  // 변수에 함수 저장
  Function operation = multiply;
  print(operation(3, 4));   // 12

  // 타입을 명시한 함수 변수
  int Function(int, int) calc = multiply;
  print(calc(5, 6));        // 30

  // 리스트에 함수 저장
  List<int Function(int, int)> ops = [
    (a, b) => a + b,
    (a, b) => a - b,
    (a, b) => a * b,
  ];

  for (var op in ops) {
    print(op(10, 3));  // 13, 7, 30
  }
}
```

---

## 4. Arrow Function `=>`

Arrow function(화살표 함수)은 **단일 표현식**을 반환하는 함수를 간결하게 표현합니다.

```
반환타입 함수이름(매개변수) => 표현식;
```

`=> 표현식`은 `{ return 표현식; }`과 완전히 동일합니다.

```dart
// 일반 함수와 Arrow function — 완전히 동일한 의미
int square(int n) {
  return n * n;
}
int squareArrow(int n) => n * n;

String greet(String name) {
  return 'Hello, $name!';
}
String greetArrow(String name) => 'Hello, $name!';

bool isEven(int n) {
  return n % 2 == 0;
}
bool isEvenArrow(int n) => n % 2 == 0;
```

**Arrow function 사용 조건 — 단일 표현식**

```dart
// ✅ 단일 표현식 — Arrow function 적합
int add(int a, int b) => a + b;
bool isEmpty(String s) => s.isEmpty;

// ❌ 여러 구문 — Arrow function 불가, 일반 함수 사용
int addAndLog(int a, int b) {  // { } 필요
  print('$a + $b 계산 중');    // 구문 1
  return a + b;                // 구문 2
}

// ❌ if-else 문(Statement)은 Arrow function에 사용 불가
// int abs(int n) => if (n < 0) -n else n;  // 컴파일 오류

// ✅ 삼항 연산자(Expression)는 단일 표현식이므로 가능
int abs(int n) => n < 0 ? -n : n;
```

**Arrow function이 특히 유용한 상황**

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // 콜백으로 전달할 때 — 간결함이 빛남
  var squared  = numbers.map((n) => n * n).toList();
  var evens    = numbers.where((n) => n % 2 == 0).toList();
  var sum      = numbers.reduce((a, b) => a + b);

  print(squared);  // [1, 4, 9, 16, 25]
  print(evens);    // [2, 4]
  print(sum);      // 15
}
```

---

## 5. 매개변수 종류

Dart는 4가지 매개변수 방식을 지원합니다. 각각의 문법과 적합한 상황이 다릅니다.

### 5.1 위치 매개변수 (Positional Parameter)

가장 기본적인 형태로, **호출 순서대로** 값이 매핑됩니다.

```dart
String buildTag(String tag, String content) {
  return '<$tag>$content</$tag>';
}

void main() {
  print(buildTag('h1', '제목'));    // <h1>제목</h1>
  print(buildTag('p', '본문'));     // <p>본문</p>

  // 순서가 바뀌면 의미도 바뀜
  print(buildTag('제목', 'h1'));    // <제목>h1</제목> — 실수 가능
}
```

**위치 매개변수의 문제**: 매개변수가 많아질수록 호출부에서 순서를 기억해야 해서 실수가 발생하기 쉽습니다.

---

### 5.2 이름 있는 매개변수 (Named Parameter) `{}`

중괄호 `{}`로 감싸면 **이름으로 값을 전달**합니다. 호출 순서와 무관하며, 모두 기본적으로 Optional(생략 가능)입니다.

```dart
// 선언 — {} 사용
void createUser({String? name, int? age, String? email}) {
  print('이름: $name, 나이: $age, 이메일: $email');
}

void main() {
  // 호출 — 이름 명시, 순서 무관
  createUser(name: '홍길동', age: 30, email: 'hong@dart.dev');
  createUser(age: 25, name: '김철수');  // 순서 변경 가능
  createUser(name: '이영희');           // 일부 생략 가능
}
// 이름: 홍길동, 나이: 30, 이메일: hong@dart.dev
// 이름: 김철수, 나이: 25, 이메일: null
// 이름: 이영희, 나이: null, 이메일: null
```

**Flutter 위젯 스타일 — Named 매개변수의 강점**

```dart
// Named 매개변수 없이 — 각 인수의 의미를 알 수 없음
drawRect(100, 200, 50, 30, true, '#FF0000');

// Named 매개변수 사용 — 각 인수의 의미가 명확
drawRect(
  x: 100,
  y: 200,
  width: 50,
  height: 30,
  filled: true,
  color: '#FF0000',
);
```

---

### 5.3 Optional 위치 매개변수 `[]`

대괄호 `[]`로 감싸면 **위치는 유지하되 생략 가능**한 매개변수가 됩니다.

```dart
// 선언 — [] 사용
String greet(String name, [String? title, String? suffix]) {
  String result = name;
  if (title != null) result = '$title $result';
  if (suffix != null) result = '$result $suffix';
  return '안녕하세요, $result 님!';
}

void main() {
  print(greet('홍길동'));                  // 안녕하세요, 홍길동 님!
  print(greet('홍길동', '박사'));           // 안녕하세요, 박사 홍길동 님!
  print(greet('홍길동', '박사', 'PhD'));   // 안녕하세요, 박사 홍길동 PhD 님!

  // ⚠️ suffix만 전달하고 title 건너뛰기 불가 — 위치 기반이므로
  // print(greet('홍길동', null, 'PhD'));   // title 자리에 null 전달 필요
}
```

---

### 5.4 Default 값 설정

Named 매개변수와 Optional 위치 매개변수 모두 **기본값**을 설정할 수 있습니다. 기본값이 있으면 타입에 `?`가 불필요합니다.

```dart
// Named 매개변수 + Default 값
void connect({
  String host = 'localhost',
  int port = 3000,
  bool secure = false,
}) {
  String protocol = secure ? 'https' : 'http';
  print('$protocol://$host:$port 에 연결');
}

// Optional 위치 매개변수 + Default 값
String repeat(String text, [int count = 1, String separator = '']) {
  return List.filled(count, text).join(separator);
}

void main() {
  connect();                                // http://localhost:3000 에 연결
  connect(port: 8080);                      // http://localhost:8080 에 연결
  connect(host: 'api.dart.dev', secure: true); // https://api.dart.dev:3000 에 연결

  print(repeat('Dart'));                    // Dart
  print(repeat('Dart', 3));                // DartDartDart
  print(repeat('Dart', 3, '-'));           // Dart-Dart-Dart
}
```

---

### 5.5 `required` 키워드

Named 매개변수는 기본적으로 Optional입니다. `required`를 붙이면 **반드시 전달해야 하는** Named 매개변수가 됩니다. Null Safety와 결합해 Flutter 위젯 생성자에서 핵심적으로 사용됩니다.

```dart
// required Named 매개변수
void createProduct({
  required String name,      // 필수
  required double price,     // 필수
  String? description,       // Optional (null 가능)
  int stock = 0,             // Optional (기본값 있음)
}) {
  print('상품: $name, 가격: $price원, 재고: $stock');
}

void main() {
  // ✅ required 매개변수 모두 제공
  createProduct(name: '다트 책', price: 25000);
  createProduct(
    name: '플러터 강의',
    price: 50000,
    description: '입문 과정',
    stock: 100,
  );

  // ❌ required 매개변수 누락 — 컴파일 오류
  // createProduct(name: '다트 책');
  // Error: The named parameter 'price' is required but wasn't provided.
}
```

**`required` vs Null Safety 조합 패턴**

```dart
class Button {
  final String label;
  final void Function() onPressed;   // required, non-null 함수
  final String? tooltip;             // optional, nullable

  // Flutter 스타일 생성자
  Button({
    required this.label,
    required this.onPressed,
    this.tooltip,               // Named이지만 required 없음 — optional
  });
}
```

---

## 6. 매개변수 설계 비교

4가지 매개변수 방식의 선택 기준을 정리합니다.

![diagram](/developer-open-book/diagrams/step05-parameter-comparison.svg)

**혼합 사용 규칙**

```dart
// ✅ 위치 매개변수 + Named 매개변수 혼합
void log(String level, String message, {bool timestamp = false}) {
  String prefix = timestamp ? '[${DateTime.now()}] ' : '';
  print('$prefix[$level] $message');
}

// ❌ Named + Optional 위치 혼합 불가
// void invalid({String? a}, [String? b]) { }  // 컴파일 오류

// ✅ 위치 + Optional 위치
void range(int start, [int end = 10, int step = 1]) { }

void main() {
  log('INFO', '서버 시작');                     // [INFO] 서버 시작
  log('WARN', '메모리 부족', timestamp: true);  // [2025-...] [WARN] 메모리 부족
}
```

**상황별 매개변수 선택 가이드**

| 상황                          | 권장 방식               |
| ----------------------------- | ----------------------- |
| 2개 이하 명확한 매개변수      | 위치 매개변수           |
| 3개 이상 또는 선택적 매개변수 | Named 매개변수          |
| 반드시 필요한 Named           | `required` 추가         |
| 마지막 1~2개만 선택적         | Optional 위치 매개변수  |
| Flutter 위젯 생성자           | Named + `required` 조합 |

---

## 7. 함수형 프로그래밍 기초

### 7.1 익명 함수 (Anonymous Function)

이름 없이 정의되는 함수입니다. 변수에 저장하거나 다른 함수에 인수로 직접 전달할 때 사용합니다.

```dart
void main() {
  // 익명 함수를 변수에 저장
  var double = (int n) {
    return n * 2;
  };

  // Arrow function 형태의 익명 함수
  var triple = (int n) => n * 3;

  print(double(5));   // 10
  print(triple(5));   // 15

  // 즉시 실행 익명 함수 (IIFE)
  var result = ((int a, int b) => a + b)(3, 4);
  print(result);  // 7
}
```

---

### 7.2 고차 함수 (Higher-Order Function)

**함수를 인수로 받거나 함수를 반환하는 함수**를 고차 함수라 합니다.

**함수를 인수로 받기 — 콜백 패턴**

```dart
// 함수 타입: int Function(int) — int를 받아 int를 반환하는 함수
void applyAndPrint(List<int> list, int Function(int) transform) {
  for (var item in list) {
    print(transform(item));
  }
}

int square(int n) => n * n;
int negate(int n) => -n;

void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  applyAndPrint(numbers, square);       // 1, 4, 9, 16, 25
  applyAndPrint(numbers, negate);       // -1, -2, -3, -4, -5
  applyAndPrint(numbers, (n) => n + 10); // 11, 12, 13, 14, 15
}
```

**함수를 반환하기 — 함수 팩토리**

```dart
// 'n의 배수인지 검사'하는 함수를 반환하는 함수
bool Function(int) makeMultipleChecker(int n) {
  return (int value) => value % n == 0;
}

// 'x만큼 더하는' 함수를 반환하는 함수
int Function(int) makeAdder(int x) => (int n) => n + x;

void main() {
  var isEven     = makeMultipleChecker(2);
  var isMultOf3  = makeMultipleChecker(3);

  print(isEven(4));       // true
  print(isEven(7));       // false
  print(isMultOf3(9));    // true

  var add5  = makeAdder(5);
  var add10 = makeAdder(10);

  print(add5(3));   // 8
  print(add10(3));  // 13
}
```

---

### 7.3 클로저 (Closure)

클로저는 **자신이 정의된 스코프의 변수를 캡처(기억)하는 함수**입니다. 함수가 반환된 이후에도 캡처된 변수를 유지합니다.

```dart
// 클로저 기본 예시 — 카운터
Function makeCounter() {
  int count = 0;  // 이 변수를 내부 함수가 캡처

  return () {
    count++;      // 외부 스코프의 count를 참조 및 수정
    print(count);
  };
}

void main() {
  var counter1 = makeCounter();
  var counter2 = makeCounter();  // 독립적인 count 변수를 가짐

  counter1();  // 1
  counter1();  // 2
  counter1();  // 3

  counter2();  // 1 — counter1과 독립적
  counter1();  // 4 — counter1 이어서 증가
}
```

**클로저가 캡처하는 것은 값이 아닌 변수**

```dart
void main() {
  List<Function> actions = [];

  // ⚠️ 루프 변수를 직접 캡처하는 경우
  for (int i = 0; i < 3; i++) {
    int captured = i;  // 각 반복마다 새 변수 생성 — 값 고정
    actions.add(() => print(captured));
  }

  actions[0]();  // 0
  actions[1]();  // 1
  actions[2]();  // 2
}
```

**실용적인 클로저 패턴 — 설정값 캡처**

```dart
String Function(String) makeFormatter(String prefix, String suffix) {
  return (String text) => '$prefix$text$suffix';
}

void main() {
  var boldHtml    = makeFormatter('<b>', '</b>');
  var italicHtml  = makeFormatter('<i>', '</i>');
  var bracketWrap = makeFormatter('[', ']');

  print(boldHtml('중요'));        // <b>중요</b>
  print(italicHtml('강조'));      // <i>강조</i>
  print(bracketWrap('보조'));     // [보조]
}
```

---

## 8. 재귀 함수

함수가 **자기 자신을 호출**하는 방식입니다. 반복적 구조를 자연스럽게 표현할 수 있지만, 반드시 **종료 조건(Base Case)** 이 있어야 합니다.

```dart
// 팩토리얼 — n! = n × (n-1)!
int factorial(int n) {
  if (n <= 1) return 1;   // Base Case — 재귀 종료
  return n * factorial(n - 1);  // Recursive Case
}

// 피보나치
int fibonacci(int n) {
  if (n <= 1) return n;   // Base Case
  return fibonacci(n - 1) + fibonacci(n - 2);
}

void main() {
  print(factorial(5));    // 120  (5×4×3×2×1)
  print(factorial(0));    // 1
  print(fibonacci(8));    // 21   (0,1,1,2,3,5,8,13,21)
}
```

**재귀 호출 흐름 시각화 — factorial(4)**

```
factorial(4)
  └─ 4 × factorial(3)
           └─ 3 × factorial(2)
                    └─ 2 × factorial(1)
                               └─ 1  ← Base Case 도달
                    = 2 × 1 = 2
           = 3 × 2 = 6
  = 4 × 6 = 24
```

**재귀 vs 반복문 트레이드오프**

| 관점               | 재귀                       | 반복문            |
| ------------------ | -------------------------- | ----------------- |
| 코드 가독성        | 수학적 정의와 유사, 직관적 | 명시적 흐름       |
| 성능               | 함수 호출 스택 비용        | 일반적으로 효율적 |
| 스택 오버플로 위험 | 깊은 재귀 시 위험          | 없음              |
| 적합한 구조        | 트리, 그래프 탐색          | 단순 반복         |

---

## 9. 실습 — 실전 과제 1 준비

> 💡 이론 검증용 최소 실습 + Phase 1 실전 과제 1 준비 | DartPad 활용 권장

### 실습 9-1: Arrow function 변환

아래 일반 함수를 Arrow function으로 변환하세요.

```dart
// 변환 전
bool isPositive(int n) {
  return n > 0;
}

String formatPrice(int price) {
  return '₩${price.toString()}';
}

int clamp(int value, int min, int max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
```

> **정답 힌트**
>
> ```dart
> bool isPositive(int n) => n > 0;
>
> String formatPrice(int price) => '₩$price';
>
> // clamp는 여러 구문이 필요 — Arrow function 불가, 삼항 중첩 가능하지만 비권장
> int clamp(int value, int min, int max) {
>   if (value < min) return min;
>   if (value > max) return max;
>   return value;
> }
> // 또는 Dart 내장 clamp 메서드 활용: value.clamp(min, max)
> ```

### 실습 9-2: Named 매개변수 설계

아래 함수를 Named 매개변수 + `required` + Default 값을 활용해 리팩토링하세요.

```dart
// 리팩토링 전 — 매개변수 의미 불명확
void sendMessage(String to, String body, bool urgent, int retry) {
  String prefix = urgent ? '[긴급] ' : '';
  print('$to 에게 전송: $prefix$body (재시도: $retry회)');
}

// 호출부 — 각 인수의 의미를 알기 어려움
sendMessage('admin@dart.dev', '서버 장애', true, 3);
```

> **정답 힌트**
>
> ```dart
> void sendMessage({
>   required String to,
>   required String body,
>   bool urgent = false,
>   int retry = 0,
> }) {
>   String prefix = urgent ? '[긴급] ' : '';
>   print('$to 에게 전송: $prefix$body (재시도: $retry회)');
> }
>
> // 호출부 — 각 인수의 의미가 명확
> sendMessage(
>   to: 'admin@dart.dev',
>   body: '서버 장애',
>   urgent: true,
>   retry: 3,
> );
> ```

### 실습 9-3: 🎯 실전 과제 1 — CLI 계산기

Phase 1의 최종 실전 과제입니다. Step 1~5에서 학습한 내용을 종합 활용합니다.

**요구사항**

```
사용자로부터 두 숫자와 연산자(+, -, *, /)를 입력받아
사칙연산 결과를 출력하는 CLI 프로그램을 작성합니다.
```

**기능 명세**

```
1. 각 연산을 별도 함수로 분리 (add, subtract, multiply, divide)
2. 연산자 문자열을 받아 결과를 반환하는 calculate 함수 작성
3. 0으로 나누기 시 오류 메시지 출력 (예외 처리 미포함, 조건문 사용)
4. Named 매개변수 또는 Arrow function 최소 1회 이상 활용
5. 지원하지 않는 연산자 입력 시 오류 메시지 출력
```

**입출력 예시**

```
입력: a=10, b=3, op='+'  → 출력: 10 + 3 = 13
입력: a=10, b=3, op='-'  → 출력: 10 - 3 = 7
입력: a=10, b=3, op='*'  → 출력: 10 * 3 = 30
입력: a=10, b=3, op='/'  → 출력: 10 / 3 = 3.33
입력: a=10, b=0, op='/'  → 출력: 오류: 0으로 나눌 수 없습니다
입력: a=10, b=3, op='%'  → 출력: 오류: 지원하지 않는 연산자입니다
```

> **구현 힌트**
>
> ```dart
> double? add(double a, double b) => a + b;
> double? subtract(double a, double b) => a - b;
> double? multiply(double a, double b) => a * b;
> double? divide(double a, double b) {
>   if (b == 0) return null;
>   return a / b;
> }
>
> String calculate({
>   required double a,
>   required double b,
>   required String op,
> }) {
>   double? result = switch (op) {
>     '+'  => add(a, b),
>     '-'  => subtract(a, b),
>     '*'  => multiply(a, b),
>     '/'  => divide(a, b),
>     _    => null,
>   };
>
>   if (!const ['+', '-', '*', '/'].contains(op)) {
>     return '오류: 지원하지 않는 연산자입니다';
>   }
>   if (result == null) return '오류: 0으로 나눌 수 없습니다';
>
>   String formatted = result == result.truncateToDouble()
>       ? result.toInt().toString()
>       : result.toStringAsFixed(2);
>
>   return '$a $op $b = $formatted';
> }
>
> void main() {
>   print(calculate(a: 10, b: 3, op: '+'));
>   print(calculate(a: 10, b: 3, op: '/'));
>   print(calculate(a: 10, b: 0, op: '/'));
>   print(calculate(a: 10, b: 3, op: '%'));
> }
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                | 핵심 내용                                   |
| ------------------- | ------------------------------------------- |
| 기본 함수           | `반환타입 이름(매개변수) { return ...; }`   |
| Arrow function      | `=>` 단일 표현식 반환, `{ return }` 와 동일 |
| 위치 매개변수       | 순서 기반, 모두 필수                        |
| Named 매개변수 `{}` | 이름 기반, 기본적으로 Optional              |
| `required`          | Named 매개변수를 필수로 지정                |
| Optional 위치 `[]`  | 위치 유지 + 생략 가능, Default 값 설정      |
| Default 값          | 생략 시 사용할 기본값, `?` 타입 불필요      |
| 익명 함수           | 이름 없는 함수, 콜백으로 전달               |
| 고차 함수           | 함수를 인수로 받거나 반환하는 함수          |
| 클로저              | 외부 스코프 변수를 캡처하는 함수            |
| 일급 함수           | 함수를 변수에 저장, 인수 전달, 반환 가능    |

### 🎯 Phase 1 완료 체크리스트

Phase 1의 5개 Step을 모두 완료했습니다. 실전 과제 1(CLI 계산기)을 직접 구현한 후 아래를 확인하세요.

- [ ] Step 1: Dart Event Loop와 JIT/AOT 차이를 설명할 수 있다
- [ ] Step 2: `var`, `final`, `const`와 Null Safety 기초를 이해한다
- [ ] Step 3: `??`, `??=`, `?.`, `..` 연산자와 패턴 매칭 switch를 쓸 수 있다
- [ ] Step 4: 상황에 맞는 반복문을 선택하고 작성할 수 있다
- [ ] Step 5: Named + `required` 매개변수와 Arrow function을 설계할 수 있다
- [ ] 실전 과제 1: CLI 계산기를 독립적으로 구현했다

### 🔗 다음 단계

> **Phase 2 — Step 6: Collection 타입**으로 이동하세요.

Step 6에서는 Dart의 3대 컬렉션인 `List`, `Set`, `Map`의 특성과 차이, Mutable vs Immutable 생성 방법을 학습합니다. 이는 Step 7의 함수형 컬렉션 메서드(`map()`, `where()`, `reduce()`)와 실전 과제 2(도서 관리 시스템) 구현의 직접적인 기반입니다.

### 📚 참고 자료

| 자료                  | 링크                                                   |
| --------------------- | ------------------------------------------------------ |
| Dart 함수 공식 문서   | <https://dart.dev/language/functions>                  |
| Dart 함수 타입        | <https://dart.dev/language/type-system#function-types> |
| Effective Dart — 함수 | <https://dart.dev/effective-dart/design#functions>     |
| DartPad 온라인 실습   | <https://dartpad.dev>                                  |

### ❓ 자가진단 퀴즈

1. **[Remember]** Arrow function을 사용할 수 없는 경우는 언제인가?
2. **[Remember]** Named 매개변수와 Optional 위치 매개변수의 문법적 차이는 무엇인가?
3. **[Understand]** 다음 두 함수 선언의 차이를 설명하라.

   ```dart
   void f1({String? name}) { }
   void f2({required String name}) { }
   ```

4. **[Apply]** `int Function(int, int)` 타입의 `operation` 매개변수를 받아, `[1, 2, 3, 4, 5]` 리스트의 모든 요소에 적용한 결과 리스트를 반환하는 함수를 작성하라.
5. **[Analyze]** 클로저에서 "값이 아닌 변수를 캡처한다"는 말의 의미를 코드 예시로 설명하라.

> **4번 정답 힌트**
>
> ```dart
> List<int> applyAll(List<int> list, int Function(int) op) {
>   return list.map(op).toList();
> }
>
> void main() {
>   print(applyAll([1,2,3,4,5], (n) => n * 2));  // [2,4,6,8,10]
>   print(applyAll([1,2,3,4,5], (n) => n + 10)); // [11,12,13,14,15]
> }
> ```

---

_참고: 이 문서는 dart.dev 공식 문서(Functions) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
