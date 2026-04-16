# Step 6 — Collection 타입

> **Phase 2 | 컬렉션과 객체지향** | 예상 소요: 2일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 6 — Collection 타입](#step-6--collection-타입)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [데이터를 조직화한다는 것](#데이터를-조직화한다는-것)
  - [3. List — 순서 있는 데이터 목록](#3-list--순서-있는-데이터-목록)
    - [3.1 List 생성과 기본 조작](#31-list-생성과-기본-조작)
    - [3.2 Mutable vs Immutable List](#32-mutable-vs-immutable-list)
    - [3.3 List 주요 메서드](#33-list-주요-메서드)
    - [3.4 2차원 List](#34-2차원-list)
  - [4. Set — 중복 없는 집합](#4-set--중복-없는-집합)
    - [4.1 Set 생성과 기본 조작](#41-set-생성과-기본-조작)
    - [4.2 집합 연산](#42-집합-연산)
    - [4.3 Mutable vs Immutable Set](#43-mutable-vs-immutable-set)
  - [5. Map — 키-값 쌍의 사전](#5-map--키-값-쌍의-사전)
    - [5.1 Map 생성과 기본 조작](#51-map-생성과-기본-조작)
    - [5.2 Map 순회와 변환](#52-map-순회와-변환)
    - [5.3 Mutable vs Immutable Map](#53-mutable-vs-immutable-map)
    - [5.4 중첩 Map](#54-중첩-map)
  - [6. List vs Set vs Map 비교](#6-list-vs-set-vs-map-비교)
  - [7. 컬렉션과 Null Safety](#7-컬렉션과-null-safety)
  - [8. 타입 매개변수와 제네릭 맛보기](#8-타입-매개변수와-제네릭-맛보기)
  - [9. 실습](#9-실습)
    - [실습 9-1: 컬렉션 선택 판단](#실습-9-1-컬렉션-선택-판단)
    - [실습 9-2: 단어 빈도 카운터](#실습-9-2-단어-빈도-카운터)
    - [실습 9-3: Mutable / Immutable 오류 수정](#실습-9-3-mutable--immutable-오류-수정)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                      |
| --- | ------------- | ------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `List`, `Set`, `Map`의 특성과 리터럴 문법을 나열할 수 있다                |
| 2   | 🟢 Understand | 세 컬렉션의 차이점(순서, 중복, 키-값)을 설명할 수 있다                    |
| 3   | 🟢 Understand | Mutable과 Immutable 컬렉션의 차이와 생성 방법을 설명할 수 있다            |
| 4   | 🟡 Apply      | 주어진 요구사항에 적합한 컬렉션을 선택하고 CRUD 조작을 작성할 수 있다     |
| 5   | 🟠 Analyze    | `List`와 `Set`의 중복 제거 방식 차이와 성능 트레이드오프를 분석할 수 있다 |

---

## 2. 서론

### 데이터를 조직화한다는 것

실제 애플리케이션은 단일 변수가 아닌 **여러 데이터의 묶음**을 다룹니다. 상품 목록, 사용자 태그, 설정값 사전처럼 데이터의 성격에 따라 가장 적합한 자료구조가 달라집니다.

Dart는 세 가지 핵심 컬렉션 타입을 제공합니다.

```
┌──────────────────────────────────────────────────────────┐
│  List  │ 순서 O │ 중복 O │ 인덱스 접근 │ 일반 목록       │
│  Set   │ 순서 X │ 중복 X │ 포함 여부   │ 고유값 집합     │
│  Map   │ 순서 X │ 키 중복X│ 키로 접근  │ 키-값 사전      │
└──────────────────────────────────────────────────────────┘
```

세 타입 모두 **제네릭(Generic)** 을 지원합니다. `List<String>`, `Set<int>`, `Map<String, int>`처럼 타입을 명시해 컴파일 타임 타입 안전성을 보장합니다.

> **전제 지식**: Step 5 완료 (함수, Arrow function, Named 매개변수)

---

## 3. List — 순서 있는 데이터 목록

`List`는 **순서가 있고 중복을 허용**하는 컬렉션입니다. 다른 언어의 배열(Array)과 유사하지만 크기가 동적으로 변합니다.

### 3.1 List 생성과 기본 조작

**생성 방법**

```dart
void main() {
  // 리터럴 방식 (권장)
  List<String> fruits = ['사과', '바나나', '체리'];
  var numbers = [1, 2, 3, 4, 5];  // List<int>로 추론

  // 생성자 방식
  List<int> empty = [];                         // 빈 리스트
  List<int> filled = List.filled(3, 0);         // [0, 0, 0] — 고정 길이
  List<int> generated = List.generate(5, (i) => i * 2); // [0, 2, 4, 6, 8]

  print(generated);  // [0, 2, 4, 6, 8]
}
```

**인덱스 접근과 기본 프로퍼티**

```dart
void main() {
  List<String> colors = ['빨강', '초록', '파랑'];

  // 인덱스 접근 — 0부터 시작
  print(colors[0]);         // 빨강
  print(colors[2]);         // 파랑
  print(colors.last);       // 파랑
  print(colors.first);      // 빨강

  // 기본 프로퍼티
  print(colors.length);     // 3
  print(colors.isEmpty);    // false
  print(colors.isNotEmpty); // true

  // 인덱스 수정
  colors[1] = '노랑';
  print(colors);  // [빨강, 노랑, 파랑]

  // 범위 초과 접근 — 런타임 오류
  // print(colors[5]);  // 💥 RangeError: index out of range
}
```

---

### 3.2 Mutable vs Immutable List

Dart에서 List의 불변성은 두 가지 수준이 있습니다.

**수준 1: 참조 불변 (`final`) — 내부 수정은 가능**

```dart
void main() {
  final fruits = ['사과', '바나나'];

  fruits.add('체리');       // ✅ 내부 요소 추가 가능
  fruits[0] = '딸기';       // ✅ 요소 변경 가능
  print(fruits);            // [딸기, 바나나, 체리]

  // fruits = ['포도'];     // ❌ 참조 변경 불가
}
```

**수준 2: 완전 불변 (`const` 또는 `List.unmodifiable`) — 내부 수정 불가**

```dart
void main() {
  // const 리터럴 — 컴파일 타임 상수, 완전 불변
  const seasons = ['봄', '여름', '가을', '겨울'];
  // seasons.add('기타');   // 💥 UnsupportedError: Cannot add to an unmodifiable list

  // List.unmodifiable — 런타임에 불변 리스트 생성
  final source = ['A', 'B', 'C'];
  final locked = List.unmodifiable(source);
  // locked.add('D');       // 💥 UnsupportedError

  // source는 여전히 mutable
  source.add('D');
  print(source);  // [A, B, C, D]
  print(locked);  // [A, B, C] — 독립적 스냅샷
}
```

**불변성 수준 요약**

```
변수 선언                  내부 변경   참조 변경
─────────────────────────────────────────────────
var   list = [...]         ✅ 가능     ✅ 가능
final list = [...]         ✅ 가능     ❌ 불가
const list = [...]         ❌ 불가     ❌ 불가
List.unmodifiable(list)    ❌ 불가     변수 선언 방식에 따름
```

---

### 3.3 List 주요 메서드

**추가 / 삭제**

```dart
void main() {
  List<int> nums = [3, 1, 4, 1, 5];

  // 추가
  nums.add(9);              // 끝에 추가 → [3, 1, 4, 1, 5, 9]
  nums.addAll([2, 6]);      // 여러 요소 추가 → [..., 2, 6]
  nums.insert(0, 100);      // 인덱스에 삽입 → [100, 3, 1, ...]
  nums.insertAll(1, [7, 8]);// 인덱스에 여러 요소 삽입

  // 삭제
  nums.remove(1);           // 값으로 첫 번째 1 삭제
  nums.removeAt(0);         // 인덱스로 삭제
  nums.removeLast();        // 마지막 요소 삭제
  nums.removeWhere((n) => n % 2 == 0);  // 조건에 맞는 모든 요소 삭제
  nums.clear();             // 전체 삭제
}
```

**검색 / 확인**

```dart
void main() {
  List<String> tags = ['dart', 'flutter', 'mobile', 'dart'];

  print(tags.contains('flutter'));    // true
  print(tags.indexOf('dart'));        // 0 (첫 번째 위치)
  print(tags.lastIndexOf('dart'));    // 3 (마지막 위치)
  print(tags.indexWhere((t) => t.startsWith('m'))); // 2

  // any — 하나라도 조건 충족 시 true
  print(tags.any((t) => t.length > 6));    // true ('flutter', 'mobile')

  // every — 모두 조건 충족 시 true
  print(tags.every((t) => t.length > 2));  // true
}
```

**정렬 / 변환**

```dart
void main() {
  List<int> scores = [85, 42, 96, 17, 73];

  // 정렬 — 원본 수정 (in-place)
  scores.sort();
  print(scores);  // [17, 42, 73, 85, 96]

  // 역순 정렬
  scores.sort((a, b) => b.compareTo(a));
  print(scores);  // [96, 85, 73, 42, 17]

  // 커스텀 정렬 — 문자열 길이 기준
  List<String> words = ['banana', 'kiwi', 'apple', 'fig'];
  words.sort((a, b) => a.length.compareTo(b.length));
  print(words);  // [fig, kiwi, apple, banana]

  // 슬라이싱
  List<int> nums = [0, 1, 2, 3, 4, 5];
  print(nums.sublist(2, 4));   // [2, 3] — 인덱스 2 이상 4 미만
  print(nums.sublist(3));      // [3, 4, 5] — 인덱스 3부터 끝까지

  // 뒤집기
  print(nums.reversed.toList());  // [5, 4, 3, 2, 1, 0]

  // 리스트를 문자열로
  print(['a', 'b', 'c'].join(', '));  // a, b, c
}
```

---

### 3.4 2차원 List

```dart
void main() {
  // 3×3 행렬 생성
  List<List<int>> matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  // 접근
  print(matrix[1][2]);  // 6 (2행 3열)

  // 순회
  for (var row in matrix) {
    print(row.join(' | '));
  }
  // 1 | 2 | 3
  // 4 | 5 | 6
  // 7 | 8 | 9

  // List.generate로 동적 생성 — 3×3 영행렬
  var zeroMatrix = List.generate(3, (_) => List.filled(3, 0));
  print(zeroMatrix);  // [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
}
```

---

## 4. Set — 중복 없는 집합

`Set`은 **순서가 없고 중복을 허용하지 않는** 컬렉션입니다. 요소의 고유성 보장이 핵심입니다.

### 4.1 Set 생성과 기본 조작

```dart
void main() {
  // 리터럴 방식
  Set<String> languages = {'Dart', 'Kotlin', 'Swift'};
  var primes = {2, 3, 5, 7, 11};  // Set<int>로 추론

  // ⚠️ 빈 Set 리터럴 — {} 는 Map으로 추론됨
  var emptyMap = {};          // Map<dynamic, dynamic>
  var emptySet = <String>{};  // ✅ 올바른 빈 Set 선언
  Set<int> emptySet2 = {};   // ✅ 타입 명시로 Set 확정

  // 생성자 방식
  var fromList = Set.from([1, 2, 2, 3, 3, 3]);  // {1, 2, 3} 중복 제거
  print(fromList);  // {1, 2, 3}

  // 중복 자동 제거
  Set<int> nums = {1, 2, 2, 3, 3, 3, 4};
  print(nums);  // {1, 2, 3, 4}

  // 기본 조작
  nums.add(5);          // 추가
  nums.add(3);          // 이미 존재 — 무시
  nums.remove(1);       // 삭제
  print(nums.contains(2));  // true
  print(nums.length);       // 4
}
```

**List에서 중복 제거 패턴**

```dart
void main() {
  List<String> tags = ['dart', 'flutter', 'dart', 'mobile', 'flutter'];

  // List → Set → List 변환으로 중복 제거
  List<String> unique = tags.toSet().toList();
  print(unique);  // [dart, flutter, mobile]

  // 순서 보존이 필요하면 LinkedHashSet 사용
  // import 'dart:collection';
  // var ordered = LinkedHashSet<String>.from(tags);
}
```

---

### 4.2 집합 연산

Set은 수학의 집합 연산을 직접 지원합니다.

```dart
void main() {
  Set<int> a = {1, 2, 3, 4, 5};
  Set<int> b = {4, 5, 6, 7, 8};

  // 합집합 (Union) — a 또는 b에 있는 모든 요소
  print(a.union(b));         // {1, 2, 3, 4, 5, 6, 7, 8}

  // 교집합 (Intersection) — a와 b 모두에 있는 요소
  print(a.intersection(b)); // {4, 5}

  // 차집합 (Difference) — a에 있지만 b에 없는 요소
  print(a.difference(b));   // {1, 2, 3}
  print(b.difference(a));   // {6, 7, 8}

  // 부분집합 여부
  Set<int> sub = {1, 2};
  print(sub.every((e) => a.contains(e)));  // true — sub ⊆ a
}
```

**집합 연산 시각화**

```
  a = {1, 2, 3, 4, 5}
  b =          {4, 5, 6, 7, 8}

  합집합:   {1, 2, 3, 4, 5, 6, 7, 8}
  교집합:             {4, 5}
  차집합 a-b: {1, 2, 3}
  차집합 b-a:             {6, 7, 8}
```

---

### 4.3 Mutable vs Immutable Set

```dart
void main() {
  // const — 완전 불변
  const vowels = {'a', 'e', 'i', 'o', 'u'};
  // vowels.add('y');  // 💥 UnsupportedError

  // Set.unmodifiable — 런타임 불변
  final mutable = {'red', 'green', 'blue'};
  final locked = Set.unmodifiable(mutable);
  // locked.add('yellow');  // 💥 UnsupportedError
}
```

---

## 5. Map — 키-값 쌍의 사전

`Map`은 **고유한 키(Key)와 값(Value)의 쌍**으로 데이터를 저장합니다. 키로 값을 빠르게 조회하는 사전(Dictionary) 구조입니다.

### 5.1 Map 생성과 기본 조작

```dart
void main() {
  // 리터럴 방식
  Map<String, int> scores = {
    'Alice': 95,
    'Bob': 87,
    'Charlie': 92,
  };

  // 타입 추론
  var config = {
    'host': 'localhost',
    'port': '3000',      // Map<String, String>으로 추론
  };

  // 생성자 방식
  var empty = <String, int>{};       // 빈 Map
  var fromKeys = Map.fromKeys(       // 키 리스트로 생성
    ['a', 'b', 'c'],
    (key) => key.codeUnitAt(0),     // {'a': 97, 'b': 98, 'c': 99}
  );

  // 접근
  print(scores['Alice']);    // 95
  print(scores['Unknown']); // null — 존재하지 않는 키

  // null 병합으로 기본값 제공
  int aliceScore = scores['Alice'] ?? 0;    // 95
  int unknownScore = scores['Unknown'] ?? 0; // 0

  // 추가 / 수정
  scores['David'] = 78;      // 새 키-값 추가
  scores['Alice'] = 100;     // 기존 키 값 수정
  print(scores);

  // 삭제
  scores.remove('Bob');
  print(scores.containsKey('Bob'));    // false
  print(scores.containsValue(92));    // true

  // 기본 프로퍼티
  print(scores.length);   // 3
  print(scores.keys);     // (Alice, Charlie, David)
  print(scores.values);   // (100, 92, 78)
  print(scores.entries);  // 키-값 쌍의 Iterable
}
```

**안전한 값 접근 — `putIfAbsent`**

```dart
void main() {
  Map<String, int> wordCount = {};
  List<String> words = ['dart', 'flutter', 'dart', 'dart', 'flutter'];

  for (var word in words) {
    // 키가 없으면 0으로 초기화 후 반환, 있으면 기존 값 반환
    wordCount.putIfAbsent(word, () => 0);
    wordCount[word] = wordCount[word]! + 1;
  }

  print(wordCount);  // {dart: 3, flutter: 2}

  // update — 키가 있을 때만 값 변경
  wordCount.update('dart', (v) => v + 10, ifAbsent: () => 1);
  print(wordCount['dart']);  // 13
}
```

---

### 5.2 Map 순회와 변환

```dart
void main() {
  Map<String, int> prices = {'사과': 1500, '바나나': 800, '체리': 3000};

  // entries로 키-값 동시 순회
  for (var entry in prices.entries) {
    print('${entry.key}: ${entry.value}원');
  }

  // forEach — 콜백 방식
  prices.forEach((key, value) {
    print('$key → $value');
  });

  // map — 새 Map으로 변환
  var discounted = prices.map(
    (key, value) => MapEntry(key, (value * 0.9).round()),
  );
  print(discounted);  // {사과: 1350, 바나나: 720, 체리: 2700}

  // 조건 필터링
  var expensive = Map.fromEntries(
    prices.entries.where((e) => e.value >= 1500),
  );
  print(expensive);  // {사과: 1500, 체리: 3000}
}
```

---

### 5.3 Mutable vs Immutable Map

```dart
void main() {
  // const — 완전 불변
  const httpCodes = {200: 'OK', 404: 'Not Found', 500: 'Server Error'};
  // httpCodes[201] = 'Created';  // 💥 UnsupportedError

  // Map.unmodifiable — 런타임 불변
  final source = {'a': 1, 'b': 2};
  final locked = Map.unmodifiable(source);
  // locked['c'] = 3;  // 💥 UnsupportedError
}
```

---

### 5.4 중첩 Map

실제 앱에서 JSON 데이터나 복잡한 설정을 표현할 때 자주 사용합니다.

```dart
void main() {
  Map<String, dynamic> user = {
    'id': 1001,
    'name': '홍길동',
    'address': {
      'city': '서울',
      'district': '강남구',
    },
    'tags': ['dart', 'flutter'],
  };

  // 중첩 접근
  print(user['name']);                         // 홍길동
  print((user['address'] as Map)['city']);     // 서울
  print((user['tags'] as List)[0]);            // dart

  // 안전한 중첩 접근 — ?. 활용
  var address = user['address'] as Map<String, dynamic>?;
  print(address?['city'] ?? '주소 없음');      // 서울
}
```

---

## 6. List vs Set vs Map 비교

요구사항에 따른 컬렉션 선택 기준을 정리합니다.

| 특성      | List           | Set         | Map             |
| --------- | -------------- | ----------- | --------------- |
| 순서 보장 | ✅             | ❌ (기본)   | ❌ (기본)       |
| 중복 허용 | ✅             | ❌          | 키: ❌ / 값: ✅ |
| 접근 방식 | 인덱스 `[i]`   | 포함 여부   | 키 `[key]`      |
| 검색 성능 | O(n)           | O(1)        | O(1)            |
| 추가 성능 | O(1) 끝에      | O(1)        | O(1)            |
| 주요 용도 | 순서 있는 목록 | 고유값 집합 | 키-값 매핑      |

**실사용 선택 예시**

```
쇼핑몰 장바구니 목록            → List (순서, 중복 상품 허용)
사용자 권한 태그 집합           → Set (중복 없는 고유 권한)
국가 코드 - 국가명 매핑         → Map (코드로 이름 빠른 조회)
최근 방문 페이지 (순서 + 중복X) → LinkedHashSet (순서 보존 Set)
단어 등장 횟수 카운팅           → Map<String, int>
```

---

## 7. 컬렉션과 Null Safety

컬렉션 자체와 요소 각각에 Null Safety를 적용하는 방식을 구분해야 합니다.

```dart
void main() {
  // 1. 컬렉션 자체가 nullable
  List<String>? maybeList = null;
  maybeList?.add('hello');          // null이면 무시
  print(maybeList?.length ?? 0);   // 0

  // 2. 요소가 nullable
  List<String?> listWithNulls = ['a', null, 'b', null, 'c'];

  // null 요소 필터링
  List<String> nonNulls = listWithNulls
      .whereType<String>()  // null 제거 + 타입 캐스팅
      .toList();
  print(nonNulls);  // [a, b, c]

  // 3. Map의 nullable 값 접근
  Map<String, int> data = {'a': 1, 'b': 2};
  int? value = data['c'];     // 존재하지 않는 키 → null
  print(value ?? -1);         // -1

  // 4. Map 값 자체가 nullable
  Map<String, int?> nullable = {'a': 1, 'b': null};
  print(nullable['b']);       // null (값이 null)
  print(nullable['c']);       // null (키가 없음)
  // 두 경우를 구분하려면 containsKey 사용
  print(nullable.containsKey('b'));  // true
  print(nullable.containsKey('c'));  // false
}
```

---

## 8. 타입 매개변수와 제네릭 맛보기

컬렉션의 `<String>`, `<int>` 같은 타입 매개변수는 **제네릭(Generic)** 의 핵심입니다. Step 15에서 제네릭을 깊이 학습하지만, 컬렉션 사용 맥락에서 기본 개념을 미리 이해합니다.

```dart
void main() {
  // 타입 명시 — 컴파일 타임 타입 안전성 보장
  List<String> strings = ['a', 'b', 'c'];
  // strings.add(1);  // ❌ 컴파일 오류 — String 리스트에 int 추가 불가

  // 타입 미명시 — dynamic으로 동작, 타입 안전성 상실
  List mixed = ['a', 1, true];  // List<dynamic>
  mixed.add(3.14);              // ✅ 어떤 타입이든 허용 — 위험

  // 제네릭 함수 예시 — 타입에 상관없이 첫 요소 반환
  T first<T>(List<T> list) => list[0];

  print(first<String>(['a', 'b', 'c']));  // a
  print(first<int>([1, 2, 3]));           // 1
  print(first(['x', 'y']));               // 타입 추론 → x
}
```

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: 컬렉션 선택 판단

아래 각 요구사항에 가장 적합한 컬렉션 타입을 고르고 이유를 설명하세요.

1. 할 일 목록 앱 — 작업의 순서가 중요하고, 같은 내용의 작업이 여러 개 있을 수 있음
2. 사용자의 관심 카테고리 태그 — 중복 없이 고유한 태그만 저장
3. 나라 코드(KR, US, JP)로 국가명을 빠르게 조회해야 하는 기능
4. 두 사용자가 공통으로 팔로우하는 계정 목록 찾기

> **정답 힌트**
>
> 1. `List<String>` — 순서 보장, 중복 허용
> 2. `Set<String>` — 중복 없는 고유값 집합
> 3. `Map<String, String>` — 키(코드)로 값(국가명) O(1) 조회
> 4. `Set` + 교집합 연산(`intersection`) — 두 Set의 공통 요소 추출

### 실습 9-2: 단어 빈도 카운터

아래 문장에서 각 단어의 등장 횟수를 `Map<String, int>`로 집계하고, 가장 많이 등장한 단어를 출력하세요.

```dart
void main() {
  String sentence = 'dart is great dart is fast flutter uses dart';
  List<String> words = sentence.split(' ');

  // (1) 단어 빈도 Map 생성
  Map<String, int> frequency = {};
  // TODO: 구현

  // (2) 가장 많이 등장한 단어 출력
  // TODO: 구현
}
```

> **정답 힌트**
>
> ```dart
> void main() {
>   String sentence = 'dart is great dart is fast flutter uses dart';
>   List<String> words = sentence.split(' ');
>
>   Map<String, int> frequency = {};
>   for (var word in words) {
>     frequency[word] = (frequency[word] ?? 0) + 1;
>   }
>   print(frequency);
>   // {dart: 3, is: 2, great: 1, fast: 1, flutter: 1, uses: 1}
>
>   String mostFrequent = frequency.entries
>       .reduce((a, b) => a.value >= b.value ? a : b)
>       .key;
>   print('최다 등장: $mostFrequent (${frequency[mostFrequent]}회)');
>   // 최다 등장: dart (3회)
> }
> ```

### 실습 9-3: Mutable / Immutable 오류 수정

아래 코드에서 런타임 오류가 발생하는 줄을 찾고 수정 방법을 제시하세요.

```dart
void main() {
  const directions = ['North', 'South', 'East', 'West'];
  directions.add('Center');         // (1)

  final visited = <String>{};
  visited = {'Seoul', 'Busan'};     // (2)

  const codes = {'KR': '한국'};
  codes['US'] = '미국';             // (3)
}
```

> **정답 힌트**
>
> 1. `const` 리스트는 수정 불가 → `var directions = [...]` 또는 `final`로 변경
> 2. `final` 변수 자체 재할당 불가 → `visited.addAll({'Seoul', 'Busan'})` 사용
> 3. `const` Map은 수정 불가 → `final codes = {'KR': '한국'}` 으로 변경

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 타입        | 특성                                      | 핵심 메서드                                            |
| ----------- | ----------------------------------------- | ------------------------------------------------------ |
| `List<T>`   | 순서 O, 중복 O, 인덱스 접근               | `add`, `remove`, `sort`, `sublist`, `contains`         |
| `Set<T>`    | 순서 X, 중복 X, 집합 연산                 | `add`, `remove`, `union`, `intersection`, `difference` |
| `Map<K,V>`  | 키-값 쌍, 키 고유, 빠른 조회              | `[]`, `putIfAbsent`, `update`, `entries`, `map`        |
| Mutable     | `var` / `final` — 내부 수정 가능          | 일반적인 컬렉션 조작                                   |
| Immutable   | `const` / `unmodifiable` — 내부 수정 불가 | 상수 데이터, 공유 자원 보호                            |
| Null Safety | 컬렉션 자체와 요소 각각 nullable 구분     | `?.`, `??`, `whereType<T>()`                           |

### 🔗 다음 단계

> **Step 7 — Collection 고급 및 함수형 프로그래밍**으로 이동하세요.

Step 7에서는 Spread operator(`...`, `...?`), Collection if/for 문법, 그리고 이번 Step에서 잠깐 사용한 `map()`, `where()`, `reduce()`, `fold()` 등 **함수형 컬렉션 메서드**를 완전히 마스터합니다. 실전 과제 2(도서 관리 시스템)를 위한 핵심 도구들입니다.

### 📚 참고 자료

| 자료                  | 링크                                                           |
| --------------------- | -------------------------------------------------------------- |
| Dart 컬렉션 공식 문서 | <https://dart.dev/language/collections>                        |
| dart:core 컬렉션 API  | <https://api.dart.dev/stable/dart-core/dart-core-library.html> |
| List API              | <https://api.dart.dev/stable/dart-core/List-class.html>        |
| Set API               | <https://api.dart.dev/stable/dart-core/Set-class.html>         |
| Map API               | <https://api.dart.dev/stable/dart-core/Map-class.html>         |
| DartPad 온라인 실습   | <https://dartpad.dev>                                          |

### ❓ 자가진단 퀴즈

1. **[Remember]** `{}` 리터럴만으로 빈 Set을 선언할 수 없는 이유는 무엇인가?
2. **[Remember]** `List.filled(3, 0)`과 `List.generate(3, (i) => i)`의 결과 차이는?
3. **[Understand]** `final list = [1, 2, 3]`일 때 `list.add(4)`는 가능하지만 `list = [1, 2, 3, 4]`는 불가능한 이유를 설명하라.
4. **[Understand]** `Map`에서 존재하지 않는 키에 접근했을 때 예외가 아닌 `null`이 반환되는 이유와, 이를 안전하게 처리하는 방법 두 가지를 설명하라.
5. **[Apply]** `List<int> numbers = [5, 3, 8, 1, 9, 2, 7, 4, 6]`에서 5보다 큰 수만 내림차순으로 정렬한 새 리스트를 만드는 코드를 작성하라.
6. **[Analyze]** 1,000만 개의 요소 중 특정 값의 존재 여부를 검사할 때 `List`보다 `Set`이 유리한 이유를 Big-O 표기법으로 설명하라.

> **5번 정답 힌트**
>
> ```dart
> List<int> numbers = [5, 3, 8, 1, 9, 2, 7, 4, 6];
> var result = numbers.where((n) => n > 5).toList()
>   ..sort((a, b) => b.compareTo(a));
> print(result);  // [9, 8, 7, 6]
> ```

> **6번 정답 힌트**
>
> `List`의 포함 여부 검사는 O(n) — 최악의 경우 모든 요소를 순회해야 함. `Set`은 해시 테이블 기반으로 O(1) — 요소 수와 무관하게 일정한 시간. 1,000만 개 기준 `List`는 최대 1,000만 번 비교가 필요하지만 `Set`은 단 1회의 해시 계산으로 판단 가능.

---

> ⬅️ [Step 5 — 함수(Function)](#) | ➡️ [Step 7 — Collection 고급 및 함수형 프로그래밍 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Collections, dart:core) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
