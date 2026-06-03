export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";

export function getInitialTheme(): Theme {
  // Force light theme as per requirement
  return "light";
}