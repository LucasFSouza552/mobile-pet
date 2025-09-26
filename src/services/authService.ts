import { storeToken } from "../utils/storange";
import { api } from "./api";


export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.token;
    await storeToken(token);
    return response.data.user;
};