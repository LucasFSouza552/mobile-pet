import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IPost } from '../../models/IPost';
import { Images } from '../../../assets';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';

interface PostAboutModalProps {
	visible: boolean;
	onRequestClose: () => void;
	aboutSlideY: Animated.Value;
	containerHeight: number;
	styles: any;
	COLORS: any;
	post: IPost;
	onPressViewProfile: () => void;
}

export default function PostAboutModal({
	visible,
	onRequestClose,
	aboutSlideY,
	containerHeight,
	styles,
	COLORS,
	post,
	onPressViewProfile,
}: PostAboutModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={() => {
				Animated.timing(aboutSlideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
					if (finished) onRequestClose();
				});
			}}
			style={styles.modalOverlay}
		>
			<View style={styles.modalOverlay}>
				<TouchableOpacity
					style={styles.modalBackdrop}
					activeOpacity={1}
					onPress={() => {
						Animated.timing(aboutSlideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
							if (finished) onRequestClose();
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
								Animated.timing(aboutSlideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
									if (finished) onRequestClose();
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
							onPress={onPressViewProfile}
						>
							<Text style={styles.commentButtonText}>Ver perfil</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}


