# Step 27 — AI 통합

> **파트:** 9️⃣ 플랫폼 연동 & AI | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** On-device AI와 서버 AI의 트레이드오프(개인정보·속도·비용·정확도)를 설명할 수 있다.
2. **[Understand]** Flutter ML Kit·TensorFlow Lite·Gemini API 각각의 적합한 사용 시나리오를 설명할 수 있다.
3. **[Apply]** Gemini API로 이미지 분석·텍스트 생성 기능을 Flutter 앱에 구현할 수 있다.
4. **[Apply]** Gemini API의 스트리밍 응답을 StreamBuilder로 실시간 UI에 반영할 수 있다.
5. **[Analyze]** 앱 요구사항에 따라 적합한 AI 통합 방식을 선택하고 근거를 제시할 수 있다.

**전제 지식:** Step 02(Future·Stream), Step 16(FutureBuilder·StreamBuilder), Step 17(HTTP·JSON)

---

## 1. 서론

### 1.1 Flutter 앱에서 AI의 역할

![AI가 모바일 앱을 바꾸는 방식](/developer-open-book/diagrams/flutter-step27-ai-changing-apps.svg)

### 1.2 On-device AI vs 서버 AI

![On-device AI vs Cloud AI 트레이드오프](/developer-open-book/diagrams/flutter-step27-tradeoff.svg)

### 1.3 전체 개념 지도

![Flutter AI 통합 기술 스택](/developer-open-book/diagrams/flutter-step27-flutter-ai-stack.svg)

---

## 2. 기본 개념과 용어

| 용어                             | 정의                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **ML Kit**                       | Google의 모바일 머신러닝 SDK. 텍스트 인식·얼굴 감지·바코드 스캔 등 사전 학습 모델 제공 |
| **TensorFlow Lite (TFLite)**     | TensorFlow 모델을 모바일·임베디드 환경에 최적화한 경량 버전                            |
| **Gemini API**                   | Google의 멀티모달 대형 언어 모델 API. 텍스트·이미지·코드 입출력 지원                   |
| **google_generative_ai**         | Flutter/Dart용 공식 Gemini API 패키지                                                  |
| **GenerativeModel**              | Gemini API에서 AI 모델 인스턴스를 생성하는 클래스                                      |
| **Content**                      | Gemini API에 전달하는 메시지 단위. 텍스트·이미지·역할(user/model)을 포함               |
| **GenerateContentResponse**      | Gemini API의 응답 객체. text 프로퍼티로 텍스트 추출                                    |
| **스트리밍 응답**                | 전체 응답이 완성되기 전에 생성된 토큰을 순차적으로 전달하는 방식                       |
| **멀티모달**                     | 텍스트·이미지·음성 등 여러 형태의 입출력을 동시에 처리하는 AI 능력                     |
| **ChatSession**                  | Gemini API에서 대화 맥락(히스토리)을 유지하는 세션 객체                                |
| **DataPart**                     | 이미지 등 바이너리 데이터를 Gemini API에 전달하는 Content 부분                         |
| **InferenceOptions**             | TFLite 모델 실행 시 스레드 수·GPU 위임 등 실행 옵션                                    |
| **사전 학습 모델 (pre-trained)** | 대량 데이터로 미리 학습된 모델. 직접 학습 없이 사용 가능                               |
| **파인튜닝 (fine-tuning)**       | 기존 사전 학습 모델을 특정 태스크에 맞게 추가 학습시키는 과정                          |

---

## 3. 이론적 배경과 원리 ★

### 3.1 ML Kit: On-device AI 빠른 시작

ML Kit는 Flutter용 `google_mlkit_*` 패키지 시리즈로 제공된다.

```yaml
# pubspec.yaml (필요한 기능만 선택)
dependencies:
  google_mlkit_text_recognition: ^0.13.0 # 텍스트 인식 (OCR)
  google_mlkit_barcode_scanning: ^0.12.0 # 바코드/QR 스캔
  google_mlkit_face_detection: ^0.11.0 # 얼굴 감지
  google_mlkit_image_labeling: ^0.12.0 # 이미지 레이블링
  google_mlkit_translation: ^0.12.0 # 기기 내 번역
```

#### 텍스트 인식 (OCR)

```dart
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';

class OcrService {
  final _recognizer = TextRecognizer(script: TextRecognitionScript.korean);

  Future<String> recognizeText(String imagePath) async {
    final inputImage = InputImage.fromFilePath(imagePath);

    try {
      final recognizedText = await _recognizer.processImage(inputImage);

      // 모든 블록의 텍스트를 줄바꿈으로 합치기
      return recognizedText.blocks
          .map((block) => block.text)
          .join('\n');
    } finally {
      // ✅ 리소스 해제
      await _recognizer.close();
    }
  }
}

// 사용
class OcrScreen extends StatefulWidget { ... }
class _OcrScreenState extends State<OcrScreen> {
  final _picker  = ImagePicker();
  final _service = OcrService();
  String _result = '';

  Future<void> _pickAndRecognize() async {
    final image = await _picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;

    setState(() => _result = '인식 중...');
    final text = await _service.recognizeText(image.path);
    setState(() => _result = text.isEmpty ? '텍스트 없음' : text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('텍스트 인식')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ElevatedButton.icon(
              onPressed: _pickAndRecognize,
              icon: const Icon(Icons.image),
              label: const Text('이미지에서 텍스트 인식'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Text(_result),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### 바코드/QR 스캔

```dart
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';

class BarcodeService {
  final _scanner = BarcodeScanner();

  Future<List<String>> scanBarcodes(String imagePath) async {
    final inputImage = InputImage.fromFilePath(imagePath);
    final barcodes   = await _scanner.processImage(inputImage);
    await _scanner.close();

    return barcodes.map((b) => b.displayValue ?? '').toList();
  }
}
```

---

### 3.2 TensorFlow Lite: 커스텀 모델 실행

```yaml
dependencies:
  tflite_flutter: ^0.10.4
```

```dart
import 'package:tflite_flutter/tflite_flutter.dart';

class ImageClassifier {
  late Interpreter _interpreter;

  Future<void> loadModel() async {
    _interpreter = await Interpreter.fromAsset(
      'assets/models/mobilenet_v1.tflite',
      options: InterpreterOptions()..threads = 4,  // 스레드 수 지정
    );
  }

  Future<List<String>> classify(List<List<List<double>>> input) async {
    // 모델 입출력 형상 확인
    // MobileNet: input [1, 224, 224, 3], output [1, 1001]
    final output = List.filled(1001, 0.0).reshape([1, 1001]);

    _interpreter.run(input, output);

    // 상위 3개 클래스 반환
    final scores = (output[0] as List<double>)
        .asMap()
        .entries
        .sorted((a, b) => b.value.compareTo(a.value))
        .take(3)
        .toList();

    return scores.map((e) => 'Class ${e.key}: ${e.value.toStringAsFixed(3)}').toList();
  }

  void dispose() => _interpreter.close();
}
```

```yaml
# pubspec.yaml: 모델 에셋 등록
flutter:
  assets:
    - assets/models/mobilenet_v1.tflite
    - assets/models/labels.txt
```

---

### 3.3 Gemini API: 서버 AI 통합

#### 설치 및 기본 설정

```yaml
dependencies:
  google_generative_ai: ^0.4.0
```

```dart
// ⚠️ API 키는 코드에 직접 하드코딩하지 않는다
// --dart-define으로 빌드 시 주입
// flutter run --dart-define=GEMINI_API_KEY=your_key_here

const _apiKey = String.fromEnvironment('GEMINI_API_KEY');
```

#### 텍스트 생성

```dart
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  late final GenerativeModel _model;

  GeminiService() {
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',   // 빠른 응답, 저비용
      // model: 'gemini-1.5-pro', // 높은 성능, 복잡한 태스크
      apiKey: _apiKey,
      generationConfig: GenerationConfig(
        temperature:    0.7,   // 창의성 (0=결정적, 1=창의적)
        maxOutputTokens: 1000, // 최대 출력 토큰
        topP: 0.9,
      ),
      safetySettings: [
        SafetySetting(HarmCategory.harassment,   HarmBlockThreshold.medium),
        SafetySetting(HarmCategory.hateSpeech,   HarmBlockThreshold.medium),
        SafetySetting(HarmCategory.dangerousContent, HarmBlockThreshold.medium),
      ],
    );
  }

  /// 단순 텍스트 생성
  Future<String> generateText(String prompt) async {
    final response = await _model.generateContent([
      Content.text(prompt),
    ]);
    return response.text ?? '응답 없음';
  }

  /// 스트리밍 텍스트 생성 (실시간 출력)
  Stream<String> generateTextStream(String prompt) {
    return _model.generateContentStream([
      Content.text(prompt),
    ]).map((response) => response.text ?? '');
  }
}
```

#### 이미지 분석 (멀티모달)

```dart
import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiVisionService {
  final _model = GenerativeModel(
    model: 'gemini-1.5-flash',
    apiKey: _apiKey,
  );

  /// 이미지 설명 생성
  Future<String> describeImage(File imageFile) async {
    final imageBytes = await imageFile.readAsBytes();

    final response = await _model.generateContent([
      Content.multi([
        TextPart('이 이미지를 한국어로 자세히 설명해주세요.'),
        DataPart('image/jpeg', imageBytes),
      ]),
    ]);

    return response.text ?? '이미지 분석 실패';
  }

  /// 이미지 + 질문
  Future<String> askAboutImage(File imageFile, String question) async {
    final imageBytes = await imageFile.readAsBytes();

    final response = await _model.generateContent([
      Content.multi([
        TextPart(question),
        DataPart('image/jpeg', imageBytes),
      ]),
    ]);

    return response.text ?? '응답 없음';
  }

  /// 여러 이미지 비교
  Future<String> compareImages(List<File> imageFiles, String prompt) async {
    final parts = <Part>[TextPart(prompt)];

    for (final file in imageFiles) {
      final bytes = await file.readAsBytes();
      parts.add(DataPart('image/jpeg', bytes));
    }

    final response = await _model.generateContent([Content.multi(parts)]);
    return response.text ?? '분석 실패';
  }
}
```

#### 대화(Chat) 세션 — 맥락 유지

```dart
class GeminiChatService {
  final _model = GenerativeModel(
    model: 'gemini-1.5-flash',
    apiKey: _apiKey,
    systemInstruction: Content.text(
      '당신은 Flutter 개발 전문가 AI 어시스턴트입니다. '
      '친절하고 명확하게 한국어로 답변해주세요.',
    ),
  );

  late final ChatSession _chat;

  GeminiChatService() {
    // 대화 히스토리를 유지하는 세션 생성
    _chat = _model.startChat(history: [
      // 초기 히스토리 (선택적)
      Content.text('안녕하세요!'),
      Content.model([TextPart('안녕하세요! Flutter 개발에 대해 도움이 필요하신가요?')]),
    ]);
  }

  /// 대화 이어가기 (이전 맥락 자동 포함)
  Future<String> sendMessage(String message) async {
    final response = await _chat.sendMessage(Content.text(message));
    return response.text ?? '응답 없음';
  }

  /// 스트리밍 대화
  Stream<String> sendMessageStream(String message) {
    return _chat.sendMessageStream(Content.text(message))
        .map((response) => response.text ?? '');
  }

  /// 대화 히스토리 가져오기
  List<Content> get history => _chat.history.toList();
}
```

---

### 3.4 스트리밍 응답을 StreamBuilder로 표시

ChatGPT/Claude처럼 응답이 실시간으로 타이핑되듯 표시하는 패턴이다.

```dart
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _chatService = GeminiChatService();
  final _controller  = TextEditingController();
  final _messages    = <ChatMessage>[];
  bool _isStreaming   = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isStreaming) return;

    _controller.clear();
    setState(() {
      _messages.add(ChatMessage(role: 'user',  text: text));
      _messages.add(ChatMessage(role: 'model', text: ''));  // 빈 모델 메시지 추가
      _isStreaming = true;
    });

    // 스트리밍 응답 처리
    String accumulated = '';
    await for (final chunk in _chatService.sendMessageStream(text)) {
      if (!mounted) break;
      accumulated += chunk;
      setState(() {
        // 마지막 메시지(모델) 업데이트
        _messages.last = ChatMessage(role: 'model', text: accumulated);
      });
    }

    if (mounted) setState(() => _isStreaming = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gemini Chat')),
      body: Column(
        children: [
          // 메시지 목록
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (_, i) {
                final msg = _messages[i];
                return Align(
                  alignment: msg.role == 'user'
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: msg.role == 'user'
                          ? Theme.of(context).colorScheme.primaryContainer
                          : Theme.of(context).colorScheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: msg.text.isEmpty && _isStreaming
                        ? const SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(msg.text),
                  ),
                );
              },
            ),
          ),
          // 입력 영역
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: '메시지 입력...',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _isStreaming ? null : _sendMessage,
                  icon: _isStreaming
                      ? const SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String role;
  final String text;
  const ChatMessage({required this.role, required this.text});
}
```

---

### 3.5 이미지 설명 생성 앱 (멀티모달)

```dart
class ImageDescriptionScreen extends StatefulWidget {
  const ImageDescriptionScreen({super.key});
  @override
  State<ImageDescriptionScreen> createState() => _ImageDescriptionScreenState();
}

class _ImageDescriptionScreenState extends State<ImageDescriptionScreen> {
  final _visionService = GeminiVisionService();
  final _picker        = ImagePicker();
  File?   _imageFile;
  String  _description = '';
  bool    _loading     = false;

  Future<void> _pickImage() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    setState(() {
      _imageFile   = File(picked.path);
      _description = '';
    });
    await _analyzeImage();
  }

  Future<void> _analyzeImage() async {
    if (_imageFile == null) return;
    setState(() => _loading = true);

    try {
      final desc = await _visionService.describeImage(_imageFile!);
      if (!mounted) return;
      setState(() => _description = desc);
    } catch (e) {
      if (!mounted) return;
      setState(() => _description = '분석 실패: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('이미지 분석')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 이미지 표시
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: _imageFile != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(_imageFile!, fit: BoxFit.cover),
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_photo_alternate, size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('이미지를 선택하세요', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 16),
            // 분석 결과
            Expanded(
              child: _loading
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 12),
                          Text('AI가 이미지를 분석 중입니다...'),
                        ],
                      ),
                    )
                  : _description.isNotEmpty
                      ? SingleChildScrollView(
                          child: Text(_description,
                              style: const TextStyle(fontSize: 15)),
                        )
                      : const Center(
                          child: Text('이미지를 선택하면 AI가 설명을 생성합니다',
                              style: TextStyle(color: Colors.grey)),
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: _imageFile != null
          ? FloatingActionButton.extended(
              onPressed: _pickImage,
              icon: const Icon(Icons.image),
              label: const Text('다른 이미지'),
            )
          : null,
    );
  }
}
```

---

### 3.6 AI 솔루션 선택 기준

| 요구사항           | 권장 솔루션 | 이유                     |
| ------------------ | ----------- | ------------------------ |
| 개인 사진·문서 OCR | ML Kit      | On-device, 개인정보 보호 |
| QR코드·바코드 스캔 | ML Kit      | 빠른 응답, 오프라인      |
| 커스텀 이미지 분류 | TFLite      | 자체 훈련 모델 필요      |
| 챗봇·질문 답변     | Gemini API  | 대형 언어 모델 필요      |
| 이미지 설명 생성   | Gemini API  | 멀티모달 능력 필요       |
| 실시간 얼굴 감지   | ML Kit      | On-device 필수           |
| 코드 생성·리뷰     | Gemini API  | 고성능 모델 필요         |

---

## 4. 사례 연구

### 4.1 ChatGPT-like 앱: 스트리밍 + StreamBuilder

![Gemini 스트리밍 응답 흐름](/developer-open-book/diagrams/flutter-step27-gemini-streaming.svg)

---

### 4.2 영수증 스캔 + AI 분석 앱

```dart
// ML Kit OCR + Gemini 텍스트 분석 조합
class ReceiptAnalyzer {
  final _ocrService    = OcrService();
  final _geminiService = GeminiService();

  Future<ReceiptSummary> analyze(File receiptImage) async {
    // Step 1: ML Kit로 영수증 텍스트 추출 (On-device)
    final rawText = await _ocrService.recognizeText(receiptImage.path);

    // Step 2: Gemini로 구조화된 데이터 추출 (서버)
    final prompt = '''
다음 영수증 텍스트를 분석해서 JSON 형식으로 반환해주세요:
- storeName: 가게 이름
- date: 날짜 (YYYY-MM-DD)
- items: [{name, price}] 목록
- total: 합계

영수증 텍스트:
$rawText

JSON만 반환하세요 (마크다운 없이).
''';

    final jsonText = await _geminiService.generateText(prompt);

    // Step 3: JSON 파싱
    final json = jsonDecode(jsonText);
    return ReceiptSummary.fromJson(json);
  }
}
```

---

### 4.3 API 키 보안 처리

```dart
// ❌ 절대 하지 말 것: 코드에 API 키 하드코딩
const apiKey = 'AIzaSy...'; // 역컴파일로 노출!

// ✅ 방법 1: --dart-define으로 빌드 시 주입
// flutter run --dart-define=GEMINI_API_KEY=your_key
const apiKey = String.fromEnvironment('GEMINI_API_KEY');

// ✅ 방법 2: 서버 프록시 (권장 — 최고 보안)
// 앱 → 우리 서버 → Gemini API
// API 키가 서버에만 존재, 앱에는 없음
class GeminiProxyService {
  final _dio = Dio(BaseOptions(baseUrl: 'https://our-api.example.com'));

  Future<String> generateText(String prompt) async {
    final response = await _dio.post('/ai/generate', data: {'prompt': prompt});
    return response.data['text'] as String;
  }
}

// ✅ 방법 3: Firebase Remote Config로 API 키 관리
// (앱 내 저장보다 안전하지만 방법 2보다는 덜 안전)
```

> ⚠️ **함정 주의:** API 키를 앱 코드에 직접 넣으면 APK/IPA 역컴파일로 노출된다. 프로덕션 앱은 반드시 **서버 프록시** 방식을 사용해야 한다. `--dart-define`은 빌드 바이너리 분석으로 여전히 노출 가능하므로 개발·테스트 환경에서만 사용한다.

---

## 5. 실습

### 5.1 이미지 설명 생성 앱 (Gemini API)

아래 코드를 실행하려면 Gemini API 키가 필요하다. [Google AI Studio](https://aistudio.google.com)에서 무료로 발급받을 수 있다.

```dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:image_picker/image_picker.dart';

// 실행 방법:
// flutter run --dart-define=GEMINI_API_KEY=your_api_key_here

void main() => runApp(const MaterialApp(
  title: 'AI Image Analyzer',
  home: ImageAnalyzerScreen(),
));

class ImageAnalyzerScreen extends StatefulWidget {
  const ImageAnalyzerScreen({super.key});
  @override
  State<ImageAnalyzerScreen> createState() => _ImageAnalyzerScreenState();
}

class _ImageAnalyzerScreenState extends State<ImageAnalyzerScreen> {
  static const _apiKey = String.fromEnvironment('GEMINI_API_KEY');

  final _picker = ImagePicker();
  File?   _image;
  String  _result  = '';
  bool    _loading = false;
  bool    _streaming = false;

  // 분석 프리셋
  static const _prompts = {
    '상세 설명':   '이 이미지를 한국어로 매우 자세히 설명해주세요.',
    '감정 분석':   '이 이미지에서 느껴지는 감정이나 분위기를 분석해주세요.',
    '색상 분석':   '이 이미지의 주요 색상들과 구성을 분석해주세요.',
    '텍스트 추출': '이 이미지에서 보이는 모든 텍스트를 추출해주세요.',
    '상품 정보':   '이것이 상품이라면 이름, 용도, 예상 가격을 추정해주세요.',
  };

  Future<void> _pickImage(ImageSource source) async {
    final picked = await _picker.pickImage(source: source);
    if (picked == null) return;
    setState(() { _image = File(picked.path); _result = ''; });
  }

  Future<void> _analyze(String promptText) async {
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('먼저 이미지를 선택해주세요')),
      );
      return;
    }
    if (_apiKey.isEmpty) {
      setState(() => _result = '⚠️ GEMINI_API_KEY가 설정되지 않았습니다.\n'
          'flutter run --dart-define=GEMINI_API_KEY=your_key 로 실행하세요.');
      return;
    }

    setState(() { _loading = true; _streaming = true; _result = ''; });

    try {
      final model    = GenerativeModel(model: 'gemini-1.5-flash', apiKey: _apiKey);
      final imgBytes = await _image!.readAsBytes();

      // 스트리밍으로 실시간 출력
      await for (final chunk in model.generateContentStream([
        Content.multi([
          TextPart(promptText),
          DataPart('image/jpeg', imgBytes),
        ]),
      ])) {
        if (!mounted) break;
        setState(() => _result += (chunk.text ?? ''));
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _result = '오류: $e');
    } finally {
      if (mounted) setState(() { _loading = false; _streaming = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI 이미지 분석')),
      body: Column(
        children: [
          // 이미지 선택 영역
          GestureDetector(
            onTap: () => _pickImage(ImageSource.gallery),
            child: Container(
              height: 180,
              width: double.infinity,
              margin: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _image != null
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey.shade300,
                  width: _image != null ? 2 : 1,
                ),
              ),
              child: _image != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(_image!, fit: BoxFit.cover),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_photo_alternate,
                            size: 48,
                            color: Theme.of(context).colorScheme.primary),
                        const SizedBox(height: 8),
                        const Text('탭해서 이미지 선택'),
                      ],
                    ),
            ),
          ),

          // 분석 프리셋 버튼
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _prompts.entries.map((entry) =>
                FilledButton.tonal(
                  onPressed: _loading ? null : () => _analyze(entry.value),
                  child: Text(entry.key),
                ),
              ).toList(),
            ),
          ),

          const Divider(height: 24),

          // 결과 영역
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _loading && _result.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 12),
                          Text('AI가 분석 중입니다...'),
                        ],
                      ),
                    )
                  : SingleChildScrollView(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: Text(_result)),
                          if (_streaming)
                            const Padding(
                              padding: EdgeInsets.only(left: 4, top: 2),
                              child: SizedBox(
                                width: 12, height: 12,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                        ],
                      ),
                    ),
            ),
          ),
        ],
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.small(
            heroTag: 'camera',
            onPressed: () => _pickImage(ImageSource.camera),
            child: const Icon(Icons.camera_alt),
          ),
          const SizedBox(width: 8),
          FloatingActionButton.small(
            heroTag: 'gallery',
            onPressed: () => _pickImage(ImageSource.gallery),
            child: const Icon(Icons.photo_library),
          ),
        ],
      ),
    );
  }
}
```

**pubspec.yaml:**

```yaml
dependencies:
  google_generative_ai: ^0.4.0
  image_picker: ^1.0.0
```

**확인 포인트:**

- 이미지 선택 후 분석 버튼 탭 시 스트리밍으로 텍스트가 타이핑되듯 출력되는가?
- API 키 없이 실행 시 적절한 안내 메시지가 표시되는가?
- 네트워크 오류 시 에러 메시지가 표시되는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** On-device AI를 서버 AI보다 선호해야 하는 상황은?

- A) 이미지 캡션 생성처럼 고품질 텍스트가 필요할 때
- B) **사용자 개인 사진에서 텍스트를 읽어야 할 때 (OCR)** ✅
- C) 복잡한 코드 생성이 필요할 때
- D) 대화 맥락을 수천 토큰 이상 유지해야 할 때

---

**Q2. [Understand]** Gemini API 키를 `--dart-define`으로 주입해도 완전히 안전하지 않은 이유와 프로덕션 권장 방식은?

> **모범 답안:** `--dart-define`으로 주입한 값은 컴파일된 Dart 바이너리에 포함되어 역컴파일 도구로 추출할 수 있다. 프로덕션에서는 앱이 직접 Gemini API를 호출하지 않고, 우리 서버에 요청을 보내고 서버가 API 키를 사용해 Gemini API를 호출하는 **서버 프록시 방식**을 사용해야 한다. 이 방식에서는 API 키가 서버에만 존재해 앱 바이너리에 포함되지 않는다.

---

**Q3. [Apply]** Gemini API에서 대화 맥락을 유지하는 방법은?

- A) 매 요청마다 전체 대화 내용을 prompt에 수동으로 포함
- B) `generateContent()`를 반복 호출하면 자동으로 맥락이 유지됨
- C) **`model.startChat()`으로 ChatSession을 생성하고 `sendMessage()`를 사용** ✅
- D) Gemini API는 대화 맥락을 지원하지 않음

---

**Q4. [Analyze]** 영수증 분석 앱을 만들 때 "ML Kit OCR + Gemini 분석" 조합이 "Gemini 이미지 직접 분석"보다 유리한 이유는?

> **모범 답안:** ML Kit OCR은 On-device로 실행되어 개인정보(영수증 내용)가 서버에 전송되지 않고 빠르게 텍스트를 추출한다. 추출된 텍스트만 Gemini API로 보내면 이미지 전체를 전송하는 것보다 데이터 사용량이 적고 응답이 빠르다. 반면 Gemini 이미지 직접 분석은 이미지 전체가 Google 서버로 전송되며 이미지 크기에 따라 비용이 증가한다. 또한 OCR이 이미지 기반 텍스트 추출에 더 정확한 경우가 있다.

---

**Q5. [Understand]** EventChannel의 스트리밍과 Gemini API의 `generateContentStream()`이 공통적으로 해결하는 UX 문제는?

> **모범 답안:** 두 방식 모두 긴 처리 시간 동안 사용자를 **빈 화면이나 로딩 스피너만 보는 대기 상태**에서 벗어나게 한다. EventChannel은 센서 데이터를 실시간으로 표시하고, `generateContentStream()`은 AI 응답이 완성되기 전에 생성된 텍스트를 순차적으로 표시해 사용자가 즉각적인 피드백을 받도록 한다. 이로써 체감 응답 속도가 크게 개선된다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **On-device AI**(ML Kit·TFLite): 개인정보 보호·오프라인 동작·빠른 응답이 필요할 때.
- **서버 AI**(Gemini API): 복잡한 추론·멀티모달·최신 대형 모델 성능이 필요할 때.
- **Gemini API**: `generateContent()`로 단발 요청, `startChat()`·`sendMessage()`로 맥락 유지 대화.
- **스트리밍**: `generateContentStream()`으로 실시간 응답. `await for` 루프로 순차 처리.
- **이미지 분석**: `Content.multi([TextPart(prompt), DataPart('image/jpeg', bytes)])`로 멀티모달 요청.
- **API 키 보안**: 코드 직접 삽입 금지, `--dart-define`은 개발용, 프로덕션은 서버 프록시 사용.

### 6.2 다음 Step 예고

- **Step 28 — 푸시 알림:** Firebase Cloud Messaging(FCM)·Local Notifications로 앱 알림 시스템을 구축하고, 딥링크로 알림 탭 시 특정 화면으로 이동하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                        | 링크                                                     | 설명                       |
| --------------------------- | -------------------------------------------------------- | -------------------------- |
| Gemini API Flutter 가이드   | <https://ai.google.dev/gemini-api/docs/get-started/dart> | 공식 Flutter 시작 가이드   |
| google_generative_ai 패키지 | <https://pub.dev/packages/google_generative_ai>          | pub.dev 패키지             |
| ML Kit Flutter 패키지       | <https://pub.dev/publishers/google.dev/packages>         | ML Kit Flutter 패키지 목록 |
| TFLite Flutter              | <https://pub.dev/packages/tflite_flutter>                | TensorFlow Lite 패키지     |
| Google AI Studio            | <https://aistudio.google.com>                            | API 키 발급 및 모델 테스트 |

### 6.4 FAQ

**Q. Gemini 1.5 Flash와 Gemini 1.5 Pro 중 어느 것을 선택해야 하는가?**

> **Flash**: 빠른 응답 속도, 낮은 비용, 간단한 태스크(요약·번역·짧은 Q&A). 대부분의 앱에 적합하다. **Pro**: 복잡한 추론, 긴 문서 분석, 코드 생성, 높은 정확도가 필요한 태스크. Flash로 시작해 성능이 부족하면 Pro로 전환하는 전략이 권장된다.

**Q. Gemini API 호출 횟수에 제한이 있는가?**

> 무료 티어에서는 분당·일당 요청 수 제한이 있다(2026년 기준: Flash 무료 티어 분당 15회). 프로덕션에서는 유료 플랜으로 전환하거나 서버 사이드에서 요청을 조절하는 레이트 리미팅을 구현해야 한다. 자세한 할당량은 Google AI Studio에서 확인한다.

**Q. ML Kit와 TFLite를 같이 사용할 수 있는가?**

> 그렇다. ML Kit는 Google이 제공하는 사전 학습 모델이고, TFLite는 직접 훈련하거나 외부에서 가져온 커스텀 모델을 실행하는 런타임이다. 예를 들어 ML Kit로 얼굴 감지 후 TFLite 커스텀 모델로 감정을 분류하는 파이프라인을 구성할 수 있다.

---

## 빠른 자가진단 체크리스트

- [ ] On-device AI와 서버 AI의 트레이드오프 4가지를 설명할 수 있는가?
- [ ] ML Kit로 OCR(텍스트 인식)을 구현하는 코드를 작성할 수 있는가?
- [ ] Gemini API로 텍스트 생성·이미지 분석 요청을 보낼 수 있는가?
- [ ] `startChat()`과 `sendMessage()`로 대화 맥락을 유지하는 방법을 설명할 수 있는가?
- [ ] 스트리밍 응답을 `await for`로 처리하는 패턴을 구현할 수 있는가?
- [ ] 요구사항에 따라 ML Kit·TFLite·Gemini API 중 적합한 솔루션을 선택할 수 있는가?
- [ ] ⚠️ 함정 체크: API 키를 코드에 직접 하드코딩하면 역컴파일로 노출된다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: 프로덕션에서는 서버 프록시를 통해 API를 호출해야 한다는 것을 이해했는가?
