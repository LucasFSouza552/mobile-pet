import { getLocalDb } from "../LocalDb";

export default async function CreateAchievements() {
    const db = await getLocalDb();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        type TEXT,
        unlockedAt TEXT,
        createdAt TEXT,
        updatedAt TEXT
        )`
    );
}