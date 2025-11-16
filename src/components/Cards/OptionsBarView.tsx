import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { IPost } from '../../models/IPost';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';

interface OptionsBarViewProps {
	post: IPost;
	styles: any;
	isLiked: boolean;
	hideMetaText: boolean;
	onPressLike: () => void;
	onPressComments: () => void;
	onPressShare: () => void;
	showShareMessage: boolean;
	likeScale?: Animated.Value;
}

export default function OptionsBarView({
	post,
	styles,
	isLiked,
	hideMetaText,
	onPressLike,
	onPressComments,
	onPressShare,
	showShareMessage,
	likeScale,
}: OptionsBarViewProps) {
	return (
		<View style={styles.optionsContainer}>
			<View style={styles.itemOptionsContainer}>
				<TouchableOpacity style={styles.circleIcon} onPress={onPressLike} activeOpacity={0.8}>
					<Animated.View style={{ transform: [{ scale: likeScale ?? new Animated.Value(1) }] }}>
						<FontAwesome
							name="heart"
							size={18}
							color={isLiked ? 'red' : 'white'}
						/>
					</Animated.View>
				</TouchableOpacity>
				{!hideMetaText && (
					<Text style={styles.metaText}>{post?.likes?.length || 0} Curtidas</Text>
				)}
			</View>

			<TouchableOpacity style={styles.itemOptionsContainer} onPress={onPressComments} activeOpacity={0.8}>
				<View style={styles.circleIcon}>
					<Ionicons name="chatbubble" size={18} color="#fff" />
				</View>
				{!hideMetaText && <Text style={styles.metaText}>Comentários</Text>}
			</TouchableOpacity>

			<TouchableOpacity style={styles.itemOptionsContainer} onPress={onPressShare} activeOpacity={0.8}>
				<View style={styles.shareIconContainer}>
					<View style={styles.circleIcon}>
						<Feather name="share-2" size={18} color="#fff" />
					</View>
					{showShareMessage && <Text style={styles.shareMessage}>Link copiado!</Text>}
				</View>
				{!hideMetaText && <Text style={styles.metaText}>Compartilhar</Text>}
			</TouchableOpacity>
		</View>
	);
}


