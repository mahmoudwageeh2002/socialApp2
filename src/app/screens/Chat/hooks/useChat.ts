// src/hooks/useChat.ts
import { useCallback, useEffect, useState } from 'react';
import {
  MessageDoc,
  sendText,
  subscribeMessages,
} from '../services/chatService';

export function useChat(chatId: string, myUserId: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const unsub = subscribeMessages(chatId, setMessages);
    return unsub;
  }, [chatId]);

  const onSend = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || !chatId || !myUserId) return;

      setSending(true);
      try {
        await sendText(chatId, myUserId, t);
      } finally {
        setSending(false);
      }
    },
    [chatId, myUserId],
  );

  return { messages, onSend, sending };
}
