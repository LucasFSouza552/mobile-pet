import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.005,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.15,
    height: width * 0.15,
    maxWidth: 60,
    minWidth: 40,
  },
  formContainer: {
    backgroundColor: '#2C2C2C',
    marginHorizontal: width * 0.08,
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.03,
    marginTop: height * 0.05,
    marginBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.008,
  },
  subtitle: {
    fontSize: width * 0.035,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.025,
    opacity: 0.8,
  },
  selectionContainer: {
    marginBottom: height * 0.03,
  },
  selectionTitle: {
    fontSize: width * 0.04,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.02,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  selectionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: width * 0.03,
    paddingVertical: height * 0.015,
    alignItems: 'center',
    marginHorizontal: width * 0.01,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectionButtonActive: {
    backgroundColor: '#B648A0',
    borderColor: '#B648A0',
  },
  selectionButtonText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333333',
  },
  selectionButtonTextActive: {
    color: '#ffffff',
  },
  continueButton: {
    backgroundColor: '#B648A0',
    borderRadius: width * 0.03,
    paddingVertical: height * 0.015,
    alignItems: 'center',
    marginBottom: height * 0.02,
    shadowColor: '#B648A0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#666666',
    shadowColor: '#666666',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: width * 0.04,
  },
  backLinkText: {
    color: '#B648A0',
    fontWeight: '600',
  },
});
