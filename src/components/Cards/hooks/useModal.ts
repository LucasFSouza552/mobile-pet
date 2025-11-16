import React from 'react';
import { Animated } from 'react-native';

export function useModal(containerHeight: number) {
	const [visible, setVisible] = React.useState(false);
	const slideY = React.useRef(new Animated.Value(containerHeight)).current;

	const open = React.useCallback(() => {
		setVisible(true);
		Animated.timing(slideY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
	}, [slideY]);

	const close = React.useCallback(() => {
		Animated.timing(slideY, { toValue: containerHeight, duration: 220, useNativeDriver: true }).start(({ finished }) => {
			if (finished) setVisible(false);
		});
	}, [slideY, containerHeight]);

	return { visible, open, close, slideY };
}


