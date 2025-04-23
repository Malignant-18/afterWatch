// app/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Tabs from '../navigation/Tabs';
import Landing from '../screens/Landing';
import Redirect from '../screens/Redirect';

const Stack = createNativeStackNavigator<RootStackParamList>();

// app/navigation/types.ts
export type RootStackParamList = {
  Landing: undefined;
  Redirect: undefined;
  Main: undefined;
};

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#123456' } }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Redirect" component={Redirect} />
      <Stack.Screen name="Main" component={Tabs} />
    </Stack.Navigator>
  );
}
