
import { historyLocalRepository } from "../local/repositories/historyLocalRepository";
import { historyRemoteRepository } from "../remote/repositories/historyRemoteRepository";
import { IHistory } from "../../models/IHistory";
import { petLocalRepository } from "../local/repositories/petLocalRepository";
import { IPet } from "../../models/IPet";
import { petSync } from "./petSync";
import { isNetworkConnected } from "../../utils/network";

export const historySync = {
    // Atualiza o banco local com as alterações vindas do servidor.
    async syncFromServer(accountId: string): Promise<void> {
        if (!await isNetworkConnected()) {
            return;
        }

        try {
            const historyItems = await historyRemoteRepository.getByAccount(accountId);
            if (!historyItems || historyItems.length === 0) {
                await historyLocalRepository.deleteAll();
                return;
            }

            const rawList: any[] = Array.isArray(historyItems) ? historyItems : [];
            const remoteIds = new Set<string>();
            const batchSize = 5;

            for (let i = 0; i < rawList.length; i += batchSize) {
                const batch = rawList.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (history: IHistory) => {
                        try {
                            remoteIds.add(history.id);
                            await historyLocalRepository.create(history);
                        } catch (error) {
                            console.error("Erro ao sincronizar histórico:", error);
                        }
                    })
                );

                if (i + batchSize < rawList.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            const localHistory = await historyLocalRepository.getByAccount(accountId);
            for (const local of localHistory) {
                if (!remoteIds.has(local.id)) {
                    try {
                        await historyLocalRepository.delete(local.id);
                    } catch (error) {
                        console.error("Erro ao remover histórico local:", error);
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
            throw error;
        }
    },

    async getHistory(accountId: string, onRemoteLoaded?: () => void): Promise<IHistory[]> {
        try {
            const localHistory = await historyLocalRepository.getByAccount(accountId);
            if (!await isNetworkConnected()) {
                return localHistory;
            }

            // ✅ Só chama callback se fornecido
            this.syncFromServer(accountId).then(async () => {
                if (onRemoteLoaded) {
                    onRemoteLoaded();
                }
            }).catch(error => {
                console.error(`Erro ao sincronizar histórico do account ${accountId}:`, error);
            });

            return localHistory ?? [];

        } catch (error) {
            throw error;
        }
    },

    async getHistoryItemById(id: string): Promise<IHistory | null> {
        const localHistory = await historyLocalRepository.getById(id);
        if (!await isNetworkConnected() && !localHistory) {
            return null;
        }

        if (!await isNetworkConnected()) {
            return localHistory;
        }

        try {
            const remoteHistory = await historyRemoteRepository.getById(id);
            if (remoteHistory) {
                if (remoteHistory.pet) {
                    if (typeof remoteHistory.pet === 'string') {
                        const petExists = await petLocalRepository.exists(remoteHistory.pet);
                        if (!petExists) {
                            try {
                                await petSync.syncFromServer(remoteHistory.pet);
                            } catch (error) {
                                throw error;
                            }
                        }
                    } else if (typeof remoteHistory.pet === 'object' && remoteHistory.pet.id) {
                        const petExists = await petLocalRepository.exists(remoteHistory.pet.id);
                        if (!petExists) {
                            try {
                                await petLocalRepository.create(remoteHistory.pet as IPet);
                            } catch (error) {
                                throw error;
                            }
                        }
                    }
                }
                await historyLocalRepository.create(remoteHistory);
            }
            return remoteHistory;
        } catch (error) {
            throw error;
        }
    },
    async createHistory(history: IHistory, accountId: string): Promise<IHistory | null> {
        try {
            if (history.pet && typeof history.pet === 'object' && history.pet.id) {
                try {
                    await petLocalRepository.create(history.pet as IPet);
                } catch (error) {
                    throw error;
                }
            }

            const newHistory: IHistory = {
                id: history.id,
                type: history.type,
                status: history.status || 'pending',
                pet: history.pet,
                institution: history.institution,
                account: accountId,
                amount: history.amount,
                externalReference: history.externalReference,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastSyncedAt: undefined
            };

            await historyLocalRepository.create(newHistory);

            if (await isNetworkConnected()) {
                try {
                    const createdHistory = await historyRemoteRepository.create(history);
                    await historyLocalRepository.update(newHistory.id, {
                        ...createdHistory,
                        lastSyncedAt: new Date().toISOString()
                    });
                    return createdHistory;
                } catch (error) {
                    throw error;
                }
            }

            return newHistory;
        } catch (error) {
            throw error;
        }
    }
};

