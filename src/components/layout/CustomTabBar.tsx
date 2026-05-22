import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ACCENT   = "#F5C249";
const BAR_BG   = "#111111";
const INACTIVE = "#525252";

const TABS = [
  { icon: "home-outline"     as const, iconA: "home"      as const, label: "Earnings" },
  { icon: "flash-outline"    as const, iconA: "flash"      as const, label: "Streams"  },
  { icon: "arrow-up-outline" as const, iconA: "arrow-up"  as const, label: "Withdraw" },
  { icon: "settings-outline" as const, iconA: "settings"  as const, label: "Settings" },
];

export function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab, i) => {
        const route     = state.routes[i];
        if (!route) return null;
        const isFocused = state.index === i;

        function onPress() {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        return (
          <TouchableOpacity key={i} onPress={onPress} activeOpacity={0.75} style={styles.tabSlot}>
            {isFocused ? (
              <View style={styles.pill}>
                <Ionicons name={tab.iconA} size={17} color="#000" />
                <Text style={styles.pillLabel}>{tab.label}</Text>
              </View>
            ) : (
              <Ionicons name={tab.icon} size={22} color={INACTIVE} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar:       { flexDirection: "row", backgroundColor: BAR_BG, paddingTop: 8, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: "#1a1a1a" },
  tabSlot:   { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 2, minHeight: 44 },
  pill:      { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  pillLabel: { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "#000", letterSpacing: -0.2 },
});
