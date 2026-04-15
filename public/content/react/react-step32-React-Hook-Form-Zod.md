# Step 32. React Hook Form과 Zod 검증

> **Phase 5 — 타입 안전성·폼·스타일링 (Step 31~35)**
> 타입 안전성, 폼 관리, 스타일링으로 프로덕션 품질을 완성한다

> **난이도:** 🔴 고급 (Advanced)

---

## 📌 학습 목표 (Bloom's Taxonomy 기반)

| 블룸 단계      | 목표                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| **Remember**   | React Hook Form의 핵심 API(useForm, register, handleSubmit, formState)를 기술할 수 있다 |
| **Understand** | RHF가 Uncontrolled 기반으로 성능을 최적화하는 원리를 설명할 수 있다                     |
| **Understand** | Zod 스키마가 런타임 검증과 TypeScript 타입 추론을 동시에 제공하는 원리를 설명할 수 있다 |
| **Apply**      | RHF + Zod + zodResolver로 타입 안전한 폼을 구현할 수 있다                               |
| **Analyze**    | useState 기반 수동 폼 관리와 RHF의 성능·코드량·DX 차이를 분석할 수 있다                 |
| **Evaluate**   | 프로젝트에서 RHF 도입이 필요한 시점과 불필요한 시점을 판단할 수 있다                    |

**전제 지식:**

- Step 6: useState, Controlled Component
- Step 8: Form, Synthetic Event, 폼 제출·검증
- Step 13: useReducer (복합 폼 State)
- Step 14: 리렌더링, 성능 최적화
- Step 31: TypeScript (Props 타입, 유틸리티 타입)

---

## 1. 서론 — useState로 폼을 관리하는 것의 한계

### 1.1 폼 관리의 역사적 발전

웹 개발에서 폼(Form)은 가장 복잡한 UI 패턴 중 하나다. 단순한 로그인 폼조차 입력 값 관리, 검증 규칙 적용, 에러 메시지 표시, 제출 상태 처리라는 최소 네 가지 관심사를 동시에 다루어야 한다. 여기에 실무 수준의 회원가입 폼, 주문 폼, 보험 신청서 같은 복잡한 폼이 더해지면 관리해야 할 상태와 로직의 양은 기하급수적으로 늘어난다.

초창기 jQuery 시대에는 폼 제출 시 DOM에서 값을 직접 읽어 서버에 전송했다. React가 등장하면서 `useState`로 모든 입력 값을 React State에 동기화하는 "Controlled Component" 패턴이 표준이 되었다. 이 패턴은 예측 가능하고 테스트하기 쉽다는 장점이 있지만, 매 키 입력마다 컴포넌트 전체가 리렌더링된다는 성능 비용을 수반한다.

Formik(2017)이 폼 관리의 복잡성을 추상화하는 첫 번째 주요 라이브러리로 등장했고, React Hook Form(2019)이 "Uncontrolled 방식으로 성능을 극적으로 개선"한다는 컨셉으로 빠르게 채택되었다. 현재 React Hook Form은 주간 다운로드 수 900만을 넘는 React 생태계의 사실상 표준 폼 라이브러리가 되었다. 여기에 Zod(2020)가 "TypeScript-first 런타임 검증"이라는 개념으로 등장하면서, RHF + Zod 조합은 타입 안전한 폼 개발의 황금 표준으로 자리잡았다.

### 1.2 수동 폼 관리의 현실

Step 8에서 Controlled Component로 폼을 관리했고, Step 13에서 useReducer로 개선했다. 그러나 실무 폼은 더 복잡하다.

```jsx
// ❌ 수동 폼 관리 — 회원가입 폼
function RegisterForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!values.name) e.name = "이름을 입력하세요";
    if (!values.email) e.email = "이메일을 입력하세요";
    else if (!/\S+@\S+\.\S+/.test(values.email))
      e.email = "유효한 이메일을 입력하세요";
    if (!values.password) e.password = "비밀번호를 입력하세요";
    else if (values.password.length < 8) e.password = "8자 이상 입력하세요";
    if (values.password !== values.confirm)
      e.confirm = "비밀번호가 일치하지 않습니다";
    return e;
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await register(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 문제 목록:
  // · State 4개 (values, errors, touched, isSubmitting)
  // · validate 함수를 수동 작성 (타입 안전성 없음)
  // · 매 키 입력마다 전체 컴포넌트 리렌더링 (Controlled)
  // · touched + errors 조합 로직 반복
  // · 필드 추가 시 validate, handleChange 등 모두 수정
  // · 배열 필드(동적 추가/삭제) 구현이 매우 어려움
}
```

### 1.3 React Hook Form이 해결하는 것


![수동 폼의 한계              RHF의 해결](/developer-open-book/diagrams/react-step32-수동-폼의-한계-rhf의-해결.svg)


### 1.4 개념 지도


![RHF + Zod 아키텍처 개념 지도](/developer-open-book/diagrams/react-step32-rhf-zod-아키텍처-개념-지도.svg)


### 1.5 이 Step에서 다루는 범위


![다루는 것](/developer-open-book/diagrams/react-step32-다루는-것.svg)


---

## 2. 기본 개념과 용어

### 2.1 핵심 용어 사전

| 용어              | 정의                                                                                            | 왜 중요한가                                      |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **useForm**       | RHF의 핵심 Hook. **폼의 모든 상태와 메서드를 반환**한다                                         | register, handleSubmit, formState 등을 제공      |
| **register**      | input을 RHF에 **등록**하는 함수. `{...register('name')}`으로 name, ref, onChange, onBlur를 주입 | Uncontrolled 방식으로 DOM에서 직접 값을 읽음     |
| **handleSubmit**  | 폼 제출 시 **검증을 실행하고 유효한 데이터만** 콜백에 전달하는 래퍼                             | 검증 통과 → onValid 호출, 실패 → errors 업데이트 |
| **formState**     | 폼의 **현재 상태**를 담은 객체. errors, isSubmitting, isDirty, isValid 등                       | 에러 표시, 버튼 비활성화, 상태 피드백에 활용     |
| **Zod**           | TypeScript-first **스키마 검증 라이브러리**. 스키마 정의 → 런타임 검증 + 타입 추론 동시 달성    | "검증 코드 = 타입 정의"로 중복 제거              |
| **zodResolver**   | Zod 스키마를 RHF의 **검증기(resolver)로 연결**하는 어댑터                                       | RHF + Zod를 결합하는 접착제                      |
| **Controller**    | Controlled 방식의 외부 UI 라이브러리(Select, DatePicker 등)를 **RHF와 연동**하는 래퍼           | register가 적용되지 않는 커스텀 컴포넌트용       |
| **useFieldArray** | **배열 형태의 필드**(동적 추가/삭제)를 관리하는 Hook                                            | 주문 항목, 태그 목록 등 동적 필드에 필수         |

### 2.2 RHF의 동작 원리 개요

Controlled vs Uncontrolled의 차이는 "값이 어디에 저장되는가"의 차이다. Controlled는 React State에, Uncontrolled는 DOM에 값이 저장된다. React State가 변경되면 리렌더링이 발생하지만 DOM은 값이 바뀌어도 React 렌더링 사이클과 무관하다. RHF는 이 특성을 활용하여 입력 성능을 극적으로 향상시킨다.


![React Hook Form의 동작 원리](/developer-open-book/diagrams/react-step32-react-hook-form의-동작-원리.svg)


### 2.3 Zod의 핵심 아이디어 — "스키마 하나로 검증과 타입을"

기존 방식에서는 TypeScript 타입 정의와 런타임 검증 로직을 별도로 관리해야 했다. 타입은 컴파일 타임에만 존재하고 런타임에서는 사라지기 때문이다. 이 이중 관리는 타입과 검증 규칙 사이의 불일치(타입에는 "양수"라고 표현할 수 없지만 검증에서는 필요한 경우 등)를 야기하는 근본 원인이었다.

Zod는 스키마를 정의하면 그 스키마에서 TypeScript 타입을 추출(`z.infer`)할 수 있게 함으로써 이 문제를 해결했다. 스키마가 "단일 진실의 근원(Single Source of Truth)"이 되어 검증과 타입이 항상 일치한다.

### 2.4 검증 시점 전략의 중요성

폼의 UX는 "언제 검증 피드백을 제공하는가"에 크게 좌우된다. 너무 이르면(onBlur 전 onChange) 사용자가 입력하는 도중 에러가 표시되어 거슬리고, 너무 늦으면(제출 후에만) 피드백이 늦어 UX가 나쁘다. RHF는 `mode` 옵션으로 검증 시점을 제어할 수 있어 폼의 성격에 따라 최적 UX를 설계할 수 있다.

---

## 3. 이론과 원리

### 3.1 React Hook Form 기본 사용법

#### 최소 예제

```tsx
import { useForm } from "react-hook-form";

interface LoginFormValues {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    register, // input 등록
    handleSubmit, // 제출 래퍼
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    // data는 검증을 통과한 안전한 데이터
    console.log(data); // { email: '...', password: '...' }
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register("email", {
            required: "이메일을 입력하세요",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "유효한 이메일을 입력하세요",
            },
          })}
          placeholder="이메일"
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <input
          type="password"
          {...register("password", {
            required: "비밀번호를 입력하세요",
            minLength: { value: 8, message: "8자 이상 입력하세요" },
          })}
          placeholder="비밀번호"
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
```


![register('email', { rules })가 반환하는 것](/developer-open-book/diagrams/react-step32-register-email-rules-가-반환하는-것.svg)


#### formState 활용

```tsx
const {
  formState: {
    errors, // 필드별 에러 객체 { email: { message: '...' } }
    isSubmitting, // 제출 중인가
    isDirty, // 초기값에서 변경이 있는가
    isValid, // 모든 검증을 통과했는가 (mode에 따라)
    touchedFields, // 어떤 필드가 터치(blur)되었는가
    dirtyFields, // 어떤 필드가 변경되었는가
    submitCount, // 제출 시도 횟수
  },
} = useForm<FormValues>({
  mode: "onBlur", // 검증 시점: 'onSubmit' | 'onBlur' | 'onChange' | 'all'
  defaultValues: { email: "", password: "" },
});
```


![검증 모드 (mode)](/developer-open-book/diagrams/react-step32-검증-모드-mode.svg)


### 3.2 Zod — 스키마 기반 검증 + 타입 추론

#### Zod의 핵심 아이디어


!["스키마를 한 번 정의하면 검증 + 타입이 동시에 나온다"](/developer-open-book/diagrams/react-step32-스키마를-한-번-정의하면-검증-타입이-동시에-나온다.svg)


#### Zod 스키마 기본 문법

```typescript
import { z } from "zod";

// 기본 타입
const nameSchema = z.string();
const ageSchema = z.number();
const isActiveSchema = z.boolean();
const roleSchema = z.enum(["admin", "user"]); // 'admin' | 'user'

// 문자열 검증 체인
const emailSchema = z
  .string()
  .email("유효한 이메일을 입력하세요")
  .min(1, "이메일을 입력하세요");

const passwordSchema = z
  .string()
  .min(8, "8자 이상 입력하세요")
  .max(100, "100자 이하로 입력하세요")
  .regex(/[A-Z]/, "대문자를 포함하세요")
  .regex(/[0-9]/, "숫자를 포함하세요");

// 숫자 검증
const priceSchema = z
  .number()
  .min(0, "0 이상이어야 합니다")
  .max(1000000, "100만원 이하");

// 객체 스키마
const registerSchema = z
  .object({
    name: z.string().min(1, "이름을 입력하세요"),
    email: z.string().email("유효한 이메일을 입력하세요"),
    password: passwordSchema,
    confirmPassword: z.string(),
    age: z.number().min(14, "14세 이상만 가입 가능합니다").optional(),
    terms: z.boolean().refine((val) => val === true, "약관에 동의해야 합니다"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"], // 에러를 표시할 필드
  });

// 타입 추출
type RegisterFormValues = z.infer<typeof registerSchema>;
// {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   age?: number | undefined;
//   terms: boolean;
// }
```

### 3.3 RHF + Zod 통합: zodResolver

#### 완전한 예제

`zodResolver`는 Zod 스키마를 RHF가 이해할 수 있는 resolver 함수로 변환하는 어댑터다. RHF의 `handleSubmit`이 호출될 때 DOM에서 수집한 값을 Zod 스키마로 검증하고, 에러가 있으면 `formState.errors`에 반영한다.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Zod 스키마 정의 (검증 + 타입 = 하나의 소스)
const registerSchema = z
  .object({
    name: z.string().min(1, "이름을 입력하세요"),
    email: z.string().email("유효한 이메일을 입력하세요"),
    password: z.string().min(8, "8자 이상 입력하세요"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

// 2. 스키마에서 타입 추출
type RegisterFormValues = z.infer<typeof registerSchema>;

// 3. 컴포넌트
function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema), // Zod 스키마를 resolver로 연결!
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    // data는 Zod 검증을 통과한 안전한 데이터!
    try {
      await registerUser(data);
      reset();
    } catch (err) {
      // 서버 에러를 특정 필드에 표시
      if (err.code === "EMAIL_EXISTS") {
        setError("email", { message: "이미 사용 중인 이메일입니다" });
      } else {
        setError("root", { message: "회원가입에 실패했습니다" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root && <div className="form-error">{errors.root.message}</div>}

      <Field label="이름" error={errors.name?.message}>
        <input {...register("name")} />
      </Field>

      <Field label="이메일" error={errors.email?.message}>
        <input type="email" {...register("email")} />
      </Field>

      <Field label="비밀번호" error={errors.password?.message}>
        <input type="password" {...register("password")} />
      </Field>

      <Field label="비밀번호 확인" error={errors.confirmPassword?.message}>
        <input type="password" {...register("confirmPassword")} />
      </Field>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "처리 중..." : "회원가입"}
      </button>
    </form>
  );
}

// 재사용 가능한 Field 래퍼
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```


![RHF + Zod의 흐름](/developer-open-book/diagrams/react-step32-rhf-zod의-흐름.svg)


### 3.4 Controller — 외부 UI 컴포넌트 연동

`register`는 HTML 표준 input 요소에서만 동작한다. 자체적인 `value`와 `onChange` 인터페이스를 가진 커스텀 UI 컴포넌트(DatePicker, Slider, Rich Text Editor 등)에는 `Controller`를 사용한다.

```tsx
import { Controller, useForm } from "react-hook-form";

function ProfileForm() {
  const { control, handleSubmit, register } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 일반 input — register 사용 */}
      <input {...register("name")} />

      {/* 커스텀 Select — Controller 사용 */}
      <Controller
        name="role"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <CustomSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={["admin", "user", "editor"]}
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />

      {/* 커스텀 DatePicker — Controller 사용 */}
      <Controller
        name="birthday"
        control={control}
        render={({ field }) => (
          <DatePicker selected={field.value} onChange={field.onChange} />
        )}
      />
    </form>
  );
}
```


![register vs Controller 선택 기준](/developer-open-book/diagrams/react-step32-register-vs-controller-선택-기준.svg)


### 3.5 useFieldArray — 동적 배열 필드

동적 배열 필드는 수동으로 구현하기 가장 까다로운 패턴이다. 항목 추가/삭제 시 인덱스 재계산, 각 항목의 고유 키 관리, 중첩된 검증 에러 처리를 모두 직접 관리해야 한다. `useFieldArray`는 이 모든 복잡성을 추상화한다.

```tsx
import { useForm, useFieldArray } from "react-hook-form";

const orderSchema = z.object({
  customerName: z.string().min(1, "이름을 입력하세요"),
  items: z
    .array(
      z.object({
        productName: z.string().min(1, "상품명을 입력하세요"),
        quantity: z.number().min(1, "1개 이상"),
        price: z.number().min(0),
      }),
    )
    .min(1, "최소 1개 항목이 필요합니다"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

function OrderForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      items: [{ productName: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("customerName")} placeholder="주문자 이름" />

      <h3>주문 항목</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="order-item">
          <input
            {...register(`items.${index}.productName`)}
            placeholder="상품명"
          />
          <input
            type="number"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            placeholder="수량"
          />
          <input
            type="number"
            {...register(`items.${index}.price`, { valueAsNumber: true })}
            placeholder="가격"
          />
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(index)}>
              삭제
            </button>
          )}
          {errors.items?.[index]?.productName && (
            <span className="error">
              {errors.items[index].productName.message}
            </span>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ productName: "", quantity: 1, price: 0 })}
      >
        항목 추가
      </button>
      {errors.items?.root && (
        <span className="error">{errors.items.root.message}</span>
      )}

      <button type="submit">주문</button>
    </form>
  );
}
```

```
useFieldArray의 핵심

  · fields: 현재 배열의 항목 목록 (각각 고유 id 포함)
  · append(item): 배열 끝에 항목 추가
  · remove(index): 특정 인덱스 항목 삭제
  · insert(index, item): 특정 위치에 삽입
  · move(from, to): 항목 순서 변경 (드래그 앤 드롭)
  · swap(a, b): 두 항목의 위치 교환
  · prepend(item): 배열 앞에 추가

  수동 구현 대비:
    · State 관리, 인덱스 추적, key 관리를 자동화
    · register가 'items.0.name', 'items.1.name' 형태로 중첩 필드 지원
    · Zod의 z.array() 스키마와 자연스럽게 결합
```

### 3.6 다단계 폼(Multi-step Form)

다단계 폼의 핵심 과제는 "현재 단계만 검증하되 전체 데이터는 유지"하는 것이다. RHF의 `trigger(fieldNames)` API가 이를 가능하게 한다. 특정 필드 이름 배열을 전달하면 그 필드들만 검증하고 결과를 반환한다.

```tsx
// 스텝별 스키마를 분리하여 단계적 검증
const step1Schema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  email: z.string().email("유효한 이메일을 입력하세요"),
});

const step2Schema = z.object({
  address: z.string().min(1, "주소를 입력하세요"),
  phone: z
    .string()
    .regex(/^01[0-9]-\d{3,4}-\d{4}$/, "유효한 전화번호를 입력하세요"),
});

const step3Schema = z.object({
  cardNumber: z.string().length(16, "16자리 카드번호를 입력하세요"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY 형식"),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FullFormValues = z.infer<typeof fullSchema>;

const schemas = [step1Schema, step2Schema, step3Schema];

function MultiStepForm() {
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FullFormValues>({
    resolver: zodResolver(fullSchema),
    mode: "onBlur",
  });

  const handleNext = async () => {
    // 현재 스텝의 필드만 검증
    const fieldsToValidate = Object.keys(
      schemas[step].shape,
    ) as (keyof FullFormValues)[];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FullFormValues) => {
    await submitOrder(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {step === 0 && (
        <div>
          <h2>1단계: 기본 정보</h2>
          <input {...register("name")} placeholder="이름" />
          {errors.name && <span>{errors.name.message}</span>}
          <input {...register("email")} placeholder="이메일" />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
      )}
      {step === 1 && (
        <div>
          <h2>2단계: 배송 정보</h2>
          <input {...register("address")} placeholder="주소" />
          <input {...register("phone")} placeholder="전화번호" />
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>3단계: 결제 정보</h2>
          <input {...register("cardNumber")} placeholder="카드번호" />
          <input {...register("expiry")} placeholder="유효기간" />
        </div>
      )}

      <div className="actions">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)}>
            이전
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={handleNext}>
            다음
          </button>
        ) : (
          <button type="submit">결제</button>
        )}
      </div>
    </form>
  );
}
```

```
다단계 폼의 핵심 패턴

  · 전체 스키마를 step별로 분리하여 정의
  · trigger(fieldNames)로 현재 스텝의 필드만 부분 검증
  · 전체 폼 데이터는 하나의 useForm에서 관리
  · 스텝 전환 시에도 이전 스텝 데이터가 유지됨
  · 최종 제출 시 fullSchema로 전체 검증
```

### 3.7 수동 폼 vs RHF+Zod 비교


![수동 (useState)     │  RHF + Zod](/developer-open-book/diagrams/react-step32-수동-usestate-rhf-zod.svg)


---

## 4. 사례 연구와 예시

### 4.1 사례: 리렌더링 비교 — 10필드 폼

이 사례는 Controlled vs Uncontrolled의 성능 차이를 측정 가능한 수치로 보여준다. React DevTools Profiler나 직접 콘솔 로그로 렌더링 횟수를 확인할 수 있다.


![시나리오: 10개 필드가 있는 프로필 수정 폼](/developer-open-book/diagrams/react-step32-시나리오-10개-필드가-있는-프로필-수정-폼.svg)


### 4.2 사례: Zod로 "타입 정의 = 검증" 통합

타입과 검증의 불일치는 실무에서 실제로 자주 발생하는 문제다. 개발 초기에 타입을 정의하고 나서 나중에 검증 로직을 추가할 때, 또는 비즈니스 규칙이 바뀌어 검증은 수정했지만 타입은 수정하지 않은 경우다.

```tsx
// ❌ Before: 타입과 검증이 분리 → 불일치 위험
interface UserForm {
  name: string;
  age: number; // 타입은 number (범위 없음)
  email: string;
}

function validate(data: UserForm) {
  if (data.age < 0) return "age must be positive"; // 검증에는 범위 있음
  // 타입 정의에는 "양수" 조건이 없음 → 불일치!
}

// ✅ After: Zod 스키마 하나로 통합
const userSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0, "0 이상이어야 합니다"), // 타입 + 검증이 하나에!
  email: z.string().email(),
});

type UserForm = z.infer<typeof userSchema>;
// { name: string; age: number; email: string; }
// 타입과 검증이 절대 불일치할 수 없다!
```

### 4.3 사례: 서버 에러와 클라이언트 에러 통합

실무에서 서버는 클라이언트가 사전에 감지할 수 없는 에러를 반환할 수 있다. 이메일 중복, 닉네임 중복, 결제 실패 등이 해당된다. `setError` API를 사용하면 서버 에러를 클라이언트 에러와 동일한 방식으로 UI에 표시할 수 있어 사용자 입장에서 일관된 경험을 제공한다.

```tsx
const onSubmit = async (data: RegisterFormValues) => {
  try {
    await registerUser(data);
  } catch (error) {
    if (error instanceof ApiError) {
      // 서버가 필드별 에러를 반환하는 경우
      if (error.details) {
        Object.entries(error.details).forEach(([field, message]) => {
          setError(field as keyof RegisterFormValues, { message });
        });
      }
      // 폼 전체 에러
      else {
        setError("root", { message: error.message });
      }
    }
  }
};

// setError로 설정한 에러는 formState.errors에 통합되어
// 클라이언트 검증 에러와 동일한 방식으로 UI에 표시됨
// → 사용자 입장에서 에러 출처의 구분 없이 일관된 UX ★
```

---

## 5. 실습

> 🔗 [StackBlitz에서 실행](https://stackblitz.com/)

### 실습 1: RHF + Zod 기본 폼 구현 [Applying]

**목표:** RHF와 Zod를 결합하여 타입 안전한 폼을 구현한다.

```
요구사항:
  · 회원가입 폼: 이름, 이메일, 비밀번호, 비밀번호 확인, 약관 동의
  · Zod 스키마: 모든 필드 검증 + 비밀번호 일치 확인(.refine)
  · z.infer로 타입 추출 (별도 interface 작성 금지)
  · zodResolver로 연결
  · mode: 'onBlur' — 필드 떠날 때 검증
  · 필드별 에러 메시지 표시
  · isSubmitting 동안 버튼 비활성화
  · 성공 시 reset()으로 폼 초기화

비교: 같은 폼을 useState로도 구현하고 코드 줄 수 비교
```

---

### 실습 2: useFieldArray로 동적 폼 [Applying]

**목표:** 배열 필드를 관리하는 동적 폼을 구현한다.

```
요구사항:
  · 이력서 폼:
    - 기본 정보: 이름, 이메일, 전화번호
    - 경력 사항: 동적 배열 (회사명, 직책, 기간)
      - 추가 / 삭제 / 최소 1개 필수
    - 기술 스택: 동적 배열 (기술명, 숙련도 1~5)
  · Zod 스키마에 z.array() + .min(1) 적용
  · 배열 항목의 개별 필드 검증
  · 빈 항목 추가 시 기본값 설정
```

---

### 실습 3: 다단계 폼 구현 [Applying · Analyzing]

**목표:** 단계적 검증이 있는 멀티스텝 폼을 구현한다.

```
요구사항:
  · 3단계 주문 폼:
    Step 1: 개인 정보 (이름, 이메일, 전화번호)
    Step 2: 배송 정보 (주소, 상세주소, 우편번호)
    Step 3: 결제 정보 (카드번호, 유효기간, CVC)
  · 각 스텝에 독립적 Zod 스키마 + 전체 스키마(.merge)
  · trigger()로 현재 스텝만 부분 검증
  · "이전" 버튼으로 이전 스텝 이동 시 데이터 유지
  · 진행 표시기 (Step 1/3, 2/3, 3/3)
  · 최종 제출 시 전체 데이터 출력

분석: trigger()가 없다면 다단계 검증을 어떻게 구현해야 하는가?
```

---

### 실습 4 (선택): RHF 도입 판단 연습 [Evaluating]

**목표:** 프로젝트에서 RHF가 필요한 시점을 판단한다.

```
아래 8가지 시나리오에서 "RHF 도입 필요"/"useState 충분"을 판단하고 근거를 제시하라.

1. 검색바 — input 하나, Enter로 검색
2. 로그인 폼 — 이메일 + 비밀번호
3. 회원가입 폼 — 10개 필드 + 복잡한 검증 + 약관 동의
4. 설정 페이지 — 토글 3개 (알림, 다크모드, 언어)
5. 상품 리뷰 작성 — 별점(1~5) + 텍스트 + 이미지 업로드
6. 관리자 상품 등록 — 20개 필드 + 동적 옵션 + 이미지 다수
7. 댓글 입력 — textarea 하나 + 제출 버튼
8. 보험 가입 신청서 — 30개+ 필드 + 4단계 + 조건부 필드
```

---

## 6. 핵심 정리와 자가진단

### 6.1 핵심 요약


![Step 32 핵심 요약](/developer-open-book/diagrams/react-step32-step-32-핵심-요약.svg)


### 6.2 자가진단 퀴즈

| #   | 질문                                                                | 블룸 단계  | 확인할 섹션 |
| --- | ------------------------------------------------------------------- | ---------- | ----------- |
| 1   | register가 반환하는 4가지 속성은?                                   | Remember   | 3.1         |
| 2   | RHF가 Uncontrolled 방식으로 리렌더링을 최소화하는 원리는?           | Understand | 2.2         |
| 3   | z.infer<typeof schema>가 "타입과 검증의 불일치를 방지"하는 원리는?  | Understand | 3.2         |
| 4   | register 대신 Controller를 사용해야 하는 경우는?                    | Apply      | 3.4         |
| 5   | .refine()으로 "비밀번호 확인" 교차 검증을 구현하는 방법은?          | Apply      | 3.3         |
| 6   | useState 기반 10필드 폼과 RHF 10필드 폼의 리렌더링 횟수 차이는?     | Analyze    | 4.1         |
| 7   | 다단계 폼에서 trigger()가 전체 스키마 대신 부분 검증을 하는 방법은? | Apply      | 3.6         |
| 8   | 검색 input 하나에 RHF를 적용하는 것이 과도한 이유는?                | Evaluate   | 3.7         |

### 6.3 FAQ

**Q1. Zod의 `parse`와 `safeParse`는 무엇이 다른가요?**

`parse`는 검증 실패 시 `ZodError`를 throw한다. `safeParse`는 검증 결과를 `{ success: true, data }` 또는 `{ success: false, error }` 형태의 객체로 반환하여 throw하지 않는다. RHF와 함께 사용할 때는 `zodResolver`가 내부적으로 `safeParse`를 사용한다. API 응답 검증 같이 throw 없이 처리해야 하는 경우에는 `safeParse`를 직접 사용한다.

**Q2. `mode: 'onChange'`는 언제 사용하는 것이 적합한가요?**

비밀번호 강도 측정기처럼 사용자가 입력하는 즉시 피드백이 필요한 경우에 적합하다. 그러나 `mode: 'onChange'`는 매 입력마다 Zod 스키마로 검증을 실행하므로 복잡한 스키마에서는 성능 비용이 있다. 대부분의 폼에서는 `mode: 'onBlur'`가 UX와 성능의 균형을 잘 맞춘다. 제출 후에는 모드에 관계없이 `'onChange'`로 자동 전환되어 즉각적 피드백을 제공한다.

**Q3. `reset()`을 호출하면 어떤 값으로 초기화되나요?**

`reset()`을 인자 없이 호출하면 `useForm`의 `defaultValues`로 초기화된다. `reset(newValues)`처럼 새로운 값을 전달하면 그 값으로 초기화되고 이후 `isDirty` 비교의 기준값이 된다. 수정 폼에서 서버에서 데이터를 불러온 후 `reset(serverData)`를 호출하면 초기값을 서버 데이터로 설정하고 `isDirty`가 올바르게 동작하게 할 수 있다.

**Q4. 같은 폼 데이터를 여러 컴포넌트에서 접근해야 할 때는 어떻게 하나요?**

`useForm`이 반환하는 `control` 객체를 Context나 Props로 전달하거나, RHF의 `useFormContext`와 `FormProvider`를 사용한다. `FormProvider`로 폼 컨텍스트를 제공하고 자식 컴포넌트에서 `useFormContext`로 `register`, `formState` 등에 접근할 수 있다. 이는 깊이 중첩된 폼 필드 컴포넌트에서 Props Drilling 없이 폼 상태에 접근할 때 유용하다.

**Q5. number 타입의 input 필드에서 타입 변환 문제가 자주 발생하는데 해결 방법은?**

HTML input은 항상 문자열을 반환한다. RHF에서 number 타입으로 받으려면 `register('price', { valueAsNumber: true })`를 사용한다. Zod와 함께 사용할 때는 `z.coerce.number()`를 사용하면 문자열을 자동으로 숫자로 변환한다. 예를 들어 `z.coerce.number().min(0)`은 `"123"` 문자열을 `123` 숫자로 변환한 후 검증한다.

---

## 7. 다음 단계 예고

> **Step 33. 폼 UX 패턴과 접근성**
>
> - 인라인 검증 vs 제출 시 검증 UX 전략
> - 에러 메시지의 시각적·의미적 설계
> - 폼 접근성(a11y): aria-invalid, aria-describedby
> - 자동 저장(Auto-save) 패턴
> - 폼 상태 시각화(progress, dirty indicator)

---

## 📚 참고 자료

- [React Hook Form 공식 문서](https://react-hook-form.com/)
- [React Hook Form — Getting Started](https://react-hook-form.com/get-started)
- [React Hook Form — API Reference](https://react-hook-form.com/docs)
- [React Hook Form — useFieldArray](https://react-hook-form.com/docs/usefieldarray)
- [Zod 공식 문서](https://zod.dev/)
- [hookform/resolvers — zodResolver](https://github.com/react-hook-form/resolvers)

---

> **React 완성 로드맵 v2.0** | Phase 5 — 타입 안전성·폼·스타일링 | Step 32 of 42
