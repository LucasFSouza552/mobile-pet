import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Linking } from "react-native";
import { useAccount } from "../../../context/AccountContext";
import { useTheme } from "../../../context/ThemeContext";
import { notificationRemoteRepository } from "../../../data/remote/repositories/notificationRemoteRepository";
import { pictureRepository } from "../../../data/remote/repositories/pictureRemoteRepository";
import { INotification } from "../../../models/INotification";
import { ThemeColors } from "../../../theme/types";
import { formatDate } from "../../../utils/date";
import { useToast } from "../../../hooks/useToast";
import { SafeAreaView } from "react-native-safe-area-context";
export default function InstitutionNotifications({ navigation }: any) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { account, loading } = useAccount();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await notificationRemoteRepository.fetchAll();
      setNotifications(list);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || "Não foi possível carregar as notificações.");
      return;
    } finally {
      setLoadingList(false);
      setRefreshing(false);
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
          iconColor: COLORS.iconBackground,
        };
      case "info":
        return {
          icon: "info-circle",
          label: "Informação",
          backgroundColor: "#3b82f6",
          iconColor: COLORS.iconBackground,
        };
      case "like":
        return {
          icon: "heart",
          label: "Curtida",
          backgroundColor: "#ec4899",
          iconColor: COLORS.iconBackground,
        };
      default:
        return {
          icon: "bell",
          label: type.charAt(0).toUpperCase() + type.slice(1),
          backgroundColor: COLORS.primary,
          iconColor: COLORS.iconBackground,
        };
    }
  };

  const renderNotification = ({ item }: { item: INotification }) => {
    const sender =
      item.sender && typeof item.sender !== "string" ? item.sender : null;
    const senderName = sender?.name || "Usuário";
    const senderEmail = sender?.email;
    const senderPhone = sender?.phone_number;
    const senderRole =
      sender?.role ? ` (${sender.role.charAt(0).toUpperCase()}${sender.role.slice(1)})` : "";

    const typeConfig = getTypeConfig(item.type);

    const hasValidCoordinates =
      typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      !isNaN(item.latitude) &&
      !isNaN(item.longitude) &&
      item.latitude >= -90 &&
      item.latitude <= 90 &&
      item.longitude >= -180 &&
      item.longitude <= 180;

    const handleOpenInMaps = async () => {
      if (!hasValidCoordinates) return;
      const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          toast.error("Erro", "Não foi possível abrir o mapa.");
        }
      } catch (error) {
        toast.error("Erro", "Não foi possível abrir o mapa.");
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={pictureRepository.getSource(item.image)} style={styles.cardImage} />
          <View style={styles.imageOverlay}>
            <View style={[styles.alertBadge, { backgroundColor: typeConfig.backgroundColor }]}>
              <FontAwesome5 name={typeConfig.icon as any} size={14} color={typeConfig.iconColor} />
              <Text style={styles.alertBadgeText}>{typeConfig.label}</Text>
            </View>
            <View style={styles.timeContainer}>
              <FontAwesome5 name="clock" size={12} color={COLORS.iconBackground} />
              <Text style={styles.cardTime}>{formatDate(item.createdAt, { style: 'compact' })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.cardTitle}>{item.content}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                <FontAwesome5 name="user" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoLabel}>Usuário</Text>
                <Text style={styles.infoValue}>{senderName + senderRole}</Text>
              </View>
            </View>

            {senderEmail ? (
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                  <FontAwesome5 name="envelope" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoItemContent}>
                  <Text style={styles.infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>{senderEmail}</Text>
                </View>
              </View>
            ) : null}

            {senderPhone ? (
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                  <FontAwesome5 name="phone" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoItemContent}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{senderPhone}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <FontAwesome5 name="map-marker-alt" size={16} color={hasValidCoordinates ? COLORS.primary : COLORS.text} />
            <Text style={styles.mapLabel}>Localização</Text>
          </View>
          {hasValidCoordinates ? (
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenInMaps}>
              <FontAwesome5 name="directions" size={16} color={COLORS.iconBackground} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mapButtonTitle}>Abrir no Google Maps</Text>
                <Text style={styles.mapButtonSubtitle}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
              </View>
              <FontAwesome5 name="external-link-alt" size={14} color={COLORS.iconBackground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.mapErrorContainer}>
              <FontAwesome5 name="exclamation-circle" size={24} color={COLORS.text} style={{ opacity: 0.5 }} />
              <Text style={styles.mapErrorText}>Localização não disponível</Text>
            </View>
          )}
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
        <Text style={styles.headerTitle}>Notificações</Text>
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
          keyExtractor={(item) => item.id}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={3}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name="bell-slash" size={64} color={COLORS.text} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyTitle}>Nenhuma notificação ainda</Text>
              <Text style={styles.emptyText}>
                Quando usuários enviarem notificações sobre animais em risco, eles aparecerão aqui.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors) {
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
      backgroundColor: COLORS.tertiary,
      borderRadius: 20,
      marginBottom: 20,
      marginHorizontal: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    imageContainer: {
      width: "100%",
      height: 280,
      position: "relative",
      backgroundColor: COLORS.iconBackground,
    },
    cardImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    alertBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
    alertBadgeText: {
      color: COLORS.iconBackground,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 12,
    },
    cardTime: {
      color: COLORS.iconBackground,
      fontSize: 12,
      fontWeight: "600",
    },
    infoSection: {
      padding: 20,
      backgroundColor: COLORS.tertiary,
    },
    cardTitle: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 24,
      marginBottom: 20,
    },
    infoGrid: {
      gap: 16,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    infoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    infoItemContent: {
      flex: 1,
    },
    infoLabel: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    infoValue: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: "600",
    },
    mapSection: {
      padding: 20,
      paddingTop: 0,
      backgroundColor: COLORS.tertiary,
    },
    mapHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    mapLabel: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    mapContainer: {
      height: 0,
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
    mapErrorContainer: {
      height: 180,
      borderRadius: 16,
      backgroundColor: COLORS.iconBackground,
      borderWidth: 2,
      borderColor: COLORS.primary + "30",
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    mapErrorText: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 14,
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 12,
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
    },
    mapButtonTitle: {
      color: COLORS.iconBackground,
      fontSize: 16,
      fontWeight: '700',
    },
    mapButtonSubtitle: {
      color: COLORS.iconBackground,
      opacity: 0.8,
      fontSize: 12,
    },
  });
}
