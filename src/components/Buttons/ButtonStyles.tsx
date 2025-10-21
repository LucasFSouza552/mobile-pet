import { StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
export const buttonStyles = (type: "primary" | "secondary" | "tertiary") => {
    const { COLORS, scale, verticalScale, FONT_SIZE } = useTheme();

    return StyleSheet.create({
        Button: {
            backgroundColor: COLORS[type],
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
