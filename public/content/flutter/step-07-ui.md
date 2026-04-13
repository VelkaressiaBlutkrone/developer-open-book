# Step 07 — 기본 UI 위젯

> **파트:** 2️⃣ Flutter UI 시스템 이해 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Container, Text, Image, Icon, Padding, Align 각 위젯의 역할을 나열할 수 있다.
2. **[Understand]** Container의 레이아웃 결정 규칙(자식 있음/없음, Constraints 상황)을 설명할 수 있다.
3. **[Understand]** BoxDecoration의 구성 요소와 적용 순서를 설명할 수 있다.
4. **[Understand]** Text의 overflow 처리 옵션과 TextStyle 상속 구조를 설명할 수 있다.
5. **[Apply]** BoxDecoration으로 카드·버튼 스타일 박스를 직접 구현할 수 있다.
6. **[Apply]** Image.network·Image.asset의 차이를 이해하고 올바르게 사용할 수 있다.

**전제 지식:** Step 01~06 완료, BoxConstraints·Flex 레이아웃(Step 06)

---

## 1. 서론

### 1.1 기본 위젯이 중요한 이유

Flutter의 모든 복잡한 UI는 결국 소수의 기본 위젯 조합으로 만들어진다. 아무리 화려한 앱 화면도 분해하면 `Container`, `Text`, `Image`, `Icon`의 반복이다.

![상품 카드 위젯 분해](/developer-open-book/diagrams/step07-product-card-breakdown.svg)

### 1.2 전체 개념 지도

![기본 UI 위젯 hierarchy tree](/developer-open-book/diagrams/step07-basic-ui-widgets.svg)

---

## 2. 기본 개념과 용어

| 용어                    | 정의                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Container**           | 크기·색상·여백·테두리·그림자·변환을 하나의 위젯에서 처리하는 다목적 박스 위젯                   |
| **BoxDecoration**       | Container의 시각적 꾸미기를 담당하는 객체. color·border·borderRadius·boxShadow·gradient 등 포함 |
| **BorderRadius**        | 컨테이너 모서리의 둥글기를 지정하는 객체                                                        |
| **BoxShadow**           | 위젯 아래에 그림자 효과를 추가하는 객체                                                         |
| **Text**                | 화면에 텍스트 문자열을 표시하는 위젯                                                            |
| **TextStyle**           | 텍스트의 시각적 속성(크기·두께·색상·자간·행간 등)을 정의하는 객체                               |
| **TextOverflow**        | 텍스트가 지정된 공간을 초과할 때 처리 방식 (ellipsis·clip·fade·visible)                         |
| **RichText / TextSpan** | 한 문장 안에서 서로 다른 스타일을 적용하는 위젯·객체                                            |
| **Image**               | 이미지를 표시하는 위젯. network·asset·file·memory 소스를 지원                                   |
| **BoxFit**              | 이미지를 컨테이너에 맞추는 방식 (cover·contain·fill·fitWidth·fitHeight·none)                    |
| **Icon**                | Material Design 또는 Cupertino 아이콘 심볼을 표시하는 위젯                                      |
| **Padding**             | 자식 위젯의 주변에 내부 여백(padding)을 추가하는 위젯                                           |
| **EdgeInsets**          | 상하좌우 여백을 지정하는 객체. all·symmetric·only·fromLTRB 등                                   |
| **Align**               | 자식을 부모 안의 특정 위치에 정렬하는 위젯                                                      |
| **Alignment**           | Align·Container에서 사용하는 2D 좌표계. (-1,-1)=좌상단, (1,1)=우하단, (0,0)=중앙                |
| **FractionalOffset**    | Alignment와 유사하지만 (0,0)=좌상단, (1,1)=우하단 좌표계                                        |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Container: 박스 모델의 모든 것

`Container`는 Flutter에서 가장 많이 쓰이는 위젯 중 하나다. 크기·여백·색상·테두리·그림자·변환을 한 곳에서 처리한다.

#### Container의 크기 결정 규칙

Container는 상황에 따라 다르게 크기를 결정한다. 이를 모르면 "왜 Container가 원하는 크기가 아닌가?"라는 문제를 반복하게 된다.

```
Container 크기 결정 우선순위
──────────────────────────────────────────────
1. width·height 명시      → 해당 크기로 고정
2. constraints 명시        → 제약 범위 내
3. 자식이 있음             → 자식 크기 + padding
4. 자식 없음 + Bounded     → 부모가 준 최대 크기 (꽉 채움)
5. 자식 없음 + Unbounded   → 크기 0
──────────────────────────────────────────────
```

```dart
// 케이스 1: width·height 명시 → 300×200 고정
Container(
  width: 300,
  height: 200,
  color: Colors.blue,
)

// 케이스 2: 자식 있음, 크기 미지정 → 자식 Text 크기에 맞춤
Container(
  color: Colors.blue,
  child: const Text('안녕'),   // Text 크기만큼
)

// 케이스 3: 자식 없음, Bounded 부모 → 부모 최대 크기 (꽉 채움!)
Container(color: Colors.blue) // ← Scaffold body 안에서 전체 화면!

// 케이스 4: 자식 없음, Unbounded 부모 → 크기 0 (보이지 않음)
// Row 안에서 크기 미지정 Container → 0 너비
```

> ⚠️ **함정 주의:** 자식이 없는 Container를 Scaffold body에 바로 넣으면 화면 전체를 차지한다. 의도치 않은 동작이라면 `width`·`height`를 명시하거나 `Align`·`Center`로 감싸야 한다.

#### BoxDecoration 구조

```dart
Container(
  width: 200,
  height: 120,
  decoration: BoxDecoration(
    // 1. 배경 (color 또는 gradient, 둘 다 동시 사용 불가)
    color: Colors.white,
    // gradient: LinearGradient(colors: [Colors.blue, Colors.purple]),

    // 2. 테두리 둥글기
    borderRadius: BorderRadius.circular(12),

    // 3. 테두리 선
    border: Border.all(color: Colors.grey.shade300, width: 1),

    // 4. 그림자
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.08),
        blurRadius: 8,
        offset: const Offset(0, 4),
      ),
    ],

    // 5. 배경 이미지
    // image: DecorationImage(image: NetworkImage('url'), fit: BoxFit.cover),
  ),
  child: const Center(child: Text('카드')),
)
```

**BoxDecoration 구성 요소 시각화:**

```
┌─────────────────────────────────────────┐  ← boxShadow (offset: 0, 4)
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← border (회색 1px)
│  ┌─────────────────────────────────┐   │
│  │                                 │   │  ← borderRadius (12)
│  │  color 또는 gradient            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────┘
```

> ⚠️ **함정 주의:** `Container`에서 `color`와 `decoration`을 동시에 지정하면 오류가 발생한다. 색상은 `BoxDecoration` 안에 `color`로 넣거나, `decoration` 없이 `Container`의 `color` 프로퍼티에만 사용해야 한다.

```dart
// ❌ 오류: color와 decoration 동시 지정
Container(
  color: Colors.blue,          // ← 오류!
  decoration: BoxDecoration(border: Border.all()),
)

// ✅ 올바름: decoration 안에 color 포함
Container(
  decoration: BoxDecoration(
    color: Colors.blue,
    border: Border.all(),
  ),
)
```

#### Gradient 적용

```dart
// LinearGradient: 선형 그라디언트
decoration: BoxDecoration(
  gradient: LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Colors.purple, Colors.blue],
    stops: const [0.0, 1.0],   // 각 색상의 위치 (0.0~1.0)
  ),
  borderRadius: BorderRadius.circular(16),
)

// RadialGradient: 원형 그라디언트
decoration: BoxDecoration(
  gradient: RadialGradient(
    center: Alignment.center,
    radius: 0.8,
    colors: [Colors.yellow, Colors.orange],
  ),
)
```

---

### 3.2 Text: 텍스트 표시와 스타일링

#### 기본 사용과 TextStyle

```dart
// 기본 Text
const Text('안녕하세요')

// TextStyle 적용
Text(
  '제목 텍스트',
  style: TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.black87,
    letterSpacing: 1.2,      // 자간
    height: 1.5,             // 행간 (fontSize 배수)
    decoration: TextDecoration.underline,
  ),
)

// Theme의 TextTheme 활용 (권장)
Text(
  '제목',
  style: Theme.of(context).textTheme.headlineMedium,
)
```

**TextTheme 계층 구조 (Material 3):**

| TextTheme 키     | 용도             | 기본 크기 |
| ---------------- | ---------------- | --------- |
| `displayLarge`   | 최대 표시 텍스트 | 57sp      |
| `headlineLarge`  | 큰 제목          | 32sp      |
| `headlineMedium` | 중간 제목        | 28sp      |
| `titleLarge`     | 앱바 제목 등     | 22sp      |
| `bodyLarge`      | 본문 크게        | 16sp      |
| `bodyMedium`     | 본문 기본        | 14sp      |
| `labelLarge`     | 버튼 레이블      | 14sp      |

#### overflow와 maxLines

```dart
// 텍스트가 공간을 넘칠 때 처리
Text(
  '매우 긴 텍스트가 있는 경우...',
  maxLines: 2,                          // 최대 2줄
  overflow: TextOverflow.ellipsis,      // 넘치면 '...'
)

// TextOverflow 옵션 비교
// .ellipsis  → 텍스트... (가장 일반적)
// .clip      → 잘림 (경계에서 날카롭게 잘림)
// .fade      → 끝부분이 흐려짐
// .visible   → 부모 경계를 넘어 그대로 표시 (기본값)
```

#### RichText: 복합 스타일 텍스트

```dart
// 한 문장 안에서 서로 다른 스타일
RichText(
  text: TextSpan(
    style: const TextStyle(color: Colors.black, fontSize: 16),
    children: [
      const TextSpan(text: '안녕하세요, '),
      TextSpan(
        text: 'Flutter',
        style: const TextStyle(
          color: Colors.blue,
          fontWeight: FontWeight.bold,
        ),
      ),
      const TextSpan(text: ' 개발자님!'),
    ],
  ),
)

// Text.rich: RichText의 간편 버전
Text.rich(
  TextSpan(
    children: [
      const TextSpan(text: '가격: '),
      TextSpan(
        text: '₩29,900',
        style: const TextStyle(
          color: Colors.red,
          fontWeight: FontWeight.bold,
        ),
      ),
    ],
  ),
)
```

---

### 3.3 Image: 이미지 표시

#### Image 소스 종류

| 생성자                | 소스                       | 사용 시나리오                   |
| --------------------- | -------------------------- | ------------------------------- |
| `Image.network(url)`  | 인터넷 URL                 | 서버 이미지, 사용자 아바타      |
| `Image.asset(path)`   | pubspec.yaml에 등록된 에셋 | 앱 내 정적 이미지               |
| `Image.file(file)`    | 기기 파일 시스템           | 카메라 촬영 이미지, 갤러리 선택 |
| `Image.memory(bytes)` | 메모리 바이트              | 동적으로 생성된 이미지          |

```dart
// 네트워크 이미지
Image.network(
  'https://example.com/image.jpg',
  width: 200,
  height: 150,
  fit: BoxFit.cover,
  loadingBuilder: (context, child, progress) {
    if (progress == null) return child;
    return const Center(child: CircularProgressIndicator());
  },
  errorBuilder: (context, error, stack) {
    return const Icon(Icons.broken_image, size: 48);
  },
)

// 에셋 이미지 (pubspec.yaml에 등록 필요)
Image.asset(
  'assets/images/logo.png',
  width: 100,
)
```

**pubspec.yaml 에셋 등록:**

```yaml
flutter:
  assets:
    - assets/images/ # 폴더 전체 등록
    - assets/images/logo.png # 파일 하나만 등록
```

#### BoxFit 옵션 비교

```
원본 이미지: 가로형 (3:2)
Container: 정사각형 (1:1)

BoxFit.cover    → 컨테이너를 꽉 채움, 이미지 일부 잘릴 수 있음  ← 카드 배경 등
BoxFit.contain  → 이미지 전체 표시, 여백 발생               ← 로고, 아이콘
BoxFit.fill     → 컨테이너를 꽉 채움, 비율 무시 (왜곡)
BoxFit.fitWidth → 너비를 컨테이너에 맞춤, 높이 비율 유지
BoxFit.fitHeight→ 높이를 컨테이너에 맞춤, 너비 비율 유지
BoxFit.none     → 원본 크기 그대로 (잘리거나 여백 발생)
BoxFit.scaleDown→ contain과 동일하지만 원본보다 크게 확대 안 함
```

#### 원형 이미지 만들기

```dart
// 방법 1: ClipOval
ClipOval(
  child: Image.network(
    'https://example.com/avatar.jpg',
    width: 60,
    height: 60,
    fit: BoxFit.cover,
  ),
)

// 방법 2: CircleAvatar (프로필 사진에 최적화)
CircleAvatar(
  radius: 30,
  backgroundImage: const NetworkImage('https://example.com/avatar.jpg'),
  backgroundColor: Colors.grey[200],
)

// 방법 3: Container + BoxDecoration (커스터마이징 자유도 높음)
Container(
  width: 60,
  height: 60,
  decoration: BoxDecoration(
    shape: BoxShape.circle,
    image: DecorationImage(
      image: NetworkImage('https://example.com/avatar.jpg'),
      fit: BoxFit.cover,
    ),
  ),
)
```

---

### 3.4 Icon: 아이콘 표시

```dart
// Material 아이콘
const Icon(Icons.star, size: 24, color: Colors.amber)
const Icon(Icons.favorite, size: 32, color: Colors.red)

// Cupertino 아이콘 (iOS 스타일)
const Icon(CupertinoIcons.heart_fill, size: 24, color: Colors.red)

// 아이콘 + 텍스트 조합 (자주 쓰는 패턴)
Row(
  mainAxisSize: MainAxisSize.min,
  children: const [
    Icon(Icons.star, size: 16, color: Colors.amber),
    SizedBox(width: 4),
    Text('4.8'),
  ],
)
```

**아이콘 탐색 방법:**

- [Material Icons 공식 갤러리](https://fonts.google.com/icons) — `Icons.아이콘명`
- [Cupertino Icons 갤러리](https://cupertino-icons-gallery.netlify.app) — `CupertinoIcons.아이콘명`

---

### 3.5 Padding: 내부 여백

`Padding`은 자식 위젯의 사방에 여백을 추가한다. `EdgeInsets`로 여백을 지정한다.

```dart
// 사방 동일 여백
Padding(
  padding: const EdgeInsets.all(16),
  child: Text('모든 방향 16px'),
)

// 상하·좌우 대칭 여백
Padding(
  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
  child: Text('좌우 24, 상하 8'),
)

// 특정 방향만 여백
Padding(
  padding: const EdgeInsets.only(top: 8, bottom: 16),
  child: Text('상 8, 하 16'),
)

// LTRB (Left, Top, Right, Bottom) 직접 지정
Padding(
  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
  child: Text('개별 지정'),
)
```

**Container의 padding vs Padding 위젯:**

```dart
// 둘 다 동일한 결과
Container(padding: const EdgeInsets.all(16), child: Text('동일'))
Padding(padding: const EdgeInsets.all(16), child: Text('동일'))

// 권장 선택 기준:
// 여백만 필요: Padding 위젯 (더 가볍고 의미 명확)
// 여백 + 색상·테두리 등: Container
```

---

### 3.6 Align: 자식 정렬

`Align`은 자식을 부모 영역 안의 특정 위치에 배치한다. `Alignment` 좌표계를 사용한다.

```
Alignment 좌표계
──────────────────────────────────
  (-1,-1)   (0,-1)   (1,-1)
  topLeft   topCenter topRight

  (-1,0)    (0,0)    (1,0)
  centerLeft center  centerRight

  (-1,1)    (0,1)    (1,1)
  bottomLeft bottomCenter bottomRight
──────────────────────────────────
```

```dart
// 우하단 정렬
Align(
  alignment: Alignment.bottomRight,
  child: const FloatingActionButton(onPressed: null, child: Icon(Icons.add)),
)

// 임의 위치 (x: 0.5 = 오른쪽 3/4 지점, y: -0.5 = 위쪽 1/4 지점)
Align(
  alignment: const Alignment(0.5, -0.5),
  child: Text('임의 위치'),
)
```

**Align vs Center:**

```dart
// Center == Align(alignment: Alignment.center)
// 의미가 명확한 경우 Center 사용 권장
Center(child: Text('가운데'))                    // ← 선호
Align(alignment: Alignment.center, child: Text('가운데'))  // 동일
```

---

## 4. 사례 연구

### 4.1 상품 카드 UI 구현

실무에서 자주 만드는 상품 카드를 기본 위젯으로 완전 구현한다.

```dart
class ProductCard extends StatelessWidget {
  final String imageUrl;
  final String name;
  final int price;
  final double rating;
  final int reviewCount;

  const ProductCard({
    super.key,
    required this.imageUrl,
    required this.name,
    required this.price,
    required this.rating,
    required this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 이미지 영역
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Image.network(
              imageUrl,
              height: 120,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 120,
                color: Colors.grey[200],
                child: const Icon(Icons.image, size: 40, color: Colors.grey),
              ),
            ),
          ),
          // 정보 영역
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '₩${_formatPrice(price)}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, size: 12, color: Colors.amber),
                    const SizedBox(width: 2),
                    Text(
                      '$rating ($reviewCount)',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]},',
    );
  }
}
```

---

### 4.2 그라디언트 배너 카드

```dart
Container(
  width: double.infinity,
  height: 160,
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(20),
    gradient: const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Color(0xFF6C63FF), Color(0xFF3B82F6)],
    ),
    boxShadow: [
      BoxShadow(
        color: const Color(0xFF6C63FF).withOpacity(0.4),
        blurRadius: 20,
        offset: const Offset(0, 8),
      ),
    ],
  ),
  child: Stack(
    children: [
      // 배경 원형 장식
      Positioned(
        right: -20,
        top: -20,
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withOpacity(0.1),
          ),
        ),
      ),
      // 콘텐츠
      Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Text(
              '오늘의 특가',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            SizedBox(height: 4),
            Text(
              '최대 50% 할인',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    ],
  ),
)
```

---

### 4.3 배지(Badge) 패턴

알림 숫자처럼 위젯 위에 작은 레이블을 올리는 패턴이다.

```dart
Stack(
  clipBehavior: Clip.none,
  children: [
    const Icon(Icons.notifications, size: 28),
    Positioned(
      top: -4,
      right: -4,
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: const BoxDecoration(
          color: Colors.red,
          shape: BoxShape.circle,
        ),
        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
        child: const Text(
          '3',
          style: TextStyle(color: Colors.white, fontSize: 10),
          textAlign: TextAlign.center,
        ),
      ),
    ),
  ],
)
```

---

## 5. 실습

### 5.1 프로필 카드 구현

아래 디자인 스펙을 보고 기본 위젯으로 구현하라.

```
목표 레이아웃:
┌─────────────────────────────────────────┐  ← 흰색 카드, 둥근 모서리(16), 그림자
│  ┌──────────────────────────────────┐   │
│  │      배경 (그라디언트, 80px)     │   │
│  └──────────────────────────────────┘   │
│       [CircleAvatar, radius 36]         │  ← 배경 아래로 반쯤 걸침 (Align)
│         이름 (Bold, 18sp)               │
│         @handle (Grey, 13sp)            │
│  ────────────────────────────────────   │
│   게시물    팔로워    팔로잉             │
│    128      3.2K      412               │
└─────────────────────────────────────────┘
```

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  home: Scaffold(
    backgroundColor: Color(0xFFF5F5F5),
    body: Center(child: ProfileCard()),
  ),
));

class ProfileCard extends StatelessWidget {
  const ProfileCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 그라디언트 배경 + 아바타
          Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.bottomCenter,
            children: [
              // 그라디언트 배경
              Container(
                height: 80,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  gradient: LinearGradient(
                    colors: [Color(0xFF6C63FF), Color(0xFF3B82F6)],
                  ),
                ),
              ),
              // 아바타 (배경 아래로 걸침)
              Positioned(
                bottom: -36,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                  child: const CircleAvatar(
                    radius: 36,
                    backgroundImage: NetworkImage(
                      'https://i.pravatar.cc/150?img=3',
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 44), // 아바타 공간 확보
          // 이름·핸들
          const Text(
            '김플러터',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          const Text(
            '@flutter_dev',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Divider(),
          ),
          // 통계
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _StatItem(label: '게시물', value: '128'),
              _StatItem(label: '팔로워', value: '3.2K'),
              _StatItem(label: '팔로잉', value: '412'),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }
}
```

---

### 5.2 자가 평가 퀴즈

**Q1. [Remember]** `BoxDecoration`에서 동시에 사용할 수 없는 프로퍼티 조합은?

- A) border와 borderRadius
- B) **color와 gradient** ✅
- C) boxShadow와 image
- D) border와 boxShadow

---

**Q2. [Understand]** 자식이 없는 `Container`를 `Scaffold` body에 직접 배치하면 어떤 크기가 되는가?

- A) 크기 0 (보이지 않음)
- B) 자식 내용에 맞는 크기
- C) **화면 전체 크기** ✅
- D) 64×64 기본 크기

---

**Q3. [Understand]** `BoxFit.cover`와 `BoxFit.contain`의 차이는?

> **모범 답안:** `BoxFit.cover`는 컨테이너를 빈틈 없이 채우되 이미지 비율을 유지한다. 컨테이너보다 이미지가 크거나 비율이 다를 때 일부가 잘릴 수 있다. `BoxFit.contain`은 이미지 전체가 보이도록 비율을 유지하며 컨테이너 안에 맞춘다. 컨테이너와 이미지 비율이 다르면 여백이 생긴다. 카드 배경 이미지처럼 꽉 채워야 할 때는 `cover`, 로고처럼 전체가 보여야 할 때는 `contain`을 선택한다.

---

**Q4. [Apply]** 텍스트가 2줄을 넘으면 말줄임표(`...`)로 처리하는 `Text` 위젯 코드를 작성하라.

```dart
// 모범 답안
Text(
  '이 텍스트가 매우 길어서 두 줄을 초과하는 경우 말줄임표로 처리됩니다.',
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
)
```

---

**Q5. [Understand]** `Container`에서 `color`와 `decoration`을 동시에 지정하면 안 되는 이유와 올바른 대안 코드를 작성하라.

> **모범 답안:** `Container`의 `color` 프로퍼티는 내부적으로 `BoxDecoration(color: ...)` 으로 변환된다. `decoration`을 동시에 지정하면 두 개의 `BoxDecoration`이 충돌해 오류가 발생한다. 올바른 방법은 `decoration` 없이 `color`만 사용하거나, `decoration: BoxDecoration(color: Colors.blue, ...)`처럼 색상을 `BoxDecoration` 안에 포함시키는 것이다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Container**는 크기·색상·테두리·그림자·변환을 담당하는 다목적 위젯이다. `color`와 `decoration`을 동시에 사용하면 오류가 발생한다.
- **BoxDecoration**으로 `borderRadius`·`boxShadow`·`gradient`·`border`를 조합해 다양한 카드 스타일을 구현한다.
- **Text**는 `maxLines`·`overflow`로 공간 초과를 처리하고, `TextTheme`을 활용해 일관된 타이포그래피를 유지한다.
- **Image**는 `network`·`asset`·`file`·`memory` 소스를 지원하며, `loadingBuilder`·`errorBuilder`로 로딩·오류 상태를 처리한다.
- **BoxFit.cover**는 꽉 채우기(일부 잘림 허용), **BoxFit.contain**은 전체 보기(여백 허용)다.
- **Padding**은 여백만 필요할 때, **Container**는 꾸미기까지 필요할 때 선택한다.
- **Align**의 `Alignment` 좌표계는 (-1,-1)=좌상단, (1,1)=우하단, (0,0)=중앙이다.

### 6.2 다음 Step 예고

- **Step 08 — Material Design 시스템:** Scaffold, AppBar, Drawer, BottomNavigationBar, Theme, AdaptiveTheme으로 앱 전체 구조를 구성하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                     | 링크                                                                | 설명              |
| ------------------------ | ------------------------------------------------------------------- | ----------------- |
| Widget 카탈로그          | <https://docs.flutter.dev/ui/widgets>                               | 전체 위젯 목록    |
| Container 공식 문서      | <https://api.flutter.dev/flutter/widgets/Container-class.html>      | Container API     |
| BoxDecoration 공식 문서  | <https://api.flutter.dev/flutter/painting/BoxDecoration-class.html> | BoxDecoration API |
| Material Icons 갤러리    | <https://fonts.google.com/icons>                                    | 아이콘 탐색       |
| Flutter — Layouts (공식) | <https://docs.flutter.dev/ui/layout/tutorial>                       | 레이아웃 튜토리얼 |

### 6.4 FAQ

**Q. `Padding` 위젯과 `Container`의 `padding` 프로퍼티 중 무엇을 써야 하는가?**

> 여백만 추가할 때는 `Padding` 위젯이 더 가볍고 의도가 명확하다. `Container`는 색상·테두리 등 추가 꾸미기가 함께 필요할 때 사용한다. Flutter 린터도 불필요한 `Container` 사용 시 경고를 띄운다.

**Q. `ClipRRect`와 `Container`의 `borderRadius` 중 어떤 것으로 이미지를 둥글게 만드는가?**

> `Image.network`에 직접 `borderRadius`를 줄 수 없기 때문에 두 방법 모두 사용된다. `ClipRRect`는 자식을 물리적으로 클리핑하므로 확실히 동작한다. `Container`의 `decoration.borderRadius`는 배경에만 적용되며, 자식(Image)은 별도로 클리핑해야 한다. 이미지 모서리를 반드시 둥글게 해야 한다면 `ClipRRect`를 사용하는 것이 안전하다.

**Q. 아이콘 크기를 pixel 단위로 지정할 수 있는가?**

> `Icon`의 `size` 프로퍼티는 논리적 픽셀(logical pixel) 단위로 지정한다. 기기의 픽셀 밀도(devicePixelRatio)에 따라 실제 렌더링 픽셀이 결정된다. 일반적으로 `size: 24`가 기본이며, 1.5배 = `36`, 2배 = `48`처럼 배수로 지정하면 시각적으로 일관된다.

---

## 빠른 자가진단 체크리스트

- [ ] Container의 크기 결정 규칙 5가지를 순서대로 말할 수 있는가?
- [ ] `color`와 `decoration`을 동시에 쓰면 안 되는 이유를 설명할 수 있는가?
- [ ] BoxFit.cover와 BoxFit.contain의 차이를 시각적으로 설명할 수 있는가?
- [ ] Text의 overflow 옵션 4가지를 나열할 수 있는가?
- [ ] Alignment 좌표계에서 우상단의 값을 말할 수 있는가? (`(1, -1)`)
- [ ] Image.network에서 로딩·오류 상태를 처리하는 방법을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: 자식 없는 Container가 Bounded 부모 안에서 화면을 꽉 채운다는 것을 기억하는가?
