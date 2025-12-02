import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AccountProvider, useAccount } from '@/context/AccountContext';
import { accountSync } from '@/data/sync/accountSync';
import { useToast } from '@/hooks/useToast';

jest.mock('@/data/sync/accountSync');
jest.mock('@/data/local/repositories/accountLocalRepository');
jest.mock('@/hooks/useToast');

const mockAccount = {
  id: '123',
  name: 'Test User',
  email: 'test@email.com',
};

const TestComponent = () => {
  const { account } = useAccount();
  return <>{account ? account.name : 'no account'}</>;
};

describe('AccountContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      handleApiError: jest.fn(),
    });
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);
  });

  it('deve renderizar provider sem erros', () => {
    const { getByText } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );
    expect(getByText).toBeTruthy();
  });

  it('deve carregar conta do perfil', async () => {
    const { getByText } = render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(accountSync.getProfile).toHaveBeenCalled();
    });
  });

  it('deve fornecer função logout', async () => {
    const TestLogout = () => {
      const { logout } = useAccount();
      expect(typeof logout).toBe('function');
      return <></>;
    };

    render(
      <AccountProvider>
        <TestLogout />
      </AccountProvider>
    );
  });

  it('deve lançar erro quando useAccount é usado fora do provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccount deve ser usado dentro de AccountProvider');
    
    consoleError.mockRestore();
  });
});

