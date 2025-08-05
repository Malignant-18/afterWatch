// services/fetchFromTrakt.ts

import { getAccessToken, getTraktUUID } from '../auth/traktAuth';

export const fetchMovieDetails = async (id: number) => {
  const access_token: string = (await getAccessToken()) ?? '';
  //const trakt_uuid: string = (await getTraktUUID()) ?? '';
  const endpoint = `movies/${id}?extended=images`;
  const baseUrl = process.env.EXPO_PUBLIC_TRAKT_BASE_URL!;
  const uri = `${baseUrl}/${endpoint}`;
  console.log('uri ', uri);
  const start = performance.now();

  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      'trakt-api-version': '2',
      'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
    },
  });

  const end = performance.now();
  console.log('duration of fetch from traktapi', Math.round(end - start));
  const responseJSON = await response.json();
  console.log('[Redirect] trakt fetch movie ', responseJSON);
  return responseJSON;
};

export const fetchEpisodeDetails = async (id: number) => {
  const access_token: string = (await getAccessToken()) ?? '';
  //const trakt_uuid: string = (await getTraktUUID()) ?? '';
  const endpoint = `episodes/${id}?extended=images`;
  const baseUrl = process.env.EXPO_PUBLIC_TRAKT_BASE_URL!;
  const uri = `${baseUrl}/${endpoint}`;
  console.log('uri ', uri);
  const start = performance.now();

  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      'trakt-api-version': '2',
      'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
    },
  });

  const end = performance.now();
  console.log('duration of fetch from traktapi', Math.round(end - start));
  const responseJSON = await response.json();
  console.log('[Redirect] trakt fetch episode ', responseJSON);
  return responseJSON;
};

export const fetchShowName = async (id: number) => {
  const access_token: string = (await getAccessToken()) ?? '';
  //const trakt_uuid: string = (await getTraktUUID()) ?? '';
  const endpoint = `shows/${id}`;
  const baseUrl = process.env.EXPO_PUBLIC_TRAKT_BASE_URL!;
  const uri = `${baseUrl}/${endpoint}`;
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      'trakt-api-version': '2',
      'trakt-api-key': process.env.EXPO_PUBLIC_CLIENT_ID!,
    },
  });

  const responseJSON = await response.json();

  return responseJSON;
};
