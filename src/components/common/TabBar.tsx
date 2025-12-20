import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { typography } from '../../theme/typography';

export type TabItem = {
  key: string;
  label?: string;
  icon?: React.ReactNode;
};

type Props = {
  tabs: TabItem[];
  active: string;
  setActive: any;
  fullWidth?: boolean;
};

export default function TabBar({ tabs, active, setActive, fullWidth }: Props) {
  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => setActive(tab.key)}
            activeOpacity={0.8}
          >
            {tab.icon ? (
              <View style={[styles.iconWrapper, isActive && styles.iconActive]}>
                {tab.icon}
              </View>
            ) : null}
            {tab.label ? (
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-evenly',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  tab: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.inputBackground,
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    ...typography.h4,
    fontSize: 16,

    color: colors.textSecondary,
  },
  labelActive: {
    ...typography.h4,
    fontSize: 16,
    color: colors.main,
  },
});
