import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import VouchPlus from "@/components/VouchPlus";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";
  const isWeb = Platform.OS === "web";
  const windowWidth = Dimensions.get("window").width;
  const compactWidth = windowWidth < 390;

  const bottomOffset = isWeb ? 12 : Math.max(insets.bottom, 6);
  const horizontalInset = isWeb ? 18 : compactWidth ? 10 : 16;
  const barWidth = isWeb ? undefined : Math.min(windowWidth - horizontalInset * 2, 430);
  const barLeft = isWeb ? horizontalInset : Math.max(horizontalInset, (windowWidth - (barWidth ?? windowWidth)) / 2);

  return (
    <>
      <VouchPlus />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF5F15",
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            left: barLeft,
            right: isWeb ? horizontalInset : barLeft,
            bottom: bottomOffset,
            height: 64,
            borderRadius: 24,
            backgroundColor: isIOS ? "transparent" : "rgba(22, 22, 23, 0.92)",
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom > 0 ? 4 : 6, 4),
            elevation: isAndroid ? 22 : 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 18,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={92}
                tint="dark"
                style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: "hidden" }]}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 24,
                    backgroundColor: "rgba(22, 22, 23, 0.92)",
                    overflow: "hidden",
                  },
                ]}
              />
            ),
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            marginTop: 0,
          },
          tabBarItemStyle: {
            borderRadius: 999,
            marginHorizontal: 2,
            marginVertical: 0,
            paddingVertical: 0,
            minWidth: 0,
            flex: 1,
          },
          tabBarIconStyle: {
            marginTop: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "The Stash",
            tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="garage"
          options={{
            title: "My Garage",
            tabBarIcon: ({ color }) => <Feather name="tool" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ color }) => <Feather name="bell" size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
