import { postRepository } from '@/data/remote/repositories/postRemoteRepository';
import { apiClient } from '@/data/remote/api/apiClient';
import buildQuery from '@/utils/BuilderQuery';

jest.mock('@/data/remote/api/apiClient');
jest.mock('@/utils/BuilderQuery');

describe('postRemoteRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAllPosts', () => {
    it('deve buscar todos os posts', async () => {
      const mockData = [{ id: '1', content: 'Post 1' }];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await postRepository.fetchAllPosts();

      expect(apiClient.get).toHaveBeenCalledWith('/post');
      expect(result).toEqual(mockData);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(postRepository.fetchAllPosts()).rejects.toThrow('API Error');
    });
  });

  describe('fetchPostsWithAuthor', () => {
    it('deve buscar posts com autor usando query params', async () => {
      const mockData = [{ id: '1', content: 'Post 1' }];
      (buildQuery as jest.Mock).mockReturnValue('?page=1&limit=10');
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await postRepository.fetchPostsWithAuthor({
        page: 1,
        limit: 10,
      });

      expect(buildQuery).toHaveBeenCalled();
      expect(apiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('toggleLikePostById', () => {
    it('deve alternar like do post', async () => {
      const mockData = { id: '1', liked: true };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await postRepository.toggleLikePostById('1');

      expect(apiClient.post).toHaveBeenCalledWith('/post/1/like');
      expect(result).toEqual(mockData);
    });
  });

  describe('softDeletePostById', () => {
    it('deve deletar post suavemente', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

      await postRepository.softDeletePostById('1');

      expect(apiClient.post).toHaveBeenCalledWith('/post/1/delete');
    });
  });
});

