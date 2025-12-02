import { renderHook } from '../utils/renderHook';
import { useNetworkSync } from '@/hooks/useNetworkSync';
import NetInfo from '@react-native-community/netinfo';
import { useAccount } from '@/context/AccountContext';
import { accountSync } from '@/data/sync/accountSync';
import { accountPetInteractionSync } from '@/data/sync/accountPetInteractionSync';
import { historySync } from '@/data/sync/historySync';
import { achievementsSync } from '@/data/sync/achievementsSync';

jest.mock('@react-native-community/netinfo');
jest.mock('@/context/AccountContext');
jest.mock('@/data/sync/accountSync');
jest.mock('@/data/sync/accountPetInteractionSync');
jest.mock('@/data/sync/historySync');
jest.mock('@/data/sync/achievementsSync');

describe('useNetworkSync', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);
    (useAccount as jest.Mock).mockReturnValue({ account: null });
    (accountSync.syncFromServer as jest.Mock).mockResolvedValue(undefined);
    (accountPetInteractionSync.syncFromServer as jest.Mock).mockResolvedValue(undefined);
    (historySync.syncFromServer as jest.Mock).mockResolvedValue(undefined);
    (achievementsSync.syncFromServer as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado de conexão', async () => {
    const { result, act, unmount } = renderHook(() => useNetworkSync());

    try {
      await act(async () => {
        // Aguarda a inicialização assíncrona
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Após a inicialização, isConnected deve ter um valor
      expect(result.current.isConnected).not.toBeNull();
    } finally {
      unmount();
    }
  });

  it('deve retornar isConnected correto', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    const { result, act, unmount } = renderHook(() => useNetworkSync());

    try {
      await act(async () => {
        // Aguarda a inicialização assíncrona
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isConnected).toBe(true);
    } finally {
      unmount();
    }
  });

  it('deve sincronizar quando conectado', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    const { result, act, unmount } = renderHook(() => useNetworkSync());

    try {
      await act(async () => {
        // Aguarda a inicialização assíncrona
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isConnected).toBe(true);

      await act(async () => {
        await result.current.syncNow();
      });

      expect(accountSync.syncFromServer).toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('deve não sincronizar quando desconectado', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    
    const { result, act, unmount } = renderHook(() => useNetworkSync());

    try {
      await act(async () => {
        // Aguarda a inicialização assíncrona
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isConnected).toBe(false);

      await act(async () => {
        await result.current.syncNow();
      });

      expect(accountSync.syncFromServer).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('deve sincronizar múltiplos serviços quando account existe', async () => {
    (useAccount as jest.Mock).mockReturnValue({ account: { id: '123' } });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    const { result, act, unmount } = renderHook(() => useNetworkSync());

    try {
      await act(async () => {
        // Aguarda a inicialização assíncrona
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isConnected).toBe(true);

      await act(async () => {
        await result.current.syncNow();
      });

      expect(accountSync.syncFromServer).toHaveBeenCalled();
      expect(accountPetInteractionSync.syncFromServer).toHaveBeenCalledWith('123');
      expect(historySync.syncFromServer).toHaveBeenCalledWith('123');
      expect(achievementsSync.syncFromServer).toHaveBeenCalledWith('123');
    } finally {
      unmount();
    }
  });
});

