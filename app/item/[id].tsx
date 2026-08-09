import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

const categoryLabel: Record<string, string> = {
  power: "Power Tools",
  garden: "Garden",
  cleaning: "Cleaning",
  hand: "Hand Tools",
};

export default function ItemDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, currentUser, createRental, setShowVouchPlus } = useApp();

  const item = items.find((i) => i.id === id);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [step, setStep] = useState<"view" | "dates">("view");

  if (!item) return null;

  const isOwner = item.ownerId === currentUser.id;
  const isHighValue = item.estimatedValue > 50;
  const requiresPlus = isHighValue && !currentUser.vouchPlus;
  const depositAmount = currentUser.vouchPlus ? 0 : 50;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const defaultStart = tomorrow.toISOString().split("T")[0];
  const defaultEnd = dayAfter.toISOString().split("T")[0];

  const handleBook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (requiresPlus) {
      setShowVouchPlus(true);
      return;
    }
    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const total = item.dailyPrice * days;

    const rental = createRental({
      itemId: item.id,
      itemName: item.name,
      borrowerId: currentUser.id,
      lenderId: item.ownerId,
      startDate: start,
      endDate: end,
      totalPrice: total,
      depositAmount,
      status: "confirmed",
    });

    router.push({ pathname: "/rental/[id]", params: { id: rental.id } });
  };

  const days = (() => {
    const s = startDate || defaultStart;
    const e = endDate || defaultEnd;
    return Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)));
  })();

  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.photoArea, { backgroundColor: colors.muted }]}>
        {item.photos[0] ? (
          <Image
            source={{ uri: item.photos[0] }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <Feather name="tool" size={60} color={colors.orange} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: "rgba(0,0,0,0.45)", opacity: pressed ? 0.8 : 1, top: (Platform.OS === "web" ? 67 : insets.top) + 8 },
          ]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentInner, { paddingBottom: 120 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.categoryRow}>
              <Text style={[styles.category, { color: colors.mutedForeground }]}>
                {categoryLabel[item.category]}
              </Text>
              {item.vouchPlus && (
                <View style={[styles.plusBadge, { backgroundColor: colors.orange }]}>
                  <Text style={[styles.plusText, { color: colors.white }]}>PLUS PROTECTED</Text>
                </View>
              )}
            </View>
            <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Feather name="star" size={14} color={colors.orange} />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>
              {item.rating > 0 ? item.rating.toFixed(1) : "New"}
            </Text>
            {item.reviewCount > 0 && (
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                ({item.reviewCount} reviews)
              </Text>
            )}
          </View>
          <View style={styles.locationBox}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.location, { color: colors.mutedForeground }]}>
              {item.location.address}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {item.description}
        </Text>

        <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.orange }]}>
              ${item.dailyPrice}
            </Text>
            <Text style={[styles.perDay, { color: colors.mutedForeground }]}>/day</Text>
          </View>
          <Text style={[styles.estimatedValue, { color: colors.mutedForeground }]}>
            Item value: ~${item.estimatedValue}
          </Text>
        </View>

        <View style={[styles.datesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.datesTitle, { color: colors.foreground }]}>Rental Period</Text>
          <View style={styles.dateRow}>
            <View style={[styles.dateBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Start</Text>
              <Text style={[styles.dateValue, { color: colors.foreground }]}>
                {new Date(startDate || defaultStart).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            <View style={[styles.dateBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>End</Text>
              <Text style={[styles.dateValue, { color: colors.foreground }]}>
                {new Date(endDate || defaultEnd).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
              {days} {days === 1 ? "day" : "days"} × ${item.dailyPrice}
            </Text>
            <Text style={[styles.totalValue, { color: colors.foreground }]}>
              ${item.dailyPrice * days}
            </Text>
          </View>
          {depositAmount > 0 && (
            <View style={styles.depositRow}>
              <Text style={[styles.depositLabel, { color: colors.mutedForeground }]}>
                Security deposit (returned)
              </Text>
              <Text style={[styles.depositValue, { color: colors.orange }]}>
                +${depositAmount}
              </Text>
            </View>
          )}
        </View>

        {requiresPlus && (
          <View style={[styles.plusRequired, { backgroundColor: colors.orange + "15", borderColor: colors.orange }]}>
            <Feather name="zap" size={16} color={colors.orange} />
            <Text style={[styles.plusRequiredText, { color: colors.orange }]}>
              High-value item — Vouch Plus required to borrow
            </Text>
          </View>
        )}
      </ScrollView>

      {!isOwner && item.status === "available" && (
        <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomInset + 16 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.bookBtn,
              { backgroundColor: colors.orange, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleBook}
          >
            {requiresPlus ? (
              <>
                <Feather name="zap" size={18} color={colors.white} />
                <Text style={[styles.bookBtnText, { color: colors.white }]}>
                  Unlock with Vouch Plus
                </Text>
              </>
            ) : (
              <Text style={[styles.bookBtnText, { color: colors.white }]}>
                Request Rental — ${item.dailyPrice * days}
                {depositAmount > 0 ? ` + $${depositAmount} deposit` : ""}
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {item.status !== "available" && (
        <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomInset + 16 }]}>
          <View style={[styles.unavailableBtn, { backgroundColor: colors.muted }]}>
            <Text style={[styles.unavailableText, { color: colors.mutedForeground }]}>
              Currently {item.status === "in-use" ? "In Use" : item.status}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  photoArea: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  contentInner: {
    padding: 20,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  plusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  plusText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  metaRow: {
    gap: 6,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  priceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  price: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  perDay: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  estimatedValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  datesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  datesTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  depositRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depositLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  depositValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  plusRequired: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  plusRequiredText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bookBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  bookBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  unavailableBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
