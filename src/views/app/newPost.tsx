import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoCamera from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function NewPost({ navigation }: any) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { account } = useAccount();
  const isFocused = useIsFocused();

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<any>(null);
  const CameraViewImpl: any = (ExpoCamera as any).CameraView;
  const CameraImpl: any = CameraViewImpl || (ExpoCamera as any).Camera;

  useEffect(() => {
    if (isFocused) {
      setImages([]);
      setContent('');
      setSubmitting(false);
      setCameraType('back');
      setFlash('off');
      cameraRef.current = null;
    } 
  }, [isFocused]);


  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos de acesso às suas fotos para anexar imagens.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const openCamera = async () => {
    try {
      const request =
        (ExpoCamera as any).requestCameraPermissionsAsync ||
        (ExpoCamera as any).Camera?.requestCameraPermissionsAsync;
      const { status } = await (request ? request() : Promise.resolve({ status: 'denied' }));
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos de acesso à câmera para tirar fotos.');
        return;
      }
      setIsCameraOpen(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível acessar a câmera.');
    }
  };



  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: false });
      if (!photo?.uri) return;
      const uri = photo.uri;
      const ext = 'jpg';
      const name = `photo_${Date.now()}.${ext}`;
      const type = `image/${ext}`;
      setImages(prev => [...prev, { uri, name, type }]);
      setIsCameraOpen(false);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao capturar a foto.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!account) {
      Alert.alert('Sessão', 'Você precisa estar logado para postar.');
      return;
    }
    if (!content.trim() && images.length === 0) {
      Alert.alert('Validação', 'Adicione conteúdo ou ao menos uma imagem.');
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      const derivedTitle = content.trim().slice(0, 50) || 'Post';
      form.append('title', derivedTitle);
      form.append('content', content.trim());
      images.forEach((img) => {

        // @ts-ignore
        form.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        });
      });
      await postRepository.createPost(form);
      setContent('');
      setImages([]);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Post criado!',
        position: 'bottom',
      });
      navigation.navigate('Community');
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido';
      Toast.show({
        type: 'info',
        text1: message,
        position: 'bottom',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
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
                <Ionicons name="images" size={20} color={COLORS.primary} />
                <Text style={styles.label}>Imagens ({images.length})</Text>
              </View>
              <TouchableOpacity 
                style={styles.addImageBtn} 
                onPress={pickImages}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addImageText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.imagesContainer}>
              {images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.imagesRow}
                >
                  {images.map((img, idx) => (
                    <View key={`${img.uri}-${idx}`} style={styles.imageItem}>
                      <Image source={{ uri: img.uri }} style={styles.preview} />
                      <TouchableOpacity 
                        style={styles.removeImgBtn} 
                        onPress={() => removeImage(idx)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.cameraTile} 
                  onPress={openCamera} 
                  accessibilityLabel="Abrir câmera"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={28} color={COLORS.primary} />
                  <Text style={styles.cameraText}>Câmera</Text>
                </TouchableOpacity>
                
                {images.length === 0 && (
                  <TouchableOpacity 
                    style={styles.galleryTile} 
                    onPress={pickImages}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="images-outline" size={28} color={COLORS.primary} />
                    <Text style={styles.cameraText}>Galeria</Text>
                  </TouchableOpacity>
                )}
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
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Publicar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isCameraOpen && (
        <View style={styles.cameraOverlay}>
          {CameraImpl ? (
            <CameraImpl
              ref={(r: any) => (cameraRef.current = r)}
              style={styles.cameraPreview}
              {...(CameraViewImpl
                ? { facing: cameraType, enableTorch: flash === 'on' }
                : { type: cameraType })}
            />
          ) : (
            <View style={[styles.cameraPreview, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.roundBtnText}>Câmera indisponível</Text>
            </View>
          )}

          <View style={styles.cameraTopBar}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => {
                setIsCameraOpen(false);
              }}
              accessibilityLabel="Fechar câmera"
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => setFlash(prev => (prev === 'off' ? 'on' : 'off'))}
              accessibilityLabel="Alternar flash"
            >
              <Ionicons name={flash === 'off' ? 'flash-off' : 'flash'} size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraBottomBar}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => setCameraType(prev => (prev === 'back' ? 'front' : 'back'))}
            >
              <MaterialIcons name="flip-camera-android" size={50} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={capturePhoto} accessibilityLabel="Capturar foto" accessibilityRole="button">
              <View style={styles.captureOuter}>
                <View style={styles.captureInner} />
              </View>
            </TouchableOpacity>

            <View style={{ width: 74 }} />
          </View>
        </View>
      )}
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
    cameraOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'black',
      zIndex: 1000,
    },
    cameraPreview: {
      ...StyleSheet.absoluteFillObject,
    },
    cameraTopBar: {
      position: 'absolute',
      top: 24,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cameraBottomBar: {
      position: 'absolute',
      bottom: 32,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    roundBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    roundBtnText: {
      color: COLORS.text,
      fontWeight: '700',
    },
    captureOuter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 4,
      borderColor: COLORS.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: COLORS.text,
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
      borderColor: COLORS.quarternary,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addImageText: {
      color: '#fff',
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
      backgroundColor: '#E74C3C',
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
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
      shadowColor: '#000',
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
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
}


