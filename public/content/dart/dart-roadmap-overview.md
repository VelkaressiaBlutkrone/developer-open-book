# 📘 Dart 언어 완전 정복 학습 로드맵

> 이론 80% + 실습 20% 원칙 기반 | Dart 3.0+ 대응 | Flutter 전환 목표

---

## 🗺️ 전체 로드맵 구성표

| Phase       | 단계명                 | Step               | 주제                         | 블룸 수준             | 예상 소요 |
| ----------- | ---------------------- | ------------------ | ---------------------------- | --------------------- | --------- |
| **Phase 1** | 🏁 Dart 기초           | Step 1             | 개요 및 환경 구축            | Remember              | 1일       |
|             |                        | Step 2             | 변수와 데이터 타입           | Remember ~ Understand | 2일       |
|             |                        | Step 3             | 연산자와 조건문              | Understand ~ Apply    | 1일       |
|             |                        | Step 4             | 반복문                       | Apply                 | 1일       |
|             |                        | Step 5             | 함수 (Function)              | Apply                 | 2일       |
|             |                        | 🎯 **실전 과제 1** | CLI 계산기                   | Apply ~ Analyze       | 1~2일     |
| **Phase 2** | 🏗️ 컬렉션 & OOP        | Step 6             | Collection 타입              | Understand ~ Apply    | 2일       |
|             |                        | Step 7             | Collection 고급 & 함수형     | Apply ~ Analyze       | 2일       |
|             |                        | Step 8             | 클래스와 객체 기본           | Understand ~ Apply    | 2일       |
|             |                        | Step 9             | 생성자 패턴                  | Apply ~ Analyze       | 2일       |
|             |                        | Step 10            | OOP 확장                     | Analyze               | 2일       |
|             |                        | 🎯 **실전 과제 2** | 콘솔 도서 관리 시스템        | Apply ~ Analyze       | 2~3일     |
| **Phase 3** | 🚀 Dart 3.0+ 고급      | Step 11            | Mixins                       | Analyze               | 1일       |
|             |                        | Step 12            | Records & Pattern Matching   | Analyze ~ Evaluate    | 2일       |
|             |                        | Step 13            | Enum & Extension             | Apply ~ Analyze       | 2일       |
|             |                        | Step 14            | Null Safety 심화             | Analyze ~ Evaluate    | 2일       |
|             |                        | Step 15            | Exception & Generics         | Analyze ~ Evaluate    | 2일       |
| **Phase 4** | ⏳ 비동기 프로그래밍   | Step 16            | Future & Async-Await         | Understand ~ Apply    | 2일       |
|             |                        | Step 17            | Stream                       | Apply ~ Analyze       | 2일       |
|             |                        | Step 18            | Isolates                     | Understand ~ Apply    | 1일       |
|             |                        | 🎯 **실전 과제 3** | 가짜 서버 통신 시뮬레이터    | Apply ~ Create        | 2~3일     |
| **Phase 5** | 🛠️ 실무 & Flutter 연결 | Step 19            | 패키지 관리 및 프로젝트 구조 | Apply                 | 1일       |
|             |                        | Step 20            | 코드 생성 (Code Generation)  | Apply ~ Analyze       | 2일       |
|             |                        | Step 21            | 테스팅 및 최적화 패턴        | Evaluate              | 2일       |
|             |                        | Step 22            | Flutter 전환 최종 점검       | Evaluate ~ Create     | 2일       |

> 📅 **총 예상 소요 기간**: 6~8주 (하루 1~2시간 학습 기준)

---

## 📐 학습 목표 (Revised Bloom's Taxonomy 기반)

이 로드맵을 완주하면 학습자는 다음을 달성할 수 있습니다:

| #   | 블룸 단계     | 학습 목표                                                                          |
| --- | ------------- | ---------------------------------------------------------------------------------- |
| 1   | 🔵 Remember   | Dart의 주요 타입, 키워드, 컬렉션 종류를 나열할 수 있다                             |
| 2   | 🟢 Understand | Null Safety, Event Loop, Future 작동 원리를 자신의 말로 설명할 수 있다             |
| 3   | 🟡 Apply      | 주어진 요구사항에 맞는 클래스 설계와 비동기 코드를 작성할 수 있다                  |
| 4   | 🟠 Analyze    | OOP 설계 패턴(상속 vs mixin vs interface)의 트레이드오프를 분석할 수 있다          |
| 5   | 🔴 Evaluate   | json_serializable, freezed 도구 도입의 적합성을 실무 관점에서 판단할 수 있다       |
| 6   | 🟣 Create     | Flutter 위젯 트리와 연동 가능한 Dart 데이터 모델 및 서비스 레이어를 설계할 수 있다 |

---

## 🗂️ 전체 섹션 비율 배분

![diagram](/developer-open-book/diagrams/roadmap-section-ratio.svg)

---

## 🏁 Phase 1 — Dart 기초 (기초 체력 기르기)

**목표**: Dart의 구문과 실행 구조를 익히고 기본 제어 흐름을 마스터합니다.

| Step   | 주제               | 핵심 키워드                             | 문서 연결          |
| ------ | ------------------ | --------------------------------------- | ------------------ |
| Step 1 | 개요 및 환경 구축  | Single Thread, JIT, AOT, dart run       | [→ Step 1 문서](#) |
| Step 2 | 변수와 데이터 타입 | var, final, const, dynamic, Null Safety | [→ Step 2 문서](#) |
| Step 3 | 연산자와 조건문    | ??, ??=, ?., switch, 패턴 매칭          | [→ Step 3 문서](#) |
| Step 4 | 반복문             | for, while, for-in, forEach             | [→ Step 4 문서](#) |
| Step 5 | 함수               | =>, Named parameter, Optional, Default  | [→ Step 5 문서](#) |

🎯 **실전 과제 1**: CLI 계산기

---

## 🏗️ Phase 2 — 컬렉션과 객체지향 (구조 설계 입문)

**목표**: 데이터를 조직화하고 OOP의 핵심을 이해합니다.

| Step    | 주제                     | 핵심 키워드                           | 문서 연결           |
| ------- | ------------------------ | ------------------------------------- | ------------------- |
| Step 6  | Collection 타입          | List, Set, Map, Mutable, Immutable    | [→ Step 6 문서](#)  |
| Step 7  | Collection 고급 & 함수형 | ..., map(), where(), reduce(), fold() | [→ Step 7 문서](#)  |
| Step 8  | 클래스와 객체 기본       | class, 인스턴스, 필드, 메서드         | [→ Step 8 문서](#)  |
| Step 9  | 생성자 패턴              | Named constructor, const, factory     | [→ Step 9 문서](#)  |
| Step 10 | OOP 확장                 | extends, implements, abstract         | [→ Step 10 문서](#) |

🎯 **실전 과제 2**: 콘솔 도서 관리 시스템

---

## 🚀 Phase 3 — Dart 고급 및 현대적 문법 (Dart 3.0+)

**목표**: 최신 Dart 문법으로 코드 가독성과 안정성을 극대화합니다.

| Step    | 주제                       | 핵심 키워드                         | 문서 연결           |
| ------- | -------------------------- | ----------------------------------- | ------------------- |
| Step 11 | Mixins                     | mixin, with, 다중 상속 대안         | [→ Step 11 문서](#) |
| Step 12 | Records & Pattern Matching | Records, Destructuring, switch 패턴 | [→ Step 12 문서](#) |
| Step 13 | Enum & Extension           | Enhanced Enum, extension methods    | [→ Step 13 문서](#) |
| Step 14 | Null Safety 심화           | Flow Analysis, never, ?..           | [→ Step 14 문서](#) |
| Step 15 | Exception & Generics       | Custom Exception, rethrow, Generic  | [→ Step 15 문서](#) |

---

## ⏳ Phase 4 — 비동기 프로그래밍 (데이터 흐름 제어)

**목표**: API 통신과 이벤트 기반 처리를 위한 비동기 메커니즘을 완벽히 이해합니다.

| Step    | 주제                 | 핵심 키워드                                  | 문서 연결           |
| ------- | -------------------- | -------------------------------------------- | ------------------- |
| Step 16 | Future & Async-Await | Future, async, await, try-catch              | [→ Step 16 문서](#) |
| Step 17 | Stream               | Stream<T>, listen, async\*, yield, Broadcast | [→ Step 17 문서](#) |
| Step 18 | Isolates             | Isolate, compute(), 메인 스레드 보호         | [→ Step 18 문서](#) |

🎯 **실전 과제 3**: 가짜 서버 통신 시뮬레이터

---

## 🛠️ Phase 5 — 실무 개발 및 Flutter 연결

**목표**: 협업 환경에서 사용하는 도구와 최적화 패턴을 익히고 Flutter로 전환합니다.

| Step    | 주제              | 핵심 키워드                              | 문서 연결           |
| ------- | ----------------- | ---------------------------------------- | ------------------- |
| Step 19 | 패키지 관리       | pubspec.yaml, 버전 충돌, 디렉토리 구조   | [→ Step 19 문서](#) |
| Step 20 | 코드 생성         | build_runner, json_serializable, freezed | [→ Step 20 문서](#) |
| Step 21 | 테스팅 & 최적화   | Unit Test, copyWith, 불변 객체 패턴      | [→ Step 21 문서](#) |
| Step 22 | Flutter 전환 점검 | 위젯 트리, 선언적 UI, StatelessWidget    | [→ Step 22 문서](#) |

---

## 📚 핵심 참고 자료

| 자료                  | 링크                              | 용도                |
| --------------------- | --------------------------------- | ------------------- |
| Dart 공식 문서        | <https://dart.dev/guides>         | 언어 레퍼런스 전반  |
| Dart 언어 투어        | <https://dart.dev/language>       | 문법 빠른 탐색      |
| Dart API 레퍼런스     | <https://api.dart.dev>            | 내장 라이브러리     |
| Effective Dart        | <https://dart.dev/effective-dart> | 코드 스타일 가이드  |
| DartPad (온라인 실습) | <https://dartpad.dev>             | 설치 없이 즉시 실습 |
| pub.dev               | <https://pub.dev>                 | 패키지 검색         |
| Flutter 공식 문서     | <https://docs.flutter.dev>        | Phase 5 이후 연계   |

---

## ✅ 빠른 자가진단 체크리스트

> **3개 이상 "아니오"** 라면 해당 Phase를 재학습하세요.

- [ ] 각 Phase 완료 후 핵심 용어 10개를 막힘없이 설명할 수 있는가?
- [ ] 실전 과제 3개를 직접 코드로 구현할 수 있는가?
- [ ] Null Safety 없이 작성된 코드의 문제점을 지적할 수 있는가?
- [ ] Future와 Stream의 차이를 실사용 예시로 설명할 수 있는가?
- [ ] Flutter 위젯과 Dart 클래스의 관계를 도식으로 그릴 수 있는가?

---

> 📌 **다음 단계**: [Step 1 — Dart 개요 및 환경 구축 →](#)

_이 로드맵은 Revised Bloom's Taxonomy(2001) 및 Kirkpatrick 4단계 평가 모델을 기반으로 설계되었습니다._
