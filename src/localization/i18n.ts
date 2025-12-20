import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';

import en from './en.json';
import ar from './ar.json';

export const LANGUAGE_KEY = 'app_language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/**
 * Change language + direction + restart app
 */
export async function setLanguage(lang: 'en' | 'ar') {
  const isRTL = lang === 'ar';

  await AsyncStorage.setItem(LANGUAGE_KEY, lang);

  // Change i18n language
  await i18n.changeLanguage(lang);

  // Change layout direction
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);

  // Restart app to apply direction
  RNRestart.restart();
}

/**
 * Load saved language on app start
 */
export async function loadSavedLanguage() {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  const lang = saved === 'ar' ? 'ar' : 'en';

  const isRTL = lang === 'ar';

  await i18n.changeLanguage(lang);
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

export default i18n;
