import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
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
      setIsCameraOpen(false);
      setCameraType('back');
      setFlash('off');
      cameraRef.current = null;
      openCamera();
    } else {
      setIsCameraOpen(false);
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
      <Text style={styles.header}>Novo Post</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Conteúdo</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Escreva algo..."
          placeholderTextColor={COLORS.text}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.imagesHeader}>
          <Text style={styles.label}>Imagens</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
              <Text style={styles.addImageText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imagesContainer}>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
              {images.map((img, idx) => (
                <View key={`${img.uri}-${idx}`} style={styles.imageItem}>
                  <Image source={{ uri: img.uri }} style={styles.preview} />
                  <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                    <Text style={styles.removeImgText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cameraTile} onPress={openCamera} accessibilityLabel="Abrir câmera">
            <Ionicons name="camera" size={36} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          disabled={submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{submitting ? 'Publicando...' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>

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
                navigation.navigate('Community');
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
      padding: 16,
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
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    form: {
      gap: 8,
    },
    label: {
      color: COLORS.text,
      fontWeight: '600',
    },
    input: {
      backgroundColor: COLORS.quarternary,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    textarea: {
      minHeight: 120,
    },
    imagesHeader: {
      marginTop: 8,
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    addImageBtn: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    addImageText: {
      color: COLORS.text,
      fontWeight: '700',
    },
    imagesRow: {
      gap: 8,
      paddingVertical: 6,
    },
    imageItem: {
      position: 'relative',
    },
    preview: {
      width: 100,
      height: 100,
      borderRadius: 10,
      backgroundColor: COLORS.quarternary,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    cameraTile: {
      width: 100,
      height: 100,
      borderRadius: 10,
      backgroundColor: COLORS.quarternary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    removeImgBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    removeImgText: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 12,
    },
    button: {
      marginTop: 16,
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: COLORS.text,
      fontWeight: '700',
    },
  });
}


