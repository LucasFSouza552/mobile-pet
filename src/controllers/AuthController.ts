import { IAccount } from "../models/IAccount";
import { authService } from "../services/authService";

export const AuthController = {
    async register(account: IAccount): Promise<IAccount> {
        const response = await authService.register(account);
        return response;
    },
    async login(email: string, password: string) {
        const response = await authService.login(email, password);
        return response;
    }
}