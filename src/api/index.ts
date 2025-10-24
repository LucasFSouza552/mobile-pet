import axios from "axios";
import { getStorage } from "../utils/storange";

export const api = axios.create({
    baseURL: "http://10.0.2.2:3000/api",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
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