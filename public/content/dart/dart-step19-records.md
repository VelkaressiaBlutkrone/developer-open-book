# Step 19 — Records와 구조적 타입

> **Phase 5 | 최신 Dart 문법** | 예상 소요: 1일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 19 — Records와 구조적 타입](#step-19--records와-구조적-타입)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [가벼운 구조체가 필요한 순간](#가벼운-구조체가-필요한-순간)
  - [3. Record 기본 문법](#3-record-기본-문법)
    - [3.1 Positional Record](#31-positional-record)
    - [3.2 Named Record](#32-named-record)
    - [3.3 혼합 Record](#33-혼합-record)
    - [3.4 Record 동등성 (Equality)](#34-record-동등성-equality)
  - [4. Record 타입 표기](#4-record-타입-표기)
  - [5. 함수에서 여러 값 반환](#5-함수에서-여러-값-반환)
  - [6. Record와 패턴 매칭](#6-record와-패턴-매칭)
    - [6.1 구조 분해](#61-구조-분해)
    - [6.2 switch와 Record](#62-switch와-record)
    - [6.3 `if-case`로 부분 추출](#63-if-case로-부분-추출)
  - [7. Record vs 다른 타입 비교](#7-record-vs-다른-타입-비교)
  - [8. 실용 Record 패턴](#8-실용-record-패턴)
    - [8.1 함수 다중 반환 + 파이프라인](#81-함수-다중-반환--파이프라인)
    - [8.2 Map 순회 — entries를 Record로](#82-map-순회--entries를-record로)
    - [8.3 zip 패턴](#83-zip-패턴)
    - [8.4 상태 스냅샷](#84-상태-스냅샷)
  - [9. 구조적 타입 (Structural Typing) 개념](#9-구조적-타입-structural-typing-개념)
  - [10. 실습](#10-실습)
    - [실습 10-1: Record 동등성 예측](#실습-10-1-record-동등성-예측)
    - [실습 10-2: 함수 다중 반환 설계](#실습-10-2-함수-다중-반환-설계)
    - [실습 10-3: switch + Record 패턴](#실습-10-3-switch--record-패턴)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                       |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | Positional Record와 Named Record의 선언 문법 차이를 나열할 수 있다                                         |
| 2   | 🟢 Understand | Record의 동등성이 구조(필드 값)를 기준으로 결정되는 이유를 설명할 수 있다                                  |
| 3   | 🟢 Understand | Record가 클래스보다 적합한 상황과 클래스가 더 적합한 상황을 구분하여 설명할 수 있다                        |
| 4   | 🟡 Apply      | 함수에서 Record로 여러 값을 반환하고 구조 분해로 추출할 수 있다                                            |
| 5   | 🟡 Apply      | `switch`와 `if-case`에서 Record 패턴을 사용해 복합 조건을 표현할 수 있다                                   |
| 6   | 🟠 Analyze    | Record, Map, 클래스, Sealed Class 중 상황에 맞는 데이터 표현 방식을 선택하고 트레이드오프를 설명할 수 있다 |

---

## 2. 서론

### 가벼운 구조체가 필요한 순간

함수에서 두 개 이상의 값을 반환하려면 어떻게 해야 할까요?

```dart
// ❌ 방법 1: List — 타입 안전성 없음, 의미 불명확
List<dynamic> divmod(int a, int b) => [a ~/ b, a % b];
var result = divmod(17, 5);
int quotient  = result[0];  // int? 타입 보장 없음
int remainder = result[1];  // 인덱스로 접근 — 의미 모호

// ❌ 방법 2: Map — 타입 안전성 없음, 키 오타 위험
Map<String, int> divmod2(int a, int b) =>
    {'quotient': a ~/ b, 'remainder': a % b};
var r = divmod2(17, 5);
print(r['quotient']);   // 타입: int? 아닌 dynamic
print(r['remander']);   // 오타 — 런타임에서야 발견

// ❌ 방법 3: 전용 클래스 — 간단한 값에 너무 많은 보일러플레이트
class DivisionResult {
  final int quotient;
  final int remainder;
  DivisionResult(this.quotient, this.remainder);
}
DivisionResult divmod3(int a, int b) =>
    DivisionResult(a ~/ b, a % b);

// ✅ 방법 4: Record — 타입 안전 + 보일러플레이트 없음
(int, int) divmod4(int a, int b) => (a ~/ b, a % b);
var (q, r) = divmod4(17, 5);
print('몫: $q, 나머지: $r');  // 몫: 3, 나머지: 2
```

**Record의 세 가지 특성**

```
1. 불변(Immutable) — 필드를 수정할 수 없음
2. 값 타입 의미론(Value Semantics) — 내용이 같으면 동등
3. 익명(Anonymous) — 별도 클래스 선언 불필요
```

> **전제 지식**: Step 16 (제네릭), Step 18 (패턴 매칭, 구조 분해)

---

## 3. Record 기본 문법

### 3.1 Positional Record

```dart
void main() {
  // 선언 — 소괄호로 감싼 값들
  var point = (10, 20);           // (int, int)
  var color = (255, 128, 0);      // (int, int, int)
  var mixed = ('hello', 42, true); // (String, int, bool)

  // 필드 접근 — $1, $2, $3 ... (1부터 시작)
  print(point.$1);  // 10
  print(point.$2);  // 20
  print(color.$3);  // 0

  // 타입은 컴파일러가 추론
  (int, int) coords = (3, 4);
  print(coords.$1 + coords.$2);  // 7

  // 중첩 Record
  var nested = ((1, 2), (3, 4));
  print(nested.$1.$2);  // 2  (첫 번째 Record의 두 번째 필드)
}
```

---

### 3.2 Named Record

```dart
void main() {
  // Named Field — {필드명: 값} 형태, 순서 무관
  var person = (name: '홍길동', age: 30);
  var point  = (x: 10.0, y: 20.0);

  // 필드 접근 — 이름으로 직접
  print(person.name);  // 홍길동
  print(person.age);   // 30
  print(point.x);      // 10.0

  // Named Record 타입 표기
  ({String name, int age}) employee = (name: '김철수', age: 25);
  print(employee.name);

  // Named Field는 순서와 무관하게 동등
  var r1 = (name: 'Dart', version: 3);
  var r2 = (version: 3, name: 'Dart');  // 순서 다름
  print(r1 == r2);  // true — 이름+값 기준 동등

  // 이름으로 접근하므로 $1, $2 없음
  // print(person.$1);  // Named field는 $N 접근 불가
}
```

---

### 3.3 혼합 Record

Positional과 Named 필드를 함께 사용할 수 있습니다.

```dart
void main() {
  // 혼합 — Positional 먼저, Named는 뒤
  var entry = ('홍길동', age: 30, dept: '개발');

  // 접근
  print(entry.$1);    // 홍길동 (Positional)
  print(entry.age);   // 30     (Named)
  print(entry.dept);  // 개발   (Named)

  // 타입 표기
  (String, {int age, String dept}) emp = ('김철수', age: 25, dept: '기획');
  print(emp.$1);   // 김철수
  print(emp.age);  // 25

  // 실용 예 — HTTP 응답 표현
  (int statusCode, {String body, Map<String, String> headers})
    response = (200, body: '{"ok": true}', headers: {'Content-Type': 'application/json'});

  print(response.$1);           // 200
  print(response.body);         // {"ok": true}
  print(response.headers);      // {Content-Type: application/json}
}
```

---

### 3.4 Record 동등성 (Equality)

Record는 **구조(shape)와 값**이 같으면 동등합니다. 클래스와 달리 `==`와 `hashCode`를 재정의할 필요가 없습니다.

```dart
void main() {
  // Positional — 순서와 값이 같으면 동등
  var a = (1, 2, 3);
  var b = (1, 2, 3);
  var c = (1, 2, 4);

  print(a == b);  // true  — 같은 값
  print(a == c);  // false — 세 번째 값 다름

  // Named — 이름+값 기준 동등 (순서 무관)
  var d = (x: 10, y: 20);
  var e = (x: 10, y: 20);
  var f = (y: 20, x: 10);  // 순서 다름

  print(d == e);  // true
  print(d == f);  // true  — Named는 순서 무관

  // 타입 구조가 다르면 동등 불가
  // (int, int)와 ({int x, int y})는 다른 타입
  // var g = (1, 2);
  // var h = (x: 1, y: 2);
  // print(g == h);  // ❌ 컴파일 오류 — 타입 불일치

  // Set/Map의 키로 사용 가능 (hashCode 자동)
  var set = {(1, 'a'), (2, 'b'), (1, 'a')};
  print(set.length);  // 2 — 중복 자동 제거

  var map = {(1, 2): '점 A', (3, 4): '점 B'};
  print(map[(1, 2)]);  // 점 A
}
```

---

## 4. Record 타입 표기

```dart
// 타입 별칭으로 Record 타입 재사용
typedef Point  = (double x, double y);
typedef Size   = ({double width, double height});
typedef Rect   = ({Point origin, Size size});

// 함수 시그니처에서 타입 표기
(int, int) divmod(int a, int b) => (a ~/ b, a % b);

({String name, int score}) topPlayer(List<({String name, int score})> players) =>
    players.reduce((a, b) => a.score >= b.score ? a : b);

// 제네릭과 조합
(T, T) minMax<T extends Comparable<T>>(List<T> list) {
  final sorted = [...list]..sort();
  return (sorted.first, sorted.last);
}

void main() {
  // typedef 활용
  Point p = (3.0, 4.0);
  print(p.$1);  // 3.0

  // 제네릭 Record 반환
  var (min, max) = minMax([5, 2, 8, 1, 9]);
  print('최솟값: $min, 최댓값: $max');  // 최솟값: 1, 최댓값: 9

  var (minS, maxS) = minMax(['banana', 'apple', 'cherry']);
  print('최솟값: $minS, 최댓값: $maxS');  // 최솟값: apple, 최댓값: cherry

  // 플레이어
  var players = [
    (name: '홍길동', score: 95),
    (name: '김철수', score: 87),
    (name: '이영희', score: 98),
  ];
  var top = topPlayer(players);
  print('1등: ${top.name} (${top.score}점)');  // 1등: 이영희 (98점)
}
```

---

## 5. 함수에서 여러 값 반환

Record의 가장 실용적인 사용입니다.

```dart
import 'dart:math';

// 여러 통계값 동시 반환
({double mean, double median, double stdDev})
    statistics(List<double> data) {
  final n      = data.length;
  final sorted = [...data]..sort();
  final mean   = data.fold(0.0, (a, b) => a + b) / n;
  final median = sorted[n ~/ 2];
  final variance = data.map((x) => pow(x - mean, 2)).fold(0.0, (a, b) => a + b) / n;

  return (mean: mean, median: median, stdDev: sqrt(variance));
}

// 성공/실패를 모두 반환 (Result 패턴 경량 버전)
(bool success, String? error) validateEmail(String email) {
  if (email.isEmpty) return (false, '이메일이 비어 있습니다');
  if (!email.contains('@')) return (false, '@가 없습니다');
  if (!email.contains('.')) return (false, '도메인이 올바르지 않습니다');
  return (true, null);
}

// 상태와 값을 함께 반환
(DateTime parsedAt, int count, List<String> items)
    parseResponse(String raw) {
  final items = raw.split(',').map((s) => s.trim()).toList();
  return (DateTime.now(), items.length, items);
}

// 분할 정복 — 여러 부분 결과 반환
({List<int> evens, List<int> odds, int sum}) partition(List<int> numbers) {
  final evens = numbers.where((n) => n % 2 == 0).toList();
  final odds  = numbers.where((n) => n % 2 != 0).toList();
  return (evens: evens, odds: odds, sum: numbers.fold(0, (a, b) => a + b));
}

void main() {
  // 구조 분해로 여러 값 추출
  final (:mean, :median, :stdDev) = statistics([2, 4, 4, 4, 5, 5, 7, 9]);
  print('평균: ${mean.toStringAsFixed(2)}');    // 5.00
  print('중앙값: ${median.toStringAsFixed(2)}');  // 4.50
  print('표준편차: ${stdDev.toStringAsFixed(2)}'); // 2.00

  // 유효성 검사
  final (success, error) = validateEmail('user@dart.dev');
  if (success) {
    print('유효한 이메일');
  } else {
    print('오류: $error');
  }

  final (success2, error2) = validateEmail('not-an-email');
  print('유효: $success2, 오류: $error2');
  // 유효: false, 오류: @가 없습니다

  // 분할
  final (:evens, :odds, :sum) = partition([1, 2, 3, 4, 5, 6]);
  print('짝수: $evens');  // [2, 4, 6]
  print('홀수: $odds');   // [1, 3, 5]
  print('합계: $sum');    // 21
}
```

---

## 6. Record와 패턴 매칭

### 6.1 구조 분해

```dart
void main() {
  // 기본 구조 분해
  var (x, y) = (10, 20);
  print('x=$x, y=$y');  // x=10, y=20

  // Named 구조 분해 — :필드명으로 추출
  var (:name, :age) = (name: '홍길동', age: 30);
  print('$name ($age)');  // 홍길동 (30)

  // 이름 바꿔서 추출
  var (name: userName, age: userAge) = (name: '김철수', age: 25);
  print('$userName ($userAge)');  // 김철수 (25)

  // 일부만 추출 — 나머지 무시
  var (first, _) = (10, 20);
  print(first);  // 10

  var (:name2, age: _) = (name2: '이영희', age: 28);
  // Named에서 age는 무시

  // 중첩 구조 분해
  var ((a, b), (c, d)) = ((1, 2), (3, 4));
  print('$a $b $c $d');  // 1 2 3 4

  // 리스트와 Record 조합 분해
  var [(p, q), (r, s)] = [(1, 2), (3, 4)];
  print('$p $q $r $s');  // 1 2 3 4

  // 함수 반환값 즉시 구조 분해
  (int, int) divmod(int a, int b) => (a ~/ b, a % b);

  var (quotient, remainder) = divmod(17, 5);
  print('$quotient ... $remainder');  // 3 ... 2
}
```

---

### 6.2 switch와 Record

```dart
void main() {
  // Record를 switch로 패턴 매칭
  String classifyPoint((int, int) point) => switch (point) {
    (0, 0)          => '원점',
    (var x, 0)      => 'x축 위 ($x)',
    (0, var y)      => 'y축 위 ($y)',
    (var x, var y) when x == y  => '대각선 ($x, $y)',
    (var x, var y) when x > 0 && y > 0 => '1사분면',
    (var x, var y) when x < 0 && y > 0 => '2사분면',
    (var x, var y) when x < 0 && y < 0 => '3사분면',
    (var x, var y) => '4사분면',
  };

  print(classifyPoint((0, 0)));     // 원점
  print(classifyPoint((5, 0)));     // x축 위 (5)
  print(classifyPoint((3, 3)));     // 대각선 (3, 3)
  print(classifyPoint((2, 5)));     // 1사분면
  print(classifyPoint((-1, 3)));    // 2사분면

  // Named Record switch
  String describeUser(({String role, bool active}) user) => switch (user) {
    (role: 'admin', active: true)   => '활성 관리자',
    (role: 'admin', active: false)  => '비활성 관리자',
    (role: _, active: false)        => '비활성 사용자',
    (role: var r, active: true)     => '활성 사용자 ($r)',
  };

  print(describeUser((role: 'admin', active: true)));   // 활성 관리자
  print(describeUser((role: 'member', active: false))); // 비활성 사용자
  print(describeUser((role: 'editor', active: true)));  // 활성 사용자 (editor)
}
```

---

### 6.3 `if-case`로 부분 추출

```dart
void main() {
  Object value = ('Dart', 3);

  // if-case — 패턴 매칭 + 타입 승격
  if (value case (String lang, int version)) {
    print('$lang v$version');  // Dart v3
  }

  // Named Record if-case
  Object config = (host: 'localhost', port: 8080);

  if (config case (host: String host, port: int port) when port > 1024) {
    print('유효한 서버: $host:$port');  // 유효한 서버: localhost:8080
  }

  // 리스트에서 Record 꺼내기
  var points = [(1, 2), (3, 4), (0, 0), (5, 6)];

  for (var point in points) {
    if (point case (0, 0)) {
      print('원점 발견!');
    } else if (point case (var x, var y) when x + y > 5) {
      print('합이 5 초과: ($x, $y)');  // (3, 4), (5, 6)
    }
  }
}
```

---

## 7. Record vs 다른 타입 비교

![diagram](/developer-open-book/diagrams/step19-record-comparison.svg)

**선택 기준**

```
데이터에 행동(메서드)이 필요하다
  → Class

타입 계층이 필요하다 (상속, 다형성)
  → Class / Abstract Class / Sealed Class

여러 값을 함수에서 반환하거나 임시로 묶고 싶다
  → Record

각 케이스가 다른 구조를 가진 상태를 모델링한다
  → Sealed Class

키가 런타임에 결정된다
  → Map

값이 가변이어야 한다
  → Class (mutable field)
```

---

## 8. 실용 Record 패턴

### 8.1 함수 다중 반환 + 파이프라인

```dart
// 검증 결과 — 성공이면 변환된 값, 실패면 오류 메시지
(T?, String?) validate<T>(
  String input,
  T? Function(String) parser,
  String Function(String) errorMsg,
) {
  final value = parser(input);
  return value != null ? (value, null) : (null, errorMsg(input));
}

// 사용
void main() {
  // int 파싱
  final (intVal, intErr) = validate(
    '42',
    int.tryParse,
    (s) => '"$s"은 정수가 아닙니다',
  );
  print('값: $intVal, 오류: $intErr');  // 값: 42, 오류: null

  final (intVal2, intErr2) = validate(
    'abc',
    int.tryParse,
    (s) => '"$s"은 정수가 아닙니다',
  );
  print('값: $intVal2, 오류: $intErr2');
  // 값: null, 오류: "abc"은 정수가 아닙니다

  // 여러 필드 검증
  final fields = [
    ('이메일', 'user@dart.dev', (String s) => s.contains('@') ? s : null),
    ('나이',   '25',            (String s) => int.tryParse(s)),
    ('이름',   '',              (String s) => s.isNotEmpty ? s : null),
  ];

  for (var (label, input, parser) in fields) {
    final (val, err) = validate(input, parser, (s) => '$label 오류');
    if (err != null) print('⚠ $err');
    else             print('✅ $label: $val');
  }
  // ✅ 이메일: user@dart.dev
  // ✅ 나이: 25
  // ⚠ 이름 오류
}
```

---

### 8.2 Map 순회 — entries를 Record로

```dart
void main() {
  var scores = {
    '수학': 92,
    '영어': 85,
    '과학': 98,
    '국어': 78,
  };

  // Map.entries를 Record 구조 분해로 순회
  for (var MapEntry(:key, :value) in scores.entries) {
    print('$key: $value점');
  }

  // 조건부 필터링
  var failing = [
    for (var MapEntry(:key, :value) in scores.entries)
      if (value < 90) (subject: key, score: value),
  ];

  for (var (:subject, :score) in failing) {
    print('보충 필요: $subject ($score점)');
  }
  // 보충 필요: 영어 (85점)
  // 보충 필요: 국어 (78점)

  // Record를 Map으로 변환
  var records = [(key: 'a', val: 1), (key: 'b', val: 2), (key: 'c', val: 3)];
  var map = { for (var (:key, :val) in records) key: val };
  print(map);  // {a: 1, b: 2, c: 3}
}
```

---

### 8.3 zip 패턴

```dart
// 두 리스트를 Record 쌍으로 묶기
Iterable<(A, B)> zip<A, B>(List<A> as, List<B> bs) sync* {
  final len = as.length < bs.length ? as.length : bs.length;
  for (int i = 0; i < len; i++) yield (as[i], bs[i]);
}

// 세 리스트 zip
Iterable<(A, B, C)> zip3<A, B, C>(List<A> as, List<B> bs, List<C> cs) sync* {
  final len = [as.length, bs.length, cs.length].reduce((a, b) => a < b ? a : b);
  for (int i = 0; i < len; i++) yield (as[i], bs[i], cs[i]);
}

void main() {
  var names  = ['홍길동', '김철수', '이영희'];
  var scores = [95, 87, 92];
  var grades = ['A', 'B', 'A'];

  // zip 두 리스트
  for (var (name, score) in zip(names, scores)) {
    print('$name: $score점');
  }
  // 홍길동: 95점 / 김철수: 87점 / 이영희: 92점

  // zip 세 리스트
  for (var (name, score, grade) in zip3(names, scores, grades)) {
    print('$name: $score점 ($grade)');
  }

  // zip을 활용한 Map 생성
  var nameScoreMap = Map.fromEntries(
    zip(names, scores).map((pair) => MapEntry(pair.$1, pair.$2)),
  );
  print(nameScoreMap);  // {홍길동: 95, 김철수: 87, 이영희: 92}
}
```

---

### 8.4 상태 스냅샷

Record는 불변이므로 **상태의 특정 시점 스냅샷**을 표현하기에 적합합니다.

```dart
class UserSession {
  String userId;
  String role;
  DateTime loginAt;
  bool isActive;

  UserSession({
    required this.userId,
    required this.role,
    required this.loginAt,
    this.isActive = true,
  });

  // 현재 상태의 불변 스냅샷
  ({String userId, String role, DateTime loginAt, bool isActive})
      get snapshot => (
            userId:  userId,
            role:    role,
            loginAt: loginAt,
            isActive: isActive,
          );
}

class AuditLog {
  final List<({
    DateTime timestamp,
    String userId,
    String action,
    ({String userId, String role, bool isActive}) before,
    ({String userId, String role, bool isActive}) after,
  })> _entries = [];

  void record({
    required String userId,
    required String action,
    required ({String userId, String role, bool isActive}) before,
    required ({String userId, String role, bool isActive}) after,
  }) {
    _entries.add((
      timestamp: DateTime.now(),
      userId:    userId,
      action:    action,
      before:    before,
      after:     after,
    ));
  }

  void printAll() {
    for (var (:timestamp, :userId, :action, :before, :after) in _entries) {
      print('[$timestamp] $userId - $action');
      print('  변경 전: ${before.role} (활성: ${before.isActive})');
      print('  변경 후: ${after.role} (활성: ${after.isActive})');
    }
  }
}

void main() {
  var session = UserSession(
    userId:  'u001',
    role:    'member',
    loginAt: DateTime.now(),
  );

  var log = AuditLog();
  var before = session.snapshot;

  session.role     = 'moderator';
  session.isActive = false;

  log.record(
    userId: 'admin',
    action: 'role_change',
    before: (userId: before.userId, role: before.role, isActive: before.isActive),
    after:  (userId: session.userId, role: session.role, isActive: session.isActive),
  );

  log.printAll();
}
```

---

## 9. 구조적 타입 (Structural Typing) 개념

Dart는 기본적으로 **명목적 타입(Nominal Typing)** 을 사용합니다. 타입의 이름이 타입 동등성을 결정합니다.

```dart
// 명목적 타입 — 이름이 달라지면 다른 타입
class Point    { final int x, y; Point(this.x, this.y); }
class Location { final int x, y; Location(this.x, this.y); }

void printPoint(Point p) => print('(${p.x}, ${p.y})');

// printPoint(Location(1, 2));  // ❌ 구조가 같아도 타입이 달라 불가
```

**Record는 구조적 타입에 가깝습니다.** 이름(타입명) 없이 구조(필드 타입과 이름)로 동등성을 판단합니다.

```dart
void main() {
  // Record — 구조가 같으면 동등 타입
  (int, int) a = (1, 2);
  (int, int) b = (1, 2);
  print(a == b);  // true — 구조와 값 모두 같음

  // 타입이 같으면 함수 인수로 전달 가능
  void printPair((int, int) pair) => print('(${pair.$1}, ${pair.$2})');
  printPair((10, 20));  // ✅
  printPair(a);          // ✅

  // typedef는 단순 별칭 — 구조가 같으면 같은 타입
  typedef IntPair = (int, int);
  IntPair c = (3, 4);
  printPair(c);  // ✅ IntPair는 (int, int)와 동일 타입
}
```

**구조적 타입의 장단점**

```
장점:
  - 보일러플레이트 없음 — 클래스 선언 불필요
  - 구조가 맞으면 자동으로 호환
  - 빠른 프로토타이핑

단점:
  - 의미적 구분 불가
    예: (double lat, double lng)와 (double x, double y)는
        구조적으로 같지만 의미는 다름
  - 메서드 추가 불가 → 도메인 로직 표현 한계

→ 임시 묶음/반환값: Record
→ 도메인 모델/비즈니스 로직: Class
```

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 10-1: Record 동등성 예측

아래 각 비교의 결과(`true`/`false`/컴파일 오류)를 예측하고 이유를 설명하세요.

```dart
void main() {
  // 1
  print((1, 2) == (1, 2));

  // 2
  print((1, 2) == (2, 1));

  // 3
  print((x: 1, y: 2) == (y: 2, x: 1));

  // 4
  print((1, 'a') == (1, 'a'));

  // 5 — 아래 줄은 컴파일 오류인가?
  // print((1, 2) == (x: 1, y: 2));

  // 6
  var a = (name: 'Dart', v: 3);
  var b = (v: 3, name: 'Dart');
  print(a == b);
}
```

> **정답 힌트**
>
> ```
> 1. true  — 구조와 값 동일
> 2. false — 순서 다름 (Positional은 순서 중요)
> 3. true  — Named는 순서 무관, 이름+값 기준
> 4. true  — 타입과 값 모두 동일
> 5. 컴파일 오류 — (int, int)와 ({int x, int y})는 다른 Record 타입
> 6. true  — Named Record, 순서 무관
> ```

### 실습 10-2: 함수 다중 반환 설계

아래 함수들을 Record를 반환하도록 구현하세요.

```dart
// 1. 문자열 통계 분석
// 반환: 단어 수, 문자 수(공백 제외), 가장 긴 단어
(int words, int chars, String longestWord) analyzeText(String text) {
  // TODO
}

// 2. 리스트 분할 — 조건에 맞는 것과 맞지 않는 것
({List<T> matched, List<T> unmatched}) partition<T>(
  List<T> items,
  bool Function(T) predicate,
) {
  // TODO
}

// 3. 최솟값과 그 인덱스
(int minValue, int minIndex) findMin(List<int> numbers) {
  // TODO
}

void main() {
  final (words: w, chars: c, longestWord: lw) =
      analyzeText('Dart is a great language for mobile and web');
  print('단어: $w, 문자: $c, 최장 단어: $lw');
  // 단어: 9, 문자: 36, 최장 단어: language

  final (:matched, :unmatched) =
      partition([1, 2, 3, 4, 5, 6], (n) => n % 2 == 0);
  print('짝수: $matched, 홀수: $unmatched');
  // 짝수: [2, 4, 6], 홀수: [1, 3, 5]

  final (minValue, minIndex) = findMin([5, 2, 8, 1, 9, 3]);
  print('최솟값: $minValue (인덱스: $minIndex)');
  // 최솟값: 1 (인덱스: 3)
}
```

> **정답 힌트**
>
> ```dart
> (int words, int chars, String longestWord) analyzeText(String text) {
>   final ws = text.split(' ').where((w) => w.isNotEmpty).toList();
>   final cs = text.replaceAll(' ', '').length;
>   final lw = ws.reduce((a, b) => a.length >= b.length ? a : b);
>   return (ws.length, cs, lw);
> }
>
> ({List<T> matched, List<T> unmatched}) partition<T>(
>   List<T> items, bool Function(T) predicate) {
>   return (
>     matched:   items.where(predicate).toList(),
>     unmatched: items.where((i) => !predicate(i)).toList(),
>   );
> }
>
> (int minValue, int minIndex) findMin(List<int> numbers) {
>   int minVal = numbers[0], minIdx = 0;
>   for (int i = 1; i < numbers.length; i++) {
>     if (numbers[i] < minVal) { minVal = numbers[i]; minIdx = i; }
>   }
>   return (minVal, minIdx);
> }
> ```

### 실습 10-3: switch + Record 패턴

아래 요구사항의 `classifyTriangle` 함수를 구현하세요.

**요구사항**

- 입력: 세 변의 길이 `(double, double, double)` Record
- 삼각형 불성립 조건 처리 (`'삼각형 아님'` 반환)
- 정삼각형 (`'정삼각형'`)
- 이등변삼각형 (`'이등변삼각형'`)
- 직각삼각형 판별 (피타고라스, 소수점 오차 허용 `abs < 0.001`)
- 나머지는 `'일반삼각형'`

```dart
String classifyTriangle((double, double, double) sides) {
  var (a, b, c) = sides;
  // 정렬해서 a ≤ b ≤ c 보장
  final sorted = [a, b, c]..sort();
  (a, b, c) = (sorted[0], sorted[1], sorted[2]);

  // TODO: switch + when guard로 구현
}

void main() {
  print(classifyTriangle((1, 2, 10)));   // 삼각형 아님
  print(classifyTriangle((3, 3, 3)));    // 정삼각형
  print(classifyTriangle((5, 5, 8)));    // 이등변삼각형
  print(classifyTriangle((3, 4, 5)));    // 직각삼각형
  print(classifyTriangle((2, 3, 4)));    // 일반삼각형
}
```

> **정답 힌트**
>
> ```dart
> String classifyTriangle((double, double, double) sides) {
>   var (a, b, c) = sides;
>   final sorted = [a, b, c]..sort();
>   (a, b, c) = (sorted[0], sorted[1], sorted[2]);
>
>   return switch ((a, b, c)) {
>     (var a, var b, var c) when a + b <= c
>       => '삼각형 아님',
>     (var a, _, var c) when a == c
>       => '정삼각형',
>     (var a, var b, var c) when a == b || b == c
>       => '이등변삼각형',
>     (var a, var b, var c) when (c * c - (a * a + b * b)).abs() < 0.001
>       => '직각삼각형',
>     _ => '일반삼각형',
>   };
> }
> ```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념              | 핵심 내용                                          |
| ----------------- | -------------------------------------------------- |
| Positional Record | `(v1, v2)` — `$1`, `$2`로 접근                     |
| Named Record      | `(name: v1, age: v2)` — 필드명으로 접근, 순서 무관 |
| 혼합 Record       | Positional + Named 조합                            |
| Record 동등성     | 구조(타입+이름)와 값이 같으면 자동으로 `==` 성립   |
| `typedef`         | Record 타입에 이름 붙이기                          |
| 다중 반환         | `(T1, T2)` 또는 `({T1 f1, T2 f2})` 반환            |
| 구조 분해         | `var (a, b) = record` — 즉시 변수 추출             |
| `:필드명`         | Named field 구조 분해 단축 문법                    |
| `switch` + Record | 좌표 분류, 상태 매칭 등 다중 값 조건               |
| `if-case`         | 단일 패턴 매칭 + 변수 추출                         |
| `zip` 패턴        | 두 리스트를 Record 쌍으로 묶기                     |
| 구조적 타입       | Record는 구조(shape)로 동등성 결정                 |
| Record vs Class   | 임시 묶음 → Record, 도메인 모델 → Class            |

### 🔗 다음 단계

> **Step 20 — Callable 클래스, Typedef, 함수형 프로그래밍 심화**로 이동하세요.

Step 20에서는 `call()` 메서드로 클래스를 함수처럼 사용하는 Callable 클래스, `typedef`로 함수 타입에 이름 붙이기, 고차 함수 패턴, 클로저 캡처 심화, 커링(Currying), 함수 합성(Compose)을 학습합니다. Record와 함수형 패턴이 결합되면 간결하고 타입 안전한 데이터 파이프라인을 구성할 수 있습니다.

### 📚 참고 자료

| 자료                   | 링크                                             |
| ---------------------- | ------------------------------------------------ |
| Dart Records 공식 문서 | <https://dart.dev/language/records>                |
| 구조 분해 패턴         | <https://dart.dev/language/patterns#destructuring> |
| 패턴 타입 전체 목록    | <https://dart.dev/language/pattern-types>          |
| DartPad 온라인 실습    | <https://dartpad.dev>                              |

### ❓ 자가진단 퀴즈

1. **[Remember]** Named Record `(x: 1, y: 2)`에서 `$1`로 `x` 값에 접근할 수 있는가? 이유를 설명하라.
2. **[Remember]** Record를 `Set`에 넣거나 `Map`의 키로 사용할 수 있는 이유를 `hashCode` 관점에서 설명하라.
3. **[Understand]** `typedef Coordinate = (double, double)`로 선언한 `Coordinate`와 `(double, double)` 타입은 서로 호환되는가? 이유를 설명하라.
4. **[Understand]** Record가 불변(immutable)인 설계 결정이 멀티스레드 환경(Isolate 간 메시지 패싱)에서 어떤 이점을 제공하는지 설명하라.
5. **[Apply]** `List<({String name, int age})>`를 나이 기준 내림차순으로 정렬하고, 나이가 같으면 이름 오름차순으로 정렬하는 코드를 작성하라.
6. **[Analyze]** 함수가 `(bool, String?)` Record를 반환하는 방식과 `Result<T, E>` Sealed Class를 반환하는 방식을 비교하라. 각각이 적합한 상황을 코드 복잡도, 타입 표현력, 파이프라인 구성 용이성 세 관점에서 분석하라.

> **5번 정답 힌트**
>
> ```dart
> var people = [
>   (name: '이영희', age: 30),
>   (name: '홍길동', age: 30),
>   (name: '김철수', age: 25),
> ];
>
> people.sort((a, b) {
>   final ageCmp = b.age.compareTo(a.age);  // 나이 내림차순
>   return ageCmp != 0 ? ageCmp : a.name.compareTo(b.name);  // 이름 오름차순
> });
>
> for (var (:name, :age) in people) print('$name ($age)');
> // 홍길동 (30) / 이영희 (30) / 김철수 (25)
> ```

> **6번 정답 힌트**
>
> `(bool, String?)`: 코드 단순, 선언 불필요. 하지만 `bool`이 성공/실패 외 다른 의미로 오해될 수 있고, 파이프라인(`map`/`flatMap`)이 없어 체이닝 어려움. 단순한 유효성 검사처럼 호출자가 즉시 분기하는 경우 적합.
> `Result<T, E>`: 선언 필요하지만 의미가 명확, 타입에 오류 정보 포함, `map`/`flatMap`으로 파이프라인 구성 가능. 오류 처리 로직이 복잡하거나 여러 단계를 거치는 경우 적합.

---

> ⬅️ [Step 18 — 타입 패턴 매칭과 Sealed Class](#) | ➡️ [Step 20 — Callable, Typedef, 함수형 심화 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Records, Patterns) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
