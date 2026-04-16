# Step 21 — 테스트와 디버깅

> **Phase 6 | 실전 품질 관리** | 예상 소요: 3일 | 블룸 수준: Apply ~ Evaluate

---

## 📋 목차

- [Step 21 — 테스트와 디버깅](#step-21--테스트와-디버깅)
  - [📋 목차](#-목차)
  - [1. 학습 목표](#1-학습-목표)
  - [2. 서론](#2-서론)
    - [왜 테스트를 작성하는가](#왜-테스트를-작성하는가)
  - [3. Dart 테스트 환경 구성](#3-dart-테스트-환경-구성)
    - [`pubspec.yaml` 설정](#pubspecyaml-설정)
    - [디렉토리 구조](#디렉토리-구조)
    - [테스트 실행 명령](#테스트-실행-명령)
  - [4. 단위 테스트 기본](#4-단위-테스트-기본)
    - [4.1 `test()` / `group()` / `setUp()` / `tearDown()`](#41-test--group--setup--teardown)
    - [4.2 Matcher — 검증 표현식](#42-matcher--검증-표현식)
    - [4.3 좋은 테스트의 구조 (AAA 패턴)](#43-좋은-테스트의-구조-aaa-패턴)
  - [5. 비동기 테스트](#5-비동기-테스트)
    - [5.1 `async` / `await` 테스트](#51-async--await-테스트)
    - [5.2 `Stream` 테스트](#52-stream-테스트)
    - [5.3 타임아웃 설정](#53-타임아웃-설정)
  - [6. 예외 테스트](#6-예외-테스트)
  - [7. Mock 객체 — `mockito`](#7-mock-객체--mockito)
    - [7.1 Mock 기본 설정](#71-mock-기본-설정)
    - [7.2 `when` / `verify`](#72-when--verify)
    - [7.3 Mock과 Stub의 차이](#73-mock과-stub의-차이)
  - [8. Sealed Class / Result 타입 테스트](#8-sealed-class--result-타입-테스트)
  - [9. 테스트 커버리지와 구조화](#9-테스트-커버리지와-구조화)
    - [9.1 파일 구조](#91-파일-구조)
    - [9.2 테스트 그룹화 전략](#92-테스트-그룹화-전략)
    - [9.3 커버리지 측정](#93-커버리지-측정)
  - [10. 디버깅 기법](#10-디버깅-기법)
    - [10.1 `assert`와 디버그 모드](#101-assert와-디버그-모드)
    - [10.2 로깅 전략](#102-로깅-전략)
    - [10.3 `dart:developer` 활용](#103-dartdeveloper-활용)
  - [11. 실습](#11-실습)
    - [실습 11-1: Stack 클래스 단위 테스트 작성](#실습-11-1-stack-클래스-단위-테스트-작성)
    - [실습 11-2: 비동기 + Mock 테스트](#실습-11-2-비동기--mock-테스트)
    - [실습 11-3: Sealed Class 테스트 커스텀 Matcher](#실습-11-3-sealed-class-테스트-커스텀-matcher)
  - [12. 핵심 요약 및 다음 단계](#12-핵심-요약-및-다음-단계)
    - [✅ 이 문서에서 배운 것](#-이-문서에서-배운-것)
    - [🔗 다음 단계](#-다음-단계)
    - [📚 참고 자료](#-참고-자료)
    - [❓ 자가진단 퀴즈](#-자가진단-퀴즈)

---

## 1. 학습 목표

이 문서를 읽고 나면 학습자는:

| #   | 블룸 단계     | 목표                                                                                           |
| --- | ------------- | ---------------------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | `test`, `group`, `setUp`, `tearDown`, `expect`, `Matcher`의 역할을 나열할 수 있다              |
| 2   | 🟢 Understand | AAA 패턴(Arrange-Act-Assert)이 테스트 가독성을 높이는 이유를 설명할 수 있다                    |
| 3   | 🟢 Understand | Mock과 Stub의 차이와 각각이 적합한 상황을 설명할 수 있다                                       |
| 4   | 🟡 Apply      | `test` 패키지로 동기·비동기·예외·Stream 테스트를 작성할 수 있다                                |
| 5   | 🟡 Apply      | `mockito`로 의존성을 Mock으로 교체하고 `verify`로 상호작용을 검증할 수 있다                    |
| 6   | 🔴 Evaluate   | 주어진 코드의 테스트 전략(단위/통합, 실제 의존성/Mock)을 평가하고 최적 접근법을 제안할 수 있다 |

---

## 2. 서론

### 왜 테스트를 작성하는가

```
테스트 없이 개발한다면:
  - 코드 변경 시 무엇이 망가졌는지 알 수 없음
  - 리팩토링이 두려움 — 건드릴수록 불안
  - 버그가 운영 환경에서 발견됨 (가장 비싼 시점)
  - 코드 동작을 문서화하기 어려움

테스트를 작성한다면:
  - 변경 후 즉시 회귀(Regression) 감지
  - 자신 있는 리팩토링 — 테스트가 망가지면 바로 앎
  - 버그를 개발 중 발견 (가장 저렴한 시점)
  - 테스트 자체가 동작 명세가 됨
```

**테스트 피라미드**

```
         /▲\
        / E2E \        ← 소수, 느림, 비용 큼
       /───────\
      /  통합   \      ← 중간, 실제 DB/API 연동
     /───────────\
    /   단위 테스트 \   ← 다수, 빠름, 격리됨
   /───────────────\
```

> **전제 지식**: Step 8~13 (클래스, OOP, 예외), Step 14 (비동기), Step 16~18 (제네릭, sealed class)

---

## 3. Dart 테스트 환경 구성

### `pubspec.yaml` 설정

```yaml
name: my_app
environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  # 프로덕션 의존성

dev_dependencies:
  test: ^1.24.0 # 테스트 프레임워크
  mockito: ^5.4.0 # Mock 객체 생성
  build_runner: ^2.4.0 # 코드 생성 (mockito 사용 시)
```

### 디렉토리 구조

```
my_app/
├── lib/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── user.dart
│   │   │   └── user_repository.dart
│   │   └── service/
│   │       └── user_service.dart
│   └── my_app.dart
└── test/
    ├── domain/
    │   ├── user_test.dart
    │   └── user_repository_test.dart
    ├── service/
    │   └── user_service_test.dart
    └── helpers/
        ├── fixtures.dart      ← 테스트 데이터
        └── mocks.dart         ← Mock 정의
```

### 테스트 실행 명령

```bash
# 모든 테스트 실행
dart test

# 특정 파일만
dart test test/domain/user_test.dart

# 특정 이름 패턴 (정규식)
dart test --name "user validation"

# 커버리지 측정
dart test --coverage=coverage
dart pub global run coverage:format_coverage \
    --lcov --in=coverage --out=coverage/lcov.info

# 상세 출력
dart test --reporter=expanded
```

---

## 4. 단위 테스트 기본

### 4.1 `test()` / `group()` / `setUp()` / `tearDown()`

```dart
import 'package:test/test.dart';

// 테스트할 클래스
class Calculator {
  double add(double a, double b) => a + b;
  double subtract(double a, double b) => a - b;
  double multiply(double a, double b) => a * b;
  double divide(double a, double b) {
    if (b == 0) throw ArgumentError('0으로 나눌 수 없습니다');
    return a / b;
  }
}

void main() {
  // group — 관련 테스트 묶음
  group('Calculator', () {
    late Calculator calc;

    // setUp — 각 테스트 전에 실행
    setUp(() {
      calc = Calculator();
    });

    // tearDown — 각 테스트 후에 실행 (DB 연결 닫기 등)
    tearDown(() {
      // 필요시 정리 작업
    });

    // 단일 테스트
    test('두 수를 더한다', () {
      expect(calc.add(3, 4), equals(7));
    });

    test('두 수를 뺀다', () {
      expect(calc.subtract(10, 3), equals(7));
    });

    group('나누기', () {
      test('두 수를 나눈다', () {
        expect(calc.divide(10, 2), equals(5.0));
      });

      test('0으로 나누면 ArgumentError를 던진다', () {
        expect(() => calc.divide(10, 0), throwsArgumentError);
      });
    });
  });

  // setUpAll / tearDownAll — 그룹 전체에서 한 번만
  group('데이터베이스 테스트 (개념)', () {
    setUpAll(() async {
      // DB 연결 (한 번만)
      print('DB 연결');
    });

    tearDownAll(() async {
      // DB 연결 해제 (한 번만)
      print('DB 연결 해제');
    });

    setUp(() {
      // 각 테스트 전 트랜잭션 시작
    });

    tearDown(() {
      // 각 테스트 후 트랜잭션 롤백
    });

    test('조회 테스트', () { /* ... */ });
    test('저장 테스트', () { /* ... */ });
  });
}
```

---

### 4.2 Matcher — 검증 표현식

```dart
import 'package:test/test.dart';

void main() {
  group('Matcher 예시', () {
    // ── 기본 동등성 ──
    test('equals', () {
      expect(1 + 1, equals(2));
      expect('hello', equals('hello'));
      expect([1, 2, 3], equals([1, 2, 3]));
    });

    // ── 숫자 비교 ──
    test('숫자 비교', () {
      expect(5, greaterThan(3));
      expect(3, lessThan(5));
      expect(5, greaterThanOrEqualTo(5));
      expect(3, lessThanOrEqualTo(5));
      expect(3.14, closeTo(3.1, 0.1));  // 오차 허용
      expect(5, inInclusiveRange(1, 10));
    });

    // ── 타입 검사 ──
    test('타입 검사', () {
      expect(42, isA<int>());
      expect('hello', isA<String>());
      expect(null, isNull);
      expect(42, isNotNull);
      expect(true, isTrue);
      expect(false, isFalse);
    });

    // ── 컬렉션 ──
    test('컬렉션 Matcher', () {
      expect([1, 2, 3], hasLength(3));
      expect([1, 2, 3], contains(2));
      expect([1, 2, 3], containsAll([1, 3]));
      expect([1, 2, 3], isNotEmpty);
      expect([], isEmpty);
      expect({'a': 1, 'b': 2}, containsPair('a', 1));

      // 순서 없는 동등
      expect([3, 1, 2], unorderedEquals([1, 2, 3]));

      // 모든 요소 조건
      expect([2, 4, 6], everyElement(isA<int>()));
      expect([2, 4, 6], everyElement(greaterThan(0)));
    });

    // ── 문자열 ──
    test('문자열 Matcher', () {
      expect('hello world', contains('world'));
      expect('hello world', startsWith('hello'));
      expect('hello world', endsWith('world'));
      expect('hello world', matches(RegExp(r'\w+ \w+')));
    });

    // ── 논리 조합 ──
    test('Matcher 조합', () {
      expect(5, allOf(greaterThan(0), lessThan(10)));
      expect(5, anyOf(equals(3), equals(5), equals(7)));
      expect(5, isNot(equals(6)));
    });

    // ── 커스텀 Matcher ──
    test('커스텀 Matcher', () {
      // predicate로 간단한 커스텀 Matcher
      final isEven = predicate<int>((n) => n % 2 == 0, '짝수이어야 함');
      expect(4, isEven);
      expect(6, isEven);
    });
  });
}
```

---

### 4.3 좋은 테스트의 구조 (AAA 패턴)

**Arrange-Act-Assert**

```dart
import 'package:test/test.dart';

class ShoppingCart {
  final List<({String name, double price, int qty})> _items = [];

  void addItem(String name, double price, {int qty = 1}) {
    _items.add((name: name, price: price, qty: qty));
  }

  void removeItem(String name) {
    _items.removeWhere((item) => item.name == name);
  }

  double get total => _items.fold(0, (sum, item) => sum + item.price * item.qty);

  int get itemCount => _items.fold(0, (sum, item) => sum + item.qty);

  double applyDiscount(double percentage) {
    if (percentage < 0 || percentage > 100) {
      throw ArgumentError('할인율은 0~100 사이여야 합니다');
    }
    return total * (1 - percentage / 100);
  }
}

void main() {
  group('ShoppingCart', () {
    late ShoppingCart cart;

    setUp(() => cart = ShoppingCart());

    group('아이템 추가', () {
      test('단일 아이템을 추가하면 합계에 반영된다', () {
        // Arrange — 테스트 준비
        const itemName  = '노트북';
        const itemPrice = 1200000.0;

        // Act — 동작 실행
        cart.addItem(itemName, itemPrice);

        // Assert — 결과 검증
        expect(cart.total,     equals(itemPrice));
        expect(cart.itemCount, equals(1));
      });

      test('수량을 지정하면 합계에 수량이 곱해진다', () {
        // Arrange
        const price = 35000.0;
        const qty   = 3;

        // Act
        cart.addItem('마우스', price, qty: qty);

        // Assert
        expect(cart.total,     equals(price * qty));
        expect(cart.itemCount, equals(qty));
      });

      test('여러 아이템을 추가하면 합계가 누적된다', () {
        // Arrange
        final items = [
          (name: '노트북', price: 1200000.0, qty: 1),
          (name: '마우스', price: 35000.0,   qty: 2),
          (name: '키보드', price: 80000.0,   qty: 1),
        ];

        // Act
        for (var item in items) {
          cart.addItem(item.name, item.price, qty: item.qty);
        }

        // Assert — 1200000 + 70000 + 80000
        expect(cart.total,     equals(1350000.0));
        expect(cart.itemCount, equals(4));
      });
    });

    group('아이템 제거', () {
      setUp(() {
        cart.addItem('노트북', 1200000.0);
        cart.addItem('마우스', 35000.0);
      });

      test('아이템을 제거하면 합계에서 빠진다', () {
        // Act
        cart.removeItem('마우스');

        // Assert
        expect(cart.total,     equals(1200000.0));
        expect(cart.itemCount, equals(1));
      });

      test('존재하지 않는 아이템 제거는 무시된다', () {
        // Act
        cart.removeItem('키보드');  // 없는 아이템

        // Assert — 기존 상태 유지
        expect(cart.itemCount, equals(2));
      });
    });

    group('할인 적용', () {
      setUp(() => cart.addItem('노트북', 1000000.0));

      test('10% 할인 적용 시 900000원이 된다', () {
        expect(cart.applyDiscount(10), closeTo(900000.0, 0.01));
      });

      test('할인율 0%는 원가와 동일하다', () {
        expect(cart.applyDiscount(0), equals(1000000.0));
      });

      test('할인율 100%는 0원이 된다', () {
        expect(cart.applyDiscount(100), equals(0.0));
      });

      test('음수 할인율은 ArgumentError를 던진다', () {
        expect(() => cart.applyDiscount(-1), throwsArgumentError);
      });

      test('100 초과 할인율은 ArgumentError를 던진다', () {
        expect(
          () => cart.applyDiscount(101),
          throwsA(isA<ArgumentError>().having(
            (e) => e.message,
            'message',
            contains('0~100'),
          )),
        );
      });
    });
  });
}
```

---

## 5. 비동기 테스트

### 5.1 `async` / `await` 테스트

```dart
import 'package:test/test.dart';

// 테스트할 비동기 코드
class UserService {
  final Map<String, String> _db = {'u001': '홍길동', 'u002': '김철수'};

  Future<String> fetchUser(String id) async {
    await Future.delayed(Duration(milliseconds: 50));
    final user = _db[id];
    if (user == null) throw StateError('사용자 없음: $id');
    return user;
  }

  Future<List<String>> fetchAll() async {
    await Future.delayed(Duration(milliseconds: 100));
    return _db.values.toList();
  }
}

void main() {
  group('UserService', () {
    late UserService service;

    setUp(() => service = UserService());

    // async 테스트 — 함수 자체를 async로
    test('존재하는 사용자를 조회한다', () async {
      // Arrange
      const userId = 'u001';

      // Act
      final result = await service.fetchUser(userId);

      // Assert
      expect(result, equals('홍길동'));
    });

    test('모든 사용자를 조회한다', () async {
      final users = await service.fetchAll();

      expect(users, hasLength(2));
      expect(users, containsAll(['홍길동', '김철수']));
    });

    test('존재하지 않는 사용자 조회 시 StateError를 던진다', () async {
      // throwsA와 async — expectLater 사용
      await expectLater(
        service.fetchUser('u999'),
        throwsA(isA<StateError>().having(
          (e) => e.message,
          'message',
          contains('u999'),
        )),
      );
    });

    // completion Matcher — Future의 완료 값 검증
    test('Future 완료 값을 completion으로 검증', () {
      expect(
        service.fetchUser('u001'),
        completion(equals('홍길동')),
      );
    });
  });
}
```

---

### 5.2 `Stream` 테스트

```dart
import 'package:test/test.dart';

Stream<int> countDown(int from) async* {
  for (int i = from; i >= 0; i--) {
    await Future.delayed(Duration(milliseconds: 10));
    yield i;
  }
}

Stream<int> errorStream() async* {
  yield 1;
  yield 2;
  throw Exception('Stream 오류');
}

void main() {
  group('Stream 테스트', () {
    test('emitsInOrder — 순서대로 값 방출 확인', () {
      expect(
        countDown(3),
        emitsInOrder([3, 2, 1, 0, emitsDone]),
      );
    });

    test('emits — 단일 값 방출 확인', () {
      expect(
        Stream.value(42),
        emits(42),
      );
    });

    test('emitsError — 오류 방출 확인', () {
      expect(
        errorStream(),
        emitsInOrder([
          emits(1),
          emits(2),
          emitsError(isA<Exception>()),
          emitsDone,
        ]),
      );
    });

    test('emitsThrough — 특정 값 포함 여부', () {
      expect(
        countDown(5),
        emitsThrough(3),  // 3이 방출될 때까지 앞의 값 무시
      );
    });

    test('neverEmits — 특정 값 미방출 확인', () {
      expect(
        countDown(3),
        neverEmits(greaterThan(3)),
      );
    });

    test('Stream을 toList로 변환해 검증', () async {
      final values = await countDown(3).toList();
      expect(values, equals([3, 2, 1, 0]));
    });
  });
}
```

---

### 5.3 타임아웃 설정

```dart
import 'package:test/test.dart';

void main() {
  // 테스트별 타임아웃
  test(
    '느린 작업 테스트',
    () async {
      await Future.delayed(Duration(milliseconds: 200));
      expect(true, isTrue);
    },
    timeout: Timeout(Duration(seconds: 1)),
  );

  // 그룹 전체 타임아웃
  group(
    '비동기 그룹',
    () {
      test('빠른 테스트', () async {
        await Future.delayed(Duration(milliseconds: 50));
        expect(1 + 1, equals(2));
      });
    },
    timeout: Timeout(Duration(seconds: 2)),
  );

  // 전역 타임아웃 — dart_test.yaml 또는 @Timeout 어노테이션으로 설정
}
```

---

## 6. 예외 테스트

```dart
import 'package:test/test.dart';

class Parser {
  int parsePositive(String s) {
    final n = int.tryParse(s);
    if (n == null) throw FormatException('정수가 아닙니다', s);
    if (n <= 0)    throw RangeError.value(n, 's', '양의 정수여야 합니다');
    return n;
  }
}

void main() {
  late Parser parser;
  setUp(() => parser = Parser());

  group('예외 테스트', () {
    // 기본 — 예외 타입만 확인
    test('FormatException을 던진다', () {
      expect(
        () => parser.parsePositive('abc'),
        throwsA(isA<FormatException>()),
      );
    });

    // 예외 내용 확인 — .having()
    test('FormatException에 소스 포함', () {
      expect(
        () => parser.parsePositive('abc'),
        throwsA(
          isA<FormatException>().having(
            (e) => e.source,
            'source',
            equals('abc'),
          ),
        ),
      );
    });

    // 여러 필드 확인 — .having() 체이닝
    test('RangeError 상세 확인', () {
      expect(
        () => parser.parsePositive('-5'),
        throwsA(
          isA<RangeError>()
              .having((e) => e.invalidValue, 'invalidValue', equals(-5))
              .having((e) => e.name,         'name',         equals('s')),
        ),
      );
    });

    // 특정 메시지 포함
    test('오류 메시지 확인', () {
      expect(
        () => parser.parsePositive('0'),
        throwsA(
          isA<RangeError>().having(
            (e) => e.message,
            'message',
            contains('양의 정수'),
          ),
        ),
      );
    });

    // 편의 Matcher
    test('throwsArgumentError', () {
      // ArgumentError 전용 Matcher
      expect(() => throw ArgumentError('테스트'), throwsArgumentError);
    });

    test('throwsStateError', () {
      expect(() => throw StateError('상태 오류'), throwsStateError);
    });

    test('throwsRangeError', () {
      expect(() => parser.parsePositive('0'), throwsRangeError);
    });

    // 예외가 발생하지 않음 확인
    test('정상 입력에서는 예외가 발생하지 않는다', () {
      expect(() => parser.parsePositive('42'), returnsNormally);
    });
  });
}
```

---

## 7. Mock 객체 — `mockito`

### 7.1 Mock 기본 설정

```dart
// lib/src/repository/user_repository.dart
abstract class UserRepository {
  Future<User?> findById(String id);
  Future<List<User>> findAll();
  Future<User> save(User user);
  Future<void> delete(String id);
}

class User {
  final String id;
  final String name;
  final String email;
  User({required this.id, required this.name, required this.email});

  @override
  String toString() => 'User($id, $name)';

  @override
  bool operator ==(Object other) =>
      other is User && id == other.id && name == other.name;

  @override
  int get hashCode => Object.hash(id, name);
}

// lib/src/service/user_service.dart
class UserService {
  final UserRepository _repo;
  UserService(this._repo);

  Future<User> getUser(String id) async {
    final user = await _repo.findById(id);
    if (user == null) throw StateError('사용자 없음: $id');
    return user;
  }

  Future<User> createUser({required String name, required String email}) async {
    final id   = 'u${DateTime.now().millisecondsSinceEpoch}';
    final user = User(id: id, name: name, email: email);
    return _repo.save(user);
  }

  Future<List<User>> searchUsers(String query) async {
    final all = await _repo.findAll();
    return all.where((u) =>
        u.name.contains(query) || u.email.contains(query)).toList();
  }
}
```

```dart
// test/service/user_service_test.dart
import 'package:test/test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

// Mock 생성 어노테이션 — build_runner가 Mock 클래스를 자동 생성
@GenerateMocks([UserRepository])
import 'user_service_test.mocks.dart';

// 코드 생성 명령: dart run build_runner build

void main() {
  group('UserService', () {
    late MockUserRepository mockRepo;
    late UserService service;

    setUp(() {
      mockRepo = MockUserRepository();
      service  = UserService(mockRepo);
    });

    // 기본 stubbing
    test('findById 결과를 반환한다', () async {
      // Arrange — Mock 동작 정의 (stubbing)
      final user = User(id: 'u001', name: '홍길동', email: 'hong@dart.dev');
      when(mockRepo.findById('u001')).thenAnswer((_) async => user);

      // Act
      final result = await service.getUser('u001');

      // Assert
      expect(result, equals(user));
      verify(mockRepo.findById('u001')).called(1);
    });
  });
}
```

---

### 7.2 `when` / `verify`

```dart
import 'package:test/test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('Mockito when / verify', () {
    late MockUserRepository mockRepo;
    late UserService service;

    setUp(() {
      mockRepo = MockUserRepository();
      service  = UserService(mockRepo);
    });

    // ── Stubbing 패턴 ──
    test('thenReturn — 동기 반환값 설정', () async {
      // 주의: Future를 반환하는 메서드에는 thenAnswer 사용
      when(mockRepo.findById(any))
          .thenAnswer((_) async => User(id: 'u001', name: '홍', email: 'h@d.dev'));

      final result = await service.getUser('u001');
      expect(result.name, equals('홍'));
    });

    test('thenThrow — 예외 발생 stubbing', () async {
      when(mockRepo.findById('bad'))
          .thenThrow(Exception('DB 오류'));

      await expectLater(
        service.getUser('bad'),
        throwsA(isA<Exception>()),
      );
    });

    test('thenAnswer — 콜백으로 동적 반환값', () async {
      when(mockRepo.findById(any)).thenAnswer((invocation) async {
        final id = invocation.positionalArguments[0] as String;
        return User(id: id, name: 'User-$id', email: '$id@dart.dev');
      });

      final u1 = await service.getUser('u001');
      final u2 = await service.getUser('u002');

      expect(u1.name, equals('User-u001'));
      expect(u2.name, equals('User-u002'));
    });

    test('null 반환 stubbing', () async {
      when(mockRepo.findById('u999')).thenAnswer((_) async => null);

      await expectLater(
        service.getUser('u999'),
        throwsStateError,
      );
    });

    // ── Argument Matchers ──
    test('any — 임의 인수 매칭', () async {
      when(mockRepo.findById(any))
          .thenAnswer((_) async => null);

      // 어떤 id를 넘겨도 null 반환
      expect(await mockRepo.findById('x'), isNull);
      expect(await mockRepo.findById('y'), isNull);
    });

    test('argThat — 조건 기반 매칭', () async {
      when(mockRepo.findById(argThat(startsWith('u'))))
          .thenAnswer((_) async =>
              User(id: 'u001', name: '홍길동', email: 'h@d.dev'));

      final result = await mockRepo.findById('u001');
      expect(result, isNotNull);
    });

    // ── Verify 패턴 ──
    test('verify — 호출 여부 및 횟수 확인', () async {
      final user = User(id: 'u001', name: '홍', email: 'h@d.dev');
      when(mockRepo.findById('u001')).thenAnswer((_) async => user);
      when(mockRepo.save(any)).thenAnswer((_) async => user);

      await service.getUser('u001');
      await service.getUser('u001');

      verify(mockRepo.findById('u001')).called(2);
      verifyNever(mockRepo.findAll());  // findAll은 호출 안 됨
    });

    test('verifyInOrder — 호출 순서 확인', () async {
      final user = User(id: 'u001', name: '홍', email: 'h@d.dev');
      when(mockRepo.findAll())  .thenAnswer((_) async => [user]);
      when(mockRepo.findById(any)).thenAnswer((_) async => user);

      final users = await service.searchUsers('홍');
      await service.getUser('u001');

      verifyInOrder([
        mockRepo.findAll(),        // searchUsers가 먼저
        mockRepo.findById('u001'), // getUser가 나중
      ]);
    });

    test('captureAny — 전달된 인수 캡처', () async {
      when(mockRepo.save(any))
          .thenAnswer((inv) async => inv.positionalArguments[0] as User);

      await service.createUser(name: '홍길동', email: 'hong@dart.dev');

      final captured = verify(mockRepo.save(captureAny)).captured;
      final savedUser = captured.first as User;

      expect(savedUser.name,  equals('홍길동'));
      expect(savedUser.email, equals('hong@dart.dev'));
    });
  });
}
```

---

### 7.3 Mock과 Stub의 차이

```dart
// ── Stub — 반환값만 정의, 호출 검증 없음 ──
// 사용 목적: 의존성이 특정 값을 반환하도록 고정

test('Stub 방식 — 반환값 고정', () async {
  // 단순히 "이 메서드는 이 값을 반환한다"만 정의
  when(mockRepo.findById('u001'))
      .thenAnswer((_) async => User(id: 'u001', name: '홍', email: 'h@d.dev'));

  final user = await service.getUser('u001');
  expect(user.name, equals('홍'));
  // verify 없음 — 호출 여부 확인 안 함
});

// ── Mock — 상호작용 검증까지 ──
// 사용 목적: "이 메서드가 정확히 이렇게 호출되었는가"를 검증

test('Mock 방식 — 상호작용 검증', () async {
  when(mockRepo.findById('u001'))
      .thenAnswer((_) async => User(id: 'u001', name: '홍', email: 'h@d.dev'));

  await service.getUser('u001');

  // 호출 여부 + 횟수 검증 — 이것이 Mock의 핵심
  verify(mockRepo.findById('u001')).called(1);
  verifyNoMoreInteractions(mockRepo);  // 다른 메서드는 호출되지 않음
});

/*
선택 기준:
  반환값만 제어하면 됨 → Stub (when만)
  "이 메서드가 호출됐는가"도 검증해야 함 → Mock (when + verify)

과도한 Mock 경고:
  모든 것을 Mock으로 만들면 테스트가 구현 세부사항에 의존됨
  → 리팩토링 시 테스트가 깨짐
  → 상태(결과) 검증 위주, 행동(호출) 검증은 필요할 때만
*/
```

---

## 8. Sealed Class / Result 타입 테스트

```dart
import 'package:test/test.dart';

// 테스트할 타입들 (Step 16, 18에서 정의)
sealed class Result<T> {}
class Ok<T>  extends Result<T> { final T value;        Ok(this.value);  }
class Err<T> extends Result<T> { final Exception error; Err(this.error); }

sealed class AuthState {}
class LoggedOut extends AuthState {}
class LoggedIn  extends AuthState {
  final String userId;
  final List<String> roles;
  LoggedIn(this.userId, this.roles);
}
class LoggingIn extends AuthState {}

// 테스트할 서비스
class AuthService {
  AuthState _state = LoggedOut();

  AuthState get state => _state;

  Result<LoggedIn> login(String id, String password) {
    if (id.isEmpty || password.isEmpty) {
      return Err(ArgumentError('아이디와 비밀번호를 입력하세요'));
    }
    if (password.length < 8) {
      return Err(ArgumentError('비밀번호는 8자 이상이어야 합니다'));
    }
    if (id == 'admin' && password == 'Admin1234!') {
      final loggedIn = LoggedIn(id, ['admin', 'user']);
      _state = loggedIn;
      return Ok(loggedIn);
    }
    return Err(Exception('아이디 또는 비밀번호가 올바르지 않습니다'));
  }

  void logout() { _state = LoggedOut(); }
}

void main() {
  group('AuthService', () {
    late AuthService auth;
    setUp(() => auth = AuthService());

    group('초기 상태', () {
      test('초기 상태는 LoggedOut이다', () {
        expect(auth.state, isA<LoggedOut>());
      });
    });

    group('로그인 성공', () {
      test('올바른 자격증명으로 Ok(LoggedIn)을 반환한다', () {
        final result = auth.login('admin', 'Admin1234!');

        // Sealed Class 패턴 매칭 검증
        switch (result) {
          case Ok(:final value):
            expect(value.userId, equals('admin'));
            expect(value.roles,  containsAll(['admin', 'user']));
          case Err():
            fail('Ok가 반환되어야 하는데 Err가 반환됨');
        }
      });

      test('로그인 성공 후 상태가 LoggedIn으로 변경된다', () {
        auth.login('admin', 'Admin1234!');

        expect(auth.state, isA<LoggedIn>());
        final state = auth.state as LoggedIn;
        expect(state.userId, equals('admin'));
      });
    });

    group('로그인 실패', () {
      test('빈 아이디는 Err를 반환한다', () {
        final result = auth.login('', 'Password1!');
        expect(result, isA<Err>());
      });

      test('짧은 비밀번호는 ArgumentError Err를 반환한다', () {
        final result = auth.login('admin', 'short');

        expect(result, isA<Err<LoggedIn>>());
        if (result case Err(:final error)) {
          expect(error, isA<ArgumentError>());
          expect((error as ArgumentError).message, contains('8자'));
        }
      });

      test('잘못된 자격증명은 Err를 반환하고 상태가 변경되지 않는다', () {
        final result = auth.login('admin', 'WrongPass1!');

        expect(result, isA<Err>());
        expect(auth.state, isA<LoggedOut>());  // 상태 변경 없음
      });
    });

    group('로그아웃', () {
      setUp(() => auth.login('admin', 'Admin1234!'));

      test('로그아웃 후 상태가 LoggedOut이 된다', () {
        auth.logout();
        expect(auth.state, isA<LoggedOut>());
      });
    });
  });
}
```

---

## 9. 테스트 커버리지와 구조화

### 9.1 파일 구조

```dart
// test/helpers/fixtures.dart — 공통 테스트 데이터
class UserFixtures {
  static User get adminUser => User(
    id:    'u001',
    name:  '관리자',
    email: 'admin@dart.dev',
  );

  static User get regularUser => User(
    id:    'u002',
    name:  '일반사용자',
    email: 'user@dart.dev',
  );

  static List<User> get sampleUsers => [adminUser, regularUser];

  // 빌더 패턴 — 일부 필드만 변경
  static User userWith({String? id, String? name, String? email}) => User(
    id:    id    ?? 'u-test',
    name:  name  ?? '테스트사용자',
    email: email ?? 'test@dart.dev',
  );
}
```

```dart
// test/helpers/matchers.dart — 커스텀 Matcher
import 'package:test/test.dart';

// Result<T>가 Ok인지 확인하는 Matcher
Matcher isOk<T>([Matcher? valueMatcher]) => _IsOk<T>(valueMatcher);

class _IsOk<T> extends Matcher {
  final Matcher? _valueMatcher;
  _IsOk(this._valueMatcher);

  @override
  bool matches(Object? item, Map<dynamic, dynamic> matchState) {
    if (item is! Ok<T>) return false;
    if (_valueMatcher == null) return true;
    return _valueMatcher!.matches(item.value, matchState);
  }

  @override
  Description describe(Description description) {
    description.add('Ok');
    if (_valueMatcher != null) {
      description.add(' with value ').addDescriptionOf(_valueMatcher);
    }
    return description;
  }
}

Matcher isErr<T>([Matcher? errorMatcher]) => _IsErr<T>(errorMatcher);

class _IsErr<T> extends Matcher {
  final Matcher? _errorMatcher;
  _IsErr(this._errorMatcher);

  @override
  bool matches(Object? item, Map<dynamic, dynamic> matchState) {
    if (item is! Err<T>) return false;
    if (_errorMatcher == null) return true;
    return _errorMatcher!.matches(item.error, matchState);
  }

  @override
  Description describe(Description description) =>
      description.add('Err');
}

// 사용 예
// expect(result, isOk<User>());
// expect(result, isOk<User>(having((u) => u.name, 'name', equals('홍'))));
// expect(result, isErr<User>(isA<ArgumentError>()));
```

---

### 9.2 테스트 그룹화 전략

```dart
// ── 행동 기반 명명 (BDD 스타일) ──
// Given-When-Then → Arrange-Act-Assert와 같은 개념

group('UserService', () {
  group('getUser()를 호출할 때', () {
    group('사용자가 존재하면', () {
      test('사용자를 반환한다', () async { /* ... */ });
      test('조회 횟수가 증가한다', () async { /* ... */ });
    });

    group('사용자가 존재하지 않으면', () {
      test('StateError를 던진다', () async { /* ... */ });
      test('DB 조회는 한 번만 발생한다', () async { /* ... */ });
    });
  });

  group('createUser()를 호출할 때', () {
    group('유효한 데이터면', () {
      test('사용자를 저장하고 반환한다', () async { /* ... */ });
      test('고유 ID가 생성된다', () async { /* ... */ });
    });

    group('이메일이 유효하지 않으면', () {
      test('ValidationException을 던진다', () async { /* ... */ });
    });
  });
});
```

---

### 9.3 커버리지 측정

```bash
# 커버리지 측정 및 보고서 생성
dart test --coverage=coverage
dart pub global run coverage:format_coverage \
    --lcov --in=coverage --out=coverage/lcov.info

# HTML 보고서 (genhtml 필요)
genhtml coverage/lcov.info --output-directory coverage/html

# 커버리지 요약 출력
dart pub global run coverage:format_coverage \
    --lcov --in=coverage --out=coverage/lcov.info --report-on=lib
```

**커버리지 해석**

```
Line Coverage:   실행된 코드 라인 비율
Branch Coverage: 실행된 분기(if-else, switch) 비율

목표치 (일반적):
  단위 테스트: 80% 이상
  중요 비즈니스 로직: 90%+ 권장

커버리지 함정:
  100% 달성했어도 잘못된 Assertion이면 버그 미탐지
  → 커버리지는 최소 기준, 테스트 품질은 별개
```

---

## 10. 디버깅 기법

### 10.1 `assert`와 디버그 모드

```dart
class BankAccount {
  double _balance;
  BankAccount(this._balance) {
    // assert — 디버그 모드에서만 실행, 운영 환경에서는 무시
    assert(_balance >= 0, '초기 잔액은 0 이상이어야 합니다');
  }

  void deposit(double amount) {
    assert(amount > 0, '입금액은 양수여야 합니다');
    _balance += amount;
    assert(_balance >= 0, '입금 후 잔액이 음수가 될 수 없음 (버그)');
  }

  void withdraw(double amount) {
    assert(amount > 0, '출금액은 양수여야 합니다');
    if (_balance < amount) throw StateError('잔액 부족');
    _balance -= amount;
  }

  double get balance => _balance;
}

// assert vs 예외:
// assert — 개발 중 프로그래밍 오류 조기 발견 (운영 무시)
// 예외   — 런타임 상황 처리 (운영에서도 작동)
```

---

### 10.2 로깅 전략

```dart
import 'dart:developer' as dev;

// 레벨별 로거
enum LogLevel { debug, info, warning, error }

class Logger {
  final String name;
  final LogLevel minLevel;

  const Logger(this.name, {this.minLevel = LogLevel.debug});

  void debug  (String msg, [Object? error]) => _log(LogLevel.debug,   msg, error);
  void info   (String msg, [Object? error]) => _log(LogLevel.info,    msg, error);
  void warning(String msg, [Object? error]) => _log(LogLevel.warning, msg, error);
  void error  (String msg, [Object? error]) => _log(LogLevel.error,   msg, error);

  void _log(LogLevel level, String msg, Object? error) {
    if (level.index < minLevel.index) return;

    final prefix = switch (level) {
      LogLevel.debug   => '🔍 DEBUG',
      LogLevel.info    => 'ℹ️  INFO ',
      LogLevel.warning => '⚠️  WARN ',
      LogLevel.error   => '❌ ERROR',
    };

    final timestamp = DateTime.now().toIso8601String();
    final message   = '[$timestamp] $prefix [$name] $msg';

    print(message);
    if (error != null) print('  오류: $error');

    // dart:developer — DevTools와 연동
    dev.log(msg, name: name, error: error, level: level.index * 300);
  }
}

class UserService {
  static final _log = Logger('UserService');

  Future<User?> findUser(String id) async {
    _log.debug('사용자 조회 시작: $id');

    try {
      final user = await _repo.findById(id);

      if (user == null) {
        _log.info('사용자 없음: $id');
      } else {
        _log.debug('사용자 조회 성공: ${user.name}');
      }

      return user;
    } catch (e, s) {
      _log.error('사용자 조회 실패: $id', e);
      rethrow;
    }
  }
}
```

---

### 10.3 `dart:developer` 활용

```dart
import 'dart:developer';

void main() async {
  // Timeline — 성능 측정
  Timeline.startSync('데이터 처리');
  await processData();
  Timeline.finishSync();

  // log — DevTools 로그 패널
  log(
    '처리 완료',
    name:  'MyApp',
    level: 800,  // INFO
    error: null,
    stackTrace: StackTrace.current,
  );

  // debugger — 조건부 중단점
  // dart --observe로 실행 시 이 지점에서 일시정지
  var data = computeResult();
  debugger(when: data.isEmpty, message: '결과가 비어 있음!');

  // inspect — DevTools에서 객체 검사
  inspect(data);

  // postEvent — Timeline에 커스텀 이벤트
  postEvent('my.event', {'key': 'value', 'count': 42});
}

// 성능 프로파일링 헬퍼
Future<T> timeIt<T>(String label, Future<T> Function() fn) async {
  final sw = Stopwatch()..start();
  Timeline.startSync(label);
  try {
    return await fn();
  } finally {
    Timeline.finishSync();
    sw.stop();
    log('$label 소요: ${sw.elapsedMilliseconds}ms', name: 'Perf');
  }
}
```

---

## 11. 실습

> 💡 이론 검증용 최소 실습 | 실제 Dart 프로젝트 환경 권장

### 실습 11-1: Stack 클래스 단위 테스트 작성

Step 16에서 만든 `Stack<E>` 클래스의 전체 단위 테스트를 작성하세요.

**요구사항**

- `group`으로 `push`, `pop`, `peek`, `isEmpty`, `length` 각각 그룹화
- `setUp`으로 각 테스트마다 새 Stack 생성
- 경계 조건 — 빈 Stack에서 `pop`, `peek` 호출 시 `StateError`
- AAA 패턴 준수 + 테스트 이름은 한국어 동작 설명

```dart
// Stack 클래스 (복습)
class Stack<E> {
  final List<E> _items = [];
  void push(E item) => _items.add(item);
  E pop() {
    if (_items.isEmpty) throw StateError('Stack이 비어 있습니다');
    return _items.removeLast();
  }
  E get peek {
    if (_items.isEmpty) throw StateError('Stack이 비어 있습니다');
    return _items.last;
  }
  bool get isEmpty => _items.isEmpty;
  int  get length  => _items.length;
}

// TODO: 테스트 작성
```

> **정답 힌트**
>
> ```dart
> import 'package:test/test.dart';
>
> void main() {
>   group('Stack<int>', () {
>     late Stack<int> stack;
>     setUp(() => stack = Stack<int>());
>
>     group('초기 상태', () {
>       test('비어 있다', () {
>         expect(stack.isEmpty, isTrue);
>         expect(stack.length, equals(0));
>       });
>     });
>
>     group('push()', () {
>       test('요소를 추가하면 length가 증가한다', () {
>         stack.push(1);
>         expect(stack.length, equals(1));
>         expect(stack.isEmpty, isFalse);
>       });
>
>       test('여러 요소 추가 시 length가 누적된다', () {
>         stack.push(1); stack.push(2); stack.push(3);
>         expect(stack.length, equals(3));
>       });
>     });
>
>     group('pop()', () {
>       test('마지막에 넣은 요소를 반환한다 (LIFO)', () {
>         stack.push(1); stack.push(2); stack.push(3);
>         expect(stack.pop(), equals(3));
>         expect(stack.pop(), equals(2));
>         expect(stack.pop(), equals(1));
>       });
>
>       test('빈 Stack에서 호출 시 StateError를 던진다', () {
>         expect(() => stack.pop(), throwsStateError);
>       });
>
>       test('pop 후 length가 감소한다', () {
>         stack.push(10);
>         stack.pop();
>         expect(stack.isEmpty, isTrue);
>       });
>     });
>
>     group('peek', () {
>       test('마지막 요소를 제거 없이 반환한다', () {
>         stack.push(42);
>         expect(stack.peek, equals(42));
>         expect(stack.length, equals(1));  // 제거 안 됨
>       });
>
>       test('빈 Stack에서 호출 시 StateError를 던진다', () {
>         expect(() => stack.peek, throwsStateError);
>       });
>     });
>   });
> }
> ```

### 실습 11-2: 비동기 + Mock 테스트

아래 `OrderService`를 Mock을 활용해 테스트하세요.

```dart
abstract class ProductRepository {
  Future<Product?> findById(String id);
  Future<void>     updateStock(String id, int newStock);
}

abstract class OrderRepository {
  Future<Order> save(Order order);
}

class Product {
  final String id;
  final String name;
  final double price;
  int stock;
  Product({required this.id, required this.name,
           required this.price, required this.stock});
}

class Order {
  final String productId;
  final int quantity;
  final double total;
  Order({required this.productId, required this.quantity, required this.total});
}

class OrderService {
  final ProductRepository _products;
  final OrderRepository   _orders;

  OrderService(this._products, this._orders);

  Future<Order> placeOrder(String productId, int quantity) async {
    final product = await _products.findById(productId);
    if (product == null) throw StateError('상품 없음: $productId');
    if (product.stock < quantity) throw StateError('재고 부족');

    final total = product.price * quantity;
    final order = Order(productId: productId, quantity: quantity, total: total);

    await _orders.save(order);
    await _products.updateStock(productId, product.stock - quantity);

    return order;
  }
}
```

**테스트해야 할 케이스**

1. 정상 주문 시 `Order`를 반환하고 재고를 업데이트한다
2. 상품이 없으면 `StateError`를 던진다
3. 재고 부족 시 `StateError`를 던지고 주문은 저장되지 않는다

> **정답 힌트**
>
> ```dart
> test('정상 주문 — 재고 업데이트 확인', () async {
>   final product = Product(id: 'p001', name: '노트북',
>                           price: 1200000, stock: 10);
>   when(mockProducts.findById('p001')).thenAnswer((_) async => product);
>   when(mockOrders.save(any)).thenAnswer((inv) async =>
>       inv.positionalArguments[0] as Order);
>   when(mockProducts.updateStock(any, any)).thenAnswer((_) async {});
>
>   final order = await service.placeOrder('p001', 2);
>
>   expect(order.total, equals(2400000.0));
>   verify(mockProducts.updateStock('p001', 8)).called(1);
>   verify(mockOrders.save(any)).called(1);
> });
>
> test('재고 부족 — 주문 저장 안 됨', () async {
>   final product = Product(id: 'p001', name: '노트북',
>                           price: 1200000, stock: 1);
>   when(mockProducts.findById('p001')).thenAnswer((_) async => product);
>
>   await expectLater(
>     service.placeOrder('p001', 5),
>     throwsStateError,
>   );
>   verifyNever(mockOrders.save(any));
> });
> ```

### 실습 11-3: Sealed Class 테스트 커스텀 Matcher

Step 8 helpers의 커스텀 Matcher `isOk` / `isErr`를 직접 구현하고 테스트에 적용하세요.

```dart
// 구현 목표
Matcher isOk<T>([Matcher? valueMatcher]);
Matcher isErr<T>([Matcher? errorMatcher]);

// 사용 예
expect(Ok(42), isOk<int>());
expect(Ok(42), isOk<int>(equals(42)));
expect(Err<int>(Exception('오류')), isErr<int>());
expect(Err<int>(Exception('오류')), isErr<int>(isA<Exception>()));
```

---

## 12. 핵심 요약 및 다음 단계

### ✅ 이 문서에서 배운 것

| 개념                       | 핵심 내용                                            |
| -------------------------- | ---------------------------------------------------- |
| `test()` / `group()`       | 테스트 선언과 논리적 그룹화                          |
| `setUp` / `tearDown`       | 각 테스트 전/후 초기화 (격리 보장)                   |
| `setUpAll` / `tearDownAll` | 그룹 전체에서 한 번 실행                             |
| `expect` + Matcher         | `equals`, `isA`, `contains`, `throwsA`, `closeTo` 등 |
| `.having()`                | 예외 내용 세부 검증                                  |
| AAA 패턴                   | Arrange-Act-Assert — 테스트 가독성                   |
| 비동기 테스트              | `async/await`, `expectLater`, `completion`           |
| Stream 테스트              | `emitsInOrder`, `emits`, `emitsError`, `emitsDone`   |
| `throwsA`                  | 예외 타입 + 내용 검증                                |
| Mock                       | `@GenerateMocks`, `when`, `verify`, `verifyNever`    |
| `thenAnswer`               | 비동기 반환값 stubbing                               |
| `captureAny`               | 전달된 인수 캡처 검증                                |
| Sealed Class 테스트        | `switch` + `isA` + `fail()` 조합                     |
| 커스텀 Matcher             | `Matcher` 클래스 상속                                |
| `assert`                   | 디버그 모드 전제 조건 검사                           |
| `dart:developer`           | `log`, `Timeline`, `debugger`, `inspect`             |

### 🔗 다음 단계

> **Step 22 — 패키지와 pub.dev 생태계**로 이동하세요.

Step 22에서는 Dart 패키지 시스템(pub.dev), `pubspec.yaml` 의존성 관리, 버전 제약 표기법(`^`, `>=`, `<`), 자신만의 패키지 만들기, `dart pub publish` 배포 과정, 그리고 자주 쓰이는 핵심 패키지들(`freezed`, `json_serializable`, `dio`, `riverpod` 등)을 소개합니다.

### 📚 참고 자료

| 자료                  | 링크                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `test` 패키지         | <https://pub.dev/packages/test>                                          |
| `mockito` 패키지      | <https://pub.dev/packages/mockito>                                       |
| Dart 테스트 공식 문서 | <https://dart.dev/guides/testing>                                        |
| Matcher API           | <https://pub.dev/documentation/matcher/latest/>                          |
| `dart:developer`      | <https://api.dart.dev/stable/dart-developer/dart-developer-library.html> |
| 커버리지 도구         | <https://pub.dev/packages/coverage>                                      |

### ❓ 자가진단 퀴즈

1. **[Remember]** `setUp`과 `setUpAll`의 차이를 실행 횟수 관점에서 설명하고, 각각이 적합한 상황을 제시하라.
2. **[Remember]** `verify(mock.method()).called(1)`과 `verifyNever(mock.method())`의 차이를 설명하라.
3. **[Understand]** 아래 테스트에서 `thenReturn` 대신 `thenAnswer`를 사용해야 하는 이유를 설명하라.

   ```dart
   when(mockRepo.findById('u001'))
       .thenReturn(Future.value(user));  // ❌ 왜 문제인가?
   //  .thenAnswer((_) async => user);  // ✅ 왜 올바른가?
   ```

4. **[Understand]** 테스트에서 Mock을 과도하게 사용하면 어떤 문제가 발생하는지 "구현 세부사항에 의존한다"는 관점에서 설명하라.
5. **[Apply]** `emitsInOrder`와 `emitsThrough`의 차이를 예시를 들어 설명하고, `Stream.fromIterable([1,2,3,4,5])`에 대해 각각 어떤 테스트를 작성할 수 있는지 보여라.
6. **[Evaluate]** `UserRepository`의 구현을 테스트할 때 실제 인메모리 저장소를 사용하는 방식과 Mock을 사용하는 방식 중 어느 것이 더 적합한지, 단위 테스트의 격리성, 테스트 속도, 회귀 감지 능력 세 관점에서 평가하라.

> **3번 정답 힌트**
>
> `thenReturn(Future.value(user))`는 같은 `Future` 인스턴스를 매번 반환합니다. `Future`는 한 번 완료되면 재사용되지 않으므로, 동일한 Mock을 여러 번 호출할 때 첫 번째 호출 이후에는 이미 완료된 `Future`를 받게 됩니다. `thenAnswer((_) async => user)`는 호출마다 새 `Future`를 생성하므로 안전합니다.

> **6번 정답 힌트**
>
> 인메모리 저장소: 격리성 높음(외부 DB 불필요), 빠름, `Repository` 계약 전체를 실제로 검증해 회귀 감지 우수. 단, `InMemoryRepository`와 실제 DB 구현 간 동작 차이가 있을 수 있음.
> Mock: 완벽한 격리, 가장 빠름, 상호작용(호출 여부/순서) 검증 가능. 단, Repository 내부 로직은 검증 불가, 구현 변경 시 Mock 설정도 변경해야 함.
> `UserService` 테스트라면 Mock이 적합(의존성 격리). `UserRepository` 자체 테스트라면 인메모리 구현이 더 적합.

---

> ⬅️ [Step 20 — Callable, Typedef, 함수형 심화](#) | ➡️ [Step 22 — 패키지와 pub.dev 생태계 →](#)

---

_참고: 이 문서는 dart.dev 공식 문서(Testing), pub.dev(test, mockito 패키지) 및 Revised Bloom's Taxonomy(2001)를 기반으로 작성되었습니다._
