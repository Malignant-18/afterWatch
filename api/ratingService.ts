// src/api/ratingService.ts

import { getAccessToken } from '../auth/traktAuth'; // Assuming this path is correct

// A centralized place for your backend URL and Trakt UUID
const BACKEND_URL = 'http://192.168.29.130:5000';
const TRAKT_UUID = '3cb06afae6d4bac05d951e3e6895d4650d6e369c';

type MediaType = 'movie' | 'episode';

/**
 * Submits a rating for a specific media item to the backend.
 * * @param type - The type of media being rated ('movie' or 'episode').
 * @param trakt_id - The Trakt ID of the media item.
 * @param rating - The user's rating (1-10).
 * @returns The JSON response from the server.
 */
export const submitRating = async (type: MediaType, trakt_id: number, rating: number) => {
  const RATING_ENDPOINT = `${BACKEND_URL}/api/rate/${type}/${trakt_id}`;

  try {
    const accessToken = await getAccessToken();
    console.log('in submitrating before');
    const response = await fetch(RATING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        trakt_uuid: TRAKT_UUID,
        access_token: accessToken,
      },
      body: JSON.stringify({ rating }), // Send the rating in the body
    });

    if (!response.ok) {
      // Try to get a more descriptive error message from the backend
      const errorData = await response.text();
      throw new Error(`Rating failed with status ${response.status}: ${errorData}`);
    }

    // If successful, return the response message
    return await response.json();
  } catch (error) {
    console.error('[submitRating] Service Error:', error);
    // Re-throw the error so the calling component can handle it (e.g., show an alert)
    throw error;
  }
};
