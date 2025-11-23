import React from 'react';
import { useWindowDimensions } from 'react-native';
import { IPost } from '../../../../models/IPost';
import { IComment } from '../../../../models/IComment';
import PostCommentsModal from '../../../Cards/PostCommentsModal';
import PostEditCommentModal from '../../../Cards/PostEditCommentModal';
import PostOptionsModal from '../../../Cards/PostOptionsModal';
import PostAboutModal from '../../../Cards/PostAboutModal';
import PostEditModal from '../../../Cards/PostEditModal';

interface PostModalsProps {
	post: IPost;
	styles: any;
	COLORS: any;
	commentsModal: {
		isOpen: boolean;
		commentText: string;
		setCommentText: (text: string) => void;
		slideY: any;
		comments: IComment[];
		loading: boolean;
		hasMore: boolean;
		load: (reset: boolean) => void;
		remove: (commentId: string) => void;
		update: (comment: IComment) => void;
		closeComments: () => void;
		handleSubmitComment: () => void;
		renderIsOwner: (comment: IComment) => boolean;
		onEditComment: (comment: IComment) => void;
		handleDeleteComment: (comment: IComment) => void;
	};
	editCommentModal: {
		isOpen: boolean;
		editCommentText: string;
		setEditCommentText: (text: string) => void;
		saving: boolean;
		editSlideY: any;
		closeEditModal: () => void;
		saveEditedComment: () => void;
	};
	optionsModal: {
		isOpen: boolean;
		slideY: any;
		closeOptionsSheet: () => void;
		handleDeletePost: () => void;
		handleOpenAbout: () => void;
		handleOpenEdit: () => void;
		onShare: () => void;
		isOwner: boolean;
	};
	aboutModal: {
		isOpen: boolean;
		aboutSlideY: any;
		closeAboutModal: () => void;
		onPressViewProfile: () => void;
	};
	editPostModal: {
		isOpen: boolean;
		postEditText: string;
		setPostEditText: (text: string) => void;
		saving: boolean;
		postEditSlideY: any;
		closeEditModal: () => void;
		savePostEdit: () => void;
	};
}

export default function PostModals({
	post,
	styles,
	COLORS,
	commentsModal,
	editCommentModal,
	optionsModal,
	aboutModal,
	editPostModal,
}: PostModalsProps) {
	const { height } = useWindowDimensions();

	return (
		<>
			<PostCommentsModal
				visible={commentsModal.isOpen}
				onRequestClose={commentsModal.closeComments}
				slideY={commentsModal.slideY}
				styles={styles}
				COLORS={COLORS}
				comments={commentsModal.comments}
				commentsLoading={commentsModal.loading}
				hasMoreComments={commentsModal.hasMore}
				onEndReached={() => commentsModal.load(false)}
				commentText={commentsModal.commentText}
				setCommentText={commentsModal.setCommentText}
				onSubmitComment={commentsModal.handleSubmitComment}
				renderIsOwner={commentsModal.renderIsOwner}
				onEditComment={commentsModal.onEditComment}
				onDeleteComment={commentsModal.handleDeleteComment}
			/>

			<PostEditCommentModal
				visible={editCommentModal.isOpen}
				onRequestClose={editCommentModal.closeEditModal}
				editSlideY={editCommentModal.editSlideY}
				styles={styles}
				COLORS={COLORS}
				editCommentText={editCommentModal.editCommentText}
				setEditCommentText={editCommentModal.setEditCommentText}
				editSaving={editCommentModal.saving}
				onSave={editCommentModal.saveEditedComment}
			/>

			<PostOptionsModal
				visible={optionsModal.isOpen}
				onRequestClose={optionsModal.closeOptionsSheet}
				slideY={optionsModal.slideY}
				containerHeight={height}
				styles={styles}
				COLORS={COLORS}
				onShare={optionsModal.onShare}
				onOpenAbout={optionsModal.handleOpenAbout}
				allowDelete={optionsModal.isOwner}
				onDelete={optionsModal.handleDeletePost}
				allowEdit={optionsModal.isOwner}
				onEdit={optionsModal.handleOpenEdit}
			/>

			<PostAboutModal
				visible={aboutModal.isOpen}
				onRequestClose={aboutModal.closeAboutModal}
				aboutSlideY={aboutModal.aboutSlideY}
				containerHeight={height}
				styles={styles}
				COLORS={COLORS}
				post={post}
				onPressViewProfile={aboutModal.onPressViewProfile}
			/>

			<PostEditModal
				visible={editPostModal.isOpen}
				onRequestClose={editPostModal.closeEditModal}
				slideY={editPostModal.postEditSlideY}
				containerHeight={height}
				styles={styles}
				COLORS={COLORS}
				value={editPostModal.postEditText}
				onChangeText={editPostModal.setPostEditText}
				onSave={editPostModal.savePostEdit}
				saving={editPostModal.saving}
			/>
		</>
	);
}

