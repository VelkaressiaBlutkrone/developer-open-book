# Step 22 — Dependency Injection

> **파트:** 6️⃣ Flutter 아키텍처 | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Evaluating

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Dependency Injection이 무엇이며 왜 필요한지 설명할 수 있다.
2. **[Understand]** GetIt의 Service Locator 패턴과 생성자 주입의 차이를 설명할 수 있다.
3. **[Understand]** Riverpod Provider가 DI 컨테이너 역할을 하는 원리를 설명할 수 있다.
4. **[Apply]** GetIt으로 singleton·factory·lazySingleton을 등록하고 사용할 수 있다.
5. **[Apply]** Injectable 코드 생성으로 DI 보일러플레이트를 자동화할 수 있다.
6. **[Apply]** Riverpod Provider를 DI 컨테이너로 활용해 Clean Architecture 계층을 연결할 수 있다.
7. **[Evaluate]** 프로젝트 상황에 따라 GetIt vs Riverpod DI 방식을 선택하고 근거를 제시할 수 있다.

**전제 지식:** Step 20(프로젝트 구조), Step 21(Clean Architecture·Repository·UseCase), Step 15(Riverpod)

---

## 1. 서론

### 1.1 Dependency Injection이 해결하는 문제

Clean Architecture를 학습했으니 이제 계층들을 **어떻게 연결하는가**가 문제다.

```
DI 없는 코드의 문제
──────────────────────────────────────────────────────
class GetProductsUseCase {
  // ← 직접 생성: 구현체를 알아버림!
  final _repository = ProductRepositoryImpl(
    remote: ProductRemoteDataSourceImpl(Dio()),
    local:  ProductLocalDataSourceImpl(Hive.box('products')),
  );
}

문제점:
  ① UseCase가 구현 세부사항을 알게 됨 → Clean Arch 위반
  ② 테스트 시 실제 Dio·Hive 필요 → Mock 교체 불가
  ③ Dio 설정(baseUrl 등)이 여러 곳에 중복
  ④ 객체 생성 순서를 수동으로 관리해야 함
──────────────────────────────────────────────────────

DI가 해결하는 방식
──────────────────────────────────────────────────────
class GetProductsUseCase {
  // ← 외부에서 주입: 인터페이스만 알면 됨
  final ProductRepository _repository;
  GetProductsUseCase(this._repository);
}

// DI 컨테이너가 객체 생성·연결을 담당
// 테스트 시: MockRepository 주입
// 실제 앱: ProductRepositoryImpl 주입
──────────────────────────────────────────────────────
```

### 1.2 Flutter DI 방식 3가지

```
Flutter에서 DI를 구현하는 방법
──────────────────────────────────────────────────────
  ① GetIt           Service Locator 패턴
                    전역 레지스트리에서 필요할 때 꺼내 씀
                    Flutter·Riverpod 독립적

  ② GetIt + Injectable  GetIt + 코드 생성
                    @injectable, @singleton 어노테이션으로
                    보일러플레이트 자동 생성

  ③ Riverpod Provider   상태관리 + DI 통합
                    Provider가 DI 컨테이너 역할
                    Riverpod 프로젝트에서 가장 자연스러움
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

![DI 패턴 hierarchy](/developer-open-book/diagrams/step22-di-system.svg)

---

## 2. 기본 개념과 용어

| 용어                          | 정의                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Dependency Injection (DI)** | 객체가 필요로 하는 의존성을 외부에서 주입받는 설계 패턴. 객체가 직접 의존성을 생성하지 않음 |
| **DI 컨테이너**               | 의존성의 생성·등록·제공을 담당하는 중앙 레지스트리                                          |
| **Service Locator**           | 전역 레지스트리에서 필요한 객체를 이름/타입으로 조회하는 패턴. GetIt이 이 방식              |
| **GetIt**                     | Flutter에서 가장 많이 사용되는 Service Locator 패키지                                       |
| **Singleton**                 | 앱 전체에서 단 하나의 인스턴스만 존재하는 객체. 앱 시작 시 즉시 생성                        |
| **LazySingleton**             | 처음 사용 시 생성되는 Singleton. 불필요한 즉시 초기화를 피함                                |
| **Factory**                   | 요청할 때마다 새 인스턴스를 생성해 반환                                                     |
| **Injectable**                | GetIt 등록 코드를 어노테이션 기반으로 자동 생성하는 코드 생성 패키지                        |
| **@injectable**               | Injectable에서 Factory 등록을 의미하는 어노테이션                                           |
| **@singleton**                | Injectable에서 Singleton 등록을 의미하는 어노테이션                                         |
| **@lazySingleton**            | Injectable에서 LazySingleton 등록을 의미하는 어노테이션                                     |
| **@module**                   | 외부 라이브러리(Dio, Hive 등)를 Injectable에 등록하기 위한 어노테이션                       |
| **ProviderOverride**          | Riverpod 테스트에서 실제 Provider를 Mock Provider로 교체하는 기법                           |
| **sl**                        | Service Locator의 약자. GetIt 인스턴스를 `sl`이라는 전역 변수로 참조하는 관례               |

---

## 3. 이론적 배경과 원리 ★

### 3.1 GetIt: Service Locator 패턴

#### 기본 설정 및 등록

```yaml
# pubspec.yaml
dependencies:
  get_it: ^7.7.0
```

```dart
// core/di/injection_container.dart
import 'package:get_it/get_it.dart';

final sl = GetIt.instance;  // 전역 접근점 (sl = Service Locator)

Future<void> init() async {
  // ── External (외부 라이브러리) ───────────────────────
  // Singleton: 앱 전체에서 하나의 Dio 인스턴스
  sl.registerLazySingleton<Dio>(
    () => Dio(BaseOptions(baseUrl: 'https://api.example.com/v1')),
  );

  // Hive Box: 앱 시작 시 미리 열어두고 등록
  final productBox = await Hive.openBox<ProductDto>('products');
  sl.registerSingleton<Box<ProductDto>>(productBox);

  // ── Data Layer ──────────────────────────────────────
  // DataSource: 매번 새 인스턴스 (Factory)
  // → Dio를 sl에서 꺼내 생성자로 주입
  sl.registerFactory<ProductRemoteDataSource>(
    () => ProductRemoteDataSourceImpl(sl<Dio>()),
  );
  sl.registerFactory<ProductLocalDataSource>(
    () => ProductLocalDataSourceImpl(sl<Box<ProductDto>>()),
  );

  // Repository: 하나면 충분 (LazySingleton)
  sl.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(
      remote: sl<ProductRemoteDataSource>(),
      local:  sl<ProductLocalDataSource>(),
    ),
  );

  // ── Application Layer ────────────────────────────────
  // UseCase: 매번 새 인스턴스 (Factory)
  sl.registerFactory<GetProductsUseCase>(
    () => GetProductsUseCase(sl<ProductRepository>()),
  );
  sl.registerFactory<SearchProductsUseCase>(
    () => SearchProductsUseCase(sl<ProductRepository>()),
  );
  sl.registerFactory<CreateProductUseCase>(
    () => CreateProductUseCase(sl<ProductRepository>()),
  );
}

// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await init();  // DI 컨테이너 초기화
  runApp(const MyApp());
}
```

#### 등록 타입 비교

```
registerSingleton<T>()
  → 즉시 인스턴스 생성
  → 앱 전체에서 항상 같은 인스턴스
  → 앱 시작 시 반드시 필요한 객체 (Box, Config 등)

registerLazySingleton<T>()
  → 처음 sl<T>() 호출 시 인스턴스 생성
  → 이후 항상 같은 인스턴스
  → 대부분의 Service, Repository에 적합

registerFactory<T>()
  → sl<T>() 호출마다 새 인스턴스 생성
  → 상태를 가져서는 안 되는 UseCase, 화면별 ViewModel에 적합
```

#### 사용 방법

```dart
// 위젯이나 클래스에서 의존성 꺼내기
class ProductListNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    // sl에서 UseCase 꺼내기
    final useCase = sl<GetProductsUseCase>();
    final result  = await useCase();
    return result.fold((f) => throw f.message, (p) => p);
  }
}

// 또는 생성자 주입 (더 테스트하기 쉬움)
class ProductListNotifier extends AsyncNotifier<List<Product>> {
  final GetProductsUseCase _useCase;
  ProductListNotifier(this._useCase);   // 생성자로 주입

  @override
  Future<List<Product>> build() async {
    final result = await _useCase();
    return result.fold((f) => throw f.message, (p) => p);
  }
}
```

> ⚠️ **함정 주의:** GetIt `sl<T>()`를 `build()` 메서드나 `initState()` 같은 생명주기 메서드 내부에서 자주 호출하면 Service Locator 안티패턴이 된다. 의존성은 생성자나 Provider를 통해 **주입**받고, 필요한 곳에서만 `sl`을 사용하는 것이 권장된다.

---

### 3.2 Injectable: 코드 생성으로 보일러플레이트 제거

GetIt 등록 코드를 어노테이션으로 자동 생성한다.

```yaml
dependencies:
  get_it: ^7.7.0
  injectable: ^2.4.0
dev_dependencies:
  injectable_generator: ^2.6.0
  build_runner: ^2.4.0
```

```dart
// core/di/injection.dart
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

import 'injection.config.dart';  // 자동 생성 파일

final sl = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async => sl.init();
```

```dart
// 어노테이션으로 등록 선언

// @lazySingleton: LazySingleton으로 등록
@lazySingleton
class DioClient {
  late final Dio dio;

  DioClient() {
    dio = Dio(BaseOptions(baseUrl: 'https://api.example.com/v1'));
    dio.interceptors.add(AuthInterceptor());
  }
}

// @LazySingleton(as: Interface): 인터페이스로 등록
@LazySingleton(as: ProductRepository)
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource _remote;
  final ProductLocalDataSource  _local;

  ProductRepositoryImpl(this._remote, this._local);
  // ...
}

// @injectable: Factory로 등록
@injectable
class GetProductsUseCase {
  final ProductRepository _repository;
  GetProductsUseCase(this._repository);  // 자동으로 의존성 주입됨
  // ...
}

// @singleton: Singleton으로 등록
@singleton
class AuthService {
  // ...
}

// @module: 외부 라이브러리 등록
@module
abstract class RegisterModule {
  // Dio를 LazySingleton으로 등록
  @lazySingleton
  Dio get dio => Dio(BaseOptions(baseUrl: 'https://api.example.com'));

  // SharedPreferences를 Singleton으로 등록 (비동기 초기화)
  @preResolve  // Future를 기다려 등록
  @singleton
  Future<SharedPreferences> get prefs => SharedPreferences.getInstance();
}
```

```bash
# 코드 생성 실행
flutter pub run build_runner build --delete-conflicting-outputs

# 생성되는 파일: injection.config.dart
# 이 파일에 GetIt 등록 코드가 자동으로 생성됨
```

**생성된 코드 예시:**

```dart
// injection.config.dart (자동 생성 — 수동 수정 금지)
extension GetItInjectableX on GetIt {
  GetIt init({ ... }) {
    final gh = GetItHelper(this, ...);

    gh.lazySingleton<DioClient>(() => DioClient());
    gh.lazySingleton<ProductRepository>(
      () => ProductRepositoryImpl(
        gh<ProductRemoteDataSource>(),
        gh<ProductLocalDataSource>(),
      ),
    );
    gh.factory<GetProductsUseCase>(
      () => GetProductsUseCase(gh<ProductRepository>()),
    );
    // ...
    return this;
  }
}
```

---

### 3.3 Riverpod을 DI 컨테이너로 활용

Riverpod은 상태관리 패키지이지만, **Provider 자체가 DI 컨테이너 역할**을 한다. 별도의 GetIt 없이도 Clean Architecture의 모든 계층을 연결할 수 있다.

#### Provider로 계층 연결

```dart
// core/di/providers.dart — 앱 전체 DI Provider 등록

// ─── External ─────────────────────────────────────────
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(baseUrl: 'https://api.example.com/v1'));
  dio.interceptors.add(AuthInterceptor());
  return dio;
});

// ─── Data Layer ───────────────────────────────────────
final productRemoteDataSourceProvider =
    Provider<ProductRemoteDataSource>((ref) {
  return ProductRemoteDataSourceImpl(ref.read(dioProvider));
});

final productLocalDataSourceProvider =
    Provider<ProductLocalDataSource>((ref) {
  return ProductLocalDataSourceImpl(Hive.box('products'));
});

final productRepositoryProvider =
    Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(
    remote: ref.read(productRemoteDataSourceProvider),
    local:  ref.read(productLocalDataSourceProvider),
  );
});

// ─── Application Layer ────────────────────────────────
final getProductsUseCaseProvider =
    Provider<GetProductsUseCase>((ref) {
  return GetProductsUseCase(ref.read(productRepositoryProvider));
});

final searchProductsUseCaseProvider =
    Provider<SearchProductsUseCase>((ref) {
  return SearchProductsUseCase(ref.read(productRepositoryProvider));
});

// ─── Presentation Layer ────────────────────────────────
final productListProvider =
    AsyncNotifierProvider<ProductListNotifier, List<Product>>(
  ProductListNotifier.new,
);

class ProductListNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    // ref.read()로 UseCase를 DI받음
    final useCase = ref.read(getProductsUseCaseProvider);
    final result  = await useCase();
    return result.fold(
      (failure) => throw failure.message,
      (products) => products,
    );
  }
}
```

#### Riverpod DI의 핵심 강점: ProviderOverride

```dart
// 테스트에서 실제 Repository를 Mock으로 교체
void main() {
  testWidgets('상품 목록 화면 테스트', (tester) async {
    final mockRepository = MockProductRepository();
    when(mockRepository.getProducts())
        .thenAnswer((_) async => const Right([
          Product(id: '1', name: '테스트 상품', price: 9900, stockCount: 5),
        ]));

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          // productRepositoryProvider를 Mock으로 교체!
          productRepositoryProvider.overrideWithValue(mockRepository),
        ],
        child: const MaterialApp(home: ProductListScreen()),
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('테스트 상품'), findsOneWidget);
  });
}
```

---

### 3.4 GetIt vs Riverpod DI 비교

```
GetIt 방식
──────────────────────────────────────────────────────
  장점:
    • Flutter/Riverpod 의존성 없음 (순수 Dart)
    • 기존 Bloc/Provider 앱에서도 사용 가능
    • 코드 어디서나 sl<T>()로 접근 가능
    • Injectable로 보일러플레이트 최소화
  단점:
    • Service Locator = 전역 상태 → 테스트 복잡
    • 등록 순서 수동 관리 필요
    • rebuild 연동 없음 (상태관리와 분리)

Riverpod Provider 방식
──────────────────────────────────────────────────────
  장점:
    • 상태관리 + DI 통합 (하나의 패키지)
    • ProviderOverride로 테스트 교체 매우 쉬움
    • 컴파일 타임 안전성
    • ref.watch()로 의존성 변경 시 자동 rebuild
  단점:
    • Riverpod에 의존 (다른 상태관리 조합 어색)
    • ProviderScope 밖에서 접근 불가
    • 학습 곡선 존재
```

**선택 기준:**

| 상황                           | 권장                            |
| ------------------------------ | ------------------------------- |
| Riverpod을 이미 사용 중        | **Riverpod Provider**           |
| Bloc/Cubit과 함께 사용         | **GetIt + Injectable**          |
| 멀티 플랫폼 (Flutter + Server) | **GetIt** (Flutter 독립적)      |
| 테스트 용이성 최우선           | **Riverpod** (ProviderOverride) |

---

### 3.5 환경별 DI 분리: Dev / Prod / Test

```dart
// GetIt 방식: 환경별 등록 분리
Future<void> init({required bool isProd}) async {
  if (isProd) {
    sl.registerLazySingleton<ProductRepository>(
      () => ProductRepositoryImpl(remote: sl<ProductRemoteDataSource>()),
    );
  } else {
    // 개발 환경: Mock 데이터 사용
    sl.registerLazySingleton<ProductRepository>(
      () => MockProductRepository(),
    );
  }
}

// main.dart
void main() async {
  await init(isProd: const bool.fromEnvironment('PROD', defaultValue: false));
  runApp(const MyApp());
}

// Riverpod 방식: 환경별 override
void main() {
  const isProd = bool.fromEnvironment('PROD', defaultValue: false);

  runApp(
    ProviderScope(
      overrides: isProd ? [] : [
        productRepositoryProvider.overrideWithValue(MockProductRepository()),
      ],
      child: const MyApp(),
    ),
  );
}
```

---

### 3.6 완전한 DI 설정 예시 (Riverpod 통합 패턴)

```dart
// core/di/app_providers.dart
// Clean Architecture 전 계층을 Riverpod Provider로 연결

// ── Network ─────────────────────────────────────
final dioProvider = Provider<Dio>((ref) {
  return Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
  ))
    ..interceptors.addAll([
      AuthInterceptor(ref: ref),
      LoggingInterceptor(),
      ErrorInterceptor(),
    ]);
});

// ── Auth Feature ─────────────────────────────────
// Data
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>(
  (ref) => AuthRemoteDataSourceImpl(ref.read(dioProvider)),
);
final authLocalDataSourceProvider = Provider<AuthLocalDataSource>(
  (ref) => AuthLocalDataSourceImpl(),
);
final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepositoryImpl(
    remote: ref.read(authRemoteDataSourceProvider),
    local:  ref.read(authLocalDataSourceProvider),
  ),
);

// Application
final loginUseCaseProvider = Provider<LoginUseCase>(
  (ref) => LoginUseCase(ref.read(authRepositoryProvider)),
);
final logoutUseCaseProvider = Provider<LogoutUseCase>(
  (ref) => LogoutUseCase(ref.read(authRepositoryProvider)),
);

// ── Product Feature ───────────────────────────────
final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>(
  (ref) => ProductRemoteDataSourceImpl(ref.read(dioProvider)),
);
final productRepositoryProvider = Provider<ProductRepository>(
  (ref) => ProductRepositoryImpl(
    remote: ref.read(productRemoteDataSourceProvider),
  ),
);
final getProductsUseCaseProvider = Provider<GetProductsUseCase>(
  (ref) => GetProductsUseCase(ref.read(productRepositoryProvider)),
);
```

---

## 4. 사례 연구

### 4.1 인터셉터에서 Riverpod ref 활용

```dart
// Auth 인터셉터에서 토큰을 Riverpod Provider로 관리
class AuthInterceptor extends Interceptor {
  final Ref _ref;
  AuthInterceptor({required Ref ref}) : _ref = ref;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Riverpod Provider에서 토큰 읽기
    final token = _ref.read(authTokenProvider);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // 토큰 갱신 UseCase 실행
      final refreshUseCase = _ref.read(refreshTokenUseCaseProvider);
      final result = await refreshUseCase();
      result.fold(
        (_) {
          // 갱신 실패 → 로그아웃
          _ref.read(authNotifierProvider.notifier).logout();
          handler.next(err);
        },
        (newToken) async {
          // 갱신 성공 → 원래 요청 재시도
          err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final response = await _ref.read(dioProvider).fetch(err.requestOptions);
          handler.resolve(response);
        },
      );
    } else {
      handler.next(err);
    }
  }
}
```

---

### 4.2 테스트에서 ProviderOverride 실전

```dart
// test/features/product/presentation/product_list_screen_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('ProductListScreen', () {
    late MockProductRepository mockRepo;

    setUp(() {
      mockRepo = MockProductRepository();
    });

    testWidgets('상품 목록을 표시한다', (tester) async {
      // Arrange
      when(mockRepo.getProducts()).thenAnswer((_) async => Right([
        const Product(id: '1', name: '플러터 책', price: 32000, stockCount: 5),
        const Product(id: '2', name: '다트 책',  price: 28000, stockCount: 0),
      ]));

      // Act: productRepositoryProvider를 Mock으로 교체
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('플러터 책'), findsOneWidget);
      expect(find.text('다트 책'),  findsOneWidget);
    });

    testWidgets('로딩 중에는 CircularProgressIndicator를 표시한다', (tester) async {
      // 무한 Future로 로딩 상태 유지
      when(mockRepo.getProducts())
          .thenAnswer((_) => Future.delayed(const Duration(hours: 1)));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(home: ProductListScreen()),
        ),
      );
      await tester.pump();  // 첫 프레임만

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}
```

---

### 4.3 GetIt + Bloc 조합 패턴

```dart
// GetIt으로 Bloc에 UseCase 주입
sl.registerFactory<ProductListBloc>(
  () => ProductListBloc(
    getProducts: sl<GetProductsUseCase>(),
    searchProducts: sl<SearchProductsUseCase>(),
  ),
);

// 화면에서 사용
BlocProvider(
  create: (_) => sl<ProductListBloc>()..add(const LoadProductsEvent()),
  child: const ProductListScreen(),
)
```

---

## 5. 실습

### 5.1 GetIt으로 Clean Architecture 계층 연결

```dart
// ── 의존성 설치 ─────────────────────────────────────
// pubspec.yaml
// dependencies:
//   get_it: ^7.7.0
//   flutter_riverpod: ^2.5.0

// ── 전체 DI 설정 ────────────────────────────────────
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final sl = GetIt.instance;

// ─ Domain ─
abstract interface class CounterRepository {
  int getCount();
  void increment();
  void decrement();
  void reset();
}

// ─ Data ─
class InMemoryCounterRepository implements CounterRepository {
  int _count = 0;

  @override int  getCount()   => _count;
  @override void increment()  => _count++;
  @override void decrement()  => _count--;
  @override void reset()      => _count = 0;
}

// ─ Application ─
class IncrementUseCase {
  final CounterRepository _repo;
  IncrementUseCase(this._repo);
  void call() => _repo.increment();
}

class DecrementUseCase {
  final CounterRepository _repo;
  DecrementUseCase(this._repo);
  void call() => _repo.decrement();
}

class GetCountUseCase {
  final CounterRepository _repo;
  GetCountUseCase(this._repo);
  int call() => _repo.getCount();
}

// ─ DI 설정 ─
void setupDI() {
  // Repository: 앱 전체에서 하나
  sl.registerLazySingleton<CounterRepository>(
    () => InMemoryCounterRepository(),
  );

  // UseCase: 매번 새 인스턴스
  sl.registerFactory(() => IncrementUseCase(sl<CounterRepository>()));
  sl.registerFactory(() => DecrementUseCase(sl<CounterRepository>()));
  sl.registerFactory(() => GetCountUseCase(sl<CounterRepository>()));
}

// ─ Presentation ─ (Riverpod + GetIt 혼용)
final counterNotifierProvider =
    NotifierProvider<CounterNotifier, int>(CounterNotifier.new);

class CounterNotifier extends Notifier<int> {
  @override
  int build() => sl<GetCountUseCase>().call();

  void increment() {
    sl<IncrementUseCase>().call();
    state = sl<GetCountUseCase>().call();
  }

  void decrement() {
    sl<DecrementUseCase>().call();
    state = sl<GetCountUseCase>().call();
  }
}

// ─ App ─
void main() {
  setupDI();
  runApp(const ProviderScope(child: MaterialApp(home: CounterScreen())));
}

class CounterScreen extends ConsumerWidget {
  const CounterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('DI 실습 카운터')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$count',
                style: const TextStyle(fontSize: 72, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              count > 0 ? '양수' : count < 0 ? '음수' : '0',
              style: TextStyle(
                color: count > 0
                    ? Colors.green
                    : count < 0 ? Colors.red : Colors.grey,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton(
            heroTag: 'inc',
            onPressed: () => ref.read(counterNotifierProvider.notifier).increment(),
            child: const Icon(Icons.add),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            heroTag: 'dec',
            onPressed: () => ref.read(counterNotifierProvider.notifier).decrement(),
            child: const Icon(Icons.remove),
          ),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- `CounterNotifier`가 Repository를 직접 생성하지 않고 UseCase를 통해 사용하는가?
- `InMemoryCounterRepository`를 `PersistentCounterRepository`로 교체할 때 Notifier 코드 수정이 없는가?
- GetIt에서 `CounterRepository`가 LazySingleton이므로 상태가 앱 전체에서 공유되는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** `registerSingleton`과 `registerLazySingleton`의 차이는?

- A) registerSingleton은 여러 인스턴스를, registerLazySingleton은 하나만 생성
- B) **registerSingleton은 즉시 인스턴스를 생성하고, registerLazySingleton은 처음 사용 시 생성** ✅
- C) registerLazySingleton은 Factory와 동일하다
- D) 기능 차이 없이 이름만 다르다

---

**Q2. [Understand]** Riverpod의 `ProviderOverride`가 테스트에서 유용한 이유는?

> **모범 답안:** 실제 앱에서 사용하는 `productRepositoryProvider`를 테스트 환경에서 `MockProductRepository`로 교체할 수 있다. 이를 통해 실제 API 서버 없이도 위젯 테스트가 가능하고, 특정 성공·실패 시나리오를 Mock으로 정확히 시뮬레이션할 수 있다. GetIt의 경우 전역 상태를 변경해야 하므로 테스트 간 격리가 어렵지만, Riverpod의 `ProviderScope`는 각 테스트마다 독립적인 스코프를 제공한다.

---

**Q3. [Apply]** GetIt에서 `ProductRepository`를 `LazySingleton`으로, `GetProductsUseCase`를 `Factory`로 등록해야 하는 이유를 각각 설명하라.

> **모범 답안:** `ProductRepository`는 내부 상태(캐시, DataSource 연결)를 유지하므로 앱 전체에서 하나의 인스턴스를 공유하는 `LazySingleton`이 적합하다. 처음 사용 시 생성되어 이후 계속 재사용된다. `GetProductsUseCase`는 상태를 갖지 않으므로 `Factory`가 적합하다. 매번 새 인스턴스를 생성해도 부작용이 없으며, 만약 `Singleton`으로 등록하면 UseCase 내부에 의도치 않은 상태가 생겼을 때 앱 전체에 영향을 미칠 수 있다.

---

**Q4. [Evaluate]** Bloc과 함께 사용할 때 GetIt과 Riverpod Provider 중 어느 쪽이 더 자연스럽고 그 이유는?

> **모범 답안:** **GetIt**이 더 자연스럽다. Bloc은 Riverpod과 독립적인 상태관리 시스템이므로, Riverpod Provider로 Bloc 인스턴스를 제공하면 두 상태관리 시스템이 혼재하는 어색한 구조가 된다. GetIt은 Flutter·Riverpod 독립적이므로 Bloc 인스턴스를 `registerFactory`로 등록하고 `BlocProvider(create: (_) => sl<ProductListBloc>())`처럼 자연스럽게 연결할 수 있다.

---

**Q5. [Apply]** 다음 클래스를 Injectable 어노테이션으로 올바르게 표시하라.

```dart
// AuthService: 앱 전체에서 하나만 존재
// ProductRepository: ProductRepositoryImpl이 구현체
// GetProductsUseCase: 매번 새 인스턴스
```

```dart
// 모범 답안
@singleton
class AuthService { ... }

@LazySingleton(as: ProductRepository)
class ProductRepositoryImpl implements ProductRepository { ... }

@injectable
class GetProductsUseCase {
  final ProductRepository _repo;
  GetProductsUseCase(this._repo);
}
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **DI**는 객체가 직접 의존성을 생성하지 않고 외부에서 주입받아, 구현체 교체와 테스트를 쉽게 만든다.
- **GetIt**: 전역 Service Locator. `registerSingleton`(즉시)·`registerLazySingleton`(지연)·`registerFactory`(매번)으로 등록. Bloc 등 다른 상태관리와 잘 어울린다.
- **Injectable**: GetIt 등록 코드를 `@singleton`·`@injectable`·`@module` 어노테이션으로 자동 생성.
- **Riverpod Provider**: 상태관리 + DI 통합. `ProviderOverride`로 테스트 시 Mock 교체가 매우 쉽다. Riverpod 프로젝트의 표준 DI.
- **환경별 분리**: Dev/Prod/Test 환경마다 다른 구현체를 주입해 개발 생산성과 테스트 격리성을 높인다.

### 6.2 다음 Step 예고

- **Step 23 — Flutter 테스팅:** Unit Test·Widget Test·Integration Test·Golden Test로 Flutter 앱의 품질을 검증하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                    | 링크                                                   | 설명                    |
| ----------------------- | ------------------------------------------------------ | ----------------------- |
| GetIt 공식 문서         | <https://pub.dev/packages/get_it>                        | GetIt 패키지            |
| Injectable 공식 문서    | <https://pub.dev/packages/injectable>                    | 코드 생성 DI            |
| Riverpod Provider as DI | <https://riverpod.dev/docs/concepts/combining_providers> | Riverpod DI 패턴        |
| Flutter Clean Arch + DI | <https://resocoder.com/flutter-clean-architecture-tdd>   | TDD + DI 튜토리얼       |
| Very Good CLI           | <https://pub.dev/packages/very_good_cli>                 | DI 포함 프로젝트 템플릿 |

### 6.4 FAQ

**Q. GetIt을 초기화하기 전에 `sl<T>()`를 호출하면 어떻게 되는가?**

> 등록되지 않은 타입을 요청하면 GetIt이 `StateError`를 던진다. `main()`에서 `configureDependencies()` 또는 `init()`을 반드시 먼저 실행해야 한다. 비동기 등록이 있는 경우 `await sl.allReady()`로 모든 비동기 등록이 완료될 때까지 기다릴 수 있다.

**Q. GetIt과 Riverpod을 같은 프로젝트에서 혼용해도 되는가?**

> 기술적으로 가능하다. 실제로 GetIt으로 Network·Repository를 관리하고 Riverpod으로 UI 상태를 관리하는 구조도 유효하다. 단, 팀 내에서 어떤 것이 어느 역할을 하는지 명확한 규칙을 정해야 한다.

**Q. Injectable의 코드 생성 파일(injection.config.dart)을 git에 포함해야 하는가?**

> 프로젝트 관행에 따라 다르다. 포함하면 CI에서 build_runner를 실행하지 않아도 되지만, PR 시 자동 생성 파일 변경이 많아 리뷰가 어렵다. 포함하지 않으면 CI 파이프라인에 `flutter pub run build_runner build` 단계를 추가해야 한다. 두 방법 모두 실무에서 사용된다.

---

## 빠른 자가진단 체크리스트

- [ ] Dependency Injection이 해결하는 문제를 설명할 수 있는가?
- [ ] GetIt의 registerSingleton·registerLazySingleton·registerFactory 차이를 설명할 수 있는가?
- [ ] Injectable 어노테이션(@singleton·@lazySingleton·@injectable·@module)의 역할을 설명할 수 있는가?
- [ ] Riverpod Provider로 Repository와 UseCase를 DI 연결하는 코드를 작성할 수 있는가?
- [ ] ProviderOverride로 테스트에서 Mock을 주입하는 방법을 설명할 수 있는가?
- [ ] 프로젝트 상황에 따라 GetIt과 Riverpod DI 중 어느 것을 선택할지 판단할 수 있는가?
- [ ] ⚠️ 함정 체크: GetIt 초기화 전 sl<T>() 호출 시 StateError가 발생한다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: sl<T>()를 build()·initState() 같은 생명주기 내부에서 자주 호출하는 것이 안티패턴인 이유를 설명할 수 있는가?
