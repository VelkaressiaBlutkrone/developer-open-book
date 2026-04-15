# Step 05 — StatelessWidget vs StatefulWidget

> **파트:** 2️⃣ Flutter UI 시스템 이해 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** StatefulWidget의 Lifecycle 메서드(initState·didChangeDependencies·build·didUpdateWidget·deactivate·dispose)를 순서대로 나열할 수 있다.
2. **[Understand]** StatelessWidget과 StatefulWidget의 구조적 차이와 각각이 적합한 상황을 설명할 수 있다.
3. **[Understand]** State 객체가 Widget과 분리되어 존재하는 이유를 설명할 수 있다.
4. **[Understand]** setState()의 동작 원리와 호출 규칙을 설명할 수 있다.
5. **[Apply]** StatefulWidget으로 상태를 가진 카운터 앱을 직접 작성할 수 있다.
6. **[Analyze]** Lifecycle 각 단계에서 수행해야 하는 작업과 피해야 하는 작업을 분석할 수 있다.

**전제 지식:** Step 01~04 완료, Dart 클래스·상속·Null Safety(Step 02), Widget·Element·BuildContext(Step 04)

---

## 1. 서론

### 1.1 두 Widget의 존재 이유

Flutter의 모든 Widget은 불변(immutable)이다. 그렇다면 "상태가 변하는 UI"는 어떻게 구현하는가? Flutter는 이 문제를 Widget을 두 종류로 나눠 해결한다.

![Flutter의 두 가지 Widget](/developer-open-book/diagrams/flutter-step05-two-widgets.svg)

### 1.2 State 분리 설계의 핵심 의도

"Widget이 불변이라면 상태는 어디에?" 라는 질문이 자연스럽게 나온다. Flutter의 답은 **State 객체를 Widget과 분리**하는 것이다.

![StatefulWidget과 State 구조](/developer-open-book/diagrams/step05-stateful-structure.svg)

### 1.3 전체 개념 지도

![Widget 종류 개념 지도](/developer-open-book/diagrams/flutter-step05-concept-map.svg)

---

## 2. 기본 개념과 용어

| 용어                        | 정의                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **StatelessWidget**         | 상태를 가지지 않는 Widget. `build()` 메서드 하나만 구현하며, 외부에서 받은 데이터로만 UI를 구성함 |
| **StatefulWidget**          | 가변 상태를 가질 수 있는 Widget. State 객체를 통해 자체적으로 변하는 데이터를 관리함              |
| **State**                   | StatefulWidget과 분리된 가변 객체. 위젯의 생명주기 동안 데이터를 유지함                           |
| **setState()**              | State를 변경하고 해당 Widget의 rebuild를 Flutter 프레임워크에 예약하는 메서드                     |
| **Lifecycle**               | Widget이 트리에 추가되어 제거될 때까지 거치는 단계별 흐름                                         |
| **initState()**             | State가 생성된 직후 딱 한 번 호출되는 초기화 메서드                                               |
| **build()**                 | 현재 상태를 반영한 Widget Tree를 반환하는 메서드. 자주 호출됨                                     |
| **didUpdateWidget()**       | 부모 Widget이 재빌드되어 새 Widget 설정값이 전달될 때 호출                                        |
| **didChangeDependencies()** | 의존하는 InheritedWidget의 값이 변경될 때 호출                                                    |
| **deactivate()**            | Widget이 트리에서 일시적으로 제거될 때 호출                                                       |
| **dispose()**               | State가 영구적으로 제거되기 직전 호출. 리소스 해제 필수                                           |
| **mounted**                 | State가 현재 트리에 연결되어 있는지 나타내는 bool 프로퍼티                                        |
| **widget**                  | State 안에서 연결된 StatefulWidget 인스턴스에 접근하는 프로퍼티                                   |
| **context**                 | State 안에서 사용하는 BuildContext. 연결된 Element를 가리킴                                       |

---

## 3. 이론적 배경과 원리 ★

### 3.1 StatelessWidget 구조

StatelessWidget은 구조가 단순하다. `build()` 메서드 하나만 구현하면 된다.

```dart
class GreetingCard extends StatelessWidget {
  // 외부에서 받는 데이터: final로 선언 (불변)
  final String name;
  final Color backgroundColor;

  const GreetingCard({
    super.key,
    required this.name,
    this.backgroundColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    // build()는 순수 함수처럼 동작해야 한다
    // 같은 입력(name, backgroundColor)에 항상 같은 출력
    return Container(
      color: backgroundColor,
      padding: const EdgeInsets.all(16),
      child: Text(
        '안녕하세요, $name!',
        style: Theme.of(context).textTheme.headlineMedium,
      ),
    );
  }
}
```

**StatelessWidget이 rebuild되는 시점:**

- 부모 Widget이 rebuild될 때 (새 프로퍼티 값 전달 포함)
- 의존하는 InheritedWidget이 변경될 때

StatelessWidget 자체는 스스로 rebuild를 일으킬 수 없다. 상태 변화가 필요하면 부모 StatefulWidget에서 관리하고 프로퍼티로 전달한다.

---

### 3.2 StatefulWidget 구조

StatefulWidget은 Widget 클래스와 State 클래스 두 개를 함께 작성한다.

```dart
// 1. Widget 클래스: 불변 설정값만 보유
class CounterButton extends StatefulWidget {
  final String label;       // 불변 설정값
  final int initialValue;   // 불변 설정값

  const CounterButton({
    super.key,
    required this.label,
    this.initialValue = 0,
  });

  // 2. createState(): State 객체 생성 (딱 한 번)
  @override
  State<CounterButton> createState() => _CounterButtonState();
}

// 3. State 클래스: 가변 상태 + 비즈니스 로직
class _CounterButtonState extends State<CounterButton> {
  // 가변 상태 변수: _ 접두사로 private 선언
  late int _count;

  @override
  void initState() {
    super.initState();
    // 초기화: widget 프로퍼티에 안전하게 접근 가능
    _count = widget.initialValue;
  }

  void _increment() {
    setState(() {
      _count++;   // 상태 변경은 반드시 setState() 안에서
    });
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _increment,
      child: Text('${widget.label}: $_count'),
    );
  }

  @override
  void dispose() {
    // 리소스 해제 (컨트롤러, 스트림 구독 등)
    super.dispose();  // 반드시 마지막에 호출
  }
}
```

**StatefulWidget에서 Widget과 State를 분리하는 이유:**

```
Widget (불변)            State (가변)
──────────────           ──────────────────────────
설정값 보유              실제 상태 데이터 보유
자주 재생성              Element 생명주기 동안 유지
key, label 등           _count, _controller 등
경량                     생명주기 메서드 포함
```

Widget이 재생성되어도 State는 살아남는다. 이것이 "상태가 유지된다"는 의미다.

---

### 3.3 Lifecycle 전체 흐름

StatefulWidget의 생명주기를 단계별로 이해하면 언제 무엇을 해야 하는지 명확해진다.

![StatefulWidget Lifecycle 전체 흐름](/developer-open-book/diagrams/step05-lifecycle.svg)

#### 각 단계 상세

**① createState()**

```dart
@override
State<MyWidget> createState() => _MyWidgetState();
// - Element가 생성될 때 딱 한 번 호출됨
// - State 인스턴스를 반환하는 것 외에 다른 로직을 넣지 않는다
```

**② initState()**

```dart
@override
void initState() {
  super.initState();  // ← 반드시 먼저 호출
  // 올바른 사용:
  _controller = AnimationController(vsync: this, duration: ...);
  _subscription = stream.listen(_onData);
  _count = widget.initialValue;

  // 잘못된 사용: context 기반 탐색 (트리 미완성 시점)
  // Theme.of(context);    // ← 안전하지 않음
  // Navigator.of(context); // ← 안전하지 않음
}
```

> ⚠️ **함정 주의:** `initState()`에서 `BuildContext`를 통해 트리를 탐색(`Theme.of`, `Navigator.of` 등)하면 오류가 발생할 수 있다. 이 시점은 Element가 트리에 완전히 연결되기 전이다. context 기반 탐색이 필요하면 `didChangeDependencies()` 또는 `build()` 안에서 수행한다.

**③ didChangeDependencies()**

```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  // InheritedWidget(Theme, MediaQuery, Localizations 등)의
  // 값이 변경될 때마다 호출됨
  // initState() 직후에도 한 번 호출됨
  // 여기서는 context 기반 탐색이 안전하다
  final locale = Localizations.localeOf(context);
}
```

**④ build()**

```dart
@override
Widget build(BuildContext context) {
  // - 순수 함수처럼 작성해야 한다
  // - 부수 효과(side effect) 없어야 함
  // - setState(), Navigator.push() 등을 직접 호출하지 않는다
  // - 빠르게 실행되어야 함 (무거운 연산 금지)
  return Text('$_count');
}
```

> ⚠️ **함정 주의:** `build()` 안에서 `setState()`를 직접 호출하면 무한 rebuild 루프가 발생한다.

**⑤ didUpdateWidget()**

```dart
@override
void didUpdateWidget(covariant CounterButton oldWidget) {
  super.didUpdateWidget(oldWidget);
  // 부모가 재빌드되어 새 Widget 설정값이 전달될 때 호출됨
  // oldWidget: 이전 Widget 인스턴스 (비교에 활용)

  if (widget.initialValue != oldWidget.initialValue) {
    // 외부에서 initialValue가 변경된 경우에만 _count 리셋
    setState(() => _count = widget.initialValue);
  }
}
```

**⑥ deactivate()**

```dart
@override
void deactivate() {
  // Widget이 트리에서 일시적으로 제거될 때 호출
  // GlobalKey로 다른 위치로 이동할 때도 호출됨
  // 대부분의 경우 직접 구현할 필요 없음
  super.deactivate();
}
```

**⑦ dispose()**

```dart
@override
void dispose() {
  // 리소스 해제: 반드시 수행해야 하는 정리 작업
  _controller.dispose();      // AnimationController
  _subscription.cancel();     // StreamSubscription
  _textController.dispose();  // TextEditingController
  _focusNode.dispose();       // FocusNode
  _scrollController.dispose(); // ScrollController

  super.dispose();  // ← 반드시 마지막에 호출
}
```

> ⚠️ **함정 주의:** `dispose()` 후에 `setState()`를 호출하면 오류가 발생한다. 비동기 작업이 완료된 뒤 setState()를 호출할 때는 반드시 `mounted` 프로퍼티를 먼저 확인해야 한다.

---

### 3.4 setState()의 동작 원리

`setState()`는 단순히 상태를 변경하는 함수가 아니다. 정확히는 **"이 State의 build()를 다음 프레임에 다시 호출하도록 Flutter 프레임워크에 예약"** 하는 메서드다.

```dart
// setState() 내부 동작 (단순화)
void setState(VoidCallback fn) {
  fn();                      // ① 콜백 실행 (상태 변경)
  _element.markNeedsBuild(); // ② 해당 Element를 "rebuild 필요" 상태로 표시
  // ③ 다음 프레임 렌더링 시 build() 재호출됨
}
```

**올바른 setState() 패턴:**

```dart
// ✅ 올바름: 상태 변경을 콜백 안에서 수행
setState(() {
  _count++;
  _isLoading = false;
  _items.add(newItem);
});

// ✅ 올바름: 먼저 계산 후 setState에서 할당
final newValue = _compute();
setState(() {
  _value = newValue;
});

// ❌ 잘못됨: setState 없이 상태 변경 → UI 미반영
_count++;  // build()가 호출되지 않음

// ❌ 잘못됨: dispose() 후 setState() 호출
void _onAsyncComplete(String result) {
  setState(() => _data = result); // mounted 확인 없이 호출 → 오류 가능
}

// ✅ 올바름: mounted 확인 후 setState()
void _onAsyncComplete(String result) {
  if (!mounted) return;       // 이미 dispose()된 경우 건너뜀
  setState(() => _data = result);
}
```

---

### 3.5 StatelessWidget vs StatefulWidget 선택 기준

| 상황                               | 적합한 Widget   |
| ---------------------------------- | --------------- |
| 데이터를 부모에게서 받아 표시만 함 | StatelessWidget |
| 버튼·텍스트·아이콘 같은 정적 UI    | StatelessWidget |
| 사용자 입력, 탭, 토글 상태 관리    | StatefulWidget  |
| 애니메이션 컨트롤러 사용           | StatefulWidget  |
| 네트워크 요청 후 결과 표시         | StatefulWidget  |
| Timer, Stream 구독                 | StatefulWidget  |

**실무 팁 — 상태를 최대한 위로 올려라:**

```
좋지 않은 구조                좋은 구조
─────────────────             ─────────────────────────
ProductCard (SF)              ProductListPage (SF)  ← 상태 관리
  └─ 각자 상태 관리              └─ ProductCard (SL)   ← 표시만
                                    ← 데이터를 프로퍼티로 전달

SF = StatefulWidget, SL = StatelessWidget
```

State를 가능한 한 상위에 두고, 하위 Widget은 StatelessWidget으로 만들면 코드가 단순해지고 테스트가 용이해진다.

---

### 3.6 Lifecycle 단계별 해야 할 일 요약표

| Lifecycle 단계            | 해야 할 일                                                | 하지 말아야 할 일                      |
| ------------------------- | --------------------------------------------------------- | -------------------------------------- |
| `initState()`             | 컨트롤러 초기화, 구독 시작, widget 프로퍼티로 상태 초기화 | context 기반 탐색, setState()          |
| `didChangeDependencies()` | InheritedWidget 의존 데이터 로드                          | 무거운 동기 연산                       |
| `build()`                 | 현재 상태 기반 UI 반환                                    | setState(), 부수 효과, 무거운 연산     |
| `didUpdateWidget()`       | 변경된 widget 프로퍼티 기반으로 State 업데이트            | -                                      |
| `deactivate()`            | 트리 이동 시 임시 정리                                    | 리소스 완전 해제 (이동 후 재사용 가능) |
| `dispose()`               | 모든 컨트롤러·구독·타이머 해제, super.dispose()           | -                                      |

---

## 4. 사례 연구

### 4.1 AnimationController와 Lifecycle

Flutter 애니메이션의 핵심인 `AnimationController`는 `vsync`를 통해 디스플레이의 프레임 신호를 받는다. 이를 올바르게 초기화·해제하는 패턴이 Lifecycle의 전형적인 활용 사례다.

```dart
class AnimatedCard extends StatefulWidget {
  const AnimatedCard({super.key});
  @override
  State<AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard>
    with SingleTickerProviderStateMixin {   // vsync 제공 Mixin

  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    // ① 컨트롤러 초기화: initState가 적합한 이유
    //   - vsync(this) 사용 가능 (Mixin 덕분)
    //   - 딱 한 번만 생성해야 함
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(_controller);
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: const Card(child: Text('애니메이션 카드')),
    );
  }

  @override
  void dispose() {
    // ② 컨트롤러 해제: 메모리 누수 방지
    _controller.dispose();
    super.dispose();
  }
}
```

> `dispose()` 없이 `AnimationController`를 방치하면 메모리 누수가 발생하고, Flutter가 `A AnimationController was disposed after it had been used` 오류를 출력한다.

---

### 4.2 비동기 작업과 mounted 확인

HTTP 요청처럼 비동기 작업이 완료되는 시점에 Widget이 이미 트리에서 제거된 경우가 있다. 이때 `setState()`를 호출하면 오류가 발생한다.

```dart
class UserProfileWidget extends StatefulWidget {
  final String userId;
  const UserProfileWidget({super.key, required this.userId});
  @override
  State<UserProfileWidget> createState() => _UserProfileWidgetState();
}

class _UserProfileWidgetState extends State<UserProfileWidget> {
  String? _userName;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final name = await fetchUserName(widget.userId);  // 비동기 요청

    // ✅ mounted 확인: 이 사이에 Widget이 dispose됐을 수 있음
    if (!mounted) return;

    setState(() {
      _userName = name;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const CircularProgressIndicator();
    return Text(_userName ?? '알 수 없는 사용자');
  }
}
```

---

### 4.3 didUpdateWidget()의 실용적 활용

부모가 새로운 `userId`를 전달할 때 데이터를 다시 로드해야 하는 경우다.

```dart
@override
void didUpdateWidget(covariant UserProfileWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  // userId가 변경된 경우에만 재로드
  if (widget.userId != oldWidget.userId) {
    _loadUser();
  }
}
```

`didUpdateWidget()` 없이 이 요구사항을 처리하려면 부모에서 Key를 바꿔 Widget을 강제 재생성해야 한다. 상황에 따라 두 방법 중 적합한 것을 선택한다.

---

## 5. 실습

### 5.1 카운터 앱 — Lifecycle 로그 추가

아래 코드를 DartPad에서 실행하며 각 Lifecycle 메서드가 언제 호출되는지 콘솔 로그로 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: LifecycleDemo()));

class LifecycleDemo extends StatefulWidget {
  const LifecycleDemo({super.key});
  @override
  State<LifecycleDemo> createState() => _LifecycleDemoState();
}

class _LifecycleDemoState extends State<LifecycleDemo> {
  bool _showCounter = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lifecycle 확인')),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_showCounter) const CounterWidget(initialValue: 0),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => setState(() => _showCounter = !_showCounter),
            child: Text(_showCounter ? '카운터 제거' : '카운터 추가'),
          ),
        ],
      ),
    );
  }
}

class CounterWidget extends StatefulWidget {
  final int initialValue;
  const CounterWidget({super.key, required this.initialValue});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  late int _count;

  @override
  void initState() {
    super.initState();
    _count = widget.initialValue;
    print('✅ initState: count = $_count');
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print('🔄 didChangeDependencies');
  }

  @override
  void didUpdateWidget(covariant CounterWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    print('🔁 didUpdateWidget: old=${oldWidget.initialValue}, new=${widget.initialValue}');
  }

  @override
  Widget build(BuildContext context) {
    print('🏗 build: count = $_count');
    return Column(
      children: [
        Text('카운트: $_count', style: const TextStyle(fontSize: 32)),
        const SizedBox(height: 12),
        ElevatedButton(
          onPressed: () => setState(() {
            _count++;
            print('🖱 setState 호출됨');
          }),
          child: const Text('증가'),
        ),
      ],
    );
  }

  @override
  void deactivate() {
    print('⚠️ deactivate');
    super.deactivate();
  }

  @override
  void dispose() {
    print('🗑 dispose: count = $_count');
    super.dispose();
  }
}
```

**확인 시나리오:**

1. 앱 실행 시 콘솔에 어떤 순서로 로그가 찍히는가?
2. "증가" 버튼을 3번 누른 뒤 로그를 확인하라.
3. "카운터 제거" 버튼을 누를 때 `deactivate`와 `dispose`가 호출되는가?
4. "카운터 추가" 버튼을 누르면 `initState`가 다시 호출되는가?

---

### 5.2 상태 관리 리팩토링 과제

아래 잘못된 코드를 올바르게 수정하라.

```dart
// ❌ 문제 있는 코드 — 3가지 오류를 찾아 수정하라
class BuggyWidget extends StatefulWidget {
  const BuggyWidget({super.key});
  @override
  State<BuggyWidget> createState() => _BuggyWidgetState();
}

class _BuggyWidgetState extends State<BuggyWidget> {
  int _count = 0;
  late TextEditingController _textController;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
    // 오류 1: initState에서 context 탐색
    final theme = Theme.of(context);
    print(theme.primaryColor);
  }

  @override
  Widget build(BuildContext context) {
    // 오류 2: build() 안에서 setState() 직접 호출
    setState(() => _count++);
    return Text('$_count');
  }

  // 오류 3: dispose() 미구현 (TextEditingController 누수)
}
```

**모범 답안:**

```dart
class FixedWidget extends StatefulWidget {
  const FixedWidget({super.key});
  @override
  State<FixedWidget> createState() => _FixedWidgetState();
}

class _FixedWidgetState extends State<FixedWidget> {
  int _count = 0;
  late TextEditingController _textController;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
    // 수정 1: context 탐색은 didChangeDependencies()에서
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final theme = Theme.of(context); // ✅ 여기서 안전
    print(theme.primaryColor);
  }

  @override
  Widget build(BuildContext context) {
    // 수정 2: build()에서 setState() 제거 — 상태 변경은 이벤트 핸들러에서
    return Column(
      children: [
        Text('$_count'),
        ElevatedButton(
          onPressed: () => setState(() => _count++), // ✅ 이벤트에서 setState
          child: const Text('증가'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    // 수정 3: dispose() 구현 — 리소스 해제
    _textController.dispose();
    super.dispose();
  }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Remember]** StatefulWidget Lifecycle에서 가장 먼저 호출되는 메서드는?

- A) build()
- B) didChangeDependencies()
- C) **initState()** ✅
- D) createState()

> 참고: `createState()`는 Widget 클래스의 메서드이며, State 클래스의 Lifecycle 시작은 `initState()`다.

---

**Q2. [Understand]** State 객체가 Widget과 분리되어 존재하는 핵심 이유는?

- A) Dart 언어 제약 때문에
- B) 메모리를 절약하기 위해
- C) **Widget은 불변이라 가변 상태를 가질 수 없기 때문에** ✅
- D) 테스트를 쉽게 하기 위해

---

**Q3. [Understand]** `dispose()` 안에서 `super.dispose()`를 마지막에 호출해야 하는 이유는?

> **모범 답안:** `super.dispose()`는 Flutter 프레임워크가 State 객체와 관련된 내부 리소스를 정리하는 작업을 수행한다. 이 호출 이후에는 State가 무효화된다. 따라서 자신의 리소스를 먼저 해제한 뒤 마지막에 `super.dispose()`를 호출해야 올바른 정리 순서가 보장된다. (반대로 `initState()`에서는 `super.initState()`를 가장 먼저 호출해야 한다.)

---

**Q4. [Analyze]** 비동기 작업 완료 후 setState()를 호출하기 전에 `if (!mounted) return`을 확인해야 하는 이유는?

> **모범 답안:** 비동기 작업이 진행되는 동안 해당 Widget이 트리에서 제거(dispose)될 수 있다. 이미 dispose된 State에서 `setState()`를 호출하면 "setState() called after dispose()" 오류가 발생한다. `mounted`는 State가 현재 트리에 연결되어 있는지를 나타내는 프로퍼티이므로, 비동기 작업 완료 시점에 이를 먼저 확인함으로써 오류를 방지한다.

---

**Q5. [Apply]** `AnimationController`를 가진 StatefulWidget에서 메모리 누수 없이 올바르게 초기화·해제하는 코드를 작성하라.

```dart
// 모범 답안
class AnimWidget extends StatefulWidget {
  const AnimWidget({super.key});
  @override
  State<AnimWidget> createState() => _AnimWidgetState();
}

class _AnimWidgetState extends State<AnimWidget>
    with SingleTickerProviderStateMixin {

  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => Opacity(
        opacity: _controller.value,
        child: const FlutterLogo(size: 100),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();  // ✅ 반드시 해제
    super.dispose();
  }
}
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **StatelessWidget**은 상태가 없고 `build()` 하나만 구현한다. 외부에서 받은 불변 데이터로만 UI를 구성한다.
- **StatefulWidget**은 State 객체를 분리해 가변 상태를 관리한다. Widget은 재생성되어도 State는 살아남는다.
- **Lifecycle 순서:** `initState` → `didChangeDependencies` → `build` → (`didUpdateWidget` → `build`) → `deactivate` → `dispose`
- **`initState()`**에서 context 기반 탐색은 금지, 컨트롤러 초기화는 권장.
- **`build()`**는 순수 함수처럼 작성하며 `setState()` 직접 호출은 금지.
- **`dispose()`**에서 모든 리소스를 해제하고 마지막에 `super.dispose()` 호출.
- 비동기 완료 후 `setState()` 호출 시 **`mounted` 확인** 필수.

### 6.2 다음 Step 예고

- **Step 06 — Layout 시스템:** Flutter의 레이아웃 원칙 "Constraints go down, Sizes go up, Parent sets position"과 Box Constraints, Flex 레이아웃(Row·Column·Expanded·Flexible)을 학습한다.

### 6.3 참고 자료

| 자료                              | 링크                                                                | 설명                  |
| --------------------------------- | ------------------------------------------------------------------- | --------------------- |
| StatefulWidget 공식 문서          | <https://api.flutter.dev/flutter/widgets/StatefulWidget-class.html> | API 레퍼런스          |
| State Lifecycle 공식 문서         | <https://api.flutter.dev/flutter/widgets/State-class.html>          | Lifecycle 메서드 상세 |
| Flutter — Widget Lifecycle (영상) | <https://www.youtube.com/watch?v=AqCMFXEmf3w>                       | Google 공식 설명 영상 |
| Stateful vs Stateless             | <https://docs.flutter.dev/ui/interactivity>                         | 공식 인터랙션 가이드  |

### 6.4 FAQ

**Q. StatelessWidget도 외부 상태가 변경되면 rebuild되는가?**

> 그렇다. 부모 Widget이 rebuild되면 자식 StatelessWidget도 `build()`가 호출된다. 다만 StatelessWidget은 스스로 rebuild를 일으킬 수 없다.

**Q. State 클래스 이름 앞에 `_`를 붙이는 이유는?**

> Dart에서 `_` 접두사는 해당 파일 내에서만 접근 가능한 private을 의미한다. State는 외부에서 직접 접근할 필요가 없으므로 private으로 선언하는 것이 관례이자 캡슐화 원칙에 맞다.

**Q. StatefulWidget 대신 항상 Riverpod·Provider 같은 상태관리 라이브러리를 써야 하는가?**

> 아니다. 단일 Widget 내에서만 사용되는 로컬 상태(폼 입력값, 애니메이션 진행 여부 등)는 StatefulWidget의 setState()로 충분하다. 여러 Widget에서 공유해야 하는 전역 상태는 상태관리 라이브러리를 사용한다.

---

## 빠른 자가진단 체크리스트

- [ ] StatelessWidget과 StatefulWidget의 차이를 한 문장씩 설명할 수 있는가?
- [ ] Lifecycle 6단계를 순서대로 말할 수 있는가?
- [ ] `initState()`에서 context를 사용하면 안 되는 이유를 설명할 수 있는가?
- [ ] `build()` 안에서 `setState()`를 호출하면 안 되는 이유를 설명할 수 있는가?
- [ ] `dispose()`에서 해제해야 하는 리소스 3가지 이상을 말할 수 있는가?
- [ ] 비동기 작업 후 `mounted` 확인이 필요한 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: `super.dispose()`를 마지막에 호출해야 하는 이유를 설명할 수 있는가?
