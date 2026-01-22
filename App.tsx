/**
 * App.tsx
 * React Native app with FCM notifications
 */

import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

import RootNavigator from './src/app/navigation/RootNavigator';
import { loadSavedLanguage } from './src/localization/i18n';
import { useDeliveredGlobal } from './src/app/screens/Chat/hooks/useDeliveredGlobal';
import useAuth from './src/hooks/useAuth';

// Firebase
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// ✅ use your shared notification helpers
import {
  createDefaultChannel,
  requestUserPermission,
  syncFcmTokenToUser,
} from './src/hooks/notifications';
import { addNotification } from './src/app/screens/Notifications/hooks/useNotifications';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const App = () => {
  const [ready, setReady] = useState(false);
  const { appUser } = useAuth();
  const myUid = appUser?.userId ?? '';

  useDeliveredGlobal(myUid);

  useEffect(() => {
    loadSavedLanguage().finally(() => setReady(true));

    // ✅ make sure channel exists early (Android)
    createDefaultChannel();

    // ✅ request permission + token
    requestUserPermission().then(granted => {
      if (granted) {
        // ✅ save token so Cloud Function can notify others
        syncFcmTokenToUser(myUid).catch(() => {});
      }
    });

    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      const id =
        remoteMessage.messageId ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const title = remoteMessage.notification?.title ?? 'New Notification';
      const body = remoteMessage.notification?.body ?? '';

      // You can pass these via remoteMessage.data from your server
      const name = remoteMessage.data?.name ?? title;
      const avatar =
        remoteMessage.data?.avatar ?? 'https://placehold.co/100x100';

      await addNotification({
        id,
        name,
        avatar,
        message: body,
        createdAt: Date.now(),
      });

      await notifee.displayNotification({
        title,
        body,
        android: { channelId: 'default', importance: AndroidImportance.HIGH },
      });
    });

    const unsubscribeToken = messaging().onTokenRefresh(async token => {
      console.log('FCM token refreshed:', token);
      if (!myUid) return;

      // add refreshed token to Firestore
      await firestore()
        .doc(`users/${myUid}`)
        .set(
          { fcmTokens: firestore.FieldValue.arrayUnion(token) },
          { merge: true },
        );
    });

    return () => {
      unsubscribeMessage();
      unsubscribeToken();
    };
  }, [myUid]);

  if (!ready) return null;

  return (
    <Host>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Host>
  );
};

export default App;
