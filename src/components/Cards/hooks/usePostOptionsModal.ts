import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import { IPost } from '../../../models/IPost';
import { usePost } from '../../../context/PostContext';
import { useToast } from '../../../hooks/useToast';

interface UsePostOptionsModalProps {
	post: IPost;
	isOwner: boolean;
	onShare: () => void;
	onOpenAbout: () => void;
	onOpenEdit: () => void;
}

export function usePostOptionsModal({
	post,
	isOwner,
	onShare,
	onOpenAbout,
	onOpenEdit,
}: UsePostOptionsModalProps) {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const slideY = useRef(new Animated.Value(height)).current;
	const { deletePost } = usePost();
	const toast = useToast();
	const openOptionsSheet = () => {
		slideY.setValue(height);
		setIsOpen(true);
		Animated.timing(slideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const closeOptionsSheet = () => {
		Animated.timing(slideY, {
			toValue: height,
			duration: 220,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) setIsOpen(false);
		});
	};

	const handleDeletePost = async () => {
		if (!post?.id) return;
		try {
			await deletePost(post.id);
			closeOptionsSheet();
			toast.success('Post excluído com sucesso');
		} catch (error: any) {
			toast.handleApiError(error, error?.data?.message || 'Erro ao excluir post');
			return;
		}
	};

	const handleOpenAbout = () => {
		closeOptionsSheet();
		onOpenAbout();
	};

	const handleOpenEdit = () => {
		closeOptionsSheet();
		onOpenEdit();
	};

	return {
		isOpen,
		slideY,
		openOptionsSheet,
		closeOptionsSheet,
		handleDeletePost,
		handleOpenAbout,
		handleOpenEdit,
	};
}

