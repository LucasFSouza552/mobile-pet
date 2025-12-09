import React from "react";
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
import { useTheme } from "../../../context/ThemeContext";
import CameraView from "../../../components/CameraView";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNewNotificationController } from "../../../controllers/app/useNewNotificationController";

export default function NewNotification({ navigation }: any) {
  const { COLORS, FONT_SIZE } = useTheme();
  const styles = makeStyles(COLORS);
  
  const {
    content,
    image,
    submitting,
    locationLoading,
    isCameraOpen,
    isBusy,
    setContent,
    openCamera,
    handleCameraCapture,
    closeCamera,
    removeImage,
    handleSubmit,
  } = useNewNotificationController();

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
                  onPress={removeImage}
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
        onClose={closeCamera}
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
