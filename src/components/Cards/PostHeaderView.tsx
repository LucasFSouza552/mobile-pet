import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { IPost } from '../../models/IPost';
import { Images } from '../../../assets';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PostHeaderViewProps {
	post: IPost;
	styles: any;
	formatDate: (dateString?: string) => string;
	onPressProfile: () => void;
	onOpenOptions: () => void;
}

export default function PostHeaderView({
	post,
	styles,
	formatDate,
	onPressProfile,
	onOpenOptions,
}: PostHeaderViewProps) {
	return (
		<View style={styles.postHeader}>
			<TouchableOpacity
				style={styles.postProfileContainer}
				activeOpacity={0.8}
				onPress={onPressProfile}
			>
				<Image
					source={pictureRepository.getSource(post.account?.avatar)}
					style={styles.avatar}
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
				<MaterialCommunityIcons name="dots-vertical" size={22} color="#fff" />
			</TouchableOpacity>
		</View>
	);
}


