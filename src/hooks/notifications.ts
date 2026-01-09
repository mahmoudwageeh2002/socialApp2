/* eslint-disable @typescript-eslint/no-unused-vars */
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { request, RESULTS } from 'react-native-permissions';

export async function createDefaultChannel() {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

function getAndroidApiLevel(): number {
  const v = Platform.Version;
  return typeof v === 'string' ? Number.parseInt(v, 10) : v;
}

export async function requestUserPermission() {
  let granted = false;

  if (Platform.OS === 'ios') {
    const status = await messaging().requestPermission();
    granted =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;
  } else {
    const apiLevel = getAndroidApiLevel();

    if (apiLevel >= 33) {
      // ✅ Use raw string to avoid undefined PERMISSIONS constant
      const result = await request('android.permission.POST_NOTIFICATIONS');
      granted = result === RESULTS.GRANTED;
    } else {
      granted = true;
    }
  }

  console.log('Notification permission granted:', granted);

  if (granted) {
    await getFcmToken();
  }

  return granted;
}

export async function getFcmToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

// Optional: display a local notification
export async function displayNotification(title: string, body: string) {
  await createDefaultChannel(); // ✅ ensure channel exists before notify

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
    },
  });
}
