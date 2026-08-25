import { PlusIcon } from "@/components/icons";
import { resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  qty: number;
  onAdd: (id: number) => void;
  onChangeQty: (id: number, delta: number) => void;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("en-US")}`;

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
    <article className="card">
      <div className="card-media">
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} loading="lazy" />
        ) : (
          <div className="media-placeholder">{category.charAt(0)}</div>
        )}
        {outOfStock ? (
          <span className="out-of-stock">Out of stock</span>
        ) : qty === 0 ? (
          <button
            className="add-btn"
            onClick={() => onAdd(product.id)}
            aria-label={`Add ${product.name} to cart`}
          >
            <PlusIcon />
          </button>
        ) : (
          <div className="card-qty" aria-label={`${product.name} quantity`}>
            <button
              onClick={() => onChangeQty(product.id, -1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{qty}</span>
            <button
              onClick={() => onChangeQty(product.id, 1)}
              disabled={maxedOut}
              aria-label={maxedOut ? "Maximum stock reached" : "Increase quantity"}
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        <p className="card-category">{category}</p>
        <h3 className="card-title">{product.name}</h3>
        <div className="card-footer">
          <p className="card-price">
            {formatRp(Number(product.price))} <span>/ {unit}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
