import { historySync } from '@/data/sync/historySync';
import { historyLocalRepository } from '@/data/local/repositories/historyLocalRepository';
import { historyRemoteRepository } from '@/data/remote/repositories/historyRemoteRepository';
import { isNetworkConnected } from '@/utils/network';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockHistory } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/network');
jest.mock('@/data/sync/petSync');
jest.mock('@/data/local/repositories/petLocalRepository');

describe('historySync - Integração', () => {
  let mockDb: any;
  let mockApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockLocalDb();
    resetMockApiClient();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();

    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('GET', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });

    (apiClient.post as jest.Mock).mockImplementation((url: string, data?: any) => {
      const response = mockApi.getResponse('POST', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });

  describe('syncFromServer', () => {
    it('deve sincronizar histórico do servidor para local quando há conexão', async () => {
      const accountId = 'account-1';
      const mockHistory = [createMockHistory({ account: accountId })];

      // A rota real é /history/profile/me (não usa accountId na URL)
      mockApi.mockGet(
        `/history/profile/me`,
        createSuccessResponse(mockHistory)
      );

      await historySync.syncFromServer(accountId);

      const localHistory = mockDb.getTableData('history');
      expect(localHistory.length).toBeGreaterThan(0);
    });

    it('não deve sincronizar quando não há conexão', async () => {
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      await historySync.syncFromServer('account-1');

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve remover histórico local que não existe no servidor', async () => {
      const accountId = 'account-1';
      const localHistory = createMockHistory({ id: 'local-1', account: accountId });
      mockDb.setTableData('history', [localHistory]);

      mockApi.mockGet(
        `/history/profile/me`,
        createSuccessResponse([])
      );

      await historySync.syncFromServer(accountId);

      const localHistories = mockDb.getTableData('history');
      expect(localHistories).toHaveLength(0);
    });
  });

  describe('getHistory', () => {
    it('deve retornar histórico local quando não há conexão', async () => {
      const accountId = 'account-1';
      const localHistory = createMockHistory({ account: accountId });
      mockDb.setTableData('history', [localHistory]);

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await historySync.getHistory(accountId);

      expect(result.length).toBeGreaterThan(0);
    });

    it('deve sincronizar e retornar histórico quando há conexão', async () => {
      const accountId = 'account-1';
      const mockHistory = [createMockHistory({ account: accountId })];

      // A rota real é /history/profile/me (não usa accountId na URL)
      mockApi.mockGet(
        `/history/profile/me`,
        createSuccessResponse(mockHistory)
      );

      const result = await historySync.getHistory(accountId);

      expect(result).toBeDefined();
      
      // Aguarda sincronização completar
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const localHistory = mockDb.getTableData('history');
      expect(localHistory.length).toBeGreaterThan(0);
    });
  });

  describe('createHistory', () => {
    it('deve criar histórico localmente e sincronizar quando há conexão', async () => {
      const accountId = 'account-1';
      const history = createMockHistory({ account: accountId });
      const createdHistory = { ...history, id: 'new-history-1' };

      mockApi.mockPost(
        '/history',
        createSuccessResponse(createdHistory)
      );

      const result = await historySync.createHistory(history, accountId);

      expect(result).toBeDefined();
      const localHistories = mockDb.getTableData('history');
      expect(localHistories.length).toBeGreaterThan(0);
    });

    it('deve criar apenas localmente quando não há conexão', async () => {
      const accountId = 'account-1';
      const history = createMockHistory({ account: accountId });

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await historySync.createHistory(history, accountId);

      expect(result).toBeDefined();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
});

