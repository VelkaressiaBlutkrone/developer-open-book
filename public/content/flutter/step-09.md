# Step 09 — 사용자 입력 처리

> **파트:** 3️⃣ 사용자 인터랙션 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** GestureDetector와 InkWell의 차이와 각각의 적합한 사용 시나리오를 설명할 수 있다.
2. **[Understand]** Flutter의 제스처 인식 경쟁(Gesture Arena) 메커니즘을 설명할 수 있다.
3. **[Understand]** FocusNode의 역할과 키보드 제어 흐름을 설명할 수 있다.
4. **[Understand]** Semantics 위젯이 접근성에서 하는 역할을 설명할 수 있다.
5. **[Apply]** GestureDetector로 탭·드래그·스와이프 제스처를 처리할 수 있다.
6. **[Apply]** FocusNode로 키보드를 프로그래밍 방식으로 제어할 수 있다.

**전제 지식:** Step 01~08 완료, StatefulWidget·Lifecycle(Step 05), dispose() 리소스 해제(Step 05)

---

## 1. 서론

### 1.1 사용자 입력이 Flutter에서 처리되는 흐름

사용자가 화면을 탭하는 순간, Flutter 내부에서는 여러 단계를 거쳐 이벤트가 적절한 위젯에 전달된다.

![터치→Embedder→Engine→Framework→Gesture pipeline](/developer-open-book/diagrams/step09-touch-event-pipeline.svg)

### 1.2 전체 개념 지도

![사용자 입력 처리 hierarchy](/developer-open-book/diagrams/step09-input-system.svg)

---

## 2. 기본 개념과 용어

| 용어                 | 정의                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| **GestureDetector**  | 터치 제스처를 인식하고 콜백을 호출하는 위젯. 시각적 피드백 없음                         |
| **InkWell**          | GestureDetector에 Material Ripple(물결) 시각 효과를 추가한 위젯                         |
| **Gesture Arena**    | 동일 포인터에 여러 GestureRecognizer가 경쟁할 때 승자를 결정하는 메커니즘               |
| **PointerEvent**     | 손가락의 위치·압력·방향 등 원시 터치 데이터를 담는 이벤트 객체                          |
| **HitTest**          | 터치 좌표와 겹치는 RenderObject를 탐색하는 과정                                         |
| **onTap**            | 짧게 탭했을 때 호출되는 콜백                                                            |
| **onLongPress**      | 길게 눌렀을 때 호출되는 콜백                                                            |
| **onDoubleTap**      | 빠르게 두 번 탭했을 때 호출되는 콜백                                                    |
| **onPanUpdate**      | 드래그 중 손가락이 움직일 때마다 호출되는 콜백. `DragUpdateDetails.delta`로 이동량 전달 |
| **onScaleUpdate**    | 두 손가락 확대/축소 중 호출되는 콜백. `scale`·`rotation` 값 포함                        |
| **FocusNode**        | TextField 등 입력 위젯의 포커스를 프로그래밍 방식으로 제어하는 객체                     |
| **FocusScope**       | 포커스 노드 그룹을 관리하는 위젯. 탭 이동(nextFocus) 등에 사용                          |
| **Semantics**        | 스크린 리더 등 접근성 도구에 위젯의 의미를 제공하는 위젯                                |
| **ExcludeSemantics** | 장식용 위젯을 접근성 트리에서 제외하는 위젯                                             |
| **Listener**         | 원시 PointerEvent를 직접 수신하는 저수준 위젯 (GestureDetector보다 낮은 레벨)           |

---

## 3. 이론적 배경과 원리 ★

### 3.1 GestureDetector vs InkWell

```
GestureDetector
  ─────────────────────────────────────────
  • 시각적 피드백 없음
  • 모든 제스처 이벤트 처리 가능 (pan·scale·drag 등)
  • 어떤 위젯에도 적용 가능 (Material 위젯 아니어도 됨)
  • 커스텀 게임, 그래픽, 지도 등에 적합

InkWell
  ─────────────────────────────────────────
  • Material Ripple(물결) 시각 효과 제공
  • 탭·롱프레스 등 기본 제스처만 처리
  • 반드시 Material 위젯(Scaffold 등) 아래에 있어야 Ripple 동작
  • 버튼·리스트 항목 등 표준 UI 컴포넌트에 적합
```

```dart
// GestureDetector: 시각 효과 없음, 범용 제스처
GestureDetector(
  onTap: () => print('탭!'),
  onDoubleTap: () => print('더블탭!'),
  onLongPress: () => print('롱프레스!'),
  child: Container(
    width: 100, height: 100,
    color: Colors.blue,
    child: const Center(child: Text('탭')),
  ),
)

// InkWell: Material Ripple 포함, 표준 UI에 적합
InkWell(
  onTap: () => print('탭!'),
  borderRadius: BorderRadius.circular(8),  // Ripple 클리핑
  child: Padding(
    padding: const EdgeInsets.all(12),
    child: const Text('버튼처럼 생긴 텍스트'),
  ),
)

// InkWell + Ink: Container 배경색이 있을 때 Ripple이 보이게 하는 패턴
Ink(
  decoration: BoxDecoration(
    color: Colors.purple.shade100,
    borderRadius: BorderRadius.circular(12),
  ),
  child: InkWell(
    onTap: () {},
    borderRadius: BorderRadius.circular(12),
    child: const Padding(
      padding: EdgeInsets.all(16),
      child: Text('배경 있는 InkWell'),
    ),
  ),
)
```

> ⚠️ **함정 주의:** `Container(color: ...)` 위에 `InkWell`을 올리면 Container의 색이 Ripple을 가려 효과가 보이지 않는다. 배경색이 필요하면 `Ink(decoration: BoxDecoration(...))`을 사용해야 Ripple이 배경 위에 표시된다.

---

### 3.2 Gesture Arena: 제스처 경쟁 메커니즘

화면을 드래그하면 수직 스크롤인지 수평 스크롤인지, 아니면 탭인지 Flutter는 어떻게 판단하는가?

```
Gesture Arena 동작 원리
──────────────────────────────────────────────────────
① 포인터 이벤트 발생 (손가락 닿음)
② Hit Test → 겹치는 위젯들의 GestureRecognizer 모두 수집
③ Arena에서 경쟁 시작
    → 각 recognizer가 "내가 이 제스처를 처리하겠다" 선언 가능
    → 또는 "포기" 선언 가능
④ 승자 결정
    → 마지막으로 남은 하나가 승자
    → 또는 명시적으로 "승리" 선언한 recognizer가 승자
⑤ 승자의 콜백만 호출됨
──────────────────────────────────────────────────────

실전 예시: ListView 내부의 GestureDetector
  - 세로 드래그 → ListView의 ScrollGestureRecognizer 승리
  - 수평 드래그 → GestureDetector의 HorizontalDragRecognizer 승리
  → 방향에 따라 자동으로 승자가 결정됨
```

**경쟁 충돌 해결: behavior 속성**

```dart
GestureDetector(
  behavior: HitTestBehavior.opaque,
  // .deferToChild (기본): 자식 위젯이 hit되면 자식에게 우선권
  // .opaque:             불투명 영역 전체가 이벤트 흡수
  // .translucent:        이벤트를 자신과 아래 위젯 모두 전달
  onTap: () {},
  child: Container(width: 200, height: 200),
)
```

---

### 3.3 주요 제스처 콜백 상세

#### 탭 계열

```dart
GestureDetector(
  onTapDown: (details) {
    // 손가락이 닿는 순간 (가장 빠른 반응)
    print('눌림 위치: ${details.localPosition}');
  },
  onTapUp: (details) {
    // 손가락이 떼어지는 순간
  },
  onTap: () {
    // 탭 완료 (down → up 이 같은 위치에서)
  },
  onTapCancel: () {
    // 탭이 취소됨 (드래그로 전환된 경우)
  },
  onDoubleTap: () => print('더블탭!'),
  onLongPress: () => print('롱프레스!'),
  onLongPressStart: (details) => print('롱프레스 시작'),
  child: ...,
)
```

#### Pan(드래그) 계열

```dart
GestureDetector(
  onPanStart: (details) {
    print('드래그 시작: ${details.localPosition}');
  },
  onPanUpdate: (details) {
    // 매 프레임 호출됨
    // details.delta: 이번 프레임에서의 이동량 (dx, dy)
    // details.localPosition: 현재 위치
    setState(() {
      _offsetX += details.delta.dx;
      _offsetY += details.delta.dy;
    });
  },
  onPanEnd: (details) {
    // details.velocity: 드래그 끝의 속도 (Fling 효과에 활용)
    print('드래그 속도: ${details.velocity}');
  },
  child: ...,
)
```

#### Scale(확대/축소) 계열

```dart
double _scale = 1.0;
double _previousScale = 1.0;

GestureDetector(
  onScaleStart: (details) {
    _previousScale = _scale;
  },
  onScaleUpdate: (details) {
    setState(() {
      _scale = (_previousScale * details.scale).clamp(0.5, 4.0);
    });
  },
  child: Transform.scale(
    scale: _scale,
    child: Image.asset('assets/photo.jpg'),
  ),
)
```

> ⚠️ **함정 주의:** `onPanUpdate`와 `onScaleUpdate`를 같은 `GestureDetector`에 동시에 등록하면 충돌이 발생한다. 확대/축소가 필요하면 `onScaleUpdate`만 사용한다. `details.scale == 1.0`일 때는 단순 드래그로 처리하면 된다.

---

### 3.4 드래그 가능한 위젯 구현 패턴

```dart
class DraggableCard extends StatefulWidget {
  const DraggableCard({super.key});
  @override
  State<DraggableCard> createState() => _DraggableCardState();
}

class _DraggableCardState extends State<DraggableCard> {
  double _top = 100;
  double _left = 100;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: _top,
          left: _left,
          child: GestureDetector(
            onPanUpdate: (details) {
              setState(() {
                _top += details.delta.dy;
                _left += details.delta.dx;
              });
            },
            child: Container(
              width: 120,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.purple,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [BoxShadow(blurRadius: 8, color: Colors.black26)],
              ),
              alignment: Alignment.center,
              child: const Text('드래그 가능', style: TextStyle(color: Colors.white)),
            ),
          ),
        ),
      ],
    );
  }
}
```

---

### 3.5 FocusNode: 포커스와 키보드 제어

#### FocusNode의 역할

```
FocusNode
  ─────────────────────────────────────────────────
  • 특정 위젯이 현재 포커스를 가지고 있는지 표시
  • 프로그래밍 방식으로 포커스 이동 및 키보드 제어
  • 포커스 변경 이벤트 구독 가능
  • dispose() 필수 (리소스 누수 방지)
```

```dart
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    // 포커스 변경 이벤트 구독
    _emailFocus.addListener(() {
      if (!_emailFocus.hasFocus) {
        print('이메일 입력 완료');
      }
    });
  }

  @override
  void dispose() {
    // ✅ 반드시 해제
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          focusNode: _emailFocus,
          decoration: const InputDecoration(labelText: '이메일'),
          textInputAction: TextInputAction.next,   // 키보드의 다음 버튼
          onSubmitted: (_) {
            // 다음 필드로 포커스 이동
            FocusScope.of(context).requestFocus(_passwordFocus);
          },
        ),
        TextField(
          focusNode: _passwordFocus,
          decoration: const InputDecoration(labelText: '비밀번호'),
          obscureText: true,
          textInputAction: TextInputAction.done,   // 키보드의 완료 버튼
          onSubmitted: (_) {
            // 키보드 닫기
            _passwordFocus.unfocus();
          },
        ),
        ElevatedButton(
          onPressed: () {
            // 버튼 탭 시 키보드 닫기
            FocusScope.of(context).unfocus();
          },
          child: const Text('로그인'),
        ),
      ],
    );
  }
}
```

#### 자동 포커스와 키보드 제어

```dart
// autofocus: 화면 진입 시 자동으로 포커스 → 키보드 즉시 열림
TextField(
  autofocus: true,
  decoration: const InputDecoration(labelText: '검색'),
)

// 프로그래밍 방식으로 포커스 요청
ElevatedButton(
  onPressed: () => FocusScope.of(context).requestFocus(_emailFocus),
  child: const Text('이메일 필드 포커스'),
)

// 키보드 숨기기 (화면 바깥 탭 시 닫는 패턴)
GestureDetector(
  onTap: () => FocusScope.of(context).unfocus(),
  child: Scaffold(
    body: ...,
  ),
)
```

---

### 3.6 Accessibility: 시맨틱 태그

접근성(Accessibility)은 시각 장애 사용자가 스크린 리더로 앱을 사용할 수 있게 하는 기능이다. Flutter는 대부분의 Material 위젯에 자동으로 시맨틱 정보를 추가하지만, 커스텀 위젯은 직접 `Semantics` 위젯으로 의미를 명시해야 한다.

```dart
// 기본 위젯: 자동으로 시맨틱 정보 제공
ElevatedButton(
  onPressed: () {},
  child: const Text('저장'),
  // 스크린 리더: "저장, 버튼" 자동 읽음
)

// 커스텀 위젯: Semantics로 명시
Semantics(
  label: '프로필 사진',           // 스크린 리더가 읽을 레이블
  hint: '탭하면 사진을 변경합니다', // 추가 안내
  button: true,                   // 버튼으로 처리
  child: GestureDetector(
    onTap: _changePhoto,
    child: CircleAvatar(
      backgroundImage: NetworkImage(_photoUrl),
    ),
  ),
)

// 이미지에 설명 추가
Semantics(
  label: '상품 이미지: 빨간 운동화',
  child: Image.network(imageUrl),
)

// 장식용 위젯은 접근성 트리에서 제외
ExcludeSemantics(
  child: Icon(Icons.star),  // 별점 숫자 Text와 중복되므로 제외
)

// 별점 위젯 접근성 처리 예시
Semantics(
  label: '평점 4.5점 (128개 리뷰)',
  child: Row(
    children: [
      ExcludeSemantics(  // 아이콘들은 제외
        child: Row(
          children: List.generate(5, (i) => Icon(
            i < 4 ? Icons.star : Icons.star_half,
            color: Colors.amber, size: 16,
          )),
        ),
      ),
      const SizedBox(width: 4),
      const Text('4.5 (128)'),  // 텍스트는 포함
    ],
  ),
)
```

**주요 Semantics 프로퍼티:**

| 프로퍼티   | 설명                                        |
| ---------- | ------------------------------------------- |
| `label`    | 위젯을 설명하는 텍스트 (스크린 리더가 읽음) |
| `hint`     | 사용 방법 안내 텍스트                       |
| `value`    | 현재 값 (슬라이더 위치, 진행률 등)          |
| `button`   | 버튼으로 인식하게 함                        |
| `enabled`  | 활성화 여부                                 |
| `checked`  | 체크박스·스위치 상태                        |
| `selected` | 선택 상태 (탭, 라디오 버튼)                 |
| `onTap`    | 접근성 도구가 탭할 때 실행할 콜백           |

---

## 4. 사례 연구

### 4.1 이미지 뷰어: 핀치 줌 + 드래그

```dart
class ImageViewer extends StatefulWidget {
  final String imageUrl;
  const ImageViewer({super.key, required this.imageUrl});
  @override
  State<ImageViewer> createState() => _ImageViewerState();
}

class _ImageViewerState extends State<ImageViewer> {
  double _scale = 1.0;
  double _prevScale = 1.0;
  Offset _offset = Offset.zero;
  Offset _prevOffset = Offset.zero;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onScaleStart: (details) {
        _prevScale = _scale;
        _prevOffset = _offset;
      },
      onScaleUpdate: (details) {
        setState(() {
          // 확대/축소 (0.5x ~ 4x 제한)
          _scale = (_prevScale * details.scale).clamp(0.5, 4.0);
          // 드래그 이동 (scale == 1이면 이동, 아니면 핀치 중심 이동)
          if (details.pointerCount == 1) {
            _offset = _prevOffset + details.focalPointDelta;
          }
        });
      },
      onDoubleTap: () {
        setState(() {
          // 더블탭으로 원래 크기로 복귀
          _scale = _scale > 1.0 ? 1.0 : 2.0;
          _offset = Offset.zero;
        });
      },
      child: Transform(
        transform: Matrix4.identity()
          ..translate(_offset.dx, _offset.dy)
          ..scale(_scale),
        alignment: Alignment.center,
        child: Image.network(widget.imageUrl, fit: BoxFit.contain),
      ),
    );
  }
}
```

---

### 4.2 스와이프로 삭제: Dismissible 위젯

Flutter 내장 `Dismissible`은 GestureDetector 기반으로 스와이프 삭제 인터랙션을 제공한다.

```dart
ListView.builder(
  itemCount: _items.length,
  itemBuilder: (context, index) {
    final item = _items[index];
    return Dismissible(
      key: ValueKey(item.id),             // 고유 Key 필수
      direction: DismissDirection.endToStart,  // 왼쪽으로 스와이프
      background: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        setState(() => _items.removeAt(index));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${item.name} 삭제됨')),
        );
      },
      confirmDismiss: (direction) async {
        // 삭제 전 확인 다이얼로그
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('삭제 확인'),
            content: Text('${item.name}을 삭제하시겠습니까?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('취소')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('삭제')),
            ],
          ),
        );
      },
      child: ListTile(title: Text(item.name)),
    );
  },
)
```

---

### 4.3 키보드 대응 화면 레이아웃

모바일에서 키보드가 올라오면 입력 필드가 가려지는 문제를 해결하는 패턴이다.

```dart
Scaffold(
  // resizeToAvoidBottomInset: true (기본값)
  // → 키보드가 올라오면 body 높이를 자동으로 줄임
  resizeToAvoidBottomInset: true,
  body: SingleChildScrollView(  // 스크롤로 입력 필드 접근 가능
    padding: EdgeInsets.only(
      bottom: MediaQuery.of(context).viewInsets.bottom,  // 키보드 높이만큼 패딩
    ),
    child: Column(
      children: [
        // 콘텐츠
        const SizedBox(height: 200),
        TextField(decoration: const InputDecoration(labelText: '이름')),
        TextField(decoration: const InputDecoration(labelText: '이메일')),
        TextField(decoration: const InputDecoration(labelText: '메시지')),
      ],
    ),
  ),
)
```

---

## 5. 실습

### 5.1 드래그 가능한 색상 팔레트

아래 코드를 DartPad에서 실행하며 `onPanUpdate`의 `delta` 값을 직접 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: DragDemo()));

class DragDemo extends StatefulWidget {
  const DragDemo({super.key});
  @override
  State<DragDemo> createState() => _DragDemoState();
}

class _DragDemoState extends State<DragDemo> {
  double _top = 200;
  double _left = 100;
  double _hue = 0;       // 색상 Hue 값 (드래그로 변경)
  String _log = '드래그해보세요';

  @override
  Widget build(BuildContext context) {
    final color = HSVColor.fromAHSV(1, _hue % 360, 0.8, 0.8).toColor();

    return Scaffold(
      appBar: AppBar(title: const Text('Gesture 실습')),
      body: Stack(
        children: [
          // 배경 탭: 로그 초기화
          GestureDetector(
            onTap: () => setState(() => _log = '배경 탭!'),
            behavior: HitTestBehavior.opaque,
            child: Container(color: Colors.grey[100]),
          ),
          // 드래그 가능한 원
          Positioned(
            top: _top - 40,
            left: _left - 40,
            child: GestureDetector(
              onPanUpdate: (d) => setState(() {
                _top += d.delta.dy;
                _left += d.delta.dx;
                _hue += d.delta.dx;   // 가로 드래그 → 색상 변화
                _log = 'dx: ${d.delta.dx.toStringAsFixed(1)}, '
                       'dy: ${d.delta.dy.toStringAsFixed(1)}';
              }),
              onDoubleTap: () => setState(() {
                _top = 200; _left = 100; _hue = 0;
              }),
              child: Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  boxShadow: const [BoxShadow(blurRadius: 12, color: Colors.black26)],
                ),
                alignment: Alignment.center,
                child: const Text('드래그\n더블탭=리셋',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 11)),
              ),
            ),
          ),
          // 로그 패널
          Positioned(
            bottom: 32, left: 16, right: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(_log, style: const TextStyle(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- `delta.dx`·`delta.dy`가 매 프레임 어떤 값으로 오는가?
- 배경 탭 시 로그가 바뀌는가? (HitTestBehavior.opaque 효과)
- 더블탭으로 원이 초기 위치로 돌아오는가?

---

### 5.2 FocusNode 실습

아래 코드에서 이메일→비밀번호 포커스 이동과 키보드 닫기를 직접 확인하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: Scaffold(body: FocusDemo())));

class FocusDemo extends StatefulWidget {
  const FocusDemo({super.key});
  @override
  State<FocusDemo> createState() => _FocusDemoState();
}

class _FocusDemoState extends State<FocusDemo> {
  final _emailFocus    = FocusNode();
  final _passwordFocus = FocusNode();
  String _log = '';

  @override
  void initState() {
    super.initState();
    _emailFocus.addListener(() => setState(() =>
        _log = '이메일 포커스: ${_emailFocus.hasFocus}'));
    _passwordFocus.addListener(() => setState(() =>
        _log = '비밀번호 포커스: ${_passwordFocus.hasFocus}'));
  }

  @override
  void dispose() {
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),  // 배경 탭 → 키보드 닫기
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              focusNode: _emailFocus,
              autofocus: true,
              decoration: const InputDecoration(labelText: '이메일', border: OutlineInputBorder()),
              textInputAction: TextInputAction.next,
              onSubmitted: (_) => FocusScope.of(context).requestFocus(_passwordFocus),
            ),
            const SizedBox(height: 16),
            TextField(
              focusNode: _passwordFocus,
              obscureText: true,
              decoration: const InputDecoration(labelText: '비밀번호', border: OutlineInputBorder()),
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _passwordFocus.unfocus(),
            ),
            const SizedBox(height: 24),
            Text(_log, style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** GestureDetector와 InkWell의 핵심 차이는?

- A) GestureDetector는 iOS에서만 동작한다
- B) InkWell은 pan·scale 제스처를 처리할 수 있다
- C) **GestureDetector는 시각 효과가 없고 InkWell은 Material Ripple 효과를 제공한다** ✅
- D) GestureDetector는 StatefulWidget 안에서만 사용 가능하다

---

**Q2. [Understand]** Container 배경색이 있는 위젯에 InkWell Ripple이 보이지 않을 때의 해결책은?

> **모범 답안:** `Container(color: ...)`는 Ripple 효과를 가린다. 배경색이 있을 때는 `Container` 대신 `Ink(decoration: BoxDecoration(color: ...))`를 사용하고, 그 위에 `InkWell`을 올려야 Ripple이 배경 위에 표시된다.

---

**Q3. [Understand]** `onPanUpdate`와 `onScaleUpdate`를 동시에 등록하면 안 되는 이유는?

> **모범 답안:** 두 콜백은 모두 Gesture Arena에서 pan/scale recognizer를 등록한다. 동시에 등록하면 두 recognizer가 경쟁해 충돌이 발생하고 예측 불가능하게 동작한다. 드래그와 확대/축소를 모두 처리해야 한다면 `onScaleUpdate`만 사용하고, `details.scale == 1.0`이면 드래그, 아니면 핀치 줌으로 분기한다.

---

**Q4. [Apply]** `FocusNode`를 사용하는 State에서 반드시 해야 하는 것은?

- A) `initState()`에서 `FocusNode.reset()` 호출
- B) `build()`에서 `FocusScope.of(context)` 호출
- C) **`dispose()`에서 `FocusNode.dispose()` 호출** ✅
- D) `didUpdateWidget()`에서 포커스 요청

---

**Q5. [Understand]** 아래 코드에서 접근성 문제가 있는 이유와 수정 방법을 설명하라.

```dart
GestureDetector(
  onTap: _deleteItem,
  child: Icon(Icons.delete, color: Colors.red),
)
```

> **모범 답안:** 커스텀 GestureDetector는 스크린 리더에게 어떤 역할을 하는지 의미를 전달하지 못한다. 시각 장애 사용자는 이 위젯이 "삭제 버튼"임을 알 수 없다. `Semantics`로 감싸 `label`·`hint`·`button` 속성을 명시해야 한다.
>
> ```dart
> Semantics(
>   label: '항목 삭제',
>   hint: '탭하면 이 항목이 삭제됩니다',
>   button: true,
>   child: GestureDetector(
>     onTap: _deleteItem,
>     child: const Icon(Icons.delete, color: Colors.red),
>   ),
> )
> ```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **GestureDetector**는 시각 효과 없이 모든 제스처를 처리, **InkWell**은 Material Ripple 효과를 포함한다.
- 배경색 위에 InkWell Ripple을 표시하려면 `Container` 대신 **`Ink`** 를 사용한다.
- **Gesture Arena**에서 여러 recognizer가 경쟁하며, `behavior: HitTestBehavior.opaque`로 이벤트 흡수 방식을 제어한다.
- `onPanUpdate`와 `onScaleUpdate`는 동시에 등록하지 않는다. **`onScaleUpdate`** 하나로 드래그와 핀치 줌을 모두 처리한다.
- **FocusNode**는 키보드 포커스를 프로그래밍 방식으로 제어하며, 반드시 `dispose()`에서 해제해야 한다.
- **Semantics** 위젯으로 커스텀 위젯에 스크린 리더용 의미 정보를 명시한다. 장식용 요소는 `ExcludeSemantics`로 제외한다.

### 6.2 다음 Step 예고

- **Step 10 — Form 시스템:** TextField·Form·GlobalKey를 활용한 유효성 검사(Validation)와 RegExp 패턴 검증으로 완성도 높은 입력 폼을 구현한다.

### 6.3 참고 자료

| 자료                      | 링크                                                                               | 설명                |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------- |
| GestureDetector 공식 문서 | <https://api.flutter.dev/flutter/widgets/GestureDetector-class.html>               | 전체 제스처 API     |
| Flutter 제스처 공식 문서  | <https://docs.flutter.dev/ui/interactivity/gestures>                               | 제스처 개요         |
| Accessibility 공식 가이드 | <https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility> | 접근성 구현 가이드  |
| Semantics API             | <https://api.flutter.dev/flutter/widgets/Semantics-class.html>                     | Semantics 전체 속성 |
| Focus 시스템 공식 문서    | <https://docs.flutter.dev/ui/advanced/focus>                                       | 포커스 심층 가이드  |

### 6.4 FAQ

**Q. `onTap`과 `onTapDown`의 차이는 언제 중요한가?**

> `onTapDown`은 손가락이 닿는 순간 즉시 호출되므로 반응 속도가 가장 빠르다. 프리뷰 표시나 시각 피드백을 최대한 빨리 주고 싶을 때 사용한다. `onTap`은 손가락이 떼어졌을 때 호출되므로 실제 액션(페이지 이동, 데이터 변경 등)에 적합하다.

**Q. 화면 전체 터치 이벤트를 배경에서 감지하려면?**

> `GestureDetector`에 `behavior: HitTestBehavior.opaque`를 설정하고 빈 `Container`나 `SizedBox.expand()`를 자식으로 둔다. 기본값인 `deferToChild`는 자식이 없는 투명 영역의 이벤트를 무시한다.

**Q. 키보드가 올라올 때 특정 위젯을 키보드 바로 위에 고정하려면?**

> `MediaQuery.of(context).viewInsets.bottom`으로 현재 키보드 높이를 가져와 `Padding` 또는 `AnimatedPadding`으로 적용한다. 또는 `Scaffold`의 `resizeToAvoidBottomInset: true` (기본값)을 유지하고 `SingleChildScrollView`로 감싸면 자동으로 스크롤 가능해진다.

---

## 빠른 자가진단 체크리스트

- [ ] GestureDetector와 InkWell의 차이를 한 문장으로 설명할 수 있는가?
- [ ] Gesture Arena가 무엇인지 설명할 수 있는가?
- [ ] `onPanUpdate`의 `delta.dx`·`delta.dy`가 무엇을 의미하는지 설명할 수 있는가?
- [ ] FocusNode를 dispose()에서 해제해야 하는 이유를 설명할 수 있는가?
- [ ] Semantics 위젯이 필요한 상황을 2가지 이상 말할 수 있는가?
- [ ] 키보드가 올라올 때 입력 필드가 가려지는 문제의 해결책을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Container 배경 위에서 InkWell Ripple이 보이지 않는 이유와 해결책(Ink 위젯)을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: onPanUpdate와 onScaleUpdate를 동시에 등록하면 안 되는 이유를 설명할 수 있는가?
