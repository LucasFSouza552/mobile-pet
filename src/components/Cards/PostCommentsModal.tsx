import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IComment } from '../../models/IComment';

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
						<Text style={styles.sheetTitle}>Comentários</Text>
						<TouchableOpacity onPress={onRequestClose} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={comments}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => {
							const isOwner = renderIsOwner(item);
							return (
								<View style={styles.commentItem}>
									<View style={styles.commentContent}>
										<Text style={styles.commentText}>{item.content}</Text>
										<Text style={styles.commentMeta}>
											{new Date(item.createdAt).toLocaleString()}
										</Text>
									</View>
									{isOwner && (
										<View style={styles.commentActions}>
											<TouchableOpacity
												onPress={() => onEditComment(item)}
												style={styles.commentActionButton}
											>
												<MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => onDeleteComment(item)}
												style={styles.commentActionButton}
											>
												<MaterialCommunityIcons name="delete" size={16} color="#E74C3C" />
											</TouchableOpacity>
										</View>
									)}
								</View>
							);
						}}
						onEndReachedThreshold={0.2}
						onEndReached={() => {
							if (hasMoreComments && !commentsLoading) {
								onEndReached();
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


