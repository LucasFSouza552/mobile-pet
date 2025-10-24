import { getDbConnection } from "../db";

export default async function createAccountTable() {
    console.log("Conectando ao banco de dados...");
    const db = await getDbConnection();

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT,
      password TEXT NOT NULL,
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
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
}
