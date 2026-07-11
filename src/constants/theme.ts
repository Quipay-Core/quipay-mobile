export const Colors = {
  dark: {
    background:   "#000000",
    surface:      "#0a0a0a",
    card:         "#111111",
    border:       "#1a1a1a",
    accent:       "#F5C249",
    // Yellow used for text/icons on cards. On the dark card #F5C249 is legible,
    // so this matches `accent`. In light mode it deepens for contrast on white.
    accentText:   "#F5C249",
    // Soft accent fill for icon boxes / pills, and a matching border. On black
    // the brand yellow reads at low opacity, so these stay bright-yellow tinted.
    accentMuted:  "rgba(245,194,73,0.12)",
    accentBorder: "rgba(245,194,73,0.22)",
    accentTrack:  "rgba(245,194,73,0.35)",
    text:         "#ffffff",
    textMuted:    "#737373",
    textSubtle:   "#525252",
    error:        "#ef4444",
    success:      "#F5C249",
  },
  light: {
    background:   "#ffffff",
    surface:      "#f2f2f2",
    card:         "#f5f5f5",
    border:       "#e5e5e5",
    // Slightly deeper than brand yellow so filled buttons read on white with
    // black text; still clearly gold.
    accent:       "#E0A500",
    // Deep gold for text/icons on the light card — ~5:1 contrast on white.
    accentText:   "#A16207",
    // On white, bright brand yellow at low opacity vanishes, so the light-mode
    // tints use the deeper gold and a touch more opacity to stay visible and to
    // match the deep-gold icons/text that sit on top of them.
    accentMuted:  "rgba(224,165,0,0.16)",
    accentBorder: "rgba(224,165,0,0.32)",
    accentTrack:  "rgba(224,165,0,0.45)",
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
