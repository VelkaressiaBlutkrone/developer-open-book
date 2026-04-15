# Step 15 — 고급 상태관리 (Riverpod · Bloc)

> **파트:** 4️⃣ 상태 관리 | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 150분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Provider의 한계와 Riverpod이 이를 해결하는 방식을 설명할 수 있다.
2. **[Understand]** Riverpod의 주요 Provider 종류(StateProvider·StateNotifierProvider·AsyncNotifierProvider)와 ref의 역할을 설명할 수 있다.
3. **[Understand]** Bloc의 이벤트→상태 변환 흐름(Event→Bloc→State)을 설명할 수 있다.
4. **[Understand]** Cubit과 Bloc의 차이와 각각의 적합한 사용 시나리오를 설명할 수 있다.
5. **[Apply]** Riverpod으로 카운터·비동기 데이터 로딩을 구현할 수 있다.
6. **[Apply]** Cubit으로 간단한 상태 변경 로직을 구현할 수 있다.
7. **[Evaluate]** Provider·Riverpod·Bloc 중 프로젝트 상황에 맞는 솔루션을 선택하고 근거를 제시할 수 있다.

**전제 지식:** Step 12(상태관리 개념), Step 13(rebuild), Step 14(Provider·ChangeNotifier)

---

## 1. 서론

### 1.1 왜 더 발전된 솔루션이 필요한가

Provider는 훌륭하지만 규모가 커질수록 한계가 드러난다.

![Provider의 한계](/developer-open-book/diagrams/flutter-step15-provider-limits.svg)

### 1.2 이 Step의 학습 전략

Riverpod과 Bloc은 각각 방대한 문서를 가진 독립적인 생태계다. 이 문서는 **핵심 개념과 실용적 사용법**에 집중하고, 심화 기능은 공식 문서 링크로 안내한다.

![학습 우선순위](/developer-open-book/diagrams/flutter-step15-learning-priority.svg)

### 1.3 전체 개념 지도

![Riverpod/Bloc hierarchy](/developer-open-book/diagrams/step15-advanced-state.svg)

---

## 2. 기본 개념과 용어

| 용어                       | 정의                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Riverpod**               | Provider의 단점을 개선한 상태관리 패키지. 위젯 트리 독립적, 컴파일 타임 안전성, 코드 생성 지원 |
| **ProviderScope**          | Riverpod의 최상위 래퍼 위젯. 앱 전체를 감싸야 Riverpod이 동작                                  |
| **ref**                    | Riverpod에서 다른 Provider를 읽거나 구독하는 핸들러 객체                                       |
| **ref.watch()**            | Provider를 구독하고 값이 변경될 때 rebuild를 트리거                                            |
| **ref.read()**             | Provider를 한 번만 읽음. rebuild 대상이 되지 않음                                              |
| **ref.listen()**           | Provider 값 변경 시 콜백 실행. 사이드 이펙트(SnackBar 표시 등)에 사용                          |
| **ConsumerWidget**         | `ref`를 build() 메서드에서 사용할 수 있는 StatelessWidget 대체                                 |
| **ConsumerStatefulWidget** | `ref`를 State에서 사용할 수 있는 StatefulWidget 대체                                           |
| **StateProvider**          | 단순 값(int, bool, String 등)을 관리하는 Riverpod Provider                                     |
| **NotifierProvider**       | Notifier 클래스 기반의 복잡한 상태 관리 (Riverpod 2.x 권장)                                    |
| **AsyncNotifierProvider**  | 비동기 상태(로딩·데이터·에러)를 관리하는 Provider                                              |
| **AsyncValue**             | 비동기 데이터의 3가지 상태(loading·data·error)를 표현하는 타입                                 |
| **Bloc**                   | Business Logic Component. Event를 받아 새 State를 emit하는 Stream 기반 클래스                  |
| **Cubit**                  | Bloc의 경량 버전. 이벤트 없이 메서드 호출로 state를 emit                                       |
| **emit()**                 | Bloc/Cubit에서 새 상태를 출력하는 메서드                                                       |
| **BlocProvider**           | Bloc/Cubit을 위젯 트리에 제공하는 위젯                                                         |
| **BlocBuilder**            | Bloc/Cubit의 상태 변경 시 UI를 rebuild하는 위젯                                                |
| **BlocListener**           | 상태 변경 시 사이드 이펙트(내비게이션, SnackBar 등)를 처리하는 위젯                            |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Riverpod: Provider의 진화

#### Riverpod이 Provider와 다른 핵심 차이

![Provider vs Riverpod comparison](/developer-open-book/diagrams/step15-provider-vs-riverpod.svg)

#### 설치 및 기본 설정

```yaml
# pubspec.yaml
dependencies:
  flutter_riverpod: ^2.5.0
  # 코드 생성 사용 시 (선택적)
  # riverpod_annotation: ^2.3.0
```

```dart
// main.dart — ProviderScope으로 앱 전체 래핑 (필수)
void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

---

### 3.2 Riverpod Provider 종류

#### StateProvider: 단순 값 관리

```dart
// 전역 선언 (파일 최상단 또는 별도 파일)
final counterProvider = StateProvider<int>((ref) => 0);
final isDarkModeProvider = StateProvider<bool>((ref) => false);
final selectedTabProvider = StateProvider<int>((ref) => 0);

// ConsumerWidget에서 사용
class CounterWidget extends ConsumerWidget {
  const CounterWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ref.watch: 값 변경 시 rebuild
    final count = ref.watch(counterProvider);

    return Column(
      children: [
        Text('$count', style: const TextStyle(fontSize: 48)),
        ElevatedButton(
          onPressed: () {
            // ref.read().notifier: 상태 자체에 접근해 변경
            ref.read(counterProvider.notifier).state++;
          },
          child: const Text('증가'),
        ),
      ],
    );
  }
}
```

#### NotifierProvider: 복잡한 상태 관리 (Riverpod 2.x 권장)

```dart
// Notifier 클래스 정의
class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() {
    // 초기 상태 반환
    return [];
  }

  void add(CartItem item) {
    final idx = state.indexWhere((e) => e.id == item.id);
    if (idx >= 0) {
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == idx)
            state[i].copyWith(quantity: state[i].quantity + 1)
          else
            state[i],
      ];
    } else {
      state = [...state, item];
    }
    // notifyListeners() 없음! state 교체 자체가 알림
  }

  void remove(String id) {
    state = state.where((item) => item.id != id).toList();
  }

  int get totalCount => state.fold(0, (sum, item) => sum + item.quantity);
}

// Provider 선언
final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(
  CartNotifier.new,
);

// 사용
class CartScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (_, i) => ListTile(
        title: Text(items[i].name),
        trailing: IconButton(
          icon: const Icon(Icons.delete),
          onPressed: () => notifier.remove(items[i].id),
        ),
      ),
    );
  }
}
```

#### AsyncNotifierProvider: 비동기 상태 관리

```dart
// 비동기 데이터를 관리하는 Notifier
class ProductsNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    // 초기 데이터 로딩
    return _fetchProducts();
  }

  Future<List<Product>> _fetchProducts() async {
    await Future.delayed(const Duration(seconds: 1));
    return [
      Product(id: '1', name: '상품 A', price: 29000),
      Product(id: '2', name: '상품 B', price: 49000),
    ];
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetchProducts);
  }
}

final productsProvider = AsyncNotifierProvider<ProductsNotifier, List<Product>>(
  ProductsNotifier.new,
);

// UI에서 AsyncValue 처리
class ProductListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);

    return productsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('오류: $error')),
      data: (products) => ListView.builder(
        itemCount: products.length,
        itemBuilder: (_, i) => ListTile(
          title: Text(products[i].name),
          subtitle: Text('₩${products[i].price}'),
        ),
      ),
    );
  }
}
```

**AsyncValue의 3가지 상태:**

![AsyncValue 3가지 상태](/developer-open-book/diagrams/flutter-step15-async-value.svg)

---

### 3.3 ref의 3가지 메서드

```dart
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {

    // ① ref.watch: 구독 + rebuild
    // Provider 값이 변경되면 이 build()가 재호출됨
    final count = ref.watch(counterProvider);

    // ② ref.read: 단순 읽기 (이벤트 핸들러에서)
    // rebuild 대상이 되지 않음
    // build() 안에서 사용하면 안 됨 (최신값 보장 안 됨)

    // ③ ref.listen: 사이드 이펙트 처리
    // 값 변경 시 콜백 실행, rebuild 없음
    ref.listen<int>(counterProvider, (previous, next) {
      if (next >= 10) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('10 이상!')),
        );
      }
    });

    return Column(
      children: [
        Text('$count'),
        ElevatedButton(
          // ② 이벤트 핸들러: ref.read 사용
          onPressed: () => ref.read(counterProvider.notifier).state++,
          child: const Text('증가'),
        ),
      ],
    );
  }
}
```

**Provider 간 의존성:**

```dart
// A Provider가 B Provider에 의존하는 경우
final userProvider = StateProvider<User?>((ref) => null);

final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(() {
  return CartNotifier();
});

class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() {
    // ref로 다른 Provider 읽기
    final user = ref.watch(userProvider);
    if (user == null) return [];  // 로그아웃 시 장바구니 초기화
    return [];
  }
}
```

---

### 3.4 Riverpod의 자동 dispose

```dart
// autoDispose: 구독자가 없으면 자동으로 상태 제거
final searchResultsProvider = StateProvider.autoDispose<List<String>>(
  (ref) => [],
);

// 화면을 나가면 검색 결과 자동 초기화
// → 다음에 화면 진입 시 fresh 상태로 시작

// keepAlive: autoDispose이지만 특정 조건에서 유지
final cachedDataProvider = AsyncNotifierProvider.autoDispose<DataNotifier, Data>(() {
  return DataNotifier();
});

class DataNotifier extends AutoDisposeAsyncNotifier<Data> {
  @override
  Future<Data> build() async {
    // 5분간 캐시 유지
    final link = ref.keepAlive();
    Timer(const Duration(minutes: 5), link.close);
    return _fetchData();
  }
}
```

---

### 3.5 Bloc/Cubit: 이벤트 기반 상태 관리

#### Cubit: 메서드로 상태 변경 (경량 버전)

![Cubit 구조](/developer-open-book/diagrams/flutter-step15-cubit-structure.svg)

```dart
// 설치
// flutter_bloc: ^8.1.0

// Cubit 정의
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);  // 초기 상태: 0

  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
  void reset()     => emit(0);
}

// BlocProvider로 제공
BlocProvider(
  create: (_) => CounterCubit(),
  child: const CounterScreen(),
)

// BlocBuilder로 UI 연결
class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<CounterCubit, int>(
        builder: (context, count) {
          return Center(
            child: Text('$count',
                style: const TextStyle(fontSize: 48)),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<CounterCubit>().increment(),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

---

#### Bloc: 이벤트 기반 상태 변환 (정석 버전)

![Bloc 단방향 데이터 흐름](/developer-open-book/diagrams/step15-bloc-architecture.svg)

```dart
// 이벤트 정의 (sealed class로 타입 안전하게)
sealed class CounterEvent {}
class IncrementEvent extends CounterEvent {}
class DecrementEvent extends CounterEvent {}
class ResetEvent     extends CounterEvent {}

// 상태 정의 (복잡한 경우 별도 클래스)
// 단순 int인 경우 상태 클래스 없이 int 직접 사용 가능

// Bloc 정의
class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<IncrementEvent>((event, emit) => emit(state + 1));
    on<DecrementEvent>((event, emit) => emit(state - 1));
    on<ResetEvent>    ((event, emit) => emit(0));
  }
}

// UI에서 사용
// 이벤트 발생
context.read<CounterBloc>().add(IncrementEvent());

// 상태 구독
BlocBuilder<CounterBloc, int>(
  builder: (context, count) => Text('$count'),
)
```

**Bloc에서 비동기 처리:**

```dart
// 상태 정의
sealed class ProductsState {}
class ProductsInitial   extends ProductsState {}
class ProductsLoading   extends ProductsState {}
class ProductsLoaded    extends ProductsState {
  final List<Product> products;
  const ProductsLoaded(this.products);
}
class ProductsError extends ProductsState {
  final String message;
  const ProductsError(this.message);
}

// 이벤트 정의
sealed class ProductsEvent {}
class LoadProductsEvent  extends ProductsEvent {}
class RefreshProductsEvent extends ProductsEvent {}

// Bloc 구현
class ProductsBloc extends Bloc<ProductsEvent, ProductsState> {
  final ProductRepository _repository;

  ProductsBloc(this._repository) : super(ProductsInitial()) {
    on<LoadProductsEvent>(_onLoad);
    on<RefreshProductsEvent>(_onRefresh);
  }

  Future<void> _onLoad(
    LoadProductsEvent event,
    Emitter<ProductsState> emit,
  ) async {
    emit(ProductsLoading());
    try {
      final products = await _repository.fetchAll();
      emit(ProductsLoaded(products));
    } catch (e) {
      emit(ProductsError(e.toString()));
    }
  }

  Future<void> _onRefresh(
    RefreshProductsEvent event,
    Emitter<ProductsState> emit,
  ) async {
    // 현재 데이터 유지하면서 새로고침
    if (state is ProductsLoaded) {
      emit(ProductsLoading());
    }
    try {
      final products = await _repository.fetchAll();
      emit(ProductsLoaded(products));
    } catch (e) {
      emit(ProductsError(e.toString()));
    }
  }
}

// UI 연결
BlocBuilder<ProductsBloc, ProductsState>(
  builder: (context, state) {
    return switch (state) {
      ProductsInitial()        => const SizedBox.shrink(),
      ProductsLoading()        => const CircularProgressIndicator(),
      ProductsLoaded(:final products) => ListView.builder(
          itemCount: products.length,
          itemBuilder: (_, i) => ListTile(title: Text(products[i].name)),
        ),
      ProductsError(:final message)   => Text('오류: $message'),
    };
  },
)
```

---

### 3.6 BlocListener와 BlocConsumer

```dart
// BlocListener: 사이드 이펙트 처리 (UI 변경 없음)
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthSuccess) {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (state is AuthError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.message)),
      );
    }
  },
  child: const LoginForm(),
)

// BlocConsumer: Builder + Listener 결합
BlocConsumer<SubmitBloc, SubmitState>(
  listener: (context, state) {
    if (state is SubmitSuccess) {
      Navigator.pop(context);
    }
  },
  builder: (context, state) {
    return ElevatedButton(
      onPressed: state is SubmitLoading
          ? null
          : () => context.read<SubmitBloc>().add(SubmitEvent()),
      child: state is SubmitLoading
          ? const CircularProgressIndicator()
          : const Text('제출'),
    );
  },
)
```

---

### 3.7 Cubit vs Bloc 선택 기준

| 항목           | Cubit       | Bloc                          |
| -------------- | ----------- | ----------------------------- |
| 복잡도         | 낮음        | 높음                          |
| 이벤트 추적    | 없음        | 모든 이벤트 로깅 가능         |
| 테스트         | 쉬움        | 이벤트 단위 테스트 가능       |
| 상태 전환 추적 | 어려움      | Event → State 명확            |
| 팀 규모        | 소~중       | 중~대                         |
| 적합한 경우    | 간단한 상태 | 복잡한 로직, 감사(audit) 필요 |

**선택 원칙:**

- 상태 전환이 단순하고 이벤트 추적이 불필요 → **Cubit**
- 여러 이벤트가 같은 상태를 다양하게 변환하거나 이벤트 로그가 필요 → **Bloc**

---

### 3.8 Provider vs Riverpod vs Bloc 최종 비교

| 항목          | Provider       | Riverpod              | Bloc/Cubit      |
| ------------- | -------------- | --------------------- | --------------- |
| 학습 곡선     | ⭐⭐           | ⭐⭐⭐                | ⭐⭐⭐⭐        |
| context 의존  | ✅ 필요        | ❌ 불필요             | ✅ 필요         |
| 타입 안전성   | 보통           | 최상                  | 높음            |
| 비동기 지원   | FutureProvider | AsyncNotifierProvider | on<Event> async |
| 코드 생성     | ❌             | ✅ (선택적)           | ❌              |
| 테스트 용이성 | 보통           | 높음                  | 최상            |
| 추천 규모     | 소~중          | 중~대                 | 대규모 팀       |
| 2026 트렌드   | 레거시         | 신규 표준             | 엔터프라이즈    |

---

## 4. 사례 연구

### 4.1 Spotify 스타일 플레이리스트: Bloc 구조 분석

![플레이리스트 Bloc 설계](/developer-open-book/diagrams/flutter-step15-playlist-bloc.svg)

이 구조의 장점: 모든 상태 전환이 이벤트로 로깅되어 "어떤 이벤트가 어떤 상태를 만들었는가"를 정확히 추적할 수 있다.

---

### 4.2 Riverpod으로 검색 자동완성 구현

```dart
// 검색어 Provider (autoDispose: 화면 이탈 시 초기화)
final searchQueryProvider = StateProvider.autoDispose<String>((ref) => '');

// 검색 결과 Provider (searchQuery에 의존)
final searchResultsProvider = AsyncNotifierProvider.autoDispose
    .family<SearchNotifier, List<Product>, String>(
  SearchNotifier.new,
);

class SearchNotifier
    extends AutoDisposeFamilyAsyncNotifier<List<Product>, String> {
  @override
  Future<List<Product>> build(String query) async {
    // 300ms 디바운스
    await Future.delayed(const Duration(milliseconds: 300));
    if (query.isEmpty) return [];
    return ProductRepository().search(query);
  }
}

// UI
class SearchScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        TextField(
          onChanged: (query) =>
              ref.read(searchQueryProvider.notifier).state = query,
          decoration: const InputDecoration(hintText: '검색어 입력'),
        ),
        Consumer(
          builder: (context, ref, _) {
            final query = ref.watch(searchQueryProvider);
            final results = ref.watch(searchResultsProvider(query));
            return results.when(
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Text('오류: $e'),
              data: (list) => ListView.builder(
                shrinkWrap: true,
                itemCount: list.length,
                itemBuilder: (_, i) => ListTile(title: Text(list[i].name)),
              ),
            );
          },
        ),
      ],
    );
  }
}
```

---

### 4.3 멀티 Cubit 패턴: 화면 단위 상태 관리

```dart
// 각 화면이 독립적인 Cubit을 가짐
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => FeedCubit()..loadFeed()),
        BlocProvider(create: (_) => RecommendationCubit()..load()),
        BlocProvider(create: (_) => NotificationCubit()..subscribe()),
      ],
      child: const HomeView(),
    );
  }
}
```

---

## 5. 실습

### 5.1 Riverpod 카운터 + 비동기 데이터

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() => runApp(
  const ProviderScope(child: MaterialApp(home: RiverpodDemo())),
);

// ① 단순 카운터
final counterProvider = StateProvider<int>((ref) => 0);

// ② 비동기 데이터 (2초 지연 시뮬레이션)
final greetingProvider = FutureProvider<String>((ref) async {
  await Future.delayed(const Duration(seconds: 2));
  final count = ref.watch(counterProvider);
  return '현재 카운트: $count';
});

class RiverpodDemo extends ConsumerWidget {
  const RiverpodDemo({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count   = ref.watch(counterProvider);
    final greeting = ref.watch(greetingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Riverpod 실습')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('$count',
                style: const TextStyle(fontSize: 64, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            greeting.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('오류: $e'),
              data: (msg) => Text(msg,
                  style: const TextStyle(fontSize: 18, color: Colors.grey)),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FilledButton.icon(
                  onPressed: () =>
                      ref.read(counterProvider.notifier).state--,
                  icon: const Icon(Icons.remove),
                  label: const Text('-1'),
                ),
                const SizedBox(width: 16),
                OutlinedButton(
                  onPressed: () =>
                      ref.read(counterProvider.notifier).state = 0,
                  child: const Text('리셋'),
                ),
                const SizedBox(width: 16),
                FilledButton.icon(
                  onPressed: () =>
                      ref.read(counterProvider.notifier).state++,
                  icon: const Icon(Icons.add),
                  label: const Text('+1'),
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

**확인 포인트:**

- `counterProvider` 값이 변경되면 `greetingProvider`도 재실행되는가?
- `ref.watch(counterProvider)`와 `ref.read(counterProvider.notifier).state++`의 역할 차이는?
- `greeting.when()`의 loading→data 전환이 자연스럽게 동작하는가?

---

### 5.2 Cubit 구현 연습

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// 상태: 간단한 bool로 표현
class ToggleCubit extends Cubit<bool> {
  ToggleCubit() : super(false);
  void toggle() => emit(!state);
}

// 더 복잡한 상태 예시
class TimerState {
  final int seconds;
  final bool isRunning;
  const TimerState({required this.seconds, required this.isRunning});
  TimerState copyWith({int? seconds, bool? isRunning}) => TimerState(
    seconds: seconds ?? this.seconds,
    isRunning: isRunning ?? this.isRunning,
  );
}

class TimerCubit extends Cubit<TimerState> {
  TimerCubit() : super(const TimerState(seconds: 0, isRunning: false));

  void start() => emit(state.copyWith(isRunning: true));
  void pause() => emit(state.copyWith(isRunning: false));
  void tick()  => emit(state.copyWith(seconds: state.seconds + 1));
  void reset() => emit(const TimerState(seconds: 0, isRunning: false));
}

void main() => runApp(
  MultiBlocProvider(
    providers: [
      BlocProvider(create: (_) => ToggleCubit()),
      BlocProvider(create: (_) => TimerCubit()),
    ],
    child: const MaterialApp(home: CubitDemo()),
  ),
);

class CubitDemo extends StatelessWidget {
  const CubitDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cubit 실습')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 토글
            BlocBuilder<ToggleCubit, bool>(
              builder: (context, isOn) => SwitchListTile(
                title: Text(isOn ? '켜짐' : '꺼짐'),
                value: isOn,
                onChanged: (_) => context.read<ToggleCubit>().toggle(),
              ),
            ),
            const Divider(height: 32),
            // 타이머
            BlocBuilder<TimerCubit, TimerState>(
              builder: (context, state) => Column(
                children: [
                  Text('${state.seconds}초',
                      style: const TextStyle(fontSize: 48)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: state.isRunning
                            ? () {
                                context.read<TimerCubit>().pause();
                              }
                            : () {
                                context.read<TimerCubit>().start();
                                Future.doWhile(() async {
                                  await Future.delayed(
                                      const Duration(seconds: 1));
                                  if (!context.mounted) return false;
                                  final c = context.read<TimerCubit>();
                                  if (!c.state.isRunning) return false;
                                  c.tick();
                                  return true;
                                });
                              },
                        child: Text(state.isRunning ? '일시정지' : '시작'),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () => context.read<TimerCubit>().reset(),
                        child: const Text('리셋'),
                      ),
                    ],
                  ),
                ],
              ),
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

**Q1. [Understand]** Riverpod에서 `ref.watch()`와 `ref.read()`의 차이는?

- A) watch()는 비동기, read()는 동기
- B) **watch()는 값 변경 시 rebuild를 트리거하고, read()는 한 번만 읽어 rebuild 대상이 안 됨** ✅
- C) watch()는 Provider 내부에서만, read()는 위젯에서만 사용
- D) 기능 차이 없이 이름만 다름

---

**Q2. [Understand]** `AsyncValue.when()`의 3가지 케이스를 나열하라.

> **모범 답안:** `loading`, `error`, `data`. `loading`은 비동기 작업 진행 중, `error`는 예외 발생 시, `data`는 정상 완료 시 호출된다. 세 가지 모두 처리함으로써 UI가 어떤 상태에서도 적절한 화면을 보여줄 수 있다.

---

**Q3. [Understand]** Bloc과 Cubit의 핵심 구조 차이는?

> **모범 답안:** Cubit은 메서드를 직접 호출해 `emit()`으로 새 상태를 출력한다. 반면 Bloc은 이벤트(Event) 객체를 `add()`로 전달하면 등록된 `on<Event>()` 핸들러가 실행되어 `emit()`으로 새 상태를 출력한다. Bloc은 이 이벤트→상태 변환 과정이 명확하게 분리되어 복잡한 로직과 이벤트 추적에 유리하다.

---

**Q4. [Evaluate]** 아래 3가지 상황에서 각각 가장 적합한 상태관리 솔루션을 선택하고 근거를 제시하라.

```
A. 1인 개발자가 만드는 간단한 메모 앱
B. 5명 팀이 만드는 커머스 앱 (장바구니, 결제, 회원)
C. 20명 팀이 만드는 핀테크 앱 (이벤트 감사 로그 필수)
```

> **모범 답안:**
> A → **Provider 또는 Riverpod** — 소규모, 빠른 개발이 우선. Provider는 학습 비용이 낮고 Riverpod은 확장성을 고려할 때 좋다.
> B → **Riverpod** — 중규모, 여러 도메인(장바구니·사용자·결제) 상태를 타입 안전하게 분리 관리하기 좋고 비동기 처리(AsyncNotifier)가 편리하다.
> C → **Bloc** — 대규모 팀, 모든 상태 전환이 이벤트로 로깅되어 감사 로그 구현에 최적. 팀원 간 이벤트/상태 계약이 명확해 협업에 유리하다.

---

**Q5. [Apply]** Riverpod의 `NotifierProvider`에서 상태를 변경할 때 `notifyListeners()`를 호출하지 않아도 되는 이유는?

> **모범 답안:** Riverpod의 `Notifier`에서는 `state = 새값` 형태로 상태를 교체한다. Riverpod이 내부적으로 이전 상태와 새 상태를 비교하고, 변경이 감지되면 자동으로 구독 중인 위젯들에게 rebuild를 트리거한다. `ChangeNotifier`처럼 개발자가 직접 `notifyListeners()`를 호출할 필요가 없어 누락으로 인한 버그가 구조적으로 방지된다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

**Riverpod:**

- `ProviderScope`로 앱 전체 래핑, `ConsumerWidget`에서 `ref` 사용.
- `StateProvider`(단순값) → `NotifierProvider`(복잡한 로직) → `AsyncNotifierProvider`(비동기).
- `ref.watch()`로 구독, `ref.read()`로 이벤트 핸들러, `ref.listen()`으로 사이드 이펙트.
- `state = 새값`으로 상태 변경 → `notifyListeners()` 불필요.
- `AsyncValue.when(loading/error/data)`으로 비동기 상태 처리.

**Bloc/Cubit:**

- `Cubit`: 메서드 호출 → `emit(새상태)`. 단순·경량.
- `Bloc`: `add(Event)` → `on<Event>()` 핸들러 → `emit(새상태)`. 복잡·추적 가능.
- `BlocBuilder`(UI rebuild), `BlocListener`(사이드 이펙트), `BlocConsumer`(둘 다).

**선택 기준:** 소규모 → Provider, 중~대규모 신규 → Riverpod, 대규모 팀/감사 필요 → Bloc.

### 6.2 다음 Step 예고

- **Step 16 — HTTP & REST API:** Dio를 사용한 HTTP 요청, JSON 파싱, 에러 핸들링, 인터셉터 패턴을 학습한다.

### 6.3 참고 자료

| 자료                  | 링크                                                  | 설명                   |
| --------------------- | ----------------------------------------------------- | ---------------------- |
| Riverpod 공식 문서    | <https://riverpod.dev>                                  | 전체 가이드 및 API     |
| Riverpod GitHub       | <https://github.com/rrousselGit/riverpod>               | 예제 및 소스           |
| Bloc 공식 문서        | <https://bloclibrary.dev>                               | Bloc·Cubit 전체 가이드 |
| flutter_bloc GitHub   | <https://github.com/felangel/bloc>                      | 예제 및 소스           |
| Riverpod vs Bloc 비교 | <https://codewithandrea.com/articles/riverpod-vs-bloc/> | 심층 비교 분석         |

### 6.4 FAQ

**Q. Riverpod 2.x에서 `StateNotifierProvider` 대신 `NotifierProvider`를 사용해야 하는가?**

> 그렇다. `StateNotifierProvider`는 레거시로 유지되지만, Riverpod 2.x 이상에서는 `NotifierProvider`와 `AsyncNotifierProvider`가 권장된다. 새 프로젝트는 처음부터 `NotifierProvider`를 사용한다.

**Q. Bloc에서 같은 상태를 연속으로 emit하면 어떻게 되는가?**

> 기본적으로 Bloc은 이전 상태와 새 상태를 `==` 연산자로 비교해, 동일하면 스트림에 방출하지 않는다. 따라서 `BlocBuilder`가 rebuild되지 않는다. 의도적으로 같은 상태를 다시 emit하려면 상태 객체에 타임스탬프나 고유 ID를 포함해 다른 객체로 만들어야 한다.

**Q. Riverpod과 Bloc을 같은 프로젝트에서 혼용할 수 있는가?**

> 기술적으로는 가능하지만 권장하지 않는다. 팀 내에서 일관된 패턴을 사용하는 것이 유지보수에 유리하다. 기존 Bloc 프로젝트에 새 기능을 Riverpod으로 추가하는 점진적 마이그레이션은 가능하다.

---

## 빠른 자가진단 체크리스트

- [ ] Riverpod의 ProviderScope 설정을 설명할 수 있는가?
- [ ] StateProvider·NotifierProvider·AsyncNotifierProvider의 차이를 설명할 수 있는가?
- [ ] ref.watch·ref.read·ref.listen의 사용 시나리오를 구분할 수 있는가?
- [ ] AsyncValue.when()으로 3가지 상태를 처리하는 코드를 작성할 수 있는가?
- [ ] Cubit으로 간단한 상태 변경 로직을 구현할 수 있는가?
- [ ] Bloc의 Event→State 변환 흐름을 설명할 수 있는가?
- [ ] BlocBuilder·BlocListener·BlocConsumer의 차이를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Riverpod NotifierProvider에서 notifyListeners()가 불필요한 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: 프로젝트 규모·팀 상황에 따라 Provider/Riverpod/Bloc을 선택하는 기준을 말할 수 있는가?
