// src/hooks/useDeliveredWatcher.ts
import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { markDelivered } from '../services/chatService';

const chatsCol = firestore().collection('chats');

export function useDeliveredWatcher(myUid: string, chatIds: string[]) {
  useEffect(() => {
    if (!myUid || chatIds.length === 0) return;

    const unsubs = chatIds.map(chatId => {
      return chatsCol
        .doc(chatId)
        .collection('messages')
        .where('status', '==', 'sent')
        .where('senderId', '!=', myUid)
        .limit(20)
        .onSnapshot(async snap => {
          const ids = snap.docs.map(d => d.id);
          if (ids.length) {
            markDelivered(chatId, myUid, ids).catch(() => {});
          }
        });
    });

    return () => unsubs.forEach(u => u());
  }, [myUid, chatIds]);
}
