import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/constants/theme";

interface HeroProps {
  query: string;
  onQueryChange: (v: string) => void;
}

export default React.memo(function Hero({ query, onQueryChange }: HeroProps) {
  const [localText, setLocalText] = useState(query);

  useEffect(() => {
    setLocalText(query);
  }, [query]);

  const handleChange = (text: string) => {
    setLocalText(text);
    onQueryChange(text);
  };

  const handleClear = () => {
    setLocalText("");
    onQueryChange("");
  };

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={[Colors.peach, Colors.lavender, Colors.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBg}
      >
        <View style={styles.eyebrowContainer}>
          <Text style={styles.eyebrowText}>HARVEST TODAY</Text>
        </View>

        <Text style={styles.title}>
          Fresh ingredients,{"\n"}
          <Text style={styles.italicTitle}>premium quality</Text>.
        </Text>
      </LinearGradient>

      {/* Floating search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.inkSoft} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food ingredients..."
          placeholderTextColor={Colors.inkSoft}
          value={localText}
          onChangeText={handleChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {Boolean(localText) && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
    position: "relative",
    paddingBottom: 24,
  },
  heroBg: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 48,
    overflow: "hidden",
  },
  eyebrowContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  eyebrowText: {
    fontSize: 10,
    fontFamily: FontFamily.bold,
    letterSpacing: 1.2,
    color: Colors.mossDark,
  },
  title: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    lineHeight: 32,
    color: Colors.ink,
  },
  italicTitle: {
    fontFamily: FontFamily.italic,
    fontStyle: "italic",
    color: Colors.mossDark,
  },
  searchBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(200, 195, 215, 0.8)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.ink,
    padding: 0,
  },
});
