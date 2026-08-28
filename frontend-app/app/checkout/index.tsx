import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { addressApi, orderApi, shippingApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Colors } from "@/constants/theme";
import type { Address, ShippingRate } from "@/types";

const rateKey = (r: ShippingRate) => `${r.code}::${r.service}`;
const SHOW_SHIPPING = true;

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, refreshCart } = useCart();
  const { push } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Midtrans Payment Modal
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const ratesSeq = useRef(0);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login" as any);
      return;
    }
    addressApi
      .list()
      .then((res) => {
        if (res.length === 0) {
          push("Please add a delivery address first", "error");
          router.replace("/address/new" as any);
          return;
        }
        setAddresses(res);
        const def = res.find((a) => a.is_default) ?? res[0];
        selectAddress(def.id);
      })
      .catch((err) => {
        push(
          err instanceof Error ? err.message : "Failed to load addresses",
          "error"
        );
      });
  }, [user]);

  const loadRates = (targetAddressId: number) => {
    if (items.length === 0) return;
    const seq = ++ratesSeq.current;
    setRatesLoading(true);
    shippingApi
      .rates(
        targetAddressId,
        items.map((it) => ({ product_id: it.product_id, qty: it.qty }))
      )
      .then((res) => {
        if (seq !== ratesSeq.current) return;
        setRates(res.data);
        if (res.data.length > 0) {
          setSelectedRate(rateKey(res.data[0]));
        }
      })
      .catch(() => {
        if (seq !== ratesSeq.current) return;
        setRates([]);
        setSelectedRate(null);
      })
      .finally(() => {
        if (seq === ratesSeq.current) setRatesLoading(false);
      });
  };

  const selectAddress = (id: number) => {
    setAddressId(id);
    setPickerOpen(false);
    if (!SHOW_SHIPPING) return;
    setRates([]);
    setSelectedRate(null);
    loadRates(id);
  };

  const selected = useMemo(
    () => rates.find((r) => rateKey(r) === selectedRate) ?? null,
    [rates, selectedRate]
  );

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product?.price ?? 0) * it.qty,
    0
  );
  const total = subtotal + (selected?.price ?? 0);

  const chosenAddress = addresses?.find((a) => a.id === addressId) ?? null;

  const handlePlaceOrder = async () => {
    if (!addressId || placing) return;
    setPlacing(true);
    try {
      const order = await orderApi.create({
        address_id: addressId,
        note: note.trim() || undefined,
        items: items.map((it) => ({
          product_id: it.product_id,
          qty: it.qty,
        })),
        ...(selected
          ? { courier: { code: selected.code, service: selected.service } }
          : {}),
      });

      await refreshCart();

      if (order.snap_redirect_url) {
        setCreatedOrderId(order.id);
        setPaymentUrl(order.snap_redirect_url);
      } else {
        router.replace(`/orders/${order.id}/complete` as any);
      }
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to place order",
        "error"
      );
      setPlacing(false);
    }
  };

  const handlePaymentClose = () => {
    const orderId = createdOrderId;
    setPaymentUrl(null);
    setCreatedOrderId(null);
    if (orderId) {
      router.replace(`/orders/${orderId}/complete` as any);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.mossDark}
              />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity onPress={() => setPickerOpen(true)}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          {chosenAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>{chosenAddress.label}</Text>
              <Text style={styles.addressName}>
                {chosenAddress.receiver_name} · {chosenAddress.phone}
              </Text>
              <Text style={styles.addressLine}>
                {[
                  chosenAddress.address,
                  chosenAddress.city,
                  chosenAddress.province,
                  chosenAddress.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="small" color={Colors.moss} />
          )}
        </View>

        {/* Shipping Rates */}
        {SHOW_SHIPPING && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="car-outline"
                size={18}
                color={Colors.mossDark}
              />
              <Text style={styles.sectionTitle}>Shipping Method</Text>
            </View>

            {ratesLoading ? (
              <View style={styles.ratesLoader}>
                <ActivityIndicator size="small" color={Colors.moss} />
                <Text style={styles.ratesLoaderText}>
                  Calculating courier rates…
                </Text>
              </View>
            ) : rates.length > 0 ? (
              <View style={styles.ratesList}>
                {rates.map((rate) => {
                  const key = rateKey(rate);
                  const isSelected = selectedRate === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.rateItem,
                        isSelected && styles.rateItemSelected,
                      ]}
                      onPress={() => setSelectedRate(key)}
                    >
                      <View style={styles.rateInfo}>
                        <Text style={styles.rateCompany}>
                          {rate.company} - {rate.service}
                        </Text>
                        <Text style={styles.rateEtd}>
                          {rate.description || `Est: ${rate.etd} days`}
                        </Text>
                      </View>
                      <Text style={styles.ratePrice}>
                        {formatCurrency(rate.price)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noRatesText}>
                Instant Delivery (Grocy Fresh Express)
              </Text>
            )}
          </View>
        )}

        {/* Order Items Preview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          {items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {it.product?.name} × {it.qty}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(
                  Number(it.product?.price ?? 0) * it.qty
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.sectionCard}>
          <Field
            label="Order Notes (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Leave at the front gate..."
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatCurrency(subtotal)}</Text>
          </View>
          {selected && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryVal}>
                {formatCurrency(selected.price)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <Button
          loading={placing}
          disabled={!addressId || items.length === 0}
          onPress={handlePlaceOrder}
          style={{ width: "100%" }}
        >
          Place Order • {formatCurrency(total)}
        </Button>
      </View>

      {/* Address Picker Modal */}
      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Address</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {addresses?.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.pickerItem,
                    a.id === addressId && styles.pickerItemSelected,
                  ]}
                  onPress={() => selectAddress(a.id)}
                >
                  <Text style={styles.pickerLabel}>{a.label}</Text>
                  <Text style={styles.pickerAddress}>
                    {a.receiver_name} - {a.address}, {a.city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              variant="ghost"
              onPress={() => {
                setPickerOpen(false);
                router.push("/address/new" as any);
              }}
              style={{ marginTop: 12 }}
            >
              + Add New Address
            </Button>
          </View>
        </View>
      </Modal>

      {/* Midtrans Snap WebView Modal */}
      <Modal
        visible={Boolean(paymentUrl)}
        animationType="slide"
        onRequestClose={handlePaymentClose}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View style={styles.webHeader}>
            <Text style={styles.webTitle}>Payment Confirmation</Text>
            <TouchableOpacity onPress={handlePaymentClose} style={styles.closeWebBtn}>
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
          </View>
          {paymentUrl && (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={(navState) => {
                // If redirect contains finish or complete
                if (navState.url.includes("finish") || navState.url.includes("complete") || navState.url.includes("status_code=200")) {
                  handlePaymentClose();
                }
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webLoader}>
                  <ActivityIndicator size="large" color={Colors.moss} />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.ink,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  sectionCard: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mossDark,
  },
  addressBox: {
    backgroundColor: Colors.grayLight,
    padding: 12,
    borderRadius: 12,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.ink,
  },
  addressName: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.ink,
    marginTop: 4,
    lineHeight: 16,
  },
  ratesLoader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  ratesLoaderText: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  ratesList: {
    marginTop: 6,
    gap: 8,
  },
  rateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  rateItemSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.emeraldLight,
  },
  rateInfo: {
    flex: 1,
  },
  rateCompany: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  rateEtd: {
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  ratePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.mossDark,
    marginLeft: 8,
  },
  noRatesText: {
    fontSize: 13,
    color: Colors.inkSoft,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  itemName: {
    fontSize: 13,
    color: Colors.ink,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  summaryCard: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.ink,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.mossDark,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.ink,
  },
  pickerItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 8,
  },
  pickerItemSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.emeraldLight,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
  },
  pickerAddress: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  webTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.ink,
  },
  closeWebBtn: {
    padding: 4,
  },
  webLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
