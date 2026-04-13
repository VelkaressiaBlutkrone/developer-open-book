# Step 23 — Flutter 테스팅

> **파트:** 7️⃣ 테스팅 전략 | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 150분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** 테스트 피라미드의 3단계(Unit·Widget·Integration)와 각 단계의 역할·비용·속도를 설명할 수 있다.
2. **[Understand]** Unit Test에서 Mock 객체를 활용해 의존성을 격리하는 원리를 설명할 수 있다.
3. **[Understand]** Widget Test에서 `pump()`·`pumpAndSettle()`·`find`·`expect`가 하는 역할을 설명할 수 있다.
4. **[Understand]** Golden Test가 UI 회귀(regression)를 방지하는 원리를 설명할 수 있다.
5. **[Apply]** UseCase·Repository·Notifier에 대한 Unit Test를 작성할 수 있다.
6. **[Apply]** Widget Test로 화면 컴포넌트의 동작을 검증할 수 있다.
7. **[Evaluate]** 프로젝트 상황에 따라 테스트 전략과 커버리지 목표를 설계할 수 있다.

**전제 지식:** Step 21(Clean Architecture·UseCase·Repository), Step 22(DI·ProviderOverride), Step 15(Riverpod)

---

## 1. 서론

### 1.1 왜 테스트를 작성하는가

```
테스트 없는 개발의 비용
──────────────────────────────────────────────────────
  기능 A를 추가했더니 기능 B가 깨짐 → 수동 확인 1시간
  리팩토링 후 회귀 버그 → 출시 후 발견 → 신뢰도 하락
  신규 팀원이 기존 코드를 수정하기 두려움
  "이 코드가 뭘 하는지 모르겠으니 건드리지 말자"
──────────────────────────────────────────────────────

테스트가 있는 개발의 가치
──────────────────────────────────────────────────────
  리팩토링 후 테스트 실행 → 2초 만에 회귀 감지
  새 기능 추가 → 기존 테스트 모두 통과 → 자신 있게 배포
  테스트 = 살아있는 문서 (코드가 무엇을 해야 하는지 명시)
  신규 팀원이 테스트로 비즈니스 로직 학습
──────────────────────────────────────────────────────
```

### 1.2 테스트 피라미드

![테스트 피라미드](/developer-open-book/diagrams/step23-test-pyramid.svg)

### 1.3 전체 개념 지도

![Flutter 테스팅 hierarchy](/developer-open-book/diagrams/step23-testing-tree.svg)

---

## 2. 기본 개념과 용어

| 용어                 | 정의                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Unit Test**        | 하나의 함수·클래스·메서드를 독립적으로 검증하는 테스트. 외부 의존성을 Mock으로 교체           |
| **Widget Test**      | Flutter 위젯의 렌더링·상호작용을 검증하는 테스트. 실제 기기 없이 가상 환경에서 실행           |
| **Integration Test** | 앱 전체 흐름을 실제 기기/에뮬레이터에서 검증하는 테스트                                       |
| **Golden Test**      | 위젯의 렌더링 결과를 이미지(golden file)로 저장하고, 이후 변경 시 픽셀 단위로 비교하는 테스트 |
| **Mock**             | 실제 구현 대신 테스트 목적으로 만든 가짜 객체. 의존성을 격리할 때 사용                        |
| **Stub**             | Mock의 일종으로 특정 메서드 호출에 대해 미리 정의된 값을 반환                                 |
| **Spy**              | 실제 구현을 실행하면서 호출 기록을 추적하는 Mock의 변형                                       |
| **mockito**          | Dart/Flutter용 Mock 객체 생성 라이브러리. `@GenerateMocks` + build_runner로 코드 생성         |
| **mocktail**         | mockito의 대안. 코드 생성 없이 런타임에 Mock 생성                                             |
| **WidgetTester**     | Widget Test에서 위젯 렌더링·상호작용을 제어하는 테스트 객체                                   |
| **pump()**           | 위젯을 렌더링하거나 한 프레임 진행                                                            |
| **pumpAndSettle()**  | 모든 애니메이션·비동기 작업이 완료될 때까지 프레임 반복                                       |
| **find**             | 위젯 트리에서 특정 위젯을 찾는 Finder. `find.text()`, `find.byType()` 등                      |
| **expect**           | 실제 값과 기대값을 비교하는 테스트 단언(assertion) 함수                                       |
| **golden file**      | Golden Test의 기준 이미지 파일 (`.png`). `flutter test --update-goldens`으로 갱신             |
| **setUp / tearDown** | 각 테스트 실행 전/후에 공통 초기화·정리를 실행하는 훅                                         |
| **test coverage**    | 전체 코드 중 테스트가 실행한 코드의 비율                                                      |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Unit Test: 비즈니스 로직 검증

#### 기본 구조 (AAA 패턴)

```dart
// pubspec.yaml
// dev_dependencies:
//   test: ^1.25.0
//   mockito: ^5.4.0
//   build_runner: ^2.4.0

test('테스트 이름', () {
  // Arrange (준비): 테스트에 필요한 객체와 상태 설정
  final sut = GetProductsUseCase(mockRepository);

  // Act (실행): 테스트 대상 코드 실행
  final result = await sut();

  // Assert (검증): 결과 확인
  expect(result, isA<Right<Failure, List<Product>>>());
});
```

#### UseCase Unit Test

```dart
// test/features/product/application/get_products_use_case_test.dart
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';

@GenerateMocks([ProductRepository])
import 'get_products_use_case_test.mocks.dart';

void main() {
  late GetProductsUseCase sut;   // sut = System Under Test
  late MockProductRepository mockRepository;

  setUp(() {
    mockRepository = MockProductRepository();
    sut = GetProductsUseCase(mockRepository);
  });

  group('GetProductsUseCase', () {

    test('성공: 상품 목록을 반환한다', () async {
      // Arrange
      final products = [
        const Product(id: '1', name: '상품A', price: 10000, stockCount: 5),
        const Product(id: '2', name: '상품B', price: 20000, stockCount: 0),
      ];
      when(mockRepository.getProducts())
          .thenAnswer((_) async => Right(products));

      // Act
      final result = await sut();

      // Assert
      expect(result.isRight(), true);
      final data = result.getOrElse((_) => []);
      expect(data.length, 2);
    });

    test('비즈니스 규칙: 품절 상품은 목록 하단으로 이동한다', () async {
      // Arrange
      when(mockRepository.getProducts()).thenAnswer((_) async => Right([
        const Product(id: '1', name: '재고있음', price: 1000, stockCount: 5),
        const Product(id: '2', name: '품절',    price: 2000, stockCount: 0),
        const Product(id: '3', name: '재고있음', price: 3000, stockCount: 3),
      ]));

      // Act
      final result = await sut();

      // Assert
      final products = result.getOrElse((_) => []);
      // 재고 있는 상품이 먼저
      expect(products[0].isInStock, true);
      expect(products[1].isInStock, true);
      // 품절 상품이 마지막
      expect(products[2].isInStock, false);
    });

    test('비즈니스 규칙: 빈 카테고리는 null로 정규화된다', () async {
      // Arrange
      when(mockRepository.getProducts(category: null))
          .thenAnswer((_) async => const Right([]));

      // Act
      await sut(category: '   ');   // 공백 카테고리

      // Assert: null category로 repository가 호출됐는지 검증
      verify(mockRepository.getProducts(category: null)).called(1);
    });

    test('실패: 네트워크 오류 시 Failure를 반환한다', () async {
      // Arrange
      when(mockRepository.getProducts())
          .thenAnswer((_) async => const Left(NetworkFailure()));

      // Act
      final result = await sut();

      // Assert
      expect(result.isLeft(), true);
      result.fold(
        (failure) => expect(failure, isA<NetworkFailure>()),
        (_) => fail('실패여야 합니다'),
      );
    });
  });
}
```

#### Repository Unit Test (with Mock DataSource)

```dart
// test/features/product/data/repositories/product_repository_impl_test.dart
@GenerateMocks([ProductRemoteDataSource, ProductLocalDataSource])
void main() {
  late ProductRepositoryImpl sut;
  late MockProductRemoteDataSource mockRemote;
  late MockProductLocalDataSource  mockLocal;

  setUp(() {
    mockRemote = MockProductRemoteDataSource();
    mockLocal  = MockProductLocalDataSource();
    sut = ProductRepositoryImpl(remote: mockRemote, local: mockLocal);
  });

  group('getProducts', () {
    test('API 성공 시 Product 목록을 반환하고 캐시에 저장한다', () async {
      // Arrange
      final dtos = [ProductDto(id: '1', name: '상품', price: 1000, stockCount: 5)];
      when(mockRemote.fetchProducts()).thenAnswer((_) async => dtos);
      when(mockLocal.cacheProducts(any)).thenAnswer((_) async {});

      // Act
      final result = await sut.getProducts();

      // Assert
      expect(result.isRight(), true);
      verify(mockLocal.cacheProducts(any)).called(1);  // 캐시 저장 확인
    });

    test('API 실패 시 캐시에서 반환한다', () async {
      // Arrange
      when(mockRemote.fetchProducts()).thenThrow(DioException(
        requestOptions: RequestOptions(path: '/products'),
        type: DioExceptionType.connectionError,
      ));
      final cachedProducts = [
        const Product(id: '1', name: '캐시상품', price: 1000, stockCount: 5),
      ];
      when(mockLocal.getCachedProducts()).thenAnswer((_) async => cachedProducts);

      // Act
      final result = await sut.getProducts();

      // Assert
      expect(result.isRight(), true);
      final products = result.getOrElse((_) => []);
      expect(products.first.name, '캐시상품');
    });
  });
}
```

#### Riverpod Notifier Unit Test

```dart
// test/features/product/presentation/providers/product_list_notifier_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('ProductListNotifier: 초기 상태가 AsyncLoading이다', () async {
    final mockRepo = MockProductRepository();
    when(mockRepo.getProducts())
        .thenAnswer((_) async => Future.delayed(const Duration(seconds: 1),
            () => const Right([])));

    final container = ProviderContainer(
      overrides: [
        productRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
    addTearDown(container.dispose);

    // 초기 상태: Loading
    expect(
      container.read(productListProvider),
      const AsyncLoading<List<Product>>(),
    );
  });

  test('ProductListNotifier: 데이터 로딩 완료 시 AsyncData 상태', () async {
    final mockRepo = MockProductRepository();
    final products = [
      const Product(id: '1', name: '상품A', price: 1000, stockCount: 5),
    ];
    when(mockRepo.getProducts()).thenAnswer((_) async => Right(products));

    final container = ProviderContainer(
      overrides: [
        productRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
    addTearDown(container.dispose);

    // 데이터 로딩 완료 대기
    await container.read(productListProvider.future);

    // Assert
    final state = container.read(productListProvider);
    expect(state, isA<AsyncData<List<Product>>>());
    expect(state.value!.length, 1);
    expect(state.value!.first.name, '상품A');
  });
}
```

---

### 3.2 Widget Test: UI 컴포넌트 검증

Widget Test는 실제 기기 없이 Flutter 엔진의 가상 렌더링 환경에서 위젯을 테스트한다.

#### 기본 Widget Test 구조

```dart
// test/features/product/presentation/widgets/product_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('ProductCard: 상품 정보를 올바르게 표시한다', (WidgetTester tester) async {
    // Arrange
    const product = Product(
      id: '1', name: '테스트 상품', price: 29000, stockCount: 5,
    );

    // Act: 위젯 렌더링
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: ProductCard(product: product)),
      ),
    );

    // Assert: 텍스트 확인
    expect(find.text('테스트 상품'), findsOneWidget);
    expect(find.text('₩29,000'),   findsOneWidget);
    expect(find.text('재고 5개'),   findsOneWidget);
  });

  testWidgets('ProductCard: 품절 상품은 품절 배지를 표시한다', (WidgetTester tester) async {
    const product = Product(
      id: '2', name: '품절 상품', price: 19000, stockCount: 0,
    );

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: ProductCard(product: product))),
    );

    expect(find.text('품절'), findsOneWidget);
    // 가격이 회색으로 표시되는지 확인 (TextStyle 검증)
    final priceText = tester.widget<Text>(find.text('₩19,000'));
    expect(priceText.style?.color, Colors.grey);
  });

  testWidgets('ProductCard: 탭 시 onTap 콜백이 호출된다', (WidgetTester tester) async {
    bool tapped = false;
    const product = Product(id: '1', name: '상품', price: 1000, stockCount: 5);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ProductCard(product: product, onTap: () => tapped = true),
        ),
      ),
    );

    await tester.tap(find.byType(ProductCard));
    await tester.pump();

    expect(tapped, true);
  });
}
```

#### 전체 화면 Widget Test (Riverpod + Mock)

```dart
// test/features/product/presentation/screens/product_list_screen_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ProductListScreen', () {

    testWidgets('로딩 중: CircularProgressIndicator를 표시한다',
        (WidgetTester tester) async {
      final mockRepo = MockProductRepository();
      // 무한 대기 → 로딩 상태 유지
      when(mockRepo.getProducts())
          .thenAnswer((_) => Completer<Either<Failure, List<Product>>>().future);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pump();  // 첫 프레임

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('성공: 상품 목록을 표시한다', (WidgetTester tester) async {
      final mockRepo = MockProductRepository();
      when(mockRepo.getProducts()).thenAnswer((_) async => Right([
        const Product(id: '1', name: '플러터 책', price: 32000, stockCount: 10),
        const Product(id: '2', name: '다트 책',  price: 28000, stockCount: 5),
      ]));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pumpAndSettle();  // 비동기 완료까지 대기

      expect(find.text('플러터 책'), findsOneWidget);
      expect(find.text('다트 책'),  findsOneWidget);
    });

    testWidgets('실패: 오류 메시지와 재시도 버튼을 표시한다',
        (WidgetTester tester) async {
      final mockRepo = MockProductRepository();
      when(mockRepo.getProducts())
          .thenAnswer((_) async => const Left(NetworkFailure()));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('인터넷 연결을 확인해주세요'), findsOneWidget);
      expect(find.text('다시 시도'),               findsOneWidget);
    });

    testWidgets('재시도 버튼 탭 시 데이터를 다시 로드한다',
        (WidgetTester tester) async {
      final mockRepo = MockProductRepository();
      // 첫 번째 호출: 실패
      when(mockRepo.getProducts())
          .thenAnswer((_) async => const Left(NetworkFailure()));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [productRepositoryProvider.overrideWithValue(mockRepo)],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pumpAndSettle();

      // 두 번째 호출: 성공으로 변경
      when(mockRepo.getProducts()).thenAnswer((_) async => Right([
        const Product(id: '1', name: '복구된 상품', price: 1000, stockCount: 5),
      ]));

      await tester.tap(find.text('다시 시도'));
      await tester.pumpAndSettle();

      expect(find.text('복구된 상품'), findsOneWidget);
    });
  });
}
```

#### WidgetTester 핵심 메서드

```dart
// 렌더링
await tester.pumpWidget(widget);          // 위젯 렌더링
await tester.pump();                      // 한 프레임 진행
await tester.pump(Duration(seconds: 1));  // 1초 진행
await tester.pumpAndSettle();             // 모든 애니메이션·비동기 완료 대기

// 상호작용
await tester.tap(find.text('버튼'));
await tester.longPress(find.byKey(Key('item')));
await tester.drag(find.byType(ListView), const Offset(0, -300));
await tester.enterText(find.byType(TextField), '입력값');

// 스크롤
await tester.scrollUntilVisible(find.text('마지막 항목'), 500);

// Finder (위젯 탐색)
find.text('텍스트')               // 텍스트로 찾기
find.byType(CircularProgressIndicator) // 타입으로 찾기
find.byKey(const Key('my_key'))  // Key로 찾기
find.byIcon(Icons.add)           // 아이콘으로 찾기
find.ancestor(of: ..., matching: ...) // 조상 위젯으로 찾기
find.descendant(of: ..., matching: ...) // 자손 위젯으로 찾기

// Matcher
expect(find.text('hello'), findsOneWidget);   // 정확히 1개
expect(find.text('hello'), findsWidgets);     // 1개 이상
expect(find.text('hello'), findsNothing);     // 없음
expect(find.text('hello'), findsNWidgets(3)); // 정확히 3개
```

---

### 3.3 Golden Test: UI 스냅샷 비교

Golden Test는 위젯을 이미지(.png)로 저장하고, 코드 변경 후 이미지가 달라지면 실패한다. 의도치 않은 UI 변경을 방지하는 시각적 회귀 테스트다.

```dart
// test/features/product/presentation/widgets/product_card_golden_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('ProductCard golden: 기본 상태', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(useMaterial3: true),
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 200,
              child: ProductCard(
                product: const Product(
                  id: '1', name: '플러터 완전정복',
                  price: 32000, stockCount: 5,
                ),
              ),
            ),
          ),
        ),
      ),
    );

    // Golden 이미지와 비교 (test/goldens/ 폴더에 저장)
    await expectLater(
      find.byType(ProductCard),
      matchesGoldenFile('goldens/product_card_default.png'),
    );
  });

  testWidgets('ProductCard golden: 품절 상태', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 200,
              child: ProductCard(
                product: const Product(
                  id: '2', name: '품절 상품',
                  price: 19000, stockCount: 0,
                ),
              ),
            ),
          ),
        ),
      ),
    );

    await expectLater(
      find.byType(ProductCard),
      matchesGoldenFile('goldens/product_card_out_of_stock.png'),
    );
  });
}
```

**Golden 파일 생성·갱신:**

```bash
# 처음 실행 (golden 파일 생성)
flutter test --update-goldens

# 이후 실행 (기존 golden과 비교)
flutter test

# golden 파일 위치
test/goldens/product_card_default.png
test/goldens/product_card_out_of_stock.png
```

> ⚠️ **함정 주의:** Golden Test는 플랫폼(macOS·Windows·Linux)과 Flutter 버전에 따라 픽셀이 다를 수 있다. CI 환경을 고정해야 일관된 결과를 얻을 수 있다. `flutter_test_config.dart`로 폰트·플랫폼을 통일하거나, `alchemist` 패키지로 플랫폼 독립적인 Golden Test를 구성한다.

---

### 3.4 Integration Test: 전체 흐름 검증

```dart
// integration_test/product_flow_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('상품 목록 → 상세 → 장바구니 추가 흐름', (tester) async {
    // 실제 앱 실행
    await tester.pumpWidget(const ProviderScope(child: MyApp()));
    await tester.pumpAndSettle();

    // 상품 목록 확인
    expect(find.byType(ProductCard), findsWidgets);

    // 첫 번째 상품 탭 → 상세 화면 이동
    await tester.tap(find.byType(ProductCard).first);
    await tester.pumpAndSettle();

    // 상세 화면 확인
    expect(find.text('장바구니 담기'), findsOneWidget);

    // 장바구니 담기
    await tester.tap(find.text('장바구니 담기'));
    await tester.pumpAndSettle();

    // 성공 메시지 확인
    expect(find.text('장바구니에 추가되었습니다'), findsOneWidget);
  });
}
```

```bash
# Integration Test 실행 (에뮬레이터/실기기 필요)
flutter test integration_test/product_flow_test.dart
```

---

### 3.5 테스트 코드 품질 원칙

#### FIRST 원칙

```
F — Fast (빠름)
  Unit Test는 수 ms, 전체 Suite는 수 초 이내

I — Independent (독립적)
  각 테스트는 서로 영향을 주지 않음
  순서 무관하게 실행 가능

R — Repeatable (반복 가능)
  같은 코드, 같은 입력 → 항상 같은 결과

S — Self-validating (자가 검증)
  테스트 자체가 성공/실패를 판단
  사람이 출력을 보고 판단할 필요 없음

T — Timely (적시)
  기능 구현과 함께 (또는 직전에) 작성
```

#### 좋은 테스트 이름 작성법

```dart
// ❌ 나쁜 이름
test('test1', () { ... });
test('success case', () { ... });

// ✅ 좋은 이름: "상황_행동_기대결과" 패턴
test('품절 상품이 있을 때_getProducts 호출 시_품절 상품은 목록 하단에 위치한다', () { ... });
test('카테고리가 빈 문자열일 때_getProducts 호출 시_null category로 Repository를 호출한다', () { ... });
test('API 오류가 발생했을 때_getProducts 호출 시_NetworkFailure를 반환한다', () { ... });
```

---

## 4. 사례 연구

### 4.1 TDD: 테스트를 먼저 작성하는 개발

```
TDD 사이클 (Red → Green → Refactor)
──────────────────────────────────────────────────────
  Red:    실패하는 테스트 먼저 작성
  Green:  테스트를 통과하는 최소한의 코드 작성
  Refactor: 코드를 개선 (테스트는 통과한 상태 유지)
──────────────────────────────────────────────────────

예: SearchProductsUseCase TDD

1. Red: 아직 클래스 없음
   test('검색어 2글자 미만 시 ValidationFailure 반환', () async {
     final sut = SearchProductsUseCase(mockRepo);  // 컴파일 오류!
     ...
   });

2. Green: 최소 구현
   class SearchProductsUseCase {
     Future<Either<Failure, List<Product>>> call(String query) async {
       if (query.length < 2) return Left(ValidationFailure('...'));
       return _repo.searchProducts(query);
     }
   }

3. Refactor: 코드 정리
   if (query.trim().length < 2) → 공백 처리 추가
```

---

### 4.2 테스트 커버리지 목표 설정

```
계층별 커버리지 권장 목표
──────────────────────────────────────────────────────
  Domain Layer (Entity, UseCase)      ← 90%+ 권장
    → 비즈니스 로직이 집중 → 높은 커버리지 필수

  Data Layer (Repository, DataSource) ← 70%+ 권장
    → API 통신 Mock으로 주요 경로 커버

  Presentation Layer (Widget, Screen) ← 50%+ 권장
    → 핵심 시나리오 Widget Test로 커버
    → 모든 UI 상태 커버는 비용 대비 낮을 수 있음

  Integration Test                    ← 핵심 흐름 5~10개
    → 전체 커버보다 핵심 사용자 시나리오 집중
──────────────────────────────────────────────────────
```

```bash
# 커버리지 측정
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

---

### 4.3 Form 유효성 검증 Widget Test

```dart
void main() {
  group('LoginScreen', () {

    testWidgets('이메일 형식 오류 시 에러 메시지 표시', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

      // 잘못된 이메일 입력
      await tester.enterText(find.byKey(const Key('email_field')), 'invalid');
      await tester.enterText(find.byKey(const Key('password_field')), 'Password1');
      await tester.tap(find.text('로그인'));
      await tester.pump();

      expect(find.text('올바른 이메일 형식이 아닙니다'), findsOneWidget);
    });

    testWidgets('비밀번호 8자 미만 시 에러 메시지 표시', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

      await tester.enterText(find.byKey(const Key('email_field')), 'test@test.com');
      await tester.enterText(find.byKey(const Key('password_field')), '1234567');
      await tester.tap(find.text('로그인'));
      await tester.pump();

      expect(find.text('8자 이상 입력해주세요'), findsOneWidget);
    });

    testWidgets('유효한 입력 시 로딩 스피너를 표시한다', (tester) async {
      final mockAuth = MockAuthNotifier();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [authProvider.overrideWithValue(mockAuth)],
          child: const MaterialApp(home: LoginScreen()),
        ),
      );

      await tester.enterText(find.byKey(const Key('email_field')), 'test@test.com');
      await tester.enterText(find.byKey(const Key('password_field')), 'Password1');
      await tester.tap(find.text('로그인'));
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}
```

---

## 5. 실습

### 5.1 Unit Test + Widget Test 완성

```dart
// ── 테스트 대상 코드 ─────────────────────────────────

// lib/features/todo/domain/entities/todo.dart
class Todo {
  final String id;
  final String title;
  final bool isDone;
  const Todo({required this.id, required this.title, required this.isDone});
  bool get isEmpty => title.trim().isEmpty;
}

// lib/features/todo/application/create_todo_use_case.dart
class CreateTodoUseCase {
  Future<String?> call(String title) async {
    if (title.trim().isEmpty) return '할 일을 입력해주세요';
    if (title.trim().length > 100) return '100자 이내로 입력해주세요';
    return null; // null = 성공
  }
}

// lib/features/todo/presentation/widgets/todo_item.dart
class TodoItem extends StatelessWidget {
  final Todo todo;
  final VoidCallback? onToggle;
  final VoidCallback? onDelete;
  const TodoItem({super.key, required this.todo, this.onToggle, this.onDelete});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Checkbox(value: todo.isDone, onChanged: (_) => onToggle?.call()),
      title: Text(
        todo.title,
        style: TextStyle(
          decoration: todo.isDone ? TextDecoration.lineThrough : null,
          color: todo.isDone ? Colors.grey : null,
        ),
      ),
      trailing: IconButton(
        icon: const Icon(Icons.delete_outline),
        onPressed: onDelete,
      ),
    );
  }
}

// ── Unit Test ────────────────────────────────────────
// test/features/todo/application/create_todo_use_case_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  late CreateTodoUseCase sut;
  setUp(() => sut = CreateTodoUseCase());

  group('CreateTodoUseCase', () {
    test('정상 입력 시 null을 반환한다', () async {
      final error = await sut('할 일 제목');
      expect(error, isNull);
    });

    test('빈 문자열 입력 시 에러 메시지를 반환한다', () async {
      final error = await sut('');
      expect(error, '할 일을 입력해주세요');
    });

    test('공백만 있는 입력 시 에러 메시지를 반환한다', () async {
      final error = await sut('   ');
      expect(error, '할 일을 입력해주세요');
    });

    test('101자 입력 시 에러 메시지를 반환한다', () async {
      final longTitle = 'a' * 101;
      final error = await sut(longTitle);
      expect(error, '100자 이내로 입력해주세요');
    });

    test('100자 입력 시 null을 반환한다', () async {
      final title = 'a' * 100;
      final error = await sut(title);
      expect(error, isNull);
    });
  });
}

// ── Widget Test ──────────────────────────────────────
// test/features/todo/presentation/widgets/todo_item_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const incompleteTodo = Todo(id: '1', title: '운동하기', isDone: false);
  const completedTodo  = Todo(id: '2', title: '독서',    isDone: true);

  testWidgets('미완료 항목: 취소선 없이 표시한다', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: TodoItem(todo: incompleteTodo)),
      ),
    );
    final text = tester.widget<Text>(find.text('운동하기'));
    expect(text.style?.decoration, isNot(TextDecoration.lineThrough));
  });

  testWidgets('완료 항목: 취소선과 회색으로 표시한다', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: TodoItem(todo: completedTodo)),
      ),
    );
    final text = tester.widget<Text>(find.text('독서'));
    expect(text.style?.decoration, TextDecoration.lineThrough);
    expect(text.style?.color, Colors.grey);
  });

  testWidgets('체크박스 탭 시 onToggle이 호출된다', (tester) async {
    bool toggled = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TodoItem(
            todo: incompleteTodo,
            onToggle: () => toggled = true,
          ),
        ),
      ),
    );
    await tester.tap(find.byType(Checkbox));
    await tester.pump();
    expect(toggled, true);
  });

  testWidgets('삭제 버튼 탭 시 onDelete가 호출된다', (tester) async {
    bool deleted = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TodoItem(
            todo: incompleteTodo,
            onDelete: () => deleted = true,
          ),
        ),
      ),
    );
    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pump();
    expect(deleted, true);
  });
}
```

```bash
# 테스트 실행
flutter test

# 특정 파일만 실행
flutter test test/features/todo/

# 상세 출력
flutter test --reporter expanded

# 커버리지
flutter test --coverage
```

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** 테스트 피라미드에서 Unit Test의 비율이 가장 높아야 하는 이유는?

> **모범 답안:** Unit Test는 실행 속도가 가장 빠르고(ms 단위) 비용이 적으며, 의존성을 Mock으로 격리하므로 네트워크·기기가 필요 없다. 버그를 가장 빠르게 발견하고, 실패 시 원인이 명확하다. Integration Test는 실행 속도가 느리고 환경 설정이 복잡하므로 핵심 시나리오에만 적용한다.

---

**Q2. [Understand]** `pump()`와 `pumpAndSettle()`의 차이는?

- A) pump()는 비동기를 처리하고 pumpAndSettle()은 동기만 처리한다
- B) **pump()는 한 프레임만 진행하고 pumpAndSettle()은 모든 애니메이션·비동기가 완료될 때까지 프레임을 반복한다** ✅
- C) 기능 차이가 없다
- D) pump()는 위젯을 그리고 pumpAndSettle()은 이벤트를 발생시킨다

---

**Q3. [Understand]** Golden Test를 CI에서 실행할 때 주의해야 할 점은?

> **모범 답안:** Golden Test는 픽셀 단위 비교를 수행하므로 플랫폼(macOS·Windows·Linux)과 Flutter 버전에 따라 렌더링 결과가 다를 수 있다. CI 환경을 고정된 Docker 이미지로 통일하거나, `alchemist` 같은 패키지를 사용해 플랫폼 독립적인 Golden Test를 구성해야 한다. 로컬에서 생성한 Golden 파일을 다른 OS의 CI에서 비교하면 의도치 않은 실패가 발생할 수 있다.

---

**Q4. [Apply]** `Todo` Entity의 `isEmpty` 게터를 테스트하는 Unit Test를 작성하라.

```dart
// 모범 답안
group('Todo.isEmpty', () {
  test('제목이 빈 문자열이면 true를 반환한다', () {
    const todo = Todo(id: '1', title: '', isDone: false);
    expect(todo.isEmpty, true);
  });

  test('제목이 공백만 있으면 true를 반환한다', () {
    const todo = Todo(id: '1', title: '   ', isDone: false);
    expect(todo.isEmpty, true);
  });

  test('제목이 있으면 false를 반환한다', () {
    const todo = Todo(id: '1', title: '할 일', isDone: false);
    expect(todo.isEmpty, false);
  });
});
```

---

**Q5. [Evaluate]** 다음 중 Unit Test보다 Widget Test로 검증해야 적합한 것은?

- A) GetProductsUseCase가 품절 상품을 하단으로 이동시키는 비즈니스 규칙
- B) ProductRepositoryImpl이 API 실패 시 캐시를 반환하는지
- C) **ProductCard에서 품절 상품일 때 "품절" 배지가 렌더링되는지** ✅
- D) SearchProductsUseCase가 2글자 미만 입력 시 ValidationFailure를 반환하는지

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **테스트 피라미드**: Unit(70%)·Widget(20%)·Integration(10%) 비율 권장. 아래로 갈수록 빠르고 저렴하다.
- **Unit Test**: AAA 패턴(Arrange·Act·Assert), mockito로 Mock 생성, 의존성 격리.
- **Widget Test**: `pumpWidget()`으로 렌더링, `find`로 위젯 탐색, `expect`로 검증. `pumpAndSettle()`로 비동기 완료 대기.
- **Golden Test**: 픽셀 단위 UI 회귀 방지. `--update-goldens`로 기준 이미지 생성. CI 환경 고정 필수.
- **Integration Test**: 실제 기기/에뮬레이터에서 전체 시나리오 검증. 핵심 흐름 5~10개에 집중.
- **ProviderOverride**: Riverpod 프로젝트에서 Mock Repository 주입. 각 테스트마다 독립적인 스코프.

### 6.2 다음 Step 예고

- **Step 24 — Flutter 렌더링 최적화:** Rebuild 최소화·RepaintBoundary·const 최적화·DevTools Performance 탭으로 앱 성능을 분석하고 개선한다.

### 6.3 참고 자료

| 자료                      | 링크                                      | 설명                  |
| ------------------------- | ----------------------------------------- | --------------------- |
| Flutter Testing 공식 문서 | <https://docs.flutter.dev/testing>          | 전체 테스팅 가이드    |
| mockito 패키지            | <https://pub.dev/packages/mockito>          | Mock 코드 생성        |
| mocktail 패키지           | <https://pub.dev/packages/mocktail>         | 코드 생성 없는 Mock   |
| Golden Toolkit            | <https://pub.dev/packages/golden_toolkit>   | Golden Test 개선 도구 |
| Flutter Test Cookbook     | <https://docs.flutter.dev/cookbook/testing> | 공식 테스팅 예제      |

### 6.4 FAQ

**Q. mockito와 mocktail 중 무엇을 선택해야 하는가?**

> `mockito`는 `build_runner`로 코드를 생성해 타입 안전성이 높다. `mocktail`은 코드 생성 없이 런타임에 Mock을 생성해 설정이 간단하다. 대규모 팀·엄격한 타입 안전성 → mockito, 빠른 프로토타이핑·설정 최소화 → mocktail.

**Q. `pumpAndSettle()`이 무한 대기하는 이유는?**

> 무한 루프 애니메이션(예: `AnimationController.repeat()`)이나 완료되지 않는 비동기 작업이 있으면 `pumpAndSettle()`이 타임아웃될 수 있다. 이런 경우 `pump(Duration(milliseconds: 500))`처럼 명시적 시간을 지정하거나, 테스트에서 해당 애니메이션을 비활성화한다.

**Q. 테스트 파일의 위치는 어디에 두어야 하는가?**

> `test/` 폴더 아래에 `lib/`의 구조를 그대로 미러링한다. `lib/features/product/application/get_products_use_case.dart`의 테스트는 `test/features/product/application/get_products_use_case_test.dart`에 위치한다. 파일명에 `_test.dart` 접미사를 붙이면 Flutter가 자동으로 테스트 파일로 인식한다.

---

## 빠른 자가진단 체크리스트

- [ ] 테스트 피라미드의 3단계와 각각의 특징을 설명할 수 있는가?
- [ ] mockito로 Mock을 생성하고 `when().thenAnswer()`로 Stub을 설정할 수 있는가?
- [ ] Widget Test에서 `pumpWidget()·tap()·enterText()·pumpAndSettle()`을 올바르게 사용할 수 있는가?
- [ ] `find.text()·find.byType()·find.byKey()` Finder를 사용할 수 있는가?
- [ ] Golden Test의 기준 이미지를 생성하고 비교하는 방법을 설명할 수 있는가?
- [ ] ProviderOverride로 Widget Test에서 Mock Repository를 주입할 수 있는가?
- [ ] 계층별 커버리지 목표(Domain 90%+, Data 70%+, Presentation 50%+)를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Golden Test를 CI에서 실행 시 플랫폼 차이로 인한 픽셀 불일치가 발생할 수 있음을 이해했는가?
- [ ] ⚠️ 함정 체크: pumpAndSettle()이 무한 애니메이션이 있을 때 타임아웃될 수 있음을 이해했는가?
