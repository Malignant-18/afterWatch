import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Tabs from './Tabs';
import LandingScreen from '../screens/Landing';
import EpisodeDetail from '../screens/details/EpisodeDetail';
import EpisodeGroup from '../screens/details/EpisodeGroup';
import MovieDetail from '../screens/details/MovieDetail';

export type RootStackParamList = {
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

type RootNavigatorProps = {
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
};

export default function RootNavigator({ isLoggedIn, setIsLoggedIn }: RootNavigatorProps) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                <Stack.Screen name="Main">
                    {(props) => <Tabs {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
            ) : (
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
