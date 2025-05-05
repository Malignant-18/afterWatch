import { SQLiteDatabase } from 'expo-sqlite';
import { TraktHistoryItem } from 'interfaces/interface_history';

import { openDatabase } from './dbinit';

export const insertHistory = async (history: TraktHistoryItem[]): Promise<void> => {
  const db: SQLiteDatabase = await openDatabase();

  const insertQuery = `
  INSERT INTO watched_history (
    ref_id, type, watched_at, show_title, title, season, episode, trakt_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

  console.log('in insertHistory before transaction');
  try {
    await db.execAsync('BEGIN TRANSACTION');

    for (const item of history) {
      let showTitle = null;
      let title = '';
      let season = null;
      let episode = null;

      if (item.type === 'movie') {
        title = item.movie.title;
      } else if (item.type === 'episode') {
        title = item.episode.title;
        showTitle = item.show?.title ?? '';
        season = item.episode.season;
        episode = item.episode.number;
      }

      const ids = item.type === 'movie' ? item.movie.ids : item.episode.ids;

      await db.runAsync(insertQuery, [
        item.id.toString(), // ref_id
        item.type,
        item.watched_at,
        showTitle,
        title,
        season,
        episode,
        ids.trakt ?? null,
      ]);
    }

    await db.execAsync('COMMIT');
    console.log('History inserted successfully');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    console.error('Error inserting history:', error);
  }
};
