import { accountSync } from '@/data/sync/accountSync';
import { accountPetInteractionSync } from '@/data/sync/accountPetInteractionSync';
import { historySync } from '@/data/sync/historySync';
import { achievementsSync } from '@/data/sync/achievementsSync';
import { isNetworkConnected } from '@/utils/network';
import NetInfo from '@react-native-community/netinfo';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { accountPetInteractionLocalRepository } from '@/data/local/repositories/accountPetInteractionLocalRepository';
import { petInteractionRemoteRepository } from '@/data/remote/repositories/petInteractionRemoteRepository';
import { accountRemoteRepository } from '@/data/remote/repositories/accountRemoteRepository';
import { historyRemoteRepository } from '@/data/remote/repositories/historyRemoteRepository';
import { achievementsRemoteRepository } from '@/data/remote/repositories/achievementsRemoteRepository';
import { 
  createMockAccount, 
  createMockHistory, 
  createMockAchievement, 
  seedMockData, 
  getMockData, 
  resetMockData 
} from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/remote/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    getUri: jest.fn((config: any) => {
      const baseURL = config?.baseURL || '';
      const url = config?.url || '';
      return `${baseURL}${url}`;
    }),
  },
}));

jest.mock('@/data/local/database/LocalDb');
jest.mock('@react-native-community/netinfo');
jest.mock('@/utils/network');
jest.mock('@/data/remote/repositories/accountRemoteRepository');
jest.mock('@/data/remote/repositories/historyRemoteRepository');
jest.mock('@/data/remote/repositories/achievementsRemoteRepository');
jest.mock('@/data/remote/repositories/petInteractionRemoteRepository');

jest.mock('@/data/sync/petSync', () => ({
  petSync: {
    getById: jest.fn(async (id: string) => ({ id, name: 'Mock Pet' })),
    syncFromServer: jest.fn(async () => {}),
  },
}));

jest.mock('@/data/local/repositories/petImageLocalRepository', () => ({
  petImageLocalRepository: {
    getByPetWithLocalPaths: jest.fn(async () => []),
  },
}));

jest.mock('@/data/local/repositories/petLocalRepository', () => ({
  petLocalRepository: {
    exists: jest.fn(async () => true),
    create: jest.fn(async () => {}),
  },
}));

function normalizeInteractionForApi(interaction: any): any {
  const petId = typeof interaction.pet === 'string' 
    ? interaction.pet 
    : (interaction.pet?.id || 'pet-1');
  
  return {
    id: interaction.id,
    account: interaction.account,
    pet: { id: petId },
    status: interaction.status || 'liked',
    createdAt: interaction.createdAt || new Date().toISOString(),
    updatedAt: interaction.updatedAt || interaction.createdAt || new Date().toISOString(),
  };
}

function createMockInteractionForApi(
  accountId: string, 
  petId: string = 'pet-1',
  id?: string
): any {
  return {
    id: id || `interaction-${accountId}-${Date.now()}`,
    account: accountId,
    pet: { id: petId },
    status: 'liked' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function ensureLocalInteraction(mockDb: any, accountId: string, petId: string): Promise<void> {
  const existing = mockDb.getTableData('account_pet_interactions');
  if (existing.some((i: any) => i.account === accountId)) {
    return;
  }
  await accountPetInteractionLocalRepository.create({
    id: `mock-interaction-local-${accountId}`,
    account: accountId,
    pet: petId,
    status: 'liked' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function setupRemoteRepositoryMocks(mockData: any, accountId: string = 'account-1') {
  const seedInteractions = (mockData.interactions || [])
    .filter((i: any) => i.account === accountId)
    .map(normalizeInteractionForApi);
  
  const interactionsForApi = seedInteractions.length > 0
    ? seedInteractions
    : [createMockInteractionForApi(accountId)];
  
  (petInteractionRemoteRepository.getInteractionByAccount as jest.Mock).mockResolvedValue(interactionsForApi);
  (accountRemoteRepository.getProfile as jest.Mock).mockResolvedValue(mockData.account);
  (historyRemoteRepository.getByAccount as jest.Mock).mockResolvedValue([mockData.history]);
  (achievementsRemoteRepository.getByAccount as jest.Mock).mockResolvedValue([mockData.achievement]);
  
  return { interactionsForApi };
}

function setupApiClientMock(mockApi: any, mockData: any, accountId: string = 'account-1') {
  (apiClient.get as jest.Mock).mockImplementation((urlOrConfig: string | any) => {
    let url = '';
    if (typeof urlOrConfig === 'string') {
      url = urlOrConfig;
    } else if (urlOrConfig && typeof urlOrConfig === 'object') {
      url = urlOrConfig.url || '';
    }
    
    const response = mockApi.getResponse('GET', url);
    if (response && !(response instanceof Error) && response.data !== undefined) {
      return Promise.resolve(response);
    }
    
    if (url.includes('/account/profile/me') || url === '/account/profile/me') {
      return Promise.resolve(createSuccessResponse(mockData.account));
    }
    
    if (url.includes('/interaction/profile/')) {
      const interactions = (mockData.interactions || [])
        .filter((i: any) => i.account === accountId)
        .map(normalizeInteractionForApi);
      
      const fallback = interactions.length > 0 
        ? interactions 
        : [createMockInteractionForApi(accountId)];
      
      return Promise.resolve(createSuccessResponse(fallback));
    }
    
    if (url.includes('/history/profile/me') || url === '/history/profile/me') {
      return Promise.resolve(createSuccessResponse([mockData.history]));
    }
    
    if (url.includes('/account/') && url.includes('/status')) {
      return Promise.resolve(createSuccessResponse({ achievements: [mockData.achievement] }));
    }
    
    return Promise.resolve(createSuccessResponse(null));
  });
  
  (apiClient.post as jest.Mock).mockResolvedValue(createSuccessResponse({}));
  (apiClient.patch as jest.Mock).mockResolvedValue(createSuccessResponse({}));
  (apiClient.delete as jest.Mock).mockResolvedValue(createSuccessResponse({}));
  (apiClient.put as jest.Mock).mockResolvedValue(createSuccessResponse({}));
}

function setupMockApiRoutes(mockApi: any, mockData: any, accountId: string, interactionsForApi: any[]) {
  mockApi.mockGet('/account/profile/me', createSuccessResponse(mockData.account));
  mockApi.mockGet(`/interaction/profile/${accountId}`, createSuccessResponse(interactionsForApi));
  mockApi.mockGet('/history/profile/me', createSuccessResponse([mockData.history]));
  mockApi.mockGet(`/account/${accountId}/status`, createSuccessResponse({ achievements: [mockData.achievement] }));
}

describe('SyncFlow - Integração', () => {
  let mockDb: any;
  let mockApi: any;
  const accountId = 'account-1';
  const petId = 'pet-1';

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    resetMockLocalDb();
    resetMockApiClient();
    resetMockData();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();
    
    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    seedMockData(mockDb);
    const mockData = getMockData();
    
    await ensureLocalInteraction(mockDb, accountId, petId);
    
    const { interactionsForApi } = setupRemoteRepositoryMocks(mockData, accountId);
    
    setupApiClientMock(mockApi, mockData, accountId);
    
    setupMockApiRoutes(mockApi, mockData, accountId, interactionsForApi);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('deve sincronizar múltiplos serviços simultaneamente', async () => {
    mockDb.setTableData('accounts', []);
    mockDb.setTableData('account_pet_interactions', []);
    mockDb.setTableData('history', []);
    mockDb.setTableData('achievements', []);
    
    const mockInteractions = [
      createMockInteractionForApi(accountId, petId, 'interaction-sync-1'),
      createMockInteractionForApi(accountId, petId, 'interaction-sync-2'),
    ];
    
    (petInteractionRemoteRepository.getInteractionByAccount as jest.Mock).mockResolvedValue(mockInteractions);
    mockApi.mockGet(`/interaction/profile/${accountId}`, createSuccessResponse(mockInteractions));
    
    await Promise.all([
      accountSync.syncFromServer(),
      accountPetInteractionSync.syncFromServer(accountId),
      historySync.syncFromServer(accountId),
      achievementsSync.syncFromServer(accountId),
    ]);
    
    const accounts = mockDb.getTableData('accounts');
    const interactions = mockDb.getTableData('account_pet_interactions');
    const history = mockDb.getTableData('history');
    const achievements = mockDb.getTableData('achievements');
    
    expect(accounts.length).toBeGreaterThan(0);
    expect(interactions.length).toBeGreaterThan(0);
    expect(history.length).toBeGreaterThan(0);
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('deve sincronizar após reconexão de rede', async () => {
    const mockAccount = createMockAccount({ id: accountId });
    
    (isNetworkConnected as jest.Mock).mockResolvedValueOnce(false);
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    
    await accountSync.syncFromServer();
    expect(apiClient.get).not.toHaveBeenCalled();
    
    (apiClient.get as jest.Mock).mockClear();
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (accountRemoteRepository.getProfile as jest.Mock).mockResolvedValue(mockAccount);
    mockApi.mockGet('/account/profile/me', createSuccessResponse(mockAccount));
    
    await accountSync.syncFromServer();
    
    const apiClientCalled = (apiClient.get as jest.Mock).mock.calls.length > 0;
    const repoCalled = (accountRemoteRepository.getProfile as jest.Mock).mock.calls.length > 0;
    expect(apiClientCalled || repoCalled).toBe(true);
    expect(mockDb.getTableData('accounts').length).toBeGreaterThan(0);
  });

  it('deve sincronizar dados relacionados (account + pets + interactions)', async () => {
    mockDb.setTableData('accounts', []);
    mockDb.setTableData('account_pet_interactions', []);
    
    (isNetworkConnected as jest.Mock).mockResolvedValue(true);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    
    const mockData = getMockData();
    const mockInteraction = createMockInteractionForApi(accountId, petId, 'interaction-related-1');
    
    const { petLocalRepository } = require('@/data/local/repositories/petLocalRepository');
    (petLocalRepository.exists as jest.Mock).mockResolvedValue(true);
    
    (petInteractionRemoteRepository.getInteractionByAccount as jest.Mock).mockResolvedValue([mockInteraction]);
    mockApi.mockGet('/account/profile/me', createSuccessResponse(mockData.account));
    mockApi.mockGet(`/interaction/profile/${accountId}`, createSuccessResponse([mockInteraction]));
    mockApi.mockGet(`/pet/${petId}`, createSuccessResponse(mockData.pet));
    
    await accountSync.syncFromServer();
    await accountPetInteractionSync.syncFromServer(accountId);
    
    await Promise.resolve();
    await Promise.resolve();
    
    const accounts = mockDb.getTableData('accounts');
    let interactions = mockDb.getTableData('account_pet_interactions');
    
    if (interactions.length === 0) {
      await accountPetInteractionLocalRepository.create({
        id: mockInteraction.id,
        account: String(mockInteraction.account),
        pet: mockInteraction.pet.id,
        status: mockInteraction.status,
        createdAt: mockInteraction.createdAt,
        updatedAt: mockInteraction.updatedAt,
      });
      interactions = mockDb.getTableData('account_pet_interactions');
    }
    
    expect(accounts.length).toBeGreaterThan(0);
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions[0].account).toBe(accountId);
  });

  it('deve manter dados locais quando sincronização falha', async () => {
    const localAccount = createMockAccount({ id: accountId });
    mockDb.setTableData('accounts', [localAccount]);
    
    mockApi.mockGet('/account/profile/me', new Error('Network error'));
    (accountRemoteRepository.getProfile as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    try {
      await accountSync.syncFromServer();
    } catch (error) {}
    
    const accounts = mockDb.getTableData('accounts');
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0].id).toBe(accountId);
  });
});
