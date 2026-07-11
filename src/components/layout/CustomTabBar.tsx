import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useTheme } from "../../context/ThemeContext";

// iOS secondaryLabel equivalents — the light value on light surfaces, a
// brighter one on dark so inactive tabs stay legible on the dark glass.
const inactiveColor = (isDark: boolean) =>
  isDark ? "rgba(235,235,245,0.6)" : "#8e8e93";

// Guarded so a missing native module (older binary, Android, Expo Go) falls
// back to the translucent bar instead of throwing.
function liquidGlassAvailable(): boolean {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

// Outline when inactive, filled when active — the standard iOS tab-bar pattern.
const TABS = [
  { icon: "home-outline",            iconActive: "home",            label: "Earnings" },
  { icon: "flash-outline",           iconActive: "flash",           label: "Streams"  },
  { icon: "arrow-up-circle-outline", iconActive: "arrow-up-circle", label: "Withdraw" },
  { icon: "settings-outline",        iconActive: "settings",        label: "Settings" },
] as const;

export function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const accent = colors.accentText;

  // Real iOS 26 Liquid Glass when the OS supports it; graceful translucent
  // fallback everywhere else (older iOS, Android).
  const useGlass = liquidGlassAvailable();
  const styles = useMemo(() => makeStyles(isDark, accent), [isDark, accent]);

  const tabs = TABS.map((tab, i) => {
    const route = state.routes[i];
    if (!route) return null;
    const isFocused = state.index === i;

    function onPress() {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    }

    return (
      <TouchableOpacity key={i} onPress={onPress} activeOpacity={0.7} style={styles.tabSlot}>
        <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
          <Ionicons
            name={isFocused ? tab.iconActive : tab.icon}
            size={22}
            color={isFocused ? accent : inactiveColor(isDark)}
          />
          <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {useGlass ? (
        // colorScheme pins the glass material to the app theme — by default it
        // follows the SYSTEM appearance, which made the bar render light while
        // the app was in dark mode.
        <GlassView
          glassEffectStyle="regular"
          colorScheme={isDark ? "dark" : "light"}
          style={styles.barGlass}
        >
          {tabs}
        </GlassView>
      ) : (
        <View style={styles.bar}>{tabs}</View>
      )}
    </View>
  );
}

const makeStyles = (isDark: boolean, accent: string) => {
  const barBg     = isDark ? "rgba(28,28,30,0.82)"    : "rgba(255,255,255,0.92)";
  const barBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const activeBg  = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

  const shadow = Platform.select({
    ios: {
      shadowColor:   "#000",
      shadowOffset:  { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius:  20,
    },
    android: { elevation: 16 },
  });

  const pill = {
    flexDirection:     "row" as const,
    alignItems:        "center" as const,
    borderRadius:      40,
    paddingVertical:   6,
    paddingHorizontal: 6,
  };

  return StyleSheet.create({
    wrapper: {
      position:          "absolute",
      bottom:            0,
      left:              0,
      right:             0,
      backgroundColor:   "transparent",
      paddingHorizontal: 20,
    },
    // Translucent fallback (older iOS / Android): fake glass via a tinted surface.
    bar: {
      ...pill,
      backgroundColor: barBg,
      borderWidth:     1,
      borderColor:     barBorder,
      ...shadow,
    },
    // Real iOS 26 Liquid Glass: the material supplies the surface, so no fill —
    // just the rounded shape and a soft drop shadow to keep it floating.
    barGlass: {
      ...pill,
      ...shadow,
    },
    tabSlot: {
      flex:           1,
      alignItems:     "center",
      justifyContent: "center",
    },
    tabInner: {
      alignItems:        "center",
      justifyContent:    "center",
      gap:               4,
      paddingVertical:   8,
      paddingHorizontal: 10,
      borderRadius:      28,
    },
    tabInnerActive: {
      backgroundColor: activeBg,
    },
    label: {
      fontFamily:    "Urbanist_500Medium",
      fontSize:      12,
      color:         inactiveColor(isDark),
      letterSpacing: 0.1,
    },
    labelActive: {
      fontFamily: "Urbanist_600SemiBold",
      color:      accent,
    },
  });
};
