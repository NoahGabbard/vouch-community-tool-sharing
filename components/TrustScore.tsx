import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  score: number;
  size?: "sm" | "lg";
}

export default function TrustScore({ score, size = "sm" }: Props) {
  const colors = useColors();
  const isLarge = size === "lg";

  const getColor = (s: number) => {
    if (s >= 80) return "#34C759";
    if (s >= 60) return "#FF9500";
    return "#FF3B30";
  };

  const getLabel = (s: number) => {
    if (s >= 90) return "Exceptional";
    if (s >= 80) return "Trusted";
    if (s >= 60) return "Good";
    if (s >= 40) return "Building";
    return "New";
  };

  const color = getColor(score);
  const radius = isLarge ? 44 : 28;
  const strokeWidth = isLarge ? 6 : 4;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const progress = (score / 100) * circumference;

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <View
        style={[
          styles.ring,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.ringFill,
            {
              width: radius * 2 - strokeWidth * 2,
              height: radius * 2 - strokeWidth * 2,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: color,
              position: "absolute",
              top: 0,
              left: 0,
            },
          ]}
        />
        <Text
          style={[
            styles.scoreText,
            { color, fontSize: isLarge ? 28 : 16, fontFamily: "Inter_700Bold" },
          ]}
        >
          {score}
        </Text>
      </View>
      {isLarge && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.foreground }]}>{getLabel(score)}</Text>
          <Text style={[styles.sublabel, { color: colors.mutedForeground }]}>
            Trust Score
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  containerLarge: {},
  ring: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringFill: {},
  scoreText: {
    zIndex: 1,
  },
  labelContainer: {},
  label: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  sublabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
