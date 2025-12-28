/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../../theme';
import PostCard from '../../Home/components/PostCard';
import { PostDoc } from '../../../../types/Post';
import useAuth from '../../../../hooks/useAuth';

type Props = { posts: PostDoc[] };

export default function SavedTab({ posts }: Props) {
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
            Coming Soon.
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
