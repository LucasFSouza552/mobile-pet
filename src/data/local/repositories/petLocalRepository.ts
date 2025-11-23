import { getLocalDb } from "../database/LocalDb";
import { IPet } from "../../../models/IPet";
import { petImageLocalRepository } from "./petImageLocalRepository";

function normalizePet(raw: any): IPet {
  const now = new Date().toISOString();

  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? undefined,
    age: raw.age ?? undefined,
    gender: raw.gender,
    weight: raw.weight,
    description: raw.description ?? undefined,
    adopted: raw.adopted ?? false,
    account: raw.account,

    adoptedAt: raw.adoptedAt ?? false,

    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    lastSyncedAt: raw.lastSyncedAt ?? undefined,

    images: raw.images
      ? String(raw.images).split(",").filter(i => i.trim().length > 0)
      : [],
  };
}

function extractAccountId(account: unknown): string | null {
  if (!account) return null;
  if (typeof account === 'string') return account;
  if (typeof account === 'object' && account !== null) {
    const acc = account as { id?: string; _id?: string };
    return acc.id ?? acc._id ?? null;
  }
  return null;
}

function toDbParams(pet: IPet) {
  return [
    pet.id,
    pet.name,
    pet.type ?? null,
    pet.age ?? null,
    pet.gender,
    pet.weight,
    pet.description ?? null,
    pet.adopted,
    extractAccountId(pet.account),
    pet.adoptedAt ?? null,
    pet.createdAt,
    pet.updatedAt,
    pet.lastSyncedAt ?? null,
  ];
}

export const petLocalRepository = {
  async create(pet: IPet): Promise<void> {
    const db = await getLocalDb();
    const clean = normalizePet(pet);
    
    let retries = 3;
    while (retries > 0) {
      try {
        await db.runAsync(
          `
          INSERT INTO pets (
            id, name, type, age, gender, weight, description, adopted,
            account, adoptedAt, createdAt, updatedAt, lastSyncedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            type = excluded.type,
            age = excluded.age,
            gender = excluded.gender,
            weight = excluded.weight,
            description = excluded.description,
            adopted = excluded.adopted,
            account = excluded.account,
            adoptedAt = excluded.adoptedAt,
            updatedAt = excluded.updatedAt,
            lastSyncedAt = excluded.lastSyncedAt
          `,
          toDbParams(clean)
        );

        if (clean.images?.length > 0) {
          await petImageLocalRepository.replaceForPet(clean.id, clean.images);
        }
        
        return;
      } catch (error: any) {
        if (error?.message?.includes('database is locked') && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries)));
          continue;
        }
        console.error("Erro ao criar/atualizar pet:", error);
        throw error;
      }
    }
  },

  async getById(id: string): Promise<IPet | null> {
    const db = await getLocalDb();

    const result = await db.getFirstAsync(
      `
      SELECT 
        p.*,
        GROUP_CONCAT(pi.url ORDER BY pi.createdAt ASC) AS images
      FROM pets p
      LEFT JOIN pet_images pi ON pi.pet = p.id
      WHERE p.id = ?
      GROUP BY p.id
      `,
      [id]
    );

    return result ? normalizePet(result) : null;
  },

  async exists(id: string): Promise<boolean> {
    const db = await getLocalDb();
    
    let retries = 3;
    while (retries > 0) {
      try {
        const result = await db.getFirstAsync(
          "SELECT 1 FROM pets WHERE id = ?",
          [id]
        );
        return !!result;
      } catch (error: any) {
        if (error?.message?.includes('database is locked') && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 50 * (4 - retries)));
          continue;
        }
        console.error("Erro ao verificar existência do pet:", error);
        return false;
      }
    }
    return false;
  },
};
