import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import PostCard from './PostCard';
import type { IPost } from '../../models/IPost';
import type { IAccount } from '../../models/IAccount';

interface PostListProps {
	title: string;
	posts: IPost[];
	account?: IAccount | null;
	onEndReached?: () => void;
	onRefresh?: () => void | Promise<void>;
	refreshing?: boolean;
}

export default function PostList({ title, posts, account, onEndReached, onRefresh, refreshing }: PostListProps) {
	const [postOptions, setPostOptions] = React.useState<string>('');
	const [postAbout, setPostAbout] = React.useState<string>('');

	const handleOptions = useCallback((postId?: string) => {
		const isSamePost = postOptions === postId ? '' : postId || '';
		setPostOptions(isSamePost);
	}, [postOptions]);

	const handleAbout = useCallback((postId?: string) => {
		const isSamePost = postAbout === postId ? '' : postId || '';
		setPostAbout(isSamePost);
		setPostOptions('');
	}, [postAbout]);

	const renderItem = useCallback(({ item }: { item: IPost; index: number }) => {
		return (
			<View style={styles.postWrapper}>
				<PostCard
					post={item}
					accountId={account?.id}
					handleOptions={handleOptions}
					handleAbout={handleAbout}
					postOptions={postOptions}
				/>
			</View>
		);
	}, [account?.id, handleOptions, handleAbout, postOptions]);

	const keyExtractor = useCallback((item: IPost) => item.id, []);

	const emptyComponent = useMemo(() => <Text style={styles.empty}>Sem posts</Text>, []);

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={<Text style={styles.title}>{title}</Text>}
				showsVerticalScrollIndicator={false}
				refreshing={!!refreshing}
				onRefresh={onRefresh}
				alwaysBounceVertical
				onEndReachedThreshold={0.2}
				onEndReached={onEndReached}
				ListEmptyComponent={emptyComponent}
				initialNumToRender={6}
				maxToRenderPerBatch={8}
				updateCellsBatchingPeriod={50}
				windowSize={5}
				removeClippedSubviews
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
	},
	title: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		alignSelf: 'center',
		padding: 15
	},
	listContent: {
		gap: 12,
	},
	postWrapper: {
		flex: 1,
		width: '100%',
		display: 'flex',
		paddingHorizontal: 1,

	},
	empty: {
		color: '#999',
		textAlign: 'center',
		paddingVertical: 24,
	},
});

