
import { petLocalRepository } from "../local/repositories/petLocalRepository";
import { petRemoteRepository } from "../remote/repositories/petRemoteRepository";
import { IPet } from "../../models/IPet";
import { pictureRepository } from "../remote/repositories/pictureRemoteRepository";
import { isNetworkConnected } from "../../utils/network";

const syncingPets = new Set<string>();
const syncingPromises = new Map<string, Promise<void>>();

export const petSync = {
    async getById(petId: string): Promise<IPet | null> {
        const localPet = await petLocalRepository.getById(petId);
        
        if (!await isNetworkConnected()) {
            return localPet;
        }

        if (!syncingPromises.has(petId) && !syncingPets.has(petId)) {
            this.syncFromServer(petId).catch(error => {
                throw error;
            });
        }

        return localPet;
    },

    async syncFromServer(petId: string): Promise<void> {
        if (syncingPromises.has(petId)) {
            return syncingPromises.get(petId)!;
        }

        let resolvePromise: () => void;
        let rejectPromise: (error: any) => void;
        const syncPromise = new Promise<void>((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });

        syncingPromises.set(petId, syncPromise);

        (async () => {
            try {
                if (!await isNetworkConnected()) {
                    syncingPromises.delete(petId);
                    resolvePromise!();
                    return;
                }

                syncingPets.add(petId);
                
                const remotePet = await petRemoteRepository.fetchPetById(petId);
                if (!remotePet) {
                    syncingPromises.delete(petId);
                    syncingPets.delete(petId);
                    resolvePromise!();
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
                
                resolvePromise!();
            } catch (error) {
                rejectPromise!(error);
            } finally {
                syncingPets.delete(petId);
                syncingPromises.delete(petId);
            }
        })();

        return syncPromise;
    },

    normalizePet(raw: any): IPet {
        const id = String(raw?.id ?? raw?._id ?? "");
        const genderRaw = String(raw?.gender ?? "").toLowerCase();
        const gender = genderRaw === "female" ? "Female" : (genderRaw === "male" ? "Male" : raw?.gender);
        
        const rawImages = Array.isArray(raw?.images) ? raw.images : [];
        const images = rawImages.map((img: string) => {
            if (!img) return '';
            if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('file://'))) {
                return img;
            }
            try {
                const source = pictureRepository.getSource(img);
                if (source && typeof source === 'object' && source !== null && 'uri' in source) {
                    return (source as { uri: string }).uri;
                }
                return img;
            } catch (error) {
                return img;
            }
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

