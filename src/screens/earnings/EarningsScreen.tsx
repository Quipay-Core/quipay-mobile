import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import { StatCard } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;

export default function EarningsScreen() {
  const { user, logout } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <ScreenHeader showLogo rightIcon="notifications-outline" title="" />

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName} 👋</Text>
            <Text style={styles.greetingSub}>Here's your earnings overview</Text>
          </View>
        </View>

        {/* Balance hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Earned</Text>
          <Text style={styles.heroValue}>—</Text>
          <Text style={styles.heroSub}>XLM</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>No active streams</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <StatCard label="Available"  value="—" />
          <StatCard label="Streaming"  value="—" accent />
          <StatCard label="Withdrawn"  value="—" />
          <StatCard label="Streams"    value="—" />
        </View>

        {/* Wallet address */}
        {user?.stellarAddress && (
          <>
            <Text style={styles.sectionTitle}>My Wallet</Text>
            <View style={styles.walletCard}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet-outline" size={18} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletAddress}>
                  {shortenAddress(user.stellarAddress, 6)}
                </Text>
                <Text style={styles.walletSub}>Stellar address</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="copy-outline" size={18} color={c.textSubtle} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Employer */}
        <Text style={styles.sectionTitle}>My Employer</Text>
        <View style={styles.employerCard}>
          <View style={styles.employerIcon}>
            <Ionicons name="business-outline" size={22} color={c.textSubtle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.employerTitle}>Not registered</Text>
            <Text style={styles.employerSub}>Ask your employer for their wallet address to join</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>

        {/* Recent payouts */}
        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        <EmptyState
          icon="receipt-outline"
          title="No payouts yet"
          subtitle="Your payment history will appear here once you start receiving streams"
        />

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={c.textSubtle} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, paddingHorizontal: 20 },
  greetingRow:    { marginBottom: 16 },
  greeting:       { fontFamily: "Urbanist_700Bold", fontSize: 20, color: c.text, letterSpacing: -0.3 },
  greetingSub:    { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 2 },
  heroCard:       { backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: c.border },
  heroLabel:      { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  heroValue:      { fontFamily: "Urbanist_900Black", fontSize: 44, color: c.text, letterSpacing: -2, marginBottom: 4 },
  heroSub:        { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginBottom: 16 },
  statusRow:      { flexDirection: "row" },
  statusBadge:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: c.textSubtle },
  statusText:     { fontFamily: "Urbanist_500Medium", fontSize: 12, color: c.textMuted },
  grid:           { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  sectionTitle:   { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 12 },
  walletCard:     { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  walletIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(245,194,73,0.1)", alignItems: "center", justifyContent: "center" },
  walletAddress:  { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  walletSub:      { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },
  employerCard:   { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  employerIcon:   { width: 44, height: 44, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  employerTitle:  { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  employerSub:    { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },
  joinBtn:        { backgroundColor: c.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinBtnText:    { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "#000" },
  signOutBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, marginBottom: 32 },
  signOutText:    { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textSubtle },
});
