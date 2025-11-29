import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import PostCard from './PostCard';
import type { IPost } from '../../models/IPost';
import type { IAccount } from '../../models/IAccount';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

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
	const { COLORS, FONT_SIZE } = useTheme();
	const styles = makeStyles(COLORS, FONT_SIZE);

	const renderItem = useCallback(({ item }: { item: IPost; index: number }) => {
		return (
			<View style={styles.postWrapper}>
				<PostCard
					post={item}
					accountId={account?.id}
				/>
			</View>
		);
	}, [account?.id, styles.postWrapper]);

	const keyExtractor = useCallback((item: IPost) => item.id, []);

	const listEmptyComponent = useMemo(() => {
		return (
			<View>
				<Text style={styles.empty}>{emptyMessage || 'Sem posts'}</Text>
			</View>
		);
	}, [emptyMessage, styles.empty]);

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
	}, [headerComponent, title, styles.title]);

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

function makeStyles(COLORS: ThemeColors, FONT_SIZE: { large: number }) {
	return StyleSheet.create({
		container: {
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			flex: 1,
		},
		title: {
			color: COLORS.text,
			fontSize: FONT_SIZE.large,
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
			color: COLORS.text,
			opacity: 0.6,
			textAlign: 'center',
			paddingVertical: 24,
		},
	});
}

