# Step 13 — setState 심화

> **파트:** 4️⃣ 상태 관리 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** setState() 호출이 Element Tree와 RenderObject Tree에 미치는 영향을 설명할 수 있다.
2. **[Understand]** Flutter의 rebuild 최적화 메커니즘(dirty marking, Element 재사용)을 설명할 수 있다.
3. **[Understand]** const 위젯과 ValueKey가 불필요한 rebuild를 막는 원리를 설명할 수 있다.
4. **[Apply]** Flutter DevTools의 Widget Rebuild 지표를 활용해 불필요한 rebuild를 진단할 수 있다.
5. **[Apply]** ValueKey로 리스트 아이템 rebuild를 최적화할 수 있다.
6. **[Analyze]** 주어진 위젯 트리에서 setState() 호출 시 실제로 rebuild되는 범위를 분석할 수 있다.

**전제 지식:** Step 04(Three Trees), Step 05(StatefulWidget·Lifecycle), Step 12(상태관리 개념)

---

## 1. 서론

### 1.1 setState는 간단해 보이지만…

`setState()`는 Flutter에서 가장 자주 쓰는 메서드 중 하나다. 하지만 내부에서 어떤 일이 일어나는지 모르면, 앱이 커질수록 예상치 못한 성능 문제를 만나게 된다.

```dart
// 이 한 줄이 실제로 하는 일은?
setState(() => _count++);

// 내부에서 일어나는 일:
// 1. 콜백 실행 (_count 변경)
// 2. 해당 Element를 "dirty"로 표시
// 3. 다음 프레임에서 dirty Element의 build() 재호출
// 4. 새 Widget Tree와 기존 Element Tree 비교(reconciliation)
// 5. 변경된 부분만 RenderObject 업데이트
```

### 1.2 왜 rebuild 범위를 이해해야 하는가

```
잘못된 setState 사용의 결과
──────────────────────────────────────────────────────
  최상위 위젯에서 setState() 호출
       ↓
  앱 전체 위젯 트리 rebuild
       ↓
  매 탭마다 수백 개의 위젯 build() 호출
       ↓
  프레임 예산(16.6ms) 초과 → Jank 발생
──────────────────────────────────────────────────────
```

rebuild 범위를 최소화하는 것이 Flutter 성능 최적화의 핵심이다.

### 1.3 전체 개념 지도

```
setState 심화
    │
    ├── 동작 원리
    │     ├── dirty marking
    │     ├── build() 재호출 범위
    │     └── reconciliation
    │
    ├── rebuild 최소화 전략
    │     ├── const 위젯
    │     ├── 위젯 분리 (extract)
    │     └── ValueKey를 통한 Element 재사용 제어
    │
    └── 디버깅 도구
          ├── Flutter DevTools — Rebuild counts
          ├── debugPrintRebuildDirtyWidgets
          └── Performance Overlay
```

---

## 2. 기본 개념과 용어

| 용어                 | 정의                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **dirty**            | Element가 rebuild가 필요한 상태임을 표시하는 플래그. setState() 호출 시 해당 Element가 dirty로 표시됨 |
| **clean**            | rebuild가 필요 없는 Element 상태                                                                      |
| **markNeedsBuild()** | Element를 dirty로 표시하고 다음 프레임에 rebuild를 예약하는 내부 메서드                               |
| **reconciliation**   | 새로 생성된 Widget Tree와 기존 Element Tree를 비교해 최소 변경만 반영하는 과정                        |
| **rebuild 범위**     | setState() 호출 시 실제로 build()가 재호출되는 위젯의 범위. 호출한 StatefulWidget부터 그 자손 전체    |
| **ValueKey**         | 위젯의 값(value) 기반 Key. 동일한 값이면 같은 Element를 재사용해 State 유지                           |
| **UniqueKey**        | 매번 새로운 고유 Key 생성. 강제로 Element·State를 재생성할 때 사용                                    |
| **RepaintBoundary**  | 자식 위젯의 repaint를 부모와 독립적으로 관리하는 위젯. 레이어를 분리해 불필요한 repaint 방지          |
| **shouldRebuild**    | InheritedWidget이 자손에게 rebuild를 전파할지 결정하는 메서드                                         |
| **rebuild count**    | Flutter DevTools에서 각 위젯이 build()를 몇 번 호출했는지 표시하는 지표                               |

---

## 3. 이론적 배경과 원리 ★

### 3.1 setState() 내부 동작 단계별 분석

![setState 내부 7단계 흐름](/developer-open-book/diagrams/step13-setstate-flow.svg)

**핵심 포인트:** setState()는 호출한 **StatefulWidget부터 그 모든 자손**을 rebuild 대상으로 만든다. 단, Element 재사용과 const 최적화로 실제 RenderObject 업데이트는 최소화된다.

---

### 3.2 rebuild 범위 시각화

```dart
class ParentWidget extends StatefulWidget { ... }

class _ParentWidgetState extends State<ParentWidget> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(               // ← rebuild됨
      children: [
        Text('$_count'),         // ← rebuild됨 (값 변경)
        const Text('고정 텍스트'), // ← rebuild되지만 const이므로 Element 재사용
        ChildWidget(),           // ← rebuild됨!
        const StaticWidget(),    // ← const이므로 rebuild 건너뜀
      ],
    );
  }
}
```

![rebuild 범위 시각화](/developer-open-book/diagrams/step13-rebuild-scope.svg)

> ⚠️ **함정 주의:** `ChildWidget()`처럼 `const` 없이 자식 위젯을 생성하면 부모 setState()마다 `ChildWidget`의 `build()`도 재호출된다. 자식이 무거운 위젯이라면 성능 저하로 이어진다.

---

### 3.3 불필요한 rebuild를 막는 3가지 전략

#### 전략 1: const 위젯

```dart
// ❌ 매 rebuild마다 새 인스턴스
child: Text('안녕하세요')

// ✅ 동일 인스턴스 재사용 → rebuild 건너뜀
child: const Text('안녕하세요')

// ❌ 자식 전체가 rebuild됨
child: Padding(
  padding: const EdgeInsets.all(16),
  child: Column(
    children: [
      const Icon(Icons.star),     // ← 이것만 const
      Text(dynamicTitle),         // ← 동적값 포함
    ],
  ),
)
```

**const를 적용할 수 있는 범위:**

```dart
// 모든 값이 컴파일 타임 상수이면 전체 서브트리를 const로
const Card(
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Column(
      children: [
        Icon(Icons.star),
        Text('고정 텍스트'),
      ],
    ),
  ),
)
// → 이 서브트리 전체가 rebuild에서 제외됨
```

#### 전략 2: 위젯 분리 (Extract Widget)

setState() 호출 범위를 최대한 좁히는 가장 효과적인 방법이다.

```dart
// ❌ 문제: 최상위에서 setState → 전체 rebuild
class ProductPage extends StatefulWidget { ... }
class _ProductPageState extends State<ProductPage> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        HeavyProductImageWidget(),  // ← setState마다 rebuild!
        HeavyDescriptionWidget(),   // ← setState마다 rebuild!
        IconButton(                 // ← 이것만 바뀌면 되는데
          icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
          onPressed: () => setState(() => _isFavorite = !_isFavorite),
        ),
      ],
    );
  }
}

// ✅ 해결: 상태를 최소 범위 위젯으로 분리
class ProductPage extends StatelessWidget {  // ← StatelessWidget으로 변경
  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        HeavyProductImageWidget(),   // ← const, rebuild 없음
        HeavyDescriptionWidget(),    // ← const, rebuild 없음
        FavoriteButton(),            // ← 이 위젯만 자체 setState 관리
      ],
    );
  }
}

class FavoriteButton extends StatefulWidget {
  const FavoriteButton({super.key});
  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    // 이 build()만 호출됨. HeavyProductImageWidget 건드리지 않음.
    return IconButton(
      icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border,
          color: Colors.red),
      onPressed: () => setState(() => _isFavorite = !_isFavorite),
    );
  }
}
```

#### 전략 3: ValueKey를 통한 Element 재사용 제어

ValueKey는 리스트에서 특히 중요하다. Step 04에서 Key의 개념을 배웠다면, 여기서는 **rebuild 최적화 관점**에서 다시 살펴본다.

```dart
// ❌ Key 없는 리스트: 재정렬 시 State가 엉킴
ListView(
  children: items.map((item) =>
    ItemWidget(item: item)  // Key 없음
  ).toList(),
)

// ✅ ValueKey 적용: 재정렬·삽입·삭제 시 올바른 State 유지
ListView(
  children: items.map((item) =>
    ItemWidget(
      key: ValueKey(item.id),  // ID로 고유 식별
      item: item,
    )
  ).toList(),
)
```

**ValueKey의 rebuild 최적화 효과:**

```
items 리스트에서 맨 앞에 아이템 삽입 시

Key 없음:
  [A, B, C] → [NEW, A, B, C]
  위치 0: B가 A Element 재사용 → A의 State가 B에 붙어버림 (버그!)
  위치 3: 새 Element 생성

ValueKey 있음:
  [A(id:1), B(id:2), C(id:3)] → [NEW(id:4), A(id:1), B(id:2), C(id:3)]
  id:1 Element → id:1 Widget과 정확히 매칭 (State 보존)
  id:4: 새 Element 생성
```

---

### 3.4 setState 안티패턴

#### 안티패턴 1: build() 안에서 setState() 호출

```dart
// ❌ 무한 루프 발생!
@override
Widget build(BuildContext context) {
  setState(() => _count++);  // build → setState → build → setState → ...
  return Text('$_count');
}

// ✅ 이벤트 핸들러에서만 호출
onPressed: () => setState(() => _count++),
```

#### 안티패턴 2: dispose() 후 setState() 호출

```dart
// ❌ 비동기 완료 후 위젯이 이미 dispose된 경우
Future<void> _loadData() async {
  final data = await fetchData();
  setState(() => _data = data); // 이미 dispose됐으면 오류!
}

// ✅ mounted 확인 필수
Future<void> _loadData() async {
  final data = await fetchData();
  if (!mounted) return;
  setState(() => _data = data);
}
```

#### 안티패턴 3: setState를 너무 자주 호출

```dart
// ❌ 매 이동마다 setState → 매 프레임 rebuild
onPanUpdate: (details) {
  setState(() => _offset += details.delta);  // 초당 60번 rebuild
}

// ✅ AnimationController 또는 ValueNotifier 사용
// (setState 없이 RenderObject만 직접 업데이트)
ValueNotifier<Offset> _offset = ValueNotifier(Offset.zero);

onPanUpdate: (details) {
  _offset.value += details.delta;  // rebuild 없이 ValueListenableBuilder만 갱신
}

ValueListenableBuilder<Offset>(
  valueListenable: _offset,
  builder: (_, offset, __) => Transform.translate(
    offset: offset,
    child: const DraggableCard(),
  ),
)
```

---

### 3.5 ValueNotifier: 더 정밀한 rebuild 제어

`ValueNotifier`는 `ChangeNotifier`의 경량 버전으로, 단일 값의 변경을 구독자에게 알린다. `setState()` 없이 특정 위젯만 rebuild할 때 유용하다.

```dart
class CounterWithValueNotifier extends StatefulWidget {
  const CounterWithValueNotifier({super.key});
  @override
  State<CounterWithValueNotifier> createState() =>
      _CounterWithValueNotifierState();
}

class _CounterWithValueNotifierState
    extends State<CounterWithValueNotifier> {
  final _count = ValueNotifier<int>(0);  // setState 불필요

  @override
  void dispose() {
    _count.dispose();  // ✅ 반드시 해제
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 이 build()는 초기 1번만 호출됨
    return Column(
      children: [
        const HeavyWidget(),   // 전혀 rebuild되지 않음 ✅

        // _count가 변경되면 이 Builder만 rebuild
        ValueListenableBuilder<int>(
          valueListenable: _count,
          builder: (context, count, child) {
            return Text('카운트: $count',
                style: const TextStyle(fontSize: 32));
          },
        ),

        ElevatedButton(
          onPressed: () => _count.value++,  // setState 없음!
          child: const Text('증가'),
        ),
      ],
    );
  }
}
```

**setState vs ValueNotifier 비교:**

| 항목         | setState                     | ValueNotifier            |
| ------------ | ---------------------------- | ------------------------ |
| rebuild 범위 | StatefulWidget 전체 서브트리 | ValueListenableBuilder만 |
| 사용 복잡도  | 단순                         | 약간 복잡                |
| 적합한 경우  | 위젯 대부분이 바뀔 때        | 일부 값만 자주 바뀔 때   |
| dispose 필요 | 없음                         | ✅ 필요                  |

---

### 3.6 Flutter DevTools로 rebuild 추적

```
DevTools → Performance → Widget Rebuild Counts
──────────────────────────────────────────────────────
  위젯 이름              rebuild 횟수
  ─────────────────────────────────
  _ProductPageState       128        ← 너무 많음! 최적화 필요
  HeavyImageWidget         128        ← 이미지가 매번 rebuild?!
  FavoriteButton            64        ← 적절
  Text('고정 텍스트')         0         ← const 덕분
──────────────────────────────────────────────────────

rebuild 횟수가 비정상적으로 높은 위젯을 찾아
  1. const 적용 가능한지 확인
  2. 별도 StatefulWidget으로 분리 가능한지 확인
  3. ValueNotifier로 교체 가능한지 확인
```

**코드에서 rebuild 로그 출력:**

```dart
// debug 모드에서 dirty 위젯 출력
void main() {
  debugPrintRebuildDirtyWidgets = true;  // 콘솔에 rebuild 목록 출력
  runApp(const MyApp());
}
```

---

## 4. 사례 연구

### 4.1 뉴스피드 앱의 rebuild 최적화

```
최적화 전: 좋아요 버튼 탭 시
──────────────────────────────────────────────────────
  NewsFeedPage (setState)
    └── ListView
          ├── NewsCard (id:1)  ← build() 재호출 (불필요)
          ├── NewsCard (id:2)  ← build() 재호출 (불필요)
          ├── NewsCard (id:3)  ← build() 재호출 (탭한 카드)
          └── NewsCard (id:4)  ← build() 재호출 (불필요)
  → 4개 모두 rebuild

최적화 후: NewsCard를 StatefulWidget으로 분리
──────────────────────────────────────────────────────
  NewsFeedPage (StatelessWidget)
    └── ListView
          ├── NewsCard(key: ValueKey(1))  ← rebuild 없음
          ├── NewsCard(key: ValueKey(2))  ← rebuild 없음
          ├── NewsCard(key: ValueKey(3))  ← 자체 setState만
          └── NewsCard(key: ValueKey(4))  ← rebuild 없음
  → 탭한 카드만 rebuild
```

```dart
// 최적화된 구조
class NewsFeedPage extends StatelessWidget {   // StatelessWidget으로
  const NewsFeedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: newsList.length,
      itemBuilder: (context, index) => NewsCard(
        key: ValueKey(newsList[index].id),
        news: newsList[index],
      ),
    );
  }
}

class NewsCard extends StatefulWidget {    // 카드 자체가 상태 관리
  final News news;
  const NewsCard({super.key, required this.news});
  @override
  State<NewsCard> createState() => _NewsCardState();
}

class _NewsCardState extends State<NewsCard> {
  bool _isLiked = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          // 이미지·텍스트는 const 처리
          Image.network(widget.news.imageUrl),
          Text(widget.news.title),
          IconButton(
            icon: Icon(_isLiked ? Icons.favorite : Icons.favorite_border),
            onPressed: () => setState(() => _isLiked = !_isLiked),
          ),
        ],
      ),
    );
  }
}
```

---

### 4.2 ValueKey로 리스트 재정렬 State 보존

```dart
class TodoList extends StatefulWidget {
  const TodoList({super.key});
  @override
  State<TodoList> createState() => _TodoListState();
}

class _TodoListState extends State<TodoList> {
  var _todos = [
    Todo(id: 1, title: '운동하기'),
    Todo(id: 2, title: '독서'),
    Todo(id: 3, title: '코딩'),
  ];

  void _shuffle() => setState(() => _todos = [..._todos]..shuffle());

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(onPressed: _shuffle, child: const Text('섞기')),
        ..._todos.map(
          (todo) => TodoItem(
            key: ValueKey(todo.id),  // id 기반 Key → State 보존
            todo: todo,
          ),
        ),
      ],
    );
  }
}

class TodoItem extends StatefulWidget {
  final Todo todo;
  const TodoItem({super.key, required this.todo});
  @override
  State<TodoItem> createState() => _TodoItemState();
}

class _TodoItemState extends State<TodoItem> {
  bool _isDone = false;   // 각 아이템의 완료 상태

  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      title: Text(widget.todo.title),
      value: _isDone,
      onChanged: (v) => setState(() => _isDone = v ?? false),
    );
  }
}
```

**ValueKey 없이 섞으면:** 체크 상태가 위치 기반으로 붙어다니는 버그 발생
**ValueKey 있으면:** id 기반으로 매칭되어 체크 상태가 올바른 아이템에 유지됨

---

### 4.3 AnimatedList에서의 rebuild 최적화

```dart
// AnimatedList: 아이템 추가/삭제 시 애니메이션 + rebuild 최적화
class ShoppingCartList extends StatefulWidget {
  const ShoppingCartList({super.key});
  @override
  State<ShoppingCartList> createState() => _ShoppingCartListState();
}

class _ShoppingCartListState extends State<ShoppingCartList> {
  final _listKey = GlobalKey<AnimatedListState>();
  final _items = <CartItem>[];

  void _addItem(CartItem item) {
    _items.add(item);
    _listKey.currentState?.insertItem(
      _items.length - 1,
      duration: const Duration(milliseconds: 300),
    );
  }

  void _removeItem(int index) {
    final removed = _items.removeAt(index);
    _listKey.currentState?.removeItem(
      index,
      (context, animation) => SizeTransition(
        sizeFactor: animation,
        child: CartItemWidget(
          key: ValueKey(removed.id),
          item: removed,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedList(
      key: _listKey,
      itemBuilder: (context, index, animation) => SlideTransition(
        position: animation.drive(
          Tween(begin: const Offset(1, 0), end: Offset.zero),
        ),
        child: CartItemWidget(
          key: ValueKey(_items[index].id),
          item: _items[index],
        ),
      ),
    );
  }
}
```

---

## 5. 실습

### 5.1 rebuild 범위 측정 실험

아래 코드를 DartPad에서 실행하며 각 위젯이 몇 번 build()를 호출하는지 콘솔로 직접 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: RebuildDemo()));

class RebuildDemo extends StatefulWidget {
  const RebuildDemo({super.key});
  @override
  State<RebuildDemo> createState() => _RebuildDemoState();
}

class _RebuildDemoState extends State<RebuildDemo> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    print('🏠 RebuildDemo.build() 호출 — count: $_count');
    return Scaffold(
      appBar: AppBar(title: const Text('rebuild 실험')),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // A: 동적 값 포함
          Text('카운트: $_count',
              style: const TextStyle(fontSize: 32)),

          // B: const 위젯 (rebuild 건너뜀)
          const _StaticLabel(),

          // C: const 없는 자식 위젯 (rebuild됨)
          _DynamicChild(label: '버튼 ${'*' * (_count % 3 + 1)}'),

          // D: const 자식 위젯 (rebuild 건너뜀)
          const _HeavyWidget(),

          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => setState(() => _count++),
            child: const Text('setState 호출'),
          ),
        ],
      ),
    );
  }
}

class _StaticLabel extends StatelessWidget {
  const _StaticLabel();
  @override
  Widget build(BuildContext context) {
    print('  📌 _StaticLabel.build() — const로 보호됨');
    return const Text('나는 const 위젯입니다',
        style: TextStyle(color: Colors.green));
  }
}

class _DynamicChild extends StatelessWidget {
  final String label;
  const _DynamicChild({required this.label});
  @override
  Widget build(BuildContext context) {
    print('  ⚡ _DynamicChild.build() — label: $label');
    return Text(label, style: const TextStyle(color: Colors.orange));
  }
}

class _HeavyWidget extends StatelessWidget {
  const _HeavyWidget();
  @override
  Widget build(BuildContext context) {
    print('  🪨 _HeavyWidget.build() — 무거운 위젯');
    return const Padding(
      padding: EdgeInsets.all(8),
      child: Text('무거운 위젯 (const)', style: TextStyle(color: Colors.grey)),
    );
  }
}
```

**확인 시나리오:**

1. 앱 시작 시 각 위젯의 build()가 몇 번 호출되는가?
2. setState 버튼을 5번 눌렀을 때 각 위젯의 누적 호출 수는?
3. `const _StaticLabel()`과 `const _HeavyWidget()`의 build()는 몇 번 호출되는가?
4. `_DynamicChild`는 label이 실제로 변하지 않아도 rebuild되는가?

**예상 결과:**

- `_StaticLabel`, `_HeavyWidget`: **1번만** (const → identical 확인 후 건너뜀)
- `_DynamicChild`: **매번** (const 없어서 새 인스턴스 생성 → rebuild)
- `RebuildDemo`: **매번** (setState 호출 위젯)

---

### 5.2 ValueKey 실습: 리스트 재정렬

DartPad에서 ValueKey 유무에 따른 체크 상태 동작 차이를 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: KeyDemo()));

class KeyDemo extends StatefulWidget {
  const KeyDemo({super.key});
  @override
  State<KeyDemo> createState() => _KeyDemoState();
}

class _KeyDemoState extends State<KeyDemo> {
  var _items = ['🍎 사과', '🍌 바나나', '🍇 포도', '🍓 딸기'];
  bool _useKey = false;  // ValueKey 사용 여부 토글

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ValueKey ${_useKey ? "ON ✅" : "OFF ❌"}'),
        actions: [
          Switch(
            value: _useKey,
            onChanged: (v) => setState(() => _useKey = v),
          ),
        ],
      ),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(12),
            child: Text('① 아이템을 탭해 체크\n② 섞기 버튼 누르기\n③ 체크가 아이템을 따라가는지 확인',
                textAlign: TextAlign.center),
          ),
          Expanded(
            child: ListView(
              children: _items.map((item) {
                return _useKey
                    ? CheckItem(key: ValueKey(item), label: item)
                    : CheckItem(label: item);
              }).toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => setState(() => _items = [..._items]..shuffle()),
                icon: const Icon(Icons.shuffle),
                label: const Text('섞기'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CheckItem extends StatefulWidget {
  final String label;
  const CheckItem({super.key, required this.label});
  @override
  State<CheckItem> createState() => _CheckItemState();
}

class _CheckItemState extends State<CheckItem> {
  bool _checked = false;

  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      title: Text(widget.label),
      value: _checked,
      onChanged: (v) => setState(() => _checked = v ?? false),
    );
  }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** setState()가 호출될 때 실제로 rebuild되는 범위는?

- A) 앱 전체 위젯 트리
- B) setState()를 호출한 메서드와 직접 연결된 위젯만
- C) **setState()를 호출한 StatefulWidget과 그 모든 자손** ✅
- D) dirty로 표시된 Element만 (부모 제외)

---

**Q2. [Understand]** `const Text('안녕')`이 rebuild를 건너뛰는 원리는?

> **모범 답안:** `const` 위젯은 컴파일 타임 상수로, 동일한 구성의 const 위젯은 항상 동일한 인스턴스를 반환한다. Flutter의 reconciliation 과정에서 `identical(oldWidget, newWidget)`이 `true`이면, 해당 서브트리 전체의 비교와 rebuild를 건너뛴다. 이를 통해 변경되지 않은 정적 UI 요소의 rebuild 비용이 완전히 제거된다.

---

**Q3. [Analyze]** 다음 코드에서 버튼을 탭할 때 실제로 build()가 호출되는 위젯은?

```dart
class MyWidget extends StatefulWidget { ... }
class _MyWidgetState extends State<MyWidget> {
  int _n = 0;
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      const HeaderWidget(),        // (A)
      CounterText(count: _n),      // (B)
      const FooterWidget(),        // (C)
      ElevatedButton(
        onPressed: () => setState(() => _n++),
        child: const Text('탭'),   // (D)
      ),
    ]);
  }
}
```

> **모범 답안:** `_MyWidgetState.build()` 전체가 재호출된다. (A) `const HeaderWidget`은 identical 체크 통과 → rebuild 건너뜀. (B) `CounterText`는 const 없음 → 새 인스턴스 생성 → build() 재호출. (C) `const FooterWidget`은 identical 체크 통과 → rebuild 건너뜀. (D) `const Text('탭')`는 ElevatedButton 안에 있지만, ElevatedButton 자체가 rebuild되므로 ElevatedButton.build()는 호출됨. `Text`는 const이므로 identical. 결론: **B와 ElevatedButton**의 build()가 실질적으로 재실행된다.

---

**Q4. [Apply]** 아래 코드의 rebuild 최적화 문제점을 찾고 수정하라.

```dart
class ChatPage extends StatefulWidget { ... }
class _ChatPageState extends State<ChatPage> {
  bool _isOnline = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        HugeChatHistoryWidget(),  // 수천 개 메시지, 매우 무거움
        Text(_isOnline ? '온라인' : '오프라인'),
        Switch(
          value: _isOnline,
          onChanged: (v) => setState(() => _isOnline = v),
        ),
      ],
    );
  }
}
```

```dart
// 모범 답안: HugeChatHistoryWidget을 const로 분리
class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        HugeChatHistoryWidget(),  // ← const, 절대 rebuild 없음
        OnlineStatusWidget(),     // ← 이 위젯만 자체 setState
      ],
    );
  }
}

class OnlineStatusWidget extends StatefulWidget {
  const OnlineStatusWidget({super.key});
  @override
  State<OnlineStatusWidget> createState() => _OnlineStatusWidgetState();
}

class _OnlineStatusWidgetState extends State<OnlineStatusWidget> {
  bool _isOnline = false;
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Text(_isOnline ? '온라인' : '오프라인'),
      Switch(
          value: _isOnline,
          onChanged: (v) => setState(() => _isOnline = v)),
    ]);
  }
}
```

---

**Q5. [Apply]** ValueNotifier가 setState보다 유리한 상황은?

> **모범 답안:** 위젯 트리 중 극히 일부(예: 카운터 숫자 하나, 드래그 위치 값)만 자주 변경되고 나머지는 변경이 없는 경우다. `setState()`는 해당 StatefulWidget 전체 서브트리를 rebuild 대상으로 만드는 반면, `ValueNotifier` + `ValueListenableBuilder`는 Builder 내부만 rebuild한다. 특히 `onPanUpdate`처럼 초당 60번 값이 바뀌는 경우, setState로 처리하면 전체 서브트리가 60fps로 rebuild되어 성능 문제가 발생할 수 있다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- `setState()`는 해당 StatefulWidget과 **모든 자손**을 rebuild 대상으로 만든다. Element 재사용·const 최적화로 실제 RenderObject 업데이트는 최소화된다.
- **const 위젯**은 identical 체크로 rebuild를 완전히 건너뛴다. 변하지 않는 모든 위젯에 적용한다.
- **위젯 분리(Extract)**로 setState 범위를 최소화한다. 상태를 가진 작은 StatefulWidget을 만드는 것이 핵심이다.
- **ValueKey**는 리스트 재정렬·삽입·삭제 시 Element와 State를 올바른 위젯과 매칭시킨다.
- **ValueNotifier + ValueListenableBuilder**로 setState 없이 특정 위젯만 rebuild할 수 있다.
- **Flutter DevTools**의 rebuild count와 `debugPrintRebuildDirtyWidgets`로 불필요한 rebuild를 진단한다.

### 6.2 다음 Step 예고

- **Step 14 — Provider 패턴:** ChangeNotifier, Provider 구조, Dependency Injection을 학습하며 Global State를 체계적으로 관리하는 방법을 익힌다.

### 6.3 참고 자료

| 자료                               | 링크                                                                      | 설명                    |
| ---------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Flutter 성능 최적화 공식 문서      | <https://docs.flutter.dev/perf/best-practices>                              | 공식 성능 가이드        |
| Flutter DevTools                   | <https://docs.flutter.dev/tools/devtools/overview>                          | DevTools 사용 가이드    |
| ValueListenableBuilder             | <https://api.flutter.dev/flutter/widgets/ValueListenableBuilder-class.html> | API 문서                |
| Flutter — Widget rebuild profiling | <https://docs.flutter.dev/tools/devtools/performance>                       | DevTools Performance 탭 |
| Inside Flutter (Rebuild)           | <https://docs.flutter.dev/resources/inside-flutter>                         | rebuild 내부 원리       |

### 6.4 FAQ

**Q. const를 모든 위젯에 붙이면 항상 좋은가?**

> 런타임에 결정되는 값이 포함된 위젯에는 const를 사용할 수 없다. const는 컴파일 타임에 모든 값이 확정될 때만 사용 가능하다. Dart 분석기(linter)가 `prefer_const_constructors` 규칙으로 적용 가능한 위치를 자동으로 알려준다.

**Q. 위젯을 작게 분리하면 오히려 성능이 나빠지지 않는가?**

> 위젯 분리 자체의 비용(위젯 객체 생성, Element 관리)은 매우 낮다. 반면 불필요한 rebuild의 비용(복잡한 레이아웃·페인트 재계산)은 상대적으로 크다. 따라서 일반적으로 적절한 위젯 분리는 성능에 유리하다.

**Q. RepaintBoundary는 언제 사용하는가?**

> 위젯이 자주 repaint되지만 부모는 변경이 없는 경우에 사용한다. 예: 애니메이션이 적용된 위젯, 지도 타일. `RepaintBoundary`로 감싸면 해당 위젯의 repaint가 별도 레이어에서 처리되어 부모 위젯에 영향을 주지 않는다. 단, 레이어 생성 비용이 발생하므로 남용은 금물이다.

---

## 빠른 자가진단 체크리스트

- [ ] setState() 호출 시 rebuild되는 범위를 설명할 수 있는가?
- [ ] dirty marking의 의미를 설명할 수 있는가?
- [ ] const 위젯이 rebuild를 건너뛰는 원리를 설명할 수 있는가?
- [ ] 위젯 분리(Extract)로 rebuild 범위를 줄이는 방법을 코드로 구현할 수 있는가?
- [ ] ValueKey로 리스트 State를 보존하는 이유를 설명할 수 있는가?
- [ ] ValueNotifier가 setState보다 유리한 상황을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: build() 안에서 setState()를 호출하면 안 되는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: const 없는 자식 위젯은 부모 setState마다 rebuild된다는 것을 이해했는가?
