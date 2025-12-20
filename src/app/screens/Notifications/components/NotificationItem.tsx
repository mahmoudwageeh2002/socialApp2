import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';

export type Notification = {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string; // e.g., "1m", "2d"
};

type Props = { item: Notification };

export default function NotificationItem({ item }: Props) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.center}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );
}

const AVATAR = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
    marginRight: spacing.lg,
  },
  center: { flex: 1 },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'left',
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
});
