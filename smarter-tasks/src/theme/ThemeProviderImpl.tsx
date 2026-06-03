import React, { useEffect, useMemo, useState } from "react";

import { ThemeContext, type ThemeContextValue } from "./ThemeContext";
import { getInitialTheme, STORAGE_KEY } from "./themeUtils";

export default function ThemeProviderImpl({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  const setTheme = (next: ThemeContextValue["theme"]) => {
    setThemeState(next);
    try {
      window.localStorage?.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    // Apply theme to the document so CSS can switch deterministically.
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

