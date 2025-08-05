import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import ActionSheet, { SheetManager, FlatList } from 'react-native-actions-sheet';
import { CommentSheetProps } from 'types/comment';

import { fetchTraktComments } from '../../api/fetchComment';
import { CommentItem } from '../ui/commentSection';

const filters = ['newest', 'oldest', 'likes', 'replies'];

const CommentSheet = ({ sheetId, payload }: CommentSheetProps) => {
    const [comments, setComments] = useState<{ id: number; [key: string]: any }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>(filters[0]);

    useEffect(() => {
        if (!payload) return;

        const { type, commentProps } = payload;
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
    }, [selectedFilter, payload]);

    const renderCommentItem = ({ item }: { item: any }) => (
        <CommentItem key={item.id.toString()} item={item} />
    );

    const renderHeader = () => (
        <View className="mx-4 my-4 flex-row flex-wrap justify-start gap-3 pl-2 pt-4">
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    className={`rounded-xl ${
                        filter === selectedFilter ? 'bg-dark-900' : 'bg-light-200'
                    } border-2 border-gray-700 px-3 py-1.5`}
                    onPress={() => setSelectedFilter(filter)}>
                    <Text
                        className={`text-sm capitalize ${
                            filter === selectedFilter ? 'text-light-200' : 'text-dark-600'
                        } font-nexa-book`}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderEmptyComponent = () => {
        if (loading) {
            return (
                <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text className="mt-2 text-gray-500">Loading comments...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text className="mt-2 text-center text-red-500">{error}</Text>
                    <TouchableOpacity
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2"
                        onPress={() => {
                            if (payload) {
                                const { type, commentProps } = payload;
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
                            }
                        }}>
                        <Text className="font-medium text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
                <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
                <Text className="mt-2 text-gray-500">No comments to display.</Text>
            </View>
        );
    };

    return (
        <ActionSheet
            id={sheetId}
            containerStyle={{
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                backgroundColor: '#F9F5F0',
                height: '80%',
                maxHeight: 700,
                minHeight: 500,
            }}
            gestureEnabled
            closeOnPressBack
            closeOnTouchBackdrop>
            <View className="  flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <View />
                <Text className=" items-center pl-4 font-montserrat text-lg text-dark-900">
                    Comments
                </Text>
                <TouchableOpacity onPress={() => SheetManager.hide(sheetId)}>
                    <Ionicons name="close-circle" size={28} color="#0a0502" />
                </TouchableOpacity>
            </View>
            {/* Content with proper scrolling */}
            {loading || error || comments.length === 0 ? (
                renderEmptyComponent()
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator
                    contentContainerStyle={{
                        minHeight: 300,
                        backgroundColor: '#F9F5F0',
                    }}
                />
            )}
        </ActionSheet>
    );
};

export default CommentSheet;
