# Step 33. 폼 UX 패턴과 접근성

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
> 타입 안전성, 폼 관리, 스타일링으로 프로덕션 품질을 완성한다

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Remember**   | 폼 접근성의 핵심 ARIA 속성(aria-invalid, aria-describedby, aria-required)을 기술할 수 있다 |
| **Understand** | 인라인 검증, 제출 시 검증, 실시간 검증의 UX 차이를 설명할 수 있다                          |
| **Apply**      | 접근성을 갖춘 폼 컴포넌트를 구현할 수 있다                                                 |
| **Analyze**    | 에러 메시지의 시각적·의미적 설계가 사용자 경험에 미치는 영향을 분석할 수 있다              |
| **Evaluate**   | 프로젝트 요구사항에 맞는 검증 시점 전략을 판단하고 설계할 수 있다                          |

**전제 지식:**

- Step 8: Form, Controlled/Uncontrolled, 폼 제출
- Step 32: React Hook Form, Zod, formState, mode

---

## 1. 서론 — 폼은 "기능"이 아니라 "대화"이다

### 1.1 폼 UX의 등장 배경과 발전 과정

웹 폼은 1990년대 HTML 2.0 사양에 `<form>` 요소가 도입된 이래 사용자와 애플리케이션 사이의 가장 기본적인 상호작용 수단이었다. 초기 폼은 서버로 데이터를 전송하는 단순한 역할만 수행했으며, 검증은 전적으로 서버 측에서 이루어졌다. 사용자가 폼을 제출하면 페이지가 새로고침되고, 에러가 있으면 전체 페이지가 다시 로드되어 에러 메시지를 표시하는 방식이었다. 이 시대의 폼은 "사용자와의 대화"라기보다 "데이터 입력 양식"에 가까웠고, 검증 지연과 페이지 이동으로 인한 사용자 불편은 당연한 것으로 여겨졌다.

2000년대 중반 Ajax의 등장과 함께 클라이언트 측 검증이 보편화되면서 폼 UX는 비약적으로 발전했다. jQuery Validation Plugin(2006)은 인라인 검증의 가능성을 보여주었고, 사용자가 페이지를 벗어나지 않고도 입력 오류를 확인할 수 있게 되었다. 이후 React와 같은 선언적 UI 프레임워크의 등장으로 폼 상태 관리가 체계화되었고, React Hook Form(2019)과 같은 전문 라이브러리가 "성능과 UX를 동시에 달성하는" 폼 관리를 가능하게 만들었다. 이 시기에 폼은 단순한 입력 양식에서 "사용자와의 양방향 대화 인터페이스"로 진화했다.

최근에는 WCAG(Web Content Accessibility Guidelines) 2.1/2.2의 강화와 함께 폼 접근성이 법적 요구사항으로 자리잡았다. 미국의 ADA(Americans with Disabilities Act), EU의 European Accessibility Act(2025년 시행), 한국의 장애인차별금지법 등은 웹 폼이 모든 사용자에게 접근 가능해야 함을 명시하고 있다. 장애인 인구가 전 세계 인구의 15% 이상을 차지하는 현실에서, 접근성을 갖추지 않은 폼은 잠재 고객의 상당 부분을 배제하는 비즈니스 리스크이기도 하다. 이제 폼 UX는 단순한 "좋은 디자인"이 아니라 "법적 의무"이자 "비즈니스 기회"이기도 하다.

### 1.2 폼 UX가 중요한 이유 — 산업적 가치

폼은 사용자와 애플리케이션 사이의 **대화**이다. 사용자가 정보를 입력하고, 앱이 피드백을 주고, 사용자가 수정하고, 최종적으로 제출한다. 이 대화가 원활하지 않으면 사용자는 **이탈**한다. 그러나 대화를 잘 설계하면 사용자는 신뢰를 가지고 제출까지 완료한다.

```
폼 이탈률 통계 (업계 데이터):
  · 복잡한 폼의 평균 이탈률: 67%
  · 에러 메시지가 불명확하면 이탈률 +30%
  · 검증 타이밍이 부적절하면 좌절감 증가
  · 접근성이 부족하면 일부 사용자가 아예 사용 불가

좋은 폼 UX의 효과:
  · 명확한 에러 메시지 → 수정 시간 감소
  · 적절한 검증 타이밍 → 좌절감 감소
  · 접근성 → 모든 사용자가 사용 가능
  · 자동 저장 → 데이터 손실 방지
  · 진행 표시 → 완료 의지 유지
```

실제 기업 사례에서 폼 UX 개선은 직접적인 비즈니스 성과로 이어진다. Airbnb는 호스트 등록 폼을 다단계 Progressive Disclosure 패턴으로 재설계하여 등록 완료율을 25% 향상시켰다. Stripe는 결제 폼에 인라인 검증과 실시간 카드 타입 감지를 적용하여 결제 전환율을 향상시켰다. Google은 Chrome Autofill과 연동되는 시맨틱 폼 마크업을 권장하며, 이를 적용한 사이트에서 폼 완료 시간이 30% 단축되었다고 보고한다.

폼 접근성 개선 역시 비즈니스 가치를 창출한다. 영국의 소매업체 Tesco는 웹사이트 접근성 개선 후 장애인 고객의 온라인 쇼핑 완료율이 크게 향상되었음을 보고했다. 접근성이 "특수한 사용자를 위한 배려"가 아니라 "모든 사용자 경험의 기반"임을 보여주는 사례다.

### 1.3 핵심 개념 지도

![react-step33-concept-map](/developer-open-book/diagrams/react-step33-concept-map.svg)

### 1.4 이 Step에서 다루는 범위

![react-step33-scope](/developer-open-book/diagrams/react-step33-scope.svg)

---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어                       | 정의                                                                    | 왜 중요한가                                             |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| **인라인 검증**            | 사용자가 필드를 떠날 때(blur) **즉시 해당 필드를 검증**하여 에러를 표시 | 즉각적 피드백으로 수정 비용을 줄인다                    |
| **aria-invalid**           | 폼 필드가 **유효하지 않은 상태**임을 스크린 리더에 알리는 ARIA 속성     | 시각적 에러 표시만으로는 스크린 리더 사용자가 인식 불가 |
| **aria-describedby**       | 폼 필드를 **설명하는 요소의 ID**를 연결. 에러 메시지, 도움말 텍스트 등  | 스크린 리더가 필드 포커스 시 연결된 설명을 읽어준다     |
| **aria-required**          | 필드가 **필수 입력**임을 스크린 리더에 알리는 속성                      | HTML required와 함께 사용하여 접근성 보장               |
| **에러 포커스**            | 검증 실패 시 **첫 번째 에러 필드로 자동 포커스** 이동                   | 에러가 화면 밖에 있어도 사용자가 즉시 인식              |
| **Auto-save**              | 사용자 입력을 **일정 간격으로 자동 저장**하는 패턴                      | 데이터 손실 방지, 긴 폼에서 특히 중요                   |
| **Progressive Disclosure** | 복잡한 폼을 **단계적으로 노출**하여 인지 부하를 줄이는 UX 기법          | 사용자가 한 번에 많은 필드를 보지 않아도 됨             |

### 2.2 용어별 이론적 배경

#### 인라인 검증 (Inline Validation)

인라인 검증은 Nielsen Norman Group의 2009년 연구에서 그 효과가 입증된 폼 검증 패턴이다. 이 연구에 따르면, 인라인 검증을 적용한 폼은 제출 시 검증만 적용한 폼에 비해 완료 시간이 22% 단축되고, 에러 수가 47% 감소하며, 사용자 만족도가 31% 향상되었다. 단순히 "더 편하다"는 직관을 넘어, 통제된 실험으로 효과가 수치화된 것이다.

인라인 검증이 효과적인 이유는 인지 심리학의 **즉각적 피드백(Immediate Feedback)** 원칙에 기반한다. 사용자가 입력을 완료한 직후(blur 이벤트) 피드백을 받으면, 해당 입력에 대한 작업 기억(Working Memory)이 아직 활성화된 상태이므로 에러를 이해하고 수정하는 비용이 최소화된다. 반면, 제출 시에 모든 에러를 한꺼번에 보여주면 사용자는 과거 입력을 다시 떠올려야 하는 인지 부담을 겪는다. 인지 심리학 연구에서는 이를 "맥락 전환 비용(Context Switching Cost)"이라 부른다.

인라인 검증에도 설계 주의점이 있다. 사용자가 아직 입력 중인 필드에 에러를 표시하는 것(onChange 기반)은 오히려 역효과를 낼 수 있다. "이메일@"까지만 입력한 상태에서 "유효하지 않은 이메일"이 표시되면 사용자는 방해받는다고 느낀다. 따라서 인라인 검증의 최선 실천은 blur 이벤트(필드에서 포커스가 빠져나갈 때)를 기준으로 하는 것이다.

#### ARIA 속성과 폼 접근성

ARIA(Accessible Rich Internet Applications)는 W3C가 정의한 웹 접근성 명세로, HTML 요소의 의미(semantics)를 보강하여 보조 기술이 콘텐츠를 올바르게 해석하도록 돕는다. 폼에서 ARIA가 중요한 이유는, 시각적 UI 변화(빨간 테두리, 에러 텍스트 등)만으로는 스크린 리더 사용자에게 정보를 전달할 수 없기 때문이다. ARIA가 없는 폼에서 시각 장애인 사용자는 "어떤 필드에 에러가 있는지", "어떤 필드가 필수인지"를 알 수 없다.

`aria-invalid`는 필드의 에러 상태를 프로그래밍적으로 선언하고, `aria-describedby`는 에러 메시지나 도움말 텍스트를 해당 필드와 명시적으로 연결한다. `role="alert"`는 에러 메시지가 동적으로 나타날 때 스크린 리더가 즉시 읽어주도록 하는 라이브 리전(live region) 역할을 한다. 이 세 가지 속성의 조합이 폼 접근성의 기본을 이룬다. 주목할 점은, 이 속성들이 "장애인을 위한 배려"를 넘어 SEO와 크롤러 이해도에도 긍정적 영향을 미친다는 것이다.

WCAG 2.1 기준에서 폼 접근성은 성공 기준 1.3.1(정보와 관계), 3.3.1(에러 식별), 3.3.2(레이블 또는 지시사항), 3.3.3(에러 제안)에 해당한다. 이 기준들을 충족하지 않으면 WCAG AA 수준을 달성하지 못하며, 법적 책임을 질 수 있는 국가/지역이 있다.

#### Auto-save (자동 저장)

자동 저장 패턴은 Google Docs(2006)와 함께 대중화되었다. 사용자가 명시적으로 "저장" 버튼을 누르지 않아도 입력이 자동으로 서버에 반영되는 방식이다. 이 패턴의 핵심은 **디바운스(Debounce)**로, 매 키 입력마다 저장하는 대신 입력이 멈춘 후 일정 시간(보통 500ms~2000ms)이 지나면 저장을 트리거한다. 디바운스가 없으면 사용자가 "안녕하세요"를 입력하는 동안 7번의 API 요청이 발생하고, 이는 서버 부하와 경쟁 조건(Race Condition)을 유발한다.

자동 저장은 UX 측면에서 데이터 손실 방지, 명시적 저장 행위 제거 등의 이점을 가지지만, 결제나 회원가입처럼 "의도적 제출"이 필요한 맥락에서는 부적합하다. 사용자가 의도하지 않은 변경이 자동 반영되면 오히려 문제가 될 수 있기 때문이다. Notion은 자동 저장의 모범 사례로, "저장됨"/"저장 중" 인디케이터로 사용자에게 저장 상태를 명확히 알려준다.

#### Progressive Disclosure (점진적 노출)

Progressive Disclosure는 정보 디자인의 핵심 원칙으로, 사용자에게 현재 필요한 정보만 보여주고 나머지는 요청 시에 노출하는 방식이다. 폼에서는 다단계 위저드(Multi-step Wizard), 조건부 필드 표시, 접힘/펼침 섹션 등으로 구현된다. 인지 심리학의 **밀러의 법칙(7±2)**에 따르면 사람이 한 번에 처리할 수 있는 정보 단위는 제한적이므로, 20개 필드를 한 화면에 보여주는 것보다 5개씩 4단계로 나누는 것이 인지 부하를 줄인다.

실제로 Expedia는 예약 폼에서 불필요한 필드를 제거하고 단계를 분리하여 연간 수억 달러의 추가 매출을 기록했다는 사례 연구가 있다. 이처럼 폼 필드 수 감소와 단계적 노출은 단순한 UX 개선을 넘어 직접적인 비즈니스 성과를 만든다.

### 2.3 검증 시점 스펙트럼

![react-step33-validation-spectrum](/developer-open-book/diagrams/react-step33-validation-spectrum.svg)

### 2.4 개념 간 관계 구조

![react-step33-ux-architecture](/developer-open-book/diagrams/react-step33-ux-architecture.svg)

### 2.5 ARIA와 폼 접근성 속성 관계도

![react-step33-aria-relations](/developer-open-book/diagrams/react-step33-aria-relations.svg)

---

## 3. 이론과 원리

### 3.1 검증 시점 전략

#### 전략 1: 제출 시 검증 (onSubmit)

```
사용자 흐름:
  이름 입력 → (에러 없음) → 이메일 입력 → (에러 없음)
  → 비밀번호 입력 → (에러 없음) → [제출] 클릭
  → "이름: 필수, 이메일: 유효하지 않음, 비밀번호: 8자 미만"
  → 3개 에러를 한 번에 받음!

장점:
  · 구현이 가장 간단
  · 입력 중 방해가 전혀 없음
  · 성능 비용 최소

단점:
  · 제출 후에야 에러를 알게 됨 (좌절감)
  · 여러 에러를 한 번에 수정해야 함
  · 에러가 많으면 어디서부터 수정할지 혼란

적합한 경우:
  · 필드가 1~2개인 간단한 폼 (로그인)
  · 검증 규칙이 단순한 경우
```

#### 전략 2: 인라인 검증 (onBlur) — 권장

```
사용자 흐름:
  이름 입력 → [Tab/클릭으로 다음 필드 이동]
  → "이름을 입력하세요" (즉시 표시!)
  → 이름 수정 → [다음 필드 이동] → 에러 사라짐
  → 이메일 입력 → [다음 필드 이동]
  → "유효한 이메일을 입력하세요" → 수정
  → [제출] 클릭 → 모든 필드 이미 검증 완료!

장점:
  · 입력 중에는 방해하지 않음
  · 필드를 떠나는 즉시 피드백 → 바로 수정 가능
  · 제출 전에 대부분의 에러가 해결됨
  · 가장 자연스러운 사용자 경험 ★

단점:
  · onSubmit보다 약간 복잡한 구현
  · 터치하지 않은 필드의 에러는 제출 시까지 모름

적합한 경우:
  · 대부분의 폼 (회원가입, 프로필, 주문 등)
  · 3개 이상 필드가 있는 폼

RHF 설정:
  useForm({ mode: 'onBlur' })
```

#### 전략 3: "관대한 검증" 패턴 — 제출 후 인라인 전환

```
가장 세련된 UX 패턴: "처음에는 관대하고, 에러 이후에는 즉각적"

  첫 번째 제출 전:
    · 검증 없음 — 사용자가 자유롭게 입력
    · 입력 중 방해 없음

  첫 번째 제출 시:
    · 전체 검증 실행
    · 에러가 있는 필드 표시 + 첫 에러 필드로 포커스

  에러 수정 시:
    · onChange로 실시간 검증 전환!
    · 사용자가 수정하는 즉시 에러가 사라짐 → 즉각적 피드백

  원리: "잘못하기 전에는 관대하고, 잘못한 후에는 즉각적으로 안내"

RHF 설정:
  useForm({ mode: 'onSubmit', reValidateMode: 'onChange' })
  // 첫 제출은 onSubmit, 에러 발생 후 재검증은 onChange!
```

#### 세 가지 전략 비교

![react-step33-validation-comparison](/developer-open-book/diagrams/react-step33-validation-comparison.svg)

### 3.2 에러 메시지 설계

#### 좋은 에러 메시지의 4원칙

```
1. 무엇이 잘못되었는지 (What)
   ❌ "유효하지 않은 값"
   ✅ "이메일 형식이 올바르지 않습니다"

2. 왜 잘못되었는지 (Why)
   ❌ "비밀번호 오류"
   ✅ "비밀번호는 8자 이상이어야 합니다"

3. 어떻게 수정하는지 (How)
   ❌ "날짜 오류"
   ✅ "날짜를 YYYY-MM-DD 형식으로 입력하세요 (예: 2024-03-15)"

4. 정중하고 비난하지 않는 톤
   ❌ "잘못된 이메일을 입력했습니다!"
   ✅ "유효한 이메일 주소를 입력해 주세요"
```

#### 에러 메시지의 시각적 설계

```
시각적 설계 원칙:

  1. 색상: 빨간 계열 (#DC2626 등), 단 색상만으로 구분하지 않는다 (색각 이상)
     → 아이콘을 함께 사용

  2. 위치: 해당 필드 바로 아래에 표시
     → 폼 상단에 모아서 표시하면 어떤 필드의 에러인지 파악 어려움

  3. 크기: 본문보다 약간 작은 폰트 (12~14px)
     → 너무 크면 레이아웃을 방해, 너무 작으면 인식 어려움

  4. 공간 확보: 에러 메시지가 나타나도 레이아웃이 밀려나지 않도록
     → min-height를 설정하거나 absolute 배치
     → CLS(레이아웃 이동) 방지!

  5. 전환: 부드러운 등장 애니메이션 (선택적)
     → 갑자기 나타나면 놀랄 수 있음
```

### 3.3 폼 접근성(a11y) — ARIA 속성

#### 핵심 ARIA 속성 정리

![react-step33-aria-attributes](/developer-open-book/diagrams/react-step33-aria-attributes.svg)

### 3.4 에러 포커스 자동 이동

```
RHF의 내장 에러 포커스 기능:

  // shouldFocusError 옵션 (기본값: true)
  useForm({
    shouldFocusError: true,  // 검증 실패 시 자동으로 첫 에러 필드에 포커스 ★
  });

  · 기본적으로 활성화되어 있음!
  · register로 등록된 필드의 ref를 통해 포커스
  · 에러가 화면 밖에 있으면 스크롤 + 포커스
  · 스크린 리더 사용자에게 에러 위치를 직접 안내하는 효과
```

### 3.5 Auto-save 설계 원칙

```
Auto-save 설계 원칙

  1. 디바운스: 매 키 입력이 아닌 입력이 멈춘 후 저장
     · 500ms~2000ms 디바운스 권장
     · 타이핑 중에는 저장하지 않음

  2. 검증 통과 시에만 저장
     · 에러가 있는 상태로 서버에 보내지 않음
     · errors가 비어있을 때만 저장 트리거

  3. 상태 표시: "저장 중...", "저장됨", "저장 실패"
     · 사용자가 "내 입력이 저장되고 있다"는 확신 필요
     · Google Docs, Notion 등의 패턴 참고

  4. 오프라인 대응
     · 네트워크 끊김 시 로컬에 임시 저장
     · 네트워크 복구 시 자동 동기화
     · "오프라인 — 연결되면 저장합니다" 표시

  적합한 경우:
    · 프로필 수정, 설정 페이지, 메모/문서 편집
    · 사용자가 "저장 버튼을 누르는 것"이 자연스럽지 않은 경우

  부적합한 경우:
    · 결제 폼 (명시적 제출이 필수)
    · 회원가입 (단계적 제출이 자연스러움)
    · 되돌릴 수 없는 작업
```

### 3.6 성공/실패 피드백 설계

```
제출 성공 피드백:
  · 토스트 알림: "회원가입이 완료되었습니다!" (3초 후 사라짐)
  · 페이지 이동: 성공 후 대시보드로 리다이렉트
  · 인라인 메시지: 폼 위치에 성공 메시지 표시
  · 모달: 중요한 완료(결제 등)에 확인 모달

제출 실패 피드백:
  · 서버 에러 → 폼 상단에 전역 에러 메시지 + 재시도 버튼
  · 필드별 에러 → 해당 필드 아래에 인라인 에러
  · 네트워크 에러 → "네트워크를 확인하세요" + 자동 재시도
  · 중복 에러 → "이미 사용 중인 이메일입니다" (해당 필드에)

  핵심: 에러 메시지만 보여주지 말고 "다음 행동"을 안내한다
    ❌ "서버 오류"
    ✅ "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. [다시 시도]"
```

### 3.7 키보드 네비게이션

```
폼의 키보드 네비게이션 체크리스트

  · Tab으로 모든 필드를 순서대로 이동할 수 있다
  · Shift+Tab으로 역순 이동할 수 있다
  · Enter로 폼을 제출할 수 있다 (button type="submit")
  · Escape로 모달 폼을 닫을 수 있다
  · 포커스가 보이는 스타일이 있다 (outline)
     ❌ outline: none을 남용하지 않는다!
     ✅ :focus-visible로 키보드 포커스만 스타일링
  · 비활성화된 필드는 tabindex에서 제외된다
  · 라디오 버튼 그룹은 화살표 키로 이동한다
  · 자동완성 드롭다운은 화살표 키 + Enter로 선택한다

CSS 포커스 스타일:
  /* 마우스 클릭 시에는 outline 안 보이고, 키보드 탭 시에만 표시 */
  input:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }
```

---

## 4. 사례 연구와 예시

### 4.1 사례: 접근성을 갖춘 FormField 컴포넌트

```tsx
import { useId } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    "aria-required": boolean;
  }) => React.ReactNode;
}

function FormField({
  label,
  error,
  helpText,
  required = false,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  // aria-describedby에 연결할 ID 목록
  const describedBy =
    [error ? errorId : null, helpText ? helpId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      {/* children에 접근성 Props를 전달 */}
      {children({
        id,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
        "aria-required": required,
      })}

      {/* 도움말 텍스트 */}
      {helpText && !error && (
        <p id={helpId} className="help-text">
          {helpText}
        </p>
      )}

      {/* 에러 메시지 — role="alert"로 즉시 읽힘 */}
      {error && (
        <p id={errorId} className="error-text" role="alert">
          <span aria-hidden="true">! </span>
          {error}
        </p>
      )}
    </div>
  );
}

// 사용
<FormField
  label="이메일"
  error={errors.email?.message}
  required
  helpText="업무용 이메일을 입력하세요"
>
  {(fieldProps) => (
    <input
      type="email"
      {...register("email")}
      {...fieldProps}
      placeholder="example@company.com"
    />
  )}
</FormField>;
```

```
생성되는 HTML:

  <div class="form-field">
    <label for=":r0:">
      이메일
      <span class="required" aria-hidden="true"> *</span>
    </label>
    <input
      type="email"
      id=":r0:"                          ← label과 연결
      aria-invalid="true"                ← 에러 상태 알림
      aria-describedby=":r0:-error"      ← 에러 메시지와 연결
      aria-required="true"               ← 필수 항목 알림
      placeholder="example@company.com"
    />
    <p id=":r0:-error" class="error-text" role="alert">
      ! 유효한 이메일을 입력해 주세요
    </p>
  </div>

스크린 리더가 읽는 내용:
  "이메일, 필수 항목, 텍스트 입력, 유효하지 않음,
   유효한 이메일을 입력해 주세요"
  → 시각적 에러를 볼 수 없는 사용자도 에러를 인식할 수 있다! ★
```

### 4.2 사례: 에러 포커스 자동 이동 구현

```tsx
// 검증 실패 시 첫 번째 에러 필드로 자동 포커스
import { useForm } from "react-hook-form";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus, // ★ RHF가 제공하는 포커스 함수
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    await registerUser(data);
  };

  const onError = (errors: FieldErrors<FormValues>) => {
    // 첫 번째 에러 필드로 자동 포커스!
    const firstErrorField = Object.keys(errors)[0] as keyof FormValues;
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      {/* handleSubmit(onValid, onInvalid) — 두 번째 인자가 에러 콜백 */}
      {/* ... */}
    </form>
  );
}
```

### 4.3 사례: 자동 저장 구현

```tsx
import { useForm } from "react-hook-form";
import { useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

function ProfileForm({ userId, initialData }) {
  const {
    register,
    watch,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: initialData,
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
  });

  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'error'

  // watch()로 모든 필드 변경을 감시
  const watchedValues = watch();

  // 디바운스된 저장 함수 (1초 후 실행)
  const debouncedSave = useDebouncedCallback(async (data) => {
    setSaveStatus("saving");
    try {
      await updateProfile(userId, data);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, 1000);

  // 값이 변하면 자동 저장 트리거
  useEffect(() => {
    if (isDirty && Object.keys(errors).length === 0) {
      debouncedSave(watchedValues);
    }
  }, [watchedValues, isDirty, errors]);

  return (
    <form>
      <div className="save-indicator">
        {saveStatus === "saving" && "저장 중..."}
        {saveStatus === "saved" && "저장됨"}
        {saveStatus === "error" && "저장 실패 — 다시 시도 중..."}
      </div>

      <input {...register("name")} />
      <input {...register("bio")} />
      {/* 제출 버튼이 없음 — 자동 저장! */}
    </form>
  );
}
```

### 4.4 사례: 검증 시점에 따른 사용자 경험 차이

```
시나리오: 8개 필드 회원가입 폼, 3개 필드에 에러

  onSubmit만 사용:
    1. 사용자가 8개 필드를 모두 채움 (2분 소요)
    2. [가입] 클릭
    3. 3개 에러 한 번에 표시
    4. "아까 입력한 이메일이 잘못됐었어?" → 스크롤해서 찾아 수정
    5. 다시 [가입] 클릭 → 또 에러? (비밀번호 규칙 미달)
    6. 좌절 → 이탈 가능

  onBlur 사용:
    1. 이름 입력 → [Tab] → OK
    2. 이메일 입력 → [Tab] → "유효하지 않은 이메일" → 바로 수정!
    3. 비밀번호 입력 → [Tab] → "8자 이상 필요" → 바로 수정!
    4. 나머지 필드 → OK
    5. [가입] 클릭 → 에러 없음! → 성공!
    6. 사용자: "에러를 바로바로 알려줘서 좋다" ★
```

### 4.5 사례: 접근성이 없는 폼 vs 있는 폼

```
❌ 접근성 없는 폼 (스크린 리더 사용자 관점):

  <div>
    <span>이메일</span>          ← label이 아님! input과 연결 안 됨
    <input type="email" />       ← 스크린 리더: "텍스트 입력" (무슨 입력인지 모름)
    <span style="color: red">   ← aria 속성 없음
      유효하지 않은 이메일       ← 스크린 리더가 이 에러를 읽지 않음!
    </span>
  </div>

  스크린 리더 사용자: "텍스트 입력... 뭘 입력하라는 거지?"
                      "에러가 있다는데 어디에?"


✅ 접근성 있는 폼:

  <div>
    <label for="email">이메일 <span aria-hidden="true">*</span></label>
    <input id="email" type="email"
           aria-invalid="true"
           aria-describedby="email-error"
           aria-required="true" />
    <p id="email-error" role="alert">
      ! 유효한 이메일을 입력해 주세요
    </p>
  </div>

  스크린 리더: "이메일, 필수 항목, 텍스트 입력, 유효하지 않음,
               유효한 이메일을 입력해 주세요"
  → 에러가 무엇이고, 어떤 필드인지, 어떻게 수정하는지 모두 전달 ★
```

### 4.6 사례: Dirty Indicator와 이탈 방지

```tsx
// 페이지 이탈 시 경고
function UnsavedChangesWarning({ isDirty }) {
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // 브라우저 이탈 경고
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return null;
}

// React Router에서 네비게이션 차단
import { useBlocker } from "react-router-dom";

function EditForm() {
  const {
    formState: { isDirty },
  } = useForm();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  return (
    <>
      {blocker.state === "blocked" && (
        <ConfirmDialog
          message="저장하지 않은 변경 사항이 있습니다. 이동하시겠습니까?"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
      <form>{/* ... */}</form>
    </>
  );
}
```

### 4.7 사례: Progress Indicator — 다단계 폼 진행률

```tsx
function FormProgress({ currentStep, totalSteps, stepLabels }) {
  return (
    <div
      className="form-progress"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      <div className="progress-steps">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`step ${index <= currentStep ? "completed" : ""} ${index === currentStep ? "active" : ""}`}
          >
            <div className="step-number" aria-hidden="true">
              {index + 1}
            </div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <p className="sr-only">
        {totalSteps}단계 중 {currentStep + 1}단계: {stepLabels[currentStep]}
      </p>
    </div>
  );
}
```

### 4.8 사례: 자동 저장이 적합한 UX vs 부적합한 UX

```
✅ 자동 저장이 적합:
  · Notion/Google Docs — 문서 편집
  · 프로필 설정 — 이름, 바이오 변경
  · 환경 설정 — 토글, 선택 옵션
  → "저장 버튼을 누르지 않아도 변경이 반영됨"이 자연스러운 맥락

❌ 자동 저장이 부적합:
  · 결제 폼 — "자동으로 결제되면 안 된다"
  · 회원가입 — 모든 필드를 채운 후 의도적으로 제출해야 함
  · 위험한 변경 — 서버 데이터 삭제, 권한 변경 등
  → "명시적 확인"이 필요한 맥락
```

### 4.9 사례: Zod에서 좋은 에러 메시지 작성

```typescript
// ❌ 기본 메시지 (모호)
z.string().min(8);
// → "String must contain at least 8 character(s)"

// ✅ 한국어 커스텀 메시지 (명확)
z.string().min(8, "비밀번호는 8자 이상이어야 합니다");

// ✅ 형식 안내 포함
z.string().regex(
  /^01[0-9]-\d{3,4}-\d{4}$/,
  "전화번호를 010-1234-5678 형식으로 입력해 주세요",
);
```

### 4.10 사례: 대규모 회원가입 폼의 UX 흐름 설계

```
실제 서비스 수준의 회원가입 폼 UX 흐름

단계 1 — 기본 정보 (Progressive Disclosure):
  ┌─────────────────────────────────────────┐
  │  1단계: 계정 정보        [1/3]          │
  │  ████████░░░░░░░░░░░░░░░░ 33%          │
  │                                         │
  │  이메일 *                               │
  │  [___________________________]          │
  │  비밀번호 *                             │
  │  [___________________________]          │
  │  비밀번호 확인 *                        │
  │  [___________________________]          │
  │                                         │
  │              [다음 단계 →]              │
  └─────────────────────────────────────────┘

단계 2 — 개인 정보:
  · 이전 단계 데이터는 임시 저장 (브라우저 세션)
  · 뒤로 가도 입력값 유지

단계 3 — 약관 동의:
  · 체크박스 그룹에 fieldset + legend 사용 (접근성)
  · 필수/선택 항목 명확히 구분

최종 제출:
  · 전체 폼 검증 후 서버 전송
  · 성공 → 이메일 인증 안내 페이지로 이동
  · 실패 → 오류 발생 단계로 자동 포커스 이동
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: 접근성 FormField 컴포넌트 구현 [Applying]

**목표:** ARIA 속성을 갖춘 재사용 가능한 FormField를 구현한다.

```
요구사항:
  · FormField 컴포넌트: label, error, helpText, required Props
  · useId()로 label-input-error 연결
  · aria-invalid, aria-describedby, aria-required 적용
  · role="alert"로 에러 메시지 즉시 읽힘 보장
  · RHF의 register와 함께 사용 가능한 인터페이스
  · 에러 상태의 시각적 표시 (테두리 색상, 아이콘)

검증:
  · 스크린 리더(NVDA, VoiceOver)로 읽히는 내용 확인
  · 키보드만으로 모든 필드 탐색 가능 확인
  · 포커스 스타일이 :focus-visible에만 적용되는지 확인
```

---

### 실습 2: "관대한 검증" 패턴 구현 [Applying · Analyzing]

**목표:** "제출 전 관대, 제출 후 즉각적" 패턴을 구현한다.

```
요구사항:
  · 회원가입 폼 (이름, 이메일, 비밀번호, 확인)
  · mode: 'onSubmit' + reValidateMode: 'onChange'
  · 첫 제출 전: 필드를 떠나도 에러 표시 안 함
  · 첫 제출 후: 에러 필드 표시 + 첫 에러 포커스
  · 에러 수정 시: 타이핑하는 즉시 에러 사라짐
  · 3가지 mode(onSubmit, onBlur, Submit→onChange)를
    탭으로 전환하며 UX 차이 체험

비교표:
  | 시나리오          | onSubmit | onBlur | Submit→onChange |
  |------------------|---------|--------|----------------|
  | 빈 필드 떠남      | 에러 없음| 에러!  | 에러 없음       |
  | 제출 시           | 에러!   | 에러!  | 에러!          |
  | 에러 수정 중      | 안 사라짐| blur후 | 즉시 사라짐 ★  |
```

---

### 실습 3: 자동 저장 + Dirty Indicator [Applying]

**목표:** 자동 저장과 미저장 변경 경고를 구현한다.

```
요구사항:
  · 프로필 수정 폼 (이름, 바이오, 웹사이트)
  · watch()로 변경 감지 → 1초 디바운스 후 자동 저장
  · 저장 상태 표시: "저장됨" / "저장 중..." / "저장 실패"
  · isDirty 기반 미저장 경고:
    - 브라우저 탭 닫기 시 경고 (beforeunload)
    - 페이지 이동 시 확인 다이얼로그
  · 검증 에러가 있으면 저장하지 않음
  · 저장 성공 시 isDirty를 false로 리셋
```

---

### 실습 4 (선택): 폼 접근성 감사(Audit) [Evaluating]

**목표:** 기존 폼의 접근성을 평가하고 개선한다.

```
과제:
  Step 32에서 만든 회원가입 폼을 접근성 기준으로 감사하라.

  체크리스트:
  □ 모든 input에 연결된 <label>이 있는가?
  □ aria-invalid가 에러 시 적용되는가?
  □ aria-describedby로 에러 메시지가 연결되는가?
  □ 에러 메시지에 role="alert"가 있는가?
  □ 필수 필드에 aria-required가 있는가?
  □ 키보드만으로 모든 조작이 가능한가?
  □ 포커스 스타일이 보이는가?
  □ 에러 시 첫 에러 필드로 포커스가 이동하는가?
  □ 에러 메시지가 "무엇이, 왜, 어떻게"를 포함하는가?
  □ 색상만으로 에러를 구분하지 않는가? (아이콘/텍스트 병행)

  발견된 문제와 해결 방법을 보고서로 작성하라.
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약

```
┌──────────────────────────────────────────────────────────────┐
│                      Step 33 핵심 요약                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 검증 시점 전략이 UX를 결정한다                            │
│     → onSubmit: 가장 단순, 제출 후에야 에러 인지             │
│     → onBlur: 필드 떠날 때 피드백 (대부분 권장) ★            │
│     → Submit→onChange: 제출 전 관대, 수정 시 즉각적 (최고 UX)│
│     → RHF: mode + reValidateMode로 전략 설정                 │
│                                                               │
│  2. 에러 메시지 4원칙: 무엇/왜/어떻게 + 정중한 톤            │
│     → 해당 필드 바로 아래에 표시                             │
│     → 아이콘 + 텍스트 (색상만으로 구분 금지)                 │
│     → 에러 공간을 미리 확보하여 CLS 방지                     │
│                                                               │
│  3. 폼 접근성의 최소 요구사항                                 │
│     → label + htmlFor로 input 연결                           │
│     → aria-invalid: 에러 상태 알림                           │
│     → aria-describedby: 에러/도움말 텍스트 연결              │
│     → role="alert": 에러 메시지 즉시 읽힘                   │
│     → 키보드만으로 모든 조작 가능                            │
│     → :focus-visible로 키보드 포커스 스타일                  │
│                                                               │
│  4. 에러 포커스 자동 이동                                     │
│     → 검증 실패 시 첫 에러 필드로 자동 포커스               │
│     → RHF: shouldFocusError (기본 true)                     │
│     → 스크린 리더 사용자에게 에러 위치 직접 안내             │
│                                                               │
│  5. 자동 저장 = 디바운스 + watch + 검증 통과 시에만          │
│     → 프로필, 설정, 문서 편집에 적합                        │
│     → 결제, 회원가입 등 명시적 제출이 필요한 경우 부적합     │
│     → 저장 상태 표시 필수 ("저장됨" / "저장 중...")           │
│                                                               │
│  6. Dirty Indicator + 이탈 경고                               │
│     → isDirty: 초기값에서 변경 여부                          │
│     → beforeunload: 브라우저 이탈 경고                      │
│     → useBlocker: 라우트 이동 차단 + 확인 다이얼로그        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 자가진단 퀴즈

| #   | 질문                                                                  | 블룸 단계  | 확인할 섹션 |
| --- | --------------------------------------------------------------------- | ---------- | ----------- |
| 1   | aria-invalid와 aria-describedby가 각각 스크린 리더에 전달하는 정보는? | Remember   | 3.3         |
| 2   | onBlur 검증이 onSubmit보다 나은 사용자 경험을 제공하는 이유는?        | Understand | 3.1         |
| 3   | "관대한 검증" 패턴의 mode와 reValidateMode 설정은?                    | Apply      | 3.1         |
| 4   | role="alert"가 에러 메시지에 필요한 이유는?                           | Understand | 3.3         |
| 5   | 자동 저장에서 디바운스가 필요한 이유와 적절한 지연 시간은?            | Apply      | 3.5         |
| 6   | 에러 메시지를 색상만으로 표시하면 안 되는 이유는?                     | Analyze    | 3.2         |
| 7   | 결제 폼에 자동 저장이 부적합한 이유는?                                | Evaluate   | 3.5         |
| 8   | 키보드 접근성에서 outline: none을 남용하면 안 되는 이유와 대안은?     | Evaluate   | 3.7         |

### 6.3 자주 묻는 질문 (FAQ)

**Q1: 인라인 검증(onBlur)과 "관대한 검증"(onSubmit + reValidateMode: onChange) 중 어느 것을 선택해야 하나요?**

A: 대부분의 경우 "관대한 검증" 패턴이 최고의 UX를 제공합니다. 사용자가 처음 폼을 채울 때는 방해하지 않고, 제출 후에는 즉각적 피드백을 제공하기 때문입니다. 다만, 필드 수가 많은 폼(10개 이상)에서는 onBlur가 더 나을 수 있습니다. 사용자가 모든 필드를 채운 후 제출 시 한꺼번에 많은 에러를 보는 것보다, 진행하면서 하나씩 수정하는 것이 덜 좌절스럽기 때문입니다.

**Q2: aria-describedby와 aria-errormessage의 차이는 무엇인가요?**

A: `aria-describedby`는 필드를 설명하는 모든 요소(도움말 텍스트, 에러 메시지 등)를 연결할 수 있는 범용 속성입니다. `aria-errormessage`는 에러 메시지 전용 속성으로, `aria-invalid="true"`와 함께 사용해야만 스크린 리더가 읽습니다. 현재 브라우저/스크린 리더 지원 수준을 고려하면 `aria-describedby`가 더 안정적인 선택입니다.

**Q3: 자동 저장에서 네트워크 에러가 발생하면 어떻게 처리하나요?**

A: 지수 백오프(Exponential Backoff)로 재시도하는 것이 일반적입니다. 1초 → 2초 → 4초 간격으로 재시도하되, 최대 3~5회까지만 시도합니다. 동시에 사용자에게 "저장 실패 — 다시 시도 중..." 메시지를 표시하고, 최종 실패 시 로컬 스토리지에 임시 저장하여 데이터 손실을 방지합니다.

**Q4: 폼 접근성 테스트를 위한 최소한의 도구는 무엇인가요?**

A: 세 가지를 추천합니다. (1) 키보드만으로 폼 전체를 탐색해보는 수동 테스트, (2) axe DevTools Chrome 확장으로 자동 접근성 감사, (3) macOS의 VoiceOver 또는 Windows의 NVDA로 스크린 리더 테스트. 이 중 (1)번은 도구 없이도 즉시 수행할 수 있으며 가장 많은 문제를 발견합니다.

**Q5: Progressive Disclosure를 적용하면 SEO에 불리하지 않나요?**

A: 다단계 폼에서 숨겨진 필드가 검색 엔진 크롤러에 노출되지 않을 수 있다는 우려가 있지만, 대부분의 폼 데이터는 크롤러가 색인할 대상이 아닙니다. 오히려 폼 완료율 향상으로 인한 전환율 개선이 비즈니스 지표에 훨씬 큰 영향을 미칩니다. 단, 폼과 함께 표시되는 콘텐츠(설명 텍스트, 혜택 안내 등)는 시맨틱 HTML로 마크업하여 크롤러가 인식하도록 합니다.

---

## 7. 다음 단계 예고

> **Step 34. CSS 전략과 스타일링 아키텍처**
>
> - CSS Modules, Tailwind CSS, CSS-in-JS 비교
> - Tailwind CSS의 유틸리티 퍼스트 철학
> - 디자인 토큰과 테마 시스템 설계
> - 반응형 디자인 패턴
> - 컴포넌트 라이브러리(shadcn/ui) 활용

---

## 📚 참고 자료

- [React Hook Form — shouldFocusError](https://react-hook-form.com/docs/useform#shouldFocusError)
- [MDN — ARIA: form role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/form_role)
- [MDN — aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid)
- [MDN — aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby)
- [Web.dev — Building accessible forms](https://web.dev/learn/accessibility/forms)
- [W3C — Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [NNG — Inline Validation in Web Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

---

> **React 완성 로드맵 v2.0** | Phase 5 — 타입 안전성·폼·스타일링 | Step 33 of 42
