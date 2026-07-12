import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { useState, useMemo } from "react";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { useSendUsdc } from "../../hooks/useSendUsdc";

const { height: SH } = Dimensions.get("window");

export default function SendScreen() {
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const source = user?.stellarAddress ?? null;
  const { usdc, refetch } = useWalletBalance(source);
  const { send, state, error, txHash } = useSendUsdc(source);

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");

  const busy = state === "building" || state === "signing" || state === "sending";
  const amt = parseFloat(amount);
  const canSubmit = !!destination.trim() && amt > 0 && amt <= usdc && !busy;

  const btnLabel =
    state === "building" ? "Preparing…" :
    state === "signing"  ? "Signing…" :
    state === "sending"  ? "Sending…" :
    "Send USDC";

  async function handleSend() {
    const ok = await send(destination, amount);
    if (ok) {
      setAmount("");
      setDestination("");
      await refetch();
    }
  }

  if (state === "done" && txHash) {
    return (
      <View style={styles.root}>
        <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
          <SafeAreaView edges={["top"]} style={styles.headerInner}>
            <Text style={styles.title}>Sent</Text>
          </SafeAreaView>
        </SafeGradient>
        <View style={[styles.card, { padding: 24, alignItems: "center", justifyContent: "flex-start" }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#000" />
          </View>
          <Text style={styles.successTitle}>USDC sent</Text>
          <Text style={styles.successSub}>Your payment settled on Stellar.</Text>
          <Text style={styles.txHash} numberOfLines={1}>Tx {txHash.slice(0, 12)}…</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Send</Text>
          </View>
          <View>
            <Text style={styles.balanceLabel}>WALLET BALANCE</Text>
            <Text style={styles.balanceValue}>{usdc.toFixed(2)} <Text style={styles.balanceUnit}>USDC</Text></Text>
          </View>
        </SafeAreaView>
      </SafeGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cardContent}>
        <Text style={styles.fieldLabel}>Recipient Stellar address</Text>
        <View style={styles.addrRow}>
          <TextInput
            style={styles.addrInput}
            placeholder="G…"
            placeholderTextColor={c.textSubtle}
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.fieldLabel}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={c.textSubtle} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(usdc > 0 ? usdc.toFixed(2) : "")}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        {amt > 0 && (
          <View style={styles.summary}>
            {[["Amount", `${amt.toFixed(2)} USDC`], ["Network fee", "~$0.001"], ["They receive", `${amt.toFixed(2)} USDC`]].map(([l, v]) => (
              <View key={l} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{l}</Text>
                <Text style={styles.summaryValue}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.sendBtn, !canSubmit && styles.sendBtnDisabled]} disabled={!canSubmit} onPress={() => void handleSend()}>
          {busy ? <ActivityIndicator color="#000" /> : <Ionicons name="paper-plane-outline" size={20} color={canSubmit ? "#000" : c.textSubtle} />}
          <Text style={[styles.sendBtnText, !canSubmit && { color: c.textSubtle }]}>{btnLabel}</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Sends USDC from your wallet to any Stellar address. The recipient must have a USDC trustline. Transactions are irreversible.</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:           { flex: 1, backgroundColor: "#F5C249" },
  header:         { minHeight: SH * 0.24 },
  headerInner:    { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 12, flex: 1 },
  topRow:         { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn:        { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)" },
  title:          { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  balanceLabel:   { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: "rgba(0,0,0,0.5)", letterSpacing: 1 },
  balanceValue:   { fontFamily: "Urbanist_900Black", fontSize: 34, color: "#000", letterSpacing: -1.5 },
  balanceUnit:    { fontSize: 16, color: "rgba(0,0,0,0.5)" },
  card:           { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:    { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  fieldLabel:     { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text, marginBottom: 8 },
  addrRow:        { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 20 },
  addrInput:      { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text, paddingHorizontal: 16, paddingVertical: 16 },
  inputRow:       { flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 20 },
  input:          { flex: 1, fontFamily: "Urbanist_700Bold", fontSize: 20, color: c.text, paddingHorizontal: 16, paddingVertical: 14 },
  maxBtn:         { paddingHorizontal: 16, paddingVertical: 14 },
  maxBtnText:     { fontFamily: "Urbanist_800ExtraBold", fontSize: 13, color: c.accentText, letterSpacing: 0.5 },
  summary:        { backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, gap: 10 },
  summaryRow:     { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:   { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted },
  summaryValue:   { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  error:          { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "#ef4444", marginBottom: 14 },
  sendBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 18, marginBottom: 14 },
  sendBtnDisabled:{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  sendBtnText:    { fontFamily: "Urbanist_800ExtraBold", fontSize: 16, color: "#000" },
  disclaimer:     { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textSubtle, textAlign: "center", lineHeight: 18 },
  successIcon:    { width: 72, height: 72, borderRadius: 36, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 16 },
  successTitle:   { fontFamily: "Urbanist_800ExtraBold", fontSize: 22, color: c.text },
  successSub:     { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textMuted, marginTop: 4 },
  txHash:         { fontFamily: "Urbanist_500Medium", fontSize: 12, color: c.textSubtle, marginTop: 12 },
  doneBtn:        { backgroundColor: c.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, marginTop: 28 },
  doneBtnText:    { fontFamily: "Urbanist_800ExtraBold", fontSize: 16, color: "#000" },
});
