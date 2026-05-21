import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

const c = Colors.dark;

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={c.accent} />
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

const styles = StyleSheet.create({
  card:     { backgroundColor: c.card, borderRadius: 24, padding: 32, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.border },
  iconWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(250,204,21,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  title:    { fontFamily: "Urbanist_700Bold", fontSize: 17, color: c.text },
  sub:      { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, textAlign: "center", lineHeight: 20 },
  btn:      { backgroundColor: c.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  btnText:  { fontFamily: "Urbanist_700Bold", fontSize: 14, color: "#000" },
});
