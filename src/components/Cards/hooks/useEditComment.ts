import React from 'react';
import { IComment } from '../../../models/IComment';
import { commentRepository } from '../../../data/remote/repositories/commentsRemoteRepository';

export function useEditComment(onUpdated: (comment: IComment) => void) {
	const [editingComment, setEditingComment] = React.useState<IComment | null>(null);
	const [text, setText] = React.useState('');
	const [saving, setSaving] = React.useState(false);

	const open = React.useCallback((comment: IComment) => {
		setEditingComment(comment);
		setText(comment.content);
	}, []);

	const close = React.useCallback(() => {
		setEditingComment(null);
		setText('');
		setSaving(false);
	}, []);

	const save = React.useCallback(async () => {
		if (!editingComment || !text.trim() || saving) return;
		try {
			setSaving(true);
			const updated = await commentRepository.updateComment(editingComment.id, text.trim());
			onUpdated(updated);
			close();
		} finally {
			setSaving(false);
		}
	}, [editingComment, text, saving, onUpdated, close]);

	return { editingComment, text, setText, saving, open, close, save };
}


