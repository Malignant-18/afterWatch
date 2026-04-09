/* eslint-disable no-case-declarations */
import { getAccessToken } from 'auth/traktAuth';
import { CommentMovieProps, CommentEpisodeProps, CommentShowProps } from 'types/comment';

import traktInstance from '../axios/traktInstance';

const clientId = process.env.EXPO_PUBLIC_CLIENT_ID!;

export const fetchTraktComments = async (
    mediaType: 'episode' | 'movie' | 'show',
    filter: string = 'newest',
    props: CommentMovieProps | CommentEpisodeProps | CommentShowProps
) => {
    const access_token = (await getAccessToken()) ?? '';
    let endpoint = '';

    switch (mediaType) {
        case 'episode': {
            const epProps = props as CommentEpisodeProps;
            endpoint = `shows/${epProps.show_slug}/seasons/${epProps.season}/episodes/${epProps.episode}/comments/${filter}?limit=${epProps.comment_count}`;
            break;
        }
        case 'movie': {
            const movieProps = props as CommentMovieProps;
            endpoint = `movies/${movieProps.movie_slug}/comments/${filter}`;
            break;
        }
        case 'show': {
            const showProps = props as CommentShowProps;
            endpoint = `shows/${showProps.show_slug}/comments/${filter}`;
            break;
        }
        default:
            throw new Error('Invalid media type for fetching comments.');
    }

    console.log('Fetching comments from endpoint:', endpoint);

    try {
        const response = await traktInstance.get(endpoint, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'trakt-api-version': '2',
                'trakt-api-key': clientId,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data || error.message;
        throw new Error(
            `Error fetching comments: ${error.response?.status || 'Unknown'} ${errorMessage}`
        );
    }
};

export const fetchReplies = async (
    mediaType: 'episode' | 'movie' | 'show',
    replyCount: number,
    commentId: number
) => {
    const access_token = (await getAccessToken()) ?? '';
    const endpoint = `comments/${commentId}/replies?limit=${replyCount}`;

    console.log('Fetching replies from endpoint:', endpoint);

    try {
        const response = await traktInstance.get(endpoint, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'trakt-api-version': '2',
                'trakt-api-key': clientId,
            },
        });

        // Axios automatically parses JSON, so we just return the data
        // If the response is empty, axios will return an empty array or object
        return response.data || [];
    } catch (error: any) {
        // Handle 404 or empty responses gracefully
        if (error.response?.status === 404 || error.response?.status === 204) {
            console.log('No replies found, returning empty array');
            return [];
        }

        console.error('Failed to fetch replies:', error);
        const errorMessage = error.response?.data || error.message;
        throw new Error(
            `Error fetching replies: ${error.response?.status || 'Unknown'} ${errorMessage}`
        );
    }
};
