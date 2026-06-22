import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "quipay_theme";

export function useTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  scheme: "dark" | "light";
  toggleTheme: () => void;
} {
  const system = useColorScheme();
  // null = not yet loaded from storage; avoids flashing wrong theme on mount
  const [scheme, setScheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setScheme(stored);
      } else {
        setScheme("dark"); // Quipay defaults to dark
      }
    }).catch(() => setScheme("dark"));
  }, []);

  const toggleTheme = useCallback(() => {
    setScheme((prev) => {
      const next = (prev ?? "dark") === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_KEY, next).catch(console.warn);
      return next;
    });
  }, []);

  // Use dark as the pre-load fallback — matches the app's default
  const resolved = scheme ?? "dark";

  return {
    colors:      Colors[resolved],
    isDark:      resolved === "dark",
    scheme:      resolved,
    toggleTheme,
  };
}
