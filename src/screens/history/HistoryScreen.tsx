import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/ui/EmptyState";
import { Colors } from "../../constants/theme";

const c = Colors.dark;

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.heading}>History</Text>
        <Text style={styles.sub}>Your past payouts and transactions</Text>
        <EmptyState
          icon="receipt-outline"
          title="No transactions yet"
          subtitle="All your payouts and withdrawals will appear here"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  heading:   { fontFamily: "Urbanist_800ExtraBold", fontSize: 24, color: c.text, letterSpacing: -0.5, paddingTop: 16, marginBottom: 4 },
  sub:       { fontFamily: "Urbanist_400Regular", fontSize: 19, color: c.textMuted, marginBottom: 24 },
});
