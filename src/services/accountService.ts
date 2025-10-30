import { accountLocalRepository } from '../data';
import { accountSync } from '../data/sync/accountSync';
import { IAccount } from '../models/IAccount';
import { getStorage } from '../utils/storange';

/**
 * Service que gerencia accounts
 * Usa a camada de sincronização para decidir entre local e remote
 */
export const accountService = {
  async getAccount(id: string): Promise<IAccount | null> {
    return accountSync.getAccount(id);
  },

  async getLoggedAccount(): Promise<IAccount | null> {
    const token = await getStorage("@token");
    if (!token) {
      await accountLocalRepository.logout();
      return null;
    }

    let account = await accountSync.getProfile();
    
    if (!account) {
      await this.syncFromServer();
      account = await accountLocalRepository.findLocalAccount();
    }
    return account;
  },

  async getLogout() {
    await accountLocalRepository.logout();

  },

  async syncFromServer(): Promise<void> {
    return accountSync.syncFromServer();
  },
  async syncToServer(): Promise<void> {
    return accountSync.syncToServer();
  },

};