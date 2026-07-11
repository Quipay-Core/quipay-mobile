import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && { color: c.accent }]}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  card:  { flex: 1, minWidth: "45%", backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
  label: { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  value: { fontFamily: "Urbanist_800ExtraBold", fontSize: 22, color: c.text },
});
