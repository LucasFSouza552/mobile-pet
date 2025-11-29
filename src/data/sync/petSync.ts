
import { petLocalRepository } from "../local/repositories/petLocalRepository";
import { petRemoteRepository } from "../remote/repositories/petRemoteRepository";
import { IPet } from "../../models/IPet";
import { pictureRepository } from "../remote/repositories/pictureRemoteRepository";
import { isNetworkConnected } from "../../utils/network";

const syncingPets = new Set<string>();

export const petSync = {
    async getById(petId: string): Promise<IPet | null> {
        const localPet = await petLocalRepository.getById(petId);
        
        if (!await isNetworkConnected()) {
            return localPet;
        }

        if (!syncingPets.has(petId)) {
            this.syncFromServer(petId).catch(error => {
                throw error;
            });
        }

        return localPet;
    },

    async syncFromServer(petId: string): Promise<void> {
        if (syncingPets.has(petId)) {
            return;
        }

        if (!await isNetworkConnected()) {
            return;
        }

        syncingPets.add(petId);

        try {
            const remotePet = await petRemoteRepository.fetchPetById(petId);
            if (!remotePet) {
                return;
            }

            const normalizedPet = this.normalizePet(remotePet);
            
            let retries = 3;
            while (retries > 0) {
                try {
                    await petLocalRepository.create(normalizedPet);
                    break;
                } catch (error: any) {
                    if (error?.message?.includes('database is locked') && retries > 1) {
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 200 * (4 - retries)));
                        continue;
                    }
                    throw error;
                }
            }
        } catch (error) {
            throw error;
        } finally {
            syncingPets.delete(petId);
        }
    },

    normalizePet(raw: any): IPet {
        const id = String(raw?.id ?? raw?._id ?? "");
        const genderRaw = String(raw?.gender ?? "").toLowerCase();
        const gender = genderRaw === "female" ? "Female" : (genderRaw === "male" ? "Male" : raw?.gender);
        
        const rawImages = Array.isArray(raw?.images) ? raw.images : [];
        const images = rawImages.map((img: string) => {
            const source = pictureRepository.getSource(img);
            return (source as { uri: string }).uri;
        });

        return {
            id,
            name: raw?.name ?? "",
            type: raw?.type,
            age: raw?.age,
            gender: gender,
            weight: raw?.weight ?? 0,
            description: raw?.description,
            adopted: raw?.adopted ?? false,
            account: raw?.account ?? raw?.institution ?? null,
            adoptedAt: raw?.adoptedAt ?? false,
            createdAt: raw?.createdAt ?? new Date().toISOString(),
            updatedAt: raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            images: images,
        } as IPet;
    },
};

