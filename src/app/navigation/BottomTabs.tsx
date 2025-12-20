/* eslint-disable react/no-unstable-nested-components */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import SearchStack from './SearchStack';
import NotificationsStack from './NotificationsStack';
import ProfileStack from './ProfileStack';
// @ts-ignore: no declaration file for 'react-native-vector-icons/AntDesign'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../theme';
import { useTranslation } from 'react-i18next';
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name={t('navigation.home')}
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t('navigation.search')}
        component={SearchStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="search1" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t('navigation.notifications')}
        component={NotificationsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="bells" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t('navigation.profile')}
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
