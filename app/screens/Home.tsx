import Sheety from 'components/sheet/exampleSheet';
import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    View,
    Button,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Image,
    StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { logout } from '../../auth/traktAuth';

type HomeProps = {
    setIsLoggedIn: (loggedIn: boolean) => void;
};

const Home = ({ setIsLoggedIn }: HomeProps) => {
    const [T, setT] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Loading state for the fetch request
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    const upcomingEpisodes = [
        {
            id: 1,
            show: 'House of the Dragon',
            season: 2,
            episode: 1,
            title: 'A Son for a Son',
            image: 'https://via.placeholder.com/150/111827/FFFFFF?text=HoD',
            airDate: '2024-06-16',
        },
        {
            id: 2,
            show: 'The Boys',
            season: 4,
            episode: 4,
            title: 'Wisdom of the Ages',
            image: 'https://via.placeholder.com/150/F2C035/000000?text=The+Boys',
            airDate: '2024-06-20',
        },
        {
            id: 3,
            show: 'Doctor Who',
            season: 1,
            episode: 8,
            title: 'Empire of Death',
            image: 'https://via.placeholder.com/150/003B6F/FFFFFF?text=DW',
            airDate: '2024-06-22',
        },
    ];

    /**
     * Fetches a test message from the backend API.
     */
    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Hello',
        });
    };

    /**
     * Opens the bottom sheet
     */
    const handleOpenBottomSheet = () => {
        console.log('[Home] Opening bottom sheet button pressed');
        setIsSheetVisible(true);
        console.log('[Home] isSheetVisible set to true');
    };

    /**
     * Closes the bottom sheet
     */
    const handleCloseBottomSheet = () => {
        console.log('[Home] Closing bottom sheet');
        setIsSheetVisible(false);
        console.log('[Home] isSheetVisible set to false');
    };
    const handleTest = async () => {
        setLoading(true);
        setT(null); // Clear previous message
        try {
            const url = 'http://192.168.29.130:5000/me';
            const res = await fetch(url);
            const data = await res.text();
            setT(data);
        } catch (error) {
            setT('Failed to fetch from backend. Make sure the server is running.');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Opens a deep link to a hardcoded episode group page.
     */
    const handleRedirect = () => {
        const url = 'afterwatch://group/195845';
        Linking.openURL(url).catch((err) => {
            console.error("Couldn't load page", err);
            // In a real app, you might show an Alert here
        });
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const success = await logout();
        if (!success) {
            console.warn('Failed to log out');
        }

        const landing_url = 'afterwatch://landing';
        console.log('Logged out successfully: url ', landing_url);
        Linking.openURL(landing_url).catch((error) => {
            console.error("Couldn't load page", error);
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerClassName="flex-1 justify-center items-center p-5 bg-gray-900">
                {/* Main content card with modern styling */}
                <View className="w-full max-w-md rounded-3xl bg-gray-100 p-8 shadow-lg">
                    <Text
                        className="text-center text-4xl font-bold text-gray-900"
                        // For custom fonts, you still need to use the style prop
                        // after setting them up in your project.
                        style={{ fontFamily: 'Montserrat-Bold' }}>
                        AFTERWATCH
                    </Text>
                    <Text
                        className="mb-8 mt-2 text-center text-base text-gray-600"
                        style={{ fontFamily: 'Montserrat-Regular' }}>
                        Welcome! Select an action below to get started.
                    </Text>

                    {/* --- Action Buttons --- */}
                    <View className="space-y-4">
                        <TouchableOpacity
                            onPress={handleTest}
                            disabled={loading}
                            className="w-full items-center justify-center rounded-xl bg-indigo-600 py-4 active:bg-indigo-700">
                            <Text
                                className="text-lg font-bold text-white"
                                style={{ fontFamily: 'Montserrat-Bold' }}>
                                Test Backend
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleRedirect}
                            className="w-full items-center justify-center rounded-xl bg-teal-500 py-4 active:bg-teal-600">
                            <Text
                                className="text-lg font-bold text-white"
                                style={{ fontFamily: 'Montserrat-Bold' }}>
                                Go to Episode Group
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleOpenBottomSheet}
                            className="w-full items-center justify-center rounded-xl bg-purple-600 py-4 active:bg-purple-700">
                            <Text
                                className="text-lg font-bold text-white"
                                style={{ fontFamily: 'Montserrat-Bold' }}>
                                Open Bottom Sheet
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut}>
                            <Text>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- Backend Response Display --- */}
                    {loading && (
                        <View className="mt-8 items-center">
                            <ActivityIndicator size="small" color="#4f46e5" />
                        </View>
                    )}
                    {T && !loading && (
                        <View className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
                            <Text
                                className="text-sm font-semibold text-gray-700"
                                style={{ fontFamily: 'Montserrat-SemiBold' }}>
                                Backend Response:
                            </Text>
                            <Text
                                className="mt-1 text-sm text-gray-600"
                                style={{ fontFamily: 'Montserrat-Regular' }}>
                                {T}
                            </Text>
                        </View>
                    )}
                    <Button title="Show toast" onPress={showToast} />
                </View>

                {/* --- Upcoming Episodes Section --- */}
                <View className="mb-8 mt-8 w-full max-w-md">
                    <Text
                        className="mb-4 text-2xl font-bold text-white"
                        style={{ fontFamily: 'Montserrat-Bold' }}>
                        Upcoming Episodes
                    </Text>
                    <View className="space-y-4">
                        {upcomingEpisodes.map((item) => (
                            <View
                                key={item.id}
                                className="flex-row items-center rounded-xl bg-gray-800 p-4 shadow-md">
                                <Image
                                    source={{ uri: item.image }}
                                    className="mr-4 h-20 w-20 rounded-lg"
                                />
                                <View className="flex-1">
                                    <Text
                                        className="text-lg font-bold text-white"
                                        style={{ fontFamily: 'Montserrat-Bold' }}>
                                        {item.show}
                                    </Text>
                                    <Text
                                        className="text-base text-gray-300"
                                        style={{ fontFamily: 'Montserrat-Regular' }}>
                                        S{item.season.toString().padStart(2, '0')}E
                                        {item.episode.toString().padStart(2, '0')}: {item.title}
                                    </Text>
                                    <Text
                                        className="mt-1 text-sm text-gray-400"
                                        style={{ fontFamily: 'Montserrat-Regular' }}>
                                        Airs: {item.airDate}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Sheet - Rendered outside ScrollView at root level */}
            <Sheety isVisible={isSheetVisible} onClose={handleCloseBottomSheet} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Home;
