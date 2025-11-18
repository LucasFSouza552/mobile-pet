import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PostEditCommentModalProps {
	visible: boolean;
	onRequestClose: () => void;
	editSlideY: Animated.Value;
	styles: any;
	COLORS: any;
	editCommentText: string;
	setEditCommentText: (t: string) => void;
	editSaving: boolean;
	onSave: () => void;
}

export default function PostEditCommentModal({
	visible,
	onRequestClose,
	editSlideY,
	styles,
	COLORS,
	editCommentText,
	setEditCommentText,
	editSaving,
	onSave,
}: PostEditCommentModalProps) {
	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={onRequestClose} style={styles.modalOverlay}>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { if (!editSaving) onRequestClose(); }} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: editSlideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Editar comentário</Text>
						<TouchableOpacity onPress={() => { if (!editSaving) onRequestClose(); }} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>
					<View style={styles.sheetContent}>
						<TextInput
							value={editCommentText}
							onChangeText={setEditCommentText}
							placeholder="Edite seu comentário..."
							placeholderTextColor={COLORS.text + '80'}
							style={[
								styles.commentInput, 
								{ 
									color: COLORS.text,
									minHeight: 120,
									paddingTop: 12,
									paddingBottom: 12,
								}
							]}
							multiline
							autoFocus
							editable={!editSaving}
							textAlignVertical="top"
							selectionColor={COLORS.primary}
						/>
						<View style={styles.editActions}>
							<TouchableOpacity
								style={[styles.commentButton, styles.cancelButton]}
								onPress={onRequestClose}
								disabled={editSaving}
							>
								<Text style={styles.commentButtonText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.commentButton}
								onPress={onSave}
								disabled={!editCommentText.trim() || editSaving}
							>
								<Text style={styles.commentButtonText}>{editSaving ? 'Salvando...' : 'Salvar'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}


