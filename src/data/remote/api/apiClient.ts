import axios, { AxiosHeaders } from "axios";
import { getStorage } from "../../../utils/storange";
import { API_URL } from '@env';
import Constants from 'expo-constants';
import { accountLocalRepository } from "../../local/repositories/accountLocalRepository";

const BASE_URL = (API_URL && API_URL.trim().length > 0)
  ? API_URL
  : (Constants.expoConfig?.extra?.API_URL || "http://10.0.2.2:3000/api");


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
    try {
      const method = String(config.method || 'GET').toUpperCase();
      const url = apiClient.getUri(config);
      if (__DEV__)
        console.log(`[API REQUEST] ${method} ${url}`);
    } catch { }
    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response) {
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        try {
          await accountLocalRepository.logout();
          if (__DEV__) {
            console.log("[AUTH ERROR] Usuário inválido ou não autorizado. Logout automático realizado.");
          }
        } catch (logoutError) {
          if (__DEV__) {
            console.log("[LOGOUT ERROR] Erro ao fazer logout automático:", logoutError);
          }
        }
      }
      
      return Promise.reject(error.response);
    } else {
      if (__DEV__)
        console.log("[NETWORK ERROR]", error?.message ?? error);
      return Promise.reject(error);
    }
  }
);


