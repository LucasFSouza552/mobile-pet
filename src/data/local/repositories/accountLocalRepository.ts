import { getLocalDb } from "../database/LocalDb";
import { IAccount } from "../../../models/IAccount";
import { removeStorage } from "../../../utils/storange";
import { petImageLocalRepository } from "./petImageLocalRepository";

export const accountLocalRepository = {
    getAll: async (): Promise<IAccount[]> => {
        const db = await getLocalDb();
        const accounts = await db.getAllAsync("SELECT * FROM accounts");
        return accounts as IAccount[];
    },
    getById: async (id: string): Promise<IAccount | null> => {
        const db = await getLocalDb();
        const account = await db.getFirstAsync("SELECT * FROM accounts WHERE id = ?", [id]);
        return account as IAccount ?? null;
    },
    create: async (account: IAccount): Promise<void> => {
        const db = await getLocalDb();

        try {
            await db.runAsync(
                `
        INSERT INTO accounts (
            id, name, email, avatar, phone_number, role, cpf, cnpj, verified,
            street, number, complement, city, state, cep, neighborhood, lastSyncedAt, postCount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            id = excluded.id,
            name = excluded.name,
            avatar = excluded.avatar,
            phone_number = excluded.phone_number,
            role = excluded.role,
            cpf = excluded.cpf,
            cnpj = excluded.cnpj,
            verified = excluded.verified,
            street = excluded.street,
            number = excluded.number,
            complement = excluded.complement,
            city = excluded.city,
            state = excluded.state,
            cep = excluded.cep,
            neighborhood = excluded.neighborhood,
            lastSyncedAt = excluded.lastSyncedAt,
            postCount = excluded.postCount
        `,
                [
                    account.id,
                    account.name,
                    account.email,
                    account.avatar ?? null,
                    account.phone_number ?? null,
                    account.role ,
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
                    account.lastSyncedAt ?? null,
                    account.postCount ?? 0
                ]
            );
        } catch (error: any) {
            throw error;
        }

    },
    findLocalAccount: async (): Promise<IAccount | null> => {
        const db = await getLocalDb();
        const account = await db.getFirstAsync(`SELECT * FROM accounts ORDER BY createdAt DESC LIMIT 1`);
        return account as IAccount ?? null;
    },
    delete: async (id: string): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM accounts WHERE id = ?", [id]);
    },
    logout: async (): Promise<void> => {
        const db = await getLocalDb();
        
        let retries = 5;
        let lastError: any = null;
        
        while (retries > 0) {
            try {
                await db.execAsync("BEGIN");
                
                try {
                    await db.runAsync("DELETE FROM account_pet_interactions");
                } catch (error) {
                    throw error;
                }
                
                try {
                    await db.runAsync("DELETE FROM pet_images");
                } catch (error) {
                    throw error;
                }
                
                try {
                    await db.runAsync("DELETE FROM pets");
                } catch (error) {
                    throw error;
                }
                
                try {
                    await db.runAsync("DELETE FROM history");
                } catch (error) {
                    throw error;
                }
                
                try {
                    await db.runAsync("DELETE FROM achievements");
                } catch (error) {
                    throw error;
                }
                
                try {
                    await db.runAsync("DELETE FROM accounts");
                } catch (error) {
                    throw error;
                }
                
                await db.execAsync("COMMIT");
                
                break;
            } catch (error: any) {
                lastError = error;
                
                try {
                    await db.execAsync("ROLLBACK");
                } catch (rollbackError) {
                    throw rollbackError;
                }
                
                if (!error?.message?.includes('database is locked') && !error?.message?.includes('locked')) {
                    throw error;
                }
                
                if (retries > 1) {
                    retries--;
                    const delay = 100 * (6 - retries); 
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                throw error;
            }
        }

        try {
            await petImageLocalRepository.deleteAllLocalImages();
        } catch (error) {
            throw error;
        }

        try {
            await removeStorage("@token");
            await removeStorage("@email");
        } catch (error) {
            throw error;
        }
    },

    getLastSyncTime: async () => {
        const db = await getLocalDb();
        const syncTime = await db.getFirstAsync(`SELECT lastSyncedAt FROM accounts ORDER BY lastSyncedAt DESC LIMIT 1`);
        return syncTime as { lastSyncedAt: string } ?? null;
    }
};
