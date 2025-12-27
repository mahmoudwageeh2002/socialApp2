/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type AppUser = {
  userId: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  imgUrl?: string; // add avatar url
};

type UseAuthResult = {
  firebaseUser: FirebaseAuthTypes.User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export default function useAuth(): UseAuthResult {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthTypes.User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep Firestore unsubscribe reference
  const [userUnsub, setUserUnsub] = useState<(() => void) | null>(null);

  const attachUserDocListener = useCallback(
    (uid: string) => {
      // Detach previous listener
      if (userUnsub) {
        userUnsub();
        setUserUnsub(null);
      }
      const unsubscribe = firestore()
        .collection('users')
        .doc(uid)
        .onSnapshot(
          snap => {
            if (snap.exists()) {
              const data = snap.data() as AppUser;
              setAppUser({
                userId: data.userId ?? uid,
                name: data.name ?? '',
                email: data.email ?? '',
                username: data.username ?? '',
                bio: data.bio ?? '',
                imgUrl: data.imgUrl ?? undefined,
              });
            } else {
              // Document missing: clear appUser but keep firebaseUser
              setAppUser(null);
            }
            setLoading(false);
            setError(null);
          },
          err => {
            setError(err?.message ?? 'Failed to load user profile');
            setLoading(false);
          },
        );
      setUserUnsub(() => unsubscribe);
    },
    [userUnsub],
  );

  useEffect(() => {
    const authUnsub = auth().onAuthStateChanged(user => {
      setFirebaseUser(user);
      setLoading(true);
      setError(null);

      if (user?.uid) {
        attachUserDocListener(user.uid);
      } else {
        // signed out
        if (userUnsub) {
          userUnsub();
          setUserUnsub(null);
        }
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (userUnsub) userUnsub();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      if (!firebaseUser?.uid) return;
      setLoading(true);
      const doc = await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .get();
      if (doc.exists()) {
        const data = doc.data() as AppUser;
        setAppUser({
          userId: data.userId ?? firebaseUser.uid,
          name: data.name ?? '',
          email: data.email ?? '',
          username: data.username ?? '',
          bio: data.bio ?? '',
          imgUrl: data.imgUrl ?? undefined,
        });
      } else {
        setAppUser(null);
      }
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh user profile');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  return { firebaseUser, appUser, loading, error, refresh };
}
