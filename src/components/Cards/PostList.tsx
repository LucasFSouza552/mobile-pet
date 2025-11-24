import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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
	onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
	headerComponent?: React.ReactElement | null;
	emptyMessage?: string;
}

export default function PostList({ title, posts, account, onEndReached, onRefresh, refreshing, onScroll, headerComponent, emptyMessage }: PostListProps) {

	const renderItem = useCallback(({ item }: { item: IPost; index: number }) => {
		return (
			<View style={styles.postWrapper}>
				<PostCard
					post={item}
					accountId={account?.id}
				/>
			</View>
		);
	}, [account?.id]);

	const keyExtractor = useCallback((item: IPost) => item.id, []);

	const emptyComponent = useMemo(() => <Text style={styles.empty}>{emptyMessage || 'Sem posts'}</Text>, [emptyMessage]);

	const listEmptyComponent = useMemo(() => {
		if (headerComponent) {
			return (
				<View>
					{headerComponent}
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.empty}>{emptyMessage || 'Sem posts'}</Text>
				</View>
			);
		}
		return emptyComponent;
	}, [headerComponent, title, emptyComponent, emptyMessage]);

	const listHeader = useMemo(() => {
		if (!headerComponent) {
			return <Text style={styles.title}>{title}</Text>;
		}
		return (
			<View>
				{headerComponent}
				<Text style={styles.title}>{title}</Text>
			</View>
		);
	}, [headerComponent, title]);

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={listHeader}
				showsVerticalScrollIndicator={false}
				refreshing={!!refreshing}
				onRefresh={onRefresh}
				alwaysBounceVertical
				onEndReachedThreshold={0.2}
				onEndReached={onEndReached}
				ListEmptyComponent={listEmptyComponent}
				initialNumToRender={6}
				maxToRenderPerBatch={8}
				updateCellsBatchingPeriod={50}
				windowSize={5}
				removeClippedSubviews
				onScroll={onScroll}
				scrollEventThrottle={16}
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

