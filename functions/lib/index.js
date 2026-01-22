"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNewChatMessage = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
function uniq(arr) {
    return Array.from(new Set(arr.filter(Boolean)));
}
exports.notifyNewChatMessage = (0, firestore_1.onDocumentCreated)('chats/{chatId}/messages/{messageId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const msg = snap.data();
    if (!msg || msg.deleted)
        return;
    const chatId = event.params.chatId;
    const senderId = msg.senderId ?? '';
    const text = (msg.text ?? '').trim();
    if (!senderId || !text)
        return;
    const db = admin.firestore();
    // 1) determine receiver(s)
    const chatSnap = await db.doc(`chats/${chatId}`).get();
    const chat = (chatSnap.exists ? chatSnap.data() : null) ?? null;
    const members = chat?.members ?? [];
    const receivers = members.filter(uid => uid && uid !== senderId);
    if (receivers.length === 0)
        return;
    // 2) read sender profile (for name + avatar)
    const senderSnap = await db.doc(`users/${senderId}`).get();
    const sender = (senderSnap.exists ? senderSnap.data() : {});
    const senderName = sender.name ?? 'New message';
    const senderAvatar = sender.imgUrl ?? '';
    // 3) collect all receiver tokens
    const tokenList = [];
    for (const uid of receivers) {
        const uSnap = await db.doc(`users/${uid}`).get();
        if (!uSnap.exists)
            continue;
        const u = uSnap.data();
        if (Array.isArray(u.fcmTokens))
            tokenList.push(...u.fcmTokens);
        if (u.fcmToken)
            tokenList.push(u.fcmToken);
    }
    const tokens = uniq(tokenList);
    if (tokens.length === 0)
        return;
    // 4) send push
    // Use "data" so app can read name/avatar/chatId if needed
    const payload = {
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
    const invalidTokens = [];
    res.responses.forEach((r, idx) => {
        if (!r.success) {
            const code = r.error?.code ?? '';
            if (code === 'messaging/registration-token-not-registered' ||
                code === 'messaging/invalid-registration-token') {
                invalidTokens.push(tokens[idx]);
            }
        }
    });
    if (invalidTokens.length > 0) {
        // remove invalid tokens from users' fcmTokens arrays (best-effort)
        await Promise.all(receivers.map(async (uid) => {
            const ref = db.doc(`users/${uid}`);
            const uSnap = await ref.get();
            if (!uSnap.exists)
                return;
            const u = uSnap.data();
            const cur = Array.isArray(u.fcmTokens) ? u.fcmTokens : [];
            const next = cur.filter(t => !invalidTokens.includes(t));
            if (next.length !== cur.length) {
                await ref.set({ fcmTokens: next }, { merge: true });
            }
        }));
    }
});
