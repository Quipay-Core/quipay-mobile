import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import { Colors } from "../../constants/theme";

const c = Colors.dark;
const AVAILABLE = "0.00";

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <ScreenHeader title="Withdraw" subtitle="Send your earnings to your wallet" />

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to Withdraw</Text>
          <Text style={styles.balanceValue}>{AVAILABLE} <Text style={styles.balanceCurrency}>XLM</Text></Text>
          <View style={styles.networkRow}>
            <View style={styles.networkBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.networkText}>Quipay Network</Text>
            </View>
          </View>
        </View>

        {/* Amount input */}
        <Text style={styles.fieldLabel}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={c.textSubtle}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(AVAILABLE)}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        {/* Quick % */}
        <View style={styles.quickRow}>
          {["25%", "50%", "75%", "100%"].map((pct) => (
            <TouchableOpacity key={pct} style={styles.pctBtn}>
              <Text style={styles.pctBtnText}>{pct}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Destination */}
        <Text style={styles.fieldLabel}>To</Text>
        <View style={styles.destinationCard}>
          <Ionicons name="wallet-outline" size={18} color={c.textSubtle} />
          <Text style={styles.destinationText}>Your connected wallet</Text>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>

        {/* Summary */}
        {amount !== "" && (
          <View style={styles.summary}>
            {[
              { label: "Amount",           value: `${amount} XLM` },
              { label: "Network fee",      value: "~0.00001 XLM"  },
              { label: "You will receive", value: `${amount} XLM` },
            ].map(({ label, value }) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.withdrawBtn, !amount && styles.withdrawBtnDisabled]}
          disabled={!amount}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color={amount ? "#000" : c.textSubtle} />
          <Text style={[styles.withdrawBtnText, !amount && { color: c.textSubtle }]}>Withdraw Now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Withdrawals go directly to your connected wallet. Transactions are irreversible.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, paddingHorizontal: 20 },
  balanceCard:         { backgroundColor: c.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: c.border },
  balanceLabel:        { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  balanceValue:        { fontFamily: "Urbanist_900Black", fontSize: 40, color: c.text, letterSpacing: -2, marginBottom: 12 },
  balanceCurrency:     { fontSize: 22, color: c.textMuted, letterSpacing: 0 },
  networkRow:          { flexDirection: "row" },
  networkBadge:        { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  greenDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" },
  networkText:         { fontFamily: "Urbanist_500Medium", fontSize: 12, color: "#22c55e" },
  fieldLabel:          { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.text, marginBottom: 8 },
  inputRow:            { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 10 },
  input:               { flex: 1, fontFamily: "Urbanist_700Bold", fontSize: 20, color: c.text, paddingHorizontal: 16, paddingVertical: 14 },
  maxBtn:              { paddingHorizontal: 16, paddingVertical: 14 },
  maxBtnText:          { fontFamily: "Urbanist_800ExtraBold", fontSize: 12, color: c.accent, letterSpacing: 0.5 },
  quickRow:            { flexDirection: "row", gap: 8, marginBottom: 24 },
  pctBtn:              { flex: 1, backgroundColor: c.card, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: c.border },
  pctBtnText:          { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.textMuted },
  destinationCard:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: c.border },
  destinationText:     { flex: 1, fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.text },
  connectedBadge:      { backgroundColor: "rgba(34,197,94,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  connectedText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: "#22c55e" },
  summary:             { backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, gap: 10 },
  summaryRow:          { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:        { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted },
  summaryValue:        { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.text },
  withdrawBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 18, marginBottom: 14 },
  withdrawBtnDisabled: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  withdrawBtnText:     { fontFamily: "Urbanist_800ExtraBold", fontSize: 16, color: "#000" },
  disclaimer:          { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textSubtle, textAlign: "center", lineHeight: 18, marginBottom: 32 },
});
