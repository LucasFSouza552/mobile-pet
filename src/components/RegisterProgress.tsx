import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../theme/types';

interface RegisterProgressProps {
    currentStep: number;
    scale: (size: number) => number;
    verticalScale: (size: number) => number;
    FONT_SIZE: { regular: number; medium: number; large: number };
}

export default function RegisterProgress({
    currentStep,
    scale,
    verticalScale,
    FONT_SIZE
}: RegisterProgressProps) {
    const { COLORS } = useTheme();
    const styles = makeStyles(COLORS, scale, verticalScale);

    const steps = [
        { icon: 'user', label: 'Perfil' },
        { icon: 'envelope', label: 'Contato' },
        { icon: 'id-card', label: 'Documento' },
        { icon: 'lock', label: 'Senha' },
    ];

    const getStepStyle = (stepIndex: number) => {
        if (stepIndex < currentStep - 1) {
            return [styles.progressStep, styles.progressStepCompleted];
        } else if (stepIndex === currentStep - 1) {
            return [styles.progressStep, styles.progressStepActive];
        } else {
            return styles.progressStep;
        }
    };

    const getLineStyle = (stepIndex: number) => {
        if (stepIndex < currentStep - 1) {
            return [styles.progressLine, styles.progressLineActive];
        } else {
            return styles.progressLine;
        }
    };

    const getIcon = (stepIndex: number, iconName: string) => {
        if (stepIndex < currentStep - 1) {
            return 'check';
        }
        return iconName;
    };

    const getIconOpacity = (stepIndex: number) => {
        if (stepIndex < currentStep - 1 || stepIndex === currentStep - 1) {
            return 1;
        }
        return 0.5;
    };

    return (
        <View style={styles.progressContainer}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <View style={getStepStyle(index)}>
                        <FontAwesome
                            name={getIcon(index, step.icon) as any}
                            size={FONT_SIZE.regular}
                            color={COLORS.text}
                            style={{ opacity: getIconOpacity(index) }}
                        />
                    </View>
                    {index < steps.length - 1 && (
                        <View style={getLineStyle(index)} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
}

function makeStyles(
    COLORS: ThemeColors,
    scale: (size: number) => number,
    verticalScale: (size: number) => number,
) {
    return StyleSheet.create({
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
            backgroundColor: COLORS.quarternary,
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
    });
}

