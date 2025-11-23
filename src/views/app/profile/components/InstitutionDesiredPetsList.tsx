import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { useTheme } from '../../../../context/ThemeContext';
import { formatDateOnly } from '../../../../utils/date';

interface InstitutionDesiredPetsListProps {
  institutionId: string;
}

type AdoptionRequest = {
  id?: string;
  account?: { id?: string; name?: string; email?: string };
  pet?: any;
  createdAt?: string;
  status?: string;
};

export default function InstitutionDesiredPetsList({ institutionId }: InstitutionDesiredPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await petRemoteRepository.getRequestedAdoptions(institutionId);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [institutionId])
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { pet: any; reqs: AdoptionRequest[] }>();
    for (const req of requests) {
      const status = (req as any)?.status ?? (req as any)?.history?.status;
      if (status && status !== 'pending') continue;
      const pet = (req as any)?.pet;
      const petId: string | undefined = pet?.id;
      if (!petId) continue;
      if (pet?.adopted) continue;
      if (!map.has(petId)) {
        map.set(petId, { pet, reqs: [req] });
      } else {
        map.get(petId)!.reqs.push(req);
      }
    }
    return Array.from(map.values());
  }, [requests]);

  const currentRequests = useMemo(() => {
    if (!selectedPetId) return [];
    const found = grouped.find(g => g.pet?.id === selectedPetId);
    return (found?.reqs ?? []).filter(req => {
      const status = (req as any)?.status ?? (req as any)?.history?.status;
      return !status || status === 'pending';
    });
  }, [grouped, selectedPetId]);

  const handleAccept = async (petId: string, adopterId?: string) => {
    if (!adopterId) return;
    try {
      setProcessing(`${petId}-${adopterId}`);
      await petRemoteRepository.acceptPetAdoption(petId, adopterId);
      await load();
      setSelectedPetId(null);
      setSelectedPet(null);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (petId: string, adopterId?: string) => {
    try {
      setProcessing(`${petId}-${adopterId || ''}`);
      await petRemoteRepository.rejectPetAdoption(petId, adopterId);
      await load();
      setSelectedPetId(null);
      setSelectedPet(null);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <FlatList
        data={grouped}
        keyExtractor={(item, index) => String(item?.pet?.id ?? index)}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Nenhum pet desejado ainda.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <Image source={pictureRepository.getSource(item?.pet?.avatar ?? item?.pet?.images?.[0])} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{item?.pet?.name ?? 'Pet'}</Text>
              {!!item?.pet?.type ? <Text style={styles.petSub}>{item.pet.type}</Text> : null}
            </View>
            <View style={styles.requestsBadge}>
              <Text style={styles.requestsBadgeText}>{item.reqs.length}</Text>
            </View>
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => {
                setSelectedPetId(item?.pet?.id ?? null);
                setSelectedPet(item?.pet ?? null);
              }}
            >
              <Text style={styles.manageBtnText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={grouped.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined}
      />

      <Modal
        visible={!!selectedPetId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedPetId(null);
          setSelectedPet(null);
        }}
      >
        <View style={styles.modalRoot}>
          <View style={[styles.modalCard, { backgroundColor: COLORS.quinary }]}>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Solicitações de Adoção</Text>

            {selectedPet ? (
              <View style={styles.modalPetHeader}>
                <Image
                  source={pictureRepository.getSource(selectedPet?.avatar ?? selectedPet?.images?.[0])}
                  style={styles.modalPetImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalPetName, { color: COLORS.text }]}>{selectedPet?.name ?? 'Pet'}</Text>
                  <View style={styles.modalPetBadges}>
                    {!!selectedPet?.type && (
                      <View style={[styles.petBadge, { backgroundColor: COLORS.primary + '33' }]}>
                        <Text style={[styles.petBadgeText, { color: COLORS.primary }]}>{selectedPet.type}</Text>
                      </View>
                    )}
                    {!!selectedPet?.gender && (
                      <View style={[styles.petBadge, { backgroundColor: COLORS.tertiary }]}>
                        <Text style={[styles.petBadgeText, { color: COLORS.text }]}>
                          {String(selectedPet.gender).toLowerCase() === 'female' ? 'Fêmea' : 'Macho'}
                        </Text>
                      </View>
                    )}
                    {typeof selectedPet?.age === 'number' && (
                      <View style={[styles.petBadge, { backgroundColor: COLORS.tertiary }]}>
                        <Text style={[styles.petBadgeText, { color: COLORS.text }]}>
                          {selectedPet.age} ano{selectedPet.age === 1 ? '' : 's'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {!!selectedPet?.description && (
                    <Text style={[styles.modalPetDescription, { color: COLORS.text }]}>
                      {selectedPet.description}
                    </Text>
                  )}
                </View>
              </View>
            ) : null}

            <Text style={[styles.modalSubtitle, { color: COLORS.text }]}>
              Escolha uma solicitação para aprovar ou negar a adoção.
            </Text>
            <View style={[styles.requestsWrapper]}>
              <FlatList
                data={currentRequests}
                keyExtractor={(r, i) => String(r.id || i)}
                contentContainerStyle={currentRequests.length === 0 ? styles.requestsEmptyContainer : undefined}
                ListEmptyComponent={
                  <View style={styles.modalEmptyBox}>
                    <Text style={[styles.modalEmptyTitle, { color: COLORS.text }]}>Sem pedidos pendentes</Text>
                    <Text style={[styles.modalEmptyText, { color: COLORS.text }]}>
                      Assim que alguém solicitar este pet você verá os dados aqui.    
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const acc = item?.account;
                  const reqId = `${selectedPetId}-${acc?.id || ''}`;
                  const isProc = processing === reqId;
                  const firstLetter = (acc?.name || acc?.email || '?').charAt(0).toUpperCase();
                  return (
                    <View style={[styles.requestRow, { borderColor: COLORS.tertiary }]}>
                      <View style={styles.reqHeader}>
                        <View style={[styles.reqAvatar, { backgroundColor: COLORS.primary + '33' }]}>
                          <Text style={[styles.reqAvatarText, { color: COLORS.primary }]}>{firstLetter}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.reqName, { color: COLORS.text }]}>{acc?.name || 'Usuário'}</Text>
                          {!!acc?.email && <Text style={[styles.reqMeta, { color: COLORS.text }]}>{acc.email}</Text>}
                          {!!item?.createdAt && (
                            <Text style={[styles.reqMeta, { color: COLORS.text }]}>
                              Solicitado em {formatDateOnly(item.createdAt as any)}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.reqActions}>
                        <TouchableOpacity
                          onPress={() => handleAccept(selectedPetId!, acc?.id)}
                          disabled={isProc}
                          style={[
                            styles.reqBtn,
                            styles.reqBtnApprove,
                            { opacity: isProc ? 0.5 : 1, backgroundColor: '#10b981' },
                          ]}
                        >
                          <Text style={styles.reqBtnText}>Aprovar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleReject(selectedPetId!, acc?.id)}
                          disabled={isProc}
                          style={[
                            styles.reqBtn,
                            styles.reqBtnReject,
                            { opacity: isProc ? 0.5 : 1, backgroundColor: '#ef4444' },
                          ]}
                        >
                          <Text style={styles.reqBtnText}>Negar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedPetId(null);
                setSelectedPet(null);
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.tertiary,
      padding: 10,
      borderRadius: 12,
      marginBottom: 10,
      gap: 10,
    },
    petImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      backgroundColor: COLORS.bg,
    },
    petInfo: {
      flex: 1,
    },
    petName: {
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 2,
    },
    petSub: {
      color: COLORS.text,
      opacity: 0.8,
      fontSize: 12,
    },
    requestsBadge: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      marginRight: 6,
    },
    requestsBadgeText: {
      color: COLORS.bg,
      fontWeight: '700',
    },
    manageBtn: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    manageBtnText: {
      color: COLORS.bg,
      fontWeight: '700',
    },
    emptyText: {
      textAlign: 'center',
      color: COLORS.text,
      opacity: 0.8,
      marginVertical: 12,
    },
    modalRoot: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    modalCard: {
      width: '100%',
      maxHeight: '85%',
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: COLORS.primary + '33',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 8 },
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    modalPetHeader: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
      alignItems: 'flex-start',
    },
    modalPetImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: COLORS.bg,
    },
    modalPetName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    modalPetBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 6,
    },
    petBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    petBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    modalPetDescription: {
      fontSize: 12,
      opacity: 0.8,
    },
    modalSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 12,
    },
    requestsWrapper: {
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 12,
    },
    requestsEmptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 32,
    },
    modalEmptyBox: {
      alignItems: 'center',
      gap: 4,
    },
    reqName: {
      fontWeight: '700',
      marginBottom: 2,
    },
    reqMeta: {
      opacity: 0.8,
      fontSize: 12,
    },
    requestRow: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 10,
      gap: 12,
      backgroundColor: COLORS.quarternary,
    },
    reqHeader: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    reqAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reqAvatarText: {
      fontSize: 16,
      fontWeight: '700',
    },
    reqActions: {
      flexDirection: 'row',
      gap: 10,
    },
    reqBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reqBtnApprove: {
      shadowColor: '#10b981',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    reqBtnReject: {
      shadowColor: '#ef4444',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    reqBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
    },
    modalEmptyTitle: {
      fontWeight: '700',
      fontSize: 16,
    },
    modalEmptyText: {
      textAlign: 'center',
      opacity: 0.7,
    },
    closeBtn: {
      marginTop: 12,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: COLORS.tertiary,
    },
    closeBtnText: {
      color: COLORS.text,
      fontWeight: '700',
    },
  });
}


