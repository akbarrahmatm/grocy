import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontFamily } from "@/constants/theme";
import { formatCurrency, resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  qty: number;
  onAdd: (id: number) => void;
  onChangeQty: (id: number, delta: number) => void;
}

export default function ProductCard({
  product,
  qty,
  onAdd,
  onChangeQty,
}: ProductCardProps) {
  const category = product.category?.name ?? "Lainnya";
  const unit = product.uom?.name ?? product.uom?.code ?? "pcs";
  const thumbnail = resolveImageUrl(product.thumbnail);
  const outOfStock = product.stock <= 0;
  const maxedOut = !outOfStock && qty >= product.stock;

  return (
    <View style={styles.card}>
      <View style={styles.mediaContainer}>
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="basket-outline" size={32} color={Colors.inkSoft} />
          </View>
        )}

        {outOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        ) : qty === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAdd(product.id)}
            activeOpacity={0.8}
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => onChangeQty(product.id, -1)}
            >
              <Ionicons name="remove" size={13} color={Colors.ink} />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{qty}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, maxedOut && styles.qtyBtnDisabled]}
              activeOpacity={0.7}
              disabled={maxedOut}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => onChangeQty(product.id, 1)}
            >
              <Ionicons
                name="add"
                size={13}
                color={maxedOut ? Colors.inkSoft : Colors.ink}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {formatCurrency(product.price)}
            <Text style={styles.unit}> / {unit}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 44) / 2;

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: Colors.paper,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  mediaContainer: {
    height: 125,
    width: "100%",
    backgroundColor: Colors.grayLight,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  mediaPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(43, 33, 64, 0.8)",
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: FontFamily.bold,
    textTransform: "uppercase",
  },
  addBtn: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.moss,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.mossDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  qtyContainer: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(236, 229, 245, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 3,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    minWidth: 16,
    textAlign: "center",
    paddingHorizontal: 3,
  },
  body: {
    padding: 10,
  },
  category: {
    fontSize: 11,
    color: Colors.inkSoft,
    fontFamily: FontFamily.medium,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
    minHeight: 34,
    lineHeight: 17,
  },
  footer: {
    marginTop: 6,
  },
  price: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
  unit: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
  },
});
