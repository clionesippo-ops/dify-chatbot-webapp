let conversationId = '';

export async function sendMessage(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok) {
    throw new Error('APIエラーが発生しました');
  }

  const data = await res.json();
  conversationId = data.conversationId ?? conversationId; // 会話の文脈を維持
  return data.answer;
}
