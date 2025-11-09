import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import type { IPost } from '../../models/IPost';
import { Images } from '../../../assets';

export default function PostDetails() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { postId } = route.params || {};
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const p = await postRepository.fetchPostWithAuthor(postId);
        setPost(p);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o post.');
      } finally {
        setLoading(false);
      }
    };
    if (postId) load();
  }, [postId]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>{loading ? 'Carregando...' : 'Post não encontrado'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={pictureRepository.getSource(post.account?.avatar)} style={styles.avatar} defaultSource={Images.avatarDefault as unknown as number} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{post.account?.name}</Text>
            <Text style={styles.date}>{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}

        {Array.isArray(post.image) && post.image.length > 0 && (
          <View style={styles.images}>
            {post.image.map((img) => (
              <Image key={img} source={pictureRepository.getSource(img)} style={styles.postImage} defaultSource={Images.avatarDefault as unknown as number} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentários ({post.comments?.length || 0})</Text>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, idx) => (
              <View key={`${c}-${idx}`} style={styles.commentItem}>
                <Text style={styles.commentText}>{c}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Sem comentários</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.commentBar}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Escreva um comentário..."
          placeholderTextColor={COLORS.text}
          style={styles.commentInput}
        />
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => {
            Alert.alert('Info', 'Envio de comentário não implementado neste exemplo.');
          }}
        >
          <Text style={styles.commentButtonText}>Enviar</Text>
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
    },
    content: {
      padding: 16,
      gap: 12,
    },
    title: {
      color: COLORS.text,
      fontWeight: 'bold',
      fontSize: 18,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.bg,
      borderColor: COLORS.text,
      borderWidth: 1,
    },
    author: {
      color: COLORS.text,
      fontWeight: '700',
    },
    date: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 12,
    },
    postTitle: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 16,
    },
    postContent: {
      color: COLORS.text,
      fontSize: 14,
      lineHeight: 20,
    },
    images: {
      gap: 8,
    },
    postImage: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 12,
      resizeMode: 'cover',
    },
    section: {
      marginTop: 8,
      gap: 8,
    },
    sectionTitle: {
      color: COLORS.text,
      fontWeight: '700',
    },
    commentItem: {
      backgroundColor: COLORS.quarternary,
      padding: 10,
      borderRadius: 10,
    },
    commentText: {
      color: COLORS.text,
    },
    empty: {
      color: COLORS.text,
      opacity: 0.8,
    },
    commentBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderTopColor: COLORS.quarternary,
      borderTopWidth: 1,
      backgroundColor: COLORS.secondary,
    },
    commentInput: {
      flex: 1,
      backgroundColor: COLORS.quarternary,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    commentButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    commentButtonText: {
      color: COLORS.text,
      fontWeight: '700',
    },
  });
}


