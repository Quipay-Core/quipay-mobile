import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { LogoWordmark } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";
import { useWorkerBalance, useWorkerStreams, useWithdrawalHistory, useNotifications } from "../../hooks/useWorkerData";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { useLiveValue } from "../../hooks/useLiveValue";
import { useQuipayId } from "../../hooks/useQuipayId";

const { height: SH } = Dimensions.get("window");
const HEADER_H = SH * 0.25;

const MASK = "••••••";

export default function EarningsScreen() {
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { logout } = usePrivy();
  const [visible, setVisible] = useState(false);

  const { available, streamingPerSec, withdrawn, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useWorkerBalance();
  const { streams, loading: streamsLoading, error: streamsError, refetch: refetchStreams } = useWorkerStreams();
  const { records: payouts, loading: historyLoading, error: historyError } = useWithdrawalHistory(user?.stellarAddress ?? null);
  const { unreadCount } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchStreams()]);
    setRefreshing(false);
  }, [refetchBalance, refetchStreams]);

  const { usdc: walletUsdc } = useWalletBalance(user?.stellarAddress ?? null);
  const { quipayId, email: qpEmail } = useQuipayId();

  const activeStreams = streams.filter(s => s.status === "active");
  const safe = (n: number) => (isNaN(n) || !isFinite(n) ? 0 : n);
  // Stream earnings that keep vesting between polls — tick live.
  const liveAvailable = useLiveValue(safe(available), safe(streamingPerSec));
  const totalEarned = safe(withdrawn) + liveAvailable;

  const fmt = (n: number) =>
    safe(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const mask = (val: string) => (visible ? val : MASK);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const emailForName = user?.email ?? qpEmail ?? undefined;
  const displayName =
    user?.name?.split(" ")[0] ??
    emailForName?.split("@")[0] ??
    quipayId ??
    "there";
  const isLoading = balanceLoading || streamsLoading || historyLoading;

  return (
    <View style={styles.root}>

      {/* Yellow header */}
      <SafeGradient
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
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/notifications" as Href)}>
                <Ionicons name="notifications-outline" size={18} color="#000" />
                {unreadCount > 0 && <View style={styles.notifDot} />}
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName} 👋</Text>
            {isLoading ? (
              <ActivityIndicator color="#000" style={{ marginVertical: 8 }} />
            ) : (
              <Text style={styles.heroValue}>{mask(`$${fmt(walletUsdc)}`)}</Text>
            )}
            <Text style={styles.heroSub}>Wallet balance · USDC</Text>
          </View>
        </SafeAreaView>
      </SafeGradient>

      {/* Black card */}
      <ScrollView
        style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.accentText} />}
      >
        {/* Stats */}
        <View style={styles.grid}>
          {[
            { label: "Available",  value: liveAvailable.toFixed(6),                    unit: "USDC",  accent: true  },
            { label: "Streaming",  value: safe(streamingPerSec).toFixed(7),           unit: "USDC/s",accent: false },
            { label: "Withdrawn",  value: fmt(safe(withdrawn)),                       unit: "USDC",  accent: false },
            { label: "Streams",    value: String(activeStreams.length),               unit: "",      accent: false },
          ].map(({ label, value, unit, accent }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, accent && { color: c.accentText }]}>
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
            <Ionicons name="warning-outline" size={16} color={c.accentText} />
            <Text style={styles.noWalletText}>
              Link your Stellar wallet in Settings to see live earnings.
            </Text>
          </View>
        )}

        {/* Data fetch errors */}
        {(balanceError || streamsError) && (
          <View style={styles.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#ef4444" />
            <Text style={styles.errorBannerText}>
              {balanceError ?? streamsError}
            </Text>
          </View>
        )}

        {/* Employers */}
        <Text style={styles.sectionTitle}>My Employer</Text>
        {streamsLoading ? (
          <ActivityIndicator color={c.accentText} style={{ marginBottom: 24 }} />
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
                <Ionicons name="wallet-outline" size={18} color={c.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletAddress}>{shortenAddress(user.stellarAddress, 6)}</Text>
                <Text style={styles.walletSub}>Stellar address</Text>
              </View>
              <Ionicons name="copy-outline" size={18} color={c.textSubtle} />
            </View>
            <TouchableOpacity style={styles.sendCta} onPress={() => router.push("/send" as Href)}>
              <Ionicons name="paper-plane-outline" size={18} color="#000" />
              <Text style={styles.sendCtaText}>Send USDC</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Recent payouts */}
        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        {historyLoading ? (
          <ActivityIndicator color={c.accentText} />
        ) : historyError ? (
          <Text style={styles.emptyText}>{historyError}</Text>
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
                  <FontAwesome5 name="arrow-circle-down" size={16} color={c.accentText} solid />
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:            { flex: 1, backgroundColor: "#F5C249" },

  header:          { minHeight: HEADER_H },
  headerInner:     { paddingHorizontal: 20, justifyContent: "space-between", paddingBottom: 20, gap: 8 },
  headerRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  headerActions:   { flexDirection: "row", gap: 8 },
  iconBtn:         { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  notifDot:        { position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: "#000" },
  greeting:        { fontFamily: "Urbanist_700Bold", fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 2 },
  heroValue:       { fontFamily: "Urbanist_900Black", fontSize: 34, color: "#000", letterSpacing: -1.5 },
  heroSub:         { fontFamily: "Urbanist_500Medium", fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 },

  card:            { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:     { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  grid:            { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard:        { flex: 1, minWidth: "45%", backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
  statLabel:       { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  statValue:       { fontFamily: "Urbanist_800ExtraBold", fontSize: 20, color: c.text, letterSpacing: -0.5 },
  statUnit:        { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },

  streamBadge:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.accentMuted, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start", marginBottom: 24, borderWidth: 1, borderColor: c.accentBorder },
  streamDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: c.accentText },
  streamBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.accentText },

  noWalletBanner:  { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.accentMuted, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: c.accentBorder },
  noWalletText:    { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textSubtle, flex: 1 },
  errorBanner:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  errorBannerText: { fontFamily: "Urbanist_500Medium", fontSize: 14, color: "#ef4444", flex: 1 },

  sectionTitle:    { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 12 },

  employerCard:    { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 12 },
  employerAvatar:  { width: 44, height: 44, borderRadius: 12, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
  employerAvatarText: { fontFamily: "Urbanist_800ExtraBold", fontSize: 15, color: "#000" },
  employerTitle:   { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: c.text },
  employerSub:     { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 2 },
  activeBadge:     { backgroundColor: c.accentMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.accentText },

  walletCard:      { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 12 },
  sendCta:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 16, marginBottom: 24 },
  sendCtaText:     { fontFamily: "Urbanist_800ExtraBold", fontSize: 15, color: "#000" },
  walletIcon:      { width: 40, height: 40, borderRadius: 12, backgroundColor: c.accentMuted, alignItems: "center", justifyContent: "center" },
  walletAddress:   { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: c.text },
  walletSub:       { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 2 },

  emptyText:       { fontFamily: "Urbanist_400Regular", fontSize: 15, color: c.textMuted, marginBottom: 24 },

  payoutList:      { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, marginBottom: 24, overflow: "hidden" },
  payoutRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  payoutIcon:      { width: 36, height: 36, borderRadius: 10, backgroundColor: c.accentMuted, alignItems: "center", justifyContent: "center" },
  payoutAmount:    { fontFamily: "Urbanist_700Bold", fontSize: 15, color: c.accentText },
  payoutDate:      { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 1 },
  payoutBadge:     { backgroundColor: c.accentMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  payoutBadgeText: { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.accentText },

  signOutBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  signOutText:     { fontFamily: "Urbanist_500Medium", fontSize: 15, color: c.textSubtle },
});
