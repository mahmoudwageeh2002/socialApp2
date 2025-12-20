/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/app/navigation/RootNavigator';
import { useEffect, useState } from 'react';
import { loadSavedLanguage } from './src/localization/i18n';

function App() {
  // const isDarkMode = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage().finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
