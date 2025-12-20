/* eslint-disable @typescript-eslint/no-unused-vars */
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import i18n, { loadSavedLanguage } from '../../localization/i18n';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    loadSavedLanguage(); // apply persisted language
    const checkAuth = async () => {
      // TODO: get token from secure storage / redux
      const token = null;
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      {true ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
