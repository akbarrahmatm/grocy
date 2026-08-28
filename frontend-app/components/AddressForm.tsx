import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useToast } from "@/context/ToastContext";
import { addressApi } from "@/lib/api";
import { Colors, FontFamily } from "@/constants/theme";

interface AddressFormProps {
  id?: number;
}

export default function AddressForm({ id }: AddressFormProps) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = typeof id === "number";

  const [label, setLabel] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || typeof id !== "number") return;
    addressApi
      .list()
      .then((res) => {
        const found = res.find((a) => a.id === id);
        if (!found) {
          push("Address not found", "error");
          router.back();
          return;
        }
        setLabel(found.label);
        setReceiverName(found.receiver_name);
        setPhone(found.phone);
        setAddress(found.address);
        setCity(found.city);
        setProvince(found.province);
        setPostalCode(found.postal_code);
        setDestinationId(found.destination_id ?? null);
        setIsDefault(found.is_default);
      })
      .catch(() => {
        push("Failed to load address", "error");
        router.back();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isEdit]);

  const handleSave = async () => {
    if (
      !label.trim() ||
      !receiverName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      push("All fields are required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: label.trim(),
        receiver_name: receiverName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim(),
        destination_id: destinationId,
        is_default: isDefault,
      };

      if (isEdit && typeof id === "number") {
        await addressApi.update(id, payload);
        push("Address updated");
      } else {
        await addressApi.create(payload);
        push("Address added");
      }
      router.back();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save address",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.moss} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Field
        label="Address Label"
        value={label}
        onChangeText={setLabel}
        placeholder="Home, Office, …"
      />

      <Field
        label="Receiver Name"
        value={receiverName}
        onChangeText={setReceiverName}
        placeholder="Full name"
      />

      <Field
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        placeholder="08123456789"
        keyboardType="phone-pad"
      />

      <Field
        label="City"
        value={city}
        onChangeText={setCity}
        placeholder="City"
      />

      <Field
        label="Province"
        value={province}
        onChangeText={setProvince}
        placeholder="Province"
      />

      <Field
        label="Postal Code"
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="12345"
        keyboardType="numeric"
      />

      <Field
        label="Street Address / Building / Unit"
        value={address}
        onChangeText={setAddress}
        placeholder="Jl. Mawar No. 12, RT 01 / RW 02"
        multiline
        numberOfLines={3}
      />

      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.switchLabel}>Set as default address</Text>
          <Text style={styles.switchSub}>
            Use this address as primary for checkouts
          </Text>
        </View>
        <Switch
          value={isDefault}
          onValueChange={setIsDefault}
          trackColor={{ false: Colors.line, true: Colors.moss }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Button
        loading={saving}
        onPress={handleSave}
        style={{ marginTop: 20 }}
      >
        {isEdit ? "Update Address" : "Save Address"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.paper,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    marginTop: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
  },
  switchSub: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 2,
  },
});
