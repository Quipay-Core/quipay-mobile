import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Colors, YellowGradient } from "../../constants/theme";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");
const AVAILABLE = "$1,240.00";

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");

  return (
    <View style={styles.root}>
      <LinearGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Withdraw</Text>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE</Text>
            <Text style={styles.balanceValue}>{AVAILABLE} <Text style={styles.balanceUnit}>USDC</Text></Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cardContent}>
        <Text style={styles.fieldLabel}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={c.textSubtle} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(AVAILABLE)}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {["25%", "50%", "75%", "100%"].map(pct => (
            <TouchableOpacity key={pct} style={styles.pctBtn}>
              <Text style={styles.pctBtnText}>{pct}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>To</Text>
        <View style={styles.destinationCard}>
          <Ionicons name="wallet-outline" size={18} color={c.textSubtle} />
          <Text style={styles.destinationText}>Your connected wallet</Text>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>

        {amount !== "" && (
          <View style={styles.summary}>
            {[["Amount", `${amount} USDC`], ["Network fee", "~$0.001"], ["You will receive", `${amount} USDC`]].map(([l, v]) => (
              <View key={l} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{l}</Text>
                <Text style={styles.summaryValue}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.withdrawBtn, !amount && styles.withdrawBtnDisabled]} disabled={!amount}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={amount ? "#000" : c.textSubtle} />
          <Text style={[styles.withdrawBtnText, !amount && { color: c.textSubtle }]}>Withdraw Now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Withdrawals go directly to your connected wallet. Transactions are irreversible.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:                { flex: 1, backgroundColor: "#F5C249" },
  header:              { minHeight: SH * 0.25 },
  headerInner:         { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:               { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1, paddingTop: 4 },
  balanceLabel:        { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: "rgba(0,0,0,0.5)", letterSpacing: 1 },
  balanceValue:        { fontFamily: "Urbanist_900Black", fontSize: 36, color: "#000", letterSpacing: -1.5 },
  balanceUnit:         { fontSize: 16, color: "rgba(0,0,0,0.5)", letterSpacing: 0 },
  card:                { flex: 1, backgroundColor: "#000", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
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
  connectedBadge:      { backgroundColor: "rgba(245,194,73,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  connectedText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: "#F5C249" },
  summary:             { backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, gap: 10 },
  summaryRow:          { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:        { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted },
  summaryValue:        { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.text },
  withdrawBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 18, marginBottom: 14 },
  withdrawBtnDisabled: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  withdrawBtnText:     { fontFamily: "Urbanist_800ExtraBold", fontSize: 16, color: "#000" },
  disclaimer:          { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textSubtle, textAlign: "center", lineHeight: 18, marginBottom: 32 },
});
