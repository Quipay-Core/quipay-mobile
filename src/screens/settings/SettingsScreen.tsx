import { View, Text, ScrollView, Switch, TouchableOpacity, TextInput, Alert, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Colors, YellowGradient } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;
const { height: SH } = Dimensions.get("window");

export default function SettingsScreen() {
  const { user, setStellarAddress } = useAuth();
  const { logout } = usePrivy();
  const [isDark,        setIsDark]        = useState(true);
  const [notifStream,   setNotifStream]   = useState(true);
  const [notifPayout,   setNotifPayout]   = useState(true);
  const [notifVault,    setNotifVault]    = useState(false);
  const [editingWallet, setEditingWallet] = useState(false);
  const [walletInput,   setWalletInput]   = useState("");

  async function handleSaveWallet() {
    const addr = walletInput.trim();
    if (!addr.startsWith("G") || addr.length < 40) {
      Alert.alert("Invalid address", "Enter a valid Stellar address (starts with G).");
      return;
    }
    await setStellarAddress(addr);
    setEditingWallet(false);
    setWalletInput("");
    Alert.alert("Saved", "Your Stellar address has been linked.");
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.title}>Settings</Text>
          {user && <Text style={styles.sub}>{user.email ?? user.name ?? "Worker"}</Text>}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(245,194,73,0.1)" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={c.accent} />
              </View>
              <View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSub}>Currently {isDark ? "dark" : "light"}</Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={setIsDark} trackColor={{ false: c.border, true: "rgba(245,194,73,0.3)" }} thumbColor={isDark ? c.accent : c.textSubtle} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.group}>
          {[
            { label: "Stream paid out",    sub: "When your stream pays out",  value: notifPayout, set: setNotifPayout },
            { label: "New stream created", sub: "Employer created a stream",  value: notifStream, set: setNotifStream },
            { label: "Low vault balance",  sub: "Employer treasury is low",   value: notifVault,  set: setNotifVault  },
          ].map(({ label, sub, value, set }, i, arr) => (
            <View key={label} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: "rgba(245,194,73,0.08)" }]}>
                  <Ionicons name="notifications-outline" size={18} color={c.accent} />
                </View>
                <View>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowSub}>{sub}</Text>
                </View>
              </View>
              <Switch value={value} onValueChange={set} trackColor={{ false: c.border, true: "rgba(245,194,73,0.3)" }} thumbColor={value ? c.accent : c.textSubtle} />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.group}>
          {[["Version", "1.0.0"], ["Protocol", "Quipay Protocol"], ["License", "MIT"]].map(([l, v], i, arr) => (
            <View key={l} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <Text style={styles.rowLabel}>{l}</Text>
              <Text style={styles.rowValue}>{v}</Text>
            </View>
          ))}
        </View>

        {user && (
          <>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.group}>
              <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: "rgba(245,194,73,0.1)" }]}>
                    <Ionicons name="person-outline" size={18} color={c.accent} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{user.name ?? user.email ?? "Worker"}</Text>
                    {user.stellarAddress && <Text style={styles.rowSub}>{shortenAddress(user.stellarAddress, 6)}</Text>}
                  </View>
                </View>
              </View>

              {/* Stellar wallet link */}
              {!editingWallet ? (
                <TouchableOpacity
                  style={[styles.row, { borderBottomWidth: 1, borderBottomColor: c.border }]}
                  onPress={() => { setEditingWallet(true); setWalletInput(user.stellarAddress ?? ""); }}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: "rgba(245,194,73,0.1)" }]}>
                      <Ionicons name="wallet-outline" size={18} color={c.accent} />
                    </View>
                    <View>
                      <Text style={styles.rowLabel}>
                        {user.stellarAddress ? "Stellar Wallet" : "Link Stellar Wallet"}
                      </Text>
                      <Text style={styles.rowSub}>
                        {user.stellarAddress
                          ? shortenAddress(user.stellarAddress, 8)
                          : "Tap to add your Stellar address"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textSubtle} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.walletEdit, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                  <TextInput
                    style={styles.walletInput}
                    value={walletInput}
                    onChangeText={setWalletInput}
                    placeholder="G... (Stellar address)"
                    placeholderTextColor={c.textSubtle}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoFocus
                  />
                  <View style={styles.walletBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingWallet(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWallet}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#F5C249" },
  header:       { minHeight: SH * 0.25 },
  headerInner:  { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "center", gap: 4, flex: 1 },
  title:        { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  sub:          { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 4 },
  card:         { flex: 1, backgroundColor: "#000", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:  { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: "Urbanist_600SemiBold", fontSize: 11, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  group:        { backgroundColor: c.card, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  row:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  rowLeft:      { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox:      { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel:     { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  rowSub:       { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 1 },
  rowValue:     { fontFamily: "Urbanist_500Medium", fontSize: 13, color: c.textMuted },
  walletEdit:   { padding: 14, gap: 10 },
  walletInput:  { fontFamily: "Urbanist_500Medium", fontSize: 14, color: c.text, backgroundColor: "#1a1a1a", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: c.border },
  walletBtns:   { flexDirection: "row", gap: 8 },
  cancelBtn:    { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border },
  cancelBtnText:{ fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: c.textSubtle },
  saveBtn:      { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: c.accent },
  saveBtnText:  { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "#000" },
});
