import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';
import PostCard, { Post } from '../../Home/components/PostCard';

type Props = { posts: Post[] };

export default function PostsTab({ posts }: Props) {
  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
  },
});
