import NetInfo from "@react-native-community/netinfo";
import { IAccount } from "../../models/IAccount";
import { accountRemoteRepository } from "../remote/repositories/accountRemoteRepository";
import { accountLocalRepository } from "../local/repositories/accountLocalRepository";

export const accountSync = {
    async syncFromServer(): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            return;
        }

        try {
            const account = await accountRemoteRepository.getProfile();
            if (!account) {

                return;
            }
            await accountLocalRepository.create(account);
        } catch (error: any) {

            const status = error?.status;
            if (status === 401 || status === 403) {
                await accountLocalRepository.logout();
                return;
            }
        }
    },
    async getProfile(): Promise<IAccount | null> {
        try {
            const localAccount = await accountLocalRepository.findLocalAccount();
            const netState = await NetInfo.fetch();

            if (!netState.isConnected) {
                return localAccount;
            }

            try {
                const remoteAccount = await accountRemoteRepository.getProfile();
                if (remoteAccount) {
                    await accountLocalRepository.create(remoteAccount);
                    return remoteAccount;
                }
                return localAccount ?? null;
            } catch (error: any) {
                const status = error?.status;
                if (status === 401 || status === 403) {
                    await accountLocalRepository.logout();
                    return null;
                }
                return localAccount ?? null;
            }
        } catch (error) {
            throw error;
        }
    },

    async getAccount(id: string): Promise<IAccount | null> {

        const localAccount = await accountLocalRepository.getById(id);
        const netState = await NetInfo.fetch();

        if (!netState.isConnected && !localAccount) {
            return null;
        }

        if (!netState.isConnected) {
            return localAccount;
        }

        try {
            const remoteAccount = await accountRemoteRepository.getById(id);
            if (remoteAccount) {
                await accountLocalRepository.create(remoteAccount);
            }
            return remoteAccount;
        } catch (error: any) {
            const status = error?.status;
            if (status === 401 || status === 403) {
                await accountLocalRepository.logout();
                return null;
            }
            throw error;
        }
    },
};
