import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function useNotificationListeners() {
  useEffect(() => {
    console.log('[useNotificationListeners] in useEfect begn');
    // Set up foreground notification listener
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      //console.log('📩 Foreground notification received:', notification);
      const data = notification.request.content.data;
      if (data?.trakt_id) {
        console.log('🔗 Opening deep link:', data.trakt_id);
      }
      if (data?.type) {
        console.log('Typeeeeeeeeeeeeedeep link:', data.type);
      }
    });

    // Set up background/tap notification listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped with data:', data);

        if (!data?.type || !data?.trakt_id) {
          console.log('Notification data is missing type or trakt_id.');
          return;
        }

        let url = '';

        // Construct the URL based on the notification type
        switch (data.type) {
          case 'movie':
            url = `afterwatch://movie/${data.trakt_id}`;
            break;

          case 'episode': {
            // Now we can easily add the optional show_trakt_id as a query param
            const showIdQuery = data.show_trakt_id ? `?show_trakt_id=${data.show_trakt_id}` : '';
            url = `afterwatch://episode/${data.trakt_id}${showIdQuery}`;
            break;
          }

          case 'episode_group':
            // Note: The param name in the URL ('group/:show_id') is handled by the linking config
            url = `afterwatch://group/${data.trakt_id}`;
            break;

          default:
            console.log('Unknown notification type:', data.type);
            return;
        }

        console.log('Deep Linking to:', url);
        Linking.openURL(url);
      }
    );
    // Cleanup on unmount
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
