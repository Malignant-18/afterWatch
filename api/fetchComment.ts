/* eslint-disable no-case-declarations */
import { getAccessToken } from 'auth/traktAuth';
import { CommentMovieProps, CommentEpisodeProps, CommentShowProps } from 'types/comment';

const baseUrl = process.env.EXPO_PUBLIC_TRAKT_BASE_URL!;
const clientId = process.env.EXPO_PUBLIC_CLIENT_ID!;

export const fetchTraktComments = async (
    mediaType: 'episode' | 'movie' | 'show',
    filter: string = 'newest',
    props: CommentMovieProps | CommentEpisodeProps | CommentShowProps
) => {
    const access_token = (await getAccessToken()) ?? '';
    let endpoint = '';

    switch (mediaType) {
        case 'episode':
            const epProps = props as CommentEpisodeProps;
            endpoint = `shows/${epProps.show_slug}/seasons/${epProps.season}/episodes/${epProps.episode}/comments/${filter}?limit=${epProps.comment_count}`;
            break;
        case 'movie':
            const movieProps = props as CommentMovieProps;
            endpoint = `movies/${movieProps.movie_slug}/comments/${filter}`;
            break;
        case 'show':
            const showProps = props as CommentShowProps;
            endpoint = `shows/${showProps.show_slug}/comments/${filter}`;
            break;
        default:
            throw new Error('Invalid media type for fetching comments.');
    }

    const uri = `${baseUrl}/${endpoint}`;
    console.log('Fetching comments from URI:', uri);

    const response = await fetch(uri, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
            'trakt-api-version': '2',
            'trakt-api-key': clientId,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching comments: ${response.status} ${errorText}`);
    }

    return await response.json();
};

export const fetchReplies = async (
    mediaType: 'episode' | 'movie' | 'show',
    replyCount: number,
    commentId: number
) => {
    const access_token = (await getAccessToken()) ?? '';
    const endpoint = `comments/${commentId}/replies`;
    const uri = `${baseUrl}/${endpoint}?limit=${replyCount}`;

    console.log('Fetching replies from URI:', uri);

    try {
        const response = await fetch(uri, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
                'trakt-api-version': '2',
                'trakt-api-key': clientId, // Added missing trakt-api-key header
            },
        });

        // Check if response is successful
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching replies: ${response.status} ${errorText}`);
        }

        // Check if response has content
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0') {
            console.log('Empty response body, returning empty array');
            return [];
        }

        // Get response text first to check if it's empty
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
            console.log('Empty response body, returning empty array');
            return [];
        }

        // Parse JSON only if we have content
        try {
            return JSON.parse(responseText);
        } catch (parseError: any) {
            console.error('JSON parse error:', parseError);
            console.error('Response text:', responseText);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Failed to fetch replies:', error);
        throw error;
    }
};
