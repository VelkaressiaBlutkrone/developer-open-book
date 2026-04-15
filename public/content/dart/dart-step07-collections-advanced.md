# Step 7 — Collection 고급 및 함수형 프로그래밍

> **Phase 2 | 컬렉션과 객체지향** | 예상 소요: 2일 | 블룸 수준: Apply ~ Analyze

---

## 📋 목차

- [Step 7 — Collection 고급 및 함수형 프로그래밍](#step-7--collection-고급-및-함수형-프로그래밍)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [선언형 컬렉션 조작의 힘](#선언형-컬렉션-조작의-힘)
  - [3. Spread 연산자 `...` / `...?`](#3-spread-연산자---)
    - [기본 사용법](#기본-사용법)
    - [`...?` — Null 조건부 Spread](#--null-조건부-spread)
    - [실용 패턴 — 불변 컬렉션 복사와 확장](#실용-패턴--불변-컬렉션-복사와-확장)
  - [4. Collection if / Collection for](#4-collection-if--collection-for)
    - [4.1 Collection if](#41-collection-if)
    - [4.2 Collection for](#42-collection-for)
    - [4.3 조합 활용](#43-조합-활용)
  - [5. Iterable — 지연 평가의 원리](#5-iterable--지연-평가의-원리)
    - [Iterable이란?](#iterable이란)
    - [지연 평가 (Lazy Evaluation)](#지연-평가-lazy-evaluation)
  - [6. 핵심 함수형 메서드](#6-핵심-함수형-메서드)
    - [6.1 `map()` — 변환](#61-map--변환)
    - [6.2 `where()` / `whereType()` — 필터](#62-where--wheretype--필터)
    - [6.3 `reduce()` — 단일값으로 축약](#63-reduce--단일값으로-축약)
    - [6.4 `fold()` — 초기값 있는 축약](#64-fold--초기값-있는-축약)
    - [6.5 `expand()` — 평탄화](#65-expand--평탄화)
    - [6.6 `any()` / `every()` — 조건 검사](#66-any--every--조건-검사)
    - [6.7 `firstWhere()` / `lastWhere()` — 조건 검색](#67-firstwhere--lastwhere--조건-검색)
    - [6.8 `take()` / `skip()` — 범위 선택](#68-take--skip--범위-선택)
    - [6.9 `toList()` / `toSet()` — 구체화](#69-tolist--toset--구체화)
  - [7. 메서드 체이닝 — 파이프라인 설계](#7-메서드-체이닝--파이프라인-설계)
  - [8. 함수형 vs 명령형 비교](#8-함수형-vs-명령형-비교)
  - [9. 실습](#9-실습)
    - [실습 9-1: Collection if / for 활용](#실습-9-1-collection-if--for-활용)
    - [실습 9-2: 함수형 메서드 체이닝](#실습-9-2-함수형-메서드-체이닝)
    - [실습 9-3: `reduce()` vs `fold()` 안전성 비교](#실습-9-3-reduce-vs-fold-안전성-비교)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                   |
| --- | ------------- | -------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `map()`, `where()`, `reduce()`, `fold()`, `expand()`의 역할을 나열할 수 있다           |
| 2   | 🟢 Understand | `Iterable`의 지연 평가(Lazy Evaluation) 원리를 설명할 수 있다                          |
| 3   | 🟢 Understand | `reduce()`와 `fold()`의 차이를 초기값 유무와 빈 컬렉션 처리 관점에서 설명할 수 있다    |
| 4   | 🟡 Apply      | Spread 연산자와 Collection if/for를 활용해 조건부 컬렉션 리터럴을 작성할 수 있다       |
| 5   | 🟡 Apply      | 복잡한 데이터 변환을 `map()`, `where()`, `fold()` 체이닝으로 작성할 수 있다            |
| 6   | 🟠 Analyze    | 같은 결과를 내는 명령형 코드와 함수형 코드의 가독성·성능 트레이드오프를 분석할 수 있다 |

---

## 2. 서론

### 선언형 컬렉션 조작의 힘

Step 6에서 컬렉션을 **생성하고 수정**하는 방법을 배웠습니다. Step 7에서는 컬렉션을 **어떻게 조작하고 변환하는가**에 집중합니다.

Dart는 컬렉션 조작에 두 가지 패러다임을 모두 지원합니다.

```
명령형 (Imperative) — "어떻게 할지" 기술
    for 루프, if 분기, 중간 변수를 명시적으로 작성

함수형 (Functional) — "무엇을 원하는지" 기술
    map(), where(), reduce() 등 고차 함수로 의도를 선언
```

두 방식은 동일한 결과를 냅니다. 차이는 **코드가 의도를 얼마나 직접적으로 표현하는가**입니다. Flutter 코드베이스는 위젯 트리 구성, 상태 변환, API 응답 처리 전반에서 함수형 컬렉션 패턴을 광범위하게 사용합니다. 이 패턴에 익숙해지는 것이 이번 Step의 핵심 목표입니다.

> **전제 지식**: Step 6 완료 (List, Set, Map 생성·조작), Step 5 (고차 함수, 클로저, Arrow function)

---

## 3. Spread 연산자 `...` / `...?`

Spread 연산자(`...`)는 **컬렉션의 모든 요소를 다른 컬렉션 리터럴 안에 펼쳐 넣습니다.** 여러 컬렉션을 합치거나 요소를 조건부로 포함할 때 간결하게 사용합니다.

### 기본 사용법

```dart
void main() {
  List<int> a = [1, 2, 3];
  List<int> b = [4, 5, 6];

  // 전통 방식
  List<int> combined1 = []..addAll(a)..addAll(b);

  // Spread 연산자
  List<int> combined2 = [...a, ...b];
  print(combined2);  // [1, 2, 3, 4, 5, 6]

  // 중간에 요소 삽입
  List<int> inserted = [...a, 99, ...b, 100];
  print(inserted);   // [1, 2, 3, 99, 4, 5, 6, 100]

  // Set, Map에도 동일하게 적용
  Set<String> s1 = {'a', 'b'};
  Set<String> s2 = {'b', 'c', 'd'};
  Set<String> merged = {...s1, ...s2};
  print(merged);     // {a, b, c, d} — 중복 자동 제거

  Map<String, int> m1 = {'x': 1, 'y': 2};
  Map<String, int> m2 = {'y': 99, 'z': 3};
  Map<String, int> mergedMap = {...m1, ...m2};
  print(mergedMap);  // {x: 1, y: 99, z: 3} — 뒤쪽 값이 우선
}
```

### `...?` — Null 조건부 Spread

```dart
void main() {
  List<String>? extras = null;
  List<String> base = ['apple', 'banana'];

  // ...? — null이면 아무것도 펼치지 않음
  List<String> result = [...base, ...?extras];
  print(result);  // [apple, banana]

  extras = ['cherry', 'date'];
  result = [...base, ...?extras];
  print(result);  // [apple, banana, cherry, date]
}
```

### 실용 패턴 — 불변 컬렉션 복사와 확장

```dart
void main() {
  const defaultHeaders = {'Content-Type': 'application/json'};

  // Spread로 기본값 + 추가값 병합 (원본 불변 유지)
  Map<String, String> authHeaders = {
    ...defaultHeaders,
    'Authorization': 'Bearer token123',
  };
  print(authHeaders);
  // {Content-Type: application/json, Authorization: Bearer token123}
  print(defaultHeaders.length);  // 1 — 원본 유지

  // 리스트 불변 복사 후 정렬
  const original = [3, 1, 4, 1, 5, 9];
  final sorted = [...original]..sort();
  print(original);  // [3, 1, 4, 1, 5, 9] — 원본 불변
  print(sorted);    // [1, 1, 3, 4, 5, 9]
}
```

---

## 4. Collection if / Collection for

Dart는 컬렉션 리터럴 내부에서 `if`와 `for`를 직접 사용할 수 있습니다. Flutter 위젯 트리 구성에서 핵심적으로 사용되는 문법입니다.

### 4.1 Collection if

조건에 따라 요소를 포함하거나 제외합니다.

```dart
void main() {
  bool isLoggedIn = true;
  bool isPremium = false;
  String? promoCode = 'DART2024';

  List<String> menuItems = [
    '홈',
    '검색',
    if (isLoggedIn) '내 계정',              // 단일 요소 조건 포함
    if (isPremium) '프리미엄 콘텐츠',
    if (promoCode != null) '쿠폰: $promoCode',
    if (isLoggedIn) ...['알림', '메시지'],  // Spread와 조합
  ];

  print(menuItems);
  // [홈, 검색, 내 계정, 쿠폰: DART2024, 알림, 메시지]
}
```

**if-else 지원**

```dart
void main() {
  bool isDarkMode = true;

  List<String> theme = [
    'font-size: 16px',
    if (isDarkMode) 'background: #1a1a1a' else 'background: #ffffff',
    if (isDarkMode) 'color: #ffffff' else 'color: #000000',
  ];

  print(theme);
  // [font-size: 16px, background: #1a1a1a, color: #ffffff]
}
```

**Flutter 위젯 트리에서의 활용 (예고)**

```dart
// Flutter에서 Collection if — 실제 사용 패턴
// Column(
//   children: [
//     Text('항상 표시'),
//     if (user.isLoggedIn) LogoutButton(),
//     if (user.isAdmin) AdminPanel(),
//   ],
// )
```

---

### 4.2 Collection for

컬렉션 리터럴 안에서 반복적으로 요소를 생성합니다.

```dart
void main() {
  // 기본 사용 — 숫자 리스트 생성
  List<int> squares = [for (int i = 1; i <= 5; i++) i * i];
  print(squares);  // [1, 4, 9, 16, 25]

  // 다른 컬렉션 기반으로 변환
  List<String> fruits = ['apple', 'banana', 'cherry'];
  List<String> upper = [for (var f in fruits) f.toUpperCase()];
  print(upper);    // [APPLE, BANANA, CHERRY]

  // Map 생성에 활용
  Map<String, int> fruitLength = {
    for (var f in fruits) f: f.length
  };
  print(fruitLength);  // {apple: 5, banana: 6, cherry: 6}

  // Set 생성
  Set<int> evenSquares = {
    for (int i = 1; i <= 10; i++)
      if (i % 2 == 0) i * i
  };
  print(evenSquares);  // {4, 16, 36, 64, 100}
}
```

---

### 4.3 조합 활용

Collection if, for, Spread를 조합해 복잡한 컬렉션을 선언적으로 구성합니다.

```dart
void main() {
  List<Map<String, dynamic>> products = [
    {'name': '노트북', 'price': 1200000, 'inStock': true},
    {'name': '마우스', 'price': 35000, 'inStock': false},
    {'name': '키보드', 'price': 85000, 'inStock': true},
    {'name': '모니터', 'price': 450000, 'inStock': true},
  ];

  bool showOutOfStock = false;
  int maxPrice = 500000;

  // 조건 + 반복 + 필터를 리터럴 안에서 처리
  List<String> displayNames = [
    for (var p in products)
      if ((showOutOfStock || p['inStock'] as bool) &&
          (p['price'] as int) <= maxPrice)
        '${p['name']} (${p['price']}원)',
  ];

  print(displayNames);
  // [마우스 (35000원), 키보드 (85000원)] — 재고 없는 마우스는 제외됨
  // ※ showOutOfStock=false이므로 마우스 제외
  // 실제: [키보드 (85000원)]
}
```

---

## 5. Iterable — 지연 평가의 원리

`map()`, `where()` 등 함수형 메서드를 이해하려면 먼저 `Iterable`의 동작 원리를 알아야 합니다.

### Iterable이란?

`List`, `Set` 등 컬렉션의 상위 타입입니다. **요소를 순서대로 하나씩 꺼낼 수 있는** 모든 것을 나타냅니다.

![diagram](/developer-open-book/diagrams/step07-iterable-hierarchy.svg)

### 지연 평가 (Lazy Evaluation)

`map()`과 `where()`는 **즉시 새 컬렉션을 만들지 않습니다.** 대신 "이렇게 변환/필터하겠다"는 계획만 세우고, 실제 실행은 요소에 접근하는 순간으로 미룹니다.

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // map() — 즉시 실행되지 않음, Iterable 반환
  var doubled = numbers.map((n) {
    print('변환 중: $n');  // 언제 실행될까?
    return n * 2;
  });

  print('map() 호출 완료');  // ← 이 시점에는 위 print가 실행 안 됨!

  // 실제 접근 시 평가 시작
  print(doubled.first);     // "변환 중: 1" 이 이때 출력됨
}

// 출력:
// map() 호출 완료
// 변환 중: 1
// 2
```

**지연 평가의 장점**

```dart
void main() {
  // 100만 개 요소 중 첫 번째 짝수만 필요한 경우
  List<int> million = List.generate(1_000_000, (i) => i + 1);

  // ❌ 즉시 평가 — 100만 개 전체를 필터링 후 first 반환
  // int first = million.where((n) => n % 2 == 0).toList().first;

  // ✅ 지연 평가 — 첫 번째 짝수(2) 찾는 순간 즉시 중단
  int first = million.where((n) => n % 2 == 0).first;
  print(first);  // 2 — 100만 번이 아닌 2번만 검사
}
```

**구체화 (Materialization) — `toList()` / `toSet()`**

지연 평가 결과를 실제 컬렉션으로 만들어야 할 때 사용합니다.

```dart
void main() {
  var result = [1, 2, 3].map((n) => n * 2);

  print(result.runtimeType);           // MappedListIterable — Iterable
  print(result.toList().runtimeType);  // List<int> — List로 구체화

  // ⚠️ Iterable은 매번 재평가됨
  var iter = [1, 2, 3].map((n) => n * 2);
  print(iter.toList());  // [2, 4, 6]
  print(iter.toList());  // [2, 4, 6] — 다시 평가 (부수 효과 있으면 두 번 실행)

  // ✅ 한 번만 평가하려면 toList() 결과를 변수에 저장
  var cached = [1, 2, 3].map((n) => n * 2).toList();
}
```

---

## 6. 핵심 함수형 메서드

### 6.1 `map()` — 변환

각 요소를 **다른 값으로 변환**한 새 `Iterable`을 반환합니다. 원본을 수정하지 않습니다.

```dart
void main() {
  List<String> names = ['alice', 'bob', 'charlie'];

  // 타입 변환
  List<int> lengths = names.map((n) => n.length).toList();
  print(lengths);  // [5, 3, 7]

  // 타입을 바꾸는 변환
  List<Map<String, dynamic>> users = names.map((name) => {
    'name': name,
    'upper': name.toUpperCase(),
    'length': name.length,
  }).toList();
  print(users);
  // [{name: alice, upper: ALICE, length: 5}, ...]

  // 숫자 변환
  List<double> prices = [1000, 2500, 3700];
  List<String> formatted = prices
      .map((p) => '₩${p.toStringAsFixed(0)}')
      .toList();
  print(formatted);  // [₩1000, ₩2500, ₩3700]
}
```

---

### 6.2 `where()` / `whereType()` — 필터

**조건을 만족하는 요소만** 남긴 새 `Iterable`을 반환합니다.

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 짝수만 필터
  var evens = numbers.where((n) => n % 2 == 0).toList();
  print(evens);  // [2, 4, 6, 8, 10]

  // 복합 조건
  var filtered = numbers
      .where((n) => n > 3 && n < 8)
      .toList();
  print(filtered);  // [4, 5, 6, 7]

  // whereType<T>() — 타입으로 필터 + 자동 캐스팅
  List<Object> mixed = [1, 'hello', 2, 'world', 3, true];

  List<int> ints    = mixed.whereType<int>().toList();
  List<String> strs = mixed.whereType<String>().toList();

  print(ints);   // [1, 2, 3]
  print(strs);   // [hello, world]

  // null 제거 패턴
  List<String?> nullable = ['a', null, 'b', null, 'c'];
  List<String> nonNull = nullable.whereType<String>().toList();
  print(nonNull);  // [a, b, c]
}
```

---

### 6.3 `reduce()` — 단일값으로 축약

컬렉션의 **모든 요소를 하나의 값으로 합산**합니다. 첫 번째 요소가 초기 누산값이 됩니다.

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // 합계
  int sum = numbers.reduce((acc, n) => acc + n);
  print(sum);  // 15

  // 최대값
  int max = numbers.reduce((a, b) => a > b ? a : b);
  print(max);  // 5

  // 최소값
  int min = numbers.reduce((a, b) => a < b ? a : b);
  print(min);  // 1

  // 문자열 연결
  List<String> words = ['Dart', 'is', 'awesome'];
  String sentence = words.reduce((acc, w) => '$acc $w');
  print(sentence);  // Dart is awesome
}
```

**`reduce()` 동작 원리 시각화**

```
numbers = [1, 2, 3, 4, 5]
reduce((acc, n) => acc + n)

단계 1: acc=1, n=2  →  결과: 3
단계 2: acc=3, n=3  →  결과: 6
단계 3: acc=6, n=4  →  결과: 10
단계 4: acc=10, n=5 →  결과: 15
```

**⚠️ `reduce()`의 한계**

```dart
void main() {
  List<int> empty = [];

  // ❌ 빈 리스트에서 reduce() 호출 — 런타임 오류
  // empty.reduce((a, b) => a + b);
  // StateError: No element

  // ✅ fold()를 사용하면 빈 리스트도 안전하게 처리
}
```

---

### 6.4 `fold()` — 초기값 있는 축약

`reduce()`와 유사하지만 **초기값(initialValue)을 직접 지정**합니다. 빈 컬렉션에서도 안전하며, 반환 타입을 컬렉션 요소 타입과 다르게 설정할 수 있습니다.

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // 초기값 0에서 시작해 합계 계산
  int sum = numbers.fold(0, (acc, n) => acc + n);
  print(sum);  // 15

  // 빈 리스트에서도 안전
  List<int> empty = [];
  int safeSum = empty.fold(0, (acc, n) => acc + n);
  print(safeSum);  // 0 — 오류 없음

  // 반환 타입이 다른 fold — int 리스트를 String으로 축약
  List<int> codes = [72, 101, 108, 108, 111];  // ASCII
  String text = codes.fold(
    '',
    (String acc, int code) => acc + String.fromCharCode(code),
  );
  print(text);  // Hello

  // 복잡한 집계 — 합계와 카운트를 동시에
  var stats = numbers.fold(
    {'sum': 0, 'count': 0},
    (Map<String, int> acc, n) => {
      'sum': acc['sum']! + n,
      'count': acc['count']! + 1,
    },
  );
  double average = stats['sum']! / stats['count']!;
  print('합계: ${stats['sum']}, 평균: $average');  // 합계: 15, 평균: 3.0
}
```

**`reduce()` vs `fold()` 비교**

| 특성      | `reduce()`                | `fold()`                 |
| --------- | ------------------------- | ------------------------ |
| 초기값    | 첫 번째 요소              | 직접 지정                |
| 빈 컬렉션 | 💥 런타임 오류            | ✅ 초기값 반환           |
| 반환 타입 | 요소 타입과 동일          | 자유롭게 지정 가능       |
| 사용 권장 | 항상 1개 이상 보장된 경우 | 일반적으로 `fold()` 권장 |

---

### 6.5 `expand()` — 평탄화

각 요소를 **여러 요소로 확장**하거나, 중첩 컬렉션을 **1단계 평탄화**합니다.

```dart
void main() {
  // 중첩 리스트 평탄화
  List<List<int>> nested = [[1, 2], [3, 4], [5, 6]];
  List<int> flat = nested.expand((list) => list).toList();
  print(flat);  // [1, 2, 3, 4, 5, 6]

  // 각 요소를 여러 요소로 확장
  List<String> words = ['hello', 'dart'];
  List<String> chars = words.expand((w) => w.split('')).toList();
  print(chars);  // [h, e, l, l, o, d, a, r, t]

  // 조건부 확장 — 짝수면 [n, n*2], 홀수면 [n]
  List<int> numbers = [1, 2, 3, 4];
  List<int> expanded = numbers.expand((n) {
    return n % 2 == 0 ? [n, n * 2] : [n];
  }).toList();
  print(expanded);  // [1, 2, 4, 3, 4, 8]
}
```

---

### 6.6 `any()` / `every()` — 조건 검사

```dart
void main() {
  List<int> scores = [85, 72, 91, 60, 78];

  // any — 하나라도 조건 충족이면 true (단락 평가)
  print(scores.any((s) => s >= 90));   // true  (91이 있음)
  print(scores.any((s) => s >= 100));  // false

  // every — 모두 조건 충족이면 true (단락 평가)
  print(scores.every((s) => s >= 60)); // true  (모두 60 이상)
  print(scores.every((s) => s >= 70)); // false (60이 있음)

  // 빈 컬렉션
  List<int> empty = [];
  print(empty.any((n) => n > 0));    // false
  print(empty.every((n) => n > 0));  // true  — 공허한 참(Vacuous truth)
}
```

---

### 6.7 `firstWhere()` / `lastWhere()` — 조건 검색

```dart
void main() {
  List<Map<String, dynamic>> users = [
    {'id': 1, 'name': 'Alice', 'age': 30},
    {'id': 2, 'name': 'Bob', 'age': 25},
    {'id': 3, 'name': 'Charlie', 'age': 35},
  ];

  // 첫 번째 매칭 요소 반환
  var adult = users.firstWhere((u) => (u['age'] as int) >= 30);
  print(adult['name']);  // Alice

  // ⚠️ 찾지 못하면 StateError — orElse로 기본값 지정
  var found = users.firstWhere(
    (u) => u['name'] == 'David',
    orElse: () => {'id': -1, 'name': '미발견', 'age': 0},
  );
  print(found['name']);  // 미발견

  // lastWhere — 마지막 매칭 요소
  var oldest = users.lastWhere((u) => (u['age'] as int) <= 35);
  print(oldest['name']);  // Charlie

  // singleWhere — 정확히 1개만 있어야 하는 경우
  var charlie = users.singleWhere((u) => u['id'] == 3);
  print(charlie['name']);  // Charlie
}
```

---

### 6.8 `take()` / `skip()` — 범위 선택

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // take(n) — 앞에서 n개
  print(numbers.take(3).toList());    // [1, 2, 3]

  // skip(n) — 앞에서 n개 건너뜀
  print(numbers.skip(7).toList());    // [8, 9, 10]

  // 조합 — 페이지네이션 패턴
  int page = 2;
  int pageSize = 3;
  var pageData = numbers
      .skip((page - 1) * pageSize)  // 앞 3개 건너뜀
      .take(pageSize)                // 3개 가져옴
      .toList();
  print(pageData);  // [4, 5, 6]

  // takeWhile / skipWhile — 조건 기반
  print(numbers.takeWhile((n) => n < 5).toList());  // [1, 2, 3, 4]
  print(numbers.skipWhile((n) => n < 5).toList());  // [5, 6, 7, 8, 9, 10]
}
```

---

### 6.9 `toList()` / `toSet()` — 구체화

```dart
void main() {
  Iterable<int> iter = [1, 2, 2, 3, 3, 3].map((n) => n * 2);

  // toList() — 순서 유지, 중복 허용
  List<int> list = iter.toList();
  print(list);  // [2, 4, 4, 6, 6, 6]

  // toSet() — 중복 제거
  Set<int> set = iter.toSet();
  print(set);   // {2, 4, 6}

  // growable 매개변수 — false면 고정 길이 리스트
  List<int> fixed = iter.toList(growable: false);
  // fixed.add(8);  // 💥 UnsupportedError — 고정 길이
}
```

---

## 7. 메서드 체이닝 — 파이프라인 설계

함수형 메서드의 진가는 **체이닝**에서 나옵니다. 각 단계가 명확한 역할을 가지고, 데이터가 파이프라인처럼 흐릅니다.

```dart
void main() {
  List<Map<String, dynamic>> employees = [
    {'name': '김철수', 'dept': '개발', 'salary': 4500000, 'years': 3},
    {'name': '이영희', 'dept': '마케팅', 'salary': 3800000, 'years': 5},
    {'name': '박민준', 'dept': '개발', 'salary': 5200000, 'years': 7},
    {'name': '최수진', 'dept': '개발', 'salary': 4100000, 'years': 2},
    {'name': '정다은', 'dept': '마케팅', 'salary': 4300000, 'years': 4},
  ];

  // 요구사항:
  // 1. 개발팀 직원만
  // 2. 연차 3년 이상
  // 3. 연봉 높은 순 정렬
  // 4. 이름과 연봉만 추출
  // 5. 상위 2명

  var result = employees
      .where((e) => e['dept'] == '개발')              // 1. 개발팀 필터
      .where((e) => (e['years'] as int) >= 3)         // 2. 연차 3년 이상
      .toList()
      ..sort((a, b) =>                                  // 3. 연봉 내림차순
          (b['salary'] as int).compareTo(a['salary'] as int))
      ;

  var top2 = result
      .take(2)                                          // 5. 상위 2명
      .map((e) => '${e['name']}: ${e['salary']}원')    // 4. 이름+연봉
      .toList();

  print(top2);
  // [박민준: 5200000원, 김철수: 4500000원]
}
```

**체이닝 파이프라인 시각화**

![diagram](/developer-open-book/diagrams/step07-data-pipeline.svg)

---

## 8. 함수형 vs 명령형 비교

같은 로직을 두 방식으로 작성해 가독성과 의도 표현을 비교합니다.

**문제**: 점수 리스트에서 70점 이상만 골라 내림차순으로 정렬한 평균 계산

```dart
void main() {
  List<int> scores = [85, 45, 92, 67, 78, 55, 88, 71];

  // ── 명령형 방식 ──
  List<int> passing = [];
  for (var s in scores) {
    if (s >= 70) passing.add(s);
  }
  passing.sort((a, b) => b.compareTo(a));
  int total = 0;
  for (var s in passing) {
    total += s;
  }
  double avg1 = passing.isEmpty ? 0 : total / passing.length;
  print('명령형 평균: $avg1');  // 82.8

  // ── 함수형 방식 ──
  var passingScores = scores.where((s) => s >= 70).toList()
    ..sort((a, b) => b.compareTo(a));

  double avg2 = passingScores.isEmpty
      ? 0
      : passingScores.fold(0, (sum, s) => sum + s) / passingScores.length;
  print('함수형 평균: $avg2');  // 82.8
}
```

**두 방식의 트레이드오프**

| 관점             | 명령형           | 함수형                  |
| ---------------- | ---------------- | ----------------------- |
| 코드 길이        | 길다             | 짧다                    |
| 의도 표현        | "어떻게"         | "무엇을"                |
| 중간 변수        | 많음             | 적음                    |
| 디버깅           | 단계별 추적 용이 | 체이닝 중간 확인 필요   |
| 성능             | 직접적           | 지연 평가로 최적화 가능 |
| 부수 효과 제어   | 명시적           | 원본 불변 보장          |
| 가독성 (익숙 후) | 중간             | 높음                    |

> 📌 **권장**: 팀 컨벤션에 따르되, 단순 변환·필터·집계는 함수형, 복잡한 상태 변이나 조기 탈출이 필요한 경우는 명령형이 더 명확할 수 있습니다.

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: Collection if / for 활용

아래 조건을 Collection if/for를 사용해 단일 리스트 리터럴로 작성하세요.

**요구사항**: `List<int> base = [1, 2, 3]`이 있을 때, 아래를 한 리터럴로 표현

- `base`의 모든 요소
- `showExtras`가 `true`이면 `[4, 5, 6]`도 포함
- `prefix`가 null이 아니면 맨 앞에 `0` 추가

```dart
void main() {
  List<int> base = [1, 2, 3];
  bool showExtras = true;
  int? prefix = 0;

  List<int> result = [
    // TODO: 구현
  ];

  print(result);  // [0, 1, 2, 3, 4, 5, 6]
}
```

> **정답 힌트**
>
> ```dart
> List<int> result = [
>   if (prefix != null) prefix,
>   ...base,
>   if (showExtras) ...[4, 5, 6],
> ];
> ```

### 실습 9-2: 함수형 메서드 체이닝

아래 학생 데이터를 함수형 메서드만 사용해 요구사항대로 처리하세요. (`for`문, `if`문 사용 금지)

```dart
void main() {
  List<Map<String, dynamic>> students = [
    {'name': '김민수', 'score': 88, 'grade': 'A'},
    {'name': '이서연', 'score': 72, 'grade': 'B'},
    {'name': '박준혁', 'score': 95, 'grade': 'A'},
    {'name': '최유진', 'score': 61, 'grade': 'C'},
    {'name': '정하은', 'score': 83, 'grade': 'B'},
  ];

  // (1) A학점 학생들의 이름 목록 (점수 내림차순)
  // (2) 전체 학생 평균 점수
  // (3) B학점 이상(A, B) 학생 수
}
```

> **정답 힌트**
>
> ```dart
> // (1) A학점 이름 목록
> var aStudents = students
>     .where((s) => s['grade'] == 'A')
>     .toList()
>     ..sort((a, b) => (b['score'] as int).compareTo(a['score'] as int));
> var names = aStudents.map((s) => s['name']).toList();
> print(names);  // [박준혁, 김민수]
>
> // (2) 평균 점수
> double avg = students
>     .fold(0, (sum, s) => sum + (s['score'] as int))
>     / students.length;
> print(avg.toStringAsFixed(1));  // 79.8
>
> // (3) B학점 이상 수
> int count = students
>     .where((s) => s['grade'] == 'A' || s['grade'] == 'B')
>     .length;
> print(count);  // 4
> ```

### 실습 9-3: `reduce()` vs `fold()` 안전성 비교

아래 코드에서 런타임 오류가 발생하는 경우를 찾고, `fold()`로 안전하게 수정하세요.

```dart
void main() {
  List<List<int>> groups = [
    [3, 1, 4],
    [],           // 빈 그룹
    [1, 5, 9],
  ];

  // 각 그룹의 합계를 reduce로 계산 (문제 있음)
  for (var group in groups) {
    int sum = group.reduce((a, b) => a + b);  // ⚠️ 어디서 오류?
    print('합계: $sum');
  }
}
```

> **정답 힌트**
>
> 빈 리스트 `[]`에서 `reduce()` 호출 시 `StateError` 발생.
>
> ```dart
> for (var group in groups) {
>   int sum = group.fold(0, (a, b) => a + b);  // 빈 리스트 → 0 반환
>   print('합계: $sum');
> }
> // 합계: 8
> // 합계: 0
> // 합계: 15
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 문법 / 메서드      | 역할                        | 반환 타입     |
| ------------------ | --------------------------- | ------------- |
| `...`              | 컬렉션 요소를 리터럴에 펼침 | —             |
| `...?`             | null이면 무시하는 Spread    | —             |
| Collection if      | 조건부 요소 포함            | —             |
| Collection for     | 반복 기반 요소 생성         | —             |
| `map(f)`           | 각 요소 변환                | `Iterable<R>` |
| `where(test)`      | 조건 필터                   | `Iterable<T>` |
| `whereType<T>()`   | 타입 필터 + 캐스팅          | `Iterable<T>` |
| `reduce(f)`        | 요소 → 단일값 (초기값 없음) | `T`           |
| `fold(init, f)`    | 요소 → 단일값 (초기값 있음) | `R`           |
| `expand(f)`        | 요소를 복수 요소로 확장     | `Iterable<R>` |
| `any(test)`        | 하나라도 조건 충족?         | `bool`        |
| `every(test)`      | 모두 조건 충족?             | `bool`        |
| `firstWhere(test)` | 첫 번째 조건 요소           | `T`           |
| `take(n)`          | 앞에서 n개                  | `Iterable<T>` |
| `skip(n)`          | 앞에서 n개 건너뜀           | `Iterable<T>` |
| `toList()`         | Iterable → List 구체화      | `List<T>`     |
| `toSet()`          | Iterable → Set 구체화       | `Set<T>`      |

### 🔗 다음 단계

> **Step 8 — 클래스와 객체 기본**으로 이동하세요.

Step 8에서는 Dart OOP의 핵심인 `class` 정의, 인스턴스화, 필드와 메서드 구성을 학습합니다. 이번 Step에서 익힌 컬렉션 + 함수형 메서드는 Step 8의 클래스 내부 데이터 관리와 Step 10의 실전 과제 2(도서 관리 시스템)에서 직접 활용됩니다.

### 📚 참고 자료

| 자료                       | 링크                                                        |
| -------------------------- | ----------------------------------------------------------- |
| Dart 컬렉션 공식 문서      | <https://dart.dev/language/collections>                     |
| Iterable API 레퍼런스      | <https://api.dart.dev/stable/dart-core/Iterable-class.html> |
| Spread & Collection if/for | <https://dart.dev/language/collections#spread-operators>    |
| DartPad 온라인 실습        | <https://dartpad.dev>                                       |

### ❓ 자가진단 퀴즈

1. **[Remember]** `map()`과 `where()`가 반환하는 타입은 `List`인가 `Iterable`인가? 이 차이가 왜 중요한가?
2. **[Understand]** 지연 평가(Lazy Evaluation)가 성능에 유리한 상황을 구체적인 예시로 설명하라.
3. **[Understand]** `reduce()`와 `fold()`를 모두 사용할 수 있는 상황에서 `fold()`를 선택해야 하는 이유 두 가지를 설명하라.
4. **[Apply]** `List<String> sentences = ['Hello World', 'Dart is fun', 'I love coding']`에서 모든 단어를 소문자로 변환하고 중복을 제거한 단어 집합(`Set`)을 `expand()`를 활용해 만들어라.
5. **[Analyze]** `numbers.where((n) => n > 5).map((n) => n * 2).toList()`에서 `toList()`를 호출하기 전까지 실제 연산이 수행되지 않는 이유를 Iterable의 지연 평가 원리로 설명하라.

> **4번 정답 힌트**
>
> ```dart
> List<String> sentences = ['Hello World', 'Dart is fun', 'I love coding'];
>
> Set<String> words = sentences
>     .expand((s) => s.split(' '))
>     .map((w) => w.toLowerCase())
>     .toSet();
>
> print(words);
> // {hello, world, dart, is, fun, i, love, coding}
> ```

---

_참고: 이 문서는 dart.dev 공식 문서(Collections, Iterable) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
