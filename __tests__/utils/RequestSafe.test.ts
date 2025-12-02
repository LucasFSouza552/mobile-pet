import requestSafe from '@/utils/RequestSafe';

describe('RequestSafe', () => {
  it('deve retornar resultado quando API call é bem-sucedida', async () => {
    const apiCall = jest.fn().mockResolvedValue('sucesso');
    const result = await requestSafe(apiCall);
    expect(result).toBe('sucesso');
    expect(apiCall).toHaveBeenCalled();
  });

  it('deve lançar erro formatado quando response existe', async () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Erro do servidor' },
      },
    };
    const apiCall = jest.fn().mockRejectedValue(error);
    
    await expect(requestSafe(apiCall)).rejects.toThrow('Erro 400: Erro do servidor');
  });

  it('deve usar mensagem padrão quando response não tem message', async () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    };
    const apiCall = jest.fn().mockRejectedValue(error);
    
    await expect(requestSafe(apiCall)).rejects.toThrow('Erro 500: Erro desconhecido do servidor');
  });

  it('deve lançar erro de conexão quando request existe', async () => {
    const error = {
      request: {},
    };
    const apiCall = jest.fn().mockRejectedValue(error);
    
    await expect(requestSafe(apiCall)).rejects.toThrow('Nenhuma resposta do servidor. Verifique sua conexão.');
  });

  it('deve lançar erro com message quando existe', async () => {
    const error = {
      message: 'Erro customizado',
    };
    const apiCall = jest.fn().mockRejectedValue(error);
    
    await expect(requestSafe(apiCall)).rejects.toThrow('Erro customizado');
  });

  it('deve lançar erro padrão quando não há informações', async () => {
    const error = {};
    const apiCall = jest.fn().mockRejectedValue(error);
    
    await expect(requestSafe(apiCall)).rejects.toThrow('Erro desconhecido ao realizar a requisição.');
  });
});

