// App.tsx or index.tsx (your main app entry point)
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import './global.css';

import RootNavigator from './app/navigation/RootNavigator';

const linking = {
  prefixes: ['afterwatch://'],
  config: {
    screens: {
      Redirect: 'redirect', // this is where Trakt sends the response
      Main: 'main',
      Landing: 'landing',
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
}
