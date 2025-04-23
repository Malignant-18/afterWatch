import { openDatabase } from './dbinit';

export const addItem = async (name: string) => {
  const db = await openDatabase();
  const result = db.runAsync(`INSERT INTO items (name) VALUES (?)`, [name]);
};
export const getItems= async ()=>{
  const db = await openDatabase();
  const result = await db.getAllAsync(``)
}