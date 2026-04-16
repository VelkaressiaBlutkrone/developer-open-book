# Step 21 — Clean Architecture

> **파트:** 6️⃣ Flutter 아키텍처 | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 150분
> 이론 75% + 실습 25% | Bloom 단계: Analyzing → Evaluating → Creating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Clean Architecture의 3원칙(관심사 분리·의존성 역전·추상화)을 설명할 수 있다.
2. **[Understand]** Repository Pattern이 데이터 접근을 추상화하는 원리를 설명할 수 있다.
3. **[Understand]** UseCase가 비즈니스 시나리오를 Application Layer에서 처리하는 방식을 설명할 수 있다.
4. **[Apply]** Domain Layer(Entity·Repository 인터페이스·UseCase)를 구현할 수 있다.
5. **[Apply]** Data Layer(Repository 구현체·DataSource·DTO)를 구현하고 Domain과 연결할 수 있다.
6. **[Evaluate]** 주어진 Flutter 코드에서 Clean Architecture 위반을 찾아 리팩토링할 수 있다.

**전제 지식:** Step 20(프로젝트 구조·계층 개념), Step 14(Provider·DI), Step 15(Riverpod), Step 17(HTTP)

---

## 1. 서론

### 1.1 Clean Architecture란

Robert C. Martin(Uncle Bob)이 제안한 소프트웨어 설계 원칙으로, **외부 의존성으로부터 비즈니스 로직을 보호**하는 것이 핵심이다.

![Clean Architecture 핵심 질문](/developer-open-book/diagrams/flutter-step21-core-questions.svg)

### 1.2 Flutter에서 Clean Architecture 원형

Robert Martin의 원형을 Flutter 맥락에서 단순화하면:

![Clean Architecture 4-Layer](/developer-open-book/diagrams/step21-clean-arch-layers.svg)

### 1.3 전체 개념 지도

![Clean Architecture 트리](/developer-open-book/diagrams/step21-clean-arch-tree.svg)

---

## 2. 기본 개념과 용어

| 용어                      | 정의                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| **Clean Architecture**    | 비즈니스 로직을 외부 의존성으로부터 분리해 독립적으로 테스트·교체 가능하게 설계하는 원칙        |
| **의존성 규칙**           | 소스 코드 의존성은 항상 안쪽(Domain) 방향으로만 향해야 한다는 Clean Architecture의 핵심 규칙    |
| **Repository Pattern**    | 데이터 출처(API·DB·캐시)를 추상화해 상위 계층이 데이터 출처를 모르게 하는 설계 패턴             |
| **UseCase**               | 하나의 구체적인 비즈니스 시나리오를 실행하는 단위 클래스. 단일 책임 원칙 적용                   |
| **Entity**                | 비즈니스 도메인의 핵심 개념. 프레임워크 의존성이 없는 순수 Dart 클래스                          |
| **DataSource**            | 실제 데이터 출처와 직접 통신하는 최하위 클래스. Remote(API)와 Local(DB)로 분리                  |
| **DTO**                   | Data Transfer Object. 외부 시스템(API)의 데이터 형식을 표현하고 Domain Entity로 변환            |
| **의존성 역전 원칙(DIP)** | 고수준 모듈(UseCase)은 저수준 모듈(Repository 구현체)에 의존하지 않고 추상화(인터페이스)에 의존 |
| **Either**                | 성공(Right) 또는 실패(Left) 두 가지 결과를 타입 안전하게 표현하는 타입. `fpdart` 패키지 제공    |
| **Failure**               | 도메인 에러를 표현하는 sealed class 계층. 구체적인 예외 대신 비즈니스 관점의 실패를 표현        |
| **Result 패턴**           | Either 또는 sealed class로 성공·실패를 명시적으로 반환하는 패턴                                 |
| **추상화**                | 인터페이스/추상 클래스로 구현 세부사항을 숨기고 계약(contract)만 노출하는 설계 기법             |

---

## 3. 이론적 배경과 원리 ★

### 3.1 의존성 규칙: 왜 Domain이 아무것도 의존하지 않는가

![잘못된 의존성 vs 올바른 의존성](/developer-open-book/diagrams/flutter-step21-dependency-comparison.svg)

---

### 3.2 Domain Layer 완전 구현

#### Entity: 비즈니스 객체

```dart
// features/product/domain/entities/product.dart
// ✅ 순수 Dart — import 없음
class Product {
  final String id;
  final String name;
  final double price;
  final double? discountPrice;
  final int stockCount;
  final String? imageUrl;
  final List<String> categories;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    this.discountPrice,
    required this.stockCount,
    this.imageUrl,
    this.categories = const [],
  });

  // ── 비즈니스 규칙 (Entity 안에서 표현) ──────────
  bool get isInStock     => stockCount > 0;
  bool get isLowStock    => stockCount in [1, 2, 3, 4, 5];
  bool get hasDiscount   => discountPrice != null && discountPrice! < price;
  double get effectivePrice => discountPrice ?? price;
  double get discountRate =>
      hasDiscount ? ((price - discountPrice!) / price * 100) : 0;

  String get formattedPrice => '₩${effectivePrice.toStringAsFixed(0)}';

  // ── 동등성 비교 ─────────────────────────────────
  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Product && other.id == id);

  @override
  int get hashCode => id.hashCode;

  // ── 불변 복사 ────────────────────────────────────
  Product copyWith({
    String? name,
    double? price,
    double? discountPrice,
    int? stockCount,
  }) =>
      Product(
        id:            id,
        name:          name ?? this.name,
        price:         price ?? this.price,
        discountPrice: discountPrice ?? this.discountPrice,
        stockCount:    stockCount ?? this.stockCount,
        imageUrl:      imageUrl,
        categories:    categories,
      );
}
```

#### Repository 인터페이스

```dart
// features/product/domain/repositories/product_repository.dart
abstract interface class ProductRepository {
  /// 상품 목록 조회
  Future<Either<Failure, List<Product>>> getProducts({
    String? category,
    int page = 1,
    int limit = 20,
  });

  /// 단일 상품 조회
  Future<Either<Failure, Product>> getProduct(String id);

  /// 상품 검색
  Future<Either<Failure, List<Product>>> searchProducts(String query);

  /// 상품 생성 (관리자)
  Future<Either<Failure, Product>> createProduct(Product product);

  /// 상품 수정 (관리자)
  Future<Either<Failure, Product>> updateProduct(Product product);

  /// 상품 삭제 (관리자)
  Future<Either<Failure, Unit>> deleteProduct(String id);
}
```

---

### 3.3 UseCase: 비즈니스 시나리오 단위

UseCase는 **하나의 비즈니스 동작**을 담당한다. 단일 책임 원칙을 철저히 적용해 하나의 UseCase 클래스는 하나의 `execute()` 또는 `call()` 메서드만 갖는다.

```dart
// features/product/application/get_products_use_case.dart
class GetProductsUseCase {
  final ProductRepository _repository;

  GetProductsUseCase(this._repository);

  Future<Either<Failure, List<Product>>> call({
    String? category,
    int page = 1,
  }) async {
    // 비즈니스 규칙: 빈 카테고리 문자열 → null 처리
    final normalizedCategory = category?.trim().isEmpty == true ? null : category;

    final result = await _repository.getProducts(
      category: normalizedCategory,
      page:     page,
    );

    return result.map((products) {
      // 비즈니스 규칙: 품절 상품은 항상 목록 하단으로
      return [
        ...products.where((p) => p.isInStock),
        ...products.where((p) => !p.isInStock),
      ];
    });
  }
}

// features/product/application/search_products_use_case.dart
class SearchProductsUseCase {
  final ProductRepository _repository;
  SearchProductsUseCase(this._repository);

  Future<Either<Failure, List<Product>>> call(String query) async {
    // 비즈니스 규칙: 최소 2글자 이상
    if (query.trim().length < 2) {
      return const Left(ValidationFailure('검색어는 2글자 이상 입력해주세요'));
    }
    return _repository.searchProducts(query.trim());
  }
}

// features/product/application/create_product_use_case.dart
class CreateProductUseCase {
  final ProductRepository _repository;
  CreateProductUseCase(this._repository);

  Future<Either<Failure, Product>> call(Product product) async {
    // 비즈니스 규칙: 가격 검증
    if (product.price <= 0) {
      return const Left(ValidationFailure('가격은 0보다 커야 합니다'));
    }
    if (product.name.trim().isEmpty) {
      return const Left(ValidationFailure('상품명을 입력해주세요'));
    }
    return _repository.createProduct(product);
  }
}
```

**UseCase를 `call()`로 구현하는 이유:**

```dart
// call()을 사용하면 클래스를 함수처럼 호출 가능
final getProducts = GetProductsUseCase(repository);

// 함수처럼 호출
final result = await getProducts(category: 'electronics');

// 메서드 참조처럼 사용
final fn = getProducts.call;
```

---

### 3.4 Either 패턴으로 에러를 타입 안전하게 처리

```yaml
dependencies:
  fpdart: ^1.1.0
```

```dart
// Either<Left, Right> — Left: 실패, Right: 성공
// fpdart 패키지

// Repository 반환 타입
Future<Either<Failure, List<Product>>> getProducts() async {
  try {
    final dtos = await _remote.fetchProducts();
    return Right(dtos.map((d) => d.toDomain()).toList());
  } on DioException catch (e) {
    return Left(_mapDioError(e));  // Failure로 변환
  } catch (e) {
    return Left(UnknownFailure(e.toString()));
  }
}

Failure _mapDioError(DioException e) => switch (e.type) {
  DioExceptionType.connectionTimeout => const NetworkFailure(),
  DioExceptionType.connectionError   => const NetworkFailure(),
  DioExceptionType.badResponse => switch (e.response?.statusCode) {
    401 => const UnauthorizedFailure(),
    404 => const NotFoundFailure(),
    _   => const ServerFailure(),
  },
  _ => const UnknownFailure('알 수 없는 오류'),
};

// ViewModel에서 Either 처리
Future<void> loadProducts() async {
  state = const AsyncLoading();

  final result = await _getProductsUseCase(category: _category);

  state = result.fold(
    (failure) => AsyncError(failure.message, StackTrace.current),
    (products) => AsyncData(products),
  );
}

// UI에서 Failure 타입별 분기
result.fold(
  (failure) => switch (failure) {
    NetworkFailure()     => const Text('인터넷 연결을 확인해주세요'),
    UnauthorizedFailure()=> const Text('로그인이 필요합니다'),
    NotFoundFailure()    => const Text('찾을 수 없습니다'),
    _                   => const Text('오류가 발생했습니다'),
  },
  (products) => ProductGrid(products: products),
);
```

---

### 3.5 Data Layer 완전 구현

#### DTO: API 응답 표현

```dart
// features/product/data/dtos/product_dto.dart
class ProductDto {
  final String id;
  final String name;
  final double price;
  final double? discountPrice;
  final int stockCount;
  final String? imageUrl;
  final List<String>? categories;

  const ProductDto({
    required this.id,
    required this.name,
    required this.price,
    this.discountPrice,
    required this.stockCount,
    this.imageUrl,
    this.categories,
  });

  factory ProductDto.fromJson(Map<String, dynamic> json) => ProductDto(
    id:            json['id']             as String,
    name:          json['name']           as String,
    price:         (json['price']         as num).toDouble(),
    discountPrice: (json['discount_price'] as num?)?.toDouble(),
    stockCount:    json['stock_count']    as int,
    imageUrl:      json['image_url']      as String?,
    categories:    (json['categories']   as List?)?.cast<String>(),
  );

  Map<String, dynamic> toJson() => {
    'id':             id,
    'name':           name,
    'price':          price,
    'discount_price': discountPrice,
    'stock_count':    stockCount,
    'image_url':      imageUrl,
    'categories':     categories,
  };

  // ✅ DTO → Domain Entity 변환
  Product toDomain() => Product(
    id:            id,
    name:          name,
    price:         price,
    discountPrice: discountPrice,
    stockCount:    stockCount,
    imageUrl:      imageUrl,
    categories:    categories ?? const [],
  );

  // ✅ Domain Entity → DTO 변환
  factory ProductDto.fromDomain(Product product) => ProductDto(
    id:            product.id,
    name:          product.name,
    price:         product.price,
    discountPrice: product.discountPrice,
    stockCount:    product.stockCount,
    imageUrl:      product.imageUrl,
    categories:    product.categories,
  );
}
```

#### Remote DataSource

```dart
// features/product/data/datasources/product_remote_datasource.dart
abstract interface class ProductRemoteDataSource {
  Future<List<ProductDto>> fetchProducts({String? category, int page, int limit});
  Future<ProductDto> fetchProduct(String id);
  Future<List<ProductDto>> searchProducts(String query);
  Future<ProductDto> createProduct(ProductDto dto);
  Future<ProductDto> updateProduct(String id, ProductDto dto);
  Future<void> deleteProduct(String id);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final Dio _dio;
  ProductRemoteDataSourceImpl(this._dio);

  @override
  Future<List<ProductDto>> fetchProducts({
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get(
      '/products',
      queryParameters: {
        'page':  page,
        'limit': limit,
        if (category != null) 'category': category,
      },
    );
    return (response.data['data'] as List)
        .map((json) => ProductDto.fromJson(json))
        .toList();
  }

  @override
  Future<ProductDto> fetchProduct(String id) async {
    final response = await _dio.get('/products/$id');
    return ProductDto.fromJson(response.data);
  }

  @override
  Future<List<ProductDto>> searchProducts(String query) async {
    final response = await _dio.get('/products/search', queryParameters: {'q': query});
    return (response.data['data'] as List)
        .map((json) => ProductDto.fromJson(json))
        .toList();
  }

  @override
  Future<ProductDto> createProduct(ProductDto dto) async {
    final response = await _dio.post('/products', data: dto.toJson());
    return ProductDto.fromJson(response.data);
  }

  @override
  Future<ProductDto> updateProduct(String id, ProductDto dto) async {
    final response = await _dio.put('/products/$id', data: dto.toJson());
    return ProductDto.fromJson(response.data);
  }

  @override
  Future<void> deleteProduct(String id) async {
    await _dio.delete('/products/$id');
  }
}
```

#### Repository 구현체

```dart
// features/product/data/repositories/product_repository_impl.dart
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource _remote;
  final ProductLocalDataSource  _local;

  ProductRepositoryImpl({
    required ProductRemoteDataSource remote,
    required ProductLocalDataSource  local,
  }) : _remote = remote, _local = local;

  @override
  Future<Either<Failure, List<Product>>> getProducts({
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final dtos = await _remote.fetchProducts(
        category: category, page: page, limit: limit,
      );
      final products = dtos.map((d) => d.toDomain()).toList();
      await _local.cacheProducts(products);        // 캐시 저장
      return Right(products);
    } on DioException catch (e) {
      // 네트워크 실패 → 캐시 반환
      final cached = await _local.getCachedProducts(category: category);
      if (cached.isNotEmpty) return Right(cached);
      return Left(_mapDioError(e));
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Product>> getProduct(String id) async {
    try {
      final dto = await _remote.fetchProduct(id);
      return Right(dto.toDomain());
    } on DioException catch (e) {
      // 캐시에서 단일 상품 조회 시도
      final cached = await _local.getCachedProduct(id);
      if (cached != null) return Right(cached);
      return Left(_mapDioError(e));
    }
  }

  @override
  Future<Either<Failure, List<Product>>> searchProducts(String query) async {
    try {
      final dtos = await _remote.searchProducts(query);
      return Right(dtos.map((d) => d.toDomain()).toList());
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    }
  }

  @override
  Future<Either<Failure, Product>> createProduct(Product product) async {
    try {
      final dto = await _remote.createProduct(ProductDto.fromDomain(product));
      return Right(dto.toDomain());
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    }
  }

  @override
  Future<Either<Failure, Product>> updateProduct(Product product) async {
    try {
      final dto = await _remote.updateProduct(
        product.id, ProductDto.fromDomain(product),
      );
      return Right(dto.toDomain());
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    }
  }

  @override
  Future<Either<Failure, Unit>> deleteProduct(String id) async {
    try {
      await _remote.deleteProduct(id);
      await _local.removeProduct(id);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    }
  }

  Failure _mapDioError(DioException e) => switch (e.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.connectionError   => const NetworkFailure(),
    DioExceptionType.badResponse       => switch (e.response?.statusCode) {
      401 => const UnauthorizedFailure(),
      404 => const NotFoundFailure(),
      _   => const ServerFailure(),
    },
    _ => UnknownFailure(e.message ?? '알 수 없는 오류'),
  };
}
```

---

### 3.6 Presentation Layer: ViewModel + UI 연결

```dart
// features/product/presentation/providers/product_list_notifier.dart
final productListProvider =
    AsyncNotifierProvider<ProductListNotifier, List<Product>>(
  ProductListNotifier.new,
);

class ProductListNotifier extends AsyncNotifier<List<Product>> {
  String? _category;

  @override
  Future<List<Product>> build() => _fetch();

  Future<List<Product>> _fetch() async {
    final useCase = ref.read(getProductsUseCaseProvider);
    final result = await useCase(category: _category);

    return result.fold(
      (failure) => throw failure.message,  // AsyncError 상태로 전환
      (products) => products,              // AsyncData 상태로 전환
    );
  }

  void filterByCategory(String? category) {
    _category = category;
    ref.invalidateSelf();  // 다시 build() 호출
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }
}

// features/product/presentation/screens/product_list_screen.dart
class ProductListScreen extends ConsumerWidget {
  const ProductListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('상품 목록')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(error.toString()),
              ElevatedButton(
                onPressed: () => ref.read(productListProvider.notifier).refresh(),
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),
        data: (products) => RefreshIndicator(
          onRefresh: () => ref.read(productListProvider.notifier).refresh(),
          child: ListView.builder(
            itemCount: products.length,
            itemBuilder: (_, i) => ProductCard(product: products[i]),
          ),
        ),
      ),
    );
  }
}
```

---

## 4. 사례 연구

### 4.1 API 교체 시 Domain 불변 검증

![REST에서 GraphQL 교체 시나리오](/developer-open-book/diagrams/flutter-step21-api-migration.svg)

---

### 4.2 테스트 용이성: Mock Repository 활용

Clean Architecture의 최대 강점 중 하나는 테스트가 쉽다는 것이다.

```dart
// test/features/product/application/get_products_use_case_test.dart
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';

@GenerateMocks([ProductRepository])
void main() {
  late GetProductsUseCase useCase;
  late MockProductRepository mockRepository;

  setUp(() {
    mockRepository = MockProductRepository();
    useCase = GetProductsUseCase(mockRepository);
  });

  test('품절 상품이 목록 하단으로 이동하는가', () async {
    // Arrange: Mock 데이터 설정
    when(mockRepository.getProducts()).thenAnswer((_) async => Right([
      const Product(id: '1', name: '재고 있음', price: 1000, stockCount: 10),
      const Product(id: '2', name: '품절',     price: 2000, stockCount: 0),
      const Product(id: '3', name: '재고 있음', price: 3000, stockCount: 5),
    ]));

    // Act
    final result = await useCase();

    // Assert
    expect(result.isRight(), true);
    final products = result.getOrElse((_) => []);
    expect(products.first.isInStock, true);   // 첫 번째는 재고 있는 상품
    expect(products.last.isInStock,  false);  // 마지막은 품절 상품
  });

  test('빈 카테고리 문자열이 null로 정규화되는가', () async {
    when(mockRepository.getProducts(category: null))
        .thenAnswer((_) async => const Right([]));

    await useCase(category: '  ');  // 공백 카테고리

    verify(mockRepository.getProducts(category: null)).called(1);
  });
}
```

**네트워크 없이 테스트 가능:**

```dart
// Repository를 Mock으로 교체하면 실제 API 없이 테스트 완료
// Domain Layer는 순수 Dart → 아주 빠른 테스트 실행
```

---

### 4.3 Failure sealed class 계층 설계

```dart
// core/errors/failure.dart
sealed class Failure {
  final String message;
  const Failure(this.message);
}

// 네트워크 관련
class NetworkFailure      extends Failure { const NetworkFailure()      : super('인터넷 연결을 확인해주세요'); }
class TimeoutFailure      extends Failure { const TimeoutFailure()      : super('요청 시간이 초과되었습니다'); }

// 서버 관련
class ServerFailure       extends Failure { const ServerFailure()       : super('서버 오류가 발생했습니다'); }
class UnauthorizedFailure extends Failure { const UnauthorizedFailure() : super('로그인이 필요합니다'); }
class NotFoundFailure     extends Failure { const NotFoundFailure()     : super('찾을 수 없습니다'); }

// 클라이언트 관련
class ValidationFailure   extends Failure {
  const ValidationFailure(String message) : super(message);
}
class CacheFailure        extends Failure { const CacheFailure()        : super('로컬 저장 오류'); }
class UnknownFailure      extends Failure {
  const UnknownFailure(String message) : super(message);
}

// UI에서 switch로 타입 안전하게 처리
Widget buildError(Failure failure) => switch (failure) {
  NetworkFailure()      => const NetworkErrorView(),
  UnauthorizedFailure() => const LoginRequiredView(),
  NotFoundFailure()     => const NotFoundView(),
  ValidationFailure f   => Text(f.message),
  _                     => const GenericErrorView(),
};
```

---

## 5. 실습

### 5.1 Clean Architecture로 간단한 Todo 앱 구현

```dart
// ─── Domain Layer ───────────────────────────────────

// domain/entities/todo.dart
class Todo {
  final String id;
  final String title;
  final bool isCompleted;
  final DateTime createdAt;

  const Todo({
    required this.id,
    required this.title,
    required this.isCompleted,
    required this.createdAt,
  });

  bool get isOverdue =>
      !isCompleted && DateTime.now().difference(createdAt).inDays > 7;

  Todo copyWith({String? title, bool? isCompleted}) => Todo(
    id:          id,
    title:       title ?? this.title,
    isCompleted: isCompleted ?? this.isCompleted,
    createdAt:   createdAt,
  );
}

// domain/repositories/todo_repository.dart
abstract interface class TodoRepository {
  Future<List<Todo>> getTodos();
  Future<Todo> createTodo(String title);
  Future<Todo> toggleTodo(String id);
  Future<void> deleteTodo(String id);
}

// ─── Application Layer ──────────────────────────────

// application/get_todos_use_case.dart
class GetTodosUseCase {
  final TodoRepository _repo;
  GetTodosUseCase(this._repo);

  Future<List<Todo>> call() async {
    final todos = await _repo.getTodos();
    // 비즈니스 규칙: 미완료 → 완료 순서, 같은 그룹 내 최신 순
    return [
      ...todos.where((t) => !t.isCompleted)
              .toList()..sort((a, b) => b.createdAt.compareTo(a.createdAt)),
      ...todos.where((t) => t.isCompleted)
              .toList()..sort((a, b) => b.createdAt.compareTo(a.createdAt)),
    ];
  }
}

// application/create_todo_use_case.dart
class CreateTodoUseCase {
  final TodoRepository _repo;
  CreateTodoUseCase(this._repo);

  Future<Todo> call(String title) async {
    if (title.trim().isEmpty) throw '할 일을 입력해주세요';
    if (title.trim().length > 100) throw '100자 이내로 입력해주세요';
    return _repo.createTodo(title.trim());
  }
}

// ─── Data Layer ─────────────────────────────────────

// data/repositories/todo_repository_impl.dart
class TodoRepositoryImpl implements TodoRepository {
  final List<Todo> _todos = [];  // 인메모리 저장 (실습용)

  @override
  Future<List<Todo>> getTodos() async => List.unmodifiable(_todos);

  @override
  Future<Todo> createTodo(String title) async {
    final todo = Todo(
      id:          DateTime.now().millisecondsSinceEpoch.toString(),
      title:       title,
      isCompleted: false,
      createdAt:   DateTime.now(),
    );
    _todos.add(todo);
    return todo;
  }

  @override
  Future<Todo> toggleTodo(String id) async {
    final idx = _todos.indexWhere((t) => t.id == id);
    if (idx < 0) throw NotFoundException('할 일을 찾을 수 없습니다');
    final updated = _todos[idx].copyWith(isCompleted: !_todos[idx].isCompleted);
    _todos[idx] = updated;
    return updated;
  }

  @override
  Future<void> deleteTodo(String id) async {
    _todos.removeWhere((t) => t.id == id);
  }
}

// ─── Presentation Layer ──────────────────────────────

// presentation/providers/todo_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final todoRepositoryProvider = Provider<TodoRepository>(
  (ref) => TodoRepositoryImpl(),
);
final getTodosUseCaseProvider = Provider(
  (ref) => GetTodosUseCase(ref.read(todoRepositoryProvider)),
);
final createTodoUseCaseProvider = Provider(
  (ref) => CreateTodoUseCase(ref.read(todoRepositoryProvider)),
);

final todoListProvider =
    AsyncNotifierProvider<TodoListNotifier, List<Todo>>(TodoListNotifier.new);

class TodoListNotifier extends AsyncNotifier<List<Todo>> {
  @override
  Future<List<Todo>> build() =>
      ref.read(getTodosUseCaseProvider).call();

  Future<void> createTodo(String title) async {
    try {
      await ref.read(createTodoUseCaseProvider).call(title);
      state = AsyncData(await ref.read(getTodosUseCaseProvider).call());
    } catch (e) {
      // 에러 처리 — state는 유지하고 에러만 전달
      rethrow;
    }
  }

  Future<void> toggleTodo(String id) async {
    await ref.read(todoRepositoryProvider).toggleTodo(id);
    state = AsyncData(await ref.read(getTodosUseCaseProvider).call());
  }

  Future<void> deleteTodo(String id) async {
    await ref.read(todoRepositoryProvider).deleteTodo(id);
    state = AsyncData(await ref.read(getTodosUseCaseProvider).call());
  }
}

// presentation/screens/todo_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() => runApp(const ProviderScope(child: MaterialApp(home: TodoScreen())));

class TodoScreen extends ConsumerWidget {
  const TodoScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(todoListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Clean Architecture Todo')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (todos) => todos.isEmpty
            ? const Center(child: Text('할 일이 없습니다'))
            : ListView.builder(
                itemCount: todos.length,
                itemBuilder: (_, i) {
                  final todo = todos[i];
                  return ListTile(
                    leading: Checkbox(
                      value: todo.isCompleted,
                      onChanged: (_) =>
                          ref.read(todoListProvider.notifier).toggleTodo(todo.id),
                    ),
                    title: Text(
                      todo.title,
                      style: TextStyle(
                        decoration: todo.isCompleted
                            ? TextDecoration.lineThrough
                            : null,
                        color: todo.isCompleted ? Colors.grey : null,
                      ),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () =>
                          ref.read(todoListProvider.notifier).deleteTodo(todo.id),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('할 일 추가'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(hintText: '할 일 입력'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('취소')),
          FilledButton(
            onPressed: () async {
              try {
                await ref.read(todoListProvider.notifier).createTodo(controller.text);
                if (context.mounted) Navigator.pop(context);
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('$e')),
                  );
                }
              }
            },
            child: const Text('추가'),
          ),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- `TodoRepositoryImpl`을 `MockTodoRepository`로 교체해도 UseCase가 그대로 동작하는가?
- `GetTodosUseCase`는 Flutter SDK를 import하지 않는가?
- `TodoScreen`은 Repository를 직접 참조하지 않는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** Clean Architecture에서 Domain Layer가 Data Layer에 의존하지 않는데, Data Layer가 어떻게 Domain의 Repository 인터페이스를 구현할 수 있는가?

> **모범 답안:** 의존성 역전 원칙(DIP)을 적용한다. Domain은 Repository **인터페이스**를 선언하고, Data Layer의 Repository **구현체**가 그 인터페이스를 구현(`implements`)한다. 이때 의존 방향은 Data → Domain이다. Domain은 자신의 인터페이스를 선언할 뿐, Data Layer가 어떻게 구현하는지 알지 못한다.

---

**Q2. [Understand]** UseCase를 여러 비즈니스 동작을 합친 하나의 큰 클래스로 만들지 않고 개별 클래스로 분리하는 이유는?

> **모범 답안:** 단일 책임 원칙(SRP)을 적용하기 위해서다. 하나의 UseCase 클래스에 여러 비즈니스 동작을 넣으면, 하나의 시나리오를 수정할 때 다른 시나리오에 영향을 미칠 수 있다. 개별 UseCase 클래스는 독립적으로 테스트·수정·교체할 수 있으며, 어떤 비즈니스 시나리오가 존재하는지 파일 목록만 봐도 파악할 수 있어 가독성도 높아진다.

---

**Q3. [Evaluate]** 다음 코드에서 Clean Architecture 위반을 찾고 수정하라.

```dart
class GetProductsUseCase {
  final Dio _dio;  // ← 문제!
  GetProductsUseCase(this._dio);

  Future<List<Product>> call() async {
    final res = await _dio.get('/products');  // ← 문제!
    return (res.data as List).map(Product.fromJson).toList();
  }
}
```

> **모범 답안:** UseCase(Application Layer)가 `Dio`(Data Layer 외부 의존성)를 직접 사용하고 있다. 이는 의존성 규칙 위반이다. 수정 방법: UseCase는 `ProductRepository` 인터페이스(Domain Layer)에만 의존하고, API 호출은 `ProductRepositoryImpl`(Data Layer)이 담당하도록 분리한다.
>
> ```dart
> class GetProductsUseCase {
>   final ProductRepository _repository;  // ← 인터페이스 의존
>   GetProductsUseCase(this._repository);
>   Future<List<Product>> call() => _repository.getProducts();
> }
> ```

---

**Q4. [Apply]** Either 패턴에서 `result.fold()`의 두 파라미터가 각각 호출되는 시점을 설명하라.

> **모범 답안:** `fold(leftFn, rightFn)`. Either가 `Left`(실패)이면 `leftFn`이 호출되고, `Right`(성공)이면 `rightFn`이 호출된다. Clean Architecture에서 `Left`에는 `Failure`, `Right`에는 성공 데이터를 담으므로, `fold`의 첫 번째 파라미터는 에러 처리, 두 번째는 성공 처리를 담당한다.

---

**Q5. [Evaluate]** DTO와 Domain Entity를 구분하지 않고 하나의 클래스로 통합하면 어떤 문제가 발생하는가?

> **모범 답안:** ① API 응답 필드명 변경(예: `stock_count` → `inventory`)이 비즈니스 Entity까지 영향을 미쳐, Entity를 사용하는 UseCase·Presentation 코드도 수정해야 한다. ② API에서만 사용되는 `fromJson`·`toJson`이 Domain Entity에 포함되어 순수 비즈니스 객체에 외부 의존성이 생긴다. ③ 테스트 시 Entity를 생성하려면 JSON 형식을 알아야 하는 불필요한 복잡성이 발생한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Clean Architecture의 핵심**: Domain은 아무것도 의존하지 않는다. 모든 의존성은 Domain을 향한다.
- **Repository Pattern**: 데이터 출처를 인터페이스로 추상화해, 상위 계층이 API인지 DB인지 모르게 한다.
- **UseCase**: 하나의 비즈니스 시나리오 = 하나의 클래스. `call()` 메서드로 함수처럼 호출 가능.
- **Either 패턴**: 성공(Right)·실패(Left)를 타입 안전하게 표현. `fold()`로 두 케이스를 명시적으로 처리.
- **DTO vs Entity**: API 형식(DTO)과 비즈니스 모델(Entity)을 분리해 외부 변화가 Domain에 영향을 주지 않게 한다.
- **테스트 용이성**: Domain Layer는 순수 Dart → Mock으로 Repository를 교체해 서버 없이 빠른 단위 테스트 가능.

### 6.2 다음 Step 예고

- **Step 22 — Dependency Injection:** GetIt·Injectable·Riverpod Injector로 의존성 주입을 체계화해 Clean Architecture의 계층 간 연결을 자동화한다.

### 6.3 참고 자료

| 자료                       | 링크                                                 | 설명                         |
| -------------------------- | ---------------------------------------------------- | ---------------------------- |
| Clean Architecture (Book)  | <https://www.amazon.com/Clean-Architecture>            | Robert Martin 원서           |
| Flutter TDD Clean Arch     | <https://resocoder.com/flutter-clean-architecture-tdd> | 단계별 구현 시리즈           |
| fpdart 패키지              | <https://pub.dev/packages/fpdart>                      | Either·Option 등 함수형 타입 |
| mockito 패키지             | <https://pub.dev/packages/mockito>                     | Mock 객체 생성               |
| Very Good Ventures Flutter | <https://verygoodventures.com/blog>                    | 실무 Clean Arch 사례         |

### 6.4 FAQ

**Q. Either 패턴이 필수인가? try-catch로 대신하면 안 되는가?**

> try-catch도 가능하다. Either의 장점은 **컴파일 타임에 에러 처리를 강제**한다는 점이다. Either를 반환받은 호출 측은 `fold()`로 반드시 두 케이스를 처리해야 하므로 에러 처리 누락을 방지한다. 소규모 프로젝트나 팀이 함수형 스타일에 익숙하지 않다면 try-catch + sealed Failure 클래스 조합도 좋은 대안이다.

**Q. UseCase가 너무 많아지면 관리하기 어렵지 않은가?**

> UseCase 파일이 많아지는 것 자체가 문제가 아니다. 오히려 비즈니스 시나리오 목록이 파일 시스템에 명시적으로 드러나 가독성이 좋아진다. 관련 UseCase를 `application/` 폴더 아래에 모아두면 어떤 기능이 있는지 한눈에 파악할 수 있다.

**Q. Entity에 `fromJson`을 추가하면 안 되는가?**

> 권장하지 않는다. `fromJson`은 JSON이라는 외부 형식에 의존하는 코드다. Entity에 추가하면 API 응답 형식이 바뀔 때 Domain Entity도 수정해야 한다. DTO에서 `fromJson`을 처리하고 `toDomain()`으로 변환하는 방식이 관심사를 명확히 분리한다.

---

## 빠른 자가진단 체크리스트

- [ ] Clean Architecture의 의존성 규칙("의존성은 항상 Domain 방향")을 설명할 수 있는가?
- [ ] Repository Pattern이 데이터 출처를 추상화하는 방식을 코드로 설명할 수 있는가?
- [ ] UseCase를 개별 클래스로 분리하는 이유를 설명할 수 있는가?
- [ ] Either 패턴의 Left와 Right가 각각 무엇을 담는지 설명할 수 있는가?
- [ ] DTO와 Domain Entity를 분리해야 하는 이유를 설명할 수 있는가?
- [ ] Mock Repository로 UseCase를 테스트하는 방법을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: UseCase가 Dio를 직접 사용하면 안 되는 이유(의존성 방향 위반)를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: Entity에 fromJson을 추가하면 Domain이 외부 형식에 의존하게 된다는 것을 이해했는가?
