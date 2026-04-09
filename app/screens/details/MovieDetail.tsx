// components/details/MovieDetail.tsx

import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { DateTime } from 'luxon';
import React, { useEffect, useRef, useState } from 'react'; // Import useRef
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// import { SheetManager } from 'react-native-actions-sheet'; // REMOVED
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { CommentMovieProps } from 'types/comment'; // Assuming you have this type

import { fetchBackendHistory, fetchBackendMovie } from '../../../api/fetchFromBackend';
import { fetchMovieDetails } from '../../../api/fetchFromTrakt';
// Import Gorhom sheets and their ref types
import CommentSheet, { CommentSheetRef } from '../../../components/sheet/CommentSheet';
import RatingSheet, { RatingSheetRef } from '../../../components/sheet/RatingSheet';
// import { SheetNames } from '../../../sheet/index'; // REMOVED
import { RootStackParamList } from '../../navigation/RootNavigator';
type MovieDetailScreenRouteProp = RouteProp<RootStackParamList, 'MovieDetail'>;

const color = '#755D42';

export default function MovieDetail() {
    const route = useRoute<MovieDetailScreenRouteProp>();
    const { trakt_id } = route.params;

    // State management
    const [movieData, setMovieData] = useState<any>(null);
    const [backendData, setBackendData] = useState<any>(null);
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState<number | null>(null);
    // const [isRatingSheetVisible, setIsRatingSheetVisible] = useState(false); // REMOVED

    // Refs for Gorhom sheets
    const ratingSheetRef = useRef<RatingSheetRef>(null);
    const commentSheetRef = useRef<CommentSheetRef>(null);

    const screenHeight = Dimensions.get('window').height;
    const imageHeight = screenHeight / 2.2;

    // Effect to fetch data from Trakt API
    useEffect(() => {
        (async () => {
            const start = Date.now();
            try {
                const traktDetails = await fetchMovieDetails(trakt_id);
                setMovieData(traktDetails);
            } catch (error: any) {
                console.log('[MovieDetail] Trakt Error:', error.message);
                Alert.alert('Error', 'Could not fetch movie details from Trakt.');
            } finally {
                setLoading(false);
                setDuration(Date.now() - start);
            }
        })();
    }, [trakt_id]);

    // Effect to fetch data from your backend
    useEffect(() => {
        (async () => {
            try {
                const backendDetails = await fetchBackendMovie(trakt_id);
                setBackendData(backendDetails);
                const historyDetails = await fetchBackendHistory('movie', trakt_id);
                setHistory(historyDetails);
            } catch (error: any) {
                console.log('[MovieDetail] Backend Error:', error.message);
            }
        })();
    }, [trakt_id]);

    // Helper to get image URI
    const getImageUri = (): string | null => {
        const img: any = movieData?.images?.thumb?.[0];
        return img ? `https://${img}` : null;
    };
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-light-250">
                <Text className="font-montserrat-semibold text-lg text-dark-900">loading...</Text>
            </View>
        );
    }

    // Action Sheet Handlers
    const showRatingSheet = () => {
        console.log('🎬 [MovieDetail] Opening rating sheet');
        // setIsRatingSheetVisible(true); // REMOVED
        ratingSheetRef.current?.open(); // UPDATED
    };

    const handleRatingSheetClose = (result?: {
        success: boolean;
        rating: number;
        message?: string;
    }) => {
        console.log('🎬 [MovieDetail] Rating sheet closed. Result:', result);
        // setIsRatingSheetVisible(false); // REMOVED
        if (result?.success) {
            Toast.show({
                type: 'rating',
                text1: 'Rated Successfully',
                swipeable: true,
            });
        }
    };

    // UPDATED
    const showCommentSheet = () => {
        const details: CommentMovieProps = {
            filter: 'likes',
            trakt_id,
            movie_slug: movieData?.ids?.slug ?? '',
            comment_count: backendData?.comment_count ?? null,
        };

        const payload = {
            type: 'movie' as const,
            commentProps: details,
        };

        console.log('💬 [MovieDetail] Opening comment sheet with payload');
        commentSheetRef.current?.open(payload);
    };

    // NEW: Handler for when the comment sheet closes
    const handleCommentSheetClose = () => {
        console.log('🎬 [MovieDetail] Comment sheet closed.');
    };

    // Helper to format dates
    const formatDate = (isoDate: string, format: any) => {
        if (!isoDate) return 'N/A';
        return DateTime.fromISO(isoDate).toFormat(format);
    };

    return (
        <View className="flex-1 bg-light-200">
            <View className="flex-1 bg-light-200">
                <StatusBar translucent backgroundColor="transparent" style="light" />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Header Image */}
                    <View className="relative w-full" style={{ height: imageHeight }}>
                        {getImageUri() ? (
                            <Image
                                source={{ uri: getImageUri()! }}
                                className="absolute h-full w-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="h-full w-full items-center justify-center bg-gray-700">
                                <Text className="text-gray-400">No poster available</Text>
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <SafeAreaView className="-mt-10 mb-6 w-full flex-1 rounded-t-3xl bg-light-200 px-6">
                        <Text className="pt-2 font-montserrat-semibold text-3xl text-gray-900">
                            {movieData?.title || 'Unknown Title'}
                        </Text>

                        {/* Metadata */}
                        <View className="mt-4 flex-row gap-7">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="calendar-outline" size={12} color={color} />
                                <Text className="font-montserrat text-sm text-gray-800">
                                    {formatDate(backendData?.released, 'dd LLL yyyy')}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Feather name="clock" size={12} color={color} />
                                <Text className="font-montserrat text-sm text-gray-800">
                                    {backendData?.runtime ?? movieData?.runtime} mins
                                </Text>
                            </View>
                        </View>

                        {/* Synopsis */}
                        <View className="mt-6">
                            <Text className="font-montserrat text-lg text-dark-900">Synopsis</Text>
                            <Text className="mt-2 font-montserrat text-base leading-6 text-dark-600">
                                {backendData?.overview ||
                                    movieData?.overview ||
                                    'No synopsis available.'}
                            </Text>
                        </View>

                        {/* Watch History */}
                        <View className="mb-4 mt-4 overflow-hidden bg-light-200">
                            <Text className="py-3 font-montserrat text-lg text-dark-900">
                                Watch History
                            </Text>
                            <View>
                                {history && history.length > 0 ? (
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

                        {/* Rating and Actions */}
                        <View className="mt-4 flex-row justify-around gap-4 pr-12">
                            <View className="items-start pt-1">
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
                                className="mt-2 h-12 w-20 items-center justify-center rounded-xl border-2 border-dark-600 bg-light-200">
                                <Text className="font-nexa-bold text-lg text-dark-600">Rate</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Comments Button */}
                        <TouchableOpacity
                            onPress={showCommentSheet}
                            className="mt-8 h-12 w-full items-center justify-center">
                            <Text className="font-nexa-bold text-lg text-dark-600">Comments</Text>
                            <Text className="font-nexa-book text-gray-400">
                                View {backendData?.comment_count ?? 'all'} comments
                            </Text>
                        </TouchableOpacity>

                        {/* API Fetch Duration */}
                        {duration && (
                            <Text className="mt-6 text-center text-xs text-gray-400">
                                Trakt API fetch took {duration} ms
                            </Text>
                        )}
                    </SafeAreaView>
                </ScrollView>
            </View>

            {/* Rating Sheet - Outside ScrollView */}
            <RatingSheet
                ref={ratingSheetRef} // UPDATED
                // isVisible={isRatingSheetVisible} // REMOVED
                onClose={handleRatingSheetClose}
                trakt_id={trakt_id}
                type="movie"
                title={movieData?.title || 'Unknown Movie'}
            />

            {/* NEW: Comment Sheet - Outside ScrollView */}
            <CommentSheet ref={commentSheetRef} onClose={handleCommentSheetClose} />
        </View>
    );
}
