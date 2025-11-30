import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { IPost } from '../../models/IPost';
import { Images } from '../../../assets';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

interface PostHeaderViewProps {
	post: IPost;
	formatDate: (dateString?: string) => string;
	onPressProfile: () => void;
	onOpenOptions: () => void;
}

export default function PostHeaderView({
	post,
	formatDate,
	onPressProfile,
	onOpenOptions,
}: PostHeaderViewProps) {
	const { COLORS } = useTheme();
	const styles = makeStyles(COLORS);
	const [imageError, setImageError] = useState(false);

	useEffect(() => {
		setImageError(false);
	}, [post.account?.avatar]);

	const imageSource = imageError || !post.account?.avatar 
		? Images.avatarDefault 
		: pictureRepository.getSource(post.account.avatar);

	return (
		<View style={styles.postHeader}>
			<TouchableOpacity
				style={styles.postProfileContainer}
				activeOpacity={0.8}
				onPress={onPressProfile}
			>
				<Image
					key={post.account?.avatar || 'default-avatar'}
					source={imageSource}
					style={styles.avatar}
					onError={() => setImageError(true)}
					defaultSource={Images.avatarDefault as unknown as number}
				/>
				<View style={styles.profileInfo}>
					<Text style={styles.profileName}>{post.account?.name || 'Unknown'}</Text>
					<Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.postOptions}
				activeOpacity={0.7}
				onPress={onOpenOptions}
			>
				<MaterialCommunityIcons name="dots-vertical" size={22} color={COLORS.text} />
			</TouchableOpacity>
		</View>
	);
}

function makeStyles(COLORS: ThemeColors) {
	return StyleSheet.create({
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
		avatar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			borderWidth: 1.5,
			borderColor: COLORS.text,
			backgroundColor: COLORS.iconBackground,
		},
	});
}


