import { act } from '@testing-library/react-native';
import { renderHook } from '../utils/renderHook';
import { useToast } from '@/hooks/useToast';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showToast,
  hideToast,
} from '@/utils/toast';
import {
  handleError,
  handleApiError,
  handleValidationError,
  handleNetworkError,
  withErrorHandling,
  safeAsync,
} from '@/utils/errorHandler';

jest.mock('@/utils/toast');
jest.mock('@/utils/errorHandler');

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar showSuccessToast quando success é chamado', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Título', 'Mensagem');
    });

    expect(showSuccessToast).toHaveBeenCalledWith({
      text1: 'Título',
      text2: 'Mensagem',
    });
  });

  it('deve chamar showErrorToast quando error é chamado', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Erro', 'Mensagem de erro');
    });

    expect(showErrorToast).toHaveBeenCalledWith({
      text1: 'Erro',
      text2: 'Mensagem de erro',
    });
  });

  it('deve chamar showInfoToast quando info é chamado', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info', 'Mensagem informativa');
    });

    expect(showInfoToast).toHaveBeenCalledWith({
      text1: 'Info',
      text2: 'Mensagem informativa',
    });
  });

  it('deve chamar showToast quando show é chamado', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show('success', { text1: 'Título', text2: 'Mensagem' });
    });

    expect(showToast).toHaveBeenCalledWith('success', {
      text1: 'Título',
      text2: 'Mensagem',
    });
  });

  it('deve chamar hideToast quando hide é chamado', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.hide();
    });

    expect(hideToast).toHaveBeenCalled();
  });

  it('deve chamar handleError quando handleError é chamado', () => {
    const { result } = renderHook(() => useToast());
    const error = new Error('Erro de teste');

    act(() => {
      result.current.handleError(error, 'Mensagem customizada', true);
    });

    expect(handleError).toHaveBeenCalledWith(error, 'Mensagem customizada', true);
  });

  it('deve chamar handleApiError quando handleApiError é chamado', () => {
    const { result } = renderHook(() => useToast());
    const error = new Error('Erro de API');

    act(() => {
      result.current.handleApiError(error, 'Erro customizado', true);
    });

    expect(handleApiError).toHaveBeenCalledWith(error, 'Erro customizado', true);
  });

  it('deve chamar handleValidationError quando handleValidationError é chamado', () => {
    const { result } = renderHook(() => useToast());
    const error = new Error('Erro de validação');

    act(() => {
      result.current.handleValidationError(error, 'campo');
    });

    expect(handleValidationError).toHaveBeenCalledWith(error, 'campo');
  });

  it('deve chamar handleNetworkError quando handleNetworkError é chamado', () => {
    const { result } = renderHook(() => useToast());
    const error = new Error('Erro de rede');

    act(() => {
      result.current.handleNetworkError(error);
    });

    expect(handleNetworkError).toHaveBeenCalledWith(error);
  });

  it('deve chamar withErrorHandling quando withErrorHandling é chamado', async () => {
    const { result } = renderHook(() => useToast());
    const asyncFn = jest.fn().mockResolvedValue('sucesso');

    await act(async () => {
      await result.current.withErrorHandling(asyncFn, 'Erro', true);
    });

    expect(withErrorHandling).toHaveBeenCalledWith(asyncFn, 'Erro', true);
  });

  it('deve chamar safeAsync quando safeAsync é chamado', async () => {
    const { result } = renderHook(() => useToast());
    const asyncFn = jest.fn().mockResolvedValue('dados');

    await act(async () => {
      await result.current.safeAsync(asyncFn);
    });

    expect(safeAsync).toHaveBeenCalledWith(asyncFn);
  });
});

