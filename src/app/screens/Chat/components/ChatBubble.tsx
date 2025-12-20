import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';

type Props = {
  side: 'left' | 'right';
  title?: string; // for left bubble: sender name + role
  subtitle?: string; // role
  text: string;
  time: string;
};

export default function ChatBubble({
  side,
  title,
  subtitle,
  text,
  time,
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
        <Text style={[styles.text, isRight && styles.textOnPrimary]}>
          {text}
        </Text>
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
