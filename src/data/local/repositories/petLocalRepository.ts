import { getLocalDb } from "../database/LocalDb";
import { IPet } from "../../../models/IPet";

const toIntBool = (value?: boolean | number): number =>
  Number(Boolean(value));

function normalizePet(pet: IPet) {
  const now = new Date().toISOString();

  return {
    ...pet,
    age: pet.age ?? null,
    description: pet.description ?? null,
    images: JSON.stringify(Array.isArray(pet.images) ? pet.images : []),
    adopted: toIntBool((pet as any).adopted),
    account:
      (pet as any).account?.id ??
      (pet as any).account?._id ??
      (typeof (pet as any).account === "string" ? (pet as any).account : null),
    adoptedAt: (pet as any).adoptedAt ?? null,
    createdAt: (pet as any).createdAt ?? now,
    updatedAt: (pet as any).updatedAt ?? now,
    lastSyncedAt: (pet as any).lastSyncedAt ?? now,
  };
}

export const petLocalRepository = {
  async create(pet: IPet): Promise<void> {
    const db = await getLocalDb();
    const clean = normalizePet(pet);

    const exists = await db.getFirstAsync(
      "SELECT id FROM pets WHERE id = ?",
      [pet.id]
    );

    if (exists) {
      await db.runAsync(
        `
        UPDATE pets
        SET 
          name = ?, type = ?, age = ?, gender = ?, weight = ?, images = ?, description = ?, 
          adopted = ?, account = ?, adoptedAt = ?, updatedAt = ?, lastSyncedAt = ?
        WHERE id = ?
        `,
        [
          clean.name,
          clean.type,
          clean.age,
          clean.gender,
          clean.weight,
          clean.images,
          clean.description,
          clean.adopted,
          clean.account,
          clean.adoptedAt,
          clean.updatedAt,
          clean.lastSyncedAt,
          clean.id,
        ]
      );
      return;
    }

    await db.runAsync(
      `
      INSERT INTO pets (
        id, name, type, age, gender, weight, images, description, adopted,
        account, adoptedAt, createdAt, updatedAt, lastSyncedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clean.id,
        clean.name,
        clean.type,
        clean.age,
        clean.gender,
        clean.weight,
        clean.images,
        clean.description,
        clean.adopted,
        clean.account,
        clean.adoptedAt,
        clean.createdAt,
        clean.updatedAt,
        clean.lastSyncedAt,
      ]
    );
  },
};
