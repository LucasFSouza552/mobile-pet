import { apiClient } from "../api/apiClient";
import { IAchievement } from "../../../models/IAchievement";

export const achievementsRemoteRepository = {
    async getAll(): Promise<IAchievement[]> {
        try {
            const response = await apiClient.get(`/achievements`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    async getById(id: string): Promise<IAchievement | null> {
        try {
            const response = await apiClient.get(`/achievements/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async create(achievement: Partial<IAchievement>): Promise<IAchievement> {
        try {
            const response = await apiClient.post("/achievements", achievement);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async update(id: string, achievement: Partial<IAchievement>): Promise<IAchievement> {
        try {
            const response = await apiClient.patch(`/achievements/${id}`, achievement);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/achievements/${id}`);
        } catch (error) {
            throw error;
        }
    },

    async addSponsorshipsAchievement(accountId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/achievements/${accountId}/add/sponsor`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    async addDonationAchievement(accountId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/achievements/${accountId}/add/donation`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    async addAdoptionAchievement(accountId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/achievements/${accountId}/add/adoption`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getByAccount(accountId: string): Promise<IAchievement[]> {
        try {
            const response = await apiClient.get(`/account/${accountId}/status`);
            return response.data?.achievements || [];
        } catch (error) {
            throw error;
        }
    },
};

