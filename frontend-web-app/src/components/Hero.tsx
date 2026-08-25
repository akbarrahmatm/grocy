import { SearchIcon } from "@/components/icons";

interface HeroProps {
  query: string;
  onQueryChange: (v: string) => void;
}

export default function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <span className="hero-eyebrow">Panen hari ini</span>
      <h1>
        Bahan segar, <em>kualitas premium</em>.
      </h1>

      <div className="search-bar">
        <SearchIcon />
        <input
          type="text"
          placeholder="Cari bahan makanan..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Cari bahan makanan"
        />
      </div>
    </section>
  );
}
