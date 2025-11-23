import { useState, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';

export function usePostAboutModal() {
	const { width, height } = useWindowDimensions();
	const [isOpen, setIsOpen] = useState(false);
	const aboutSlideY = useRef(new Animated.Value(height)).current;

	const openAboutModal = () => {
		aboutSlideY.setValue(height);
		setIsOpen(true);
		Animated.timing(aboutSlideY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
	};

	const closeAboutModal = () => {
		Animated.timing(aboutSlideY, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => {
			if (finished) setIsOpen(false);
		});
	};

	return {
		isOpen,
		aboutSlideY,
		openAboutModal,
		closeAboutModal,
	};
}

