import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Platform } from "react-native";
import { Colors } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

const c = Colors.dark;

export default function TabsLayout() {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/(auth)");
    }
  }, [ready, user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 84 : 64,
        },
        tabBarActiveTintColor:   c.accent,
        tabBarInactiveTintColor: c.textSubtle,
        tabBarLabelStyle: {
          fontFamily: "Urbanist_600SemiBold",
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="streams"
        options={{
          title: "Streams",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="withdraw"
        options={{
          title: "Withdraw",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="arrow-up-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
