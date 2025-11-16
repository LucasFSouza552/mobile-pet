import React from 'react';
import { Animated } from 'react-native';

export function useLikeButton() {
	const likeScale = React.useRef(new Animated.Value(1)).current;
	const pulse = React.useCallback(() => {
		Animated.sequence([
			Animated.timing(likeScale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
			Animated.timing(likeScale, { toValue: 1.0, duration: 120, useNativeDriver: true }),
		]).start();
	}, [likeScale]);
	return { likeScale, pulse };
}


