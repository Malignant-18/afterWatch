import { SQLiteDatabase } from 'expo-sqlite';
import {
  TraktHistoryItem,
  TraktHistoryEpisode,
  TraktHistoryMovie,
} from 'interfaces/interface_history';

import { openDatabase } from './dbinit';
export const readHistory = async (): Promise<TraktHistoryItem[]> => {
  const db: SQLiteDatabase = await openDatabase();
  console.log('opened Db starting read from db');
  const selectQuery = `SELECT * FROM watched_history ORDER BY watched_at DESC;`;

  try {
    const result = await db.getAllAsync(selectQuery);
    console.log('result from db                         :', result);
    const history: TraktHistoryItem[] = result.map((row: any) => {
      const base = {
        id: parseInt(row.ref_id, 10),
        type: row.type,
        watched_at: row.watched_at,
      };

      if (row.type === 'movie') {
        return {
          ...base,
          type: 'movie',
          movie: {
            title: row.title ?? '',
            ids: {
              trakt: row.trakt_id ?? 0,
            },
          },
        } as TraktHistoryMovie;
      } else {
        return {
          ...base,
          type: 'episode',
          episode: {
            title: row.title ?? '',
            season: row.season ?? 0,
            number: row.episode ?? 0,
            ids: {
              trakt: row.trakt_id ?? 0,
            },
          },
          show: {
            title: row.show_title ?? '',
            ids: {
              trakt: 0,
            },
          },
        } as TraktHistoryEpisode;
      }
    });
    console.log('succesfully read historyyyyyy');
    return history;
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};
