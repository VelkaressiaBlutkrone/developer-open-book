# Step 28 — 푸시 알림

> **파트:** 9️⃣ 플랫폼 연동 & AI | **난이도:** ⭐⭐⭐☆☆ | **예상 학습 시간:** 120분
> 이론 75% + 실습 25% | Bloom 단계: Understanding → Applying

---

## 학습 목표

이 문서를 읽고 나면 학습자는…

1. **[Understand]** FCM 아키텍처(서버→FCM→기기)와 알림 유형(Notification·Data Message)의 차이를 설명할 수 있다.
2. **[Understand]** 포그라운드·백그라운드·종료 상태에서 알림 처리 방식이 다른 이유를 설명할 수 있다.
3. **[Understand]** 딥링크가 알림과 결합해 특정 화면으로 이동하는 원리를 설명할 수 있다.
4. **[Apply]** FCM 토큰을 발급받고 테스트 알림을 전송할 수 있다.
5. **[Apply]** Local Notifications로 앱 내 스케줄 알림을 구현할 수 있다.
6. **[Apply]** 알림 탭 시 특정 화면으로 이동하는 딥링크를 구현할 수 있다.

**전제 지식:** Step 02(async/await·Stream), Step 05(Lifecycle), Step 11(Navigation)

---

## 1. 서론

### 1.1 푸시 알림의 두 가지 종류

![푸시 알림 종류](/developer-open-book/diagrams/flutter-step28-notification-types.svg)

### 1.2 앱 상태별 알림 처리

![3가지 앱 상태와 알림 처리](/developer-open-book/diagrams/flutter-step28-app-states.svg)

### 1.3 전체 개념 지도

![Flutter 푸시 알림 기술 스택](/developer-open-book/diagrams/flutter-step28-flutter-push-stack.svg)

---

## 2. 기본 개념과 용어

| 용어                       | 정의                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| **FCM**                    | Firebase Cloud Messaging. Google의 크로스 플랫폼 메시지 전송 서비스             |
| **FCM 토큰**               | 특정 기기·앱 인스턴스를 식별하는 고유 문자열. 서버가 알림을 보낼 목적지         |
| **Notification Message**   | OS가 자동으로 알림 트레이에 표시하는 메시지. 백그라운드/종료 상태에서 자동 처리 |
| **Data Message**           | OS가 자동 표시하지 않는 백그라운드 데이터 메시지. 앱이 직접 처리                |
| **포그라운드(Foreground)** | 앱이 화면에 표시되어 사용자와 상호작용 중인 상태                                |
| **백그라운드(Background)** | 앱이 실행 중이나 화면에 보이지 않는 상태 (홈 화면, 다른 앱 사용 중)             |
| **종료 상태(Terminated)**  | 앱 프로세스가 완전히 종료된 상태                                                |
| **onMessage**              | 포그라운드 상태에서 FCM 메시지 수신 시 호출되는 핸들러                          |
| **onBackgroundMessage**    | 백그라운드/종료 상태에서 FCM 데이터 메시지 수신 시 호출되는 최상위 함수         |
| **getInitialMessage()**    | 종료 상태에서 알림 탭으로 앱이 시작된 경우 초기 메시지를 가져오는 메서드        |
| **onMessageOpenedApp**     | 백그라운드 상태의 앱이 알림 탭으로 포그라운드로 전환될 때 호출되는 Stream       |
| **Local Notification**     | 서버 없이 기기 자체에서 예약·발송하는 알림                                      |
| **딥링크(Deep Link)**      | 알림이나 외부 URL을 통해 앱의 특정 화면으로 직접 이동하는 기능                  |
| **APNs**                   | Apple Push Notification service. iOS 푸시 알림의 Apple 측 인프라                |

---

## 3. 이론적 배경과 원리 ★

### 3.1 FCM 아키텍처

![FCM 메시지 전송 흐름](/developer-open-book/diagrams/flutter-step28-fcm-flow.svg)

### 3.2 FCM 설치 및 기본 설정

```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^17.0.0
```

```dart
// ── android/app/build.gradle ──────────────────────
// minSdkVersion 21 이상 필요

// ── AndroidManifest.xml ────────────────────────────
// <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
// <uses-permission android:name="android.permission.VIBRATE"/>
// <uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
```

### 3.3 FCM 초기화 및 토큰 관리

```dart
// lib/services/notification_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// ✅ 백그라운드 핸들러: 반드시 최상위 함수 (클래스 메서드 X)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('백그라운드 메시지: ${message.messageId}');
  // 데이터 메시지 처리 (필요 시)
}

class NotificationService {
  static final _messaging = FirebaseMessaging.instance;
  static final _localNotifications = FlutterLocalNotificationsPlugin();

  // Android 알림 채널 (Android 8.0+)
  static const _androidChannel = AndroidNotificationChannel(
    'high_importance_channel',         // ID
    '중요 알림',                        // 이름
    description: '중요한 앱 알림',
    importance: Importance.high,
    playSound: true,
  );

  static Future<void> initialize() async {
    // 1. 백그라운드 핸들러 등록
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 2. Android 알림 채널 생성
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // 3. Local Notifications 초기화
    const initSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(
        requestAlertPermission:  false,  // 나중에 명시적으로 요청
        requestBadgePermission:  false,
        requestSoundPermission:  false,
      ),
    );
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // 4. 알림 권한 요청
    await _requestPermission();

    // 5. FCM 토큰 가져오기
    await _getToken();

    // 6. 포그라운드 알림 설정 (iOS)
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true, badge: true, sound: true,
    );
  }

  static Future<void> _requestPermission() async {
    final settings = await _messaging.requestPermission(
      alert:         true,
      announcement:  false,
      badge:         true,
      carPlay:       false,
      criticalAlert: false,
      provisional:   false,
      sound:         true,
    );
    debugPrint('알림 권한: ${settings.authorizationStatus}');
  }

  static Future<String?> _getToken() async {
    final token = await _messaging.getToken();
    debugPrint('FCM Token: $token');
    // TODO: 서버에 토큰 저장
    return token;
  }

  // 토큰 갱신 감지
  static void listenTokenRefresh(void Function(String) onRefresh) {
    _messaging.onTokenRefresh.listen(onRefresh);
  }

  // 알림 탭 이벤트 (Local Notification)
  static void _onNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      // 딥링크 처리
      NotificationRouter.handlePayload(payload);
    }
  }
}
```

---

### 3.4 앱 상태별 FCM 메시지 처리

```dart
// lib/services/fcm_message_handler.dart
class FcmMessageHandler {
  static void initialize(BuildContext context) {
    // ── 1. 포그라운드 메시지 ─────────────────────────────
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('포그라운드 메시지 수신: ${message.notification?.title}');

      // FCM은 포그라운드에서 자동 표시 안 함 → Local Notification으로 직접 표시
      if (message.notification != null) {
        _showLocalNotification(message);
      }
    });

    // ── 2. 백그라운드에서 알림 탭 ───────────────────────
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('백그라운드 알림 탭: ${message.data}');
      _handleMessageNavigation(context, message);
    });

    // ── 3. 종료 상태에서 알림 탭으로 앱 시작 ────────────
    _checkInitialMessage(context);
  }

  static Future<void> _checkInitialMessage(BuildContext context) async {
    final message = await FirebaseMessaging.instance.getInitialMessage();
    if (message != null) {
      debugPrint('종료 상태 알림 탭: ${message.data}');
      // 앱이 시작된 후 화면이 준비되면 이동
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _handleMessageNavigation(context, message);
      });
    }
  }

  // FCM 메시지를 Local Notification으로 표시
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    await FlutterLocalNotificationsPlugin().show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'high_importance_channel',
          '중요 알림',
          channelDescription: '중요한 앱 알림',
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode(message.data),  // 딥링크용 payload
    );
  }

  // 메시지 데이터로 화면 이동
  static void _handleMessageNavigation(
      BuildContext context, RemoteMessage message) {
    final screen = message.data['screen'];
    final id     = message.data['id'];

    switch (screen) {
      case 'chat':
        Navigator.pushNamed(context, '/chat', arguments: {'roomId': id});
      case 'order':
        Navigator.pushNamed(context, '/order', arguments: {'orderId': id});
      case 'product':
        Navigator.pushNamed(context, '/product', arguments: {'productId': id});
      default:
        Navigator.pushNamed(context, '/home');
    }
  }
}
```

---

### 3.5 Local Notifications: 앱 내 알림 예약

```dart
class LocalNotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();

  // 즉시 알림 표시
  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    await _plugin.show(
      id, title, body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'default_channel', '기본 알림',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: payload,
    );
  }

  // 특정 시각에 알림 예약
  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    await _plugin.zonedSchedule(
      id, title, body,
      TZDateTime.from(scheduledDate, local),  // timezone 변환
      const NotificationDetails(
        android: AndroidNotificationDetails('scheduled_channel', '예약 알림'),
        iOS: DarwinNotificationDetails(),
      ),
      payload: payload,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  // 매일 특정 시각에 반복 알림
  static Future<void> scheduleDailyNotification({
    required int id,
    required String title,
    required String body,
    required Time time,  // flutter_local_notifications의 Time 클래스
  }) async {
    await _plugin.periodicallyShowWithDuration(
      id, title, body,
      const Duration(days: 1),
      const NotificationDetails(
        android: AndroidNotificationDetails('daily_channel', '일일 알림'),
      ),
    );
  }

  // 알림 취소
  static Future<void> cancelNotification(int id) =>
      _plugin.cancel(id);

  // 모든 알림 취소
  static Future<void> cancelAllNotifications() =>
      _plugin.cancelAll();

  // 예약된 알림 목록 조회
  static Future<List<PendingNotificationRequest>> getPendingNotifications() =>
      _plugin.pendingNotificationRequests();
}
```

---

### 3.6 알림 권한 처리

```dart
// 플랫폼별 권한 요청
class PermissionHandler {
  static Future<bool> requestNotificationPermission() async {
    // Android 13+: 명시적 권한 요청 필요
    if (Platform.isAndroid) {
      final status = await Permission.notification.request();
      return status.isGranted;
    }

    // iOS: firebase_messaging을 통해 요청
    if (Platform.isIOS) {
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true, badge: true, sound: true,
      );
      return settings.authorizationStatus == AuthorizationStatus.authorized;
    }

    return true;
  }

  // 권한 거부 시 설정 앱으로 안내
  static Future<void> openNotificationSettings() async {
    await openAppSettings();
  }
}

// UI에서 권한 요청 흐름
class NotificationPermissionWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () async {
        final granted = await PermissionHandler.requestNotificationPermission();
        if (!granted && context.mounted) {
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              title: const Text('알림 권한 필요'),
              content: const Text('중요한 알림을 받으려면 설정에서 알림을 허용해주세요.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('나중에'),
                ),
                FilledButton(
                  onPressed: () {
                    Navigator.pop(context);
                    PermissionHandler.openNotificationSettings();
                  },
                  child: const Text('설정으로'),
                ),
              ],
            ),
          );
        }
      },
      child: const Text('알림 허용'),
    );
  }
}
```

---

### 3.7 딥링크: 알림 탭 → 특정 화면 이동

```dart
// 딥링크 라우터
class NotificationRouter {
  static final _navigatorKey = GlobalKey<NavigatorState>();
  static GlobalKey<NavigatorState> get navigatorKey => _navigatorKey;

  // payload JSON 파싱 후 화면 이동
  static void handlePayload(String payload) {
    try {
      final data = jsonDecode(payload) as Map<String, dynamic>;
      final screen = data['screen'] as String?;
      final id     = data['id']     as String?;

      switch (screen) {
        case 'product':
          _navigatorKey.currentState?.pushNamed(
            '/product/detail',
            arguments: {'id': id},
          );
        case 'order':
          _navigatorKey.currentState?.pushNamed(
            '/order/detail',
            arguments: {'orderId': id},
          );
        case 'chat':
          _navigatorKey.currentState?.pushNamed(
            '/chat',
            arguments: {'roomId': id},
          );
        default:
          _navigatorKey.currentState?.pushNamed('/home');
      }
    } catch (e) {
      debugPrint('딥링크 처리 오류: $e');
    }
  }
}

// MaterialApp에 navigatorKey 연결
MaterialApp(
  navigatorKey: NotificationRouter.navigatorKey,
  routes: {
    '/home':           (_) => const HomeScreen(),
    '/product/detail': (_) => const ProductDetailScreen(),
    '/order/detail':   (_) => const OrderDetailScreen(),
    '/chat':           (_) => const ChatScreen(),
  },
)

// go_router와 함께 사용
final _router = GoRouter(
  navigatorKey: NotificationRouter.navigatorKey,
  routes: [
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(
      path: '/product/:id',
      builder: (_, state) =>
          ProductDetailScreen(id: state.pathParameters['id']!),
    ),
  ],
);
```

---

### 3.8 FCM 서버 전송 예시 (백엔드 참고)

```javascript
// Node.js Firebase Admin SDK 예시 (Flutter 앱 개발자 참고용)
const admin = require("firebase-admin");

// 특정 기기에 알림 전송
await admin.messaging().send({
  token: "FCM_TOKEN_HERE",

  // Notification: OS가 자동 표시
  notification: {
    title: "새 메시지",
    body: "홍길동님이 메시지를 보냈습니다",
  },

  // Data: 앱에서 직접 처리 (딥링크 정보)
  data: {
    screen: "chat",
    id: "room_123",
  },

  // Android 설정
  android: {
    notification: {
      channelId: "high_importance_channel",
      priority: "high",
      sound: "default",
    },
  },

  // iOS 설정
  apns: {
    payload: {
      aps: {
        sound: "default",
        badge: 1,
      },
    },
  },
});
```

---

## 4. 사례 연구

### 4.1 채팅 앱 알림 전략

![채팅 앱 알림 시나리오별 처리](/developer-open-book/diagrams/flutter-step28-chat-notification-scenarios.svg)

```dart
// 포그라운드 메시지 처리: 현재 열린 화면 확인
FirebaseMessaging.onMessage.listen((message) {
  final currentRoute = ModalRoute.of(navigatorKey.currentContext!)?.settings.name;
  final targetRoom   = message.data['id'];

  if (currentRoute == '/chat/$targetRoom') {
    // 이미 해당 채팅방에 있음 → 알림 표시 안 함
    return;
  }

  // 다른 화면 → 알림 표시
  _showLocalNotification(message);
});
```

---

### 4.2 할 일 앱: Local Notification 스케줄

```dart
class TodoNotificationService {
  static Future<void> scheduleReminder(Todo todo) async {
    if (todo.dueDate == null || !todo.hasReminder) return;

    final reminderTime = todo.dueDate!.subtract(const Duration(minutes: 30));
    if (reminderTime.isBefore(DateTime.now())) return;

    await LocalNotificationService.scheduleNotification(
      id:            todo.id.hashCode,
      title:         '할 일 마감 30분 전',
      body:          todo.title,
      scheduledDate: reminderTime,
      payload:       jsonEncode({'screen': 'todo', 'id': todo.id}),
    );
  }

  static Future<void> cancelReminder(String todoId) async {
    await LocalNotificationService.cancelNotification(todoId.hashCode);
  }
}
```

---

### 4.3 토큰 관리: 서버 동기화 패턴

```dart
// 토큰을 서버에 저장하고 최신 상태 유지
class TokenSyncService {
  final _messaging = FirebaseMessaging.instance;
  final _apiService = ApiService();

  Future<void> initialize(String userId) async {
    // 1. 현재 토큰 가져와서 서버에 저장
    final token = await _messaging.getToken();
    if (token != null) {
      await _saveTokenToServer(userId, token);
    }

    // 2. 토큰 갱신 감지
    _messaging.onTokenRefresh.listen((newToken) async {
      await _saveTokenToServer(userId, newToken);
    });
  }

  Future<void> _saveTokenToServer(String userId, String token) async {
    await _apiService.post('/users/$userId/fcm-token', data: {
      'token':    token,
      'platform': Platform.isAndroid ? 'android' : 'ios',
      'updated':  DateTime.now().toIso8601String(),
    });
  }

  // 로그아웃 시 토큰 삭제
  Future<void> onLogout(String userId) async {
    await _messaging.deleteToken();
    await _apiService.delete('/users/$userId/fcm-token');
  }
}
```

---

## 5. 실습

### 5.1 FCM 토큰 발급 + Local Notification 데모

```dart
import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// 백그라운드 핸들러 (최상위 함수)
@pragma('vm:entry-point')
Future<void> _bgHandler(RemoteMessage msg) async {
  await Firebase.initializeApp();
  debugPrint('BG 메시지: ${msg.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_bgHandler);
  runApp(const MaterialApp(home: NotificationDemo()));
}

class NotificationDemo extends StatefulWidget {
  const NotificationDemo({super.key});
  @override
  State<NotificationDemo> createState() => _NotificationDemoState();
}

class _NotificationDemoState extends State<NotificationDemo> {
  final _localPlugin = FlutterLocalNotificationsPlugin();
  final _messaging   = FirebaseMessaging.instance;

  String _token    = '토큰 로딩 중...';
  String _lastMsg  = '아직 메시지 없음';
  int    _notifId  = 0;

  @override
  void initState() {
    super.initState();
    _setup();
  }

  Future<void> _setup() async {
    // Local Notifications 초기화
    await _localPlugin.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
      onDidReceiveNotificationResponse: (response) {
        setState(() => _lastMsg = '알림 탭: ${response.payload}');
      },
    );

    // Android 채널 생성
    await _localPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(const AndroidNotificationChannel(
          'demo_channel', '데모 알림',
          importance: Importance.high,
        ));

    // 알림 권한 요청
    await _messaging.requestPermission(alert: true, badge: true, sound: true);

    // FCM 토큰 가져오기
    final token = await _messaging.getToken();
    setState(() => _token = token ?? '토큰 발급 실패');

    // 포그라운드 메시지 수신
    FirebaseMessaging.onMessage.listen((msg) {
      setState(() => _lastMsg = '포그라운드: ${msg.notification?.title}');
      _showLocal(msg.notification?.title ?? '', msg.notification?.body ?? '');
    });

    // 백그라운드 알림 탭
    FirebaseMessaging.onMessageOpenedApp.listen((msg) {
      setState(() => _lastMsg = '알림 탭(BG): ${msg.data}');
    });

    // 종료 상태 알림 탭
    final initial = await _messaging.getInitialMessage();
    if (initial != null) {
      setState(() => _lastMsg = '알림 탭(종료): ${initial.data}');
    }
  }

  Future<void> _showLocal(String title, String body) async {
    await _localPlugin.show(
      _notifId++, title, body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'demo_channel', '데모 알림',
          importance: Importance.max,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode({'title': title}),
    );
  }

  Future<void> _testLocalNotification() async {
    await _showLocal('테스트 알림', '${DateTime.now().second}초에 발생한 알림입니다');
  }

  Future<void> _scheduleNotification() async {
    final time = DateTime.now().add(const Duration(seconds: 5));
    await _localPlugin.zonedSchedule(
      _notifId++,
      '예약 알림',
      '5초 후에 발생한 예약 알림입니다',
      TZDateTime.from(time, local),
      const NotificationDetails(
        android: AndroidNotificationDetails('demo_channel', '데모 알림'),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode({'type': 'scheduled'}),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('5초 후 알림이 예약되었습니다')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('알림 데모')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // FCM 토큰 표시
            const Text('FCM 토큰:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: SelectableText(_token,
                  style: const TextStyle(fontSize: 11)),
            ),
            const SizedBox(height: 16),

            // 마지막 메시지
            const Text('마지막 이벤트:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(_lastMsg, style: const TextStyle(color: Colors.blue)),
            const Divider(height: 32),

            // 테스트 버튼
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _testLocalNotification,
                icon: const Icon(Icons.notifications),
                label: const Text('즉시 Local Notification 표시'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _scheduleNotification,
                icon: const Icon(Icons.schedule),
                label: const Text('5초 후 알림 예약'),
              ),
            ),
            const SizedBox(height: 16),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('FCM 테스트 방법',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text(
                      '1. FCM 토큰을 복사합니다\n'
                      '2. Firebase Console → Cloud Messaging 이동\n'
                      '3. "새 알림 보내기" 선택\n'
                      '4. 토큰을 대상으로 알림 전송',
                      style: TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**pubspec.yaml:**

```yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^17.0.0
  timezone: ^0.9.0
```

**확인 포인트:**

- 앱 실행 시 FCM 토큰이 표시되는가?
- "즉시 알림" 버튼 탭 시 알림이 표시되는가?
- "5초 후 알림" 예약 후 앱을 백그라운드로 보내면 알림이 오는가?
- Firebase Console에서 FCM 토큰으로 테스트 알림을 보낼 수 있는가?

---

### 5.2 자가 평가 퀴즈

**Q1. [Understand]** 포그라운드 상태에서 FCM Notification Message가 자동으로 표시되지 않는 이유와 해결책은?

> **모범 답안:** FCM은 포그라운드 상태에서 OS의 알림 트레이에 자동으로 표시하지 않는다. 이유는 앱이 이미 활성 상태이므로 OS가 알림을 방해 요소로 처리하기 때문이다. 해결책은 `FirebaseMessaging.onMessage`에서 메시지를 수신해 `FlutterLocalNotificationsPlugin.show()`로 직접 Local Notification을 표시하는 것이다.

---

**Q2. [Understand]** `onBackgroundMessage` 핸들러를 반드시 최상위 함수로 정의해야 하는 이유는?

> **모범 답안:** 백그라운드/종료 상태에서 FCM 메시지를 처리할 때 Flutter 앱이 완전히 초기화되지 않은 별도의 Isolate에서 핸들러가 실행된다. 이 Isolate는 클래스 인스턴스에 접근할 수 없으므로 클래스 메서드를 호출할 수 없다. 최상위 함수는 Isolate 경계를 넘어 전달될 수 있어 이 환경에서 안전하게 실행된다. `@pragma('vm:entry-point')` 어노테이션은 컴파일러가 트리 쉐이킹으로 이 함수를 제거하지 않도록 보호한다.

---

**Q3. [Understand]** 앱이 종료 상태에서 알림 탭으로 시작된 경우 `getInitialMessage()`를 사용하는 이유는?

> **모범 답안:** 앱이 종료 상태에서 알림 탭으로 시작되면 `onMessageOpenedApp` 스트림은 앱이 시작되기 전에 발생한 이벤트를 받지 못한다. `getInitialMessage()`는 앱이 알림 탭으로 시작됐는지, 시작 메시지가 있다면 무엇인지 앱 초기화 시점에 한 번 확인하는 메서드다. 이를 통해 종료 상태 알림 탭도 올바르게 처리할 수 있다.

---

**Q4. [Apply]** FCM 토큰을 서버에 저장해야 하는 이유와 `onTokenRefresh`를 사용해야 하는 이유를 설명하라.

> **모범 답안:** 서버가 특정 기기에 알림을 보내려면 그 기기의 FCM 토큰이 필요하다. 토큰은 앱 재설치, OS 업데이트, 앱 데이터 초기화 시 변경될 수 있다. `onTokenRefresh`를 구독하면 토큰이 변경될 때 자동으로 알림을 받아 서버의 토큰을 최신 상태로 업데이트할 수 있다. 토큰이 변경됐는데 서버에 이전 토큰이 저장되어 있으면 알림이 전달되지 않는다.

---

**Q5. [Apply]** 알림 탭 시 특정 화면으로 이동하기 위해 딥링크를 구현할 때 필요한 3가지 구성 요소는?

> **모범 답안:** ① **payload 데이터**: FCM `data` 필드 또는 Local Notification `payload`에 화면 정보(screen, id)를 JSON으로 포함한다. ② **GlobalKey\<NavigatorState\>**: 알림 탭 이벤트가 발생하는 시점이 위젯 트리 컨텍스트 밖일 수 있으므로, Navigator에 접근하기 위한 전역 키가 필요하다. ③ **라우팅 로직**: payload를 파싱해 올바른 화면과 인수로 `Navigator.pushNamed()` 또는 `context.go()`를 호출하는 처리 함수.

---

## 6. 결론 및 다음 단계

### 6.1 핵심 요약

- **FCM**: 서버→FCM→기기 경로. `Notification Message`는 OS가 자동 표시, `Data Message`는 앱이 처리.
- **상태별 처리**: 포그라운드→`onMessage`(Local Notification으로 수동 표시), 백그라운드→`onMessageOpenedApp`, 종료→`getInitialMessage()`.
- **`onBackgroundMessage`**: 반드시 최상위 함수 + `@pragma('vm:entry-point')`.
- **Local Notifications**: 즉시(`show()`)·예약(`zonedSchedule()`)·반복 알림. `timezone` 패키지로 정확한 시각 지정.
- **딥링크**: FCM `data`에 화면 정보 포함 → `GlobalKey<NavigatorState>`로 화면 이동.
- **토큰 관리**: 서버에 저장·`onTokenRefresh`로 갱신 감지·로그아웃 시 삭제.

### 6.2 다음 Step 예고

- **Step 29 — 앱 배포:** Android Play Store·iOS App Store 제출 과정, 앱 서명(keystore·p12), 릴리즈 빌드 설정을 학습한다.

### 6.3 참고 자료

| 자료                         | 링크                                                                     | 설명                    |
| ---------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| firebase_messaging 공식 문서 | <https://pub.dev/packages/firebase_messaging>                              | 패키지 문서             |
| FlutterFire 알림 가이드      | <https://firebase.flutter.dev/docs/messaging/overview>                     | FlutterFire 공식 가이드 |
| flutter_local_notifications  | <https://pub.dev/packages/flutter_local_notifications>                     | Local 알림 패키지       |
| FCM 메시지 포맷              | <https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages> | 메시지 구조 레퍼런스    |
| Flutter 딥링크               | <https://docs.flutter.dev/ui/navigation/deep-linking>                      | 딥링크 공식 가이드      |

### 6.4 FAQ

**Q. Android에서 알림이 표시되지 않는 주요 원인은?**

> ① Android 8.0(API 26) 이상에서 알림 채널이 생성되지 않은 경우. `AndroidNotificationChannel`을 먼저 생성해야 한다. ② Android 13(API 33) 이상에서 `POST_NOTIFICATIONS` 권한이 없는 경우. 명시적으로 권한을 요청해야 한다. ③ `channelId`가 알림과 채널 생성 시 불일치하는 경우.

**Q. iOS에서 포그라운드 알림을 표시하려면?**

> `FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true)`를 앱 초기화 시 호출해야 한다. 이 설정 없이는 iOS는 포그라운드에서 알림을 자동 표시하지 않는다.

**Q. Local Notification과 FCM 알림 ID가 충돌하면?**

> 같은 ID로 새 알림을 표시하면 이전 알림이 교체된다. 고유 ID가 필요하면 `message.hashCode` 또는 `DateTime.now().millisecondsSinceEpoch` 등을 사용한다. 단, int 범위를 초과하지 않도록 주의한다.

---

## 빠른 자가진단 체크리스트

- [ ] FCM의 Notification Message와 Data Message의 차이를 설명할 수 있는가?
- [ ] 3가지 앱 상태(포그라운드·백그라운드·종료)별 FCM 처리 방식을 설명할 수 있는가?
- [ ] onBackgroundMessage를 최상위 함수로 정의해야 하는 이유를 설명할 수 있는가?
- [ ] FCM 토큰을 서버에 저장하고 onTokenRefresh로 갱신하는 이유를 설명할 수 있는가?
- [ ] Local Notification으로 즉시·예약·반복 알림을 구현할 수 있는가?
- [ ] 딥링크 구현에 GlobalKey<NavigatorState>가 필요한 이유를 설명할 수 있는가?
- [ ] ⚠️ 함정 체크: 포그라운드에서 FCM 알림이 자동 표시되지 않으므로 LocalNotification으로 직접 표시해야 한다는 것을 이해했는가?
- [ ] ⚠️ 함정 체크: Android 8.0+ 에서 알림 채널 없이는 알림이 표시되지 않는다는 것을 이해했는가?
