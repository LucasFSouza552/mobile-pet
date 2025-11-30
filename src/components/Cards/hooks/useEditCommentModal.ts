import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import { IComment } from '../../../models/IComment';
import { commentRepository } from '../../../data/remote/repositories/commentsRemoteRepository';
import { useToast } from '../../../hooks/useToast';

interface UseEditCommentModalProps {
	postId?: string;
	onCommentUpdated: (comment: IComment) => void;
}

export function useEditCommentModal({ onCommentUpdated }: UseEditCommentModalProps) {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const [editingComment, setEditingComment] = useState<IComment | null>(null);
	const [editCommentText, setEditCommentText] = useState('');
	const [saving, setSaving] = useState(false);
	const editSlideY = useRef(new Animated.Value(height)).current;
	const toast = useToast();
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

		const optimisticUpdatedComment: IComment = {
			...editingComment,
			content: editCommentText.trim(),
			updatedAt: new Date().toISOString(),
		};

		onCommentUpdated(optimisticUpdatedComment);
		closeEditModal();

		try {
			setSaving(true);
			const updated = await commentRepository.updateComment(editingComment.id, editCommentText.trim());

			const finalUpdatedComment: IComment = {
				...optimisticUpdatedComment,
				...updated,
				account: editingComment.account,
				content: editCommentText.trim(),
				updatedAt: updated.updatedAt || optimisticUpdatedComment.updatedAt,
			};

			onCommentUpdated(finalUpdatedComment);
		} catch (error: any) {
			onCommentUpdated(editingComment);
			toast.handleApiError(error, error?.data?.message || 'Erro ao editar comentário');
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

