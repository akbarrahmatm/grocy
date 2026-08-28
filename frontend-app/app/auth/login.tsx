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

export default function LoginScreen() {
  const { push } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      push("Please enter both email and password", "error");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      push("Signed in successfully");
      router.replace("/(tabs)" as any);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Sign in failed",
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
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.form}>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="kamu@email.com"
                keyboardType="email-address"
              />

              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />

              <Button
                loading={loading}
                onPress={handleSubmit}
                style={{ marginTop: 10 }}
              >
                Sign In
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
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/register" as any)}
                >
                  <Text style={styles.switchAuthLink}>Register</Text>
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
