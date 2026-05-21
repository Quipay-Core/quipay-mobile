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
  const [scheme, setScheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setScheme(stored);
      } else {
        setScheme("dark"); // Quipay defaults to dark
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setScheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return {
    colors:      Colors[scheme],
    isDark:      scheme === "dark",
    scheme,
    toggleTheme,
  };
}
