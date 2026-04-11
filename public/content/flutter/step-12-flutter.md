# Step 12 — Flutter 상태관리 개념

> **파트:** 4️⃣ 상태 관리 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Local State와 Global State의 정의와 차이를 나열할 수 있다.
2. **[Understand]** Reactive UI 패턴에서 "상태가 변하면 UI가 자동으로 다시 그려진다"는 원리를 설명할 수 있다.
3. **[Understand]** 상태 끌어올리기(State Lifting)가 필요한 이유와 방법을 설명할 수 있다.
4. **[Understand]** Flutter의 주요 상태관리 솔루션들의 개념과 적합한 사용 시나리오를 설명할 수 있다.
5. **[Analyze]** 주어진 UI 시나리오에서 Local State와 Global State 중 어느 것이 적합한지 판단할 수 있다.
6. **[Analyze]** 상태관리 솔루션 선택 시 고려해야 할 기준을 분석할 수 있다.

**전제 지식:** Step 01~11 완료, StatefulWidget·setState(Step 05), BuildContext·InheritedWidget(Step 04·08)

---

## 1. 서론

### 1.1 상태(State)란 무엇인가

Flutter에서 **상태(State)**는 UI가 의존하는 모든 데이터를 말한다. 상태가 변하면 UI가 변한다.

```
상태의 예시
──────────────────────────────────────────────────
  카운터 값         → 숫자가 바뀌면 Text 위젯이 바뀜
  로그인 여부       → true/false에 따라 보이는 화면이 다름
  서버에서 받은 목록 → 데이터가 오면 ListView가 채워짐
  선택된 탭 인덱스  → 바뀌면 다른 화면을 보여줌
  다크모드 설정     → 앱 전체 테마가 바뀜
  장바구니 아이템   → 어디서든 추가/삭제 가능해야 함
──────────────────────────────────────────────────
```

### 1.2 왜 상태관리가 어려운가

단일 위젯 안에서만 사용하는 상태는 `setState()`로 충분하다. 문제는 **여러 위젯이 같은 상태를 공유하거나 서로 다른 화면에서 상태를 변경해야 할 때**다.

```
상태 공유 문제 예시
──────────────────────────────────────────────────
  상품 상세 화면 ──→ [장바구니에 담기]
                          ↓
                  장바구니 아이콘의 뱃지 숫자 변경
                          ↓
  AppBar의 CartIcon도 알아야 함
  BottomNavigationBar의 장바구니 탭도 알아야 함

  이 세 위젯이 서로 다른 위치에 있을 때,
  setState()만으로는 상태를 공유하기 어렵다
──────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

```
Flutter 상태관리
    │
    ├── 상태 분류
    │     ├── Local State   ← 단일 위젯 내부 상태
    │     └── Global State  ← 여러 위젯이 공유하는 상태
    │
    ├── Reactive UI 원칙
    │     상태 변경 → UI 자동 재구성
    │
    ├── 상태 끌어올리기 (State Lifting)
    │     공유가 필요한 상태를 공통 조상 위젯으로 이동
    │
    └── 상태관리 솔루션 (복잡도 순)
          setState       ← Local State 기본
          InheritedWidget← Flutter 내장, 저수준
          Provider       ← InheritedWidget 래퍼, 단순
          Riverpod       ← Provider 개선, 타입 안전
          Bloc/Cubit     ← 이벤트 기반, 대규모 앱
          GetX           ← 경량, 빠른 개발
```

---

## 2. 기본 개념과 용어

| 용어                          | 정의                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **State (상태)**              | UI가 의존하는 모든 데이터. 상태가 변하면 UI가 변한다                                          |
| **Local State**               | 단일 위젯 또는 위젯 트리의 일부에서만 사용되는 상태                                           |
| **Global State**              | 앱 전체 또는 여러 화면에 걸쳐 공유되는 상태                                                   |
| **Reactive UI**               | 상태 변경이 UI 재구성을 자동으로 유발하는 프로그래밍 패턴                                     |
| **State Lifting**             | 두 위젯이 상태를 공유해야 할 때, 상태를 공통 조상 위젯으로 이동시키는 기법                    |
| **Prop Drilling**             | 상태를 여러 계층의 자식 위젯에게 연속으로 전달하는 패턴. 위젯 트리가 깊을수록 관리가 어려워짐 |
| **Single Source of Truth**    | 특정 데이터의 출처(원천)가 앱 전체에서 하나뿐이어야 한다는 원칙                               |
| **ChangeNotifier**            | 상태 변경을 리스너에게 알리는 Flutter 내장 믹스인 클래스                                      |
| **Provider**                  | InheritedWidget을 래핑해 상태를 위젯 트리에 주입하는 패키지                                   |
| **Riverpod**                  | Provider의 한계를 개선한 상태관리 패키지. 컴파일 타임 안전성, 위젯 트리 독립적                |
| **Bloc**                      | Business Logic Component. 이벤트(Event) → 상태(State) 변환을 Stream으로 처리                  |
| **Cubit**                     | Bloc의 경량 버전. 이벤트 없이 메서드 호출로 상태 변경                                         |
| **GetX**                      | 상태관리·내비게이션·DI를 통합한 경량 패키지                                                   |
| **Dependency Injection (DI)** | 객체가 필요로 하는 의존성을 외부에서 주입하는 설계 패턴                                       |
| **Immutable State**           | 상태 객체를 불변으로 만들어 예측 가능성을 높이는 접근법                                       |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Reactive UI: 상태 → UI 자동 재구성

Flutter의 핵심 설계 철학은 **Reactive UI**다. 개발자가 직접 "이 텍스트를 새 값으로 바꿔라"고 명령하는 것이 아니라, 상태를 변경하면 Flutter가 알아서 영향받는 UI를 재구성한다.

```
명령형(Imperative) UI — 다른 프레임워크
────────────────────────────────────────────
  counter++
  textView.setText("카운트: " + counter)   ← 개발자가 직접 변경
  badge.setCount(counter)                   ← 연관 UI도 직접 업데이트

Reactive UI — Flutter
────────────────────────────────────────────
  setState(() => counter++)   ← 상태만 변경
  // Flutter가 관련 위젯을 자동으로 rebuild
  // build()가 항상 최신 상태를 반영하는 UI를 반환
```

```dart
// build()는 현재 상태의 "스냅샷"을 반환한다
@override
Widget build(BuildContext context) {
  // _counter가 무엇이든 간에 항상 올바른 UI를 반환
  return Text('카운트: $_counter');
  // setState()로 _counter가 바뀌면 이 build()가 다시 호출됨
}
```

이 패턴의 장점은 **UI가 항상 상태와 일치한다는 보장**이다. "상태를 바꿨는데 UI가 안 바뀌었다"는 버그가 구조적으로 발생하지 않는다.

---

### 3.2 Local State vs Global State

#### Local State: 단일 위젯 내부

```
Local State의 특징
────────────────────────────────────────────
  • 해당 위젯과 직접 자식들만 사용
  • 위젯이 트리에서 제거되면 상태도 사라짐
  • setState()로 관리
  • 다른 위젯과 공유 불필요

Local State의 예시
────────────────────────────────────────────
  폼 입력 필드의 현재 값
  버튼의 로딩 상태 (true/false)
  탭 위젯의 현재 선택 인덱스
  애니메이션 진행 상태
  비밀번호 표시/숨기기 토글
  펼침/접힘 상태 (ExpansionTile)
```

#### Global State: 앱 전체 공유

```
Global State의 특징
────────────────────────────────────────────
  • 여러 화면·위젯이 동시에 읽고 변경
  • 앱이 실행되는 동안 지속
  • 상태관리 솔루션 필요 (Provider, Riverpod 등)
  • Single Source of Truth 원칙 적용

Global State의 예시
────────────────────────────────────────────
  로그인한 사용자 정보 (어느 화면에서나 필요)
  장바구니 목록 (상품 상세·장바구니·결제 화면 공유)
  다크모드 설정 (앱 전체 영향)
  알림 개수 (AppBar 뱃지·설정 화면 공유)
  언어/지역 설정
```

**판단 기준:**

```
"이 상태를 다른 화면이나 위젯도 알아야 하는가?"
    YES → Global State (상태관리 솔루션 사용)
    NO  → Local State (setState() 충분)
```

---

### 3.3 State Lifting: 상태 끌어올리기

두 형제 위젯이 같은 상태를 공유해야 할 때, 상태를 두 위젯의 **공통 조상 위젯**으로 이동하고 자식들에게 콜백으로 전달하는 기법이다.

```
State Lifting 전 (문제 상황)
────────────────────────────────────────────
  ProductCard (자체 장바구니 수량 관리)
  CartIcon    (장바구니 수량을 독립적으로 관리)
  → 두 위젯의 수량이 불일치 가능

State Lifting 후 (해결)
────────────────────────────────────────────
  ShopPage (공통 조상)
    ├── cartCount 상태 관리
    ├── ProductCard (cartCount 변경 콜백 수신)
    └── CartIcon (cartCount 값 수신)
  → 상태가 한 곳에만 있어 항상 일치
```

```dart
// 공통 조상 위젯
class ShopPage extends StatefulWidget {
  const ShopPage({super.key});
  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  int _cartCount = 0;  // ← 상태를 여기서 관리

  void _addToCart() => setState(() => _cartCount++);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          // 상태 값을 CartIcon에 전달
          CartIcon(count: _cartCount),
        ],
      ),
      body: ProductList(
        // 상태 변경 콜백을 ProductCard에 전달
        onAddToCart: _addToCart,
      ),
    );
  }
}

// 자식 위젯 1: 상태를 읽기만 함
class CartIcon extends StatelessWidget {
  final int count;
  const CartIcon({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Stack(
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
    );
  }
}

// 자식 위젯 2: 상태 변경 콜백을 호출함
class ProductList extends StatelessWidget {
  final VoidCallback onAddToCart;
  const ProductList({super.key, required this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onAddToCart,  // 콜백 호출 → 부모 상태 변경
      child: const Text('장바구니에 담기'),
    );
  }
}
```

---

### 3.4 Prop Drilling 문제

State Lifting은 위젯 계층이 깊어질수록 한계에 부딪힌다.

```
Prop Drilling 문제
────────────────────────────────────────────
  AppPage (상태 보유)
    └── SectionWidget (사용 안 하지만 전달)
          └── ListWidget (사용 안 하지만 전달)
                └── ItemWidget (사용 안 하지만 전달)
                      └── IconWidget ← 실제 사용 위젯

  상태가 5단계를 거쳐 전달됨
  중간 위젯들은 상태를 사용하지도 않으면서 전달만 함
  위젯 인터페이스가 복잡해지고 유지보수가 어려워짐
```

이 문제를 해결하기 위해 `InheritedWidget`, `Provider`, `Riverpod` 같은 솔루션이 등장했다. 이들은 중간 위젯을 거치지 않고 **필요한 위젯이 직접 상태를 가져오는** 방식을 제공한다.

```
Provider/Riverpod 방식
────────────────────────────────────────────
  AppPage (Provider로 상태 제공)
    └── SectionWidget (상태 무관)
          └── ListWidget (상태 무관)
                └── ItemWidget (상태 무관)
                      └── IconWidget
                            ← context.watch<CartState>()
                               바로 여기서 직접 가져옴!
```

---

### 3.5 Flutter 상태관리 솔루션 비교

#### setState (Flutter 내장)

```dart
// 가장 기본, Local State에 최적
setState(() => _count++);
```

| 항목           | 평가              |
| -------------- | ----------------- |
| 학습 곡선      | ⭐ (매우 낮음)    |
| 적합한 규모    | 단일 위젯, 소규모 |
| Global State   | ❌ 어려움         |
| 보일러플레이트 | 거의 없음         |

#### Provider (권장 입문 솔루션)

```dart
// ChangeNotifier로 상태 정의
class CartNotifier extends ChangeNotifier {
  int _count = 0;
  int get count => _count;
  void add() { _count++; notifyListeners(); }
}

// 트리에 제공
ChangeNotifierProvider(create: (_) => CartNotifier(), child: MyApp())

// 어디서든 읽기
final cart = context.watch<CartNotifier>();
Text('${cart.count}');

// 변경
context.read<CartNotifier>().add();
```

| 항목           | 평가        |
| -------------- | ----------- |
| 학습 곡선      | ⭐⭐ (낮음) |
| 적합한 규모    | 소~중규모   |
| Global State   | ✅          |
| 보일러플레이트 | 적음        |

#### Riverpod (타입 안전, 현대적)

```dart
// 프로바이더 정의 (위젯 트리 밖에서)
final cartProvider = StateNotifierProvider<CartNotifier, int>((ref) => CartNotifier());

// Widget에서 읽기
class CartIcon extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider);
    return Text('$count');
  }
}

// 변경
ref.read(cartProvider.notifier).add();
```

| 항목             | 평가          |
| ---------------- | ------------- |
| 학습 곡선        | ⭐⭐⭐ (중간) |
| 적합한 규모      | 중~대규모     |
| Global State     | ✅            |
| 타입 안전성      | 최상          |
| 컴파일 타임 검증 | ✅            |

#### Bloc/Cubit (이벤트 기반)

```dart
// Cubit: 메서드 호출로 상태 변경
class CartCubit extends Cubit<int> {
  CartCubit() : super(0);
  void add() => emit(state + 1);
}

// BlocBuilder로 UI 연결
BlocBuilder<CartCubit, int>(
  builder: (context, count) => Text('$count'),
)
```

| 항목           | 평가            |
| -------------- | --------------- |
| 학습 곡선      | ⭐⭐⭐⭐ (높음) |
| 적합한 규모    | 대규모          |
| 테스트 용이성  | 최상            |
| 보일러플레이트 | 많음            |

---

### 3.6 상태관리 솔루션 선택 기준

```
선택 플로차트
────────────────────────────────────────────────────
  단일 위젯 내부 상태?
    YES → setState()

  여러 위젯이 공유하는 상태?
    ↓
  앱 규모가 소~중?
    YES → Provider (입문·중급)
    ↓
  타입 안전·테스트·의존성 주입 중요?
    YES → Riverpod (중~대규모 권장)
    ↓
  이벤트 기반 아키텍처 필요?
    YES → Bloc/Cubit (대규모·팀 프로젝트)
────────────────────────────────────────────────────
```

**2026년 Flutter 커뮤니티 트렌드:**

```
인기 순위 (pub.dev 다운로드 기준)
  1위: Riverpod     ← 신규 프로젝트 표준으로 자리잡음
  2위: Provider     ← 레거시 프로젝트 유지·입문용
  3위: Bloc/Cubit   ← 엔터프라이즈·금융·대규모 팀
  4위: GetX         ← 빠른 프로토타이핑
```

---

### 3.7 상태 불변성(Immutability)의 중요성

상태 객체를 불변으로 만들면 상태 변경을 추적하기 쉽고, 예측 불가능한 버그가 줄어든다.

```dart
// ❌ 가변(Mutable) 상태 - 문제 발생 가능
class CartState {
  List<Item> items = [];   // 직접 수정 가능 → 추적 어려움
}

// 변경
state.items.add(newItem);  // notifyListeners() 없이 변경 가능 → UI 미반영

// ✅ 불변(Immutable) 상태 - Riverpod/Bloc 권장 방식
@immutable
class CartState {
  final List<Item> items;
  const CartState({this.items = const []});

  // copyWith 패턴으로 새 객체 생성
  CartState copyWith({List<Item>? items}) =>
      CartState(items: items ?? this.items);
}

// 변경 (새 객체 생성)
emit(state.copyWith(items: [...state.items, newItem]));
// → 이전 상태와 새 상태를 명확히 구분 가능
```

---

## 4. 사례 연구

### 4.1 쇼핑 앱 상태 분류 실습

쇼핑 앱의 모든 상태를 Local/Global로 분류해보자.

| 상태                  | Local / Global | 이유                         |
| --------------------- | -------------- | ---------------------------- |
| 로그인한 사용자 정보  | **Global**     | 모든 화면에서 필요           |
| 상품 검색어           | **Local**      | 검색 화면에서만 사용         |
| 장바구니 목록         | **Global**     | 상세·장바구니·결제 화면 공유 |
| 비밀번호 표시/숨기기  | **Local**      | 해당 TextField에서만 사용    |
| 알림 개수             | **Global**     | AppBar·설정 화면 공유        |
| 상품 상세의 수량 선택 | **Local**      | 상세 화면에서만 임시 사용    |
| 다크모드 설정         | **Global**     | 앱 전체 영향                 |
| 이미지 뷰어 확대 배율 | **Local**      | 해당 뷰어에서만 사용         |

---

### 4.2 Prop Drilling의 실제 고통

```dart
// 5단계 Prop Drilling 예시 — 유지보수 지옥
class PageA extends StatelessWidget {
  final User user;   // 사용 안 하지만 B에 전달해야 함
  const PageA({super.key, required this.user});

  @override
  Widget build(BuildContext context) => WidgetB(user: user);
}

class WidgetB extends StatelessWidget {
  final User user;   // 사용 안 하지만 C에 전달해야 함
  const WidgetB({super.key, required this.user});

  @override
  Widget build(BuildContext context) => WidgetC(user: user);
}

class WidgetC extends StatelessWidget {
  final User user;   // 여기서 드디어 사용
  const WidgetC({super.key, required this.user});

  @override
  Widget build(BuildContext context) => Text('안녕, ${user.name}');
}

// Provider 방식: 중간 위젯 수정 없이 직접 접근
class WidgetC extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final user = context.watch<UserProvider>().user;
    return Text('안녕, ${user.name}');
  }
}
```

---

### 4.3 실제 앱의 상태 아키텍처 사례

대형 한국 앱의 상태 계층 구조 (참고용):

```
카카오톡 스타일 상태 구조
──────────────────────────────────────────────────────
  Global State (앱 전체)
    ├── AuthState        (로그인 여부·토큰)
    ├── UserProfileState (프로필 정보)
    ├── ChatsState       (채팅 목록)
    └── NotificationState(알림 뱃지)

  Screen-Level State (화면 단위)
    ├── ChatRoomState    (특정 채팅방 메시지)
    ├── SearchState      (검색 결과)
    └── MediaViewerState (미디어 뷰어 상태)

  Local State (위젯 단위)
    ├── MessageInputText (입력 중인 텍스트)
    ├── EmojiKeyboardVisible (이모지 키보드 표시)
    └── ScrollPosition   (스크롤 위치)
──────────────────────────────────────────────────────
```

---

## 5. 실습

### 5.1 상태 분류 연습

아래 날씨 앱의 각 상태가 Local인지 Global인지 판단하고 이유를 서술하라.

```
날씨 앱 기능
1. 현재 위치의 날씨 데이터 (온도, 습도, 날씨 아이콘)
2. 즐겨찾기한 도시 목록
3. 섭씨/화씨 단위 설정
4. 주간 예보 펼침/접힘 상태
5. 도시 검색창의 현재 입력값
6. 로딩 중 여부 (날씨 데이터 요청 중)
7. 사용자가 선택한 배경 테마
```

**모범 답안:**

| 상태               | 분류   | 이유                                                        |
| ------------------ | ------ | ----------------------------------------------------------- |
| 현재 날씨 데이터   | Global | 여러 화면(홈·상세·위젯)에서 공유                            |
| 즐겨찾기 도시 목록 | Global | 홈·검색·설정 화면 공유, 앱 재시작 후에도 유지               |
| 섭씨/화씨 설정     | Global | 앱 전체 모든 온도 표시에 영향                               |
| 예보 펼침/접힘     | Local  | 해당 카드 위젯에서만 사용                                   |
| 검색창 입력값      | Local  | 검색 화면의 TextField에서만 사용                            |
| 로딩 중 여부       | Local  | 해당 화면의 요청 상태이므로 로컬 (단, 전역 로딩이면 Global) |
| 배경 테마          | Global | 앱 전체 시각적 스타일에 영향                                |

---

### 5.2 State Lifting 구현

아래 두 위젯이 같은 카운터 값을 공유하도록 State Lifting을 적용하라.

```dart
// Before: 각자 독립된 상태 → 동기화 불가
class CounterDisplay extends StatefulWidget { ... }
class CounterButtons extends StatefulWidget { ... }

// After: 공통 조상으로 상태 끌어올리기
// CounterPage가 상태를 관리하고, 자식들에게 값과 콜백 전달
```

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: CounterPage()));

// ✅ 공통 조상: 상태 관리
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('State Lifting 예시')),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 상태 값 전달
          CounterDisplay(count: _count),
          const SizedBox(height: 24),
          // 상태 변경 콜백 전달
          CounterButtons(
            onIncrement: () => setState(() => _count++),
            onDecrement: () => setState(() => _count--),
            onReset:     () => setState(() => _count = 0),
          ),
        ],
      ),
    );
  }
}

// StatelessWidget: 값만 표시
class CounterDisplay extends StatelessWidget {
  final int count;
  const CounterDisplay({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count',
            style: Theme.of(context).textTheme.displayLarge
                ?.copyWith(fontWeight: FontWeight.bold)),
        Text(
          count > 0 ? '양수' : count < 0 ? '음수' : '0',
          style: TextStyle(
            color: count > 0 ? Colors.green
                : count < 0 ? Colors.red : Colors.grey,
          ),
        ),
      ],
    );
  }
}

// StatelessWidget: 콜백만 실행
class CounterButtons extends StatelessWidget {
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onReset;

  const CounterButtons({
    super.key,
    required this.onIncrement,
    required this.onDecrement,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton.filled(
            onPressed: onDecrement, icon: const Icon(Icons.remove)),
        const SizedBox(width: 16),
        OutlinedButton(onPressed: onReset, child: const Text('리셋')),
        const SizedBox(width: 16),
        IconButton.filled(
            onPressed: onIncrement, icon: const Icon(Icons.add)),
      ],
    );
  }
}
```

**확인 포인트:**

- `CounterDisplay`와 `CounterButtons`는 모두 StatelessWidget인가?
- 상태(`_count`)는 오직 `CounterPage`에서만 관리되는가?
- `CounterDisplay`가 카운트 값에 따라 색상과 텍스트가 바뀌는가?

---

### 5.3 자가 평가 퀴즈

**Q1. [Remember]** Local State와 Global State를 구분하는 핵심 기준은?

- A) 상태 변수의 타입 (int, String, List 등)
- B) **다른 위젯이나 화면과 공유 여부** ✅
- C) StatefulWidget에 있는지 여부
- D) 화면 전환 후에도 유지되는지 여부

---

**Q2. [Understand]** Reactive UI에서 개발자가 직접 하지 않아도 되는 것은?

- A) 상태 변수 선언
- B) setState() 또는 notifyListeners() 호출
- C) **상태 변경 후 UI 위젯을 직접 찾아 값을 업데이트하는 것** ✅
- D) 비즈니스 로직 작성

---

**Q3. [Understand]** Prop Drilling의 문제점을 설명하라.

> **모범 답안:** 상태가 필요한 위젯이 위젯 트리 깊은 곳에 있을 때, 중간에 있는 모든 위젯이 해당 상태를 사용하지도 않으면서 자식에게 전달하기 위해 생성자 파라미터로 받아야 한다. 위젯 계층이 깊어질수록 모든 중간 위젯의 인터페이스가 복잡해지고, 상태 구조가 변경될 때 중간 위젯들을 모두 수정해야 하므로 유지보수가 어려워진다.

---

**Q4. [Analyze]** 다음 중 Global State로 관리해야 하는 것은?

- A) 폼의 현재 입력값
- B) 이미지 뷰어의 확대 배율
- C) **로그인한 사용자의 JWT 토큰** ✅
- D) 버튼의 로딩 중 여부

---

**Q5. [Analyze]** 소규모 앱에서 시작해 중규모로 성장할 것이 예상되는 프로젝트의 상태관리 솔루션으로 가장 적합한 것은?

- A) setState()만 사용 — 추후 마이그레이션 필요
- B) Bloc — 강력하지만 보일러플레이트 과다
- C) **Riverpod — 중규모 이상에서도 확장성, 타입 안전** ✅
- D) GetX — 편리하지만 관행에서 벗어난 패턴

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **State**는 UI가 의존하는 모든 데이터이며, 상태가 변하면 Flutter가 자동으로 UI를 재구성한다(**Reactive UI**).
- **Local State**는 단일 위젯 내부에서만 사용(setState 충분), **Global State**는 여러 위젯·화면이 공유(상태관리 솔루션 필요).
- **State Lifting**으로 공유 상태를 공통 조상으로 이동시켜 Single Source of Truth를 유지한다.
- **Prop Drilling**은 위젯 계층이 깊을 때 상태 전달이 복잡해지는 문제이며, Provider/Riverpod으로 해결한다.
- **솔루션 선택**: 소규모 → setState/Provider, 중~대규모 → Riverpod, 대규모 팀 → Bloc/Cubit.
- **불변 상태(Immutable State)**는 상태 추적을 쉽게 하고 버그를 예방한다.

### 6.2 다음 Step 예고

- **Step 13 — setState 심화:** setState의 동작 원리, rebuild 메커니즘, ValueKey를 활용한 불필요한 rebuild 최적화를 상세히 학습한다.

### 6.3 참고 자료

| 자료                       | 링크                                                           | 설명              |
| -------------------------- | -------------------------------------------------------------- | ----------------- |
| Flutter 상태관리 공식 문서 | <https://docs.flutter.dev/data-and-backend/state-mgmt/intro>   | 상태관리 개요     |
| Flutter 상태관리 옵션 비교 | <https://docs.flutter.dev/data-and-backend/state-mgmt/options> | 솔루션 목록       |
| Provider 공식 문서         | <https://pub.dev/packages/provider>                            | Provider 패키지   |
| Riverpod 공식 문서         | <https://riverpod.dev>                                         | Riverpod 패키지   |
| Bloc 공식 문서             | <https://bloclibrary.dev>                                      | Bloc/Cubit 패키지 |

### 6.4 FAQ

**Q. 모든 상태를 Global로 관리하면 편하지 않은가?**

> 그렇지 않다. 모든 상태를 전역으로 올리면 상태 변경이 예상치 못한 위젯에 영향을 줄 수 있고, 테스트와 디버깅이 어려워진다. 또한 위젯이 destroy될 때 자동으로 사라져야 할 상태(예: 폼 입력값)를 전역으로 관리하면 메모리 누수나 상태 오염이 발생할 수 있다. 상태는 가능한 한 작은 범위에서 관리하는 것이 원칙이다.

**Q. Flutter 팀이 공식 권장하는 상태관리 솔루션은?**

> Flutter 팀은 특정 솔루션을 강제하지 않지만, 공식 문서에서 Provider와 Riverpod을 주요 예시로 제시한다. 최근에는 Riverpod이 더 많이 언급되는 추세다. 팀의 경험과 앱 규모에 맞게 선택하는 것이 중요하다.

**Q. setState와 Provider를 같은 프로젝트에서 혼용해도 되는가?**

> 그렇다. 오히려 권장되는 패턴이다. Local State(버튼 로딩, 폼 입력 등)는 setState로, Global State(사용자 정보, 장바구니 등)는 Provider/Riverpod으로 관리하는 방식이 일반적이다.

---

## 빠른 자가진단 체크리스트

- [ ] Local State와 Global State의 차이를 예시와 함께 설명할 수 있는가?
- [ ] Reactive UI가 명령형 UI와 다른 점을 설명할 수 있는가?
- [ ] State Lifting이 필요한 상황을 코드로 설명할 수 있는가?
- [ ] Prop Drilling 문제가 무엇인지 설명할 수 있는가?
- [ ] Provider·Riverpod·Bloc의 적합한 사용 규모를 구분할 수 있는가?
- [ ] 주어진 상태를 Local/Global로 분류할 수 있는가?
- [ ] ⚠️ 함정 체크: 모든 상태를 Global로 관리하면 안 되는 이유를 설명할 수 있는가?
