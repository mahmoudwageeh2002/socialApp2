import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Example: check if token exists
  useEffect(() => {
    const checkAuth = async () => {
      // TODO: get token from secure storage / redux
      const token = null;
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
