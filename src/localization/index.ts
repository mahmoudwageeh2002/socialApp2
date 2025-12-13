type Dict = Record<string, string>;
type Bundle = { [ns: string]: Dict };
type Locale = 'en' | 'ar';

import en from './en.json';
import ar from './ar.json';

const bundles: Record<Locale, Bundle> = { en, ar };

let currentLocale: Locale = 'en';

export const setLanguage = (locale: Locale) => {
  currentLocale = locale;
};

export const t = (key: string): string => {
  // key like "auth.login"
  const [ns, item] = key.split('.');
  const dict = bundles[currentLocale]?.[ns];
  const value = dict?.[item];
  return value ?? key;
};
