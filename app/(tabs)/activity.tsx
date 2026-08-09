import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const rentalStatusColor: Record<string, string> = {
  pending: "#FF9500",
  confirmed: "#0A84FF",
  active: "#FF5F15",
  completed: "#34C759",
  cancelled: "#8E8E93",
};

const rentalStatusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

type Filter = "all" | "lending" | "borrowing";

export default function ActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rentals, items, currentUser } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const myRentals = rentals
    .filter((r) => r.borrowerId === currentUser.id || r.lenderId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = myRentals.filter((r) => {
    if (filter === "lending") return r.lenderId === currentUser.id;
    if (filter === "borrowing") return r.borrowerId === currentUser.id;
    return true;
  });

  const getItem = (itemId: string) => items.find((i) => i.id === itemId);

  // Stats
  const activeRentals = myRentals.filter((r) => r.status === "active" || r.status === "confirmed");
  const totalEarned = myRentals
    .filter((r) => r.lenderId === currentUser.id && r.status === "completed")
    .reduce((sum, r) => sum + r.totalPrice, 0);
  const totalSpent = myRentals
    .filter((r) => r.borrowerId === currentUser.id && r.status === "completed")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "lending", label: "Lending" },
    { id: "borrowing", label: "Borrowing" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Activity</Text>

        {/* Stats row */}
        {myRentals.length > 0 && (
          <View style={styles.statsRow}>
            {activeRentals.length > 0 && (
              <View style={[styles.statChip, { backgroundColor: colors.orange + "18", borderColor: colors.orange + "40" }]}>
                <View style={[styles.statDot, { backgroundColor: colors.orange }]} />
                <Text style={[styles.statText, { color: colors.orange }]}>
                  {activeRentals.length} active
                </Text>
              </View>
            )}
            {totalEarned > 0 && (
              <View style={[styles.statChip, { backgroundColor: "#34C75918", borderColor: "#34C75940" }]}>
                <Feather name="trending-up" size={11} color="#34C759" />
                <Text style={[styles.statText, { color: "#34C759" }]}>
                  ${totalEarned} earned
                </Text>
              </View>
            )}
            {totalSpent > 0 && (
              <View style={[styles.statChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="shopping-bag" size={11} color={colors.mutedForeground} />
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                  ${totalSpent} spent
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Filter tabs */}
        {myRentals.length > 0 && (
          <View style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {filters.map((f) => (
              <Pressable
                key={f.id}
                style={[
                  styles.filterTab,
                  filter === f.id && { backgroundColor: colors.orange },
                ]}
                onPress={() => setFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: filter === f.id ? colors.white : colors.mutedForeground },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
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
        {myRentals.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
              <Feather name="activity" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No activity yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your rentals and messages will appear here once you start borrowing or lending.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
              No {filter} rentals
            </Text>
          </View>
        ) : (
          filtered.map((rental) => {
            const item = getItem(rental.itemId);
            const isBorrower = rental.borrowerId === currentUser.id;
            const statusColor = rentalStatusColor[rental.status] || "#8E8E93";
            const photo = item?.photos[0];

            return (
              <Pressable
                key={rental.id}
                style={({ pressed }) => [
                  styles.rentalCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      rental.status === "active"
                        ? colors.orange + "70"
                        : colors.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() =>
                  router.push({ pathname: "/rental/[id]", params: { id: rental.id } })
                }
              >
                {/* Card header row */}
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    {photo ? (
                      <Image
                        source={{ uri: photo }}
                        style={styles.itemThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.itemThumb, styles.itemThumbFallback, { backgroundColor: colors.muted }]}>
                        <Feather name="tool" size={18} color={colors.orange} />
                      </View>
                    )}
                    <View style={styles.cardTitles}>
                      <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                        {rental.itemName}
                      </Text>
                      <View style={[styles.roleTag, { backgroundColor: isBorrower ? colors.orange + "20" : colors.muted }]}>
                        <Text style={[styles.roleText, { color: isBorrower ? colors.orange : colors.mutedForeground }]}>
                          {isBorrower ? "You're borrowing" : "You're lending"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {rentalStatusLabel[rental.status]}
                    </Text>
                  </View>
                </View>

                {/* Date + price row */}
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {new Date(rental.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" → "}
                      {new Date(rental.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.totalPrice, { color: colors.orange }]}>
                    ${rental.totalPrice}
                  </Text>
                </View>

                {/* PIN hint for confirmed borrower */}
                {rental.status === "confirmed" && isBorrower && (
                  <View
                    style={[
                      styles.pinHint,
                      { backgroundColor: colors.orange + "15", borderColor: colors.orange + "40" },
                    ]}
                  >
                    <Feather name="key" size={13} color={colors.orange} />
                    <Text style={[styles.pinHintText, { color: colors.orange }]}>
                      PIN #{rental.handoverPin} — Show to lender at pickup
                    </Text>
                  </View>
                )}

                {/* Enter PIN CTA for confirmed lender */}
                {rental.status === "confirmed" && !isBorrower && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.enterPinBtn,
                      { backgroundColor: colors.orange, opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() =>
                      router.push({ pathname: "/rental/[id]", params: { id: rental.id } })
                    }
                  >
                    <Feather name="unlock" size={14} color={colors.white} />
                    <Text style={[styles.enterPinText, { color: colors.white }]}>
                      Enter Handover PIN
                    </Text>
                  </Pressable>
                )}

                {/* Active indicator */}
                {rental.status === "active" && (
                  <View style={[styles.activeBar, { backgroundColor: colors.orange + "22" }]}>
                    <View style={[styles.activePulse, { backgroundColor: colors.orange }]} />
                    <Text style={[styles.activeBarText, { color: colors.orange }]}>
                      Rental in progress — tap to view details
                    </Text>
                    <Feather name="arrow-right" size={13} color={colors.orange} />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 50,
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
  rentalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    flexShrink: 0,
  },
  itemThumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitles: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  roleTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    flexShrink: 0,
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
  itemName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  totalPrice: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    flexShrink: 0,
  },
  pinHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  pinHintText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  enterPinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enterPinText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  activeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activePulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  activeBarText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
});
