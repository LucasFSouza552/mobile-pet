import { getLocalDb } from "../database/LocalDb";
import { IHistory } from "../../../models/IHistory";
import { SQLiteBindValue } from "expo-sqlite";
import { IPet } from "../../../models/IPet";
import { IAccount } from "../../../models/IAccount";
import { petLocalRepository } from "./petLocalRepository";

function normalizeHistoryForDb(history: IHistory) {
    const now = new Date().toISOString();

    const accountId =
        typeof history.account === 'string'
            ? history.account
            : (history.account as IAccount)?.id ?? null;

    const institutionPayload =
        typeof history.institution === 'object' && history.institution !== null
            ? JSON.stringify(history.institution)
            : typeof history.institution === 'string'
                ? history.institution
                : null;

    const petId =
        typeof history.pet === 'string'
            ? history.pet
            : (history.pet as IPet)?.id ?? null;

    return {
        id: history.id,
        type: history.type,
        status: history.status ?? 'pending',
        account: accountId,
        institution: institutionPayload,
        pet: petId,
        amount: history.amount ?? null,
        externalReference: history.externalReference ?? null,
        createdAt: history.createdAt ?? now,
        updatedAt: history.updatedAt ?? now,
        lastSyncedAt: history.lastSyncedAt ?? null,
    };
}

function parseInstitution(value: unknown): IAccount | string | undefined {
    if (!value) return undefined;
    if (typeof value === 'object') {
        return value as IAccount;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                return JSON.parse(trimmed) as IAccount;
            } catch {
                return undefined;
            }
        }
        return value;
    }
    return undefined;
}


const normalizePetFromDb = (row: any): IPet | null => {
    if (!row.pet_id) return null;

    return {
        id: row.pet_id,
        name: row.pet_name,
        type: row.pet_type,
        age: row.pet_age ?? undefined,
        gender: row.pet_gender,
        weight: row.pet_weight,
        images: row.pet_images 
            ? (row.pet_images as string).split(',').filter((url: string) => url.length > 0)
            : [],
        description: row.pet_description ?? undefined,
        adopted: Boolean(row.pet_adopted),
        account: row.pet_account as any,
        adoptedAt: row.pet_adoptedAt ?? undefined,
        createdAt: row.pet_createdAt,
        updatedAt: row.pet_updatedAt,
        lastSyncedAt: row.pet_lastSyncedAt ?? undefined,
    };
};


const normalizeHistory = (row: any): IHistory => {
    return {
        id: row.id,
        type: row.type,
        status: row.status ?? undefined,
        pet: row.pet_id ? normalizePetFromDb(row) : (row.pet ?? null),
        institution: parseInstitution(row.institution),
        account: row.account,
        amount: row.amount ?? undefined,
        externalReference: row.externalReference ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        lastSyncedAt: row.lastSyncedAt ?? undefined,
    };
};

export const historyLocalRepository = {
    getAll: async (): Promise<IHistory[]> => {
        const db = await getLocalDb();
        const results = await db.getAllAsync("SELECT * FROM history") as any[];
        return results.map(normalizeHistory);
    },

    getById: async (id: string): Promise<IHistory | null> => {
        const db = await getLocalDb();
        const result = await db.getFirstAsync(
            `
            SELECT 
                h.*,
                p.id as pet_id,
                p.name as pet_name,
                p.type as pet_type,
                p.age as pet_age,
                p.gender as pet_gender,
                p.weight as pet_weight,
                p.description as pet_description,
                p.adopted as pet_adopted,
                p.account as pet_account,
                p.adoptedAt as pet_adoptedAt,
                p.createdAt as pet_createdAt,
                p.updatedAt as pet_updatedAt,
                p.lastSyncedAt as pet_lastSyncedAt,
                GROUP_CONCAT(pi.url ORDER BY pi.createdAt ASC) as pet_images
            FROM history h
            LEFT JOIN pets p ON h.pet = p.id
            LEFT JOIN pet_images pi ON pi.pet = p.id
            WHERE h.id = ?
            GROUP BY h.id
            `,
            [id]
        ) as any;

        return result ? normalizeHistory(result) : null;
    },

    getByAccount: async (accountId: string): Promise<IHistory[]> => {
        const db = await getLocalDb();
        const results = await db.getAllAsync(
            `
            SELECT 
                h.*,
                p.id as pet_id,
                p.name as pet_name,
                p.type as pet_type,
                p.age as pet_age,
                p.gender as pet_gender,
                p.weight as pet_weight,
                p.description as pet_description,
                p.adopted as pet_adopted,
                p.account as pet_account,
                p.adoptedAt as pet_adoptedAt,
                p.createdAt as pet_createdAt,
                p.updatedAt as pet_updatedAt,
                p.lastSyncedAt as pet_lastSyncedAt,
                GROUP_CONCAT(pi.url ORDER BY pi.createdAt ASC) as pet_images
            FROM history h
            LEFT JOIN pets p ON h.pet = p.id
            LEFT JOIN pet_images pi ON pi.pet = p.id
            WHERE h.account = ?
            GROUP BY h.id
            ORDER BY h.createdAt DESC
            `,
            [accountId]
        ) as any[];

        return results.map(normalizeHistory);
    },

    create: async (history: IHistory): Promise<void> => {
        const db = await getLocalDb();
        const clean = normalizeHistoryForDb(history);
        
        if (history.pet && typeof history.pet === 'object' && history.pet.id) {
            try {
                await petLocalRepository.create(history.pet as IPet);
            } catch (error) {
                throw error;
            }
        }
        
        try {
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
                    clean.pet,
                    clean.institution,
                    clean.account,
                    clean.amount,
                    clean.externalReference,
                    clean.createdAt,
                    clean.updatedAt,
                    clean.lastSyncedAt
                ]
            );

        } catch (error) {
            throw error;
        }
    },

    update: async (id: string, history: Partial<IHistory>): Promise<void> => {
        const db = await getLocalDb();

        const updates: Record<string, SQLiteBindValue> = {};

        if (history.type !== undefined) updates.type = history.type;
        if (history.status !== undefined) updates.status = history.status;
        if (history.account !== undefined) {
            updates.account =
                typeof history.account === 'string'
                    ? history.account
                    : (history.account as IAccount)?.id ?? null;
        }
        if (history.institution !== undefined) {
            updates.institution =
                typeof history.institution === 'object' && history.institution !== null
                    ? JSON.stringify(history.institution)
                    : typeof history.institution === 'string'
                        ? history.institution
                        : null;
        }
        if (history.pet !== undefined) {
            updates.pet =
                typeof history.pet === 'string'
                    ? history.pet
                    : (history.pet as unknown as IPet)?.id ?? null;
        }
        if (history.amount !== undefined) updates.amount = history.amount ?? null;
        if (history.externalReference !== undefined) {
            updates.externalReference = history.externalReference ?? null;
        }
        if (history.createdAt !== undefined) updates.createdAt = history.createdAt;
        if (history.updatedAt !== undefined) updates.updatedAt = history.updatedAt;
        if (history.lastSyncedAt !== undefined) {
            updates.lastSyncedAt = history.lastSyncedAt ?? null;
        }

        const entries = Object.entries(updates);
        if (entries.length === 0) return;

        const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
        const values = entries.map(([, value]) => value);

        await db.runAsync(
            `UPDATE history SET ${setClause} WHERE id = ?`,
            [...values, id]
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

