import { SQLiteDatabase } from 'expo-sqlite';
import {
  TraktRatingItem,
  TraktRatingMovie,
  TraktRatingShow,
  TraktRatingEpisode,
} from 'interfaces/interface_rating';

import { openDatabase } from './dbinit';

export const readRatings = async (): Promise<TraktRatingItem[]> => {
  const db: SQLiteDatabase = await openDatabase();
  console.log('opened Db starting read ratings from db');
  const selectQuery = `SELECT * FROM ratings ORDER BY rated_at DESC;`;
  try {
    const result = await db.getAllAsync(selectQuery);
    console.log('result from db                              :', result);
    const ratings: TraktRatingItem[] = result.map((row: any) => {
      const base = {
        ref_id: row.ref_id,
        rating: row.rating,
        rated_at: row.rated_at,
        type: row.type,
      };
      if (row.type === 'movie') {
        return {
          ...base,
          type: 'movie',
          movie: {
            title: row.title || '',
            year: 0, // Default value as it's not stored in DB
            ids: {
              trakt: row.trakt_id || 0,
              slug: row.slug || '',
            },
          },
        } as TraktRatingMovie;
      } else if (row.type === 'show') {
        return {
          ...base,
          type: 'show',
          show: {
            title: row.title || '',
            year: 0, // Default value as it's not stored in DB
            ids: {
              trakt: row.trakt_id || 0,
              slug: row.slug || '',
            },
          },
        } as TraktRatingShow;
      } else {
        return {
          ...base,
          type: 'episode',
          episode: {
            title: row.title || '',
            season: row.season || 0,
            number: row.episode || 0,
            ids: {
              trakt: row.trakt_id || 0,
            },
          },
          show: {
            title: row.show_title || '',
            year: 0, // Default value as it's not stored in DB
            ids: {
              trakt: 0, // We don't have show trakt_id for episodes
              slug: '',
            },
          },
        } as TraktRatingEpisode;
      }
    });

    console.log('successfully read ratings');
    return ratings;
  } catch (error) {
    console.error('Error reading ratings:', error);
    return [];
  }
};
