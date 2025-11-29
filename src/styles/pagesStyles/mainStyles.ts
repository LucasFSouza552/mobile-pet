import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const mainStyles = () => {
    const { COLORS } = useTheme();
    const { width, height } = Dimensions.get('window');
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.iconBackground,
        },
        safeArea: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }
    });
}