// app/screens/Redirect.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const RedirectScreen = () => {
  
  

  useEffect(() => {
    // The actual token exchange is handled by AuthSession
    // We just need to show a loading state and navigate to the main screen
      setTimeout(() => {
        console.log('in profile timeout 10s')
    }, 10000);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ED1C24" />
      <Text style={styles.text}>Completing login...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
});

export default RedirectScreen;
