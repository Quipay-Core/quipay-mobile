import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatCard } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Colors, YellowGradient } from "../../constants/theme";
import { LogoWordmark } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");
const HEADER_H = SH * 0.25;

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

      {/* Yellow header — 22% */}
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
            <Text style={styles.heroValue}>—  <Text style={styles.heroUnit}>XLM</Text></Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Black card overlaps yellow by 20px */}
      <ScrollView
        style={styles.card}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardContent}
      >
        <View style={styles.grid}>
          <StatCard label="Available"  value="—" />
          <StatCard label="Streaming"  value="—" accent />
          <StatCard label="Withdrawn"  value="—" />
          <StatCard label="Streams"    value="—" />
        </View>

        <Text style={styles.sectionTitle}>My Employer</Text>
        <View style={styles.employerCard}>
          <View style={styles.employerIcon}>
            <Ionicons name="business-outline" size={20} color={c.textSubtle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.employerTitle}>Not registered</Text>
            <Text style={styles.employerSub}>Ask your employer for their wallet address to join</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>

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

        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        <EmptyState
          icon="receipt-outline"
          title="No payouts yet"
          subtitle="Your payment history will appear here once you start receiving streams"
        />

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={c.textSubtle} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#F5C249" },

  header:        { minHeight: HEADER_H },
  headerInner:   { paddingHorizontal: 20, justifyContent: "space-between", paddingBottom: 20, gap: 8 },
  headerRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  notifBtn:      { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  greeting:      { fontFamily: "Urbanist_700Bold", fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 2 },
  heroValue:     { fontFamily: "Urbanist_900Black", fontSize: 36, color: "#000", letterSpacing: -1.5 },
  heroUnit:      { fontFamily: "Urbanist_600SemiBold", fontSize: 16, color: "rgba(0,0,0,0.5)", letterSpacing: 0 },

  card:          { flex: 1, backgroundColor: "#000", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:   { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  grid:          { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  sectionTitle:  { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 12 },
  employerCard:  { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  employerIcon:  { width: 44, height: 44, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  employerTitle: { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  employerSub:   { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },
  joinBtn:       { backgroundColor: c.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinBtnText:   { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "#000" },
  walletCard:    { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  walletIcon:    { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(245,194,73,0.1)", alignItems: "center", justifyContent: "center" },
  walletAddress: { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  walletSub:     { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 2 },
  signOutBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  signOutText:   { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textSubtle },
});
