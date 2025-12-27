import { useState, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginResult = {
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

export default function useLogin(): LoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await auth().signInWithEmailAndPassword(email.trim(), password);
        // Persist auth flag
        await AsyncStorage.setItem('isAuthenticated', 'true');
      } catch (e: any) {
        setError(e?.message ?? 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Stub: Implement Google sign-in via @react-native-google-signin/google-signin
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ...existing code...
      // const { idToken } = await GoogleSignin.signIn();
      // const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // await auth().signInWithCredential(googleCredential);
      throw new Error('Google sign-in not yet implemented');
    } catch (e: any) {
      setError(e?.message ?? 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, loginWithEmail, loginWithGoogle };
}
