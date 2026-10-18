import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const THEMES = { light: "unlinked", dark: "unlinked-dark" };

const readPreference = () => {
    try {
        return localStorage.getItem("theme") || "system";
    } catch {
        return "system";
    }
};

export const ThemeProvider = ({ children }) => {
    // "light" | "dark" | "system"
    const [preference, setPreference] = useState(readPreference);
    const [systemDark, setSystemDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);

    useEffect(() => {
        const media = matchMedia("(prefers-color-scheme: dark)");
        const onChange = (event) => setSystemDark(event.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

    useEffect(() => {
        document.documentElement.dataset.theme = THEMES[resolved];
        try {
            localStorage.setItem("theme", preference);
        } catch {
            // storage unavailable (private mode); the theme still applies for this session
        }
    }, [preference, resolved]);

    return (
        <ThemeContext.Provider value={{ preference, setPreference, resolved }}>{children}</ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
