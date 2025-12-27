/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Header from '../../../components/common/Heeader';
import PostCard from './components/PostCard';
import { colors } from '../../../theme';
import { spacing } from '../../../theme';
import AddPost from './components/AddPost';
import useAuth from '../../../hooks/useAuth';
import firestore from '@react-native-firebase/firestore';
import { PostDoc } from '../../../types/Post';

export default function HomeScreen() {
  const { appUser } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time listener
  useEffect(() => {
    const unsub = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          const list: PostDoc[] = [];
          snap.forEach(doc => {
            const data = doc.data() as PostDoc;
            list.push({ ...data, id: doc.id });
          });
          setPosts(list);
          console.log('Posts updated. Total:', posts);
        },
        err => {
          console.warn('Posts listen failed:', err);
        },
      );
    return unsub;
  }, []);

  const fetchOnce = useCallback(async () => {
    try {
      const snap = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .get();
      const list: PostDoc[] = snap.docs.map(d => ({
        ...(d.data() as PostDoc),
        id: d.id,
      }));
      setPosts(list);
    } catch (e) {
      console.warn('Refresh posts failed:', e);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOnce();
    setRefreshing(false);
  }, [fetchOnce]);

  return (
    <View style={styles.screen}>
      <Header />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={<AddPost appUser={appUser} onPost={onRefresh} />}
        renderItem={({ item }) => <PostCard post={item} appUser={appUser} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
