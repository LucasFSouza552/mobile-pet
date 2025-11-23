import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IPost } from '../../models/IPost';
import { IComment } from '../../models/IComment';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';
import { formatDate } from '../../utils/date';
import { darkTheme, lightTheme } from '../../theme/Themes';
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
	const { COLORS } = useTheme();
	const styles = makeStyles(COLORS);
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
	const editCommentModal = useEditCommentModal({ postId: post?.id });
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
						styles={styles}
						formatDate={formatDate}
						onPressProfile={() => navigation.navigate('Main', { screen: 'Profile', params: { accountId: post?.account?.id } })}
						onOpenOptions={optionsModal.openOptionsSheet}
					/>
					<PostContent post={post} styles={styles} />
				</View>
				<OptionsBarView
					post={post}
					styles={styles}
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
							navigation.navigate('Main', { screen: 'Profile', params: { accountId: post?.account?.id } });
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
	return (
		prev.post.id === next.post.id &&
		prev.post.updatedAt === next.post.updatedAt &&
		prevLikes === nextLikes &&
		prev.accountId === next.accountId
	);
}

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
			color: COLORS.bg,
			fontWeight: '700',
		},
	});
}

const PostCard = React.memo(PostCardComponent, areEqual);
export default PostCard;
