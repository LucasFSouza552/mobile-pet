import NetInfo from "@react-native-community/netinfo";
import { accountPetInteractionLocalRepository } from "../local/repositories/accountPetInteractionLocalRepository";
import { IAccountPetInteraction } from "../../models/IAccountPetInteraction";
import { petInteractionRemoteRepository } from "../remote/repositories/petInteractionRemoteRepository";
import { petSync } from "./petSync";
import { petImageLocalRepository } from "../local/repositories/petImageLocalRepository";
import { petLocalRepository } from "../local/repositories/petLocalRepository";

const allowedStatuses = new Set(["", "liked", "pending", "requested"]);

const petCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

// Controle de buscas em andamento para evitar duplicatas
const fetchingPets = new Map<string, Promise<any>>();

async function enrichPetWithLocalImages(pet: string | any): Promise<any> {
    if (typeof pet === 'string') {
        const cached = petCache.get(pet);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            pet = cached.data;
        } else {
            // Evita múltiplas buscas do mesmo pet
            let fetchPromise = fetchingPets.get(pet);
            if (!fetchPromise) {
                fetchPromise = petSync.getById(pet).then(fullPet => {
                    fetchingPets.delete(pet);
                    if (fullPet) {
                        petCache.set(pet, { data: fullPet, timestamp: Date.now() });
                    }
                    return fullPet;
                }).catch(error => {
                    fetchingPets.delete(pet);
                    throw error;
                });
                fetchingPets.set(pet, fetchPromise);
            }
            
            const fullPet = await fetchPromise;
            if (!fullPet) {
                return pet;
            }
            pet = fullPet;
        }
    }

    if (!pet || typeof pet !== 'object' || !pet.id) {
        return pet;
    }

    try {
        const images = await petImageLocalRepository.getByPetWithLocalPaths(pet.id);
        if (images.length > 0) {
            return {
                ...pet,
                images: images,
            };
        }
    } catch (error) {
        console.error(`Erro ao buscar imagens locais do pet ${pet.id}:`, error);
    }

    return pet;
}

async function enrichInteractionsWithLocalImages(
    interactions: IAccountPetInteraction[]
): Promise<IAccountPetInteraction[]> {
    if (interactions.length === 0) {
        return [];
    }

    // Coleta IDs únicos de pets
    const petIds = new Set<string>();
    interactions.forEach(item => {
        if (typeof item.pet === 'string') {
            petIds.add(item.pet);
        } else if (item.pet && typeof item.pet === 'object' && item.pet.id) {
            petIds.add(item.pet.id);
        }
    });

    // Busca todos os pets únicos em paralelo (com cache e controle de duplicatas)
    const petsMap = new Map<string, any>();
    const uniquePetIds = Array.from(petIds);
    
    if (uniquePetIds.length > 0) {
        await Promise.all(
            uniquePetIds.map(async (petId) => {
                try {
                    // Verifica cache primeiro
                    const cached = petCache.get(petId);
                    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
                        petsMap.set(petId, cached.data);
                        return;
                    }

                    // Evita múltiplas buscas do mesmo pet
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
                            console.error(`Erro ao buscar pet ${petId}:`, error);
                            return null;
                        });
                        fetchingPets.set(petId, fetchPromise);
                    }
                    
                    const pet = await fetchPromise;
                    if (pet) {
                        petsMap.set(petId, pet);
                    }
                } catch (error) {
                    console.error(`Erro ao buscar pet ${petId}:`, error);
                }
            })
        );
    }

    // Busca imagens locais para todos os pets de uma vez
    const imagesMap = new Map<string, string[]>();
    await Promise.all(
        Array.from(petsMap.keys()).map(async (petId) => {
            try {
                const images = await petImageLocalRepository.getByPetWithLocalPaths(petId);
                if (images.length > 0) {
                    imagesMap.set(petId, images);
                }
            } catch (error) {
                console.error(`Erro ao buscar imagens locais do pet ${petId}:`, error);
            }
        })
    );

    // Enriquece as interações
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
}

export const accountPetInteractionSync = {
    async getByAccount(accountId: string): Promise<IAccountPetInteraction[]> {
        const sortByDateDesc = (list: IAccountPetInteraction[]) =>
            [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const local = await accountPetInteractionLocalRepository.getByAccount(accountId);
        const enrichedLocal = await enrichInteractionsWithLocalImages(local);
        const localSorted = sortByDateDesc(enrichedLocal);

        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            return localSorted;
        }

        this.syncFromServer(accountId).catch(error => {
            console.error("Erro ao sincronizar interações:", error);
        });

        return localSorted;
    },

    async syncFromServer(accountId: string): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            return;
        }

        try {
            const remote = await petInteractionRemoteRepository.getInteractionByAccount(accountId);
            if (!remote || remote.length === 0) {
                return;
            }

            const rawList: any[] = Array.isArray(remote) ? remote : [];
            
            // Processa interações em lotes para evitar database locked
            const batchSize = 5;
            for (let i = 0; i < rawList.length; i += batchSize) {
                const batch = rawList.slice(i, i + batchSize);
                
                await Promise.all(
                    batch.map(async (it) => {
                        try {
                            const p = it?.pet || {};
                            const petId = String(p?.id ?? p?._id ?? "");
                            
                            const interaction: IAccountPetInteraction = {
                                id: String(it?._id ?? it?.id ?? `${accountId}-${petId}`),
                                account: String(it?.account ?? accountId),
                                pet: petId,
                                status: it?.status ?? "liked",
                                createdAt: it?.createdAt ?? new Date().toISOString(),
                                updatedAt: it?.updatedAt ?? it?.createdAt ?? new Date().toISOString(),
                            };

                            await accountPetInteractionLocalRepository.create(interaction);
                        } catch (error) {
                            console.error("Erro ao criar interação:", error);
                        }
                    })
                );

                // Pequeno delay entre lotes para evitar database locked
                if (i + batchSize < rawList.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Sincroniza pets em background, mas limitado
            const petIds = new Set<string>();
            rawList.forEach((it: any) => {
                const p = it?.pet || {};
                const petId = String(p?.id ?? p?._id ?? "");
                if (petId) {
                    petIds.add(petId);
                }
            });

            // Sincroniza pets sequencialmente, verificando existência antes
            const petIdsArray = Array.from(petIds);
            for (const petId of petIdsArray) {
                try {
                    // Verifica se pet existe antes de buscar do servidor
                    const petExists = await petLocalRepository.exists(petId);
                    if (!petExists) {
                        await petSync.syncFromServer(petId);
                        // Delay após sincronizar cada pet
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.error(`Erro ao sincronizar pet ${petId}:`, error);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar interações do servidor:", error);
        }
    },

    async getByPet(petId: string): Promise<IAccountPetInteraction[]> {
        const local = await accountPetInteractionLocalRepository.getByPet(petId);
        const enriched = await enrichInteractionsWithLocalImages(local);
        
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
            petSync.syncFromServer(petId).catch(error => {
                console.error(`Erro ao sincronizar pet ${petId}:`, error);
            });
        }
        
        return enriched;
    },

    async getById(id: string): Promise<IAccountPetInteraction | null> {
        const local = await accountPetInteractionLocalRepository.getById(id);
        if (!local) {
            return null;
        }
        
        const enriched = await enrichInteractionsWithLocalImages([local]);
        const result = enriched[0] || null;
        
        if (result && typeof result.pet === 'string') {
            const netState = await NetInfo.fetch();
            if (netState.isConnected) {
                petSync.syncFromServer(result.pet).catch(error => {
                    console.error(`Erro ao sincronizar pet ${result.pet}:`, error);
                });
            }
        }
        
        return result;
    },

    async getByAccountAndPet(accountId: string, petId: string): Promise<IAccountPetInteraction | null> {
        const local = await accountPetInteractionLocalRepository.getByAccountAndPet(accountId, petId);
        if (!local) {
            return null;
        }
        
        const enriched = await enrichInteractionsWithLocalImages([local]);
        const result = enriched[0] || null;
            
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
            petSync.syncFromServer(petId).catch(error => {
                console.error(`Erro ao sincronizar pet ${petId}:`, error);
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


