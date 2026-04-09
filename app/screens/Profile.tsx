import { Feather } from '@expo/vector-icons';
import { maybeUpdateAccessToken } from 'components/maybeUpdateToken'; // Assuming this is in your project
import { HeatMap } from 'components/ui/heatMap'; // Assuming this is in your project
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

// --- Configuration ---
const BACKEND_URL = 'http://192.168.29.130:5000/api/trial';

// --- Helper Components ---

type ActionButtonProps = {
    onPress: () => void;
    title: string;
    iconName: keyof typeof Feather.glyphMap;
    color: string;
    isLoading?: boolean;
};

const ActionButton = ({
    onPress,
    title,
    iconName,
    color,
    isLoading = false,
}: ActionButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        className={`flex-row items-center justify-center rounded-xl p-4 shadow-md ${color} ${
            isLoading ? 'opacity-70' : ''
        }`}>
        {isLoading ? (
            <ActivityIndicator size="small" color="white" className="mr-3" />
        ) : (
            <Feather name={iconName} size={20} color="white" className="mr-3" />
        )}
        <Text className="text-base font-semibold text-white">{title}</Text>
    </TouchableOpacity>
);

const StatusMessage = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <View className={`rounded-lg p-3 ${type === 'success' ? 'bg-green-200' : 'bg-red-200'} mt-4`}>
        <Text className={`${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message}
        </Text>
    </View>
);

// --- Main Profile Screen Component ---

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(
        null
    );

    const handleSendNotification = useCallback(async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Test Notification ✨',
                    body: 'This is a sample local notification from the app!',
                },
                trigger: null,
            });
            setStatus({ message: 'Test notification sent successfully.', type: 'success' });
        } catch (error) {
            console.error('[Profile] Notification error:', error);
            setStatus({ message: 'Failed to send notification.', type: 'error' });
        }
    }, []);

    const handleFetchTraktData = useCallback(async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const trakt_uuid = await SecureStore.getItemAsync('trakt_uuid');
            const access_token = await SecureStore.getItemAsync('trakt_access_token');

            if (!trakt_uuid || !access_token) {
                throw new Error('Trakt credentials are not set up.');
            }

            const response = await fetch(BACKEND_URL, {
                method: 'GET',
                headers: { trakt_uuid, access_token },
            });

            const data = await response.json();
            await maybeUpdateAccessToken(data);

            if (!response.ok) {
                throw new Error(data.error || `Server responded with status ${response.status}`);
            }

            setStatus({ message: 'Trakt data received successfully!', type: 'success' });
        } catch (error: any) {
            console.error('[Profile] Fetch error:', error);
            setStatus({ message: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <View style={styles.container}>
            <SafeAreaView className="flex-1 bg-dark-100">
                <ScrollView contentContainerStyle={styles.scrollView}>
                    {/* Header */}
                    <View className="mb-8 flex-row items-center justify-center">
                        <Feather name="user" size={28} color="white" />
                        <Text className="ml-3 text-3xl font-bold text-white">Profile</Text>
                    </View>

                    {/* Status Message Area */}
                    {status && <StatusMessage message={status.message} type={status.type} />}

                    {/* Actions Section */}
                    <View className="mt-6 space-y-4 rounded-2xl bg-dark-200 p-4">
                        <Text className="mb-2 text-lg font-semibold text-gray-300">
                            Settings & Actions
                        </Text>
                        <ActionButton
                            onPress={handleSendNotification}
                            title="Send Test Notification"
                            iconName="bell"
                            color="bg-blue-600"
                        />
                        <ActionButton
                            onPress={handleFetchTraktData}
                            title="Sync Trakt Data"
                            iconName="refresh-cw"
                            color="bg-green-600"
                            isLoading={isLoading}
                        />
                    </View>

                    {/* Heatmap Section */}
                    <View className="mt-8 rounded-2xl bg-dark-200 shadow">
                        <Text className="mb-3 px-4 pt-4 text-lg font-semibold text-white">
                            Activity Heatmap
                        </Text>
                        <HeatMap />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {},
});

export default Profile;
