/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatBubble from './components/ChatBubble';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function ChatScreen() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const navigation = useNavigation<any>();
  const thread = useMemo(
    () => [
      {
        id: 'm1',
        side: 'left' as const,
        title: 'Bessie',
        subtitle: t('chat.roleMarketingManager'),
        text: t('chat.message1'),
        time: t('chat.time1245'),
      },
      {
        id: 'm2',
        side: 'right' as const,
        text: t('chat.message2'),
        time: t('chat.time1255'),
      },
    ],
    [],
  );

  const renderItem = ({ item }: any) => (
    <ChatBubble
      side={item.side}
      title={item.title}
      subtitle={item.subtitle}
      text={item.text}
      time={item.time}
    />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backRow} onPress={navigation.goBack}>
          <Icon
            name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
            size={22}
            color={colors.textPrimary}
          />
          <Text style={styles.backText}>{t('chat.back')}</Text>
        </TouchableOpacity>

        <View style={styles.sideRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t('chat.online')}</Text>
          </View>

          <TouchableOpacity style={styles.moreBtn}>
            <Icon
              name="dots-horizontal"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} // offset ≈ top bar height
      >
        <FlatList
          data={thread}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputRow}>
          <Image
            source={{ uri: 'https://placehold.co/100x100' }}
            style={styles.smallAvatar}
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('chat.messagePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} activeOpacity={0.9}>
              <Icon
                name="send-outline"
                size={20}
                color={colors.textSecondary}
                style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const AVATAR = 36;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 60,
  },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { ...typography.body, color: colors.textPrimary },
  statusBadge: {
    paddingHorizontal: spacing.md,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
  },
  statusText: { ...typography.captionBold, color: colors.textSecondary },
  moreBtn: { padding: spacing.xs },
  sideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl, // space above the input
  },

  inputRow: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  smallAvatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
  },
  inputWrapper: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendBtn: { paddingHorizontal: spacing.xs },
});
