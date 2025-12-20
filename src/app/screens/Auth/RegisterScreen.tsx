import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import { useTranslation } from 'react-i18next';
import LogoSvg from '../../../assets/svgs/Logomark.svg';
import GoogleSvg from '../../../assets/svgs/googleSvg.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [agree, setAgree] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  return (
    <ScrollView
      style={styles.mainContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Logo + App name */}
        <LogoSvg width={48} height={48} style={styles.logo} />
        <Text style={styles.title}>{t('auth.appName')}</Text>

        {/* Social buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <GoogleSvg width={24} height={24} style={styles.socialIcon} />
          <Text style={styles.socialText}>{t('auth.signUpWithGoogle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Icon
            name="email-outline"
            size={22}
            color={colors.textPrimary}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>{t('auth.loginWithEmail')}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('auth.or')}</Text>
          <View style={styles.divider} />
        </View>

        {/* Form */}
        <TextInput
          style={styles.input}
          placeholder={t('auth.name')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextInput
          ref={emailRef}
          style={styles.input}
          placeholder={t('auth.email')}
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current?.focus()}
        />
        <TextInput
          ref={usernameRef}
          style={styles.input}
          placeholder={t('auth.username')}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          returnKeyType="done"
        />

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.8}
          onPress={() => setAgree(prev => !prev)}
        >
          <Icon
            name={agree ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={22}
            color={agree ? colors.primary : colors.border}
          />
          <Text style={styles.termsText}>{t('auth.agreeTerms')}</Text>
        </TouchableOpacity>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.loginBtn, !agree && { opacity: 0.6 }]}
          disabled={!agree}
        >
          <Text style={styles.loginText}>{t('auth.continue')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.footerLink}>{t('auth.logIn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.background,
  },
  logo: {
    width: 48,
    height: 48,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    fontWeight: '700',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  socialIcon: { width: 20, height: 20, marginRight: spacing.sm },
  socialText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  loginText: {
    ...typography.buttonBold,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.captionBold,
    color: colors.link,
  },
  mainContainer: {
    backgroundColor: colors.background,
    paddingTop: 58,
  },
});

export default RegisterScreen;
