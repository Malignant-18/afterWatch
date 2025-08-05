import * as Font from 'expo-font';

export async function LoadFonts() {
  await Font.loadAsync({
    'Dosis-Regular': require('../assets/fonts/Dosis-Regular.ttf'),
    'Dosis-Bold': require('../assets/fonts/Dosis-Bold.ttf'),
    'Catamaran-Regular': require('../assets/fonts/Catamaran-Regular.ttf'),
    'Catamaran-Bold': require('../assets/fonts/Catamaran-Bold.ttf'),
    'Nexa-ExtraLight': require('../assets/fonts/Nexa-ExtraLight.ttf'),
    'Nexa-Heavy': require('../assets/fonts/Nexa-Heavy.ttf'),
    'Nexa-BoldItalic': require('../assets/fonts/Nexa-BoldItalic.ttf'),
    'Nexa-Book': require('../assets/fonts/Nexa-Book.ttf'),
    'Nexa-BookItalic': require('../assets/fonts/Nexa-BookItalic.ttf'),
    'Nexa-Regular': require('../assets/fonts/Nexa-Regular.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
  });
}
