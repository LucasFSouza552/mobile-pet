import { api } from '../api';
import { IAccount } from '../models/IAccount';

export const accountService = {
    async getAccount(id: string): Promise<IAccount> {
        try {
            const response = await api.get(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async getProfile(): Promise<IAccount> {
        try {
            const response = await api.get('/account/profile/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
