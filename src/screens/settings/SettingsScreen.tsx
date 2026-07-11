import { View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { useTheme } from "../../context/ThemeContext";
import { shortenAddress } from "../../utils/format";

const NOTIF_STREAM_KEY = "@quipay_notif_stream";
const NOTIF_PAYOUT_KEY = "@quipay_notif_payout";
const NOTIF_VAULT_KEY  = "@quipay_notif_vault";

const { height: SH } = Dimensions.get("window");

export default function SettingsScreen() {
  const { user } = useAuth();
  const { logout } = usePrivy();
  const { isDark, toggleTheme, colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [notifStream, setNotifStream] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);
  const [notifVault,  setNotifVault]  = useState(false);
  const [copied,      setCopied]      = useState<"evm" | "stellar" | null>(null);

  // Load persisted notification prefs on mount
  useEffect(() => {
    AsyncStorage.multiGet([NOTIF_STREAM_KEY, NOTIF_PAYOUT_KEY, NOTIF_VAULT_KEY])
      .then(([[, s], [, p], [, v]]) => {
        if (s !== null) setNotifStream(s === "true");
        if (p !== null) setNotifPayout(p === "true");
        if (v !== null) setNotifVault(v === "true");
      })
      .catch(console.warn);
  }, []);

  function handleNotifChange(key: string, setter: (v: boolean) => void, val: boolean) {
    setter(val);
    AsyncStorage.setItem(key, String(val)).catch(console.warn);
  }

  async function handleCopy(which: "evm" | "stellar", address: string) {
    await Clipboard.setStringAsync(address);
    setCopied(which);
    setTimeout(() => setCopied((cur) => (cur === which ? null : cur)), 1500);
  }

  const wallets: { key: "evm" | "stellar"; icon: keyof typeof Ionicons.glyphMap; label: string; address: string | null }[] = [
    { key: "evm",     icon: "cube-outline",  label: "Arc / Base (USDC)", address: user?.evmAddress ?? null },
    { key: "stellar", icon: "star-outline",  label: "Stellar (USDC)",    address: user?.stellarAddress ?? null },
  ];

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Settings</Text>
          {user && <Text style={styles.sub}>{user.email ?? user.name ?? "Worker"}</Text>}
        </SafeAreaView>
      </SafeGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: c.accentMuted }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={c.accentText} />
              </View>
              <View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSub}>Currently {isDark ? "dark" : "light"}</Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: c.border, true: c.accentTrack }} thumbColor={isDark ? c.accent : c.textSubtle} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.group}>
          {[
            { label: "Stream paid out",    sub: "When your stream pays out",  value: notifPayout, set: (v: boolean) => handleNotifChange(NOTIF_PAYOUT_KEY,  setNotifPayout,  v) },
            { label: "New stream created", sub: "Employer created a stream",  value: notifStream, set: (v: boolean) => handleNotifChange(NOTIF_STREAM_KEY,  setNotifStream,  v) },
            { label: "Low vault balance",  sub: "Employer treasury is low",   value: notifVault,  set: (v: boolean) => handleNotifChange(NOTIF_VAULT_KEY,   setNotifVault,   v) },
          ].map(({ label, sub, value, set }, i, arr) => (
            <View key={label} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.accentMuted }]}>
                  <Ionicons name="notifications-outline" size={18} color={c.accentText} />
                </View>
                <View>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowSub}>{sub}</Text>
                </View>
              </View>
              <Switch value={value} onValueChange={set} trackColor={{ false: c.border, true: c.accentTrack }} thumbColor={value ? c.accent : c.textSubtle} />
            </View>
          ))}
        </View>

        {user && (
          <>
            <Text style={styles.sectionTitle}>Wallets</Text>
            <View style={styles.group}>
              {wallets.map(({ key, icon, label, address }, i, arr) => (
                <View key={key} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: c.accentMuted }]}>
                      <Ionicons name={icon} size={18} color={c.accentText} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{label}</Text>
                      <Text style={styles.rowSub}>
                        {address ? shortenAddress(address, 8) : "Provisioning…"}
                      </Text>
                    </View>
                  </View>
                  {address ? (
                    <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopy(key, address)} hitSlop={8}>
                      {copied === key ? (
                        <>
                          <Ionicons name="checkmark" size={15} color={c.success} />
                          <Text style={[styles.copyText, { color: c.success }]}>Copied</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="copy-outline" size={15} color={c.accentText} />
                          <Text style={styles.copyText}>Copy</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <ActivityIndicator size="small" color={c.textSubtle} />
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.walletNote}>Managed by Privy · non-custodial</Text>

            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.group}>
              <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: c.accentMuted }]}>
                    <Ionicons name="person-outline" size={18} color={c.accentText} />
                  </View>
                  <Text style={styles.rowLabel}>{user.name ?? user.email ?? "Worker"}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.row} onPress={logout}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                  </View>
                  <Text style={[styles.rowLabel, { color: "#ef4444" }]}>Sign out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.group}>
          {[["Version", "1.0.0"], ["Protocol", "Quipay Protocol"], ["License", "MIT"]].map(([l, v], i, arr) => (
            <View key={l} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <Text style={styles.rowLabel}>{l}</Text>
              <Text style={styles.rowValue}>{v}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#F5C249" },
  header:       { minHeight: SH * 0.25 },
  headerInner:  { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:        { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  sub:          { fontFamily: "Urbanist_500Medium", fontSize: 14, color: "rgba(0,0,0,0.55)", marginTop: 4 },
  card:         { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:  { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  group:        { backgroundColor: c.card, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  row:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  rowLeft:      { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox:      { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel:     { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: c.text },
  rowSub:       { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 1 },
  rowValue:     { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.textMuted },
  copyBtn:      { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: c.accentMuted },
  copyText:     { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.accentText },
  walletNote:   { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textSubtle, textAlign: "center", marginTop: -12, marginBottom: 20 },
});
