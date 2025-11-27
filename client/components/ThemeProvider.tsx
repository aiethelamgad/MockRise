import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultLanguage?: Language;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  language: Language;
  direction: Direction;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  language: "en",
  direction: "ltr",
  setTheme: () => null,
  setLanguage: () => null,
  toggleTheme: () => null,
  toggleLanguage: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultLanguage = "en",
  storageKey = "mockrise-ui",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [direction, setDirection] = useState<Direction>("ltr");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing language and direction classes
    root.classList.remove("en", "ar", "ltr", "rtl");

    // Add new language and direction classes
    root.classList.add(language);
    root.classList.add(direction);

    // Set document direction
    root.setAttribute("dir", direction);

    // Set document language
    root.setAttribute("lang", language);
  }, [language, direction]);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem(`${storageKey}-theme`) as Theme;
    const savedLanguage = localStorage.getItem(`${storageKey}-language`) as Language;

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (savedLanguage) {
      setLanguage(savedLanguage);
      setDirection(savedLanguage === "ar" ? "rtl" : "ltr");
    }
  }, [storageKey]);

  const value = {
    theme,
    language,
    direction,
    setTheme: (theme: Theme) => {
      localStorage.setItem(`${storageKey}-theme`, theme);
      setTheme(theme);
    },
    setLanguage: (language: Language) => {
      localStorage.setItem(`${storageKey}-language`, language);
      setLanguage(language);
      setDirection(language === "ar" ? "rtl" : "ltr");
    },
    toggleTheme: () => {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      localStorage.setItem(`${storageKey}-theme`, newTheme);
    },
    toggleLanguage: () => {
      const newLanguage = language === "en" ? "ar" : "en";
      setLanguage(newLanguage);
      setDirection(newLanguage === "ar" ? "rtl" : "ltr");
      localStorage.setItem(`${storageKey}-language`, newLanguage);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
