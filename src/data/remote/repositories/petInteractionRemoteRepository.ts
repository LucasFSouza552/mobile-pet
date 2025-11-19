import { apiClient } from "../api/apiClient";

export const petInteractionRemoteRepository = {
  async adminFetchPetInteraction(petId: string) {
    const response = await apiClient.get(`/interaction/${petId}`);
    return response.data;
  },

  async fetchAccountPetsInteractions() {
    const response = await apiClient.get(`/interaction`);
    return response.data;
  },

  async createInteraction(petId: string, status: "liked" | "disliked" | "viewed") {
    const response = await apiClient.post(`/interaction/${petId}`, { status });
    return response.data;
  },

  async updateInteraction(status: "liked" | "disliked" | "viewed") {
    const response = await apiClient.patch(`/interaction`, { status });
    return response.data;
  },

  async undoInteraction(petId: string) {
    const response = await apiClient.patch(`/interaction/${petId}`);
    return response.data;
  },

  async getInteractionByAccount(accountId: string) {
    const response = await apiClient.get(`/interaction/profile/${accountId}`);
    return response.data;
  },
};


