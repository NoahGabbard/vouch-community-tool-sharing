import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

interface PaymentCard {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const mockCards: PaymentCard[] = [
  { id: "card-1", brand: "visa", last4: "4242", expiry: "12/27", isDefault: true },
  { id: "card-2", brand: "mastercard", last4: "5678", expiry: "08/26", isDefault: false },
];

const brandIcon: Record<PaymentCard["brand"], string> = {
  visa: "credit-card",
  mastercard: "credit-card",
  amex: "credit-card",
};

const brandColor: Record<PaymentCard["brand"], string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#007BC1",
};

const brandLabel: Record<PaymentCard["brand"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
};

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser } = useApp();
  const [cards, setCards] = useState<PaymentCard[]>(mockCards);
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const bottomInset = Platform.OS === "web" ? 60 : insets.bottom + 60;

  const setDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCards(cards.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const removeCard = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCards(cards.filter((c) => c.id !== id));
  };

  const addCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Add Payment Method", "Stripe payment integration coming soon.");
  };

  const nextBilling = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>The Wallet</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Manage payouts, rental payments, and your Vouch Plus subscription.
        </Text>

        {/* Payout account */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="send" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Default Payout</Text>
          </View>
          <View style={[styles.bankRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={[styles.bankIcon, { backgroundColor: "#34C75920" }]}>
              <Feather name="dollar-sign" size={20} color="#34C759" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bankName, { color: colors.foreground }]}>Chase Checking</Text>
              <Text style={[styles.bankSub, { color: colors.mutedForeground }]}>
                ••••••• 8813 · Connected via Stripe
              </Text>
            </View>
            <View style={[styles.connectedBadge, { backgroundColor: "#34C75920" }]}>
              <Text style={[styles.connectedText, { color: "#34C759" }]}>Active</Text>
            </View>
          </View>
          <Pressable
            onPress={addCard}
            style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.linkText, { color: colors.orange }]}>Change payout account →</Text>
          </Pressable>
        </View>

        {/* Payment cards */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="credit-card" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Backup Funding</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Used for rental fees and Trust Holds when you borrow.
          </Text>

          {cards.map((card, i) => (
            <View
              key={card.id}
              style={[
                styles.cardRow,
                i < cards.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.cardChip,
                  { backgroundColor: brandColor[card.brand] + "30", borderColor: brandColor[card.brand] + "50" },
                ]}
              >
                <Feather name="credit-card" size={18} color={brandColor[card.brand]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardBrand, { color: colors.foreground }]}>
                    {brandLabel[card.brand]} ••{card.last4}
                  </Text>
                  {card.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.orange + "20" }]}>
                      <Text style={[styles.defaultText, { color: colors.orange }]}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardExpiry, { color: colors.mutedForeground }]}>
                  Expires {card.expiry}
                </Text>
              </View>
              <View style={styles.cardActions}>
                {!card.isDefault && (
                  <Pressable
                    onPress={() => setDefault(card.id)}
                    style={({ pressed }) => [styles.cardActionBtn, { opacity: pressed ? 0.6 : 1 }]}
                    hitSlop={8}
                  >
                    <Feather name="star" size={16} color={colors.mutedForeground} />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => removeCard(card.id)}
                  style={({ pressed }) => [styles.cardActionBtn, { opacity: pressed ? 0.6 : 1 }]}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            onPress={addCard}
            style={({ pressed }) => [
              styles.addCardBtn,
              { borderColor: colors.orange, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={18} color={colors.orange} />
            <Text style={[styles.addCardText, { color: colors.orange }]}>Add New Card</Text>
          </Pressable>
        </View>

        {/* Vouch Plus subscription */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: currentUser.vouchPlus ? colors.orange + "12" : colors.card,
              borderColor: currentUser.vouchPlus ? colors.orange : colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="zap" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vouch Plus</Text>
            <View
              style={[
                styles.subStatusBadge,
                {
                  backgroundColor: currentUser.vouchPlus ? "#34C75920" : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.subStatusText,
                  { color: currentUser.vouchPlus ? "#34C759" : colors.mutedForeground },
                ]}
              >
                {currentUser.vouchPlus ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <View style={[styles.subDetailsRow, { borderColor: colors.border }]}>
            <View style={styles.subDetail}>
              <Text style={[styles.subDetailLabel, { color: colors.mutedForeground }]}>Plan</Text>
              <Text style={[styles.subDetailValue, { color: colors.foreground }]}>$4.99 / month</Text>
            </View>
            <View style={[styles.subDetailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.subDetail}>
              <Text style={[styles.subDetailLabel, { color: colors.mutedForeground }]}>
                {currentUser.vouchPlus ? "Next Billing" : "Start Date"}
              </Text>
              <Text style={[styles.subDetailValue, { color: colors.foreground }]}>
                {currentUser.vouchPlus ? nextBilling : "—"}
              </Text>
            </View>
          </View>

          {currentUser.vouchPlus ? (
            <Pressable
              onPress={() => Alert.alert("Cancel Vouch Plus", "Are you sure you want to cancel?", [
                { text: "Keep Plus", style: "cancel" },
                { text: "Cancel Subscription", style: "destructive" },
              ])}
              style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                Cancel subscription →
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => Alert.alert("Vouch Plus", "Activate for $4.99/month?")}
              style={({ pressed }) => [
                styles.activateBtn,
                { backgroundColor: colors.orange, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.activateBtnText, { color: colors.white }]}>
                Activate Vouch Plus — $4.99/mo
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 4,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -6,
    lineHeight: 18,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bankSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  connectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  connectedText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  cardChip: {
    width: 46,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardBrand: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  cardExpiry: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 14,
  },
  addCardText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  linkBtn: {
    alignSelf: "flex-start",
  },
  linkText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  subStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subStatusText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  subDetailsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  subDetail: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  subDetailLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  subDetailValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  subDetailDivider: {
    width: 1,
    height: "100%",
  },
  activateBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  activateBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
