import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../../../../../theme/types';

interface HistoryHeaderProps {
  label: string;
  COLORS: ThemeColors;
}

export const HistoryHeader = React.memo<HistoryHeaderProps>(({ label, COLORS }) => {
  const styles = makeStyles(COLORS);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
});

HistoryHeader.displayName = 'HistoryHeader';

const makeStyles = (COLORS: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
      marginHorizontal: 4,
      gap: 12,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.text,
      opacity: 0.15,
    },
    text: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 13,
      textTransform: 'capitalize',
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  });

