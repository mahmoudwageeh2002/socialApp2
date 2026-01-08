// src/services/chatService.ts
import firestore, { Timestamp } from '@react-native-firebase/firestore';
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
  createdAt?: Timestamp;
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
};

export type Reaction = { userId: string; emoji: string; reactedAt: any };
export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'seen'
  | 'failed';

export type ReplyTo = {
  messageId: string;
  senderId: string;
  senderName?: string;
  text?: string;
};

export type ChatMessagePayload = {
  text: string;
  senderId: string;
  receiverId: string;
  isReply?: boolean;
  replyTo?: ReplyTo | null;
};

export type MessageDoc = {
  id: string;
  type: 'text';
  text: string;
  senderId: string;
  createdAt: any;

  deleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  clientId?: string; // ✅ add

  reactions?: Reaction[];
  status: MessageStatus;
  deliveredTo?: Record<string, true>; // optional (group chat)
  seenBy?: Record<string, true>; // optional (group chat)
  deliveredAt?: Timestamp | null;
  seenAt?: Timestamp | null;
  toUserId: string; // ✅ add

  isReply?: boolean;
  replyTo?: ReplyTo | null;
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
// chatService.ts
export async function sendText(
  chatId: string,
  senderId: string,
  toUserId: string,
  text: string,
  clientId?: string,
  replyTo?: ReplyTo | null,
) {
  const t = text.trim();
  if (!t) return null;

  const chatRef = chatsCol.doc(chatId);
  const id = clientId ?? firestore().collection('_ids').doc().id;
  const msgRef = chatRef.collection('messages').doc(id);

  const now = firestore.Timestamp.now(); // ✅ client timestamp

  const payload = {
    type: 'text' as const,
    text: t,
    senderId,
    toUserId,
    clientId: id,
    createdAt: now, // ✅ IMPORTANT (not serverTimestamp)
    serverCreatedAt: firestore.FieldValue.serverTimestamp(), // optional
    status: 'sent' as const,
    deliveredAt: null,
    seenAt: null,
    isReply: replyTo ? true : false,
    replyTo: replyTo ? replyTo : null,
  };

  await firestore().runTransaction(async tx => {
    tx.set(msgRef, payload, { merge: false });
    tx.update(chatRef, {
      lastMessage: payload,
      lastMessageAt: firestore.FieldValue.serverTimestamp(),
    });
  });

  return id;
}

export async function reactToMessage(
  chatId: string,
  messageId: string,
  myUserId: string,
  emoji: string,
) {
  const msgRef = chatsCol.doc(chatId).collection('messages').doc(messageId);

  await firestore().runTransaction(async tx => {
    const snap = await tx.get(msgRef);
    if (!snap.exists) return;

    const data = snap.data() as any;
    if (data?.deleted) return;

    const reactions: any[] = Array.isArray(data?.reactions)
      ? [...data.reactions]
      : [];
    const idx = reactions.findIndex(r => r?.userId === myUserId);

    const now = firestore.Timestamp.now();

    if (idx >= 0) {
      const current = reactions[idx];
      if (current?.emoji === emoji) {
        // same emoji again => remove
        reactions.splice(idx, 1);
      } else {
        // different emoji => replace
        reactions[idx] = { userId: myUserId, emoji, reactedAt: now };
      }
    } else {
      // new reaction
      reactions.push({ userId: myUserId, emoji, reactedAt: now });
    }

    tx.update(msgRef, { reactions });
  });
}
export async function deleteMessage(
  chatId: string,
  messageId: string,
  myUserId: string,
) {
  const msgRef = chatsCol.doc(chatId).collection('messages').doc(messageId);

  await msgRef.update({
    deleted: true,
    deletedBy: myUserId,
    deletedAt: firestore.FieldValue.serverTimestamp(),
    text: '', // clear text
    reactions: [], // optional: remove reactions too
  });
}
// chatService.ts
export async function markDelivered(
  chatId: string,
  myUid: string,
  messageIds: string[],
) {
  if (!messageIds.length) return;

  const batch = firestore().batch();
  const msgsCol = chatsCol.doc(chatId).collection('messages');

  messageIds.forEach(id => {
    batch.update(msgsCol.doc(id), {
      status: 'delivered',
      deliveredAt: firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
}
// chatService.ts
export async function markSeen(chatId: string, myUid: string) {
  const msgsSnap = await chatsCol
    .doc(chatId)
    .collection('messages')
    .where('senderId', '!=', myUid)
    .where('status', 'in', ['sent', 'delivered'])
    .get();

  if (msgsSnap.empty) return;

  const batch = firestore().batch();
  msgsSnap.docs.forEach(d => {
    batch.update(d.ref, {
      status: 'seen',
      seenAt: firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}
