// useDeliveredGlobal.ts
import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { markDelivered } from '../services/chatService';

export function useDeliveredGlobal(myUid: string) {
  useEffect(() => {
    if (!myUid) return;

    const unsub = firestore()
      .collectionGroup('messages')
      .where('toUserId', '==', myUid)
      .where('status', '==', 'sent')
      .orderBy('createdAt', 'desc') // ✅ IMPORTANT
      .limit(50)
      .onSnapshot(
        snap => {
          const byChat: Record<string, string[]> = {};

          snap.docs.forEach(d => {
            const chatId = d.ref.parent.parent?.id;
            if (!chatId) return;
            (byChat[chatId] ??= []).push(d.id);
          });

          Object.entries(byChat).forEach(([chatId, ids]) => {
            markDelivered(chatId, myUid, ids).catch(e =>
              console.log('markDelivered failed', e?.code, e?.message),
            );
          });
        },
        (err: any) => {
          console.log(
            'useDeliveredGlobal snapshot ERROR:',
            err?.code,
            err?.message,
          );
        },
      );

    return unsub;
  }, [myUid]);
}
