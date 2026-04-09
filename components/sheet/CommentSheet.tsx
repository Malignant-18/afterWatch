// afterWatch/components/sheet/CommentSheet.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList, // Use Gorhom's FlatList
} from '@gorhom/bottom-sheet';
import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    memo,
    forwardRef,
    useRef,
    useImperativeHandle,
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    // FlatList import removed from 'react-native'
} from 'react-native';
// Import your exact types
import { CommentSheetProps } from 'types/comment';

import { fetchTraktComments } from '../../api/fetchComment';
import { CommentItem } from '../ui/commentSection';

const filters = ['newest', 'oldest', 'likes', 'replies'];

// Define the payload type based on your provided types
type CommentSheetPayload = CommentSheetProps['payload'];

// Define the type for the methods we will expose via the ref
export type CommentSheetRef = {
    open: (payload: CommentSheetPayload) => void;
    close: () => void;
};

// Define the component's new props (it no longer takes sheetId or payload)
type NewCommentSheetProps = {
    onClose: () => void;
};

// Memoize FilterButton (no change needed)
const FilterButton = memo(
    ({
        filter,
        isSelected,
        onPress,
    }: {
        filter: string;
        isSelected: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            key={filter}
            className={`rounded-xl ${
                isSelected ? 'bg-dark-900' : 'bg-light-200'
            } border-2 border-gray-700 px-3 py-1.5`}
            onPress={onPress}>
            <Text
                className={`text-sm capitalize ${
                    isSelected ? 'text-light-200' : 'text-dark-600'
                } font-nexa-book`}>
                {filter}
            </Text>
        </TouchableOpacity>
    )
);

// Wrap the component in forwardRef
const CommentSheet = forwardRef<CommentSheetRef, NewCommentSheetProps>(({ onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // This state will hold the payload passed from the open() method
    const [sheetPayload, setSheetPayload] = useState<CommentSheetPayload | null>(null);

    const [comments, setComments] = useState<{ id: number; [key: string]: any }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>(filters[0]);

    // Define snap points based on your old 'height: 80%'
    const snapPoints = useMemo(() => ['80%'], []);

    // Expose open/close methods
    useImperativeHandle(ref, () => ({
        open: (payload: CommentSheetPayload) => {
            console.log('💬 [CommentSheet] open() called with payload:', payload);
            // Reset state for new comments
            setSheetPayload(payload);
            setSelectedFilter(filters[0]); // Reset filter
            setComments([]); // Clear old comments
            setLoading(true);
            bottomSheetRef.current?.snapToIndex(0);
        },
        close: () => {
            console.log('💬 [CommentSheet] close() called');
            bottomSheetRef.current?.close();
        },
    }));

    // Memoize the fetch function, now depending on sheetPayload
    const fetchComments = useCallback(() => {
        if (!sheetPayload) return;

        const { type, commentProps } = sheetPayload;
        setLoading(true);

        fetchTraktComments(type, selectedFilter, commentProps)
            .then((data) => {
                setComments(data);
                setError(null);
            })
            .catch((err) => {
                console.error('Failed to fetch comments:', err);
                setError('Could not load comments.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [selectedFilter, sheetPayload]);

    // This effect now triggers when the payload or filter changes
    useEffect(() => {
        if (sheetPayload) {
            fetchComments();
        }
    }, [fetchComments, sheetPayload]);

    // Gorhom: Handle sheet state changes (e.g., swipe to close)
    const handleSheetChange = useCallback(
        (index: number) => {
            console.log('💬 [CommentSheet] Sheet index changed to:', index);
            if (index === -1) {
                console.log('💬 [CommentSheet] Sheet closed, calling onClose');
                onClose();
                setSheetPayload(null); // Clear payload when sheet is closed
            }
        },
        [onClose]
    );

    // Gorhom: Backdrop component
    const renderBackdrop = useCallback((props: any) => {
        console.log('💬 [CommentSheet] Rendering backdrop');
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

    // Memoize render functions (no change needed)
    const renderCommentItem = useCallback(
        ({ item }: { item: any }) => <CommentItem key={item.id.toString()} item={item} />,
        []
    );

    const keyExtractor = useCallback((item: any) => item.id.toString(), []);

    // Memoize header (no change needed)
    const renderHeader = useMemo(
        () => (
            <View className="mx-4 my-4 flex-row flex-wrap justify-start gap-3 pl-2 pt-4">
                {filters.map((filter) => (
                    <FilterButton
                        key={filter}
                        filter={filter}
                        isSelected={filter === selectedFilter}
                        onPress={() => setSelectedFilter(filter)}
                    />
                ))}
            </View>
        ),
        [selectedFilter]
    );

    // Memoize empty component (no change needed)
    const renderEmptyComponent = useCallback(() => {
        // This view needs to be flexible to center content in the BottomSheetFlatList
        return (
            <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
                {loading ? (
                    <>
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="mt-2 text-gray-500">Loading comments...</Text>
                    </>
                ) : error ? (
                    <>
                        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                        <Text className="mt-2 text-center text-red-500">{error}</Text>
                        <TouchableOpacity
                            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2"
                            onPress={fetchComments}>
                            <Text className="font-medium text-white">Retry</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
                        <Text className="mt-2 text-gray-500">No comments to display.</Text>
                    </>
                )}
            </View>
        );
    }, [loading, error, fetchComments]);

    // This now calls the sheet's internal close method
    const handleClose = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1} // Start closed
            snapPoints={snapPoints}
            enablePanDownToClose
            onChange={handleSheetChange}
            backdropComponent={renderBackdrop}
            // Apply your old styles
            backgroundStyle={{
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                backgroundColor: '#F9F5F0',
            }}
            // Add a handle indicator
            handleIndicatorStyle={{
                backgroundColor: '#755D42', // Borrowed from RatingSheet
                width: 40,
                height: 4,
                marginTop: 4,
            }}>
            {/* Use BottomSheetView for static header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <View />
                <Text className="items-center pl-4 font-montserrat text-lg text-dark-900">
                    Comments
                </Text>
                <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close-circle" size={28} color="#0a0502" />
                </TouchableOpacity>
            </View>

            {/* Use BottomSheetFlatList for the scrollable content.
          We no longer need the conditional logic outside,
          ListEmptyComponent handles all non-data states.
        */}
            <BottomSheetFlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent} // This handles loading, error, and empty
                showsVerticalScrollIndicator
                contentContainerStyle={{
                    flexGrow: 1, // Ensure empty list can center content
                    backgroundColor: '#F9F5F0',
                }}
                // Your performance props
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
                getItemLayout={(data, index) => ({
                    length: 100, // Approximate item height
                    offset: 100 * index,
                    index,
                })}
            />
        </BottomSheet>
    );
});

export default memo(CommentSheet);
