import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeColors } from '../../../../../theme/types';

interface EmptyStateProps {
  COLORS: ThemeColors;
}

export const EmptyState = React.memo<EmptyStateProps>(({ COLORS }) => {
  const styles = makeStyles(COLORS);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <FontAwesome5 name="history" size={48} color={COLORS.text} style={{ opacity: 0.3 }} />
      </View>
      <Text style={styles.title}>Sem atividades ainda</Text>
      <Text style={styles.text}>
        As ações que você fizer na plataforma aparecerão aqui.{'\n'}
        Adoções, doações e patrocínios ficarão registrados neste histórico.
      </Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const makeStyles = (COLORS: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 32,
    },
    icon: {
      marginBottom: 8,
    },
    title: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    text: {
      color: COLORS.text,
      opacity: 0.65,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
    },
  });

