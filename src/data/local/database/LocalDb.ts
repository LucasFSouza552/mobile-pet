import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getLocalDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');
    await db.execAsync('PRAGMA user_version = 0');
  }
  return db;
}


export async function getDatabaseVersion(): Promise<number> {
  const db = await getLocalDb();
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return result?.user_version ?? 0;
}


export async function setDatabaseVersion(version: number): Promise<void> {
  const db = await getLocalDb();
  await db.execAsync(`PRAGMA user_version = ${version}`);
}
