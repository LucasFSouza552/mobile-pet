import { StyleSheet } from 'react-native';

export const createRegisterStepStyles = (width: number, height: number) => {
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#332630',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: verticalScale(5),
  },
  headerSubtitle: {
    fontSize: scale(14),
    color: '#ddd',
    textAlign: 'center',
  },
  
  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(40),
    paddingHorizontal: scale(20),
  },
  progressStep: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#4A3A46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  progressStepActive: {
    backgroundColor: '#B648A0',
    borderColor: '#B648A0',
  },
  progressStepCompleted: {
    backgroundColor: '#B648A0',
    borderColor: '#B648A0',
  },
  progressLine: {
    width: scale(30),
    height: 2,
    backgroundColor: '#666',
  },
  progressLineActive: {
    backgroundColor: '#B648A0',
  },

  // Form
  formContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(40),
    lineHeight: scale(32),
  },

  // Avatar
  avatarContainer: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    marginBottom: verticalScale(30),
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#B648A0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(182, 72, 160, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Inputs
  input: {
    width: '100%',
    height: verticalScale(55),
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B648A0',
    borderRadius: scale(10),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    color: '#fff',
    marginBottom: verticalScale(20),
  },

  // Password Input with Eye Icon
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B648A0',
    borderRadius: scale(10),
    marginBottom: verticalScale(20),
    backgroundColor: 'transparent',
    height: verticalScale(55),
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    color: '#fff',
  },
  eyeButton: {
    paddingHorizontal: scale(15),
    height: '100%',
    justifyContent: 'center',
  },

  // Hint Text
  hintText: {
    fontSize: scale(12),
    color: '#FFD700',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
  },
  errorHintText: {
    fontSize: scale(12),
    color: '#FF6B6B',
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
  },

  // Document Type Selection
  documentTypeContainer: {
    width: '100%',
    gap: verticalScale(20),
  },
  documentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    backgroundColor: 'rgba(74, 58, 70, 0.5)',
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: scale(15),
    gap: scale(15),
  },
  documentTypeButtonActive: {
    backgroundColor: 'rgba(182, 72, 160, 0.2)',
    borderColor: '#B648A0',
    borderWidth: 3,
  },
  documentTypeTextContainer: {
    flex: 1,
  },
  documentTypeTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#ddd',
    marginBottom: verticalScale(4),
  },
  documentTypeTitleActive: {
    color: '#fff',
  },
  documentTypeSubtitle: {
    fontSize: scale(14),
    color: '#999',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(30),
    width: '100%',
  },
  backButton: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(30),
  },
  backButtonText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#B648A0',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(25),
    minWidth: scale(140),
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  });
};

