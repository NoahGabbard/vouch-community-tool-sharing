import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function VouchPlus() {
  const colors = useColors();
  const { showVouchPlus, setShowVouchPlus, upgradeToVouchPlus } = useApp();

  return (
    <Modal visible={showVouchPlus} transparent animationType="fade" onRequestClose={() => setShowVouchPlus(false)}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <Pressable onPress={() => setShowVouchPlus(false)} style={styles.close}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={[styles.icon, { backgroundColor: colors.orange }]}>
            <Feather name="shield" size={26} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Vouch Plus</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Borrow without limits and get extra protection on every handoff.
          </Text>
          <View style={styles.features}>
            {["Unlimited borrows", "$0 security deposits", "$500 damage guarantee"].map((feature) => (
              <View key={feature} style={styles.feature}>
                <Feather name="check" size={16} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={upgradeToVouchPlus}
            style={[styles.cta, { backgroundColor: colors.orange }]}
          >
            <Text style={styles.ctaText}>Activate for $4.99 / month</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  close: { alignSelf: "flex-end", padding: 4 },
  icon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 4 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginTop: 18 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: 8 },
  features: { gap: 14, marginVertical: 24 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cta: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});