import { useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { IPost } from '../../../models/IPost';
import { usePost } from '../../../context/PostContext';

interface UsePostLikeProps {
	post: IPost;
	accountId?: string;
	onLike?: (postId: string) => void;
}

export function usePostLike({ post, accountId, onLike }: UsePostLikeProps) {
	const { likePost: likePostFromContext } = usePost();
	const likeScale = useRef(new Animated.Value(1)).current;

	const isLiked = useMemo(
		() => !!(accountId && post?.likes?.includes(accountId)),
		[accountId, post?.likes]
	);

	const handleLikePress = async () => {
		Animated.sequence([
			Animated.timing(likeScale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
			Animated.timing(likeScale, { toValue: 1.0, duration: 120, useNativeDriver: true }),
		]).start();
		try {
			if (!post?.id) return;
			if (onLike) {
				onLike(post.id);
			} else {
				await likePostFromContext(post.id);
			}
		} catch (e) {
			Toast.show({
				type: 'error',
				text1: 'Erro ao curtir post',
				text2: 'Tente novamente mais tarde.',
				position: 'bottom',
			});
		}
	};

	return {
		isLiked,
		likeScale,
		handleLikePress,
	};
}

