import NetInfo from "@react-native-community/netinfo";
import { achievementsLocalRepository } from "../local/repositories/achievementsLocalRepository";
import { IAchievement } from "../../models/IAchievement";

export const achievementsSync = {
    async getAll(): Promise<IAchievement[]> {
        const netState = await NetInfo.fetch();
        const local = await achievementsLocalRepository.getAll();

        if (!netState.isConnected) {
            return local;
        }

        return local;
    },

    async getById(id: string): Promise<IAchievement | null> {
        const netState = await NetInfo.fetch();
        const local = await achievementsLocalRepository.getById(id);

        if (!netState.isConnected) {
            return local;
        }

        return local;
    },

    async upsert(achievement: IAchievement): Promise<IAchievement> {
        const nowIso = new Date().toISOString();

        const complete: IAchievement = {
            id: achievement.id,
            name: achievement.name ?? "",
            description: achievement.description ?? "",
            type: achievement.type ?? "donation",
            unlockedAt: achievement.unlockedAt,
            createdAt: achievement.createdAt ?? nowIso,
            updatedAt: nowIso,
        };

        await achievementsLocalRepository.create(complete);
        return complete;
    },

    async delete(id: string): Promise<void> {
        await achievementsLocalRepository.delete(id);
    }
};


