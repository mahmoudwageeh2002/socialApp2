import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import AudioRow from './AudioRow';

type AudioPayload = {
  uri: string; // file url or local path
  durationMs?: number;
};

type Props = {
  side: 'left' | 'right';
  title?: string;
  subtitle?: string;
  text?: string;
  time: string;
  audio?: AudioPayload; // optional audio message
};

export default function ChatBubble({
  side,
  title,
  subtitle,
  text,
  time,
  audio,
}: Props) {
  const isRight = side === 'right';

  return (
    <View style={[styles.container, isRight ? styles.right : styles.left]}>
      <View
        style={[
          styles.bubble,
          isRight ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        {!isRight && title ? (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.role}>{subtitle}</Text> : null}
          </View>
        ) : null}

        {/* Text message */}
        {text ? (
          <Text style={[styles.text, isRight && styles.textOnPrimary]}>
            {text}
          </Text>
        ) : null}

        {/* Audio message */}
        {audio ? <AudioRow isRight={isRight} audio={audio} /> : null}

        <Text
          style={[
            styles.time,
            isRight ? styles.timeOnPrimary : styles.timeLeft,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xxl, marginTop: spacing.md },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '86%',
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    // overflow: 'hidden',
  },
  bubbleLeft: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleRight: {
    backgroundColor: colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  title: { ...typography.bodyBold, color: colors.textPrimary },
  role: { ...typography.caption, color: colors.textSecondary },
  text: { ...typography.body, color: colors.textPrimary }, // if your key is `typology` fix to `typography`
  textOnPrimary: { color: colors.onPrimary },
  time: { ...typography.caption, marginTop: spacing.sm },
  timeLeft: { color: colors.textSecondary },
  timeOnPrimary: { color: colors.onPrimary },
});
