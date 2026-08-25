interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <nav className="tabs" aria-label="Product categories">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`tab ${active === cat ? "active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}