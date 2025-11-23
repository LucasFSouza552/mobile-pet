import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { IComment } from '../../../models/IComment';
import { commentRepository } from '../../../data/remote/repositories/commentsRemoteRepository';
import { usePostComments } from './usePostComments';

interface UseEditCommentModalProps {
	postId?: string;
}

export function useEditCommentModal({ postId }: UseEditCommentModalProps) {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const [editingComment, setEditingComment] = useState<IComment | null>(null);
	const [editCommentText, setEditCommentText] = useState('');
	const [saving, setSaving] = useState(false);
	const editSlideY = useRef(new Animated.Value(height)).current;
	const { update } = usePostComments(postId);

	const openEditModal = (comment: IComment) => {
		setEditingComment(comment);
		setEditCommentText(comment.content);
		setIsOpen(true);
		editSlideY.setValue(height);
		Animated.timing(editSlideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const closeEditModal = () => {
		Animated.timing(editSlideY, {
			toValue: height,
			duration: 220,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				setIsOpen(false);
				setEditingComment(null);
				setEditCommentText('');
			}
		});
	};

	const saveEditedComment = async () => {
		if (!editingComment || !editCommentText.trim() || saving) return;

		try {
			setSaving(true);
			const updated = await commentRepository.updateComment(editingComment.id, editCommentText.trim());

			const updatedComment: IComment = {
				...editingComment,
				...updated,
				content: editCommentText.trim(),
				updatedAt: updated.updatedAt || new Date().toISOString(),
			};

			update(updatedComment);
			closeEditModal();

			setTimeout(() => {
				Toast.show({
					type: 'success',
					text1: 'Comentário editado com sucesso',
					position: 'bottom',
				});
			}, 300);
		} catch (e: any) {
			console.error('Erro ao editar comentário:', e);
			const errorMessage = e?.response?.data?.message || e?.message || 'Tente novamente';
			Toast.show({
				type: 'error',
				text1: 'Erro ao editar comentário',
				text2: errorMessage,
				position: 'bottom',
			});
		} finally {
			setSaving(false);
		}
	};

	return {
		isOpen,
		editingComment,
		editCommentText,
		setEditCommentText,
		saving,
		editSlideY,
		openEditModal,
		closeEditModal,
		saveEditedComment,
	};
}

