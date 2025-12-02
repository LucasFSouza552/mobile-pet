import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AccountProvider, useAccount } from '@/context/AccountContext';
import { accountSync } from '@/data/sync/accountSync';
import { accountLocalRepository } from '@/data/local/repositories/accountLocalRepository';
import { createMockAccount, seedMockData, resetMockData } from '../helpers/integrationTestUtils';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';
import { getLocalDb } from '@/data/local/database/LocalDb';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@/data/local/database/LocalDb');
jest.mock('@/data/sync/accountSync');
jest.mock('@/data/local/repositories/accountLocalRepository');
jest.mock('@react-native-community/netinfo');

const TestComponent = () => {
  const { account, loading, refreshAccount, logout } = useAccount();
  
  return (
    <>
      <Text testID="account-id">{account?.id || 'null'}</Text>
      <Text testID="account-name">{account?.name || 'null'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      <Text testID="has-refresh">{typeof refreshAccount === 'function' ? 'true' : 'false'}</Text>
      <Text testID="has-logout">{typeof logout === 'function' ? 'true' : 'false'}</Text>
    </>
  );
};

describe('AccountContext - Integração', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockLocalDb();
    resetMockData();
    
    mockDb = getMockLocalDb();
    (getLocalDb as jest.Mock).mockResolvedValue(mockDb);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    // Popula dados iniciais
    seedMockData(mockDb);
    
    // Configurar mocks do accountLocalRepository
    (accountLocalRepository.logout as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it('deve carregar conta inicialmente', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);

    const { getByTestId } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe(mockAccount.id);
    });
  });

  it('deve exibir loading durante carregamento inicial', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockAccount), 100))
    );

    const { getByTestId } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    expect(getByTestId('loading').props.children).toBe('true');

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });
  });

  it('deve fornecer função refreshAccount', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);

    const { getByTestId } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('has-refresh').props.children).toBe('true');
    });
  });

  it('deve fornecer função logout', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);

    const { getByTestId } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('has-logout').props.children).toBe('true');
    });
  });

  it('deve atualizar conta quando refreshAccount é chamado', async () => {
    const initialAccount = createMockAccount({ id: 'account-1', name: 'Initial Name' });
    const updatedAccount = createMockAccount({ id: 'account-1', name: 'Updated Name' });
    
    // Primeira chamada (carregamento inicial) retorna initialAccount
    // Segunda chamada (refresh) retorna updatedAccount
    (accountSync.getProfile as jest.Mock)
      .mockResolvedValueOnce(initialAccount)
      .mockResolvedValue(updatedAccount);

    const RefreshTestComponent = () => {
      const { account, refreshAccount } = useAccount();
      const [hasRefreshed, setHasRefreshed] = React.useState(false);
      
      React.useEffect(() => {
        // Aguarda o carregamento inicial e então faz refresh
        if (account && account.name === 'Initial Name' && !hasRefreshed) {
          setHasRefreshed(true);
          // Pequeno delay para garantir que o estado inicial foi renderizado
          setTimeout(() => {
            refreshAccount();
          }, 100);
        }
      }, [account, refreshAccount, hasRefreshed]);
      
      return <Text testID="account-name">{account?.name || 'null'}</Text>;
    };

    const { getByTestId } = render(
      <AccountProvider>
        <RefreshTestComponent />
      </AccountProvider>
    );

    // Aguarda o carregamento inicial com "Initial Name"
    await waitFor(() => {
      const name = getByTestId('account-name').props.children;
      expect(name).toBe('Initial Name');
    }, { timeout: 5000 });

    // Aguarda a atualização após refresh com "Updated Name"
    await waitFor(() => {
      const name = getByTestId('account-name').props.children;
      expect(name).toBe('Updated Name');
    }, { timeout: 5000 });
  });

  it('deve limpar conta quando logout é chamado', async () => {
    const mockAccount = createMockAccount();
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);
    (accountLocalRepository.logout as jest.Mock).mockResolvedValue(undefined);

    const LogoutTestComponent = () => {
      const { account, logout } = useAccount();
      
      React.useEffect(() => {
        if (account) {
          logout();
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
      expect(getByTestId('account-id').props.children).toBe('null');
    }, { timeout: 3000 });
  });
});

