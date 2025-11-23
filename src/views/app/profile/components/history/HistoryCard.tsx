import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { IHistory } from '../../../../../models/IHistory';
import { darkTheme, lightTheme } from '../../../../../theme/Themes';
import {
  getTypeMeta,
  getStatusMeta,
  formatCurrency,
  getHistoryDescription,
} from './historyUtils';
import { formatHour } from '../../../../../utils/date';

interface HistoryCardProps {
  entry: IHistory;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
}

export const HistoryCard = React.memo<HistoryCardProps>(({ entry, COLORS }) => {
  const navigation = useNavigation();
  const styles = makeStyles(COLORS);

  const meta = getTypeMeta(entry.type);
  const statusInfo = getStatusMeta(entry.status);
  const hasAmount = entry.amount && (entry.type === 'donation' || entry.type === 'sponsorship');
  const formattedAmount = hasAmount ? formatCurrency(entry.amount) : null;
  const hasPaymentUrl = !!entry.urlPayment;
  const description = getHistoryDescription(entry);
  const hour = formatHour(entry.createdAt);

  const handlePress = useCallback(() => {
    if (hasPaymentUrl && entry.urlPayment) {
      (navigation as any).navigate('DonationWebView', { url: entry.urlPayment });
    }
  }, [hasPaymentUrl, entry.urlPayment, navigation]);

  const cardStyle = hasPaymentUrl
    ? [styles.card, styles.cardClickable]
    : styles.card;

  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: `${meta.accent}15` }]}>
        <FontAwesome5 name={meta.icon} size={20} color={meta.accent} solid />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{meta.label}</Text>
            {formattedAmount && (
              <Text style={[styles.amount, { color: meta.accent }]}>
                {formattedAmount}
              </Text>
            )}
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <FontAwesome5 name="clock" size={10} color={COLORS.text} style={{ opacity: 0.5 }} />
            <Text style={styles.meta}>{hour}</Text>
          </View>
          {hasPaymentUrl && (
            <View style={styles.paymentLink}>
              <FontAwesome5 name="external-link-alt" size={12} color={COLORS.primary} />
              <Text style={styles.paymentText}>Abrir pagamento</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  if (hasPaymentUrl) {
    return (
      <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}, (prevProps, nextProps) => {
  return (
    prevProps.entry.id === nextProps.entry.id &&
    prevProps.entry.status === nextProps.entry.status &&
    prevProps.entry.urlPayment === nextProps.entry.urlPayment &&
    prevProps.COLORS === nextProps.COLORS
  );
});

HistoryCard.displayName = 'HistoryCard';

const makeStyles = (COLORS: typeof lightTheme.colors | typeof darkTheme.colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: 14,
      padding: 16,
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: COLORS.tertiary,
      borderWidth: 1,
      borderColor: COLORS.primary + '15',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardClickable: {
      borderColor: COLORS.primary + '40',
      borderWidth: 1.5,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      gap: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    titleContainer: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: -0.3,
    },
    amount: {
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: -0.5,
    },
    description: {
      color: COLORS.text,
      opacity: 0.85,
      fontSize: 14,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    meta: {
      color: COLORS.text,
      opacity: 0.5,
      fontSize: 12,
      fontWeight: '500',
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      minWidth: 80,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    paymentLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: COLORS.primary + '15',
    },
    paymentText: {
      color: COLORS.primary,
      fontSize: 11,
      fontWeight: '600',
    },
  });

