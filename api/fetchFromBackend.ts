import { getAccessToken, getTraktUUID } from '../auth/traktAuth';

//const RATING_ENDPOINT = `http://192.168.29.130:5000/api/rate/${type}/${trakt_id}`;

export const fetchBackendMovie = async (id: number) => {
    const BACKEND_URL = `http://192.168.29.130:5000/api/item/movie/${id}`;
    try {
        console.log('[Redirect] Backend fetch starting ');
        const access_token: string = (await getAccessToken()) ?? '';
        const trakt_uuid: string = (await getTraktUUID()) ?? '';
        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: { trakt_uuid, access_token },
        });

        if (!response.ok) throw new Error(await response.text());
        const responseJSON = await response.json();
        console.log('[Redirect] Backend fetch movie', responseJSON.data);
        return responseJSON.data;
    } catch (err: any) {
        console.error('[Redirect] Backend fetch movie error:', err.message);
    }
};

export const fetchBackendEpisode = async (id: number) => {
    const BACKEND_URL = `http://192.168.29.130:5000/api/item/episode/${id}`;
    try {
        console.log('[Redirect] Backend fetch starting ');
        const access_token: string = (await getAccessToken()) ?? '';
        const trakt_uuid: string = (await getTraktUUID()) ?? '';
        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: { trakt_uuid, access_token },
        });

        if (!response.ok) throw new Error(await response.text());
        const responseJSON = await response.json();
        console.log('[Redirect] Backend fetch episode ', responseJSON.data);
        return responseJSON.data;
    } catch (err: any) {
        console.error('[Redirect] Backend fetch episode error:', err.message);
    }
};

export const fetchBackendHistory = async (type: string, id: number) => {
    const access_token: string = (await getAccessToken()) ?? '';
    const trakt_uuid: string = (await getTraktUUID()) ?? '';
    const WATCHED_ENDPOINT = `http://192.168.29.130:5000/api/watchhistory/${type}/${id}`;
    const response: any = await fetch(WATCHED_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            trakt_uuid,
            access_token,
        },
    });
    const responseJSON: any = await response.json();
    //console.log(responseJSON);
    return responseJSON.history;
};
