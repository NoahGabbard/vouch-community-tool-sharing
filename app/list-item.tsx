import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemCategory, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const categories: { id: ItemCategory; label: string; icon: string }[] = [
  { id: "power", label: "Power Tools", icon: "zap" },
  { id: "garden", label: "Garden", icon: "feather" },
  { id: "cleaning", label: "Cleaning", icon: "wind" },
  { id: "hand", label: "Hand Tools", icon: "tool" },
];

const photoSlots = ["Front View", "Side View", "Serial Number"];

type Step = 1 | 2 | 3;

export default function ListItemScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem } = useApp();

  const [step, setStep] = useState<Step>(1);
  const [photos, setPhotos] = useState<string[]>(["", "", ""]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("power");
  const [dailyPrice, setDailyPrice] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [description, setDescription] = useState("");
  const [vouchPlus, setVouchPlus] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handlePhotoSlot = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPhotos = [...photos];
    newPhotos[idx] = `photo-${idx}-${Date.now()}`;
    setPhotos(newPhotos);
  };

  const canProceed = () => {
    if (step === 1) return photos.filter((p) => p !== "").length >= 1;
    if (step === 2) return name.trim() !== "" && dailyPrice !== "";
    return true;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    } else {
      addItem({
        name: name.trim(),
        category,
        dailyPrice: parseFloat(dailyPrice) || 0,
        estimatedValue: parseFloat(estimatedValue) || 100,
        description: description.trim(),
        photos,
        location: { lat: 37.774, lng: -122.419, address: "Mission District, SF" },
        vouchPlus,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/garage");
    }
  };

  const stepLabels: Record<Step, string> = {
    1: "Upload Photos",
    2: "Item Details",
    3: "Protection",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => (step > 1 ? setStep((s) => (s - 1) as Step) : router.back())}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>List a Tool</Text>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
            Step {step} of 3 — {stepLabels[step]}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.orange, width: `${(step / 3) * 100}%` as any },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Upload 3 photos
            </Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Clear photos help build trust with borrowers.
            </Text>
            <View style={styles.photoGrid}>
              {photoSlots.map((slot, i) => (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [
                    styles.photoSlot,
                    {
                      backgroundColor: photos[i] ? colors.orange + "20" : colors.card,
                      borderColor: photos[i] ? colors.orange : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => handlePhotoSlot(i)}
                >
                  {photos[i] ? (
                    <Feather name="check-circle" size={28} color={colors.orange} />
                  ) : (
                    <Feather name="camera" size={28} color={colors.mutedForeground} />
                  )}
                  <Text
                    style={[
                      styles.photoLabel,
                      { color: photos[i] ? colors.orange : colors.mutedForeground },
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Item Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. DeWalt Circular Saw"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
              <View style={styles.catGrid}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: category === cat.id ? colors.orange : colors.card,
                        borderColor: category === cat.id ? colors.orange : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Feather
                      name={cat.icon as any}
                      size={16}
                      color={category === cat.id ? colors.white : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.catChipText,
                        { color: category === cat.id ? colors.white : colors.mutedForeground },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Daily Price ($)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="25"
                  placeholderTextColor={colors.mutedForeground}
                  value={dailyPrice}
                  onChangeText={setDailyPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Item Value ($)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="180"
                  placeholderTextColor={colors.mutedForeground}
                  value={estimatedValue}
                  onChangeText={setEstimatedValue}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description</Text>
              <TextInput
                style={[styles.textarea, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Describe your item, its condition, and any accessories included..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Vouch Plus Protection
            </Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Enable insurance coverage for your item. This makes it eligible for Vouch Plus borrowers.
            </Text>

            <View style={[styles.protectionCard, { backgroundColor: colors.card, borderColor: vouchPlus ? colors.orange : colors.border }]}>
              <View style={styles.protectionTop}>
                <View style={[styles.shieldIcon, { backgroundColor: colors.orange + "20" }]}>
                  <Feather name="shield" size={24} color={colors.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.protectionTitle, { color: colors.foreground }]}>
                    Vouch Plus Protection
                  </Text>
                  <Text style={[styles.protectionSub, { color: colors.mutedForeground }]}>
                    Up to $500 damage coverage per rental
                  </Text>
                </View>
                <Switch
                  value={vouchPlus}
                  onValueChange={(val) => {
                    setVouchPlus(val);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: colors.muted, true: colors.orange }}
                  thumbColor={colors.white}
                />
              </View>

              {vouchPlus && (
                <View style={[styles.protectionBenefits, { borderTopColor: colors.border }]}>
                  {[
                    "Damage covered up to $500",
                    "Priority listing placement",
                    "Borrower identity verified",
                    "24hr fund release guarantee",
                  ].map((b) => (
                    <View key={b} style={styles.benefit}>
                      <Feather name="check" size={14} color={colors.orange} />
                      <Text style={[styles.benefitText, { color: colors.foreground }]}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Listing Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Item</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>{name || "Unnamed"}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Category</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>
                  {categories.find((c) => c.id === category)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Daily Rate</Text>
                <Text style={[styles.summaryVal, { color: colors.orange }]}>
                  ${dailyPrice || "0"}/day
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor: canProceed() ? colors.orange : colors.muted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.nextBtnText, { color: canProceed() ? colors.white : colors.mutedForeground }]}>
            {step === 3 ? "Publish Listing" : "Continue"}
          </Text>
          <Feather
            name={step === 3 ? "check" : "arrow-right"}
            size={18}
            color={canProceed() ? colors.white : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 16,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  progressBar: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    gap: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  sectionSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginTop: -8,
  },
  photoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
    textAlignVertical: "top",
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  protectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  protectionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  shieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  protectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  protectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  protectionBenefits: {
    borderTopWidth: 1,
    padding: 16,
    gap: 10,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  summary: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  summaryVal: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 18,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
