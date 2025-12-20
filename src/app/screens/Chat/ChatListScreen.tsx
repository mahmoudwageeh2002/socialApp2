/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
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
type ChatItem = {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  online?: boolean;
};

export default function ChatListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const data = useMemo<ChatItem[]>(
    () => [
      {
        id: '1',
        name: 'Bessie Cooper',
        avatar: 'https://placehold.co/100x100',
        preview: t('chat.preview1'),
        online: true,
      },
      {
        id: '2',
        name: 'Thomas Baker',
        avatar: 'https://placehold.co/100x100',
        preview: t('chat.preview2'),
        online: false,
      },
      {
        id: '3',
        name: 'Daniel Brown',
        avatar: 'https://placehold.co/100x100',
        preview: t('chat.preview3'),
        online: true,
      },
      {
        id: '4',
        name: 'Ronald Richards',
        avatar: 'https://placehold.co/100x100',
        preview: t('chat.preview4'),
        online: true,
      },
      {
        id: '5',
        name: 'David Martinez',
        avatar: 'https://placehold.co/100x100',
        preview: t('chat.preview5'),
        online: true,
      },
    ],
    [],
  );

  const renderItem = ({ item }: { item: ChatItem }) => (
    <View style={styles.row}>
      <View>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.dot} />}
      </View>
      <View style={styles.center}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {item.preview}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Header
        title={t('chat.chatsTitle')}
        hasBackButton
        hasRightButton={false}
      />
      <View style={styles.screen}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => {
            navigation.navigate('ChatStack', {
              screen: 'Chat',
              params: { chatId: '1' },
            });
          }}
        >
          <Icon name="pencil-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.headerTitle}>{t('chat.newMessage')}</Text>
        </TouchableOpacity>
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    position: 'absolute',
    right: 2,
    bottom: 2,
    borderWidth: 2,
    borderColor: colors.card,
  },
  center: { flex: 1, marginLeft: spacing.lg },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: { height: 1, backgroundColor: colors.border },
});
