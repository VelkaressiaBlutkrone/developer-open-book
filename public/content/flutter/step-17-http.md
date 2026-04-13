# Step 17 — HTTP 통신

> **파트:** 5️⃣ 비동기 및 데이터 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** REST API의 구조(HTTP 메서드·상태 코드·헤더·바디)를 설명할 수 있다.
2. **[Understand]** Dio와 http 패키지의 차이와 Dio를 선택해야 하는 이유를 설명할 수 있다.
3. **[Understand]** Dio 인터셉터가 요청·응답 파이프라인에서 하는 역할을 설명할 수 있다.
4. **[Apply]** Dio로 GET·POST·PUT·DELETE 요청을 구현할 수 있다.
5. **[Apply]** JSON 응답을 Dart 모델 클래스로 파싱하고 직렬화할 수 있다.
6. **[Apply]** 토큰 갱신·에러 처리 인터셉터를 구현할 수 있다.
7. **[Analyze]** REST와 GraphQL의 차이와 각각의 적합한 사용 시나리오를 분석할 수 있다.

**전제 지식:** Step 02(async/await·Future), Step 16(FutureBuilder), Step 15(Riverpod - 선택적)

---

## 1. 서론

### 1.1 HTTP 통신이 앱에서 하는 역할

모바일 앱의 대부분 기능은 서버와의 데이터 교환에 의존한다.

```
앱 ←→ 서버 통신 흐름
──────────────────────────────────────────────────────
  앱                          서버
  ───                         ─────
  "상품 목록 줘"  ──GET /products──→  데이터베이스 조회
                ←──JSON 응답────────  JSON 반환
  JSON 파싱 → Dart 모델
  UI에 표시
──────────────────────────────────────────────────────
```

### 1.2 Flutter HTTP 패키지 비교

| 항목                | http         | Dio      |
| ------------------- | ------------ | -------- |
| 제공사              | Dart 팀 공식 | 서드파티 |
| 인터셉터            | ❌           | ✅       |
| 취소(cancel)        | ❌           | ✅       |
| 폼데이터            | 제한적       | ✅       |
| 파일 업로드         | 복잡         | ✅ 간편  |
| 타임아웃 설정       | 제한적       | ✅ 세밀  |
| 기본 설정 (baseUrl) | 매번 직접    | ✅       |
| 추천 용도           | 단순 요청    | 실무 앱  |

**결론:** 실무에서는 **Dio**를 사용한다.

### 1.3 전체 개념 지도

![HTTP 통신 hierarchy](/developer-open-book/diagrams/step17-http-system.svg)

---

## 2. 기본 개념과 용어

| 용어                | 정의                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **REST**            | Representational State Transfer. URL로 자원을 식별하고 HTTP 메서드로 행위를 표현하는 API 설계 원칙 |
| **Endpoint**        | API에서 특정 자원에 접근하는 URL 경로 (예: `/api/v1/products`)                                     |
| **HTTP 메서드**     | GET(조회)·POST(생성)·PUT(전체 수정)·PATCH(일부 수정)·DELETE(삭제)                                  |
| **상태 코드**       | 서버 응답의 처리 결과를 나타내는 3자리 숫자 (200 성공, 401 인증 실패, 500 서버 오류 등)            |
| **Header**          | 요청/응답의 메타데이터. 인증 토큰(Authorization), 콘텐츠 타입(Content-Type) 등 포함                |
| **Query Parameter** | URL 뒤에 `?key=value` 형태로 추가하는 파라미터 (검색어, 페이지 번호 등)                            |
| **Path Parameter**  | URL 경로에 직접 포함되는 파라미터 (예: `/users/42`의 `42`)                                         |
| **Dio**             | Flutter에서 가장 많이 사용하는 HTTP 클라이언트 패키지                                              |
| **BaseOptions**     | Dio의 기본 설정 객체. baseUrl·timeout·headers 등을 일괄 설정                                       |
| **Interceptor**     | 모든 요청 또는 응답을 가로채 공통 로직(토큰 첨부, 로깅, 에러 처리)을 처리하는 컴포넌트             |
| **DioException**    | Dio에서 발생하는 예외 클래스. type으로 오류 원인 분류 가능                                         |
| **fromJson**        | JSON Map을 Dart 객체로 변환하는 팩토리 생성자 패턴                                                 |
| **toJson**          | Dart 객체를 JSON Map으로 변환하는 메서드 패턴                                                      |
| **GraphQL**         | 클라이언트가 필요한 데이터 구조를 직접 쿼리로 명시하는 API 기술. Over-fetching 해결                |
| **ferry**           | Flutter용 GraphQL 클라이언트 패키지                                                                |

---

## 3. 이론적 배경과 원리 ★

### 3.1 REST API 구조 이해

#### HTTP 메서드와 CRUD 매핑

```
CRUD          HTTP 메서드   URL 예시               설명
──────────    ───────────   ───────────────────    ─────────────
Create   →    POST          /api/products          새 상품 생성
Read     →    GET           /api/products          전체 목록 조회
             GET           /api/products/42        단일 조회
Update   →    PUT           /api/products/42        전체 수정
             PATCH         /api/products/42        일부 수정
Delete   →    DELETE        /api/products/42        삭제
```

#### HTTP 상태 코드 핵심 정리

| 코드 | 의미                               | 대응 방법             |
| ---- | ---------------------------------- | --------------------- |
| 200  | OK — 성공                          | 데이터 표시           |
| 201  | Created — 생성 성공                | 생성된 리소스 처리    |
| 204  | No Content — 성공, 내용 없음       | 삭제 성공 등          |
| 400  | Bad Request — 잘못된 요청          | 입력값 재검증         |
| 401  | Unauthorized — 인증 필요           | 로그인 화면 이동      |
| 403  | Forbidden — 권한 없음              | 권한 안내 메시지      |
| 404  | Not Found — 자원 없음              | "찾을 수 없음" 화면   |
| 422  | Unprocessable Entity — 유효성 실패 | 폼 에러 표시          |
| 500  | Internal Server Error — 서버 오류  | "잠시 후 재시도" 안내 |

---

### 3.2 Dio 기본 설정과 싱글톤 패턴

```dart
// api_client.dart — 앱 전체에서 재사용하는 Dio 싱글톤
import 'package:dio/dio.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal() {
    _init();
  }

  late final Dio _dio;

  Dio get dio => _dio;

  void _init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: 'https://api.example.com/v1',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // 인터셉터 등록
    _dio.interceptors.addAll([
      AuthInterceptor(),
      LoggingInterceptor(),
      ErrorInterceptor(),
    ]);
  }
}

// 사용
final client = ApiClient().dio;
```

---

### 3.3 Dio 요청 메서드 전체

```dart
class ProductRepository {
  final Dio _dio = ApiClient().dio;

  // ① GET — 목록 조회
  Future<List<Product>> getProducts({
    int page = 1,
    int limit = 20,
    String? category,
  }) async {
    final response = await _dio.get(
      '/products',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (category != null) 'category': category,
      },
    );
    final list = response.data['data'] as List;
    return list.map((json) => Product.fromJson(json)).toList();
  }

  // ② GET — 단일 조회 (Path Parameter)
  Future<Product> getProduct(int id) async {
    final response = await _dio.get('/products/$id');
    return Product.fromJson(response.data);
  }

  // ③ POST — 생성
  Future<Product> createProduct(Map<String, dynamic> data) async {
    final response = await _dio.post('/products', data: data);
    return Product.fromJson(response.data);
  }

  // ④ PUT — 전체 수정
  Future<Product> updateProduct(int id, Map<String, dynamic> data) async {
    final response = await _dio.put('/products/$id', data: data);
    return Product.fromJson(response.data);
  }

  // ⑤ PATCH — 일부 수정
  Future<Product> patchProduct(int id, Map<String, dynamic> data) async {
    final response = await _dio.patch('/products/$id', data: data);
    return Product.fromJson(response.data);
  }

  // ⑥ DELETE — 삭제
  Future<void> deleteProduct(int id) async {
    await _dio.delete('/products/$id');
  }

  // ⑦ 파일 업로드 (Multipart)
  Future<String> uploadImage(File imageFile) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: 'upload.jpg',
      ),
    });
    final response = await _dio.post('/images', data: formData);
    return response.data['url'] as String;
  }
}
```

---

### 3.4 JSON ↔ Dart 모델 변환

#### fromJson / toJson 패턴

```dart
// 모델 클래스
class Product {
  final int id;
  final String name;
  final double price;
  final String? imageUrl;
  final DateTime createdAt;
  final List<String> tags;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
    required this.createdAt,
    required this.tags,
  });

  // JSON → Dart 객체
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id:        json['id'] as int,
      name:      json['name'] as String,
      price:     (json['price'] as num).toDouble(),  // int도 처리
      imageUrl:  json['image_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      tags:      (json['tags'] as List?)
                   ?.map((e) => e as String)
                   .toList() ?? [],
    );
  }

  // Dart 객체 → JSON
  Map<String, dynamic> toJson() => {
    'id':         id,
    'name':       name,
    'price':      price,
    'image_url':  imageUrl,
    'created_at': createdAt.toIso8601String(),
    'tags':       tags,
  };

  // 불변 복사
  Product copyWith({String? name, double? price}) => Product(
    id:        id,
    name:      name ?? this.name,
    price:     price ?? this.price,
    imageUrl:  imageUrl,
    createdAt: createdAt,
    tags:      tags,
  );
}
```

**중첩 객체 파싱:**

```dart
class Order {
  final int id;
  final User user;          // 중첩 객체
  final List<OrderItem> items; // 중첩 배열

  factory Order.fromJson(Map<String, dynamic> json) => Order(
    id:    json['id'] as int,
    user:  User.fromJson(json['user'] as Map<String, dynamic>),
    items: (json['items'] as List)
             .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
             .toList(),
  );
}
```

> ⚠️ **함정 주의:** `json['price'] as double`은 서버가 `29000`(int)을 반환하면 캐스팅 오류가 발생한다. 숫자 필드는 항상 `(json['price'] as num).toDouble()`으로 안전하게 변환한다.

---

### 3.5 인터셉터: 요청·응답 파이프라인

인터셉터는 모든 요청·응답을 가로채 공통 로직을 처리한다.

![Dio 인터셉터 파이프라인](/developer-open-book/diagrams/step17-interceptor-pipeline.svg)

#### 인증 인터셉터 (토큰 자동 첨부)

```dart
class AuthInterceptor extends Interceptor {
  final TokenStorage _storage = TokenStorage();

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);  // 요청 계속 진행
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // 401 Unauthorized: 토큰 만료 → 토큰 갱신 시도
    if (err.response?.statusCode == 401) {
      try {
        final newToken = await _refreshToken();
        await _storage.saveAccessToken(newToken);

        // 원래 요청 재시도 (새 토큰으로)
        final retryOptions = err.requestOptions;
        retryOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await Dio().fetch(retryOptions);
        handler.resolve(response);   // 성공으로 처리
        return;
      } catch (_) {
        // 토큰 갱신 실패 → 로그아웃
        await _storage.clear();
        // 로그인 화면으로 이동 (전역 내비게이션 필요)
      }
    }
    handler.next(err);  // 에러 계속 전파
  }

  Future<String> _refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    final response = await Dio().post(
      'https://api.example.com/v1/auth/refresh',
      data: {'refresh_token': refreshToken},
    );
    return response.data['access_token'] as String;
  }
}
```

#### 로깅 인터셉터

```dart
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('→ ${options.method} ${options.uri}');
    if (options.data != null) debugPrint('  Body: ${options.data}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('← ${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('✗ ${err.type}: ${err.message}');
    handler.next(err);
  }
}
```

#### 에러 처리 인터셉터

```dart
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // DioException.type으로 에러 원인 분류
    final appError = switch (err.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.receiveTimeout    => AppError.timeout(),
      DioExceptionType.connectionError   => AppError.network(),
      DioExceptionType.badResponse => switch (err.response?.statusCode) {
        400 => AppError.badRequest(err.response?.data),
        401 => AppError.unauthorized(),
        403 => AppError.forbidden(),
        404 => AppError.notFound(),
        422 => AppError.validation(err.response?.data),
        500 => AppError.server(),
        _   => AppError.unknown(),
      },
      _ => AppError.unknown(),
    };

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: appError,
      ),
    );
  }
}
```

---

### 3.6 에러 처리 패턴

```dart
// Repository 계층에서 에러 처리
Future<List<Product>> getProducts() async {
  try {
    final response = await _dio.get('/products');
    return (response.data as List)
        .map((json) => Product.fromJson(json))
        .toList();
  } on DioException catch (e) {
    // DioException 타입별 처리
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        throw TimeoutException('요청 시간이 초과되었습니다');
      case DioExceptionType.connectionError:
        throw NetworkException('네트워크 연결을 확인해주세요');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) throw UnauthorizedException();
        if (statusCode == 404) throw NotFoundException('상품을 찾을 수 없습니다');
        throw ServerException('서버 오류가 발생했습니다 ($statusCode)');
      default:
        throw AppException('알 수 없는 오류가 발생했습니다');
    }
  } on FormatException {
    throw ParseException('데이터 형식이 올바르지 않습니다');
  }
}

// UI 계층에서 에러 표시
Future<void> _loadProducts() async {
  setState(() => _isLoading = true);
  try {
    _products = await _repository.getProducts();
  } on TimeoutException catch (e) {
    _showError(e.message);
  } on NetworkException catch (e) {
    _showError(e.message);
  } on UnauthorizedException {
    _navigateToLogin();
  } catch (e) {
    _showError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    setState(() => _isLoading = false);
  }
}
```

---

### 3.7 GraphQL 기초 (ferry·gql)

GraphQL은 REST의 Over-fetching·Under-fetching 문제를 해결하는 API 기술이다.

![REST vs GraphQL comparison](/developer-open-book/diagrams/step17-rest-vs-graphql.svg)

#### ferry 패키지로 GraphQL 사용

```yaml
# pubspec.yaml
dependencies:
  ferry: ^0.15.0
  gql_http_link: ^0.4.0
```

```dart
// GraphQL 쿼리 정의 (.graphql 파일 또는 인라인)
const String getProductsQuery = '''
  query GetProducts(\$first: Int, \$category: String) {
    products(first: \$first, category: \$category) {
      edges {
        node {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
''';

// 클라이언트 설정
final link = HttpLink('https://api.example.com/graphql',
    defaultHeaders: {'Authorization': 'Bearer $token'});

final client = Client(
  link: link,
  cache: Cache(),
);

// 쿼리 실행
final request = GGetProductsReq((b) => b
  ..vars.first = 20
  ..vars.category = 'electronics',
);

client.request(request).listen((response) {
  if (response.hasErrors) {
    print('에러: ${response.graphqlErrors}');
    return;
  }
  final products = response.data?.products.edges
      .map((e) => e.node)
      .toList();
});
```

**REST vs GraphQL 선택 기준:**

| 상황                                       | REST           | GraphQL      |
| ------------------------------------------ | -------------- | ------------ |
| 단순 CRUD API                              | ✅             | 과도함       |
| 복잡한 중첩 데이터                         | 다중 요청 필요 | ✅ 단일 요청 |
| 모바일 + 웹 클라이언트 각자 다른 필드 필요 | 복잡           | ✅ 각자 쿼리 |
| 팀 내 GraphQL 경험                         | -              | 필요         |
| 실시간 기능 (Subscription)                 | WebSocket 별도 | ✅ 내장      |

---

## 4. 사례 연구

### 4.1 레이어드 아키텍처로 HTTP 통신 구조화

```
실무 앱의 HTTP 통신 레이어 구조
──────────────────────────────────────────────────────
  UI 레이어 (Widget)
    ↓ 데이터 요청
  ViewModel / Notifier (Riverpod)
    ↓ 비즈니스 로직
  Repository 레이어
    ↓ 데이터 소스 추상화
  DataSource 레이어
    ↓ 실제 API 호출
  Dio + Interceptors
    ↓ HTTP 요청
  서버 (REST API)
──────────────────────────────────────────────────────
```

```dart
// DataSource: 실제 API 호출
class ProductRemoteDataSource {
  final Dio _dio;
  ProductRemoteDataSource(this._dio);

  Future<List<ProductDto>> fetchProducts() async {
    final res = await _dio.get('/products');
    return (res.data['data'] as List)
        .map((json) => ProductDto.fromJson(json))
        .toList();
  }
}

// Repository: DataSource 조합 및 예외 변환
class ProductRepository {
  final ProductRemoteDataSource _remote;
  final ProductLocalDataSource  _local;   // 캐시
  ProductRepository(this._remote, this._local);

  Future<List<Product>> getProducts() async {
    try {
      final dtos = await _remote.fetchProducts();
      final products = dtos.map((dto) => dto.toDomain()).toList();
      await _local.cacheProducts(products);
      return products;
    } on DioException {
      // 네트워크 실패 시 캐시 반환
      return _local.getCachedProducts();
    }
  }
}

// Riverpod Notifier: 상태 관리
class ProductsNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    final repo = ref.read(productRepositoryProvider);
    return repo.getProducts();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(productRepositoryProvider).getProducts(),
    );
  }
}
```

---

### 4.2 페이지네이션 패턴

```dart
class PaginatedProductRepository {
  final Dio _dio;
  PaginatedProductRepository(this._dio);

  // 커서 기반 페이지네이션
  Future<ProductPage> getProducts({
    String? cursor,
    int limit = 20,
  }) async {
    final response = await _dio.get(
      '/products',
      queryParameters: {
        'limit': limit,
        if (cursor != null) 'cursor': cursor,
      },
    );
    return ProductPage.fromJson(response.data);
  }
}

class ProductPage {
  final List<Product> items;
  final String? nextCursor;
  final bool hasMore;

  factory ProductPage.fromJson(Map<String, dynamic> json) => ProductPage(
    items:      (json['data'] as List).map((e) => Product.fromJson(e)).toList(),
    nextCursor: json['next_cursor'] as String?,
    hasMore:    json['has_more'] as bool,
  );
}

// Riverpod + 무한 스크롤
class ProductListNotifier extends AsyncNotifier<List<Product>> {
  String? _nextCursor;
  bool _hasMore = true;

  @override
  Future<List<Product>> build() async {
    final page = await ref.read(productRepoProvider).getProducts();
    _nextCursor = page.nextCursor;
    _hasMore    = page.hasMore;
    return page.items;
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    final current = state.value ?? [];
    final page = await ref.read(productRepoProvider).getProducts(
      cursor: _nextCursor,
    );
    _nextCursor = page.nextCursor;
    _hasMore    = page.hasMore;
    state = AsyncData([...current, ...page.items]);
  }
}
```

---

### 4.3 이미지 파일 업로드

```dart
Future<String> uploadProfileImage(File imageFile) async {
  // 파일 크기 검증
  final sizeInMB = imageFile.lengthSync() / (1024 * 1024);
  if (sizeInMB > 5) throw ValidationException('이미지 크기는 5MB 이하여야 합니다');

  // 진행률 표시를 위한 onSendProgress
  final formData = FormData.fromMap({
    'profile_image': await MultipartFile.fromFile(
      imageFile.path,
      filename: '${DateTime.now().millisecondsSinceEpoch}.jpg',
      contentType: DioMediaType('image', 'jpeg'),
    ),
  });

  final response = await _dio.post(
    '/users/profile-image',
    data: formData,
    onSendProgress: (sent, total) {
      final progress = sent / total;
      print('업로드 진행률: ${(progress * 100).toStringAsFixed(0)}%');
    },
  );

  return response.data['image_url'] as String;
}
```

---

## 5. 실습

### 5.1 JSONPlaceholder API 연동

[JSONPlaceholder](https://jsonplaceholder.typicode.com)는 테스트용 무료 REST API다.

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: PostsPage()));

// 모델
class Post {
  final int id;
  final int userId;
  final String title;
  final String body;

  const Post({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
  });

  factory Post.fromJson(Map<String, dynamic> json) => Post(
    id:     json['id']     as int,
    userId: json['userId'] as int,
    title:  json['title']  as String,
    body:   json['body']   as String,
  );
}

// Repository
class PostRepository {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: const Duration(seconds: 10),
  ));

  Future<List<Post>> getPosts() async {
    try {
      final response = await _dio.get('/posts');
      return (response.data as List)
          .map((json) => Post.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw Exception(_handleError(e));
    }
  }

  Future<Post> createPost(String title, String body) async {
    final response = await _dio.post('/posts', data: {
      'title': title,
      'body': body,
      'userId': 1,
    });
    return Post.fromJson(response.data);
  }

  Future<void> deletePost(int id) async {
    await _dio.delete('/posts/$id');
  }

  String _handleError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        return '연결 시간 초과';
      case DioExceptionType.connectionError:
        return '네트워크 연결 오류';
      default:
        return '오류: ${e.response?.statusCode}';
    }
  }
}

// UI
class PostsPage extends StatefulWidget {
  const PostsPage({super.key});
  @override
  State<PostsPage> createState() => _PostsPageState();
}

class _PostsPageState extends State<PostsPage> {
  final _repo = PostRepository();
  late Future<List<Post>> _postsFuture;

  @override
  void initState() {
    super.initState();
    _postsFuture = _repo.getPosts();
  }

  Future<void> _createPost() async {
    try {
      final post = await _repo.createPost('새 포스트', '내용입니다');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('생성됨: ${post.title} (id: ${post.id})')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('오류: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('JSONPlaceholder Posts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _createPost,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => setState(() {
              _postsFuture = _repo.getPosts();
            }),
          ),
        ],
      ),
      body: FutureBuilder<List<Post>>(
        future: _postsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 8),
                  Text('${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        setState(() => _postsFuture = _repo.getPosts()),
                    child: const Text('재시도'),
                  ),
                ],
              ),
            );
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final posts = snapshot.data!;
          return ListView.builder(
            itemCount: posts.length,
            itemBuilder: (_, i) => ListTile(
              leading: CircleAvatar(child: Text('${posts[i].userId}')),
              title: Text(posts[i].title,
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              subtitle: Text(posts[i].body,
                  maxLines: 2, overflow: TextOverflow.ellipsis),
            ),
          );
        },
      ),
    );
  }
}
```

**pubspec.yaml:**

```yaml
dependencies:
  dio: ^5.4.0
```

**확인 포인트:**

- 앱 실행 시 JSONPlaceholder에서 100개 포스트를 가져오는가?
- - 버튼 탭 시 POST 요청이 발생하고 SnackBar로 결과가 표시되는가?
- 새로고침 버튼이 Future를 재생성해 목록을 다시 불러오는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** HTTP 상태 코드 401과 403의 차이는?

> **모범 답안:** 401(Unauthorized)은 인증이 되지 않은 상태, 즉 "누구인지 모른다"는 의미다. 로그인이 필요하거나 토큰이 만료된 경우다. 403(Forbidden)은 인증은 됐지만 해당 자원에 접근할 권한이 없다는 의미다. 일반 사용자가 관리자 API를 호출하는 경우가 해당한다.

---

**Q2. [Understand]** Dio 인터셉터에서 `handler.next(options)` vs `handler.resolve(response)` vs `handler.reject(error)`의 차이는?

> **모범 답안:** `handler.next(options)`는 요청을 그대로 다음 단계로 전달한다. `handler.resolve(response)`는 실제 HTTP 요청을 보내지 않고 인터셉터에서 직접 응답으로 처리한다(캐시 응답, 목 데이터 주입에 활용). `handler.reject(error)`는 인터셉터에서 강제로 에러를 발생시킨다.

---

**Q3. [Apply]** 아래 JSON을 파싱하는 `fromJson` 팩토리 생성자를 작성하라.

```json
{
  "id": 5,
  "title": "Flutter 앱 만들기",
  "price": 29000,
  "is_available": true,
  "tags": ["mobile", "flutter"]
}
```

```dart
// 모범 답안
class Course {
  final int id;
  final String title;
  final double price;
  final bool isAvailable;
  final List<String> tags;

  const Course({
    required this.id,
    required this.title,
    required this.price,
    required this.isAvailable,
    required this.tags,
  });

  factory Course.fromJson(Map<String, dynamic> json) => Course(
    id:          json['id']           as int,
    title:       json['title']        as String,
    price:       (json['price']       as num).toDouble(),
    isAvailable: json['is_available'] as bool,
    tags:        (json['tags']        as List).map((e) => e as String).toList(),
  );
}
```

---

**Q4. [Understand]** `(json['price'] as num).toDouble()`처럼 변환하는 이유는?

> **모범 답안:** 서버가 `29000`처럼 정수(int)를 반환하면 `json['price'] as double`은 런타임 캐스팅 오류가 발생한다. Dart에서 `int`와 `double`은 서로 직접 캐스팅되지 않는다. `num`은 `int`와 `double`의 공통 부모 타입이므로 먼저 `num`으로 받은 뒤 `.toDouble()`로 변환하면 서버가 정수를 보내도 안전하게 처리된다.

---

**Q5. [Analyze]** REST 대신 GraphQL을 선택해야 하는 상황을 2가지 제시하라.

> **모범 답안:** ① **하나의 화면에서 여러 리소스를 조합해야 할 때** — REST는 사용자 정보·포스트·댓글을 각각 별도 요청해야 하지만, GraphQL은 단일 쿼리로 필요한 데이터를 한 번에 가져온다. ② **모바일과 웹이 서로 다른 필드를 필요로 할 때** — REST는 모든 필드를 반환하므로 모바일에서 불필요한 데이터를 받게 된다. GraphQL은 각 클라이언트가 필요한 필드만 쿼리로 지정할 수 있어 Over-fetching을 없앨 수 있다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **REST API**는 HTTP 메서드(GET·POST·PUT·DELETE)로 CRUD를 표현하며, 상태 코드로 처리 결과를 전달한다.
- **Dio**는 인터셉터·타임아웃·파일 업로드 등 실무에 필요한 기능을 제공하는 Flutter 표준 HTTP 클라이언트다.
- **fromJson/toJson** 패턴으로 JSON을 Dart 모델과 상호 변환한다. 숫자는 `(num).toDouble()`로 안전하게 변환한다.
- **인터셉터**로 토큰 자동 첨부, 로깅, 토큰 갱신, 에러 변환을 공통 처리한다.
- **DioException.type**으로 연결 오류·타임아웃·서버 오류를 구분해 적절한 UI를 표시한다.
- **GraphQL**(ferry·gql)은 Over/Under-fetching 문제를 해결하며 복잡한 중첩 데이터가 있는 앱에 유리하다.

### 6.2 다음 Step 예고

- **Step 18 — 로컬 데이터 저장:** SharedPreferences·SQLite·Hive·Firebase Firestore Offline 캐싱으로 앱 데이터를 기기에 저장하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                          | 링크                                                    | 설명                       |
| ----------------------------- | ------------------------------------------------------- | -------------------------- |
| Dio 공식 문서                 | <https://pub.dev/packages/dio>                          | Dio 패키지                 |
| JSONPlaceholder               | <https://jsonplaceholder.typicode.com>                  | 무료 테스트 REST API       |
| HTTP 상태 코드 목록           | <https://developer.mozilla.org/ko/docs/Web/HTTP/Status> | MDN 상태 코드              |
| ferry GraphQL                 | <https://pub.dev/packages/ferry>                        | Flutter GraphQL 클라이언트 |
| Flutter Cookbook — Networking | <https://docs.flutter.dev/cookbook/networking>          | 공식 네트워킹 가이드       |

### 6.4 FAQ

**Q. `http` 패키지와 `Dio` 중 무엇을 써야 하는가?**

> 실무 앱에서는 **Dio**를 권장한다. 인터셉터, 요청 취소, 파일 업로드, 세밀한 타임아웃 제어 등 실제로 필요한 기능이 모두 포함되어 있다. `http` 패키지는 단순 테스트 코드나 플러그인 내부처럼 의존성을 최소화해야 할 때 사용한다.

**Q. API 키를 코드에 직접 넣으면 안 되는 이유는?**

> APK/IPA를 역컴파일하면 코드 내 하드코딩된 API 키가 노출된다. `--dart-define`으로 빌드 시점에 주입하거나, 서버 사이드에서 키를 관리하고 앱에서는 만료 시간이 있는 토큰을 받아 사용하는 것이 안전하다.

**Q. Dio에서 요청을 취소하는 방법은?**

> `CancelToken`을 사용한다. 요청 시 `cancelToken: _cancelToken`을 전달하고, 취소가 필요할 때 `_cancelToken.cancel()`을 호출한다. 화면을 벗어날 때 `dispose()`에서 취소하면 불필요한 네트워크 요청을 방지할 수 있다.

---

## 빠른 자가진단 체크리스트

- [ ] REST API의 HTTP 메서드 5가지(GET·POST·PUT·PATCH·DELETE)와 용도를 설명할 수 있는가?
- [ ] HTTP 상태 코드 200·201·400·401·403·404·500의 의미를 말할 수 있는가?
- [ ] Dio BaseOptions의 주요 설정(baseUrl·timeout·headers)을 작성할 수 있는가?
- [ ] fromJson 팩토리 생성자를 직접 작성할 수 있는가?
- [ ] 숫자 필드 파싱 시 `(json['price'] as num).toDouble()` 패턴이 필요한 이유를 설명할 수 있는가?
- [ ] Dio 인터셉터가 하는 역할 3가지(토큰 첨부·로깅·에러 처리)를 설명할 수 있는가?
- [ ] 401 에러 시 토큰 갱신 후 원래 요청을 재시도하는 흐름을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: `json['price'] as double`이 서버가 int를 보낼 때 실패하는 이유를 설명할 수 있는가?
