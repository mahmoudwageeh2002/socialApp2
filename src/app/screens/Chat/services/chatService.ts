// src/services/chatService.ts
import firestore from '@react-native-firebase/firestore';
import { dmChatId } from './chatIds';

export type AppUserLite = {
  userId: string;
  name: string;
  username: string;
  imgUrl?: string;
};

export type ChatMemberInfo = {
  userId: string;
  name: string;
  username: string;
  imgUrl?: string;
};

export type ChatDoc = {
  id: string;
  type: 'dm';
  members: string[]; // [userId1, userId2]
  membersInfo: ChatMemberInfo[]; // [{userId,...},{userId,...}]
  lastMessage?: {
    type: 'text';
    text: string;
    senderId: string;
    createdAt: any;
  } | null;
  lastMessageAt?: any;
  createdAt?: any;
};

export type MessageDoc = {
  id: string;
  type: 'text';
  text: string;
  senderId: string;
  createdAt: any;
};

const chatsCol = firestore().collection('chats');
const usersCol = firestore().collection('users');

/** Get users list for picker (excluding me) */
export async function getUsersForPicker(myUserId: string, limit = 200) {
  const snap = await usersCol.limit(limit).get();
  return snap.docs
    .map(d => d.data() as any)
    .filter(u => u?.userId && u.userId !== myUserId)
    .map(u => ({
      userId: String(u.userId),
      name: String(u.name ?? 'User'),
      username: String(u.username ?? ''),
      imgUrl: u.imgUrl ? String(u.imgUrl) : '',
    }));
}

/** Create the DM chat doc if it doesn't exist; always returns chatId */
export async function ensureDmChat(my: AppUserLite, other: AppUserLite) {
  const safe = (v: any) => (typeof v === 'string' ? v : '');
  const safeId = (v: any) => safe(v).trim();

  const myId = safeId(my?.userId);
  const otherId = safeId(other?.userId);

  if (!myId || !otherId) {
    throw new Error(`ensureDmChat: missing ids my=${myId} other=${otherId}`);
  }

  const chatId = dmChatId(myId, otherId);
  const ref = chatsCol.doc(chatId);

  // IMPORTANT: no undefined allowed in Firestore
  const payload = {
    type: 'dm' as const,
    members: [myId, otherId],
    membersInfo: [
      {
        userId: myId,
        name: safe(my?.name),
        username: safe(my?.username),
        imgUrl: safe(my?.imgUrl), // becomes "" if undefined
      },
      {
        userId: otherId,
        name: safe(other?.name),
        username: safe(other?.username),
        imgUrl: safe(other?.imgUrl),
      },
    ],
    createdAt: firestore.FieldValue.serverTimestamp(),
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
  };

  try {
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set(payload);
    } else {
      // merge only these fields, no transaction
      await ref.set(
        {
          members: payload.members,
          membersInfo: payload.membersInfo,
        },
        { merge: true },
      );
    }
    return chatId;
  } catch (e: any) {
    // This prints the REAL cause
    console.log(
      'ensureDmChat FAILED payload=',
      JSON.stringify(payload, null, 2),
    );
    console.log('Firestore error code=', e?.code, 'message=', e?.message);
    throw e;
  }
}

/** Subscribe to current user's chats list */
export function subscribeMyChats(
  myUserId: string,
  onChange: (chats: ChatDoc[]) => void,
) {
  return (
    chatsCol
      .where('members', 'array-contains', myUserId)
      // add back later if you create index:
      // .orderBy('lastMessageAt', 'desc')
      .onSnapshot(snap => {
        const chats: ChatDoc[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as any),
        }));
        onChange(chats);
      })
  );
}

/** Subscribe to messages (real-time) */
export function subscribeMessages(
  chatId: string,
  onChange: (msgs: MessageDoc[]) => void,
) {
  return chatsCol
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(80)
    .onSnapshot(snap => {
      const msgs: MessageDoc[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      onChange(msgs);
    });
}

/** Send text message + update lastMessage on chat doc */
export async function sendText(chatId: string, senderId: string, text: string) {
  const t = text.trim();
  if (!t) return;

  const chatRef = chatsCol.doc(chatId);
  const msgRef = chatRef.collection('messages').doc();

  const payload = {
    type: 'text' as const,
    text: t,
    senderId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  await firestore().runTransaction(async tx => {
    tx.set(msgRef, payload);
    tx.update(chatRef, {
      lastMessage: payload,
      lastMessageAt: firestore.FieldValue.serverTimestamp(),
    });
  });
}
