import type { BotId } from '../types';

const CONVERSATION_ID_KEY_PREFIX = 'chat_conversation_id_';

function getConversationId(bot: BotId): string {
  return localStorage.getItem(CONVERSATION_ID_KEY_PREFIX + bot) ?? '';
}

export async function sendMessage(
  bot: BotId,
  message: string,
  onChunk: (delta: string) => void,
): Promise<void> {
  const conversationId = getConversationId(bot);

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId, bot }),
  });

  if (!res.ok || !res.body) {
    throw new Error('APIエラーが発生しました');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.slice('data:'.length).trim();
      if (!jsonStr) continue;

      let payload: { event?: string; answer?: string; conversation_id?: string; message?: string };
      try {
        payload = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (payload.event === 'error') {
        throw new Error(payload.message ?? 'APIエラーが発生しました');
      }

      if (payload.conversation_id) {
        localStorage.setItem(CONVERSATION_ID_KEY_PREFIX + bot, payload.conversation_id); // 会話の文脈を維持
      }

      if (payload.event === 'message' && typeof payload.answer === 'string' && payload.answer) {
        onChunk(payload.answer);
      }
    }
  }
}

export function resetConversation(bot: BotId) {
  localStorage.removeItem(CONVERSATION_ID_KEY_PREFIX + bot);
}
