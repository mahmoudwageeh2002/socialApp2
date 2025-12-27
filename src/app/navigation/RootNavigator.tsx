/* eslint-disable @typescript-eslint/no-unused-vars */
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import i18n, { loadSavedLanguage } from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadSavedLanguage(); // apply persisted language

    // Sync with Firebase Auth state
    const unsubscribe = auth().onAuthStateChanged(async user => {
      const authed = !!user;
      setIsAuthenticated(authed);
      await AsyncStorage.setItem('isAuthenticated', authed ? 'true' : 'false');
      console.log('Auth status:', authed);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
