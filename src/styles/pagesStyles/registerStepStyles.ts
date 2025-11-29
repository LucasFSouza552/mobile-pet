import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/types';

export const createRegisterStepStyles = (
  width: number, 
  height: number, 
  COLORS: ThemeColors,
  FONT_SIZE: { regular: number; medium: number; large: number }
) => {
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.quarternary,
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
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: verticalScale(5),
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.regular,
    color: COLORS.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  
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
    backgroundColor: COLORS.quinary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.tertiary,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressStepCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressLine: {
    width: scale(30),
    height: 2,
    backgroundColor: COLORS.tertiary,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },

  formContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  title: {
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: verticalScale(40),
    lineHeight: scale(32),
  },

  avatarContainer: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    marginBottom: verticalScale(30),
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputWrapper: {
    width: '100%',
    marginBottom: verticalScale(5),
  },
  input: {
    width: '100%',
    height: verticalScale(55),
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: scale(10),
    paddingHorizontal: scale(20),
    fontSize: FONT_SIZE.regular,
    color: COLORS.text,
    marginBottom: verticalScale(5),
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.error,
    marginTop: verticalScale(-5),
    marginBottom: verticalScale(10),
    marginLeft: scale(5),
  },

  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: scale(10),
    marginBottom: verticalScale(5),
    backgroundColor: 'transparent',
    height: verticalScale(55),
  },
  passwordContainerError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scale(20),
    fontSize: FONT_SIZE.regular,
    color: COLORS.text,
  },
  eyeButton: {
    paddingHorizontal: scale(15),
    height: '100%',
    justifyContent: 'center',
  },

  hintText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.warning,
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
  },
  errorHintText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.error,
    marginTop: verticalScale(-10),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
  },

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
    backgroundColor: COLORS.quinary + '80',
    borderWidth: 2,
    borderColor: COLORS.tertiary,
    borderRadius: scale(15),
    gap: scale(15),
  },
  documentTypeButtonActive: {
    backgroundColor: COLORS.primary + '33',
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  documentTypeTextContainer: {
    flex: 1,
  },
  documentTypeTitle: {
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: verticalScale(4),
  },
  documentTypeTitleActive: {
    color: COLORS.text,
    opacity: 1,
  },
  documentTypeSubtitle: {
    fontSize: FONT_SIZE.regular,
    color: COLORS.text,
    opacity: 0.6,
  },

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
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(25),
    minWidth: scale(140),
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.tertiary,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  });
};

