import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

export async function startPresence() {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  const ref = database().ref(`status/${uid}`);

  // mark online now
  await ref.set({
    state: 'online',
    lastChanged: database.ServerValue.TIMESTAMP,
  });

  // when app disconnects (killed / network drop), mark offline
  ref.onDisconnect().set({
    state: 'offline',
    lastChanged: database.ServerValue.TIMESTAMP,
  });
}
