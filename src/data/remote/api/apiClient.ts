import axios, { AxiosHeaders } from "axios";
import { getStorage } from "../../../utils/storange";
import { API_URL } from '@env';

const BASE_URL = (API_URL && API_URL.trim().length > 0)
  ? API_URL
  : "http://10.0.2.2:3000/api";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 8000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

apiClient.interceptors.request.use(
    async config => {
        const token = await getStorage("@token");
        const headers = new AxiosHeaders(config.headers as any);
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
        }
        config.headers = headers;
        return config;
    },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response) {
      return Promise.reject(error.response?.data);
    } else {
      console.error("[NETWORK ERROR]", error?.message ?? error, BASE_URL);
      return Promise.reject(error);
    }
  }
);
