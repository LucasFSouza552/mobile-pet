import createAccountTable from "./migrations/00_CreateAccountTable";
import * as SQLite from 'expo-sqlite';

export async function runMigrations() {
  // await resetDatabase();
  await createAccountTable();
}

export async function resetDatabase() {
  // deletar todos os bancos de dados.
  await SQLite.deleteDatabaseAsync('app.db');
}