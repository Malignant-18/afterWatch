// services/fetchFromTrakt.ts

import { getAccessToken } from '../auth/traktAuth';
import traktInstance from '../axios/traktInstance';

export const fetchMovieDetails = async (id: number) => {
    const access_token: string = (await getAccessToken()) ?? '';
    const endpoint = `movies/${id}?extended=images`;

    console.log('Fetching movie details for id:', id);
    const start = performance.now();

    const response = await traktInstance.get(endpoint, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'trakt-api-version': '2',
            'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
        },
    });

    const end = performance.now();
    console.log('duration of fetch from traktapi', Math.round(end - start));
    console.log('[Redirect] trakt fetch movie ', response.data);
    return response.data;
};

export const fetchEpisodeDetails = async (id: number) => {
    const access_token: string = (await getAccessToken()) ?? '';
    const endpoint = `episodes/${id}?extended=images`;

    console.log('Fetching episode details for id:', id);
    const start = performance.now();

    const response = await traktInstance.get(endpoint, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'trakt-api-version': '2',
            'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
        },
    });

    const end = performance.now();
    console.log('duration of fetch from traktapi', Math.round(end - start));
    console.log('[Redirect] trakt fetch episode ', response.data);
    return response.data;
};

export const fetchShowName = async (id: number) => {
    const access_token: string = (await getAccessToken()) ?? '';
    const endpoint = `shows/${id}`;

    const response = await traktInstance.get(endpoint, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'trakt-api-version': '2',
            'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
        },
    });

    console.log('[Redirect] trakt fetch show ', response.data);
    return response.data;
};
