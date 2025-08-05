import { useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Alert, Dimensions } from 'react-native';

import { fetchBackendMovie } from '../../../api/fetchFromBackend';
import { fetchMovieDetails } from '../../../api/fetchFromTrakt';
// Import the navigation types from your navigator file
import { RootStackParamList } from '../../navigation/RootNavigator';

// Define the type for this screen's route prop for type safety
type MovieDetailScreenRouteProp = RouteProp<RootStackParamList, 'MovieDetail'>;

// The component no longer takes direct props.
export default function MovieDetail() {
  // 1. Get the route object using the useRoute hook
  const route = useRoute<MovieDetailScreenRouteProp>();

  // 2. Extract the trakt_id from route.params
  const { trakt_id } = route.params;

  const [movieData, setMovieData] = useState<any>(null);
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backendLoading, setBackendLoading] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);

  const screenHeight = Dimensions.get('window').height;
  const imageHeight = screenHeight / 2;

  // 3. The rest of your component logic remains the same.
  // The useEffect hooks will now re-run correctly when the trakt_id changes.
  useEffect(() => {
    (async () => {
      const start = Date.now();
      try {
        const traktDetails = await fetchMovieDetails(trakt_id);
        setMovieData(traktDetails);
        setDuration(Date.now() - start);
      } catch (error: any) {
        console.log('[MovieDetail] Movie trakt err + ', error.message);
        Alert.alert('Error fetching movie data');
      } finally {
        setLoading(false);
      }
    })();
  }, [trakt_id]);

  useEffect(() => {
    (async () => {
      try {
        const backendDetails = await fetchBackendMovie(trakt_id);
        setBackendData(backendDetails);
      } catch (error: any) {
        console.log('[MovieDetail] Movie backend err + ', error.message);
        Alert.alert('Error fetching backend data');
      } finally {
        setBackendLoading(false);
      }
    })();
  }, [trakt_id]);

  const getImageUri = (): string | null => {
    const img: any = movieData?.images?.poster?.[0];
    return img ? `https://${img}` : null;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-100">
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-100">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <View className="relative w-full" style={{ height: imageHeight }}>
        {getImageUri() ? (
          <Image
            source={{ uri: getImageUri() ?? 'sd' }}
            className="absolute h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-300">
            <Text className="text-gray-600">No poster available</Text>
          </View>
        )}
      </View>
      <View className="-mt-8 rounded-t-3xl bg-light-300 px-6 py-5 ">
        <Text className="mb-4 font-montserrat text-4xl text-dark-800">
          {movieData?.title || 'Unknown Title'}
        </Text>
        {!backendLoading && backendData ? (
          <View className="space-y-2">
            <Text className="font-montserrat text-dark-900">
              {backendData.overview || 'No overview available.'}
            </Text>
            <Text className="font-montserrat text-dark-900">
              Runtime: {backendData.runtime || 'Unknown'} min
            </Text>
            <Text className="font-montserrat text-dark-900">
              Rating: {backendData.rating || 'Not rated'}
            </Text>
            <Text className="font-montserrat text-dark-900">
              Comments: {backendData.comment_count || 'None'}
            </Text>
          </View>
        ) : (
          <View className="py-4">
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
        {duration && (
          <Text className="mt-4 text-xs text-gray-400">Trakt API fetch took {duration} ms</Text>
        )}
      </View>
    </View>
  );
}
