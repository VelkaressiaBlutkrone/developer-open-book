# Step 25 — 메모리 관리

> **파트:** 8️⃣ 성능 최적화 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Flutter 앱에서 메모리 누수가 발생하는 주요 원인 패턴을 설명할 수 있다.
2. **[Understand]** `dispose()`가 호출되는 시점과 반드시 해제해야 하는 리소스 종류를 설명할 수 있다.
3. **[Understand]** Isolate가 메모리를 공유하지 않는 구조가 메모리 관리에 미치는 영향을 설명할 수 있다.
4. **[Apply]** AnimationController·TextEditingController·StreamSubscription·FocusNode 등 주요 리소스를 올바르게 초기화하고 해제할 수 있다.
5. **[Apply]** Flutter DevTools의 Memory 탭으로 메모리 누수를 진단할 수 있다.
6. **[Evaluate]** 주어진 코드에서 메모리 누수 패턴을 찾아 수정할 수 있다.

**전제 지식:** Step 05(StatefulWidget·Lifecycle·dispose), Step 19(AnimationController), Step 24(DevTools 활용)

---

## 1. 서론

### 1.1 메모리 누수가 앱에 미치는 영향

```
메모리 누수의 증상
──────────────────────────────────────────────────────
  ① 앱 사용 시간이 길어질수록 메모리 사용량 증가
  ② 결국 OOM(Out Of Memory) → 앱 강제 종료
  ③ 화면 전환이 느려짐 (GC 압박)
  ④ 배터리 소모 증가 (불필요한 작업 지속)
  ⑤ Flutter 경고:
     "A X was disposed after it had been used"
     "setState() called after dispose()"
──────────────────────────────────────────────────────
```

### 1.2 Flutter 메모리 관리 기본 원칙

```
Dart의 메모리 관리
──────────────────────────────────────────────────────
  Dart는 가비지 컬렉터(GC) 사용
  → 참조가 없어진 객체는 자동 해제

  그런데 메모리 누수가 발생하는 이유?
  → 객체에 대한 참조가 의도치 않게 유지되기 때문

  주요 원인:
  ① 리스너·구독이 해제되지 않음
     → 리스너가 객체를 참조 → GC 대상 아님
  ② 컨트롤러가 dispose되지 않음
     → 내부 리소스가 계속 살아있음
  ③ Isolate가 종료되지 않음
     → 별도 메모리 공간 계속 점유
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

```
Flutter 메모리 관리
    │
    ├── dispose() 패턴
    │     ├── AnimationController.dispose()
    │     ├── TextEditingController.dispose()
    │     ├── ScrollController.dispose()
    │     ├── FocusNode.dispose()
    │     ├── StreamSubscription.cancel()
    │     └── ValueNotifier.dispose()
    │
    ├── 메모리 누수 패턴
    │     ├── dispose() 후 setState() 호출
    │     ├── Stream 구독 미해제
    │     ├── Timer 미취소
    │     └── Isolate 미종료
    │
    └── 진단 도구
          ├── DevTools Memory 탭
          ├── flutter logs (경고 메시지)
          └── dart:developer (Timeline)
```

---

## 2. 기본 개념과 용어

| 용어                       | 정의                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **메모리 누수**            | 더 이상 필요하지 않은 객체가 GC에 의해 해제되지 않고 메모리에 남아있는 현상          |
| **GC (Garbage Collector)** | 참조되지 않는 객체를 자동으로 메모리에서 해제하는 Dart 런타임 기능                   |
| **dispose()**              | State·컨트롤러 등이 소멸될 때 리소스를 해제하는 메서드. 반드시 super.dispose() 포함  |
| **mounted**                | State가 현재 위젯 트리에 연결되어 있는지를 나타내는 bool. dispose 후 false           |
| **StreamSubscription**     | Stream을 구독할 때 반환되는 객체. cancel()로 구독 해제                               |
| **Timer**                  | 지연·반복 실행을 예약하는 객체. cancel()로 취소                                      |
| **Isolate**                | Dart의 독립 실행 환경. 별도 메모리 공간을 갖고 main Isolate와 메모리를 공유하지 않음 |
| **ReceivePort**            | Isolate 간 메시지를 수신하는 포트. close()로 반드시 닫아야 함                        |
| **weak reference**         | GC가 객체를 해제하는 것을 막지 않는 참조. Dart의 `WeakReference<T>`                  |
| **OOM**                    | Out Of Memory. 사용 가능한 메모리를 모두 소진한 상태. 앱이 강제 종료됨               |
| **Heap**                   | Dart 객체가 할당되는 메모리 영역. GC가 관리                                          |
| **retain**                 | 객체에 대한 참조를 유지해 GC 대상에서 제외시키는 것                                  |
| **devtools memory**        | Flutter DevTools의 메모리 탭. 실시간 메모리 사용량·객체 수·누수 감지                 |
| **flutter_lints**          | Flutter 공식 lint 규칙. 일부 메모리 누수 패턴을 정적 분석으로 경고                   |

---

## 3. 이론적 배경과 원리 ★

### 3.1 dispose()가 필요한 리소스 완전 정리

#### 해제 체크리스트

```dart
class _MyWidgetState extends State<MyWidget>
    with SingleTickerProviderStateMixin {

  // ── 반드시 dispose()에서 해제해야 하는 것들 ─────────

  // ① AnimationController
  late AnimationController _animCtrl;

  // ② TextEditingController
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();

  // ③ ScrollController
  final _scrollCtrl = ScrollController();

  // ④ FocusNode
  final _emailFocus = FocusNode();

  // ⑤ StreamSubscription
  StreamSubscription<User?>? _authSubscription;
  StreamSubscription<List<Message>>? _msgSubscription;

  // ⑥ Timer
  Timer? _debounceTimer;
  Timer? _pollingTimer;

  // ⑦ ValueNotifier / ChangeNotifier
  final _counter = ValueNotifier<int>(0);

  // ⑧ ReceivePort (Isolate 통신)
  ReceivePort? _receivePort;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 1));

    // Stream 구독
    _authSubscription = AuthService.authStream.listen(_onAuthChanged);
    _msgSubscription  = MessageService.stream.listen(_onMessage);

    // 폴링 타이머
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) => _refresh());
  }

  @override
  void dispose() {
    // ① AnimationController
    _animCtrl.dispose();

    // ② TextEditingController
    _emailCtrl.dispose();
    _passwordCtrl.dispose();

    // ③ ScrollController
    _scrollCtrl.dispose();

    // ④ FocusNode
    _emailFocus.dispose();

    // ⑤ StreamSubscription
    _authSubscription?.cancel();
    _msgSubscription?.cancel();

    // ⑥ Timer
    _debounceTimer?.cancel();
    _pollingTimer?.cancel();

    // ⑦ ValueNotifier
    _counter.dispose();

    // ⑧ ReceivePort
    _receivePort?.close();

    super.dispose();  // ✅ 반드시 마지막
  }
}
```

> ⚠️ **함정 주의:** `super.dispose()`는 반드시 **마지막**에 호출해야 한다. `super.dispose()` 이후에는 State가 무효화되어 해당 State의 리소스에 접근할 수 없다. 반대로 `super.initState()`는 **가장 먼저** 호출해야 한다.

---

### 3.2 dispose() 후 setState() 호출 방지

비동기 작업 중 위젯이 dispose될 때 가장 자주 발생하는 버그다.

```dart
// ❌ 메모리 누수 + 오류 패턴
Future<void> _loadData() async {
  final data = await fetchData();  // 2초 소요
  // 이 사이에 화면이 pop()으로 제거될 수 있음!
  setState(() => _data = data);    // ← 이미 dispose된 State에서 호출 → 오류
}

// ✅ mounted 확인으로 방지
Future<void> _loadData() async {
  final data = await fetchData();
  if (!mounted) return;            // ← dispose 여부 확인
  setState(() => _data = data);
}

// ✅ Riverpod AsyncNotifier 사용 시 자동 처리
// ref.read()는 Provider가 dispose된 후 무시되므로
// mounted 체크 불필요
class DataNotifier extends AsyncNotifier<Data> {
  @override
  Future<Data> build() async => _fetchData();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetchData);
    // dispose 후 자동으로 무시됨
  }
}
```

---

### 3.3 Stream 구독 누수 패턴과 해결

```dart
// ❌ 누수 패턴 1: 구독 후 cancel() 미호출
class _BadState extends State<BadWidget> {
  @override
  void initState() {
    super.initState();
    // StreamSubscription을 변수에 저장하지 않음 → cancel() 불가
    userStream.listen((user) => setState(() => _user = user));
  }
  // dispose()에서 cancel() 불가
}

// ✅ 해결: 구독 객체 저장 후 cancel()
class _GoodState extends State<GoodWidget> {
  StreamSubscription<User?>? _sub;

  @override
  void initState() {
    super.initState();
    _sub = userStream.listen((user) {
      if (!mounted) return;
      setState(() => _user = user);
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}

// ✅ 더 나은 방법: StreamBuilder 사용 (자동 구독/해제)
StreamBuilder<User?>(
  stream: userStream,
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const LoadingView();
    return UserProfile(user: snapshot.data!);
  },
)
// StreamBuilder는 위젯이 dispose될 때 자동으로 구독을 해제함
```

---

### 3.4 Timer 누수 패턴

```dart
// ❌ 누수 패턴: Timer 변수 미저장
class _PollState extends State<PollWidget> {
  @override
  void initState() {
    super.initState();
    // 변수 없이 생성 → 취소 불가
    Timer.periodic(const Duration(seconds: 5), (_) => _refresh());
  }
  // Timer가 계속 실행됨, 화면이 제거되어도!
}

// ✅ 해결: 변수에 저장하고 dispose에서 cancel()
class _GoodPollState extends State<GoodPollWidget> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted) {
        _timer?.cancel();
        return;
      }
      _refresh();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

// ✅ 검색 디바운스 패턴
class _SearchState extends State<SearchWidget> {
  Timer? _debounce;

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}
```

---

### 3.5 Isolate 메모리 누수 경고 패턴

Isolate는 main Isolate와 **메모리를 공유하지 않는다**. 별도 Dart 힙을 갖기 때문에, 종료되지 않은 Isolate는 해당 메모리를 계속 점유한다.

```dart
// ❌ 누수 패턴: Isolate 종료 없이 반복 생성
for (int i = 0; i < 100; i++) {
  // 매 반복마다 새 Isolate 생성, 이전 것 종료 안 함
  Isolate.spawn(heavyTask, data);
  // → 100개 Isolate가 메모리에 쌓임!
}

// ✅ compute(): 자동으로 Isolate 생성·종료 관리
final result = await compute(heavyTask, data);
// compute()는 작업 완료 후 Isolate를 자동으로 종료

// ✅ Isolate.run(): Dart 2.19+, 마찬가지로 자동 종료
final result = await Isolate.run(() => heavyTask(data));

// ✅ 직접 Isolate 관리 시: kill() 필수
class _IsolateManagerState extends State<IsolateManager> {
  Isolate? _isolate;
  ReceivePort? _port;

  Future<void> _startIsolate() async {
    _port = ReceivePort();
    _isolate = await Isolate.spawn(
      _isolateEntry,
      _port!.sendPort,
    );

    _port!.listen((message) {
      if (!mounted) return;
      setState(() => _result = message);
    });
  }

  @override
  void dispose() {
    _isolate?.kill(priority: Isolate.immediate);  // ← 반드시 종료
    _port?.close();                               // ← 포트도 닫기
    super.dispose();
  }
}
```

**Isolate 메모리 공유 불가의 의미:**

```
Main Isolate               Worker Isolate
──────────────             ──────────────
  메모리 A                   메모리 B (별도)
  Dart 힙 A                  Dart 힙 B (별도)

  통신: SendPort/ReceivePort로 메시지 복사 전달
  → 큰 데이터 전달 시 복사 비용 발생
  → TransferableTypedData로 zero-copy 전달 가능
```

> ⚠️ **함정 주의:** Isolate 내부에서 생성한 객체는 main Isolate에서 직접 접근할 수 없다. `SendPort.send()`를 통해 메시지를 보낼 때 Dart는 객체를 **직렬화(복사)**하여 전달한다. 이 복사 비용을 간과하면 오히려 성능이 저하될 수 있다. 단순 계산은 `compute()`로 충분하며, 반복적인 대량 데이터 전달이 필요하다면 `TransferableTypedData`를 사용한다.

---

### 3.6 Flutter DevTools Memory 탭 활용

```
DevTools → Memory 탭
──────────────────────────────────────────────────────
  실시간 그래프: 시간에 따른 메모리 사용량

  ① 화면 전환을 반복하면서 메모리가 계속 오르는가?
     → YES: 메모리 누수 가능성

  ② 힙 스냅샷 (Heap Snapshot) 비교
     - 스냅샷 A: 화면 진입 전
     - 화면 진입 후 여러 액션 수행
     - 화면 이탈 (pop)
     - 스냅샷 B: 화면 이탈 후
     - A와 B 비교: 줄어들지 않은 객체 = 누수 후보

  ③ 누수 식별
     "StatefulElement", "AnimationController",
     "StreamSubscription" 등이 B에만 남아있으면 누수!
──────────────────────────────────────────────────────
```

```bash
# Memory 프로파일링 실행
flutter run --profile

# DevTools 실행 후 Memory 탭 접속
flutter pub global activate devtools
flutter pub global run devtools
```

---

### 3.7 Provider/Riverpod에서 dispose 자동화

```dart
// ChangeNotifierProvider: 트리에서 제거 시 자동 dispose
ChangeNotifierProvider(
  create: (_) => MyNotifier(),   // ← MyNotifier.dispose() 자동 호출
  child: ...,
)

// Riverpod autoDispose: 구독자 없으면 자동 dispose
final searchProvider = AsyncNotifierProvider.autoDispose<SearchNotifier, List<Item>>(
  SearchNotifier.new,
  // ← 화면 이탈 후 구독자 없으면 Notifier 자동 dispose
);

class SearchNotifier extends AutoDisposeAsyncNotifier<List<Item>> {
  @override
  Future<List<Item>> build() async {
    // Notifier가 dispose될 때 자동으로 정리됨
    ref.onDispose(() {
      // 추가 정리 작업 (로그 등)
      debugPrint('SearchNotifier disposed');
    });
    return _search('');
  }
}

// GetIt: 수동 dispose 필요
sl.get<MyService>().dispose();
// 또는
sl.unregister<MyService>();    // 등록 해제 + dispose
```

---

### 3.8 메모리 효율적인 이미지 관리

```dart
// ❌ 메모리 과다 사용
Image.network(
  'https://example.com/large.jpg',
  // 원본 크기 그대로 메모리에 로드
)

// ✅ 표시 크기에 맞게 디코딩
Image.network(
  'https://example.com/large.jpg',
  width: 80, height: 80,
  cacheWidth: 160,   // @2x 해상도
  cacheHeight: 160,
)

// ✅ 이미지 캐시 크기 제한 (앱 시작 시)
void main() {
  PaintingBinding.instance.imageCache.maximumSize = 100;       // 최대 100개
  PaintingBinding.instance.imageCache.maximumSizeBytes = 50 << 20; // 50MB
  runApp(const MyApp());
}

// ✅ 화면에서 이미지 해제
@override
void dispose() {
  // 커스텀 이미지 프로바이더 캐시 제거
  const NetworkImage('https://example.com/image.jpg').evict();
  super.dispose();
}
```

---

## 4. 사례 연구

### 4.1 채팅 앱 메모리 누수 진단 시나리오

```
증상: 채팅 화면을 반복적으로 열고 닫으면 메모리가 계속 증가

DevTools Memory 탭으로 분석:
  힙 스냅샷 비교 결과
  → StreamSubscription 인스턴스가 닫아도 계속 증가
  → AnimationController 인스턴스 누적

원인 코드:
──────────────────────────────────────────────────────
class _ChatRoomState extends State<ChatRoomScreen>
    with TickerProviderStateMixin {

  late AnimationController _typingCtrl;
  // StreamSubscription 변수 없음!

  @override
  void initState() {
    super.initState();
    _typingCtrl = AnimationController(vsync: this, duration: ...);
    // ← 구독 객체 저장 안 함
    MessageService.typingStream.listen((typing) {
      setState(() => _isTyping = typing);
    });
  }

  // dispose() 없음!
}
──────────────────────────────────────────────────────

수정 코드:
──────────────────────────────────────────────────────
class _ChatRoomState extends State<ChatRoomScreen>
    with TickerProviderStateMixin {

  late AnimationController _typingCtrl;
  StreamSubscription<bool>? _typingSub; // ← 저장

  @override
  void initState() {
    super.initState();
    _typingCtrl = AnimationController(vsync: this, duration: ...);
    _typingSub = MessageService.typingStream.listen((typing) {
      if (!mounted) return;
      setState(() => _isTyping = typing);
    });
  }

  @override
  void dispose() {
    _typingCtrl.dispose();   // ✅
    _typingSub?.cancel();    // ✅
    super.dispose();
  }
}
```

---

### 4.2 무한 스크롤 + Isolate 최적화 패턴

```dart
class _InfiniteListState extends State<InfiniteListScreen> {
  final _scrollController = ScrollController();
  Timer? _loadMoreDebounce;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitialData();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      // 디바운스: 연속 호출 방지
      _loadMoreDebounce?.cancel();
      _loadMoreDebounce = Timer(const Duration(milliseconds: 300), _loadMore);
    }
  }

  Future<void> _loadMore() async {
    if (_isLoading) return;
    _isLoading = true;

    // compute()로 파싱 Isolate 분리
    final rawData = await ApiService.fetchNextPage();
    final parsed  = await compute(_parseItems, rawData);

    if (!mounted) return;
    setState(() {
      _items.addAll(parsed);
      _isLoading = false;
    });
  }

  static List<Item> _parseItems(List<dynamic> data) =>
      data.map(Item.fromJson).toList();

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll); // ← 리스너 제거
    _scrollController.dispose();
    _loadMoreDebounce?.cancel();
    super.dispose();
  }
}
```

---

### 4.3 WeakReference: 순환 참조 방지

```dart
// 순환 참조 예시 (이론적)
class A {
  B? b;
}
class B {
  A? a;  // A를 참조 → A와 B가 서로 참조 → GC 대상 아님
}

// WeakReference 사용: GC가 대상을 해제할 수 있음
class Cache {
  final WeakReference<ExpensiveObject> _ref;

  Cache(ExpensiveObject obj) : _ref = WeakReference(obj);

  ExpensiveObject? get object => _ref.target;  // null이면 GC됨
}

// Flutter에서 실용적 활용 예시
class ImagePreloader {
  final _cache = <String, WeakReference<ImageProvider>>{};

  void preload(String url) {
    final provider = NetworkImage(url);
    _cache[url] = WeakReference(provider);
  }

  ImageProvider? get(String url) => _cache[url]?.target;
}
```

---

## 5. 실습

### 5.1 메모리 누수 버그 찾기 및 수정

아래 코드에서 5가지 메모리 누수 문제를 찾아 수정하라.

```dart
// ❌ 버그가 있는 코드 — 메모리 누수 5가지 찾기
class _NotificationsState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {

  late AnimationController _animation;
  late TextEditingController _searchCtrl;
  late ScrollController _scroll;

  @override
  void initState() {
    super.initState();
    _animation = AnimationController(vsync: this, duration: const Duration(seconds: 1));
    _searchCtrl = TextEditingController();
    _scroll = ScrollController();

    // 버그 1: 구독 객체 저장 안 함
    NotificationService.stream.listen((n) {
      setState(() => _notifications.add(n));
    });

    // 버그 2: Timer 저장 안 함
    Timer.periodic(const Duration(seconds: 10), (_) => _refresh());
  }

  // 버그 3: dispose() 없음 (AnimationController 누수)
  // 버그 4: dispose() 없음 (TextEditingController 누수)
  // 버그 5: dispose() 없음 (ScrollController 누수)

  Future<void> _loadMore() async {
    final data = await fetchData();
    setState(() => _data = data);  // 버그 6: mounted 확인 없음
  }

  @override
  Widget build(BuildContext context) => Container();
}
```

**모범 답안:**

```dart
// ✅ 수정된 코드
class _NotificationsState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {

  late AnimationController _animation;
  late TextEditingController _searchCtrl;
  late ScrollController _scroll;

  // ✅ 수정 1: 구독 객체 저장
  StreamSubscription? _notificationSub;

  // ✅ 수정 2: Timer 변수 선언
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _animation  = AnimationController(vsync: this, duration: const Duration(seconds: 1));
    _searchCtrl = TextEditingController();
    _scroll     = ScrollController();

    // ✅ 수정 1: 구독 객체 저장
    _notificationSub = NotificationService.stream.listen((n) {
      if (!mounted) return;
      setState(() => _notifications.add(n));
    });

    // ✅ 수정 2: Timer 저장
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) => _refresh());
  }

  // ✅ 수정 3~5: dispose() 구현
  @override
  void dispose() {
    _animation.dispose();
    _searchCtrl.dispose();
    _scroll.dispose();
    _notificationSub?.cancel();
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadMore() async {
    final data = await fetchData();
    // ✅ 수정 6: mounted 확인
    if (!mounted) return;
    setState(() => _data = data);
  }

  @override
  Widget build(BuildContext context) => Container();
}
```

---

### 5.2 올바른 dispose 패턴 구현

```dart
import 'dart:async';
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: MemoryDemo()));

// 카운터 스트림 (매 초 값 방출)
Stream<int> countStream() async* {
  int i = 0;
  while (true) {
    yield i++;
    await Future.delayed(const Duration(seconds: 1));
  }
}

class MemoryDemo extends StatefulWidget {
  const MemoryDemo({super.key});
  @override
  State<MemoryDemo> createState() => _MemoryDemoState();
}

class _MemoryDemoState extends State<MemoryDemo>
    with SingleTickerProviderStateMixin {

  // 리소스 목록
  late AnimationController _pulse;
  late TextEditingController _input;
  final _counter = ValueNotifier<int>(0);
  StreamSubscription<int>? _streamSub;
  Timer? _timer;

  // 상태
  int _streamValue = 0;
  String _timerLog  = '타이머 시작 안 됨';

  @override
  void initState() {
    super.initState();

    // ① AnimationController 초기화
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    // ② TextEditingController
    _input = TextEditingController();

    // ③ Stream 구독
    _streamSub = countStream().listen((value) {
      if (!mounted) return;
      setState(() => _streamValue = value);
    });

    // ④ 반복 Timer
    _timer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      setState(() => _timerLog = '타이머 ${DateTime.now().second}초');
    });
  }

  @override
  void dispose() {
    _pulse.dispose();          // ① AnimationController 해제
    _input.dispose();          // ② TextEditingController 해제
    _counter.dispose();        // ③ ValueNotifier 해제
    _streamSub?.cancel();      // ④ Stream 구독 취소
    _timer?.cancel();          // ⑤ Timer 취소
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('메모리 관리 실습')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AnimationController
            AnimatedBuilder(
              animation: _pulse,
              builder: (_, __) => Container(
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.3 + _pulse.value * 0.7),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Stream 값
            Text('Stream 카운터: $_streamValue',
                style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 8),

            // Timer 로그
            Text(_timerLog, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),

            // ValueNotifier
            ValueListenableBuilder<int>(
              valueListenable: _counter,
              builder: (_, count, __) => Text(
                'ValueNotifier 카운터: $count',
                style: const TextStyle(fontSize: 18),
              ),
            ),
            ElevatedButton(
              onPressed: () => _counter.value++,
              child: const Text('카운터 증가'),
            ),
            const SizedBox(height: 16),

            // TextEditingController
            TextField(
              controller: _input,
              decoration: const InputDecoration(
                labelText: '입력 (TextEditingController)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**확인 포인트:**

- 앱을 Navigator로 pop했다가 다시 열어도 Stream이 중복 구독되지 않는가?
- DevTools Memory 탭에서 화면 전환 후 메모리가 감소하는가?
- `dispose()`를 의도적으로 제거했을 때 Flutter 경고가 출력되는가?

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** 아래 리소스 중 `dispose()`에서 해제하지 않아도 되는 것은?

- A) AnimationController
- B) StreamSubscription
- C) **Navigator 내비게이션 이력** ✅
- D) TextEditingController

---

**Q2. [Understand]** `super.dispose()`를 `dispose()` 메서드의 **마지막**에 호출해야 하는 이유는?

> **모범 답안:** `super.dispose()`는 Flutter 프레임워크가 State 객체와 관련된 내부 리소스를 정리하고 State를 무효화하는 작업을 수행한다. 호출 이후에는 State가 유효하지 않아 자신의 리소스에 접근하거나 `dispose()`를 호출할 수 없다. 따라서 자신의 컨트롤러·구독을 모두 해제한 뒤, 가장 마지막에 `super.dispose()`를 호출해야 안전한 정리 순서가 보장된다.

---

**Q3. [Evaluate]** 다음 코드에서 메모리 누수 위험을 찾아라.

```dart
class _AutoRefreshState extends State<AutoRefresh> {
  @override
  void initState() {
    super.initState();
    Timer.periodic(const Duration(minutes: 1), (_) async {
      final data = await ApiService.fetch();
      setState(() => _data = data);
    });
  }
}
```

> **모범 답안:** 두 가지 문제가 있다. ① `Timer.periodic()`의 반환 객체를 변수에 저장하지 않아 `dispose()`에서 `cancel()`을 호출할 수 없다. 화면이 제거된 후에도 1분마다 API 요청이 계속 발생한다. ② 비동기 `fetch()` 완료 후 `setState()`를 호출할 때 `mounted` 확인이 없어 화면이 이미 dispose된 경우 "setState() called after dispose()" 오류가 발생한다.

---

**Q4. [Understand]** `compute()`와 `Isolate.spawn()`의 메모리 관리 측면 차이는?

> **모범 답안:** `compute()`는 내부적으로 Isolate를 생성하지만, 함수 실행이 완료되면 자동으로 Isolate를 종료한다. 개발자가 별도로 `kill()`을 호출할 필요가 없다. `Isolate.spawn()`은 Isolate를 직접 생성하며 자동으로 종료되지 않는다. 더 이상 필요하지 않을 때 `isolate.kill()`을 호출하지 않으면 Isolate가 메모리를 계속 점유한다. 일회성 무거운 작업은 `compute()` 또는 `Isolate.run()`을 사용하고, 장기 실행 Isolate만 `spawn()`으로 직접 관리한다.

---

**Q5. [Apply]** ScrollController를 사용하는 State에서 스크롤 리스너를 올바르게 등록·해제하는 코드를 작성하라.

```dart
// 모범 답안
class _ScrollableState extends State<ScrollableWidget> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);   // ← 리스너 등록
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 50) {
      _loadMore();
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll); // ← 리스너 제거
    _scrollController.dispose();                 // ← 컨트롤러 해제
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      ListView.builder(controller: _scrollController, ...);
}
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **dispose()** 에서 반드시 해제: AnimationController·TextEditingController·ScrollController·FocusNode·StreamSubscription·Timer·ValueNotifier·ReceivePort. `super.dispose()`는 **마지막**에.
- **mounted 확인**: 비동기 작업 완료 후 `setState()` 호출 전 `if (!mounted) return`으로 방지.
- **StreamBuilder 활용**: 직접 Stream 구독 대신 StreamBuilder를 사용하면 자동으로 구독·해제 처리.
- **Isolate**: `compute()·Isolate.run()`은 자동 종료. `Isolate.spawn()`은 `kill()` + ReceivePort `close()` 필수.
- **DevTools Memory 탭**: 화면 전환 반복 후 메모리가 감소하지 않으면 누수 의심. 힙 스냅샷 비교로 진단.
- **이미지 캐시**: `cacheWidth/cacheHeight`로 디코딩 크기 제한. `imageCache.maximumSizeBytes`로 전체 캐시 크기 제한.

### 6.2 다음 Step 예고

- **Step 26 — 플랫폼 연동 (Platform Channel·EventChannel):** Flutter에서 Android/iOS의 Native 기능(카메라·센서·생체인증 등)을 호출하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                        | 링크                                                         | 설명                    |
| --------------------------- | ------------------------------------------------------------ | ----------------------- |
| Flutter 메모리 공식 문서    | <https://docs.flutter.dev/tools/devtools/memory>             | DevTools Memory 가이드  |
| Dart Garbage Collection     | <https://dart.dev/guides/language/effective-dart/usage>      | 효과적인 Dart 사용      |
| Flutter 성능 Best Practices | <https://docs.flutter.dev/perf/best-practices>               | 메모리 포함 전체 가이드 |
| dispose() API               | <https://api.flutter.dev/flutter/widgets/State/dispose.html> | State.dispose() 문서    |
| Isolate 공식 문서           | <https://dart.dev/language/isolates>                         | Isolate 심층 가이드     |

### 6.4 FAQ

**Q. `StreamController`를 dispose하지 않으면 어떤 경고가 발생하는가?**

> "A StreamController was garbage collected while still having a subscriber" 경고가 출력된다. StreamController를 close하지 않으면 구독자가 남아있을 수 있고, Stream이 완료되지 않아 구독자가 영원히 대기 상태가 된다. `dispose()`에서 반드시 `_controller.close()`를 호출해야 한다.

**Q. Riverpod Provider를 사용하면 dispose를 신경 쓰지 않아도 되는가?**

> 대부분 그렇다. `ChangeNotifierProvider`와 `autoDispose` Provider는 위젯 트리나 구독자가 없어지면 자동으로 `dispose()`를 호출한다. 단, Riverpod을 사용하더라도 Notifier 내부에서 생성한 `StreamSubscription`·`Timer`·`AnimationController` 같은 리소스는 `ref.onDispose()`를 사용해 직접 해제해야 한다.

**Q. `mounted` 프로퍼티가 `false`가 되는 정확한 시점은?**

> `super.dispose()`가 호출된 이후다. `deactivate()` 단계에서는 아직 `mounted == true`다. 비동기 작업이 `deactivate()` 이후~`dispose()` 이전에 완료될 경우 `setState()`는 작동하지만 위젯이 트리에서 제거된 상태일 수 있으므로, 안전을 위해 비동기 완료 시점에는 항상 `mounted`를 확인하는 것이 권장된다.

---

## 빠른 자가진단 체크리스트

- [ ] `dispose()`에서 해제해야 하는 7가지 이상의 리소스를 나열할 수 있는가?
- [ ] `super.dispose()`를 마지막에 호출해야 하는 이유를 설명할 수 있는가?
- [ ] 비동기 작업 완료 후 `if (!mounted) return`이 필요한 이유를 설명할 수 있는가?
- [ ] StreamSubscription을 변수에 저장하지 않으면 어떤 문제가 발생하는지 설명할 수 있는가?
- [ ] `Timer.periodic()`을 변수에 저장하지 않으면 발생하는 문제를 설명할 수 있는가?
- [ ] `compute()`와 `Isolate.spawn()`의 메모리 관리 차이를 설명할 수 있는가?
- [ ] DevTools Memory 탭으로 메모리 누수를 진단하는 방법을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Isolate.spawn()으로 생성한 Isolate를 kill()하지 않으면 메모리를 계속 점유한다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: ScrollController에 addListener()만 하고 removeListener()를 하지 않으면 누수가 발생한다는 것을 이해했는가?
