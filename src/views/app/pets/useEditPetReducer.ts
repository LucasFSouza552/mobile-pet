import { useReducer, useCallback } from 'react';
import { IPet } from '../../../models/IPet';

type PetFormState = {
  name: string;
  description: string;
  type: IPet['type'];
  gender: 'Male' | 'Female';
  age: string;
  weight: string;
};

interface EditPetState {
  form: PetFormState;
  pet: IPet | null;
  petImages: string[];
  newImages: Array<{ uri: string; name: string; type: string }>;
  removedImageIndices: Set<number>;
  isCameraOpen: boolean;
  loading: boolean;
  saving: boolean;
}

type EditPetAction =
  | { type: 'SET_FORM'; payload: PetFormState }
  | { type: 'UPDATE_FORM_FIELD'; payload: { key: keyof PetFormState; value: string } }
  | { type: 'SET_PET'; payload: IPet | null }
  | { type: 'SET_PET_IMAGES'; payload: string[] }
  | { type: 'ADD_NEW_IMAGES'; payload: Array<{ uri: string; name: string; type: string }> }
  | { type: 'REMOVE_NEW_IMAGE'; payload: number }
  | { type: 'REMOVE_IMAGE_INDEX'; payload: number }
  | { type: 'RESTORE_IMAGE_INDEX'; payload: number }
  | { type: 'SET_CAMERA_OPEN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'RESET_IMAGES' };

const initialFormState: PetFormState = {
  name: '',
  description: '',
  type: 'Cachorro',
  gender: 'Male',
  age: '',
  weight: '',
};

const initialState: EditPetState = {
  form: initialFormState,
  pet: null,
  petImages: [],
  newImages: [],
  removedImageIndices: new Set(),
  isCameraOpen: false,
  loading: false,
  saving: false,
};

function editPetReducer(state: EditPetState, action: EditPetAction): EditPetState {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, form: action.payload };
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.payload.key]: action.payload.value },
      };
    case 'SET_PET':
      return { ...state, pet: action.payload };
    case 'SET_PET_IMAGES':
      return { ...state, petImages: action.payload };
    case 'ADD_NEW_IMAGES':
      return { ...state, newImages: [...state.newImages, ...action.payload] };
    case 'REMOVE_NEW_IMAGE':
      return {
        ...state,
        newImages: state.newImages.filter((_, i) => i !== action.payload),
      };
    case 'REMOVE_IMAGE_INDEX':
      return {
        ...state,
        removedImageIndices: new Set([...state.removedImageIndices, action.payload]),
      };
    case 'RESTORE_IMAGE_INDEX':
      const newSet = new Set(state.removedImageIndices);
      newSet.delete(action.payload);
      return { ...state, removedImageIndices: newSet };
    case 'SET_CAMERA_OPEN':
      return { ...state, isCameraOpen: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'RESET_IMAGES':
      return {
        ...state,
        newImages: [],
        removedImageIndices: new Set(),
      };
    default:
      return state;
  }
}

export function useEditPetReducer() {
  const [state, dispatch] = useReducer(editPetReducer, initialState);

  const setForm = useCallback((form: PetFormState) => {
    dispatch({ type: 'SET_FORM', payload: form });
  }, []);

  const updateFormField = useCallback((key: keyof PetFormState, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', payload: { key, value } });
  }, []);

  const setPet = useCallback((pet: IPet | null) => {
    dispatch({ type: 'SET_PET', payload: pet });
  }, []);

  const setPetImages = useCallback((images: string[]) => {
    dispatch({ type: 'SET_PET_IMAGES', payload: images });
  }, []);

  const addNewImages = useCallback((images: Array<{ uri: string; name: string; type: string }>) => {
    dispatch({ type: 'ADD_NEW_IMAGES', payload: images });
  }, []);

  const removeNewImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_NEW_IMAGE', payload: index });
  }, []);

  const removeImageIndex = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_IMAGE_INDEX', payload: index });
  }, []);

  const restoreImageIndex = useCallback((index: number) => {
    dispatch({ type: 'RESTORE_IMAGE_INDEX', payload: index });
  }, []);

  const setCameraOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_CAMERA_OPEN', payload: isOpen });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  }, []);

  const resetImages = useCallback(() => {
    dispatch({ type: 'RESET_IMAGES' });
  }, []);

  return {
    state,
    setForm,
    updateFormField,
    setPet,
    setPetImages,
    addNewImages,
    removeNewImage,
    removeImageIndex,
    restoreImageIndex,
    setCameraOpen,
    setLoading,
    setSaving,
    resetImages,
  };
}
