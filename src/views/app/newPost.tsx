import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoCamera from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../hooks/useToast';
import CameraView from '../../components/CameraView';

export default function NewPost({ navigation }: any) {
  const { COLORS, FONT_SIZE } = useTheme();
  const styles = makeStyles(COLORS);
  const { account } = useAccount();
  const isFocused = useIsFocused();
  const toast = useToast();

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setImages([]);
      setContent('');
      setSubmitting(false);
    }
  }, [isFocused]);


  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.info('Permissão necessária', 'Precisamos de acesso às suas fotos para anexar imagens.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const picked = (result.assets || []).map((a, idx) => {
        const uri = a.uri;
        const ext = (a.fileName?.split('.').pop() || 'jpg').toLowerCase();
        const name = a.fileName || `image_${Date.now()}_${idx}.${ext}`;
        const type = a.mimeType || `image/${ext}`;
        return { uri, name, type };
      });
      setImages(prev => [...prev, ...picked]);
    } catch (e) {
      toast.handleError(e, 'Não foi possível abrir a galeria');
    }
  };

  const openCamera = async () => {
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
  };

  const handleCameraCapture = (photo: { uri: string; name: string; type: string }) => {
    setImages(prev => [...prev, photo]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!account) {
      toast.error('Sessão expirada', 'Você precisa estar logado para postar.');
      return;
    }
    if (!content.trim() && images.length === 0) {
      toast.error('Validação', 'Adicione conteúdo ou ao menos uma imagem.');
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('content', content.trim());
      images.forEach((img) => {
        form.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        } as any);
      });
      await postRepository.createPost(form);
      setContent('');
      setImages([]);
      toast.success('Sucesso', 'Post criado!');
      navigation.navigate('Community');
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao criar post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Criar Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.contentSection}>
            <Text style={styles.label}>O que você está pensando?</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Compartilhe algo com a comunidade..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length} caracteres</Text>
          </View>

          <View style={styles.imagesSection}>
            <View style={styles.imagesHeader}>
              <View style={styles.imagesHeaderLeft}>
                <Ionicons name="images" size={FONT_SIZE.regular} color={COLORS.primary} />
                <Text style={styles.label}>Imagens ({images.length})</Text>
              </View>
            </View>

            <View style={styles.imagesContainer}>
              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesRow}
                >
                  {images.map((img, idx) => {
                    const imageUri = img.uri;

                    return (
                      <View key={`${imageUri}-${idx}`} style={styles.imageItem}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.preview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeImgBtn}
                          onPress={() => removeImage(idx)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle" size={FONT_SIZE.medium} color={COLORS.text} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.cameraTile}
                  onPress={openCamera}
                  accessibilityLabel="Abrir câmera"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={FONT_SIZE.medium} color={COLORS.primary} />
                  <Text style={styles.cameraText}>Câmera</Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.galleryTile}
                  onPress={pickImages}
                  activeOpacity={0.7}
                >
                  <Ionicons name="images-outline" size={FONT_SIZE.medium} color={COLORS.primary} />
                  <Text style={styles.cameraText}>Galeria</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (submitting || (!content.trim() && images.length === 0)) && styles.buttonDisabled
            ]}
            disabled={submitting || (!content.trim() && images.length === 0)}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Ionicons name="send" size={FONT_SIZE.regular} color={COLORS.text} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Publicar</Text>
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.quarternary,
      backgroundColor: COLORS.secondary,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: COLORS.quarternary,
    },
    placeholder: {
      width: 40,
    },
    header: {
      color: COLORS.text,
      fontSize: 22,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    form: {
      gap: 20,
    },
    contentSection: {
      marginBottom: 8,
    },
    imagesSection: {
      marginTop: 8,
    },
    label: {
      color: COLORS.text,
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 8,
    },
    imagesHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      backgroundColor: COLORS.quarternary,
      color: COLORS.text,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: COLORS.tertiary,
    },
    textarea: {
      minHeight: 150,
      maxHeight: 300,
    },
    charCount: {
      color: COLORS.text,
      opacity: 0.5,
      fontSize: 12,
      marginTop: 4,
      textAlign: 'right',
    },
    imagesHeader: {
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    addImageBtn: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addImageText: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 14,
    },
    imagesRow: {
      gap: 12,
      paddingVertical: 8,
    },
    imageItem: {
      position: 'relative',
      marginRight: 4,
    },
    preview: {
      width: 120,
      height: 120,
      borderRadius: 12,
      backgroundColor: COLORS.quarternary,
      resizeMode: 'cover',
    },
    imagesContainer: {
      marginTop: 8,
    },
    imageActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cameraTile: {
      flex: 1,
      height: 100,
      borderRadius: 12,
      backgroundColor: COLORS.quarternary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderStyle: 'dashed',
    },
    galleryTile: {
      flex: 1,
      height: 100,
      borderRadius: 12,
      backgroundColor: COLORS.quarternary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderStyle: 'dashed',
    },
    cameraText: {
      color: COLORS.text,
      fontSize: 12,
      marginTop: 6,
      fontWeight: '600',
    },
    removeImgBtn: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: COLORS.error,
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      marginTop: 24,
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 16,
    },
  });
}


