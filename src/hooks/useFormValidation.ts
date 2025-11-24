import { useState, useCallback, useEffect } from 'react';

export interface FieldValidation {
  value: string;
  error?: string;
  touched: boolean;
  isValid: boolean;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: string) => { isValid: boolean; error?: string }>>,
  options: UseFormValidationOptions = {}
) {
  const { validateOnChange = true, validateOnBlur = true } = options;

  const [fields, setFields] = useState<Record<keyof T, FieldValidation>>(() => {
    const initial: any = {};
    Object.keys(initialValues).forEach((key) => {
      initial[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
        isValid: true,
      };
    });
    return initial;
  });

  const validateField = useCallback(
    (fieldName: keyof T, value: string): FieldValidation => {
      const validator = validators[fieldName];
      if (!validator) {
        return {
          value,
          error: undefined,
          touched: true,
          isValid: true,
        };
      }

      const result = validator(value);
      return {
        value,
        error: result.isValid ? undefined : result.error,
        touched: true,
        isValid: result.isValid,
      };
    },
    [validators]
  );

  const setFieldValue = useCallback(
    (fieldName: keyof T, value: string) => {
      setFields((prev) => {
        const newField = validateOnChange
          ? validateField(fieldName, value)
          : {
              ...prev[fieldName],
              value,
            };

        return {
          ...prev,
          [fieldName]: newField,
        };
      });
    },
    [validateField, validateOnChange]
  );

  const setFieldTouched = useCallback(
    (fieldName: keyof T) => {
      setFields((prev) => {
        const field = prev[fieldName];
        if (field.touched) return prev;

        const validated = validateOnBlur
          ? validateField(fieldName, field.value)
          : { ...field, touched: true };

        return {
          ...prev,
          [fieldName]: validated,
        };
      });
    },
    [validateField, validateOnBlur]
  );

  const validateAll = useCallback((): boolean => {
    let allValid = true;
    const newFields: any = {};

    Object.keys(fields).forEach((key) => {
      const fieldName = key as keyof T;
      const field = fields[fieldName];
      const validated = validateField(fieldName, field.value);
      newFields[fieldName] = validated;
      if (!validated.isValid) {
        allValid = false;
      }
    });

    setFields(newFields);
    return allValid;
  }, [fields, validateField]);

  const reset = useCallback(() => {
    const resetFields: any = {};
    Object.keys(initialValues).forEach((key) => {
      resetFields[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
        isValid: true,
      };
    });
    setFields(resetFields);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (fieldName: keyof T) => {
      const field = fields[fieldName];
      return {
        value: field.value,
        error: field.error,
        isValid: field.isValid,
        touched: field.touched,
        onChangeText: (value: string) => setFieldValue(fieldName, value),
        onBlur: () => setFieldTouched(fieldName),
      };
    },
    [fields, setFieldValue, setFieldTouched]
  );

  const isFormValid = Object.values(fields).every((field) => field.isValid);

  return {
    fields,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    getFieldProps,
    isFormValid,
    getValues: () => {
      const values: any = {};
      Object.keys(fields).forEach((key) => {
        values[key] = fields[key as keyof T].value;
      });
      return values as T;
    },
  };
}

