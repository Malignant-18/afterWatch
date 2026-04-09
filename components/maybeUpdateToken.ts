import SecureStore from 'expo-secure-store';

export const maybeUpdateAccessToken = async (responseData: any) => {
    if (responseData?.new_access_token) {
        console.log('[Token Sync] accesstoken update : ', responseData?.new_access_token ?? 'hehe');
        await SecureStore.setItemAsync('trakt_access_token', responseData.new_access_token);
    }
};
