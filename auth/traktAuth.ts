import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import axiosInstance from '../axios/axiosInstance';

const DEBUG = true;
WebBrowser.maybeCompleteAuthSession();

const TRAKT_CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;
const TRAKT_CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET!;
const backend_url = process.env.EXPO_PUBLIC_BACKEND_URL!;
const endpoint_me = `${backend_url}/me`;

export const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'afterwatch',
    path: 'auth',
});

export const TRAKT_API = {
    BASE_URL: 'https://api.trakt.tv',
    AUTHORIZE_URL: 'https://api.trakt.tv/oauth/authorize',
    TOKEN_URL: 'https://private-60ba13-trakt.apiary-mock.com/oauth/token',
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

export const loginWithTrakt = async (): Promise<boolean> => {
    try {
        if (DEBUG) console.log('in traktAuth.ts');

        const state = Math.random().toString(36).substring(2, 15);

        if (DEBUG) console.log('Using redirect URI:', redirectUri);

        const authRequest = new AuthSession.AuthRequest({
            clientId: TRAKT_CLIENT_ID,
            redirectUri,
            usePKCE: true,
            state,
        });

        if (DEBUG) console.log('Created auth request, starting promptAsync...');

        const result = await authRequest.promptAsync(
            {
                authorizationEndpoint: TRAKT_API.AUTHORIZE_URL,
            },
            {
                showInRecents: true,
            }
        );

        if (DEBUG) console.log('Auth result type:', result.type);

        if (result.type === 'success') {
            const { code } = result.params;

            if (DEBUG) console.log('Got code:', code?.substring(0, 4) + '...');
            if (!code) {
                console.error('No code returned from auth session');
                throw new Error('No code returned from auth session');
            }

            const tokens = await exchangeCodeForToken(code, authRequest.codeVerifier!);

            if (DEBUG) console.log('Got tokens, storing...');

            await storeTokens(tokens);

            await sendTokenToServer();
            if (DEBUG) console.log('Auth flow completed successfully!');
            return true;
        } else {
            console.warn('Auth failed or was cancelled. Result:', result);
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
};

const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<AuthTokens> => {
    if (DEBUG) console.log('in exchangeCodeForToken with code:');
    const tokenRequestData = {
        code,
        client_id: TRAKT_CLIENT_ID,
        client_secret: TRAKT_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
    };

    if (DEBUG)
        console.log('Token request data:', {
            ...tokenRequestData,
            client_secret: '[HIDDEN]',
            code: code.substring(0, 4) + '...',
            code_verifier: '[HIDDEN]',
        });
    console.log('Token response hehehhehe:');
    try {
        const response = await fetch('https://api.trakt.tv/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokenRequestData),
        });

        console.log('Token response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token exchange failed:', errorText);
            throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (DEBUG) console.log('Token exchange succeeded with data keys:', Object.keys(data));

        console.log(
            `Token exchange succeeded with data value:'${data.access_token}  :  ${data.expires_in}`
        );

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    } catch (error) {
        console.error('Error in token exchange:', error);
        throw error;
    }
};

const storeTokens = async (tokens: AuthTokens): Promise<void> => {
    console.log('Storing tokens:');
    const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000);
    console.log('Acess tokens : ' + tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.EXPIRY_DATE, expiryDate.toISOString());
    console.log(' After Storing tokens:');
};

export const getAccessToken = async (): Promise<string | null> => {
    return (await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)) || null;
};

export const getTraktUUID = async (): Promise<string | null> => {
    return (await SecureStore.getItemAsync(STORAGE_KEYS.TRAKT_UUID)) || null;
};

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        console.log('[traktAuth]in refreshAccessToken : ~~~~~~Refresh token:', refreshToken);
        if (!refreshToken) {
            return null;
        }

        const response = await fetch(TRAKT_API.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: refreshToken,
                client_id: TRAKT_CLIENT_ID,
                client_secret: TRAKT_CLIENT_SECRET,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('accessToken : ' + data.access_token);
        console.log('regreshToken : ' + data.refresh_token);
        console.log('expires_in : ' + data.expires_in);
        // Store new tokens
        await storeTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        });

        return data.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};

export const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRY_DATE);
};

const sendTokenToServer = async () => {
    console.log('SendTokenToServer');
    const accessToken = await getAccessToken();
    console.log('Sending access token to server:', accessToken);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
        console.error('No refresh token available to send to server');
        return;
    }
    console.log('Sending refresh token to server:', refreshToken);
    const expiryDateStr = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRY_DATE);
    if (!expiryDateStr) {
        console.error('No expiry date available to send to server');
        return;
    }
    console.log('Sending expiry date to server:', expiryDateStr);

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
    const trakt_uuid_from_store = await SecureStore.getItemAsync(STORAGE_KEYS.TRAKT_UUID);
    console.log('Trakt UUID:', trakt_uuid_from_store);
    const traktData = {
        trakt_uuid: trakt_uuid_from_store,
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDateStr,
    };
    try {
        console.log('Server send moment');
        /*try {
      const connectivityTestResponse = await fetch('http://192.168.29.130:5000/me');
      const connectivityTestResult = await connectivityTestResponse.text();
      console.log('Connectivity test result:', connectivityTestResult);
    } catch (err) {
      console.error('Connectivity test failed:', err);
    }*/
        const serverResponse = await axiosInstance.post('/auth', traktData);
        console.log('Server response:', serverResponse.data);
    } catch (error: any) {
        console.error('Error sending token to server:', error.message);
        throw new Error(`Error sending token to server: ${error.message}`);
    }
    console.log('Token sent to server successfully');
};
