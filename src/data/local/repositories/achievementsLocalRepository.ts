import { getLocalDb } from "../database/LocalDb";
import { IAchievement } from "../../../models/IAchievement";

export const achievementsLocalRepository = {
    getAll: async (): Promise<IAchievement[]> => {
        const db = await getLocalDb();
        const rows = await db.getAllAsync("SELECT * FROM achievements");
        return rows as IAchievement[];
    },

    getById: async (id: string): Promise<IAchievement | null> => {
        const db = await getLocalDb();
        const row = await db.getFirstAsync("SELECT * FROM achievements WHERE id = ?", [id]);
        return (row as IAchievement) ?? null;
    },

    create: async (achievement: IAchievement): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync(
            `
            INSERT INTO achievements (
                id, name, description, type, unlockedAt, createdAt, updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                type = excluded.type,
                unlockedAt = excluded.unlockedAt,
                updatedAt = excluded.updatedAt
            `,
            [
                achievement.id,
                achievement.name,
                achievement.description ?? null,
                achievement.type,
                achievement.unlockedAt ?? null,
                achievement.createdAt,
                achievement.updatedAt
            ]
        );
    },

    update: async (id: string, achievement: Partial<IAchievement>): Promise<void> => {
        const db = await getLocalDb();
        const updates: string[] = [];
        const values: any[] = [];

        if (achievement.name !== undefined) {
            updates.push("name = ?");
            values.push(achievement.name);
        }
        if (achievement.description !== undefined) {
            updates.push("description = ?");
            values.push(achievement.description);
        }
        if (achievement.type !== undefined) {
            updates.push("type = ?");
            values.push(achievement.type);
        }
        if (achievement.unlockedAt !== undefined) {
            updates.push("unlockedAt = ?");
            values.push(achievement.unlockedAt);
        }
        if (achievement.updatedAt !== undefined) {
            updates.push("updatedAt = ?");
            values.push(achievement.updatedAt);
        }

        if (updates.length === 0) {
            return;
        }

        values.push(id);
        await db.runAsync(
            `UPDATE achievements SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    delete: async (id: string): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM achievements WHERE id = ?", [id]);
    },

    deleteAll: async (): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM achievements");
    }
};


