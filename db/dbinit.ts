import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('my-database.db');
};

export const initDatabase = async () => {
  const db = await openDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  console.log('database initilaised');
};
