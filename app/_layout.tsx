import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  Urbanist_900Black,
} from "@expo-google-fonts/urbanist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PrivyProvider } from "@privy-io/expo";
import { AuthProvider } from "../src/context/AuthContext";

const PRIVY_APP_ID    = process.env.EXPO_PUBLIC_PRIVY_APP_ID    ?? "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? "";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PrivyProvider
          appId={PRIVY_APP_ID}
          clientId={PRIVY_CLIENT_ID}
          config={{
            embeddedWallets: {
              ethereum: { createOnLogin: "off" },
            },
          }}
        >
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#000000" },
                animation: "fade",
              }}
            >
              <Stack.Screen name="index"  options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </PrivyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
