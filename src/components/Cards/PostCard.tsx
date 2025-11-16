import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions,  Share, useWindowDimensions,  Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IPost } from '../../models/IPost';
import { IComment } from '../../models/IComment';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { usePost } from '../../context/PostContext';
import { darkTheme, lightTheme } from '../../theme/Themes';
import { commentRepository } from '../../data/remote/repositories/commentsRemoteRepository';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import { useAccount } from '../../context/AccountContext';

interface PostCardProps {
	post: IPost;
	accountId?: string;
	onLike?: (postId: string) => void;
	handleOptions: (postId: string) => void;
	handleAbout: (postId: string) => void;
	postOptions: string;
}

import PostHeaderView from './PostHeaderView';
import OptionsBarView from './OptionsBarView';
import PostPictureContainer from './PostPictureContainer';
import PostCommentsModal from './PostCommentsModal';
import PostEditCommentModal from './PostEditCommentModal';
import PostOptionsModal from './PostOptionsModal';
import PostAboutModal from './PostAboutModal';

function PostCardComponent({
	post,
	accountId,
	onLike,
	handleOptions,
	handleAbout,
	postOptions,
}: PostCardProps) {
	const { COLORS } = useTheme();
	const styles = makeStyles(COLORS);
	const { likePost: likePostFromContext } = usePost();
	const { account } = useAccount();
	const insets = useSafeAreaInsets();
	const [animateLike, setAnimateLike] = useState(false);
	const [showShareMessage, setShowShareMessage] = useState(false);
	const { width, height } = useWindowDimensions();
	const hideMetaText = width < 380;
	const navigation = useNavigation<any>();
	const [isCommentsOpen, setIsCommentsOpen] = useState(false);
	const slideY = React.useRef(new Animated.Value(height)).current;
	const [commentText, setCommentText] = useState('');
	const [comments, setComments] = useState<IComment[]>([]);
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [commentsPage, setCommentsPage] = useState(1);
	const [hasMoreComments, setHasMoreComments] = useState(true);
	const [isOptionsOpen, setIsOptionsOpen] = useState(false);
	const [isAboutOpen, setIsAboutOpen] = useState(false);
	const aboutSlideY = React.useRef(new Animated.Value(height)).current;
	const [editingComment, setEditingComment] = useState<IComment | null>(null);
	const [editCommentText, setEditCommentText] = useState('');
	const editSlideY = React.useRef(new Animated.Value(height)).current;
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [deleted, setDeleted] = useState(false);
	const [editSaving, setEditSaving] = useState(false);

	if (!post || deleted) return null;

	const isLiked = useMemo(
		() => !!(accountId && post?.likes?.includes(accountId)),
		[accountId, post?.likes]
	);

	const formatDate = (dateString?: string) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		if (diffInSeconds < 60) return 'agora';
		if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
		}
		if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
		}
		if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
		}
		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
		} as any);
	};

	const handleLikePress = async () => {
		setAnimateLike(true);
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
		setTimeout(() => setAnimateLike(false), 400);
	};

	const openOptionsSheet = () => {
		slideY.setValue(height);
		setIsOptionsOpen(true);
		Animated.timing(slideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const openComments = () => {
		setIsCommentsOpen(true);
		Animated.timing(slideY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
		if (post?.id) {
			loadComments(true);
		}
	};

	const closeComments = () => {
		Animated.timing(slideY, {
			toValue: height,
			duration: 220,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) setIsCommentsOpen(false);
		});
	};

	const handleCommentsPress = () => {
		if (!post?.id) return;
		openComments();
	};

	const loadComments = async (reset = false) => {
		if (!post?.id) return;
		try {
			setCommentsLoading(true);
			const pageToLoad = reset ? 1 : commentsPage;
			const fetched: IComment[] = await commentRepository.fetchCommentsByPost(post.id, pageToLoad, 10);
			if (reset) {
				setComments(fetched);
			} else {
				const existing = new Set(comments.map(c => c.id));
				const merged = [...comments, ...fetched.filter(c => !existing.has(c.id))];
				setComments(merged);
			}
			setHasMoreComments(fetched.length >= 10);
			setCommentsPage(pageToLoad + 1);
		} catch (e) {
			Toast.show({
				type: 'error',
				text1: 'Erro ao carregar comentários',
				position: 'bottom',
			});
		} finally {
			setCommentsLoading(false);
		}
	};

	const handleEditComment = (comment: IComment) => {
		setEditingComment(comment);
		setEditCommentText(comment.content);
		setIsEditModalOpen(true);
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
				setIsEditModalOpen(false);
				setEditingComment(null);
				setEditCommentText('');
			}
		});
	};

	const saveEditedComment = async () => {
		if (!editingComment || !editCommentText.trim() || editSaving) return;
		try {
			setEditSaving(true);
			const updated = await commentRepository.updateComment(editingComment.id, editCommentText.trim());
			setComments(prev => prev.map(c => c.id === editingComment.id ? updated : c));
			closeEditModal();
			Toast.show({
				type: 'success',
				text1: 'Comentário editado com sucesso',
				position: 'bottom',
			});
		} catch (e) {
			Toast.show({
				type: 'error',
				text1: 'Erro ao editar comentário',
				position: 'bottom',
			});
		} finally {
			setEditSaving(false);
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
							await commentRepository.deleteOwnComment(comment.id);
							setComments(prev => prev.filter(c => c.id !== comment.id));
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

	const isCommentOwner = (comment: IComment) => {
		if (!account || !comment.account) return false;
		const commentAccountId = typeof comment.account === 'string' ? comment.account : (comment.account as any).id || (comment.account as any)._id;
		return account.id === commentAccountId;
	};

	const handleSharePress = async () => {
		try {
			const postUrl = `${post?.id}`;
			await Share.share({
				title: `Post de ${post.account.name ?? ''}`,
				message:
					post.content
						? `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}\n${postUrl}`
						: `Confira este post de ${post.account.name ?? ''}! ${postUrl}`,
			});
			setShowShareMessage(true);
			setTimeout(() => setShowShareMessage(false), 2000);
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Erro ao compartilhar post',
				text2: 'Tente novamente mais tarde.',
				position: 'bottom',
			});
			setShowShareMessage(false);
			setTimeout(() => setShowShareMessage(false), 2000);
		}
	};

	const handleDeletePost = async () => {
		if (!post?.id) return;
		try {
			await postRepository.softDeletePostById(post.id);
			setDeleted(true);
			Toast.show({ type: 'success', text1: 'Post excluído', position: 'bottom' });
		} catch (e) {
			Toast.show({ type: 'error', text1: 'Erro ao excluir post', position: 'bottom' });
		}
	};

	return (
		<>
			<View style={styles.postContainer}>
				<View style={styles.postContent}>
					<PostHeaderView
						post={post}
						styles={styles}
						formatDate={formatDate}
						onPressProfile={() => handleAbout?.(post.account.id)}
						onOpenOptions={openOptionsSheet}
					/>

					<Text style={styles.postText}>{post.content || 'Sem conteúdo'}</Text>

					{post?.image && <PostPictureContainer images={post.image} styles={styles} />}
				</View>

				<OptionsBarView
					post={post}
					styles={styles}
					isLiked={isLiked}
					hideMetaText={hideMetaText}
					onPressLike={handleLikePress}
					onPressComments={handleCommentsPress}
					onPressShare={handleSharePress}
					showShareMessage={showShareMessage}
				/>
			</View>

		<PostCommentsModal
			visible={isCommentsOpen}
			onRequestClose={closeComments}
			slideY={slideY}
			styles={styles}
			COLORS={COLORS}
			comments={comments}
			commentsLoading={commentsLoading}
			hasMoreComments={hasMoreComments}
			onEndReached={() => loadComments(false)}
			commentText={commentText}
			setCommentText={setCommentText}
			onSubmitComment={() => {
				(async () => {
					if (!commentText.trim() || !post?.id) return;
					try {
						const created = await commentRepository.createComment(post.id, commentText.trim());
						setComments(prev => [created, ...prev]);
						setCommentText('');
					} catch (e) {
						Toast.show({
							type: 'error',
							text1: 'Erro ao comentar',
							position: 'bottom',
						});
					}
				})();
			}}
			renderIsOwner={isCommentOwner}
			onEditComment={handleEditComment}
			onDeleteComment={handleDeleteComment}
		/>

		<PostEditCommentModal
			visible={isEditModalOpen}
			onRequestClose={closeEditModal}
			editSlideY={editSlideY}
			styles={styles}
			COLORS={COLORS}
			editCommentText={editCommentText}
			setEditCommentText={setEditCommentText}
			editSaving={editSaving}
			onSave={saveEditedComment}
		/>

			<PostOptionsModal
				visible={isOptionsOpen}
				onRequestClose={() => setIsOptionsOpen(false)}
				slideY={slideY}
				containerHeight={height}
				styles={styles}
				COLORS={COLORS}
				onShare={handleSharePress}
				onOpenAbout={() => {
					setIsOptionsOpen(false);
					aboutSlideY.setValue(height);
					setIsAboutOpen(true);
					Animated.timing(aboutSlideY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
				}}
				allowDelete={accountId === post?.account?.id}
				onDelete={handleDeletePost}
			/>

			<PostAboutModal
				visible={isAboutOpen}
				onRequestClose={() => setIsAboutOpen(false)}
				aboutSlideY={aboutSlideY}
				containerHeight={height}
				styles={styles}
				COLORS={COLORS}
				post={post}
				onPressViewProfile={() => {
					if (handleAbout) {
						handleAbout(post.id);
						Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
							if (finished) setIsAboutOpen(false);
						});
					} else {
						Toast.show({ type: 'info', text1: 'Ação indisponível', position: 'bottom' });
					}
				}}
			/>
		</>
	);
}

function areEqual(prev: PostCardProps, next: PostCardProps) {
	const prevLikes = prev.post?.likes?.length || 0;
	const nextLikes = next.post?.likes?.length || 0;
	return (
		prev.post.id === next.post.id &&
		prev.post.updatedAt === next.post.updatedAt &&
		prevLikes === nextLikes &&
		prev.accountId === next.accountId &&
		prev.postOptions === next.postOptions
	);
}

const PostCard = React.memo(PostCardComponent, areEqual);
export default PostCard;

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
	return StyleSheet.create({
		postContainer: {
			backgroundColor: COLORS.quarternary,
			display: 'flex',
			flexDirection: 'column',
			maxWidth: '100%',
			width: '100%',
			gap: 8,
			borderRadius: 16,
			padding: 5,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.2,
			shadowRadius: 3,
			elevation: 2,
		},
		postContent: {
			display: 'flex',
			flexDirection: 'column',
			backgroundColor: COLORS.tertiary,
			width: '100%',
			borderRadius: 16,
			padding: 12,
			gap: 8,
		},
		postHeader: {
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		postProfileContainer: {
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'row',
			gap: 10,
			paddingVertical: 6,
			paddingHorizontal: 4,
			borderRadius: 50,
		},
		profileInfo: {
			display: 'flex',
			flexDirection: 'column',
			gap: 2,
		},
		profileName: {
			fontWeight: 'bold',
			fontSize: 16,
			color: COLORS.text,
		},
		postDate: {
			fontSize: 12,
			color: COLORS.text,
			opacity: 0.7,
		},
		postOptions: {
			display: 'flex',
			alignItems: 'center',
			backgroundColor: COLORS.quarternary,
			padding: 6,
			borderRadius: 999,
			justifyContent: 'center',
		},
		postText: {
			color: COLORS.text,
		},
		avatar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			borderWidth: 1.5,
			borderColor: COLORS.text,
			backgroundColor: COLORS.bg,
		},
		optionsContainer: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingBottom: 5,
			gap: 6,
		},
		itemOptionsContainer: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 4,
		},
		metaText: {
			color: COLORS.text,
		},
		circleIcon: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: COLORS.tertiary,
			minWidth: 30,
			height: 30,
			borderRadius: 15,
		},
		shareIconContainer: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		shareMessage: {
			position: 'absolute',
			bottom: -24,
			left: '50%',
			transform: [{ translateX: -50 }],
			backgroundColor: COLORS.primary,
			color: COLORS.text,
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 6,
			fontSize: 12,
		},
		picturesScroll: {
			position: 'relative',
			width: '100%',
			borderRadius: 12,
			overflow: 'hidden',
		},
		carouselDots: {
			position: 'absolute',
			bottom: 8,
			left: 0,
			right: 0,
			flexDirection: 'row',
			justifyContent: 'center',
			gap: 6,
		},
		dot: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: COLORS.tertiary,
			opacity: 0.6,
		},
		dotActive: {
			opacity: 1,
			backgroundColor: COLORS.text,
		},
		postPicture: {
			position: 'relative',
			width: '100%',
			borderRadius: 12,
			overflow: 'hidden',
		},
		postPictureImage: {
			width: '100%',
			borderRadius: 12,
			aspectRatio: 1,
			resizeMode: 'cover',
		},
		// Bottom sheet modal
		modalOverlay: {
			flex: 1,
			justifyContent: 'flex-end',
		},
		modalBackdrop: {
			...StyleSheet.absoluteFillObject as any,
			backgroundColor: 'rgba(0,0,0,0.3)',
		},
		bottomSheet: {
			backgroundColor: COLORS.secondary,
			maxHeight: '90%',
			minHeight: '50%',
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
			overflow: 'hidden',
		},
		sheetHandleContainer: {
			alignItems: 'center',
			paddingTop: 8,
		},
		sheetHandle: {
			width: 40,
			height: 4,
			borderRadius: 2,
			backgroundColor: COLORS.tertiary,
			opacity: 0.6,
		},
		sheetHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 12,
			paddingVertical: 10,
		},
		sheetTitle: {
			color: COLORS.text,
			fontWeight: '700',
			fontSize: 16,
		},
		closeBtn: {
			padding: 6,
			borderRadius: 20,
		},
		sheetContent: {
			paddingHorizontal: 12,
			paddingBottom: 20,
			gap: 8,
		},
		commentItem: {
			backgroundColor: COLORS.quarternary,
			padding: 10,
			borderRadius: 10,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			gap: 8,
		},
		commentContent: {
			flex: 1,
		},
		commentText: {
			color: COLORS.text,
		},
		commentMeta: {
			color: COLORS.text,
			opacity: 0.6,
			fontSize: 10,
			marginTop: 4,
		},
		commentActions: {
			flexDirection: 'row',
			gap: 8,
		},
		commentActionButton: {
			padding: 6,
			borderRadius: 6,
			backgroundColor: COLORS.tertiary,
		},
		editActions: {
			flexDirection: 'row',
			gap: 8,
			marginTop: 12,
		},
		cancelButton: {
			backgroundColor: COLORS.tertiary,
			flex: 1,
		},
		commentEmpty: {
			color: COLORS.text,
			opacity: 0.8,
			textAlign: 'center',
			paddingVertical: 24,
		},
		loadMoreBtn: {
			alignSelf: 'center',
			backgroundColor: COLORS.tertiary,
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 8,
			marginTop: 8,
		},
		loadMoreText: {
			color: COLORS.text,
			fontWeight: '600',
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
		optModalOverlay: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
		optPanel: {
			minWidth: 280,
			maxWidth: 320,
			backgroundColor: COLORS.quarternary,
			borderRadius: 16,
			borderWidth: 2,
			borderColor: COLORS.primary,
			padding: 12,
			gap: 6,
			elevation: 6,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 6,
		},
		optClose: {
			position: 'absolute',
			top: 10,
			right: 10,
			padding: 6,
			borderRadius: 12,
			backgroundColor: 'rgba(255,255,255,0.08)',
		},
		optItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			paddingVertical: 10,
			paddingHorizontal: 6,
			borderRadius: 10,
		},
		optText: {
			color: COLORS.text,
			fontSize: 14,
			fontWeight: '500',
		},
		optSeparator: {
			height: 1,
			backgroundColor: COLORS.primary,
			opacity: 0.2,
			marginVertical: 4,
		},
		optCancel: {
			marginTop: 6,
			backgroundColor: COLORS.primary,
			paddingVertical: 10,
			borderRadius: 10,
			alignItems: 'center',
		},
		optCancelText: {
			color: COLORS.text,
			fontWeight: '700',
		},
	});
}

