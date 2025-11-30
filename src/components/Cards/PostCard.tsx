import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IPost } from '../../models/IPost';
import { IComment } from '../../models/IComment';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { formatDate } from '../../utils/date';
import { ThemeColors } from '../../theme/types';
import { usePostLike } from './hooks/usePostLike';
import { usePostCommentsModal } from './hooks/usePostCommentsModal';
import { useEditCommentModal } from './hooks/useEditCommentModal';
import { usePostOptionsModal } from './hooks/usePostOptionsModal';
import { usePostAboutModal } from './hooks/usePostAboutModal';
import { usePostEditModal } from './hooks/usePostEditModal';
import { usePostShare } from './hooks/usePostShare';
import PostHeaderView from './PostHeaderView';
import OptionsBarView from './OptionsBarView';
import PostContent from './components/post-card/PostContent';
import PostModals from './components/post-card/PostModals';

interface PostCardProps {
	post: IPost;
	accountId?: string;
	onLike?: (postId: string) => void;
}

function PostCardComponent({
	post,
	accountId,
	onLike,
}: PostCardProps) {
	const { COLORS, GAP, PADDING, getShadow } = useTheme();
	const styles = makeStyles(COLORS, GAP, PADDING, getShadow);
	const { account } = useAccount();
	const { width } = useWindowDimensions();
	const navigation = useNavigation<any>();
	const [deleted, setDeleted] = useState(false);
	const hideMetaText = width < 380;

	if (!post || deleted) return null;

	const isOwner = accountId === post?.account?.id;

	const { isLiked, likeScale, handleLikePress } = usePostLike({ post, accountId, onLike });
	const { showShareMessage, handleSharePress } = usePostShare({ post });
	const commentsModal = usePostCommentsModal({ postId: post?.id });
	const editCommentModal = useEditCommentModal({
		postId: post?.id,
		onCommentUpdated: commentsModal.update,
	});
	const aboutModal = usePostAboutModal();
	const editPostModal = usePostEditModal({ post });
	const optionsModal = usePostOptionsModal({
		post,
		isOwner,
		onShare: handleSharePress,
		onOpenAbout: aboutModal.openAboutModal,
		onOpenEdit: editPostModal.openEditModal,
	});

	const isCommentOwner = (comment: IComment) => {
		if (!account || !comment.account) return false;
		const commentAccountId = typeof comment.account === 'string' ? comment.account : (comment.account as any).id || (comment.account as any)._id;
		return account.id === commentAccountId;
	};

	const handleDeletePost = async () => {
		await optionsModal.handleDeletePost();
		setDeleted(true);
	};

	return (
		<>
			<View style={styles.postContainer}>
				<View style={styles.postContent}>
				<PostHeaderView
					post={post}
					formatDate={formatDate}
					onPressProfile={() => navigation.navigate('ProfileView', { accountId: post?.account?.id })}
					onOpenOptions={optionsModal.openOptionsSheet}
				/>
					<PostContent post={post} styles={styles} />
				</View>
				<OptionsBarView
					post={post}
					isLiked={isLiked}
					hideMetaText={hideMetaText}
					onPressLike={handleLikePress}
					onPressComments={commentsModal.handleCommentsPress}
					onPressShare={handleSharePress}
					showShareMessage={showShareMessage}
					likeScale={likeScale}
				/>
			</View>
			<PostModals
				post={post}
				styles={styles}
				COLORS={COLORS}
				commentsModal={{
					...commentsModal,
					renderIsOwner: isCommentOwner,
					onEditComment: editCommentModal.openEditModal,
					handleDeleteComment: commentsModal.handleDeleteComment,
				}}
				editCommentModal={editCommentModal}
				optionsModal={{
					...optionsModal,
					handleDeletePost,
					onShare: handleSharePress,
					isOwner,
				}}
				aboutModal={{
					...aboutModal,
					onPressViewProfile: () => {
						try {
							navigation.navigate('ProfileView', { accountId: post?.account?.id });
						} finally {
							aboutModal.closeAboutModal();
						}
					},
				}}
				editPostModal={editPostModal}
			/>
		</>
	);
}

function areEqual(prev: PostCardProps, next: PostCardProps) {
	const prevLikes = prev.post?.likes?.length || 0;
	const nextLikes = next.post?.likes?.length || 0;
	
	// Compara avatar do usuário
	const prevAvatar = prev.post?.account?.avatar;
	const nextAvatar = next.post?.account?.avatar;
	const avatarEqual = prevAvatar === nextAvatar;
	
	// Compara imagens do post
	const prevImages = prev.post?.image || [];
	const nextImages = next.post?.image || [];
	const imagesEqual = 
		prevImages.length === nextImages.length &&
		prevImages.every((img, idx) => img === nextImages[idx]);
	
	return (
		prev.post.id === next.post.id &&
		prev.post.updatedAt === next.post.updatedAt &&
		prevLikes === nextLikes &&
		prev.accountId === next.accountId &&
		avatarEqual &&
		imagesEqual
	);
}

function makeStyles(
	COLORS: ThemeColors,
	GAP: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number },
	PADDING: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number },
	getShadow: (level: 'sm' | 'md' | 'lg' | 'xl') => {
		shadowColor: string;
		shadowOffset: { width: number; height: number };
		shadowOpacity: number;
		shadowRadius: number;
		elevation: number;
	}
) {
	const shadowSm = getShadow('sm');
	return StyleSheet.create({
		postContainer: {
			backgroundColor: COLORS.quarternary,
			display: 'flex',
			flexDirection: 'column',
			maxWidth: '100%',
			width: '100%',
			gap: GAP.sm,
			borderRadius: 16,
			padding: PADDING.xs,
			...shadowSm,
		},
		postContent: {
			display: 'flex',
			flexDirection: 'column',
			backgroundColor: COLORS.tertiary,
			width: '100%',
			borderRadius: 16,
			padding: PADDING.md,
			gap: GAP.sm,
		},
		postText: {
			color: COLORS.text,
		},
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
			paddingTop: PADDING.sm,
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
			paddingHorizontal: PADDING.md,
			paddingVertical: PADDING.sm,
		},
		sheetTitle: {
			color: COLORS.text,
			fontWeight: '700',
			fontSize: 16,
		},
		closeBtn: {
			padding: PADDING.xs,
			borderRadius: 20,
		},
		sheetContent: {
			paddingHorizontal: PADDING.md,
			paddingBottom: PADDING.lg,
			gap: GAP.sm,
		},
		commentItem: {
			backgroundColor: COLORS.quarternary,
			padding: PADDING.sm,
			borderRadius: 10,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			gap: GAP.sm,
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
			gap: GAP.sm,
		},
		commentActionButton: {
			padding: PADDING.xs,
			borderRadius: 6,
			backgroundColor: COLORS.tertiary,
		},
		editActions: {
			flexDirection: 'row',
			gap: GAP.sm,
			marginTop: PADDING.md,
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
			paddingHorizontal: PADDING.md,
			paddingVertical: PADDING.sm,
			borderRadius: 8,
			marginTop: PADDING.sm,
		},
		loadMoreText: {
			color: COLORS.text,
			fontWeight: '600',
		},
		commentBar: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: GAP.sm,
			padding: PADDING.md,
			borderTopColor: COLORS.quarternary,
			borderTopWidth: 1,
			backgroundColor: COLORS.secondary,
		},
		commentInput: {
			flex: 1,
			backgroundColor: COLORS.quarternary,
			color: COLORS.text,
			borderRadius: 10,
			paddingHorizontal: PADDING.md,
			paddingVertical: PADDING.sm,
		},
		commentButton: {
			backgroundColor: COLORS.primary,
			paddingHorizontal: PADDING.md,
			paddingVertical: PADDING.sm,
			borderRadius: 10,
		},
		commentButtonText: {
			color: COLORS.text,
			fontWeight: '700',
		},
		optItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: GAP.md,
			paddingVertical: PADDING.sm,
			paddingHorizontal: PADDING.xs,
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
		editPostLabel: {
			color: COLORS.text,
			fontWeight: '600',
			marginBottom: 6,
		},
		editPostInput: {
			backgroundColor: COLORS.quarternary,
			borderRadius: 12,
			color: COLORS.text,
			paddingHorizontal: 12,
			paddingVertical: 12,
			minHeight: 120,
			borderWidth: 1,
			borderColor: COLORS.primary + '22',
		},
		editPostCounter: {
			alignSelf: 'flex-end',
			color: COLORS.text,
			opacity: 0.6,
			fontSize: 12,
			marginTop: 4,
		},
		editPostActions: {
			flexDirection: 'row',
			gap: 10,
			marginTop: 16,
		},
		modalSecondaryButton: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 10,
			backgroundColor: COLORS.tertiary,
			alignItems: 'center',
		},
		modalSecondaryButtonText: {
			color: COLORS.text,
			fontWeight: '600',
		},
		modalPrimaryButton: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 10,
			backgroundColor: COLORS.primary,
			alignItems: 'center',
		},
		modalPrimaryButtonDisabled: {
			opacity: 0.6,
		},
		modalPrimaryButtonText: {
			color: COLORS.iconBackground,
			fontWeight: '700',
		},
	});
}

const PostCard = React.memo(PostCardComponent, areEqual);
export default PostCard;
