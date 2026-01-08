/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

type UnreadMap = Record<string, number>; // chatId -> unread count

export function useUnreadCounts(myUid: string, chatIds: string[]) {
  const [unread, setUnread] = useState<UnreadMap>({});

  const stableChatIds = useMemo(() => chatIds.filter(Boolean), [chatIds]);

  useEffect(() => {
    if (!myUid || stableChatIds.length === 0) {
      setUnread({});
      return;
    }

    // one listener per chatId (your current approach, but correct)
    const unsubs = stableChatIds.map(chatId => {
      return (
        firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          // ✅ only messages sent TO ME
          .where('toUserId', '==', myUid)
          // ✅ not seen yet
          .where('status', 'in', ['sent', 'delivered'])
          .onSnapshot(
            snap => {
              setUnread(prev => ({
                ...prev,
                [chatId]: snap.size,
              }));
            },
            (err: any) => {
              console.log(
                'unread listener error',
                chatId,
                err?.code,
                err?.message,
              );
            },
          )
      );
    });

    return () => {
      unsubs.forEach(u => u());
    };
  }, [myUid, stableChatIds.join('|')]);

  return unread;
}
