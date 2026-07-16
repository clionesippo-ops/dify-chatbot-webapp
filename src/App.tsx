import { Bot, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage, TypingIndicator } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { sendMessage, resetConversation } from './api/chat';
import type { BotId, Message } from './types';
import { BOTS } from './types';
import { useEffect, useRef, useState } from 'react';

const MESSAGES_KEY_PREFIX = 'chat_messages_';

function loadMessages(bot: BotId): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY_PREFIX + bot);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [bot, setBot] = useState<BotId>(BOTS[0].id);
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(bot));
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY_PREFIX + bot, JSON.stringify(messages));
  }, [messages, bot]);

  const handleClearHistory = () => {
    setMessages([]);
    resetConversation(bot);
  };

  const handleBotChange = (nextBot: BotId) => {
    if (nextBot === bot) return;
    resetConversation(nextBot);
    setMessages(loadMessages(nextBot));
    setBot(nextBot);
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    const aiMsgId = crypto.randomUUID();

    try {
      await sendMessage(bot, text, (delta) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === aiMsgId);
          if (!exists) {
            return [...prev, { id: aiMsgId, role: 'assistant', content: delta }];
          }
          return prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + delta } : m));
        });
      });
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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
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
          <div className="flex items-center gap-2">
            <select
              value={bot}
              onChange={(e) => handleBotChange(e.target.value as BotId)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
              {BOTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              履歴をクリア
            </button>
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
          {isSending && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        </div>
      </div>

      <ChatInput value={input} onChange={setInput} onSubmit={handleSubmit} disabled={isSending} />
    </div>
  );
}
