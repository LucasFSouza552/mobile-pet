import {
  extractErrorMessage,
  handleError,
  handleApiError,
  handleValidationError,
  handleNetworkError,
  withErrorHandling,
  safeAsync,
} from '@/utils/errorHandler';
import { showErrorToast } from '@/utils/toast';

jest.mock('@/utils/toast');

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractErrorMessage', () => {
    it('deve retornar string quando erro é string', () => {
      expect(extractErrorMessage('Erro simples')).toBe('Erro simples');
    });

    it('deve retornar message quando erro é Error', () => {
      const error = new Error('Erro de teste');
      expect(extractErrorMessage(error)).toBe('Erro de teste');
    });

    it('deve retornar mensagem do response quando existe', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Mensagem do servidor' },
        },
      };
      expect(extractErrorMessage(error)).toBe('Mensagem do servidor');
    });

    it('deve retornar mensagem padrão para status 400', () => {
      const error = {
        response: {
          status: 400,
          data: {},
        },
      };
      expect(extractErrorMessage(error)).toBe('Requisição inválida. Verifique os dados enviados.');
    });

    it('deve retornar mensagem padrão para status 401', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };
      expect(extractErrorMessage(error)).toBe('Sessão expirada. Faça login novamente.');
    });

    it('deve retornar mensagem padrão para status 403', () => {
      const error = {
        response: {
          status: 403,
          data: {},
        },
      };
      expect(extractErrorMessage(error)).toBe('Acesso negado. Você não tem permissão para esta ação.');
    });

    it('deve retornar mensagem padrão para status 404', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };
      expect(extractErrorMessage(error)).toBe('Recurso não encontrado.');
    });

    it('deve retornar mensagem padrão para status 500', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      expect(extractErrorMessage(error)).toBe('Erro interno do servidor. Tente novamente mais tarde.');
    });

    it('deve retornar mensagem para erro de request', () => {
      const error = {
        request: {},
      };
      expect(extractErrorMessage(error)).toBe('Sem conexão com o servidor. Verifique sua internet.');
    });

    it('deve retornar mensagem quando error.message existe', () => {
      const error = {
        message: 'Mensagem de erro',
      };
      expect(extractErrorMessage(error)).toBe('Mensagem de erro');
    });

    it('deve retornar mensagem padrão para erro desconhecido', () => {
      expect(extractErrorMessage({})).toBe('Ocorreu um erro inesperado. Tente novamente.');
    });
  });

  describe('handleError', () => {
    it('deve chamar showErrorToast quando showToast é true', () => {
      const error = new Error('Erro de teste');
      handleError(error, undefined, true);
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro',
        text2: 'Erro de teste',
        position: 'top',
      });
    });

    it('deve usar mensagem customizada quando fornecida', () => {
      const error = new Error('Erro original');
      handleError(error, 'Mensagem customizada', true);
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro',
        text2: 'Mensagem customizada',
        position: 'top',
      });
    });

    it('deve não chamar showErrorToast quando showToast é false', () => {
      const error = new Error('Erro de teste');
      handleError(error, undefined, false);
      expect(showErrorToast).not.toHaveBeenCalled();
    });

    it('deve retornar mensagem de erro', () => {
      const error = new Error('Erro de teste');
      const result = handleError(error, undefined, false);
      expect(result).toBe('Erro de teste');
    });
  });

  describe('handleApiError', () => {
    it('deve chamar handleError com mensagem padrão', () => {
      const error = new Error('Erro de API');
      handleApiError(error);
      expect(showErrorToast).toHaveBeenCalled();
    });

    it('deve usar mensagem customizada quando fornecida', () => {
      const error = new Error('Erro de API');
      handleApiError(error, 'Erro customizado');
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro',
        text2: 'Erro customizado',
        position: 'top',
      });
    });
  });

  describe('handleValidationError', () => {
    it('deve mostrar toast com mensagem de validação', () => {
      const error = new Error('Campo inválido');
      handleValidationError(error);
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro de validação',
        text2: 'Verifique os dados: Campo inválido',
        position: 'top',
      });
    });

    it('deve incluir nome do campo quando fornecido', () => {
      const error = new Error('Campo inválido');
      handleValidationError(error, 'email');
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro de validação',
        text2: 'Verifique os dados no campo email: Campo inválido',
        position: 'top',
      });
    });
  });

  describe('handleNetworkError', () => {
    it('deve mostrar toast de conexão para erro de rede', () => {
      const error = {
        request: {},
      };
      handleNetworkError(error);
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Sem conexão',
        text2: 'Verifique sua conexão com a internet e tente novamente.',
        position: 'top',
      });
    });

    it('deve chamar handleError para outros erros', () => {
      const error = new Error('Outro erro');
      handleNetworkError(error);
      expect(showErrorToast).toHaveBeenCalled();
    });
  });

  describe('withErrorHandling', () => {
    it('deve retornar resultado quando função é bem-sucedida', async () => {
      const asyncFn = jest.fn().mockResolvedValue('sucesso');
      const result = await withErrorHandling(asyncFn);
      expect(result).toBe('sucesso');
      expect(asyncFn).toHaveBeenCalled();
    });

    it('deve retornar null e chamar handleError quando função falha', async () => {
      const error = new Error('Erro na função');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const result = await withErrorHandling(asyncFn);
      expect(result).toBeNull();
      expect(showErrorToast).toHaveBeenCalled();
    });

    it('deve usar mensagem customizada quando fornecida', async () => {
      const error = new Error('Erro na função');
      const asyncFn = jest.fn().mockRejectedValue(error);
      await withErrorHandling(asyncFn, 'Erro customizado');
      expect(showErrorToast).toHaveBeenCalledWith({
        text1: 'Erro',
        text2: 'Erro customizado',
        position: 'top',
      });
    });
  });

  describe('safeAsync', () => {
    it('deve retornar data quando função é bem-sucedida', async () => {
      const asyncFn = jest.fn().mockResolvedValue('dados');
      const result = await safeAsync(asyncFn);
      expect(result).toEqual({ data: 'dados', error: null });
    });

    it('deve retornar error quando função falha', async () => {
      const error = new Error('Erro na função');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const result = await safeAsync(asyncFn);
      expect(result).toEqual({ data: null, error: 'Erro na função' });
    });
  });
});

