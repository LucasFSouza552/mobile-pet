import { accountPetInteractionSync } from '@/data/sync/accountPetInteractionSync';
import { accountPetInteractionLocalRepository } from '@/data/local/repositories/accountPetInteractionLocalRepository';
import { petInteractionRemoteRepository } from '@/data/remote/repositories/petInteractionRemoteRepository';
import { isNetworkConnected } from '@/utils/network';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockInteraction, createMockPet, seedMockData, getMockData, resetMockData } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/network');
const mockPetSync = {
  getById: jest.fn(async (id: string) => {
    // Retorna um pet mockado para não quebrar enrichInteractionsWithLocalImages
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
    jest.useRealTimers(); // Usa timers reais por padrão
    resetMockLocalDb();
    resetMockApiClient();
    resetMockData();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();

    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);

    // Popula dados iniciais - IMPORTANTE: garante que interactions estão no mockDb
    seedMockData(mockDb);
    const mockData = getMockData();
    
    // Verifica que seedMockData realmente populou as interactions
    const seededInteractions = mockDb.getTableData('account_pet_interactions');
    if (seededInteractions.length === 0) {
      console.warn('seedMockData não populou interactions no mockDb');
    }

    // Configura mocks padrão com dados do seed para interactions
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

    // Mock padrão para interactions
    mockApi.mockGet('/interaction/profile/account-1', createSuccessResponse(mockInteractionsForApi));

    // Mock petInteractionRemoteRepository.getInteractionByAccount para retornar dados da API mockada
    // IMPORTANTE: Não deve usar mockDb, mas sim os dados mockados da API
    const { petInteractionRemoteRepository } = require('@/data/remote/repositories/petInteractionRemoteRepository');
    (petInteractionRemoteRepository.getInteractionByAccount as jest.Mock) = jest.fn(async (accountId: string) => {
      // Retorna dados da API mockada (mockApi), não do mockDb
      const response = mockApi.getResponse('GET', `/interaction/profile/${accountId}`);
      if (response instanceof Error) {
        return [];
      }
      // Se não encontrou resposta específica, tenta retornar dados do seed
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
      // Se não encontrou resposta, tenta retornar dados do seed para interactions
      if (url.includes('/interaction/profile/') && (!response || !response.data)) {
        return Promise.resolve(createSuccessResponse(mockInteractionsForApi));
      }
      return Promise.resolve(response);
    });
  });

  afterEach(() => {
    // Limpa timers pendentes para evitar vazamentos
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe('syncFromServer', () => {
    it('deve sincronizar interações do servidor para local quando há conexão', async () => {
      const accountId = 'account-1';
      const mockData = getMockData();
      // Usa dados do seed, mas garante que tem pelo menos uma interação
      // Formato correto: pet deve ser um objeto { id: string }
      const mockInteractions = mockData.interactions.length > 0 
        ? mockData.interactions.map(i => {
            const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
            return {
              id: i.id,
              account: i.account,
              pet: { id: petId }, // Sempre objeto com id
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

      // Configura a API mockada para retornar essas interações
      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse(mockInteractions)
      );

      // Limpa interações existentes para testar inserção
      mockDb.setTableData('account_pet_interactions', []);

      await accountPetInteractionSync.syncFromServer(accountId);

      // Aguarda um pouco para garantir que a sincronização completou
      // accountPetInteractionSync processa em batches e pode ter delays
      // Aumenta o timeout porque syncFromServer processa em batches de 5 com delays de 100ms
      await new Promise(resolve => setTimeout(resolve, 800));

      const localInteractions = mockDb.getTableData('account_pet_interactions');
      
      // Se ainda estiver vazio, aguarda mais um pouco (pode estar processando)
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
      // Cria interaction no formato correto para o mockDb (pet como string)
      const localInteraction = {
        id: 'local-1',
        account: accountId,
        pet: 'pet-1', // String, não objeto
        status: 'liked' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDb.setTableData('account_pet_interactions', [localInteraction]);

      // API mockada retorna array vazio - significa que não há interações no servidor
      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse([])
      );

      await accountPetInteractionSync.syncFromServer(accountId);

      // Aguarda um pouco para garantir que a remoção completou
      await new Promise(resolve => setTimeout(resolve, 200));

      const localInteractions = mockDb.getTableData('account_pet_interactions');
      // Deve remover apenas as interações deste accountId, não todas
      expect(localInteractions.filter((i: any) => i.account === accountId)).toHaveLength(0);
    });
  });

  describe('getByAccount', () => {
    it('deve retornar interações locais quando não há conexão', async () => {
      const accountId = 'account-1';
      
      // IMPORTANTE: Garante que o mockDb tem os dados antes do teste
      // Primeiro, popula com seedMockData para garantir que há pets também
      seedMockData(mockDb);
      
      // Depois adiciona uma interação local específica para este teste
      const localInteraction = {
        id: 'local-interaction-1',
        account: accountId,
        pet: 'pet-1', // String, não objeto
        status: 'liked' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Adiciona a interação local às existentes do seed
      const existingInteractions = mockDb.getTableData('account_pet_interactions');
      mockDb.setTableData('account_pet_interactions', [...existingInteractions, localInteraction]);
      
      // Verifica que os dados estão no mockDb antes de chamar getByAccount
      const beforeCall = mockDb.getTableData('account_pet_interactions');
      expect(beforeCall.length).toBeGreaterThan(0);
      expect(beforeCall.some((i: any) => i.account === accountId)).toBe(true);

      // Garante que isNetworkConnected retorna false
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await accountPetInteractionSync.getByAccount(accountId);

      // getByAccount retorna dados locais quando não há conexão
      expect(result.length).toBeGreaterThan(0);
      // Filtra apenas as interações deste accountId
      const accountInteractions = result.filter((i: any) => i.account === accountId);
      expect(accountInteractions.length).toBeGreaterThan(0);
    });

    it('deve sincronizar e retornar interações quando há conexão', async () => {
      const accountId = 'account-1';
      const mockData = getMockData();
      // Formato correto: pet deve ser um objeto { id: string }
      const mockInteractions = mockData.interactions.length > 0 
        ? mockData.interactions.map(i => {
            const petId = typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || 'pet-1';
            return {
              id: i.id,
              account: i.account,
              pet: { id: petId }, // Sempre objeto com id
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

      // Configura a API mockada para retornar essas interações
      mockApi.mockGet(
        `/interaction/profile/${accountId}`,
        createSuccessResponse(mockInteractions)
      );

      // Limpa interações existentes para testar inserção
      mockDb.setTableData('account_pet_interactions', []);

      // getByAccount retorna dados locais primeiro (que estão vazios)
      const result = await accountPetInteractionSync.getByAccount(accountId);

      expect(result).toBeDefined();
      // Inicialmente pode estar vazio porque getByAccount retorna dados locais primeiro
      
      // Aguarda sincronização completar (getByAccount chama syncFromServer de forma assíncrona)
      // getByAccount retorna dados locais primeiro, então syncFromServer roda em background
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const localInteractions = mockDb.getTableData('account_pet_interactions');
      
      // Se ainda estiver vazio, aguarda mais um pouco
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

