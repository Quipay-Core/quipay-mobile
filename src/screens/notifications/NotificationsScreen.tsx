import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications, NotificationType } from "../../hooks/useWorkerData";
import { timeAgo } from "../../utils/format";

const { height: SH } = Dimensions.get("window");

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  payout: "arrow-down-circle",
  stream: "flash",
  vault:  "warning",
};

export default function NotificationsScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} hitSlop={8}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.sub}>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</Text>
          </View>
        </SafeAreaView>
      </SafeGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>
        {loading ? (
          <ActivityIndicator color={c.accentText} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={28} color={c.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>Payouts, new streams and alerts will show up here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((n, i) => (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.7}
                onPress={() => markRead(n.id)}
                style={[styles.row, i < notifications.length - 1 && styles.rowDivider]}
              >
                <View style={[styles.rowIcon, !n.read && styles.rowIconUnread]}>
                  <Ionicons name={TYPE_ICON[n.type]} size={18} color={c.accentText} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowTitle, !n.read && styles.rowTitleUnread]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.rowTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                  <Text style={styles.rowBody} numberOfLines={2}>{n.body}</Text>
                </View>
                {!n.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#F5C249" },
  header:       { minHeight: SH * 0.20 },
  headerInner:  { paddingHorizontal: 20, paddingBottom: 20, justifyContent: "space-between", gap: 12, flex: 1 },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  iconBtn:      { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  markAllBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.1)" },
  markAllText:  { fontFamily: "Urbanist_700Bold", fontSize: 12, color: "#000" },
  title:        { fontFamily: "Urbanist_900Black", fontSize: 32, color: "#000", letterSpacing: -1 },
  sub:          { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 2 },

  card:         { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:  { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  list:         { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  row:          { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowDivider:   { borderBottomWidth: 1, borderBottomColor: c.border },
  rowIcon:      { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  rowIconUnread:{ backgroundColor: c.accentMuted },
  rowTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rowTitle:     { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: c.textMuted, flex: 1 },
  rowTitleUnread:{ color: c.text },
  rowTime:      { fontFamily: "Urbanist_500Medium", fontSize: 12, color: c.textSubtle },
  rowBody:      { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 2, lineHeight: 18 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: c.accentText },

  empty:        { alignItems: "center", paddingTop: 56 },
  emptyIcon:    { width: 56, height: 56, borderRadius: 16, backgroundColor: c.card, alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: c.border },
  emptyTitle:   { fontFamily: "Urbanist_700Bold", fontSize: 16, color: c.text, marginBottom: 6 },
  emptySub:     { fontFamily: "Urbanist_400Regular", fontSize: 14, color: c.textMuted, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
});
