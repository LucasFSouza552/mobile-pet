import createAccountTable from "./migrations/00_CreateAccountTable";
import createAchievementsTable from "./migrations/01_CreateAchievementsTable";
import createPetsTable from "./migrations/02_CreatePetsTable";
import createHistoryTable from "./migrations/03_CreateHistoryTable";
import createAccountPetInteractionsTable from "./migrations/04_CreateAccountPetInteractionsTable";
import * as SQLite from 'expo-sqlite';
import { getLocalDb, setDatabaseVersion } from "./LocalDb";
import createPetImagesTable from "./migrations/05_CreatePetImagesTable";
import addLastSyncedAtToAchievements from "./migrations/06_AddLastSyncedAtToAchievements";

type Migration = {
  id: number;
  name: string;
  up: () => Promise<void>;
};

const migrations: Migration[] = [
  { id: 0, name: "00_CreateAccountTable", up: createAccountTable },
  { id: 1, name: "01_CreateAchievementsTable", up: createAchievementsTable },
  { id: 2, name: "05_CreatePetImagesTable", up: createPetImagesTable },
  { id: 3, name: "02_CreatePetsTable", up: createPetsTable },
  { id: 4, name: "03_CreateHistoryTable", up: createHistoryTable },
  { id: 5, name: "04_CreateAccountPetInteractionsTable", up: createAccountPetInteractionsTable },
  { id: 6, name: "06_AddLastSyncedAtToAchievements", up: addLastSyncedAtToAchievements },
];

async function ensureMigrationsTable() {
  const db = await getLocalDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL
    );
  `);
}

async function getAppliedMigrationIds(): Promise<Set<number>> {
  const db = await getLocalDb();
  const rows = await db.getAllAsync("SELECT id FROM _migrations ORDER BY id ASC");
  const set = new Set<number>();
  for (const row of rows as Array<{ id: number }>) {
    set.add(row.id);
  }
  return set;
}

export async function runMigrations() {
  await ensureMigrationsTable();
  const db = await getLocalDb();
  const applied = await getAppliedMigrationIds();

  for (const m of migrations.sort((a, b) => a.id - b.id)) {
    if (applied.has(m.id)) {
      continue;
    }

    await db.execAsync("BEGIN");
    try {
      await m.up();
      await db.runAsync(
        "INSERT INTO _migrations (id, name, appliedAt) VALUES (?, ?, datetime('now'))",
        [m.id, m.name]
      );
      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  const maxMigrationId = Math.max(...migrations.map(m => m.id), 0);
  await setDatabaseVersion(maxMigrationId);
}

export async function resetDatabase() {
  await SQLite.deleteDatabaseAsync('app.db');
}