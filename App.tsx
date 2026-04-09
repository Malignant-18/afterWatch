// App.tsx
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { SheetProvider } from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigator from './app/navigation/RootNavigator';
import useNotificationListeners from './app/notifications/notificationListeners';
import { initializePushToken } from './app/notifications/notificationService';
import { getAccessToken } from './auth/traktAuth';
import { toastConfig } from './config/toastConfig';
import { LoadFonts } from './hooks/LoadFonts';

SplashScreen.preventAutoHideAsync();

const linking = {
    prefixes: ['afterwatch://'],
    config: {
        screens: {
            Landing: 'landing',
            Main: 'main',
            MovieDetail: 'movie/:trakt_id',
            EpisodeDetail: {
                path: 'episode/:trakt_id',
                parse: {
                    trakt_id: Number,
                    show_trakt_id: Number,
                },
            },
            EpisodeGroup: {
                path: 'group/:show_id',
                parse: {
                    show_id: Number,
                },
            },
        },
    },
};

// This tells Expo how to handle incoming notifications (sound, alert, badge)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});
const DEBUG_FORCE_LOGIN = false;
export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useNotificationListeners();
    console.log('[App.tsx]Starting App');
    useEffect(() => {
        initializePushToken();
    }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await getAccessToken();
                if (token) {
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.error('Error checking initial login status', e);
            } finally {
                setIsAuthLoading(false);
                await SplashScreen.hideAsync();
            }
        };

        const initializeApp = async () => {
            await LoadFonts();
            setFontsLoaded(true);

            // Check the DEBUG flag here
            if (DEBUG_FORCE_LOGIN) {
                console.log('DEBUG MODE: Forcing login screen.');
                setIsAuthLoading(false);
                await SplashScreen.hideAsync();
            } else {
                console.log('PRODUCTION MODE: Checking for existing token.');
                await checkLoginStatus();
            }
        };

        initializeApp();
    }, []);

    if (!fontsLoaded || isAuthLoading) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SheetProvider>
                    <NavigationContainer linking={linking}>
                        <RootNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    </NavigationContainer>
                    <Toast config={toastConfig} position="bottom" bottomOffset={10} />
                </SheetProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
