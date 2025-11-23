import { useState, useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { IPost } from '../../../models/IPost';
import { usePost } from '../../../context/PostContext';

interface UsePostEditModalProps {
	post: IPost;
}

export function usePostEditModal({ post }: UsePostEditModalProps) {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const [postEditText, setPostEditText] = useState(post?.content ?? '');
	const [saving, setSaving] = useState(false);
	const postEditSlideY = useRef(new Animated.Value(height)).current;
	const { editPost } = usePost();

	useEffect(() => {
		setPostEditText(post?.content ?? '');
	}, [post?.content]);

	const openEditModal = () => {
		if (!post) return;
		setPostEditText(post.content ?? '');
		postEditSlideY.setValue(height);
		setIsOpen(true);
		Animated.timing(postEditSlideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const closeEditModal = () => {
		Animated.timing(postEditSlideY, {
			toValue: height,
			duration: 220,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) setIsOpen(false);
		});
	};

	const savePostEdit = async () => {
		if (!post?.id || !postEditText.trim() || saving) return;
		try {
			setSaving(true);
			await editPost(post.id, { content: postEditText.trim() });
			Toast.show({
				type: 'success',
				text1: 'Post atualizado com sucesso',
				position: 'bottom',
			});
			closeEditModal();
		} catch (e: any) {
			const message = e?.message || 'Erro ao salvar post';
			Toast.show({
				type: 'error',
				text1: 'Não foi possível atualizar',
				text2: message,
				position: 'bottom',
			});
		} finally {
			setSaving(false);
		}
	};

	return {
		isOpen,
		postEditText,
		setPostEditText,
		saving,
		postEditSlideY,
		openEditModal,
		closeEditModal,
		savePostEdit,
	};
}

