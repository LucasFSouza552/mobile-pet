import { apiClient } from "../api/apiClient";
import { IAccount } from "../../../models/IAccount";

export const accountRemoteRepository = {
    async getProfile(): Promise<IAccount | null> {
        try {
            const response = await apiClient.get("/account/profile/me");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async getById(id: string): Promise<IAccount | null> {
        try {
            const response = await apiClient.get(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchFeed() {
        try {
            const response = await apiClient.get(`/account/feed`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async searchAccount() {
        try {
            const response = await apiClient.get(`/account/search`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async updateAccount(account: IAccount) {
        try {
            const response = await apiClient.patch("/account", account);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchAccountById(id: string) {
        try {
            const response = await apiClient.get(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchMyProfile(): Promise<IAccount> {
        try {
            const response = await apiClient.get("/account/profile/me");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async uploadAvatar(formData: FormData) {
        try {
            const response = await apiClient.post("/account/avatar", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error
        }
    },
    async adminFetchAllAccounts() {
        try {
            const response = await apiClient.get("/account");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async adminCreateAccount(data: IAccount) {
        try {
            const response = await apiClient.post("/account", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async adminUpdateAccount(id: string, data: IAccount) {
        try {
            const response = await apiClient.patch(`/account/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async adminRemoveAccount(id: string) {
        try {
            const response = await apiClient.delete(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchAccountStatusById(id: string) {
        try {
            const response = await apiClient.get(`/account/${id}/status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchMyPosts() {
        try {
            const response = await apiClient.get("/post/my-posts");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchAccountByName(name: string) {
        try {
            const response = await apiClient.get(`/account/search?name=${name}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async donate(amount: string): Promise<{ id: string; url: string }> {
        try {
            console.log('[ACCOUNT REPO] Enviando doação com valor:', amount);
            const response = await apiClient.post("/account/donate", { amount });
            console.log('[ACCOUNT REPO] Resposta da API:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('[ACCOUNT REPO] Erro na requisição:', error);
            console.error('[ACCOUNT REPO] Status:', error?.response?.status);
            console.error('[ACCOUNT REPO] Data:', error?.response?.data);
            throw error;
        }
    }
}

