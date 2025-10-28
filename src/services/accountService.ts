import { accountSync } from '../data/sync/accountSync';
import { IAccount } from '../models/IAccount';

/**
 * Service que gerencia accounts
 * Usa a camada de sincronização para decidir entre local e remote
 */
export const accountService = {
  async getAccount(id: string): Promise<IAccount | null> {
    return accountSync.getAccount(id);
  },

  async getProfile(): Promise<IAccount | null> {
    return accountSync.getProfile();
  },

  async syncFromServer(): Promise<void> {
    return accountSync.syncFromServer();
  },
  async syncToServer(): Promise<void> {
    return accountSync.syncToServer();
  },

};