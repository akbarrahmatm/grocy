import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Colors, FontFamily } from "@/constants/theme";

export default function RegisterScreen() {
  const { push } = useToast();
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameValid = name.trim().length > 1;
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passValid = password.length >= 8;
  const matchValid = confirm.length > 0 && confirm === password;
  const canSubmit = nameValid && emailValid && passValid && matchValid;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) {
      if (!nameValid) push("Enter your full name", "error");
      else if (!emailValid) push("Enter a valid email address", "error");
      else if (!passValid) push("Password must be at least 8 characters", "error");
      else if (!matchValid) push("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      push("Welcome to Grocy! Account created.");
      router.replace("/(tabs)" as any);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.brand}>Grocy</Text>
            <Text style={styles.subtitle}>
              Create an account to save your addresses and orders.
            </Text>

            <View style={styles.form}>
              <Field
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                error={
                  touched && !nameValid ? "Enter your full name" : undefined
                }
              />

              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@email.com"
                keyboardType="email-address"
                error={
                  touched && !emailValid
                    ? "Enter a valid email address"
                    : undefined
                }
              />

              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                secureTextEntry
                error={
                  touched && !passValid
                    ? "Password must be at least 8 characters"
                    : undefined
                }
              />

              <Field
                label="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat your password"
                secureTextEntry
                error={
                  touched && !matchValid
                    ? "Passwords do not match"
                    : undefined
                }
              />

              <Button
                loading={loading}
                onPress={handleSubmit}
                style={{ marginTop: 10 }}
              >
                Create Account
              </Button>

              <Button
                variant="ghost"
                onPress={() => router.replace("/(tabs)" as any)}
                style={{ marginTop: 8 }}
              >
                Back to Explore
              </Button>

              <View style={styles.switchAuthWrap}>
                <Text style={styles.switchAuthText}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/login" as any)}
                >
                  <Text style={styles.switchAuthLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingVertical: 32,
  },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  brand: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 4,
    marginBottom: 20,
  },
  form: {},
  switchAuthWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  switchAuthText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
  },
  switchAuthLink: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
});
