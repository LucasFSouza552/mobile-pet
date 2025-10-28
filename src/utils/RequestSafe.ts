export default async function requestSafe<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Erro desconhecido do servidor';
      throw new Error(`Erro ${status}: ${message}`);
    } else if (error.request) {
      throw new Error('Nenhuma resposta do servidor. Verifique sua conexão.');
    } else {
      throw new Error(error.message || 'Erro desconhecido ao realizar a requisição.');
    }
  }
}