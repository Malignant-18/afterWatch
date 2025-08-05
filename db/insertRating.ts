import { SQLiteDatabase } from 'expo-sqlite';
import { TraktRatingItem } from 'interfaces/interface_rating';

import { openDatabase } from './dbinit';

export const insertRatings = async (ratings: TraktRatingItem[]): Promise<void> => {
  const db: SQLiteDatabase = await openDatabase();

  const insertQuery = `
    INSERT INTO ratings (
    ref_id ,
      type, rating, rated_at, show_title, title, season, episode, trakt_id, 
      slug
    ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  console.log('in insertRatings before transaction');

  try {
    await db.execAsync('BEGIN TRANSACTION');

    for (const item of ratings) {
      let showTitle = null;
      let title = '';
      let season = null;
      let episode = null;
      let traktId = null;
      let slug = null;

      // Extract data based on item type
      if (item.type === 'movie') {
        title = item.movie.title;
        traktId = item.movie.ids.trakt;
        slug = item.movie.ids.slug;
      } else if (item.type === 'show') {
        title = item.show.title;
        traktId = item.show.ids.trakt;
        slug = item.show.ids.slug;
      } else if (item.type === 'episode') {
        title = item.episode.title;
        showTitle = item.show.title;
        season = item.episode.season;
        episode = item.episode.number;
        traktId = item.episode.ids.trakt;
      }

      await db.runAsync(insertQuery, [
        traktId,
        item.type,
        item.rating,
        item.rated_at,
        showTitle,
        title,
        season,
        episode,
        traktId,
        slug,
      ]);
    }

    await db.execAsync('COMMIT');
    console.log('Ratings inserted successfully');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    console.error('Error inserting ratings:', error);
  }
};
