// src/components/sheets/RatingSheet.tsx

import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, {
    useRef,
    useMemo,
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    // StyleSheet removed
} from 'react-native';

import { submitRating } from '../../api/ratingService';
import StarRating from '../ui/starRating';

type RatingSheetProps = {
    onClose: (result?: { success: boolean; rating: number; message?: string }) => void;
    trakt_id: number;
    type: 'movie' | 'episode';
    title: string;
};

export type RatingSheetRef = {
    open: () => void;
    close: () => void;
};

// Wrap the component in forwardRef
const RatingSheet = forwardRef<RatingSheetRef, RatingSheetProps>(
    ({ onClose, trakt_id, type, title }, ref) => {
        console.log('⭐ [RatingSheet] Rendered with OLD UI.');

        const bottomSheetRef = useRef<BottomSheet>(null);

        // Use snap point similar to your old minHeight
        const snapPoints = useMemo(() => {
            console.log('⭐ [RatingSheet] Creating snap points: [300]');
            return [250];
        }, []);

        const [rating, setRating] = useState(7);
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Expose open/close methods to the parent
        useImperativeHandle(ref, () => ({
            open: () => {
                console.log('⭐ [RatingSheet] open() called');
                setRating(7); // Reset rating
                setIsSubmitting(false);
                bottomSheetRef.current?.snapToIndex(0);
            },
            close: () => {
                console.log('⭐ [RatingSheet] close() called');
                bottomSheetRef.current?.close();
            },
        }));

        // Gorhom: Called when the sheet is swiped closed
        const handleSheetChange = useCallback(
            (index: number) => {
                console.log('⭐ [RatingSheet] Sheet index changed to:', index);
                if (index === -1) {
                    console.log('⭐ [RatingSheet] Sheet closed, calling onClose');
                    onClose();
                }
            },
            [onClose]
        );

        // Gorhom: Submit logic
        const handleSubmit = async () => {
            console.log('⭐ [RatingSheet] Submit pressed. Rating:', rating);

            if (!trakt_id || !type || rating === 0) {
                Alert.alert('Error', 'Missing information to submit rating.');
                return;
            }

            setIsSubmitting(true);
            try {
                const result = await submitRating(type, trakt_id, rating);
                console.log('⭐ [RatingSheet] Rating submitted successfully');

                // Call onClose WITH data to trigger the toast in parent
                onClose({
                    success: true,
                    rating,
                    message: result.message || 'Rating submitted!',
                });
                bottomSheetRef.current?.close(); // Manually close
            } catch (error: any) {
                console.error('⭐ [RatingSheet] Submit error:', error);
                Alert.alert('Submission Failed', error.message || 'An unknown error occurred.');
                setIsSubmitting(false);
            }
        };

        // Gorhom: Backdrop component
        const renderBackdrop = useCallback((props: any) => {
            console.log('⭐ [RatingSheet] Rendering backdrop');
            return (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    pressBehavior="close"
                    opacity={0.5}
                />
            );
        }, []);

        return (
            <BottomSheet
                ref={bottomSheetRef}
                index={-1} // Start closed
                snapPoints={snapPoints}
                enablePanDownToClose
                onChange={handleSheetChange}
                backdropComponent={renderBackdrop}
                // Style the sheet container like your old ActionSheet
                backgroundStyle={{
                    backgroundColor: '#FDFBFA',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}
                // Add the handle indicator style from your other sheet
                handleIndicatorStyle={{
                    backgroundColor: '#755D42',
                    width: 40,
                    height: 4,
                }}>
                {/* Use BottomSheetView as the main container */}
                <BottomSheetView className="flex-1">
                    {/* THIS IS YOUR OLD UI, PASTED DIRECTLY IN
                     */}
                    <View className="flex flex-col gap-8 rounded-2xl p-6 px-2">
                        <Text
                            className="mt-2 text-center text-lg text-gray-600"
                            style={{ fontFamily: 'Montserrat-Regular' }}>
                            Rate '{title || 'this item '}'
                        </Text>
                        <View className="mb-4">
                            <StarRating rating={rating} onRate={setRating} />
                        </View>
                        <View className="flex flex-row items-center justify-around gap-5">
                            <View className="pt-1 ">
                                <Text className="pt-4 font-nexa text-lg text-dark-900">
                                    Your rating :
                                    <Text className="pt-4 font-nexa-bold text-3xl text-dark-900">
                                        {' '}
                                        {rating}/
                                        <Text className="text-xl font-normal text-gray-500">
                                            10
                                        </Text>
                                    </Text>
                                </Text>
                            </View>

                            {/* This button now calls the Gorhom 'handleSubmit' */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting || rating === 0}>
                                {isSubmitting ? (
                                    // Show a disabled-looking state while loading
                                    <View className="h-10 w-20 items-center justify-center rounded-xl border-2 border-gray-400 bg-gray-300">
                                        <ActivityIndicator size="small" color="#6b7280" />
                                    </View>
                                ) : (
                                    // This is your original 'Rate' button UI
                                    <Text className="h-10 w-20 rounded-xl border-2 border-dark-600 bg-light-200 px-4 py-2 text-center font-montserrat text-lg text-dark-900">
                                        Rate
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* END OF YOUR OLD UI
                     */}
                </BottomSheetView>
            </BottomSheet>
        );
    }
);

export default RatingSheet;
