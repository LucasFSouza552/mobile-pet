import { useReducer, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const PET_TYPES = ['Cachorro', 'Gato', 'Pássaro', 'Outro'] as const;

interface NewPetState {
  name: string;
  description: string;
  type: typeof PET_TYPES[number];
  gender: 'male' | 'female';
  age: string;
  weight: string;
  image: { uri: string; name: string; type: string } | null;
  loading: boolean;
}

type NewPetAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_TYPE'; payload: typeof PET_TYPES[number] }
  | { type: 'SET_GENDER'; payload: 'male' | 'female' }
  | { type: 'SET_AGE'; payload: string }
  | { type: 'SET_WEIGHT'; payload: string }
  | { type: 'SET_IMAGE'; payload: { uri: string; name: string; type: string } | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_FORM' };

const initialState: NewPetState = {
  name: '',
  description: '',
  type: 'Cachorro',
  gender: 'male',
  age: '',
  weight: '',
  image: null,
  loading: false,
};

function newPetReducer(state: NewPetState, action: NewPetAction): NewPetState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_TYPE':
      return { ...state, type: action.payload };
    case 'SET_GENDER':
      return { ...state, gender: action.payload };
    case 'SET_AGE':
      return { ...state, age: action.payload };
    case 'SET_WEIGHT':
      return { ...state, weight: action.payload };
    case 'SET_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

export function useNewPetReducer() {
  const [state, dispatch] = useReducer(newPetReducer, initialState);

  const setName = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name });
  }, []);

  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description });
  }, []);

  const setType = useCallback((type: typeof PET_TYPES[number]) => {
    dispatch({ type: 'SET_TYPE', payload: type });
  }, []);

  const setGender = useCallback((gender: 'male' | 'female') => {
    dispatch({ type: 'SET_GENDER', payload: gender });
  }, []);

  const setAge = useCallback((age: string) => {
    dispatch({ type: 'SET_AGE', payload: age });
  }, []);

  const setWeight = useCallback((weight: string) => {
    dispatch({ type: 'SET_WEIGHT', payload: weight });
  }, []);

  const setImage = useCallback((image: { uri: string; name: string; type: string } | null) => {
    dispatch({ type: 'SET_IMAGE', payload: image });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para adicionar foto do pet.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    dispatch({
      type: 'SET_IMAGE',
      payload: {
        uri: asset.uri,
        name: asset.fileName || `pet-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    });
  }, []);

  return {
    state,
    setName,
    setDescription,
    setType,
    setGender,
    setAge,
    setWeight,
    setImage,
    setLoading,
    resetForm,
    pickImage,
  };
}
