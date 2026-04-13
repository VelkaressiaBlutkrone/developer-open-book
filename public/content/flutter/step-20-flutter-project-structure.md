# Step 20 — Flutter 프로젝트 구조

> **파트:** 6️⃣ Flutter 아키텍처 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Analyzing → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Feature 기반 구조와 Layer 기반 구조의 차이와 각각의 장단점을 설명할 수 있다.
2. **[Understand]** 4개 계층(Presentation·Application·Domain·Data)의 책임과 의존성 방향 원칙을 설명할 수 있다.
3. **[Analyze]** 주어진 앱 요구사항을 분석해 적합한 프로젝트 구조를 설계할 수 있다.
4. **[Apply]** Feature 폴더 구조를 직접 생성하고 각 파일의 위치를 결정할 수 있다.
5. **[Evaluate]** 기존 프로젝트 구조의 문제점을 진단하고 개선 방향을 제시할 수 있다.

**전제 지식:** Step 12~15(상태관리), Step 17~18(HTTP·로컬 저장), Step 14(Provider·DI 개념)

---

## 1. 서론

### 1.1 프로젝트 구조가 중요한 이유

Flutter 입문 시 대부분 `lib/` 아래에 파일을 무작위로 배치한다. 앱이 커질수록 이 방식은 치명적인 문제를 낳는다.

```
나쁜 프로젝트 구조의 증상
──────────────────────────────────────────────────────
  "이 비즈니스 로직이 어느 파일에 있지?"
  "API 변경 시 수십 개 파일을 수정해야 한다"
  "이 위젯을 테스트하려면 서버가 필요하다"
  "새 팀원이 코드 구조를 이해하는 데 2주 걸린다"
  "기능 하나 추가했더니 다른 기능이 깨졌다"
──────────────────────────────────────────────────────
```

좋은 프로젝트 구조는 이 모든 문제를 예방한다.

### 1.2 두 가지 구조화 전략

![Layer vs Feature 구조 comparison](/developer-open-book/diagrams/step20-layer-vs-feature.svg)

### 1.3 전체 개념 지도

![의존성 방향](/developer-open-book/diagrams/step20-dependency-direction.svg)

---

## 2. 기본 개념과 용어

| 용어                   | 정의                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **Feature**            | 앱에서 하나의 독립적인 기능 단위. 예: 인증(auth)·상품(product)·장바구니(cart)                |
| **Presentation Layer** | UI를 담당하는 계층. Widget·Screen·ViewModel(Notifier/Cubit)을 포함                           |
| **Application Layer**  | 비즈니스 유스케이스를 조정하는 계층. 여러 Repository·Service를 조합해 하나의 시나리오를 처리 |
| **Domain Layer**       | 핵심 비즈니스 규칙과 Entity를 포함하는 계층. 외부(프레임워크·DB)에 의존하지 않음             |
| **Data Layer**         | 외부 데이터 소스(API·DB)와 통신하는 계층. Repository 구현체·DataSource·DTO 포함              |
| **Entity**             | 비즈니스 도메인의 핵심 개념을 표현하는 순수 Dart 객체. 프레임워크 의존성 없음                |
| **DTO**                | Data Transfer Object. API 응답·요청 형식을 표현하는 객체. fromJson/toJson 포함               |
| **Repository**         | 데이터 접근을 추상화하는 인터페이스(Domain) 및 구현체(Data)                                  |
| **UseCase**            | 하나의 구체적인 비즈니스 시나리오를 실행하는 단위 클래스                                     |
| **의존성 역전 원칙**   | 고수준 모듈(Domain)이 저수준 모듈(Data)에 의존하지 않도록 인터페이스로 추상화하는 원칙       |
| **Barrel file**        | 한 디렉토리의 모든 export를 모아두는 `{name}.dart` 파일 (import 단순화)                      |
| **core**               | 앱 전체에서 공통으로 사용하는 유틸리티·설정·공통 위젯을 모아두는 모듈                        |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Layer 기반 구조: 입문에서 중규모까지

```
lib/
├── main.dart
├── app.dart              ← MaterialApp 설정
│
├── models/               ← 데이터 모델
│     ├── user.dart
│     └── product.dart
│
├── services/             ← API 통신 서비스
│     ├── auth_service.dart
│     └── product_service.dart
│
├── repositories/         ← 데이터 접근 추상화
│     └── product_repository.dart
│
├── providers/            ← 상태관리 (Riverpod/Provider)
│     ├── auth_provider.dart
│     └── product_provider.dart
│
├── screens/              ← 화면 위젯
│     ├── home/
│     │     └── home_screen.dart
│     └── detail/
│           └── detail_screen.dart
│
├── widgets/              ← 재사용 공통 위젯
│     ├── product_card.dart
│     └── loading_view.dart
│
└── utils/                ← 유틸리티 함수
      ├── formatters.dart
      └── validators.dart
```

**Layer 구조의 장단점:**

| 항목      | 내용                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| 장점      | 이해하기 쉬움, 소규모 팀에 적합, 초기 속도 빠름                                   |
| 단점      | 기능 추가 시 여러 디렉토리에 분산, 팀 충돌 多, 기능 삭제 시 관련 파일 파악 어려움 |
| 적합 규모 | 1~3인 팀, 화면 10개 미만                                                          |

---

### 3.2 Feature 기반 구조: 중·대규모 표준

```
lib/
├── main.dart
├── app.dart
│
├── features/                      ← 기능별 분리
│     ├── auth/                    ← 인증 Feature
│     │     ├── presentation/
│     │     │     ├── screens/
│     │     │     │     ├── login_screen.dart
│     │     │     │     └── register_screen.dart
│     │     │     ├── widgets/
│     │     │     │     └── auth_form.dart
│     │     │     └── providers/
│     │     │           └── auth_notifier.dart
│     │     ├── application/
│     │     │     ├── login_use_case.dart
│     │     │     └── logout_use_case.dart
│     │     ├── domain/
│     │     │     ├── entities/
│     │     │     │     └── user.dart
│     │     │     └── repositories/
│     │     │           └── auth_repository.dart    ← 인터페이스
│     │     └── data/
│     │           ├── repositories/
│     │           │     └── auth_repository_impl.dart ← 구현체
│     │           ├── datasources/
│     │           │     ├── auth_remote_datasource.dart
│     │           │     └── auth_local_datasource.dart
│     │           └── dtos/
│     │                 └── user_dto.dart
│     │
│     ├── product/                 ← 상품 Feature
│     │     ├── presentation/
│     │     ├── application/
│     │     ├── domain/
│     │     └── data/
│     │
│     └── cart/                    ← 장바구니 Feature
│
└── core/                          ← 공통 모듈
      ├── network/
      │     ├── dio_client.dart
      │     └── interceptors/
      ├── storage/
      │     └── hive_service.dart
      ├── router/
      │     └── app_router.dart
      ├── theme/
      │     └── app_theme.dart
      ├── constants/
      │     └── api_constants.dart
      ├── errors/
      │     ├── app_exception.dart
      │     └── failure.dart
      └── widgets/                 ← 앱 공통 위젯
            ├── loading_overlay.dart
            └── error_view.dart
```

---

### 3.3 계층 책임과 의존성 방향

```
의존성 방향 (화살표 = 의존)
──────────────────────────────────────────────────────
  Presentation ──→ Application ──→ Domain
                                      ↑
  Data ──────────────────────────────→ Domain

  핵심 규칙: Domain은 아무것도 의존하지 않는다
  → Domain은 Dart 순수 코드로만 구성
  → Flutter SDK·Dio·Hive·Firebase 의존성 없음
  → 가장 쉽게 단위 테스트 가능
──────────────────────────────────────────────────────
```

#### Presentation Layer 책임

```dart
// features/product/presentation/screens/product_list_screen.dart
class ProductListScreen extends ConsumerWidget {
  const ProductListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productListProvider);
    // ✅ UI 렌더링만 담당
    // ✅ 비즈니스 로직 없음 → Notifier에 위임
    // ✅ 데이터 출처 몰라도 됨
    return state.when(
      loading: () => const LoadingView(),
      error: (e, _) => ErrorView(message: e.toString()),
      data: (products) => ProductGrid(products: products),
    );
  }
}

// features/product/presentation/providers/product_list_notifier.dart
class ProductListNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    // Application Layer의 UseCase를 통해 데이터 요청
    final useCase = ref.read(getProductListUseCaseProvider);
    return useCase.execute();
  }
}
```

#### Application Layer 책임

```dart
// features/product/application/get_product_list_use_case.dart
class GetProductListUseCase {
  final ProductRepository _repository;
  GetProductListUseCase(this._repository);

  // 하나의 비즈니스 시나리오를 실행
  Future<List<Product>> execute({String? category, int page = 1}) async {
    // 비즈니스 규칙 적용: 빈 카테고리는 null 처리
    final normalizedCategory = category?.isEmpty == true ? null : category;

    final products = await _repository.getProducts(
      category: normalizedCategory,
      page: page,
    );

    // 비즈니스 규칙: 재고 없는 상품은 목록 하단으로
    return [
      ...products.where((p) => p.inStock),
      ...products.where((p) => !p.inStock),
    ];
  }
}
```

#### Domain Layer 책임

```dart
// features/product/domain/entities/product.dart
// ✅ 순수 Dart — Flutter·Dio·Hive 의존성 없음
class Product {
  final String id;
  final String name;
  final double price;
  final bool inStock;
  final String? imageUrl;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.inStock,
    this.imageUrl,
  });

  // 비즈니스 규칙
  bool get isDiscounted => price < originalPrice;
  String get formattedPrice => '₩${price.toStringAsFixed(0)}';
}

// features/product/domain/repositories/product_repository.dart
// ✅ 인터페이스 — 구현 방법을 모름 (API인지 DB인지 모름)
abstract interface class ProductRepository {
  Future<List<Product>> getProducts({String? category, int page = 1});
  Future<Product> getProduct(String id);
  Future<void> updateProduct(Product product);
}
```

#### Data Layer 책임

```dart
// features/product/data/dtos/product_dto.dart
// DTO: API 응답 형식 표현 (fromJson/toJson)
class ProductDto {
  final String id;
  final String name;
  final double price;
  final bool inStock;
  final String? imageUrl;

  factory ProductDto.fromJson(Map<String, dynamic> json) => ProductDto(
    id:        json['id']       as String,
    name:      json['name']     as String,
    price:     (json['price']   as num).toDouble(),
    inStock:   json['in_stock'] as bool,
    imageUrl:  json['image_url'] as String?,
  );

  // DTO → Domain Entity 변환
  Product toDomain() => Product(
    id:        id,
    name:      name,
    price:     price,
    inStock:   inStock,
    imageUrl:  imageUrl,
  );
}

// features/product/data/repositories/product_repository_impl.dart
// ✅ Repository 인터페이스 구현
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource _remote;
  final ProductLocalDataSource  _local;

  ProductRepositoryImpl(this._remote, this._local);

  @override
  Future<List<Product>> getProducts({String? category, int page = 1}) async {
    try {
      final dtos = await _remote.fetchProducts(category: category, page: page);
      final products = dtos.map((dto) => dto.toDomain()).toList();
      await _local.cacheProducts(products); // 로컬 캐싱
      return products;
    } catch (_) {
      return _local.getCachedProducts();    // 실패 시 캐시 반환
    }
  }

  @override
  Future<Product> getProduct(String id) async {
    final dto = await _remote.fetchProduct(id);
    return dto.toDomain();
  }

  @override
  Future<void> updateProduct(Product product) async {
    await _remote.updateProduct(product);
  }
}
```

---

### 3.4 Barrel File: import 단순화

각 Feature에 `product.dart` barrel file을 만들면 import를 한 줄로 줄일 수 있다.

```dart
// features/product/product.dart (barrel file)
export 'domain/entities/product.dart';
export 'domain/repositories/product_repository.dart';
export 'application/get_product_list_use_case.dart';
export 'presentation/screens/product_list_screen.dart';
export 'presentation/providers/product_list_notifier.dart';

// 사용 측 — 한 줄 import
import 'package:my_app/features/product/product.dart';
```

---

### 3.5 core 모듈 구성

```dart
// core/network/dio_client.dart
class DioClient {
  static final DioClient _instance = DioClient._();
  factory DioClient() => _instance;
  DioClient._() { _init(); }

  late final Dio dio;

  void _init() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
    ));
    dio.interceptors.addAll([
      AuthInterceptor(),
      LoggingInterceptor(),
    ]);
  }
}

// core/errors/failure.dart
// 앱 전체 공통 에러 타입
sealed class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure   extends Failure { const NetworkFailure()   : super('네트워크 오류'); }
class ServerFailure    extends Failure { const ServerFailure()    : super('서버 오류'); }
class CacheFailure     extends Failure { const CacheFailure()     : super('캐시 오류'); }
class NotFoundFailure  extends Failure { const NotFoundFailure()  : super('찾을 수 없음'); }
class UnauthorizedFailure extends Failure { const UnauthorizedFailure() : super('인증 필요'); }
```

---

### 3.6 구조 선택 가이드

| 상황                     | 권장 구조                         |
| ------------------------ | --------------------------------- |
| 1인 개발, 화면 5~10개    | Layer 기반 (단순)                 |
| 3인 팀, 화면 10~30개     | Feature + Layer 혼합              |
| 5인 이상, 화면 30개 이상 | Feature 기반 + Clean Architecture |
| 마이크로프론트엔드 필요  | Feature → 패키지 분리             |

---

## 4. 사례 연구

### 4.1 Airbnb 클론: Feature 구조 설계

```
Airbnb 클론 Feature 분해
──────────────────────────────────────────────────────
  features/
  ├── auth/          로그인·회원가입·소셜 로그인
  ├── search/        날짜·인원·지역 검색
  ├── listing/       숙소 목록·상세·사진
  ├── booking/       예약·결제·확인
  ├── host/          호스트 관리·등록
  ├── message/       메시지·알림
  └── profile/       프로필·리뷰·설정

  core/
  ├── network/       Dio + Auth Interceptor
  ├── maps/          Google Maps 설정
  ├── payment/       결제 SDK
  └── analytics/     Firebase Analytics
──────────────────────────────────────────────────────
```

**API 교체 시 유지보수 효과:**

```
기존 REST API → GraphQL로 교체할 때

Feature 기반 + Repository 패턴:
  변경 파일: data/datasources/listing_remote_datasource.dart
  변경 없는 파일: domain/entities/, application/, presentation/ 전부

Layer 기반 (비구조화):
  변경 파일: services/listing_service.dart + 이를 호출하는 모든 화면
  → 10+ 파일 수정 필요
```

---

### 4.2 팀별 Feature 분담

```
5인 팀에서 Feature 기반 구조의 협업 효과
──────────────────────────────────────────────────────
  팀원 A → features/auth/    담당
  팀원 B → features/search/  담당
  팀원 C → features/listing/ 담당
  팀원 D → features/booking/ 담당
  팀원 E → core/             담당

  → 각 팀원이 자신의 Feature 폴더만 수정
  → Git 충돌 최소화
  → 다른 팀원 코드 이해 없이 독립 개발 가능
──────────────────────────────────────────────────────
```

---

### 4.3 점진적 마이그레이션: Layer → Feature

기존 Layer 구조를 Feature 구조로 점진적으로 전환하는 전략이다.

```
1단계: core/ 모듈 분리 (1주)
  network, storage, theme, router를 core/로 이동

2단계: Feature 디렉토리 생성 (2주)
  가장 독립적인 Feature(예: auth)부터 이동
  나머지는 기존 Layer 구조 유지

3단계: 순차 이동 (n주)
  Feature별로 하나씩 이동
  각 이동 후 테스트로 회귀 검증

4단계: 기존 Layer 디렉토리 제거
  모든 Feature 이동 완료 후 models/, services/ 삭제
```

---

## 5. 실습

### 5.1 Feature 폴더 구조 생성

터미널에서 아래 명령으로 Step 20의 목표 구조를 직접 생성한다.

```bash
# Flutter 프로젝트 생성
flutter create shop_app
cd shop_app

# Feature 기반 디렉토리 구조 생성
mkdir -p lib/features/auth/{presentation/{screens,widgets,providers},application,domain/{entities,repositories},data/{repositories,datasources,dtos}}
mkdir -p lib/features/product/{presentation/{screens,widgets,providers},application,domain/{entities,repositories},data/{repositories,datasources,dtos}}
mkdir -p lib/features/cart/{presentation/{screens,widgets,providers},application,domain/{entities,repositories},data/{repositories,datasources,dtos}}
mkdir -p lib/core/{network/{interceptors},storage,router,theme,constants,errors,widgets}
```

**생성 후 확인:**

```bash
find lib/ -type d | sort
```

---

### 5.2 Domain Entity와 Repository 인터페이스 작성

아래 코드를 직접 작성하며 계층 분리를 체험한다.

```dart
// lib/features/product/domain/entities/product.dart
class Product {
  final String id;
  final String name;
  final double price;
  final int stockCount;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.stockCount,
  });

  // 비즈니스 규칙을 Entity 안에서 표현
  bool get isInStock => stockCount > 0;
  bool get isLowStock => stockCount > 0 && stockCount <= 5;
  String get formattedPrice => '₩${price.toStringAsFixed(0)}';
}

// lib/features/product/domain/repositories/product_repository.dart
abstract interface class ProductRepository {
  Future<List<Product>> getProducts();
  Future<Product?> findById(String id);
}

// lib/features/product/data/dtos/product_dto.dart
class ProductDto {
  final String id;
  final String name;
  final double price;
  final int stockCount;

  const ProductDto({
    required this.id,
    required this.name,
    required this.price,
    required this.stockCount,
  });

  factory ProductDto.fromJson(Map<String, dynamic> json) => ProductDto(
    id:         json['id']          as String,
    name:       json['name']        as String,
    price:      (json['price']      as num).toDouble(),
    stockCount: json['stock_count'] as int,
  );

  Product toDomain() => Product(
    id:         id,
    name:       name,
    price:      price,
    stockCount: stockCount,
  );
}

// lib/features/product/data/repositories/product_repository_impl.dart
class ProductRepositoryImpl implements ProductRepository {
  // Mock 데이터 (실제로는 RemoteDataSource 주입)
  @override
  Future<List<Product>> getProducts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      const Product(id: '1', name: 'Flutter 책',    price: 32000, stockCount: 15),
      const Product(id: '2', name: 'Dart 완전정복',  price: 28000, stockCount: 3),
      const Product(id: '3', name: '클린코드',       price: 26000, stockCount: 0),
    ];
  }

  @override
  Future<Product?> findById(String id) async {
    final products = await getProducts();
    try {
      return products.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }
}
```

---

### 5.3 자가 평가 퀴즈

**Q1. [Understand]** Domain Layer가 Flutter SDK·Dio·Hive에 의존하지 않아야 하는 이유는?

> **모범 답안:** Domain Layer는 앱의 핵심 비즈니스 규칙을 담는 계층이다. 프레임워크나 외부 라이브러리에 의존하면, 예를 들어 Dio를 다른 HTTP 클라이언트로 교체할 때 Domain Layer도 수정해야 한다. 의존성이 없어야 비즈니스 로직이 외부 변화에 독립적으로 유지되며, 순수 Dart 코드이므로 Flutter 없이도 단위 테스트가 가능하다.

---

**Q2. [Understand]** DTO와 Domain Entity를 분리하는 이유는?

- A) 코드량을 늘려 프로젝트를 크게 만들기 위해
- B) API 응답 형식과 비즈니스 모델 형식을 분리해 각자 변화에 독립적으로 대응하기 위해 ✅
- C) Dart 언어가 하나의 클래스에 fromJson과 비즈니스 로직을 함께 정의하지 못하기 때문에
- D) 테스트 코드 작성을 더 어렵게 만들기 위해

---

**Q3. [Analyze]** 다음 코드가 어느 계층에 속해야 하는지 판단하고 이유를 서술하라.

```dart
class GetDiscountedProductsUseCase {
  final ProductRepository _repository;
  GetDiscountedProductsUseCase(this._repository);

  Future<List<Product>> execute() async {
    final all = await _repository.getProducts();
    return all.where((p) => p.discountRate > 0).toList();
  }
}
```

> **모범 답안:** **Application Layer**에 속한다. 이 클래스는 Repository 인터페이스를 사용해(의존성 역전) 데이터를 가져오고, "할인율이 있는 상품만 필터링"이라는 비즈니스 시나리오를 실행한다. UI(Presentation)와는 분리되어 있고, 데이터 접근 구현(Data)도 몰라도 된다. Application Layer는 UseCase처럼 특정 사용 시나리오를 조정하는 역할을 한다.

---

**Q4. [Apply]** Feature 기반 구조에서 `cart` Feature의 폴더 구조를 설계하고, 장바구니에 상품을 추가하는 흐름(UI → Notifier → UseCase → Repository)을 순서대로 서술하라.

```
// 폴더 구조
features/cart/
├── presentation/
│     ├── screens/cart_screen.dart
│     ├── widgets/cart_item_tile.dart
│     └── providers/cart_notifier.dart
├── application/
│     └── add_to_cart_use_case.dart
├── domain/
│     ├── entities/cart_item.dart
│     └── repositories/cart_repository.dart
└── data/
      ├── repositories/cart_repository_impl.dart
      └── datasources/cart_local_datasource.dart

// 흐름 서술
1. CartScreen의 "담기" 버튼 탭
2. CartNotifier.addItem(product) 호출 (Presentation → Application)
3. AddToCartUseCase.execute(product) 실행 — 비즈니스 규칙 적용
4. CartRepository.addItem(cartItem) 호출 (Application → Domain 인터페이스)
5. CartRepositoryImpl이 CartLocalDataSource를 통해 Hive에 저장
6. Notifier state 갱신 → CartScreen rebuild
```

---

**Q5. [Evaluate]** 아래 프로젝트 구조의 문제점을 2가지 이상 찾아 개선 방향을 제시하라.

```
lib/
├── api_service.dart          ← Dio 요청 + JSON 파싱 + 비즈니스 로직 혼재
├── home_screen.dart          ← API 직접 호출
├── product_detail_screen.dart ← API 직접 호출
├── cart_screen.dart
├── product.dart              ← 모델
└── main.dart
```

> **모범 답안:**
>
> 1. **관심사 분리 부재**: `api_service.dart`에 HTTP 통신·JSON 파싱·비즈니스 로직이 혼재되어 하나를 수정하면 나머지에 영향을 미친다. DataSource·Repository·UseCase로 분리해야 한다.
> 2. **화면이 API를 직접 호출**: `home_screen.dart`가 API를 직접 호출하면 UI를 테스트할 때 실제 서버가 필요하다. 화면은 Notifier/Cubit에게 위임하고, 데이터 출처를 모르도록 해야 한다.
> 3. **확장 불가한 평면 구조**: 기능이 추가될 때마다 `lib/` 루트에 파일이 쌓인다. Feature 기반 구조로 전환해 기능별로 독립적인 디렉토리를 갖도록 해야 한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Layer 구조**는 소규모 앱에 단순하고 좋지만, 팀 규모가 커질수록 기능 변경 시 여러 디렉토리에 걸친 수정이 필요해 관리가 어려워진다.
- **Feature 기반 구조**는 기능별로 완전히 독립된 모듈을 구성해 팀 협업·테스트·유지보수에 유리하다.
- **계층 책임 분리**: Presentation(UI) → Application(UseCase) → Domain(순수 비즈니스) ← Data(API·DB). Domain은 아무것도 의존하지 않는다.
- **DTO와 Entity 분리**: API 형식(DTO)과 비즈니스 모델(Entity)을 분리해 외부 변화가 비즈니스 로직에 영향을 주지 않도록 한다.
- **core 모듈**: Dio·Hive·Router·Theme 등 앱 전체 공통 인프라를 한 곳에서 관리한다.

### 6.2 다음 Step 예고

- **Step 21 — Clean Architecture:** Repository Pattern, UseCase, Domain Layer를 본격적으로 구현하며 Clean Architecture의 핵심 원칙을 실습한다.

### 6.3 참고 자료

| 자료                              | 링크                                                                        | 설명                        |
| --------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| Very Good Ventures — Flutter 구조 | <https://verygoodventures.com/blog/very-good-ventures-flutter-architecture> | 실무 아키텍처 가이드        |
| Flutter Clean Architecture        | <https://resocoder.com/flutter-clean-architecture-tdd>                      | 단계별 구현 튜토리얼        |
| Feature First Architecture        | <https://codewithandrea.com/articles/flutter-project-structure>             | Feature 기반 구조 심층 분석 |
| Riverpod Architecture             | <https://riverpod.dev/docs/concepts/combining_providers>                    | Riverpod + Clean Arch       |
| Flutter Starter Architecture      | <https://github.com/VeryGoodOpenSource/very_good_cli>                       | VGV CLI 구조 템플릿         |

### 6.4 FAQ

**Q. Feature가 다른 Feature에 의존해야 할 때는?**

> Feature 간 직접 의존은 피하는 것이 원칙이다. 공통으로 필요한 것은 `core/`로 이동하거나, `shared/` 폴더를 만들어 공유한다. 어쩔 수 없이 Feature 간 통신이 필요하면 Domain Layer의 인터페이스를 통해 간접 의존한다.

**Q. 모든 프로젝트에 Clean Architecture가 필요한가?**

> 아니다. 과도한 계층 분리는 소규모 앱에서 오히려 복잡도를 높인다. "이 앱이 팀 프로젝트이고, 6개월 이상 유지보수할 것인가?"라는 질문에 YES라면 투자할 가치가 있다. 1인 개발 소규모 앱이라면 Layer 기반 구조로 충분하다.

**Q. feature 폴더 안의 presentation·application·domain·data를 언제부터 나눠야 하는가?**

> 프로젝트 시작부터 나누는 것이 가장 좋다. 나중에 나누려면 많은 리팩토링이 필요하다. 단, 화면이 1~2개뿐인 Feature는 계층을 간소화해도 된다. Feature 내부에서도 점진적으로 계층을 추가할 수 있다.

---

## 빠른 자가진단 체크리스트

- [ ] Layer 기반과 Feature 기반 구조의 차이를 설명할 수 있는가?
- [ ] 4개 계층(Presentation·Application·Domain·Data)의 역할을 설명할 수 있는가?
- [ ] 의존성 방향 원칙("Domain은 아무것도 의존하지 않는다")을 설명할 수 있는가?
- [ ] DTO와 Domain Entity를 분리하는 이유를 설명할 수 있는가?
- [ ] Feature 기반 폴더 구조를 직접 생성할 수 있는가?
- [ ] core/ 모듈에 들어가야 하는 것과 feature/에 들어가야 하는 것을 구분할 수 있는가?
- [ ] ⚠️ 함정 체크: Presentation Layer가 Repository나 DataSource를 직접 참조하면 안 되는 이유를 설명할 수 있는가?
