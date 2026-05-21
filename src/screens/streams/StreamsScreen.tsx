import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Colors } from "../../constants/theme";
import type { StreamStatus } from "../../types";

const c = Colors.dark;

const TABS: { label: string; value: StreamStatus }[] = [
  { label: "Active",    value: "active"    },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const EMPTY_COPY: Record<string, string> = {
  active:    "Your employer hasn't created a stream for you yet. Make sure you're registered under their wallet.",
  completed: "You have no completed streams yet.",
  cancelled: "You have no cancelled streams.",
};

export default function StreamsScreen() {
  const [active, setActive] = useState<StreamStatus>("active");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <ScreenHeader title="My Streams" subtitle="Payment streams from your employer" />

        {/* Filter tabs */}
        <View style={styles.tabs}>
          {TABS.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.tab, active === value && styles.tabActive]}
              onPress={() => setActive(value)}
            >
              <Text style={[styles.tabText, active === value && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <EmptyState
          icon="flash-outline"
          title={`No ${active} streams`}
          subtitle={EMPTY_COPY[active]}
        />

        {/* Info note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={c.accent} />
          <Text style={styles.infoText}>
            Streams are created by your employer. Earnings accumulate in real time and can be withdrawn at any time.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, paddingHorizontal: 20 },
  tabs:          { flexDirection: "row", gap: 8, marginBottom: 20 },
  tab:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  tabActive:     { backgroundColor: c.accent, borderColor: c.accent },
  tabText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.textMuted },
  tabTextActive: { color: "#000" },
  infoBox:       { flexDirection: "row", gap: 10, backgroundColor: "rgba(250,204,21,0.06)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(250,204,21,0.15)", marginTop: 16, marginBottom: 32 },
  infoText:      { flex: 1, fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, lineHeight: 19 },
});
