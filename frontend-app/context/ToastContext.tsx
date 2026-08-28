import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import type { Toast } from "@/types";

interface ToastContextValue {
  push: (text: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({
  push: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const push = useCallback((text: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    const item: Toast = { id, text, variant };
    setToasts((prev) => [...prev, item]);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });
  }, [fadeAnim]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {toasts.length > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.container,
            { top: insets.top > 0 ? insets.top + 8 : 16 },
          ]}
        >
          {toasts.map((toast) => (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                toast.variant === "error" ? styles.errorToast : styles.successToast,
                { opacity: fadeAnim },
              ]}
            >
              <Text
                style={[
                  styles.toastText,
                  toast.variant === "error" ? styles.errorText : styles.successText,
                ]}
              >
                {toast.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginBottom: 8,
    maxWidth: "90%",
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successToast: {
    backgroundColor: Colors.mossDark,
  },
  errorToast: {
    backgroundColor: Colors.coral,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  successText: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FFFFFF",
  },
});
