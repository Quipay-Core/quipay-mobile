export const Colors = {
  dark: {
    background:   "#000000",
    surface:      "#0a0a0a",
    card:         "#111111",
    border:       "#1a1a1a",
    accent:       "#F5C249",
    accentMuted:  "rgba(245,194,73,0.12)",
    text:         "#ffffff",
    textMuted:    "#737373",
    textSubtle:   "#525252",
    error:        "#ef4444",
    success:      "#F5C249",
  },
  light: {
    background:   "#ffffff",
    surface:      "#f8f8f8",
    card:         "#f0f0f0",
    border:       "#e5e5e5",
    accent:       "#D4960A",
    accentMuted:  "rgba(212,150,10,0.1)",
    text:         "#0a0a0a",
    textMuted:    "#525252",
    textSubtle:   "#737373",
    error:        "#dc2626",
    success:      "#16a34a",
  },
};

/** Gradient stops for the brand yellow */
export const YellowGradient = {
  colors: ["#F7D163", "#F5C249", "#EDB830"] as const,
  start:  { x: 0, y: 0 },
  end:    { x: 0, y: 1 },
};

export type ColorScheme = "dark" | "light";
export type ThemeColors = typeof Colors.dark;
