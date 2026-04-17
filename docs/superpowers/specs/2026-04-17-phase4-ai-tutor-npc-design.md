# Phase 4: AI Tutor NPC — Design Spec

**Date:** 2026-04-17
**Status:** APPROVED
**Depends on:** Phase 3 (completed — animation, sound, dust particles, NPC schedule)

---

## Overview

기존 NPC 대화 시스템에 Claude AI 레이어를 추가한다:

1. **BYOK API 키 관리** — 사용자가 Claude API 키를 설정 UI에서 입력, localStorage 저장
2. **NPC 모드 전환** — 말풍선에서 "퀘스트" / "질문하기" 선택
3. **AI 대화 오버레이** — RPG 스타일 전체 오버레이 (초상화 + 타이핑 + 입력창)
4. **NPC별 AI 페르소나** — 시스템 프롬프트로 전문 분야/성격 분리
5. **컨텍스트 주입** — 현재 책 마크다운 + 카테고리 책 목록 + 진행 상태

---

## 1. BYOK API 키 관리

### 1-1. 설정 UI

**파일:** `src/components/APIKeySettings.tsx`

- ProgressIndicator 패널에 "⚙️ 설정" 탭 추가
- API 키: `<input type="password">` + 저장/삭제 버튼
- 모델 선택: Haiku / Sonnet / Opus 라디오 버튼 (기본값: Sonnet)
- 저장 위치: localStorage
  - `dev-open-book-api-key` — API 키
  - `dev-open-book-model` — 모델 ID (기본값: `claude-sonnet-4-20250514`)

### 1-2. 모델 매핑

| 표시 이름 | 모델 ID |
|-----------|---------|
| Haiku (빠르고 저렴) | `claude-haiku-4-5-20251001` |
| Sonnet (균형, 기본값) | `claude-sonnet-4-20250514` |
| Opus (최고 품질) | `claude-opus-4-20250514` |

---

## 2. NPC 모드 전환

### 2-1. 말풍선 분기

NPC 클릭 시 기존 `findDialogueNode` 대신 모드 선택 말풍선을 먼저 표시:

- 📜 **퀘스트** → 기존 정적 대화 트리 진입
- 💬 **질문하기** → AI 대화 오버레이 열기

**API 키 미설정 시:**
- 💬 버튼에 🔒 표시
- 클릭 시 "설정에서 API 키를 입력해주세요" 안내 메시지

### 2-2. SpeechBubble 변경

`SpeechBubble.tsx`에 `mode: 'select' | 'dialogue'` prop 추가:
- `'select'`: 퀘스트/질문하기 두 버튼만 표시 (모드 선택)
- `'dialogue'`: 기존 대화 노드 텍스트 + 선택지 표시

---

## 3. AI 대화 오버레이

### 3-1. 컴포넌트 구조

**파일:** `src/components/AIChat.tsx`

```
┌──────────────────────────────────┐
│  [NPC 초상화 96px]  NPC 이름     │  ← 헤더
│                    전문 분야      │
│                          [✕]    │
├──────────────────────────────────┤
│                                  │
│  🧑 사용자: 질문 텍스트           │  ← 대화 히스토리
│                                  │
│  🤖 NPC: 응답 텍스트...          │  ← 타이핑 효과
│         (글자 단위 스트리밍)      │
│                                  │
├──────────────────────────────────┤
│  [입력창                 ] [전송] │  ← 입력 영역
└──────────────────────────────────┘
```

### 3-2. Props

```typescript
interface AIChatProps {
  npc: NPC
  onClose: () => void
}
```

### 3-3. 타이핑 효과

- 스트리밍으로 수신된 텍스트를 글자 단위로 표시
- `stream.on('text', delta => ...)` → state 누적 → 렌더
- 타이핑 중에는 입력 비활성화
- 마크다운 렌더링: 코드 블록, 볼드, 리스트 지원 (MarkdownRenderer 재사용)

### 3-4. 대화 히스토리

- 세션 내 메모리만 유지 (컴포넌트 state)
- localStorage에 저장하지 않음 (API 비용 + 프라이버시)
- 오버레이 닫으면 히스토리 리셋
- 최대 10턴(사용자+NPC = 20 messages) 유지, 초과 시 오래된 턴 제거
- 시스템 프롬프트 + 컨텍스트는 매 요청에 포함 (히스토리와 별도)

---

## 4. NPC별 AI 페르소나

### 4-1. 시스템 프롬프트 구조

**파일:** `src/ai/personas.ts`

```typescript
interface Persona {
  name: string
  role: string
  expertise: string
  personality: string
  category: string | null  // null = 전체 (사서)
  rules: string[]
}
```

### 4-2. NPC별 페르소나

| NPC | expertise | personality | category |
|-----|-----------|-------------|----------|
| 사서 | 전체 프로그래밍 학습 가이드, 도서관 안내 | 친절하고 지혜로운, 적절한 비유를 잘 사용 | null (전체) |
| Dart 학자 | Dart 언어, 문법, 비동기, OOP | 꼼꼼하고 학구적, 정확한 용어 선호 | 'dart' |
| Flutter 방문자 | Flutter 개발, 위젯, 상태관리, 아키텍처 | 활발하고 실전적, 예제 코드를 즐겨 사용 | 'flutter' |
| React 연구원 | React 생태계, Hook, 렌더링, SSR/RSC | 분석적이고 깊이 있는, 원리 설명 선호 | 'react' |

### 4-3. 공통 행동 규칙

모든 NPC 시스템 프롬프트에 포함되는 규칙:
1. 한국어로 답변한다
2. 소크라테스식 힌트 모드: 직접 답 대신 질문으로 유도 (단, 사용자가 직접 답을 요청하면 제공)
3. 현재 읽고 있는 책의 맥락을 참고하여 답변한다
4. RPG 도서관의 NPC로서 세계관에 맞는 말투를 사용한다
5. 사용자의 진행 상태에 맞게 설명 깊이를 조절한다
6. 답변은 간결하게. 300자 이내를 기본으로, 심화 요청 시 길게

---

## 5. 컨텍스트 주입

### 5-1. 컨텍스트 조립

**파일:** `src/ai/context.ts`

프롬프트에 주입되는 정보 (순서대로):

1. **시스템 프롬프트**: NPC 페르소나 + 행동 규칙
2. **카테고리 책 목록**: NPC 전문 분야의 책 제목/step 목록 (경량)
   - 형식: `"1. [Step 01] Dart 개요 및 환경 구축 (완독 ✅)"`
   - 사서는 전체 97권 목록 (제목만, ~2000 토큰)
   - 전문 NPC는 해당 카테고리만 (500~1000 토큰)
3. **현재 책 마크다운**: 사용자가 마지막으로 읽은 책의 전문 (fetch)
   - 최대 8000 토큰으로 트리밍 (앞부분 우선)
4. **진행 상태 요약**: 완독 수, 현재 퀘스트, 스트릭 (1줄)

### 5-2. 토큰 예산

| 항목 | 예상 토큰 |
|------|-----------|
| 시스템 프롬프트 | ~500 |
| 책 목록 | ~500~2000 |
| 현재 책 마크다운 | ~3000~8000 |
| 진행 상태 | ~100 |
| 대화 히스토리 (10턴) | ~2000~4000 |
| **합계** | ~6000~15000 |

Sonnet 기준 입력 토큰 비용: $3/M → 요청당 $0.02~$0.05

---

## 6. Claude API 호출

### 6-1. API 래퍼

**파일:** `src/ai/claude.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamCallbacks {
  onText: (delta: string) => void
  onDone: () => void
  onError: (error: string) => void
}

function createClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

async function streamChat(
  apiKey: string,
  model: string,
  system: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void>
```

- `client.messages.stream()` 사용
- `stream.on('text', callbacks.onText)`
- `stream.finalMessage()` 후 `callbacks.onDone()`
- 에러 시 `callbacks.onError()`

### 6-2. 에러 처리

| 에러 | NPC 말투 메시지 |
|------|----------------|
| 401 (키 무효) | "흠... 입장증이 올바르지 않은 것 같습니다. 설정을 확인해주세요." |
| 429 (rate limit) | "잠시 쉬어가야 할 것 같습니다. 조금 후에 다시 물어봐주세요." |
| 네트워크 오류 | "마법의 연결이 끊어진 것 같습니다. 다시 시도해주세요." |
| 기타 | "지금은 대답하기 어려운 것 같습니다. 다시 시도해주세요." |

---

## 7. 파일 구조

### 신규 파일
```
src/ai/claude.ts                    — Claude API 호출 + 스트리밍 래퍼
src/ai/personas.ts                  — NPC별 시스템 프롬프트 4개
src/ai/context.ts                   — 컨텍스트 조립 (책 목록 + 마크다운 + 진행)
src/components/AIChat.tsx           — AI 대화 오버레이 (초상화 + 타이핑 + 입력)
src/components/APIKeySettings.tsx   — API 키 입력 + 모델 선택 설정 UI
src/ai/context.test.ts              — 컨텍스트 조립 테스트
```

### 수정 파일
```
src/components/SpeechBubble.tsx     — mode: 'select' | 'dialogue' 추가
src/components/LibraryRoom.tsx      — AI 대화 오버레이 상태 + 모드 전환
src/components/ProgressIndicator.tsx — 설정 탭 추가
src/index.css                        — AI 대화 오버레이 + 설정 UI 스타일
package.json                        — @anthropic-ai/sdk 의존성
```

---

## 8. 테스트

| 파일 | 항목 |
|------|------|
| `context.test.ts` | buildBookList (포맷, 완독 표시), buildCurrentBookContext (트리밍), buildProgressSummary |
| `personas.test.ts` | 4개 페르소나 존재 확인, 공통 규칙 포함 여부 |

---

## 9. 에셋

기존 NPC 스프라이트(48×48, 4방향)를 AI 대화 오버레이 초상화로 재사용.
CSS로 96px 확대 + `image-rendering: pixelated`. **신규 pixellab.ai 에셋 불필요.**
