import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "@vouch:notifications";

interface NotifSettings {
  push_requests: boolean;
  push_handover: boolean;
  push_return: boolean;
  push_vouches: boolean;
  push_trust: boolean;
  push_login: boolean;
  push_id: boolean;
  email_requests: boolean;
  email_handover: boolean;
  email_return: boolean;
  email_vouches: boolean;
  email_trust: boolean;
  email_login: boolean;
  email_id: boolean;
}

const defaults: NotifSettings = {
  push_requests: true,
  push_handover: true,
  push_return: true,
  push_vouches: true,
  push_trust: false,
  push_login: true,
  push_id: true,
  email_requests: true,
  email_handover: false,
  email_return: true,
  email_vouches: false,
  email_trust: true,
  email_login: true,
  email_id: false,
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState<NotifSettings>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setSettings(JSON.parse(val));
    });
  }, []);

  const toggle = (key: keyof NotifSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const bottomInset = Platform.OS === "web" ? 60 : insets.bottom + 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>The Pulse</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Control exactly when Vouch reaches out to you.
        </Text>

        <ToggleSection
          title="Push Notifications"
          icon="smartphone"
          colors={colors}
          items={[
            {
              key: "push_requests",
              label: "New Rental Requests",
              description: "When a neighbor wants to borrow your tool.",
            },
            {
              key: "push_handover",
              label: "Handover Reminders",
              description: "PIN confirmation and pickup time alerts.",
            },
            {
              key: "push_return",
              label: "Return Due Countdown",
              description: "Heads-up 24h before a rental period ends.",
            },
          ]}
          settings={settings}
          onToggle={toggle}
        />

        <ToggleSection
          title="Trust Updates"
          icon="award"
          colors={colors}
          items={[
            {
              key: "push_vouches",
              label: "Neighbor Vouches",
              description: "When someone vouches for your reputation.",
            },
            {
              key: "push_trust",
              label: "Trust Score Changes",
              description: "Whenever your Trust Score goes up or down.",
            },
          ]}
          settings={settings}
          onToggle={toggle}
        />

        <ToggleSection
          title="Vault Security"
          icon="shield"
          colors={colors}
          items={[
            {
              key: "push_login",
              label: "Suspicious Login",
              description: "If your account is accessed from a new device.",
            },
            {
              key: "push_id",
              label: "ID Verification Status",
              description: "Updates on your identity verification progress.",
            },
          ]}
          settings={settings}
          onToggle={toggle}
        />

        <ToggleSection
          title="Email Notifications"
          icon="mail"
          colors={colors}
          items={[
            {
              key: "email_requests",
              label: "Rental Requests",
              description: "Backup email for new tool borrow requests.",
            },
            {
              key: "email_handover",
              label: "Handover Reminders",
              description: "Email confirmation of handover PINs.",
            },
            {
              key: "email_return",
              label: "Return Due Reminder",
              description: "Email summary before items are due back.",
            },
            {
              key: "email_vouches",
              label: "Neighbor Vouches",
              description: "Weekly digest of new vouches received.",
            },
            {
              key: "email_login",
              label: "Security Alerts",
              description: "Critical account security notifications.",
            },
          ]}
          settings={settings}
          onToggle={toggle}
        />
      </ScrollView>
    </View>
  );
}

function ToggleSection({
  title,
  icon,
  colors,
  items,
  settings,
  onToggle,
}: {
  title: string;
  icon: string;
  colors: any;
  items: { key: keyof NotifSettings; label: string; description: string }[];
  settings: NotifSettings;
  onToggle: (key: keyof NotifSettings) => void;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
          <Feather name={icon as any} size={16} color={colors.orange} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      </View>

      {items.map((item, i) => (
        <View
          key={item.key}
          style={[
            styles.toggleRow,
            i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={() => onToggle(item.key)}
            trackColor={{ false: colors.muted, true: colors.orange }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.muted}
          />
        </View>
      ))}
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
    gap: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
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
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
});
