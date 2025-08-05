import axiosInstance from 'axios/axiosInstance';
import * as SecureStore from 'expo-secure-store';

const storePushToken = async (push_token: string) => {
  try {
    await SecureStore.setItemAsync('expo_push_token', push_token);
    const get_push_token = await SecureStore.getItemAsync('expo_push_token');
    const serverReponse = await axiosInstance.post('/auth/sendExpoPushToken', get_push_token);
    console.log('server resonse' + serverReponse.data);
  } catch (error: any) {
    console.error('[storePushToken] Error sending token to server:', error.message);
    throw new Error(`[storePushToken] Error sending token to server: ${error.message}`);
  }
};

export default storePushToken;
