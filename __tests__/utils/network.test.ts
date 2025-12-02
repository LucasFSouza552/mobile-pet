import { isNetworkConnected, clearNetworkCache } from '@/utils/network';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo');

describe('network utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearNetworkCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isNetworkConnected', () => {
    it('deve retornar true quando conectado', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      const result = await isNetworkConnected();
      expect(result).toBe(true);
    });

    it('deve retornar false quando desconectado', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
      const result = await isNetworkConnected();
      expect(result).toBe(false);
    });

    it('deve usar cache quando disponível', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      
      // Primeira chamada
      const promise1 = isNetworkConnected();
      await promise1;
      
      // Segunda chamada dentro do tempo de cache
      jest.advanceTimersByTime(1000);
      const promise2 = isNetworkConnected();
      const result = await promise2;
      
      expect(result).toBe(true);
      expect(NetInfo.fetch).toHaveBeenCalledTimes(1);
    });

    it('deve buscar novamente após expirar cache', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      
      // Primeira chamada
      const promise1 = isNetworkConnected();
      await promise1;
      
      // Avançar tempo além do cache
      jest.advanceTimersByTime(3000);
      const promise2 = isNetworkConnected();
      await promise2;
      
      expect(NetInfo.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve retornar cache quando ocorre erro', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      const promise1 = isNetworkConnected();
      await promise1;
      
      (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('Erro de rede'));
      const promise2 = isNetworkConnected();
      const result = await promise2;
      
      expect(result).toBe(true); // Retorna cache anterior
    });

    it('deve retornar false quando não há cache e ocorre erro', async () => {
      (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('Erro de rede'));
      const result = await isNetworkConnected();
      expect(result).toBe(false);
    });
  });

  describe('clearNetworkCache', () => {
    it('deve limpar cache', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      const promise1 = isNetworkConnected();
      await promise1;
      
      clearNetworkCache();
      
      // Próxima chamada deve buscar novamente
      const promise2 = isNetworkConnected();
      await promise2;
      expect(NetInfo.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

