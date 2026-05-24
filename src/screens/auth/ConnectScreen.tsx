import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, TextInput, Alert,
  StyleSheet, Dimensions, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoginWithEmail, useLoginWithOAuth } from "@privy-io/expo";
import { LogoIcon } from "../../components/ui/Logo";
import { YellowGradient } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

const { height } = Dimensions.get("window");
const CARD   = "#111111";
const BORDER = "#1a1a1a";
const ACCENT = "#F5C249";

export default function ConnectScreen() {
  const { authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) router.replace("/(tabs)");
  }, [authenticated]);

  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail({
    onLoginSuccess() { router.replace("/(tabs)"); },
  });
  const { login: oauthLogin, state: oauthState } = useLoginWithOAuth({
    onLoginSuccess() { router.replace("/(tabs)"); },
  });

  const [email,    setEmail]    = useState("");
  const [code,     setCode]     = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Only "sending-code" and "submitting-code" are actual loading states.
  // "awaiting-code-input" means the code was sent successfully — NOT loading.
  const isSendingCode  = emailState.status === "sending-code";
  const isSubmitting   = emailState.status === "submitting-code";
  const isOAuthLoading = oauthState.status === "loading";

  async function handleSendCode() {
    if (!email.trim()) return;
    try {
      await sendCode({ email: email.trim().toLowerCase() });
      setCodeSent(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to send code. Please try again.");
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) return;
    try {
      await loginWithCode({ code: code.trim(), email: email.trim().toLowerCase() });
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      Alert.alert(
        "Invalid code",
        msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired")
          ? "The code is invalid or has expired. Tap OK to request a new one."
          : "Verification failed. Please try again.",
        [{ text: "OK", onPress: () => { setCode(""); setCodeSent(false); } }]
      );
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    try {
      await oauthLogin({ provider });
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.includes("Already logged in")) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login failed", msg || "Something went wrong.");
      }
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
            <Text style={styles.sub}>
              {codeSent
                ? `Enter the code sent to ${email}`
                : "No seed phrase. No wallet needed. Just sign in."}
            </Text>
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
        {!codeSent ? (
          <>
            {/* Email input */}
            <Text style={styles.fieldLabel}>Email address</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
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
              style={[styles.primaryBtn, (!email || isSendingCode) && styles.btnDisabled]}
              onPress={handleSendCode}
              disabled={!email || isSendingCode}
              activeOpacity={0.85}
            >
              {isSendingCode
                ? <ActivityIndicator color="#000" size="small" />
                : <>
                    <Text style={styles.primaryBtnText}>Continue with Email</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" />
                  </>
              }
            </TouchableOpacity>

            <Text style={styles.hint}>We'll send a one-time code — no password needed</Text>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialBtn, isOAuthLoading && styles.btnDisabled]}
                onPress={() => handleOAuth("google")}
                disabled={isOAuthLoading}
                activeOpacity={0.75}
              >
                {oauthState.status === "loading"
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="logo-google" size={20} color="#fff" />
                      <Text style={styles.socialBtnText}>Google</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, isOAuthLoading && styles.btnDisabled]}
                onPress={() => handleOAuth("apple")}
                disabled={isOAuthLoading}
                activeOpacity={0.75}
              >
                {oauthState.status === "loading"
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="logo-apple" size={20} color="#fff" />
                      <Text style={styles.socialBtnText}>Apple</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* OTP input */}
            <Text style={styles.fieldLabel}>Verification code</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#525252"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, (!code || isSubmitting) && styles.btnDisabled]}
              onPress={handleVerifyCode}
              disabled={!code || isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={styles.primaryBtnText}>Verify Code</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToEmail} onPress={() => { setCodeSent(false); setCode(""); }}>
              <Text style={styles.backToEmailText}>← Change email</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.disclaimer}>
          By continuing you agree to Quipay's Terms. Your identity is managed by Privy — non-custodial and private.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: "#000" },
  yellowPanel:    { height: height * 0.38, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  panelInner:     { flex: 1, paddingHorizontal: 24, paddingBottom: 32, justifyContent: "space-between" },
  topRow:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:        { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  headlineWrap:   { gap: 8 },
  heading:        { fontFamily: "Urbanist_900Black", fontSize: 36, color: "#000", letterSpacing: -1.2, lineHeight: 42 },
  sub:            { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 19 },
  scroll:         { flex: 1 },
  scrollContent:  { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 },
  fieldLabel:     { fontFamily: "Urbanist_600SemiBold", fontSize: 13, color: "#d4d4d4", marginBottom: 8 },
  inputWrap:      { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 12 },
  input:          { fontFamily: "Urbanist_500Medium", fontSize: 15, color: "#fff", paddingHorizontal: 16, paddingVertical: 14 },
  otpInput:       { fontSize: 24, letterSpacing: 8, textAlign: "center" },
  primaryBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, marginBottom: 10 },
  btnDisabled:    { opacity: 0.5 },
  primaryBtnText: { fontFamily: "Urbanist_700Bold", fontSize: 15, color: "#000" },
  hint:           { fontFamily: "Urbanist_400Regular", fontSize: 12, color: "#525252", textAlign: "center", marginBottom: 24 },
  dividerRow:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText:    { fontFamily: "Urbanist_500Medium", fontSize: 12, color: "#525252" },
  socialRow:      { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: CARD, borderRadius: 14, paddingVertical: 15, borderWidth: 1, borderColor: BORDER },
  socialBtnText:  { fontFamily: "Urbanist_600SemiBold", fontSize: 14, color: "#fff" },
  backToEmail:    { alignItems: "center", paddingVertical: 14, marginBottom: 8 },
  backToEmailText:{ fontFamily: "Urbanist_500Medium", fontSize: 14, color: ACCENT },
  disclaimer:     { fontFamily: "Urbanist_400Regular", fontSize: 11, color: "#404040", textAlign: "center", lineHeight: 17 },
});
