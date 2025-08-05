// src/components/sheets/RatingSheet.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';

import { submitRating } from '../../api/ratingService'; // Import our new service
import StarRating from '../ui/starRating';
// Define the types for the props and payload
type RatingSheetProps = {
    sheetId: string;
    payload?: {
        trakt_id: number;
        type: 'movie' | 'episode';
        title: string; // Pass the title to display in the sheet
    };
};

const RatingSheet = ({ sheetId, payload }: RatingSheetProps) => {
    const [rating, setRating] = useState(7);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Destructure payload with fallbacks for safety
    const { trakt_id, type, title } = payload || {};

    const handleSubmit = async () => {
        if (!trakt_id || !type || rating === 0) {
            Alert.alert('Error', 'Missing information to submit rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Use our dedicated service to submit the rating
            const result = await submitRating(type, trakt_id, rating);
            const payloadOptions: any = {
                payload: {
                    success: true,
                    rating,
                    message: result.message || 'Rating submitted!',
                },
            };
            // Hide the sheet and return a success payload
            SheetManager.hide(sheetId, payloadOptions);
        } catch (error: any) {
            // If the service throws an error, show it to the user
            Alert.alert('Submission Failed', error.message || 'An unknown error occurred.');
            setIsSubmitting(false); // Allow the user to try again
        }
    };

    return (
        <ActionSheet
            id={sheetId}
            containerStyle={{
                backgroundColor: '#FDFBFA',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                minHeight: 300,
            }}
            gestureEnabled>
            <View className="flex flex-col gap-8 rounded-2xl p-6 px-2">
                <Text
                    className="mt-10 text-center text-lg text-gray-600"
                    style={{ fontFamily: 'Montserrat-Regular' }}>
                    Rate '{title || 'this item '}'
                </Text>
                <View className="mb-4 mt-2">
                    <StarRating rating={rating} onRate={setRating} />
                </View>
                <View className="flex flex-row items-center justify-around gap-5">
                    <View className="pt-1 ">
                        <Text className="pt-4 font-nexa text-lg text-dark-900">
                            Your rating :
                            <Text className="pt-4 font-nexa-bold text-3xl text-dark-900">
                                {rating}/
                                <Text className="text-xl font-normal text-gray-500">10</Text>
                            </Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className={`bg-dark-400${
                            isSubmitting || rating === 0 ? 'bg-gray-400' : 'bg-indigo-600'
                        }`}>
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text className="h-10 w-20 rounded-xl border-2 border-dark-600 bg-light-200 px-4 py-2 text-center font-montserrat text-lg text-dark-900">
                                Rate
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ActionSheet>
    );
};

export default RatingSheet;
