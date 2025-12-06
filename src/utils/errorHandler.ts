import { showErrorToast, showInfoToast } from './toast';

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  request?: any;
  message?: string;
}

export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    if (message) {
      return message;
    }
    switch (status) {
      case 400:
        return 'Requisição inválida. Verifique os dados enviados.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito. Este recurso já existe.';
      case 422:
        return 'Dados inválidos. Verifique as informações fornecidas.';
      case 429:
        return 'Muitas requisições. Tente novamente mais tarde.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 502:
        return 'Servidor temporariamente indisponível.';
      case 503:
        return 'Serviço temporariamente indisponível.';
      default:
        return `Erro ${status}: Ocorreu um problema ao processar sua requisição.`;
    }
  }

  if (error?.request) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
};

export const handleError = (
  error: any,
  customMessage?: string,
  showToast: boolean = true
): string => {
  const message = customMessage || extractErrorMessage(error);

  if (showToast) {
    showErrorToast({
      text1: 'Erro',
      text2: message,
      position: 'top',
    });
  }

  if (__DEV__) {
    console.error('[Error Handler]', error);
  }

  return message;
};

export const handleApiError = (
  error: any,
  defaultMessage: string = 'Erro ao processar requisição',
  showToast: boolean = true
): string => {
  return handleError(error, defaultMessage, showToast);
};

export const handleValidationError = (
  error: any,
  fieldName?: string
): string => {
  const message = extractErrorMessage(error);
  const field = fieldName ? ` no campo ${fieldName}` : '';
  
  showErrorToast({
    text1: 'Erro de validação',
    text2: `Verifique os dados${field}: ${message}`,
    position: 'top',
  });

  return message;
};

export const handleNetworkError = (error: any): string => {
  const message = extractErrorMessage(error);
  
  if (error?.request || message.includes('conexão') || message.includes('network')) {
    showErrorToast({
      text1: 'Sem conexão',
      text2: 'Verifique sua conexão com a internet e tente novamente.',
      position: 'top',
    });
    return 'Erro de conexão';
  }

  return handleError(error);
};

export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string,
  showToast: boolean = true
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, errorMessage, showToast);
    return null;
  }
};

export const safeAsync = async <T>(
  asyncFn: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    return { data: null, error: errorMessage };
  }
};

export const handleSessionExpired = (error?: any): string => {
  const message = 'Sessão expirada. Faça login novamente.';
  
  showErrorToast({
    text1: 'Sessão expirada',
    text2: message,
    position: 'top',
  });

  if (__DEV__) {
    console.error('[Session Expired]', error);
  }

  return message;
};

