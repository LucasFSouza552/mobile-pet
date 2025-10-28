import createAccountTable from "./migrations/00_CreateAccountTable";
import createAchievementsTable from "./migrations/01_CreateAchievementsTable";
import createPetsTable from "./migrations/02_CreatePetsTable";
import createHistoryTable from "./migrations/03_CreateHistoryTable";
import * as SQLite from 'expo-sqlite';

export async function runMigrations() {
  // await resetDatabase();
  await createAccountTable();
  await createAchievementsTable();
  await createPetsTable();
  await createHistoryTable();
}

export async function resetDatabase() {
  // deletar o banco de dados.
  await SQLite.deleteDatabaseAsync('app.db');
}