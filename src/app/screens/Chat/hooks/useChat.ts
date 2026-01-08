/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/useChat.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  MessageDoc,
  sendText,
  subscribeMessages,
  markDelivered,
} from '../services/chatService';

function toMillis(v: any) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (v?.toMillis) return v.toMillis(); // Firestore Timestamp
  if (v instanceof Date) return v.getTime();
  return 0;
}

type ReplyTo = {
  messageId: string;
  senderId: string;
  senderName?: string;
  text?: string;
};

export function useChat(chatId: string, myUid: string, otherUid: string) {
  const [remote, setRemote] = useState<MessageDoc[]>([]);
  const [pendingMap, setPendingMap] = useState<Record<string, MessageDoc>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setRemote([]);
      setPendingMap({});
      return;
    }
    const unsub = subscribeMessages(chatId, setRemote);
    return unsub;
  }, [chatId]);

  // ✅ remove pending when it appears in remote
  useEffect(() => {
    if (!remote.length) return;
    setPendingMap(prev => {
      let changed = false;
      const next = { ...prev };
      for (const r of remote) {
        if (next[r.id]) {
          delete next[r.id];
          changed = true;
        }
        // also match by clientId if you ever change ids:
        if (r.clientId && next[r.clientId]) {
          delete next[r.clientId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [remote]);

  // ✅ receiver-side: mark incoming messages as delivered when you receive them
  useEffect(() => {
    if (!chatId || !myUid) return;
    const incomingToDeliver = remote
      .filter(m => m.senderId !== myUid && m.status === 'sent')
      .map(m => m.id);

    if (incomingToDeliver.length) {
      // no await needed; fire and forget
      markDelivered(chatId, myUid, incomingToDeliver).catch(() => {});
    }
  }, [remote, chatId, myUid]);

  const messages = useMemo(() => {
    const pending = Object.values(pendingMap);

    // remote is desc from Firestore; pending we sort too
    const merged = [...remote, ...pending];

    // de-dupe (if any)
    const seen = new Set<string>();
    const uniq: MessageDoc[] = [];
    for (const m of merged) {
      const key = m.id;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(m);
    }

    // keep same order as your query (desc by createdAt)
    uniq.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    return uniq;
  }, [remote, pendingMap]);

  const onSend = useCallback(
    async (text: string, replyTo: ReplyTo | null = null) => {
      const t = text.trim();
      if (!t || !chatId || !myUid) return;

      const clientId = firestore().collection('_ids').doc().id;

      // ✅ optimistic message (local)
      const optimistic: MessageDoc = {
        id: clientId,
        clientId,
        type: 'text',
        text: t,
        senderId: myUid,
        createdAt: new Date(), // local time for sorting until server timestamp arrives
        status: 'sending',
        deliveredAt: null,
        seenAt: null,
        toUserId: otherUid, // ✅ not ''
      };

      setPendingMap(prev => ({ ...prev, [clientId]: optimistic }));
      setSending(true);

      try {
        await sendText(chatId, myUid, otherUid, t, clientId, replyTo); // ✅ updated
        // success => it will appear in remote and pending will auto-remove
      } catch (e) {
        // ✅ mark failed locally
        setPendingMap(prev => ({
          ...prev,
          [clientId]: { ...prev[clientId], status: 'failed' },
        }));
      } finally {
        setSending(false);
      }
    },
    [chatId, myUid, otherUid], // ✅ updated
  );

  const retrySend = useCallback(
    async (clientId: string) => {
      const msg = pendingMap[clientId];
      if (!msg || !chatId || !myUid) return;

      setPendingMap(prev => ({
        ...prev,
        [clientId]: { ...prev[clientId], status: 'sending' },
      }));

      try {
        await sendText(chatId, myUid, otherUid, msg.text, clientId);
      } catch (e) {
        setPendingMap(prev => ({
          ...prev,
          [clientId]: { ...prev[clientId], status: 'failed' },
        }));
      }
    },
    [pendingMap, chatId, myUid, otherUid],
  );

  return { messages, onSend, sending, retrySend };
}
