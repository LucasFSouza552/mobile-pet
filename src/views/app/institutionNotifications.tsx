import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useAccount } from "../../context/AccountContext";
import { useTheme } from "../../context/ThemeContext";
import { notificationRemoteRepository } from "../../data/remote/repositories/notificationRemoteRepository";
import { pictureRepository } from "../../data/remote/repositories/pictureRemoteRepository";
import { INotification } from "../../models/INotification";

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

  const renderNotification = ({ item }: { item: INotification }) => {
    const senderName = item.sender?.name || "Usuário";
    const senderEmail = item.sender?.email;
    const senderPhone = item.sender?.phone_number;
    const senderRole =
      item.sender?.role ? ` (${item.sender.role.charAt(0).toUpperCase()}${item.sender.role.slice(1)})` : "";

    return (
      <View style={styles.card}>
        <Image source={pictureRepository.getSource(item.image)} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.content}</Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMetaLabel}>Usuário:</Text>
            <Text style={styles.cardMetaValue}>{senderName + senderRole}</Text>
          </View>
          {senderEmail ? (
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMetaLabel}>E-mail:</Text>
              <Text style={styles.cardMetaValue}>{senderEmail}</Text>
            </View>
          ) : null}
          {senderPhone ? (
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMetaLabel}>Telefone:</Text>
              <Text style={styles.cardMetaValue}>{senderPhone}</Text>
            </View>
          ) : null}
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMetaLabel}>Enviado em:</Text>
            <Text style={styles.cardMetaValue}>{new Date(item.createdAt).toLocaleString("pt-BR")}</Text>
          </View>
          <Text style={styles.cardMetaValue}>
            Lat {item.latitude.toFixed(4)} · Lon {item.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Alertas enviados por usuários</Text>
      {loadingList ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma notificação registrada ainda.</Text>
          }
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      padding: 16,
    },
    header: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },
    card: {
      flexDirection: "row",
      backgroundColor: COLORS.quarternary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      alignItems: "center",
    },
    cardImage: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: COLORS.bg,
      marginRight: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 6,
    },
    cardMetaRow: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 4,
      flexWrap: "wrap",
    },
    cardMetaLabel: {
      color: COLORS.bg,
      fontWeight: "600",
    },
    cardMetaValue: {
      color: COLORS.text,
      fontSize: 12,
    },
    emptyText: {
      color: COLORS.text,
      textAlign: "center",
      marginTop: 24,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
    },
  });
}

