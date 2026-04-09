import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';

import { loginWithTrakt } from '../../auth/traktAuth';

type LandingProps = {
    setIsLoggedIn: (loggedIn: boolean) => void;
};

export default function LandingScreen({ setIsLoggedIn }: LandingProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        if (isLoggingIn) return;

        setIsLoggingIn(true);
        try {
            const success = await loginWithTrakt();
            if (success) {
                setIsLoggedIn(true);
            } else {
                Alert.alert('The authentication was cancelled or failed. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Login Error',
                error.message || 'An unexpected error occurred during login.'
            );
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar transparent backgroundColor="#332c2c" barStyle="light-content" />

            <LinearGradient
                colors={['#332c2c', '#0d0808']}
                className="flex-1 items-center justify-center">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}>
                    <View
                        style={{
                            flex: 1,
                            paddingHorizontal: 20,
                            paddingBottom: 36,
                            paddingTop: 80,
                        }}>
                        <View className="h-32" />

                        {/* App Title */}
                        <View className="flex-1 items-center justify-center">
                            <Text
                                className="py-4 text-center font-dosis text-[72px] text-dark-200"
                                style={{ letterSpacing: 3 }}>
                                afterWatch
                            </Text>
                        </View>

                        {/* Subtitle */}
                        <View className="mb-8 mt-10 items-center">
                            <Text className="mb-4 text-center font-montserrat text-2xl leading-8 text-light-100">
                                Your Ultimate Trakt Companion
                            </Text>
                            <Text className="max-w-sm px-2 py-3 text-center font-montserrat text-base leading-6 text-light-400">
                                Rate and relive every movie and episode effortlessly.
                            </Text>
                        </View>

                        {/* Features */}
                        <View className="mb-8 gap-7 space-y-4">
                            {/* Feature 1: Smart Rating Reminders */}
                            <TouchableOpacity
                                className="rounded-lg border border-dark-200 bg-dark-800 p-5 shadow-lg"
                                activeOpacity={0.7}>
                                <View className="flex-row justify-between gap-5">
                                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                                        <Ionicons
                                            name="notifications-outline"
                                            size={26}
                                            color="#ffffff"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="mb-2 font-montserrat-semibold text-lg text-light-100">
                                            Smart Rating Reminders
                                        </Text>
                                        <Text className="font-montserrat text-sm leading-5 text-light-400">
                                            Automatically notifies you to rate unrated content
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Feature 2: Organized Rating Queue */}
                            <TouchableOpacity
                                className="rounded-lg border border-dark-200 bg-dark-800 p-5 shadow-lg"
                                activeOpacity={0.7}>
                                <View className="flex-row justify-between gap-5">
                                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-md">
                                        <MaterialCommunityIcons
                                            name="view-grid-outline"
                                            size={26}
                                            color="#ffffff"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="mb-2 font-montserrat-semibold text-lg text-light-100">
                                            Organized Rating Queue
                                        </Text>
                                        <Text className="font-montserrat text-sm leading-5 text-light-400">
                                            View all your pending ratings with an easy-to-browse
                                            dashboard
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Enhanced Gradient Login Button */}
                        <View className="mb-8  mt-16 items-center">
                            <TouchableOpacity
                                onPress={handleLogin}
                                activeOpacity={0.85}
                                disabled={isLoggingIn}
                                className="w-56  shadow-xl">
                                {/* Main gradient background */}
                                <LinearGradient
                                    colors={['#3B82F6', '#8B5CF6', '#EC4899']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                    }}
                                    className="h-16 flex-row items-center justify-center p-3">
                                    <Text className="tracking-tightest text-center font-nexa-bold text-xl text-dark-900">
                                        {isLoggingIn ? 'Connecting...' : 'Login with Trakt'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="px-8 ">
                            <Text className="text-center text-xs leading-4 text-light-600">
                                By continuing, you agree to connect your Trakt.tv account
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
