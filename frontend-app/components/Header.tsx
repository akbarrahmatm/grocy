import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/constants/theme";

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.brand}>Grocy</Text>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => router.push("/(tabs)/profile" as any)}
        accessibilityLabel="Profile"
      >
        <Ionicons name="person-outline" size={17} color={Colors.ink} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
});
