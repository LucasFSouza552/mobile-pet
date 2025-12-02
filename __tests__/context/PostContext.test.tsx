import React from 'react';
import { render } from '@testing-library/react-native';
import { PostProvider, usePost } from '@/context/PostContext';
import { postRepository } from '@/data/remote/repositories/postRemoteRepository';
import { useNetInfo } from '@react-native-community/netinfo';

jest.mock('@/data/remote/repositories/postRemoteRepository');

const TestComponent = () => {
  const { loading } = usePost();
  return <>{loading ? 'loading' : 'loaded'}</>;
};

describe('PostContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    (postRepository.fetchPostsWithAuthor as jest.Mock).mockResolvedValue([]);
  });

  it('deve renderizar provider sem erros', () => {
    const { getByText } = render(
      <PostProvider>
        <TestComponent />
      </PostProvider>
    );
    expect(getByText).toBeTruthy();
  });

  it('deve fornecer todas as propriedades do contexto', () => {
    const TestProps = () => {
      const post = usePost();
      expect(post).toHaveProperty('posts');
      expect(post).toHaveProperty('loading');
      expect(post).toHaveProperty('error');
      expect(post).toHaveProperty('refresh');
      expect(post).toHaveProperty('fetchMore');
      expect(post).toHaveProperty('likePost');
      expect(post).toHaveProperty('userPosts');
      expect(post).toHaveProperty('searchPosts');
      expect(post).toHaveProperty('deletePost');
      expect(post).toHaveProperty('editPost');
      expect(post).toHaveProperty('cleanPosts');
      return <></>;
    };

    render(
      <PostProvider>
        <TestProps />
      </PostProvider>
    );
  });

  it('deve lançar erro quando usePost é usado fora do provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePost deve ser usado dentro de PostProvider');

    consoleError.mockRestore();
  });
});

