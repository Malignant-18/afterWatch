import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function useNotificationListeners() {
    useEffect(() => {
        console.log('[useNotificationListeners] in useEffect begin');
        const foregroundSubscription = Notifications.addNotificationReceivedListener(
            (notification) => {
                const data = notification.request.content.data;
                if (data?.trakt_id) {
                    console.log('🔗 Opening deep link:', data.trakt_id);
                }
                if (data?.type) {
                    console.log('Typeeeeeeeeeeeeedeep link:', data.type);
                }
            }
        );
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
                switch (data.type) {
                    case 'movie':
                        url = `afterwatch://movie/${data.trakt_id}`;
                        break;
                    case 'episode': {
                        const showIdQuery = data.show_trakt_id
                            ? `?show_trakt_id=${data.show_trakt_id}`
                            : '';
                        url = `afterwatch://episode/${data.trakt_id}${showIdQuery}`;
                        break;
                    }

                    case 'episode_group':
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
