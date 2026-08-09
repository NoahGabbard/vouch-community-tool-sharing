import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const statusColors: Record<string, string> = {
  available: "#34C759",
  pending: "#FF9500",
  "in-use": "#FF5F15",
  maintenance: "#8E8E93",
};

const statusLabel: Record<string, string> = {
  available: "Available",
  pending: "Pending",
  "in-use": "In Use",
  maintenance: "Maintenance",
};

export default function GarageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, rentals, currentUser } = useApp();

  const myItems = items.filter((i) => i.ownerId === currentUser.id);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  // Earnings calculations
  const lendingRentals = rentals.filter((r) => r.lenderId === currentUser.id);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEarnings = lendingRentals
    .filter((r) => r.status === "completed" && new Date(r.createdAt) >= thisMonthStart)
    .reduce((sum, r) => sum + r.totalPrice, 0);
  const allTimeEarnings = lendingRentals
    .filter((r) => r.status === "completed" || r.status === "active")
    .reduce((sum, r) => sum + r.totalPrice, 0);
  const activeCount = lendingRentals.filter(
    (r) => r.status === "active" || r.status === "confirmed"
  ).length;
  const totalBorrows = lendingRentals.filter(
    (r) => r.status === "completed" || r.status === "active"
  ).length;

  const hasContent = myItems.length > 0 || allTimeEarnings > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>My Garage</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {myItems.length} {myItems.length === 1 ? "tool" : "tools"} listed
          </Text>
        </View>
        {activeCount > 0 && (
          <View style={[styles.activeBadge, { backgroundColor: colors.orange + "20", borderColor: colors.orange + "50" }]}>
            <View style={[styles.activeDot, { backgroundColor: colors.orange }]} />
            <Text style={[styles.activeBadgeText, { color: colors.orange }]}>
              {activeCount} out
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings strip */}
        {hasContent && (
          <View style={[styles.earningsStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.earningsStat}>
              <Text style={[styles.earningsValue, { color: colors.orange }]}>
                ${thisMonthEarnings}
              </Text>
              <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                This Month
              </Text>
            </View>
            <View style={[styles.earningsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.earningsStat}>
              <Text style={[styles.earningsValue, { color: colors.foreground }]}>
                ${allTimeEarnings}
              </Text>
              <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                All Time
              </Text>
            </View>
            <View style={[styles.earningsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.earningsStat}>
              <Text style={[styles.earningsValue, { color: colors.foreground }]}>
                {totalBorrows}
              </Text>
              <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                Borrows
              </Text>
            </View>
          </View>
        )}

        {/* List a Tool CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.orange, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/list-item");
          }}
        >
          <Feather name="plus" size={22} color={colors.white} />
          <Text style={[styles.addBtnText, { color: colors.white }]}>List a Tool</Text>
        </Pressable>

        {/* Empty state */}
        {myItems.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
              <Feather name="tool" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Your garage is empty
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Start lending your tools to neighbors and earn extra income.
            </Text>
          </View>
        ) : (
          <View style={styles.items}>
            {myItems.map((item) => {
              const activeRental = lendingRentals.find(
                (r) => r.itemId === item.id && (r.status === "active" || r.status === "confirmed")
              );
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.itemRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: activeRental ? colors.orange + "60" : colors.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                  onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
                >
                  <View style={[styles.itemThumb, { backgroundColor: colors.muted }]}>
                    {item.photos[0] ? (
                      <Image
                        source={{ uri: item.photos[0] }}
                        style={styles.itemPhoto}
                        resizeMode="cover"
                      />
                    ) : (
                      <Feather name="tool" size={22} color={colors.orange} />
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemPrice, { color: colors.mutedForeground }]}>
                        ${item.dailyPrice}/day
                      </Text>
                      {item.reviewCount > 0 && (
                        <>
                          <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
                          <Feather name="star" size={11} color={colors.orange} />
                          <Text style={[styles.itemRating, { color: colors.mutedForeground }]}>
                            {item.rating.toFixed(1)}
                          </Text>
                        </>
                      )}
                    </View>
                    {activeRental && (
                      <Text style={[styles.outUntil, { color: colors.orange }]}>
                        Out until{" "}
                        {new Date(activeRental.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                  </View>

                  <View style={styles.itemRight}>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: (statusColors[item.status] || "#8E8E93") + "22" },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusColors[item.status] || "#8E8E93" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColors[item.status] || "#8E8E93" },
                        ]}
                      >
                        {statusLabel[item.status]}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginTop: 6 }} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: 4,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  activeBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 14,
  },
  earningsStrip: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  earningsStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  earningsValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  earningsLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  earningsDivider: {
    width: 1,
    marginVertical: 14,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 18,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    alignItems: "center",
    paddingTop: 30,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  items: { gap: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  itemPhoto: {
    width: 56,
    height: 56,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    fontSize: 13,
  },
  itemRating: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  outUntil: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  itemRight: { alignItems: "flex-end" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
