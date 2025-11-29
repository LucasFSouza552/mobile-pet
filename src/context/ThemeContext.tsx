import React, { createContext, useState, useContext, ReactNode, useRef, useMemo, useEffect } from "react";
import { Animated, Appearance, Easing, useWindowDimensions } from "react-native";
import { PaperProvider } from "react-native-paper";
import { darkTheme, lightTheme } from "../theme/Themes";
import { ThemeMode, ThemeColors, ThemeGap, ThemePadding, ThemeElevation, ThemeShadow } from "../theme/types";
import { getStorage, saveStorage } from "../utils/storange";

const THEME_STORAGE_KEY = "@app_theme_preference";

type Theme = "light" | "dark";

interface ThemeContextProps {
    theme: Theme;
    themeMode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    SPACING: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    FONT_SIZE: {
        small: number;
        regular: number;
        medium: number;
        large: number;
        xlarge: number;
        xxlarge: number;
    };
    GAP: ThemeGap;
    PADDING: ThemePadding;
    ELEVATION: ThemeElevation;
    SHADOW: ThemeShadow;
    getShadow: (level: 'sm' | 'md' | 'lg' | 'xl') => {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    scale: (size: number) => number;
    verticalScale: (size: number) => number;
    COLORS: ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const getSystemTheme = (): Theme => {
    const colorScheme = Appearance.getColorScheme();
    return (colorScheme === "dark" ? "dark" : "light");
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
    const [theme, setTheme] = useState<Theme>(getSystemTheme());
    const [isInitialized, setIsInitialized] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await getStorage(THEME_STORAGE_KEY);
                if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch (error) {
                console.error("Erro ao carregar preferência de tema:", error);
            } finally {
                setIsInitialized(true);
            }
        };

        loadThemePreference();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const updateTheme = () => {
            if (themeMode === "system") {
                setTheme(getSystemTheme());
            } else {
                setTheme(themeMode);
            }
        };

        updateTheme();

        if (themeMode === "system") {
            const subscription = Appearance.addChangeListener(() => {
                updateTheme();
            });
            return () => subscription.remove();
        }
    }, [themeMode, isInitialized]);

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await saveStorage(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error("Erro ao salvar preferência de tema:", error);
        }
    };

    const toggleTheme = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            const newMode = theme === "light" ? "dark" : "light";
            setThemeMode(newMode);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });
    };

    const { width, height } = useWindowDimensions();
    const BASE_WIDTH = 375;
    const BASE_HEIGHT = 812;

    const scale = useMemo(
        () => (size: number) => {
            const factor = width / BASE_WIDTH;
            return size * Math.min(factor, 1.1);
        },
        [width]
    );

    const verticalScale = useMemo(
        () => (size: number) => {
            const factor = height / BASE_HEIGHT;
            return size * Math.min(factor, 1.1);
        },
        [height]
    );

    const SPACING = useMemo(
        () => ({
            xs: scale(4),
            sm: scale(8),
            md: scale(16),
            lg: scale(24),
            xl: scale(32),
            xxl: scale(48),
        }),
        [scale]
    );

    const FONT_SIZE = useMemo(
        () => ({
            small: scale(12),
            regular: scale(16),
            medium: scale(18),
            large: scale(24),
            xlarge: scale(28),
            xxlarge: scale(32),
        }),
        [scale]
    );

    const GAP = useMemo(
        () => ({
            xs: scale(4),
            sm: scale(8),
            md: scale(12),
            lg: scale(16),
            xl: scale(24),
            xxl: scale(32),
        }),
        [scale]
    );

    const PADDING = useMemo(
        () => ({
            xs: scale(4),
            sm: scale(8),
            md: scale(12),
            lg: scale(16),
            xl: scale(20),
            xxl: scale(24),
        }),
        [scale]
    );

    const ELEVATION = useMemo(
        () => ({
            none: 0,
            sm: 2,
            md: 4,
            lg: 8,
            xl: 12,
            xxl: 16,
        }),
        []
    );

    const SHADOW = useMemo<ThemeShadow>(
        () => ({
            color: theme === "dark" ? "#000000" : "#000000",
            offset: {
                width: 0,
                height: 2,
            },
            opacity: {
                sm: 0.1,
                md: 0.2,
                lg: 0.3,
                xl: 0.4,
            },
            radius: {
                sm: scale(2),
                md: scale(4),
                lg: scale(8),
                xl: scale(12),
            },
        }),
        [theme, scale]
    );

    const getShadow = useMemo(
        () => (level: 'sm' | 'md' | 'lg' | 'xl') => {
            const elevationMap = {
                sm: ELEVATION.sm,
                md: ELEVATION.md,
                lg: ELEVATION.lg,
                xl: ELEVATION.xl,
            };
            return {
                shadowColor: SHADOW.color,
                shadowOffset: SHADOW.offset,
                shadowOpacity: SHADOW.opacity[level],
                shadowRadius: SHADOW.radius[level],
                elevation: elevationMap[level],
            };
        },
        [SHADOW, ELEVATION]
    );

    const paperTheme = theme === "dark" ? darkTheme : lightTheme;
    const COLORS = paperTheme.colors;

    if (!isInitialized) {
        return null;
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeMode,
                toggleTheme,
                setThemeMode,
                SPACING,
                FONT_SIZE,
                GAP,
                PADDING,
                ELEVATION,
                SHADOW,
                getShadow,
                scale,
                verticalScale,
                COLORS,
            }}
        >
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
    if (!context) {
        throw new Error("useTheme deve ser usado dentro de ThemeProvider");
    }
    return context;
};