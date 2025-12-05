import { achievementsSync } from '@/data/sync/achievementsSync';
import { achievementsLocalRepository } from '@/data/local/repositories/achievementsLocalRepository';
import { achievementsRemoteRepository } from '@/data/remote/repositories/achievementsRemoteRepository';
import { isNetworkConnected } from '@/utils/network';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockAchievement } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/network');

describe('achievementsSync - Integração', () => {
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

    (apiClient.delete as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('DELETE', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });

  describe('syncFromServer', () => {
    it('deve sincronizar achievements do servidor para local quando há conexão', async () => {
      const accountId = 'account-1';
      const mockAchievements = [createMockAchievement()];

      mockApi.mockGet(
        `/account/${accountId}/status`,
        createSuccessResponse({ achievements: mockAchievements })
      );

      await achievementsSync.syncFromServer(accountId);

      await new Promise(resolve => setTimeout(resolve, 100));

      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements.length).toBeGreaterThan(0);
    });

    it('não deve sincronizar quando não há conexão', async () => {
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      await achievementsSync.syncFromServer('account-1');

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve remover achievements locais que não existem no servidor', async () => {
      const localAchievement = createMockAchievement({ id: 'local-1' });
      mockDb.setTableData('achievements', [localAchievement]);

      mockApi.mockGet(
        '/achievements',
        createSuccessResponse([])
      );

      await achievementsSync.syncFromServer();

      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements).toHaveLength(0);
    });
  });

  describe('getByAccount', () => {
    it('deve retornar array vazio quando não há conexão', async () => {
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await achievementsSync.getByAccount('account-1');

      expect(result).toEqual([]);
    });

    it('deve buscar e salvar achievements quando há conexão', async () => {
      const accountId = 'account-1';
      const mockAchievements = [createMockAchievement()];

      mockApi.mockGet(
        `/account/${accountId}/status`,
        createSuccessResponse({ achievements: mockAchievements })
      );

      const result = await achievementsSync.getByAccount(accountId);

      expect(result.length).toBeGreaterThan(0);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements.length).toBeGreaterThan(0);
    });
  });

  describe('upsert', () => {
    it('deve criar achievement localmente e sincronizar quando há conexão', async () => {
      const achievement = createMockAchievement();
      const createdAchievement = { ...achievement, id: 'new-achievement-1' };

      mockApi.mockPost(
        '/achievements',
        createSuccessResponse(createdAchievement)
      );

      const result = await achievementsSync.upsert(achievement);

      expect(result).toBeDefined();
      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements.length).toBeGreaterThan(0);
    });

    it('deve criar apenas localmente quando não há conexão', async () => {
      const achievement = createMockAchievement();

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await achievementsSync.upsert(achievement);

      expect(result).toBeDefined();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover achievement localmente e do servidor quando há conexão', async () => {
      const achievement = createMockAchievement();
      mockDb.setTableData('achievements', [achievement]);

      mockApi.mockDelete(
        `/achievements/${achievement.id}`,
        createSuccessResponse({})
      );

      await achievementsSync.delete(achievement.id);

      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements).toHaveLength(0);
    });

    it('deve remover apenas localmente quando não há conexão', async () => {
      const achievement = createMockAchievement();
      mockDb.setTableData('achievements', [achievement]);

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      await achievementsSync.delete(achievement.id);

      const localAchievements = mockDb.getTableData('achievements');
      expect(localAchievements).toHaveLength(0);
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });
});

