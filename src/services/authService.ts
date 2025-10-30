import { authRemoteRepository } from "../data/remote/repositories/authRemoteRepository";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountRemoteRepository } from "../data/remote/repositories/accountRemoteRepository";
import { IAccount } from "../models/IAccount";
import { saveStorage } from "../utils/storange";

/**
 * Service que gerencia autenticação
 * Usa a camada de sincronização para decidir entre local e remote
 */
export const authService = {
    async login(email: string, password: string) {

        try {

            const response = await authRemoteRepository.login(email, password);
            const token = response?.token;

            if (!token) {
                throw new Error("Ocorreu um erro ao logar")
            }

            await saveStorage('@token', token);
            const userProfile = await accountRemoteRepository.getProfile();

            if (!userProfile) {
                await accountLocalRepository.logout();
                throw new Error('Erro ao buscar perfil');
            }

            await saveStorage('@email', userProfile.email);
            await accountLocalRepository.create(userProfile);

            return token;
        } catch (error) {
            console.error('Erro ao buscar perfil após login:', error);
        }

    },

    async register(account: IAccount) {
        try {
            await accountLocalRepository.create(account);
        } catch (error: any) {
            throw new Error("Erro ao criar conta localmente");
        }

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
            console.log('Erro ao registrar:', error);
            throw error;
        }
    },

    async logout() {
        await accountLocalRepository.logout();
    },
};