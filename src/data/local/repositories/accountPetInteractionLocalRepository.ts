import { getLocalDb } from "../database/LocalDb";
import { IAccountPetInteraction } from "../../../models/IAccountPetInteraction";

export const accountPetInteractionLocalRepository = {
    getAll: async (): Promise<IAccountPetInteraction[]> => {
        const db = await getLocalDb();
        const rows = await db.getAllAsync("SELECT * FROM account_pet_interactions");
        return rows as IAccountPetInteraction[];
    },

    getById: async (id: string): Promise<IAccountPetInteraction | null> => {
        const db = await getLocalDb();
        const row = await db.getFirstAsync("SELECT * FROM account_pet_interactions WHERE id = ?", [id]);
        return (row as IAccountPetInteraction) ?? null;
    },

    getByAccount: async (accountId: string): Promise<IAccountPetInteraction[]> => {
        const db = await getLocalDb();
        const rows = await db.getAllAsync(
            "SELECT * FROM account_pet_interactions WHERE account = ? ORDER BY createdAt DESC",
            [accountId]
        );
        return rows as IAccountPetInteraction[];
    },

    getByPet: async (petId: string): Promise<IAccountPetInteraction[]> => {
        const db = await getLocalDb();
        const rows = await db.getAllAsync(
            "SELECT * FROM account_pet_interactions WHERE pet = ? ORDER BY createdAt DESC",
            [petId]
        );
        return rows as IAccountPetInteraction[];
    },

    getByAccountAndPet: async (accountId: string, petId: string): Promise<IAccountPetInteraction | null> => {
        const db = await getLocalDb();
        const row = await db.getFirstAsync(
            "SELECT * FROM account_pet_interactions WHERE account = ? AND pet = ?",
            [accountId, petId]
        );
        return (row as IAccountPetInteraction) ?? null;
    },

    create: async (interaction: IAccountPetInteraction): Promise<void> => {
        const db = await getLocalDb();
        const existing = await db.getFirstAsync(
            "SELECT id FROM account_pet_interactions WHERE id = ?",
            [interaction.id]
        );

        if (existing) {
            await db.runAsync(
                `UPDATE account_pet_interactions
                 SET account = ?, pet = ?, status = ?, updatedAt = ?
                 WHERE id = ?`,
                [
                    interaction.account,
                    typeof interaction.pet === 'string' ? interaction.pet : interaction.pet.id,
                    interaction.status,
                    interaction.updatedAt,
                    interaction.id
                ]
            );
        } else {
            await db.runAsync(
                `INSERT INTO account_pet_interactions (
                    id, account, pet, status, createdAt, updatedAt
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    interaction.id,
                    interaction.account,
                    typeof interaction.pet === 'string' ? interaction.pet : interaction.pet.id,
                    interaction.status,
                    interaction.createdAt,
                    interaction.updatedAt
                ]
            );
        }
    },

    update: async (id: string, interaction: Partial<IAccountPetInteraction>): Promise<void> => {
        const db = await getLocalDb();
        const updates: string[] = [];
        const values: any[] = [];

        if (interaction.account !== undefined) {
            updates.push("account = ?");
            values.push(interaction.account);
        }
        if (interaction.pet !== undefined) {
            updates.push("pet = ?");
            values.push(interaction.pet);
        }
        if (interaction.status !== undefined) {
            updates.push("status = ?");
            values.push(interaction.status);
        }
        if (interaction.updatedAt !== undefined) {
            updates.push("updatedAt = ?");
            values.push(interaction.updatedAt);
        }

        if (updates.length === 0) {
            return;
        }

        values.push(id);
        await db.runAsync(
            `UPDATE account_pet_interactions SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    },

    delete: async (id: string): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM account_pet_interactions WHERE id = ?", [id]);
    },

    deleteAll: async (): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM account_pet_interactions");
    }
};


