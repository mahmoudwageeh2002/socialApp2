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
import { useDeliveredGlobal } from './src/app/screens/Chat/hooks/useDeliveredGlobal';
import useAuth from './src/hooks/useAuth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  // const isDarkMode = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);
  const { appUser } = useAuth();
  const myUid = appUser?.userId ?? '';
  console.log('App myUid=', myUid);

  useEffect(() => {
    loadSavedLanguage().finally(() => setReady(true));
  }, []);
  useDeliveredGlobal(myUid); // ✅ run globally while app is open

  if (!ready) return null;
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
