import { getLocalDb } from "../LocalDb";

export default async function AddLastSyncedAtToAchievements() {
    const db = await getLocalDb();

    const tableInfo = await db.getAllAsync("PRAGMA table_info(achievements)");
    const hasLastSyncedAt = (tableInfo as any[]).some((col: any) => col.name === 'lastSyncedAt');

    if (!hasLastSyncedAt) {
        await db.execAsync(`
            ALTER TABLE achievements ADD COLUMN lastSyncedAt TEXT
        `);
    }
}

