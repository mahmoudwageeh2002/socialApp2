/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  I18nManager,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  SectionList,
  SectionListData,
} from 'react-native';
import Header from '../../../components/common/Heeader';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../../theme';
import firestore from '@react-native-firebase/firestore';
import { PostDoc } from '../../../types/Post';
import useAuth from '../../../hooks/useAuth';
import PostCard from '../Home/components/PostCard';
import { useNavigation } from '@react-navigation/native';

type UserDoc = {
  userId: string;
  name: string;
  username?: string;
  imgUrl?: string;
};

const SearchScreen = () => {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim().toLowerCase();
    if (!q) {
      setUsers([]);
      setPosts([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const usersSnap = await firestore().collection('users').limit(50).get();
        const allUsers = usersSnap.docs.map(d => d.data() as any);
        const filteredUsers: UserDoc[] = allUsers
          .filter(
            (u: any) =>
              (u.name && String(u.name).toLowerCase().includes(q)) ||
              (u.username && String(u.username).toLowerCase().includes(q)),
          )
          .map((u: any) => ({
            userId: u.userId ?? u.id ?? '',
            name: u.name ?? '',
            username: u.username ?? '',
            imgUrl: u.imgUrl ?? '',
          }));

        const postsSnap = await firestore()
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();
        const filteredPosts: PostDoc[] = postsSnap.docs
          .map(d => ({ ...(d.data() as PostDoc), id: d.id }))
          .filter(
            p =>
              (p.title && p.title.toLowerCase().includes(q)) ||
              (p.desc && p.desc.toLowerCase().includes(q)) ||
              (Array.isArray(p.tags) &&
                p.tags.join(' ').toLowerCase().includes(q)),
          );

        setUsers(filteredUsers);
        setPosts(filteredPosts);
      } catch (e) {
        console.warn('Search failed:', e);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  const sections: SectionListData<any>[] = [
    { title: t('search.users'), data: users, key: 'users' },
    { title: t('search.posts'), data: posts, key: 'posts' },
  ] as any;

  const renderItem = ({ item, section }: { item: any; section: any }) => {
    if (section.key === 'users') {
      const u = item as UserDoc;
      return (
        <TouchableOpacity
          style={styles.userCard}
          // onPress={() =>
          //   navigation.navigate('UserDetailsScreen', { userId: u.userId })
          // }
        >
          <Image
            source={{ uri: u.imgUrl || 'https://placehold.co/100x100' }}
            style={styles.userAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{u.name}</Text>
            {!!u.username && (
              <Text style={styles.userHandle}>@{u.username}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    // posts
    const p = item as PostDoc;
    return (
      <View style={{}}>
        <PostCard
          post={p}
          appUser={appUser}
          onCardPress={() => {
            navigation.navigate('Tabs', {
              screen: 'Home',
              params: { screen: 'PostDetailsScreen', params: { post: p } },
            });
          }}
        />
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => {
    const isEmpty = !section.data?.length;
    if (isEmpty) return null;
    return <Text style={styles.sectionTitle}>{section.title}</Text>;
  };

  return (
    <>
      <Header title={t('search.title')} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searching && (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item, index) =>
            (item.id || item.userId || index.toString()) + ''
          }
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginHorizontal: spacing.xl,
  },
  loaderRow: { paddingVertical: spacing.md },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '600',
    marginHorizontal: spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginStart: spacing.xl,
  },
  userName: { color: colors.textPrimary, fontWeight: '600' },
  userHandle: { color: colors.textSecondary },
});

export default SearchScreen;
