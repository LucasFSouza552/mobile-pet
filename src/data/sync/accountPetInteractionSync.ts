
import { accountPetInteractionLocalRepository } from "../local/repositories/accountPetInteractionLocalRepository";
import { IAccountPetInteraction } from "../../models/IAccountPetInteraction";
import { petInteractionRemoteRepository } from "../remote/repositories/petInteractionRemoteRepository";
import { petSync } from "./petSync";
import { petImageLocalRepository } from "../local/repositories/petImageLocalRepository";
import { petLocalRepository } from "../local/repositories/petLocalRepository";
import sortDateDesc from "../../utils/SortDate";
import { isNetworkConnected } from "../../utils/network";

const petCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

const fetchingPets = new Map<string, Promise<any>>();

async function enrichInteractionsWithLocalImages(
    interactions: IAccountPetInteraction[]
): Promise<IAccountPetInteraction[]> {
    if (interactions.length === 0) {
        return [];
    }

    try {
        const petIds = new Set<string>();
        interactions.forEach(item => {
            if (typeof item.pet === 'string') {
                petIds.add(item.pet);
            } else if (item.pet && typeof item.pet === 'object' && item.pet.id) {
                petIds.add(item.pet.id);
            }
        });

        const petsMap = new Map<string, any>();
        const uniquePetIds = Array.from(petIds);

        if (uniquePetIds.length > 0) {
            await Promise.all(
                uniquePetIds.map(async (petId) => {
                    try {
                        const cached = petCache.get(petId);
                        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
                            petsMap.set(petId, cached.data);
                            return;
                        }

                        let fetchPromise = fetchingPets.get(petId);
                        if (!fetchPromise) {
                            fetchPromise = petSync.getById(petId).then(pet => {
                                fetchingPets.delete(petId);
                                if (pet) {
                                    petCache.set(petId, { data: pet, timestamp: Date.now() });
                                    petsMap.set(petId, pet);
                                }
                                return pet;
                            }).catch(error => {
                                fetchingPets.delete(petId);
                                console.warn(`Erro ao buscar pet ${petId}:`, error);
                                return null;
                            });
                            fetchingPets.set(petId, fetchPromise);
                        }

                        const pet = await fetchPromise;
                        if (pet) {
                            petsMap.set(petId, pet);
                        }
                    } catch (error) {
                        console.warn(`Erro ao buscar pet ${petId}:`, error);
                    }
                })
            );
        }

        const imagesMap = new Map<string, string[]>();
        await Promise.all(
            Array.from(petsMap.keys()).map(async (petId) => {
                try {
                    const images = await petImageLocalRepository.getByPetWithLocalPaths(petId);
                    if (images.length > 0) {
                        imagesMap.set(petId, images);
                    }
                } catch (error) {
                    console.warn(`Erro ao buscar imagens do pet ${petId}:`, error);
                }
            })
        );

        return interactions.map((item) => {
            let pet = item.pet;

            if (typeof pet === 'string') {
                pet = petsMap.get(pet) || pet;
            }

            if (pet && typeof pet === 'object' && pet.id) {
                const images = imagesMap.get(pet.id);
                if (images && images.length > 0) {
                    pet = {
                        ...pet,
                        images: images,
                    };
                }
            }

            return {
                ...item,
                pet: pet,
            } as IAccountPetInteraction;
        });
    } catch (error) {
        console.warn('Erro ao enriquecer interações com imagens locais:', error);
        return interactions;
    }
}

export const accountPetInteractionSync = {
    async syncFromServer(accountId: string): Promise<void> {
        if (!await isNetworkConnected()) return;

        try {
            const remote = await petInteractionRemoteRepository.getInteractionByAccount(accountId);
            const rawList: any[] = Array.isArray(remote) ? remote : [];
            const remoteIds = new Set<string>();

            if (rawList.length === 0) {
                const localInteractions = await accountPetInteractionLocalRepository.getByAccount(accountId);
                for (const local of localInteractions) {
                    try {
                        await accountPetInteractionLocalRepository.delete(local.id);
                    } catch (error) {
                        console.error(`Erro ao remover interação local ${local.id}:`, error);
                    }
                }
                return;
            }

            await Promise.all(
                rawList.map(async (it) => {
                    try {
                        const p = it?.pet || {};
                        const petId = p?.id;
                        if (!petId) return;

                        const interaction: IAccountPetInteraction = {
                            id: it?.id,
                            account: String(it?.account ?? accountId),
                            pet: petId,
                            status: it?.status as "liked" | "disliked" | "viewed",
                            createdAt: it?.createdAt ?? new Date().toISOString(),
                            updatedAt: it?.updatedAt ?? it?.createdAt ?? new Date().toISOString(),
                        };
                        remoteIds.add(interaction.id);
                        await accountPetInteractionLocalRepository.create(interaction);

                    } catch (error) {
                        console.error("Erro ao sincronizar interação:", error);
                    }
                })
            );

            const localInteractions = await accountPetInteractionLocalRepository.getByAccount(accountId);
            for (const local of localInteractions) {
                if (!remoteIds.has(local.id)) {
                    try {
                        await accountPetInteractionLocalRepository.delete(local.id);
                    } catch (error) {
                        console.error(`Erro ao remover interação local ${local.id}:`, error);
                    }
                }
            }

            const petIds = new Set<string>();
            for (const it of rawList) {
                const p = it?.pet || {};
                const petId = p?.id;
                if (petId) petIds.add(petId);
            }

            for (const petId of petIds) {
                try {
                    const exists = await petLocalRepository.exists(petId);
                    if (!exists) {
                        await petSync.syncFromServer(petId);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.error(`Erro ao sincronizar pet (${petId}):`, error);
                }
            }


        } catch (error) {
            console.error("Erro geral na sincronização:", error);
        }
    },
    async getByAccount(accountId: string, onRemoteLoaded?: () => void): Promise<IAccountPetInteraction[]> {
        try {
            const local = await accountPetInteractionLocalRepository.getByAccount(accountId);
            const enrichedLocal = await enrichInteractionsWithLocalImages(local);
            const localSorted = sortDateDesc<IAccountPetInteraction>(enrichedLocal);

            if (!await isNetworkConnected()) {
                return localSorted;
            }

            this.syncFromServer(accountId).then(async () => {
                if (onRemoteLoaded) {
                    onRemoteLoaded();
                }
            }).catch(error => {
                console.error(`Erro ao sincronizar interações do account ${accountId}:`, error);
            });

            return localSorted;
        } catch (error) {
            console.error(`Erro ao sincronizar interações do account ${accountId}:`, error);
            return [];
        }
    },

    async getByPet(petId: string): Promise<IAccountPetInteraction[]> {
        const local = await accountPetInteractionLocalRepository.getByPet(petId);
        const enriched = await enrichInteractionsWithLocalImages(local);
        return enriched;
    },

    async getById(id: string): Promise<IAccountPetInteraction | null> {
        const local = await accountPetInteractionLocalRepository.getById(id);
        if (!local) {
            return null;
        }

        const enriched = await enrichInteractionsWithLocalImages([local]);
        const result = enriched[0] || null;


        return result;
    },

    async getByAccountAndPet(accountId: string, petId: string): Promise<IAccountPetInteraction | null> {
        const local = await accountPetInteractionLocalRepository.getByAccountAndPet(accountId, petId);
        if (!local) {
            return null;
        }

        const enriched = await enrichInteractionsWithLocalImages([local]);
        const result = enriched[0] || null;

        if (await isNetworkConnected()) {
            petSync.syncFromServer(petId).catch(error => {
                throw error;
            });
        }

        return result;
    },

    async upsert(interaction: IAccountPetInteraction): Promise<IAccountPetInteraction> {

        const complete: IAccountPetInteraction = {
            id: interaction.id,
            account: interaction.account,
            pet: interaction.pet,
            status: interaction.status,
            createdAt: interaction.createdAt,
            updatedAt: interaction.updatedAt,
        };

        await accountPetInteractionLocalRepository.create(complete);
        return complete;
    },

    async delete(id: string): Promise<void> {
        await accountPetInteractionLocalRepository.delete(id);
    }
};


