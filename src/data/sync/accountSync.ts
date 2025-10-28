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
            console.log("Realizando sincronização...");
            const account = await accountRemoteRepository.getProfile();
            console.log("Perfil recebido:", account);
            
            if (account) {
                await accountLocalRepository.create(account);
            }
        } catch (error) {
            console.error("...Erro ao sincronizar do servidor:", error);
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
            console.error("Erro ao sincronizar para servidor:", error);
        }
    },

    async getProfile() {
        const localAccount = await accountLocalRepository.findLocalAccount();
        const netState = await NetInfo.fetch();
        
        if (!netState.isConnected && !localAccount) {
            return null;
        }

        if(!netState.isConnected) {
            return localAccount;
        }

        try {
            const remoteAccount = await accountRemoteRepository.getProfile();
            if (remoteAccount) {
                console.log("Perfil recebido:", remoteAccount);
                await accountLocalRepository.create(remoteAccount);
            }
            return remoteAccount;
        } catch (error) {
            console.error("Erro ao buscar do servidor:", error);
        }
        return null;
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
