// TraktAuth.ts
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

// This line is critical - add it at the top of your file
WebBrowser.maybeCompleteAuthSession();

// Define your Trakt API credentials - store these in your environment variables
const TRAKT_CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;
const TRAKT_CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET!;

// Define the redirect URL with afterWatch scheme
export const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'afterwatch', // Using your app name as the scheme
  path: 'redirect',
});

console.log(`in traktAuth  redirectUri: ${redirectUri}`);
// Trakt API endpoints - using the ones you provided
const TRAKT_API = {
  BASE_URL: 'https://api.trakt.tv',
  AUTHORIZE_URL: 'https://api.trakt.tv/oauth/authorize',
  TOKEN_URL: 'https://private-60ba13-trakt.apiary-mock.com/oauth/token',
};

// Define what data we want to access

// Storage keys for secure storage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'trakt_access_token',
  REFRESH_TOKEN: 'trakt_refresh_token',
  EXPIRY_DATE: 'trakt_expiry_date',
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
// Add this near the top of your TraktAuth.ts file
const DEBUG = true;

export const loginWithTrakt = async (): Promise<boolean> => {
  try {
    if (DEBUG) console.log('Starting Trakt auth...');

    // Generate random state for security
    const state = Math.random().toString(36).substring(2, 15);
    if (DEBUG) console.log('Generated state:', state);

    // Log the redirect URI being used
    if (DEBUG) console.log('Using redirect URI:', redirectUri);

    // Configure the authentication request
    const authRequest = new AuthSession.AuthRequest({
      clientId: TRAKT_CLIENT_ID,
      redirectUri,
      usePKCE: true,
      state,
    });

    if (DEBUG) console.log('Created auth request, starting promptAsync...');

    // The important change is here
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
      const { code, state: returnedState } = result.params;

      if (DEBUG) console.log('Got code:', code?.substring(0, 4) + '...');
      if (DEBUG) console.log('Returned state:', returnedState);

      // Verify state to prevent CSRF attacks
      if (state !== returnedState) {
        console.error('State mismatch! Expected:', state, 'Got:', returnedState);
        throw new Error('Invalid state returned');
      }

      if (DEBUG) console.log('Exchanging code for token...');

      // Exchange code for tokens
      const tokens = await exchangeCodeForToken(code, authRequest.codeVerifier!);

      if (DEBUG) console.log('Got tokens, storing...');

      // Store tokens securely
      await storeTokens(tokens);

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
  if (DEBUG) console.log('Sending token exchange request...');
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

  try {
    const response = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenRequestData),
    });

    if (DEBUG) console.log('Token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (DEBUG) console.log('Token exchange succeeded with data keys:', Object.keys(data));
    if (DEBUG)
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
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expiresIn);

  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.EXPIRY_DATE, expiryDate.toISOString());
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const expiryDateStr = await SecureStore.getItemAsync(STORAGE_KEYS.EXPIRY_DATE);

    if (!accessToken || !expiryDateStr) {
      return null;
    }

    const expiryDate = new Date(expiryDateStr);
    const now = new Date();

    // If token is expired, refresh it
    if (now >= expiryDate) {
      return await refreshAccessToken();
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

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

// Example API call function
export const fetchTraktData = async (endpoint: string): Promise<any> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${TRAKT_API.BASE_URL}/${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': TRAKT_CLIENT_ID,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};
