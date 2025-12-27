/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { act, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import Header from '../../../components/common/Heeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TabBar, { TabItem } from '../../../components/common/TabBar';
import PostsTab from './tabs/postsTab';
import SavedTab from './tabs/savedTab';
import firestore from '@react-native-firebase/firestore';

import { InnerSettings } from './tabs/settteingsTab';
import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import { PostDoc } from '../../../types/Post';

const dummy = {
  avatar: 'https://placehold.co/140x140',
  name: 'Robert Fox',
  handle: '@robert',
  bio: 'Software Engineer',
  stats: { posts: 12, followers: 207, following: 64 },
};

const AVATAR = 72;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = React.useState<
    'posts' | 'saved' | 'settings'
  >('posts');
  const { t } = useTranslation();
  const { appUser, loading, refresh } = useAuth();
  const [myPosts, setMyPosts] = useState<PostDoc[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [savedPosts, setSavedPosts] = useState<PostDoc[]>([]);
  console.log('AppUser in ProfileScreen:', JSON.stringify(appUser, null, 2));

  // Listen to my posts when appUser is available
  useEffect(() => {
    if (!appUser?.userId) return;
    const unsub = firestore()
      .collection('posts')
      .where('userId', '==', appUser.userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const list: PostDoc[] = snap.docs.map(d => ({
            ...(d.data() as PostDoc),
            id: d.id,
          }));
          setMyPosts(list);
        },
        err => console.warn('My posts listen failed:', err),
      );
    return unsub;
  }, [appUser?.userId]);
  useEffect(() => {
    if (!appUser?.userId) return;
    const unsub = firestore()
      .collection('posts')
      .where('saved', 'array-contains', appUser.userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const list: PostDoc[] = snap.docs.map(d => ({
            ...(d.data() as PostDoc),
            id: d.id,
          }));
          setSavedPosts(list);
        },
        err => console.warn('saved posts listen failed:', err),
      );
    return unsub;
  }, [appUser?.userId]);
  // Optional manual refresh
  const fetchMyPostsOnce = useCallback(async () => {
    if (!appUser?.userId) return;
    try {
      const snap = await firestore()
        .collection('posts')
        .where('userId', '==', appUser.userId)
        .orderBy('createdAt', 'desc')
        .get();
      const list: PostDoc[] = snap.docs.map(d => ({
        ...(d.data() as PostDoc),
        id: d.id,
      }));
      setMyPosts(list);
    } catch (e) {
      console.warn('Refresh posts failed:', e);
    }
  }, [appUser?.userId]);
  const fetchSavedPosts = useCallback(async () => {
    if (!appUser?.userId) return;
    try {
      const snap = await firestore()
        .collection('posts')
        .where('saved', 'array-contains', appUser.userId)
        .orderBy('createdAt', 'desc')
        .get();
      const list: PostDoc[] = snap.docs.map(d => ({
        ...(d.data() as PostDoc),
        id: d.id,
      }));
      setSavedPosts(list);
    } catch (e) {
      console.warn('Refresh saved posts failed:', e);
    }
  }, [appUser?.userId]);
  const onMyPostsRefresh = () => {
    setRefreshing(true);
    fetchMyPostsOnce();
    setRefreshing(false);
  };
  const onSavedPostsRefresh = () => {
    setRefreshing(true);
    fetchSavedPosts();
    setRefreshing(false);
  };

  const tabs: TabItem[] = [
    {
      key: 'posts',
      icon: (
        <Icon
          name="view-grid-outline"
          size={24}
          color={activeTab === 'posts' ? colors.main : colors.textSecondary}
        />
      ),
    },
    {
      key: 'saved',
      icon: (
        <Icon
          name="bookmark-outline"
          size={24}
          color={activeTab === 'saved' ? colors.main : colors.textSecondary}
        />
      ),
    },
    {
      key: 'settings',
      icon: (
        <Icon
          name="cog-outline"
          size={24}
          color={activeTab === 'settings' ? colors.main : colors.textSecondary}
        />
      ),
    },
  ];

  return (
    <>
      <Header title={t('profile.title')} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Image
              source={{ uri: appUser?.imgUrl ?? dummy.avatar }}
              style={styles.avatar}
            />

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{dummy.stats.posts}</Text>
                <Text style={styles.statLabel}>{t('profile.stats.posts')}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{dummy.stats.followers}</Text>
                <Text style={styles.statLabel}>
                  {t('profile.stats.followers')}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{dummy.stats.following}</Text>
                <Text style={styles.statLabel}>
                  {t('profile.stats.following')}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{appUser?.name}</Text>
              <Text style={styles.handle}>{`@${appUser?.username}`}</Text>
            </View>
            {appUser?.bio && <Text style={styles.bio}>{appUser.bio}</Text>}
          </View>
        </View>

        <TabBar tabs={tabs} active={activeTab} setActive={setActiveTab} />
        {activeTab === 'posts' && (
          <PostsTab posts={myPosts} refresh={onMyPostsRefresh} />
        )}
        {activeTab === 'saved' && (
          <SavedTab posts={savedPosts} refresh={onSavedPostsRefresh} />
        )}
        {activeTab === 'settings' && (
          <View style={styles.settingsWrapper}>
            <InnerSettings appUser={appUser} />
            {/* Pass callback to refresh after save */}
            {/* If InnerSettings renders GeneralTab, wire onSaved below */}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing.xl,
  },
  statsRow: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.md,
  },
  stat: { alignItems: 'center' },
  statNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  info: { marginTop: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  handle: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'left',
  },
  settingsWrapper: {
    backgroundColor: colors.card,
  },
});

export default ProfileScreen;
