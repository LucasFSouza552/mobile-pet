import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../../../../theme/Themes';

interface LoadingStateProps {
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  message?: string;
}

export const LoadingState = React.memo<LoadingStateProps>(({ COLORS, message = 'Carregando histórico...' }) => {
  const styles = makeStyles(COLORS);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
});

LoadingState.displayName = 'LoadingState';

const makeStyles = (COLORS: typeof lightTheme.colors | typeof darkTheme.colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    text: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 14,
    },
  });

