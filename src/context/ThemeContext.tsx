import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, ThemeColors } from "../constants/theme";

const THEME_KEY = "quipay_theme";

type Scheme = "dark" | "light";

interface ThemeContextValue {
  colors:      ThemeColors;
  isDark:      boolean;
  scheme:      Scheme;
  toggleTheme: () => void;
  setScheme:   (scheme: Scheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors:      Colors.dark,
  isDark:      true,
  scheme:      "dark",
  toggleTheme: () => {},
  setScheme:   () => {},
});

/**
 * Single source of truth for the app's color scheme.
 * Loads the saved preference once on mount and persists every change, so a
 * toggle anywhere re-renders the entire tree — not just the calling screen.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // null = not yet loaded from storage; avoids flashing the wrong theme on cold start.
  const [scheme, setSchemeState] = useState<Scheme | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        setSchemeState(stored === "dark" || stored === "light" ? stored : "dark");
      })
      .catch(() => setSchemeState("dark")); // Quipay defaults to dark
  }, []);

  const persist = useCallback((next: Scheme) => {
    AsyncStorage.setItem(THEME_KEY, next).catch(console.warn);
  }, []);

  const setScheme = useCallback((next: Scheme) => {
    setSchemeState(next);
    persist(next);
  }, [persist]);

  const toggleTheme = useCallback(() => {
    setSchemeState((prev) => {
      const next: Scheme = (prev ?? "dark") === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });
  }, [persist]);

  const resolved: Scheme = scheme ?? "dark";

  // Keep the NATIVE appearance in lockstep with the app theme so system-drawn
  // surfaces (Liquid Glass tab bar, alerts, keyboard) match. Without this,
  // GlassView follows the phone's system setting and can render a light
  // material over a dark app (or the reverse).
  useEffect(() => {
    Appearance.setColorScheme(resolved);
  }, [resolved]);

  return (
    <ThemeContext.Provider
      value={{
        colors:      Colors[resolved],
        isDark:      resolved === "dark",
        scheme:      resolved,
        toggleTheme,
        setScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
