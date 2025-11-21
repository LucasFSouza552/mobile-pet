import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface PostOptionsModalProps {
	visible: boolean;
	onRequestClose: () => void;
	slideY: Animated.Value;
	containerHeight: number;
	styles: any;
	COLORS: any;
	onShare: () => Promise<void> | void;
	onOpenAbout: () => void;
	allowDelete: boolean;
	onDelete: () => Promise<void> | void;
	allowEdit: boolean;
	onEdit: () => void;
}

export default function PostOptionsModal({
	visible,
	onRequestClose,
	slideY,
	containerHeight,
	styles,
	COLORS,
	onShare,
	onOpenAbout,
	allowDelete,
	onDelete,
	allowEdit,
	onEdit,
}: PostOptionsModalProps) {
	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={() => {
			Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
				if (finished) onRequestClose();
			});
		}} style={styles.modalOverlay}>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => {
					Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
						if (finished) onRequestClose();
					});
				}} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Opções</Text>
						<TouchableOpacity onPress={() => {
							Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
								if (finished) onRequestClose();
							});
						}} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>

					<View style={styles.sheetContent}>
						<TouchableOpacity
							style={styles.optItem}
							onPress={async () => {
								Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(async ({ finished }) => {
									if (finished) onRequestClose();
									await onShare();
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
								Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
									if (finished) {
										onRequestClose();
										onOpenAbout();
									}
								});
							}}
						>
							<MaterialCommunityIcons name="account" size={18} color={COLORS.primary} />
							<Text style={styles.optText}>Sobre a conta</Text>
						</TouchableOpacity>

						<View style={styles.optSeparator} />

						{allowEdit && (
							<>
								<TouchableOpacity
									style={styles.optItem}
									onPress={() => {
										Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
											if (finished) {
												onRequestClose();
												onEdit();
											}
										});
									}}
								>
									<Feather name="edit-2" size={18} color={COLORS.primary} />
									<Text style={styles.optText}>Editar post</Text>
								</TouchableOpacity>
								<View style={styles.optSeparator} />
							</>
						)}

						{allowDelete && (
							<TouchableOpacity
								style={styles.optItem}
								onPress={() => {
									Alert.alert(
										'Excluir post',
										'Tem certeza que deseja excluir este post?',
										[
											{ text: 'Cancelar', style: 'cancel' },
											{
												text: 'Excluir',
												style: 'destructive',
												onPress: async () => {
													await onDelete();
													Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
														if (finished) onRequestClose();
													});
												},
											},
										],
										{ cancelable: true }
									);
								}}
							>
								<MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" />
								<Text style={[styles.optText, { color: '#E74C3C' }]}>Excluir post</Text>
							</TouchableOpacity>
						)}
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}


