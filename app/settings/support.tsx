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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const faqs = [
  {
    q: "How does the $500 guarantee work?",
    a: "Vouch Plus members are covered up to $500 per item for verified damage that occurs during an active rental. File a report within 24 hours of the return handover. Our team reviews within 48 hours.",
  },
  {
    q: "What is a Trust Hold?",
    a: "A Trust Hold is a temporary authorization on your backup card equal to the item's estimated value. It's released within 2–5 business days after a successful return confirmation.",
  },
  {
    q: "How do Handover PINs work?",
    a: "When a rental is confirmed, the borrower receives a 4-digit PIN. Both parties meet in person, the lender enters the PIN on the app, and the rental clock starts. This confirms physical handover.",
  },
  {
    q: "What is the Safety Checklist?",
    a: "Before listing power tools or equipment, we recommend inspecting for frayed cords, sharp edges, and proper guard installation. Our checklist walks you through each point.",
  },
  {
    q: "Can I cancel a rental after it starts?",
    a: "Active rentals can be cancelled with a penalty if within the first hour. After that, the lender receives their full daily rate. Contact us immediately if there's an issue.",
  },
];

export default function SupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const bottomInset = Platform.OS === "web" ? 60 : insets.bottom + 60;

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportDamage = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Report Damage",
      "This will open an emergency incident report for the active rental. Our team will be notified immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "File Report",
          style: "destructive",
          onPress: () =>
            Alert.alert("Report Filed", "Our team has been notified. We'll contact you within 1 hour."),
        },
      ]
    );
  };

  const chatWithHuman = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Chat with a Human", "Connecting you to a Vouch support agent...");
  };

  const emergencyReport = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Emergency Incident Report",
      "Use this only for urgent situations such as missing items or safety concerns.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Proceed", style: "destructive", onPress: reportDamage },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>The Guard</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Fast-track resolution for anything that goes wrong.
        </Text>

        {/* REPORT DAMAGE — primary CTA, high-contrast */}
        <Pressable
          onPress={reportDamage}
          style={({ pressed }) => [
            styles.reportBtn,
            { backgroundColor: "#FF3B30", opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.reportIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="alert-triangle" size={24} color="#fff" />
          </View>
          <View style={styles.reportTextWrap}>
            <Text style={styles.reportTitle}>Report Damage</Text>
            <Text style={styles.reportSub}>
              Item damaged during a rental? Tap to file immediately.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>

        {/* Contact Vouch */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="message-circle" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Vouch</Text>
          </View>

          <Pressable
            onPress={chatWithHuman}
            style={({ pressed }) => [
              styles.contactRow,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={[styles.contactIcon, { backgroundColor: "#0A84FF20" }]}>
              <Feather name="message-square" size={20} color="#0A84FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactLabel, { color: colors.foreground }]}>Chat with a Human</Text>
              <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>
                Avg. response time: under 5 minutes
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={emergencyReport}
            style={({ pressed }) => [
              styles.contactRow,
              {
                backgroundColor: colors.muted,
                borderColor: "#FF3B3040",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={[styles.contactIcon, { backgroundColor: "#FF3B3020" }]}>
              <Feather name="phone-call" size={20} color="#FF3B30" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactLabel, { color: colors.foreground }]}>
                Emergency Incident Report
              </Text>
              <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>
                Missing item, safety hazard, or urgent dispute.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* FAQ Knowledge Base */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="book-open" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Knowledge Base</Text>
          </View>

          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search FAQ..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyFaq}>
              <Feather name="search" size={24} color={colors.mutedForeground} />
              <Text style={[styles.emptyFaqText, { color: colors.mutedForeground }]}>
                No results found
              </Text>
            </View>
          ) : (
            filteredFaqs.map((faq, i) => (
              <View
                key={i}
                style={[
                  styles.faqItem,
                  i < filteredFaqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <Pressable
                  onPress={() => setExpanded(expanded === i ? null : i)}
                  style={styles.faqQuestion}
                >
                  <Text style={[styles.faqQ, { color: colors.foreground }]}>{faq.q}</Text>
                  <Feather
                    name={expanded === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
                {expanded === i && (
                  <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Safety checklist note */}
        <View
          style={[
            styles.safetyCard,
            { backgroundColor: colors.orange + "12", borderColor: colors.orange + "40" },
          ]}
        >
          <Feather name="clipboard" size={18} color={colors.orange} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.safetyTitle, { color: colors.orange }]}>Safety Checklist</Text>
            <Text style={[styles.safetySub, { color: colors.mutedForeground }]}>
              Review the pre-rental safety guide before every handover.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.orange} />
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
  reportBtn: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  reportIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reportTextWrap: { flex: 1 },
  reportTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 2,
  },
  reportSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 16,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
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
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  contactSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  faqItem: {
    paddingVertical: 4,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 8,
  },
  faqQ: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    lineHeight: 20,
  },
  faqA: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    paddingBottom: 10,
  },
  emptyFaq: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  emptyFaqText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  safetyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  safetyTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  safetySub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
});
