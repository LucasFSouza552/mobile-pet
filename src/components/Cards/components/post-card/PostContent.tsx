import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IPost } from '../../../../models/IPost';
import PostPictureContainer from '../../../Cards/PostPictureContainer';

interface PostContentProps {
	post: IPost;
	styles: any;
}

export default function PostContent({ post, styles }: PostContentProps) {
	return (
		<>
			<Text style={styles.postText}>{post.content || 'Sem conteúdo'}</Text>
			{post?.image && <PostPictureContainer images={post.image} />}
		</>
	);
}

