import { getLocalDb } from "../LocalDb";

export default async function createPetImagesTable() {
    const db = await getLocalDb();
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pet_images (
            pet TEXT NOT NULL,
            url TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (pet, url),
            FOREIGN KEY (pet) REFERENCES pets(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
}


