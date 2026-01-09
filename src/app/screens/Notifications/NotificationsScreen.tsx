import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors, spacing } from '../../../theme';
import NotificationItem from './components/NotificationItem';
import Header from '../../../components/common/Heeader';
import { useTranslation } from 'react-i18next';
import { useNotifications } from './hooks/useNotifications';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { items, refresh } = useNotifications();

  return (
    <>
      <Header title={t('notifications.title')} />
      <View style={styles.screen}>
        <FlatList
          data={items}
          renderItem={({ item }) => <NotificationItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                refresh();
              }}
            />
          }
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
