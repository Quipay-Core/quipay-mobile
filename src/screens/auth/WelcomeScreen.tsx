import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LogoWordmark } from "../../components/ui/Logo";
import { YellowGradient } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { authenticated } = useAuth();

  // If Privy restores session after splash already navigated here, redirect to tabs
  useEffect(() => {
    if (authenticated) router.replace("/(tabs)");
  }, [authenticated]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Yellow gradient hero panel */}
      <SafeGradient
        colors={YellowGradient.colors}
        start={YellowGradient.start}
        end={YellowGradient.end}
        style={styles.yellowPanel}
      >
        <SafeAreaView edges={["top"]} style={styles.panelInner}>
          <LogoWordmark size={28} variant="black" />

          <View style={styles.headlineWrap}>
            <Text style={styles.headline}>Your salary,</Text>
            <Text style={styles.headline}>streaming</Text>
            <Text style={styles.headlineSub}>in real time.</Text>
          </View>

          <Text style={styles.body}>
            Receive payments from your employer directly to your wallet — no bank, no delays.
          </Text>
        </SafeAreaView>
      </SafeGradient>

      {/* Black bottom */}
      <View style={styles.bottomSection}>

        <View style={styles.manifesto}>
          <View style={styles.manifestoRow}>
            <View style={styles.tick} />
            <Text style={styles.manifestoText}>Get paid as you work, second by second</Text>
          </View>
          <View style={styles.manifestoRow}>
            <View style={styles.tick} />
            <Text style={styles.manifestoText}>Withdraw to your wallet, anytime</Text>
          </View>
          <View style={styles.manifestoRow}>
            <View style={styles.tick} />
            <Text style={styles.manifestoText}>Your keys, your money — always</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/(auth)/connect")}
          activeOpacity={0.85}
        >
          <SafeGradient
            colors={YellowGradient.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtnGradient}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </SafeGradient>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: "#000" },

  yellowPanel:       { height: height * 0.6, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  panelInner:        { flex: 1, paddingHorizontal: 28, paddingBottom: 36, justifyContent: "space-between" },

  headlineWrap:      { gap: 0 },
  headline:          { fontFamily: "Urbanist_900Black", fontSize: width > 390 ? 52 : 44, color: "#000", lineHeight: width > 390 ? 56 : 48, letterSpacing: -1.5 },
  headlineSub:       { fontFamily: "Urbanist_400Regular", fontSize: width > 390 ? 28 : 24, color: "rgba(0,0,0,0.45)", marginTop: 4 },
  body:              { fontFamily: "Urbanist_500Medium", fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 22 },

  bottomSection:     { flex: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 32, justifyContent: "space-between" },

  manifesto:         { gap: 16 },
  manifestoRow:      { flexDirection: "row", alignItems: "center", gap: 14 },
  tick:              { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5C249" },
  manifestoText:     { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: "#d4d4d4", lineHeight: 20 },

  primaryBtn:        { borderRadius: 16, overflow: "hidden" },
  primaryBtnGradient:{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  primaryBtnText:    { fontFamily: "Urbanist_800ExtraBold", fontSize: 17, color: "#000", letterSpacing: 0.2 },
});
