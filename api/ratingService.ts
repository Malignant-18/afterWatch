// src/api/ratingService.ts

import { getAccessToken, getTraktUUID } from '../auth/traktAuth';
import axiosInstance from '../axios/axiosInstance';

type MediaType = 'movie' | 'episode';

/**
 * Submits a rating for a specific media item to the backend.
 * @param type - The type of media being rated ('movie' or 'episode').
 * @param trakt_id - The Trakt ID of the media item.
 * @param rating - The user's rating (1-10).
 * @returns The JSON response from the server.
 */
export const submitRating = async (type: MediaType, trakt_id: number, rating: number) => {
    const endpoint = `/api/rate/${type}/${trakt_id}`;

    try {
        const accessToken = await getAccessToken();
        const traktUuid = (await getTraktUUID()) ?? '';
        console.log('in submitrating before');

        if (!accessToken) {
            throw new Error('No access token available');
        }

        const response = await axiosInstance.post(
            endpoint,
            { rating },
            {
                headers: {
                    trakt_uuid: traktUuid,
                    access_token: accessToken,
                },
            }
        );

        // If successful, return the response data
        return response.data;
    } catch (error: any) {
        console.error('[submitRating] Service Error:', error);

        // Extract error details from axios error
        const errorMessage = error.response?.data || error.message;
        const statusCode = error.response?.status || 'Unknown';

        throw new Error(`Rating failed with status ${statusCode}: ${errorMessage}`);
    }
};
