/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import useAuth from '../../../hooks/useAuth'; // <-- update path
import { useChat } from './hooks/useChat';

function formatTime(ts: any) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date();
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { chatId, otherUser } = route.params as {
    chatId: string;
    otherUser?: {
      userId: string;
      name: string;
      username?: string;
      imgUrl?: string;
    };
  };

  const { appUser } = useAuth();
  const myUid = appUser?.userId ?? '';

  const [message, setMessage] = useState('');
  const { messages, onSend, sending } = useChat(chatId, myUid);

  const headerName = otherUser?.name ?? 'Chat';

  const renderItem = ({ item }: any) => {
    const isRight = item.senderId === myUid;

    return (
      <ChatBubble
        side={isRight ? 'right' : 'left'}
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
      />
    );
  };

  const sendNow = async () => {
    const tmsg = message.trim();
    if (!tmsg) return;
    setMessage('');
    await onSend(tmsg);
  };

  const smallAvatarUri = useMemo(() => {
    // show my avatar in input row if you want; or otherUser avatar — your choice
    return appUser?.imgUrl || 'https://placehold.co/100x100';
  }, [appUser?.imgUrl]);

  return (
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
          keyExtractor={item => item.id}
          renderItem={renderItem}
          inverted // because we query createdAt desc
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputRow}>
          <Image source={{ uri: smallAvatarUri }} style={styles.smallAvatar} />
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
                style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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

  inputRow: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
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
});
