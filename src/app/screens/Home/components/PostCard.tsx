import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '../../../../utils/timeAgo';
import { PostDoc } from '../../../../types/Post';
import firestore from '@react-native-firebase/firestore';
import CommentsSheet from './CommentsSheet';
import { BottomSheetRef } from '../../../../components/common/BottomSheetComponent';

type Props = { post: PostDoc; appUser?: any };
export default function PostCard({ post, appUser }: Props) {
  const { t } = useTranslation();

  // Derive initial like state from likedBy
  const initiallyLiked = useMemo(
    () =>
      Array.isArray(post.likedBy) &&
      !!appUser?.userId &&
      post.likedBy.includes(appUser.userId),
    [post.likedBy, appUser?.userId],
  );
  const [localLiked, setLocalLiked] = useState<boolean>(initiallyLiked);
  const [localLikes, setLocalLikes] = useState<number>(
    post.likesCount ?? post.likes ?? 0,
  );
  const commentSheetRef = useRef<BottomSheetRef | null>(null);

  const handleLiked = useCallback(async () => {
    const uid = appUser?.userId;
    if (!uid) return;
    try {
      const postRef = firestore().collection('posts').doc(post.id);

      if (localLiked) {
        // Unlike: remove uid from likedBy, decrement likesCount
        setLocalLiked(false);
        setLocalLikes(prev => Math.max(0, prev - 1));
        await postRef.update({
          likedBy: firestore.FieldValue.arrayRemove(uid),
          likesCount: firestore.FieldValue.increment(-1),
        });
      } else {
        // Like: add uid to likedBy, increment likesCount
        setLocalLiked(true);
        setLocalLikes(prev => prev + 1);
        await postRef.update({
          likedBy: firestore.FieldValue.arrayUnion(uid),
          likesCount: firestore.FieldValue.increment(1),
        });
      }
    } catch (e) {
      // Revert on failure
      setLocalLiked(prev => !prev);
      setLocalLikes(prev => (localLiked ? prev + 1 : Math.max(0, prev - 1)));
      console.warn('Like toggle failed:', e);
    }
  }, [appUser?.userId, post.id, localLiked]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={{ uri: post.imgUrl }} style={styles.avatar} />
        <View style={styles.authorCol}>
          <Text style={styles.authorName}>{post.userName}</Text>
          {/* <Text style={styles.authorTitle}>{post.authorTitle}</Text> */}
        </View>
        <View style={styles.headerRight}>
          {post?.createdAtISO && (
            <Text style={styles.time}>{timeAgo(post?.createdAtISO)}</Text>
          )}
          <TouchableOpacity style={styles.moreBtn}>
            <Icon
              name="dots-horizontal"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.desc}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.commentRow}
          onPress={() => commentSheetRef?.current?.present()}
        >
          <Icon name="comment-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.commentText}>{t('home.post.comment')}</Text>
        </TouchableOpacity>

        <View style={styles.likesRow}>
          <Text style={styles.likes}>
            {localLikes} {t('home.post.likes')}
          </Text>
          <TouchableOpacity onPress={handleLiked}>
            <Icon
              name={localLiked ? 'thumb-up' : 'thumb-up-outline'}
              size={20}
              color={localLiked ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <CommentsSheet
        postId={post.id}
        appUser={appUser}
        commentSheetRef={commentSheetRef}
      />
    </View>
  );
}

const AVATAR = 40;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
  },
  authorCol: { flex: 1 },
  authorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  authorTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  moreBtn: { padding: spacing.xs },
  content: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'left',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  commentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  likesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  likes: { ...typography.caption, color: colors.textSecondary },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  inputMock: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.inputBackground,
  },
  inputPlaceholder: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
