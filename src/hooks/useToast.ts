import { useCallback } from 'react';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showToast,
  hideToast,
  ToastOptions,
  ToastType,
} from '../utils/toast';
import {
  handleError,
  handleApiError,
  handleValidationError,
  handleNetworkError,
  withErrorHandling,
  safeAsync,
} from '../utils/errorHandler';

export const useToast = () => {
  const success = useCallback((text1: string, text2?: string) => {
    showSuccessToast({ text1, text2 });
  }, []);

  const error = useCallback((text1: string, text2?: string) => {
    showErrorToast({ text1, text2 });
  }, []);

  const info = useCallback((text1: string, text2?: string) => {
    showInfoToast({ text1, text2 });
  }, []);

  const show = useCallback((type: ToastType, options: ToastOptions) => {
    showToast(type, options);
  }, []);

  const hide = useCallback(() => {
    hideToast();
  }, []);

  return {
    success,
    error,
    info,
    show,
    hide,
    
    handleError: useCallback((error: any, customMessage?: string, showToast: boolean = true) => {
      return handleError(error, customMessage, showToast);
    }, []),
    
    handleApiError: useCallback((error: any, defaultMessage?: string, showToast: boolean = true) => {
      return handleApiError(error, defaultMessage, showToast);
    }, []),
    
    handleValidationError: useCallback((error: any, fieldName?: string) => {
      return handleValidationError(error, fieldName);
    }, []),
    
    handleNetworkError: useCallback((error: any) => {
      return handleNetworkError(error);
    }, []),
    
    withErrorHandling: useCallback(<T,>(
      asyncFn: () => Promise<T>,
      errorMessage?: string,
      showToast: boolean = true
    ) => {
      return withErrorHandling(asyncFn, errorMessage, showToast);
    }, []),
    
    safeAsync: useCallback(<T,>(asyncFn: () => Promise<T>) => {
      return safeAsync(asyncFn);
    }, []),
  };
};

