import { MD3LightTheme as LightTheme, MD3DarkTheme as DarkTheme } from "react-native-paper";

const lightTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    textShadow: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.2)',
    bg: "#fff",
    text: "#000",
    primary: "#B648A0",
    secondary: "#363135",
    tertiary: "#61475C",
    quarternary: "#332630",
    quinary: "#4A3A46"
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    textShadow: 'rgba(0, 0, 0, 0.8)',
    bg: "#121212",
    border: 'rgba(255, 255, 255, 0.2)',
    text: "#ffffff",
    primary: "#B648A0",
    secondary: "#E3D9E8",
    tertiary: "#61475C",
    quarternary: "#332630",
    quinary: "#4A3A46"
  },
};

export { lightTheme, darkTheme };