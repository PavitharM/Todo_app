import * as SQLite from 'expo-sqlite';
let connection: Promise<SQLite.SQLiteDatabase> | null = null;
export function database() { if(!connection) connection=(async()=>{const db=await SQLite.openDatabaseAsync('super-todo.db'); await db.execAsync(`PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(collection,id)); PRAGMA user_version = 1;`);return db;})().catch(error=>{connection=null;throw error;}); return connection; }
