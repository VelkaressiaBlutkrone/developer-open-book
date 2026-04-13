# Step 06 — Layout 시스템

> **파트:** 2️⃣ Flutter UI 시스템 이해 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Flutter 레이아웃의 3원칙("Constraints go down, Sizes go up, Parent sets position")을 암기할 수 있다.
2. **[Understand]** BoxConstraints의 4가지 속성(minWidth·maxWidth·minHeight·maxHeight)이 레이아웃에 미치는 영향을 설명할 수 있다.
3. **[Understand]** `Expanded`와 `Flexible`의 차이를 설명할 수 있다.
4. **[Understand]** Intrinsic Dimensions가 성능에 미치는 비용과 사용을 피해야 하는 이유를 설명할 수 있다.
5. **[Apply]** Row·Column·Expanded·Flexible을 조합해 다양한 레이아웃을 구성할 수 있다.
6. **[Analyze]** "왜 내 위젯이 화면을 꽉 채우는가?" 같은 레이아웃 오류를 3원칙으로 진단할 수 있다.

**전제 지식:** Step 01~05 완료, RenderObject 개념(Step 04), Widget Tree 이해(Step 04)

---

## 1. 서론

### 1.1 Flutter 레이아웃 오류가 나는 이유

Flutter를 처음 배울 때 가장 많이 만나는 오류 중 하나는 다음과 같다.

```
RenderFlex children have non-zero flex but incoming height constraints are unbounded.
```

또는 위젯이 예상과 다르게 화면 전체를 차지하거나, 반대로 전혀 보이지 않는 경우도 자주 겪는다. 이런 문제들은 모두 **Flutter 레이아웃의 3원칙**을 모르기 때문에 발생한다.

```
Flutter 레이아웃 3원칙

  ① Constraints go down
     부모가 자식에게 "너는 이 범위 안에서만 그려야 해"라고 제약을 내려보낸다

  ② Sizes go up
     자식이 제약 범위 안에서 자신의 크기를 결정하고 부모에게 보고한다

  ③ Parent sets position
     부모가 자식을 어디에 배치할지 결정한다 (자식은 자신의 위치를 모른다)
```

이 세 문장을 이해하면 대부분의 레이아웃 오류를 스스로 진단하고 해결할 수 있다.

### 1.2 왜 Layout 시스템부터 배워야 하는가

```
Layout을 모르면 겪는 문제들
────────────────────────────────────────────────
  "왜 Column 안의 ListView가 오류를 낸다?"
  "왜 Container에 height를 줬는데 반응이 없다?"
  "왜 Row 안에서 Text가 넘쳐 overflow가 난다?"
  "Expanded와 Flexible 중 뭘 써야 하지?"
  "SizedBox와 Container 중 언제 뭘 쓰지?"
────────────────────────────────────────────────
  → 모두 Constraints 흐름을 모르기 때문
```

### 1.3 전체 개념 지도

![Layout 3원칙 + 시스템 hierarchy tree](/developer-open-book/diagrams/step06-layout-principles.svg)

---

## 2. 기본 개념과 용어

| 용어                      | 정의                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **BoxConstraints**        | RenderBox에 전달되는 크기 제약. minWidth·maxWidth·minHeight·maxHeight 4가지 속성으로 구성 |
| **tight constraints**     | min == max인 제약. 위젯의 크기가 딱 하나의 값으로 강제됨                                  |
| **loose constraints**     | min == 0, max가 어떤 값인 제약. 위젯이 0부터 max 사이에서 자유롭게 크기를 결정            |
| **unbounded constraints** | maxWidth 또는 maxHeight가 `double.infinity`인 제약. 스크롤 가능 영역 등에서 발생          |
| **Flex**                  | Row·Column의 기반 클래스. 자식들을 주축(main axis) 방향으로 배치하는 레이아웃             |
| **main axis**             | Flex의 배치 방향. Row는 가로, Column은 세로가 주축                                        |
| **cross axis**            | 주축에 수직인 방향. Row는 세로, Column은 가로가 교차축                                    |
| **flex factor**           | Expanded·Flexible에 지정하는 비율값. 남은 공간을 나누는 가중치                            |
| **Expanded**              | Flex 자식을 남은 공간만큼 강제로 늘린다. `FlexFit.tight`                                  |
| **Flexible**              | Flex 자식이 남은 공간까지 늘어날 수 있지만 강제하지 않는다. `FlexFit.loose`               |
| **Spacer**                | Flex 안에서 빈 공간을 만드는 위젯. `Expanded(child: SizedBox())` 와 동일                  |
| **MainAxisAlignment**     | 주축 방향 자식 정렬 방식 (start·end·center·spaceBetween·spaceAround·spaceEvenly)          |
| **CrossAxisAlignment**    | 교차축 방향 자식 정렬 방식 (start·end·center·stretch·baseline)                            |
| **IntrinsicWidth/Height** | 자식의 고유 크기를 기반으로 부모 크기를 결정하는 위젯. O(N²) 비용                         |
| **overflow**              | 자식이 부모 Constraints를 초과할 때 발생하는 오류 상태                                    |

---

## 3. 이론적 배경과 원리 ★

### 3.1 3원칙 상세 분석

#### 원칙 1: Constraints go down (제약은 내려간다)

부모 RenderObject는 자식에게 `BoxConstraints` 객체를 전달한다. 이 제약은 **"너의 크기는 반드시 이 범위 안이어야 한다"** 는 규칙이다.

```dart
// BoxConstraints 구조
BoxConstraints({
  double minWidth  = 0.0,
  double maxWidth  = double.infinity,
  double minHeight = 0.0,
  double maxHeight = double.infinity,
})

// 예시: 100×100 고정 크기 제약 (tight)
BoxConstraints.tight(Size(100, 100))
// → minWidth=100, maxWidth=100, minHeight=100, maxHeight=100

// 예시: 최대 300 너비, 높이 제한 없는 제약 (loose)
BoxConstraints(maxWidth: 300)
// → minWidth=0, maxWidth=300, minHeight=0, maxHeight=∞
```

![Constraints Down→Sizes Up flow](/developer-open-book/diagrams/step06-constraints-flow.svg)

#### 원칙 2: Sizes go up (크기는 올라간다)

자식은 전달받은 Constraints 안에서 **자신의 크기를 결정하고 부모에게 반환**한다. 부모는 자식의 크기를 바탕으로 자신의 크기를 결정한다.

![Constraints Down→Sizes Up flow](/developer-open-book/diagrams/step06-constraints-flow.svg)

#### 원칙 3: Parent sets position (부모가 위치를 결정)

자식은 **자신이 어디에 배치되는지 알지 못한다**. 위치 결정은 오직 부모의 권한이다.

```dart
// Column이 자식들의 위치를 결정하는 예
Column(
  mainAxisAlignment: MainAxisAlignment.center,  // ← 부모가 결정
  children: [
    Text('첫 번째'),   // 자신의 위치 모름
    Text('두 번째'),   // 자신의 위치 모름
  ],
)
```

---

### 3.2 tight, loose, unbounded 제약 구분

레이아웃 오류의 대부분은 **unbounded constraints** 상황을 이해하지 못해서 발생한다.

```
tight constraints    → min == max
  예: SizedBox(100, 100)의 자식에게 전달하는 제약
  자식은 정확히 100×100이어야 함

loose constraints    → min == 0, max가 특정 값
  예: Column의 자식에게 전달하는 너비 제약
  자식은 0부터 Column 너비까지 자유롭게 선택 가능

unbounded constraints → max == double.infinity
  예: ListView·ScrollView 안에서 스크롤 방향의 제약
  자식이 원하는 만큼 커질 수 있음 (무한 공간)
```

**unbounded 제약이 문제를 일으키는 사례:**

```dart
// ❌ 오류: Column 안에 Column을 넣으면
// 안쪽 Column이 unbounded 높이 제약을 받음
// 자식이 Expanded를 가지면 오류 발생

Column(
  children: [
    Column(            // 높이 unbounded 제약 수신
      children: [
        Expanded(      // ← "unbounded인데 Expanded?" → 오류!
          child: Text('오류'),
        ),
      ],
    ),
  ],
)

// ✅ 해결: Expanded로 감싸거나 SizedBox로 높이 제한
Column(
  children: [
    SizedBox(
      height: 200,     // 높이를 명시적으로 제한
      child: Column(
        children: [
          Expanded(child: Text('정상')),
        ],
      ),
    ),
  ],
)
```

---

### 3.3 Flex 레이아웃: Row와 Column

Row와 Column은 Flutter에서 가장 자주 사용하는 레이아웃 위젯이다. 공통된 `Flex` 클래스를 상속하며, 방향만 다르다.

```
Row    → 주축: 가로(horizontal), 교차축: 세로
Column → 주축: 세로(vertical),   교차축: 가로
```

#### 주요 속성

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween, // 주축 정렬
  crossAxisAlignment: CrossAxisAlignment.center,     // 교차축 정렬
  mainAxisSize: MainAxisSize.min,  // 주축 크기: max(꽉 채움) or min(내용 크기)
  children: [...],
)
```

**MainAxisAlignment 옵션 시각화 (Row 기준):**

```
start:        [A]  [B]  [C]          ←←←←←←←←←←←
end:          ←←←←←←←←←← [A]  [B]  [C]
center:       ←←←←  [A]  [B]  [C]  →→→→
spaceBetween: [A]  ←→←→←→←→←→←→  [B]  ←→←→←→←→  [C]
spaceAround:  ←→  [A]  ←→←→  [B]  ←→←→  [C]  →→
spaceEvenly:  ←→←→ [A] ←→←→ [B] ←→←→ [C] ←→←→
```

**CrossAxisAlignment 옵션 시각화 (Row 기준, 세로 방향):**

```
start:   ┌─[A]─┬─[B]─┬─[C]─┐   위쪽 정렬
         │     │     │     │
         └─────┴─────┴─────┘

center:  ┌─────┬─────┬─────┐
         │ [A] │ [B] │ [C] │   가운데 정렬
         └─────┴─────┴─────┘

stretch: ┌─────┬─────┬─────┐
         │[A]  │[B]  │[C]  │   교차축 최대로 늘림
         │     │     │     │
         └─────┴─────┴─────┘
```

---

### 3.4 Expanded vs Flexible

Flex 레이아웃의 핵심 개념으로, 두 위젯 모두 **남은 공간을 자식에게 분배**하는 역할을 한다. 차이는 자식이 공간을 강제로 채우는지 여부다.

```dart
// Expanded: FlexFit.tight — 남은 공간을 반드시 모두 채운다
Row(
  children: [
    Expanded(flex: 1, child: Container(color: Colors.red)),    // 1/3
    Expanded(flex: 2, child: Container(color: Colors.blue)),   // 2/3
  ],
)

// Flexible: FlexFit.loose — 남은 공간까지 늘어날 수 있지만 강제하지 않음
Row(
  children: [
    Flexible(flex: 1, child: Container(color: Colors.red, width: 50)),
    // width: 50이면 50만 차지 (남은 공간을 다 쓰지 않아도 됨)
    Flexible(flex: 2, child: Container(color: Colors.blue, width: 80)),
  ],
)
```

**Expanded vs Flexible 핵심 차이:**

```
Expanded (FlexFit.tight)
  자식에게 전달하는 Constraints:
  minWidth == maxWidth == 배분된 공간
  → 자식은 정확히 배분된 공간만큼 채워야 함

Flexible (FlexFit.loose)
  자식에게 전달하는 Constraints:
  minWidth == 0, maxWidth == 배분된 공간
  → 자식은 0부터 배분된 공간까지 자유롭게 결정
```

| 상황                               | 사용 위젯                                 |
| ---------------------------------- | ----------------------------------------- |
| 남은 공간을 반드시 채워야 할 때    | `Expanded`                                |
| 내용 크기에 맞게 유동적으로        | `Flexible`                                |
| 텍스트 overflow 방지 (넘치면 줄임) | `Flexible`                                |
| 같은 비율로 공간 분할              | `Expanded(flex: n)`                       |
| 빈 여백 삽입                       | `Spacer` or `Expanded(child: SizedBox())` |

---

### 3.5 실전 레이아웃 패턴

#### 패턴 1: 헤더 고정 + 나머지 채우기

```dart
Column(
  children: [
    const SizedBox(height: 60, child: HeaderWidget()),  // 고정
    Expanded(child: ContentWidget()),                    // 나머지 전부
  ],
)
```

#### 패턴 2: 1:2:1 비율 분할

```dart
Row(
  children: [
    Expanded(flex: 1, child: LeftPanel()),
    Expanded(flex: 2, child: MainContent()),
    Expanded(flex: 1, child: RightPanel()),
  ],
)
```

#### 패턴 3: 텍스트 overflow 방지

```dart
// ❌ 오류: Row 안에서 Text가 긴 경우 overflow
Row(
  children: [
    Icon(Icons.star),
    Text('이 텍스트가 매우 길면 화면을 넘칩니다'),  // overflow!
  ],
)

// ✅ 해결: Expanded 또는 Flexible로 감싸기
Row(
  children: [
    const Icon(Icons.star),
    Expanded(
      child: Text(
        '이 텍스트가 매우 길어도 줄바꿈됩니다',
        overflow: TextOverflow.ellipsis,
      ),
    ),
  ],
)
```

#### 패턴 4: 공간 균등 분배

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  children: [
    IconButton(icon: const Icon(Icons.home), onPressed: () {}),
    IconButton(icon: const Icon(Icons.search), onPressed: () {}),
    IconButton(icon: const Icon(Icons.person), onPressed: () {}),
  ],
)
```

---

### 3.6 Single-child 레이아웃 위젯

| 위젯               | 역할                                | 주요 사용 시나리오             |
| ------------------ | ----------------------------------- | ------------------------------ |
| `SizedBox`         | 크기를 강제 지정 또는 빈 여백 삽입  | 정확한 크기 지정, 위젯 간 간격 |
| `Padding`          | 내부 여백 추가                      | 사방 또는 특정 방향 패딩       |
| `Center`           | 자식을 가운데 배치                  | 단순 중앙 정렬                 |
| `Align`            | 자식을 특정 정렬 위치에 배치        | topRight, bottomLeft 등        |
| `FittedBox`        | 자식을 부모 크기에 맞게 스케일 조정 | 오버플로우 방지, 비율 유지     |
| `ConstrainedBox`   | 최소·최대 크기 제약 추가            | 최소 너비 보장 등              |
| `UnconstrainedBox` | 부모 Constraints 무시               | 특수한 경우에만 사용           |

---

### 3.7 Intrinsic Dimensions: 성능 비용 이해

`IntrinsicWidth`와 `IntrinsicHeight`는 **자식의 고유(intrinsic) 크기**를 기반으로 부모의 크기를 결정하는 위젯이다.

```dart
// 사용 예: Row 안에서 모든 자식의 높이를 가장 큰 자식에 맞추기
IntrinsicHeight(
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      ColumnA(),   // 높이 100
      Divider(),   // 모든 자식 중 가장 큰 높이(100)에 맞춰짐
      ColumnB(),   // 높이 200
    ],
  ),
)
```

**왜 성능 비용이 큰가:**

```
일반 레이아웃 (O(N)):
  부모 → Constraints 전달 → 자식 크기 반환 → 완료

IntrinsicHeight (O(N²)):
  ① 자식마다 "고유 높이가 얼마인지 물어보는" 추가 패스 실행
  ② 그 결과를 바탕으로 다시 레이아웃 패스 실행
  → 레이아웃 계산이 최소 2배 이상 비쌈
  → 자식 수가 많을수록 비용 급증
```

> ⚠️ **함정 주의:** `IntrinsicWidth`·`IntrinsicHeight`는 대부분의 경우 대안이 있다. 같은 높이를 맞추는 것은 `CrossAxisAlignment.stretch` + `SizedBox` 조합으로도 해결 가능하다. 꼭 필요한 경우가 아니라면 사용을 피하고, 특히 ListView 내부 아이템에는 절대 사용하지 않는다.

---

## 4. 사례 연구

### 4.1 "왜 Column 안의 ListView가 오류를 낼까"

Flutter 입문자가 가장 많이 겪는 오류 중 하나다.

```dart
// ❌ 오류 발생
Column(
  children: [
    Text('제목'),
    ListView(          // Column이 unbounded 높이를 전달
      children: [...], // ListView도 unbounded 높이 요청 → 충돌!
    ),
  ],
)

// 원인 분석 (3원칙 적용):
// Column → ListView에게 높이 unbounded 제약 전달 (원칙 1)
// ListView: "나는 스크롤 가능하니까 원하는 만큼 커지고 싶다"
// → 무한 높이 요청 → Flutter: "얼마나 크게 그려야 할지 모름" → 오류
```

**해결책별 비교:**

```dart
// 해결 1: SizedBox로 높이 명시
Column(
  children: [
    const Text('제목'),
    SizedBox(
      height: 300,
      child: ListView(children: [...]),
    ),
  ],
)

// 해결 2: Expanded로 남은 공간 채우기 (Scaffold 등 bounded 부모 아래에서)
Column(
  children: [
    const Text('제목'),
    Expanded(
      child: ListView(children: [...]),
    ),
  ],
)

// 해결 3: ListView.shrinkWrap
// ⚠️ 성능 주의: 전체 목록을 한 번에 레이아웃 계산 (Intrinsic과 유사한 비용)
Column(
  children: [
    const Text('제목'),
    ListView(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [...],
    ),
  ],
)
```

---

### 4.2 소셜 앱 프로필 카드 레이아웃 분석

```
┌──────────────────────────────────────────┐
│  [아바타]  이름              [팔로우 버튼] │
│            @핸들                          │
│  ─────────────────────────────────────── │
│  게시물 124    팔로워 1.2K    팔로잉 340   │
└──────────────────────────────────────────┘
```

```dart
Column(
  children: [
    // 상단: 아바타 + 이름 + 버튼
    Row(
      children: [
        const CircleAvatar(radius: 28),
        const SizedBox(width: 12),
        // 이름 + 핸들: 남은 공간 차지 (overflow 방지)
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('이름', style: TextStyle(fontWeight: FontWeight.bold)),
              const Text('@handle', style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
        FilledButton(onPressed: () {}, child: const Text('팔로우')),
      ],
    ),
    const Divider(height: 24),
    // 하단: 통계 균등 분배
    Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: const [
        _StatItem(label: '게시물', value: '124'),
        _StatItem(label: '팔로워', value: '1.2K'),
        _StatItem(label: '팔로잉', value: '340'),
      ],
    ),
  ],
)
```

**핵심 포인트:**

- 이름+핸들 영역에 `Expanded`를 사용해 팔로우 버튼이 오른쪽에 고정되도록 했다.
- 통계 항목은 `MainAxisAlignment.spaceEvenly`로 균등 배치했다.

---

### 4.3 Expanded flex로 반응형 레이아웃 구현

태블릿과 모바일에서 비율이 달라야 하는 레이아웃.

```dart
Widget build(BuildContext context) {
  final isTablet = MediaQuery.of(context).size.width > 600;

  return Row(
    children: [
      Expanded(
        flex: isTablet ? 1 : 0,           // 태블릿: 사이드바 표시
        child: isTablet ? SideBar() : const SizedBox.shrink(),
      ),
      Expanded(
        flex: isTablet ? 3 : 1,           // 태블릿: 3/4, 모바일: 전체
        child: MainContent(),
      ),
    ],
  );
}
```

---

## 5. 실습

### 5.1 그리드 레이아웃 구현

아래 목표 레이아웃을 Row·Column·Expanded만 사용해 구현하라.

```
목표 레이아웃:
┌────────────────────────────────────┐
│           헤더 (고정 60px)          │
├──────────┬─────────────────────────┤
│          │                         │
│ 사이드바  │       메인 콘텐츠        │
│  (1/3)   │         (2/3)           │
│          │                         │
├──────────┴─────────────────────────┤
│           푸터 (고정 50px)          │
└────────────────────────────────────┘
```

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: GridLayout()));

class GridLayout extends StatelessWidget {
  const GridLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // 헤더 (고정 60px)
          Container(
            height: 60,
            color: Colors.blueGrey[800],
            alignment: Alignment.center,
            child: const Text('헤더', style: TextStyle(color: Colors.white)),
          ),

          // 메인 영역 (남은 공간 전부)
          Expanded(
            child: Row(
              children: [
                // 사이드바 (1/3)
                Expanded(
                  flex: 1,
                  child: Container(
                    color: Colors.blueGrey[100],
                    alignment: Alignment.center,
                    child: const Text('사이드바'),
                  ),
                ),
                // 메인 콘텐츠 (2/3)
                Expanded(
                  flex: 2,
                  child: Container(
                    color: Colors.white,
                    alignment: Alignment.center,
                    child: const Text('메인 콘텐츠'),
                  ),
                ),
              ],
            ),
          ),

          // 푸터 (고정 50px)
          Container(
            height: 50,
            color: Colors.blueGrey[800],
            alignment: Alignment.center,
            child: const Text('푸터', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- 화면 크기를 바꿔도 헤더·푸터는 고정이고 메인 영역이 늘어나는가?
- 1:2 비율이 정확히 적용되는가?
- `Expanded` 없이 `Column`만 사용하면 어떤 오류가 발생하는가?

---

### 5.2 Constraints 흐름 추적 과제

아래 코드에서 각 위젯이 받는 Constraints를 분석하라. (화면 너비 360px 가정)

```dart
SizedBox(
  width: 300,
  child: Row(
    children: [
      Expanded(
        flex: 1,
        child: Container(color: Colors.red),   // (A)
      ),
      const SizedBox(width: 20),               // (B)
      Expanded(
        flex: 2,
        child: Container(color: Colors.blue),  // (C)
      ),
    ],
  ),
)
```

**분석 질문:**

1. `SizedBox(width: 300)`이 Row에 전달하는 Constraints는?
2. Row가 `Expanded`에게 공간을 분배할 때, SizedBox(width: 20)을 먼저 빼고 나머지를 flex 비율로 나눈다. (A)와 (C)가 받는 너비는 각각 얼마인가?
3. (B) `SizedBox(width: 20)`이 받는 Constraints는 tight인가 loose인가?

**모범 답안:**

1. `BoxConstraints.tight(Size(300, 화면높이))`에 가까운 제약
2. 남은 공간 = 300 - 20 = 280px. flex 합계 = 3. (A) = 280 × (1/3) ≈ **93px**, (C) = 280 × (2/3) ≈ **187px**
3. Row가 SizedBox에게 `tight(width: 20)` 제약을 전달. → **tight**

---

### 5.3 자가 평가 퀴즈

**Q1. [Remember]** Flutter 레이아웃 3원칙 중 "자식이 크기를 결정해 부모에게 반환"하는 원칙은?

- A) Constraints go down
- B) **Sizes go up** ✅
- C) Parent sets position
- D) Children decide layout

---

**Q2. [Understand]** `Expanded`와 `Flexible`의 핵심 차이는?

- A) Expanded는 Row에서만, Flexible은 Column에서만 사용한다
- B) Expanded는 flex 값을 가질 수 없다
- C) **Expanded는 남은 공간을 강제로 채우고, Flexible은 최대 공간까지만 늘어날 수 있다** ✅
- D) Flexible은 Expanded보다 성능이 낮다

---

**Q3. [Understand]** `IntrinsicHeight`를 ListView 내부 아이템에 사용하면 안 되는 이유는?

> **모범 답안:** `IntrinsicHeight`는 자식의 고유 크기를 구하기 위해 레이아웃을 두 번 수행하는 O(N²) 비용이 발생한다. ListView는 많은 수의 아이템을 가질 수 있으므로, 각 아이템마다 `IntrinsicHeight`를 사용하면 전체 레이아웃 비용이 N² 수준으로 급증해 심각한 성능 저하를 일으킨다.

---

**Q4. [Analyze]** Column 안에서 ListView를 사용할 때 오류가 발생하는 이유를 3원칙으로 설명하라.

> **모범 답안:** 원칙 1(Constraints go down)에 따라 Column은 자식에게 높이가 unbounded인 BoxConstraints를 전달한다. ListView는 스크롤 가능한 위젯으로, 자신의 크기를 결정하려면 유한한 높이 제약이 필요하다. unbounded 제약을 받으면 "얼마나 크게 그려야 할지" 결정할 수 없어 오류가 발생한다. 해결책은 `Expanded`로 감싸거나 `SizedBox`로 높이를 명시해 유한한 제약을 전달하는 것이다.

---

**Q5. [Apply]** 화면 하단에 버튼을 고정하고 나머지 영역을 스크롤 가능한 콘텐츠로 채우는 레이아웃을 작성하라.

```dart
// 모범 답안
Column(
  children: [
    Expanded(
      child: ListView(
        children: List.generate(
          20,
          (i) => ListTile(title: Text('항목 $i')),
        ),
      ),
    ),
    // 하단 고정 버튼
    Padding(
      padding: const EdgeInsets.all(16),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () {},
          child: const Text('확인'),
        ),
      ),
    ),
  ],
)
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- Flutter 레이아웃은 **"Constraints go down → Sizes go up → Parent sets position"** 3원칙으로 동작한다.
- **BoxConstraints**는 minWidth·maxWidth·minHeight·maxHeight 4가지 속성으로 구성되며, `tight`·`loose`·`unbounded` 세 가지 유형이 있다.
- **Expanded**는 남은 공간을 강제로 채우고(`FlexFit.tight`), **Flexible**은 최대 공간까지만 늘어날 수 있다(`FlexFit.loose`).
- **unbounded constraints**를 ListView·Column 같은 스크롤 가능 위젯에 전달하면 오류가 발생한다. `Expanded` 또는 `SizedBox`로 유한한 제약을 제공해 해결한다.
- **IntrinsicWidth·IntrinsicHeight**는 O(N²) 비용이 발생하므로 꼭 필요한 경우가 아니면, 특히 ListView 내부에서는 사용하지 않는다.

### 6.2 다음 Step 예고

- **Step 07 — 기본 UI 위젯:** Container, Text, Image, Icon, Padding, Align 등 자주 쓰는 기본 위젯의 속성과 사용 패턴을 학습한다.

### 6.3 참고 자료

| 자료                         | 링크                                                                           | 설명                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Flutter Layout 공식 문서     | <https://docs.flutter.dev/ui/layout>                                           | 레이아웃 개요        |
| Understanding constraints    | <https://docs.flutter.dev/ui/layout/constraints>                               | 3원칙 공식 심층 문서 |
| Flutter — Layout Cheat Sheet | <https://medium.com/flutter-community/flutter-layout-cheat-sheet-5363348d037e> | 레이아웃 패턴 모음   |
| Flutter Widget Inspector     | <https://docs.flutter.dev/tools/devtools/inspector>                            | 레이아웃 디버깅 도구 |

### 6.4 FAQ

**Q. SizedBox와 Container 중 언제 무엇을 쓰는가?**

> 크기만 지정할 때는 `SizedBox`가 더 가볍고 의미가 명확하다. `Container`는 색상, 테두리, 그림자, 변환(transform) 등 추가적인 꾸미기가 필요할 때 사용한다. "크기만 → SizedBox, 꾸미기 포함 → Container" 로 기억하면 편하다.

**Q. `MainAxisSize.min`은 언제 사용하는가?**

> Column·Row가 자식 내용에 맞게 최소 크기로 줄어들어야 할 때 사용한다. 기본값인 `MainAxisSize.max`는 주축 방향으로 가능한 최대 크기를 차지한다. 예를 들어 버튼 내부의 Row에서 아이콘과 텍스트만큼만 너비를 차지하게 하려면 `MainAxisSize.min`을 사용한다.

**Q. Flutter DevTools에서 Constraints를 직접 확인할 수 있는가?**

> 그렇다. Flutter DevTools의 **Widget Inspector** 탭에서 위젯을 선택하면 해당 위젯이 받은 Constraints와 자신의 크기(Size)를 확인할 수 있다. 레이아웃 디버깅 시 매우 유용하다.

---

## 빠른 자가진단 체크리스트

- [ ] Flutter 레이아웃 3원칙을 외워서 말할 수 있는가?
- [ ] tight·loose·unbounded constraints의 차이를 설명할 수 있는가?
- [ ] Expanded와 Flexible의 차이를 한 문장으로 설명할 수 있는가?
- [ ] Column 안에 ListView를 넣으면 왜 오류가 나는지 설명할 수 있는가?
- [ ] IntrinsicHeight를 ListView에 쓰면 안 되는 이유를 설명할 수 있는가?
- [ ] Row의 MainAxisAlignment 6가지 옵션을 그림으로 그릴 수 있는가?
- [ ] ⚠️ 함정 체크: unbounded 높이 제약이 발생하는 대표적인 위젯 조합 2가지를 말할 수 있는가?
