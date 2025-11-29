import { MD3LightTheme as LightTheme, MD3DarkTheme as DarkTheme } from "react-native-paper";
import { ThemeColors } from "./types";

const createLightColors = (): ThemeColors => ({
  ...LightTheme.colors,
  iconBackground: "#D8C8D3",
  text: "#1A1A1A",

  primary: "#B648A0",

  secondary: "#FFF",
  tertiary: "#e8e3e7",
  quarternary: "#FFFFFF",
  quinary: "#9C8A97",

  border: "rgba(0, 0, 0, 0.15)",
  textShadow: "rgba(0, 0, 0, 0.07)",

  surface: "#FFFFFF",
  surfaceVariant: "#EEE7EE",

  error: "#B00020",
  success: "#2E7D32",
  warning: "#ED6C02",
  info: "#0288D1",
});


const createDarkColors = (): ThemeColors => ({
  ...DarkTheme.colors,
  iconBackground: "#FFF",
  text: "#FFF",
  primary: "#B648A0",
  secondary: "#363135",
  tertiary: "#61475C",
  quarternary: "#332630",
  quinary: "#4A3A46",
  border: "rgba(0, 0, 0, 0.12)",
  textShadow: "rgba(0, 0, 0, 0.1)",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  error: "#B00020",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
});

const lightTheme = {
  ...LightTheme,
  colors: createLightColors(),
};

const darkTheme = {
  ...DarkTheme,
  colors: createDarkColors(),
};

export { lightTheme, darkTheme };