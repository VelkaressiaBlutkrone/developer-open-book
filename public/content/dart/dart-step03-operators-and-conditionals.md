# Step 3 — 연산자와 조건문

> **Phase 1 | Dart 기초** | 예상 소요: 1일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 3 — 연산자와 조건문](#step-3--연산자와-조건문)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [연산자는 언어의 어휘다](#연산자는-언어의-어휘다)
  - [3. 산술 연산자](#3-산술-연산자)
  - [4. 비교 연산자](#4-비교-연산자)
  - [5. 논리 연산자](#5-논리-연산자)
  - [6. Dart 특화 연산자](#6-dart-특화-연산자)
    - [6.1 `??` — Null 병합 연산자](#61---null-병합-연산자)
    - [6.2 `??=` — Null 대입 연산자](#62---null-대입-연산자)
    - [6.3 `?.` — Null 조건부 접근 연산자](#63---null-조건부-접근-연산자)
    - [6.4 `?.` 체이닝 — 깊은 객체 접근](#64--체이닝--깊은-객체-접근)
    - [6.5 `..` — 캐스케이드 연산자 (연쇄 호출)](#65---캐스케이드-연산자-연쇄-호출)
  - [7. 조건문](#7-조건문)
    - [7.1 `if` / `else if` / `else`](#71-if--else-if--else)
    - [7.2 삼항 연산자 `? :`](#72-삼항-연산자--)
    - [7.3 `switch` — 전통 방식](#73-switch--전통-방식)
    - [7.4 `switch` — Dart 3.0+ 패턴 매칭](#74-switch--dart-30-패턴-매칭)
  - [8. 연산자 우선순위](#8-연산자-우선순위)
  - [9. 실습](#9-실습)
    - [실습 9-1: Null 연산자 빈칸 채우기](#실습-9-1-null-연산자-빈칸-채우기)
    - [실습 9-2: 패턴 매칭 switch 작성](#실습-9-2-패턴-매칭-switch-작성)
    - [실습 9-3: 캐스케이드 연산자 리팩토링](#실습-9-3-캐스케이드-연산자-리팩토링)
  - [10. 핵심 요약 및 다음 단계](#10-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                     |
| --- | ------------- | ------------------------------------------------------------------------ |
| 1   | 🔵 Remember   | `??`, `??=`, `?.`, `..` 연산자의 이름과 역할을 나열할 수 있다            |
| 2   | 🟢 Understand | `??`와 `?.`의 동작 차이를 코드 예시로 설명할 수 있다                     |
| 3   | 🟢 Understand | Dart 3.0+ `switch` 패턴 매칭이 기존 방식과 다른 점을 설명할 수 있다      |
| 4   | 🟡 Apply      | Null 관련 조건 처리를 `??`, `??=`, `?.`를 활용해 간결하게 작성할 수 있다 |
| 5   | 🟡 Apply      | 복잡한 조건 분기를 패턴 매칭 `switch`로 리팩토링할 수 있다               |

---

## 2. 서론

### 연산자는 언어의 어휘다

연산자는 단순한 계산 기호가 아닙니다. 언어가 제공하는 연산자의 종류는 그 언어가 어떤 문제를 우아하게 표현하려 하는지를 보여줍니다.

Dart의 연산자 설계에는 두 가지 철학이 담겨 있습니다.

**첫째, Null을 일급 시민으로 취급한다.**

`??`, `??=`, `?.` 세 연산자는 Null Safety와 함께 Dart 코드에서 null 처리를 장황한 `if (x != null)` 분기 없이 한 줄로 표현하게 해줍니다.

**둘째, 패턴 매칭으로 조건 분기를 데이터 중심으로 표현한다.**

Dart 3.0에서 도입된 `switch` 패턴 매칭은 단순한 값 비교를 넘어 타입 검사, 구조 분해, 조건 검증을 하나의 `switch` 블록에서 처리합니다.

> **전제 지식**: Step 2 완료 (변수 선언 키워드, Null Safety 기초)

---

## 3. 산술 연산자

기본 사칙연산과 함께 Dart에서 자주 쓰이는 산술 연산자를 정리합니다.

```dart
void main() {
  int a = 17;
  int b = 5;

  print(a + b);   // 22  — 덧셈
  print(a - b);   // 12  — 뺄셈
  print(a * b);   // 85  — 곱셈
  print(a / b);   // 3.4 — 나눗셈 (결과: double)
  print(a ~/ b);  // 3   — 정수 나눗셈 (소수점 버림)
  print(a % b);   // 2   — 나머지 (모듈로)
  print(-a);      // -17 — 단항 부정
}
```

**`/` vs `~/` 차이**

```dart
print(7 / 2);    // 3.5  — double 반환
print(7 ~/ 2);   // 3    — int 반환 (소수점 버림)
```

> Dart에서 `/`는 **항상 `double`을 반환**합니다. 정수 결과가 필요하면 `~/`를 사용하세요.

**복합 대입 연산자**

```dart
void main() {
  int x = 10;

  x += 5;   // x = x + 5  → 15
  x -= 3;   // x = x - 3  → 12
  x *= 2;   // x = x * 2  → 24
  x ~/= 5;  // x = x ~/ 5 → 4
  x %= 3;   // x = x % 3  → 1

  // 증감 연산자
  int y = 5;
  print(y++);  // 5 — 후위: 현재 값 반환 후 증가
  print(y);    // 6
  print(++y);  // 7 — 전위: 먼저 증가 후 반환
}
```

---

## 4. 비교 연산자

```dart
void main() {
  int a = 10;
  int b = 20;

  print(a == b);   // false — 같음
  print(a != b);   // true  — 다름
  print(a > b);    // false — 초과
  print(a < b);    // true  — 미만
  print(a >= b);   // false — 이상
  print(a <= b);   // true  — 이하
}
```

**객체 동등성: `==` vs `identical()`**

```dart
void main() {
  String s1 = 'hello';
  String s2 = 'hello';
  String s3 = s1;

  print(s1 == s2);          // true  — 값(내용) 비교
  print(identical(s1, s2)); // true  — 문자열 리터럴은 Dart가 동일 객체 재사용
  print(identical(s1, s3)); // true  — 같은 참조

  List<int> l1 = [1, 2, 3];
  List<int> l2 = [1, 2, 3];

  print(l1 == l2);          // false — List는 기본적으로 참조 비교
  print(identical(l1, l2)); // false — 서로 다른 객체
}
```

| 연산자        | 비교 대상   | 설명                        |
| ------------- | ----------- | --------------------------- |
| `==`          | 값(내용)    | 클래스에서 `==` 재정의 가능 |
| `identical()` | 메모리 참조 | 완전히 동일한 객체인지 확인 |

---

## 5. 논리 연산자

```dart
void main() {
  bool isLoggedIn = true;
  bool hasPermission = false;
  bool isPremium = true;

  // AND (&&) — 모두 true일 때 true
  print(isLoggedIn && hasPermission);    // false
  print(isLoggedIn && isPremium);        // true

  // OR (||) — 하나라도 true이면 true
  print(hasPermission || isPremium);     // true
  print(hasPermission || !isLoggedIn);   // false

  // NOT (!) — 반전
  print(!isLoggedIn);    // false
  print(!hasPermission); // true
}
```

**단락 평가 (Short-circuit Evaluation)**

논리 연산자는 결과가 확정되는 순간 나머지 표현식 평가를 중단합니다.

```dart
bool expensiveCheck() {
  print('비용이 큰 검사 실행');
  return true;
}

void main() {
  bool result1 = false && expensiveCheck(); // expensiveCheck() 미실행
  bool result2 = true  || expensiveCheck(); // expensiveCheck() 미실행

  // ✅ 활용: null 체크 후 메서드 호출
  String? name = null;
  bool isLong = name != null && name.length > 5; // name이 null이면 length 미실행
}
```

---

## 6. Dart 특화 연산자

이 섹션은 Dart 코드를 처음 접하는 개발자가 가장 낯설어하는 동시에, 익숙해지면 가장 자주 쓰게 되는 연산자들입니다.

### 6.1 `??` — Null 병합 연산자

`left ?? right`: **left가 null이면 right를 반환**, null이 아니면 left를 반환합니다.

```dart
void main() {
  String? userName = null;

  // 전통 방식 — 장황함
  String display1 = (userName != null) ? userName : '익명 사용자';

  // ?? 사용 — 간결함
  String display2 = userName ?? '익명 사용자';

  print(display1);  // 익명 사용자
  print(display2);  // 익명 사용자

  // 연쇄 사용
  String? a = null;
  String? b = null;
  String  c = '최종값';

  print(a ?? b ?? c);  // 최종값 — 왼쪽부터 null이 아닌 첫 번째 값 반환
}
```

**`??`의 동작 원리**

![diagram](/developer-open-book/diagrams/step03-null-coalescing.svg)

---

### 6.2 `??=` — Null 대입 연산자

`variable ??= value`: **변수가 null일 때만 값을 대입**합니다. 이미 값이 있으면 아무것도 하지 않습니다.

```dart
void main() {
  String? cache = null;

  // 전통 방식
  if (cache == null) {
    cache = '캐시 데이터';
  }

  // ??= 사용
  cache ??= '캐시 데이터';
  print(cache);  // 캐시 데이터

  // 이미 값이 있으면 무시
  cache ??= '다른 데이터';
  print(cache);  // 캐시 데이터 (변경되지 않음)
}
```

**대표 활용 패턴 — 지연 초기화**

```dart
class Config {
  static String? _instance;

  static String get value {
    _instance ??= _loadFromDisk();  // null일 때만 로드
    return _instance!;
  }

  static String _loadFromDisk() => '설정값';
}
```

---

### 6.3 `?.` — Null 조건부 접근 연산자

`object?.property`: **객체가 null이면 null을 반환**, null이 아니면 property에 접근합니다. null인 객체에 접근할 때 발생하는 런타임 오류를 방지합니다.

```dart
void main() {
  String? name = 'Dart Developer';
  String? nullName = null;

  // 전통 방식
  int? len1 = (name != null) ? name.length : null;

  // ?. 사용
  int? len2 = name?.length;      // 14
  int? len3 = nullName?.length;  // null (오류 없음)

  print(len2);  // 14
  print(len3);  // null

  // 메서드 호출에도 사용
  print(name?.toUpperCase());     // DART DEVELOPER
  print(nullName?.toUpperCase()); // null
}
```

**`?.`와 `??` 조합 — 가장 흔한 패턴**

```dart
void main() {
  String? userInput = null;

  // null이면 '기본값', 아니면 대문자 변환
  String result = userInput?.toUpperCase() ?? '기본값';
  print(result);  // 기본값

  userInput = 'hello';
  result = userInput?.toUpperCase() ?? '기본값';
  print(result);  // HELLO
}
```

---

### 6.4 `?.` 체이닝 — 깊은 객체 접근

```dart
class Address {
  String? city;
  Address({this.city});
}

class User {
  String name;
  Address? address;
  User({required this.name, this.address});
}

void main() {
  User user1 = User(name: '홍길동', address: Address(city: '서울'));
  User user2 = User(name: '김철수');  // address 없음

  // 전통 방식 — 중첩 null 체크
  String city1 = (user1.address != null && user1.address!.city != null)
      ? user1.address!.city!
      : '주소 미등록';

  // ?. 체이닝 — 간결함
  String city2 = user1.address?.city ?? '주소 미등록';  // 서울
  String city3 = user2.address?.city ?? '주소 미등록';  // 주소 미등록

  print(city2);  // 서울
  print(city3);  // 주소 미등록
}
```

---

### 6.5 `..` — 캐스케이드 연산자 (연쇄 호출)

`..`는 동일 객체에 대해 여러 메서드를 **연속으로 호출**할 때 사용합니다. 각 호출의 반환값이 아닌 **원본 객체를 계속 반환**합니다.

```dart
void main() {
  // 전통 방식 — 변수명 반복
  List<int> list = [];
  list.add(1);
  list.add(2);
  list.add(3);
  list.sort();

  // .. 사용 — 객체명 한 번만
  List<int> list2 = []
    ..add(1)
    ..add(2)
    ..add(3)
    ..sort();

  print(list2);  // [1, 2, 3]
}
```

**`?..` — Null 조건부 캐스케이드**

```dart
List<int>? maybeList = null;

// null이 아닐 때만 연쇄 호출
maybeList?..add(1)..add(2);
print(maybeList);  // null (오류 없음)
```

**Dart 특화 연산자 한눈에 보기**

| 연산자 | 이름             | 동작               | 반환값                |
| ------ | ---------------- | ------------------ | --------------------- |
| `??`   | Null 병합        | null이면 우측 값   | null이 아닌 값        |
| `??=`  | Null 대입        | null일 때만 대입   | 대입된 값             |
| `?.`   | Null 조건부 접근 | null이면 null 반환 | 프로퍼티 값 또는 null |
| `..`   | 캐스케이드       | 메서드 연쇄 호출   | 원본 객체             |
| `?..`  | Null 캐스케이드  | null이면 무시      | 원본 객체 또는 null   |

---

## 7. 조건문

### 7.1 `if` / `else if` / `else`

```dart
void checkGrade(int score) {
  if (score >= 90) {
    print('A');
  } else if (score >= 80) {
    print('B');
  } else if (score >= 70) {
    print('C');
  } else {
    print('F');
  }
}

void main() {
  checkGrade(95);  // A
  checkGrade(75);  // C
  checkGrade(50);  // F
}
```

**Null Safety와 결합한 if 패턴**

```dart
void greet(String? name) {
  if (name == null || name.isEmpty) {
    print('안녕하세요, 방문자님!');
    return;  // Early return 패턴 — 중첩 줄이기
  }

  // 이 시점에서 name은 non-null String으로 자동 승격
  print('안녕하세요, $name 님!');
}
```

---

### 7.2 삼항 연산자 `? :`

간단한 조건 분기를 한 줄로 표현합니다.

```dart
void main() {
  int score = 75;

  // if-else 방식
  String result1;
  if (score >= 60) {
    result1 = '합격';
  } else {
    result1 = '불합격';
  }

  // 삼항 연산자
  String result2 = score >= 60 ? '합격' : '불합격';

  print(result1);  // 합격
  print(result2);  // 합격

  // ⚠️ 중첩 삼항은 가독성을 해침 — 지양
  // String grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
  // → if-else if 또는 switch 사용 권장
}
```

---

### 7.3 `switch` — 전통 방식

```dart
void getDayName(int day) {
  switch (day) {
    case 1:
      print('월요일');
      break;
    case 2:
      print('화요일');
      break;
    case 6:
    case 7:
      print('주말');  // fall-through: 여러 case 공유
      break;
    default:
      print('평일');
  }
}

// Dart의 switch는 표현식으로도 사용 가능 (Dart 3.0+)
String getDayType(int day) => switch (day) {
  6 || 7 => '주말',
  _      => '평일',   // _ : 기본값 (default와 동일)
};
```

---

### 7.4 `switch` — Dart 3.0+ 패턴 매칭

Dart 3.0에서 `switch`는 단순 값 비교를 넘어 **타입 매칭**, **구조 분해**, **가드 절(when)**을 지원하는 강력한 도구로 진화했습니다.

**타입 패턴 매칭**

```dart
void describe(Object value) {
  switch (value) {
    case int n when n < 0:
      print('음수: $n');
    case int n:
      print('양의 정수: $n');
    case double d:
      print('실수: $d');
    case String s when s.isEmpty:
      print('빈 문자열');
    case String s:
      print('문자열: $s (길이: ${s.length})');
    case null:
      print('null 값');
    default:
      print('알 수 없는 타입');
  }
}

void main() {
  describe(-5);        // 음수: -5
  describe(42);        // 양의 정수: 42
  describe(3.14);      // 실수: 3.14
  describe('');        // 빈 문자열
  describe('Dart');    // 문자열: Dart (길이: 4)
  describe(null);      // null 값
}
```

**`when` — 가드 절 (추가 조건 검증)**

```dart
String classifyTemperature(double temp) => switch (temp) {
  double t when t < 0    => '영하',
  double t when t < 10   => '매우 추움',
  double t when t < 20   => '쌀쌀함',
  double t when t < 30   => '적당함',
  _                      => '더움',
};

void main() {
  print(classifyTemperature(-5.0));   // 영하
  print(classifyTemperature(22.0));   // 적당함
  print(classifyTemperature(35.0));   // 더움
}
```

**구조 분해 패턴 (Records와 결합 — Step 12에서 심화)**

```dart
void main() {
  (String, int) person = ('홍길동', 30);

  // Records 구조 분해
  switch (person) {
    case (String name, int age) when age >= 18:
      print('$name 님은 성인입니다 (만 $age세)');
    case (String name, int age):
      print('$name 님은 미성년자입니다 (만 $age세)');
  }
  // 홍길동 님은 성인입니다 (만 30세)
}
```

**전통 `switch` vs 패턴 매칭 `switch` 비교**

| 기능             | 전통 switch       | 패턴 매칭 switch            |
| ---------------- | ----------------- | --------------------------- |
| 값 비교          | ✅                | ✅                          |
| 타입 검사        | ❌ (is 별도 필요) | ✅                          |
| 가드 절 (`when`) | ❌                | ✅                          |
| 구조 분해        | ❌                | ✅                          |
| 표현식 사용      | ❌                | ✅                          |
| 망라성 검사      | ❌                | ✅ (sealed class와 결합 시) |

---

## 8. 연산자 우선순위

연산자 우선순위는 괄호 없이 작성된 표현식의 평가 순서를 결정합니다. 복잡한 표현식에서는 **괄호를 명시**하는 것이 가독성과 정확성 모두에 유리합니다.

```
높은 우선순위
─────────────────────────────────
1.  단항: -x, !x, ~x, ++x, x++
2.  곱셈류: *, /, ~/, %
3.  덧셈류: +, -
4.  시프트: <<, >>, >>>
5.  비트 AND: &
6.  비트 XOR: ^
7.  비트 OR: |
8.  비교: <, >, <=, >=, is, is!, as
9.  동등: ==, !=
10. 논리 AND: &&
11. 논리 OR: ||
12. Null 병합: ??
13. 삼항: ? :
14. 대입: =, +=, ??=, 등
─────────────────────────────────
낮은 우선순위
```

**주의가 필요한 우선순위 예시**

```dart
void main() {
  // ⚠️ ?? 와 || 의 우선순위 혼동 주의
  String? a = null;
  bool flag = true;

  // ?? 는 || 보다 낮은 우선순위
  // 아래 두 식은 결과가 다름
  var r1 = a ?? 'default' == 'default';       // a ?? ('default' == 'default')
  var r2 = (a ?? 'default') == 'default';     // 의도한 방식

  print(r1);  // true (bool)
  print(r2);  // true (bool) — 이 경우 우연히 같지만 의미가 다름

  // ✅ 불확실할 때는 괄호로 명시
  bool isValid = (a?.isNotEmpty ?? false) && flag;
}
```

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: Null 연산자 빈칸 채우기

아래 `___` 자리에 `??`, `??=`, `?.` 중 가장 적합한 연산자를 채우세요.

```dart
void main() {
  String? input = null;

  // (1) input이 null이면 '기본값' 사용
  String result = input ___ '기본값';

  // (2) input이 null일 때만 '초기화' 대입
  input ___ '초기화';

  // (3) input이 null이면 null 반환, 아니면 대문자 반환
  String? upper = input ___ toUpperCase();

  print(result);  // 기본값
  print(input);   // 초기화
  print(upper);   // INITIALIZATION
}
```

> **정답 힌트**
>
> 1. `??` — null이면 우측 값 반환
> 2. `??=` — null일 때만 대입
> 3. `?.` — null이면 null 반환, 아니면 메서드 호출

### 실습 9-2: 패턴 매칭 switch 작성

다음 조건을 전통 `if-else if` 체인 대신 패턴 매칭 `switch` 표현식으로 작성하세요.

**요구사항**: `Object` 타입 매개변수를 받아 아래 규칙으로 문자열을 반환하는 `classify()` 함수 작성

- `int`이고 0보다 크면 `'양수 정수'`
- `int`이고 0보다 작으면 `'음수 정수'`
- `int`이고 0이면 `'영'`
- `double`이면 `'실수'`
- `String`이면 `'문자열: (값)'`
- 그 외 `'알 수 없음'`

> **정답 힌트**
>
> ```dart
> String classify(Object value) => switch (value) {
>   int n when n > 0 => '양수 정수',
>   int n when n < 0 => '음수 정수',
>   int _            => '영',
>   double _         => '실수',
>   String s         => '문자열: $s',
>   _                => '알 수 없음',
> };
> ```

### 실습 9-3: 캐스케이드 연산자 리팩토링

아래 코드를 `..` 연산자를 사용해 리팩토링하세요.

```dart
// 리팩토링 전
void main() {
  StringBuffer sb = StringBuffer();
  sb.write('Dart');
  sb.write(' is');
  sb.write(' awesome!');
  print(sb.toString());
}
```

> **정답 힌트**
>
> ```dart
> void main() {
>   StringBuffer sb = StringBuffer()
>     ..write('Dart')
>     ..write(' is')
>     ..write(' awesome!');
>   print(sb.toString());
> }
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념               | 핵심 내용                                           |
| ------------------ | --------------------------------------------------- |
| `/` vs `~/`        | `/`는 double 반환, `~/`는 int 반환 (소수점 버림)    |
| `??`               | null이면 우측 값, 아니면 좌측 값 반환               |
| `??=`              | null일 때만 대입, 이미 값이 있으면 무시             |
| `?.`               | null이면 null, 아니면 프로퍼티/메서드 접근          |
| `..`               | 동일 객체에 메서드 연쇄 호출, 원본 객체 반환        |
| 삼항 연산자        | 간단한 조건 분기 한 줄 표현, 중첩은 지양            |
| 전통 `switch`      | 값 비교, `break` 필요, fall-through 주의            |
| 패턴 매칭 `switch` | 타입 검사, `when` 가드 절, 구조 분해 지원           |
| 단락 평가          | `&&`는 좌측 false, `\|\|`는 좌측 true면 우측 미평가 |

### 🔗 다음 단계

> **Step 4 — 반복문**으로 이동하세요.

Step 4에서는 `for`, `while`, `do-while`의 동작 원리 및 차이를 이해하고, Dart 컬렉션 순회에 최적화된 `for-in`과 `forEach`의 특성과 적절한 사용 시점을 학습합니다.

### 📚 참고 자료

| 자료                  | 링크                                  |
| --------------------- | ------------------------------------- |
| Dart 연산자 공식 문서 | <https://dart.dev/language/operators> |
| Dart 조건문 공식 문서 | <https://dart.dev/language/branches>  |
| Dart 3.0 패턴 매칭    | <https://dart.dev/language/patterns>  |
| DartPad 온라인 실습   | <https://dartpad.dev>                 |

### ❓ 자가진단 퀴즈

1. **[Remember]** `??`와 `?.`의 역할을 각각 한 문장으로 설명하라.
2. **[Remember]** Dart 3.0+ `switch` 패턴 매칭에서 추가 조건을 검증하는 키워드는 무엇인가?
3. **[Understand]** `a?.b ?? 'default'`와 `a == null ? 'default' : a.b`는 동일한 의미인가? 차이가 있다면 무엇인가?
4. **[Apply]** `String? email`이 null이거나 `@`를 포함하지 않으면 `'유효하지 않은 이메일'`을, 유효하면 이메일을 대문자로 반환하는 표현식을 작성하라.

> **4번 정답 힌트**
>
> ```dart
> String result = (email != null && email.contains('@'))
>     ? email.toUpperCase()
>     : '유효하지 않은 이메일';
>
> // 또는 더 간결하게
> String result = (email?.contains('@') == true)
>     ? email!.toUpperCase()
>     : '유효하지 않은 이메일';
> ```

---

> ⬅️ [Step 2 — 변수와 데이터 타입](#) | ➡️ [Step 4 — 반복문 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Operators, Branches, Patterns) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
