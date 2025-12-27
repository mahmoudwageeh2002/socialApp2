import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';

type AccountData = {
  email: string;
  phone: string;
  joined: string;
  plan: string;
};

type Props = { data: AccountData };

export default function AccountTab({ data }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Row label={t('profile.account.email')} value={data.email} />
      <Row label={t('profile.account.phone')} value={data.phone} />
      <Row label={t('profile.account.joined')} value={data.joined} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { ...typography.captionBold, color: colors.textSecondary },
  value: { ...typography.body, color: colors.textPrimary },
});
