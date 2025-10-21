import { createContext, useEffect, useState } from "react";
import { getStorage, saveStorage } from "../utils/storange";
import { darkTheme, lightTheme, Theme } from "../theme/Themes";

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

export const ThemeProvider = ({ children }: any) => {

    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        (async () => {
            const stored = await getStorage("@theme");
            if (stored === "dark" || stored === "light") setTheme(stored);
        })();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        await saveStorage("@theme", newTheme);
    }

    const currentTheme = theme === "light" ? lightTheme : darkTheme;

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};