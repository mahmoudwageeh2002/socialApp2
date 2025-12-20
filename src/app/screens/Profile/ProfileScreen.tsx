/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { act } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors, spacing } from '../../../theme';
import { typography } from '../../../theme/typography';
import Header from '../../../components/common/Heeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TabBar, { TabItem } from '../../../components/common/TabBar';
import PostsTab from './tabs/postsTab';
import SavedTab from './tabs/savedTab';

import { Post } from '../Home/components/PostCard';
import { InnerSettings } from './tabs/settteingsTab';
import { useTranslation } from 'react-i18next';

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
  // Dummy posts
  const posts: Post[] = React.useMemo(
    () => [
      {
        id: 'p1',
        authorName: 'Robert Fox',
        authorTitle: 'Software Engineer',
        authorAvatar: dummy.avatar,
        timeAgo: '3h',
        content:
          "Loving the new UI tweaks I'm working on. Simplicity wins every time! ✨",
        likes: 42,
      },
      {
        id: 'p2',
        authorName: 'Robert Fox',
        authorTitle: 'Software Engineer',
        authorAvatar: dummy.avatar,
        timeAgo: '1d',
        content:
          'Experimenting with animations in React Native Reanimated. Any tips? 🔧',
        likes: 87,
      },
    ],
    [],
  );

  const saved: Post[] = React.useMemo(
    () => [
      {
        id: 's1',
        authorName: 'Bessie Cooper',
        authorTitle: 'Digital Marketer',
        authorAvatar: 'https://placehold.co/100x100',
        timeAgo: '5h',
        content:
          'Batch creating content has boosted my productivity this week! 📈',
        likes: 270,
      },
      {
        id: 's2',
        authorName: 'Daniel Brown',
        authorTitle: 'Digital Marketer',
        authorAvatar: 'https://placehold.co/100x100',
        timeAgo: '2d',
        content: 'Great design is invisible. Keep iterating. 👏',
        likes: 58,
      },
    ],
    [],
  );

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
            <Image source={{ uri: dummy.avatar }} style={styles.avatar} />

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
              <Text style={styles.name}>{dummy.name}</Text>
              <Text style={styles.handle}>{` ${dummy.handle}`}</Text>
            </View>
            <Text style={styles.bio}>{dummy.bio}</Text>
          </View>
        </View>

        <TabBar tabs={tabs} active={activeTab} setActive={setActiveTab} />
        {activeTab === 'posts' && <PostsTab posts={posts} />}
        {activeTab === 'saved' && <SavedTab posts={saved} />}
        {activeTab === 'settings' && (
          <View style={styles.settingsWrapper}>
            <InnerSettings />
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
