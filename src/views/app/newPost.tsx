import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import * as ImagePicker from 'expo-image-picker';

export default function NewPost() {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { account } = useAccount();

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<Array<{ uri: string; name: string; type: string }>>([]);

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
      form.append('content', content.trim());
      images.forEach((img) => {
        // @ts-ignore RN FormData file
        form.append('images', { uri: img.uri, name: img.name, type: img.type });
      });
      await postRepository.createPost(form as any);
      setContent('');
      setImages([]);
      Alert.alert('Sucesso', 'Post criado!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar o post.');
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
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
            <Text style={styles.addImageText}>Adicionar imagens</Text>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          disabled={submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{submitting ? 'Publicando...' : 'Publicar'}</Text>
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


