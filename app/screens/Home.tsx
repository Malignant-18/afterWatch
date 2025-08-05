// screens/Home.tsx
import { useState } from 'react';
import {
    ScrollView,
    Text,
    View,
    Button,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';

const Home = () => {
    const [T, setT] = useState<string | null>(null); // State for the backend response
    const [loading, setLoading] = useState(false); // Loading state for the fetch request

    /**
     * Fetches a test message from the backend API.
     */
    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Hello',
        });
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

    return (
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
        </ScrollView>
    );
};

export default Home;
