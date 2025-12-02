import { accountPetInteractionSync } from "./../../sync/accountPetInteractionSync";
import { getLocalDb } from "../database/LocalDb";
import { IAccountPetInteraction } from "../../../models/IAccountPetInteraction";
import { petLocalRepository } from "./petLocalRepository";
import { IPet } from "../../../models/IPet";

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

        try {
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

            if (interaction.pet && typeof interaction.pet === 'object' && interaction.pet.id) {
                try {
                    await petLocalRepository.create(interaction.pet as IPet);
                } catch (error) {
                    throw error;
                }
            }

            return;
        } catch (error: any) {
            throw error;
        }

    },
    update: async (id: string, interaction: Partial<IAccountPetInteraction>): Promise<void> => {
        const db = await getLocalDb();

        const columnsMap: Record<string, any> = {
            account: interaction.account,
            pet: interaction.pet,
            status: interaction.status,
            updatedAt: interaction.updatedAt,
        };

        const updates: string[] = [];
        const values: any[] = [];

        for (const [key, value] of Object.entries(columnsMap)) {
            if (value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return;

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

    bulkInsert: async (interactions: IAccountPetInteraction[]): Promise<void> => {
        const db = await getLocalDb();
        for (const interaction of interactions) {
            try {
                await accountPetInteractionLocalRepository.create(interaction);
            } catch (error) {
                // Se já existe, atualiza
                try {
                    await accountPetInteractionLocalRepository.update(interaction);
                } catch (updateError) {
                    console.error(`Erro ao inserir/atualizar interação ${interaction.id}:`, updateError);
                }
            }
        }
    },

    deleteAll: async (): Promise<void> => {
        const db = await getLocalDb();
        await db.runAsync("DELETE FROM account_pet_interactions");
    }
};


