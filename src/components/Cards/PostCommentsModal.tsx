import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, FlatList, ActivityIndicator, TextInput, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IComment } from '../../models/IComment';
import { formatDate } from '../../utils/date';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { Images } from '../../../assets';

interface CommentItemProps {
	item: IComment;
	isOwner: boolean;
	accountName: string;
	accountAvatar?: string;
	commentStyles: ReturnType<typeof makeCommentStyles>;
	COLORS: any;
	onEditComment: (comment: IComment) => void;
	onDeleteComment: (comment: IComment) => void;
}

function CommentItem({ item, isOwner, accountName, accountAvatar, commentStyles, COLORS, onEditComment, onDeleteComment }: CommentItemProps) {
	const [imageError, setImageError] = useState(false);

	const isEdited = item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt;

	return (
		<View style={commentStyles.commentItem}>
			<Image
				source={imageError || !accountAvatar
					? Images.avatarDefault
					: pictureRepository.getSource(accountAvatar)}
				style={commentStyles.avatar}
				onError={() => setImageError(true)}
				defaultSource={Images.avatarDefault as unknown as number}
			/>
			<View style={commentStyles.commentContent}>
				<View style={commentStyles.commentHeader}>
					<Text style={commentStyles.commentAuthor}>{accountName}</Text>
					<View style={(commentStyles as any).commentMetaContainer}>
						<Text style={commentStyles.commentMeta}>
							{formatDate(item.createdAt)}
						</Text>
						{isEdited && (
							<Text style={commentStyles.editedLabel}> • editado</Text>
						)}
					</View>
				</View>
				<Text style={commentStyles.commentText}>{item.content}</Text>
			</View>
			{isOwner && (
				<View style={commentStyles.commentActions}>
					<TouchableOpacity
						onPress={() => onEditComment(item)}
						style={commentStyles.commentActionButton}
					>
						<MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => onDeleteComment(item)}
						style={commentStyles.commentActionButton}
					>
						<MaterialCommunityIcons name="delete" size={16} color="#E74C3C" />
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

function makeCommentStyles(COLORS: any) {
	return StyleSheet.create({
		commentItem: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			padding: 12,
			marginBottom: 8,
			backgroundColor: COLORS.quarternary,
			borderRadius: 12,
			gap: 12,
		},
		avatar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: COLORS.iconBackground,
			borderWidth: 2,
			borderColor: COLORS.primary + '30',
		},
		commentContent: {
			flex: 1,
			gap: 4,
			display: 'flex'
		},
		commentHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: 4,
			flexWrap: 'wrap',
		},
		commentAuthor: {
			fontSize: 14,
			fontWeight: '700',
			color: COLORS.text,
			marginRight: 8,
		},
		commentMetaContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			flexShrink: 1,
		},
		commentText: {
			fontSize: 14,
			color: COLORS.text,
			lineHeight: 20,
			marginTop: 2,
		},
		commentMeta: {
			fontSize: 11,
			color: COLORS.text,
			opacity: 0.6,
		},
		editedLabel: {
			fontSize: 11,
			color: COLORS.text,
			opacity: 0.5,
			fontStyle: 'italic',
			marginLeft: 2,
		},
		commentActions: {
			flexDirection: 'row',
			gap: 8,
			alignItems: 'flex-start',
			paddingTop: 4,
		},
		commentActionButton: {
			padding: 6,
			borderRadius: 6,
			backgroundColor: COLORS.tertiary,
		},
	});
}

interface PostCommentsModalProps {
	visible: boolean;
	onRequestClose: () => void;
	slideY: Animated.Value;
	styles: any;
	COLORS: any;
	comments: IComment[];
	commentsLoading: boolean;
	hasMoreComments: boolean;
	onEndReached: () => void;
	commentText: string;
	setCommentText: (text: string) => void;
	onSubmitComment: () => void;
	renderIsOwner: (comment: IComment) => boolean;
	onEditComment: (comment: IComment) => void;
	onDeleteComment: (comment: IComment) => void;
}

export default function PostCommentsModal({
	visible,
	onRequestClose,
	slideY,
	styles,
	COLORS,
	comments,
	commentsLoading,
	hasMoreComments,
	onEndReached,
	commentText,
	setCommentText,
	onSubmitComment,
	renderIsOwner,
	onEditComment,
	onDeleteComment,
}: PostCommentsModalProps) {
	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={onRequestClose} style={styles.modalOverlay}>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onRequestClose} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Coment?rios</Text>
						<TouchableOpacity onPress={onRequestClose} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={comments}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => {
							const isOwner = renderIsOwner(item);
							// Garante que o account seja sempre um objeto, preservando os dados
							const account = typeof item.account === 'object'
								? item.account
								: typeof item.account === 'string'
									? { id: item.account }
									: null;
							const accountName = account?.name || 'Usu?rio';
							const accountAvatar = account?.avatar;
							const commentStyles = makeCommentStyles(COLORS);

							return (
								<CommentItem
									item={item}
									isOwner={isOwner}
									accountName={accountName}
									accountAvatar={accountAvatar}
									commentStyles={commentStyles}
									COLORS={COLORS}
									onEditComment={onEditComment}
									onDeleteComment={onDeleteComment}
								/>
							);
						}}
						onEndReachedThreshold={0.2}
						onEndReached={() => {
							if (hasMoreComments && !commentsLoading) {
								onEndReached();
							}
						}}
						ListEmptyComponent={!commentsLoading ? <Text style={styles.commentEmpty}>Sem coment?rios</Text> : null}
						ListFooterComponent={commentsLoading ? <ActivityIndicator color={COLORS.primary} style={{ padding: 12 }} /> : null}
						contentContainerStyle={styles.sheetContent}
					/>
					<View style={styles.commentBar}>
						<TextInput
							value={commentText}
							onChangeText={setCommentText}
							placeholder="Escreva um coment?rio..."
							placeholderTextColor={COLORS.text}
							style={styles.commentInput}
							multiline
						/>
						<TouchableOpacity
							style={styles.commentButton}
							onPress={onSubmitComment}
						>
							<Text style={styles.commentButtonText}>Enviar</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}


