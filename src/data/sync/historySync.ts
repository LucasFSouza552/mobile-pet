import NetInfo from "@react-native-community/netinfo";
import { historyLocalRepository } from "../local/repositories/historyLocalRepository";
import { historyRemoteRepository } from "../remote/repositories/historyRemoteRepository";
import { IHistory } from "../../models/IHistory";

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
                await historyLocalRepository.create(historyItem);
            }
        } catch (error) {
            console.error("Erro ao sincronizar histórico do servidor:", error);
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
                        await historyLocalRepository.create(item);
                    }
                }
                return remoteHistory;
            } catch (error) {
                console.error("Erro ao buscar histórico do servidor:", error);
            }

            return localHistory;
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
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
                await historyLocalRepository.create(remoteHistory);
            }
            return remoteHistory;
        } catch (error) {
            console.error("Erro ao buscar item do servidor:", error);
        }
        return null;
    },
    async createHistory(history: Partial<IHistory>, accountId: string): Promise<IHistory | null> {
        try {
            const newHistory: IHistory = {
                id: history.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: history.type!,
                status: history.status || 'pending',
                pet: history.pet || null,
                institution: history.institution,
                account: accountId,
                amount: history.amount,
                externalReference: history.externalReference || null,
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

