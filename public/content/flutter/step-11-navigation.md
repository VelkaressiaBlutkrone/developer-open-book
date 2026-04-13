# Step 11 — Navigation 시스템

> **파트:** 3️⃣ 사용자 인터랙션 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Navigator의 스택(Stack) 기반 화면 관리 원리를 설명할 수 있다.
2. **[Understand]** 명령형(Imperative) 방식과 선언형(Declarative) 방식 내비게이션의 차이를 설명할 수 있다.
3. **[Understand]** Named Route와 Anonymous Route의 차이와 각각의 장단점을 설명할 수 있다.
4. **[Apply]** Navigator.push·pop·pushReplacement·pushNamedAndRemoveUntil로 다양한 화면 이동을 구현할 수 있다.
5. **[Apply]** 화면 간 데이터를 전달하고 결과값을 반환하는 패턴을 구현할 수 있다.
6. **[Apply]** Hero 애니메이션으로 두 화면 간 공유 요소 전환 효과를 구현할 수 있다.

**전제 지식:** Step 01~10 완료, StatefulWidget(Step 05), BuildContext·Element(Step 04)

---

## 1. 서론

### 1.1 내비게이션이란

모바일 앱은 단일 화면이 아니라 **여러 화면(Screen/Page)의 집합**이다. 사용자가 버튼을 탭하면 다음 화면으로 이동하고, 뒤로가기를 누르면 이전 화면으로 돌아온다. 이 흐름을 관리하는 것이 **내비게이션(Navigation)**이다.

```
앱 화면 흐름 예시 (쇼핑 앱)
──────────────────────────────────────────────────────
  홈 화면
    ↓ 상품 탭
  상품 상세 화면
    ↓ 구매하기 탭
  결제 화면
    ↓ 결제 완료
  완료 화면 (홈으로 돌아가기 → 스택 전부 제거)

  + 어느 화면에서나 뒤로가기 → 이전 화면으로 복귀
──────────────────────────────────────────────────────
```

### 1.2 Flutter의 두 가지 내비게이션 방식

| 방식                    | 설명                                | 대표 API                     |
| ----------------------- | ----------------------------------- | ---------------------------- |
| **명령형(Imperative)**  | 코드에서 직접 "이동해라"를 명령     | `Navigator 1.0` (push·pop)   |
| **선언형(Declarative)** | 현재 상태에 따라 라우트 목록을 선언 | `Navigator 2.0`, `go_router` |

이 문서는 Flutter 입문에서 가장 많이 사용하는 **Navigator 1.0(명령형)** 방식을 완전히 다루고, 선언형 방식(go_router)의 개념을 소개한다.

### 1.3 전체 개념 지도

![Navigation 시스템 hierarchy](/developer-open-book/diagrams/step11-navigation-system.svg)

---

## 2. 기본 개념과 용어

| 용어                   | 정의                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Navigator**          | Flutter의 화면 스택을 관리하는 위젯. push·pop으로 화면을 추가·제거                                |
| **Route**              | 화면 하나를 나타내는 추상 개념. `MaterialPageRoute`가 가장 일반적                                 |
| **Stack**              | 마지막에 추가된 것이 먼저 제거되는 자료구조(LIFO). Navigator가 이 방식으로 화면 관리              |
| **push**               | 스택 최상단에 새 Route(화면)를 추가 → 새 화면으로 이동                                            |
| **pop**                | 스택 최상단의 Route 제거 → 이전 화면으로 복귀                                                     |
| **pushReplacement**    | 현재 Route를 제거하고 새 Route 추가. 뒤로가기 시 이전-이전 화면으로 이동                          |
| **pushAndRemoveUntil** | 조건에 맞을 때까지 스택을 모두 제거한 후 새 Route 추가                                            |
| **Named Route**        | 문자열 이름(`'/home'`, `'/detail'`)으로 화면을 등록하고 이동하는 방식                             |
| **MaterialPageRoute**  | 플랫폼별 기본 전환 애니메이션을 적용한 Route (Android: 슬라이드업, iOS: 슬라이드)                 |
| **PageRouteBuilder**   | 전환 애니메이션을 커스터마이징할 수 있는 Route                                                    |
| **arguments**          | Named Route로 이동 시 데이터를 전달하는 방법. `ModalRoute.of(context)!.settings.arguments`로 수신 |
| **Hero**               | 두 화면에 같은 `tag`를 가진 Hero 위젯을 배치하면 전환 시 공유 요소 애니메이션이 자동 실행됨       |
| **WillPopScope**       | 뒤로가기 동작을 가로채 커스텀 처리하는 위젯 (deprecated → PopScope 사용)                          |
| **PopScope**           | 뒤로가기 동작을 제어하는 위젯 (WillPopScope의 M3 대체)                                            |
| **go_router**          | Flutter 팀이 권장하는 선언형 내비게이션 패키지. URL 기반, 딥링크 지원                             |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Navigator 스택의 동작 원리

Navigator는 Route를 **스택(Stack)** 자료구조로 관리한다.

![push/pop/replace stack operations](/developer-open-book/diagrams/step11-stack-operations.svg)

이 스택 구조 덕분에 Android의 뒤로가기 버튼, iOS의 스와이프 제스처가 자동으로 `pop()`을 호출하여 이전 화면으로 돌아간다.

---

### 3.2 기본 화면 이동: push와 pop

```dart
// ── 화면 A에서 B로 이동 ──────────────────────────────
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const DetailScreen(id: 42),
      ),
    );
  },
  child: const Text('상세 화면으로'),
)

// ── 화면 B에서 A로 복귀 ──────────────────────────────
ElevatedButton(
  onPressed: () => Navigator.pop(context),
  child: const Text('뒤로가기'),
)

// ── 데이터와 함께 복귀 ──────────────────────────────
// B 화면에서 결과값을 담아 pop
Navigator.pop(context, '선택된 값');

// A 화면에서 B의 결과값 수신
final result = await Navigator.push<String>(
  context,
  MaterialPageRoute(builder: (_) => const SelectionScreen()),
);
if (result != null) print('선택: $result');
```

---

### 3.3 pushReplacement vs pushAndRemoveUntil

```dart
// pushReplacement: 로그인 → 홈 (뒤로가기 시 로그인으로 못 돌아감)
Navigator.pushReplacement(
  context,
  MaterialPageRoute(builder: (_) => const HomeScreen()),
);

// pushNamedAndRemoveUntil: 결제 완료 → 홈 (스택 전부 정리)
Navigator.pushNamedAndRemoveUntil(
  context,
  '/home',
  (route) => false,   // false = 모든 이전 Route 제거
);

// 특정 Route까지만 제거
Navigator.pushNamedAndRemoveUntil(
  context,
  '/cart',
  ModalRoute.withName('/home'),  // '/home'에 도달하면 멈춤
);
```

**각 메서드 스택 변화 시각화:**

```
push:                  [A] → [A, B]
pop:                   [A, B] → [A]
pushReplacement:       [A, B] → [A, C]   (B가 C로 교체)
pushAndRemoveUntil(/C, false): [A, B] → [C]
```

---

### 3.4 Named Route

Named Route는 화면마다 고유한 문자열 이름을 부여하고, 이름으로 이동하는 방식이다.

**등록:**

```dart
MaterialApp(
  initialRoute: '/',
  routes: {
    '/':        (context) => const HomeScreen(),
    '/detail':  (context) => const DetailScreen(),
    '/cart':    (context) => const CartScreen(),
    '/profile': (context) => const ProfileScreen(),
  },
)
```

**이동:**

```dart
// 이름으로 이동
Navigator.pushNamed(context, '/detail');

// 데이터 전달 (arguments)
Navigator.pushNamed(
  context,
  '/detail',
  arguments: {'id': 42, 'title': '플러터 입문'},
);

// 수신 (DetailScreen 내부)
@override
Widget build(BuildContext context) {
  final args = ModalRoute.of(context)!.settings.arguments
      as Map<String, dynamic>;
  final id    = args['id'] as int;
  final title = args['title'] as String;
  return Scaffold(appBar: AppBar(title: Text(title)), ...);
}
```

**Named Route의 장단점:**

| 항목        | Anonymous Route              | Named Route                  |
| ----------- | ---------------------------- | ---------------------------- |
| 데이터 전달 | 생성자 직접 전달 (타입 안전) | arguments (캐스팅 필요)      |
| 코드 위치   | 이동 코드에 화면 import 필요 | routes에 등록 후 이름만 사용 |
| 딥링크 지원 | 어려움                       | 일부 가능                    |
| 동적 라우트 | 자유롭게 가능                | 제한적                       |
| 권장 상황   | 소규모 앱                    | 중규모 이상 앱               |

> ⚠️ **함정 주의:** Named Route의 `arguments`는 `Object?` 타입이므로 사용 시 반드시 캐스팅(`as`)이 필요하다. 타입이 맞지 않으면 런타임 오류가 발생한다. 타입 안전성이 필요한 복잡한 앱은 `go_router` 사용을 권장한다.

---

### 3.5 화면 전환 애니메이션: PageRouteBuilder

```dart
// 페이드 전환
Navigator.push(
  context,
  PageRouteBuilder(
    pageBuilder: (context, animation, secondaryAnimation) =>
        const DetailScreen(),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      // animation: 0.0(시작) → 1.0(완료)
      return FadeTransition(opacity: animation, child: child);
    },
    transitionDuration: const Duration(milliseconds: 400),
  ),
);

// 슬라이드 전환 (아래에서 위로)
transitionsBuilder: (context, animation, secondaryAnimation, child) {
  final tween = Tween(begin: const Offset(0, 1), end: Offset.zero)
      .chain(CurveTween(curve: Curves.easeOutCubic));
  return SlideTransition(
    position: animation.drive(tween),
    child: child,
  );
},

// 슬라이드 + 페이드 조합
transitionsBuilder: (context, animation, secondaryAnimation, child) {
  return SlideTransition(
    position: Tween(begin: const Offset(1, 0), end: Offset.zero)
        .animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
    child: FadeTransition(opacity: animation, child: child),
  );
},
```

---

### 3.6 Hero 애니메이션

Hero 애니메이션은 **두 화면에 동일한 `tag`를 가진 `Hero` 위젯**을 배치하면, 화면 전환 시 해당 위젯이 출발 위치에서 도착 위치로 **자연스럽게 이동하는 공유 요소 전환 효과**다.

![Hero animation 화면 A→B transition](/developer-open-book/diagrams/step11-hero-animation.svg)

```dart
// 화면 A: 목록에서 Hero 적용
GestureDetector(
  onTap: () => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
  ),
  child: Hero(
    tag: 'product-image-${product.id}',  // 고유 태그
    child: Image.network(
      product.imageUrl,
      width: 80, height: 80,
      fit: BoxFit.cover,
    ),
  ),
)

// 화면 B: 상세에서 동일 태그 Hero 적용
Hero(
  tag: 'product-image-${product.id}',  // 동일 태그 필수
  child: Image.network(
    product.imageUrl,
    width: double.infinity,
    height: 300,
    fit: BoxFit.cover,
  ),
)
```

**Hero 애니메이션 동작 원리:**

```
Navigator.push() 호출
      ↓
Flutter가 동일 tag의 Hero 위젯을 두 화면에서 탐색
      ↓
전환 중: Hero 위젯이 오버레이 레이어로 올라옴
      ↓
화면 A의 위치·크기 → 화면 B의 위치·크기로 보간(interpolation)
      ↓
전환 완료: Hero가 화면 B에 안착
```

> ⚠️ **함정 주의:** Hero의 `tag`는 현재 Navigator 스택 내에서 **유일**해야 한다. 목록 화면에서 여러 아이템에 같은 tag를 쓰면 오류가 발생한다. 아이템 ID 등을 포함해 `'product-${product.id}'`처럼 고유하게 만들어야 한다.

---

### 3.7 뒤로가기 처리: PopScope

변경사항이 있을 때 뒤로가기를 누르면 확인 다이얼로그를 띄우는 패턴이다.

```dart
PopScope(
  canPop: false,   // 기본 pop 동작 막기
  onPopInvoked: (didPop) async {
    if (didPop) return;
    final shouldPop = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('나가시겠습니까?'),
        content: const Text('저장하지 않은 내용이 사라집니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('나가기'),
          ),
        ],
      ),
    );
    if (shouldPop == true && context.mounted) {
      Navigator.pop(context);
    }
  },
  child: Scaffold(...),
)
```

---

### 3.8 go_router 소개 (선언형 내비게이션)

`go_router`는 Flutter 팀이 공식 권장하는 선언형 내비게이션 패키지다. URL 기반 라우팅, 딥링크, 타입 안전한 파라미터를 지원한다.

```dart
// pubspec.yaml
// go_router: ^13.0.0

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProductDetailScreen(id: id);
      },
    ),
  ],
);

// 이동
context.go('/product/42');          // 스택 교체
context.push('/product/42');        // 스택에 추가
context.pop();                      // 뒤로가기
```

**Navigator 1.0 vs go_router 선택 기준:**

| 상황               | Navigator 1.0 | go_router |
| ------------------ | ------------- | --------- |
| 소규모 앱, 학습    | ✅ 단순       | -         |
| 딥링크 필요        | 어려움        | ✅        |
| 웹 URL 지원        | 어려움        | ✅        |
| 타입 안전 파라미터 | 직접 캐스팅   | ✅        |
| 중·대규모 앱       | 복잡해짐      | ✅ 권장   |

---

## 4. 사례 연구

### 4.1 쇼핑 앱의 내비게이션 스택 설계

```
앱 흐름 설계
──────────────────────────────────────────────────────
  [스플래시] → pushReplacement([로그인]) → pushReplacement([홈])
       ↓ 로그인 유지 시
  pushReplacement([홈])

  [홈] → push([상품 상세])
       → push([장바구니])
       → push([결제])
       → pushAndRemoveUntil([결제 완료], false)  ← 스택 정리

  [뒤로가기]:
  [결제] → pop → [장바구니] → pop → [상품 상세] → pop → [홈]
  (결제 완료 후에는 뒤로가기 없음 → pushAndRemoveUntil 덕분)
──────────────────────────────────────────────────────
```

### 4.2 사진 선택 화면: pop으로 결과 반환

갤러리에서 사진을 선택하고 이전 화면에 결과를 전달하는 패턴이다.

```dart
// 화면 A: 사진 선택 화면 열기
Future<void> _pickPhoto() async {
  final selectedUrl = await Navigator.push<String>(
    context,
    MaterialPageRoute(builder: (_) => const PhotoPickerScreen()),
  );
  if (selectedUrl != null) {
    setState(() => _photoUrl = selectedUrl);
  }
}

// 화면 B: PhotoPickerScreen - 선택 후 결과 반환
ListView.builder(
  itemBuilder: (context, index) {
    return GestureDetector(
      onTap: () => Navigator.pop(context, photos[index].url),  // 결과 반환
      child: Image.network(photos[index].url),
    );
  },
)
```

### 4.3 Hero로 상품 목록 → 상세 전환

```dart
// 목록 카드
class ProductCard extends StatelessWidget {
  final Product product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ProductDetailScreen(product: product),
        ),
      ),
      child: Card(
        child: Column(
          children: [
            Hero(
              tag: 'product-${product.id}',
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                child: Image.network(product.imageUrl,
                    height: 120, width: double.infinity, fit: BoxFit.cover),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(product.name),
            ),
          ],
        ),
      ),
    );
  }
}

// 상세 화면
class ProductDetailScreen extends StatelessWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            flexibleSpace: FlexibleSpaceBar(
              background: Hero(                        // 동일 태그
                tag: 'product-${product.id}',
                child: Image.network(product.imageUrl, fit: BoxFit.cover),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 8),
                  Text('₩${product.price}',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 5. 실습

### 5.1 Named Route + Hero 전환 구현

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  initialRoute: '/',
  routes: {
    '/':       (ctx) => const HomeScreen(),
    '/detail': (ctx) => const DetailScreen(),
  },
));

// 상품 모델
class Product {
  final int id;
  final String name;
  final String imageUrl;
  final int price;
  const Product({required this.id, required this.name,
      required this.imageUrl, required this.price});
}

final _products = [
  const Product(id: 1, name: '스니커즈 A', imageUrl: 'https://picsum.photos/seed/1/300/200', price: 89000),
  const Product(id: 2, name: '백팩 B',   imageUrl: 'https://picsum.photos/seed/2/300/200', price: 129000),
  const Product(id: 3, name: '모자 C',   imageUrl: 'https://picsum.photos/seed/3/300/200', price: 39000),
];

// 홈 화면
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('상품 목록')),
      body: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, childAspectRatio: 0.75, crossAxisSpacing: 12, mainAxisSpacing: 12,
        ),
        itemCount: _products.length,
        itemBuilder: (context, index) {
          final p = _products[index];
          return GestureDetector(
            onTap: () => Navigator.pushNamed(context, '/detail', arguments: p),
            child: Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Hero(
                      tag: 'product-img-${p.id}',
                      child: Image.network(p.imageUrl, width: double.infinity, fit: BoxFit.cover),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text('₩${p.price}', style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// 상세 화면
class DetailScreen extends StatelessWidget {
  const DetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final product = ModalRoute.of(context)!.settings.arguments as Product;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(product.name),
              background: Hero(
                tag: 'product-img-${product.id}',
                child: Image.network(product.imageUrl, fit: BoxFit.cover),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('₩${product.price}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);   // 뒤로가기
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${product.name} 장바구니에 추가!')),
                        );
                      },
                      child: const Text('장바구니 담기'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- 카드 탭 시 Hero 이미지가 부드럽게 확대되며 상세 화면으로 이동하는가?
- 뒤로가기 시 Hero 이미지가 원래 크기·위치로 돌아오는가?
- `ModalRoute.of(context)!.settings.arguments`로 Product를 올바르게 수신하는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** `pushReplacement`와 `push`의 차이는?

- A) pushReplacement는 더 빠르게 화면을 전환한다
- B) **pushReplacement는 현재 화면을 스택에서 제거하고 새 화면으로 교체한다** ✅
- C) pushReplacement는 Named Route에서만 사용 가능하다
- D) pushReplacement는 데이터 전달이 불가능하다

---

**Q2. [Understand]** 결제 완료 후 홈 화면으로 이동하면서 중간 모든 화면을 스택에서 제거하려면?

```dart
// 모범 답안
Navigator.pushAndRemoveUntil(
  context,
  MaterialPageRoute(builder: (_) => const HomeScreen()),
  (route) => false,   // false = 모든 Route 제거
);
// 또는 Named Route
Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
```

---

**Q3. [Understand]** Hero 위젯에서 `tag`가 중복되면 어떤 문제가 발생하는가?

> **모범 답안:** Navigator 스택 내에서 동일한 `tag`를 가진 Hero 위젯이 둘 이상 존재하면 Flutter가 어떤 위젯을 전환 대상으로 삼아야 할지 결정할 수 없어 오류가 발생한다. 특히 목록 화면에서 여러 아이템이 같은 tag를 사용하면 안 되며, 아이템마다 고유한 값(ID 등)을 포함해 `'product-${product.id}'`처럼 태그를 만들어야 한다.

---

**Q4. [Apply]** Named Route로 `'/profile'`로 이동하면서 `{'userId': 99}`를 전달하는 코드를 작성하라.

```dart
// 모범 답안 - 이동
Navigator.pushNamed(
  context,
  '/profile',
  arguments: {'userId': 99},
);

// 수신 (ProfileScreen.build 내)
final args = ModalRoute.of(context)!.settings.arguments
    as Map<String, dynamic>;
final userId = args['userId'] as int;
```

---

**Q5. [Analyze]** Navigator 1.0 대신 go_router를 선택해야 하는 상황 2가지를 설명하라.

> **모범 답안:** ① **딥링크 지원이 필요할 때** — 외부 앱이나 알림에서 특정 화면을 직접 여는 딥링크는 URL 기반 라우팅을 필요로 한다. go_router는 경로 패턴(`/product/:id`)으로 딥링크를 쉽게 처리한다. ② **웹(Flutter Web) 지원이 필요할 때** — 웹에서는 브라우저의 URL이 중요하다. Navigator 1.0은 웹 URL을 제대로 반영하지 못하지만 go_router는 브라우저 주소창 URL을 올바르게 동기화한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Navigator**는 Route를 스택으로 관리한다. `push`로 추가, `pop`으로 제거.
- **pushReplacement**는 현재 화면을 교체(로그인→홈), **pushAndRemoveUntil**은 스택 전체 정리(결제완료→홈).
- **Named Route**는 문자열 이름으로 이동하며 `arguments`로 데이터를 전달한다. 수신 시 반드시 캐스팅.
- **pop으로 결과 반환**: `Navigator.pop(context, value)` → `await Navigator.push<T>()`로 수신.
- **Hero 애니메이션**: 두 화면에 동일 `tag`의 Hero 위젯을 배치하면 공유 요소 전환 효과가 자동 적용. `tag`는 반드시 고유해야 한다.
- **대규모 앱·딥링크·웹**: `go_router` 사용을 권장한다.

### 6.2 다음 Step 예고

- **Step 12 — 상태 관리 기초(setState·InheritedWidget):** Flutter 상태 관리의 근본을 이해하고, 상위 위젯에서 하위 위젯으로 상태를 전달하는 패턴을 학습한다.

### 6.3 참고 자료

| 자료                         | 링크                                                           | 설명                   |
| ---------------------------- | -------------------------------------------------------------- | ---------------------- |
| Navigator 공식 문서          | <https://api.flutter.dev/flutter/widgets/Navigator-class.html> | Navigator API 전체     |
| Flutter Cookbook — 화면 이동 | <https://docs.flutter.dev/cookbook/navigation>                 | 공식 내비게이션 가이드 |
| Hero 공식 문서               | <https://api.flutter.dev/flutter/widgets/Hero-class.html>      | Hero API               |
| go_router 공식 문서          | <https://pub.dev/packages/go_router>                           | go_router 패키지       |
| Flutter 내비게이션 공식 문서 | <https://docs.flutter.dev/ui/navigation>                       | 내비게이션 개요        |

### 6.4 FAQ

**Q. `Navigator.of(context)`와 `Navigator.push(context, ...)`의 차이는?**

> 동일한 동작이다. `Navigator.push(context, ...)`는 내부적으로 `Navigator.of(context).push(...)`를 호출하는 정적 메서드 단축 형태다. 가독성을 위해 주로 `Navigator.push(context, ...)`를 사용한다.

**Q. 다이얼로그도 Navigator를 사용하는가?**

> 그렇다. `showDialog()`·`showBottomSheet()` 등도 내부적으로 Navigator에 Route를 push한다. 따라서 `Navigator.pop(context)`로 다이얼로그를 닫을 수 있고, 결과값도 `pop(context, value)`로 반환할 수 있다.

**Q. Hero 전환 중 양쪽 화면에서 위젯의 모양이 다르면 어떻게 되는가?**

> Flutter가 두 Hero 위젯의 크기·모양·위치를 보간(interpolation)해 부드럽게 전환한다. 예를 들어 출발지는 둥근 모서리(borderRadius: 8), 도착지는 직사각형이라면 전환 중에 모서리가 점차 변한다. `Hero`의 `flightShuttleBuilder`로 전환 중 표시되는 위젯을 직접 커스터마이징할 수도 있다.

---

## 빠른 자가진단 체크리스트

- [ ] Navigator 스택 개념을 push·pop 시나리오로 설명할 수 있는가?
- [ ] push·pushReplacement·pushAndRemoveUntil의 차이를 스택 변화로 설명할 수 있는가?
- [ ] Named Route로 데이터를 전달하고 수신하는 코드를 작성할 수 있는가?
- [ ] pop으로 이전 화면에 결과값을 반환하는 패턴을 구현할 수 있는가?
- [ ] Hero 애니메이션에서 tag가 고유해야 하는 이유를 설명할 수 있는가?
- [ ] go_router가 필요한 상황 2가지를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Named Route arguments 캐스팅 실패 시 런타임 오류가 발생함을 이해했는가?
- [ ] ⚠️ 함정 체크: 목록의 여러 Hero에 동일 tag를 사용하면 오류가 발생함을 이해했는가?
