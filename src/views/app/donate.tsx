import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const slides = [
  {
    id: '1',
    title: 'Bem-vindo ao PetAmigo!',
    subtitle: 'Adote, ajude e compartilhe amor pelos animais',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  },
  {
    id: '2',
    title: 'Doe e Salve Vidas',
    subtitle: 'Sua contribuição ajuda a dar abrigo, cuidados e carinho',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
  },
  {
    id: '3',
    title: 'Comece Agora',
    subtitle: 'Explore, descubra e mude a vida de um pet hoje mesmo',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616554.png',
  },
];

export default function Donate({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const { COLORS } = useTheme();
  const width = Dimensions.get('window').width;

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation?.getParent()?.navigate('DonationPage');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.secondary }]}>
      <FlatList
        data={slides}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={[styles.title, { color: COLORS.primary }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: COLORS.text }]}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return <Animated.View key={i} style={[styles.dot, { opacity, backgroundColor: COLORS.primary }]} />;
          })}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleNext}>
          <Text style={[styles.buttonText, { color: COLORS.bg }]}>
            {currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40
  },
  footer: {
    alignItems: 'center',
    marginBottom: 50
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5
  },
  button: {
    padding: 15,
    borderRadius: 30,
    width: 200
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center'
  },
});

