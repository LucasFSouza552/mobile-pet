import React, { useState } from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';
import { Images } from '../../../assets';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';

const screenWidth = Dimensions.get('window').width;

export default function PostPictureContainer({
	images,
	styles,
}: {
	images: string[];
	styles: any;
}) {
	if (!images || images.length === 0) return null as any;

	const [activeIndex, setActiveIndex] = useState(0);
	const [containerWidth, setContainerWidth] = useState(screenWidth);

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
							style={[styles.postPictureImage, { width: containerWidth }]}
							defaultSource={Images.avatarDefault as unknown as number}
							resizeMode="contain"
						/>
					</View>
				))}
			</ScrollView>

			{images.length > 1 && <View style={styles.carouselDots}>
				{images.map((_: any, i: number) => (
					<View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
				))}
			</View>}
		</View>
	);
}


