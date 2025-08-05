import { SQLiteDatabase } from 'expo-sqlite';

import { openDatabase } from './dbinit';

export const insertNotification = async (): Promise<void> => {
  const db: SQLiteDatabase = await openDatabase();
  const query = `INSERT OR IGNORE INTO notification_queue (ref_id ,type , watched_at, title , show_title , season  ,episode , trakt_id ,slug , status , created_at) 
    
    SELECT 
    wh.ref_id,wh.type, wh.watched_at, wh.title, wh.show_title, wh.season, wh.episode, wh.trakt_id, wh.slug, 'unseen', datetime('now')
    FROM watched_history AS wh

    LEFT JOIN ratings AS r
    On r.type = wh.type
    AND r.trakt_id = wh.trakt_id
    LEFT JOIN notification_queue AS nq
    ON nq.ref_id = wh.ref_id
    WHERE
    r.ref_id IS NULL
    AND nq.ref_id IS NULL;
    `;

  try {
    await db.execAsync('BEGIN TRANSACTION');
    await db.execAsync(query);
    await db.execAsync('COMMIT');
    console.log('Notification inserted successfully');
  } catch (error) {
    console.error('Error inserting notification:', error);
    await db.execAsync('ROLLBACK');
  }
};
