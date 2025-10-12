import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 200,
    minWidth: 120,
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.04,
    color: '#B648A0',
    fontWeight: '600',
    marginTop: height * 0.01,
  },
});


