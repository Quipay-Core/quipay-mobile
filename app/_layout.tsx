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
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

const PRIVY_APP_ID    = process.env.EXPO_PUBLIC_PRIVY_APP_ID    ?? "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? "";

// Consumes the theme so the navigator background follows light/dark and avoids
// a black flash behind screens in light mode.
function ThemedNavigator() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index"  options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }} />
    </Stack>
  );
}

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
        {/* Dark icons — every top-level screen sits under a yellow header. */}
        <StatusBar style="dark" />
        <ThemeProvider>
          <PrivyProvider
            appId={PRIVY_APP_ID}
            clientId={PRIVY_CLIENT_ID}
            config={{
              embedded: {
                // Auto-provision an embedded EVM wallet on login (serves Arc/Base USDC).
                // Stellar isn't a first-class embedded type — it's created imperatively
                // in AuthContext via useCreateWallet({ chainType: "stellar" }).
                ethereum: { createOnLogin: "users-without-wallets" },
              },
            }}
          >
            <AuthProvider>
              <ErrorBoundary>
                <ThemedNavigator />
              </ErrorBoundary>
            </AuthProvider>
          </PrivyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
