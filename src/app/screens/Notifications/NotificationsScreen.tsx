import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { colors, spacing } from '../../../theme';
import NotificationItem, { Notification } from './components/NotificationItem';
import Header from '../../../components/common/Heeader';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  const data = useMemo<Notification[]>(
    () => [
      {
        id: '1',
        name: 'Bessie Cooper',
        avatar: 'https://placehold.co/100x100',
        message: 'Start following you.',
        time: '1m',
      },
      {
        id: '2',
        name: 'Samuel Lee',
        avatar: 'https://placehold.co/100x100',
        message: 'Liked your post.',
        time: '2d',
      },
      {
        id: '3',
        name: 'Joseph Rodriguez',
        avatar: 'https://placehold.co/100x100',
        message: 'comment on your post.',
        time: '10w',
      },
    ],
    [],
  );

  return (
    <>
      <Header title={t('notifications.title')} />
      <View style={styles.screen}>
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  separator: { height: 1, backgroundColor: colors.border },
});
