import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AccountProvider, useAccount } from '@/context/AccountContext';
import { PostProvider, usePost } from '@/context/PostContext';
import { accountSync } from '@/data/sync/accountSync';
import { createMockAccount, createMockPost } from '../helpers/integrationTestUtils';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';
import { apiClient } from '@/data/remote/api/apiClient';
import { useNetInfo } from '@react-native-community/netinfo';
import { getStorage } from '@/utils/storange';

jest.mock('@/data/sync/accountSync');
jest.mock('@/data/remote/api/apiClient');
jest.mock('@react-native-community/netinfo');
jest.mock('@/utils/storange');

const CombinedTestComponent = () => {
  const { account } = useAccount();
  const { posts, refresh } = usePost();
  
  React.useEffect(() => {
    if (account && posts.length === 0) {
      refresh();
    }
  }, [account, posts, refresh]);
  
  return (
    <>
      <Text testID="account-id">{account?.id || 'null'}</Text>
      <Text testID="posts-count">{posts.length}</Text>
    </>
  );
};

describe('ContextsInteraction - Integração', () => {
  let mockApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockApiClient();
    
    mockApi = getMockApiClient();
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    
    (getStorage as jest.Mock).mockResolvedValue('mock-token');

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('GET', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });

  it('deve permitir que PostContext use dados do AccountContext', async () => {
    const mockAccount = createMockAccount();
    const mockPosts = [createMockPost({ account: mockAccount })];
    
    (accountSync.getProfile as jest.Mock).mockResolvedValue(mockAccount);
    mockApi.mockGet('/post', createSuccessResponse(mockPosts));

    const { getByTestId } = render(
      <AccountProvider>
        <PostProvider>
          <CombinedTestComponent />
        </PostProvider>
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe(mockAccount.id);
    });

    await waitFor(() => {
      expect(Number(getByTestId('posts-count').props.children)).toBeGreaterThan(0);
    });
  });

  it('deve atualizar posts quando account muda', async () => {
    const initialAccount = createMockAccount({ id: 'account-1' });
    const updatedAccount = createMockAccount({ id: 'account-2' });
    const mockPosts = [createMockPost({ account: updatedAccount })];
    
    (accountSync.getProfile as jest.Mock)
      .mockResolvedValueOnce(initialAccount)
      .mockResolvedValueOnce(updatedAccount);
    mockApi.mockGet('/post', createSuccessResponse(mockPosts));

    const AccountChangeTestComponent = () => {
      const { account, refreshAccount } = useAccount();
      const { posts } = usePost();
      
      React.useEffect(() => {
        if (account && account.id === 'account-1') {
          setTimeout(() => refreshAccount(), 100);
        }
      }, [account, refreshAccount]);
      
      return (
        <>
          <Text testID="account-id">{account?.id || 'null'}</Text>
          <Text testID="posts-count">{posts.length}</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AccountProvider>
        <PostProvider>
          <AccountChangeTestComponent />
        </PostProvider>
      </AccountProvider>
    );

    await waitFor(() => {
      expect(getByTestId('account-id').props.children).toBe('account-2');
    }, { timeout: 3000 });
  });
});

