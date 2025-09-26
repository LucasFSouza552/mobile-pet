// src/controllers/AccountController.ts
import { IAccount } from '../models/Account';
import { accountService } from '../services/accountService';

export const AccountController = {
  async fetchAccount(id: string): Promise<IAccount> {
    const account = await accountService.getAccount(id);
    return account;
  },
};
