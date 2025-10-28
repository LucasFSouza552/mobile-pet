import { authRemoteRepository } from "../data/remote/repositories/authRemoteRepository";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountRemoteRepository } from "../data/remote/repositories/accountRemoteRepository";
import { IAccount } from "../models/IAccount";
import { getStorage, saveStorage } from "../utils/storange";

/**
 * Service que gerencia autenticação
 * Usa a camada de sincronização para decidir entre local e remote
 */
export const authService = {
    async login(email: string, password: string) {
        const response = await authRemoteRepository.login(email, password);

        try {
            const userProfile = await accountRemoteRepository.getProfile();
            console.log("Perfil recebido:", userProfile);

            if (userProfile) {
                const email = await getStorage('@email');
                if (email !== userProfile.email) {
                    await accountLocalRepository.deleteAll();
                }
                await saveStorage('@email', userProfile.email);
                console.log("Perfil salvo localmente:", userProfile);

                await accountLocalRepository.create(userProfile);
            }
        } catch (error) {
            console.error('Erro ao buscar perfil após login:', error);
        }

        return response;
    },

    async register(account: IAccount) {
        await accountLocalRepository.create(account);

        try {
            const response = await authRemoteRepository.register(account);

            try {
                const userProfile = await accountRemoteRepository.getProfile();
                if (userProfile) {
                    await accountLocalRepository.create(userProfile);
                }
            } catch (error) {
                console.error('Erro ao buscar perfil após registro:', error);
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    async logout () {
        await accountLocalRepository.deleteAll();
        await saveStorage('@token', '');
        await saveStorage('@email', '');
    },
};