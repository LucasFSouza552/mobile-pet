import { getLocalDb } from "../database/LocalDb";
import { IHistory } from "../../../models/IHistory";
import { SQLiteBindValue } from "expo-sqlite";

function buildSqlValues<T>(values: Partial<T>) {
    const Interrogations = Object.keys(values).map((key) => `?`).join(', ');
    const sqlValues = Object.values(values) as SQLiteBindValue[];
    if (Object.keys(values).length === 0) {
        return {};
    }
    return {
        interrogations: `(${Interrogations})`,
        values: sqlValues
    }
}

export const historyLocalRepository = {
    getAll: async (): Promise<IHistory[]> => {
        const db = await getLocalDb();
        const history = await db.getAllAsync("SELECT * FROM history");
        return history as IHistory[];
    },

    getById: async (id: string): Promise<IHistory | null> => {
        const db = await getLocalDb();
        const history = await db.getFirstAsync("SELECT * FROM history WHERE id = ?", [id]);
        return history as IHistory ?? null;
    },

    getByAccount: async (accountId: string): Promise<IHistory[]> => {
        const db = await getLocalDb();
        const history = await db.getAllAsync("SELECT * FROM history WHERE account = ? ORDER BY createdAt DESC", [accountId]);
        return history as IHistory[];
    },

    create: async (history: IHistory): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync(
            `
            INSERT INTO history (
                id, type, status, pet, institution, account, 
                amount, externalReference, createdAt, updatedAt, lastSyncedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                type = excluded.type,
                status = excluded.status,
                pet = excluded.pet,
                institution = excluded.institution,
                account = excluded.account,
                amount = excluded.amount,
                externalReference = excluded.externalReference,
                updatedAt = excluded.updatedAt,
                lastSyncedAt = excluded.lastSyncedAt
            `,
            [
                history.id,
                history.type,
                history.status ?? 'pending',
                history.pet ?? null,
                history.institution ?? null,
                history.account,
                history.amount ?? null,
                history.externalReference ?? null,
                history.createdAt,
                history.updatedAt,
                history.lastSyncedAt ?? null
            ]
        );
    },

    update: async (id: string, history: Partial<IHistory>): Promise<void> => {
        const db = await getLocalDb();

        // if (history.type !== undefined) {
        //     updates.push("type = ?");
        //     values.push(history.type);
        // }
        // if (history.status !== undefined) {
        //     updates.push("status = ?");
        //     values.push(history.status);
        // }
        // if (history.pet !== undefined) {
        //     updates.push("pet = ?");
        //     values.push(history.pet);
        // }
        // if (history.institution !== undefined) {
        //     updates.push("institution = ?");
        //     values.push(history.institution);
        // }
        // if (history.amount !== undefined) {
        //     updates.push("amount = ?");
        //     values.push(history.amount);
        // }
        // if (history.externalReference !== undefined) {
        //     updates.push("externalReference = ?");
        //     values.push(history.externalReference);
        // }
        // if (history.updatedAt !== undefined) {
        //     updates.push("updatedAt = ?");
        //     values.push(history.updatedAt);
        // }
        // if (history.lastSyncedAt !== undefined) {
        //     updates.push("lastSyncedAt = ?");
        //     values.push(history.lastSyncedAt);
        // }

        const { interrogations, values: sqlValues } = buildSqlValues(history);

        await db.runAsync(
            `UPDATE history SET ${interrogations} WHERE id = ?`,
            sqlValues ?? []
        );
    },

    delete: async (id: string): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM history WHERE id = ?", [id]);
    },

    deleteAll: async (): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM history");
    },

    getLastSyncTime: async () => {
        const db = await getLocalDb();
        const syncTime = await db.getFirstAsync(`SELECT lastSyncedAt FROM history ORDER BY lastSyncedAt DESC LIMIT 1`);
        return syncTime as { lastSyncedAt: string } ?? null;
    }
};

