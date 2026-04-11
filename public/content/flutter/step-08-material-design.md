# Step 08 — Material Design 시스템

> **파트:** 2️⃣ Flutter UI 시스템 이해 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Remembering → Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Remember]** Scaffold의 주요 슬롯(appBar·body·drawer·bottomNavigationBar·floatingActionButton)을 나열할 수 있다.
2. **[Understand]** ThemeData가 앱 전체에 전파되는 원리(InheritedWidget)를 설명할 수 있다.
3. **[Understand]** Material 2와 Material 3의 차이와 Flutter에서 M3를 활성화하는 방법을 설명할 수 있다.
4. **[Understand]** AdaptiveTheme이 필요한 이유와 동작 방식을 설명할 수 있다.
5. **[Apply]** Scaffold·AppBar·BottomNavigationBar·Drawer를 조합해 다중 탭 앱 구조를 구현할 수 있다.
6. **[Apply]** ThemeData의 ColorScheme을 커스터마이징해 앱 브랜드 색상을 적용할 수 있다.

**전제 지식:** Step 01~07 완료, InheritedWidget 개념(Step 04 BuildContext), StatefulWidget(Step 05)

---

## 1. 서론

### 1.1 Material Design이란

Material Design은 Google이 2014년 발표한 **디자인 언어(Design Language)**다. 버튼, 카드, 내비게이션 등 UI 컴포넌트의 모양·동작·접근성 기준을 정의한다. Flutter는 Material Design 3(M3)를 공식 지원하며, 수십 개의 Material 위젯을 제공한다.

```
Material Design 버전 역사
──────────────────────────────────────────────────
  Material 1 (2014): 기본 플랫(flat) + 그림자 중심 디자인
  Material 2 (2018): 더 정교한 타입·색상·공간 시스템
  Material 3 (2021): 개인화·접근성·동적 색상 강화 ← Flutter 현재 기본
──────────────────────────────────────────────────
```

### 1.2 왜 Material 시스템을 배워야 하는가

```
Material 시스템 없이 만든다면
──────────────────────────────────────────────────
  버튼 색상 → 각 위젯마다 수동 지정
  다크모드 → 모든 색상을 조건문으로 분기
  타이포그래피 → fontSize를 모든 Text마다 하드코딩
  내비게이션 → 직접 Stack·Positioned로 구현

Material 시스템을 활용하면
──────────────────────────────────────────────────
  ThemeData 한 곳에서 전체 색상·타입 정의
  → 모든 위젯에 자동 적용
  → 다크모드도 ThemeData 두 벌로 해결
  → 코드 중복 최소화, 일관성 보장
```

### 1.3 전체 개념 지도

```
Material Design 시스템
    │
    ├── Scaffold          ← 앱 화면 뼈대 (슬롯 기반 레이아웃)
    │     ├── AppBar      ← 상단 툴바
    │     ├── body        ← 메인 콘텐츠 영역
    │     ├── drawer      ← 좌측 슬라이드 메뉴
    │     ├── endDrawer   ← 우측 슬라이드 메뉴
    │     ├── bottomNavigationBar ← 하단 탭 바
    │     ├── floatingActionButton ← 우하단 플로팅 버튼
    │     └── bottomSheet ← 하단 시트
    │
    ├── Theme 시스템
    │     ├── ThemeData   ← 전체 스타일 정의
    │     │     ├── ColorScheme (색상 팔레트)
    │     │     ├── TextTheme   (타이포그래피)
    │     │     └── 위젯별 테마 (AppBarTheme, CardTheme ...)
    │     └── Theme.of(context) ← InheritedWidget으로 전파
    │
    └── AdaptiveTheme     ← 라이트/다크 전환 + 시스템 연동
```

---

## 2. 기본 개념과 용어

| 용어                           | 정의                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **Scaffold**                   | Material Design 앱의 기본 화면 구조를 제공하는 위젯. AppBar·body·Drawer 등 슬롯으로 구성   |
| **AppBar**                     | 화면 상단 툴바. 제목·뒤로가기 버튼·액션 아이콘 등을 포함                                   |
| **Drawer**                     | 화면 좌측에서 슬라이드로 나타나는 내비게이션 패널                                          |
| **BottomNavigationBar**        | 화면 하단의 탭 내비게이션 바. 주요 화면 간 전환에 사용                                     |
| **NavigationBar**              | Material 3 스타일 하단 내비게이션 바 (BottomNavigationBar의 M3 버전)                       |
| **FloatingActionButton (FAB)** | 화면 위에 떠 있는 주요 액션 버튼. 우하단에 기본 배치                                       |
| **ThemeData**                  | 앱 전체의 색상·타이포그래피·shape 등 시각적 스타일을 정의하는 객체                         |
| **ColorScheme**                | Material 3의 색상 팔레트 시스템. primary·secondary·tertiary 등 역할 기반 색상 정의         |
| **TextTheme**                  | 앱 전체에서 사용하는 텍스트 스타일 계층 (displayLarge~labelSmall)                          |
| **InheritedWidget**            | 위젯 트리 아래로 데이터를 효율적으로 전파하는 위젯. ThemeData·MediaQuery 등이 이 방식 사용 |
| **Material 3 (M3)**            | 2021년 발표된 Material Design 최신 버전. 동적 색상·더 둥근 모양·개선된 접근성              |
| **useMaterial3**               | ThemeData에서 M3를 활성화하는 플래그. Flutter 3.16부터 기본값 `true`                       |
| **AdaptiveTheme**              | 라이트/다크 테마 전환 및 시스템 테마 연동을 쉽게 관리하는 서드파티 패키지                  |
| **SnackBar**                   | 화면 하단에 잠깐 나타났다 사라지는 알림 메시지                                             |
| **ScaffoldMessenger**          | SnackBar·MaterialBanner 같은 메시지를 Scaffold에 표시하는 관리 위젯                        |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Scaffold: 슬롯 기반 레이아웃

Scaffold는 Material Design 앱의 화면 **뼈대(skeleton)**다. 각 슬롯에 위젯을 끼우는 방식으로 앱의 기본 구조를 완성한다.

```
Scaffold 슬롯 구조
──────────────────────────────────────────────────────
  ┌──────────────────────────────────────┐
  │            AppBar                    │ ← appBar:
  ├──────────────────────────────────────┤
  │                                      │
  │             body                     │ ← body:
  │                                      │
  ├──────────────────────────────────────┤
  │       BottomNavigationBar            │ ← bottomNavigationBar:
  └──────────────────────────────────────┘
       ↑                    ↑
    Drawer              FloatingActionButton
  (drawer:)            (floatingActionButton:)
──────────────────────────────────────────────────────
```

```dart
Scaffold(
  // 1. 상단 AppBar
  appBar: AppBar(
    title: const Text('홈'),
    centerTitle: true,          // 제목 중앙 정렬 (iOS 스타일)
    leading: IconButton(        // 좌측 아이콘
      icon: const Icon(Icons.menu),
      onPressed: () => Scaffold.of(context).openDrawer(),
    ),
    actions: [                  // 우측 액션 아이콘들
      IconButton(icon: const Icon(Icons.search), onPressed: () {}),
      IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
    ],
    elevation: 0,               // 그림자 (0 = 플랫)
    backgroundColor: Colors.white,
  ),

  // 2. 메인 콘텐츠
  body: const Center(child: Text('메인 콘텐츠')),

  // 3. 좌측 Drawer
  drawer: const AppDrawer(),

  // 4. 하단 내비게이션
  bottomNavigationBar: NavigationBar(
    selectedIndex: _selectedIndex,
    onDestinationSelected: (i) => setState(() => _selectedIndex = i),
    destinations: const [
      NavigationDestination(icon: Icon(Icons.home), label: '홈'),
      NavigationDestination(icon: Icon(Icons.search), label: '탐색'),
      NavigationDestination(icon: Icon(Icons.person), label: '프로필'),
    ],
  ),

  // 5. 플로팅 액션 버튼
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: const Icon(Icons.add),
  ),
  floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
)
```

---

### 3.2 AppBar 심화

```dart
// SliverAppBar: 스크롤에 따라 축소·확장되는 AppBar
CustomScrollView(
  slivers: [
    SliverAppBar(
      expandedHeight: 200,           // 펼쳐진 높이
      floating: false,               // 스크롤 내릴 때 바로 나타남 여부
      pinned: true,                  // 스크롤해도 상단 고정 여부
      snap: false,                   // floating과 함께 사용, 스냅 여부
      flexibleSpace: FlexibleSpaceBar(
        title: const Text('타이틀'),
        background: Image.network(
          'https://example.com/header.jpg',
          fit: BoxFit.cover,
        ),
      ),
    ),
    SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, i) => ListTile(title: Text('항목 $i')),
        childCount: 30,
      ),
    ),
  ],
)
```

**AppBar 주요 속성 정리:**

| 속성                        | 타입                | 설명                              |
| --------------------------- | ------------------- | --------------------------------- |
| `title`                     | Widget              | 제목 위젯                         |
| `centerTitle`               | bool                | 제목 중앙 정렬 여부               |
| `leading`                   | Widget              | 좌측 위젯 (뒤로가기 자동 배치됨)  |
| `automaticallyImplyLeading` | bool                | 자동 뒤로가기 버튼 여부           |
| `actions`                   | List\<Widget\>      | 우측 액션 버튼들                  |
| `bottom`                    | PreferredSizeWidget | AppBar 하단 추가 위젯 (TabBar 등) |
| `elevation`                 | double              | 그림자 깊이                       |
| `backgroundColor`           | Color               | 배경색                            |
| `foregroundColor`           | Color               | 아이콘·텍스트 색상                |
| `scrolledUnderElevation`    | double              | 스크롤 시 그림자 깊이             |

---

### 3.3 Drawer: 슬라이드 내비게이션

```dart
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,  // DrawerHeader 위 여백 제거
        children: [
          // 헤더: 사용자 정보 표시
          DrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6C63FF), Color(0xFF3B82F6)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: const [
                CircleAvatar(radius: 28, backgroundImage: NetworkImage('...')),
                SizedBox(height: 8),
                Text('김플러터', style: TextStyle(color: Colors.white, fontSize: 16)),
                Text('@flutter_dev', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          // 메뉴 항목
          ListTile(
            leading: const Icon(Icons.home_outlined),
            title: const Text('홈'),
            onTap: () {
              Navigator.pop(context);  // Drawer 닫기
              // 화면 이동 처리
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: const Text('설정'),
            onTap: () => Navigator.pop(context),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('로그아웃', style: TextStyle(color: Colors.red)),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
```

---

### 3.4 BottomNavigationBar vs NavigationBar

Flutter에는 하단 탭 내비게이션을 구현하는 두 가지 위젯이 있다.

| 항목             | BottomNavigationBar | NavigationBar  |
| ---------------- | ------------------- | -------------- |
| Material 버전    | M2                  | M3 ✅          |
| 아이템 강조 방식 | 선택된 탭 색상 변경 | 배경 pill 표시 |
| 레이블 표시      | 기본 표시           | 선택 탭만 표시 |
| 권장 사용        | 레거시 앱 유지      | 신규 앱 개발   |

```dart
// M3 NavigationBar (권장)
NavigationBar(
  selectedIndex: _selectedIndex,
  indicatorColor: Colors.purple.shade100,   // 선택 배경 색상
  onDestinationSelected: (index) {
    setState(() => _selectedIndex = index);
  },
  destinations: const [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),        // 선택 시 아이콘 변경
      label: '홈',
    ),
    NavigationDestination(
      icon: Icon(Icons.explore_outlined),
      selectedIcon: Icon(Icons.explore),
      label: '탐색',
    ),
    NavigationDestination(
      icon: Icon(Icons.person_outline),
      selectedIcon: Icon(Icons.person),
      label: '프로필',
    ),
  ],
)
```

**다중 탭 화면 전환 패턴:**

```dart
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // 탭별 화면 목록 (IndexedStack으로 상태 유지)
  static const _screens = [
    HomeScreen(),
    ExploreScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // IndexedStack: 현재 탭만 보여주지만 모든 탭 상태 유지
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: '홈'),
          NavigationDestination(icon: Icon(Icons.explore), label: '탐색'),
          NavigationDestination(icon: Icon(Icons.person), label: '프로필'),
        ],
      ),
    );
  }
}
```

> ⚠️ **함정 주의:** 탭 전환 시 `Column(children: [if (_index == 0) HomeScreen(), ...])`처럼 조건부로 위젯을 넣으면 탭 이동 시마다 State가 초기화된다. `IndexedStack`을 사용하면 모든 탭의 State가 유지된다.

---

### 3.5 Theme 시스템: ThemeData와 ColorScheme

#### ThemeData 전파 원리

`MaterialApp`이 `ThemeData`를 `InheritedWidget` 메커니즘으로 위젯 트리 전체에 전파한다. 모든 Material 위젯은 `Theme.of(context)`로 현재 테마를 가져와 자신의 스타일을 결정한다.

```
MaterialApp (ThemeData 보유)
    │
    └── InheritedWidget으로 ThemeData 전파
          │
          ├── Scaffold → AppBar 색상: theme.colorScheme.primary
          ├── ElevatedButton → 색상: theme.colorScheme.primary
          └── Text → 스타일: theme.textTheme.bodyMedium
```

```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,               // M3 활성화 (3.16부터 기본 true)
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF6C63FF),  // 브랜드 색상 → 전체 팔레트 자동 생성
      brightness: Brightness.light,
    ),
    textTheme: const TextTheme(
      headlineMedium: TextStyle(fontWeight: FontWeight.bold),
    ),
    // 위젯별 개별 테마
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: true,
      backgroundColor: Colors.white,
      foregroundColor: Colors.black87,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
  ),
  darkTheme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF6C63FF),
      brightness: Brightness.dark,    // 다크모드 팔레트
    ),
  ),
  themeMode: ThemeMode.system,        // 시스템 설정에 따라 자동 전환
  home: const MainScreen(),
)
```

#### ColorScheme.fromSeed: 자동 팔레트 생성

Material 3의 핵심 기능으로, **씨앗 색상(seed color)** 하나를 지정하면 전체 색상 팔레트를 자동으로 생성한다.

```
ColorScheme.fromSeed(seedColor: Color(0xFF6C63FF))
──────────────────────────────────────────────────────
  primary          → 앱의 주 색상 (버튼, AppBar 등)
  onPrimary        → primary 위의 텍스트/아이콘 색
  primaryContainer → primary의 밝은 배경 버전
  secondary        → 보조 색상
  tertiary         → 세 번째 강조 색상
  surface          → 카드·시트 배경
  onSurface        → surface 위의 텍스트 색
  error            → 오류 상태 색상
  background       → 전체 배경색
──────────────────────────────────────────────────────
라이트·다크 모두 씨앗 하나로 일관된 팔레트 생성
```

#### 테마 값 활용

```dart
// 위젯 안에서 테마 값 가져오기
Widget build(BuildContext context) {
  final theme = Theme.of(context);
  final colorScheme = theme.colorScheme;
  final textTheme = theme.textTheme;

  return Container(
    color: colorScheme.primaryContainer,    // 테마 색상 사용
    child: Text(
      '제목',
      style: textTheme.headlineMedium?.copyWith(
        color: colorScheme.onPrimaryContainer,
      ),
    ),
  );
}
```

---

### 3.6 AdaptiveTheme: 라이트/다크 테마 전환

`MaterialApp`의 `themeMode`는 시스템 설정을 따르거나 light/dark로 고정할 수 있다. 그러나 **런타임에 사용자가 직접 테마를 전환**하거나, 선택한 테마를 **앱 재시작 후에도 기억**하려면 `adaptive_theme` 패키지가 필요하다.

```
기본 ThemeData의 한계
──────────────────────────────────────────────────────
  themeMode: ThemeMode.system   → 시스템 설정만 따름
  themeMode: ThemeMode.light    → 고정 (런타임 변경 불가)
  앱 재시작 후 선택 초기화       → SharedPreferences 직접 구현 필요

AdaptiveTheme 장점
──────────────────────────────────────────────────────
  AdaptiveTheme.of(context).setLight()   → 라이트 전환
  AdaptiveTheme.of(context).setDark()    → 다크 전환
  AdaptiveTheme.of(context).setSystem()  → 시스템 연동
  선택한 테마 자동 저장 (SharedPreferences 불필요)
  앱 재시작 후 이전 선택 복원
```

**설치:**

```yaml
# pubspec.yaml
dependencies:
  adaptive_theme: ^3.6.0
```

**적용:**

```dart
import 'package:adaptive_theme/adaptive_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // 저장된 테마 설정 불러오기
  final savedThemeMode = await AdaptiveTheme.getThemeMode();

  runApp(MyApp(savedThemeMode: savedThemeMode));
}

class MyApp extends StatelessWidget {
  final AdaptiveThemeMode? savedThemeMode;
  const MyApp({super.key, this.savedThemeMode});

  @override
  Widget build(BuildContext context) {
    return AdaptiveTheme(
      light: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.light,
        ),
      ),
      dark: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.dark,
        ),
      ),
      initial: savedThemeMode ?? AdaptiveThemeMode.system,
      builder: (theme, darkTheme) => MaterialApp(
        theme: theme,
        darkTheme: darkTheme,
        home: const MainScreen(),
      ),
    );
  }
}

// 화면에서 테마 전환
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          title: const Text('라이트 모드'),
          trailing: const Icon(Icons.light_mode),
          onTap: () => AdaptiveTheme.of(context).setLight(),
        ),
        ListTile(
          title: const Text('다크 모드'),
          trailing: const Icon(Icons.dark_mode),
          onTap: () => AdaptiveTheme.of(context).setDark(),
        ),
        ListTile(
          title: const Text('시스템 설정 따르기'),
          trailing: const Icon(Icons.settings_brightness),
          onTap: () => AdaptiveTheme.of(context).setSystem(),
        ),
      ],
    );
  }
}
```

---

### 3.7 SnackBar와 ScaffoldMessenger

```dart
// SnackBar 표시 (M3 방식)
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(
    content: const Text('저장되었습니다'),
    duration: const Duration(seconds: 2),
    action: SnackBarAction(
      label: '실행 취소',
      onPressed: () { /* 실행 취소 처리 */ },
    ),
    behavior: SnackBarBehavior.floating,    // 하단 위에 떠 있는 스타일
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
);
```

> ⚠️ **함정 주의:** `Scaffold.of(context).showSnackBar()`는 deprecated되었다. 반드시 `ScaffoldMessenger.of(context).showSnackBar()`를 사용해야 한다. 또한 `context`가 `Scaffold` 아래에 있어야 한다.

---

## 4. 사례 연구

### 4.1 Netflix UI의 Scaffold 구조 분석

Netflix 앱처럼 하단 탭과 풀스크린 콘텐츠가 공존하는 구조를 분석한다.

```
Netflix 앱 구조 분해
──────────────────────────────────────────────────────
  Scaffold
    appBar: null (풀스크린)
    body: IndexedStack
      [0] HomeScreen
            └── CustomScrollView
                  ├── SliverAppBar (투명, 오버랩)
                  └── SliverList (콘텐츠)
      [1] SearchScreen
      [2] ComingSoonScreen
      [3] DownloadsScreen
      [4] ProfileScreen
    bottomNavigationBar: NavigationBar (반투명)
──────────────────────────────────────────────────────
```

핵심: AppBar 없이 `extendBodyBehindAppBar: true`와 `SliverAppBar`를 조합해 콘텐츠가 상단까지 올라오는 풀스크린 효과를 구현한다.

```dart
Scaffold(
  extendBodyBehindAppBar: true,   // body가 AppBar 뒤로 확장
  extendBody: true,               // body가 BottomNavigationBar 뒤로 확장
  body: IndexedStack(
    index: _selectedIndex,
    children: _screens,
  ),
  bottomNavigationBar: NavigationBar(
    backgroundColor: Colors.black.withOpacity(0.8),  // 반투명
    selectedIndex: _selectedIndex,
    onDestinationSelected: (i) => setState(() => _selectedIndex = i),
    destinations: const [...],
  ),
)
```

---

### 4.2 ColorScheme.fromSeed로 브랜드 테마 구성

쿠팡(빨강), 카카오(노랑), 네이버(초록) 같은 브랜드 색상을 씨앗으로 지정하면 접근성 기준을 충족하는 전체 팔레트가 자동 생성된다.

```dart
// 브랜드 색상 적용 예시
ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xFFE8003D),  // 쿠팡 빨강
    brightness: Brightness.light,
  ),
)
// → primary, primaryContainer, secondary, surface 등
//   브랜드 색상과 조화로운 전체 팔레트 자동 생성
// → 모든 Material 위젯에 즉시 반영
```

---

### 4.3 위젯별 테마 오버라이드 패턴

전체 테마를 유지하면서 특정 영역만 다른 스타일을 적용할 때 `Theme` 위젯으로 로컬 오버라이드한다.

```dart
// 특정 섹션만 다른 테마 적용
Theme(
  data: Theme.of(context).copyWith(
    cardTheme: const CardTheme(
      color: Color(0xFF1A1A2E),          // 어두운 카드 색상
      elevation: 8,
    ),
  ),
  child: Column(
    children: const [
      SpecialCard(),   // 오버라이드된 CardTheme 적용
      SpecialCard(),
    ],
  ),
)
```

---

## 5. 실습

### 5.1 다중 탭 앱 구현

AppBar·NavigationBar·Drawer·FAB를 모두 갖춘 3탭 앱을 구현하라.

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  title: 'Step 08 실습',
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF6C63FF)),
  ),
  home: MainScreen(),
));

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  static const _titles = ['홈', '탐색', '프로필'];
  static const _screens = [
    _PlaceholderScreen(icon: Icons.home, label: '홈 화면'),
    _PlaceholderScreen(icon: Icons.explore, label: '탐색 화면'),
    _PlaceholderScreen(icon: Icons.person, label: '프로필 화면'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      drawer: _buildDrawer(context),
      body: IndexedStack(index: _selectedIndex, children: _screens),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('새 항목 추가!'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              child: const Icon(Icons.add),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '홈',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: '탐색',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: '프로필',
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: colorScheme.primaryContainer),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: colorScheme.primary,
                  child: const Icon(Icons.person, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 8),
                Text('사용자 이름',
                    style: TextStyle(color: colorScheme.onPrimaryContainer,
                        fontWeight: FontWeight.bold)),
                Text('user@example.com',
                    style: TextStyle(color: colorScheme.onPrimaryContainer.withOpacity(0.7),
                        fontSize: 12)),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: const Text('설정'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('도움말'),
            onTap: () => Navigator.pop(context),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('로그아웃', style: TextStyle(color: Colors.red)),
            onTap: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final IconData icon;
  final String label;
  const _PlaceholderScreen({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 64, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 16),
          Text(label, style: Theme.of(context).textTheme.titleLarge),
        ],
      ),
    );
  }
}
```

**확인 포인트:**

- 탭 전환 시 FAB가 홈 탭에서만 나타나는가?
- Drawer를 열고 항목을 탭하면 닫히는가?
- SnackBar가 `floating` 스타일로 표시되는가?
- `IndexedStack`으로 탭 이동 시 상태가 유지되는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Remember]** Scaffold의 주요 슬롯 5가지를 나열하라.

> **모범 답안:** `appBar`, `body`, `drawer`, `bottomNavigationBar`, `floatingActionButton` (추가로 `endDrawer`, `bottomSheet`, `backgroundColor` 등도 있음)

---

**Q2. [Understand]** `ThemeData`가 모든 하위 위젯에 자동으로 적용되는 원리는?

- A) 전역 변수를 통해 모든 위젯에 전달된다
- B) 각 위젯이 직접 `MaterialApp`을 참조한다
- C) **InheritedWidget 메커니즘으로 위젯 트리를 통해 전파된다** ✅
- D) 빌드 타임에 컴파일러가 주입한다

---

**Q3. [Understand]** `IndexedStack`을 탭 전환에 사용하는 이유는?

> **모범 답안:** `IndexedStack`은 모든 자식 위젯을 메모리에 유지하면서 현재 인덱스의 위젯만 화면에 표시한다. 탭을 전환해도 다른 탭의 State(스크롤 위치, 입력값, 네트워크 데이터 등)가 사라지지 않는다. 반면 조건부 렌더링(`if (_index == 0) HomeScreen()`)은 탭 전환마다 위젯을 dispose·재생성해 State가 초기화된다.

---

**Q4. [Understand]** `AdaptiveTheme`이 기본 `ThemeData.themeMode`보다 유용한 이유는?

> **모범 답안:** 기본 `themeMode`는 앱 시작 시 고정되며 런타임에 변경하려면 `setState()`로 `MaterialApp` 전체를 rebuild해야 하고, 사용자가 선택한 테마를 재시작 후에도 유지하려면 `SharedPreferences`를 별도로 구현해야 한다. `AdaptiveTheme`은 `setLight()`·`setDark()`·`setSystem()` 메서드로 런타임 전환이 가능하고, 선택 값을 자동으로 저장·복원해 추가 구현이 필요 없다.

---

**Q5. [Apply]** `ColorScheme.fromSeed`로 브랜드 색상(`#FF6B35`)을 적용한 라이트 ThemeData를 작성하라.

```dart
// 모범 답안
ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xFFFF6B35),
    brightness: Brightness.light,
  ),
)
```

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Scaffold**는 앱 화면의 뼈대로 `appBar`·`body`·`drawer`·`bottomNavigationBar`·`floatingActionButton` 슬롯으로 구성된다.
- **NavigationBar**(M3)는 `BottomNavigationBar`(M2)의 후속으로, 신규 앱에는 NavigationBar를 사용한다.
- **IndexedStack**으로 탭 전환 시 State를 유지한다. 조건부 렌더링은 State를 초기화한다.
- **ThemeData**는 `InheritedWidget`으로 전파되며, `ColorScheme.fromSeed`로 씨앗 색상 하나에서 전체 팔레트를 생성한다.
- **AdaptiveTheme**으로 런타임 테마 전환과 선택 값 자동 저장을 손쉽게 구현한다.
- **SnackBar**는 `ScaffoldMessenger.of(context)`로 표시한다. `Scaffold.of(context)`는 deprecated.

### 6.2 다음 Step 예고

- **Step 09 — 사용자 인터랙션:** GestureDetector·InkWell·Form·TextField로 사용자 입력과 터치 이벤트를 처리하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                   | 링크                                                                             | 설명                    |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| Material 3 Flutter     | <https://m3.material.io/develop/flutter>                                         | M3 공식 Flutter 가이드  |
| Scaffold 공식 문서     | <https://api.flutter.dev/flutter/material/Scaffold-class.html>                   | Scaffold API            |
| ColorScheme.fromSeed   | <https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html> | M3 색상 시스템          |
| adaptive_theme 패키지  | <https://pub.dev/packages/adaptive_theme>                                        | 다크모드 관리 패키지    |
| Material Theme Builder | <https://m3.material.io/theme-builder>                                           | 색상 팔레트 시각화 도구 |

### 6.4 FAQ

**Q. `useMaterial3: true`로 설정하면 기존 M2 위젯 스타일이 바뀌는가?**

> 그렇다. M3에서는 버튼 모양·색상·AppBar 스타일 등이 달라진다. 기존 M2 앱에 M3를 적용하면 UI가 변경되므로, 신규 앱에서 처음부터 M3를 선택하거나, 기존 앱은 `useMaterial3: false`로 유지하다가 계획적으로 전환하는 것이 좋다.

**Q. `Drawer`를 코드로 열고 닫는 방법은?**

> `Scaffold.of(context).openDrawer()` 또는 `scaffoldKey.currentState?.openDrawer()`로 연다. 닫을 때는 `Navigator.pop(context)`를 사용한다. `GlobalKey<ScaffoldState>`를 Scaffold에 할당하면 context 없이도 접근할 수 있다.

**Q. FAB를 BottomNavigationBar 위에 겹쳐 배치하려면?**

> `floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked`와 `BottomAppBar`를 조합하면 FAB가 하단 바에 파고드는 notched 디자인을 구현할 수 있다. 또는 `extendBody: true`와 `FloatingActionButtonLocation.centerFloat`로 겹치게 배치할 수도 있다.

---

## 빠른 자가진단 체크리스트

- [ ] Scaffold의 6가지 주요 슬롯을 나열할 수 있는가?
- [ ] ThemeData가 InheritedWidget으로 전파된다는 원리를 설명할 수 있는가?
- [ ] NavigationBar와 BottomNavigationBar의 차이를 설명할 수 있는가?
- [ ] IndexedStack을 탭 전환에 쓰는 이유를 설명할 수 있는가?
- [ ] ColorScheme.fromSeed에서 씨앗 색상의 역할을 설명할 수 있는가?
- [ ] AdaptiveTheme이 기본 themeMode보다 유용한 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: SnackBar를 `Scaffold.of()`가 아닌 `ScaffoldMessenger.of()`로 표시해야 하는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: 탭 전환 시 조건부 렌더링 대신 IndexedStack을 써야 하는 이유를 설명할 수 있는가?
