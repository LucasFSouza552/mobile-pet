import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
import { buttonStyles } from "./ButtonStyles";

interface PrimaryButtonProps {
    text: string;
    onPress: () => void;
}

export default function PrimaryButton({ text, onPress }: PrimaryButtonProps) {

    const styles = buttonStyles("primary");
    return (
        <TouchableOpacity style={styles.Button} onPress={onPress}>
            <Text style={styles.Text}>{text}</Text>
        </TouchableOpacity>
    )
}
