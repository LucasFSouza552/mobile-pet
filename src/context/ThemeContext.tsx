import React, { createContext, useState, useContext, ReactNode, useRef, useMemo } from "react";
import { Animated, Appearance, Easing, useWindowDimensions } from "react-native";
import { PaperProvider } from "react-native-paper";
import { darkTheme, lightTheme } from "../theme/Themes";

type Theme = "light" | "dark";

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
    SPACING: Record<string, number>;
    FONT_SIZE: Record<string, number>;
    scale: (size: number) => number;
    verticalScale: (size: number) => number;
    COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorScheme = Appearance.getColorScheme() as Theme;
    const [theme, setTheme] = useState<Theme>(colorScheme || "light");

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const toggleTheme = () => {

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setTheme((prev) => (prev === "light" ? "dark" : "light"));
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        });
    };

    const { width, height } = useWindowDimensions();
    const BASE_WIDTH = 375;
    const BASE_HEIGHT = 812;

    const scale = (size: number) => {
        const factor = width / BASE_WIDTH;
        return size * Math.min(factor, 1.1);
    };

    const verticalScale = (size: number) => {
        const factor = height / BASE_HEIGHT;
        return size * Math.min(factor, 1.1);
    };


    const SPACING = useMemo(
        () => ({
            xs: scale(4),
            sm: scale(8),
            md: scale(16),
            lg: scale(24),
            xl: scale(32),
        }),
        [width]
    );


    const FONT_SIZE = useMemo(
        () => ({
            small: scale(12),
            regular: scale(16),
            medium: scale(18),
            large: scale(24),
            xlarge: scale(28),
        }),
        [width]
    );


    const paperTheme = theme === "dark" ? darkTheme : lightTheme;
    const COLORS = paperTheme.colors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, SPACING, FONT_SIZE, scale, verticalScale, COLORS }}>
            <PaperProvider theme={paperTheme}>
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    {children}
                </Animated.View>
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
    return context;
};