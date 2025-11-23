import { useState, useRef } from 'react';
import { useWindowDimensions, Alert } from 'react-native';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { IComment } from '../../../models/IComment';
import { usePostComments } from './usePostComments';

interface UsePostCommentsModalProps {
	postId?: string;
}

export function usePostCommentsModal({ postId }: UsePostCommentsModalProps) {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const [commentText, setCommentText] = useState('');
	const slideY = useRef(new Animated.Value(height)).current;
	const { comments, loading, hasMore, load, add, remove, update } = usePostComments(postId);

	const openComments = () => {
		setIsOpen(true);
		Animated.timing(slideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
		if (postId) {
			load(true);
		}
	};

	const closeComments = () => {
		Animated.timing(slideY, {
			toValue: height,
			duration: 220,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) setIsOpen(false);
		});
	};

	const handleCommentsPress = () => {
		if (!postId) return;
		openComments();
	};

	const handleSubmitComment = async () => {
		if (!commentText.trim() || !postId) return;
		try {
			await add(commentText);
			setCommentText('');
		} catch (e) {
			Toast.show({
				type: 'error',
				text1: 'Erro ao comentar',
				position: 'bottom',
			});
		}
	};

	const handleDeleteComment = (comment: IComment) => {
		Alert.alert(
			'Excluir comentário',
			'Tem certeza que deseja excluir este comentário?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await remove(comment.id);
							Toast.show({
								type: 'success',
								text1: 'Comentário excluído com sucesso',
								position: 'bottom',
							});
						} catch (e) {
							Toast.show({
								type: 'error',
								text1: 'Erro ao excluir comentário',
								position: 'bottom',
							});
						}
					},
				},
			]
		);
	};

	return {
		isOpen,
		commentText,
		setCommentText,
		slideY,
		comments,
		loading,
		hasMore,
		load,
		remove,
		update,
		openComments,
		closeComments,
		handleCommentsPress,
		handleSubmitComment,
		handleDeleteComment,
	};
}

