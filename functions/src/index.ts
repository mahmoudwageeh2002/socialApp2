import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();

type UserDoc = {
  name?: string;
  imgUrl?: string;
  fcmToken?: string; // allow single token
  fcmTokens?: string[]; // allow multiple devices
};

type ChatDoc = {
  members?: string[];
};

type MessageDoc = {
  senderId?: string;
  text?: string;
  deleted?: boolean;
  createdAt?: any;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export const notifyNewChatMessage = onDocumentCreated(
  'chats/{chatId}/messages/{messageId}',
  async event => {
    const snap = event.data;
    if (!snap) return;

    const msg = snap.data() as MessageDoc;
    if (!msg || msg.deleted) return;

    const chatId = event.params.chatId as string;
    const senderId = msg.senderId ?? '';
    const text = (msg.text ?? '').trim();
    if (!senderId || !text) return;

    const db = admin.firestore();

    // 1) determine receiver(s)
    const chatSnap = await db.doc(`chats/${chatId}`).get();
    const chat =
      (chatSnap.exists ? (chatSnap.data() as ChatDoc) : null) ?? null;

    const members = chat?.members ?? [];
    const receivers = members.filter(uid => uid && uid !== senderId);
    if (receivers.length === 0) return;

    // 2) read sender profile (for name + avatar)
    const senderSnap = await db.doc(`users/${senderId}`).get();
    const sender = (
      senderSnap.exists ? (senderSnap.data() as UserDoc) : {}
    ) as UserDoc;

    const senderName = sender.name ?? 'New message';
    const senderAvatar = sender.imgUrl ?? '';

    // 3) collect all receiver tokens
    const tokenList: string[] = [];
    for (const uid of receivers) {
      const uSnap = await db.doc(`users/${uid}`).get();
      if (!uSnap.exists) continue;
      const u = uSnap.data() as UserDoc;

      if (Array.isArray(u.fcmTokens)) tokenList.push(...u.fcmTokens);
      if (u.fcmToken) tokenList.push(u.fcmToken);
    }

    const tokens = uniq(tokenList);
    if (tokens.length === 0) return;

    // 4) send push
    // Use "data" so app can read name/avatar/chatId if needed
    const payload: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: senderName,
        body: text,
      },
      data: {
        chatId,
        senderId,
        name: senderName,
        avatar: senderAvatar,
        message: text,
        type: 'chat_message',
      },
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const res = await admin.messaging().sendEachForMulticast(payload);

    // Optional: cleanup invalid tokens
    const invalidTokens: string[] = [];
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code ?? '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      // remove invalid tokens from users' fcmTokens arrays (best-effort)
      await Promise.all(
        receivers.map(async uid => {
          const ref = db.doc(`users/${uid}`);
          const uSnap = await ref.get();
          if (!uSnap.exists) return;
          const u = uSnap.data() as UserDoc;
          const cur = Array.isArray(u.fcmTokens) ? u.fcmTokens : [];
          const next = cur.filter(t => !invalidTokens.includes(t));
          if (next.length !== cur.length) {
            await ref.set({ fcmTokens: next }, { merge: true });
          }
        }),
      );
    }
  },
);
