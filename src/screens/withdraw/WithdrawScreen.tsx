import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { useState, useMemo } from "react";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useWorkerBalance } from "../../hooks/useWorkerData";
import { useAuth } from "../../context/AuthContext";
import { shortenAddress } from "../../utils/format";

const { height: SH } = Dimensions.get("window");

export default function WithdrawScreen() {
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { available, loading: balanceLoading } = useWorkerBalance();
  const [amount, setAmount] = useState("");

  function handlePct(pct: number) {
    const val = (available * pct) / 100;
    setAmount(val > 0 ? val.toFixed(2) : "");
  }

  function handleWithdraw() {
    if (!user?.stellarAddress) {
      Alert.alert("No wallet linked", "Link a Stellar wallet in Settings before withdrawing.");
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount greater than 0.");
      return;
    }
    if (parsed > available) {
      Alert.alert("Insufficient balance", `You only have ${available.toFixed(2)} USDC available.`);
      return;
    }
    // TODO: call withdraw API
    Alert.alert("Confirm withdrawal", `Withdraw ${parsed.toFixed(2)} USDC to ${shortenAddress(user.stellarAddress, 6)}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => { /* call API */ } },
    ]);
  }

  const canSubmit = !!amount && !balanceLoading;

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Withdraw</Text>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE</Text>
            {balanceLoading
              ? <ActivityIndicator color="#000" style={{ marginTop: 4 }} />
              : <Text style={styles.balanceValue}>{available.toFixed(2)} <Text style={styles.balanceUnit}>USDC</Text></Text>
            }
          </View>
        </SafeAreaView>
      </SafeGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cardContent}>
        <Text style={styles.fieldLabel}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={c.textSubtle} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(available > 0 ? available.toFixed(2) : "")}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {([25, 50, 75, 100] as const).map(pct => (
            <TouchableOpacity key={pct} style={styles.pctBtn} onPress={() => handlePct(pct)}>
              <Text style={styles.pctBtnText}>{pct}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>To</Text>
        <View style={styles.destinationCard}>
          <Ionicons name="wallet-outline" size={18} color={c.textSubtle} />
          <Text style={styles.destinationText}>
            {user?.stellarAddress ? shortenAddress(user.stellarAddress, 8) : "No wallet linked — add one in Settings"}
          </Text>
          {user?.stellarAddress && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          )}
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

        <TouchableOpacity style={[styles.withdrawBtn, !canSubmit && styles.withdrawBtnDisabled]} disabled={!canSubmit} onPress={handleWithdraw}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={canSubmit ? "#000" : c.textSubtle} />
          <Text style={[styles.withdrawBtnText, !canSubmit && { color: c.textSubtle }]}>Withdraw Now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Withdrawals go directly to your connected wallet. Transactions are irreversible.</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:                { flex: 1, backgroundColor: "#F5C249" },
  header:              { minHeight: SH * 0.25 },
  headerInner:         { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:               { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1, paddingTop: 4 },
  balanceLabel:        { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: "rgba(0,0,0,0.5)", letterSpacing: 1 },
  balanceValue:        { fontFamily: "Urbanist_900Black", fontSize: 36, color: "#000", letterSpacing: -1.5 },
  balanceUnit:         { fontSize: 16, color: "rgba(0,0,0,0.5)", letterSpacing: 0 },
  card:                { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  fieldLabel:          { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text, marginBottom: 8 },
  inputRow:            { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 10 },
  input:               { flex: 1, fontFamily: "Urbanist_700Bold", fontSize: 20, color: c.text, paddingHorizontal: 16, paddingVertical: 14 },
  maxBtn:              { paddingHorizontal: 16, paddingVertical: 14 },
  maxBtnText:          { fontFamily: "Urbanist_800ExtraBold", fontSize: 13, color: c.accentText, letterSpacing: 0.5 },
  quickRow:            { flexDirection: "row", gap: 8, marginBottom: 24 },
  pctBtn:              { flex: 1, backgroundColor: c.card, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: c.border },
  pctBtnText:          { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.textMuted },
  destinationCard:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: c.border },
  destinationText:     { flex: 1, fontFamily: "Urbanist_500Medium", fontSize: 15, color: c.text },
  connectedBadge:      { backgroundColor: c.accentMuted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  connectedText:       { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.accentText },
  summary:             { backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, gap: 10 },
  summaryRow:          { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:        { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted },
  summaryValue:        { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  withdrawBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 18, marginBottom: 14 },
  withdrawBtnDisabled: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  withdrawBtnText:     { fontFamily: "Urbanist_800ExtraBold", fontSize: 16, color: "#000" },
  disclaimer:          { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textSubtle, textAlign: "center", lineHeight: 18, marginBottom: 32 },
});
