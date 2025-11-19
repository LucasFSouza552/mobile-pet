import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface DonationWebViewProps {
  navigation: any;
  route: { params?: { url?: string } };
}

export default function DonationWebView({ navigation, route }: DonationWebViewProps) {
  const { COLORS } = useTheme();
  const url = route?.params?.url || '';

  return (
    <View style={[styles.container, { backgroundColor: COLORS.secondary }]}>
      <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        <TouchableOpacity
          accessibilityLabel="Voltar"
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: COLORS.tertiary }]}
        >
          <FontAwesome name="chevron-left" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.bg }]}>Pagamento</Text>
        <View style={{ width: 36 }} />
      </View>
      <WebView source={{ uri: url }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});


