import { getLocalDb } from "../LocalDb";

export default async function createAccountPetInteractionsTable() {
    const db = await getLocalDb();
    
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS account_pet_interactions (
            id TEXT PRIMARY KEY,
            account TEXT NOT NULL,
            pet TEXT NOT NULL,
            status TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
        );
    `);
}


