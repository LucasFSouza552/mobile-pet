import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { useTheme } from '../../../../context/ThemeContext';

interface InstitutionDesiredPetsListProps {
  institutionId: string;
}

type AdoptionRequest = {
  id?: string;
  account?: { id?: string; name?: string; email?: string };
  pet?: any;
  createdAt?: string;
};

export default function InstitutionDesiredPetsList({ institutionId }: InstitutionDesiredPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
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
    return found?.reqs ?? [];
  }, [grouped, selectedPetId]);

  const handleAccept = async (petId: string, adopterId?: string) => {
    if (!adopterId) return;
    try {
      setProcessing(`${petId}-${adopterId}`);
      await petRemoteRepository.acceptPetAdoption(petId, adopterId);
      await load();
      setSelectedPetId(null);
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
            <TouchableOpacity style={styles.manageBtn} onPress={() => setSelectedPetId(item?.pet?.id)}>
              <Text style={styles.manageBtnText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={grouped.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined}
      />

      <Modal visible={!!selectedPetId} transparent animationType="fade" onRequestClose={() => setSelectedPetId(null)}>
        <View style={styles.modalRoot}>
          <View style={[styles.modalCard, { backgroundColor: COLORS.bg }]}>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Solicitações de Adoção</Text>
            <FlatList
              data={currentRequests}
              keyExtractor={(r, i) => String(r.id || i)}
              renderItem={({ item }) => {
                const acc = item?.account;
                const reqId = `${selectedPetId}-${acc?.id || ''}`;
                const isProc = processing === reqId;
                return (
                  <View style={styles.requestRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reqName, { color: COLORS.text }]}>{acc?.name || 'Usuário'}</Text>
                      {!!acc?.email && <Text style={[styles.reqMeta, { color: COLORS.text }]}>{acc.email}</Text>}
                      {!!item?.createdAt && (
                        <Text style={[styles.reqMeta, { color: COLORS.text }]}>
                          Solicitado em: {new Date(item.createdAt as any).toLocaleDateString('pt-BR')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.reqActions}>
                      <TouchableOpacity
                        onPress={() => handleAccept(selectedPetId!, acc?.id)}
                        disabled={isProc}
                        style={[styles.reqBtn, { backgroundColor: '#10b981', opacity: isProc ? 0.6 : 1 }]}
                      >
                        <Text style={styles.reqBtnText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleReject(selectedPetId!, acc?.id)}
                        disabled={isProc}
                        style={[styles.reqBtn, { backgroundColor: '#ef4444', opacity: isProc ? 0.6 : 1 }]}
                      >
                        <Text style={styles.reqBtnText}>Negar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
            <TouchableOpacity onPress={() => setSelectedPetId(null)} style={styles.closeBtn}>
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
      maxHeight: '80%',
      borderRadius: 12,
      padding: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    requestRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.tertiary,
      gap: 10,
    },
    reqName: {
      fontWeight: '700',
      marginBottom: 2,
    },
    reqMeta: {
      opacity: 0.8,
      fontSize: 12,
    },
    reqActions: {
      flexDirection: 'row',
      gap: 8,
    },
    reqBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
    },
    reqBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
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


