import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ChatStack from './ChatStack';
import NotificationsStack from './NotificationsStack';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom tabs as the root */}
      <Stack.Screen name="Tabs" component={BottomTabs} />
      {/* Non-tab areas as separate stacks/screens */}
      <Stack.Screen name="ChatStack" component={ChatStack} />
      <Stack.Screen name="NotificationsStack" component={NotificationsStack} />
      {/* Add other non-tab screens here */}
    </Stack.Navigator>
  );
}
