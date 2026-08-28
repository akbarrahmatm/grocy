import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Colors, FontFamily } from "@/constants/theme";

interface FieldProps extends Omit<TextInputProps, "onChangeText" | "value"> {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
}

export default function Field({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  ...rest
}: FieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : styles.inputNormal]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.inkSoft}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        {...rest}
      />
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colors.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.ink,
  },
  inputNormal: {
    borderColor: Colors.line,
  },
  inputError: {
    borderColor: Colors.coral,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 12,
    fontFamily: FontFamily.medium,
    marginTop: 4,
  },
});
