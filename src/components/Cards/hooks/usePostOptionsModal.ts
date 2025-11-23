import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';
import { IPost } from '../../../models/IPost';
import { usePost } from '../../../context/PostContext';

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
			Toast.show({ type: 'success', text1: 'Post excluído', position: 'bottom' });
		} catch (e) {
			Toast.show({ type: 'error', text1: 'Erro ao excluir post', position: 'bottom' });
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

