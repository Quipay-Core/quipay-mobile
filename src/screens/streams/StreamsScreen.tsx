import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { useState, useMemo, useCallback } from "react";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { useWorkerStreams, type WorkerStream } from "../../hooks/useWorkerData";
import { useLiveValue } from "../../hooks/useLiveValue";
import { shortenAddress } from "../../utils/format";

const { height: SH } = Dimensions.get("window");
const TABS = ["Active", "Completed", "Cancelled"] as const;

const STATUS_FOR_TAB: Record<(typeof TABS)[number], string> = {
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
};

/** A single stream row whose "available" amount ticks up live. */
function StreamRow({ stream, c }: { stream: WorkerStream; c: ThemeColors }) {
  const styles = useMemo(() => makeStyles(c), [c]);
  const rate = stream.status === "active" ? stream.ratePerSecond : 0;
  const liveAvailable = useLiveValue(stream.available, rate);

  return (
    <View style={styles.streamCard}>
      <View style={styles.streamTop}>
        <View style={styles.streamIcon}>
          <Ionicons name="flash" size={16} color="#000" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.streamTitle}>Stream #{stream.streamId}</Text>
          <Text style={styles.streamSub}>
            {stream.chain === "arc" ? "Arc" : "Stellar"} · from{" "}
            {shortenAddress(stream.employer)}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: stream.status === "active" ? c.accentMuted : c.card },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: stream.status === "active" ? c.accentText : c.textMuted },
            ]}
          >
            {stream.status}
          </Text>
        </View>
      </View>

      <View style={styles.streamStats}>
        <View style={styles.streamStat}>
          <Text style={styles.streamStatLabel}>Available now</Text>
          <Text style={[styles.streamStatValue, { color: c.accentText }]}>
            {liveAvailable.toFixed(6)} <Text style={styles.streamStatUnit}>USDC</Text>
          </Text>
        </View>
        <View style={styles.streamStat}>
          <Text style={styles.streamStatLabel}>Rate</Text>
          <Text style={styles.streamStatValue}>
            {stream.ratePerSecond.toFixed(7)} <Text style={styles.streamStatUnit}>/s</Text>
          </Text>
        </View>
        <View style={styles.streamStat}>
          <Text style={styles.streamStatLabel}>Withdrawn</Text>
          <Text style={styles.streamStatValue}>
            {stream.withdrawn.toFixed(2)} <Text style={styles.streamStatUnit}>USDC</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function StreamsScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active");
  const { streams, loading, refetch } = useWorkerStreams();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = streams.filter((s) => s.status === STATUS_FOR_TAB[tab]);

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Streams</Text>
          <Text style={styles.sub}>Payment streams from your employer</Text>
        </SafeAreaView>
      </SafeGradient>

      <ScrollView
        style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accentText} />}
      >
        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length > 0 ? (
          <View style={{ gap: 12 }}>
            {filtered.map((s) => (
              <StreamRow key={s.streamId} stream={s} c={c} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="flash-outline"
            title={loading ? "Loading streams…" : `No ${tab.toLowerCase()} streams`}
            subtitle={tab === "Active" ? "Your employer hasn't created a stream for you yet." : `You have no ${tab.toLowerCase()} streams.`}
          />
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={c.accentText} />
          <Text style={styles.infoText}>Streams are created by your employer. Earnings accumulate in real time and can be withdrawn at any time.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#F5C249" },
  header:        { minHeight: SH * 0.25 },
  headerInner:   { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:         { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  sub:           { fontFamily: "Urbanist_500Medium", fontSize: 14, color: "rgba(0,0,0,0.55)", marginTop: 4 },
  card:          { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:   { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  tabs:          { flexDirection: "row", gap: 8, marginBottom: 20 },
  tabBtn:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  tabActive:     { backgroundColor: c.accent, borderColor: c.accent },
  tabText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.textMuted },
  tabTextActive: { color: "#000" },
  streamCard:    { backgroundColor: c.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: c.border, gap: 14 },
  streamTop:     { flexDirection: "row", alignItems: "center", gap: 12 },
  streamIcon:    { width: 36, height: 36, borderRadius: 10, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
  streamTitle:   { fontFamily: "Urbanist_700Bold", fontSize: 15, color: c.text },
  streamSub:     { fontFamily: "Urbanist_500Medium", fontSize: 12, color: c.textMuted, marginTop: 2 },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontFamily: "Urbanist_700Bold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  streamStats:   { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12 },
  streamStat:    { gap: 2 },
  streamStatLabel:{ fontFamily: "Urbanist_500Medium", fontSize: 11, color: c.textMuted },
  streamStatValue:{ fontFamily: "Urbanist_700Bold", fontSize: 13, color: c.text },
  streamStatUnit: { fontFamily: "Urbanist_500Medium", fontSize: 10, color: c.textMuted },
  infoBox:       { flexDirection: "row", gap: 10, backgroundColor: c.accentMuted, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c.accentBorder, marginTop: 16 },
  infoText:      { flex: 1, fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted, lineHeight: 19 },
});
