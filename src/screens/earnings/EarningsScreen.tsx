import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, YellowGradient } from "../../constants/theme";
import { LogoWordmark } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";
import { useWorkerBalance, useWorkerStreams, useWithdrawalHistory } from "../../hooks/useWorkerData";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");
const HEADER_H = SH * 0.25;

const MASK = "••••••";

export default function EarningsScreen() {
  const { user } = useAuth();
  const { logout } = usePrivy();
  const [visible, setVisible] = useState(false);

  const { available, streamingPerSec, withdrawn, loading: balanceLoading } = useWorkerBalance();
  const { streams, loading: streamsLoading } = useWorkerStreams();
  const { records: payouts, loading: historyLoading } = useWithdrawalHistory(user?.stellarAddress ?? null);

  const activeStreams = streams.filter(s => s.status === "active");
  const safe = (n: number) => (isNaN(n) || !isFinite(n) ? 0 : n);
  const totalEarned = safe(withdrawn) + safe(available);

  const fmt = (n: number) =>
    safe(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const mask = (val: string) => (visible ? val : MASK);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const isLoading = balanceLoading || streamsLoading;

  return (
    <View style={styles.root}>

      {/* Yellow header */}
      <LinearGradient
        colors={YellowGradient.colors}
        start={YellowGradient.start}
        end={YellowGradient.end}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.headerRow}>
            <LogoWordmark size={24} variant="black" />
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setVisible(v => !v)}>
                <Ionicons name={visible ? "eye-outline" : "eye-off-outline"} size={18} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName} 👋</Text>
            {isLoading ? (
              <ActivityIndicator color="#000" style={{ marginVertical: 8 }} />
            ) : (
              <Text style={styles.heroValue}>{mask(`$${fmt(totalEarned)}`)}</Text>
            )}
            <Text style={styles.heroSub}>Total earned · USDC</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Black card */}
      <ScrollView
        style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}
      >
        {/* Stats */}
        <View style={styles.grid}>
          {[
            { label: "Available",  value: fmt(safe(available)),                       unit: "USDC",  accent: true  },
            { label: "Streaming",  value: safe(streamingPerSec).toFixed(7),           unit: "USDC/s",accent: false },
            { label: "Withdrawn",  value: fmt(safe(withdrawn)),                       unit: "USDC",  accent: false },
            { label: "Streams",    value: String(activeStreams.length),               unit: "",      accent: false },
          ].map(({ label, value, unit, accent }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, accent && { color: c.accent }]}>
                {label === "Streams" ? value : mask(value)}
              </Text>
              {!!unit && <Text style={styles.statUnit}>{unit}</Text>}
            </View>
          ))}
        </View>

        {/* Active stream badge */}
        {activeStreams.length > 0 && (
          <View style={styles.streamBadge}>
            <View style={styles.streamDot} />
            <Text style={styles.streamBadgeText}>
              {activeStreams.length} active stream{activeStreams.length !== 1 ? "s" : ""} ·{" "}
              {mask(`$${streamingPerSec.toFixed(7)}/sec`)}
            </Text>
          </View>
        )}

        {/* No wallet linked notice */}
        {!user?.stellarAddress && (
          <View style={styles.noWalletBanner}>
            <Ionicons name="warning-outline" size={16} color="#F5C249" />
            <Text style={styles.noWalletText}>
              Link your Stellar wallet in Settings to see live earnings.
            </Text>
          </View>
        )}

        {/* Employers */}
        <Text style={styles.sectionTitle}>My Employer</Text>
        {streamsLoading ? (
          <ActivityIndicator color={c.accent} style={{ marginBottom: 24 }} />
        ) : activeStreams.length === 0 ? (
          <View style={[styles.employerCard, { marginBottom: 24 }]}>
            <View style={[styles.employerAvatar, { backgroundColor: c.card }]}>
              <Ionicons name="business-outline" size={20} color={c.textSubtle} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.employerTitle, { color: c.textSubtle }]}>No active employer</Text>
              <Text style={styles.employerSub}>Streams will appear here once created</Text>
            </View>
          </View>
        ) : (
          activeStreams.map(stream => {
            const initials = stream.employer
              ? stream.employer.slice(0, 2).toUpperCase()
              : "??";
            return (
              <View key={stream.streamId} style={[styles.employerCard, { marginBottom: 12 }]}>
                <View style={styles.employerAvatar}>
                  <Text style={styles.employerAvatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.employerTitle}>{shortenAddress(stream.employer, 6)}</Text>
                  <Text style={styles.employerSub}>
                    {stream.chain === "stellar" ? "Stellar" : "Base"} · Stream #{stream.streamId}
                  </Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Wallet */}
        {user?.stellarAddress && (
          <>
            <Text style={styles.sectionTitle}>My Wallet</Text>
            <View style={styles.walletCard}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet-outline" size={18} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletAddress}>{shortenAddress(user.stellarAddress, 6)}</Text>
                <Text style={styles.walletSub}>Stellar address</Text>
              </View>
              <Ionicons name="copy-outline" size={18} color={c.textSubtle} />
            </View>
          </>
        )}

        {/* Recent payouts */}
        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        {historyLoading ? (
          <ActivityIndicator color={c.accent} />
        ) : payouts.length === 0 ? (
          <Text style={styles.emptyText}>No payouts yet</Text>
        ) : (
          <View style={styles.payoutList}>
            {payouts.slice(0, 5).map((p, i) => (
              <View
                key={p.txHash}
                style={[styles.payoutRow, i < Math.min(payouts.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
              >
                <View style={styles.payoutIcon}>
                  <FontAwesome5 name="arrow-circle-down" size={16} color="#F5C249" solid />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutAmount}>
                    {visible ? `+${parseFloat(p.amount).toFixed(4)}` : MASK} {p.tokenSymbol}
                  </Text>
                  <Text style={styles.payoutDate}>
                    {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
                <View style={styles.payoutBadge}>
                  <Text style={styles.payoutBadgeText}>Paid</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={c.textSubtle} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: "#F5C249" },

  header:          { minHeight: HEADER_H },
  headerInner:     { paddingHorizontal: 20, justifyContent: "space-between", paddingBottom: 20, gap: 8 },
  headerRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  headerActions:   { flexDirection: "row", gap: 8 },
  iconBtn:         { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  greeting:        { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "rgba(0,0,0,0.6)", marginBottom: 2 },
  heroValue:       { fontFamily: "Urbanist_900Black", fontSize: 34, color: "#000", letterSpacing: -1.5 },
  heroSub:         { fontFamily: "Urbanist_500Medium", fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 2 },

  card:            { flex: 1, backgroundColor: "#000", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:     { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  grid:            { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard:        { flex: 1, minWidth: "45%", backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
  statLabel:       { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  statValue:       { fontFamily: "Urbanist_800ExtraBold", fontSize: 20, color: c.text, letterSpacing: -0.5 },
  statUnit:        { fontFamily: "Urbanist_400Regular", fontSize: 11, color: c.textMuted, marginTop: 2 },

  streamBadge:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(245,194,73,0.08)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start", marginBottom: 24, borderWidth: 1, borderColor: "rgba(245,194,73,0.2)" },
  streamDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F5C249" },
  streamBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: "#F5C249" },

  noWalletBanner:  { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(245,194,73,0.06)", borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(245,194,73,0.15)" },
  noWalletText:    { fontFamily: "Urbanist_500Medium", fontSize: 13, color: c.textSubtle, flex: 1 },

  sectionTitle:    { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 12 },

  employerCard:    { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 12 },
  employerAvatar:  { width: 44, height: 44, borderRadius: 12, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
  employerAvatarText: { fontFamily: "Urbanist_800ExtraBold", fontSize: 14, color: "#000" },
  employerTitle:   { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  employerSub:     { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },
  activeBadge:     { backgroundColor: "rgba(245,194,73,0.1)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: "#F5C249" },

  walletCard:      { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  walletIcon:      { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(245,194,73,0.1)", alignItems: "center", justifyContent: "center" },
  walletAddress:   { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  walletSub:       { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },

  emptyText:       { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted, marginBottom: 24 },

  payoutList:      { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, marginBottom: 24, overflow: "hidden" },
  payoutRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  payoutIcon:      { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(245,194,73,0.1)", alignItems: "center", justifyContent: "center" },
  payoutAmount:    { fontFamily: "Urbanist_700Bold", fontSize: 14, color: "#F5C249" },
  payoutDate:      { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 1 },
  payoutBadge:     { backgroundColor: "rgba(245,194,73,0.1)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  payoutBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: "#F5C249" },

  signOutBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  signOutText:     { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textSubtle },
});
