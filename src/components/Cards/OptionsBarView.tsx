import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { IPost } from '../../models/IPost';
import { FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

interface OptionsBarViewProps {
	post: IPost;
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
	isLiked,
	hideMetaText,
	onPressLike,
	onPressComments,
	onPressShare,
	showShareMessage,
	likeScale,
}: OptionsBarViewProps) {
	const { COLORS, FONT_SIZE, GAP, PADDING } = useTheme();
	const styles = makeStyles(COLORS, GAP, PADDING);

	return (
		<View style={styles.optionsContainer}>
			<View style={styles.itemOptionsContainer}>
				<TouchableOpacity style={styles.circleIcon} onPress={onPressLike} activeOpacity={0.8}>
					<Animated.View style={{ transform: [{ scale: likeScale ?? new Animated.Value(1) }] }}>
						<FontAwesome
							name="heart"
							size={FONT_SIZE.medium}
							color={isLiked ? COLORS.primary : COLORS.quinary}
						/>
					</Animated.View>
				</TouchableOpacity>
				{!hideMetaText && (
					<Text style={styles.metaText}>{post?.likes?.length || 0} Curtidas</Text>
				)}
			</View>

			<TouchableOpacity style={styles.itemOptionsContainer} onPress={onPressComments} activeOpacity={0.8}>
				<View style={styles.circleIcon}>
					<Ionicons name="chatbubble" size={FONT_SIZE.medium} color={COLORS.quinary} />
				</View>
				{!hideMetaText && <Text style={styles.metaText}>Comentários</Text>}
			</TouchableOpacity>

			<TouchableOpacity style={styles.itemOptionsContainer} onPress={onPressShare} activeOpacity={0.8}>
				<View style={styles.shareIconContainer}>
					<View style={styles.circleIcon}>
						<FontAwesome name="share-alt" size={FONT_SIZE.medium} color={COLORS.quinary} />
					</View>
					{showShareMessage && <Text style={styles.shareMessage}>Link copiado!</Text>}
				</View>
				{!hideMetaText && <Text style={styles.metaText}>Compartilhar</Text>}
			</TouchableOpacity>
		</View>
	);
}

function makeStyles(
	COLORS: ThemeColors,
	GAP: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number },
	PADDING: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number }
) {
	return StyleSheet.create({
		optionsContainer: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingBottom: PADDING.xs,
			gap: GAP.xs,
		},
		itemOptionsContainer: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: GAP.xs,
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
			paddingHorizontal: PADDING.sm,
			paddingVertical: PADDING.xs,
			borderRadius: 6,
			fontSize: 12,
		},
	});
}


