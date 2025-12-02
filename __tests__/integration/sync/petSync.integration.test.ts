import { petSync } from '@/data/sync/petSync';
import { petLocalRepository } from '@/data/local/repositories/petLocalRepository';
import { petRemoteRepository } from '@/data/remote/repositories/petRemoteRepository';
import { isNetworkConnected } from '@/utils/network';
import { getLocalDb } from '@/data/local/database/LocalDb';
import { apiClient } from '@/data/remote/api/apiClient';
import { createMockPet } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/network');
jest.mock('@/data/remote/repositories/pictureRemoteRepository');

describe('petSync - Integração', () => {
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
  });

  describe('getById', () => {
    it('deve retornar pet local quando não há conexão', async () => {
      const petId = 'pet-1';
      const localPet = createMockPet({ id: petId });
      mockDb.setTableData('pets', [localPet]);

      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      const result = await petSync.getById(petId);

      expect(result).toMatchObject(localPet);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('deve buscar do servidor e salvar localmente quando há conexão', async () => {
      const petId = 'pet-1';
      const remotePet = createMockPet({ id: petId });

      mockApi.mockGet(
        `/pet/${petId}`,
        createSuccessResponse(remotePet)
      );

      const result = await petSync.getById(petId);

      expect(result).toBeDefined();
      
      // Aguarda a sincronização assíncrona completar
      // getById chama syncFromServer de forma assíncrona, então precisamos aguardar
      // Aguarda até que o pet seja salvo no banco
      let attempts = 0;
      while (attempts < 50) {
        const localPets = mockDb.getTableData('pets');
        if (localPets.length > 0) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
      
      const localPets = mockDb.getTableData('pets');
      expect(localPets.length).toBeGreaterThan(0);
    });
  });

  describe('syncFromServer', () => {
    it('deve sincronizar pet do servidor para local quando há conexão', async () => {
      const petId = 'pet-1';
      const remotePet = createMockPet({ id: petId });

      mockApi.mockGet(
        `/pet/${petId}`,
        createSuccessResponse(remotePet)
      );

      await petSync.syncFromServer(petId);

      const localPets = mockDb.getTableData('pets');
      expect(localPets.length).toBeGreaterThan(0);
    });

    it('não deve sincronizar quando não há conexão', async () => {
      (isNetworkConnected as jest.Mock).mockResolvedValue(false);

      await petSync.syncFromServer('pet-1');

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('não deve sincronizar se já está sincronizando', async () => {
      const petId = 'pet-1';
      const remotePet = createMockPet({ id: petId });

      mockApi.mockGet(
        `/pet/${petId}`,
        createSuccessResponse(remotePet)
      );

      // Iniciar duas sincronizações simultâneas
      const promise1 = petSync.syncFromServer(petId);
      const promise2 = petSync.syncFromServer(petId);

      await Promise.all([promise1, promise2]);

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });
});

