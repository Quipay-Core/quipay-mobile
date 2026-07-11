import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={c.accentText} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  card:     { backgroundColor: c.card, borderRadius: 24, padding: 32, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.border },
  iconWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: c.accentMuted, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  title:    { fontFamily: "Urbanist_700Bold", fontSize: 17, color: c.text },
  sub:      { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted, textAlign: "center", lineHeight: 20 },
  btn:      { backgroundColor: c.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  btnText:  { fontFamily: "Urbanist_700Bold", fontSize: 15, color: "#000" },
});
