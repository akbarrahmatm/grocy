import { SearchIcon } from "@/components/icons";

interface HeroProps {
  query: string;
  onQueryChange: (v: string) => void;
}

export default function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <span className="hero-eyebrow">Harvest today</span>
      <h1>
        Fresh ingredients, <em>premium quality</em>.
      </h1>

      <div className="search-bar">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search for food ingredients..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search for food ingredients"
        />
      </div>
    </section>
  );
}
