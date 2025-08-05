// app/notifications/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'expo_push_token';

export async function initializePushToken(): Promise<void> {
  try {
    const existingToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (existingToken) {
      console.log('[notificationService]Expo push token already stored:', existingToken);
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    console.log('final status of notif settings', finalStatus);

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log(' Push token saved:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  } catch (error) {
    console.error('🚨 Failed to initialize push token:', error);
  }
}

export async function getStoredPushToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}
