import { useState, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

type RegisterResult = {
  loading: boolean;
  error: string | null;
  registerWithEmail: (
    email: string,
    password: string,
    displayName?: string,
    username?: string,
  ) => Promise<void>;
  registerWithGoogle: () => Promise<void>;
};

export default function useRegister(): RegisterResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerWithEmail = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string,
      username?: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const cred = await auth().createUserWithEmailAndPassword(
          email.trim(),
          password,
        );

        // Optional: set displayName on the auth profile
        if (displayName) {
          await cred.user.updateProfile({ displayName });
        }

        // Create a user document in Firestore
        const uid = cred.user.uid;
        await firestore()
          .collection('users')
          .doc(uid)
          .set({
            userId: uid,
            name: displayName ?? '',
            email: email.trim(),
            username: username ?? '',
          });

        // Persist auth flag
        await AsyncStorage.setItem('isAuthenticated', 'true');
      } catch (e: any) {
        setError(e?.message ?? 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const registerWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ...existing code...
      throw new Error('Google sign-in not yet implemented');
    } catch (e: any) {
      setError(e?.message ?? 'Google register failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, registerWithEmail, registerWithGoogle };
}
