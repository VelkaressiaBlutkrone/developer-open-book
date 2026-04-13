# Step 14 — Provider 패턴

> **파트:** 4️⃣ 상태 관리 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** ChangeNotifier가 상태 변경을 리스너에게 전파하는 원리를 설명할 수 있다.
2. **[Understand]** Provider가 InheritedWidget을 래핑해 상태를 위젯 트리에 주입하는 방식을 설명할 수 있다.
3. **[Understand]** `context.watch()`와 `context.read()`의 차이와 올바른 사용 시점을 설명할 수 있다.
4. **[Understand]** Dependency Injection이 무엇이며 Provider가 이를 구현하는 방식을 설명할 수 있다.
5. **[Apply]** ChangeNotifier + ChangeNotifierProvider로 Global State를 구현할 수 있다.
6. **[Apply]** `Consumer`와 `Selector`로 rebuild 범위를 최소화할 수 있다.

**전제 지식:** Step 12(상태관리 개념), Step 13(setState·rebuild), Step 04(InheritedWidget 개념)

---

## 1. 서론

### 1.1 Provider가 해결하는 문제

Step 12에서 살펴본 Prop Drilling 문제를 기억하는가? Provider는 이 문제를 InheritedWidget 기반으로 우아하게 해결한다.

```
Provider가 해결하는 3가지 문제
──────────────────────────────────────────────────────
① Prop Drilling
   중간 위젯을 거치지 않고 필요한 위젯이 직접 상태를 가져옴

② 상태 생명주기 관리
   위젯 트리에 상태를 바인딩 → 트리에서 제거 시 자동 dispose

③ 의존성 주입 (Dependency Injection)
   위젯이 필요한 의존성(서비스·저장소)을
   직접 생성하지 않고 외부에서 주입받음
──────────────────────────────────────────────────────
```

### 1.2 Provider의 위치

```
Flutter 상태관리 생태계에서 Provider의 위치
──────────────────────────────────────────────────────
  Flutter 내장
    InheritedWidget  ← 저수준, 직접 사용하기 불편

  Provider 패키지 (pub.dev)
    InheritedWidget를 래핑 → 더 편리한 API 제공

  Riverpod 패키지
    Provider의 한계를 개선 (Step 15에서 학습)
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

![Provider 패턴 hierarchy](/developer-open-book/diagrams/step14-provider-pattern.svg)

---

## 2. 기본 개념과 용어

| 용어                          | 정의                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **ChangeNotifier**            | 상태 변경을 리스너(구독자)에게 알리는 Flutter 내장 믹스인 클래스. `notifyListeners()` 호출로 알림 |
| **notifyListeners()**         | ChangeNotifier를 구독 중인 모든 리스너에게 상태 변경을 알리는 메서드                              |
| **Provider**                  | 위젯 트리에 값·상태를 주입하는 패키지. InheritedWidget을 편리하게 사용할 수 있게 래핑             |
| **ChangeNotifierProvider**    | ChangeNotifier 인스턴스를 생성하고 위젯 트리에 제공하는 Provider 타입                             |
| **context.watch\<T\>()**      | T 타입 Provider를 구독하고 rebuild 대상이 됨. 상태 변경 시 해당 위젯이 rebuild                    |
| **context.read\<T\>()**       | T 타입 Provider를 한 번만 읽음. rebuild 대상이 되지 않음. 이벤트 핸들러에서 사용                  |
| **context.select\<T,R\>()**   | T에서 R 타입의 특정 값만 선택적으로 구독. 해당 값이 변경될 때만 rebuild                           |
| **Consumer\<T\>**             | 위젯 트리 특정 위치에서 T를 구독하는 위젯. rebuild 범위를 좁힐 때 사용                            |
| **Selector\<T,S\>**           | T에서 S 타입 값만 선택해 구독하는 위젯. 선택한 값이 변경될 때만 rebuild                           |
| **MultiProvider**             | 여러 Provider를 중첩 없이 동시에 제공하는 위젯                                                    |
| **ProxyProvider**             | 다른 Provider에 의존하는 Provider. 의존 Provider 변경 시 자동 재계산                              |
| **Dependency Injection (DI)** | 객체가 필요로 하는 의존성을 외부(Provider)에서 주입받는 설계 패턴                                 |
| **dispose()**                 | ChangeNotifierProvider가 트리에서 제거될 때 자동으로 ChangeNotifier.dispose() 호출                |
| **ListenableProvider**        | Listenable 인터페이스를 구현한 모든 객체를 제공 (ChangeNotifier 포함)                             |

---

## 3. 이론적 배경과 원리 ★

### 3.1 ChangeNotifier: 상태와 알림의 핵심

`ChangeNotifier`는 Flutter 내장 클래스로, 상태 데이터와 비즈니스 로직을 담고, 변경 시 구독자에게 알린다.

```dart
// ChangeNotifier 기본 구조
class CartNotifier extends ChangeNotifier {
  // ① 상태 데이터 (private)
  final List<CartItem> _items = [];
  bool _isLoading = false;

  // ② getter: 외부에서 읽을 수 있도록
  List<CartItem> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;
  int get totalCount => _items.fold(0, (sum, item) => sum + item.quantity);
  int get totalPrice => _items.fold(0, (sum, item) => sum + item.price * item.quantity);

  // ③ 비즈니스 로직 메서드
  void addItem(CartItem item) {
    final index = _items.indexWhere((e) => e.id == item.id);
    if (index >= 0) {
      _items[index] = _items[index].copyWith(
        quantity: _items[index].quantity + 1,
      );
    } else {
      _items.add(item);
    }
    notifyListeners();  // ← 구독자에게 변경 알림
  }

  void removeItem(String id) {
    _items.removeWhere((item) => item.id == id);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  Future<void> checkout() async {
    _isLoading = true;
    notifyListeners();           // 로딩 시작 알림

    await Future.delayed(const Duration(seconds: 2));
    _items.clear();

    _isLoading = false;
    notifyListeners();           // 완료 알림
  }
}
```

**notifyListeners()의 동작:**

![notifyListeners 실행 흐름](/developer-open-book/diagrams/step14-notify-flow.svg)

---

### 3.2 Provider 설정: 트리에 상태 주입

`ChangeNotifierProvider`를 위젯 트리 상단에 배치하면, 그 하위의 모든 위젯에서 상태에 접근할 수 있다.

```dart
// main.dart — 앱 최상단에 Provider 배치
void main() {
  runApp(
    // 단일 Provider
    ChangeNotifierProvider(
      create: (_) => CartNotifier(),  // 상태 객체 생성
      child: const MyApp(),
    ),
  );
}

// 여러 Provider를 동시에 제공: MultiProvider
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartNotifier()),
        ChangeNotifierProvider(create: (_) => UserNotifier()),
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
      ],
      child: const MyApp(),
    ),
  );
}
```

**Provider 배치 원칙:**

```
어디에 배치해야 하는가?
──────────────────────────────────────────────────────
  전체 앱에서 필요: MaterialApp 위 또는 runApp 래퍼
  특정 화면 하위에서만 필요: 해당 화면 위젯에서 제공
  특정 위젯 트리에서만 필요: 해당 서브트리 루트에서 제공

  규칙: 해당 상태가 필요한 가장 가까운 공통 조상에 배치
──────────────────────────────────────────────────────
```

---

### 3.3 상태 읽기: watch vs read vs select

#### context.watch\<T\>() — 구독 + rebuild

```dart
@override
Widget build(BuildContext context) {
  // CartNotifier 구독 → notifyListeners() 시 이 위젯 rebuild
  final cart = context.watch<CartNotifier>();

  return Text('장바구니: ${cart.totalCount}개');
}
```

**watch는 build() 안에서만 사용해야 한다.** 이벤트 핸들러나 initState() 안에서 사용하면 오류가 발생한다.

#### context.read\<T\>() — 단순 읽기 (rebuild 없음)

```dart
ElevatedButton(
  onPressed: () {
    // 이벤트 핸들러에서는 read() 사용
    // watch()를 사용하면 리스너가 등록되어 오류 발생 가능
    context.read<CartNotifier>().addItem(item);
  },
  child: const Text('장바구니 추가'),
)
```

#### context.select\<T, R\>() — 특정 값만 구독

```dart
// CartNotifier 전체를 구독하지 않고 totalCount만 구독
// totalCount가 변경될 때만 rebuild
final count = context.select<CartNotifier, int>(
  (cart) => cart.totalCount,
);
Text('$count개');

// price가 변경되도 이 위젯은 rebuild되지 않음!
```

**watch vs read vs select 비교:**

| 메서드          | rebuild 발생        | 사용 위치     | 사용 시나리오           |
| --------------- | ------------------- | ------------- | ----------------------- |
| `watch<T>()`    | ✅ 전체 변경 시     | `build()`     | 상태 전체를 UI에 표시   |
| `read<T>()`     | ❌ 없음             | 이벤트 핸들러 | 메서드 호출, 단순 읽기  |
| `select<T,R>()` | ✅ 선택값 변경 시만 | `build()`     | 상태의 일부만 필요할 때 |

> ⚠️ **함정 주의:** `context.watch()`를 `onPressed` 같은 이벤트 핸들러 안에서 사용하면 안 된다. 이 시점에는 build context가 유효하지 않을 수 있고 리스너 등록이 비정상적으로 동작한다. 이벤트 핸들러에서는 반드시 `context.read()`를 사용한다.

---

### 3.4 Consumer와 Selector: rebuild 범위 최소화

`context.watch()`는 해당 위젯 전체를 rebuild 대상으로 만든다. `Consumer`와 `Selector`를 사용하면 **특정 서브트리만** rebuild 범위로 제한할 수 있다.

```dart
// context.watch() 사용 시: 위젯 전체 rebuild
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartNotifier>(); // ← 전체 rebuild

    return Column(
      children: [
        const HeavyProductDetails(),  // 변경 없어도 rebuild!
        Text('장바구니: ${cart.totalCount}개'),
        ElevatedButton(
          onPressed: () => context.read<CartNotifier>().addItem(item),
          child: const Text('담기'),
        ),
      ],
    );
  }
}

// Consumer 사용 시: 필요한 부분만 rebuild
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const HeavyProductDetails(),  // rebuild 없음 ✅
        Consumer<CartNotifier>(
          builder: (context, cart, child) {
            // cart가 변경될 때만 이 builder만 rebuild
            return Text('장바구니: ${cart.totalCount}개');
          },
        ),
        ElevatedButton(
          onPressed: () => context.read<CartNotifier>().addItem(item),
          child: const Text('담기'),
        ),
      ],
    );
  }
}
```

**Consumer의 child 파라미터 최적화:**

```dart
Consumer<CartNotifier>(
  // child: 변경과 무관한 정적 위젯 → 한 번만 빌드됨
  child: const Icon(Icons.shopping_cart),
  builder: (context, cart, child) {
    return Row(
      children: [
        child!,  // 정적 Icon은 rebuild 없음
        Text('${cart.totalCount}'),  // 이것만 rebuild
      ],
    );
  },
)
```

**Selector: 특정 값 변경 시만 rebuild**

```dart
// CartNotifier 전체 중 totalCount만 감시
Selector<CartNotifier, int>(
  selector: (context, cart) => cart.totalCount,
  builder: (context, count, child) {
    return Badge(
      label: Text('$count'),
      child: child!,
    );
  },
  child: const Icon(Icons.shopping_cart),
)
// → totalPrice가 변경되어도 이 위젯은 rebuild되지 않음
```

---

### 3.5 Dependency Injection(DI)과 Provider

DI는 "객체가 필요로 하는 의존성을 외부에서 주입받는" 설계 패턴이다. Provider는 Flutter에서 DI를 구현하는 가장 일반적인 방법이다.

```dart
// DI 없음: 위젯이 직접 의존성 생성
class UserProfileWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final service = UserService();      // ← 직접 생성
    final repo = UserRepository();      // ← 직접 생성
    // 테스트 시 교체 불가, 매번 새 인스턴스 생성
  }
}

// DI 있음 (Provider): 외부에서 주입
// Provider 설정
ChangeNotifierProvider(
  create: (_) => UserNotifier(
    service: UserService(),      // 의존성을 Provider에서 주입
    repository: UserRepository(),
  ),
  child: ...,
)

// 위젯: 의존성을 알 필요 없음
class UserProfileWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final user = context.watch<UserNotifier>();
    return Text(user.name);
  }
}
```

**테스트 시 DI의 강점:**

```dart
// 실제 앱
ChangeNotifierProvider(
  create: (_) => UserNotifier(service: RealUserService()),
  child: MyApp(),
)

// 테스트 환경
ChangeNotifierProvider(
  create: (_) => UserNotifier(service: MockUserService()),  // Mock 교체
  child: MyApp(),
)
// 서비스 구현을 바꾸어도 위젯 코드 수정 불필요
```

---

### 3.6 ProxyProvider: 의존성 간 연결

한 Provider가 다른 Provider에 의존하는 경우 `ProxyProvider`를 사용한다.

```dart
MultiProvider(
  providers: [
    // 1. 먼저 AuthNotifier 제공
    ChangeNotifierProvider(create: (_) => AuthNotifier()),

    // 2. AuthNotifier에 의존하는 CartNotifier 제공
    ChangeNotifierProxyProvider<AuthNotifier, CartNotifier>(
      create: (_) => CartNotifier(),
      update: (_, auth, previous) {
        // auth가 변경되면 CartNotifier 업데이트
        return previous!..updateUser(auth.currentUser);
      },
    ),
  ],
  child: MyApp(),
)
```

---

### 3.7 Provider 전체 사용 패턴 정리

```dart
// 패턴 1: 기본 watch — 전체 상태 구독
final cart = context.watch<CartNotifier>();
Text('${cart.totalCount}개');

// 패턴 2: read — 이벤트에서 메서드 호출
onPressed: () => context.read<CartNotifier>().addItem(item),

// 패턴 3: select — 특정 필드만 구독
final count = context.select<CartNotifier, int>((c) => c.totalCount);

// 패턴 4: Consumer — 서브트리 rebuild 범위 제한
Consumer<CartNotifier>(
  builder: (_, cart, __) => Text('${cart.totalCount}'),
)

// 패턴 5: Selector — 특정 값 변경 시만 rebuild
Selector<CartNotifier, bool>(
  selector: (_, cart) => cart.isLoading,
  builder: (_, isLoading, __) =>
    isLoading ? const CircularProgressIndicator() : const SizedBox.shrink(),
)
```

---

## 4. 사례 연구

### 4.1 장바구니 시스템 전체 구현

```dart
// 모델
@immutable
class CartItem {
  final String id;
  final String name;
  final int price;
  final int quantity;
  const CartItem({
    required this.id, required this.name,
    required this.price, this.quantity = 1,
  });
  CartItem copyWith({int? quantity}) =>
      CartItem(id: id, name: name, price: price, quantity: quantity ?? this.quantity);
}

// ChangeNotifier
class CartNotifier extends ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);
  int get totalCount => _items.fold(0, (s, i) => s + i.quantity);
  int get totalPrice => _items.fold(0, (s, i) => s + i.price * i.quantity);

  void add(CartItem item) {
    final idx = _items.indexWhere((e) => e.id == item.id);
    if (idx >= 0) {
      _items[idx] = _items[idx].copyWith(quantity: _items[idx].quantity + 1);
    } else {
      _items.add(item);
    }
    notifyListeners();
  }

  void remove(String id) {
    _items.removeWhere((e) => e.id == id);
    notifyListeners();
  }
}

// AppBar 배지: Selector로 count만 구독
AppBar(
  actions: [
    Selector<CartNotifier, int>(
      selector: (_, cart) => cart.totalCount,
      builder: (context, count, _) => Stack(
        children: [
          const Icon(Icons.shopping_cart),
          if (count > 0)
            Positioned(
              right: 0, top: 0,
              child: CircleAvatar(
                radius: 8,
                backgroundColor: Colors.red,
                child: Text('$count',
                    style: const TextStyle(fontSize: 10, color: Colors.white)),
              ),
            ),
        ],
      ),
    ),
  ],
)

// 상품 화면: read()로 메서드 호출
ElevatedButton(
  onPressed: () => context.read<CartNotifier>().add(
    CartItem(id: product.id, name: product.name, price: product.price),
  ),
  child: const Text('장바구니 담기'),
)

// 장바구니 화면: watch()로 전체 목록 표시
class CartScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartNotifier>();
    return Scaffold(
      body: cart.items.isEmpty
          ? const Center(child: Text('장바구니가 비어있습니다'))
          : ListView.builder(
              itemCount: cart.items.length,
              itemBuilder: (_, i) {
                final item = cart.items[i];
                return ListTile(
                  title: Text(item.name),
                  subtitle: Text('${item.quantity}개 × ₩${item.price}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => context.read<CartNotifier>().remove(item.id),
                  ),
                );
              },
            ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('총 합계: ₩${cart.totalPrice}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
```

---

### 4.2 ThemeNotifier: 다크모드 전환

```dart
class ThemeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.system;
  ThemeMode get mode => _mode;

  void setLight() { _mode = ThemeMode.light; notifyListeners(); }
  void setDark()  { _mode = ThemeMode.dark;  notifyListeners(); }
  void setSystem(){ _mode = ThemeMode.system; notifyListeners(); }
  void toggle()   {
    _mode = _mode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }
}

// MaterialApp에서 사용
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final themeMode = context.watch<ThemeNotifier>().mode;
    return MaterialApp(
      theme: ThemeData.light(useMaterial3: true),
      darkTheme: ThemeData.dark(useMaterial3: true),
      themeMode: themeMode,   // ← ThemeNotifier 값 연동
      home: const MainScreen(),
    );
  }
}

// 설정 화면
Switch(
  value: context.watch<ThemeNotifier>().mode == ThemeMode.dark,
  onChanged: (_) => context.read<ThemeNotifier>().toggle(),
)
```

---

### 4.3 FutureProvider로 비동기 데이터 제공

```dart
// FutureProvider: Future 결과를 AsyncValue로 제공
FutureProvider<List<Product>>(
  create: (_) => ProductRepository().fetchAll(),
  initialData: null,
  child: ProductListScreen(),
)

// 화면에서 사용
class ProductListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final products = context.watch<AsyncValue<List<Product>>>();
    return products.when(
      data: (list) => ListView.builder(
        itemCount: list.length,
        itemBuilder: (_, i) => ProductCard(product: list[i]),
      ),
      loading: () => const CircularProgressIndicator(),
      error: (e, _) => Text('오류: $e'),
    );
  }
}
```

---

## 5. 실습

### 5.1 Provider 기반 카운터 앱

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() => runApp(
  ChangeNotifierProvider(
    create: (_) => CounterNotifier(),
    child: const MaterialApp(
      title: 'Provider 카운터',
      home: CounterPage(),
    ),
  ),
);

class CounterNotifier extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() { _count++; notifyListeners(); }
  void decrement() { _count--; notifyListeners(); }
  void reset()     { _count = 0; notifyListeners(); }
}

class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    // 이 build()는 CounterNotifier 변경 시마다 rebuild
    print('CounterPage.build()');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Provider 카운터'),
        // AppBar의 타이틀은 count 변경과 무관 → const 처리
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Consumer로 count 표시 부분만 rebuild
          Consumer<CounterNotifier>(
            builder: (context, counter, child) {
              print('  Consumer.builder() 호출');
              return Text(
                '${counter.count}',
                style: const TextStyle(fontSize: 72, fontWeight: FontWeight.bold),
              );
            },
          ),
          const SizedBox(height: 32),
          // 버튼: read()로 메서드만 호출
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FilledButton.icon(
                onPressed: () => context.read<CounterNotifier>().decrement(),
                icon: const Icon(Icons.remove),
                label: const Text('-1'),
              ),
              const SizedBox(width: 12),
              OutlinedButton(
                onPressed: () => context.read<CounterNotifier>().reset(),
                child: const Text('리셋'),
              ),
              const SizedBox(width: 12),
              FilledButton.icon(
                onPressed: () => context.read<CounterNotifier>().increment(),
                icon: const Icon(Icons.add),
                label: const Text('+1'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

**pubspec.yaml에 추가:**

```yaml
dependencies:
  provider: ^6.1.0
```

**확인 포인트:**

- 버튼 탭 시 `CounterPage.build()`가 호출되는가, `Consumer.builder()`만 호출되는가?
- `context.watch()` 대신 `Consumer`를 사용하면 rebuild 범위가 어떻게 달라지는가?

---

### 5.2 watch/read/select 구분 연습

아래 코드의 빈칸에 `watch`, `read`, `select` 중 적절한 것을 채워라.

```dart
class CartWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // 1. 장바구니 전체 목록 표시 (변경 시 rebuild 필요)
    final cart = context.___<CartNotifier>();

    // 2. 총 금액만 표시 (금액만 바뀔 때 rebuild)
    final totalPrice = context.___<CartNotifier, int>(
      (c) => c.totalPrice,
    );

    return Column(
      children: [
        Text('총 금액: ₩$totalPrice'),
        ...cart.items.map((item) => ListTile(
          title: Text(item.name),
          trailing: IconButton(
            icon: const Icon(Icons.delete),
            // 3. 버튼 핸들러: rebuild 불필요
            onPressed: () => context.___<CartNotifier>().remove(item.id),
          ),
        )),
      ],
    );
  }
}
```

**정답:**

1. `watch` — 전체 목록 표시, 변경 시 rebuild
2. `select` — 특정 값(totalPrice)만 구독
3. `read` — 이벤트 핸들러, rebuild 불필요

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** `notifyListeners()`를 호출하지 않으면 어떻게 되는가?

- A) 앱이 크래시된다
- B) 다음 프레임에 자동으로 알림이 전송된다
- C) **상태는 변경되지만 UI가 업데이트되지 않는다** ✅
- D) ChangeNotifier가 자동으로 감지해 알린다

---

**Q2. [Understand]** `context.read()`를 `build()` 안에서 사용하면 안 되는 이유는?

> **모범 답안:** `context.read()`는 Provider를 구독(listen)하지 않고 현재 값을 한 번만 읽는다. `build()` 안에서 `read()`를 사용하면 상태가 변경되어도 해당 위젯이 rebuild되지 않아 UI가 최신 상태를 반영하지 못한다. `build()`에서 상태를 UI에 반영하려면 `context.watch()` 또는 `Consumer`를 사용해야 한다.

---

**Q3. [Understand]** `Consumer`의 `child` 파라미터는 언제 사용하는가?

> **모범 답안:** `Consumer`의 `builder`는 상태 변경 시마다 호출된다. `builder` 내부에 상태 변경과 무관한 정적 위젯이 있다면 매번 재생성되는 낭비가 발생한다. `child` 파라미터에 정적 위젯을 전달하면 해당 위젯은 단 한 번만 빌드되고, `builder` 함수의 세 번째 인자로 전달받아 재사용할 수 있다.

---

**Q4. [Apply]** `ChangeNotifier`를 상속한 `UserNotifier`에서 사용자 이름을 변경하는 메서드를 작성하라.

```dart
// 모범 답안
class UserNotifier extends ChangeNotifier {
  String _name = '';
  String get name => _name;

  void updateName(String newName) {
    if (_name == newName) return;  // 변경 없으면 알림 생략 (최적화)
    _name = newName;
    notifyListeners();
  }
}
```

---

**Q5. [Analyze]** `context.watch<CartNotifier>()`와 `context.select<CartNotifier, int>((c) => c.totalCount)`의 rebuild 발생 차이를 설명하라.

> **모범 답안:** `watch()`는 `CartNotifier`의 `notifyListeners()`가 호출될 때마다 해당 위젯을 rebuild한다. 즉 `totalPrice`, `isLoading`, `items` 등 어떤 값이 변경되어도 rebuild된다. `select()`는 선택 함수(`(c) => c.totalCount`)의 반환값이 이전과 다를 때만 rebuild한다. `totalPrice`가 변경되어도 `totalCount`가 그대로라면 rebuild되지 않는다. 복잡한 상태 객체에서 일부 값만 필요한 위젯에 `select()`를 사용하면 불필요한 rebuild를 크게 줄일 수 있다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **ChangeNotifier**는 상태 데이터·비즈니스 로직을 담고, `notifyListeners()`로 구독자에게 변경을 알린다.
- **ChangeNotifierProvider**로 상태를 위젯 트리에 주입하며, 트리에서 제거 시 `dispose()`가 자동 호출된다.
- **watch()**: build()에서 구독·rebuild, **read()**: 이벤트 핸들러에서 단순 읽기, **select()**: 특정 값만 구독.
- **Consumer**로 서브트리만 rebuild 대상으로 제한하고, `child` 파라미터로 정적 부분을 최적화한다.
- **Selector**로 ChangeNotifier 중 특정 값만 구독해 불필요한 rebuild를 방지한다.
- **DI 패턴**: Provider가 의존성을 외부에서 주입해 위젯 코드와 서비스 로직을 분리하고 테스트 용이성을 높인다.

### 6.2 다음 Step 예고

- **Step 15 — 고급 상태관리(Riverpod·Bloc):** Provider의 한계를 개선한 Riverpod의 핵심 개념과, 대규모 팀에서 선호하는 Bloc/Cubit의 이벤트 기반 아키텍처를 학습한다.

### 6.3 참고 자료

| 자료                        | 링크                                                                       | 설명                 |
| --------------------------- | -------------------------------------------------------------------------- | -------------------- |
| Provider 공식 문서          | <https://pub.dev/packages/provider>                                          | Provider 패키지      |
| Provider GitHub             | <https://github.com/rrousselGit/provider>                                    | 소스코드 및 예제     |
| Flutter Cookbook — Provider | <https://docs.flutter.dev/data-and-backend/state-mgmt/simple>                | 공식 상태관리 가이드 |
| ChangeNotifier API          | <https://api.flutter.dev/flutter/foundation/ChangeNotifier-class.html>       | API 문서             |
| Consumer API                | <https://pub.dev/documentation/provider/latest/provider/Consumer-class.html> | Consumer 문서        |

### 6.4 FAQ

**Q. Provider와 InheritedWidget의 차이는?**

> Provider는 InheritedWidget을 래핑한 패키지다. InheritedWidget을 직접 사용하면 boilerplate 코드가 많고 상태 변경 알림 로직을 직접 구현해야 한다. Provider는 이를 추상화해 `ChangeNotifier`·`watch()`·`read()` 같은 편리한 API를 제공한다. 기능적으로는 동일하며 Provider가 내부적으로 InheritedWidget을 사용한다.

**Q. ChangeNotifier를 `dispose()`해야 하는가?**

> `ChangeNotifierProvider`가 자동으로 처리한다. Provider가 위젯 트리에서 제거될 때 내부적으로 `ChangeNotifier.dispose()`를 호출한다. 단, `AnimationController`처럼 ChangeNotifier 내부에서 생성한 리소스는 ChangeNotifier의 `dispose()` 메서드를 직접 오버라이드해 해제해야 한다.

**Q. Provider의 단점은 무엇인가?**

> ① 타입 기반 조회이므로 같은 타입의 Provider를 두 개 이상 제공하기 어렵다. ② `context`에 의존하므로 위젯 트리 외부(순수 Dart 코드)에서 접근이 번거롭다. ③ 컴파일 타임 안전성이 Riverpod보다 낮다. 이러한 한계를 개선한 것이 Riverpod이다.

---

## 빠른 자가진단 체크리스트

- [ ] ChangeNotifier에서 notifyListeners()를 언제, 왜 호출하는지 설명할 수 있는가?
- [ ] ChangeNotifierProvider를 어디에 배치해야 하는지 설명할 수 있는가?
- [ ] watch()·read()·select()의 차이와 사용 위치를 설명할 수 있는가?
- [ ] Consumer의 child 파라미터가 rebuild 최적화에 어떻게 도움이 되는지 설명할 수 있는가?
- [ ] Provider가 DI를 구현하는 방식을 설명할 수 있는가?
- [ ] MultiProvider로 여러 상태를 동시에 제공하는 코드를 작성할 수 있는가?
- [ ] ⚠️ 함정 체크: context.watch()를 이벤트 핸들러에서 사용하면 안 되는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: notifyListeners() 없이 상태를 변경하면 UI가 갱신되지 않는다는 것을 이해했는가?
