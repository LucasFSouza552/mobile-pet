import NetInfo from "@react-native-community/netinfo";
import { accountLocalRepository } from "../local/repositories/accountLocalRepository";
import { accountRemoteRepository } from "../remote/repositories/accountRemoteRepository";
import { IAccount } from "../../models/IAccount";

export const accountSync = {

    // Atualiza o banco local com as alterações vindas do servidor.
    async syncFromServer(): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - pulando sincronização");
            return;
        }

        try {
            console.log("Sincronizando contas...");
            const account = await accountRemoteRepository.getProfile();
            if (!account) {

                return;
            }
            console.log("Conta encontrada:", account);
            await accountLocalRepository.create(account);
        } catch (error: any) {

            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                await accountLocalRepository.logout();
                return;
            }
            console.log("Erro de rede/servidor ao sincronizar. Mantendo sessão.");
        }
    },

    // Envia para o servidor as alterações feitas localmente (WIP)
    async syncToServer(): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - dados salvos apenas localmente");
            return;
        }

        try {
            const localAccount = await accountLocalRepository.findLocalAccount();



        } catch (error) {
            console.log("Erro ao sincronizar:", error);
            accountLocalRepository.logout();
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
                const status = error?.response?.status;
                if (status === 401 || status === 403) {
                    await accountLocalRepository.logout();
                    return null;
                }
                return localAccount ?? null;
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar do servidor:", error);
            return null;
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
        } catch (error) {
            console.error("Erro ao buscar do servidor:", error);
        }
        return null;
    },
};
