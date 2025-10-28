import { historySync } from "../data/sync/historySync";
import { IHistory } from "../models/IHistory";

/**
 * Service que gerencia histórico
 * Usa a camada de sincronização para decidir entre local e remote
 */
export const historyService = {
    async getHistory(accountId: string): Promise<IHistory[]> {
        return historySync.getHistory(accountId);
    },
    async getHistoryById(id: string): Promise<IHistory | null> {
        return historySync.getHistoryItemById(id);
    },
    async createHistory(history: Partial<IHistory>, accountId: string): Promise<IHistory | null> {
        return historySync.createHistory(history, accountId);
    },
    async updateHistory(id: string, history: Partial<IHistory>): Promise<IHistory | null> {
        const historyItem = await historySync.getHistoryItemById(id);
        if (historyItem) {
            return historySync.createHistory(history, historyItem.account);
        }
        return null;
    },
    async syncFromServer(accountId: string): Promise<void> {
        return historySync.syncFromServer(accountId);
    },
    async syncToServer(accountId: string): Promise<void> {
        return historySync.syncToServer(accountId);
    }
}