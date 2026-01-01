/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../components/common/Heeader';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import useAuth from '../../../hooks/useAuth'; // <-- update path if needed
import UserPickerSheet, {
  UserPickerSheetRef,
} from './components/UserPickerSheet';
import { AppUserLite, ensureDmChat } from './services/chatService';
import { useChatList } from './hooks/useChatList';

type ChatRow = {
  chatId: string;
  otherUserId: string;
  otherName: string;
  otherImgUrl?: string;
  lastText: string;
  lastSenderId?: string;
};

export default function ChatListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const sheetRef = useRef<UserPickerSheetRef>(null);

  const { appUser } = useAuth();
  const me = appUser;

  const myUid = me?.userId ?? '';

  const myLite: AppUserLite = useMemo(
    () => ({
      userId: me?.userId ?? '',
      name: me?.name ?? 'Me',
      username: me?.username ?? '',
      imgUrl: me?.imgUrl ?? '',
    }),
    [me],
  );

  const { items, empty, loading } = useChatList(myUid);

  const openPicker = () => sheetRef.current?.present();

  const onPickUser = async (other: AppUserLite) => {
    if (!myUid) return; // ✅ important
    if (!other?.userId) return;
    console.log('myUid:', myUid);
    console.log('picked userId:', other?.userId);
    const chatId = await ensureDmChat(myLite, other);

    navigation.navigate('ChatStack', {
      screen: 'Chat',
      params: {
        chatId,
        otherUser: other,
      },
    });
  };

  const rows: ChatRow[] = items?.map(i => ({
    chatId: i.chatId,
    otherUserId: i.otherUserId,
    otherName: i.otherName,
    otherImgUrl: i.otherImgUrl,
    lastText: i.lastText,
    lastSenderId: i.lastSenderId,
  }));

  const renderItem = ({ item }: { item: ChatRow }) => {
    const preview =
      item.lastText?.length > 0
        ? item.lastSenderId === myUid
          ? `You: ${item.lastText}`
          : item.lastText
        : t('chat.newMessage');

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('ChatStack', {
            screen: 'Chat',
            params: {
              chatId: item.chatId,
              otherUser: {
                userId: item.otherUserId,
                name: item.otherName,
                username: '',
                imgUrl: item.otherImgUrl ?? '',
              },
            },
          });
        }}
      >
        <View>
          <Image
            source={{ uri: item.otherImgUrl || 'https://placehold.co/100x100' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.center}>
          <Text style={styles.name}>{item.otherName}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header
        title={t('chat.chatsTitle')}
        hasBackButton
        hasRightButton={false}
      />

      <View style={styles.screen}>
        {/* Always show New Message button (your requirement) */}
        <TouchableOpacity
          style={styles.header}
          onPress={openPicker}
          disabled={!myUid || loading}
        >
          <Icon name="pencil-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.headerTitle}>
            {loading ? 'Loading...' : 'New message'}
          </Text>
        </TouchableOpacity>

        {/* If no chats: show only text; if chats: list them */}
        {!empty ? (
          <FlatList
            data={rows}
            keyExtractor={i => i.chatId}
            renderItem={renderItem}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={{ padding: spacing.xxl }}>
            <Text
              style={{
                ...typography.caption,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {loading
                ? 'Loading…'
                : 'No chats yet. Tap “New message” to start.'}
            </Text>
          </View>
        )}
      </View>

      {/* Picker sheet */}
      <UserPickerSheet ref={sheetRef} myUserId={myUid} onPick={onPickUser} />
    </>
  );
}

const AVATAR = 48;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h4, color: colors.textSecondary },
  content: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
  },
  center: { flex: 1, marginLeft: spacing.lg },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
