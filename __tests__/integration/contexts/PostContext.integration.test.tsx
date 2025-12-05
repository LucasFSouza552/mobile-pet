import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PostProvider, usePost } from '@/context/PostContext';
import { postRepository } from '@/data/remote/repositories/postRemoteRepository';
import { createMockPost, createMockArray, seedMockData, getMockData, resetMockData } from '../helpers/integrationTestUtils';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';
import { apiClient } from '@/data/remote/api/apiClient';
import { useNetInfo } from '@react-native-community/netinfo';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';

jest.mock('@/data/remote/api/apiClient');
jest.mock('@/data/remote/repositories/postRemoteRepository', () => ({
  postRepository: {
    fetchPostsWithAuthor: jest.fn(),
    toggleLikePostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    softDeletePostById: jest.fn(),
  }
}));
jest.mock('@react-native-community/netinfo');

const TestComponent = () => {
  const { posts, loading, error, refresh, likePost } = usePost();
  
  return (
    <>
      <Text testID="posts-count">{posts.length}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      <Text testID="error">{error || 'null'}</Text>
      <Text testID="has-refresh">{typeof refresh === 'function' ? 'true' : 'false'}</Text>
      <Text testID="has-like">{typeof likePost === 'function' ? 'true' : 'false'}</Text>
    </>
  );
};

describe('PostContext - Integração', () => {
  let mockApi: any;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockApiClient();
    resetMockLocalDb();
    resetMockData();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();
    
    seedMockData(mockDb);
    const mockData = getMockData();
    
    const { postRepository } = require('@/data/remote/repositories/postRemoteRepository');
    
    postRepository.getAll = jest.fn(async () => {
      return mockDb.getAll('posts');
    });
    
    postRepository.fetchPostsWithAuthor = jest.fn(async (query: any) => {
      const posts = mockDb.getAll('posts');
      return posts;
    });
    
    postRepository.createPost = jest.fn(async (data: any) => {
      const newPost = {
        id: `post-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const currentPosts = mockDb.getAll('posts');
      mockDb.setTableData('posts', [...currentPosts, newPost]);
      return newPost;
    });
    
    postRepository.updatePost = jest.fn(async (id: string, data: any) => {
      const posts = mockDb.getAll('posts');
      const index = posts.findIndex((p: any) => p.id === id);
      if (index >= 0) {
        const existing = posts[index];
        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        posts[index] = updated;
        mockDb.setTableData('posts', posts);
        return updated;
      }
      throw new Error('Post not found');
    });
    
    postRepository.toggleLikePostById = jest.fn(async (id: string) => {
      const posts = mockDb.getAll('posts');
      const post = posts.find((p: any) => p.id === id);
      if (!post) throw new Error('Post not found');
      
      const accountId = 'account-1';
      if (!post.likes) post.likes = [];
      const index = post.likes.indexOf(accountId);
      if (index >= 0) {
        post.likes.splice(index, 1);
      } else {
        post.likes.push(accountId);
      }
      mockDb.setTableData('posts', posts);
      return post;
    });
    
    const defaultPostsResponse = createSuccessResponse(mockData.posts);
    mockApi.mockGet('/post/with-author', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', defaultPostsResponse);
    
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('GET', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      
      if (url.includes('/post/with-author')) {
        if (!response || !response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          return Promise.resolve(defaultPostsResponse);
        }
      }
      
      if (!response || !response.data) {
        return Promise.resolve({ data: [], status: 200 });
      }
      
      return Promise.resolve(response);
    });

    (apiClient.post as jest.Mock).mockImplementation((url: string) => {
      const response = mockApi.getResponse('POST', url);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });

  it('deve fornecer posts vazios inicialmente', () => {
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse([]));
    mockApi.mockGet('/post/with-author', createSuccessResponse([]));

    const { getByTestId } = render(
      <PostProvider>
        <TestComponent />
      </PostProvider>
    );

    expect(getByTestId('posts-count').props.children).toBe(0);
  });

  it('deve carregar posts quando refresh é chamado', async () => {
    const mockData = getMockData();
    const mockPosts = mockData.posts;
    
    mockApi.mockGet('/post/with-author', createSuccessResponse(mockPosts));
    mockApi.mockGet('/post/with-author?', createSuccessResponse(mockPosts));
    mockApi.mockGet('/post/with-author?page=1', createSuccessResponse(mockPosts));
    mockApi.mockGet('/post/with-author?page=1&limit=10', createSuccessResponse(mockPosts));
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt', createSuccessResponse(mockPosts));
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(mockPosts));

    const RefreshTestComponent = () => {
      const { posts, refresh, loading } = usePost();
      const [refreshed, setRefreshed] = React.useState(false);
      
      React.useEffect(() => {
        if (!loading && !refreshed) {
          setRefreshed(true);
          setTimeout(() => {
            refresh();
          }, 50);
        }
      }, [loading, refresh, refreshed]);
      
      return <Text testID="posts-count">{posts.length}</Text>;
    };

    const { getByTestId } = render(
      <PostProvider>
        <RefreshTestComponent />
      </PostProvider>
    );

    await waitFor(() => {
      const count = Number(getByTestId('posts-count').props.children);
      expect(count).toBeGreaterThan(0);
    }, { timeout: 15000 });
  });

  it('deve atualizar like quando likePost é chamado', async () => {
    const mockData = getMockData();
    const mockPost = { ...mockData.posts[0], likes: [] };
    const likedPost = { ...mockPost, likes: ['user-1'] };
    
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse([mockPost]));
    mockApi.mockGet('/post/with-author', createSuccessResponse([mockPost]));
    mockApi.mockPost(`/post/${mockPost.id}/like`, createSuccessResponse(likedPost));

    const LikeTestComponent = () => {
      const { posts, likePost, loading } = usePost();
      const [liked, setLiked] = React.useState(false);
      
      React.useEffect(() => {
        if (!loading && posts.length > 0 && !liked) {
          const post = posts.find(p => p.id === mockPost.id);
          if (post && (!post.likes || post.likes.length === 0)) {
            likePost(mockPost.id).then(() => {
              setLiked(true);
            }).catch(() => {});
          }
        }
      }, [loading, posts, liked, likePost]);
      
      const post = posts.find(p => p.id === mockPost.id);
      return <Text testID="likes-count">{post?.likes?.length || 0}</Text>;
    };

    const { getByTestId } = render(
      <PostProvider>
        <LikeTestComponent />
      </PostProvider>
    );

    await waitFor(() => {
      const count = Number(getByTestId('likes-count').props.children);
      expect(count).toBe(0);
    }, { timeout: 10000 });

    await waitFor(() => {
      const count = Number(getByTestId('likes-count').props.children);
      expect(count).toBeGreaterThan(0);
    }, { timeout: 10000 });
  });

  it('deve exibir erro quando não há conexão', async () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false });

    const ErrorTestComponent = () => {
      const { error, refresh } = usePost();
      
      React.useEffect(() => {
        refresh();
      }, [refresh]);
      
      return <Text testID="error">{error || 'null'}</Text>;
    };

    const { getByTestId } = render(
      <PostProvider>
        <ErrorTestComponent />
      </PostProvider>
    );

    await waitFor(() => {
      const errorText = getByTestId('error').props.children;
      expect(errorText).not.toBe('null');
    });
  });

  it('deve fornecer todas as funções necessárias', async () => {
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse([]));

    const { getByTestId } = render(
      <PostProvider>
        <TestComponent />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('has-refresh').props.children).toBe('true');
      expect(getByTestId('has-like').props.children).toBe('true');
    });
  });
});

