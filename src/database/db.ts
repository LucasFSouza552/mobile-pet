import { openDatabaseAsync } from "expo-sqlite";

export async function getDbConnection() {
  const db = await openDatabaseAsync("app.db");
  return db;
}
