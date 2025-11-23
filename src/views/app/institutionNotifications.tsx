import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAccount } from "../../context/AccountContext";
import { useTheme } from "../../context/ThemeContext";
import { notificationRemoteRepository } from "../../data/remote/repositories/notificationRemoteRepository";
import { pictureRepository } from "../../data/remote/repositories/pictureRemoteRepository";
import { INotification } from "../../models/INotification";
import { darkTheme, lightTheme } from "../../theme/Themes";
import { formatDate } from "../../utils/date";

export default function InstitutionNotifications({ navigation }: any) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { account, loading } = useAccount();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await notificationRemoteRepository.fetchAll();
      setNotifications(list);
    } catch (error: any) {
      const message = error?.message || "Não foi possível carregar as notificações.";
      Toast.show({ type: "info", text1: message });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading && account?.role !== "institution") {
        navigation.goBack();
        return;
      }
      loadNotifications();
    }, [loading, account?.role, loadNotifications, navigation])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "warning":
        return {
          icon: "exclamation-triangle",
          label: "Alerta",
          backgroundColor: "#ef4444",
          iconColor: COLORS.bg,
        };
      case "info":
        return {
          icon: "info-circle",
          label: "Informação",
          backgroundColor: "#3b82f6",
          iconColor: COLORS.bg,
        };
      case "like":
        return {
          icon: "heart",
          label: "Curtida",
          backgroundColor: "#ec4899",
          iconColor: COLORS.bg,
        };
      default:
        return {
          icon: "bell",
          label: type.charAt(0).toUpperCase() + type.slice(1),
          backgroundColor: COLORS.primary,
          iconColor: COLORS.bg,
        };
    }
  };

  const renderNotification = ({ item }: { item: INotification }) => {
    const senderName = item.sender?.name || "Usuário";
    const senderEmail = item.sender?.email;
    const senderPhone = item.sender?.phone_number;
    const senderRole =
      item.sender?.role ? ` (${item.sender.role.charAt(0).toUpperCase()}${item.sender.role.slice(1)})` : "";
    
    const typeConfig = getTypeConfig(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={pictureRepository.getSource(item.image)} style={styles.cardImage} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.alertBadge, { backgroundColor: typeConfig.backgroundColor }]}>
              <FontAwesome5 name={typeConfig.icon as any} size={12} color={typeConfig.iconColor} />
              <Text style={styles.alertBadgeText}>{typeConfig.label}</Text>
            </View>
            <View style={styles.timeContainer}>
              <FontAwesome5 name="clock" size={11} color={COLORS.text} style={{ opacity: 0.5 }} />
              <Text style={styles.cardTime}>{formatDate(item.createdAt, { style: 'compact' })}</Text>
            </View>
          </View>
          
          <Text style={styles.cardTitle}>{item.content}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <FontAwesome5 name="user" size={14} color={COLORS.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Usuário</Text>
                <Text style={styles.infoValue}>{senderName + senderRole}</Text>
              </View>
            </View>
            
            {senderEmail ? (
              <View style={styles.infoRow}>
                <FontAwesome5 name="envelope" size={14} color={COLORS.primary} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>{senderEmail}</Text>
                </View>
              </View>
            ) : null}
            
            {senderPhone ? (
              <View style={styles.infoRow}>
                <FontAwesome5 name="phone" size={14} color={COLORS.primary} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{senderPhone}</Text>
                </View>
              </View>
            ) : null}
            
            <View style={styles.infoRow}>
              <FontAwesome5 name="map-marker-alt" size={14} color={COLORS.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Localização</Text>
                <Text style={styles.infoValue}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alertas</Text>
        <View style={{ width: 36 }} />
      </View>

      {loadingList && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando notificações...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name="bell-slash" size={64} color={COLORS.text} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyTitle}>Nenhum alerta ainda</Text>
              <Text style={styles.emptyText}>
                Quando usuários enviarem alertas sobre animais em risco, eles aparecerão aqui.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: COLORS.primary,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: COLORS.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 14,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 24,
    },
    card: {
      flexDirection: "row",
      backgroundColor: COLORS.tertiary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: COLORS.bg,
      marginRight: 16,
    },
    cardImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    alertBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    alertBadgeText: {
      color: COLORS.bg,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: COLORS.tertiary,
      borderRadius: 8,
    },
    cardTime: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 12,
      fontWeight: "600",
    },
    cardTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 22,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: COLORS.tertiary,
      marginVertical: 12,
      opacity: 0.3,
    },
    infoSection: {
      gap: 12,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    infoIcon: {
      marginTop: 2,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 2,
    },
    infoValue: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: "500",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 24,
      marginBottom: 8,
    },
    emptyText: {
      color: COLORS.text,
      opacity: 0.6,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: 40,
    },
  });
}

