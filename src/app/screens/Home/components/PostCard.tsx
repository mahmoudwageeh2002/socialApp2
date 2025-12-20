import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  I18nManager,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

export type Post = {
  id: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  timeAgo: string; // dummy data
  content: string; // dummy data
  likes: number; // dummy data
};

type Props = { post: Post };

export default function PostCard({ post }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
        <View style={styles.authorCol}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.authorTitle}>{post.authorTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.time}>{post.timeAgo}</Text>
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
      <Text style={styles.content}>{post.content}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.commentRow}>
          <Icon name="comment-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.commentText}>{t('home.post.comment')}</Text>
        </TouchableOpacity>

        <View style={styles.likesRow}>
          <Text style={styles.likes}>
            {post.likes} {t('home.post.likes')}
          </Text>
          <Icon
            name="thumb-up-outline"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </View>

      {/* Comment input mock */}
      <View style={styles.commentInputRow}>
        <Image
          source={{ uri: 'https://placekitten.com/80/80' }}
          style={styles.smallAvatar}
        />
        <View style={styles.inputMock}>
          <TextInput
            style={styles.inputPlaceholder}
            placeholder={t('home.post.addComment')}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
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
