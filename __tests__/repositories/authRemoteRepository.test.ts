import { authRemoteRepository } from '@/data/remote/repositories/authRemoteRepository';
import { apiClient } from '@/data/remote/api/apiClient';
import { saveStorage, removeStorage } from '@/utils/storange';

jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/storange');

describe('authRemoteRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login e salvar token', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          account: { id: '1', email: 'test@email.com' },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authRemoteRepository.login('test@email.com', 'password');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@email.com',
        password: 'password',
      });
      expect(saveStorage).toHaveBeenCalledWith('@token', 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar erro quando token não é retornado', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {},
      });

      await expect(
        authRemoteRepository.login('test@email.com', 'password')
      ).rejects.toThrow('Falha ao realizar login');
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('API Error');
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        authRemoteRepository.login('test@email.com', 'password')
      ).rejects.toThrow('API Error');
    });
  });

  describe('fetchLogout', () => {
    it('deve remover token do storage', async () => {
      await authRemoteRepository.fetchLogout();

      expect(removeStorage).toHaveBeenCalledWith('@token');
    });
  });

  describe('register', () => {
    it('deve registrar novo usuário', async () => {
      const accountData = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
      };
      const mockResponse = { data: { id: '1', ...accountData } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authRemoteRepository.register(accountData as any);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', accountData);
      expect(result).toEqual(mockResponse.data);
    });
  });
});

