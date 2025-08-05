import { useRoute, RouteProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';

import { getAccessToken } from '../../../auth/traktAuth'; // Adjusted path
import axiosInstance from '../../../axios/axiosInstance';
import { maybeUpdateAccessToken } from '../../../components/maybeUpdateToken';
import { RootStackParamList } from '../../navigation/RootNavigator'; // Import navigation types

// Define the structure for a single episode
type Episode = {
    trakt_id: number;
    title: string;
    show_title?: string;
    overview: string;
    runtime: number;
    season: number;
    episode: number;
};

// Define the type for this screen's route prop
type EpisodeGroupScreenRouteProp = RouteProp<RootStackParamList, 'EpisodeGroup'>;

// The component no longer takes direct props
export default function EpisodeGroup() {
    // 1. Get the route object using the useRoute hook
    const route = useRoute<EpisodeGroupScreenRouteProp>();

    // 2. Extract the show_id from route.params
    const { show_id } = route.params;

    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const trakt_uuid = '3cb06afae6d4bac05d951e3e6895d4650d6e369c';

    // 3. The rest of your component logic remains the same.
    // The useEffect hook will now re-run correctly when the show_id changes.
    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const access_token = await getAccessToken();

                const response = await axiosInstance.get(`/api/epgroup/${show_id}`, {
                    headers: {
                        trakt_uuid,
                        access_token,
                    },
                });
                await maybeUpdateAccessToken(response.data);
                setEpisodes(response.data || []);
            } catch (err: any) {
                console.error('[EpGroup] Error:', err.message);
                setError('Failed to load episode group');
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, [show_id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-2 text-gray-700">Loading episodes...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Text className="text-center text-red-500">{error}</Text>
            </View>
        );
    }
    const handlePress = (item: Episode) => {
        console.log('show', show_id);
        // Updated to use the new navigation structure
        const url = `afterwatch://episode/${item.trakt_id}?show_trakt_id=${show_id}`;
        Linking.openURL(url);
    };
    const renderItem = ({ item }: { item: Episode }) => (
        <TouchableOpacity
            onPress={() => handlePress(item)}
            className="mb-4 rounded-lg border-2 border-dark-300 bg-light-300 p-4">
            <Text className="text-md font-nexa-book text-dark-600">
                S{item.season} • E{item.episode} :
                <Text className="font-montserrat text-lg text-dark-800"> {item.title}</Text>
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-light-200 px-4 pt-4">
            <Text className="mb-1 mt-8 pt-2 font-montserrat-semibold text-xl text-gray-500">
                Unrated Episodes of
            </Text>
            <Text className="mb-8 font-nexa-bold text-3xl text-dark-700">
                {episodes[0]?.show_title ?? 'this Show'}
            </Text>

            <FlatList
                data={episodes}
                keyExtractor={(item) => item.trakt_id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator
            />
        </View>
    );
}
