import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

import { historySync } from '../../../../data/sync/historySync';
import { IHistory } from '../../../../models/IHistory';
import { useTheme } from '../../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../../theme/Themes';

type TimelineRow =
  | { key: string; type: 'header'; label: string }
  | { key: string; type: 'item'; history: IHistory };

interface UserHistoryListProps {
  accountId: string;
}

const typeMeta = {
  adoption: { label: 'Adoção', icon: 'paw', accent: '#8b5cf6' },
  donation: { label: 'Doação', icon: 'hand-holding-heart', accent: '#f59e0b' },
  sponsorship: { label: 'Patrocínio', icon: 'handshake', accent: '#0ea5e9' },
};

const statusMeta = {
  pending: { label: 'Pendente', text: '#92400e', bg: '#fef3c7' },
  completed: { label: 'Concluído', text: '#166534', bg: '#dcfce7' },
  cancelled: { label: 'Cancelado', text: '#991b1b', bg: '#fee2e2' },
  refunded: { label: 'Reembolsado', text: '#0f172a', bg: '#e0f2fe' },
};

function formatDayLabel(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatHour(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getDescription(entry: IHistory) {
  const petObj = typeof (entry as any).pet === 'object' ? (entry as any).pet : null;
  const petName = petObj?.name;
  const institutionObj = typeof (entry as any).institution === 'object' ? (entry as any).institution : null;
  const institutionName = institutionObj?.name;

  switch (entry.type) {
    case 'adoption':
      if (entry.status === 'completed') {
        return petName ? `Adoção de ${petName} concluída` : 'Adoção concluída';
      }
      return petName ? `Solicitação de adoção para ${petName}` : 'Solicitação de adoção enviada';
    case 'donation':
      return entry.amount ? `Doou R$ ${Number(entry.amount).toFixed(2)} para o PetAmigo` : 'Contribuiu com a causa';
    case 'sponsorship':
      return institutionName
        ? `Patrocinou ${institutionName}`
        : entry.amount
        ? `Patrocinou uma instituição (R$ ${Number(entry.amount).toFixed(2)})`
        : 'Patrocínio para instituição';
    default:
      return 'Registro de atividade';
  }
}

export default function UserHistoryList({ accountId }: UserHistoryListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  const [items, setItems] = useState<IHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      await historySync.syncFromServer(accountId);
      const historyList = await historySync.getHistory(accountId);
      const uniqueMap = new Map<string, IHistory>();
      (historyList || []).forEach(item => {
        if (item?.id) {
          uniqueMap.set(item.id, item);
        }
      });
      const ordered = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(ordered);
    } catch (error) {
      console.log('[HistoryList] load error', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [accountId])
  );

  const timelineRows: TimelineRow[] = useMemo(() => {
    if (!items.length) return [];
    const map = new Map<string, IHistory[]>();
    items.forEach(item => {
      const label = formatDayLabel(item.createdAt) || 'Sem data';
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    });

    const rows: TimelineRow[] = [];
    for (const [label, entries] of map.entries()) {
      rows.push({ key: `header-${label}`, type: 'header', label });
      entries.forEach(entry => rows.push({ key: `item-${entry.id}`, type: 'item', history: entry }));
    }
    return rows;
  }, [items]);

  const renderRow = ({ item }: { item: TimelineRow }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.label}</Text>
        </View>
      );
    }

    const entry = item.history;
    const meta = typeMeta[entry.type] ?? { label: 'Atividade', icon: 'history', accent: COLORS.primary };
    const statusInfo =
      statusMeta[(entry.status as keyof typeof statusMeta) ?? 'pending'] ??
      statusMeta.pending;

    return (
      <View style={styles.historyCard}>
        <View style={[styles.historyIcon, { backgroundColor: `${meta.accent}22` }]}>
          <FontAwesome5 name={meta.icon as any} size={18} color={meta.accent} />
        </View>
        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{meta.label}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusPillText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.historyDescription}>{getDescription(entry)}</Text>
          <Text style={styles.historyMeta}>{formatHour(entry.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={timelineRows}
      keyExtractor={item => item.key}
      renderItem={renderRow}
      contentContainerStyle={
        timelineRows.length === 0 ? { flexGrow: 1, justifyContent: 'center', padding: 16 } : { paddingBottom: 16 }
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sem atividades ainda</Text>
            <Text style={styles.emptyText}>As ações que você fizer na plataforma aparecerão aqui.</Text>
          </View>
        ) : null
      }
      refreshing={loading}
      onRefresh={load}
      ListFooterComponent={
        loading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : null
      }
    />
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    sectionHeader: {
      paddingHorizontal: 4,
      paddingVertical: 6,
    },
    sectionHeaderText: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 12,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    historyCard: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      marginBottom: 10,
      borderRadius: 14,
      backgroundColor: COLORS.tertiary,
      borderWidth: 1,
      borderColor: COLORS.primary + '25',
    },
    historyIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyContent: {
      flex: 1,
      gap: 6,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    historyTitle: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 16,
    },
    historyDescription: {
      color: COLORS.text,
      opacity: 0.85,
      fontSize: 13,
    },
    historyMeta: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 12,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    emptyState: {
      alignItems: 'center',
      gap: 6,
    },
    emptyTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyText: {
      color: COLORS.text,
      opacity: 0.7,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
  });
}


