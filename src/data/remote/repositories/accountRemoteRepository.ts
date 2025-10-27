import { apiClient } from "../api/apiClient";
import { IAccount } from "../../../models/IAccount";

export const accountRemoteRepository = {
    async getById(id: string): Promise<IAccount> {
        const response = await apiClient.get(`/account/${id}`);
        return response.data;
    },

    async getProfile(): Promise<IAccount> {
        const response = await apiClient.get('/account/profile/me');
        return response.data;
    },

    async create(account: IAccount): Promise<IAccount> {
        const response = await apiClient.post('/auth/register', account);
        return response.data;
    },

    async update(id: string, account: Partial<IAccount>): Promise<IAccount> {
        const response = await apiClient.put(`/account/${id}`, account);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/account/${id}`);
    },
};
