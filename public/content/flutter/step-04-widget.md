# Step 04 — Widget 개념

> **파트:** 2️⃣ Flutter UI 시스템 이해 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Flutter의 Three Trees(Widget Tree, Element Tree, RenderObject Tree) 이름을 나열할 수 있다.
2. **[Understand]** Widget, Element, RenderObject 각각의 역할과 책임을 자신의 말로 설명할 수 있다.
3. **[Understand]** Flutter의 Build 과정에서 세 트리가 어떻게 협력하는지 설명할 수 있다.
4. **[Understand]** Widget이 불변(immutable)인 이유를 설명할 수 있다.
5. **[Analyze]** Widget Tree가 재구성되어도 Element Tree가 유지되는 이유와 그 성능적 의미를 분석할 수 있다.
6. **[Analyze]** Key가 Element 재사용에 미치는 영향을 분석할 수 있다.

**전제 지식:** Step 01~03 완료, Dart 클래스·상속 기초(Step 02)

---

## 1. 서론

### 1.1 "Flutter에서 모든 것은 Widget이다"

Flutter를 처음 접하면 이 문장을 만나게 된다. 버튼도 Widget, 텍스트도 Widget, 여백도 Widget, 심지어 앱 자체도 Widget이다.

그런데 Widget이 이렇게 많이 생성되고 폐기된다면 **성능은 어떻게 보장되는가?**

```
// 이 코드는 setState가 호출될 때마다 실행된다
@override
Widget build(BuildContext context) {
  return Column(                       // 새 Column Widget 객체 생성
    children: [
      Text('count: $_counter'),        // 새 Text Widget 객체 생성
      ElevatedButton(                  // 새 ElevatedButton 객체 생성
        onPressed: _increment,
        child: Text('증가'),            // 새 Text Widget 객체 생성
      ),
    ],
  );
}
// build()가 호출될 때마다 새 Widget 객체들이 만들어진다
// → 그런데 화면은 왜 깜빡이지 않는가?
```

이 질문의 답이 **Three Trees** 구조에 있다.

### 1.2 왜 Three Trees를 알아야 하는가

Three Trees를 이해하지 못하면 아래 상황에서 막히게 된다.

- "왜 `const`를 붙이면 성능이 좋아진다고 하지?"
- "왜 리스트 항목이 재배열될 때 `Key`가 필요하지?"
- "setState를 호출하면 전체 화면이 다시 그려지는 건가?"
- "`BuildContext`가 도대체 무엇인가?"

이 모든 답이 Widget / Element / RenderObject의 역할 분리에서 나온다.

### 1.3 전체 개념 지도

![Widget/Element/RenderObject Three Trees](/developer-open-book/diagrams/step04-three-trees.svg)

---

## 2. 기본 개념과 용어

| 용어                  | 정의                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Widget**            | UI를 설명하는 불변(immutable) 설계도. 화면에 무엇을 어떻게 표시할지를 기술함               |
| **Element**           | Widget을 화면에 실제로 배치하는 연결자. Widget과 RenderObject를 연결하고 생명주기를 관리함 |
| **RenderObject**      | 실제 레이아웃 계산(크기·위치)과 픽셀 그리기를 담당하는 객체. 생성·수정 비용이 가장 큼      |
| **Widget Tree**       | 개발자가 `build()` 메서드로 구성하는 Widget의 계층 구조                                    |
| **Element Tree**      | Flutter 프레임워크가 내부적으로 관리하는 Element의 계층 구조. Widget Tree와 1:1 대응       |
| **RenderObject Tree** | 실제 렌더링에 사용되는 RenderObject의 계층 구조                                            |
| **BuildContext**      | 현재 Widget이 Widget Tree 내에서 차지하는 위치 정보. 실제로는 Element 객체                 |
| **build()**           | Widget이 자신의 자식 Widget Tree를 반환하는 메서드. 불변 Widget을 생성함                   |
| **reconciliation**    | 새 Widget Tree와 기존 Element Tree를 비교해 최소한의 변경만 반영하는 과정                  |
| **Key**               | Element가 Widget을 재사용할지 결정할 때 동일성을 식별하는 식별자                           |
| **GlobalKey**         | 앱 전체에서 유일한 Key. Element에 직접 접근하거나 State를 가져올 때 사용                   |
| **LocalKey**          | 같은 부모 아래에서만 유일한 Key. ValueKey, ObjectKey, UniqueKey 등이 있음                  |
| **const Widget**      | 컴파일 타임 상수 Widget. 동일 인스턴스를 재사용해 build() 비용을 없앰                      |
| **RenderBox**         | RenderObject의 하위 클래스. 2D 박스 모델 기반의 레이아웃을 처리함                          |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Widget: 불변 설계도

Widget은 `@immutable` 어노테이션이 붙은 **불변 객체**다. 한 번 생성된 Widget의 프로퍼티는 변경할 수 없다.

```dart
@immutable  // ← 이 어노테이션이 Widget 클래스에 선언되어 있다
abstract class Widget {
  const Widget({this.key});
  final Key? key;
  // ...
}
```

**Widget이 불변이어야 하는 이유:**

```
가변 Widget을 허용한다면?
─────────────────────────────────────────────────────
  Widget의 색상을 변경
       ↓
  Flutter: "이 Widget이 변경됐나? 언제? 어떻게?"
       ↓
  변경 감지를 위한 복잡한 추적 로직 필요
       ↓
  성능 저하, 예측 불가능한 동작

불변 Widget이라면?
─────────────────────────────────────────────────────
  새 Widget 객체를 생성해 반환
       ↓
  Flutter: "새 Widget과 기존 Element를 비교"
       ↓
  runtimeType과 Key만 비교하면 됨 → 단순·빠름
```

Widget이 불변이기 때문에 Flutter는 빠르고 단순한 **비교(diffing)** 알고리즘으로 변경을 감지할 수 있다.

---

### 3.2 Three Trees의 역할 분리

#### 1) Widget Tree — 설계도

```dart
// 개발자가 작성하는 Widget Tree
MaterialApp(                    ← Widget
  home: Scaffold(               ← Widget
    appBar: AppBar(             ← Widget
      title: Text('Flutter'),   ← Widget
    ),
    body: Center(               ← Widget
      child: Text('Hello'),     ← Widget
    ),
  ),
)
```

- **불변(immutable)**: 생성 후 변경 불가
- **경량**: 단순한 데이터 객체에 가깝다
- **자주 재생성**: `setState()` 호출 시마다 새 객체가 만들어진다
- **실제 렌더링과 무관**: Widget 자체는 화면에 아무것도 그리지 않는다

#### 2) Element Tree — 연결자·생명주기 관리자

Element는 Widget과 RenderObject를 이어주는 **살아있는 연결자**다. Flutter 프레임워크가 내부적으로 생성하고 관리한다.

```
Element의 핵심 책임
─────────────────────────────────────────────────────
  1. Widget 참조 유지   : 현재 자신에게 연결된 Widget을 기억
  2. 자식 Element 관리  : 자식 트리의 생성·업데이트·삭제
  3. RenderObject 참조  : 연결된 RenderObject 보유 (있는 경우)
  4. BuildContext 제공  : BuildContext == Element (동일 객체)
  5. 생명주기 관리      : mount → active → inactive → unmount
```

**Element의 핵심 특성: 재사용된다**

![setState Element 재사용 흐름](/developer-open-book/diagrams/step04-element-reuse.svg)

Widget은 새로 만들어졌지만, Element는 재사용되고 내부의 Widget 참조만 새것으로 교체된다. 이것이 Flutter가 매 프레임마다 Widget을 재생성해도 성능을 유지하는 핵심 비결이다.

#### 3) RenderObject Tree — 실제 그리기

RenderObject는 **레이아웃 계산과 픽셀 그리기**를 담당한다. 세 트리 중 가장 무거운 객체이며, 가능한 한 재사용된다.

```
RenderObject의 핵심 책임
─────────────────────────────────────────────────────
  1. 크기 계산  : 부모로부터 받은 Constraints로 자신의 크기 결정
  2. 위치 계산  : 부모가 자신의 위치를 결정
  3. 그리기     : Canvas에 실제 픽셀 명령 생성
  4. Hit Testing: 터치 이벤트가 자신을 지나치는지 판단
```

**모든 Widget이 RenderObject를 갖지는 않는다:**

```
Widget 종류에 따른 Element·RenderObject 보유 여부
─────────────────────────────────────────────────────
  RenderObjectWidget  → RenderObjectElement → RenderObject 생성
  (Text, Container 등 실제로 그려지는 Widget)

  ComponentWidget     → ComponentElement   → RenderObject 없음
  (StatelessWidget, StatefulWidget 등 다른 Widget을 조합하는 Widget)
```

---

### 3.3 Three Trees 협력 과정: Build → Layout → Paint

![Build→Layout→Paint→Composite→Rasterize 5단계](/developer-open-book/diagrams/step04-build-layout-paint.svg)

---

### 3.4 BuildContext: Element의 또 다른 이름

`BuildContext`는 실제로 `Element` 객체다. Dart에서 `BuildContext`는 인터페이스이고 `Element`가 이를 구현한다.

```dart
// BuildContext는 인터페이스
abstract class BuildContext {
  Widget get widget;
  // ...
}

// Element가 BuildContext를 구현
abstract class Element implements BuildContext {
  // ...
}
```

```
BuildContext의 활용
─────────────────────────────────────────────────────
  Theme.of(context)
    → context(Element)가 트리를 위로 탐색
    → 가장 가까운 Theme 조상 Element를 찾아 반환

  Navigator.of(context)
    → context가 트리를 위로 탐색
    → 가장 가까운 Navigator 조상을 반환

  MediaQuery.of(context)
    → 가장 가까운 MediaQuery 조상을 찾아 화면 정보 반환
─────────────────────────────────────────────────────
```

> ⚠️ **함정 주의:** `initState()` 안에서 `BuildContext`를 사용하면 오류가 발생할 수 있다. 이 시점에는 Element가 아직 트리에 완전히 연결되지 않았기 때문이다. `context`가 필요한 코드는 `build()` 또는 `didChangeDependencies()` 안에서 사용해야 한다.

---

### 3.5 Key: Element 재사용의 제어권

Flutter의 reconciliation은 기본적으로 **Widget의 위치(순서)와 runtimeType**으로 Element 재사용을 결정한다. 그런데 리스트 항목이 재배열되는 경우, 위치 기반 매칭만으로는 틀린 Element와 연결될 수 있다.

#### Key 없는 경우의 문제

```dart
// 두 컬러 박스를 스왑하는 예시
Column(
  children: [
    ColorBox(color: Colors.red),   // 위치 0
    ColorBox(color: Colors.blue),  // 위치 1
  ],
)

// 스왑 후
Column(
  children: [
    ColorBox(color: Colors.blue),  // 위치 0
    ColorBox(color: Colors.red),   // 위치 1
  ],
)
// 위치 0의 Element → 기존 위치 0 Element 재사용
// StatefulWidget이라면 State가 뒤바뀔 수 있다!
```

#### Key를 사용한 정확한 매칭

```dart
Column(
  children: [
    ColorBox(key: ValueKey('red'),  color: Colors.red),
    ColorBox(key: ValueKey('blue'), color: Colors.blue),
  ],
)

// 스왑 후
Column(
  children: [
    ColorBox(key: ValueKey('blue'), color: Colors.blue),
    ColorBox(key: ValueKey('red'),  color: Colors.red),
  ],
)
// Key('blue') Element → Key('blue') Widget과 정확하게 매칭됨
// State가 올바른 Widget과 연결됨
```

**Key 종류와 사용 시나리오:**

| Key 종류            | 특징             | 사용 시나리오                    |
| ------------------- | ---------------- | -------------------------------- |
| `ValueKey(value)`   | 값으로 식별      | 리스트 항목 ID 기반 식별         |
| `ObjectKey(object)` | 객체 참조로 식별 | 모델 객체로 Widget 식별          |
| `UniqueKey()`       | 항상 고유        | 매 빌드마다 새 Element 강제 생성 |
| `GlobalKey`         | 앱 전체 유일     | State 직접 접근, Form 검증       |

---

### 3.6 const Widget의 성능 최적화 원리

```dart
// const 없는 경우: build()마다 새 객체 생성
child: Text('Flutter'),      // 매번 새 Text 인스턴스

// const 있는 경우: 컴파일 타임 상수 → 동일 인스턴스 재사용
child: const Text('Flutter') // 항상 동일한 Text 인스턴스
```

`const Widget`을 사용하면 Flutter가 reconciliation 과정에서 **동일한 객체임을 즉시 확인**하고 해당 서브트리 전체를 rebuild 대상에서 제외한다.

```
const Text('Flutter')의 동작
─────────────────────────────────────────────────────
  첫 번째 build():
    Widget == 이전 Widget? → 동일 객체(identical) → 확인 완료
    → Element·RenderObject 재사용, 비교 연산 없음

  const 없는 Text('Flutter')의 동작:
    새 객체 생성 → 이전 Widget과 내용 비교
    → 같다 해도 비교 연산 비용 발생
─────────────────────────────────────────────────────
```

> ⚠️ **함정 주의:** `const`는 값이 런타임에 결정되는 경우 사용할 수 없다. `const Text(_dynamicValue)`는 컴파일 오류다. 변하지 않는 UI 요소에만 적용한다.

---

## 4. 사례 연구

### 4.1 setState()가 전체 화면을 다시 그리지 않는 이유

일반적인 오해: "setState()를 호출하면 전체 화면이 다시 렌더링된다."

실제 동작:

```
Counter 앱에서 버튼을 눌렀을 때

Widget Tree (rebuild 범위):
  MyApp
  └── MaterialApp
      └── Scaffold
          └── Column
              ├── Text('count: 1')   ← build() 새로 호출됨
              └── ElevatedButton     ← build() 새로 호출됨

Element Tree (재사용):
  모든 Element 재사용됨
  → Text Element: Widget 참조만 새것으로 교체

RenderObject Tree (실제 변경):
  Text의 RenderObject만 다시 paint됨
  나머지 RenderObject는 변경 없음
─────────────────────────────────────────────────────
  결론: Widget은 전부 재생성되지만,
        실제 GPU 연산은 변경된 부분만 수행된다.
```

### 4.2 리스트 재배열에서 Key가 필요한 실무 사례

할 일 목록(Todo) 앱에서 완료된 항목을 목록의 아래로 이동시키는 기능을 구현한다고 하자. 각 TodoItem이 StatefulWidget이고 체크박스 상태를 State로 관리한다면, Key 없이 재배열하면 **체크 상태가 잘못된 항목에 붙어다니는 버그**가 발생한다.

```dart
// 버그 발생: Key 없음
ListView(
  children: todos.map((todo) => TodoItem(todo: todo)).toList(),
)

// 정확한 동작: ValueKey 사용
ListView(
  children: todos.map(
    (todo) => TodoItem(key: ValueKey(todo.id), todo: todo)
  ).toList(),
)
```

### 4.3 const Widget으로 성능을 개선한 사례

앱 전체에 공통으로 사용되는 아이콘·레이블을 const로 선언하면, 상위 Widget이 rebuild되어도 해당 서브트리는 재평가되지 않는다.

```dart
// Before: 매 rebuild마다 Icon, Text 새 객체 생성
Row(
  children: [
    Icon(Icons.star, color: Colors.amber),
    SizedBox(width: 4),
    Text('즐겨찾기'),
  ],
)

// After: const로 완전한 재사용
const Row(
  children: [
    Icon(Icons.star, color: Colors.amber),
    SizedBox(width: 4),
    Text('즐겨찾기'),
  ],
)
```

---

## 5. 실습

### 5.1 Three Trees 흐름 추적

아래 코드를 보고 질문에 답하라.

```dart
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text('카운터'),          // (A)
        Text('값: $_count'),           // (B)
        ElevatedButton(                // (C)
          onPressed: () => setState(() => _count++),
          child: const Text('증가'),   // (D)
        ),
      ],
    );
  }
}
```

**분석 질문:**

1. 버튼을 눌러 `setState()`가 호출되면, (A)~(D) 중 새 Widget 객체가 생성되는 것은?
2. (A)와 (D)에 `const`가 있을 때와 없을 때 Element Tree에서 어떤 차이가 있는가?
3. `_count`는 Widget에 있는가, Element에 있는가, RenderObject에 있는가? 그 이유는?
4. `context`를 `BuildContext` 타입으로 선언했는데, 실제 런타임 타입은 무엇인가?

**모범 답안:**

1. `const`가 없는 (B)와 (C)는 새 Widget 객체가 생성된다. `const`가 붙은 (A)와 (D)는 동일 인스턴스가 재사용된다.
2. `const`가 있으면 Flutter가 identical() 확인으로 즉시 재사용을 결정해 서브트리 비교를 건너뛴다. `const`가 없으면 내용을 비교해야 한다.
3. `_count`는 `State` 객체에 있다. State는 Element와 생명주기를 함께하며, Widget이 재생성되어도 살아남는다. Widget은 불변이라 가변 상태를 가질 수 없다.
4. 실제 런타임 타입은 `StatefulElement`다. `BuildContext`는 인터페이스이고 `Element`가 이를 구현한다.

---

### 5.2 Key 동작 확인 실습

DartPad에서 아래 코드를 실행하며 Key의 유무에 따른 동작 차이를 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: KeyDemo()));

class KeyDemo extends StatefulWidget {
  const KeyDemo({super.key});
  @override
  State<KeyDemo> createState() => _KeyDemoState();
}

class _KeyDemoState extends State<KeyDemo> {
  List<Widget> _boxes = [
    // 실습 1: Key 없이 실행
    ColorBox(color: Colors.red),
    ColorBox(color: Colors.blue),
    ColorBox(color: Colors.green),

    // 실습 2: 아래 코드로 교체 후 실행
    // ColorBox(key: ValueKey('red'),   color: Colors.red),
    // ColorBox(key: ValueKey('blue'),  color: Colors.blue),
    // ColorBox(key: ValueKey('green'), color: Colors.green),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(children: _boxes),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _boxes = _boxes.reversed.toList()),
        child: const Icon(Icons.swap_vert),
      ),
    );
  }
}

class ColorBox extends StatefulWidget {
  final Color color;
  const ColorBox({super.key, required this.color});
  @override
  State<ColorBox> createState() => _ColorBoxState();
}

class _ColorBoxState extends State<ColorBox> {
  int _tapCount = 0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _tapCount++),
      child: Container(
        width: double.infinity,
        height: 80,
        color: widget.color,
        alignment: Alignment.center,
        child: Text('탭: $_tapCount', style: const TextStyle(fontSize: 20)),
      ),
    );
  }
}
```

**확인 포인트:**

- 각 박스를 먼저 탭해 탭 횟수를 다르게 만든다.
- FAB(swap 버튼)를 눌러 순서를 뒤집는다.
- Key 없을 때: 색상은 바뀌지만 탭 횟수가 어떻게 되는가?
- Key 있을 때: 색상과 탭 횟수가 함께 올바르게 이동하는가?

---

### 5.3 자가 평가 퀴즈

**Q1. [Remember]** Flutter의 Three Trees를 올바르게 나열한 것은?

- A) View Tree / State Tree / Layout Tree
- B) **Widget Tree / Element Tree / RenderObject Tree** ✅
- C) Component Tree / Instance Tree / Render Tree
- D) Build Tree / Paint Tree / Composite Tree

---

**Q2. [Understand]** Widget이 불변(immutable)이어야 하는 가장 중요한 이유는?

- A) 메모리를 적게 사용하기 위해
- B) Dart 언어의 제약 때문에
- C) **변경 감지를 단순하고 빠르게 하기 위해** ✅
- D) RenderObject와 타입을 맞추기 위해

---

**Q3. [Understand]** `BuildContext`의 실제 정체는?

- A) Widget의 서브클래스
- B) RenderObject를 감싸는 래퍼
- C) **Element 객체 (BuildContext 인터페이스를 구현)** ✅
- D) Flutter 프레임워크의 전역 상태 관리 객체

---

**Q4. [Analyze]** setState() 호출 후 Element Tree에서 일어나는 일을 올바르게 설명한 것은?

- A) 모든 Element가 삭제되고 새로 생성된다
- B) 변경된 Widget과 대응하는 Element만 삭제된다
- C) **대부분의 Element는 재사용되고, Widget 참조만 새것으로 교체된다** ✅
- D) Element Tree는 변하지 않으며 RenderObject만 새로 생성된다

---

**Q5. [Analyze]** 다음 중 Key를 반드시 사용해야 하는 상황은?

- A) Column 안에 Text가 하나만 있을 때
- B) const Widget을 사용할 때
- C) **StatefulWidget 리스트 항목의 순서가 런타임에 변경될 때** ✅
- D) 앱의 최상위 MaterialApp에 적용할 때

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- Flutter UI는 **Widget(설계도) / Element(연결자) / RenderObject(그리기)** 세 가지 트리로 구성된다.
- Widget은 **불변(immutable)**이기 때문에 변경 감지가 빠르고 단순하다.
- `setState()` 호출 시 Widget은 새로 생성되지만, **Element는 재사용**되어 성능이 유지된다.
- `BuildContext`는 실제로 **Element 객체**이며, 트리 탐색(`Theme.of(context)` 등)에 사용된다.
- **Key**는 Element 재사용의 정확성을 제어하며, 특히 리스트 항목 재배열 시 필수다.
- **const Widget**은 동일 인스턴스를 재사용해 rebuild 비용을 완전히 제거한다.

### 6.2 다음 Step 예고

- **Step 05 — StatelessWidget vs StatefulWidget:** Widget의 두 가지 종류, State 객체의 역할, 그리고 initState·build·didUpdateWidget·dispose 전체 Lifecycle을 학습한다.

### 6.3 참고 자료

| 자료                              | 링크                                                        | 설명                  |
| --------------------------------- | ----------------------------------------------------------- | --------------------- |
| Flutter Widget 공식 문서          | <https://docs.flutter.dev/ui/widgets-intro>                 | Widget 개요           |
| Inside Flutter                    | <https://docs.flutter.dev/resources/inside-flutter>         | Three Trees 심층 분석 |
| Keys 공식 문서                    | <https://api.flutter.dev/flutter/foundation/Key-class.html> | Key API               |
| Flutter — When to use Keys (영상) | <https://www.youtube.com/watch?v=kn0EOS-ZiIc>               | Google 공식 설명 영상 |

### 6.4 FAQ

**Q. 모든 Widget에 const를 붙이면 좋은가?**

> 가능한 한 붙이는 것이 좋다. 단, 런타임에 값이 결정되는 프로퍼티가 있으면 사용할 수 없다. Dart 분석기가 `const` 사용 가능 여부를 자동으로 알려준다.

**Q. Element Tree를 개발자가 직접 관리해야 하는가?**

> 일반적으로 아니다. Flutter 프레임워크가 자동으로 관리한다. 개발자는 Widget Tree만 작성하면 된다. GlobalKey를 사용해 특정 Element에 직접 접근하는 경우는 예외적인 상황이다.

**Q. RenderObject가 없는 Widget의 예시는?**

> `StatelessWidget`, `StatefulWidget`, `InheritedWidget` 등의 `ComponentWidget` 계열은 자체적인 RenderObject를 생성하지 않는다. 이들은 다른 Widget을 반환하는 역할만 한다. 실제 RenderObject는 `Text`, `Container`, `Row`, `Column` 등 `RenderObjectWidget` 계열에서 생성된다.

---

## 빠른 자가진단 체크리스트

- [ ] Widget / Element / RenderObject의 역할을 각각 한 문장으로 설명할 수 있는가?
- [ ] Widget이 불변이어야 하는 이유를 설명할 수 있는가?
- [ ] setState() 호출 시 세 트리에서 어떤 일이 일어나는지 설명할 수 있는가?
- [ ] BuildContext가 Element라는 것을 이해했는가?
- [ ] Key가 필요한 상황을 구체적인 예시로 설명할 수 있는가?
- [ ] const Widget의 성능 최적화 원리를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: initState() 안에서 context를 사용하면 안 되는 이유를 설명할 수 있는가?
