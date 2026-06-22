import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useWithdrawalHistory } from "../../hooks/useWorkerData";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;

export default function HistoryScreen() {
  const { user } = useAuth();
  const { records, loading, error } = useWithdrawalHistory(user?.stellarAddress ?? null);

  const totalWithdrawn = records.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.heading}>History</Text>
        <Text style={styles.sub}>Your past payouts and transactions</Text>

        {/* No wallet linked */}
        {!user?.stellarAddress && (
          <View style={styles.noWalletBanner}>
            <Ionicons name="warning-outline" size={16} color="#F5C249" />
            <Text style={styles.noWalletText}>
              Link your Stellar wallet in Settings to see transaction history.
            </Text>
          </View>
        )}

        {/* Summary */}
        {records.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Withdrawn</Text>
              <Text style={styles.summaryValue}>
                {totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </Text>
              <Text style={styles.summaryUnit}>USDC all time</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Transactions</Text>
              <Text style={styles.summaryValue}>{records.length}</Text>
              <Text style={styles.summaryUnit}>total payouts</Text>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-offline-outline" size={28} color="#ef4444" />
            </View>
            <Text style={styles.emptyTitle}>Could not load history</Text>
            <Text style={styles.emptySub}>{error}</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={28} color={c.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySub}>All your payouts and withdrawals will appear here</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {records.map((rec, i) => (
              <View
                key={rec.txHash}
                style={[styles.row, i < records.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
              >
                <View style={styles.rowIcon}>
                  <FontAwesome5 name="arrow-circle-down" size={16} color="#F5C249" solid />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowAmount}>
                    +{parseFloat(rec.amount).toFixed(4)} {rec.tokenSymbol}
                  </Text>
                  <Text style={styles.rowDate}>
                    {new Date(rec.createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                    {" · "}Stream #{rec.streamId}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://stellar.expert/explorer/testnet/tx/${rec.txHash}`
                    )
                  }
                >
                  <Ionicons name="open-outline" size={16} color={c.textSubtle} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, paddingHorizontal: 20 },
  heading:       { fontFamily: "Urbanist_800ExtraBold", fontSize: 24, color: c.text, letterSpacing: -0.5, paddingTop: 16, marginBottom: 4 },
  sub:           { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted, marginBottom: 20 },

  noWalletBanner:{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(245,194,73,0.06)", borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(245,194,73,0.15)" },
  noWalletText:  { fontFamily: "Urbanist_500Medium", fontSize: 13, color: c.textSubtle, flex: 1 },

  summaryRow:    { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard:   { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: c.border },
  summaryLabel:  { fontFamily: "Urbanist_600SemiBold", fontSize: 10, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  summaryValue:  { fontFamily: "Urbanist_800ExtraBold", fontSize: 22, color: "#F5C249", letterSpacing: -0.5 },
  summaryUnit:   { fontFamily: "Urbanist_400Regular", fontSize: 11, color: c.textMuted, marginTop: 2 },

  empty:         { alignItems: "center", paddingTop: 48 },
  emptyIcon:     { width: 56, height: 56, borderRadius: 16, backgroundColor: c.card, alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: c.border },
  emptyTitle:    { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 6 },
  emptySub:      { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, textAlign: "center", lineHeight: 20 },

  list:          { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden", marginBottom: 16 },
  row:           { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowIcon:       { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(245,194,73,0.1)", alignItems: "center", justifyContent: "center" },
  rowAmount:     { fontFamily: "Urbanist_700Bold", fontSize: 14, color: "#F5C249" },
  rowDate:       { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 1 },
});
