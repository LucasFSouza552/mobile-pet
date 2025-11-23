import { pictureRepository } from "../..";
import { getLocalDb } from "../database/LocalDb";

let FileSystem: any = null;
try {
  FileSystem = require('expo-file-system');
} catch (error) {
  console.warn('expo-file-system não está instalado. Para instalar: npx expo install expo-file-system');
}

function normalizeUrls(urls: string[]): string[] {
  return Array.from(
    new Set(
      (urls || [])
        .map(u => (typeof u === 'string' ? u.trim() : ''))
        .filter(u => u.length > 0)
    )
  );
}

async function downloadImage(url: string, petId: string, index: number): Promise<string | null> {
  try {
    if (!FileSystem || !FileSystem.documentDirectory) {
      return null;
    }

    const imagesDir = `${FileSystem.documentDirectory}pet_images/`;
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    const fileName = `${petId}_${index}_${Date.now()}.jpg`;
    const fileUri = `${imagesDir}${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    
    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao baixar imagem ${url}:`, error);
    return null;
  }
}

async function getLocalPath(url: string, petId: string): Promise<string | null> {
  try {
    if (!FileSystem || !FileSystem.documentDirectory) {
      return null;
    }

    const imagesDir = `${FileSystem.documentDirectory}pet_images/`;
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    
    if (!dirInfo.exists) {
      return null;
    }

    const files = await FileSystem.readDirectoryAsync(imagesDir);
    const matchingFile = files.find((file: string) => file.startsWith(`${petId}_`));
    
    if (matchingFile) {
      const fileUri = `${imagesDir}${matchingFile}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        return fileUri;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export const petImageLocalRepository = {
  async replaceForPet(petId: string, urls: string[]): Promise<void> {
    const db = await getLocalDb();

    const unique = normalizeUrls(urls);

    if (unique.length === 0) {
      await db.runAsync("DELETE FROM pet_images WHERE pet = ?", [petId]);
      await this.deleteLocalImages(petId);
      return;
    }

    const placeholders = unique.map(() => "?").join(",");
    await db.runAsync(
      `DELETE FROM pet_images WHERE pet = ? AND url NOT IN (${placeholders})`,
      [petId, ...unique]
    );

    const now = new Date().toISOString();
    const values = unique.map(() => "(?, ?, ?, ?)").join(", ");
    const params: (string | number)[] = [];

    for (const url of unique) {
      params.push(petId, url, now, now);
    }

    await db.runAsync(
      `INSERT OR IGNORE INTO pet_images (pet, url, createdAt, updatedAt)
       VALUES ${values}`,
      params
    );

    const updatePlaceholders = unique.map(() => "?").join(",");
    await db.runAsync(
      `UPDATE pet_images 
         SET updatedAt = datetime('now')
         WHERE pet = ? AND url IN (${updatePlaceholders})`,
      [petId, ...unique]
    );

    this.downloadImagesForPet(petId, unique).catch(error => {
      console.error(`Erro ao baixar imagens do pet ${petId}:`, error);
    });
  },

  async downloadImagesForPet(petId: string, urls?: string[]): Promise<string[]> {
    const db = await getLocalDb();
    
    if (!urls || urls.length === 0) {
      const rows = await db.getAllAsync(
        "SELECT url FROM pet_images WHERE pet = ? ORDER BY createdAt ASC",
        [petId]
      ) as Array<{ url: string }>;
      urls = rows.map(r => (pictureRepository.getSource(r.url) as { uri: string }).uri);
    }

    const localPaths: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const localPath = await downloadImage(url, petId, i);
      if (localPath) {
        localPaths.push(localPath);
      }
    }

    return localPaths;
  },

  async getLocalPathsByPet(petId: string): Promise<string[]> {
    const db = await getLocalDb();
    const rows = await db.getAllAsync(
      "SELECT url FROM pet_images WHERE pet = ? ORDER BY createdAt ASC",
      [petId]
    ) as Array<{ url: string }>;

    const localPaths: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const url = rows[i].url;
      const localPath = await getLocalPath(url, petId);
      if (localPath) {
        localPaths.push(localPath);
      } else {
        const downloaded = await downloadImage(url, petId, i);
        if (downloaded) {
          localPaths.push(downloaded);
        }
      }
    }

    return localPaths;
  },

  async deleteLocalImages(petId: string): Promise<void> {
    try {
      if (!FileSystem || !FileSystem.documentDirectory) {
        return;
      }

      const imagesDir = `${FileSystem.documentDirectory}pet_images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      
      if (!dirInfo.exists) {
        return;
      }

      const files = await FileSystem.readDirectoryAsync(imagesDir);
      const petFiles = files.filter((file: string) => file.startsWith(`${petId}_`));

      for (const file of petFiles) {
        const fileUri = `${imagesDir}${file}`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    } catch (error) {
      console.error(`Erro ao deletar imagens locais do pet ${petId}:`, error);
    }
  },
  async deleteAllLocalImages(): Promise<void> {
    try {
      if (!FileSystem || !FileSystem.documentDirectory) {
        return;
      }

      const imagesDir = `${FileSystem.documentDirectory}pet_images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      
      if (!dirInfo.exists) {
        return;
      }

      const files = await FileSystem.readDirectoryAsync(imagesDir);

      for (const file of files) {
        const fileUri = `${imagesDir}${file}`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    } catch (error) {
      console.error('Erro ao deletar todas as imagens locais:', error);
    }
  },

  async getByPet(petId: string): Promise<string[]> {
    const db = await getLocalDb();
    const rows = await db.getAllAsync("SELECT url FROM pet_images WHERE pet = ? ORDER BY createdAt ASC", [petId]);
    return (rows as Array<{ url: string }>).map(r => r.url);
  },

  async getByPetWithLocalPaths(petId: string): Promise<string[]> {
    const localPaths = await this.getLocalPathsByPet(petId);
    
    if (localPaths.length > 0) {
      const db = await getLocalDb();
      const rows = await db.getAllAsync(
        "SELECT url FROM pet_images WHERE pet = ? ORDER BY createdAt ASC",
        [petId]
      ) as Array<{ url: string }>;
      
      if (localPaths.length === rows.length) {
        return localPaths;
      }
    }
    
    return this.getByPet(petId);
  },
};


