import axios from "axios";
import { getStorage } from "../../../utils/storange";
import { API_URL } from '@env';
console.log("APIURL",API_URL);
export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
    async config => {
        const token = await getStorage("@token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.error || 'Erro desconhecido do servidor';
            return Promise.reject(new Error(`Erro ${status}: ${message}`));
        } else if (error.request) {
            return Promise.reject(new Error('Nenhuma resposta do servidor. Verifique sua conexão.'));
        } else {
            return Promise.reject(new Error(error.response.data?.error || 'Erro desconhecido ao realizar a requisição.'));
        }
    }
);
