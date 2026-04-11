# Step 4 — 반복문

> **Phase 1 | Dart 기초** | 예상 소요: 1일 | 블룸 수준: Understand ~ Apply

---

## 📋 목차

- [Step 4 — 반복문](#step-4--반복문)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [반복문 선택의 기준](#반복문-선택의-기준)
  - [3. 카운터 기반 반복: `for`](#3-카운터-기반-반복-for)
    - [기본 구조](#기본-구조)
  - [4. 조건 기반 반복: `while`](#4-조건-기반-반복-while)
    - [기본 구조](#기본-구조-1)
  - [5. 최소 1회 실행 반복: `do-while`](#5-최소-1회-실행-반복-do-while)
    - [기본 구조](#기본-구조-2)
  - [6. 컬렉션 순회: `for-in`](#6-컬렉션-순회-for-in)
    - [기본 구조](#기본-구조-3)
  - [7. 함수형 순회: `forEach`](#7-함수형-순회-foreach)
    - [기본 구조](#기본-구조-4)
  - [8. 반복 제어: `break`와 `continue`](#8-반복-제어-break와-continue)
    - [`break` — 반복문 즉시 탈출](#break--반복문-즉시-탈출)
    - [`continue` — 현재 반복 건너뜀](#continue--현재-반복-건너뜀)
  - [9. 중첩 반복문과 레이블](#9-중첩-반복문과-레이블)
    - [중첩 반복문](#중첩-반복문)
    - [레이블(Label) — 중첩 반복문의 특정 단계 제어](#레이블label--중첩-반복문의-특정-단계-제어)
  - [10. 반복문 선택 가이드](#10-반복문-선택-가이드)
  - [11. 실습](#11-실습)
    - [실습 11-1: 반복문 결과 예측](#실습-11-1-반복문-결과-예측)
    - [실습 11-2: FizzBuzz](#실습-11-2-fizzbuzz)
    - [실습 11-3: 컬렉션 순회 방식 비교](#실습-11-3-컬렉션-순회-방식-비교)
  - [12. 핵심 요약 및 다음 단계](#12-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                    |
| --- | ------------- | ----------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `for`, `while`, `do-while`, `for-in`, `forEach`의 문법을 나열할 수 있다 |
| 2   | 🟢 Understand | 각 반복문이 적합한 상황의 차이를 설명할 수 있다                         |
| 3   | 🟢 Understand | `for-in`과 `forEach`의 기술적 차이(break 가능 여부 등)를 설명할 수 있다 |
| 4   | 🟡 Apply      | 주어진 문제에 가장 적합한 반복문을 선택해 올바르게 작성할 수 있다       |
| 5   | 🟠 Analyze    | `for-in` vs `forEach` vs `for`의 트레이드오프를 상황별로 분석할 수 있다 |

---

## 2. 서론

### 반복문 선택의 기준

반복문은 Dart에서 5가지 방식으로 작성할 수 있습니다. 어떤 반복문을 선택하느냐는 단순히 취향의 문제가 아닙니다. **반복 횟수를 미리 알고 있는가**, **컬렉션을 순회하는가**, **중간에 탈출이 필요한가**에 따라 가독성과 의도 전달력이 달라집니다.

```
반복문 선택 흐름도

    반복 횟수를 미리 아는가?
     ├─ YES ──► for (인덱스 필요 여부에 따라)
     └─ NO
           │
           ▼
      컬렉션을 순회하는가?
       ├─ YES ──► for-in 또는 forEach
       └─ NO
             │
             ▼
        조건이 먼저인가, 실행이 먼저인가?
         ├─ 조건 먼저 ──► while
         └─ 실행 먼저 ──► do-while
```

> **전제 지식**: Step 3 완료 (연산자, 조건문, `??` / `?.` 이해)

---

## 3. 카운터 기반 반복: `for`

### 기본 구조

```
for (초기화; 조건; 증감) {
    // 반복 실행할 코드
}
```

세 부분은 모두 선택 사항입니다. 각 부분의 역할과 실행 순서를 이해하는 것이 핵심입니다.

```
실행 순서

① 초기화   — 단 한 번 실행
② 조건 검사 — false이면 즉시 종료
③ 본문 실행
④ 증감     — 본문 실행 후 매번 실행
⑤ ② 로 돌아감
```

**기본 사용 예시**

```dart
void main() {
  // 0부터 4까지 출력
  for (int i = 0; i < 5; i++) {
    print(i);  // 0, 1, 2, 3, 4
  }

  // 역순 반복
  for (int i = 5; i > 0; i--) {
    print(i);  // 5, 4, 3, 2, 1
  }

  // 2씩 증가
  for (int i = 0; i <= 10; i += 2) {
    print(i);  // 0, 2, 4, 6, 8, 10
  }
}
```

**인덱스가 필요한 컬렉션 순회**

```dart
void main() {
  List<String> fruits = ['사과', '바나나', '체리'];

  // 인덱스와 값을 함께 사용해야 할 때 for 사용
  for (int i = 0; i < fruits.length; i++) {
    print('${i + 1}번: ${fruits[i]}');
  }
  // 1번: 사과
  // 2번: 바나나
  // 3번: 체리
}
```

**`for` 변형 — 초기화/증감 생략**

```dart
void main() {
  int i = 0;

  // 초기화와 증감을 외부로 분리
  for (; i < 3; ) {
    print(i);
    i++;
  }

  // 세미콜론 두 개만 있으면 무한 루프 (break로 탈출)
  for (;;) {
    print('무한 루프');
    break;
  }
}
```

---

## 4. 조건 기반 반복: `while`

### 기본 구조

```
while (조건) {
    // 조건이 true인 동안 반복
}
```

`while`은 **반복 횟수를 모르고, 특정 조건이 충족될 때까지** 반복해야 할 때 사용합니다. 조건을 **먼저 검사**하므로 처음부터 조건이 false라면 본문은 한 번도 실행되지 않습니다.

```dart
void main() {
  // 예시 1: 2의 거듭제곱이 100을 넘을 때까지
  int value = 1;
  while (value < 100) {
    value *= 2;
    print(value);  // 2, 4, 8, 16, 32, 64, 128
  }

  // 예시 2: 사용자 입력 시뮬레이션
  List<String> inputs = ['잘못된값', '잘못된값', '정답'];
  int index = 0;

  while (inputs[index] != '정답') {
    print('재시도: ${inputs[index]}');
    index++;
  }
  print('정답 입력: ${inputs[index]}');
  // 재시도: 잘못된값
  // 재시도: 잘못된값
  // 정답 입력: 정답
}
```

**무한 루프 패턴 — `while (true)`**

이벤트 루프나 서버처럼 지속적으로 실행되는 구조에서 활용합니다.

```dart
void processQueue(List<String> queue) {
  while (true) {
    if (queue.isEmpty) break;  // 큐가 비면 탈출

    String task = queue.removeAt(0);
    print('처리 중: $task');
  }
  print('모든 작업 완료');
}

void main() {
  processQueue(['작업A', '작업B', '작업C']);
}
// 처리 중: 작업A
// 처리 중: 작업B
// 처리 중: 작업C
// 모든 작업 완료
```

---

## 5. 최소 1회 실행 반복: `do-while`

### 기본 구조

```
do {
    // 최소 한 번 실행
} while (조건);
```

`do-while`은 **본문을 먼저 실행하고 조건을 나중에 검사**합니다. 조건 결과와 무관하게 **반드시 최소 1회 실행**이 보장됩니다.

```dart
void main() {
  // while과 do-while의 차이
  int x = 10;

  // while — 조건이 처음부터 false이면 실행 안 됨
  while (x < 5) {
    print('while 실행됨');  // 출력 없음
  }

  // do-while — 조건이 false여도 최소 1회 실행
  do {
    print('do-while 실행됨');  // 한 번 출력
  } while (x < 5);
}
```

**대표 활용 패턴 — 입력값 유효성 검사**

사용자 입력을 받을 때는 "일단 받고 나서 검증"하는 흐름이 자연스럽습니다.

```dart
// 실제 콘솔 입력 시뮬레이션
String getValidInput(List<String> simulatedInputs) {
  int attempt = 0;
  String input;

  do {
    input = simulatedInputs[attempt++];
    print('입력값: $input');

    if (input.isEmpty) {
      print('  → 빈 값은 허용되지 않습니다. 다시 입력하세요.');
    }
  } while (input.isEmpty);  // 유효한 값을 받을 때까지 반복

  return input;
}

void main() {
  List<String> inputs = ['', '', '유효한값'];
  String result = getValidInput(inputs);
  print('최종 입력: $result');
}
// 입력값:
//   → 빈 값은 허용되지 않습니다. 다시 입력하세요.
// 입력값:
//   → 빈 값은 허용되지 않습니다. 다시 입력하세요.
// 입력값: 유효한값
// 최종 입력: 유효한값
```

**`while` vs `do-while` 비교**

| 특성           | `while`                              | `do-while`                           |
| -------------- | ------------------------------------ | ------------------------------------ |
| 조건 검사 시점 | 실행 전                              | 실행 후                              |
| 최소 실행 횟수 | 0회 (조건 false면 미실행)            | 1회 (무조건)                         |
| 주요 사용처    | 조건이 처음부터 false일 수 있는 경우 | 최소 1회 실행이 보장되어야 하는 경우 |

---

## 6. 컬렉션 순회: `for-in`

### 기본 구조

```
for (타입 변수 in 컬렉션) {
    // 각 요소에 대해 실행
}
```

`for-in`은 **컬렉션의 모든 요소를 순서대로 순회**할 때 사용합니다. 인덱스가 필요 없고 요소 자체에만 관심이 있을 때 `for`보다 의도를 명확하게 표현합니다.

```dart
void main() {
  List<String> languages = ['Dart', 'Kotlin', 'Swift'];

  // for — 인덱스 포함, 장황함
  for (int i = 0; i < languages.length; i++) {
    print(languages[i]);
  }

  // for-in — 간결하고 의도가 명확함
  for (String lang in languages) {
    print(lang);  // Dart, Kotlin, Swift
  }

  // var로 타입 추론 활용
  for (var lang in languages) {
    print(lang.toUpperCase());  // DART, KOTLIN, SWIFT
  }
}
```

**Set, Map 순회**

```dart
void main() {
  // Set 순회
  Set<int> numbers = {1, 2, 3, 4, 5};
  for (var n in numbers) {
    print(n);  // 1, 2, 3, 4, 5 (순서 보장 안 됨)
  }

  // Map 순회 — entries로 key-value 쌍 접근
  Map<String, int> scores = {'Dart': 95, 'Flutter': 90, 'Kotlin': 85};

  for (var entry in scores.entries) {
    print('${entry.key}: ${entry.value}점');
  }

  // key만 순회
  for (var key in scores.keys) {
    print(key);
  }

  // value만 순회
  for (var value in scores.values) {
    print(value);
  }
}
```

**`for-in`의 중요한 특성**

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // ✅ break와 continue 사용 가능
  for (var n in numbers) {
    if (n == 3) break;     // 3에서 중단
    print(n);              // 1, 2
  }

  for (var n in numbers) {
    if (n % 2 == 0) continue;  // 짝수 건너뜀
    print(n);                   // 1, 3, 5
  }

  // ⚠️ 순회 중 컬렉션 수정 금지 — 런타임 오류 발생
  List<int> list = [1, 2, 3];
  // for (var n in list) {
  //   list.remove(n);  // 💥 Concurrent modification error
  // }
}
```

---

## 7. 함수형 순회: `forEach`

### 기본 구조

`forEach`는 컬렉션의 각 요소에 **콜백 함수**를 적용하는 메서드입니다. 반복문이 아닌 **함수형 프로그래밍** 스타일로 순회합니다.

```dart
void main() {
  List<String> fruits = ['사과', '바나나', '체리'];

  // 기본 사용
  fruits.forEach((fruit) {
    print(fruit);
  });

  // Arrow function으로 축약
  fruits.forEach((fruit) => print(fruit));

  // 메서드 참조 (Method Reference)
  fruits.forEach(print);  // print 자체를 콜백으로 전달
}
```

**`for-in` vs `forEach` — 핵심 차이**

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5];

  // for-in — break, continue 사용 가능
  for (var n in numbers) {
    if (n == 3) break;
    print(n);  // 1, 2
  }

  // forEach — break, continue 사용 불가 ❌
  // numbers.forEach((n) {
  //   if (n == 3) break;    // ❌ 컴파일 오류
  //   if (n == 2) continue; // ❌ 컴파일 오류
  //   print(n);
  // });

  // forEach에서 중간 탈출이 필요하면 예외 처리 방식 사용 (비권장)
  // → 이 경우 for-in 사용이 올바른 선택
}
```

**`forEach`가 빛나는 상황 — 함수형 체이닝**

```dart
void main() {
  List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 짝수만 필터링 후 제곱하여 출력
  numbers
      .where((n) => n % 2 == 0)    // [2, 4, 6, 8, 10]
      .map((n) => n * n)            // [4, 16, 36, 64, 100]
      .forEach(print);              // 각 요소 출력
  // 함수형 체이닝의 마지막 단계로 forEach가 자연스럽게 연결
}
```

> 📌 **`map()`, `where()`, `reduce()`** 등 함수형 메서드는 Step 7(Collection 고급)에서 심화 학습합니다.

**`for-in` vs `forEach` 선택 기준**

| 상황                             | 권장 방식                                              |
| -------------------------------- | ------------------------------------------------------ |
| 중간에 `break` / `continue` 필요 | `for-in`                                               |
| 인덱스가 필요                    | `for`                                                  |
| `async` / `await` 사용           | `for-in` (`forEach`의 async 처리는 예상과 다르게 동작) |
| 함수형 체이닝의 마지막 단계      | `forEach`                                              |
| 단순 순회, 부수 효과(출력 등)    | `for-in` 또는 `forEach` 모두 가능                      |

---

## 8. 반복 제어: `break`와 `continue`

### `break` — 반복문 즉시 탈출

```dart
void main() {
  // 리스트에서 첫 번째 음수 찾기
  List<int> numbers = [3, 7, -2, 5, -8, 1];

  int? firstNegative;
  for (var n in numbers) {
    if (n < 0) {
      firstNegative = n;
      break;  // 찾는 즉시 탈출 — 불필요한 순회 방지
    }
  }
  print(firstNegative);  // -2
}
```

### `continue` — 현재 반복 건너뜀

```dart
void main() {
  // 홀수만 출력
  for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;  // 짝수이면 아래 코드 건너뜀
    print(i);  // 1, 3, 5, 7, 9
  }

  // null 요소 건너뛰기
  List<String?> names = ['Alice', null, 'Bob', null, 'Charlie'];
  for (var name in names) {
    if (name == null) continue;
    print(name.toUpperCase());  // ALICE, BOB, CHARLIE
  }
}
```

---

## 9. 중첩 반복문과 레이블

### 중첩 반복문

```dart
void main() {
  // 구구단 2~3단
  for (int i = 2; i <= 3; i++) {
    for (int j = 1; j <= 9; j++) {
      print('$i × $j = ${i * j}');
    }
  }
}
```

### 레이블(Label) — 중첩 반복문의 특정 단계 제어

중첩 반복문에서 `break`와 `continue`는 기본적으로 **가장 안쪽 반복문**에만 적용됩니다. 외부 반복문을 직접 제어하려면 **레이블**을 사용합니다.

```dart
void main() {
  List<List<int>> matrix = [
    [1, 2, 3],
    [4, 5, 6],  // 여기서 5를 찾으면 전체 탐색 중단
    [7, 8, 9],
  ];

  int target = 5;
  bool found = false;

  // 레이블 선언
  outerLoop:
  for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == target) {
        print('$target 발견: [$i][$j]');
        found = true;
        break outerLoop;  // 레이블이 붙은 외부 반복문까지 탈출
      }
    }
  }

  print(found ? '탐색 완료' : '미발견');
  // 5 발견: [1][1]
  // 탐색 완료
}
```

> ⚠️ **레이블 사용 주의**: 레이블은 코드 흐름을 복잡하게 만들 수 있습니다. 가능하면 별도 함수로 분리하고 `return`을 활용하는 것이 더 명확합니다.

```dart
// 레이블 대신 함수 분리 패턴 (권장)
int? findInMatrix(List<List<int>> matrix, int target) {
  for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == target) return i * 10 + j;  // return으로 즉시 탈출
    }
  }
  return null;
}
```

---

## 10. 반복문 선택 가이드

지금까지 학습한 5가지 반복 방식을 상황별로 정리합니다.

```
┌─────────────────────────────────────────────────────────────┐
│              반복문 선택 기준 요약                           │
├────────────┬────────────────────────────────────────────────┤
│ for        │ 반복 횟수 명확, 인덱스 필요, 역순/간격 순회    │
│ while      │ 반복 횟수 불명확, 조건 충족 시까지 반복        │
│ do-while   │ 최소 1회 실행 보장 (입력 유효성 검사 등)       │
│ for-in     │ 컬렉션 전체 순회, break/continue 필요 시       │
│ forEach    │ 함수형 체이닝 마지막 단계, 부수 효과 적용      │
└────────────┴────────────────────────────────────────────────┘
```

**잘못된 반복문 선택 예시와 교정**

```dart
// ❌ 단순 컬렉션 순회에 for 사용 — 장황함
List<String> items = ['A', 'B', 'C'];
for (int i = 0; i < items.length; i++) {
  print(items[i]);
}

// ✅ for-in 사용 — 의도 명확
for (var item in items) {
  print(item);
}

// ❌ break가 필요한 곳에 forEach 사용 — 동작하지 않음
items.forEach((item) {
  // if (item == 'B') break;  // ❌ 컴파일 오류
});

// ✅ for-in 사용
for (var item in items) {
  if (item == 'B') break;  // ✅
}

// ❌ async/await + forEach — 비동기 처리가 완료를 기다리지 않음
Future<void> wrong() async {
  items.forEach((item) async {
    await Future.delayed(Duration(seconds: 1));
    print(item);  // 순서 보장 안 됨, 완료 대기 안 됨
  });
}

// ✅ async/await + for-in — 순차적 비동기 처리
Future<void> correct() async {
  for (var item in items) {
    await Future.delayed(Duration(seconds: 1));
    print(item);  // 순서 보장, 완료 대기
  }
}
```

---

## 11. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 11-1: 반복문 결과 예측

아래 코드의 출력 결과를 실행 전에 예측하세요.

```dart
void main() {
  // (A)
  for (int i = 0; i < 5; i++) {
    if (i == 3) continue;
    if (i == 4) break;
    print(i);
  }

  print('---');

  // (B)
  int x = 1;
  do {
    print(x);
    x *= 3;
  } while (x < 10);
}
```

> **정답 힌트**
>
> (A) 출력: 0, 1, 2 (3은 continue로 건너뜀, 4에서 break)
>
> (B) 출력: 1, 3, 9 (x=1→출력→x=3→출력→x=9→출력→x=27→조건 false로 종료)

### 실습 11-2: FizzBuzz

1부터 30까지 순회하며 아래 규칙으로 출력하는 코드를 작성하세요.

- 3과 5의 공배수: `FizzBuzz`
- 3의 배수: `Fizz`
- 5의 배수: `Buzz`
- 그 외: 숫자 그대로

> **정답 힌트**
>
> ```dart
> void main() {
>   for (int i = 1; i <= 30; i++) {
>     if (i % 15 == 0) {
>       print('FizzBuzz');
>     } else if (i % 3 == 0) {
>       print('Fizz');
>     } else if (i % 5 == 0) {
>       print('Buzz');
>     } else {
>       print(i);
>     }
>   }
> }
> ```

### 실습 11-3: 컬렉션 순회 방식 비교

아래 코드를 `for`, `for-in`, `forEach` 세 가지 방식으로 각각 작성하고, 각 방식의 장단점을 한 줄로 정리하세요.

**요구사항**: `List<int> scores = [88, 72, 95, 60, 83]`에서 70점 이상인 점수만 출력

> **정답 힌트**
>
> ```dart
> List<int> scores = [88, 72, 95, 60, 83];
>
> // for — 인덱스 접근 가능, 장황함
> for (int i = 0; i < scores.length; i++) {
>   if (scores[i] >= 70) print(scores[i]);
> }
>
> // for-in — 간결, break/continue 가능
> for (var s in scores) {
>   if (s >= 70) print(s);
> }
>
> // forEach — 함수형, break 불가
> scores.where((s) => s >= 70).forEach(print);
> ```

---

## 12. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 반복문     | 특징                       | 대표 사용처                      |
| ---------- | -------------------------- | -------------------------------- |
| `for`      | 인덱스 기반, 횟수 명확     | 배열 인덱스 접근, 역순/간격 순회 |
| `while`    | 조건 선검사, 0회 가능      | 이벤트 루프, 조건 충족 시까지    |
| `do-while` | 후검사, 최소 1회 보장      | 입력 유효성 검사                 |
| `for-in`   | 요소 직접 접근, break 가능 | 컬렉션 단순 순회                 |
| `forEach`  | 콜백 함수, 함수형 스타일   | 체이닝 마지막 단계               |
| `break`    | 반복문 즉시 탈출           | 조건 달성 후 불필요한 순회 방지  |
| `continue` | 현재 반복만 건너뜀         | null 또는 특정 값 필터링         |
| 레이블     | 외부 반복문 직접 제어      | 중첩 반복 탈출 (함수 분리 권장)  |

### 🔗 다음 단계

> **Step 5 — 함수(Function)** 으로 이동하세요.

Step 5에서는 Dart 함수의 핵심인 Arrow function(`=>`), 이름 있는 매개변수(`{}`), Optional 매개변수, Default 값 설정을 학습합니다. 이 내용은 Flutter 위젯 생성자의 동작 방식을 이해하는 직접적인 기반이 됩니다.

### 📚 참고 자료

| 자료                  | 링크                                               |
| --------------------- | -------------------------------------------------- |
| Dart 반복문 공식 문서 | <https://dart.dev/language/loops>                  |
| Dart 컬렉션 공식 문서 | <https://dart.dev/libraries/dart-core#collections> |
| DartPad 온라인 실습   | <https://dartpad.dev>                              |

### ❓ 자가진단 퀴즈

1. **[Remember]** `while`과 `do-while`의 차이점은 무엇인가?
2. **[Remember]** `forEach`에서 `break`를 사용할 수 없는 이유는 무엇인가?
3. **[Understand]** `async/await`와 함께 반복문을 사용할 때 `forEach` 대신 `for-in`을 사용해야 하는 이유를 설명하라.
4. **[Apply]** 1부터 100까지의 정수 중 3의 배수이면서 5의 배수가 아닌 수의 합을 구하는 코드를 작성하라.
5. **[Analyze]** 다음 두 코드는 같은 결과를 출력하는가? 다르다면 어떤 차이가 있는가?

   ```dart
   // 코드 A
   for (var n in [1,2,3,4,5]) {
     if (n > 3) break;
     print(n);
   }
   // 코드 B
   [1,2,3,4,5].forEach((n) {
     if (n > 3) return;
     print(n);
   });
   ```

> **4번 정답 힌트**
>
> ```dart
> int sum = 0;
> for (int i = 1; i <= 100; i++) {
>   if (i % 3 == 0 && i % 5 != 0) sum += i;
> }
> print(sum);  // 1memorization: 1350
> ```

> **5번 정답 힌트**
>
> 출력값은 다릅니다. 코드 A는 `break`로 반복문 전체를 탈출하므로 `1, 2, 3`만 출력합니다. 코드 B의 `return`은 `forEach`에 전달된 **콜백 함수**를 종료할 뿐, 반복 자체는 계속되므로 `1, 2, 3`을 출력하고 4, 5는 조건으로 건너뜁니다. 최종 출력은 동일해 보이지만, 동작 원리가 다르며 조건을 바꾸면 결과가 달라질 수 있습니다.

---

> ⬅️ [Step 3 — 연산자와 조건문](#) | ➡️ [Step 5 — 함수(Function) →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Loops) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
