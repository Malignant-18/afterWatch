import { insertHistory } from 'db/insertHistory';
import { insertRatings } from 'db/insertRating';
import { readHistory } from 'db/readHistory';
import { readRatings } from 'db/readRating';
import { TraktHistoryItem } from 'interfaces/interface_history';
import { TraktRatingItem } from 'interfaces/interface_rating';

import { getAccessToken } from '../auth/traktAuth';
import traktInstance from '../axios/traktInstance';

const TRAKT_CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;

export const fetchTraktData = async (endpoint: string): Promise<any> => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        throw new Error('Not authenticated');
    }
    try {
        const response = await traktInstance.get(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'trakt-api-version': '2',
                'trakt-api-key': TRAKT_CLIENT_ID,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error in fetchTraktData:', error);
        return null;
    }
};

export function isEpisode(item: TraktHistoryItem): item is TraktHistoryItem & { type: 'episode' } {
    return item.type === 'episode';
}

export const fetchHistorySync = async (): Promise<TraktHistoryItem[] | null> => {
    try {
        const history_endpoint = '/sync/history';

        console.log(`endpoint ${history_endpoint}`);

        const historyFromApi = await fetchTraktData(history_endpoint);
        console.log(`Fetching occurapidata: `, historyFromApi.slice(0, 3));
        await insertHistory(historyFromApi);
        console.log(`insert done - going to readhistory -from traktSync`);
        const localHistory: TraktHistoryItem[] = await readHistory();
        console.log(`local hsitory check -from traktSync` + localHistory.slice(0, 3));
        return localHistory;
    } catch (error) {
        console.error('Error in fetchHistory:', error);
        return null;
    }
};

export const fetchRatingSync = async () => {
    try {
        const ratings_endpoint = '/sync/ratings?page=1&limit=10';

        console.log(`endpoint ${ratings_endpoint}`);

        const ratingsFromApi = await fetchTraktData(ratings_endpoint);
        console.log(`Fetching API data: `, ratingsFromApi.slice(0, 3));
        await insertRatings(ratingsFromApi);
        console.log(`Insert done - going to readRatings`);
        const localRatings: TraktRatingItem[] = await readRatings(); //change to rating when created
        console.log(`Local ratings check: `, localRatings.slice(0, 3));
        return localRatings;
    } catch (error) {
        console.error('Error in fetchRatingsSync:', error);
        return null;
    }
};
