import { accountPetInteractionSync } from '@/data/sync/accountPetInteractionSync';
import { isNetworkConnected } from '@/utils/network';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockInteraction,  seedMockData, getMockData, resetMockData } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/network');
const mockPetSync = {
  getById: jest.fn(async (id: string) => {
    return { id, name: 'Mock Pet' };
  }),
  syncFromServer: jest.fn(async () => {}),
};

jest.mock('@/data/sync/petSync', () => ({
  petSync: mockPetSync
}));
jest.mock('@/data/local/repositories/petImageLocalRepository', () => ({
  petImageLocalRepository: {
    getByPetWithLocalPaths: jest.fn(async () => []),
  }
}));
jest.mock('@/data/local/repositories/petLocalRepository', () => ({
  petLocalRepository: {
    exists: jest.fn(async () => true),
    create: jest.fn(async () => {}),
  }
}));
jest.mock('@/data/remote/repositories/petInteractionRemoteRepository');

describe('accountPetInteractionSync - Integração', () => {
  let mockDb: any;
  let mockApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    resetMockLocalDb();
    resetMockApiClient();
    resetMockData();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();

    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);

    seedMockData(mockDb);
    const mockData = getMockData();
    
    const seededInteractions = mockDb.getTableData('account_pet_interactions');
    if (seededInteractions.length === 0) {
      console.warn('seedMockData não populou interactions no mockDb');
    }

    const mockInteractionsForApi = mockData.interactions.map(i => {
      const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
      return {
        id: i.id,
        account: i.account,
        pet: { id: petId },
        status: i.status || 'liked',
        createdAt: i.createdAt,
      };
    });

    mockApi.mockGet('/interaction/profile/account-1', createSuccessResponse(mockInteractionsForApi));

    const { petInteractionRemoteRepository } = require('@/data/remote/repositories/petInteractionRemoteRepository');
    (petInteractionRemoteRepository.getInteractionByAccount as jest.Mock) = jest.fn(async (accountId: string) => {
      const response = mockApi.getResponse('GET', `/interaction/profile/${accountId}`);
      if (response instanceof Error) {
        return [];
      }
      if (!response || !response.data) {
        const mockData = getMockData();
        const mockInteractionsForApi = mockData.interactions
          .filter((i: any) => i.account === accountId)
          .map((i: any) => {
            const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
            return {
              id: i.id,
              account: i.account,
              pet: { id: petId },
              status: i.status || 'liked',
              createdAt: i.createdAt,
            };
          });
        return mockInteractionsForApi;
      }
      return Array.isArray(response.data) ? response.data : [];
    });

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('GET', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      if (url.includes('/interaction/profile/') && (!response || !response.data)) {
        return Promise.resolve(createSuccessResponse(mockInteractionsForApi));
      }
      return Promise.resolve(response);
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe('syncFromServer', () => {
    it('deve sincronizar interações do servidor para local quando há conexão', async () => {
      const accountId = 'account-1';
      const mockData = getMockData();
      const mockInteractions = mockData.interactions.length > 0 
        ? mockData.interactions.map(i => {
            const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
            return {
              id: i.id,
              account: i.account,
              pet: { id: petId },
              status: i.status || 'liked',
              createdAt: i.createdAt,
            };
          })
        : [{
            id: 'interaction-1',
            account: accountId,
            pet: { id: 'pet-1' },
            status: 'liked',
            createdAt: new Date().toISOString(),
          }];

      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse(mockInteractions)
      );

      mockDb.setTableData('account_pet_interactions', []);

      await accountPetInteractionSync.syncFromServer(accountId);

      await new Promise(resolve => setTimeout(resolve, 800));

      const localInteractions = mockDb.getTableData('account_pet_interactions');
      
      if (localInteractions.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const finalInteractions = mockDb.getTableData('account_pet_interactions');
      expect(finalInteractions.length).toBeGreaterThan(0);
      expect(finalInteractions[0].account).toBe(accountId);
    });

    it('não deve sincronizar quando não há conexão', async () => {
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      await accountPetInteractionSync.syncFromServer('account-1');

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve remover interações locais que não existem no servidor', async () => {
      const accountId = 'account-1';
      const localInteraction = {
        id: 'local-1',
        account: accountId,
        pet: 'pet-1',
        status: 'liked' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDb.setTableData('account_pet_interactions', [localInteraction]);

      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse([])
      );

      await accountPetInteractionSync.syncFromServer(accountId);

      await new Promise(resolve => setTimeout(resolve, 200));

      const localInteractions = mockDb.getTableData('account_pet_interactions');
      expect(localInteractions.filter((i: any) => i.account === accountId)).toHaveLength(0);
    });
  });

  describe('getByAccount', () => {
    it('deve retornar interações locais quando não há conexão', async () => {
      const accountId = 'account-1';

      seedMockData(mockDb);
      
      const localInteraction = {
        id: 'local-interaction-1',
        account: accountId,
        pet: 'pet-1',
        status: 'liked' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const existingInteractions = mockDb.getTableData('account_pet_interactions');
      mockDb.setTableData('account_pet_interactions', [...existingInteractions, localInteraction]);
      
      const beforeCall = mockDb.getTableData('account_pet_interactions');
      expect(beforeCall.length).toBeGreaterThan(0);
      expect(beforeCall.some((i: any) => i.account === accountId)).toBe(true);

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await accountPetInteractionSync.getByAccount(accountId);

      expect(result.length).toBeGreaterThan(0);
      const accountInteractions = result.filter((i: any) => i.account === accountId);
      expect(accountInteractions.length).toBeGreaterThan(0);
    });

    it('deve sincronizar e retornar interações quando há conexão', async () => {
      const accountId = 'account-1';
      const mockData = getMockData();
      const mockInteractions = mockData.interactions.length > 0 
        ? mockData.interactions.map(i => {
            const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
            return {
              id: i.id,
              account: i.account,
              pet: { id: petId },
              status: i.status || 'liked',
              createdAt: i.createdAt,
            };
          })
        : [{
            id: 'interaction-1',
            account: accountId,
            pet: { id: 'pet-1' },
            status: 'liked',
            createdAt: new Date().toISOString(),
          }];

      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse(mockInteractions)
      );

      mockDb.setTableData('account_pet_interactions', []);

      const result = await accountPetInteractionSync.getByAccount(accountId);

      expect(result).toBeDefined();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const localInteractions = mockDb.getTableData('account_pet_interactions');
      
      if (localInteractions.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const finalInteractions = mockDb.getTableData('account_pet_interactions');
      expect(finalInteractions.length).toBeGreaterThan(0);
    });
  });

  describe('upsert', () => {
    it('deve criar interação localmente', async () => {
      const interaction = createMockInteraction();

      const result = await accountPetInteractionSync.upsert(interaction);

      expect(result).toEqual(interaction);
      const localInteractions = mockDb.getTableData('account_pet_interactions');
      expect(localInteractions.length).toBeGreaterThan(0);
    });
  });

  describe('delete', () => {
    it('deve remover interação localmente', async () => {
      const interaction = createMockInteraction();
      mockDb.setTableData('account_pet_interactions', [interaction]);

      await accountPetInteractionSync.delete(interaction.id);

      const localInteractions = mockDb.getTableData('account_pet_interactions');
      expect(localInteractions).toHaveLength(0);
    });
  });
});

