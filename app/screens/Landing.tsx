/* eslint-disable no-lone-blocks */
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, StatusBar, Button, Alert } from 'react-native';

// Import your authentication logic and context
import { loginWithTrakt } from '../../auth/traktAuth';
import { RootStackParamList } from '../navigation/RootNavigator';
type LandingProps = {
    setIsLoggedIn: (loggedIn: boolean) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;
export default function LandingScreen({ setIsLoggedIn }: LandingProps) {
    // This is the function for the "Login with Trakt" button
    const handleLogin = async () => {
        try {
            const success = await loginWithTrakt();
            if (success) {
                setIsLoggedIn(true);
            } else {
                Alert.alert(
                    'Login Failed',
                    'The authentication was cancelled or failed. Please try again.'
                );
            }
        } catch (error: any) {
            Alert.alert(
                'Login Error',
                error.message || 'An unexpected error occurred during login.'
            );
        }
    };

    return (
        <View className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
            <View className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 opacity-60" />
            <View className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-red-400/10 opacity-40" />
            <View className="flex-1 justify-between px-6 pb-10 pt-16">
                <View className="mt-16 items-center">
                    <View className="mb-4 flex-row items-center">
                        <Text className="text-5xl font-black tracking-tight text-cyan-400">
                            aFterWatch
                        </Text>
                        <View className="ml-2 rounded-lg bg-red-500 px-2 py-1">
                            <Text className="text-xs font-bold tracking-wider text-white">
                                BETA
                            </Text>
                        </View>
                    </View>
                    <Text className="mb-3 text-center text-xl font-semibold text-white">
                        Your Ultimate Entertainment Companion
                    </Text>
                    <Text className="px-5 text-center text-base leading-6 text-gray-400">
                        Track your favorite shows, get personalized recommendations, and never miss
                        an episode.
                    </Text>
                </View>
                <View className="my-10 flex-row justify-around px-5">
                    <View className="flex-1 items-center">
                        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-white/10">
                            <Text className="text-2xl">📺</Text>
                        </View>
                        <Text className="text-center text-xs font-medium text-white">
                            Track Shows
                        </Text>
                    </View>
                    <View className="flex-1 items-center">
                        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-white/10">
                            <Text className="text-2xl">🔔</Text>
                        </View>
                        <Text className="text-center text-xs font-medium text-white">
                            Smart Notifications
                        </Text>
                    </View>
                    <View className="flex-1 items-center">
                        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-white/10">
                            <Text className="text-2xl">⭐</Text>
                        </View>
                        <Text className="text-center text-xs font-medium text-white">
                            Personalized
                        </Text>
                    </View>
                </View>
                <View className="mt-auto">
                    <View className="items-center">
                        {/* Using a standard button for now, can be replaced with a custom TouchableOpacity */}
                        <Button title="Login with Trakt" onPress={handleLogin} />
                        <View className="my-6 flex-row items-center px-5">
                            <View className="h-px flex-1 bg-white/20" />
                            <Text className="mx-4 text-xs font-medium text-gray-400">
                                Secure Authentication
                            </Text>
                            <View className="h-px flex-1 bg-white/20" />
                        </View>
                        <Text className="px-10 text-center text-xs leading-4 text-gray-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
