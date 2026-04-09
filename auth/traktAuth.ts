import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { getStoredPushToken } from '../app/notifications/notificationService';
import axiosInstance from '../axios/axiosInstance';

// --- DEBUG FLAG ---
// Set this to `false` in production to disable all debug logs.
const DEBUG = true;

// --- SECURE CONFIG ---
// The CLIENT_ID is public and safe to have here.
const TRAKT_CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;

export const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'afterwatch',
    path: 'auth',
});

// The app only needs to know the AUTHORIZE_URL. The TOKEN_URL is a backend concern.
export const TRAKT_API = {
    AUTHORIZE_URL: 'https://api.trakt.tv/oauth/authorize',
};

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'trakt_access_token',
    REFRESH_TOKEN: 'trakt_refresh_token',
    EXPIRY_DATE: 'trakt_expiry_date',
    TRAKT_UUID: 'trakt_uuid',
};

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

WebBrowser.maybeCompleteAuthSession();

export const loginWithTrakt = async (): Promise<boolean> => {
    if (DEBUG) console.log('[loginWithTrakt] Starting Trakt login flow.');
    try {
        const state = Math.random().toString(36).substring(2, 15);
        if (DEBUG) console.log(`[loginWithTrakt] Generated state: ${state}`);
        if (DEBUG) console.log(`[loginWithTrakt] Using redirect URI: ${redirectUri}`);

        const authRequest = new AuthSession.AuthRequest({
            clientId: TRAKT_CLIENT_ID,
            redirectUri,
            usePKCE: true,
            state,
        });

        if (DEBUG) console.log('[loginWithTrakt] Prompting user for authorization...');
        const result = await authRequest.promptAsync(
            { authorizationEndpoint: TRAKT_API.AUTHORIZE_URL },
            { showInRecents: true }
        );

        if (DEBUG) console.log('Auth result type:', result.type);

        if (result.type === 'success') {
            if (DEBUG) console.log('[loginWithTrakt] Authorization successful.');
            const { code } = result.params;
            if (!code) {
                console.error('[loginWithTrakt] No code returned from auth session');
                throw new Error('No code returned from auth session');
            }

            // Instead of exchanging the code here, send it to your backend
            const tokens = await ExchangeCodeToServer(code, authRequest.codeVerifier!);

            await storeTokens(tokens);
            await sendTokenToServer(); // This will now also handle the push token

            if (DEBUG) console.log('[loginWithTrakt] Login flow completed successfully.');
            return true;
        } else {
            console.warn('[loginWithTrakt] Auth failed or was cancelled. Result:', result);
            return false;
        }
    } catch (error) {
        console.error('[loginWithTrakt] Login error:', error);
        return false;
    }
};

// Exchanges the authorization code for tokens via your secure backend
const ExchangeCodeToServer = async (code: string, codeVerifier: string): Promise<AuthTokens> => {
    if (DEBUG) console.log('[ExchangeCodeToServer] Sending auth code to backend...');
    try {
        const response = await axiosInstance.post('/auth/token', {
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
        });

        const data = response.data;
        if (DEBUG)
            console.log(
                '[ExchangeCodeToServer] Successfully exchanged code for tokens via backend.'
            );
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    } catch (error: any) {
        console.error('[ExchangeCodeToServer] Error exchanging code via backend:', error.message);
        throw error;
    }
};

const storeTokens = async (tokens: AuthTokens): Promise<void> => {
    if (DEBUG)
        console.log(
            `[storeTokens] Storing tokens. Access token starts with: ${tokens.accessToken.substring(0, 8)}...`
        );
    const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000);
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.EXPIRY_DATE, expiryDate.toISOString());
    if (DEBUG) console.log(`[storeTokens] Tokens stored. Expiry date: ${expiryDate.toISOString()}`);
};

export const getAccessToken = async (): Promise<string | null> => {
    return (await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)) || null;
};

export const getTraktUUID = async (): Promise<string | null> => {
    return (await SecureStore.getItemAsync(STORAGE_KEYS.TRAKT_UUID)) || null;
};

// Refreshes the access token using your secure backend
export const refreshAccessToken = async (): Promise<string | null> => {
    if (DEBUG) console.log('[refreshAccessToken] Attempting to refresh access token.');
    try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
            if (DEBUG) console.log('[refreshAccessToken] No refresh token found.');
            return null;
        }
        if (DEBUG) console.log(`[refreshAccessToken] Found refresh token, sending to backend.`);

        const response = await axiosInstance.post('/auth/refresh', {
            refresh_token: refreshToken,
        });

        const data = response.data;
        if (DEBUG) console.log('[refreshAccessToken] Successfully refreshed tokens via backend.');
        await storeTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        });

        return data.access_token;
    } catch (error) {
        console.error('[refreshAccessToken] Error refreshing token via backend:', error);
        await logout(); // If refresh fails, log the user out
        return null;
    }
};

export const logout = async (): Promise<boolean> => {
    if (DEBUG) console.log('[logout] Clearing all authentication data.');
    try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRY_DATE);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TRAKT_UUID);
    } catch (error) {
        console.error('[logout] Error during logout:', error);
        throw new Error('Failed to log out');
    }
    return true;
};

// Syncs essential user data (including push token) to the backend
const sendTokenToServer = async () => {
    if (DEBUG) console.log('[sendTokenToServer] Starting user data sync to backend.');
    const accessToken = await getAccessToken();
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    const expiryDateStr = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRY_DATE);

    if (!refreshToken || !accessToken || !expiryDateStr) {
        console.error('[sendTokenToServer] Missing tokens for server sync.');
        return;
    }

    if (DEBUG) console.log('[sendTokenToServer] Fetching Trakt UUID from Trakt API...');
    const response = await fetch('https://api.trakt.tv/users/settings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID,
        },
    });
    const findTraktUserJson = await response.json();
    const trakt_uuid = findTraktUserJson.user.ids.uuid;
    await SecureStore.setItemAsync(STORAGE_KEYS.TRAKT_UUID, trakt_uuid);
    if (DEBUG) console.log(`[sendTokenToServer] Fetched and stored Trakt UUID: ${trakt_uuid}`);

    const traktData = {
        trakt_uuid,
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDateStr,
    };

    try {
        if (DEBUG) console.log('[sendTokenToServer] Sending user auth data to backend...');
        await axiosInstance.post('/auth', traktData);
        if (DEBUG)
            console.log(
                '[sendTokenToServer] User auth data sync successful. Now syncing push token.'
            );

        await sendPushTokenToServer();
    } catch (error: any) {
        console.error('[sendTokenToServer] Error syncing user data to server:', error.message);
        throw new Error(`[sendTokenToServer] Error syncing user data to server: ${error.message}`);
    }
};

export const sendPushTokenToServer = async () => {
    if (DEBUG) console.log('[sendPushTokenToServer] Attempting to sync push token.');
    try {
        const pushToken = await getStoredPushToken();
        const traktUUID = await getTraktUUID();

        if (pushToken && traktUUID) {
            if (DEBUG)
                console.log(
                    `[sendPushTokenToServer] Found push token and Trakt UUID. Sending to backend.`
                );
            await axiosInstance.post('/auth/set-push-token', {
                trakt_uuid: traktUUID,
                push_token: pushToken,
            });
            if (DEBUG) console.log('[sendPushTokenToServer] Push token sync successful.');
        } else {
            if (DEBUG)
                console.log(
                    '[sendPushTokenToServer] Push token or Trakt UUID not found. Skipping sync.'
                );
        }
    } catch (error: any) {
        console.error('[sendPushTokenToServer] Error sending token to server:', error.message);
        // We don't throw an error here because failing to send the push token
        // should not break the entire login flow.
    }
};
