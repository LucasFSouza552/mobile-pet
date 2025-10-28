import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
    message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null;
    
    return (
        <View style={styles.container}>
            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffe5e5',
        borderColor: '#ffb3b3',
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
    },
    text: {
        color: '#b00020',
        fontSize: 14,
        marginLeft: 6,
        flexShrink: 1,
    },
});
