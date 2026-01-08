// src/hooks/useChatList.ts
import { useEffect, useMemo, useState } from 'react';
import { ChatDoc, subscribeMyChats } from '../services/chatService';

export type ChatListItem = {
  chatId: string;
  otherUserId: string;
  otherName: string;
  otherUsername: string;
  otherImgUrl?: string;
  lastText: string;
  lastSenderId?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
};

export function useChatList(myUserId: string) {
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myUserId) {
      setChats([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeMyChats(myUserId, c => {
      setChats(c);
      setLoading(false);
    });

    return unsub;
  }, [myUserId]);

  const items = useMemo<ChatListItem[]>(() => {
    return chats.map(c => {
      const otherUserId = (c.members ?? []).find(u => u !== myUserId) ?? '';
      const otherInfo = (c.membersInfo ?? []).find(
        m => m.userId === otherUserId,
      );

      return {
        chatId: c.id,
        otherUserId,
        otherName: otherInfo?.name ?? 'User',
        otherUsername: otherInfo?.username ?? '',
        otherImgUrl: otherInfo?.imgUrl ?? '',
        lastText: c.lastMessage?.text ?? '',
        lastSenderId: c.lastMessage?.senderId,
        status: c?.status,
      };
    });
  }, [chats, myUserId]);

  return { items, loading, empty: !loading && items.length === 0 };
}
