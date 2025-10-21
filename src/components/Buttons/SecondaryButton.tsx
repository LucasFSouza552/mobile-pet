import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
import { buttonStyles } from "./ButtonStyles";

interface SecondaryButtonProps {
    text: string;
    onPress: () => void;
}

export default function SecondaryButton({ text, onPress }: SecondaryButtonProps) {

    const styles = buttonStyles("secondary");

    return (
        <TouchableOpacity style={styles.Button} onPress={onPress}>
            <Text style={styles.Text}>{text}</Text>
        </TouchableOpacity>
    )
}

export const secondaryButtonStyles = () => {
    const { COLORS, scale, verticalScale, FONT_SIZE } = useTheme();
    return StyleSheet.create({
        Button: {
            backgroundColor: COLORS.secondary,
            paddingVertical: verticalScale(14),
            borderRadius: scale(10),
            alignItems: 'center',
            elevation: 4,
        },
        Text: {
            color: '#ffffff',
            fontSize: FONT_SIZE.medium,
            fontWeight: '600',
        }
    });
}
