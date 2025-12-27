import { useState } from 'react';
import { View } from 'react-native';
import TabBar, { TabItem } from '../../../../components/common/TabBar';
import GeneralTab from './genralTab';
import AccountTab from './accountTab';
import LogoutTab from './logoutTab';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
export function InnerSettings({
  appUser,
}: {
  appUser: {
    name: string;
    username: string;
    bio: string;
    imgUrl?: string;
  } | null;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [settingsTab, setSettingsTab] = useState<
    'general' | 'account' | 'logout'
  >('general');
  const tabs: TabItem[] = [
    { key: 'general', label: t('profile.tabs.general') },
    { key: 'account', label: t('profile.tabs.account') },
    { key: 'logout', label: t('profile.tabs.actions') },
  ];

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.setItem('isAuthenticated', 'false');
      // Optional: pop to root to let RootNavigator render AuthNavigator
      // @ts-ignore
      navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
    } catch (e) {
      console.warn('Logout failed:', e);
    }
  };

  // expose refresh via useAuth so parent can update after save
  // Alternatively, lift refresh down via props; simplest is to call onSaved which parent wires to useAuth.refresh.
  return (
    <View>
      <TabBar tabs={tabs} active={settingsTab} setActive={setSettingsTab} />
      {settingsTab === 'general' && (
        <GeneralTab
          appUser={appUser}
          onSaved={() => {
            /* parent can pass; in ProfileScreen, handle via refresh */
          }}
        />
      )}
      {settingsTab === 'account' && (
        <AccountTab
          data={{
            email: 'robert@example.com',
            phone: '+1 555-0101',
            joined: 'Jan 2024',
            plan: 'Pro',
          }}
        />
      )}
      {settingsTab === 'logout' && (
        <LogoutTab onLogout={handleLogout} onDeactivate={() => {}} />
      )}
    </View>
  );
}
