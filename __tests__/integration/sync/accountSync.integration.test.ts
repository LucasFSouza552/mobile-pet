import { accountSync } from '@/data/sync/accountSync';
import { accountLocalRepository } from '@/data/local/repositories/accountLocalRepository';
import { accountRemoteRepository } from '@/data/remote/repositories/accountRemoteRepository';
import NetInfo from '@react-native-community/netinfo';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockAccount } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse, createErrorResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@react-native-community/netinfo');

describe('accountSync - Integração', () => {
  let mockDb: any;
  let mockApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockLocalDb();
    resetMockApiClient();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();

    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('GET', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });

  describe('syncFromServer', () => {
    it('deve sincronizar conta do servidor para local quando há conexão', async () => {
      const mockAccount = createMockAccount();
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createSuccessResponse(mockAccount));

      await accountSync.syncFromServer();

      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(1);
      expect(localAccounts[0].id).toBe(mockAccount.id);
      expect(localAccounts[0].email).toBe(mockAccount.email);
    });

    it('não deve sincronizar quando não há conexão', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await accountSync.syncFromServer();

      expect(apiClient.get).not.toHaveBeenCalled();
      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(0);
    });

    it('não deve sincronizar quando servidor retorna null', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createSuccessResponse(null));

      await accountSync.syncFromServer();

      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(0);
    });

    it('deve fazer logout quando recebe erro 401', async () => {
      const mockAccount = createMockAccount();
      mockDb.setTableData('accounts', [mockAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createErrorResponse(401, 'Unauthorized'));

      await accountSync.syncFromServer();

      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(0);
    });

    it('deve fazer logout quando recebe erro 403', async () => {
      const mockAccount = createMockAccount();
      mockDb.setTableData('accounts', [mockAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createErrorResponse(403, 'Forbidden'));

      await accountSync.syncFromServer();

      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(0);
    });

    it('deve atualizar conta existente quando sincroniza novamente', async () => {
      const existingAccount = createMockAccount({ name: 'Old Name' });
      mockDb.setTableData('accounts', [existingAccount]);
      
      const updatedAccount = createMockAccount({ name: 'New Name' });
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createSuccessResponse(updatedAccount));

      await accountSync.syncFromServer();

      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(1);
      expect(localAccounts[0].name).toBe('New Name');
    });
  });

  describe('getProfile', () => {
    it('deve retornar conta local quando não há conexão', async () => {
      const localAccount = createMockAccount();
      mockDb.setTableData('accounts', [localAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const result = await accountSync.getProfile();

      expect(result).toEqual(localAccount);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve buscar do servidor e salvar localmente quando há conexão', async () => {
      const remoteAccount = createMockAccount();
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createSuccessResponse(remoteAccount));

      const result = await accountSync.getProfile();

      expect(result).toEqual(remoteAccount);
      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(1);
      expect(localAccounts[0].id).toBe(remoteAccount.id);
    });

    it('deve retornar conta local quando servidor retorna null', async () => {
      const localAccount = createMockAccount();
      mockDb.setTableData('accounts', [localAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createSuccessResponse(null));

      const result = await accountSync.getProfile();

      expect(result).toEqual(localAccount);
    });

    it('deve fazer logout e retornar null quando recebe erro 401', async () => {
      const localAccount = createMockAccount();
      mockDb.setTableData('accounts', [localAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createErrorResponse(401, 'Unauthorized'));

      const result = await accountSync.getProfile();

      expect(result).toBeNull();
      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(0);
    });

    it('deve retornar conta local quando há erro de rede', async () => {
      const localAccount = createMockAccount();
      mockDb.setTableData('accounts', [localAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet('/account/profile/me', createErrorResponse(500, 'Server Error'));

      const result = await accountSync.getProfile();

      expect(result).toEqual(localAccount);
    });
  });

  describe('getAccount', () => {
    it('deve retornar conta local quando não há conexão', async () => {
      const localAccount = createMockAccount();
      mockDb.setTableData('accounts', [localAccount]);
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const result = await accountSync.getAccount(localAccount.id);

      expect(result).toEqual(localAccount);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve buscar do servidor e salvar localmente quando há conexão', async () => {
      const accountId = 'account-1';
      const remoteAccount = createMockAccount({ id: accountId });
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      mockApi.mockGet(`/account/${accountId}`, createSuccessResponse(remoteAccount));

      const result = await accountSync.getAccount(accountId);

      expect(result).toEqual(remoteAccount);
      const localAccounts = mockDb.getTableData('accounts');
      expect(localAccounts).toHaveLength(1);
      expect(localAccounts[0].id).toBe(accountId);
    });

    it('deve retornar null quando não há conta local nem conexão', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const result = await accountSync.getAccount('non-existent');

      expect(result).toBeNull();
    });
  });
});

