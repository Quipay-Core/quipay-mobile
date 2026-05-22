import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

type BadgeVariant = "accent" | "success" | "muted" | "error";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  accent:  { bg: "rgba(250,204,21,0.12)",  text: Colors.dark.accent   },
  success: { bg: "rgba(245,194,73,0.1)",    text: "#F5C249"            },
  error:   { bg: "rgba(239,68,68,0.1)",    text: "#ef4444"            },
  muted:   { bg: "rgba(255,255,255,0.06)", text: Colors.dark.textMuted },
};

export function Badge({ label, variant = "muted" }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
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
