# Step 16 — Future / Async UI

> **파트:** 5️⃣ 비동기 및 데이터 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** FutureBuilder가 Future의 3가지 상태(waiting·done·error)를 UI에 연결하는 원리를 설명할 수 있다.
2. **[Understand]** StreamBuilder가 Stream의 연속적인 데이터를 UI에 반영하는 원리를 설명할 수 있다.
3. **[Understand]** FutureBuilder의 재빌드 문제(rebuild 시 Future 재생성)를 설명하고 해결책을 제시할 수 있다.
4. **[Apply]** FutureBuilder로 API 데이터 로딩·로딩중·에러 화면을 구현할 수 있다.
5. **[Apply]** StreamBuilder로 실시간 데이터(타이머, 소켓 등)를 UI에 반영할 수 있다.
6. **[Analyze]** FutureBuilder와 상태관리 솔루션(Provider·Riverpod) 중 상황에 맞는 것을 선택할 수 있다.

**전제 지식:** Step 02(Future·Stream·async/await), Step 05(StatefulWidget), Step 13(rebuild 메커니즘)

---

## 1. 서론

### 1.1 비동기 데이터와 UI의 연결 문제

앱은 대부분 서버에서 데이터를 받아 화면에 표시한다. 그런데 데이터를 가져오는 데 시간이 걸리기 때문에, 그 사이 UI는 어떻게 보여야 하는가?

![데이터 로딩의 3가지 상태](/developer-open-book/diagrams/flutter-step16-data-loading-states.svg)

이 세 가지 상태를 Flutter의 위젯 트리와 자연스럽게 연결하는 도구가 `FutureBuilder`와 `StreamBuilder`다.

### 1.2 FutureBuilder vs StreamBuilder vs 상태관리

![FutureBuilder vs StreamBuilder vs 상태관리 선택 가이드](/developer-open-book/diagrams/flutter-step16-builder-selection.svg)

### 1.3 전체 개념 지도

![Async UI hierarchy](/developer-open-book/diagrams/step16-async-ui.svg)

---

## 2. 기본 개념과 용어

| 용어                        | 정의                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| **FutureBuilder**           | Future의 완료 상태에 따라 다른 UI를 반환하는 위젯                   |
| **StreamBuilder**           | Stream의 최신 값에 따라 UI를 갱신하는 위젯                          |
| **AsyncSnapshot**           | FutureBuilder·StreamBuilder가 builder에 전달하는 비동기 상태 스냅샷 |
| **ConnectionState**         | 비동기 연결 상태. none·waiting·active·done 4가지                    |
| **ConnectionState.waiting** | Future/Stream이 아직 완료되지 않은 대기 상태                        |
| **ConnectionState.done**    | Future가 완료된 상태 (성공 또는 에러)                               |
| **ConnectionState.active**  | Stream이 데이터를 방출 중인 상태                                    |
| **snapshot.hasData**        | 스냅샷에 데이터가 있는지 여부 (`data != null`)                      |
| **snapshot.hasError**       | 스냅샷에 에러가 있는지 여부                                         |
| **snapshot.data**           | 완료된 Future 또는 최신 Stream 값                                   |
| **snapshot.error**          | 발생한 에러 객체                                                    |
| **initialData**             | StreamBuilder에서 첫 데이터가 오기 전 표시할 기본값                 |
| **StreamController**        | Stream을 프로그래밍 방식으로 생성하고 데이터를 추가하는 컨트롤러    |
| **broadcast Stream**        | 여러 리스너가 동시에 구독 가능한 Stream                             |

---

## 3. 이론적 배경과 원리 ★

### 3.1 FutureBuilder 동작 원리

`FutureBuilder`는 내부적으로 `StatefulWidget`이다. Future의 상태 변화를 감지해 `setState()`를 호출하여 builder를 재실행한다.

![FutureBuilder 내부 동작 flow](/developer-open-book/diagrams/step16-futurebuilder-flow.svg)

```dart
FutureBuilder<User>(
  future: _fetchUser(),          // 구독할 Future
  builder: (context, snapshot) {
    // ConnectionState로 상태 분기
    switch (snapshot.connectionState) {
      case ConnectionState.waiting:
        return const Center(child: CircularProgressIndicator());
      case ConnectionState.done:
        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('오류: ${snapshot.error}'),
                ElevatedButton(
                  onPressed: () => setState(() {}),  // 재시도
                  child: const Text('다시 시도'),
                ),
              ],
            ),
          );
        }
        final user = snapshot.data!;
        return UserProfileCard(user: user);
      default:
        return const SizedBox.shrink();
    }
  },
)
```

**더 간결한 패턴:**

```dart
FutureBuilder<List<Product>>(
  future: _loadProducts(),
  builder: (context, snapshot) {
    // 우선순위 순서로 분기: error → loading → data
    if (snapshot.hasError) {
      return ErrorView(message: snapshot.error.toString());
    }
    if (!snapshot.hasData) {
      return const LoadingView();
    }
    final products = snapshot.data!;
    return ProductGrid(products: products);
  },
)
```

---

### 3.2 FutureBuilder의 가장 흔한 함정: rebuild 시 Future 재생성

> ⚠️ **함정 주의:** 이것이 FutureBuilder에서 가장 많이 발생하는 버그다.

```dart
// ❌ 문제: build()마다 새 Future 생성 → 매번 API 재호출!
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: ProductService().fetchAll(),  // build()마다 새 Future!
      builder: (_, snapshot) => ...,
    );
  }
}

// 부모 위젯이 setState를 호출하면 ProductPage.build()가 재실행되고
// 새 Future가 생성되어 API를 또 호출한다!
```

**해결책 1: State에 Future를 저장 (StatefulWidget)**

```dart
class ProductPage extends StatefulWidget {
  const ProductPage({super.key});
  @override
  State<ProductPage> createState() => _ProductPageState();
}

class _ProductPageState extends State<ProductPage> {
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    // initState에서 한 번만 생성 → rebuild해도 동일 Future 재사용
    _productsFuture = ProductService().fetchAll();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: _productsFuture,   // 저장된 Future 사용
      builder: (_, snapshot) => ...,
    );
  }
}
```

**해결책 2: Riverpod AsyncNotifierProvider (권장)**

```dart
// 상태관리 솔루션을 사용하면 이 문제 자체가 없어짐
final productsProvider = AsyncNotifierProvider<ProductsNotifier, List<Product>>(
  ProductsNotifier.new,
);
```

---

### 3.3 ConnectionState 전체 흐름

![ConnectionState 값과 의미](/developer-open-book/diagrams/flutter-step16-connection-state.svg)

---

### 3.4 StreamBuilder 동작 원리

`StreamBuilder`는 Stream을 구독하고, 새 이벤트가 방출될 때마다 `builder`를 재호출해 UI를 갱신한다.

```dart
StreamBuilder<int>(
  stream: _timerStream(),        // 구독할 Stream
  initialData: 0,                // 첫 이벤트 전 기본값
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Text('시작 중...');
    }
    if (snapshot.hasError) {
      return Text('오류: ${snapshot.error}');
    }
    // snapshot.data: 최신 스트림 값
    return Text('${snapshot.data}초',
        style: const TextStyle(fontSize: 48));
  },
)

// 1초마다 카운트 올라가는 Stream
Stream<int> _timerStream() async* {
  int count = 0;
  while (true) {
    yield count++;
    await Future.delayed(const Duration(seconds: 1));
  }
}
```

---

### 3.5 StreamController로 커스텀 Stream 만들기

```dart
class _LiveDataState extends State<LiveDataWidget> {
  final _controller = StreamController<double>();

  @override
  void initState() {
    super.initState();
    _startDataFeed();
  }

  void _startDataFeed() {
    Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      // 랜덤 센서 데이터 시뮬레이션
      _controller.add(Random().nextDouble() * 100);
    });
  }

  @override
  void dispose() {
    _controller.close();   // ✅ 반드시 닫기
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<double>(
      stream: _controller.stream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const CircularProgressIndicator();
        final value = snapshot.data!;
        return Column(
          children: [
            Text('센서값: ${value.toStringAsFixed(1)}',
                style: const TextStyle(fontSize: 24)),
            LinearProgressIndicator(value: value / 100),
          ],
        );
      },
    );
  }
}
```

> ⚠️ **함정 주의:** `StreamController`는 반드시 `dispose()`에서 `close()`를 호출해야 한다. 닫지 않으면 메모리 누수가 발생하고 Flutter가 경고를 출력한다.

---

### 3.6 실전 패턴: 로딩/에러/데이터 공통 래퍼

반복되는 로딩·에러 처리를 재사용 가능한 위젯으로 추출하는 패턴이다.

```dart
// 재사용 가능한 AsyncWidget
class AsyncWidget<T> extends StatelessWidget {
  final Future<T> future;
  final Widget Function(T data) onData;
  final Widget? loadingWidget;
  final Widget Function(Object error)? onError;

  const AsyncWidget({
    super.key,
    required this.future,
    required this.onData,
    this.loadingWidget,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return onError?.call(snapshot.error!) ??
              Center(child: Text('오류: ${snapshot.error}'));
        }
        if (!snapshot.hasData) {
          return loadingWidget ??
              const Center(child: CircularProgressIndicator());
        }
        return onData(snapshot.data as T);
      },
    );
  }
}

// 사용
AsyncWidget<User>(
  future: _userFuture,
  onData: (user) => UserProfileCard(user: user),
  onError: (e) => ErrorView(message: e.toString()),
)
```

---

### 3.7 FutureBuilder vs StreamBuilder 선택 기준

| 항목        | FutureBuilder        | StreamBuilder                 |
| ----------- | -------------------- | ----------------------------- |
| 데이터 특성 | 한 번 완료되는 결과  | 연속적으로 방출되는 데이터    |
| 사용 예     | HTTP 요청, 파일 읽기 | 채팅, 타이머, WebSocket, 센서 |
| 완료 여부   | 한 번 완료 후 끝     | 구독 해제 전까지 계속         |
| 상태 수     | waiting → done       | waiting → active (반복)       |
| 재시도      | future를 새로 생성   | stream을 새로 구독            |

---

## 4. 사례 연구

### 4.1 뉴스 피드: FutureBuilder로 초기 로딩

```dart
class NewsPage extends StatefulWidget {
  const NewsPage({super.key});
  @override
  State<NewsPage> createState() => _NewsPageState();
}

class _NewsPageState extends State<NewsPage> {
  late Future<List<Article>> _articlesFuture;

  @override
  void initState() {
    super.initState();
    _articlesFuture = NewsApi().fetchTopHeadlines();
  }

  Future<void> _refresh() async {
    setState(() {
      _articlesFuture = NewsApi().fetchTopHeadlines();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('뉴스')),
      body: FutureBuilder<List<Article>>(
        future: _articlesFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 8),
                  Text('${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _refresh,
                    icon: const Icon(Icons.refresh),
                    label: const Text('다시 시도'),
                  ),
                ],
              ),
            );
          }
          if (!snapshot.hasData) {
            return ListView.builder(
              itemCount: 5,
              itemBuilder: (_, __) => const ArticleShimmer(), // 스켈레톤
            );
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (_, i) => ArticleCard(article: snapshot.data![i]),
            ),
          );
        },
      ),
    );
  }
}
```

---

### 4.2 실시간 주식 가격: StreamBuilder

```dart
class StockTicker extends StatelessWidget {
  final String symbol;
  const StockTicker({super.key, required this.symbol});

  Stream<double> _priceStream() {
    // 실제로는 WebSocket 연결
    return Stream.periodic(
      const Duration(seconds: 1),
      (_) => 50000 + Random().nextInt(2000) - 1000,
    ).map((v) => v.toDouble());
  }

  @override
  Widget build(BuildContext context) {
    double? _lastPrice;

    return StreamBuilder<double>(
      stream: _priceStream(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const CircularProgressIndicator();
        }
        final price = snapshot.data!;
        final isUp = _lastPrice == null || price >= _lastPrice!;
        _lastPrice = price;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isUp ? Colors.green.shade50 : Colors.red.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(symbol,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Icon(
                isUp ? Icons.arrow_upward : Icons.arrow_downward,
                color: isUp ? Colors.green : Colors.red,
                size: 16,
              ),
              Text(
                '₩${price.toStringAsFixed(0)}',
                style: TextStyle(
                  color: isUp ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
```

---

### 4.3 채팅 메시지: StreamBuilder + Firebase

```dart
class ChatScreen extends StatefulWidget {
  final String roomId;
  const ChatScreen({super.key, required this.roomId});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _scrollController = ScrollController();

  Stream<List<Message>> _messagesStream() {
    // 실제로는 Firebase Firestore Stream
    return Stream.periodic(const Duration(seconds: 3)).map((_) =>
      [Message(text: '안녕하세요', sender: '상대방', time: DateTime.now())]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamBuilder<List<Message>>(
        stream: _messagesStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final messages = snapshot.data ?? [];
          return ListView.builder(
            controller: _scrollController,
            reverse: true,            // 최신 메시지가 아래에
            itemCount: messages.length,
            itemBuilder: (_, i) => MessageBubble(message: messages[i]),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
```

---

## 5. 실습

### 5.1 FutureBuilder 로딩 화면 구현

```dart
import 'dart:math';
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: UserProfilePage()));

// 가짜 유저 모델
class User {
  final String name;
  final String email;
  final int followers;
  const User({required this.name, required this.email, required this.followers});
}

// 가짜 API 호출 (2초 지연)
Future<User> fetchUser({bool shouldFail = false}) async {
  await Future.delayed(const Duration(seconds: 2));
  if (shouldFail) throw Exception('네트워크 오류');
  return const User(name: '김플러터', email: 'flutter@dev.kr', followers: 1024);
}

class UserProfilePage extends StatefulWidget {
  const UserProfilePage({super.key});
  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  late Future<User> _userFuture;
  bool _simulateError = false;

  @override
  void initState() {
    super.initState();
    _userFuture = fetchUser(shouldFail: _simulateError);
  }

  void _retry() {
    setState(() {
      _userFuture = fetchUser(shouldFail: _simulateError);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('프로필'),
        actions: [
          // 에러 시뮬레이션 토글
          IconButton(
            icon: Icon(_simulateError ? Icons.wifi_off : Icons.wifi),
            onPressed: () {
              setState(() {
                _simulateError = !_simulateError;
                _userFuture = fetchUser(shouldFail: _simulateError);
              });
            },
          ),
        ],
      ),
      body: FutureBuilder<User>(
        future: _userFuture,
        builder: (context, snapshot) {
          // 에러 상태
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline,
                      size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('${snapshot.error}',
                      style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed: _retry,
                    icon: const Icon(Icons.refresh),
                    label: const Text('다시 시도'),
                  ),
                ],
              ),
            );
          }
          // 로딩 상태
          if (!snapshot.hasData) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('프로필 불러오는 중...'),
                ],
              ),
            );
          }
          // 데이터 상태
          final user = snapshot.data!;
          return Center(
            child: Card(
              margin: const EdgeInsets.all(24),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: Text(user.name[0],
                          style: const TextStyle(
                              fontSize: 32, color: Colors.white)),
                    ),
                    const SizedBox(height: 16),
                    Text(user.name,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(user.email,
                        style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 12),
                    Text('팔로워 ${user.followers}명',
                        style: const TextStyle(fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
```

**확인 포인트:**

- 앱 시작 시 2초간 로딩 화면이 표시되는가?
- WiFi 아이콘을 탭해 에러 모드로 전환 시 에러 화면이 표시되는가?
- "다시 시도" 버튼을 누르면 Future가 새로 실행되는가?
- `setState(() { _userFuture = ... })`가 rebuild를 트리거하지만 이전 Future가 재실행되지 않는 이유는?

---

### 5.2 StreamBuilder 실시간 타이머

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: TimerPage()));

class TimerPage extends StatefulWidget {
  const TimerPage({super.key});
  @override
  State<TimerPage> createState() => _TimerPageState();
}

class _TimerPageState extends State<TimerPage> {
  bool _running = false;
  Stream<int>? _timerStream;
  int _elapsed = 0;

  Stream<int> _buildStream() async* {
    while (_running) {
      yield _elapsed++;
      await Future.delayed(const Duration(seconds: 1));
    }
  }

  void _start() {
    setState(() {
      _running = true;
      _timerStream = _buildStream();
    });
  }

  void _pause() => setState(() => _running = false);

  void _reset() {
    setState(() {
      _running = false;
      _elapsed = 0;
      _timerStream = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('타이머')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            StreamBuilder<int>(
              stream: _timerStream ?? const Stream.empty(),
              initialData: _elapsed,
              builder: (context, snapshot) {
                final secs = snapshot.data ?? 0;
                final m = secs ~/ 60;
                final s = secs % 60;
                return Text(
                  '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}',
                  style: const TextStyle(
                      fontSize: 72, fontWeight: FontWeight.bold,
                      fontFeatures: [FontFeature.tabularFigures()]),
                );
              },
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FilledButton(
                  onPressed: _running ? _pause : _start,
                  child: Text(_running ? '일시정지' : '시작'),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: _reset,
                  child: const Text('리셋'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** FutureBuilder에서 `snapshot.connectionState == ConnectionState.done`이고 `snapshot.hasError == false`라면 어떤 상태인가?

- A) 아직 로딩 중
- B) Future가 취소됨
- C) **Future가 성공적으로 완료되어 데이터가 있음** ✅
- D) 네트워크 연결 없음

---

**Q2. [Understand]** 다음 코드의 문제점은?

```dart
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: ApiService().loadProducts(),  // ← 문제!
      builder: (_, snap) => ...,
    );
  }
}
```

> **모범 답안:** `build()`가 호출될 때마다 `ApiService().loadProducts()`가 새로 실행되어 매번 새 API 요청이 발생한다. 부모 위젯이 rebuild될 때마다 API를 반복 호출하는 버그가 생긴다. `StatefulWidget`으로 변경하고 `initState()`에서 Future를 한 번만 생성해 `late Future _future`에 저장한 뒤, `FutureBuilder`에 저장된 `_future`를 전달해야 한다.

---

**Q3. [Understand]** StreamController를 `dispose()`에서 반드시 `close()`해야 하는 이유는?

> **모범 답안:** `StreamController`는 내부적으로 Stream 구독 상태, 버퍼, 리스너 등 리소스를 관리한다. `close()`를 호출하지 않으면 이 리소스들이 해제되지 않아 메모리 누수가 발생한다. 또한 Flutter가 "A StreamController was garbage collected while still having a subscriber" 경고를 출력한다.

---

**Q4. [Apply]** `FutureBuilder`에서 데이터 로딩 중에는 스켈레톤 UI를, 에러 시에는 재시도 버튼을, 성공 시에는 ListView를 표시하는 builder 함수를 작성하라.

```dart
// 모범 답안
builder: (context, snapshot) {
  if (snapshot.hasError) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('오류: ${snapshot.error}'),
          ElevatedButton(
            onPressed: _retry,
            child: const Text('다시 시도'),
          ),
        ],
      ),
    );
  }
  if (!snapshot.hasData) {
    return const SkeletonListView();  // 스켈레톤 UI
  }
  return ListView.builder(
    itemCount: snapshot.data!.length,
    itemBuilder: (_, i) => ListTile(title: Text(snapshot.data![i].name)),
  );
},
```

---

**Q5. [Analyze]** 다음 중 StreamBuilder보다 FutureBuilder를 선택해야 하는 상황은?

- A) 실시간 채팅 메시지 표시
- B) 주식 가격 실시간 업데이트
- C) WebSocket으로 받는 IoT 센서 데이터
- D) **앱 시작 시 서버에서 사용자 설정을 한 번 불러오는 경우** ✅

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **FutureBuilder**는 Future의 `waiting·done(성공/에러)` 상태를 UI와 연결한다. `snapshot.hasError`→`snapshot.hasData` 순서로 분기한다.
- **FutureBuilder의 가장 흔한 버그**: `build()` 안에서 Future를 직접 생성하면 매 rebuild마다 새 요청이 발생한다. `initState()`에서 한 번만 생성해 저장해야 한다.
- **StreamBuilder**는 Stream의 최신 값이 방출될 때마다 builder를 재호출해 UI를 갱신한다. 실시간 데이터에 적합하다.
- **StreamController**는 `dispose()`에서 반드시 `close()`해야 한다.
- **선택 기준**: 일회성 비동기 결과 → FutureBuilder, 연속 데이터 → StreamBuilder, 여러 화면 공유·캐싱 필요 → Provider/Riverpod.

### 6.2 다음 Step 예고

- **Step 17 — HTTP 통신:** Dio를 활용한 REST API 요청, JSON 파싱, 에러 핸들링, 인터셉터 패턴, 그리고 GraphQL 기초(ferry·gql)를 학습한다.

### 6.3 참고 자료

| 자료                          | 링크                                                               | 설명                    |
| ----------------------------- | ------------------------------------------------------------------ | ----------------------- |
| FutureBuilder 공식 문서       | <https://api.flutter.dev/flutter/widgets/FutureBuilder-class.html>   | API 레퍼런스            |
| StreamBuilder 공식 문서       | <https://api.flutter.dev/flutter/widgets/StreamBuilder-class.html>   | API 레퍼런스            |
| AsyncSnapshot API             | <https://api.flutter.dev/flutter/widgets/AsyncSnapshot-class.html>   | 스냅샷 상세             |
| Flutter Cookbook — Fetch data | <https://docs.flutter.dev/cookbook/networking/fetch-data>            | 공식 데이터 로딩 가이드 |
| StreamController API          | <https://api.dart.dev/stable/dart-async/StreamController-class.html> | Dart Stream 제어        |

### 6.4 FAQ

**Q. `snapshot.data`가 null인데 `snapshot.hasData`가 false가 아닌 경우가 있는가?**

> `hasData`는 `data != null`과 동일하다. Future가 `null`을 반환하는 경우 `connectionState == done`이지만 `hasData == false`가 된다. 이를 방지하려면 null이 아닌 타입을 사용하거나, `connectionState == ConnectionState.done && !snapshot.hasError`로 완료 여부를 명시적으로 확인한다.

**Q. FutureBuilder와 RefreshIndicator를 함께 사용하는 방법은?**

> `onRefresh` 콜백에서 `setState(() { _future = newFuture(); })`를 호출한다. 새 Future가 할당되면 FutureBuilder가 다시 `waiting` 상태로 진입해 로딩 UI를 표시하고, 완료 후 새 데이터로 UI를 갱신한다. 단, RefreshIndicator는 `ListView`·`GridView` 등 스크롤 가능한 위젯을 자식으로 가져야 동작한다.

**Q. StreamBuilder에서 `initialData`를 설정하면 어떤 이점이 있는가?**

> 첫 번째 Stream 이벤트가 도착하기 전에 `waiting` 상태 대신 `initialData`로 즉시 UI를 표시할 수 있다. 예를 들어 타이머를 0부터 시작하거나, 이전에 캐시된 값을 먼저 보여주고 새 데이터로 갱신하는 패턴에 유용하다.

---

## 빠른 자가진단 체크리스트

- [ ] FutureBuilder의 ConnectionState 흐름(none→waiting→done)을 설명할 수 있는가?
- [ ] snapshot.hasError → snapshot.hasData 순서로 분기하는 이유를 설명할 수 있는가?
- [ ] build() 안에서 Future를 직접 생성하면 안 되는 이유와 해결책을 설명할 수 있는가?
- [ ] StreamBuilder가 FutureBuilder와 다른 점을 설명할 수 있는가?
- [ ] StreamController를 close()해야 하는 이유를 설명할 수 있는가?
- [ ] FutureBuilder와 상태관리(Riverpod) 중 어떤 상황에 각각을 선택하는지 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: StatelessWidget의 build()에서 FutureBuilder에 직접 Future를 생성해 전달하면 매 rebuild마다 API가 재호출된다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: StreamController의 dispose() 미구현으로 인한 메모리 누수를 방지하는 방법을 알고 있는가?
