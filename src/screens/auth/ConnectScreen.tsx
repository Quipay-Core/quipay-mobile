import { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LogoIcon } from "../../components/ui/Logo";
import { YellowGradient } from "../../constants/theme";
import { loginWithEmail, loginWithGoogle, loginWithApple } from "../../services/web3auth";
import { useAuth } from "../../context/AuthContext";

const { height } = Dimensions.get("window");
const YELLOW = "#F5C249";
const CARD   = "#111111";
const BORDER = "#1a1a1a";

export default function ConnectScreen() {
  const { refreshAuth } = useAuth();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleEmail() {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    try {
      setLoading("email");
      await loginWithEmail(email.trim().toLowerCase());
      refreshAuth();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    try {
      setLoading("google");
      await loginWithGoogle();
      refreshAuth();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleApple() {
    try {
      setLoading("apple");
      await loginWithApple();
      refreshAuth();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Yellow gradient top panel */}
      <LinearGradient
        colors={YellowGradient.colors}
        start={YellowGradient.start}
        end={YellowGradient.end}
        style={styles.yellowPanel}
      >
        <SafeAreaView edges={["top"]} style={styles.panelInner}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#000" />
            </TouchableOpacity>
            <LogoIcon size={32} variant="black" />
          </View>
          <View style={styles.headlineWrap}>
            <Text style={styles.heading}>Sign in to{"\n"}Quipay</Text>
            <Text style={styles.sub}>Your wallet is created automatically. No seed phrase needed.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Black bottom */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email input */}
        <View style={styles.emailSection}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.emailRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="you@example.com"
              placeholderTextColor="#525252"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.emailBtn, loading === "email" && styles.btnLoading]}
            onPress={handleEmail}
            disabled={!!loading}
            activeOpacity={0.85}
          >
            {loading === "email"
              ? <ActivityIndicator color="#000" size="small" />
              : <>
                  <Text style={styles.emailBtnText}>Continue with Email</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </>
            }
          </TouchableOpacity>
          <Text style={styles.magicLinkNote}>We'll send a magic link — no password needed</Text>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, loading === "google" && styles.btnLoading]}
            onPress={handleGoogle}
            disabled={!!loading}
            activeOpacity={0.75}
          >
            {loading === "google"
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="logo-google" size={20} color="#fff" />
                  <Text style={styles.socialBtnText}>Google</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, loading === "apple" && styles.btnLoading]}
            onPress={handleApple}
            disabled={!!loading}
            activeOpacity={0.75}
          >
            {loading === "apple"
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace("/(tabs)")}
          disabled={!!loading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing you agree to Quipay's Terms of Service. Your wallet is non-custodial — only you control your keys.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#000" },

  yellowPanel:   { height: height * 0.38, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  panelInner:    { flex: 1, paddingHorizontal: 24, paddingBottom: 32, justifyContent: "space-between" },
  topRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  headlineWrap:  { gap: 8 },
  heading:       { fontFamily: "Urbanist_900Black", fontSize: 36, color: "#000", letterSpacing: -1.2, lineHeight: 42 },
  sub:           { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 20 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 },

  emailSection:  { marginBottom: 24 },
  fieldLabel:    { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: "#d4d4d4", marginBottom: 8 },
  emailRow:      { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 10 },
  emailInput:    { fontFamily: "Urbanist_500Medium", fontSize: 15, color: "#fff", paddingHorizontal: 16, paddingVertical: 14 },
  emailBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: YELLOW, borderRadius: 14, paddingVertical: 16 },
  emailBtnText:  { fontFamily: "Urbanist_700Bold", fontSize: 15, color: "#000" },
  magicLinkNote: { fontFamily: "Urbanist_400Regular", fontSize: 12, color: "#525252", textAlign: "center", marginTop: 8 },

  btnLoading:    { opacity: 0.6 },

  dividerRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText:   { fontFamily: "Urbanist_500Medium", fontSize: 12, color: "#525252" },

  socialRow:     { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: CARD, borderRadius: 14, paddingVertical: 15, borderWidth: 1, borderColor: BORDER },
  socialBtnText: { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: "#fff" },

  skipBtn:       { alignItems: "center", paddingVertical: 14, marginBottom: 16 },
  skipText:      { fontFamily: "Urbanist_500Medium", fontSize: 14, color: "#525252" },

  disclaimer:    { fontFamily: "Urbanist_400Regular", fontSize: 11, color: "#404040", textAlign: "center", lineHeight: 17 },
});
