import { achievementsLocalRepository } from "../local/repositories/achievementsLocalRepository";
import { achievementsRemoteRepository } from "../remote/repositories/achievementsRemoteRepository";
import { IAchievement } from "../../models/IAchievement";
import { isNetworkConnected } from "../../utils/network";

export const achievementsSync = {
    async syncFromServer(accountId?: string): Promise<void> {
        if (!await isNetworkConnected()) {
            return;
        }

        try {
            let achievements: IAchievement[] = [];
            
            if (accountId) {
                achievements = await achievementsRemoteRepository.getByAccount(accountId);
            } else {
                achievements = await achievementsRemoteRepository.getAll();
            } 

            if (!achievements || achievements.length === 0) {
                await achievementsLocalRepository.deleteAll();
                return;
            }

            const rawList: any[] = Array.isArray(achievements) ? achievements : [];
            const remoteIds = new Set<string>();
            const batchSize = 5;

            for (let i = 0; i < rawList.length; i += batchSize) {
                const batch = rawList.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (achievement: IAchievement) => {
                        try {
                            remoteIds.add(achievement.id);
                            await achievementsLocalRepository.create(achievement);
                        } catch (error) {
                            console.error("Erro ao sincronizar achievement:", error);
                        }
                    })
                );

                if (i + batchSize < rawList.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            if (!accountId) {
                const localAchievements = await achievementsLocalRepository.getAll();
                for (const local of localAchievements) {
                    if (!remoteIds.has(local.id)) {
                        try {
                            await achievementsLocalRepository.delete(local.id);
                        } catch (error) {
                            console.error("Erro ao remover achievement local:", error);
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    },

    async getByAccount(accountId: string, onRemoteLoaded?: () => void): Promise<IAchievement[]> {
        try {
            if (!await isNetworkConnected()) {
                return [];
            }

            try {
                const remoteAchievements = await achievementsRemoteRepository.getByAccount(accountId);
                
                if (remoteAchievements && remoteAchievements.length > 0) {
                    await Promise.all(
                        remoteAchievements.map(async (achievement: IAchievement) => {
                            try {
                                await achievementsLocalRepository.create(achievement);
                                } catch (error) {
                            }
                        })
                    );
                }

                if (onRemoteLoaded) {
                    onRemoteLoaded();
                }

                return remoteAchievements || [];
            } catch (error) {
                console.error(`Erro ao buscar achievements do account ${accountId}:`, error);
                return [];
            }
        } catch (error) {
            throw error;
        }
    },

    async getById(id: string): Promise<IAchievement | null> {
        const localAchievement = await achievementsLocalRepository.getById(id);
        if (!await isNetworkConnected() && !localAchievement) {
            return null;
        }

        if (!await isNetworkConnected()) {
            return localAchievement;
        }

        try {
            const remoteAchievement = await achievementsRemoteRepository.getById(id);
            if (remoteAchievement) {
                await achievementsLocalRepository.create(remoteAchievement);
            }
            return remoteAchievement;
        } catch (error) {
            throw error;
        }
    },

    async upsert(achievement: IAchievement): Promise<IAchievement> {
        const now = new Date().toISOString();

        const complete: IAchievement = {
            id: achievement.id,
            name: achievement.name ?? "",
            description: achievement.description ?? "",
            type: achievement.type ?? "donation",
            lastSyncedAt: achievement.lastSyncedAt ?? now,
            createdAt: achievement.createdAt ?? now,
            updatedAt: now,
        };

        await achievementsLocalRepository.create(complete);

        if (await isNetworkConnected()) {
            try {
                const createdAchievement = await achievementsRemoteRepository.create(complete);
                await achievementsLocalRepository.update(complete.id, {
                    ...createdAchievement,
                    lastSyncedAt: new Date().toISOString()
                });
                return createdAchievement;
            } catch (error) {
                throw error;
            }
        }

        return complete;
    },

    async delete(id: string): Promise<void> {
        await achievementsLocalRepository.delete(id);

        if (await isNetworkConnected()) {
            try {
                await achievementsRemoteRepository.delete(id);
            } catch (error) {
                throw error;
            }
        }
    }
};
