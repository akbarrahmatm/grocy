import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Colors, FontFamily } from "@/constants/theme";

interface ButtonProps {
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  variant = "primary",
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
  textStyle,
}: ButtonProps) {
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        variant === "primary" && styles.primaryBtn,
        isGhost && styles.ghostBtn,
        isDanger && styles.dangerBtn,
        (disabled || loading) && styles.disabledBtn,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isGhost ? Colors.ink : "#FFFFFF"}
        />
      ) : React.isValidElement(children) ? (
        children
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.primaryText,
            isGhost && styles.ghostText,
            isDanger && styles.dangerText,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.moss,
  },
  ghostBtn: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dangerBtn: {
    backgroundColor: Colors.red,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  ghostText: {
    color: Colors.ink,
  },
  dangerText: {
    color: "#FFFFFF",
  },
});
