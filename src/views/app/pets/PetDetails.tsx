import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../theme/Themes';
import { petSync } from '../../../data/sync/petSync';
import { accountSync } from '../../../data/sync/accountSync';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import { useToast } from '../../../hooks/useToast';

interface PetDetailsProps {
  navigation: any;
  route: {
    params?: {
      petId?: string;
    };
  };
}

export default function PetDetails(props: PetDetailsProps) {
  const { navigation, route } = props;
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const toast = useToast();
  const petId = route?.params?.petId || '';
  const [pet, setPet] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!petId || loadingRef.current) {
      if (!petId) {
        toast.error('Erro', 'Pet não identificado');
        navigation.goBack();
      }
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      
      const petData = await petSync.getById(petId);
      
      if (!petData) {
        toast.error('Erro', 'Pet não encontrado');
        navigation.goBack();
        return;
      }

      setPet(petData);

      if (petData?.account) {
        try {
          const accountId = typeof petData.account === 'string'
            ? petData.account 
            : (petData.account as any)?.id;
          
          if (accountId) {
            const institutionData = await accountSync.getAccount(accountId);
            setInstitution(institutionData);
          }
        } catch (error: any) {
          toast.handleApiError(error, error?.data?.message || 'Erro ao carregar instituição');
        }
      }
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao carregar informações do pet');
      navigation.goBack();
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [petId, navigation]);

  useEffect(() => {
    loadData();
  }, [petId]);

  const handlePhonePress = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber) return;

    // Remove caracteres não numéricos, exceto +
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Se não começar com +, adiciona código do Brasil
    const formattedNumber = cleanNumber.startsWith('+') 
      ? cleanNumber 
      : `+55${cleanNumber.replace(/^0/, '')}`;

    // Remove o + para o formato do WhatsApp
    const whatsappNumber = formattedNumber.replace(/^\+/, '');

    Alert.alert(
      'Contato',
      'Como deseja entrar em contato?',
      [
        {
          text: 'WhatsApp',
          onPress: async () => {
            try {
              const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}`;
              const canOpen = await Linking.canOpenURL(whatsappUrl);
              
              if (canOpen) {
                await Linking.openURL(whatsappUrl);
              } else {
                // Tenta abrir WhatsApp Web
                const whatsappWebUrl = `https://wa.me/${whatsappNumber}`;
                const canOpenWeb = await Linking.canOpenURL(whatsappWebUrl);
                
                if (canOpenWeb) {
                  await Linking.openURL(whatsappWebUrl);
                } else {
                  toast.error('Erro', 'WhatsApp não está instalado');
                }
              }
            } catch (error) {
              console.error('Erro ao abrir WhatsApp:', error);
              toast.error('Erro', 'Não foi possível abrir o WhatsApp');
            }
          },
        },
        {
          text: 'Ligar',
          onPress: async () => {
            try {
              const phoneUrl = `tel:${cleanNumber}`;
              const canOpen = await Linking.canOpenURL(phoneUrl);
              
              if (canOpen) {
                await Linking.openURL(phoneUrl);
              } else {
                toast.error('Erro', 'Não foi possível fazer a ligação');
              }
            } catch (error) {
              toast.error('Erro', 'Não foi possível fazer a ligação');
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }, [toast]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pet</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando informações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pet</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pet não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = pet?.images?.[0] || pet?.avatar;
  const genderText = pet?.gender?.toLowerCase() === 'female' ? 'Fêmea' : pet?.gender?.toLowerCase() === 'male' ? 'Macho' : pet?.gender || 'Não informado';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pet</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {firstImage && (
          <View style={styles.imageContainer}>
            <Image
              source={pictureRepository.getSource(firstImage)}
              style={styles.petImage}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Pet</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{pet?.name || 'Não informado'}</Text>
          </View>

          {pet?.type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{pet.type}</Text>
            </View>
          )}

          {pet?.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gênero:</Text>
              <Text style={styles.infoValue}>{genderText}</Text>
            </View>
          )}

          {typeof pet?.age === 'number' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Idade:</Text>
              <Text style={styles.infoValue}>{pet.age} ano{pet.age === 1 ? '' : 's'}</Text>
            </View>
          )}

          {pet?.weight && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Peso:</Text>
              <Text style={styles.infoValue}>{pet.weight} kg</Text>
            </View>
          )}

          {pet?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.infoLabel}>Descrição:</Text>
              <Text style={styles.descriptionText}>{pet.description}</Text>
            </View>
          )}
        </View>

        {institution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instituição</Text>
            
            <View style={styles.institutionCard}>
              {institution?.avatar && (
                <Image
                  source={pictureRepository.getSource(institution.avatar)}
                  style={styles.institutionAvatar}
                />
              )}
              <View style={styles.institutionInfo}>
                <Text style={styles.institutionName}>{institution?.name || 'Instituição'}</Text>
                
                {institution?.address && (
                  <>
                    {institution.address.city && institution.address.state && (
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="map-marker-alt" size={14} color={COLORS.primary} />
                        <Text style={styles.institutionAddress}>
                          {institution.address.city}, {institution.address.state}
                        </Text>
                      </View>
                    )}
                    
                    {institution.address.street && (
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="road" size={14} color={COLORS.primary} />
                        <Text style={styles.institutionAddress}>
                          {institution.address.street}
                          {institution.address.number && `, ${institution.address.number}`}
                          {institution.address.neighborhood && ` - ${institution.address.neighborhood}`}
                        </Text>
                      </View>
                    )}
                    
                    {institution.address.cep && (
                      <View style={styles.infoRow}>
                        <Text style={styles.institutionAddress}>CEP: {institution.address.cep}</Text>
                      </View>
                    )}
                  </>
                )}

                {institution?.phone_number && (
                  <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => handlePhonePress(institution.phone_number)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="phone" size={14} color={COLORS.primary} />
                    <Text style={[styles.institutionAddress, styles.phoneLink]}>
                      {institution.phone_number}
                    </Text>
                    <FontAwesome5 name="whatsapp" size={14} color="#25D366" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                )}

                {institution?.email && (
                  <View style={styles.infoRow}>
                    <FontAwesome5 name="envelope" size={14} color={COLORS.primary} />
                    <Text style={styles.institutionAddress}>{institution.email}</Text>
                  </View>
                )}

                {institution?.verified && (
                  <View style={styles.verifiedBadge}>
                    <FontAwesome5 name="check-circle" size={14} color="#166534" />
                    <Text style={styles.verifiedText}>Verificada</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: COLORS.primary,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: COLORS.text,
      fontSize: 16,
      opacity: 0.7,
    },
    imageContainer: {
      width: '100%',
      height: 300,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      backgroundColor: COLORS.bg,
    },
    petImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
      opacity: 0.7,
      minWidth: 80,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.text,
      flex: 1,
    },
    descriptionContainer: {
      marginTop: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.85,
      lineHeight: 20,
      marginTop: 4,
    },
    institutionCard: {
      backgroundColor: COLORS.tertiary,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      gap: 16,
    },
    institutionAvatar: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: COLORS.bg,
    },
    institutionInfo: {
      flex: 1,
      gap: 8,
    },
    institutionName: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 4,
    },
    institutionAddress: {
      fontSize: 13,
      color: COLORS.text,
      opacity: 0.8,
      flex: 1,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: '#dcfce7',
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    verifiedText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#166534',
    },
    phoneLink: {
      textDecorationLine: 'underline',
      color: COLORS.primary,
      fontWeight: '600',
    },
  });
}

