import { getLocalDb } from "../LocalDb";

export default async function createHistoryTable() {
    const db = await getLocalDb();
    
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            pet TEXT REFERENCES pets(id),
            institution TEXT,
            account TEXT NOT NULL,
            amount TEXT,
            externalReference TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            lastSyncedAt TEXT
        );
    `);
}

