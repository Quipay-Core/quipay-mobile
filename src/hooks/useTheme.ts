// Theme state now lives in a global provider so a toggle re-renders the whole
// tree, not just the calling screen. This file re-exports the hook to keep
// existing `../hooks/useTheme` import paths working.
export { useTheme, ThemeProvider } from "../context/ThemeContext";
