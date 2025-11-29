import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Platform, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import { petSync } from '../../../data/sync/petSync';
import { accountSync } from '../../../data/sync/accountSync';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import { petInteractionRemoteRepository } from '../../../data/remote/repositories/petInteractionRemoteRepository';
import { useToast } from '../../../hooks/useToast';
import { useAccount } from '../../../context/AccountContext';
import { accountPetInteractionLocalRepository } from '../../../data/local/repositories/accountPetInteractionLocalRepository';

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
  const { account } = useAccount();
  const petId = route?.params?.petId || '';
  const [pet, setPet] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasAdoptionWish, setHasAdoptionWish] = useState(false);
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

  useEffect(() => {
    setActiveImageIndex(0);
  }, [petId]);

  const refreshInteractionState = useCallback(async () => {
    if (!account?.id || !petId) {
      setHasAdoptionWish(false);
      return;
    }

    try {
      const localInteraction = await accountPetInteractionLocalRepository.getByAccountAndPet(account.id, petId);

      if (localInteraction) {
        setHasAdoptionWish(localInteraction.status === 'liked');
        return;
      }

      const remoteInteractions = await petInteractionRemoteRepository.getInteractionByAccount(account.id);
      if (Array.isArray(remoteInteractions)) {
        const match = remoteInteractions.find((interaction: any) => {
          const petRef = interaction?.pet;
          const interactionPetId = typeof petRef === 'string' ? petRef : petRef?.id;
          return interactionPetId === petId;
        });

        setHasAdoptionWish(match?.status === 'liked');
        return;
      }

      setHasAdoptionWish(false);
    } catch (error) {
      console.error('Erro ao verificar interação do pet:', error);
      setHasAdoptionWish(false);
    }
  }, [account?.id, petId]);

  useEffect(() => {
    refreshInteractionState();
  }, [refreshInteractionState]);

  const formattedPhoneNumber = useMemo(() => {
    if (!institution?.phone_number) return '';
    const digits = institution.phone_number.replace(/\D/g, '');

    if (digits.length >= 11) {
      const ddi = digits.length > 11 ? `+${digits.slice(0, digits.length - 11)} ` : '';
      const dddOffset = digits.length > 11 ? digits.length - 11 : 0;
      const ddd = digits.slice(dddOffset, dddOffset + 2);
      const part1 = digits.slice(dddOffset + 2, dddOffset + 7);
      const part2 = digits.slice(dddOffset + 7, dddOffset + 11);
      return `${ddi}(${ddd}) ${part1}-${part2}`;
    }

    if (digits.length >= 10) {
      const ddd = digits.slice(0, 2);
      const part1 = digits.slice(2, 6);
      const part2 = digits.slice(6);
      return `(${ddd}) ${part1}-${part2}`;
    }

    return institution.phone_number;
  }, [institution?.phone_number]);

  const handleCancelAdoption = useCallback(async () => {
    if (!petId || cancelling) return;

    try {
      setCancelling(true);
      await petInteractionRemoteRepository.undoInteraction(petId);
      toast.success('Sucesso', 'Adoção cancelada com sucesso');
      setHasAdoptionWish(false);
      navigation.navigate('Main', { screen: 'Profile' });
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao cancelar adoção');
    } finally {
      setCancelling(false);
    }
  }, [petId, toast, navigation, cancelling]);

  const petImages = useMemo<string[]>(() => {
    if (pet?.images?.length) {
      return pet.images;
    }

    if (pet?.avatar) {
      return [pet.avatar];
    }

    return [];
  }, [pet?.images, pet?.avatar]);

  const handleImageMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;

      if (!layoutMeasurement?.width) return;

      const index = Math.round(contentOffset.x / layoutMeasurement.width);
      setActiveImageIndex(index);
    },
    []
  );

  const buildPhonePayload = useCallback((phoneNumber?: string) => {
    if (!phoneNumber) return null;

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const normalized = cleanNumber.replace(/^0/, '');

    const formattedNumber = cleanNumber.startsWith('+')
      ? cleanNumber
      : `+55${normalized}`;

    return {
      cleanNumber,
      callNumber: formattedNumber,
      whatsappNumber: formattedNumber.replace(/^\+/, ''),
    };
  }, []);

  const handleWhatsappPress = useCallback(async () => {
    const payload = buildPhonePayload(institution?.phone_number);
    if (!payload) return;

    try {
      const whatsappUrl = `whatsapp://send?phone=${payload.whatsappNumber}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return;
      }

      const whatsappWebUrl = `https://wa.me/${payload.whatsappNumber}`;
      const canOpenWeb = await Linking.canOpenURL(whatsappWebUrl);

      if (canOpenWeb) {
        await Linking.openURL(whatsappWebUrl);
      } else {
        toast.error('Erro', 'WhatsApp não está instalado');
      }
    } catch (error) {
      toast.error('Erro', 'Não foi possível abrir o WhatsApp');
    }
  }, [buildPhonePayload, institution?.phone_number, toast]);

  const handleCallPress = useCallback(async () => {
    const payload = buildPhonePayload(institution?.phone_number);
    if (!payload) return;
    try {
      const phoneUrl = `tel:${payload.callNumber}`;

      await Linking.openURL(phoneUrl);

    } catch (error) {
      toast.error('Erro', 'Não foi possível fazer a ligação');
    }
  }, [buildPhonePayload, institution?.phone_number, toast]);

  const handleEmailPress = useCallback(async () => {
    if (!institution?.email) return;
    const mailUrl = `mailto:${institution.email}`;

    try {
      const canOpen = await Linking.canOpenURL(mailUrl);
      if (canOpen) {
        await Linking.openURL(mailUrl);
      } else {
        toast.error('Erro', 'Não foi possível abrir o email');
      }
    } catch (error) {
      toast.error('Erro', 'Não foi possível abrir o email');
    }
  }, [institution?.email, toast]);

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


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pet </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {petImages.length > 0 && (
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageMomentumScrollEnd}
              scrollEventThrottle={16}
            >
              {petImages.map((image, index) => (
                <View style={styles.imageContainer} key={`${image}-${index}`}>
                  <Image
                    source={pictureRepository.getSource(image)}
                    style={styles.petImage}
                  />
                </View>
              ))}
            </ScrollView>

            {petImages.length > 1 && (
              <View style={styles.carouselDots}>
                {petImages.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.carouselDot,
                      index === activeImageIndex && styles.carouselDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Pet</Text>

          <View style={[styles.cardSurface, styles.petCard]}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{pet?.name || 'Pet sem nome'}</Text>
                {pet?.description && (
                  <Text style={styles.heroDescription}>{pet.description}</Text>
                )}
              </View>

              {pet?.gender && (
                <View
                  style={[
                    styles.genderBadge,
                    pet?.gender?.toLowerCase() === 'female'
                      ? styles.genderBadgeFemale
                      : styles.genderBadgeMale,
                  ]}
                >
                  <FontAwesome5
                    name={pet?.gender?.toLowerCase() === 'female' ? 'venus' : 'mars'}
                    size={18}
                    color="#fff"
                  />
                </View>
              )}
            </View>

            <View style={styles.chipRow}>
              {pet?.type && (
                <View style={styles.chip}>
                  <FontAwesome5 name="paw" size={12} color="#fff" />
                  <Text style={styles.chipText}>{pet.type}</Text>
                </View>
              )}
              {typeof pet?.age === 'number' && (
                <View style={styles.chip}>
                  <FontAwesome5 name="birthday-cake" size={12} color="#fff" />
                  <Text style={styles.chipText}>
                    {pet.age} ano{pet.age === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statRow}>
              {pet?.weight && (
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <FontAwesome5 name="weight-hanging" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statLabel}>Peso</Text>
                  <Text style={styles.statValue}>{pet.weight} kg</Text>
                </View>
              )}
              {typeof pet?.age === 'number' && (
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <FontAwesome5 name="hourglass-half" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statLabel}>Idade</Text>
                  <Text style={styles.statValue}>
                    {pet.age} ano{pet.age === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {institution && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{institution.role === 'institution' ? 'Instituição' : 'Adotante'}</Text>
              {institution?.verified && (
                <View style={styles.inlineVerified}>
                  <FontAwesome5 name="check-circle" size={14} color="#166534" />
                  <Text style={styles.inlineVerifiedText}>Verificada</Text>
                </View>
              )}
            </View>

            <View style={styles.institutionStack}>
              <View style={[styles.cardSurface, styles.institutionCard]}>
                <View style={styles.institutionHeader}>
                  {institution?.avatar && (
                    <Image
                      source={pictureRepository.getSource(institution.avatar)}
                      style={styles.institutionAvatar}
                    />
                  )}
                  <View>
                    <Text style={styles.institutionName}>{institution?.name || 'Instituição'}</Text>
                    {institution?.email && (
                      <View style={styles.emailRow}>
                        <FontAwesome5 name="envelope" size={14} color={COLORS.primary} />
                        <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.8}>
                          <Text style={[styles.institutionAddress, styles.emailLink]}>
                            {institution.email}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {institution?.address && (
                  <>
                    <View style={styles.cardDivider} />
                    <View style={styles.addressBlock}>
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
                        <Text style={styles.institutionAddress}>CEP: {institution.address.cep}</Text>
                      )}
                    </View>
                  </>
                )}
              </View>

              {institution?.phone_number && (
                <View style={[styles.cardSurface, styles.contactCard]}>
                  <View style={styles.contactHeader}>
                    <View style={styles.iconCircle}>
                      <FontAwesome5 name="phone" size={16} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.contactLabel}>Telefone / WhatsApp</Text>
                      <Text style={styles.phoneNumber}>{formattedPhoneNumber}</Text>
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.contactActionButton}
                      onPress={handleWhatsappPress}
                      activeOpacity={0.8}
                    >
                      <FontAwesome5 name="whatsapp" size={20} color="#25D366" />
                      <Text style={styles.contactHintText}>Conversar</Text>
                    </TouchableOpacity>
                    <View style={styles.hintDivider} />
                    <TouchableOpacity
                      style={styles.contactActionButton}
                      onPress={handleCallPress}
                      activeOpacity={0.8}
                    >
                      <FontAwesome5 name="phone-alt" size={20} color={COLORS.primary} />
                      <Text style={styles.contactHintText}>Ligar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {hasAdoptionWish && !pet?.adopted && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
              onPress={handleCancelAdoption}
              disabled={cancelling}
              activeOpacity={0.7}
            >
              {cancelling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancelar adoção</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors) {
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
      width: SCREEN_WIDTH - 40,
      height: 300,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      backgroundColor: COLORS.iconBackground,
    },
    carouselContainer: {
      marginBottom: 24,
    },
    carouselDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    carouselDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: `${COLORS.tertiary}`,
    },
    carouselDotActive: {
      width: 18,
      backgroundColor: COLORS.primary,
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
    cardSurface: {
      backgroundColor: `${COLORS.primary}20`,
      borderRadius: 24,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: `${COLORS.primary}55`,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    petCard: {
      gap: 20,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    petName: {
      fontSize: 26,
      fontWeight: '800',
      color: COLORS.text,
    },
    heroDescription: {
      marginTop: 6,
      color: COLORS.text,
      opacity: 0.85,
      lineHeight: 20,
    },
    genderBadge: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: Platform.OS === 'android' ? 3 : 0,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    genderBadgeFemale: {
      backgroundColor: '#d946ef',
    },
    genderBadgeMale: {
      backgroundColor: '#3b82f6',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 18,
      paddingVertical: 8,
    },
    chipText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
    },
    cardDivider: {
      height: 1,
      width: '100%',
      backgroundColor: `${COLORS.text}22`,
    },
    statRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: `${COLORS.primary}30`,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${COLORS.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: 12,
      textTransform: 'uppercase',
      color: COLORS.text,
      opacity: 0.7,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    inlineVerified: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#dcfce7',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    inlineVerifiedText: {
      color: '#166534',
      fontWeight: '600',
      fontSize: 12,
    },
    institutionStack: {
      gap: 16,
    },
    institutionCard: {
      gap: 16,
    },
    institutionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    institutionAvatar: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: COLORS.iconBackground,
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
    emailLink: {
      textDecorationLine: 'underline',
      fontWeight: '600',
      color: COLORS.text,
    },
    emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addressBlock: {
      gap: 10,
      marginTop: 8,
    },
    contactCard: {
      marginTop: 8,
      gap: 14,
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 18,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactLabel: {
      fontSize: 12,
      color: COLORS.text,
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    phoneNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
    },
    contactActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    contactActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: `${COLORS.primary}18`,
    },
    contactHintText: {
      fontSize: 13,
      color: COLORS.text,
      opacity: 0.8,
    },
    hintDivider: {
      width: 1,
      height: 18,
      backgroundColor: `${COLORS.text}22`,
    },
    actionsContainer: {
      marginTop: 16,
    },
    cancelButton: {
      backgroundColor: '#dc2626',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonDisabled: {
      opacity: 0.6,
    },
    cancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}

