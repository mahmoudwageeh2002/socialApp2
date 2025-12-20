import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import i18n, { setLanguage } from '../../../../localization/i18n';

type Props = {
  onLogout?: () => void;
  onDeactivate?: () => void;
};

export default function LogoutTab({ onLogout, onDeactivate }: Props) {
  const { t } = useTranslation();

  const handleChangeLanguage = async () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    await setLanguage(next);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onLogout}
        activeOpacity={0.9}
      >
        <Icon name="logout" size={20} color={colors.onPrimary} />
        <Text style={styles.primaryText}>{t('profile.actions.logout')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={onDeactivate}
        activeOpacity={0.9}
      >
        <Icon
          name="account-cancel-outline"
          size={20}
          color={colors.textPrimary}
        />
        <Text style={styles.secondaryText}>
          {t('profile.actions.deactivate')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={handleChangeLanguage}
        activeOpacity={0.9}
      >
        <FontAwesome name="language" color={colors.textPrimary} size={24} />
        <Text style={styles.secondaryText}>
          {t('profile.actions.changeLanguage')}
        </Text>
      </TouchableOpacity>
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
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryText: { ...typography.buttonBold, color: colors.onPrimary },
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  secondaryText: { ...typography.button, color: colors.textPrimary },
});
