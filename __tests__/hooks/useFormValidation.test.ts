import { act } from '@testing-library/react-native';
import { renderHook } from '../utils/renderHook';
import { useFormValidation } from '@/hooks/useFormValidation';
import { validateEmail, validatePassword } from '@/utils/validation';

describe('useFormValidation', () => {
  const initialValues = {
    email: '',
    password: '',
  };

  const validators = {
    email: validateEmail,
    password: validatePassword,
  };

  it('deve inicializar com valores iniciais', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    expect(result.current.fields.email.value).toBe('');
    expect(result.current.fields.password.value).toBe('');
    expect(result.current.fields.email.isValid).toBe(true);
    expect(result.current.fields.password.isValid).toBe(true);
  });

  it('deve atualizar valor do campo', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    act(() => {
      result.current.setFieldValue('email', 'test@email.com');
    });

    expect(result.current.fields.email.value).toBe('test@email.com');
  });

  it('deve validar campo ao alterar quando validateOnChange é true', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators, { validateOnChange: true })
    );

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
    });

    expect(result.current.fields.email.isValid).toBe(false);
    expect(result.current.fields.email.error).toBeDefined();
  });

  it('deve não validar campo ao alterar quando validateOnChange é false', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators, { validateOnChange: false })
    );

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
    });

    expect(result.current.fields.email.isValid).toBe(true);
    expect(result.current.fields.email.error).toBeUndefined();
  });

  it('deve validar campo ao perder foco quando validateOnBlur é true', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators, { 
        validateOnChange: false,
        validateOnBlur: true 
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
      result.current.setFieldTouched('email');
    });

    expect(result.current.fields.email.isValid).toBe(false);
    expect(result.current.fields.email.touched).toBe(true);
  });

  it('deve não validar campo ao perder foco quando validateOnBlur é false', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators, { 
        validateOnChange: false,
        validateOnBlur: false 
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
      result.current.setFieldTouched('email');
    });

    expect(result.current.fields.email.isValid).toBe(true);
    expect(result.current.fields.email.touched).toBe(true);
  });

  it('deve validar todos os campos', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
      result.current.setFieldValue('password', 'senha');
    });

    act(() => {
      const isValid = result.current.validateAll();
      expect(isValid).toBe(false);
    });

    expect(result.current.fields.email.isValid).toBe(false);
    expect(result.current.fields.password.isValid).toBe(false);
  });

  it('deve retornar true quando todos os campos são válidos', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    act(() => {
      result.current.setFieldValue('email', 'test@email.com');
      result.current.setFieldValue('password', 'senha123');
    });

    act(() => {
      const isValid = result.current.validateAll();
      expect(isValid).toBe(true);
    });
  });

  it('deve resetar formulário', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    act(() => {
      result.current.setFieldValue('email', 'test@email.com');
      result.current.setFieldValue('password', 'senha123');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.fields.email.value).toBe('');
    expect(result.current.fields.password.value).toBe('');
    expect(result.current.fields.email.isValid).toBe(true);
    expect(result.current.fields.email.touched).toBe(false);
  });

  it('deve retornar valores do formulário', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    act(() => {
      result.current.setFieldValue('email', 'test@email.com');
      result.current.setFieldValue('password', 'senha123');
    });

    const values = result.current.getValues();
    expect(values.email).toBe('test@email.com');
    expect(values.password).toBe('senha123');
  });

  it('deve retornar isFormValid correto', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    expect(result.current.isFormValid).toBe(true);

    act(() => {
      result.current.setFieldValue('email', 'email-invalido');
    });

    expect(result.current.isFormValid).toBe(false);
  });

  it('deve retornar props do campo', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    const fieldProps = result.current.getFieldProps('email');

    expect(fieldProps).toHaveProperty('value');
    expect(fieldProps).toHaveProperty('error');
    expect(fieldProps).toHaveProperty('isValid');
    expect(fieldProps).toHaveProperty('touched');
    expect(fieldProps).toHaveProperty('onChangeText');
    expect(fieldProps).toHaveProperty('onBlur');
  });

  it('deve atualizar campo via getFieldProps', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validators)
    );

    const fieldProps = result.current.getFieldProps('email');

    act(() => {
      fieldProps.onChangeText('test@email.com');
    });

    expect(result.current.fields.email.value).toBe('test@email.com');
  });
});

