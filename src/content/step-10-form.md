# Step 10 — Form 시스템

> **파트:** 3️⃣ 사용자 인터랙션 | **난이도:** ⭐⭐☆☆☆ | **예상 학습 시간:** 90분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** TextField·TextFormField·Form의 역할 차이를 설명할 수 있다.
2. **[Understand]** GlobalKey\<FormState\>가 Form 검증에서 하는 역할을 설명할 수 있다.
3. **[Understand]** TextEditingController의 동작 원리와 dispose() 필수 이유를 설명할 수 있다.
4. **[Apply]** validator 함수와 RegExp으로 이메일·비밀번호 유효성 검사를 구현할 수 있다.
5. **[Apply]** GlobalKey\<FormState\>().validate()·save()·reset()을 올바르게 사용할 수 있다.
6. **[Apply]** 실무 수준의 로그인·회원가입 폼을 완성도 있게 구현할 수 있다.

**전제 지식:** Step 01~09 완료, StatefulWidget·dispose()(Step 05), FocusNode(Step 09)

---

## 1. 서론

### 1.1 Form 시스템이 필요한 이유

앱에서 사용자 입력을 받는 화면은 단순해 보이지만 실제로는 여러 가지를 동시에 처리해야 한다.

![로그인 폼에 필요한 요소들](/developer-open-book/diagrams/flutter-step10-form-requirements.svg)

### 1.2 전체 개념 지도

![Form 시스템 hierarchy tree](/developer-open-book/diagrams/step10-form-system.svg)

---

## 2. 기본 개념과 용어

| 용어                       | 정의                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| **TextField**              | 텍스트 입력을 받는 기본 위젯. Form과 독립적으로 사용 가능                        |
| **TextFormField**          | TextField에 Form 연동 기능(validator·onSaved)을 추가한 위젯                      |
| **Form**                   | 여러 TextFormField를 하나의 단위로 관리하는 컨테이너 위젯                        |
| **GlobalKey\<FormState\>** | Form 위젯의 상태(FormState)에 외부에서 접근하기 위한 전역 키                     |
| **FormState**              | Form의 상태 객체. validate()·save()·reset() 메서드 제공                          |
| **TextEditingController**  | TextField의 텍스트 값을 읽고 쓰고 변경 이벤트를 구독하는 컨트롤러                |
| **validator**              | TextFormField의 유효성 검사 함수. 오류면 오류 문자열, 정상이면 null 반환         |
| **onSaved**                | FormState.save() 호출 시 실행되는 콜백. 입력값을 변수에 저장                     |
| **autovalidateMode**       | validator를 자동으로 실행하는 시점 설정 (onUserInteraction·always·disabled)      |
| **InputDecoration**        | TextField·TextFormField의 외관 설정 (라벨·힌트·아이콘·에러 메시지·테두리 스타일) |
| **keyboardType**           | 키보드 종류 지정 (emailAddress·number·phone·multiline 등)                        |
| **TextInputAction**        | 키보드의 액션 버튼 종류 (next·done·search·send 등)                               |
| **obscureText**            | 입력 텍스트를 마스킹(•••)하는 속성. 비밀번호 필드에 사용                         |
| **RegExp**                 | 정규 표현식. 이메일·전화번호·비밀번호 패턴 검증에 활용                           |
| **AutofillHints**          | 브라우저·OS의 자동완성 기능을 위한 힌트 (username·password·email 등)             |

---

## 3. 이론적 배경과 원리 ★

### 3.1 TextField vs TextFormField 선택 기준

![TextField vs TextFormField 선택 기준](/developer-open-book/diagrams/flutter-step10-textfield-vs-formfield.svg)

| 상황                                | 선택                 |
| ----------------------------------- | -------------------- |
| 검색 바, 채팅 입력, 단일 필드       | TextField            |
| 로그인, 회원가입, 결제 정보 입력 폼 | TextFormField + Form |

---

### 3.2 TextEditingController

`TextEditingController`는 TextField의 텍스트를 **읽기·쓰기·이벤트 구독** 하는 컨트롤러다.

```dart
class SearchBar extends StatefulWidget {
  const SearchBar({super.key});
  @override
  State<SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<SearchBar> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    // 텍스트 변경 이벤트 구독
    _controller.addListener(() {
      print('현재 입력값: ${_controller.text}');
    });
  }

  @override
  void dispose() {
    _controller.dispose();  // ✅ 반드시 해제
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: _controller,
          decoration: const InputDecoration(
            hintText: '검색어 입력',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        // 외부에서 텍스트 읽기
        ElevatedButton(
          onPressed: () => print(_controller.text),
          child: const Text('현재 값 출력'),
        ),
        // 외부에서 텍스트 설정
        ElevatedButton(
          onPressed: () => _controller.text = '새 텍스트',
          child: const Text('텍스트 변경'),
        ),
        // 텍스트 초기화
        ElevatedButton(
          onPressed: () => _controller.clear(),
          child: const Text('초기화'),
        ),
      ],
    );
  }
}
```

> ⚠️ **함정 주의:** `TextEditingController`는 반드시 `dispose()`에서 해제해야 한다. 해제하지 않으면 메모리 누수가 발생하고 Flutter가 경고를 출력한다.

---

### 3.3 Form + GlobalKey\<FormState\>

`Form` 위젯은 내부의 모든 `TextFormField`를 하나의 단위로 묶어 일괄 관리한다. `GlobalKey<FormState>`로 외부에서 `FormState`에 접근해 validate·save·reset을 수행한다.

```dart
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // GlobalKey: Form의 State에 외부에서 접근하기 위한 열쇠
  final _formKey = GlobalKey<FormState>();
  String? _email;
  String? _password;
  bool _isLoading = false;

  Future<void> _submit() async {
    // ① 모든 TextFormField의 validator 실행
    //    모두 통과(null 반환)하면 true, 하나라도 오류면 false
    if (!_formKey.currentState!.validate()) return;

    // ② 모든 TextFormField의 onSaved 실행 → 변수에 값 저장
    _formKey.currentState!.save();

    setState(() => _isLoading = true);

    // ③ 저장된 값으로 로그인 처리
    await _login(_email!, _password!);

    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,   // GlobalKey 연결
          child: Column(
            children: [
              TextFormField(
                decoration: const InputDecoration(
                  labelText: '이메일',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                validator: _validateEmail,   // 유효성 검사 함수
                onSaved: (value) => _email = value?.trim(),
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: '비밀번호',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _submit(),
                validator: _validatePassword,
                onSaved: (value) => _password = value,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('로그인'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**FormState 메서드 3가지:**

![FormState 메서드 3가지](/developer-open-book/diagrams/flutter-step10-formstate-methods.svg)

---

### 3.4 validator: 유효성 검사 함수

`validator`는 `String? Function(String? value)` 타입의 함수다.

- 유효한 경우 `null` 반환
- 유효하지 않은 경우 오류 메시지 `String` 반환

```dart
// 이메일 유효성 검사
String? _validateEmail(String? value) {
  if (value == null || value.trim().isEmpty) {
    return '이메일을 입력해주세요';
  }
  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!emailRegex.hasMatch(value.trim())) {
    return '올바른 이메일 형식이 아닙니다';
  }
  return null;  // ← 유효: null 반환
}

// 비밀번호 유효성 검사
String? _validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return '비밀번호를 입력해주세요';
  }
  if (value.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다';
  }
  if (!RegExp(r'[A-Z]').hasMatch(value)) {
    return '대문자를 하나 이상 포함해야 합니다';
  }
  if (!RegExp(r'[0-9]').hasMatch(value)) {
    return '숫자를 하나 이상 포함해야 합니다';
  }
  return null;
}

// 전화번호 유효성 검사
String? _validatePhone(String? value) {
  if (value == null || value.isEmpty) return '전화번호를 입력해주세요';
  final phoneRegex = RegExp(r'^01[016789]-?\d{3,4}-?\d{4}$');
  if (!phoneRegex.hasMatch(value.replaceAll('-', ''))) {
    return '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }
  return null;
}
```

---

### 3.5 RegExp 주요 패턴

| 검증 대상     | 정규표현식                                           | 설명                |
| ------------- | ---------------------------------------------------- | ------------------- |
| 이메일        | `r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$'`                | 기본 이메일 형식    |
| 한국 휴대폰   | `r'^01[016789]\d{7,8}$'`                             | 하이픈 제거 후 검증 |
| 숫자만        | `r'^\d+$'`                                           | 정수                |
| 영문+숫자     | `r'^[a-zA-Z0-9]+$'`                                  | 알파뉴메릭          |
| 대문자 포함   | `r'[A-Z]'`                                           | 대문자 1개 이상     |
| 특수문자 포함 | `r'[!@#\$%^&*]'`                                     | 특수문자 1개 이상   |
| URL           | `r'^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$'` | HTTP/HTTPS URL      |
| 한글          | `r'^[가-힣]+$'`                                      | 한글만              |

```dart
// RegExp 사용법
final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

regex.hasMatch('user@example.com')  // true
regex.hasMatch('invalid-email')     // false

// 대소문자 무시
final caseInsensitive = RegExp(r'flutter', caseSensitive: false);
caseInsensitive.hasMatch('Flutter')  // true

// 전체 일치 vs 부분 일치
RegExp(r'\d+').hasMatch('abc123')      // true (부분 일치)
RegExp(r'^\d+$').hasMatch('abc123')    // false (전체 일치 강제)
```

---

### 3.6 InputDecoration: 입력 필드 스타일링

```dart
TextFormField(
  decoration: InputDecoration(
    // 라벨 (포커스 시 위로 이동)
    labelText: '이메일',
    labelStyle: const TextStyle(color: Colors.grey),

    // 힌트 (입력 전에만 표시)
    hintText: 'user@example.com',
    hintStyle: TextStyle(color: Colors.grey[400]),

    // 아이콘
    prefixIcon: const Icon(Icons.email_outlined),
    suffixIcon: IconButton(           // 입력 지우기 버튼
      icon: const Icon(Icons.clear),
      onPressed: () => _controller.clear(),
    ),

    // 접두사·접미사 텍스트
    prefixText: '+82 ',
    suffixText: 'kr',

    // 테두리 스타일
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Colors.grey.shade300),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Colors.blue, width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Colors.red),
    ),

    // 배경 채우기
    filled: true,
    fillColor: Colors.grey[50],

    // 에러 메시지 스타일 (validator 반환값)
    errorStyle: const TextStyle(fontSize: 12),
  ),
)
```

---

### 3.7 autovalidateMode: 자동 검증 시점

```dart
TextFormField(
  autovalidateMode: AutovalidateMode.onUserInteraction,
  // .disabled (기본값):      validate() 호출 시에만 검증
  // .onUserInteraction:      사용자가 입력을 시작한 후부터 실시간 검증
  // .always:                 항상 실시간 검증 (화면 진입 즉시 오류 표시)
  validator: _validateEmail,
)

// Form 전체에 적용
Form(
  key: _formKey,
  autovalidateMode: AutovalidateMode.onUserInteraction,
  child: Column(children: [...]),
)
```

---

### 3.8 비밀번호 표시/숨기기 토글

```dart
class PasswordField extends StatefulWidget {
  final TextEditingController controller;
  final String? Function(String?)? validator;
  const PasswordField({super.key, required this.controller, this.validator});

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: widget.controller,
      obscureText: _obscure,
      validator: widget.validator,
      decoration: InputDecoration(
        labelText: '비밀번호',
        prefixIcon: const Icon(Icons.lock_outline),
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
          onPressed: () => setState(() => _obscure = !_obscure),
        ),
      ),
    );
  }
}
```

---

## 4. 사례 연구

### 4.1 회원가입 폼: 비밀번호 확인 검증

비밀번호와 비밀번호 확인이 일치하는지 크로스 필드 검증이 필요한 경우다.

```dart
class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();  // 비교를 위해 controller 필요

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // 이메일
          TextFormField(
            decoration: const InputDecoration(labelText: '이메일', border: OutlineInputBorder()),
            validator: _validateEmail,
            onSaved: (v) => _email = v?.trim(),
          ),
          const SizedBox(height: 16),
          // 비밀번호
          TextFormField(
            controller: _passwordController,   // controller 필요
            decoration: const InputDecoration(labelText: '비밀번호', border: OutlineInputBorder()),
            obscureText: true,
            validator: _validatePassword,
            onSaved: (v) => _password = v,
          ),
          const SizedBox(height: 16),
          // 비밀번호 확인 (크로스 필드 검증)
          TextFormField(
            decoration: const InputDecoration(labelText: '비밀번호 확인', border: OutlineInputBorder()),
            obscureText: true,
            validator: (value) {
              if (value == null || value.isEmpty) return '비밀번호 확인을 입력해주세요';
              // _passwordController.text와 비교
              if (value != _passwordController.text) return '비밀번호가 일치하지 않습니다';
              return null;
            },
          ),
        ],
      ),
    );
  }
}
```

---

### 4.2 실시간 입력 피드백: 비밀번호 강도 표시

```dart
class _PasswordStrengthState extends State<PasswordStrengthWidget> {
  final _controller = TextEditingController();
  double _strength = 0;
  String _hint = '';

  @override
  void initState() {
    super.initState();
    _controller.addListener(_checkStrength);
  }

  void _checkStrength() {
    final pw = _controller.text;
    double strength = 0;
    if (pw.length >= 8) strength += 0.25;
    if (RegExp(r'[A-Z]').hasMatch(pw)) strength += 0.25;
    if (RegExp(r'[0-9]').hasMatch(pw)) strength += 0.25;
    if (RegExp(r'[!@#\$%^&*]').hasMatch(pw)) strength += 0.25;

    setState(() {
      _strength = strength;
      _hint = switch (strength) {
        0.0 => '',
        <= 0.25 => '매우 약함',
        <= 0.5  => '약함',
        <= 0.75 => '보통',
        _       => '강함',
      };
    });
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _controller,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: '비밀번호', border: OutlineInputBorder(),
          ),
        ),
        if (_controller.text.isNotEmpty) ...[
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: _strength,
            backgroundColor: Colors.grey[200],
            color: _strength <= 0.25 ? Colors.red
                 : _strength <= 0.5  ? Colors.orange
                 : _strength <= 0.75 ? Colors.yellow[700]
                 : Colors.green,
          ),
          const SizedBox(height: 4),
          Text(_hint, style: TextStyle(
            fontSize: 12,
            color: _strength <= 0.25 ? Colors.red : Colors.green,
          )),
        ],
      ],
    );
  }
}
```

---

### 4.3 키보드 타입과 포맷터 활용

```dart
// 전화번호 입력: 숫자 키보드 + 자동 하이픈
import 'package:flutter/services.dart';

TextFormField(
  keyboardType: TextInputType.phone,
  inputFormatters: [
    FilteringTextInputFormatter.digitsOnly,   // 숫자만 허용
    LengthLimitingTextInputFormatter(11),      // 최대 11자
    _PhoneNumberFormatter(),                   // 하이픈 자동 삽입
  ],
  decoration: const InputDecoration(
    labelText: '전화번호',
    hintText: '010-1234-5678',
    border: OutlineInputBorder(),
  ),
)

// 전화번호 포맷터 구현
class _PhoneNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll('-', '');
    String formatted = digits;

    if (digits.length > 3 && digits.length <= 7) {
      formatted = '${digits.substring(0, 3)}-${digits.substring(3)}';
    } else if (digits.length > 7) {
      formatted = '${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7)}';
    }

    return newValue.copyWith(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
```

---

## 5. 실습

### 5.1 완성형 로그인 화면 구현

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  theme: ThemeData(useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF6C63FF))),
  home: LoginPage(),
));

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController    = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordFocus      = FocusNode();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return '이메일을 입력해주세요';
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v.trim()))
      return '올바른 이메일 형식이 아닙니다';
    return null;
  }

  String? _validatePassword(String? v) {
    if (v == null || v.isEmpty) return '비밀번호를 입력해주세요';
    if (v.length < 8) return '8자 이상 입력해주세요';
    return null;
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));  // 로그인 시뮬레이션
    if (!mounted) return;
    setState(() => _isLoading = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('로그인 성공!'), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),
                Text('안녕하세요 👋',
                    style: Theme.of(context).textTheme.headlineMedium
                        ?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('로그인하여 시작하세요',
                    style: Theme.of(context).textTheme.bodyLarge
                        ?.copyWith(color: Colors.grey)),
                const SizedBox(height: 40),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // 이메일
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: '이메일',
                          prefixIcon: Icon(Icons.email_outlined),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        onFieldSubmitted: (_) =>
                            FocusScope.of(context).requestFocus(_passwordFocus),
                        validator: _validateEmail,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                      ),
                      const SizedBox(height: 16),
                      // 비밀번호
                      TextFormField(
                        controller: _passwordController,
                        focusNode: _passwordFocus,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: '비밀번호',
                          prefixIcon: const Icon(Icons.lock_outline),
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword
                                ? Icons.visibility_off : Icons.visibility),
                            onPressed: () =>
                                setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _submit(),
                        validator: _validatePassword,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          child: const Text('비밀번호 찾기'),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          child: _isLoading
                              ? const SizedBox(width: 20, height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2))
                              : const Text('로그인', style: TextStyle(fontSize: 16)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

**확인 포인트:**

- 이메일 필드에서 Next 키를 누르면 비밀번호 필드로 포커스가 이동하는가?
- 잘못된 이메일 입력 후 포커스를 옮기면 실시간으로 오류 메시지가 표시되는가?
- 로그인 버튼 탭 시 2초간 로딩 스피너가 표시되는가?
- 배경 탭 시 키보드가 닫히는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** `TextFormField`의 `validator`가 유효한 경우 반환해야 하는 값은?

- A) `true`
- B) 빈 문자열 `''`
- C) **`null`** ✅
- D) `'OK'`

---

**Q2. [Understand]** `GlobalKey<FormState>`가 필요한 이유는?

- A) TextField의 스타일을 전역으로 적용하기 위해
- B) Form 안의 모든 위젯에 동일한 테마를 주기 위해
- C) **Form 위젯의 상태(FormState)에 외부 코드에서 접근하기 위해** ✅
- D) 여러 화면에서 같은 Form을 공유하기 위해

---

**Q3. [Understand]** `validate()` 후 반드시 `save()`를 호출해야 하는 이유는?

> **모범 답안:** `validate()`는 입력값의 유효성만 검사하고 오류 메시지를 표시한다. 실제로 입력값을 외부 변수에 저장하는 작업은 각 필드의 `onSaved` 콜백이 담당한다. `save()`를 호출해야 모든 `onSaved`가 실행되어 값이 변수에 저장된다. `validate()` 없이 `save()`를 먼저 호출하면 유효하지 않은 값이 저장될 수 있다.

---

**Q4. [Apply]** 한국 휴대폰 번호(01012345678 형식)를 검증하는 `validator` 함수를 작성하라.

```dart
// 모범 답안
String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return '전화번호를 입력해주세요';
  final digits = value.replaceAll('-', '');
  final regex = RegExp(r'^01[016789]\d{7,8}$');
  if (!regex.hasMatch(digits)) return '올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)';
  return null;
}
```

---

**Q5. [Understand]** `autovalidateMode: AutovalidateMode.onUserInteraction`과 `always`의 차이는?

> **모범 답안:** `onUserInteraction`은 사용자가 해당 필드에 입력을 시작한 이후부터 실시간으로 validator를 실행한다. 아직 입력하지 않은 필드는 오류를 표시하지 않는다. `always`는 화면이 렌더링되는 순간부터 항상 validator를 실행하므로, 아무것도 입력하지 않은 초기 상태에도 "필수 입력" 오류가 즉시 표시된다. 일반적으로 사용자 경험이 좋은 `onUserInteraction`을 사용한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **TextField**는 단독 사용, **TextFormField**는 `Form` 안에서 `validator`·`onSaved`와 함께 사용한다.
- **TextEditingController**는 반드시 `dispose()`에서 해제해야 하며, `addListener`로 실시간 입력값을 구독한다.
- **GlobalKey\<FormState\>**로 `validate()`·`save()`·`reset()`을 외부에서 호출한다. 순서는 반드시 `validate() → save()`다.
- **validator**는 유효하면 `null`, 오류면 오류 메시지 문자열을 반환한다.
- **RegExp**으로 이메일·전화번호·비밀번호 패턴을 검증하며, `^`·`$`로 전체 일치를 강제한다.
- **autovalidateMode.onUserInteraction**으로 입력 시작 후 실시간 검증을 제공한다.
- 크로스 필드 검증(비밀번호 확인)은 `TextEditingController`를 공유해 비교한다.

### 6.2 다음 Step 예고

- **Step 11 — Navigation 시스템:** Navigator·Route·Named Route·Navigation Stack과 Hero 전환 애니메이션으로 화면 간 이동을 구현한다.

### 6.3 참고 자료

| 자료                                | 링크                                                                   | 설명               |
| ----------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| Form 공식 문서                      | <https://api.flutter.dev/flutter/widgets/Form-class.html>                | Form API           |
| TextFormField 공식 문서             | <https://api.flutter.dev/flutter/material/TextFormField-class.html>      | TextFormField API  |
| Flutter Cookbook — Form 유효성 검사 | <https://docs.flutter.dev/cookbook/forms/validation>                     | 공식 Form 가이드   |
| InputDecoration 공식 문서           | <https://api.flutter.dev/flutter/material/InputDecoration-class.html>    | 스타일링 전체 속성 |
| TextInputFormatter                  | <https://api.flutter.dev/flutter/services/TextInputFormatter-class.html> | 입력 포맷터        |

### 6.4 FAQ

**Q. TextField에서 입력 완료 시 값을 가져오는 방법은?**

> `onChanged`로 매 입력마다 값을 받거나, `TextEditingController.text`로 필요한 시점에 직접 읽는다. `onSubmitted`는 키보드의 완료/검색 버튼을 눌렀을 때 호출된다.

**Q. 숫자·영문만 입력받으려면?**

> `inputFormatters: [FilteringTextInputFormatter.digitsOnly]`로 숫자만 허용하거나 `FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]'))`로 영문만 허용한다. `keyboardType`과 함께 사용하면 더 정확하게 제어된다.

**Q. Form 없이 여러 TextField를 검증하려면?**

> 각 `TextEditingController`의 값을 직접 읽어 조건문으로 검증한다. 다만 이 방식은 오류 메시지 표시·일괄 검증·저장 등을 직접 구현해야 해 코드가 복잡해진다. 2개 이상의 입력 필드가 있다면 Form + TextFormField 조합이 훨씬 깔끔하다.

---

## 빠른 자가진단 체크리스트

- [ ] TextField와 TextFormField의 차이를 설명할 수 있는가?
- [ ] GlobalKey\<FormState\>로 validate()·save()·reset()을 호출할 수 있는가?
- [ ] validator 함수가 유효 시 null을 반환해야 하는 규칙을 기억하는가?
- [ ] TextEditingController를 dispose()에서 해제해야 하는 이유를 설명할 수 있는가?
- [ ] 이메일·비밀번호 RegExp 패턴을 직접 작성할 수 있는가?
- [ ] 비밀번호 확인 크로스 필드 검증 구현 방법을 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: validate() 없이 save()를 먼저 호출하면 안 되는 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: TextEditingController dispose() 누락 시 어떤 문제가 발생하는가?
