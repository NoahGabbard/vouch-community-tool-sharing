import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ItemCard from "@/components/ItemCard";
import { ItemCategory, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const categories: { id: ItemCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "grid" },
  { id: "power", label: "Power", icon: "zap" },
  { id: "garden", label: "Garden", icon: "feather" },
  { id: "cleaning", label: "Clean", icon: "wind" },
  { id: "hand", label: "Hand", icon: "tool" },
];

const FILTERS_HEIGHT = 112;
const FADE_DISTANCE = 70;
const CATEGORY_SCROLL_STEP = 112;

export default function StashScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, currentUser } = useApp();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ItemCategory | "all">("all");
  const scrollY = useRef(new Animated.Value(0)).current;
  const categoriesRef = useRef<ScrollView>(null);

  const filterOpacity = scrollY.interpolate({
    inputRange: [0, FADE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const filterTranslateY = scrollY.interpolate({
    inputRange: [0, FADE_DISTANCE],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  const filtered = items.filter((item) => {
    if (item.ownerId === currentUser.id) return false;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.address.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory && item.status !== "maintenance";
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const titleStripHeight = topInset + 64;
  const totalOverlayHeight = titleStripHeight + FILTERS_HEIGHT;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 110;

  const handleCategoryPress = (category: ItemCategory | "all", index: number) => {
    setActiveCategory(category);
    const targetX = Math.max(0, index * CATEGORY_SCROLL_STEP - CATEGORY_SCROLL_STEP);
    categoriesRef.current?.scrollTo({ x: targetX, animated: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: totalOverlayHeight + 8,
          paddingBottom: bottomPad,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }] }>
          {filtered.length} items within 5 miles
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="tool" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tools found nearby</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={() =>
                router.push({ pathname: "/item/[id]", params: { id: item.id } })
              }
            />
          ))
        )}
      </Animated.ScrollView>

      <View style={[styles.overlay, { top: 0, left: 0, right: 0 }]} pointerEvents="box-none">
        <View
          style={[
            styles.titleStrip,
            {
              backgroundColor: colors.background,
              paddingTop: topInset + 12,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>The Stash</Text>
          <View
            style={[
              styles.trustBadge,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.trustScore, { color: colors.orange }]}> 
              {currentUser.trustScore}
            </Text>
            <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>Trust</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.filterZone,
            {
              opacity: filterOpacity,
              transform: [{ translateY: filterTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search tools near you..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          <ScrollView
            ref={categoriesRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((cat, index) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor:
                      activeCategory === cat.id ? colors.orange : colors.card,
                    borderColor:
                      activeCategory === cat.id ? colors.orange : colors.border,
                  },
                ]}
                onPress={() => handleCategoryPress(cat.id, index)}
              >
                <Feather
                  name={cat.icon as any}
                  size={14}
                  color={activeCategory === cat.id ? colors.white : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.catLabel,
                    {
                      color:
                        activeCategory === cat.id ? colors.white : colors.mutedForeground,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
  },
  titleStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  trustBadge: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  trustScore: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  trustLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  filterZone: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  categories: {
    gap: 10,
    paddingRight: 20,
  },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  catLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
