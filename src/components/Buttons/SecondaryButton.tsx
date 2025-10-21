import { TouchableOpacity, Text, StyleSheet } from "react-native";
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