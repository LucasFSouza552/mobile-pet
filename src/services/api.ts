import axios from 'axios';
import { getStorage } from '../utils/storange';

export const api = axios.create({
    baseURL: 'http://10.0.0.29:3000/api',
    timeout: 5000,
});

api.interceptors.request.use(
    async config => {
        const token = await getStorage("@token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);