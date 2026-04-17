# Step 15 — Isolate와 병렬 컴퓨팅

> **Phase 3 | 고급 Dart** | 예상 소요: 2일 | 블룸 수준: Understand ~ Analyze

---

## 📋 목차

- [Step 15 — Isolate와 병렬 컴퓨팅](#step-15--isolate와-병렬-컴퓨팅)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론 — 비동기로 해결할 수 없는 문제](#2-서론--비동기로-해결할-수-없는-문제)
  - [3. Isolate 기본 개념](#3-isolate-기본-개념)
    - [3.1 Isolate란](#31-isolate란)
    - [3.2 메모리 격리와 메시지 패싱](#32-메모리-격리와-메시지-패싱)
    - [3.3 언제 Isolate가 필요한가](#33-언제-isolate가-필요한가)
  - [4. `Isolate.run` — 가장 간단한 병렬 실행](#4-isolaterun--가장-간단한-병렬-실행)
  - [5. `Isolate.spawn` — 저수준 API](#5-isolatespawn--저수준-api)
    - [5.1 기본 spawn 패턴](#51-기본-spawn-패턴)
    - [5.2 SendPort / ReceivePort — 양방향 통신](#52-sendport--receiveport--양방향-통신)
    - [5.3 장기 실행 Isolate 패턴 — IsolateWorker 클래스](#53-장기-실행-isolate-패턴--isolateworker-클래스)
  - [6. `compute` — Flutter 헬퍼 (개념)](#6-compute--flutter-헬퍼-개념)
  - [7. Isolate 간 전달 가능한 데이터 타입](#7-isolate-간-전달-가능한-데이터-타입)
  - [8. Isolate Pool 패턴](#8-isolate-pool-패턴)
  - [9. 비동기 vs Isolate — 선택 기준](#9-비동기-vs-isolate--선택-기준)
  - [10. 실습](#10-실습)
    - [실습 10-1: `Isolate.run` 블로킹 비교](#실습-10-1-isolaterun-블로킹-비교)
    - [실습 10-2: 양방향 통신 Isolate 구현](#실습-10-2-양방향-통신-isolate-구현)
    - [실습 10-3: Isolate.run으로 JSON 파싱 최적화](#실습-10-3-isolaterun으로-json-파싱-최적화)
  - [11. 핵심 요약 및 다음 단계](#11-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [Phase 3 완료 체크리스트](#phase-3-완료-체크리스트)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                                 |
| --- | ------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `Isolate.run`, `Isolate.spawn`, `SendPort`, `ReceivePort`의 역할을 나열할 수 있다                    |
| 2   | 🟢 Understand | Isolate가 스레드와 다른 점(메모리 격리, 메시지 패싱)을 설명할 수 있다                                |
| 3   | 🟢 Understand | Isolate 간 통신이 값 복사(copy) 방식인 이유와 그것이 Race Condition을 방지하는 원리를 설명할 수 있다 |
| 4   | 🟡 Apply      | `Isolate.run`으로 CPU 집약적 작업을 메인 Isolate 블로킹 없이 실행할 수 있다                          |
| 5   | 🟡 Apply      | `SendPort`/`ReceivePort`로 양방향 통신하는 장기 실행 Isolate를 설계할 수 있다                        |
| 6   | 🟠 Analyze    | 주어진 작업이 `async`/`await`로 충분한지 Isolate가 필요한지 판단하고 근거를 설명할 수 있다           |

---

## 2. 서론 — 비동기로 해결할 수 없는 문제

Step 14에서 `async`/`await`와 `Stream`으로 비동기 I/O를 처리하는 법을 배웠습니다. 그런데 다음 작업을 생각해 보세요.

```dart
// 100만 개 아이템 정렬 — 순수 CPU 연산
List<int> sortMillion(List<int> data) {
  data.sort();
  return data;
}
```

이 함수를 `async`로 감싸도 **UI 프레임이 멈춥니다.** 왜일까요?

```
async/await는 I/O 대기를 비동기로 만들 뿐,
CPU 연산 자체를 다른 스레드에서 실행하지는 않습니다.

sortMillion()는 I/O 없음 → await할 것이 없음
→ Event Loop를 독점하며 실행
→ 다른 이벤트(UI 렌더링, 사용자 입력) 처리 불가
→ 앱이 멈춤(Jank)
```

**이것이 Isolate가 필요한 이유**입니다. Isolate는 **완전히 분리된 실행 환경**에서 CPU 작업을 병렬로 처리합니다.

```
메인 Isolate:   UI 렌더링 + 사용자 입력 처리
워커 Isolate:   CPU 집약적 연산 (정렬, 이미지 처리, JSON 파싱)
                ↑ 동시에 실행 ↑
```

> **전제 지식**: Step 14 완료 (Future, async/await, Stream, Event Loop)

---

## 3. Isolate 기본 개념

### 3.1 Isolate란

Isolate는 Dart에서 **진정한 병렬 실행 단위**입니다.

<div data-diagram="isolate-arch" data-steps="3" data-alt="Isolate 메모리 아키텍처" data-descriptions="메인 Isolate가 자체 힙 메모리와 Event Loop를 가지고 실행됩니다|워커 Isolate는 독립된 힙 메모리와 Event Loop를 가집니다|두 Isolate 간에는 메시지 패싱(값 복사)으로만 데이터를 교환합니다"></div>

**Isolate의 핵심 특성**

```
1. 독립된 힙 메모리  — 메모리를 공유하지 않음
2. 독립된 Event Loop — 각자의 스케줄러
3. 메시지 패싱 통신  — 데이터는 복사해서 전달
4. 진정한 병렬 실행  — OS 스레드에서 동시 실행
```

---

### 3.2 메모리 격리와 메시지 패싱

```
Java/Python 스레드 방식:
  스레드 A ──────────► 공유 메모리 ◄────────── 스레드 B
                        (Lock 필요, Race Condition 위험)

Dart Isolate 방식:
  Isolate A (힙 A) ──복사──► 메시지 큐 ──복사──► Isolate B (힙 B)
                              (공유 없음, Race Condition 불가능)
```

**값 복사의 의미**

```dart
// 메인 Isolate에서 워커로 List를 전달할 때
List<int> bigList = List.generate(1000000, (i) => i);

// 이 데이터는 복사되어 워커 Isolate의 힙으로 전달됨
// 메인과 워커가 동일한 List 객체를 참조하지 않음
// → 워커에서 변경해도 메인에 영향 없음
// → 락(Lock) 불필요, Race Condition 불가
```

---

### 3.3 언제 Isolate가 필요한가

```
✅ Isolate가 필요한 작업 (CPU 집약적)
  - 대용량 JSON/XML 파싱 (수 MB 이상)
  - 이미지/오디오/비디오 처리
  - 암호화/복호화 (RSA, AES)
  - 대규모 정렬, 검색 알고리즘
  - 머신러닝 추론 (on-device)
  - 복잡한 수학 연산

❌ Isolate 불필요 (I/O 바운드)
  - HTTP 요청 / 응답 대기
  - 파일 읽기 / 쓰기
  - 데이터베이스 쿼리
  - 사용자 입력 대기
  → async/await + Dart의 비동기 I/O로 충분
```

---

## 4. `Isolate.run` — 가장 간단한 병렬 실행

Dart 2.19+에서 추가된 `Isolate.run`은 **한 번 실행하고 결과를 반환하는 가장 간단한 Isolate API**입니다.

```dart
import 'dart:isolate';

// CPU 집약적 함수
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

String processLargeData(List<int> data) {
  // 정렬 + 통계 계산 시뮬레이션
  final sorted = [...data]..sort();
  final sum    = sorted.fold(0, (a, b) => a + b);
  final avg    = sum / sorted.length;
  return '합계: $sum, 평균: ${avg.toStringAsFixed(2)}, 최대: ${sorted.last}';
}

void main() async {
  print('메인 시작');

  // Isolate.run — 워커 Isolate에서 실행, 결과 Future로 반환
  final result = await Isolate.run(() => fibonacci(45));
  print('fibonacci(45) = $result');

  // 데이터 처리
  final data = List.generate(1000000, (i) => i % 1000);
  final stats = await Isolate.run(() => processLargeData(data));
  print(stats);

  print('메인 계속 실행');
}
```

**Isolate.run 동작 원리**

```
1. 새 Isolate 생성
2. 함수와 인수를 복사해 전달
3. 워커 Isolate에서 함수 실행 (CPU 병렬)
4. 결과를 복사해 메인으로 전달
5. 워커 Isolate 자동 종료
6. 메인의 Future 완료
```

**UI 블로킹 방지 시연**

```dart
void main() async {
  final sw = Stopwatch()..start();

  // UI 렌더링 시뮬레이션 — 16ms마다 프레임 출력
  final uiTimer = Stream.periodic(
    Duration(milliseconds: 16),
    (tick) => tick,
  );
  final uiSub = uiTimer.listen((tick) {
    if (tick % 10 == 0) print('  [UI] 프레임 $tick 렌더링');
  });

  // CPU 집약적 작업을 Isolate에서 실행
  final result = await Isolate.run(() => fibonacci(43));
  print('결과: $result (${sw.elapsedMilliseconds}ms)');

  await uiSub.cancel();
  // → UI 프레임이 Isolate 실행 중에도 계속 출력됨 (블로킹 없음)
}
```

---

## 5. `Isolate.spawn` — 저수준 API

`Isolate.run`이 일회성 작업에 적합하다면, `Isolate.spawn`은 **장기 실행 Isolate를 세밀하게 제어**할 때 사용합니다.

### 5.1 기본 spawn 패턴

```dart
import 'dart:isolate';

// 워커 Isolate 진입점 — 반드시 top-level 함수 또는 static 메서드
void workerEntryPoint(SendPort sendPort) {
  print('워커 Isolate 시작');

  // 메인으로 메시지 전송
  sendPort.send('Hello from Worker!');
  sendPort.send(42);
  sendPort.send([1, 2, 3]);
}

void main() async {
  // 메인이 수신할 포트 생성
  final receivePort = ReceivePort();

  // Isolate 생성 — 진입점 함수와 SendPort 전달
  final isolate = await Isolate.spawn(
    workerEntryPoint,
    receivePort.sendPort,  // 워커가 메인으로 메시지를 보낼 포트
  );

  // 메시지 수신
  int messageCount = 0;
  await for (var message in receivePort) {
    print('메인 수신: $message (${message.runtimeType})');
    messageCount++;
    if (messageCount >= 3) break;  // 3개 받으면 종료
  }

  receivePort.close();
  isolate.kill();
  print('완료');

  // 출력:
  // 워커 Isolate 시작
  // 메인 수신: Hello from Worker! (String)
  // 메인 수신: 42 (int)
  // 메인 수신: [1, 2, 3] (List<int>)
  // 완료
}
```

---

### 5.2 SendPort / ReceivePort — 양방향 통신

실무에서는 메인 → 워커, 워커 → 메인 **양방향 통신**이 필요합니다.

```dart
import 'dart:isolate';

// 워커 Isolate 진입점 — SendPort로 워커의 ReceivePort를 메인에 전달
void workerEntryPoint(SendPort mainSendPort) async {
  // 워커의 수신 포트 생성
  final workerReceivePort = ReceivePort();

  // 메인에 워커의 SendPort 전달 (이제 메인 → 워커 통신 가능)
  mainSendPort.send(workerReceivePort.sendPort);

  // 메인의 메시지 대기
  await for (var message in workerReceivePort) {
    if (message == 'close') {
      print('워커: 종료 신호 수신');
      workerReceivePort.close();
      break;
    }

    // 메시지 처리 후 결과 반환
    if (message is int) {
      final result = fibonacci(message);
      mainSendPort.send({'input': message, 'result': result});
    }
  }
}

int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

void main() async {
  final mainReceivePort = ReceivePort();

  // 워커 생성
  final isolate = await Isolate.spawn(
    workerEntryPoint,
    mainReceivePort.sendPort,
  );

  final messages = mainReceivePort.asBroadcastStream();

  // 첫 메시지 = 워커의 SendPort
  final workerSendPort = await messages.first as SendPort;
  print('양방향 통신 채널 수립');

  // 메인 → 워커로 작업 전송
  for (int n in [35, 38, 40]) {
    workerSendPort.send(n);

    // 결과 수신
    final result = await messages.first as Map;
    print('fibonacci(${result['input']}) = ${result['result']}');
  }

  // 워커 종료
  workerSendPort.send('close');
  await Future.delayed(Duration(milliseconds: 100));

  mainReceivePort.close();
  isolate.kill(priority: Isolate.immediate);
  print('Isolate 종료');
}
```

**양방향 통신 흐름 시각화**

```
메인 Isolate                         워커 Isolate
─────────────                        ─────────────
ReceivePort(main) ──sendPort──►  진입점(mainSendPort)
                                       │
                  ◄──workerPort──  ReceivePort(worker)
                                       │
       send(35)  ──────────────►  fibonacci(35) 계산
                  ◄──결과(map)──  send(result)
```

---

### 5.3 장기 실행 Isolate 패턴 — IsolateWorker 클래스

매번 Isolate를 생성하는 오버헤드를 피하기 위해 **재사용 가능한 워커**를 설계합니다.

```dart
import 'dart:isolate';
import 'dart:async';

// 작업 요청 모델
class _Task {
  final int id;
  final dynamic payload;
  final SendPort replyPort;

  _Task(this.id, this.payload, this.replyPort);
}

// 재사용 가능한 Isolate 워커
class IsolateWorker {
  late Isolate _isolate;
  late SendPort _workerPort;
  final Map<int, Completer> _pending = {};
  int _nextId = 0;
  bool _ready = false;

  // 초기화 (async factory 패턴)
  static Future<IsolateWorker> create() async {
    final worker = IsolateWorker();
    await worker._init();
    return worker;
  }

  Future<void> _init() async {
    final mainPort = ReceivePort();
    _isolate = await Isolate.spawn(_workerEntryPoint, mainPort.sendPort);

    final messages = mainPort.asBroadcastStream();
    _workerPort = await messages.first as SendPort;
    _ready = true;

    // 워커 → 메인 결과 수신 루프
    messages.listen((message) {
      if (message is Map) {
        final id       = message['id'] as int;
        final result   = message['result'];
        final error    = message['error'];
        final completer = _pending.remove(id);
        if (error != null) {
          completer?.completeError(error);
        } else {
          completer?.complete(result);
        }
      }
    });
  }

  // 작업 전송 — Future로 결과 수신
  Future<T> compute<T>(dynamic payload) {
    if (!_ready) throw StateError('워커 초기화 안 됨');
    final id       = _nextId++;
    final completer = Completer<T>();
    _pending[id]   = completer;

    final replyPort = ReceivePort(); // 단순화를 위해 id 기반 매핑
    _workerPort.send({'id': id, 'payload': payload});

    return completer.future;
  }

  void dispose() {
    _isolate.kill(priority: Isolate.immediate);
    for (var c in _pending.values) {
      c.completeError(StateError('워커 종료됨'));
    }
    _pending.clear();
  }
}

// 워커 Isolate 진입점
void _workerEntryPoint(SendPort mainPort) async {
  final workerPort = ReceivePort();
  mainPort.send(workerPort.sendPort);

  await for (var message in workerPort) {
    if (message is! Map) continue;

    final id      = message['id'] as int;
    final payload = message['payload'];

    try {
      // 실제 작업 처리 (예: fibonacci)
      dynamic result;
      if (payload is int) {
        result = _heavyCompute(payload);
      }
      mainPort.send({'id': id, 'result': result});
    } catch (e) {
      mainPort.send({'id': id, 'error': e.toString()});
    }
  }
}

int _heavyCompute(int n) {
  // 시뮬레이션: n을 입력받아 fibonacci 계산
  int a = 0, b = 1;
  for (int i = 0; i < n; i++) {
    final t = a + b; a = b; b = t;
  }
  return a;
}

void main() async {
  final worker = await IsolateWorker.create();
  print('워커 준비 완료');

  // 병렬로 여러 작업 전송
  final results = await Future.wait([
    worker.compute<int>(40),
    worker.compute<int>(41),
    worker.compute<int>(42),
  ]);

  results.forEach(print);
  worker.dispose();
}
```

---

## 6. `compute` — Flutter 헬퍼 (개념)

Flutter 프레임워크는 `Isolate.run`과 유사한 `compute()` 함수를 제공합니다. 내부적으로 `Isolate.run`(또는 `Isolate.spawn`)을 사용하며, Flutter 환경에서 더 편리하게 사용할 수 있습니다.

```dart
// Flutter 환경 (참고 — Dart 전용 환경에서는 Isolate.run 사용)
// import 'package:flutter/foundation.dart';

// compute() 함수 시그니처 (개념)
// Future<R> compute<Q, R>(FutureOr<R> Function(Q) callback, Q message)

// 사용 예시 (Flutter)
// List<Photo> parsePhotos(String responseBody) {
//   final parsed = jsonDecode(responseBody) as List;
//   return parsed.map((j) => Photo.fromJson(j)).toList();
// }
//
// Future<List<Photo>> fetchPhotos(String url) async {
//   final response = await http.get(Uri.parse(url));
//   return compute(parsePhotos, response.body);  // 백그라운드에서 파싱
// }
```

**`Isolate.run` vs Flutter `compute` 비교**

| 특성      | `Isolate.run` | Flutter `compute`      |
| --------- | ------------- | ---------------------- |
| 사용 환경 | 순수 Dart     | Flutter                |
| API 버전  | Dart 2.19+    | Flutter 2.x+           |
| 기능      | 동일          | 동일 (내부적으로 유사) |
| Web 지원  | 제한적        | 자동 Web 대응          |

> 순수 Dart 환경에서는 `Isolate.run`을, Flutter에서는 `compute`를 사용하면 됩니다.

---

## 7. Isolate 간 전달 가능한 데이터 타입

Isolate 간 메시지는 **복사 가능한(Sendable) 타입**만 전달할 수 있습니다. 모든 타입이 가능한 것은 아닙니다.

```
✅ 전달 가능한 타입
  - null, bool, int, double, String
  - List, Map, Set (요소도 전달 가능한 타입이어야 함)
  - Uint8List 등 TypedData (효율적인 바이너리 전달)
  - SendPort
  - TransferableTypedData (零복사 전달 — 대용량 최적화)
  - 대부분의 단순 Dart 객체 (Dart 2.15+ — 복사 기반)

❌ 전달 불가능한 타입
  - ReceivePort
  - Socket, HttpClient 등 네이티브 리소스
  - 클로저 (일부 제한)
```

**대용량 데이터 효율적 전달 — `TransferableTypedData`**

```dart
import 'dart:isolate';
import 'dart:typed_data';

void workerWithTypedData(SendPort sendPort) {
  // 대용량 바이너리 데이터 생성
  final data = Uint8List.fromList(List.generate(1000000, (i) => i % 256));

  // TransferableTypedData — 소유권 이전 (복사 없음)
  sendPort.send(TransferableTypedData.fromList([data]));
}

void main() async {
  final port = ReceivePort();
  await Isolate.spawn(workerWithTypedData, port.sendPort);

  final transferable = await port.first as TransferableTypedData;
  final received = transferable.materialize().asUint8List();

  print('수신 크기: ${received.length} bytes');  // 1000000 bytes
  port.close();
}
```

---

## 8. Isolate Pool 패턴

여러 워커를 미리 생성해 작업을 분배하는 **스레드 풀과 유사한 패턴**입니다.

```dart
import 'dart:isolate';
import 'dart:async';
import 'dart:collection';

class IsolatePool {
  final int size;
  final List<_PoolWorker> _workers = [];
  final Queue<_PoolTask> _taskQueue = Queue();
  bool _disposed = false;

  IsolatePool(this.size);

  static Future<IsolatePool> create({int size = 4}) async {
    final pool = IsolatePool(size);
    for (int i = 0; i < size; i++) {
      final worker = await _PoolWorker.create(i);
      pool._workers.add(worker);
    }
    return pool;
  }

  Future<T> submit<T>(dynamic Function(dynamic) fn, dynamic arg) {
    if (_disposed) throw StateError('Pool 종료됨');

    final completer = Completer<T>();
    final task = _PoolTask(fn, arg, completer);

    // 유휴 워커 탐색
    final idleWorker = _workers.where((w) => !w.busy).firstOrNull;

    if (idleWorker != null) {
      idleWorker.execute(task);
    } else {
      _taskQueue.add(task);  // 대기열에 추가
    }

    return completer.future;
  }

  // 워커가 작업 완료 시 대기열에서 다음 작업 배정
  void _onWorkerIdle(_PoolWorker worker) {
    if (_taskQueue.isNotEmpty) {
      worker.execute(_taskQueue.removeFirst());
    }
  }

  void dispose() {
    _disposed = true;
    for (var w in _workers) w.dispose();
  }
}

class _PoolTask {
  final dynamic Function(dynamic) fn;
  final dynamic arg;
  final Completer completer;
  _PoolTask(this.fn, this.arg, this.completer);
}

class _PoolWorker {
  final int id;
  bool busy = false;
  late SendPort _port;
  late Isolate _isolate;

  _PoolWorker(this.id);

  static Future<_PoolWorker> create(int id) async {
    final worker = _PoolWorker(id);
    // 실제 구현에서는 Isolate.spawn으로 워커 생성
    // 간결함을 위해 초기화 로직 생략
    return worker;
  }

  void execute(_PoolTask task) {
    busy = true;
    // 실제: _port.send(task)
    // 결과 수신 시 task.completer.complete(result), busy = false
  }

  void dispose() {
    _isolate.kill(priority: Isolate.immediate);
  }
}

// ── 간단한 Pool 시뮬레이션 ──
void main() async {
  print('Isolate Pool 개념 시연');

  // 실용적인 형태: Isolate.run 여러 개 병렬 실행
  final tasks = List.generate(8, (i) => i + 30);

  final sw = Stopwatch()..start();

  // 최대 4개씩 병렬 처리 (배치)
  List<int> allResults = [];

  for (int batch = 0; batch < tasks.length; batch += 4) {
    final batchTasks = tasks.skip(batch).take(4).toList();

    final batchResults = await Future.wait(
      batchTasks.map((n) => Isolate.run(() {
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
          final t = a + b; a = b; b = t;
        }
        return a;
      })),
    );

    allResults.addAll(batchResults);
    print('배치 완료: fib(${batchTasks.first})~fib(${batchTasks.last})');
  }

  sw.stop();
  print('\n결과 (fib 30~37):');
  for (int i = 0; i < tasks.length; i++) {
    print('  fib(${tasks[i]}) = ${allResults[i]}');
  }
  print('총 소요: ${sw.elapsedMilliseconds}ms');
}
```

---

## 9. 비동기 vs Isolate — 선택 기준

```
작업의 특성으로 판단

  I/O 바운드 작업 (네트워크, 파일, DB)
  ├── 대기 시간이 대부분
  ├── CPU는 거의 사용하지 않음
  └── ✅ async/await 충분 — Isolate 불필요

  CPU 바운드 작업 (연산, 처리)
  ├── CPU를 오래 점유
  ├── 메인 스레드 블로킹 가능
  └── ✅ Isolate 사용 — 백그라운드 실행
```

**실제 판단 기준표**

| 작업                     | 종류 | 권장                                    |
| ------------------------ | ---- | --------------------------------------- |
| HTTP GET 요청            | I/O  | `async/await`                           |
| 파일 읽기/쓰기           | I/O  | `async/await`                           |
| DB 쿼리                  | I/O  | `async/await`                           |
| 5MB JSON 파싱            | CPU  | `Isolate.run`                           |
| 이미지 리사이즈          | CPU  | `Isolate.run`                           |
| 100만 행 정렬            | CPU  | `Isolate.run`                           |
| RSA 암호화               | CPU  | `Isolate.run`                           |
| WebSocket 수신           | I/O  | `Stream`                                |
| 작은 JSON 파싱 (< 100KB) | 혼합 | `async/await` (Isolate 오버헤드 > 이득) |

**Isolate 오버헤드 고려**

```
Isolate 생성 비용: ~수 ms (메모리 할당, 런타임 초기화)
메시지 직렬화/복사 비용: 데이터 크기에 비례

→ 작업이 짧으면(< 수 ms) Isolate 오버헤드가 더 클 수 있음
→ 반복되는 짧은 작업은 IsolatePool로 재사용

Isolate.run 사용 기준 (경험칙):
  작업 예상 시간 > 16ms (= 1 UI 프레임) 일 때 고려
```

---

## 10. 실습

> 💡 이론 검증용 최소 실습 | Dart CLI 환경 권장 (DartPad에서 Isolate 지원 제한)

### 실습 10-1: `Isolate.run` 블로킹 비교

아래 두 코드의 UI 시뮬레이션(주기적 출력) 동작 차이를 비교하고 이유를 설명하세요.

```dart
import 'dart:isolate';

int heavyWork(int n) {
  int result = 0;
  for (int i = 0; i < n * 1000000; i++) result += i;
  return result;
}

Future<void> withoutIsolate() async {
  // UI 시뮬레이션
  var tick = 0;
  Stream.periodic(Duration(milliseconds: 16)).listen((_) {
    print('  [UI] 프레임 ${tick++}');
  });

  // CPU 블로킹 — Isolate 없이 직접 실행
  print('연산 시작 (블로킹)');
  final result = heavyWork(100);  // 메인 스레드 블로킹
  print('결과: $result');
}

Future<void> withIsolate() async {
  var tick = 0;
  Stream.periodic(Duration(milliseconds: 16)).listen((_) {
    print('  [UI] 프레임 ${tick++}');
  });

  // Isolate에서 실행 — 메인 스레드 비블로킹
  print('연산 시작 (Isolate)');
  final result = await Isolate.run(() => heavyWork(100));
  print('결과: $result');
}

void main() async {
  // TODO: withoutIsolate()와 withIsolate() 각각 실행하고 UI 프레임 출력 비교
}
```

> **정답 힌트**
>
> `withoutIsolate()`: `heavyWork` 실행 중 Event Loop 블로킹 → UI 프레임이 연산 완료 후에야 출력됨.
>
> `withIsolate()`: `Isolate.run`이 워커 Isolate에서 실행 → 메인 Event Loop가 자유 → UI 프레임이 연산 중에도 계속 출력됨.

### 실습 10-2: 양방향 통신 Isolate 구현

아래 요구사항의 계산기 워커 Isolate를 구현하세요.

**요구사항**

- 메인 → 워커: `{'op': '+', 'a': 10, 'b': 5}` 형태의 Map 전송
- 워커 → 메인: `{'result': 15}` 형태로 결과 반환
- 지원 연산: `+`, `-`, `*`, `/`
- 양방향 `SendPort`/`ReceivePort` 사용

```dart
import 'dart:isolate';

// TODO: 워커 진입점 구현
void calculatorWorker(SendPort mainSendPort) { }

void main() async {
  // TODO: 메인 구현
  // 예상 출력:
  // 10 + 5 = 15
  // 20 - 8 = 12
  // 6 * 7 = 42
  // 15 / 4 = 3.75
}
```

> **정답 힌트**
>
> ```dart
> void calculatorWorker(SendPort mainSendPort) async {
>   final workerPort = ReceivePort();
>   mainSendPort.send(workerPort.sendPort);
>
>   await for (var msg in workerPort) {
>     if (msg == 'close') { workerPort.close(); break; }
>     if (msg is! Map) continue;
>
>     final op = msg['op'] as String;
>     final a  = (msg['a'] as num).toDouble();
>     final b  = (msg['b'] as num).toDouble();
>
>     final result = switch (op) {
>       '+'  => a + b,
>       '-'  => a - b,
>       '*'  => a * b,
>       '/'  => a / b,
>       _    => throw ArgumentError('알 수 없는 연산: $op'),
>     };
>
>     mainSendPort.send({'result': result});
>   }
> }
>
> void main() async {
>   final mainPort    = ReceivePort();
>   final isolate     = await Isolate.spawn(calculatorWorker, mainPort.sendPort);
>   final messages    = mainPort.asBroadcastStream();
>   final workerPort  = await messages.first as SendPort;
>
>   final ops = [
>     {'op': '+', 'a': 10, 'b': 5},
>     {'op': '-', 'a': 20, 'b': 8},
>     {'op': '*', 'a': 6,  'b': 7},
>     {'op': '/', 'a': 15, 'b': 4},
>   ];
>
>   for (var op in ops) {
>     workerPort.send(op);
>     final result = (await messages.first as Map)['result'];
>     print('${op['a']} ${op['op']} ${op['b']} = $result');
>   }
>
>   workerPort.send('close');
>   await Future.delayed(Duration(milliseconds: 100));
>   mainPort.close();
>   isolate.kill();
> }
> ```

### 실습 10-3: Isolate.run으로 JSON 파싱 최적화

아래 코드를 `Isolate.run`을 사용해 메인 스레드 블로킹 없이 실행하도록 수정하세요.

```dart
import 'dart:convert';

// 시뮬레이션: 대용량 JSON 파싱
List<Map<String, dynamic>> parseUsers(String jsonString) {
  final List<dynamic> raw = jsonDecode(jsonString);
  return raw.cast<Map<String, dynamic>>();
}

void main() async {
  // 대용량 JSON 생성 시뮬레이션
  final bigJson = jsonEncode(
    List.generate(100000, (i) => {'id': i, 'name': 'User_$i', 'score': i % 100}),
  );

  final sw = Stopwatch()..start();

  // TODO: parseUsers(bigJson)을 Isolate.run으로 실행
  // → 메인 스레드 블로킹 없이 파싱
  // → 결과 List<Map>의 길이와 소요 시간 출력
}
```

> **정답 힌트**
>
> ```dart
> final users = await Isolate.run(() => parseUsers(bigJson));
> sw.stop();
> print('파싱 완료: ${users.length}명, ${sw.elapsedMilliseconds}ms');
> ```

---

## 11. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                    | 핵심 내용                                   |
| ----------------------- | ------------------------------------------- |
| Isolate                 | 독립 힙 + 독립 Event Loop, 진정한 병렬 실행 |
| 메모리 격리             | 힙 공유 없음 → Race Condition 불가          |
| 메시지 패싱             | 값 복사 전달, `SendPort`/`ReceivePort`      |
| `Isolate.run`           | 일회성 병렬 작업 (Dart 2.19+, 가장 간단)    |
| `Isolate.spawn`         | 장기 실행, 세밀한 제어                      |
| `ReceivePort`           | 메시지 수신 포트 (`Stream<dynamic>` 제공)   |
| `SendPort`              | 메시지 발신 포트 (직렬화 가능)              |
| `Completer`             | Isolate 결과를 Future로 감쌈                |
| `TransferableTypedData` | 대용량 바이너리 零복사 전달                 |
| Isolate Pool            | 재사용 가능한 워커 배치 (오버헤드 절감)     |
| CPU vs I/O              | CPU 집약 → Isolate, I/O → async/await       |
| 오버헤드 기준           | 작업 시간 > 16ms일 때 Isolate 고려          |

### Phase 3 완료 체크리스트

- [ ] Step 11: Mixin으로 횡단 관심사를 분리하고 선형화 원리를 설명할 수 있다
- [ ] Step 12: 향상된 Enum으로 상태 머신을 구현하고 exhaustiveness check를 활용한다
- [ ] Step 13: 커스텀 예외 계층을 설계하고 비동기 예외를 처리할 수 있다
- [ ] Step 14: Future.wait/any, Stream, async\*, StreamController를 활용할 수 있다
- [ ] Step 15: Isolate.run으로 CPU 집약적 작업을 백그라운드에서 실행할 수 있다

### 🔗 다음 단계

> **Phase 4 — Step 16: 제네릭(Generics)**으로 이동하세요.

Step 16에서는 Dart 제네릭의 타입 안전성, 공변성/반공변성, 경계(bound) 설정, 제네릭 함수와 메서드를 학습합니다. 제네릭은 컬렉션, Repository, Result 패턴, Isolate Pool 등 지금까지 배운 모든 패턴을 타입 안전하게 일반화하는 핵심 도구입니다.

### 📚 참고 자료

| 자료                     | 링크                                                         |
| ------------------------ | ------------------------------------------------------------ |
| Dart Isolate 공식 문서   | <https://dart.dev/language/isolates>                           |
| Isolate API 레퍼런스     | <https://api.dart.dev/stable/dart-isolate/Isolate-class.html>  |
| Isolate.run 가이드       | <https://api.dart.dev/stable/dart-isolate/Isolate/run.html>    |
| SendPort / ReceivePort   | <https://api.dart.dev/stable/dart-isolate/SendPort-class.html> |
| Concurrency in Dart      | <https://dart.dev/language/concurrency>                        |
| DartPad (Isolate 제한됨) | <https://dartpad.dev>                                          |

### ❓ 자가진단 퀴즈

1. **[Remember]** `Isolate.run`과 `Isolate.spawn`의 사용 적합 상황 차이를 설명하라.
2. **[Remember]** Isolate 간 전달 불가능한 타입의 예시 두 가지와 그 이유를 설명하라.
3. **[Understand]** Dart Isolate가 Java 스레드와 달리 Lock이 필요 없는 이유를 메모리 모델 관점에서 설명하라.
4. **[Understand]** `Isolate.run(() => smallTask())`처럼 매우 짧은 작업에 Isolate를 사용하는 것이 오히려 느릴 수 있는 이유를 설명하라.
5. **[Apply]** 아래 코드가 메인 스레드를 블로킹하는지 판단하고, 블로킹한다면 `Isolate.run`으로 수정하라.

   ```dart
   Future<void> loadAndProcess() async {
     final response = await http.get(Uri.parse('https://api.example.com/data'));
     final parsed   = jsonDecode(response.body);  // ← 이 줄이 문제?
     final sorted   = (parsed as List)..sort();   // ← 이 줄이 문제?
     print(sorted.length);
   }
   ```

6. **[Analyze]** 동일한 CPU 집약적 작업을 (A) 단일 Isolate 1개, (B) Isolate 4개 병렬, (C) Isolate 100개 병렬로 실행할 때 성능이 어떻게 달라지는지 CPU 코어 수, 생성 오버헤드, 컨텍스트 스위칭 관점에서 분석하라.

> **5번 정답 힌트**
>
> `http.get`과 `await`는 I/O 바운드 → 블로킹 없음.
> `jsonDecode`는 응답 크기에 따라 CPU 집약 가능 → 수 MB 이상이면 Isolate 고려.
> `sort()`는 리스트 크기에 따라 — 수십만 건 이상이면 Isolate 고려.
>
> ```dart
> Future<void> loadAndProcess() async {
>   final response = await http.get(Uri.parse('https://api.example.com/data'));
>   // 대용량이면 Isolate로 분리
>   final result = await Isolate.run(() {
>     final parsed = jsonDecode(response.body) as List;
>     parsed.sort();
>     return parsed.length;
>   });
>   print(result);
> }
> ```

> **6번 정답 힌트**
>
> (A) 단일 Isolate: 한 CPU 코어만 사용. 나머지 코어 낭비.
> (B) 4개 Isolate: 4코어 CPU에서 이론상 4배 빠름. 생성 오버헤드 4배지만 작업 시간 대비 무시 가능. 최적에 가까움.
> (C) 100개 Isolate: 4코어에서 100개는 과잉. Isolate 생성 오버헤드(각 수ms) 100배, 컨텍스트 스위칭 증가. CPU 코어 수에 맞춘 Pool 크기(보통 코어 수 = 최적)가 효율적.

---

> ⬅️ [Step 14 — 비동기 프로그래밍 심화](#) | ➡️ [Step 16 — 제네릭(Generics) →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Isolates, Concurrency) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
