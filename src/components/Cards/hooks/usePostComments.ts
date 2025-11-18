import React from 'react';
import { IComment } from '../../../models/IComment';
import { commentRepository } from '../../../data/remote/repositories/commentsRemoteRepository';

export function usePostComments(postId?: string) {
	const [comments, setComments] = React.useState<IComment[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(1);
	const [hasMore, setHasMore] = React.useState(true);

	const load = React.useCallback(async (reset: boolean) => {
		if (!postId) return;
		try {
			setLoading(true);
			const pageToLoad = reset ? 1 : page;
			const fetched: IComment[] = await commentRepository.fetchCommentsByPost(postId, pageToLoad, 10);
			if (reset) {
				setComments(fetched);
			} else {
				const existing = new Set(comments.map(c => c.id));
				const merged = [...comments, ...fetched.filter(c => !existing.has(c.id))];
				setComments(merged);
			}
			setHasMore(fetched.length >= 10);
			setPage(pageToLoad + 1);
		} finally {
			setLoading(false);
		}
	}, [postId, page, comments]);

	const add = React.useCallback(async (text: string) => {
		if (!postId || !text.trim()) return;
		const created = await commentRepository.createComment(postId, text.trim());
		setComments(prev => [created, ...prev]);
	}, [postId]);

	const remove = React.useCallback(async (commentId: string) => {
		await commentRepository.deleteOwnComment(commentId);
		setComments(prev => prev.filter(c => c.id !== commentId));
	}, []);

	const update = React.useCallback((updated: IComment) => {
		setComments(prev => {
			const index = prev.findIndex(c => c.id === updated.id);
			if (index === -1) {
				// Se não encontrar, adiciona no início
				return [updated, ...prev];
			}
			// Atualiza o comentário mantendo a ordem
			const newComments = [...prev];
			newComments[index] = updated;
			return newComments;
		});
	}, []);

	return { comments, loading, page, hasMore, load, add, remove, update, setComments };
}


