/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  I18nManager,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type Props = {
  appUser: {
    name: string;
    username: string;
    bio: string;
    imgUrl?: string;
  } | null;
  onSaved?: () => void; // callback to notify parent to refresh
};
const API_SECRET = 'oDkumEaqxzscKD8ARC2Pnb7scQI';
const API_KEY = '574669169975391';
const CLOUD_NAME = 'dnjdiiktw';
export default function GeneralTab({ appUser, onSaved }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(appUser?.name ?? '');
  const [username, setUsername] = useState(appUser?.username ?? '');
  const [bio, setBio] = useState(appUser?.bio ?? '');
  const [avatar, setAvatar] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });
    if (res.assets?.[0]) setAvatar(res.assets[0]);
  };

  const uploadToCloudinary = async (asset: Asset): Promise<string> => {
    const cloudName = CLOUD_NAME;
    const apiKey = API_KEY;
    const apiSecret = API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary env keys missing');
    }

    // Build form data for upload
    const form = new FormData();
    // In Cloudinary, you typically use an unsigned upload preset for client apps.
    // If you have an unsigned preset, replace 'unsigned_preset' below.
    // If you must sign client-side (not recommended), provide a server. Here we use unsigned preset.
    form.append('file', {
      // @ts-ignore
      uri: asset.uri,
      type: asset.type ?? 'image/jpeg',
      name: asset.fileName ?? `avatar_${Date.now()}.jpg`,
    });
    form.append('upload_preset', 'socialawy'); // TODO: replace with your preset
    form.append('folder', 'avatars');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const res = await fetch(url, {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? 'Cloudinary upload failed');
    }
    return json.secure_url as string;
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      let imgUrl = appUser?.imgUrl ?? undefined;
      if (avatar?.uri) {
        imgUrl = await uploadToCloudinary(avatar);
      }

      await firestore()
        .collection('users')
        .doc(uid)
        .set(
          {
            userId: uid,
            name: fullName.trim(),
            username: username.trim(),
            bio: bio.trim(),
            ...(imgUrl ? { imgUrl } : {}),
          },
          { merge: true },
        );

      onSaved?.();
      Alert.alert(t('common.success'), t('profile.general.saved'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar picker */}
      <TouchableOpacity
        style={styles.avatarPicker}
        activeOpacity={0.8}
        onPress={pickImage}
      >
        {avatar?.uri || appUser?.imgUrl ? (
          <Image
            source={{ uri: avatar?.uri ?? appUser?.imgUrl! }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <Icon
            name="cloud-upload-outline"
            size={20}
            color={colors.textSecondary}
          />
        )}
        <Text style={styles.avatarText}>
          {t('profile.general.chooseAvatar')}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder={t('profile.general.fullName')}
        placeholderTextColor={colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('profile.general.username')}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.textarea}
        placeholder={t('profile.general.bio')}
        placeholderTextColor={colors.textSecondary}
        multiline
        value={bio}
        onChangeText={setBio}
      />
      <TouchableOpacity disabled={saving} onPress={saveChanges}>
        <Text style={[styles.saveButton, saving && { opacity: 0.6 }]}>
          {saving ? t('common.loading') : t('profile.general.saveChanges')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  avatarPicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBackground,
  },
  avatarText: { ...typography.body, color: colors.textSecondary },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    ...typography.body,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  saveButton: {
    color: colors.card,
    ...typography.button,
    textAlign: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
});
