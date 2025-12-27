import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../../../components/common/Heeader';
import { colors, spacing } from '../../../theme';
import { PostDoc } from '../../../types/Post';
import useAuth from '../../../hooks/useAuth';
import PostCard from '../Home/components/PostCard';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { typography } from '../../../theme/typography';
import { CommentDoc, ReplyDoc } from '../../../types/Comment';

type RouteParams = { post: PostDoc };

export default function PostDetailsScreen({ route }: any) {
  const { post } = route.params as RouteParams;
  const { appUser } = useAuth();
  const postForCard = useMemo(() => post, [post]);

  return (
    <View style={styles.screen}>
      <Header title="Post" hasBackButton />
      <CommentsSection postId={post.id} appUser={appUser} post={postForCard} />
    </View>
  );
}

/* ---------- Comments Section with KeyboardAvoidingView ---------- */
function CommentsSection({
  postId,
  appUser,
  post,
}: {
  postId: string;
  appUser: { userId: string; name: string; imgUrl?: string } | null;
  post: PostDoc;
}) {
  const { t } = useTranslation();
  const [comments, setComments] = React.useState<CommentDoc[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [replyTarget, setReplyTarget] = React.useState<{
    type: 'comment' | 'reply';
    commentId: string;
    targetName: string;
    replyId?: string;
  } | null>(null);
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
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

  const onReplyPress = React.useCallback(
    (
      type: 'comment' | 'reply',
      commentId: string,
      targetName: string,
      replyId?: string,
    ) => {
      setReplyTarget({ type, commentId, targetName, replyId });
      inputRef.current?.focus();
    },
    [],
  );

  const cancelReply = React.useCallback(() => {
    setReplyTarget(null);
    setInput('');
  }, []);

  const handleSend = React.useCallback(async () => {
    if (!appUser?.userId || !input.trim()) return;
    try {
      setSending(true);
      if (replyTarget) {
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
  }, [postId, appUser, input, replyTarget, t]);

  const onToggleCommentLike = React.useCallback(
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
        await ref.update({
          likedBy: isLiked
            ? firestore.FieldValue.arrayRemove(uid)
            : firestore.FieldValue.arrayUnion(uid),
          likesCount: firestore.FieldValue.increment(isLiked ? -1 : 1),
        });
      } catch (e) {
        console.warn('Toggle comment like failed:', e);
      }
    },
    [postId, appUser?.userId],
  );

  const onToggleReplyLike = React.useCallback(
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
        await ref.update({
          likedBy: isLiked
            ? firestore.FieldValue.arrayRemove(uid)
            : firestore.FieldValue.arrayUnion(uid),
          likesCount: firestore.FieldValue.increment(isLiked ? -1 : 1),
        });
      } catch (e) {
        console.warn('Toggle reply like failed:', e);
      }
    },
    [postId, appUser?.userId],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: CommentDoc }) => (
      <InlineComment
        item={item}
        postId={postId}
        appUser={appUser}
        onReplyPress={onReplyPress}
        onToggleCommentLike={onToggleCommentLike}
        onToggleReplyLike={onToggleReplyLike}
      />
    ),
    [postId, appUser, onReplyPress, onToggleCommentLike, onToggleReplyLike],
  );

  const ListHeaderComponent = React.useCallback(
    () => (
      <>
        <PostCard post={post} appUser={appUser} openCommentsSheet={false} />
        <View style={styles.commentsSectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.post.comments')}</Text>
        </View>
      </>
    ),
    [post, appUser, t],
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <FlatList
        data={comments}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
      />

      {/* Fixed Footer */}
      <View style={styles.footerContainer}>
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
        <View style={styles.footerInputRow}>
          <Image
            source={{ uri: appUser?.imgUrl || 'https://placehold.co/100x100' }}
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
  );
}

/* ---------- Single Comment block with replies (Instagram-like) ---------- */
const InlineComment = React.memo(function InlineComment({
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
}) {
  const { t } = useTranslation();
  const liked = !!appUser?.userId && item.likedBy?.includes(appUser.userId);
  const [replies, setReplies] = React.useState<ReplyDoc[]>([]);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    const unsub = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(item.id)
      .collection('replies')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snap =>
          setReplies(
            snap.docs.map(d => ({ ...(d.data() as ReplyDoc), id: d.id })),
          ),
        err => console.warn('Replies listen failed:', err),
      );
    return unsub;
  }, [item.id, postId]);

  const visibleReplies = showAll ? replies : replies.slice(0, 2);
  const hasMore = replies.length > 2;

  return (
    <View style={styles.commentBlock}>
      {/* Main comment row */}
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
            style={styles.replyButton}
            onPress={() => onReplyPress('comment', item.id, item.userName)}
          >
            <Text style={styles.replyButtonText}>{t('home.post.reply')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Replies */}
      {visibleReplies.map(r => {
        const rLiked = !!appUser?.userId && r.likedBy?.includes(appUser.userId);
        return (
          <View key={r.id} style={styles.replyItemRow}>
            <Image
              source={{ uri: r.userImg || 'https://placehold.co/80x80' }}
              style={styles.replyAvatar}
            />
            <View style={styles.replyContent}>
              <View style={styles.replyHeaderRow}>
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
                style={styles.replyButton}
                onPress={() => onReplyPress('reply', item.id, r.userName, r.id)}
              >
                <Text style={styles.replyButtonText}>
                  {t('home.post.reply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* View more / hide */}
      {hasMore && !showAll && (
        <TouchableOpacity
          style={styles.viewMoreBtn}
          onPress={() => setShowAll(true)}
        >
          <View style={styles.viewMoreLine} />
          <Text style={styles.viewMoreText}>
            {t('home.post.viewMore')} ({replies.length - 2})
          </Text>
        </TouchableOpacity>
      )}
      {showAll && hasMore && (
        <TouchableOpacity
          style={styles.viewMoreBtn}
          onPress={() => setShowAll(false)}
        >
          <View style={styles.viewMoreLine} />
          <Text style={styles.viewMoreText}>{t('home.post.hideReplies')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  listContent: {
    paddingBottom: spacing.lg,
  },

  commentsSectionHeader: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
  },

  // Fixed Footer
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  replyIndicatorText: { ...typography.caption, color: colors.textSecondary },
  replyTargetName: { ...typography.captionBold, color: colors.primary },

  footerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
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

  // Comment block
  commentBlock: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
  },
  commentRow: { flexDirection: 'row', gap: spacing.sm },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  commentContent: { flex: 1 },
  commentHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  commentAuthor: { ...typography.captionBold, color: colors.textPrimary },
  commentText: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  likeCount: { ...typography.caption, color: colors.textSecondary },
  replyButton: { marginTop: spacing.xs },
  replyButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Replies
  replyItemRow: {
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
  replyContent: { flex: 1 },
  replyHeaderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  replyAuthor: { ...typography.captionBold, color: colors.textPrimary },
  replyText: { ...typography.caption, color: colors.textPrimary, marginTop: 2 },

  // View more
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginLeft: spacing.xxl + spacing.sm,
  },
  viewMoreLine: { width: 24, height: 1, backgroundColor: colors.textSecondary },
  viewMoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
