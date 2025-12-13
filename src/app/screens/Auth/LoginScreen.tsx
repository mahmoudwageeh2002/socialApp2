import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import { t } from '../../../localization';
import { SafeAreaFrameContext } from 'react-native-safe-area-context';
import LogoSvg from '../../../assets/svgs/Logomark.svg';
const LoginScreen = () => {
  return (
    <SafeAreaFrameContext value={null}>
      <View style={styles.container}>
        {/* Logo */}
        {/* <LogoSvg width={48} height={48} style={styles.logo} /> */}
        {/* App name */}
        <Text style={styles.title}>{t('auth.appName')}</Text>

        {/* Social buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
            }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>{t('auth.loginWithGoogle')}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('auth.or')}</Text>
          <View style={styles.divider} />
        </View>

        {/* Email/password */}
        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginText}>{t('auth.login')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaFrameContext>
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
  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: {
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
});

export default LoginScreen;
