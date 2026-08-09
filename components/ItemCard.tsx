import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { ToolItem } from "@/contexts/AppContext";

const categoryIcons: Record<string, string> = {
  power: "zap",
  garden: "feather",
  cleaning: "wind",
  hand: "tool",
};

const statusColors: Record<string, string> = {
  available: "#34C759",
  pending: "#FF9500",
  "in-use": "#FF5F15",
  maintenance: "#8E8E93",
};

interface Props {
  item: ToolItem;
  onPress: () => void;
}

export default function ItemCard({ item, onPress }: Props) {
  const colors = useColors();
  const photo = item.photos[0];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={styles.photoWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photoFallback, { backgroundColor: colors.muted }]}>
            <Feather
              name={(categoryIcons[item.category] as any) || "tool"}
              size={32}
              color={colors.orange}
            />
          </View>
        )}
        {photo && <View style={styles.photoOverlay} />}
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
            {item.name}
          </Text>
          {item.vouchPlus && (
            <View style={[styles.plusBadge, { backgroundColor: colors.orange }]}> 
              <Text style={[styles.plusText, { color: colors.white }]}>PLUS</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] || "#8E8E93" }]} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {item.status === "available" ? item.location.address : item.status}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color={colors.orange} />
            <Text style={[styles.rating, { color: colors.foreground }]}> 
              {item.rating > 0 ? item.rating.toFixed(1) : "New"}
            </Text>
            {item.reviewCount > 0 && (
              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}> 
                ({item.reviewCount})
              </Text>
            )}
          </View>
          <Text style={[styles.price, { color: colors.orange }]}> 
            ${item.dailyPrice}
            <Text style={[styles.perDay, { color: colors.mutedForeground }]}>/day</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    minHeight: 112,
  },
  photoWrap: {
    width: 104,
    height: 112,
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  info: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    gap: 6,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  rating: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  perDay: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
