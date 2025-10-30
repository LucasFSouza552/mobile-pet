import axios from "axios";
import { getStorage } from "../../../utils/storange";
import { API_URL } from '@env';

export const apiClient = axios.create({
    baseURL: "http://10.0.2.2:3000/api",
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
);

apiClient.interceptors.response.use(
  (response) => {
    // console.log("✅ [RESPONSE]", {
    //   url: response.config.url,
    //   status: response.status,
    //   data: response.data,
    // });
    return response;
  },
  (error) => {
    if (error.response) {
      // console.log("❌ [RESPONSE ERROR]", {
      //   url: error.response.config?.url,
      //   status: error.response.status,
      //   data: error.response.data.message,
      // });

      return Promise.reject(error.response?.data?.message);

    } else { 
      console.error("💥 [NETWORK ERROR]", error.message, API_URL);
    }
    console.log(error)
    return Promise.reject(error.response?.data?.message || error);
  }
);
