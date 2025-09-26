import { api } from './api';
import { IAccount } from '../models/Account';

export const accountService = {
    async getAccount(id: string): Promise<IAccount> {
        try {
            const response = await api.get(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
