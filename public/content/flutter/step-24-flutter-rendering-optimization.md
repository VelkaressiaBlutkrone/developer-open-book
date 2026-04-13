# Step 24 — Flutter 렌더링 최적화

> **파트:** 8️⃣ 성능 최적화 | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Analyzing → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Flutter 렌더링 파이프라인에서 성능 병목이 발생하는 지점을 설명할 수 있다.
2. **[Understand]** const 위젯·위젯 분리·RepaintBoundary가 각각 어떤 원리로 성능을 개선하는지 설명할 수 있다.
3. **[Understand]** Flutter DevTools의 Performance Overlay·Widget Inspector·Timeline으로 병목을 진단하는 방법을 설명할 수 있다.
4. **[Apply]** const 위젯·위젯 분리·RepaintBoundary를 코드에 적용해 불필요한 rebuild·repaint를 제거할 수 있다.
5. **[Apply]** ListView.builder·Sliver 위젯으로 대량 목록의 렌더링 성능을 최적화할 수 있다.
6. **[Evaluate]** DevTools 데이터를 분석해 병목 원인을 진단하고 적절한 최적화 기법을 선택할 수 있다.

**전제 지식:** Step 04(Three Trees·rebuild 원리), Step 13(setState·rebuild 최소화), Step 06(Layout 시스템)

---

## 1. 서론

### 1.1 성능이 UX에 미치는 영향

```
렌더링 성능과 사용자 경험
──────────────────────────────────────────────────────
  60fps 유지 → 프레임당 16.6ms 예산
  120fps 유지 → 프레임당 8.3ms 예산 (ProMotion)

  프레임 드롭(Jank) 발생 시:
    16ms → 33ms: 30fps → 버벅임 느낌
    33ms → 66ms: 15fps → 명백한 끊김
    66ms+ → 체감 멈춤

  Google 연구: 렌더링 지연 100ms당 전환율 1% 감소
──────────────────────────────────────────────────────
```

### 1.2 성능 최적화의 원칙

```
최적화 순서 (중요도 순)
──────────────────────────────────────────────────────
  1. 측정 먼저   → DevTools로 실제 병목 확인
                  (추측으로 최적화하지 않는다)
  2. 큰 것부터   → 작은 최적화보다 구조적 개선이 효과적
  3. 검증 필수   → 최적화 전후 수치 비교
  4. Profile 모드 → Release 모드와 유사한 환경에서 측정
                  (Debug 모드는 JIT·디버그 오버헤드로 느림)
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

![렌더링 최적화 전략 hierarchy](/developer-open-book/diagrams/step24-optimization-strategy.svg)

---

## 2. 기본 개념과 용어

| 용어                          | 정의                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Jank**                      | 프레임 예산(16.6ms)을 초과해 발생하는 화면 버벅임 현상                                 |
| **Frame Budget**              | 목표 FPS에 맞춰 한 프레임이 처리되어야 하는 최대 시간 (60fps=16.6ms)                   |
| **UI Thread**                 | Flutter의 Dart 코드와 위젯 build가 실행되는 스레드                                     |
| **Raster Thread**             | GPU로 픽셀을 전송하는 스레드. Skia/Impeller가 동작                                     |
| **Performance Overlay**       | 화면 상단에 UI·Raster 스레드의 프레임 시간을 막대 그래프로 표시                        |
| **rebuild count**             | DevTools Widget Inspector에서 각 위젯이 build()를 호출한 횟수                          |
| **RepaintBoundary**           | 자식 위젯의 repaint를 부모와 독립된 레이어로 분리하는 위젯                             |
| **Layer**                     | RenderObject의 그리기 결과를 캐싱하는 단위. RepaintBoundary가 새 Layer를 생성          |
| **ListView.builder**          | 화면에 보이는 항목만 동적으로 생성하는 지연 렌더링 ListView                            |
| **Sliver**                    | CustomScrollView 안에서 사용하는 스크롤 가능한 위젯 계열. 세밀한 스크롤 제어           |
| **cacheExtent**               | ListView가 화면 밖 미리 렌더링할 범위(픽셀). 스크롤 시 부드러움 vs 메모리 트레이드오프 |
| **isolate**                   | Flutter의 별도 실행 스레드. CPU 집약적 작업을 UI 스레드에서 분리                       |
| **Profile 모드**              | 릴리즈와 유사한 성능, DevTools 연결 가능. 성능 측정 전용 (`flutter run --profile`)     |
| **debugProfileBuildsEnabled** | true 설정 시 모든 build() 호출을 Timeline에 기록                                       |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Flutter 렌더링 파이프라인과 병목 위치

```
렌더링 파이프라인과 병목 가능 위치
──────────────────────────────────────────────────────
① Build Phase      [UI Thread]   ← 과도한 rebuild
  Widget.build() 호출
  새 Widget Tree 생성

② Layout Phase     [UI Thread]   ← 복잡한 중첩 레이아웃
  RenderObject 크기·위치 계산
  Constraints 전파

③ Paint Phase      [UI Thread]   ← 복잡한 커스텀 페인팅
  Canvas 그리기 명령 생성
  Layer 트리 구성

④ Composite Phase  [UI Thread]
  Layer 트리 → Raster Thread 전달

⑤ Rasterize Phase  [Raster Thread] ← Shader 컴파일(Skia)
  GPU에서 픽셀 생성
  화면 전송
──────────────────────────────────────────────────────

Performance Overlay 해석:
  상단 막대 = UI Thread (빨간색 = 예산 초과)
  하단 막대 = Raster Thread (빨간색 = 예산 초과)
  기준선 = 16ms (60fps 기준)
```

---

### 3.2 const 위젯: rebuild를 구조적으로 차단

Step 13에서 다뤘지만, 성능 최적화 관점에서 실전 패턴을 정리한다.

```dart
// ❌ 모든 자식이 매 rebuild마다 새 인스턴스
class ProductPage extends StatefulWidget { ... }
class _ProductPageState extends State<ProductPage> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ProductImageCarousel(images: widget.images),  // 매번 rebuild!
        ProductDescription(text: widget.description), // 매번 rebuild!
        ProductReviews(reviews: widget.reviews),       // 매번 rebuild!
        IconButton(                                    // 이것만 바뀌는데
          icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
          onPressed: () => setState(() => _isFavorite = !_isFavorite),
        ),
      ],
    );
  }
}

// ✅ const + 위젯 분리 적용
class ProductPage extends StatelessWidget {      // ← StatelessWidget으로 변경
  const ProductPage({super.key, required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ProductImageCarousel(images: product.images), // props가 변하지 않으면 const 적용
        ProductDescription(text: product.description),
        ProductReviews(reviews: product.reviews),
        const FavoriteButton(),                       // ← 분리된 StatefulWidget
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
  Widget build(BuildContext context) => IconButton(
    icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
    onPressed: () => setState(() => _isFavorite = !_isFavorite),
  );
}
```

**lint 규칙으로 자동 권장:**

```yaml
# analysis_options.yaml
linter:
  rules:
    prefer_const_constructors: true # const 사용 권장
    prefer_const_widgets: true # const Widget 권장
    prefer_const_literals_to_create_immutables: true
```

---

### 3.3 RepaintBoundary: Repaint 격리

`RepaintBoundary`는 자식 위젯의 repaint를 **별도 레이어**에서 처리한다. 자식이 변경되어도 부모가 repaint되지 않고, 부모가 repaint되어도 자식이 영향받지 않는다.

```
RepaintBoundary 없음
──────────────────────────────────────────────────────
  부모 위젯 변경
    → 부모 + 모든 자식 repaint
    → 배경 이미지·정적 위젯까지 매번 repaint → 비용 큼

RepaintBoundary 있음
──────────────────────────────────────────────────────
  부모 위젯 변경
    → 부모 repaint (RepaintBoundary 경계에서 중단)
    → 자식은 캐시된 레이어 재사용 → 비용 없음
```

```dart
// 사용 시나리오 1: 자주 변하는 애니메이션 위젯 분리
Stack(
  children: [
    // 정적 배경 → RepaintBoundary로 캐싱
    RepaintBoundary(
      child: BackgroundImage(),  // 변하지 않는 배경
    ),
    // 자주 변하는 애니메이션 → 별도 레이어
    AnimatedScoreWidget(score: _score),
    // 정적 UI 오버레이 → RepaintBoundary로 캐싱
    RepaintBoundary(
      child: const HUDOverlay(),
    ),
  ],
)

// 사용 시나리오 2: 무거운 CustomPainter
RepaintBoundary(
  child: CustomPaint(
    painter: ComplexChartPainter(data: _data),
    size: const Size(300, 200),
  ),
)

// 사용 시나리오 3: 빠르게 변하는 위젯
RepaintBoundary(
  child: AnimatedBuilder(
    animation: _controller,
    builder: (_, __) => Transform.rotate(
      angle: _controller.value * 2 * pi,
      child: const FlutterLogo(size: 60),
    ),
  ),
)
```

> ⚠️ **함정 주의:** `RepaintBoundary`는 새 GPU 레이어를 생성하므로 메모리 비용이 발생한다. 모든 위젯에 적용하면 오히려 성능이 나빠진다. **자주 repaint되는 위젯**에만 선택적으로 적용한다. DevTools의 "Highlight Repaints" 기능으로 실제로 자주 repaint되는 위젯을 먼저 확인한 뒤 적용한다.

---

### 3.4 목록 최적화: ListView.builder와 Sliver

#### ListView.builder: 지연 렌더링

```dart
// ❌ 성능 문제: 모든 항목을 즉시 생성
ListView(
  children: products.map((p) => ProductCard(product: p)).toList(),
  // 1000개 상품 → 1000개 위젯 즉시 생성 → 초기 로딩 느림, 메모리 과다
)

// ✅ 성능 개선: 화면에 보이는 항목만 생성
ListView.builder(
  itemCount: products.length,
  itemExtent: 120,  // 항목 높이 고정 시 레이아웃 계산 최적화
  itemBuilder: (context, index) {
    // 화면에 보이는 항목만 호출됨 (기본값: 화면 + 위아래 250px)
    return ProductCard(key: ValueKey(products[index].id),
                       product: products[index]);
  },
)
```

**itemExtent의 성능 효과:**

```
itemExtent 없음:
  각 항목의 높이를 측정해야 함 → 매 스크롤마다 레이아웃 계산

itemExtent 있음:
  모든 항목이 같은 높이 → 인덱스로 바로 위치 계산 (O(1))
  스크롤 성능 크게 향상
```

#### Sliver: 세밀한 스크롤 제어

```dart
CustomScrollView(
  slivers: [
    // 확장/축소 AppBar
    SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: const Text('상품 목록'),
        background: Image.network(bannerUrl, fit: BoxFit.cover),
      ),
    ),

    // 카테고리 고정 헤더
    SliverPersistentHeader(
      pinned: true,
      delegate: _CategoryHeaderDelegate(),
    ),

    // 그리드 목록 (지연 렌더링)
    SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) => ProductCard(product: products[index]),
        childCount: products.length,
      ),
    ),

    // 하단 패딩
    const SliverToBoxAdapter(
      child: SizedBox(height: 80),
    ),
  ],
)
```

---

### 3.5 이미지 최적화

```dart
// ❌ 큰 이미지를 작은 공간에 로드
Image.network(
  'https://example.com/large_4k_image.jpg',  // 4K 이미지
  width: 100, height: 100,
  // → 4K 이미지 전체 메모리 로드 후 100×100으로 축소
)

// ✅ cacheWidth/cacheHeight로 디코딩 크기 지정
Image.network(
  'https://example.com/large_4k_image.jpg',
  width: 100, height: 100,
  cacheWidth: 200,   // 디바이스 픽셀 밀도 고려 2x
  cacheHeight: 200,
  // → 200×200으로 디코딩 후 캐싱 → 메모리 절약
)

// ✅ 캐시 패키지 활용 (cached_network_image)
CachedNetworkImage(
  imageUrl: product.imageUrl,
  width: 100, height: 100,
  fit: BoxFit.cover,
  placeholder: (_, __) => const ShimmerBox(),
  errorWidget: (_, __, ___) => const Icon(Icons.broken_image),
  memCacheWidth: 200,  // 메모리 캐시 크기
)
```

---

### 3.6 CPU 집약적 작업: compute() 분리

```dart
// ❌ UI 스레드에서 무거운 작업
Future<void> _loadData() async {
  final response = await dio.get('/large-dataset');
  // 수천 건 JSON 파싱 → UI 스레드 블로킹 → Jank 발생
  final products = (response.data as List)
      .map(Product.fromJson).toList();
  setState(() => _products = products);
}

// ✅ compute()로 별도 Isolate에서 처리
Future<void> _loadData() async {
  final response = await dio.get('/large-dataset');
  // 파싱을 별도 Isolate에서 처리 → UI 스레드 자유
  final products = await compute(_parseProducts, response.data as List);
  if (!mounted) return;
  setState(() => _products = products);
}

// 최상위 함수로 정의 (Isolate 전달 가능)
List<Product> _parseProducts(List<dynamic> data) {
  return data.map(Product.fromJson).toList();
}
```

---

### 3.7 Flutter DevTools 활용법

#### Performance Overlay

```dart
// 코드에서 활성화
MaterialApp(
  showPerformanceOverlay: true,
  // ...
)

// 또는 DevTools → Performance → Enable Performance Overlay
```

```
Performance Overlay 읽는 법
──────────────────────────────────────────────────────
  ┌──────────────────────────────────────────────────┐
  │  ████░░░░░░░░░  ← UI Thread (Dart)              │
  │  ██░░░░░░░░░░░  ← Raster Thread (GPU)           │
  │  ──────────────  ← 16ms 기준선                   │
  └──────────────────────────────────────────────────┘

  막대가 기준선 아래 → 60fps 유지 (정상)
  막대가 기준선 위  → Jank 발생

  UI Thread 초과:  Dart 코드 최적화 필요
                   (rebuild 최소화, compute 분리)
  Raster Thread 초과: GPU 작업 최적화 필요
                   (RepaintBoundary, Impeller 전환)
```

#### Widget Inspector: Rebuild 추적

```
DevTools → Widget Inspector → Rebuild Counts
──────────────────────────────────────────────────────
  버튼을 탭할 때마다 rebuild count를 확인

  위젯 이름                    rebuild 수
  ─────────────────────────────────────────
  _ProductPageState             47    ← 과다
  ProductImageCarousel          47    ← 불필요!
  ProductDescription            47    ← 불필요!
  _FavoriteButtonState          47    ← 정상 (이것만 변해야)

  → ProductImageCarousel, ProductDescription은
    const 또는 별도 위젯으로 분리해야 함
──────────────────────────────────────────────────────
```

```dart
// 코드에서 rebuild 로그 활성화
void main() {
  debugProfileBuildsEnabled = true;     // build() 호출 Timeline 기록
  debugPrintRebuildDirtyWidgets = true; // 콘솔에 rebuild 목록 출력
  runApp(const MyApp());
}
```

#### Timeline: 프레임 상세 분석

```
DevTools → Performance → Timeline
──────────────────────────────────────────────────────
  프레임별 상세 이벤트 분석
  어느 build()가 얼마나 걸리는지 확인 가능

  느린 프레임 클릭 → 상세 이벤트 보기
    Build(ProductCard): 12ms  ← 이 위젯이 느린 이유 찾기
    Layout(Column): 2ms
    Paint(ProductImage): 4ms
──────────────────────────────────────────────────────
```

---

### 3.8 최적화 체크리스트

```
코드 리뷰 시 확인할 항목
──────────────────────────────────────────────────────
  Rebuild 최소화
  □ 변하지 않는 위젯에 const 적용?
  □ setState가 너무 큰 범위를 rebuild하지 않는가?
  □ ValueNotifier/ValueListenableBuilder 활용 가능한가?
  □ ListView.builder 대신 ListView 사용하지 않는가?

  Repaint 최소화
  □ 자주 repaint되는 애니메이션에 RepaintBoundary 적용?
  □ 복잡한 CustomPainter에 RepaintBoundary 적용?

  메모리 최적화
  □ 큰 이미지에 cacheWidth/cacheHeight 적용?
  □ dispose()에서 모든 컨트롤러·구독 해제?
  □ 무거운 작업은 compute()로 분리?

  리스트 최적화
  □ 고정 높이 리스트에 itemExtent 적용?
  □ 리스트 항목에 ValueKey 적용?
──────────────────────────────────────────────────────
```

---

## 4. 사례 연구

### 4.1 모바일 게임 앱: RepaintBoundary로 FPS 30→60

```
게임 앱 화면 구조
──────────────────────────────────────────────────────
  Stack(
    배경 이미지 (정적, 변하지 않음)
    적 캐릭터들 (60fps로 움직임)
    플레이어 (60fps로 움직임)
    점수 HUD (점수 변경 시만 업데이트)
    미니맵 (0.5초마다 업데이트)
  )

문제: 적이 움직일 때마다 전체 Stack repaint
  → 배경·HUD·미니맵까지 매 프레임 repaint
  → Raster Thread 과부하 → 30fps

해결: RepaintBoundary로 레이어 분리
──────────────────────────────────────────────────────
  Stack(
    RepaintBoundary(child: BackgroundImage()),  ← 캐시됨
    GameCharactersLayer(),                      ← 60fps repaint
    RepaintBoundary(child: ScoreHUD()),         ← 점수 변경 시만
    RepaintBoundary(child: MiniMap()),          ← 0.5초마다
  )
결과: 배경·HUD·미니맵은 캐시 레이어 재사용
      캐릭터 레이어만 60fps repaint → FPS 30→60
```

---

### 4.2 뉴스 피드: 1000개 항목 리스트 최적화

```dart
// Before: 성능 문제
ListView(
  children: articles.map((a) => ArticleCard(article: a)).toList(),
  // 1000개 ArticleCard 즉시 생성
  // 메모리: ~500MB, 초기 로딩: 3초
)

// After: 최적화 적용
ListView.builder(
  itemCount: articles.length,
  itemExtent: 160,              // 고정 높이 → O(1) 위치 계산
  addRepaintBoundaries: true,   // 자동으로 항목에 RepaintBoundary 적용
  cacheExtent: 500,             // 화면 밖 500px 사전 렌더링
  itemBuilder: (context, i) => ArticleCard(
    key: ValueKey(articles[i].id),
    article: articles[i],
  ),
)
// 메모리: ~15MB (화면에 보이는 5~8개만 유지)
// 초기 로딩: <100ms
```

---

### 4.3 검색 자동완성: 불필요한 rebuild 제거

```dart
// Before: 검색어 입력마다 전체 화면 rebuild
class SearchScreen extends StatefulWidget { ... }
class _SearchScreenState extends State<SearchScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(onChanged: (v) => setState(() => _query = v)),
        // ← setState가 Column 전체를 rebuild
        const SearchHistoryWidget(),  // 변하지 않는데 매번 rebuild!
        const PopularSearches(),      // 변하지 않는데 매번 rebuild!
        SearchResults(query: _query), // 이것만 변해야 함
      ],
    );
  }
}

// After: ValueNotifier + ValueListenableBuilder로 정밀 제어
class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  final _query = ValueNotifier<String>('');

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          onChanged: (v) => _query.value = v,  // setState 없음!
        ),
        const SearchHistoryWidget(),  // rebuild 없음 ✅
        const PopularSearches(),      // rebuild 없음 ✅
        ValueListenableBuilder<String>(
          valueListenable: _query,
          builder: (_, query, __) => SearchResults(query: query),
          // ← SearchResults만 rebuild
        ),
      ],
    );
  }
}
```

---

## 5. 실습

### 5.1 성능 측정 실험: Before/After 비교

```dart
import 'package:flutter/material.dart';

void main() {
  // rebuild 추적 활성화 (Debug 모드에서만)
  // debugPrintRebuildDirtyWidgets = true;
  runApp(const MaterialApp(
    showPerformanceOverlay: true,  // Performance Overlay 활성화
    home: PerformanceDemo(),
  ));
}

// ─── Before: 최적화 없음 ─────────────────────────────────
class PerformanceDemoBefore extends StatefulWidget {
  const PerformanceDemoBefore({super.key});
  @override
  State<PerformanceDemoBefore> createState() => _BeforeState();
}

class _BeforeState extends State<PerformanceDemoBefore> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    // setState마다 아래 모든 위젯 rebuild
    return Column(
      children: [
        HeavyStaticWidget(),           // rebuild!
        AnotherHeavyWidget(),          // rebuild!
        Text('Count: $_count',
            style: const TextStyle(fontSize: 32)),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text('증가'),
        ),
      ],
    );
  }
}

// ─── After: 최적화 적용 ──────────────────────────────────
class PerformanceDemoAfter extends StatelessWidget {
  const PerformanceDemoAfter({super.key});

  final _count = ValueNotifier<int>(0);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const HeavyStaticWidget(),     // rebuild 없음 ✅
        const AnotherHeavyWidget(),    // rebuild 없음 ✅
        ValueListenableBuilder<int>(
          valueListenable: _count,
          builder: (_, count, __) => Text(
            'Count: $count',
            style: const TextStyle(fontSize: 32),
          ),
        ),
        ElevatedButton(
          onPressed: () => _count.value++,  // setState 없음!
          child: const Text('증가'),
        ),
      ],
    );
  }
}

// ─── 무거운 정적 위젯 시뮬레이션 ─────────────────────────
class HeavyStaticWidget extends StatelessWidget {
  const HeavyStaticWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // build 호출 확인용 print
    debugPrint('HeavyStaticWidget.build() 호출됨');
    return Container(
      height: 100,
      color: Colors.blue.shade100,
      alignment: Alignment.center,
      child: const Text('무거운 정적 위젯'),
    );
  }
}

class AnotherHeavyWidget extends StatelessWidget {
  const AnotherHeavyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    debugPrint('AnotherHeavyWidget.build() 호출됨');
    return Container(
      height: 100,
      color: Colors.green.shade100,
      alignment: Alignment.center,
      child: const Text('또 다른 무거운 위젯'),
    );
  }
}

// ─── 전환 스위치 ─────────────────────────────────────────
class PerformanceDemo extends StatefulWidget {
  const PerformanceDemo({super.key});
  @override
  State<PerformanceDemo> createState() => _PerformanceDemoState();
}

class _PerformanceDemoState extends State<PerformanceDemo> {
  bool _optimized = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_optimized ? '최적화 후' : '최적화 전'),
        actions: [
          Switch(
            value: _optimized,
            onChanged: (v) => setState(() => _optimized = v),
          ),
        ],
      ),
      body: _optimized
          ? const PerformanceDemoAfter()
          : const PerformanceDemoBefore(),
    );
  }
}
```

**확인 포인트:**

- "최적화 전" 상태에서 증가 버튼 탭 시 콘솔에 `HeavyStaticWidget.build()` 출력 확인
- "최적화 후" 전환 후 같은 동작 시 출력이 없음을 확인
- Performance Overlay에서 Before/After의 UI Thread 막대 차이 비교

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** Performance Overlay에서 UI Thread 막대가 기준선을 초과할 때 적절한 해결책은?

- A) RepaintBoundary를 모든 위젯에 적용한다
- B) Impeller로 전환한다
- C) **과도한 rebuild를 줄이고(const·위젯 분리) 무거운 작업을 compute()로 분리한다** ✅
- D) cacheExtent를 줄인다

---

**Q2. [Understand]** `RepaintBoundary`를 모든 위젯에 적용하면 안 되는 이유는?

> **모범 답안:** `RepaintBoundary`는 새 GPU 레이어를 생성해 해당 영역을 별도 텍스처로 관리한다. 레이어가 많아지면 GPU 메모리 사용량이 증가하고, 레이어 합성(compositing) 비용이 발생한다. 자주 repaint되지 않는 위젯에는 오히려 오버헤드가 된다. DevTools의 "Highlight Repaints"로 실제로 자주 repaint되는 위젯을 확인한 후 선택적으로 적용해야 한다.

---

**Q3. [Analyze]** `ListView`와 `ListView.builder`의 성능 차이를 렌더링 원리로 설명하라.

> **모범 답안:** `ListView(children: [...])`는 `children` 리스트의 모든 위젯을 즉시 생성하고 레이아웃 계산을 수행한다. 1000개 항목이면 1000개 위젯이 모두 메모리에 올라온다. `ListView.builder`는 지연 렌더링(lazy rendering)을 사용해 현재 화면에 보이는 항목과 `cacheExtent` 범위 내 항목만 동적으로 생성한다. 스크롤로 화면 밖으로 나간 항목은 메모리에서 해제된다. 결과적으로 대량 목록에서 메모리 사용량과 초기 로딩 시간이 크게 줄어든다.

---

**Q4. [Apply]** `itemExtent`를 `ListView.builder`에 설정하면 성능이 개선되는 이유를 설명하라.

> **모범 답안:** `itemExtent`를 설정하지 않으면 ListView는 각 항목의 높이를 실제로 레이아웃해 측정해야 한다. 스크롤 위치 계산 시 앞에 있는 모든 항목의 높이 합을 구해야 하는 경우가 생긴다. `itemExtent`를 설정하면 모든 항목이 동일한 높이이므로 인덱스 기반으로 위치를 O(1) 시간에 바로 계산할 수 있다. 특히 스크롤 위치를 특정 인덱스로 이동(`scrollTo`)하거나 대량 목록에서 효과가 크다.

---

**Q5. [Evaluate]** 아래 앱 프로파일링 결과를 보고 우선순위가 높은 최적화 2가지를 선택하고 이유를 설명하라.

```
Widget Inspector 결과 (버튼 탭 10회 후):
  _HomePageState                rebuild: 47
  HeaderBannerWidget            rebuild: 47  ← 배너, 변하지 않음
  ProductGrid                   rebuild: 47  ← 전체 그리드
  _LikeButtonState              rebuild: 47  ← 이것만 변해야 함
  FooterWidget                  rebuild: 47  ← 변하지 않음

Performance Overlay:
  UI Thread: 평균 12ms (기준선 초과 없음)
  Raster Thread: 평균 8ms (기준선 초과 없음)
```

> **모범 답안:** Performance Overlay는 정상이므로 현재 Jank는 없다. 그러나 불필요한 rebuild가 과도하다.
>
> **1순위: `HeaderBannerWidget`을 `const`로 처리 또는 별도 `StatelessWidget`으로 분리.** 47번 rebuild되지만 내용이 변하지 않으므로 불필요한 비용이다. `const HeaderBannerWidget()`으로 선언하면 rebuild가 0으로 줄어든다.
>
> **2순위: `_LikeButtonState`를 별도 `StatefulWidget`으로 분리.** 좋아요 버튼의 상태 변경이 `_HomePageState` 전체를 rebuild시키고 있다. 좋아요 버튼을 독립된 `StatefulWidget`으로 분리하면 `LikeButton` 위젯만 rebuild되고 나머지는 영향을 받지 않는다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **측정 먼저**: Profile 모드 + DevTools로 실제 병목을 확인한 뒤 최적화한다.
- **const 위젯**: 변하지 않는 모든 위젯에 적용. identical 체크로 rebuild 완전 차단.
- **위젯 분리**: setState 범위를 최소화. 상태를 가진 위젯을 작은 `StatefulWidget`으로 분리.
- **ValueNotifier**: setState 없이 특정 위젯만 rebuild. 잦은 값 변화(검색어, 드래그)에 유효.
- **RepaintBoundary**: 자주 repaint되는 위젯(애니메이션·게임)에만 선택적 적용. 남용 금지.
- **ListView.builder + itemExtent**: 대량 목록은 지연 렌더링 + 고정 높이로 최적화.
- **compute()**: JSON 파싱·이미지 처리 등 CPU 집약적 작업을 UI 스레드에서 분리.

### 6.2 다음 Step 예고

- **Step 25 — 메모리 관리:** dispose 패턴·컨트롤러 생명주기·Isolate 메모리 누수 경고 패턴으로 Flutter 앱의 메모리 누수를 예방하고 진단한다.

### 6.3 참고 자료

| 자료                   | 링크                                         | 설명                    |
| ---------------------- | -------------------------------------------- | ----------------------- |
| Flutter 성능 공식 문서 | <https://docs.flutter.dev/perf>                | 성능 최적화 전체 가이드 |
| DevTools 공식 문서     | <https://docs.flutter.dev/tools/devtools>      | DevTools 사용법         |
| Flutter 성능 모범 사례 | <https://docs.flutter.dev/perf/best-practices> | Best Practices          |
| Flutter — Impeller     | <https://docs.flutter.dev/perf/impeller>       | 렌더링 엔진 전환        |
| Performance Profiling  | <https://docs.flutter.dev/perf/ui-performance> | UI 성능 프로파일링      |

### 6.4 FAQ

**Q. Debug 모드에서 성능을 측정하면 안 되는 이유는?**

> Debug 모드는 JIT 컴파일과 다양한 디버그 오버헤드(assertion, 디버거 연결 등)로 인해 실제 성능의 1/5~1/10 수준이다. 성능 측정은 반드시 `flutter run --profile`로 Profile 모드에서 수행해야 한다. Widget Inspector의 rebuild count는 Debug 모드에서도 의미 있다.

**Q. `Opacity` 위젯과 `AnimatedOpacity` 중 성능 차이가 있는가?**

> `Opacity`는 매 프레임 자식 위젯 전체를 오프스크린 버퍼에 렌더링한 뒤 투명도를 적용하므로 비용이 크다. `AnimatedOpacity`도 내부적으로 `Opacity`를 사용하지만, `FadeTransition`은 위젯이 아닌 Layer의 alpha 값만 변경하므로 훨씬 효율적이다. 투명도 애니메이션에는 `FadeTransition`을 권장한다.

**Q. `addRepaintBoundaries: true`가 ListView.builder 기본값인가?**

> 그렇다. `ListView.builder`는 기본적으로 `addRepaintBoundaries: true`이므로 각 항목에 자동으로 `RepaintBoundary`를 추가한다. 모든 항목이 독립적인 레이어를 갖게 되어 한 항목이 변경될 때 다른 항목이 repaint되지 않는다.

---

## 빠른 자가진단 체크리스트

- [ ] Performance Overlay의 UI Thread와 Raster Thread 막대가 의미하는 것을 설명할 수 있는가?
- [ ] const 위젯이 rebuild를 차단하는 원리를 설명할 수 있는가?
- [ ] RepaintBoundary를 남용하면 안 되는 이유를 설명할 수 있는가?
- [ ] ListView.builder가 ListView보다 대량 목록에서 유리한 이유를 설명할 수 있는가?
- [ ] itemExtent 설정이 성능을 개선하는 원리를 설명할 수 있는가?
- [ ] compute()를 사용해야 하는 작업의 기준을 설명할 수 있는가?
- [ ] DevTools Widget Inspector의 rebuild count로 문제 위젯을 진단할 수 있는가?
- [ ] ⚠️ 함정 체크: Debug 모드에서 성능 측정 결과를 신뢰하면 안 되는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: RepaintBoundary를 모든 위젯에 적용하면 오히려 성능이 나빠질 수 있음을 이해했는가?
