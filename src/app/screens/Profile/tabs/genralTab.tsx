import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

type Props = {
  values?: { fullName?: string; username?: string; bio?: string };
};

export default function GeneralTab({ values }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(values?.fullName ?? '');
  const [username, setUsername] = useState(values?.username ?? '');
  const [bio, setBio] = useState(values?.bio ?? '');

  return (
    <View style={styles.container}>
      {/* Avatar picker placeholder box */}
      <TouchableOpacity style={styles.avatarPicker} activeOpacity={0.8}>
        <Icon
          name="cloud-upload-outline"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.avatarText}>
          {t('profile.general.chooseAvatar')}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder={t('profile.general.fullName')}
        placeholderTextColor={colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('profile.general.username')}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.textarea}
        placeholder={t('profile.general.bio')}
        placeholderTextColor={colors.textSecondary}
        multiline
        value={bio}
        onChangeText={setBio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  avatarPicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBackground,
  },
  avatarText: { ...typography.body, color: colors.textSecondary },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
