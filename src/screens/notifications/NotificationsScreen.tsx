import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeGradient } from "../../components/ui/SafeGradient";
import { EmptyState } from "../../components/ui/EmptyState";
import { YellowGradient, ThemeColors } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications, NotificationType, AppNotification } from "../../hooks/useWorkerData";
import { timeAgo } from "../../utils/format";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  payout: "arrow-down-circle",
  stream: "flash",
  vault:  "warning",
};

// Money news reads like account activity, so the feed is grouped by day.
type Section = { label: string; items: AppNotification[] };

function groupByDay(items: AppNotification[]): Section[] {
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today     = dayStart(new Date());
  const yesterday = today - 86_400_000;

  const buckets: Record<string, AppNotification[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of items) {
    const t = dayStart(new Date(n.createdAt));
    const key = t >= today ? "Today" : t >= yesterday ? "Yesterday" : "Earlier";
    buckets[key].push(n);
  }
  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, items: list }));
}

export default function NotificationsScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const sections = useMemo(() => groupByDay(notifications), [notifications]);

  return (
    <View style={styles.root}>
      <SafeGradient colors={YellowGradient.colors} start={YellowGradient.start} end={YellowGradient.end}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          {/* Single-row header: back · centered title+status · action. The title
              block is absolutely positioned so it stays dead-center regardless
              of how wide the side buttons are. */}
          <View style={styles.headerRow}>
            <View style={styles.titleBlock} pointerEvents="none">
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.sub}>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} hitSlop={8}>
                <Ionicons name="checkmark-done" size={14} color="#F5C249" />
                <Text style={styles.markAllText}>Mark all</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </SafeGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>
        {loading ? (
          <ActivityIndicator color={c.accentText} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            subtitle="Payouts, new streams and alerts will show up here."
          />
        ) : (
          sections.map(section => (
            <View key={section.label} style={styles.section}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <View style={styles.group}>
                {section.items.map((n, i) => {
                  // Vault alerts are warnings, not income — they get the error
                  // tint so "money arrived" and "act on this" never look alike.
                  const isAlert   = n.type === "vault";
                  const iconTint  = !n.read ? (isAlert ? c.error : c.accentText) : c.textSubtle;
                  const iconBg    = !n.read
                    ? (isAlert ? "rgba(239,68,68,0.12)" : c.accentMuted)
                    : c.surface;
                  return (
                    <TouchableOpacity
                      key={n.id}
                      activeOpacity={0.7}
                      onPress={() => markRead(n.id)}
                      style={[styles.row, i < section.items.length - 1 && styles.rowDivider]}
                    >
                      {/* Gold edge-rail: the unread marker. Read rows drop it and recede. */}
                      {!n.read && <View style={[styles.rail, isAlert && { backgroundColor: c.error }]} />}
                      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
                        <Ionicons name={TYPE_ICON[n.type]} size={18} color={iconTint} />
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
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#F5C249" },
  // Compact, content-sized header — this is a feed, not a dashboard hero.
  // Bottom padding covers the card's -20 overlap so the subtitle never clips.
  headerInner:  { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 38 },
  headerRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  titleBlock:   { position: "absolute", left: 0, right: 0, alignItems: "center" },
  iconBtn:      { width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  markAllBtn:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#000" },
  markAllText:  { fontFamily: "Urbanist_700Bold", fontSize: 12, color: "#F5C249" },
  title:        { fontFamily: "Urbanist_900Black", fontSize: 22, color: "#000", letterSpacing: -0.5 },
  sub:          { fontFamily: "Urbanist_500Medium", fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 1 },

  card:         { flex: 1, backgroundColor: c.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  cardContent:  { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  section:      { marginBottom: 20 },
  sectionLabel: { fontFamily: "Urbanist_600SemiBold", fontSize: 12, color: c.textSubtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  group:        { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },

  row:          { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowDivider:   { borderBottomWidth: 1, borderBottomColor: c.border },
  rail:         { position: "absolute", left: 0, top: 10, bottom: 10, width: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2, backgroundColor: c.accentText },
  rowIcon:      { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rowTitle:     { fontFamily: "Urbanist_600SemiBold", fontSize: 15, color: c.textMuted, flex: 1 },
  rowTitleUnread:{ fontFamily: "Urbanist_700Bold", color: c.text },
  rowTime:      { fontFamily: "Urbanist_500Medium", fontSize: 12, color: c.textSubtle },
  rowBody:      { fontFamily: "Urbanist_400Regular", fontSize: 13, color: c.textMuted, marginTop: 2, lineHeight: 18 },
});
