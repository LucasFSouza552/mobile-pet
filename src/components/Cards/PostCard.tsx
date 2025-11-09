import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Share, useWindowDimensions, Modal, Animated, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { Images } from '../../../assets';
import { FontAwesome, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { IPost } from '../../models/IPost';
import { IComment } from '../../models/IComment';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { usePost } from '../../context/PostContext';
import { darkTheme, lightTheme } from '../../theme/Themes';
import { commentRepository } from '../../data/remote/repositories/commentsRemoteRepository';

const screenWidth = Dimensions.get('window').width;


interface PostCardProps {
	post: IPost;
	accountId?: string;
	onLike?: (postId: string) => void;
	handleOptions: (postId: string) => void;
	handleAbout: (postId: string) => void;
	postOptions: string;
}

const PostPictureContainer = ({ images, styles }: { images: string[]; styles: ReturnType<typeof makeStyles> }) => {
	if (!images || images.length === 0) return null;

	return (
		<View
			style={styles.picturesScroll}
		>
			{images.map((imageId) => (
				<View key={imageId} style={styles.postPicture}>
					<Image
						source={pictureRepository.getSource(imageId)}
						style={styles.postPictureImage}
						defaultSource={Images.avatarDefault as unknown as number}
					/>
				</View>
			))}
		</View>
	);
};

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

	if (!post) return null;

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

	return (
		<>
		<View style={styles.postContainer}>
			<View style={styles.postContent}>
				<View style={styles.postHeader}>
					<TouchableOpacity
						style={styles.postProfileContainer}
						activeOpacity={0.8}
						onPress={() => handleAbout?.(post.account.id)}
					>
						<Image
							source={pictureRepository.getSource(post.account?.avatar)}
							style={styles.avatar}
							defaultSource={Images.avatarDefault as unknown as number}
						/>
						<View style={styles.profileInfo}>
							<Text style={styles.profileName}>{post.account?.name || 'Unknown'}</Text>
							<Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity
						style={styles.postOptions}
						activeOpacity={0.7}
						onPress={() => {
							slideY.setValue(height);
							setIsOptionsOpen(true);
							Animated.timing(slideY, {
								toValue: 0,
								duration: 250,
								useNativeDriver: true,
							}).start();
						}}
					>
						<MaterialCommunityIcons name="dots-vertical" size={22} color="#fff" />
					</TouchableOpacity>
				</View>

				<Text style={styles.postText}>{post.content || 'Sem conteúdo'}</Text>

				{post?.image && <PostPictureContainer images={post.image} styles={styles} />}
			</View>

			<View style={styles.optionsContainer}>
				<View style={styles.itemOptionsContainer}>
					<TouchableOpacity style={styles.circleIcon} onPress={handleLikePress} activeOpacity={0.8}>
						<FontAwesome
							name="heart"
							size={18}
							color={isLiked ? 'red' : 'white'}
						/>
					</TouchableOpacity>
					{!hideMetaText && (
						<Text style={styles.metaText}>{post?.likes?.length || 0} Curtidas</Text>
					)}
				</View>

				<TouchableOpacity style={styles.itemOptionsContainer} onPress={handleCommentsPress} activeOpacity={0.8}>
					<View style={styles.circleIcon}>
						<Ionicons name="chatbubble" size={18} color="#fff" />
					</View>
					{!hideMetaText && <Text style={styles.metaText}>Comentários</Text>}
				</TouchableOpacity>

				<TouchableOpacity style={styles.itemOptionsContainer} onPress={handleSharePress} activeOpacity={0.8}>
					<View style={styles.shareIconContainer}>
						<View style={styles.circleIcon}>
							<Feather name="share-2" size={18} color="#fff" />
						</View>
						{showShareMessage && <Text style={styles.shareMessage}>Link copiado!</Text>}
					</View>
					{!hideMetaText && <Text style={styles.metaText}>Compartilhar</Text>}
				</TouchableOpacity>
			</View>
		</View>

		<Modal visible={isCommentsOpen} transparent animationType="none" onRequestClose={closeComments} style={styles.modalOverlay}>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeComments} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Comentários</Text>
						<TouchableOpacity onPress={closeComments} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={comments}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View style={styles.commentItem}>
								<Text style={styles.commentText}>{item.content}</Text>
								<Text style={styles.commentMeta}>
									{new Date(item.createdAt).toLocaleString()}
								</Text>
							</View>
						)}
						onEndReachedThreshold={0.2}
						onEndReached={() => {
							if (hasMoreComments && !commentsLoading) {
								loadComments(false);
							}
						}}
						ListEmptyComponent={!commentsLoading ? <Text style={styles.commentEmpty}>Sem comentários</Text> : null}
						ListFooterComponent={commentsLoading ? <ActivityIndicator color={COLORS.primary} style={{ padding: 12 }} /> : null}
						contentContainerStyle={styles.sheetContent}
					/>
					<View style={styles.commentBar}>
						<TextInput
							value={commentText}
							onChangeText={setCommentText}
							placeholder="Escreva um comentário..."
							placeholderTextColor={COLORS.text}
							style={styles.commentInput}
							multiline
						/>
						<TouchableOpacity
							style={styles.commentButton}
							onPress={() => {
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
						>
							<Text style={styles.commentButtonText}>Enviar</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>

		<Modal visible={isOptionsOpen} transparent animationType="none" onRequestClose={() => {
			Animated.timing(slideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
				if (finished) setIsOptionsOpen(false);
			});
		}} style={styles.modalOverlay}>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => {
					Animated.timing(slideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
						if (finished) setIsOptionsOpen(false);
					});
				}} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Opções</Text>
						<TouchableOpacity onPress={() => {
							Animated.timing(slideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
								if (finished) setIsOptionsOpen(false);
							});
						}} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>

					<View style={styles.sheetContent}>
						<TouchableOpacity
							style={styles.optItem}
							onPress={async () => {
								Animated.timing(slideY, { toValue: height, duration: 220, useNativeDriver: true }).start(async ({ finished }) => {
									if (finished) setIsOptionsOpen(false);
									await handleSharePress();
								});
							}}
						>
							<Feather name="share-2" size={18} color={COLORS.primary} />
							<Text style={styles.optText}>Compartilhar</Text>
						</TouchableOpacity>

						<View style={styles.optSeparator} />

						<TouchableOpacity
							style={styles.optItem}
							onPress={async () => {
								Animated.timing(slideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
									if (finished) {
										setIsOptionsOpen(false);
										aboutSlideY.setValue(height);
										setIsAboutOpen(true);
										Animated.timing(aboutSlideY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
									}
								});
							}}
						>
							<MaterialCommunityIcons name="account" size={18} color={COLORS.primary} />
							<Text style={styles.optText}>Sobre a conta</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>

		<Modal
			visible={isAboutOpen}
			transparent
			animationType="none"
			onRequestClose={() => {
				Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
					if (finished) setIsAboutOpen(false);
				});
			}}
			style={styles.modalOverlay}
		>
			<View style={styles.modalOverlay}>
				<TouchableOpacity
					style={styles.modalBackdrop}
					activeOpacity={1}
					onPress={() => {
						Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
							if (finished) setIsAboutOpen(false);
						});
					}}
				/>
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: aboutSlideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Sobre a conta</Text>
						<TouchableOpacity
							onPress={() => {
								Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
									if (finished) setIsAboutOpen(false);
								});
							}}
							style={styles.closeBtn}
						>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>

					<View style={[styles.sheetContent, { gap: 12 }]}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
							<Image
								source={pictureRepository.getSource(post.account?.avatar)}
								style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bg }}
								defaultSource={Images.avatarDefault as unknown as number}
							/>
							<View style={{ flex: 1 }}>
								<Text style={[styles.profileName, { fontSize: 18 }]}>{post.account?.name}</Text>
								<Text style={styles.postDate}>{post.account?.email || ''}</Text>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.commentButton, { alignSelf: 'flex-start' }]}
							onPress={() => {
								if (handleAbout) {
									handleAbout(post.id);
									Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
										if (finished) setIsAboutOpen(false);
									});
								} else {
									Toast.show({ type: 'info', text1: 'Ação indisponível', position: 'bottom' });
								}
							}}
						>
							<Text style={styles.commentButtonText}>Ver perfil</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
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
			maxHeight: 100,
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

