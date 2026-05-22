import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LogoIcon } from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";

export default function SplashScreen() {
  const { ready, authenticated } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        router.replace(authenticated ? "/(tabs)" : "/(auth)");
      });
    }, 1400);
    return () => clearTimeout(t);
  }, [ready, authenticated]);

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
