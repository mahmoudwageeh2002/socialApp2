/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import BottomSheetComponent, {
  BottomSheetRef,
} from '../../../../components/common/BottomSheetComponent';
import { CommentDoc, ReplyDoc } from '../../../../types/Comment';

type Props = {
  postId: string;
  appUser: { userId: string; name: string; imgUrl?: string } | null;
  commentSheetRef: React.RefObject<BottomSheetRef | null>;
};

type ReplyTarget = {
  type: 'comment' | 'reply';
  commentId: string;
  targetName: string;
  replyId?: string;
} | null;

// CommentItem component moved outside to prevent re-renders
const CommentItem = React.memo(
  ({
    item,
    postId,
    appUser,
    onReplyPress,
    onToggleCommentLike,
    onToggleReplyLike,
  }: {
    item: CommentDoc;
    postId: string;
    appUser: { userId: string; name: string; imgUrl?: string } | null;
    onReplyPress: (
      type: 'comment' | 'reply',
      commentId: string,
      targetName: string,
      replyId?: string,
    ) => void;
    onToggleCommentLike: (c: CommentDoc) => void;
    onToggleReplyLike: (commentId: string, r: ReplyDoc) => void;
  }) => {
    const { t } = useTranslation();
    const liked = !!appUser?.userId && item.likedBy?.includes(appUser.userId);
    const [replies, setReplies] = useState<ReplyDoc[]>([]);
    const [showAllReplies, setShowAllReplies] = useState(false);

    useEffect(() => {
      const unsub = firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(item.id)
        .collection('replies')
        .orderBy('createdAt', 'asc')
        .onSnapshot(
          snap => {
            const list = snap.docs.map(d => ({
              ...(d.data() as ReplyDoc),
              id: d.id,
            }));
            setReplies(list);
          },
          err => console.warn('Replies listen failed:', err),
        );
      return unsub;
    }, [item.id, postId]);

    const displayedReplies = showAllReplies ? replies : replies.slice(0, 2);
    const hasMoreReplies = replies.length > 2;

    return (
      <View style={styles.commentBlock}>
        {/* Main Comment */}
        <View style={styles.commentRow}>
          <Image
            source={{ uri: item.userImg || 'https://placehold.co/80x80' }}
            style={styles.commentAvatar}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onToggleCommentLike(item)}
                style={styles.likeBtn}
              >
                <Icon
                  name={liked ? 'thumb-up' : 'thumb-up-outline'}
                  size={18}
                  color={liked ? colors.primary : colors.textSecondary}
                />
                <Text style={styles.likeCount}>{item.likesCount}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => onReplyPress('comment', item.id, item.userName)}
              style={styles.replyButton}
            >
              <Text style={styles.replyButtonText}>{t('home.post.reply')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Replies */}
        {displayedReplies.map(r => {
          const rLiked =
            !!appUser?.userId && r.likedBy?.includes(appUser.userId);
          return (
            <View key={r.id} style={styles.replyRow}>
              <Image
                source={{ uri: r.userImg || 'https://placehold.co/80x80' }}
                style={styles.replyAvatar}
              />
              <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.replyAuthor}>{r.userName}</Text>
                    <Text style={styles.replyText}>{r.comment}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onToggleReplyLike(item.id, r)}
                    style={styles.likeBtn}
                  >
                    <Icon
                      name={rLiked ? 'thumb-up' : 'thumb-up-outline'}
                      size={16}
                      color={rLiked ? colors.primary : colors.textSecondary}
                    />
                    <Text style={styles.likeCount}>{r.likesCount}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    onReplyPress('reply', item.id, r.userName, r.id)
                  }
                  style={styles.replyButton}
                >
                  <Text style={styles.replyButtonText}>
                    {t('home.post.reply')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* View More Replies */}
        {hasMoreReplies && !showAllReplies && (
          <TouchableOpacity
            style={styles.viewMoreBtn}
            onPress={() => setShowAllReplies(true)}
          >
            <View style={styles.viewMoreLine} />
            <Text style={styles.viewMoreText}>
              {t('home.post.viewMore')} ({replies.length - 2})
            </Text>
          </TouchableOpacity>
        )}

        {/* Hide Replies */}
        {showAllReplies && hasMoreReplies && (
          <TouchableOpacity
            style={styles.viewMoreBtn}
            onPress={() => setShowAllReplies(false)}
          >
            <View style={styles.viewMoreLine} />
            <Text style={styles.viewMoreText}>
              {t('home.post.hideReplies')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

export default function CommentsSheet({
  postId,
  appUser,
  commentSheetRef,
}: Props) {
  const { t } = useTranslation();

  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!postId) return;
    const unsub = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const list: CommentDoc[] = snap.docs.map(d => ({
            ...(d.data() as CommentDoc),
            id: d.id,
          }));
          setComments(list);
        },
        err => console.warn('Comments listen failed:', err),
      );
    return unsub;
  }, [postId]);

  const handleReplyPress = useCallback(
    (
      type: 'comment' | 'reply',
      commentId: string,
      targetName: string,
      replyId?: string,
    ) => {
      setReplyTarget({ type, commentId, targetName, replyId });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    [],
  );

  const cancelReply = useCallback(() => {
    setReplyTarget(null);
    setInput('');
  }, []);

  const handleSend = useCallback(async () => {
    if (!appUser?.userId || !input.trim()) return;

    try {
      setSending(true);

      if (replyTarget) {
        // Adding a reply
        const col = firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .doc(replyTarget.commentId)
          .collection('replies');
        const docRef = col.doc();
        const payload: ReplyDoc = {
          id: docRef.id,
          parentCommentId: replyTarget.commentId,
          comment: input.trim(),
          userId: appUser.userId,
          userName: appUser.name,
          userImg: appUser.imgUrl || '',
          likesCount: 0,
          likedBy: [],
          createdAtISO: new Date().toISOString(),
          createdAt: firestore.FieldValue.serverTimestamp() as any,
        };
        await docRef.set(payload);
      } else {
        // Adding a comment
        const col = firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments');
        const docRef = col.doc();
        const payload: CommentDoc = {
          id: docRef.id,
          comment: input.trim(),
          userId: appUser.userId,
          userName: appUser.name,
          userImg: appUser.imgUrl || '',
          likesCount: 0,
          likedBy: [],
          createdAtISO: new Date().toISOString(),
          createdAt: firestore.FieldValue.serverTimestamp() as any,
        };
        await docRef.set(payload);
      }

      setInput('');
      setReplyTarget(null);
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message ?? 'Failed to add comment/reply',
      );
    } finally {
      setSending(false);
    }
  }, [postId, appUser, input, replyTarget]);

  const toggleCommentLike = useCallback(
    async (c: CommentDoc) => {
      const uid = appUser?.userId;
      if (!uid) return;
      const ref = firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(c.id);
      const isLiked = Array.isArray(c.likedBy) && c.likedBy.includes(uid);
      try {
        if (isLiked) {
          await ref.update({
            likedBy: firestore.FieldValue.arrayRemove(uid),
            likesCount: firestore.FieldValue.increment(-1),
          });
        } else {
          await ref.update({
            likedBy: firestore.FieldValue.arrayUnion(uid),
            likesCount: firestore.FieldValue.increment(1),
          });
        }
      } catch (e) {
        console.warn('Toggle comment like failed:', e);
      }
    },
    [postId, appUser?.userId],
  );

  const toggleReplyLike = useCallback(
    async (commentId: string, r: ReplyDoc) => {
      const uid = appUser?.userId;
      if (!uid) return;
      const ref = firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(commentId)
        .collection('replies')
        .doc(r.id);
      const isLiked = Array.isArray(r.likedBy) && r.likedBy.includes(uid);
      try {
        if (isLiked) {
          await ref.update({
            likedBy: firestore.FieldValue.arrayRemove(uid),
            likesCount: firestore.FieldValue.increment(-1),
          });
        } else {
          await ref.update({
            likedBy: firestore.FieldValue.arrayUnion(uid),
            likesCount: firestore.FieldValue.increment(1),
          });
        }
      } catch (e) {
        console.warn('Toggle reply like failed:', e);
      }
    },
    [postId, appUser?.userId],
  );

  const renderCommentItem = useCallback(
    ({ item }: { item: CommentDoc }) => (
      <CommentItem
        item={item}
        postId={postId}
        appUser={appUser}
        onReplyPress={handleReplyPress}
        onToggleCommentLike={toggleCommentLike}
        onToggleReplyLike={toggleReplyLike}
      />
    ),
    [postId, appUser, handleReplyPress, toggleCommentLike, toggleReplyLike],
  );

  const keyExtractor = useCallback((c: CommentDoc) => c.id, []);

  return (
    <BottomSheetComponent
      ref={commentSheetRef}
      snapPoints={['auto']}
      scrollable
      modalHeight={Math.round(800 * 0.85)}
    >
      <KeyboardAvoidingView
        style={styles.fullContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t('home.post.comments')}</Text>
          <FlatList
            data={comments}
            keyExtractor={keyExtractor}
            renderItem={renderCommentItem}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerContainer}>
          {/* Reply indicator */}
          {replyTarget && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyIndicatorText}>
                {t('home.post.replyingTo')}{' '}
                <Text style={styles.replyTargetName}>
                  {replyTarget.targetName}
                </Text>
              </Text>
              <TouchableOpacity onPress={cancelReply}>
                <Icon name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input row */}
          <View style={styles.footerInputRow}>
            <Image
              source={{
                uri: appUser?.imgUrl || 'https://placehold.co/100x100',
              }}
              style={styles.inputAvatar}
            />
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder={
                replyTarget
                  ? `${t('home.post.reply')} ${replyTarget.targetName}...`
                  : t('home.post.addComment')
              }
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              disabled={sending || !input.trim()}
              onPress={handleSend}
              style={[
                styles.sendBtn,
                (!input.trim() || sending) && { opacity: 0.6 },
              ]}
            >
              <Icon name="send" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetComponent>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Footer container with reply indicator
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },

  // Reply indicator
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  replyIndicatorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  replyTargetName: {
    ...typography.captionBold,
    color: colors.primary,
  },

  // Footer input row
  footerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },

  inputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Comment block layout
  commentBlock: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  commentAuthor: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  commentText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 2,
  },

  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  likeCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  replyButton: {
    marginTop: spacing.xs,
  },
  replyButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Reply row
  replyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginLeft: spacing.xxl + spacing.sm,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  replyAuthor: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  replyText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 2,
  },

  // View more
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginLeft: spacing.xxl + spacing.sm,
  },
  viewMoreLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.textSecondary,
  },
  viewMoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
