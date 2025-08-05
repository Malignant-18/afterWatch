import { SQLiteDatabase } from 'expo-sqlite';

import { openDatabase } from './dbinit';

const readNotification = async (): Promise<any> => {
  const db: SQLiteDatabase = await openDatabase();
  const selectQuery =
    'SELECT * FROM notification_queue WHERE status = "unseen" ORDER BY watched_at DESC;';
  try {
    const result = await db.getAllAsync(selectQuery);
    console.log('Notification read successfully:', result);
    return result;
  } catch (error) {
    console.error('Error reading notification:', error);
    return [];
  }
};
export default readNotification;

export const trialnotification = async (): Promise<any> => {
  const db: SQLiteDatabase = await openDatabase();
  const selectQuery = `
    SELECT * FROM watched_history
    WHERE trakt_id NOT IN (
      SELECT trakt_id FROM ratings
    )
    ORDER BY watched_at DESC;
  `;

  try {
    const result = await db.getAllAsync(selectQuery);
    console.log('Notification queue items (unrated but watched):', result);
    return result;
  } catch (error) {
    console.error('Error reading notification queue:', error);
    return [];
  }
};
