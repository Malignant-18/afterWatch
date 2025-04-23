// app/screens/Redirect.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export type RootStackParamList = {
  Landing: undefined;
  Redirect: undefined;
  Main: undefined;
};

type RedirectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Redirect'>;

const Redirect = () => {
  const navigation = useNavigation<RedirectScreenNavigationProp>(); // 👈 Typed nav

  useEffect(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }], // ✅ Now this is properly typed
    });
  }, []);

  return (
    <View>
      <Text>Logging you in...</Text>
    </View>
  );
};

export default Redirect;
