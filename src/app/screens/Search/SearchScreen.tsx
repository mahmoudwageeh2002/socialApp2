import React from 'react';
import { StyleSheet, View, TextInput, I18nManager } from 'react-native';
import Header from '../../../components/common/Heeader';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../../theme';

const SearchScreen = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t('search.title')} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});

export default SearchScreen;
