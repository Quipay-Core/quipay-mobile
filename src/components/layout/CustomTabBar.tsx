import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

const ACCENT   = "#F5C249";
const BAR_BG   = "#111111";
const INACTIVE = "#525252";

const TABS = [
  { icon: "home",            label: "Earnings", solid: true },
  { icon: "chart-line",      label: "Streams",  solid: true },
  { icon: "arrow-circle-up", label: "Withdraw", solid: true },
  { icon: "sliders-h",       label: "Settings", solid: true },
] as const;

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
                <FontAwesome5 name={tab.icon} size={15} color="#000" solid={tab.solid} />
                <Text style={styles.pillLabel}>{tab.label}</Text>
              </View>
            ) : (
              <FontAwesome5 name={tab.icon} size={20} color={INACTIVE} solid={false} />
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
  pill:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  pillLabel: { fontFamily: "Urbanist_700Bold", fontSize: 13, color: "#000", letterSpacing: -0.2 },
});
