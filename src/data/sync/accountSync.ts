import NetInfo from "@react-native-community/netinfo";
import { accountLocalRepository } from "../local/repositories/accountLocalRepository";
import { accountRemoteRepository } from "../remote/repositories/accountRemoteRepository";
import { IAccount } from "../../models/IAccount";

export const accountSync = {

    async syncFromServer(): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - pulando sincronização");
            return;
        }

        try {
            const account = await accountRemoteRepository.getProfile();
            if (account) {
                await accountLocalRepository.create(account);
            }
        } catch (error) {
            console.error("Erro ao sincronizar do servidor:", error);
        }
    },

    async syncToServer(): Promise<void> {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log("Sem conexão - dados salvos apenas localmente");
            return;
        }

        try {
            const localAccount = await accountLocalRepository.findLocalAccount();
            
            

        } catch (error) {
            console.error("Erro ao sincronizar para servidor:", error);
        }
    },

    async getAccount(id: string): Promise<IAccount | null> {

        const localAccount = await accountLocalRepository.getById(id);
        const netState = await NetInfo.fetch();
        
        if (!netState.isConnected && !localAccount) {
            return null;
        }

        if(!netState.isConnected) {
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
