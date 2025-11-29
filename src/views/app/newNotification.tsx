import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import * as ExpoCamera from "expo-camera";
import { useToast } from "../../hooks/useToast";
import { useAccount } from "../../context/AccountContext";
import { useTheme } from "../../context/ThemeContext";
import CameraView from "../../components/CameraView";
import {
  NotificationPayload,
  notificationRemoteRepository,
} from "../../data/remote/repositories/notificationRemoteRepository";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

export default function NewNotification({ navigation }: any) {
  const { COLORS, FONT_SIZE } = useTheme();
  const styles = makeStyles(COLORS);
  const { account, loading } = useAccount();
  const toast = useToast();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<NotificationPayload["image"] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const isFocused = useIsFocused();

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
        toast.info("Permissão necessária", message);
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
      toast.info("Erro", message);
      throw new Error(message);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation().catch(() => { });
  }, [fetchLocation]);

  const openCamera = useCallback(async () => {
    try {
      const request =
        (ExpoCamera as any).requestCameraPermissionsAsync ||
        (ExpoCamera as any).Camera?.requestCameraPermissionsAsync;
      const { status } = await (request ? request() : Promise.resolve({ status: 'denied' }));
      if (status !== 'granted') {
        toast.info('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
        return;
      }
      setIsCameraOpen(true);
    } catch (e) {
      toast.handleError(e, 'Não foi possível acessar a câmera');
    }
  }, [toast]);

  useEffect(() => {
    if (isFocused) {
      openCamera();
    } else {
      setIsCameraOpen(false);
    }
  }, [isFocused]);


  const handleCameraCapture = useCallback((photo: { uri: string; name: string; type: string }) => {
    setImage(photo);
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Validação", "Descreva o motivo da notificação");
      return;
    }

    if (!image) {
      toast.error("Validação", "Anexe uma imagem para a notificação");
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

      toast.success("Sucesso", "Notificação enviada");
      navigation.goBack();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || "Erro ao criar notificação");
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || locationLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={FONT_SIZE.medium} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Notificação</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={FONT_SIZE.medium} color={COLORS.primary} />
          <Text style={styles.helperText}>
            Avise a instituição sobre um animal em risco. Tire uma foto, descreva o cenário e envie.
            A localização é capturada automaticamente.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Ionicons name="text" size={FONT_SIZE.regular} color={COLORS.primary} />
              <Text style={styles.label}>Descrição do caso</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descreva o caso para a instituição..."
              placeholderTextColor={COLORS.text}
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
            />
            <Text style={styles.charCount}>{content.length} caracteres</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Ionicons name="camera" size={FONT_SIZE.regular} color={COLORS.primary} />
              <Text style={styles.label}>Foto do animal</Text>
            </View>

            {image ? (
              <View style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setImage(null)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={FONT_SIZE.medium} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={openCamera}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={FONT_SIZE.regular} color={COLORS.text} />
                  <Text style={styles.changeImageText}>Trocar foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={openCamera}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={FONT_SIZE.xlarge} color={COLORS.primary} />
                <Text style={styles.cameraButtonText}>Tirar foto</Text>
                <Text style={styles.cameraButtonSubtext}>Toque para abrir a câmera</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
            disabled={isBusy}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Ionicons name="send" size={FONT_SIZE.regular} color={COLORS.text} style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Enviar para a instituição</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CameraView
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </SafeAreaView>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.quarternary,
      backgroundColor: COLORS.secondary,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: COLORS.quarternary,
    },
    headerTitle: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "700",
      flex: 1,
      textAlign: "center",
    },
    headerPlaceholder: {
      width: 40,
    },
    infoCard: {
      flexDirection: "row",
      backgroundColor: COLORS.quarternary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.primary,
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    helperText: {
      color: COLORS.text,
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 12,
      flex: 1,
    },
    form: {
      gap: 24,
    },
    section: {
      marginBottom: 8,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 8,
    },
    label: {
      color: COLORS.text,
      fontWeight: "600",
      fontSize: 16,
    },
    input: {
      backgroundColor: COLORS.quarternary,
      color: COLORS.text,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: COLORS.quarternary,
    },
    textarea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
    charCount: {
      color: COLORS.text,
      opacity: 0.5,
      fontSize: 12,
      marginTop: 6,
      textAlign: "right",
    },
    cameraButton: {
      backgroundColor: COLORS.quarternary,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderStyle: "dashed",
      minHeight: 200,
    },
    cameraButtonText: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: "600",
      marginTop: 12,
    },
    cameraButtonSubtext: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 14,
      marginTop: 4,
    },
    imagePreviewWrapper: {
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      backgroundColor: COLORS.quarternary,
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    imagePreview: {
      width: "100%",
      height: 250,
    },
    removeImage: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: COLORS.error + 'E6',
      borderRadius: 20,
      padding: 4,
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    changeImageButton: {
      position: "absolute",
      bottom: 12,
      right: 12,
      backgroundColor: COLORS.quarternary + 'B3',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    changeImageText: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonIcon: {
      marginRight: 8,
    },
    primaryButtonText: {
      color: COLORS.text,
      fontWeight: "700",
      fontSize: 16,
    },
  });
}

