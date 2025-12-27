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
import { useNavigation } from '@react-navigation/native';
import useLogin from './hooks/useLogin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const passwordInputRef = useRef<TextInput>(null);
  const { loading, error, loginWithEmail, loginWithGoogle } = useLogin();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };
  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.container}>
        {/* Logo */}
        <LogoSvg width={48} height={48} style={styles.logo} />
        {/* App name */}
        <Text style={styles.title}>{t('auth.appName')}</Text>

        {/* Social buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={loginWithGoogle}
          disabled={loading}
        >
          <GoogleSvg width={24} height={24} style={styles.socialIcon} />
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
          returnKeyType="next"
          onChangeText={setEmail}
          onSubmitEditing={handleEmailSubmit}
          value={email}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showPasswordButton}
        >
          <Icon
            color={colors.textSecondary}
            size={24}
            name={showPassword ? 'eye-off' : 'eye'}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={showPassword ? false : true}
          onChangeText={setPassword}
          ref={passwordInputRef}
          value={password}
          // type="password"
        />
        {/* Error */}
        {error ? (
          <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
        ) : null}
        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => loginWithEmail(email, password)}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading ? t('common.loading') : t('auth.login')}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
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
  mainContainer: {
    backgroundColor: colors.background,
    paddingTop: 58,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 45,
    top: 318,
    zIndex: 9999,
  },
});

export default LoginScreen;
