import { AntDesign, Feather, Ionicons, Octicons } from '@expo/vector-icons';
import he from 'he';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { fetchReplies } from '../../api/fetchComment';
import { getAccessToken } from '../../auth/traktAuth';
import axiosInstance from '../../axios/axiosInstance';

// --- Helper Functions (Unchanged) ---
const formatRelativeTime = (isoDate: string) => {
    if (!isoDate) return '';
    try {
        return DateTime.fromISO(isoDate).toRelative();
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

const UserRatingBadge = ({ rating }: { rating?: number | string }) => {
    if (!rating) return null;
    return (
        <View className="ml-3 mt-1 flex-row items-center gap-1 rounded-full pl-1">
            <AntDesign name="star" size={16} color="black" />
            <Text className="text-md font-bold text-dark-600">{rating}</Text>
        </View>
    );
};

const truncateString = (str: string, num: number) => {
    if (!str) return '';
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};
const styles = StyleSheet.create({
    body: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#0a0502',
    },
});
interface Comment {
    id: number;
    user: {
        username: string;
    };
    user_rating?: number | string;
    created_at: string;
    likes: number;
    spoiler: boolean;
    comment: string;
    replies: number;
    user_has_liked?: boolean;
}

// --- 1. UPDATE COMPONENT PROPS ---
// Add an optional parentCommentId to the props
interface CommentItemProps {
    item: Comment;
    isReply?: boolean;
    parentCommentId?: number;
}

export const CommentItem = ({ item, isReply = false, parentCommentId }: CommentItemProps) => {
    // --- State for UI interactions (Unchanged) ---
    const [isSpoilerVisible, setIsSpoilerVisible] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<Comment[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [repliesFetched, setRepliesFetched] = useState(false);
    const [repliesError, setRepliesError] = useState<string | null>(null);

    // --- State for Likes (Unchanged) ---
    const [isLiked, setIsLiked] = useState(item.user_has_liked || false);
    const [likeCount, setLikeCount] = useState(item.likes || 0);

    const handleReplies = async (commentId: number, repliesCount: number) => {
        // If we are opening replies and haven't fetched them yet

        if (!showReplies && !repliesFetched && repliesCount > 0) {
            setLoadingReplies(true);

            setRepliesError(null);

            try {
                const fetchedReplies = await fetchReplies('episode', repliesCount, commentId);

                setReplies(fetchedReplies || []);
                setRepliesFetched(true);
            } catch (error: any) {
                console.error('Failed to fetch replies:', error?.message || error);

                setReplies([]);

                setRepliesError('Unable to load replies. Please try again later.');
            } finally {
                setLoadingReplies(false);
            }
        }

        // Toggle visibility

        setShowReplies(!showReplies);
    };

    // --- 2. UPDATE THE LIKE HANDLER ---
    const handleLikeToggle = async (commentId: number) => {
        const trakt_uuid = await getTraktUUID();
        const access_token = await getAccessToken();
        const originalLikedState = isLiked;
        const originalLikeCount = likeCount;

        // Optimistic UI update
        setIsLiked(!originalLikedState);
        setLikeCount(originalLikedState ? originalLikeCount - 1 : originalLikeCount + 1);

        try {
            let url: string;
            const likeType = originalLikedState ? 'dislike' : 'like';

            // Check if this is a reply and build the URL accordingly
            if (isReply && parentCommentId) {
                // It's a reply, use the replies endpoint
                url = `/api/comment/${parentCommentId}/replies/${commentId}/${likeType}`;
                console.log(`[commentSection] Toggling REPLY like: ${url}`);
            } else {
                // It's a parent comment, use the standard endpoint
                url = `/api/comment/${likeType}/${commentId}`;
                console.log(`[commentSection] Toggling COMMENT like: ${url}`);
            }

            // Your backend uses .all(), so GET will work, but POST/DELETE is more conventional
            const response = await axiosInstance.get(url, {
                headers: {
                    trakt_uuid,
                    access_token,
                },
            });
            console.log('res', response.data); // Log response data for clarity
        } catch (error) {
            console.error('Failed to update like status:', error);
            // Revert UI on failure
            setIsLiked(originalLikedState);
            setLikeCount(originalLikeCount);
        }
    };
    return (
        <View className="border-b border-gray-200 p-4">
            <View className="flex-row justify-between">
                {/* User Info (Unchanged) */}
                <View className="flex-1 flex-row items-center">
                    <Text
                        className="mb-1 mt-3 flex-shrink font-nexa-bold text-lg text-dark-700"
                        numberOfLines={1}>
                        {truncateString(item.user?.username || 'Anonymous', 17)}
                    </Text>
                    <Text className="ml-2 mt-4 font-montserrat-semibold text-xs text-gray-400">
                        {formatRelativeTime(item.created_at)}
                    </Text>
                    <UserRatingBadge rating={item.user_rating} />
                </View>
                {/* Like Button (Unchanged, calls the updated handler) */}
                <TouchableOpacity
                    className="flex-row items-center pr-3 pt-3"
                    onPress={() => handleLikeToggle(item.id)}>
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color="#0a0502"
                    />
                    <Text className="text-md ml-1 font-semibold text-dark-900">{likeCount}</Text>
                </TouchableOpacity>
            </View>
            <View>
                {/* Spoiler and Markdown (Unchanged) */}
                {item.spoiler && !isSpoilerVisible ? (
                    <TouchableOpacity
                        onPress={() => setIsSpoilerVisible(true)}
                        className="rounded- mt-3 gap-4 bg-dark-300 p-3">
                        <Text className="text-center font-montserrat-semibold text-light-400">
                            <Feather name="alert-triangle" size={14} /> Spoiler
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Markdown style={styles}>{he.decode(item.comment || '')}</Markdown>
                )}
                {/* Reply Button (Unchanged) */}
                {!isReply && (
                    <View className="mt-3 w-full flex-row items-center justify-between">
                        {item.replies > 0 ? (
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => handleReplies(item.id, item.replies)}>
                                <Text className="ml-1 mt-1 font-nexa-bold text-sm text-gray-600">
                                    {!showReplies ? `View ${item.replies}` : `Hide`} replies
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="flex-row items-center">
                                <Text className="font-nexa-bold text-sm text-gray-600">
                                    No replies
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity className="mx-4 flex-row gap-1">
                            <Octicons name="reply" size={20} color="#100904" />
                        </TouchableOpacity>
                    </View>
                )}
                {/* --- 3. UPDATE REPLIES RENDERING --- */}
                {showReplies && item.replies > 0 && (
                    <View className="ml-12 mt-4 border-t border-gray-100">
                        {loadingReplies ? (
                            <ActivityIndicator style={{ marginTop: 16 }} />
                        ) : repliesError ? (
                            <View className="mt-4 rounded bg-red-50 p-3">
                                <Text className="text-center font-montserrat text-sm text-red-600">
                                    {repliesError}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        setRepliesError(null);

                                        setRepliesFetched(false);

                                        handleReplies(item.id, item.replies);
                                    }}
                                    className="mt-2 rounded bg-red-100 p-2">
                                    <Text className="text-center font-montserrat-semibold text-sm text-red-700">
                                        Retry
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : replies.length > 0 ? (
                            // Pass the parent comment's ID to each reply
                            replies.map((reply: Comment) => (
                                <CommentItem
                                    key={reply.id}
                                    item={reply}
                                    isReply
                                    parentCommentId={item.id}
                                />
                            ))
                        ) : (
                            <View className="mt-4 p-3">
                                <Text className="text-center font-montserrat text-sm text-gray-500">
                                    No replies available
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};
