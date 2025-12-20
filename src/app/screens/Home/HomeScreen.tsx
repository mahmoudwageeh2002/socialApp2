import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Header from '../../../components/common/Heeader';
import PostCard from './components/PostCard';
import { colors } from '../../../theme';
import { spacing } from '../../../theme';
import AddPost from './components/AddPost';

export default function HomeScreen() {
  // Demo data
  const posts = useMemo(
    () => [
      {
        id: '1',
        authorName: 'Bessie Cooper',
        authorTitle: 'Digital Marketer',
        authorAvatar: 'https://placehold.co/100x100',
        timeAgo: '7 hours ago',
        content:
          "In today's fast-paced, digitally driven world, digital marketing is not just a strategy; it's a necessity for businesses of all sizes. 📈",
        likes: 270,
      },
      {
        id: '2',
        authorName: 'Daniel Brown',
        authorTitle: 'Digital Marketer',
        authorAvatar: 'https://placehold.co/100x100',
        timeAgo: '1 hour ago',
        content:
          'Fantastic post! Your content always brings a smile to my face. Keep up the great work! 👏',
        likes: 58,
      },
    ],
    [],
  );

  return (
    <View style={styles.screen}>
      <Header />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={<AddPost />}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
