export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  iconBackground: string;
  text: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quarternary: string;
  quinary: string;
  
  border: string;
  textShadow: string;
  surface: string;
  surfaceVariant: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  
  primaryContainer?: string;
  secondaryContainer?: string;
  tertiaryContainer?: string;
  errorContainer?: string;
  onPrimary?: string;
  onSecondary?: string;
  onTertiary?: string;
  onError?: string;
  onBackground?: string;
  onSurface?: string;
  outline?: string;
  outlineVariant?: string;
  shadow?: string;
  scrim?: string;
  inverseSurface?: string;
  inverseOnSurface?: string;
  inversePrimary?: string;
  elevation?: {
    level0?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level5?: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeFontSize {
  small: number;
  regular: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
}

export interface ThemeGap {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemePadding {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeElevation {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeShadow {
  color: string;
  offset: {
    width: number;
    height: number;
  };
  opacity: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface AppTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fontSize: ThemeFontSize;
  gap: ThemeGap;
  padding: ThemePadding;
  elevation: ThemeElevation;
  shadow: ThemeShadow;
  mode: ThemeMode;
}

