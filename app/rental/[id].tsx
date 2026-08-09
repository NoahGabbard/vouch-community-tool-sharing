import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function RentalDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rentals, currentUser, enterHandoverPin, uploadReturnPhoto, sendMessage, messages } = useApp();

  const rental = rentals.find((r) => r.id === id);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState(false);
  const [chatText, setChatText] = useState("");
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  if (!rental) return null;

  const isBorrower = rental.borrowerId === currentUser.id;
  const isLender = rental.lenderId === currentUser.id;
  const rentalMessages = messages.filter((m) => m.rentalId === rental.id);

  const handlePinDigit = (val: string, idx: number) => {
    const digits = [...pinDigits];
    digits[idx] = val.replace(/\D/g, "").slice(0, 1);
    setPinDigits(digits);
    setPinError(false);
    if (val && idx < 3) refs[idx + 1].current?.focus();
    if (digits.every((d) => d !== "") && idx === 3) {
      const pin = digits.join("");
      const success = enterHandoverPin(rental.id, pin);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPinError(true);
        setPinDigits(["", "", "", ""]);
        refs[0].current?.focus();
      }
    }
  };

  const handleSendMessage = () => {
    if (chatText.trim()) {
      sendMessage(rental.id, chatText.trim());
      setChatText("");
    }
  };

  const handleReturnPhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    uploadReturnPhoto(rental.id, "return-photo-placeholder");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Rental Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.rentalCard, { backgroundColor: colors.card, borderColor: colors.orange }]}>
          <Text style={[styles.itemName, { color: colors.foreground }]}>{rental.itemName}</Text>

          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Pickup</Text>
              <Text style={[styles.dateVal, { color: colors.foreground }]}>
                {new Date(rental.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Return</Text>
              <Text style={[styles.dateVal, { color: colors.foreground }]}>
                {new Date(rental.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
            <View style={[styles.totalBox, { backgroundColor: colors.orange + "15" }]}>
              <Text style={[styles.totalBoxVal, { color: colors.orange }]}>${rental.totalPrice}</Text>
              <Text style={[styles.totalBoxLabel, { color: colors.mutedForeground }]}>{days}d</Text>
            </View>
          </View>
        </View>

        {rental.status === "confirmed" && isBorrower && (
          <View style={[styles.pinCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.pinHeader, { backgroundColor: colors.orange }]}>
              <Feather name="key" size={16} color={colors.white} />
              <Text style={[styles.pinHeaderText, { color: colors.white }]}>Handover PIN</Text>
            </View>
            <View style={styles.pinBody}>
              <Text style={[styles.pinDigits, { color: colors.orange }]}>
                {rental.handoverPin}
              </Text>
              <Text style={[styles.pinInstruction, { color: colors.mutedForeground }]}>
                Show this PIN to your neighbor at pickup. They'll enter it to start the rental clock and activate coverage.
              </Text>
            </View>
          </View>
        )}

        {rental.status === "confirmed" && isLender && (
          <View style={[styles.pinCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.pinHeader, { backgroundColor: colors.orange }]}>
              <Feather name="unlock" size={16} color={colors.white} />
              <Text style={[styles.pinHeaderText, { color: colors.white }]}>Enter Handover PIN</Text>
            </View>
            <View style={styles.pinBody}>
              <Text style={[styles.pinInstruction, { color: colors.mutedForeground }]}>
                Ask your neighbor for their 4-digit PIN to confirm handover and start the rental clock.
              </Text>
              <View style={styles.pinInputRow}>
                {pinDigits.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={refs[i]}
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: colors.muted,
                        color: colors.foreground,
                        borderColor: pinError ? colors.destructive : digit ? colors.orange : colors.border,
                      },
                    ]}
                    value={digit}
                    onChangeText={(val) => handlePinDigit(val, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              {pinError && (
                <Text style={[styles.pinError, { color: colors.destructive }]}>
                  Incorrect PIN — ask your neighbor to check
                </Text>
              )}
            </View>
          </View>
        )}

        {rental.status === "active" && (
          <View style={[styles.activeCard, { backgroundColor: "#34C75915", borderColor: "#34C759" }]}>
            <Feather name="check-circle" size={18} color="#34C759" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeTitle, { color: "#34C759" }]}>Rental Active</Text>
              <Text style={[styles.activeText, { color: colors.mutedForeground }]}>
                Insurance coverage is active. Return by{" "}
                {new Date(rental.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
          </View>
        )}

        {rental.status === "active" && isBorrower && (
          <Pressable
            style={({ pressed }) => [
              styles.returnBtn,
              { backgroundColor: colors.orange, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleReturnPhoto}
          >
            <Feather name="camera" size={18} color={colors.white} />
            <Text style={[styles.returnBtnText, { color: colors.white }]}>
              Upload Return Photo
            </Text>
          </Pressable>
        )}

        {rental.status === "completed" && (
          <View style={[styles.completedCard, { backgroundColor: "#34C75915", borderColor: "#34C759" }]}>
            <Feather name="check-circle" size={20} color="#34C759" />
            <Text style={[styles.completedText, { color: "#34C759" }]}>
              Rental complete! Funds released to lender in 24 hours.
            </Text>
          </View>
        )}

        <View style={[styles.chatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chatTitle, { color: colors.foreground }]}>Messages</Text>
          <View style={styles.messages}>
            {rentalMessages.length === 0 ? (
              <Text style={[styles.noMessages, { color: colors.mutedForeground }]}>
                No messages yet. Say hello!
              </Text>
            ) : (
              rentalMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubble,
                      isMe
                        ? [styles.bubbleMe, { backgroundColor: colors.orange }]
                        : [styles.bubbleOther, { backgroundColor: colors.muted }],
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: isMe ? colors.white : colors.foreground }]}>
                      {msg.text}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
          <View style={[styles.chatInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.chatTextInput, { color: colors.foreground }]}
              placeholder="Send a message..."
              placeholderTextColor={colors.mutedForeground}
              value={chatText}
              onChangeText={setChatText}
              multiline
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                { backgroundColor: colors.orange, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={handleSendMessage}
            >
              <Feather name="send" size={16} color={colors.white} />
            </Pressable>
          </View>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  rentalCard: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 20,
    gap: 14,
  },
  itemName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateItem: { gap: 2 },
  dateLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  dateVal: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  totalBox: {
    marginLeft: "auto",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  totalBoxVal: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  totalBoxLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  pinCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  pinHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
  },
  pinHeaderText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  pinBody: {
    padding: 20,
    gap: 12,
  },
  pinDigits: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    letterSpacing: 16,
    textAlign: "center",
  },
  pinInstruction: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    textAlign: "center",
  },
  pinInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  pinInput: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  pinError: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  activeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  activeTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  activeText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  returnBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 18,
  },
  returnBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  completedText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  chatCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  chatTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  messages: {
    gap: 8,
    minHeight: 60,
  },
  noMessages: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 16,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 10,
    paddingHorizontal: 14,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    paddingLeft: 14,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
