import database from '@react-native-firebase/database';

export function setTyping(chatId: string, uid: string, isTyping: boolean) {
  return database().ref(`/typing/${chatId}/${uid}`).set(isTyping);
}

export function subscribeTyping(
  chatId: string,
  otherUid: string,
  cb: (typing: boolean) => void,
) {
  const ref = database().ref(`/typing/${chatId}/${otherUid}`);
  const onValue = ref.on('value', snap => cb(!!snap.val()));
  return () => ref.off('value', onValue as any);
}
