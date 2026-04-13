# Step 18 — 로컬 데이터 저장

> **파트:** 5️⃣ 비동기 및 데이터 | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** SharedPreferences·SQLite·Hive·Firebase Firestore 각각의 특징과 적합한 사용 시나리오를 설명할 수 있다.
2. **[Understand]** Hive의 Box 개념과 TypeAdapter를 통한 커스텀 객체 저장 원리를 설명할 수 있다.
3. **[Understand]** Firebase Firestore의 Offline 캐싱이 동작하는 방식을 설명할 수 있다.
4. **[Apply]** SharedPreferences로 간단한 설정값을 저장·불러올 수 있다.
5. **[Apply]** Hive로 구조화된 객체를 로컬에 저장하고 CRUD를 구현할 수 있다.
6. **[Analyze]** 주어진 데이터 특성에 따라 적합한 로컬 저장소를 선택하고 근거를 제시할 수 있다.

**전제 지식:** Step 02(async/await), Step 05(StatefulWidget·dispose), Step 17(HTTP 통신·JSON)

---

## 1. 서론

### 1.1 로컬 데이터 저장이 필요한 이유

서버에서 데이터를 받더라도, 기기에 저장해야 하는 상황이 있다.

```
로컬 저장이 필요한 시나리오
──────────────────────────────────────────────────────
  ① 오프라인 지원
     → 네트워크 없어도 최근 데이터 표시
     → YouTube 다운로드 영상, 카카오톡 대화 기록

  ② 사용자 설정 유지
     → 다크모드 설정, 언어 선택, 알림 ON/OFF
     → 앱 재시작 후에도 유지

  ③ 인증 토큰 저장
     → 로그인 상태 유지 (AccessToken, RefreshToken)

  ④ 캐시로 성능 향상
     → API 응답을 로컬에 저장 → 빠른 초기 로딩
     → 네트워크 비용 절감
──────────────────────────────────────────────────────
```

### 1.2 로컬 저장소 종류 한눈에 보기

```
저장소 선택 가이드
──────────────────────────────────────────────────────
  데이터 크기   구조        선택 저장소
  ─────────    ──────      ─────────────
  소량         단순 Key-Value → SharedPreferences
  중량         객체·목록     → Hive
  대량         관계형        → SQLite (sqflite)
  실시간·동기  클라우드+오프라인 → Firebase Firestore
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

![로컬 저장소 hierarchy](/developer-open-book/diagrams/step18-local-storage.svg)

---

## 2. 기본 개념과 용어

| 용어                    | 정의                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **SharedPreferences**   | Android/iOS의 기본 Key-Value 저장소를 Flutter에서 사용하는 패키지. 간단한 설정값 저장에 적합  |
| **Hive**                | Flutter/Dart용 경량 NoSQL 로컬 데이터베이스. Box 단위로 데이터를 관리하며 빠른 읽기/쓰기 성능 |
| **Box**                 | Hive의 저장 단위. 하나의 Box는 하나의 파일에 대응하며, 키-값 형태로 데이터를 저장             |
| **TypeAdapter**         | Hive에서 커스텀 Dart 객체를 바이너리로 직렬화/역직렬화하는 클래스                             |
| **sqflite**             | Flutter의 SQLite 패키지. 관계형 데이터베이스 기능과 SQL 쿼리를 지원                           |
| **Database**            | sqflite에서 SQLite 데이터베이스 인스턴스를 나타내는 객체                                      |
| **Firebase Firestore**  | Google의 클라우드 NoSQL 데이터베이스. 실시간 업데이트와 오프라인 캐싱을 지원                  |
| **Offline Persistence** | Firestore가 네트워크 없이도 로컬 캐시에서 데이터를 읽고 쓰는 기능                             |
| **Pending Write**       | 오프라인 상태에서 Firestore에 쓴 데이터. 온라인 복귀 시 자동으로 서버에 동기화됨              |
| **secure_storage**      | flutter_secure_storage 패키지. OS의 Keychain/Keystore를 활용한 암호화 저장                    |
| **openBox()**           | Hive에서 Box를 여는 비동기 메서드. 앱 초기화 시 필요한 Box를 사전에 열어야 함                 |
| **lazyBox**             | Hive의 지연 로딩 Box. 큰 데이터를 필요할 때만 메모리에 로드                                   |
| **CRUD**                | Create·Read·Update·Delete. 데이터 저장소의 기본 4가지 操작                                    |
| **트랜잭션**            | 여러 데이터베이스 작업을 원자적으로 처리하는 묶음. 일부 실패 시 전체 롤백                     |

---

## 3. 이론적 배경과 원리 ★

### 3.1 SharedPreferences: 간단한 설정 저장

`SharedPreferences`는 Android의 SharedPreferences와 iOS의 NSUserDefaults를 Flutter에서 통합한 패키지다. 앱 설정·사용자 선호도·인증 토큰 같은 간단한 값을 영구 저장한다.

#### 설치

```yaml
# pubspec.yaml
dependencies:
  shared_preferences: ^2.2.0
```

#### 기본 사용법

```dart
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static SharedPreferences? _prefs;

  // 초기화 (앱 시작 시 한 번 호출)
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── 저장 (set) ─────────────────────────────────────
  static Future<void> setDarkMode(bool value) async {
    await _prefs!.setBool('dark_mode', value);
  }
  static Future<void> setLanguage(String code) async {
    await _prefs!.setString('language', code);
  }
  static Future<void> setUserId(int id) async {
    await _prefs!.setInt('user_id', id);
  }
  static Future<void> setAccessToken(String token) async {
    await _prefs!.setString('access_token', token);
  }
  static Future<void> setRecentSearches(List<String> items) async {
    await _prefs!.setStringList('recent_searches', items);
  }

  // ── 읽기 (get) ─────────────────────────────────────
  static bool   isDarkMode()      => _prefs!.getBool('dark_mode')        ?? false;
  static String getLanguage()     => _prefs!.getString('language')       ?? 'ko';
  static int?   getUserId()       => _prefs!.getInt('user_id');
  static String? getAccessToken() => _prefs!.getString('access_token');
  static List<String> getRecentSearches() =>
      _prefs!.getStringList('recent_searches') ?? [];

  // ── 삭제 ────────────────────────────────────────────
  static Future<void> removeAccessToken() async {
    await _prefs!.remove('access_token');
  }
  static Future<void> clear() async {
    await _prefs!.clear();  // 모든 값 삭제
  }
}

// main.dart 초기화
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PreferencesService.init();
  runApp(const MyApp());
}
```

**지원하는 타입:**

| 메서드                            | 타입           |
| --------------------------------- | -------------- |
| `setBool` / `getBool`             | `bool`         |
| `setInt` / `getInt`               | `int`          |
| `setDouble` / `getDouble`         | `double`       |
| `setString` / `getString`         | `String`       |
| `setStringList` / `getStringList` | `List<String>` |

> ⚠️ **함정 주의:** SharedPreferences는 **암호화되지 않는다**. 접근 토큰·비밀번호 같은 민감한 데이터는 `flutter_secure_storage` 패키지를 사용해야 한다. 이 패키지는 Android Keystore·iOS Keychain을 활용해 안전하게 저장한다.

---

### 3.2 Hive: 경량 NoSQL 로컬 DB

Hive는 순수 Dart로 작성된 고성능 NoSQL 데이터베이스다. SQLite보다 읽기 속도가 빠르며, TypeAdapter를 통해 커스텀 객체를 바이너리로 저장한다.

#### 설치

```yaml
dependencies:
  hive_flutter: ^1.1.0
dev_dependencies:
  hive_generator: ^2.0.0
  build_runner: ^2.4.0
```

#### 기본 타입 저장 (TypeAdapter 불필요)

```dart
// 초기화
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();           // 앱 문서 디렉토리에 Hive 초기화
  await Hive.openBox('settings');     // Box 열기
  await Hive.openBox('cart');
  runApp(const MyApp());
}

// 기본 타입 CRUD
class HiveSettingsService {
  final Box _box = Hive.box('settings');

  // 저장
  void setTheme(String theme)   => _box.put('theme', theme);
  void setFontSize(double size) => _box.put('font_size', size);

  // 읽기
  String getTheme()    => _box.get('theme',     defaultValue: 'system');
  double getFontSize() => _box.get('font_size', defaultValue: 14.0);

  // 삭제
  void removeTheme()   => _box.delete('theme');
  void clearAll()      => _box.clear();
}
```

#### 커스텀 객체 저장 (TypeAdapter)

```dart
// 모델 클래스 정의 (hive_generator 사용)
import 'package:hive/hive.dart';

part 'cart_item.g.dart';   // 코드 생성 파일

@HiveType(typeId: 0)       // typeId는 앱 전체에서 고유해야 함
class CartItem extends HiveObject {
  @HiveField(0) late String id;
  @HiveField(1) late String name;
  @HiveField(2) late double price;
  @HiveField(3) late int quantity;
  @HiveField(4) late String? imageUrl;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });
}

// TypeAdapter 생성: 터미널에서 실행
// flutter pub run build_runner build

// 등록 및 Box 열기
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(CartItemAdapter()); // ← 생성된 Adapter 등록
  await Hive.openBox<CartItem>('cart');
  runApp(const MyApp());
}
```

#### Hive CRUD 구현

```dart
class CartRepository {
  Box<CartItem> get _box => Hive.box<CartItem>('cart');

  // 전체 조회
  List<CartItem> getAll() => _box.values.toList();

  // 단일 조회
  CartItem? getById(String id) {
    try {
      return _box.values.firstWhere((item) => item.id == id);
    } catch (_) {
      return null;
    }
  }

  // 추가
  Future<void> add(CartItem item) async {
    await _box.put(item.id, item);   // key = item.id
  }

  // 수량 수정
  Future<void> updateQuantity(String id, int quantity) async {
    final item = getById(id);
    if (item == null) return;
    item.quantity = quantity;
    await item.save();               // HiveObject.save() 편의 메서드
  }

  // 삭제
  Future<void> remove(String id) async {
    await _box.delete(id);
  }

  // 전체 삭제
  Future<void> clear() async {
    await _box.clear();
  }

  // 총 가격 계산
  double getTotalPrice() =>
      _box.values.fold(0, (sum, item) => sum + item.price * item.quantity);
}
```

#### ValueListenableBuilder로 Hive 변경 감지

```dart
// Hive Box는 Listenable을 구현 → ValueListenableBuilder 사용 가능
ValueListenableBuilder(
  valueListenable: Hive.box<CartItem>('cart').listenable(),
  builder: (context, Box<CartItem> box, _) {
    final items = box.values.toList();
    if (items.isEmpty) {
      return const Center(child: Text('장바구니가 비어있습니다'));
    }
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (_, i) => ListTile(
        title: Text(items[i].name),
        subtitle: Text('${items[i].quantity}개 × ₩${items[i].price}'),
        trailing: IconButton(
          icon: const Icon(Icons.delete),
          onPressed: () => items[i].delete(),  // HiveObject.delete()
        ),
      ),
    );
  },
)
```

> ⚠️ **함정 주의:** `typeId`는 한 번 정해지면 변경하면 안 된다. 앱 업데이트 시 typeId를 바꾸면 기존 데이터를 읽지 못하는 버그가 발생한다. `HiveField`의 인덱스도 마찬가지로 기존 필드를 삭제하지 말고 새 필드는 새 번호를 부여한다.

---

### 3.3 SQLite (sqflite): 관계형 데이터베이스

복잡한 데이터 관계·검색·정렬이 필요할 때 SQLite를 사용한다.

```yaml
dependencies:
  sqflite: ^2.3.0
  path: ^1.9.0
```

```dart
class DatabaseHelper {
  static Database? _database;

  static Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final path = join(await getDatabasesPath(), 'app.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  static Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE products (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT    NOT NULL,
        price    REAL    NOT NULL,
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');
    await db.execute('''
      CREATE TABLE cart_items (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity   INTEGER NOT NULL DEFAULT 1
      )
    ''');
  }

  // 스키마 변경 시 (앱 업데이트)
  static Future<void> _onUpgrade(Database db, int oldV, int newV) async {
    if (oldV < 2) {
      await db.execute('ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0');
    }
  }
}

// Repository
class ProductSqlRepository {
  Future<Database> get _db => DatabaseHelper.database;

  // 전체 조회
  Future<List<Product>> getAll({String? category}) async {
    final db = await _db;
    final maps = await db.query(
      'products',
      where: category != null ? 'category = ?' : null,
      whereArgs: category != null ? [category] : null,
      orderBy: 'created_at DESC',
    );
    return maps.map(Product.fromMap).toList();
  }

  // 검색
  Future<List<Product>> search(String keyword) async {
    final db = await _db;
    final maps = await db.rawQuery('''
      SELECT * FROM products
      WHERE name LIKE ? OR category LIKE ?
      ORDER BY name ASC
    ''', ['%$keyword%', '%$keyword%']);
    return maps.map(Product.fromMap).toList();
  }

  // 추가
  Future<int> insert(Product product) async {
    final db = await _db;
    return db.insert('products', product.toMap());
  }

  // 수정
  Future<int> update(Product product) async {
    final db = await _db;
    return db.update(
      'products',
      product.toMap(),
      where: 'id = ?',
      whereArgs: [product.id],
    );
  }

  // 삭제
  Future<int> delete(int id) async {
    final db = await _db;
    return db.delete('products', where: 'id = ?', whereArgs: [id]);
  }

  // 트랜잭션
  Future<void> transferStock(int fromId, int toId, int quantity) async {
    final db = await _db;
    await db.transaction((txn) async {
      await txn.rawUpdate(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [quantity, fromId],
      );
      await txn.rawUpdate(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [quantity, toId],
      );
    });
  }
}
```

---

### 3.4 Firebase Firestore Offline 캐싱

Firebase Firestore는 클라우드 NoSQL 데이터베이스로, 기본적으로 **오프라인 지속성(Offline Persistence)**을 지원한다.

```yaml
dependencies:
  firebase_core: ^3.0.0
  cloud_firestore: ^5.0.0
```

#### Offline Persistence 동작 원리

```
온라인 상태
──────────────────────────────────────────────────────
  앱 → Firestore 읽기 → 클라우드 DB에서 데이터 반환
                     → 로컬 캐시에도 저장

오프라인 상태
──────────────────────────────────────────────────────
  앱 → Firestore 읽기 → 로컬 캐시에서 데이터 반환 (자동)
  앱 → Firestore 쓰기 → Pending Write로 로컬 저장
                     → 온라인 복귀 시 자동 동기화

개발자가 별도 구현 없음 — Firestore가 자동 처리
──────────────────────────────────────────────────────
```

```dart
// 초기화 (오프라인 지속성 설정)
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Android: 기본으로 활성화
  // iOS: 기본으로 활성화
  // Web: 명시적 활성화 필요
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
    cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,  // 캐시 크기 무제한
  );

  runApp(const MyApp());
}

// Firestore CRUD
class ProductFirestoreRepository {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference get _collection => _db.collection('products');

  // 실시간 스트림 (오프라인 캐시 자동 활용)
  Stream<List<Product>> watchProducts() {
    return _collection
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Product.fromFirestore(doc))
            .toList());
  }

  // 단일 조회
  Future<Product?> getProduct(String id) async {
    final doc = await _collection.doc(id).get();
    if (!doc.exists) return null;
    return Product.fromFirestore(doc);
  }

  // 추가
  Future<String> addProduct(Product product) async {
    final docRef = await _collection.add(product.toFirestore());
    return docRef.id;
  }

  // 수정 (merge: 지정 필드만 수정)
  Future<void> updateProduct(String id, Map<String, dynamic> data) async {
    await _collection.doc(id).update(data);
  }

  // 삭제
  Future<void> deleteProduct(String id) async {
    await _collection.doc(id).delete();
  }

  // 배치 쓰기 (여러 작업 원자적 처리)
  Future<void> batchUpdate(List<Product> products) async {
    final batch = _db.batch();
    for (final product in products) {
      batch.update(_collection.doc(product.id), product.toFirestore());
    }
    await batch.commit();
  }
}

// Firestore 모델 변환
extension ProductFirestoreExtension on Product {
  factory Product.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Product(
      id:        doc.id,
      name:      data['name']  as String,
      price:     (data['price'] as num).toDouble(),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() => {
    'name':      name,
    'price':     price,
    'createdAt': FieldValue.serverTimestamp(),
  };
}
```

#### 오프라인 상태 감지

```dart
// 오프라인/온라인 상태에 따른 UI 분기
StreamBuilder<DocumentSnapshot>(
  stream: FirebaseFirestore.instance
      .collection('products')
      .doc(productId)
      .snapshots(),
  builder: (context, snapshot) {
    if (snapshot.hasError) return const Text('오류 발생');
    if (!snapshot.hasData) return const CircularProgressIndicator();

    // metadata.isFromCache: 로컬 캐시에서 왔는지 여부
    final isFromCache = snapshot.data!.metadata.isFromCache;
    final product = Product.fromFirestore(snapshot.data!);

    return Column(
      children: [
        if (isFromCache)
          const Banner(
            message: '오프라인 데이터',
            location: BannerLocation.topEnd,
            child: SizedBox.shrink(),
          ),
        ProductDetailView(product: product),
      ],
    );
  },
)
```

---

### 3.5 저장소 선택 가이드 요약

| 데이터 특성                  | 권장 저장소                | 이유                     |
| ---------------------------- | -------------------------- | ------------------------ |
| 설정값·토큰(단순 KV)         | SharedPreferences          | 가장 단순·가벼움         |
| 민감한 데이터(토큰·비밀번호) | flutter_secure_storage     | OS 암호화 저장소         |
| 중소량 객체·목록             | Hive                       | 빠른 성능, 간편한 API    |
| 복잡한 관계형 데이터·검색    | sqflite                    | SQL 쿼리, JOIN           |
| 실시간 동기화 + 오프라인     | Firebase Firestore         | 클라우드 + 오프라인 통합 |
| 대용량 파일(이미지·동영상)   | 파일 시스템(path_provider) | 파일로 직접 저장         |

---

### 3.6 flutter_secure_storage: 민감 데이터 보호

```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
```

```dart
class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: 'access_token',  value: accessToken),
      _storage.write(key: 'refresh_token', value: refreshToken),
    ]);
  }

  static Future<String?> getAccessToken() =>
      _storage.read(key: 'access_token');

  static Future<String?> getRefreshToken() =>
      _storage.read(key: 'refresh_token');

  static Future<void> deleteAllTokens() => _storage.deleteAll();
}
```

---

## 4. 사례 연구

### 4.1 오프라인 우선(Offline-First) 전략

네트워크가 불안정한 환경에서도 앱이 잘 동작하도록 하는 전략이다.

![오프라인 우선 데이터 흐름](/developer-open-book/diagrams/step18-offline-first.svg)

```dart
class ProductRepository {
  final ProductRemoteDataSource _remote;
  final Box<CachedProduct> _cache = Hive.box<CachedProduct>('products_cache');

  Future<List<Product>> getProducts() async {
    // 1. 캐시에서 즉시 반환
    final cached = _cache.values
        .map((cp) => cp.toProduct())
        .toList();

    // 2. 백그라운드에서 서버 데이터 갱신
    _refreshFromServer();

    return cached;
  }

  Future<void> _refreshFromServer() async {
    try {
      final products = await _remote.fetchProducts();
      // 캐시 업데이트
      await _cache.clear();
      for (final p in products) {
        await _cache.put(p.id, CachedProduct.fromProduct(p));
      }
    } catch (_) {
      // 실패해도 캐시 데이터로 이미 표시 중 → 무시
    }
  }
}
```

---

### 4.2 최근 검색어 관리 (SharedPreferences + Riverpod)

```dart
class SearchHistoryNotifier extends Notifier<List<String>> {
  static const _key = 'search_history';
  static const _maxCount = 10;

  @override
  List<String> build() {
    final prefs = ref.watch(prefsProvider);
    return prefs.getStringList(_key) ?? [];
  }

  Future<void> addSearch(String query) async {
    if (query.trim().isEmpty) return;
    final prefs = ref.read(prefsProvider);
    final history = [...state];

    history.remove(query);           // 중복 제거
    history.insert(0, query);        // 최신 검색어를 앞에
    if (history.length > _maxCount) {
      history.removeLast();          // 최대 개수 유지
    }

    await prefs.setStringList(_key, history);
    state = history;
  }

  Future<void> removeSearch(String query) async {
    final prefs = ref.read(prefsProvider);
    final history = state.where((e) => e != query).toList();
    await prefs.setStringList(_key, history);
    state = history;
  }

  Future<void> clearAll() async {
    final prefs = ref.read(prefsProvider);
    await prefs.remove(_key);
    state = [];
  }
}

final searchHistoryProvider =
    NotifierProvider<SearchHistoryNotifier, List<String>>(
  SearchHistoryNotifier.new,
);
```

---

### 4.3 Hive + Riverpod으로 장바구니 구현

```dart
// Riverpod + Hive 통합 패턴
final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(
  CartNotifier.new,
);

class CartNotifier extends Notifier<List<CartItem>> {
  Box<CartItem> get _box => Hive.box<CartItem>('cart');

  @override
  List<CartItem> build() => _box.values.toList();

  Future<void> add(CartItem item) async {
    final existing = _box.get(item.id);
    if (existing != null) {
      existing.quantity += 1;
      await existing.save();
    } else {
      await _box.put(item.id, item);
    }
    state = _box.values.toList();  // Riverpod 상태 갱신
  }

  Future<void> remove(String id) async {
    await _box.delete(id);
    state = _box.values.toList();
  }

  Future<void> clear() async {
    await _box.clear();
    state = [];
  }

  int get totalCount =>
      state.fold(0, (sum, item) => sum + item.quantity);
  double get totalPrice =>
      state.fold(0.0, (sum, item) => sum + item.price * item.quantity);
}
```

---

## 5. 실습

### 5.1 SharedPreferences + Hive 통합 설정 화면

```dart
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await Hive.openBox('notes');
  await SharedPreferences.getInstance();
  runApp(const MaterialApp(home: SettingsDemo()));
}

class SettingsDemo extends StatefulWidget {
  const SettingsDemo({super.key});
  @override
  State<SettingsDemo> createState() => _SettingsDemoState();
}

class _SettingsDemoState extends State<SettingsDemo> {
  final Box _noteBox = Hive.box('notes');
  late SharedPreferences _prefs;
  bool _darkMode = false;
  String _language = 'ko';
  final _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    _prefs = await SharedPreferences.getInstance();
    setState(() {
      _darkMode  = _prefs.getBool('dark_mode')  ?? false;
      _language  = _prefs.getString('language') ?? 'ko';
    });
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: _darkMode ? ThemeData.dark() : ThemeData.light(),
      home: Scaffold(
        appBar: AppBar(title: const Text('로컬 저장소 실습')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── SharedPreferences 섹션 ──────────────────
            const Text('SharedPreferences',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            SwitchListTile(
              title: const Text('다크 모드'),
              value: _darkMode,
              onChanged: (v) async {
                await _prefs.setBool('dark_mode', v);
                setState(() => _darkMode = v);
              },
            ),
            ListTile(
              title: const Text('언어 설정'),
              trailing: DropdownButton<String>(
                value: _language,
                items: const [
                  DropdownMenuItem(value: 'ko', child: Text('한국어')),
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(value: 'ja', child: Text('日本語')),
                ],
                onChanged: (v) async {
                  if (v == null) return;
                  await _prefs.setString('language', v);
                  setState(() => _language = v);
                },
              ),
            ),
            const Divider(height: 32),

            // ── Hive 섹션 ──────────────────────────────
            const Text('Hive 메모',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _noteController,
                    decoration: const InputDecoration(
                        hintText: '메모 입력', border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: () {
                    if (_noteController.text.trim().isEmpty) return;
                    _noteBox.add(_noteController.text.trim());
                    _noteController.clear();
                    setState(() {});
                  },
                  child: const Text('저장'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ValueListenableBuilder(
              valueListenable: _noteBox.listenable(),
              builder: (context, Box box, _) {
                if (box.isEmpty) {
                  return const Text('저장된 메모 없음',
                      style: TextStyle(color: Colors.grey));
                }
                return Column(
                  children: box.keys.map((key) {
                    return ListTile(
                      title: Text(box.get(key).toString()),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () {
                          box.delete(key);
                          setState(() {});
                        },
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

**확인 포인트:**

- 다크모드 토글 후 앱을 재시작해도 설정이 유지되는가?
- 메모를 추가하면 Hive Box에 즉시 반영되는가?
- 메모 삭제 시 `ValueListenableBuilder`가 자동으로 UI를 갱신하는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** SharedPreferences에 저장하면 안 되는 데이터 종류는?

- A) 언어 설정 코드 (예: "ko")
- B) 다크모드 여부 (true/false)
- C) **JWT 액세스 토큰, 비밀번호 해시** ✅
- D) 마지막 열람 화면 ID

---

**Q2. [Understand]** Hive에서 `typeId`를 한 번 설정 후 변경하면 안 되는 이유는?

> **모범 답안:** `typeId`는 Hive가 저장된 바이너리 데이터와 Dart 클래스를 매핑하는 식별자다. 이미 저장된 데이터는 이전 `typeId`로 직렬화되어 있다. `typeId`를 바꾸면 Hive가 기존 데이터를 어떤 TypeAdapter로 읽어야 하는지 알 수 없어 역직렬화에 실패하고 데이터 손실이 발생한다.

---

**Q3. [Understand]** Firebase Firestore의 `metadata.isFromCache`는 어떤 상황에서 true가 되는가?

> **모범 답안:** 기기가 오프라인 상태이거나 네트워크 요청이 아직 완료되지 않았을 때, Firestore가 로컬 캐시에서 데이터를 반환하면 `isFromCache == true`가 된다. 이 값을 확인해 "오프라인 데이터" 배너를 표시하거나, 데이터의 최신성을 사용자에게 알릴 수 있다.

---

**Q4. [Analyze]** 아래 데이터 요구사항에 맞는 저장소를 선택하고 이유를 서술하라.

```
데이터: 사용자가 즐겨찾기한 식당 목록
요구사항:
  - 식당 이름, 주소, 메뉴 카테고리, 좋아요 날짜
  - 카테고리별 필터링 기능
  - 최근 즐겨찾기 순 정렬
  - 네트워크 없이도 조회 가능
  - 수천 건 이상 저장 가능
```

> **모범 답안:** **sqflite(SQLite)** 를 선택한다. ① 카테고리별 필터링과 정렬은 SQL의 `WHERE category = ?` 및 `ORDER BY liked_at DESC`로 간결하게 처리할 수 있다. ② 수천 건 이상의 데이터를 효율적으로 다루는 데 관계형 DB가 적합하다. ③ 네트워크 없이도 로컬에서 동작한다. Hive도 가능하지만 복잡한 쿼리·정렬이 필요하면 sqflite가 더 자연스럽다.

---

**Q5. [Apply]** Hive에서 `HiveObject`를 상속한 클래스의 `save()` 메서드와 직접 `box.put()`의 차이를 설명하라.

> **모범 답안:** `HiveObject`를 상속하면 객체가 자신이 어느 Box의 어느 키에 저장되어 있는지 알고 있다. `item.save()`를 호출하면 객체가 직접 자신의 Box와 키를 알기 때문에 별도로 Box를 참조하거나 키를 지정할 필요가 없다. `box.put(key, value)`는 Box를 직접 참조해 저장하는 방식으로, 더 명시적이지만 코드가 길어진다. `HiveObject.delete()`도 같은 원리로 Box와 키 없이 삭제할 수 있다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **SharedPreferences**: 단순 Key-Value 설정값 저장. 암호화 없음 → 민감 데이터 금지.
- **flutter_secure_storage**: 토큰·비밀번호 등 민감 데이터. Android Keystore/iOS Keychain 활용.
- **Hive**: 경량 NoSQL 로컬 DB. TypeAdapter로 커스텀 객체 저장. `typeId`·`HiveField` 인덱스 변경 금지.
- **sqflite**: 관계형 DB. 복잡한 검색·정렬·JOIN이 필요할 때 사용.
- **Firebase Firestore**: 클라우드 + 오프라인 통합. `enablePersistence: true`로 자동 캐싱. `isFromCache`로 상태 감지.
- **오프라인 우선 전략**: 캐시 먼저 표시 → 백그라운드 서버 갱신 → UI 업데이트.

### 6.2 다음 Step 예고

- **Step 19 — 애니메이션:** AnimationController, Hero, ImplicitlyAnimatedWidget, Tween, Curve를 활용해 앱에 생동감 있는 애니메이션을 구현한다.

### 6.3 참고 자료

| 자료                        | 링크                                                                    | 설명             |
| --------------------------- | ----------------------------------------------------------------------- | ---------------- |
| SharedPreferences 공식 문서 | <https://pub.dev/packages/shared_preferences>                           | 패키지 문서      |
| Hive 공식 문서              | <https://docs.hivedb.dev>                                               | Hive 전체 가이드 |
| sqflite 공식 문서           | <https://pub.dev/packages/sqflite>                                      | SQLite 패키지    |
| Flutter Secure Storage      | <https://pub.dev/packages/flutter_secure_storage>                       | 암호화 저장소    |
| Firestore Offline 공식 문서 | <https://firebase.google.com/docs/firestore/manage-data/enable-offline> | Offline 가이드   |

### 6.4 FAQ

**Q. SharedPreferences와 Hive 중 어떤 것을 기본으로 사용해야 하는가?**

> 단순 설정값(bool·String·int)은 SharedPreferences가 더 간단하다. 객체·목록을 저장하거나 여러 종류의 데이터를 관리해야 한다면 Hive가 더 적합하다. 프로젝트 초기에 Hive를 선택하면 SharedPreferences 기능도 포함하므로 일원화할 수 있다.

**Q. Hive의 `openBox()`를 모든 화면에서 호출해야 하는가?**

> 아니다. Box는 한 번 열면 앱이 실행되는 동안 메모리에 유지된다. `main()`에서 필요한 모든 Box를 미리 열어두고, 이후에는 `Hive.box('name')`으로 동기적으로 접근한다. 이미 열린 Box에 `openBox()`를 다시 호출하면 기존 Box 인스턴스를 반환한다.

**Q. Firebase Firestore를 오프라인으로만 사용할 수 있는가?**

> 기술적으로는 가능하지만 권장하지 않는다. Firestore는 클라우드 동기화가 핵심 가치다. 순수 로컬 저장이 목적이라면 Hive나 sqflite가 더 가볍고 적합하다. Firestore는 오프라인 지원이 있는 클라우드 동기화 솔루션으로 사용하는 것이 바람직하다.

---

## 빠른 자가진단 체크리스트

- [ ] SharedPreferences가 지원하는 5가지 타입을 나열할 수 있는가?
- [ ] SharedPreferences에 JWT 토큰을 저장하면 안 되는 이유를 설명할 수 있는가?
- [ ] Hive Box를 열고 기본 타입을 저장·읽는 코드를 작성할 수 있는가?
- [ ] Hive TypeAdapter가 필요한 이유와 생성 방법을 설명할 수 있는가?
- [ ] `typeId`와 `HiveField` 인덱스를 변경하면 안 되는 이유를 설명할 수 있는가?
- [ ] Firestore의 `isFromCache`를 활용해 오프라인 상태를 감지하는 방법을 설명할 수 있는가?
- [ ] 주어진 데이터 요구사항에 맞는 저장소를 선택할 수 있는가?
- [ ] ⚠️ 함정 체크: SharedPreferences는 암호화되지 않아 민감 데이터 저장에 부적합하다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: Hive typeId 변경 시 기존 데이터를 읽지 못하는 문제를 이해했는가?
