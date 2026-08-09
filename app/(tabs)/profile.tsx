import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
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

const trustFactors = [
  { label: "Response Time", value: "< 1 hr", icon: "clock", score: 95 },
  { label: "Item Condition", value: "Excellent", icon: "check-circle", score: 90 },
  { label: "Return Punctuality", value: "On Time", icon: "calendar", score: 88 },
  { label: "Verification", value: "Verified ID", icon: "shield", score: 100 },
];

const settingsRows = [
  { icon: "bell", label: "Notifications", route: "/settings/notifications" },
  { icon: "credit-card", label: "Payment Methods", route: "/settings/payments" },
  { icon: "map-pin", label: "My Location", route: "/settings/location" },
  { icon: "help-circle", label: "Help & Support", route: "/settings/support" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser, setShowVouchPlus } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#34C759";
    if (s >= 60) return "#FF9500";
    return "#FF3B30";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.orange }]}>
            <Text style={[styles.avatarLetter, { color: colors.white }]}>
              {currentUser.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]}>{currentUser.name}</Text>
              {currentUser.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: "#34C75920" }]}>
                  <Feather name="check-circle" size={12} color="#34C759" />
                  <Text style={[styles.verifiedText, { color: "#34C759" }]}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={[styles.memberSince, { color: colors.mutedForeground }]}>
              Member since {currentUser.memberSince}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {currentUser.totalRentals}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Rentals</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {currentUser.rating.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Rating</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.orange }]}>
                  {currentUser.trustScore}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Trust</Text>
              </View>
            </View>
          </View>
        </View>

        {!currentUser.vouchPlus && (
          <Pressable
            style={({ pressed }) => [
              styles.plusBanner,
              { backgroundColor: colors.orange, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowVouchPlus(true);
            }}
          >
            <View>
              <Text style={[styles.plusBannerTitle, { color: colors.white }]}>
                Vouch Plus
              </Text>
              <Text style={[styles.plusBannerSub, { color: colors.white + "CC" }]}>
                Unlimited borrows + $500 damage cover — $4.99/mo
              </Text>
            </View>
            <View style={[styles.plusArrow, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="arrow-right" size={18} color={colors.white} />
            </View>
          </Pressable>
        )}

        {currentUser.vouchPlus && (
          <View style={[styles.plusActive, { backgroundColor: colors.orange + "15", borderColor: colors.orange }]}>
            <Feather name="zap" size={18} color={colors.orange} />
            <Text style={[styles.plusActiveText, { color: colors.orange }]}>
              Vouch Plus Active — Unlimited Borrows & $500 Coverage
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trust Center</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Score: {currentUser.trustScore}/100
          </Text>

          <View style={[styles.bigScore, { backgroundColor: colors.muted }]}>
            <Text style={[styles.bigScoreNum, { color: getScoreColor(currentUser.trustScore) }]}>
              {currentUser.trustScore}
            </Text>
            <Text style={[styles.bigScoreLabel, { color: colors.mutedForeground }]}>
              {currentUser.trustScore >= 80 ? "Trusted Neighbor" : currentUser.trustScore >= 60 ? "Building Trust" : "New Member"}
            </Text>
          </View>

          {trustFactors.map((factor) => (
            <View key={factor.label} style={styles.factorRow}>
              <View style={[styles.factorIcon, { backgroundColor: colors.muted }]}>
                <Feather name={factor.icon as any} size={15} color={colors.orange} />
              </View>
              <View style={styles.factorInfo}>
                <Text style={[styles.factorLabel, { color: colors.foreground }]}>{factor.label}</Text>
                <Text style={[styles.factorValue, { color: colors.mutedForeground }]}>{factor.value}</Text>
              </View>
              <View style={[styles.factorBar, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.factorBarFill,
                    {
                      width: `${factor.score}%` as any,
                      backgroundColor: getScoreColor(factor.score),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {settingsRows.map((row, i) => (
            <Pressable
              key={row.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(row.route as any);
              }}
              style={({ pressed }) => [
                styles.settingRow,
                i < settingsRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                <Feather name={row.icon as any} size={16} color={colors.foreground} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{row.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 14,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  memberSince: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: { alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  plusBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  plusBannerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  plusBannerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  plusArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  plusActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  plusActiveText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  bigScore: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  bigScoreNum: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
  },
  bigScoreLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  factorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  factorInfo: { flex: 1 },
  factorLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  factorValue: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  factorBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  factorBarFill: {
    height: 6,
    borderRadius: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
