/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { colors, spacing, typography } from '../../../../theme';
import PostCard from '../../Home/components/PostCard';
import useAuth from '../../../../hooks/useAuth';
import { PostDoc } from '../../../../types/Post';

type Props = { posts: PostDoc[] };

export default function PostsTab({ posts }: Props) {
  const { appUser } = useAuth();

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <PostCard post={item} appUser={appUser} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View
          style={{
            padding: spacing.lg,
            marginStart: 'auto',
            marginEnd: 'auto',
            marginTop: spacing.xxl,
          }}
        >
          <Text
            style={{
              ...typography.body,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            No saved posts yet.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
  },
});
