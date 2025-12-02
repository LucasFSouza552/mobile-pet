import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PostProvider, usePost } from '@/context/PostContext';
import { postRepository } from '@/data/remote/repositories/postRemoteRepository';
import { createMockPost, createMockAccount, seedMockData, getMockData, resetMockData } from '../helpers/integrationTestUtils';
import { getMockApiClient, resetMockApiClient, createSuccessResponse } from '../helpers/mockApiClient';
import { apiClient } from '@/data/remote/api/apiClient';
import { useNetInfo } from '@react-native-community/netinfo';
import { IPost } from '@/models/IPost';
import { getMockLocalDb, resetMockLocalDb } from '../helpers/mockLocalDb';

// Mock apiClient para NUNCA fazer chamadas HTTP reais
jest.mock('@/data/remote/api/apiClient', () => {
  const mockApiClient = {
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
      const baseURL = config.baseURL || '';
      const url = config.url || '';
      return `${baseURL}${url}`;
    }),
  };
  return { apiClient: mockApiClient };
});

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

describe('PostFlow - Integração', () => {
  let mockApi: any;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Usa timers reais para evitar problemas
    resetMockApiClient();
    resetMockLocalDb();
    resetMockData();
    
    mockDb = getMockLocalDb();
    mockApi = getMockApiClient();
    
    // Popula dados iniciais
    seedMockData(mockDb);
    const mockData = getMockData();
    
    // Mock postRepository para usar mockDb
    const { postRepository } = require('@/data/remote/repositories/postRemoteRepository');
    
    // getAll() - retorna posts do mockDb
    postRepository.getAll = jest.fn(async () => {
      return mockDb.getAll('posts');
    });
    
    // fetchPostsWithAuthor - retorna posts do mockDb ou do seed
    postRepository.fetchPostsWithAuthor = jest.fn(async (query: any) => {
      let posts = mockDb.getAll('posts');
      // Se não há posts no mockDb, usa os do seed
      if (posts.length === 0) {
        const mockData = getMockData();
        posts = mockData.posts;
      }
      return posts;
    });
    
    // create() - insere no mockDb e retorna
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
    
    // update() - atualiza no mockDb e retorna
    postRepository.updatePost = jest.fn(async (id: string, data: any) => {
      let posts = mockDb.getAll('posts');
      // Se não há posts no mockDb, usa os do seed
      if (posts.length === 0) {
        const mockData = getMockData();
        posts = [...mockData.posts];
        mockDb.setTableData('posts', posts);
      }
      const index = posts.findIndex((p: any) => p.id === id);
      if (index >= 0) {
        const existing = posts[index];
        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        posts[index] = updated;
        mockDb.setTableData('posts', posts);
        // Atualiza também o mockApi para que refresh() retorne o post atualizado
        mockApi.mockGet('/post/with-author', createSuccessResponse(posts));
        mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(posts));
        // Retorna o post atualizado como Promise resolvida
        return Promise.resolve(updated);
      }
      return Promise.reject(new Error('Post not found'));
    });
    
    // like() - atualiza likes no mockDb
    postRepository.toggleLikePostById = jest.fn(async (id: string) => {
      let posts = mockDb.getAll('posts');
      // Se não há posts no mockDb, usa os do seed
      if (posts.length === 0) {
        const mockData = getMockData();
        posts = [...mockData.posts];
        mockDb.setTableData('posts', posts);
      }
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
      // Atualiza também o mockApi para que refresh() retorne o post atualizado
      mockApi.mockGet('/post/with-author', createSuccessResponse(posts));
      mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(posts));
      return post;
    });
    
    // delete() - remove do mockDb
    postRepository.softDeletePostById = jest.fn(async (id: string) => {
      let posts = mockDb.getAll('posts');
      // Se não há posts no mockDb, usa os do seed
      if (posts.length === 0) {
        const mockData = getMockData();
        posts = [...mockData.posts];
        mockDb.setTableData('posts', posts);
      }
      const filtered = posts.filter((p: any) => p.id !== id);
      mockDb.setTableData('posts', filtered);
      // Atualiza também o mockApi para que refresh() retorne os posts atualizados
      mockApi.mockGet('/post/with-author', createSuccessResponse(filtered));
      mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(filtered));
      return {};
    });
    
    // Configura mocks padrão com dados do seed para todas as variações de URL
    const defaultPostsResponse = createSuccessResponse(mockData.posts);
    mockApi.mockGet('/post/with-author', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt', defaultPostsResponse);
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', defaultPostsResponse);
    
    // Garante que useNetInfo sempre retorna isConnected: true
    (useNetInfo as jest.Mock).mockReturnValue({ 
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    // Mock apiClient.get para SEMPRE retornar dados mockados, nunca fazer chamada HTTP real
    (apiClient.get as jest.Mock).mockImplementation((urlOrConfig: string | any, config?: any) => {
      // Axios pode receber URL como string ou config como objeto
      let actualUrl = '';
      if (typeof urlOrConfig === 'string') {
        actualUrl = urlOrConfig;
      } else if (urlOrConfig && typeof urlOrConfig === 'object') {
        actualUrl = urlOrConfig.url || '';
      }
      
      const response = mockApi.getResponse('GET', actualUrl);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      // Se é para posts e não encontrou resposta, retorna posts padrão
      if (actualUrl.includes('/post/with-author')) {
        if (!response || !response.data) {
          return Promise.resolve(defaultPostsResponse);
        }
        return Promise.resolve(response);
      }
      // Para outras URLs, retorna resposta mockada ou erro
      if (!response || !response.data) {
        return Promise.reject(new Error(`No mock found for GET ${actualUrl}`));
      }
      return Promise.resolve(response);
    });

    // Mock apiClient.post para SEMPRE retornar dados mockados
    (apiClient.post as jest.Mock).mockImplementation((urlOrConfig: string | any, data?: any, config?: any) => {
      // Axios pode receber URL como string ou config como objeto
      let actualUrl = '';
      if (typeof urlOrConfig === 'string') {
        actualUrl = urlOrConfig;
      } else if (urlOrConfig && typeof urlOrConfig === 'object') {
        actualUrl = urlOrConfig.url || '';
        data = urlOrConfig.data || data;
      }
      
      const response = mockApi.getResponse('POST', actualUrl);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      // Se não encontrou resposta, cria uma resposta padrão baseada na URL
      if (!response || !response.data) {
        if (actualUrl.includes('/post') && !actualUrl.includes('/like') && !actualUrl.includes('/delete')) {
          // Para criação de post, retorna o post criado
          const mockData = getMockData();
          const newPost = {
            id: `post-${Date.now()}`,
            account: mockData.account,
            content: data?.content || (data instanceof FormData ? 'New post' : 'New post'),
            likes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return Promise.resolve(createSuccessResponse(newPost));
        }
        if (actualUrl.includes('/post/') && actualUrl.includes('/like')) {
          // Para like, retorna o post atualizado
          const postId = actualUrl.split('/')[2];
          let posts = mockDb.getAll('posts');
          if (posts.length === 0) {
            const mockData = getMockData();
            posts = [...mockData.posts];
            mockDb.setTableData('posts', posts);
          }
          const post = posts.find((p: any) => p.id === postId);
          if (post) {
            const updatedPost = { ...post, likes: [...(post.likes || []), 'account-1'] };
            return Promise.resolve(createSuccessResponse(updatedPost));
          }
        }
        return Promise.resolve(createSuccessResponse({}));
      }
      return Promise.resolve(response);
    });

    // Mock apiClient.patch para SEMPRE retornar dados mockados
    (apiClient.patch as jest.Mock).mockImplementation((urlOrConfig: string | any, data?: any, config?: any) => {
      // Axios pode receber URL como string ou config como objeto
      let actualUrl = '';
      if (typeof urlOrConfig === 'string') {
        actualUrl = urlOrConfig;
      } else if (urlOrConfig && typeof urlOrConfig === 'object') {
        actualUrl = urlOrConfig.url || '';
        data = urlOrConfig.data || data;
      }
      
      const response = mockApi.getResponse('PATCH', actualUrl);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      // Se não encontrou resposta, cria uma resposta padrão baseada na URL
      if (!response || !response.data) {
        if (actualUrl.includes('/post/') && !actualUrl.includes('/like')) {
          // Para atualização de post, retorna o post atualizado
          const postId = actualUrl.split('/')[2];
          let posts = mockDb.getAll('posts');
          // Se não há posts no mockDb, usa os do seed
          if (posts.length === 0) {
            const mockData = getMockData();
            posts = [...mockData.posts];
            mockDb.setTableData('posts', posts);
          }
          const post = posts.find((p: any) => p.id === postId);
          if (post) {
            const updatedPost = { ...post, ...data, updatedAt: new Date().toISOString() };
            // Atualiza no mockDb
            const index = posts.findIndex((p: any) => p.id === postId);
            if (index >= 0) {
              posts[index] = updatedPost;
              mockDb.setTableData('posts', posts);
            }
            return Promise.resolve(createSuccessResponse(updatedPost));
          }
        }
        return Promise.resolve(createSuccessResponse(data || {}));
      }
      return Promise.resolve(response);
    });
    
    // Mock apiClient.delete para SEMPRE retornar dados mockados
    (apiClient.delete as jest.Mock) = jest.fn(async (urlOrConfig: string | any, config?: any) => {
      // Axios pode receber URL como string ou config como objeto
      let actualUrl = '';
      if (typeof urlOrConfig === 'string') {
        actualUrl = urlOrConfig;
      } else if (urlOrConfig && typeof urlOrConfig === 'object') {
        actualUrl = urlOrConfig.url || '';
      }
      
      const response = mockApi.getResponse('DELETE', actualUrl);
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      // Para delete, sempre retorna sucesso
      return Promise.resolve(createSuccessResponse({}));
    });
  });

  afterEach(() => {
    // Limpa timers pendentes para evitar vazamentos
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('deve criar post e exibir na lista', async () => {
    const mockData = getMockData();
    const mockAccount = mockData.account;
    const existingPosts = mockData.posts;
    const newPost = createMockPost({ 
      id: 'new-post-1',
      account: mockAccount,
      content: 'Novo post de teste'
    });

    // A rota real é /post/with-author com query params
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(existingPosts));
    mockApi.mockPost('/post', createSuccessResponse(newPost));

    const CreatePostTestComponent = () => {
      const { posts, refresh, loading } = usePost();
      const [created, setCreated] = React.useState(false);
      
      React.useEffect(() => {
        // Aguarda posts carregarem e então cria novo post
        if (!loading && posts.length > 0 && !created) {
          (async () => {
            try {
              await postRepository.createPost(newPost);
              setCreated(true);
              // Atualiza o mock para retornar o novo post
              const updatedPosts = [...existingPosts, newPost];
              mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(updatedPosts));
              mockApi.mockGet('/post/with-author', createSuccessResponse(updatedPosts));
              // Aguarda um pouco antes de refresh para garantir que o mock foi atualizado
              await new Promise(resolve => setTimeout(resolve, 100));
              await refresh();
            } catch (error) {
              console.error('Erro ao criar post:', error);
            }
          })();
        }
      }, [loading, posts, created, refresh]);
      
      return (
        <>
          <Text testID="posts-count">{posts.length}</Text>
          <Text testID="has-new-post">
            {posts.some((p: IPost) => p.id === 'new-post-1') ? 'true' : 'false'}
          </Text>
        </>
      );
    };

    const { getByTestId } = render(
      <PostProvider>
        <CreatePostTestComponent />
      </PostProvider>
    );

    // Aguarda posts iniciais serem carregados
    await waitFor(() => {
      const count = Number(getByTestId('posts-count').props.children);
      expect(count).toBeGreaterThan(0);
    }, { timeout: 10000 });

    // Aguarda o novo post ser adicionado após criação
    await waitFor(() => {
      expect(getByTestId('has-new-post').props.children).toBe('true');
    }, { timeout: 10000 });
  });

  it('deve editar post e refletir mudanças na lista', async () => {
    const mockData = getMockData();
    
    // Cria um post isolado com conteúdo original para este teste específico
    const existingPost = { 
      ...mockData.posts[0],
      id: 'post-edit-test',
      content: 'Conteúdo original'
    };
    const updatedPost = { ...existingPost, content: 'Conteúdo atualizado' };
    
    // Limpa posts e insere apenas o post com conteúdo original
    mockDb.setTableData('posts', [existingPost]);
    
    // Garante que o mock do postRepository.fetchPostsWithAuthor retorna o conteúdo original inicialmente
    const { postRepository } = require('@/data/remote/repositories/postRemoteRepository');
    let shouldReturnUpdated = false;
    
    (postRepository.fetchPostsWithAuthor as jest.Mock) = jest.fn(async (query: any) => {
      const posts = mockDb.getAll('posts');
      // Se ainda não foi editado, retorna o conteúdo original
      if (!shouldReturnUpdated) {
        return [existingPost];
      }
      // Depois da edição, retorna o atualizado
      return posts;
    });
    
    // Mock do updatePost que atualiza o mockDb e marca que deve retornar atualizado
    (postRepository.updatePost as jest.Mock) = jest.fn(async (id: string, data: any) => {
      const posts = mockDb.getAll('posts');
      const index = posts.findIndex((p: any) => p.id === id);
      if (index >= 0) {
        const existing = posts[index];
        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        posts[index] = updated;
        mockDb.setTableData('posts', posts);
        // Marca que agora deve retornar o atualizado
        shouldReturnUpdated = true;
        // Atualiza também o mockApi para que refresh() retorne o post atualizado
        mockApi.mockGet('/post/with-author', createSuccessResponse(posts));
        mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(posts));
        return Promise.resolve(updated);
      }
      return Promise.reject(new Error('Post not found'));
    });

    // Configura mocks da API para retornar conteúdo original inicialmente
    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse([existingPost]));
    mockApi.mockGet('/post/with-author', createSuccessResponse([existingPost]));
    mockApi.mockPatch(`/post/${existingPost.id}`, createSuccessResponse(updatedPost));

    const EditPostTestComponent = () => {
      const { posts, editPost, loading, error } = usePost();
      const [edited, setEdited] = React.useState(false);
      const [initialLoad, setInitialLoad] = React.useState(false);
      
      // Aguarda o carregamento inicial antes de tentar editar
      React.useEffect(() => {
        if (!loading && posts.length > 0 && !initialLoad) {
          setInitialLoad(true);
        }
      }, [loading, posts, initialLoad]);
      
      // Só tenta editar após o carregamento inicial e quando encontrar o post com conteúdo original
      React.useEffect(() => {
        if (initialLoad && !loading && posts.length > 0 && !edited) {
          const post = posts.find((p: IPost) => p.id === existingPost.id);
          if (post && post.content === 'Conteúdo original') {
            // Aguarda um pouco para garantir que o estado está estável
            setTimeout(async () => {
              try {
                const result = await editPost(existingPost.id, { content: 'Conteúdo atualizado' });
                if (result) {
                  setEdited(true);
                  // Atualiza o mock para retornar o post editado
                  const updatedPosts = mockDb.getAll('posts');
                  mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse(updatedPosts));
                  mockApi.mockGet('/post/with-author', createSuccessResponse(updatedPosts));
                }
              } catch (error) {
                console.error('Erro ao editar post:', error);
                setEdited(true); // Marca como editado mesmo em caso de erro para evitar loop
              }
            }, 100);
          }
        }
      }, [initialLoad, loading, posts, edited, editPost]);
      
      const post = posts.find((p: IPost) => p.id === existingPost.id);
      return (
        <>
          <Text testID="loading">{loading ? 'true' : 'false'}</Text>
          <Text testID="error">{error || 'null'}</Text>
          <Text testID="posts-count">{posts.length}</Text>
          <Text testID="post-content">
            {post?.content || 'not-found'}
          </Text>
        </>
      );
    };

    const { getByTestId } = render(
      <PostProvider>
        <EditPostTestComponent />
      </PostProvider>
    );

    // Aguarda o carregamento inicial
    await waitFor(() => {
      const loading = getByTestId('loading').props.children;
      expect(loading).toBe('false');
    }, { timeout: 10000 });

    await waitFor(() => {
      const error = getByTestId('error').props.children;
      expect(error).toBe('null');
    }, { timeout: 2000 });

    // Aguarda posts serem carregados
    await waitFor(() => {
      const postsCount = Number(getByTestId('posts-count').props.children);
      expect(postsCount).toBeGreaterThan(0);
    }, { timeout: 10000 });

    // Aguarda o post com conteúdo original aparecer
    await waitFor(() => {
      const content = getByTestId('post-content').props.children;
      expect(content).toBe('Conteúdo original');
    }, { timeout: 10000 });

    // Aguarda a edição ser aplicada (editPost atualiza o estado diretamente)
    await waitFor(() => {
      const content = getByTestId('post-content').props.children;
      expect(content).toBe('Conteúdo atualizado');
    }, { timeout: 15000 });
  }, 20000); // Timeout total do teste aumentado para 20 segundos

  it('deve deletar post e remover da lista', async () => {
    const mockData = getMockData();
    const postToDelete = mockData.posts[0];
    const otherPost = mockData.posts[1] || createMockPost({ id: 'post-other' });

    mockApi.mockGet('/post/with-author?page=1&limit=10&orderBy=createdAt&order=desc', createSuccessResponse([postToDelete, otherPost]));
    mockApi.mockGet('/post/with-author', createSuccessResponse([postToDelete, otherPost]));
    mockApi.mockPost(`/post/${postToDelete.id}/delete`, createSuccessResponse({}));

    const DeletePostTestComponent = () => {
      const { posts, deletePost } = usePost();
      const [deleted, setDeleted] = React.useState(false);
      
      React.useEffect(() => {
        if (posts.length > 0 && !deleted) {
          const postExists = posts.some((p: IPost) => p.id === postToDelete.id);
          if (postExists) {
            deletePost(postToDelete.id).then(() => {
              setDeleted(true);
            }).catch(() => {});
          }
        }
      }, [posts, deleted, deletePost]);
      
      return (
        <Text testID="has-deleted-post">
          {posts.some((p: IPost) => p.id === postToDelete.id) ? 'true' : 'false'}
        </Text>
      );
    };

    const { getByTestId } = render(
      <PostProvider>
        <DeletePostTestComponent />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('has-deleted-post').props.children).toBe('false');
    }, { timeout: 10000 });
  });
});

