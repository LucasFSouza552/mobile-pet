import React from 'react';
import { Animated, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PostEditModalProps {
	visible: boolean;
	onRequestClose: () => void;
	slideY: Animated.Value;
	containerHeight: number;
	styles: any;
	COLORS: any;
	value: string;
	onChangeText: (text: string) => void;
	onSave: () => void;
	saving: boolean;
}

export default function PostEditModal({
	visible,
	onRequestClose,
	slideY,
	containerHeight,
	styles,
	COLORS,
	value,
	onChangeText,
	onSave,
	saving,
}: PostEditModalProps) {
	const handleClose = () => {
		Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
			if (finished) onRequestClose();
		});
	};

	const handleSave = () => {
		if (saving || !value.trim()) return;
		onSave();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={handleClose}
			style={styles.modalOverlay}
		>
			<View style={styles.modalOverlay}>
				<TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleClose} />
				<Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideY }] }]}>
					<View style={styles.sheetHandleContainer}>
						<View style={styles.sheetHandle} />
					</View>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Editar post</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
							<MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
						</TouchableOpacity>
					</View>

					<View style={styles.sheetContent}>
						<Text style={styles.editPostLabel}>Conteúdo</Text>
						<TextInput
							style={styles.editPostInput}
							multiline
							numberOfLines={6}
							textAlignVertical="top"
							placeholder="Atualize o que deseja compartilhar"
							placeholderTextColor={COLORS.text + '88'}
							value={value}
							onChangeText={onChangeText}
						/>
						<Text style={styles.editPostCounter}>{value.length} caracteres</Text>

						<View style={styles.editPostActions}>
							<TouchableOpacity style={[styles.modalSecondaryButton]} onPress={handleClose}>
								<Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalPrimaryButton,
									(saving || !value.trim()) && styles.modalPrimaryButtonDisabled,
								]}
								onPress={handleSave}
								disabled={saving || !value.trim()}
							>
								<Text style={styles.modalPrimaryButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}


