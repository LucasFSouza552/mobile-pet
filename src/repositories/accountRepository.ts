import { getLocalDb } from "../database/LocalDb";
import { IAccount } from "../models/IAccount";


export const accountRepository = {
    getAll: async (): Promise<IAccount[]> => {
        const db = await getLocalDb();
        const accounts = await db.getAllAsync("SELECT * FROM accounts");
        return accounts as IAccount[];
    },
    getById: async (id: string): Promise<IAccount> => {
        const db = await getLocalDb();
        const account = await db.getFirstAsync("SELECT * FROM accounts WHERE id = ?", [id]);
        return account as IAccount;
    },
    create: async (account: IAccount): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync(
            `
  INSERT INTO accounts (
    name, email, avatar, phone_number, role, cpf, cnpj, verified,
    street, number, complement, city, state, cep, neighborhood
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
            [
                account.name ?? null,
                account.email ?? null,
                account.avatar ?? null,
                account.phone_number ?? null,
                account.role ?? null,
                account.cpf ?? null,
                account.cnpj ?? null,
                account.verified ? 1 : 0,
                account.address?.street ?? null,
                account.address?.number ?? null,
                account.address?.complement ?? null,
                account.address?.city ?? null,
                account.address?.state ?? null,
                account.address?.cep ?? null,
                account.address?.neighborhood ?? null,
            ]
        );
    },
    findLocalAccount: async (): Promise<IAccount | null> => {
        const db = await getLocalDb();
        const account = await db.getFirstAsync(`SELECT * FROM accounts ORDER BY createdAt DESC LIMIT 1`);
        return account as IAccount ?? null;
    },

};