import { apiClient } from "../api/apiClient";
import { IAccount } from "../../../models/IAccount";

export const authRemoteRepository = {
    async login(email: string, password: string) {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    async register(account: IAccount) {
        const response = await apiClient.post('/auth/register', account);
        return response.data;
    },

};
