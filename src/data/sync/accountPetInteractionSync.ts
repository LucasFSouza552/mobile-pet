import NetInfo from "@react-native-community/netinfo";
import { accountPetInteractionLocalRepository } from "../local/repositories/accountPetInteractionLocalRepository";
import { IAccountPetInteraction } from "../../models/IAccountPetInteraction";

export const accountPetInteractionSync = {
    async getByAccount(accountId: string): Promise<IAccountPetInteraction[]> {

        const netState = await NetInfo.fetch();
        const local = await accountPetInteractionLocalRepository.getByAccount(accountId);

        if (!netState.isConnected) {
            return local;
        }

        return local;
    },

    async getByPet(petId: string): Promise<IAccountPetInteraction[]> {

        const netState = await NetInfo.fetch();
        const local = await accountPetInteractionLocalRepository.getByPet(petId);
        if (!netState.isConnected) {
            return local;
        }
        return local;
    },

    async getById(id: string): Promise<IAccountPetInteraction | null> {

        const netState = await NetInfo.fetch();
        const local = await accountPetInteractionLocalRepository.getById(id);
        if (!netState.isConnected) {
            return local;
        }
        return local;
    },

    async getByAccountAndPet(accountId: string, petId: string): Promise<IAccountPetInteraction | null> {

        const netState = await NetInfo.fetch();
        const local = await accountPetInteractionLocalRepository.getByAccountAndPet(accountId, petId);
        if (!netState.isConnected) {
            return local;
        }
        return local;
    },

    async upsert(interaction: IAccountPetInteraction): Promise<IAccountPetInteraction> {

        const complete: IAccountPetInteraction = {
            id: interaction.id,
            account: interaction.account,
            pet: interaction.pet,
            status: interaction.status,
            createdAt: interaction.createdAt,
            updatedAt: interaction.updatedAt,
        };

        await accountPetInteractionLocalRepository.create(complete);
        return complete;
    },

    async delete(id: string): Promise<void> {

        await accountPetInteractionLocalRepository.delete(id);
    }
};


