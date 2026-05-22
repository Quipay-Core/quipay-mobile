import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { usePrivy } from "@privy-io/expo";
import { shortenAddress } from "../../utils/format";

const c = Colors.dark;

export default function SettingsScreen() {
  const { user } = useAuth();
  const { logout } = usePrivy();
  const [isDark, setIsDark] = useState(true);
  const [notifStream, setNotifStream] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);
  const [notifVault, setNotifVault] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <ScreenHeader title="Settings" />

        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(250,204,21,0.1)" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={c.accent} />
              </View>
              <View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSub}>Currently {isDark ? "dark" : "light"}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={setIsDark}
              trackColor={{ false: c.border, true: "rgba(250,204,21,0.3)" }}
              thumbColor={isDark ? c.accent : c.textSubtle}
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          {[
            { label: "Stream paid out",    sub: "When your stream pays out",     value: notifPayout, set: setNotifPayout, last: false },
            { label: "New stream created", sub: "Employer created a stream",     value: notifStream, set: setNotifStream, last: false },
            { label: "Low vault balance",  sub: "Employer treasury is low",      value: notifVault,  set: setNotifVault,  last: true  },
          ].map(({ label, sub, value, set, last }) => (
            <View key={label} style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: "rgba(250,204,21,0.08)" }]}>
                  <Ionicons name="notifications-outline" size={18} color={c.accent} />
                </View>
                <View>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowSub}>{sub}</Text>
                </View>
              </View>
              <Switch
                value={value}
                onValueChange={set}
                trackColor={{ false: c.border, true: "rgba(250,204,21,0.3)" }}
                thumbColor={value ? c.accent : c.textSubtle}
              />
            </View>
          ))}
        </View>

        {/* Network */}
        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(34,197,94,0.1)" }]}>
                <Ionicons name="globe-outline" size={18} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Quipay Network</Text>
                <Text style={styles.rowSub}>Active network</Text>
              </View>
            </View>
            <View style={styles.networkBadge}>
              <Text style={styles.networkBadgeText}>TESTNET</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          {[
            { label: "Version",  value: "1.0.0",          last: false },
            { label: "Protocol", value: "Quipay Protocol", last: false },
            { label: "License",  value: "MIT",             last: true  },
          ].map(({ label, value, last }) => (
            <View key={label} style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Account */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: "rgba(245,194,73,0.1)" }]}>
                    <Ionicons name="person-outline" size={18} color={c.accent} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{user.name ?? user.email ?? "Worker"}</Text>
                    <Text style={styles.rowSub}>{shortenAddress(user.stellarAddress, 6)}</Text>
                  </View>
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, paddingHorizontal: 20 },
  sectionTitle:     { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  card:             { backgroundColor: c.card, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  row:              { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  rowLeft:          { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox:          { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel:         { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: c.text },
  rowSub:           { fontFamily: "Urbanist_400Regular", fontSize: 12, color: c.textMuted, marginTop: 1 },
  rowValue:         { fontFamily: "Urbanist_500Medium", fontSize: 13, color: c.textMuted },
  networkBadge:     { backgroundColor: "rgba(34,197,94,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  networkBadgeText: { fontFamily: "Urbanist_700Bold", fontSize: 10, color: "#22c55e", letterSpacing: 0.5 },
  rowLeft:          { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox:          { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
