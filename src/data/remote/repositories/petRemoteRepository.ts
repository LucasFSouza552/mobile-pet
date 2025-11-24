import { IPet } from "../../../models/IPet";
import { apiClient } from "../api/apiClient";


export const petRemoteRepository = {
    async adminFetchAllPets() {
        const response = await apiClient.get("/pet");
        return response.data;
    },
    async institutionCreatePet(data: IPet) {
        const response = await apiClient.post("/pet", data);
        return response.data;
    },
    async fetchPetById(petId: string) {
        const response = await apiClient.get(`/pet/${petId}`);
        return response.data;
    },
    async updatePet(petId: string, data: Partial<IPet>) {
        const response = await apiClient.patch(`/pet/${petId}`, data);
        return response.data;
    },
    async updatePetDetails(petId: string, data: Record<string, any>) {
        const response = await apiClient.patch(`/pet/${petId}/update`, data);
        return response.data;
    },
    async deletePet(petId: string) {
        const response = await apiClient.delete(`/pet/${petId}`);
        return response.data;
    },
    async availablePets() {
        const response = await apiClient.get("/pet/avaliable");
        return response.data;
    },
    async likePet(petId: string) {
        const response = await apiClient.post(`/pet/${petId}/like`);
        return response.data;
    },
    async dislikePet(petId: string) {
        const response = await apiClient.post(`/pet/${petId}/dislike`);
        return response.data;
    },
    async acceptPetAdoption(petId: string, accountId: string) {
        const response = await apiClient.post(`/pet/${petId}/accept`, {
            account: accountId
        });
        return response.data;
    },
    async rejectPetAdoption(petId: string, accountId?: string) {
        const response = await apiClient.post(`/pet/${petId}/reject`, accountId ? { account: accountId } : {});
        return response.data;
    },
    
    async updateImages(petId: string, formData: FormData) {
        const response = await apiClient.post(`/pet/${petId}/avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },
    async deleteImage(petId: string, imageId: string) {
        const response = await apiClient.post(`/pet/${petId}/image`, { imageId });
        return response.data;
    },
    async softDelete(petId: string) {
        const response = await apiClient.post(`/pet/${petId}/delete`);
        return response.data;
    },
    async paymentReturn(paymentId: string, status: "completed" | "cancelled" | "refunded", externalReference: string) {
        const response = await apiClient.post(`/pet/payment-return`, {
            id: paymentId,
            status,
            externalReference
        });
        return response.data;
    },
    async getAdoptedPetsByAccount(accountId: string) {
        const response = await apiClient.get(`/pet/adopted/${accountId}`);
        return response.data;
    },
    async getAllByInstitution(institutionId: string) {
        const response = await apiClient.get(`/pet/institutions/${institutionId}/pets`);
        return response.data;
    },
    async getRequestedAdoptions(institutionId: string) {
        const response = await apiClient.get(`/pet/institutions/${institutionId}/pets/requested`);
        return response.data;
    }
};