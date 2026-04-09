import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import Home from '../screens/Home';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function Tabs({ setIsLoggedIn }: { setIsLoggedIn: (isLoggedIn: boolean) => void }) {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home">{() => <Home setIsLoggedIn={setIsLoggedIn} />}</Tab.Screen>
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}
