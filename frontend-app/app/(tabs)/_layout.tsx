import React from "react";
import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/constants/theme";
import { useCart } from "@/context/CartContext";

export default function TabLayout() {
  const { count } = useCart();
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  const tabHeight = 62 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.mossDark,
        tabBarInactiveTintColor: Colors.inkSoft,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: Colors.paper,
          borderTopColor: Colors.line,
          borderTopWidth: 1,
          height: tabHeight,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          elevation: 8,
          shadowColor: Colors.shadowColor,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.label, { color }]}>Explore</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.label, { color }]}>Recipes</Text>
          ),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chef-hat" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.label, { color }]}>Cart</Text>
          ),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.coral,
            color: "#FFFFFF",
            fontFamily: FontFamily.bold,
            fontSize: 10,
            lineHeight: 13,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.label, { color }]}>Profile</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden auxiliary routes */}
      <Tabs.Screen
        name="orders"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
});
