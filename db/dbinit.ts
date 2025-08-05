import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;
export const openDatabase = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('my-database.db');
  return db;
};

export const initDatabase = async (): Promise<void> => {
  const db = await openDatabase();
  try {
    await db.execAsync(`
    -- 📘 1. Watched History
    CREATE TABLE IF NOT EXISTS watched_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      watched_at TEXT NOT NULL,
      show_title TEXT,
      title TEXT NOT NULL,
      season INTEGER,
      episode INTEGER,
      trakt_id INTEGER,
      slug TEXT
    );

    -- ⭐ 2. Ratings
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      rating INTEGER NOT NULL,
      rated_at TEXT NOT NULL,
      title TEXT NOT NULL,
      show_title TEXT,
      season INTEGER,
      episode INTEGER,
      trakt_id INTEGER,
      slug TEXT
    );

    -- 🔔 3. Notification Queue
    CREATE TABLE IF NOT EXISTS notification_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      watched_at TEXT NOT NULL,
      title TEXT NOT NULL,
      show_title TEXT,
      season INTEGER,
      episode INTEGER,
      trakt_id INTEGER,
      slug TEXT,

      status TEXT DEFAULT 'unseen',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
  `);

    console.log(
      '✅ Database initialized with tables: watched_history, ratings, notification_queue'
    );
  } catch (Error) {
    console.log('Error in initDatabase' + Error);
  }
};

export const deleteDB = async () => {
  const db = await openDatabase();
  try {
    await db.runAsync('DELETE FROM watched_history');
    console.log('deletion syccessful');
  } catch (Error) {
    console.log('error deleteing db ::' + Error);
  }
  try {
    await db.runAsync('DELETE FROM ratings');
    console.log('deletion syccessful');
  } catch (Error) {
    console.log('error deleteing db ::' + Error);
  }
  try {
    await db.runAsync('DELETE FROM notification_queue');
    console.log('deletion syccessful');
  } catch (error) {
    console.log('error deleteing db ::' + error);
  }
};

export const resetDatabase = async (): Promise<boolean> => {
  const db: SQLiteDatabase = await openDatabase();
  console.log('Resetting database...');
  try {
    // Drop existing tables
    await db.execAsync('DROP TABLE IF EXISTS ratings');
    await db.execAsync('DROP TABLE IF EXISTS watched_history');
    await db.execAsync('DROP TABLE IF EXISTS notification_queue');
    console.log('Database tables dropped successfully');
    return true;
  } catch (error) {
    console.error('Error dropping database tables:', error);
    return false;
  }
};
