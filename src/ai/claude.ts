import Anthropic from '@anthropic-ai/sdk';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onText: (delta: string) => void;
  onDone: (fullText: string) => void;
  onError: (message: string) => void;
}

// ─── Model Catalog ───────────────────────────────────────────────────────────

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku (빠르고 저렴)' },
  { id: 'claude-sonnet-4-20250514',  name: 'Sonnet (균형, 기본값)' },
  { id: 'claude-opus-4-20250514',    name: 'Opus (최고 품질)' },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEY_API_KEY = 'dev-open-book-api-key';
const KEY_MODEL   = 'dev-open-book-model';
const DEFAULT_MODEL: ModelId = 'claude-sonnet-4-20250514';

// ─── localStorage Helpers ────────────────────────────────────────────────────

export function getAPIKey(): string {
  return localStorage.getItem(KEY_API_KEY) ?? '';
}

export function setAPIKey(key: string): void {
  localStorage.setItem(KEY_API_KEY, key);
}

export function getModel(): ModelId {
  const stored = localStorage.getItem(KEY_MODEL);
  if (stored && MODELS.some((m) => m.id === stored)) {
    return stored as ModelId;
  }
  return DEFAULT_MODEL;
}

export function setModel(model: ModelId): void {
  localStorage.setItem(KEY_MODEL, model);
}

// ─── Streaming Chat ───────────────────────────────────────────────────────────

export async function streamChat(
  apiKey: string,
  model: string,
  system: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let fullText = '';

  try {
    const stream = await client.messages.stream({
      model,
      max_tokens: 4096,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const delta = event.delta.text;
        fullText += delta;
        callbacks.onText(delta);
      }
    }

    callbacks.onDone(fullText);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      callbacks.onError(
        '음... 마법사님, API 키가 올바르지 않은 것 같습니다. ' +
        '설정에서 키를 다시 확인해 주시겠어요? 🗝️',
      );
    } else if (error instanceof Anthropic.RateLimitError) {
      callbacks.onError(
        '잠깐, 마법서를 너무 빨리 넘기고 있어요! ' +
        '잠시 후 다시 시도해 주세요. ⏳',
      );
    } else if (
      error instanceof TypeError &&
      error.message.toLowerCase().includes('network')
    ) {
      callbacks.onError(
        '마법 수정구슬과 연결이 끊어졌어요. ' +
        '인터넷 연결을 확인해 주세요. 🔮',
      );
    } else {
      const msg =
        error instanceof Error ? error.message : String(error);
      callbacks.onError(`알 수 없는 오류가 발생했어요: ${msg}`);
    }
  }
}
