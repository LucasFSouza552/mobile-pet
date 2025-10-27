import { apiClient } from "../api/apiClient";
import { IAccount } from "../../../models/IAccount";
import { saveStorage } from "../../../utils/storange";

export const authRemoteRepository = {
    async login(email: string, password: string) {
        const response = await apiClient.post('/auth/login', { email, password });
        const token = response.data.token;
        if (token) {
            await saveStorage("@token", token);
        }
        return response.data;
    },

    async register(account: IAccount) {
        const response = await apiClient.post('/auth/register', account);
        return response.data;
    },

};
