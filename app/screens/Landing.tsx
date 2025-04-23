import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAccessToken, redirectUri } from 'api/traktAuth';
import LoginTrakt from 'components/loginTrakt';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

export type RootStackParamList = {
  Landing: undefined;
  Redirect: undefined;
  Main: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const DEBUG = true;

export default function Landing() {
  const navigation = useNavigation<NavigationProp>();
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true); // NEW
  useEffect(() => {
    if (DEBUG) {
      console.log('App scheme:', Linking.createURL('main'));
      Linking.getInitialURL().then((url) => {
        console.log('Initial URL:', url);
      });
    }
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (DEBUG) console.log('Checking login status...');
      const token = await getAccessToken();
      if (token) {
        console.log('Token found:', token);
        setLogged(true);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
      setLoading(false); // done checking
    };

    if (DEBUG) {
      checkLoginStatus();
    } else {
      setLoading(false); // don't check, allow debug access
    }
  }, []);

  const testDeepLinking = async () => {
    console.log('Testing deep link with URI:', redirectUri);
  };
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Checking login status...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-2 text-2xl font-bold text-blue-500">aFterWatch</Text>
      <Text className="mb-4 text-center font-semibold text-red-400">
        Track your favorite shows and get notified!
      </Text>

      {!logged && <LoginTrakt title="Login with trakt" />}

      <View className="mt-4">
        <Button title="Test Deep Linking" onPress={testDeepLinking} />
      </View>
    </View>
  );
}
