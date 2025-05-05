import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';

const Profile = () => {
  useEffect(() => {
    console.log('in useeffect of profile');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const setNotif = async () => {
    console.log('notification send');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'John DS is on Instagram',
        body: 'Click here to follow him',
      },
      trigger: null, // shows immediately
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Notification Demo</Text>
      <Button title="Click here for notif" onPress={setNotif} />
    </View>
  );
};

export default Profile; // ✅ FIXED
