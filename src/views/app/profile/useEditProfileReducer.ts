import { useReducer, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { IAccount } from '../../../models/IAccount';
import IAddress from '../../../models/IAddress';
import { useToast } from '../../../hooks/useToast';

interface EditProfileState {
  formData: IAccount | null;
  address: IAddress;
  password: {
    current: string;
    new: string;
    confirm: string;
  };
  avatarPreview: string | null;
  avatarFile: any;
  loading: boolean;
  showPassword: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
}

type EditProfileAction =
  | { type: 'SET_FORM_DATA'; payload: IAccount | null }
  | { type: 'UPDATE_FORM_FIELD'; payload: { key: string; value: string } }
  | { type: 'SET_ADDRESS'; payload: IAddress }
  | { type: 'UPDATE_ADDRESS_FIELD'; payload: { key: keyof IAddress; value: string } }
  | { type: 'SET_PASSWORD'; payload: { current: string; new: string; confirm: string } }
  | { type: 'UPDATE_PASSWORD_FIELD'; payload: { field: 'current' | 'new' | 'confirm'; value: string } }
  | { type: 'SET_AVATAR_PREVIEW'; payload: string | null }
  | { type: 'SET_AVATAR_FILE'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SHOW_PASSWORD'; payload: 'current' | 'new' | 'confirm' }
  | { type: 'RESET_FORM' };

const initialAddress: IAddress = {
  street: '',
  number: '',
  complement: '',
  city: '',
  cep: '',
  state: '',
  neighborhood: '',
};

const initialState: EditProfileState = {
  formData: null,
  address: initialAddress,
  password: {
    current: '',
    new: '',
    confirm: '',
  },
  avatarPreview: null,
  avatarFile: null,
  loading: false,
  showPassword: {
    current: false,
    new: false,
    confirm: false,
  },
};

function editProfileReducer(state: EditProfileState, action: EditProfileAction): EditProfileState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        formData: state.formData ? { ...state.formData, [action.payload.key]: action.payload.value } : null,
      };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'UPDATE_ADDRESS_FIELD':
      return {
        ...state,
        address: { ...state.address, [action.payload.key]: action.payload.value },
      };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'UPDATE_PASSWORD_FIELD':
      return {
        ...state,
        password: { ...state.password, [action.payload.field]: action.payload.value },
      };
    case 'SET_AVATAR_PREVIEW':
      return { ...state, avatarPreview: action.payload };
    case 'SET_AVATAR_FILE':
      return { ...state, avatarFile: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'TOGGLE_SHOW_PASSWORD':
      return {
        ...state,
        showPassword: {
          ...state.showPassword,
          [action.payload]: !state.showPassword[action.payload],
        },
      };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

export function useEditProfileReducer() {
  const [state, dispatch] = useReducer(editProfileReducer, initialState);
  const toast = useToast();

  const setFormData = useCallback((formData: IAccount | null) => {
    dispatch({ type: 'SET_FORM_DATA', payload: formData });
  }, []);

  const updateFormField = useCallback((key: string, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', payload: { key, value } });
  }, []);

  const setAddress = useCallback((address: IAddress) => {
    dispatch({ type: 'SET_ADDRESS', payload: address });
  }, []);

  const updateAddressField = useCallback((key: keyof IAddress, value: string) => {
    dispatch({ type: 'UPDATE_ADDRESS_FIELD', payload: { key, value } });
  }, []);

  const setPassword = useCallback((password: { current: string; new: string; confirm: string }) => {
    dispatch({ type: 'SET_PASSWORD', payload: password });
  }, []);

  const updatePasswordField = useCallback((field: 'current' | 'new' | 'confirm', value: string) => {
    dispatch({ type: 'UPDATE_PASSWORD_FIELD', payload: { field, value } });
  }, []);

  const setAvatarPreview = useCallback((preview: string | null) => {
    dispatch({ type: 'SET_AVATAR_PREVIEW', payload: preview });
  }, []);

  const setAvatarFile = useCallback((file: any) => {
    dispatch({ type: 'SET_AVATAR_FILE', payload: file });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const toggleShowPassword = useCallback((field: 'current' | 'new' | 'confirm') => {
    dispatch({ type: 'TOGGLE_SHOW_PASSWORD', payload: field });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const handleAvatarChange = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      toast.error('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      dispatch({ type: 'SET_AVATAR_PREVIEW', payload: result.assets[0].uri });
      dispatch({ type: 'SET_AVATAR_FILE', payload: result.assets[0] });
    }
  }, [toast]);

  return {
    state,
    setFormData,
    updateFormField,
    setAddress,
    updateAddressField,
    setPassword,
    updatePasswordField,
    setAvatarPreview,
    setAvatarFile,
    setLoading,
    toggleShowPassword,
    resetForm,
    handleAvatarChange,
  };
}
