import NetInfo from "@react-native-community/netinfo";
import { accountPetInteractionLocalRepository } from "../local/repositories/accountPetInteractionLocalRepository";
import { IAccountPetInteraction } from "../../models/IAccountPetInteraction";
import { petInteractionRemoteRepository } from "../remote/repositories/petInteractionRemoteRepository";
import { petLocalRepository } from "../local/repositories/petLocalRepository";

const allowedStatuses = new Set(["", "liked", "pending", "requested"]);

const filterPendingInteractions = (list: IAccountPetInteraction[]) =>
    list.filter(item => {
        const status = String(item?.status ?? "").toLowerCase();
        if (!allowedStatuses.has(status)) {
            return false;
        }
        const petData = (item as any)?.pet;
        if (petData && typeof petData === "object") {
            return !petData.adopted;
        }
        return true;
    });

export const accountPetInteractionSync = {
    async getByAccount(accountId: string): Promise<IAccountPetInteraction[]> {

        const sortByDateDesc = (list: IAccountPetInteraction[]) =>
            [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const local = await accountPetInteractionLocalRepository.getByAccount(accountId);

        const netState = await NetInfo.fetch();

        if (!netState.isConnected) {
            return sortByDateDesc(local);
        }

        try {
            const remote = await petInteractionRemoteRepository.getInteractionByAccount(accountId);
            const rawList: any[] = Array.isArray(remote) ? remote : [];

            const normalizedList: IAccountPetInteraction[] = rawList.map((it: any) => {
                const p = it?.pet || {};
                const id = String(p?.id ?? p?._id ?? "");
                const genderRaw = String(p?.gender ?? "").toLowerCase();
                const gender = genderRaw === "female" ? "Female" : (genderRaw === "male" ? "Male" : p?.gender);
                const images = Array.isArray(p?.images) ? p.images : [];
                const petNorm = { ...p, id, gender, images };
                return {
                    id: String(it?._id ?? it?.id ?? `${accountId}-${id}`),
                    account: String(it?.account ?? accountId),
                    pet: petNorm as any,
                    status: it?.status ?? "liked",
                    createdAt: it?.createdAt ?? new Date().toISOString(),
                    updatedAt: it?.updatedAt ?? it?.createdAt ?? new Date().toISOString(),
                } as any;
            });

            for (const item of normalizedList) {
                const petId = typeof (item as any).pet === "object" ? (item as any).pet.id : String((item as any).pet);
                await accountPetInteractionLocalRepository.create({
                    id: item.id,
                    account: item.account,
                    pet: petId,
                    status: item.status,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                });
                if ((item as any).pet && typeof (item as any).pet === "object") {
                    try {
                        await petLocalRepository.create((item as any).pet as any);
                    } catch (error) {
                        console.log(error);
                        console.error("Error creating pet:");
                    }
                }
            }

            const pendingList = filterPendingInteractions(normalizedList);

            if (pendingList.length > 0) {
                return sortByDateDesc(pendingList);
            }

            return sortByDateDesc(filterPendingInteractions(local));
        } catch {
            return sortByDateDesc(filterPendingInteractions(local));
        }
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


