import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "@vouch:location";

interface LocationSettings {
  address: string;
  radius: number;
  blurAddress: boolean;
}

const defaults: LocationSettings = {
  address: "741 Valencia St, Mission District, SF",
  radius: 5,
  blurAddress: false,
};

function RadiusSlider({
  value,
  onChange,
  colors,
}: {
  value: number;
  onChange: (val: number) => void;
  colors: any;
}) {
  const trackWidth = useRef(0);
  const position = useRef(new Animated.Value(0)).current;
  const currentValue = useRef(value);

  const updatePosition = useCallback(
    (val: number) => {
      if (trackWidth.current === 0) return;
      const fraction = (val - 1) / 9;
      const x = fraction * trackWidth.current;
      position.setValue(x);
    },
    [position]
  );

  useEffect(() => {
    updatePosition(value);
  }, [value, updatePosition]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        const fraction = (gs.moveX - 20) / trackWidth.current;
        const clamped = Math.min(1, Math.max(0, fraction));
        const newVal = Math.round(clamped * 9) + 1;
        if (newVal !== currentValue.current) {
          currentValue.current = newVal;
          position.setValue(clamped * trackWidth.current);
          onChange(newVal);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    updatePosition(value);
  };

  return (
    <View style={{ paddingVertical: 8 }}>
      <View
        style={[sliderStyles.track, { backgroundColor: colors.muted }]}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            sliderStyles.fill,
            { backgroundColor: colors.orange, width: position },
          ]}
        />
        <Animated.View
          style={[
            sliderStyles.thumb,
            { backgroundColor: colors.orange, transform: [{ translateX: position }] },
          ]}
        />
      </View>
      <View style={sliderStyles.labels}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text
            key={n}
            style={[
              sliderStyles.labelText,
              { color: n === value ? colors.orange : colors.mutedForeground },
            ]}
          >
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  fill: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -9,
    marginLeft: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },
  labelText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});

export default function LocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState<LocationSettings>(defaults);
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const bottomInset = Platform.OS === "web" ? 60 : insets.bottom + 60;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setSettings(JSON.parse(val));
    });
  }, []);

  const update = (patch: Partial<LocationSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const radiusLabel = `${settings.radius} mile${settings.radius !== 1 ? "s" : ""}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>The Radius</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          Set your home base and control how far your neighborhood extends.
        </Text>

        {/* Map placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.mapInner, { backgroundColor: "#0F1923" }]}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <View
                key={`h${i}`}
                style={[styles.gridLine, styles.gridH, { top: `${25 + i * 16}%` as any, backgroundColor: "rgba(255,255,255,0.05)" }]}
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={`v${i}`}
                style={[styles.gridLine, styles.gridV, { left: `${20 + i * 16}%` as any, backgroundColor: "rgba(255,255,255,0.05)" }]}
              />
            ))}
            {/* Radius circle */}
            <View style={styles.mapCenter}>
              <View
                style={[
                  styles.radiusCircle,
                  {
                    width: 40 + settings.radius * 16,
                    height: 40 + settings.radius * 16,
                    borderRadius: (40 + settings.radius * 16) / 2,
                    borderColor: colors.orange + "40",
                    backgroundColor: colors.orange + "10",
                  },
                ]}
              />
              <View style={[styles.homePin, { backgroundColor: colors.orange }]}>
                <Feather name="home" size={14} color="#fff" />
              </View>
            </View>
          </View>
          <View style={[styles.mapOverlay, { borderColor: colors.border }]}>
            <Feather name="map-pin" size={12} color={colors.orange} />
            <Text style={[styles.mapLabel, { color: colors.mutedForeground }]}>
              {radiusLabel} search radius · {settings.address.split(",")[1]?.trim() || "SF"}
            </Text>
          </View>
        </View>

        {/* Home base */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="home" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Home Base</Text>
          </View>
          <View style={[styles.addressRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.orange} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressMain, { color: colors.foreground }]}>
                {settings.address.split(",")[0]}
              </Text>
              <Text style={[styles.addressSub, { color: colors.mutedForeground }]}>
                {settings.address.split(",").slice(1).join(",")}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => {}}
              style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.6 : 1, borderColor: colors.border }]}
            >
              <Feather name="edit-2" size={14} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Radius slider */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="circle" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Search Radius</Text>
            <View style={[styles.radiusBadge, { backgroundColor: colors.orange }]}>
              <Text style={[styles.radiusBadgeText, { color: colors.white }]}>{radiusLabel}</Text>
            </View>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Tools within this radius appear in The Stash.
          </Text>
          <RadiusSlider
            value={settings.radius}
            onChange={(r) => update({ radius: r })}
            colors={colors}
          />
        </View>

        {/* Privacy mode */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.orange + "20" }]}>
              <Feather name="eye-off" size={16} color={colors.orange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Privacy Mode</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Blur Address</Text>
              <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>
                Show neighbors a general vicinity (e.g. "2 blocks away") until a Handover PIN is generated.
              </Text>
            </View>
            <Switch
              value={settings.blurAddress}
              onValueChange={(val) => update({ blurAddress: val })}
              trackColor={{ false: colors.muted, true: colors.orange }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.muted}
            />
          </View>
          {settings.blurAddress && (
            <View style={[styles.privacyNote, { backgroundColor: colors.orange + "15", borderColor: colors.orange + "40" }]}>
              <Feather name="info" size={14} color={colors.orange} />
              <Text style={[styles.privacyNoteText, { color: colors.orange }]}>
                Your exact address is only revealed when a Handover PIN is active.
              </Text>
            </View>
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
  mapContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  mapInner: {
    height: 160,
    position: "relative",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
  },
  gridH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  mapCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusCircle: {
    position: "absolute",
    borderWidth: 2,
  },
  homePin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF5F15",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  mapOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  mapLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
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
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: -4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  addressMain: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  addressSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  radiusBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyNoteText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    lineHeight: 16,
    flex: 1,
  },
});
