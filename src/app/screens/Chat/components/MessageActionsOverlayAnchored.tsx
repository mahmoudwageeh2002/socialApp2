import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import ChatBubble, { BubbleLayout } from './ChatBubble';

const EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
const { width: W, height: H } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;

  layout: BubbleLayout | null;
  side: 'left' | 'right';
  bubbleProps: React.ComponentProps<typeof ChatBubble>;

  canCopy: boolean;
  canDelete: boolean;
  showDelete: boolean;

  selectedEmoji?: string;
  onReact: (emoji: string) => void;
  onCopy: () => void;
  onDelete: () => void;
};

export default function MessageActionsOverlayAnchored({
  visible,
  onClose,
  layout,
  side,
  bubbleProps,
  canCopy,
  canDelete,
  showDelete,
  onReact,
  onCopy,
  onDelete,
  selectedEmoji,
}: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const y1 = useSharedValue(10);
  const y2 = useSharedValue(14);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 140 });
      scale.value = withTiming(1, { duration: 160 });
      y1.value = withTiming(0, { duration: 180 });
      y2.value = withTiming(0, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(0.98, { duration: 120 });
      y1.value = withTiming(10, { duration: 120 });
      y2.value = withTiming(14, { duration: 120 });
    }
  }, [visible, opacity, scale, y1, y2]);

  const dimStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const bubbleAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const reactionsStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y1.value }],
  }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y2.value }],
  }));

  const positions = useMemo(() => {
    if (!layout) return null;

    const safeTop = 40;
    const safeBottom = 24;
    const gap = 12;

    const reactionH = 56;
    const reactionW = Math.min(W - 24, EMOJIS.length * 44 + 18);

    const actionW = Math.min(W - 24, 260);
    const actionH = showDelete ? 110 : 54;

    // ✅ IMPORTANT: use REAL measured width — no minWidth forcing
    const bubbleW = layout.width;
    const bubbleH = layout.height;

    const EDGE_TOP = 120;
    const EDGE_BOTTOM = 160;

    const isNearTop = layout.y < EDGE_TOP;
    const isNearBottom = layout.y + bubbleH > H - EDGE_BOTTOM;
    const centerMode = isNearTop || isNearBottom;

    const alignToBubble = (
      boxW: number,
      bubbleLeft: number,
      bubbleWidth: number,
    ) =>
      side === 'right'
        ? clamp(bubbleLeft + bubbleWidth - boxW, 12, W - boxW - 12)
        : clamp(bubbleLeft, 12, W - boxW - 12);

    // ---- CENTER MODE: vertical center, horizontal “biased center” (left half vs right half) ----
    if (centerMode) {
      const bubbleTopMin = safeTop + reactionH + gap;
      const bubbleTopMax = H - safeBottom - bubbleH - gap - actionH;

      const desiredBubbleTop = H / 2 - bubbleH / 2;
      const bubbleTop = clamp(desiredBubbleTop, bubbleTopMin, bubbleTopMax);

      // ✅ Bias the “center” depending on side (NOT to screen edge)
      const targetCenterX = side === 'right' ? W * 0.9 : W * 0.1;
      const bubbleLeft = clamp(targetCenterX - bubbleW / 2, 8, W - bubbleW - 8);

      const reactionLeft = alignToBubble(reactionW, bubbleLeft, bubbleW);
      const actionsLeft = alignToBubble(actionW, bubbleLeft, bubbleW);

      const reactionTop = clamp(
        bubbleTop - reactionH - gap,
        safeTop,
        H - safeBottom - reactionH,
      );

      const actionsTop = clamp(
        bubbleTop + bubbleH + gap,
        safeTop,
        H - safeBottom - actionH,
      );

      return {
        bubble: { left: bubbleLeft, top: bubbleTop, width: bubbleW },
        reactions: {
          left: reactionLeft,
          top: reactionTop,
          width: reactionW,
          height: reactionH,
        },
        actions: {
          left: actionsLeft,
          top: actionsTop,
          width: actionW,
          height: actionH,
        },
      };
    }

    // ---- NORMAL MODE: keep anchored to real bubble position ----
    const bubbleLeft = clamp(layout.x, 8, W - bubbleW - 8);
    const bubbleTop = clamp(layout.y, 8, H - bubbleH - 8);

    const reactionLeft = alignToBubble(reactionW, bubbleLeft, bubbleW);
    const actionsLeft = alignToBubble(actionW, bubbleLeft, bubbleW);

    // reactions above if possible else below
    const reactionTopAbove = layout.y - reactionH - gap;
    const canReactionAbove = reactionTopAbove >= safeTop;
    const reactionTop = canReactionAbove
      ? reactionTopAbove
      : layout.y + bubbleH + gap;

    // actions prefer below (or below reactions if reactions moved below)
    const actionsTopPreferred = canReactionAbove
      ? layout.y + bubbleH + gap
      : reactionTop + reactionH + gap;

    const canActionsBelow = actionsTopPreferred + actionH <= H - safeBottom;
    const actionsTop = canActionsBelow
      ? actionsTopPreferred
      : clamp(layout.y - actionH - gap, safeTop, H - safeBottom - actionH);

    return {
      bubble: { left: bubbleLeft, top: bubbleTop, width: bubbleW },
      reactions: {
        left: reactionLeft,
        top: clamp(reactionTop, safeTop, H - safeBottom - reactionH),
        width: reactionW,
        height: reactionH,
      },
      actions: {
        left: actionsLeft,
        top: actionsTop,
        width: actionW,
        height: actionH,
      },
    };
  }, [layout, side, showDelete]);

  if (!visible || !layout || !positions) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={Platform.OS === 'ios' ? 'dark' : 'dark'}
        blurAmount={12}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.35)"
      />

      <Animated.View style={[styles.dimLayer, dimStyle]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      {/* highlighted message clone */}
      <Animated.View
        style={[
          styles.bubbleCloneWrap,
          bubbleAnimStyle,
          {
            left: positions.bubble.left,
            top: positions.bubble.top,
            width: positions.bubble.width,
          },
        ]}
        pointerEvents="none"
      >
        {/* ✅ no padding (keeps clone width EXACT) */}
        <View style={styles.highlightRing}>
          <ChatBubble {...bubbleProps} compact fullWidth />
        </View>
      </Animated.View>

      {/* emoji bar */}
      <Animated.View
        style={[
          styles.reactionsBox,
          reactionsStyle,
          {
            left: positions.reactions.left,
            top: positions.reactions.top,
            width: positions.reactions.width,
            height: positions.reactions.height,
          },
        ]}
      >
        {EMOJIS.map(e => {
          const isSelected = selectedEmoji === e;
          return (
            <TouchableOpacity
              key={e}
              style={[styles.emojiBtn, isSelected && styles.emojiSelected]}
              onPress={() => onReact(e)}
              activeOpacity={0.85}
            >
              <Text style={styles.emoji}>{e}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* actions menu */}
      <Animated.View
        style={[
          styles.actionsBox,
          actionsStyle,
          {
            left: positions.actions.left,
            top: positions.actions.top,
            width: positions.actions.width,
            height: positions.actions.height,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionRow, !canCopy && { opacity: 0.4 }]}
          disabled={!canCopy}
          onPress={() => {
            onCopy();
            onClose();
          }}
        >
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>

        {showDelete ? (
          <>
            <View style={styles.sep} />
            <TouchableOpacity
              style={[styles.actionRow, !canDelete && { opacity: 0.4 }]}
              disabled={!canDelete}
              onPress={() => {
                Alert.alert(
                  'Delete message?',
                  'This will delete the message.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        onDelete();
                        onClose();
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={[styles.actionText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </Animated.View>
    </View>
  );
}

function clamp(v: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(v, max));
}

const styles = StyleSheet.create({
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  bubbleCloneWrap: { position: 'absolute' },

  // ✅ No padding so clone width stays EXACT to measured width
  highlightRing: {
    borderRadius: 16,
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.10)',
    // backgroundColor: 'rgba(255,255,255,0.06)',
  },

  reactionsBox: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  emojiSelected: {
    backgroundColor: `${colors.textPrimary}22`,
    borderRadius: 22,
    transform: [{ scale: 1.12 }],
  },

  actionsBox: {
    position: 'absolute',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionRow: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  sep: { height: 1, backgroundColor: colors.border },
});
