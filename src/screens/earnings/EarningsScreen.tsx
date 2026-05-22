import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, YellowGradient } from "../../constants/theme";
import { LogoWordmark } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");
const HEADER_H = SH * 0.25;

// ── Dummy data ────────────────────────────────────────────────────────────────
const DUMMY = {
  totalEarned:  "$4,820.50",
  available:    "$1,240.00",
  streaming:    "$320.50",
  withdrawn:    "$3,260.00",
  streams:      "2",
  streamRate:   "$0.00231 / sec",
  employer:     { name: "Acme Corp", since: "Mar 2025", active: true },
  payouts: [
    { id: "1", amount: "$500.00",   date: "May 20, 2025" },
    { id: "2", amount: "$760.00",   date: "May 13, 2025" },
    { id: "3", amount: "$1,000.00", date: "May 6, 2025"  },
    { id: "4", amount: "$1,000.00", date: "Apr 29, 2025" },
  ],
};

export default function EarningsScreen() {
  const { user } = useAuth();
  const { logout } = usePrivy();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

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
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName} 👋</Text>
            <Text style={styles.heroValue}>{DUMMY.totalEarned}</Text>
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
            { label: "Available",  value: DUMMY.available,  accent: true  },
            { label: "Streaming",  value: DUMMY.streaming,  accent: false },
            { label: "Withdrawn",  value: DUMMY.withdrawn,  accent: false },
            { label: "Streams",    value: DUMMY.streams,    accent: false },
          ].map(({ label, value, accent }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, accent && { color: c.accent }]}>{value}</Text>
              {label !== "Streams" && <Text style={styles.statUnit}>USDC</Text>}
            </View>
          ))}
        </View>

        {/* Active stream badge */}
        <View style={styles.streamBadge}>
          <View style={styles.streamDot} />
          <Text style={styles.streamBadgeText}>2 active streams · {DUMMY.streamRate}</Text>
        </View>

        {/* Employer */}
        <Text style={styles.sectionTitle}>My Employer</Text>
        <View style={styles.employerCard}>
          <View style={styles.employerAvatar}>
            <Text style={styles.employerAvatarText}>AC</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.employerTitle}>{DUMMY.employer.name}</Text>
            <Text style={styles.employerSub}>Registered since {DUMMY.employer.since}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        </View>

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
        <View style={styles.payoutList}>
          {DUMMY.payouts.map((p, i) => (
            <View
              key={p.id}
              style={[styles.payoutRow, i < DUMMY.payouts.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
            >
              <View style={styles.payoutIcon}>
                <FontAwesome5 name="arrow-circle-down" size={16} color="#F5C249" solid />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutAmount}>+{p.amount} USDC</Text>
                <Text style={styles.payoutDate}>{p.date}</Text>
              </View>
              <View style={styles.payoutBadge}>
                <Text style={styles.payoutBadgeText}>Paid</Text>
              </View>
            </View>
          ))}
        </View>

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
  notifBtn:        { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  greeting:        { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "rgba(0,0,0,0.6)", marginBottom: 2 },
  heroValue:       { fontFamily: "Urbanist_900Black", fontSize: 34, color: "#000", letterSpacing: -1.5 },
  heroUnit:        { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: "rgba(0,0,0,0.5)", letterSpacing: 0 },
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

  sectionTitle:    { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 12 },

  employerCard:    { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
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
