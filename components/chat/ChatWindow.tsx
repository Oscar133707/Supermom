'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { sendChatMessage, getChatHistory } from '@/actions/chat';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory().then(setMessages);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const content = input.trim();
    if (!content || isPending) return;
    setInput('');

    // Optimistic: add user message immediately
    const optimisticUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    startTransition(async () => {
      await sendChatMessage(content);
      const updated = await getChatHistory();
      setMessages(updated);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm pt-12">
            <div className="text-4xl mb-3">🤖</div>
            <p>Ask me anything about your workouts or diet!</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex',
              m.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-brand-400 text-black rounded-br-md'
                  : 'bg-[#1E1E1E] text-gray-300 rounded-bl-md',
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-[#1E1E1E] text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#141414] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about your workouts or diet…"
          className="flex-1 border border-[#2A2A2A] bg-[#1E1E1E] text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          disabled={isPending}
        />
        <button
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          className="bg-brand-400 text-black px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-brand-500 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
