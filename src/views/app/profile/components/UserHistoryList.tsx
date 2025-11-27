import React, { useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../../theme/Themes';

import { useHistoryList } from './history/useHistoryList';
import { buildTimelineRows, TimelineRow } from './history/buildTimelineRows';
import { HistoryHeader } from './history/HistoryHeader';
import { HistoryCard } from './history/HistoryCard';
import { EmptyState } from './history/EmptyState';
import { LoadingState } from './history/LoadingState';

interface UserHistoryListProps {
  accountId: string;
}

export default function UserHistoryList({ accountId }: UserHistoryListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { items, loading, refreshing, load, onRefresh } = useHistoryList(accountId);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const timelineRows = useMemo(() => buildTimelineRows(items), [items]);

  const renderItem = useCallback(
    ({ item }: { item: TimelineRow }) => {
      if (item.type === 'header') {
        return <HistoryHeader label={item.label} COLORS={COLORS} />;
      }
      return <HistoryCard entry={item.history} COLORS={COLORS} />;
    },
    [COLORS]
  );

  const keyExtractor = useCallback((item: TimelineRow) => item.key, []);

  const contentContainerStyle = useMemo(
    () =>
      timelineRows.length === 0
        ? { flexGrow: 1, justifyContent: 'center' as const, padding: 24 }
        : { paddingTop: 8, paddingBottom: 24, paddingHorizontal: 4 },
    [timelineRows.length]
  );

  if (loading && !refreshing && items.length === 0) {
    return <LoadingState COLORS={COLORS} />;
  }
  console.log(timelineRows);
  return (
    <View style={styles.container}>
    <FlatList
      data={timelineRows}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={contentContainerStyle}
      ListEmptyComponent={
        !loading && !refreshing ? <EmptyState COLORS={COLORS} /> : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListFooterComponent={
        loading && !refreshing && items.length > 0 ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={COLORS.primary} size="small" />
          </View>
        ) : null
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
    </View>
  );
}

const makeStyles = (COLORS: typeof lightTheme.colors | typeof darkTheme.colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    footerLoading: {
      paddingVertical: 20,
      alignItems: 'center',
    },
  });
