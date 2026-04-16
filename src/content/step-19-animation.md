# Step 19 — 애니메이션

> **파트:** 5.5️⃣ 애니메이션 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Flutter 애니메이션의 핵심 구성 요소(AnimationController·Animation·Tween·Curve)의 역할과 관계를 설명할 수 있다.
2. **[Understand]** 명시적 애니메이션과 암시적 애니메이션의 차이와 각각의 적합한 사용 시나리오를 설명할 수 있다.
3. **[Understand]** Hero 애니메이션이 화면 전환 시 공유 요소를 이동시키는 원리를 설명할 수 있다.
4. **[Apply]** AnimationController + AnimatedBuilder로 커스텀 애니메이션을 구현할 수 있다.
5. **[Apply]** AnimatedContainer·AnimatedOpacity 등 ImplicitlyAnimatedWidget으로 상태 변화 애니메이션을 구현할 수 있다.
6. **[Apply]** Tween과 Curve를 조합해 원하는 움직임 곡선을 만들 수 있다.

**전제 지식:** Step 05(StatefulWidget·Lifecycle·dispose), Step 04(Widget Tree), Step 11(Hero 기초)

---

## 1. 서론

### 1.1 애니메이션이 UX에서 하는 역할

애니메이션은 단순한 시각 효과가 아니다. 사용자에게 **공간적 맥락**을 제공하고, **인과관계**를 직관적으로 전달한다.

![애니메이션의 UX 역할](/developer-open-book/diagrams/flutter-step19-animation-ux-roles.svg)

### 1.2 Flutter 애니메이션 두 가지 방식

![명시적 vs 암시적 애니메이션](/developer-open-book/diagrams/flutter-step19-explicit-vs-implicit.svg)

### 1.3 전체 개념 지도

![애니메이션 시스템 hierarchy](/developer-open-book/diagrams/step19-animation-system.svg)

---

## 2. 기본 개념과 용어

| 용어                         | 정의                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| **AnimationController**      | 애니메이션의 시간 흐름을 제어하는 객체. 0.0~1.0 범위의 값을 시간에 따라 생성. `vsync` 필요               |
| **TickerProvider (vsync)**   | 화면 갱신 신호(vsync)를 AnimationController에 제공하는 인터페이스. `SingleTickerProviderStateMixin` 사용 |
| **Tween\<T\>**               | 애니메이션 값의 시작(begin)과 끝(end) 범위를 정의. `animate(controller)`로 Animation 생성                |
| **CurvedAnimation**          | AnimationController의 선형 진행을 Curve로 변환하는 래퍼                                                  |
| **Curve**                    | 0.0→1.0 진행에 비선형 가속·감속을 적용하는 함수. `Curves.easeIn`, `Curves.bounceOut` 등                  |
| **Animation\<T\>**           | 현재 애니메이션 값을 제공하는 추상 클래스. `addListener()`로 값 변경 구독 가능                           |
| **AnimatedBuilder**          | `animation`이 변경될 때마다 `builder`를 재호출해 UI를 갱신하는 위젯                                      |
| **AnimatedWidget**           | `animation`을 받아 자동으로 rebuild하는 위젯 베이스 클래스                                               |
| **ImplicitlyAnimatedWidget** | 속성 변경 시 자동으로 애니메이션을 실행하는 위젯 계열 (AnimatedContainer 등)                             |
| **AnimatedContainer**        | 크기·색상·패딩·정렬 등의 변경을 자동으로 애니메이션 처리하는 위젯                                        |
| **AnimatedOpacity**          | opacity 속성 변경을 자동으로 애니메이션 처리하는 위젯                                                    |
| **TweenAnimationBuilder**    | 커스텀 값에 대해 암시적 애니메이션을 만드는 위젯                                                         |
| **Hero**                     | 두 화면에 동일 `tag`의 Hero 위젯을 배치하면 전환 시 공유 요소 애니메이션이 자동 실행                     |
| **forward()**                | AnimationController를 0.0 → 1.0 방향으로 실행                                                            |
| **reverse()**                | AnimationController를 1.0 → 0.0 방향으로 실행                                                            |
| **repeat()**                 | AnimationController를 반복 실행                                                                          |

---

## 3. 이론적 배경과 원리 ★

### 3.1 AnimationController: 시간의 흐름을 제어

`AnimationController`는 지정한 `duration` 동안 **0.0에서 1.0**으로 선형 증가하는 값을 생성한다. 이 값을 Tween으로 원하는 범위로 변환하고, Curve로 가속·감속을 적용한다.

![AnimationController 동작](/developer-open-book/diagrams/step19-animation-controller.svg)

```dart
class _AnimationDemoState extends State<AnimationDemo>
    with SingleTickerProviderStateMixin {   // vsync 제공 Mixin

  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,                          // 화면 갱신 신호 제공
      duration: const Duration(milliseconds: 600),
    );
  }

  @override
  void dispose() {
    _controller.dispose();                 // ✅ 반드시 해제
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 컨트롤러 값 표시
        AnimatedBuilder(
          animation: _controller,
          builder: (_, __) => Text(
            _controller.value.toStringAsFixed(2),
            style: const TextStyle(fontSize: 48),
          ),
        ),
        Row(
          children: [
            ElevatedButton(onPressed: _controller.forward, child: const Text('→ 실행')),
            ElevatedButton(onPressed: _controller.reverse, child: const Text('← 역방향')),
            ElevatedButton(onPressed: () => _controller.repeat(reverse: true),
                child: const Text('↔ 반복')),
            ElevatedButton(onPressed: _controller.stop, child: const Text('■ 정지')),
          ],
        ),
      ],
    );
  }
}
```

---

### 3.2 Tween: 값 범위 변환

`AnimationController`는 항상 0.0~1.0 범위의 값을 생성한다. `Tween`은 이 값을 원하는 범위로 변환한다.

```dart
// Tween으로 값 범위 변환
final sizeTween    = Tween<double>(begin: 50, end: 200);   // 50 → 200
final colorTween   = ColorTween(begin: Colors.blue, end: Colors.red);
final offsetTween  = Tween<Offset>(begin: Offset.zero, end: const Offset(1, 0));
final opacityTween = Tween<double>(begin: 0.0, end: 1.0);

// Animation 생성
late Animation<double> _sizeAnimation;
late Animation<Color?> _colorAnimation;

@override
void initState() {
  super.initState();
  _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1));

  // Tween.animate()로 Animation 생성
  _sizeAnimation  = sizeTween.animate(_controller);
  _colorAnimation = colorTween.animate(_controller);

  // CurvedAnimation으로 Curve 적용
  _sizeAnimation = sizeTween.animate(
    CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
  );
}

// 사용
AnimatedBuilder(
  animation: _controller,
  builder: (_, __) => Container(
    width:  _sizeAnimation.value,
    height: _sizeAnimation.value,
    color:  _colorAnimation.value,
  ),
)
```

---

### 3.3 Curve: 움직임에 개성을 부여

`Curve`는 0.0→1.0 선형 진행을 비선형으로 변환한다. 애니메이션이 "살아있는" 느낌을 주는 핵심 요소다.

![Curves 주요 옵션 시각화](/developer-open-book/diagrams/flutter-step19-curves-options.svg)

```dart
// Curve 적용 방법
final animation = Tween<double>(begin: 0, end: 300).animate(
  CurvedAnimation(
    parent: _controller,
    curve: Curves.bounceOut,      // 도착 후 바운스 효과
    reverseCurve: Curves.easeIn,  // 역방향은 다른 Curve 적용 가능
  ),
);

// 커스텀 Curve 만들기
class SlowMiddleCurve extends Curve {
  @override
  double transform(double t) {
    // t: 0.0 ~ 1.0
    // 가운데 구간을 느리게
    if (t < 0.5) return t * 0.5;
    return 0.25 + (t - 0.5) * 1.5;
  }
}
```

---

### 3.4 AnimatedBuilder: 효율적인 rebuild

`AnimatedBuilder`는 `animation` 값이 바뀔 때마다 `builder`만 재호출한다. `child` 파라미터를 활용하면 정적 자식은 rebuild하지 않는다.

```dart
AnimatedBuilder(
  animation: _controller,
  // child: 정적 위젯 → 한 번만 build됨
  child: const FlutterLogo(size: 50),
  builder: (context, child) {
    return Transform.rotate(
      angle: _controller.value * 2 * 3.14159,  // 0 → 2π 회전
      child: child,   // 정적 child 재사용
    );
  },
)
```

**애니메이션 체이닝 (Interval):**

```dart
// 긴 애니메이션을 구간별로 분리
_controller = AnimationController(vsync: this, duration: const Duration(seconds: 2));

final fadeIn = Tween<double>(begin: 0, end: 1).animate(
  CurvedAnimation(
    parent: _controller,
    curve: const Interval(0.0, 0.4, curve: Curves.easeIn),  // 0~40% 구간
  ),
);

final slideUp = Tween<Offset>(
  begin: const Offset(0, 0.3), end: Offset.zero,
).animate(
  CurvedAnimation(
    parent: _controller,
    curve: const Interval(0.3, 0.7, curve: Curves.easeOut),  // 30~70% 구간
  ),
);

final scaleUp = Tween<double>(begin: 0.8, end: 1.0).animate(
  CurvedAnimation(
    parent: _controller,
    curve: const Interval(0.6, 1.0, curve: Curves.elasticOut),  // 60~100% 구간
  ),
);

// UI 적용
AnimatedBuilder(
  animation: _controller,
  builder: (_, child) {
    return Opacity(
      opacity: fadeIn.value,
      child: SlideTransition(
        position: slideUp,
        child: Transform.scale(
          scale: scaleUp.value,
          child: child,
        ),
      ),
    );
  },
  child: const ProductCard(),
)
```

---

### 3.5 암시적 애니메이션: ImplicitlyAnimatedWidget

암시적 애니메이션은 `AnimationController` 없이도 속성 변경 시 자동으로 트랜지션을 처리한다. `setState()`로 값을 바꾸면 지정한 `duration` 동안 부드럽게 전환된다.

#### AnimatedContainer

```dart
class _PressableCardState extends State<PressableCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp:   (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        // setState로 값이 바뀌면 자동 전환!
        width:  _pressed ? 180.0 : 200.0,
        height: _pressed ? 90.0  : 100.0,
        decoration: BoxDecoration(
          color: _pressed ? Colors.blue.shade700 : Colors.blue,
          borderRadius: BorderRadius.circular(_pressed ? 16 : 8),
          boxShadow: [
            BoxShadow(
              blurRadius: _pressed ? 2 : 8,
              offset: Offset(0, _pressed ? 1 : 4),
              color: Colors.black26,
            ),
          ],
        ),
        child: const Center(
          child: Text('눌러보세요', style: TextStyle(color: Colors.white)),
        ),
      ),
    );
  }
}
```

#### AnimatedOpacity

```dart
AnimatedOpacity(
  opacity: _isVisible ? 1.0 : 0.0,
  duration: const Duration(milliseconds: 300),
  curve: Curves.easeInOut,
  child: const Text('사라지거나 나타나는 텍스트'),
)
```

#### TweenAnimationBuilder: 커스텀 암시적 애니메이션

```dart
// 카운터 숫자 변경 시 scale 애니메이션
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0.8, end: 1.0),
  duration: const Duration(milliseconds: 300),
  curve: Curves.elasticOut,
  builder: (context, scale, child) {
    return Transform.scale(
      scale: scale,
      child: child,
    );
  },
  child: Text('$_count', style: const TextStyle(fontSize: 48)),
)

// 별점 변경 애니메이션
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: _rating),
  duration: const Duration(milliseconds: 500),
  curve: Curves.easeOut,
  builder: (context, value, _) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) => Icon(
        Icons.star,
        color: i < value ? Colors.amber : Colors.grey.shade300,
        size: 24,
      )),
    );
  },
)
```

**주요 ImplicitlyAnimatedWidget 목록:**

| 위젯                       | 애니메이션 속성                      |
| -------------------------- | ------------------------------------ |
| `AnimatedContainer`        | 크기·색상·패딩·정렬·테두리           |
| `AnimatedOpacity`          | opacity                              |
| `AnimatedPadding`          | padding                              |
| `AnimatedPositioned`       | Stack 내 위치(top·left·right·bottom) |
| `AnimatedDefaultTextStyle` | TextStyle                            |
| `AnimatedCrossFade`        | 두 위젯 간 페이드 전환               |
| `AnimatedSwitcher`         | 위젯 교체 시 전환 효과               |
| `TweenAnimationBuilder`    | 커스텀 값                            |

---

### 3.6 AnimatedSwitcher: 위젯 교체 애니메이션

```dart
// 위젯 교체 시 자동으로 전환 효과
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  transitionBuilder: (child, animation) {
    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.3),
          end: Offset.zero,
        ).animate(animation),
        child: child,
      ),
    );
  },
  child: _isLoading
      ? const CircularProgressIndicator(key: ValueKey('loading'))
      : Text('$_count', key: ValueKey(_count)),  // ← Key가 달라야 전환 효과 발동
)
```

> ⚠️ **함정 주의:** `AnimatedSwitcher`는 교체되는 두 위젯의 **Key가 달라야** 전환 효과가 발동한다. 같은 타입의 위젯을 교체할 때는 반드시 다른 `ValueKey`를 부여해야 한다.

---

### 3.7 Hero 애니메이션 심화

Hero는 Step 11에서 기초를 배웠다. 여기서는 커스터마이징과 주의사항을 다룬다.

```dart
// flightShuttleBuilder: 전환 중 표시되는 위젯 커스터마이징
Hero(
  tag: 'product-${product.id}',
  flightShuttleBuilder: (
    flightContext,
    animation,
    flightDirection,
    fromHeroContext,
    toHeroContext,
  ) {
    return AnimatedBuilder(
      animation: animation,
      builder: (_, __) => ClipRRect(
        borderRadius: BorderRadius.circular(
          // 목록(8) → 상세(0)로 모서리가 변하는 효과
          Tween<double>(begin: 8, end: 0)
              .evaluate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
        ),
        child: toHeroContext.widget,
      ),
    );
  },
  child: Image.network(product.imageUrl, fit: BoxFit.cover),
)

// createRectTween: Hero가 이동하는 경로 커스터마이징
Hero(
  tag: 'fab',
  createRectTween: (begin, end) {
    return MaterialRectArcTween(begin: begin, end: end); // 호 모양으로 이동
  },
  child: const FloatingActionButton(onPressed: null, child: Icon(Icons.add)),
)
```

---

## 4. 사례 연구

### 4.1 앱 시작 로딩 애니메이션 (시퀀스)

```dart
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {

  late AnimationController _ctrl;
  late Animation<double>  _fadeIn;
  late Animation<double>  _scaleUp;
  late Animation<double>  _slideUp;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // ① 로고 페이드인 (0~40%)
    _fadeIn = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl,
          curve: const Interval(0.0, 0.4, curve: Curves.easeIn)),
    );

    // ② 로고 확대 (20~60%)
    _scaleUp = Tween<double>(begin: 0.5, end: 1).animate(
      CurvedAnimation(parent: _ctrl,
          curve: const Interval(0.2, 0.6, curve: Curves.elasticOut)),
    );

    // ③ 텍스트 슬라이드업 (50~100%)
    _slideUp = Tween<double>(begin: 30, end: 0).animate(
      CurvedAnimation(parent: _ctrl,
          curve: const Interval(0.5, 1.0, curve: Curves.easeOut)),
    );

    // 애니메이션 시작 → 완료 후 홈 이동
    _ctrl.forward().then((_) async {
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Opacity(
                opacity: _fadeIn.value,
                child: Transform.scale(
                  scale: _scaleUp.value,
                  child: const FlutterLogo(size: 100),
                ),
              ),
              const SizedBox(height: 24),
              Transform.translate(
                offset: Offset(0, _slideUp.value),
                child: Opacity(
                  opacity: _fadeIn.value,
                  child: const Text(
                    'Flutter App',
                    style: TextStyle(
                      fontSize: 28,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### 4.2 좋아요 버튼 애니메이션

```dart
class LikeButton extends StatefulWidget {
  const LikeButton({super.key});
  @override
  State<LikeButton> createState() => _LikeButtonState();
}

class _LikeButtonState extends State<LikeButton>
    with SingleTickerProviderStateMixin {

  late AnimationController _ctrl;
  late Animation<double> _scale;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scale = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.4), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.4, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _toggleLike() {
    setState(() => _isLiked = !_isLiked);
    _ctrl.forward(from: 0);   // 매번 처음부터 실행
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleLike,
      child: AnimatedBuilder(
        animation: _scale,
        builder: (_, __) => Transform.scale(
          scale: _scale.value,
          child: Icon(
            _isLiked ? Icons.favorite : Icons.favorite_border,
            color: _isLiked ? Colors.red : Colors.grey,
            size: 32,
          ),
        ),
      ),
    );
  }
}
```

---

### 4.3 카드 뒤집기 애니메이션 (3D)

```dart
class FlipCard extends StatefulWidget {
  final Widget front;
  final Widget back;
  const FlipCard({super.key, required this.front, required this.back});
  @override
  State<FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<FlipCard>
    with SingleTickerProviderStateMixin {

  late AnimationController _ctrl;
  late Animation<double> _rotation;
  bool _showFront = true;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _rotation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _ctrl.addStatusListener((status) {
      if (status == AnimationStatus.completed ||
          status == AnimationStatus.dismissed) {
        setState(() => _showFront = !_showFront);
      }
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _flip() {
    if (_ctrl.isAnimating) return;
    _ctrl.isCompleted ? _ctrl.reverse() : _ctrl.forward();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flip,
      child: AnimatedBuilder(
        animation: _rotation,
        builder: (_, __) {
          final angle = _rotation.value * 3.14159;
          final isUnder = angle > 3.14159 / 2;
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)   // 원근감
              ..rotateY(angle),
            child: isUnder
                ? Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.rotationY(3.14159),
                    child: widget.back,
                  )
                : widget.front,
          );
        },
      ),
    );
  }
}
```

---

## 5. 실습

### 5.1 명시적 + 암시적 애니메이션 쇼케이스

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: AnimationShowcase()));

class AnimationShowcase extends StatefulWidget {
  const AnimationShowcase({super.key});
  @override
  State<AnimationShowcase> createState() => _AnimationShowcaseState();
}

class _AnimationShowcaseState extends State<AnimationShowcase>
    with SingleTickerProviderStateMixin {

  late AnimationController _ctrl;
  late Animation<double>   _rotation;
  late Animation<double>   _scale;

  bool  _expanded    = false;
  bool  _visible     = true;
  Color _color       = Colors.blue;
  int   _switchValue = 0;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _rotation = Tween<double>(begin: 0, end: 2 * 3.14159).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _scale = Tween<double>(begin: 1, end: 1.5).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('애니메이션 쇼케이스')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 명시적 애니메이션 ───────────────────────
            const Text('명시적 애니메이션 (AnimationController)',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Center(
              child: AnimatedBuilder(
                animation: _ctrl,
                builder: (_, child) => Transform.rotate(
                  angle: _rotation.value,
                  child: Transform.scale(scale: _scale.value, child: child),
                ),
                child: Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    color: Colors.purple,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.star, color: Colors.white, size: 40),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FilledButton(onPressed: () => _ctrl.forward(from: 0),
                    child: const Text('실행')),
                const SizedBox(width: 8),
                OutlinedButton(onPressed: () => _ctrl.repeat(reverse: true),
                    child: const Text('반복')),
                const SizedBox(width: 8),
                OutlinedButton(onPressed: _ctrl.stop, child: const Text('정지')),
              ],
            ),

            const Divider(height: 40),

            // ── 암시적 애니메이션 ───────────────────────
            const Text('암시적 애니메이션 (AnimatedContainer)',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Center(
              child: GestureDetector(
                onTap: () => setState(() {
                  _expanded = !_expanded;
                  _color = _expanded ? Colors.orange : Colors.blue;
                }),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOut,
                  width:  _expanded ? 200 : 100,
                  height: _expanded ? 200 : 100,
                  decoration: BoxDecoration(
                    color: _color,
                    borderRadius: BorderRadius.circular(_expanded ? 32 : 8),
                  ),
                  child: const Icon(Icons.touch_app, color: Colors.white, size: 32),
                ),
              ),
            ),

            const Divider(height: 40),

            // ── AnimatedOpacity ──────────────────────────
            const Text('AnimatedOpacity',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            AnimatedOpacity(
              opacity: _visible ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 500),
              child: Container(
                height: 60,
                color: Colors.green.shade200,
                alignment: Alignment.center,
                child: const Text('나타났다 사라지는 위젯'),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: ElevatedButton(
                onPressed: () => setState(() => _visible = !_visible),
                child: Text(_visible ? '숨기기' : '보이기'),
              ),
            ),

            const Divider(height: 40),

            // ── AnimatedSwitcher ─────────────────────────
            const Text('AnimatedSwitcher',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Center(
              child: Column(
                children: [
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: Text(
                      ['🎉 첫 번째', '🚀 두 번째', '✨ 세 번째'][_switchValue],
                      key: ValueKey(_switchValue),
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => setState(
                          () => _switchValue = (_switchValue + 1) % 3),
                    child: const Text('다음'),
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

**확인 포인트:**

- "실행" 버튼: 회전 + 확대 애니메이션이 실행되는가?
- 보라색 카드 탭: `AnimatedContainer`가 부드럽게 크기·색상·모서리를 변경하는가?
- "숨기기": `AnimatedOpacity`로 부드럽게 사라지는가?
- "다음": `AnimatedSwitcher`가 텍스트 교체 시 전환 효과를 보이는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** `AnimationController`에 `vsync`가 필요한 이유는?

- A) 애니메이션 값의 범위를 설정하기 위해
- B) 여러 AnimationController를 동기화하기 위해
- C) **화면 갱신(vsync) 신호에 맞춰 애니메이션 프레임을 생성해 불필요한 연산을 방지하기 위해** ✅
- D) 애니메이션 방향을 결정하기 위해

---

**Q2. [Understand]** 명시적 애니메이션과 암시적 애니메이션 중 `AnimatedContainer`가 속하는 방식은?

- A) 명시적 애니메이션
- B) **암시적 애니메이션** ✅
- C) 둘 다 해당
- D) 어느 쪽도 아님

---

**Q3. [Understand]** `AnimatedSwitcher`에서 교체되는 두 위젯에 서로 다른 `Key`를 부여해야 하는 이유는?

> **모범 답안:** `AnimatedSwitcher`는 자식 위젯의 Key를 비교해 위젯이 교체되었는지 판단한다. 같은 타입의 위젯을 교체할 때 Key가 동일하면 Flutter는 "같은 위젯이 업데이트됐다"고 판단해 전환 효과 없이 값만 바꿔버린다. Key를 다르게 주면 "다른 위젯으로 교체됐다"고 판단해 전환 애니메이션이 실행된다.

---

**Q4. [Apply]** 0.5초 동안 왼쪽(-200px)에서 중앙(0px)으로 이동하는 `SlideTransition`을 구현하는 코드를 작성하라.

```dart
// 모범 답안
late AnimationController _ctrl;
late Animation<Offset> _slide;

@override
void initState() {
  super.initState();
  _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  );
  _slide = Tween<Offset>(
    begin: const Offset(-1.0, 0),  // -1.0 = 위젯 너비만큼 왼쪽
    end: Offset.zero,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  _ctrl.forward();
}

// build()
SlideTransition(
  position: _slide,
  child: const Text('슬라이드 인!'),
)
```

---

**Q5. [Analyze]** 다음 중 암시적 애니메이션(ImplicitlyAnimatedWidget)보다 명시적 애니메이션(AnimationController)을 선택해야 하는 상황은?

- A) 버튼 탭 시 색상이 변하는 경우
- B) 카드의 크기가 선택 여부에 따라 바뀌는 경우
- C) **앱 시작 시 로고가 페이드인 → 확대 → 텍스트 슬라이드업의 3단계 순서로 실행되는 경우** ✅
- D) 텍스트의 투명도가 토글되는 경우

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **AnimationController**는 `duration` 동안 0.0→1.0 값을 생성한다. `vsync`에 `SingleTickerProviderStateMixin`을 제공하고, `dispose()`에서 반드시 해제한다.
- **Tween**은 컨트롤러 값을 원하는 범위로 변환하고, **Curve**로 가속·감속을 적용한다.
- **AnimatedBuilder**의 `child` 파라미터로 정적 부분의 rebuild를 막아 성능을 최적화한다.
- **Interval**로 하나의 컨트롤러에서 여러 애니메이션을 시간 구간별로 순서대로 실행한다.
- **암시적 애니메이션**(AnimatedContainer·AnimatedOpacity 등)은 `setState()`만으로 부드러운 전환을 구현한다.
- **AnimatedSwitcher**는 위젯 교체 시 전환 효과를 제공하며, 반드시 교체 위젯에 다른 **Key**를 부여해야 한다.
- **Hero**의 `flightShuttleBuilder`로 전환 중 위젯 모양을 세밀하게 제어할 수 있다.

### 6.2 다음 Step 예고

- **Step 20 — Flutter 아키텍처 패턴:** Clean Architecture·MVVM·Repository 패턴으로 대규모 Flutter 앱의 코드 구조를 체계화하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                          | 링크                                                                       | 설명                   |
| ----------------------------- | -------------------------------------------------------------------------- | ---------------------- |
| Flutter 애니메이션 공식 문서  | <https://docs.flutter.dev/ui/animations>                                   | 애니메이션 개요        |
| Implicit Animations Codelab   | <https://docs.flutter.dev/codelabs/implicit-animations>                    | 암시적 애니메이션 실습 |
| AnimationController API       | <https://api.flutter.dev/flutter/animation/AnimationController-class.html> | API 레퍼런스           |
| Curves 갤러리                 | <https://api.flutter.dev/flutter/animation/Curves-class.html>              | 모든 Curve 목록        |
| Flutter — Animations Tutorial | <https://docs.flutter.dev/ui/animations/tutorial>                          | 공식 단계별 튜토리얼   |

### 6.4 FAQ

**Q. `AnimationController`를 여러 개 사용해야 할 때는?**

> `SingleTickerProviderStateMixin` 대신 `MultiTickerProviderStateMixin`을 사용한다. 이름 그대로 여러 `Ticker`를 제공할 수 있어 복수의 `AnimationController`를 동시에 운영할 수 있다.

**Q. 성능 관점에서 명시적 vs 암시적 애니메이션 중 어느 것이 더 효율적인가?**

> 기본적으로 동일하다. 둘 다 Flutter의 렌더링 파이프라인을 통해 GPU에서 처리된다. 단, `AnimatedBuilder`에서 `child` 파라미터를 활용하지 않으면 매 프레임 정적 위젯까지 rebuild해 불필요한 비용이 발생한다. 복잡한 서브트리가 있다면 `child`를 반드시 활용한다.

**Q. 60fps를 유지하려면 애니메이션에서 무엇을 피해야 하는가?**

> ① `setState()`를 애니메이션 루프에 사용하지 않는다. `AnimatedBuilder`를 사용한다. ② `build()`에서 무거운 계산을 하지 않는다. ③ `Opacity` 위젯을 과도하게 사용하면 레이어 병합 비용이 발생한다. `FadeTransition`이 더 효율적이다. ④ `RepaintBoundary`로 자주 변하는 애니메이션 부분을 분리한다.

---

## 빠른 자가진단 체크리스트

- [ ] AnimationController의 역할과 vsync가 필요한 이유를 설명할 수 있는가?
- [ ] Tween과 Curve의 차이를 설명할 수 있는가?
- [ ] AnimatedBuilder의 `child` 파라미터가 성능 최적화에 어떻게 도움이 되는지 설명할 수 있는가?
- [ ] Interval로 애니메이션 시퀀스를 만드는 방법을 설명할 수 있는가?
- [ ] AnimatedContainer로 버튼 눌림 효과를 구현할 수 있는가?
- [ ] AnimatedSwitcher에서 Key가 필요한 이유를 설명할 수 있는가?
- [ ] Hero의 `flightShuttleBuilder`가 하는 역할을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: AnimationController를 dispose()에서 해제하지 않으면 메모리 누수가 발생한다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: AnimatedSwitcher에서 같은 타입 위젯 교체 시 Key 없으면 전환 효과가 없다는 것을 이해했는가?
