'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Msg = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  senderId: string;
  createdAt: string;
  isBot: boolean;
};

interface ChatClientProps {
  matchId: string;
  currentUserId: string;
  initialMessages: Msg[];
}

export function ChatClient({ matchId, currentUserId, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText('');

    const tempId = `tmp-${Date.now()}`;
    setMessages((m) => [
      ...m,
      { id: tempId, text: value, imageUrl: null, senderId: currentUserId, createdAt: new Date().toISOString(), isBot: false },
    ]);

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, text: value }),
    });
    setSending(false);
    if (!res.ok) {
      setMessages((m) => m.filter((x) => x.id !== tempId));
      return;
    }
    const data = await res.json();
    setMessages((m) => [
      ...m.filter((x) => x.id !== tempId),
      {
        id: data.userMessage.id,
        text: data.userMessage.text,
        imageUrl: data.userMessage.imageUrl,
        senderId: data.userMessage.senderId,
        createdAt: data.userMessage.createdAt,
        isBot: false,
      },
    ]);
    // Pretend the other side took ~800ms to reply
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: data.autoReply.id,
          text: data.autoReply.text,
          imageUrl: data.autoReply.imageUrl,
          senderId: data.autoReply.senderId,
          createdAt: data.autoReply.createdAt,
          isBot: true,
        },
      ]);
    }, 800);
  }

  return (
    <>
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-neutral-400">Send a message to start chatting.</p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === currentUserId && !m.isBot;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-900'
                  )}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={send} className="sticky bottom-0 flex items-center gap-2 border-t border-neutral-200 bg-white p-2 safe-bottom">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="h-11 flex-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 text-base outline-none focus:border-brand-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </form>
    </>
  );
}
