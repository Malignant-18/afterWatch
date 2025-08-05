// screens/Profile.tsx
import { maybeUpdateAccessToken } from 'components/maybeUpdateToken';
import { Heatmap } from 'components/ui/heatmap';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Button, Text, View, Alert } from 'react-native';

//const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;
const BACKEND_URL = 'http://192.168.29.130:5000/api/trial';

const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Follow John DS on Instagram',
            body: 'Click here to follow him',
        },
        trigger: null,
    });
};

const fetchTraktData = async () => {
    try {
        const trakt_uuid = await SecureStore.getItemAsync('trakt_uuid');
        const access_token = await SecureStore.getItemAsync('trakt_access_token');
        const refresh_token = await SecureStore.getItemAsync('trakt_refresh_token');
        console.log('refresh ' + refresh_token);
        console.log('acess ' + access_token);
        console.log('url ' + BACKEND_URL);
        //const refresh_token = await SecureStore.getItemAsync('trakt_refresh_token');

        if (!trakt_uuid || !access_token) {
            Alert.alert('Error', 'Trakt UUID or access token missing.');
            return;
        }

        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: {
                trakt_uuid,
                access_token,
            },
        });
        console.log('repsonse', response);
        const data = await response.json();
        await maybeUpdateAccessToken(data);

        if (!response.ok) throw new Error(data.error || 'Unknown error');

        Alert.alert('Success', 'Data received successfully.');
    } catch (error: any) {
        console.error('[Profile] Fetch error:', error);
        Alert.alert('Error', error.message);
    }
};

const Profile = () => (
    <View style={{ padding: 20 }}>
        <Text className="font-dosis text-xl">This is Dosis</Text>
        <Text className="font-catamaran text-lg">This is Catamaran</Text>
        <Text className="font-dosis-bold text-xl">This is Dosis</Text>
        <Text className="font-catamaran-bold text-lg">This is Catamaran</Text>
        <Text className="font-nexa text-lg font-bold">This is Nexa</Text>
        <Text className="font-nexa-bold text-lg">This is Nexa</Text>
        <Text className="font-montserrat-semibold text-lg">This is Montserrat</Text>
        <Text className="font-montserrat text-lg">This is Montserrat</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Profile</Text>
        <Button title="🔔 Send Test Notification" onPress={sendLocalNotification} />

        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16 }}>Backend Communication</Text>
            <Button title="Fetch Trakt Data" onPress={fetchTraktData} />
        </View>
        <View className="w-full bg-dark-200">
            <Heatmap />
        </View>
    </View>
);

export default Profile;
