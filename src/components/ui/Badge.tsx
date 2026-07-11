import { View, Text, StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

type BadgeVariant = "accent" | "success" | "muted" | "error";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles = (c: ThemeColors): Record<BadgeVariant, { bg: string; text: string }> => ({
  accent:  { bg: c.accentMuted,          text: c.accentText },
  success: { bg: c.accentMuted,          text: c.accentText },
  error:   { bg: "rgba(239,68,68,0.1)",  text: c.error      },
  muted:   { bg: c.accentMuted,          text: c.textMuted  },
});

export function Badge({ label, variant = "muted" }: BadgeProps) {
  const { colors: c } = useTheme();
  const s = variantStyles(c)[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  text:  { fontFamily: "Urbanist_600SemiBold", fontSize: 11, letterSpacing: 0.3 },
});
