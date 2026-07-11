import { Bot, Sparkles } from 'lucide-react';
import { ChatMessage, TypingIndicator } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { sendMessage } from './api/chat';
import type { Message } from './types';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendMessage(text);
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">AI チャットボット</h1>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Sparkles className="h-3 w-3" /> デモモード
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="mt-20 text-center text-slate-400">
              <Bot className="mx-auto mb-3 h-12 w-12" />
              <p className="text-sm">メッセージを送信して会話を始めましょう</p>
            </div>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isSending && <TypingIndicator />}
        </div>
      </div>

      <ChatInput value={input} onChange={setInput} onSubmit={handleSubmit} disabled={isSending} />
    </div>
  );
}
