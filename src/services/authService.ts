import { api } from "../api";
import { IAccount } from "../models/IAccount";
import { saveStorage } from "../utils/storange";

export const authService = {
    async login(email: string, password: string) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const token = response.data.token;
            await saveStorage("@token", token);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    async register(account: IAccount) {

    }
}