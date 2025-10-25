import { api } from '../api';
import { IAccount } from '../models/IAccount';

export const accountService = {
    async getAccount(id: string): Promise<IAccount> {
        try {
            const response = await api.get(`/account/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async getProfile(): Promise<IAccount> {
        return requestSafe(() => api.get('/account/profile/me').then(res => res.data));
    },
};


async function requestSafe<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || 'Erro desconhecido do servidor';
      throw new Error(`Erro ${status}: ${message}`);
    } else if (error.request) {
      throw new Error('Nenhuma resposta do servidor. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro desconhecido ao realizar a requisição.');
    }
  }
}
