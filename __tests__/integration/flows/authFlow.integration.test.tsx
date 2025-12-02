import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AccountProvider, useAccount } from '@/context/AccountContext';
import { accountSync } from '@/data/sync/accountSync';
import { accountLocalRepository } from '@/data/local/repositories/accountLocalRepository';
import { createMockAccount } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getLocalDb } from '@/data/local/database/LocalDb';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/sync/accountSync');
jest.mock('@/data/local/repositories/accountLocalRepository');
jest.mock('@react-native-community/netinfo');

describe('AuthFlow - Integração', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockLocalDb();
    
    mockDb = getMockLocalDb();
    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    // Configurar mocks do accountLocalRepository
    (accountLocalRepository.logout as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it('deve carregar perfil após login e atualizar contexto', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);

    const LoginTestComponent = () => {
      const { account, loading } = useAccount();
      
      return (
        <>
          <Text testID="account-id">{account?.id || 'null'}</Text>
          <Text testID="account-email">{account?.email || 'null'}</Text>
          <Text testID="loading">{loading ? 'true' : 'false'}</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AccountProvider>
        <LoginTestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe(mockAccount.id);
      expect(getByTestId('account-email').props.children).toBe(mockAccount.email);
    });
  });

  it('deve sincronizar dados após login', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);
    (accountSync.syncFromServer as jest.Mock).mockResolvedValue(undefined);

    const SyncTestComponent = () => {
      const { account } = useAccount();
      
      React.useEffect(() => {
        if (account) {
          accountSync.syncFromServer();
        }
      }, [account]);
      
      return <Text testID="account-id">{account?.id || 'null'}</Text>;
    };

    const { getByTestId } = render(
      <AccountProvider>
        <SyncTestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe(mockAccount.id);
    });

    await waitFor(() => {
      expect(accountSync.syncFromServer).toHaveBeenCalled();
    });
  });

  it('deve limpar dados e resetar contexto após logout', async () => {
    const mockAccount = createMockAccount();
    mockDb.setTableData('accounts', [mockAccount]);
    
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);
    (accountLocalRepository.logout as jest.Mock).mockResolvedValue(undefined);

    const LogoutTestComponent = () => {
      const { account, logout } = useAccount();
      
      React.useEffect(() => {
        if (account) {
          setTimeout(() => logout(), 100);
        }
      }, [account, logout]);
      
      return <Text testID="account-id">{account?.id || 'null'}</Text>;
    };

    const { getByTestId } = render(
      <AccountProvider>
        <LogoutTestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe(mockAccount.id);
    });

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe('null');
    }, { timeout: 3000 });

    expect(accountLocalRepository.logout).toHaveBeenCalled();
  });

  it('deve atualizar contexto quando perfil é atualizado', async () => {
    const initialAccount = createMockAccount({ name: 'Nome Inicial' });
    const updatedAccount = createMockAccount({ name: 'Nome Atualizado' });
    
    (accountSync.getProfile as jest.Mock)
      .mockResolvedValueOnce(initialAccount)
      .mockResolvedValueOnce(updatedAccount);

    const UpdateTestComponent = () => {
      const { account, refreshAccount } = useAccount();
      
      React.useEffect(() => {
        if (account && account.name === 'Nome Inicial') {
          setTimeout(() => refreshAccount(), 100);
        }
      }, [account, refreshAccount]);
      
      return <Text testID="account-name">{account?.name || 'null'}</Text>;
    };

    const { getByTestId } = render(
      <AccountProvider>
        <UpdateTestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-name').props.children).toBe('Nome Atualizado');
    }, { timeout: 3000 });
  });
});

