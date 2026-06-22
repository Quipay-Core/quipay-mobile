import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

const ACCENT    = "#F5C249";
const BAR_BG    = "rgba(28,28,30,0.82)";
const ACTIVE_BG = "rgba(255,255,255,0.1)";
const INACTIVE  = "#8e8e93";

const TABS = [
  { icon: "home",            label: "Earnings", solid: true },
  { icon: "chart-line",      label: "Streams",  solid: true },
  { icon: "arrow-circle-up", label: "Withdraw", solid: true },
  { icon: "sliders-h",       label: "Settings", solid: true },
] as const;

export function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {TABS.map((tab, i) => {
          const route     = state.routes[i];
          if (!route) return null;
          const isFocused = state.index === i;

          function onPress() {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          }

          return (
            <TouchableOpacity
              key={i}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabSlot}
            >
              <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
                <FontAwesome5
                  name={tab.icon}
                  size={17}
                  color={isFocused ? ACCENT : INACTIVE}
                  solid={isFocused}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position:          "absolute",
    bottom:            0,
    left:              0,
    right:             0,
    backgroundColor:   "transparent",
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection:     "row",
    alignItems:        "center",
    backgroundColor:   BAR_BG,
    borderRadius:      40,
    paddingVertical:   6,
    paddingHorizontal: 6,
    borderWidth:       1,
    borderColor:       "rgba(255,255,255,0.12)",
    ...Platform.select({
      ios: {
        shadowColor:   "#000",
        shadowOffset:  { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius:  20,
      },
      android: { elevation: 16 },
    }),
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
    backgroundColor: ACTIVE_BG,
  },
  label: {
    fontFamily:    "Urbanist_500Medium",
    fontSize:      11,
    color:         INACTIVE,
    letterSpacing: 0.1,
  },
  labelActive: {
    fontFamily: "Urbanist_600SemiBold",
    color:      ACCENT,
  },
});
