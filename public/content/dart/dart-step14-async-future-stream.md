# Step 14 — 비동기 프로그래밍 심화 (Future / async / Stream)

> **Phase 3 | 고급 Dart** | 예상 소요: 3일 | 블룸 수준: Understand ~ Analyze

---

## 📋 목차

- [Step 14 — 비동기 프로그래밍 심화 (Future / async / Stream)](#step-14--비동기-프로그래밍-심화-future--async--stream)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론 — Dart의 비동기 모델](#2-서론--dart의-비동기-모델)
    - [왜 비동기가 필요한가](#왜-비동기가-필요한가)
  - [3. Future 심화](#3-future-심화)
    - [3.1 Future의 세 가지 상태](#31-future의-세-가지-상태)
    - [3.2 Future 생성 패턴](#32-future-생성-패턴)
    - [3.3 Future 조합 — `wait` / `any` / `wait(eagerError)`](#33-future-조합--wait--any--waiteagererror)
    - [3.4 `Future.delayed` / `Future.microtask` / `Future.value`](#34-futuredelayed--futuremicrotask--futurevalue)
  - [4. `async` / `await` 내부 원리](#4-async--await-내부-원리)
    - [4.1 컴파일러가 변환하는 방식](#41-컴파일러가-변환하는-방식)
    - [4.2 `await` 없는 `async` 함수의 함정](#42-await-없는-async-함수의-함정)
    - [4.3 순차 vs 병렬 실행 패턴](#43-순차-vs-병렬-실행-패턴)
  - [5. Event Loop 심화](#5-event-loop-심화)
    - [5.1 Microtask Queue vs Event Queue](#51-microtask-queue-vs-event-queue)
    - [5.2 실행 순서 예측](#52-실행-순서-예측)
  - [6. Stream — 연속 비동기 이벤트](#6-stream--연속-비동기-이벤트)
    - [6.1 Stream이란](#61-stream이란)
    - [6.2 Stream 생성](#62-stream-생성)
    - [6.3 Stream 구독 — `listen()`](#63-stream-구독--listen)
    - [6.4 `async*` / `yield` — 비동기 제너레이터](#64-async--yield--비동기-제너레이터)
    - [6.5 Stream 변환 메서드](#65-stream-변환-메서드)
    - [6.6 `await for` — Stream 순회](#66-await-for--stream-순회)
    - [6.7 StreamController — 수동 Stream 제어](#67-streamcontroller--수동-stream-제어)
  - [7. Single-subscription vs Broadcast Stream](#7-single-subscription-vs-broadcast-stream)
  - [8. 실용 비동기 패턴](#8-실용-비동기-패턴)
    - [8.1 타임아웃 처리](#81-타임아웃-처리)
    - [8.2 재시도 패턴](#82-재시도-패턴)
    - [8.3 디바운스 / 쓰로틀](#83-디바운스--쓰로틀)
    - [8.4 비동기 초기화 패턴](#84-비동기-초기화-패턴)
  - [9. 실습](#9-실습)
    - [실습 9-1: Event Loop 실행 순서 예측](#실습-9-1-event-loop-실행-순서-예측)
    - [실습 9-2: `async*` / `yield`로 페이지네이션 Stream 구현](#실습-9-2-async--yield로-페이지네이션-stream-구현)
    - [실습 9-3: 순차 vs 병렬 성능 비교](#실습-9-3-순차-vs-병렬-성능-비교)
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
| 1   | 🔵 Remember   | `Future`의 세 상태, `Stream`의 두 종류, `StreamController`의 역할을 나열할 수 있다     |
| 2   | 🟢 Understand | Event Loop에서 Microtask Queue와 Event Queue의 처리 순서를 설명할 수 있다              |
| 3   | 🟢 Understand | `async*`/`yield`가 `Stream`을 생성하는 방식을 `Future`/`async`와 비교해 설명할 수 있다 |
| 4   | 🟡 Apply      | `Future.wait` / `Future.any`로 병렬 비동기 작업을 조합하고 예외를 처리할 수 있다       |
| 5   | 🟡 Apply      | `StreamController`로 이벤트를 수동으로 제어하고 `listen()`으로 구독할 수 있다          |
| 6   | 🟠 Analyze    | 순차 실행과 병렬 실행의 성능 차이를 측정하고 적합한 패턴을 선택할 수 있다              |

---

## 2. 서론 — Dart의 비동기 모델

### 왜 비동기가 필요한가

UI 앱이나 서버는 **동시에 여러 일**을 해야 합니다. 파일을 읽는 동안 사용자 입력을 받고, 네트워크 응답을 기다리는 동안 애니메이션을 재생해야 합니다.

Dart는 **단일 스레드(Single Thread)** 로 동작합니다. 멀티스레드 없이 어떻게 여러 일을 동시에 처리할까요?

```
멀티스레드 방식 (Java, Python)
  스레드 A: 네트워크 요청 ────────────────────────────► 완료
  스레드 B: UI 렌더링   ────────────────────────────► 완료
  → 스레드 간 공유 상태 = Race Condition 위험

Dart 방식 (단일 스레드 + Event Loop)
  메인 스레드: 코드 실행 → await → 다른 작업 → await 완료 → 재개
  → Race Condition 없음, 예측 가능한 실행 순서
```

**Dart 비동기의 두 가지 핵심**

![diagram](/developer-open-book/diagrams/step14-future-vs-stream.svg)

> **전제 지식**: Step 1 (Event Loop 기초), Step 13 (비동기 예외 처리)

---

## 3. Future 심화

### 3.1 Future의 세 가지 상태

![diagram](/developer-open-book/diagrams/step14-future-states.svg)

```dart
import 'dart:async';

void main() async {
  // 아직 완료되지 않은 Future
  Future<int> pending = Future.delayed(Duration(seconds: 1), () => 42);

  print('Future 생성 직후 — 아직 Uncompleted');

  int value = await pending;  // Completed with value
  print('완료된 값: $value');  // 42

  // Completed with error
  Future<int> failed = Future.error(Exception('실패!'));
  try {
    await failed;
  } catch (e) {
    print('오류: $e');
  }
}
```

---

### 3.2 Future 생성 패턴

```dart
void main() async {
  // 1. Future.value — 즉시 완료된 Future
  Future<int> immediate = Future.value(42);
  print(await immediate);  // 42

  // 2. Future.error — 즉시 실패한 Future
  Future<int> failed = Future.error(Exception('즉시 실패'));

  // 3. Future.delayed — 지연 후 완료
  Future<String> delayed = Future.delayed(
    Duration(milliseconds: 300),
    () => '300ms 후 완료',
  );
  print(await delayed);

  // 4. Completer — Future를 수동으로 완료
  Completer<String> completer = Completer();

  // 외부에서 나중에 완료
  Future.delayed(Duration(milliseconds: 100), () {
    completer.complete('Completer로 완료');
    // 오류로 완료: completer.completeError(Exception('오류'));
  });

  print(await completer.future);  // Completer로 완료

  // 5. async 함수 — 함수 자체가 Future 반환
  Future<double> calculate() async {
    await Future.delayed(Duration(milliseconds: 50));
    return 3.14;
  }
  print(await calculate());  // 3.14
}
```

**`Completer` 활용 패턴 — 콜백을 Future로 감싸기**

```dart
// 레거시 콜백 API를 Future로 변환
Future<String> fetchWithCallback() {
  Completer<String> completer = Completer();

  // 콜백 기반 API 시뮬레이션
  void legacyApi({
    required void Function(String) onSuccess,
    required void Function(Exception) onError,
  }) {
    Future.delayed(Duration(milliseconds: 100), () {
      onSuccess('콜백 결과');
    });
  }

  legacyApi(
    onSuccess: (data) => completer.complete(data),
    onError:   (e)    => completer.completeError(e),
  );

  return completer.future;
}

void main() async {
  print(await fetchWithCallback());  // 콜백 결과
}
```

---

### 3.3 Future 조합 — `wait` / `any` / `wait(eagerError)`

**`Future.wait` — 모두 완료될 때까지 대기**

```dart
void main() async {
  Future<String> fetchUser()  async {
    await Future.delayed(Duration(milliseconds: 200));
    return '홍길동';
  }
  Future<int>    fetchScore() async {
    await Future.delayed(Duration(milliseconds: 300));
    return 95;
  }
  Future<String> fetchBadge() async {
    await Future.delayed(Duration(milliseconds: 150));
    return '골드';
  }

  final sw = Stopwatch()..start();

  // ❌ 순차 실행 — 총 650ms
  // var user  = await fetchUser();
  // var score = await fetchScore();
  // var badge = await fetchBadge();

  // ✅ 병렬 실행 — 총 300ms (가장 오래 걸리는 것 기준)
  final results = await Future.wait([
    fetchUser(),
    fetchScore(),
    fetchBadge(),
  ]);

  sw.stop();
  print('결과: $results');          // [홍길동, 95, 골드]
  print('소요 시간: ${sw.elapsedMilliseconds}ms');  // ≈ 300ms
}
```

**`eagerError` 옵션**

```dart
void main() async {
  Future<String> failFast() async {
    await Future.delayed(Duration(milliseconds: 100));
    throw Exception('빠른 실패');
  }
  Future<String> slowSuccess() async {
    await Future.delayed(Duration(milliseconds: 500));
    return '느린 성공';
  }

  // eagerError: true (기본값) — 첫 오류 발생 즉시 전파
  try {
    await Future.wait([failFast(), slowSuccess()], eagerError: true);
  } catch (e) {
    print('즉시 실패: $e');  // ≈ 100ms 후 출력
  }

  // eagerError: false — 모두 완료 후 첫 오류 전파
  try {
    await Future.wait([failFast(), slowSuccess()], eagerError: false);
  } catch (e) {
    print('대기 후 실패: $e');  // ≈ 500ms 후 출력 (slowSuccess 완료 대기)
  }
}
```

**`Future.any` — 가장 먼저 완료되는 것 반환**

```dart
void main() async {
  Future<String> serverA() async {
    await Future.delayed(Duration(milliseconds: 300));
    return 'Server A 응답';
  }
  Future<String> serverB() async {
    await Future.delayed(Duration(milliseconds: 150));
    return 'Server B 응답';  // 더 빠름
  }
  Future<String> serverC() async {
    await Future.delayed(Duration(milliseconds: 500));
    return 'Server C 응답';
  }

  // 가장 빠른 서버의 응답만 사용 — 나머지는 무시
  String fastest = await Future.any([serverA(), serverB(), serverC()]);
  print(fastest);  // Server B 응답 (≈ 150ms)
}
```

**`Future.wait` vs `Future.any` 선택 기준**

| 상황                       | 패턴                             |
| -------------------------- | -------------------------------- |
| 모든 결과가 필요           | `Future.wait`                    |
| 가장 빠른 결과만 필요      | `Future.any`                     |
| 하나라도 실패 시 즉시 중단 | `Future.wait(eagerError: true)`  |
| 모두 완료 후 실패 집계     | `Future.wait(eagerError: false)` |

---

### 3.4 `Future.delayed` / `Future.microtask` / `Future.value`

```dart
void main() async {
  // Future.microtask — 현재 이벤트 루프 사이클 직후 (Microtask Queue)
  Future.microtask(() => print('Microtask'));

  // Future.value — 즉시 완료, Event Queue에 스케줄
  Future.value(1).then((v) => print('Future.value: $v'));

  print('동기 코드');

  // 출력 순서:
  // 동기 코드         ← 현재 사이클 동기 코드 먼저
  // Microtask         ← Microtask Queue 우선
  // Future.value: 1   ← Event Queue
}
```

---

## 4. `async` / `await` 내부 원리

### 4.1 컴파일러가 변환하는 방식

`async`/`await`는 **문법 설탕(Syntactic Sugar)** 입니다. 컴파일러가 `Future` 체인으로 변환합니다.

```dart
// async/await 코드
Future<int> fetchAndDouble(String id) async {
  String data = await fetchData(id);
  int value   = await parseInt(data);
  return value * 2;
}

// 컴파일러가 변환하는 Future 체인 (개념적)
Future<int> fetchAndDouble(String id) {
  return fetchData(id)
      .then((data) => parseInt(data))
      .then((value) => value * 2);
}
```

`await`는 **현재 실행을 일시 중단하고 Event Loop에 제어권을 넘깁니다.** Future가 완료되면 그 지점부터 재개합니다.

![diagram](/developer-open-book/diagrams/step14-async-await-flow.svg)

---

### 4.2 `await` 없는 `async` 함수의 함정

```dart
// ⚠️ 흔한 실수 — await 없이 Future 반환값 무시
Future<void> badPattern() async {
  Future.delayed(Duration(seconds: 1), () => print('1초 후'));
  // await 없음 — 이 Future는 무시되고 함수가 즉시 완료됨
  print('즉시 출력');
}

// ✅ 올바른 패턴
Future<void> goodPattern() async {
  await Future.delayed(Duration(seconds: 1), () => print('1초 후'));
  print('1초 후에 출력');
}

// ⚠️ async 함수인데 await가 전혀 없는 경우
Future<int> unnecessaryAsync() async {
  return 42;  // async/await 불필요, 그냥 동기 함수여도 됨
}
// → Future.value(42)와 동일하지만 불필요한 오버헤드

void main() async {
  await badPattern();
  // 즉시 출력   ← '1초 후'는 함수 완료 후에 출력됨
  await goodPattern();
  // (1초 대기)
  // 1초 후
  // 1초 후에 출력
}
```

---

### 4.3 순차 vs 병렬 실행 패턴

```dart
Future<String> fetchA() async {
  await Future.delayed(Duration(milliseconds: 300));
  return 'A';
}
Future<String> fetchB() async {
  await Future.delayed(Duration(milliseconds: 200));
  return 'B';
}

void main() async {
  final sw = Stopwatch()..start();

  // ── 패턴 1: 순차 실행 ──
  // A가 완료된 후 B 시작 — 총 500ms
  String a1 = await fetchA();
  String b1 = await fetchB();
  print('순차: ${sw.elapsedMilliseconds}ms, 결과: $a1, $b1');

  sw.reset();

  // ── 패턴 2: Future.wait 병렬 ──
  // A와 B 동시 시작 — 총 300ms
  var results = await Future.wait([fetchA(), fetchB()]);
  print('병렬(wait): ${sw.elapsedMilliseconds}ms, 결과: ${results[0]}, ${results[1]}');

  sw.reset();

  // ── 패턴 3: Future 먼저 시작, 나중에 await ──
  // 두 Future를 동시에 시작한 뒤 순서대로 await
  var futureA = fetchA();  // 즉시 시작
  var futureB = fetchB();  // 즉시 시작 (A와 동시)
  String a3 = await futureA;
  String b3 = await futureB;
  print('병렬(변수): ${sw.elapsedMilliseconds}ms, 결과: $a3, $b3');

  // 순차:         500ms
  // 병렬(wait):   300ms ✅
  // 병렬(변수):   300ms ✅
}
```

**언제 순차, 언제 병렬?**

```
순차 실행 — await를 즉시 사용
  이전 결과가 다음 요청의 입력이 될 때
  예: 로그인 → 토큰 획득 → 토큰으로 사용자 정보 조회

병렬 실행 — Future를 먼저 시작 후 await
  서로 독립적인 여러 요청을 동시에 처리할 때
  예: 사용자 정보 + 주문 목록 + 알림 수 동시 조회
```

---

## 5. Event Loop 심화

### 5.1 Microtask Queue vs Event Queue

Dart의 Event Loop는 **두 개의 큐**를 처리합니다.

![diagram](/developer-open-book/diagrams/step14-event-loop-detail.svg)

---

### 5.2 실행 순서 예측

```dart
import 'dart:async';

void main() {
  print('1: 동기 시작');

  Future.delayed(Duration.zero, () => print('5: Event Queue (delayed 0)'));

  Future.microtask(() => print('3: Microtask Queue'));

  Future.value(42).then((_) => print('4: then() — Microtask'));

  scheduleMicrotask(() => print('3-a: scheduleMicrotask'));

  print('2: 동기 끝');

  // 출력 순서:
  // 1: 동기 시작
  // 2: 동기 끝
  // 3: Microtask Queue       ← Microtask 먼저
  // 3-a: scheduleMicrotask   ← Microtask 계속
  // 4: then() — Microtask    ← then()도 Microtask
  // 5: Event Queue (delayed 0) ← Event Queue 나중
}
```

**핵심 규칙**

```
우선순위: 동기 코드 > Microtask Queue > Event Queue

Microtask에 해당하는 것:
  - scheduleMicrotask()
  - Future.microtask()
  - Future.then() 콜백
  - async 함수의 await 이후 재개 코드

Event Queue에 해당하는 것:
  - Future.delayed()
  - Timer
  - I/O 완료 이벤트
  - Stream 이벤트
```

---

## 6. Stream — 연속 비동기 이벤트

### 6.1 Stream이란

```
Future  — 미래에 딱 한 번 값 전달 (영화 티켓 예매 결과)
Stream  — 미래에 여러 번 값 전달 (유튜브 라이브 스트림)

Stream은 세 가지 이벤트를 전달할 수 있음:
  1. 데이터 이벤트 (T 값)
  2. 오류 이벤트 (Exception)
  3. 완료 이벤트 (done)
```

---

### 6.2 Stream 생성

```dart
void main() async {
  // 방법 1: Stream.fromIterable
  Stream<int> fromList = Stream.fromIterable([1, 2, 3, 4, 5]);

  // 방법 2: Stream.fromFuture
  Stream<String> fromFuture = Stream.fromFuture(
    Future.delayed(Duration(milliseconds: 100), () => '미래값'),
  );

  // 방법 3: Stream.periodic — 주기적 이벤트
  Stream<int> ticker = Stream.periodic(
    Duration(milliseconds: 500),
    (tick) => tick,  // tick = 0, 1, 2, ...
  ).take(5);         // 5개만

  // 방법 4: Stream.value / Stream.error — 즉시 완료
  Stream<int> single = Stream.value(42);
  Stream<int> error  = Stream.error(Exception('Stream 오류'));
}
```

---

### 6.3 Stream 구독 — `listen()`

```dart
void main() async {
  Stream<int> numbers = Stream.fromIterable([1, 2, 3, 4, 5]);

  // listen() — Stream 구독
  StreamSubscription<int> subscription = numbers.listen(
    (data)  => print('데이터: $data'),      // 데이터 이벤트
    onError: (e) => print('오류: $e'),       // 오류 이벤트
    onDone:  ()  => print('완료'),           // 완료 이벤트
    cancelOnError: false,                    // 오류 시 구독 유지
  );

  // 출력:
  // 데이터: 1
  // 데이터: 2
  // 데이터: 3
  // 데이터: 4
  // 데이터: 5
  // 완료

  // 구독 취소 — 더 이상 이벤트 수신 안 함
  await Future.delayed(Duration(seconds: 2));
  await subscription.cancel();

  // 구독 일시정지 / 재개
  subscription.pause();
  subscription.resume();
}
```

---

### 6.4 `async*` / `yield` — 비동기 제너레이터

`async*`는 `Stream`을 생성하는 함수를 만드는 키워드입니다. `yield`로 하나씩 값을 내보냅니다.

```dart
// async* 함수 — Stream<T> 반환
Stream<int> countdown(int from) async* {
  for (int i = from; i >= 0; i--) {
    await Future.delayed(Duration(milliseconds: 500));
    yield i;  // Stream에 값 전달
  }
}

Stream<String> fetchPages(List<String> urls) async* {
  for (var url in urls) {
    try {
      // HTTP 요청 시뮬레이션
      await Future.delayed(Duration(milliseconds: 200));
      yield '[$url] 응답 완료';        // 성공 데이터
    } catch (e) {
      yield '[$url] 실패: $e';         // 오류도 데이터로 내보냄
    }
  }
  // 함수 종료 시 Stream 자동 완료
}

// yield* — 다른 Stream/Iterable을 통째로 내보냄
Stream<int> merged() async* {
  yield* Stream.fromIterable([1, 2, 3]);  // 1, 2, 3 순서대로
  yield* countdown(3);                    // 3, 2, 1, 0
}

void main() async {
  // await for로 순회 (6.6절에서 자세히)
  await for (var count in countdown(5)) {
    print(count);  // 5, 4, 3, 2, 1, 0 (각 0.5초 간격)
  }
}
```

**`sync*` / `yield` — 동기 제너레이터 (참고)**

```dart
// sync* — Iterable<T> 반환 (동기)
Iterable<int> range(int start, int end) sync* {
  for (int i = start; i <= end; i++) {
    yield i;
  }
}

void main() {
  print(range(1, 5).toList());  // [1, 2, 3, 4, 5]
}
```

---

### 6.5 Stream 변환 메서드

`Stream`은 `Iterable`처럼 `map`, `where`, `take` 등을 지원합니다. 차이는 **모든 연산이 지연 평가되며 비동기**로 동작한다는 점입니다.

```dart
void main() async {
  Stream<int> numbers = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // map — 변환
  // where — 필터
  // take — 앞에서 N개
  await numbers
      .where((n) => n % 2 == 0)      // 짝수만
      .map((n) => n * n)             // 제곱
      .take(3)                       // 3개만
      .forEach((n) => print(n));     // 4, 16, 36

  // Stream 집계
  Stream<int> nums = Stream.fromIterable([1, 2, 3, 4, 5]);

  int sum   = await nums.fold(0, (acc, n) => acc + n);
  print(sum);   // 15 — fold로 합계

  // toList — Stream → List
  List<int> list = await Stream.fromIterable([1, 2, 3]).toList();
  print(list);  // [1, 2, 3]

  // distinct — 연속 중복 제거
  Stream<int> withDups = Stream.fromIterable([1, 1, 2, 2, 2, 3, 1]);
  List<int> distinct   = await withDups.distinct().toList();
  print(distinct);  // [1, 2, 3, 1] — 연속 중복만 제거

  // expand — 평탄화
  Stream<List<int>> nested = Stream.fromIterable([[1,2],[3,4],[5]]);
  List<int> flat = await nested.expand((list) => list).toList();
  print(flat);  // [1, 2, 3, 4, 5]

  // asyncMap — 비동기 변환
  Stream<int> ids = Stream.fromIterable([1, 2, 3]);
  Stream<String> users = ids.asyncMap((id) async {
    await Future.delayed(Duration(milliseconds: 100));
    return 'User_$id';
  });
  await users.forEach(print);  // User_1, User_2, User_3
}
```

---

### 6.6 `await for` — Stream 순회

`await for`는 Stream의 각 이벤트를 **순서대로 비동기 처리**합니다.

```dart
Future<void> processStream() async {
  Stream<String> events = Stream.fromIterable([
    '이벤트 A', '이벤트 B', '이벤트 C'
  ]);

  await for (String event in events) {
    // 각 이벤트를 순서대로 처리 (이전 처리 완료 후 다음 이벤트)
    await Future.delayed(Duration(milliseconds: 100));
    print('처리: $event');
  }
  print('모든 이벤트 처리 완료');
}

// await for와 listen의 차이
// await for: 순차 처리, 이전 완료 후 다음 처리
// listen:    비동기 처리, 이벤트가 겹칠 수 있음

// await for에서 오류 처리
Future<void> safeProcess() async {
  try {
    await for (var event in riskyStream()) {
      print(event);
    }
  } on NetworkException catch (e) {
    print('Stream 오류: $e');
  }
}

Stream<int> riskyStream() async* {
  yield 1;
  yield 2;
  throw NetworkException('Stream 중간 오류');
  yield 3;  // 도달 안 됨
}
```

---

### 6.7 StreamController — 수동 Stream 제어

`StreamController`는 Stream에 **수동으로 이벤트를 주입**합니다. UI 상태 관리, WebSocket 이벤트 라우팅 등에 활용됩니다.

```dart
import 'dart:async';

void main() async {
  // StreamController 생성
  StreamController<String> controller = StreamController<String>();

  // Stream 구독
  StreamSubscription sub = controller.stream.listen(
    (data)  => print('수신: $data'),
    onError: (e) => print('오류: $e'),
    onDone:  ()  => print('Stream 종료'),
  );

  // 이벤트 추가
  controller.add('첫 번째 이벤트');
  controller.add('두 번째 이벤트');
  controller.addError(Exception('의도적 오류'));
  controller.add('세 번째 이벤트');

  await Future.delayed(Duration(milliseconds: 100));

  // Stream 종료
  await controller.close();
  await sub.cancel();

  // 출력:
  // 수신: 첫 번째 이벤트
  // 수신: 두 번째 이벤트
  // 오류: Exception: 의도적 오류
  // 수신: 세 번째 이벤트
  // Stream 종료
}
```

**실용 패턴 — 이벤트 버스**

```dart
class EventBus {
  final _controller = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get events => _controller.stream;

  // 특정 타입의 이벤트만 구독
  Stream<Map<String, dynamic>> on(String eventType) =>
      events.where((e) => e['type'] == eventType);

  // 이벤트 발행
  void emit(String type, Map<String, dynamic> data) {
    _controller.add({'type': type, ...data});
  }

  void dispose() => _controller.close();
}

void main() async {
  var bus = EventBus();

  // 로그인 이벤트만 구독
  bus.on('login').listen((e) => print('로그인: ${e['userId']}'));

  // 모든 이벤트 구독
  bus.events.listen((e) => print('[ALL] ${e['type']}'));

  bus.emit('login',  {'userId': 'u001'});
  bus.emit('logout', {'userId': 'u001'});
  bus.emit('login',  {'userId': 'u002'});

  await Future.delayed(Duration(milliseconds: 100));
  bus.dispose();

  // [ALL] login
  // 로그인: u001
  // [ALL] logout
  // [ALL] login
  // 로그인: u002
}
```

---

## 7. Single-subscription vs Broadcast Stream

```
Single-subscription Stream (기본)
  - 구독자 한 명만 허용
  - 구독이 시작될 때부터 이벤트 수신
  - 주로 파일 읽기, HTTP 응답 등 일회성 데이터

Broadcast Stream
  - 여러 구독자 동시 허용
  - 구독 시점 이후의 이벤트만 수신 (이전 이벤트 수신 불가)
  - 주로 UI 이벤트, WebSocket, EventBus
```

```dart
import 'dart:async';

void main() async {
  // ── Single-subscription ──
  Stream<int> single = Stream.fromIterable([1, 2, 3]);
  single.listen((n) => print('구독자1: $n'));
  // single.listen((n) => print('구독자2: $n'));  // 💥 StreamException: already listened

  // ── Broadcast Stream ──
  StreamController<int> bc = StreamController<int>.broadcast();

  bc.stream.listen((n) => print('구독자A: $n'));
  bc.stream.listen((n) => print('구독자B: $n'));

  bc.add(10);
  bc.add(20);
  await Future.delayed(Duration(milliseconds: 100));
  await bc.close();

  // 구독자A: 10
  // 구독자B: 10
  // 구독자A: 20
  // 구독자B: 20

  // Single → Broadcast 변환
  Stream<int> singleStream = Stream.fromIterable([1, 2, 3]);
  Stream<int> broadStream  = singleStream.asBroadcastStream();

  broadStream.listen((n) => print('변환A: $n'));
  broadStream.listen((n) => print('변환B: $n'));
}
```

---

## 8. 실용 비동기 패턴

### 8.1 타임아웃 처리

```dart
Future<String> fetchData(String id) async {
  await Future.delayed(Duration(milliseconds: 500));
  return '데이터: $id';
}

void main() async {
  // Future.timeout — 지정 시간 초과 시 TimeoutException
  try {
    String result = await fetchData('u001')
        .timeout(Duration(milliseconds: 300));  // 300ms 제한
    print(result);
  } on TimeoutException catch (e) {
    print('타임아웃: ${e.duration}');  // 타임아웃: 0:00:00.300000
  }

  // timeout + onTimeout — 기본값 제공
  String safe = await fetchData('u001').timeout(
    Duration(milliseconds: 300),
    onTimeout: () => '기본값',  // 타임아웃 시 반환값
  );
  print(safe);  // 기본값

  // Stream 타임아웃
  Stream<int> slowStream = Stream.periodic(Duration(seconds: 1), (i) => i);
  await for (var event in slowStream.timeout(
    Duration(milliseconds: 500),
    onTimeout: (sink) => sink.close(),  // 타임아웃 시 Stream 종료
  )) {
    print(event);
  }
}
```

---

### 8.2 재시도 패턴

```dart
Future<T> retry<T>({
  required Future<T> Function() action,
  int maxAttempts = 3,
  Duration delay = const Duration(milliseconds: 200),
  bool Function(Exception)? retryIf,
}) async {
  Exception? lastError;

  for (int attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } on Exception catch (e) {
      lastError = e;

      // retryIf 조건 확인 — false면 즉시 재발생
      if (retryIf != null && !retryIf(e)) rethrow;

      if (attempt < maxAttempts) {
        print('시도 $attempt/$maxAttempts 실패, ${delay.inMilliseconds}ms 후 재시도');
        await Future.delayed(delay * attempt);  // 지수 백오프
      }
    }
  }

  throw lastError!;
}

void main() async {
  int callCount = 0;

  try {
    String result = await retry(
      action: () async {
        callCount++;
        if (callCount < 3) throw NetworkException('일시적 오류');
        return '성공 (${callCount}번째 시도)';
      },
      maxAttempts: 5,
      delay: Duration(milliseconds: 100),
      retryIf: (e) => e is NetworkException,  // 네트워크 오류만 재시도
    );
    print(result);  // 성공 (3번째 시도)
  } on NetworkException catch (e) {
    print('최종 실패: $e');
  }
}
```

---

### 8.3 디바운스 / 쓰로틀

검색 입력처럼 **빠르게 연속되는 이벤트를 제어**하는 패턴입니다.

```dart
import 'dart:async';

class Debouncer {
  final Duration delay;
  Timer? _timer;

  Debouncer({required this.delay});

  void call(void Function() action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void dispose() => _timer?.cancel();
}

class Throttler {
  final Duration interval;
  DateTime? _lastCall;

  Throttler({required this.interval});

  bool call(void Function() action) {
    final now = DateTime.now();
    if (_lastCall == null ||
        now.difference(_lastCall!) >= interval) {
      _lastCall = now;
      action();
      return true;
    }
    return false;
  }
}

void main() async {
  // Debounce — 마지막 이벤트 후 지정 시간 경과 시 실행
  final debouncer = Debouncer(delay: Duration(milliseconds: 300));

  for (var query in ['D', 'Da', 'Dar', 'Dart']) {
    debouncer(() => print('검색: $query'));  // 마지막 'Dart'만 실행됨
    await Future.delayed(Duration(milliseconds: 100));
  }

  await Future.delayed(Duration(milliseconds: 400));
  debouncer.dispose();
  // 검색: Dart   ← 마지막 이벤트만

  // Throttle — 지정 간격 내 첫 번째 이벤트만 실행
  final throttler = Throttler(interval: Duration(milliseconds: 500));

  for (int i = 0; i < 10; i++) {
    throttler(() => print('클릭 처리: $i'));
    await Future.delayed(Duration(milliseconds: 100));
  }
  // 클릭 처리: 0   ← 처음
  // 클릭 처리: 5   ← 500ms 후 첫 번째
}
```

---

### 8.4 비동기 초기화 패턴

```dart
// ❌ 안티패턴 — 생성자에서 비동기 초기화 불가
class BadService {
  late String _config;

  // 생성자는 동기 — Future 반환 불가
  BadService() {
    // _config = await loadConfig();  // ❌ 불가
  }
}

// ✅ 패턴 1: factory + static 초기화 메서드
class Service {
  final String config;
  Service._(this.config);  // private 생성자

  static Future<Service> create() async {
    final config = await _loadConfig();  // 비동기 초기화
    return Service._(config);
  }

  static Future<String> _loadConfig() async {
    await Future.delayed(Duration(milliseconds: 100));
    return 'api_url=https://api.dart.dev';
  }

  void doWork() => print('작업 중: $config');
}

// ✅ 패턴 2: initialize() 메서드 분리
class LazyService {
  String? _config;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    await Future.delayed(Duration(milliseconds: 100));
    _config = 'initialized_config';
    _initialized = true;
  }

  void doWork() {
    if (!_initialized) throw StateError('초기화 필요: initialize() 먼저 호출');
    print('작업: $_config');
  }
}

void main() async {
  // 패턴 1
  final service = await Service.create();
  service.doWork();

  // 패턴 2
  final lazy = LazyService();
  await lazy.initialize();
  lazy.doWork();
}
```

---

## 9. 실습

> 💡 이론 검증용 최소 실습 | DartPad(<https://dartpad.dev>) 활용 권장

### 실습 9-1: Event Loop 실행 순서 예측

아래 코드의 출력 순서를 예측하고 이유를 설명하세요.

```dart
import 'dart:async';

void main() async {
  print('A');

  Future.delayed(Duration.zero, () => print('B'));

  Future.microtask(() => print('C'));

  Future.value(1).then((_) => print('D'));

  scheduleMicrotask(() => print('E'));

  print('F');

  await Future.delayed(Duration.zero);

  print('G');
}
```

> **정답 힌트**
>
> ```
> A   ← 동기
> F   ← 동기
> C   ← Microtask (Future.microtask)
> D   ← Microtask (Future.value.then)
> E   ← Microtask (scheduleMicrotask)
> B   ← Event Queue (Future.delayed zero)
> G   ← await 이후 재개 (Event Queue 후)
> ```

### 실습 9-2: `async*` / `yield`로 페이지네이션 Stream 구현

API에서 페이지 단위로 데이터를 가져오는 `paginatedStream`을 구현하세요.

**요구사항**

- `fetchPage(int page)` — 비동기로 해당 페이지의 아이템 목록 반환
- `paginatedStream(int totalPages)` — `async*`로 모든 페이지 아이템을 순서대로 yield
- `main()`에서 `await for`로 순회하며 출력

```dart
Future<List<String>> fetchPage(int page) async {
  await Future.delayed(Duration(milliseconds: 100));
  return List.generate(3, (i) => 'Page${page}_Item${i + 1}');
}

Stream<String> paginatedStream(int totalPages) async* {
  // TODO: 구현
}

void main() async {
  await for (var item in paginatedStream(3)) {
    print(item);
  }
  // Page1_Item1, Page1_Item2, Page1_Item3
  // Page2_Item1, Page2_Item2, Page2_Item3
  // Page3_Item1, Page3_Item2, Page3_Item3
}
```

> **정답 힌트**
>
> ```dart
> Stream<String> paginatedStream(int totalPages) async* {
>   for (int page = 1; page <= totalPages; page++) {
>     final items = await fetchPage(page);
>     yield* Stream.fromIterable(items);  // 페이지 아이템 전체 yield
>   }
> }
> ```

### 실습 9-3: 순차 vs 병렬 성능 비교

아래 코드를 완성해 순차 실행과 병렬 실행의 소요 시간을 실제로 측정하세요.

```dart
Future<String> fetchUser()   async { await Future.delayed(Duration(milliseconds: 300)); return '홍길동'; }
Future<int>    fetchOrders() async { await Future.delayed(Duration(milliseconds: 400)); return 12; }
Future<String> fetchBadge()  async { await Future.delayed(Duration(milliseconds: 200)); return '골드'; }

Future<void> sequential() async {
  // TODO: 세 함수를 순차 실행하고 소요 시간 측정
}

Future<void> parallel() async {
  // TODO: 세 함수를 Future.wait로 병렬 실행하고 소요 시간 측정
}

void main() async {
  await sequential();  // 예상: ≈ 900ms
  await parallel();    // 예상: ≈ 400ms
}
```

> **정답 힌트**
>
> ```dart
> Future<void> sequential() async {
>   final sw = Stopwatch()..start();
>   final user   = await fetchUser();
>   final orders = await fetchOrders();
>   final badge  = await fetchBadge();
>   sw.stop();
>   print('순차: ${sw.elapsedMilliseconds}ms — $user, $orders, $badge');
> }
>
> Future<void> parallel() async {
>   final sw = Stopwatch()..start();
>   final results = await Future.wait([fetchUser(), fetchOrders(), fetchBadge()]);
>   sw.stop();
>   print('병렬: ${sw.elapsedMilliseconds}ms — ${results[0]}, ${results[1]}, ${results[2]}');
> }
> ```

---

## 10. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                | 핵심 내용                                                 |
| ------------------- | --------------------------------------------------------- |
| `Future` 세 상태    | Uncompleted / Completed with value / Completed with error |
| `Completer`         | Future를 수동으로 완료, 콜백 API 래핑                     |
| `Future.wait`       | 모든 Future 병렬 실행 후 완료 대기                        |
| `Future.any`        | 가장 먼저 완료된 것 반환                                  |
| `eagerError`        | true=즉시 실패 전파, false=모두 완료 후 전파              |
| `await` 원리        | 컴파일러가 `then()` 체인으로 변환                         |
| 순차 vs 병렬        | `await` 즉시 사용 vs Future 먼저 시작 후 `await`          |
| Microtask Queue     | Event Queue보다 우선 처리 (`then`, `scheduleMicrotask`)   |
| `Stream`            | 연속 비동기 이벤트 (data / error / done)                  |
| `async*` / `yield`  | Stream 생성 제너레이터                                    |
| `yield*`            | 다른 Stream/Iterable 전체 위임                            |
| Stream 변환         | `map`, `where`, `asyncMap`, `expand`, `distinct`          |
| `await for`         | Stream 순차 처리                                          |
| `StreamController`  | 수동 Stream 제어, Broadcast 지원                          |
| Single vs Broadcast | 단일 구독 vs 다중 구독                                    |
| 타임아웃            | `.timeout(Duration, onTimeout)`                           |
| Debounce / Throttle | 연속 이벤트 제어                                          |
| 비동기 초기화       | `static Future<T> create()` 패턴                          |

### 🔗 다음 단계

> **Step 15 — Isolate와 병렬 컴퓨팅**으로 이동하세요.

Step 15에서는 Dart의 진정한 병렬 실행 메커니즘인 `Isolate`를 학습합니다. Event Loop 기반의 비동기와 달리 Isolate는 **별도 메모리 공간에서 실제 병렬 실행**합니다. CPU 집약적 작업(이미지 처리, 암호화, JSON 파싱)을 메인 스레드 블로킹 없이 처리하는 방법과 `compute()` Flutter 헬퍼, `Isolate.spawn` 저수준 API를 다룹니다.

### 📚 참고 자료

| 자료                  | 링크                                                               |
| --------------------- | ------------------------------------------------------------------ |
| Dart 비동기 공식 문서 | <https://dart.dev/libraries/async/async-await>                       |
| Future API 레퍼런스   | <https://api.dart.dev/stable/dart-async/Future-class.html>           |
| Stream 공식 가이드    | <https://dart.dev/libraries/async/using-streams>                     |
| StreamController      | <https://api.dart.dev/stable/dart-async/StreamController-class.html> |
| Event Loop 심화       | <https://dart.dev/language/async>                                    |
| DartPad 온라인 실습   | <https://dartpad.dev>                                                |

### ❓ 자가진단 퀴즈

1. **[Remember]** `Future.wait`와 `Future.any`의 반환 조건 차이를 설명하라.
2. **[Remember]** Single-subscription Stream과 Broadcast Stream의 구독자 수 제한 차이와 각각의 대표 사용 사례를 설명하라.
3. **[Understand]** 아래 두 코드의 실행 시간이 다른 이유를 설명하라.

   ```dart
   // 코드 A
   await fetchA();
   await fetchB();
   // 코드 B
   var fa = fetchA(); var fb = fetchB();
   await fa; await fb;
   ```

4. **[Understand]** Microtask Queue가 Event Queue보다 먼저 처리되는 것이 `Future.then()` 콜백의 실행 시점에 어떤 영향을 미치는지 설명하라.
5. **[Apply]** `StreamController.broadcast()`로 만든 Stream에 구독 전에 발행된 이벤트를 구독자가 받지 못하는 이유를 설명하고, 이 문제를 해결하는 방법을 제시하라.
6. **[Analyze]** `async*`/`yield`로 구현한 페이지네이션 Stream과 모든 데이터를 `Future.wait`로 한 번에 가져오는 방식을 메모리 사용량, 첫 데이터 도착 시간, 오류 처리 세 관점에서 비교하라.

> **3번 정답 힌트**
>
> 코드 A는 `fetchA` 완료 후 `fetchB`를 시작하므로 두 지연 시간의 합만큼 소요됩니다. 코드 B는 `fetchA`와 `fetchB`를 동시에 시작하고(변수에 Future 할당 시 즉시 실행), 이후 순서대로 `await`하므로 두 지연 중 더 긴 것만큼 소요됩니다.

> **6번 정답 힌트**
>
> `async*`/`yield` 방식은 한 페이지씩 가져오므로 메모리에 전체 데이터를 올리지 않아 효율적이고, 첫 페이지 데이터를 즉시 처리할 수 있습니다. 반면 `Future.wait` 방식은 전체 데이터를 메모리에 올리고 모두 도착해야 처리를 시작하지만, 병렬로 요청해 총 소요 시간이 짧습니다. 오류 처리 면에서는 `async*`는 특정 페이지 실패를 `await for`의 `try-catch`로 유연하게 처리할 수 있고, `Future.wait`는 하나 실패 시 전체 결과를 잃을 수 있습니다.

---

> ⬅️ [Step 13 — 예외 처리](#) | ➡️ [Step 15 — Isolate와 병렬 컴퓨팅 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Async, Streams) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
