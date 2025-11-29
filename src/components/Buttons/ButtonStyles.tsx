import { StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
export function buttonStyles(type: "primary" | "secondary" | "tertiary") {
    const { scale, verticalScale, FONT_SIZE, COLORS } = useTheme();
    return StyleSheet.create({
        Button: {
            backgroundColor: type === "secondary" ? COLORS.iconBackground : COLORS[type],
            paddingVertical: verticalScale(14),
            borderRadius: scale(10),
            alignItems: 'center',
            elevation: 4,
        },
        Text: {
            color: type === "secondary" ? COLORS.primary : COLORS.text,
            fontSize: FONT_SIZE.medium,
            fontWeight: '600',
        }
    });
}
