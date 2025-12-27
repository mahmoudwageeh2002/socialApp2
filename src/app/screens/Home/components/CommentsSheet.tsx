/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
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

export default function CommentsSheet({
  postId,
  appUser,
  commentSheetRef,
}: Props) {
  const { t } = useTranslation();
  // using the ref passed from parent

  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

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

  const present = () => commentSheetRef.current?.present();
  const dismiss = () => commentSheetRef.current?.dismiss();

  const addComment = useCallback(async () => {
    if (!appUser?.userId || !input.trim()) return;
    try {
      setSending(true);
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
      setInput('');
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? 'Failed to add comment');
    } finally {
      setSending(false);
    }
  }, [postId, appUser, input]);

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

  const addReply = useCallback(
    async (parent: CommentDoc, text: string) => {
      if (!appUser?.userId || !text.trim()) return;
      try {
        const col = firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .doc(parent.id)
          .collection('replies');
        const docRef = col.doc();
        const payload: ReplyDoc = {
          id: docRef.id,
          parentCommentId: parent.id,
          comment: text.trim(),
          userId: appUser.userId,
          userName: appUser.name,
          userImg: appUser.imgUrl || '',
          likesCount: 0,
          likedBy: [],
          createdAtISO: new Date().toISOString(),
          createdAt: firestore.FieldValue.serverTimestamp() as any,
        };
        await docRef.set(payload);
      } catch (e) {
        console.warn('Add reply failed:', e);
      }
    },
    [postId, appUser],
  );

  const CommentItem = ({ item }: { item: CommentDoc }) => {
    const liked = !!appUser?.userId && item.likedBy?.includes(appUser.userId);
    const [replyText, setReplyText] = useState('');
    return (
      <View style={styles.commentRow}>
        <Image
          source={{ uri: item.userImg || 'https://placehold.co/80x80' }}
          style={styles.commentAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.commentAuthor}>{item.userName}</Text>
          <Text style={styles.commentText}>{item.comment}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity
              onPress={() => toggleCommentLike(item)}
              style={styles.likeBtn}
            >
              <Icon
                name={liked ? 'thumb-up' : 'thumb-up-outline'}
                size={18}
                color={liked ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.likeCount}>{item.likesCount}</Text>
            </TouchableOpacity>
            <View style={styles.replyRow}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder={t('home.post.reply')}
                placeholderTextColor={colors.textSecondary}
                style={styles.replyInput}
              />
              <TouchableOpacity onPress={() => addReply(item, replyText)}>
                <Icon name="send" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {/* Replies preview */}
            <RepliesList postId={postId} commentId={item.id} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <BottomSheetComponent
      ref={commentSheetRef}
      snapPoints={['60%', '100%']}
      scrollable
      modalHeight={Math.round(800 * 0.85)}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t('home.post.comments')}</Text>
        <FlatList
          data={comments}
          keyExtractor={c => c.id}
          renderItem={({ item }) => <CommentItem item={item} />}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
        <View style={styles.inputRow}>
          <Image
            source={{ uri: appUser?.imgUrl || 'https://placehold.co/100x100' }}
            style={styles.inputAvatar}
          />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('home.post.addComment')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={sending || !input.trim()}
            onPress={addComment}
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && { opacity: 0.6 },
            ]}
          >
            <Icon name="send" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetComponent>
  );
}

function RepliesList({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) {
  const [replies, setReplies] = useState<ReplyDoc[]>([]);
  useEffect(() => {
    const unsub = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId)
      .collection('replies')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snap => {
          setReplies(
            snap.docs.map(d => ({ ...(d.data() as ReplyDoc), id: d.id })),
          );
        },
        err => console.warn('Replies listen failed:', err),
      );
    return unsub;
  }, [postId, commentId]);
  if (!replies.length) return null;
  return (
    <View style={{ marginTop: spacing.xs, paddingLeft: 44 }}>
      {replies.map(r => (
        <View
          key={r.id}
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <Image
            source={{ uri: r.userImg || 'https://placehold.co/80x80' }}
            style={{ width: 20, height: 20, borderRadius: 10 }}
          />
          <Text style={{ ...typography.caption, color: colors.textPrimary }}>
            <Text style={{ ...typography.caption, fontWeight: '700' }}>
              {r.userName}:{' '}
            </Text>
            {r.comment}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
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
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  commentAuthor: { ...typography.caption, color: colors.textPrimary },
  commentText: { ...typography.body, color: colors.textPrimary },
  commentActions: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  likeCount: { ...typography.caption, color: colors.textSecondary },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  replyInput: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.caption,
  },
});
