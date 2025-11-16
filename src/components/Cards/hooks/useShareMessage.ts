import React from 'react';

export function useShareMessage(timeoutMs: number = 2000) {
	const [show, setShow] = React.useState(false);
	const trigger = React.useCallback(() => {
		setShow(true);
		const id = setTimeout(() => setShow(false), timeoutMs);
		return () => clearTimeout(id);
	}, [timeoutMs]);
	const hide = React.useCallback(() => setShow(false), []);
	return { show, trigger, hide };
}


