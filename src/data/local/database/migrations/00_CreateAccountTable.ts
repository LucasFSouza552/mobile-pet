import { getLocalDb } from "../LocalDb";

export default async function createAccountTable() {
    const db = await getLocalDb();
    
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT,
      phone_number TEXT NOT NULL,
      role TEXT NOT NULL,
      cpf TEXT,
      cnpj TEXT,
      verified INTEGER DEFAULT 0,
      street TEXT,
      number TEXT,
      complement TEXT,
      city TEXT,
      state TEXT,
      cep TEXT,
      neighborhood TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      lastSyncedAt TEXT DEFAULT (datetime('now')),
      postCount INTEGER DEFAULT 0
    );
  `);
}
