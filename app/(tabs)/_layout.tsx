import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { CustomTabBar } from "../../src/components/layout/CustomTabBar";

export default function TabsLayout() {
  const { authenticated, ready } = useAuth();

  useEffect(() => {
    if (ready && !authenticated) router.replace("/(auth)");
  }, [ready, authenticated]);

  return (
    <>
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"    />
        <Tabs.Screen name="streams"  />
        <Tabs.Screen name="withdraw" />
        <Tabs.Screen name="settings" />
        {/* history hidden but file still exists */}
        <Tabs.Screen name="history" options={{ href: null }} />
      </Tabs>
    </>
  );
}
