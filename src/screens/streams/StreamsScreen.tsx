import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Colors, YellowGradient } from "../../constants/theme";
import { EmptyState } from "../../components/ui/EmptyState";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");
const TABS = ["Active", "Completed", "Cancelled"] as const;

export default function StreamsScreen() {
  const [tab, setTab] = useState<typeof TABS[number]>("Active");

  return (
    <View style={styles.root}>
      <LinearGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Streams</Text>
          <Text style={styles.sub}>Payment streams from your employer</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>
        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <EmptyState
          icon="flash-outline"
          title={`No ${tab.toLowerCase()} streams`}
          subtitle={tab === "Active" ? "Your employer hasn't created a stream for you yet." : `You have no ${tab.toLowerCase()} streams.`}
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={c.accent} />
          <Text style={styles.infoText}>Streams are created by your employer. Earnings accumulate in real time and can be withdrawn at any time.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#F5C249" },
  header:        { minHeight: SH * 0.25 },
  headerInner:   { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:         { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  sub:           { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 4 },
  card:          { flex: 1, backgroundColor: "#000", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:   { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  tabs:          { flexDirection: "row", gap: 8, marginBottom: 20 },
  tabBtn:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  tabActive:     { backgroundColor: c.accent, borderColor: c.accent },
  tabText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.textMuted },
  tabTextActive: { color: "#000" },
  infoBox:       { flexDirection: "row", gap: 10, backgroundColor: "rgba(245,194,73,0.06)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(245,194,73,0.15)", marginTop: 16 },
  infoText:      { flex: 1, fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, lineHeight: 19 },
});
