import { useState } from 'react';
import { View } from 'react-native';
import TabBar, { TabItem } from '../../../../components/common/TabBar';
import GeneralTab from './genralTab';
import AccountTab from './accountTab';
import LogoutTab from './logoutTab';
import { useTranslation } from 'react-i18next';
export function InnerSettings() {
  const { t } = useTranslation();
  const [settingsTab, setSettingsTab] = useState<
    'general' | 'account' | 'logout'
  >('general');
  const tabs: TabItem[] = [
    { key: 'general', label: t('profile.tabs.general') },
    { key: 'account', label: t('profile.tabs.account') },
    { key: 'logout', label: t('profile.tabs.actions') },
  ];

  return (
    <View>
      <TabBar tabs={tabs} active={settingsTab} setActive={setSettingsTab} />
      {settingsTab === 'general' && <GeneralTab />}
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
        <LogoutTab onLogout={() => {}} onDeactivate={() => {}} />
      )}
    </View>
  );
}
