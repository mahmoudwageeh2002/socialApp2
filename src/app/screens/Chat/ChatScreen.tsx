/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatBubble from './components/ChatBubble';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import useAuth from '../../../hooks/useAuth'; // <-- update path
import { useChat } from './hooks/useChat';
import Clipboard from '@react-native-clipboard/clipboard';
import MessageActionsOverlayAnchored from './components/MessageActionsOverlayAnchored';
import {
  reactToMessage,
  deleteMessage,
  markSeen,
} from './services/chatService';

function formatTime(ts: any) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date();
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

type ReplyTo = {
  messageId: string;
  senderId: string;
  senderName?: string;
  text?: string;
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  // const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  // const overlayVisible = !!selectedMsg;

  const { chatId, otherUser } = route.params as {
    chatId: string;
    otherUser?: {
      userId: string;
      name: string;
      username?: string;
      imgUrl?: string;
    };
  };
  const [selected, setSelected] = useState<{
    msg: any;
    layout: any;
    side: 'left' | 'right';
  } | null>(null);

  const overlayVisible = !!selected;
  const { appUser } = useAuth();
  const myUid = appUser?.userId ?? '';

  const selectedEmojiFromFS = selected?.msg?.reactions?.find(
    (r: any) => r?.userId === myUid,
  )?.emoji;

  const [message, setMessage] = useState('');
  const otherUid = otherUser?.userId ?? '';
  const { messages, onSend, sending, retrySend } = useChat(
    chatId,
    myUid,
    otherUid,
  );
  const headerName = otherUser?.name ?? 'Chat';

  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

  const clearReply = () => setReplyTo(null);

  const onSwipeToReply = (item: any) => {
    if (item?.deleted) return;
    setReplyTo({
      messageId: item.id,
      senderId: item.senderId,
      senderName: item.senderId === myUid ? t('chat.you') : headerName,
      text: item.text ?? '',
    });
  };

  const buildReactionBadge = (reactions?: any[]) => {
    if (!Array.isArray(reactions) || reactions.length === 0) return '';
    // WhatsApp-like: show unique emojis with counts
    const map = new Map<string, number>();
    reactions.forEach(r => {
      if (r?.emoji) map.set(r.emoji, (map.get(r.emoji) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .slice(0, 3)
      .map(([emoji, count]) => (count > 1 ? `${emoji}${count}` : emoji))
      .join(' ');
  };

  const renderItem = ({ item }: any) => {
    const isRight = item.senderId === myUid;
    const deleted = !!item.deleted;
    const side = isRight ? 'right' : 'left';

    const hidden = overlayVisible && selected?.msg?.id === item.id;

    return (
      <ChatBubble
        side={side}
        title={!isRight ? headerName : undefined}
        subtitle={
          !isRight
            ? otherUser?.username
              ? `@${otherUser.username}`
              : undefined
            : undefined
        }
        text={item.text}
        time={formatTime(item.createdAt)}
        deleted={deleted}
        reactionBadge={buildReactionBadge(item.reactions)}
        disableLongPress={deleted}
        hidden={hidden}
        myUid={myUid}
        isReply={!!item.replyTo}
        replyTo={item.replyTo}
        // NEW: swipe handler
        onSwipeReply={() => onSwipeToReply(item)}
        onLongPressMeasured={layout => {
          if (deleted) return;
          setSelected({ msg: item, layout, side });
        }}
        status={item.status}
        onPressFailed={
          isRight && item.status === 'failed'
            ? () => retrySend(item.id) // id == clientId for pending
            : undefined
        }
      />
    );
  };

  const sendNow = async () => {
    const tmsg = message.trim();
    if (!tmsg) return;

    setMessage('');

    // pass reply meta to hook (we’ll implement it in useChat)
    await onSend(tmsg, replyTo ? { ...replyTo } : null);

    clearReply();
  };

  const smallAvatarUri = useMemo(() => {
    // show my avatar in input row if you want; or otherUser avatar — your choice
    return appUser?.imgUrl || 'https://placehold.co/100x100';
  }, [appUser?.imgUrl]);
  useFocusEffect(
    useCallback(() => {
      if (!chatId || !myUid) return;

      markSeen(chatId, myUid).catch(() => {});
    }, [chatId, myUid, messages]),
  );
  return (
    <>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backRow} onPress={navigation.goBack}>
            <Icon
              name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
              size={22}
              color={colors.textPrimary}
            />
            <Text style={styles.backText}>{t('chat.back')}</Text>
          </TouchableOpacity>

          <View style={styles.sideRow}>
            <Text style={{ ...typography.bodyBold, color: colors.textPrimary }}>
              {headerName}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <FlatList
            data={messages}
            renderItem={renderItem}
            inverted // because we query createdAt desc
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.composer}>
            {!!replyTo && (
              <View style={styles.replyBar}>
                <View style={styles.replyBarAccent} />
                <View style={styles.replyBarTextWrap}>
                  <Text style={styles.replyBarTitle} numberOfLines={1}>
                    {t('chat.replyingTo')} {replyTo.senderName ?? ''}
                  </Text>
                  <Text style={styles.replyBarBody} numberOfLines={1}>
                    {replyTo.text || t('chat.attachment')}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={clearReply}
                  style={styles.replyBarClose}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <Image
                source={{ uri: smallAvatarUri }}
                style={styles.smallAvatar}
              />
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('chat.messagePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  returnKeyType="send"
                  onSubmitEditing={sendNow}
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  activeOpacity={0.9}
                  onPress={sendNow}
                  disabled={sending}
                >
                  <Icon
                    name="send-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={{
                      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <MessageActionsOverlayAnchored
        visible={overlayVisible}
        onClose={() => setSelected(null)}
        layout={selected?.layout ?? null}
        side={selected?.side ?? 'left'}
        bubbleProps={{
          side: selected?.side ?? 'left',
          title: selected?.side === 'left' ? headerName : undefined,
          subtitle:
            selected?.side === 'left'
              ? otherUser?.username
                ? `@${otherUser.username}`
                : undefined
              : undefined,
          text: selected?.msg?.text,
          time: formatTime(selected?.msg?.createdAt),
          deleted: !!selected?.msg?.deleted,
          reactionBadge: buildReactionBadge(selected?.msg?.reactions),
          disableLongPress: true,
          myUid: myUid,
        }}
        canCopy={!selected?.msg?.deleted && !!selected?.msg?.text}
        canDelete={!selected?.msg?.deleted}
        showDelete={myUid === selected?.msg?.senderId}
        selectedEmoji={selectedEmojiFromFS} // ✅ comes from Firestore
        onReact={async emoji => {
          if (!selected) return;
          await reactToMessage(chatId, selected.msg.id, myUid, emoji);
          setSelected(null);
        }}
        onCopy={() => {
          if (!selected?.msg?.text) return;
          Clipboard.setString(selected.msg.text);
        }}
        onDelete={async () => {
          if (!selected) return;
          await deleteMessage(chatId, selected.msg.id, myUid);
        }}
      />
    </>
  );
}

const AVATAR = 36;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 60,
  },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { ...typography.body, color: colors.textPrimary },

  sideRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  composer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },

  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: spacing.sm,
  },
  replyBarAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.activeTab,
    marginRight: 10,
  },
  replyBarTextWrap: { flex: 1 },
  replyBarTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  replyBarBody: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  replyBarClose: {
    padding: 6,
    marginLeft: 6,
  },

  inputRow: {
    // moved under composer, so remove duplicated padding here
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  smallAvatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
  },
  inputWrapper: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendBtn: { paddingHorizontal: spacing.xs },
  emojiSelected: {
    backgroundColor: `${colors.activeTab}55`,
    borderRadius: 22,
    transform: [{ scale: 1.12 }],
  },
});
