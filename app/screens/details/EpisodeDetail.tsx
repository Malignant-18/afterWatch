// components/details/EpisodeDetail.tsx

import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    Alert,
    Dimensions,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { SheetNames } from 'sheet'; // Assuming you have this file defining your sheet names
import { CommentEpisodeProps } from 'types/comment';

import { fetchBackendEpisode, fetchBackendHistory } from '../../../api/fetchFromBackend';
import { fetchEpisodeDetails, fetchShowName } from '../../../api/fetchFromTrakt';
import { RootStackParamList } from '../../navigation/RootNavigator';

// Define the type for this screen's route prop for type safety
type EpisodeDetailScreenRouteProp = RouteProp<RootStackParamList, 'EpisodeDetail'>;

const color = '#755D42';

// The component no longer takes direct props
export default function EpisodeDetail() {
    // Get the route object using the useRoute hook
    const route = useRoute<EpisodeDetailScreenRouteProp>();

    // Extract the trakt_id and the new show_trakt_id from route.params
    const { trakt_id, show_trakt_id }: { trakt_id: number; show_trakt_id?: number } = route.params;
    console.log('[EpisodeDetail] trakt_id:', trakt_id, 'show_trakt_id:', show_trakt_id);

    const [episodeData, setEpisodeData] = useState<any>(null);
    const [backendData, setBackendData] = useState<any>(null);
    const [showName, setShowName] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState<number | null>(null);
    const [history, setHistory] = useState<any>(null);

    const screenHeight = Dimensions.get('window').height;
    const imageHeight = screenHeight / 2.2;

    // The useEffect hooks will now re-run correctly when the trakt_id changes
    useEffect(() => {
        (async () => {
            const start = Date.now();
            try {
                const traktDetails = await fetchEpisodeDetails(trakt_id);
                setEpisodeData(traktDetails);
            } catch (error: any) {
                console.log('[EpisodeDetail] Trakt Error:', error.message);
                Alert.alert('Error', 'Could not fetch episode details from Trakt.');
            } finally {
                setLoading(false);
                setDuration(Date.now() - start);
            }
        })();
    }, [trakt_id]);

    useEffect(() => {
        (async () => {
            try {
                const backendDetails = await fetchBackendEpisode(trakt_id);
                setBackendData(backendDetails);
            } catch (error: any) {
                console.log('[EpisodeDetail] Backend Error:', error.message);
            }
        })();
    }, [trakt_id]);
    useEffect(() => {
        (async () => {
            try {
                const showNameDetails = show_trakt_id
                    ? await fetchShowName(show_trakt_id)
                    : 'untitled show';
                console.log('[EpisodeDetail] show :  ', showNameDetails);
                setShowName(showNameDetails);
            } catch (error: any) {
                console.log('[EpisodeDetail] trakt showname Error:', error.message);
            }
        })();
    }, [show_trakt_id]);
    useEffect(() => {
        (async () => {
            try {
                const showHistoryDetails = await fetchBackendHistory('episode', trakt_id);
                console.log('[EpisodeDetail] history:  ', showHistoryDetails);
                setHistory(showHistoryDetails);
            } catch (error: any) {
                console.log('[EpisodeDetail] trakt showname Error:', error.message);
            }
        })();
    }, [trakt_id]);

    const getImageUri: any = (): string | null => {
        const img: any = episodeData?.images?.screenshot?.[0];
        return img ? `https://${img}` : null;
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    const showRatingSheet = async () => {
        // Corrected: The second argument is the options object itself.
        const result: any = await SheetManager.show(SheetNames.ratingSheet, {
            payload: {
                trakt_id,
                type: 'episode',
                title: episodeData?.title || 'Unknown Title',
            } as any,
        });
        // The result comes from the SheetManager.hide() payload
        if (result?.success) {
            showToast();
        }
    };

    const showCommentSheet = async () => {
        const details: CommentEpisodeProps = {
            filter: ' likes',
            show_trakt_id: show_trakt_id ?? 0,
            show_slug: showName?.ids?.slug ?? ('' as string),
            season: episodeData?.season ?? 0,
            episode: episodeData?.number ?? 0,
            comment_count: backendData?.comment_count ?? null,
        };
        console.log('props: ', details);
        await SheetManager.show(SheetNames.CommentSheet, {
            payload: {
                type: 'episode',
                commentProps: details,
            } as any,
        });
    };

    const showToast = () => {
        Toast.show({
            type: 'rating', // This should match a type in your toastConfig
            text1: 'Rated Successfully',
            swipeable: true,
        });
    };

    // A helper to format dates, assuming you have luxon installed.
    const formatDate = (isoDate: string, format: any) => {
        if (!isoDate) return 'N/A';
        return DateTime.fromISO(isoDate).toFormat(format);
    };
    return (
        <View className="flex-1 bg-light-200">
            <StatusBar translucent backgroundColor="transparent" style="light" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="relative w-full" style={{ height: imageHeight }}>
                    {getImageUri() ? (
                        <Image
                            source={{ uri: getImageUri() }}
                            className="absolute h-full w-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center bg-gray-700">
                            <Text className="text-gray-400">No image available</Text>
                        </View>
                    )}
                </View>

                <SafeAreaView className="-mt-10 mb-6 w-full flex-1 rounded-t-3xl bg-light-200 px-6">
                    <Text className="pt-2 font-montserrat-semibold text-3xl  text-gray-900">
                        {episodeData?.title || 'Unknown Title'}
                    </Text>
                    <Text className="text-md px-1 py-[1px] font-nexa-book font-semibold text-dark-400">
                        Season {episodeData?.season || '-'} • Episode {episodeData?.number || '-'}
                    </Text>
                    <Text className=" mb-1 mt-3 font-nexa-bold text-[15px] text-gray-700">
                        {showName?.title}
                    </Text>
                    <View className="mt-4 flex-row gap-7">
                        <View className=" flex-row items-center  gap-1 rounded-xl ">
                            <Ionicons name="calendar-outline" size={12} color={color} />
                            <Text className="font-montserrat  text-sm text-gray-800">
                                {formatDate(backendData?.first_aired, 'dd LLL yyyy')}
                            </Text>
                        </View>
                        <View className=" flex-row items-center  gap-1 rounded-xl ">
                            <Feather name="clock" size={12} color={color} />
                            <Text className="font-montserrat  text-sm text-gray-800">
                                {backendData?.runtime} mins
                            </Text>
                        </View>
                    </View>
                    <View className="mt-6 ">
                        <Text className="font-montserrat text-lg text-dark-900">Synopsis</Text>
                        <Text className="mt-2 font-montserrat text-base leading-6 text-dark-600">
                            {backendData?.overview ||
                                episodeData?.overview ||
                                'No synopsis available.'}
                        </Text>
                    </View>

                    <View className="mb-4 mt-4 overflow-hidden  bg-light-200">
                        <Text className="flex-row items-center py-3 font-montserrat text-lg text-dark-900">
                            Watch History
                        </Text>
                        <View>
                            {history ? (
                                history.map((item: any, index: any) => (
                                    <View
                                        key={index}
                                        className={`flex-row items-center justify-between p-4 ${
                                            index % 2 === 0 ? 'bg-light-250' : 'bg-light-200'
                                        }`}>
                                        <View className="flex-row items-center justify-between gap-8">
                                            <MaterialCommunityIcons
                                                name="movie-play-outline"
                                                size={20}
                                                color="#6b7280"
                                            />
                                            <Text className="pr-4 font-nexa-book text-sm text-dark-600">
                                                {formatDate(item.watched_at, 'ff')}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="p-4">
                                    <Text className="text-sm text-gray-500">
                                        No watch history available.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="mt-4  flex-row justify-around gap-4 pr-12">
                        <View className="items-start  pt-1">
                            <Text className="pt-4 font-nexa-bold text-3xl text-dark-900">
                                {backendData?.rating?.toFixed(1) ?? '–'}/
                                <Text className="text-xl font-normal text-gray-600">10</Text>
                            </Text>
                            <Text className="font-montserrat text-sm text-gray-400">
                                {backendData?.votes?.toLocaleString() ?? '–'} votes
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={showRatingSheet}
                            className={`mt-2 h-12 w-20 items-center justify-center rounded-xl border-2 border-dark-600 bg-light-200 `}>
                            <Text className="font-nexa-bold text-lg text-dark-600">Rate</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={showCommentSheet}
                        className="mt-8 h-12 w-full items-center justify-center ">
                        <Text className="font-nexa-bold text-lg text-dark-600">Comments</Text>
                        <Text className="font-nexa-book text-gray-400 ">
                            View {backendData?.comment_count ?? 'all'} comments
                        </Text>
                    </TouchableOpacity>
                    {!duration && (
                        <Text className="mt-6 text-center text-xs text-gray-400">
                            Trakt API fetch took {duration} ms
                        </Text>
                    )}
                </SafeAreaView>
            </ScrollView>
        </View>
    );
}
