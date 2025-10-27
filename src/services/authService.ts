import { authRemoteRepository } from "../data/remote/repositories/authRemoteRepository";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountRemoteRepository } from "../data/remote/repositories/accountRemoteRepository";
import { IAccount } from "../models/IAccount";

export const authService = {
    async login(email: string, password: string) {
        const response = await authRemoteRepository.login(email, password);
        
        try {
            const userProfile = await accountRemoteRepository.getProfile();
            console.log("Perfil recebido:", userProfile);
            
            if (userProfile) {
                await accountLocalRepository.create(userProfile);
                console.log("Perfil salvo localmente:", userProfile);
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
};