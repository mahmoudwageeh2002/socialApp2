/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  I18nManager,
  Alert,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';

type Props = {
  onPost?: (payload: { text: string; image?: Asset | null }) => void;
  appUser: {
    userId: string;
    name: string;
    username: string;
    bio: string;
    imgUrl?: string;
  } | null;
};

export default function AddPost({ onPost, appUser }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [image, setImage] = useState<Asset | null>(null);
  const [posting, setPosting] = useState(false);
  console.log('Picked appUser:', appUser);

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });
    if (res.assets?.[0]) setImage(res.assets[0]);
  };

  const removeImage = () => setImage(null);

  const canPost = text.trim().length > 0 || !!image;

  const handlePost = async () => {
    try {
      if (!canPost || !appUser?.userId) return;
      setPosting(true);

      const words = text.trim().split(/\s+/);
      const title = words.slice(0, 3).join(' ');
      const desc = text.trim();

      const docRef = firestore().collection('posts').doc();
      const payload = {
        id: docRef.id,
        title,
        desc,
        imgUrl: appUser?.imgUrl || '', // empty string if no image
        userId: appUser.userId,
        userName: appUser.name,
        comments: [] as string[],
        tags: [] as string[],
        saved: false,
        likesCount: 0, // NEW
        likedBy: [] as string[], // NEW
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtISO: new Date().toISOString(), // Add ISO version
      };
      await docRef.set(payload);

      // Optional callback to parent
      onPost?.({ text: desc, image });

      setText('');
      setImage(null);
      Alert.alert(t('common.success'), t('home.addPost.posted'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          source={{ uri: appUser?.imgUrl || 'https://placehold.co/100x100' }}
          style={styles.avatar}
        />
        <TextInput
          style={styles.input}
          placeholder={t('home.addPost.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />
      </View>

      {/* Image preview */}
      {image?.uri && (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
            <Icon name="close" size={18} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionsRow}>
        {/* {!image && (
          <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
            <Icon name="image-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.mediaText}>{t('home.addPost.addMedia')}</Text>
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          style={[styles.postBtn, (!canPost || posting) && { opacity: 0.5 }]}
          disabled={!canPost || posting}
          onPress={handlePost}
          activeOpacity={0.9}
        >
          <Text style={styles.postText}>
            {posting ? t('common.loading') : t('home.addPost.post')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  previewWrapper: {
    marginTop: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  removeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mediaText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  postBtn: {
    paddingHorizontal: spacing.xl,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postText: {
    ...typography.buttonBold,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
