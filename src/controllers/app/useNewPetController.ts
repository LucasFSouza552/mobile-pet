import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAccount } from '../../context/AccountContext';
import { petRemoteRepository } from '../../data/remote/repositories/petRemoteRepository';
import { useToast } from '../../hooks/useToast';
import { validateRequired, validateWeight, validateAge } from '../../utils/validation';
import { useNewPetReducer } from '../../views/app/pets/useNewPetReducer';

export function useNewPetController() {
  const navigation = useNavigation<any>();
  const { account } = useAccount();
  const toast = useToast();
  
  const {
    state,
    setName,
    setDescription,
    setType,
    setGender,
    setAge,
    setWeight,
    setLoading,
    pickImage,
  } = useNewPetReducer();

  const { name, description, type, gender, age, weight, image, loading } = state;
  const isInstitution = account?.role === 'institution';

  const validate = useCallback(() => {
    if (!isInstitution) {
      toast.error('Somente instituições podem cadastrar pets.');
      return false;
    }
    
    const nameValidation = validateRequired(name, 'Nome do pet');
    if (!nameValidation.isValid) {
      toast.error('Validação', nameValidation.error || 'Informe o nome do pet.');
      return false;
    }
    
    const weightValidation = validateWeight(weight);
    if (!weightValidation.isValid) {
      toast.error('Validação', weightValidation.error || 'Insira um peso válido.');
      return false;
    }
    
    if (age.trim()) {
      const ageValidation = validateAge(age, false);
      if (!ageValidation.isValid) {
        toast.error('Validação', ageValidation.error || 'Idade inválida.');
        return false;
      }
    }
    
    return true;
  }, [isInstitution, name, weight, age, toast]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const payload: any = {
      name: name.trim(),
      description: description.trim(),
      type,
      gender,
      weight: Number(weight.replace(',', '.')),
    };
    if (age.trim()) {
      payload.age = Number(age);
    }

    setLoading(true);
    try {
      const created = await petRemoteRepository.institutionCreatePet(payload);
      if (created?.id && image) {
        const formData = new FormData();
        formData.append('images', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
        await petRemoteRepository.updateImages(created.id, formData);
      }
      toast.success('Pet cadastrado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível cadastrar o pet.');
      return;
    } finally {
      setLoading(false);
    }
  }, [validate, name, description, type, gender, age, weight, image, setLoading, toast, navigation]);

  return {
    // Estados
    name,
    description,
    type,
    gender,
    age,
    weight,
    image,
    loading,
    isInstitution,
    
    // Handlers
    setName,
    setDescription,
    setType,
    setGender,
    setAge,
    setWeight,
    pickImage,
    handleSubmit,
  };
}

