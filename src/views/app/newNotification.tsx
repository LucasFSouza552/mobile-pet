import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useAccount } from "../../context/AccountContext";
import { useTheme } from "../../context/ThemeContext";
import {
  NotificationPayload,
  notificationRemoteRepository,
} from "../../data/remote/repositories/notificationRemoteRepository";
import { SafeAreaView } from "react-native-safe-area-context";

function createImagePayload(asset: ImagePicker.ImagePickerAsset) {
  const extension = (asset.fileName?.split(".").pop() || "jpg").toLowerCase();
  const mimeType = asset.type && asset.type.includes("/") ? asset.type : `image/${extension}`;
  const name = asset.fileName || `notification_${Date.now()}.${extension}`;

  return {
    uri: asset.uri,
    name,
    type: mimeType,
  };
}

export default function NewNotification({ navigation }: any) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { account, loading } = useAccount();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<NotificationPayload["image"] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!account) {
        navigation.navigate("Welcome");
        return;
      }
      if (account.role === "institution") {
        navigation.goBack();
      }
    }
  }, [account, loading, navigation]);

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const message = "Permissão negada para obter localização.";
        Toast.show({ type: "info", text1: message });
        throw new Error(message);
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const result = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      setLocation(result);
      return result;
    } catch (error: any) {
      const message =
        error?.message || "Não foi possível obter a localização.";
      Toast.show({ type: "info", text1: message });
      throw new Error(message);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation().catch(() => {});
  }, [fetchLocation]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: "info", text1: "Permissão negada para usar a câmera" });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      setImage(createImagePayload(result.assets[0]));
    } catch (error) {
      Toast.show({ type: "info", text1: "Erro ao abrir a câmera" });
    }
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Toast.show({ type: "info", text1: "Descreva o motivo da notificação" });
      return;
    }

    if (!image) {
      Toast.show({ type: "info", text1: "Anexe uma imagem para a notificação" });
      return;
    }

    let coords = location;
    if (!coords) {
      try {
        coords = await fetchLocation();
      } catch {
        return;
      }
    }

    setSubmitting(true);

    try {
      await notificationRemoteRepository.createNotification({
        content: content.trim(),
        type: "warning",
        latitude: coords.latitude,
        longitude: coords.longitude,
        image,
      });

      Toast.show({
        type: "success",
        text1: "Notificação enviada",
      });
      navigation.goBack();
    } catch (error: any) {
      const message =
        error?.message ||
        "Não foi possível criar a notificação. Tente novamente.";
      Toast.show({ type: "info", text1: message });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    takePhoto();
  }, [takePhoto]);

  const isBusy = submitting || locationLoading;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Nova notificação</Text>
      <Text style={styles.helperText}>
        Avise a instituição sobre um animal em risco: tire uma foto, descreva o cenário e envie.
        A localização já é capturada automaticamente.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Conteúdo</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Descreva o caso para a instituição"
          placeholderTextColor={COLORS.text}
          multiline
          numberOfLines={5}
          value={content}
          onChangeText={setContent}
        />

        <Text style={styles.label}>Imagem</Text>
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
            <Text style={styles.secondaryButtonText}>Câmera</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.imagePreviewWrapper}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
              <Text style={styles.removeImageText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isBusy && { opacity: 0.7 }]}
          disabled={isBusy}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar para a instituição</Text>
          )}
        </TouchableOpacity>
      </View>
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
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 12,
    },
    helperText: {
      color: COLORS.text,
      marginBottom: 12,
      fontSize: 16,
      lineHeight: 24,
      backgroundColor: COLORS.quarternary,
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.primary,
      fontWeight: "700",
      textAlign: "center",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    form: {
      gap: 12,
    },
    label: {
      color: COLORS.text,
      fontWeight: "600",
    },
    input: {
      backgroundColor: COLORS.quarternary,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    textarea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    imageActions: {
      flexDirection: "row",
      gap: 8,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.tertiary,
      paddingVertical: 10,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: COLORS.text,
      fontWeight: "600",
    },
    imagePreviewWrapper: {
      marginTop: 8,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 10,
    },
    removeImage: {
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    removeImageText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryButtonText: {
      color: COLORS.bg,
      fontWeight: "700",
    },
  });
}

