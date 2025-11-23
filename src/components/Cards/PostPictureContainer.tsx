import React, { useState } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet, Text } from 'react-native';
import { Images } from '../../../assets';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../theme/Themes';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function PostPictureContainer({
	images,
}: {
	images: string[];
}) {
	if (!images || images.length === 0) return null as any;

	const { COLORS } = useTheme();
	const [activeIndex, setActiveIndex] = useState(0);
	const [containerWidth, setContainerWidth] = useState(screenWidth);
	const styles = makeStyles(COLORS);

	return (
		<View
			style={styles.picturesScroll}
			onLayout={({ nativeEvent }) => {
				const width = nativeEvent?.layout?.width || screenWidth;
				if (width && width !== containerWidth) setContainerWidth(width);
			}}
		>
			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				decelerationRate="fast"
				snapToInterval={containerWidth}
				scrollEventThrottle={16}
				onScroll={({ nativeEvent }) => {
					const x = nativeEvent?.contentOffset?.x ?? 0;
					const idx = Math.round(x / Math.max(containerWidth, 1));
					if (idx !== activeIndex) setActiveIndex(idx);
				}}
			>
				{images.map((imageId) => (
					<View key={imageId} style={[styles.postPicture, { width: containerWidth }]}>
						<Image
							source={pictureRepository.getSource(imageId)}
							style={styles.postPictureImage}
							defaultSource={Images.avatarDefault as unknown as number}
							resizeMode="cover"
						/>
					</View>
				))}
			</ScrollView>

			{images.length > 1 && (
				<>
					<View style={styles.carouselDots}>
						{images.map((_: any, i: number) => (
							<View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
						))}
					</View>
					<View style={styles.imageCounter}>
						<Text style={styles.imageCounterText}>
							{activeIndex + 1} / {images.length}
						</Text>
					</View>
				</>
			)}
		</View>
	);
}


function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
	return StyleSheet.create({
		picturesScroll: {
			position: 'relative',
			width: '100%',
			borderRadius: 12,
			overflow: 'hidden',
		},
		postPicture: {
			position: 'relative',
			width: '100%',
			aspectRatio: 1,
		},
		postPictureImage: {
			width: '100%',
			height: '100%',
		},
		carouselDots: {
			position: 'absolute',
			bottom: 12,
			left: 0,
			right: 0,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 12,
		},
		dot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: 'rgba(255, 255, 255, 0.4)',
		}, 
		dotActive: {
			width: 24,
			backgroundColor: '#B648A0',
		},
		imageCounter: {
			position: 'absolute',
			top: 12,
			right: 12,
			backgroundColor: 'rgba(0, 0, 0, 0.6)',
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 12,
		},
		imageCounterText: {
			color: '#fff',
			fontSize: 12,
			fontWeight: '600',
		},
	});
}