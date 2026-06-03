import { createContext } from "react";
import type { Theme } from "./themeUtils";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export { ThemeContext };
export type { ThemeContextValue, Theme };
export { useTheme } from "./useTheme";


