import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_600SemiBold_Italic,
} from "@expo-google-fonts/plus-jakarta-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FFFDF8" },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="auth/login"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="auth/register"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="checkout/index"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="orders/[id]"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="orders/[id]/complete"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="address/index"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="address/new"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="address/[id]"
                options={{ presentation: "card" }}
              />
              <Stack.Screen
                name="recipes/[id]"
                options={{ presentation: "card" }}
              />
            </Stack>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
