import { getLocalDb } from "../LocalDb";

export default async function createPetsTable() {
    const db = await getLocalDb();
    
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            age INTEGER,
            gender TEXT NOT NULL,
            weight REAL NOT NULL,
            images TEXT,
            description TEXT,
            adopted INTEGER DEFAULT 0,
            account TEXT NOT NULL,
            adoptedAt TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            lastSyncedAt TEXT
        );
    `);
}

