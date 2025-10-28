import { apiClient } from "../api/apiClient";
import { IHistory } from "../../../models/IHistory";

export const historyRemoteRepository = {
    getAll: async (): Promise<IHistory[]> => {
        const response = await apiClient.get("/history");
        return response.data;
    },

    getById: async (id: string): Promise<IHistory | null> => {
        const response = await apiClient.get(`/history/${id}`);
        return response.data;
    },

    getByAccount: async (accountId: string): Promise<IHistory[]> => {
        const response = await apiClient.get(`/history/account/${accountId}`);
        return response.data;
    },

    create: async (history: Partial<IHistory>): Promise<IHistory> => {
        const response = await apiClient.post("/history", history);
        return response.data;
    },

    update: async (id: string, history: Partial<IHistory>): Promise<IHistory> => {
        const response = await apiClient.put(`/history/${id}`, history);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/history/${id}`);
    }
};

