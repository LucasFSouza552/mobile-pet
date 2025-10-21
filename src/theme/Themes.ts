export type Theme = {
  colors: {
    bg: string;
    text: string;
    primary: string;
    secondary: string;
    tertiary: string;
    quarternary: string;
    quinary: string;
  };
}


const lightTheme: Theme = {
  colors: {
    bg: "#fff",
    text: "#000",
    primary: "#B648A0",
    secondary: "#363135",
    tertiary: "#61475C",
    quarternary: "#332630",
    quinary: "#4A3A46"
  },
};

const darkTheme: Theme = {
  colors: {
    bg: "#121212",
    text: "#ffffff",
    primary: "#B648A0",
    secondary: "#E3D9E8",
    tertiary: "#61475C",
    quarternary: "#332630",
    quinary: "#4A3A46"
  },
};

export { lightTheme, darkTheme };