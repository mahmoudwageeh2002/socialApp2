/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import BottomSheetComponent, {
  BottomSheetRef,
} from '../../../../components/common/BottomSheetComponent';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PostDoc } from '../../../../types/Post';

type Props = {
  post: PostDoc;
  appUser: { userId: string; name: string } | null;
  sheetRef: React.RefObject<BottomSheetRef | null>;
  onDeleted?: () => void;
};

export default function PostActionsSheet({
  post,
  appUser,
  sheetRef,
  onDeleted,
}: Props) {
  const isSaved = useMemo(() => {
    const savedArr = Array.isArray(post.saved) ? post.saved : [];
    return !!appUser?.userId && savedArr.includes(appUser.userId);
  }, [post.saved, appUser?.userId]);

  const canDelete = useMemo(
    () => appUser?.userId && post.userId === appUser.userId,
    [appUser?.userId, post.userId],
  );

  const toggleSave = async () => {
    if (!appUser?.userId) return;
    try {
      const ref = firestore().collection('posts').doc(post.id);
      if (isSaved) {
        await ref.update({
          saved: firestore.FieldValue.arrayRemove(appUser.userId),
        });
      } else {
        await ref.update({
          saved: firestore.FieldValue.arrayUnion(appUser.userId),
        });
      }
      sheetRef.current?.dismiss();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update save state');
    }
  };

  const deletePost = async () => {
    if (!canDelete) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('posts').doc(post.id).delete();
            sheetRef.current?.dismiss();
            onDeleted?.();
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Failed to delete post');
          }
        },
      },
    ]);
  };

  return (
    <BottomSheetComponent
      ref={sheetRef}
      snapPoints={['auto']}
      //   modalHeight={240}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleSave}>
          <Icon
            name={isSaved ? 'bookmark-remove' : 'bookmark-plus'}
            size={22}
            color={colors.textPrimary}
          />
          <Text style={styles.actionText}>{isSaved ? 'Unsave' : 'Save'}</Text>
        </TouchableOpacity>

        {canDelete ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={deletePost}
          >
            <Icon name="delete" size={22} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </BottomSheetComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deleteBtn: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
