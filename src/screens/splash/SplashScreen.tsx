import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LogoIcon } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";

export default function SplashScreen() {
  const { authenticated, ready } = useAuth();
  const opacity   = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.85)).current;
  const navigated = useRef(false);

  function goNext() {
    if (navigated.current) return;
    navigated.current = true;
    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      router.replace(authenticated ? "/(tabs)" : "/(auth)");
    });
  }

  // Fade + scale logo in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
  }, []);

  // Navigate as soon as Privy is ready
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(goNext, 900);
    return () => clearTimeout(t);
  }, [ready]);

  // Hard fallback — always escape splash after 4 seconds regardless of Privy state
  useEffect(() => {
    const t = setTimeout(goNext, 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <LogoIcon size={48} variant="gradient" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" },
});
