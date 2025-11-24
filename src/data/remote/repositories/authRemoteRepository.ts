import { apiClient } from "../api/apiClient";
import { IAccount } from "../../../models/IAccount";
import { removeStorage, saveStorage } from "../../../utils/storange";

export const authRemoteRepository = {
    async login(email: string, password: string) {
        try {
            const response = await apiClient.post("/auth/login", { email, password });
            const token = response.data?.token;
            if (!token) {
                throw Error("Falha ao realizar login");
            }
            await saveStorage("@token", token);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async register(data: IAccount) {
        try {
            const response = await apiClient.post("/auth/register", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async forgotPassword(email: string) {
        try {
            const response = await apiClient.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async resetPassword(token: string, newPassword: string) {
        try {
            const response = await apiClient.post("/auth/reset-password", { token, newPassword });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async changePassword(currentPassword: string, newPassword: string) {
        try {
            const response = await apiClient.put("/auth/change-password", { currentPassword, newPassword });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async verifyEmail(token: string) {
        try {
            const response = await apiClient.post(`/auth/verify-email?token=${token}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async resendVerification() {
        try {
            const response = await apiClient.post("/auth/resend-verify-email");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async fetchLogout() {
        removeStorage("@token");
    }
}

