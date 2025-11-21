import { getLocalDb } from "../database/LocalDb";
import { IHistory } from "../../../models/IHistory";
import { SQLiteBindValue } from "expo-sqlite";

function buildSqlValues<T>(values: Partial<T>) {
    const Interrogations = Object.keys(values).map(() => `?`).join(', ');
    const sqlValues = Object.values(values) as SQLiteBindValue[];
    if (Object.keys(values).length === 0) {
        return { interrogations: "", values: [] };
    }
    return {
        interrogations: Interrogations
            .split(', ')
            .map((q, index) => `${Object.keys(values)[index]} = ${q}`)
            .join(', '),
        values: sqlValues
    }
}

const normalizeRef = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value.id ?? value._id ?? null;
    }
    return null;
};

const normalizeAccountRef = (value: any): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value;
    return normalizeRef(value) ?? undefined;
};

const normalizeOptionalStringRef = (value: any): string | undefined => {
    if (value === undefined) return undefined;
    return normalizeRef(value) ?? undefined;
};

const normalizeOptionalNullableRef = (value: any): string | null | undefined => {
    if (value === undefined) return undefined;
    return normalizeRef(value);
};

const normalizeHistory = (history: IHistory) => {
    const now = new Date().toISOString();
    return {
        ...history,
        account: normalizeAccountRef((history as any).account) ?? history.account,
        institution: normalizeOptionalStringRef((history as any).institution),
        pet: normalizeOptionalNullableRef((history as any).pet) ?? null,
        amount: history.amount ?? null,
        externalReference: history.externalReference ?? null,
        createdAt: history.createdAt ?? now,
        updatedAt: history.updatedAt ?? now,
        lastSyncedAt: history.lastSyncedAt ?? now,
    };
};

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
        const clean = normalizeHistory(history);
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
                clean.id,
                clean.type,
                clean.status ?? 'pending',
                clean.pet ?? null,
                clean.institution ?? null,
                clean.account,
                clean.amount ?? null,
                clean.externalReference ?? null,
                clean.createdAt,
                clean.updatedAt,
                clean.lastSyncedAt ?? null
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

        const normalized: Partial<IHistory> = {
            ...history,
            account: normalizeAccountRef(history.account),
            institution: normalizeOptionalStringRef(history.institution),
            pet: normalizeOptionalNullableRef(history.pet),
        };

        const { interrogations, values: sqlValues } = buildSqlValues(normalized);
        if (!interrogations || !sqlValues.length) {
            return;
        }

        await db.runAsync(
            `UPDATE history SET ${interrogations} WHERE id = ?`,
            [...sqlValues, id]
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

