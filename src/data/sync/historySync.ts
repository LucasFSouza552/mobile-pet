import NetInfo from "@react-native-community/netinfo";
import { historyLocalRepository } from "../local/repositories/historyLocalRepository";
import { historyRemoteRepository } from "../remote/repositories/historyRemoteRepository";
import { IHistory } from "../../models/IHistory";
import { petLocalRepository } from "../local/repositories/petLocalRepository";
import { IPet } from "../../models/IPet";
import { petSync } from "./petSync";

export const historySync = {
    // Atualiza o banco local com as alterações vindas do servidor.
    async syncFromServer(accountId: string): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - pulando sincronização de histórico");
            return;
        }

        try {
            const historyItems = await historyRemoteRepository.getByAccount(accountId);
            if (!historyItems || historyItems.length === 0) {
                return;
            }

            for (const historyItem of historyItems) {
                // Verifica se pet existe localmente antes de salvar
                if (historyItem.pet) {
                    if (typeof historyItem.pet === 'string') {
                        const petExists = await petLocalRepository.exists(historyItem.pet);
                        if (!petExists) {
                            // Busca do servidor e salva
                            try {
                                await petSync.syncFromServer(historyItem.pet);
                                // Pequeno delay após sincronizar pet
                                await new Promise(resolve => setTimeout(resolve, 50));
                            } catch (error) {
                                console.error(`Erro ao sincronizar pet ${historyItem.pet}:`, error);
                            }
                        }
                    } else if (typeof historyItem.pet === 'object' && historyItem.pet.id) {
                        const petExists = await petLocalRepository.exists(historyItem.pet.id);
                        if (!petExists) {
                            // Salva o pet completo
                            try {
                                await petLocalRepository.create(historyItem.pet as IPet);
                                // Pequeno delay após salvar pet
                                await new Promise(resolve => setTimeout(resolve, 50));
                            } catch (error) {
                                console.error(`Erro ao salvar pet ${historyItem.pet.id}:`, error);
                            }
                        }
                    }
                }
                await historyLocalRepository.create(historyItem);
                // Pequeno delay entre itens de histórico
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        } catch (error) {
            console.error("Erro ao sincronizar histórico do servidor:", error);
        } finally {
            console.log("Sincronização de histórico finalizada");
        }
    },
    async syncToServer(accountId: string): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - histórico salvo apenas localmente");
            return;
        }

        try {
            const localHistoryItems = await historyLocalRepository.getByAccount(accountId);
            const unsyncedItems = localHistoryItems.filter(item => !item.lastSyncedAt);

            for (const item of unsyncedItems) {
                try {
                    if (item.externalReference) {
                        await historyRemoteRepository.update(item.id, item);
                    } else {
                        await historyRemoteRepository.create(item);
                    }

                    await historyLocalRepository.update(item.id, {
                        lastSyncedAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.error(`Erro ao sincronizar item ${item.id}:`, error);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar histórico para servidor:", error);
        }
    },

    async getHistory(accountId: string): Promise<IHistory[]> {
        try {
            const localHistory = await historyLocalRepository.getByAccount(accountId);
            const netState = await NetInfo.fetch();

            if (!netState.isConnected) {
                return localHistory;
            }

            try {
                const remoteHistory = await historyRemoteRepository.getByAccount(accountId);

                if (remoteHistory && remoteHistory.length > 0) {
                    for (const item of remoteHistory) {
                        if (item.pet) {
                            if (typeof item.pet === 'string') {
                                // Verifica se pet existe antes de buscar do servidor
                                const petExists = await petLocalRepository.exists(item.pet);
                                if (!petExists) {
                                    try {
                                        await petSync.syncFromServer(item.pet);
                                        // Pequeno delay após sincronizar pet
                                        await new Promise(resolve => setTimeout(resolve, 50));
                                    } catch (error) {
                                        console.error(`Erro ao sincronizar pet ${item.pet}:`, error);
                                    }
                                }
                            } else if (typeof item.pet === 'object' && item.pet.id) {
                                // Verifica se pet existe antes de salvar
                                const petExists = await petLocalRepository.exists(item.pet.id);
                                if (!petExists) {
                                    try {
                                        const pet = item.pet as unknown as IPet;
                                        await petLocalRepository.create(pet);
                                        // Pequeno delay após salvar pet
                                        await new Promise(resolve => setTimeout(resolve, 50));
                                    } catch (error) {
                                        console.error(`Erro ao salvar pet ${item.pet.id}:`, error);
                                    }
                                }
                            }
                        }
                        try {
                            await historyLocalRepository.create(item);
                            // Pequeno delay entre itens
                            await new Promise(resolve => setTimeout(resolve, 30));
                        } catch (error) {
                            console.error("Erro ao criar histórico:", error);
                        }

                    }
                    return remoteHistory;
                }
                return localHistory ?? [];
            } catch (error) {
                return localHistory ?? [];
            }

        } catch (error) {
            return [];
        }
    },

    async getHistoryItemById(id: string): Promise<IHistory | null> {
        const localHistory = await historyLocalRepository.getById(id);
        const netState = await NetInfo.fetch();

        if (!netState.isConnected && !localHistory) {
            return null;
        }

        if (!netState.isConnected) {
            return localHistory;
        }

        try {
            const remoteHistory = await historyRemoteRepository.getById(id);
            if (remoteHistory) {
                // Se pet vier apenas como ID, busca do servidor e salva
                if (remoteHistory.pet) {
                    if (typeof remoteHistory.pet === 'string') {
                        const petExists = await petLocalRepository.exists(remoteHistory.pet);
                        if (!petExists) {
                            try {
                                await petSync.syncFromServer(remoteHistory.pet);
                                // Delay após sincronizar pet
                                await new Promise(resolve => setTimeout(resolve, 50));
                            } catch (error) {
                                console.error(`Erro ao sincronizar pet ${remoteHistory.pet}:`, error);
                            }
                        }
                    } else if (typeof remoteHistory.pet === 'object' && remoteHistory.pet.id) {
                        const petExists = await petLocalRepository.exists(remoteHistory.pet.id);
                        if (!petExists) {
                            try {
                                await petLocalRepository.create(remoteHistory.pet as IPet);
                                // Delay após salvar pet
                                await new Promise(resolve => setTimeout(resolve, 50));
                            } catch (error) {
                                console.error(`Erro ao salvar pet ${remoteHistory.pet.id}:`, error);
                            }
                        }
                    }
                }
                await historyLocalRepository.create(remoteHistory);
            }
            return remoteHistory;
        } catch (error) {
            console.error("Erro ao buscar item do servidor:", error);
        }
        return null;
    },
    async createHistory(history: IHistory, accountId: string): Promise<IHistory | null> {
        try {
            // Salva o pet se vier como objeto completo
            if (history.pet && typeof history.pet === 'object' && history.pet.id) {
                try {
                    await petLocalRepository.create(history.pet as IPet);
                    // Pequeno delay após salvar pet
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (error) {
                    console.error("Erro ao salvar pet ao criar histórico:", error);
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

            const netState = await NetInfo.fetch();

            if (netState.isConnected) {
                try {
                    const createdHistory = await historyRemoteRepository.create(history);
                    await historyLocalRepository.update(newHistory.id, {
                        ...createdHistory,
                        lastSyncedAt: new Date().toISOString()
                    });
                    return createdHistory;
                } catch (error) {
                    console.error("Erro ao criar histórico no servidor:", error);
                }
            }

            return newHistory;
        } catch (error) {
            console.error("Erro ao criar histórico:", error);
            return null;
        }
    }
};

