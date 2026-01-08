/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  InteractionManager,
} from 'react-native'; // ✅ add InteractionManager
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import AudioRow from './AudioRow';

type AudioPayload = { uri: string; durationMs?: number };

export type BubbleLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ReplyTo = {
  messageId?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
};

type Props = {
  side: 'left' | 'right';
  title?: string;
  subtitle?: string;
  text?: string;
  time: string;
  audio?: AudioPayload;

  deleted?: boolean;
  reactionBadge?: string;

  onLongPressMeasured?: (layout: BubbleLayout) => void;
  disableLongPress?: boolean;
  hidden?: boolean;

  compact?: boolean; // overlay clone: remove outer paddings
  fullWidth?: boolean; // overlay clone: bubble fill wrapper width
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  onPressFailed?: () => void; // ✅ add

  isReply?: boolean;
  replyTo?: ReplyTo | null;
  onSwipeReply?: () => void;
};

export default function ChatBubble({
  side,
  title,
  subtitle,
  text,
  time,
  audio,
  deleted,
  reactionBadge,
  onLongPressMeasured,
  disableLongPress,
  hidden,
  compact,
  fullWidth = false,
  isReply,
  replyTo,
  onSwipeReply,
  ...bubbleProps
}: Props) {
  const isRight = side === 'right';
  const bubbleRef = useRef<View>(null);

  // ✅ NEW: swipeable ref so we can close it after opening
  const swipeableRef = useRef<Swipeable>(null);

  const overlayMode = !!compact && !!fullWidth;

  const hasReaction = !!reactionBadge && !deleted;

  const bubbleStyle = useMemo(() => {
    return [
      styles.bubbleBase,
      !overlayMode && styles.bubbleNormal,
      overlayMode && styles.bubbleOverlay,
      isRight ? styles.bubbleRight : styles.bubbleLeft,
      // ✅ add room for the reaction pill to sit "outside" the bubble
      hasReaction && styles.bubbleWithReaction,
    ];
  }, [overlayMode, isRight, hasReaction]);

  const handleLongPress = () => {
    if (disableLongPress) return;
    if (!onLongPressMeasured) return;

    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onLongPressMeasured({ x, y, width: width, height });
    });
  };

  function StatusIcon({
    status,
    onPressFailed,
  }: {
    status?: string;
    onPressFailed?: () => void;
  }) {
    if (!status) return null;

    if (status === 'sending')
      return (
        <Icon name="clock-outline" size={14} color={colors.textSecondary} />
      );

    if (status === 'sent')
      return <Icon name="check" size={14} color={colors.textSecondary} />;

    if (status === 'delivered')
      return <Icon name="check-all" size={14} color={colors.textSecondary} />;

    if (status === 'seen')
      return <Icon name="check-all" size={14} color={colors.link} />;

    if (status === 'failed')
      return (
        <Pressable onPress={onPressFailed} hitSlop={10}>
          <Icon
            name="alert-circle-outline"
            size={16}
            color={colors.textSecondary}
          />
        </Pressable>
      );

    return null;
  }

  const renderSwipeAction = () => (
    <View style={styles.swipeAction}>
      <Icon name="reply-outline" size={20} color={colors.textPrimary} />
    </View>
  );

  const replyVisible =
    !deleted &&
    !!isReply &&
    !!replyTo &&
    (!!replyTo.text || !!replyTo.senderName);

  const content = (
    <View
      style={[
        compact ? styles.containerCompact : styles.container,
        isRight ? styles.right : styles.left,
        hidden && { opacity: 0 },
      ]}
    >
      <Pressable onLongPress={handleLongPress} delayLongPress={240}>
        <View ref={bubbleRef} style={bubbleStyle as any}>
          {!isRight && title ? (
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.role}>{subtitle}</Text> : null}
            </View>
          ) : null}

          {/* ✅ WhatsApp-like reply preview */}
          {replyVisible ? (
            <View
              style={[
                styles.replySnippet,
                isRight ? styles.replySnippetRight : styles.replySnippetLeft,
              ]}
            >
              <View
                style={[
                  styles.replyAccent,
                  isRight ? styles.replyAccentRight : styles.replyAccentLeft,
                ]}
              />
              <View style={styles.replyTextWrap}>
                {!!replyTo?.senderName ? (
                  <Text
                    style={[
                      styles.replySnippetTitle,
                      isRight && styles.replySnippetTitleOnPrimary,
                    ]}
                    numberOfLines={1}
                  >
                    {replyTo.senderName}
                  </Text>
                ) : null}

                <Text
                  style={[
                    styles.replySnippetBody,
                    isRight && styles.replySnippetBodyOnPrimary,
                  ]}
                  numberOfLines={1}
                >
                  {replyTo?.text ?? ''}
                </Text>
              </View>
            </View>
          ) : null}

          {deleted ? (
            <Text style={[styles.deletedText, isRight && styles.textOnPrimary]}>
              This message was deleted
            </Text>
          ) : text ? (
            <Text style={[styles.text, isRight && styles.textOnPrimary]}>
              {text}
            </Text>
          ) : null}

          {audio ? <AudioRow isRight={isRight} audio={audio} /> : null}

          <View style={styles.timeRow}>
            <Text
              style={[
                styles.time,
                isRight ? styles.timeOnPrimary : styles.timeLeft,
              ]}
            >
              {time}
            </Text>
            {isRight && !deleted ? (
              <View style={{ marginLeft: 6 }}>
                <StatusIcon
                  status={(bubbleProps as any)?.status}
                  onPressFailed={(bubbleProps as any)?.onPressFailed}
                />
              </View>
            ) : null}
          </View>

          {!!reactionBadge && !deleted ? (
            <View
              style={[
                styles.reactionPill,
                isRight ? styles.reactionRight : styles.reactionLeft,
              ]}
            >
              <Text style={styles.reactionText}>{reactionBadge}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
  const handleSwipeOpen = useCallback(() => {
    // ✅ 1) close immediately so bubble returns to place (no visible delay)
    swipeableRef.current?.close();

    // ✅ 2) run the reply selection AFTER animations/interactions (smooth + no jank)
    if (onSwipeReply) {
      InteractionManager.runAfterInteractions(() => {
        onSwipeReply();
      });
    }
  }, [onSwipeReply]);
  // Only enable swipe if handler provided
  if (!onSwipeReply) return content;

  const swipeFrom = side === 'right' ? 'right' : 'left';

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={35}
      rightThreshold={35}
      renderLeftActions={swipeFrom === 'left' ? renderSwipeAction : undefined}
      renderRightActions={swipeFrom === 'right' ? renderSwipeAction : undefined}
      onSwipeableOpen={handleSwipeOpen}
      overshootLeft={false}
      overshootRight={false}
    >
      {content}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.md,
    marginBottom: 6, // ✅ give the reaction pill space below
  },
  // ✅ IMPORTANT: overlay clone should NOT force minWidth — let it match measured width
  containerCompact: { paddingHorizontal: 0, marginTop: 0 },

  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },

  bubbleBase: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },

  // ✅ NEW: extra bottom padding so the absolute reaction pill isn't cut/covered
  bubbleWithReaction: {
    paddingBottom: spacing.md + 8, // 8 ~ pill overlap amount
  },

  bubbleNormal: {
    maxWidth: '86%',
  },

  // ✅ Overlay bubble fills the wrapper width (wrapper width comes from measureInWindow)
  bubbleOverlay: {
    width: '100%',
    maxWidth: '100%',
  },

  bubbleLeft: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleRight: { backgroundColor: colors.primary },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  title: { ...typography.bodyBold, color: colors.textPrimary },
  role: { ...typography.caption, color: colors.textSecondary },

  text: { ...typography.body, color: colors.textPrimary },
  deletedText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  textOnPrimary: { color: colors.onPrimary },

  time: { ...typography.caption, marginTop: spacing.sm },
  timeLeft: { color: colors.textSecondary },
  timeOnPrimary: { color: colors.onPrimary },

  reactionPill: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minWidth: 42,
  },
  reactionLeft: { left: 10 },
  reactionRight: { right: 10 },
  reactionText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  swipeAction: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },

  replySnippet: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  replySnippetLeft: {
    backgroundColor: `${colors.card}`,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replySnippetRight: {
    // darker glassy block inside primary bubble
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  replyAccent: {
    width: 4,
  },
  replyAccentLeft: {
    backgroundColor: colors.activeTab,
  },
  replyAccentRight: {
    // WhatsApp-ish: a lighter accent bar inside primary
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  replyTextWrap: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  replySnippetTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: 1,
  },
  replySnippetTitleOnPrimary: {
    color: colors.onPrimary,
    opacity: 0.95,
  },
  replySnippetBody: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  replySnippetBodyOnPrimary: {
    color: colors.onPrimary,
    opacity: 0.85,
  },
});
