# Step 26 — Native 연동 (Platform Channel · EventChannel)

> **파트:** 9️⃣ 플랫폼 연동 & AI | **난이도:** ⭐⭐⭐⭐☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying → Analyzing

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** Flutter의 Platform Channel 아키텍처(MethodChannel·EventChannel·BasicMessageChannel)의 역할과 차이를 설명할 수 있다.
2. **[Understand]** Dart↔Native 데이터 직렬화(Standard Message Codec) 과정을 설명할 수 있다.
3. **[Apply]** MethodChannel로 Android/iOS의 Native API(배터리 레벨 등)를 Flutter에서 호출할 수 있다.
4. **[Apply]** EventChannel로 Native 센서 데이터를 Stream으로 Flutter에 전달할 수 있다.
5. **[Analyze]** 직접 Platform Channel을 구현하는 것과 기존 플러그인을 사용하는 것의 장단점을 분석할 수 있다.

**전제 지식:** Step 01(Flutter 3-Layer 아키텍처·Embedder), Step 02(Future·Stream), Step 17(HTTP 통신)

---

## 1. 서론

### 1.1 왜 Native 연동이 필요한가

Flutter는 자체 렌더링 엔진으로 UI를 그리지만, 하드웨어 기능과 OS API 접근에는 Native 코드가 필요하다.

```
Flutter만으로 불가능한 것들 → Native 연동 필요
──────────────────────────────────────────────────────
  ① 하드웨어 센서
     배터리 레벨, 자이로스코프, 근접 센서

  ② OS 고유 기능
     Android: 백그라운드 서비스, AlarmManager
     iOS: HealthKit, ARKit, CoreMotion

  ③ 기존 Native SDK 통합
     회사 내부 Android/iOS SDK
     특정 하드웨어 제조사 SDK

  ④ 성능 임계 영역
     실시간 오디오 처리, 영상 처리
──────────────────────────────────────────────────────
```

### 1.2 Platform Channel vs 플러그인

```
선택 기준
──────────────────────────────────────────────────────
  pub.dev 플러그인 존재?
    YES → 플러그인 사용 (battery_plus, sensors_plus 등)
          검증된 코드, 크로스 플랫폼, 유지보수 편의

    NO  → 직접 Platform Channel 구현
          회사 내부 SDK, 특수 하드웨어, 최신 OS API

  직접 구현 필요 시:
    → 이 Step의 내용 적용
──────────────────────────────────────────────────────
```

### 1.3 전체 개념 지도

```
Platform Channel 아키텍처
    │
    ├── MethodChannel      ← 단방향 요청-응답 (Dart → Native → 결과 반환)
    │     사용: 배터리 레벨, 파일 열기, 생체인증 등 일회성 호출
    │
    ├── EventChannel       ← 지속 스트림 (Native → Dart, 연속 데이터)
    │     사용: 센서 데이터, 위치 업데이트, 가속도계
    │
    └── BasicMessageChannel ← 양방향 메시지 (Dart ↔ Native)
          사용: 커스텀 코덱, 단순 문자열 교환
```

---

## 2. 기본 개념과 용어

| 용어                                   | 정의                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| **Platform Channel**                   | Flutter Dart 코드와 Android(Kotlin/Java)·iOS(Swift/Obj-C) Native 코드 간 통신 메커니즘 |
| **MethodChannel**                      | Dart에서 Native 메서드를 호출하고 결과를 받는 채널. 요청-응답(Request-Response) 방식   |
| **EventChannel**                       | Native에서 Dart로 연속 데이터를 Stream으로 전달하는 채널                               |
| **BasicMessageChannel**                | 커스텀 코덱을 사용하는 양방향 메시지 채널                                              |
| **channel name**                       | 채널을 식별하는 고유 문자열. `com.example.app/battery`처럼 역DNS 표기 사용             |
| **MessageCodec**                       | Dart↔Native 데이터 직렬화 방식. StandardMessageCodec이 기본                            |
| **StandardMessageCodec**               | Dart의 기본 타입(bool·int·double·String·List·Map·null)을 Native와 변환                 |
| **FlutterMethodChannel**               | iOS Swift에서 MethodChannel을 구현하는 클래스                                          |
| **MethodChannel.setMethodCallHandler** | Android/iOS에서 Dart의 메서드 호출을 처리하는 핸들러 등록                              |
| **invokeMethod**                       | Dart에서 Native 메서드를 호출하는 MethodChannel 메서드                                 |
| **StreamHandler**                      | EventChannel에서 스트림 구독·해제를 처리하는 Android 인터페이스                        |
| **FlutterEventSink**                   | Android에서 EventChannel을 통해 Dart에 데이터를 전송하는 객체                          |
| **PlatformException**                  | Native 코드 실행 중 발생한 예외를 Dart로 전달하는 예외 클래스                          |
| **역DNS 표기**                         | `com.companyname.appname/channelname` 형태의 채널 이름 관례. 충돌 방지                 |

---

## 3. 이론적 배경과 원리 ★

### 3.1 Platform Channel 통신 흐름

```
MethodChannel 통신 흐름 (배터리 레벨 조회 예시)
──────────────────────────────────────────────────────
  Flutter (Dart)
    MethodChannel('com.example/battery')
      .invokeMethod('getBatteryLevel')
          │
          │ (직렬화: MessageCodec)
          ▼
  Platform Runner Thread (UI Thread)
    Android: FlutterPlugin → MethodCallHandler
    iOS:     FlutterAppDelegate → FlutterMethodChannel
          │
          │ (Native API 호출)
          ▼
  OS API
    Android: BatteryManager.getIntProperty()
    iOS:     UIDevice.current.batteryLevel
          │
          │ (역직렬화 후 result.success() 호출)
          ▼
  Flutter (Dart)
    invokeMethod 결과 반환 (Future<T> 완료)
──────────────────────────────────────────────────────

주의: 모든 채널 통신은 메인(UI) 스레드에서 처리
      → Native에서 무거운 작업은 백그라운드 스레드로 분리 필요
```

### 3.2 지원하는 데이터 타입 (StandardMessageCodec)

```
Dart           ↔    Android (Kotlin)   ↔    iOS (Swift)
──────────────────────────────────────────────────────
null           ↔    null               ↔    nil
bool           ↔    Boolean            ↔    Bool / NSNumber
int            ↔    Int / Long         ↔    Int / NSNumber
double         ↔    Double             ↔    Double / NSNumber
String         ↔    String             ↔    String
Uint8List      ↔    ByteArray          ↔    FlutterStandardTypedData
List           ↔    List               ↔    Array
Map            ↔    HashMap            ↔    Dictionary

⚠️ 지원하지 않는 타입은 직접 변환 필요
   DateTime → int (millisecondsSinceEpoch)
   Enum → String
   커스텀 객체 → Map<String, dynamic>
```

---

### 3.3 MethodChannel 완전 구현

#### Dart 측 (공통)

```dart
// lib/services/battery_service.dart
import 'package:flutter/services.dart';

class BatteryService {
  // 채널 이름: 역DNS + 기능명 (Android·iOS 동일하게 사용)
  static const _channel = MethodChannel('com.example.app/battery');

  /// 배터리 레벨 조회 (0~100)
  Future<int> getBatteryLevel() async {
    try {
      final level = await _channel.invokeMethod<int>('getBatteryLevel');
      return level ?? -1;
    } on PlatformException catch (e) {
      // Native에서 예외 발생 시
      throw Exception('배터리 레벨 조회 실패: ${e.message}');
    } on MissingPluginException {
      // 채널이 등록되지 않은 경우 (플랫폼 미지원 등)
      throw Exception('이 플랫폼에서는 지원하지 않습니다');
    }
  }

  /// 배터리 충전 상태 조회
  Future<String> getChargingStatus() async {
    try {
      final status = await _channel.invokeMethod<String>('getChargingStatus');
      return status ?? 'unknown';
    } on PlatformException catch (e) {
      throw Exception(e.message);
    }
  }

  /// 데이터 전달 예시 (인수 포함)
  Future<String> formatBattery({required int level, required String unit}) async {
    try {
      final result = await _channel.invokeMethod<String>('formatBattery', {
        'level': level,
        'unit': unit,
      });
      return result ?? '';
    } on PlatformException catch (e) {
      throw Exception(e.message);
    }
  }
}
```

#### Android 측 (Kotlin)

```kotlin
// android/app/src/main/kotlin/com/example/app/MainActivity.kt
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.app/battery"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getBatteryLevel" -> {
                        val batteryLevel = getBatteryLevel()
                        if (batteryLevel != -1) {
                            result.success(batteryLevel)
                        } else {
                            result.error(
                                "UNAVAILABLE",
                                "배터리 레벨을 가져올 수 없습니다",
                                null
                            )
                        }
                    }
                    "getChargingStatus" -> {
                        result.success(getChargingStatus())
                    }
                    "formatBattery" -> {
                        val level = call.argument<Int>("level") ?: 0
                        val unit  = call.argument<String>("unit") ?: "%"
                        result.success("$level$unit")
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun getBatteryLevel(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        } else {
            val intent = ContextWrapper(applicationContext)
                .registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            intent?.let {
                val level = it.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = it.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                (level.toFloat() / scale * 100).toInt()
            } ?: -1
        }
    }

    private fun getChargingStatus(): String {
        val intent = ContextWrapper(applicationContext)
            .registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        return when (intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1)) {
            BatteryManager.BATTERY_STATUS_CHARGING  -> "charging"
            BatteryManager.BATTERY_STATUS_FULL      -> "full"
            BatteryManager.BATTERY_STATUS_DISCHARGING -> "discharging"
            else -> "unknown"
        }
    }
}
```

#### iOS 측 (Swift)

```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let batteryChannel = FlutterMethodChannel(
            name: "com.example.app/battery",
            binaryMessenger: controller.binaryMessenger
        )

        batteryChannel.setMethodCallHandler { [weak self] (call, result) in
            switch call.method {
            case "getBatteryLevel":
                self?.receiveBatteryLevel(result: result)
            case "getChargingStatus":
                result(self?.getChargingStatus())
            case "formatBattery":
                guard let args = call.arguments as? [String: Any],
                      let level = args["level"] as? Int,
                      let unit  = args["unit"]  as? String else {
                    result(FlutterError(code: "INVALID_ARGS",
                                        message: "잘못된 인수",
                                        details: nil))
                    return
                }
                result("\(level)\(unit)")
            default:
                result(FlutterMethodNotImplemented)
            }
        }

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application,
                                 didFinishLaunchingWithOptions: launchOptions)
    }

    private func receiveBatteryLevel(result: FlutterResult) {
        let device = UIDevice.current
        device.isBatteryMonitoringEnabled = true

        guard device.batteryState != .unknown else {
            result(FlutterError(code: "UNAVAILABLE",
                                message: "배터리 레벨을 가져올 수 없습니다",
                                details: nil))
            return
        }
        result(Int(device.batteryLevel * 100))
    }

    private func getChargingStatus() -> String {
        switch UIDevice.current.batteryState {
        case .charging:    return "charging"
        case .full:        return "full"
        case .unplugged:   return "discharging"
        default:           return "unknown"
        }
    }
}
```

---

### 3.4 EventChannel: 연속 스트림 데이터 전달

EventChannel은 Native → Dart 방향으로 **지속적인 데이터 스트림**을 전달한다.

#### Dart 측

```dart
// lib/services/accelerometer_service.dart
import 'package:flutter/services.dart';

class AccelerometerService {
  static const _channel = EventChannel('com.example.app/accelerometer');

  /// 가속도 센서 데이터 Stream
  Stream<Map<String, double>> get accelerometerStream {
    return _channel.receiveBroadcastStream().map((event) {
      final data = event as Map;
      return {
        'x': (data['x'] as num).toDouble(),
        'y': (data['y'] as num).toDouble(),
        'z': (data['z'] as num).toDouble(),
      };
    });
  }
}

// 사용
class AccelerometerWidget extends StatelessWidget {
  const AccelerometerWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Map<String, double>>(
      stream: AccelerometerService().accelerometerStream,
      builder: (context, snapshot) {
        if (snapshot.hasError) return Text('오류: ${snapshot.error}');
        if (!snapshot.hasData) return const CircularProgressIndicator();
        final data = snapshot.data!;
        return Text(
          'X: ${data['x']!.toStringAsFixed(2)}\n'
          'Y: ${data['y']!.toStringAsFixed(2)}\n'
          'Z: ${data['z']!.toStringAsFixed(2)}',
        );
      },
    );
  }
}
```

#### Android 측 (Kotlin)

```kotlin
// EventChannel 구현 (MainActivity.kt에 추가)
import io.flutter.plugin.common.EventChannel

class MainActivity : FlutterActivity() {
    private val ACCELEROMETER_CHANNEL = "com.example.app/accelerometer"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // EventChannel 등록
        EventChannel(flutterEngine.dartExecutor.binaryMessenger, ACCELEROMETER_CHANNEL)
            .setStreamHandler(object : EventChannel.StreamHandler {
                private var sensorManager: SensorManager? = null
                private var eventSink: EventChannel.EventSink? = null
                private var sensorListener: SensorEventListener? = null

                override fun onListen(arguments: Any?, events: EventChannel.EventSink) {
                    eventSink = events
                    sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
                    val sensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

                    sensorListener = object : SensorEventListener {
                        override fun onSensorChanged(event: SensorEvent) {
                            val data = mapOf(
                                "x" to event.values[0].toDouble(),
                                "y" to event.values[1].toDouble(),
                                "z" to event.values[2].toDouble(),
                            )
                            events.success(data)  // Dart로 데이터 전송
                        }

                        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
                    }

                    sensorManager?.registerListener(
                        sensorListener,
                        sensor,
                        SensorManager.SENSOR_DELAY_NORMAL
                    )
                }

                override fun onCancel(arguments: Any?) {
                    // Dart에서 구독 해제 시 호출
                    sensorManager?.unregisterListener(sensorListener)
                    sensorListener = null
                    eventSink = null
                }
            })
    }
}
```

#### iOS 측 (Swift)

```swift
// AppDelegate.swift에 EventChannel 추가
import CoreMotion

class AppDelegate: FlutterAppDelegate {
    let motionManager = CMMotionManager()

    override func application(...) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController

        FlutterEventChannel(
            name: "com.example.app/accelerometer",
            binaryMessenger: controller.binaryMessenger
        ).setStreamHandler(AccelerometerStreamHandler(motionManager: motionManager))

        // ...
    }
}

class AccelerometerStreamHandler: NSObject, FlutterStreamHandler {
    let motionManager: CMMotionManager

    init(motionManager: CMMotionManager) {
        self.motionManager = motionManager
    }

    func onListen(withArguments arguments: Any?,
                  eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        guard motionManager.isAccelerometerAvailable else {
            return FlutterError(code: "UNAVAILABLE",
                                message: "가속도 센서 없음", details: nil)
        }
        motionManager.accelerometerUpdateInterval = 0.1
        motionManager.startAccelerometerUpdates(to: .main) { data, error in
            guard let data = data else { return }
            events([
                "x": data.acceleration.x,
                "y": data.acceleration.y,
                "z": data.acceleration.z,
            ])
        }
        return nil
    }

    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        motionManager.stopAccelerometerUpdates()
        return nil
    }
}
```

---

### 3.5 에러 처리 패턴

```dart
// Dart에서 PlatformException 처리
Future<void> _checkBattery() async {
  try {
    final level = await _channel.invokeMethod<int>('getBatteryLevel');
    setState(() => _level = level ?? 0);
  } on PlatformException catch (e) {
    // code: Native에서 정의한 에러 코드 (예: "UNAVAILABLE")
    // message: 사람이 읽을 수 있는 에러 메시지
    // details: 추가 디버깅 정보 (nullable)
    debugPrint('에러 코드: ${e.code}');
    debugPrint('에러 메시지: ${e.message}');
    setState(() => _errorMessage = e.message ?? '알 수 없는 오류');
  } on MissingPluginException {
    // 채널이 Native에 등록되지 않은 경우
    setState(() => _errorMessage = '플랫폼 미지원');
  }
}

// Native (Kotlin)에서 에러 반환
result.error(
  "PERMISSION_DENIED",                    // code
  "배터리 권한이 거부되었습니다",          // message
  "android.permission.BATTERY_STATS"     // details (optional)
)
```

---

### 3.6 플러그인 구조로 분리 (실무 권장)

실무에서는 채널 코드를 별도 플러그인 패키지로 분리한다.

```
my_app/
├── lib/
│   └── main.dart
│
└── packages/
    └── battery_channel/      ← 채널 플러그인 패키지
          ├── lib/
          │     └── battery_channel.dart  (Dart API)
          ├── android/
          │     └── src/.../BatteryPlugin.kt
          ├── ios/
          │     └── Classes/BatteryPlugin.swift
          └── pubspec.yaml
```

```yaml
# my_app/pubspec.yaml
dependencies:
  battery_channel:
    path: packages/battery_channel
```

---

## 4. 사례 연구

### 4.1 생체인증 (Biometric) MethodChannel 패턴

```dart
// 실무에서 자주 쓰이는 생체인증 채널 (local_auth 플러그인의 내부 구조)
class BiometricService {
  static const _channel = MethodChannel('com.example.app/biometric');

  Future<bool> authenticate({required String reason}) async {
    try {
      final result = await _channel.invokeMethod<bool>('authenticate', {
        'reason': reason,
        'useErrorDialogs': true,
        'stickyAuth': true,
      });
      return result ?? false;
    } on PlatformException catch (e) {
      switch (e.code) {
        case 'NotAvailable':
          throw BiometricNotAvailableException();
        case 'NotEnrolled':
          throw BiometricNotEnrolledException();
        case 'LockedOut':
          throw BiometricLockedException();
        default:
          throw BiometricException(e.message ?? '인증 실패');
      }
    }
  }
}

// 사용
Future<void> _login() async {
  try {
    final authenticated = await BiometricService().authenticate(
      reason: '앱에 로그인하려면 인증이 필요합니다',
    );
    if (authenticated) _navigateToHome();
  } on BiometricNotEnrolledException {
    _showDialog('생체인증을 먼저 등록해주세요');
  } on BiometricException catch (e) {
    _showDialog(e.message);
  }
}
```

---

### 4.2 위치 업데이트 EventChannel 패턴

```dart
// 위치 서비스 (실시간 업데이트)
class LocationService {
  static const _channel = EventChannel('com.example.app/location');

  Stream<Location> get locationStream {
    return _channel.receiveBroadcastStream({
      'accuracy': 'high',
      'distanceFilter': 10,   // 10m 이동마다 업데이트
    }).map((event) {
      final data = event as Map;
      return Location(
        latitude:  (data['latitude']  as num).toDouble(),
        longitude: (data['longitude'] as num).toDouble(),
        accuracy:  (data['accuracy']  as num).toDouble(),
      );
    });
  }
}

// Riverpod Provider로 래핑
final locationProvider = StreamProvider<Location>((ref) {
  return LocationService().locationStream;
});

// UI에서 사용
class MapScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locationAsync = ref.watch(locationProvider);
    return locationAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error:   (e, _) => Center(child: Text('위치 오류: $e')),
      data:    (location) => MapView(
        center: LatLng(location.latitude, location.longitude),
      ),
    );
  }
}
```

---

### 4.3 배경 서비스 (Android WorkManager) 연동

```dart
// 복잡한 Native 기능 → MethodChannel으로 추상화
class WorkManagerService {
  static const _channel = MethodChannel('com.example.app/workmanager');

  Future<void> scheduleDataSync({required Duration interval}) async {
    await _channel.invokeMethod('schedulePeriodicWork', {
      'tag': 'data_sync',
      'intervalMinutes': interval.inMinutes,
      'requiresNetwork': true,
    });
  }

  Future<void> cancelWork(String tag) async {
    await _channel.invokeMethod('cancelWork', {'tag': tag});
  }
}
```

---

## 5. 실습

### 5.1 배터리 정보 앱 구현

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() => runApp(const MaterialApp(
  title: 'Battery Info',
  home: BatteryScreen(),
));

class BatteryScreen extends StatefulWidget {
  const BatteryScreen({super.key});
  @override
  State<BatteryScreen> createState() => _BatteryScreenState();
}

class _BatteryScreenState extends State<BatteryScreen> {
  static const _channel = MethodChannel('com.example.app/battery');

  int?    _batteryLevel;
  String  _status       = '알 수 없음';
  String? _errorMessage;
  bool    _loading      = false;

  Future<void> _getBatteryInfo() async {
    setState(() { _loading = true; _errorMessage = null; });

    try {
      final level  = await _channel.invokeMethod<int>('getBatteryLevel');
      final status = await _channel.invokeMethod<String>('getChargingStatus');
      setState(() {
        _batteryLevel = level;
        _status       = _localizeStatus(status ?? 'unknown');
      });
    } on PlatformException catch (e) {
      setState(() => _errorMessage = e.message);
    } on MissingPluginException {
      setState(() => _errorMessage = '이 플랫폼에서 지원하지 않습니다');
    } finally {
      setState(() => _loading = false);
    }
  }

  String _localizeStatus(String status) => switch (status) {
    'charging'    => '충전 중',
    'full'        => '완충',
    'discharging' => '방전 중',
    _             => '알 수 없음',
  };

  Color _batteryColor() {
    final level = _batteryLevel ?? 100;
    if (level > 50) return Colors.green;
    if (level > 20) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('배터리 정보')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_batteryLevel != null) ...[
              Icon(
                Icons.battery_full,
                size: 100,
                color: _batteryColor(),
              ),
              const SizedBox(height: 16),
              Text(
                '$_batteryLevel%',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: _batteryColor(),
                ),
              ),
              const SizedBox(height: 8),
              Text(_status, style: const TextStyle(fontSize: 20)),
            ] else if (_errorMessage != null)
              Text('오류: $_errorMessage', style: const TextStyle(color: Colors.red))
            else
              const Text('배터리 정보 버튼을 눌러주세요'),
            const SizedBox(height: 32),
            if (_loading)
              const CircularProgressIndicator()
            else
              FilledButton.icon(
                onPressed: _getBatteryInfo,
                icon: const Icon(Icons.refresh),
                label: const Text('배터리 정보 가져오기'),
              ),
          ],
        ),
      ),
    );
  }
}
```

**Native 구현이 필요한 경우:**
실제 기기에서 테스트하려면 위의 Android (Kotlin) · iOS (Swift) 코드를 각 플랫폼 프로젝트에 추가한다. 에뮬레이터에서는 배터리 레벨이 항상 100%로 반환될 수 있다.

**웹·데스크톱 환경에서 테스트:**

```dart
// 플랫폼별 분기 처리
Future<int> getBatteryLevel() async {
  if (kIsWeb) return 85;  // 웹은 지원 안 함 → Mock 반환
  try {
    return await _channel.invokeMethod<int>('getBatteryLevel') ?? -1;
  } on MissingPluginException {
    return -1;  // 데스크톱은 채널 없음
  }
}
```

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** MethodChannel과 EventChannel의 핵심 차이는?

- A) MethodChannel은 Android 전용, EventChannel은 iOS 전용
- B) **MethodChannel은 요청-응답(일회성), EventChannel은 지속 스트림(연속 데이터)** ✅
- C) MethodChannel은 Dart → Native, EventChannel은 Dart ↔ Native 양방향
- D) 기능은 같고 이름만 다르다

---

**Q2. [Understand]** Platform Channel 통신에서 `DateTime`을 직접 전달할 수 없는 이유와 해결책은?

> **모범 답안:** StandardMessageCodec이 지원하는 기본 타입에 `DateTime`이 포함되지 않기 때문이다. Dart의 `DateTime`은 Android의 `Date`·iOS의 `Date`와 직접 변환할 수 없다. 해결책은 `millisecondsSinceEpoch`(int)로 변환해 전달하고, Native에서 받아 해당 플랫폼의 날짜 타입으로 변환하는 것이다.

---

**Q3. [Understand]** EventChannel에서 `onCancel()`이 중요한 이유는?

> **모범 답안:** `onCancel()`은 Dart에서 Stream 구독을 해제했을 때 Native에서 호출되는 콜백이다. 이 시점에 센서 리스너 등 Native 리소스를 해제해야 한다. `onCancel()`을 구현하지 않으면, Dart에서 구독을 해제해도 Android의 `SensorEventListener`나 iOS의 `CMMotionManager` 업데이트가 계속 실행되어 배터리·CPU 낭비가 발생한다.

---

**Q4. [Apply]** 채널 이름을 `'battery'`처럼 단순하게 쓰지 않고 `'com.example.app/battery'`처럼 역DNS 표기를 사용하는 이유는?

> **모범 답안:** 채널 이름은 앱 전체에서 고유해야 한다. 단순한 이름('battery')은 다른 플러그인이나 라이브러리와 충돌할 수 있다. 역DNS 표기(`com.companyname.appname/channelname`)는 도메인 이름처럼 고유성을 보장하는 관례다. 예를 들어 `battery_plus` 플러그인이 이미 `'plugins.flutter.io/battery_plus'`를 사용하는데 같은 이름을 쓰면 충돌이 발생한다.

---

**Q5. [Analyze]** 직접 Platform Channel을 구현하는 것보다 pub.dev 플러그인을 사용해야 하는 상황은?

> **모범 답안:** ① **크로스 플랫폼 지원이 필요할 때** — 플러그인은 Android·iOS·Web·Desktop을 모두 지원하는 경우가 많다. 직접 구현하면 각 플랫폼마다 별도 코드가 필요하다. ② **검증된 구현이 필요할 때** — `battery_plus`, `sensors_plus` 같은 인기 플러그인은 수천 개 프로젝트에서 검증되었고 엣지 케이스가 처리되어 있다. 직접 구현은 권한 처리·OS 버전 분기 등 예상치 못한 케이스를 놓칠 수 있다. 반면 회사 내부 SDK나 pub.dev에 없는 특수 기능은 직접 Channel을 구현해야 한다.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **Platform Channel**은 Flutter Dart 코드와 Android/iOS Native 코드 간 통신 브리지다.
- **MethodChannel**: 일회성 요청-응답. `invokeMethod()`로 호출, `setMethodCallHandler()`로 처리.
- **EventChannel**: 연속 스트림. `receiveBroadcastStream()`으로 구독, `onCancel()`에서 반드시 Native 리소스 해제.
- **채널 이름**: 역DNS 표기(`com.company.app/feature`)로 충돌 방지.
- **StandardMessageCodec**: bool·int·double·String·List·Map만 지원. DateTime은 int(ms)로 변환.
- **에러 처리**: `PlatformException`(Native 오류)·`MissingPluginException`(채널 미등록)을 모두 처리.
- **실무**: pub.dev 플러그인이 있으면 사용, 없거나 내부 SDK 연동 시 직접 구현.

### 6.2 다음 Step 예고

- **Step 27 — AI 통합:** Flutter ML Kit·TensorFlow Lite·Gemini API로 on-device AI와 서버 AI를 Flutter 앱에 통합하는 방법을 학습한다.

### 6.3 참고 자료

| 자료                        | 링크                                                                | 설명                    |
| --------------------------- | ------------------------------------------------------------------- | ----------------------- |
| Platform Channels 공식 문서 | <https://docs.flutter.dev/platform-integration/platform-channels>   | 전체 가이드             |
| MethodChannel API           | <https://api.flutter.dev/flutter/services/MethodChannel-class.html> | API 레퍼런스            |
| EventChannel API            | <https://api.flutter.dev/flutter/services/EventChannel-class.html>  | API 레퍼런스            |
| Flutter 플러그인 개발       | <https://docs.flutter.dev/packages-and-plugins/developing-packages> | 플러그인 패키지 개발    |
| battery_plus 플러그인 소스  | <https://github.com/fluttercommunity/plus_plugins>                  | 실제 플러그인 구현 참고 |

### 6.4 FAQ

**Q. Platform Channel 호출은 Main Thread에서만 가능한가?**

> Dart 측에서는 async/await로 어느 곳에서나 호출할 수 있다. 단, Native 측(Android·iOS) 핸들러는 메인(UI) 스레드에서 실행된다. Native에서 무거운 작업이 필요하면 백그라운드 스레드로 분리한 뒤 결과를 메인 스레드에서 `result.success()`로 반환해야 한다.

**Q. Web에서 Platform Channel을 사용할 수 있는가?**

> 기본 MethodChannel은 Web에서 동작하지 않는다. Web에서는 `dart:html`이나 JavaScript interop(`package:js`)을 직접 사용해야 한다. 크로스 플랫폼을 고려하면 `kIsWeb`으로 분기하거나, Web 전용 구현을 별도로 제공하는 플러그인을 사용한다.

**Q. Flutter에서 Native 코드를 완전히 피할 수 있는가?**

> 대부분의 기능은 pub.dev 플러그인으로 해결할 수 있어 Native 코드를 직접 작성하지 않아도 된다. 그러나 회사 내부 SDK·특수 하드웨어·최신 OS API(출시 직후)는 직접 Platform Channel을 구현해야 한다. Flutter는 이런 경우를 위해 Channel 메커니즘을 열어두고 있다.

---

## 빠른 자가진단 체크리스트

- [ ] MethodChannel과 EventChannel의 차이를 설명할 수 있는가?
- [ ] StandardMessageCodec이 지원하는 타입 목록을 말할 수 있는가?
- [ ] 채널 이름에 역DNS 표기를 사용하는 이유를 설명할 수 있는가?
- [ ] Dart에서 PlatformException과 MissingPluginException을 구분해 처리할 수 있는가?
- [ ] EventChannel의 onCancel()에서 반드시 리소스를 해제해야 하는 이유를 설명할 수 있는가?
- [ ] pub.dev 플러그인과 직접 Channel 구현 중 어느 것을 선택할지 판단할 수 있는가?
- [ ] ⚠️ 함정 체크: DateTime을 Platform Channel로 직접 전달하면 안 되며 int(ms)로 변환해야 한다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: EventChannel onCancel() 미구현 시 Native 리소스가 계속 실행되어 배터리·CPU 낭비가 발생한다는 것을 이해했는가?
