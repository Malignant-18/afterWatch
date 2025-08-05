import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Tabs from './Tabs';
import LandingScreen from '../screens/Landing';
import EpisodeDetail from '../screens/details/EpisodeDetail';
import EpisodeGroup from '../screens/details/EpisodeGroup';
import MovieDetail from '../screens/details/MovieDetail';

export type RootStackParamList = {
  // ... your param list
  Landing: undefined;
  Main: undefined;
  MovieDetail: { trakt_id: number };
  EpisodeDetail: {
    trakt_id: number;
    show_trakt_id?: number;
  };
  EpisodeGroup: { show_id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 1. The navigator now accepts props from App.tsx
type RootNavigatorProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
};

export default function RootNavigator({ isLoggedIn, setIsLoggedIn }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // 2. If logged in, show the main app (Tabs)
        <Stack.Screen name="Main" component={Tabs} />
      ) : (
        // 3. If not logged in, show the Landing screen and pass it the function to log in
        <Stack.Screen name="Landing">
          {(props) => <LandingScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
      )}

      {/* Detail screens can be added here if they need to be accessible from Main */}
      <Stack.Screen name="MovieDetail" component={MovieDetail} />
      <Stack.Screen name="EpisodeDetail" component={EpisodeDetail} />
      <Stack.Screen name="EpisodeGroup" component={EpisodeGroup} />
    </Stack.Navigator>
  );
}
