import { apiClient } from "../api/apiClient";
import { IHistory } from "../../../models/IHistory";

export const historyRemoteRepository = {
    async getByAccount(accountId: string): Promise<IHistory[]> {
        try {
            const response = await apiClient.get(`/history/profile/me`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar histórico da conta ${accountId}:`, error);
            throw error;
        }
    },

    async getById(id: string): Promise<IHistory | null> {
        try {
            const response = await apiClient.get(`/history/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar histórico ${id}:`, error);
            throw error;
        }
    },

    async create(history: Partial<IHistory>): Promise<IHistory> {
        try {
            const response = await apiClient.post("/history", history);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar histórico:", error);
            throw error;
        }
    },

    async update(id: string, history: Partial<IHistory>): Promise<IHistory> {
        try {
            const response = await apiClient.patch(`/history/${id}`, history);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar histórico ${id}:`, error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/history/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar histórico ${id}:`, error);
            throw error;
        }
    }
};

