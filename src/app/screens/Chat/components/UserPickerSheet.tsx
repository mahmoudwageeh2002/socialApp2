// src/components/UserPickerSheet.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppUserLite, getUsersForPicker } from '../services/chatService';
import BottomSheetComponent, {
  BottomSheetRef,
} from '../../../../components/common/BottomSheetComponent';
import { colors, spacing, typography } from '../../../../theme';

export interface UserPickerSheetRef {
  present: () => void;
  dismiss: () => void;
  refresh: () => void;
}

type Props = {
  myUserId: string;
  onPick: (user: AppUserLite) => void;
  title?: string;
};

const AVATAR = 44;

const UserPickerSheet = forwardRef<UserPickerSheetRef, Props>(
  ({ myUserId, onPick, title = 'New message' }, ref) => {
    const sheetRef = useRef<BottomSheetRef>(null);

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<AppUserLite[]>([]);
    const [query, setQuery] = useState('');

    const loadUsers = async () => {
      if (!myUserId) return;
      setLoading(true);
      try {
        const list = await getUsersForPicker(myUserId);
        setUsers(list);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      present: async () => {
        if (users.length === 0) await loadUsers();
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
      refresh: () => loadUsers(),
    }));

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return users;

      return users.filter(u => {
        const name = (u.name ?? '').toLowerCase();
        const username = (u.username ?? '').toLowerCase();
        return name.includes(q) || username.includes(q);
      });
    }, [users, query]);

    const renderItem = ({ item }: { item: AppUserLite }) => (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => {
          sheetRef.current?.dismiss();
          onPick(item);
        }}
      >
        <Image
          source={{ uri: item.imgUrl || 'https://placehold.co/100x100' }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {!!item.username && (
            <Text style={styles.username}>@{item.username}</Text>
          )}
        </View>
        <Icon name="chevron-right" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    );

    return (
      <BottomSheetComponent
        ref={sheetRef}
        snapPoints={['70%', '100%']}
        backgroundColor={colors.card}
        scrollable
        showCloseIcon
        onClose={() => setQuery('')}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadUsers}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Icon name="refresh" size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name or username..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {loading && users.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading users…</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.userId}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.muted}>No users found</Text>
              </View>
            }
          />
        )}
      </BottomSheetComponent>
    );
  },
);

export default UserPickerSheet;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  title: { ...typography.h4, color: colors.textPrimary },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.border,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  username: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  center: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  muted: { ...typography.caption, color: colors.textSecondary },
});
