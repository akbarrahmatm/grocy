import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors, FontFamily } from "@/constants/theme";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({
  categories,
  active,
  onSelect,
}: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => onSelect(cat)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  activeTab: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  tabText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colors.inkSoft,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
  },
});
