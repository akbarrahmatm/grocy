import { CheckIcon, HeartIcon, PlusIcon } from "@/components/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: number) => void;
  isAdded: boolean;
  onAdd: (id: number) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Sayuran: "🥦",
  "Buah-buahan": "🍓",
  Daging: "🥩",
  Pokok: "🫒",
};

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

function categoryEmoji(category: string): string {
  const key = Object.keys(CATEGORY_EMOJI).find(
    (c) => category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(category.toLowerCase())
  );
  return key ? CATEGORY_EMOJI[key] : "🌿";
}

export default function ProductCard({
  product,
  isFav,
  onToggleFav,
  isAdded,
  onAdd,
}: ProductCardProps) {
  const category = product.category?.name ?? "Lainnya";
  const unit = product.uom?.name ?? product.uom?.code ?? "pcs";

  return (
    <article className="card">
      <div className="card-media">
        <div className="media-placeholder">{categoryEmoji(category)}</div>
        <span className="fresh-dot">segar</span>
        <button
          className={`fav-btn ${isFav ? "active" : ""}`}
          onClick={() => onToggleFav(product.id)}
          aria-label={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
        >
          <HeartIcon filled={isFav} />
        </button>
      </div>

      <div className="card-body">
        <p className="card-category">{category}</p>
        <h3 className="card-title">{product.name}</h3>
        <div className="card-footer">
          <p className="card-price">
            {formatRp(Number(product.price))} <span>/{unit}</span>
          </p>
          <button
            className={`add-btn ${isAdded ? "added" : ""}`}
            onClick={() => onAdd(product.id)}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            {isAdded ? <CheckIcon /> : <PlusIcon />}
          </button>
        </div>
      </div>
    </article>
  );
}